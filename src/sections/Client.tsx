import { copy } from "../content/copy";
import { num } from "../content/format";
import { partsOfFair } from "../content/feira";
import { ChapterOpener } from "./ChapterOpener";

const part = partsOfFair[1];
const t = copy.cliente;
const p = t.persona;

/** Distância sítio–cidade: informação da persona, desenhada (DrawSVG na Fase 3). */
function Distance() {
  return (
    <figure className="distance" aria-label={`${p.farm} a ${num(p.distanceKm)} km da ${p.city.toLowerCase()}`}>
      <svg viewBox="0 0 400 24" preserveAspectRatio="none" aria-hidden="true" className="distance__line">
        <circle cx="6" cy="12" r="5" />
        <line x1="14" y1="12" x2="386" y2="12" />
        <circle cx="394" cy="12" r="5" />
      </svg>
      <figcaption className="type-caption distance__labels" aria-hidden="true">
        <span>{p.farm}</span>
        <span className="num">{num(p.distanceKm)}&nbsp;km</span>
        <span>{p.city}</span>
      </figcaption>
    </figure>
  );
}

/** Parte 2: O cliente (Aula 3). Noite depois da tempestade. */
export function Client() {
  return (
    <section
      id={part.id}
      data-section={part.id}
      data-part={part.n}
      aria-labelledby={`${part.id}-titulo`}
      className="part page-x"
    >
      <ChapterOpener part={part} />

      <div id="persona" className="part-block persona col-text">
        <span className="persona__monogram" aria-hidden="true">
          {p.initials}
        </span>
        <div className="persona__body">
          <h3 className="type-quote">
            {t.personaTitle}: {p.name}
          </h3>
          <p className="type-lead mt-3">
            {p.age}, {p.role}.
          </p>
          <Distance />
          <ul className="type-body persona__facts">
            {p.facts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        </div>
      </div>

      <figure className="part-block highlight col-text">
        <blockquote className="type-quote">{t.synthesis}</blockquote>
        <figcaption className="type-caption highlight__caption">{t.synthesisCaption}</figcaption>
      </figure>

      <div className="part-block col-text">
        <h3 className="type-h3">{t.reflectionTitle}</h3>
        <ol className="qa">
          {t.reflection.map((item, i) => (
            <li key={item.q} className="qa__row">
              <h4 className="type-label qa__q">
                <span className="num">{i + 1}</span> {item.q}
              </h4>
              <p className="type-body qa__a">{item.a}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="part-block col-text">
        <div className="split">
          <div className="split__col">
            <h3 className="type-h3">{t.personaLabel}</h3>
            <p className="type-body mt-4">{t.personaSummary}</p>
          </div>
          <div className="split__col">
            <h3 className="type-h3">{t.audienceLabel}</h3>
            <p className="type-body mt-4">{t.audience}</p>
          </div>
        </div>
        <p className="type-body mt-10">
          <strong className="font-semibold">{t.othersLabel}:</strong> {t.others}
        </p>
      </div>
    </section>
  );
}
