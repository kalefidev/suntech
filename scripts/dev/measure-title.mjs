// Mede a palavra mais longa de cada título de capítulo contra a coluna dele.
// Uso: node scripts/dev/measure-title.mjs <L>x<A>  (preview em :4173)
import { chromium } from "playwright";
import { GL_ARGS } from "../gl.mjs";

const [width, height] = (process.argv[2] ?? "1440x900").split("x").map(Number);
const browser = await chromium.launch({ args: GL_ARGS });
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
await page.goto("http://localhost:4173/?snap", { waitUntil: "load" });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 90000 });
const rows = await page.evaluate(() =>
  [...document.querySelectorAll(".chapter__title")].map((title) => {
    const text = title.getAttribute("aria-label") ?? title.textContent ?? "";
    const words = (title.textContent ?? "").split(/\s+/).filter(Boolean);
    const probe = document.createElement("span");
    probe.style.whiteSpace = "nowrap";
    title.append(probe);
    let longest = { word: "", px: 0 };
    for (const word of words) {
      probe.textContent = word;
      const px = probe.getBoundingClientRect().width;
      if (px > longest.px) longest = { word, px: Math.round(px) };
    }
    probe.remove();
    const box = title.parentElement.getBoundingClientRect();
    return `${text}: coluna ${Math.round(box.width)} px, "${longest.word}" ${longest.px} px, fonte ${getComputedStyle(title).fontSize}`;
  }),
);
console.log(rows.join("\n"));
await browser.close();
