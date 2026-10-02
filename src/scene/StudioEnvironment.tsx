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
  // Softbox grande, acima e à frente.
  { size: [9, 4], position: [0, 7, 5], color: "#FFFFFF", intensity: 2.4 },
  // Faixa baixa à frente: o reflexo em degradê no vidro do painel em pé.
  { size: [12, 2.6], position: [-1, 2.2, 9], color: "#FFFFFF", intensity: 1.1 },
  // Softbox atrás e acima: o degradê no tampo da caixa (superfície de cima
  // reflete o que está atrás dela, na altura da câmera).
  { size: [10, 3.5], position: [0, 3.2, -8], color: "#F4F7FF", intensity: 1.5 },
  // Tiras verticais nas laterais: desenham as bordas do preto fosco.
  { size: [1.2, 9], position: [-8, 2.5, 2], color: "#FFFFFF", intensity: 3.2 },
  { size: [1.2, 9], position: [8, 2.5, 0], color: "#FFF6EA", intensity: 2.6 },
  // Preenchimento frio e fraco.
  { size: [12, 3], position: [-2, 0.5, -9], color: "#BCD3FF", intensity: 0.5 },
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
