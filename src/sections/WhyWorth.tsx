import { company } from "../content/company";
import { product } from "../content/product";

const REASONS = [
  { title: "Autonomia", text: "Você decide quando e onde carregar." },
  { title: "Energia limpa", text: "A carga vem do sol, não da rede." },
  {
    title: "Energia de graça",
    text: "Depois de comprado, cada carga feita pelo sol não custa nada.",
  },
];

const COMPARISON = [
  { label: "Recarrega com", generic: "Tomada", suntech: "Luz do sol ou tomada (USB-C)" },
  {
    label: "Longe da rede",
    generic: "Funciona até a carga acabar",
    suntech: "Volta a carregar sempre que tem sol",
  },
  { label: "Fonte de energia", generic: "Rede elétrica", suntech: "Sol, uma fonte limpa" },
];

/**
 * Ficha técnica: só os campos preenchidos no product.ts. A contagem
 * numérica na entrada em tela (pedida pela Fase 6) ainda não está aqui —
 * é conteúdo estático, correto, provisório na animação.
 */
const SPEC_ROWS: { label: string; value: string }[] = [
  { label: "Painel solar", value: `${product.panel.totalVoltage} V, ${product.panel.totalWattage} W` },
  {
    label: "Bateria",
    value: `${product.battery.totalCapacityMah.toLocaleString("pt-BR")} mAh (≈ ${product.battery.totalWh.toFixed(1)} Wh)`,
  },
  { label: "Controle de carga", value: `${product.chargeControl.module}, até ${product.chargeControl.maxChargeAmp} A` },
  {
    label: "Conversor",
    value: `${product.converter.fromVoltage} V → ${product.converter.toVoltage} V, até ${product.converter.maxAmp} A`,
  },
  { label: "Carga no sol", value: product.estimates.chargeTimeSun },
  { label: "Carga na tomada", value: product.estimates.chargeTimeOutlet },
  { label: "Cargas de celular", value: product.estimates.phoneCharges },
  ...(product.weightGrams !== null ? [{ label: "Peso", value: `${product.weightGrams} g` }] : []),
  ...(product.priceBRL !== null
    ? [{ label: "Preço", value: product.priceBRL.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) }]
    : []),
];

export function WhyWorth() {
  return (
    <section data-act="6" className="flex h-[250vh] flex-col justify-center gap-16 px-6 md:px-10">
      <div className="max-w-xl">
        <div className="space-y-6">
          {REASONS.map((r) => (
            <div key={r.title}>
              <h3 className="text-xl font-semibold">{r.title}</h3>
              <p className="mt-1 text-[17px] opacity-80">{r.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-2xl">
        <h3 className="text-2xl font-semibold">Diferente de um power bank comum</h3>
        <table className="mt-4 w-full border-collapse text-left text-[17px]">
          <thead>
            <tr className="border-nuvem/20 border-b text-sm opacity-60">
              <th className="py-2 font-normal"></th>
              <th className="py-2 font-normal">Power bank comum</th>
              <th className="text-sol py-2 font-normal">{company.name}</th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON.map((row) => (
              <tr key={row.label} className="border-nuvem/10 border-b">
                <th className="py-3 pr-4 font-medium">{row.label}</th>
                <td className="py-3 pr-4 opacity-80">{row.generic}</td>
                <td className="py-3 opacity-95">{row.suntech}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="max-w-md">
        <table className="w-full border-collapse text-left [font-variant-numeric:tabular-nums]">
          <tbody>
            {SPEC_ROWS.map((row) => (
              <tr key={row.label} className="border-nuvem/10 border-b">
                <th className="py-2 pr-4 text-sm font-normal opacity-60">{row.label}</th>
                <td className="py-2 font-semibold">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
