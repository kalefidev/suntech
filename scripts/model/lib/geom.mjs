// Primitivas de geometria do pipeline do modelo. Unidades da cena: 1 = 100 mm
// (as mesmas do runtime). Tudo com chanfro: nada de caixa viva (CLAUDE.md, Ativos 3D).
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries, toCreasedNormals } from "three/addons/utils/BufferGeometryUtils.js";
import { Brush, Evaluator, SUBTRACTION } from "three-bvh-csg";

const DEG = Math.PI / 180;
export { THREE, DEG };

// ------------------------------------------------------------------ normalização

/** Só position, normal e uv, sem índice: o que o `mergeGeometries` precisa. */
export function plain(source) {
  const g = source.index ? source.toNonIndexed() : source.clone();
  const out = new THREE.BufferGeometry();
  out.setAttribute("position", g.attributes.position);
  if (!g.attributes.normal) g.computeVertexNormals();
  out.setAttribute("normal", g.attributes.normal);
  out.setAttribute(
    "uv",
    g.attributes.uv ?? new THREE.Float32BufferAttribute(new Float32Array((g.attributes.position.count * 2)), 2),
  );
  return out;
}

/** Normais suaves dentro do ângulo de vinco; arestas vivas ficam vivas. */
export function crease(geometry, angle = 38) {
  return plain(toCreasedNormals(plain(geometry), angle * DEG));
}

export function merge(list) {
  return mergeGeometries(list.map(plain), false);
}

// ---------------------------------------------------------------- transformações

/** Move, gira (graus) e escala uma cópia da geometria. */
export function place(geometry, { pos = [0, 0, 0], rot = [0, 0, 0], scale = 1 } = {}) {
  const g = geometry.clone();
  const m = new THREE.Matrix4().compose(
    new THREE.Vector3(...pos),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG, "XYZ")),
    typeof scale === "number" ? new THREE.Vector3(scale, scale, scale) : new THREE.Vector3(...scale),
  );
  g.applyMatrix4(m);
  return g;
}

// ------------------------------------------------------------------ contornos

function roundedRect(path, width, height, radius) {
  const x = -width / 2;
  const y = -height / 2;
  const r = Math.max(1e-4, Math.min(radius, width / 2, height / 2));
  path.moveTo(x + r, y);
  path.lineTo(x + width - r, y);
  path.absarc(x + width - r, y + r, r, -Math.PI / 2, 0, false);
  path.lineTo(x + width, y + height - r);
  path.absarc(x + width - r, y + height - r, r, 0, Math.PI / 2, false);
  path.lineTo(x + r, y + height);
  path.absarc(x + r, y + height - r, r, Math.PI / 2, Math.PI, false);
  path.lineTo(x, y + r);
  path.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return path;
}

export const rectShape = (w, h, r) => roundedRect(new THREE.Shape(), w, h, r);

/**
 * Bloco de cantos arredondados e arestas biseladas: y para cima, base em y = 0,
 * centrado em x e z. Com `hole`, vira um aro. O bisel do three cresce para fora
 * do contorno; o contorno entra na mesma medida e as medidas finais batem.
 */
export function slab({ width, depth, height, radius, bevel = 0, hole, segments = 10, bevelSegments = 4, flatNormals = false }) {
  if (hole) {
    // O furo do ExtrudeGeometry vira inválido quando a parede é mais fina que 2 × bisel (o
    // furo cresce o bisel para dentro do contorno): a v2 saiu com a caixa maciça por isso.
    // Aqui o bloco sai inteiro e o furo é uma subtração (CSG), valendo para qualquer parede.
    const solid = slab({ width, depth, height, radius, bevel, segments, bevelSegments, flatNormals });
    const prism = slab({ width: hole.width, depth: hole.depth, height: height + 0.04, radius: hole.radius, bevel: 0, segments, flatNormals: true });
    return subtract(solid, [place(prism, { pos: [0, -0.02, 0] })]);
  }
  const shape = roundedRect(new THREE.Shape(), width - 2 * bevel, depth - 2 * bevel, Math.max(1e-4, radius - bevel));
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(1e-4, height - 2 * bevel),
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelOffset: 0,
    bevelSegments,
    curveSegments: segments,
  });
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, bevel, 0);
  return flatNormals ? plain(geometry) : crease(geometry);
}

