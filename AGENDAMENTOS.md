# Agendamentos no plano gratuito Spark

O app usa somente Firebase Authentication e Firestore. Não chama Cloud Functions, não exige Blaze e não possui servidor adicional. As operações usam `runTransaction` no SDK do navegador, com validações independentes nas regras do Firestore. Nenhum deploy, mudança de plano ou envio ao GitHub foi feito.

## Ativar com os seus cadastros reais

1. No Console Firebase do projeto **saasbarbe**, abrir **Firestore Database → Regras** e substituir o conteúdo pelo arquivo completo **firestore.rules** desta pasta. Publicar somente essas regras. Isso não exige mudar para Blaze. Não manter a antiga permissão genérica `allow read, write: if request.auth != null`, pois ela anula as restrições específicas.
2. Atualizar a aplicação executada com `npm run dev` na porta habitual. Não ativar `VITE_FIREBASE_EMULATORS` para usar seus dados reais.
3. Entrar uma vez com a conta de cada barbeiro já existente. O painel sincroniza os agendamentos antigos e prepara os calendários; a confirmação pode ser conferida em `disponibilidades/{UID}.agendaPreparada: true`.
4. Entrar como cliente, escolher barbearia, barbeiro, serviço e data; selecionar o horário e confirmar o resumo.

As regras antigas da versão com Functions bloqueavam as gravações diretas; substituí-las é necessário para esta versão. Não é necessário publicar funções, criar chaves de serviço ou colocar credenciais administrativas no React.

O plano Spark possui cotas gratuitas de leituras, gravações e armazenamento; esta solução é compatível com o plano, mas não torna seu uso ilimitado. Não foi habilitado faturamento.

## Como a reserva é protegida

`agendamentos` continua sendo a fonte dos atendimentos. Cada documento de `reservasHorario/{barbeiroUID}_{AAAA-MM-DD}` contém a ocupação de um dia, com 1.440 posições (uma por minuto). Esse índice não contém nomes nem identificadores de clientes. Os serviços de 25 ou 45 minutos ocupam exatamente sua duração, sem limitar o sistema a reservas de meia hora. As opções de início seguem passos de 30 minutos a partir da abertura do expediente.

A transação lê o agendamento, o profissional, o serviço, a disponibilidade e os calendários envolvidos; verifica os conflitos; atualiza o agendamento e os calendários atomicamente. Duas transações concorrentes para o mesmo intervalo disputam o mesmo documento diário. Ao repetir uma transação, a ocupação é lida novamente.

As regras validam:

- Identidade do cliente/profissional/proprietário e os campos que cada ação pode alterar.
- Serviço e profissional vinculados à barbearia, duração e preço reais, sem aceitar metadados arbitrários do navegador.
- Data e timestamps coerentes, horário futuro, expediente, intervalo e exceção de disponibilidade.
- Registro inicial pendente e transições de status permitidas.
- Atualização obrigatória dos calendários na mesma operação, por `getAfter`.
- Delta exato da ocupação: uma alteração não pode apagar, inventar ou deslocar reservas de outro atendimento.
- Campos de identidade, serviço, preço e duração imutáveis nas transições.
- Conclusão apenas após o término previsto e pelo profissional/proprietário autorizado.

O resumo de confirmação mostra profissional, serviço, preço, data, início/fim e duração. O preço/duração são relidos na transação; se mudaram desde o resumo, a confirmação é recusada para revisão. Registros antigos sem preço exibem “Não informado”.

## Estados e reagendamento

Novas solicitações começam como `pendente`; o barbeiro aceita (`confirmado`) ou recusa (`recusado`). Pendentes e confirmados reservam o intervalo completo. Cancelados, recusados e concluídos são terminais e liberam a ocupação. Cancelar exige confirmação visual. A conclusão grava `concluidoEm`; aceite, recusa, cancelamento e decisões de reagendamento também recebem timestamps do servidor.

O pedido de reagendamento fica em `agendamento.reagendamento`, preservando os campos e o status originais. Ambos os horários ficam reservados. Recusar remove somente o novo pedido; aceitar libera o original, move o atendimento e define `confirmado`. O novo horário é revalidado ao aceitar. Cancelar um pedido aberto libera ambos. Não há expiração automática do pedido.

Uma data com `bloqueada: false` prevalece sobre a semana inativa ou não configurada. Uma data com `bloqueada: true` bloqueia o dia. A disponibilidade semanal usa a ordem domingo–sábado; a sincronização inicial normaliza essa ordem. Datas configuradas e agendamentos usam `onSnapshot`, com encerramento das assinaturas ao desmontar.

## Compatibilidade e sincronização inicial

Os IDs aleatórios de `barbeiros` continuam suportados por `usuarioId`. Os serviços continuam em `barbearias/{id}/servicos`. O cliente também admite perfis legados com documento aleatório e `usuarioId`.

Na primeira abertura do painel do barbeiro, `prepararAgendaBarbeiro()` lê e revalida os registros antigos e prepara os calendários. Clientes não podem marcar a agenda de outro profissional como preparada. Enquanto essa etapa não termina, novas reservas ficam bloqueadas, evitando ignorar atendimentos antigos. Depois de preparada, a flag não pode ser desfeita pelo navegador e os calendários só aceitam alterações atômicas correspondentes a um agendamento autorizado.

