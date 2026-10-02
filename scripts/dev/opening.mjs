// Fotografa a abertura quadro a quadro, em câmera lenta (`?slowmo=60`): o
// `snap` só vê o fim dela, e o SwiftShader leva segundos por quadro.
// Uso: node scripts/dev/opening.mjs <pasta> [1440x900|390x844]   (com o preview no ar em :4173)
import { chromium } from "playwright";
import { GL_ARGS } from "../gl.mjs";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const [dir = ".snapshots/opening", size = "1440x900"] = process.argv.slice(2);
const [width, height] = size.split("x").map(Number);
await mkdir(dir, { recursive: true });
const browser = await chromium.launch({ args: GL_ARGS });
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1, hasTouch: width < 600, isMobile: width < 600 });
await page.goto("http://localhost:4173/?snap&slowmo=60", { waitUntil: "load" });
await page.waitForFunction(() => document.documentElement.dataset.scene === "on", null, { timeout: 60000 });
const start = Date.now();
for (let i = 0; i < 20; i++) {
  await page.screenshot({ path: path.join(dir, `${size}-opening-${String(i).padStart(2, "0")}.png`) });
  const ready = await page.evaluate(() => window.__ready === true);
  console.log(`quadro ${i} em ${Date.now() - start} ms${ready ? " (pronto)" : ""}`);
  if (ready) break;
  await page.waitForTimeout(500);
}
await browser.close();
