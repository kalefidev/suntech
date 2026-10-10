# SunTech v2: código da sessão de 01/10/2026

> Cópia de leitura do código da v2, que **ainda não foi commitado** (branch `v2`). Os arquivos de verdade continuam em `src/`, `scripts/`, `index.html` e `vite.config.ts`; este arquivo só registra como eles estavam ao parar. O resumo do que foi feito e do que falta está em `ONDE-PARAMOS.md`.
>
> Para ver só a diferença em relação à v1: `git diff 856ae2f` (os arquivos novos aparecem em `git status`).

## Índice (49 arquivos)

- `index.html`
- `vite.config.ts`
- `src/App.tsx`
- `src/config.ts`
- `src/index.css`
- `src/content/company.ts`
- `src/content/copy.ts`
- `src/content/feira.ts`
- `src/content/format.ts`
- `src/content/product.ts`
- `src/lib/env.ts`
- `src/lib/gsap.ts`
- `src/lib/lenis.ts`
- `src/lib/loading.ts`
- `src/lib/opening.ts`
- `src/lib/sections.ts`
- `src/lib/split.ts`
- `src/lib/stage.ts`
- `src/lib/tracks.ts`
- `src/lib/useReducedMotion.ts`
- `src/scene/CanvasErrorBoundary.tsx`
- `src/scene/choreography.ts`
- `src/scene/daylight.ts`
- `src/scene/Experience.tsx`
- `src/scene/Fallback.tsx`
- `src/scene/quality.ts`
- `src/scene/SceneCanvas.tsx`
- `src/scene/Sky.tsx`
- `src/scene/state.ts`
- `src/shaders/sky.frag.glsl`
- `src/shaders/sky.vert.glsl`
- `src/sections/ChapterOpener.tsx`
- `src/sections/Client.tsx`
- `src/sections/Company.tsx`
- `src/sections/Differential.tsx`
- `src/sections/EnergyDiagram.tsx`
- `src/sections/EnergyStays.tsx`
- `src/sections/Fact.tsx`
- `src/sections/Footer.tsx`
- `src/sections/Header.tsx`
- `src/sections/Hero.tsx`
- `src/sections/HowItWorks.tsx`
- `src/sections/Inside.tsx`
- `src/sections/Loader.tsx`
- `src/sections/Pitch.tsx`
- `src/sections/Problem.tsx`
- `src/sections/Solution.tsx`
- `src/sections/Youth.tsx`
- `scripts/snap.mjs`

## Arquivos da v1 removidos

- `src/lib/acts.ts (renomeado para src/lib/sections.ts)`
- `src/lib/gsapText.ts (renomeado para src/lib/split.ts)`
- `src/sections/AboutUs.tsx`
- `src/sections/Final.tsx`
- `src/sections/HowItWorks.tsx`
- `src/sections/Inside.tsx`
- `src/sections/Night.tsx`
- `src/sections/Opening.tsx`
- `src/sections/WhoFor.tsx`
- `src/sections/WhyWorth.tsx`

