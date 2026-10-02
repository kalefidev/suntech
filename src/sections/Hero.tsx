import { copy } from "../content/copy";
import { Loader } from "./Loader";

/**
 * Hero (manhã). O título pinta no primeiro quadro, sobre o céu da madrugada
 * que o `body` já tem. O produto 3D fica à direita (no celular, em cima), e a
 * linha do loader marca o horizonte onde ele pousa.
 */
export function Hero() {
  return (
    <section id="hero" data-section="hero" aria-labelledby="hero-titulo" className="hero page-x">
      <div className="hero__text col-text">
        <p className="type-label hero__name" data-hero-name>
          {copy.hero.productName}
        </p>
        <h1 id="hero-titulo" className="type-display hero__title">
          {copy.hero.title}
        </h1>
        <p className="type-lead hero__lead">{copy.hero.lead}</p>
      </div>
      <span className="hero__cue" aria-hidden="true" />
      <Loader />
    </section>
  );
}
