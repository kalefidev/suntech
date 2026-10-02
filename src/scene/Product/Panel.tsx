import { forwardRef, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BoxGeometry, CylinderGeometry, type Group, type Mesh, MeshPhysicalMaterial, type Object3D, PlaneGeometry } from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { sceneState } from "../state";
import { productUniforms } from "../uniforms";
import type { Materials } from "../materials";
import type { ProductTextures } from "../textures";
import { createCellsMaterial } from "./cellsMaterial";
import { roundedSlab } from "./geometry";
import type { ProductDimensions } from "./dimensions";
import { MOTION, phase, productLive } from "./motion";
import { CalloutAnchor } from "../Callouts";
import { blendToNode, schematicNodes } from "../schematic";

/** Abertura do "livro" com o painel aberto: cada placa vira 14° para a frente. */
const OPEN_V = (14 * Math.PI) / 180;

/** Altura dos pezinhos de borracha: o painel fica 4 mm acima do chão. */
export const PANEL_LIFT = 0.04;

interface PanelProps {
  dims: ProductDimensions;
  materials: Materials;
  textures: ProductTextures;
  /** Ponto de saída do cabo, na caixa de junção (o cabo lê a posição dele). */
  cableAnchor: React.RefObject<Object3D | null>;
}

/**
 * Painel dobrável (seção 8 do brief): duas placas unidas pela lombada, que
 * abrem como um livro em pé. A lombada fica na vertical, em x = 0; as células
 * olham para +z. Fechado, a placa B dobra por cima da A, célula contra célula.
 * `panelOpen` vai de 0 (fechado) a 1 (aberto, com as placas em V).
 */
