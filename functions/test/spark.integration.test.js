import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import * as sdk from 'firebase/firestore';
import { criarAgendaStore } from '../../src/agendaStore.js';

test('agenda Spark: clientes reais sujeitos às regras, sem Cloud Functions', { skip: !process.env.FIRESTORE_EMULATOR_HOST }, async t => {
  const projectId = process.env.GCLOUD_PROJECT || 'demo-saasbarber';
  const env = await initializeTestEnvironment({ projectId, firestore: { rules: await readFile(new URL('../../firestore.rules', import.meta.url), 'utf8') } });
  const admin = getFirestore(initializeApp({ projectId }, 'teste-spark'));
  const clientes = new Map();
  const banco = uid => {
    if (!clientes.has(uid)) clientes.set(uid, uid ? env.authenticatedContext(uid).firestore() : env.unauthenticatedContext().firestore());
    return clientes.get(uid);
  };
  const store = uid => criarAgendaStore(banco(uid), uid, sdk);
  const criar = (id, data = '2030-01-07', horarioInicio = '09:00') => ({ acao: 'criar', id, barbeiroId: 'barbeiro', servicoId: 'corte', data, horarioInicio });
  const chamar = (uid,p) => store(uid).alterarAgendamento(p);
  const agir = async (uid,id,acao,extra = {}) => {
    try { return await chamar(uid,{ id, acao, ...extra }); }
    catch (e) { e.message = `${acao} de ${id}: ${e.message}`; throw e; }
  };
  const dados = async id => (await admin.doc(`agendamentos/${id}`).get()).data();
  const bits = async data => (await admin.doc(`reservasHorario/barbeiro_${data}`).get()).data()?.ocupacao || '0'.repeat(1440);
  const legado = { clienteId: 'cliente', clienteNome: 'Cliente', barbeiroId: 'barbeiro', barbeiroNome: 'Barbeiro', barbeariaId: 'loja', servicoId: 'corte', servicoNome: 'Corte', preco: 50, duracaoMinutos: 60, horarioInicio: '09:00', horarioFim: '10:00', status: 'confirmado', reagendamento: null };
  const ontem = new Date(Date.now() - 86400000).toISOString().slice(0,10);
  try {
    await env.clearFirestore();
    await Promise.all([
      admin.doc('barbearias/loja').set({ donoId: 'dono', nomeBarbearia: 'Teste' }),
      admin.doc('barbeiros/aleatorio').set({ usuarioId: 'barbeiro', barbeariaId: 'loja', donoId: 'dono', nome: 'Barbeiro', tipoUsuario: 'barbeiro' }),
      admin.doc('barbearias/loja/servicos/corte').set({ nome: 'Corte', preco: 50, duracao: 60, ativo: true }),
      admin.doc('clientes/cliente').set({ nome: 'Cliente', usuarioId: 'cliente', tipoUsuario: 'cliente' }),
      admin.doc('clientes/outro').set({ nome: 'Outro', usuarioId: 'outro', tipoUsuario: 'cliente' }),
      admin.doc('disponibilidades/barbeiro').set({ barbeiroId: 'barbeiro', semanal: ['domingo','segunda','terca','quarta','quinta','sexta','sabado'].map(dia => ({ dia, ativo: true, inicio: '09:00', fim: '18:00' })) }),
      admin.doc('agendamentos/legado').set({ ...legado, data: '2030-01-12' }),
      admin.doc('agendamentos/passado').set({ ...legado, data: ontem }),
    ]);
    await t.test('sincronização preserva legados e não pode ser feita por um cliente', async () => {
      await assert.rejects(chamar('cliente', criar('antes-inicializacao')));
      await assertFails(sdk.setDoc(sdk.doc(banco('cliente'),'disponibilidades/barbeiro'), { barbeiroId: 'barbeiro', agendaPreparada: true, barbeiroDocumentoId: 'aleatorio', semanal: [] }));
      await store('barbeiro').prepararAgenda();
      assert.equal((await admin.doc('disponibilidades/barbeiro').get()).data().agendaPreparada,true);
      await assert.rejects(chamar('outro', criar('sobre-legado','2030-01-12','09:30')));
      assert.equal((await bits('2030-01-12')).slice(540,600),'1'.repeat(60));
    });
    await t.test('duas reservas simultâneas idênticas ou sobrepostas: somente uma vence', async () => {
      for (const h of ['09:00','09:30']) {
        const a = `a-${h.replace(':','')}`, b = `b-${h.replace(':','')}`;
        const resultado = await Promise.allSettled([chamar('cliente',criar(a)),chamar('outro',criar(b,'2030-01-07',h))]);
        assert.equal(resultado.filter(r => r.status === 'fulfilled').length,1);
        const venceuA = resultado[0].status === 'fulfilled';
        assert.equal(await dados(venceuA ? b : a),undefined);
        await agir(venceuA ? 'cliente' : 'outro',venceuA ? a : b,'cancelar');
        assert.equal(await bits('2030-01-07'),'0'.repeat(1440));
      }
    });
    await t.test('criação, aceite, recusa, reagendamento aprovado e rejeitado preservam reservas', async () => {
      await chamar('cliente',criar('fluxo'));
      assert.equal((await dados('fluxo')).status,'pendente');
      assert.equal((await dados('fluxo')).preco,50);
      await agir('barbeiro','fluxo','confirmar');
      const novo = { data: '2030-01-08', horarioInicio: '10:00' };
      await agir('cliente','fluxo','reagendar',novo);
      await assert.rejects(chamar('outro',criar('original-ocupado')));
      await assert.rejects(chamar('outro',criar('pedido-ocupado',novo.data,novo.horarioInicio)));
      await agir('barbeiro','fluxo','recusarReagendamento');
      assert.equal((await dados('fluxo')).status,'confirmado');
      assert.equal((await dados('fluxo')).data,'2030-01-07');
      await chamar('outro',criar('recusado',novo.data,novo.horarioInicio));
      await agir('barbeiro','recusado','recusar');
      assert.ok((await dados('recusado')).recusadoEm);
      await agir('cliente','fluxo','reagendar',novo);
      await agir('barbeiro','fluxo','aceitarReagendamento');
      assert.equal((await dados('fluxo')).data,novo.data);
      assert.equal((await dados('fluxo')).status,'confirmado');
      await chamar('outro',criar('original-livre'));
      await agir('cliente','fluxo','cancelar');
      assert.equal(await bits(novo.data),'0'.repeat(1440));
    });
    await t.test('pedidos no mesmo dia preservam os dois intervalos e cancelamento libera ambos', async () => {
      await chamar('cliente',criar('mesmo-dia','2030-01-09'));
      await agir('cliente','mesmo-dia','reagendar',{ data: '2030-01-09', horarioInicio: '11:00' });
      let ocupacao = await bits('2030-01-09');
      assert.equal(ocupacao.slice(540,600),'1'.repeat(60));
      assert.equal(ocupacao.slice(660,720),'1'.repeat(60));
      await agir('cliente','mesmo-dia','cancelar');
      assert.equal(await bits('2030-01-09'),'0'.repeat(1440));
    });
    await t.test('finalização respeita o horário final, registra timestamp e é visível ao cliente', async () => {
      await assert.rejects(agir('barbeiro','original-livre','concluir'));
      await assert.rejects(agir('cliente','passado','concluir'));
      await agir('barbeiro','passado','concluir');
      const a = await sdk.getDoc(sdk.doc(banco('cliente'),'agendamentos/passado'));
      assert.equal(a.data().status,'concluido'); assert.ok(a.data().concluidoEm.toMillis() > 0);
      await assert.rejects(agir('cliente','passado','cancelar'));
      await assert.rejects(agir('cliente','passado','reagendar',{ data: '2030-01-10', horarioInicio: '11:00' }));
    });
    await t.test('autorização e atomicidade são validadas nas regras, não só no React', async () => {
      await assert.rejects(chamar(null,criar('anonimo')));
      await assertFails(sdk.getDoc(sdk.doc(banco('invasor'),'agendamentos/original-livre')));
      await assert.rejects(agir('outro-barbeiro','original-livre','confirmar'));
      await assertFails(sdk.updateDoc(sdk.doc(banco('outro'),'agendamentos/original-livre'),{ status: 'confirmado', ultimaAcao: 'confirmar', atualizadoEm: sdk.serverTimestamp(), confirmadoEm: sdk.serverTimestamp() }));
      // Mesmo o profissional não pode pular a atualização atômica do calendário.
      await assertFails(sdk.updateDoc(sdk.doc(banco('barbeiro'),'agendamentos/original-livre'),{ status: 'confirmado', ultimaAcao: 'confirmar', atualizadoEm: sdk.serverTimestamp(), confirmadoEm: sdk.serverTimestamp() }));
      await assertFails(sdk.updateDoc(sdk.doc(banco('outro'),'agendamentos/original-livre'),{ preco: 1 }));
      await assertFails(sdk.setDoc(sdk.doc(banco('cliente'),'reservasHorario/barbeiro_2030-01-07'),{ barbeiroId: 'barbeiro', data: '2030-01-07', ocupacao: '0'.repeat(1440), agendamentoId: 'original-livre', atualizadoEm: sdk.serverTimestamp() }));
      await agir('dono','original-livre','confirmar');
    });
    await t.test('regras rejeitam falsificação de duração/preço e conflitos mesmo com escrita manual', async () => {
      await assert.rejects(chamar('cliente',{ ...criar('preco-antigo','2030-01-16'), precoEsperado: 1 }));
      await assert.rejects(chamar('cliente',{ ...criar('duracao-antiga','2030-01-16'), duracaoEsperada: 25 }));
      await assert.rejects(chamar('cliente',criar('fim','2030-01-16','17:30')));
      await chamar('cliente',{ ...criar('integridade','2030-01-16'), preco: 1, clienteId: 'invasor', status: 'concluido' });
      const a = (await sdk.getDoc(sdk.doc(banco('cliente'),'agendamentos/integridade'))).data();
      assert.equal(a.preco,50); assert.equal(a.status,'pendente'); assert.equal(a.clienteId,'cliente');
      // Alterar a cópia e um calendário válido ainda precisa passar pela regra de criação.
      const batch = sdk.writeBatch(banco('outro'));
      batch.set(sdk.doc(banco('outro'),'agendamentos/forjado'),{ ...a, clienteId: 'outro', clienteDocumentoId: 'outro', clienteNome: 'Outro', preco: 1,
        horarioInicio: '11:00', horarioFim: '12:00', inicioEm: sdk.Timestamp.fromDate(new Date('2030-01-16T11:00:00-03:00')), fimEm: sdk.Timestamp.fromDate(new Date('2030-01-16T12:00:00-03:00')),
        criadoEm: sdk.serverTimestamp(), atualizadoEm: sdk.serverTimestamp() });
      const ocupacao = await bits('2030-01-16');
      batch.set(sdk.doc(banco('outro'),'reservasHorario/barbeiro_2030-01-16'),{ barbeiroId: 'barbeiro', data: '2030-01-16', ocupacao: ocupacao.slice(0,660) + '1'.repeat(60) + ocupacao.slice(720), agendamentoId: 'forjado', atualizadoEm: sdk.serverTimestamp() });
      await assertFails(batch.commit());
    });
    await t.test('liberação por data abre semana inativa e bloqueio impede o aceite tardio', async () => {
      await chamar('cliente',criar('a-revalidar','2030-01-17'));
      await agir('cliente','a-revalidar','reagendar',{ data: '2030-01-18', horarioInicio: '10:00' });
      await sdk.setDoc(sdk.doc(banco('barbeiro'),'excecoesDisponibilidade/barbeiro_2030-01-18'),{ barbeiroId: 'barbeiro', data: '2030-01-18', bloqueada: true });
      await assert.rejects(agir('barbeiro','a-revalidar','aceitarReagendamento'));
      await agir('barbeiro','a-revalidar','recusarReagendamento');
      assert.equal((await dados('a-revalidar')).status,'pendente');
      await sdk.updateDoc(sdk.doc(banco('barbeiro'),'disponibilidades/barbeiro'),{ semanal: [] });
      await sdk.setDoc(sdk.doc(banco('barbeiro'),'excecoesDisponibilidade/barbeiro_2030-01-19'),{ barbeiroId: 'barbeiro', data: '2030-01-19', bloqueada: false, inicio: '10:00', fim: '16:00', intervaloInicio: '12:00', intervaloFim: '13:00' });
      await chamar('cliente',criar('data-liberada','2030-01-19','10:00'));
      await assert.rejects(chamar('cliente',criar('intervalo','2030-01-19','11:30')));
      await assertFails(sdk.updateDoc(sdk.doc(banco('barbeiro'),'disponibilidades/barbeiro'),{ agendaPreparada: false }));
    });
    await t.test('calendário não revela clientes e diretórios continuam acessíveis', async () => {
      const c = banco('cliente');
      await assertSucceeds(sdk.getDocs(sdk.collection(c,'barbearias')));
      await assertSucceeds(sdk.getDocs(sdk.query(sdk.collection(c,'barbeiros'),sdk.where('barbeariaId','==','loja'))));
      await assertSucceeds(sdk.getDocs(sdk.collection(c,'barbearias/loja/servicos')));
      const diaria = await sdk.getDoc(sdk.doc(c,'reservasHorario/barbeiro_2030-01-12'));
      assert.equal(diaria.data().clienteNome,undefined);
      assert.equal(diaria.data().clienteId,undefined);
      await assertFails(sdk.getDoc(sdk.doc(banco(null),'reservasHorario/barbeiro_2030-01-12')));
      await assertFails(sdk.setDoc(sdk.doc(c,'adminsSaas/cliente'),{ usuarioId: 'cliente', ativo: true }));
      await assertFails(sdk.updateDoc(sdk.doc(c,'barbeiros/aleatorio'),{ usuarioId: 'cliente' }));
    });
    await t.test('uma transição legítima não permite apagar reservas de outro atendimento', async () => {
      await sdk.setDoc(sdk.doc(banco('barbeiro'),'excecoesDisponibilidade/barbeiro_2030-01-20'),{ barbeiroId: 'barbeiro', data: '2030-01-20', bloqueada: false, inicio: '09:00', fim: '18:00', intervaloInicio: '', intervaloFim: '' });
      await chamar('cliente',criar('proteger-a','2030-01-20'));
      await chamar('outro',criar('proteger-b','2030-01-20','11:00'));
      const batch = sdk.writeBatch(banco('barbeiro'));
      batch.update(sdk.doc(banco('barbeiro'),'agendamentos/proteger-a'),{ status: 'confirmado', ultimaAcao: 'confirmar', confirmadoEm: sdk.serverTimestamp(), atualizadoEm: sdk.serverTimestamp() });
      const ocupacao = await bits('2030-01-20');
      batch.set(sdk.doc(banco('barbeiro'),'reservasHorario/barbeiro_2030-01-20'),{ barbeiroId: 'barbeiro', data: '2030-01-20', ocupacao: ocupacao.slice(0,660) + '0'.repeat(60) + ocupacao.slice(720), agendamentoId: 'proteger-a', atualizadoEm: sdk.serverTimestamp() });
      await assertFails(batch.commit());
      assert.equal((await bits('2030-01-20')).slice(660,720),'1'.repeat(60));
      await agir('barbeiro','proteger-a','confirmar');
      await agir('cliente','proteger-a','reagendar',{ data: '2030-01-20', horarioInicio: '14:00' });
      await agir('barbeiro','proteger-a','aceitarReagendamento');
      assert.equal((await bits('2030-01-20')).slice(540,600),'0'.repeat(60));
      assert.equal((await bits('2030-01-20')).slice(840,900),'1'.repeat(60));
    });
    await t.test('serviço de 25 minutos reserva exatamente sua duração', async () => {
      await sdk.setDoc(sdk.doc(banco('dono'),'barbearias/loja/servicos/curto'),{ nome: 'Curto', preco: 20, duracao: 25, ativo: true });
      await sdk.setDoc(sdk.doc(banco('barbeiro'),'excecoesDisponibilidade/barbeiro_2030-01-21'),{ barbeiroId: 'barbeiro', data: '2030-01-21', bloqueada: false, inicio: '09:00', fim: '18:00', intervaloInicio: '', intervaloFim: '' });
      await chamar('cliente',{ ...criar('curto','2030-01-21'), servicoId: 'curto' });
      assert.equal((await dados('curto')).horarioFim,'09:25');
      assert.equal((await bits('2030-01-21')).slice(540,570),'1'.repeat(25) + '0'.repeat(5));
      await chamar('outro',{ ...criar('curto-adjacente','2030-01-21','09:30'), servicoId: 'curto' });
    });
    await t.test('login, cadastro, serviços, vitrine e administrador SaaS são preservados', async () => {
      for (const uid of ['cliente','barbeiro','dono']) {
        await assertSucceeds(sdk.getDocs(sdk.query(sdk.collection(banco(uid),'adminsSaas'),sdk.where('usuarioId','==',uid))));
        await assertSucceeds(sdk.getDoc(sdk.doc(banco(uid),`clientes/${uid}`)));
      }
      await sdk.setDoc(sdk.doc(banco('novo'),'clientes/novo'),{ nome: 'Novo', usuarioId: 'novo', tipoUsuario: 'cliente', email: 'novo@example.com', telefone: '123' });
      await sdk.setDoc(sdk.doc(banco('novo-dono'),'barbearias/nova'),{ donoId: 'novo-dono', nomeCompleto: 'Dono', nomeBarbearia: 'Nova', email: 'dono@example.com', telefone: '123' });
      await sdk.updateDoc(sdk.doc(banco('novo-dono'),'barbearias/nova'),{ telefone: '456' });
      await assertFails(sdk.updateDoc(sdk.doc(banco('dono'),'barbearias/loja'),{ donoId: 'cliente' }));
      await admin.doc('adminsSaas/saas').set({ usuarioId: 'saas', ativo: true });
      await sdk.updateDoc(sdk.doc(banco('saas'),'barbearias/nova'),{ nomeBarbearia: 'Editada' });
      await sdk.deleteDoc(sdk.doc(banco('saas'),'barbearias/nova'));
      await sdk.setDoc(sdk.doc(banco('dono'),'barbeiros/novo'),{ usuarioId: 'novo-barbeiro', tipoUsuario: 'barbeiro', donoId: 'dono', barbeariaId: 'loja', nome: 'Novo' });
      await sdk.updateDoc(sdk.doc(banco('dono'),'barbeiros/novo'),{ nome: 'Editado' });
      await sdk.deleteDoc(sdk.doc(banco('dono'),'barbeiros/novo'));
      await sdk.setDoc(sdk.doc(banco('dono'),'barbeariasPublicas/loja'),{ nomeBarbearia: 'Teste', publicada: true, servicos: [] });
      await assertSucceeds(sdk.getDocs(sdk.collection(banco(null),'barbeariasPublicas')));
      await assertFails(sdk.updateDoc(sdk.doc(banco('cliente'),'barbeariasPublicas/loja'),{ nomeBarbearia: 'Forjada' }));
    });
  } finally { await env.cleanup(); }
});
