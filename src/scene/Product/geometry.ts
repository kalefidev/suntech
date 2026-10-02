import { ExtrudeGeometry, Path, Shape, ShapeGeometry } from "three";

/** Contorno de cantos arredondados, centrado na origem (plano XY). */
function roundedRect<T extends Path>(path: T, width: number, height: number, radius: number): T {
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

export interface RoundedSlab {
  /** Medidas finais, já contando o bisel. */
  width: number;
  depth: number;
  height: number;
  /** Raio dos cantos vistos de cima. */
  radius: number;
  /** Bisel das arestas de cima e de baixo. */
  bevel: number;
  /** Abertura no meio (vira um aro: paredes da caixa, moldura do painel). */
  hole?: { width: number; depth: number; radius: number };
  segments?: number;
}

/**
 * Bloco de cantos arredondados e arestas biseladas, com o y para cima, a base
 * em y = 0 e centrado em x e z. Com `hole`, vira um aro (sem tampa nem fundo
 * no meio). O bisel do three cresce para fora do contorno, então o contorno
 * entra para dentro na mesma medida e as medidas finais batem.
 */
export function roundedSlab({ width, depth, height, radius, bevel, hole, segments = 6 }: RoundedSlab) {
  const shape = roundedRect(new Shape(), width - 2 * bevel, depth - 2 * bevel, radius - bevel);
  if (hole) shape.holes.push(roundedRect(new Path(), hole.width + 2 * bevel, hole.depth + 2 * bevel, hole.radius + bevel));
  const geometry = new ExtrudeGeometry(shape, {
    depth: Math.max(1e-4, height - 2 * bevel),
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelOffset: 0,
    bevelSegments: 3,
    curveSegments: segments,
  });
  // Extrusão em +z vira +y; a base vai para y = 0.
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, bevel, 0);
  return geometry;
}

/** Tampa plana de cantos arredondados, virada para cima (ou para baixo). */
export function roundedPlane(width: number, depth: number, radius: number, facing: "up" | "down" = "up") {
  const geometry = new ShapeGeometry(roundedRect(new Shape(), width, depth, radius), 6);
  geometry.rotateX(facing === "up" ? -Math.PI / 2 : Math.PI / 2);
  return geometry;
}
