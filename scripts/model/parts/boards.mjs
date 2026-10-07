// Placas: `pcb_charge` (módulo de carga TP4056 com proteção DW01, USB-C na frente) e
// `pcb_boost` (conversor boost de 3,7 V para 5 V, com a `usb_port` e o `led` nele).
// As duas giram 90° em y na caixa: o x da placa vira o −z do mundo, e a frente
// (USB) fica em +z. Eixos locais: x = comprimento (USB em −x), z = largura, y = para cima.
import { THREE, box, crease, cyl, merge, place, plate, slab, subtract } from "../lib/geom.mjs";
import { Part, anchor } from "../lib/part.mjs";
import { C, PORT_X, PORT_Y } from "../dims.mjs";

const T = 0.016; // placa de 1,6 mm
const TOP = T / 2;

/** Onde cada placa fica na caixa (a caixa tem a origem no centro do piso). */
export const BOARDS = {
  charge: {
    x: PORT_X.usbC,
    y: PORT_Y - (TOP + 0.016),
    z: 0.335,
    thickness: T,
    posts: [[-0.1, -0.06], [-0.1, 0.06], [0.1, -0.06], [0.1, 0.06]],
  },
  boost: {
    x: 0.42,
    y: PORT_Y - (TOP + 0.02875),
    z: 0.33,
    thickness: T,
    posts: [[-0.08, -0.08], [-0.08, 0.08], [0.085, -0.08], [0.085, 0.08]],
  },
};

// ---------------------------------------------------------------- componentes

/** Componente SMD de cantos arredondados em cima da placa. */
const smd = (w, d, h, x, z, y = 0) => place(box(w, h, d, { r: Math.min(w, d, h) * 0.18, seg: 2 }), { pos: [x, TOP + y + h / 2, z] });

/** Pernas de um CI de duas fileiras (gull-wing), em x = centro, ao longo de z. */
function gullLegs({ x, count, pitch, spanZ, w = 0.004, len = 0.012, h = 0.0022 }) {
  const legs = [];
  for (let i = 0; i < count; i++) {
    const px = x + (i - (count - 1) / 2) * pitch;
    for (const s of [-1, 1]) legs.push(place(box(w, h, len, { r: h * 0.3, seg: 1 }), { pos: [px, TOP + h / 2 + 0.0006, s * spanZ] }));
  }
  return merge(legs);
}

const pad = (x, z, w = 0.04, d = 0.026) => place(box(w, 0.0014, d, { r: 0.0006, seg: 1 }), { pos: [x, TOP + 0.0006, z] });

/** Bordas e face de cima da placa (a face leva a textura da máscara de solda). */
function board(part, { w, d, edge, top, radius = 0.012 }) {
  part.add(place(slab({ width: w, depth: d, height: T, radius, bevel: 0.0005, bevelSegments: 2 }), { pos: [0, -TOP, 0] }), edge);
  part.add(plate({ width: w - 0.0016, depth: d - 0.0016, radius: radius - 0.0008, y: TOP + 0.0002 }), top);
}

/** Conector USB-C fêmea: casca de aço em estádio, boca rebaixada e lingueta com contatos. */
function usbC(part, { x0 = -0.145, len = 0.075 }) {
  const w = 0.0895;
  const h = 0.032;
  const shell = place(slab({ width: h, depth: w, height: len, radius: h / 2 - 0.0005, bevel: 0.002, bevelSegments: 3 }), { rot: [0, 0, -90], pos: [x0, TOP + h / 2, 0] });
  const pocket = place(slab({ width: h - 0.007, depth: w - 0.007, height: 0.05, radius: (h - 0.007) / 2 - 0.0005, bevel: 0 }), { rot: [0, 0, -90], pos: [x0 - 0.001, TOP + h / 2, 0] });
  part.add(subtract(shell, [pocket]), "steel");
  part.add(place(box(0.045, 0.0075, 0.0068, { r: 0.0012, seg: 1 }), { pos: [x0 + 0.032, TOP + h / 2, 0] }), "black_plastic");
  const contacts = [];
  for (let i = 0; i < 6; i++) contacts.push(place(box(0.03, 0.0008, 0.0048, { r: 0.0003, seg: 1 }), { pos: [x0 + 0.02, TOP + h / 2 + 0.0043, (i - 2.5) * 0.0069 * 1.0] }));
  part.add(merge(contacts), "gold");
}

// -------------------------------------------------------------------- TP4056

