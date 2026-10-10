// Leva o modelo feito à mão (export do Blender) para o site: confere o contrato, comprime como o
// gerador (solda, dedup sem fundir materiais, meshopt) e grava public/models/suntech.glb.
// Uso (na raiz): npm run model:import [-- models-src/suntech.glb] [--level=high]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Logger, NodeIO, PropertyType } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, meshopt, prune, weld } from "@gltf-transform/functions";
import { MeshoptDecoder, MeshoptEncoder } from "meshoptimizer";
import { BUDGET, blockedExtensions, checkDocument, glbJson, report } from "./lib/contract.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, "../..");
const OUT = path.join(ROOT, "public/models/suntech.glb");
const args = process.argv.slice(2);
const input = path.resolve(args.find((a) => !a.startsWith("--")) ?? path.join(ROOT, "models-src/suntech.glb"));
const forced = args.find((a) => a.startsWith("--level="))?.split("=")[1];

if (!fs.existsSync(input)) {
  console.log(`Não achei ${path.relative(ROOT, input)}. Exporte do Blender para lá (docs/v3-modelo-a-mao.md, passo 9) ou passe o caminho: npm run model:import -- caminho/modelo.glb`);
  process.exit(1);
}
if (path.resolve(input) === OUT) {
  console.log("A entrada é o próprio public/models/suntech.glb: passe o export do Blender (models-src/suntech.glb).");
  process.exit(1);
}

const source = fs.readFileSync(input);
const json = glbJson(source);
const blocked = blockedExtensions(json);
if (blocked.length) {
  for (const msg of blocked) console.log(`  ✗ ${msg}`);
  process.exit(1);
}

await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready]);
const quiet = new Logger(Logger.Verbosity.ERROR);
const io = new NodeIO()
  .setLogger(quiet)
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ "meshopt.encoder": MeshoptEncoder, "meshopt.decoder": MeshoptDecoder });

// 1. O contrato no export cru: se a estrutura estiver errada, nem comprime.
const before = await io.readBinary(new Uint8Array(source));
before.setLogger(quiet);
const pre = checkDocument(before, { stage: "entrada", json });
if (!report(pre, `Export do Blender: ${path.relative(ROOT, input)} (${(source.length / 1024).toFixed(0)} KB)`)) process.exit(1);

// 2. Compressão: igual ao gerador (build.mjs). "medium" quantiza com mais precisão; se passar do
// teto, tenta "high" (normais em 8 bits, filtros do meshopt), a menos que o nível venha forçado.
async function compress(level) {
  const doc = await io.readBinary(new Uint8Array(source));
  doc.setLogger(quiet);
  await doc.transform(
    weld(),
    // Não funde materiais: o site os acha pelo nome.
    dedup({ propertyTypes: [PropertyType.ACCESSOR, PropertyType.MESH, PropertyType.TEXTURE] }),
    // keepLeaves: as âncoras são nós vazios e folhas.
    prune({ keepLeaves: true, keepAttributes: true, propertyTypes: [PropertyType.ACCESSOR, PropertyType.BUFFER, PropertyType.TEXTURE] }),
    meshopt({ encoder: MeshoptEncoder, level }),
  );
  doc.getRoot().setExtras({ ...doc.getRoot().getExtras(), suntech: { source: "blender", from: path.basename(input), imported: new Date().toISOString(), level } });
  return { doc, bytes: await io.writeBinary(doc) };
}

let level = forced ?? "medium";
let out = await compress(level);
if (!forced && out.bytes.length > BUDGET) {
  console.log(`\nCom meshopt "medium": ${(out.bytes.length / 1024).toFixed(0)} KB, acima do teto. Tentando "high"...`);
  level = "high";
  out = await compress(level);
}

// 3. O contrato no arquivo final (pivôs depois da quantização, tamanho, extensões).
const post = checkDocument(out.doc, { stage: "saida", bytes: out.bytes.length, json: glbJson(Buffer.from(out.bytes)) });
const ok = report(post, `GLB para o site: meshopt "${level}", ${(out.bytes.length / 1024).toFixed(0)} KB`);
if (!ok) {
  console.log("Nada foi gravado: public/models/suntech.glb continua o anterior.");
  process.exit(1);
}
fs.writeFileSync(OUT, out.bytes);
console.log(`\nGravado: public/models/suntech.glb. O "npm run model" agora recusa sobrescrever este arquivo (use --force se quiser voltar ao gerado).
Registre a licença de qualquer peça de fora em public/models/LICENSE.md.

Depois de trocar (docs/v3-modelo-a-mao.md, "Depois de trocar"):
  npm run dev                         confira a cena e o console ("O GLB não tem a peça ...")
  npm run build && npm run preview    e, com o preview no ar, noutro terminal:
  node scripts/dev/framing.mjs --solve --apply
  node scripts/dev/framing.mjs --solve --apply --size=390x844
  node scripts/dev/reverse.mjs        node scripts/dev/sweep.mjs        npm run snap <fase>`);
