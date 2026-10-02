import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  type Mesh,
  type Points,
  QuadraticBezierCurve3,
  ShaderMaterial,
  TubeGeometry,
  Vector2,
  Vector3,
} from "three";
import { SCHEMATIC_NODES, type SchematicNode } from "../choreography";
import { EXTENT, NODE_STEP, type NodeTarget, schematicNodes } from "../schematic";
import { sceneState } from "../state";
import { sceneLight } from "../daylight";
import { skyLive } from "../skyLive";
import { quality } from "../quality";
import { productUniforms } from "../uniforms";
import { productLive } from "../Product/motion";
import { productDimensions } from "../Product/dimensions";
import { seeded } from "../textures/canvas";
import { createFlowMaterial } from "./flowMaterial";
import { stepLayer, stepSlots } from "../../lib/steps";
import { energyPath } from "../../content/product";
import { WIDE } from "../../lib/env";
import { useMedia, useReducedMotion } from "../../lib/useReducedMotion";

/** Código de cor da energia (seção 6 do brief), os mesmos valores do `@theme`. */
const ENERGY = { luz: "#FFD166", painel: "#FF9F1C", guardada: "#3DDC97", saida: "#4CC9F0" } as const;

/**
 * Os fios do esquema, na ordem do caminho da energia: a cor, a etapa em que
 * acendem e o atraso dentro da etapa (a energia anda de um fio para o outro).
 */
const WIRES: ReadonlyArray<{ from: SchematicNode; to: SchematicNode; color: string; step: number; delay: number }> = [
  { from: "panel", to: "diode", color: ENERGY.painel, step: 2, delay: 0 },
  { from: "diode", to: "charger", color: ENERGY.painel, step: 2, delay: 0.2 },
  { from: "charger", to: "battery", color: ENERGY.guardada, step: 3, delay: 0 },
  { from: "battery", to: "boost", color: ENERGY.guardada, step: 4, delay: 0 },
  { from: "boost", to: "output", color: ENERGY.saida, step: 4, delay: 0.15 },
  { from: "output", to: "phone", color: ENERGY.saida, step: 4, delay: 0.3 },
];

const RADIUS = 0.028;
const SEGMENTS = 40;
const RADIAL = 8;
/** Distância entre pulsos e velocidade deles, no mundo: iguais em fios curtos e longos. */
const PULSE_SPACING = 0.3;
const PULSES_PER_SECOND = 3.5;

const smooth = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

/** A direção da linha do esquema (do painel para o celular) e a perpendicular na tela. */
function lineFrame(nodes: Record<SchematicNode, NodeTarget>, narrow: boolean) {
  const along = new Vector3().subVectors(nodes.phone.center, nodes.panel.center).normalize();
  // Desktop: "para cima" na tela; celular: "para a esquerda" (onde ficam as etiquetas).
  const side = narrow ? new Vector3().crossVectors(along, new Vector3(0, 0, 1)).normalize() : new Vector3(0, 1, 0);
  return { along, side };
}

/** Meia medida da peça ao longo da linha e de lado. */
const extentOf = (id: SchematicNode, narrow: boolean) =>
  narrow ? { along: EXTENT[id][1], side: EXTENT[id][0] } : { along: EXTENT[id][0], side: EXTENT[id][1] };

/**
 * Fios de fluxo do esquema (seção 8 do brief): tubos em curva entre as peças,
 * com pulsos que correm na cor da etapa. Crescem do painel para o celular
 * quando o esquema termina de se formar, e cada trecho acende na sua etapa.
 * Com reduced motion, o caminho fica aceso e parado.
 */
