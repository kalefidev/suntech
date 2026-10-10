# PROMPT 1: SunTech, site 3D do carregador solar

> Salve como `BRIEF.md` na raiz da pasta do projeto. Este documento substitui o brief e o complemento anteriores.
> Primeira mensagem no Claude Code: `/plan Leia o BRIEF.md inteiro e execute a Fase 0.`

## 0. Modo de trabalho

Você é um creative developer sênior (WebGL, shaders, motion design e páginas de lançamento de produto) atuando como parceiro técnico. O padrão de qualidade é o de páginas de lançamento de hardware de primeira linha e de sites premiados no Awwwards: cada detalhe é uma decisão, nada tem cara de template.

1. Leia o brief inteiro antes de qualquer ação. Ele é a fonte da verdade; releia a seção relevante antes de cada fase.
2. **Se a pasta já tiver código de uma execução anterior**, audite esse código contra este brief na Fase 0 e diga o que reaproveitar, o que corrigir e o que refazer. Não jogue fora o que já está certo.
3. **Fase 0 é só planejamento, sem código.** Entregue o que a seção 13 pede e espere minha aprovação.
4. Aprovado o plano, execute as fases em ordem sem pedir confirmação entre elas. Toda fase fecha com: `typecheck`, `lint`, `build`, `snap`, crítica dos screenshots com a `impeccable` (critique), revisão do código de animação com a `review-animations` do Emil, correção do que estiver abaixo do padrão, commit e atualização do `PROGRESS.md`.
5. Se algo aqui for inviável, prejudicar a performance ou se contradizer, diga e proponha alternativa. Nunca corte nada em silêncio.
6. Em dúvida sobre uma API, consulte a documentação da versão instalada (README em `node_modules` ou docs oficiais). Não suponha assinaturas.
7. Nunca apague nem sobrescreva `BRIEF.md`. Se o scaffolder quiser limpar a pasta, gere o projeto numa pasta temporária e mova os arquivos.
8. Ambiente: Windows com PowerShell. Scripts npm multiplataforma (nada de `rm -rf` ou `cp`; use Node ou `rimraf`). Confira `node -v`: o Vite 8 exige Node 20.19+ ou 22.12+.
9. **Skills e plugins instalados:** as skills oficiais do GSAP, o plugin `frontend-design`, a `impeccable` e as skills do Emil Kowalski, entre outros. No início da Fase 0, liste tudo que está disponível na sessão e diga em que fase e para quê vai usar cada um. Se algum comando de skill só puder ser disparado por mim, diga qual rodar e quando.
10. **Hierarquia das fontes de verdade:**
    - Fatos (empresa, produto, custos, dados externos): só a seção 3 e os arquivos de conteúdo gerados a partir dela.
    - Conceito, textos, design, roteiro e arquitetura: este brief.
    - Execução (easing, duração de microinterações, acessibilidade, contraste e anti-padrões visuais): as skills.
    - Se uma skill contradisser o brief, não siga nenhum dos dois em silêncio: aponte o conflito e proponha uma saída. As regras de motion do Emil valem para as microinterações de interface; a coreografia controlada pelo scroll e a abertura seguem o roteiro da seção 7.
11. Se o contexto ficar longo, registre estado, decisões e pendências no `PROGRESS.md` para retomar sem perder nada.

## 1. Contexto e objetivo

- A **SunTech** é uma empresa criada por uma equipe de estudantes do Colégio Ideal para a Feira de Empreendedorismo do 2º semestre. O produto é o **Carregador Solar SunTech**, um power bank com painel solar dobrável, que existe como protótipo funcional.
- O site tem três funções:
  1. Apresentar a empresa e o produto no estande da feira, num notebook ou numa TV, e no celular dos visitantes, pelo QR code.
  2. Responder, na ordem das aulas, tudo o que a feira pede (Aulas 2 a 6 e a atividade AQ3).
  3. Servir de peça de portfólio do desenvolvedor do site.
- O padrão visual é o de uma página de lançamento de hardware, com a clareza de um trabalho escolar bem organizado.
- Público: professores e avaliadores, visitantes da feira (a maioria no celular) e clientes do desenvolvedor.
- Tom honesto: nada de promessa que o protótipo não cumpre. Sem backend.

## 2. Requisitos (não negociáveis)

1. Depois da abertura e do hero, a página tem **6 partes, na ordem das aulas**:
   1. O problema (Aula 2: Kickoff inspirador)
   2. O cliente (Aula 3: Conhecendo o cliente)
   3. A solução e o diferencial (Aula 4: Diferenciais reais e solução)
   4. A empresa (Aula 5: Criação da empresa)
   5. O pitch (Aula 6: Pitch)
   6. O jovem empreendedor (Atividade AQ3)
2. Todas as perguntas das aulas respondidas na página (checklist da seção 15).
3. Carregador em 3D que se abre com o scroll, mostrando a parte interna, e o funcionamento animado (o caminho da energia), dentro da parte 3.
4. Scroll animado em todo o site.
5. Honestidade: números só da seção 3; estimativas sempre rotuladas; dados externos sempre com fonte.
6. Modo pitch de 3 minutos, para apresentar no estande.
7. Funciona bem no celular (visitantes pelo QR code) e na tela grande do estande.

## 3. Fonte de verdade

Tudo desta seção vira arquivos tipados em `src/content/` (`company.ts`, `product.ts` e `feira.ts`). Nenhum fato aparece no site fora deles.

### Empresa (`company.ts`)

