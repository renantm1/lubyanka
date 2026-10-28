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

1. Escolha **Novo jogo** e entre no departamento. A seed determina os processos complementares.
2. Abra a pasta e fixe o trecho do relatório de Karpov.
3. Abra a carta, rompa o lacre e examine a fotografia. Elas dão contexto, sem comprovar a acusação.
4. Busque **Mirov** no terminal. Abra o livro de ponto de Tula e fixe o registro independente.
5. Abra o quadro, selecione os dois registros sobre a presença de Mirov e proponha uma contradição.
6. No relatório, escolha sua conclusão, cite pelo menos duas evidências e escolha a recomendação. A comparação ajuda a investigar, mas não é uma chave que resolve automaticamente o processo.
7. Encerre o expediente e avance. A notícia e a memória do departamento mudam de acordo com a decisão.

Arraste os papéis pela borda superior. TAB e ENTER navegam pelos controles. **A** abre o arquivo, **T** o terminal, **Q** o quadro, **R** o relatório e **ESC** fecha a janela ou volta ao menu. Em telas pequenas, a mesa pode ser percorrida horizontalmente; as ferramentas e os documentos se adaptam à largura.

O jogo salva no `localStorage` deste navegador. Configurações permitem exportar/importar uma cópia JSON. Uma nova partida substitui o save atual, mas preserva a coleção de documentos, conquistas e finais. Não há sincronização entre dispositivos. Os checkpoints dos capítulos 8, 16 e 24 são locais ao navegador; o arquivo exportado contém a partida atual, sem transportar esses checkpoints anteriores.

## Escopo desta versão 0.1

**Implementado e jogável:**

- Menu, mesa física, documentos arrastáveis, envelopes, fotografias e jornal diário.
- Caso inicial completo, com acusação falsa, álibi no arquivo, comparação de provas, recomendação e consequências persistentes.
- Campanha compacta de **30 dias**, em quatro capítulos, com um processo principal escrito por dia e um processo complementar opcional.
- Oito arquétipos procedurais, com **três variantes narrativas por arquétipo**, verdade interna definida antes dos documentos e seeds reproduzíveis. As variantes têm provas, motivações e situações diferentes; o formato de investigação ainda é compartilhado.
- Cinco indicadores internos, memória de nove personagens, consequências no dia seguinte e condições acumuladas para os seis finais. Os testes percorrem 30 dias para alcançar cada final.
- Epílogos que consideram relações, detenções e o desfecho; arquivo persistente de descobertas e conquistas.
- Seleção de capítulos via checkpoints, controles de áudio sintetizado, movimento reduzido e modo infinito após um final.
- Publicação inteiramente estática, com fontes, arte SVG e áudio locais.

**Ainda pendente para a experiência completa do documento mestre:**

- Expandir os dias 2–30: já são funcionais e têm dilemas próprios, mas usam um formato compacto de documentos. Faltam cenas mais extensas, rotas exclusivas e encontros mais variados.
- Aprofundar a investigação com comparações livres de nomes/datas, seleção livre de texto, transcrições, laudos e cadeias com várias etapas. Nesta versão os trechos destacáveis são escritos previamente.
- Variar mais a composição e apresentação dos documentos. As fotografias são ilustrações locais; o anexo ferroviário ainda é compartilhado nos casos posteriores.
- Implementar dificuldade crescente no modo infinito, maior diversidade de situações, eventos de paranoia mais elaborados e bloqueios de acesso que alterem investigações.
- Expandir diálogos e atrasos de consequências além do dia seguinte. Hoje relações e indicadores afetam falas, feedback e finais, mas não substituem a maioria dos processos diários.
- Aprofundar os epílogos individuais e a encenação dos capítulos/finais; adicionar animação específica de abertura de pasta, trilha e revisão histórica/editorial.
- Revisar acessibilidade com tecnologias assistivas, testar outros navegadores e realizar testes extensos com jogadores. A validação automatizada de interface usa Chromium.

O motor alcança o dia 30 e os seis finais, mas esta entrega é a **primeira versão jogável**, não a conclusão de todo o escopo premium do projeto.

## Verificar

```sh
npm test
npm run typecheck
npm run build
npm run test:e2e
```

Os testes de navegador usam o build de produção; execute `build` antes. O runner inicia e encerra seu próprio servidor na porta 3000; pare outro servidor que ocupe essa porta. No ambiente preparado, Chromium está em `/usr/bin/chromium`. Em outro sistema, instale-o com `npx playwright install chromium` ou indique `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. Essa variável seleciona um executável local, não contém credenciais.

Os testes unitários validam geração determinística, 1.920 casos, as 24 variantes, cronologia, comparação, ações inválidas, progressão, custos humanos, save e os seis percursos completos de finais. Os cinco testes de navegador investigam o primeiro caso, percorrem os 30 dias até um epílogo e o modo infinito, recuperam o save, verificam a posição dos papéis após arraste, exercitam documentos/teclado/configurações e verificam a tela pequena. Não são uma garantia de equilíbrio narrativo ou de qualidade de todos os textos.

## Organização

- `src/game/engine.ts`: progressão, decisões, indicadores, relações e finais.
- `src/game/case-generator.ts`: arquétipos, PRNG e validador de consistência.
- `src/game/document-generator.ts`: documentos derivados da verdade interna.
- `src/game/world.ts`: notícias históricas e consequências ficcionais separadas.
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
