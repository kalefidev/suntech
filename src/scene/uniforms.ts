/**
 * Uniforms compartilhados pelos materiais do produto (CSM). A luz escreve a
 * irradiância; o produto escreve o reflexo da abertura e a carga da bateria.
 */
export const productUniforms = {
  /** 0 a 1: quanto sol bate nas células (daylight.ts). */
  uIrradiance: { value: 0 },
  /** 0 a 1: posição do reflexo que corre pelas células na abertura. */
  uGlint: { value: 0 },
};
