import { makeCanvas, seeded, toTexture } from "./canvas";
import { product } from "../../content/product";
import { unit } from "../../content/format";

/**
 * Placas de circuito: máscara de solda, trilhas, pads e serigrafia com os nomes reais dos
 * módulos. As posições são as do modelo (scripts/model/parts/boards.mjs): a face de cima da
 * placa tem uv 0..1 (u = x/largura + 0,5, v = 0,5 − z/profundidade), e o desenho em pixels é
 * `px = (x/W + 0,5) · w`, `py = (z/D + 0,5) · h`. Os componentes (chips, conectores, LEDs) são
 * geometria por cima; aqui ficam os pés deles (contornos), as trilhas e os textos.
 */

type Ctx = CanvasRenderingContext2D;
type Frame = { ctx: Ctx; w: number; h: number; W: number; D: number };

const px = (f: Frame, x: number) => (x / f.W + 0.5) * f.w;
const py = (f: Frame, z: number) => (z / f.D + 0.5) * f.h;
const sx = (f: Frame, d: number) => (d / f.W) * f.w;
const sy = (f: Frame, d: number) => (d / f.D) * f.h;

const SILK = "#F2F2EE";
const GOLD = "#D9B866";

function mask(f: Frame, base: string, speckle: string) {
  f.ctx.fillStyle = base;
  f.ctx.fillRect(0, 0, f.w, f.h);
  // Textura sutil da máscara de solda (fibra do laminado), quase invisível.
  const random = seeded(11);
  f.ctx.fillStyle = speckle;
  for (let i = 0; i < (f.w * f.h) / 700; i++) f.ctx.fillRect(random() * f.w, random() * f.h, 1 + random() * 2, 1 + random() * 2);
}

function trace(f: Frame, points: Array<[number, number]>, width: number, color: string) {
  const { ctx } = f;
  ctx.strokeStyle = color;
  ctx.lineWidth = sx(f, width);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  points.forEach(([x, z], i) => (i ? ctx.lineTo(px(f, x), py(f, z)) : ctx.moveTo(px(f, x), py(f, z))));
  ctx.stroke();
}

function pad(f: Frame, x: number, z: number, w: number, d: number) {
  const { ctx } = f;
  ctx.fillStyle = GOLD;
  ctx.fillRect(px(f, x) - sx(f, w) / 2, py(f, z) - sy(f, d) / 2, sx(f, w), sy(f, d));
  ctx.strokeStyle = "rgba(0,0,0,0.25)";
  ctx.lineWidth = Math.max(1, sx(f, 0.0015));
  ctx.strokeRect(px(f, x) - sx(f, w) / 2, py(f, z) - sy(f, d) / 2, sx(f, w), sy(f, d));
}

function outline(f: Frame, x: number, z: number, w: number, d: number) {
  const { ctx } = f;
  ctx.strokeStyle = SILK;
  ctx.lineWidth = Math.max(1, sx(f, 0.0016));
  ctx.strokeRect(px(f, x) - sx(f, w) / 2, py(f, z) - sy(f, d) / 2, sx(f, w), sy(f, d));
}

