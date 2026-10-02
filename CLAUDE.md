# SunTech: site 3D do Carregador Solar SunTech

Antes de qualquer mudança, leia o `BRIEF.md` (fonte da verdade: conceito,
textos, roteiro e arquitetura), o `docs/fase-0.md` (plano aprovado, com as
mudanças M1 a M8) e o `PROGRESS.md` (estado, decisões e pendências). Não
reabra decisões que já estão registradas lá. `PRODUCT.md` e `DESIGN.md` são o
contexto da `impeccable`.

## Stack

Vite 8 + React 19 + TypeScript strict · three + @react-three/fiber v9 +
@react-three/drei v10 · three-custom-shader-material · @react-three/postprocessing
· gsap 3.15+ e @gsap/react (ScrollTrigger no chunk inicial; SplitText,
CustomEase e DrawSVG sob demanda em `lib/split.ts`) · lenis · maath ·
tailwindcss v4 (`@theme` em `src/index.css`) · @fontsource-variable/archivo
(eixos `wdth` e `wght`). Dev: leva, r3f-perf e playwright.

Sem backend. Sem modelos, HDRIs ou imagens externas: geometria procedural,
texturas em canvas 2D em runtime e shaders em `.glsl?raw`.

## Comandos

- `npm run dev`: servidor de desenvolvimento
- `npm run typecheck`: `tsc -b --noEmit`
- `npm run lint`: `oxlint`
- `npm run build`: typecheck + build de produção
- `npm run preview`: serve o build
- `npm run snap <fase>`: build, gzip de cada chunk contra o orçamento, e
  fotos de cada seção (início, meio e fim; nas cenas presas, 0%, 50% e 100%
  do pin) em 1440×900 e 390×844, normal e com reduced motion, mais TV
  1920×1080 e `?nowebgl`. Mede o contraste nos pixels reais e falha com erro
  de console, contraste abaixo de AA ou WebGL ausente. Saída em
  `.snapshots/<fase>/` (fora do git), com `report.json`. No Windows, o
  Chromium usa a GPU da máquina (`scripts/gl.mjs`: ~15 ms por quadro em
  1080p, e as fotos mostram o tier real); `SNAP_GL=swiftshader` força o
  renderizador por software (~1 s por quadro, ~30 s por foto: rode em segundo
  plano). Para iterar:
  `node scripts/snap.mjs <nome> --quick --only=390x844 --no-build`.

Flags de URL: `?debug` (leva + r3f-perf), `?snap` (expõe `window.__ready`,
`window.__sections`, `window.__lenis`, `window.__scene` e `window.__three`;
DPR 1), `?goto=<id>` (pula para uma seção), `?nowebgl` (força o fallback) e
`?slowmo=N` (timelines N vezes mais lentas).

Ferramentas de depuração em `scripts/dev/` (com o preview no ar em :4173):
`frame.mjs` (enquadramento da câmera sem build), `probe.mjs` (foto com campos
do `sceneState` forçados; `at=<seção>:<fração>` rola antes, `orbit=...` monta a
câmera), `pins.mjs` (várias frações de um pin numa sessão), `nodes.mjs` (onde
os nós do esquema, as etiquetas e o texto caem na tela), `frametime.mjs`
(tempo de quadro por ponto), `opening.mjs` (a abertura quadro a quadro),
`crop.mjs` e `montage.mjs` (recorte ampliado e grade de imagens). No
Windows, pare o preview pelo PID (não há `pkill`), senão a porta 4173 fica
presa e o `snap` falha.

## Regras de arquitetura (seção 5 do brief)

- Um único `<Canvas>` fixo atrás do DOM (`scene/SceneCanvas.tsx`, via
  `React.lazy`), com `eventSource` na raiz, `eventPrefix="client"` e
  `pointer-events: none`. O wrapper (`.scene-canvas-wrap`) fica em
  `z-index: -1`: um `fixed` com `z-index: 0` pinta por cima do texto. Todo
  elemento HTML acima do canvas precisa de `position` + `z-index` positivo.
- `sceneState` (`scene/state.ts`) é o único objeto mutável da animação. Só o
  GSAP escreve nele; o `useFrame` só lê e aplica com `easing.damp`. Nunca
  `useState` no loop de animação.
- **Timeline mestre (M1):** `scene/choreography.ts` é o mapa de scroll como
  dados (por seção, pontos de 0 a 1 da faixa da seção, ou do pin). O
  `lib/tracks.ts` transforma isso numa timeline do GSAP em que o tempo é o
  pixel de scroll, e um único ScrollTrigger a percorre. Por isso a página
  pode pular (pitch, `?goto`, âncoras) sem dois gatilhos brigando. Com reduced
  motion, a timeline salta para o ponto de repouso de cada seção (`REST_AT`).
  As cenas presas usam `lib/stage.ts` (pin com `gsap.matchMedia`) só para o
  texto delas.
- `state.ts`, `choreography.ts`, `daylight.ts` e `tracks.ts` entram no chunk
  inicial e **não podem importar `three`** (já estourou o orçamento uma vez).
- Toda cor derivada da hora (céu, sol, nuvens, estrelas, luz e tom do texto)
  sai de `scene/daylight.ts`. `dayTime` está em horas contínuas (4,5 a 65,7:
  três dias); o céu usa `dayTime mod 24`.
- **Contraste:** a zona morta fica entre L 0,167 e 0,246. O céu só a cruza
  nas 3 travessias (nascer do sol no começo de "Por dentro", pôr do sol no
  começo de "A energia fica" e nascer do dia seguinte no fim dela), sem texto
  na tela: o trilho `tone` vale 0, o `<html>` ganha `data-crossing` e o
  header sai de cena. O tom do texto é `data-tone` no `<html>` (`--fg`).
- Seções: cada parte e cada cena tem `data-section` (e `data-part`, de 1 a
  6). O marcador nunca vive num componente que desmonta.
  `lib/sections.ts` mede as faixas a cada refresh do ScrollTrigger.
- `ScrollControls` do drei é proibido.
- Objetos 3D fora da sua cena ficam com `visible = false`.
- Nada troca o programa de um shader depois do aquecimento (`Warmup`): não
  ligue e desligue `transparent`, a névoa ou defines em runtime. Material que
  faz fade nasce transparente.

## Fontes de fatos

- Fatos só em `src/content/` (`company.ts`, `product.ts` e `feira.ts`), da
  seção 3 do brief. Textos em `copy.ts`; formatação pt-BR em `format.ts`.
  Nenhum número solto em componente. Estimativas rotuladas; dados externos
  com fonte.
- Execução (easing, duração, acessibilidade e anti-padrões visuais): as
  skills (`impeccable`, Emil Kowalski, GSAP, `accessible-animation`). O mapa
  de skills por fase está no `docs/fase-0.md`, item 10.
