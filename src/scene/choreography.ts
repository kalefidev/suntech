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
  /**
   * Chaves do layout empilhado (celular e tablet em pé), seção por seção. A
   * seção que não está aqui usa as de `keys`.
   */
  narrow?: Partial<Record<SectionId, Keys>>;
}

// ------------------------------------------------------------ poses

/** Uma pose em pontos da faixa da seção: [posição de 0 a 1, pose]. */
type PoseKeys<P> = ReadonlyArray<readonly [at: number, pose: P]>;

/**
 * Desmonta poses (câmera ou produto) em um trilho por campo, para a timeline
 * mestre. `narrow` substitui as poses no layout empilhado.
 */
function poseTracks<P extends object>(
  root: string,
  keys: Partial<Record<SectionId, PoseKeys<P>>>,
  narrow: Partial<Record<SectionId, PoseKeys<P>>> = {},
): Track[] {
  const fields = new Set<string>();
  for (const list of [...Object.values(keys), ...Object.values(narrow)]) {
    for (const [, pose] of list ?? []) Object.keys(pose).forEach((field) => fields.add(field));
  }
  const split = (source: Partial<Record<SectionId, PoseKeys<P>>>, field: string) =>
    Object.fromEntries(
      Object.entries(source).map(([id, list]) => [
        id,
        (list ?? []).map(([at, pose]) => [at, (pose as Record<string, number>)[field]] as const),
      ]),
    ) as Partial<Record<SectionId, Keys>>;
  return [...fields].map((field) => ({
    path: `${root}.${field}`,
    keys: split(keys, field),
    narrow: split(narrow, field),
  }));
}

interface CameraKey {
  x: number;
  y: number;
  z: number;
  tx: number;
  ty: number;
  tz: number;
  fov: number;
  sx: number;
  sy: number;
}

/**
 * Câmera em órbita do alvo: azimute e elevação em graus (azimute 0 = de
 * frente, negativo = da esquerda). `sx` e `sy` são o deslocamento de lente.
 */
function orbit(
  target: readonly [number, number, number],
  azimuth: number,
  elevation: number,
  distance: number,
  fov: number,
  sx: number,
  sy: number,
): CameraKey {
  const az = (azimuth * Math.PI) / 180;
  const el = (elevation * Math.PI) / 180;
  const flat = distance * Math.cos(el);
  return {
    x: target[0] + flat * Math.sin(az),
    y: target[1] + distance * Math.sin(el),
    z: target[2] + flat * Math.cos(az),
    tx: target[0],
    ty: target[1],
    tz: target[2],
    fov,
    sx,
    sy,
  };
}

interface ProductKey {
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
  s: number;
}

const pose = (x: number, y: number, z: number, ry: number, s = 1, rx = 0, rz = 0): ProductKey => ({ x, y, z, rx, ry, rz, s });

/**
 * Receita de estúdio (docs/fase-0.md, item 6): FOV de uns 30°, longe do
 * produto e uns 12° acima. No desktop, o produto pousa no horizonte, à
 * direita; no celular, fica em cima, acima do texto.
 */
const HERO_TARGET = [0.25, 0.62, 0.15] as const;
const CAMERA = {
  hero: orbit(HERO_TARGET, -16, 13, 11.5, 30, 0.32, -0.28),
  heroOut: orbit(HERO_TARGET, -16, 13, 12.2, 30, 0.32, -0.28),
  heroNarrow: orbit(HERO_TARGET, -16, 13, 15.5, 34, 0.06, 0.12),
  // No celular o texto rola por cima do canvas: o produto sobe junto com o
  // hero (uma tela inteira de deslocamento de lente) e sai por cima dele.
  heroOutNarrow: orbit(HERO_TARGET, -16, 13, 15.5, 34, 0.06, 1.12),
};

const PRODUCT = {
  /** 3/4: o painel vira para o sol, à direita, e a caixa fica na frente. */
  hero: pose(0, 0, 0, 28),
  heroOut: pose(0, 0, 0, 48),
  /** Parte 1: o produto vai para o fundo, à direita, enquanto a tempestade o apaga. */
  away: pose(1.4, 0, -3.2, 70),
};

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

  // A guarda de contraste cobre a tela toda nas partes com texto em coluna
  // larga (1, 2 e 3a) e volta à coluna de texto nas cenas do produto. Abre
  // no fim do hero, com a tempestade chegando, e fecha durante a travessia do
  // nascer do sol.
  {
    path: "guardWide",
    keys: {
      hero: [[0, 0], [0.6, 0], [1, 1]],
      "por-dentro": [[0, 1], [0.15, 0]],
    },
  },

  // ---------------------------------------------------------- produto
  // Hero: pose de herói, girando com o scroll e inclinando com o ponteiro.
  // Parte 1: vai para o fundo e some na névoa enquanto a tempestade fecha.
  {
    path: "productVisible",
    keys: {
      hero: [[0, 1]],
      // Sai cedo: as oportunidades se abrem em colunas logo depois.
      problema: [[0, 1], [0.12, 0]],
    },
    // No celular, o produto já saiu da tela com o hero.
    narrow: {
      hero: [[0, 1], [0.85, 1], [1, 0]],
      problema: [[0, 0]],
    },
  },
  {
    path: "panelOpen",
    keys: { hero: [[0, 1]] },
  },
  {
    path: "tilt",
    keys: {
      hero: [[0, 1], [1, 0.6]],
      problema: [[0, 0.6], [0.1, 0]],
    },
  },
  ...poseTracks<ProductKey>("product", {
    hero: [
      [0, PRODUCT.hero],
      [1, PRODUCT.heroOut],
    ],
    problema: [
      [0, PRODUCT.heroOut],
      [0.12, PRODUCT.away],
    ],
  }),
  ...poseTracks<CameraKey>(
    "camera",
    {
      hero: [
        [0, CAMERA.hero],
        [1, CAMERA.heroOut],
      ],
    },
    {
      hero: [
        [0, CAMERA.heroNarrow],
        [1, CAMERA.heroOutNarrow],
      ],
    },
  ),
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
