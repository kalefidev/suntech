import { copy } from "../content/copy";
import { facts, partsOfFair } from "../content/feira";
import { ChapterOpener } from "./ChapterOpener";
import { Fact } from "./Fact";
import { PART_TONE } from "../scene/choreography";

const part = partsOfFair[2];
const t = copy.solucao;

/**
 * Parte 3 (Aula 4), primeiro trecho: abertura do capítulo, a caça ao
 * diferencial (d.light, antes da solução, na ordem do slide) e a introdução da
 * nossa solução, que leva direto às três cenas presas.
 */
export function Solution() {
  return (
    <section
      id={part.id}
      data-section={part.id}
      data-field={PART_TONE[part.id]}
      data-part={part.n}
      aria-labelledby={`${part.id}-titulo`}
      className="part page-x"
    >
      <ChapterOpener part={part} />

      <div className="part-block col-text">
        <h3 className="type-h3">{t.dlightTitle}</h3>
        <p className="type-body mt-4">{t.dlightWhy}</p>
        <dl className="qa">
          {t.dlight.map((item, i) => (
            <div key={item.q} className="qa__row">
              <dt className="type-label qa__q">{item.q}</dt>
              <dd className="type-body qa__a">
                {item.a}
                {i === t.dlight.length - 1 && <Fact fact={facts.dlightAlcance} className="mt-6" />}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="part-block part-block--last col-text">
        <h3 className="type-h2">{t.solutionTitle}</h3>
        <p className="type-lead mt-8">{t.solution}</p>
      </div>
    </section>
  );
}
