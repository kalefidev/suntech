import { useRef } from "react";
import { num } from "../content/format";
import type { Fact as FactData, Source } from "../content/feira";
import { useCountUp } from "../lib/reveal";

export function Sources({ sources }: { sources: Source[] }) {
  return (
    <p className="type-caption fact__source">
      {sources.length > 1 ? "Fontes: " : "Fonte: "}
      {sources.map((source, i) => (
        <span key={source.url}>
          {i > 0 && " e "}
          <a className="source-link" href={source.url} target="_blank" rel="noreferrer">
            {source.label}
          </a>
        </span>
      ))}
    </p>
  );
}

/**
 * Dado externo dentro de uma frase, com o número em destaque e a fonte logo
 * abaixo. O número conta até o valor final quando entra na tela; o valor final
 * fica sempre no DOM (o leitor de tela lê ele), e a contagem corre por cima,
 * sem mudar a largura da frase.
 */
export function Fact({ fact, className = "" }: { fact: FactData; className?: string }) {
  const numberRef = useRef<HTMLElement>(null);
  useCountUp(numberRef, fact.value);
  return (
    <div className={`fact ${className}`}>
      <p className="type-lead fact__text">
        {fact.before}
        <strong ref={numberRef} className="fact__number num">
          <span className="fact__final">{num(fact.value)}</span>
          <span className="fact__live" data-count-live aria-hidden="true" />
        </strong>
        {fact.after}
      </p>
      <Sources sources={fact.sources} />
    </div>
  );
}
