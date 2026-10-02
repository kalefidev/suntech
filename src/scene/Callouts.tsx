import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { type Object3D, Vector3 } from "three";
import { parts, type PartId } from "../content/product";
import { calloutLayer, calloutSlots } from "../lib/callouts";
import { CALLOUT_AT, productLive } from "./Product/motion";
import { sceneState } from "./state";

/** Pontos de ancoragem dos callouts, um por peça (o centro do topo da peça). */
const anchors = new Map<PartId, Object3D>();

/** Marca o ponto da peça onde o callout de `id` se prende. */
export function CalloutAnchor({ id, position }: { id: PartId; position: readonly [number, number, number] }) {
  const ref = useRef<Object3D>(null);
  useLayoutEffect(() => {
    const object = ref.current;
    if (!object) return;
    anchors.set(id, object);
    return () => {
      if (anchors.get(id) === object) anchors.delete(id);
    };
  }, [id]);
  return <object3D ref={ref} position={position} />;
}

const set = (element: HTMLElement, key: string, value: string) => {
  if (element.dataset[key] !== value) element.dataset[key] = value;
};

/**
 * Projeta as âncoras na tela a cada quadro e escreve direto nos elementos do
 * DOM (posição e estado), sem re-render. Cada callout liga quando a sua peça
 * chega a 80% do percurso; a última peça separada ganha o nome e fica marcada
 * na lista. A camada some fora da vista explodida.
 */
export function CalloutProjector() {
  const point = useMemo(() => new Vector3(), []);

  useFrame(({ camera, size }) => {
    const layer = calloutLayer.element;
    if (!layer) return;
    // Só em "Por dentro": depois do caminho da energia (`flow` fica em 4), a
    // vista explodida que se fecha em "A energia fica" não tem legenda.
    const show = productLive.explode > 0.05 && productLive.schematic < 0.02 && sceneState.flow < 0.001;
    set(layer, "visible", show ? "1" : "0");

    let active: PartId | null = null;
    for (const part of parts) {
      const slot = calloutSlots.get(part.id);
      const on = show && productLive.explode >= CALLOUT_AT[part.id];
      if (on) active = part.id;
      const callout = slot?.callout;
      const anchor = anchors.get(part.id);
      if (!callout) continue;
      set(callout, "on", on ? "1" : "0");
      if (!show || !anchor) continue;
      anchor.getWorldPosition(point).project(camera);
      const x = (point.x * 0.5 + 0.5) * size.width;
      const y = (-point.y * 0.5 + 0.5) * size.height;
      callout.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    }
    // O nome aparece só na peça que acabou de se separar; as outras ficam com
    // o número (a lista do lado tem todos os nomes, com os mesmos números).
    for (const part of parts) {
      const slot = calloutSlots.get(part.id);
      const current = part.id === active ? "1" : "0";
      if (slot?.item) set(slot.item, "active", current);
      if (slot?.callout) set(slot.callout, "current", current);
    }
  });

  return null;
}
