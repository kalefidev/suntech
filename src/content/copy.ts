// Textos da página (seção 7 do BRIEF.md). Fatos com número vêm de
// product.ts, company.ts e feira.ts; aqui ficam só as palavras.

import { company } from "./company";
import { componentSpecs, energyPath, product } from "./product";

export const copy = {
  ui: {
    skipLink: "Pular para o conteúdo",
  },

  hero: {
    productName: product.name,
    title: "Carregue o celular com a luz do sol.",
    lead: `O ${product.name} junta um painel solar dobrável e uma bateria. Ele guarda a energia do dia para você usar quando precisar.`,
  },

  problema: {
    opening:
      "Todo empreendimento começa com um problema de verdade. O nosso aparece quando a energia some.",
    opportunitiesTitle: "Lista de oportunidades",
    opportunities: [
      {
        group: "Energia no dia a dia",
        items: [
          "O celular descarrega longe da tomada.",
          "A luz cai em dia de chuva.",
          "Em passeios e aulas de campo não há onde carregar.",
        ],
      },
      {
        group: "Soluções que não resolvem",
        items: [
          "O power bank comum só recarrega na tomada.",
          "Os power banks “solares” baratos têm placas pequenas, que quase não carregam.",
          "Energia solar para casa ainda custa caro.",
        ],
      },
      {
        group: "Sustentabilidade",
        items: [
          "Pilhas e baterias vão para o lixo comum.",
          "Pouca gente entende como a energia solar funciona.",
        ],
      },
    ],
    question: "Quais problemas incomodam quem depende de energia longe da tomada?",
    questionCaption: "A pergunta norteadora e as nossas três respostas.",
    problems: [
      "O celular descarrega e não há onde carregar.",
      "A energia é instável e falha justamente quando mais se precisa.",
      "As alternativas que existem dependem da tomada ou não funcionam de verdade.",
    ],
    situation:
      "Quem vive em lugares remotos ou com energia instável fica sem carregar o celular, que é o seu principal meio de comunicação, trabalho e segurança.",
    situationCaption: "Situação-problema escolhida pela equipe.",
    whyTitle: "Por que isso importa para a sociedade",
    whyAccess:
      "Energia é acesso: é com o celular carregado que uma pessoa fala com a família, trabalha, estuda e pede ajuda numa emergência.",
    whyClean:
      "E a energia do sol é limpa: cada carga feita pelo sol é uma carga a menos puxada da rede.",
  },

  cliente: {
    personaTitle: "Persona",
    persona: {
      name: "Seu Antônio",
      initials: "SA",
      age: "54 anos",
      role: "produtor rural",
      farm: "Sítio",
      city: "Cidade",
      distanceKm: 40,
      facts: [
        "Mora num sítio a 40 km da cidade, e a luz cai toda vez que chove.",
        "Usa o celular para vender a produção, falar com a família e marcar consulta médica.",
        "É prático e desconfia de novidade cara. Precisa de algo que funcione sem manual.",
      ],
    },
    synthesis:
      "Nosso cliente é o produtor rural que mora longe da cidade, que enfrenta quedas de energia e falta de tomada para manter o celular carregado, e já tentou usar power bank comum e carregar o celular no carro, mas não resolveu seu problema.",
    synthesisCaption: "A frase-síntese do nosso cliente.",
    reflectionTitle: "Reflexão",
    reflection: [
      {
        q: "Quem é a pessoa mais afetada?",
        a: "Quem vive em áreas rurais e remotas, com energia instável ou sem energia, e depende do celular.",
      },
      {
        q: "Por que isso atrapalha a vida dela?",
        a: "Ela fica sem comunicação justamente quando mais precisa, perde vendas e gasta tempo e dinheiro indo até a cidade para carregar o celular.",
      },
      {
        q: "O que ela já tentou, e por que não deu certo?",
        a: "Power bank comum, que também acaba e precisa de tomada; carregar no carro ou no gerador, que gasta combustível; e power bank solar barato, que tem placa pequena demais e quase não carrega.",
      },
    ],
    personaLabel: "Persona",
    personaSummary: "Seu Antônio, a pessoa por trás do problema.",
    audienceLabel: "Público-alvo",
    audience:
      "Homens e mulheres de 25 a 65 anos que moram ou trabalham em áreas rurais e remotas, com energia instável, e que dependem do celular para trabalhar e se comunicar.",
    othersLabel: "Outros públicos",
    others:
      "Quem trabalha na rua (entregadores, vendedores e motoristas de app), quem faz trilha e acampa, e qualquer pessoa numa queda de energia.",
  },

  solucao: {
    dlightTitle: "Caça ao diferencial: d.light",
    dlightWhy:
      "Por que escolhemos: trabalha com energia solar, como a nossa ideia, e também nasceu numa sala de aula, em Stanford.",
    dlight: [
      {
        q: "Qual problema resolveu?",
        a: "Famílias sem energia elétrica usavam lamparinas de querosene, que são caras, poluentes e perigosas.",
      },
      { q: "Para quem?", a: "Famílias de baixa renda em áreas rurais, principalmente na África e na Ásia." },
      { q: "O que fez de diferente?", a: "Produtos solares baratos e pagamento em parcelas pequenas pelo celular." },
      { q: "Como a vida dessas pessoas mudou?", a: "Luz segura à noite, celular carregado em casa e crianças estudando à noite." },
    ],
    solutionTitle: "A nossa solução",
    solution: `O que a ${company.name} oferece é um produto. O ${product.name} é um power bank com painel solar dobrável: de dia, ele guarda a energia do sol; depois, carrega o celular longe da tomada.`,
    insideTitle: "Por dentro, cada peça tem uma função.",
    howTitle: "Como funciona",
    howLegendTitle: "Cores da energia",
    /** Duas frases, uma por linha: "O sol se põe." / "A energia fica." */
    staysTitle: ["O sol se põe.", "A energia fica."],
    staysText: `À noite, o ${product.name} carrega o seu celular com o que guardou durante o dia.`,
    staysNote: `Simulação. Estimativa: ${product.estimates.phoneCharges}.`,
    tomorrow: "Amanhã, o sol recarrega tudo de novo.",
    lifeTitle: "Como isso melhora a vida do cliente?",
    life: [
      { title: "Mais acessível", text: "Leva energia aonde a tomada não chega." },
      {
        title: "Mais simples",
        text: "É só abrir o painel no sol e ligar o cabo 3 em 1, que serve para qualquer celular.",
      },
      {
        title: "Economia",
        text: "Quem mora longe muitas vezes precisa ir até a cidade ou pagar para carregar o celular. Pelo sol, a carga sai de graça.",
      },
      { title: "Sustentável", text: "Energia limpa, sem depender da rede." },
    ],
    diffTitle: "O que fazemos de diferente?",
    diffColumns: ["Power bank comum", "Power bank solar comum", company.name],
    diffRows: [
      {
        label: "Recarrega com",
        cells: [
          "Tomada",
          "Placa pequena, que costuma levar dias de sol, ou tomada",
          "Painel dobrável grande ou tomada (USB-C)",
        ],
      },
      {
        label: "Longe da rede",
        cells: ["Funciona até a carga acabar", "Quase não recarrega", "Volta a carregar sempre que tem sol"],
      },
      { label: "Conserto", cells: ["Difícil", "Difícil", "Peças comuns, fáceis de trocar"] },
    ],
  },

  empresa: {
    whoTitle: "Quem somos",
    who: `A ${company.name} nasceu de uma pergunta: como usar a tecnologia sem deixar a sustentabilidade de lado? Somos uma equipe de estudantes que transformou essa pergunta num carregador que funciona com a luz do sol.`,
    flightTitle: "Plano de voo",
    flight: [
      { field: "Propósito", value: company.mission },
      { field: "Destino", value: company.vision },
      { field: "Trajeto", value: company.valuesStrategy },
      { field: "Operações", value: company.operations },
    ],
    sectorsTitle: "Divisão de setores",
    products: {
      name: "Produtos",
      lead: "Lidera o protótipo.",
      text: "Escolhe os componentes da ficha técnica e faz os testes com uma lâmpada no lugar do sol, medindo quanto tempo a bateria leva para carregar.",
    },
    finance: {
      name: "Finanças",
      lead: "Cuida dos custos e do preço.",
      costsTitle: "Custos",
      priceLabel: "Preço de venda",
      costLabel: "Custo",
      marginLabel: "Margem",
      strategy:
        "Estratégia: destacar o painel maior que o dos concorrentes, oferecer parcelamento (inspirado na d.light) e comprar peças em quantidade para baixar o custo.",
    },
    marketing: {
      name: "Marketing",
      lead: "Cuida da marca e do estande.",
      identity: "Identidade visual: o nome, as cores de sol e céu e o slogan.",
      slogan: "Energia do sol, onde você estiver.",
      focus: "Foco na dor do Seu Antônio.",
      booth:
        "Estande: banner com o slogan e os diferenciais, protótipo aberto mostrando as peças, demonstração com a lâmpada e QR code para este site.",
    },
    prototypeTitle: "Materializando a ideia: o protótipo",
    prototype:
      "Nosso protótipo é funcional: o painel carrega a bateria de verdade, e a caixa carrega o celular. No estande, o visitante vê as peças por dentro e testa a carga com a lâmpada fazendo o papel do sol.",
    specTitle: "Ficha técnica",
    estimateLabel: "estimativa",
    historyTitle: "Nasceu como projeto de escola",
  },

  pitch: {
    title: "Nosso pitch em 3 minutos",
    start: "Iniciar o modo pitch",
    hint: "Espaço pausa. Esc sai.",
    pause: "Pausar",
    resume: "Continuar",
    exit: "Sair",
    speaking: "Fala agora",
    hudLabel: "Modo pitch",
  },

  jovem: {
    manifesto: [
      "Nossa geração cresceu com a tecnologia na mão e com o planeta pedindo mudança. Para nós, empreender não é só abrir um negócio: é resolver um problema real sem piorar o mundo.",
      `A ${company.name} mostra o que jovens podem fazer quando juntam inovação, responsabilidade social e sustentabilidade: pegamos o problema de quem vive longe da tomada e transformamos num produto que funciona.`,
      "Ainda faltam muitas coisas, como apoio financeiro, capacitação e planejamento. Mas a feira provou que dá para começar com uma ideia, um protótipo e vontade de aprender.",
    ],
    slogan: "Energia do sol, onde você estiver.",
    cta: "Ver o pitch em 3 minutos",
  },

  footer: {
    credit: `Conceito de produto criado a partir do protótipo da equipe ${company.name}, num projeto escolar do ${company.school}. Design e código do site:`,
    author: "Kaique Calefi",
    sourcesTitle: "Fontes",
  },
};

