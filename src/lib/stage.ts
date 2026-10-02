import { useGSAP } from "@gsap/react";
import type { RefObject } from "react";
import { gsap } from "./gsap";
import { WIDE } from "./env";

export interface StageOptions {
  /** Comprimento do pin em vh: desktop e celular (~30% menor, seção 7 do brief). */
  length: { wide: number; narrow: number };
  /**
   * Monta a timeline da cena. A timeline vai de 0 a 1 (a posição é a fração do
   * pin), com scrub e ease linear; o damping fica no `useFrame`.
   */
  build?: (timeline: gsap.core.Timeline, stage: HTMLElement) => void;
}

/**
 * Cena presa (só as cenas 3D ficam presas, seção 6 do brief). Com reduced
 * motion não há pin: a seção vira um bloco normal no estado final.
 */
export function usePinnedStage(ref: RefObject<HTMLElement | null>, { length, build }: StageOptions): void {
  useGSAP(
    () => {
      const stage = ref.current;
      if (!stage) return;
      const mm = gsap.matchMedia();
      mm.add({ motion: "(prefers-reduced-motion: no-preference)", wide: WIDE }, (context) => {
        const { motion, wide } = context.conditions as { motion: boolean; wide: boolean };
        if (!motion) return;
        const vh = wide ? length.wide : length.narrow;
        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: stage,
            start: "top top",
            end: () => `+=${(window.innerHeight * vh) / 100}`,
            pin: true,
            scrub: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
        build?.(timeline, stage);
        // Garante a duração 1: as posições da timeline são frações do pin.
        timeline.set({}, {}, 1);
      });
      return () => mm.revert();
    },
    { scope: ref },
  );
}
