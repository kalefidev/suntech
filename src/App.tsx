import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "./lib/gsap";
import { destroyLenis, startLenis } from "./lib/lenis";
import { registerSections } from "./lib/sections";
import { holdTracks, initTracks } from "./lib/tracks";
import { prepareOpening } from "./lib/opening";
import { startPointer } from "./lib/pointer";
import { track } from "./lib/loading";
import { flags } from "./lib/env";
import { useReducedMotion } from "./lib/useReducedMotion";
import { CanvasErrorBoundary } from "./scene/CanvasErrorBoundary";
import { Fallback } from "./scene/Fallback";
import { Header } from "./sections/Header";
import { ProductScene } from "./sections/ProductScene";
import { Footer } from "./sections/Footer";
import { Cursor } from "./sections/Cursor";
import { copy } from "./content/copy";

// O chunk 3D começa a baixar já; o canvas só monta depois de o texto pintar
// (veja `sceneReady` abaixo).
const sceneChunk = flags.noWebgl ? null : track("scene", import("./scene/SceneCanvas"));
const SceneCanvas = lazy(() => sceneChunk ?? import("./scene/SceneCanvas"));
const LevaPanel = lazy(() => import("leva").then((m) => ({ default: m.Leva })));

// A abertura segura o trilho de scroll até o produto entrar (lib/opening.ts).
holdTracks(true);

/**
 * Fase 1 da v3: a página é a cena do produto (o hero de 700vh) e o rodapé. As 6 partes
 * (Problema a Jovem) e o modo pitch voltam em volta dela na Fase 2: os componentes
 * continuam em src/sections, só não estão montados.
 */
export default function App() {
  const rootRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [sceneReady, setSceneReady] = useState(false);

  // O canvas monta só depois de a fonte chegar e de o texto pintar (dois
  // quadros): no Chrome do Windows, a primeira compilação dos shaders ocupa o
  // processo da GPU, que também compõe a página, e atrasava o LCP (o título
  // do hero) em segundos.
  useEffect(() => {
    let frame = 0;
    document.fonts.ready.then(() => {
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => setSceneReady(true));
      });
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // Fonte pronta: tarefa real do loader e refresh dos gatilhos (seção 5 do brief).
  useEffect(() => {
    track("font", document.fonts.load('780 1rem "Archivo"').then(() => document.fonts.ready)).then(() =>
      ScrollTrigger.refresh(),
    );
  }, []);

  // Lenis e ponteiro (fora do reduced motion), registro de seções e trilho de
  // scroll. Roda depois dos efeitos das seções, quando os pins já existem. O
  // trilho põe a cena na pose do ponto atual, e a abertura parte daí.
  useEffect(() => {
    if (!reducedMotion) startLenis();
    const offPointer = reducedMotion ? () => undefined : startPointer();
    const offSections = registerSections();
    const offTracks = initTracks({ reducedMotion });
    prepareOpening();
    ScrollTrigger.refresh();
    return () => {
      offTracks();
      offSections();
      offPointer();
      destroyLenis();
    };
  }, [reducedMotion]);

  return (
    <div ref={rootRef}>
      {flags.noWebgl ? (
        <Fallback />
      ) : (
        sceneReady && (
          <CanvasErrorBoundary fallback={<Fallback />}>
            <Suspense fallback={null}>
              <SceneCanvas eventSource={rootRef} />
            </Suspense>
          </CanvasErrorBoundary>
        )
      )}

      <a href="#conteudo" className="skip-link">
        {copy.ui.skipLink}
      </a>
      <Header />

      <main id="conteudo" tabIndex={-1}>
        <ProductScene />
      </main>

      <Footer />
      <Cursor />

      {flags.debug && (
        <Suspense fallback={null}>
          <LevaPanel collapsed />
        </Suspense>
      )}
    </div>
  );
}
