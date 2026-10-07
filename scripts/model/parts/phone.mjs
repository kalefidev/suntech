// Celular (75 × 150 × 8 mm): corpo, vidro e tela (uv 0..1, o runtime põe a textura da carga),
// ilha de câmeras atrás, botões e a entrada USB-C embaixo. Origem no centro; tela para +z.
import { box, crease, cyl, merge, panelFace, place, slab } from "../lib/geom.mjs";
import { THREE } from "../lib/geom.mjs";
import { Part, anchor } from "../lib/part.mjs";
import { PHONE } from "../dims.mjs";

const { W, H, T } = PHONE;
/** Em pé ao lado da caixa, pairando 0,22 acima do chão (o plugue do cabo entra por baixo), para a cena de energia (o runtime mostra e esconde). */
export const PHONE_AT = [1.4, H / 2 + 0.22, 0.62];

export function buildPhone() {
  const part = new Part("phone", { pos: PHONE_AT, rot: [0, -14, 0] });

  // Corpo: extrusão em y vira espessura em z.
  part.add(place(slab({ width: W, depth: H, height: T, radius: 0.09, bevel: 0.013, bevelSegments: 5 }), { rot: [90, 0, 0], pos: [0, 0, -T / 2] }), "phone_body");

  // Vidro preto de borda a borda e a tela por cima (a tela leva a textura da carga).
  part.add(panelFace({ width: W - 0.03, height: H - 0.03, radius: 0.078, z: T / 2 + 0.0004 }), "phone_glass");
  part.add(panelFace({ width: W - 0.075, height: H - 0.09, radius: 0.06, z: T / 2 + 0.0009 }), "phone_screen");
  // Furo da câmera da frente.
  part.add(place(cyl(0.0125, 0.0008, { seg: 24, edge: 0.0001 }), { rot: [90, 0, 0], pos: [0, H / 2 - 0.062, T / 2 + 0.0011] }), "phone_lens");

  // Ilha das câmeras, atrás, no canto de cima.
  const island = place(slab({ width: 0.27, depth: 0.27, height: 0.012, radius: 0.05, bevel: 0.003 }), { rot: [-90, 0, 0], pos: [-W / 2 + 0.2, H / 2 - 0.2, -T / 2 - 0.012] });
  part.add(island, "phone_body");
  const rings = [];
  const lenses = [];
  for (const [dx, dy] of [[-0.052, 0.052], [-0.052, -0.052], [0.052, 0.0]]) {
    const pos = [-W / 2 + 0.2 + dx, H / 2 - 0.2 + dy, -T / 2 - 0.012 - 0.004];
    rings.push(place(cyl(0.05, 0.006, { seg: 32, edge: 0.001 }), { rot: [-90, 0, 0], pos: [pos[0], pos[1], pos[2] - 0.0] }));
    lenses.push(place(cyl(0.036, 0.0035, { seg: 32, edge: 0.002 }), { rot: [-90, 0, 0], pos: [pos[0], pos[1], pos[2] - 0.0045] }));
  }
  part.add(merge(rings), "steel_dark");
  part.add(merge(lenses), "phone_lens");

  // Botões laterais.
  const buttons = [
    place(box(0.007, 0.16, 0.012, { r: 0.0025 }), { pos: [W / 2 + 0.0015, 0.28, 0] }),
    place(box(0.007, 0.1, 0.012, { r: 0.0025 }), { pos: [-W / 2 - 0.0015, 0.35, 0] }),
    place(box(0.007, 0.1, 0.012, { r: 0.0025 }), { pos: [-W / 2 - 0.0015, 0.2, 0] }),
  ];
  part.add(merge(buttons), "steel_dark");

  // Entrada USB-C embaixo.
  part.add(place(box(0.095, 0.004, 0.026, { r: 0.0012 }), { pos: [0, -H / 2 + 0.0008, 0] }), "hole");
  // O −y do ponto é a saída do cabo (para baixo, pelo pé do celular).
  part.child(anchor("phone_connector", [0, -H / 2 - 0.004, 0]));
  part.child(anchor("label_phone", [0, 0, T / 2 + 0.02]));
  return part;
}

export { crease, THREE };
