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
