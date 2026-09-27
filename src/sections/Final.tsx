import { PORTFOLIO_URL, WHATSAPP_URL } from "../config";

/**
 * Ato 8 — final (fim de tarde dourado, 100vh). O botão magnético entra na
 * Fase 8, junto do polimento de microinterações.
 */
export function Final() {
  return (
    <section data-act="8" className="flex h-[100vh] flex-col items-start justify-center gap-8 px-6 md:px-10">
      <h2 className="max-w-2xl text-[clamp(2rem,5vw,4.5rem)] leading-[1.05] font-bold">
        Energia do sol, onde você estiver.
      </h2>
      <div className="flex flex-wrap gap-6">
        <a
          href={PORTFOLIO_URL}
          className="bg-sol text-noite rounded-full px-6 py-3 text-sm font-semibold"
        >
          Ver outros projetos
        </a>
        {WHATSAPP_URL && (
          <a
            href={WHATSAPP_URL}
            className="border-nuvem/30 rounded-full border px-6 py-3 text-sm font-semibold"
          >
            Falar comigo
          </a>
        )}
      </div>
    </section>
  );
}
