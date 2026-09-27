// Verificação visual obrigatória (seção 12 do brief). Faz o build, sobe o
// preview, abre cada ato em dois viewports e duas passadas (normal e
// reduced-motion), e salva screenshots em `.snapshots/`. Falha se o console
// registrar qualquer erro.
//
// Uso: node scripts/snap.mjs [nome-da-fase]
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VITE_BIN = path.resolve(__dirname, "../node_modules/vite/bin/vite.js");

const PHASE = process.argv[2] ?? "fase-1";
const PORT = 4173;
const BASE_URL = `http://localhost:${PORT}/?snap`;
const OUT_DIR = path.resolve("./.snapshots", PHASE);

const VIEWPORTS = [
  { name: "1440x900", width: 1440, height: 900, hasTouch: false },
  { name: "390x844", width: 390, height: 844, hasTouch: true },
];

const POINTS = [
  { name: "start", pick: (b) => b.start },
  { name: "mid", pick: (b) => (b.start + b.end) / 2 },
  { name: "end", pick: (b) => b.end },
];

function runPreview() {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [VITE_BIN, "preview", "--port", String(PORT), "--strictPort"],
      { stdio: "pipe" },
    );
    let resolved = false;
    child.stdout.on("data", (chunk) => {
      if (!resolved && chunk.toString().includes("http://localhost")) {
        resolved = true;
        resolve(child);
      }
    });
    child.stderr.on("data", (chunk) => process.stderr.write(chunk));
    child.on("exit", (code) => {
      if (!resolved) reject(new Error(`vite preview saiu com código ${code}`));
    });
  });
}

async function snapPass(browser, { reducedMotion }) {
  let failed = false;

  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      hasTouch: viewport.hasTouch,
      reducedMotion: reducedMotion ? "reduce" : "no-preference",
    });
    const page = await context.newPage();

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        failed = true;
        console.error(`[console.error][${viewport.name}] ${msg.text()}`);
      }
    });
    page.on("pageerror", (err) => {
      failed = true;
      console.error(`[pageerror][${viewport.name}] ${err.message}`);
    });

    await page.goto(BASE_URL, { waitUntil: "load" });
    await page.waitForFunction(() => window.__ready === true, { timeout: 15000 });

    const acts = await page.evaluate(() => window.__acts ?? {});
    const subDir = reducedMotion ? path.join(OUT_DIR, "reduced") : OUT_DIR;
    await mkdir(subDir, { recursive: true });

    for (const [actId, bounds] of Object.entries(acts)) {
      for (const point of POINTS) {
        const y = point.pick(bounds);
        await page.evaluate((targetY) => {
          const lenis = window.__lenis;
          if (lenis) {
            lenis.scrollTo(targetY, { immediate: true });
          } else {
            window.scrollTo(0, targetY);
          }
        }, y);
        await page.waitForTimeout(900);
        const file = path.join(subDir, `${viewport.name}-ato${actId}-${point.name}.png`);
        await page.screenshot({ path: file });
      }
    }

    await context.close();
  }

  return failed;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const preview = await runPreview();
  const browser = await chromium.launch({
    headless: true,
    args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
  });

  let failed = false;
  try {
    failed = (await snapPass(browser, { reducedMotion: false })) || failed;
    failed = (await snapPass(browser, { reducedMotion: true })) || failed;
  } finally {
    await browser.close();
    preview.kill();
  }

  if (failed) {
    console.error("\nsnap: erros de console encontrados — veja acima.");
    process.exit(1);
  }
  console.log(`\nsnap: screenshots salvos em ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
