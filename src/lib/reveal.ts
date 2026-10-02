import { useGSAP } from "@gsap/react";
import type { RefObject } from "react";
import { gsap, ScrollTrigger } from "./gsap";
import { loadTextPlugins, REVEAL_EASE } from "./split";
import { num } from "../content/format";

/**
 * Revelações da página (seção 6 do brief e docs/fase-0.md, item 9): só os
 * numerais, os títulos, os contadores, as linhas desenhadas e o manifesto se
 * revelam; os parágrafos só rolam. SplitText e DrawSVG carregam sob demanda,
 * e o texto é dividido depois das fontes. Com reduced motion, nada se mexe: o
 * texto já está no lugar (o `gsap.matchMedia` reage se a preferência mudar).
 */

const MOTION = "(prefers-reduced-motion: no-preference)";

/** Onde a revelação dispara: um pouco antes de o elemento chegar ao meio da tela. */
const ENTER = "top 86%";

/**
 * As linhas de um título sobem de dentro da máscara quando ele entra na tela,
 * uma vez (SplitText por linha, com `autoSplit` no resize). O leitor de tela lê
 * o texto inteiro (`aria: "auto"`).
 */
export function useLineReveal(
  ref: RefObject<HTMLElement | null>,
  options: {
    stagger?: number;
    /**
     * "auto": o SplitText põe o texto no `aria-label` e esconde as linhas
     * (bom para títulos sem rótulo próprio). "hidden": esconde o elemento
     * INTEIRO do leitor de tela (só serve com o texto repetido em outro lugar).
     * "none": não mexe em nada (títulos com `aria-label` próprio e citações).
     */
    aria?: "auto" | "hidden" | "none";
  } = {},
) {
  useGSAP(
    (context) => {
      const el = ref.current;
      if (!el) return;
      let alive = true;
      let revealed = false;
      Promise.all([loadTextPlugins(), document.fonts.ready]).then(([{ SplitText }]) => {
        if (!alive) return;
        context.add(() => {
          gsap.matchMedia().add(MOTION, () => {
            SplitText.create(el, {
              type: "lines",
              mask: "lines",
              autoSplit: true,
              aria: options.aria ?? "auto",
              onSplit: (self) => {
                // Ao refazer as linhas (resize), um título já revelado fica parado.
                if (revealed) return;
                return gsap.from(self.lines, {
                  yPercent: 105,
                  duration: 0.95,
                  ease: REVEAL_EASE,
                  stagger: options.stagger ?? 0.09,
                  scrollTrigger: { trigger: el, start: ENTER, once: true },
                  onComplete: () => {
                    revealed = true;
                  },
                });
              },
            });
          });
        });
      });
      return () => {
        alive = false;
      };
    },
    { scope: ref },
  );
}

/**
 * Um elemento sai de `from` e chega ao estado normal junto com o scroll, com
 * ease linear no scrub (seção 6 do brief): o numeral de capítulo subindo da
 * máscara, uma linha reta crescendo.
 */
export function useScrubFrom(
  ref: RefObject<HTMLElement | null>,
  selector: string,
  from: gsap.TweenVars,
  range: { start: string; end: string } = { start: "top 94%", end: "top 52%" },
) {
  useGSAP(
    () => {
      if (!ref.current) return;
      gsap.matchMedia().add(MOTION, () => {
        gsap.from(selector, {
          ...from,
          ease: "none",
          scrollTrigger: { trigger: ref.current, start: range.start, end: range.end, scrub: true },
        });
      });
    },
    { scope: ref },
  );
}

/**
 * Contador: o número conta até o valor final quando entra na tela (seção 7
 * do brief). O valor final fica sempre no DOM (o leitor de tela lê ele), e a
 * contagem corre por cima, sem mudar a largura da frase.
 */
export function useCountUp(ref: RefObject<HTMLElement | null>, value: number) {
  useGSAP(
    () => {
      const el = ref.current;
      const live = el?.querySelector<HTMLElement>("[data-count-live]");
      if (!el || !live) return;
      gsap.matchMedia().add(MOTION, () => {
        const counter = { value: 0 };
        const show = () => (live.textContent = num(Math.round(counter.value)));
        const tween = gsap.to(counter, {
          value,
          duration: 1.6,
          ease: "power3.out",
          paused: true,
          onUpdate: show,
          onComplete: () => el.removeAttribute("data-counting"),
        });
        el.setAttribute("data-counting", "");
        show();
        // Conta assim que o número aparece na tela: com o gatilho mais abaixo
        // (ENTER), o dado ficava lendo "0" na borda de baixo até disparar.
        ScrollTrigger.create({ trigger: el, start: "top bottom", once: true, onEnter: () => tween.play() });
        return () => el.removeAttribute("data-counting");
      });
    },
    { scope: ref },
  );
}

/** Uma linha em SVG se desenha junto com o scroll (DrawSVG), do começo ao fim. */
export function useDrawOnScroll(ref: RefObject<HTMLElement | null>, selector: string) {
  useGSAP(
    (context) => {
      if (!ref.current) return;
      let alive = true;
      loadTextPlugins().then(() => {
        if (!alive) return;
        context.add(() => {
          gsap.matchMedia().add(MOTION, () => {
            gsap.fromTo(
              selector,
              { drawSVG: "0%" },
              {
                drawSVG: "100%",
                ease: "none",
                scrollTrigger: { trigger: ref.current, start: "top 88%", end: "top 48%", scrub: true },
              },
            );
          });
        });
      });
      return () => {
        alive = false;
      };
    },
    { scope: ref },
  );
}
