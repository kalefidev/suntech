uniform vec3 uZenith;
uniform vec3 uHorizon;
uniform vec3 uSun;
uniform float uSunIntensity;
uniform float uStarIntensity;
uniform vec2 uSunPos;
uniform vec2 uResolution;
uniform float uTime;

varying vec2 vUv;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / max(uResolution.y, 1.0);

  vec3 sky = mix(uHorizon, uZenith, pow(clamp(uv.y, 0.0, 1.0), 0.7));

  vec2 d = vec2((uv.x - uSunPos.x) * aspect, uv.y - uSunPos.y);
  float dist = length(d);
  float disc = smoothstep(0.045, 0.038, dist);
  float glow = exp(-dist * 7.0) * 0.55;
  sky += uSun * (disc + glow) * uSunIntensity;

  // Estrelas: grade de hash procedural, só visíveis à noite (uStarIntensity).
  vec2 starGrid = floor(uv * uResolution / 3.0);
  float starNoise = hash(starGrid);
  float twinkle = 0.75 + 0.25 * sin(uTime * 3.0 + starNoise * 40.0);
  float star = step(0.9975, starNoise) * uStarIntensity * twinkle;
  sky += vec3(star);

  // Grão sutil, sempre presente, para tirar o banding do gradiente.
  float grain = (hash(uv * uResolution + uTime) - 0.5) * 0.02;
  sky += grain;

  gl_FragColor = vec4(sky, 1.0);
}
