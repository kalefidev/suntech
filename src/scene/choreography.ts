/**
 * Coreografia da página: o mapa de scroll como dados (docs/v3-fase-0.md, §2).
 * Cada trilho diz, por seção, o valor de um campo do `sceneState` em pontos da
 * faixa da seção (0 = início, 1 = fim; na cena presa, a faixa é o pin).
 * `lib/tracks.ts` compila isto em segmentos e os avalia como função pura de
 * `scrollY`. Entre pontos, interpolação linear (ou a `ease` do trilho, ou degrau
 * em `step`).
 *
 * Não importa `three` nem `copy`: entra no chunk inicial, junto com
 * lib/tracks.ts, e os scripts de medição o leem direto.
 */

export type SectionId = "produto" | "ponte" | PartSectionId;
export type PartSectionId = "problema" | "cliente" | "solucao" | "diferencial" | "empresa" | "pitch" | "jovem";

export type Keys = ReadonlyArray<readonly [at: number, value: number]>;

export interface Track {
  /** Caminho no `sceneState` ("lid", "camera.x"). */
  path: string;
  /** Degrau em vez de interpolação (tom do texto). */
  step?: boolean;
  /** Ease do GSAP aplicada a cada segmento do trilho (padrão: linear). */
  ease?: string;
  keys: Partial<Record<SectionId, Keys>>;
  /**
   * Chaves do layout empilhado (celular e tablet em pé), seção por seção. A
   * seção que não está aqui usa as de `keys`.
   */
  narrow?: Partial<Record<SectionId, Keys>>;
}

// ----------------------------------------------------------------- beats

export type BeatId = "fechado" | "abre" | "explode" | "painel" | "carga" | "celulas" | "saida" | "remonta" | "energia";

/** Os quatro tons de fundo da marca (sRGB 0–255). */
export const TONES = {
  nuvem: [244, 247, 250],
  ceu: [207, 232, 243],
  noite: [20, 33, 61],
  grafite: [43, 48, 54],
} as const;
export type ToneId = keyof typeof TONES;

export interface Beat {
  id: BeatId;
  /** Início e fim, em fração do pin. */
  from: number;
  to: number;
  /** Fundo do beat; o texto é Noite sobre os claros e Nuvem sobre os escuros. */
  bg: ToneId;
  /** Componente em foco (0 = nenhum). */
  focus: 0 | 1 | 2 | 3 | 4;
  /** Lado do texto no desktop; a etiqueta da peça fica no oposto. */
  side: "left" | "right";
  /** Largura do sujeito na tela no desktop (fração da viewport, de scripts/dev/framing.mjs): sobra o resto para a coluna de texto. */
  span: number;
  /** Janela do voo da câmera até o enquadramento do beat, em fração do pin, a partir do início do beat (padrão: de −FLY_BEFORE a +FLY_AFTER). */
  fly?: readonly [start: number, arrive: number];
  /**
   * Enquadramento por onde a câmera passa na chegada, no lugar do próprio (que só vale no fim do
   * beat). A remontagem recua primeiro, com as peças ainda afastadas, e entra junto com elas.
   */
  via?: BeatId;
}

/**
 * Quanto o painel abre (0 = dobrado, 1 = as duas placas lado a lado). No desktop, quase aberto
 * (as placas em ângulo suave); no celular, em V, que é alto e cabe na tela em pé.
 */
const PANEL_OPEN = { wide: 0.85, narrow: 0.55 };

/** A explosão leva 9% do pin, e a câmera recua junto com ela (o sujeito segue com 55 a 70% da altura). */
const EXPLODE_SPAN = 0.09;

/**
 * Roteiro (docs/v3-fase-0.md, §2): fechado, abre, explode, os quatro componentes
 * (captar, proteger, guardar, entregar), remonta e energia.
 */
