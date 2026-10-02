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
- **02/10:** Fase 1 fechada.

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

## Pendências do usuário (nenhuma bloqueia)

- **F6:** confirmar no protótipo que o boost sai do OUT do módulo TP4056. Se
  der, medir o tempo de carga e quantas cargas de celular a bateria rende (F3
  e F4).
- Opcionais: medidas e peso do produto (`product.ts`, campos `// TODO:
  preencher`), fotos em `referencias/` e nomes autorizados da equipe.
- URL de produção, para o OG com URL absoluta (Fase 7).
- **Só você dispara** a `/review-animations` do Emil: ao fim das Fases 2, 4
  e 6.
