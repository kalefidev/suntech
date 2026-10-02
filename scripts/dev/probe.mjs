// Fotografa a cena com campos do sceneState forçados (depois de pronto).
// Uso: node scripts/dev/probe.mjs <saida.png> <largura>x<altura> campo=valor ...  (preview em :4173)
//   at=energia-fica:0.5   rola antes até essa fração da seção (o texto dela aparece)
//   orbit=tx,ty,tz,az,el,dist,fov,sx,sy   câmera em órbita, como o orbit() do choreography.ts
import { chromium } from "playwright";
import { GL_ARGS } from "../gl.mjs";

const [output, size = "960x600", ...pairs] = process.argv.slice(2);
const [width, height] = size.split("x").map(Number);
const raw = Object.fromEntries(pairs.map((p) => p.split("=")));
const at = raw.at?.split(":");
const orbit = raw.orbit?.split(",").map(Number);
delete raw.at;
delete raw.orbit;
const values = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, Number(v)]));
if (orbit) {
  const [tx, ty, tz, az, el, dist, fov, sx, sy] = orbit;
  const a = (az * Math.PI) / 180;
  const e = (el * Math.PI) / 180;
  const flat = dist * Math.cos(e);
  Object.assign(values, {
    "camera.x": tx + flat * Math.sin(a),
    "camera.y": ty + dist * Math.sin(e),
    "camera.z": tz + flat * Math.cos(a),
    "camera.tx": tx,
    "camera.ty": ty,
    "camera.tz": tz,
    "camera.fov": fov,
    "camera.sx": sx,
    "camera.sy": sy,
  });
}

const browser = await chromium.launch({ args: GL_ARGS });
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1, hasTouch: width < 600, isMobile: width < 600 });
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://localhost:4173/?snap", { waitUntil: "load" });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 90000 });
if (at) {
  await page.evaluate(
    ([id, fraction]) => {
      const s = window.__sections.find((x) => x.id === id);
      const [a, z] = s.pinStart !== undefined ? [s.pinStart, s.pinEnd] : [s.start, s.end];
      const y = Math.round(a + (z - a) * fraction);
      if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true, force: true });
      else window.scrollTo(0, y);
    },
    [at[0], Number(at[1] ?? 0.5)],
  );
  await page.waitForTimeout(1500);
}
await page.evaluate((v) => {
  for (const [path, value] of Object.entries(v)) {
    const keys = path.split(".");
    let target = window.__scene;
    while (keys.length > 1) target = target[keys.shift()];
    target[keys[0]] = value;
  }
}, values);
await page.waitForTimeout(2000);
await page.screenshot({ path: output });
if (errors.length) console.log("erros:", errors);
await browser.close();
