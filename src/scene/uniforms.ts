/**
 * Uniforms compartilhados pelos materiais do produto (CSM). O modelo escreve o
 * brilho que corre pelas células quando o painel abre e a carga das células.
 */
export const productUniforms = {
  /** 0 a 1: posição do reflexo que corre pelas células quando o painel abre. */
  uGlint: { value: 0 },
  /** 0 a 1: carga visível das células (`charge`). */
  uCharge: { value: 0 },
};
