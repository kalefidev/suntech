// GLTFExporter do three rodando no Node: o exportador usa `FileReader` e `Blob`
// (do navegador). O Node tem `Blob`; o `FileReader` é um adaptador mínimo.
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";

class NodeFileReader {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((buffer) => {
      this.result = buffer;
      this.onloadend?.();
      this.onload?.();
    });
  }
  readAsDataURL(blob) {
    blob.arrayBuffer().then((buffer) => {
      this.result = `data:${blob.type || "application/octet-stream"};base64,${Buffer.from(buffer).toString("base64")}`;
      this.onloadend?.();
      this.onload?.();
    });
  }
}
globalThis.FileReader ??= NodeFileReader;

/** Exporta uma cena do three para GLB (ArrayBuffer), sem texturas. */
export function exportGLB(scene) {
  return new Promise((resolve, reject) => {
    new GLTFExporter().parse(scene, (result) => resolve(result), reject, { binary: true, onlyVisible: false, includeCustomExtensions: false });
  });
}
