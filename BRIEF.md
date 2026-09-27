# BRIEF 1: SunTech, carregador solar portátil (site 3D de produto para portfólio)

> Salve como `BRIEF.md` na raiz de uma pasta vazia. **Antes de rodar, revise a seção 2.** Medidas e peso ficam como placeholders no código. Primeira mensagem no Claude Code:
> `/plan Leia o BRIEF.md inteiro e execute a Fase 0.`

## 0. Como você deve trabalhar

Você é um creative developer sênior (WebGL, shaders, motion design e páginas de lançamento de produto) atuando como parceiro técnico. O padrão de qualidade é o de páginas de lançamento de hardware de primeira linha e de sites premiados no Awwwards: cada detalhe é uma decisão, nada tem cara de template.

1. Leia o brief inteiro antes de qualquer ação. Ele é a fonte da verdade; releia a seção relevante antes de cada fase.
2. **Fase 0 é só planejamento, sem código.** Entregue o que a seção 13 pede e espere minha aprovação.
3. Aprovado o plano, execute as fases em ordem sem pedir confirmação entre elas. Ao fim de cada fase: `typecheck`, `lint`, `build`, `snap`, crítica dos screenshots com a `impeccable` (critique), revisão do código de animação com a `review-animations` do Emil, correção do que estiver abaixo do padrão, commit e atualização do `PROGRESS.md`.
4. Se algo aqui for inviável, prejudicar a performance ou se contradizer, diga e proponha alternativa. Nunca corte nada em silêncio.
5. Em dúvida sobre uma API, consulte a documentação da versão instalada (README em `node_modules` ou docs oficiais). Não suponha assinaturas.
6. Nunca apague nem sobrescreva `BRIEF.md`. Se o scaffolder quiser limpar a pasta, gere o projeto numa pasta temporária e mova os arquivos.
7. Ambiente: Windows com PowerShell. Scripts npm multiplataforma (nada de `rm -rf` ou `cp`; use Node ou `rimraf`). Confira `node -v`: o Vite 8 exige Node 20.19+ ou 22.12+.
8. **Use as skills e plugins instalados.** Já estão instalados, entre outros: as skills oficiais do GSAP, o plugin `frontend-design`, a `impeccable` (Paul Bakaus) e as skills do Emil Kowalski. No início da Fase 0, liste todas as skills e plugins disponíveis na sessão e diga em que fase e para quê vai usar cada um; ignore os que não têm relação com o projeto. Se algum comando de skill só puder ser disparado por mim, me diga qual rodar e quando.
9. **Hierarquia das fontes de verdade:**
   - Fatos da empresa e do produto (quem somos, componentes, números, história): só a seção 2 e os arquivos `company.ts` e `product.ts` gerados a partir dela.
   - Conceito, textos, paleta, tipografia, storyboard e arquitetura: este brief.
   - Execução (easing, duração de microinterações, acessibilidade, contraste e anti-padrões visuais): as skills.
   - Se uma skill contradisser o brief, não siga nenhum dos dois em silêncio: aponte o conflito e proponha uma saída. As regras de motion do Emil valem para as microinterações de interface; a coreografia controlada pelo scroll e a abertura seguem o storyboard.
10. Se o contexto ficar longo, registre estado, decisões e pendências no `PROGRESS.md` para retomar sem perder nada.

## 1. Objetivo

- Site da SunTech, empresa criada pela nossa equipe num projeto escolar, e do seu primeiro produto: um carregador portátil de energia solar. É uma página de produto em 3D, no estilo de um lançamento de hardware, que trata o protótipo como um produto de verdade.
- O site também responde, com clareza, as perguntas de um trabalho escolar: quem somos, o que fazemos, para que e para quem.
- Vai para o meu portfólio, para provar design, 3D, motion e storytelling de produto. Sem backend.
- Público: donos de negócio (meus clientes) e visitantes do portfólio, no celular e no desktop. Precisa impressionar nos primeiros 5 segundos, explicar o produto sem jargão e rodar liso num celular intermediário.
- Tom: produto real e honesto. Nada de promessa que o protótipo não cumpre.

## 2. Ficha da empresa e do produto

Vira `src/content/company.ts` e `src/content/product.ts`, tipados. São a única fonte de fatos do site.

### Empresa

Preenchida a partir da apresentação em vídeo; revise antes de rodar.

