import { useEffect, useRef, useState } from "react";
import { gsap } from "../lib/gsap";
import { getLenis } from "../lib/lenis";
import { markReady } from "../lib/acts";
import { company } from "../content/company";

const MIN_VISIBLE_MS = 600;

/**
 * Ato 0 — abertura. Nesta fase (fundação) é só o loader com progresso real:
 * a coreografia 3D (painel abrindo, raio de sol) entra na Fase 2, junto do
 * produto procedural. Aqui o que importa é o contrato: nunca progresso falso,
 * mínimo de 600ms na tela, e `window.__ready = true` no fim (seção 7 do brief).
 */
export function Opening() {
  const barRef = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const lenis = getLenis();
    lenis?.stop();

    const start = performance.now();
    gsap.to(barRef.current, { scaleX: 0.5, duration: 0.4, ease: "power1.out" });

    Promise.all([
      document.fonts?.ready ?? Promise.resolve(),
      new Promise((resolve) => {
        const elapsed = performance.now() - start;
        setTimeout(resolve, Math.max(0, MIN_VISIBLE_MS - elapsed));
      }),
    ]).then(() => {
      gsap.to(barRef.current, {
        scaleX: 1,
        duration: 0.3,
        ease: "power2.out",
        onComplete: () => {
          gsap.to(`[data-opening-overlay]`, {
            opacity: 0,
            duration: 0.5,
            delay: 0.15,
            onComplete: () => {
              setHidden(true);
              lenis?.start();
              markReady();
            },
          });
        },
      });
    });
  }, []);

  if (hidden) return null;

  return (
    <div
      data-opening-overlay
      className="fixed inset-0 z-50 flex items-center justify-center bg-noite"
      aria-hidden="true"
    >
      <div className="flex flex-col items-center gap-6">
        <p className="text-nuvem/70 text-sm tracking-normal">{company.name}</p>
        <div className="h-px w-40 overflow-hidden bg-nuvem/20">
          <div
            ref={barRef}
            className="h-full w-full origin-left scale-x-0 bg-sol"
          />
        </div>
      </div>
    </div>
  );
}
