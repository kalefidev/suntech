// Mede o LCP numa carga nova: o elemento, o tempo, quando a fonte chegou e as
// tarefas longas da thread principal. Uso: node scripts/dev/lcp.mjs [L]x[A] [--cpu=4]  (preview em :4173)
import { chromium } from "playwright";
import { GL_ARGS } from "../gl.mjs";

const args = process.argv.slice(2);
const [width, height] = (args.find((a) => /^\d+x\d+$/.test(a)) ?? "1440x900").split("x").map(Number);
const cpu = Number(args.find((a) => a.startsWith("--cpu="))?.slice(6) ?? 1);
const browser = await chromium.launch({ args: GL_ARGS });
const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
await context.addInitScript(() => {
  window.__lcp = [];
  window.__long = [];
  new PerformanceObserver((list) => {
    for (const e of list.getEntries())
      window.__lcp.push({ t: Math.round(e.startTime), el: e.element ? `${e.element.tagName}.${e.element.className}` : "?", size: e.size });
  }).observe({ type: "largest-contentful-paint", buffered: true });
  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) window.__long.push([Math.round(e.startTime), Math.round(e.duration)]);
  }).observe({ type: "longtask", buffered: true });
});
const page = await context.newPage();
if (cpu > 1) {
  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpu });
}
await page.goto("http://localhost:4173/", { waitUntil: "load" });
await page.waitForTimeout(6000);
const report = await page.evaluate(() => ({
  lcp: window.__lcp,
  long: window.__long,
  font: performance
    .getEntriesByType("resource")
    .filter((r) => r.name.includes(".woff2"))
    .map((r) => ({ start: Math.round(r.startTime), end: Math.round(r.responseEnd) })),
  fontsReady: document.fonts.status,
  fcp: Math.round(performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? -1),
}));
console.log(JSON.stringify(report, null, 1));
await browser.close();
