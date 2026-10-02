import { lazy, Suspense, useEffect, useRef } from "react";
import { ScrollTrigger } from "./lib/gsap";
import { destroyLenis, startLenis } from "./lib/lenis";
import { registerSections } from "./lib/sections";
import { holdTracks, initTracks } from "./lib/tracks";
import { track } from "./lib/loading";
import { flags } from "./lib/env";
import { useReducedMotion } from "./lib/useReducedMotion";
import { CanvasErrorBoundary } from "./scene/CanvasErrorBoundary";
import { Fallback } from "./scene/Fallback";
import { Header } from "./sections/Header";
import { Hero } from "./sections/Hero";
import { Problem } from "./sections/Problem";
import { Client } from "./sections/Client";
import { Solution } from "./sections/Solution";
import { Inside } from "./sections/Inside";
import { HowItWorks } from "./sections/HowItWorks";
import { EnergyStays } from "./sections/EnergyStays";
import { Differential } from "./sections/Differential";
import { Company } from "./sections/Company";
import { Pitch } from "./sections/Pitch";
import { Youth } from "./sections/Youth";
import { Footer } from "./sections/Footer";

const SceneCanvas = lazy(() => track("scene", import("./scene/SceneCanvas")));
const LevaPanel = lazy(() => import("leva").then((m) => ({ default: m.Leva })));

// A abertura segura o trilho de scroll até o sol nascer (lib/opening.ts).
holdTracks(true);

export default function App() {
  const rootRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  // Fonte pronta: tarefa real do loader e refresh dos gatilhos (seção 5 do brief).
  useEffect(() => {
    track("font", document.fonts.load('780 1rem "Archivo"').then(() => document.fonts.ready)).then(() =>
      ScrollTrigger.refresh(),
    );
  }, []);

  // Lenis (fora do reduced motion), registro de seções e trilho de scroll.
  // Roda depois dos efeitos das seções, quando os pins já existem.
  useEffect(() => {
    if (!reducedMotion) startLenis();
    const offSections = registerSections();
    const offTracks = initTracks({ reducedMotion });
    ScrollTrigger.refresh();
    return () => {
      offTracks();
      offSections();
      destroyLenis();
    };
  }, [reducedMotion]);

  return (
    <div ref={rootRef}>
      {flags.noWebgl ? (
        <Fallback />
      ) : (
        <CanvasErrorBoundary fallback={<Fallback />}>
          <Suspense fallback={null}>
            <SceneCanvas eventSource={rootRef} />
          </Suspense>
        </CanvasErrorBoundary>
      )}

      <Header />

      <main>
        <Hero />
        <Problem />
        <Client />
        <Solution />
        <Inside />
        <HowItWorks />
        <EnergyStays />
        <Differential />
        <Company />
        <Pitch />
        <Youth />
      </main>

      <Footer />

      {flags.debug && (
        <Suspense fallback={null}>
          <LevaPanel collapsed />
        </Suspense>
      )}
    </div>
  );
}
