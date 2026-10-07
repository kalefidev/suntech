import { Suspense, useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import type { Camera, Group, Scene, WebGLRenderer } from "three";
import { CameraRig } from "./CameraRig";
import { Lights } from "./Lights";
import { StudioEnvironment } from "./StudioEnvironment";
import { ContactShadow } from "./ContactShadow";
import { SuntechModel } from "./model/SuntechModel";
import { Effects } from "./Effects";
import { loadProductTextures } from "./textures";
import { DebugPerf } from "./DebugPerf";
import { quality } from "./quality";
import { sceneState } from "./state";
import { flags, testHooks } from "../lib/env";
import { track } from "../lib/loading";

/**
 * Aquece a cena antes do primeiro quadro visível (tarefa real do loader). Fica depois do
 * produto, no mesmo Suspense: só roda com o produto montado.
 *
 * `compileAsync` sozinho não basta: ele compila para a tela, e a cena é desenhada num alvo de
 * renderização do composer (espaço de cor e tone mapping diferentes), então os programas de
 * uso são outros, e o primeiro uso de cada peça (o celular, o cabo, a sombra) travava o scroll
 * por 150 a 350 ms. Por isso a cena roda alguns quadros de verdade, pelo composer, com o
 * produto, o celular e o cabo ligados; o canvas ainda está transparente e o estado volta ao
 * que era (a abertura parte dele).
 */
function Warmup() {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    const keys = ["productVisible", "phoneVisible", "cable", "phoneCharge", "ledOn"] as const;
    const saved = Object.fromEntries(keys.map((key) => [key, sceneState[key]]));
    const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    Object.assign(sceneState, { productVisible: 1, phoneVisible: 1, cable: 1, phoneCharge: 0.5, ledOn: 1 });
    const warm = gl
      .compileAsync(scene, camera)
      .then(() => frame())
      .then(() => frame())
      .then(() => frame())
      .then(() => frame());
    track("shaders", warm).then(() => {
      Object.assign(sceneState, saved);
      document.documentElement.dataset.scene = "on";
    });
  }, [gl, scene, camera]);
  return null;
}

declare global {
  interface Window {
    /** Só em dev ou com `?snap`: a cena do three, para testes. */
    __three?: { scene: Scene; camera: Camera; gl: WebGLRenderer };
  }
}

/** Conteúdo do `<Canvas>` único da página. */
export function Experience() {
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);
  const product = useRef<Group>(null);
  useEffect(() => {
    track("textures", loadProductTextures());
    if (testHooks) window.__three = { scene, camera, gl };
  }, [scene, camera, gl]);

  return (
    <PerformanceMonitor onIncline={quality.incline} onDecline={quality.decline} onFallback={quality.fallback} flipflops={3}>
      {/* Primeiro da árvore: o composer troca o tone mapping antes de qualquer material compilar. */}
      <Effects />
      <CameraRig />
      <Lights />
      <StudioEnvironment />
      <Suspense fallback={null}>
        <SuntechModel rootRef={product} />
        <group position={[0.3, 0, 0.2]}>
          <ContactShadow subject={product} width={4.6} depth={3.2} />
        </group>
        <Warmup />
      </Suspense>
      {flags.debug && <DebugPerf />}
    </PerformanceMonitor>
  );
}
