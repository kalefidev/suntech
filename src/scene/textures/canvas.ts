import { CanvasTexture, SRGBColorSpace } from "three";

/** Canvas 2D para gerar uma textura em runtime (seção 4 do brief: nada de arquivo de imagem). */
export function makeCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width);
  canvas.height = Math.round(height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D indisponível");
  return { canvas, ctx };
}

/**
 * Textura a partir do canvas. Mapas de cor ficam em sRGB; mapas de dados
 * (rugosidade, metal, normal, máscara) ficam lineares, como o three espera.
 */
export function toTexture(canvas: HTMLCanvasElement, options: { color?: boolean; anisotropy?: number } = {}) {
  const texture = new CanvasTexture(canvas);
  if (options.color) texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = options.anisotropy ?? 4;
  return texture;
}

/** Ruído barato e determinístico (mesma textura em toda visita). */
export function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
