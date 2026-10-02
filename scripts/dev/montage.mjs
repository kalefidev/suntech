// Junta vários PNGs numa grade (para ver uma sequência numa imagem só).
// Uso: node scripts/dev/montage.mjs <saida.png> <colunas> <largura-de-cada> a.png b.png ...
import { chromium } from "playwright";
import { readFile } from "node:fs/promises";
const [output, cols, cellW, ...files] = process.argv.slice(2);
const c = Number(cols), w = Number(cellW);
const imgs = await Promise.all(files.map(async (f) => `data:image/png;base64,${(await readFile(f)).toString("base64")}`));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: c * w, height: 400 } });
await page.setContent(`<body style="margin:0;display:grid;grid-template-columns:repeat(${c},${w}px);background:#000">${imgs.map((s, i) => `<div style="position:relative"><img src="${s}" style="width:${w}px;display:block"><b style="position:absolute;left:6px;top:4px;color:#fff;font:700 14px sans-serif;text-shadow:0 0 3px #000">${i}</b></div>`).join("")}</body>`);
await page.waitForLoadState("load");
const h = await page.evaluate(() => document.body.scrollHeight);
await page.setViewportSize({ width: c * w, height: h });
await page.screenshot({ path: output, fullPage: true });
await browser.close();
