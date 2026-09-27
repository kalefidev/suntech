// Única fonte de fatos sobre a empresa. Vem da seção 2 do BRIEF.md — não edite
// números ou fatos aqui sem atualizar o brief primeiro.

export interface Company {
  name: string;
  whoWeAre: string;
  whatWeDo: string;
  forWhom: string;
  differentiator: string;
  mission: string;
  vision: string;
  values: string[];
  team: string;
  presentedAt: string;
  history: string;
}

export const company: Company = {
  name: "SunTech",
  whoWeAre:
    "Uma equipe de estudantes. A empresa nasceu dos problemas de hoje: a tecnologia avança, e o planeta pede sustentabilidade.",
  whatWeDo:
    "Soluções acessíveis e ecológicas com energia solar. A primeira é o carregador solar portátil.",
  forWhom:
    "Principalmente quem vive em lugares remotos; também quem passa o dia longe da tomada.",
  differentiator:
    "Diferente dos power banks convencionais, ele se recarrega com a luz do sol.",
  mission: "Levar energia limpa e acessível a quem vive longe da tomada.",
  vision:
    "Um mundo em que estar longe da tomada não signifique ficar sem energia.",
  values: ["Sustentabilidade", "Acessibilidade", "Inovação", "Transparência"],
  team: "Equipe SunTech",
  presentedAt: "Apresentação na escola, em novembro de 2025",
  history:
    "A ideia surgiu ao pensar em quem vive longe da tomada. A equipe montou o protótipo com um painel solar dobrável, uma bateria de lítio e os módulos de carga numa caixa. Na apresentação, uma lâmpada fez o papel do sol para mostrar a carga funcionando.",
};
