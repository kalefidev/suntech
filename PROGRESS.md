# PROGRESS (v2)

Estado do projeto SunTech. Leia antes de continuar qualquer fase: evita
repetir decisões já tomadas ou reabrir debates resolvidos. O plano aprovado
está em `docs/fase-0.md`; o brief, em `BRIEF.md`.

## Linha do tempo

- **27/09:** v1, com o brief antigo. Commit `856ae2f` na branch `master`, que
  fica intocada para comparação.
- **28/09:** prompt novo (o `BRIEF.md` atual). Fase 0 da v2 aprovada; a Fase 1
  começou na branch `v2`.
- **01/10:** Fase 0 revisada (M1 a M8) e aprovada; a Fase 1 avançou.
- **02/10:** Fases 1, 2 e 3 fechadas.
- **02/10 (tarde):** Fase 4 (Parte 3) fechada.

## Respostas do usuário (valem daqui para a frente)

- **Público, nesta ordem:** avaliadores; visitantes pelo QR code no celular;
  apresentadores do estande; clientes do desenvolvedor (`PRODUCT.md`).
- **F8:** a frase "O custo não inclui mão de obra..." fica de fora.
- **Portfólio:** `https://site.kaiquecalefi.online` (`src/config.ts`).

## Fase 0: plano (aprovado em 01/10/2026)

Tudo em `docs/fase-0.md`. As mudanças em relação ao plano de 28/09:

| # | Decisão |
|---|---|
| M1 | A coreografia é uma timeline mestre do GSAP montada de `scene/choreography.ts` (`lib/tracks.ts`), percorrida por um único ScrollTrigger |
| M2 | Nenhum respiro vazio: as 3 travessias da zona morta acontecem dentro das cenas presas; a 3c é lida na manhã seguinte, com texto escuro |
| M3 | "Como funciona": as 4 etapas aparecem numeradas e legendadas desde 10% do pin, acendem até 70%, e de 70% a 100% o circuito funciona junto |
| M4 | O `snap` mede o contraste nos pixels reais (foto sem texto); saiu o modelo em TypeScript que copiava o shader |
| M5 | A guarda de contraste do shader nunca escurece o disco do sol nem o brilho em volta |
| M6 | Celular com `deviceMemory` ≤ 4 GB ou ≤ 4 núcleos entra no tier baixo |
| M7 | Receita de estúdio para o aceite da Fase 2 (`docs/fase-0.md`, item 6) |
| M8 | O modo pitch é testado com `page.clock` do Playwright |

## Fase 1: fundação (fechada em 02/10/2026)

Feito:
- Fonte (Archivo com `wdth`, preload), tokens no `@theme`, escala
  tipográfica e superfícies do navegador (`src/index.css`).
- Lenis sincronizado com o GSAP (`lib/lenis.ts`), desligado com reduced
  motion; `useReducedMotion` reativo.
- `sceneState` com todos os campos da seção 5 (`scene/state.ts`).
- `daylight.ts`: keyframes do céu por hora, tempestade, posição do sol por
  aspecto de tela, crossfade entre céus (`mixSky`) e tom do texto.
- Céu em shader (`shaders/sky.*`): gradiente, sol, brilho, nuvens fbm por
  tier, estrelas, guarda de contraste e grão estático. Saltos de mais de 6 h
  (e toda troca com reduced motion) viram um crossfade de 0,35 s.
- Registro de seções com `data-section`, `?goto`, `?nowebgl`, `?snap` e
  `?debug` (`lib/sections.ts`, `lib/env.ts`).
- Timeline mestre (M1) e as 3 travessias dentro das cenas (M2).
- Tiers de qualidade com `PerformanceMonitor` e a regra de entrada (M6).
- Loader com progresso real e abertura provisória (o céu nasce); a Fase 2
  soma o produto.
- Todas as seções com o texto real das aulas (checklist da seção 15 no DOM),
  header com as 6 âncoras, "N de 6" e menu do celular.
