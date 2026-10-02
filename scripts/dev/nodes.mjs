// Mede onde os nós do esquema de "Como funciona", as etiquetas e o texto caem
// na tela, e fotografa. Lista também as malhas visíveis fora dos nós (sobras).
// Uso: node scripts/dev/nodes.mjs <saida.png> <L>x<A> [pin=0.95] [campo=valor ...]  (preview em :4173)
import { chromium } from "playwright";
import { GL_ARGS } from "../gl.mjs";

const [output, size = "1440x900", ...rest] = process.argv.slice(2);
const [width, height] = size.split("x").map(Number);
const values = Object.fromEntries(rest.map((p) => p.split("=")).map(([k, v]) => [k, Number(v)]));
const pin = values.pin ?? 0.95;
delete values.pin;

const browser = await chromium.launch({ args: GL_ARGS });
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1, hasTouch: width < 600, isMobile: width < 600 });
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://localhost:4173/?snap", { waitUntil: "load" });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 90000 });
await page.evaluate((at) => {
  const s = window.__sections.find((x) => x.id === "como-funciona");
  const y = Math.round(s.pinStart + (s.pinEnd - s.pinStart) * at);
  if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true, force: true });
  else window.scrollTo(0, y);
}, pin);
await page.waitForTimeout(2500);
if (Object.keys(values).length) {
  await page.evaluate((v) => {
    for (const [p, value] of Object.entries(v)) {
      const keys = p.split(".");
      let target = window.__scene;
      while (keys.length > 1) target = target[keys.shift()];
      target[keys[0]] = value;
    }
  }, values);
  await page.waitForTimeout(1500);
}

const report = await page.evaluate(() => {
  const { scene, camera } = window.__three;
  const round = (r) => r.map((v) => Math.round(v));
  const screenRect = (root) => {
    const r = [Infinity, Infinity, -Infinity, -Infinity];
    root.traverseVisible((m) => {
      if (!m.geometry || m.isPoints) return;
      if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
      const b = m.geometry.boundingBox;
      for (const x of [b.min.x, b.max.x])
        for (const y of [b.min.y, b.max.y])
          for (const z of [b.min.z, b.max.z]) {
            const v = m.position.clone().set(x, y, z).applyMatrix4(m.matrixWorld).project(camera);
            const sx = ((v.x + 1) / 2) * innerWidth;
            const sy = ((1 - v.y) / 2) * innerHeight;
            r[0] = Math.min(r[0], sx);
            r[1] = Math.min(r[1], sy);
            r[2] = Math.max(r[2], sx);
            r[3] = Math.max(r[3], sy);
          }
    });
    return round(r);
  };
  const nodes = {};
  const strays = [];
  const inNode = (o) => {
    for (let p = o; p; p = p.parent) if (p.userData.node) return true;
    return false;
  };
  scene.traverseVisible((o) => {
    if (o.userData.node) nodes[o.userData.node] = screenRect(o);
    else if (o.isMesh && !inNode(o) && o.layers.mask === 1) {
      const r = screenRect(o);
      const w = r[2] - r[0];
      if (w < innerWidth * 0.6 && r[2] > 0 && r[0] < innerWidth && r[3] > 0 && r[1] < innerHeight)
        strays.push({ rect: r, geometry: o.geometry.type, material: o.material.type, color: o.material.color?.getHexString() });
    }
  });
  const tags = [...document.querySelectorAll(".step-tag")].map((e) => {
    const r = e.getBoundingClientRect();
    return [e.textContent.trim(), e.dataset.state, ...round([r.left, r.top, r.right, r.bottom])].join(" ");
  });
  const t = document.querySelector("#como-funciona [data-stage-text]").getBoundingClientRect();
  return { flow: window.__scene.flow, nodes, tags, text: round([t.left, t.top, t.right, t.bottom]), strays };
});
console.log(JSON.stringify(report, null, 1).replace(/\n\s+(-?\d)/g, " $1").replace(/\n\s+\]/g, " ]"));
await page.screenshot({ path: output });
if (errors.length) console.log("erros:", errors);
await browser.close();
