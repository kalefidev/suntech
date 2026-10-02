/**
 * Coreografia da página: o mapa de scroll aprovado na Fase 0 (docs/fase-0.md,
 * item 5), como dados. Cada trilho diz, por seção, o valor de um campo do
 * `sceneState` em pontos da faixa da seção (0 = início, 1 = fim; em cena presa,
 * a faixa é o pin). `lib/tracks.ts` transforma isto numa timeline mestre do GSAP.
 * Entre pontos, interpolação linear (ou degrau, em `step`). Os valores nas
 * bordas das seções se encontram, para nada pular.
 *
 * Não importa `three`: entra no chunk inicial, junto com lib/tracks.ts.
 */

export type SectionId =
  | "hero"
  | "problema"
  | "cliente"
  | "solucao"
  | "por-dentro"
  | "como-funciona"
  | "energia-fica"
  | "diferencial"
  | "empresa"
  | "pitch"
  | "jovem";

export type Keys = ReadonlyArray<readonly [at: number, value: number]>;

export interface Track {
  /** Caminho no `sceneState` ("dayTime", "product.ry"). */
  path: string;
  /** Degrau em vez de interpolação (tom do texto). */
  step?: boolean;
  keys: Partial<Record<SectionId, Keys>>;
}

// Tom: 1 = texto Nuvem, −1 = texto Noite, 0 = travessia (sem texto na tela).
const LIGHT = 1;
const DARK = -1;
const CROSSING = 0;

/**
 * As três travessias da zona morta de contraste acontecem dentro das cenas
 * presas, enquanto só o 3D está na tela: o nascer do sol no começo de "Por
 * dentro", o pôr do sol no começo de "A energia fica" e o nascer do dia
 * seguinte no fim dela.
 */
export const TRACKS: Track[] = [
  {
    path: "dayTime",
    keys: {
      hero: [[0, 6.25], [1, 7]],
      // A tempestade fecha antes de o dia clarear: a hora quase não anda até
      // as nuvens cobrirem o céu.
      problema: [[0, 7], [0.2, 7.5], [1, 19.5]],
      cliente: [[0, 19.5], [1, 26]],
      solucao: [[0, 26], [0.85, 29], [1, 29.4]],
      // 0–18%: travessia no nascer do sol (07:00–08:30).
      "por-dentro": [[0, 29.4], [0.18, 32.5], [1, 36]],
      "como-funciona": [[0, 36], [1, 41]],
      // 0–30%: travessia no pôr do sol. 70–84%: "Amanhã…", a noite passa.
      // 84–100%: travessia no nascer do dia seguinte.
      "energia-fica": [[0, 41], [0.3, 43.5], [0.7, 45.5], [0.84, 53.5], [1, 56.5]],
      diferencial: [[0, 56.5], [1, 57.5]],
      empresa: [[0, 57.5], [1, 59.5]],
      pitch: [[0, 59.5], [1, 63.5]],
      jovem: [[0, 63.5], [1, 65.7]],
    },
  },
  {
    path: "cloudCover",
    keys: {
      hero: [[0, 0.1], [1, 0.35]],
      problema: [[0, 0.35], [0.2, 0.9], [0.9, 0.9], [1, 0.6]],
      cliente: [[0, 0.6], [1, 0.25]],
      solucao: [[0, 0.25], [1, 0.15]],
      "por-dentro": [[0, 0.15], [0.18, 0.05]],
      "energia-fica": [[0, 0.05], [0.84, 0.05], [1, 0.1]],
      diferencial: [[0, 0.1], [1, 0.15]],
      empresa: [[0, 0.15], [1, 0.2]],
      pitch: [[0, 0.2], [1, 0.15]],
      jovem: [[0, 0.15], [1, 0.2]],
    },
  },
  {
    path: "tone",
    step: true,
    keys: {
      hero: [[0, LIGHT]],
      "por-dentro": [[0, CROSSING], [0.18, DARK]],
      "energia-fica": [[0, CROSSING], [0.3, LIGHT], [0.84, CROSSING], [1, DARK]],
    },
  },
];

/**
 * Reduced motion: cada seção mostra um estado parado, tirado deste ponto da
 * sua faixa (0,5 quando não está aqui). As cenas mostram o resultado: vista
 * explodida, esquema aceso e celular carregado à noite.
 */
export const REST_AT: Partial<Record<SectionId, number>> = {
  hero: 0,
  "por-dentro": 1,
  "como-funciona": 1,
  "energia-fica": 0.68,
};
