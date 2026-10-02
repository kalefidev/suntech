import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { Sky } from "./Sky";
import { DebugPerf } from "./DebugPerf";
import { quality } from "./quality";
import { flags } from "../lib/env";
import { complete, track } from "../lib/loading";

/** Compila os shaders antes do primeiro quadro visível (tarefa real do loader). */
function Warmup() {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    // Fase 1: ainda não há texturas procedurais; a Fase 2 gera e conclui esta tarefa.
    complete("textures");
    track("shaders", gl.compileAsync(scene, camera)).then(() => {
      document.documentElement.dataset.scene = "on";
    });
  }, [gl, scene, camera]);
  return null;
}

/** Conteúdo do `<Canvas>` único da página. */
export function Experience() {
  return (
    <PerformanceMonitor
      onIncline={quality.incline}
      onDecline={quality.decline}
      onFallback={quality.fallback}
      flipflops={3}
    >
      <Sky />
      <Warmup />
      {flags.debug && <DebugPerf />}
    </PerformanceMonitor>
  );
}
