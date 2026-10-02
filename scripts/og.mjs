// Imagem do Open Graph (seção 12 do brief): fotografa o hero em 1200×630 (o
// tamanho das prévias de link), sem o header, depois da abertura, e grava em
// public/og.png. Usa o build em dist/ (rode `npm run build` antes) e sobe o
// próprio preview. Uso: npm run og
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { GL_ARGS } from "./gl.mjs";

const PORT = 4177;

function startPreview() {
  return new Promise((resolve, reject) => {
    const vite = path.resolve("node_modules/vite/bin/vite.js");
    const child = spawn(process.execPath, [vite, "preview", "--port", String(PORT), "--strictPort"], { stdio: "pipe" });
    let ready = false;
    child.stdout.on("data", (chunk) => {
      if (!ready && chunk.toString().includes("http://localhost")) {
        ready = true;
        resolve(child);
      }
    });
    child.on("exit", (code) => {
      if (!ready) reject(new Error(`vite preview saiu com código ${code}`));
    });
  });
}

const preview = await startPreview();
const browser = await chromium.launch({ args: GL_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.goto(`http://localhost:${PORT}/?snap`, { waitUntil: "load" });
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 90000 });
  await page.addStyleTag({ content: ".site-header, .loader-line, .cursor { display: none !important; }" });
  // A cena assenta (damping) antes da foto.
  await page.waitForTimeout(2500);
  const output = path.resolve("public/og.png");
  await page.screenshot({ path: output });
  console.log(`og: ${output}`);
} finally {
  await browser.close();
  preview.kill();
}
