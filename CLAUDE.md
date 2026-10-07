# SunTech: site 3D do Carregador Solar SunTech (v3)

**Estado.** A v2 (branch `v2`, no ar em suntech-ten.vercel.app) cumpriu o brief, mas o dono a reprovou no visual: produto pequeno e fora do centro, geometria de "caixas" e scroll duro, que não acompanha. A v3 refaz a **cena do produto e a camada de scroll**; conteúdo e fatos continuam. Trabalhe na branch `v3`, criada a partir da `v2`, sem reescrever o histórico da `v2` nem da `main`. **Para retomar o trabalho, leia primeiro `ONDE-PARAMOS-V3.md`** (onde paramos, o que falta e como rodar tudo).

## Leitura e precedência

Se dois arquivos discordarem, vale: **este arquivo > `docs/v3-*.md` > `BRIEF.md` > `PROGRESS.md`**.

- `BRIEF.md` segue como fonte de **conteúdo**: §1 a §3 (contexto, requisitos, fatos), §7 (roteiro e textos), §14 (proibido) e §15 (checklist). Leia só a seção de que precisa, não o arquivo inteiro.
- **Superado** por este arquivo: `BRIEF.md` §4 (stack), §5 (arquitetura), §8 (3D) e a paleta de céu do §6. Isso inclui céu procedural, `dayTime`, o ciclo de três dias, a zona morta de contraste e a regra "sem modelos nem HDRIs". Decisões do `PROGRESS.md` sobre essas partes não valem mais; as de conteúdo, números e acessibilidade continuam.
- `PROGRESS.md`: leia só o fim (pendências). `DESIGN.md` e `PRODUCT.md` são o contexto da `impeccable`; o `DESIGN.md` descreve a arte da v2 e é refeito na Fase 0 da v3.
- **Não leia:** `ONDE-PARAMOS-CODIGO.md` (165 KB, obsoleto) e `PROMPT-1-SUNTECH.md` (cópia do `BRIEF.md`).
- Fluxo: a Fase 0 é um plano curto em `docs/v3-fase-0.md`, aprovado antes de qualquer código. Depois, uma fase por commit, cada uma com `typecheck`, `lint`, `check:numbers` e `snap`. Questione o plano e aponte riscos antes de implementar.

## Stack (as versões estão no `package.json`)

Vite 8 + React 19 + TypeScript strict (com `@vitejs/plugin-react` e `@tailwindcss/vite`) · three + @react-three/fiber v9 + @react-three/drei v10 (R3F v10 e WebGPU estão em alpha: não usar) · three-custom-shader-material v6 · @react-three/postprocessing (+ `postprocessing`) · gsap 3.15+ com @gsap/react (ScrollTrigger no chunk inicial; SplitText, CustomEase e DrawSVG sob demanda em `lib/split.ts`) · lenis · maath · tailwindcss v4 (`@theme` em `src/index.css`) · @fontsource-variable/archivo (eixos `wdth` e `wght`). Lint: oxlint. Dev: leva, r3f-perf e playwright (só com `?debug` e nos scripts).

Sem backend. Dependência nova precisa de justificativa no plano. Ferramentas de linha de comando para preparar o modelo (`npx gltfjsx`, `npx @gltf-transform/cli`) rodam sob demanda e não entram no `package.json`.

## Ativos 3D (muda em relação à v2)

- **Permitido**, sempre local: `public/models/suntech.glb` (Draco ou meshopt, até 1,5 MB), `public/hdri/*.hdr` (1k, até 400 KB) e texturas em KTX2 ou WebP. Carregam só dentro do chunk da cena. Licença de cada modelo registrada em `public/models/LICENSE.md`.
- **Proibido:** qualquer ativo vindo de CDN em tempo de execução (o `preset` do `<Environment>` do drei busca na rede: use `files=` local ou `<Lightformer>`).
- **Contrato de peças:** uma malha nomeada por peça, com o pivô no ponto de abertura ou de encaixe, porque a animação move cada uma. Nomes: `case_base`, `case_lid`, `cell_a`, `cell_b`, `pcb_charge` (módulo de carga e proteção, TP4056 e DW01), `pcb_boost` (conversor boost, com a `usb_port` dentro dele), `panel_a`, `panel_b`, `usb_port`, `led` e `phone` (o celular da cena de energia). A coreografia usa os nomes, não a origem da geometria. (A `pcb` única do contrato antigo virou `pcb_charge` e `pcb_boost`, aprovado em 06/10/2026: o roteiro tem quatro componentes.)
- **O GLB sai de `scripts/model/`** (dependências próprias, fora do `package.json` do app): ele gera a geometria chanfrada, compõe com as partes abertas que a licença permite, nomeia os nós e comprime com meshopt em `public/models/suntech.glb`. Os materiais e as texturas em canvas são do runtime, atribuídos por nome de material. Um GLB feito à mão com os mesmos nomes entra no lugar sem mexer na coreografia. Geometria sempre **com chanfro** (nada de `BoxGeometry` cru), em `MeshPhysicalMaterial` e com ambiente local (Lightformers ou HDRI local). O `useGLTF` do drei busca o decoder Draco no gstatic (CDN, proibido): use meshopt.
- Texturas em canvas 2D geradas em runtime (células do painel, placa, rótulo, tela do celular) continuam permitidas. Shaders em `.glsl?raw`.

