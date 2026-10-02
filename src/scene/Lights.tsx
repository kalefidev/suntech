import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { FogExp2, type DirectionalLight, type HemisphereLight } from "three";
import { easing } from "maath";
import { sceneLight } from "./daylight";
import { skyLive } from "./skyLive";
import { sceneState } from "./state";
import { productUniforms } from "./uniforms";

/** Densidade da névoa com o produto "apagado ao fundo" (produtoVisível 0). */
const FOG_DENSITY = 0.4;

/**
 * Luz do produto pela hora (seção 8 do brief): o sol direcional segue o céu
 * (quente no amanhecer e no entardecer, branco ao meio-dia), com uma
 * hemisférica de apoio e o ambiente de estúdio dosado pela hora. A mesma hora
 * amortecida do céu (`skyLive`), para luz e céu andarem juntos.
 *
 * Quando o produto sai de cena (`productVisible` 0), ele some numa névoa da
 * cor do horizonte, em vez de ficar transparente.
 */
export function Lights() {
  const scene = useThree((state) => state.scene);
  const sunRef = useRef<DirectionalLight>(null);
  const hemiRef = useRef<HemisphereLight>(null);
  const fog = useMemo(() => new FogExp2("#000000", 0), []);
  const live = useRef({ visible: sceneState.productVisible });

  useLayoutEffect(() => {
    scene.fog = fog;
    return () => {
      scene.fog = null;
    };
  }, [scene, fog]);

  useFrame((_, delta) => {
    const sun = sunRef.current;
    const hemi = hemiRef.current;
    if (!sun || !hemi) return;
    const light = sceneLight(skyLive.dayTime, skyLive.cloudCover);

    sun.position.set(light.sunDir[0] * 12, light.sunDir[1] * 12, light.sunDir[2] * 12);
    sun.color.setRGB(light.sunColor[0], light.sunColor[1], light.sunColor[2]);
    sun.intensity = light.sunIntensity;
    hemi.color.setRGB(light.skyColor[0], light.skyColor[1], light.skyColor[2]);
    hemi.groundColor.setRGB(light.groundColor[0], light.groundColor[1], light.groundColor[2]);
    hemi.intensity = light.hemiIntensity;
    scene.environmentIntensity = light.envIntensity;
    productUniforms.uIrradiance.value = light.irradiance;

    easing.damp(live.current, "visible", sceneState.productVisible, 0.3, delta);
    const away = 1 - live.current.visible;
    fog.color.setRGB(skyLive.horizon[0], skyLive.horizon[1], skyLive.horizon[2]);
    fog.density = FOG_DENSITY * away * away;
  });

  return (
    <>
      <directionalLight ref={sunRef} />
      <hemisphereLight ref={hemiRef} />
    </>
  );
}