## index.html

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>Carregador Solar SunTech: energia do sol, onde você estiver</title>
    <meta
      name="description"
      content="A SunTech é uma empresa de estudantes do Colégio Ideal. O Carregador Solar SunTech é um power bank com painel solar dobrável: de dia guarda a energia do sol, depois carrega o celular longe da tomada."
    />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="pt_BR" />
    <meta property="og:title" content="Carregador Solar SunTech" />
    <meta
      property="og:description"
      content="Um power bank com painel solar dobrável, criado por estudantes do Colégio Ideal para a Feira de Empreendedorismo."
    />
    <meta name="theme-color" content="#14213D" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <style>
      /* Madrugada desde o primeiro quadro: nada de flash claro antes do CSS. */
      html { background: #14213d; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

## vite.config.ts

```ts
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type Plugin } from "vite";

/**
 * Preload da fonte do hero (o título é o LCP). O arquivo sai do build com hash,
 * então o link é injetado depois do bundle pronto.
 */
function preloadFont(match: string): Plugin {
  return {
    name: "suntech:preload-font",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler(_html, ctx) {
        const font = Object.values(ctx.bundle ?? {}).find(
          (file) => file.type === "asset" && file.fileName.includes(match),
        );
        if (!font) return;
        return [
          {
            tag: "link",
            attrs: { rel: "preload", as: "font", type: "font/woff2", href: `/${font.fileName}`, crossorigin: "" },
            injectTo: "head-prepend",
          },
        ];
      },
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), preloadFont("archivo-latin-wdth-normal")],
  // O manifest deixa o `snap` medir o JS inicial e o total por chunk (seção 11 do brief).
  build: { manifest: true },
});
```

## src/App.tsx

```tsx
import { lazy, Suspense, useEffect, useRef } from "react";
import { ScrollTrigger } from "./lib/gsap";
import { destroyLenis, startLenis } from "./lib/lenis";
import { registerSections } from "./lib/sections";
import { holdTracks, initTracks } from "./lib/tracks";
import { track } from "./lib/loading";
import { flags } from "./lib/env";
import { useReducedMotion } from "./lib/useReducedMotion";
import { CanvasErrorBoundary } from "./scene/CanvasErrorBoundary";
import { Fallback } from "./scene/Fallback";
import { Header } from "./sections/Header";
import { Hero } from "./sections/Hero";
import { Problem } from "./sections/Problem";
import { Client } from "./sections/Client";
import { Solution } from "./sections/Solution";
import { Inside } from "./sections/Inside";
import { HowItWorks } from "./sections/HowItWorks";
import { EnergyStays } from "./sections/EnergyStays";
import { Differential } from "./sections/Differential";
import { Company } from "./sections/Company";
import { Pitch } from "./sections/Pitch";
import { Youth } from "./sections/Youth";
import { Footer } from "./sections/Footer";

const SceneCanvas = lazy(() => track("scene", import("./scene/SceneCanvas")));
const LevaPanel = lazy(() => import("leva").then((m) => ({ default: m.Leva })));

// A abertura segura o trilho de scroll até o sol nascer (lib/opening.ts).
holdTracks(true);

export default function App() {
  const rootRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  // Fonte pronta: tarefa real do loader e refresh dos gatilhos (seção 5 do brief).
  useEffect(() => {
    track("font", document.fonts.load('780 1rem "Archivo"').then(() => document.fonts.ready)).then(() =>
      ScrollTrigger.refresh(),
    );
  }, []);

  // Lenis (fora do reduced motion), registro de seções e trilho de scroll.
  // Roda depois dos efeitos das seções, quando os pins já existem.
  useEffect(() => {
    if (!reducedMotion) startLenis();
    const offSections = registerSections();
    const offTracks = initTracks({ reducedMotion });
    ScrollTrigger.refresh();
    return () => {
      offTracks();
      offSections();
      destroyLenis();
    };
  }, [reducedMotion]);

  return (
    <div ref={rootRef}>
      {flags.noWebgl ? (
        <Fallback />
      ) : (
        <CanvasErrorBoundary fallback={<Fallback />}>
          <Suspense fallback={null}>
            <SceneCanvas eventSource={rootRef} />
          </Suspense>
        </CanvasErrorBoundary>
      )}

      <Header />

      <main>
        <Hero />
        <Problem />
        <Client />
        <Solution />
        <Inside />
        <HowItWorks />
        <EnergyStays />
        <Differential />
        <Company />
        <Pitch />
        <Youth />
      </main>

      <Footer />

      {flags.debug && (
        <Suspense fallback={null}>
          <LevaPanel collapsed />
        </Suspense>
      )}
    </div>
  );
}
```

## src/config.ts

```ts
/** Link do crédito no rodapé (portfólio do desenvolvedor do site). */
export const PORTFOLIO_URL: string | null = "https://site.kaiquecalefi.online";
```

## src/index.css

```css
@import "tailwindcss";
@import "lenis/dist/lenis.css";

/*
 * Archivo variável, só o subset latin, com os eixos de peso (100–900) e de
 * largura (62–125%). O arquivo `wdth` já traz os dois eixos; o import padrão
 * do pacote traz só o peso, e aí a largura dos títulos é ignorada.
 * `block`: com o preload (vite.config.ts), a fonte chega antes da primeira
 * pintura útil e o hero nunca aparece trocando de fonte na frente de quem lê.
 */
@font-face {
  font-family: "Archivo";
  font-style: normal;
  font-display: block;
  font-weight: 100 900;
  font-stretch: 62% 125%;
  src: url("@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2") format("woff2-variations");
  unicode-range:
    U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329,
    U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

@theme {
  --font-sans: "Archivo", ui-sans-serif, system-ui, sans-serif;

  --color-noite: #14213d;
  --color-ceu: #cfe8f3;
  --color-nuvem: #f4f7fa;
  --color-sol: #ffb22c;
  --color-brasa: #e8773a;
  --color-grafite: #2b3036;

  /* Código de cor da energia: informação, sempre com rótulo. */
  --color-energia-luz: #ffd166;
  --color-energia-painel: #ff9f1c;
  --color-energia-guardada: #3ddc97;
  --color-energia-saida: #4cc9f0;

  --ease-reveal: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
}

/*
 * Cor do texto: segue o tom agendado pelo céu (scene/choreography.ts). Registrada
 * para trocar com crossfade, e só troca nas travessias, sem texto na tela.
 */
@property --fg {
  syntax: "<color>";
  inherits: true;
  initial-value: #f4f7fa;
}

:root {
  --fg: var(--color-nuvem);
  /* Céu da madrugada (04:30), igual ao primeiro quadro do shader. O fallback
     sem WebGL atualiza estas duas variáveis conforme a hora. */
  --sky-zenith: #14213d;
  --sky-horizon: #1d2c52;
  --gutter: clamp(1.25rem, 4vw, 2.5rem);
  --header-h: 4rem;
  transition: --fg 400ms var(--ease-out-quart);
  color-scheme: dark;
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, var(--fg) 40%, transparent) transparent;
}

:root[data-tone="dark"] {
  --fg: var(--color-noite);
  color-scheme: light;
}

html {
  background: var(--color-noite);
  -webkit-text-size-adjust: 100%;
  text-rendering: optimizeLegibility;
}

body {
  margin: 0;
  color: var(--fg);
  font-family: var(--font-sans);
  font-size: 1.0625rem;
  line-height: 1.5;
  font-stretch: 100%;
  font-kerning: normal;
  font-synthesis: none;
  -webkit-font-smoothing: antialiased;
  overflow-x: clip;
}

/* Fundo antes do WebGL (e no fallback): mesmo gradiente do céu da madrugada. */
body::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -2;
  background: linear-gradient(to top, var(--sky-horizon) 0%, var(--sky-zenith) 70%);
  pointer-events: none;
}

::selection {
  background: var(--color-sol);
  color: var(--color-noite);
}

:focus-visible {
  outline: 2px solid var(--fg);
  outline-offset: 3px;
  border-radius: 2px;
}

a {
  color: inherit;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.18em;
}

#root {
  position: relative;
  z-index: 1;
}

/*
 * O wrapper do canvas fica em z-index -1 de propósito: um `fixed` com z-index 0
 * pinta depois do conteúdo não posicionado e cobre o texto (`pointer-events`
 * só afeta o clique, não a pintura). Ver PROGRESS.md.
 */
.scene-canvas-wrap {
  position: fixed !important;
  inset: 0;
  width: 100vw !important;
  height: 100lvh !important;
  pointer-events: none;
  z-index: -1;
}

@layer components {
  .page-x {
    padding-inline: var(--gutter);
  }

  .type-display {
    font-size: clamp(3rem, 9vw, 9rem);
    font-stretch: 118%;
    font-weight: 780;
    line-height: 0.92;
    letter-spacing: -0.02em;
    text-wrap: balance;
  }

  .type-numeral {
    font-size: clamp(5rem, 14vw, 12rem);
    font-stretch: 125%;
    font-weight: 800;
    line-height: 0.8;
    letter-spacing: -0.03em;
    font-variant-numeric: tabular-nums lining-nums;
  }

  .type-h2 {
    font-size: clamp(2rem, 5vw, 4.5rem);
    font-stretch: 115%;
    font-weight: 720;
    line-height: 1;
    letter-spacing: -0.015em;
    text-wrap: balance;
  }

  .type-h3 {
    font-size: clamp(1.375rem, 2.2vw, 1.75rem);
    font-stretch: 110%;
    font-weight: 650;
    line-height: 1.15;
    text-wrap: balance;
  }

  .type-quote {
    font-size: clamp(1.5rem, 3vw, 2.5rem);
    font-stretch: 108%;
    font-weight: 560;
    line-height: 1.2;
    max-width: 30ch;
    text-wrap: balance;
  }

  .type-lead {
    font-size: clamp(1.1875rem, 1.6vw, 1.375rem);
    font-weight: 420;
    line-height: 1.45;
    max-width: 42ch;
    text-wrap: pretty;
  }

  .type-body {
    font-size: 1.0625rem;
    line-height: 1.5;
    max-width: 65ch;
    text-wrap: pretty;
  }

  .type-caption {
    font-size: 0.875rem;
    font-weight: 450;
    line-height: 1.4;
  }

  .type-label {
    font-size: 0.875rem;
    font-stretch: 110%;
    font-weight: 600;
    line-height: 1.3;
  }

  .num {
    font-variant-numeric: tabular-nums lining-nums;
  }

  /* CTA: fundo Noite e texto Sol (8,9:1). Um botão preenchido de Sol some
     contra o céu dourado; o Sol continua sendo a cor do CTA. */
  .btn-cta {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    min-height: 3rem;
    padding: 0.8rem 1.4rem;
    border-radius: 999px;
    background: var(--color-noite);
    color: var(--color-sol);
    font-stretch: 110%;
    font-weight: 650;
    font-size: 1rem;
    line-height: 1.2;
    box-shadow: 0 10px 24px -12px rgb(20 33 61 / 0.55);
    transition:
      background-color 180ms var(--ease-out-quart),
      color 180ms var(--ease-out-quart),
      transform 160ms var(--ease-out-quart);
  }

  .btn-cta:hover,
  .btn-cta:focus-visible {
    background: var(--color-sol);
    color: var(--color-noite);
  }

  .btn-cta:active {
    transform: scale(0.97);
  }

  .btn-cta:focus-visible {
    outline-color: var(--color-sol);
  }

  .source-link {
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.2em;
  }
}

/* ---------------------------------------------------------------- layout */

/* "Largo" = paisagem com pelo menos 768 px (mesma regra do céu e de lib/env.ts). */
@layer components {
  .col-text,
  .col-narrow {
    max-width: 100%;
  }

  .scene-canvas-wrap {
    opacity: 0;
    transition: opacity 700ms ease;
  }

  :root[data-scene="on"] .scene-canvas-wrap {
    opacity: 1;
  }

  /* Header: só texto, sem fundo. Sai de cena nas travessias (o céu cruzando a
     zona morta) e, no celular, ao rolar para baixo. */
  .site-header {
    position: fixed;
    inset: 0 0 auto 0;
    z-index: 40;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    height: var(--header-h);
    color: var(--fg);
    transition:
      transform 260ms var(--ease-out-quart),
      opacity 200ms linear;
  }

  :root[data-crossing] .site-header,
  .site-header[data-away="true"] {
    transform: translateY(-110%);
    opacity: 0;
  }

  .site-header__brand {
    text-decoration: none;
    font-size: 1rem;
    font-stretch: 118%;
    font-weight: 780;
    margin-right: auto;
  }

  .site-header__nav {
    display: none;
  }

  .site-header__nav ol {
    display: flex;
    gap: clamp(0.9rem, 1.8vw, 1.9rem);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .site-header__nav a {
    position: relative;
    display: inline-block;
    padding-block: 0.6rem;
    font-size: 0.875rem;
    font-weight: 500;
    text-decoration: none;
  }

  .site-header__nav a .num {
    font-weight: 700;
    margin-right: 0.1em;
  }

  .site-header__nav a::after {
    content: "";
    position: absolute;
    inset: auto 0 0.3rem 0;
    height: 1px;
    background: currentColor;
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 220ms var(--ease-out-quart);
  }

  .site-header__nav a[aria-current]::after {
    transform: scaleX(1);
  }

  @media (hover: hover) {
    .site-header__nav a:hover::after {
      transform: scaleX(1);
    }
  }

  .site-header__meta {
    display: flex;
    align-items: center;
    gap: 1.25rem;
  }

  .site-header__count {
    opacity: 0;
    transition: opacity 200ms linear;
  }

  .site-header__count[data-visible="true"] {
    opacity: 1;
  }

  .site-header__menu {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    padding-inline: 0.25rem;
    cursor: pointer;
  }

  .site-header__progress {
    position: absolute;
    left: var(--gutter);
    right: var(--gutter);
    bottom: 0;
    height: 1px;
    background: color-mix(in srgb, currentColor 22%, transparent);
  }

  .site-header__progress span {
    display: block;
    height: 100%;
    background: currentColor;
    transform-origin: left;
    transition: transform 400ms var(--ease-out-quart);
  }

  /* Menu do celular: folha simples, fundo próprio (não depende do céu). */
  .menu-sheet {
    --fg: var(--color-nuvem);
    position: fixed;
    inset: 0;
    z-index: 50;
    background: var(--color-noite);
    color: var(--color-nuvem);
    animation: sheet-in 240ms var(--ease-out-quart);
  }

  .menu-sheet__panel {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .menu-sheet__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: var(--header-h);
  }

  .menu-sheet__top button {
    min-height: 44px;
    cursor: pointer;
  }

  .menu-sheet__list {
    margin: 1.5rem 0 0;
    padding: 0;
    list-style: none;
  }

  .menu-sheet__list a {
    display: grid;
    grid-template-columns: 3.25rem minmax(0, 1fr);
    align-items: baseline;
    padding-block: 0.95rem;
    text-decoration: none;
    border-top: 1px solid rgb(244 247 250 / 0.16);
  }

  .menu-sheet__n {
    font-size: 2.25rem;
    font-stretch: 125%;
    font-weight: 800;
    line-height: 1;
  }

  .menu-sheet__list a[aria-current] .menu-sheet__n {
    color: var(--color-sol);
  }

  .menu-sheet__title {
    display: block;
    font-size: 1.25rem;
    font-stretch: 110%;
    font-weight: 650;
    line-height: 1.2;
    margin-bottom: 0.2rem;
  }

  /* Loader: linha fina na linha do horizonte, onde o produto pousa. */
  .loader-line {
    position: absolute;
    left: 8%;
    right: 8%;
    top: 44%;
    height: 1px;
    overflow: hidden;
    background: rgb(244 247 250 / 0.2);
  }

  .loader-line span {
    display: block;
    height: 100%;
    background: var(--color-sol);
    transform: scaleX(0);
    transform-origin: left;
  }

  .hero {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    min-height: 100svh;
    padding-top: var(--header-h);
    padding-bottom: 11svh;
  }

  .hero__title {
    margin-top: 1.1rem;
  }

  .hero__lead {
    margin-top: 1.75rem;
  }

  .hero__cue {
    position: absolute;
    left: var(--gutter);
    bottom: 0;
    width: 1px;
    height: 7svh;
    background: currentColor;
    opacity: 0.55;
  }

  .part {
    position: relative;
    padding-top: 32svh;
    padding-bottom: 8svh;
  }

  .part--tight {
    padding-top: 22svh;
  }

  .part__intro {
    margin-top: 2.75rem;
  }

  .block {
    margin-top: 18svh;
  }

  .block--first {
    margin-top: 0;
  }

  .block--last {
    padding-bottom: 14svh;
  }

  .chapter {
    display: grid;
    gap: 1rem 1.75rem;
  }

  .chapter__numeral {
    display: block;
  }

  .chapter__title {
    margin: 0;
    outline-offset: 8px;
  }

  .chapter__aula {
    margin-top: 0.9rem;
  }

  .groups {
    display: grid;
    gap: 2.25rem;
    margin-top: 2.25rem;
  }

  .groups__row {
    display: grid;
    gap: 0.75rem;
  }

  .groups__name {
    margin: 0;
  }

  .groups__items,
  .persona__facts,
  .benefits {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .groups__items {
    display: grid;
    gap: 0.45rem;
  }

  .groups__items li {
    position: relative;
    padding-left: 1.1rem;
  }

  .groups__items li::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0.75em;
    width: 0.5rem;
    height: 1px;
    background: currentColor;
  }

  .triad {
    display: grid;
    gap: 1.75rem;
    margin: 2.5rem 0 0;
    padding: 0;
    list-style: none;
  }

  .triad__item,
  .qa__row,
  .sector,
  .spec__row,
  .history__step {
    border-top: 1px solid color-mix(in srgb, currentColor 30%, transparent);
  }

  .triad__item {
    display: grid;
    gap: 0.5rem;
    padding-top: 1rem;
  }

  .highlight {
    margin-inline: 0;
  }

  .highlight blockquote {
    margin: 0;
  }

  .highlight__caption {
    margin-top: 1.1rem;
  }

  .fact__text {
    margin: 0;
  }

  .fact__number {
    font-size: 1.85em;
    font-stretch: 112%;
    font-weight: 720;
    line-height: 1;
    letter-spacing: -0.01em;
  }

  .fact__source {
    margin-top: 0.6rem;
  }

  .persona {
    display: grid;
    gap: 1.5rem;
  }

  .persona__monogram {
    font-size: clamp(4rem, 9vw, 7.5rem);
    font-stretch: 125%;
    font-weight: 800;
    line-height: 0.8;
    letter-spacing: -0.04em;
  }

  .persona__body h3 {
    margin: 0;
  }

  .distance {
    max-width: 26rem;
    margin: 1.75rem 0 0;
  }

  .distance__line {
    display: block;
    width: 100%;
    height: auto;
    overflow: visible;
  }

  .distance__line circle {
    fill: currentColor;
  }

  .distance__line line {
    stroke: currentColor;
    stroke-width: 1.5;
  }

  .distance__labels {
    display: flex;
    justify-content: space-between;
    margin-top: 0.4rem;
  }

  .persona__facts {
    display: grid;
    gap: 0.6rem;
    margin-top: 1.75rem;
  }

  .qa {
    display: grid;
    gap: 1.6rem;
    margin: 2.25rem 0 0;
    padding: 0;
    list-style: none;
  }

  .qa__row {
    display: grid;
    gap: 0.5rem;
    padding-top: 1.1rem;
  }

  .qa__q,
  .qa__a {
    margin: 0;
  }

  .split {
    display: grid;
    gap: 2rem;
  }

  .split__col h3 {
    margin: 0;
  }

  /* Cenas presas: palco de uma tela; no celular o texto fica embaixo e o 3D em cima. */
  .stage {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    height: 100svh;
    padding-top: var(--header-h);
    padding-bottom: 7svh;
  }

  .stage__text h3 {
    margin: 0;
  }

  .stage__tomorrow {
    margin: 2.75rem 0 0;
    max-width: 16ch;
  }

  /* Com movimento, o texto da noite e o "Amanhã…" trocam de lugar no mesmo
     ponto da tela; com reduced motion, ficam um embaixo do outro. */
  @media (prefers-reduced-motion: no-preference) {
    .stage__swap {
      display: grid;
    }

    .stage__swap > * {
      grid-area: 1 / 1;
      align-self: end;
    }

    .stage__tomorrow {
      margin-top: 0;
    }
  }

  .parts-list,
  .steps {
    margin: 2rem 0 0;
    padding: 0;
    list-style: none;
    display: grid;
  }

  .parts-list {
    gap: 0.5rem;
  }

  .parts-list li {
    display: grid;
    grid-template-columns: 1.75rem minmax(0, 1fr);
    align-items: baseline;
  }

  .parts-list__n {
    font-size: 0.875rem;
    font-weight: 700;
  }

  .parts-list__name {
    font-weight: 650;
    font-stretch: 106%;
  }

  .parts-list__role {
    display: block;
    font-size: 0.95rem;
    line-height: 1.45;
  }

  .steps {
    gap: 1.4rem;
  }

  .steps__title {
    margin: 0;
  }

  .steps__title .num {
    margin-right: 0.3em;
  }

  .steps__text {
    margin-top: 0.4rem;
  }

  .legend {
    margin-top: 2rem;
  }

  .legend__title {
    margin: 0;
    font-weight: 600;
  }

  .legend ul {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1.25rem;
    margin: 0.6rem 0 0;
    padding: 0;
    list-style: none;
  }

  .legend li {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  /* A cor da energia é luz dentro de um fio escuro, nunca tinta sobre o céu. */
  .legend__swatch {
    width: 1.6rem;
    height: 0.5rem;
    border-radius: 999px;
    border: 2px solid var(--color-grafite);
  }

  .energy-diagram {
    display: none;
    max-width: 40rem;
    margin: 2rem 0 0;
  }

  :root[data-webgl="off"] .energy-diagram {
    display: block;
  }

  .energy-diagram svg {
    display: block;
    width: 100%;
    height: auto;
  }

  .energy-diagram__label {
    font: 600 15px var(--font-sans);
  }

  .benefits {
    display: grid;
    gap: 1.2rem;
    max-width: 46ch;
    margin-top: 2.5rem;
  }

  .benefits__lead {
    font-weight: 720;
    font-stretch: 110%;
  }

  .table-scroll {
    margin-top: 2rem;
    overflow-x: auto;
    overscroll-behavior-x: contain;
  }

  .data-table {
    width: 100%;
    min-width: 34rem;
    border-collapse: collapse;
    font-size: 1rem;
    line-height: 1.4;
  }

  .data-table th,
  .data-table td {
    padding: 0.85rem 1.1rem 0.85rem 0;
    text-align: left;
    vertical-align: top;
    border-bottom: 1px solid color-mix(in srgb, currentColor 28%, transparent);
  }

  .data-table thead th {
    padding-bottom: 0.6rem;
    font-size: 0.875rem;
    font-stretch: 110%;
    font-weight: 650;
  }

  .data-table tbody th {
    font-weight: 600;
  }

  .data-table [data-ours] {
    font-weight: 700;
  }

  .data-table caption {
    caption-side: top;
    padding-bottom: 0.6rem;
    text-align: left;
  }

  .data-table tfoot th,
  .data-table tfoot td {
    padding-top: 1rem;
    border-bottom: 0;
    font-weight: 720;
  }

  .data-table--costs {
    min-width: 20rem;
  }

  .num-col {
    text-align: right !important;
    padding-right: 0 !important;
    white-space: nowrap;
  }

  .estimate {
    font-size: 0.875rem;
    font-weight: 500;
    white-space: nowrap;
  }

  /* Cartão de embarque (Aula 5): fundo e texto próprios, picote sutil. A
     sombra fica no invólucro porque a máscara dos recortes cortaria a sombra. */
  .ticket-wrap {
    margin-top: 2rem;
    filter: drop-shadow(0 14px 18px rgb(20 33 61 / 0.28)) drop-shadow(0 2px 3px rgb(20 33 61 / 0.14));
  }

  .ticket {
    --fg: var(--color-noite);
    position: relative;
    display: grid;
    margin: 0;
    border-radius: 18px;
    background: var(--color-nuvem);
    color: var(--color-noite);
  }

  .ticket__main {
    padding: 1.75rem;
  }

  .ticket__fields {
    display: grid;
    gap: 1.25rem;
    margin: 0;
  }

  .ticket__label {
    font-weight: 650;
  }

  .ticket__field dd {
    margin: 0.3rem 0 0;
  }

  .ticket__stub {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    padding: 1.5rem 1.75rem;
    border-top: 2px dashed rgb(20 33 61 / 0.25);
  }

  .ticket__brand {
    font-size: 1.75rem;
    font-stretch: 125%;
    font-weight: 800;
    line-height: 1;
  }

  .sectors {
    display: grid;
    gap: 3.25rem;
    margin-top: 2.5rem;
  }

  .sector {
    display: grid;
    gap: 1rem;
    padding-top: 1.5rem;
  }

  .sector__name {
    margin: 0;
  }

  .price {
    margin-top: 1.75rem;
  }

  .swatches {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
    margin: 1rem 0 0;
    padding: 0;
    list-style: none;
  }

  .swatches li {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  .swatches__chip {
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 50%;
    box-shadow: inset 0 0 0 1px rgb(20 33 61 / 0.3);
  }

  .slogan {
    margin-top: 1.75rem;
  }

  .spec {
    display: grid;
    margin: 1.5rem 0 0;
  }

  .spec__row {
    display: grid;
    gap: 0.25rem;
    padding-block: 0.85rem;
  }

  .spec dd {
    margin: 0;
  }

  .history {
    display: grid;
    gap: 1.5rem;
    margin: 1.5rem 0 0;
    padding: 0;
    list-style: none;
  }

  .history__step {
    display: grid;
    grid-template-columns: 1.75rem minmax(0, 1fr);
    padding-top: 1rem;
  }

  .timeline {
    position: relative;
    display: grid;
    margin: 2.5rem 0 0;
    padding: 0;
    list-style: none;
  }

  .timeline__block {
    position: relative;
    padding: 0 0 2rem 1.4rem;
    border-left: 2px solid currentColor;
  }

  .timeline__block::before {
    content: "";
    position: absolute;
    left: -7px;
    top: 0.2rem;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: currentColor;
  }

  .timeline__time,
  .timeline__sector {
    margin: 0;
  }

  .timeline__sector {
    margin-top: 0.35rem;
  }

  .timeline__text {
    margin-top: 0.6rem;
  }

  .manifesto {
    display: grid;
    gap: 1.75rem;
  }

  .manifesto p {
    margin: 0;
  }

  .final {
    margin-top: 16svh;
  }

  .final__slogan {
    max-width: 14ch;
    margin: 0;
  }

  .site-footer {
    padding-block: 10svh 6svh;
    border-top: 1px solid color-mix(in srgb, currentColor 25%, transparent);
  }

  .site-footer__sources {
    display: grid;
    gap: 0.4rem;
    margin: 0.75rem 0 0;
    padding: 0;
    list-style: none;
  }

  /* No celular, a lista de peças mostra só os nomes (as funções continuam
     para o leitor de tela; a Fase 4 põe a legenda numerada). */
  @media not all and (min-width: 768px) and (min-aspect-ratio: 1/1) {
    .parts-list__role,
    .steps__text {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
  }

  @media (min-width: 768px) and (min-aspect-ratio: 1/1) {
    .col-text {
      max-width: calc(60vw - var(--gutter));
    }

    .col-narrow {
      max-width: min(34rem, calc(44vw - var(--gutter)));
    }

    .site-header__nav {
      display: block;
    }

    .site-header__menu {
      display: none;
    }

    .site-header[data-away="true"] {
      transform: none;
      opacity: 1;
    }

    :root[data-crossing] .site-header {
      transform: translateY(-110%);
      opacity: 0;
    }

    .loader-line {
      left: 62%;
      right: 5%;
      top: auto;
      bottom: 16%;
    }

    .hero {
      justify-content: center;
      padding-bottom: 0;
    }

    .chapter {
      grid-template-columns: auto minmax(0, 1fr);
      align-items: end;
    }

    .groups__row {
      grid-template-columns: 13rem minmax(0, 1fr);
      gap: 2rem;
    }

    .groups__row[data-offset] {
      margin-left: 3rem;
    }

    .triad {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 2rem;
    }

    .persona {
      grid-template-columns: auto minmax(0, 1fr);
      gap: 2.5rem;
      align-items: start;
    }

    .qa__row {
      grid-template-columns: 15rem minmax(0, 1fr);
      gap: 2rem;
    }

    .split {
      grid-template-columns: 1fr 1fr;
      gap: 0;
    }

    .split__col:first-child {
      padding-right: 2rem;
    }

    .split__col + .split__col {
      padding-left: 2rem;
      border-left: 1px solid color-mix(in srgb, currentColor 30%, transparent);
    }

    .stage {
      justify-content: center;
      padding-bottom: 0;
    }

    .ticket {
      grid-template-columns: minmax(0, 1fr) 11rem;
      /* Dois recortes no picote (em cima e embaixo). */
      mask:
        radial-gradient(circle at calc(100% - 11rem) 0, transparent 11px, #000 11.5px) top / 100% 51% no-repeat,
        radial-gradient(circle at calc(100% - 11rem) 100%, transparent 11px, #000 11.5px) bottom / 100% 51% no-repeat;
    }

    .ticket__fields {
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem 2rem;
    }

    .ticket__stub {
      justify-content: flex-end;
      border-top: 0;
      border-left: 2px dashed rgb(20 33 61 / 0.25);
    }

    .sector {
      grid-template-columns: 11rem minmax(0, 1fr);
      gap: 2rem;
    }

    .spec__row {
      grid-template-columns: 13rem minmax(0, 1fr);
      gap: 2rem;
    }

    .history {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 2rem;
    }

    .timeline {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .timeline__block {
      padding: 1.6rem 1.5rem 0 0;
      border-left: 0;
      border-top: 2px solid currentColor;
    }

    .timeline__block::before {
      left: 0;
      top: -7px;
    }
  }
}

@keyframes sheet-in {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
}

@media (prefers-reduced-motion: reduce) {
  :root {
    transition: none;
  }

  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
  }

  .menu-sheet {
    animation: none;
  }

  /* Sem pins: cada cena vira um bloco normal no estado final. */
  .stage {
    height: auto;
    min-height: 100svh;
    padding-block: 18svh;
  }
}
```

## src/content/company.ts

```ts
// Única fonte de fatos da empresa: seção 3 do BRIEF.md ("Empresa").

export const company = {
  name: "SunTech",
  school: "Colégio Ideal",
  event: "Feira de Empreendedorismo",
  semester: "2º semestre",
  whoWeAre:
    "Uma equipe de estudantes. A empresa nasceu dos problemas de hoje: a tecnologia avança, e o planeta pede sustentabilidade.",
  whatWeDo:
    "Soluções acessíveis e ecológicas com energia solar. A primeira é o carregador solar portátil.",
  forWhom:
    "Principalmente quem vive em lugares remotos; também quem passa o dia longe da tomada.",
  differentiator:
    "Diferente dos power banks convencionais, ele se recarrega com a luz do sol, com um painel bem maior que o dos power banks “solares” comuns.",
  /** Propósito, no plano de voo da Aula 5. */
  mission: "Levar energia limpa e acessível a quem vive longe da tomada.",
  /** Destino. */
  vision: "Um mundo em que estar longe da tomada não signifique ficar sem energia.",
  /** Trajeto. */
  valuesStrategy:
    "Sustentabilidade, acessibilidade, inovação e transparência. Começar pelo carregador solar, validar na feira e depois criar mais produtos solares.",
  operations:
    "Compramos os componentes, montamos e testamos cada carregador, vendemos na feira, nas redes e no site, e oferecemos garantia e peças de reposição.",
  /** Nomes de integrantes só com a autorização de cada um. */
  team: "Equipe SunTech",
  presentedAt: "Apresentação na escola, em novembro de 2025",
  history: [
    { title: "A ideia", text: "Surgiu ao pensar em quem vive longe da tomada." },
    {
      title: "O protótipo",
      text: "A equipe montou o protótipo com um painel solar dobrável, uma bateria de lítio e os módulos de carga numa caixa.",
    },
    {
      title: "Os testes",
      text: "Na apresentação na escola, em novembro de 2025, uma lâmpada fez o papel do sol para mostrar a carga funcionando.",
    },
  ],
};
```

## src/content/copy.ts

```ts
// Textos da página (seção 7 do BRIEF.md). Fatos com número vêm de
// product.ts, company.ts e feira.ts; aqui ficam só as palavras.

import { company } from "./company";
import { product } from "./product";

export const copy = {
  hero: {
    productName: product.name,
    title: "Carregue o celular com a luz do sol.",
    lead: `O ${product.name} junta um painel solar dobrável e uma bateria. Ele guarda a energia do dia para você usar quando precisar.`,
  },

  problema: {
    opening:
      "Todo empreendimento começa com um problema de verdade. O nosso aparece quando a energia some.",
    opportunitiesTitle: "Lista de oportunidades",
    opportunities: [
      {
        group: "Energia no dia a dia",
        items: [
          "O celular descarrega longe da tomada.",
          "A luz cai em dia de chuva.",
          "Em passeios e aulas de campo não há onde carregar.",
        ],
      },
      {
        group: "Soluções que não resolvem",
        items: [
          "O power bank comum só recarrega na tomada.",
          "Os power banks “solares” baratos têm placas pequenas, que quase não carregam.",
          "Energia solar para casa ainda custa caro.",
        ],
      },
      {
        group: "Sustentabilidade",
        items: [
          "Pilhas e baterias vão para o lixo comum.",
          "Pouca gente entende como a energia solar funciona.",
        ],
      },
    ],
    question: "Quais problemas incomodam quem depende de energia longe da tomada?",
    questionCaption: "A pergunta norteadora e as nossas três respostas.",
    problems: [
      "O celular descarrega e não há onde carregar.",
      "A energia é instável e falha justamente quando mais se precisa.",
      "As alternativas que existem dependem da tomada ou não funcionam de verdade.",
    ],
    situation:
      "Quem vive em lugares remotos ou com energia instável fica sem carregar o celular, que é o seu principal meio de comunicação, trabalho e segurança.",
    situationCaption: "Situação-problema escolhida pela equipe.",
    whyTitle: "Por que isso importa para a sociedade",
    whyAccess:
      "Energia é acesso: é com o celular carregado que uma pessoa fala com a família, trabalha, estuda e pede ajuda numa emergência.",
    whyClean:
      "E a energia do sol é limpa: cada carga feita pelo sol é uma carga a menos puxada da rede.",
  },

  cliente: {
    personaTitle: "Persona",
    persona: {
      name: "Seu Antônio",
      initials: "SA",
      age: "54 anos",
      role: "produtor rural",
      farm: "Sítio",
      city: "Cidade",
      distanceKm: 40,
      facts: [
        "Mora num sítio a 40 km da cidade, e a luz cai toda vez que chove.",
        "Usa o celular para vender a produção, falar com a família e marcar consulta médica.",
        "É prático e desconfia de novidade cara. Precisa de algo que funcione sem manual.",
      ],
    },
    synthesis:
      "Nosso cliente é o produtor rural que mora longe da cidade, que enfrenta quedas de energia e falta de tomada para manter o celular carregado, e já tentou usar power bank comum e carregar o celular no carro, mas não resolveu seu problema.",
    synthesisCaption: "A frase-síntese do nosso cliente.",
    reflectionTitle: "Reflexão",
    reflection: [
      {
        q: "Quem é a pessoa mais afetada?",
        a: "Quem vive em áreas rurais e remotas, com energia instável ou sem energia, e depende do celular.",
      },
      {
        q: "Por que isso atrapalha a vida dela?",
        a: "Ela fica sem comunicação justamente quando mais precisa, perde vendas e gasta tempo e dinheiro indo até a cidade para carregar o celular.",
      },
      {
        q: "O que ela já tentou, e por que não deu certo?",
        a: "Power bank comum, que também acaba e precisa de tomada; carregar no carro ou no gerador, que gasta combustível; e power bank solar barato, que tem placa pequena demais e quase não carrega.",
      },
    ],
    personaLabel: "Persona",
    personaSummary: "Seu Antônio, a pessoa por trás do problema.",
    audienceLabel: "Público-alvo",
    audience:
      "Homens e mulheres de 25 a 65 anos que moram ou trabalham em áreas rurais e remotas, com energia instável, e que dependem do celular para trabalhar e se comunicar.",
    othersLabel: "Outros públicos",
    others:
      "Quem trabalha na rua (entregadores, vendedores e motoristas de app), quem faz trilha e acampa, e qualquer pessoa numa queda de energia.",
  },

  solucao: {
    dlightTitle: "Caça ao diferencial: d.light",
    dlightWhy:
      "Por que escolhemos: trabalha com energia solar, como a nossa ideia, e também nasceu numa sala de aula, em Stanford.",
    dlight: [
      {
        q: "Qual problema resolveu?",
        a: "Famílias sem energia elétrica usavam lamparinas de querosene, que são caras, poluentes e perigosas.",
      },
      { q: "Para quem?", a: "Famílias de baixa renda em áreas rurais, principalmente na África e na Ásia." },
      { q: "O que fez de diferente?", a: "Produtos solares baratos e pagamento em parcelas pequenas pelo celular." },
      { q: "Como a vida dessas pessoas mudou?", a: "Luz segura à noite, celular carregado em casa e crianças estudando à noite." },
    ],
    solutionTitle: "A nossa solução",
    solution: `O que a ${company.name} oferece é um produto. O ${product.name} é um power bank com painel solar dobrável: de dia, ele guarda a energia do sol; depois, carrega o celular longe da tomada.`,
    insideTitle: "Por dentro, cada peça tem uma função.",
    howTitle: "Como funciona",
    howLegendTitle: "Cores da energia",
    staysTitle: "O sol se põe. A energia fica.",
    staysText: `À noite, o ${product.name} carrega o seu celular com o que guardou durante o dia.`,
    staysNote: `Simulação. Estimativa: ${product.estimates.phoneCharges}.`,
    tomorrow: "Amanhã, o sol recarrega tudo de novo.",
    lifeTitle: "Como isso melhora a vida do cliente?",
    life: [
      { title: "Mais acessível", text: "Leva energia aonde a tomada não chega." },
      {
        title: "Mais simples",
        text: "É só abrir o painel no sol e ligar o cabo 3 em 1, que serve para qualquer celular.",
      },
      {
        title: "Economia",
        text: "Quem mora longe muitas vezes precisa ir até a cidade ou pagar para carregar o celular. Pelo sol, a carga sai de graça.",
      },
      { title: "Sustentável", text: "Energia limpa, sem depender da rede." },
    ],
    diffTitle: "O que fazemos de diferente?",
    diffColumns: ["Power bank comum", "Power bank solar comum", company.name],
    diffRows: [
      {
        label: "Recarrega com",
        cells: [
          "Tomada",
          "Placa pequena, que costuma levar dias de sol, ou tomada",
          "Painel dobrável grande ou tomada (USB-C)",
        ],
      },
      {
        label: "Longe da rede",
        cells: ["Funciona até a carga acabar", "Quase não recarrega", "Volta a carregar sempre que tem sol"],
      },
      { label: "Conserto", cells: ["Difícil", "Difícil", "Peças comuns, fáceis de trocar"] },
    ],
  },

  empresa: {
    whoTitle: "Quem somos",
    who: `A ${company.name} nasceu de uma pergunta: como usar a tecnologia sem deixar a sustentabilidade de lado? Somos uma equipe de estudantes que transformou essa pergunta num carregador que funciona com a luz do sol.`,
    flightTitle: "Plano de voo",
    flight: [
      { field: "Propósito", value: company.mission },
      { field: "Destino", value: company.vision },
      { field: "Trajeto", value: company.valuesStrategy },
      { field: "Operações", value: company.operations },
    ],
    sectorsTitle: "Divisão de setores",
    products: {
      name: "Produtos",
      lead: "Lidera o protótipo.",
      text: "Escolhe os componentes da ficha técnica e faz os testes com uma lâmpada no lugar do sol, medindo quanto tempo a bateria leva para carregar.",
    },
    finance: {
      name: "Finanças",
      lead: "Cuida dos custos e do preço.",
      costsTitle: "Custos",
      priceLabel: "Preço de venda",
      strategy:
        "Estratégia: destacar o painel maior que o dos concorrentes, oferecer parcelamento (inspirado na d.light) e comprar peças em quantidade para baixar o custo.",
    },
    marketing: {
      name: "Marketing",
      lead: "Cuida da marca e do estande.",
      identity: "Identidade visual: o nome, as cores de sol e céu e o slogan.",
      slogan: "Energia do sol, onde você estiver.",
      focus: "Foco na dor do Seu Antônio.",
      booth:
        "Estande: banner com o slogan e os diferenciais, protótipo aberto mostrando as peças, demonstração com a lâmpada e QR code para este site.",
    },
    prototypeTitle: "Materializando a ideia: o protótipo",
    prototype:
      "Nosso protótipo é funcional: o painel carrega a bateria de verdade, e a caixa carrega o celular. No estande, o visitante vê as peças por dentro e testa a carga com a lâmpada fazendo o papel do sol.",
    specTitle: "Ficha técnica",
    estimateLabel: "estimativa",
    historyTitle: "Nasceu como projeto de escola",
  },

  pitch: {
    title: "Nosso pitch em 3 minutos",
    start: "Iniciar o modo pitch",
    hint: "Espaço pausa. Esc sai.",
    pause: "Pausar",
    resume: "Continuar",
    exit: "Sair",
    speaking: "Fala agora",
  },

  jovem: {
    manifesto: [
      "Nossa geração cresceu com a tecnologia na mão e com o planeta pedindo mudança. Para nós, empreender não é só abrir um negócio: é resolver um problema real sem piorar o mundo.",
      `A ${company.name} mostra o que jovens podem fazer quando juntam inovação, responsabilidade social e sustentabilidade: pegamos o problema de quem vive longe da tomada e transformamos num produto que funciona.`,
      "Ainda faltam muitas coisas, como apoio financeiro, capacitação e planejamento. Mas a feira provou que dá para começar com uma ideia, um protótipo e vontade de aprender.",
    ],
    slogan: "Energia do sol, onde você estiver.",
    cta: "Ver o pitch em 3 minutos",
  },

  footer: {
    credit: `Conceito de produto criado a partir do protótipo da equipe ${company.name}, num projeto escolar do ${company.school}. Design e código do site:`,
    author: "Kaique Calefi",
    sourcesTitle: "Fontes",
  },
};
```

## src/content/feira.ts

```ts
// Feira de Empreendedorismo: as 6 partes na ordem das aulas, os dados
// externos (sempre com fonte, seção 3 do BRIEF.md) e o roteiro do pitch.

import { brl } from "./format";
import { product } from "./product";

export type PartId = "problema" | "cliente" | "solucao" | "empresa" | "pitch" | "jovem";

export interface Part {
  id: PartId;
  n: number;
  /** Rótulo curto do header ("3 Solução"). */
  nav: string;
  title: string;
  aula: string;
}

export const partsOfFair: Part[] = [
  { id: "problema", n: 1, nav: "Problema", title: "O problema", aula: "Aula 2: Kickoff inspirador" },
  { id: "cliente", n: 2, nav: "Cliente", title: "O cliente", aula: "Aula 3: Conhecendo o cliente" },
  { id: "solucao", n: 3, nav: "Solução", title: "A solução e o diferencial", aula: "Aula 4: Diferenciais reais e solução" },
  { id: "empresa", n: 4, nav: "Empresa", title: "A empresa", aula: "Aula 5: Criação da empresa" },
  { id: "pitch", n: 5, nav: "Pitch", title: "O pitch", aula: "Aula 6: Pitch" },
  { id: "jovem", n: 6, nav: "Jovem", title: "O papel do jovem no empreendedorismo do futuro", aula: "Atividade AQ3" },
];

export interface Source {
  label: string;
  url: string;
}

export const sources = {
  iema: {
    label: "Poder360, com dados do IEMA",
    url: "https://www.poder360.com.br/brasil/quase-1-milhao-nao-tem-acesso-a-energia-eletrica-na-regiao-da-amazonia-legal/",
  },
  idec: { label: "Idec", url: "https://idec.org.br/node/29026" },
  dlight: { label: "d.light", url: "https://www.dlight.com" },
  earthshot: { label: "Earthshot Prize", url: "https://earthshotprize.org/winners-finalists/d-light/" },
} satisfies Record<string, Source>;

/** Um dado externo: texto antes e depois do número (que conta até o valor). */
export interface Fact {
  before: string;
  value: number;
  after: string;
  sources: Source[];
}

export const facts = {
  semEnergia: {
    before: "",
    value: 990103,
    after: " brasileiros viviam sem energia elétrica na Amazônia Legal, segundo um estudo do IEMA de 2019.",
    sources: [sources.iema],
  },
  apagaoAmapa: {
    before: "Em novembro de 2020, o Amapá passou mais de ",
    value: 20,
    after: " dias com falta de energia.",
    sources: [sources.idec],
  },
  dlightAlcance: {
    before: "A empresa já chegou a mais de ",
    value: 150,
    after: " milhões de pessoas.",
    sources: [sources.dlight, sources.earthshot],
  },
} satisfies Record<string, Fact>;

export type Sector = "Marketing" | "Produtos" | "Finanças";

export interface PitchBlock {
  from: string;
  to: string;
  sector: Sector;
  text: string;
}

/** Linha do tempo do pitch em 3 minutos (Aula 6). */
export const pitchTimeline: PitchBlock[] = [
  {
    from: "0:00",
    to: "1:00",
    sector: "Marketing",
    text: "O problema e a persona (o Seu Antônio sem energia), a marca e a proposta: “Energia do sol, onde você estiver.”",
  },
  {
    from: "1:00",
    to: "2:00",
    sector: "Produtos",
    text: "A solução e o valor: abre o painel, usa a lâmpada no lugar do sol, liga no celular e mostra os diferenciais.",
  },
  {
    from: "2:00",
    to: "3:00",
    sector: "Finanças",
    text: `Custos e preço justo: custo de ${brl(product.costTotalBRL)}, preço de ${brl(product.priceBRL)} e parcelamento.`,
  },
];

export interface PitchStop {
  /** Segundo em que a parada começa (0 a 180). */
  at: number;
  sector: Sector;
  label: string;
  /** `data-section` ou `id` do alvo na página. */
  target: string;
  /** Em cenas presas, trecho do pin percorrido durante a parada (0 a 1). */
  from?: number;
  to?: number;
}

/** Modo pitch: exatamente 180 s, em sincronia com a linha do tempo acima. */
export const PITCH_SECONDS = 180;

export const pitchStops: PitchStop[] = [
  { at: 0, sector: "Marketing", label: "Situação-problema", target: "situacao-problema" },
  { at: 30, sector: "Marketing", label: "Persona", target: "persona" },
  { at: 60, sector: "Produtos", label: "Por dentro", target: "por-dentro", from: 0.2, to: 0.85 },
  { at: 85, sector: "Produtos", label: "Como funciona", target: "como-funciona", from: 0.1, to: 0.75 },
  { at: 110, sector: "Produtos", label: "Diferencial", target: "diferencial-tabela" },
  { at: 120, sector: "Finanças", label: "Custos", target: "custos" },
  { at: 160, sector: "Finanças", label: "Preço", target: "preco" },
];
```

## src/content/format.ts

```ts
// Formatação pt-BR (seção 3 do BRIEF: "3,7 V; 2.600 mAh; R$ 249; 140 × 75 mm").
// O espaço entre número e unidade é inseparável, para a unidade nunca quebrar
// sozinha na linha de baixo.

const NBSP = " ";

function decimals(value: number): number {
  return Number.isInteger(value) ? 0 : 1;
}

/** 2600 → "2.600"; 3.7 → "3,7". */
export function num(value: number, digits = decimals(value)): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

/** 3.7, "V" → "3,7 V". */
export function unit(value: number, symbol: string): string {
  return `${num(value)}${NBSP}${symbol}`;
}

/** 249 → "R$ 249" (sem centavos, como no brief). */
export function brl(value: number): string {
  return `R$${NBSP}${num(value)}`;
}

/** {150, 100, 40} → "150 × 100 × 40 mm". */
export function mm(dims: readonly number[]): string {
  return `${dims.map((d) => num(d)).join(`${NBSP}×${NBSP}`)}${NBSP}mm`;
}
```

## src/content/product.ts

```ts
// Única fonte de fatos do produto: seção 3 do BRIEF.md ("Produto" e "Custos").
// Nenhum número do produto aparece no site fora daqui. Textos que citam
// números são montados aqui, com os formatadores pt-BR de `format.ts`.

import { brl, mm, num, unit } from "./format";

export interface Dimensions {
  /** mm */
  length: number;
  width: number;
  height: number;
}

export interface CostItem {
  item: string;
  brl: number;
}

export interface SpecRow {
  label: string;
  value: string;
  /** true = aparece com o rótulo "estimativa". */
  estimate?: boolean;
}

export interface PartInfo {
  id: PartId;
  name: string;
  role: string;
}

export type PartId =
  | "modulos"
  | "fiacao"
  | "bateria"
  | "saidas"
  | "luz"
  | "vidro"
  | "celulas"
  | "base";

export type EnergyStepId = "captar" | "proteger" | "guardar" | "entregar";

export interface EnergyStep {
  id: EnergyStepId;
  n: number;
  title: string;
  text: string;
  /** Token de cor da etapa (ver `@theme` em index.css). */
  color: "energia-luz" | "energia-painel" | "energia-guardada" | "energia-saida";
  legend: string;
}

/** Proporções do 3D enquanto as medidas reais não forem preenchidas (seção 3). */
export const DEFAULT_PROPORTIONS = {
  case: { length: 150, width: 100, height: 40 },
  plate: { length: 200, width: 150, height: 6 },
} as const satisfies Record<string, Dimensions>;

const measurements: {
  panelOpen: Dimensions | null;
  panelClosed: Dimensions | null;
  case: Dimensions | null;
} = {
  panelOpen: null, // TODO: preencher
  panelClosed: null, // TODO: preencher
  case: null, // TODO: preencher
};

const weightGrams: number | null = null; // TODO: preencher

const panel = { plates: 2, voltsEach: 6, wattsEach: 3, volts: 6, watts: 6 };
const battery = { cells: 2, voltsEach: 3.7, mAhEach: 2600, mAh: 5200, whApprox: 19 };
const charger = { module: "TP4056", protection: "DW01", maxAmps: 1 };
const converter = { fromVolts: 3.7, toVolts: 5, maxAmps: 1 };
const output = { volts: 5 };

const costs: CostItem[] = [
  { item: `${num(panel.plates)} placas solares ${unit(panel.voltsEach, "V")} ${unit(panel.wattsEach, "W")}`, brl: 70 },
  { item: `${num(battery.cells)} baterias 18650 + suporte`, brl: 45 },
  { item: `Módulo de carga ${charger.module}`, brl: 7 },
  { item: `Conversor ${unit(output.volts, "V")} com USB`, brl: 8 },
  { item: "Cabo 3 em 1", brl: 20 },
  { item: "Caixa, dobradiças e moldura", brl: 25 },
  { item: "Diodo, chave, LED, fios e solda", brl: 10 },
];

export const product = {
  name: "Carregador Solar SunTech",
  format:
    "Duas partes: um painel solar dobrável (duas placas unidas por dobradiça, que abrem como um livro) e uma caixa com a bateria e a eletrônica, cuja tampa abre para cima e de onde sai o cabo de carga.",
  colorMaterial: "Caixa preta fosca; painel com moldura escura",
  measurements,
  weightGrams,
  panel,
  battery,
  charger,
  converter,
  output,
  priceBRL: 249,
  costs,
  /** Soma da tabela (R$ 185 na seção 3 do brief). */
  costTotalBRL: costs.reduce((sum, row) => sum + row.brl, 0),
  /** Margem sobre o preço de venda, como está no brief. */
  margin: "cerca de 25%",
  estimates: {
    chargeSun: "de 6 a 8 horas de sol forte",
    chargeOutlet: "cerca de 6 horas na tomada",
    phoneCharges: "cerca de 1 carga completa de um celular comum",
  },
};

/** Medidas usadas pelo 3D: as reais quando existirem, senão as proporções padrão. */
export function caseDimensions(): Dimensions {
  return product.measurements.case ?? DEFAULT_PROPORTIONS.case;
}

export function plateDimensions(): Dimensions {
  const closed = product.measurements.panelClosed;
  if (!closed) return DEFAULT_PROPORTIONS.plate;
  return { length: closed.length, width: closed.width, height: closed.height / 2 };
}

const v = (value: number) => unit(value, "V");

/** Ficha técnica: só os campos preenchidos, estimativas marcadas. */
export function specSheet(): SpecRow[] {
  const rows: SpecRow[] = [
    {
      label: "Painel solar",
      value: `${num(panel.plates)} placas monocristalinas de ${v(panel.voltsEach)} e ${unit(panel.wattsEach, "W")} cada, em paralelo (${v(panel.volts)} e ${unit(panel.watts, "W")} no total)`,
    },
    {
      label: "Bateria",
      value: `${num(battery.cells)} células de lítio 18650 de ${v(battery.voltsEach)} e ${unit(battery.mAhEach, "mAh")} em paralelo: ${unit(battery.mAh, "mAh")}, cerca de ${unit(battery.whApprox, "Wh")}`,
    },
    {
      label: "Controle e proteção",
      value: `Módulo ${charger.module} com proteção ${charger.protection} (sobrecarga, descarga profunda e curto-circuito), carga de até ${unit(charger.maxAmps, "A")}`,
    },
    {
      label: "Conversor de tensão",
      value: `Módulo boost de ${v(converter.fromVolts)} para ${v(converter.toVolts)}, até ${unit(converter.maxAmps, "A")}`,
    },
    {
      label: "Entradas",
      value: "Cabo do painel e USB-C, para recarregar na tomada",
    },
    {
      label: "Saída",
      value: `USB-A de ${v(output.volts)} com cabo 3 em 1 (USB-C, Lightning e micro-USB)`,
    },
    {
      label: "Outros componentes",
      value:
        "Diodo Schottky 1N5819, chave liga/desliga da saída, LED azul de saída ligada e LEDs de carga do módulo (vermelho carregando, azul completo)",
    },
    {
      label: "Tempo de carga",
      value: `${product.estimates.chargeSun}; ${product.estimates.chargeOutlet}`,
      estimate: true,
    },
    { label: "Cargas de celular", value: product.estimates.phoneCharges, estimate: true },
    { label: "Cor e material", value: product.colorMaterial },
  ];

  const m = product.measurements;
  if (m.panelOpen) rows.push({ label: "Painel aberto", value: mm([m.panelOpen.length, m.panelOpen.width, m.panelOpen.height]) });
  if (m.panelClosed) rows.push({ label: "Painel fechado", value: mm([m.panelClosed.length, m.panelClosed.width, m.panelClosed.height]) });
  if (m.case) rows.push({ label: "Caixa", value: mm([m.case.length, m.case.width, m.case.height]) });
  if (product.weightGrams !== null) rows.push({ label: "Peso", value: unit(product.weightGrams, "g") });

  rows.push({ label: "Preço", value: brl(product.priceBRL) });
  return rows;
}

/** Peças que aparecem na cena "Por dentro", na ordem em que se separam. */
export const parts: PartInfo[] = [
  { id: "modulos", name: "Módulos de carga", role: `O controlador ${charger.module} carrega a bateria no ritmo certo; o conversor eleva a tensão para o USB.` },
  { id: "fiacao", name: "Fiação", role: "Leva a corrente entre as peças: vermelho é o positivo, preto é o negativo." },
  { id: "bateria", name: "Bateria de lítio", role: "Guarda a energia do sol até você precisar." },
  { id: "saidas", name: "Saídas e chave", role: `USB-A de ${v(output.volts)} para o cabo 3 em 1; a chave liga e desliga a saída.` },
  { id: "luz", name: "Luz indicadora", role: "O LED azul acende quando a saída está ligada." },
  { id: "vidro", name: "Vidro do painel", role: "Protege as células e deixa a luz passar." },
  { id: "celulas", name: "Células solares", role: "Transformam luz em eletricidade." },
  { id: "base", name: "Base e dobradiça", role: "Seguram as placas e deixam o painel abrir como um livro." },
];

/** "Como funciona": as quatro etapas do caminho da energia. */
export const energyPath: EnergyStep[] = [
  {
    id: "captar",
    n: 1,
    title: "Captar",
    text: "O painel transforma luz em eletricidade: a luz movimenta elétrons no silício, e esse movimento vira corrente.",
    color: "energia-luz",
    legend: "Luz",
  },
  {
    id: "proteger",
    n: 2,
    title: "Proteger",
    text: "O controlador carrega a bateria no ritmo certo e evita sobrecarga. O diodo impede que a energia volte para o painel à noite.",
    color: "energia-painel",
    legend: "Corrente do painel",
  },
  {
    id: "guardar",
    n: 3,
    title: "Guardar",
    text: "A bateria de lítio armazena a energia até você precisar, de dia ou de noite.",
    color: "energia-guardada",
    legend: "Energia guardada",
  },
  {
    id: "entregar",
    n: 4,
    title: "Entregar",
    text: `O conversor eleva os ${v(converter.fromVolts)} da bateria para os ${v(converter.toVolts)} do USB, e o celular carrega normalmente.`,
    color: "energia-saida",
    legend: `Saída de ${v(output.volts)}`,
  },
];

/** Rótulo do callout da etapa 4 ("3,7 V → 5 V"); a seta é desenhada em SVG. */
export const conversionLabel = { from: v(converter.fromVolts), to: v(converter.toVolts) };
```

## src/lib/env.ts

```ts
/** Flags de URL e de mídia, lidas uma vez. */

const params = typeof window === "undefined" ? new URLSearchParams() : new URLSearchParams(window.location.search);

export const flags = {
  /** `?debug`: leva + r3f-perf. */
  debug: params.has("debug"),
  /** `?snap`: expõe `window.__ready`, `__sections`, `__lenis` e a sonda do céu. */
  snap: params.has("snap"),
  /** `?nowebgl`: força o fallback sem WebGL (teste do checklist). */
  noWebgl: params.has("nowebgl"),
  /** `?goto=<id>`: pula direto para uma seção depois de pronto. */
  goto: params.get("goto"),
};

/** Ganchos de teste só em desenvolvimento ou com `?snap` (seção 5 do brief). */
export const testHooks = import.meta.env.DEV || flags.snap;

export const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/**
 * Layout "largo": texto à esquerda e produto à direita. Segue a orientação da
 * tela, como o céu (daylight.ts): um tablet em pé usa o layout empilhado.
 */
export const WIDE = "(min-width: 768px) and (min-aspect-ratio: 1/1)";

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia(REDUCED_MOTION).matches;
}

/** Ponteiro fino (mouse/trackpad): cursor customizado e botão magnético. */
export function hasFinePointer(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}
```

## src/lib/gsap.ts

```ts
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// No chunk inicial só entram o núcleo e o ScrollTrigger. SplitText,
// CustomEase e DrawSVG carregam sob demanda em `lib/split.ts`.
gsap.registerPlugin(ScrollTrigger);

// A barra de endereço do celular muda a altura da janela ao rolar; sem isto,
// cada mudança dispara um refresh e os pins pulam.
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger };
```

## src/lib/lenis.ts

```ts
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "./gsap";
import { testHooks } from "./env";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

let lenis: Lenis | null = null;

const raf = (time: number) => lenis?.raf(time * 1000);

/** Lenis sincronizado com o GSAP, exatamente como a seção 5 do brief pede. */
export function startLenis(): Lenis {
  if (lenis) return lenis;
  lenis = new Lenis({ autoRaf: false });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);
  if (testHooks) window.__lenis = lenis;
  return lenis;
}

/** Destrói o Lenis (reduced motion volta ao scroll nativo). */
export function destroyLenis(): void {
  if (!lenis) return;
  gsap.ticker.remove(raf);
  lenis.destroy();
  lenis = null;
  if (testHooks) delete window.__lenis;
}

export function getLenis(): Lenis | null {
  return lenis;
}

/** Rola até `y` (px) pelo Lenis, ou nativo quando ele não existe. */
export function scrollToY(y: number, options: { immediate?: boolean; duration?: number } = {}): void {
  if (lenis) {
    lenis.scrollTo(y, { immediate: options.immediate, duration: options.duration, force: true });
  } else {
    window.scrollTo({ top: y, behavior: "instant" });
  }
}
```

## src/lib/loading.ts

```ts
/**
 * Progresso real do loader (seção 7 do brief: "nada de progresso falso").
 * Todas as tarefas são declaradas de uma vez, com peso, para a barra nunca
 * andar para trás quando uma tarefa nova aparece.
 */

export const LOAD_TASKS = {
  /** Archivo com os eixos de peso e largura. */
  font: 1,
  /** Chunk da cena 3D (three + R3F). */
  scene: 3,
  /** Texturas procedurais em canvas. */
  textures: 2,
  /** Compilação dos shaders (`renderer.compileAsync`). */
  shaders: 2,
} as const;

export type LoadTask = keyof typeof LOAD_TASKS;

const done = new Set<LoadTask>();
const listeners = new Set<(progress: number) => void>();
const total = Object.values(LOAD_TASKS).reduce((a, b) => a + b, 0);

export function progress(): number {
  let sum = 0;
  done.forEach((task) => (sum += LOAD_TASKS[task]));
  return sum / total;
}

export function complete(task: LoadTask): void {
  if (done.has(task)) return;
  done.add(task);
  const p = progress();
  listeners.forEach((listener) => listener(p));
}

/** Marca a tarefa como concluída quando a promessa terminar (dando certo ou não). */
export function track<T>(task: LoadTask, promise: Promise<T>): Promise<T> {
  return promise.finally(() => complete(task));
}

/** Sem WebGL (ou com falha): as tarefas da cena não vão acontecer. */
export function completeScene(): void {
  complete("scene");
  complete("textures");
  complete("shaders");
}

export function onProgress(listener: (progress: number) => void): () => void {
  listeners.add(listener);
  listener(progress());
  return () => listeners.delete(listener);
}
```

## src/lib/opening.ts

```ts
import { gsap } from "./gsap";
import { getLenis } from "./lenis";
import { holdTracks } from "./tracks";
import { markReady } from "./sections";
import { prefersReducedMotion } from "./env";
import { sceneState } from "../scene/state";

/** Duração da abertura depois de pronto (seção 7 do brief: até 2,4 s). */
export const OPENING_SECONDS = 2.4;

/**
 * Abertura automática: o céu sai da madrugada e o sol nasce. A Fase 2 soma o
 * produto em silhueta, o primeiro raio, o painel abrindo como um livro e o
 * nome subindo da máscara.
 *
 * Só roda com a página no topo. Qualquer rolagem, toque ou tecla pula para o
 * fim (a pessoa manda). Com reduced motion, vai direto ao estado final.
 */
export function runOpening(line: HTMLElement | null): Promise<void> {
  return new Promise((resolve) => {
    const finish = () => {
      holdTracks(false);
      getLenis()?.start();
      markReady();
      resolve();
    };

    if (prefersReducedMotion() || window.scrollY > 40) {
      if (line) gsap.set(line, { autoAlpha: 0 });
      finish();
      return;
    }

    getLenis()?.stop();
    const skip = () => timeline.progress(1);
    const events = ["wheel", "touchstart", "keydown"] as const;
    const stopListening = () => events.forEach((type) => window.removeEventListener(type, skip));

    const timeline = gsap.timeline({
      onComplete: () => {
        stopListening();
        finish();
      },
    });
    timeline.to(sceneState, { dayTime: 6.25, cloudCover: 0.1, duration: OPENING_SECONDS, ease: "sine.inOut" }, 0);
    if (line) timeline.to(line, { autoAlpha: 0, duration: 0.6, ease: "power2.out" }, 0.3);

    events.forEach((type) => window.addEventListener(type, skip, { passive: true }));
  });
}
```

## src/lib/sections.ts

```ts
import { ScrollTrigger } from "./gsap";
import { flags, testHooks } from "./env";
import { scrollToY } from "./lenis";

/**
 * Registro de seções (seção 5 do brief). Cada parte e cada cena têm
 * `data-section`. As posições são recalculadas a cada refresh do ScrollTrigger.
 *
 * `start`/`end`: do topo da seção no topo da tela até a base dela no topo da
 * tela (as faixas se encostam, sem buraco). Em seção presa, `pinStart`/`pinEnd`
 * são o trecho do pin. Lição da v1: o marcador `data-section` nunca vive num
 * componente que desmonta.
 */
export interface SectionBounds {
  id: string;
  start: number;
  end: number;
  pinStart?: number;
  pinEnd?: number;
}

declare global {
  interface Window {
    __ready?: boolean;
    __sections?: SectionBounds[];
  }
}

let bounds: SectionBounds[] = [];
const listeners = new Set<() => void>();

function measure(): SectionBounds[] {
  const pins = ScrollTrigger.getAll().filter((st) => st.pin);
  return [...document.querySelectorAll<HTMLElement>("[data-section]")].map((el) => {
    const spacer = el.parentElement?.classList.contains("pin-spacer") ? el.parentElement : null;
    const box = spacer ?? el;
    const start = Math.round(box.getBoundingClientRect().top + window.scrollY);
    const end = start + box.offsetHeight;
    const pin = pins.find((st) => st.pin === el);
    return {
      id: el.dataset.section ?? "",
      start,
      end,
      ...(pin ? { pinStart: pin.start, pinEnd: pin.end } : {}),
    };
  });
}

function refresh(): void {
  bounds = measure();
  if (testHooks) window.__sections = bounds;
  listeners.forEach((listener) => listener());
}

/** Chamar uma vez, depois que as seções e os pins existem. */
export function registerSections(): () => void {
  ScrollTrigger.addEventListener("refresh", refresh);
  refresh();
  return () => ScrollTrigger.removeEventListener("refresh", refresh);
}

export function getSections(): readonly SectionBounds[] {
  return bounds;
}

export function onSectionsChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Posição (px) para mostrar uma seção ou um alvo dentro dela.
 * `pinProgress` (0 a 1) posiciona dentro de uma cena presa.
 */
export function positionOf(target: string, pinProgress?: number): number | null {
  const b = bounds.find((s) => s.id === target);
  if (b) {
    if (b.pinStart !== undefined && b.pinEnd !== undefined) {
      return b.pinStart + (b.pinEnd - b.pinStart) * (pinProgress ?? 0);
    }
    return b.start;
  }
  const el = document.getElementById(target);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  const top = rect.top + window.scrollY;
  // Alvos internos (pitch): centralizados na tela quando cabem.
  const slack = Math.max(0, (window.innerHeight - rect.height) / 2);
  return Math.max(0, top - Math.min(slack, window.innerHeight * 0.3));
}

export function scrollToSection(target: string, options: { immediate?: boolean; duration?: number } = {}): boolean {
  const y = positionOf(target);
  if (y === null) return false;
  scrollToY(y, options);
  return true;
}

/** Fim da abertura: `window.__ready = true` e, se houver, o `?goto=`. */
export function markReady(): void {
  ScrollTrigger.refresh();
  if (flags.goto) scrollToSection(flags.goto, { immediate: true });
  if (testHooks) window.__ready = true;
}
```

## src/lib/split.ts

```ts
import { gsap } from "./gsap";

/**
 * SplitText, CustomEase e DrawSVG carregam sob demanda (fora do chunk
 * inicial), na primeira vez que um título, contador ou linha precisa deles.
 */

export const REVEAL_EASE = "suntechReveal";

type Plugins = {
  SplitText: typeof import("gsap/SplitText").SplitText;
  DrawSVGPlugin: typeof import("gsap/DrawSVGPlugin").DrawSVGPlugin;
  CustomEase: typeof import("gsap/CustomEase").CustomEase;
};

let loaded: Promise<Plugins> | null = null;

export function loadTextPlugins(): Promise<Plugins> {
  loaded ??= Promise.all([import("gsap/SplitText"), import("gsap/DrawSVGPlugin"), import("gsap/CustomEase")]).then(
    ([split, draw, custom]) => {
      gsap.registerPlugin(split.SplitText, draw.DrawSVGPlugin, custom.CustomEase);
      // cubic-bezier(0.22, 1, 0.36, 1), a curva de revelação da seção 6 do brief.
      custom.CustomEase.create(REVEAL_EASE, "M0,0 C0.22,1 0.36,1 1,1");
      return { SplitText: split.SplitText, DrawSVGPlugin: draw.DrawSVGPlugin, CustomEase: custom.CustomEase };
    },
  );
  return loaded;
}
```

## src/lib/stage.ts

```ts
import { useGSAP } from "@gsap/react";
import type { RefObject } from "react";
import { gsap } from "./gsap";
import { WIDE } from "./env";

export interface StageOptions {
  /** Comprimento do pin em vh: desktop e celular (~30% menor, seção 7 do brief). */
  length: { wide: number; narrow: number };
  /**
   * Monta a timeline da cena. A timeline vai de 0 a 1 (a posição é a fração do
   * pin), com scrub e ease linear; o damping fica no `useFrame`.
   */
  build?: (timeline: gsap.core.Timeline, stage: HTMLElement) => void;
}

/**
 * Cena presa (só as cenas 3D ficam presas, seção 6 do brief). Com reduced
 * motion não há pin: a seção vira um bloco normal no estado final.
 */
export function usePinnedStage(ref: RefObject<HTMLElement | null>, { length, build }: StageOptions): void {
  useGSAP(
    () => {
      const stage = ref.current;
      if (!stage) return;
      const mm = gsap.matchMedia();
      mm.add({ motion: "(prefers-reduced-motion: no-preference)", wide: WIDE }, (context) => {
        const { motion, wide } = context.conditions as { motion: boolean; wide: boolean };
        if (!motion) return;
        const vh = wide ? length.wide : length.narrow;
        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: stage,
            start: "top top",
            end: () => `+=${(window.innerHeight * vh) / 100}`,
            pin: true,
            scrub: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
        build?.(timeline, stage);
        // Garante a duração 1: as posições da timeline são frações do pin.
        timeline.set({}, {}, 1);
      });
      return () => mm.revert();
    },
    { scope: ref },
  );
}
```

## src/lib/tracks.ts

```ts
import { gsap, ScrollTrigger } from "./gsap";
import { getSections, onSectionsChange, type SectionBounds } from "./sections";
import { sceneState } from "../scene/state";
import { REST_AT, TRACKS, type SectionId } from "../scene/choreography";
import { applyTone, cssSky } from "../scene/daylight";

/**
 * Trilho de scroll (seção 5 do brief): a coreografia de scene/choreography.ts
 * vira uma timeline mestre do GSAP em que o tempo é o pixel de scroll, e um
 * único ScrollTrigger a percorre (scrub direto: tempo = `scrollY`). Como é uma
 * timeline só, a página pode pular para qualquer ponto (pitch, `?goto`,
 * âncoras) sem dois gatilhos brigando pelo mesmo campo. A timeline é refeita a
 * cada refresh, porque as posições das seções mudam com a viewport. O
 * `useFrame` da cena aplica os valores com damping.
 */

type Target = Record<string, number>;

const tracked = new Set<string>(TRACKS.flatMap((t) => Object.keys(t.keys)));

let master: gsap.core.Timeline | null = null;
let held = false;
let reduced = false;
let cssSkyActive = false;
let restSection: string | null = null;

/** Faixa de uma seção em px de scroll: o pin, ou do topo dela no topo da tela até a base no topo. */
function rangeOf(b: SectionBounds, max: number): [number, number] {
  const [a, z] = b.pinStart !== undefined && b.pinEnd !== undefined ? [b.pinStart, b.pinEnd] : [b.start, b.end];
  return [Math.min(a, max), Math.min(z, max)];
}

/** "camera.x" → [sceneState.camera, "x"]. */
function resolve(path: string): [Target, string] {
  const dot = path.indexOf(".");
  const state = sceneState as unknown as Record<string, unknown>;
  if (dot < 0) return [state as Target, path];
  return [state[path.slice(0, dot)] as Target, path.slice(dot + 1)];
}

function build(): void {
  master?.kill();
  const max = ScrollTrigger.maxScroll(window);
  const byId = new Map(getSections().map((b) => [b.id, b]));
  const timeline = gsap.timeline({ paused: true, defaults: { ease: "none", immediateRender: false } });

  for (const track of TRACKS) {
    const points: Array<[number, number]> = [];
    for (const [id, keys] of Object.entries(track.keys)) {
      const b = byId.get(id);
      if (!b || !keys) continue;
      const [a, z] = rangeOf(b, max);
      for (const [at, value] of keys) points.push([a + (z - a) * at, value]);
    }
    if (points.length === 0) continue;
    // Ordenação estável: em empate, vale a ordem da página.
    points.sort((p, q) => p[0] - q[0]);

    const [target, key] = resolve(track.path);
    timeline.set(target, { [key]: points[0][1] }, 0);
    for (let i = 1; i < points.length; i++) {
      const [y0, v0] = points[i - 1];
      const [y1, v1] = points[i];
      if (track.step || y1 <= y0) timeline.set(target, { [key]: v1 }, y1);
      else timeline.fromTo(target, { [key]: v0 }, { [key]: v1, duration: y1 - y0 }, y0);
    }
  }

  master = timeline;
}

function afterWrite(): void {
  applyTone(sceneState.tone);
  if (cssSkyActive) {
    const sky = cssSky(sceneState.dayTime, sceneState.cloudCover);
    const root = document.documentElement.style;
    root.setProperty("--sky-zenith", sky.zenith);
    root.setProperty("--sky-horizon", sky.horizon);
  }
}

/** Leva a timeline até `y` (px), renderizando mesmo sem mudança de tempo. */
function seek(y: number): void {
  master?.render(y, false, true);
  afterWrite();
}

/**
 * Reduced motion: quando muda a seção no meio da tela, a timeline salta para o
 * ponto de repouso dela. O céu chega lá com um crossfade curto (scene/Sky.tsx),
 * e o produto pula sem animar.
 */
function updateReduced(): void {
  const probe = window.scrollY + window.innerHeight * 0.5;
  const section = getSections().find((s) => tracked.has(s.id) && probe >= s.start && probe < s.end);
  if (!section || section.id === restSection) return;
  restSection = section.id;
  const [a, z] = rangeOf(section, ScrollTrigger.maxScroll(window));
  seek(a + (z - a) * (REST_AT[section.id as SectionId] ?? 0.5));
}

function update(): void {
  if (held || !master) return;
  if (reduced) updateReduced();
  else seek(window.scrollY);
}

/** Liga o trilho. Devolve a limpeza. */
export function initTracks(options: { reducedMotion: boolean }): () => void {
  reduced = options.reducedMotion;
  restSection = null;
  const off = onSectionsChange(() => {
    build();
    restSection = null;
    update();
  });
  const trigger = ScrollTrigger.create({ start: 0, end: "max", onUpdate: update });
  build();
  update();
  return () => {
    off();
    trigger.kill();
    master?.kill();
    master = null;
  };
}

/** A abertura segura o trilho enquanto anima; ao soltar, a cena volta ao scroll. */
export function holdTracks(hold: boolean): void {
  held = hold;
  if (!hold) update();
}

/** Fallback sem WebGL: o gradiente em CSS passa a seguir a hora. */
export function setCssSky(active: boolean): void {
  cssSkyActive = active;
  update();
}
```

## src/lib/useReducedMotion.ts

```ts
import { useSyncExternalStore } from "react";
import { REDUCED_MOTION } from "./env";

function subscribe(onChange: () => void): () => void {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const read = () => window.matchMedia(REDUCED_MOTION).matches;

/** `prefers-reduced-motion`, reativo: muda se a pessoa trocar a preferência com a página aberta. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, read, () => false);
}
```

## src/scene/CanvasErrorBoundary.tsx

```tsx
import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback: ReactNode;
}

interface State {
  failed: boolean;
}

/**
 * Se o WebGL falhar (contexto não criado, navegador sem suporte), troca a cena
 * pelo fallback em CSS e SVG. O conteúdo continua navegável (seção 5 do brief).
 */
export class CanvasErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    // Aviso, não erro: o fallback é um caminho previsto, e o `snap` trata
    // qualquer `console.error` como falha.
    console.warn("Cena 3D indisponível, usando o fallback:", error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
```

## src/scene/choreography.ts

```ts
/**
 * Coreografia da página: o mapa de scroll aprovado na Fase 0 (docs/fase-0.md,
 * item 5), como dados. Cada trilho diz, por seção, o valor de um campo do
 * `sceneState` em pontos da faixa da seção (0 = início, 1 = fim; em cena presa,
 * a faixa é o pin). `lib/tracks.ts` transforma isto numa timeline mestre do GSAP.
 * Entre pontos, interpolação linear (ou degrau, em `step`). Os valores nas
 * bordas das seções se encontram, para nada pular.
 *
 * Não importa `three`: entra no chunk inicial, junto com lib/tracks.ts.
 */

export type SectionId =
  | "hero"
  | "problema"
  | "cliente"
  | "solucao"
  | "por-dentro"
  | "como-funciona"
  | "energia-fica"
  | "diferencial"
  | "empresa"
  | "pitch"
  | "jovem";

export type Keys = ReadonlyArray<readonly [at: number, value: number]>;

export interface Track {
  /** Caminho no `sceneState` ("dayTime", "product.ry"). */
  path: string;
  /** Degrau em vez de interpolação (tom do texto). */
  step?: boolean;
  keys: Partial<Record<SectionId, Keys>>;
}

// Tom: 1 = texto Nuvem, −1 = texto Noite, 0 = travessia (sem texto na tela).
const LIGHT = 1;
const DARK = -1;
const CROSSING = 0;

/**
 * As três travessias da zona morta de contraste acontecem dentro das cenas
 * presas, enquanto só o 3D está na tela: o nascer do sol no começo de "Por
 * dentro", o pôr do sol no começo de "A energia fica" e o nascer do dia
 * seguinte no fim dela.
 */
export const TRACKS: Track[] = [
  {
    path: "dayTime",
    keys: {
      hero: [[0, 6.25], [1, 7]],
      // A tempestade fecha antes de o dia clarear: a hora quase não anda até
      // as nuvens cobrirem o céu.
      problema: [[0, 7], [0.2, 7.5], [1, 19.5]],
      cliente: [[0, 19.5], [1, 26]],
      solucao: [[0, 26], [0.85, 29], [1, 29.4]],
      // 0–18%: travessia no nascer do sol (07:00–08:30).
      "por-dentro": [[0, 29.4], [0.18, 32.5], [1, 36]],
      "como-funciona": [[0, 36], [1, 41]],
      // 0–30%: travessia no pôr do sol. 70–84%: "Amanhã…", a noite passa.
      // 84–100%: travessia no nascer do dia seguinte.
      "energia-fica": [[0, 41], [0.3, 43.5], [0.7, 45.5], [0.84, 53.5], [1, 56.5]],
      diferencial: [[0, 56.5], [1, 57.5]],
      empresa: [[0, 57.5], [1, 59.5]],
      pitch: [[0, 59.5], [1, 63.5]],
      jovem: [[0, 63.5], [1, 65.7]],
    },
  },
  {
    path: "cloudCover",
    keys: {
      hero: [[0, 0.1], [1, 0.35]],
      problema: [[0, 0.35], [0.2, 0.9], [0.9, 0.9], [1, 0.6]],
      cliente: [[0, 0.6], [1, 0.25]],
      solucao: [[0, 0.25], [1, 0.15]],
      "por-dentro": [[0, 0.15], [0.18, 0.05]],
      "energia-fica": [[0, 0.05], [0.84, 0.05], [1, 0.1]],
      diferencial: [[0, 0.1], [1, 0.15]],
      empresa: [[0, 0.15], [1, 0.2]],
      pitch: [[0, 0.2], [1, 0.15]],
      jovem: [[0, 0.15], [1, 0.2]],
    },
  },
  {
    path: "tone",
    step: true,
    keys: {
      hero: [[0, LIGHT]],
      "por-dentro": [[0, CROSSING], [0.18, DARK]],
      "energia-fica": [[0, CROSSING], [0.3, LIGHT], [0.84, CROSSING], [1, DARK]],
    },
  },
];

/**
 * Reduced motion: cada seção mostra um estado parado, tirado deste ponto da
 * sua faixa (0,5 quando não está aqui). As cenas mostram o resultado: vista
 * explodida, esquema aceso e celular carregado à noite.
 */
export const REST_AT: Partial<Record<SectionId, number>> = {
  hero: 0,
  "por-dentro": 1,
  "como-funciona": 1,
  "energia-fica": 0.68,
};
```

## src/scene/daylight.ts

```ts
/**
 * Fonte única de toda cor derivada da hora do dia (céu, sol, nuvens, estrelas,
 * luz da cena e a guarda de contraste do texto). Não importa `three`: roda no
 * chunk inicial (tom do texto e fallback sem WebGL).
 *
 * `dayTime` está em horas contínuas ao longo da página (4,5 → 65,7: três dias);
 * o céu usa `dayTime mod 24`. Os keyframes são sRGB (como os tokens); o shader
 * recebe as cores já lineares, calculadas aqui. O contraste do texto é medido
 * nos pixels reais pelo `snap` (scripts/snap.mjs).
 *
 * Zona morta: com fundo entre L 0,167 e L 0,246 (luminância WCAG), nem Nuvem
 * nem Noite chegam a 4,5:1. Toda travessia do céu por ela acontece com só o 3D
 * na tela (scene/choreography.ts).
 */

export type RGB = readonly [number, number, number];

// ---------------------------------------------------------------- cor

function hex(h: string): RGB {
  const n = parseInt(h.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function toLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function linear(c: RGB): RGB {
  return [toLinear(c[0]), toLinear(c[1]), toLinear(c[2])];
}

function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function mixRgb(a: RGB, b: RGB, t: number): RGB {
  return [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];
}

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

function smoothstep(e0: number, e1: number, x: number): number {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
}

// ------------------------------------------------------------- tokens

export const TOKENS = {
  noite: hex("#14213D"),
  ceu: hex("#CFE8F3"),
  nuvem: hex("#F4F7FA"),
  sol: hex("#FFB22C"),
  brasa: hex("#E8773A"),
  grafite: hex("#2B3036"),
} as const;

// ---------------------------------------------------------- keyframes

interface SkyKey {
  h: number;
  zenith: string;
  horizon: string;
  sunSide: string;
  sun: string;
  sunI: number;
  glowI: number;
  stars: number;
  cloudLit: string;
  cloudShade: string;
}

/**
 * Céu limpo por hora (sRGB). `horizon` é o horizonte do lado do texto (contra o
 * sol); `sunSide` é o brilho do lado do sol, sempre à direita. Os valores com
 * texto na tela ficam fora da zona morta com folga: Nuvem com L ≤ 0,12 e Noite
 * com L ≥ 0,30. As travessias (07:00–08:30 e 17:30–19:00) só acontecem sem texto.
 */
const KEYS: SkyKey[] = [
  { h: 0, zenith: "#14213D", horizon: "#1B2A4F", sunSide: "#1B2A4F", sun: "#14213D", sunI: 0, glowI: 0, stars: 1, cloudLit: "#26314F", cloudShade: "#1A2440" },
  { h: 4.5, zenith: "#14213D", horizon: "#1D2C52", sunSide: "#2E3363", sun: "#14213D", sunI: 0, glowI: 0.18, stars: 1, cloudLit: "#2B3354", cloudShade: "#1B2542" },
  { h: 5.5, zenith: "#172747", horizon: "#2A3A64", sunSide: "#E8773A", sun: "#E8773A", sunI: 0, glowI: 0.5, stars: 0.55, cloudLit: "#5A4A66", cloudShade: "#202B4A" },
  { h: 6.25, zenith: "#1E3A6A", horizon: "#3C5283", sunSide: "#F29A4A", sun: "#FFC47A", sunI: 1, glowI: 0.8, stars: 0.12, cloudLit: "#6E5A78", cloudShade: "#2C3A62" },
  { h: 7, zenith: "#24406F", horizon: "#435A88", sunSide: "#FFC06A", sun: "#FFE0A0", sunI: 1, glowI: 0.7, stars: 0, cloudLit: "#6A6480", cloudShade: "#33416A" },
  { h: 8.5, zenith: "#6E9CC6", horizon: "#BFDCEC", sunSide: "#FFF0D2", sun: "#FFF6E0", sunI: 1, glowI: 0.5, stars: 0, cloudLit: "#FFFFFF", cloudShade: "#C9D3DE" },
  { h: 12, zenith: "#8DBBDA", horizon: "#CFE8F3", sunSide: "#F4FAFF", sun: "#FFFBF0", sunI: 1, glowI: 0.35, stars: 0, cloudLit: "#FFFFFF", cloudShade: "#D5DEE8" },
  { h: 16, zenith: "#86B2D3", horizon: "#E9DDC4", sunSide: "#FFE2B0", sun: "#FFE7B8", sunI: 1, glowI: 0.5, stars: 0, cloudLit: "#FFF4E4", cloudShade: "#CCD2DA" },
  { h: 17.5, zenith: "#9DBCD6", horizon: "#F2C98E", sunSide: "#FFB22C", sun: "#FFC05A", sunI: 1, glowI: 0.85, stars: 0, cloudLit: "#FFD9A8", cloudShade: "#C9C0C6" },
  { h: 18.2, zenith: "#4A5A8A", horizon: "#C9876A", sunSide: "#E8773A", sun: "#FF8A3C", sunI: 0.9, glowI: 0.9, stars: 0.1, cloudLit: "#E0896A", cloudShade: "#5A5470" },
  { h: 19.5, zenith: "#1A2548", horizon: "#2E3560", sunSide: "#5A3550", sun: "#14213D", sunI: 0, glowI: 0.3, stars: 0.6, cloudLit: "#3A3552", cloudShade: "#1E2744" },
  { h: 21.5, zenith: "#14213D", horizon: "#1B2A4F", sunSide: "#1B2A4F", sun: "#14213D", sunI: 0, glowI: 0, stars: 1, cloudLit: "#26314F", cloudShade: "#1A2440" },
  { h: 24, zenith: "#14213D", horizon: "#1B2A4F", sunSide: "#1B2A4F", sun: "#14213D", sunI: 0, glowI: 0, stars: 1, cloudLit: "#26314F", cloudShade: "#1A2440" },
];

interface ParsedKey {
  h: number;
  zenith: RGB;
  horizon: RGB;
  sunSide: RGB;
  sun: RGB;
  sunI: number;
  glowI: number;
  stars: number;
  cloudLit: RGB;
  cloudShade: RGB;
}

const PARSED: ParsedKey[] = KEYS.map((k) => ({
  ...k,
  zenith: hex(k.zenith),
  horizon: hex(k.horizon),
  sunSide: hex(k.sunSide),
  sun: hex(k.sun),
  cloudLit: hex(k.cloudLit),
  cloudShade: hex(k.cloudShade),
}));

/** Tempestade: nuvens cinza-azuladas cobrindo o sol, de noite e de dia. */
const STORM = {
  zenith: [hex("#1C2336"), hex("#3A475E")],
  horizon: [hex("#232B40"), hex("#4A5670")],
  cloudLit: [hex("#2A3350"), hex("#5D6A82")],
  cloudShade: [hex("#161C2C"), hex("#333F55")],
} as const;

export function hourOf(dayTime: number): number {
  return ((dayTime % 24) + 24) % 24;
}

/** Elevação do sol de −1 (meia-noite) a 1 (meio-dia); nasce às 6h, se põe às 18h. */
export function sunElevation(hour: number): number {
  return Math.sin((Math.PI * (hour - 6)) / 12);
}

function keyAt(hour: number): ParsedKey {
  let i = 0;
  while (i < PARSED.length - 2 && PARSED[i + 1].h <= hour) i++;
  const a = PARSED[i];
  const b = PARSED[i + 1];
  const t = clamp01((hour - a.h) / (b.h - a.h));
  return {
    h: hour,
    zenith: mixRgb(a.zenith, b.zenith, t),
    horizon: mixRgb(a.horizon, b.horizon, t),
    sunSide: mixRgb(a.sunSide, b.sunSide, t),
    sun: mixRgb(a.sun, b.sun, t),
    sunI: mix(a.sunI, b.sunI, t),
    glowI: mix(a.glowI, b.glowI, t),
    stars: mix(a.stars, b.stars, t),
    cloudLit: mixRgb(a.cloudLit, b.cloudLit, t),
    cloudShade: mixRgb(a.cloudShade, b.cloudShade, t),
  };
}

// ------------------------------------------------------------ uniforms

/** Tudo que o shader do céu recebe. Cores já em espaço linear. */
export interface SkyUniforms {
  zenith: RGB;
  horizon: RGB;
  sunSide: RGB;
  sun: RGB;
  cloudLit: RGB;
  cloudShade: RGB;
  sunPos: { x: number; y: number };
  horizonY: number;
  aspect: number;
  sunSize: number;
  sunIntensity: number;
  glowIntensity: number;
  stars: number;
  cloudCover: number;
  cloudShift: number;
  /** +1 limita o céu por cima (texto Nuvem), −1 por baixo (texto Noite). */
  guardMode: number;
  /** 0 a 1; 0 nas travessias. */
  guardAmount: number;
  guardX0: number;
  guardX1: number;
}

/** Onde o sol aparece na tela (0–1), sempre do lado direito, longe do texto. */
export function sunScreenPosition(hour: number, aspect: number): { x: number; y: number; horizonY: number } {
  const e = sunElevation(hour);
  const fromNoon = clamp01(Math.abs(hour - 12) / 6);
  if (aspect >= 1) {
    const horizonY = 0.16;
    return { x: 0.62 + 0.26 * fromNoon, y: horizonY + e * 0.72, horizonY };
  }
  // No celular, o horizonte fica acima do bloco de texto do hero: o sol nasce
  // atrás do produto e o disco inteiro cabe na tela, longe da borda direita.
  const horizonY = 0.56;
  return { x: 0.62 + 0.12 * fromNoon, y: horizonY + e * 0.46, horizonY };
}

export function computeSky(
  dayTime: number,
  cloudCover: number,
  aspect: number,
  guardMode: number,
  guardAmount: number,
): SkyUniforms {
  const hour = hourOf(dayTime);
  const k = keyAt(hour);
  const e = sunElevation(hour);
  const dayF = smoothstep(-0.1, 0.4, e);
  const storm = smoothstep(0.55, 0.9, cloudCover);
  const stormed = (clear: RGB, pair: readonly [RGB, RGB]) => mixRgb(clear, mixRgb(pair[0], pair[1], dayF), storm);
  const sun = sunScreenPosition(hour, aspect);
  const desktop = aspect >= 1;

  return {
    zenith: linear(stormed(k.zenith, STORM.zenith)),
    horizon: linear(stormed(k.horizon, STORM.horizon)),
    sunSide: linear(k.sunSide),
    sun: linear(k.sun),
    cloudLit: linear(stormed(k.cloudLit, STORM.cloudLit)),
    cloudShade: linear(stormed(k.cloudShade, STORM.cloudShade)),
    sunPos: { x: sun.x, y: sun.y },
    horizonY: sun.horizonY,
    aspect,
    sunSize: desktop ? 0.045 : 0.06,
    sunIntensity: k.sunI * (1 - storm) * smoothstep(-0.04, 0.02, e),
    glowIntensity: k.glowI * (1 - 0.9 * storm),
    stars: k.stars * (1 - cloudCover),
    cloudCover,
    cloudShift: dayTime * 0.035,
    guardMode,
    guardAmount,
    // No desktop o texto vive nos 60% da esquerda; no celular, na tela toda. A
    // rampa é larga de propósito: uma rampa curta desenha uma faixa escura no céu.
    guardX0: desktop ? 0.5 : 2,
    guardX1: desktop ? 0.85 : 3,
  };
}

/**
 * Crossfade entre dois céus: mistura as cores, o sol e as intensidades sem
 * passar pelas horas do meio. Usado nos saltos de hora (`?goto`, reduced
 * motion), em que varrer o dia inteiro faria o céu piscar. Forma das nuvens,
 * guarda e aspecto vêm do céu de destino.
 */
export function mixSky(a: SkyUniforms, b: SkyUniforms, t: number): SkyUniforms {
  return {
    ...b,
    zenith: mixRgb(a.zenith, b.zenith, t),
    horizon: mixRgb(a.horizon, b.horizon, t),
    sunSide: mixRgb(a.sunSide, b.sunSide, t),
    sun: mixRgb(a.sun, b.sun, t),
    cloudLit: mixRgb(a.cloudLit, b.cloudLit, t),
    cloudShade: mixRgb(a.cloudShade, b.cloudShade, t),
    sunPos: { x: mix(a.sunPos.x, b.sunPos.x, t), y: mix(a.sunPos.y, b.sunPos.y, t) },
    sunIntensity: mix(a.sunIntensity, b.sunIntensity, t),
    glowIntensity: mix(a.glowIntensity, b.glowIntensity, t),
    stars: mix(a.stars, b.stars, t),
    cloudCover: mix(a.cloudCover, b.cloudCover, t),
  };
}

// ------------------------------------------------------------ texto

export type Tone = "light" | "dark";

/** Tom do texto por valor agendado: 1 = Nuvem, −1 = Noite, 0 = travessia. */
export function toneFromSchedule(value: number): Tone | null {
  if (value > 0.5) return "light";
  if (value < -0.5) return "dark";
  return null;
}

let appliedTone: Tone = "light";
let appliedCrossing = false;

/**
 * Aplica o tom no `<html>`: `data-tone` troca `--fg` (com crossfade no CSS) e
 * `data-crossing` tira o header de cena enquanto o céu cruza a zona morta.
 */
export function applyTone(value: number): void {
  const tone = toneFromSchedule(value);
  const crossing = tone === null;
  const root = document.documentElement;
  if (crossing !== appliedCrossing) {
    appliedCrossing = crossing;
    root.toggleAttribute("data-crossing", crossing);
  }
  if (tone && tone !== appliedTone) {
    appliedTone = tone;
    root.dataset.tone = tone;
  }
}

/** Cores do gradiente em CSS (fallback sem WebGL), em sRGB hex. */
export function cssSky(dayTime: number, cloudCover: number): { zenith: string; horizon: string } {
  const hour = hourOf(dayTime);
  const k = keyAt(hour);
  const dayF = smoothstep(-0.1, 0.4, sunElevation(hour));
  const storm = smoothstep(0.55, 0.9, cloudCover);
  const toHex = (c: RGB) =>
    `#${c.map((v) => Math.round(clamp01(v) * 255).toString(16).padStart(2, "0")).join("")}`;
  return {
    zenith: toHex(mixRgb(k.zenith, mixRgb(STORM.zenith[0], STORM.zenith[1], dayF), storm)),
    horizon: toHex(mixRgb(k.horizon, mixRgb(STORM.horizon[0], STORM.horizon[1], dayF), storm)),
  };
}
```

## src/scene/Experience.tsx

```tsx
import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { Sky } from "./Sky";
import { DebugPerf } from "./DebugPerf";
import { quality } from "./quality";
import { flags } from "../lib/env";
import { complete, track } from "../lib/loading";

