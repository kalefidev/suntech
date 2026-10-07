import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Box3, Object3D, Vector3 } from "three";
import { sceneState } from "../state";
import { BEATS } from "../choreography";
import { useMedia } from "../../lib/useReducedMotion";
import { WIDE } from "../../lib/env";
import type { ModelRegistry } from "./SuntechModel";
import type { PartName } from "./motion";

/** Onde cada etiqueta se prende: a âncora do GLB, se houver; senão, o centro da peça. */
const TARGETS: Record<1 | 2 | 3 | 4, { anchor: string; part: PartName }> = {
  1: { anchor: "label_panel", part: "panel_a" },
  2: { anchor: "label_pcb_charge", part: "pcb_charge" },
  3: { anchor: "", part: "cell_holder" },
  4: { anchor: "label_pcb_boost", part: "pcb_boost" },
};
const IDS = [1, 2, 3, 4] as const;
/** Folga entre o sujeito (ou o texto) e a pílula, em px. */
const GAP = 28;

interface Slot {
  anchor: Object3D;
  beat: (typeof BEATS)[number];
  pill: HTMLElement;
  line: SVGLineElement;
  dot: SVGCircleElement;
  group: SVGGElement;
  body: HTMLElement | null;
}

/** Ponto no centro da caixa da peça, preso a ela (segue a explosão). */
function centerAnchor(node: Object3D): Object3D {
  node.updateWorldMatrix(true, true);
  const center = new Box3().setFromObject(node).getCenter(new Vector3());
  const anchor = new Object3D();
  anchor.position.copy(node.worldToLocal(center));
  node.add(anchor);
  return anchor;
}

/**
 * Projeta a âncora da peça em foco e escreve a posição da etiqueta direto no DOM
 * (sections/PartLabels.tsx), sem re-render. A etiqueta é a do componente em foco e acende
 * com `sceneState.labels`, que só vale 1 com a câmera parada no close (o foco cruza outros
 * componentes nos voos).
 */
export function LabelProjector({ model }: { model: ModelRegistry }) {
  const wide = useMedia(WIDE);
  const anchors = useMemo(() => IDS.map((n) => model.anchors[TARGETS[n].anchor] ?? centerAnchor(model.parts[TARGETS[n].part].node)), [model]);
  const point = useMemo(() => new Vector3(), []);
  const slots = useMemo<{ layer: HTMLElement | null; list: Slot[] }>(() => ({ layer: null, list: [] }), []);

  useEffect(
    () => () => {
      if (slots.layer) slots.layer.dataset.visible = "0";
    },
    [slots],
  );

  useFrame(({ camera, size }) => {
    if (!slots.layer) {
      const layer = document.querySelector<HTMLElement>("[data-part-labels]");
      if (!layer) return;
      slots.layer = layer;
      slots.list = IDS.map((n, i) => {
        const group = layer.querySelector<SVGGElement>(`[data-label-line="${n}"]`)!;
        const beat = BEATS.find((b) => b.focus === n)!;
        return {
          anchor: anchors[i],
          beat,
          pill: layer.querySelector<HTMLElement>(`[data-label="${n}"]`)!,
          line: group.querySelector("line")!,
          dot: group.querySelector("circle")!,
          group,
          body: document.querySelector<HTMLElement>(`[data-beat="${beat.id}"] .beat__body`),
        };
      });
    }
    const s = sceneState;
    const { width: W, height: H } = size;
    let any = false;

    for (let i = 0; i < slots.list.length; i++) {
      const slot = slots.list[i];
      const opacity = Math.round(s.focus) === i + 1 ? s.labels * s.productVisible : 0;
      const value = opacity.toFixed(3);
      if (slot.pill.style.opacity !== value) {
        slot.pill.style.opacity = value;
        slot.group.setAttribute("opacity", value);
      }
      if (opacity <= 0) continue;
      any = true;

      // Leituras antes das escritas: nada de layout forçado no meio do quadro.
      const pw = slot.pill.offsetWidth;
      const ph = slot.pill.offsetHeight;
      const textTop = wide ? 0 : (slot.body?.getBoundingClientRect().top ?? H);

      slot.anchor.getWorldPosition(point).project(camera);
      const ax = (point.x * 0.5 + 0.5) * W;
      const ay = (-point.y * 0.5 + 0.5) * H;
      let px: number;
      let py: number;
      let lx: number;
      let ly: number;
      if (wide) {
        // Na coluna livre do lado oposto ao texto, à altura da âncora.
        const edge = (W * slot.beat.span) / 2;
        const right = slot.beat.side === "left";
        px = right ? W / 2 + edge + GAP : W / 2 - edge - GAP - pw;
        py = Math.min(H * 0.8, Math.max(H * 0.2, ay)) - ph / 2;
        lx = right ? px : px + pw;
        ly = py + ph / 2;
      } else {
        // Logo acima do texto, na vertical da âncora.
        px = Math.min(W - pw - 16, Math.max(16, ax - pw / 2));
        py = Math.min(H - ph - 8, textTop - GAP / 2 - ph);
        lx = Math.min(px + pw - ph / 2, Math.max(px + ph / 2, ax));
        ly = py;
      }
      slot.pill.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0)`;
      slot.line.setAttribute("x1", ax.toFixed(1));
      slot.line.setAttribute("y1", ay.toFixed(1));
      slot.line.setAttribute("x2", lx.toFixed(1));
      slot.line.setAttribute("y2", ly.toFixed(1));
      slot.dot.setAttribute("cx", ax.toFixed(1));
      slot.dot.setAttribute("cy", ay.toFixed(1));
    }
    const visible = any ? "1" : "0";
    if (slots.layer.dataset.visible !== visible) slots.layer.dataset.visible = visible;
  });

  return null;
}
