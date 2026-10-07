// Gera public/models/suntech.glb: monta as peças (parts/*.mjs), exporta com o three e
// otimiza com o gltf-transform (solda vértices, dedup, meshopt). Uso: npm run model (na raiz)
// ou `node build.mjs [--raw]` aqui (--raw: pula a otimização).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { NodeIO, PropertyType } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, prune, weld } from "@gltf-transform/functions";
import { meshopt } from "@gltf-transform/functions";
import { MeshoptEncoder } from "meshoptimizer";
import { THREE } from "./lib/geom.mjs";
import { exportGLB } from "./lib/export.mjs";
import { Part } from "./lib/part.mjs";
import { buildCaseBase, buildCaseLid } from "./parts/case.mjs";
import { buildHolder } from "./parts/cells.mjs";
import { buildBoostBoard, buildChargeBoard } from "./parts/boards.mjs";
import { buildPanel } from "./parts/panel.mjs";
import { buildPhone } from "./parts/phone.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(here, "../../public/models/suntech.glb");
const RAW = path.join(here, ".cache/suntech.raw.glb");
const raw = process.argv.includes("--raw");

// A caixa fica à frente do painel dobrado (z = 0,55; o painel fica em z = −0,6).
export const CASE_AT = [0, 0, 0.55];

async function assemble() {
  const root = new Part("suntech");
  const box = root.child(new Part("case", { pos: CASE_AT }));
  box.child(buildCaseBase());
  box.child(await buildCaseLid());
  box.child(buildHolder());
  box.child(buildChargeBoard());
  box.child(buildBoostBoard());
  root.child(await buildPanel());
  root.child(buildPhone());
  return root;
}

function countTriangles(object) {
  let tris = 0;
  const parts = [];
  object.traverse((o) => {
    if (!o.isMesh) return;
    const g = o.geometry;
    const n = (g.index ? g.index.count : g.attributes.position.count) / 3;
    tris += n;
    parts.push([o.name, Math.round(n)]);
  });
  return { tris: Math.round(tris), parts };
}

const scene = new THREE.Scene();
scene.add((await assemble()).build());
const stats = countTriangles(scene);

const glb = Buffer.from(await exportGLB(scene));
fs.mkdirSync(path.dirname(RAW), { recursive: true });
fs.writeFileSync(RAW, glb);

await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ "meshopt.encoder": MeshoptEncoder });
const doc = await io.readBinary(new Uint8Array(glb));

if (!raw) {
  await doc.transform(
    weld({ tolerance: 1e-5, toleranceNormal: 0.2 }),
    // Não funde materiais: o runtime os acha pelo nome.
    dedup({ propertyTypes: [PropertyType.ACCESSOR, PropertyType.MESH, PropertyType.TEXTURE] }),
    prune({ keepLeaves: true, keepAttributes: true, propertyTypes: [PropertyType.ACCESSOR, PropertyType.BUFFER, PropertyType.TEXTURE] }),
    meshopt({ encoder: MeshoptEncoder, level: "medium" }),
  );
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
await io.write(OUT, doc);
const size = fs.statSync(OUT).size;

const names = doc.getRoot().listNodes().map((n) => n.getName());
console.log(`nós (${names.length}): ${names.join(", ")}`);
console.log(`triângulos: ${stats.tris.toLocaleString("pt-BR")} em ${stats.parts.length} malhas`);
for (const [name, n] of stats.parts.sort((a, b) => b[1] - a[1]).slice(0, 12)) console.log(`  ${String(n).padStart(7)}  ${name}`);
console.log(`GLB: ${(size / 1024).toFixed(0)} KB (${raw ? "bruto" : "otimizado"}), teto 1536 KB -> ${size <= 1.5 * 1024 * 1024 ? "ok" : "ESTOUROU"}`);
