// Mede (e resolve) o enquadramento de cada beat da cena do produto: critério 1 do
// CLAUDE.md. O sujeito do beat (scene/model/motion.ts, SUBJECT) é projetado com a câmera
// real no fim do beat; o script devolve altura, largura e desvio do centro, em % da viewport.
//   node scripts/dev/framing.mjs [--url=http://localhost:4173] [--size=1440x900] [--solve [--apply]] [--beats=painel,carga]
//        [--at=0,0.25,0.5,0.75,1]
// Sem --solve: confere a câmera de hoje. Com --solve: resolve alvo, distância e deslocamento de
// lente (sx, sy) para altura-alvo 62% (celular: 50%), largura ≤ 66% (celular: 88%) e centro em
// 0, e imprime as linhas prontas para as tabelas DESKTOP/NARROW do choreography.ts (`--apply` as grava).
// `--at=0,0.25,0.5,0.75,1`: em vez de um ponto por beat, mede o sujeito do beat em vigor nessas frações do pin
// (critério 1 do prompt). A câmera voa entre os enquadramentos nos primeiros 35% de cada beat: nesses
// pontos "em voo" a altura pode sair da faixa, e o script marca "voo" em vez de "FORA".
// Roda em Node 24 (importa os .ts de dados direto, sem build). Use `?snap` (o script já põe).
import { chromium } from "playwright";
import { readFile, writeFile } from "node:fs/promises";
import { GL_ARGS } from "../gl.mjs";
import { BEATS, DESKTOP, NARROW, flightOf, restOf } from "../../src/scene/choreography.ts";
import { SUBJECT } from "../../src/scene/model/motion.ts";

const args = process.argv.slice(2);
const opt = (name, fallback) => args.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;
const flag = (name) => args.includes(`--${name}`);
const base = opt("url", "http://localhost:4173");
const [width, height] = opt("size", "1440x900").split("x").map(Number);
const only = opt("beats", "").split(",").filter(Boolean);
const at = opt("at", "").split(",").filter(Boolean).map(Number);
const wide = width >= 768 && width >= height;
const touch = width < 600;
const LIMITS = wide
  ? { hAim: 0.62, hMin: 0.55, hMax: 0.7, wMax: 0.66, center: 0.04 }
  : { hAim: 0.5, hMin: 0.45, hMax: 0.55, wMax: 0.88, center: 0.04 };

const browser = await chromium.launch({ args: GL_ARGS });
const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, hasTouch: touch, isMobile: touch });
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(`${base}/?snap`, { waitUntil: "load" });
await page.waitForFunction(() => window.__ready === true && window.__model, null, { timeout: 90000 });

/** Roda no navegador: projeta o sujeito e, se pedido, resolve a câmera. */
function measure({ names, solve, limits, az, el, fovBase, wide: isWide }) {
  const { camera } = window.__three;
  const model = window.__model;
  const V = camera.position.constructor;
  const points = [];
  for (const name of names) {
    const node = model.parts[name].node;
    node.updateWorldMatrix(true, true);
    node.traverse((o) => {
      if (!o.isMesh || !o.visible) return;
      const g = o.geometry;
      if (!g.boundingBox) g.computeBoundingBox();
      const b = g.boundingBox;
      for (const x of [b.min.x, b.max.x]) for (const y of [b.min.y, b.max.y]) for (const z of [b.min.z, b.max.z]) points.push(new V(x, y, z).applyMatrix4(o.matrixWorld));
    });
  }
  const bounds = (cam) => {
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const p of points) {
      const q = p.clone().project(cam);
      x0 = Math.min(x0, q.x); x1 = Math.max(x1, q.x);
      y0 = Math.min(y0, q.y); y1 = Math.max(y1, q.y);
    }
    return { h: (y1 - y0) / 2, w: (x1 - x0) / 2, dx: (x0 + x1) / 4, dy: (y0 + y1) / 4 };
  };
  const result = { current: bounds(camera) };
  if (!solve) return result;

  const lo = new V(Infinity, Infinity, Infinity);
  const hi = new V(-Infinity, -Infinity, -Infinity);
  for (const p of points) {
    lo.min(p);
    hi.max(p);
  }
  const target = lo.clone().add(hi).multiplyScalar(0.5);
  const W = innerWidth;
  const H = innerHeight;
  const rig = (dist, sx, sy) => {
    const cam = camera.clone();
    cam.clearViewOffset();
    const a = (az * Math.PI) / 180;
    const e = (el * Math.PI) / 180;
    const flat = dist * Math.cos(e);
    cam.position.set(target.x + flat * Math.sin(a), target.y + dist * Math.sin(e), target.z + flat * Math.cos(a));
    cam.lookAt(target);
    const fit = Math.max(1, (isWide ? 1.6 : 0.46) / (W / H));
    cam.fov = fit === 1 ? fovBase : (360 / Math.PI) * Math.atan(Math.tan((fovBase * Math.PI) / 360) * fit);
    cam.setViewOffset(W, H, -sx * W, sy * H, W, H);
    cam.updateMatrixWorld(true);
    cam.updateProjectionMatrix();
    return cam;
  };
  const bisect = (key, max) => {
    let a = 0.15;
    let b = 200;
    for (let i = 0; i < 70; i++) {
      const mid = (a + b) / 2;
      if (bounds(rig(mid, 0, 0))[key] > max) a = mid;
      else b = mid;
    }
    return (a + b) / 2;
  };
  const dist = Math.max(bisect("h", limits.hAim), bisect("w", limits.wMax));
  const raw = bounds(rig(dist, 0, 0));
  const sx = -raw.dx;
  const sy = -raw.dy;
  result.solved = { target: [target.x, target.y, target.z], dist, sx, sy, after: bounds(rig(dist, sx, sy)) };
  return result;
}

