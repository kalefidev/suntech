// Recorta e amplia uma região de um PNG (para inspecionar detalhes do 3D).
// Uso: node scripts/dev/crop.mjs <entrada.png> <saida.png> x y w h [escala]
import { chromium } from "playwright";
import { readFile } from "node:fs/promises";

const [input, output, x, y, w, h, scale = "2"] = process.argv.slice(2);
const s = Number(scale);
const b64 = (await readFile(input)).toString("base64");
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(w) * s, height: Number(h) * s } });
await page.setContent(
  `<body style="margin:0;overflow:hidden"><img src="data:image/png;base64,${b64}" style="transform-origin:0 0;transform:translate(${-Number(x) * s}px,${-Number(y) * s}px) scale(${s});image-rendering:pixelated"></body>`,
);
await page.waitForLoadState("load");
await page.screenshot({ path: output });
await browser.close();
