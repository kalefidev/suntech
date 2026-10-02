import { makeCanvas, seeded, toTexture } from "./canvas";

/**
 * Células monocristalinas de uma placa (seção 8 do brief): cantos chanfrados,
 * barramentos prateados e fingers finos sobre a lâmina de fundo.
 *
 * Duas texturas, na proporção da placa (4:3):
 * - `color`: cor (sRGB);
 * - `surface`: dados lineares. R é a máscara das células (o shader do brilho
 *   usa), G é a rugosidade e B é o metal, como o three lê.
 */

const COLS = 4;
const ROWS = 3;

/** Valores do mapa `surface` (máscara, rugosidade, metal). */
const BACKSHEET = [0, 0.7, 0] as const;
const CELL = [1, 0.32, 0] as const;
const FINGER = [1, 0.3, 0.5] as const;
const BUSBAR = [0, 0.24, 1] as const;

const rgb = (v: readonly [number, number, number]) =>
  `rgb(${Math.round(v[0] * 255)}, ${Math.round(v[1] * 255)}, ${Math.round(v[2] * 255)})`;

function cellPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, cut: number) {
  ctx.beginPath();
  ctx.moveTo(x + cut, y);
  ctx.lineTo(x + w - cut, y);
  ctx.lineTo(x + w, y + cut);
  ctx.lineTo(x + w, y + h - cut);
  ctx.lineTo(x + w - cut, y + h);
  ctx.lineTo(x + cut, y + h);
  ctx.lineTo(x, y + h - cut);
  ctx.lineTo(x, y + cut);
  ctx.closePath();
}

export function createCellMaps(size: number) {
  const W = size;
  const H = Math.round(size * 0.75);
  const color = makeCanvas(W, H);
  const surface = makeCanvas(W, H);
  const c = color.ctx;
  const s = surface.ctx;
  const random = seeded(7);

  const margin = W * 0.035;
  const gap = W * 0.012;
  const cw = (W - 2 * margin - (COLS - 1) * gap) / COLS;
  const ch = (H - 2 * margin - (ROWS - 1) * gap) / ROWS;
  const cut = cw * 0.13;
  const line = Math.max(1, W / 2048);
  const busbarW = Math.max(1.5, cw * 0.013);

  // Lâmina de fundo, cinza médio entre as células: o chanfro aparece como um
  // losango, sem deixar a placa quadriculada demais.
  c.fillStyle = "#59616C";
  c.fillRect(0, 0, W, H);
  s.fillStyle = rgb(BACKSHEET);
  s.fillRect(0, 0, W, H);

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x = margin + col * (cw + gap);
      const y = margin + row * (ch + gap);

      // Silício: azul-noite profundo, um pouco mais claro em cima.
      cellPath(c, x, y, cw, ch, cut);
      const gradient = c.createLinearGradient(x, y, x + cw * 0.3, y + ch);
      gradient.addColorStop(0, "#1A2A4C");
      gradient.addColorStop(1, "#0E1830");
      c.fillStyle = gradient;
      c.fill();
      cellPath(s, x, y, cw, ch, cut);
      s.fillStyle = rgb(CELL);
      s.fill();

      // Textura cristalina, quase invisível.
      c.save();
      cellPath(c, x, y, cw, ch, cut);
      c.clip();
      const specks = Math.round((cw * ch) / 90);
      for (let i = 0; i < specks; i++) {
        const light = random() > 0.5;
        c.fillStyle = light ? "rgba(90, 120, 190, 0.07)" : "rgba(0, 0, 10, 0.08)";
        c.fillRect(x + random() * cw, y + random() * ch, line * (1 + random() * 2), line * (1 + random() * 2));
      }

      // Fingers: linhas finas na horizontal, perpendiculares aos barramentos.
      const fingers = 30;
      c.fillStyle = "rgba(160, 172, 196, 0.30)";
      s.fillStyle = rgb(FINGER);
      for (let i = 1; i < fingers; i++) {
        const fy = y + (ch * i) / fingers;
        c.fillRect(x, fy, cw, line);
        s.fillRect(x, fy, cw, line);
      }
      c.restore();
    }
  }

  // Barramentos: três por célula, na vertical, ligando as linhas de células,
  // mais as fitas de ligação em cima e embaixo.
  c.fillStyle = "#C9CFD7";
  s.fillStyle = rgb(BUSBAR);
  for (let col = 0; col < COLS; col++) {
    const x = margin + col * (cw + gap);
    for (const f of [0.2, 0.5, 0.8]) {
      const bx = x + cw * f - busbarW / 2;
      c.fillRect(bx, margin * 0.55, busbarW, H - margin * 1.1);
      s.fillRect(bx, margin * 0.55, busbarW, H - margin * 1.1);
    }
  }
  const ribbon = Math.max(2, margin * 0.22);
  for (const ry of [margin * 0.5, H - margin * 0.5 - ribbon]) {
    c.fillRect(margin * 0.6, ry, W - margin * 1.2, ribbon);
    s.fillRect(margin * 0.6, ry, W - margin * 1.2, ribbon);
  }

  return {
    color: toTexture(color.canvas, { color: true, anisotropy: 8 }),
    surface: toTexture(surface.canvas, { anisotropy: 8 }),
  };
}
