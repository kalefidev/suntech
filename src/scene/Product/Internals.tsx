import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BoxGeometry,
  CatmullRomCurve3,
  CylinderGeometry,
  type Group,
  type Material,
  MeshStandardMaterial,
  TubeGeometry,
  Vector3,
} from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { Materials } from "../materials";
import type { ProductTextures } from "../textures";
import { productUniforms } from "../uniforms";
import { createBatteryMaterial } from "./batteryMaterial";
import { roundedSlab } from "./geometry";
import type { ProductDimensions } from "./dimensions";
import { applyMotion, MOTION, phase, productLive } from "./motion";
import { CalloutAnchor } from "../Callouts";
import { blendToNode, schematicNodes } from "../schematic";

type V3 = readonly [number, number, number];

/** Feixe de fios: cada caminho é uma lista de pontos no espaço da caixa. */
const RED_WIRES: V3[][] = [
  // Entrada do painel até o diodo, e do diodo à entrada (IN+) do controlador.
  [[0.45, 0.155, -0.47], [0.445, 0.08, -0.43], [0.43, 0.09, -0.37]],
  [[0.43, 0.09, -0.29], [0.34, 0.07, -0.08], [0.28, 0.08, 0.2], [0.17, 0.15, 0.42]],
  // Bateria (B+) e saída (OUT+) do controlador, pela chave, até o conversor.
  [[0.17, 0.15, 0.22], [0.06, 0.08, 0.06], [-0.0, 0.11, -0.12], [-0.01, 0.13, -0.18]],
  [[0.15, 0.15, 0.24], [0.0, 0.12, 0.36], [-0.21, 0.16, 0.43], [-0.05, 0.13, 0.4], [0.3, 0.16, 0.27], [0.43, 0.18, 0.25]],
  // LED azul de saída.
  [[0.33, 0.18, 0.28], [0.0, 0.15, 0.4], [-0.48, 0.17, 0.44]],
];

const BLACK_WIRES: V3[][] = [
  [[0.455, 0.15, -0.47], [0.47, 0.07, -0.4], [0.33, 0.065, 0.1], [0.07, 0.15, 0.42]],
  [[0.07, 0.15, 0.22], [-0.05, 0.07, 0.05], [-0.4, 0.065, 0.12], [-0.6, 0.08, -0.05], [-0.64, 0.11, -0.18]],
  [[0.1, 0.15, 0.24], [0.25, 0.1, 0.3], [0.38, 0.18, 0.25]],
  [[0.34, 0.18, 0.3], [0.0, 0.14, 0.42], [-0.47, 0.16, 0.45]],
];

function wireGeometry(paths: V3[][], radius: number) {
  return mergeGeometries(
    paths.map(
      (points) =>
        new TubeGeometry(
          new CatmullRomCurve3(points.map((p) => new Vector3(...p)), false, "centripetal"),
          Math.max(24, points.length * 14),
          radius,
          6,
          false,
        ),
    ),
  );
}

interface InternalsProps {
  dims: ProductDimensions;
  materials: Materials;
  textures: ProductTextures;
}

/**
 * Interior da caixa (seção 8 do brief): bateria 2× 18650 no suporte, placa do
 * controlador TP4056 + DW01, conversor boost com a USB-A, diodo 1N5819 e a
 * fiação vermelha e preta. As placas ficam sobre postes, para os conectores
 * baterem com as portas da frente. Só existe na tela com a tampa aberta ou na
 * vista explodida. Espaço da caixa: origem no chão, frente em +z.
 */
