import { useSyncExternalStore } from "react";
import { REDUCED_MOTION } from "./env";

/** Uma media query, reativa: muda se a viewport ou a preferência mudar com a página aberta. */
export function useMedia(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** `prefers-reduced-motion`, reativo: muda se a pessoa trocar a preferência com a página aberta. */
export function useReducedMotion(): boolean {
  return useMedia(REDUCED_MOTION);
}