/** Compila os shaders antes do primeiro quadro visível (tarefa real do loader). */
function Warmup() {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    // Fase 1: ainda não há texturas procedurais; a Fase 2 gera e conclui esta tarefa.
    complete("textures");
    track("shaders", gl.compileAsync(scene, camera)).then(() => {
      document.documentElement.dataset.scene = "on";
    });
  }, [gl, scene, camera]);
  return null;
}

/** Conteúdo do `<Canvas>` único da página. */
export function Experience() {
  return (
    <PerformanceMonitor
      onIncline={quality.incline}
      onDecline={quality.decline}
      onFallback={quality.fallback}
      flipflops={3}
    >
      <Sky />
      <Warmup />
      {flags.debug && <DebugPerf />}
    </PerformanceMonitor>
  );
}
```

## src/scene/Fallback.tsx

```tsx
import { useEffect } from "react";
import { completeScene } from "../lib/loading";
import { setCssSky } from "../lib/tracks";

/**
 * Sem WebGL (falha do contexto ou `?nowebgl`): o céu vira o gradiente em CSS
 * do `body::before`, que passa a seguir a hora pelo mesmo `daylight.ts`, e a
 * seção "Como funciona" mostra o diagrama em SVG (`[data-webgl="off"]`).
 * Todo o conteúdo continua navegável.
 */