const r2 = (n) => Math.round(n * 100) / 100;
const pct = (n) => `${Math.round(n * 100)}%`.padStart(4);
let failures = 0;
const lines = [];
const patches = [];
console.log(`\nEnquadramento em ${width}×${height} (${wide ? "desktop" : "celular"}): altura ${LIMITS.hMin * 100}–${LIMITS.hMax * 100}%, largura ≤ ${LIMITS.wMax * 100}% (celular: manda a largura), centro ±${LIMITS.center * 100}%`);
console.log(`${(at.length ? "ponto" : "beat").padEnd(at.length ? 16 : 9)}   h     l    dx    dy   resultado`);

// O que medir: o ponto de repouso de cada beat (a câmera já chegou; `restOf`) ou, com `--at`, as frações
// pedidas. O sujeito é o do beat para onde a câmera está indo (a partir do início do voo dele). A explosão não
// é voo: a câmera recua junto com ela (`fly` do beat), e o sujeito segue na faixa.
const subjectAt = (p) => [...BEATS].reverse().find((b) => b === BEATS[0] || p >= flightOf(b)[0]);
const inFlight = (p) => BEATS.some((b) => b !== BEATS[0] && b.id !== "explode" && p >= flightOf(b)[0] && p < flightOf(b)[1]);
const probes = at.length
  ? at.map((p) => {
      const beat = subjectAt(p);
      return { beat, p, label: `${Math.round(p * 100)}%`.padStart(4) + " " + beat.id, flight: inFlight(p) };
    })
  : BEATS.map((beat) => ({ beat, p: restOf(beat), label: beat.id, flight: false }));

for (const { beat, p, label, flight } of probes) {
  if (only.length && !only.includes(beat.id)) continue;
  const y = await page.evaluate(
    ([id, frac]) => {
      const s = window.__sections.find((x) => x.id === id);
      return Math.round(s.pinStart + (s.pinEnd - s.pinStart) * frac);
    },
    ["produto", p],
  );
  await page.evaluate((target) => (window.__lenis ? window.__lenis.scrollTo(target, { immediate: true, force: true }) : window.scrollTo(0, target)), y);
  await page.waitForTimeout(2000);
  const frame = await page.evaluate(measure, {
    names: SUBJECT[beat.id],
    solve: flag("solve"),
    limits: LIMITS,
    az: (wide ? DESKTOP : NARROW)[beat.id][1],
    el: (wide ? DESKTOP : NARROW)[beat.id][2],
    fovBase: wide ? 30 : 34,
    wide,
  });
  const m = frame.current;
  const fitsH = m.h >= LIMITS.hMin - 0.005 && m.h <= LIMITS.hMax + 0.005;
  const widthLimited = !wide && m.w >= LIMITS.wMax - 0.08;
  const ok = (fitsH || widthLimited) && m.w <= LIMITS.wMax + 0.005 && Math.abs(m.dx) <= LIMITS.center && Math.abs(m.dy) <= LIMITS.center;
  // Em voo (câmera ainda indo para o enquadramento do beat), só informa.
  if (!ok && !flight) failures++;
  console.log(`${label.padEnd(at.length ? 16 : 9)} ${pct(m.h)} ${pct(m.w)} ${pct(m.dx)} ${pct(m.dy)}   ${ok ? "ok" : flight ? "voo" : "FORA"}`);
  if (frame.solved) {
    const s = frame.solved;
    const [, azimuth, elevation] = (wide ? DESKTOP : NARROW)[beat.id];
    patches.push([beat.id, `[[${s.target.map(r2).join(", ")}], ${azimuth}, ${elevation}, ${r2(s.dist)}, ${r2(s.sx)}, ${r2(s.sy)}]`]);
    lines.push(`  ${beat.id}: [[${s.target.map(r2).join(", ")}], ${azimuth}, ${elevation}, ${r2(s.dist)}, ${r2(s.sx)}, ${r2(s.sy)}], // h ${pct(s.after.h)} l ${pct(s.after.w)}`);
  }
}
if (flag("apply") && patches.length) {
  // Troca as linhas da tabela (DESKTOP ou NARROW) no choreography.ts.
  const file = new URL("../../src/scene/choreography.ts", import.meta.url);
  let text = await readFile(file, "utf8");
  const table = wide ? "DESKTOP" : "NARROW";
  const start = text.indexOf(`export const ${table}: Record<BeatId, Frame> = {`);
  const end = text.indexOf("\n};", start);
  let block = text.slice(start, end);
  for (const [id, frame] of patches) block = block.replace(new RegExp(`(\\n  ${id}: )\\[\\[[^\\n]*\\],`), `$1${frame},`);
  text = text.slice(0, start) + block + text.slice(end);
  await writeFile(file, text);
  console.log(`\n${table} atualizada em src/scene/choreography.ts (${patches.length} beats)`);
}
if (lines.length) console.log(`\nLinhas para o choreography.ts (o azimute e a elevação mudam no choreography.ts, e o alvo, a distância e a lente saem daqui):\n${lines.join("\n")}`);
if (errors.length) console.log("erros:", [...new Set(errors)].slice(0, 5));
console.log(failures ? `\n${failures} beat(s) fora do critério.` : "\nTodos os beats dentro do critério.");
await browser.close();
process.exitCode = failures ? 1 : 0;
