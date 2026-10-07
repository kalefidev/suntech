import { useLayoutEffect } from "react";
import { useThree } from "@react-three/fiber";
import { Color, DoubleSide, Mesh, MeshBasicMaterial, PlaneGeometry, PMREMGenerator, Scene } from "three";
import { quality } from "./quality";

interface Lightformer {
  size: [number, number];
  position: [number, number, number];
  color: string;
  intensity: number;
}

/**
 * Receita de estúdio (docs/fase-0.md, item 6): um softbox grande acima e à
 * frente, duas tiras verticais nas laterais (desenham as bordas do preto
 * fosco) e um preenchimento frio e fraco.
 */
const LIGHTFORMERS: Lightformer[] = [
  // Softbox grande, acima e à frente: o degradê no tampo das peças deitadas.
  { size: [10, 5], position: [0, 7.5, 4], color: "#FFFFFF", intensity: 2.6 },
  // Faixa baixa à frente: o reflexo em degradê no vidro e nas faces da frente.
  { size: [12, 2.6], position: [-1, 2.2, 9], color: "#FFFFFF", intensity: 1.5 },
  // Softbox atrás e acima: o degradê no tampo da caixa (a superfície de cima
  // reflete o que está atrás dela, na altura da câmera).
  { size: [14, 5], position: [0, 3.6, -8], color: "#F4F7FF", intensity: 4.2 },
  // Softbox à frente e à esquerda: o brilho que atravessa as faces em pé (o painel dobrado) em diagonal.
  { size: [6, 9], position: [-8, 3, 7], color: "#FFFFFF", intensity: 1.9 },
  // Tiras verticais nas laterais: desenham as bordas do preto fosco.
  { size: [1.4, 9], position: [-8, 2.5, 2], color: "#FFFFFF", intensity: 4.5 },
  { size: [1.4, 9], position: [8, 2.5, 0], color: "#FFF6EA", intensity: 3.8 },
  // Chapéu: uma faixa alta e estreita, para o brilho na quina de cima das peças em pé.
  { size: [12, 0.8], position: [0, 6.2, -3], color: "#FFFFFF", intensity: 5 },
  // Preenchimento frio e fraco.
  { size: [12, 3], position: [-2, 0.5, -9], color: "#BCD3FF", intensity: 0.7 },
];

/**
 * Ambiente de estúdio próprio, renderizado uma vez em PMREM (C6: o
 * `<Environment>` do drei importa os loaders de HDR de forma estática). Só
 * reflexos: o céu de verdade é o shader do fundo.
 */
export function StudioEnvironment() {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);

  useLayoutEffect(() => {
    const studio = new Scene();
    studio.background = new Color("#0D0F13");
    const geometry = new PlaneGeometry(1, 1);
    const materials: MeshBasicMaterial[] = [];
    for (const form of LIGHTFORMERS) {
      const material = new MeshBasicMaterial({
        color: new Color(form.color).multiplyScalar(form.intensity),
        side: DoubleSide,
        toneMapped: false,
      });
      materials.push(material);
      const mesh = new Mesh(geometry, material);
      mesh.scale.set(form.size[0], form.size[1], 1);
      mesh.position.set(...form.position);
      mesh.lookAt(0, 0.6, 0);
      studio.add(mesh);
    }

    const pmrem = new PMREMGenerator(gl);
    const target = pmrem.fromScene(studio, 0.02, 0.1, 100, { size: quality.entry().envSize });
    scene.environment = target.texture;
    pmrem.dispose();
    geometry.dispose();
    materials.forEach((material) => material.dispose());

    return () => {
      scene.environment = null;
      target.dispose();
    };
  }, [gl, scene]);

  return null;
}
