import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { DirectionalLight } from "three";
import { sceneState } from "./state";

/**
 * Luz do produto (receita de estúdio, docs/v3-fase-0.md): uma chave quente de cima e da
 * frente, mais duas contraluzes (fria à esquerda, quente à direita) que desenham as
 * arestas do preto fosco. A contraluz sobe com `rim` (a timeline a deixa mais forte nos
 * fundos escuros, onde o produto preto precisa dela para existir). O ambiente de
 * estúdio (StudioEnvironment) faz os reflexos.
 */
export function Lights() {
  const scene = useThree((state) => state.scene);
  const left = useRef<DirectionalLight>(null);
  const right = useRef<DirectionalLight>(null);

  useFrame(() => {
    const rim = sceneState.rim;
    if (left.current) left.current.intensity = 0.8 + 2.6 * rim;
    if (right.current) right.current.intensity = 0.6 + 2.2 * rim;
    scene.environmentIntensity = 0.95 + 0.25 * rim;
  });

  return (
    <>
      <directionalLight position={[3.5, 6, 5]} intensity={1.4} color="#FFF4E6" />
      <directionalLight ref={left} position={[-6, 3, -4]} color="#BCD3FF" />
      <directionalLight ref={right} position={[6, 2.5, -3]} color="#FFE2C2" />
    </>
  );
}