| Campo | Valor |
|---|---|
| Nome | SunTech |
| Escola e evento | Colégio Ideal, Feira de Empreendedorismo, 2º semestre |
| Quem somos | Uma equipe de estudantes. A empresa nasceu dos problemas de hoje: a tecnologia avança, e o planeta pede sustentabilidade |
| O que fazemos | Soluções acessíveis e ecológicas com energia solar. A primeira é o carregador solar portátil |
| Para quem | Principalmente quem vive em lugares remotos; também quem passa o dia longe da tomada |
| Diferencial | Diferente dos power banks convencionais, ele se recarrega com a luz do sol, com um painel bem maior que o dos power banks "solares" comuns |
| Missão (propósito) | Levar energia limpa e acessível a quem vive longe da tomada |
| Visão (destino) | Um mundo em que estar longe da tomada não signifique ficar sem energia |
| Valores e estratégia (trajeto) | Sustentabilidade, acessibilidade, inovação e transparência. Começar pelo carregador solar, validar na feira e depois criar mais produtos solares |
| Operações | Compramos os componentes, montamos e testamos cada carregador, vendemos na feira, nas redes e no site, e oferecemos garantia e peças de reposição |
| Equipe | Equipe SunTech (nomes só com a autorização de cada integrante) |
| Onde foi apresentado | Apresentação na escola, em novembro de 2025 |
| História | A ideia surgiu ao pensar em quem vive longe da tomada. A equipe montou o protótipo com um painel solar dobrável, uma bateria de lítio e os módulos de carga numa caixa. Na apresentação, uma lâmpada fez o papel do sol para mostrar a carga funcionando |

### Produto (`product.ts`)

| Campo | Valor |
|---|---|
| Nome | Carregador Solar SunTech |
| Formato | Duas partes: um painel solar dobrável (duas placas unidas por dobradiça, que abrem como um livro) e uma caixa com a bateria e a eletrônica, cuja tampa abre para cima e de onde sai o cabo de carga |
| Medidas (mm) | Placeholder no código: painel aberto, painel fechado e caixa. Proporções padrão do 3D até eu preencher: caixa 150 × 100 × 40; cada placa 200 × 150 × 6 |
| Cor e material | Caixa preta fosca; painel com moldura escura |
| Painel solar | Duas placas monocristalinas de 6 V e 3 W cada, em paralelo (6 V e 6 W no total) |
| Bateria | 2 células de lítio 18650 de 3,7 V e 2.600 mAh em paralelo: 5.200 mAh, cerca de 19 Wh |
| Controle e proteção de carga | Módulo TP4056 com proteção DW01 (sobrecarga, descarga profunda e curto-circuito), carga de até 1 A |
| Conversor de tensão | Módulo boost de 3,7 V para 5 V, até 1 A |
| Entradas e saídas | Entradas: cabo do painel e USB-C, para recarregar na tomada. Saída: USB-A de 5 V com cabo 3 em 1 (USB-C, Lightning e micro-USB) |
| Outros componentes | Diodo Schottky 1N5819 (impede que a bateria descarregue pelo painel à noite), chave liga/desliga da saída, LED azul de saída ligada e LEDs de carga do módulo (vermelho carregando, azul completo) |
| Tempo de carga | Estimativa: de 6 a 8 horas de sol forte; cerca de 6 horas na tomada |
| Cargas de celular | Estimativa: cerca de 1 carga completa de um celular comum |
| Peso | Placeholder no código, como as medidas |
| Preço | R$ 249 |

### Custos (`product.ts`, rotulados como estimativa)

| Item | Custo estimado |
|---|---|
| 2 placas solares 6 V 3 W | R$ 70 |
| 2 baterias 18650 + suporte | R$ 45 |
| Módulo de carga TP4056 | R$ 7 |
| Conversor 5 V com USB | R$ 8 |
| Cabo 3 em 1 | R$ 20 |
| Caixa, dobradiças e moldura | R$ 25 |
| Diodo, chave, LED, fios e solda | R$ 10 |
| **Total** | **R$ 185** |

Preço de venda de R$ 249, com margem de cerca de 25%.

### Dados externos, sempre com fonte (`feira.ts`)

| Dado | Fonte |
|---|---|
| 990.103 brasileiros viviam sem energia elétrica na Amazônia Legal (estudo do IEMA de 2019) | https://www.poder360.com.br/brasil/quase-1-milhao-nao-tem-acesso-a-energia-eletrica-na-regiao-da-amazonia-legal/ |
| Em novembro de 2020, o Amapá passou mais de 20 dias com falta de energia | https://idec.org.br/node/29026 |
| A d.light nasceu de uma aula em Stanford; leva produtos solares baratos a famílias de baixa renda em áreas rurais (principalmente África e Ásia), que usavam lamparinas de querosene; vende em parcelas pequenas pelo celular; já chegou a mais de 150 milhões de pessoas | https://www.dlight.com e https://earthshotprize.org/winners-finalists/d-light/ |

### Regras

- Os números vêm só desta seção. Estimativas aparecem com o rótulo "estimativa". Dado externo aparece com a fonte logo abaixo.
- Medidas e peso ficam como placeholders tipados no `product.ts` (`null`, com um comentário `// TODO: preencher`). Enquanto estiverem vazios, o 3D usa as proporções padrão e a ficha técnica esconde esses campos. O modelo 3D é parametrizado por essas medidas: quando eu preencher, ele se ajusta sozinho.
- Formato brasileiro: 3,7 V; 2.600 mAh; R$ 249; 140 × 75 mm.
- O protótipo real é um painel dobrável e uma caixa preta improvisada, com a tampa abrindo para cima e módulos, fios e uma luz azul por dentro. O 3D é a versão "produto final" idealizada disso. Se houver fotos em `referencias/`, use como referência de forma e cor.
- Na Fase 0, aponte qualquer inconsistência técnica da ficha (por exemplo, componentes incompatíveis) antes de planejar as cenas que dependem dela.

## 4. Stack (obrigatória)

