import { makeCanvas, toTexture } from "./canvas";
import { product } from "../../content/product";
import { unit } from "../../content/format";

/**
 * Placas de circuito (seção 8 do brief): máscara de solda, trilhas, pads e
 * serigrafia com os nomes reais dos módulos. Os componentes (chips,
 * conectores e LEDs) são geometria por cima; aqui ficam só os desenhos.
 */

function board(ctx: CanvasRenderingContext2D, w: number, h: number, mask: string, trace: string) {
  ctx.fillStyle = mask;
  ctx.fillRect(0, 0, w, h);
  // Trilhas: um pouco mais claras que a máscara.
  ctx.strokeStyle = trace;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
}

function pad(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = "#C9CCD0";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
  ctx.fillRect(x, y + h * 0.7, w, h * 0.3);
}

function label(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, align: CanvasTextAlign = "left") {
  ctx.fillStyle = "#F2F2EE";
  ctx.font = `700 ${Math.round(size)}px "Archivo", sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
}

function outline(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, line: number) {
  ctx.strokeStyle = "#F2F2EE";
  ctx.lineWidth = line;
  ctx.strokeRect(x, y, w, h);
}

/** Módulo de carga TP4056 com proteção DW01 (placa azul, USB-C à esquerda). */
export function createChargerMap(size: number) {
  const w = size;
  const h = Math.round(size * 0.65);
  const { canvas, ctx } = makeCanvas(w, h);
  const u = w / 100;
  board(ctx, w, h, "#1C4C8C", "#2A63AB");

  ctx.lineWidth = u * 1.6;
  ctx.beginPath();
  ctx.moveTo(u * 18, h * 0.35);
  ctx.lineTo(u * 40, h * 0.35);
  ctx.lineTo(u * 48, h * 0.25);
  ctx.lineTo(u * 86, h * 0.25);
  ctx.moveTo(u * 18, h * 0.65);
  ctx.lineTo(u * 46, h * 0.65);
  ctx.lineTo(u * 52, h * 0.75);
  ctx.lineTo(u * 86, h * 0.75);
  ctx.moveTo(u * 56, h * 0.25);
  ctx.lineTo(u * 56, h * 0.5);
  ctx.lineTo(u * 70, h * 0.5);
  ctx.stroke();

  // Pads de entrada (perto do USB-C) e de bateria e saída (na outra ponta).
  pad(ctx, u * 2, h * 0.06, u * 9, h * 0.16);
  pad(ctx, u * 2, h * 0.78, u * 9, h * 0.16);
  pad(ctx, u * 88, h * 0.06, u * 10, h * 0.16);
  pad(ctx, u * 88, h * 0.31, u * 10, h * 0.16);
  pad(ctx, u * 88, h * 0.53, u * 10, h * 0.16);
  pad(ctx, u * 88, h * 0.78, u * 10, h * 0.16);

  const small = u * 4.2;
  label(ctx, "IN+", u * 13, h * 0.14, small);
  label(ctx, "IN−", u * 13, h * 0.86, small);
  label(ctx, "B+", u * 86, h * 0.14, small, "right");
  label(ctx, "OUT+", u * 86, h * 0.39, small, "right");
  label(ctx, "OUT−", u * 86, h * 0.61, small, "right");
  label(ctx, "B−", u * 86, h * 0.86, small, "right");

  // Contornos dos chips e o nome de cada um.
  outline(ctx, u * 30, h * 0.36, u * 16, h * 0.3, u * 0.6);
  label(ctx, product.charger.module, u * 38, h * 0.18, u * 5.4, "center");
  outline(ctx, u * 58, h * 0.56, u * 10, h * 0.2, u * 0.6);
  label(ctx, product.charger.protection, u * 63, h * 0.88, u * 4.6, "center");
  outline(ctx, u * 70, h * 0.32, u * 12, h * 0.22, u * 0.6);

  // LEDs do módulo: vermelho carregando, azul completo (só na placa, F1).
  ctx.fillStyle = "#D9372E";
  ctx.fillRect(u * 22, h * 0.08, u * 4, h * 0.1);
  ctx.fillStyle = "#3C7BEA";
  ctx.fillRect(u * 22, h * 0.82, u * 4, h * 0.1);

  return toTexture(canvas, { color: true, anisotropy: 8 });
}

/** Conversor boost de 3,7 V para 5 V com a saída USB-A (placa preta). */
export function createBoostMap(size: number) {
  const w = Math.round(size * 0.85);
  const h = Math.round(size * 0.65);
  const { canvas, ctx } = makeCanvas(w, h);
  const u = w / 100;
  board(ctx, w, h, "#1A1D22", "#2A2F37");

  ctx.lineWidth = u * 2;
  ctx.beginPath();
  ctx.moveTo(u * 8, h * 0.3);
  ctx.lineTo(u * 34, h * 0.3);
  ctx.lineTo(u * 40, h * 0.42);
  ctx.moveTo(u * 8, h * 0.7);
  ctx.lineTo(u * 46, h * 0.7);
  ctx.stroke();

  pad(ctx, u * 2, h * 0.18, u * 9, h * 0.18);
  pad(ctx, u * 2, h * 0.62, u * 9, h * 0.18);
  label(ctx, "IN+", u * 13, h * 0.27, u * 4.6);
  label(ctx, "IN−", u * 13, h * 0.71, u * 4.6);
  outline(ctx, u * 24, h * 0.42, u * 18, h * 0.22, u * 0.7);
  label(ctx, `${unit(product.converter.toVolts, "V")} OUT`, u * 33, h * 0.88, u * 5.2, "center");

  return toTexture(canvas, { color: true, anisotropy: 8 });
}
