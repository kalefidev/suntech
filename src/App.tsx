import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "./lib/gsap";
import { setupLenis } from "./lib/lenis";
import { registerActs } from "./lib/acts";
import { prefersReducedMotion, isDebug } from "./lib/env";
import { sceneState } from "./scene/state";
import { applyTextColor } from "./scene/daylight";
import { initialTier, type QualityTier } from "./scene/quality";
import { CanvasErrorBoundary } from "./scene/CanvasErrorBoundary";
import { Fallback } from "./scene/Fallback";
import { Opening } from "./sections/Opening";
import { Header } from "./sections/Header";
import { Hero } from "./sections/Hero";
import { Inside } from "./sections/Inside";
import { HowItWorks } from "./sections/HowItWorks";
import { Night } from "./sections/Night";
import { WhoFor } from "./sections/WhoFor";
import { WhyWorth } from "./sections/WhyWorth";
import { AboutUs } from "./sections/AboutUs";
import { Final } from "./sections/Final";
import { Footer } from "./sections/Footer";

const SceneCanvas = lazy(() => import("./scene/SceneCanvas"));
const LevaPanel = lazy(() => import("leva").then((m) => ({ default: m.Leva })));

export default function App() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [tier, setTier] = useState<QualityTier>(initialTier());

  useEffect(() => {
    if (!prefersReducedMotion()) {
      setupLenis();
    }

    registerActs();

    // Curva provisória de `dayTime` cobrindo a página inteira (Fase 1). As
    // timelines por ato, com os trechos exatos do mapa de scroll, entram
    // conforme cada fase constrói seu conteúdo real (Fases 2–8).
    const dayTimeTrigger = ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        sceneState.dayTime = self.progress;
        applyTextColor(sceneState.dayTime);
      },
    });

    return () => dayTimeTrigger.kill();
  }, []);

  return (
    <div ref={rootRef}>
      <CanvasErrorBoundary fallback={<Fallback />}>
        <Suspense fallback={null}>
          <SceneCanvas eventSource={rootRef} tier={tier} onTierChange={setTier} />
        </Suspense>
      </CanvasErrorBoundary>

      {/* Marcador permanente do Ato 0 (topo da página, sem altura própria).
          Fica fora do `Opening` de propósito: o overlay do loader desmonta
          depois de pronto, e um `[data-act]` teria que sobreviver a isso
          para `window.__acts["0"]` continuar estável. */}
      <div data-act="0" aria-hidden="true" />
      <Opening />
      <Header />

      <main>
        <Hero />
        <Inside />
        <HowItWorks />
        <Night />
        <WhoFor />
        <WhyWorth />
        <AboutUs />
        <Final />
      </main>

      <Footer />

      {isDebug() && (
        <Suspense fallback={null}>
          <LevaPanel collapsed />
        </Suspense>
      )}
    </div>
  );
}