/**
 * Textos da cena do produto (docs/v3-fase-0.md, §2): uma palavra gigante, um título
 * e um texto por beat. As frases vêm das que já existem na página (Aula 4); o dado de
 * cada componente vem de `componentSpecs` (product.ts). Nenhum número mora aqui.
 */
export const sceneCopy = {
  aria: "O Carregador Solar SunTech abrindo, peça por peça",
  words: {
    fechado: "Sol",
    abre: "Abre",
    explode: "Dentro",
    painel: "Captar",
    carga: "Proteger",
    celulas: "Guardar",
    saida: "Entregar",
    remonta: "Simples",
    energia: "Energia",
  },
  beats: {
    fechado: { title: copy.hero.title, text: copy.hero.lead },
    abre: { title: copy.solucao.insideTitle, text: "A tampa abre para cima, como no protótipo." },
    explode: { title: "A energia segue um caminho.", text: "Do painel ao celular, cada peça faz uma parte do trabalho." },
    painel: { title: energyPath[0].title, text: energyPath[0].text, data: componentSpecs.captar },
    carga: { title: energyPath[1].title, text: energyPath[1].text, data: componentSpecs.proteger },
    celulas: { title: energyPath[2].title, text: energyPath[2].text, data: componentSpecs.guardar },
    saida: { title: energyPath[3].title, text: energyPath[3].text, data: componentSpecs.entregar },
    remonta: { title: "Tudo no lugar.", text: copy.solucao.life[1].text },
    energia: { title: copy.solucao.staysTitle.join(" "), text: copy.solucao.staysText, note: copy.solucao.staysNote },
  },
  bridge: "Agora, o problema que nos trouxe até aqui.",
  scroll: "Role para abrir",
} as const;