- Fallback sem WebGL (céu em CSS seguindo a hora e diagrama SVG).
- `snap` v2 (M4) e conteúdo da seção 3 em `src/content/`.
- `PRODUCT.md` (público v2), `DESIGN.md` com `.impeccable/design.json`,
  `CLAUDE.md` e este arquivo.

### Decisões técnicas (não repetir o caminho)

- **`state.ts`, `choreography.ts`, `daylight.ts` e `tracks.ts` não importam
  `three`.** Entram no chunk inicial. Na v1, um `THREE.Vector3` no
  `state.ts` levou o JS inicial de ~126 para ~223 KB gzip.
- **Plugins de texto sob demanda:** só o núcleo do GSAP e o ScrollTrigger
  entram no chunk inicial. SplitText, CustomEase e DrawSVG carregam com
  `loadTextPlugins()` (`lib/split.ts`), que também registra a curva de
  revelação `suntechReveal`.
- **Canvas em `z-index: -1`.** Um `fixed` com `z-index: 0` pinta por cima do
  conteúdo não posicionado. Tudo que precisa ficar acima do canvas leva
  `position` + `z-index` positivo.
- **Marcador `data-section` nunca num componente que desmonta** (bug da v1
  com o overlay da abertura).
- **Guarda de contraste:** no desktop, a rampa horizontal é larga (de 0,5 a
  0,85 da largura); uma rampa curta desenhava uma faixa escura no céu. No
  celular (`guardX0` 2), ela cobre a tela toda, mas solta o sol e o brilho
  em volta (M5).
- **Horizonte no celular a 0,56 da altura:** o sol nasce atrás do produto,
  acima do texto. A linha do loader acompanha (44% a partir do topo).
- **`dayTime` em horas contínuas** (4,5 a 65,7). Saltos maiores que 6 h no
  céu são crossfade, não varredura.
- **`?snap` força DPR 1:** o SwiftShader renderiza na CPU.
- **Total de custos** sai da soma da tabela (`product.costTotalBRL`).
- `npm install` avisa de peer-dependency por causa do `r3f-perf` (que só
  carrega com `?debug`); não afeta o build.

### Medições da Fase 1

| Medida | Valor |
|---|---|
| JS inicial (gzip) | 131,6 KB (teto 150) |
| Chunk da cena (`SceneCanvas`, gzip) | 241,9 KB |
| JS total sem o debug (gzip) | 373,5 KB (teto 500) |
| CSS (gzip) | 6,6 KB |
| LCP / CLS (1440×900, SwiftShader) | 484 ms / 0 |

Sobram uns 126 KB de JS para o produto, o CSM, o pós-processamento e os
plugins de texto.

### `snap` da Fase 1 (`.snapshots/fase-1/`)

| Passada | Erros de console | Violações de contraste | WebGL | LCP | CLS |
|---|---|---|---|---|---|
| 1440×900 | 0 | 0 | sim | 484 ms | 0 |
| 390×844 | 0 | 0 | sim | 220 ms | 0 |
| 1440×900 reduced motion | 0 | 0 | sim | 356 ms | 0 |
| 390×844 reduced motion | 0 | 0 | sim | 200 ms | 0 |
| TV 1920×1080 | 0 | 0 | sim | 232 ms | 0 |
| 1440×900 `?nowebgl` | 0 | 0 | não (esperado) | 204 ms | 0 |

Aceite da Fase 1 cumprido: o céu passa por todas as horas e pela tempestade;
build limpo; imagens por seção; zero violação de contraste, zero erro e
WebGL ligado em toda imagem fora do `?nowebgl`.

### Crítica de design e revisão de motion

`impeccable critique` (rodada em contexto único, sem subagentes, com o
detector depois da avaliação) em `.impeccable/critique/`: **20/28 (71%,
bom)**. O detector não achou anti-padrão; só avisos de tamanho fora da
escala (o 1rem virou o passo "UI" no `DESIGN.md`). Corrigido nesta fase, e
conferido em `.snapshots/fase-1-fix/`:

