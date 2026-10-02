import { gsap, ScrollTrigger } from "./gsap";
import { hasFinePointer } from "./env";
import { sceneState } from "../scene/state";

/**
 * Ponteiro normalizado (−1 a 1) no `sceneState`, escrito com `gsap.quickTo`
 * (seção 7 do brief: "o ponteiro inclina o produto com damping"). No toque,
 * a velocidade do scroll faz esse papel e volta a zero quando o scroll para
 * (seção 10). Não roda com reduced motion. Devolve a limpeza.
 */
export function startPointer(): () => void {
  const toX = gsap.quickTo(sceneState.pointer, "x", { duration: 0.8, ease: "power3.out" });
  const toY = gsap.quickTo(sceneState.pointer, "y", { duration: 0.8, ease: "power3.out" });

  if (hasFinePointer()) {
    const onMove = (event: PointerEvent) => {
      toX((event.clientX / window.innerWidth) * 2 - 1);
      toY((event.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }

  const settle = gsap.delayedCall(0.18, () => toY(0)).pause();
  const trigger = ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: (self) => {
      toY(gsap.utils.clamp(-1, 1, self.getVelocity() / 2400));
      settle.restart(true);
    },
  });
  return () => {
    trigger.kill();
    settle.kill();
  };
}
