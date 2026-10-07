// Uma peça do contrato = um nó nomeado com UMA malha (uma primitiva por material) e,
// se preciso, filhos (outras peças ou âncoras). O pivô é a origem do nó.
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { THREE, merge } from "./geom.mjs";
import { M } from "./mat.mjs";

export class Part {
  /** @param {string} name nome do contrato (ou da âncora) */
  constructor(name, { pos = [0, 0, 0], rot = [0, 0, 0] } = {}) {
    this.name = name;
    this.pos = pos;
    this.rot = rot;
    this.entries = new Map(); // nome do material → geometrias
    this.children = [];
  }

  /** Soma uma geometria já posicionada no espaço local da peça. */
  add(geometry, material) {
    if (!this.entries.has(material)) this.entries.set(material, []);
    this.entries.get(material).push(geometry);
    return this;
  }

  child(part) {
    this.children.push(part);
    return part;
  }

  build() {
    // O nó da peça (pivô, escala 1) é um Group; a malha vai num filho `<peça>_mesh`. Assim a
    // quantização do meshopt, que escreve escala e deslocamento no nó da malha, não encosta
    // no nó da peça, que o runtime move e gira.
    const node = new THREE.Group();
    if (this.entries.size > 0) {
      const names = [...this.entries.keys()];
      const perMaterial = [...this.entries.values()].map((list) => merge(list));
      const geometry = perMaterial.length === 1 ? perMaterial[0] : mergeGeometries(perMaterial, true);
      const mesh = new THREE.Mesh(geometry, names.length === 1 ? M(names[0]) : names.map((n) => M(n)));
      mesh.name = `${this.name}_mesh`;
      node.add(mesh);
    }
    node.name = this.name;
    node.position.set(...this.pos);
    node.rotation.set(...this.rot.map((d) => (d * Math.PI) / 180));
    for (const child of this.children) node.add(child.build());
    return node;
  }
}

/** Âncora vazia (ponto de referência para o runtime). */
export const anchor = (name, pos = [0, 0, 0], rot = [0, 0, 0]) => new Part(name, { pos, rot });
