import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { easing } from "maath";
import vertexShader from "../shaders/sky.vert.glsl?raw";
import fragmentShader from "../shaders/sky.frag.glsl?raw";
import { sceneState } from "./state";
import { getSky, getSunScreenPosition } from "./daylight";

function createSkyMaterial(): THREE.ShaderMaterial {
  const initial = getSky(sceneState.dayTime);
  const initialSun = getSunScreenPosition(sceneState.dayTime);
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      uZenith: { value: new THREE.Vector3(...initial.zenith) },
      uHorizon: { value: new THREE.Vector3(...initial.horizon) },
      uSun: { value: new THREE.Vector3(...initial.sun) },
      uSunIntensity: { value: initial.sunIntensity },
      uStarIntensity: { value: initial.starIntensity },
      uSunPos: { value: new THREE.Vector2(initialSun.x, initialSun.y) },
      // Começa em (1,1): o primeiro useFrame corrige para o tamanho real
      // antes de qualquer pintura visível, sem precisar de `size` aqui.
      uResolution: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
    },
  });
}

/**
 * Céu em WebGL: um quad em tela cheia (ver seção 5 do brief — o céu nunca é
 * um `background` de CSS). Único ponto do código que lê `sceneState.dayTime`
 * para desenhar o gradiente, o sol e as estrelas.
 *
 * O material é criado uma vez num `ref` (não `useMemo`) porque é mutado a
 * cada frame — é um objeto imperativo do three.js, não um valor derivado.
 */
export function Sky() {
  const { size } = useThree();
  const dampedDayTime = useRef(sceneState.dayTime);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  // Inicialização preguiçosa de ref (padrão documentado do próprio React
  // para objetos caros e imperativos); idempotente, não afeta o JSX.
  // oxlint-disable-next-line react/refs
  if (!materialRef.current) {
    materialRef.current = createSkyMaterial();
  }
  // oxlint-disable-next-line react/refs
  const material = materialRef.current;

  useFrame((_, delta) => {
    easing.damp(dampedDayTime, "current", sceneState.dayTime, 0.25, delta);
    const t = dampedDayTime.current;
    const sky = getSky(t);
    const sun = getSunScreenPosition(t);
    const u = material.uniforms;
    (u.uZenith.value as THREE.Vector3).set(...sky.zenith);
    (u.uHorizon.value as THREE.Vector3).set(...sky.horizon);
    (u.uSun.value as THREE.Vector3).set(...sky.sun);
    u.uSunIntensity.value = sky.sunIntensity;
    u.uStarIntensity.value = sky.starIntensity;
    (u.uSunPos.value as THREE.Vector2).set(sun.x, sun.y);
    (u.uResolution.value as THREE.Vector2).set(size.width, size.height);
    u.uTime.value += delta;
  });

  return (
    <mesh renderOrder={-1} frustumCulled={false} material={material}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}
