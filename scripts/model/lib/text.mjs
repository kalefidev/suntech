// Letras em relevo (o nome SunTech na tampa e no painel): os contornos da própria Archivo variável do
// site (largura 125%, peso 800), extrudados com bisel. O WOFF2 vira TTF com o wawoff2 e o fontkit aplica
// os eixos; sem fonte externa e sem rede.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as fontkit from "fontkit";
import wawoff2 from "wawoff2";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { THREE, crease, plain } from "./geom.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const FONT = path.resolve(here, "../../../node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2");

let cached = null;
async function loadFont() {
  if (cached) return cached;
  const ttf = Buffer.from(await wawoff2.decompress(fs.readFileSync(FONT)));
  const base = fontkit.create(ttf);
  cached = { base, face: base.getVariation({ wght: 800, wdth: 125 }) };
  return cached;
}

/**
 * Geometria do texto deitada no plano XZ (a letra "para cima" vai para −z, a extrusão para +y), com a
 * base em y = 0 e centrada em x e z. `capHeight` em unidades da cena (a altura das maiúsculas).
 */
export async function textGeometry(text, { capHeight, depth, bevel = depth * 0.22, tracking = -0.012, bevelSegments = 2, curveSegments = 5 }) {
  const { base, face } = await loadFont();
  const scale = capHeight / base.capHeight;
  const pieces = [];
  let pen = 0;
  for (const glyph of base.glyphsForString(text)) {
    const g = face.getGlyph(glyph.id);
    const sp = new THREE.ShapePath();
    for (const c of g.path.commands) {
      const a = c.args;
      if (c.command === "moveTo") sp.moveTo(a[0], a[1]);
      else if (c.command === "lineTo") sp.lineTo(a[0], a[1]);
      else if (c.command === "quadraticCurveTo") sp.quadraticCurveTo(a[0], a[1], a[2], a[3]);
      else if (c.command === "bezierCurveTo") sp.bezierCurveTo(a[0], a[1], a[2], a[3], a[4], a[5]);
    }
    for (const shape of sp.toShapes()) {
      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: depth / scale,
        bevelEnabled: true,
        bevelThickness: bevel / scale,
        bevelSize: bevel / scale,
        bevelSegments,
        curveSegments,
      });
      geometry.translate(pen, 0, 0);
      pieces.push(plain(geometry));
    }
    pen += g.advanceWidth + tracking * base.unitsPerEm;
  }
  const merged = mergeGeometries(pieces);
  merged.scale(scale, scale, scale);
  merged.computeBoundingBox();
  const box = merged.boundingBox;
  merged.translate(-(box.min.x + box.max.x) / 2, -(box.min.y + box.max.y) / 2, 0);
  // Plano XY (extrusão em z) → plano XZ (extrusão em y): y vira −z, z vira y.
  merged.rotateX(-Math.PI / 2);
  merged.computeBoundingBox();
  merged.translate(0, -merged.boundingBox.min.y, 0);
  return crease(merged, 38);
}
