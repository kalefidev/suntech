import { useRef } from "react";
import { copy } from "../content/copy";
import { energyPath } from "../content/product";
import { usePinnedStage } from "../lib/stage";
import { registerStep } from "../lib/steps";
import { EnergyDiagram } from "./EnergyDiagram";

/**
 * Cena "Como funciona" (pin; do meio-dia às 17h). A lista ordenada com as
 * quatro etapas está sempre no DOM: é o que o leitor de tela lê, já que o
 * esquema 3D não é lido (seção 10 do brief).
 */
export function HowItWorks() {
  const ref = useRef<HTMLElement>(null);
  usePinnedStage(ref, { length: { wide: 350, narrow: 245 } });

  return (
    <section
      ref={ref}
      id="como-funciona"
      data-section="como-funciona"
      data-part="3"
      aria-labelledby="como-funciona-titulo"
      className="stage page-x"
    >
      <div className="stage__text col-narrow" data-stage-text>
        <h3 id="como-funciona-titulo" className="type-h2">
          {copy.solucao.howTitle}
        </h3>
        <ol className="steps">
          {energyPath.map((s) => (
            <li
              key={s.id}
              className="steps__item"
              data-step={s.id}
              data-active="0"
              ref={(element) => registerStep(s.id, "item", element)}
            >
              <h4 className="type-h3 steps__title">
                <span className="num">{s.n}</span> {s.title}
              </h4>
              <p className="type-body steps__text">{s.text}</p>
            </li>
          ))}
        </ol>
        <EnergyDiagram />
        <div className="legend">
          <p className="type-caption legend__title">{copy.solucao.howLegendTitle}</p>
          <ul>
            {energyPath.map((s) => (
              <li key={s.id} className="type-caption">
                <span className="legend__swatch" style={{ background: `var(--color-${s.color})` }} aria-hidden="true" />
                {s.legend}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
