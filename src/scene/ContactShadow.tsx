import { useLayoutEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  CanvasTexture,
  Color,
  type Group,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshDepthMaterial,
  type Object3D,
  OrthographicCamera,
  PlaneGeometry,
  ShaderMaterial,
  WebGLRenderTarget,
} from "three";
import { HorizontalBlurShader } from "three/addons/shaders/HorizontalBlurShader.js";
import { VerticalBlurShader } from "three/addons/shaders/VerticalBlurShader.js";
import { quality } from "./quality";
import { sceneState } from "./state";
import { makeCanvas } from "./textures/canvas";

interface ContactShadowProps {
  /** O grupo do produto: a sombra só é refeita quando ele se mexe. */
  subject: React.RefObject<Object3D | null>;
  width: number;
  depth: number;
  /** Altura até onde a sombra enxerga (unidades da cena). */
  far?: number;
  blur?: number;
  opacity?: number;
}

/**
 * Sombra de contato suave, sem chão visível (o produto pousa no horizonte).
 * Adaptada do `ContactShadows` do drei (MIT), com três mudanças:
 * - só enxerga a camada 0 (o céu e o raio de sol ficam de fora);
 * - só é refeita quando o produto se mexe, não a cada quadro;
 * - no tier baixo, vira um plano com gradiente (docs/fase-0.md, item 7).
 */
export function ContactShadow(props: ContactShadowProps) {
  const settings = useSyncExternalStore(quality.subscribe, quality.get);
  return settings.shadowSize > 0 ? <RenderedShadow {...props} resolution={settings.shadowSize} /> : <FakeShadow {...props} />;
}

/** O que muda a silhueta do produto além da pose do grupo. */
const silhouette = () => [
  sceneState.lid,
  sceneState.explode,
  sceneState.panelOpen,
  sceneState.phoneVisible,
  sceneState.cable,
  sceneState.productVisible,
];