- **Header encavalado no texto** no desktop: agora sai ao rolar para baixo em
  toda tela, volta ao subir e com o foco do teclado.
- **Arco dourado fino no céu do fim de tarde:** a guarda de contraste (texto
  escuro) misturava com o horizonte por uma divisão que saltava de 0 a 1 onde
  o céu tinha a luminância do horizonte. O divisor ganhou um piso de 0,05.
- **Grids quebrados:** a classe `.block` colidia com o utilitário `block` do
  Tailwind (`display: block`), desmontando o manifesto e a persona. Virou
  `.part-block`. **Lição:** classe própria nunca com nome de utilitário do
  Tailwind.
- Título de capítulo limitado à coluna de texto; "O sol se põe. / A energia
  fica." em duas linhas.

Revisão de motion (skill do Emil): com reduced motion, o header some só com
opacidade; hover do nav e do CTA só com `pointer: fine`; barra de progresso
em 300 ms.

Ficam para as fases seguintes (registrados na crítica):
- Fase 3: metade direita do desktop vazia nas Partes 1, 2 e 3a; espaço entre
  blocos vindo do conteúdo (hoje 18svh em tudo); "Seu Antônio" como título e
  "Persona" como legenda; link "Pular para o conteúdo".
- Fase 6: a palavra "empreendedorismo" passa um pouco da coluna no título do
  capítulo 6, no desktop.

## Fase 2: o produto, a abertura e o hero (02/10/2026)

Feito:
- **Produto procedural** (`scene/Product/`), parametrizado pelo `product.ts`
  (`dimensions.ts`, 1 unidade = 100 mm):
  - painel dobrável em pé, com a lombada na vertical: duas placas que abrem
    como um livro (`panelOpen`), moldura de alumínio anodizado com bisel,
    células em `CanvasTexture` com clearcoat fazendo o papel do vidro,
    dobradiças, pezinhos de borracha e caixa de junção;
  - caixa: corpo em aro (oco, para a Fase 4 abrir a tampa), tampa com
    dobradiça atrás (`lidOpen`), fresta, pés, parafusos, USB-A e USB-C com
    carcaça metálica, chave, LED com lente (`ledOn`) e "SunTech" em
    baixo-relevo (mapa de normais gerado do texto);
  - cabo do painel até a caixa (`TubeGeometry` sobre Catmull-Rom), refeito só
    quando o painel se mexe e desenhado ao longo do comprimento
    (`panelCable`).
- **Texturas em canvas** (`scene/textures/`), geradas uma vez no tier de
  entrada: células (cor + mapa com máscara, rugosidade e metal), logo, placas
  TP4056/DW01 e boost, rótulo das 18650. Os nomes e números das texturas saem
  do `product.ts` (`battery.format` e `diode` entraram lá).
- **CSM** nas células: reflexo da abertura (`glint`) e brilho com o sol
  (`irradiance`).
- **Estúdio:** `StudioEnvironment` próprio em PMREM (softbox acima, faixa
  baixa à frente para o vidro, softbox atrás para o tampo, tiras laterais e
  preenchimento frio); sol direcional e hemisférica pela hora
  (`daylight.sceneLight`); sombra de contato própria (`ContactShadow`).
- **Câmera** (`CameraRig`) com deslocamento de lente (`sx`, `sy`): o produto
  fica à direita no desktop e em cima no celular sem mudar a perspectiva.
- **Abertura completa** (`lib/opening.ts`): madrugada com o produto em
  silhueta, o primeiro raio de sol (`LightShaft`, feixe aditivo que nunca
  entra na coluna de texto), o painel abrindo como um livro, o reflexo nas
  células, o cabo ligando o painel à caixa e o nome subindo da máscara.
  Pula para o fim com qualquer gesto.
