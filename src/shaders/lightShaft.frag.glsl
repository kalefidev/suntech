// Primeiro raio de sol da abertura (C7): um feixe que sai do disco do sol e
// atravessa a cena, somado à imagem (blending aditivo). Fica fora da coluna de
// texto: no desktop, só à direita de uMaskX; no celular, só acima de uMaskY.

uniform vec2 uSun;
uniform float uAspect;
uniform float uIntensity;
uniform float uReach;
uniform vec3 uColor;
uniform float uMaskX;
uniform float uMaskY;

varying vec2 vUv;

void main() {
  vec2 p = vec2((vUv.x - uSun.x) * uAspect, vUv.y - uSun.y);
  // Do horizonte, à direita, para a esquerda e um pouco para cima: cruza o produto.
  vec2 dir = normalize(vec2(-1.0, 0.22));
  float along = dot(p, dir);
  float across = dot(p, vec2(-dir.y, dir.x));
  float width = 0.012 + max(along, 0.0) * 0.07;
  // x * x, nunca pow(x, 2.0): pow com base negativa é indefinido em GLSL.
  float k = across / width;
  float beam = exp(-k * k) * smoothstep(0.0, 0.06, along);
  float head = 1.0 - smoothstep(uReach * 1.4 - 0.35, uReach * 1.4, along);
  float fall = exp(-max(along, 0.0) * 1.2);
  float mask = smoothstep(uMaskX, uMaskX + 0.1, vUv.x) * smoothstep(uMaskY, uMaskY + 0.08, vUv.y);
  gl_FragColor = vec4(uColor * beam * head * fall * mask * uIntensity, 1.0);
}