## Arquitetura (regras que não se quebram)

- Um único `<Canvas>` fixo atrás do DOM (`scene/SceneCanvas.tsx`, via `React.lazy`), com `eventSource` na raiz, `eventPrefix="client"` e `pointer-events: none`. O wrapper (`.scene-canvas-wrap`) fica em `z-index: -1`: um `fixed` com `z-index: 0` pinta por cima do texto. Todo elemento HTML acima do canvas precisa de `position` + `z-index` positivo.
- `sceneState` (`scene/state.ts`) é o único objeto mutável da animação. Só escrevem nele o trilho de scroll (`lib/tracks.ts`), a abertura e o ponteiro (GSAP); o `useFrame` só lê. Nunca `useState` no loop de animação.
- **Uma só camada de suavização.** Lenis suaviza o scroll e o ScrollTrigger usa `scrub: true`; o `damp` do `useFrame` fica curto (λ ≥ 8) e só na câmera. Somar `scrub` numérico e `damp` lento é o que dá a sensação de scroll duro e atrasado. Valide com `scripts/dev/sweep.mjs` (varredura de scroll: **p95 ≤ 18 ms e p99 ≤ 25 ms**, porque o `rAF` trava em 60 Hz e "p95 ≤ 16,7 ms" não discrimina nada; aprovado em 06/10/2026) e com `?slowmo`.
- **Trilhos de scroll:** `scene/choreography.ts` é o mapa de scroll como dados (pontos de 0 a 1 da faixa da seção ou do pin). `lib/tracks.ts` o compila em segmentos (com a `ease` do GSAP por trilho) e os avalia como uma **função pura de `scrollY`**, chamada por um único ScrollTrigger: o estado em qualquer ponto não depende do caminho até ele. (Não volte para uma timeline do GSAP renderizada com `render(y, false, true)`: o render forçado deixa trilhos presos no valor de um salto anterior, e o `scripts/dev/reverse.mjs` pega isso.) A página pode pular (âncoras, `?goto`) sem dois gatilhos brigando. Com reduced motion, o trilho salta para o ponto de repouso de cada beat (`BEAT_REST`, que vem de `restOf` em `choreography.ts`: câmera já parada e texto inteiro). Cenas presas usam `lib/stage.ts` (pin com `gsap.matchMedia`) só para o texto delas.
- **Cena do produto (invariantes):** é uma cena presa (`pin`) longa, **no topo da página, como o hero** (as 6 partes vêm depois, na ordem das aulas), e o produto fica **no centro da tela o tempo todo**. O sujeito do beat (o conjunto ou a peça em foco) ocupa **55 a 70% da altura e até 66% da largura** da viewport no desktop; no celular, **até 88% da largura e 45 a 55% da altura quando a proporção deixa** (a largura manda). Câmera e peças se movem; o centro não (desvio de até 4% da viewport). Texto e etiquetas ficam nas laterais (desktop) ou abaixo (celular), sem cobrir as peças. Rolar para cima desfaz a animação exatamente (nada de eventos de disparo único; a rotação "lenta" é presa ao scroll). O roteiro e os tempos de cada beat ficam em `docs/v3-fase-0.md` (os tempos da câmera mudaram na Fase 1: ver `docs/v3-progresso.md`); o enquadramento é medido por `scripts/dev/framing.mjs`. **A câmera voa na janela sem texto em volta de cada divisa** (`flightOf`, `FLY_BEFORE` e `FLY_AFTER` em `choreography.ts`), então o sujeito está enquadrado em todo ponto com texto, inclusive em 0, 25, 50, 75 e 100% do pin; a explosão é a exceção, e a câmera recua junto com ela.
- `state.ts`, `choreography.ts` e `tracks.ts` entram no chunk inicial e **não podem importar `three`** (já estourou o orçamento uma vez).
- Cor do fundo e do texto vêm de variáveis CSS animadas pela mesma timeline (um tom por beat). O tom do texto é `data-tone` no `<html>` (`--fg`). Nenhum ponto do scroll pode ficar abaixo de contraste AA: o `snap` mede nos pixels.
- Seções: cada parte e cada cena tem `data-section` (e `data-part`). O marcador nunca vive num componente que desmonta. `lib/sections.ts` mede as faixas a cada refresh do ScrollTrigger. Chame `ScrollTrigger.refresh()` depois de `document.fonts.ready` e ao terminar o loader.
- `ScrollControls` do drei é proibido (conflita com Lenis e com o DOM).
- Objetos 3D fora da sua cena ficam com `visible = false`.
- Nada troca o programa de um shader depois do aquecimento (`Warmup`): não ligue e desligue `transparent`, a névoa ou defines em runtime. Material que faz fade (peças esmaecidas nos beats) nasce transparente.
- Fallback sem WebGL (`?nowebgl`) e reduced motion continuam obrigatórios: o conteúdo todo segue navegável.

