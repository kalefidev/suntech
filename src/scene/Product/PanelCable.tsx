import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CatmullRomCurve3, type Material, type Mesh, type Object3D, TubeGeometry, Vector3 } from "three";
import { sceneState } from "../state";

const RADIUS = 0.017;
const SEGMENTS = 72;
const RADIAL = 8;

interface PanelCableProps {
  /** O grupo do produto: os pontos do cabo ficam no espaço dele. */
  root: React.RefObject<Object3D | null>;
  /** Saída na caixa de junção do painel. */
  from: React.RefObject<Object3D | null>;
  /** Entrada na lateral da caixa. */
  to: React.RefObject<Object3D | null>;
  material: Material;
}

/**
 * Cabo do painel até a caixa (seção 8 do brief): um tubo sobre uma curva
 * Catmull-Rom que desce da caixa de junção, deita no chão e sobe até a
 * entrada da caixa. A geometria só é refeita quando as pontas mudam de lugar
 * (o painel abrindo ou fechando), nunca por quadro. `panelCable` desenha o
 * cabo ao longo do comprimento, do painel para a caixa.
 */
export function PanelCable({ root, from, to, material }: PanelCableProps) {
  const meshRef = useRef<Mesh>(null);
  const state = useRef({ key: "", geometry: null as TubeGeometry | null });
  const a = useMemo(() => new Vector3(), []);
  const b = useMemo(() => new Vector3(), []);

  useLayoutEffect(
    () => () => {
      state.current.geometry?.dispose();
    },
    [],
  );

  useFrame(() => {
    const group = root.current;
    const start = from.current;
    const end = to.current;
    const mesh = meshRef.current;
    if (!group || !start || !end || !mesh) return;

    const drawn = sceneState.panelCable;
    mesh.visible = drawn > 0.001;
    if (!mesh.visible) return;

    group.updateWorldMatrix(true, true);
    group.worldToLocal(start.getWorldPosition(a));
    group.worldToLocal(end.getWorldPosition(b));

    const s = state.current;
    const key = `${a.x.toFixed(3)} ${a.y.toFixed(3)} ${a.z.toFixed(3)} ${b.x.toFixed(3)} ${b.y.toFixed(3)} ${b.z.toFixed(3)}`;
    if (key !== s.key) {
      s.key = key;
      // Desce atrás do painel, passa por baixo da moldura (o painel fica sobre
      // pezinhos), deita no chão e sobe até a entrada atrás da caixa.
      const floor = RADIUS;
      const curve = new CatmullRomCurve3(
        [
          a.clone(),
          new Vector3(a.x, a.y - 0.12, a.z - 0.05),
          new Vector3(a.x - 0.02, floor, a.z - 0.03),
          new Vector3((a.x + b.x) / 2, floor, (a.z + b.z) / 2),
          new Vector3(b.x, floor, b.z - 0.24),
          new Vector3(b.x, b.y * 0.55, b.z - 0.07),
          b.clone(),
        ],
        false,
        "centripetal",
      );
      s.geometry?.dispose();
      s.geometry = new TubeGeometry(curve, SEGMENTS, RADIUS, RADIAL, false);
      mesh.geometry = s.geometry;
    }
    const perSegment = RADIAL * 6;
    mesh.geometry.setDrawRange(0, Math.round(SEGMENTS * Math.min(1, drawn)) * perSegment);
  });

  return <mesh ref={meshRef} material={material} visible={false} />;
}
