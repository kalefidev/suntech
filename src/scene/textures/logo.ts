import { makeCanvas, toTexture } from "./canvas";

/**
 * "SunTech" em baixo-relevo na tampa (seção 8 do brief): o texto vira um mapa
 * de altura (letras rebaixadas) e daí um mapa de normais. Vai num decalque
 * coplanar à tampa, com o mesmo material: fora das letras, a normal é reta e
 * o decalque some; nas letras, a luz desenha o rebaixo.
 */
export function createLogoNormal(text: string, width: number) {
  const height = Math.round(width / 4);
  const { canvas, ctx } = makeCanvas(width, height);

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#fff";
  ctx.font = `800 expanded ${Math.round(height * 0.6)}px "Archivo", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // Borda do rebaixo um pouco arredondada, como plástico injetado.
  ctx.filter = `blur(${Math.max(1, width / 600)}px)`;
  ctx.fillText(text, width / 2, height * 0.55);
  ctx.filter = "none";

  const source = ctx.getImageData(0, 0, width, height).data;
  const out = ctx.createImageData(width, height);
  const at = (x: number, y: number) => {
    const cx = Math.min(width - 1, Math.max(0, x));
    const cy = Math.min(height - 1, Math.max(0, y));
    return source[(cy * width + cx) * 4] / 255;
  };
  const depth = 2.2;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Rebaixo: a altura é o negativo das letras. A linha do canvas cresce para
      // baixo, e o v da textura cresce para cima (flipY).
      const du = (at(x + 1, y) - at(x - 1, y)) * depth;
      const dv = -(at(x, y + 1) - at(x, y - 1)) * depth;
      const len = Math.hypot(du, dv, 1);
      const i = (y * width + x) * 4;
      out.data[i] = ((du / len) * 0.5 + 0.5) * 255;
      out.data[i + 1] = ((dv / len) * 0.5 + 0.5) * 255;
      out.data[i + 2] = ((1 / len) * 0.5 + 0.5) * 255;
      out.data[i + 3] = 255;
    }
  }
  ctx.putImageData(out, 0, 0);
  return toTexture(canvas, { anisotropy: 8 });
}
