import { energyPath } from "../content/product";

/**
 * Diagrama do caminho da energia em SVG, para quando não há WebGL (seção 5 do
 * brief). Cada etapa é um traço colorido com o nome escrito em `--fg`: a cor
 * é informação, nunca a única informação.
 */
export function EnergyDiagram() {
  const width = 640;
  const step = width / energyPath.length;
  return (
    <figure className="energy-diagram" aria-hidden="true">
      <svg viewBox={`0 0 ${width} 96`} role="presentation">
        {energyPath.map((s, i) => {
          const x0 = i * step + 12;
          const x1 = (i + 1) * step - 12;
          return (
            <g key={s.id}>
              <line x1={x0} y1="30" x2={x1} y2="30" stroke="var(--color-grafite)" strokeWidth="12" strokeLinecap="round" />
              <line x1={x0} y1="30" x2={x1} y2="30" stroke={`var(--color-${s.color})`} strokeWidth="5" strokeLinecap="round" />
              <text x={(x0 + x1) / 2} y="72" textAnchor="middle" fill="currentColor" className="energy-diagram__label">
                {s.n}. {s.title}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