## Comandos

- `npm run dev`: servidor de desenvolvimento
- `npm run typecheck`: `tsc -b --noEmit`
- `npm run lint`: `oxlint`
- `npm run build`: typecheck + build de produção
- `npm run preview`: serve o build (porta 4173)
- `npm run snap <fase>`: build, gzip de cada chunk contra o orçamento (JS inicial 150 KB e total 500 KB, em `scripts/snap.mjs`) e fotos de cada seção (início, meio e fim; na cena do produto, o começo do pin, o meio de cada beat e o fim; sem pin, o centro de cada bloco `[data-beat]`) em 1440×900 e 390×844, normal e com reduced motion, mais TV 1920×1080, tablet 768×1024, celular no tier baixo e `?nowebgl`. O tier de qualidade é fixo em cada passada (`?tier=`). Mede o contraste nos pixels reais e falha com erro de console, contraste abaixo de AA ou WebGL ausente. Saída em `.snapshots/<fase>/` (fora do git), com `report.json`. No Windows, o Chromium usa a GPU da máquina (`scripts/gl.mjs`); `SNAP_GL=swiftshader` força software (lento: rode em segundo plano). Para iterar: `node scripts/snap.mjs <nome> --quick --only=390x844 --no-build`.
- `npm run check:numbers`: nenhum número escrito à mão no texto de `src/sections` (todos vêm de `src/content`).
- `npm run test:pitch`: o modo pitch com o relógio falso do Playwright (180 s exatos, pausa no Espaço, saída no Esc), normal e com reduced motion. Usa o `dist/`: rode o build antes.
- `npm run og`: gera a imagem de prévia de link (rode o build antes).

- `npm run model:install` (uma vez), `npm run model` e `npm run model:view`: o gerador do GLB em `scripts/model/` (`public/models/suntech.glb`) e as folhas de contato para conferir as peças.

Flags de URL: `?debug` (leva + r3f-perf), `?snap` (expõe `window.__ready`, `window.__sections`, `window.__lenis`, `window.__scene`, `window.__three` e `window.__model`; DPR 1), `?goto=<id>` (pula para uma seção), `?nowebgl` (força o fallback), `?slowmo=N` (timelines N vezes mais lentas), `?tier=alto|medio|baixo` (fixa o tier de qualidade; sem ele, o tier sobe ou desce pelo FPS, e só sobe com o scroll parado) e `?dpr=N` (com `?snap`).

Ferramentas de depuração em `scripts/dev/` (com o preview no ar em :4173; o `sweep`, o `reverse` e o `snap` sobem o preview sozinhos): `sweep.mjs` (tempo de quadro numa varredura do pin: p95 ≤ 18 ms e p99 ≤ 25 ms; `--dpr=2` e `--size=390x844`), `reverse.mjs` (vai, volta e pula pelo pin e compara todo o estado: tem de dar diferença zero), `framing.mjs` (enquadramento do sujeito de cada beat: altura, largura e centro; `--solve --apply` regrava as tabelas `DESKTOP` e `NARROW`; `--at=0,0.25,...` mede em frações do pin), `shots.mjs` (fotos rápidas de pontos do pin), `frame.mjs` (enquadramento da câmera sem build), `probe.mjs` (foto com campos do `sceneState` forçados; `at=<seção>:<fração>` rola antes, `orbit=...` monta a câmera), `pins.mjs` (várias frações de um pin numa sessão), `nodes.mjs` (onde caem nós, etiquetas e texto na tela), `frametime.mjs` (tempo de quadro por ponto), `opening.mjs` (a abertura quadro a quadro), `crop.mjs` e `montage.mjs` (recorte ampliado e grade de imagens), `axe.mjs`, `lcp.mjs` e `tab-order.mjs`. No Windows não há `pkill`: pare o preview pelo PID, senão a porta 4173 fica presa e o `snap` falha.

## Fontes de fatos

- Fatos só em `src/content/` (`company.ts`, `product.ts` e `feira.ts`), da seção 3 do brief. Textos em `copy.ts`; formatação pt-BR em `format.ts`. Nenhum número solto em componente. Estimativas rotuladas; dados externos com fonte. Medidas e peso em `product.ts` são **fictícios** (autorizado pelo dono em 07/10/2026, enquanto o protótipo não é medido): iguais às proporções do 3D e marcados como "ilustrativo" na ficha técnica. Não invente outros valores.
- Execução (easing, duração, acessibilidade e anti-padrões visuais): as skills (`impeccable`, Emil Kowalski, GSAP, `accessible-animation`). O mapa de skills por fase da v2 está em `docs/fase-0.md`, item 10; a v3 repete esse mapa no `docs/v3-fase-0.md`.
