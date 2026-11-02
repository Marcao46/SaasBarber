import { test, expect } from '@playwright/test';
const diaDemo = dias => new Date(Date.now() + dias * 86400000).toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });
const demo = { amanha: diaDemo(1), depois: diaDemo(2) };

async function entrar(page, email, tipo) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await page.getByLabel('E-mail', { exact: true }).fill(email);
  await page.getByLabel('Senha', { exact: true }).fill('Demo123456!');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.locator(tipo === 'cliente' ? '.cliente-sidebar' : '.barbeiro-sidebar')).toBeVisible();
}
async function menu(page, tipo, nome) {
  await page.locator(tipo === 'cliente' ? '.cliente-menu' : '.barbeiro-menu').getByRole('button', { name: nome, exact: true }).click();
}
const dataBR = data => data.split('-').reverse().join('/');
async function escolherData(page, data) {
  await page.getByRole('region', { name: 'Datas liberadas pelo profissional' }).getByRole('article').filter({ hasText: dataBR(data) }).getByRole('button', { name: 'Selecionar esta data' }).click();
}
async function abrirAgenda(page, data, horario) {
  await menu(page, 'cliente', 'Agendar Horário');
  await page.getByLabel('Barbearia', { exact: true }).selectOption('loja-demo');
  await page.getByLabel('Barbeiro', { exact: true }).selectOption('barbeiro-demo');
  await page.getByLabel('Serviço', { exact: true }).selectOption('corte-demo');
  await escolherData(page, data);
  await page.getByRole('button', { name: horario, exact: true }).click();
}
async function confirmar(page, reagendando = false) {
  await page.getByRole('button', { name: reagendando ? 'Solicitar reagendamento' : 'Solicitar agendamento', exact: true }).click();
  const dialogo = page.getByRole('dialog');
  await expect(dialogo).toBeVisible();
  await expect(dialogo).toContainText('R$');
  await expect(dialogo).toContainText('50,00');
  await expect(dialogo).toContainText('45 minutos');
  await dialogo.getByRole('button', { name: 'Confirmar solicitação' }).click();
  await expect(dialogo).not.toBeVisible();
}
const corte = page => page.locator('.agenda-lista > .ag-card').filter({ hasText: 'Corte Demo' });

