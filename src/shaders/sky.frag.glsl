// Céu em tela cheia: gradiente, brilho e disco do sol, nuvens, guarda de
// contraste, estrelas e grão. As cores chegam lineares de scene/daylight.ts.
// O contraste do texto é medido nos pixels pelo `snap` (scripts/snap.mjs).

uniform vec3 uZenith;
uniform vec3 uHorizon;
uniform vec3 uSunSide;
uniform vec3 uSun;
uniform vec3 uCloudLit;
uniform vec3 uCloudShade;
uniform vec2 uSunPos;
uniform float uHorizonY;
uniform float uAspect;
uniform float uSunSize;
uniform float uSunIntensity;
uniform float uGlowIntensity;
uniform float uStars;
uniform float uCloudCover;
uniform float uCloudShift;
uniform float uGuardMode;
uniform float uGuardAmount;
uniform float uGuardX0;
uniform float uGuardX1;
uniform float uPixelRatio;
uniform int uOctaves;

const float GRADIENT_POW = 0.65;
const float GLOW_FALLOFF = 3.2;
const float BAND_Y = 6.0;
const float BAND_X = 1.6;
const float GLOW_WEIGHT = 0.6;
const float BAND_WEIGHT = 0.5;
const float CLOUD_DENSITY_MAX = 0.95;
const float CAP_L = 0.13;
const float FLOOR_L = 0.36;
const float GUARD_SOFTNESS = 0.03;

varying vec2 vUv;

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash12(i);
  float b = hash12(i + vec2(1.0, 0.0));
  float c = hash12(i + vec2(0.0, 1.0));
  float d = hash12(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amp = 0.5;
  float norm = 0.0;
  for (int i = 0; i < 6; i++) {
    if (i >= uOctaves) break;
    value += amp * valueNoise(p);
    norm += amp;
    p = p * 2.03 + vec2(17.1, 9.2);
    amp *= 0.5;
  }
  return value / norm;
}

float luma(vec3 c) {
  return dot(c, vec3(0.2126, 0.7152, 0.0722));
}

float smin(float a, float b, float w) {
  return 0.5 * (a + b - sqrt((a - b) * (a - b) + w * w));
}

float smax(float a, float b, float w) {
  return 0.5 * (a + b + sqrt((a - b) * (a - b) + w * w));
}

// Guarda de legibilidade: com texto Nuvem, o céu da coluna de texto nunca
// passa de L 0,13; com texto Noite, nunca fica abaixo de L 0,36. Nas travessias
// (uGuardAmount 0) o céu fica livre para cruzar a zona morta. O disco do sol e o
// brilho logo em volta dele ficam de fora: o texto nunca para em cima do sol.
vec3 guard(vec3 c, float x, float sunDist) {
  float amount = uGuardAmount * (1.0 - smoothstep(uGuardX0, uGuardX1, x))
    * smoothstep(uSunSize * 1.2, uSunSize * 2.0, sunDist);
  if (amount <= 0.0 || uGuardMode == 0.0) return c;
  float l = luma(c);
  vec3 g;
  if (uGuardMode > 0.0) {
    float target = smin(l, CAP_L, GUARD_SOFTNESS);
    g = c * (l > 1e-5 ? target / l : 1.0);
  } else {
    // Clareia misturando com o horizonte. O piso do divisor evita um salto
    // onde o céu tem a mesma luminância do horizonte: sem ele, a mistura ia de
    // 0 a 1 de um pixel para o outro e desenhava um arco fino no céu.
    float target = smax(l, FLOOR_L, GUARD_SOFTNESS);
    float t = clamp((target - l) / max(luma(uHorizon) - l, 0.05), 0.0, 1.0);
    g = mix(c, uHorizon, t);
  }
  return mix(c, g, amount);
}

void main() {
  vec2 uv = vUv;

  float h = clamp((uv.y - uHorizonY) / (1.0 - uHorizonY), 0.0, 1.0);
  vec3 color = mix(uHorizon, uZenith, pow(h, GRADIENT_POW));

  vec2 d = vec2((uv.x - uSunPos.x) * uAspect, uv.y - uSunPos.y);
  float dist = length(d);
  float glow = exp(-dist * GLOW_FALLOFF) * uGlowIntensity;
  float band = exp(-abs(uv.y - uHorizonY) * BAND_Y) * exp(-abs(d.x) * BAND_X) * uGlowIntensity;
  color += uSunSide * (glow * GLOW_WEIGHT + band * BAND_WEIGHT);

  float disc = smoothstep(uSunSize, uSunSize * 0.82, dist) * uSunIntensity;
  color = mix(color, uSun, disc);

  // Nuvens: fbm esticado na horizontal, deslizando com a hora (e portanto com o scroll).
  float density = 0.0;
  if (uCloudCover > 0.02) {
    vec2 p = vec2(uv.x * uAspect * 1.2 + uCloudShift, uv.y * 2.6 - uCloudShift * 0.15);
    float n = fbm(p * 1.6);
    float shape = smoothstep(1.0 - uCloudCover - 0.1, 1.0 - uCloudCover + 0.25, n);
    density = shape * CLOUD_DENSITY_MAX * smoothstep(0.0, 0.35, uCloudCover);
    float prox = clamp(exp(-dist * 2.2) * 1.2, 0.0, 1.0) * smoothstep(-0.02, 0.1, uSunPos.y - uHorizonY);
    // Relevo barato: borda de cima mais clara que a base.
    float relief = smoothstep(0.35, 0.75, fbm(p * 1.6 + vec2(0.0, 0.08)));
    vec3 cloud = mix(uCloudShade, uCloudLit, clamp(prox + relief * 0.25 * prox, 0.0, 1.0));
    color = mix(color, cloud, density);
  }

  color = guard(color, uv.x, dist);

  // Estrelas depois da guarda (são pontos isolados e não afetam a leitura).
  if (uStars > 0.001) {
    vec2 cssPx = gl_FragCoord.xy / uPixelRatio;
    vec2 cell = floor(cssPx / 7.0);
    float pick = hash12(cell);
    if (pick > 0.962) {
      vec2 center = cell * 7.0 + 1.0 + vec2(hash12(cell + 17.1), hash12(cell + 31.7)) * 5.0;
      float size = mix(0.55, 1.25, hash12(cell + 5.3));
      float star = smoothstep(size, size * 0.25, length(cssPx - center)) * mix(0.3, 1.0, hash12(cell + 9.1));
      float above = smoothstep(0.0, 0.06, uv.y - uHorizonY * 0.4);
      color += vec3(0.85, 0.9, 1.0) * star * uStars * (1.0 - density) * above;
    }
  }

  gl_FragColor = vec4(color, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>

  // Grão estático (dither): tira o banding do gradiente sem piscar.
  gl_FragColor.rgb += (hash12(gl_FragCoord.xy) - 0.5) * (1.2 / 255.0);
}