function text(f: Frame, value: string, x: number, z: number, size: number, align: CanvasTextAlign = "center", rotate = 0) {
  const { ctx } = f;
  ctx.save();
  ctx.translate(px(f, x), py(f, z));
  ctx.rotate(rotate);
  ctx.fillStyle = SILK;
  ctx.font = `700 ${Math.round(sx(f, size))}px "Archivo", sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillText(value, 0, 0);
  ctx.restore();
}

function vias(f: Frame, list: Array<[number, number]>) {
  const { ctx } = f;
  for (const [x, z] of list) {
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.beginPath();
    ctx.arc(px(f, x), py(f, z), sx(f, 0.0045), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.beginPath();
    ctx.arc(px(f, x), py(f, z), sx(f, 0.0018), 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Módulo de carga TP4056 com proteção DW01 (placa azul, USB-C à esquerda). 0,26 × 0,17. */
export function createChargerMap(size: number) {
  const W = 0.26;
  const D = 0.17;
  const w = size;
  const h = Math.round((size * D) / W);
  const { canvas, ctx } = makeCanvas(w, h);
  const f: Frame = { ctx, w, h, W, D };
  mask(f, "#1B52A3", "rgba(10, 30, 70, 0.22)");

  // Trilhas (cobre sob a máscara, um tom acima).
  const cu = "#2E6BC0";
  trace(f, [[-0.1, 0.065], [-0.07, 0.065], [-0.058, 0.04], [-0.04, 0.02]], 0.007, cu);
  trace(f, [[-0.1, -0.065], [-0.07, -0.065], [-0.058, -0.04], [-0.04, -0.02]], 0.007, cu);
  trace(f, [[-0.034, 0.064], [-0.034, 0.03], [-0.036, 0.0]], 0.004, cu);
  trace(f, [[-0.034, -0.064], [-0.034, -0.03], [-0.036, 0.0]], 0.004, cu);
  trace(f, [[0.012, 0.02], [0.04, 0.045], [0.07, 0.048], [0.106, 0.062]], 0.005, cu);
  trace(f, [[0.012, -0.02], [0.04, -0.022], [0.07, -0.022], [0.106, -0.062]], 0.005, cu);
  trace(f, [[0.07, 0.048], [0.07, 0.0], [0.106, 0.021]], 0.005, cu);
  trace(f, [[0.07, -0.022], [0.09, -0.01], [0.106, -0.021]], 0.005, cu);
  trace(f, [[-0.012, 0.02], [0.0, 0.052], [0.02, 0.05]], 0.003, cu);
  trace(f, [[-0.012, -0.02], [0.0, -0.05], [0.02, -0.05]], 0.003, cu);
  vias(f, [[-0.058, 0.04], [-0.058, -0.04], [0.04, 0.045], [0.04, -0.022], [0.09, -0.01], [0.0, 0.052], [0.0, -0.05]]);

  // Pads (entrada junto ao USB; bateria e saída na outra ponta).
  for (const z of [-0.065, 0.065]) pad(f, -0.108, z, 0.034, 0.026);
  for (const z of [-0.062, -0.021, 0.021, 0.062]) pad(f, 0.106, z, 0.036, 0.026);

  // Serigrafia: nomes dos pads, pés dos componentes e a marca do módulo.
  const small = 0.0085;
  text(f, "IN+", -0.108, 0.043, small);
  text(f, "IN−", -0.108, -0.043, small);
  text(f, "B+", 0.088, 0.075, small);
  text(f, "OUT+", 0.083, 0.0, small * 0.9, "center");
  text(f, "B−", 0.088, -0.075, small);
  outline(f, -0.012, 0, 0.058, 0.048);
  text(f, product.charger.module, -0.012, -0.034, 0.011);
  outline(f, 0.07, 0.048, 0.036, 0.022);
  outline(f, 0.07, -0.022, 0.036, 0.05);
  text(f, product.charger.protection, 0.07, 0.074, 0.007);
  text(f, "8205", 0.07, -0.056, 0.007);
  for (const [x, z, name] of [[-0.046, 0.052, "R1"], [-0.046, -0.052, "R2"], [0.02, 0.05, "R3"], [0.02, -0.05, "R4"], [0.034, 0.034, "R5"]] as const) {
    outline(f, x, z, 0.023, 0.0135);
    text(f, name, x, z + (z > 0 ? 0.013 : -0.013), 0.0055);
  }
  for (const z of [-0.062, 0.062]) outline(f, -0.068, z, 0.027, 0.0185);
  text(f, "CHRG", -0.034, 0.082, 0.0065);
  text(f, "STDBY", -0.034, -0.082, 0.0065);
  text(f, `1A ${product.battery.format}`, 0.034, 0.0, 0.0075, "center", -Math.PI / 2);

  return toTexture(canvas, { color: true, anisotropy: 8 });
}

/** Conversor boost de 3,7 V para 5 V com a saída USB-A (placa preta). 0,22 × 0,22. */
export function createBoostMap(size: number) {
  const W = 0.22;
  const D = 0.22;
  const w = size;
  const h = size;
  const { canvas, ctx } = makeCanvas(w, h);
  const f: Frame = { ctx, w, h, W, D };
  mask(f, "#17191E", "rgba(255, 255, 255, 0.05)");

  const cu = "#2B3038";
  trace(f, [[0.098, -0.05], [0.07, -0.05], [0.04, -0.055]], 0.007, cu);
  trace(f, [[0.098, 0.05], [0.09, 0.03], [0.085, 0.0]], 0.007, cu);
  trace(f, [[0.04, -0.055], [0.0, -0.075], [-0.04, -0.05]], 0.005, cu);
  trace(f, [[0.085, 0.0], [0.065, 0.07], [0.0, 0.08]], 0.006, cu);
  trace(f, [[-0.03, -0.04], [-0.01, 0.0], [-0.01, 0.075]], 0.004, cu);
  trace(f, [[-0.1, 0.02], [-0.07, 0.02], [-0.04, 0.012]], 0.009, cu);
  vias(f, [[0.07, -0.05], [0.09, 0.03], [0.0, -0.075], [0.065, 0.0], [-0.01, 0.0]]);

  pad(f, 0.098, -0.05, 0.03, 0.026);
  pad(f, 0.098, 0.05, 0.03, 0.026);
  const small = 0.0085;
  text(f, "IN−", 0.082, -0.075, small);
  text(f, "IN+", 0.082, 0.075, small);
  outline(f, 0.04, -0.055, 0.058, 0.058);
  text(f, "L1", 0.04, -0.092, 0.008);
  outline(f, 0.085, 0.0, 0.05, 0.033);
  text(f, "D1", 0.085, 0.024, 0.0075);
  outline(f, 0.0, -0.075, 0.036, 0.023);
  text(f, "U1", 0.0, -0.092, 0.0075);
  outline(f, -0.01, 0.075, 0.052, 0.052);
  text(f, "RV1", -0.01, 0.103, 0.0075);
  for (const [x, z, name] of [[-0.03, -0.04, "R1"], [0.02, 0.03, "R2"], [-0.04, 0.012, "R3"]] as const) {
    outline(f, x, z, 0.023, 0.0135);
    text(f, name, x, z + 0.014, 0.0055);
  }
  text(f, `${unit(product.converter.toVolts, "V")} OUT`, -0.075, -0.07, 0.0105, "center", -Math.PI / 2);
  text(f, `${unit(product.converter.fromVolts, "V")} IN`, 0.0, 0.096, 0.0072);

  return toTexture(canvas, { color: true, anisotropy: 8 });
}
