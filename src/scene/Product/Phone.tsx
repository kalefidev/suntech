import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, type Group, MeshPhysicalMaterial, MeshStandardMaterial, type Object3D, PlaneGeometry } from "three";
import { easing } from "maath";
import { sceneState } from "../state";
import { createPhoneScreen } from "../textures/phoneScreen";
import { quality } from "../quality";
import { blendToNode, schematicNodes } from "../schematic";
import { roundedSlab } from "./geometry";
import { phase, productLive } from "./motion";

/** Celular comum: uns 75 × 150 × 8 mm (1 unidade = 100 mm). */
const W = 0.75;
const H = 1.5;
const T = 0.08;

/**
 * Fora do esquema, o celular fica deitado à direita da caixa, com a tela para
 * cima e o pé virado para a frente da caixa (onde o cabo 3 em 1 chega).
 */
const HOME = { position: [1.15, T / 2 + 0.005, 1.75] as const, rotation: [-Math.PI / 2, 0, -0.3] as const };

/**
 * O celular (seção 8 do brief): corpo de cantos arredondados e tela escura
 * com reflexo. A tela é uma `CanvasTexture` com a bateria e a porcentagem,
 * redesenhada só quando o número inteiro muda. No esquema de "Como funciona",
 * é o nó 7; em "A energia fica", carrega pelo cabo 3 em 1.
 */
export function Phone({ connector }: { connector: React.RefObject<Object3D | null> }) {
  const group = useRef<Group>(null);
  const live = useRef({ visible: sceneState.phoneVisible, charge: sceneState.phoneCharge });

  const parts = useMemo(() => {
    const screen = createPhoneScreen(Math.min(512, quality.entry().textures.pcb / 2));
    return {
      screen,
      body: roundedSlab({ width: W, depth: H, height: T, radius: 0.09, bevel: 0.012 })
        .rotateX(Math.PI / 2)
        .translate(0, 0, -T / 2),
      glass: new PlaneGeometry(W - 0.07, H - 0.07),
      bodyMaterial: new MeshPhysicalMaterial({
        color: "#1B1E24",
        roughness: 0.38,
        metalness: 0.25,
        clearcoat: 0.6,
        clearcoatRoughness: 0.2,
        transparent: true,
      }),
      screenMaterial: new MeshStandardMaterial({
        color: new Color("#05070A"),
        emissive: new Color("#FFFFFF"),
        emissiveMap: screen.texture,
        emissiveIntensity: 0.9,
        roughness: 0.12,
        metalness: 0,
        transparent: true,
      }),
    };
  }, []);

  useLayoutEffect(
    () => () => {
      parts.screen.texture.dispose();
      parts.body.dispose();
      parts.glass.dispose();
      parts.bodyMaterial.dispose();
      parts.screenMaterial.dispose();
    },
    [parts],
  );

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const l = live.current;
    easing.damp(l, "visible", sceneState.phoneVisible, 0.2, delta);
    easing.damp(l, "charge", sceneState.phoneCharge, 0.2, delta);
    g.visible = l.visible > 0.01;
    if (!g.visible) return;
    // Chega e sai em fade. Os materiais são sempre transparentes: ligar e
    // desligar `transparent` troca o programa do shader (compilação no meio
    // da cena).
    parts.bodyMaterial.opacity = parts.screenMaterial.opacity = Math.min(1, l.visible);
    g.position.set(...HOME.position);
    g.rotation.set(...HOME.rotation);
    // Chega crescendo um pouco (nada surge do zero).
    g.scale.setScalar(0.9 + 0.1 * Math.min(1, l.visible));
    if (productLive.schematic > 0) {
      const node = schematicNodes().phone;
      blendToNode(g, node, phase(productLive.schematic, node.window));
    }
    parts.screen.draw(l.charge * 100);
  });

  return (
    <group ref={group} visible={false}>
      <mesh geometry={parts.body} material={parts.bodyMaterial} />
      <mesh geometry={parts.glass} material={parts.screenMaterial} position-z={T / 2 + 0.002} />
      {/* Conector no pé do celular (o cabo 3 em 1 chega por aqui). */}
      <object3D ref={connector} position-y={-H / 2} />
    </group>
  );
}
