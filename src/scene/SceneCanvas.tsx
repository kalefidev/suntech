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
 * chegar e de o texto do hero pintar. Um único `<Canvas>` fixo atrás do DOM,
 * **transparente**: o fundo é uma cor CSS (`--bg`, animada pela timeline) e a
 * palavra gigante de cada beat fica no DOM, atrás dele.
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
      dpr={flags.snap ? flags.dpr || 1 : settings.dpr}
      // Antialias nativo: o produto não pode ter serrilhado em DPR 1. O contexto
      // não muda depois de criado. `alpha: true`: o fundo vem do CSS.
      gl={{ antialias: true, powerPreference: "high-performance", alpha: true, premultipliedAlpha: true }}
      camera={{ position: [3.4, 3.2, 6.9], fov: 30, near: 0.05, far: 100 }}
      onCreated={({ gl }) => {
        // Khronos PBR Neutral: fiel à cor do produto. O composer aplica a mesma curva.
        gl.toneMapping = NeutralToneMapping;
        gl.setClearColor(0x000000, 0);
      }}
    >
      <Experience />
    </Canvas>
  );
}
