import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Só o núcleo + ScrollTrigger entram no bundle inicial: são usados desde a
// Fase 1 (registro de atos, indicador de progresso, curva de dayTime).
// SplitText, CustomEase e DrawSVGPlugin só existem em texto/callout — ver
// `lib/gsapText.ts`, carregado sob demanda a partir da Fase 2.
gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };
