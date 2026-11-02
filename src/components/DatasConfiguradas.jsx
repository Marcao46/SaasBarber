import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../fireBaseConfig';

export default function DatasConfiguradas({ barbeiroId, editar = false, aoSelecionar }) {
  const [datas, setDatas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const hoje = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });
  useEffect(() => {
    setDatas([]); setErro(''); setCarregando(true);
    if (!barbeiroId) { setCarregando(false); return; }
    return onSnapshot(query(collection(db, 'excecoesDisponibilidade'), where('barbeiroId', '==', barbeiroId)), snap => {
      setDatas(snap.docs.map(d => ({ ...d.data(), id: d.id })).sort((a, b) => (a.data || '').localeCompare(b.data || '')));
      setCarregando(false); setErro('');
    }, e => {
      console.error('Erro ao acompanhar datas configuradas:', e);
      setErro('Não foi possível carregar as datas configuradas.');
      setCarregando(false);
    });
  }, [barbeiroId]);
  if (!barbeiroId) return null;
  const visiveis = datas.filter(d => d.data >= hoje && (editar || d.bloqueada === false));
  return <section className="agenda-datas" aria-label={editar ? 'Ajustes de datas salvos' : 'Datas liberadas pelo profissional'}>
    <h3>{editar ? 'Ajustes de datas salvos' : 'Datas liberadas pelo profissional'}</h3>
    {erro && <p role="alert">{erro}</p>}
    {carregando && <p>Carregando datas...</p>}
    {!carregando && !erro && !visiveis.length && <p>Nenhum ajuste específico para as próximas datas. Os dias sem ajuste seguem a disponibilidade semanal salva.</p>}
    <div className="agenda-lista">{visiveis.map(item => <article className="agenda-data" key={item.id}>
      <strong>{item.data.split('-').reverse().join('/')} — {item.bloqueada ? 'Bloqueada' : 'Liberada'}</strong>
      {!item.bloqueada && <p>{item.inicio} às {item.fim}{item.intervaloInicio && item.intervaloFim ? ` · Intervalo: ${item.intervaloInicio} às ${item.intervaloFim}` : ''}</p>}
      <button type="button" className="ag-day" onClick={() => aoSelecionar(item)}>{editar ? 'Editar ajuste' : 'Selecionar esta data'}</button>
    </article>)}</div>
    {!editar && visiveis.length > 0 && <p>Os horários serão consultados considerando a duração do serviço e as reservas existentes.</p>}
  </section>;
}
