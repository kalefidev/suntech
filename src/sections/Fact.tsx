import { num } from "../content/format";
import type { Fact as FactData, Source } from "../content/feira";

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
 * abaixo. O número é texto normal no DOM (o leitor de tela lê o valor final).
 */
export function Fact({ fact, className = "" }: { fact: FactData; className?: string }) {
  return (
    <div className={`fact ${className}`}>
      <p className="type-lead fact__text">
        {fact.before}
        <strong className="fact__number num" data-count={fact.value}>
          {num(fact.value)}
        </strong>
        {fact.after}
      </p>
      <Sources sources={fact.sources} />
    </div>
  );
}