| Pacote | Para quê |
|---|---|
| Vite 8 + React 19 + TypeScript (strict) | SPA estática. Sem Next.js: não há SSR nem conteúdo dinâmico que justifique, e evita problemas de hidratação com WebGL |
| three + @types/three (última estável) | Motor 3D em WebGL2. WebGPU fica fora: o suporte do R3F a WebGPU ainda está em alpha |
| @react-three/fiber v9 | Renderer React; a v9 é a estável para React 19. Não use a v10 (alpha) |
| @react-three/drei v10 | Environment, Lightformer, RoundedBox, Html, ContactShadows e PerformanceMonitor |
| three-custom-shader-material v6 | Efeitos sobre materiais PBR mantendo a iluminação (brilho do painel, carga da bateria) |
| @react-three/postprocessing | Bloom, Noise e Vignette, com parcimônia |
| gsap 3.15+ e @gsap/react | ScrollTrigger, SplitText, CustomEase e DrawSVG (todos gratuitos). `useGSAP` para cleanup |
| lenis (pacote `lenis`) | Scroll suave sincronizado com o ScrollTrigger |
| maath | Damping e easing dos valores 3D |
| tailwindcss v4 + @tailwindcss/vite | Layout, com os tokens no `@theme` |
| @fontsource-variable/archivo | Fonte self-hosted, com os eixos de peso e de largura (`wdth`), só o subset latin |
| Dev: leva, r3f-perf, playwright | Ajuste fino e medição por import dinâmico só com `?debug`; screenshots automáticos |

- Shaders em arquivos `.glsl` importados com `?raw` (nativo do Vite). Sem plugin de GLSL.
- Texturas procedurais (células do painel, placa de circuito, rótulo da bateria e tela do celular) geradas em canvas 2D em runtime. Nenhum arquivo de imagem ou de modelo 3D, fora as fotos em `referencias/`.
- Qualquer dependência fora desta lista precisa de justificativa no plano.

## 5. Arquitetura (regras que não se quebram)

- **Um único `<Canvas>`** fixo em tela cheia atrás do DOM; o DOM rola por cima. Use `eventSource` no elemento raiz e `eventPrefix="client"`, com o canvas em `pointer-events: none`.
- **O GSAP é a única fonte da coreografia.** Um objeto mutável `sceneState` (`src/scene/state.ts`) guarda todos os parâmetros animáveis: hora do dia (`dayTime`), cobertura de nuvens (`cloudCover`), abertura do painel (`panelOpen`) e da tampa (`lidOpen`), explosão das peças (`explode`), disposição do esquema (`schematic`), fluxo de energia (`flow`), carga da bateria, carga do celular, câmera e pose do produto. Timelines do ScrollTrigger (com scrub) animam esse objeto, e o `useFrame` aplica os valores com `easing.damp` do maath. **Nunca** use `useState` ou re-render para animação por frame.
- `dayTime` é o eixo visual do site: define posição e cor do sol, cor do céu, luzes e cor do texto. Toda cor de cena deriva dele por uma função única (`src/scene/daylight.ts`).
- Lenis com GSAP: `lenis.on('scroll', ScrollTrigger.update)`, `gsap.ticker.add(t => lenis.raf(t * 1000))` e `gsap.ticker.lagSmoothing(0)`.
- **Registro de seções:** cada parte e cada cena têm `data-section`. Em dev ou com `?snap`, o site expõe `window.__lenis`, `window.__ready` e `window.__sections` (id, início e fim em px). `?goto=<id>` pula direto para uma seção, para iterar rápido.
- `ScrollControls` do drei é proibido, porque conflita com Lenis e DOM.
- **O céu é renderizado no WebGL:** um quad em tela cheia com gradiente, disco e brilho do sol, nuvens procedurais (controladas por `cloudCover`), estrelas à noite e grão sutil. As seções do DOM não têm fundo próprio, e o `body` começa com a cor da madrugada para não piscar.
- A cor do texto é uma variável CSS (`--fg`) animada pelo ScrollTrigger conforme `dayTime`.
- Chame `ScrollTrigger.refresh()` depois de `document.fonts.ready` e ao terminar o loader.
- **Code splitting:** a cena 3D entra via `React.lazy`; o texto do hero pinta antes (ele é o LCP).
- Estrutura: `src/content/` (`company.ts`, `product.ts`, `feira.ts` e `copy.ts`), `src/sections/*`, `src/scene/*` (Experience, Sky, Product e suas peças, Energy, Phone, Effects, `state.ts`, `daylight.ts` e `quality.ts`), `src/shaders/*`, `src/lib/*` (lenis, gsap, split e pitch) e `src/config.ts` (`PORTFOLIO_URL`).
- **Tiers de qualidade** (`quality.ts`): alto, médio e baixo, definidos pela viewport e ajustados em tempo real pelo `PerformanceMonitor`. Controlam DPR máximo, partículas, sombras, pós-processamento e resolução das texturas procedurais.
- **Fallback sem WebGL:** se o contexto falhar, um ErrorBoundary troca o canvas por um gradiente em CSS e um diagrama SVG simples do fluxo de energia. Todo o conteúdo continua navegável.

## 6. Direção de arte

### Paleta

| Token | Hex | Papel |
|---|---|---|
| Noite | `#14213D` | Céu da madrugada e da noite; texto sobre fundos claros |
| Céu | `#CFE8F3` | Céu do dia |
| Nuvem | `#F4F7FA` | Texto sobre fundos escuros; superfícies claras |
| Sol | `#FFB22C` | O sol, brilhos, energia entrando e o CTA |
| Brasa | `#E8773A` | Amanhecer e entardecer |
| Grafite | `#2B3036` | Elementos de interface |

Código de cor da energia (informação, sempre acompanhada de rótulo): Luz `#FFD166`, Corrente do painel `#FF9F1C`, Energia guardada `#3DDC97` e Saída de 5 V `#4CC9F0`.

