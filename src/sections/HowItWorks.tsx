import { product } from "../content/product";

/**
 * Ato 3 — como funciona (pin de 400vh). O esquema, os fios e os pulsos de
 * energia entram na Fase 4. Aqui só a estrutura e o texto dos 4 passos.
 */
export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      data-act="3"
      className="flex h-[400vh] flex-col justify-center px-6 md:px-10"
    >
      <div className="sticky top-1/4 max-w-xl">
        <ol className="flex flex-wrap gap-x-4 gap-y-1 text-sm opacity-70">
          {product.energyPath.map((step, i) => (
            <li key={step.id}>
              {i + 1}. {step.title}
            </li>
          ))}
        </ol>
        <div className="mt-6 space-y-8">
          {product.energyPath.map((step) => (
            <div key={step.id}>
              <h3 className="text-xl font-semibold">{step.title}</h3>
              <p className="mt-1 text-[17px] opacity-80">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
