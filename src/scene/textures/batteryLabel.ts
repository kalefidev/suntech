import { makeCanvas, toTexture } from "./canvas";
import { product } from "../../content/product";
import { unit } from "../../content/format";

/**
 * Rótulo de uma célula 18650, enrolado no cilindro: u dá a volta, v corre ao
 * longo do eixo (o texto segue o comprimento, como nas células reais).
 */
export function createBatteryLabel(size: number) {
  // 18 mm de diâmetro (56,5 mm de volta) por 65 mm de comprimento.
  const w = size;
  const h = Math.round(size * (65 / 56.5));
  const { canvas, ctx } = makeCanvas(w, h);
  const b = product.battery;

  ctx.fillStyle = "#6E2A27";
  ctx.fillRect(0, 0, w, h);
  // Faixas finas perto das pontas.
  ctx.fillStyle = "#E9D8C4";
  ctx.fillRect(0, h * 0.06, w, h * 0.012);
  ctx.fillRect(0, h * 0.928, w, h * 0.012);

  ctx.save();
  ctx.translate(w * 0.5, h * 0.5);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = "#F3E6D5";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // Duas faces do rótulo, em lados opostos do cilindro.
  for (const offset of [-w * 0.25, w * 0.25]) {
    ctx.font = `800 expanded ${Math.round(w * 0.085)}px "Archivo", sans-serif`;
    ctx.fillText(`Li-ion ${b.format}`, 0, offset - w * 0.05);
    ctx.font = `600 ${Math.round(w * 0.06)}px "Archivo", sans-serif`;
    ctx.fillText(`${unit(b.voltsEach, "V")}  ${unit(b.mAhEach, "mAh")}`, 0, offset + w * 0.06);
  }
  ctx.restore();

  return toTexture(canvas, { color: true, anisotropy: 4 });
}
