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

### Fontes externas (F9), revalidadas no navegador em 02/10/2026

Todas no ar e sustentando o texto do site: Poder360/IEMA (990.103, estudo
divulgado em 26/11/2019), Idec (o endereço redireciona para "Amazônia Legal no
escuro"; o apagão no Amapá começou em 3 de novembro e passou de 20 dias),
Earthshot e d.light (Stanford, querosene, pagamento pelo celular). **A d.light
hoje fala em 215 milhões de vidas (e a Earthshot, em 175 milhões); o site diz
"mais de 150 milhões", da seção 3, que continua verdadeiro.**

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
