# SunTech — carregador solar (site de produto)

Antes de qualquer mudança, leia `BRIEF.md` inteiro (fonte da verdade do conceito,
copy, storyboard e regras de arquitetura) e `PROGRESS.md` (estado atual, decisões
já tomadas e pendências). Não repita decisões que já foram registradas lá.

## Stack

Vite 8 + React 19 + TypeScript strict · three + @react-three/fiber v9 +
@react-three/drei v10 · three-custom-shader-material · @react-three/postprocessing
· gsap 3.15+ (`ScrollTrigger`, `SplitText`, `CustomEase`, `DrawSVGPlugin`, todos
bundled, carregados sob demanda em `lib/gsapText.ts`) · lenis · maath ·
tailwindcss v4 (`@theme` em `src/index.css`) · @fontsource-variable/archivo ·
Dev: leva, r3f-perf, playwright (`?debug` só carrega leva/r3f-perf).

Sem backend, sem modelos/HDRIs/imagens externas — tudo procedural (canvas 2D em
runtime) ou shader (`.glsl?raw`).

## Comandos

- `npm run dev` — servidor de desenvolvimento
- `npm run typecheck` — `tsc -b --noEmit`
- `npm run lint` — `oxlint`
- `npm run build` — typecheck + build de produção
- `npm run preview` — serve o build
- `npm run snap [fase]` — build, sobe o preview, screenshota cada ato (normal
  e reduced-motion) em `.snapshots/<fase>/` (fora do git)

Flags de URL: `?debug` (leva + r3f-perf), `?snap` (expõe `window.__ready`/
`window.__acts`/`window.__lenis`), `?act=<id>` (pula direto pro ato).

## Regras de arquitetura que não se quebram (seção 5 do brief)

- Um único `<Canvas>` fixo em tela cheia atrás do DOM (`scene/SceneCanvas.tsx`,
  carregado via `React.lazy`); o DOM rola por cima, `pointer-events: none` no
  canvas, `eventSource`/`eventPrefix="client"` na raiz.
- `sceneState` (`scene/state.ts`) é o único objeto mutável com os parâmetros
  animáveis. Só o GSAP (ScrollTrigger com scrub) escreve nele; `useFrame` só lê
  e aplica com `easing.damp` do maath. **Nunca** `useState` no loop de animação.
- `state.ts` não pode importar `three` (nem nada do ecossistema R3F) — é
  compartilhado com código fora do chunk 3D (App.tsx). Ver PROGRESS.md, Fase 1,
  para o porquê (isso já causou um estouro de orçamento de JS inicial uma vez).
- Toda cor derivada de `dayTime` (céu, sol, estrelas, texto) sai só de
  `scene/daylight.ts`.
- `ScrollControls` do drei é proibido.
- O wrapper do canvas (`.scene-canvas-wrap`) usa `z-index: -1` de propósito —
  um `fixed` com `z-index: 0` pinta depois do conteúdo não-posicionado do
  DOM e cobre o texto (`pointer-events: none` só afeta hit-test, não
  pintura). Qualquer elemento HTML que precise ficar visível por cima do
  canvas precisa de `position` + `z-index` positivo explícitos.

## Onde estão as fontes de fatos

- Empresa e produto: `src/content/company.ts` e `src/content/product.ts` — só
  a seção 2 do `BRIEF.md` os alimenta. Nenhum número solto no resto do código.
- Conceito, copy, storyboard, tokens: `BRIEF.md`.
- Execução (easing, duração, acessibilidade, anti-padrões visuais): as skills
  instaladas (Emil Kowalski, `impeccable`, `accessible-animation` etc.) — ver
  o mapa de skills por fase no plano da Fase 0, arquivado em `PROGRESS.md`.
