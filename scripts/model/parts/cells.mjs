// Suporte das células e as duas 18650. `cell_holder` fica no piso da caixa; `cell_a` e `cell_b`
// são filhos dele, deitados ao longo de x, com o polo positivo em +x.
import { box, cyl, lathe, merge, place, slab, spring, subtract } from "../lib/geom.mjs";
import { Part } from "../lib/part.mjs";
import { C, CELL } from "../dims.mjs";

const HOLDER = { L: 0.72, W: 0.42, base: 0.014 };
const CELL_Y = HOLDER.base + CELL.radius; // centro das células, acima da base
const CELL_Z = CELL.radius + 0.0075;

/** Posição do suporte na caixa (no espaço da caixa). */
export const HOLDER_AT = [-0.32, C.feet + C.wall, -0.18];

function buildCell(name, z) {
  const part = new Part(name, { pos: [0, CELL_Y, z] });
  const r = CELL.radius;
  const half = CELL.length / 2;
  // Eixo em y, de 0 (negativo) a 0,65 (positivo); depois gira para x e centra.
  const align = (g) => place(g, { rot: [0, 0, -90], pos: [-half, 0, 0] });

  // Luva (rótulo): dois pontos, para o v do uv correr de uma ponta à outra.
  part.add(align(lathe([[r, 0.006], [r, 0.628]], { seg: 56 })), "cell_wrap");
  // Fundo negativo, de aço.
  part.add(align(lathe([[0, 0], [0.082, 0], [r - 0.002, 0.003], [r, 0.006]], { seg: 56 })), "steel");
  // Anel isolante e polo positivo (flange e botão).
  part.add(align(lathe([[r, 0.628], [r, 0.634], [r - 0.006, 0.639], [0.062, 0.639]], { seg: 56 })), "cell_ring");
  part.add(align(lathe([[0.062, 0.638], [0.062, 0.641], [0.04, 0.641], [0.04, 0.647], [0.036, 0.65], [0, 0.65]], { seg: 40 })), "steel");
  return part;
}

export function buildHolder() {
  const part = new Part("cell_holder", { pos: HOLDER_AT });
  const { L, W, base } = HOLDER;

  part.add(slab({ width: L, depth: W, height: base, radius: 0.02, bevel: 0.0035, bevelSegments: 3 }), "holder");
  // Trilhos laterais e o divisor do meio (as células se apoiam neles).
  const rails = [];
  for (const z of [-(W / 2 - 0.012), W / 2 - 0.012]) rails.push(place(box(L - 0.04, 0.05, 0.022, { r: 0.004 }), { pos: [0, base + 0.025, z] }));
  rails.push(place(box(L - 0.08, 0.034, 0.012, { r: 0.003 }), { pos: [0, base + 0.017, 0] }));
  part.add(merge(rails), "holder");

  // Paredes das pontas, com janela para os contatos.
  const wallT = 0.016;
  const walls = [];
  for (const sx of [-1, 1]) {
    const wall = place(box(wallT, 0.104, W - 0.01, { r: 0.004 }), { pos: [sx * (L / 2 - wallT / 2), base + 0.052, 0] });
    const windows = [-CELL_Z, CELL_Z].map((z) => place(cyl(0.036, 0.05, { seg: 28, edge: 0.001, centered: true }), { rot: [0, 0, 90], pos: [sx * (L / 2 - wallT / 2), CELL_Y, z] }));
    walls.push(subtract(wall, windows));
  }
  part.add(merge(walls), "holder");

  // Contatos: placa de aço no polo positivo (+x) e mola no negativo (−x).
  const half = CELL.length / 2;
  const contacts = [];
  const springs = [];
  for (const z of [-CELL_Z, CELL_Z]) {
    contacts.push(place(box(0.006, 0.05, 0.05, { r: 0.0016 }), { pos: [half + 0.0045, CELL_Y, z] }));
    springs.push(place(spring({ length: 0.02, radius: 0.026, wire: 0.0048, turns: 5 }), { pos: [-half - 0.0205, CELL_Y, z] }));
    contacts.push(place(box(0.004, 0.058, 0.058, { r: 0.0012 }), { pos: [-half - 0.0235, CELL_Y, z] }));
  }
  part.add(merge(contacts), "steel");
  part.add(merge(springs), "steel_dark");

  part.child(buildCell("cell_a", -CELL_Z));
  part.child(buildCell("cell_b", CELL_Z));
  return part;
}
