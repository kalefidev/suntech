import { useRef } from "react";
import { copy } from "../content/copy";
import { usePinnedStage } from "../lib/stage";

const t = copy.solucao;

/**
 * Cena "A energia fica" (pin; do pôr do sol ao nascer do dia seguinte).
 * 0–30%: travessia sem texto, enquanto o esquema se recolhe e o sol se põe.
 * 30–68%: o texto da noite. 70–84%: "Amanhã…", enquanto a noite passa.
 * 84–100%: travessia sem texto, com o sol do dia seguinte nascendo.
 * Só opacidade: o leitor de tela continua lendo tudo.
 */
export function EnergyStays() {
  const ref = useRef<HTMLElement>(null);
  usePinnedStage(ref, {
    length: { wide: 200, narrow: 140 },
    build: (tl) => {
      tl.fromTo("[data-stage-text]", { opacity: 0 }, { opacity: 1, duration: 0.04 }, 0.3)
        .to("[data-stage-text]", { opacity: 0, duration: 0.03 }, 0.66)
        .fromTo("[data-tomorrow]", { opacity: 0 }, { opacity: 1, duration: 0.04 }, 0.7)
        .to("[data-tomorrow]", { opacity: 0, duration: 0.03 }, 0.81);
    },
  });

  return (
    <section
      ref={ref}
      id="energia-fica"
      data-section="energia-fica"
      data-part="3"
      aria-labelledby="energia-fica-titulo"
      className="stage page-x"
    >
      <div className="stage__swap col-narrow">
        <div className="stage__text" data-stage-text>
          <h3 id="energia-fica-titulo" className="type-h2">
            {t.staysTitle.map((sentence, i) => (
              <span key={sentence} className="block">
                {i > 0 && " "}
                {sentence}
              </span>
            ))}
          </h3>
          <p className="type-lead mt-8">{t.staysText}</p>
          <p className="type-caption mt-4">{t.staysNote}</p>
        </div>
        <p className="type-h2 stage__tomorrow" data-tomorrow>
          {t.tomorrow}
        </p>
      </div>
    </section>
  );
}
