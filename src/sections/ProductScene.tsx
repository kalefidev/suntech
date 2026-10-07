import { useRef, type CSSProperties } from "react";
import { BEATS, SWAP, type Beat } from "../scene/choreography";
import { sceneCopy } from "../content/copy";
import { product } from "../content/product";
import { usePinnedStage } from "../lib/stage";
import { useWebglOff } from "../lib/useReducedMotion";
import { Loader } from "./Loader";
import { EnergyDiagram } from "./EnergyDiagram";

/** Duração dos fades do texto e da palavra, em fração do pin. */
const FADE = 0.014;

type Copy = { title: string; text: string; data?: string; note?: string };
const copyOf = (id: Beat["id"]): Copy => sceneCopy.beats[id];

/**
 * A cena do produto (docs/v3-fase-0.md): o hero da página, presa por 700vh no desktop e
 * 490vh no celular. O 3D vive no canvas fixo atrás do DOM; aqui ficam o texto de cada beat
 * (nas laterais no desktop, embaixo no celular), a palavra gigante (uma camada fixa
 * *atrás* do canvas, em `z-index: -2`) e a ponte para a próxima parte. O texto, a palavra
 * e o tom andam na mesma timeline de beats (scene/choreography.ts): o texto sai e entra
 * nos 3% da troca de tom, quando o fundo cruza a zona morta de contraste.
 *
 * Com reduced motion ou sem WebGL, não há pin: cada beat é um bloco de 100svh, e o 3D
 * (quando existe) fica parado no ponto do meio do beat.
 */
export function ProductScene() {
  const ref = useRef<HTMLElement>(null);
  const wordsRef = useRef<HTMLDivElement>(null);
  const webglOff = useWebglOff();

  usePinnedStage(ref, {
    length: { wide: 700, narrow: 490 },
    enabled: !webglOff,
    // A camada de palavras é `fixed`: só aparece enquanto a cena está presa.
    onToggle: (active) => {
      if (wordsRef.current) wordsRef.current.dataset.active = active ? "1" : "0";
    },
    build: (tl, stage) => {
      const words = wordsRef.current;
      const last = BEATS.length - 1;
      const cue = stage.querySelector<HTMLElement>("[data-cue]");
      if (cue) tl.to(cue, { opacity: 0, duration: 0.02 }, 0);

      BEATS.forEach((beat, i) => {
        const el = stage.querySelector<HTMLElement>(`[data-beat="${beat.id}"]`);
        const word = words?.querySelector<HTMLElement>(`[data-word="${beat.id}"]`);
        // O texto desliza para dentro vindo da borda do lado dele; nada de fade-up.
        const dir = beat.side === "left" ? -1 : 1;
        const enter = beat.from + SWAP;
        const leave = beat.to - SWAP - FADE;

        if (el) {
          if (i > 0) tl.fromTo(el, { opacity: 0, x: dir * 36 }, { opacity: 1, x: 0, duration: FADE, ease: "power2.out" }, enter);
          else tl.set(el, { opacity: 1, x: 0 }, 0);
          if (i < last) tl.to(el, { opacity: 0, x: dir * 36, duration: FADE, ease: "power2.in" }, leave);
        }

        if (word) {
          // A palavra entra do lado oposto ao texto, anda devagar com o scroll (parallax,
          // sempre por transform) e sai antes da troca de tom.
          const wdir = -dir;
          const fadeIn = FADE * 1.4;
          if (i > 0) tl.fromTo(word, { opacity: 0, xPercent: wdir * 8, scale: 0.97 }, { opacity: 1, xPercent: 0, scale: 1, duration: fadeIn, ease: "power2.out" }, enter);
          else tl.set(word, { opacity: 1, xPercent: 0, scale: 1 }, 0);
          const driftFrom = i > 0 ? enter + fadeIn : 0;
          const driftTo = i < last ? leave : 1;
          tl.to(word, { xPercent: -wdir * 6, scale: 1.05, duration: Math.max(0.001, driftTo - driftFrom), ease: "none" }, driftFrom);
          if (i < last) tl.to(word, { opacity: 0, duration: FADE, ease: "power2.in" }, leave);
        }
      });
    },
  });

  return (
    <>
      <div ref={wordsRef} className="beat-words" aria-hidden="true" data-active="0">
        {BEATS.map((beat) => {
          const word = sceneCopy.words[beat.id];
          return (
            <span key={beat.id} className="beat-word" data-word={beat.id} style={{ "--chars": word.length } as CSSProperties}>
              {word}
            </span>
          );
        })}
      </div>

      <section
        ref={ref}
        id="hero"
        data-section="produto"
        aria-label={sceneCopy.aria}
        className="stage product-scene page-x"
      >
        {BEATS.map((beat, i) => {
          const c = copyOf(beat.id);
          const Title = i === 0 ? "h1" : "h2";
          return (
            <div
              key={beat.id}
              className="beat"
              data-beat={beat.id}
              data-side={beat.side}
              data-scrim={beat.focus >= 2 ? "" : undefined}
              style={{ "--span": beat.span } as CSSProperties}
            >
              <div className="beat__body">
                {i === 0 && (
                  <p className="type-label hero__name">
                    <span className="hero__name-text" data-hero-name>
                      {product.name}
                    </span>
                  </p>
                )}
                <Title id={i === 0 ? "hero-titulo" : undefined} className="type-h2 beat__title">
                  {c.title}
                </Title>
                <p className="type-lead beat__text">{c.text}</p>
                {c.data && <p className="type-label beat__data">{c.data}</p>}
                {c.note && <p className="type-caption beat__note">{c.note}</p>}
                {beat.id === "explode" && <EnergyDiagram />}
              </div>
            </div>
          );
        })}
        <span className="hero__cue" data-cue aria-hidden="true" />
        <Loader />
      </section>

      <section id="ponte" data-section="ponte" className="bridge page-x">
        <p className="type-quote bridge__text">{sceneCopy.bridge}</p>
      </section>
    </>
  );
}