- O céu muda com `dayTime`: madrugada (Noite, clareando no horizonte), amanhecer (Brasa e pêssego), meio-dia (Céu), entardecer (Brasa e Sol), noite (Noite com estrelas) e céu fechado (nuvens cinza-azuladas cobrindo o sol).
- A cor do texto troca (Noite para Nuvem e vice-versa) enquanto o texto está fora de vista ou em transição, nunca com contraste baixo visível. Contraste AA em todos os estados.

### Tipografia

- **Archivo**, uma família só, com o eixo de largura separando os papéis: títulos em Archivo expandida (largura de ~115 a 125, peso de 700 a 800) e texto em Archivo normal (largura 100, peso 400). Números com algarismos tabulares.
- Escala fluida com `clamp()`: título do hero em torno de `clamp(3rem, 9vw, 9rem)`, números de capítulo em torno de `clamp(5rem, 14vw, 12rem)`, títulos de seção em torno de `clamp(2rem, 5vw, 4.5rem)` e corpo de 17px com entrelinha 1.5. Linhas de até ~65 caracteres.
- Evite: destacar uma palavra do título em itálico ou cor, rótulos em caixa-alta acima de títulos, "→" no texto de botões e fonte mono em rótulos pequenos.

### Layout e movimento

- Editorial e assimétrico: texto alinhado à esquerda, produto no centro ou à direita, mudando de pose entre as cenas. Nada de grade de cards iguais.
- **Abertura de capítulo** em cada uma das 6 partes: número grande, título e a aula de origem ("Aula 4: Diferenciais reais e solução"), para quem avalia saber onde está.
- Todo movimento responde a scroll ou ponteiro. O único momento automático é a abertura (e o modo pitch, quando acionado).
- Microinterações de interface (cursor, botões, hover, foco e aparição de callouts) seguem as skills do Emil: rápidas, com ease-out nas entradas e nada surgindo do zero.
- Nada do padrão genérico de fade com slide-up em toda seção. Revelações com CustomEase próxima de `cubic-bezier(0.22, 1, 0.36, 1)`; nos scrubs, ease linear na timeline e damping no `useFrame`.
- Texto com SplitText e máscara por linhas ou palavras, dividido só depois de as fontes carregarem, com `autoSplit` no resize. Leitores de tela leem o texto inteiro.
- Só as cenas 3D ficam presas (pin). As partes de texto rolam normalmente, com revelações leves, para a página não cansar.

## 7. Roteiro da página

O ciclo do dia é a narrativa: **o problema acontece no escuro, e a solução chega com o sol.**

| Seção | Aula | Hora do dia | Comprimento (desktop) | 3D |
|---|---|---|---|---|
| Abertura e hero | – | Madrugada até a manhã | 100vh | Painel se abre; produto em pose de herói |
| 1. O problema | Aula 2 | O céu fecha e escurece | ~200vh | Produto apagado ao fundo |
| 2. O cliente | Aula 3 | Noite | ~200vh | Produto fora de cena |
| 3a. Caça ao diferencial | Aula 4 | Fim da madrugada | ~120vh | Produto fora de cena |
| 3b. A solução | Aula 4 | Amanhecer, meio-dia, entardecer e noite | Três pins: 250, 350 e 200vh | Vista explodida, esquema de energia e celular carregando à noite |
| 3c. Nosso diferencial | Aula 4 | Amanhecer seguinte | ~180vh | Produto montado, girando devagar |
| 4. A empresa | Aula 5 | Dia claro | ~280vh | Produto quieto ao lado |
| 5. O pitch | Aula 6 | Tarde | ~150vh | Produto em pose de herói |
| 6. O jovem empreendedor | AQ3 | Fim de tarde dourado | ~150vh e rodapé | Último giro do produto |

No celular, os comprimentos ficam cerca de 30% menores.

### Abertura (automática, até 2,4 s depois de pronto)

- Loader: uma linha fina que preenche conforme o progresso real (fonte, texturas procedurais e compilação dos shaders com `renderer.compileAsync`). Fica no mínimo 600 ms na tela. Nada de progresso falso.
- Saída do loader: céu de madrugada e o produto em silhueta, com o painel dobrado. O primeiro raio de sol atravessa a cena, o painel se abre como um livro e um reflexo corre pelas células. O nome SunTech sobe de dentro de uma máscara. No fim, `window.__ready = true`.

### Hero (manhã)

- Nome do produto em tamanho discreto e o título "Carregue o celular com a luz do sol."
- Abaixo: "O Carregador Solar SunTech junta um painel solar dobrável e uma bateria. Ele guarda a energia do dia para você usar quando precisar."
- Indicador de scroll discreto: uma linha fina animada, sem texto.
- 3D: painel aberto e caixa lado a lado, ligados pelo cabo, em pose de herói, girando devagar e com sombra de contato. O ponteiro inclina o produto com damping.

### Parte 1: O problema (Aula 2)

- **Abertura:** "Todo empreendimento começa com um problema de verdade. O nosso aparece quando a energia some."
- **Lista de oportunidades**, em três grupos e layout editorial:
  - Energia no dia a dia: o celular descarrega longe da tomada; a luz cai em dia de chuva; em passeios e aulas de campo não há onde carregar.
  - Soluções que não resolvem: o power bank comum só recarrega na tomada; os power banks "solares" baratos têm placas pequenas, que quase não carregam; energia solar para casa ainda custa caro.
  - Sustentabilidade: pilhas e baterias vão para o lixo comum; pouca gente entende como a energia solar funciona.
- **Pergunta norteadora:** "Quais problemas incomodam quem depende de energia longe da tomada?"
  1. O celular descarrega e não há onde carregar.
  2. A energia é instável e falha justamente quando mais se precisa.
  3. As alternativas que existem dependem da tomada ou não funcionam de verdade.
