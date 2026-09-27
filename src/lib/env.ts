/** Flags de ambiente lidas da URL/mídia, usadas em vários pontos do app. */

function param(name: string): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(name);
}

export function isDebug(): boolean {
  return param("debug") !== null;
}

export function isSnap(): boolean {
  return param("snap") !== null;
}

export function getActParam(): string | null {
  return param("act");
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
