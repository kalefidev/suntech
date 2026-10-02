import { useRef } from "react";
import { copy } from "../content/copy";
import { partsOfFair } from "../content/feira";
import { useLineReveal } from "../lib/reveal";
import { useMagnetic } from "../lib/magnetic";
import { startPitch } from "../lib/pitch";
import { ChapterOpener } from "./ChapterOpener";

const part = partsOfFair[5];
const t = copy.jovem;

/** Um parágrafo do manifesto: as linhas sobem da máscara quando ele entra (o texto continua inteiro no DOM). */
function ManifestoParagraph({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useLineReveal(ref, { aria: "none", stagger: 0.06 });
  return (
    <p ref={ref} className="type-lead">
      {text}
    </p>
  );
}

/**
 * Parte 6: O jovem empreendedor (AQ3). Fim de tarde dourado; o produto gira
 * uma última vez. O manifesto se revela por linhas, e o final traz o slogan e
 * o botão magnético que inicia o modo pitch.
 */
export function Youth() {
  const ctaRef = useRef<HTMLButtonElement>(null);
  useMagnetic(ctaRef);

  return (
    <section
      id={part.id}
      data-section={part.id}
      data-part={part.n}
      aria-labelledby={`${part.id}-titulo`}
      className="part page-x"
    >
      <ChapterOpener part={part} />

      <div className="part-block manifesto col-text">
        {t.manifesto.map((paragraph) => (
          <ManifestoParagraph key={paragraph} text={paragraph} />
        ))}
      </div>

      <div className="part-block part-block--last final col-text">
        <p className="type-h2 final__slogan">{t.slogan}</p>
        <button ref={ctaRef} type="button" className="btn-cta final__cta" onClick={(event) => startPitch(event.currentTarget)}>
          {t.cta}
        </button>
      </div>
    </section>
  );
}
