import { MeshPhysicalMaterial, type Texture } from "three";
import CustomShaderMaterial from "three-custom-shader-material/vanilla";
import { productUniforms } from "../uniforms";

const vertexShader = /* glsl */ `
  varying vec2 vCellUv;
  void main() {
    vCellUv = uv;
  }
`;

// Reflexo que corre pelas duas placas em diagonal quando o painel abre (uGlint de
// 0 a 1), só sobre as células (a máscara é o canal R do mapa de superfície).
const fragmentShader = /* glsl */ `
  uniform sampler2D uSurface;
  uniform float uGlint;
  uniform float uPlate;
  varying vec2 vCellUv;
  void main() {
    float cell = texture2D(uSurface, vCellUv).r;
    float p = (vCellUv.x + uPlate) * 0.5 * 0.8 + vCellUv.y * 0.2;
    float center = mix(-0.25, 1.25, uGlint);
    float live = step(0.0005, uGlint) * step(uGlint, 0.9995);
    float d = (p - center) * 15.0;
    float band = exp(-d * d) * live;
    csm_Emissive = vec3(1.0, 0.84, 0.56) * band * 0.9 * cell;
  }
`;

/**
 * Material das células do painel: mapas de cor, rugosidade e metal da textura em
 * canvas, e o vidro por cima como clearcoat (sem `transmission`). O CSM soma o
 * reflexo da abertura sem perder a iluminação PBR. Nasce transparente (o foco
 * esmaece as peças; ver CLAUDE.md, regra do Warmup).
 */
export function createCellsMaterial(color: Texture, surface: Texture, plate: 0 | 1) {
  return new CustomShaderMaterial({
    baseMaterial: MeshPhysicalMaterial,
    vertexShader,
    fragmentShader,
    uniforms: {
      uSurface: { value: surface },
      uGlint: productUniforms.uGlint,
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
    transparent: true,
  });
}
