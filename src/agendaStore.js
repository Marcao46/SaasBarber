import { ativos, intervalo, minutos, hora, transicao } from './agendaCore.js';
const VAZIO = '0'.repeat(1440);
const faixasDe = a => a && ativos.has(a.status) ? [a, a.reagendamento].filter(Boolean) : [];
const idValido = id => typeof id === 'string' && id.length > 0 && !id.includes('/');
export function aplicarReserva(bits, faixa, reservar) {
  const inicio = minutos(faixa.horarioInicio), fim = minutos(faixa.horarioFim);
  if (bits.length !== 1440 || fim <= inicio || !/^[01]+$/.test(bits)) throw new Error('Reserva diária inválida.');
  if (bits.slice(inicio, fim) !== (reservar ? '0' : '1').repeat(fim - inicio)) throw new Error(reservar ? 'Este horário já está reservado. Escolha outro.' : 'A agenda precisa ser sincronizada pelo profissional.');
  return bits.slice(0, inicio) + (reservar ? '1' : '0').repeat(fim - inicio) + bits.slice(fim);
}

// SDK injetado para que os mesmos fluxos sejam testados com clientes reais das regras.
export function criarAgendaStore(db, uid, sdk) {
  const { collection, doc, getDoc, getDocs, query, where, runTransaction, serverTimestamp, Timestamp } = sdk;
  const ref = (...partes) => doc(db, ...partes);
  const carimbo = faixa => ({ ...faixa, inicioEm: Timestamp.fromDate(new Date(`${faixa.data}T${faixa.horarioInicio}:00-03:00`)), fimEm: Timestamp.fromDate(new Date(`${faixa.data}T${faixa.horarioFim}:00-03:00`)) });
  function autenticar() { if (!uid) throw new Error('Entre na sua conta para continuar.'); }
  async function profissional(id) {
    const lista = await getDocs(query(collection(db, 'barbeiros'), where('usuarioId', '==', id)));
    const b = lista.docs[0] || await getDoc(ref('barbeiros', id));
    if (!b.exists()) throw new Error('Barbeiro não encontrado.');
    return b;
  }
  async function prepararAgenda() {
    autenticar();
    const b = await profissional(uid);
    const dr = ref('disponibilidades', uid);
    if ((await getDoc(dr)).data()?.agendaPreparada === true) return;
    const encontrados = await getDocs(query(collection(db, 'agendamentos'), where('barbeiroId', '==', uid)));
    if (encontrados.size > 400) throw new Error('A sincronização requer uma importação administrativa em lotes.');
    await runTransaction(db, async tx => {
      const disp = await tx.get(dr);
      if (disp.data()?.agendaPreparada === true) return;
      const atuais = [];
      for (const a of encontrados.docs) atuais.push(await tx.get(a.ref));
      const calendarios = new Map();
      for (const snap of atuais) {
        if (!snap.exists()) continue;
        for (const faixa of faixasDe(snap.data())) {
          const bits = calendarios.get(faixa.data) || VAZIO;
          const inicio = minutos(faixa.horarioInicio), fim = minutos(faixa.horarioFim);
          if (fim <= inicio) throw new Error('Há um agendamento antigo com horário inválido. Revise-o antes de sincronizar.');
          if (bits.slice(inicio, fim).includes('1')) throw new Error('Existem agendamentos antigos sobrepostos. Revise esses horários antes de liberar novas reservas.');
          calendarios.set(faixa.data, bits.slice(0, inicio) + '1'.repeat(fim - inicio) + bits.slice(fim));
        }
      }
      if (calendarios.size > 400) throw new Error('Há muitas datas para sincronizar de uma vez.');
      for (const [data, ocupacao] of calendarios) tx.set(ref('reservasHorario', `${uid}_${data}`), { barbeiroId: uid, data, ocupacao, agendamentoId: 'inicializacao', atualizadoEm: serverTimestamp() });
      const semana = disp.data()?.semanal || [];
      const ordenada = ['domingo','segunda','terca','quarta','quinta','sexta','sabado'].map(dia => semana.find(d => d.dia === dia) || { dia, ativo: false, inicio: '09:00', fim: '18:00', intervaloInicio: '', intervaloFim: '' });
      tx.set(dr, { barbeiroId: uid, semanal: ordenada, barbeiroDocumentoId: b.id, agendaPreparada: true, atualizadoEm: serverTimestamp() }, { merge: true });
    });
  }
  async function consultarOcupacao(barbeiroId, data) {
    autenticar();
    if ((await getDoc(ref('disponibilidades', barbeiroId))).data()?.agendaPreparada !== true) throw new Error('O profissional precisa abrir seu painel uma vez para sincronizar a agenda existente.');
    const bits = (await getDoc(ref('reservasHorario', `${barbeiroId}_${data}`))).data()?.ocupacao || VAZIO;
    if (bits.length !== 1440 || !/^[01]+$/.test(bits)) throw new Error('A ocupação desta data precisa ser revisada pelo profissional.');
    const intervalos = [];
    for (let i = 0; i < 1440; i++) {
      if (bits[i] !== '1') continue;
      const inicio = i;
      while (i < 1440 && bits[i] === '1') i++;
      intervalos.push({ data, horarioInicio: hora(inicio), horarioFim: hora(i) });
    }
    return intervalos;
  }
  async function alterarAgendamento(p) {
    autenticar();
    if (!idValido(p.id)) throw new Error('Identificador do agendamento inválido.');
    const criando = p.acao === 'criar', ar = ref('agendamentos', p.id);
    const anterior = criando ? null : await getDoc(ar);
    if (!criando && !anterior.exists()) throw new Error('Agendamento não encontrado.');
    const barbeiroId = criando ? p.barbeiroId : anterior.data().barbeiroId;
    if (!idValido(barbeiroId)) throw new Error('Selecione um barbeiro válido.');
    const bs = await profissional(barbeiroId);
    let cr;
    if (criando) {
      const perfil = await getDoc(ref('clientes', uid));
      const legado = perfil.exists() ? null : await getDocs(query(collection(db, 'clientes'), where('usuarioId', '==', uid)));
      cr = perfil.exists() ? perfil.ref : legado.docs[0]?.ref;
      if (!cr) throw new Error('Cadastre seu perfil de cliente.');
    }
    return runTransaction(db, async tx => {
      const snap = await tx.get(ar);
      if (criando && snap.exists()) {
        if (snap.data().clienteId !== uid) throw new Error('Identificador já utilizado.');
        return { id: p.id };
      }
      if (!criando && !snap.exists()) throw new Error('Agendamento não encontrado.');
      const b = (await tx.get(bs.ref)).data();
      if (!b) throw new Error('Barbeiro não encontrado.');
      const disp = await tx.get(ref('disponibilidades', barbeiroId));
      if (disp.data()?.agendaPreparada !== true) throw new Error('O profissional precisa abrir seu painel uma vez para sincronizar a agenda existente.');
      let atual = snap.data();
      const loja = await tx.get(ref('barbearias', b.barbeariaId));
      const dono = !criando && loja.data()?.donoId === uid;
      if (!criando && uid !== atual.clienteId && uid !== atual.barbeiroId && !dono) throw new Error('Você não pode alterar este agendamento.');
      if (dono && uid !== atual.clienteId && p.acao === 'reagendar') throw new Error('Somente o cliente pode solicitar reagendamento.');
      let novaFaixa;
      if (criando || p.acao === 'reagendar' || p.acao === 'aceitarReagendamento') {
        if (b.ativo === false) throw new Error('Profissional indisponível.');
        if (!criando && atual.barbeariaId !== b.barbeariaId) throw new Error('O vínculo do profissional mudou. Consulte a barbearia.');
        const destino = p.acao === 'aceitarReagendamento' ? atual.reagendamento : p;
        if (!destino || !/^\d{4}-\d{2}-\d{2}$/.test(destino.data)) throw new Error('Selecione uma data válida.');
        const exc = await tx.get(ref('excecoesDisponibilidade', `${barbeiroId}_${destino.data}`));
        const servicoId = criando ? p.servicoId : atual.servicoId;
        if (!idValido(servicoId)) throw new Error('Selecione um serviço.');
        const s = (await tx.get(ref('barbearias', b.barbeariaId, 'servicos', servicoId))).data();
        if (!s || s.ativo === false) throw new Error('Serviço indisponível.');
        const duracao = criando ? Number(s.duracaoMinutos ?? s.duracao ?? 30) : atual.duracaoMinutos || minutos(atual.horarioFim) - minutos(atual.horarioInicio);
        novaFaixa = carimbo(intervalo(destino.data, destino.horarioInicio, duracao, disp.data()?.semanal, exc.data()));
        if (criando) {
          const cliente = (await tx.get(cr)).data(), preco = Number(s.preco);
          if (!Number.isFinite(preco) || preco < 0) throw new Error('Preço do serviço inválido.');
          if (p.precoEsperado !== undefined && p.precoEsperado !== preco) throw new Error('O preço mudou. Revise o serviço e confirme novamente.');
          if (p.duracaoEsperada !== undefined && p.duracaoEsperada !== duracao) throw new Error('A duração mudou. Selecione novamente o horário.');
          atual = { ...novaFaixa, clienteId: uid, clienteDocumentoId: cr.id, clienteNome: cliente.nome || 'Cliente', barbeiroId, barbeiroDocumentoId: bs.id, barbeiroNome: b.nome || 'Barbeiro', barbeariaId: b.barbeariaId,
            servicoId, servicoNome: s.nome || 'Serviço', preco, duracaoMinutos: duracao, status: 'pendente', reagendamento: null, resultadoReagendamento: null, criadoEm: serverTimestamp() };
        }
      }
      const proximo = criando ? atual : carimbo(transicao(atual, p.acao, dono && uid !== atual.clienteId ? atual.barbeiroId : uid, novaFaixa));
      const registros = { confirmar: 'confirmadoEm', recusar: 'recusadoEm', cancelar: 'canceladoEm', concluir: 'concluidoEm', reagendar: 'reagendamentoSolicitadoEm', aceitarReagendamento: 'reagendamentoDecididoEm', recusarReagendamento: 'reagendamentoDecididoEm' };
      if (registros[p.acao]) proximo[registros[p.acao]] = serverTimestamp();
      if (p.acao === 'cancelar') proximo.canceladoPor = uid;
      if (p.acao === 'recusar') proximo.recusadoPor = uid;
      Object.assign(proximo, { agendaVersao: 2, ultimaAcao: p.acao, atualizadoEm: serverTimestamp() });
      const antes = criando ? [] : faixasDe(snap.data()), depois = faixasDe(proximo);
      const datas = [...new Set([...antes, ...depois].map(a => a.data))], calendarios = [];
      for (const data of datas) {
        const rr = ref('reservasHorario', `${barbeiroId}_${data}`), calendario = await tx.get(rr);
        let bits = calendario.data()?.ocupacao || VAZIO;
        for (const faixa of antes.filter(f => f.data === data)) bits = aplicarReserva(bits, faixa, false);
        for (const faixa of depois.filter(f => f.data === data)) bits = aplicarReserva(bits, faixa, true);
        calendarios.push({ rr, data, bits });
      }
      for (const { rr, data, bits } of calendarios) tx.set(rr, { barbeiroId, data, ocupacao: bits, agendamentoId: p.id, atualizadoEm: serverTimestamp() });
      tx.set(ar, proximo);
      return { id: p.id };
    });
  }
  return { prepararAgenda, consultarOcupacao, alterarAgendamento };
}
