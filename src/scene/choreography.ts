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
/** Centro da caixa e meio da bancada, já com o produto girado −35°. */
const CASE_FOCUS = [-1.07, 0.34, 0.84] as const;
const BENCH_TARGET = [-0.85, 0.55, 0.6] as const;
/** Entre a caixa e o celular, com o produto na pose de bancada. */
const NIGHT_TARGET = [-0.57, 0.25, 1.46] as const;
/**
 * O esquema de "Como funciona" fica no espaço do mundo, de frente para a
 * câmera dele: no desktop, uma linha horizontal à direita do texto; no
 * celular, uma coluna em cima do texto. A linha é centrada no alvo; `gaps` é
 * o vão entre duas peças (unidades da cena): maior entre etapas, menor dentro
 * de uma etapa, para as peças de cada etapa lerem como um grupo.
 */
export const SCHEMATIC = {
  target: [0, 0.7, 0.6] as const,
  azimuth: -8,
  elevation: 9,
  wide: { distance: 17.5, fov: 30, sx: 0.21, sy: 0.03, gaps: { step: 0.45, inner: 0.26 } },
  narrow: { distance: 13.7, fov: 34, sx: 0.09, sy: 0.12, gaps: { step: 0.3, inner: 0.16 } },
} as const;
const CAMERA = {
  hero: orbit(HERO_TARGET, -16, 13, 11.5, 30, 0.32, -0.28),
  heroOut: orbit(HERO_TARGET, -16, 13, 12.2, 30, 0.32, -0.28),
  heroNarrow: orbit(HERO_TARGET, -16, 13, 15.5, 34, 0.06, 0.12),
  // No celular o texto rola por cima do canvas: o produto sobe junto com o
  // hero (uma tela inteira de deslocamento de lente) e sai por cima dele.
  heroOutNarrow: orbit(HERO_TARGET, -16, 13, 15.5, 34, 0.06, 1.12),
  // "Por dentro": a câmera chega perto da caixa e recua conforme as peças se
  // separam. O produto vira para o outro lado (pose de bancada): o painel fica
  // atrás e à direita da caixa na tela, nunca embaixo da coluna de texto.
  benchWide: orbit(BENCH_TARGET, -27, 28, 8, 30, 0.24, -0.06),
  caseClose: orbit(CASE_FOCUS, -28, 30, 6.2, 30, 0.2, -0.04),
  benchWideNarrow: orbit(BENCH_TARGET, -26, 27, 16.5, 34, 0.04, 0.19),
  schematic: orbit(SCHEMATIC.target, SCHEMATIC.azimuth, SCHEMATIC.elevation, SCHEMATIC.wide.distance, SCHEMATIC.wide.fov, SCHEMATIC.wide.sx, SCHEMATIC.wide.sy),
  schematicNarrow: orbit(SCHEMATIC.target, SCHEMATIC.azimuth, SCHEMATIC.elevation, SCHEMATIC.narrow.distance, SCHEMATIC.narrow.fov, SCHEMATIC.narrow.sx, SCHEMATIC.narrow.sy),
  caseCloseNarrow: orbit(CASE_FOCUS, -28, 30, 10.5, 34, 0.02, 0.21),
  // "A energia fica": de noite, perto da caixa fechada e do celular ligado
  // nela (o painel dobrado fica atrás, fora da coluna de texto).
  night: orbit(NIGHT_TARGET, -22, 26, 7.2, 30, 0.24, -0.04),
  nightNarrow: orbit(NIGHT_TARGET, -22, 26, 12.5, 34, 0.04, 0.05),
  // 3c: a pose do hero, um pouco mais alta (o texto do diferencial é longo e
  // o produto não pode ficar espremido no canto de baixo).
  diff: orbit(HERO_TARGET, -16, 13, 12, 30, 0.3, -0.12),
  // Parte 4: um pouco mais longe, para o produto ficar quieto ao lado do
  // texto longo, sem disputar com ele.
  quiet: orbit(HERO_TARGET, -14, 12, 13.5, 30, 0.31, -0.1),
};

const PRODUCT = {
  /** 3/4: o painel vira para o sol, à direita, e a caixa fica na frente. */
  hero: pose(0, 0, 0, 28),
  heroOut: pose(0, 0, 0, 48),
  /** Parte 1: o produto vai para o fundo, à direita, enquanto a tempestade o apaga. */
  away: pose(1.4, 0, -3.2, 70),
  /** Parte 3: a bancada de "Por dentro", "Como funciona" e da noite. */
  bench: pose(0, 0, 0, -35),
  /** 3c: de volta à pose de herói, girando com o scroll. */
  diffOut: pose(0, 0, 0, 64),
  /** Parte 4: quieto ao lado do texto, em 3/4. */
  quiet: pose(0, 0, 0, 40),
  /** Parte 6: o último giro (uma volta inteira) termina na pose de herói. */
  finalTurn: pose(0, 0, 0, 28 + 360),
};

