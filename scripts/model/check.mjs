// Confere um GLB contra o contrato de peças (docs/v3-modelo-a-mao.md): nomes, pais, pivôs,
// âncoras, materiais com UV, extensões e tamanho. Sai com código 1 se houver erro.
// Uso (na raiz): npm run model:check [-- arquivo.glb]   (padrão: public/models/suntech.glb)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Logger, NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { MeshoptDecoder } from "meshoptimizer";
import { blockedExtensions, checkDocument, glbJson, report } from "./lib/contract.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const file = path.resolve(process.argv[2] ?? path.resolve(here, "../../public/models/suntech.glb"));
const buffer = fs.readFileSync(file);
const json = glbJson(buffer);
const blocked = blockedExtensions(json);
if (blocked.length) {
  for (const msg of blocked) console.log(`  ✗ ${msg}`);
  process.exit(1);
}

await MeshoptDecoder.ready;
const io = new NodeIO().setLogger(new Logger(Logger.Verbosity.ERROR)).registerExtensions(ALL_EXTENSIONS).registerDependencies({ "meshopt.decoder": MeshoptDecoder });
const doc = await io.readBinary(new Uint8Array(buffer));
const compressed = (json.extensionsUsed ?? []).includes("EXT_meshopt_compression");
const result = checkDocument(doc, { stage: compressed ? "saida" : "entrada", bytes: buffer.length, json });
if (!compressed) result.info.push(`arquivo sem compressão (${(buffer.length / 1024).toFixed(0)} KB): para publicar, use npm run model:import.`);
const source = json.extras?.suntech?.source;
if (source) result.info.push(`origem: ${source === "blender" ? "modelo feito à mão (npm run model:import)" : source}`);
process.exit(report(result, `Contrato de peças: ${path.relative(process.cwd(), file) || file}`) ? 0 : 1);
