/**
 * `?movimento=1`: liga a animação mesmo com "reduzir movimento" no sistema.
 *
 * Para a apresentação num computador em que não dá para mexer nas configurações
 * (laboratório com os efeitos de animação do Windows desligados). Sem a flag, nada muda:
 * quem pede movimento reduzido continua com o caminho próprio (CLAUDE.md, Arquitetura).
 * Fica valendo na aba até `?movimento=0` (sessionStorage), para sobreviver a um F5.
 *
 * Funciona trocando a pergunta antes de qualquer um fazê-la: o `window.matchMedia`
 * (que o React, o GSAP e o Lenis usam) passa a responder "sem preferência", e as regras
 * `@media (prefers-reduced-motion: reduce)` do CSS saem das folhas carregadas.
 * Este módulo precisa ser o primeiro import de `main.tsx`.
 */

const KEY = "suntech:movimento";
const REDUCE = /\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/gi;
const IS_REDUCE = /\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/i;
const NO_PREFERENCE = /\(\s*prefers-reduced-motion\s*:\s*no-preference\s*\)/gi;
// Condições válidas no meio de uma lista com "and" ("all" sozinho não é).
const NEVER = "(not (min-width: 0px))";
const ALWAYS = "(min-width: 0px)";

function wanted(): boolean {
  const value = new URLSearchParams(window.location.search).get("movimento");
  try {
    if (value === "1") sessionStorage.setItem(KEY, "1");
    if (value === "0") sessionStorage.removeItem(KEY);
    return value === "1" || (value !== "0" && sessionStorage.getItem(KEY) === "1");
  } catch {
    return value === "1";
  }
}

type RuleOwner = { cssRules: CSSRuleList; deleteRule(index: number): void };

function stripReducedRules(owner: RuleOwner): void {
  const rules = owner.cssRules;
  for (let i = rules.length - 1; i >= 0; i--) {
    const rule = rules[i];
    if (rule instanceof CSSMediaRule) {
      const media = Array.from(rule.media);
      const reduce = media.filter((m) => IS_REDUCE.test(m));
      if (reduce.length > 0 && reduce.length === media.length) {
        owner.deleteRule(i);
        continue;
      }
      for (const m of reduce) rule.media.deleteMedium(m);
    }
    if (rule instanceof CSSGroupingRule) stripReducedRules(rule);
  }
}

function stripStylesheets(): void {
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      stripReducedRules(sheet);
    } catch {
      // Folha de outra origem: não é do site.
    }
  }
}

export const motionForced = typeof window !== "undefined" && wanted();

if (motionForced) {
  const original = window.matchMedia.bind(window);
  window.matchMedia = (query: string) => original(query.replace(REDUCE, NEVER).replace(NO_PREFERENCE, ALWAYS));
  document.documentElement.dataset.motion = "forced";
  // O CSS do build já está carregado; no dev, o Vite injeta o index.css logo depois deste módulo.
  stripStylesheets();
  queueMicrotask(stripStylesheets);
  new MutationObserver(stripStylesheets).observe(document.head, { childList: true, subtree: true, characterData: true });
  window.addEventListener("load", stripStylesheets, { once: true });
}
