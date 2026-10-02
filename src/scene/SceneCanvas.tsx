import { useSyncExternalStore, type RefObject } from "react";
import { Canvas } from "@react-three/fiber";
import { NeutralToneMapping } from "three";
import { Experience } from "./Experience";
import { quality } from "./quality";
import { flags } from "../lib/env";

interface SceneCanvasProps {
  eventSource: RefObject<HTMLElement | null>;
}

/**
 * Carregado via `React.lazy` (App.tsx): é aqui que `three` e o R3F entram.
 * O chunk baixa desde o começo, mas o canvas só monta depois de a fonte
 * chegar e de o texto do hero pintar. Um único `<Canvas>` fixo atrás do DOM.
 */
export default function SceneCanvas({ eventSource }: SceneCanvasProps) {
  const settings = useSyncExternalStore(quality.subscribe, quality.get);

  return (
    <Canvas
      className="scene-canvas-wrap"
      aria-hidden="true"
      eventSource={eventSource as RefObject<HTMLElement>}
      eventPrefix="client"
      // Com `?snap`, DPR 1: as fotos saem no tamanho da viewport em qualquer
      // tela (e o SwiftShader, quando é ele, renderiza na CPU).
      dpr={flags.snap ? 1 : settings.dpr}
      // Antialias nativo: o produto não pode ter serrilhado em DPR 1 (receita
      // de estúdio). O antialias do contexto não muda depois de criado.
      gl={{ antialias: true, powerPreference: "high-performance", alpha: false }}
      camera={{ position: [0, 2.3, 11], fov: 30, near: 0.1, far: 100 }}
      onCreated={({ gl }) => {
        // Khronos PBR Neutral: fiel à cor do produto. O modelo de contraste
        // (daylight.ts) aplica a mesma curva.
        gl.toneMapping = NeutralToneMapping;
      }}
    >
      <Experience />
    </Canvas>
  );
}
