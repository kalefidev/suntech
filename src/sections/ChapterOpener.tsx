import { useRef } from "react";
import type { Part } from "../content/feira";
import { useLineReveal, useScrubFrom } from "../lib/reveal";

/**
 * Abertura de capítulo (seção 6 do brief): número grande, título e a aula de
 * origem. A aula fica abaixo do título, como legenda (nada de rótulo acima).
 * O numeral sobe de dentro da máscara com o scroll; o título sobe por linhas
 * quando entra na tela. O título tem o nome completo no `aria-label`
 * ("Parte 1: O problema"), porque o numeral é decorativo.
 */
export function ChapterOpener({ part }: { part: Part }) {
  const ref = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  useScrubFrom(ref, ".chapter__numeral-inner", { yPercent: 100 });
  // "none": o SplitText não mexe na acessibilidade; o nome do título é o
  // `aria-label` nosso. ("hidden" esconderia o h2 inteiro do leitor de tela.)
  useLineReveal(titleRef, { aria: "none" });

  return (
    <header ref={ref} className="chapter col-text" data-anchor={`${part.id}-abertura`}>
      <span className="chapter__numeral type-numeral" aria-hidden="true">
        <span className="chapter__numeral-inner">{part.n}</span>
      </span>
      <div className="chapter__text">
        <h2
          ref={titleRef}
          id={`${part.id}-titulo`}
          tabIndex={-1}
          className="type-h2 chapter__title"
          aria-label={`Parte ${part.n}: ${part.title}`}
        >
          {part.title}
        </h2>
        <p className="type-caption chapter__aula">{part.aula}</p>
      </div>
    </header>
  );
}
