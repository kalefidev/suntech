import { gsap, ScrollTrigger } from "./gsap";
import { testHooks, WIDE } from "./env";
import { getSections, onSectionsChange, type SectionBounds } from "./sections";
import { sceneState } from "../scene/state";
import { BEAT_REST, BEATS, TRACKS, type SectionId } from "../scene/choreography";
import { applyBg, applyTone } from "./tone";

/**
 * Trilho de scroll (seção 5 do brief): a coreografia de scene/choreography.ts é
 * compilada em segmentos (chave a chave, com a `ease` do trilho) e avaliada como uma
 * função pura de `scrollY`: o estado da cena em qualquer ponto depende só da posição,
 * nunca do caminho até ela. Rolar para cima desfaz a animação exatamente, e a página
 * pode pular (pitch, `?goto`, âncoras) sem dois gatilhos brigando pelo mesmo campo.
 * (Antes isto era uma timeline do GSAP renderizada à força: o `render(y, false, true)`
 * deixava trilhos presos no valor de um salto anterior; `scripts/dev/reverse.mjs`
 * mede.) A avaliação refaz-se a cada refresh, porque as posições das seções mudam com
 * a viewport. As peças leem o estado direto; só a câmera tem um `damp` curto.
 */

type Target = Record<string, number>;

const tracked = new Set<string>(TRACKS.flatMap((t) => Object.keys(t.keys)));

/** Um trilho compilado: o valor antes da primeira chave e os segmentos em ordem de início. */
interface Segment {
  y0: number;
  y1: number;
  v0: number;
  v1: number;
  ease: (t: number) => number;
}
interface Compiled {
  target: Target;
  key: string;
  start: number;
  segments: Segment[];
}

let compiled: Compiled[] = [];
let held = false;
let reduced = false;
let restBeat: string | null = null;
/** Deslocamento vertical de lente do repouso (reduced motion, layout empilhado). */
let restSy = 0;

/** Faixa de uma seção em px de scroll: o pin, ou do topo dela no topo da tela até a base no topo. */
function rangeOf(b: SectionBounds, max: number): [number, number] {
  const [a, z] = b.pinStart !== undefined && b.pinEnd !== undefined ? [b.pinStart, b.pinEnd] : [b.start, b.end];
  return [Math.max(0, Math.min(a, max)), Math.min(z, max)];
}

/** "camera.x" → [sceneState.camera, "x"]. */
function resolve(path: string): [Target, string] {
  const dot = path.indexOf(".");
  const state = sceneState as unknown as Record<string, unknown>;
  if (dot < 0) return [state as Target, path];
  return [state[path.slice(0, dot)] as Target, path.slice(dot + 1)];
}

function build(): void {
  const max = ScrollTrigger.maxScroll(window);
  // Layout empilhado (celular, tablet em pé): as chaves `narrow` substituem as
  // da seção. A avaliação é refeita a cada refresh, inclusive ao girar a tela.
  const narrow = !window.matchMedia(WIDE).matches;
  compiled = [];

  for (const track of TRACKS) {
    const points: Array<[number, number]> = [];
    // Na ordem da página, e nenhuma chave antes da anterior: a base de uma seção
    // pode passar 1 px do topo da seguinte (altura arredondada), e a chave do fim
    // dela, ordenada depois do início da próxima, virava uma rampa pela seção inteira.
    for (const b of getSections()) {
      const keys = (narrow ? track.narrow?.[b.id as SectionId] : undefined) ?? track.keys[b.id as SectionId];
      if (!keys) continue;
      const [a, z] = rangeOf(b, max);
      for (const [at, value] of [...keys].sort((p, q) => p[0] - q[0])) points.push([Math.max(a + (z - a) * at, points.at(-1)?.[0] ?? -Infinity), value]);
    }
    if (points.length === 0) continue;

    const [target, key] = resolve(track.path);
    const ease = gsap.parseEase(track.ease ?? "none");
    const segments: Segment[] = [];
    for (let i = 1; i < points.length; i++) {
      const [y0, v0] = points[i - 1];
      const [y1, v1] = points[i];
      // Degrau (ou chaves no mesmo ponto): o valor novo vale a partir de y1.
      segments.push(track.step || y1 <= y0 ? { y0: y1, y1, v0: v1, v1, ease } : { y0, y1, v0, v1, ease });
    }
    compiled.push({ target, key, start: points[0][1], segments });
  }
}

