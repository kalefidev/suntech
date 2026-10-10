// Contrato do GLB do SunTech (docs/v3-modelo-a-mao.md): o que o site precisa para animar o
// modelo pelo nome. Usado por check.mjs (confere qualquer GLB) e import.mjs (modelo do Blender).
// Pose de repouso de referência = o molde (`.cache/suntech.raw.glb`), em unidades do GLB (1 = 100 mm).
import { getBounds } from "@gltf-transform/functions";

/** Teto do GLB publicado (CLAUDE.md, Ativos 3D). */
export const BUDGET = 1.5 * 1024 * 1024;

/**
 * Nós do contrato. `part`: o site move/gira o nó (tem de ser um Empty, com a malha como filha).
 * `pivot`: nó vazio que o site move (o painel). `anchor`: ponto de referência (cabo do celular).
 * `rest`: rotação de repouso obrigatória, porque o site escreve a rotação dessas peças por inteiro.
 */
export const NODES = {
  suntech: { parent: null, t: [0, 0, 0] },
  case: { parent: "suntech", t: [0, 0, 0.55] },
  case_base: { parent: "case", t: [0, 0, 0], part: true },
  case_lid: { parent: "case", t: [0, 0.356, -0.515], part: true, rest: [0, 0, 0, 1], why: "a tampa abre 110° na dobradiça" },
  cell_holder: { parent: "case", t: [-0.32, 0.05, -0.18], part: true },
  cell_a: { parent: "cell_holder", t: [0, 0.104, -0.0975], part: true },
  cell_b: { parent: "cell_holder", t: [0, 0.104, 0.0975], part: true },
  pcb_charge: { parent: "case", t: [0.12, 0.1505, 0.335], r: [0, 0.7071068, 0, 0.7071068], part: true },
  pcb_boost: { parent: "case", t: [0.42, 0.13775, 0.33], r: [0, 0.7071068, 0, 0.7071068], part: true },
  usb_port: { parent: "pcb_boost", t: [-0.085, 0.03675, 0.02], part: true },
  led: { parent: "pcb_boost", t: [-0.128, 0.03675, -0.09], r: [0, 0, 0.7071068, 0.7071068], part: true },
  panel: { parent: "suntech", t: [-1, 0.79, -0.6], pivot: true },
  panel_a: { parent: "panel", t: [0, 0, 0], part: true },
  panel_b: { parent: "panel", t: [0, 0, 0], part: true, rest: [0, 1, 0, 0], why: "a placa B abre como um livro, de 180° a 0° na lombada" },
  phone: { parent: "suntech", t: [1.4, 0.97, 0.62], r: [0, -0.1218693, 0, 0.9925462], part: true },
  usb_a_mouth: { parent: "usb_port", anchor: true, why: "o cabo do celular sai daqui (o eixo +Z local aponta para fora da porta)" },
  phone_connector: { parent: "phone", anchor: true, why: "o cabo entra no celular aqui" },
};

/** Âncoras opcionais: sem elas, a etiqueta usa o centro da peça. */
export const OPTIONAL_ANCHORS = ["label_panel", "label_pcb_charge", "label_pcb_boost", "label_phone", "grommet", "junction", "lid_top"];

/** Materiais que ganham textura desenhada pelo site: precisam de UV. */
export const UV_MATERIALS = {
  cells: "células do painel (panel_a e panel_b)",
  cell_wrap: "capa das células 18650 (a carga sobe de baixo para cima)",
  pcb_charge_top: "face de cima do módulo de carga",
  pcb_boost_top: "face de cima do boost",
  phone_screen: "tela do celular",
};
/** Materiais com efeito no site (acendem num beat). */
export const EFFECT_MATERIALS = {
  led_core: "LED azul de saída (acende em Entregar)",
  led_red: "LED vermelho (acende em Proteger)",
};

/** Nome como o GLTFLoader do three o deixa (PropertyBinding.sanitizeNodeName). */
export const sanitize = (name) => name.replace(/\s/g, "_").replace(/[[\].:/]/g, "");

/** Ângulo entre duas rotações (quatérnios), em graus. */
const angleBetween = (a, b) => {
  const na = Math.hypot(...a) || 1;
  const nb = Math.hypot(...b) || 1;
  const dot = Math.abs(a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]) / (na * nb);
  return (2 * Math.acos(Math.min(1, dot)) * 180) / Math.PI;
};
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const mm = (units) => `${(units * 100).toFixed(1)} mm`;

/** Lê o JSON de um GLB sem decodificar nada (para ver extensões antes de carregar). */
export function glbJson(buffer) {
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  if (view.getUint32(0, true) !== 0x46546c67) throw new Error("não é um .glb (exporte como glTF Binary)");
  const length = view.getUint32(12, true);
  return JSON.parse(new TextDecoder().decode(buffer.subarray(20, 20 + length)));
}