- **Situação-problema escolhida** (bloco de destaque): "Quem vive em lugares remotos ou com energia instável fica sem carregar o celular, que é o seu principal meio de comunicação, trabalho e segurança."
- **Por que isso importa para a sociedade:**
  - "Energia é acesso: é com o celular carregado que uma pessoa fala com a família, trabalha, estuda e pede ajuda numa emergência."
  - O dado do IEMA (990.103 pessoas) e o do apagão no Amapá (mais de 20 dias), com a fonte logo abaixo. Os números contam até o valor final quando entram na tela.
  - "E a energia do sol é limpa: cada carga feita pelo sol é uma carga a menos puxada da rede."
- **Cena:** o céu fecha com nuvens e escurece até a noite.

### Parte 2: O cliente (Aula 3)

- **Persona** (retrato sem foto: uma silhueta simples ou as iniciais, nunca caricatura):
  - Seu Antônio, 54 anos, produtor rural.
  - Mora num sítio a 40 km da cidade, e a luz cai toda vez que chove.
  - Usa o celular para vender a produção, falar com a família e marcar consulta médica.
  - É prático e desconfia de novidade cara. Precisa de algo que funcione sem manual.
- **Frase-síntese** (destaque, no formato da aula): "Nosso cliente é o produtor rural que mora longe da cidade, que enfrenta quedas de energia e falta de tomada para manter o celular carregado, e já tentou usar power bank comum e carregar o celular no carro, mas não resolveu seu problema."
- **Reflexão:**
  1. **Quem é a pessoa mais afetada?** Quem vive em áreas rurais e remotas, com energia instável ou sem energia, e depende do celular.
  2. **Por que isso atrapalha a vida dela?** Ela fica sem comunicação justamente quando mais precisa, perde vendas e gasta tempo e dinheiro indo até a cidade para carregar o celular.
  3. **O que ela já tentou, e por que não deu certo?** Power bank comum, que também acaba e precisa de tomada; carregar no carro ou no gerador, que gasta combustível; e power bank solar barato, que tem placa pequena demais e quase não carrega.
- **Persona x público-alvo** (duas colunas, como no slide da aula):
  - Persona: Seu Antônio, a pessoa por trás do problema.
  - Público-alvo: "Homens e mulheres de 25 a 65 anos que moram ou trabalham em áreas rurais e remotas, com energia instável, e que dependem do celular para trabalhar e se comunicar."
  - Outros públicos, com menos destaque: quem trabalha na rua (entregadores, vendedores e motoristas de app), quem faz trilha e acampa, e qualquer pessoa numa queda de energia.

### Parte 3: A solução e o diferencial (Aula 4)

**3a. Caça ao diferencial: d.light** (vem antes da solução, na ordem do slide)
- Por que escolhemos: trabalha com energia solar, como a nossa ideia, e também nasceu numa sala de aula, em Stanford.
- **Qual problema resolveu?** Famílias sem energia elétrica usavam lamparinas de querosene, que são caras, poluentes e perigosas.
- **Para quem?** Famílias de baixa renda em áreas rurais, principalmente na África e na Ásia.
- **O que fez de diferente?** Produtos solares baratos e pagamento em parcelas pequenas pelo celular.
- **Como a vida dessas pessoas mudou?** Luz segura à noite, celular carregado em casa e crianças estudando à noite. A empresa já chegou a mais de 150 milhões de pessoas.

**3b. A nossa solução**
- Introdução: "O que a SunTech oferece é um produto. O Carregador Solar SunTech é um power bank com painel solar dobrável: de dia, ele guarda a energia do sol; depois, carrega o celular longe da tomada."
- **Cena "Por dentro"** (meio-dia, pin): o sol sobe e a luz fica branca. A câmera se aproxima da caixa em vista 3/4, a tampa abre para cima (como no protótipo) e o interior se separa em camadas: módulos, fiação, bateria, saídas e luz indicadora, cada uma com pequeno atraso e leve rotação. O painel também mostra as suas camadas (vidro, células e base). Callouts (drei `<Html>`, com linhas desenhadas por DrawSVG) aparecem conforme cada peça se separa, com o nome e a função (exemplo: "Painel solar: transforma luz em eletricidade"). Título: "Por dentro, cada peça tem uma função."
- **Cena "Como funciona"** (do meio-dia ao fim da tarde, pin): as peças se reorganizam como um esquema limpo, na ordem do caminho da energia (painel, diodo, controlador, bateria, conversor, saída e celular), ligadas por fios em curva. O caminho acende por etapas, com o código de cor da energia e uma legenda:

| Passo | Título | Texto | Cena |
|---|---|---|---|
| 1 | Captar | O painel transforma luz em eletricidade: a luz movimenta elétrons no silício, e esse movimento vira corrente. | Fótons descem do sol até o painel; as células brilham onde a luz bate |
| 2 | Proteger | O controlador carrega a bateria no ritmo certo e evita sobrecarga. O diodo impede que a energia volte para o painel à noite. | Pulsos laranja correm do painel até o controlador |
| 3 | Guardar | A bateria de lítio armazena a energia até você precisar, de dia ou de noite. | A bateria se enche de verde, de baixo para cima |
| 4 | Entregar | O conversor eleva os 3,7 V da bateria para os 5 V do USB, e o celular carrega normalmente. | Pulsos azuis saem do conversor até o celular; o callout mostra "3,7 V → 5 V" |

- **Cena "A energia fica"** (do entardecer à noite, pin): o esquema se recolhe, a caixa se fecha e o painel se dobra. O sol desce e o céu escurece até a noite com estrelas. O LED azul de saída acende, o cabo 3 em 1 liga a caixa ao celular e a tela mostra a carga subindo com o scroll. Textos: "O sol se põe. A energia fica." e "À noite, o Carregador Solar SunTech carrega o seu celular com o que guardou durante o dia." Transição: "Amanhã, o sol recarrega tudo de novo."

