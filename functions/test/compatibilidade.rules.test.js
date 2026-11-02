import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import * as sdk from 'firebase/firestore';
import { criarAgendaStore } from '../../src/agendaStore.js';

const arquivoAtual = new URL('../../firestore.rules', import.meta.url);
const arquivoBackup = new URL('../../backups/firestore.rules.antes-auditoria-grupo.rules', import.meta.url);

test('a auditoria altera somente a validação de atualização da disponibilidade', async () => {
  const anterior = await readFile(arquivoBackup,'utf8');
  const atual = await readFile(arquivoAtual,'utf8');
  const original = "        && request.resource.data.keys().hasOnly(['barbeiroId', 'semanal', 'atualizadoEm', 'agendaPreparada', 'barbeiroDocumentoId'])";
  const novo = "        && (resource == null\n          ? request.resource.data.keys().hasOnly(['barbeiroId', 'semanal', 'atualizadoEm', 'agendaPreparada', 'barbeiroDocumentoId'])\n          : request.resource.data.diff(resource.data).affectedKeys().hasOnly(['barbeiroId', 'semanal', 'atualizadoEm', 'agendaPreparada', 'barbeiroDocumentoId']))";
  assert.ok(anterior.includes(original));
  assert.equal(atual.replace(novo,original).replaceAll('\r\n','\n'),anterior.replaceAll('\r\n','\n'));
  const manifesto = JSON.parse(await readFile(new URL('../../backups/firestore-auditoria-manifesto.json',import.meta.url),'utf8'));
  assert.equal(createHash('sha256').update(await readFile(arquivoBackup)).digest('hex'),manifesto.sha256Backup);
});

