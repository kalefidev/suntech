import { quality } from "../quality";
import { company } from "../../content/company";
import { createCellMaps } from "./cells";
import { createLogoNormal } from "./logo";
import { createBoostMap, createChargerMap } from "./pcb";
import { createBatteryLabel } from "./batteryLabel";

async function build() {
  // As texturas com texto usam a Archivo do site: espera a fonte.
  await document.fonts.load('800 100px "Archivo"').catch(() => undefined);
  const { cells, pcb } = quality.entry().textures;
  return {
    cells: createCellMaps(cells),
    logo: createLogoNormal(company.name, Math.min(1024, cells / 2)),
    charger: createChargerMap(pcb),
    boost: createBoostMap(pcb),
    battery: createBatteryLabel(Math.max(128, pcb / 2)),
  };
}

export type ProductTextures = Awaited<ReturnType<typeof build>>;

let promise: Promise<ProductTextures> | null = null;

/**
 * Gera as texturas procedurais uma vez, no tamanho do tier de entrada
 * (seção 11 do brief: nada de redesenhar canvas por frame).
 */
export function loadProductTextures(): Promise<ProductTextures> {
  promise ??= build();
  return promise;
}