function FlowWires({ narrow, reduced }: { narrow: boolean; reduced: boolean }) {
  const refs = useRef<Mesh[]>([]);
  const time = useRef(0);
  const built = useMemo(() => {
    const nodes = schematicNodes();
    const { along, side } = lineFrame(nodes, narrow);
    return WIRES.map((wire) => {
      // Do lado de saída de uma peça até o lado de entrada da próxima.
      const start = nodes[wire.from].center.clone().addScaledVector(along, extentOf(wire.from, narrow).along - 0.02);
      const end = nodes[wire.to].center.clone().addScaledVector(along, 0.02 - extentOf(wire.to, narrow).along);
      // Uma barriga leve, para longe das etiquetas.
      const control = start.clone().lerp(end, 0.5).addScaledVector(side, -0.12 * start.distanceTo(end));
      const curve = new QuadraticBezierCurve3(start, control, end);
      const material = createFlowMaterial(wire.color);
      material.uniforms.uDensity.value = Math.max(1, curve.getLength() / PULSE_SPACING);
      material.uniforms.uSpeed.value = PULSES_PER_SECOND;
      return { wire, material, geometry: new TubeGeometry(curve, SEGMENTS, RADIUS, RADIAL, false) };
    });
  }, [narrow]);

  useLayoutEffect(
    () => () => {
      built.forEach(({ geometry, material }) => {
        geometry.dispose();
        material.dispose();
      });
    },
    [built],
  );

  useFrame((_, delta) => {
    const grow = smooth((productLive.schematic - 0.55) / 0.45);
    const visible = grow > 0.001 && sceneState.productVisible > 0.01;
    if (visible && !reduced) time.current += delta;
    built.forEach(({ wire, material }, i) => {
      const mesh = refs.current[i];
      if (!mesh) return;
      mesh.visible = visible;
      if (!visible) return;
      // Cresce do painel para o celular: cada trecho começa depois do anterior.
      // O último espera o celular chegar (etapa 4).
      const drawn = smooth(grow * WIRES.length - i) * (wire.to === "phone" ? smooth(sceneState.phoneVisible) : 1);
      mesh.geometry.setDrawRange(0, Math.round(SEGMENTS * drawn) * RADIAL * 6);
      const u = material.uniforms;
      u.uTime.value = time.current;
      u.uIntensity.value = smooth((sceneState.flow - (wire.step - 1) - wire.delay) * 2.5);
      u.uStatic.value = reduced ? 1 : 0;
    });
  });

  return (
    <>
      {built.map(({ geometry, material }, i) => (
        <mesh
          key={i}
          ref={(mesh) => {
            if (mesh) refs.current[i] = mesh;
          }}
          geometry={geometry}
          material={material}
          visible={false}
        />
      ))}
    </>
  );
}

// Cada fóton é um ponto que vira um risco de luz na direção em que anda: o
// vértice projeta a direção do movimento na tela e o fragmento desenha o
// risco dentro do quadrado do ponto, com a cabeça mais clara.
const photonVertex = /* glsl */ `
  attribute vec3 aEnd;
  attribute float aPhase;
  attribute float aDistance;
  uniform float uTime;
  uniform vec3 uSunDir;
  uniform float uSize;
  uniform vec2 uViewport;
  varying float vAlpha;
  varying vec2 vDir;
  void main() {
    float t = fract(uTime * 0.42 + aPhase);
    vec3 p = mix(aEnd + uSunDir * aDistance, aEnd, t);
    // Acende ao sair do céu e some ao tocar as células.
    vAlpha = smoothstep(0.0, 0.15, t) * (1.0 - smoothstep(0.86, 1.0, t));
    mat4 m = projectionMatrix * modelViewMatrix;
    vec4 clip = m * vec4(p, 1.0);
    vec4 ahead = m * vec4(p - uSunDir * 0.1, 1.0);
    vec2 d = (ahead.xy / ahead.w - clip.xy / clip.w) * uViewport;
    vDir = normalize(vec2(d.x, -d.y) + 1e-6);
    gl_Position = clip;
    gl_PointSize = uSize / clip.w;
  }
`;

const photonFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  varying float vAlpha;
  varying vec2 vDir;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float along = dot(c, vDir);
    float across = abs(dot(c, vec2(-vDir.y, vDir.x)));
    // Risco afinando da cabeça (na frente) para a cauda, com um brilho na cabeça.
    float head = clamp((along + 0.46) / 0.64, 0.0, 1.0);
    float width = mix(0.004, 0.05, head);
    float body = (1.0 - smoothstep(width * 0.5, width, across)) * step(-0.46, along) * (1.0 - smoothstep(0.15, 0.19, along));
    vec2 tip = c - vDir * 0.13;
    float glow = exp(-dot(tip, tip) * 160.0);
    float a = max(body * head * head, glow * 0.7) * vAlpha * uIntensity;
    if (a < 0.004) discard;
    gl_FragColor = vec4(mix(uColor, vec3(1.0), clamp(head * 0.4 + glow * 0.4, 0.0, 1.0)), a);
  }