| Campo | Valor |
|---|---|
| Nome | SunTech |
| Quem somos | Uma equipe de estudantes. A empresa nasceu dos problemas de hoje: a tecnologia avança, e o planeta pede sustentabilidade |
| O que fazemos | Soluções acessíveis e ecológicas com energia solar. A primeira é o carregador solar portátil |
| Para quem | Principalmente quem vive em lugares remotos; também quem passa o dia longe da tomada |
| Diferencial | Diferente dos power banks convencionais, ele se recarrega com a luz do sol |
| Missão | Levar energia limpa e acessível a quem vive longe da tomada |
| Visão | Um mundo em que estar longe da tomada não signifique ficar sem energia |
| Valores | Sustentabilidade, acessibilidade, inovação e transparência |
| Equipe | Equipe SunTech (nomes só com a autorização de cada integrante) |
| Onde foi apresentado | Apresentação na escola, em novembro de 2025 |
| História do projeto | A ideia surgiu ao pensar em quem vive longe da tomada. A equipe montou o protótipo com um painel solar dobrável, uma bateria de lítio e os módulos de carga numa caixa. Na apresentação, uma lâmpada fez o papel do sol para mostrar a carga funcionando |

### Produto

| Campo | Valor |
|---|---|
| Nome do produto | Carregador Solar SunTech |
| Formato | Duas partes: um painel solar dobrável (duas placas unidas por dobradiça, que abrem como um livro) e uma caixa com a bateria e a eletrônica, de onde saem os cabos de carga. A tampa da caixa abre para cima |
| Medidas (mm) | Placeholder no código: painel aberto, painel fechado e caixa. Proporções padrão do 3D até eu preencher: caixa 150 × 100 × 40; cada placa 200 × 150 × 6 |
| Cor e material | Caixa preta fosca; painel com moldura escura |
| Painel solar | Dobrável, com duas placas monocristalinas de 6 V e 3 W cada, em paralelo (6 V e 6 W no total) |
| Bateria | 2 células de lítio 18650 de 3,7 V e 2.600 mAh em paralelo: 5.200 mAh, cerca de 19 Wh |
| Controle e proteção de carga | Módulo TP4056 com proteção DW01 (sobrecarga, descarga profunda e curto-circuito), carga de até 1 A |
| Conversor de tensão | Módulo boost de 3,7 V para 5 V, até 1 A |
| Entradas e saídas | Entradas: cabo do painel e USB-C, para recarregar na tomada. Saída: USB-A de 5 V com cabo 3 em 1 (USB-C, Lightning e micro-USB) |
| Outros componentes | Diodo Schottky 1N5819 (impede que a bateria descarregue pelo painel à noite), chave liga/desliga da saída, LED azul de saída ligada e LEDs de carga do módulo (vermelho carregando, azul completo) |
| Tempo de carga no sol e na tomada | Estimativa: de 6 a 8 horas de sol forte; cerca de 6 horas na tomada |
| Cargas de celular por bateria cheia | Estimativa: cerca de 1 carga completa de um celular comum |
| Peso | Placeholder no código, como as medidas |
| Preço | [opcional; vazio esconde] |
| Fotos do protótipo | [opcional: pasta `referencias/`, só com autorização de quem aparece] |

Regras:

- Os números vêm só desta ficha. Tempo de recarga e número de cargas são estimativas calculadas a partir das especificações e aparecem no site com o rótulo "estimativa" até serem medidos. Campo vazio some do site.
- Medidas e peso ficam como placeholders tipados no `product.ts` (`null`, com um comentário `// TODO: preencher`). Enquanto estiverem vazios, o 3D usa as proporções padrão da tabela e a ficha técnica esconde esses campos. O modelo 3D é parametrizado por essas medidas: quando eu preencher, ele se ajusta sozinho.
- Formato brasileiro: 3,7 V; 2.600 mAh; 140 × 75 mm.
- A explicação de "como funciona" e os callouts seguem os componentes reais daqui. Se o circuito não tiver alguma peça citada neste brief (diodo, conversor), a cena correspondente se adapta.
- O protótipo real: um painel dobrável e uma caixa preta improvisada, com a tampa abrindo para cima e módulos, fios e uma luz azul por dentro. Se houver fotos em `referencias/`, use como referência de forma e cor. O 3D é a versão "produto final" idealizada disso, não uma cópia do acabamento escolar.

## 3. A grande ideia

**Um dia de sol, guardado para quando você precisar.** A página é um dia: madrugada, manhã, meio-dia, entardecer e noite. A posição do sol comanda a luz da cena, a cor do céu e a energia que entra no carregador. Ao meio-dia a gente abre o produto e vê a energia correr por dentro; à noite, a energia guardada carrega o celular. Depois amanhece de novo, e a página explica para quem o produto serve.

O elemento memorável é **a vista explodida com o fluxo de energia**. Todo o resto é quieto e disciplinado para ela brilhar.

## 4. Stack (obrigatória)

