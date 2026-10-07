/**
 * Tom da página (Regra do Tom e Regra do Corte, DESIGN.md): o fundo é uma cor
 * sólida (`--bg`, escrita pelo trilho de scroll) e o texto é Noite sobre os claros
 * e Nuvem sobre os escuros (`data-tone`). Só CSS: roda no chunk inicial.
 *
 * A troca de tom passa por fundos intermediários em que nem Nuvem nem Noite
 * chegam a 4,5:1 (L 0,167 a 0,246 de luminância WCAG). Ela só acontece com o
 * texto fora da tela; enquanto o fundo está nessa faixa, o header sai de cena
 * (`data-crossing`).
 */

export type Tone = "light" | "dark";

let appliedTone: Tone | null = null;
let appliedCrossing = false;
let appliedBg = "";

/** Luminância relativa WCAG de uma cor sRGB 0–255. */
function luminance(r: number, g: number, b: number): number {
  const lin = (c: number) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** Tom do texto por valor agendado: 1 = Nuvem (fundo escuro), −1 = Noite (fundo claro). */
export function toneFromSchedule(value: number): Tone {
  return value > 0 ? "light" : "dark";
}

/** `data-tone` no `<html>`: troca `--fg` (com crossfade no CSS). */
export function applyTone(value: number): void {
  const tone = toneFromSchedule(value);
  if (tone === appliedTone) return;
  appliedTone = tone;
  document.documentElement.dataset.tone = tone;
}

/** `--bg` no `<html>` e `data-crossing` enquanto o fundo cruza a zona morta. */
export function applyBg(bg: { r: number; g: number; b: number }): void {
  const r = Math.round(bg.r);
  const g = Math.round(bg.g);
  const b = Math.round(bg.b);
  const value = `rgb(${r} ${g} ${b})`;
  if (value === appliedBg) return;
  appliedBg = value;
  const root = document.documentElement;
  root.style.setProperty("--bg", value);
  const l = luminance(r, g, b);
  const crossing = l > 0.1 && l < 0.4;
  if (crossing !== appliedCrossing) {
    appliedCrossing = crossing;
    root.toggleAttribute("data-crossing", crossing);
  }
}