**3c. Nosso diferencial** (amanhecer seguinte)
- **Como isso melhora a vida do cliente?**
  - Mais acessível: leva energia aonde a tomada não chega.
  - Mais simples: é só abrir o painel no sol e ligar o cabo 3 em 1, que serve para qualquer celular.
  - Economia: quem mora longe muitas vezes precisa ir até a cidade ou pagar para carregar o celular. Pelo sol, a carga sai de graça.
  - Sustentável: energia limpa, sem depender da rede.
- **O que fazemos de diferente?**

| | Power bank comum | Power bank solar comum | SunTech |
|---|---|---|---|
| Recarrega com | Tomada | Placa pequena, que costuma levar dias de sol, ou tomada | Painel dobrável grande ou tomada (USB-C) |
| Longe da rede | Funciona até a carga acabar | Quase não recarrega | Volta a carregar sempre que tem sol |
| Conserto | Difícil | Difícil | Peças comuns, fáceis de trocar |

### Parte 4: A empresa (Aula 5)

- **Quem somos:** "A SunTech nasceu de uma pergunta: como usar a tecnologia sem deixar a sustentabilidade de lado? Somos uma equipe de estudantes que transformou essa pergunta num carregador que funciona com a luz do sol."
- **Plano de voo:** a aula usa a metáfora do avião, então apresente missão, visão, valores e operações como um cartão de embarque estilizado, com os quatro campos: Propósito, Destino, Trajeto e Operações (textos da seção 3). Use os tokens do site e um picote sutil. Nada de clipart de avião.
- **Divisão de setores** (três blocos):
  - Produtos: lidera o protótipo. Componentes da ficha, e os testes feitos com uma lâmpada no lugar do sol, medindo quanto tempo a bateria leva para carregar.
  - Finanças: a tabela de custos (seção 3) e o preço de R$ 249. Estratégia: destacar o painel maior que o dos concorrentes, oferecer parcelamento (inspirado na d.light) e comprar peças em quantidade para baixar o custo.
  - Marketing: identidade visual (nome, cores de sol e céu e o slogan "Energia do sol, onde você estiver."), foco na dor do Seu Antônio e o estande (banner com o slogan e os diferenciais, protótipo aberto mostrando as peças, demonstração com a lâmpada e QR code para este site).
- **Materializando a ideia: o protótipo.** "Nosso protótipo é funcional: o painel carrega a bateria de verdade, e a caixa carrega o celular. No estande, o visitante vê as peças por dentro e testa a carga com a lâmpada fazendo o papel do sol." Em seguida, a ficha técnica (só os campos preenchidos, com as estimativas rotuladas) e a história "Nasceu como projeto de escola", em etapas: a ideia, o protótipo e os testes.

### Parte 5: O pitch (Aula 6)

- **Nosso pitch em 3 minutos:** linha do tempo de 0:00 a 3:00 (horizontal no desktop, vertical no celular):

| Tempo | Setor | O que apresenta |
|---|---|---|
| 0:00 a 1:00 | Marketing | O problema e a persona (o Seu Antônio sem energia), a marca e a proposta: "Energia do sol, onde você estiver." |
| 1:00 a 2:00 | Produtos | A solução e o valor: abre o painel, usa a lâmpada no lugar do sol, liga no celular e mostra os diferenciais |
| 2:00 a 3:00 | Finanças | Custos e preço justo: custo de R$ 185, preço de R$ 249 e parcelamento |

- **Botão "Modo pitch":** um tour guiado de exatamente 3 minutos, para o notebook ou a TV do estande. A página rola sozinha pelos momentos-chave, em sincronia com a linha do tempo: situação-problema, persona, produto por dentro, como funciona, diferencial e preço. Mostra um contador discreto e o setor que está falando. Espaço pausa, Esc sai. Com reduced motion, pula de um trecho para o outro sem animação. A sequência (ids das seções e segundos de cada trecho) fica configurável no `feira.ts`, e a rolagem usa `lenis.scrollTo`.

### Parte 6: O jovem empreendedor (AQ3)

- **Título:** "O papel do jovem no empreendedorismo do futuro"
- **Manifesto:**
  - "Nossa geração cresceu com a tecnologia na mão e com o planeta pedindo mudança. Para nós, empreender não é só abrir um negócio: é resolver um problema real sem piorar o mundo."
  - "A SunTech mostra o que jovens podem fazer quando juntam inovação, responsabilidade social e sustentabilidade: pegamos o problema de quem vive longe da tomada e transformamos num produto que funciona."
  - "Ainda faltam muitas coisas, como apoio financeiro, capacitação e planejamento. Mas a feira provou que dá para começar com uma ideia, um protótipo e vontade de aprender."
- **Final:** o sol baixo e dourado, o produto gira uma última vez e aparece "Energia do sol, onde você estiver." com o botão magnético "Ver o pitch em 3 minutos" (inicia o modo pitch).
- **Rodapé:** "Conceito de produto criado a partir do protótipo da equipe SunTech, num projeto escolar do Colégio Ideal. Design e código do site: Kaique Calefi." (com link para `PORTFOLIO_URL`) e a lista "Fontes", com os links da seção 3.

## 8. Especificação técnica do 3D

### Produto (procedural, com as medidas do `product.ts`)

- **Painel dobrável:** duas placas com moldura fina, unidas por dobradiça, com a abertura animada por `panelOpen`. Vidro fino por cima, com clearcoat e reflexo do ambiente (evite `transmission`, a menos que o orçamento permita), caixa de junção atrás e o cabo até a caixa.
- **Células do painel:** `CanvasTexture` gerada em runtime, com células monocristalinas de cantos chanfrados, barramentos prateados e fingers finos, e mapas de cor, rugosidade e metalness. Com CSM, um brilho que corre pelas células conforme o ângulo da luz e a intensidade de `irradiance`.
- **Caixa:** corpo com cantos arredondados (`RoundedBox` e formas extrudadas) e tampa com dobradiça que abre para cima (`lidOpen`), em `MeshPhysicalMaterial` preto fosco com clearcoat leve e o nome SunTech em baixo-relevo. Saída do cabo e LED azul.
- **Placa de circuito:** `CanvasTexture` com máscara de solda, trilhas, pads e serigrafia com os nomes reais dos módulos (TP4056, DW01, boost). Componentes como caixas e cilindros pequenos, instanciados.
- **Bateria:** dois cilindros 18650 com rótulo em `CanvasTexture`, terminal positivo e anel isolante. Carga visível com CSM: um preenchimento emissivo verde controlado por `uCharge`.
- **Fios e cabos:** vermelho e preto, e o cabo 3 em 1, em `TubeGeometry` sobre curvas `CatmullRomCurve3`.