| Pacote | Para quê |
|---|---|
| Vite 8 + React 19 + TypeScript (strict) | SPA estática. Sem Next.js: não há SSR nem conteúdo dinâmico que justifique, e evita problemas de hidratação com WebGL |
| three + @types/three (última estável) | Motor 3D em WebGL2. WebGPU fica fora: o suporte do R3F a WebGPU ainda está em alpha |
| @react-three/fiber v9 | Renderer React. A v9 é a estável para React 19. Não use a v10 (alpha) |
| @react-three/drei v10 | Environment, Lightformer, RoundedBox, Html, ContactShadows e PerformanceMonitor |
| three-custom-shader-material v6 | Efeitos sobre materiais PBR mantendo a iluminação (brilho do painel, carga da bateria) |
| @react-three/postprocessing | Bloom, Noise e Vignette, com parcimônia |
| gsap 3.15+ e @gsap/react | ScrollTrigger, SplitText, CustomEase e DrawSVG (todos gratuitos). `useGSAP` para cleanup |
| lenis (pacote `lenis`) | Scroll suave sincronizado com o ScrollTrigger |
| maath | Damping e easing dos valores 3D |
| tailwindcss v4 + @tailwindcss/vite | Layout, com os tokens no `@theme` |
| @fontsource-variable/archivo | Fonte self-hosted com os eixos de peso e de largura (`wdth`), só o subset latin |
| Dev: leva, r3f-perf, playwright | Ajuste fino e medição por import dinâmico só com `?debug`; screenshots automáticos |

- Shaders em arquivos `.glsl` importados com `?raw` (nativo do Vite). Sem plugin de GLSL.
- Texturas procedurais (células do painel, placa de circuito, rótulo da bateria, tela do celular) geradas em canvas 2D em runtime. Nenhum arquivo de imagem ou de modelo 3D.
- Qualquer dependência fora desta lista precisa de justificativa no plano.

## 5. Arquitetura (regras que não se quebram)

- **Um único `<Canvas>`** fixo em tela cheia atrás do DOM; o DOM rola por cima. Use `eventSource` no elemento raiz e `eventPrefix="client"`, com o canvas em `pointer-events: none`.
- **O GSAP é a única fonte da coreografia.** Um objeto mutável `sceneState` (`src/scene/state.ts`) guarda todos os parâmetros animáveis: hora do dia (`dayTime`), abertura do painel (`panelOpen`) e da tampa (`lidOpen`), explosão das peças (`explode`), disposição do esquema (`schematic`), progresso do fluxo de energia (`flow`), carga da bateria, carga do celular, câmera e pose do produto. Timelines do ScrollTrigger (com scrub) animam esse objeto, e o `useFrame` aplica os valores nos objetos e uniforms com `easing.damp` do maath. **Nunca** use `useState` ou re-render para animação por frame.
- `dayTime` é o eixo do site: um valor contínuo que define posição e cor do sol, cor do céu, luzes e cor do texto. Toda cor de cena deriva dele por uma função única (`src/scene/daylight.ts`).
- Lenis com GSAP: `lenis.on('scroll', ScrollTrigger.update)`, `gsap.ticker.add(t => lenis.raf(t * 1000))` e `gsap.ticker.lagSmoothing(0)`.
- Registro de atos: cada seção tem `data-act`. Em dev ou com `?snap`, o site expõe `window.__lenis`, `window.__ready` e `window.__acts` (id, início e fim em px de cada ato). `?act=<id>` pula direto para o ato, para iterar rápido.
- `ScrollControls` do drei é proibido, porque conflita com Lenis e DOM.
- **O céu é renderizado no WebGL**: um quad em tela cheia com gradiente, disco e brilho do sol, estrelas procedurais à noite e grão sutil. As seções do DOM não têm fundo próprio, e o `body` começa com a cor da madrugada para não piscar.
- A cor do texto é uma variável CSS (`--fg`) animada pelo ScrollTrigger conforme `dayTime`.
- Chame `ScrollTrigger.refresh()` depois de `document.fonts.ready` e ao terminar o loader.
- **Code splitting:** a cena 3D entra via `React.lazy`, então o texto do hero pinta antes (ele é o LCP).
- Estrutura sugerida: `src/content/` (`company.ts`, `product.ts` e `copy.ts`), `src/sections/*`, `src/scene/*` (Experience, Sky, Product e suas peças, Energy, Phone, Effects, `state.ts`, `daylight.ts` e `quality.ts`), `src/shaders/*`, `src/lib/*` (lenis, gsap, split) e `src/config.ts` (`PORTFOLIO_URL` e `WHATSAPP_URL` opcional).
- **Tiers de qualidade** (`quality.ts`): alto, médio e baixo, definidos pela viewport e ajustados em tempo real pelo `PerformanceMonitor` do drei. Eles controlam DPR máximo, partículas, sombras, pós-processamento e resolução das texturas procedurais.
- Fallback sem WebGL: se o contexto falhar, um ErrorBoundary troca o canvas por um gradiente em CSS e um diagrama SVG simples do fluxo de energia. O conteúdo continua 100% navegável.

