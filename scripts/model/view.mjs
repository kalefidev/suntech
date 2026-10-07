// Fotografa o GLB (QA do modelo, sem o app): serve o three daqui e usa o Playwright do app.
//   node view.mjs <saida.png> [--file=../../public/models/suntech.glb] [--cols=2] [--w=800] [--h=600]
//        [--bg=#dfe4ea] [--env=1] [--shots=<json>|<preset>]
// Presets de --shots: `geral` (4 tomadas), `detalhe` (placas, células e portas, tampa aberta).
// Uma tomada: { name, az, el, dist, target:[x,y,z], fov, lid (graus), panel (0 a 1), phone (bool) }.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const { chromium } = await import(pathToFileURL(path.join(root, "node_modules/playwright/index.mjs")).href);

const args = process.argv.slice(2);
const out = args.find((a) => !a.startsWith("--")) ?? "model.png";
const opt = (name, def) => args.find((a) => a.startsWith(`--${name}=`))?.split("=").slice(1).join("=") ?? def;
const file = path.resolve(opt("file", path.join(root, "public/models/suntech.glb")));
const PRESETS = {
  geral: [
    { name: "montado 3/4", az: 30, el: 22, dist: 7.6, target: [0, 0.75, 0.25] },
    { name: "tampa aberta, de cima", az: 24, el: 42, dist: 6.4, target: [0, 0.55, 0.4], lid: 110 },
    { name: "atras (caixa de junção, dobradiças)", az: 200, el: 25, dist: 7.6, target: [0, 0.7, 0.2] },
    { name: "painel aberto + celular", az: 15, el: 20, dist: 9.5, target: [0.3, 0.7, 0.2], panel: 1, lid: 110 },
  ],
  detalhe: [
    { name: "interior (tampa aberta)", az: 20, el: 55, dist: 2.6, target: [0, 0.1, 0.55], lid: 110 },
    { name: "placa de carga", az: 25, el: 50, dist: 0.9, target: [0.12, 0.17, 0.62], lid: 110 },
    { name: "boost + USB-A", az: 25, el: 40, dist: 1.0, target: [0.43, 0.16, 0.66], lid: 110 },
    { name: "células e suporte", az: 30, el: 55, dist: 1.8, target: [-0.32, 0.1, 0.38], lid: 110 },
    { name: "frente (portas)", az: 0, el: 8, dist: 2.2, target: [0.1, 0.18, 1.0] },
    { name: "dobradiça, por trás", az: 160, el: 30, dist: 2.4, target: [0, 0.3, 0.1], lid: 40 },
  ],
};
const shotsArg = opt("shots", "geral");
const shots = PRESETS[shotsArg] ?? JSON.parse(shotsArg);

const mime = { ".js": "text/javascript", ".mjs": "text/javascript", ".html": "text/html", ".glb": "model/gltf-binary", ".wasm": "application/wasm" };
const page = fs.readFileSync(path.join(here, "viewer.html"), "utf8");
const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]);
  if (url === "/") return res.writeHead(200, { "content-type": "text/html" }).end(page);
  let target = null;
  if (url.startsWith("/three/")) target = path.join(here, "node_modules/three", url.slice(7));
  else if (url === "/model.glb") target = file;
  if (!target || !fs.existsSync(target)) return res.writeHead(404).end("não achei");
  res.writeHead(200, { "content-type": mime[path.extname(target)] ?? "application/octet-stream" }).end(fs.readFileSync(target));
});
await new Promise((r) => server.listen(0, r));
const port = server.address().port;

const cols = Number(opt("cols", 2));
const w = Number(opt("w", 800));
const h = Number(opt("h", 600));
const browser = await chromium.launch({ args: ["--use-angle=d3d11", "--ignore-gpu-blocklist"] });
const tab = await browser.newPage({ viewport: { width: cols * w, height: Math.ceil(shots.length / cols) * h } });
const logs = [];
tab.on("console", (m) => m.type() === "error" && logs.push(m.text()));
tab.on("pageerror", (e) => logs.push(`ERRO ${e.message}`));
const params = new URLSearchParams({ shots: JSON.stringify(shots), cols: String(cols), w: String(w), h: String(h), bg: opt("bg", "#dfe4ea"), env: opt("env", "1") });
await tab.goto(`http://localhost:${port}/?${params}`);
await tab.waitForFunction(() => window.__done === true, null, { timeout: 120000 }).catch(() => logs.push("tempo esgotado"));
await tab.screenshot({ path: path.resolve(out) });
if (logs.length) console.log(logs.join("\n"));
console.log(`ok: ${path.resolve(out)}`);
await browser.close();
server.close();
