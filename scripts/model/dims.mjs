// Medidas do modelo, em unidades da cena (1 = 100 mm). Os valores de caixa e placa são
// os `DEFAULT_PROPORTIONS` de src/content/product.ts: quando as medidas reais chegarem
// (os `TODO: preencher` de lá), atualize aqui e rode `npm run model`.
export const MM = 0.01;

export const CASE = { L: 1.5, W: 1.0, H: 0.4 };
export const PLATE = { L: 2.0, H: 1.5, T: 0.06 };

const feet = 2 * MM;
const lid = CASE.H * 0.16;
const gap = 0.7 * MM;

/** Caixa: origem no centro do piso (y = 0 no chão), frente em +z. */
export const C = {
  ...CASE,
  feet,
  lid,
  gap,
  body: CASE.H - feet - lid - gap,
  wall: 3 * MM,
  corner: 7 * MM,
  bevel: 2.2 * MM,
  /** Altura do eixo da dobradiça (a base da tampa fecha em feet + body + gap). */
  hingeY: feet + (CASE.H - feet - lid - gap) + gap + 2 * MM,
  hingeZ: -(CASE.W / 2 + 1.5 * MM),
};

/** Altura do centro das portas na parede da frente. */
export const PORT_Y = C.feet + C.body * 0.5;

/** Posição x das aberturas da frente (a ordem é da esquerda para a direita). */
export const PORT_X = { switch: -0.21, usbC: 0.12, led: 0.33, usbA: 0.44 };

export const P = {
  frame: 4.5 * MM,
  ...PLATE,
};

export const CELL = { radius: 0.09, length: 0.65 };
export const PHONE = { W: 0.75, H: 1.5, T: 0.08 };