function RenderedShadow({ subject, width, depth, far = 1.2, blur = 3.5, opacity = 0.9, resolution }: ContactShadowProps & { resolution: number }) {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const groupRef = useRef<Group>(null);
  const planeMaterialRef = useRef<MeshBasicMaterial>(null);

  const kit = useMemo(() => {
    const target = new WebGLRenderTarget(resolution, resolution);
    const blurTarget = new WebGLRenderTarget(resolution, resolution);
    target.texture.generateMipmaps = blurTarget.texture.generateMipmaps = false;
    const plane = new PlaneGeometry(width, depth).rotateX(Math.PI / 2);
    const blurPlane = new Mesh(plane);
    const depthMaterial = new MeshDepthMaterial();
    depthMaterial.depthTest = depthMaterial.depthWrite = false;
    depthMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.ucolor = { value: new Color("#0A0D14") };
      shader.fragmentShader = shader.fragmentShader
        .replace("void main() {", "uniform vec3 ucolor;\nvoid main() {")
        .replace("vec4( vec3( 1.0 - fragCoordZ ), opacity );", "vec4( ucolor * fragCoordZ * 2.0, ( 1.0 - fragCoordZ ) * 1.0 );");
    };
    const horizontal = new ShaderMaterial(HorizontalBlurShader);
    const vertical = new ShaderMaterial(VerticalBlurShader);
    horizontal.depthTest = vertical.depthTest = false;
    const camera = new OrthographicCamera(-width / 2, width / 2, depth / 2, -depth / 2, 0, far);
    return { target, blurTarget, plane, blurPlane, depthMaterial, horizontal, vertical, camera };
  }, [resolution, width, depth, far]);

  useLayoutEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    group.add(kit.camera);
    // O plano do desfoque precisa ficar dentro do campo da câmera da sombra
    // (que olha para cima a partir do chão): fica no espaço do pai do grupo,
    // na metade da altura. No drei ele fica na origem do mundo, o que só
    // funciona com a sombra abaixo do chão.
    const parent = group.parent;
    kit.blurPlane.position.set(0, far / 2, 0);
    kit.blurPlane.visible = false;
    parent?.add(kit.blurPlane);
    return () => {
      group.remove(kit.camera);
      parent?.remove(kit.blurPlane);
      kit.target.dispose();
      kit.blurTarget.dispose();
      kit.plane.dispose();
      kit.depthMaterial.dispose();
      kit.horizontal.dispose();
      kit.vertical.dispose();
    };
  }, [kit, far]);

  const last = useMemo(() => new Matrix4(), []);
  const clearColor = useMemo(() => new Color(), []);
  const state = useRef({ shape: [] as number[], frames: 0 });

  const blurPass = (amount: number) => {
    const { blurPlane, horizontal, vertical, target, blurTarget, camera } = kit;
    blurPlane.visible = true;
    blurPlane.material = horizontal;
    horizontal.uniforms.tDiffuse.value = target.texture;
    horizontal.uniforms.h.value = amount / 256;
    gl.setRenderTarget(blurTarget);
    gl.render(blurPlane, camera);
    blurPlane.material = vertical;
    vertical.uniforms.tDiffuse.value = blurTarget.texture;
    vertical.uniforms.v.value = amount / 256;
    gl.setRenderTarget(target);
    gl.render(blurPlane, camera);
    blurPlane.visible = false;
  };

  useFrame(() => {
    const group = groupRef.current;
    const material = planeMaterialRef.current;
    const object = subject.current;
    if (!group || !material || !object) return;
    // Na vista explodida, as peças flutuam: a sombra esmaece (a timeline escreve `shadow`).
    material.opacity = opacity * Math.min(1, sceneState.productVisible * 1.5) * sceneState.shadow;
    group.visible = object.visible && material.opacity > 0.001;
    if (!group.visible) return;

    // Refaz só quando o produto (ou uma peça dele) se mexeu.
    const s = state.current;
    const shape = silhouette();
    const moved = !last.equals(object.matrixWorld) || shape.some((value, i) => Math.abs(value - (s.shape[i] ?? -1)) > 1e-4);
    if (moved) s.frames = 2;
    if (s.frames <= 0) return;
    s.frames--;
    last.copy(object.matrixWorld);
    s.shape = shape;

    const background = scene.background;
    const override = scene.overrideMaterial;
    // O canvas é opaco (alpha: false): limpa o alvo com alfa 0, senão a sombra
    // vira um bloco preto.
    gl.getClearColor(clearColor);
    const clearAlpha = gl.getClearAlpha();
    gl.setClearColor(0x000000, 0);
    group.visible = false;
    scene.background = null;
    scene.overrideMaterial = kit.depthMaterial;
    gl.setRenderTarget(kit.target);
    gl.clear();
    gl.render(scene, kit.camera);
    blurPass(blur);
    blurPass(blur * 0.4);
    gl.setRenderTarget(null);
    gl.setClearColor(clearColor, clearAlpha);
    group.visible = true;
    scene.overrideMaterial = override;
    scene.background = background;
  });

  return (
    <group ref={groupRef} rotation-x={Math.PI / 2} position-y={0.002}>
      <mesh geometry={kit.plane} scale={[1, -1, 1]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshBasicMaterial ref={planeMaterialRef} transparent map={kit.target.texture} depthWrite={false} />
      </mesh>
    </group>
  );
}

/** Tier baixo: uma elipse suave em gradiente, sem renderizar nada. */
function FakeShadow({ subject, width, depth, opacity = 0.7 }: ContactShadowProps) {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<MeshBasicMaterial>(null);
  const texture = useMemo(() => {
    const { canvas, ctx } = makeCanvas(128, 128);
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, "rgba(10, 13, 20, 0.85)");
    gradient.addColorStop(0.55, "rgba(10, 13, 20, 0.35)");
    gradient.addColorStop(1, "rgba(10, 13, 20, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    return new CanvasTexture(canvas);
  }, []);
  useLayoutEffect(() => () => texture.dispose(), [texture]);

  useFrame(() => {
    const mesh = meshRef.current;
    const material = materialRef.current;
    if (!mesh || !material) return;
    material.opacity = opacity * Math.min(1, sceneState.productVisible * 1.5) * sceneState.shadow;
    mesh.visible = (subject.current?.visible ?? false) && material.opacity > 0.001;
  });

  return (
    <mesh ref={meshRef} rotation-x={-Math.PI / 2} position-y={0.002}>
      <planeGeometry args={[width * 0.8, depth * 0.7]} />
      <meshBasicMaterial ref={materialRef} map={texture} transparent depthWrite={false} />
    </mesh>
  );
}
