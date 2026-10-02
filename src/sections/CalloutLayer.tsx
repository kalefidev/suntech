import { parts } from "../content/product";
import { calloutLayer, registerCallout } from "../lib/callouts";

/**
 * Callouts de "Por dentro" (seção 7 do brief): um ponto na peça, uma linha
 * que se desenha e o nome numa etiqueta. A cena 3D move cada um até a sua
 * peça e liga quando ela se separa. Ficam numa camada fixa, fora da seção
 * presa (pin e posição fixa não se misturam). Decorativos para o leitor de
 * tela: a lista de peças da seção é a versão acessível. No celular, só o
 * número (a legenda é a própria lista).
 */
export function CalloutLayer() {
  return (
    <div
      ref={(element) => {
        calloutLayer.element = element;
      }}
      className="callouts"
      aria-hidden="true"
      data-visible="0"
    >
      {parts.map((part, i) => (
        <div
          key={part.id}
          ref={(element) => registerCallout(part.id, "callout", element)}
          className="callout"
          data-on="0"
          data-side={i % 2 === 0 ? "right" : "left"}
        >
          <span className="callout__dot num">{i + 1}</span>
          <svg className="callout__line" viewBox="0 0 60 30" preserveAspectRatio="none">
            <path d="M0 30 L60 0" pathLength={1} />
          </svg>
          <span className="callout__label">{part.name}</span>
        </div>
      ))}
    </div>
  );
}
