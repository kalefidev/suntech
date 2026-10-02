import { useRef } from "react";
import { copy } from "../content/copy";
import { parts } from "../content/product";
import { usePinnedStage } from "../lib/stage";
import { registerCallout } from "../lib/callouts";

/**
 * Cena "Por dentro" (pin; do nascer ao meio-dia). 0–18%: travessia sem texto,
 * enquanto o sol nasce e a câmera chega à caixa. Depois, o título e a lista das
 * peças, que é também a versão acessível dos callouts do 3D: a cena marca a
 * peça que acabou de se separar. Só opacidade: o leitor de tela continua
 * lendo tudo.
 */
export function Inside() {
  const ref = useRef<HTMLElement>(null);
  usePinnedStage(ref, {
    length: { wide: 250, narrow: 175 },
    build: (tl) => {
      tl.fromTo("[data-stage-text]", { opacity: 0 }, { opacity: 1, duration: 0.05 }, 0.19);
    },
  });

  return (
    <section
      ref={ref}
      id="por-dentro"
      data-section="por-dentro"
      data-part="3"
      aria-labelledby="por-dentro-titulo"
      className="stage page-x"
    >
      <div className="stage__text col-narrow" data-stage-text>
        <h3 id="por-dentro-titulo" className="type-h2">
          {copy.solucao.insideTitle}
        </h3>
        <ol className="parts-list">
          {parts.map((p, i) => (
            <li key={p.id} data-part-id={p.id} data-active="0" ref={(element) => registerCallout(p.id, "item", element)}>
              <span className="num parts-list__n">{i + 1}</span>
              <span>
                <strong className="parts-list__name">{p.name}</strong>
                <span className="parts-list__role">{p.role}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
