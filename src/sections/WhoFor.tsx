const USES = [
  {
    title: "Quem vive em lugares remotos",
    text: "Em sítios, zonas rurais e comunidades isoladas, onde a energia não chega ou falha, o sol vira a tomada.",
  },
  {
    title: "Quem trabalha na rua",
    text: "Entregadores, vendedores e motoristas de app que não podem parar para carregar o celular.",
  },
  {
    title: "Quem gosta de estrada e trilha",
    text: "Camping, praia e viagem, onde tomada é luxo.",
  },
  {
    title: "Quando falta luz",
    text: "Numa queda de energia, o celular continua ligado para você falar com quem importa.",
  },
];

/**
 * Ato 5 — para quem é (~320vh). A troca de pose do produto por uso entra
 * na Fase 6.
 */
export function WhoFor() {
  return (
    <section id="who-for" data-act="5" className="flex h-[320vh] flex-col justify-center px-6 md:px-10">
      <div className="sticky top-1/4 max-w-xl">
        <h2 className="text-[clamp(2rem,5vw,4.5rem)] leading-[1.05] font-bold">
          Para quem vive longe da tomada.
        </h2>
        <div className="mt-8 space-y-8">
          {USES.map((use, i) => (
            <div key={use.title} className={i === 0 ? "max-w-md" : "max-w-sm opacity-90"}>
              <h3 className={i === 0 ? "text-2xl font-semibold" : "text-lg font-semibold"}>
                {use.title}
              </h3>
              <p className="mt-1 text-[17px] opacity-80">{use.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
