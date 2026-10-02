import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, Color, type Mesh, type ShaderMaterial, Vector2 } from "three";
import vertexShader from "../shaders/sky.vert.glsl?raw";
import fragmentShader from "../shaders/lightShaft.frag.glsl?raw";
import { hourOf, sunScreenPosition } from "./daylight";
import { skyLive } from "./skyLive";
import { sceneState } from "./state";
import { LAYER_BACKDROP } from "./layers";

/**
 * O primeiro raio de sol da abertura (seção 7 do brief), com `shaft` de 0 a
 * 1: o feixe cresce a partir do sol e some. Desenhado por cima do produto,
 * como luz no ar, e só existe durante a abertura.
 */
export function LightShaft() {
  const meshRef = useRef<Mesh>(null);
  const uniforms = useMemo(
    () => ({
      uSun: { value: new Vector2() },
      uAspect: { value: 1 },
      uIntensity: { value: 0 },
      uReach: { value: 0 },
      uColor: { value: new Color("#FFD9A6").multiplyScalar(0.6) },
      uMaskX: { value: 0.5 },
      uMaskY: { value: -1 },
    }),
    [],
  );

  useLayoutEffect(() => meshRef.current?.layers.set(LAYER_BACKDROP), []);

  useFrame(({ size }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const shaft = sceneState.shaft;
    mesh.visible = shaft > 0.001 && shaft < 0.999;
    if (!mesh.visible) return;
    // Escreve nos uniforms do material: o R3F copia o objeto `uniforms` ao
    // montar, e um valor reatribuído no objeto original não chegaria lá.
    const u = (mesh.material as ShaderMaterial).uniforms;
    const aspect = size.width / size.height;
    // O raio nasce de onde o sol aparece: o disco, ou o ponto do horizonte
    // onde ele vai nascer enquanto ainda está abaixo dele.
    const sun = sunScreenPosition(hourOf(skyLive.dayTime), aspect);
    u.uSun.value.set(sun.x, Math.max(sun.y, sun.horizonY + 0.01));
    u.uAspect.value = aspect;
    u.uReach.value = Math.min(1, shaft / 0.6);
    u.uIntensity.value = Math.sin(Math.PI * shaft) ** 0.7;
    u.uMaskX.value = aspect >= 1 ? 0.5 : -1;
    u.uMaskY.value = aspect >= 1 ? -1 : 0.48;
  });

  return (
    <mesh ref={meshRef} renderOrder={10} frustumCulled={false} visible={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        blending={AdditiveBlending}
        transparent
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}
