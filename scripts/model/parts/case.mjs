// Caixa: `case_base` (corpo, pés, portas, dobradiça de baixo, apoios das placas) e
// `case_lid` (tampa, com o eixo da dobradiça na origem do nó).
import { THREE, box, crease, cyl, place, slab, subtract, merge } from "../lib/geom.mjs";
import { Part, anchor } from "../lib/part.mjs";
import { textGeometry } from "../lib/text.mjs";
import { C, MM, PORT_X, PORT_Y } from "../dims.mjs";
import { BOARDS } from "./boards.mjs";

/** Cilindro deitado ao longo de x, centrado na origem. */
const rod = (radius, length, opts = {}) => place(cyl(radius, length, { seg: 28, edge: radius * 0.1, centered: true, ...opts }), { rot: [0, 0, 90] });

/** Corpo + piso + pés. As aberturas da frente e o furo do cabo saem por CSG. */
export function buildCaseBase() {
  const base = new Part("case_base");
  const inner = { width: C.L - 2 * C.wall, depth: C.W - 2 * C.wall, radius: C.corner - C.wall };

  const ring = place(
    slab({ width: C.L, depth: C.W, height: C.body, radius: C.corner, bevel: C.bevel, hole: inner, bevelSegments: 5 }),
    { pos: [0, C.feet, 0] },
  );

  // Aberturas na parede da frente (a parede vai de z = W/2 - wall a W/2).
  const frontZ = C.W / 2 - C.wall / 2;
  const cutBox = (w, h, x, r) => place(box(w, h, 0.07, { r, seg: 3 }), { pos: [x, PORT_Y, frontZ] });
  const cutters = [
    cutBox(0.138, 0.06, PORT_X.usbA, 0.006),
    cutBox(0.094, 0.038, PORT_X.usbC, 0.018),
    cutBox(0.106, 0.062, PORT_X.switch, 0.008),
    // LED: furo redondo.
    place(cyl(0.0185, 0.07, { seg: 32, edge: 0.001, centered: true }), { rot: [90, 0, 0], pos: [PORT_X.led, PORT_Y, frontZ] }),
    // Entrada do cabo do painel, atrás, do lado direito.
    place(cyl(0.03, 0.07, { seg: 32, edge: 0.001, centered: true }), { rot: [90, 0, 0], pos: [C.L * 0.3, C.feet + C.body * 0.42, -frontZ] }),
  ];
  base.add(subtract(ring, cutters), "case_matte");

  // Piso interno.
  base.add(
    place(slab({ width: inner.width + 0.004, depth: inner.depth + 0.004, height: C.wall, radius: inner.radius, bevel: 0 }), { pos: [0, C.feet, 0] }),
    "case_inside",
  );

  // Pés de borracha.
  const feet = [];
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      feet.push(place(cyl(0.052, C.feet + 0.002, { seg: 28, edge: 0.005 }), { pos: [sx * (C.L / 2 - 0.13), 0, sz * (C.W / 2 - 0.12)] }));
    }
  }
  base.add(merge(feet), "rubber");

  // Anel de borracha no furo do cabo.
  base.add(
    place(
      crease(new THREE.TorusGeometry(0.033, 0.0075, 12, 32), 60),
      { rot: [0, 0, 0], pos: [C.L * 0.3, C.feet + C.body * 0.42, -C.W / 2 - 0.001] },
    ),
    "rubber",
  );

  // Apoios das placas (ficam na caixa quando as placas sobem na vista explodida).
  const posts = [];
  for (const b of Object.values(BOARDS)) {
    const height = b.y - b.thickness / 2 - (C.feet + C.wall);
    for (const [px, pz] of b.posts) {
      // Os pontos vêm no espaço da placa (x = comprimento, z = largura); a placa gira 90° em y.
      const wx = b.x + pz;
      const wz = b.z - px;
      posts.push(place(cyl(0.0095, height, { seg: 14, edge: 0.0015 }), { pos: [wx, C.feet + C.wall, wz] }));
    }
  }
  base.add(merge(posts), "black_plastic");

  // Cilindros da dobradiça (a base tem dois, nas pontas) e as abas que os ligam à parede de trás.
  const barrels = [];
  const leaves = [];
  for (const [x0, x1] of [[-0.7, -0.4], [0.4, 0.7]]) {
    const len = x1 - x0;
    barrels.push(place(rod(0.023, len), { pos: [(x0 + x1) / 2, C.hingeY, C.hingeZ] }));
    leaves.push(place(box(len, 0.05, 0.03, { r: 0.006 }), { pos: [(x0 + x1) / 2, C.hingeY - 0.03, C.hingeZ + 0.016] }));
  }
  base.add(merge(barrels), "steel");
  base.add(merge(leaves), "case_matte");

  // Chave liga/desliga: moldura preta na abertura e a gangorra inclinada.
  const sw = [
    place(box(0.1, 0.056, 0.012, { r: 0.006 }), { pos: [PORT_X.switch, PORT_Y, C.W / 2 - 0.024] }),
  ];
  base.add(merge(sw), "black_plastic");
  base.add(place(box(0.082, 0.04, 0.026, { r: 0.008 }), { rot: [-9, 0, 0], pos: [PORT_X.switch, PORT_Y, C.W / 2 - 0.006] }), "case_matte");
  base.add(place(cyl(0.0042, 0.0012, { seg: 16, edge: 0.0002 }), { rot: [90, 0, 0], pos: [PORT_X.switch + 0.024, PORT_Y + 0.003, C.W / 2 + 0.0075] }), "solder");

  base.child(anchor("grommet", [C.L * 0.3, C.feet + C.body * 0.42, -C.W / 2 - 0.02], [180, 0, 0]));
  return base;
}