## 6. Direção de arte

### Paleta

| Token | Hex | Papel |
|---|---|---|
| Noite | `#14213D` | Céu da madrugada e da noite; texto sobre fundos claros |
| Céu | `#CFE8F3` | Céu do dia |
| Nuvem | `#F4F7FA` | Texto sobre fundos escuros; superfícies claras |
| Sol | `#FFB22C` | O sol, brilhos, energia entrando e o CTA |
| Brasa | `#E8773A` | Amanhecer e entardecer |
| Grafite | `#2B3036` | Case do produto (se a ficha não definir outra cor) e elementos de interface |

Código de cor da energia. É informação, não decoração, e sempre aparece junto de um rótulo:

| Etapa | Cor |
|---|---|
| Luz | `#FFD166` |
| Corrente do painel | `#FF9F1C` |
| Energia guardada | `#3DDC97` |
| Saída de 5 V | `#4CC9F0` |

- O céu muda com `dayTime`: madrugada (Noite, clareando no horizonte), amanhecer (Brasa e pêssego no horizonte), meio-dia (Céu), entardecer (Brasa e Sol) e noite (Noite com estrelas).
- A cor do texto troca (Noite para Nuvem e vice-versa) enquanto o texto está fora de vista ou em transição, nunca com contraste baixo visível. Contraste AA em todos os estados.

### Tipografia

- **Archivo**, uma família só, com o eixo de largura separando os papéis. Títulos em Archivo expandida (largura de ~115 a 125, peso de 700 a 800), com cara de engenharia e de produto; texto em Archivo normal (largura 100, peso 400). Números da ficha técnica com algarismos tabulares.
- Escala fluida com `clamp()`: título do hero em torno de `clamp(3rem, 9vw, 9rem)`; títulos de seção em torno de `clamp(2rem, 5vw, 4.5rem)`; corpo de 17px com entrelinha 1.5. Linhas de até ~65 caracteres.
- Evite: destacar uma palavra do título em itálico ou cor, rótulos em caixa-alta acima de títulos, textos separados por "·", "→" no texto de botões e fonte mono em rótulos pequenos.

### Layout

- Editorial e assimétrico: texto alinhado à esquerda, produto no centro ou à direita, mudando de pose entre os atos. Nada de grade de cards.
- Mobile: produto no terço superior e texto abaixo; a vista explodida e o esquema de energia se organizam na vertical.

### Movimento

- Todo movimento responde a scroll ou ponteiro. O **único momento automático** é a abertura.
- Microinterações de interface (cursor, botões, hover, foco e aparição dos callouts) seguem as skills do Emil Kowalski: rápidas, com ease-out nas entradas e nada surgindo do zero.
- Nada do padrão genérico de fade com slide-up em cada seção. Cada revelação segue o storyboard.
- Revelações com CustomEase próxima de `cubic-bezier(0.22, 1, 0.36, 1)`. Nos scrubs, ease linear na timeline e damping no `useFrame`.
- Texto com SplitText e máscara por linhas ou palavras. Divida só depois de as fontes carregarem e use `autoSplit` para re-dividir no resize. Leitores de tela precisam ler o texto inteiro.

## 7. Storyboard

Comprimentos para desktop; no mobile, os pins ficam cerca de 30% mais curtos. `{nome}` e os dados técnicos vêm do `product.ts`.

### Ato 0: abertura (madrugada, automática, até 2.4 s depois de pronto)

- Loader: uma linha fina que preenche conforme o progresso real (fonte, texturas procedurais e compilação dos shaders com `renderer.compileAsync`). Fica no mínimo 600 ms na tela. Nada de progresso falso.
- Saída do loader: céu de madrugada e o produto em silhueta, com o painel dobrado. O primeiro raio de sol atravessa a cena, o painel se abre como um livro e um reflexo corre pelas células. O nome do produto sobe de dentro de uma máscara. No fim, `window.__ready = true`.

### Ato 1: hero (manhã, 100vh)

- DOM: o nome do produto em tamanho discreto e o título "Carregue o celular com a luz do sol." Abaixo: "O {nome} junta um painel solar dobrável e uma bateria. Ele guarda a energia do dia para você usar quando precisar." Indicador de scroll discreto: uma linha fina animada, sem texto.
- 3D: painel aberto e caixa lado a lado, ligados pelo cabo, em pose de herói e girando devagar, com sombra de contato. O ponteiro inclina o produto com damping. A luz da manhã é quente e baixa.

