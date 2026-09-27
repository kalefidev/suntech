/**
 * Tiers de qualidade (Fase 0, seção 6). Definidos pela viewport na entrada e
 * rebaixados em tempo real pelo `PerformanceMonitor` do drei se o fps cair.
 */

export type QualityTier = "alto" | "medio" | "baixo";

export interface QualitySettings {
  tier: QualityTier;
  maxDpr: number;
  particleCount: number;
  shadowsEnabled: boolean;
  shadowMapSize: number;
  postprocessing: {
    bloom: boolean;
    noise: boolean;
    vignette: boolean;
    godRays: boolean;
  };
  textureSize: number;
}

const TIERS: Record<QualityTier, QualitySettings> = {
  alto: {
    tier: "alto",
    maxDpr: 2,
    particleCount: 120,
    shadowsEnabled: true,
    shadowMapSize: 1024,
    postprocessing: { bloom: true, noise: true, vignette: true, godRays: true },
    textureSize: 1024,
  },
  medio: {
    tier: "medio",
    maxDpr: 1.5,
    particleCount: 60,
    shadowsEnabled: true,
    shadowMapSize: 512,
    postprocessing: { bloom: true, noise: false, vignette: true, godRays: false },
    textureSize: 512,
  },
  baixo: {
    tier: "baixo",
    maxDpr: 1,
    particleCount: 24,
    shadowsEnabled: false,
    shadowMapSize: 0,
    postprocessing: { bloom: false, noise: false, vignette: false, godRays: false },
    textureSize: 256,
  },
};

/** Tier inicial pela largura da viewport; o PerformanceMonitor ajusta depois. */
export function initialTier(): QualityTier {
  if (typeof window === "undefined") return "medio";
  const w = window.innerWidth;
  const cores = navigator.hardwareConcurrency ?? 4;
  if (w >= 1024 && cores >= 6) return "alto";
  if (w < 640) return "baixo";
  return "medio";
}

export function getQuality(tier: QualityTier): QualitySettings {
  return TIERS[tier];
}

export function downgradeTier(tier: QualityTier): QualityTier {
  if (tier === "alto") return "medio";
  if (tier === "medio") return "baixo";
  return "baixo";
}

export function upgradeTier(tier: QualityTier): QualityTier {
  if (tier === "baixo") return "medio";
  if (tier === "medio") return "alto";
  return "alto";
}
