import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { CatmullRomCurve3, type Group, type Material, MeshStandardMaterial, type Mesh, type Object3D, TubeGeometry, Vector3 } from "three";
import { sceneState } from "../state";
import { createFlowMaterial } from "./flowMaterial";
import type { ModelRegistry } from "./SuntechModel";
import { useReducedMotion } from "../../lib/useReducedMotion";

/** Cor da energia na saída de 5 V (DESIGN.md): luz dentro do fio, sempre com legenda no DOM. */
const SAIDA = "#4CC9F0";
const RADIUS = 0.014;
const RADIAL = 8;
const MAIN_SEGMENTS = 96;
const TAIL_SEGMENTS = 14;
/** Até `cable` = 0,72 o cabo vai da caixa à emenda; depois, as pontas. */
const SPLIT_AT = 0.72;

const smooth = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

/**
 * Cabo 3 em 1: sai da USB-A da caixa, deita no chão e vai até o celular, que paira em pé ao
 * lado dela; perto do celular o cabo se abre em três pontas (USB-C, micro-USB e Lightning):
 * uma sobe e entra no celular por baixo, e as outras duas ficam soltas no chão. `cable` desenha
 * o cabo da caixa ao celular, e pulsos azuis (a saída de 5 V) correm pelo fio. A geometria só
 * é refeita quando as pontas mudam de lugar, nunca por quadro parado.
 */
