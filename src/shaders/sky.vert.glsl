varying vec2 vUv;

void main() {
  vUv = uv;
  // Quad sempre em tela cheia, ignorando a câmera de propósito: o céu é um
  // fundo 2D (gradiente + sol + estrelas), não um skybox 3D. z=1.0 (plano
  // longínquo) para nunca cobrir o produto.
  gl_Position = vec4(position.xy, 0.999999, 1.0);
}
