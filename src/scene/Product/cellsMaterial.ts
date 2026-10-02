import { MeshPhysicalMaterial, type Texture } from "three";
import CustomShaderMaterial from "three-custom-shader-material/vanilla";
import { productUniforms } from "../uniforms";

const vertexShader = /* glsl */ `
  varying vec2 vCellUv;
  void main() {
    vCellUv = uv;
  }
`;

// Reflexo da abertura: uma faixa quente que corre pelas duas placas em
// diagonal (uGlint de 0 a 1). Com sol, as células ganham um brilho azulado
// leve, como a camada antirreflexo do silício (uIrradiance). No esquema, as
// células brilham onde os fótons batem (uLight).
const fragmentShader = /* glsl */ `
  uniform sampler2D uSurface;
  uniform float uGlint;
  uniform float uIrradiance;
  uniform float uLight;
  uniform float uPlate;
  varying vec2 vCellUv;
  void main() {
    float cell = texture2D(uSurface, vCellUv).r;
    float p = (vCellUv.x + uPlate) * 0.5 * 0.8 + vCellUv.y * 0.2;
    float center = mix(-0.25, 1.25, uGlint);
    float live = step(0.0005, uGlint) * step(uGlint, 0.9995);
    float d = (p - center) * 15.0;
    float band = exp(-d * d) * live;
    vec3 glint = vec3(1.0, 0.84, 0.56) * band * 1.1;
    vec3 sheen = vec3(0.10, 0.16, 0.42) * uIrradiance * 0.08;
    vec3 lit = vec3(1.0, 0.82, 0.4) * uLight * 0.12;
    csm_Emissive = (glint + sheen + lit) * cell;
  }
`;

/**
 * Material das células (seção 8 do brief): mapas de cor, rugosidade e metal
 * da textura em canvas, e o vidro por cima como clearcoat (sem
 * `transmission`). O CSM soma o reflexo da abertura e o brilho do sol sem
 * perder a iluminação PBR.
 */
export function createCellsMaterial(color: Texture, surface: Texture, plate: 0 | 1) {
  return new CustomShaderMaterial({
    baseMaterial: MeshPhysicalMaterial,
    vertexShader,
    fragmentShader,
    uniforms: {
      uSurface: { value: surface },
      uGlint: productUniforms.uGlint,
      uIrradiance: productUniforms.uIrradiance,
      uLight: productUniforms.uLight,
      uPlate: { value: plate },
    },
    map: color,
    roughnessMap: surface,
    metalnessMap: surface,
    roughness: 1,
    metalness: 1,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
    envMapIntensity: 1.1,
  });
}
