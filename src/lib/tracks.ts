import { gsap, ScrollTrigger } from "./gsap";
import { getSections, onSectionsChange, type SectionBounds } from "./sections";
import { sceneState } from "../scene/state";
import { REST_AT, TRACKS, type SectionId } from "../scene/choreography";
import { applyTone, cssSky } from "../scene/daylight";

/**
 * Trilho de scroll (seção 5 do brief): a coreografia de scene/choreography.ts
 * vira uma timeline mestre do GSAP em que o tempo é o pixel de scroll, e um
 * único ScrollTrigger a percorre (scrub direto: tempo = `scrollY`). Como é uma
 * timeline só, a página pode pular para qualquer ponto (pitch, `?goto`,
 * âncoras) sem dois gatilhos brigando pelo mesmo campo. A timeline é refeita a
 * cada refresh, porque as posições das seções mudam com a viewport. O
 * `useFrame` da cena aplica os valores com damping.
 */

type Target = Record<string, number>;

const tracked = new Set<string>(TRACKS.flatMap((t) => Object.keys(t.keys)));

let master: gsap.core.Timeline | null = null;
let held = false;
let reduced = false;
let cssSkyActive = false;
let restSection: string | null = null;

/** Faixa de uma seção em px de scroll: o pin, ou do topo dela no topo da tela até a base no topo. */
function rangeOf(b: SectionBounds, max: number): [number, number] {
  const [a, z] = b.pinStart !== undefined && b.pinEnd !== undefined ? [b.pinStart, b.pinEnd] : [b.start, b.end];
  return [Math.min(a, max), Math.min(z, max)];
}

/** "camera.x" → [sceneState.camera, "x"]. */
function resolve(path: string): [Target, string] {
  const dot = path.indexOf(".");
  const state = sceneState as unknown as Record<string, unknown>;
  if (dot < 0) return [state as Target, path];
  return [state[path.slice(0, dot)] as Target, path.slice(dot + 1)];
}

function build(): void {
  master?.kill();
  const max = ScrollTrigger.maxScroll(window);
  const byId = new Map(getSections().map((b) => [b.id, b]));
  const timeline = gsap.timeline({ paused: true, defaults: { ease: "none", immediateRender: false } });

  for (const track of TRACKS) {
    const points: Array<[number, number]> = [];
    for (const [id, keys] of Object.entries(track.keys)) {
      const b = byId.get(id);
      if (!b || !keys) continue;
      const [a, z] = rangeOf(b, max);
      for (const [at, value] of keys) points.push([a + (z - a) * at, value]);
    }
    if (points.length === 0) continue;
    // Ordenação estável: em empate, vale a ordem da página.
    points.sort((p, q) => p[0] - q[0]);

    const [target, key] = resolve(track.path);
    timeline.set(target, { [key]: points[0][1] }, 0);
    for (let i = 1; i < points.length; i++) {
      const [y0, v0] = points[i - 1];
      const [y1, v1] = points[i];
      if (track.step || y1 <= y0) timeline.set(target, { [key]: v1 }, y1);
      else timeline.fromTo(target, { [key]: v0 }, { [key]: v1, duration: y1 - y0 }, y0);
    }
  }

  master = timeline;
}

function afterWrite(): void {
  applyTone(sceneState.tone);
  if (cssSkyActive) {
    const sky = cssSky(sceneState.dayTime, sceneState.cloudCover);
    const root = document.documentElement.style;
    root.setProperty("--sky-zenith", sky.zenith);
    root.setProperty("--sky-horizon", sky.horizon);
  }
}

/** Leva a timeline até `y` (px), renderizando mesmo sem mudança de tempo. */
function seek(y: number): void {
  master?.render(y, false, true);
  afterWrite();
}

/**
 * Reduced motion: quando muda a seção no meio da tela, a timeline salta para o
 * ponto de repouso dela. O céu chega lá com um crossfade curto (scene/Sky.tsx),
 * e o produto pula sem animar.
 */
function updateReduced(): void {
  const probe = window.scrollY + window.innerHeight * 0.5;
  const section = getSections().find((s) => tracked.has(s.id) && probe >= s.start && probe < s.end);
  if (!section || section.id === restSection) return;
  restSection = section.id;
  const [a, z] = rangeOf(section, ScrollTrigger.maxScroll(window));
  seek(a + (z - a) * (REST_AT[section.id as SectionId] ?? 0.5));
}

function update(): void {
  if (held || !master) return;
  if (reduced) updateReduced();
  else seek(window.scrollY);
}

/** Liga o trilho. Devolve a limpeza. */
export function initTracks(options: { reducedMotion: boolean }): () => void {
  reduced = options.reducedMotion;
  restSection = null;
  const off = onSectionsChange(() => {
    build();
    restSection = null;
    update();
  });
  const trigger = ScrollTrigger.create({ start: 0, end: "max", onUpdate: update });
  build();
  update();
  return () => {
    off();
    trigger.kill();
    master?.kill();
    master = null;
  };
}

/** A abertura segura o trilho enquanto anima; ao soltar, a cena volta ao scroll. */
export function holdTracks(hold: boolean): void {
  held = hold;
  if (!hold) update();
}

/** Fallback sem WebGL: o gradiente em CSS passa a seguir a hora. */
export function setCssSky(active: boolean): void {
  cssSkyActive = active;
  update();
}
