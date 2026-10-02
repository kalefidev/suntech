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
