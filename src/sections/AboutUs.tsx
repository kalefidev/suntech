import { company } from "../content/company";

const HISTORY_STEPS = [
  { label: "A ideia", text: "Surgiu ao pensar em quem vive longe da tomada." },
  {
    label: "O protótipo",
    text: "A equipe montou o painel solar dobrável, a bateria de lítio e os módulos de carga numa caixa.",
  },
  {
    label: "Os testes",
    text: `${company.presentedAt}: uma lâmpada fez o papel do sol para mostrar a carga funcionando.`,
  },
];

/**
 * Ato 7 — quem somos (~250vh). O produto 3D quieto ao lado e as fotos (se
 * houver `referencias/`) entram nas próximas fases; hoje não há fotos
 * autorizadas, então a seção segue só com texto (regra da seção 2 do brief).
 */
export function AboutUs() {
  return (
    <section id="about-us" data-act="7" className="flex h-[250vh] flex-col justify-center gap-16 px-6 md:px-10">
      <div className="max-w-xl space-y-10">
        <div>
          <h2 className="text-2xl font-semibold">Quem somos</h2>
          <p className="mt-2 text-[17px] opacity-80">
            A {company.name} nasceu de uma pergunta: como usar a tecnologia
            sem deixar a sustentabilidade de lado? Somos uma equipe de
            estudantes que transformou essa pergunta num carregador que
            funciona com a luz do sol.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold">O que fazemos</h2>
          <p className="mt-2 text-[17px] opacity-80">
            Criamos soluções acessíveis e ecológicas com energia solar. A
            primeira é um carregador portátil: o painel fotovoltaico capta a
            luz do sol, e a bateria de lítio guarda essa energia, como um
            power bank.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Para que e para quem</h2>
          <p className="mt-2 text-[17px] opacity-80">
            Para que ninguém fique sem bateria por estar longe da tomada,
            principalmente quem vive em lugares remotos, e para que essa
            energia venha de uma fonte limpa.
          </p>
        </div>
        {(company.mission || company.vision || company.values.length > 0) && (
          <div className="grid gap-6 sm:grid-cols-3">
            {company.mission && (
              <div>
                <h3 className="text-sm font-semibold opacity-60">Missão</h3>
                <p className="mt-1 text-[17px] opacity-80">{company.mission}</p>
              </div>
            )}
            {company.vision && (
              <div>
                <h3 className="text-sm font-semibold opacity-60">Visão</h3>
                <p className="mt-1 text-[17px] opacity-80">{company.vision}</p>
              </div>
            )}
            {company.values.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold opacity-60">Valores</h3>
                <p className="mt-1 text-[17px] opacity-80">{company.values.join(", ")}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="max-w-xl">
        <h2 className="text-2xl font-semibold">Nasceu como projeto de escola.</h2>
        <ol className="mt-6 space-y-6">
          {HISTORY_STEPS.map((step, i) => (
            <li key={step.label} className="flex gap-4">
              <span className="text-sol text-sm font-semibold">{i + 1}</span>
              <div>
                <h3 className="font-semibold">{step.label}</h3>
                <p className="mt-1 text-[17px] opacity-80">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm opacity-60">{company.team}</p>
      </div>
    </section>
  );
}