- **Coreografia do produto e da câmera** no mapa de scroll, com chaves
  `narrow` para o layout empilhado. Hero: 3/4, girando com o scroll e
  inclinando com o ponteiro (no toque, com a velocidade do scroll). Parte 1:
  o produto vai para o fundo e some numa névoa da cor do horizonte. No
  celular, o produto sobe junto com o hero (o texto rola por cima do canvas).

### Decisões técnicas da Fase 2 (não repetir o caminho)

- **`setViewOffset` muda o aspecto da câmera** para `fullWidth/fullHeight`:
  passar a tela real (largura e altura), nunca (1, 1).
- **O R3F copia o objeto `uniforms`** do `<shaderMaterial>`: escrever sempre
  em `material.uniforms` pelo ref (valores reatribuídos no objeto original
  não chegam ao material).
- **Nunca `pow(x, 2.0)` em GLSL com `x` negativo** (indefinido; virava NaN no
  SwiftShader): usar `x * x`.
- **Sombra de contato:** o plano do desfoque fica dentro do campo da câmera da
  sombra (no drei ele fica na origem do mundo e só funciona com a sombra
  abaixo do chão), e o alvo é limpo com alfa 0 (o canvas é opaco). Só
  re-renderiza quando o produto se mexe.
- **Antialias nativo ligado:** sem ele, o produto serrilhava em DPR 1. Na Fase
  7, o composer decide se precisa de MSAA próprio.
- **Sumir com o produto é névoa, não transparência:** `productVisible` controla
  uma `FogExp2` da cor do horizonte (sem problema de ordenação).
- **`react/immutability` do oxlint desligada só em `src/scene`:** mutar
  objetos do three no `useFrame` é o padrão do R3F.
- **Ganchos de teste** (só em dev e com `?snap`): `window.__scene` (o
  `sceneState`) e `window.__three` (a cena); `?slowmo=N` desacelera as
  timelines (para fotografar a abertura no SwiftShader).
- **Desvio do plano:** o interior da caixa (placas, bateria, fios e diodo)
  foi para a Fase 4, junto com a explosão, onde aparece e é conferido. As
  texturas dele já existem.

### `snap` da Fase 2 (`.snapshots/fase-2/`) e medições

| Passada | Erros | Contraste | WebGL | LCP | CLS |
|---|---|---|---|---|---|
| 1440×900 | 0 | 0 | sim | 264 ms | 0 |
| 390×844 | 0 | 0 | sim | 228 ms | 0 |
| 1440×900 reduced motion | 0 | 0 | sim | 188 ms | 0 |
| 390×844 reduced motion | 0 | 0 | sim | 176 ms | 0 |
| TV 1920×1080 | 0 | 0 | sim | 228 ms | 0 |
| 1440×900 `?nowebgl` | 0 | 0 | não (esperado) | 2.660 ms* | 0,017* |

\* Rodou ao mesmo tempo que outras fotos (CPU disputada): a fonte chegou
tarde, e o `font-display: block` segurou o texto e mexeu o layout na troca.
Nas outras passadas, LCP < 300 ms e CLS 0. É o risco "fonte tardia no 4G" do
plano (`docs/fase-0.md`, item 8): **rever na passada de performance da Fase 7**
(plano B: `swap` com fallback de métricas ajustadas).

JS gzip: inicial 133,1 KB (teto 150); cena 255,0 KB; total 388,1 KB (teto
500). O produto inteiro custou 13 KB no chunk da cena.

Crítica (`.impeccable/critique/`): 21/28 (75%, bom). Checklist da receita de
estúdio cumprido no screenshot do hero (bordas com brilho, nenhuma face
chapada, sombra de contato, sem serrilhado em DPR 1, preto lido como
material). Revisão de motion da abertura: uma vez por visita, 2,4 s, pulável
com qualquer gesto; eases coerentes (ease-out ao entrar, ease-in-out no que
se move na tela); nada a corrigir.

### Fontes externas (F9), revalidadas no navegador em 02/10/2026

