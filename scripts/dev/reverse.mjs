// Rolar para cima desfaz a animação exatamente (CLAUDE.md, "Cena do produto"). Visita pontos do
// pin da cena do produto em três ordens (subindo, descendo e embaralhada), espera tudo assentar
// (a câmera tem um `damp` curto) e compara o estado de cada ponto entre as passagens: `sceneState`,
// posição, rotação, visibilidade e opacidade de cada peça, a matriz da câmera e a opacidade do
// texto de cada beat. Tudo tem de bater, venha o scroll de onde vier.
//   node scripts/dev/reverse.mjs [--url=http://localhost:4173] [--size=1440x900] [--tol=0.001]
// Sobe o `vite preview` sozinho se `--url` não for dado (use o build: `npm run build` antes).
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import path from "node:path";
import { GL_ARGS } from "../gl.mjs";

const args = process.argv.slice(2);
const opt = (name, fallback) => args.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;
const [width, height] = opt("size", "1440x900").split("x").map(Number);
const tol = Number(opt("tol", 0.001));
const verbose = args.includes("--verbose");
const touch = width < 600;
// Frações do pin: o começo, o meio de cada beat e as vizinhanças das trocas de tom.
const POINTS = [0, 0.03, 0.08, 0.15, 0.22, 0.3, 0.38, 0.43, 0.485, 0.54, 0.59, 0.64, 0.695, 0.75, 0.8, 0.86, 0.92, 0.96, 1];

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
  // `tier=medio`: o tier fixo, para o monitor de FPS não refazer o composer no meio do teste.
  await page.goto(`${base}/?snap&dpr=1&tier=medio`, { waitUntil: "load" });
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });

  const passes = await page.evaluate(
    async ([points]) => {
      const s = window.__sections.find((x) => x.id === "produto");
      const [a, z] = [s.pinStart, s.pinEnd];
      const go = (y) => window.__lenis.scrollTo(y, { immediate: true, force: true });
      const raf = () => new Promise((r) => requestAnimationFrame(r));

      /** Tudo o que o scroll decide, achatado em { chave: número }. */
      const read = () => {
        const out = {};
        const flat = (o, prefix) => {
          for (const [k, v] of Object.entries(o)) {
            // `pointer` vem do mouse; `_gsap` é a contabilidade do GSAP (e ela se referencia).
            if ((prefix === "state." && k === "pointer") || k.startsWith("_")) continue;
            if (typeof v === "number") out[prefix + k] = v;
            else if (typeof v === "boolean") out[prefix + k] = +v;
            else if (v && typeof v === "object" && !Array.isArray(v)) flat(v, `${prefix}${k}.`);
          }
        };
        flat(window.__scene, "state.");
        const model = window.__model;
        const node = (name, n) => {
          for (const axis of ["x", "y", "z", "w"]) out[`${name}.q${axis}`] = n.quaternion[axis];
          for (const axis of ["x", "y", "z"]) out[`${name}.p${axis}`] = n.position[axis];
          out[`${name}.vis`] = n.visible ? 1 : 0;
        };
        node("root", model.root);
        node("panel", model.panel.node);
        for (const [name, ref] of Object.entries(model.parts)) {
          node(name, ref.node);
          ref.mats.forEach((m, i) => (out[`${name}.op${i}`] = m.material.opacity));
        }
        const cam = window.__three.camera;
        cam.updateMatrixWorld();
        cam.matrixWorld.elements.forEach((v, i) => (out[`camera.w${i}`] = v));
        cam.projectionMatrix.elements.forEach((v, i) => (out[`camera.p${i}`] = v));
        document.querySelectorAll("[data-beat]").forEach((el, i) => (out[`beat${i}.opacity`] = +getComputedStyle(el).opacity));
        document.querySelectorAll(".beat-word").forEach((el, i) => (out[`word${i}.opacity`] = +getComputedStyle(el).opacity));
        return out;
      };

      /** Rola até a fração e espera o estado parar de mudar (a câmera amortece). */
      const visit = async (fraction) => {
        go(a + (z - a) * fraction);
        let prev = null;
        let still = 0;
        const t0 = performance.now();
        while (performance.now() - t0 < 5000) {
          await raf();
          const cur = read();
          if (prev) {
            let d = 0;
            for (const k in cur) d = Math.max(d, Math.abs(cur[k] - prev[k]));
            still = d < 1e-6 ? still + 1 : 0;
          }
          prev = cur;
          if (still >= 4) break;
        }
        return prev;
      };

      const order = {
        subindo: points.map((_, i) => i),
        descendo: points.map((_, i) => points.length - 1 - i),
        // Permutação fixa (passo 7 é coprimo de 19): pula entre pontos distantes, sem acaso.
        pulando: points.map((_, i) => (i * 7) % points.length),
      };
      const result = {};
      for (const [name, indexes] of Object.entries(order)) {
        result[name] = {};
        go(a);
        await raf();
        for (const i of indexes) result[name][points[i]] = await visit(points[i]);
      }
      return result;
    },
    [POINTS],
  );

  let worstAll = 0;
  for (const other of ["descendo", "pulando"]) {
    let worst = { d: 0, key: "", p: 0 };
    let over = 0;
    const rows = [];
    for (const p of POINTS) {
      const ref = passes.subindo[p];
      const cur = passes[other][p];
      for (const key of Object.keys(ref)) {
        const d = Math.abs(ref[key] - cur[key]);
        if (d > tol) {
          over++;
          rows.push({ d, key, p, a: ref[key], b: cur[key] });
        }
        if (d > worst.d) worst = { d, key, p };
      }
    }
    // Os maiores desvios, para achar o trilho que depende do caminho.
    for (const row of rows.sort((x, y) => y.d - x.d).slice(0, verbose ? 40 : 6)) {
      console.log(`  ${other}: ${row.key} em ${row.p}: subindo ${+row.a.toFixed(4)} · ${other} ${+row.b.toFixed(4)}`);
    }
    worstAll = Math.max(worstAll, worst.d);
    const where = worst.d > 0 ? ` (pior: ${worst.key} em ${worst.p}: ${worst.d.toExponential(2)})` : "";
    console.log(`${other.padEnd(9)} vs subindo: ${over === 0 ? "igual" : `${over} valores fora`}, maior diferença ${worst.d.toExponential(2)}${where}`);
  }
  const keys = Object.keys(passes.subindo[0]).length;
  const ok = worstAll <= tol;
  console.log(`${POINTS.length} pontos × ${keys} valores · ${width}×${height} · tolerância ${tol}`);
  console.log(ok ? "ok: rolar para cima desfaz a animação" : "FORA: o estado depende do caminho do scroll");
  if (errors.length) console.log("erros:", [...new Set(errors)].slice(0, 4));
  code = ok && !errors.length ? 0 : 1;
} finally {
  await browser.close();
  preview?.kill();
}
process.exitCode = code;
