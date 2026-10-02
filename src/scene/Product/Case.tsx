import { forwardRef, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  BoxGeometry,
  CanvasTexture,
  CylinderGeometry,
  type Group,
  type Mesh,
  type Object3D,
  PlaneGeometry,
  SphereGeometry,
  type Sprite,
  SpriteMaterial,
} from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { easing } from "maath";
import { sceneState } from "../state";
import type { Materials } from "../materials";
import type { ProductTextures } from "../textures";
import { roundedPlane, roundedSlab } from "./geometry";
import type { ProductDimensions } from "./dimensions";
import { Internals } from "./Internals";
import { MOTION, phase, productLive } from "./motion";
import { CalloutAnchor } from "../Callouts";
import { blendToNode, schematicNodes } from "../schematic";
import { makeCanvas } from "../textures/canvas";

/** Halo do LED aceso: um gradiente radial branco, tingido pelo material. */
function glowTexture() {
  const { canvas, ctx } = makeCanvas(64, 64);
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
  gradient.addColorStop(0.2, "rgba(255, 255, 255, 0.5)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  return new CanvasTexture(canvas);
}

/** A tampa abre 110° para cima, na dobradiça de trás (docs/fase-0.md, item 6). */
const LID_OPEN = (110 * Math.PI) / 180;

interface CaseProps {
  dims: ProductDimensions;
  materials: Materials;
  textures: ProductTextures;
  /** Onde o cabo do painel entra (atrás, do lado direito). */
  cableAnchor: React.RefObject<Object3D | null>;
  /** A USB-A de saída, onde o cabo 3 em 1 encaixa. */
  outputAnchor: React.RefObject<Object3D | null>;
}

/**
 * Caixa da bateria e da eletrônica (seção 8 do brief): corpo em aro (oco, para
 * a tampa abrir e mostrar o interior), tampa com dobradiça atrás, pés de
 * borracha, parafusos, as portas na frente (USB-A de saída, USB-C de entrada),
 * a chave, o LED azul com lente e o nome em baixo-relevo na tampa.
 * Origem no chão, no centro da caixa; a frente olha para +z.
 */
export const Case = forwardRef<Group, CaseProps>(function Case({ dims, materials, textures, cableAnchor, outputAnchor }, ref) {
  const c = dims.case;
  const lid = useRef<Group>(null);
  const front = useRef<Group>(null);
  const shell = useRef<Group>(null);
  const faceplate = useRef<Mesh>(null);
  const ledGlow = useRef<Sprite>(null);
  const live = useRef({ led: sceneState.ledOn });
  const frontZ = c.width / 2;
  const portY = c.feet + c.body * 0.5;

  const parts = useMemo(() => {
    const inner = { width: c.length - 2 * c.wall, depth: c.width - 2 * c.wall, radius: c.corner - c.wall };
    const feet = mergeGeometries(
      [-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) =>
          new CylinderGeometry(0.05, 0.055, c.feet, 20).translate(sx * (c.length / 2 - 0.13), c.feet / 2, sz * (c.width / 2 - 0.12)),
        ),
      ),
    );
    const screws = mergeGeometries(
      [-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) =>
          new CylinderGeometry(0.021, 0.021, 0.004, 20).translate(
            sx * (c.length / 2 - 0.075),
            c.lid + 0.0015,
            c.width / 2 + sz * (c.width / 2 - 0.075),
          ),
        ),
      ),
    );
    return {
      body: roundedSlab({ width: c.length, depth: c.width, height: c.body, radius: c.corner, bevel: c.bevel, hole: inner }),
      bottom: roundedPlane(inner.width + 2 * c.bevel, inner.depth + 2 * c.bevel, inner.radius + c.bevel, "down"),
      floor: roundedPlane(inner.width, inner.depth, inner.radius, "up"),
      lid: roundedSlab({ width: c.length, depth: c.width, height: c.lid, radius: c.corner, bevel: c.bevel }),
      logo: new PlaneGeometry(0.64, 0.16).rotateX(-Math.PI / 2),
      feet,
      screws,
      // Portas e controles na frente (z = +largura/2), em ordem da esquerda
      // para a direita: LED, chave, USB-C (entrada) e USB-A (saída).
      usbAShell: new BoxGeometry(0.136, 0.058, 0.012),
      usbAHole: new PlaneGeometry(0.122, 0.044),
      usbATongue: new BoxGeometry(0.104, 0.013, 0.006),
      usbCShell: roundedSlab({ width: 0.094, depth: 0.036, height: 0.008, radius: 0.018, bevel: 0.0012 }).rotateX(Math.PI / 2),
      usbCHole: roundedPlane(0.08, 0.024, 0.012, "up").rotateX(Math.PI / 2),
      switchFrame: new BoxGeometry(0.104, 0.06, 0.006),
      switchRocker: new BoxGeometry(0.086, 0.044, 0.014),
      ledLens: new SphereGeometry(0.021, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2).rotateX(Math.PI / 2).scale(1, 1, 0.7),
      ledCore: new CylinderGeometry(0.011, 0.011, 0.004, 16).rotateX(Math.PI / 2),
      grommet: new CylinderGeometry(0.03, 0.03, 0.01, 20).rotateX(Math.PI / 2),
      // No esquema, a frente sai sem a caixa: ganha um espelho próprio atrás
      // das portas, que aparece enquanto o corpo desce.
      faceplate: roundedSlab({ width: c.length, depth: c.body, height: 0.02, radius: c.corner, bevel: 0.004 })
        .rotateX(Math.PI / 2)
        .translate(0, 0, -0.024),
      faceplateMaterial: Object.assign(materials.caseMatte.clone(), { transparent: true, opacity: 0 }),
      ledGlow: new SpriteMaterial({ map: glowTexture(), color: "#4CC9F0", blending: AdditiveBlending, depthWrite: false, opacity: 0 }),
    };
  }, [c, materials]);

  useLayoutEffect(
    () => () => {
      parts.ledGlow.map?.dispose();
      Object.values(parts).forEach((part) => part.dispose());
    },
    [parts],
  );

  const lidHinge = [0, c.feet + c.body + c.gap, -c.width / 2] as const;

  useFrame((_, delta) => {
    easing.damp(live.current, "led", sceneState.ledOn, 0.15, delta);
    materials.led.emissiveIntensity = 4 * live.current.led;
    // O halo faz o LED ser lido de longe (o bloom só chega na Fase 7).
    parts.ledGlow.opacity = 0.85 * live.current.led;
    if (ledGlow.current) ledGlow.current.visible = live.current.led > 0.01;
    const e = productLive.explode;
    if (lid.current) {
      // A tampa abre (lidOpen); na vista explodida, sobe e volta para a horizontal.
      const lift = phase(e, MOTION.lid.window);
      lid.current.rotation.x = -LID_OPEN * productLive.lidOpen * (1 - lift);
      lid.current.position.set(lidHinge[0], lidHinge[1] + MOTION.lid.offset[1] * lift, lidHinge[2]);
    }
    // A frente (USB-A, chave e LED) desliza para fora e, no esquema, vira o nó
    // da saída. O corpo desce e a tampa sobe: os dois saem do quadro.
    const s = productLive.schematic;
    if (front.current) {
      front.current.position.set(0, 0, c.width / 2 + MOTION.front.offset[2] * phase(e, MOTION.front.window));
      front.current.rotation.set(0, 0, 0);
      front.current.scale.setScalar(1);
      if (s > 0) {
        const node = schematicNodes().output;
        blendToNode(front.current, node, phase(s, node.window));
      }
    }
    const away = phase(s, [0, 0.45]);
    if (faceplate.current) {
      const shown = phase(s, [0.02, 0.3]);
      faceplate.current.visible = shown > 0.001;
      parts.faceplateMaterial.opacity = shown;
    }
    if (shell.current) {
      shell.current.position.y = -2.2 * away;
      shell.current.visible = away < 0.98;
    }
    if (lid.current) {
      lid.current.position.y += 2.2 * away;
      lid.current.visible = away < 0.98;
    }
  });

  return (
    <group ref={ref}>
      <group ref={shell}>
        <mesh geometry={parts.feet} material={materials.rubber} />
        <group position-y={c.feet}>
          <mesh geometry={parts.body} material={materials.caseMatte} />
          <mesh geometry={parts.bottom} material={materials.caseMatte} position-y={0.0002} />
          <mesh geometry={parts.floor} material={materials.caseInside} position-y={c.wall} />
        </group>
        {/* Entrada do cabo do painel, atrás, do lado direito (perto do painel). */}
        <group position={[c.length * 0.3, c.feet + c.body * 0.42, -c.width / 2]}>
          <mesh geometry={parts.grommet} material={materials.rubber} />
          <object3D ref={cableAnchor} position={[0, 0, -0.006]} />
        </group>
      </group>

      {/* Tampa: gira na dobradiça de trás, na altura da fresta. */}
      <group ref={lid} position={lidHinge}>
        <mesh geometry={parts.lid} material={materials.caseMatte} position-z={c.width / 2} />
        <mesh geometry={parts.logo} material={materials.logo} position={[0, c.lid + 0.0004, c.width / 2]} />
        <mesh geometry={parts.screws} material={materials.steel} />
      </group>

      <Internals dims={dims} materials={materials} textures={textures} />

      {/* Frente */}
      <group ref={front} position={[0, 0, frontZ]}>
        <group position-y={portY}>
        <mesh ref={faceplate} geometry={parts.faceplate} material={parts.faceplateMaterial} visible={false} />
        <mesh geometry={parts.ledLens} material={materials.lens} position={[-c.length * 0.32, 0, 0.001]} />
        <mesh geometry={parts.ledCore} material={materials.led} position={[-c.length * 0.32, 0, 0.002]} />
        <sprite ref={ledGlow} material={parts.ledGlow} position={[-c.length * 0.32, 0, 0.03]} scale={0.2} visible={false} />

        <group position={[-c.length * 0.14, 0, 0]}>
          <mesh geometry={parts.switchFrame} material={materials.hole} position-z={0.003} />
          <mesh geometry={parts.switchRocker} material={materials.plastic} position-z={0.006} rotation-x={0.16} />
        </group>

        <group position={[c.length * 0.08, 0, 0]}>
          <mesh geometry={parts.usbCShell} material={materials.steel} />
          <mesh geometry={parts.usbCHole} material={materials.hole} position-z={0.0085} />
        </group>

        <group position={[c.length * 0.27, 0, 0]}>
          <mesh geometry={parts.usbAShell} material={materials.steel} position-z={0.004} />
          <mesh geometry={parts.usbAHole} material={materials.hole} position-z={0.0102} />
          <mesh geometry={parts.usbATongue} material={materials.tongue} position={[0, -0.006, 0.008]} />
          <object3D ref={outputAnchor} position-z={0.012} />
        </group>
        <CalloutAnchor id="saidas" position={[c.length * 0.27, 0.045, 0.012]} />
        <CalloutAnchor id="luz" position={[-c.length * 0.32, 0.03, 0.02]} />
        </group>
      </group>

    </group>
  );
});
