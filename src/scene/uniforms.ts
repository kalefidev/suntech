/**
 * Uniforms compartilhados pelos materiais do produto (CSM). A luz escreve a
 * irradiância; o produto escreve o reflexo da abertura e a carga da bateria.
 */
export const productUniforms = {
  /** 0 a 1: quanto sol bate nas células (daylight.ts). */
  uIrradiance: { value: 0 },
  /** 0 a 1: posição do reflexo que corre pelas células na abertura. */
  uGlint: { value: 0 },
  /** 0 a 1: carga visível da bateria (`batteryCharge`). */
  uCharge: { value: 0 },
  /** 0 a 1: luz dos fótons nas células (etapa 1 de "Como funciona"). */
  uLight: { value: 0 },
};
