/**
 * Único objeto mutável com os parâmetros animáveis da cena.
 *
 * Só o GSAP escreve aqui (o trilho de scroll em lib/tracks.ts, a abertura e o
 * ponteiro via `gsap.quickTo`). O `useFrame` só lê e aplica com `easing.damp`.
 * Nunca `useState` no loop de animação.
 *
 * Não importe `three` (nem nada do ecossistema R3F) neste arquivo: ele entra
 * no chunk inicial, e uma dependência do three aqui já estourou o orçamento de
 * JS uma vez (ver PROGRESS.md). Vetores e poses são objetos simples.
 */

export interface Pose {
  x: number;
  y: number;
  z: number;
  /** Rotação em graus (mais fácil de ler nas tabelas de coreografia). */
  rx: number;
  ry: number;
  rz: number;
  s: number;
}

export interface CameraPose {
  x: number;
  y: number;
  z: number;
  /** Alvo. */
  tx: number;
  ty: number;
  tz: number;
  /** Campo de visão vertical, em graus. */
  fov: number;
  /**
   * Deslocamento de lente, em frações da tela (+0,25 leva a imagem 25% para a
   * direita; +0,2 leva 20% para cima). A câmera continua mirando o produto, e
   * o layout decide onde ele aparece, sem mudar a perspectiva.
   */
  sx: number;
  sy: number;
}

export interface SceneState {
  /** Horas contínuas ao longo da página (4,5 → 65,7). O céu usa `dayTime mod 24`. */
  dayTime: number;
  /** 0 céu limpo → 1 fechado (tempestade a partir de ~0,6). */
  cloudCover: number;
  /** Tom agendado do texto: 1 Nuvem, −1 Noite, 0 travessia (sem texto na tela). */
  tone: number;
  /** 0 painel dobrado → 1 aberto (livro). */
  panelOpen: number;
  /** 0 tampa fechada → 1 aberta. */
  lidOpen: number;
  /** 0 montado → 1 vista explodida. */
  explode: number;
  /** 0 → 1 peças reorganizadas como esquema. */
  schematic: number;
  /** 0 → 4: etapa do caminho da energia (parte inteira) e progresso dentro dela. */
  flow: number;
  /** 0 → 1 carga visível da bateria. */
  batteryCharge: number;
  /** 0 → 1 carga na tela do celular. */
  phoneCharge: number;
  /** 0 → 1 LED azul de saída. */
  ledOn: number;
  /** 0 → 1 cabo 3 em 1 ligando a caixa ao celular. */
  cable: number;
  /** 0 → 1 reflexo que corre pelas células (abertura). */
  glint: number;
  /** 0 → 1 → 0 primeiro raio de sol (abertura). */
  shaft: number;
  /** 0 → 1 presença do produto (0 = `visible = false`). */
  productVisible: number;
  /** 0 → 1 presença do celular. */
  phoneVisible: number;
  product: Pose;
  camera: CameraPose;
  /** Ponteiro normalizado (−1 a 1), escrito por `gsap.quickTo`. */
  pointer: { x: number; y: number };
}

export const sceneState: SceneState = {
  dayTime: 4.5,
  cloudCover: 0.1,
  tone: 1,
  panelOpen: 0,
  lidOpen: 0,
  explode: 0,
  schematic: 0,
  flow: 0,
  batteryCharge: 0.15,
  phoneCharge: 0,
  ledOn: 0,
  cable: 0,
  glint: 0,
  shaft: 0,
  productVisible: 0,
  phoneVisible: 0,
  product: { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, s: 1 },
  camera: { x: 0, y: 2.3, z: 11, tx: 0, ty: 0.45, tz: 0, fov: 30, sx: 0, sy: 0 },
  pointer: { x: 0, y: 0 },
};
