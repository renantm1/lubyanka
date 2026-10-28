# LUBYANKA — Arquivos da KGB

Jogo de investigação single-player em português brasileiro. Moscou, novembro de 1983. Abra uma pasta, confronte os documentos com o arquivo central e assine um relatório. A recomendação tem consequências humanas e institucionais, mesmo quando a análise das provas está correta.

## Executar

Node.js 24 (versão usada: 24.19.0) e npm. Nenhuma conta, chave de API ou banco de dados é necessário.

```sh
cd /workspace/lubyanka
npm ci
npm run dev
```

O servidor usa a porta 3000. Em uma instalação fora do ambiente Codex, entre na pasta em que clonou o projeto. `nvm use` seleciona a versão indicada em `.nvmrc`, caso use nvm.

Para testar os arquivos de produção:

```sh
npm run build
npm start
```

`npm start` serve a exportação estática `out/`, sem backend de jogo. `PORT` permite mudar a porta. Processos precisam ser reiniciados em uma nova máquina; arquivos e dependências podem ser preservados no snapshot do ambiente.

## Jogar o primeiro caso

1. Escolha **Novo jogo**, entre no departamento e use **Iniciar expediente** na abertura do capítulo. ENTER inicia e ESC pula a abertura. A seed determina os processos complementares.
2. Abra a pasta e fixe o trecho do relatório de Karpov.
3. Abra a carta, rompa o lacre e examine a fotografia. Elas dão contexto, sem comprovar a acusação.
4. Busque **Mirov** no terminal. Abra o livro de ponto de Tula e fixe o registro independente.
5. Abra o quadro, selecione os dois registros sobre a presença de Mirov e proponha uma contradição. Isso libera uma requisição ao laboratório: o laudo de fita aparece no arquivo central. Você decide se deve obtê-lo e citá-lo.
6. Também pode selecionar livremente texto no documento e usar **Fixar seleção**. No quadro, a **Mesa de confronto** permite escolher nomes, datas, horários, referências ou texto completo e registrar sua interpretação. Ela verifica valores presentes nas citações; não interpreta intenção nem deduz culpa. Datas equivalentes, como `31 de outubro` e `31/10/1983`, são reconhecidas.
7. No relatório, escolha sua conclusão, cite pelo menos duas fontes diferentes e escolha a recomendação. Dois trechos do mesmo documento não contam como fontes independentes. A comparação ajuda a investigar, mas não resolve automaticamente o processo.
8. Encerre o expediente e avance. A notícia e a memória do departamento mudam de acordo com a decisão. Abra **Correspondência** nos dias seguintes: uma resposta pode levar vários dias para chegar.

Arraste os papéis pela borda superior. TAB e ENTER navegam pelos controles. **A** abre o arquivo, **T** o terminal, **Q** o quadro, **R** o relatório, **J** a correspondência e **ESC** fecha a janela ou volta ao menu. Em telas pequenas, a mesa pode ser percorrida horizontalmente; as ferramentas e os documentos se adaptam à largura.

O jogo salva no `localStorage` deste navegador. Configurações permitem exportar/importar uma cópia JSON. Uma nova partida substitui o save atual, mas preserva a coleção de documentos, conquistas e finais. Não há sincronização entre dispositivos. Os checkpoints dos capítulos 8, 16 e 24 são locais ao navegador; o arquivo exportado contém a partida atual, sem transportar esses checkpoints anteriores.

## Escopo desta versão 0.5

**Implementado e jogável:**