### Ato 2: por dentro (meio-dia, pin de 300vh)

- O sol sobe até o alto e a luz fica branca e dura. A câmera se aproxima da caixa em vista 3/4. A tampa abre para cima, como no protótipo, e o interior se separa em camadas conforme as peças reais: módulos, fiação, bateria, saídas e luz indicadora. Cada camada se separa com um pequeno atraso e uma leve rotação. O painel também mostra as suas camadas: vidro, células e base.
- Callouts (drei `<Html>`, DOM acessível) aparecem conforme cada peça se separa, com a linha desenhada por DrawSVG: o nome da peça e uma frase sobre a função dela, a partir do `product.ts`. Exemplo: "Painel solar: transforma luz em eletricidade."
- DOM: título "Por dentro, cada peça tem uma função."

### Ato 3: como funciona (do meio-dia ao fim da tarde, pin de 400vh)

- As peças saem da pilha e se reorganizam no espaço como um esquema limpo, na ordem do caminho da energia: painel, proteção, controlador, bateria, conversor, saídas e celular. Fios em curva ligam tudo.
- O caminho acende por etapas, com o código de cor da energia. Aqui a numeração faz sentido, porque é um processo:

| Passo | Título | Texto | Cena |
|---|---|---|---|
| 1 | Captar | O painel transforma luz em eletricidade: a luz movimenta elétrons no silício, e esse movimento vira corrente. | Fótons descem do sol até o painel, e as células brilham onde a luz bate |
| 2 | Proteger | O controlador carrega a bateria no ritmo certo e evita sobrecarga. {se houver diodo: O diodo impede que a energia volte para o painel à noite.} | Pulsos laranja correm do painel até o controlador |
| 3 | Guardar | A bateria de lítio armazena a energia até você precisar, de dia ou de noite. | A bateria se enche de verde, de baixo para cima |
| 4 | Entregar | O conversor eleva os 3,7 V da bateria para os 5 V do USB, e o celular carrega normalmente. | Pulsos azuis saem do conversor até o celular, e o callout mostra "3,7 V → 5 V" |

- Os textos se adaptam ao circuito real. Uma legenda discreta explica as quatro cores.

### Ato 4: o sol se põe, a energia fica (do entardecer à noite, pin de 200vh)

- O esquema se recolhe, a caixa se fecha e o painel se dobra. O sol desce, o céu passa pela Brasa e escurece até a noite com estrelas.
- No escuro, o LED azul de saída acende e o cabo 3 em 1 liga a caixa ao celular. A tela do celular mostra a carga subindo com o scroll.
- DOM: "O sol se põe. A energia fica." e, abaixo, "À noite, o {nome} carrega o seu celular com o que guardou durante o dia."
- Transição: "Amanhã, o sol recarrega tudo de novo." O céu amanhece rápido, e a luz de dia fica até o fim da página para os textos serem fáceis de ler.

### Ato 5: para quem é (dia, cerca de 320vh)

- O produto fica fixo de um lado e muda de pose a cada uso: painel aberto ao sol, painel dobrado para levar, caixa com os cabos.
- DOM: título "Para quem vive longe da tomada." e quatro usos, revelados um por vez. O primeiro é o público principal da SunTech e ganha mais destaque:
  - Quem vive em lugares remotos: em sítios, zonas rurais e comunidades isoladas, onde a energia não chega ou falha, o sol vira a tomada.
  - Quem trabalha na rua: entregadores, vendedores e motoristas de app que não podem parar para carregar o celular.
  - Quem gosta de estrada e trilha: camping, praia e viagem, onde tomada é luxo.
  - Quando falta luz: numa queda de energia, o celular continua ligado para você falar com quem importa.

### Ato 6: por que vale (dia, cerca de 250vh)

- Três motivos, nesta ordem:
  - Autonomia: você decide quando e onde carregar.
  - Energia limpa: a carga vem do sol, não da rede.
  - Energia de graça: depois de comprado, cada carga feita pelo sol não custa nada.

Depois, o diferencial da ficha da empresa, numa comparação curta e honesta com o título "Diferente de um power bank comum":

| | Power bank comum | {nome} |
|---|---|---|
| Recarrega com | Tomada | Luz do sol ou tomada (USB-C) |
| Longe da rede | Funciona até a carga acabar | Volta a carregar sempre que tem sol |
| Fonte de energia | Rede elétrica | Sol, uma fonte limpa |

- Ficha técnica: uma tabela elegante só com os campos preenchidos do `product.ts`. Os números contam até o valor final quando entram na tela.

### Ato 7: quem somos (dia, cerca de 250vh)

