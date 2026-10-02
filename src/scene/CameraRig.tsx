import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { type PerspectiveCamera, Vector3 } from "three";
import { easing } from "maath";
import { sceneState, type CameraPose } from "./state";
import { LAYER_BACKDROP } from "./layers";
import { useMedia, useReducedMotion } from "../lib/useReducedMotion";
import { WIDE } from "../lib/env";

const KEYS = ["x", "y", "z", "tx", "ty", "tz", "fov", "sx", "sy"] as const satisfies ReadonlyArray<keyof CameraPose>;

/**
 * Câmera da cena: segue `sceneState.camera` com damping. O deslocamento de
 * lente (`sx`, `sy`) põe o produto onde o layout pede (à direita no desktop,
 * em cima no celular) sem mudar a perspectiva: a câmera continua mirando o
 * produto. Com reduced motion, a câmera pula para a pose, sem viajar.
 */
export function CameraRig() {
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const reduced = useReducedMotion();
  const wide = useMedia(WIDE);
  const live = useRef<CameraPose>({ ...sceneState.camera });
  const target = useMemo(() => new Vector3(), []);

  useLayoutEffect(() => {
    camera.layers.enable(LAYER_BACKDROP);
  }, [camera]);

  useFrame(({ size }, delta) => {
    const pose = sceneState.camera;
    const l = live.current;
    for (const key of KEYS) {
      if (reduced) l[key] = pose[key];
      else easing.damp(l, key, pose[key], 0.35, delta);
    }
    camera.position.set(l.x, l.y, l.z);
    target.set(l.tx, l.ty, l.tz);
    camera.lookAt(target);
    const { width, height } = size;
    // As poses foram enquadradas em 16:10 (desktop) e 390×844 (celular). Numa
    // tela mais estreita que essas, o campo de visão abre na mesma proporção:
    // o que o layout pôs nas laterais continua na tela.
    const fit = Math.max(1, (wide ? 1.6 : 0.46) / (width / height));
    camera.fov = fit === 1 ? l.fov : (360 / Math.PI) * Math.atan(Math.tan((l.fov * Math.PI) / 360) * fit);
    // O three tira o aspecto da câmera da "tela cheia" do deslocamento: passa
    // a tela real. Já atualiza a projeção.
    camera.setViewOffset(width, height, -l.sx * width, l.sy * height, width, height);
  });

  return null;
}
