import { lazy, Suspense } from "react";

// `r3f-perf` só entra no bundle sob `?debug` (seção 4 do brief).
const Perf = lazy(() =>
  import("r3f-perf").then((m) => ({ default: m.Perf })),
);

export function DebugPerf() {
  return (
    <Suspense fallback={null}>
      <Perf position="top-left" />
    </Suspense>
  );
}