Esta é uma importação inicial feita pela conta responsável pelo profissional; as regras não conseguem consultar uma coleção inteira para provar a completude de uma importação legada. O cliente comum não tem essa permissão. Após essa etapa, as regras validam toda mutação da agenda, independentemente do React.

Registros antigos precisam de status canônico, `clienteId`, `barbeiroId`, `barbeariaId`, `data`, `horarioInicio` e `horarioFim`. Registros inválidos ou já sobrepostos interrompem a sincronização para revisão, sem apagar dados. Agendas com mais de 400 documentos ou datas exigem importação administrativa em lotes; não há apagamento automático. Os antigos documentos de reserva por horário e a coleção `ocupacaoAgendamentos`, se existirem, não são apagados nem usados pela nova implementação.

O administrador SaaS continua provisionado pelo Console/Admin SDK como `adminsSaas/{UID}`, com `usuarioId: UID` e `ativo: true`. A Home, os menus e o gerenciamento de serviços mantêm seus fluxos. As leituras autenticadas dos diretórios de estabelecimentos/profissionais incluem os campos de seus documentos; informações privadas novas devem ficar separadas dos catálogos.

## Arquivos da implementação

- `src/agendaCore.js`: lógica compartilhada de disponibilidade, intervalos e estados.
- `src/agendaStore.js`: transações Firestore, calendários por minuto, leitura da ocupação e sincronização legada. SDK injetável para testar clientes sujeitos às regras.
- `src/agendaApi.js`: conecta o repositório à sessão autenticada e ao Firestore do app.
- `src/components/AgendarHorarioCliente.jsx`: seleção de barbearia/profissional/serviço/data/horário, orientação das etapas, consulta em tempo real, resumo e envio.
- `src/components/ConfirmarAgendamento.jsx`: modal de revisão antes da gravação.
- `src/components/DatasConfiguradas.jsx`: datas salvas, escolha pelo cliente e edição pelo profissional.
- `src/components/ListaAgendamentos.jsx`: lista compartilhada, filtros, ações, histórico, preço/duração e mensagens em tempo real.
- `src/components/PainelCliente.jsx`, `PainelBarbeiro.jsx` e `GerenciarAgendamentos.jsx`: integração dos fluxos e da sincronização.
- `src/components/Agendamento.css`: componentes da agenda, estados e modal responsivo.
- `src/fireBaseConfig.js`: configuração de Auth/Firestore real ou emulado; Functions foi removido.
- `firestore.rules`: regras completas do sistema e da integridade dos calendários.
- `firebase.json`, `firebase.test.json`, `package.json` e `scripts/iniciar-local.mjs`: execução e emuladores somente Auth/Firestore.
- `functions/package.json`, `package-lock.json`, `playwright.config.js`, `scripts/seed-local.js`, `scripts/preparar-e2e.mjs`, `test/agenda.test.js`, `test/spark.integration.test.js` e `test/browser/agenda.spec.js`: ferramentas locais de teste/demonstração. A pasta conservou o nome antigo `functions`, mas não contém função de produção nem é configurada para deploy. O Admin SDK fica apenas em `devDependencies` e não entra no navegador.
- `.gitignore`: ignora relatórios temporários; capturas ficam em `artifacts/agenda-*.png`.

## Testar localmente sem alterar seu Firebase

Requisitos: Node 22, Java 21 ou superior, dependências da raiz e `npm ci` dentro de `functions`.

Na raiz, `npm run dev:local` inicia somente Auth e Firestore emulados e o Vite em **http://127.0.0.1:5174**. O projeto é `demo-saasbarber`; os dados são separados dos reais e não persistem após encerrar o ambiente. Não muda seu servidor habitual na porta 5173. Entrar primeiro como barbeiro para preparar a agenda de demonstração.

Contas de demonstração: `cliente@demo.local`, `outro@demo.local`, `barbeiro@demo.local`, `dono@demo.local`. Senha: **Demo123456!**. Usar sessões separadas, por exemplo janela normal e anônima, para cliente e barbeiro simultâneos.

Dentro de `functions`:

```sh
npm test
npm run test:integration
npx playwright install chromium
npm run test:e2e
```

Não executar os testes junto com `dev:local`, pois usam as mesmas portas. Os testes de integração usam o SDK web com usuários autenticados e sujeitos às regras; o Admin SDK só prepara/inspeciona as fixtures. Os testes de interface exercitam a aplicação em Chromium desktop e celular com **o emulador de Functions ausente**. As capturas estão em `artifacts/agenda-confirmacao.png`, `agenda-historico.png` e `agenda-celular.png`.

Resultados: 8 testes unitários, 12 cenários de integração (mais o agrupador) e 2 testes de interface aprovados sem Functions. A integração cobriu concorrência com horários idênticos/sobrepostos, preço e identidade forjados, atualização manual sem calendário, tentativa de apagar outra reserva, reagendamento no mesmo dia/entre dias, intervalos, duração de 25 minutos, legado, permissões e preservação dos cadastros.

Build e lint executados. Permanece o aviso preexistente de variável não usada em `GerenciarBarbeiros.jsx` e o aviso de tamanho do bundle. Nenhuma validação ou escrita foi feita nos cadastros reais nesta implementação.
