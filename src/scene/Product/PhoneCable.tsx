import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BoxGeometry, CatmullRomCurve3, type Group, type Material, type Mesh, type Object3D, TubeGeometry, Vector3 } from "three";
import { sceneState } from "../state";
import { productLive } from "./motion";

const RADIUS = 0.014;
const RADIAL = 8;
const MAIN_SEGMENTS = 64;
const TAIL_SEGMENTS = 16;
/** Até `cable` = 0,7 o cabo vai da caixa à emenda; depois, as três pontas. */
const SPLIT_AT = 0.7;

interface PhoneCableProps {
  /** O grupo do produto: o cabo fica no espaço dele. */
  root: React.RefObject<Object3D | null>;
  /** A USB-A de saída, na frente da caixa (+z da âncora = para fora). */
  from: React.RefObject<Object3D | null>;
  /** O conector do celular (−y da âncora = para fora, pelo pé do celular). */
  to: React.RefObject<Object3D | null>;
  cableMaterial: Material;
  plugMaterial: Material;
}

const smooth = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

/**
 * Cabo 3 em 1 (seção 8 do brief): sai da USB-A da caixa, deita no chão e vai
 * até perto do celular, onde abre nas três pontas (USB-C, micro-USB e
 * Lightning); uma entra no celular e as outras duas ficam soltas. `cable`
 * desenha o cabo da caixa para o celular. A geometria só é refeita quando as
 * pontas mudam de lugar, nunca por quadro.
 */
export function PhoneCable({ root, from, to, cableMaterial, plugMaterial }: PhoneCableProps) {
  const group = useRef<Group>(null);
  const main = useRef<Mesh>(null);
  const parts = useRef({ tails: [] as Mesh[], plugs: [] as Mesh[] });
  const state = useRef({ key: "", geometries: [] as TubeGeometry[] });
  const v = useMemo(() => ({ a: new Vector3(), b: new Vector3(), out: new Vector3(), foot: new Vector3(), o: new Vector3() }), []);
  const plugGeometry = useMemo(
    () => ({ usbA: new BoxGeometry(0.12, 0.045, 0.1), tip: new BoxGeometry(0.034, 0.016, 0.07) }),
    [],
  );

  useLayoutEffect(
    () => () => {
      state.current.geometries.forEach((g) => g.dispose());
      plugGeometry.usbA.dispose();
      plugGeometry.tip.dispose();
    },
    [plugGeometry],
  );

  useFrame(() => {
    const product = root.current;
    const port = from.current;
    const phone = to.current;
    const g = group.current;
    const { tails, plugs } = parts.current;
    if (!product || !port || !phone || !g || !main.current) return;
    const drawn = sceneState.cable;
    g.visible = drawn > 0.001 && productLive.schematic < 0.02;
    if (!g.visible) return;

    // Pontas e direções no espaço do produto.
    product.updateWorldMatrix(true, true);
    const local = (object: Object3D, x: number, y: number, z: number, target: Vector3) =>
      product.worldToLocal(object.localToWorld(target.set(x, y, z)));
    local(port, 0, 0, 0, v.a);
    local(port, 0, 0, 1, v.out).sub(v.a).setY(0).normalize();
    local(phone, 0, 0, 0, v.b);
    local(phone, 0, -1, 0, v.foot).sub(v.b).setY(0).normalize();

    const s = state.current;
    const key = [v.a, v.b, v.out, v.foot].map((p) => `${p.x.toFixed(3)},${p.y.toFixed(3)},${p.z.toFixed(3)}`).join(" ");
    if (key !== s.key) {
      s.key = key;
      const floor = RADIUS;
      const at = (p: Vector3, dir: Vector3, d: number, y = floor) => p.clone().addScaledVector(dir, d).setY(y);
      // Emenda das três pontas, no chão, à frente do pé do celular.
      const split = at(v.b, v.foot, 0.42);
      const exit = at(v.a, v.out, 0.12, v.a.y * 0.6);
      const down = at(v.a, v.out, 0.24);
      const middle = down.clone().lerp(split, 0.5).addScaledVector(v.out, 0.15);
      const curves = [
        new CatmullRomCurve3([v.a.clone(), exit, down, middle, split], false, "centripetal"),
        // A ponta que entra no celular sobe até o conector.
        new CatmullRomCurve3([split, at(v.b, v.foot, 0.16), v.b.clone()], false, "centripetal"),
      ];
      // As outras duas abrem em leque ao lado dela, também para o celular, e
      // ficam soltas no chão.
      const toward = v.foot.clone().negate();
      for (const turn of [0.5, -0.5]) {
        const dir = toward.clone().applyAxisAngle(new Vector3(0, 1, 0), turn);
        curves.push(new CatmullRomCurve3([split, at(split, toward.clone().lerp(dir, 0.5).normalize(), 0.1), at(split, dir, 0.24)], false, "centripetal"));
      }
      s.geometries.forEach((geometry) => geometry.dispose());
      s.geometries = curves.map((curve, i) => new TubeGeometry(curve, i === 0 ? MAIN_SEGMENTS : TAIL_SEGMENTS, RADIUS, RADIAL, false));
      main.current.geometry = s.geometries[0];
      tails.forEach((tail, i) => (tail.geometry = s.geometries[i + 1]));

      // Plugues: a USB-A na caixa e as três pontas, alinhados com o fio.
      const [usbA, ...tips] = plugs;
      usbA.position.copy(v.a).addScaledVector(v.out, 0.05);
      usbA.rotation.set(0, Math.atan2(v.out.x, v.out.z), 0);
      curves.slice(1).forEach((curve, i) => {
        const end = curve.getPoint(1);
        const tangent = curve.getTangent(1);
        tips[i].position.copy(end).addScaledVector(tangent, -0.03);
        tips[i].rotation.set(0, Math.atan2(tangent.x, tangent.z), 0);
      });
    }

    const perSegment = RADIAL * 6;
    const first = smooth(drawn / SPLIT_AT);
    const second = smooth((drawn - SPLIT_AT) / (1 - SPLIT_AT));
    main.current.geometry.setDrawRange(0, Math.round(MAIN_SEGMENTS * first) * perSegment);
    tails.forEach((tail) => tail.geometry.setDrawRange(0, Math.round(TAIL_SEGMENTS * second) * perSegment));
    plugs.forEach((plug, i) => (plug.visible = i === 0 ? first > 0.01 : second > 0.98));
  });

  const keep = (list: "tails" | "plugs", i: number) => (mesh: Mesh | null) => {
    if (mesh) parts.current[list][i] = mesh;
  };

  return (
    <group ref={group} visible={false}>
      <mesh ref={main} material={cableMaterial} />
      {[0, 1, 2].map((i) => (
        <mesh key={i} ref={keep("tails", i)} material={cableMaterial} />
      ))}
      <mesh ref={keep("plugs", 0)} geometry={plugGeometry.usbA} material={plugMaterial} visible={false} />
      {[0, 1, 2].map((i) => (
        <mesh key={i} ref={keep("plugs", i + 1)} geometry={plugGeometry.tip} material={plugMaterial} visible={false} />
      ))}
    </group>
  );
}
