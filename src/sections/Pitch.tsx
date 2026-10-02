import { copy } from "../content/copy";
import { partsOfFair, pitchTimeline } from "../content/feira";
import { ChapterOpener } from "./ChapterOpener";

const part = partsOfFair[4];

/** Parte 5: O pitch (Aula 6). Linha do tempo de 0:00 a 3:00. */
export function Pitch() {
  return (
    <section
      id={part.id}
      data-section={part.id}
      data-part={part.n}
      aria-labelledby={`${part.id}-titulo`}
      className="part page-x"
    >
      <ChapterOpener part={part} />

      <div className="part-block part-block--last col-text">
        <h3 className="type-h3">{copy.pitch.title}</h3>
        <ol className="timeline">
          {pitchTimeline.map((block) => (
            <li key={block.from} className="timeline__block">
              <p className="type-label num timeline__time">
                {block.from} a {block.to}
              </p>
              <p className="type-h3 timeline__sector">{block.sector}</p>
              <p className="type-body timeline__text">{block.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
