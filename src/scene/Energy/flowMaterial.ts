import { Color, MeshStandardMaterial } from "three";
import CustomShaderMaterial from "three-custom-shader-material/vanilla";

const vertexShader = /* glsl */ `
  varying vec2 vFlowUv;
  void main() {
    vFlowUv = uv;
  }
`;

// Pulsos que correm ao longo do fio (o u do tubo vai de uma ponta à outra),
// na cor da etapa, por cima do isolamento Grafite. Com reduced motion
// (uStatic 1), o caminho fica aceso e parado (seção 10 do brief).
const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uTime;
  uniform float uDensity;
  uniform float uSpeed;
  uniform float uStatic;
  varying vec2 vFlowUv;
  void main() {
    // A cabeça do pulso vai na frente (u maior) e a cauda fica para trás.
    float t = fract(uTime * uSpeed - vFlowUv.x * uDensity);
    float pulse = smoothstep(0.0, 0.1, t) * (1.0 - smoothstep(0.1, 0.42, t));
    // Aceso, o fio inteiro tem a cor da etapa (abaixo do limiar do Bloom); a
    // cabeça dos pulsos passa dele e brilha (Effects.tsx).
    float glow = mix(0.5 + 3.6 * pulse, 1.3, uStatic);
    csm_Emissive = uColor * glow * uIntensity;
  }
`;

/**
 * Material dos fios de fluxo (seção 8 do brief): o isolamento continua PBR
 * (Grafite, iluminado como o resto), e o CSM soma os pulsos de energia como
 * emissão. A cor é informação e sempre vem com legenda no DOM.
 */
export function createFlowMaterial(color: string) {
  return new CustomShaderMaterial({
    baseMaterial: MeshStandardMaterial,
    vertexShader,
    fragmentShader,
    uniforms: {
      uColor: { value: new Color(color) },
      uIntensity: { value: 0 },
      uTime: { value: 0 },
      uDensity: { value: 5 },
      uSpeed: { value: 0.6 },
      uStatic: { value: 0 },
    },
    color: "#2B3036",
    roughness: 0.45,
    metalness: 0,
  });
}
