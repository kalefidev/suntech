import { gsap } from "./gsap";
import { getLenis } from "./lenis";
import { holdTracks } from "./tracks";
import { markReady } from "./sections";
import { prefersReducedMotion } from "./env";
import { sceneState } from "../scene/state";

/** Duração da abertura depois de pronto (seção 7 do brief: até 2,4 s). */
export const OPENING_SECONDS = 2.4;

let prepared: { cameraDist: number; ry: number } | null = null;
let opened = false;

/**
 * Antes do loader terminar: guarda a pose do início (o trilho de scroll já foi
 * aplicado) e põe o produto fora de cena, para a abertura partir daí.
 */
export function prepareOpening(): void {
  if (opened || prepared) return;
  const c = sceneState.camera;
  prepared = { cameraDist: Math.hypot(c.x - c.tx, c.y - c.ty, c.z - c.tz), ry: sceneState.product.ry };
  sceneState.productVisible = 0;
}

/**
 * Abertura automática (seção 7 do brief): o produto entra de uma câmera um pouco
 * mais perto e com um giro curto, e o nome sobe de dentro de uma máscara. Sem céu
 * e sem raio de sol (a v3 não tem). No fim, `window.__ready = true`.
 *
 * Só roda com a página no topo. Qualquer rolagem, toque ou tecla pula para o
 * fim (a pessoa manda). Com reduced motion, vai direto ao estado final.
 */
export function runOpening(line: HTMLElement | null): Promise<void> {
  return new Promise((resolve) => {
    const name = document.querySelector<HTMLElement>("[data-hero-name]");
    const finish = () => {
      opened = true;
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

    const camera = sceneState.camera;
    const target = { x: camera.x, y: camera.y, z: camera.z };
    const timeline = gsap.timeline({
      onComplete: () => {
        stopListening();
        finish();
      },
    });
    // O produto aparece e assenta: a câmera vem de 8% mais perto e o conjunto
    // faz um giro curto. A tabela de scroll volta a mandar no fim.
    timeline
      .fromTo(sceneState, { productVisible: 0 }, { productVisible: 1, duration: 1.1, ease: "power2.out" }, 0)
      .fromTo(
        camera,
        { x: target.x * 0.92, y: target.y * 0.95, z: target.z * 0.92 },
        { ...target, duration: OPENING_SECONDS, ease: "power3.out" },
        0,
      )
      .fromTo(sceneState.product, { ry: end.ry - 14 }, { ry: end.ry, duration: OPENING_SECONDS, ease: "power3.out" }, 0);
    if (name) timeline.fromTo(name, { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: "expo.out" }, 0.8);
    if (line) timeline.to(line, { autoAlpha: 0, duration: 0.6, ease: "power2.out" }, 0.3);

    events.forEach((type) => window.addEventListener(type, skip, { passive: true }));
  });
}
