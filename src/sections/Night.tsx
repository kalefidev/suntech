import { product } from "../content/product";

/**
 * Ato 4 — o sol se põe, a energia fica (pin de 200vh). O LED, o cabo e a
 * tela do celular carregando entram na Fase 5.
 */
export function Night() {
  return (
    <section data-act="4" className="flex h-[200vh] flex-col justify-center px-6 md:px-10">
      <div className="sticky top-1/3 max-w-md">
        <h2 className="text-[clamp(2rem,5vw,4.5rem)] leading-[1.05] font-bold">
          O sol se põe. A energia fica.
        </h2>
        <p className="mt-6 text-[17px] opacity-80">
          À noite, o {product.name} carrega o seu celular com o que guardou
          durante o dia.
        </p>
        <p className="mt-10 text-[17px] opacity-80">
          Amanhã, o sol recarrega tudo de novo.
        </p>
      </div>
    </section>
  );
}