/** Valor do trilho em `y`: o do segmento mais recente que já começou (em empate, o último). */
function valueAt({ start, segments }: Compiled, y: number): number {
  let lo = 0;
  let hi = segments.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (segments[mid].y0 <= y) lo = mid + 1;
    else hi = mid;
  }
  const seg = segments[lo - 1];
  if (!seg) return start;
  if (y >= seg.y1) return seg.v1;
  return seg.v0 + (seg.v1 - seg.v0) * seg.ease((y - seg.y0) / (seg.y1 - seg.y0));
}

function afterWrite(): void {
  applyTone(sceneState.tone);
  applyBg(sceneState.bg);
}

/** Escreve no `sceneState` o valor de cada trilho em `y` (px de scroll). */
function seek(y: number): void {
  for (const track of compiled) track.target[track.key] = valueAt(track, y);
  afterWrite();
}

/**
 * Reduced motion: a cena do produto não tem pin; cada beat é um bloco de 100svh
 * (`[data-beat]`). Quando o bloco muda no meio da tela, o trilho salta para o
 * ponto do meio do beat. As outras seções saltam para o meio delas.
 */
function updateReduced(): void {
  const probe = window.scrollY + window.innerHeight * 0.5;
  const section = getSections().find((s) => tracked.has(s.id) && probe >= s.start && probe < s.end);
  if (!section) return;
  const max = ScrollTrigger.maxScroll(window);
  let key: string = section.id;
  let at = 0.5;
  if (section.id === "produto") {
    const block = [...document.querySelectorAll<HTMLElement>("[data-beat]")].find((el) => {
      const r = el.getBoundingClientRect();
      return r.top <= window.innerHeight * 0.5 && r.bottom > window.innerHeight * 0.5;
    });
    const beat = BEATS.find((b) => b.id === block?.dataset.beat);
    if (beat) {
      key = beat.id;
      at = BEAT_REST[beat.id];
    }
  }
  if (key !== restBeat) {
    restBeat = key;
    // Sem pin, o bloco de beats ocupa [start, end]: o ponto vale como fração dessa faixa.
    const [a, z] = rangeOf(section, max);
    seek(a + (z - a) * at);
    restSy = sceneState.camera.sy;
  }
  if (!window.matchMedia(WIDE).matches) sceneState.camera.sy = restSy;
}

function update(): void {
  if (held || compiled.length === 0) return;
  if (reduced) updateReduced();
  else seek(window.scrollY);
}

declare global {
  interface Window {
    /** Só em dev ou com `?snap`: o estado da cena, para testes. */
    __scene?: typeof sceneState;
  }
}

/** Liga o trilho. Devolve a limpeza. */
export function initTracks(options: { reducedMotion: boolean }): () => void {
  if (testHooks) window.__scene = sceneState;
  reduced = options.reducedMotion;
  restBeat = null;
  const off = onSectionsChange(() => {
    build();
    restBeat = null;
    update();
  });
  const trigger = ScrollTrigger.create({ start: 0, end: "max", onUpdate: update });
  build();
  // Prepara a cena para o ponto atual mesmo com o trilho segurado: a câmera e
  // o produto já nascem na pose certa, e a abertura parte daí.
  seek(window.scrollY);
  update();
  return () => {
    off();
    trigger.kill();
    compiled = [];
  };
}

/** A abertura segura o trilho enquanto anima; ao soltar, a cena volta ao scroll. */
export function holdTracks(hold: boolean): void {
  held = hold;
  if (!hold) update();
}
