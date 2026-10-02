import { useEffect } from "react";
import { completeScene } from "../lib/loading";
import { setCssSky } from "../lib/tracks";

/**
 * Sem WebGL (falha do contexto ou `?nowebgl`): o céu vira o gradiente em CSS
 * do `body::before`, que passa a seguir a hora pelo mesmo `daylight.ts`, e a
 * seção "Como funciona" mostra o diagrama em SVG (`[data-webgl="off"]`).
 * Todo o conteúdo continua navegável.
 */
export function Fallback() {
  useEffect(() => {
    document.documentElement.dataset.webgl = "off";
    completeScene();
    setCssSky(true);
    return () => {
      setCssSky(false);
      delete document.documentElement.dataset.webgl;
    };
  }, []);
  return null;
}
