import { useEffect, useRef, useState } from "react";
import { gsap } from "../lib/gsap";
import { onProgress } from "../lib/loading";
import { runOpening } from "../lib/opening";

const MIN_VISIBLE_MS = 600;

/**
 * Loader: uma linha fina na linha do horizonte, onde o produto vai pousar.
 * Enche com o progresso real (fonte, chunk 3D, texturas e shaders), fica no
 * mínimo 600 ms e, quando tudo está pronto, dá lugar à abertura. Não cobre o
 * texto: o título do hero pinta desde o primeiro quadro (é o LCP).
 */
export function Loader() {
  const lineRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const started = performance.now();
    let finished = false;
    let timer = 0;
    const off = onProgress((p) => {
      gsap.to(fillRef.current, { scaleX: p, duration: 0.35, ease: "power2.out", overwrite: true });
      if (p < 1 || finished) return;
      finished = true;
      const wait = Math.max(0, MIN_VISIBLE_MS - (performance.now() - started));
      timer = window.setTimeout(() => {
        runOpening(lineRef.current).then(() => setDone(true));
      }, wait);
    });
    return () => {
      off();
      window.clearTimeout(timer);
    };
  }, []);

  if (done) return null;
  return (
    <div ref={lineRef} className="loader-line" aria-hidden="true">
      <span ref={fillRef} />
    </div>
  );
}
