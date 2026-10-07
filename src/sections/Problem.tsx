import { copy } from "../content/copy";
import { facts, partsOfFair } from "../content/feira";
import { ChapterOpener } from "./ChapterOpener";
import { Fact } from "./Fact";
import { Highlight } from "./Highlight";
import { PART_TONE } from "../scene/choreography";

const part = partsOfFair[0];
const t = copy.problema;

/**
 * Parte 1: O problema (Aula 2). O céu fecha e escurece até a noite. Depois que
 * o produto some na tempestade, o texto usa a largura toda no desktop: as
 * oportunidades e as três respostas se abrem em colunas, a situação-problema
 * vira o destaque, e os dados com fonte ficam à direita do porquê.
 */
export function Problem() {
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
      <p className="type-lead part__intro col-text">{t.opening}</p>

      <div className="part-block col-wide">
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

      <div className="part-block col-wide">
        <h3 className="type-quote question">{t.question}</h3>
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

      <Highlight id="situacao-problema" text={t.situation} caption={t.situationCaption} />

      {/* A ordem do brief fica no DOM (acesso, dados, energia limpa); no
          desktop, os dados vão para a coluna da direita. */}
      <div className="part-block part-block--last col-wide why">
        <h3 className="type-h3 why__title">{t.whyTitle}</h3>
        <p className="type-body why__access">{t.whyAccess}</p>
        <div className="why__facts">
          <Fact fact={facts.semEnergia} />
          <Fact fact={facts.apagaoAmapa} />
        </div>
        <p className="type-body why__clean">{t.whyClean}</p>
      </div>
    </section>
  );
}
