import { MeshPhysicalMaterial, MeshStandardMaterial } from "three";
import type { ProductTextures } from "./textures";

/**
 * Materiais da receita de estúdio (docs/fase-0.md, item 6). Criados uma vez
 * e compartilhados por todas as peças: o canvas vive a visita inteira.
 */
export function createMaterials(textures: ProductTextures) {
  // Caixa: preto fosco com um verniz leve, para a borda pegar o brilho.
  const caseMatte = new MeshPhysicalMaterial({
    color: "#141518",
    roughness: 0.55,
    metalness: 0,
    clearcoat: 0.25,
    clearcoatRoughness: 0.4,
  });

  // "SunTech" em baixo-relevo: o mesmo material, com o mapa de normais.
  const logo = caseMatte.clone();
  logo.normalMap = textures.logo;
  logo.polygonOffset = true;
  logo.polygonOffsetFactor = -2;
  logo.polygonOffsetUnits = -2;

  return {
    caseMatte,
    logo,
    // Interior da caixa: o mesmo preto, sem verniz.
    caseInside: new MeshStandardMaterial({ color: "#1B1D21", roughness: 0.7 }),
    // Moldura do painel: alumínio anodizado escuro.
    anodized: new MeshStandardMaterial({ color: "#2B2F36", metalness: 1, roughness: 0.34 }),
    // Parafusos, carcaças das portas, pinos da dobradiça.
    steel: new MeshStandardMaterial({ color: "#B9BEC4", metalness: 1, roughness: 0.26 }),
    rubber: new MeshStandardMaterial({ color: "#0C0D0F", roughness: 0.92 }),
    hole: new MeshStandardMaterial({ color: "#050506", roughness: 1 }),
    // Fundo do painel e caixa de junção.
    backsheet: new MeshStandardMaterial({ color: "#1C1F25", roughness: 0.62 }),
    plastic: new MeshStandardMaterial({ color: "#0F1012", roughness: 0.45 }),
    tongue: new MeshStandardMaterial({ color: "#1E2228", roughness: 0.5 }),
    // Cabos (PVC preto).
    cable: new MeshStandardMaterial({ color: "#121316", roughness: 0.5 }),
    // LED azul de saída: a intensidade vem de `ledOn`.
    led: new MeshStandardMaterial({ color: "#0B2230", emissive: "#4CC9F0", emissiveIntensity: 0, roughness: 0.2 }),
    // Lente do LED: transparente e lisa, sem `transmission`.
    lens: new MeshPhysicalMaterial({
      color: "#CFEFFF",
      roughness: 0.05,
      transparent: true,
      opacity: 0.35,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
    }),
  };
}

export type Materials = ReturnType<typeof createMaterials>;