export const BEATS: readonly Beat[] = [
  { id: "fechado", from: 0, to: 0.08, bg: "nuvem", focus: 0, side: "left", span: 0.41 },
  { id: "abre", from: 0.08, to: 0.22, bg: "nuvem", focus: 0, side: "right", span: 0.32 },
  { id: "explode", from: 0.22, to: 0.38, bg: "noite", focus: 0, side: "left", span: 0.26, fly: [0, EXPLODE_SPAN] },
  { id: "painel", from: 0.38, to: 0.485, bg: "ceu", focus: 1, side: "right", span: 0.57 },
  { id: "carga", from: 0.485, to: 0.59, bg: "noite", focus: 2, side: "left", span: 0.39 },
  { id: "celulas", from: 0.59, to: 0.695, bg: "nuvem", focus: 3, side: "right", span: 0.57 },
  { id: "saida", from: 0.695, to: 0.8, bg: "grafite", focus: 4, side: "left", span: 0.57 },
  { id: "remonta", from: 0.8, to: 0.92, bg: "nuvem", focus: 0, side: "right", span: 0.42, fly: [-0.02, 0.02], via: "explode" },
  { id: "energia", from: 0.92, to: 1, bg: "noite", focus: 0, side: "left", span: 0.51 },
];

/** A troca de tom ocupa ±1,5% do pin em volta da divisa; o texto sai antes e entra depois. */
export const SWAP = 0.015;
/**
 * A câmera voa entre os enquadramentos na janela sem texto em volta de cada divisa: sai FLY_BEFORE
 * antes do início do beat (quando o texto do anterior começa a sumir) e chega FLY_AFTER depois dele
 * (o texto novo só entra em SWAP). Com texto na tela, o sujeito do beat está sempre enquadrado.
 */
export const FLY_BEFORE = 0.03;
export const FLY_AFTER = 0.012;
/** O que anima dentro de um beat (painel, remontagem) termina SETTLE antes do voo para o próximo. */
export const SETTLE = 0.01;

/** [início, chegada] do voo da câmera até o enquadramento do beat, em fração do pin. */
export const flightOf = (beat: Beat): readonly [number, number] => {
  const [start, arrive] = beat.fly ?? [-FLY_BEFORE, FLY_AFTER];
  return [beat.from + start, beat.from + arrive];
};

/** Ponto de repouso do beat: a câmera já chegou e ainda não saiu para o próximo (o texto segue inteiro). */
export const restOf = (beat: Beat): number => {
  const next = BEATS[BEATS.indexOf(beat) + 1];
  return (next ? flightOf(next)[0] : beat.to) - 0.002;
};

/**
 * Tom de cada parte das aulas (DESIGN.md, Regra do Tom). Cada parte pinta o próprio campo
 * (`data-field`), então a divisa entre duas partes rola como uma borda reta e todo texto fica
 * sobre o fundo da sua parte: nenhum ponto passa por um tom intermediário. Alternam escuro e
 * claro; a Parte 1 continua no Noite em que a cena do produto termina ("o problema acontece no
 * escuro"); a Parte 3 tem dois trechos (Solução e Diferencial) no mesmo campo.
 */
export const PART_TONE: Record<PartSectionId, ToneId> = {
  problema: "noite",
  cliente: "nuvem",
  solucao: "grafite",
  diferencial: "grafite",
  empresa: "ceu",
  pitch: "noite",
  jovem: "nuvem",
};

const lightTone = (id: ToneId) => id === "noite" || id === "grafite";
/** 1 = texto Nuvem (fundo escuro), −1 = texto Noite (fundo claro). */
export const toneOf = (beat: Beat): 1 | -1 => (lightTone(beat.bg) ? 1 : -1);

/** Reduced motion: cada beat fica parado no ponto de repouso dele. */
export const BEAT_REST: Record<BeatId, number> = Object.fromEntries(BEATS.map((b) => [b.id, restOf(b)])) as Record<BeatId, number>;

// ----------------------------------------------------------------- poses

type PoseKeys<P> = ReadonlyArray<readonly [at: number, pose: P]>;

/** Desmonta poses (câmera) em um trilho por campo, para o avaliador de `lib/tracks.ts`. */
function poseTracks<P extends object>(
  root: string,
  keys: Partial<Record<SectionId, PoseKeys<P>>>,
  narrow: Partial<Record<SectionId, PoseKeys<P>>> = {},
  ease?: string,
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
  return [...fields].map((field) => ({ path: `${root}.${field}`, ease, keys: split(keys, field), narrow: split(narrow, field) }));
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
  roll: number;
}

/**
 * Câmera em órbita do alvo: azimute e elevação em graus (azimute 0 = de
 * frente, positivo = da direita). `sx` e `sy` são o deslocamento de lente; `roll`, a
 * rolagem em volta do eixo de visão (graus).
 */
