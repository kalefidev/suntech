import { useRef } from "react";
import { useLineReveal } from "../lib/reveal";

interface HighlightProps {
  id?: string;
  text: string;
  caption: string;
}

/**
 * Destaque (situação-problema e frase-síntese): a pausa longa da página vem
 * antes dele, e as linhas sobem de dentro da máscara quando ele entra na tela.
 * A citação fica legível para o leitor de tela (`aria: "none"`).
 */
export function Highlight({ id, text, caption }: HighlightProps) {
  const ref = useRef<HTMLQuoteElement>(null);
  useLineReveal(ref, { aria: "none", stagger: 0.07 });
  return (
    <figure id={id} className="part-block part-block--pause highlight col-wide">
      <blockquote ref={ref} className="type-quote highlight__quote">
        {text}
      </blockquote>
      <figcaption className="type-caption highlight__caption">{caption}</figcaption>
    </figure>
  );
}
