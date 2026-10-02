import { caseDimensions, plateDimensions } from "../../content/product";

/** 1 unidade da cena = 100 mm (docs/fase-0.md, item 6). */
export const MM = 0.01;

/**
 * Medidas do modelo, em unidades da cena, a partir do `product.ts`: com as
 * medidas reais preenchidas, o 3D se ajusta sozinho; sem elas, valem as
 * proporções padrão (seção 3 do brief).
 */
export function productDimensions() {
  const c = caseDimensions();
  const p = plateDimensions();
  const caseHeight = c.height * MM;
  const feet = 2 * MM;
  const lid = caseHeight * 0.16;
  const gap = 0.7 * MM;
  return {
    case: {
      length: c.length * MM,
      width: c.width * MM,
      height: caseHeight,
      feet,
      lid,
      gap,
      body: caseHeight - feet - lid - gap,
      wall: 3 * MM,
      /** Raio dos cantos vistos de cima. */
      corner: 7 * MM,
      /** Bisel das arestas (nenhuma aresta viva, receita de estúdio). */
      bevel: 2.5 * MM,
    },
    plate: {
      length: p.length * MM,
      width: p.width * MM,
      thickness: p.height * MM,
      frame: 4.5 * MM,
    },
  };
}

export type ProductDimensions = ReturnType<typeof productDimensions>;