export function orbit(
  target: readonly [number, number, number],
  azimuth: number,
  elevation: number,
  distance: number,
  fov = 30,
  sx = 0,
  sy = 0,
  roll = 0,
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
    roll,
  };
}

/**
 * Enquadramentos (alvo, azimute, elevação, distância), medidos com
 * scripts/dev/framing.mjs: o sujeito de cada beat com 55–70% da altura e até 66%
 * da largura no desktop (celular: até 88% da largura). O alvo é o centro do sujeito.
 * `fov` 30 no desktop e 34 no celular.
 */
export type Frame = readonly [target: readonly [number, number, number], az: number, el: number, dist: number, sx?: number, sy?: number, roll?: number];

export const DESKTOP: Record<BeatId, Frame> = {
  fechado: [[-0.01, 0.77, 0.18], 30, 22, 6.95, -0.02, 0.03],
  abre: [[-0.09, 0.77, 0.16], 24, 42, 7.49, -0.03, 0.02],
  explode: [[0.12, 1.7, 0.54], 30, 22, 11.17, 0, -0.01],
  painel: [[0.08, 3.48, 0.55], 30, 50, 8.65, 0.02, 0.01],
  carga: [[0.32, 1.72, 0.78], 30, 45, 0.7, 0.02, 0.05],
  celulas: [[-0.22, 1.15, 0.44], 30, 45, 1.66, 0.01, 0.04],
  saida: [[0.61, 0.67, 0.71], 12, 28, 0.54, -0.01, 0.07],
  remonta: [[-0.09, 0.77, 0.16], 60, 22, 7.16, -0.03, 0.04],
  energia: [[0.36, 0.86, 0.16], 20, 25, 6.5, -0.04, 0.03],
};

/**
 * Celular: a largura manda, então as distâncias crescem. Nos closes das peças largas (células e
 * saída) a câmera rola 90° (o último número): a peça fica em pé e a altura vai de ~28% a 50%. O
 * módulo de carga é quase quadrado e não ganharia nada (41% contra 40%): fica sem rolagem.
 */
export const NARROW: Record<BeatId, Frame> = {
  fechado: [[-0.01, 0.77, 0.18], 30, 22, 9.69, -0.04, 0.01],
  abre: [[-0.09, 0.77, 0.16], 24, 42, 8.3, -0.1, 0.01],
  explode: [[0.12, 1.7, 0.54], 30, 22, 12.16, 0.01, -0.01],
  painel: [[0.49, 4.02, 0.46], 30, 45, 10.97, 0.04, 0],
  carga: [[0.32, 1.72, 0.78], 30, 45, 0.94, 0.03, 0.03],
  celulas: [[-0.22, 1.15, 0.44], 30, 45, 2.66, 0.03, -0.01, 90],
  saida: [[0.61, 0.67, 0.71], 12, 28, 0.8, 0.06, 0.01, 90],
  remonta: [[-0.09, 0.77, 0.16], 60, 22, 10.17, -0.06, 0.02],
  energia: [[0.36, 0.86, 0.16], 20, 25, 10.98, -0.05, 0.01],
};

const frameKey = (frame: Frame, fov: number) => orbit(frame[0], frame[1], frame[2], frame[3], fov, frame[4] ?? 0, frame[5] ?? 0, frame[6] ?? 0);

/**
 * Uma câmera parada por beat e um voo entre uma e outra (`flightOf`). Com `via`, o voo chega ao
 * enquadramento de outro beat e desliza dali até o próprio, que vale até o voo do próximo.
 */
function cameraKeys(frames: Record<BeatId, Frame>, fov: number): PoseKeys<CameraKey> {
  const keys: Array<readonly [number, CameraKey]> = [];
  let held = frameKey(frames[BEATS[0].id], fov);
  keys.push([0, held]);
  BEATS.forEach((beat, i) => {
    if (i === 0) return;
    const pose = frameKey(frames[beat.id], fov);
    const [start, arrive] = flightOf(beat);
    keys.push([start, held]);
    if (beat.via) {
      keys.push([arrive, frameKey(frames[beat.via], fov)], [flightOf(BEATS[i + 1])[0] - SETTLE, pose]);
    } else {
      keys.push([arrive, pose]);
    }
    held = pose;
  });
  keys.push([1, held]);
  return keys;
}

