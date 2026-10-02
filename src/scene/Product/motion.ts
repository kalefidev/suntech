/**
 * Valores do produto já amortecidos, calculados uma vez por quadro pelo
 * `ProductDriver` (o primeiro filho do produto, então o `useFrame` dele roda
 * antes das peças). As peças leem daqui, para todas andarem juntas.
 */
export const productLive = {
  explode: 0,
  schematic: 0,
  lidOpen: 0,
  panelOpen: 0,
  batteryCharge: 0,
};

/**
 * Progresso de uma peça dentro da sua janela da explosão (docs/fase-0.md,
 * item 6): 0 antes, 1 depois, com ease-in-out no meio. É o que dá o atraso por
 * peça: cada uma se separa no seu trecho.
 */
export function phase(value: number, window: readonly [number, number]): number {
  const t = Math.min(1, Math.max(0, (value - window[0]) / (window[1] - window[0])));
  return t * t * (3 - 2 * t);
}

export interface PartMotion {
  /** Trecho da explosão (0 a 1) em que a peça se separa. */
  window: readonly [number, number];
  /** Deslocamento na vista explodida, no espaço do pai da peça. */
  offset: readonly [number, number, number];
  /** Giro na vista explodida, em graus (x, y, z). */
  turn?: readonly [number, number, number];
}

/** Ordem da explosão (docs/fase-0.md, item 6). */
export const MOTION = {
  /**
   * A tampa abre antes (lidOpen) e, na explosão, sobe para o topo da pilha e
   * volta para a horizontal (com o nome para cima), como numa vista explodida
   * de manual: aberta e erguida, ela virava uma placa na frente do painel.
   */
  lid: { window: [0, 0.25], offset: [0, 1.35, 0] },
  /** 1ª: a placa do controlador sobe e gira um pouco. */
  charger: { window: [0.15, 0.45], offset: [0, 0.66, 0], turn: [0, 0, 6] },
  /** Junto com o controlador, deslocado em x. */
  diode: { window: [0.15, 0.45], offset: [0.18, 0.62, 0], turn: [0, 0, -8] },
  /** 1ª: o conversor sobe mais e sai para fora. */
  boost: { window: [0.15, 0.45], offset: [0.32, 0.86, 0], turn: [0, 0, -5] },
  /** 2ª: a fiação sobe como um feixe. */
  wires: { window: [0.25, 0.55], offset: [0, 0.42, 0] },
  /** 3ª: a bateria sobe pouco e gira. */
  battery: { window: [0.35, 0.65], offset: [0, 0.24, 0], turn: [8, 0, 0] },
  /** 4ª: a frente (USB-A, chave e LED) desliza para fora. */
  front: { window: [0.45, 0.75], offset: [0, 0, 0.3] },
  /**
   * Painel: o vidro sai 0,25 e as células 0,12 na direção da normal. Vêm por
   * último (e não em paralelo, como no plano), para cada peça ganhar o seu
   * callout em sequência, na ordem da lista do DOM.
   */
  glass: { window: [0.55, 0.85], offset: [0, 0, 0.25] },
  cells: { window: [0.6, 0.9], offset: [0, 0, 0.12] },
} as const satisfies Record<string, PartMotion>;

/**
 * Quando cada callout aparece: a peça chegou a 80% do percurso (docs/fase-0.md,
 * item 6), em valores de `explode`. Na ordem da lista de peças do DOM.
 */
export const CALLOUT_AT = {
  modulos: 0.39,
  fiacao: 0.49,
  bateria: 0.59,
  saidas: 0.69,
  luz: 0.74,
  vidro: 0.79,
  celulas: 0.84,
  base: 0.9,
} as const;

const DEG = Math.PI / 180;

/** Aplica a pose explodida de uma peça sobre a montada (posição e giro de base). */
export function applyMotion(
  target: {
    position: { set: (x: number, y: number, z: number) => void };
    rotation: { set: (x: number, y: number, z: number) => void };
    scale: { setScalar: (s: number) => void };
  },
  base: { position: readonly [number, number, number]; rotation?: readonly [number, number, number] },
  motion: PartMotion,
  explode: number,
): number {
  const p = phase(explode, motion.window);
  const [bx, by, bz] = base.position;
  const [rx, ry, rz] = base.rotation ?? [0, 0, 0];
  const [tx, ty, tz] = motion.turn ?? [0, 0, 0];
  target.position.set(bx + motion.offset[0] * p, by + motion.offset[1] * p, bz + motion.offset[2] * p);
  target.rotation.set(rx + tx * DEG * p, ry + ty * DEG * p, rz + tz * DEG * p);
  target.scale.setScalar(1);
  return p;
}
