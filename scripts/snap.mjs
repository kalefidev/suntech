// Verificação visual obrigatória (seção 12 do brief).
//
// Faz o build, mede o JS (gzip) contra o orçamento da seção 11, sobe o preview
// e fotografa cada seção de `window.__sections` no início, no meio e no fim
// (nas cenas presas, 0%, 50% e 100% do pin). Passadas: 1440×900 e 390×844
// (toque), normal e com reduced motion, mais 1920×1080 (a TV do estande) e
// `?nowebgl` (fallback). Em cada ponto, mede o contraste nos pixels reais: tira
// uma segunda foto com o texto transparente e compara a cor de cada texto com
// o fundo logo atrás dele (10º percentil, WCAG AA).
//
// Falha com: erro no console, contraste abaixo de AA ou WebGL ausente.
//
// Uso: npm run snap [fase] [-- --quick] [-- --no-build]
//   --quick     só 1440×900 e 390×844 na passada normal
//   --no-build  usa o dist/ que já existe
//   --only=390x844  só as passadas desse viewport
//   --sections=hero,jovem  só essas seções (para conferir uma correção)
//   --url=http://localhost:5180  fotografa um servidor já no ar (sem build,
//                 sem preview e sem medir o JS)
import { chromium } from "playwright";
import { GL_ARGS } from "./gl.mjs";
import { spawn } from "node:child_process";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import path from "node:path";
import process from "node:process";

const args = process.argv.slice(2);
const PHASE = args.find((a) => !a.startsWith("--")) ?? "fase-1";
const QUICK = args.includes("--quick");
const BUILD = !args.includes("--no-build");
const ONLY = args.find((a) => a.startsWith("--only="))?.slice(7);
const SECTIONS = args.find((a) => a.startsWith("--sections="))?.slice(11).split(",");
const URL_ARG = args.find((a) => a.startsWith("--url="))?.slice(6);
const PORT = 4173;
const BASE = URL_ARG ?? `http://localhost:${PORT}`;
const ROOT = path.resolve(".");
const OUT_DIR = path.join(ROOT, ".snapshots", PHASE);
const WAIT_MS = 1500;
const BUDGET = { initial: 150, total: 500 };

const PASSES = [
  { name: "1440x900", viewport: { width: 1440, height: 900 }, touch: false },
  { name: "390x844", viewport: { width: 390, height: 844 }, touch: true },
  { name: "1440x900", viewport: { width: 1440, height: 900 }, touch: false, reduced: true },
  { name: "390x844", viewport: { width: 390, height: 844 }, touch: true, reduced: true },
  { name: "1920x1080", viewport: { width: 1920, height: 1080 }, touch: false, dir: "tv" },
  { name: "1440x900", viewport: { width: 1440, height: 900 }, touch: false, nowebgl: true },
]
  .filter((p) => !QUICK || (!p.reduced && !p.dir && !p.nowebgl))
  .filter((p) => !ONLY || p.name === ONLY);

