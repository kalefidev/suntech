import { ScrollTrigger } from "./gsap";
import { flags, testHooks } from "./env";
import { scrollToY } from "./lenis";

/**
 * Registro de seções (seção 5 do brief). Cada parte e cada cena têm
 * `data-section`. As posições são recalculadas a cada refresh do ScrollTrigger.
 *
 * `start`/`end`: do topo da seção no topo da tela até a base dela no topo da
 * tela (as faixas se encostam, sem buraco). Em seção presa, `pinStart`/`pinEnd`
 * são o trecho do pin. Lição da v1: o marcador `data-section` nunca vive num
 * componente que desmonta.
 */
export interface SectionBounds {
  id: string;
  start: number;
  end: number;
  pinStart?: number;
  pinEnd?: number;
}

declare global {
  interface Window {
    __ready?: boolean;
    __sections?: SectionBounds[];
  }
}

let bounds: SectionBounds[] = [];
const listeners = new Set<() => void>();

function measure(): SectionBounds[] {
  const pins = ScrollTrigger.getAll().filter((st) => st.pin);
  return [...document.querySelectorAll<HTMLElement>("[data-section]")].map((el) => {
    const spacer = el.parentElement?.classList.contains("pin-spacer") ? el.parentElement : null;
    const box = spacer ?? el;
    const start = Math.round(box.getBoundingClientRect().top + window.scrollY);
    const end = start + box.offsetHeight;
    const pin = pins.find((st) => st.pin === el);
    return {
      id: el.dataset.section ?? "",
      start,
      end,
      ...(pin ? { pinStart: pin.start, pinEnd: pin.end } : {}),
    };
  });
}

function refresh(): void {
  bounds = measure();
  if (testHooks) window.__sections = bounds;
  listeners.forEach((listener) => listener());
}

/** Chamar uma vez, depois que as seções e os pins existem. */
export function registerSections(): () => void {
  ScrollTrigger.addEventListener("refresh", refresh);
  refresh();
  return () => ScrollTrigger.removeEventListener("refresh", refresh);
}

export function getSections(): readonly SectionBounds[] {
  return bounds;
}

export function onSectionsChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Posição (px) para mostrar uma seção ou um alvo dentro dela.
 * `pinProgress` (0 a 1) posiciona dentro de uma cena presa.
 */
export function positionOf(target: string, pinProgress?: number): number | null {
  const b = bounds.find((s) => s.id === target);
  if (b) {
    if (b.pinStart !== undefined && b.pinEnd !== undefined) {
      return b.pinStart + (b.pinEnd - b.pinStart) * (pinProgress ?? 0);
    }
    return b.start;
  }
  const el = document.getElementById(target);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  const top = rect.top + window.scrollY;
  // Alvos internos (pitch): centralizados na tela quando cabem.
  const slack = Math.max(0, (window.innerHeight - rect.height) / 2);
  return Math.max(0, top - Math.min(slack, window.innerHeight * 0.3));
}

export function scrollToSection(target: string, options: { immediate?: boolean; duration?: number } = {}): boolean {
  const y = positionOf(target);
  if (y === null) return false;
  scrollToY(y, options);
  return true;
}

/** Fim da abertura: `window.__ready = true` e, se houver, o `?goto=`. */
export function markReady(): void {
  ScrollTrigger.refresh();
  if (flags.goto) scrollToSection(flags.goto, { immediate: true });
  if (testHooks) window.__ready = true;
}