/**
 * "A energia fica" (docs/fase-0.md, item 5): de 0 a 30% do pin, no pôr do
 * sol, o esquema se recolhe, a caixa fecha e o painel dobra; o cabo 3 em 1
 * liga a caixa ao celular, que carrega enquanto o texto da noite está na tela
 * (34–66%); de 84% a 100%, o dia seguinte nasce, o celular sai e o painel
 * abre de novo.
 */
export const NIGHT_IN_PIN = { cable: [0.26, 0.36], charge: [0.36, 0.66], morning: [0.84, 1] } as const;

/** Em "Por dentro", a explosão vai de 30% a 90% do pin (docs/fase-0.md, item 5). */
export const EXPLODE_IN_PIN = [0.3, 0.9] as const;

/** Posição no pin de "Por dentro" em que a explosão vale `explode`. */
export function explodeToPin(explode: number): number {
  return EXPLODE_IN_PIN[0] + (EXPLODE_IN_PIN[1] - EXPLODE_IN_PIN[0]) * explode;
}

// ---------------------------------------------------------- esquema

/**
 * "Como funciona" (docs/fase-0.md, M3): o esquema se forma de 0 a 10% do pin;
 * as 4 etapas acendem em sequência até 70% (`flow` de 0 a 4); de 70% a 100%,
 * o circuito inteiro funciona junto.
 */
export const SCHEMATIC_IN_PIN = [0, 0.1] as const;
export const FLOW_IN_PIN = [0.1, 0.7] as const;

/** Posição no pin de "Como funciona" em que `flow` vale `value` (0 a 4). */
export function flowToPin(value: number): number {
  return FLOW_IN_PIN[0] + ((FLOW_IN_PIN[1] - FLOW_IN_PIN[0]) * value) / 4;
}

