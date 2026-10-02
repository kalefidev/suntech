import { Suspense, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import type { Camera, Object3D, Scene } from "three";
import { Sky } from "./Sky";
import { CameraRig } from "./CameraRig";
import { Lights } from "./Lights";
import { StudioEnvironment } from "./StudioEnvironment";
import { LightShaft } from "./LightShaft";
import { Product } from "./Product/Product";
import { CalloutProjector } from "./Callouts";
import { Energy } from "./Energy/Energy";
import { loadProductTextures } from "./textures";
import { DebugPerf } from "./DebugPerf";
import { quality } from "./quality";
import { flags, testHooks } from "../lib/env";
import { track } from "../lib/loading";

/**
 * Compila os shaders antes do primeiro quadro visível (tarefa real do loader).
 * Fica depois do produto, no mesmo Suspense: só roda com o produto montado.
 * O `compile` do three só olha o que está visível, então tudo fica visível
 * enquanto compila (o canvas ainda está transparente nesse momento).
 */
function Warmup() {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    const hidden: Object3D[] = [];
    scene.traverse((object) => {
      if (!object.visible) {
        hidden.push(object);
        object.visible = true;
      }
    });
    track("shaders", gl.compileAsync(scene, camera)).then(() => {
      hidden.forEach((object) => (object.visible = false));
      document.documentElement.dataset.scene = "on";
    });
  }, [gl, scene, camera]);
  return null;
}

declare global {
  interface Window {
    /** Só em dev ou com `?snap`: a cena do three, para testes. */
    __three?: { scene: Scene; camera: Camera };
  }
}

/** Conteúdo do `<Canvas>` único da página. */
export function Experience() {
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
  useEffect(() => {
    track("textures", loadProductTextures());
    if (testHooks) window.__three = { scene, camera };
  }, [scene, camera]);

  return (
    <PerformanceMonitor onIncline={quality.incline} onDecline={quality.decline} onFallback={quality.fallback} flipflops={3}>
      <Sky />
      <CameraRig />
      <Lights />
      <StudioEnvironment />
      <Suspense fallback={null}>
        <Product />
        <CalloutProjector />
        <Energy />
        <Warmup />
      </Suspense>
      <LightShaft />
      {flags.debug && <DebugPerf />}
    </PerformanceMonitor>
  );
}
