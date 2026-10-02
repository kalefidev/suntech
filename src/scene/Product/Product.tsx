import { use, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { type Group, MathUtils, type Object3D } from "three";
import { easing } from "maath";
import { sceneState, type Pose } from "../state";
import { createMaterials } from "../materials";
import { loadProductTextures } from "../textures";
import { ContactShadow } from "../ContactShadow";
import { useReducedMotion } from "../../lib/useReducedMotion";
import { productDimensions } from "./dimensions";
import { Panel, PANEL_LIFT } from "./Panel";
import { Case } from "./Case";
import { PanelCable } from "./PanelCable";

const POSE_KEYS = ["x", "y", "z", "rx", "ry", "rz", "s"] as const satisfies ReadonlyArray<keyof Pose>;

/** Montagem de herói: o painel em pé atrás, a caixa na frente dele, ligados pelo cabo. */
const PANEL_AT = [-0.2, PANEL_LIFT, -0.6] as const;
const CASE_AT = [-0.4, 0, 1.3] as const;
const CASE_TURN = 0.3;

/** Inclinação máxima pelo ponteiro, em graus. */
const TILT = { x: 5, y: 9 };

/**
 * O Carregador Solar SunTech (seção 8 do brief): painel dobrável, caixa e o
 * cabo entre eles, parametrizados pelo `product.ts`. Lê a pose e a presença
 * do `sceneState` e aplica com damping; o ponteiro (ou a velocidade do
 * scroll, no toque) inclina o conjunto, na medida de `tilt`.
 */
export function Product() {
  const textures = use(loadProductTextures());
  const materials = useMemo(() => createMaterials(textures), [textures]);
  const dims = useMemo(() => productDimensions(), []);
  const reduced = useReducedMotion();

  const group = useRef<Group>(null);
  const panelAnchor = useRef<Object3D>(null);
  const caseAnchor = useRef<Object3D>(null);
  const live = useRef({ ...sceneState.product, visible: sceneState.productVisible, tiltX: 0, tiltY: 0 });

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const pose = sceneState.product;
    const l = live.current;
    for (const key of POSE_KEYS) {
      if (reduced) l[key] = pose[key];
      else easing.damp(l, key, pose[key], 0.3, delta);
    }
    easing.damp(l, "visible", sceneState.productVisible, 0.3, delta);
    const tilt = reduced ? 0 : sceneState.tilt;
    easing.damp(l, "tiltX", sceneState.pointer.y * TILT.x * tilt, 0.45, delta);
    easing.damp(l, "tiltY", sceneState.pointer.x * TILT.y * tilt, 0.45, delta);

    g.position.set(l.x, l.y, l.z);
    g.rotation.set(MathUtils.degToRad(l.rx + l.tiltX), MathUtils.degToRad(l.ry + l.tiltY), MathUtils.degToRad(l.rz));
    g.scale.setScalar(l.s);
    // Fora de cena, nada renderiza (seção 9 do brief).
    g.visible = l.visible > 0.01;
  });

  return (
    <group ref={group}>
      <group position={PANEL_AT}>
        <Panel dims={dims} materials={materials} textures={textures} cableAnchor={panelAnchor} />
      </group>
      <group position={CASE_AT} rotation-y={CASE_TURN}>
        <Case dims={dims} materials={materials} cableAnchor={caseAnchor} />
      </group>
      <PanelCable root={group} from={panelAnchor} to={caseAnchor} material={materials.cable} />
      <group position={[-0.2, 0, 0.6]}>
        <ContactShadow subject={group} width={5.4} depth={3.6} />
      </group>
    </group>
  );
}
