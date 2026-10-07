// Mostra a hierarquia do GLB (nomes, transformações e primitivas) para conferir o contrato de peças.
// Uso: node inspect.mjs [arquivo.glb]   (padrão: public/models/suntech.glb)
import path from "node:path";
import { fileURLToPath } from "node:url";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { MeshoptDecoder } from "meshoptimizer";

const here = path.dirname(fileURLToPath(import.meta.url));
const file = process.argv[2] ?? path.resolve(here, "../../public/models/suntech.glb");
await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ "meshopt.decoder": MeshoptDecoder });
const doc = await io.read(file);
const f = (v) => v.map((x) => +x.toFixed(4)).join(",");
function walk(node, depth) {
  const mesh = node.getMesh();
  const identity = node.getScale().every((s) => Math.abs(s - 1) < 1e-6);
  console.log(
    `${"  ".repeat(depth)}${node.getName() || "(sem nome)"}  t[${f(node.getTranslation())}] r[${f(node.getRotation())}]${identity ? "" : ` s[${f(node.getScale())}]`}${mesh ? `  malha ${mesh.getName()} (${mesh.listPrimitives().length} prim.)` : ""}`,
  );
  node.listChildren().forEach((c) => walk(c, depth + 1));
}
doc.getRoot().listScenes()[0].listChildren().forEach((n) => walk(n, 0));
console.log("materiais:", doc.getRoot().listMaterials().map((m) => m.getName()).join(", "));
console.log("extensões:", doc.getRoot().listExtensionsUsed().map((e) => e.extensionName).join(", "));
