// Painel dobrável: o nó `panel` (origem na lombada, no meio da altura e na interface entre as
// duas placas) e as placas `panel_a` e `panel_b`, que giram na lombada (eixo y local).
// Montado: dobrado e em pé, com as células de uma placa de frente para as da outra.
// Cada placa: moldura de alumínio anodizado, células (com uv 0..1), fundo e pés de borracha.
import { box, crease, cyl, merge, panelFace, place, slab } from "../lib/geom.mjs";
import { Part, anchor } from "../lib/part.mjs";
import { textGeometry } from "../lib/text.mjs";
import { P } from "../dims.mjs";

const { L, H, T, frame: F } = P;
export const PANEL_LIFT = 0.04;
/** Posição do painel dobrado no mundo: a lombada em x = −L/2, para o conjunto dobrado ficar centrado em x = 0 (o runtime desliza +L/2 ao abrir). Atrás da caixa; os pés tocam o chão. */
export const PANEL_AT = [-L / 2, H / 2 + PANEL_LIFT, -0.6];

/** Uma placa que se estende de x = 0 a x = side·L, com as células viradas para +z. */
function plateParts(part, { side, knuckles }) {
  // Moldura: anel extrudado ao longo de z, de z = −T a 0.
  const ring = place(
    slab({ width: L, depth: H, height: T, radius: 0.012, bevel: 0.0016, bevelSegments: 3, hole: { width: L - 2 * F, depth: H - 2 * F, radius: 0.004 } }),
    { rot: [90, 0, 0], pos: [(side * L) / 2, 0, -T] },
  );
  part.add(ring, "anodized");

  // Células: plano recuado, com a textura da grade 4×3 (uv 0..1).
  const cells = panelFace({ width: L - 2 * F, height: H - 2 * F, z: -0.012 });
  part.add(place(cells, { pos: [(side * L) / 2, 0, 0] }), "cells");
  // Fundo, virado para trás.
  part.add(place(panelFace({ width: L - 2 * F + 0.004, height: H - 2 * F + 0.004, z: -T + 0.0008, flip: true }), { pos: [(side * L) / 2, 0, 0] }), "backsheet");

  // Gomos da dobradiça, na lombada.
  const barrels = knuckles.map(([y0, y1]) => place(cyl(0.03, y1 - y0, { seg: 24, edge: 0.003 }), { pos: [0, y0, -T / 2] }));
  part.add(merge(barrels), "steel");
  // Pezinhos de borracha embaixo (o painel fica 4 mm acima do chão).
  const pads = [0.16, L - 0.16].map((x) => place(box(0.09, PANEL_LIFT, T * 1.1, { r: 0.006 }), { pos: [side * x, -H / 2 - PANEL_LIFT / 2 + 0.002, -T / 2] }));
  part.add(merge(pads), "rubber");
}

export async function buildPanel() {
  const panel = new Part("panel", { pos: PANEL_AT });

  const a = new Part("panel_a");
  plateParts(a, { side: 1, knuckles: [[-H / 2 + 0.03, -0.36], [0.0, 0.36]] });
  // Caixa de junção atrás da placa A, perto do canto de baixo; o cabo sai por baixo dela.
  const jb = place(box(0.24, 0.16, 0.038, { r: 0.012, seg: 3 }), { pos: [L - 0.36, -H / 2 + 0.3, -T - 0.019] });
  a.add(jb, "black_plastic");
  a.add(place(cyl(0.016, 0.03, { seg: 20, edge: 0.002 }), { pos: [L - 0.3, -H / 2 + 0.22, -T - 0.019] }), "rubber");
  a.child(anchor("junction", [L - 0.3, -H / 2 + 0.2, -T - 0.019], [90, 0, 0]));

  const b = new Part("panel_b", { rot: [0, 180, 0] });
  plateParts(b, { side: -1, knuckles: [[-0.36, 0.0], [0.36, H / 2 - 0.03]] });
  // O nome SunTech impresso na face de fora da placa B (a que fica de frente quando o painel está dobrado):
  // letras de pouco relevo, cinza, lidas de fora (a placa B gira 180° em y, então o texto gira junto).
  const print = await textGeometry("SunTech", { capHeight: 0.15, depth: 0.0028, bevelSegments: 1, curveSegments: 3 });
  // Primeiro em pé (extrusão para +z, leitura para +x), depois de costas para o fundo (x e z invertidos).
  b.add(place(place(print, { rot: [90, 0, 0] }), { rot: [0, 180, 0], pos: [-L / 2, 0, -T + 0.0007] }), "print_gray");

  // A placa B é desenhada para −x (aberta, ao lado da A) e gira 180° em y para dobrar sobre a A; o runtime abre de 180° a 0°.

  panel.child(a);
  panel.child(b);
  panel.child(anchor("label_panel", [L * 0.5, 0, T + 0.02]));
  return panel;
}

export { crease };
