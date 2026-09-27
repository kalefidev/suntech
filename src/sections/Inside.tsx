import { product } from "../content/product";

/**
 * Ato 2 — por dentro (meio-dia, pin de 300vh). A vista explodida, os
 * callouts e o pin de câmera entram na Fase 3. Aqui só a altura e o
 * `data-act` já existem, para o mapa de scroll e o `snap` funcionarem.
 */
export function Inside() {
  return (
    <section data-act="2" className="flex h-[300vh] flex-col justify-center px-6 md:px-10">
      <div className="sticky top-1/3 max-w-xl">
        <h2 className="text-[clamp(2rem,5vw,4.5rem)] leading-[1.05] font-bold">
          Por dentro, cada peça tem uma função.
        </h2>
        <ul className="mt-6 space-y-2 text-[17px] opacity-80">
          {product.components.map((c) => (
            <li key={c.id}>
              <strong className="font-semibold">{c.name}:</strong> {c.function}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
