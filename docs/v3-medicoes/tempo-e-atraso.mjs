// Evidência da Fase 0 da v3 (docs/v3-fase-0.md, §1 e risco 2). Descartável: as duas
// medições viram `scripts/dev/sweep.mjs` na Fase 1. Mede a v2 já buildada (`dist/`).
//
//   1) tempo de quadro (p50, p95, p99) numa varredura de scroll, um passo por quadro;
//   2) atraso entre o scroll e a cena: um golpe de roda de 600 px no pin de "Por dentro",
//      e quando o Lenis (scrollY) e a câmera real chegam perto do fim.
//
// Uso (na raiz, com o build feito):
//   node docs/v3-medicoes/tempo-e-atraso.mjs            # as duas
//   node docs/v3-medicoes/tempo-e-atraso.mjs quadro     # só o tempo de quadro
//   node docs/v3-medicoes/tempo-e-atraso.mjs atraso     # só o atraso
// Sobe o `vite preview` na porta 4173 e o derruba no fim (no Windows, sem `pkill`).
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import path from "node:path";

const ROOT = process.cwd();
const PORT = 4173;
const WHICH = process.argv[2];
// No Windows, a GPU da máquina (como scripts/gl.mjs); em outro sistema, SwiftShader.
const GL_ARGS = process.platform === "win32" ? ["--use-angle=d3d11", "--ignore-gpu-blocklist"] : ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"];
// Varreduras: seção, de, até (frações do pin) e quadros.
const SWEEPS = [
  ["hero", 0, 1, 90],
  ["por-dentro", 0.2, 0.9, 150],
  ["como-funciona", 0.1, 0.7, 150],
  ["energia-fica", 0.2, 0.9, 150],
];

function startPreview() {
  return new Promise((resolve, reject) => {
    const vite = path.join(ROOT, "node_modules/vite/bin/vite.js");
    const child = spawn(process.execPath, [vite, "preview", "--port", String(PORT), "--strictPort"], { cwd: ROOT, stdio: "pipe" });
    let ready = false;
    child.stdout.on("data", (chunk) => {
      if (!ready && chunk.toString().includes("http://localhost")) {
        ready = true;
        resolve(child);
      }
    });
    child.stderr.on("data", (chunk) => process.stderr.write(chunk));
    child.on("exit", (code) => !ready && reject(new Error(`vite preview saiu com código ${code}`)));
  });
}

async function frameTimes(page) {
  for (const [id, from, to, frames] of SWEEPS) {
    const { deltas, span } = await page.evaluate(
      async ([section, a, z, n]) => {
        const s = window.__sections.find((x) => x.id === section);
        const [p0, p1] = s.pinStart !== undefined ? [s.pinStart, s.pinEnd] : [s.start, s.end];
        const y0 = p0 + (p1 - p0) * a;
        const y1 = p0 + (p1 - p0) * z;
        const go = (y) => (window.__lenis ? window.__lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y));
        go(y0);
        await new Promise((r) => setTimeout(r, 1200));
        const out = [];
        let last = await new Promise((r) => requestAnimationFrame(r));
        for (let i = 0; i < n; i++) {
          go(y0 + ((y1 - y0) * (i + 1)) / n);
          const t = await new Promise((r) => requestAnimationFrame(r));
          out.push(t - last);
          last = t;
        }
        return { deltas: out, span: Math.round(y1 - y0) };
      },
      [id, from, to, frames],
    );
    const sorted = [...deltas].sort((a, b) => a - b);
    const q = (p) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))].toFixed(1);
    console.log(`${id.padEnd(14)} ${from}–${to}  ${span}px em ${frames} quadros  p50 ${q(0.5)}  p95 ${q(0.95)}  p99 ${q(0.99)}  máx ${sorted.at(-1).toFixed(1)} ms`);
  }
}

async function scrollLag(page) {
  await page.evaluate(() => {
    const s = window.__sections.find((x) => x.id === "por-dentro");
    window.__lenis.scrollTo(s.pinStart + (s.pinEnd - s.pinStart) * 0.3, { immediate: true, force: true });
  });
  await page.waitForTimeout(2500);
  const samples = await page.evaluate(async () => {
    const camera = window.__three.camera;
    const out = [];
    const t0 = performance.now();
    const y0 = window.scrollY;
    window.dispatchEvent(new WheelEvent("wheel", { deltaY: 600, bubbles: true, cancelable: true }));
    for (let i = 0; i < 180; i++) {
      await new Promise((r) => requestAnimationFrame(r));
      out.push({ t: performance.now() - t0, y: window.scrollY - y0, cam: [camera.position.x, camera.position.y, camera.position.z] });
    }
    return out;
  });
  const end = samples.at(-1);
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const travel = dist(samples[0].cam, end.cam);
  const settled = (i) => samples.slice(i).every((q) => dist(q.cam, end.cam) <= 0.05 * travel);
  const lenis = samples.find((s) => s.y >= 0.95 * end.y)?.t;
  const camera = samples.find((_, i) => settled(i))?.t;
  console.log(`golpe de 600 px: o Lenis chega a 95% em ${lenis?.toFixed(0)} ms; a câmera chega a 5% do fim do caminho em ${camera?.toFixed(0)} ms`);
}

const preview = await startPreview();
const browser = await chromium.launch({ headless: true, args: GL_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await page.goto(`http://localhost:${PORT}/?snap`, { waitUntil: "load" });
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });
  const gpu = await page.evaluate(() => {
    const gl = document.createElement("canvas").getContext("webgl2");
    const info = gl?.getExtension("WEBGL_debug_renderer_info");
    return info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : "desconhecida";
  });
  console.log(`1440×900, DPR 1, GPU: ${gpu}`);
  if (WHICH !== "atraso") await frameTimes(page);
  if (WHICH !== "quadro") {
    await page.mouse.move(700, 450);
    await scrollLag(page);
  }
} finally {
  await browser.close();
  preview.kill();
}
