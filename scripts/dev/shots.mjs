// Fotografa a cena em vários pontos do pin, numa sessão só, e monta uma grade (iteração visual).
//   node scripts/dev/shots.mjs [--url=http://localhost:4173] [--size=1440x900] [--at=produto:0,0.1,0.5]
//        [--out=.snapshots/shots] [--wait=1400] [--montage=grade.png --cols=3] [--reduced] [--nowebgl]
// `--at` aceita várias seções separadas por espaço: "produto:0,0.5,1 ponte:0.5". Em reduced motion,
// o ponto de cada beat vem de `[data-beat]` (use `--at=produto:fechado,abre,...` com os ids).
// Serve o build (:4173, `npm run build` antes) ou o dev (`npm run dev`, --url=http://localhost:5173).
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { GL_ARGS } from "../gl.mjs";

const args = process.argv.slice(2);
const opt = (name, fallback) => args.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;
const flag = (name) => args.includes(`--${name}`);
const base = opt("url", "http://localhost:4173");
const [width, height] = opt("size", "1440x900").split("x").map(Number);
const spec = args.filter((a) => !a.startsWith("--")).concat(opt("at", "produto:0,0.5,1").split(" ")).filter(Boolean);
const out = path.resolve(opt("out", ".snapshots/shots"));
const wait = Number(opt("wait", 1400));
const touch = width < 600;
const stamp = opt("name", `${width}x${height}${flag("reduced") ? "-reduced" : ""}${flag("nowebgl") ? "-nowebgl" : ""}`);

await mkdir(out, { recursive: true });
const browser = await chromium.launch({ args: GL_ARGS });
const context = await browser.newContext({
  viewport: { width, height },
  deviceScaleFactor: 1,
  hasTouch: touch,
  isMobile: touch,
  reducedMotion: flag("reduced") ? "reduce" : "no-preference",
});
const page = await context.newPage();
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(`${base}/?snap${flag("nowebgl") ? "&nowebgl" : ""}`, { waitUntil: "load" });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 90000 });

const files = [];
for (const item of spec) {
  const [id, list] = item.split(":");
  for (const at of list.split(",")) {
    const y = await page.evaluate(
      ([section, where]) => {
        const s = window.__sections.find((x) => x.id === section);
        if (!s) throw new Error(`seção "${section}" não existe`);
        const [a, z] = s.pinStart !== undefined ? [s.pinStart, s.pinEnd] : [s.start, s.end];
        let f = Number(where);
        if (Number.isNaN(f)) {
          // Reduced motion e sem WebGL: o id do beat aponta para o bloco dele.
          const block = document.querySelector(`[data-beat="${where}"]`);
          const r = block.getBoundingClientRect();
          return Math.round(window.scrollY + r.top + r.height / 2 - window.innerHeight / 2);
        }
        return Math.round(a + (z - a) * f);
      },
      [id, at],
    );
    await page.evaluate((target) => {
      if (window.__lenis) window.__lenis.scrollTo(target, { immediate: true, force: true });
      else window.scrollTo(0, target);
    }, y);
    await page.waitForTimeout(wait);
    const file = `${stamp}-${id}-${at}.png`;
    await page.screenshot({ path: path.join(out, file) });
    files.push(file);
    console.log(`${file}  (scrollY ${y})`);
  }
}
if (errors.length) console.log("erros:", [...new Set(errors)].slice(0, 6));
await browser.close();

const montage = opt("montage", "");
if (montage) {
  const cols = Number(opt("cols", 3));
  const html = `<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#222;display:grid;grid-template-columns:repeat(${cols},1fr);gap:4px}figure{margin:0;position:relative}img{width:100%;display:block}figcaption{position:absolute;left:0;top:0;background:#000b;color:#fff;font:12px sans-serif;padding:2px 6px}</style>${files
    .map((f) => `<figure><img src="${f}"><figcaption>${f.replace(".png", "")}</figcaption></figure>`)
    .join("")}`;
  const htmlPath = path.join(out, "_montage.html");
  await writeFile(htmlPath, html);
  const b2 = await chromium.launch();
  const p2 = await b2.newPage({ viewport: { width: cols * Math.min(width, 640), height: 400 } });
  await p2.goto(`file://${htmlPath.replace(/\\/g, "/")}`);
  await p2.waitForLoadState("load");
  await p2.screenshot({ path: path.join(out, montage), fullPage: true });
  await b2.close();
  console.log(`grade: ${path.join(out, montage)}`);
}