/** Tampa. Origem no eixo da dobradiça; a tampa se estende para +z. */
export async function buildCaseLid() {
  const lid = new Part("case_lid", { pos: [0, C.hingeY, C.hingeZ] });
  const z0 = -C.hingeZ; // centro da tampa em z, a partir do eixo
  const bottom = -2 * MM; // a base da tampa fica 2 mm abaixo do eixo

  lid.add(place(slab({ width: C.L, depth: C.W, height: C.lid, radius: C.corner, bevel: C.bevel, bevelSegments: 5 }), { pos: [0, bottom, z0] }), "case_matte");

  // Aba que encaixa dentro da caixa (aparece quando a tampa abre).
  lid.add(
    place(
      slab({ width: C.L - 2 * C.wall - 0.008, depth: C.W - 2 * C.wall - 0.008, height: 1.4 * MM * 2 + 0.004, radius: C.corner - C.wall, bevel: 0.002 }),
      { pos: [0, bottom - 1.4 * MM * 2, z0] },
    ),
    "case_inside",
  );

  // Cilindro da dobradiça no meio e a aba que o liga à tampa.
  lid.add(place(rod(0.023, 0.34), { pos: [0, 0, 0] }), "steel");
  lid.add(place(box(0.34, 0.045, 0.05, { r: 0.006 }), { pos: [0, bottom + 0.022, 0.024] }), "case_matte");
  // Pino da dobradiça, atravessando tudo.
  lid.add(place(rod(0.0085, 1.44, { edge: 0.002 }), { pos: [0, 0, 0] }), "steel_dark");

  // Parafusos de cabeça chata nos quatro cantos.
  const screws = [];
  const top = bottom + C.lid;
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      screws.push(place(cyl(0.02, 0.005, { seg: 24, edge: 0.0012 }), { pos: [sx * (C.L / 2 - 0.075), top - 0.0008, z0 + sz * (C.W / 2 - 0.075)] }));
    }
  }
  lid.add(merge(screws), "steel");

  // O nome SunTech em relevo, na Archivo do site (largura 125%, peso 800): letras de aço escovado.
  const logo = await textGeometry("SunTech", { capHeight: 0.082, depth: 0.0055 });
  lid.add(place(logo, { pos: [0, top - 0.0004, z0] }), "logo_metal");

  lid.child(anchor("lid_top", [0, top, z0]));
  return lid;
}

export { PORT_X, PORT_Y };