export function Internals({ dims, materials, textures }: InternalsProps) {
  const c = dims.case;
  const floorY = c.feet + c.wall;
  const portY = c.feet + c.body * 0.5;
  const root = useRef<Group>(null);
  const charger = useRef<Group>(null);
  const diode = useRef<Group>(null);
  const boost = useRef<Group>(null);
  const wires = useRef<Group>(null);
  const battery = useRef<Group>(null);

  // Placas: os conectores ficam na altura das portas da frente.
  const chargerBase = useMemo(() => ({ position: [c.length * 0.08, portY - 0.032, c.width / 2 - 0.175] as V3, rotation: [0, Math.PI / 2, 0] as V3 }), [c, portY]);
  const boostBase = useMemo(() => ({ position: [c.length * 0.27, portY - 0.0485, c.width / 2 - 0.15] as V3, rotation: [0, Math.PI / 2, 0] as V3 }), [c, portY]);
  const diodeBase = useMemo(() => ({ position: [0.43, floorY + 0.04, -0.33] as V3 }), [floorY]);
  const batteryBase = useMemo(() => ({ position: [-0.32, floorY, -0.18] as V3 }), [floorY]);
  const wiresBase = useMemo(() => ({ position: [0, 0, 0] as V3 }), []);

  const parts = useMemo(() => {
    const pcbEdge = (color: string) => new MeshStandardMaterial({ color, roughness: 0.55 });
    const chargerTop = new MeshStandardMaterial({ map: textures.charger, roughness: 0.5, metalness: 0.1 });
    const boostTop = new MeshStandardMaterial({ map: textures.boost, roughness: 0.5, metalness: 0.1 });
    const chargerEdge = pcbEdge("#173F75");
    const boostEdge = pcbEdge("#15181C");
    const batteryMaterial = createBatteryMaterial(textures.battery, productUniforms.uCharge);
    const posts = (height: number, w: number, d: number) =>
      mergeGeometries(
        [-1, 1].flatMap((sx) =>
          [-1, 1].map((sz) => new CylinderGeometry(0.008, 0.008, height, 8).translate(sx * w, -height / 2, sz * d)),
        ),
      );

    return {
      materials: { chargerTop, boostTop, chargerEdge, boostEdge, batteryMaterial },
      geometries: {
        chargerBoard: new BoxGeometry(0.26, 0.016, 0.17),
        chargerPosts: posts(portY - 0.032 - floorY - 0.008, 0.11, 0.065),
        usbC: new BoxGeometry(0.075, 0.032, 0.09).translate(-0.135, 0.024, 0),
        chipBig: new BoxGeometry(0.05, 0.014, 0.042).translate(-0.02, 0.015, 0),
        chipSmall: mergeGeometries([
          new BoxGeometry(0.03, 0.012, 0.025).translate(0.07, 0.014, 0.04),
          new BoxGeometry(0.04, 0.012, 0.03).translate(0.07, 0.014, -0.035),
        ]),
        boostBoard: new BoxGeometry(0.22, 0.016, 0.16),
        boostPosts: posts(portY - 0.0485 - floorY - 0.008, 0.09, 0.06),
        usbA: new BoxGeometry(0.13, 0.065, 0.14).translate(-0.07, 0.0405, 0),
        inductor: new BoxGeometry(0.06, 0.04, 0.06).translate(0.06, 0.028, 0.035),
        tray: roundedSlab({ width: 0.72, depth: 0.42, height: 0.07, radius: 0.02, bevel: 0.003, hole: { width: 0.68, depth: 0.38, radius: 0.008 } }),
        trayBase: new BoxGeometry(0.72, 0.01, 0.42).translate(0, 0.005, 0),
        cell: new CylinderGeometry(0.09, 0.09, 0.62, 40).rotateZ(-Math.PI / 2),
        terminals: mergeGeometries(
          [-0.096, 0.096].flatMap((z) => [
            new CylinderGeometry(0.034, 0.034, 0.014, 20).rotateZ(-Math.PI / 2).translate(0.317, 0.1, z),
            new CylinderGeometry(0.08, 0.08, 0.004, 28).rotateZ(-Math.PI / 2).translate(-0.312, 0.1, z),
          ]),
        ),
        diodeBody: new CylinderGeometry(0.011, 0.011, 0.052, 16).rotateX(Math.PI / 2),
        diodeBand: new CylinderGeometry(0.0118, 0.0118, 0.008, 16).rotateX(Math.PI / 2).translate(0, 0, 0.02),
        diodeLeads: mergeGeometries([
          new CylinderGeometry(0.0025, 0.0025, 0.05, 6).rotateX(Math.PI / 2).translate(0, 0, 0.05),
          new CylinderGeometry(0.0025, 0.0025, 0.05, 6).rotateX(Math.PI / 2).translate(0, 0, -0.05),
        ]),
        red: wireGeometry(RED_WIRES, 0.0085),
        black: wireGeometry(BLACK_WIRES, 0.0085),
      },
    };
  }, [textures, floorY, portY]);

  useLayoutEffect(
    () => () => {
      Object.values(parts.geometries).forEach((g) => g.dispose());
      Object.values(parts.materials).forEach((m) => m.dispose());
    },
    [parts],
  );

  const wireMaterials = useMemo(
    () => ({
      red: new MeshStandardMaterial({ color: "#B4261E", roughness: 0.45 }),
      black: new MeshStandardMaterial({ color: "#17181B", roughness: 0.5 }),
    }),
    [],
  );
  useLayoutEffect(() => () => Object.values(wireMaterials).forEach((m: Material) => m.dispose()), [wireMaterials]);

  useFrame(() => {
    const group = root.current;
    if (!group) return;
    // Só renderiza com a caixa aberta (seção 9 do brief).
    group.visible = productLive.lidOpen > 0.01 || productLive.explode > 0.001;
    if (!group.visible) return;
    const e = productLive.explode;
    const s = productLive.schematic;
    const nodes = schematicNodes();
    // Da vista explodida para o esquema (Como funciona), peça por peça.
    const move = (ref: React.RefObject<Group | null>, base: { position: V3; rotation?: V3 }, motion: (typeof MOTION)[keyof typeof MOTION], node?: keyof typeof nodes) => {
      const object = ref.current;
      if (!object) return;
      applyMotion(object, base, motion, e);
      if (node && s > 0) blendToNode(object, nodes[node], phase(s, nodes[node].window));
    };
    move(charger, chargerBase, MOTION.charger, "charger");
    move(diode, diodeBase, MOTION.diode, "diode");
    move(boost, boostBase, MOTION.boost, "boost");
    move(battery, batteryBase, MOTION.battery, "battery");
    move(wires, wiresBase, MOTION.wires);
    // A fiação da caixa dá lugar aos fios de fluxo do esquema.
    if (wires.current) wires.current.visible = s < 0.15;
  });

  const g = parts.geometries;
  const m = parts.materials;
  const chargerFaces = [m.chargerEdge, m.chargerEdge, m.chargerTop, m.chargerEdge, m.chargerEdge, m.chargerEdge];
  const boostFaces = [m.boostEdge, m.boostEdge, m.boostTop, m.boostEdge, m.boostEdge, m.boostEdge];

  return (
    <group ref={root} visible={false}>
      <group ref={battery} position={batteryBase.position}>
        <mesh geometry={g.tray} material={materials.plastic} />
        <mesh geometry={g.trayBase} material={materials.plastic} />
        <mesh geometry={g.cell} material={m.batteryMaterial} position={[0, 0.1, 0.096]} />
        <mesh geometry={g.cell} material={m.batteryMaterial} position={[0, 0.1, -0.096]} />
        <mesh geometry={g.terminals} material={materials.steel} />
        <CalloutAnchor id="bateria" position={[0.12, 0.2, 0]} />
      </group>

      <group ref={charger} position={chargerBase.position} rotation={chargerBase.rotation}>
        <mesh geometry={g.chargerBoard} material={chargerFaces} />
        <mesh geometry={g.chargerPosts} material={materials.steel} />
        <mesh geometry={g.usbC} material={materials.steel} />
        <mesh geometry={g.chipBig} material={materials.plastic} />
        <mesh geometry={g.chipSmall} material={materials.plastic} />
        <CalloutAnchor id="modulos" position={[0.02, 0.05, 0]} />
      </group>

      <group ref={boost} position={boostBase.position} rotation={boostBase.rotation}>
        <mesh geometry={g.boostBoard} material={boostFaces} />
        <mesh geometry={g.boostPosts} material={materials.steel} />
        <mesh geometry={g.usbA} material={materials.steel} />
        <mesh geometry={g.inductor} material={materials.plastic} />
      </group>

      <group ref={diode} position={diodeBase.position}>
        <mesh geometry={g.diodeBody} material={materials.plastic} />
        <mesh geometry={g.diodeBand} material={materials.steel} />
        <mesh geometry={g.diodeLeads} material={materials.steel} />
      </group>

      <group ref={wires}>
        <mesh geometry={g.red} material={wireMaterials.red} />
        <mesh geometry={g.black} material={wireMaterials.black} />
        <CalloutAnchor id="fiacao" position={[-0.25, 0.12, 0.25]} />
      </group>
    </group>
  );
}
