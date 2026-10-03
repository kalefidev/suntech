import { gsap } from "./gsap";
import { getSections } from "./sections";
import { scrollToY } from "./lenis";
import { REDUCED_MOTION, testHooks } from "./env";
import { PITCH_SECONDS, pitchStops, type PitchStop } from "../content/feira";

/**
 * Modo pitch (seção 7 do brief e docs/fase-0.md, item 5): um tour de
 * exatamente 180 s pelos momentos do pitch, em sincronia com a linha do tempo
 * da Parte 5. O relógio é uma timeline do GSAP: cada parada rola até o alvo e,
 * nas cenas presas, percorre o trecho do pin em ritmo constante (a explosão e
 * as 4 etapas acontecem enquanto a equipe fala). Espaço pausa e retoma, Esc
 * sai (o foco volta ao botão que abriu), e rolar à mão pausa. Com reduced
 * motion, a página pula de parada em parada nos mesmos tempos. O Wake Lock
 * mantém a tela acesa. Não importa `three`.
 */

export interface PitchState {
  running: boolean;
  paused: boolean;
  /** Segundos inteiros decorridos (o HUD mostra m:ss). */
  second: number;
  stop: PitchStop | null;
}

const IDLE: PitchState = { running: false, paused: false, second: 0, stop: null };
let state: PitchState = IDLE;
const listeners = new Set<() => void>();

function set(patch: Partial<PitchState>): void {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

/** Store para o `useSyncExternalStore` do HUD (muda por segundo, não por quadro). */
export const pitchStore = {
  get: (): PitchState => state,
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

/** A barra de progresso do HUD: o relógio escreve o `transform` direto nela. */
export const pitchProgress: { element: HTMLElement | null } = { element: null };

/** Segundos de rolagem até cada parada. */
const ARRIVE = 1.4;
/**
 * Acima desta distância (em telas), a parada chega num corte, como um slide:
 * rolar 5 telas em 1,4 s vira um borrão de texto e passa cenas inteiras em
 * time-lapse (a noite de "A energia fica"). Com o corte, o céu faz o
 * crossfade dele e o produto assenta pelo damping.
 */
const MAX_GLIDE = 2;
const NAV_KEYS = new Set(["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End"]);

let clock: gsap.core.Timeline | null = null;
let opener: HTMLElement | null = null;
let wakeLock: WakeLockSentinel | null = null;

/** Onde rolar numa parada: na cena presa, a fração do pin; senão, o alvo perto do topo. */
function targetY(stop: PitchStop, fraction = stop.from ?? 0): number {
  const section = getSections().find((s) => s.id === stop.target);
  if (section?.pinStart !== undefined && section.pinEnd !== undefined && stop.from !== undefined) {
    return section.pinStart + (section.pinEnd - section.pinStart) * fraction;
  }
  if (section) return section.start;
  const element = document.getElementById(stop.target);
  if (!element) return window.scrollY;
  return window.scrollY + element.getBoundingClientRect().top - window.innerHeight * 0.14;
}

function arrive(stop: PitchStop, reduced: boolean): void {
  set({ stop });
  const y = targetY(stop);
  const far = Math.abs(y - window.scrollY) > window.innerHeight * MAX_GLIDE;
  scrollToY(y, reduced || far ? { immediate: true } : { duration: ARRIVE });
}

function tick(): void {
  if (!clock) return;
  const time = clock.time();
  const second = Math.min(PITCH_SECONDS, Math.floor(time));
  if (second !== state.second) set({ second });
  const bar = pitchProgress.element;
  if (bar) bar.style.transform = `scaleX(${(time / PITCH_SECONDS).toFixed(4)})`;
}

async function requestWakeLock(): Promise<void> {
  try {
    wakeLock = (await navigator.wakeLock?.request("screen")) ?? null;
  } catch {
    wakeLock = null;
  }
}

function releaseWakeLock(): void {
  wakeLock?.release().catch(() => undefined);
  wakeLock = null;
}

function onVisibility(): void {
  // O navegador solta o Wake Lock quando a aba some; pede de novo na volta.
  if (state.running && document.visibilityState === "visible") void requestWakeLock();
}

/** Rolar à mão pausa (a rolagem do próprio pitch não dispara esses eventos). */
function onManualScroll(): void {
  if (state.running && !state.paused) pausePitch();
}

function onKey(event: KeyboardEvent): void {
  if (!state.running) return;
  if (event.key === "Escape") {
    event.preventDefault();
    stopPitch();
  } else if (event.key === " ") {
    // Num botão, o Espaço é o clique dele (Pausar e Sair já fazem a ação).
    if ((event.target as HTMLElement | null)?.closest("button, a, input, select, textarea")) return;
    event.preventDefault();
    togglePitch();
  } else if (NAV_KEYS.has(event.key)) {
    onManualScroll();
  }
}

function listen(on: boolean): void {
  if (on) {
    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", onManualScroll, { passive: true });
    window.addEventListener("touchmove", onManualScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
  } else {
    window.removeEventListener("keydown", onKey);
    window.removeEventListener("wheel", onManualScroll);
    window.removeEventListener("touchmove", onManualScroll);
    document.removeEventListener("visibilitychange", onVisibility);
  }
}

/** Começa o tour. `trigger` recebe o foco de volta quando o pitch acaba. */
export function startPitch(trigger?: HTMLElement | null): void {
  if (state.running) return;
  opener = trigger ?? null;
  const reduced = window.matchMedia(REDUCED_MOTION).matches;
  const timeline = gsap.timeline({ onUpdate: tick, onComplete: () => stopPitch() });
  pitchStops.forEach((stop, i) => {
    timeline.call(arrive, [stop, reduced], stop.at);
    const { from, to } = stop;
    if (reduced || from === undefined || to === undefined) return;
    // Na cena presa, percorre o trecho do pin até a próxima parada.
    const end = pitchStops[i + 1]?.at ?? PITCH_SECONDS;
    const travel = { t: 0 };
    timeline.to(
      travel,
      {
        t: 1,
        duration: end - stop.at - ARRIVE,
        ease: "none",
        onUpdate: () => scrollToY(targetY(stop, from + (to - from) * travel.t), { immediate: true }),
      },
      stop.at + ARRIVE,
    );
  });
  // Exatamente 180 s, mesmo que a última parada termine antes, e em tempo
  // real: o relógio não segue a aceleração de teste da timeline global
  // (`?snap` e `?slowmo`, em lib/gsap.ts).
  timeline.set({}, {}, PITCH_SECONDS);
  timeline.timeScale(1 / gsap.globalTimeline.timeScale());
  clock = timeline;
  set({ running: true, paused: false, second: 0, stop: null });
  listen(true);
  void requestWakeLock();
}

export function pausePitch(): void {
  if (!state.running || state.paused) return;
  clock?.pause();
  set({ paused: true });
}

export function togglePitch(): void {
  if (!state.running) return;
  if (!state.paused) return pausePitch();
  clock?.play();
  set({ paused: false });
}

/** Sai do pitch (Esc, "Sair" ou fim dos 180 s) e devolve o foco ao botão. */
export function stopPitch(): void {
  if (!state.running) return;
  clock?.kill();
  clock = null;
  listen(false);
  releaseWakeLock();
  set(IDLE);
  opener?.focus({ preventScroll: true });
  opener = null;
}

declare global {
  interface Window {
    /** Só em dev ou com `?snap`: o estado do pitch, para o teste do relógio. */
    __pitch?: typeof pitchStore;
  }
}

if (testHooks && typeof window !== "undefined") window.__pitch = pitchStore;