`;

/** Abertura do painel em V (a mesma do Panel.tsx): as pontas das placas vêm para a frente. */
const TAN_V = Math.tan((14 * Math.PI) / 180);

/**
 * Fótons (etapa 1, Captar): riscos de luz que descem do sol até as células,
 * cada um no seu tempo, e somem ao tocá-las; as células brilham onde a luz
 * bate. Só existem com o esquema formado. Com reduced motion, ficam de fora
 * (o brilho das células e o caminho aceso já contam a história).
 */
function Photons({ reduced }: { reduced: boolean }) {
  const ref = useRef<Points>(null);
  const time = useRef(0);
  const count = Math.round(quality.entry().particles * 0.35);
  const screen = useMemo(() => new Vector2(), []);

  const { geometry, material, panel } = useMemo(() => {
    // Pontos de chegada na face das células do painel, já no nó do esquema.
    const node = schematicNodes().panel;
    const { length: L, width: H, frame: F } = productDimensions().plate;
    const end = new Float32Array(count * 3);
    const phase = new Float32Array(count);
    const distance = new Float32Array(count);
    const p = new Vector3();
    const random = seeded(7);
    for (let i = 0; i < count; i++) {
      const x = (random() * 2 - 1) * (L - F);
      const y = F + random() * (H - 2 * F);
      p.set(x, y, Math.abs(x) * TAN_V + 0.04).multiplyScalar(node.scale).applyQuaternion(node.quaternion).add(node.position);
      end.set([p.x, p.y, p.z], i * 3);
      phase[i] = random();
      distance[i] = 2 + random() * 1.6;
    }
    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(new Float32Array(count * 3), 3));
    geo.setAttribute("aEnd", new BufferAttribute(end, 3));
    geo.setAttribute("aPhase", new BufferAttribute(phase, 1));
    geo.setAttribute("aDistance", new BufferAttribute(distance, 1));
    const mat = new ShaderMaterial({
      vertexShader: photonVertex,
      fragmentShader: photonFragment,
      uniforms: {
        uTime: { value: 0 },
        uSunDir: { value: new Vector3(0, 1, 0) },
        uSize: { value: 600 },
        uViewport: { value: screen },
        uColor: { value: new Color(ENERGY.luz) },
        uIntensity: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
    });
    return { geometry: geo, material: mat, panel: node.center };
  }, [count, screen]);

  useLayoutEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
      productUniforms.uLight.value = 0;
    },
    [geometry, material],
  );

  useFrame(({ camera, size, viewport: { dpr } }, delta) => {
    const points = ref.current;
    if (!points) return;
    const intensity = smooth(sceneState.flow / 0.4) * smooth((productLive.schematic - 0.85) / 0.15) * Math.min(1, sceneState.productVisible);
    productUniforms.uLight.value = intensity;
    points.visible = !reduced && intensity > 0.001;
    if (!points.visible) return;
    time.current += delta;
    const light = sceneLight(skyLive.dayTime, skyLive.cloudCover);
    const [x, y, z] = light.sunDir;
    const u = material.uniforms;
    u.uTime.value = time.current;
    // Do lado do sol, mas sempre de cima: com o sol baixo, os fótons não
    // atravessam o esquema na horizontal. E ficam mais fracos no fim da tarde.
    u.uSunDir.value.set(x, y + 1.2, z).normalize();
    u.uIntensity.value = intensity * (0.4 + 0.6 * light.irradiance);
    // Uns 46 px de quadrado (numa tela de 900 px de altura) na distância do
    // painel; o risco ocupa 65% dele.
    u.uSize.value = 46 * dpr * (size.height / 900) * camera.position.distanceTo(panel);
    screen.set(size.width * dpr, size.height * dpr);
  });

  // Os pontos andam no shader: sem corte por frustum (a esfera da geometria não os acompanha).
  return <points ref={ref} geometry={geometry} material={material} frustumCulled={false} visible={false} />;
}

const setData = (element: HTMLElement, key: string, value: string) => {
  if (element.dataset[key] !== value) element.dataset[key] = value;
};

/**
 * Etiquetas das 4 etapas (e o "3,7 V → 5 V") presas ao esquema: a cena
 * projeta os pontos e escreve a posição e o estado direto nos elementos, sem
 * re-render. Cada etiqueta fica sobre o grupo de peças da etapa (no celular,
 * à esquerda dele). A etapa em curso fica "ativa"; as que já passaram,
 * "acesas"; as que vêm, "apagadas" (mas já numeradas e legendadas). A lista
 * da seção marca a mesma etapa.
 */
function StepProjector({ narrow }: { narrow: boolean }) {
  const point = useMemo(() => new Vector3(), []);
  const anchors = useMemo(() => {
    const nodes = schematicNodes();
    const { along, side } = lineFrame(nodes, narrow);
    const margin = 0.05;
    // Todas na mesma linha: acima da peça mais alta (no celular, à esquerda da mais larga).
    const reach = Math.max(...SCHEMATIC_NODES.map((id) => extentOf(id, narrow).side));
    const groupAnchor = (step: number) => {
      const ids = SCHEMATIC_NODES.filter((id) => NODE_STEP[id] === step);
      // O meio do grupo ao longo da linha, e a borda de cima (ou da esquerda).
      const first = nodes[ids[0]];
      const last = nodes[ids[ids.length - 1]];
      const startAt = -extentOf(ids[0], narrow).along;
      const endAt = first.center.distanceTo(last.center) + extentOf(ids[ids.length - 1], narrow).along;
      return first.center
        .clone()
        .addScaledVector(along, (startAt + endAt) / 2)
        .addScaledVector(side, reach + margin);
    };
    const boost = nodes.boost.center.clone().addScaledVector(side, -(extentOf("boost", narrow).side + margin));
    return { steps: [1, 2, 3, 4].map(groupAnchor), conversion: boost };
  }, [narrow]);

  useFrame(({ camera, size }) => {
    const layer = stepLayer.element;
    if (!layer) return;
    const show = productLive.schematic > 0.85 && sceneState.productVisible > 0.01;
    setData(layer, "visible", show ? "1" : "0");
    const place = (element: HTMLElement, anchor: Vector3) => {
      point.copy(anchor).project(camera);
      const x = (point.x * 0.5 + 0.5) * size.width;
      const y = (-point.y * 0.5 + 0.5) * size.height;
      element.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    };
    const flow = sceneState.flow;
    // A etapa em curso: a lista sempre marca uma (no fim, a última).
    const current = Math.min(energyPath.length - 1, Math.floor(flow));
    energyPath.forEach((step, i) => {
      const slot = stepSlots.get(step.id);
      if (slot?.label) {
        setData(slot.label, "state", flow > i ? (i < current ? "lit" : "active") : "off");
        if (show) place(slot.label, anchors.steps[i]);
      }
      if (slot?.item) setData(slot.item, "active", i === current ? "1" : "0");
    });
    const volts = stepSlots.get("conversion")?.label;
    if (volts) {
      setData(volts, "state", flow >= 3.2 ? "lit" : "off");
      if (show) place(volts, anchors.conversion);
    }
  });

  return null;
}

/**
 * O caminho da energia no esquema de "Como funciona" (espaço do mundo). Ao
 * trocar de layout (girar a tela), os nós mudam de lugar: tudo é refeito.
 */
export function Energy() {
  const reduced = useReducedMotion();
  const narrow = !useMedia(WIDE);
  return (
    <group key={narrow ? "narrow" : "wide"}>
      <FlowWires narrow={narrow} reduced={reduced} />
      <Photons reduced={reduced} />
      <StepProjector narrow={narrow} />
    </group>
  );
}
