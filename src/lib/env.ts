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
  /** `?slowmo=10`: as timelines do GSAP andam 10× mais devagar (para fotografar a abertura). */
  slowmo: Math.max(1, Number(params.get("slowmo")) || 1),
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
