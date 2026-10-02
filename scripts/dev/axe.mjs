// Auditoria de acessibilidade com o axe-core (carregado da CDN, sem instalar).
// Uso: node scripts/dev/axe.mjs [L]x[A] [--reduced] [--pitch]  (preview em :4173)
// --pitch: audita com o modo pitch no ar (o HUD).
import { chromium } from "playwright";
import { GL_ARGS } from "../gl.mjs";

const args = process.argv.slice(2);
const [width, height] = (args.find((a) => /^\d+x\d+$/.test(a)) ?? "1440x900").split("x").map(Number);
const reduced = args.includes("--reduced");
const pitch = args.includes("--pitch");
const browser = await chromium.launch({ args: GL_ARGS });
const context = await browser.newContext({
  viewport: { width, height },
  deviceScaleFactor: 1,
  reducedMotion: reduced ? "reduce" : "no-preference",
  hasTouch: width < 600,
  isMobile: width < 600,
});
const page = await context.newPage();
await page.goto("http://localhost:4173/?snap", { waitUntil: "load" });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 90000 });
if (pitch) {
  await page.evaluate(() => document.querySelector(".pitch-start .btn-cta").click());
  await page.waitForSelector(".pitch-hud");
}
await page.addScriptTag({ url: "https://cdn.jsdelivr.net/npm/axe-core@4.10.2/axe.min.js" });
const result = await page.evaluate(async () =>
  // O contraste sobre o céu em WebGL o axe não mede (o fundo é um canvas): o
  // snap mede nos pixels reais.
  window.axe.run(document, { rules: { "color-contrast": { enabled: false } }, resultTypes: ["violations"] }),
);
for (const v of result.violations) {
  console.log(`${v.impact}  ${v.id}: ${v.help} (${v.nodes.length})`);
  for (const node of v.nodes.slice(0, 4)) console.log(`    ${node.target.join(" ")}  ${node.failureSummary?.split("\n")[1] ?? ""}`);
}
console.log(`${width}x${height}${reduced ? " reduced" : ""}${pitch ? " pitch" : ""}: ${result.violations.length} regra(s) violada(s)`);
await browser.close();
