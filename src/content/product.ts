// Única fonte de fatos do produto: seção 3 do BRIEF.md ("Produto" e "Custos").
// Nenhum número do produto aparece no site fora daqui. Textos que citam
// números são montados aqui, com os formatadores pt-BR de `format.ts`.

import { brl, mm, num, unit } from "./format";

export interface Dimensions {
  /** mm */
  length: number;
  width: number;
  height: number;
}

export interface CostItem {
  item: string;
  brl: number;
}

export interface SpecRow {
  label: string;
  value: string;
  /** true = aparece com o rótulo "estimativa". */
  estimate?: boolean;
  /** true = valor fictício (medidas e peso ainda não medidos no protótipo), com o rótulo "ilustrativo". */
  illustrative?: boolean;
}

export interface PartInfo {
  id: PartId;
  name: string;
  role: string;
}

export type PartId =
  | "modulos"
  | "fiacao"
  | "bateria"
  | "saidas"
  | "luz"
  | "vidro"
  | "celulas"
  | "base";

export type EnergyStepId = "captar" | "proteger" | "guardar" | "entregar";

export interface EnergyStep {
  id: EnergyStepId;
  n: number;
  title: string;
  text: string;
  /** Token de cor da etapa (ver `@theme` em index.css). */
  color: "energia-luz" | "energia-painel" | "energia-guardada" | "energia-saida";
  legend: string;
}

/** Proporções do 3D enquanto as medidas reais não forem preenchidas (seção 3). */
export const DEFAULT_PROPORTIONS = {
  case: { length: 150, width: 100, height: 40 },
  plate: { length: 200, width: 150, height: 6 },
} as const satisfies Record<string, Dimensions>;

const measurements: {
  panelOpen: Dimensions | null;
  panelClosed: Dimensions | null;
  case: Dimensions | null;
} = {
  // FICTÍCIO (autorizado pelo dono em 07/10/2026): o protótipo ainda não foi medido. Valores
  // plausíveis, iguais às proporções do 3D, e marcados como "ilustrativos" na ficha técnica.
  // Troque pelos reais quando existirem e tire `illustrative` das linhas em `specSheet`.
  panelOpen: { length: 400, width: 150, height: 6 },
  panelClosed: { length: 200, width: 150, height: 12 },
  case: { length: 150, width: 100, height: 40 },
};

/** FICTÍCIO, como as medidas: painel ~330 g (duas placas de epóxi com moldura) + caixa ~250 g (com as células). */
const weightGrams: number | null = 580;

const panel = { plates: 2, voltsEach: 6, wattsEach: 3, volts: 6, watts: 6 };
/** "18650" é o formato da célula (18 mm de diâmetro por 65 mm), não uma quantidade. */
const battery = { format: "18650", cells: 2, voltsEach: 3.7, mAhEach: 2600, mAh: 5200, whApprox: 19 };
const charger = { module: "TP4056", protection: "DW01", maxAmps: 1 };
const converter = { fromVolts: 3.7, toVolts: 5, maxAmps: 1 };
const output = { volts: 5 };
const diode = { model: "1N5819", kind: "Schottky" };

const costs: CostItem[] = [
  { item: `${num(panel.plates)} placas solares ${unit(panel.voltsEach, "V")} ${unit(panel.wattsEach, "W")}`, brl: 70 },
  { item: `${num(battery.cells)} baterias ${battery.format} + suporte`, brl: 45 },
  { item: `Módulo de carga ${charger.module}`, brl: 7 },
  { item: `Conversor ${unit(output.volts, "V")} com USB`, brl: 8 },
  { item: "Cabo 3 em 1", brl: 20 },
  { item: "Caixa, dobradiças e moldura", brl: 25 },
  { item: "Diodo, chave, LED, fios e solda", brl: 10 },
];

export const product = {
  name: "Carregador Solar SunTech",
  format:
    "Duas partes: um painel solar dobrável (duas placas unidas por dobradiça, que abrem como um livro) e uma caixa com a bateria e a eletrônica, cuja tampa abre para cima e de onde sai o cabo de carga.",
  colorMaterial: "Caixa preta fosca; painel com moldura escura",
  measurements,
  weightGrams,
  panel,
  battery,
  charger,
  converter,
  output,
  diode,
  priceBRL: 249,
  costs,
  /** Soma da tabela (R$ 185 na seção 3 do brief). */
  costTotalBRL: costs.reduce((sum, row) => sum + row.brl, 0),
  /** Margem sobre o preço de venda, como está no brief. */
  margin: "cerca de 25%",
  estimates: {
    chargeSun: "de 6 a 8 horas de sol forte",
    chargeOutlet: "cerca de 6 horas na tomada",
    phoneCharges: "cerca de 1 carga completa de um celular comum",
  },
};

/** Medidas usadas pelo 3D: as reais quando existirem, senão as proporções padrão. */
export function caseDimensions(): Dimensions {
  return product.measurements.case ?? DEFAULT_PROPORTIONS.case;
}

export function plateDimensions(): Dimensions {
  const closed = product.measurements.panelClosed;
  if (!closed) return DEFAULT_PROPORTIONS.plate;
  return { length: closed.length, width: closed.width, height: closed.height / 2 };
}

const v = (value: number) => unit(value, "V");