function run(command, commandArgs) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, { stdio: "inherit", shell: true });
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${command} saiu com código ${code}`))));
  });
}

function startPreview() {
  return new Promise((resolve, reject) => {
    const vite = path.join(ROOT, "node_modules/vite/bin/vite.js");
    const child = spawn(process.execPath, [vite, "preview", "--port", String(PORT), "--strictPort"], { stdio: "pipe" });
    let ready = false;
    child.stdout.on("data", (chunk) => {
      if (!ready && chunk.toString().includes("http://localhost")) {
        ready = true;
        resolve(child);
      }
    });
    child.stderr.on("data", (chunk) => process.stderr.write(chunk));
    child.on("exit", (code) => {
      if (!ready) reject(new Error(`vite preview saiu com código ${code}`));
    });
  });
}

// ------------------------------------------------------------- orçamento de JS

/** Gzip de cada chunk a partir do manifest do Vite. Debug (`leva`, `r3f-perf`) fica de fora do total. */
async function measureBundle() {
  const dist = path.join(ROOT, "dist");
  const manifest = JSON.parse(await readFile(path.join(dist, ".vite/manifest.json"), "utf8"));
  const gz = new Map();
  const sizeOf = async (file) => {
    if (!gz.has(file)) gz.set(file, gzipSync(await readFile(path.join(dist, file))).length / 1024);
    return gz.get(file);
  };
  const isDebug = (key) => /node_modules\/(leva|r3f-perf)\//.test(key);
  const entryKey = Object.keys(manifest).find((k) => manifest[k].isEntry);

  const initial = new Set();
  const walkStatic = (key) => {
    if (initial.has(key)) return;
    initial.add(key);
    for (const dep of manifest[key].imports ?? []) walkStatic(dep);
  };
  walkStatic(entryKey);

  const all = new Set();
  const walkAll = (key) => {
    if (all.has(key) || isDebug(key)) return;
    all.add(key);
    for (const dep of [...(manifest[key].imports ?? []), ...(manifest[key].dynamicImports ?? [])]) walkAll(dep);
  };
  walkAll(entryKey);

  const sum = async (keys) => {
    let total = 0;
    for (const key of keys) if (manifest[key].file.endsWith(".js")) total += await sizeOf(manifest[key].file);
    return total;
  };
  const rows = [];
  for (const key of all) {
    const { file } = manifest[key];
    if (file.endsWith(".js")) rows.push({ chunk: key.replace(/^.*node_modules\//, ""), file, kb: await sizeOf(file) });
  }
  rows.sort((a, b) => b.kb - a.kb);
  const css = (await readdir(path.join(dist, "assets"))).filter((f) => f.endsWith(".css"));
  let cssKb = 0;
  for (const f of css) cssKb += await sizeOf(path.join("assets", f));
  return { initialKb: await sum(initial), totalKb: await sum(all), cssKb, rows };
}

// ---------------------------------------------------------------- contraste

/** Roda no navegador: caixas de texto visíveis, com cor, tamanho e fundo opaco (se houver). */
function collectTextBoxes() {
  const probe = new OffscreenCanvas(1, 1).getContext("2d", { willReadFrequently: true });
  const toRgba = (css) => {
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = "#000";
    probe.fillStyle = css;
    probe.fillRect(0, 0, 1, 1);
    const d = probe.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2], d[3] / 255];
  };
  const vw = innerWidth;
  const vh = innerHeight;
  const opaqueBg = (el) => {
    for (let a = el; a && a !== document.body; a = a.parentElement) {
      const c = toRgba(getComputedStyle(a).backgroundColor);
      if (c[3] >= 0.95) return c.slice(0, 3);
    }
    return null;
  };
  const opacity = (el) => {
    let o = 1;
    for (let a = el; a; a = a.parentElement) o *= parseFloat(getComputedStyle(a).opacity);
    return o;
  };
  // Área visível do texto: a tela, cortada por todo ancestral que recorta (overflow, clip-path).
  const clipOf = (el) => {
    let r = { l: 0, t: 0, r: vw, b: vh };
    for (let a = el; a && a !== document.documentElement; a = a.parentElement) {
      const s = getComputedStyle(a);
      if (s.overflowX !== "visible" || s.overflowY !== "visible" || s.clipPath !== "none") {
        const b = a.getBoundingClientRect();
        r = { l: Math.max(r.l, b.left), t: Math.max(r.t, b.top), r: Math.min(r.r, b.right), b: Math.min(r.b, b.bottom) };
      }
    }
    return r;
  };

  const boxes = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const text = n.nodeValue.replace(/\s+/g, " ").trim();
    if (!text) continue;
    const el = n.parentElement;
    if (!el || el.closest("script, style, noscript")) continue;
    if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
    if (opacity(el) < 0.98) continue; // em transição: o brief permite
    const cs = getComputedStyle(el);
    const fg = toRgba(cs.color);
    if (fg[3] < 0.5) continue;
    const size = parseFloat(cs.fontSize);
    const weight = parseFloat(cs.fontWeight);
    const clip = clipOf(el);
    const range = document.createRange();
    range.selectNodeContents(n);
    for (const r of range.getClientRects()) {
      const x0 = Math.max(clip.l, r.left);
      const y0 = Math.max(clip.t, r.top);
      const x1 = Math.min(clip.r, r.right);
      const y1 = Math.min(clip.b, r.bottom);
      if (x1 - x0 < 3 || y1 - y0 < 3) continue;
      boxes.push({
        x: x0,
        y: y0,
        w: x1 - x0,
        h: y1 - y0,
        fg: fg.slice(0, 3),
        bg: opaqueBg(el),
        large: size >= 24 || (size >= 18.66 && weight >= 700),
        text: text.slice(0, 48),
      });
    }
  }
  return boxes;
}

/** Roda no navegador: compara cada texto com os pixels do fundo (foto sem texto). */
async function measureContrast({ b64, boxes }) {
  const blob = await (await fetch(`data:image/png;base64,${b64}`)).blob();
  const bitmap = await createImageBitmap(blob);
  const ctx = new OffscreenCanvas(bitmap.width, bitmap.height).getContext("2d", { willReadFrequently: true });
  ctx.drawImage(bitmap, 0, 0);
  const lin = (c) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

  const worstByText = new Map();
  for (const box of boxes) {
    const fg = lum(...box.fg);
    let value;
    if (box.bg) {
      value = ratio(fg, lum(...box.bg));
    } else {
      const x = Math.floor(box.x);
      const y = Math.floor(box.y);
      const w = Math.max(1, Math.min(bitmap.width - x, Math.floor(box.w)));
      const h = Math.max(1, Math.min(bitmap.height - y, Math.floor(box.h)));
      const data = ctx.getImageData(x, y, w, h).data;
      const step = Math.max(1, Math.floor(Math.sqrt((w * h) / 600)));
      const values = [];
      for (let j = 0; j < h; j += step) {
        for (let i = 0; i < w; i += step) {
          const k = (j * w + i) * 4;
          values.push(ratio(fg, lum(data[k], data[k + 1], data[k + 2])));
        }
      }
      values.sort((a, b) => a - b);
      // 10º percentil: estrelas e grão (pontos isolados) não reprovam um texto inteiro.
      value = values[Math.floor(values.length * 0.1)];
    }
    const min = box.large ? 3 : 4.5;
    const previous = worstByText.get(box.text);
    if (!previous || value < previous.ratio) worstByText.set(box.text, { text: box.text, ratio: value, min });
  }
  return [...worstByText.values()]
    .filter((r) => r.ratio < r.min)
    .map((r) => ({ ...r, ratio: Math.round(r.ratio * 100) / 100 }));
}

const HIDE_TEXT = `*,*::before,*::after{color:transparent!important;text-shadow:none!important;
text-decoration-color:transparent!important;-webkit-text-stroke:0!important;transition:none!important}`;

async function contrastIssues(page) {
  const boxes = await page.evaluate(collectTextBoxes);
  await page.evaluate((css) => {
    const style = document.createElement("style");
    style.id = "__snap-hide-text";
    style.textContent = css;
    document.head.append(style);
  }, HIDE_TEXT);
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  const background = await page.screenshot();
  await page.evaluate(() => document.getElementById("__snap-hide-text")?.remove());
  return page.evaluate(measureContrast, { b64: background.toString("base64"), boxes });
}

// ------------------------------------------------------------------ passadas

function pointsOf(section, vh, maxScroll) {
  const clamp = (y) => Math.round(Math.min(Math.max(0, y), maxScroll));
  if (section.pinStart !== undefined && section.pinEnd !== undefined) {
    const span = section.pinEnd - section.pinStart;
    return [
      ["start", clamp(section.pinStart)],
      ["mid", clamp(section.pinStart + span * 0.5)],
      ["end", clamp(section.pinEnd)],
    ];
  }
  const end = Math.max(section.start, section.end - vh);
  return [
    ["start", clamp(section.start)],
    ["mid", clamp((section.start + end) / 2)],
    ["end", clamp(end)],
  ];
}

async function runPass(browser, pass, report) {
  const label = [pass.name, pass.reduced && "reduced", pass.nowebgl && "nowebgl"].filter(Boolean).join(" ");
  const dir = path.join(OUT_DIR, pass.reduced ? "reduced" : pass.nowebgl ? "nowebgl" : pass.dir ?? "");
  await mkdir(dir, { recursive: true });

  const context = await browser.newContext({
    viewport: pass.viewport,
    deviceScaleFactor: 1,
    hasTouch: pass.touch,
    isMobile: pass.touch,
    reducedMotion: pass.reduced ? "reduce" : "no-preference",
  });
  await context.addInitScript(() => {
    window.__metrics = { lcp: 0, cls: 0 };
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) window.__metrics.lcp = entry.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__metrics.cls += entry.value;
    }).observe({ type: "layout-shift", buffered: true });
  });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));

  await page.goto(`${BASE}/?snap${pass.nowebgl ? "&nowebgl" : ""}`, { waitUntil: "load" });
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
  const metrics = await page.evaluate(() => window.__metrics);
  const webgl = await page.evaluate(() => document.documentElement.dataset.scene === "on" && !!document.querySelector("canvas"));
  const sections = await page.evaluate(() => window.__sections ?? []);
  const { vh, maxScroll } = await page.evaluate(() => ({
    vh: window.innerHeight,
    maxScroll: document.documentElement.scrollHeight - window.innerHeight,
  }));

  const result = { pass: label, lcp: Math.round(metrics.lcp), cls: Math.round(metrics.cls * 1000) / 1000, webgl, errors, contrast: [] };
  if (!pass.nowebgl && !webgl) console.error(`[${label}] WebGL ausente`);

  for (const section of sections) {
    if (SECTIONS && !SECTIONS.includes(section.id)) continue;
    for (const [point, y] of pointsOf(section, vh, maxScroll)) {
      await page.evaluate((target) => {
        if (window.__lenis) window.__lenis.scrollTo(target, { immediate: true, force: true });
        else window.scrollTo(0, target);
      }, y);
      await page.waitForTimeout(WAIT_MS);
      const file = `${pass.name}-${section.id}-${point}.png`;
      await page.screenshot({ path: path.join(dir, file) });
      for (const issue of await contrastIssues(page)) result.contrast.push({ shot: file, ...issue });
    }
  }

  await context.close();
  for (const e of errors) console.error(`[${label}] console: ${e}`);
  for (const c of result.contrast) console.error(`[${label}] contraste ${c.ratio}:1 (mín. ${c.min}) em ${c.shot}: "${c.text}"`);
  console.log(`[${label}] ${sections.length} seções · LCP ${result.lcp} ms · CLS ${result.cls} · WebGL ${webgl ? "sim" : "não"}`);
  report.passes.push(result);
  return errors.length > 0 || result.contrast.length > 0 || (!pass.nowebgl && !webgl);
}

async function main() {
  if (BUILD && !URL_ARG) await run("npm", ["run", "build"]);
  await mkdir(OUT_DIR, { recursive: true });

  const bundle = URL_ARG ? null : await measureBundle();
  const report = { phase: PHASE, date: new Date().toISOString(), bundle, passes: [] };
  if (bundle) {
    console.log(`\nJS gzip: inicial ${bundle.initialKb.toFixed(1)} KB (teto ${BUDGET.initial}) · total ${bundle.totalKb.toFixed(1)} KB (teto ${BUDGET.total}) · CSS ${bundle.cssKb.toFixed(1)} KB`);
    for (const row of bundle.rows) console.log(`  ${row.kb.toFixed(1).padStart(7)} KB  ${row.chunk}`);
    const overBudget = bundle.initialKb > BUDGET.initial || bundle.totalKb > BUDGET.total;
    if (overBudget) console.warn("Aviso: orçamento de JS estourado. Explique o desvio no PROGRESS.md.");
  }

  const preview = URL_ARG ? null : await startPreview();
  const browser = await chromium.launch({ headless: true, args: GL_ARGS });
  let failed = false;
  try {
    for (const pass of PASSES) failed = (await runPass(browser, pass, report)) || failed;
  } finally {
    await browser.close();
    preview?.kill();
  }

  await writeFile(path.join(OUT_DIR, "report.json"), JSON.stringify(report, null, 2));
  if (failed) {
    console.error(`\nsnap: falhou (veja acima). Imagens e report.json em ${OUT_DIR}`);
    process.exit(1);
  }
  console.log(`\nsnap: tudo certo. Imagens e report.json em ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
