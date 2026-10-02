import type { PartId } from "../content/product";

/**
 * Registro dos callouts de "Por dentro". O DOM (a camada dos callouts e a
 * lista de peças) se registra aqui; a cena 3D projeta as âncoras das peças a
 * cada quadro e escreve a posição e o estado direto nos elementos, sem
 * re-render. Não importa `three`: entra no chunk inicial.
 */
export interface CalloutSlot {
  /** O callout que segue a peça na tela. */
  callout?: HTMLElement;
  /** O item da lista de peças (a versão acessível dos callouts). */
  item?: HTMLElement;
}

export const calloutSlots = new Map<PartId, CalloutSlot>();

/** Contêiner da camada (some fora da vista explodida). */
export const calloutLayer: { element: HTMLElement | null } = { element: null };

export function registerCallout(id: PartId, key: keyof CalloutSlot, element: HTMLElement | null): void {
  const slot = calloutSlots.get(id) ?? {};
  if (element) slot[key] = element;
  else delete slot[key];
  calloutSlots.set(id, slot);
}