export function Fallback() {
  useEffect(() => {
    document.documentElement.dataset.webgl = "off";
    completeScene();
    setCssSky(true);
    return () => {
      setCssSky(false);
      delete document.documentElement.dataset.webgl;
    };
  }, []);
  return null;
}
```

## src/scene/quality.ts

```ts
/**
 * Tiers de qualidade (Fase 0, item 7). O tier de entrada sai da viewport e do
 * processador; o `PerformanceMonitor` desce quando o FPS cai e sobe só até o
 * teto da viewport (nunca um celular "sobe" para alto e depois despenca).
 * Fica numa store fora do React, para trocar de tier sem re-renderizar a página.
 */

export type QualityTier = "alto" | "medio" | "baixo";

export interface QualitySettings {
  tier: QualityTier;
  dpr: [number, number];
  /** Fótons e partículas de energia. */
  particles: number;
  /** Resolução do ContactShadows; 0 = sombra falsa. */
  shadowSize: number;
  post: { bloom: boolean; noise: boolean; vignette: boolean };
  /** Texturas procedurais: geradas uma vez, no tier de entrada. */
  textures: { cells: number; pcb: number };
  envSize: number;
  cloudOctaves: number;
}

const TIERS: Record<QualityTier, QualitySettings> = {
  alto: {
    tier: "alto",
    dpr: [1, 2],
    particles: 160,
    shadowSize: 1024,
    post: { bloom: true, noise: true, vignette: true },
    textures: { cells: 2048, pcb: 1024 },
    envSize: 256,
    cloudOctaves: 5,
  },
  medio: {
    tier: "medio",
    dpr: [1, 1.5],
    particles: 80,
    shadowSize: 512,
    post: { bloom: true, noise: false, vignette: true },
    textures: { cells: 1024, pcb: 512 },
    envSize: 128,
    cloudOctaves: 4,
  },
  baixo: {
    tier: "baixo",
    dpr: [1, 1],
    particles: 32,
    shadowSize: 0,
    post: { bloom: false, noise: false, vignette: false },
    textures: { cells: 512, pcb: 256 },
    envSize: 64,
    cloudOctaves: 3,
  },
};

