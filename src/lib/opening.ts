import { gsap } from "./gsap";
import { getLenis } from "./lenis";
import { holdTracks } from "./tracks";
import { markReady } from "./sections";
import { prefersReducedMotion } from "./env";
import { sceneState } from "../scene/state";

/** Duração da abertura depois de pronto (seção 7 do brief: até 2,4 s). */
export const OPENING_SECONDS = 2.4;

/** Estado de antes da abertura: madrugada, painel dobrado, o produto em silhueta. */
const START = { dayTime: 4.5, cloudCover: 0.1, panelOpen: 0, panelCable: 0, glint: 0, shaft: 0 };
/** Campos sem trilho de scroll: ficam no fim da abertura para sempre. */
const AFTER = { panelCable: 1, glint: 1, shaft: 0 };

let prepared: { dayTime: number; cloudCover: number; panelOpen: number; cameraZ: number; productRy: number } | null = null;
let opened = false;

/**
 * Antes do loader terminar: guarda a pose do hero (o trilho de scroll já foi
 * aplicado) e põe a cena no estado de antes da abertura.
 */
export function prepareOpening(): void {
  if (opened || prepared) return;
  prepared = {
    dayTime: sceneState.dayTime,
    cloudCover: sceneState.cloudCover,
    panelOpen: sceneState.panelOpen,
    cameraZ: sceneState.camera.z,
    productRy: sceneState.product.ry,
  };
  Object.assign(sceneState, START);
}

/**
 * Abertura automática (seção 7 do brief): o céu sai da madrugada, o primeiro
 * raio de sol atravessa a cena, o painel se abre como um livro, um reflexo
 * corre pelas células, o cabo liga o painel à caixa e o nome do produto sobe
 * de dentro de uma máscara. No fim, `window.__ready = true`.
 *
 * Só roda com a página no topo. Qualquer rolagem, toque ou tecla pula para o
 * fim (a pessoa manda). Com reduced motion, vai direto ao estado final.
 */
export function runOpening(line: HTMLElement | null): Promise<void> {
  return new Promise((resolve) => {
    const name = document.querySelector<HTMLElement>("[data-hero-name]");
    const finish = () => {
      opened = true;
      Object.assign(sceneState, AFTER);
      if (name) gsap.set(name, { clearProps: "transform" });
      document.documentElement.dataset.opened = "";
      holdTracks(false);
      getLenis()?.start();
      markReady();
      resolve();
    };

    const end = prepared;
    if (!end || prefersReducedMotion() || window.scrollY > 40) {
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
    // O sol nasce (6 h) perto de 1,5 s; o raio, o painel e o reflexo seguem
    // a luz chegando.
    timeline
      .to(sceneState, { dayTime: end.dayTime, cloudCover: end.cloudCover, duration: OPENING_SECONDS, ease: "power1.out" }, 0)
      .fromTo(sceneState.camera, { z: end.cameraZ + 0.9 }, { z: end.cameraZ, duration: OPENING_SECONDS, ease: "power2.out" }, 0)
      .fromTo(sceneState.product, { ry: end.productRy - 10 }, { ry: end.productRy, duration: OPENING_SECONDS, ease: "power2.out" }, 0)
      // O primeiro raio cruza a cena quando o sol aparece.
      .to(sceneState, { shaft: 1, duration: 1.4, ease: "none" }, 0.7)
      // O painel abre como um livro, e o reflexo corre pelas células.
      .to(sceneState, { panelOpen: end.panelOpen, duration: 1.0, ease: "power3.inOut" }, 0.95)
      .to(sceneState, { glint: 1, duration: 0.75, ease: "power1.inOut" }, 1.6)
      // O cabo liga o painel à caixa.
      .to(sceneState, { panelCable: 1, duration: 0.45, ease: "power2.out" }, 1.9);
    if (name) timeline.fromTo(name, { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: "expo.out" }, 1.4);
    if (line) timeline.to(line, { autoAlpha: 0, duration: 0.6, ease: "power2.out" }, 0.3);

    events.forEach((type) => window.addEventListener(type, skip, { passive: true }));
  });
}