A parte institucional, com os fatos do `company.ts`, em blocos editoriais e com o produto em 3D quieto ao lado. Os títulos "Quem somos", "O que fazemos" e "Para quem" aparecem de forma explícita, porque quem avalia o trabalho procura essas respostas.

- **Quem somos:** "A SunTech nasceu de uma pergunta: como usar a tecnologia sem deixar a sustentabilidade de lado? Somos uma equipe de estudantes que transformou essa pergunta num carregador que funciona com a luz do sol."
- **O que fazemos:** "Criamos soluções acessíveis e ecológicas com energia solar. A primeira é um carregador portátil: o painel fotovoltaico capta a luz do sol, e a bateria de lítio guarda essa energia, como um power bank."
- **Para que e para quem:** "Para que ninguém fique sem bateria por estar longe da tomada, principalmente quem vive em lugares remotos, e para que essa energia venha de uma fonte limpa."
- **Missão, visão e valores:** só os que estiverem preenchidos na ficha.
- **Do protótipo ao produto:** título "Nasceu como projeto de escola." e a história em etapas (a ideia, o protótipo e os testes), com a equipe e onde o projeto foi apresentado. É uma sequência, então pode ter marcador de etapa. Se houver fotos em `referencias/`, mostre-as com um tratamento consistente com a paleta; sem fotos, a seção usa só texto e o produto em 3D.

### Ato 8: final (fim de tarde dourado, 100vh e rodapé)

- O sol volta a ficar baixo e dourado, e o produto gira uma última vez em pose de herói.
- DOM: "Energia do sol, onde você estiver." Botão magnético principal "Ver outros projetos" (`PORTFOLIO_URL`) e, se houver `WHATSAPP_URL`, um secundário "Falar comigo".
- Rodapé: "Conceito de produto criado a partir do protótipo da equipe SunTech, num projeto escolar. Design e código do site: Kaique Calefi." com link para o portfólio.

## 8. Especificação técnica do 3D

### Produto (procedural, com as medidas do `product.ts`)

- Painel dobrável: duas placas com moldura fina, unidas por dobradiça, com a abertura animada por `sceneState.panelOpen`. Vidro fino por cima, com clearcoat e reflexo do ambiente (evite `transmission`, a menos que o orçamento permita), caixa de junção atrás e o cabo até a caixa.
- Caixa: corpo com cantos arredondados (`RoundedBox` e formas extrudadas) e tampa com dobradiça que abre para cima (`sceneState.lidOpen`), em `MeshPhysicalMaterial` preto fosco com clearcoat leve e o nome SunTech em baixo-relevo. Saídas dos cabos e luz indicadora azul.
- Células do painel: `CanvasTexture` gerada em runtime com as células (monocristalinas, de cantos chanfrados), os barramentos prateados e os fingers finos, com mapas de cor, rugosidade e metalness. Com CSM, um brilho que corre pelas células conforme o ângulo da luz e a intensidade de `irradiance`.
- Placa de circuito: `CanvasTexture` com máscara de solda, trilhas, pads e serigrafia com os nomes reais dos módulos. Componentes como caixas e cilindros pequenos, instanciados: chips, capacitores e conectores.
- Bateria: cilindros (ou bolsa, se for LiPo) com rótulo em `CanvasTexture`, terminal positivo e anel isolante. A carga fica visível com CSM: um preenchimento emissivo verde controlado por `uCharge`.
- Saídas metálicas, luz indicadora azul emissiva, fios vermelho e preto e cabos de carga em `TubeGeometry` sobre curvas `CatmullRomCurve3`.

### Vista explodida e esquema

- Cada peça tem três poses: montada, explodida e posição no esquema. `sceneState.explode` e `sceneState.schematic` interpolam entre elas, com atraso por peça.
- Callouts ancorados em pontos de cada peça, com linhas em SVG desenhadas por DrawSVG. No mobile, os callouts viram uma legenda numerada fora do 3D, para não cobrir as peças.

### Fluxo de energia

- Tubos dos fios com shader próprio: pulsos que correm ao longo do `uv.x`, com a cor da etapa e a intensidade vinda de `sceneState.flow`.
- Fótons: pontos que descem do sol até o painel (shader com atraso por partícula) e somem ao tocar as células.
- Partículas de energia viajando pelas curvas (amostradas por `t`), com Bloom nos pulsos.

### Celular

- Procedural: corpo com cantos arredondados e tela escura com reflexo. A tela é uma `CanvasTexture` com ícone de bateria e porcentagem, redesenhada só quando o número inteiro muda.

### Céu e luz

- Quad do céu com uniforms derivados de `dayTime`: cores de zênite e horizonte, posição e brilho do sol, intensidade das estrelas (hash procedural) e grão.
- A luz direcional segue a posição do sol (quente no amanhecer e no entardecer, branca ao meio-dia, azulada e fraca à noite), com uma luz hemisférica de apoio. `<Environment>` com `<Lightformer>` para reflexos de estúdio.
- `ContactShadows` sob o produto nos atos em que ele está montado.