Todas no ar e sustentando o texto do site: Poder360/IEMA (990.103, estudo
divulgado em 26/11/2019), Idec (o endereço redireciona para "Amazônia Legal no
escuro"; o apagão no Amapá começou em 3 de novembro e passou de 20 dias),
Earthshot e d.light (Stanford, querosene, pagamento pelo celular). **A d.light
hoje fala em 215 milhões de vidas (e a Earthshot, em 175 milhões); o site diz
"mais de 150 milhões", da seção 3, que continua verdadeiro.**

## Fase 3: Partes 1 e 2 (02/10/2026)

Feito:
- **Aberturas de capítulo** (`ChapterOpener`): o numeral sobe da máscara com o
  scroll (ease linear no scrub) e o título sobe por linhas ao entrar na tela
  (SplitText por linha com máscara e `autoSplit`, depois das fontes). O título
  tem o nome completo no `aria-label` ("Parte 1: O problema").
- **Revelações** em `lib/reveal.ts` (`useLineReveal`, `useScrubFrom`,
  `useCountUp`, `useDrawOnScroll`), todas com `gsap.matchMedia` (nada se
  mexe com reduced motion).
- **Contadores** (990.103 e 20 dias): o valor final fica no DOM o tempo todo e
  segura a largura; a contagem corre por cima.
- **Destaques** (`Highlight`): situação-problema e frase-síntese, depois da
  pausa longa, com as linhas subindo da máscara.
- **Composição sem metade vazia** no desktop (achado P2 da crítica da Fase 1):
  coluna larga (`.col-wide`, até 88vw) nas oportunidades e nas três respostas
  em colunas, no destaque, no porquê (os dados com fonte à direita, com a
  ordem do brief no DOM), na persona (monograma à direita e os 40 km cruzando
  a tela) e em persona × público-alvo.
- **Espaço vindo do conteúdo:** blocos a `clamp(4.5rem, 12svh, 8rem)`, pausa
  longa (`.part-block--pause`) só antes dos destaques.
- **"Seu Antônio" como título** e "Persona" como legenda.
- **Pular para o conteúdo** (link que aparece com o Tab).
- A linha dos 40 km cresce com o scroll.
- **Guarda de contraste com largura coreografada** (`guardWide`): cobre a tela
  toda nas partes em coluna larga (1, 2 e 3a) e só a coluna de texto nas
  cenas do produto. Abre no fim do hero e fecha na travessia do nascer do sol.
  O `snap` achou a falta dela (2,7:1 na terceira coluna, sobre o brilho do
  nascer do sol).
- O produto sai mais cedo na Parte 1 (aos 12%).
- `?snap` acelera 3× as animações por tempo (as fotos pegam o estado final);
  o `snap` aceita `--url=` (fotografa um servidor já no ar).

### Decisões técnicas da Fase 3

- **SplitText e acessibilidade:** `aria: "auto"` só em elementos que aceitam
  `aria-label` (títulos); em `span` o rótulo é ignorado. Nos títulos de
  capítulo, o `aria-label` é nosso e o SplitText só esconde as linhas
  (`aria: "hidden"`); nas citações longas, `aria: "none"`.
- **Linha reta cresce em `scaleX`, não com DrawSVG:** o DrawSVG com
  `non-scaling-stroke` e `preserveAspectRatio="none"` desenhou a linha em
  pedaços. O DrawSVG fica para as linhas curvas (callouts da Fase 4 e a linha
  do tempo do pitch).
- **`type-body` tem teto de 65ch:** listas em colunas precisam de
  `max-width: none`, senão as colunas ficam estreitas.
- Ação de teclado não anima: o link "Pular" e o header com foco aparecem na
  hora.

### `snap` da Fase 3 (`.snapshots/fase-3/`)

As seis passadas sem erro e sem violação de contraste: LCP de 176 a 280 ms,
CLS 0, WebGL em todas menos `?nowebgl` (esperado). JS gzip: inicial 133,9 KB,
total 397,3 KB.

## Fase 4: Parte 3, a solução (02/10/2026)

Feito:
- **"Por dentro":** a tampa abre e o interior se separa por peça
  (`Product/motion.ts`: janela, deslocamento e giro de cada uma), com a
  bateria (2× 18650, carga em verde no CSM), as placas do controlador e do
  boost, o diodo, a fiação e as camadas do painel (vidro, células e base).
  Callouts no DOM (`CalloutLayer` + projetor na cena): o número acende quando
  a peça se separa, e só a última ganha o nome; a lista da seção marca a mesma
  peça. No celular, só os números (a lista é a legenda).
- **"Como funciona":** as peças viram um esquema limpo (`scene/schematic.ts`),
  agrupadas por etapa: no desktop, uma linha à direita do texto; no celular,
  uma coluna em cima. Fios em curva com pulsos na cor da etapa
  (`Energy/Energy.tsx`), crescendo do painel para o celular; fótons em risco
  de luz descendo do sol (sempre de cima) e as células brilhando onde a luz
  bate; a bateria enche de verde na etapa 3; o celular chega na 4, com o
  "3,7 V → 5 V" no conversor e o LED aceso. Etiquetas das 4 etapas numeradas
  e legendadas desde que o esquema se forma (M3), apagadas, acesas ou em curso;
  a lista marca a etapa em curso. No celular, o texto mostra só a etapa em
  curso (as quatro empilhadas no mesmo lugar; o leitor de tela lê todas).
- **"A energia fica":** no pôr do sol, o esquema se recolhe, a caixa fecha e o
  painel dobra; o cabo 3 em 1 (`Product/PhoneCable.tsx`) sai da USB-A, deita
  no chão e abre nas três pontas perto do celular; o LED fica aceso (com halo)
  e a tela sobe de 0 a 100% com o texto da noite. De manhã, o cabo recolhe, o
  celular sai em fade, o painel abre e o produto volta à pose de herói.
- **3c (diferencial):** o produto gira com o scroll ao lado do texto, na luz
  da manhã, e some antes da Parte 4. No celular, ele sobe para fora da tela
  no fim da noite (o texto do diferencial ocupa a largura toda).
- Câmera: telas mais estreitas que 16:10 (ou que 390×844, no celular) abrem o
  campo de visão na mesma proporção, para o produto não sair pela lateral.
- Ferramentas: `scripts/dev/nodes.mjs` (mede onde cada nó, etiqueta e texto
  caem na tela), `scripts/dev/pins.mjs` (várias frações de um pin numa sessão)
  e o `probe.mjs` com `at=` e `orbit=`.

### Decisões técnicas da Fase 4

- **O esquema vem das medidas das peças:** `EXTENT` (meia largura e meia
  altura de cada peça no esquema, medidas com o `nodes.mjs`) e os vãos de
  `SCHEMATIC.gaps` dão a posição de cada nó; a linha toda é centrada no alvo
  da câmera. Trocar a escala de uma peça pede medir de novo.
- **`blendToNode` trabalha em espaço de mundo** (lerp/slerp e volta ao espaço
  do pai): a cadeia de grupos acima da peça não importa. O nó guarda o
  `center` (o meio da peça, na linha) separado da `position` (a origem): o
  painel e a frente da caixa têm a origem no chão.
- **A frente da caixa ganha um espelho só no esquema** (some com a caixa
  montada), e o painel volta a ser um só (sem as camadas da explosão) a
  caminho do nó.
- **Pulsos com a cabeça na frente:** `fract(uTime * uSpeed - u * uDensity)`; a
  densidade sai do comprimento de cada fio, para pulsos iguais em fios curtos
  e longos. O fio aceso tem 25% de base na cor da etapa.
- **Fótons em risco:** cada ponto desenha um traço na direção em que anda (a
  direção projetada sai do vértice); mistura normal, não aditiva (no céu claro,
  a aditiva vira branco).
- **Callouts só em "Por dentro":** a vista explodida volta em "A energia
  fica", mas com `flow` em 4 a camada não aparece.
- **Repouso do reduced motion fora da borda:** sem pin, o fim de uma seção é
  o começo da próxima; o repouso fica em 0,98 para as chaves da seguinte (o
  tom do texto) não valerem.
- **Sombra de contato refeita quando qualquer peça mexe** (painel, tampa,
  explosão, esquema, cabos e celular, já amortecidos), não só a pose do grupo;
  some no esquema.
- **Nada troca o programa de um shader em runtime:** ligar e desligar
  `transparent` (o fade do celular) muda o `#define OPAQUE` e compila um
  programa novo no meio da cena; no SwiftShader, a foto da TV estourava 30 s.
  Material que faz fade nasce transparente (celular, espelho da caixa).
- **O `snap` usa a GPU da máquina** (ANGLE sobre D3D11 no Windows,
  `scripts/gl.mjs`): ~15 ms por quadro em 1080p, contra ~1 s no SwiftShader,
  que levava 25 a 55 s por foto e estourava o tempo na passada da TV. E as
  fotos passam a mostrar o tier alto: no SwiftShader, o `PerformanceMonitor`
  descia para o baixo (sombra falsa). `SNAP_GL=swiftshader` volta ao
  software.
- **Reduced motion no celular:** sem pin, o texto passava por cima do produto.
  O produto agora rola junto com a seção (o deslocamento de lente anda uma
  tela por tela de scroll, em `lib/tracks.ts`), como uma figura no alto da
  cena (`--figure` no CSS), e o texto começa abaixo dela. Sem pin há lugar: as
  funções das peças e o texto das etapas voltam a aparecer.

### `snap` da Fase 4 (`.snapshots/fase-4/`, já na GPU)

| Passada | Erros | Contraste | WebGL | LCP | CLS |
|---|---|---|---|---|---|
| 1440×900 | 0 | 0 | sim | 4.112 ms* | 0 |
| 390×844 | 0 | 0 | sim | 1.504 ms* | 0 |
| 1440×900 reduced motion | 0 | 0 | sim | 228 ms | 0 |
| 390×844 reduced motion | 0 | 0 | sim | 192 ms | 0 |
| TV 1920×1080 | 0 | 0 | sim | 248 ms | 0 |
| 1440×900 `?nowebgl` | 0 | 0 | não (esperado) | 252 ms | 0 |

\* **Achado para a Fase 7:** a abertura (e o nome do hero) espera o
`Warmup` compilar os shaders. No D3D11 (o Chrome no Windows), a primeira
compilação, com o cache frio, leva uns 4 s; com o cache do processo da GPU
quente (as passadas seguintes, no mesmo navegador), o LCP cai para ~250 ms.
O SwiftShader escondia isso. Caminho provável: mostrar o texto do hero sem
esperar a cena, e a cena entrar quando estiver pronta.

JS gzip: inicial 135,2 KB (teto 150); cena 263,8 KB; total 407,4 KB (teto
500); CSS 8,1 KB. A Parte 3 inteira custou ~9 KB no chunk da cena.

Crítica (`.impeccable/critique/`): 22/28 (79%, bom). Aceite cumprido: no meio
de "Como funciona", as 4 etapas estão visíveis e legendadas, e o caminho se
lê sem o texto.

## Pendências do usuário (nenhuma bloqueia)

- **d.light:** quer atualizar o número da seção 3 (hoje "mais de 150
  milhões") para o que as fontes dizem agora (175 ou 215 milhões)?

- **F6:** confirmar no protótipo que o boost sai do OUT do módulo TP4056. Se
  der, medir o tempo de carga e quantas cargas de celular a bateria rende (F3
  e F4).
- Opcionais: medidas e peso do produto (`product.ts`, campos `// TODO:
  preencher`), fotos em `referencias/` e nomes autorizados da equipe.
- URL de produção, para o OG com URL absoluta (Fase 7).
- **Só você dispara** a `/review-animations` do Emil: ao fim das Fases 2, 4
  e 6.
