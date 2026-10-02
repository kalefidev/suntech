import type { Part } from "../content/feira";

/**
 * Abertura de capítulo (seção 6 do brief): número grande, título e a aula de
 * origem. A aula fica abaixo do título, como legenda (nada de rótulo acima).
 */
export function ChapterOpener({ part }: { part: Part }) {
  return (
    <header className="chapter col-text" data-anchor={`${part.id}-abertura`}>
      <span className="chapter__numeral type-numeral" aria-hidden="true">
        {part.n}
      </span>
      <div className="chapter__text">
        <h2 id={`${part.id}-titulo`} tabIndex={-1} className="type-h2 chapter__title">
          <span className="sr-only">Parte {part.n}: </span>
          {part.title}
        </h2>
        <p className="type-caption chapter__aula">{part.aula}</p>
      </div>
    </header>
  );
}
