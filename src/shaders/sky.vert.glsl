varying vec2 vUv;

void main() {
  vUv = uv;
  // Quad em tela cheia no plano mais distante, ignorando a câmera: o céu é um
  // fundo 2D e nunca cobre o produto.
  gl_Position = vec4(position.xy, 0.999999, 1.0);
}