const ORDER: QualityTier[] = ["baixo", "medio", "alto"];

/**
 * Celular fraco (pouca memória ou poucos núcleos, sinais que o Android expõe)
 * já entra no baixo, para não travar nos primeiros segundos antes de o
 * `PerformanceMonitor` reagir. Se rodar liso, ele sobe até o teto.
 */
function entryTier(): QualityTier {
  if (typeof window === "undefined") return "medio";
  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  const phone = Math.min(window.innerWidth, window.innerHeight) < 768;
  if (phone) return memory <= 4 || cores <= 4 ? "baixo" : "medio";
  if (window.innerWidth >= 1280 && cores >= 8) return "alto";
  return "medio";
}

function ceilingTier(): QualityTier {
  if (typeof window === "undefined") return "medio";
  return window.innerWidth >= 1024 ? "alto" : "medio";
}

const entry = entryTier();
const ceiling = ceilingTier();
let current: QualityTier = entry;
let locked = false;
const listeners = new Set<() => void>();

function set(tier: QualityTier): void {
  if (tier === current) return;
  current = tier;
  listeners.forEach((listener) => listener());
}

export const quality = {
  get: (): QualitySettings => TIERS[current],
  /** Texturas usam o tier de entrada: não são regeradas quando o tier muda. */
  entry: (): QualitySettings => TIERS[entry],
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  decline(): void {
    if (locked) return;
    set(ORDER[Math.max(0, ORDER.indexOf(current) - 1)]);
  },
  incline(): void {
    if (locked) return;
    set(ORDER[Math.min(ORDER.indexOf(ceiling), ORDER.indexOf(current) + 1)]);
  },
  /** Oscilou demais: fica no baixo até o fim da visita. */
  fallback(): void {
    set("baixo");
    locked = true;
  },
};
```

## src/scene/SceneCanvas.tsx

```tsx
import { useSyncExternalStore, type RefObject } from "react";
import { Canvas } from "@react-three/fiber";
import { NeutralToneMapping } from "three";
import { Experience } from "./Experience";
import { quality } from "./quality";
import { flags } from "../lib/env";

interface SceneCanvasProps {
  eventSource: RefObject<HTMLElement | null>;
}

// O antialias do contexto não muda depois de criado: com pós-processamento,
// quem suaviza as bordas é o MSAA do composer.
const nativeAntialias = !quality.entry().post.bloom;

/**
 * Carregado via `React.lazy` (App.tsx): é aqui que `three` e o R3F entram,
 * depois do texto do hero pintar. Um único `<Canvas>` fixo atrás do DOM.
 */