export function buildChargeBoard() {
  const b = BOARDS.charge;
  const part = new Part("pcb_charge", { pos: [b.x, b.y, b.z], rot: [0, 90, 0] });
  board(part, { w: 0.26, d: 0.17, edge: "pcb_edge_blue", top: "pcb_charge_top" });
  usbC(part, {});

  // TP4056 (SOP-8 com pad térmico) e a ponta de pino 1.
  part.add(place(box(0.049, 0.0152, 0.039, { r: 0.0028, seg: 2 }), { pos: [-0.012, TOP + 0.0076, 0] }), "chip");
  part.add(gullLegs({ x: -0.012, count: 4, pitch: 0.0127, spanZ: 0.0225 }), "solder");
  part.add(place(cyl(0.0035, 0.0006, { seg: 14, edge: 0.0001 }), { pos: [-0.012 - 0.018, TOP + 0.0152, -0.011] }), "case_inside");
  // DW01A (SOT-23-6) e FS8205A (TSSOP-8).
  part.add(smd(0.029, 0.016, 0.011, 0.07, 0.048), "chip");
  part.add(gullLegs({ x: 0.07, count: 3, pitch: 0.0095, spanZ: 0.0105, w: 0.0035, len: 0.007, h: 0.0016 }), "solder");
  part.add(smd(0.03, 0.044, 0.011, 0.07, -0.022), "chip");
  part.add(gullLegs({ x: 0.07, count: 4, pitch: 0.0065, spanZ: 0.0255, w: 0.0035, len: 0.0075, h: 0.0016 }), "solder");
  // Resistores 0603 e capacitores 0805.
  for (const [x, z] of [[-0.046, 0.052], [-0.046, -0.052], [0.02, 0.05], [0.02, -0.05], [0.034, 0.034]]) {
    part.add(smd(0.016, 0.0085, 0.0045, x, z), "resistor");
    part.add(smd(0.0022, 0.0088, 0.0048, x - 0.0069, z), "solder");
    part.add(smd(0.0022, 0.0088, 0.0048, x + 0.0069, z), "solder");
  }
  for (const [x, z] of [[-0.068, 0.062], [-0.068, -0.062]]) {
    part.add(smd(0.02, 0.0125, 0.007, x, z), "capacitor");
    part.add(smd(0.0024, 0.0127, 0.0074, x - 0.0088, z), "solder");
    part.add(smd(0.0024, 0.0127, 0.0074, x + 0.0088, z), "solder");
  }
  // Pads de entrada (perto do USB) e de bateria e saída (na outra ponta).
  const pads = [];
  for (const z of [-0.065, 0.065]) pads.push(pad(-0.108, z, 0.034, 0.026));
  for (const z of [-0.062, -0.021, 0.021, 0.062]) pads.push(pad(0.106, z, 0.036, 0.026));
  part.add(merge(pads), "gold");

  // LEDs 0805: vermelho (carregando) e verde (completo); o runtime acende o emissivo.
  part.add(smd(0.02, 0.0125, 0.0072, -0.034, 0.064), "led_red");
  part.add(smd(0.02, 0.0125, 0.0072, -0.034, -0.064), "led_green");

  part.child(anchor("label_pcb_charge", [0.0, TOP + 0.02, 0]));
  return part;
}

// -------------------------------------------------------------------- boost

/** USB-A fêmea: casca de aço em anel, fundo, lingueta preta e quatro contatos. Origem no centro. */
export function buildUsbPort() {
  const part = new Part("usb_port", { pos: [-0.085, TOP + 0.02875, 0.02] });
  const w = 0.133;
  const h = 0.0575;
  const len = 0.14;
  const wallT = 0.0028;
  const ring = place(
    slab({ width: h, depth: w, height: len, radius: 0.004, bevel: 0.0012, bevelSegments: 2, hole: { width: h - 2 * wallT, depth: w - 2 * wallT, radius: 0.002 } }),
    { rot: [0, 0, -90], pos: [-len / 2, 0, 0] },
  );
  part.add(ring, "steel");
  part.add(place(box(0.004, h - 0.002, w - 0.002, { r: 0.001, seg: 1 }), { pos: [len / 2 - 0.002, 0, 0] }), "steel");
  part.add(place(box(0.112, 0.0136, 0.0125, { r: 0.0015, seg: 1 }), { pos: [0.004, -0.0125 + 0.0, 0] }), "black_plastic");
  const contacts = [];
  for (const z of [-0.0409, -0.0136, 0.0136, 0.0409].map((v) => v * 0.9)) {
    contacts.push(place(box(0.1, 0.0012, 0.0062, { r: 0.0004, seg: 1 }), { pos: [0.0, -0.0125 + 0.0073, z] }));
  }
  part.add(merge(contacts), "gold");
  // Dois sulcos de solda embaixo.
  part.add(place(box(0.02, 0.0025, 0.014, { r: 0.0006, seg: 1 }), { pos: [0.04, -h / 2 - 0.0012, -0.04] }), "solder");
  part.add(place(box(0.02, 0.0025, 0.014, { r: 0.0006, seg: 1 }), { pos: [0.04, -h / 2 - 0.0012, 0.04] }), "solder");
  part.child(anchor("usb_a_mouth", [-len / 2 - 0.0005, 0, 0], [0, -90, 0]));
  return part;
}

