import { copy } from "../content/copy";
import { partsOfFair } from "../content/feira";
import { ChapterOpener } from "./ChapterOpener";

const part = partsOfFair[5];
const t = copy.jovem;

/** Parte 6: O jovem empreendedor (AQ3). Fim de tarde dourado; último giro do produto. */
export function Youth() {
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
          <p key={paragraph} className="type-lead">
            {paragraph}
          </p>
        ))}
      </div>

      <div className="part-block part-block--last final col-text">
        <p className="type-h2 final__slogan">{t.slogan}</p>
      </div>
    </section>
  );
}
