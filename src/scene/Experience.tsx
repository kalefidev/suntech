import { PerformanceMonitor } from "@react-three/drei";
import { Sky } from "./Sky";
import { DebugPerf } from "./DebugPerf";
import { isDebug } from "../lib/env";
import { downgradeTier, upgradeTier, type QualityTier } from "./quality";

interface ExperienceProps {
  onTierChange: (updater: (tier: QualityTier) => QualityTier) => void;
}

/**
 * Conteúdo do `<Canvas>` único da página (seção 5 do brief). Cresce nas
 * próximas fases: produto, vista explodida, fluxo de energia, celular e
 * pós-processamento. Por enquanto, só o céu — que já é a prova de que o
 * `dayTime` está de ponta a ponta funcionando.
 */
export function Experience({ onTierChange }: ExperienceProps) {
  return (
    <PerformanceMonitor
      onIncline={() => onTierChange(upgradeTier)}
      onDecline={() => onTierChange(downgradeTier)}
      flipflops={3}
    >
      <Sky />
      {isDebug() && <DebugPerf />}
    </PerformanceMonitor>
  );
}