/**
 * LED azul de saída: lente em cúpula num suporte preto. A origem do nó é o centro da base
 * da lente, na altura da abertura da frente; a rotação em z (+90°) leva o +y da cúpula
 * para o −x da placa, de frente para a parede.
 */
export function buildLed() {
  const lensY = PORT_Y - BOARDS.boost.y; // altura do centro da lente acima do centro da placa
  const part = new Part("led", { pos: [-0.128, lensY, -0.09], rot: [0, 0, 90] });
  const r = 0.0155;
  const dome = [];
  for (let i = 0; i <= 10; i++) {
    const a = (i / 10) * (Math.PI / 2);
    dome.push(new THREE.Vector2(Math.cos(a) * r, Math.sin(a) * r * 0.85));
  }
  part.add(crease(new THREE.LatheGeometry(dome, 28), 60), "led_lens");
  part.add(place(cyl(0.0105, 0.0105, { seg: 24, edge: 0.001 }), { pos: [0, 0.0004, 0] }), "led_core");
  part.add(place(cyl(0.0175, 0.003, { seg: 28, edge: 0.0008 }), { pos: [0, -0.003, 0] }), "black_plastic");
  // Suporte (no espaço do nó, "para baixo" na placa é −x): da lente até a face de cima da placa.
  const down = lensY - TOP;
  part.add(place(box(down, 0.024, 0.03, { r: 0.003 }), { pos: [-down / 2, -0.0015, 0] }), "black_plastic");
  return part;
}

export function buildBoostBoard() {
  const b = BOARDS.boost;
  const part = new Part("pcb_boost", { pos: [b.x, b.y, b.z], rot: [0, 90, 0] });
  board(part, { w: 0.22, d: 0.22, edge: "pcb_edge_black", top: "pcb_boost_top" });

  // Indutor, diodo Schottky (SMA), chip (SOT-23-6), capacitor de lata, trimpot azul.
  part.add(place(box(0.05, 0.03, 0.05, { r: 0.006, seg: 2 }), { pos: [0.04, TOP + 0.015, -0.055] }), "inductor");
  part.add(smd(0.043, 0.026, 0.021, 0.085, 0.0), "chip");
  part.add(smd(0.0045, 0.026, 0.0028, 0.085 + 0.0215, 0.0), "solder");
  part.add(smd(0.0045, 0.026, 0.0028, 0.085 - 0.0215, 0.0), "solder");
  part.add(smd(0.029, 0.016, 0.011, 0.0, -0.075), "chip");
  part.add(place(cyl(0.025, 0.054, { seg: 28, edge: 0.003 }), { pos: [0.065, TOP, 0.07] }), "inductor");
  part.add(place(cyl(0.0215, 0.0008, { seg: 28, edge: 0.0001 }), { pos: [0.065, TOP + 0.0536, 0.07] }), "steel_dark");
  part.add(smd(0.045, 0.045, 0.02, -0.01, 0.075), "pcb_edge_blue");
  part.add(place(cyl(0.011, 0.003, { seg: 20, edge: 0.0006 }), { pos: [-0.01, TOP + 0.02, 0.075] }), "gold");
  for (const [x, z] of [[-0.03, -0.04], [0.02, 0.03], [-0.04, 0.012]]) {
    part.add(smd(0.016, 0.0085, 0.0045, x, z), "resistor");
    part.add(smd(0.0022, 0.0088, 0.0048, x - 0.0069, z), "solder");
    part.add(smd(0.0022, 0.0088, 0.0048, x + 0.0069, z), "solder");
  }
  const pads = [];
  for (const z of [-0.05, 0.05]) pads.push(pad(0.098, z, 0.03, 0.026));
  part.add(merge(pads), "gold");

  part.child(buildUsbPort());
  part.child(buildLed());
  part.child(anchor("label_pcb_boost", [0.0, TOP + 0.03, 0]));
  return part;
}

export { C };