### Pós-processamento

- Bloom com limiar alto (sol, LED, pulsos de energia e tela do celular), Noise com grão sutil e Vignette leve. Tudo desligado no tier baixo. `GodRays` no amanhecer só no tier alto, e só se couber no orçamento.

## 9. Interface e microinterações

- Header: SunTech à esquerda, âncoras para Como funciona, Para quem e Quem somos à direita, e indicador de progresso fino. No celular, as âncoras ficam num botão "Menu" que abre uma folha simples. A rolagem até as âncoras passa pelo Lenis.
- Cursor customizado só com `pointer: fine`: um círculo pequeno que cresce sobre elementos clicáveis. Desligado em touch e em reduced motion.
- Botão magnético no CTA final. Foco visível em tudo que é clicável.
- Objetos 3D fora do seu ato não renderizam (`visible = false`), para poupar GPU.

## 10. Responsivo, acessibilidade e reduced motion

- Viewports testadas: 390×844, 768×1024, 1440×900 e 1920×1080.
- HTML semântico (`header`, `main`, `section` com títulos, `footer`), com o canvas em `aria-hidden`.
- O "como funciona" também existe como texto no DOM (uma lista ordenada com os quatro passos), porque o esquema 3D não é lido por leitor de tela.
- Com `prefers-reduced-motion: reduce`: sem Lenis (scroll nativo), pins só onde o conteúdo depende deles, a vista explodida aparece já aberta e parada, o fluxo de energia vira caminhos coloridos estáticos e o céu troca de hora com um crossfade curto.
- Touch: nenhum efeito depende de hover. O produto reage à velocidade do scroll em vez do ponteiro.

## 11. Orçamento de performance

- Desktop com GPU integrada: pelo menos 55 fps. Celular intermediário: pelo menos 30 fps estáveis (o `PerformanceMonitor` rebaixa o tier se cair).
- JS inicial (antes do chunk 3D) de até 150 KB gzip; total de até 500 KB gzip.
- LCP (texto do hero) de até 2 s no desktop. CLS perto de zero: pré-carregue a fonte.
- Texturas procedurais geradas uma vez, no tamanho do tier. Nada de redesenhar canvas por frame.
- Sem vazamento: timelines, ScrollTriggers e SplitText limpos no unmount (`useGSAP`), e geometrias, materiais e texturas descartados quando desmontados.

## 12. SEO e entrega

- `<title>` e meta description falando da SunTech e do carregador solar, Open Graph com imagem 1200×630 gerada a partir de um screenshot do hero, e favicon em SVG (um sol simples).
- `README.md` com como rodar, como publicar na Vercel e créditos.
- `CLAUDE.md` curto: stack, comandos, as regras da seção 5 e o aviso para consultar `BRIEF.md` e `PROGRESS.md`.
- Scripts: `dev`, `build`, `preview`, `typecheck`, `lint` e `snap`.

### Script `snap` (verificação visual obrigatória)

- Faz o build, sobe o `preview` e abre o Chromium via Playwright em headless com `--use-angle=swiftshader` e `--enable-unsafe-swiftshader`. Se o WebGL não renderizar, rode headed.
- Viewports 1440×900 e 390×844 (com touch). Abre a URL com `?snap`, espera `window.__ready` e, para cada ato em `window.__acts`, rola com `window.__lenis.scrollTo(y, { immediate: true })` até o início, o meio e o fim do ato. Espera ~900 ms em cada ponto e salva em `.snapshots/<fase>/<viewport>-<ato>-<ponto>.png`.
- Roda mais uma passada com `reducedMotion: 'reduce'`.
- Captura os erros do console; qualquer erro faz o script falhar.
- `.snapshots/` fica no `.gitignore`.

## 13. Fases e critérios de aceite

**Fase 0: plano, sem código.** Entregue:

1. Qualquer inconsistência técnica na ficha da seção 2 (por exemplo, componentes incompatíveis). Aponte antes de planejar as cenas que dependem dela.
2. Tokens finais (paleta, céu por hora do dia e escala tipográfica) e o que você ajustou deste brief, com o motivo.
3. Wireframes em ASCII de cada ato, no desktop e no mobile.
4. Mapa de scroll: comprimento em vh de cada ato, pins e quais campos do `sceneState` mudam em cada trecho, incluindo a curva de `dayTime` na página inteira.
5. Lista das peças do produto com as três poses (montada, explodida e esquema) e a ordem da explosão.
6. Árvore de componentes e tabela dos tiers de qualidade.
7. Riscos técnicos com plano B.
8. Revisão crítica com a `frontend-design` e a `impeccable`: o que no plano parece padrão genérico e como você mudou.
9. Mapa de skills: quais skills e plugins você vai usar em cada fase.

