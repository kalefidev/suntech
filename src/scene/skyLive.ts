import type { RGB } from "./daylight";
import { sceneState } from "./state";

/**
 * Hora e nuvens já amortecidas pelo céu (`Sky.tsx`), para a luz, a névoa e o
 * raio de sol andarem junto com ele. O céu roda o `useFrame` primeiro, por
 * estar antes na árvore. `horizon` é a cor do horizonte, linear.
 */
export const skyLive = {
  dayTime: sceneState.dayTime,
  cloudCover: sceneState.cloudCover,
  horizon: [0, 0, 0] as RGB,
};