export function PhoneCable({ model }: { model: ModelRegistry }) {
  const reduced = useReducedMotion();
  const group = useRef<Group>(null);
  const main = useRef<Mesh>(null);
  const tails = useRef<Mesh[]>([]);
  const plugs = useRef<Mesh[]>([]);
  const state = useRef({ key: "", geometries: [] as TubeGeometry[] });
  const v = useMemo(() => ({ a: new Vector3(), out: new Vector3(), b: new Vector3(), tmp: new Vector3(), o: new Vector3() }), []);
  const material = useMemo(() => createFlowMaterial(SAIDA), []);
  const plugMaterial = useMemo(() => new MeshStandardMaterial({ color: "#B9BEC4", metalness: 1, roughness: 0.3 }), []);
  const sleeveMaterial = useMemo(() => new MeshStandardMaterial({ color: "#121316", roughness: 0.5 }), []);
  const geometry = useMemo(
    () => ({
      usbA: new RoundedBoxGeometry(0.13, 0.06, 0.12, 2, 0.008),
      usbC: new RoundedBoxGeometry(0.09, 0.034, 0.1, 2, 0.012),
      micro: new RoundedBoxGeometry(0.075, 0.026, 0.07, 2, 0.007),
      lightning: new RoundedBoxGeometry(0.072, 0.02, 0.07, 2, 0.007),
      sleeve: new RoundedBoxGeometry(0.1, 0.05, 0.1, 2, 0.014),
    }),
    [],
  );

  // Geometria de partida: o Warmup compila o programa do fio e sobe os buffers antes do primeiro uso.
  useLayoutEffect(() => {
    const seed = new CatmullRomCurve3([new Vector3(0, 0, 0), new Vector3(0.1, 0, 0.1), new Vector3(0.2, 0, 0.2)]);
    state.current.geometries = [0, 1, 2, 3].map((i) => new TubeGeometry(seed, i === 0 ? MAIN_SEGMENTS : TAIL_SEGMENTS, RADIUS, RADIAL, false));
    if (main.current) main.current.geometry = state.current.geometries[0];
    tails.current.forEach((tail, i) => (tail.geometry = state.current.geometries[i + 1]));
  }, []);

  useLayoutEffect(
    () => () => {
      state.current.geometries.forEach((g) => g.dispose());
      Object.values(geometry).forEach((g) => g.dispose());
      material.dispose();
      plugMaterial.dispose();
      sleeveMaterial.dispose();
    },
    [geometry, material, plugMaterial, sleeveMaterial],
  );

  useFrame(({ clock }) => {
    const g = group.current;
    const root = model.root;
    const port = model.anchors.usb_a_mouth;
    const phone = model.anchors.phone_connector;
    if (!g || !main.current || !port || !phone) return;
    const drawn = sceneState.cable;
    g.visible = root.visible && drawn > 0.001;
    if (!g.visible) return;

    // Pontas e direção da saída, no espaço do produto.
    const local = (object: Object3D, x: number, y: number, z: number, target: Vector3) => {
      object.updateWorldMatrix(true, false);
      return root.worldToLocal(object.localToWorld(target.set(x, y, z)));
    };
    local(port, 0, 0, 0, v.a);
    local(port, 0, 0, 1, v.out).sub(v.a).setY(0).normalize();
    local(phone, 0, 0, 0, v.b);

    const s = state.current;
    const key = [v.a, v.b].map((p) => `${p.x.toFixed(3)},${p.y.toFixed(3)},${p.z.toFixed(3)}`).join(" ");
    if (key !== s.key) {
      s.key = key;
      const floor = RADIUS;
      const at = (p: Vector3, dx: number, y: number, dz: number) => new Vector3(p.x + dx, y, p.z + dz);
      // O cabo sai da caixa, desce ao chão, passa pela frente do celular e abre em três pontas
      // um pouco à frente dele; uma sobe e entra no celular por baixo.
      const split = at(v.b, 0.04, floor, 0.42);
      const exit = new Vector3().copy(v.a).addScaledVector(v.out, 0.14).setY(v.a.y * 0.55);
      const down = at(v.a, 0, floor, 0).addScaledVector(v.out, 0.3);
      const swing = at(v.a, (v.b.x - v.a.x) * 0.55, floor, 0).addScaledVector(v.out, 0.36);
      const curves = [
        new CatmullRomCurve3([v.a.clone().addScaledVector(v.out, 0.05), exit, down, swing, split], false, "centripetal"),
        // A ponta que entra no celular: sobe da emenda até o conector, por baixo dele.
        new CatmullRomCurve3(
          [split, at(split, 0.0, floor, -0.12), at(v.b, 0.02, v.b.y - 0.34, 0.1), at(v.b, 0, v.b.y - 0.16, 0.01), v.b.clone().setY(v.b.y - 0.07)],
          false,
          "centripetal",
        ),
        // As outras duas ficam soltas no chão, em leque.
        new CatmullRomCurve3([split, at(split, 0.07, floor, 0.1), at(split, 0.15, floor, 0.18)], false, "centripetal"),
        new CatmullRomCurve3([split, at(split, -0.05, floor, 0.12), at(split, -0.1, floor, 0.24)], false, "centripetal"),
      ];
      s.geometries.forEach((geo) => geo.dispose());
      s.geometries = curves.map((curve, i) => new TubeGeometry(curve, i === 0 ? MAIN_SEGMENTS : TAIL_SEGMENTS, RADIUS, RADIAL, false));
      main.current.geometry = s.geometries[0];
      tails.current.forEach((tail, i) => (tail.geometry = s.geometries[i + 1]));

      // Plugues: a USB-A na caixa (entra na porta) e as três pontas, alinhados ao fio.
      const [usbA, usbC, micro, lightning] = plugs.current;
      usbA.position.copy(v.a).addScaledVector(v.out, 0.05);
      usbA.rotation.set(0, Math.atan2(v.out.x, v.out.z), 0);
      const place = (plug: Mesh, curve: CatmullRomCurve3, pull: number) => {
        const end = curve.getPoint(1);
        const tangent = curve.getTangent(1);
        plug.position.copy(end).addScaledVector(tangent, pull);
        plug.quaternion.setFromUnitVectors(new Vector3(0, 0, 1), tangent);
      };
      place(usbC, curves[1], 0.02);
      place(micro, curves[2], 0.03);
      place(lightning, curves[3], 0.03);
    }

    const perSegment = RADIAL * 6;
    const first = smooth(drawn / SPLIT_AT);
    const second = smooth((drawn - SPLIT_AT) / (1 - SPLIT_AT));
    main.current.geometry.setDrawRange(0, Math.round(MAIN_SEGMENTS * first) * perSegment);
    tails.current.forEach((tail) => tail.geometry.setDrawRange(0, Math.round(TAIL_SEGMENTS * second) * perSegment));
    plugs.current.forEach((plug, i) => (plug.visible = i === 0 ? first > 0.01 : second > 0.98));

    // Pulsos: correm enquanto o celular carrega (com reduced motion, o fio fica aceso e parado).
    const u = (material as unknown as { uniforms: Record<string, { value: number }> }).uniforms;
    u.uIntensity.value = smooth((drawn - 0.85) / 0.15);
    u.uTime.value = clock.elapsedTime;
    u.uStatic.value = reduced ? 1 : 0;
  });

  const keepPlug = (i: number) => (mesh: Mesh | null) => {
    if (mesh) plugs.current[i] = mesh;
  };
  const keepTail = (i: number) => (mesh: Mesh | null) => {
    if (mesh) tails.current[i] = mesh;
  };

  return (
    <group ref={group} visible={false}>
      <mesh ref={main} material={material as unknown as Material} />
      {[0, 1, 2].map((i) => (
        <mesh key={i} ref={keepTail(i)} material={material as unknown as Material} />
      ))}
      <mesh ref={keepPlug(0)} geometry={geometry.usbA} material={plugMaterial} visible={false} />
      <mesh ref={keepPlug(1)} geometry={geometry.usbC} material={plugMaterial} visible={false} />
      <mesh ref={keepPlug(2)} geometry={geometry.micro} material={plugMaterial} visible={false} />
      <mesh ref={keepPlug(3)} geometry={geometry.lightning} material={plugMaterial} visible={false} />
    </group>
  );
}