Depois, espere minha aprovação.

**Fase 1: fundação.** Scaffold, Tailwind, fonte, Lenis com GSAP, `sceneState`, `daylight.ts`, céu em shader, registro de atos com `?act=`, tiers, `?debug`, script `snap`, `product.ts` a partir da seção 2, `CLAUDE.md`, `PROGRESS.md` e git. Configure também o contexto de design da `impeccable` (o setup `teach` ou o arquivo de contexto que ela usa) a partir deste brief, para que as críticas avaliem o trabalho contra este conceito, e não contra um padrão genérico.
Aceite: o céu passa pelas horas do dia ao rolar a página inteira (com conteúdo provisório), o build está limpo e o `snap` gera imagens por ato.

**Fase 2: o produto.** Modelagem procedural completa, materiais, texturas procedurais, luz, sombra, abertura e hero.
Aceite: no screenshot do hero, o produto parece um objeto fotografado em estúdio, não um conjunto de caixas.

**Fase 3: por dentro.** Vista explodida e callouts.
Aceite: todas as peças são distinguíveis e os callouts são legíveis no desktop e no mobile.

**Fase 4: como funciona.** Esquema, fios, fótons, pulsos e carga da bateria.
Aceite: no snap do meio do ato, as quatro etapas estão visíveis e legendadas, e dá para entender o caminho da energia sem ler o texto.

**Fase 5: a noite.** Pôr do sol, noite, LED, cabo e celular carregando.
Aceite: a transição do dia para a noite é contínua, e o texto continua legível durante toda ela.

**Fase 6: para quem é, por que vale (com a comparação) e ficha técnica.**
Aceite: nenhum número fora do `product.ts`.

**Fase 7: quem somos e final.** Seção institucional (quem somos, o que fazemos, para que e para quem, missão, visão e valores, e a história do protótipo), fotos (se houver), CTA e rodapé.
Aceite: quem abre o site encontra as respostas para quem somos, o que fazemos, para que e para quem, sem precisar procurar.

**Fase 8: polimento.** Pós-processamento, cursor, botão magnético, reduced motion, fallback sem WebGL, SEO e OG, e uma passada de performance. Depois, rode as passadas de qualidade: `audit` e `polish` da `impeccable` (e a CLI `npx impeccable detect` no preview, se estiver disponível) e a `improve-animations` do Emil, aplicando o que fizer sentido. Rode o `snap` final completo e faça a autocrítica: remova um acessório, ou seja, o efeito que menos contribui.
Aceite: todo o checklist da seção 15 marcado.

## 14. Proibido

- Números fora da ficha (capacidade, tempo de carga, eficiência, preço ou vendas) e estimativa apresentada como medição.
- Certificações ou selos (INMETRO, CE), depoimentos e avaliações falsos.
- Nome, foto ou voz de colegas sem autorização deles.
- Prometer economia na conta de luz. Uma carga de celular custa poucos centavos na tomada; o argumento honesto é autonomia e energia de graça pelo sol.
- Modelos 3D, HDRIs ou imagens externas, fora as fotos que eu colocar em `referencias/`.
- `ScrollControls` do drei, `useState` em loop de animação e pacotes alpha ou beta.
- Fade-up genérico em toda seção, cards arredondados idênticos e gradientes decorativos sem função.
- Rótulos em caixa-alta, "→" em botões, uma palavra destacada no título e fundo quase-preto no lugar de uma cor escolhida.

## 15. Checklist final

- [ ] `typecheck`, `lint` e `build` sem erros e sem warnings relevantes.
- [ ] Nenhum erro no console, no desktop e no mobile.
- [ ] Snap final revisado imagem por imagem, no desktop e no mobile.
- [ ] Reduced motion testado.
- [ ] Fallback sem WebGL testado, forçando a falha.
- [ ] Contraste AA em todas as horas do dia.
- [ ] Todo número do site vem do `product.ts`, e as estimativas aparecem rotuladas.
- [ ] Quem somos, o que fazemos, para que e para quem respondidos na página.
- [ ] Achados da `impeccable` e das skills do Emil resolvidos ou justificados.
- [ ] Orçamento de performance cumprido, ou o desvio explicado.
- [ ] Instruções para eu medir o FPS com `?debug` no meu PC e no meu celular.
- [ ] `README.md`, `CLAUDE.md` e `PROGRESS.md` atualizados.
- [ ] Relatório final: o que foi feito, desvios do brief e por quê, problemas conhecidos, e como rodar e publicar.
