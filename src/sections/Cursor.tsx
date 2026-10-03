import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "../lib/gsap";

const CLICKABLE = "a, button, [role='button'], summary, label";

/**
 * Cursor (seção 9 do brief): um círculo pequeno que segue o ponteiro e cresce
 * sobre o que é clicável. Só com `pointer: fine` e sem reduced motion. A seta
 * do sistema continua (respeita o tamanho de cursor que a pessoa configurou);
 * o círculo é um acompanhante, no tom do texto (`--fg`).
 */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add("(pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      // Acompanha a seta de perto (um anel que fica para trás parece lento).
      const x = gsap.quickTo(el, "x", { duration: 0.2, ease: "power3.out" });
      const y = gsap.quickTo(el, "y", { duration: 0.2, ease: "power3.out" });
      const move = (event: PointerEvent) => {
        if (event.pointerType !== "mouse") return;
        x(event.clientX);
        y(event.clientY);
        el.dataset.visible = "1";
        el.dataset.hot = (event.target as Element | null)?.closest?.(CLICKABLE) ? "1" : "0";
      };
      const leave = () => {
        el.dataset.visible = "0";
      };
      window.addEventListener("pointermove", move, { passive: true });
      document.documentElement.addEventListener("pointerleave", leave);
      return () => {
        window.removeEventListener("pointermove", move);
        document.documentElement.removeEventListener("pointerleave", leave);
        el.dataset.visible = "0";
      };
    });
    return () => mm.revert();
  });

  return <div ref={ref} className="cursor" aria-hidden="true" data-visible="0" data-hot="0" />;
}
