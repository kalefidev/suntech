import { conversionLabel, energyPath } from "../content/product";
import { registerStep, stepLayer } from "../lib/steps";

/**
 * Etiquetas das 4 etapas no esquema de "Como funciona" (docs/fase-0.md, M3):
 * aparecem numeradas e legendadas, apagadas, assim que o esquema se forma, e
 * acendem em sequência. Mais o "3,7 V → 5 V" no conversor, na etapa 4. A cena
 * 3D move cada uma até o seu trecho do esquema. Decorativas para o leitor de
 * tela: a lista da seção é a versão acessível.
 */
export function StepLayer() {
  return (
    <div
      ref={(element) => {
        stepLayer.element = element;
      }}
      className="steps-layer"
      aria-hidden="true"
      data-visible="0"
    >
      {energyPath.map((step) => (
        <div
          key={step.id}
          ref={(element) => registerStep(step.id, "label", element)}
          className="step-tag"
          data-state="off"
          style={{ "--step-color": `var(--color-${step.color})` } as React.CSSProperties}
        >
          <span className="step-tag__n num">{step.n}</span>
          <span className="step-tag__title">{step.title}</span>
        </div>
      ))}
      <div ref={(element) => registerStep("conversion", "label", element)} className="step-tag step-tag--volts" data-state="off">
        <span className="num">{conversionLabel.from}</span>
        <svg viewBox="0 0 24 12" className="step-tag__arrow">
          <path d="M1 6 H19 M15 2 L21 6 L15 10" />
        </svg>
        <span className="num">{conversionLabel.to}</span>
      </div>
    </div>
  );
}
