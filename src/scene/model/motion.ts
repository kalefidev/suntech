/**
 * Movimento das peças na vista explodida (docs/v3-fase-0.md, §2): dados puros, sem
 * `three` (os scripts de medição leem este arquivo). As peças sobem em cascata para
 * formar uma pilha vertical que segue o caminho da energia: painel e tampa no topo,
 * depois o módulo de carga, as células e o boost; a caixa fica embaixo.
 *
 * Os deslocamentos são no espaço do pai de cada peça (a `case` não gira; a `panel`
 * e a `panel_b` usam o espaço do painel). O trecho (`window`) é a parte da
 * explosão (0 a 1) em que a peça se move, com ease suave dentro dele.
 */

/** Opacidade das peças fora do foco (CLAUDE.md: ~15%). */
export const DIM = 0.15;

export type V3 = readonly [number, number, number];

export interface PartMotion {
  window: readonly [number, number];
  /**
   * Deslocamento ao longo do trecho: pontos [fração do trecho, deslocamento],
   * interpolados linearmente (com a fração já suavizada por `phase`). Quando a
   * peça sai pela frente da caixa (USB), ela recua antes de subir, para não
   * atravessar a parede.
   */
  path: ReadonlyArray<readonly [number, V3]>;
  /** Giro no fim do trecho, em graus (x, y, z), somado ao de base. */
  turn?: V3;
}

export const MOTION: Record<string, PartMotion> = {
  // A tampa sobe e volta à horizontal (a abertura de 110° é desfeita enquanto sobe).
  case_lid: { window: [0, 0.4], path: [[0, [0, 0, 0]], [1, [0, 1.9, 0]]] },
  // O painel, dobrado e em pé atrás da caixa, vem para o topo da pilha, deitado.
  panel: { window: [0.05, 0.6], path: [[0, [0, 0, 0]], [1, [0, 2.04, 1.15]]], turn: [-90, 0, 0] },
  // As duas placas se separam (z do painel = espessura).
  panel_b: { window: [0.55, 0.95], path: [[0, [0, 0, 0]], [1, [0, 0, 0.5]]] },
  pcb_charge: { window: [0.2, 0.55], path: [[0, [0, 0, 0]], [0.3, [0, 0, -0.06]], [1, [0, 1.55, -0.06]]] },
  cell_holder: { window: [0.35, 0.7], path: [[0, [0, 0, 0]], [1, [0, 1.0, 0]]] },
  pcb_boost: { window: [0.5, 0.85], path: [[0, [0, 0, 0]], [0.3, [0, 0, -0.06]], [1, [0, 0.5, -0.06]]] },
};

/** Suavização (smoothstep) do valor dentro do trecho: 0 antes, 1 depois. */
export function phase(value: number, window: readonly [number, number]): number {
  const t = Math.min(1, Math.max(0, (value - window[0]) / (window[1] - window[0])));
  return t * t * (3 - 2 * t);
}

/** Deslocamento no ponto `t` (0 a 1) do caminho. */
export function along(path: PartMotion["path"], t: number): V3 {
  let i = 1;
  while (i < path.length - 1 && path[i][0] < t) i++;
  const [t0, a] = path[i - 1];
  const [t1, b] = path[i];
  const k = t1 === t0 ? 1 : Math.min(1, Math.max(0, (t - t0) / (t1 - t0)));
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
}

/** Componente a que cada peça pertence (para o foco): 0 = nenhum. */
export const PART_FOCUS: Record<string, 0 | 1 | 2 | 3 | 4> = {
  panel_a: 1,
  panel_b: 1,
  pcb_charge: 2,
  cell_holder: 3,
  cell_a: 3,
  cell_b: 3,
  pcb_boost: 4,
  usb_port: 4,
  led: 4,
};

/** Nomes das peças do contrato (CLAUDE.md, Ativos 3D), mais o suporte das células, o painel e o celular. */
export const PART_NAMES = [
  "case_base",
  "case_lid",
  "cell_holder",
  "cell_a",
  "cell_b",
  "pcb_charge",
  "pcb_boost",
  "usb_port",
  "led",
  "panel_a",
  "panel_b",
  "phone",
] as const;
export type PartName = (typeof PART_NAMES)[number];

/**
 * Opacidade de uma peça pelo foco (0 a 4). Sem foco (≤ 0), tudo aceso. Com foco, só a
 * peça do componente em foco fica inteira; o resto cai para `DIM`. Fracionário na travessia.
 */
export function focusOpacity(part: number, focus: number): number {
  const active = Math.min(1, Math.max(0, focus));
  const near = part === 0 ? 0 : Math.max(0, 1 - Math.abs(focus - part));
  const w = 1 - active + active * near;
  return DIM + (1 - DIM) * w;
}

/**
 * O sujeito de cada beat para o enquadramento (docs/v3-fase-0.md, §2): o conjunto ou a peça
 * em foco, cuja altura na tela deve ficar em 55–70% (largura até 66%; celular, 88%).
 * `scripts/dev/framing.mjs` mede e resolve a câmera com estas listas.
 */
export const SUBJECT: Record<string, readonly PartName[]> = {
  fechado: ["case_base", "case_lid", "panel_a", "panel_b"],
  abre: ["case_base", "case_lid", "panel_a", "panel_b"],
  explode: ["case_base", "case_lid", "cell_holder", "pcb_charge", "pcb_boost", "panel_a", "panel_b"],
  // As duas placas: o livro aberto (B de pé ao lado de A) tem de caber inteiro.
  painel: ["panel_a", "panel_b"],
  carga: ["pcb_charge"],
  celulas: ["cell_holder"],
  saida: ["pcb_boost", "usb_port"],
  remonta: ["case_base", "case_lid", "panel_a", "panel_b"],
  energia: ["case_base", "case_lid", "panel_a", "panel_b", "phone"],
};