/** Bloco com arestas arredondadas, centrado (ou com a base em y = 0 com `grounded`). */
export function box(w, h, d, { r = Math.min(w, h, d) * 0.14, seg = 2, grounded = false } = {}) {
  const g = new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2 - 1e-5, h / 2 - 1e-5, d / 2 - 1e-5));
  if (grounded) g.translate(0, h / 2, 0);
  return plain(g);
}

/** Cilindro com as bordas chanfradas, eixo em y, base em y = 0 (ou centrado). */
export function cyl(radius, height, { seg = 24, edge = Math.min(radius, height) * 0.12, centered = false, top = true, bottom = true } = {}) {
  const e = Math.min(edge, radius * 0.5, height * 0.5);
  const pts = [new THREE.Vector2(0, 0)];
  if (bottom) pts.push(new THREE.Vector2(radius - e, 0), new THREE.Vector2(radius, e));
  else pts.push(new THREE.Vector2(radius, 0));
  if (top) pts.push(new THREE.Vector2(radius, height - e), new THREE.Vector2(radius - e, height), new THREE.Vector2(0, height));
  else pts.push(new THREE.Vector2(radius, height), new THREE.Vector2(0, height));
  const g = crease(new THREE.LatheGeometry(pts, seg), 50);
  if (centered) g.translate(0, -height / 2, 0);
  return g;
}

/** Sólido de revolução (perfil [raio, y]) em torno de y, com normais suaves. */
export function lathe(profile, { seg = 40, angle = 50 } = {}) {
  return crease(new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), seg), angle);
}

/** Tubo ao longo de uma curva Catmull-Rom (fios, molas). */
export function tube(points, radius, { segments = 24, radial = 8, closed = false } = {}) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), closed, "centripetal");
  return plain(new THREE.TubeGeometry(curve, segments, radius, radial, closed));
}

/** Mola helicoidal ao longo de x, de x = 0 a x = length. */
export function spring({ length, radius, wire, turns = 6 }) {
  const pts = [];
  const n = turns * 14;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const a = t * turns * Math.PI * 2;
    pts.push([t * length, Math.cos(a) * radius, Math.sin(a) * radius]);
  }
  return tube(pts, wire, { segments: n * 2, radial: 6 });
}

/** Plano horizontal (normal +y) de cantos arredondados, com uv 0..1 na caixa dele. */
export function plate({ width, depth, radius = 0, y = 0 }) {
  const g = new THREE.ShapeGeometry(roundedRect(new THREE.Shape(), width, depth, radius), 10);
  g.rotateX(-Math.PI / 2);
  const p = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / width + 0.5, 0.5 - p.getZ(i) / depth);
  g.translate(0, y, 0);
  return plain(g);
}

/** Plano vertical (normal +z), de cantos arredondados, uv 0..1. */
export function panelFace({ width, height, radius = 0, z = 0, flip = false }) {
  const g = new THREE.ShapeGeometry(roundedRect(new THREE.Shape(), width, height, radius), 8);
  const p = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / width + 0.5, p.getY(i) / height + 0.5);
  if (flip) g.rotateY(Math.PI);
  g.translate(0, 0, z);
  return plain(g);
}

// -------------------------------------------------------------------------- CSG

const evaluator = new Evaluator();
evaluator.attributes = ["position", "normal", "uv"];
evaluator.useGroups = false;

/** Subtrai cada `cutter` (geometrias já posicionadas) da base. */
export function subtract(base, cutters) {
  let brush = new Brush(plain(base));
  brush.updateMatrixWorld();
  for (const cutter of cutters) {
    const other = new Brush(plain(cutter));
    other.updateMatrixWorld();
    brush = evaluator.evaluate(brush, other, SUBTRACTION);
    brush.updateMatrixWorld();
  }
  return plain(brush.geometry);
}