/** Ficha técnica: só os campos preenchidos, estimativas marcadas. */
export function specSheet(): SpecRow[] {
  const rows: SpecRow[] = [
    {
      label: "Painel solar",
      value: `${num(panel.plates)} placas monocristalinas de ${v(panel.voltsEach)} e ${unit(panel.wattsEach, "W")} cada, em paralelo (${v(panel.volts)} e ${unit(panel.watts, "W")} no total)`,
    },
    {
      label: "Bateria",
      value: `${num(battery.cells)} células de lítio ${battery.format} de ${v(battery.voltsEach)} e ${unit(battery.mAhEach, "mAh")} em paralelo: ${unit(battery.mAh, "mAh")}, cerca de ${unit(battery.whApprox, "Wh")}`,
    },
    {
      label: "Controle e proteção",
      value: `Módulo ${charger.module} com proteção ${charger.protection} (sobrecarga, descarga profunda e curto-circuito), carga de até ${unit(charger.maxAmps, "A")}`,
    },
    {
      label: "Conversor de tensão",
      value: `Módulo boost de ${v(converter.fromVolts)} para ${v(converter.toVolts)}, até ${unit(converter.maxAmps, "A")}`,
    },
    {
      label: "Entradas",
      value: "Cabo do painel e USB-C, para recarregar na tomada",
    },
    {
      label: "Saída",
      value: `USB-A de ${v(output.volts)} com cabo 3 em 1 (USB-C, Lightning e micro-USB)`,
    },
    {
      label: "Outros componentes",
      value: `Diodo ${diode.kind} ${diode.model}, chave liga/desliga da saída, LED azul de saída ligada e LEDs de carga do módulo (vermelho carregando, azul completo)`,
    },
    {
      label: "Tempo de carga",
      value: `${product.estimates.chargeSun}; ${product.estimates.chargeOutlet}`,
      estimate: true,
    },
    { label: "Cargas de celular", value: product.estimates.phoneCharges, estimate: true },
    { label: "Cor e material", value: product.colorMaterial },
  ];

  const m = product.measurements;
  if (m.panelOpen) rows.push({ label: "Painel aberto", value: mm([m.panelOpen.length, m.panelOpen.width, m.panelOpen.height]), illustrative: true });
  if (m.panelClosed) rows.push({ label: "Painel fechado", value: mm([m.panelClosed.length, m.panelClosed.width, m.panelClosed.height]), illustrative: true });
  if (m.case) rows.push({ label: "Caixa", value: mm([m.case.length, m.case.width, m.case.height]), illustrative: true });
  if (product.weightGrams !== null) rows.push({ label: "Peso", value: unit(product.weightGrams, "g"), illustrative: true });

  rows.push({ label: "Preço", value: brl(product.priceBRL) });
  return rows;
}

/** Peças que aparecem na cena "Por dentro", na ordem em que se separam. */
export const parts: PartInfo[] = [
  { id: "modulos", name: "Módulos de carga", role: `O controlador ${charger.module} carrega a bateria no ritmo certo; o conversor eleva a tensão para o USB.` },
  { id: "fiacao", name: "Fiação", role: "Leva a corrente entre as peças: vermelho é o positivo, preto é o negativo." },
  { id: "bateria", name: "Bateria de lítio", role: "Guarda a energia do sol até você precisar." },
  { id: "saidas", name: "Saídas e chave", role: `USB-A de ${v(output.volts)} para o cabo 3 em 1; a chave liga e desliga a saída.` },
  { id: "luz", name: "Luz indicadora", role: "O LED azul acende quando a saída está ligada." },
  { id: "vidro", name: "Vidro do painel", role: "Protege as células e deixa a luz passar." },
  { id: "celulas", name: "Células solares", role: "Transformam luz em eletricidade." },
  { id: "base", name: "Base e dobradiça", role: "Seguram as placas e deixam o painel abrir como um livro." },
];

/** "Como funciona": as quatro etapas do caminho da energia. */
export const energyPath: EnergyStep[] = [
  {
    id: "captar",
    n: 1,
    title: "Captar",
    text: "O painel transforma luz em eletricidade: a luz movimenta elétrons no silício, e esse movimento vira corrente.",
    color: "energia-luz",
    legend: "Luz",
  },
  {
    id: "proteger",
    n: 2,
    title: "Proteger",
    text: "O controlador carrega a bateria no ritmo certo e evita sobrecarga. O diodo impede que a energia volte para o painel à noite.",
    color: "energia-painel",
    legend: "Corrente do painel",
  },
  {
    id: "guardar",
    n: 3,
    title: "Guardar",
    text: "A bateria de lítio armazena a energia até você precisar, de dia ou de noite.",
    color: "energia-guardada",
    legend: "Energia guardada",
  },
  {
    id: "entregar",
    n: 4,
    title: "Entregar",
    text: `O conversor eleva os ${v(converter.fromVolts)} da bateria para os ${v(converter.toVolts)} do USB, e o celular carrega normalmente.`,
    color: "energia-saida",
    legend: `Saída de ${v(output.volts)}`,
  },
];

/**
 * Dado de cada componente na cena do produto (um por beat), da mesma fonte da ficha
 * técnica: os números só moram aqui.
 */
export const componentSpecs: Record<EnergyStepId, string> = {
  captar: `${num(panel.plates)} placas de ${v(panel.voltsEach)} e ${unit(panel.wattsEach, "W")} cada, em paralelo: ${v(panel.volts)} e ${unit(panel.watts, "W")} no total`,
  proteger: `Módulo ${charger.module} com proteção ${charger.protection}, carga de até ${unit(charger.maxAmps, "A")}`,
  guardar: `${num(battery.cells)} células ${battery.format} de ${v(battery.voltsEach)} e ${unit(battery.mAhEach, "mAh")}: ${unit(battery.mAh, "mAh")} no total`,
  entregar: `Conversor de ${v(converter.fromVolts)} para ${v(converter.toVolts)}, até ${unit(converter.maxAmps, "A")}, na saída USB-A`,
};

/** Rótulo do callout da etapa 4 ("3,7 V → 5 V"); a seta é desenhada em SVG. */
export const conversionLabel = { from: v(converter.fromVolts), to: v(converter.toVolts) };
