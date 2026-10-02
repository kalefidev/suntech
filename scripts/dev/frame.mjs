// Projeta os cantos do produto na tela para acertar o enquadramento.
// Uso: node scripts/dev/frame.mjs ry=28 dist=11.5 sx=0.32 sy=-0.28 [w=390 h=844 fov=34 ...]
// Repete a conta da câmera (orbit + deslocamento de lente) do choreography.ts
// e imprime onde os cantos do painel e da caixa caem na tela, sem build.
import * as THREE from "three";

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.split("=")).map(([k, v]) => [k, Number(v)]));
const W = args.w ?? 1440, H = args.h ?? 900;
const cam = {
  target: [args.tx ?? 0.25, args.ty ?? 0.62, args.tz ?? 0.15],
  az: args.az ?? -16, el: args.el ?? 12, dist: args.dist ?? 16, fov: args.fov ?? 30, sx: args.sx ?? 0.29, sy: args.sy ?? -0.12,
};
const ry = args.ry ?? 20;

function orbit({ target, az, el, dist }) {
  const a = (az * Math.PI) / 180, e = (el * Math.PI) / 180, flat = dist * Math.cos(e);
  return [target[0] + flat * Math.sin(a), target[1] + dist * Math.sin(e), target[2] + flat * Math.cos(a)];
}

const camera = new THREE.PerspectiveCamera(cam.fov, W / H, 0.1, 100);
camera.position.set(...orbit(cam));
camera.lookAt(new THREE.Vector3(...cam.target));
camera.setViewOffset(W, H, -cam.sx * W, cam.sy * H, W, H);
camera.updateMatrixWorld();

const L = 2, PH = 1.5, PANEL = [-0.2, 0.04, -0.6], V = (14 * Math.PI) / 180;
const CASE = [args.cx ?? 1.2, 0, args.cz ?? 1.35], TURN = args.turn ?? -0.22;
const pts = {};
const rotY = (p, a) => [p[0] * Math.cos(a) + p[2] * Math.sin(a), p[1], -p[0] * Math.sin(a) + p[2] * Math.cos(a)];
const add = (p, q) => [p[0] + q[0], p[1] + q[1], p[2] + q[2]];
for (const [name, x, a] of [["A", -L, V], ["B", L, -V]]) {
  for (const y of [0, PH]) pts[`${name}${y ? "top" : "bot"}`] = add(PANEL, rotY([x, y, 0], a));
}
pts.hingeTop = add(PANEL, [0, PH, 0]);
for (const sx of [-1, 1]) for (const sz of [-1, 1]) pts[`case${sx}${sz}`] = add(CASE, rotY([sx * 0.75, 0.41, sz * 0.5], TURN));
pts.caseBotFront = add(CASE, rotY([0, 0, 0.5], TURN));
pts.ground = [0, 0, 0];

const out = [];
for (const [k, p] of Object.entries(pts)) {
  const v = new THREE.Vector3(...rotY(p, (ry * Math.PI) / 180)).project(camera);
  out.push(`${k.padEnd(14)} x ${Math.round(((v.x + 1) / 2) * W).toString().padStart(5)}  y ${Math.round(((1 - v.y) / 2) * H).toString().padStart(5)}`);
}
console.log(`camera ${JSON.stringify(cam)} ry ${ry}`);
console.log(out.join("\n"));
