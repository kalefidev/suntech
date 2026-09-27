import Lenis from "lenis";
import { gsap, ScrollTrigger } from "./gsap";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

let lenis: Lenis | undefined;

/**
 * Cria o Lenis e sincroniza com o GSAP exatamente como a seção 5 do brief
 * pede. Chamado uma vez, fora do reduced-motion (ver App.tsx).
 */
export function setupLenis(): Lenis {
  if (lenis) return lenis;

  lenis = new Lenis();

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis?.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  window.__lenis = lenis;
  return lenis;
}

export function getLenis(): Lenis | undefined {
  return lenis;
}