### Vista explodida e esquema

- Cada peça tem três poses: montada, explodida e posição no esquema. `explode` e `schematic` interpolam entre elas, com atraso por peça.
- Callouts ancorados em pontos de cada peça. No celular, viram uma legenda numerada fora do 3D, para não cobrir as peças.

### Fluxo de energia

- Tubos dos fios com shader próprio: pulsos que correm ao longo do `uv.x`, com a cor da etapa e a intensidade vinda de `flow`.
- Fótons: pontos que descem do sol até o painel (shader com atraso por partícula) e somem ao tocar as células.
- Partículas de energia viajando pelas curvas (amostradas por `t`), com Bloom nos pulsos.

### Celular

- Procedural: corpo com cantos arredondados e tela escura com reflexo. A tela é uma `CanvasTexture` com ícone de bateria e porcentagem, redesenhada só quando o número inteiro muda.

### Céu, luz e pós-processamento

- Quad do céu com uniforms derivados de `dayTime` e `cloudCover`: cores de zênite e horizonte, posição e brilho do sol, nuvens em noise, estrelas por hash procedural e grão.
- Luz direcional que segue o sol (quente no amanhecer e no entardecer, branca ao meio-dia, azulada e fraca à noite), com luz hemisférica de apoio. `<Environment>` com `<Lightformer>` para reflexos de estúdio. `ContactShadows` sob o produto quando ele está montado.
- Bloom com limiar alto (sol, LED, pulsos e tela do celular), Noise com grão sutil e Vignette leve, tudo desligado no tier baixo. `GodRays` no amanhecer só no tier alto, e só se couber no orçamento.

## 9. Interface

- **Header:** SunTech à esquerda; à direita, as 6 âncoras numeradas (1 Problema, 2 Cliente, 3 Solução, 4 Empresa, 5 Pitch e 6 Jovem). A numeração é permitida porque segue a sequência das aulas. No celular, as âncoras ficam num botão "Menu" que abre uma folha simples. A rolagem até as âncoras passa pelo Lenis.
- **Progresso:** um indicador fino com a parte atual ("3 de 6").
- **Cursor customizado** só com `pointer: fine`: um círculo pequeno que cresce sobre elementos clicáveis. Desligado em touch e em reduced motion.
- **Botão magnético** no CTA final. Foco visível em tudo que é clicável.
- **Tabelas** (custos e comparação) no estilo do site, rolando na horizontal dentro do próprio container no celular.
- Objetos 3D fora da sua cena não renderizam (`visible = false`), para poupar GPU.

## 10. Responsivo, acessibilidade e reduced motion

- Viewports testadas: 390×844, 768×1024, 1440×900, 1920×1080 e uma TV de 1920×1080 a distância (textos do estande legíveis).
- HTML semântico (`header`, `main`, `section` com títulos, `footer`), com o canvas em `aria-hidden`.
- O "como funciona" também existe como texto no DOM (lista ordenada com os quatro passos), porque o esquema 3D não é lido por leitor de tela.
- Com `prefers-reduced-motion: reduce`: sem Lenis (scroll nativo), pins só onde o conteúdo depende deles, vista explodida já aberta e parada, fluxo de energia como caminhos coloridos estáticos, e céu trocando de hora com um crossfade curto.
- Touch: nenhum efeito depende de hover. O produto reage à velocidade do scroll em vez do ponteiro.

## 11. Orçamento de performance

- Desktop com GPU integrada: pelo menos 55 fps. Celular intermediário: pelo menos 30 fps estáveis (o `PerformanceMonitor` rebaixa o tier se cair).
- JS inicial (antes do chunk 3D) de até 150 KB gzip; total de até 500 KB gzip.
- LCP (texto do hero) de até 2 s no desktop. CLS perto de zero: pré-carregue a fonte.
- Texturas procedurais geradas uma vez, no tamanho do tier. Nada de redesenhar canvas por frame.
- Sem vazamento: timelines, ScrollTriggers e SplitText limpos no unmount (`useGSAP`), e geometrias, materiais e texturas descartados quando desmontados.

## 12. SEO e entrega

- `<title>` e meta description falando da SunTech e do carregador solar, Open Graph com imagem 1200×630 gerada a partir de um screenshot do hero, e favicon em SVG (um sol simples).
- `README.md` com como rodar, como publicar na Vercel e como editar os textos (`src/content/`).
- `CLAUDE.md` curto: stack, comandos, as regras da seção 5 e o aviso para consultar `BRIEF.md` e `PROGRESS.md`.
- Scripts: `dev`, `build`, `preview`, `typecheck`, `lint` e `snap`.

### Script `snap` (verificação visual obrigatória)

- Faz o build, sobe o `preview` e abre o Chromium via Playwright em headless com `--use-angle=swiftshader` e `--enable-unsafe-swiftshader`. Se o WebGL não renderizar, rode headed.
- Viewports 1440×900 e 390×844 (com touch). Abre a URL com `?snap`, espera `window.__ready` e, para cada seção de `window.__sections`, rola com `window.__lenis.scrollTo(y, { immediate: true })` até o início, o meio e o fim. Espera ~900 ms em cada ponto e salva em `.snapshots/<fase>/<viewport>-<secao>-<ponto>.png`.
- Roda mais uma passada com `reducedMotion: 'reduce'`.
- Captura os erros do console; qualquer erro faz o script falhar.
- `.snapshots/` fica no `.gitignore`.

