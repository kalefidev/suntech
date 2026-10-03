import { useRef } from "react";
import { copy } from "../content/copy";
import { partsOfFair, pitchTimeline } from "../content/feira";
import { startPitch } from "../lib/pitch";
import { useScrubFrom } from "../lib/reveal";
import { ChapterOpener } from "./ChapterOpener";

const part = partsOfFair[4];

/**
 * Parte 5: O pitch (Aula 6). Linha do tempo de 0:00 a 3:00 (horizontal no
 * desktop, vertical no celular), que se desenha com o scroll, bloco a bloco, e
 * o botão do modo pitch.
 */
export function Pitch() {
  const timelineRef = useRef<HTMLOListElement>(null);
  // A linha e o ponto de cada bloco começam juntos; o bloco seguinte, depois.
  useScrubFrom(
    timelineRef,
    ".timeline__line, .timeline__dot",
    { "--drawn": 0, stagger: (i: number) => Math.floor(i / 2) * 0.4 },
    { start: "top 88%", end: "top 38%" },
  );

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
        <ol ref={timelineRef} className="timeline">
          {pitchTimeline.map((block) => (
            <li key={block.from} className="timeline__block">
              <span className="timeline__line" aria-hidden="true" />
              <span className="timeline__dot" aria-hidden="true" />
              <p className="type-label num timeline__time">
                {block.from} a {block.to}
              </p>
              <p className="type-h3 timeline__sector">{block.sector}</p>
              <p className="type-body timeline__text">{block.text}</p>
            </li>
          ))}
        </ol>
        <div className="pitch-start">
          <button type="button" className="btn-cta" onClick={(event) => startPitch(event.currentTarget)}>
            {copy.pitch.start}
          </button>
          <p className="type-caption">{copy.pitch.hint}</p>
        </div>
      </div>
    </section>
  );
}