/** Extensões que o site não carrega: Draco (o decoder viria do gstatic) e KTX2 (sem KTX2Loader). */
export function blockedExtensions(json) {
  const used = json.extensionsUsed ?? [];
  const out = [];
  if (used.includes("KHR_draco_mesh_compression")) out.push("Draco: desligue Compression no exportador do Blender (o site usa meshopt; o decoder Draco viria de uma CDN, proibido)");
  if (used.includes("KHR_texture_basisu")) out.push("KTX2: o site não tem KTX2Loader para o GLB; exporte as imagens em WebP (ou PNG/JPEG)");
  return out;
}

/** Triângulos das malhas de um nó, parando nas outras peças (como o `collectMeshes` do site). */
function trianglesOf(node, top = true) {
  if (!top && NODES[node.getName()]?.part) return 0;
  let n = 0;
  const mesh = node.getMesh();
  if (mesh) {
    for (const prim of mesh.listPrimitives()) {
      if (prim.getMode() !== 4) continue;
      const count = prim.getIndices()?.getCount() ?? prim.getAttribute("POSITION")?.getCount() ?? 0;
      n += count / 3;
    }
  }
  for (const child of node.listChildren()) n += trianglesOf(child, false);
  return n;
}

/**
 * Confere o documento contra o contrato. `stage`: "entrada" (export do Blender) ou "saida"
 * (o GLB comprimido, com o teto de tamanho). Devolve { errors, warnings, info }.
 */
