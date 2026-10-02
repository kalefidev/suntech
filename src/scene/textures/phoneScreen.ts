import type { CanvasTexture } from "three";
import { makeCanvas, toTexture } from "./canvas";
import { num } from "../../content/format";

/**
 * Tela do celular (seção 8 do brief): fundo escuro, ícone de bateria e a
 * porcentagem da carga, numa `CanvasTexture`. Só redesenha quando o número
 * inteiro muda, nunca por quadro (seção 11 do brief). É uma simulação: o DOM
 * diz isso ao lado da cena ("Simulação. Estimativa: ...").
 */
export function createPhoneScreen(height: number) {
  const h = Math.round(height);
  const w = Math.round(h * 0.46);
  const { canvas, ctx } = makeCanvas(w, h);
  const texture: CanvasTexture = toTexture(canvas, { color: true, anisotropy: 4 });
  let shown = -1;

  const draw = (percent: number) => {
    const value = Math.max(0, Math.min(100, Math.round(percent)));
    if (value === shown) return;
    shown = value;

    ctx.fillStyle = "#06080C";
    ctx.fillRect(0, 0, w, h);

    // Ícone da bateria: contorno claro e preenchimento verde (energia guardada).
    const bw = w * 0.34;
    const bh = h * 0.3;
    const bx = (w - bw) / 2;
    const by = h * 0.24;
    const line = Math.max(2, w * 0.022);
    ctx.strokeStyle = "#F4F7FA";
    ctx.lineWidth = line;
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, bw * 0.14);
    ctx.stroke();
    ctx.fillStyle = "#F4F7FA";
    ctx.beginPath();
    ctx.roundRect(bx + bw * 0.32, by - h * 0.022, bw * 0.36, h * 0.024, line);
    ctx.fill();
    const inset = line * 1.8;
    const fill = (bh - inset * 2) * (value / 100);
    ctx.fillStyle = "#3DDC97";
    ctx.beginPath();
    ctx.roundRect(bx + inset, by + bh - inset - fill, bw - inset * 2, Math.max(0.001, fill), bw * 0.06);
    ctx.fill();

    // Raio de carga (saída de 5 V, azul), por cima do ícone.
    const cx = w / 2;
    const cy = by + bh / 2;
    const s = bh * 0.2;
    ctx.fillStyle = "#4CC9F0";
    ctx.beginPath();
    ctx.moveTo(cx + s * 0.25, cy - s);
    ctx.lineTo(cx - s * 0.45, cy + s * 0.12);
    ctx.lineTo(cx - s * 0.02, cy + s * 0.12);
    ctx.lineTo(cx - s * 0.25, cy + s);
    ctx.lineTo(cx + s * 0.45, cy - s * 0.12);
    ctx.lineTo(cx + s * 0.02, cy - s * 0.12);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#F4F7FA";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `700 expanded ${Math.round(w * 0.2)}px "Archivo", sans-serif`;
    ctx.fillText(`${num(value)}%`, w / 2, h * 0.68);

    texture.needsUpdate = true;
  };

  draw(0);
  return { texture, draw };
}
