/**
 * Fonte única de toda cor derivada da hora do dia (céu, sol, nuvens, estrelas,
 * luz da cena e a guarda de contraste do texto). Não importa `three`: roda no
 * chunk inicial (tom do texto e fallback sem WebGL).
 *
 * `dayTime` está em horas contínuas ao longo da página (4,5 → 65,7: três dias);
 * o céu usa `dayTime mod 24`. Os keyframes são sRGB (como os tokens); o shader
 * recebe as cores já lineares, calculadas aqui. O contraste do texto é medido
 * nos pixels reais pelo `snap` (scripts/snap.mjs).
 *
 * Zona morta: com fundo entre L 0,167 e L 0,246 (luminância WCAG), nem Nuvem
 * nem Noite chegam a 4,5:1. Toda travessia do céu por ela acontece com só o 3D
 * na tela (scene/choreography.ts).
 */

export type RGB = readonly [number, number, number];

// ---------------------------------------------------------------- cor

function hex(h: string): RGB {
  const n = parseInt(h.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function toLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function linear(c: RGB): RGB {
  return [toLinear(c[0]), toLinear(c[1]), toLinear(c[2])];
}

function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function mixRgb(a: RGB, b: RGB, t: number): RGB {
  return [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];
}

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

function smoothstep(e0: number, e1: number, x: number): number {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
}

// ------------------------------------------------------------- tokens

export const TOKENS = {
  noite: hex("#14213D"),
  ceu: hex("#CFE8F3"),
  nuvem: hex("#F4F7FA"),
  sol: hex("#FFB22C"),
  brasa: hex("#E8773A"),
  grafite: hex("#2B3036"),
} as const;

// ---------------------------------------------------------- keyframes

interface SkyKey {
  h: number;
  zenith: string;
  horizon: string;
  sunSide: string;
  sun: string;
  sunI: number;
  glowI: number;
  stars: number;
  cloudLit: string;
  cloudShade: string;
}

/**
 * Céu limpo por hora (sRGB). `horizon` é o horizonte do lado do texto (contra o
 * sol); `sunSide` é o brilho do lado do sol, sempre à direita. Os valores com
 * texto na tela ficam fora da zona morta com folga: Nuvem com L ≤ 0,12 e Noite
 * com L ≥ 0,30. As travessias (07:00–08:30 e 17:30–19:00) só acontecem sem texto.
 */
const KEYS: SkyKey[] = [
  { h: 0, zenith: "#14213D", horizon: "#1B2A4F", sunSide: "#1B2A4F", sun: "#14213D", sunI: 0, glowI: 0, stars: 1, cloudLit: "#26314F", cloudShade: "#1A2440" },
  { h: 4.5, zenith: "#14213D", horizon: "#1D2C52", sunSide: "#2E3363", sun: "#14213D", sunI: 0, glowI: 0.18, stars: 1, cloudLit: "#2B3354", cloudShade: "#1B2542" },
  { h: 5.5, zenith: "#172747", horizon: "#2A3A64", sunSide: "#E8773A", sun: "#E8773A", sunI: 0, glowI: 0.5, stars: 0.55, cloudLit: "#5A4A66", cloudShade: "#202B4A" },
  { h: 6.25, zenith: "#1E3A6A", horizon: "#3C5283", sunSide: "#F29A4A", sun: "#FFC47A", sunI: 1, glowI: 0.8, stars: 0.12, cloudLit: "#6E5A78", cloudShade: "#2C3A62" },
  { h: 7, zenith: "#24406F", horizon: "#435A88", sunSide: "#FFC06A", sun: "#FFE0A0", sunI: 1, glowI: 0.7, stars: 0, cloudLit: "#6A6480", cloudShade: "#33416A" },
  { h: 8.5, zenith: "#6E9CC6", horizon: "#BFDCEC", sunSide: "#FFF0D2", sun: "#FFF6E0", sunI: 1, glowI: 0.5, stars: 0, cloudLit: "#FFFFFF", cloudShade: "#C9D3DE" },
  { h: 12, zenith: "#8DBBDA", horizon: "#CFE8F3", sunSide: "#F4FAFF", sun: "#FFFBF0", sunI: 1, glowI: 0.35, stars: 0, cloudLit: "#FFFFFF", cloudShade: "#D5DEE8" },
  { h: 16, zenith: "#86B2D3", horizon: "#E9DDC4", sunSide: "#FFE2B0", sun: "#FFE7B8", sunI: 1, glowI: 0.5, stars: 0, cloudLit: "#FFF4E4", cloudShade: "#CCD2DA" },
  { h: 17.5, zenith: "#9DBCD6", horizon: "#F2C98E", sunSide: "#FFB22C", sun: "#FFC05A", sunI: 1, glowI: 0.85, stars: 0, cloudLit: "#FFD9A8", cloudShade: "#C9C0C6" },
  { h: 18.2, zenith: "#4A5A8A", horizon: "#C9876A", sunSide: "#E8773A", sun: "#FF8A3C", sunI: 0.9, glowI: 0.9, stars: 0.1, cloudLit: "#E0896A", cloudShade: "#5A5470" },
  { h: 19.5, zenith: "#1A2548", horizon: "#2E3560", sunSide: "#5A3550", sun: "#14213D", sunI: 0, glowI: 0.3, stars: 0.6, cloudLit: "#3A3552", cloudShade: "#1E2744" },
  { h: 21.5, zenith: "#14213D", horizon: "#1B2A4F", sunSide: "#1B2A4F", sun: "#14213D", sunI: 0, glowI: 0, stars: 1, cloudLit: "#26314F", cloudShade: "#1A2440" },
  { h: 24, zenith: "#14213D", horizon: "#1B2A4F", sunSide: "#1B2A4F", sun: "#14213D", sunI: 0, glowI: 0, stars: 1, cloudLit: "#26314F", cloudShade: "#1A2440" },
];

interface ParsedKey {
  h: number;
  zenith: RGB;
  horizon: RGB;
  sunSide: RGB;
  sun: RGB;
  sunI: number;
  glowI: number;
  stars: number;
  cloudLit: RGB;
  cloudShade: RGB;
}

const PARSED: ParsedKey[] = KEYS.map((k) => ({
  ...k,
  zenith: hex(k.zenith),
  horizon: hex(k.horizon),
  sunSide: hex(k.sunSide),
  sun: hex(k.sun),
  cloudLit: hex(k.cloudLit),
  cloudShade: hex(k.cloudShade),
}));

/** Tempestade: nuvens cinza-azuladas cobrindo o sol, de noite e de dia. */
const STORM = {
  zenith: [hex("#1C2336"), hex("#3A475E")],
  horizon: [hex("#232B40"), hex("#4A5670")],
  cloudLit: [hex("#2A3350"), hex("#5D6A82")],
  cloudShade: [hex("#161C2C"), hex("#333F55")],
} as const;

export function hourOf(dayTime: number): number {
  return ((dayTime % 24) + 24) % 24;
}

/** Elevação do sol de −1 (meia-noite) a 1 (meio-dia); nasce às 6h, se põe às 18h. */
export function sunElevation(hour: number): number {
  return Math.sin((Math.PI * (hour - 6)) / 12);
}

function keyAt(hour: number): ParsedKey {
  let i = 0;
  while (i < PARSED.length - 2 && PARSED[i + 1].h <= hour) i++;
  const a = PARSED[i];
  const b = PARSED[i + 1];
  const t = clamp01((hour - a.h) / (b.h - a.h));
  return {
    h: hour,
    zenith: mixRgb(a.zenith, b.zenith, t),
    horizon: mixRgb(a.horizon, b.horizon, t),
    sunSide: mixRgb(a.sunSide, b.sunSide, t),
    sun: mixRgb(a.sun, b.sun, t),
    sunI: mix(a.sunI, b.sunI, t),
    glowI: mix(a.glowI, b.glowI, t),
    stars: mix(a.stars, b.stars, t),
    cloudLit: mixRgb(a.cloudLit, b.cloudLit, t),
    cloudShade: mixRgb(a.cloudShade, b.cloudShade, t),
  };
}

// ------------------------------------------------------------ uniforms

/** Tudo que o shader do céu recebe. Cores já em espaço linear. */
export interface SkyUniforms {
  zenith: RGB;
  horizon: RGB;
  sunSide: RGB;
  sun: RGB;
  cloudLit: RGB;
  cloudShade: RGB;
  sunPos: { x: number; y: number };
  horizonY: number;
  aspect: number;
  sunSize: number;
  sunIntensity: number;
  glowIntensity: number;
  stars: number;
  cloudCover: number;
  cloudShift: number;
  /** +1 limita o céu por cima (texto Nuvem), −1 por baixo (texto Noite). */
  guardMode: number;
  /** 0 a 1; 0 nas travessias. */
  guardAmount: number;
  guardX0: number;
  guardX1: number;
}

/** Onde o sol aparece na tela (0–1), sempre do lado direito, longe do texto. */
export function sunScreenPosition(hour: number, aspect: number): { x: number; y: number; horizonY: number } {
  const e = sunElevation(hour);
  const fromNoon = clamp01(Math.abs(hour - 12) / 6);
  if (aspect >= 1) {
    const horizonY = 0.16;
    return { x: 0.62 + 0.26 * fromNoon, y: horizonY + e * 0.72, horizonY };
  }
  // No celular, o horizonte fica acima do bloco de texto do hero: o sol nasce
  // atrás do produto e o disco inteiro cabe na tela, longe da borda direita.
  const horizonY = 0.56;
  return { x: 0.62 + 0.12 * fromNoon, y: horizonY + e * 0.46, horizonY };
}

export function computeSky(
  dayTime: number,
  cloudCover: number,
  aspect: number,
  guardMode: number,
  guardAmount: number,
): SkyUniforms {
  const hour = hourOf(dayTime);
  const k = keyAt(hour);
  const e = sunElevation(hour);
  const dayF = smoothstep(-0.1, 0.4, e);
  const storm = smoothstep(0.55, 0.9, cloudCover);
  const stormed = (clear: RGB, pair: readonly [RGB, RGB]) => mixRgb(clear, mixRgb(pair[0], pair[1], dayF), storm);
  const sun = sunScreenPosition(hour, aspect);
  const desktop = aspect >= 1;

  return {
    zenith: linear(stormed(k.zenith, STORM.zenith)),
    horizon: linear(stormed(k.horizon, STORM.horizon)),
    sunSide: linear(k.sunSide),
    sun: linear(k.sun),
    cloudLit: linear(stormed(k.cloudLit, STORM.cloudLit)),
    cloudShade: linear(stormed(k.cloudShade, STORM.cloudShade)),
    sunPos: { x: sun.x, y: sun.y },
    horizonY: sun.horizonY,
    aspect,
    sunSize: desktop ? 0.045 : 0.06,
    sunIntensity: k.sunI * (1 - storm) * smoothstep(-0.04, 0.02, e),
    glowIntensity: k.glowI * (1 - 0.9 * storm),
    stars: k.stars * (1 - cloudCover),
    cloudCover,
    cloudShift: dayTime * 0.035,
    guardMode,
    guardAmount,
    // No desktop o texto vive nos 60% da esquerda; no celular, na tela toda. A
    // rampa é larga de propósito: uma rampa curta desenha uma faixa escura no céu.
    guardX0: desktop ? 0.5 : 2,
    guardX1: desktop ? 0.85 : 3,
  };
}

/**
 * Crossfade entre dois céus: mistura as cores, o sol e as intensidades sem
 * passar pelas horas do meio. Usado nos saltos de hora (`?goto`, reduced
 * motion), em que varrer o dia inteiro faria o céu piscar. Forma das nuvens,
 * guarda e aspecto vêm do céu de destino.
 */
export function mixSky(a: SkyUniforms, b: SkyUniforms, t: number): SkyUniforms {
  return {
    ...b,
    zenith: mixRgb(a.zenith, b.zenith, t),
    horizon: mixRgb(a.horizon, b.horizon, t),
    sunSide: mixRgb(a.sunSide, b.sunSide, t),
    sun: mixRgb(a.sun, b.sun, t),
    cloudLit: mixRgb(a.cloudLit, b.cloudLit, t),
    cloudShade: mixRgb(a.cloudShade, b.cloudShade, t),
    sunPos: { x: mix(a.sunPos.x, b.sunPos.x, t), y: mix(a.sunPos.y, b.sunPos.y, t) },
    sunIntensity: mix(a.sunIntensity, b.sunIntensity, t),
    glowIntensity: mix(a.glowIntensity, b.glowIntensity, t),
    stars: mix(a.stars, b.stars, t),
    cloudCover: mix(a.cloudCover, b.cloudCover, t),
  };
}

// ------------------------------------------------------------ luz da cena

/** Luz do produto pela hora. Cores lineares, prontas para o three. */
export interface SceneLight {
  /** Direção de onde vem o sol (normalizada), no espaço do mundo. */
  sunDir: readonly [number, number, number];
  sunColor: RGB;
  sunIntensity: number;
  /** Hemisférica de apoio: céu e chão. */
  skyColor: RGB;
  groundColor: RGB;
  hemiIntensity: number;
  /** Multiplicador do ambiente de estúdio (os reflexos). */
  envIntensity: number;
  /** 0 a 1: quanto sol bate no painel (brilho das células). */
  irradiance: number;
}

const GROUND = hex("#1A1714");

/**
 * O sol vem sempre do lado direito, como no céu, e um pouco de trás do
 * produto, para desenhar as bordas. Sobe até uns 60° ao meio-dia. De noite e
 * na tempestade, o produto continua legível: o ambiente de estúdio nunca
 * apaga de vez (é uma página de produto, não uma simulação).
 */
export function sceneLight(dayTime: number, cloudCover: number): SceneLight {
  const hour = hourOf(dayTime);
  const k = keyAt(hour);
  const e = sunElevation(hour);
  const storm = smoothstep(0.55, 0.9, cloudCover);
  const above = smoothstep(-0.04, 0.12, e);
  const dayF = smoothstep(-0.1, 0.4, e);
  const elevation = Math.max(0.06, Math.asin(Math.min(1, Math.max(-1, e))) * 0.67);
  const cos = Math.cos(elevation);
  return {
    sunDir: [cos * 0.94, Math.sin(elevation), cos * -0.34],
    sunColor: linear(mixRgb(k.sun, k.sunSide, 0.35)),
    sunIntensity: 2.6 * k.sunI * above * (1 - 0.85 * storm),
    skyColor: linear(mixRgb(k.zenith, TOKENS.nuvem, 0.25)),
    groundColor: linear(mixRgb(k.horizon, GROUND, 0.6)),
    hemiIntensity: 0.25 + 0.5 * dayF,
    envIntensity: (0.45 + 0.55 * dayF) * (1 - 0.3 * storm),
    irradiance: k.sunI * above * (1 - storm),
  };
}

// ------------------------------------------------------------ texto

export type Tone = "light" | "dark";

/** Tom do texto por valor agendado: 1 = Nuvem, −1 = Noite, 0 = travessia. */
export function toneFromSchedule(value: number): Tone | null {
  if (value > 0.5) return "light";
  if (value < -0.5) return "dark";
  return null;
}

let appliedTone: Tone = "light";
let appliedCrossing = false;

/**
 * Aplica o tom no `<html>`: `data-tone` troca `--fg` (com crossfade no CSS) e
 * `data-crossing` tira o header de cena enquanto o céu cruza a zona morta.
 */
export function applyTone(value: number): void {
  const tone = toneFromSchedule(value);
  const crossing = tone === null;
  const root = document.documentElement;
  if (crossing !== appliedCrossing) {
    appliedCrossing = crossing;
    root.toggleAttribute("data-crossing", crossing);
  }
  if (tone && tone !== appliedTone) {
    appliedTone = tone;
    root.dataset.tone = tone;
  }
}

/** Cores do gradiente em CSS (fallback sem WebGL), em sRGB hex. */
export function cssSky(dayTime: number, cloudCover: number): { zenith: string; horizon: string } {
  const hour = hourOf(dayTime);
  const k = keyAt(hour);
  const dayF = smoothstep(-0.1, 0.4, sunElevation(hour));
  const storm = smoothstep(0.55, 0.9, cloudCover);
  const toHex = (c: RGB) =>
    `#${c.map((v) => Math.round(clamp01(v) * 255).toString(16).padStart(2, "0")).join("")}`;
  return {
    zenith: toHex(mixRgb(k.zenith, mixRgb(STORM.zenith[0], STORM.zenith[1], dayF), storm)),
    horizon: toHex(mixRgb(k.horizon, mixRgb(STORM.horizon[0], STORM.horizon[1], dayF), storm)),
  };
}