export function checkDocument(doc, { stage = "saida", bytes = 0, json = null } = {}) {
  const errors = [];
  const warnings = [];
  const info = [];
  const root = doc.getRoot();
  const nodes = root.listNodes();

  // Nomes: exatos, sem o ".001" do Blender, sem duplicatas depois da limpeza do three.
  const byName = new Map();
  const bySanitized = new Map();
  for (const node of nodes) {
    const name = node.getName();
    if (!byName.has(name)) byName.set(name, []);
    byName.get(name).push(node);
    const clean = sanitize(name);
    if (!bySanitized.has(clean)) bySanitized.set(clean, []);
    bySanitized.get(clean).push(node);
  }

  const found = {};
  for (const [name, spec] of Object.entries(NODES)) {
    const exact = byName.get(name) ?? [];
    if (exact.length > 1) {
      errors.push(`"${name}" aparece ${exact.length} vezes: o site pega só o primeiro. Deixe um nó com esse nome.`);
    }
    if (exact.length === 0) {
      const twin = nodes.find((n) => new RegExp(`^${name}\\.\\d+$`).test(n.getName()));
      const loose = (bySanitized.get(name) ?? [])[0];
      if (twin) errors.push(`falta "${name}", mas existe "${twin.getName()}": renomeie (o Blender põe ".001" em nome repetido; o site procura o nome exato).`);
      else if (loose) {
        warnings.push(`"${loose.getName()}" funciona (o three vira em "${name}"), mas renomeie para "${name}" exato.`);
        found[name] = loose;
      } else errors.push(`falta o nó "${name}"${spec.why ? ` (${spec.why})` : ""}.`);
      continue;
    }
    found[name] = exact[0];
  }

  // Escala: a caixa do molde mede 150 × 38 × 105 mm (com os pés e a dobradiça). Muito fora disso é
  // unidade errada (Unit Scale do Blender diferente de 1: o importador de glTF a aplica e o
  // exportador não, e o modelo sai 10× maior; testado no Blender 5.2), não um ajuste de forma.
  let wrongScale = false;
  if (found.case_base) {
    const { min, max } = getBounds(found.case_base);
    const size = [max[0] - min[0], max[1] - min[1], max[2] - min[2]];
    const ratio = size.map((v, i) => v / [1.5, 0.38, 1.05][i]);
    const worst = ratio.reduce((a, b) => (Math.abs(Math.log(b)) > Math.abs(Math.log(a)) ? b : a), 1);
    if (worst > 1.5 || worst < 0.67) {
      wrongScale = true;
      errors.push(`a caixa mede ${size.map(mm).join(" × ")}, ${worst.toFixed(1)}× o molde (150 × 38 × 105 mm): escala errada. No Blender, Scene Properties → Units → Unit Scale tem de ser 1,000 (use Length em Centimeters só para ler).`);
    } else if (Math.abs(worst - 1) > 0.08) {
      warnings.push(`a caixa mede ${size.map(mm).join(" × ")} (molde: 150 × 38 × 105 mm): a câmera foi enquadrada para o molde; rode o framing.mjs.`);
    }
  }

  for (const [name, spec] of Object.entries(NODES)) {
    const node = found[name];
    if (!node) continue;
    // Hierarquia: os deslocamentos da explosão são no espaço do pai.
    const parent = node.getParentNode();
    const parentName = parent ? sanitize(parent.getName()) : null;
    if (spec.parent && parentName !== spec.parent) {
      errors.push(`"${name}" tem de ser filho de "${spec.parent}" (está em ${parentName ? `"${parentName}"` : "nenhum pai"}).`);
    }
    // Malha no próprio nó: a quantização do meshopt reescreve a posição e a escala desse nó,
    // e o pivô vai para o centro da malha (a tampa abre ~8 cm fora da dobradiça; testado).
    if ((spec.part || spec.pivot) && node.getMesh()) {
      errors.push(`"${name}" tem malha no próprio nó. Faça "${name}" um Empty no pivô e ponha a malha como filha (ex.: "${name}_mesh"): a compressão move o pivô de nó com malha.`);
    }
    if (spec.anchor && node.getMesh()) warnings.push(`a âncora "${name}" tem malha: ela é só um ponto (Empty).`);
    // Pose de repouso.
    const r = node.getRotation();
    if (spec.rest && angleBetween(r, spec.rest) > 1) {
      errors.push(`"${name}" está girado em repouso (${angleBetween(r, spec.rest).toFixed(0)}° fora): ${spec.why}, e o site escreve essa rotação por inteiro. Volte o Empty para a rotação do molde.`);
    } else if (spec.r && angleBetween(r, spec.r) > 1) {
      warnings.push(`"${name}" girou ${angleBetween(r, spec.r).toFixed(0)}° em relação ao molde: confira o enquadramento (framing.mjs).`);
    } else if (!spec.rest && !spec.r && !spec.anchor && angleBetween(r, [0, 0, 0, 1]) > 1) {
      warnings.push(`"${name}" está girado ${angleBetween(r, [0, 0, 0, 1]).toFixed(0)}° (no molde, 0°): confira a explosão e o enquadramento.`);
    }
    if (!wrongScale && spec.t && dist(node.getTranslation(), spec.t) > 0.02) {
      warnings.push(`o pivô de "${name}" andou ${mm(dist(node.getTranslation(), spec.t))} em relação ao molde: a câmera e a explosão foram ajustadas para a posição antiga (rode o framing.mjs; ajuste MOTION em motion.ts).`);
    }
    const s = node.getScale();
    if ((spec.part || spec.pivot) && s.some((v) => Math.abs(v - 1) > 1e-3)) {
      warnings.push(`"${name}" tem escala ${s.map((v) => +v.toFixed(3)).join(" × ")} (Empty escalado): aplique a escala na malha, não no Empty.`);
    }
  }

  for (const name of OPTIONAL_ANCHORS) if (!byName.has(name)) info.push(`âncora opcional "${name}" ausente (vale o centro da peça).`);

  // O site desenha a cena inteira do GLB: nada fora da raiz "suntech".
  for (const top of root.listScenes()[0]?.listChildren() ?? []) {
    if (top.getName() !== "suntech") warnings.push(`"${top.getName() || "(sem nome)"}" está fora da raiz "suntech" e vai aparecer no site: apague ou esconda antes de exportar.`);
  }

  // Sobras de referência exportadas junto (o site pega todas as malhas debaixo da peça) e
  // malhas fora de qualquer peça (não se movem na explosão nem esmaecem no foco).
  for (const node of nodes) {
    const name = node.getName();
    if (!node.getMesh()) continue;
    if (/(_ref|referencia|reference)(\.\d+)?$/i.test(name)) {
      warnings.push(`"${name}" parece uma malha de referência exportada junto: esconda a coleção "referencia" antes de exportar.`);
    }
    let up = node;
    while (up && !(NODES[sanitize(up.getName())]?.part || NODES[sanitize(up.getName())]?.pivot)) up = up.getParentNode();
    if (!up) warnings.push(`a malha "${name || "(sem nome)"}" não está dentro de nenhuma peça: não se move na explosão nem esmaece no foco.`);
  }

  // Materiais: o site troca pelo nome.
  const materials = root.listMaterials();
  const matNames = new Set(materials.map((m) => m.getName()));
  for (const m of materials) {
    const name = m.getName();
    if (/\.\d{3}$/.test(name)) warnings.push(`material "${name}": o ".001" do Blender faz o site não reconhecer o nome "${name.replace(/\.\d{3}$/, "")}".`);
  }
  for (const [name, what] of Object.entries({ ...UV_MATERIALS, ...EFFECT_MATERIALS })) {
    if (!matNames.has(name)) warnings.push(`sem o material "${name}" (${what}): esse efeito não aparece.`);
  }
  for (const node of nodes) {
    for (const prim of node.getMesh()?.listPrimitives() ?? []) {
      const name = prim.getMaterial()?.getName();
      if (!name || !UV_MATERIALS[name]) continue;
      const uv = prim.getAttribute("TEXCOORD_0");
      if (!uv) {
        errors.push(`"${node.getName()}" usa o material "${name}" sem UV: a textura do site (${UV_MATERIALS[name]}) precisa de UV.`);
        continue;
      }
      // A textura do site ocupa o quadrado 0–1 inteiro: UV menor que isso corta o desenho
      // (na capa da célula, a carga começaria no meio).
      let keep = () => true;
      if (name === "cell_wrap") {
        // Capa: conta só a lateral (normal perpendicular ao eixo da célula), por onde a carga sobe.
        const pos = prim.getAttribute("POSITION");
        const nor = prim.getAttribute("NORMAL");
        if (pos && nor) {
          const pmin = pos.getMin([]);
          const pmax = pos.getMax([]);
          const span = [0, 1, 2].map((k) => pmax[k] - pmin[k]);
          const axis = span.indexOf(Math.max(...span));
          const n = [0, 0, 0];
          keep = (i) => {
            nor.getElement(i, n);
            return Math.abs(n[axis]) < 0.3 * (Math.hypot(...n) || 1);
          };
        }
      }
      const lo = [Infinity, Infinity];
      const hi = [-Infinity, -Infinity];
      const el = [0, 0];
      for (let i = 0; i < uv.getCount(); i++) {
        if (!keep(i)) continue;
        uv.getElement(i, el);
        for (const k of [0, 1]) {
          lo[k] = Math.min(lo[k], el[k]);
          hi[k] = Math.max(hi[k], el[k]);
        }
      }
      if (lo[0] > 0.02 || lo[1] > 0.02 || hi[0] < 0.98 || hi[1] < 0.98) {
        // Em V, como o Blender mostra (o glTF conta o V de cima para baixo).
        const range = `U ${lo[0].toFixed(2)}–${hi[0].toFixed(2)}, V ${(1 - hi[1]).toFixed(2)}–${(1 - lo[1]).toFixed(2)}`;
        const hint = name === "cell_wrap" ? " No cilindro padrão do Blender o V da lateral vai de 0,5 a 1: no UV Editor, com a lateral selecionada, S Y 2 e depois G Y -0.25." : " Use U → Reset (uma face) ou Project from View (Bounds).";
        warnings.push(`"${node.getName()}" usa "${name}" com o UV em ${range} (no UV Editor do Blender): o desenho do site ocupa o quadrado 0–1 inteiro e vai sair cortado.${hint}`);
      }
    }
  }

  // Triângulos por peça.
  let total = 0;
  const per = [];
  for (const [name, spec] of Object.entries(NODES)) {
    if (!spec.part || !found[name]) continue;
    const n = Math.round(trianglesOf(found[name]));
    total += n;
    per.push(`${name} ${n.toLocaleString("pt-BR")}`);
  }
  info.push(`triângulos: ${total.toLocaleString("pt-BR")} (${per.join(", ")})`);

  // Texturas.
  for (const texture of root.listTextures()) {
    const image = texture.getImage();
    const kb = image ? image.byteLength / 1024 : 0;
    const label = `${texture.getName() || texture.getURI() || "(sem nome)"} ${texture.getMimeType()} ${kb.toFixed(0)} KB`;
    if (kb > 1024) warnings.push(`textura pesada: ${label} (reduza para 1K ou 2K e exporte em WebP).`);
    else info.push(`textura: ${label}`);
  }

  // Extensões e tamanho.
  if (json) for (const msg of blockedExtensions(json)) errors.push(msg);
  if (stage === "saida") {
    if (bytes > BUDGET) errors.push(`o GLB tem ${(bytes / 1024).toFixed(0)} KB, acima do teto de ${BUDGET / 1024} KB (menos segmentos de chanfro, apagar faces escondidas, Decimate nas peças pequenas, texturas menores).`);
    else info.push(`tamanho: ${(bytes / 1024).toFixed(0)} KB (teto ${BUDGET / 1024} KB).`);
  }

  return { errors, warnings, info };
}

/** Imprime o resultado e devolve true se não houver erro. */
export function report({ errors, warnings, info }, title) {
  console.log(`\n${title}`);
  for (const line of info) console.log(`  · ${line}`);
  for (const line of warnings) console.log(`  ! ${line}`);
  for (const line of errors) console.log(`  ✗ ${line}`);
  console.log(errors.length ? `\n${errors.length} erro(s): o site não vai animar direito com este arquivo.` : `\nContrato ok${warnings.length ? ` (${warnings.length} aviso(s))` : ""}.`);
  return errors.length === 0;
}