- Menu, mesa física, documentos arrastáveis, envelopes, fotografias e jornal diário.
- Caso inicial completo, com acusação falsa, álibi no arquivo, comparação de provas, recomendação e consequências persistentes.
- Campanha compacta de **30 dias**, em quatro capítulos, com um processo principal escrito por dia e um processo complementar opcional.
- Oito arquétipos procedurais, com **seis variantes narrativas por arquétipo nas novas partidas**: 48 situações com verdade interna definida antes dos documentos e seeds reproduzíveis. As 24 situações adicionais têm acusações, provas e contextos próprios. A distribuição percorre todas as seis variantes de cada arquétipo em uma rodada de 48 expedientes e evita repetir a última situação na passagem para a rodada seguinte. O formato de investigação ainda é compartilhado.
- Cinco indicadores internos, memória de nove personagens, consequências no dia seguinte e condições acumuladas para os seis finais. Os testes percorrem 30 dias para alcançar cada final.
- Epílogos que consideram relações, detenções e o desfecho; arquivo persistente de descobertas e conquistas.
- Seleção de capítulos via checkpoints, controles de áudio sintetizado, movimento reduzido e modo infinito após um final.
- Publicação inteiramente estática, com fontes, arte SVG e áudio locais.
- Seleção livre de trechos, comparação de nomes/datas/horários/referências e anotações persistentes. As relações semânticas que liberam anexos usam pistas escritas e verificáveis; a comparação livre apenas confronta valores e guarda a interpretação do jogador.
- Anexos próprios para os **30 processos principais**. Nos dias 8–30, o primeiro cruzamento libera o anexo; cruzá-lo com o livro de custódia fundamenta uma segunda requisição, para um parecer especial. Esses pareceres são opcionais e exigem prestígio/confiança ou credenciamento válido. Os dias 16–30 exigem três fontes diferentes no relatório.
- Ramificações efetivas: a custódia de Mirov altera o dia 4; a de Vera altera o dia 9; recrutar Anna altera o dia 12; deter Antonov altera o dia 20; preservar a requisição do dia 5 muda os documentos e a instrução do dia 7.
- Desdobramentos agendados, correspondência legível e efeitos aplicados uma única vez, inclusive após carregar o save. Pedidos de revisão, documentos e investigações retornam dias depois.
- Quatro estágios de dificuldade nos processos complementares e no modo infinito (dias 1, 9, 17 e 25): depoimentos presenciais/indiretos, laudos de procedência e exigência de duas, três ou quatro fontes. A complexidade é limitada ao quarto estágio para manter os casos solucionáveis.
- Ilustrações de ferrovia, fábrica, laboratório e rua, escolhidas pelo contexto, além de diálogos específicos do primeiro capítulo e das novas ramificações.
- Novas rotas nos capítulos seguintes: a denúncia de Petr pode alterar o caso do relógio; recrutar Yuri muda o processo do dia 18; confrontar Volkov muda o dia 23; entregar um endereço muda o dia 24; deter Elena muda a autoria da última edição; negociar com Volkov pode mudar a ordem de descarte do dia 29. As versões dos anexos acompanham o processo selecionado.
- Nove conversas com compromissos registrados: proteção familiar, circulação de dados, promoção, cópias, abrigo, colaboração com Volkov, segunda passagem, revisão editorial e destino das vias. As opções têm custos e requisitos verificáveis, não podem ser repetidas para acumular benefícios e podem produzir novos documentos. Contatos detidos em dias anteriores não oferecem novas conversas reservadas.
- Pressão institucional em três eventos, disparados uma vez por partida: confiança abaixo de 25 abre sindicância; paranoia a partir de 65 provoca vigilância; prestígio a partir de 65 com confiança a partir de 35 concede uma janela de credenciamento. Cada ordem tem prazo e respostas na correspondência. A sindicância suspende recrutamento, omissão e pareceres especiais; a vigilância aumenta a exposição ao recrutar; a credencial permite consultas sem o requisito normal de prestígio. As provas essenciais continuam disponíveis.
- Aberturas dos quatro capítulos, com avanço por mouse/teclado e estado salvo; encerramentos com documento visual próprio, epílogos específicos dos nove personagens, relatos de civis e histórico das assinaturas. Prisões e libertações posteriores, dados familiares e compromissos editoriais influenciam esses textos.
- Efeitos locais de papel, envelope, carimbo e telefone, respeitando som e volume; iluminação por período do expediente e movimento reduzido para as animações ambientais.
- Diligências opcionais nos dias **1, 3, 8, 17, 22 e 28**, pelo arquivo, terminal ou telefone. São **12 fontes escritas**, com uma escolha de via por processo. A formal exige ler a declaração, acrescenta 3 de exposição e 1 de confiança da chefia; a reservada exige ler o depoimento, contato livre e confiança mínima de 40, acrescenta 1 de exposição e reduz em 2 a confiança da chefia e do contato. A sindicância e a pausa de contatos suspendem a via reservada; vigilância acrescenta 2 de exposição a ambas. Os valores aparecem antes da escolha.
- A diligência entrega uma fonte adicional no mesmo expediente. Corroborá-la com o registro independente abre um caminho alternativo para o anexo, sem escolher a conclusão pelo jogador. A opção anterior continua disponível. Dois dias depois chega um retorno próprio: a via formal acrescenta 1 de paranoia, a reservada 1 de integridade. A escolha, a fonte e os efeitos persistem e não podem ser repetidos. No processo alternativo de Daria, confirmar os nomes da lista não apaga a autoria da impressão.
- Linha interna acessível pelas ferramentas em telas pequenas, para consultar contatos e participar das conversas mesmo quando a barra lateral está recolhida.
- No **Arquivo Infinito das novas partidas**, sindicância, vigilância e credenciamento podem voltar após pelo menos 12 expedientes desde a ordem anterior do mesmo tipo, quando os indicadores ainda justificam a medida e a janela anterior terminou. Há três textos de comunicado por tipo, alternados nas rodadas; custos e requisitos continuam explícitos. A campanha mantém uma ocorrência de cada evento.
- Cada rodada institucional tem documento, prazo e resposta próprios. Uma ordem nova não reabre o prazo de uma antiga nem reaplica sua resposta. A correspondência identifica ordens vencidas; a pausa de contatos também funciona nas rodadas renovadas. O cabeçalho do Arquivo Infinito mostra o número real do expediente.
- Nas novas partidas, os laudos procedurais opcionais a partir do terceiro estágio exigem prestígio 65 e confiança 35. O credenciamento dispensa o prestígio durante a janela, sem dispensar a confiança nem o cruzamento das fontes. Os quatro documentos necessários ao relatório continuam acessíveis sem esse laudo.

