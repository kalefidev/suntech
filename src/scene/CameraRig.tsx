import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { type PerspectiveCamera, Vector3 } from "three";
import { easing } from "maath";
import { sceneState, type CameraPose } from "./state";
import { LAYER_BACKDROP } from "./layers";
import { useReducedMotion } from "../lib/useReducedMotion";

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
    camera.fov = l.fov;
    // O three tira o aspecto da câmera da "tela cheia" do deslocamento: passa
    // a tela real. Já atualiza a projeção.
    const { width, height } = size;
    camera.setViewOffset(width, height, -l.sx * width, l.sy * height, width, height);
  });

  return null;
}
