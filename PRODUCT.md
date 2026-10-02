# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Em ordem de prioridade (confirmada pelo usuário em 01/10/2026):

1. **Professores e avaliadores da Feira de Empreendedorismo** do Colégio Ideal.
   Avaliam o trabalho da equipe pelas aulas (Aulas 2 a 6 e a atividade AQ3) e
   precisam achar cada resposta em segundos, na ordem das aulas. Leem no
   notebook ou na TV do estande e, às vezes, no próprio celular.
2. **Visitantes da feira pelo QR code**, quase todos no celular, em pé, no 4G
   e com pouco tempo. Precisam entender o produto antes de o 3D terminar de
   carregar.
3. **Apresentadores do estande** (a equipe SunTech). Usam o modo pitch de 3
   minutos no notebook ou na TV, com Espaço para pausar e Esc para sair, e o
   site como apoio da fala.
4. **Clientes do desenvolvedor do site** (Kaique Calefi). Veem a página como
   peça de portfólio e procuram o crédito e o link no rodapé.

## Product Purpose

Site de uma página da **SunTech**, empresa criada por uma equipe de
estudantes do Colégio Ideal para a Feira de Empreendedorismo do 2º semestre,
e do seu produto, o **Carregador Solar SunTech**: um power bank com painel
solar dobrável, que existe como protótipo funcional.

Três funções, nesta ordem:

1. apresentar a empresa e o produto no estande (notebook ou TV) e no celular
   dos visitantes;
2. responder, na ordem das aulas, tudo o que a feira pede;
3. servir de peça de portfólio do desenvolvedor.

Sucesso: o avaliador acha cada resposta das aulas sem procurar; o visitante
entende o produto no celular em poucos segundos; o pitch de 3 minutos roda
sozinho no estande.

## Positioning

Diferente dos power banks convencionais, o carregador se recarrega com a luz
do sol, com um painel dobrável bem maior que o dos power banks "solares"
comuns, e usa peças comuns, fáceis de trocar. O argumento é autonomia longe
da tomada e carga de graça pelo sol, nunca economia na conta de luz. O 3D é a
versão "produto final" idealizada do protótipo real, e é apresentado assim.

## Operating Context

- **Estande:** notebook ou TV de 1920×1080, vista a uns 3 m. A equipe
  apresenta com o modo pitch (tour guiado de exatamente 3 minutos) e
  demonstra o protótipo aberto, com uma lâmpada no lugar do sol.
- **QR code** no banner do estande leva ao site no celular do visitante.
- **Avaliação escolar:** a página segue a ordem das aulas (Aula 2: Kickoff
  inspirador; Aula 3: Conhecendo o cliente; Aula 4: Diferenciais reais e
  solução; Aula 5: Criação da empresa; Aula 6: Pitch; Atividade AQ3), com o
  número e a aula de origem em cada parte. O checklist da seção 15 do
  `BRIEF.md` é a lista do que precisa aparecer.
- **O protótipo físico:** um painel solar dobrável (duas placas com
  dobradiça) e uma caixa preta improvisada, com a tampa abrindo para cima e
  módulos, fios e uma luz azul por dentro. Foi apresentado na escola em
  novembro de 2025.

## Capabilities and Constraints

- Site estático, sem backend e sem venda real.
- **Fatos só de `src/content/`** (`company.ts`, `product.ts` e `feira.ts`),
  que vêm da seção 3 do `BRIEF.md`. Estimativas (tempo de carga, cargas de
  celular e custos) aparecem sempre com o rótulo "estimativa". Dados externos
  (IEMA, apagão no Amapá e d.light) aparecem sempre com a fonte logo abaixo.
- **Ainda não medidos:** medidas e peso do produto (`null` no `product.ts`;
  o 3D usa proporções padrão e a ficha técnica esconde esses campos), tempo
  real de carga e quantas cargas de celular a bateria rende.
- **A confirmar no protótipo (F6):** se o conversor boost sai do OUT do
  módulo TP4056, para a proteção contra descarga funcionar.
- A margem de cerca de 25% é sobre o preço de venda. A frase sobre o que o
  custo não inclui ficou de fora, por decisão do usuário (01/10/2026).
- Terminologia real do circuito, sem trocar por termos genéricos: módulo
  TP4056 com proteção DW01, diodo Schottky 1N5819, conversor boost de 3,7 V
  para 5 V, células monocristalinas e baterias 18650.
- Formato brasileiro de números: 3,7 V; 2.600 mAh; R$ 249.
- Proibido: certificações ou selos, depoimentos e avaliações, promessa de
  economia na conta de luz, nome, foto ou voz de integrantes sem autorização
  e qualquer número fora da seção 3.

## Brand Commitments

- Empresa: **SunTech**. Produto: **Carregador Solar SunTech**. Slogan:
  "Energia do sol, onde você estiver."
- Tom honesto: nada de promessa que o protótipo não cumpre. Padrão de página
  de lançamento de hardware, com a clareza de um trabalho escolar bem
  organizado. Português do Brasil.
- A equipe aparece só como "Equipe SunTech" até cada integrante autorizar o
  próprio nome.
- Crédito no rodapé: "Conceito de produto criado a partir do protótipo da
  equipe SunTech, num projeto escolar do Colégio Ideal. Design e código do
  site: Kaique Calefi", com link para `https://site.kaiquecalefi.online`
  (`src/config.ts`).

## Evidence on Hand

- Protótipo funcional: o painel carrega a bateria de verdade, e a caixa
  carrega o celular. Demonstrado na escola em novembro de 2025.
- Três dados externos com fonte: IEMA (via Poder360), Idec e d.light (com o
  Earthshot Prize).
- Não existem: fotos do protótipo (não há pasta `referencias/`), medidas,
  peso, medições de carga, depoimentos, clientes ou prêmios. Nada disso pode
  ser inventado.

## Product Principles

1. **A ordem das aulas é a navegação.** Cada parte tem o número e a aula de
   origem, e o avaliador nunca precisa procurar uma resposta.
2. **Um número, uma fonte.** Todo fato vem de `src/content/`; toda estimativa
   é rotulada; todo dado externo tem a fonte logo abaixo.
3. **O problema acontece no escuro, e a solução chega com o sol.** O ciclo do
   dia conta a história da página, da madrugada da abertura ao fim de tarde
   do final.
4. **Legível antes de impressionante.** No celular e no 4G, o texto do hero
   aparece antes do 3D; nada depende de hover; o modo pitch funciona no
   estande só com o teclado.
5. **Autonomia, não economia.** O valor é energia longe da tomada e carga de
   graça pelo sol.

## Accessibility & Inclusion

- Contraste WCAG AA em todas as horas do céu, medido nos pixels reais pelo
  `snap` (`scripts/snap.mjs`).
- `prefers-reduced-motion: reduce` tem caminho próprio: sem Lenis e sem pins,
  cenas no estado final e céu trocando de hora com um crossfade curto.
- "Como funciona" também existe como lista ordenada no DOM, e o canvas é
  `aria-hidden`.
- Alvos de toque de 44 px ou mais, foco visível em tudo que é clicável e
  teclado no menu e no modo pitch (Espaço e Esc).
- Sem WebGL, um fallback em CSS e SVG mantém todo o conteúdo navegável.