Saves das versões 0.1–0.4 são migrados sem apagar decisões, estatísticas, documentos ou checkpoints. Partidas sem versão de regras conservam o catálogo original de 24 variantes e a política institucional de uma ocorrência: um processo aberto não troca de provas após atualizar. Novas partidas usam o catálogo de 48 variantes e a renovação institucional no Arquivo Infinito. Campos anteriores começam sem restrições, diligências retroativas ou reapresentação de capítulos antigos. A pressão é avaliada nas manhãs seguintes; consequências são agendadas por relatórios e diligências novos. Casos futuros da campanha podem seguir ramificações a partir das escolhas salvas.

**Ainda pendente para a experiência completa do documento mestre:**

- Expandir a liberdade de investigação, com mais suspeitos por processo e diligências em outros dias. Há agora duas vias alternativas em seis processos; elas corroboram fatos por fontes distintas, mas ainda não criam conclusões inteiramente novas. A apresentação e o fluxo principal compartilham modelos.
- Variar mais a composição dos documentos e substituir as ilustrações por material visual mais elaborado quando apropriado.
- Acrescentar arquétipos, variantes e tipos de acontecimentos ao modo infinito. As novas partidas têm 48 situações, quatro estágios e três tipos de evento institucional recorrente; o conteúdo escrito continua finito e as rodadas reaproveitam modelos.
- Acrescentar mais encontros e rotas inteiramente diferentes por capítulo. Há conversas e ramificações reais, mas a campanha ainda converge para a cadeia central do Zarya.
- Aprofundar a encenação de objetos e as sequências finais; acrescentar trilha composta, animação completa de abertura de pasta e revisão histórica/editorial.
- Revisar acessibilidade com tecnologias assistivas, testar outros navegadores e realizar testes extensos com jogadores. A validação automatizada de interface usa Chromium.

A campanha é jogável até o dia 30, com seis finais alcançáveis, conteúdo adicional em todos os dias e consequências persistentes. A versão 0.5 ainda não representa o acabamento completo de todo o escopo premium do documento mestre.

## Verificar

```sh
npm test
npm run typecheck
npm run build
npm run test:e2e
```

