import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

export async function prepararDemo() {
  for (const variavel of ['FIRESTORE_EMULATOR_HOST', 'FIREBASE_AUTH_EMULATOR_HOST']) {
    if (!/^(127\.0\.0\.1|localhost):\d+$/.test(process.env[variavel] || '')) {
      throw new Error(`${variavel} precisa apontar para o emulador local. Nenhum dado foi gravado.`);
    }
  }
  const app = getApps().find(a => a.name === 'demo-local') || initializeApp({ projectId: 'demo-saasbarber' }, 'demo-local');
  const db = getFirestore(app);
  const auth = getAuth(app);
  const contas = [['cliente-demo', 'cliente@demo.local'], ['outro-demo', 'outro@demo.local'], ['barbeiro-demo', 'barbeiro@demo.local'], ['dono-demo', 'dono@demo.local']];
  for (const [uid, email] of contas) {
    try { await auth.getUser(uid); }
    catch (e) {
      if (e.code !== 'auth/user-not-found') throw e;
      await auth.createUser({ uid, email, password: 'Demo123456!' });
    }
  }
  const data = dias => new Date(Date.now() + dias * 86400000).toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });
  const amanha = data(1);
  const depois = data(2);
  const marca = { criadoEm: FieldValue.serverTimestamp() };
  const dados = {
    'barbearias/loja-demo': { nomeBarbearia: 'Barbearia Demonstração', donoId: 'dono-demo', nomeCompleto: 'Dono Demo', email: 'dono@demo.local', telefone: '000000000' },
    'barbeariasPublicas/loja-demo': { nomeBarbearia: 'Barbearia Demonstração', publicada: true, servicos: [{ id: 'corte-demo', nome: 'Corte Demo', duracao: 45, preco: 50 }] },
    'barbeiros/documento-demo': { nome: 'Barbeiro Demo', usuarioId: 'barbeiro-demo', barbeariaId: 'loja-demo', donoId: 'dono-demo', tipoUsuario: 'barbeiro' },
    'clientes/cliente-demo': { nome: 'Cliente Demo', usuarioId: 'cliente-demo', tipoUsuario: 'cliente', email: 'cliente@demo.local' },
    'clientes/outro-demo': { nome: 'Outro Cliente Demo', usuarioId: 'outro-demo', tipoUsuario: 'cliente', email: 'outro@demo.local' },
    'barbearias/loja-demo/servicos/corte-demo': { nome: 'Corte Demo', duracao: 45, preco: 50, ativo: true },
    'disponibilidades/barbeiro-demo': { barbeiroId: 'barbeiro-demo', semanal: ['domingo','segunda','terca','quarta','quinta','sexta','sabado'].map(dia => ({ dia, ativo: true, inicio: '09:00', fim: '18:00', intervaloInicio: '12:00', intervaloFim: '13:00' })) },
    [`excecoesDisponibilidade/barbeiro-demo_${amanha}`]: { barbeiroId: 'barbeiro-demo', data: amanha, bloqueada: false, inicio: '09:00', fim: '18:00', intervaloInicio: '12:00', intervaloFim: '13:00' },
    [`excecoesDisponibilidade/barbeiro-demo_${depois}`]: { barbeiroId: 'barbeiro-demo', data: depois, bloqueada: false, inicio: '09:00', fim: '18:00', intervaloInicio: '12:00', intervaloFim: '13:00' },
    'agendamentos/concluir-demo': { clienteId: 'cliente-demo', clienteNome: 'Cliente Demo', barbeiroId: 'barbeiro-demo', barbeiroNome: 'Barbeiro Demo', barbeariaId: 'loja-demo', servicoId: 'corte-demo', servicoNome: 'Atendimento anterior Demo', preco: 50, duracaoMinutos: 45, data: data(-1), horarioInicio: '09:00', horarioFim: '09:45', status: 'confirmado', reagendamento: null, ...marca },
  };
  // Fixtures idempotentes: não apagar cadastros nem agendamentos criados durante a demonstração.
  for (const [caminho, valor] of Object.entries(dados)) {
    const ref = db.doc(caminho);
    if (!(await ref.get()).exists) await ref.set(valor);
  }
  console.log('Demonstração local pronta. Contas cliente@demo.local / barbeiro@demo.local / dono@demo.local; senha Demo123456!');
  return { app, db, amanha, depois };
}
