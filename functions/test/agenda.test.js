import test from 'node:test';
import assert from 'node:assert/strict';
import { intervalo, transicao, conflita, horariosDisponiveis, podeConcluir } from '../../src/agendaCore.js';
const original = { clienteId: 'cliente', barbeiroId: 'barbeiro', status: 'confirmado', data: '2030-01-07', horarioInicio: '09:00', horarioFim: '10:00', reagendamento: null };
const novo = { data: '2030-01-08', horarioInicio: '10:00', horarioFim: '11:00' };
const semanal = [{ dia: 'segunda', ativo: true, inicio: '09:00', fim: '18:00', intervaloInicio: '12:00', intervaloFim: '13:00' }];
test('reagendamento mantém original e recusa restaura status anterior', () => {
  for (const status of ['pendente', 'confirmado']) {
    const pedido = transicao({ ...original, status }, 'reagendar', 'cliente', novo);
    assert.equal(pedido.horarioInicio, '09:00');
    assert.equal(pedido.status, status);
    const recusado = transicao(pedido, 'recusarReagendamento', 'barbeiro');
    assert.equal(recusado.status, status);
    assert.equal(recusado.horarioInicio, '09:00');
    assert.equal(recusado.reagendamento, null);
    const aceito = transicao(pedido, 'aceitarReagendamento', 'barbeiro');
    assert.equal(aceito.status, 'confirmado');
    assert.equal(aceito.data, novo.data);
  }
});
test('permissões e estados terminais bloqueiam alterações', () => {
  for (const status of ['concluido', 'cancelado', 'recusado']) {
    for (const acao of ['cancelar', 'reagendar', 'confirmar', 'concluir']) assert.throws(() => transicao({ ...original, status }, acao, 'cliente', novo));
  }
  assert.throws(() => transicao(original, 'concluir', 'cliente'));
  assert.throws(() => transicao(original, 'cancelar', 'invasor'));
  assert.throws(() => transicao(original, 'confirmar', 'barbeiro'));
  assert.throws(() => transicao(original, 'reagendar', 'barbeiro', novo));
});
test('cancelar durante pedido libera ambas reservas', () => {
  const cancelado = transicao({ ...original, reagendamento: novo }, 'cancelar', 'cliente');
  assert.equal(cancelado.status, 'cancelado');
  assert.equal(cancelado.reagendamento, null);
});
test('intervalos sobrepostos conflitam, adjacentes ficam livres', () => {
  assert.equal(conflita(original, { ...original, horarioInicio: '09:30', horarioFim: '10:30' }), true);
  assert.equal(conflita(original, { ...original, horarioInicio: '10:00', horarioFim: '10:30' }), false);
});
test('valida duração, data, passado, expediente, intervalo e exceções', () => {
  assert.equal(intervalo('2030-01-07', '09:00', 45, semanal, null, 0).horarioFim, '09:45');
  for (const [data, hora, duracao] of [['2030-02-30','09:00',30],['2030-01-07','25:00',30],['2030-01-07','08:30',30],['2030-01-07','12:00',30],['2030-01-07','17:30',60],['2030-01-07','09:00',-1]]) assert.throws(() => intervalo(data, hora, duracao, semanal, null, 0));
  assert.throws(() => intervalo('2030-01-07', '09:00', 30, semanal, { bloqueada: true }, 0));
  assert.throws(() => intervalo('2030-01-07', '09:00', 30, semanal, null, Date.parse('2031-01-01')));
});
test('data liberada abre dia semanal inativo ou sem configuração', () => {
  const liberacao = { bloqueada: false, inicio: '10:00', fim: '16:00', intervaloInicio: '', intervaloFim: '' };
  for (const semana of [[], [{ ...semanal[0], ativo: false }]]) {
    assert.equal(intervalo('2030-01-07', '10:00', 45, semana, liberacao, 0).horarioFim, '10:45');
    assert.throws(() => intervalo('2030-01-07', '09:00', 45, semana, liberacao, 0));
    assert.throws(() => intervalo('2030-01-07', '10:00', 45, semana, { ...liberacao, bloqueada: true }, 0));
  }
});
test('grade respeita duração completa, passado, reservas e intervalo', () => {
  const livres = horariosDisponiveis('2030-01-07', 45, semanal, null, [{ ...original, horarioInicio: '10:00', horarioFim: '11:00' }], Date.parse('2030-01-07T09:00:00-03:00'));
  assert.ok(!livres.includes('09:00'));
  for (const h of ['09:30', '10:00', '10:30', '11:30', '12:00', '12:30', '17:30']) assert.ok(!livres.includes(h), h);
  assert.ok(livres.includes('11:00')); assert.ok(livres.includes('13:00')); assert.ok(livres.includes('17:00'));
});
test('finalização só é permitida após o fim, para o profissional e sem pedido aberto', () => {
  const fim = Date.parse('2030-01-07T10:00:00-03:00');
  assert.equal(podeConcluir(original, fim - 1), false);
  assert.equal(podeConcluir(original, fim), true);
  assert.throws(() => transicao(original, 'concluir', 'barbeiro', null, fim - 1));
  assert.equal(transicao(original, 'concluir', 'barbeiro', null, fim).status, 'concluido');
  assert.throws(() => transicao({ ...original, reagendamento: novo }, 'concluir', 'barbeiro', null, fim));
  assert.throws(() => transicao(original, 'concluir', 'cliente', null, fim));
});
