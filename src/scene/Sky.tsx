import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { type Mesh, type ShaderMaterial, Vector2, Vector3 } from "three";
import { easing } from "maath";
import vertexShader from "../shaders/sky.vert.glsl?raw";
import fragmentShader from "../shaders/sky.frag.glsl?raw";
import { sceneState } from "./state";
import { computeSky, mixSky, type RGB, type SkyUniforms } from "./daylight";
import { quality } from "./quality";
import { LAYER_BACKDROP } from "./layers";
import { skyLive } from "./skyLive";
import { useReducedMotion } from "../lib/useReducedMotion";

/**
 * Salto de hora a partir do qual o céu faz crossfade em vez de varrer as horas
 * do meio (varrer um dia inteiro em meio segundo faria o céu piscar). A rolagem
 * normal nunca chega perto disso: o damping fica a poucos minutos do alvo.
 */
const JUMP_HOURS = 6;
const FADE_SECONDS = 0.35;

function createUniforms() {
  const v3 = () => new Vector3();
  return {
    uZenith: { value: v3() },
    uHorizon: { value: v3() },
    uSunSide: { value: v3() },
    uSun: { value: v3() },
    uCloudLit: { value: v3() },
    uCloudShade: { value: v3() },
    uSunPos: { value: new Vector2() },
    uHorizonY: { value: 0.16 },
    uAspect: { value: 1 },
    uSunSize: { value: 0.045 },
    uSunIntensity: { value: 0 },
    uGlowIntensity: { value: 0 },
    uStars: { value: 1 },
    uCloudCover: { value: 0 },
    uCloudShift: { value: 0 },
    uGuardMode: { value: 1 },
    uGuardAmount: { value: 1 },
    uGuardX0: { value: 0.6 },
    uGuardX1: { value: 0.7 },
    uPixelRatio: { value: 1 },
    uOctaves: { value: 4 },
  };
}

const setVec = (target: Vector3, c: RGB) => target.set(c[0], c[1], c[2]);

/**
 * Céu em WebGL (seção 5 do brief): um quad em tela cheia. Lê `dayTime`,
 * `cloudCover` e `tone` do `sceneState`, amortece e entrega as cores de
 * `daylight.ts` ao shader. Com reduced motion, toda troca de hora é um
 * crossfade curto (seção 10 do brief).
 */
export function Sky() {
  const uniforms = useMemo(() => createUniforms(), []);
  const materialRef = useRef<ShaderMaterial>(null);
  const meshRef = useRef<Mesh>(null);
  useLayoutEffect(() => meshRef.current?.layers.set(LAYER_BACKDROP), []);
  const reduced = useReducedMotion();
  const live = useRef({
    dayTime: sceneState.dayTime,
    cloudCover: sceneState.cloudCover,
    guard: 1,
    wide: sceneState.guardWide,
    mode: 1,
    fade: 1,
    fadeFrom: null as SkyUniforms | null,
    last: null as SkyUniforms | null,
  });

  useFrame(({ size, gl }, delta) => {
    const material = materialRef.current;
    if (!material) return;
    const s = live.current;

    const hourGap = Math.abs(sceneState.dayTime - s.dayTime);
    const cloudGap = Math.abs(sceneState.cloudCover - s.cloudCover);
    const jumped = reduced ? hourGap > 0.01 || cloudGap > 0.01 : hourGap > JUMP_HOURS;
    if (jumped && s.last) {
      s.fadeFrom = s.last;
      s.fade = 0;
    }
    if (jumped || reduced) {
      s.dayTime = sceneState.dayTime;
      s.cloudCover = sceneState.cloudCover;
    } else {
      easing.damp(s, "dayTime", sceneState.dayTime, 0.25, delta);
      easing.damp(s, "cloudCover", sceneState.cloudCover, 0.3, delta);
    }

    // Tom 0 (travessia) solta a guarda; ao sair da travessia, ela volta aos poucos.
    if (sceneState.tone !== 0) s.mode = Math.sign(sceneState.tone);
    easing.damp(s, "guard", sceneState.tone !== 0 ? 1 : 0, 0.2, delta);
    easing.damp(s, "wide", sceneState.guardWide, 0.25, delta);

    let sky = computeSky(s.dayTime, s.cloudCover, size.width / size.height, s.mode, s.guard, s.wide);
    if (s.fade < 1 && s.fadeFrom) {
      s.fade = Math.min(1, s.fade + delta / FADE_SECONDS);
      const t = 1 - (1 - s.fade) ** 3;
      sky = mixSky(s.fadeFrom, sky, t);
      sky.guardAmount *= t;
    }
    s.last = sky;
    skyLive.dayTime = s.dayTime;
    skyLive.cloudCover = s.cloudCover;
    skyLive.horizon = sky.horizon;

    const u = material.uniforms;
    setVec(u.uZenith.value, sky.zenith);
    setVec(u.uHorizon.value, sky.horizon);
    setVec(u.uSunSide.value, sky.sunSide);
    setVec(u.uSun.value, sky.sun);
    setVec(u.uCloudLit.value, sky.cloudLit);
    setVec(u.uCloudShade.value, sky.cloudShade);
    u.uSunPos.value.set(sky.sunPos.x, sky.sunPos.y);
    u.uHorizonY.value = sky.horizonY;
    u.uAspect.value = sky.aspect;
    u.uSunSize.value = sky.sunSize;
    u.uSunIntensity.value = sky.sunIntensity;
    u.uGlowIntensity.value = sky.glowIntensity;
    u.uStars.value = sky.stars;
    u.uCloudCover.value = sky.cloudCover;
    u.uCloudShift.value = sky.cloudShift;
    u.uGuardMode.value = sky.guardMode;
    u.uGuardAmount.value = sky.guardAmount;
    u.uGuardX0.value = sky.guardX0;
    u.uGuardX1.value = sky.guardX1;
    u.uPixelRatio.value = gl.getPixelRatio();
    u.uOctaves.value = quality.get().cloudOctaves;
  });

  return (
    <mesh ref={meshRef} renderOrder={-1} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}