test('compatibilidade dos perfis, dados antigos e gerenciamento no emulador', { skip: !process.env.FIRESTORE_EMULATOR_HOST }, async t => {
  const atual = await initializeTestEnvironment({ projectId: 'demo-saasbarber-auditoria-atual', firestore: { rules: await readFile(arquivoAtual,'utf8') } });
  const antes = await initializeTestEnvironment({ projectId: 'demo-saasbarber-auditoria-antes', firestore: { rules: await readFile(arquivoBackup,'utf8') } });
  const bancos = new Map();
  const db = (uid, env = atual) => {
    const chave = `${env.projectId}:${uid}`;
    if (!bancos.has(chave)) bancos.set(chave,uid ? env.authenticatedContext(uid).firestore() : env.unauthenticatedContext().firestore());
    return bancos.get(chave);
  };
  async function fixtures(env) {
    await env.clearFirestore();
    await env.withSecurityRulesDisabled(async ctx => {
      const admin = ctx.firestore();
      await Promise.all([
        sdk.setDoc(sdk.doc(admin,'barbearias/loja-a'),{ donoId: 'dono-a', nomeBarbearia: 'Loja A', nomeCompleto: 'Dono A', criadoEm: sdk.Timestamp.fromMillis(1000), tipoUsuario: 'dono', quantidadeBarbeiros: 3 }),
        sdk.setDoc(sdk.doc(admin,'barbearias/loja-b'),{ donoId: 'dono-b', nomeBarbearia: 'Loja B' }),
        sdk.setDoc(sdk.doc(admin,'barbeiros/id-aleatorio'),{ usuarioId: 'barbeiro-a', donoId: 'dono-a', barbeariaId: 'loja-a', nome: 'Barbeiro A', tipoUsuario: 'barbeiro' }),
        sdk.setDoc(sdk.doc(admin,'clientes/cliente'),{ usuarioId: 'cliente', nome: 'Cliente', tipoUsuario: 'cliente' }),
        sdk.setDoc(sdk.doc(admin,'clientes/id-legado'),{ usuarioId: 'cliente-legado', nome: 'Legado', tipoUsuario: 'cliente', campoLegado: 'preservar' }),
        sdk.setDoc(sdk.doc(admin,'adminsSaas/admin'),{ usuarioId: 'admin', ativo: true }),
        sdk.setDoc(sdk.doc(admin,'adminsSaas/id-admin-antigo'),{ usuarioId: 'admin-aleatorio', ativo: true }),
        sdk.setDoc(sdk.doc(admin,'disponibilidades/barbeiro-a'),{ barbeiroId: 'barbeiro-a', semanal: [], criadoEm: sdk.Timestamp.fromMillis(1000), observacaoLegada: 'preservar' }),
      ]);
    });
  }
  try {
    await fixtures(atual); await fixtures(antes);
    await t.test('consultas usadas no login funcionam para cliente, barbeiro e dois donos', async () => {
      for (const uid of ['cliente','barbeiro-a','dono-a','dono-b']) {
        const banco = db(uid);
        await assertSucceeds(sdk.getDocs(sdk.query(sdk.collection(banco,'adminsSaas'),sdk.where('usuarioId','==',uid))));
        await assertSucceeds(sdk.getDocs(sdk.query(sdk.collection(banco,'barbearias'),sdk.where('donoId','==',uid))));
        await assertSucceeds(sdk.getDocs(sdk.query(sdk.collection(banco,'barbeiros'),sdk.where('usuarioId','==',uid))));
        await assertSucceeds(sdk.getDoc(sdk.doc(banco,`clientes/${uid}`)));
        await assertSucceeds(sdk.getDocs(sdk.query(sdk.collection(banco,'clientes'),sdk.where('usuarioId','==',uid))));
      }
    });
    await t.test('cadastro e perfil do cliente, inclusive documento antigo com ID aleatório', async () => {
      await assertSucceeds(sdk.setDoc(sdk.doc(db('novo-cliente'),'clientes/novo-cliente'),{ nome: 'Novo', telefone: '123', email: 'novo@example.com', usuarioId: 'novo-cliente', tipoUsuario: 'cliente', criadoEm: sdk.serverTimestamp() }));
      const encontrados = await assertSucceeds(sdk.getDocs(sdk.query(sdk.collection(db('cliente-legado'),'clientes'),sdk.where('usuarioId','==','cliente-legado'))));
      assert.equal(encontrados.docs[0].id,'id-legado');
      await assertSucceeds(sdk.updateDoc(sdk.doc(db('cliente-legado'),'clientes/id-legado'),{ nome: 'Legado editado', telefone: '456' }));
      assert.equal((await sdk.getDoc(sdk.doc(db('cliente-legado'),'clientes/id-legado'))).data().campoLegado,'preservar');
      await assertFails(sdk.getDoc(sdk.doc(db('dono-a'),'clientes/cliente')));
      await assertFails(sdk.setDoc(sdk.doc(db('cliente'),'clientes/vitima'),{ usuarioId: 'vitima', tipoUsuario: 'cliente' }));
    });
    await t.test('dois proprietários usam seus cadastros sem assumir a barbearia do outro', async () => {
      const novo = db('novo-dono');
      await assertSucceeds(sdk.addDoc(sdk.collection(novo,'barbearias'),{ donoId: 'novo-dono', nomeCompleto: 'Novo', nomeBarbearia: 'Nova', email: 'dono@example.com', telefone: '123' }));
      await assertSucceeds(sdk.updateDoc(sdk.doc(db('dono-a'),'barbearias/loja-a'),{ nomeBarbearia: 'Loja A editada', telefone: '456' }));
      const legado = (await sdk.getDoc(sdk.doc(db('dono-a'),'barbearias/loja-a'))).data();
      assert.equal(legado.tipoUsuario,'dono'); assert.equal(legado.quantidadeBarbeiros,3);
      await assertSucceeds(sdk.updateDoc(sdk.doc(db('dono-b'),'barbearias/loja-b'),{ telefone: '789' }));
      await assertFails(sdk.updateDoc(sdk.doc(db('dono-b'),'barbearias/loja-a'),{ nomeBarbearia: 'Outra' }));
      await assertFails(sdk.updateDoc(sdk.doc(db('dono-a'),'barbearias/loja-a'),{ donoId: 'dono-b' }));
    });
    await t.test('cadastro, consulta, edição e exclusão de barbeiros pelo proprietário', async () => {
      const barbeiro = { nome: 'Novo barbeiro', email: 'barbeiro@example.com', telefone: '123', especialidade: 'Corte', especialidades: ['Corte'], usuarioId: 'novo-barbeiro', tipoUsuario: 'barbeiro', donoId: 'dono-a', barbeariaId: 'loja-a' };
      const r = await assertSucceeds(sdk.addDoc(sdk.collection(db('dono-a'),'barbeiros'),barbeiro));
      const achado = await assertSucceeds(sdk.getDocs(sdk.query(sdk.collection(db('novo-barbeiro'),'barbeiros'),sdk.where('usuarioId','==','novo-barbeiro'))));
      assert.equal(achado.docs[0].id,r.id);
      await assertSucceeds(sdk.updateDoc(r,{ nome: 'Editado', telefone: '456', especialidade: 'Barba', especialidades: ['Barba'] }));
      await assertFails(sdk.updateDoc(sdk.doc(db('dono-b'),'barbeiros',r.id),{ nome: 'Não autorizado' }));
      await assertFails(sdk.updateDoc(r,{ usuarioId: 'dono-b' }));
      await assertSucceeds(sdk.deleteDoc(r));
    });
    await t.test('serviços e sincronização da vitrine preservam campos existentes', async () => {
      const dono = db('dono-a');
      const servico = await assertSucceeds(sdk.addDoc(sdk.collection(dono,'barbearias/loja-a/servicos'),{ nome: 'Corte', preco: 35, duracao: 25, ativo: true, criadoEm: sdk.serverTimestamp(), atualizadoEm: sdk.serverTimestamp() }));
      await assertSucceeds(sdk.getDocs(sdk.collection(db('cliente'),'barbearias/loja-a/servicos')));
      await assertSucceeds(sdk.getDocs(sdk.collection(db('barbeiro-a'),'barbearias/loja-a/servicos')));
      await assertSucceeds(sdk.updateDoc(servico,{ preco: 40, atualizadoEm: sdk.serverTimestamp() }));
      await assertFails(sdk.updateDoc(sdk.doc(db('dono-b'),'barbearias/loja-a/servicos',servico.id),{ preco: 1 }));
      await assertFails(sdk.updateDoc(sdk.doc(db('cliente'),'barbearias/loja-a/servicos',servico.id),{ preco: 1 }));
      await assertSucceeds(sdk.setDoc(sdk.doc(dono,'barbeariasPublicas/loja-a'),{ nomeBarbearia: 'Loja A', publicada: true, imagem: 'existente', servicos: [] }));
      await assertSucceeds(sdk.setDoc(sdk.doc(dono,'barbeariasPublicas/loja-a'),{ servicos: [{ id: servico.id, nome: 'Corte', preco: 40, duracao: 25 }] },{ merge: true }));
      const vitrine = await assertSucceeds(sdk.getDoc(sdk.doc(db(null),'barbeariasPublicas/loja-a')));
      assert.equal(vitrine.data().imagem,'existente'); assert.equal(vitrine.data().servicos.length,1);
      await assertSucceeds(sdk.deleteDoc(servico));
      await assertFails(sdk.updateDoc(sdk.doc(db('dono-b'),'barbeariasPublicas/loja-a'),{ nomeBarbearia: 'Outra' }));
    });
    await t.test('correção pontual mantém metadados antigos na disponibilidade, sem liberar alterações indevidas', async () => {
      const patch = { semanal: [{ dia: 'segunda', ativo: true, inicio: '09:00', fim: '18:00' }], atualizadoEm: sdk.serverTimestamp() };
      await assertFails(sdk.updateDoc(sdk.doc(db('barbeiro-a',antes),'disponibilidades/barbeiro-a'),patch));
      await assertSucceeds(sdk.updateDoc(sdk.doc(db('barbeiro-a'),'disponibilidades/barbeiro-a'),patch));
      await criarAgendaStore(db('barbeiro-a'),'barbeiro-a',sdk).prepararAgenda();
      const salvo = (await sdk.getDoc(sdk.doc(db('barbeiro-a'),'disponibilidades/barbeiro-a'))).data();
      assert.equal(salvo.observacaoLegada,'preservar'); assert.equal(salvo.criadoEm.toMillis(),1000);
      assert.equal(salvo.agendaPreparada,true);
      await assertFails(sdk.updateDoc(sdk.doc(db('cliente'),'disponibilidades/barbeiro-a'),patch));
      await assertFails(sdk.updateDoc(sdk.doc(db('barbeiro-a'),'disponibilidades/barbeiro-a'),{ observacaoLegada: 'alterada' }));
      await assertFails(sdk.updateDoc(sdk.doc(db('barbeiro-a'),'disponibilidades/barbeiro-a'),{ agendaPreparada: false }));
    });
    await t.test('condições já existentes do administrador e da coleção raiz de serviços ficam explícitas', async () => {
      const r = sdk.doc(db('admin'),'barbearias/loja-a');
      await assertSucceeds(sdk.updateDoc(r,{ telefone: 'admin editou' }));
      const consulta = await assertSucceeds(sdk.getDocs(sdk.query(sdk.collection(db('admin-aleatorio'),'adminsSaas'),sdk.where('usuarioId','==','admin-aleatorio'),sdk.where('ativo','==',true))));
      assert.equal(consulta.size,1);
      // O login por usuarioId encontra o documento antigo; o helper de autorização exige o ID UID.
      await assertFails(sdk.updateDoc(sdk.doc(db('admin-aleatorio'),'barbearias/loja-a'),{ telefone: 'sem índice UID' }));
      await assertFails(sdk.getDocs(sdk.collection(db('dono-a'),'servicos')));
      await assertFails(sdk.setDoc(sdk.doc(db('cliente'),'adminsSaas/cliente'),{ usuarioId: 'cliente', ativo: true }));
    });
  } finally { await atual.cleanup(); await antes.cleanup(); }
});
