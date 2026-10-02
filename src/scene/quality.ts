/**
 * Tiers de qualidade (Fase 0, item 7). O tier de entrada sai da viewport e do
 * processador; o `PerformanceMonitor` desce quando o FPS cai e sobe só até o
 * teto da viewport (nunca um celular "sobe" para alto e depois despenca).
 * Fica numa store fora do React, para trocar de tier sem re-renderizar a página.
 */

export type QualityTier = "alto" | "medio" | "baixo";

export interface QualitySettings {
  tier: QualityTier;
  dpr: [number, number];
  /** Fótons e partículas de energia. */
  particles: number;
  /** Resolução do ContactShadows; 0 = sombra falsa. */
  shadowSize: number;
  post: { bloom: boolean; noise: boolean; vignette: boolean };
  /** Texturas procedurais: geradas uma vez, no tier de entrada. */
  textures: { cells: number; pcb: number };
  envSize: number;
  cloudOctaves: number;
}

const TIERS: Record<QualityTier, QualitySettings> = {
  alto: {
    tier: "alto",
    dpr: [1, 2],
    particles: 160,
    shadowSize: 1024,
    post: { bloom: true, noise: true, vignette: true },
    textures: { cells: 2048, pcb: 1024 },
    envSize: 256,
    cloudOctaves: 5,
  },
  medio: {
    tier: "medio",
    dpr: [1, 1.5],
    particles: 80,
    shadowSize: 512,
    post: { bloom: true, noise: false, vignette: true },
    textures: { cells: 1024, pcb: 512 },
    envSize: 128,
    cloudOctaves: 4,
  },
  baixo: {
    tier: "baixo",
    dpr: [1, 1],
    particles: 32,
    shadowSize: 0,
    post: { bloom: false, noise: false, vignette: false },
    textures: { cells: 512, pcb: 256 },
    envSize: 64,
    cloudOctaves: 3,
  },
};

const ORDER: QualityTier[] = ["baixo", "medio", "alto"];

/**
 * Celular fraco (pouca memória ou poucos núcleos, sinais que o Android expõe)
 * já entra no baixo, para não travar nos primeiros segundos antes de o
 * `PerformanceMonitor` reagir. Se rodar liso, ele sobe até o teto.
 */
function entryTier(): QualityTier {
  if (typeof window === "undefined") return "medio";
  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  const phone = Math.min(window.innerWidth, window.innerHeight) < 768;
  if (phone) return memory <= 4 || cores <= 4 ? "baixo" : "medio";
  if (window.innerWidth >= 1280 && cores >= 8) return "alto";
  return "medio";
}

function ceilingTier(): QualityTier {
  if (typeof window === "undefined") return "medio";
  return window.innerWidth >= 1024 ? "alto" : "medio";
}

const entry = entryTier();
const ceiling = ceilingTier();
let current: QualityTier = entry;
let locked = false;
const listeners = new Set<() => void>();

function set(tier: QualityTier): void {
  if (tier === current) return;
  current = tier;
  listeners.forEach((listener) => listener());
}

export const quality = {
  get: (): QualitySettings => TIERS[current],
  /** Texturas usam o tier de entrada: não são regeradas quando o tier muda. */
  entry: (): QualitySettings => TIERS[entry],
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  decline(): void {
    if (locked) return;
    set(ORDER[Math.max(0, ORDER.indexOf(current) - 1)]);
  },
  incline(): void {
    if (locked) return;
    set(ORDER[Math.min(ORDER.indexOf(ceiling), ORDER.indexOf(current) + 1)]);
  },
  /** Oscilou demais: fica no baixo até o fim da visita. */
  fallback(): void {
    set("baixo");
    locked = true;
  },
};
