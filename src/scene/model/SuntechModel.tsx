import { use, useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import {
  Euler,
  type Group,
  type Material,
  MeshPhysicalMaterial,
  type Mesh,
  MeshStandardMaterial,
  type Object3D,
  Quaternion,
  Vector3,
} from "three";
import { easing } from "maath";
import { sceneState } from "../state";
import { loadProductTextures, type ProductTextures } from "../textures";
import { createPhoneScreen } from "../textures/phoneScreen";
import { productUniforms } from "../uniforms";
import { quality } from "../quality";
import { createBatteryMaterial } from "./batteryMaterial";
import { createCellsMaterial } from "./cellsMaterial";
import { PhoneCable } from "./PhoneCable";
import { along, focusOpacity, MOTION, PART_FOCUS, PART_NAMES, phase, type PartName } from "./motion";
import { complete } from "../../lib/loading";
import { testHooks } from "../../lib/env";
import { useReducedMotion } from "../../lib/useReducedMotion";

export const MODEL_URL = "/models/suntech.glb";
/** O GLB carrega com o chunk da cena (CLAUDE.md). Sem Draco: o drei buscaria o decoder no gstatic. */
useGLTF.preload(MODEL_URL, false);

const RAD = Math.PI / 180;
/** Abertura da tampa: 110° para cima, na dobradiça de trás. */
const LID_OPEN = 110 * RAD;
/** O painel desliza para o centro ao abrir (a lombada vai de x = −1 para x = 0). */
const PANEL_SLIDE = 1.0;
/** Inclinação máxima pelo ponteiro, em graus. */
const TILT = { x: 5, y: 9 };

/** Ajustes por nome de material: o GLB traz o PBR básico; aqui entram o verniz e o brilho. */
const OVERRIDES: Record<string, Record<string, unknown>> = {
  case_matte: { color: "#202328", roughness: 0.5, clearcoat: 0.6, clearcoatRoughness: 0.28 },
  backsheet: { color: "#2B2F37", roughness: 0.48, clearcoat: 0.7, clearcoatRoughness: 0.25 },
  anodized: { color: "#343941", clearcoat: 0.35, clearcoatRoughness: 0.22 },
  // Metal escovado, não espelho: o USB-A e o USB-C enchem a tela nos closes e estouravam o bloom.
  steel: { roughness: 0.4, envMapIntensity: 0.9 },
  aluminum: { roughness: 0.38, envMapIntensity: 0.9 },
  gold: { envMapIntensity: 1.2 },
  led_lens: { clearcoat: 1, clearcoatRoughness: 0.05, depthWrite: false },
  glass: { clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.5, depthWrite: false },
  phone_body: { clearcoat: 0.6, clearcoatRoughness: 0.2 },
  phone_glass: { clearcoat: 1, clearcoatRoughness: 0.03 },
  pcb_charge_top: { clearcoat: 0.2, clearcoatRoughness: 0.4 },
  pcb_boost_top: { clearcoat: 0.2, clearcoatRoughness: 0.4 },
  chip: { clearcoat: 0.15, clearcoatRoughness: 0.35 },
};

/** Materiais do GLB que levam uma textura em canvas do runtime (a face de cima das placas). */
const COLOR_MAPS: Record<string, "charger" | "boost"> = {
  pcb_charge_top: "charger",
  pcb_boost_top: "boost",
};

interface RuntimeMaterial {
  name: string;
  material: Material;
  /** Opacidade própria do material (vidro, lente); a opacidade da peça multiplica. */
  baseOpacity: number;
}

interface NodeRef {
  node: Object3D;
  pos: Vector3;
  quat: Quaternion;
}

interface PartRef extends NodeRef {
  focus: 0 | 1 | 2 | 3 | 4;
  mats: RuntimeMaterial[];
}

export interface ModelRegistry {
  root: Group;
  parts: Record<PartName, PartRef>;
  panel: NodeRef;
  anchors: Record<string, Object3D>;
}

const ANCHORS = ["usb_a_mouth", "phone_connector", "grommet", "junction", "label_panel", "label_pcb_charge", "label_pcb_boost", "label_phone", "lid_top"] as const;
const isPart = (name: string): name is PartName => (PART_NAMES as readonly string[]).includes(name);

function makeMaterial(base: MeshStandardMaterial, part: PartName, textures: ProductTextures, screenMap: ProductScreen): { material: Material; baseOpacity: number } {
  const baseOpacity = base.transparent ? base.opacity : 1;
  switch (base.name) {
    case "cells":
      return { material: createCellsMaterial(textures.cells.color, textures.cells.surface, part === "panel_a" ? 0 : 1) as unknown as Material, baseOpacity };
    case "cell_wrap":
      return { material: createBatteryMaterial(textures.battery, productUniforms.uCharge) as unknown as Material, baseOpacity };
    case "phone_screen":
      return {
        material: new MeshStandardMaterial({
          name: base.name,
          color: "#05070A",
          emissive: "#FFFFFF",
          emissiveMap: screenMap.texture,
          emissiveIntensity: 0.9,
          roughness: 0.12,
          metalness: 0,
          transparent: true,
        }),
        baseOpacity,
      };
  }
  const mapKey = COLOR_MAPS[base.name];
  const material = new MeshPhysicalMaterial({
    name: base.name,
    // Com mapa de cor, o mapa manda (a cor do GLB só serve de reserva, sem mapa).
    color: mapKey ? "#FFFFFF" : base.color.clone(),
    map: mapKey ? textures[mapKey] : null,
    roughness: base.roughness,
    metalness: base.metalness,
    emissive: base.emissive.clone(),
    emissiveIntensity: base.emissiveIntensity,
    // Nasce transparente: o foco esmaece as peças, e o Warmup não pode trocar de programa depois.
    transparent: true,
    opacity: baseOpacity,
    ...OVERRIDES[base.name],
  });
  return { material, baseOpacity };
}

type ProductScreen = ReturnType<typeof createPhoneScreen>;

/** Malhas de uma peça: desce pelos filhos, mas para nas outras peças (cada uma tem as suas). */
function collectMeshes(node: Object3D, out: Mesh[] = [], top = true): Mesh[] {
  if (!top && isPart(node.name)) return out;
  if ((node as Mesh).isMesh) out.push(node as Mesh);
  for (const child of node.children) collectMeshes(child, out, false);
  return out;
}

function nodeRef(node: Object3D): NodeRef {
  return { node, pos: node.position.clone(), quat: node.quaternion.clone() };
}

function buildRegistry(source: Group, textures: ProductTextures, screen: ProductScreen): ModelRegistry {
  const root = source.clone(true);
  const parts = {} as Record<PartName, PartRef>;
  for (const name of PART_NAMES) {
    const node = root.getObjectByName(name);
    if (!node) throw new Error(`O GLB não tem a peça "${name}" (contrato de peças, CLAUDE.md)`);
    const mats: RuntimeMaterial[] = [];
    for (const mesh of collectMeshes(node)) {
      const base = mesh.material as MeshStandardMaterial;
      const made = makeMaterial(base, name, textures, screen);
      mesh.material = made.material;
      mats.push({ name: base.name, ...made });
    }
    parts[name] = { ...nodeRef(node), focus: PART_FOCUS[name] ?? 0, mats };
  }
  const panelNode = root.getObjectByName("panel");
  if (!panelNode) throw new Error('O GLB não tem o nó "panel"');
  const anchors: Record<string, Object3D> = {};
  for (const name of ANCHORS) {
    const anchor = root.getObjectByName(name);
    if (anchor) anchors[name] = anchor;
  }
  return { root, parts, panel: nodeRef(panelNode), anchors };
}

declare global {
  interface Window {
    /** Só em dev ou com `?snap`: as peças do modelo, para medir o enquadramento. */
    __model?: ModelRegistry;
  }
}

const euler = new Euler();
const quat = new Quaternion();

/** Aplica o estado do scroll às peças. Sem `damp`: o estado já é função de `scrollY`. */
function applyState(model: ModelRegistry, screen: ProductScreen) {
  const s = sceneState;
  const { parts } = model;
  const visible = s.productVisible;
  const e = s.explode;

  // Explosão: cada peça no seu trecho, partindo da pose montada.
  for (const [name, motion] of Object.entries(MOTION)) {
    const ref = name === "panel" ? model.panel : parts[name as PartName];
    if (!ref) continue;
    const p = phase(e, motion.window);
    const d = along(motion.path, p);
    ref.node.position.set(ref.pos.x + d[0], ref.pos.y + d[1], ref.pos.z + d[2]);
    if (motion.turn) {
      euler.set(motion.turn[0] * RAD * p, motion.turn[1] * RAD * p, motion.turn[2] * RAD * p);
      ref.node.quaternion.copy(ref.quat).multiply(quat.setFromEuler(euler));
    }
  }

  // Tampa: abre 110° e, ao subir na explosão, volta à horizontal.
  const lift = phase(e, MOTION.case_lid.window);
  euler.set(-LID_OPEN * s.lid * (1 - lift), 0, 0);
  parts.case_lid.node.quaternion.setFromEuler(euler);

  // Painel: a placa B gira de 180° (dobrada sobre a A) a 0° (aberta, ao lado); o conjunto desliza para o centro.
  euler.set(0, Math.PI * (1 - s.panelOpen), 0);
  parts.panel_b.node.quaternion.setFromEuler(euler);
  model.panel.node.position.x = model.panel.pos.x + PANEL_SLIDE * s.panelOpen;
  productUniforms.uGlint.value = Math.min(1, s.panelOpen / 0.55);
  productUniforms.uCharge.value = s.charge;

  // Celular: entra deslizando pela direita.
  const phone = parts.phone;
  const slide = 1 - s.phoneVisible;
  phone.node.visible = s.phoneVisible > 0.005;
  phone.node.position.set(phone.pos.x + 0.6 * slide * slide, phone.pos.y, phone.pos.z);
  screen.draw(s.phoneCharge * 100);

  // Opacidade por peça: foco (as outras a ~15%), presença do produto e a do celular.
  for (const name of PART_NAMES) {
    const part = parts[name];
    const own = name === "phone" ? s.phoneVisible : 1;
    const opacity = focusOpacity(part.focus, s.focus) * visible * own;
    for (const m of part.mats) {
      const value = m.baseOpacity * opacity;
      const material = m.material;
      if (material.opacity !== value) material.opacity = value;
      // Só o que está inteiro escreve profundidade (as fantasmas não escondem as de trás).
      const write = opacity > 0.99 && m.baseOpacity > 0.99;
      if (material.depthWrite !== write) material.depthWrite = write;
      if (m.name === "led_core") (material as MeshPhysicalMaterial).emissiveIntensity = 4 * s.ledOn;
      else if (m.name === "led_red") (material as MeshPhysicalMaterial).emissiveIntensity = 3 * Math.max(0, 1 - Math.abs(s.focus - 2));
    }
  }
}

/**
 * O Carregador Solar SunTech (GLB gerado por scripts/model): o modelo lê o `sceneState` e
 * move cada peça pelo nome (contrato de peças, CLAUDE.md). O ponteiro (ou a velocidade do
 * scroll, no toque) inclina o conjunto, na medida de `tilt`.
 */
export function SuntechModel({ rootRef }: { rootRef: React.RefObject<Group | null> }) {
  const gltf = useGLTF(MODEL_URL, false);
  const textures = use(loadProductTextures());
  const reduced = useReducedMotion();
  const screen = useMemo(() => createPhoneScreen(Math.min(512, quality.entry().textures.pcb / 2)), []);
  const model = useMemo(() => buildRegistry(gltf.scene, textures, screen), [gltf.scene, textures, screen]);
  const live = useRef({ tiltX: 0, tiltY: 0 });

  useEffect(() => {
    complete("model");
    if (testHooks) window.__model = model;
    return () => {
      model.root.traverse((o) => {
        const mesh = o as Mesh;
        if (mesh.isMesh) (mesh.material as Material).dispose();
      });
      screen.texture.dispose();
    };
  }, [model, screen]);

  useFrame((_, delta) => {
    const s = sceneState;
    const root = model.root;
    root.visible = s.productVisible > 0.002;
    if (!root.visible) return;
    const l = live.current;
    const tilt = reduced ? 0 : s.tilt;
    easing.damp(l, "tiltX", s.pointer.y * TILT.x * tilt, 0.45, delta);
    easing.damp(l, "tiltY", s.pointer.x * TILT.y * tilt, 0.45, delta);
    const pose = s.product;
    root.position.set(pose.x, pose.y, pose.z);
    root.rotation.set((pose.rx + l.tiltX) * RAD, (pose.ry + l.tiltY) * RAD, pose.rz * RAD);
    root.scale.setScalar(pose.s);
    applyState(model, screen);
  });

  return (
    <primitive ref={rootRef} object={model.root}>
      <PhoneCable model={model} />
    </primitive>
  );
}
