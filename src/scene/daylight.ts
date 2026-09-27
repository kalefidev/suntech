/**
 * Fonte única de toda cor derivada de `dayTime` (céu, sol, estrelas e texto).
 * Nenhum outro lugar do código decide essas cores — ver seção 5 do brief.
 *
 * `dayTime` é 0–1, "um dia contado pela página" (ver PROGRESS.md / plano da
 * Fase 0), não hora real. Os waypoints abaixo seguem o mapa de scroll:
 * 0,00 madrugada · 0,08 primeiro raio · 0,20 manhã · 0,45 meio-dia ·
 * 0,62 tarde · 0,75 entardecer · 0,90 anoitecendo · 1,00 noite plena.
 */

export type RGB = [number, number, number];

interface SkyKeyframe {
  t: number;
  zenith: RGB;
  horizon: RGB;
  sun: RGB;
  sunIntensity: number;
  starIntensity: number;
}

function hex(h: string): RGB {
  const n = parseInt(h.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

// Paleta (seção 6 do brief) — só usada aqui.
const NOITE = "#14213D";
const CEU = "#CFE8F3";
const SOL = "#FFB22C";
const BRASA = "#E8773A";

const KEYFRAMES: SkyKeyframe[] = [
  { t: 0.0, zenith: hex(NOITE), horizon: hex("#1b2b52"), sun: hex(NOITE), sunIntensity: 0.05, starIntensity: 1 },
  { t: 0.08, zenith: hex("#223258"), horizon: hex(BRASA), sun: hex(SOL), sunIntensity: 0.45, starIntensity: 0.3 },
  { t: 0.2, zenith: hex("#5b86ab"), horizon: hex(CEU), sun: hex(SOL), sunIntensity: 0.75, starIntensity: 0 },
  { t: 0.45, zenith: hex("#8fc3e0"), horizon: hex(CEU), sun: hex("#ffffff"), sunIntensity: 1.0, starIntensity: 0 },
  { t: 0.62, zenith: hex("#8fc3e0"), horizon: hex("#f0d9b0"), sun: hex(SOL), sunIntensity: 0.9, starIntensity: 0 },
  { t: 0.75, zenith: hex("#4a4f7a"), horizon: hex(BRASA), sun: hex(SOL), sunIntensity: 0.55, starIntensity: 0.15 },
  { t: 0.9, zenith: hex("#1c2748"), horizon: hex("#3a2d55"), sun: hex(NOITE), sunIntensity: 0.1, starIntensity: 0.85 },
  { t: 1.0, zenith: hex(NOITE), horizon: hex(NOITE), sun: hex(NOITE), sunIntensity: 0.02, starIntensity: 1 },
];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpRgb(a: RGB, b: RGB, t: number): RGB {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

export interface SkyUniforms {
  zenith: RGB;
  horizon: RGB;
  sun: RGB;
  sunIntensity: number;
  starIntensity: number;
}

/** Interpola os keyframes acima para um `dayTime` qualquer em [0, 1]. */
export function getSky(dayTime: number): SkyUniforms {
  const t = Math.min(1, Math.max(0, dayTime));
  let i = 0;
  while (i < KEYFRAMES.length - 2 && KEYFRAMES[i + 1].t < t) i++;
  const a = KEYFRAMES[i];
  const b = KEYFRAMES[i + 1];
  const span = b.t - a.t || 1;
  const localT = (t - a.t) / span;
  return {
    zenith: lerpRgb(a.zenith, b.zenith, localT),
    horizon: lerpRgb(a.horizon, b.horizon, localT),
    sun: lerpRgb(a.sun, b.sun, localT),
    sunIntensity: lerp(a.sunIntensity, b.sunIntensity, localT),
    starIntensity: lerp(a.starIntensity, b.starIntensity, localT),
  };
}

/**
 * Posição do sol em coordenadas de tela (0–1). Arco simples: nasce à
 * esquerda, culmina ao meio-dia (dayTime 0,45) e se põe à direita. Suficiente
 * para a Fase 1 (fundação); a luz direcional 3D (Fase 2) deriva do mesmo t.
 */
export function getSunScreenPosition(dayTime: number): { x: number; y: number } {
  const t = Math.min(1, Math.max(0, dayTime));
  const x = 0.1 + t * 0.8;
  const y = Math.max(0, Math.sin(Math.PI * t)) * 0.72 + 0.04;
  return { x, y };
}

/**
 * Regra de contraste (Fase 0, item 1.4): `Nuvem` sobre `Brasa` reprova AA
 * (2,74:1). Texto claro só é seguro nas pontas da madrugada/noite, onde o
 * zênite ainda é a cor `Noite`; em todo o resto — incluindo amanhecer e
 * entardecer — o texto tem que ser escuro (`Noite`).
 */
const NIGHT_ZENITH_START = 0.06;
const NIGHT_ZENITH_END = 0.88;

export function isNightZenith(dayTime: number): boolean {
  return dayTime <= NIGHT_ZENITH_START || dayTime >= NIGHT_ZENITH_END;
}

export function getTextColor(dayTime: number): string {
  return isNightZenith(dayTime) ? "var(--color-nuvem)" : "var(--color-noite)";
}

/** Aplica `--fg` no `documentElement`. Chamado pelo ticker do GSAP (lib/gsap.ts). */
export function applyTextColor(dayTime: number): void {
  document.documentElement.style.setProperty("--fg", getTextColor(dayTime));
}