export const Panel = forwardRef<Group, PanelProps>(function Panel({ dims, materials, textures, cableAnchor }, ref) {
  const root = useRef<Group>(null);
  const { length: L, width: H, thickness: T, frame: F } = dims.plate;
  const plateA = useRef<Group>(null);
  const plateB = useRef<Group>(null);
  const layers = useRef<{ cells: Mesh[]; glass: Mesh[] }>({ cells: [], glass: [] });
  const cellsZ = -T * 0.35;

  const parts = useMemo(() => {
    const frameGeometry = (side: 1 | -1) =>
      roundedSlab({
        width: L,
        depth: H,
        height: T,
        radius: 0.012,
        bevel: 0.0015,
        hole: { width: L - 2 * F, depth: H - 2 * F, radius: 0.004 },
      })
        .rotateX(Math.PI / 2)
        .translate((side * L) / 2, H / 2, -T);
    // As células ficam na origem em z (a posição em z é da explosão).
    const cells = (side: 1 | -1) => new PlaneGeometry(L - 2 * F, H - 2 * F).translate((side * L) / 2, H / 2, 0);
    // Fundo da placa, virado para trás; os cantos ficam escondidos pela moldura.
    const back = (side: 1 | -1) =>
      new PlaneGeometry(L - 2 * F + 0.004, H - 2 * F + 0.004).rotateY(Math.PI).translate((side * L) / 2, H / 2, -T + 0.0008);
    const hinge = mergeGeometries([
      new CylinderGeometry(0.02, 0.02, H * 0.22, 16).translate(0, H * 0.2, 0),
      new CylinderGeometry(0.02, 0.02, H * 0.22, 16).translate(0, H * 0.8, 0),
    ]);
    // Pezinhos de borracha na moldura de baixo: o painel fica um pouco acima
    // do chão e o cabo passa por baixo dele.
    const pads = (side: 1 | -1) =>
      mergeGeometries(
        [0.16, L - 0.16].map((x) => new BoxGeometry(0.09, PANEL_LIFT, T * 1.1).translate(side * x, -PANEL_LIFT / 2, -T / 2)),
      );
    return {
      frameA: frameGeometry(-1),
      frameB: frameGeometry(1),
      cellsA: cells(-1),
      cellsB: cells(1),
      backA: back(-1),
      backB: back(1),
      hinge,
      padsA: pads(-1),
      padsB: pads(1),
      cellsMaterialA: createCellsMaterial(textures.cells.color, textures.cells.surface, 0),
      cellsMaterialB: createCellsMaterial(textures.cells.color, textures.cells.surface, 1),
      // Vidro solto, só na vista explodida (montado, o vidro é o clearcoat das células).
      glass: new BoxGeometry(L - 2 * F, H - 2 * F, 0.004),
      glassMaterial: new MeshPhysicalMaterial({
        color: "#FFFFFF",
        roughness: 0.04,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.03,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        envMapIntensity: 1.5,
      }),
    };
  }, [L, H, T, F, textures]);

  useLayoutEffect(
    () => () => {
      Object.values(parts).forEach((part) => part.dispose());
    },
    [parts],
  );

  useFrame(() => {
    const a = plateA.current;
    const b = plateB.current;
    if (!a || !b) return;
    const open = productLive.panelOpen;
    a.rotation.y = OPEN_V * open;
    b.rotation.y = a.rotation.y - Math.PI + (Math.PI - 2 * OPEN_V) * open;
    productUniforms.uGlint.value = sceneState.glint;

    // Vista explodida: o vidro sai na frente, as células vêm atrás dele, e a
    // camada de vidro das células (clearcoat) vai embora junto. No esquema, o
    // painel volta a ser um só, a caminho do nó.
    const e = productLive.explode * (1 - phase(productLive.schematic, schematicNodes().panel.window));
    const glass = phase(e, MOTION.glass.window);
    const cells = phase(e, MOTION.cells.window);
    for (const mesh of layers.current.cells) mesh.position.z = cellsZ + MOTION.cells.offset[2] * cells;
    for (const mesh of layers.current.glass) {
      mesh.visible = glass > 0.001;
      mesh.position.z = cellsZ + 0.004 + MOTION.glass.offset[2] * glass;
    }
    parts.glassMaterial.opacity = 0.18 * Math.min(1, glass * 3);

    // No esquema, o painel inteiro (reduzido) vira o nó 1.
    const group = root.current;
    if (group) {
      group.position.set(0, 0, 0);
      group.rotation.set(0, 0, 0);
      group.scale.setScalar(1);
      if (productLive.schematic > 0) {
        const node = schematicNodes().panel;
        blendToNode(group, node, phase(productLive.schematic, node.window));
      }
    }
    // O CSM estende o MeshPhysicalMaterial (o tipo dele não mostra o clearcoat).
    const coat = 1 - 0.85 * glass;
    (parts.cellsMaterialA as unknown as MeshPhysicalMaterial).clearcoat = coat;
    (parts.cellsMaterialB as unknown as MeshPhysicalMaterial).clearcoat = coat;
  });

  const keep = (list: "cells" | "glass", index: number) => (mesh: Mesh | null) => {
    if (mesh) layers.current[list][index] = mesh;
  };

  return (
    <group
      ref={(group) => {
        root.current = group;
        if (typeof ref === "function") ref(group);
        else if (ref) ref.current = group;
      }}
    >
      <mesh geometry={parts.hinge} material={materials.anodized} />
      <group ref={plateA}>
        <mesh geometry={parts.frameA} material={materials.anodized} />
        <mesh ref={keep("cells", 0)} geometry={parts.cellsA} material={parts.cellsMaterialA} position-z={cellsZ} />
        <mesh ref={keep("glass", 0)} geometry={parts.glass} material={parts.glassMaterial} position-x={-L / 2} position-y={H / 2} visible={false} />
        <mesh geometry={parts.backA} material={materials.backsheet} />
        <mesh geometry={parts.padsA} material={materials.rubber} />
      </group>
      <group ref={plateB}>
        <mesh geometry={parts.frameB} material={materials.anodized} />
        <mesh ref={keep("cells", 1)} geometry={parts.cellsB} material={parts.cellsMaterialB} position-z={cellsZ}>
          <CalloutAnchor id="celulas" position={[L * 0.42, H * 0.5, 0.003]} />
        </mesh>
        <mesh ref={keep("glass", 1)} geometry={parts.glass} material={parts.glassMaterial} position-x={L / 2} position-y={H / 2} visible={false}>
          <CalloutAnchor id="vidro" position={[L * 0.18, H * 0.38, 0.003]} />
        </mesh>
        <CalloutAnchor id="base" position={[L * 0.86, H * 0.12, -T * 0.5]} />
        <mesh geometry={parts.backB} material={materials.backsheet} />
        <mesh geometry={parts.padsB} material={materials.rubber} />
        {/* Caixa de junção atrás da placa B, perto do canto de baixo; o cabo sai por baixo. */}
        <group position={[L - 0.36, 0.3, -T - 0.019]}>
          <mesh material={materials.plastic}>
            <boxGeometry args={[0.24, 0.16, 0.038]} />
          </mesh>
          <object3D ref={cableAnchor} position={[0.06, -0.08, 0]} />
        </group>
      </group>
    </group>
  );
});