export default function SceneCanvas({ eventSource }: SceneCanvasProps) {
  const settings = useSyncExternalStore(quality.subscribe, quality.get);

  return (
    <Canvas
      className="scene-canvas-wrap"
      aria-hidden="true"
      eventSource={eventSource as RefObject<HTMLElement>}
      eventPrefix="client"
      // Com `?snap`, DPR 1: o SwiftShader renderiza na CPU.
      dpr={flags.snap ? 1 : settings.dpr}
      gl={{ antialias: nativeAntialias, powerPreference: "high-performance", alpha: false }}
      camera={{ position: [0, 0.4, 6], fov: 32, near: 0.1, far: 100 }}
      onCreated={({ gl }) => {
        // Khronos PBR Neutral: fiel à cor do produto. O modelo de contraste
        // (daylight.ts) aplica a mesma curva.
        gl.toneMapping = NeutralToneMapping;
      }}
    >
      <Experience />
    </Canvas>
  );
}
```

## src/scene/Sky.tsx

```tsx
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { type ShaderMaterial, Vector2, Vector3 } from "three";
import { easing } from "maath";
import vertexShader from "../shaders/sky.vert.glsl?raw";
import fragmentShader from "../shaders/sky.frag.glsl?raw";
import { sceneState } from "./state";
import { computeSky, mixSky, type RGB, type SkyUniforms } from "./daylight";
import { quality } from "./quality";
import { useReducedMotion } from "../lib/useReducedMotion";

/**
 * Salto de hora a partir do qual o céu faz crossfade em vez de varrer as horas
 * do meio (varrer um dia inteiro em meio segundo faria o céu piscar). A rolagem
 * normal nunca chega perto disso: o damping fica a poucos minutos do alvo.
 */
const JUMP_HOURS = 6;
const FADE_SECONDS = 0.35;

function createUniforms() {
  const v3 = () => new Vector3();
  return {
    uZenith: { value: v3() },
    uHorizon: { value: v3() },
    uSunSide: { value: v3() },
    uSun: { value: v3() },
    uCloudLit: { value: v3() },
    uCloudShade: { value: v3() },
    uSunPos: { value: new Vector2() },
    uHorizonY: { value: 0.16 },
    uAspect: { value: 1 },
    uSunSize: { value: 0.045 },
    uSunIntensity: { value: 0 },
    uGlowIntensity: { value: 0 },
    uStars: { value: 1 },
    uCloudCover: { value: 0 },
    uCloudShift: { value: 0 },
    uGuardMode: { value: 1 },
    uGuardAmount: { value: 1 },
    uGuardX0: { value: 0.6 },
    uGuardX1: { value: 0.7 },
    uPixelRatio: { value: 1 },
    uOctaves: { value: 4 },
  };
}

const setVec = (target: Vector3, c: RGB) => target.set(c[0], c[1], c[2]);

/**
 * Céu em WebGL (seção 5 do brief): um quad em tela cheia. Lê `dayTime`,
 * `cloudCover` e `tone` do `sceneState`, amortece e entrega as cores de
 * `daylight.ts` ao shader. Com reduced motion, toda troca de hora é um
 * crossfade curto (seção 10 do brief).
 */
