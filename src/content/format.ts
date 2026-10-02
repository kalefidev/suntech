// Formatação pt-BR (seção 3 do BRIEF: "3,7 V; 2.600 mAh; R$ 249; 140 × 75 mm").
// O espaço entre número e unidade é inseparável, para a unidade nunca quebrar
// sozinha na linha de baixo.

const NBSP = " ";

function decimals(value: number): number {
  return Number.isInteger(value) ? 0 : 1;
}

/** 2600 → "2.600"; 3.7 → "3,7". */
export function num(value: number, digits = decimals(value)): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

/** 3.7, "V" → "3,7 V". */
export function unit(value: number, symbol: string): string {
  return `${num(value)}${NBSP}${symbol}`;
}

/** 249 → "R$ 249" (sem centavos, como no brief). */
export function brl(value: number): string {
  return `R$${NBSP}${num(value)}`;
}

/** {150, 100, 40} → "150 × 100 × 40 mm". */
export function mm(dims: readonly number[]): string {
  return `${dims.map((d) => num(d)).join(`${NBSP}×${NBSP}`)}${NBSP}mm`;
}
