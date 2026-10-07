// Evidência da Fase 0 da v3 (docs/v3-fase-0.md, §2 e risco 1). Descartável: vira
// ferramenta de verdade na Fase 1. Não toca o app; só usa a matemática do three.
//
// Projeta as caixas de contorno das peças reais (1 un. = 100 mm, dimensions.ts)
// com a câmera do `orbit()` do choreography.ts e mede, em fração da viewport, a
// altura (h), a largura (l) e o desvio do centro (dx, dy) do sujeito.
//   1) beats: distância em que o sujeito do beat tem a altura-alvo e cabe na largura;
//   2) sujeitos largos: quanto de largura cada peça ocupa quando tem 62% de altura.
//
// Uso (na raiz do projeto): node docs/v3-medicoes/enquadramento.mjs
import * as THREE from "three";

const DEG = Math.PI / 180;
const corners = (x, y, z) => x.flatMap((a) => y.flatMap((b) => z.map((c) => new THREE.Vector3(a, b, c))));
const join = (...lists) => lists.flat();

function measure(points, { az, el, dist, fov, aspect, target }) {
  const camera = new THREE.PerspectiveCamera(fov, aspect, 0.01, 200);
  const flat = dist * Math.cos(el * DEG);
  camera.position.set(
    target.x + flat * Math.sin(az * DEG),
    target.y + dist * Math.sin(el * DEG),
    target.z + flat * Math.cos(az * DEG),
  );
  camera.lookAt(target);
  camera.updateMatrixWorld(true);
  camera.updateProjectionMatrix();
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const p of points) {
    const q = p.clone().project(camera);
    x0 = Math.min(x0, q.x); x1 = Math.max(x1, q.x);
    y0 = Math.min(y0, q.y); y1 = Math.max(y1, q.y);
  }
  return { h: (y1 - y0) / 2, w: (x1 - x0) / 2, dx: (x0 + x1) / 4, dy: (y0 + y1) / 4 };
}

/** Menor distância em que h <= hMax e w <= wMax (busca binária em cada limite). */
function fit(points, config, hMax, wMax) {
  const solve = (key, max) => {
    let lo = 0.2, hi = 120;
    for (let i = 0; i < 70; i++) {
      const mid = (lo + hi) / 2;
      if (measure(points, { ...config, dist: mid })[key] > max) lo = mid;
      else hi = mid;
    }
    return (lo + hi) / 2;
  };
  const dist = Math.max(solve("h", hMax), solve("w", wMax));
  return { dist, ...measure(points, { ...config, dist }) };
}

const centerOf = (points) => new THREE.Box3().setFromPoints(points).getCenter(new THREE.Vector3());
const pct = (x, n = 4) => `${(x * 100).toFixed(0)}%`.padStart(n);
const pad = (s, n) => String(s).padEnd(n);

// ------------------------------------------------------------ peças (unidades da cena)
const caseBox = (y0 = 0, y1 = 0.4) => corners([-0.75, 0.75], [y0, y1], [-0.5, 0.5]);
const plate = (y) => corners([-1, 1], [y, y + 0.06], [-0.75, 0.75]);
const hero = join(corners([-1, 1], [0.04, 1.54], [-0.66, -0.54]), corners([-0.75, 0.75], [0, 0.4], [0.05, 1.05]));
const charge = corners([-0.13, 0.13], [1.7, 1.76], [-0.085, 0.085]);
const cells = corners([-0.31, 0.31], [1.15, 1.33], [-0.2, 0.2]);
const boost = corners([-0.2, 0.11], [0.65, 0.72], [-0.08, 0.15]);

const BEATS = {
  "0 Fechado (painel dobrado em pé + caixa)": { points: hero, az: 30, el: 22 },
  "1 Abre (caixa + tampa a 110°)": { points: join(caseBox(), corners([-0.75, 0.75], [0.4, 1.34], [-0.84, -0.4])), az: 24, el: 42 },
  "2 Explode (pilha vertical completa)": {
    points: join(plate(3.3), plate(2.8), corners([-0.75, 0.75], [2.25, 2.314], [-0.5, 0.5]), charge, cells, boost, caseBox(0, 0.31)),
    az: 30,
    el: 22,
  },
  "3a Captar (as 2 placas)": { points: join(plate(3.3), plate(2.8)), az: 30, el: 45 },
  "3b Proteger (módulo de carga)": { points: charge, az: 30, el: 45 },
  "3c Guardar (2 células 18650)": { points: cells, az: 30, el: 45 },
  "3d Entregar (boost + USB-A)": { points: boost, az: 30, el: 45 },
  "4 Remonta (= Fechado, câmera a 60°)": { points: hero, az: 60, el: 22 },
  "5 Energia (caixa + celular em pé)": { points: join(caseBox(), corners([0.95, 1.7], [0, 1.5], [-0.04, 0.04])), az: 20, el: 25 },
};

const VIEWPORTS = [
  { name: "desktop 1440×900", aspect: 1440 / 900, fov: 30, hAim: 0.62, wMax: 0.66 },
  { name: "celular 390×844", aspect: 390 / 844, fov: 34, hAim: 0.5, wMax: 0.88 },
];

for (const viewport of VIEWPORTS) {
  console.log(`\n== Beats, ${viewport.name} (altura-alvo ${viewport.hAim * 100}%, largura <= ${viewport.wMax * 100}%) ==`);
  console.log(`${pad("beat", 40)} ${pad("alvo (x, y, z)", 20)} az  el  dist    h     l    dx     dy`);
  for (const [name, beat] of Object.entries(BEATS)) {
    const target = centerOf(beat.points);
    const r = fit(beat.points, { az: beat.az, el: beat.el, fov: viewport.fov, aspect: viewport.aspect, target }, viewport.hAim, viewport.wMax);
    const where = `(${target.x.toFixed(2)}, ${target.y.toFixed(2)}, ${target.z.toFixed(2)})`;
    console.log(
      `${pad(name, 40)} ${pad(where, 20)} ${String(beat.az).padStart(2)} ${String(beat.el).padStart(3)} ${r.dist.toFixed(2).padStart(6)} ${pct(r.h)} ${pct(r.w)} ${pct(r.dx, 5)} ${pct(r.dy, 5)}`,
    );
  }
}

// ------------------------------------------------------------ risco 1: sujeitos largos
const WIDE = {
  "caixa deitada": caseBox(0, 0.4),
  "placa solar deitada (2,0 × 1,5)": plate(0),
  "módulo TP4056 (0,26 × 0,17)": charge,
  "2 células 18650 (0,62 × 0,4)": cells,
  "painel dobrado em pé + caixa": hero,
};
console.log("\n== Risco 1: largura que cada sujeito ocupa quando tem 62% da altura (desktop) ==");
for (const [name, points] of Object.entries(WIDE)) {
  const target = centerOf(points);
  const at = (el) => fit(points, { az: 30, el, fov: 30, aspect: 1440 / 900, target }, 0.62, 10);
  console.log(`${pad(name, 34)} elevação 22°: l ${pct(at(22).w)}   elevação 45°: l ${pct(at(45).w)}`);
}
