import { ScrollTrigger } from "./gsap";
import { getLenis } from "./lenis";
import { getActParam } from "./env";

export interface ActBounds {
  start: number;
  end: number;
}

declare global {
  interface Window {
    __ready?: boolean;
    __acts?: Record<string, ActBounds>;
  }
}

/**
 * Lê a posição (em px) de cada `[data-act]` da página: usa o ScrollTrigger
 * da própria seção quando ela tem um (pin/scrub), ou a posição no documento
 * quando não tem. Reexpõe em `window.__acts` a cada refresh do ScrollTrigger
 * (ver seção 5 do brief — usado pelo script `snap` e por `?act=`).
 */
function computeActs(): Record<string, ActBounds> {
  const acts: Record<string, ActBounds> = {};
  document.querySelectorAll<HTMLElement>("[data-act]").forEach((el) => {
    const id = el.dataset.act;
    if (!id) return;
    const trigger = ScrollTrigger.getAll().find((st) => st.trigger === el);
    if (trigger) {
      acts[id] = { start: trigger.start, end: trigger.end };
    } else if (getComputedStyle(el).position === "fixed") {
      // Um marcador `position: fixed` (o overlay do Ato 0) não tem posição
      // no documento — `getBoundingClientRect` daria um valor que muda com o
      // scroll atual, não com o ato. Trata como o topo da página.
      acts[id] = { start: 0, end: 0 };
    } else {
      const top = el.getBoundingClientRect().top + window.scrollY;
      acts[id] = { start: top, end: top + el.offsetHeight };
    }
  });
  return acts;
}

function jumpToActFromQuery(): void {
  const id = getActParam();
  if (!id) return;
  const bounds = window.__acts?.[id];
  if (!bounds) return;
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(bounds.start, { immediate: true });
  } else {
    window.scrollTo(0, bounds.start);
  }
}

/** Chamar uma vez, depois que as seções e seus ScrollTriggers existem. */
export function registerActs(): void {
  const refresh = () => {
    window.__acts = computeActs();
  };
  ScrollTrigger.addEventListener("refresh", refresh);
  refresh();
}

/** Chamar quando `window.__ready` vira `true` (fim do Ato 0). */
export function markReady(): void {
  window.__ready = true;
  // `?act=` só faz sentido depois que o layout final existe.
  requestAnimationFrame(() => {
    ScrollTrigger.refresh();
    jumpToActFromQuery();
  });
}
