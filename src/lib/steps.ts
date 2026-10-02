import type { EnergyStepId } from "../content/product";

/**
 * Registro das etapas de "Como funciona": as etiquetas que seguem o esquema
 * 3D e os itens da lista (a versão acessível). A cena 3D escreve a posição e
 * o estado direto nos elementos, sem re-render. Não importa `three`.
 */
export interface StepSlot {
  label?: HTMLElement;
  item?: HTMLElement;
}

export const stepSlots = new Map<EnergyStepId | "conversion", StepSlot>();

export const stepLayer: { element: HTMLElement | null } = { element: null };

export function registerStep(id: EnergyStepId | "conversion", key: keyof StepSlot, element: HTMLElement | null): void {
  const slot = stepSlots.get(id) ?? {};
  if (element) slot[key] = element;
  else delete slot[key];
  stepSlots.set(id, slot);
}
