/**
 * Único objeto mutável com todos os parâmetros animáveis da cena 3D.
 *
 * O GSAP (ScrollTrigger com scrub) é a única coisa que escreve aqui.
 * O `useFrame` só lê e aplica os valores com `easing.damp` do maath.
 * Nunca use `useState`/re-render para animação por frame (ver seção 5 do brief).
 */
export interface SceneState {
  /** 0–1: "um dia contado pela página" (ver Fase 0, item 2 — não é hora real). */
  dayTime: number;
  /** 0 fechado (livro fechado) → 1 aberto. */
  panelOpen: number;
  /** 0 fechada → 1 aberta (tampa da caixa). */
  lidOpen: number;
  /** 0 montado → 1 totalmente explodido (Ato 2). */
  explode: number;
  /** 0 montado/explodido → 1 rearranjado como esquema (Ato 3). */
  schematic: number;
  /** 0–1: progresso do fluxo de energia iluminado (Ato 3). */
  flow: number;
  /** 0–1: carga visível da bateria (emissivo verde). */
  batteryCharge: number;
  /** 0–1: carga visível na tela do celular (Ato 4). */
  phoneCharge: number;
  /** Se o LED de saída está aceso (Ato 4 em diante). */
  ledOutputOn: boolean;
  /**
   * Alvo de câmera (posição). É um objeto simples de propósito — `state.ts`
   * é importado fora do chunk 3D (App.tsx o usa para o scrub de `dayTime`),
   * então não pode depender de `three` (ver Fase 1, nota de performance).
   * O código da cena (Fase 2+) lê `x`/`y`/`z` e aplica num `THREE.Vector3` seu.
   */
  cameraTarget: { x: number; y: number; z: number };
  /** Inclinação do produto por ponteiro (Ato 1), aplicada com damping. */
  pointerTilt: { x: number; y: number };
}

export const sceneState: SceneState = {
  dayTime: 0,
  panelOpen: 0,
  lidOpen: 0,
  explode: 0,
  schematic: 0,
  flow: 0,
  batteryCharge: 0.15,
  phoneCharge: 0,
  ledOutputOn: false,
  cameraTarget: { x: 0, y: 0, z: 0 },
  pointerTilt: { x: 0, y: 0 },
};
