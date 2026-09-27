// Única fonte de fatos sobre o produto. Vem da seção 2 do BRIEF.md.
//
// Medidas e peso ficam null até serem medidos no protótipo real (ver seção 2,
// regra 2). Enquanto null, o 3D usa DEFAULT_PROPORTIONS e a ficha técnica
// esconde esses campos — nunca mostre um valor inventado no lugar.

export interface Measurement3D {
  length: number;
  width: number;
  height: number;
}

export interface ProductMeasurements {
  panelOpen: Measurement3D | null; // TODO: preencher
  panelClosed: Measurement3D | null; // TODO: preencher
  case: Measurement3D | null; // TODO: preencher
}

/** Proporções padrão do 3D enquanto as medidas reais não são preenchidas. */
export const DEFAULT_PROPORTIONS = {
  case: { length: 150, width: 100, height: 40 },
  plate: { length: 200, width: 150, height: 6 },
} as const;

export interface ProductComponent {
  id: string;
  name: string;
  /** Frase curta para o callout (Ato 2 / Ato 3). */
  function: string;
}

export type EnergyStepId = "capturar" | "proteger" | "guardar" | "entregar";

export interface EnergyStep {
  id: EnergyStepId;
  title: string;
  text: string;
  /** Nós do esquema do Ato 3 que acendem juntos nesta etapa (ver Fase 0, item 1.3). */
  schematicNodes: string[];
}

export interface Product {
  name: string;
  format: string;
  measurements: ProductMeasurements;
  weightGrams: number | null; // TODO: preencher
  color: string;
  panel: {
    description: string;
    cellVoltage: number;
    wattageEachCell: number;
    totalVoltage: number;
    totalWattage: number;
  };
  battery: {
    cellCount: number;
    chemistry: string;
    cellVoltage: number;
    cellCapacityMah: number;
    totalCapacityMah: number;
    totalWh: number;
  };
  chargeControl: {
    module: string;
    protection: string;
    maxChargeAmp: number;
  };
  converter: {
    module: string;
    fromVoltage: number;
    toVoltage: number;
    maxAmp: number;
  };
  hasProtectionDiode: boolean;
  inputs: string[];
  outputs: string[];
  /**
   * Componentes com papel narrativo no 3D (callouts do Ato 2/3). Os LEDs do
   * próprio módulo TP4056 (vermelho carregando / azul completo) não entram
   * aqui de propósito — ver Fase 0, item 1.1: só o LED de saída tem callout,
   * para não competir com ele na história do Ato 4.
   */
  components: ProductComponent[];
  estimates: {
    chargeTimeSun: string;
    chargeTimeOutlet: string;
    phoneCharges: string;
  };
  /** Opcional; null esconde o campo no site. */
  priceBRL: number | null;
  hasPhotos: boolean;
  energyPath: EnergyStep[];
}

export const product: Product = {
  name: "Carregador Solar SunTech",
  format:
    "Duas partes: um painel solar dobrável (duas placas unidas por dobradiça, que abrem como um livro) e uma caixa com a bateria e a eletrônica, de onde saem os cabos de carga. A tampa da caixa abre para cima.",
  measurements: {
    panelOpen: null, // TODO: preencher
    panelClosed: null, // TODO: preencher
    case: null, // TODO: preencher
  },
  weightGrams: null, // TODO: preencher
  color: "Caixa preta fosca; painel com moldura escura",
  panel: {
    description:
      "Dobrável, com duas placas monocristalinas em paralelo, de cantos chanfrados.",
    cellVoltage: 6,
    wattageEachCell: 3,
    totalVoltage: 6,
    totalWattage: 6,
  },
  battery: {
    cellCount: 2,
    chemistry: "Lítio 18650",
    cellVoltage: 3.7,
    cellCapacityMah: 2600,
    totalCapacityMah: 5200,
    totalWh: 19.24,
  },
  chargeControl: {
    module: "TP4056",
    protection: "DW01 (sobrecarga, descarga profunda e curto-circuito)",
    maxChargeAmp: 1,
  },
  converter: {
    module: "Módulo boost",
    fromVoltage: 3.7,
    toVoltage: 5,
    maxAmp: 1,
  },
  hasProtectionDiode: true,
  inputs: ["Cabo do painel solar", "USB-C (tomada)"],
  outputs: ["USB-A 5 V com cabo 3 em 1 (USB-C, Lightning e micro-USB)"],
  components: [
    {
      id: "painel",
      name: "Painel solar",
      function: "Transforma luz em eletricidade.",
    },
    {
      id: "diodo",
      name: "Diodo Schottky",
      function: "Impede que a bateria descarregue pelo painel à noite.",
    },
    {
      id: "controlador",
      name: "Controlador de carga",
      function: "Carrega a bateria no ritmo certo e evita sobrecarga.",
    },
    {
      id: "bateria",
      name: "Bateria de lítio",
      function: "Guarda a energia do dia para usar quando você precisar.",
    },
    {
      id: "conversor",
      name: "Conversor de tensão",
      function: "Eleva os 3,7 V da bateria para os 5 V do USB.",
    },
    {
      id: "saida",
      name: "Saída USB",
      function: "Entrega a energia guardada para o seu celular.",
    },
  ],
  estimates: {
    chargeTimeSun: "6 a 8 horas de sol forte (estimativa)",
    chargeTimeOutlet: "cerca de 6 horas na tomada (estimativa)",
    phoneCharges: "cerca de 1 carga completa de um celular comum (estimativa)",
  },
  priceBRL: null,
  hasPhotos: false,
  energyPath: [
    {
      id: "capturar",
      title: "Captar",
      text: "O painel transforma luz em eletricidade: a luz movimenta elétrons no silício, e esse movimento vira corrente.",
      schematicNodes: ["painel"],
    },
    {
      id: "proteger",
      title: "Proteger",
      text: "O controlador carrega a bateria no ritmo certo e evita sobrecarga. O diodo impede que a energia volte para o painel à noite.",
      schematicNodes: ["diodo", "controlador"],
    },
    {
      id: "guardar",
      title: "Guardar",
      text: "A bateria de lítio armazena a energia até você precisar, de dia ou de noite.",
      schematicNodes: ["bateria"],
    },
    {
      id: "entregar",
      title: "Entregar",
      text: "O conversor eleva os 3,7 V da bateria para os 5 V do USB, e o celular carrega normalmente.",
      schematicNodes: ["conversor", "saida"],
    },
  ],
};
