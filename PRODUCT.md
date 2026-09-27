# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vite 8 + React 19 + TypeScript (strict), three.js + @react-three/fiber v9 +
@react-three/drei v10, three-custom-shader-material, @react-three/postprocessing,
gsap 3.15+ (ScrollTrigger, SplitText, CustomEase, DrawSVGPlugin) + Lenis,
maath, Tailwind CSS v4, @fontsource-variable/archivo. Não é uma escolha
delegada: é exigida explicitamente pelo brief do cliente (`BRIEF.md`, seção
4), com justificativa por item (SPA estática sem backend; WebGL2 via three,
não WebGPU; R3F v9 é a versão estável para React 19). Sem SSR — não há
conteúdo dinâmico que justifique, e evita problemas de hidratação com WebGL.

## Users

Dois públicos, ambos avaliando o mesmo site com objetivos diferentes:

1. **Donos de negócio (clientes em potencial de Kaique Calefi):** avaliam o
   site como amostra de trabalho de design/3D/motion para decidir se
   contratam. Veem primeiro no celular ou desktop, sem contexto prévio.
2. **Visitantes do portfólio:** recrutadores, colegas e curiosos navegando o
   portfólio; querem entender rápido o que é o produto e a qualidade da
   execução.

Há também um público institucional secundário e explícito: quem avalia o
trabalho escolar da equipe SunTech precisa encontrar, sem procurar, as
respostas para "quem somos, o que fazemos, para que e para quem".

## Product Purpose

Uma página de produto em 3D, no estilo de lançamento de hardware, para o
**Carregador Solar SunTech** — um protótipo real de carregador portátil que
se recarrega com luz do sol, criado por uma equipe de estudantes (SunTech)
como projeto escolar. O site trata o protótipo como um produto de verdade,
sem prometer o que ele não cumpre. Sucesso = duas coisas ao mesmo tempo: (a)
prova de design/3D/motion/storytelling de produto para o portfólio de quem
construiu o site; (b) resposta clara às perguntas do trabalho escolar. Sem
backend, sem venda real.

## Positioning

Diferente de um power bank convencional, ele se recarrega com a luz do sol —
autonomia longe da tomada, não dependência de uma carga prévia na rede.
Vendido honestamente como protótipo escolar idealizado em 3D, não como
produto comercial pronto: sem certificações, sem depoimentos, sem promessa de
economia na conta de luz (o argumento é autonomia e energia de graça pelo
sol, não economia).

## Operating Context

- Uso real do protótipo: quem vive em lugares remotos (público principal),
  quem trabalha na rua, quem viaja/acampa, e situações de queda de energia.
- Uso do site: celular e desktop, precisa impressionar nos primeiros 5
  segundos e rodar liso em celular intermediário (≥30fps) e desktop com GPU
  integrada (≥55fps).
- O protótipo físico existente: painel solar dobrável (duas placas com
  dobradiça) + caixa preta com bateria/eletrônica, tampa abrindo para cima,
  módulos e fios visíveis por dentro, LED azul. Apresentado na escola em
  novembro de 2025, com uma lâmpada no lugar do sol para a demonstração.

## Capabilities and Constraints

- Todo número do site (tempo de carga, cargas de celular, capacidade,
  tensão) vem só de `src/content/product.ts`, gerado a partir da seção 2 do
  `BRIEF.md`; nada é medido ainda além do que está lá. Tempo de recarga e
  número de cargas são estimativas calculadas, rotuladas como "estimativa"
  até serem medidas de verdade.
- Medidas físicas e peso do produto são placeholders (`null` tipado) — o 3D
  usa proporções padrão até serem preenchidas; ficha técnica esconde esses
  campos enquanto estiverem vazios.
- Sem modelos 3D, HDRIs ou imagens externas: tudo é geometria procedural e
  texturas em canvas 2D geradas em runtime.
- Proibido (seção 14 do brief): números fora da ficha, certificações/selos,
  depoimentos ou avaliações falsos, nome/foto/voz de colega sem autorização,
  promessa de economia na conta de luz.
- Terminologia real do circuito (não trocar por termos genéricos): módulo
  TP4056 com proteção DW01, diodo Schottky 1N5819, conversor boost 3,7V→5V,
  células monocristalinas, baterias 18650.

## Brand Commitments

- Nome do produto: **Carregador Solar SunTech**. Empresa: **SunTech**, uma
  equipe de estudantes.
- Tom de voz: "produto real e honesto. Nada de promessa que o protótipo não
  cumpre." Português do Brasil, formatação numérica BR (3,7 V; 2.600 mAh).
- Crédito fixo no rodapé: "Conceito de produto criado a partir do protótipo
  da equipe SunTech, num projeto escolar. Design e código do site: Kaique
  Calefi", com link para o portfólio (`PORTFOLIO_URL`, pendente de
  preenchimento).
- Nomes de integrantes da equipe só aparecem com autorização individual; sem
  autorização confirmada, o site usa apenas "Equipe SunTech".

## Evidence on Hand

Nenhuma foto do protótipo real está disponível hoje (pasta `referencias/` não
existe no projeto). Se fotos forem adicionadas depois, com autorização de
quem aparece, a seção institucional (Ato 7) passa a usá-las; até lá, essa
seção é só texto — texto futuro não deve fabricar depoimentos, prêmios ou
métricas de uso que não existem.

## Product Principles

1. **Honestidade de protótipo escolar.** Trate o protótipo como produto real
   sem inflar o que ele faz; toda estimativa é rotulada como estimativa.
2. **Um número, uma fonte.** Todo dado técnico vem só de `product.ts`/
   `company.ts`; nunca escrito solto em copy ou componente.
3. **A vista explodida com o fluxo de energia é o elemento memorável.** Todo
   o resto da página (layout, tipografia, movimento) fica quieto e
   disciplinado para essa cena brilhar — não para competir com ela.
4. **Autonomia e energia de graça, não economia.** O argumento de valor é
   liberdade de estar longe da tomada e custo zero por carga solar depois da
   compra — nunca economia na conta de luz.
5. **Institucional sem parecer institucional.** As respostas "quem somos, o
   que fazemos, para que e para quem" precisam existir de forma explícita e
   fácil de achar, sem que a página vire uma página de "sobre nós" genérica.

## Accessibility & Inclusion

Contraste AA obrigatório em todas as horas do dia simuladas pelo céu (ver
`scene/daylight.ts` — a troca de cor do texto segue uma regra de contraste
medida, não "dia claro / noite escuro"). `prefers-reduced-motion: reduce`
tem um caminho dedicado (seção 10 do brief): sem Lenis, pins só onde o
conteúdo depende deles, vista explodida já aberta e parada, fluxo de energia
como caminhos estáticos, crossfade curto entre horas do dia. O "como
funciona" também existe como lista ordenada no DOM, pois o esquema 3D não é
lido por leitor de tela. Nenhum efeito depende de hover (toque não tem
hover).