export function Sky() {
  const uniforms = useMemo(() => createUniforms(), []);
  const materialRef = useRef<ShaderMaterial>(null);
  const reduced = useReducedMotion();
  const live = useRef({
    dayTime: sceneState.dayTime,
    cloudCover: sceneState.cloudCover,
    guard: 1,
    mode: 1,
    fade: 1,
    fadeFrom: null as SkyUniforms | null,
    last: null as SkyUniforms | null,
  });

  useFrame(({ size, gl }, delta) => {
    const material = materialRef.current;
    if (!material) return;
    const s = live.current;

    const hourGap = Math.abs(sceneState.dayTime - s.dayTime);
    const cloudGap = Math.abs(sceneState.cloudCover - s.cloudCover);
    const jumped = reduced ? hourGap > 0.01 || cloudGap > 0.01 : hourGap > JUMP_HOURS;
    if (jumped && s.last) {
      s.fadeFrom = s.last;
      s.fade = 0;
    }
    if (jumped || reduced) {
      s.dayTime = sceneState.dayTime;
      s.cloudCover = sceneState.cloudCover;
    } else {
      easing.damp(s, "dayTime", sceneState.dayTime, 0.25, delta);
      easing.damp(s, "cloudCover", sceneState.cloudCover, 0.3, delta);
    }

    // Tom 0 (travessia) solta a guarda; ao sair da travessia, ela volta aos poucos.
    if (sceneState.tone !== 0) s.mode = Math.sign(sceneState.tone);
    easing.damp(s, "guard", sceneState.tone !== 0 ? 1 : 0, 0.2, delta);

    let sky = computeSky(s.dayTime, s.cloudCover, size.width / size.height, s.mode, s.guard);
    if (s.fade < 1 && s.fadeFrom) {
      s.fade = Math.min(1, s.fade + delta / FADE_SECONDS);
      const t = 1 - (1 - s.fade) ** 3;
      sky = mixSky(s.fadeFrom, sky, t);
      sky.guardAmount *= t;
    }
    s.last = sky;

    const u = material.uniforms;
    setVec(u.uZenith.value, sky.zenith);
    setVec(u.uHorizon.value, sky.horizon);
    setVec(u.uSunSide.value, sky.sunSide);
    setVec(u.uSun.value, sky.sun);
    setVec(u.uCloudLit.value, sky.cloudLit);
    setVec(u.uCloudShade.value, sky.cloudShade);
    u.uSunPos.value.set(sky.sunPos.x, sky.sunPos.y);
    u.uHorizonY.value = sky.horizonY;
    u.uAspect.value = sky.aspect;
    u.uSunSize.value = sky.sunSize;
    u.uSunIntensity.value = sky.sunIntensity;
    u.uGlowIntensity.value = sky.glowIntensity;
    u.uStars.value = sky.stars;
    u.uCloudCover.value = sky.cloudCover;
    u.uCloudShift.value = sky.cloudShift;
    u.uGuardMode.value = sky.guardMode;
    u.uGuardAmount.value = sky.guardAmount;
    u.uGuardX0.value = sky.guardX0;
    u.uGuardX1.value = sky.guardX1;
    u.uPixelRatio.value = gl.getPixelRatio();
    u.uOctaves.value = quality.get().cloudOctaves;
  });

  return (
    <mesh renderOrder={-1} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}
```

## src/scene/state.ts

```ts
/**
 * Único objeto mutável com os parâmetros animáveis da cena.
 *
 * Só o GSAP escreve aqui (o trilho de scroll em lib/tracks.ts, a abertura e o
 * ponteiro via `gsap.quickTo`). O `useFrame` só lê e aplica com `easing.damp`.
 * Nunca `useState` no loop de animação.
 *
 * Não importe `three` (nem nada do ecossistema R3F) neste arquivo: ele entra
 * no chunk inicial, e uma dependência do three aqui já estourou o orçamento de
 * JS uma vez (ver PROGRESS.md). Vetores e poses são objetos simples.
 */

export interface Pose {
  x: number;
  y: number;
  z: number;
  /** Rotação em graus (mais fácil de ler nas tabelas de coreografia). */
  rx: number;
  ry: number;
  rz: number;
  s: number;
}

export interface CameraPose {
  x: number;
  y: number;
  z: number;
  /** Alvo. */
  tx: number;
  ty: number;
  tz: number;
  fov: number;
}

export interface SceneState {
  /** Horas contínuas ao longo da página (4,5 → 65,7). O céu usa `dayTime mod 24`. */
  dayTime: number;
  /** 0 céu limpo → 1 fechado (tempestade a partir de ~0,6). */
  cloudCover: number;
  /** Tom agendado do texto: 1 Nuvem, −1 Noite, 0 travessia (sem texto na tela). */
  tone: number;
  /** 0 painel dobrado → 1 aberto (livro). */
  panelOpen: number;
  /** 0 tampa fechada → 1 aberta. */
  lidOpen: number;
  /** 0 montado → 1 vista explodida. */
  explode: number;
  /** 0 → 1 peças reorganizadas como esquema. */
  schematic: number;
  /** 0 → 4: etapa do caminho da energia (parte inteira) e progresso dentro dela. */
  flow: number;
  /** 0 → 1 carga visível da bateria. */
  batteryCharge: number;
  /** 0 → 1 carga na tela do celular. */
  phoneCharge: number;
  /** 0 → 1 LED azul de saída. */
  ledOn: number;
  /** 0 → 1 cabo 3 em 1 ligando a caixa ao celular. */
  cable: number;
  /** 0 → 1 reflexo que corre pelas células (abertura). */
  glint: number;
  /** 0 → 1 → 0 primeiro raio de sol (abertura). */
  shaft: number;
  /** 0 → 1 presença do produto (0 = `visible = false`). */
  productVisible: number;
  /** 0 → 1 presença do celular. */
  phoneVisible: number;
  product: Pose;
  camera: CameraPose;
  /** Ponteiro normalizado (−1 a 1), escrito por `gsap.quickTo`. */
  pointer: { x: number; y: number };
}

export const sceneState: SceneState = {
  dayTime: 4.5,
  cloudCover: 0.1,
  tone: 1,
  panelOpen: 0,
  lidOpen: 0,
  explode: 0,
  schematic: 0,
  flow: 0,
  batteryCharge: 0.15,
  phoneCharge: 0,
  ledOn: 0,
  cable: 0,
  glint: 0,
  shaft: 0,
  productVisible: 0,
  phoneVisible: 0,
  product: { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, s: 1 },
  camera: { x: 0, y: 0.4, z: 6, tx: 0, ty: 0, tz: 0, fov: 32 },
  pointer: { x: 0, y: 0 },
};
```

## src/shaders/sky.frag.glsl

```glsl
// Céu em tela cheia: gradiente, brilho e disco do sol, nuvens, guarda de
// contraste, estrelas e grão. As cores chegam lineares de scene/daylight.ts.
// O contraste do texto é medido nos pixels pelo `snap` (scripts/snap.mjs).

uniform vec3 uZenith;
uniform vec3 uHorizon;
uniform vec3 uSunSide;
uniform vec3 uSun;
uniform vec3 uCloudLit;
uniform vec3 uCloudShade;
uniform vec2 uSunPos;
uniform float uHorizonY;
uniform float uAspect;
uniform float uSunSize;
uniform float uSunIntensity;
uniform float uGlowIntensity;
uniform float uStars;
uniform float uCloudCover;
uniform float uCloudShift;
uniform float uGuardMode;
uniform float uGuardAmount;
uniform float uGuardX0;
uniform float uGuardX1;
uniform float uPixelRatio;
uniform int uOctaves;

const float GRADIENT_POW = 0.65;
const float GLOW_FALLOFF = 3.2;
const float BAND_Y = 6.0;
const float BAND_X = 1.6;
const float GLOW_WEIGHT = 0.6;
const float BAND_WEIGHT = 0.5;
const float CLOUD_DENSITY_MAX = 0.95;
const float CAP_L = 0.13;
const float FLOOR_L = 0.36;
const float GUARD_SOFTNESS = 0.03;

varying vec2 vUv;

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash12(i);
  float b = hash12(i + vec2(1.0, 0.0));
  float c = hash12(i + vec2(0.0, 1.0));
  float d = hash12(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amp = 0.5;
  float norm = 0.0;
  for (int i = 0; i < 6; i++) {
    if (i >= uOctaves) break;
    value += amp * valueNoise(p);
    norm += amp;
    p = p * 2.03 + vec2(17.1, 9.2);
    amp *= 0.5;
  }
  return value / norm;
}

float luma(vec3 c) {
  return dot(c, vec3(0.2126, 0.7152, 0.0722));
}

float smin(float a, float b, float w) {
  return 0.5 * (a + b - sqrt((a - b) * (a - b) + w * w));
}

float smax(float a, float b, float w) {
  return 0.5 * (a + b + sqrt((a - b) * (a - b) + w * w));
}

// Guarda de legibilidade: com texto Nuvem, o céu da coluna de texto nunca
// passa de L 0,13; com texto Noite, nunca fica abaixo de L 0,36. Nas travessias
// (uGuardAmount 0) o céu fica livre para cruzar a zona morta. O disco do sol e o
// brilho logo em volta dele ficam de fora: o texto nunca para em cima do sol.
vec3 guard(vec3 c, float x, float sunDist) {
  float amount = uGuardAmount * (1.0 - smoothstep(uGuardX0, uGuardX1, x))
    * smoothstep(uSunSize * 1.2, uSunSize * 2.0, sunDist);
  if (amount <= 0.0 || uGuardMode == 0.0) return c;
  float l = luma(c);
  vec3 g;
  if (uGuardMode > 0.0) {
    float target = smin(l, CAP_L, GUARD_SOFTNESS);
    g = c * (l > 1e-5 ? target / l : 1.0);
  } else {
    float target = smax(l, FLOOR_L, GUARD_SOFTNESS);
    float lt = luma(uHorizon);
    float t = lt - l > 1e-5 ? clamp((target - l) / (lt - l), 0.0, 1.0) : 0.0;
    g = mix(c, uHorizon, t);
  }
  return mix(c, g, amount);
}

void main() {
  vec2 uv = vUv;

  float h = clamp((uv.y - uHorizonY) / (1.0 - uHorizonY), 0.0, 1.0);
  vec3 color = mix(uHorizon, uZenith, pow(h, GRADIENT_POW));

  vec2 d = vec2((uv.x - uSunPos.x) * uAspect, uv.y - uSunPos.y);
  float dist = length(d);
  float glow = exp(-dist * GLOW_FALLOFF) * uGlowIntensity;
  float band = exp(-abs(uv.y - uHorizonY) * BAND_Y) * exp(-abs(d.x) * BAND_X) * uGlowIntensity;
  color += uSunSide * (glow * GLOW_WEIGHT + band * BAND_WEIGHT);

  float disc = smoothstep(uSunSize, uSunSize * 0.82, dist) * uSunIntensity;
  color = mix(color, uSun, disc);

  // Nuvens: fbm esticado na horizontal, deslizando com a hora (e portanto com o scroll).
  float density = 0.0;
  if (uCloudCover > 0.02) {
    vec2 p = vec2(uv.x * uAspect * 1.2 + uCloudShift, uv.y * 2.6 - uCloudShift * 0.15);
    float n = fbm(p * 1.6);
    float shape = smoothstep(1.0 - uCloudCover - 0.1, 1.0 - uCloudCover + 0.25, n);
    density = shape * CLOUD_DENSITY_MAX * smoothstep(0.0, 0.35, uCloudCover);
    float prox = clamp(exp(-dist * 2.2) * 1.2, 0.0, 1.0) * smoothstep(-0.02, 0.1, uSunPos.y - uHorizonY);
    // Relevo barato: borda de cima mais clara que a base.
    float relief = smoothstep(0.35, 0.75, fbm(p * 1.6 + vec2(0.0, 0.08)));
    vec3 cloud = mix(uCloudShade, uCloudLit, clamp(prox + relief * 0.25 * prox, 0.0, 1.0));
    color = mix(color, cloud, density);
  }

  color = guard(color, uv.x, dist);

  // Estrelas depois da guarda (são pontos isolados e não afetam a leitura).
  if (uStars > 0.001) {
    vec2 cssPx = gl_FragCoord.xy / uPixelRatio;
    vec2 cell = floor(cssPx / 7.0);
    float pick = hash12(cell);
    if (pick > 0.962) {
      vec2 center = cell * 7.0 + 1.0 + vec2(hash12(cell + 17.1), hash12(cell + 31.7)) * 5.0;
      float size = mix(0.55, 1.25, hash12(cell + 5.3));
      float star = smoothstep(size, size * 0.25, length(cssPx - center)) * mix(0.3, 1.0, hash12(cell + 9.1));
      float above = smoothstep(0.0, 0.06, uv.y - uHorizonY * 0.4);
      color += vec3(0.85, 0.9, 1.0) * star * uStars * (1.0 - density) * above;
    }
  }

  gl_FragColor = vec4(color, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>

  // Grão estático (dither): tira o banding do gradiente sem piscar.
  gl_FragColor.rgb += (hash12(gl_FragCoord.xy) - 0.5) * (1.2 / 255.0);
}
```

## src/shaders/sky.vert.glsl

```glsl
varying vec2 vUv;

void main() {
  vUv = uv;
  // Quad em tela cheia no plano mais distante, ignorando a câmera: o céu é um
  // fundo 2D e nunca cobre o produto.
  gl_Position = vec4(position.xy, 0.999999, 1.0);
}
```

## src/sections/ChapterOpener.tsx

```tsx
import type { Part } from "../content/feira";

/**
 * Abertura de capítulo (seção 6 do brief): número grande, título e a aula de
 * origem. A aula fica abaixo do título, como legenda (nada de rótulo acima).
 */
export function ChapterOpener({ part }: { part: Part }) {
  return (
    <header className="chapter" data-anchor={`${part.id}-abertura`}>
      <span className="chapter__numeral type-numeral" aria-hidden="true">
        {part.n}
      </span>
      <div className="chapter__text">
        <h2 id={`${part.id}-titulo`} tabIndex={-1} className="type-h2 chapter__title">
          <span className="sr-only">Parte {part.n}: </span>
          {part.title}
        </h2>
        <p className="type-caption chapter__aula">{part.aula}</p>
      </div>
    </header>
  );
}
```

## src/sections/Client.tsx

```tsx
import { copy } from "../content/copy";
import { num } from "../content/format";
import { partsOfFair } from "../content/feira";
import { ChapterOpener } from "./ChapterOpener";

const part = partsOfFair[1];
const t = copy.cliente;
const p = t.persona;

/** Distância sítio–cidade: informação da persona, desenhada (DrawSVG na Fase 3). */
function Distance() {
  return (
    <figure className="distance" aria-label={`${p.farm} a ${num(p.distanceKm)} km da ${p.city.toLowerCase()}`}>
      <svg viewBox="0 0 400 24" preserveAspectRatio="none" aria-hidden="true" className="distance__line">
        <circle cx="6" cy="12" r="5" />
        <line x1="14" y1="12" x2="386" y2="12" />
        <circle cx="394" cy="12" r="5" />
      </svg>
      <figcaption className="type-caption distance__labels" aria-hidden="true">
        <span>{p.farm}</span>
        <span className="num">{num(p.distanceKm)}&nbsp;km</span>
        <span>{p.city}</span>
      </figcaption>
    </figure>
  );
}

/** Parte 2: O cliente (Aula 3). Noite depois da tempestade. */
export function Client() {
  return (
    <section
      id={part.id}
      data-section={part.id}
      data-part={part.n}
      aria-labelledby={`${part.id}-titulo`}
      className="part page-x"
    >
      <ChapterOpener part={part} />

      <div id="persona" className="block persona col-text">
        <span className="persona__monogram" aria-hidden="true">
          {p.initials}
        </span>
        <div className="persona__body">
          <h3 className="type-quote">
            {t.personaTitle}: {p.name}
          </h3>
          <p className="type-lead mt-3">
            {p.age}, {p.role}.
          </p>
          <Distance />
          <ul className="type-body persona__facts">
            {p.facts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        </div>
      </div>

      <figure className="block highlight col-text">
        <blockquote className="type-quote">{t.synthesis}</blockquote>
        <figcaption className="type-caption highlight__caption">{t.synthesisCaption}</figcaption>
      </figure>

      <div className="block col-text">
        <h3 className="type-h3">{t.reflectionTitle}</h3>
        <ol className="qa">
          {t.reflection.map((item, i) => (
            <li key={item.q} className="qa__row">
              <h4 className="type-label qa__q">
                <span className="num">{i + 1}</span> {item.q}
              </h4>
              <p className="type-body qa__a">{item.a}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="block col-text">
        <div className="split">
          <div className="split__col">
            <h3 className="type-h3">{t.personaLabel}</h3>
            <p className="type-body mt-4">{t.personaSummary}</p>
          </div>
          <div className="split__col">
            <h3 className="type-h3">{t.audienceLabel}</h3>
            <p className="type-body mt-4">{t.audience}</p>
          </div>
        </div>
        <p className="type-body mt-10">
          <strong className="font-semibold">{t.othersLabel}:</strong> {t.others}
        </p>
      </div>
    </section>
  );
}
```

## src/sections/Company.tsx

```tsx
import { copy } from "../content/copy";
import { company } from "../content/company";
import { brl } from "../content/format";
import { partsOfFair } from "../content/feira";
import { product, specSheet } from "../content/product";
import { ChapterOpener } from "./ChapterOpener";

const part = partsOfFair[3];
const t = copy.empresa;

/**
 * Plano de voo (Aula 5) como cartão de embarque: é o único objeto "cartão" da
 * página, porque é a metáfora da própria aula. Tem fundo próprio (Nuvem com
 * texto Noite), então não depende da hora do céu.
 */
function BoardingPass() {
  return (
    <div className="ticket-wrap">
      <figure className="ticket" aria-labelledby="plano-de-voo">
      <div className="ticket__main">
        <dl className="ticket__fields">
          {t.flight.map((f) => (
            <div key={f.field} className="ticket__field">
              <dt className="type-caption ticket__label">{f.field}</dt>
              <dd className="type-body">{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="ticket__stub" aria-hidden="true">
        <span className="ticket__brand">{company.name}</span>
        <span className="type-caption">{company.event}</span>
        <span className="type-caption">
          {company.school}, {company.semester}
        </span>
      </div>
      </figure>
    </div>
  );
}

function CostsTable() {
  return (
    <div className="table-scroll" role="region" aria-labelledby="custos-titulo" tabIndex={0}>
      <table id="custos" className="data-table data-table--costs">
        <caption id="custos-titulo" className="type-label">
          {t.finance.costsTitle} <span className="estimate">({t.estimateLabel})</span>
        </caption>
        <thead>
          <tr>
            <th scope="col">Item</th>
            <th scope="col" className="num-col">
              Custo
            </th>
          </tr>
        </thead>
        <tbody>
          {product.costs.map((row) => (
            <tr key={row.item}>
              <th scope="row">{row.item}</th>
              <td className="num num-col">{brl(row.brl)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row">Total</th>
            <td className="num num-col">{brl(product.costTotalBRL)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function Sectors() {
  const m = t.marketing;
  return (
    <div className="block col-text">
      <h3 className="type-h3">{t.sectorsTitle}</h3>
      <div className="sectors">
        <article className="sector">
          <h4 className="type-h3 sector__name">{t.products.name}</h4>
          <div className="sector__body">
            <p className="type-lead">{t.products.lead}</p>
            <p className="type-body mt-3">{t.products.text}</p>
          </div>
        </article>

        <article className="sector" id="financas">
          <h4 className="type-h3 sector__name">{t.finance.name}</h4>
          <div className="sector__body">
            <p className="type-lead">{t.finance.lead}</p>
            <CostsTable />
            <p id="preco" className="type-lead price">
              {t.finance.priceLabel}: <strong className="fact__number num">{brl(product.priceBRL)}</strong>, com
              margem de {product.margin} sobre o preço.
            </p>
            <p className="type-body mt-4">{t.finance.strategy}</p>
          </div>
        </article>

        <article className="sector">
          <h4 className="type-h3 sector__name">{m.name}</h4>
          <div className="sector__body">
            <p className="type-lead">{m.lead}</p>
            <p className="type-body mt-3">{m.identity}</p>
            <ul className="swatches" aria-label="Cores da marca">
              <li>
                <span className="swatches__chip" style={{ background: "var(--color-sol)" }} aria-hidden="true" />
                Sol
              </li>
              <li>
                <span className="swatches__chip" style={{ background: "var(--color-ceu)" }} aria-hidden="true" />
                Céu
              </li>
              <li>
                <span className="swatches__chip" style={{ background: "var(--color-noite)" }} aria-hidden="true" />
                Noite
              </li>
            </ul>
            <p className="type-quote slogan">“{m.slogan}”</p>
            <p className="type-body mt-6">{m.focus}</p>
            <p className="type-body mt-3">{m.booth}</p>
          </div>
        </article>
      </div>
    </div>
  );
}

function Prototype() {
  return (
    <div className="block block--last col-text">
      <h3 className="type-h2">{t.prototypeTitle}</h3>
      <p className="type-lead mt-8">{t.prototype}</p>

      <h4 className="type-h3 mt-16" id="ficha">
        {t.specTitle}
      </h4>
      <dl className="spec">
        {specSheet().map((row) => (
          <div key={row.label} className="spec__row">
            <dt className="type-label">{row.label}</dt>
            <dd className="type-body">
              {row.value}
              {row.estimate && <span className="estimate"> ({t.estimateLabel})</span>}
            </dd>
          </div>
        ))}
      </dl>

      <h4 className="type-h3 mt-16">{t.historyTitle}</h4>
      <ol className="history">
        {company.history.map((step, i) => (
          <li key={step.title} className="history__step">
            <span className="type-label num">{i + 1}</span>
            <div>
              <p className="type-label">{step.title}</p>
              <p className="type-body mt-2">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="type-caption mt-8">{company.team}</p>
    </div>
  );
}

/** Parte 4: A empresa (Aula 5). Dia claro, produto quieto ao lado. */
export function Company() {
  return (
    <section
      id={part.id}
      data-section={part.id}
      data-part={part.n}
      aria-labelledby={`${part.id}-titulo`}
      className="part page-x"
    >
      <ChapterOpener part={part} />

      <div className="block col-text">
        <h3 className="type-h3">{t.whoTitle}</h3>
        <p className="type-lead mt-4">{t.who}</p>
      </div>

      <div className="block col-text">
        <h3 id="plano-de-voo" className="type-h3">
          {t.flightTitle}
        </h3>
        <BoardingPass />
      </div>

      <Sectors />
      <Prototype />
    </section>
  );
}
```

## src/sections/Differential.tsx

```tsx
import { copy } from "../content/copy";

const t = copy.solucao;

/** Parte 3c: nosso diferencial (amanhecer seguinte; produto montado, girando). */
export function Differential() {
  return (
    <section
      id="diferencial"
      data-section="diferencial"
      data-part="3"
      aria-labelledby="diferencial-titulo"
      className="part part--tight page-x"
    >
      <div className="block block--first col-text">
        <h3 id="diferencial-titulo" className="type-h2">
          {t.lifeTitle}
        </h3>
        <ul className="benefits">
          {t.life.map((item) => (
            <li key={item.title} className="type-lead">
              <strong className="benefits__lead">{item.title}.</strong> {item.text}
            </li>
          ))}
        </ul>
      </div>

      <div id="diferencial-tabela" className="block block--last col-text">
        <h3 id="diferencial-tabela-titulo" className="type-h3">
          {t.diffTitle}
        </h3>
        <div className="table-scroll" role="region" aria-labelledby="diferencial-tabela-titulo" tabIndex={0}>
          <table className="data-table data-table--compare">
            <thead>
              <tr>
                <td />
                {t.diffColumns.map((column, i) => (
                  <th key={column} scope="col" data-ours={i === t.diffColumns.length - 1 || undefined}>
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {t.diffRows.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  {row.cells.map((cell, i) => (
                    <td key={i} data-ours={i === row.cells.length - 1 || undefined}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
```

## src/sections/EnergyDiagram.tsx

```tsx
import { energyPath } from "../content/product";

/**
 * Diagrama do caminho da energia em SVG, para quando não há WebGL (seção 5 do
 * brief). Cada etapa é um traço colorido com o nome escrito em `--fg`: a cor
 * é informação, nunca a única informação.
 */
export function EnergyDiagram() {
  const width = 640;
  const step = width / energyPath.length;
  return (
    <figure className="energy-diagram" aria-hidden="true">
      <svg viewBox={`0 0 ${width} 96`} role="presentation">
        {energyPath.map((s, i) => {
          const x0 = i * step + 12;
          const x1 = (i + 1) * step - 12;
          return (
            <g key={s.id}>
              <line x1={x0} y1="30" x2={x1} y2="30" stroke="var(--color-grafite)" strokeWidth="12" strokeLinecap="round" />
              <line x1={x0} y1="30" x2={x1} y2="30" stroke={`var(--color-${s.color})`} strokeWidth="5" strokeLinecap="round" />
              <text x={(x0 + x1) / 2} y="72" textAnchor="middle" fill="currentColor" className="energy-diagram__label">
                {s.n}. {s.title}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
```

## src/sections/EnergyStays.tsx

```tsx
import { useRef } from "react";
import { copy } from "../content/copy";
import { usePinnedStage } from "../lib/stage";

const t = copy.solucao;

/**
 * Cena "A energia fica" (pin; do pôr do sol ao nascer do dia seguinte).
 * 0–30%: travessia sem texto, enquanto o esquema se recolhe e o sol se põe.
 * 30–68%: o texto da noite. 70–84%: "Amanhã…", enquanto a noite passa.
 * 84–100%: travessia sem texto, com o sol do dia seguinte nascendo.
 * Só opacidade: o leitor de tela continua lendo tudo.
 */
export function EnergyStays() {
  const ref = useRef<HTMLElement>(null);
  usePinnedStage(ref, {
    length: { wide: 200, narrow: 140 },
    build: (tl) => {
      tl.fromTo("[data-stage-text]", { opacity: 0 }, { opacity: 1, duration: 0.04 }, 0.3)
        .to("[data-stage-text]", { opacity: 0, duration: 0.03 }, 0.66)
        .fromTo("[data-tomorrow]", { opacity: 0 }, { opacity: 1, duration: 0.04 }, 0.7)
        .to("[data-tomorrow]", { opacity: 0, duration: 0.03 }, 0.81);
    },
  });

  return (
    <section
      ref={ref}
      id="energia-fica"
      data-section="energia-fica"
      data-part="3"
      aria-labelledby="energia-fica-titulo"
      className="stage page-x"
    >
      <div className="stage__swap col-narrow">
        <div className="stage__text" data-stage-text>
          <h3 id="energia-fica-titulo" className="type-h2">
            {t.staysTitle}
          </h3>
          <p className="type-lead mt-8">{t.staysText}</p>
          <p className="type-caption mt-4">{t.staysNote}</p>
        </div>
        <p className="type-h2 stage__tomorrow" data-tomorrow>
          {t.tomorrow}
        </p>
      </div>
    </section>
  );
}
```

## src/sections/Fact.tsx

```tsx
import { num } from "../content/format";
import type { Fact as FactData, Source } from "../content/feira";

export function Sources({ sources }: { sources: Source[] }) {
  return (
    <p className="type-caption fact__source">
      {sources.length > 1 ? "Fontes: " : "Fonte: "}
      {sources.map((source, i) => (
        <span key={source.url}>
          {i > 0 && " e "}
          <a className="source-link" href={source.url} target="_blank" rel="noreferrer">
            {source.label}
          </a>
        </span>
      ))}
    </p>
  );
}

/**
 * Dado externo dentro de uma frase, com o número em destaque e a fonte logo
 * abaixo. O número é texto normal no DOM (o leitor de tela lê o valor final).
 */
export function Fact({ fact, className = "" }: { fact: FactData; className?: string }) {
  return (
    <div className={`fact ${className}`}>
      <p className="type-lead fact__text">
        {fact.before}
        <strong className="fact__number num" data-count={fact.value}>
          {num(fact.value)}
        </strong>
        {fact.after}
      </p>
      <Sources sources={fact.sources} />
    </div>
  );
}
```

## src/sections/Footer.tsx

```tsx
import { PORTFOLIO_URL } from "../config";
import { copy } from "../content/copy";
import { sources } from "../content/feira";

export function Footer() {
  return (
    <footer className="site-footer page-x">
      <div className="col-text">
        <p className="type-body">
          {copy.footer.credit}{" "}
          {PORTFOLIO_URL ? (
            <a href={PORTFOLIO_URL} className="source-link">
              {copy.footer.author}
            </a>
          ) : (
            copy.footer.author
          )}
          .
        </p>
        <h2 className="type-label mt-10">{copy.footer.sourcesTitle}</h2>
        <ul className="type-caption site-footer__sources">
          {Object.values(sources).map((source) => (
            <li key={source.url}>
              <a className="source-link" href={source.url} target="_blank" rel="noreferrer">
                {source.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
```

## src/sections/Header.tsx

```tsx
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { ScrollTrigger } from "../lib/gsap";
import { getLenis } from "../lib/lenis";
import { getSections, onSectionsChange, scrollToSection } from "../lib/sections";
import { company } from "../content/company";
import { partsOfFair, type PartId } from "../content/feira";

const TOTAL = partsOfFair.length;

/** Vai até a parte e leva o foco para o título dela (teclado e leitor de tela). */
function goTo(id: PartId) {
  if (!scrollToSection(id)) return;
  history.replaceState(null, "", `#${id}`);
  document.getElementById(`${id}-titulo`)?.focus({ preventScroll: true });
}

/** Número da parte de cada seção (`data-part`), lido a cada refresh. */
let partById = new Map<string, number>();

function readParts(): void {
  partById = new Map(
    [...document.querySelectorAll<HTMLElement>("[data-section][data-part]")].map((el) => [
      el.dataset.section ?? "",
      Number(el.dataset.part),
    ]),
  );
}

/** Parte atual (1 a 6) pela posição do meio da tela; 0 antes da Parte 1. */
function partAt(y: number): number {
  const probe = y + window.innerHeight * 0.5;
  let current = 0;
  for (const section of getSections()) {
    if (probe < section.start) break;
    current = partById.get(section.id) ?? current;
  }
  return current;
}

export function Header() {
  const [part, setPart] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Parte atual e esconder ao rolar para baixo no celular. Só muda estado
  // quando a parte muda, não a cada quadro.
  useEffect(() => {
    const header = headerRef.current;
    let current = -1;
    const update = (y: number, direction: number) => {
      const next = partAt(y);
      if (next !== current) {
        current = next;
        setPart(next);
      }
      if (header) header.dataset.away = String(direction > 0 && y > 120);
    };
    const trigger = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => update(self.scroll(), self.direction),
    });
    const off = onSectionsChange(() => {
      readParts();
      update(window.scrollY, 0);
    });
    return () => {
      trigger.kill();
      off();
    };
  }, []);

  // Menu do celular: diálogo modal simples (foco preso, Esc fecha, página inerte).
  useEffect(() => {
    if (!menuOpen) return;
    const lenis = getLenis();
    lenis?.stop();
    const main = document.querySelector("main");
    const footer = document.querySelector("footer");
    main?.setAttribute("inert", "");
    footer?.setAttribute("inert", "");
    const sheet = sheetRef.current;
    const menuButton = menuButtonRef.current;
    sheet?.querySelector<HTMLElement>("a")?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        return;
      }
      if (event.key !== "Tab" || !sheet) return;
      const focusables = [...sheet.querySelectorAll<HTMLElement>("a, button")];
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      main?.removeAttribute("inert");
      footer?.removeAttribute("inert");
      lenis?.start();
      menuButton?.focus({ preventScroll: true });
    };
  }, [menuOpen]);

  const onAnchor = (id: PartId) => (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setMenuOpen(false);
    // Espera o menu fechar (e o Lenis voltar) antes de rolar.
    requestAnimationFrame(() => goTo(id));
  };

  return (
    <header ref={headerRef} className="site-header page-x" data-away="false">
      <a
        href="#hero"
        className="type-label site-header__brand"
        onClick={(event) => {
          event.preventDefault();
          scrollToSection("hero");
        }}
      >
        {company.name}
      </a>

      <nav aria-label="Partes da apresentação" className="site-header__nav">
        <ol>
          {partsOfFair.map((p) => (
            <li key={p.id}>
              <a href={`#${p.id}`} aria-current={part === p.n ? "true" : undefined} onClick={onAnchor(p.id)}>
                <span className="num">{p.n}</span> {p.nav}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="site-header__meta">
        <span className="type-caption num site-header__count" aria-hidden="true" data-visible={part > 0}>
          {part > 0 ? `${part} de ${TOTAL}` : ""}
        </span>
        <button
          ref={menuButtonRef}
          type="button"
          className="type-label site-header__menu"
          aria-expanded={menuOpen}
          aria-controls="menu-partes"
          onClick={() => setMenuOpen(true)}
        >
          Menu
        </button>
      </div>

      <div className="site-header__progress" aria-hidden="true">
        <span style={{ transform: `scaleX(${part / TOTAL})` }} />
      </div>

      {menuOpen && (
        <div
          ref={sheetRef}
          id="menu-partes"
          role="dialog"
          aria-modal="true"
          aria-label="Partes da apresentação"
          className="menu-sheet"
        >
          <div className="menu-sheet__panel page-x">
            <div className="menu-sheet__top">
              <span className="type-label">{company.name}</span>
              <button type="button" className="type-label" onClick={() => setMenuOpen(false)}>
                Fechar
              </button>
            </div>
            <ol className="menu-sheet__list">
              {partsOfFair.map((p) => (
                <li key={p.id}>
                  <a href={`#${p.id}`} aria-current={part === p.n ? "true" : undefined} onClick={onAnchor(p.id)}>
                    <span className="num menu-sheet__n">{p.n}</span>
                    <span>
                      <span className="menu-sheet__title">{p.title}</span>
                      <span className="type-caption">{p.aula}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </header>
  );
}
```

## src/sections/Hero.tsx

```tsx
import { copy } from "../content/copy";
import { Loader } from "./Loader";

/**
 * Hero (manhã). O título pinta no primeiro quadro, sobre o céu da madrugada
 * que o `body` já tem. O produto 3D fica à direita (no celular, em cima), e a
 * linha do loader marca o horizonte onde ele pousa.
 */
export function Hero() {
  return (
    <section id="hero" data-section="hero" aria-labelledby="hero-titulo" className="hero page-x">
      <div className="hero__text col-text">
        <p className="type-label hero__name" data-hero-name>
          {copy.hero.productName}
        </p>
        <h1 id="hero-titulo" className="type-display hero__title">
          {copy.hero.title}
        </h1>
        <p className="type-lead hero__lead">{copy.hero.lead}</p>
      </div>
      <span className="hero__cue" aria-hidden="true" />
      <Loader />
    </section>
  );
}
```

## src/sections/HowItWorks.tsx

```tsx
import { useRef } from "react";
import { copy } from "../content/copy";
import { energyPath } from "../content/product";
import { usePinnedStage } from "../lib/stage";
import { EnergyDiagram } from "./EnergyDiagram";

/**
 * Cena "Como funciona" (pin; do meio-dia às 17h). A lista ordenada com as
 * quatro etapas está sempre no DOM: é o que o leitor de tela lê, já que o
 * esquema 3D não é lido (seção 10 do brief).
 */
export function HowItWorks() {
  const ref = useRef<HTMLElement>(null);
  usePinnedStage(ref, { length: { wide: 350, narrow: 245 } });

  return (
    <section
      ref={ref}
      id="como-funciona"
      data-section="como-funciona"
      data-part="3"
      aria-labelledby="como-funciona-titulo"
      className="stage page-x"
    >
      <div className="stage__text col-narrow" data-stage-text>
        <h3 id="como-funciona-titulo" className="type-h2">
          {copy.solucao.howTitle}
        </h3>
        <ol className="steps">
          {energyPath.map((s) => (
            <li key={s.id} className="steps__item" data-step={s.id}>
              <h4 className="type-h3 steps__title">
                <span className="num">{s.n}</span> {s.title}
              </h4>
              <p className="type-body steps__text">{s.text}</p>
            </li>
          ))}
        </ol>
        <EnergyDiagram />
        <div className="legend">
          <p className="type-caption legend__title">{copy.solucao.howLegendTitle}</p>
          <ul>
            {energyPath.map((s) => (
              <li key={s.id} className="type-caption">
                <span className="legend__swatch" style={{ background: `var(--color-${s.color})` }} aria-hidden="true" />
                {s.legend}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
```

## src/sections/Inside.tsx

```tsx
import { useRef } from "react";
import { copy } from "../content/copy";
import { parts } from "../content/product";
import { usePinnedStage } from "../lib/stage";

/**
 * Cena "Por dentro" (pin; do nascer ao meio-dia). 0–18%: travessia sem texto,
 * enquanto o sol nasce e a câmera chega à caixa. Depois, o título e a lista das
 * peças, que é também a versão acessível dos callouts do 3D. Só opacidade: o
 * leitor de tela continua lendo tudo.
 */
export function Inside() {
  const ref = useRef<HTMLElement>(null);
  usePinnedStage(ref, {
    length: { wide: 250, narrow: 175 },
    build: (tl) => {
      tl.fromTo("[data-stage-text]", { opacity: 0 }, { opacity: 1, duration: 0.05 }, 0.19);
    },
  });

  return (
    <section
      ref={ref}
      id="por-dentro"
      data-section="por-dentro"
      data-part="3"
      aria-labelledby="por-dentro-titulo"
      className="stage page-x"
    >
      <div className="stage__text col-narrow" data-stage-text>
        <h3 id="por-dentro-titulo" className="type-h2">
          {copy.solucao.insideTitle}
        </h3>
        <ol className="parts-list">
          {parts.map((p, i) => (
            <li key={p.id} data-part-id={p.id}>
              <span className="num parts-list__n">{i + 1}</span>
              <span>
                <strong className="parts-list__name">{p.name}</strong>
                <span className="parts-list__role">{p.role}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
```

## src/sections/Loader.tsx

```tsx
import { useEffect, useRef, useState } from "react";
import { gsap } from "../lib/gsap";
import { onProgress } from "../lib/loading";
import { runOpening } from "../lib/opening";

const MIN_VISIBLE_MS = 600;

/**
 * Loader: uma linha fina na linha do horizonte, onde o produto vai pousar.
 * Enche com o progresso real (fonte, chunk 3D, texturas e shaders), fica no
 * mínimo 600 ms e, quando tudo está pronto, dá lugar à abertura. Não cobre o
 * texto: o título do hero pinta desde o primeiro quadro (é o LCP).
 */
export function Loader() {
  const lineRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const started = performance.now();
    let finished = false;
    let timer = 0;
    const off = onProgress((p) => {
      gsap.to(fillRef.current, { scaleX: p, duration: 0.35, ease: "power2.out", overwrite: true });
      if (p < 1 || finished) return;
      finished = true;
      const wait = Math.max(0, MIN_VISIBLE_MS - (performance.now() - started));
      timer = window.setTimeout(() => {
        runOpening(lineRef.current).then(() => setDone(true));
      }, wait);
    });
    return () => {
      off();
      window.clearTimeout(timer);
    };
  }, []);

  if (done) return null;
  return (
    <div ref={lineRef} className="loader-line" aria-hidden="true">
      <span ref={fillRef} />
    </div>
  );
}
```

## src/sections/Pitch.tsx

```tsx
import { copy } from "../content/copy";
import { partsOfFair, pitchTimeline } from "../content/feira";
import { ChapterOpener } from "./ChapterOpener";

const part = partsOfFair[4];

/** Parte 5: O pitch (Aula 6). Linha do tempo de 0:00 a 3:00. */
export function Pitch() {
  return (
    <section
      id={part.id}
      data-section={part.id}
      data-part={part.n}
      aria-labelledby={`${part.id}-titulo`}
      className="part page-x"
    >
      <ChapterOpener part={part} />

      <div className="block block--last col-text">
        <h3 className="type-h3">{copy.pitch.title}</h3>
        <ol className="timeline">
          {pitchTimeline.map((block) => (
            <li key={block.from} className="timeline__block">
              <p className="type-label num timeline__time">
                {block.from} a {block.to}
              </p>
              <p className="type-h3 timeline__sector">{block.sector}</p>
              <p className="type-body timeline__text">{block.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
```

## src/sections/Problem.tsx

```tsx
import { copy } from "../content/copy";
import { facts, partsOfFair } from "../content/feira";
import { ChapterOpener } from "./ChapterOpener";
import { Fact } from "./Fact";

const part = partsOfFair[0];
const t = copy.problema;

/** Parte 1: O problema (Aula 2). O céu fecha e escurece até a noite. */
export function Problem() {
  return (
    <section
      id={part.id}
      data-section={part.id}
      data-part={part.n}
      aria-labelledby={`${part.id}-titulo`}
      className="part page-x"
    >
      <ChapterOpener part={part} />
      <p className="type-lead part__intro col-text">{t.opening}</p>

      <div className="block col-text">
        <h3 className="type-h3">{t.opportunitiesTitle}</h3>
        <div className="groups">
          {t.opportunities.map((group, i) => (
            <div key={group.group} className="groups__row" data-offset={i % 2 === 1 || undefined}>
              <h4 className="type-label groups__name">{group.group}</h4>
              <ul className="type-body groups__items">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="block col-text">
        <h3 className="type-quote">{t.question}</h3>
        <p className="type-caption mt-3">{t.questionCaption}</p>
        <ol className="triad">
          {t.problems.map((problem, i) => (
            <li key={problem} className="triad__item">
              <span className="type-label num">{i + 1}</span>
              <p className="type-body">{problem}</p>
            </li>
          ))}
        </ol>
      </div>

      <figure id="situacao-problema" className="block highlight col-text">
        <blockquote className="type-quote">{t.situation}</blockquote>
        <figcaption className="type-caption highlight__caption">{t.situationCaption}</figcaption>
      </figure>

      <div className="block col-text">
        <h3 className="type-h3">{t.whyTitle}</h3>
        <p className="type-body mt-6">{t.whyAccess}</p>
        <Fact fact={facts.semEnergia} className="mt-12" />
        <Fact fact={facts.apagaoAmapa} className="mt-10" />
        <p className="type-body mt-12">{t.whyClean}</p>
      </div>
    </section>
  );
}
```

## src/sections/Solution.tsx

```tsx
import { copy } from "../content/copy";
import { facts, partsOfFair } from "../content/feira";
import { ChapterOpener } from "./ChapterOpener";
import { Fact } from "./Fact";

const part = partsOfFair[2];
const t = copy.solucao;

/**
 * Parte 3 (Aula 4), primeiro trecho: abertura do capítulo, a caça ao
 * diferencial (d.light, antes da solução, na ordem do slide) e a introdução da
 * nossa solução, que leva direto às três cenas presas.
 */
export function Solution() {
  return (
    <section
      id={part.id}
      data-section={part.id}
      data-part={part.n}
      aria-labelledby={`${part.id}-titulo`}
      className="part page-x"
    >
      <ChapterOpener part={part} />

      <div className="block col-text">
        <h3 className="type-h3">{t.dlightTitle}</h3>
        <p className="type-body mt-4">{t.dlightWhy}</p>
        <dl className="qa">
          {t.dlight.map((item, i) => (
            <div key={item.q} className="qa__row">
              <dt className="type-label qa__q">{item.q}</dt>
              <dd className="type-body qa__a">
                {item.a}
                {i === t.dlight.length - 1 && <Fact fact={facts.dlightAlcance} className="mt-6" />}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="block block--last col-text">
        <h3 className="type-h2">{t.solutionTitle}</h3>
        <p className="type-lead mt-8">{t.solution}</p>
      </div>
    </section>
  );
}
```

## src/sections/Youth.tsx

```tsx
import { copy } from "../content/copy";
import { partsOfFair } from "../content/feira";
import { ChapterOpener } from "./ChapterOpener";

const part = partsOfFair[5];
const t = copy.jovem;

/** Parte 6: O jovem empreendedor (AQ3). Fim de tarde dourado; último giro do produto. */
export function Youth() {
  return (
    <section
      id={part.id}
      data-section={part.id}
      data-part={part.n}
      aria-labelledby={`${part.id}-titulo`}
      className="part page-x"
    >
      <ChapterOpener part={part} />

      <div className="block manifesto col-text">
        {t.manifesto.map((paragraph) => (
          <p key={paragraph} className="type-lead">
            {paragraph}
          </p>
        ))}
      </div>

      <div className="block block--last final col-text">
        <p className="type-h2 final__slogan">{t.slogan}</p>
      </div>
    </section>
  );
}
```

## scripts/snap.mjs

```js
// Verificação visual obrigatória (seção 12 do brief).
//
// Faz o build, mede o JS (gzip) contra o orçamento da seção 11, sobe o preview
// e fotografa cada seção de `window.__sections` no início, no meio e no fim
// (nas cenas presas, 0%, 50% e 100% do pin). Passadas: 1440×900 e 390×844
// (toque), normal e com reduced motion, mais 1920×1080 (a TV do estande) e
// `?nowebgl` (fallback). Em cada ponto, mede o contraste nos pixels reais: tira
// uma segunda foto com o texto transparente e compara a cor de cada texto com
// o fundo logo atrás dele (10º percentil, WCAG AA).
//
// Falha com: erro no console, contraste abaixo de AA ou WebGL ausente.
//
// Uso: npm run snap [fase] [-- --quick] [-- --no-build]
//   --quick     só 1440×900 e 390×844 na passada normal
//   --no-build  usa o dist/ que já existe
//   --only=390x844  só as passadas desse viewport
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import path from "node:path";
import process from "node:process";

const args = process.argv.slice(2);
const PHASE = args.find((a) => !a.startsWith("--")) ?? "fase-1";
const QUICK = args.includes("--quick");
const BUILD = !args.includes("--no-build");
const ONLY = args.find((a) => a.startsWith("--only="))?.slice(7);
const PORT = 4173;
const ROOT = path.resolve(".");
const OUT_DIR = path.join(ROOT, ".snapshots", PHASE);
const WAIT_MS = 900;
const BUDGET = { initial: 150, total: 500 };

const PASSES = [
  { name: "1440x900", viewport: { width: 1440, height: 900 }, touch: false },
  { name: "390x844", viewport: { width: 390, height: 844 }, touch: true },
  { name: "1440x900", viewport: { width: 1440, height: 900 }, touch: false, reduced: true },
  { name: "390x844", viewport: { width: 390, height: 844 }, touch: true, reduced: true },
  { name: "1920x1080", viewport: { width: 1920, height: 1080 }, touch: false, dir: "tv" },
  { name: "1440x900", viewport: { width: 1440, height: 900 }, touch: false, nowebgl: true },
]
  .filter((p) => !QUICK || (!p.reduced && !p.dir && !p.nowebgl))
  .filter((p) => !ONLY || p.name === ONLY);

function run(command, commandArgs) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, { stdio: "inherit", shell: true });
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${command} saiu com código ${code}`))));
  });
}

function startPreview() {
  return new Promise((resolve, reject) => {
    const vite = path.join(ROOT, "node_modules/vite/bin/vite.js");
    const child = spawn(process.execPath, [vite, "preview", "--port", String(PORT), "--strictPort"], { stdio: "pipe" });
    let ready = false;
    child.stdout.on("data", (chunk) => {
      if (!ready && chunk.toString().includes("http://localhost")) {
        ready = true;
        resolve(child);
      }
    });
    child.stderr.on("data", (chunk) => process.stderr.write(chunk));
    child.on("exit", (code) => {
      if (!ready) reject(new Error(`vite preview saiu com código ${code}`));
    });
  });
}

// ------------------------------------------------------------- orçamento de JS

/** Gzip de cada chunk a partir do manifest do Vite. Debug (`leva`, `r3f-perf`) fica de fora do total. */
async function measureBundle() {
  const dist = path.join(ROOT, "dist");
  const manifest = JSON.parse(await readFile(path.join(dist, ".vite/manifest.json"), "utf8"));
  const gz = new Map();
  const sizeOf = async (file) => {
    if (!gz.has(file)) gz.set(file, gzipSync(await readFile(path.join(dist, file))).length / 1024);
    return gz.get(file);
  };
  const isDebug = (key) => /node_modules\/(leva|r3f-perf)\//.test(key);
  const entryKey = Object.keys(manifest).find((k) => manifest[k].isEntry);

  const initial = new Set();
  const walkStatic = (key) => {
    if (initial.has(key)) return;
    initial.add(key);
    for (const dep of manifest[key].imports ?? []) walkStatic(dep);
  };
  walkStatic(entryKey);

  const all = new Set();
  const walkAll = (key) => {
    if (all.has(key) || isDebug(key)) return;
    all.add(key);
    for (const dep of [...(manifest[key].imports ?? []), ...(manifest[key].dynamicImports ?? [])]) walkAll(dep);
  };
  walkAll(entryKey);

  const sum = async (keys) => {
    let total = 0;
    for (const key of keys) if (manifest[key].file.endsWith(".js")) total += await sizeOf(manifest[key].file);
    return total;
  };
  const rows = [];
  for (const key of all) {
    const { file } = manifest[key];
    if (file.endsWith(".js")) rows.push({ chunk: key.replace(/^.*node_modules\//, ""), file, kb: await sizeOf(file) });
  }
  rows.sort((a, b) => b.kb - a.kb);
  const css = (await readdir(path.join(dist, "assets"))).filter((f) => f.endsWith(".css"));
  let cssKb = 0;
  for (const f of css) cssKb += await sizeOf(path.join("assets", f));
  return { initialKb: await sum(initial), totalKb: await sum(all), cssKb, rows };
}

// ---------------------------------------------------------------- contraste

/** Roda no navegador: caixas de texto visíveis, com cor, tamanho e fundo opaco (se houver). */
function collectTextBoxes() {
  const probe = new OffscreenCanvas(1, 1).getContext("2d", { willReadFrequently: true });
  const toRgba = (css) => {
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = "#000";
    probe.fillStyle = css;
    probe.fillRect(0, 0, 1, 1);
    const d = probe.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2], d[3] / 255];
  };
  const vw = innerWidth;
  const vh = innerHeight;
  const opaqueBg = (el) => {
    for (let a = el; a && a !== document.body; a = a.parentElement) {
      const c = toRgba(getComputedStyle(a).backgroundColor);
      if (c[3] >= 0.95) return c.slice(0, 3);
    }
    return null;
  };
  const opacity = (el) => {
    let o = 1;
    for (let a = el; a; a = a.parentElement) o *= parseFloat(getComputedStyle(a).opacity);
    return o;
  };
  // Área visível do texto: a tela, cortada por todo ancestral que recorta (overflow, clip-path).
  const clipOf = (el) => {
    let r = { l: 0, t: 0, r: vw, b: vh };
    for (let a = el; a && a !== document.documentElement; a = a.parentElement) {
      const s = getComputedStyle(a);
      if (s.overflowX !== "visible" || s.overflowY !== "visible" || s.clipPath !== "none") {
        const b = a.getBoundingClientRect();
        r = { l: Math.max(r.l, b.left), t: Math.max(r.t, b.top), r: Math.min(r.r, b.right), b: Math.min(r.b, b.bottom) };
      }
    }
    return r;
  };

  const boxes = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const text = n.nodeValue.replace(/\s+/g, " ").trim();
    if (!text) continue;
    const el = n.parentElement;
    if (!el || el.closest("script, style, noscript")) continue;
    if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
    if (opacity(el) < 0.98) continue; // em transição: o brief permite
    const cs = getComputedStyle(el);
    const fg = toRgba(cs.color);
    if (fg[3] < 0.5) continue;
    const size = parseFloat(cs.fontSize);
    const weight = parseFloat(cs.fontWeight);
    const clip = clipOf(el);
    const range = document.createRange();
    range.selectNodeContents(n);
    for (const r of range.getClientRects()) {
      const x0 = Math.max(clip.l, r.left);
      const y0 = Math.max(clip.t, r.top);
      const x1 = Math.min(clip.r, r.right);
      const y1 = Math.min(clip.b, r.bottom);
      if (x1 - x0 < 3 || y1 - y0 < 3) continue;
      boxes.push({
        x: x0,
        y: y0,
        w: x1 - x0,
        h: y1 - y0,
        fg: fg.slice(0, 3),
        bg: opaqueBg(el),
        large: size >= 24 || (size >= 18.66 && weight >= 700),
        text: text.slice(0, 48),
      });
    }
  }
  return boxes;
}

/** Roda no navegador: compara cada texto com os pixels do fundo (foto sem texto). */
async function measureContrast({ b64, boxes }) {
  const blob = await (await fetch(`data:image/png;base64,${b64}`)).blob();
  const bitmap = await createImageBitmap(blob);
  const ctx = new OffscreenCanvas(bitmap.width, bitmap.height).getContext("2d", { willReadFrequently: true });
  ctx.drawImage(bitmap, 0, 0);
  const lin = (c) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

  const worstByText = new Map();
  for (const box of boxes) {
    const fg = lum(...box.fg);
    let value;
    if (box.bg) {
      value = ratio(fg, lum(...box.bg));
    } else {
      const x = Math.floor(box.x);
      const y = Math.floor(box.y);
      const w = Math.max(1, Math.min(bitmap.width - x, Math.floor(box.w)));
      const h = Math.max(1, Math.min(bitmap.height - y, Math.floor(box.h)));
      const data = ctx.getImageData(x, y, w, h).data;
      const step = Math.max(1, Math.floor(Math.sqrt((w * h) / 600)));
      const values = [];
      for (let j = 0; j < h; j += step) {
        for (let i = 0; i < w; i += step) {
          const k = (j * w + i) * 4;
          values.push(ratio(fg, lum(data[k], data[k + 1], data[k + 2])));
        }
      }
      values.sort((a, b) => a - b);
      // 10º percentil: estrelas e grão (pontos isolados) não reprovam um texto inteiro.
      value = values[Math.floor(values.length * 0.1)];
    }
    const min = box.large ? 3 : 4.5;
    const previous = worstByText.get(box.text);
    if (!previous || value < previous.ratio) worstByText.set(box.text, { text: box.text, ratio: value, min });
  }
  return [...worstByText.values()]
    .filter((r) => r.ratio < r.min)
    .map((r) => ({ ...r, ratio: Math.round(r.ratio * 100) / 100 }));
}

const HIDE_TEXT = `*,*::before,*::after{color:transparent!important;text-shadow:none!important;
text-decoration-color:transparent!important;-webkit-text-stroke:0!important;transition:none!important}`;

async function contrastIssues(page) {
  const boxes = await page.evaluate(collectTextBoxes);
  await page.evaluate((css) => {
    const style = document.createElement("style");
    style.id = "__snap-hide-text";
    style.textContent = css;
    document.head.append(style);
  }, HIDE_TEXT);
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  const background = await page.screenshot();
  await page.evaluate(() => document.getElementById("__snap-hide-text")?.remove());
  return page.evaluate(measureContrast, { b64: background.toString("base64"), boxes });
}

// ------------------------------------------------------------------ passadas

function pointsOf(section, vh, maxScroll) {
  const clamp = (y) => Math.round(Math.min(Math.max(0, y), maxScroll));
  if (section.pinStart !== undefined && section.pinEnd !== undefined) {
    const span = section.pinEnd - section.pinStart;
    return [
      ["start", clamp(section.pinStart)],
      ["mid", clamp(section.pinStart + span * 0.5)],
      ["end", clamp(section.pinEnd)],
    ];
  }
  const end = Math.max(section.start, section.end - vh);
  return [
    ["start", clamp(section.start)],
    ["mid", clamp((section.start + end) / 2)],
    ["end", clamp(end)],
  ];
}

async function runPass(browser, pass, report) {
  const label = [pass.name, pass.reduced && "reduced", pass.nowebgl && "nowebgl"].filter(Boolean).join(" ");
  const dir = path.join(OUT_DIR, pass.reduced ? "reduced" : pass.nowebgl ? "nowebgl" : pass.dir ?? "");
  await mkdir(dir, { recursive: true });

  const context = await browser.newContext({
    viewport: pass.viewport,
    deviceScaleFactor: 1,
    hasTouch: pass.touch,
    isMobile: pass.touch,
    reducedMotion: pass.reduced ? "reduce" : "no-preference",
  });
  await context.addInitScript(() => {
    window.__metrics = { lcp: 0, cls: 0 };
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) window.__metrics.lcp = entry.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__metrics.cls += entry.value;
    }).observe({ type: "layout-shift", buffered: true });
  });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));

  await page.goto(`http://localhost:${PORT}/?snap${pass.nowebgl ? "&nowebgl" : ""}`, { waitUntil: "load" });
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
  const metrics = await page.evaluate(() => window.__metrics);
  const webgl = await page.evaluate(() => document.documentElement.dataset.scene === "on" && !!document.querySelector("canvas"));
  const sections = await page.evaluate(() => window.__sections ?? []);
  const { vh, maxScroll } = await page.evaluate(() => ({
    vh: window.innerHeight,
    maxScroll: document.documentElement.scrollHeight - window.innerHeight,
  }));

  const result = { pass: label, lcp: Math.round(metrics.lcp), cls: Math.round(metrics.cls * 1000) / 1000, webgl, errors, contrast: [] };
  if (!pass.nowebgl && !webgl) console.error(`[${label}] WebGL ausente`);

  for (const section of sections) {
    for (const [point, y] of pointsOf(section, vh, maxScroll)) {
      await page.evaluate((target) => {
        if (window.__lenis) window.__lenis.scrollTo(target, { immediate: true, force: true });
        else window.scrollTo(0, target);
      }, y);
      await page.waitForTimeout(WAIT_MS);
      const file = `${pass.name}-${section.id}-${point}.png`;
      await page.screenshot({ path: path.join(dir, file) });
      for (const issue of await contrastIssues(page)) result.contrast.push({ shot: file, ...issue });
    }
  }

  await context.close();
  for (const e of errors) console.error(`[${label}] console: ${e}`);
  for (const c of result.contrast) console.error(`[${label}] contraste ${c.ratio}:1 (mín. ${c.min}) em ${c.shot}: "${c.text}"`);
  console.log(`[${label}] ${sections.length} seções · LCP ${result.lcp} ms · CLS ${result.cls} · WebGL ${webgl ? "sim" : "não"}`);
  report.passes.push(result);
  return errors.length > 0 || result.contrast.length > 0 || (!pass.nowebgl && !webgl);
}

async function main() {
  if (BUILD) await run("npm", ["run", "build"]);
  await mkdir(OUT_DIR, { recursive: true });

  const bundle = await measureBundle();
  const report = { phase: PHASE, date: new Date().toISOString(), bundle, passes: [] };
  console.log(`\nJS gzip: inicial ${bundle.initialKb.toFixed(1)} KB (teto ${BUDGET.initial}) · total ${bundle.totalKb.toFixed(1)} KB (teto ${BUDGET.total}) · CSS ${bundle.cssKb.toFixed(1)} KB`);
  for (const row of bundle.rows) console.log(`  ${row.kb.toFixed(1).padStart(7)} KB  ${row.chunk}`);
  const overBudget = bundle.initialKb > BUDGET.initial || bundle.totalKb > BUDGET.total;
  if (overBudget) console.warn("Aviso: orçamento de JS estourado. Explique o desvio no PROGRESS.md.");

  const preview = await startPreview();
  const browser = await chromium.launch({ headless: true, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  let failed = false;
  try {
    for (const pass of PASSES) failed = (await runPass(browser, pass, report)) || failed;
  } finally {
    await browser.close();
    preview.kill();
  }

  await writeFile(path.join(OUT_DIR, "report.json"), JSON.stringify(report, null, 2));
  if (failed) {
    console.error(`\nsnap: falhou (veja acima). Imagens e report.json em ${OUT_DIR}`);
    process.exit(1);
  }
  console.log(`\nsnap: tudo certo. Imagens e report.json em ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```
