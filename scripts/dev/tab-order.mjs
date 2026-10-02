// Percorre a página com Tab e confere o foco visível de cada parada.
// Uso: node scripts/dev/tab-order.mjs [N]  (preview em :4173)
import { chromium } from "playwright";
import { GL_ARGS } from "../gl.mjs";

const steps = Number(process.argv[2] ?? 60);
const browser = await chromium.launch({ args: GL_ARGS });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:4173/?snap", { waitUntil: "load" });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 90000 });
const seen = [];
let invisible = 0;
for (let i = 0; i < steps; i++) {
  await page.keyboard.press("Tab");
  const info = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return null;
    const style = getComputedStyle(el);
    const visible = (style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0) || style.boxShadow !== "none";
    const label = (el.getAttribute("aria-label") ?? el.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 40);
    return { tag: el.tagName.toLowerCase(), label, visible };
  });
  if (!info) break;
  if (!info.visible) invisible++;
  seen.push(`${info.visible ? "  " : "!!"} ${info.tag} ${info.label}`);
}
console.log(seen.join("\n"));
console.log(`\n${seen.length} paradas de foco, ${invisible} sem contorno visível`);
await browser.close();
