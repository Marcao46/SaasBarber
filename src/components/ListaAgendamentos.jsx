import { useEffect, useRef, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { auth, db } from '../fireBaseConfig';
import { alterarAgendamento } from '../agendaApi';
import AgendarHorarioCliente from './AgendarHorarioCliente';
import { podeConcluir } from '../agendaCore.js';
import './Agendamento.css';

const finais = ['concluido', 'cancelado', 'recusado'];
const rotulos = { pendente: 'Pendente', confirmado: 'Confirmado', concluido: 'Concluído', cancelado: 'Cancelado', recusado: 'Recusado' };
const dataBR = d => d?.split('-').reverse().join('/');
export default function ListaAgendamentos({ papel = 'cliente', barbeariaId }) {
  const [lista, setLista] = useState([]);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [ocupado, setOcupado] = useState(false);
  const [filtro, setFiltro] = useState('ativos');
  const [agora, setAgora] = useState(Date.now());
  const anteriores = useRef(null);
  const [reagendar, setReagendar] = useState(null);
  const uid = auth.currentUser?.uid;
  useEffect(() => {
    const timer = setInterval(() => setAgora(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!uid) { setCarregando(false); return; }
    anteriores.current = null;
    return onSnapshot(query(collection(db, 'agendamentos'), where(barbeariaId ? 'barbeariaId' : papel === 'cliente' ? 'clienteId' : 'barbeiroId', '==', barbeariaId || uid)), snap => {
      const novos = snap.docs.map(d => ({ ...d.data(), id: d.id })).sort((a, b) => `${a.data} ${a.horarioInicio}`.localeCompare(`${b.data} ${b.horarioInicio}`));
      if (papel === 'cliente' && anteriores.current) {
        const alterado = novos.find(a => anteriores.current.has(a.id) && anteriores.current.get(a.id) !== `${a.status}:${a.resultadoReagendamento || ''}`);
        if (alterado) setMensagem(`Atualização de ${alterado.servicoNome || 'seu atendimento'}: ${rotulos[alterado.status] || alterado.status}${alterado.resultadoReagendamento ? ` · Reagendamento ${alterado.resultadoReagendamento}` : ''}.`);
      }
      anteriores.current = new Map(novos.map(a => [a.id, `${a.status}:${a.resultadoReagendamento || ''}`]));
      setLista(novos);
      setCarregando(false); setErro('');
    }, () => { setErro('Não foi possível acompanhar os agendamentos. Verifique sua conexão e permissões.'); setCarregando(false); });
  }, [uid, papel, barbeariaId]);
  async function agir(item, acao) {
    if (ocupado) return;
    if (acao === 'cancelar' && !window.confirm(`Cancelar o atendimento de ${dataBR(item.data)} às ${item.horarioInicio}?`)) return;
    setOcupado(true); setErro(''); setMensagem('');
    try {
      await alterarAgendamento({ id: item.id, acao });
      const textos = { cancelar: 'Agendamento cancelado. Os horários foram liberados.', confirmar: 'Agendamento confirmado.', recusar: 'Solicitação recusada. Horário liberado.', concluir: 'Atendimento concluído.', aceitarReagendamento: 'Reagendamento aceito e confirmado. O horário original foi liberado.', recusarReagendamento: 'Reagendamento recusado. O agendamento original foi mantido.' };
      setMensagem(textos[acao]);
    } catch (e) { setErro(e.message); }
    finally { setOcupado(false); }
  }
  if (reagendar) return <AgendarHorarioCliente agendamento={reagendar} voltar={() => setReagendar(null)} aoSalvar={() => { setReagendar(null); setMensagem('Pedido de reagendamento enviado. O horário original e o novo horário estão reservados até a decisão do barbeiro.'); }} />;
  const visiveis = lista.filter(a => filtro === 'todos' || (filtro === 'ativos' ? !finais.includes(a.status) : filtro === 'historico' ? finais.includes(a.status) : a.status === filtro));
  return <section className="ag-card">
    <h2>{filtro === 'historico' ? 'Histórico de atendimentos' : 'Agendamentos'}</h2>
    <div className="agenda-acoes"><button type="button" className="ag-day" aria-pressed={filtro === 'ativos'} onClick={() => setFiltro('ativos')}>Ativos</button><button type="button" className="ag-day" aria-pressed={filtro === 'historico'} onClick={() => setFiltro('historico')}>Histórico e cancelamentos</button></div>
    <label className="agenda-filtro">Filtrar por status<select aria-label="Filtrar por status" value={filtro} onChange={e => setFiltro(e.target.value)}>
      <option value="ativos">Ativos</option><option value="historico">Histórico</option><option value="todos">Todos</option>
      {Object.entries(rotulos).map(([valor, nome]) => <option key={valor} value={valor}>{nome}</option>)}
    </select></label>
    {erro && <p role="alert">{erro}</p>}{mensagem && <p className="ag-message" role="status">{mensagem}</p>}
    {carregando ? <p>Carregando...</p> : !visiveis.length && <p>Nenhum agendamento nesta lista.</p>}
    <div className="agenda-lista">{visiveis.map(a => <article className="ag-card" key={a.id}>
      <h3>{a.servicoNome || a.nomeServico || 'Serviço'}</h3>
      <p>Cliente: {a.clienteNome || a.nomeCliente} · Barbeiro: {a.barbeiroNome || a.nomeBarbeiro}</p>
      <p>{dataBR(a.data)} — {a.horarioInicio || a.hora} às {a.horarioFim}</p>
      <p>Duração: {a.duracaoMinutos ? `${a.duracaoMinutos} minutos` : 'Não informada'} · Valor: {Number.isFinite(a.preco) ? a.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'Não informado'}</p>
      <p role="status" className={`agenda-status agenda-status-${a.status}`}>Status: {rotulos[a.status] || a.status}</p>
      {a.concluidoEm?.toDate && <p>Concluído em {a.concluidoEm.toDate().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}.</p>}
      {a.recusadoEm?.toDate && <p>Recusado em {a.recusadoEm.toDate().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}.</p>}
      {a.status === 'cancelado' && <p>Cancelado pelo {a.canceladoPor === a.clienteId ? 'cliente' : 'profissional'}.</p>}
      {a.resultadoReagendamento && <p>Último pedido de reagendamento: {a.resultadoReagendamento === 'aceito' ? 'aceito, novo horário confirmado' : 'recusado, horário original mantido'}.</p>}
      {a.reagendamento && <p>Reagendamento aguardando decisão: {dataBR(a.reagendamento.data)} às {a.reagendamento.horarioInicio}. O horário original permanece reservado.</p>}
      {!finais.includes(a.status) && !barbeariaId && <div className="ag-fields">
        {papel === 'cliente' && <>
          <button className="ag-button" disabled={ocupado} onClick={() => agir(a, 'cancelar')}>Cancelar agendamento</button>
          {!a.reagendamento && <button className="ag-button" disabled={ocupado} onClick={() => setReagendar(a)}>Reagendar</button>}
        </>}
        {papel === 'barbeiro' && (a.reagendamento ? <>
          <button className="ag-button" disabled={ocupado} onClick={() => agir(a, 'aceitarReagendamento')}>Aceitar reagendamento</button>
          <button className="ag-button" disabled={ocupado} onClick={() => agir(a, 'recusarReagendamento')}>Recusar reagendamento</button>
        </> : <>
          {a.status === 'pendente' && <><button className="ag-button" disabled={ocupado} onClick={() => agir(a, 'confirmar')}>Aceitar</button><button className="ag-button" disabled={ocupado} onClick={() => agir(a, 'recusar')}>Recusar</button></>}
          {a.status === 'confirmado' && <><button className="ag-button" disabled={ocupado || !podeConcluir(a, agora)} onClick={() => agir(a, 'concluir')}>Finalizar corte</button>{!podeConcluir(a, agora) && <p>Disponível após o término previsto do atendimento.</p>}</>}
        </>)}
      </div>}
    </article>)}</div>
  </section>;
}
