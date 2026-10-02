import { Matrix4, type Object3D, Quaternion, Vector3 } from "three";
import { SCHEMATIC, SCHEMATIC_NODES, type SchematicNode } from "./choreography";
import { productDimensions } from "./Product/dimensions";
import { WIDE } from "../lib/env";

/**
 * Onde cada peça fica no esquema de "Como funciona": posição, orientação e
 * tamanho no espaço do mundo, de frente para a câmera do esquema
 * (choreography.ts). Cada peça sai da vista explodida e chega aqui no seu
 * trecho de `schematic`, com atraso pela ordem do caminho da energia.
 */
export interface NodeTarget {
  id: SchematicNode;
  /** Para onde vai a origem da peça. */
  position: Vector3;
  /** O meio da peça, sobre a linha do esquema (fios e etiquetas partem daqui). */
  center: Vector3;
  quaternion: Quaternion;
  scale: number;
  /** Trecho de `schematic` (0 a 1) em que a peça viaja até o nó. */
  window: readonly [number, number];
}

type Facing = "front" | "top" | "axis";

/**
 * Como cada peça encara a câmera e o tamanho dela no esquema: o painel, a
 * frente da caixa e o celular mostram a frente; as placas e a bateria, o lado
 * de cima; o diodo, o eixo deitado. As peças pequenas crescem para serem
 * lidas na linha; o painel encolhe para a linha caber ao lado do texto.
 */
const STYLE: Record<SchematicNode, { facing: Facing; scale: number }> = {
  panel: { facing: "front", scale: 0.34 },
  diode: { facing: "axis", scale: 3.4 },
  charger: { facing: "top", scale: 2.6 },
  battery: { facing: "top", scale: 1.3 },
  boost: { facing: "top", scale: 2.4 },
  output: { facing: "front", scale: 0.65 },
  phone: { facing: "front", scale: 0.62 },
};

/**
 * Meia largura e meia altura de cada peça na tela, já no tamanho do esquema
 * (unidades da cena). Medidas com `scripts/dev/nodes.mjs`; dão o vão entre as
 * peças, a ponta dos fios e o lugar das etiquetas.
 */
export const EXTENT: Record<SchematicNode, readonly [number, number]> = {
  panel: [0.67, 0.27],
  diode: [0.26, 0.04],
  charger: [0.4, 0.23],
  battery: [0.47, 0.28],
  boost: [0.3, 0.2],
  output: [0.49, 0.1],
  phone: [0.23, 0.47],
};

/** A etapa de cada peça (seção 7 do brief): as peças de uma etapa ficam juntas. */
export const NODE_STEP: Record<SchematicNode, 1 | 2 | 3 | 4> = {
  panel: 1,
  diode: 2,
  charger: 2,
  battery: 3,
  boost: 4,
  output: 4,
  phone: 4,
};

const DEG = Math.PI / 180;

function frame() {
  const az = SCHEMATIC.azimuth * DEG;
  const el = SCHEMATIC.elevation * DEG;
  const toCamera = new Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)).normalize();
  const right = new Vector3(0, 1, 0).cross(toCamera).normalize();
  const up = toCamera.clone().cross(right).normalize();
  return { toCamera, right, up };
}

function orientation(facing: Facing): Quaternion {
  const { toCamera, right, up } = frame();
  const basis = new Matrix4();
  if (facing === "front") basis.makeBasis(right, up, toCamera);
  else if (facing === "top") basis.makeBasis(right, toCamera, right.clone().cross(toCamera));
  else basis.makeBasis(toCamera.clone().negate(), up, right);
  return new Quaternion().setFromRotationMatrix(basis);
}

/**
 * O meio de cada peça no espaço dela: o painel e a frente da caixa têm a
 * origem no chão; as outras peças, no meio.
 */
function pivot(id: SchematicNode): Vector3 {
  const { plate, case: c } = productDimensions();
  if (id === "panel") return new Vector3(0, plate.width / 2, 0);
  if (id === "output") return new Vector3(0, c.feet + c.body / 2, 0);
  return new Vector3();
}

let cache: { narrow: boolean; nodes: Record<SchematicNode, NodeTarget> } | null = null;

/**
 * Os nós do esquema para o layout atual: no desktop, uma linha da esquerda
 * para a direita; no celular, uma coluna de cima para baixo. A linha toda é
 * centrada no alvo da câmera.
 */
export function schematicNodes(): Record<SchematicNode, NodeTarget> {
  const narrow = typeof window !== "undefined" && !window.matchMedia(WIDE).matches;
  if (cache && cache.narrow === narrow) return cache.nodes;
  const { right, up } = frame();
  const axis = narrow ? up.clone().negate() : right;
  const { gaps } = narrow ? SCHEMATIC.narrow : SCHEMATIC.wide;
  const half = (id: SchematicNode) => EXTENT[id][narrow ? 1 : 0];

  // Posição de cada meio ao longo da linha, com o vão certo entre as peças.
  const along: number[] = [];
  SCHEMATIC_NODES.forEach((id, i) => {
    const previous = SCHEMATIC_NODES[i - 1];
    along.push(i === 0 ? 0 : along[i - 1] + half(previous) + (NODE_STEP[id] === NODE_STEP[previous] ? gaps.inner : gaps.step) + half(id));
  });
  const last = SCHEMATIC_NODES.length - 1;
  const middle = (along[0] - half(SCHEMATIC_NODES[0]) + along[last] + half(SCHEMATIC_NODES[last])) / 2;

  const target = new Vector3(...SCHEMATIC.target);
  const nodes = {} as Record<SchematicNode, NodeTarget>;
  SCHEMATIC_NODES.forEach((id, i) => {
    const style = STYLE[id];
    const quaternion = orientation(style.facing);
    const center = target.clone().addScaledVector(axis, along[i] - middle);
    nodes[id] = {
      id,
      center,
      position: center.clone().sub(pivot(id).applyQuaternion(quaternion).multiplyScalar(style.scale)),
      quaternion,
      scale: style.scale,
      window: [Math.min(0.5, i * 0.08), Math.min(1, 0.5 + i * 0.08)],
    };
  });
  cache = { narrow, nodes };
  return nodes;
}

const world = new Matrix4();
const inverse = new Matrix4();
const position = new Vector3();
const quaternion = new Quaternion();
const scale = new Vector3();
const nodeScale = new Vector3();

/**
 * Leva uma peça da pose atual (a explodida, já aplicada no local) até o nó,
 * na proporção `t`, em espaço de mundo; depois devolve ao espaço do pai. Assim
 * a cadeia de grupos acima da peça não importa.
 */
export function blendToNode(object: Object3D, node: NodeTarget, t: number): void {
  if (t <= 0 || !object.parent) return;
  // Marca a peça (os scripts de enquadramento acham os nós por aqui).
  object.userData.node = node.id;
  object.parent.updateWorldMatrix(true, false);
  object.updateMatrix();
  world.multiplyMatrices(object.parent.matrixWorld, object.matrix).decompose(position, quaternion, scale);
  position.lerp(node.position, t);
  quaternion.slerp(node.quaternion, t);
  scale.lerp(nodeScale.setScalar(node.scale), t);
  world.compose(position, quaternion, scale);
  inverse.copy(object.parent.matrixWorld).invert();
  world.premultiply(inverse).decompose(object.position, object.quaternion, object.scale);
}
