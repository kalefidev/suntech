import { useSyncExternalStore } from "react";
import { REDUCED_MOTION } from "./env";

function subscribe(onChange: () => void): () => void {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const read = () => window.matchMedia(REDUCED_MOTION).matches;

/** `prefers-reduced-motion`, reativo: muda se a pessoa trocar a preferência com a página aberta. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, read, () => false);
}
