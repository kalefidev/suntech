import { gsap } from "./gsap";

let loaded: Promise<{
  SplitText: typeof import("gsap/SplitText").SplitText;
  DrawSVGPlugin: typeof import("gsap/DrawSVGPlugin").DrawSVGPlugin;
  CustomEase: typeof import("gsap/CustomEase").CustomEase;
  revealEase: string;
}> | null = null;

const REVEAL_EASE_NAME = "suntechReveal";

/**
 * Carrega SplitText, DrawSVGPlugin e CustomEase só quando algo realmente
 * precisa deles (títulos com máscara a partir da Fase 2, callouts com linha
 * desenhada na Fase 3) — mantém esses ~20KB fora do bundle inicial.
 */
export function loadTextPlugins() {
  if (!loaded) {
    loaded = Promise.all([
      import("gsap/SplitText"),
      import("gsap/DrawSVGPlugin"),
      import("gsap/CustomEase"),
    ]).then(([split, draw, custom]) => {
      gsap.registerPlugin(split.SplitText, draw.DrawSVGPlugin, custom.CustomEase);
      // cubic-bezier(0.22, 1, 0.36, 1) da seção 6 do brief.
      custom.CustomEase.create(REVEAL_EASE_NAME, "M0,0 C0.22,1 0.36,1 1,1");
      return {
        SplitText: split.SplitText,
        DrawSVGPlugin: draw.DrawSVGPlugin,
        CustomEase: custom.CustomEase,
        revealEase: REVEAL_EASE_NAME,
      };
    });
  }
  return loaded;
}
