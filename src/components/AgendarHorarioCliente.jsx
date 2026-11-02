import { useEffect, useRef, useState } from "react";
import { collection, doc, getDoc, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../fireBaseConfig";
import { alterarAgendamento, consultarOcupacao } from "../agendaApi";
import { horariosDisponiveis, hora, minutos } from '../agendaCore.js';
import DatasConfiguradas from './DatasConfiguradas';
import ConfirmarAgendamento from './ConfirmarAgendamento';
import "./Agendamento.css";

const hoje = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });

export default function AgendarHorarioCliente({ voltar, agendamento, aoSalvar }) {
  const [lojas, setLojas] = useState([]);
  const [carregandoLojas, setCarregandoLojas] = useState(true);
  const [carregandoOpcoes, setCarregandoOpcoes] = useState(false);
  const [erroOpcoes, setErroOpcoes] = useState('');
  const [erroCatalogo, setErroCatalogo] = useState('');
  const [barbeiros, setBarbeiros] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [carregandoServicos, setCarregandoServicos] = useState(false);
  const [erroServicos, setErroServicos] = useState('');
  const campoServico = useRef(null);
  const gradeHorarios = useRef(null);
  const [loja, setLoja] = useState(agendamento?.barbeariaId || '');
  const [barbeiro, setBarbeiro] = useState(agendamento?.barbeiroId || '');
  const [servico, setServico] = useState(agendamento?.servicoId || '');
  const [data, setData] = useState(hoje);
  const [horario, setHorario] = useState('');
  const [opcoes, setOpcoes] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erroHorarios, setErroHorarios] = useState('');
  const [tentativa, setTentativa] = useState(0);
  const [resumo, setResumo] = useState(null);
  const [erroSalvar, setErroSalvar] = useState('');
  const id = useRef(doc(collection(db, 'agendamentos')).id);
  const duracao = agendamento?.duracaoMinutos || Number(servicos.find(s => s.id === servico)?.duracaoMinutos ?? servicos.find(s => s.id === servico)?.duracao ?? 30);

  useEffect(() => {
    // O diretório inclui cadastros sem uma vitrine publicada na Home.
    const parar = onSnapshot(collection(db, 'barbearias'), snap => {
      setLojas(snap.docs.map(d => ({ id: d.id, nomeBarbearia: d.data().nomeBarbearia || d.data().nome || 'Barbearia' }))
        .sort((a, b) => a.nomeBarbearia.localeCompare(b.nomeBarbearia, 'pt-BR')));
      setErroCatalogo('');
      setCarregandoLojas(false);
    }, erro => {
      console.error('Erro ao carregar as barbearias cadastradas:', erro);
      setErroCatalogo('Não foi possível ler os cadastros. Confira a conexão e a permissão de leitura autenticada de barbearias em firestore.rules.');
      setCarregandoLojas(false);
    });
    return parar;
  }, []);

  useEffect(() => {
    setBarbeiros([]);
    setErroOpcoes('');
    setCarregandoOpcoes(Boolean(loja));
    if (!loja) return;
    return onSnapshot(query(collection(db, 'barbeiros'), where('barbeariaId', '==', loja)), snap => {
      setBarbeiros(snap.docs.map(d => ({ ...d.data(), id: d.data().usuarioId || d.id }))
        .filter(b => b.ativo !== false)
        .sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt-BR')));
      setCarregandoOpcoes(false);
    }, erro => {
      console.error('Erro ao consultar os barbeiros da barbearia:', erro);
      setErroOpcoes('Não foi possível carregar os barbeiros. Verifique a conexão e a permissão de leitura autenticada de barbeiros em firestore.rules.');
      setCarregandoOpcoes(false);
    });
  }, [loja]);

  useEffect(() => {
    setServicos([]);
    setErroServicos('');
    setCarregandoServicos(Boolean(loja));
    if (!loja) return;
    return onSnapshot(collection(db, 'barbearias', loja, 'servicos'), snap => {
      setServicos(snap.docs.map(d => ({ ...d.data(), id: d.id })).filter(s => s.ativo !== false));
      setCarregandoServicos(false);
    }, () => {
      setErroServicos('Não foi possível carregar os serviços. Verifique a conexão e tente novamente.');
      setCarregandoServicos(false);
    });
  }, [loja]);

  useEffect(() => {
    let ativo = true;
    let versao = 0;
    setHorario(''); setOpcoes([]);
    setErroHorarios('');
    setCarregando(false);
    if (!barbeiro || !servico || !data) return;
    async function atualizar() {
      const atual = ++versao;
      setCarregando(true);
      setErroHorarios('');
      setHorario(''); setOpcoes([]);
      try {
        const [ds, es, ocupados] = await Promise.all([
          getDoc(doc(db, 'disponibilidades', barbeiro)),
          getDoc(doc(db, 'excecoesDisponibilidade', `${barbeiro}_${data}`)),
          consultarOcupacao(barbeiro, data),
        ]);
        if (!ativo || atual !== versao) return;
        setOpcoes(horariosDisponiveis(data, duracao, ds.data()?.semanal, es.data(), ocupados));
      } catch (e) {
        console.error('Falha na consulta de disponibilidade/ocupação:', e);
        if (ativo && atual === versao) {
          setOpcoes([]);
          setErroHorarios(e.code === 'permission-denied'
            ? 'Não foi possível acessar a agenda. As permissões do Firestore precisam ser atualizadas pelo responsável pelo sistema.'
            : e.message || 'Não foi possível consultar a agenda. Tente novamente.');
        }
      }
      finally { if (ativo && atual === versao) setCarregando(false); }
    }
    const falha = erro => {
      console.error('Falha na conexão com a agenda:', erro);
      ++versao;
      setCarregando(false); setOpcoes([]); setHorario('');
      setErroHorarios('A conexão com a agenda foi interrompida. Tente consultar novamente.');
    };
    const parar = [
      onSnapshot(doc(db, 'reservasHorario', `${barbeiro}_${data}`), atualizar, falha),
      onSnapshot(doc(db, 'disponibilidades', barbeiro), atualizar, falha),
      onSnapshot(doc(db, 'excecoesDisponibilidade', `${barbeiro}_${data}`), atualizar, falha),
    ];
    return () => { ativo = false; parar.forEach(fn => fn()); };
  }, [barbeiro, servico, data, duracao, tentativa]);

  function selecionarData(item) {
    setData(item.data);
    setTentativa(n => n + 1);
    if (!servico) {
      setMensagem(`Data ${item.data.split('-').reverse().join('/')} selecionada. Escolha o serviço para calcular os horários conforme a duração do atendimento.`);
      campoServico.current?.focus();
      campoServico.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setMensagem('');
    gradeHorarios.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function prepararConfirmacao(e) {
    e.preventDefault();
    if (salvando || !opcoes.includes(horario)) return;
    const s = servicos.find(item => item.id === servico);
    const b = barbeiros.find(item => item.id === barbeiro);
    const preco = agendamento?.preco ?? Number(s?.preco);
    if (!agendamento && (!Number.isFinite(preco) || preco < 0)) {
      setMensagem('O serviço está sem preço válido. Consulte a barbearia.');
      return;
    }
    setErroSalvar('');
    setResumo({ data, horarioInicio: horario, horarioFim: hora(minutos(horario) + duracao), duracaoMinutos: duracao,
      barbeiroId: barbeiro, barbeiroNome: agendamento?.barbeiroNome || b?.nome || 'Barbeiro',
      servicoId: servico, servicoNome: agendamento?.servicoNome || s?.nome || 'Serviço', preco, reagendando: Boolean(agendamento) });
  }

  async function salvar() {
    if (salvando || !resumo) return;
    if (!opcoes.includes(resumo.horarioInicio)) {
      setErroSalvar('A disponibilidade mudou. Revise a seleção e escolha um horário livre.');
      return;
    }
    setSalvando(true); setMensagem('');
    try {
      await alterarAgendamento({ acao: agendamento ? 'reagendar' : 'criar', id: agendamento?.id || id.current,
        barbeiroId: resumo.barbeiroId, servicoId: resumo.servicoId, data: resumo.data, horarioInicio: resumo.horarioInicio,
        ...(!agendamento ? { precoEsperado: resumo.preco, duracaoEsperada: resumo.duracaoMinutos } : {}) });
      id.current = doc(collection(db, 'agendamentos')).id;
      setHorario('');
      setResumo(null);
      setTentativa(n => n + 1);
      setMensagem(agendamento ? 'Pedido de reagendamento enviado. O horário original continua reservado até a decisão do barbeiro.' : 'Agendamento solicitado! Aguarde a confirmação do barbeiro.');
      aoSalvar?.();
    } catch (e) { setErroSalvar(e.message); }
    finally { setSalvando(false); }
  }

  const proximoPasso = !loja ? 'Escolha a barbearia para continuar.'
    : !barbeiro ? 'Escolha o barbeiro para continuar.'
    : carregandoServicos ? 'Aguarde o carregamento dos serviços.'
    : erroServicos ? 'Os serviços não puderam ser consultados.'
    : !servicos.length && !agendamento ? 'Esta barbearia ainda não possui serviços ativos cadastrados.'
    : !servico ? 'Escolha um serviço para visualizar os horários disponíveis.'
    : !data ? 'Escolha a data do atendimento.'
    : !horario ? 'Selecione um dos horários disponíveis para liberar a solicitação.' : '';

  return <section className="ag-card">
    {voltar && <button className="ag-button" type="button" disabled={salvando} onClick={voltar}>Voltar</button>}
    <h2>{agendamento ? 'Solicitar reagendamento' : 'Agendar horário'}</h2>
    {erroOpcoes && <p role="alert">{erroOpcoes}</p>}
    {erroCatalogo && <p role="alert">{erroCatalogo}</p>}
    <form className="ag-form" onSubmit={prepararConfirmacao}>
      {!agendamento && <>
        <label>Barbearia<select aria-label="Barbearia" required value={loja} onChange={e => { setLoja(e.target.value); setBarbeiro(''); setServico(''); }}><option value="">{carregandoLojas ? 'Carregando barbearias...' : 'Selecione'}</option>{lojas.map(l => <option key={l.id} value={l.id}>{l.nomeBarbearia || l.nome || 'Barbearia'}</option>)}</select></label>
        {!carregandoLojas && !lojas.length && !erroCatalogo && <p>Nenhuma barbearia cadastrada.</p>}
        <label>Barbeiro<select aria-label="Barbeiro" required disabled={!loja || carregandoOpcoes || Boolean(erroOpcoes)} value={barbeiro} onChange={e => setBarbeiro(e.target.value)}><option value="">{carregandoOpcoes ? 'Carregando barbeiros...' : 'Selecione'}</option>{barbeiros.filter(b => b.barbeariaId === loja).map(b => <option key={b.id} value={b.id}>{b.nome || 'Barbeiro'}</option>)}</select></label>
        {loja && !carregandoOpcoes && !erroOpcoes && !barbeiros.length && <p>Nenhum barbeiro ativo vinculado a esta barbearia.</p>}
        <label>Serviço<select ref={campoServico} aria-label="Serviço" required disabled={!loja || carregandoServicos || Boolean(erroServicos)} value={servico} onChange={e => { setServico(e.target.value); setMensagem(''); }}><option value="">{carregandoServicos ? 'Carregando serviços...' : 'Selecione o serviço'}</option>{servicos.map(s => <option key={s.id} value={s.id}>{s.nome} — {s.duracaoMinutos ?? s.duracao ?? 30} min</option>)}</select></label>
        {erroServicos && <p role="alert">{erroServicos}</p>}
        {loja && !carregandoServicos && !erroServicos && !servicos.length && <p>Esta barbearia ainda não possui serviços ativos cadastrados.</p>}
      </>}
      <label>Data<input required type="date" min={hoje()} value={data} onChange={e => setData(e.target.value)} /></label>
      <DatasConfiguradas barbeiroId={barbeiro} aoSelecionar={selecionarData} />
      <p>{carregando ? 'Consultando horários...' : 'Horários disponíveis'}</p>
      <div className="ag-fields" ref={gradeHorarios}>{opcoes.map(h => <button className="ag-day" type="button" key={h} aria-pressed={h === horario} onClick={() => setHorario(h)}>{h}</button>)}</div>
      {horario && <p role="status">Horário selecionado: <strong>{horario}</strong>. Clique em Solicitar agendamento para revisar e confirmar.</p>}
      {erroHorarios && <div role="alert"><p>{erroHorarios}</p><button type="button" className="ag-button" onClick={() => setTentativa(n => n + 1)}>Consultar novamente</button></div>}
      {!carregando && !erroHorarios && !opcoes.length && <p>{barbeiro && servico && data ? 'Nenhum horário disponível para esta seleção.' : 'Selecione barbeiro, serviço e data para consultar os horários.'}</p>}
      {mensagem && <p role="status" className="ag-message">{mensagem}</p>}
      {proximoPasso && !erroHorarios && <p id="agenda-proximo-passo" role="status">{proximoPasso}</p>}
      <button className="ag-button" aria-describedby={proximoPasso && !erroHorarios ? 'agenda-proximo-passo' : undefined} disabled={salvando || carregando || !horario}>{salvando ? 'Enviando...' : agendamento ? 'Solicitar reagendamento' : 'Solicitar agendamento'}</button>
    </form>
    {resumo && <ConfirmarAgendamento resumo={resumo} salvando={salvando} erro={erroSalvar} confirmar={salvar} fechar={() => setResumo(null)} />}
  </section>;
}
