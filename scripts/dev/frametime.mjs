// Mede o tempo de quadro em frações de cada seção, para achar
// o ponto que pesa. Uso: node scripts/dev/frametime.mjs <L>x<A> seção:0,0.5,1 ...  (preview em :4173)
import { chromium } from "playwright";
import { GL_ARGS } from "../gl.mjs";

const [size, ...specs] = process.argv.slice(2);
const [width, height] = size.split("x").map(Number);
const browser = await chromium.launch({ args: GL_ARGS });
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
await page.goto("http://localhost:4173/?snap", { waitUntil: "load" });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 90000 });
for (const spec of specs) {
  const [id, list] = spec.split(":");
  for (const fraction of list.split(",").map(Number)) {
    const ms = await page.evaluate(
      async ([section, at]) => {
        const s = window.__sections.find((x) => x.id === section);
        const [a, z] = s.pinStart !== undefined ? [s.pinStart, s.pinEnd] : [s.start, s.end];
        const y = Math.round(a + (z - a) * at);
        if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true, force: true });
        else window.scrollTo(0, y);
        const frame = () => new Promise((r) => requestAnimationFrame(() => r(performance.now())));
        await frame();
        await frame();
        const t0 = await frame();
        for (let i = 0; i < 3; i++) await frame();
        return (performance.now() - t0) / 3;
      },
      [id, fraction],
    );
    console.log(`${id} ${fraction}: ${Math.round(ms)} ms/quadro`);
  }
}
await browser.close();
