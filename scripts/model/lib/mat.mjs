// Materiais nomeados do GLB. O runtime troca os especiais por nome (LED, vidro, tela,
// células e a etiqueta da bateria); os demais valem como estão, então o GLB já se
// mostra decente num visualizador qualquer.
import * as THREE from "three";

const cache = new Map();

function define(name, { color, roughness = 0.5, metalness = 0, emissive, emissiveIntensity = 1, opacity = 1 }) {
  const m = new THREE.MeshStandardMaterial({ name, color, roughness, metalness, side: THREE.FrontSide });
  if (emissive) {
    m.emissive = new THREE.Color(emissive);
    m.emissiveIntensity = emissiveIntensity;
  }
  if (opacity < 1) {
    m.transparent = true;
    m.opacity = opacity;
  }
  cache.set(name, m);
  return m;
}

// Caixa e plásticos
define("case_matte", { color: "#17181B", roughness: 0.55 });
define("case_inside", { color: "#1B1D21", roughness: 0.7 });
define("rubber", { color: "#0C0D0F", roughness: 0.92 });
define("black_plastic", { color: "#0F1012", roughness: 0.45 });
define("hole", { color: "#050506", roughness: 1 });
// Metais
define("steel", { color: "#B9BEC4", roughness: 0.26, metalness: 1 });
define("steel_dark", { color: "#6F757D", roughness: 0.4, metalness: 1 });
define("anodized", { color: "#2B2F36", roughness: 0.34, metalness: 1 });
define("aluminum", { color: "#C9CDD2", roughness: 0.3, metalness: 1 });
define("gold", { color: "#D6B05A", roughness: 0.28, metalness: 1 });
define("solder", { color: "#B8BCC2", roughness: 0.4, metalness: 1 });
define("copper", { color: "#B87333", roughness: 0.35, metalness: 1 });
// Painel
define("cells", { color: "#1A2A4C", roughness: 0.32, metalness: 0.2 });
define("backsheet", { color: "#1C1F25", roughness: 0.62 });
define("glass", { color: "#FFFFFF", roughness: 0.04, opacity: 0.18 });
// Placas
define("pcb_charge_top", { color: "#1C4C8C", roughness: 0.5 });
define("pcb_boost_top", { color: "#1A1D22", roughness: 0.5 });
define("pcb_edge_blue", { color: "#173F75", roughness: 0.55 });
define("pcb_edge_black", { color: "#15181C", roughness: 0.55 });
define("chip", { color: "#0A0B0D", roughness: 0.5 });
define("resistor", { color: "#1A1A1A", roughness: 0.6 });
define("capacitor", { color: "#7A6A4F", roughness: 0.55 });
define("inductor", { color: "#16171A", roughness: 0.4 });
// Células 18650
define("cell_wrap", { color: "#6E2A27", roughness: 0.42 });
define("cell_ring", { color: "#E9E4DA", roughness: 0.5 });
define("holder", { color: "#0F1012", roughness: 0.5 });
// Fios
define("wire_red", { color: "#B4261E", roughness: 0.45 });
define("wire_black", { color: "#17181B", roughness: 0.5 });
// LED (o runtime acende o emissivo)
define("led_core", { color: "#0B2230", roughness: 0.3, emissive: "#4CC9F0", emissiveIntensity: 0 });
define("led_lens", { color: "#CFEFFF", roughness: 0.08, opacity: 0.42 });
define("led_red", { color: "#7A1A14", roughness: 0.3, emissive: "#D9372E", emissiveIntensity: 0 });
define("led_green", { color: "#14504A", roughness: 0.3, emissive: "#3DDC97", emissiveIntensity: 0 });
// Logo da tampa (letras em relevo)
define("logo_metal", { color: "#B9BEC4", roughness: 0.28, metalness: 1 });
define("print_gray", { color: "#8E949D", roughness: 0.42, metalness: 0.15 });
// Celular
define("phone_body", { color: "#1B1E24", roughness: 0.38, metalness: 0.25 });
define("phone_screen", { color: "#05070A", roughness: 0.12, emissive: "#FFFFFF", emissiveIntensity: 0 });
define("phone_glass", { color: "#0A0C10", roughness: 0.05 });
define("phone_lens", { color: "#0B0D12", roughness: 0.08, metalness: 0.4 });

export function M(name) {
  const m = cache.get(name);
  if (!m) throw new Error(`Material "${name}" não existe em lib/mat.mjs`);
  return m;
}

export const allMaterials = () => [...cache.values()];
