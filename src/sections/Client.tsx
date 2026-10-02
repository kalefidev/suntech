import { useRef } from "react";
import { copy } from "../content/copy";
import { num } from "../content/format";
import { partsOfFair } from "../content/feira";
import { useScrubFrom } from "../lib/reveal";
import { ChapterOpener } from "./ChapterOpener";
import { Highlight } from "./Highlight";

const part = partsOfFair[1];
const t = copy.cliente;
const p = t.persona;

/**
 * Distância sítio–cidade: informação da persona, desenhada com o scroll, do
 * sítio até a cidade. A linha é reta, então cresce em `scaleX` (o mesmo que o
 * DrawSVG faria, sem depender de como o SVG estica na largura toda).
 */
function Distance() {
  const ref = useRef<HTMLElement>(null);
  useScrubFrom(ref, ".distance__line", { scaleX: 0 }, { start: "top 88%", end: "top 46%" });
  return (
    <figure ref={ref} className="distance" aria-label={`${p.farm} a ${num(p.distanceKm)} km da ${p.city.toLowerCase()}`}>
      <div className="distance__track" aria-hidden="true">
        <span className="distance__line" />
      </div>
      <figcaption className="type-caption distance__labels" aria-hidden="true">
        <span>{p.farm}</span>
        <span className="num">{num(p.distanceKm)}&nbsp;km</span>
        <span>{p.city}</span>
      </figcaption>
    </figure>
  );
}

/**
 * Parte 2: O cliente (Aula 3). Noite depois da tempestade. O título da persona
 * é o nome; "Persona" é a legenda, no mesmo padrão do "Aula N". O monograma é
 * o retrato (nada de foto ou caricatura), e os 40 km cruzam a largura toda.
 */
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

      <div id="persona" className="part-block persona col-wide">
        <div className="persona__head">
          <h3 className="type-h2 persona__name">{p.name}</h3>
          <p className="type-caption persona__label">{t.personaTitle}</p>
          <p className="type-lead persona__role">
            {p.age}, {p.role}.
          </p>
        </div>
        <span className="persona__monogram" aria-hidden="true">
          {p.initials}
        </span>
        <Distance />
        <ul className="type-body persona__facts">
          {p.facts.map((fact) => (
            <li key={fact}>{fact}</li>
          ))}
        </ul>
      </div>

      <Highlight text={t.synthesis} caption={t.synthesisCaption} />

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

      <div className="part-block part-block--last col-wide">
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
        <p className="type-body mt-10 others">
          <strong className="font-semibold">{t.othersLabel}:</strong> {t.others}
        </p>
      </div>
    </section>
  );
}