## 13. Fases e critérios de aceite

**Fase 0: plano, sem código.** Entregue:
1. A auditoria do código existente, se houver (o que reaproveitar, corrigir e refazer).
2. As inconsistências técnicas da ficha, se houver.
3. Tokens finais (paleta, céu por hora do dia e escala tipográfica) e o que você ajustou, com o motivo.
4. Wireframes em ASCII do hero, de cada uma das 6 partes e das três cenas 3D, no desktop e no mobile.
5. O mapa de scroll: comprimento de cada seção, pins e quais campos do `sceneState` mudam em cada trecho, incluindo as curvas de `dayTime` e `cloudCover` na página inteira.
6. A lista das peças do produto com as três poses e a ordem da explosão.
7. Árvore de componentes e tabela dos tiers de qualidade.
8. Riscos técnicos com plano B.
9. Revisão crítica com a `frontend-design` e a `impeccable`: o que no plano parece genérico e como você mudou.
10. O mapa de skills por fase.

Depois, espere minha aprovação.

**Fase 1: fundação.** Scaffold, Tailwind, fonte, Lenis com GSAP, `sceneState`, `daylight.ts`, céu em shader (com nuvens), registro de seções com `?goto=`, tiers, `?debug`, script `snap`, os arquivos de conteúdo da seção 3, `CLAUDE.md`, `PROGRESS.md` e git. Configure também o contexto de design da `impeccable` a partir deste brief.
Aceite: o céu passa por todas as horas do dia (e pelo céu fechado) ao rolar a página inteira, com conteúdo provisório; o build está limpo; o `snap` gera imagens por seção.

**Fase 2: o produto, a abertura e o hero.** Modelagem procedural completa, materiais, texturas procedurais, luz e sombra.
Aceite: no screenshot do hero, o produto parece um objeto fotografado em estúdio, não um conjunto de caixas.

**Fase 3: partes 1 e 2** (problema e cliente), com as aberturas de capítulo e a navegação numerada.
Aceite: todo o conteúdo das Aulas 2 e 3 aparece, legível no escuro, com as fontes dos dados.

**Fase 4: parte 3** (d.light, "Por dentro", "Como funciona", "A energia fica" e o diferencial).
Aceite: no snap do meio de "Como funciona", as quatro etapas estão visíveis e legendadas, e dá para entender o caminho da energia sem ler o texto.

**Fase 5: parte 4** (quem somos, cartão de embarque, setores com custos e o protótipo com a ficha técnica).
Aceite: nenhum número fora da seção 3; as estimativas aparecem rotuladas.

**Fase 6: partes 5 e 6** (pitch, modo pitch, manifesto, final e rodapé).
Aceite: o modo pitch dura exatamente 3 minutos, pausa com espaço e sai com Esc.

**Fase 7: polimento.** Pós-processamento, cursor, botão magnético, reduced motion, fallback sem WebGL, SEO e OG, e uma passada de performance. Depois, `audit` e `polish` da `impeccable` (e a CLI `npx impeccable detect` no preview, se estiver disponível) e a `improve-animations` do Emil. Rode o `snap` final completo e faça a autocrítica: remova o efeito que menos contribui.
Aceite: todo o checklist da seção 15 marcado.

## 14. Proibido

- Números fora da seção 3 e estimativa apresentada como medição.
- Certificações ou selos (INMETRO, CE), depoimentos e avaliações falsos.
- Prometer economia na conta de luz. O argumento honesto é autonomia e energia de graça pelo sol.
- Nome, foto ou voz de integrantes da equipe sem autorização.
- Modelos 3D, HDRIs ou imagens externas (fora as fotos em `referencias/`).
- `ScrollControls` do drei, `useState` em loop de animação e pacotes alpha ou beta.
- Fade-up genérico em toda seção, cards arredondados idênticos e gradientes decorativos sem função.
- Rótulos em caixa-alta, "→" em botões, uma palavra destacada no título e fundo quase-preto no lugar de uma cor escolhida.
- Conteúdo duplicado entre as partes.

## 15. Checklist final

**Técnico**
- [ ] `typecheck`, `lint` e `build` sem erros e sem warnings relevantes.
- [ ] Nenhum erro no console, no desktop e no mobile.
- [ ] Snap final revisado imagem por imagem.
- [ ] Reduced motion e fallback sem WebGL testados.
- [ ] Contraste AA em todas as horas do dia.
- [ ] Orçamento de performance cumprido, ou o desvio explicado.
- [ ] Achados da `impeccable` e das skills do Emil resolvidos ou justificados.
- [ ] Instruções para eu medir o FPS com `?debug` no meu PC e no meu celular.
- [ ] `README.md`, `CLAUDE.md` e `PROGRESS.md` atualizados, e relatório final (o que foi feito, desvios e por quê, pendências).

**Conteúdo das aulas (tudo precisa aparecer na página, nesta ordem)**
- [ ] Aula 2: lista de oportunidades, os 3 problemas da pergunta norteadora, a situação-problema e por que ela importa para a sociedade.
- [ ] Aula 3: persona (nome e características), a frase "Nosso cliente é...", as 3 perguntas da reflexão e persona x público-alvo.
- [ ] Aula 4: caça ao diferencial (as 4 perguntas), o que oferecemos, como melhora a vida do cliente e o que fazemos de diferente.
- [ ] Aula 5: propósito, destino, trajeto e operações; os 3 setores; custos e preço; o protótipo.
- [ ] Aula 6: o pitch em 3 minutos, com problema e persona, solução e valor, quem apresenta cada parte e o preço justo.
- [ ] AQ3: o papel do jovem no empreendedorismo do futuro.
- [ ] Todo número vem da seção 3; estimativas rotuladas; dados externos com fonte.
