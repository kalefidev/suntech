import { product } from "../content/product";

/**
 * Ato 1 — hero (manhã, 100vh). A pose 3D do produto e o tilt por ponteiro
 * entram na Fase 2, junto do modelo procedural.
 */
export function Hero() {
  return (
    <section
      data-act="1"
      className="flex h-[100vh] flex-col justify-center px-6 md:px-10"
    >
      <p className="text-sm opacity-70">SunTech</p>
      <h1 className="max-w-3xl text-[clamp(3rem,9vw,9rem)] leading-[0.95] font-bold" style={{ fontVariationSettings: '"wdth" 120' }}>
        Carregue o celular com a luz do sol.
      </h1>
      <p className="mt-6 max-w-md text-[17px] leading-normal opacity-80">
        O {product.name} junta um painel solar dobrável e uma bateria. Ele
        guarda a energia do dia para você usar quando precisar.
      </p>
    </section>
  );
}
