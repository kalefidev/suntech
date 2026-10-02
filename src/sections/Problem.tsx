import { copy } from "../content/copy";
import { facts, partsOfFair } from "../content/feira";
import { ChapterOpener } from "./ChapterOpener";
import { Fact } from "./Fact";

const part = partsOfFair[0];
const t = copy.problema;

/** Parte 1: O problema (Aula 2). O céu fecha e escurece até a noite. */
export function Problem() {
  return (
    <section
      id={part.id}
      data-section={part.id}
      data-part={part.n}
      aria-labelledby={`${part.id}-titulo`}
      className="part page-x"
    >
      <ChapterOpener part={part} />
      <p className="type-lead part__intro col-text">{t.opening}</p>

      <div className="part-block col-text">
        <h3 className="type-h3">{t.opportunitiesTitle}</h3>
        <div className="groups">
          {t.opportunities.map((group, i) => (
            <div key={group.group} className="groups__row" data-offset={i % 2 === 1 || undefined}>
              <h4 className="type-label groups__name">{group.group}</h4>
              <ul className="type-body groups__items">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="part-block col-text">
        <h3 className="type-quote">{t.question}</h3>
        <p className="type-caption mt-3">{t.questionCaption}</p>
        <ol className="triad">
          {t.problems.map((problem, i) => (
            <li key={problem} className="triad__item">
              <span className="type-label num">{i + 1}</span>
              <p className="type-body">{problem}</p>
            </li>
          ))}
        </ol>
      </div>

      <figure id="situacao-problema" className="part-block highlight col-text">
        <blockquote className="type-quote">{t.situation}</blockquote>
        <figcaption className="type-caption highlight__caption">{t.situationCaption}</figcaption>
      </figure>

      <div className="part-block col-text">
        <h3 className="type-h3">{t.whyTitle}</h3>
        <p className="type-body mt-6">{t.whyAccess}</p>
        <Fact fact={facts.semEnergia} className="mt-12" />
        <Fact fact={facts.apagaoAmapa} className="mt-10" />
        <p className="type-body mt-12">{t.whyClean}</p>
      </div>
    </section>
  );
}