// ---------------------------------------------------------------- trilhos

const lastBeat = BEATS[BEATS.length - 1];

/** [início, fim] de um beat por id. */
const span = (id: BeatId): readonly [number, number] => {
  const beat = BEATS.find((b) => b.id === id)!;
  return [beat.from, beat.to];
};

const bgKeys = (channel: 0 | 1 | 2): Keys => {
  const keys: Array<readonly [number, number]> = [[0, TONES[BEATS[0].bg][channel]]];
  for (let i = 1; i < BEATS.length; i++) {
    const before = TONES[BEATS[i - 1].bg][channel];
    const after = TONES[BEATS[i].bg][channel];
    if (before === after) continue;
    keys.push([BEATS[i].from - SWAP, before], [BEATS[i].from + SWAP, after]);
  }
  keys.push([1, TONES[lastBeat.bg][channel]]);
  return keys;
};

/** Texto: o tom troca no meio da janela de troca (degrau). */
const toneKeys = (): Keys => {
  const keys: Array<readonly [number, number]> = [[0, toneOf(BEATS[0])]];
  for (let i = 1; i < BEATS.length; i++) {
    if (toneOf(BEATS[i]) !== toneOf(BEATS[i - 1])) keys.push([BEATS[i].from, toneOf(BEATS[i])]);
  }
  return keys;
};

const [openFrom, openTo] = span("abre");
const [explodeFrom] = span("explode");
const explodeTo = explodeFrom + EXPLODE_SPAN;
const [panelFrom] = span("painel");
const carga = BEATS.find((b) => b.id === "carga")!;
const [cellsFrom] = span("celulas");
const [outFrom] = span("saida");
const [remountFrom] = span("remonta");
/** A remontagem fecha a caixa um pouco antes de a câmera sair para a energia. */
const remountDone = flightOf(BEATS[BEATS.length - 1])[0] - SETTLE;
const [energyFrom] = span("energia");

/** Foco: troca para o componente do beat durante o voo da câmera até ele e segura. */
const focusKeys = (): Keys => {
  const keys: Array<readonly [number, number]> = [[0, 0]];
  let held = 0;
  for (const beat of BEATS) {
    if (beat.focus === held) continue;
    const [start, arrive] = flightOf(beat);
    keys.push([start, held], [arrive, beat.focus]);
    held = beat.focus;
  }
  keys.push([1, held]);
  return keys;
};

/** Etiquetas: acendem depois da chegada da câmera a cada close e apagam antes do voo para o próximo. */
const labelKeys = (): Keys => {
  const keys: Array<readonly [number, number]> = [[0, 0]];
  BEATS.forEach((beat, i) => {
    if (!beat.focus) return;
    const arrive = flightOf(beat)[1];
    const leave = flightOf(BEATS[i + 1])[0];
    // Inteira até o ponto de repouso do beat (`restOf`, onde o reduced motion para) e apaga no início do voo.
    keys.push([arrive, 0], [beat.from + SWAP + 0.01, 1], [leave - 0.002, 1], [leave, 0]);
  });
  keys.push([1, 0]);
  return keys;
};

const panelKeys = (open: number): Keys => [
  [0, 0],
  [panelFrom + 0.03, 0],
  [flightOf(carga)[0] - SETTLE, open],
  [flightOf(BEATS[BEATS.length - 2])[0], open],
  [remountFrom, 0],
];

/**
 * Nas partes, `--bg` e o tom do texto seguem a parte que está sob o header (o topo da seção no
 * topo da tela): servem ao header e ao fundo da página; o campo de cada parte é pintado por ela.
 * Duas chaves iguais nas pontas de cada faixa viram degrau na divisa (lib/tracks.ts).
 */
const parts = Object.entries(PART_TONE) as Array<[PartSectionId, ToneId]>;
const partKeys = (value: (tone: ToneId) => number) =>
  Object.fromEntries(parts.map(([id, tone]): [PartSectionId, Keys] => [id, [[0, value(tone)], [1, value(tone)]]]));
const partBg = (channel: 0 | 1 | 2) => partKeys((tone) => TONES[tone][channel]);
const partTone = partKeys((tone) => (lightTone(tone) ? 1 : -1));

