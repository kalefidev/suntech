import type { CSSProperties } from "react";
import { sceneCopy } from "../content/copy";

/**
 * Etiquetas das peças em foco (DESIGN.md, "Texto e etiqueta do beat"): um ponto na peça, uma
 * linha e uma pílula com o número da etapa e o nome. A cena 3D (scene/model/LabelProjector.tsx)
 * posiciona tudo a cada quadro, direto no DOM: no desktop, a pílula fica na coluna livre do lado
 * oposto ao texto; no celular, logo acima do texto. Camada fixa, fora da seção presa (pin e
 * posição fixa não se misturam). Decorativa para o leitor de tela: o texto do beat já diz o mesmo.
 * Sem WebGL, nada a projeta e ela fica escondida.
 */
export function PartLabels() {
  return (
    <div className="part-labels" data-part-labels aria-hidden="true" data-visible="0">
      <svg className="part-labels__lines">
        {sceneCopy.labels.map((label) => (
          <g key={label.n} data-label-line={label.n} opacity={0} style={{ "--dot": `var(--color-${label.color})` } as CSSProperties}>
            <line />
            <circle r={4.5} />
          </g>
        ))}
      </svg>
      {sceneCopy.labels.map((label) => (
        <span key={label.n} className="part-label type-label" data-label={label.n} style={{ "--dot": `var(--color-${label.color})` } as CSSProperties}>
          <span className="part-label__n">{label.n}</span>
          {label.name}
        </span>
      ))}
    </div>
  );
}
