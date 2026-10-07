import { useEffect } from "react";
import { completeScene } from "../lib/loading";
import { setWebglOff } from "../lib/env";

/**
 * Sem WebGL (falha do contexto ou `?nowebgl`): o fundo continua sendo o tom em
 * CSS (`--bg`), a cena presa vira uma lista de blocos (os beats, um embaixo do
 * outro, sem pin) e o diagrama em SVG mostra o caminho da energia
 * (`[data-webgl="off"]`). Todo o conteúdo continua navegável.
 */
export function Fallback() {
  useEffect(() => {
    document.documentElement.dataset.webgl = "off";
    setWebglOff(true);
    completeScene();
    return () => {
      delete document.documentElement.dataset.webgl;
      setWebglOff(false);
    };
  }, []);
  return null;
}
