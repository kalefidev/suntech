import { Canvas } from "@react-three/fiber";
import type { RefObject } from "react";
import { Experience } from "./Experience";
import { getQuality, type QualityTier } from "./quality";

interface SceneCanvasProps {
  eventSource: RefObject<HTMLDivElement | null>;
  tier: QualityTier;
  onTierChange: (updater: (tier: QualityTier) => QualityTier) => void;
}

/**
 * Módulo carregado via `React.lazy` (App.tsx) — é aqui que `three` e o
 * `@react-three/fiber` entram no bundle, depois do texto do hero pintar.
 */
export default function SceneCanvas({ eventSource, tier, onTierChange }: SceneCanvasProps) {
  const quality = getQuality(tier);

  return (
    <Canvas
      className="scene-canvas-wrap"
      eventSource={eventSource}
      eventPrefix="client"
      dpr={quality.maxDpr}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 5], fov: 40 }}
    >
      <Experience onTierChange={onTierChange} />
    </Canvas>
  );
}