/** Nós do esquema, na ordem do caminho da energia (seção 7 do brief). */
export const SCHEMATIC_NODES = ["panel", "diode", "charger", "battery", "boost", "output", "phone"] as const;
export type SchematicNode = (typeof SCHEMATIC_NODES)[number];



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
      // Volta da névoa no fim de "A nossa solução", já na bancada.
      solucao: [[0, 0], [0.86, 0], [1, 1]],
    },
    // No celular, o produto já saiu da tela com o hero.
    narrow: {
      hero: [[0, 1], [0.85, 1], [1, 0]],
      problema: [[0, 0]],
      solucao: [[0, 0], [0.86, 0], [1, 1]],
      // Sai por cima no fim da noite, antes de o texto do diferencial subir.
      "energia-fica": [[0, 1], [0.98, 1], [1, 0]],
      diferencial: [[0, 0]],
    },
  },
  {
    path: "panelOpen",
    keys: {
      hero: [[0, 1]],
      "energia-fica": [[0, 1], [0.14, 1], [0.28, 0], [0.86, 0], [0.96, 1]],
    },
  },
  // "Por dentro": a tampa abre (18–35%) e as peças se separam (30–90%), cada
  // uma no seu trecho (Product/motion.ts). O LED acende na vez da luz
  // indicadora; "Como funciona" apaga e acende de novo na etapa 4.
  {
    path: "lidOpen",
    keys: {
      "por-dentro": [[0, 0], [0.18, 0], [0.35, 1]],
      "energia-fica": [[0, 1], [0.2, 1], [0.3, 0]],
    },
  },
  {
    path: "explode",
    keys: {
      "por-dentro": [[0, 0], [EXPLODE_IN_PIN[0], 0], [EXPLODE_IN_PIN[1], 1]],
      "como-funciona": [[0, 1]],
      "energia-fica": [[0, 1], [0.08, 1], [0.24, 0]],
    },
  },
  {
    path: "ledOn",
    keys: {
      "por-dentro": [[0, 0], [explodeToPin(0.72), 0], [explodeToPin(0.76), 1]],
      // Apaga no esquema e acende de novo na etapa 4 (a saída ligada). Fica
      // acesa a noite toda e apaga quando o celular é desligado, de manhã.
      "como-funciona": [[0, 1], [0.06, 0], [flowToPin(3), 0], [flowToPin(3.2), 1]],
      "energia-fica": [[0, 1], [NIGHT_IN_PIN.morning[0], 1], [0.88, 0]],
    },
  },
  // "Como funciona": as peças viram esquema (0–10%), as etapas acendem
  // (10–70%), a bateria enche na etapa 3 e o celular chega na 4.
  {
    path: "schematic",
    keys: { "como-funciona": [[0, 0], [SCHEMATIC_IN_PIN[1], 1]], "energia-fica": [[0, 1], [0.16, 0]] },
  },
  {
    path: "flow",
    keys: { "como-funciona": [[0, 0], [FLOW_IN_PIN[0], 0], [FLOW_IN_PIN[1], 4]] },
  },
  // A bateria enche de dia, passa a carga para o celular à noite e recomeça
  // a encher com o sol da manhã (3c).
  {
    path: "batteryCharge",
    keys: {
      "como-funciona": [[0, 0.15], [flowToPin(2), 0.15], [flowToPin(3), 1]],
      "energia-fica": [[0, 1], [NIGHT_IN_PIN.charge[0], 1], [NIGHT_IN_PIN.charge[1], 0.15]],
      diferencial: [[0, 0.15], [1, 0.3]],
    },
  },
  {
    path: "phoneVisible",
    keys: {
      "como-funciona": [[0, 0], [flowToPin(2.9), 0], [flowToPin(3.1), 1]],
      "energia-fica": [[0, 1], [0.86, 1], [0.92, 0]],
    },
  },
  {
    path: "cable",
    keys: {
      "energia-fica": [[0, 0], [NIGHT_IN_PIN.cable[0], 0], [NIGHT_IN_PIN.cable[1], 1], [NIGHT_IN_PIN.morning[0], 1], [0.88, 0]],
    },
  },
  {
    path: "phoneCharge",
    keys: { "energia-fica": [[0, 0], [NIGHT_IN_PIN.charge[0], 0], [NIGHT_IN_PIN.charge[1], 1]] },
  },
  {
    path: "tilt",
    keys: {
      hero: [[0, 1], [1, 0.6]],
      problema: [[0, 0.6], [0.1, 0]],
      pitch: [[0, 0], [0.12, 0.6]],
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
    // Invisível no meio do caminho; chega à bancada antes de aparecer.
    solucao: [[0.8, PRODUCT.bench]],
    "por-dentro": [[0, PRODUCT.bench]],
    "como-funciona": [[0, PRODUCT.bench]],
    "energia-fica": [
      [NIGHT_IN_PIN.morning[0], PRODUCT.bench],
      [1, PRODUCT.hero],
    ],
    diferencial: [
      [0, PRODUCT.hero],
      [1, PRODUCT.diffOut],
    ],
    empresa: [[0.12, PRODUCT.quiet]],
    // Parte 5: pose de herói, com a inclinação do ponteiro de volta.
    pitch: [[0.12, PRODUCT.hero]],
    // Parte 6: uma volta inteira com o scroll, até a pose final.
    jovem: [
      [0, PRODUCT.hero],
      [1, PRODUCT.finalTurn],
    ],
  }),
  ...poseTracks<CameraKey>(
    "camera",
    {
      hero: [
        [0, CAMERA.hero],
        [1, CAMERA.heroOut],
      ],
      solucao: [[0.8, CAMERA.benchWide]],
      "por-dentro": [
        [0, CAMERA.benchWide],
        [0.18, CAMERA.caseClose],
        [EXPLODE_IN_PIN[0], CAMERA.caseClose],
        [EXPLODE_IN_PIN[1], CAMERA.benchWide],
      ],
      "como-funciona": [
        [0, CAMERA.benchWide],
        [SCHEMATIC_IN_PIN[1], CAMERA.schematic],
      ],
      "energia-fica": [
        [0, CAMERA.schematic],
        [0.3, CAMERA.night],
        [NIGHT_IN_PIN.morning[0], CAMERA.night],
        [1, CAMERA.diff],
      ],
      diferencial: [[0, CAMERA.diff]],
      empresa: [[0.12, CAMERA.quiet]],
      pitch: [[0.12, CAMERA.hero]],
    },
    {
      hero: [
        [0, CAMERA.heroNarrow],
        [1, CAMERA.heroOutNarrow],
      ],
      solucao: [[0.8, CAMERA.benchWideNarrow]],
      "por-dentro": [
        [0, CAMERA.benchWideNarrow],
        [0.18, CAMERA.caseCloseNarrow],
        [EXPLODE_IN_PIN[0], CAMERA.caseCloseNarrow],
        [EXPLODE_IN_PIN[1], CAMERA.benchWideNarrow],
      ],
      "como-funciona": [
        [0, CAMERA.benchWideNarrow],
        [SCHEMATIC_IN_PIN[1], CAMERA.schematicNarrow],
      ],
      // De manhã, o produto volta à pose do hero e sobe para fora da tela.
      "energia-fica": [
        [0, CAMERA.schematicNarrow],
        [0.3, CAMERA.nightNarrow],
        [NIGHT_IN_PIN.morning[0], CAMERA.nightNarrow],
        [0.94, CAMERA.heroNarrow],
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
  // Sem pin, o fim de uma seção é o começo da próxima: o repouso fica um
  // pouco antes, para as chaves da seguinte (o tom, por exemplo) não valerem.
  "por-dentro": 0.98,
  "como-funciona": 0.98,
  "energia-fica": 0.68,
};
