// Fotografa a cena com campos do sceneState forçados (depois de pronto).
// Uso: node scripts/dev/probe.mjs <saida.png> <largura>x<altura> campo=valor ...  (preview em :4173)
import { chromium } from "playwright";

const [output, size = "960x600", ...pairs] = process.argv.slice(2);
const [width, height] = size.split("x").map(Number);
const values = Object.fromEntries(pairs.map((p) => p.split("=")).map(([k, v]) => [k, Number(v)]));
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1, hasTouch: width < 600, isMobile: width < 600 });
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
await page.goto("http://localhost:4173/?snap", { waitUntil: "load" });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 90000 });
await page.evaluate((v) => {
  for (const [path, value] of Object.entries(v)) {
    const keys = path.split(".");
    let target = window.__scene;
    while (keys.length > 1) target = target[keys.shift()];
    target[keys[0]] = value;
  }
}, values);
await page.waitForTimeout(1500);
await page.screenshot({ path: output });
if (errors.length) console.log("erros:", errors);
await browser.close();
