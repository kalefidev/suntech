import { MeshStandardMaterial, type Texture } from "three";
import CustomShaderMaterial from "three-custom-shader-material/vanilla";

const vertexShader = /* glsl */ `
  varying vec2 vCellUv;
  void main() {
    vCellUv = uv;
  }
`;

// A carga sobe ao longo do eixo da célula (v do cilindro), em verde (energia
// guardada), com uma borda clara onde o nível está.
const fragmentShader = /* glsl */ `
  uniform float uCharge;
  varying vec2 vCellUv;
  void main() {
    float level = clamp(uCharge, 0.0, 1.0);
    float filled = 1.0 - smoothstep(level - 0.012, level, vCellUv.y);
    float d = (vCellUv.y - level) * 60.0;
    float edge = exp(-d * d);
    vec3 green = vec3(0.24, 0.86, 0.59);
    csm_Emissive = green * (filled * 0.55 + edge * 1.4) * step(0.001, level);
  }
`;

/**
 * Rótulo da célula 18650 com a carga visível (seção 8 do brief): um
 * preenchimento emissivo verde controlado por `uCharge` (`batteryCharge`).
 * O uniform é compartilhado pelas duas células.
 */
export function createBatteryMaterial(label: Texture, charge: { value: number }) {
  return new CustomShaderMaterial({
    baseMaterial: MeshStandardMaterial,
    vertexShader,
    fragmentShader,
    uniforms: { uCharge: charge },
    map: label,
    roughness: 0.42,
    metalness: 0,
  });
}
