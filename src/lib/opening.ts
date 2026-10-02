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