test('cliente e barbeiro completam solicitação, decisões, reagendamento, cancelamento e finalização', async ({ browser }) => {
  test.setTimeout(150000);
  const contextoCliente = await browser.newContext();
  const contextoBarbeiro = await browser.newContext();
  const cliente = await contextoCliente.newPage();
  const barbeiro = await contextoBarbeiro.newPage();
  try {
    await entrar(cliente, 'cliente@demo.local', 'cliente');
    await entrar(barbeiro, 'barbeiro@demo.local', 'barbeiro');
    await menu(barbeiro, 'barbeiro', 'Meus Agendamentos');
    await abrirAgenda(cliente, demo.amanha, '09:00');
    await cliente.getByRole('button', { name: 'Solicitar agendamento', exact: true }).click();
    await expect(cliente.getByRole('dialog')).toContainText('Barbeiro Demo');
    await expect(cliente.getByRole('dialog')).toContainText('09:45');
    await cliente.screenshot({ path: '../artifacts/agenda-confirmacao.png' });
    // Revisar não grava agendamento.
    await cliente.getByRole('button', { name: 'Revisar seleção' }).click();
    await expect(corte(barbeiro)).toHaveCount(0);
    await confirmar(cliente);
    await expect(cliente.getByText('Agendamento solicitado! Aguarde a confirmação do barbeiro.', { exact: true })).toBeVisible();
    await menu(cliente, 'cliente', 'Meus Agendamentos');
    await expect(corte(barbeiro).getByRole('status')).toHaveText('Status: Pendente');
    await corte(barbeiro).getByRole('button', { name: 'Aceitar', exact: true }).click();
    await expect(corte(cliente).getByRole('status')).toHaveText('Status: Confirmado');
    await expect(corte(barbeiro).getByRole('button', { name: 'Finalizar corte' })).toBeDisabled();

    // Recusar um pedido preserva o horário original.
    await corte(cliente).getByRole('button', { name: 'Reagendar', exact: true }).click();
    await escolherData(cliente, demo.depois);
    await cliente.getByRole('button', { name: '10:00', exact: true }).click();
    await confirmar(cliente, true);
    await corte(barbeiro).getByRole('button', { name: 'Recusar reagendamento' }).click();
    await expect(corte(cliente)).toContainText(dataBR(demo.amanha));
    await expect(corte(cliente)).toContainText('recusado, horário original mantido');

    // Aceitar o próximo pedido confirma a nova data.
    await corte(cliente).getByRole('button', { name: 'Reagendar', exact: true }).click();
    await escolherData(cliente, demo.depois);
    await cliente.getByRole('button', { name: '10:00', exact: true }).click();
    await confirmar(cliente, true);
    await corte(barbeiro).getByRole('button', { name: 'Aceitar reagendamento' }).click();
    await expect(corte(cliente)).toContainText(dataBR(demo.depois));
    await expect(corte(cliente)).toContainText('aceito, novo horário confirmado');
    cliente.once('dialog', dialogo => dialogo.accept());
    await corte(cliente).getByRole('button', { name: 'Cancelar agendamento' }).click();
    await cliente.getByLabel('Filtrar por status').selectOption('cancelado');
    await expect(corte(cliente).getByRole('status')).toHaveText('Status: Cancelado');

    // O horário liberado volta a ser selecionável; uma recusa também vira histórico.
    await abrirAgenda(cliente, demo.amanha, '09:00');
    await confirmar(cliente);
    await menu(cliente, 'cliente', 'Meus Agendamentos');
    await corte(barbeiro).getByRole('button', { name: 'Recusar', exact: true }).click();
    await cliente.getByLabel('Filtrar por status').selectOption('recusado');
    await expect(corte(cliente).getByRole('status')).toHaveText('Status: Recusado');
    await expect(corte(cliente)).toContainText('Recusado em');

    // Atendimento de ontem pode ser finalizado e o cliente recebe a conclusão.
    await barbeiro.getByLabel('Filtrar por status').selectOption('confirmado');
    const anterior = barbeiro.locator('.agenda-lista > .ag-card').filter({ hasText: 'Atendimento anterior Demo' });
    await anterior.getByRole('button', { name: 'Finalizar corte' }).click();
    await cliente.getByLabel('Filtrar por status').selectOption('concluido');
    await expect(cliente.locator('.agenda-lista > .ag-card').filter({ hasText: 'Atendimento anterior Demo' })).toContainText('Concluído em');
    await cliente.screenshot({ path: '../artifacts/agenda-historico.png', fullPage: true });
  } finally { await contextoCliente.close(); await contextoBarbeiro.close(); }
});

test('formulário e confirmação cabem em tela de celular', async ({ browser }) => {
  const contexto = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, deviceScaleFactor: 1 });
  const page = await contexto.newPage();
  try {
    await entrar(page, 'outro@demo.local', 'cliente');
    await abrirAgenda(page, demo.depois, '14:00');
    await page.getByRole('button', { name: 'Solicitar agendamento', exact: true }).click();
    const dialogo = page.getByRole('dialog');
    await expect(dialogo).toBeVisible();
    const caixa = await dialogo.boundingBox();
    expect(caixa.width).toBeLessThanOrEqual(390);
    expect(caixa.x).toBeGreaterThanOrEqual(0);
    expect(caixa.y).toBeGreaterThanOrEqual(0);
    expect(caixa.y + caixa.height).toBeLessThanOrEqual(844);
    await page.screenshot({ path: '../artifacts/agenda-celular.png' });
    await dialogo.getByRole('button', { name: 'Revisar seleção' }).click();
  } finally { await contexto.close(); }
});
