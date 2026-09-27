import { product } from "../content/product";

/**
 * Fallback sem WebGL: gradiente em CSS no lugar do céu e um diagrama SVG
 * simples do fluxo de energia no lugar da vista explodida em 3D. Revisado a
 * fundo na Fase 8 (checklist da seção 15); aqui garante que o site nunca
 * fica sem uma versão navegável.
 */
export function Fallback() {
  const steps = product.energyPath;
  const gap = 100 / steps.length;

  return (
    <div
      className="scene-canvas-wrap"
      aria-hidden="true"
      style={{
        background: "linear-gradient(to top, #CFE8F3, #14213D)",
      }}
    >
      <svg
        viewBox="0 0 100 20"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-x-0 bottom-16 mx-auto w-full max-w-3xl px-6"
      >
        <line x1="5" y1="10" x2="95" y2="10" stroke="#FFD166" strokeWidth="0.4" />
        {steps.map((step, i) => (
          <g key={step.id} transform={`translate(${5 + gap * i + gap / 2}, 10)`}>
            <circle r="1.6" fill="#FF9F1C" />
            <text y="-4" fontSize="3" textAnchor="middle" fill="#F4F7FA">
              {step.title}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
