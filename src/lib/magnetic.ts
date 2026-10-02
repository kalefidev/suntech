import { useGSAP } from "@gsap/react";
import type { RefObject } from "react";
import { gsap } from "./gsap";

/** Distância (px) além da borda em que o botão já sente o ponteiro, e o desvio máximo. */
const REACH = 90;
const MAX = 12;

/**
 * Botão magnético (DESIGN.md, Buttons): perto do ponteiro, o botão vem um
 * pouco na direção dele e volta ao lugar quando o ponteiro se afasta. Só com
 * `pointer: fine` e sem reduced motion. Mexe em `x` e `y` (o `:active` usa a
 * propriedade `scale`, que não briga com eles).
 */
export function useMagnetic(ref: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
        const x = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" });
        const y = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });
        const clamp = gsap.utils.clamp(-MAX, MAX);
        const move = (event: PointerEvent) => {
          const box = el.getBoundingClientRect();
          // O centro sem o desvio atual, para o botão não correr atrás de si.
          const cx = box.left + box.width / 2 - Number(gsap.getProperty(el, "x"));
          const cy = box.top + box.height / 2 - Number(gsap.getProperty(el, "y"));
          const dx = event.clientX - cx;
          const dy = event.clientY - cy;
          const near = Math.abs(dx) < box.width / 2 + REACH && Math.abs(dy) < box.height / 2 + REACH;
          x(near ? clamp(dx * 0.18) : 0);
          y(near ? clamp(dy * 0.3) : 0);
        };
        window.addEventListener("pointermove", move, { passive: true });
        return () => {
          window.removeEventListener("pointermove", move);
          gsap.set(el, { x: 0, y: 0 });
        };
      });
      return () => mm.revert();
    },
    { scope: ref },
  );
}
