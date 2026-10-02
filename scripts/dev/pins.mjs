// Fotografa uma cena presa em várias frações do pin, numa sessão só.
// Uso: node scripts/dev/pins.mjs <prefixo> <L>x<A> <seção> 0 0.05 0.1 ...  [--reduced]  (preview em :4173)
// Gera <prefixo>-<fração>.png.
import { chromium } from "playwright";
import { GL_ARGS } from "../gl.mjs";

const args = process.argv.slice(2);
const reduced = args.includes("--reduced");
const [prefix, size, section, ...fractions] = args.filter((a) => !a.startsWith("--"));
const [width, height] = size.split("x").map(Number);

const browser = await chromium.launch({ args: GL_ARGS });
const context = await browser.newContext({
  viewport: { width, height },
  deviceScaleFactor: 1,
  hasTouch: width < 600,
  isMobile: width < 600,
  reducedMotion: reduced ? "reduce" : "no-preference",
});
const page = await context.newPage();
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://localhost:4173/?snap", { waitUntil: "load" });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 90000 });
for (const fraction of fractions) {
  await page.evaluate(
    ([id, at]) => {
      const s = window.__sections.find((x) => x.id === id);
      const [a, z] = s.pinStart !== undefined ? [s.pinStart, s.pinEnd] : [s.start, s.end];
      const y = Math.round(a + (z - a) * at);
      if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true, force: true });
      else window.scrollTo(0, y);
    },
    [section, Number(fraction)],
  );
  await page.waitForTimeout(2200);
  await page.screenshot({ path: `${prefix}-${fraction}.png` });
}
if (errors.length) console.log("erros:", errors);
await browser.close();
