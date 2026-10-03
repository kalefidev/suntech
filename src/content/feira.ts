// Feira de Empreendedorismo: as 6 partes na ordem das aulas, os dados
// externos (sempre com fonte, seção 3 do BRIEF.md) e o roteiro do pitch.

import { brl } from "./format";
import { product } from "./product";

export type PartId = "problema" | "cliente" | "solucao" | "empresa" | "pitch" | "jovem";

export interface Part {
  id: PartId;
  n: number;
  /** Rótulo curto do header ("3 Solução"). */
  nav: string;
  title: string;
  aula: string;
}

export const partsOfFair: Part[] = [
  { id: "problema", n: 1, nav: "Problema", title: "O problema", aula: "Aula 2: Kickoff inspirador" },
  { id: "cliente", n: 2, nav: "Cliente", title: "O cliente", aula: "Aula 3: Conhecendo o cliente" },
  { id: "solucao", n: 3, nav: "Solução", title: "A solução e o diferencial", aula: "Aula 4: Diferenciais reais e solução" },
  { id: "empresa", n: 4, nav: "Empresa", title: "A empresa", aula: "Aula 5: Criação da empresa" },
  { id: "pitch", n: 5, nav: "Pitch", title: "O pitch", aula: "Aula 6: Pitch" },
  { id: "jovem", n: 6, nav: "Jovem", title: "O papel do jovem no empreendedorismo do futuro", aula: "Atividade AQ3" },
];

export interface Source {
  label: string;
  url: string;
}

export const sources = {
  iema: {
    label: "Poder360, com dados do IEMA",
    url: "https://www.poder360.com.br/brasil/quase-1-milhao-nao-tem-acesso-a-energia-eletrica-na-regiao-da-amazonia-legal/",
  },
  idec: { label: "Idec", url: "https://idec.org.br/node/29026" },
  dlight: { label: "d.light", url: "https://www.dlight.com" },
  earthshot: { label: "Earthshot Prize", url: "https://earthshotprize.org/winners-finalists/d-light/" },
} satisfies Record<string, Source>;

/** Um dado externo: texto antes e depois do número (que conta até o valor). */
export interface Fact {
  before: string;
  value: number;
  after: string;
  sources: Source[];
}

export const facts = {
  semEnergia: {
    before: "",
    value: 990103,
    after: " brasileiros viviam sem energia elétrica na Amazônia Legal, segundo um estudo do IEMA de 2019.",
    sources: [sources.iema],
  },
  apagaoAmapa: {
    before: "Em novembro de 2020, o Amapá passou mais de ",
    value: 20,
    after: " dias com falta de energia.",
    sources: [sources.idec],
  },
  // Atualizado em 02/10/2026, a pedido do usuário: a seção 3 do brief diz
  // "mais de 150 milhões"; a d.light hoje diz "215 million lives transformed"
  // (e a Earthshot, "over 175 million lives", número mais antigo). O número é
  // o da própria empresa, e a frase diz isso.
  dlightAlcance: {
    before: "Segundo a própria empresa, já são ",
    value: 215,
    after: " milhões de vidas transformadas.",
    sources: [sources.dlight, sources.earthshot],
  },
} satisfies Record<string, Fact>;

export type Sector = "Marketing" | "Produtos" | "Finanças";

export interface PitchBlock {
  from: string;
  to: string;
  sector: Sector;
  text: string;
}

/** Linha do tempo do pitch em 3 minutos (Aula 6). */
export const pitchTimeline: PitchBlock[] = [
  {
    from: "0:00",
    to: "1:00",
    sector: "Marketing",
    text: "O problema e a persona (o Seu Antônio sem energia), a marca e a proposta: “Energia do sol, onde você estiver.”",
  },
  {
    from: "1:00",
    to: "2:00",
    sector: "Produtos",
    text: "A solução e o valor: abre o painel, usa a lâmpada no lugar do sol, liga no celular e mostra os diferenciais.",
  },
  {
    from: "2:00",
    to: "3:00",
    sector: "Finanças",
    text: `Custos e preço justo: custo de ${brl(product.costTotalBRL)}, preço de ${brl(product.priceBRL)} e parcelamento.`,
  },
];

export interface PitchStop {
  /** Segundo em que a parada começa (0 a 180). */
  at: number;
  sector: Sector;
  label: string;
  /** `data-section` ou `id` do alvo na página. */
  target: string;
  /** Em cenas presas, trecho do pin percorrido durante a parada (0 a 1). */
  from?: number;
  to?: number;
}

/** Modo pitch: exatamente 180 s, em sincronia com a linha do tempo acima. */
export const PITCH_SECONDS = 180;

export const pitchStops: PitchStop[] = [
  { at: 0, sector: "Marketing", label: "Situação-problema", target: "situacao-problema" },
  { at: 30, sector: "Marketing", label: "Persona", target: "persona" },
  { at: 60, sector: "Produtos", label: "Por dentro", target: "por-dentro", from: 0.2, to: 0.85 },
  { at: 85, sector: "Produtos", label: "Como funciona", target: "como-funciona", from: 0.1, to: 0.75 },
  { at: 110, sector: "Produtos", label: "Diferencial", target: "diferencial-tabela" },
  { at: 120, sector: "Finanças", label: "Custos", target: "custos" },
  { at: 160, sector: "Finanças", label: "Preço", target: "preco" },
];