Os testes de navegador usam o build de produção; execute `build` antes. O runner inicia e encerra seu próprio servidor na porta 3000; pare outro servidor que ocupe essa porta. No ambiente preparado, Chromium está em `/usr/bin/chromium`. Em outro sistema, instale-o com `npx playwright install chromium` ou indique `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. Essa variável seleciona um executável local, não contém credenciais.

Os testes unitários validam geração determinística, 1.920 casos do catálogo original e 1.536 do novo catálogo, as 48 variantes, cronologia, comparação, ações inválidas, progressão, custos humanos, save e os seis percursos completos de finais. A expansão do Arquivo Infinito verifica rodadas sem repetição, cinco casos de referência executados no código publicado em 0.4, uma simulação de 120 dias, prazos independentes, respostas por rodada e renovação idempotente. As outras suítes cobrem ramificações, anexos em duas etapas, seleções livres, consequências, conversas, epílogos, diligências e migração. Os testes de navegador percorrem o primeiro caso e os 30 dias, verificam o modo infinito, save, arraste, teclado, configurações e tela pequena, além de selecionar texto, comparar datas, consultar pareceres, responder à sindicância, produzir uma revisão editorial e usar diligências. Os novos fluxos verificam um caso inédito com quatro fontes, uma sindicância renovada e a importação de uma partida 0.4. Não são uma garantia de equilíbrio narrativo ou de qualidade de todos os textos.

## Organização

- `src/game/engine.ts`: progressão, decisões, indicadores, relações e finais.
- `src/game/case-generator.ts`: arquétipos, PRNG e validador de consistência.
- `src/content/procedural-expansion.ts`: 24 situações adicionais, distribuídas apenas nas novas partidas para preservar o catálogo dos saves antigos.
- `src/game/document-generator.ts`: documentos derivados da verdade interna.
- `src/game/world.ts`: notícias históricas e consequências ficcionais separadas.
- `src/game/evidence.ts`: seleção livre, origem das citações, requisições e comparação de valores.
- `src/game/consequences.ts`: agendamento e entrega idempotente dos desdobramentos.
- `src/game/institution.ts`: prazos, restrições e respostas às ordens institucionais.
- `src/game/contacts.ts`: disponibilidade dos contatos conforme a custódia registrada.
- `src/game/inquiries.ts` e `src/content/inquiries.ts`: requisitos, custos, fontes das diligências, caminhos alternativos e retorno agendado.
- `src/content/branching.ts`, `investigations.ts` e `dialogue.ts`: processos alternativos, anexos e falas contextuais.
- `src/content/later-investigations.ts`, `meetings.ts` e `epilogues.ts`: capítulos seguintes, compromissos das conversas e destinos específicos.
- `src/game/save-system.ts` e `store.ts`: formato validado, armazenamento e estado Zustand.
- `src/content/`: personagens, capítulos e 30 processos principais.
- `src/components/`: mesa, documentos, modais e ilustrações vetoriais.
- `tests/`: testes do motor e da interface.

Para novos conteúdos, defina primeiro a verdade, a alegação, o registro independente e o contexto humano. Depois gere os documentos e execute o validador. Não esconda a prova necessária atrás de uma condição de acesso impossível.

## Publicar

O workflow `.github/workflows/pages.yml` publica automaticamente no **GitHub Pages** a cada envio para `main`. Ele instala com o lockfile, executa os testes do motor e de TypeScript, compila com o caminho fornecido pelo Pages, percorre o jogo no Chromium e só então publica o artefato `out/`. As ações são fixadas por SHA de versões oficiais.

No GitHub, **Settings → Pages → Build and deployment → Source** precisa estar em **GitHub Actions**. Essa ativação inicial exige administração do repositório; o token automático de um workflow não pode ativar Pages pela primeira vez. Não são necessários secrets personalizados. O workflow também pode ser iniciado em **Actions → Publicar Lubyanka no GitHub Pages → Run workflow**. O endereço padrão deste repositório é `https://renantm1.github.io/lubyanka/`; a execução concluída fornece o endereço efetivo.

Para reproduzir localmente a publicação em subdiretório:

```sh
NEXT_PUBLIC_BASE_PATH=/lubyanka npm run build
SITE_BASE_PATH=/lubyanka npm run test:e2e
SITE_BASE_PATH=/lubyanka npm start
```

O último comando serve o jogo em `/lubyanka/`. Para voltar ao endereço local na raiz, recompile sem `NEXT_PUBLIC_BASE_PATH`. O valor é aplicado durante o build.

Também é possível usar outra hospedagem estática: `npm ci && npm run build` gera `out/` para a raiz do domínio quando a variável não está definida. Publique **todo o conteúdo de `out/`** (por exemplo, em Cloudflare Pages ou Netlify). Configuração: comando de build `npm run build`, diretório publicado `out`, Node 24.

Não envie somente o HTML: `_next/` contém scripts, estilos e fontes necessários. Não há funções de servidor nem variáveis secretas para configurar. Use HTTP/HTTPS; abrir `index.html` diretamente por `file://` não é suportado. Adicionar o workflow ou enviar um commit não comprova a publicação: confirme o resultado da execução e abra o endereço do site.

## Contexto e atribuições

Personagens e casos são ficcionais. O projeto Zarya é uma invenção narrativa. As notícias históricas têm datas próprias em `world.ts`; jornais também incluem material ficcional explicitado no código. A obra reconhece os efeitos de repressão, censura e desaparecimentos, sem apresentar prestígio institucional como virtude moral.

Fontes locais: Cormorant Garamond (Christian Thalmann) e IBM Plex Mono (IBM), sob SIL Open Font License; as licenças acompanham os pacotes `@fontsource`. Ilustrações SVG e áudio sintetizado foram criados para esta implementação. Não são reproduções de fotografias históricas.
