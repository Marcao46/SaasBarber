export const ativos = new Set(['pendente', 'confirmado']);
export const dias = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
export function minutos(hora) {
  if (typeof hora !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(hora)) throw new Error('Horário inválido.');
  return Number(hora.slice(0, 2)) * 60 + Number(hora.slice(3));
}
export function hora(total) {
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}
export function configuracaoDia(data, semanal, excecao) {
  if (excecao?.bloqueada === true) return null;
  const dia = semanal?.find(d => d.dia === dias[new Date(`${data}T12:00:00Z`).getUTCDay()]);
  // Uma liberação explícita da data também abre um dia semanal desativado
  // ou ainda não configurado. O bloqueio explícito sempre tem prioridade.
  if (excecao?.bloqueada === false) return { ...dia, ...excecao, ativo: true };
  if (!dia || dia.ativo === false) return null;
  return { ...dia, ...excecao };
}
export function intervalo(data, horarioInicio, duracao, semanal, excecao, agora = Date.now()) {
  if (typeof data !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data) || new Date(`${data}T12:00:00Z`).toISOString().slice(0, 10) !== data) throw new Error('Data inválida.');
  const inicio = minutos(horarioInicio);
  if (!Number.isInteger(duracao) || duracao <= 0 || duracao > 720) throw new Error('Duração inválida.');
  if (new Date(`${data}T${horarioInicio}:00-03:00`).getTime() <= agora) throw new Error('Escolha um horário futuro.');
  const config = configuracaoDia(data, semanal, excecao);
  if (!config) throw new Error('Barbeiro indisponível nesta data.');
  const fim = inicio + duracao;
  if (inicio < minutos(config.inicio) || fim > minutos(config.fim) || (inicio - minutos(config.inicio)) % 30 !== 0) throw new Error('Horário fora da disponibilidade.');
  if (config.intervaloInicio && config.intervaloFim && inicio < minutos(config.intervaloFim) && fim > minutos(config.intervaloInicio)) throw new Error('Horário durante o intervalo.');
  return { data, horarioInicio, horarioFim: hora(fim) };
}
export function conflita(a, b) {
  return a.data === b.data && minutos(a.horarioInicio) < minutos(b.horarioFim) && minutos(a.horarioFim) > minutos(b.horarioInicio);
}
export function horariosDisponiveis(data, duracao, semanal, excecao, ocupados, agora = Date.now()) {
  const config = configuracaoDia(data, semanal, excecao);
  if (!config) return [];
  const livres = [];
  for (let n = minutos(config.inicio); n + duracao <= minutos(config.fim); n += 30) {
    try {
      const candidato = intervalo(data, hora(n), duracao, semanal, excecao, agora);
      if (!ocupados.some(o => conflita(candidato, o))) livres.push(candidato.horarioInicio);
    } catch { /* Inícios no passado, durante intervalo ou fora do expediente. */ }
  }
  return livres;
}
export function podeConcluir(atual, agora = Date.now()) {
  const fim = new Date(`${atual.data}T${atual.horarioFim}:00-03:00`).getTime();
  return atual.status === 'confirmado' && !atual.reagendamento && Number.isFinite(fim) && agora >= fim;
}
export function transicao(atual, acao, uid, novo, agora = Date.now()) {
  const cliente = uid === atual.clienteId;
  const barbeiro = uid === atual.barbeiroId;
  if (!ativos.has(atual.status)) throw new Error('Este atendimento não pode mais ser alterado.');
  switch (acao) {
    case 'cancelar':
      if (!cliente && !barbeiro) break;
      return { ...atual, status: 'cancelado', canceladoPor: uid, reagendamento: null };
    case 'confirmar':
    case 'recusar':
      if (!barbeiro || atual.status !== 'pendente' || atual.reagendamento) break;
      return { ...atual, status: acao === 'confirmar' ? 'confirmado' : 'recusado' };
    case 'concluir':
      if (!barbeiro || !podeConcluir(atual, agora)) break;
      return { ...atual, status: 'concluido' };
    case 'reagendar':
      if (!cliente || atual.reagendamento || !novo || conflita(atual, novo)) break;
      return { ...atual, reagendamento: novo, resultadoReagendamento: null };
    case 'aceitarReagendamento':
    case 'recusarReagendamento':
      if (!barbeiro || !atual.reagendamento) break;
      return { ...atual, ...(acao === 'aceitarReagendamento' ? atual.reagendamento : {}), status: acao === 'aceitarReagendamento' ? 'confirmado' : atual.status, reagendamento: null, resultadoReagendamento: acao === 'aceitarReagendamento' ? 'aceito' : 'recusado' };
  }
  throw new Error('Ação não permitida para este usuário ou status.');
}