export const TRACKS: Track[] = [
  // Fundo e tom do texto: um por beat (trocados com o texto fora da tela) e um por parte.
  { path: "bg.r", keys: { produto: bgKeys(0), ...partBg(0) } },
  { path: "bg.g", keys: { produto: bgKeys(1), ...partBg(1) } },
  { path: "bg.b", keys: { produto: bgKeys(2), ...partBg(2) } },
  { path: "tone", step: true, keys: { produto: toneKeys(), ...partTone } },

  // Saída: depois do pin, a imagem sobe junto com a página (linear, 1 = uma tela, o quanto ela rola
  // do fim do pin até o topo da ponte) e o produto some quando já está fora da tela.
  { path: "lift", keys: { produto: [[1, 0]], ponte: [[0, 1]] } },
  { path: "productVisible", keys: { produto: [[0, 1]], ponte: [[0, 1], [0.001, 0]] } },

  // Tampa: abre no beat "Abre", fica aberta até a remontagem.
  {
    path: "lid",
    ease: "power2.inOut",
    keys: { produto: [[0, 0], [openFrom, 0], [openTo, 1], [remountFrom, 1], [remountDone - 0.005, 0]] },
  },
  // Explosão em cascata (cada peça no seu trecho, em scene/model/motion.ts); volta na remontagem, que
  // termina antes do voo para a energia. Mesma ease da câmera: o sujeito cresce no ritmo em que ela recua.
  {
    path: "explode",
    ease: "power2.inOut",
    keys: { produto: [[0, 0], [explodeFrom, 0], [explodeTo, 1], [remountFrom, 1], [remountDone, 0]] },
  },
  // O painel abre como um livro no beat dele e fecha na saída da câmera do close da saída (a remontagem
  // não mostra o painel aberto).
  {
    path: "panelOpen",
    ease: "power2.inOut",
    keys: { produto: panelKeys(PANEL_OPEN.wide) },
    narrow: { produto: panelKeys(PANEL_OPEN.narrow) },
  },
  { path: "focus", ease: "power2.inOut", keys: { produto: focusKeys() } },
  { path: "labels", keys: { produto: labelKeys() } },
  // A carga das células sobe no beat "Guardar".
  { path: "charge", keys: { produto: [[0, 0.15], [cellsFrom + 0.015, 0.15], [cellsFrom + 0.06, 1]] } },
  // O LED acende na vez do beat "Entregar" e fica aceso até o fim.
  { path: "ledOn", keys: { produto: [[0, 0], [outFrom + 0.03, 0], [outFrom + 0.05, 1]] } },
  // Energia: o celular entra, o cabo se desenha e a carga sobe.
  { path: "phoneVisible", ease: "power2.out", keys: { produto: [[0, 0], [energyFrom, 0], [energyFrom + 0.025, 1]] } },
  { path: "cable", ease: "power1.inOut", keys: { produto: [[0, 0], [energyFrom + 0.02, 0], [energyFrom + 0.05, 1]] } },
  { path: "phoneCharge", keys: { produto: [[0, 0], [energyFrom + 0.04, 0], [1, 1]] } },

  // Luz de contorno mais forte nos fundos escuros, e a sombra some na explosão.
  {
    path: "rim",
    keys: {
      produto: BEATS.flatMap((b, i): Array<readonly [number, number]> => {
        const v = lightTone(b.bg) ? 1 : 0.25;
        return i === 0 ? [[0, v]] : [[b.from - SWAP, lightTone(BEATS[i - 1].bg) ? 1 : 0.25], [b.from + SWAP, v]];
      }),
    },
  },
  { path: "shadow", keys: { produto: [[0, 1], [explodeFrom, 1], [explodeFrom + 0.05, 0.25], [remountDone - 0.05, 0.25], [remountDone, 1]] } },
  // Inclinação pelo ponteiro: inteira no hero, mais discreta nos closes.
  { path: "tilt", keys: { produto: [[0, 1], [openFrom + 0.04, 0.3], [1, 0.3]] } },

  // Giro do conjunto, preso ao scroll (nada de giro por tempo: rolar para cima desfaz).
  { path: "product.ry", keys: { produto: [[0, 0], [0.08, 14], [1, 14]] } },

  ...poseTracks<CameraKey>(
    "camera",
    { produto: cameraKeys(DESKTOP, 30) },
    { produto: cameraKeys(NARROW, 34) },
    "power2.inOut",
  ),
];
