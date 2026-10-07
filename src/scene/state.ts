/**
 * Único objeto mutável com os parâmetros animáveis da cena.
 *
 * Só escrevem aqui o trilho de scroll (lib/tracks.ts, uma função pura de
 * `scrollY`), a abertura e o ponteiro (GSAP, `gsap.quickTo`). O `useFrame` só lê. Nunca `useState` no loop de
 * animação. As peças leem os valores direto, sem suavização: só a câmera tem um
 * `damp` curto (uma só camada de suavização, CLAUDE.md).
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
   * direita; +0,2 leva 20% para cima). Na v3 o produto fica no centro: vale 0,
   * e serve só para um ajuste fino do enquadramento.
   */
  sx: number;
  sy: number;
}

export interface SceneState {
  /** Tom do texto: 1 = Nuvem (fundo escuro), −1 = Noite (fundo claro), 0 = troca de tom (sem texto na tela). */
  tone: number;
  /** Cor de fundo (sRGB, 0 a 255), animada pela timeline; vira `--bg` no CSS. */
  bg: { r: number; g: number; b: number };
  /** 0 → 1 tampa aberta (110°). */
  lid: number;
  /** 0 → 1 vista explodida (cascata, cada peça no seu trecho; ver scene/model/motion.ts). */
  explode: number;
  /** 0 → 1 painel aberto como um livro. */
  panelOpen: number;
  /**
   * Componente em foco, de 0 (nenhum: tudo aceso) a 4 (1 painel, 2 módulo de carga,
   * 3 células, 4 boost e saídas). Fracionário na travessia: as peças fora do foco
   * ficam a ~15% de opacidade.
   */
  focus: number;
  /** 0 → 1 carga visível das células. */
  charge: number;
  /** 0 → 1 LED azul de saída. */
  ledOn: number;
  /** 0 → 1 presença do celular. */
  phoneVisible: number;
  /** 0 → 1 carga na tela do celular. */
  phoneCharge: number;
  /** 0 → 1 cabo 3 em 1 ligando a caixa ao celular. */
  cable: number;
  /** 0 → 1 quanto o ponteiro (ou a velocidade do scroll, no toque) inclina o produto. */
  tilt: number;
  /** 0 → 1 presença do produto (0 = `visible = false`). */
  productVisible: number;
  /** 0 → 1 luz de contorno (as tiras do ambiente, mais fortes nos fundos escuros). */
  rim: number;
  /** 0 → 1 sombra de contato no chão. */
  shadow: number;
  /** Giro do conjunto, em graus (preso ao scroll: nada de giro por tempo). */
  product: Pose;
  camera: CameraPose;
  /** Ponteiro normalizado (−1 a 1), escrito por `gsap.quickTo`. */
  pointer: { x: number; y: number };
}

export const sceneState: SceneState = {
  tone: -1,
  bg: { r: 244, g: 247, b: 250 },
  lid: 0,
  explode: 0,
  panelOpen: 0,
  focus: 0,
  charge: 0.15,
  ledOn: 0,
  phoneVisible: 0,
  phoneCharge: 0,
  cable: 0,
  tilt: 1,
  productVisible: 0,
  rim: 0,
  shadow: 1,
  product: { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, s: 1 },
  camera: { x: 3.4, y: 3.2, z: 6.9, tx: 0, ty: 0.75, tz: 0.25, fov: 30, sx: 0, sy: 0 },
  pointer: { x: 0, y: 0 },
};
