// Tempo de quadro numa varredura de scroll (critério 4 do CLAUDE.md, reescrito em 06/10/2026):
// p95 ≤ 18 ms e p99 ≤ 25 ms. O `rAF` trava em 60 Hz, então "p95 ≤ 16,7 ms" não discrimina nada;
// aqui o que conta é não perder quadros. Rola o pin inteiro da cena do produto, um passo por
// quadro, e mede o intervalo entre quadros.
//   node scripts/dev/sweep.mjs [--url=http://localhost:4173] [--size=1440x900] [--speed=25] [--dpr=1]
//        [--section=produto] [--json=saida.json] [--css="..."]
// `--css` injeta CSS na página (para isolar o custo de uma regra: `--css=".beat__body::before{content:none!important}"`).
// `--speed` em px por quadro (25 ≈ 1500 px/s, um scroll rápido de trackpad); `--dpr=2` fixa a
// densidade do canvas (o `snap` e este script usam DPR 1 por padrão: celular real roda em 2 a 3).
// Sobe o `vite preview` sozinho se `--url` não for dado (use o build: `npm run build` antes).
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { GL_ARGS } from "../gl.mjs";

const args = process.argv.slice(2);
const opt = (name, fallback) => args.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;
const [width, height] = opt("size", "1440x900").split("x").map(Number);
const speed = Number(opt("speed", 25));
const dpr = Number(opt("dpr", 1));
const section = opt("section", "produto");
const touch = width < 600;
const LIMITS = { p95: 18, p99: 25 };

let preview = null;
let base = opt("url", "");
if (!base) {
  const root = process.cwd();
  const vite = path.join(root, "node_modules/vite/bin/vite.js");
  preview = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [vite, "preview", "--port", "4173", "--strictPort"], { cwd: root, stdio: "pipe" });
    let ready = false;
    child.stdout.on("data", (chunk) => {
      if (!ready && chunk.toString().includes("http://localhost")) {
        ready = true;
        resolve(child);
      }
    });
    child.on("exit", (code) => !ready && reject(new Error(`vite preview saiu com código ${code}`)));
  });
  base = "http://localhost:4173";
}

const browser = await chromium.launch({ headless: true, args: GL_ARGS });
let code = 0;
try {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, hasTouch: touch, isMobile: touch });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`${base}/?snap&dpr=${dpr}`, { waitUntil: "load" });
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });
  if (opt("css", "")) await page.addStyleTag({ content: opt("css", "") });
  const gpu = await page.evaluate(() => {
    const gl = document.createElement("canvas").getContext("webgl2");
    const info = gl?.getExtension("WEBGL_debug_renderer_info");
    return info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : "desconhecida";
  });

  const { deltas, span, slow } = await page.evaluate(
    async ([id, step]) => {
      const s = window.__sections.find((x) => x.id === id);
      const [a, z] = s.pinStart !== undefined ? [s.pinStart, s.pinEnd] : [s.start, s.end];
      const go = (y) => (window.__lenis ? window.__lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y));
      go(a);
      await new Promise((r) => setTimeout(r, 1500));
      const out = [];
      const slow = [];
      let last = await new Promise((r) => requestAnimationFrame(r));
      for (let y = a; y < z; y += step) {
        go(y);
        const t = await new Promise((r) => requestAnimationFrame(r));
        out.push(t - last);
        if (t - last > 25) slow.push([Math.round(((y - a) / (z - a)) * 1000) / 1000, Math.round(t - last)]);
        last = t;
      }
      return { deltas: out, span: Math.round(z - a), slow };
    },
    [section, speed],
  );
  const sorted = [...deltas].sort((x, y) => x - y);
  const q = (p) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];
  const result = {
    viewport: `${width}×${height}`,
    dpr,
    gpu,
    frames: deltas.length,
    scrollPx: span,
    p50: +q(0.5).toFixed(1),
    p95: +q(0.95).toFixed(1),
    p99: +q(0.99).toFixed(1),
    max: +sorted.at(-1).toFixed(1),
    over18: deltas.filter((d) => d > 18).length,
  };
  const ok = result.p95 <= LIMITS.p95 && result.p99 <= LIMITS.p99;
  console.log(`${result.viewport} DPR ${dpr} · ${gpu}`);
  console.log(`${section}: ${result.scrollPx}px em ${result.frames} quadros (${speed}px/quadro)  p50 ${result.p50}  p95 ${result.p95}  p99 ${result.p99}  máx ${result.max} ms  >18ms: ${result.over18}`);
  if (slow.length) console.log(`quadros acima de 25 ms (p do pin, ms): ${slow.map(([p, d]) => `${p} → ${d}`).join(" | ")}`);
  console.log(ok ? `ok: p95 ≤ ${LIMITS.p95} ms e p99 ≤ ${LIMITS.p99} ms` : `FORA: o critério é p95 ≤ ${LIMITS.p95} ms e p99 ≤ ${LIMITS.p99} ms`);
  if (errors.length) console.log("erros:", [...new Set(errors)].slice(0, 4));
  const json = opt("json", "");
  if (json) await writeFile(json, JSON.stringify(result, null, 2));
  code = ok ? 0 : 1;
} finally {
  await browser.close();
  preview?.kill();
}
process.exitCode = code;
