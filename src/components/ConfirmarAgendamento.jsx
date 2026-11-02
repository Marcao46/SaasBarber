import { useEffect, useRef } from 'react';

export default function ConfirmarAgendamento({ resumo, salvando, erro, confirmar, fechar }) {
  const dialogo = useRef(null);
  useEffect(() => {
    dialogo.current.showModal();
  }, []);
  return <dialog ref={dialogo} className="agenda-confirmacao" aria-labelledby="agenda-confirmacao-titulo" onCancel={e => {
    e.preventDefault();
    if (!salvando) fechar();
  }}>
    <h2 id="agenda-confirmacao-titulo">{resumo.reagendando ? 'Confirmar pedido de reagendamento' : 'Confira seu agendamento'}</h2>
    <dl>
      <dt>Barbeiro</dt><dd>{resumo.barbeiroNome}</dd>
      <dt>Serviço</dt><dd>{resumo.servicoNome}</dd>
      <dt>Valor</dt><dd>{Number.isFinite(resumo.preco) ? resumo.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'Valor não informado'}</dd>
      <dt>Data</dt><dd>{resumo.data.split('-').reverse().join('/')}</dd>
      <dt>Horário</dt><dd>{resumo.horarioInicio} às {resumo.horarioFim}</dd>
      <dt>Duração</dt><dd>{resumo.duracaoMinutos} minutos</dd>
    </dl>
    <p>{resumo.reagendando ? 'O horário original continua reservado até a decisão do barbeiro.' : 'A solicitação ficará pendente até o barbeiro aceitar.'}</p>
    {erro && <p role="alert" className="agenda-erro">{erro}</p>}
    <div className="agenda-acoes">
      <button type="button" className="ag-day" disabled={salvando} onClick={fechar}>Revisar seleção</button>
      <button type="button" className="ag-button" disabled={salvando} onClick={confirmar}>{salvando ? 'Enviando...' : 'Confirmar solicitação'}</button>
    </div>
  </dialog>;
}
