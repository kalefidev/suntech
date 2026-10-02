# SunTech v2: Fase 0 revisada (plano, sem código)

> Aprovado em 01/10/2026. Substitui a versão de 28/09, que continua em `~/.claude/plans/os-arquivos-da-pasta-goofy-cake.md`.

## Contexto

- O `PROMPT-1-SUNTECH.md` de Downloads é idêntico ao `BRIEF.md` e ao `PROMPT-1-SUNTECH.md` da raiz.
- Esta não é a primeira Fase 0 deste prompt:
  - Em 28/09 você aprovou um plano completo, que está em `docs/fase-0.md` e em `~/.claude/plans/os-arquivos-da-pasta-goofy-cake.md`.
  - A Fase 1 começou na branch `v2` e parou no limite da sessão (28/09, 16:26).
  - **Nada da v2 foi commitado.** `PROGRESS.md`, `CLAUDE.md` e `PRODUCT.md` ainda descrevem a v1.
- Estado medido hoje:
  - `tsc` sem erros.
  - `oxlint` com 3 avisos.
  - `build` e `snap` nunca rodaram na v2.
- O que este plano faz:
  - audita o código v2 pela metade contra o brief, como pede a seção 0, item 2;
  - revisa o plano de 28/09 com olhos novos;
  - consolida os 10 itens da seção 13.

  O que mudou em relação a 28/09 está marcado com **(muda)**. O resto já foi aprovado e continua valendo.
- Ao aprovar:
  1. `docs/fase-0.md` passa a ser esta versão.
  2. Fecho a Fase 1.
  3. Sigo da Fase 2 à 7 sem parar entre elas. Toda fase termina com commit e `PROGRESS.md`.

## O que muda em relação ao plano de 28/09

| # | Mudança | Por quê |
|---|---|---|
| M1 | O motor da coreografia vira uma **timeline mestre do GSAP** (com scrub), montada a partir da mesma tabela de `scene/choreography.ts`. Sai o interpolador próprio de `lib/tracks.ts` | A seção 5 pede "timelines do ScrollTrigger (com scrub)". A Fase 1 trocou isso por código próprio sem avisar, o que a seção 0 (item 5) proíbe. Uma timeline **única**, e não uma por seção, evita que dois ScrollTriggers escrevam o mesmo campo quando a página pula (pitch, `?goto`, âncoras) |
| M2 | **Nenhum respiro vazio.** As 3 travessias da zona morta de contraste acontecem dentro das cenas presas, onde a timeline controla o texto: o nascer do sol no começo de "Por dentro", o pôr do sol no começo de "A energia fica" e o nascer do dia seguinte no fim de "A energia fica". Esse último ilustra "Amanhã, o sol recarrega tudo de novo.": o painel se abre para o sol. Sai o respiro de 160svh antes da Parte 4, e a 3c passa a ser lida na luz da manhã | O respiro era 1,6 tela de céu vazio, sem papel na história. Agora toda travessia é um momento do produto, e o nascer do dia seguinte faz eco à abertura |
| M3 | "Como funciona": as 4 etapas aparecem numeradas e legendadas, apagadas, assim que o esquema se forma. Acendem em sequência até 70% do pin, e de 70% a 100% o circuito inteiro funciona junto | O aceite da Fase 4 pede as 4 etapas visíveis e legendadas **no meio** do pin. No plano antigo, no meio só a 1 e a 2 estavam acesas |
| M4 | O `snap` mede o contraste nos **pixels reais**: fotografa a tela com o texto transparente e amostra o fundo sob cada caixa de texto. Sai o modelo em TypeScript que copia o shader (`skyColorAt` e `skyProbe`, cerca de 70 linhas) | Mede o que o visitante vê (nuvens, produto, bloom, grão) e apaga código que precisaria ficar sincronizado à mão com o GLSL |
| M5 | A guarda de contraste do shader nunca escurece o disco do sol nem o brilho em volta dele. Hoje, no celular, ela cobre a tela inteira e deixa o sol do hero opaco | É um bug visual no celular. Com texto claro, o sol só aparece no hero, à direita e no horizonte, acima do bloco de texto. O `snap` confere |
| M6 | Tier de entrada: celular com `deviceMemory` ≤ 4 GB ou com ≤ 4 núcleos entra no baixo, como o plano aprovado dizia. Hoje o código usa ≤ 2 núcleos | Evita os primeiros segundos travando num celular fraco antes de o `PerformanceMonitor` reagir |
| M7 | Receita de estúdio para o aceite da Fase 2 ("parece fotografado em estúdio"), no item 6 | O plano antigo listava as peças, mas não dizia como chegar ao visual de foto |
| M8 | O modo pitch é testado com o relógio falso do Playwright (`page.clock`): os 180 s, as paradas, a pausa e o Esc rodam em segundos, não em 3 minutos reais. O ensaio real fica para o fim | "Exatamente 3 minutos" vira um teste repetível |

---

## 1. Auditoria do código existente

**v1 (commit `856ae2f`, branch `master`).** A auditoria de 28/09 continua valendo, e a Fase 1 da v2 já aplicou quase tudo dela:
- fonte com o eixo `wdth`;
- céu novo;
- seções novas;
- `dpr` em faixa;
- loader com progresso real;
- header novo.

**Fase 1 da v2 (não commitada).** Li todos os arquivos.

| Arquivo ou área | Veredito | Motivo e o que falta |
|---|---|---|
| `content/*` (`company`, `product`, `feira`, `copy`, `format`) | **Reaproveitar** | Conferi frase a frase contra as seções 3 e 7: todo o texto das aulas já está lá, em formato pt-BR (`Intl`, espaço inseparável antes da unidade). Uma correção: o total de custos passa a sair da soma da tabela, e não de um 185 digitado à parte |
| `lib/env`, `gsap`, `split`, `lenis`, `sections`, `loading`, `useReducedMotion` | Reaproveitar | Já têm `?goto` e `?nowebgl`, `window.__sections` em ordem (com o trecho do pin), Lenis sincronizado como pede a seção 5, plugins de texto sob demanda e progresso por tarefas reais. Sai só a marca de respiro (M2) |
| `lib/tracks.ts` | **Refazer o motor** (M1) | O formato dos dados em `choreography.ts` fica. Com reduced motion, a timeline salta para o ponto de repouso de cada seção |
| `lib/stage.ts` (pins) | Reaproveitar | Pin com `gsap.matchMedia`, comprimento por viewport e nenhum pin com reduced motion |
| `lib/opening.ts`, `sections/Loader.tsx` | Reaproveitar | Mínimo de 600 ms; pula com roda, toque ou tecla; sem o bug de ordem de efeitos da v1. A Fase 2 soma o produto, o raio e a máscara |
| `scene/state.ts` | Reaproveitar | Todos os campos da seção 5, sem importar `three` |
| `scene/daylight.ts`, `shaders/sky.*` | Reaproveitar e corrigir | Keyframes, tempestade, nuvens fbm, estrelas fixas, grão estático e cor linear estão certos. Falta corrigir a guarda (M5) e apagar `skyColorAt`/`skyProbe` (M4) |
| `scene/quality.ts` | Corrigir | Regra de entrada (M6). O teto e o `fallback` estão certos |
| `scene/SceneCanvas`, `Experience`, `CanvasErrorBoundary`, `Fallback`, `DebugPerf` | Reaproveitar | `dpr` em faixa, tone mapping Neutral, `compileAsync` no loader e fallback com o céu em CSS |
| `scene/Sky.tsx` | Corrigir | Resolver os 2 avisos do `oxlint`: o `useMemo` e a mutação de uniforms. A mutação é o padrão do R3F, então a regra fica desligada só em `src/scene`, com o motivo. Saltos grandes de hora (`?goto`, reduced motion) não animam: o damping só vale para diferenças pequenas, senão o céu passa dias inteiros num piscar |
| `sections/*` | Reaproveitar a estrutura e o texto | Todas as respostas do checklist da seção 15 já estão no DOM, em HTML semântico. O layout é provisório, e a coreografia entra nas Fases 2 a 6 |
| `sections/Header.tsx` | Reaproveitar e corrigir | As 6 âncoras, o "N de 6" e o menu com foco preso e Esc estão certos. Corrigir o aviso do lint (ref no cleanup) e só chamar `setPart` quando a parte mudar |
| `sections/Respiro.tsx` e o respiro antes da Parte 4 | **Apagar** (M2) | |
| `index.css` | Reaproveitar | Fonte com `wdth` (90 KB, subset latin, com preload), tokens, escala, superfícies do navegador e layout base. Os ajustes vêm em cada fase |
| `index.html`, `vite.config.ts` | Reaproveitar | O OG completo (imagem 1200×630 com URL absoluta) fica para a Fase 7 |
| `scripts/snap.mjs` | **Refazer** | Ainda é o da v1: lê `window.__acts`, não faz o build e não checa contraste nem WebGL |
| `PROGRESS.md`, `CLAUDE.md`, `PRODUCT.md` | Refazer | Descrevem a v1: atos, `?act=`, `gsapText.ts` e público de portfólio |
| `src/scene/{Product,Energy,callouts}/` | – | Pastas vazias da v1. A Fase 2 usa as duas primeiras |

---

## 2. Inconsistências da ficha e conflitos do brief

Todos já foram aprovados. Repito cada um em uma linha, porque afetam o código.

**Ficha (seção 3)**
- **F1:** há dois LEDs azuis. Só o de saída ligada entra na história; os do módulo ficam na textura da placa.
- **F2:** o site mostra só "cerca de 19 Wh" (a conta dá 19,24 Wh).
- **F3:** 6 a 8 h de sol é otimista. O TP4056 limita a carga a 1 A, o que dá ≈ 6 h no melhor caso. Fica rotulado como estimativa.
- **F4:** 19 Wh rendem uns 14 Wh úteis no celular, então "cerca de 1 carga completa" é otimista. Fica rotulado como estimativa.
- **F5:** o painel de 6 V chega a uns 7 V em aberto, perto do limite do TP4056 (8 V), e o chip esquenta ao sol. É uma dica para o protótipo.
- **F6:** o boost precisa sair do OUT do módulo para a proteção contra descarga funcionar. **Confirmar no protótipo.**
- **F7:** o USB-C e o painel entram no mesmo nó. O esquema mostra só o caminho solar.
- **F8:** a margem de 25,7% é sobre o preço (sobre o custo, seria uns 35%). O texto diz "sobre o preço".
- **F9:** as fontes externas são revalidadas com navegador na Fase 3.

**Conflitos e saídas**
- **C1:** o loader não cobre a tela. O `h1` pinta no primeiro quadro (é o LCP), e o que sobe da máscara é o nome do produto.
- **C2:** "estado = scroll". O giro do produto anda com o scroll. Só a energia viva (fótons, pulsos e o brilho da bateria) tem loop contínuo, e só com a cena na tela.
- **C3:** os comprimentos "~30% menores no celular" valem para os pins; as seções de texto têm a altura do conteúdo.
- **C4:** existe um contrato de contraste, com as travessias sem texto (agora dentro das cenas, M2).
- **C5:** o `daylight.ts` recebe a hora, as nuvens e o aspecto da tela.
- **C6:** o ambiente de estúdio é um `StudioEnvironment` próprio. Conferi hoje que o `<Environment>` do drei importa `RGBELoader`, `EXRLoader` e o gainmap-js de forma estática.
- **C7:** o primeiro raio é um feixe próprio. O `GodRays` só entra se sobrar orçamento.
- **C8:** os tamanhos de título do brief vencem o teto de display da `impeccable`.
- **C9:** a linha "Aula N" fica abaixo do título.
- **C10:** a `review-animations` só você dispara (confirmado: `disable-model-invocation: true`).
- **C11 (nova):** a Fase 1 trocou as timelines do GSAP por código próprio. A saída é o M1.

---

## 3. Tokens finais

| Token | Hex | L (WCAG) | Papel |
|---|---|---|---|
| Noite | `#14213D` | 0,016 | Céu da madrugada e da noite; texto escuro |
| Céu | `#CFE8F3` | 0,78 | Horizonte do meio-dia. O zênite usa `#8DBBDA` (0,46; Noite sobre ele dá 7,8:1) |
| Nuvem | `#F4F7FA` | 0,93 | Texto claro; sobre Noite dá 14,9:1 |
| Sol | `#FFB22C` | 0,53 | Sol, brilhos e CTA (Noite sobre Sol dá 8,9:1) |
| Brasa | `#E8773A` | 0,31 | Amanhecer e entardecer (Noite sobre Brasa dá 5,4:1; Nuvem reprova) |
| Grafite | `#2B3036` | 0,03 | HUD do pitch e isolamento dos fios |

- **Zona morta:** Nuvem só passa AA com fundo de L ≤ 0,167, e Noite só com L ≥ 0,246.
  - Com texto na tela, os keyframes ficam longe dela: Nuvem até 0,12, Noite a partir de 0,30.
  - A guarda do shader segura 0,13 e 0,36 na coluna de texto.
  - As 3 travessias acontecem sem texto (M2), e o header sai de cena nelas.
- **Cores de energia são luz, não tinta.** Elas aparecem como pulsos dentro de fio Grafite (de 6,5 a 9,2:1). Na legenda, viram um traço colorido com o nome em `--fg`. Nunca são cor de texto.
- **CTA:** fundo Noite e texto Sol. No hover e no foco, preenche de Sol.

**Céu por hora** (já implementado em `daylight.ts`; N = texto Nuvem, D = texto Noite)

| Hora | Zênite | Horizonte (lado do texto) | Lado do sol | Estrelas | Tom |
|---|---|---|---|---|---|
| 00:00 a 04:30 | `#14213D` | `#1B2A4F` a `#1D2C52` | quase nada | 1 | N |
| 05:30 | `#172747` | `#2A3A64` | Brasa radial | 0,55 | N |
| 06:15 (hero) | `#1E3A6A` | `#3C5283` | disco e brilho Sol→Brasa | 0,12 | N |
| 07:00 | `#24406F` | `#435A88` | brilho forte à direita | 0 | N (último keyframe com texto claro) |
| 07:00 a 08:30 | travessia, só sem texto | | | | |
| 08:30 | `#6E9CC6` | `#BFDCEC` | branco quente | 0 | D |
| 12:00 | `#8DBBDA` | `#CFE8F3` | quase branco | 0 | D |
| 16:00 | `#86B2D3` | `#E9DDC4` | Sol | 0 | D |
| 17:30 | `#9DBCD6` | `#F2C98E` | Sol e Brasa | 0 | D |
| 18:12 | `#4A5A8A` | `#C9876A` | Brasa | 0,1 | travessia |
| 19:30 | `#1A2548` | `#2E3560` | Brasa residual | 0,6 | N |
| 21:30 a 24:00 | `#14213D` | `#1B2A4F` | nada | 1 | N |
| Tempestade (nuvens ≥ 0,9) | `#1C2336` (noite) a `#3A475E` (dia) | `#232B40` a `#4A5670` (L ≤ 0,093) | sol encoberto | 0 | N (6,8:1 ou mais) |

**Tipografia** (Archivo variável, subset latin, eixos `wdth` e `wght`, com preload)

| Papel | Tamanho | Largura e peso | Entrelinha e espaçamento |
|---|---|---|---|
| Título do hero | `clamp(3rem, 9vw, 9rem)` | 118%, 780 | 0,92; −0,02em; balance |
| Numeral de capítulo | `clamp(5rem, 14vw, 12rem)` | 125%, 800, algarismos tabulares | 0,8 |
| Título de seção (h2) | `clamp(2rem, 5vw, 4.5rem)` | 115%, 720 | 1,0; −0,015em; balance |
| h3 | `clamp(1.375rem, 2.2vw, 1.75rem)` | 110%, 650 | 1,15 |
| Destaque (situação-problema e frase-síntese) | `clamp(1.5rem, 3vw, 2.5rem)` | 108%, 560 | 1,2; até 30ch |
| Lead | `clamp(1.1875rem, 1.6vw, 1.375rem)` | 100%, 420 | 1,45 |
| Corpo | 17px | 100%, 400 | 1,5; até 65ch |
| Legenda (Aula N, fontes) | 14px | 100%, 450 | 1,4 |
| Números (tabelas, preço, contadores) | conforme o contexto | 110%, 650 (unidade com 400) | `tabular-nums lining-nums` |

**Superfícies do navegador** (já no CSS):
- `::selection` em Sol, com texto Noite.
- Foco com 2 px em `--fg` e offset de 3 px.
- Scrollbar fina.
- `--fg` registrada com `@property`, para o crossfade de 400 ms.

**Ajustes em relação ao brief, com motivo:**
- O hero é um nascer do sol, com texto claro. Assim, o `h1` não troca de cor durante a abertura.
- `dayTime` é medido em horas contínuas, de 4,5 a 65,7 (três dias). "Amanhã…" é o tempo passando de verdade.
- O header não tem fundo e sai de cena nas travessias.

---

## 4. Wireframes em ASCII (desktop 1440×900 | celular 390×844)

`[3D: …]` é o canvas, e `≈` é o céu. Todo texto fica alinhado à esquerda. **Abertura de capítulo** (nas 6 partes): numeral grande à esquerda, o h2 alinhado à base do numeral e a legenda "Aula N: …" abaixo do título. No celular, o numeral fica em cima.

**Hero (100svh)**
```
┌─────────────────────────────────────────────────────┐ ┌──────────────────┐
│SunTech    1 Problema 2 Cliente 3 Solução 4 Empresa… │ │SunTech      Menu │
│                                                ☀    │ │              ☀   │
│Carregador Solar SunTech  (sobe da máscara)          │ │ [3D: painel      │
│Carregue o                  [3D: painel aberto e     │ │  aberto + caixa, │
│celular com                  caixa ligados pelo cabo,│ │  pose de herói]  │
│a luz do sol.                3/4, luz baixa e quente │ │──── horizonte ───│
│                             vinda da direita]       │ │Carregador Solar  │
│O Carregador Solar SunTech junta um painel solar    │ │SunTech           │
│dobrável e uma bateria. Ele guarda a energia…        │ │Carregue o celular│
│                            ▁▁▁ sombra de contato ▁▁ │ │com a luz do sol. │
││ linha de scroll          ───── linha do loader ─── │ │O Carregador …    │
└─────────────────────────────────────────────────────┘ │        │         │
                                                         └──────────────────┘
```

**Parte 1: O problema** (≈ a tempestade fecha o céu; `[3D: produto apagado ao fundo, à direita]`)
```
│ ██ O problema                            ≈☁☁☁       │ │ ██               │
│ ██ Aula 2: Kickoff inspirador                       │ │ O problema       │
│ Todo empreendimento começa com um problema de       │ │ Aula 2: …        │
│ verdade. O nosso aparece quando a energia some.     │ │ Todo empreendi-  │
│ Energia no dia a dia   – celular descarrega…        │ │ mento começa …   │
│                        – a luz cai na chuva…        │ │ Energia no dia a │
│      Soluções que não  – power bank comum…          │ │ dia – … – …      │
│      resolvem          – "solares" baratos…         │ │ Soluções que não │
│ Sustentabilidade       – pilhas no lixo comum…      │ │ resolvem – …     │
│ Quais problemas incomodam quem depende de energia   │ │ Quais problemas  │
│ longe da tomada?   1 …      2 …      3 …            │ │ …? 1 … 2 … 3 …   │
│ "Quem vive em lugares remotos ou com energia        │ │ "Quem vive em    │
│  instável fica sem carregar o celular…"             │ │  lugares …"      │
│  Situação-problema escolhida pela equipe.           │ │ Por que importa  │
│ Por que isso importa para a sociedade               │ │ 990.103 brasi-   │
│ Energia é acesso: …                                 │ │ leiros… (fonte)  │
│ 990.103 brasileiros viviam sem energia… (contador)  │ │ Mais de 20 dias  │
│   Fonte: IEMA, via Poder360                         │ │ … (fonte)        │
│ Mais de 20 dias sem energia no Amapá… (contador)    │ │ E a energia do   │
│   Fonte: Idec          E a energia do sol é limpa…  │ │ sol é limpa…     │
```

**Parte 2: O cliente** (≈ noite depois da tempestade, com estrelas entre as nuvens; produto fora de cena). **(muda)** O título passa a ser o nome, e "Persona" vira legenda, no mesmo padrão do "Aula N".
```
│ ██ O cliente                                        │ │ ██  O cliente    │
│ ██ Aula 3: Conhecendo o cliente                     │ │ Aula 3: …        │
│ SA  Seu Antônio                                     │ │ SA (monograma)   │
│     Persona. 54 anos, produtor rural.               │ │ Seu Antônio      │
│     Sítio ●━━━━━━━━ 40 km ━━━━━━━━● Cidade (DrawSVG)│ │ Persona. 54 anos…│
│     Mora…     Usa o celular para…     É prático…    │ │ Sítio ●━40 km━●  │
│ "Nosso cliente é o produtor rural que mora longe…"  │ │ Mora… Usa… É…    │
│ Reflexão                                            │ │ "Nosso cliente   │
│ 1 Quem é a pessoa mais afetada?    Quem vive em…    │ │  é …"            │
│ 2 Por que isso atrapalha a vida?   Ela fica sem…    │ │ 1 Quem é…? …     │
│ 3 O que ela já tentou?             Power bank…      │ │ 2 … 3 …          │
│ Persona                    │ Público-alvo           │ │ Persona …        │
│ Seu Antônio, a pessoa por  │ Homens e mulheres de   │ │ Público-alvo …   │
│ trás do problema.          │ 25 a 65 anos… Outros…  │ │ Outros públicos… │
```

**Parte 3: abertura, 3a (d.light, fim da madrugada) e 3c (diferencial)**. **(muda)** A 3c agora é lida na manhã do dia seguinte, com texto escuro.
```
│ ██ A solução e o diferencial                        │ │ ██ A solução e o │
│ ██ Aula 4: Diferenciais reais e solução             │ │ diferencial …    │
│ Caça ao diferencial: d.light                        │ │ Caça ao diferen- │
│ Por que escolhemos: trabalha com energia solar…     │ │ cial: d.light …  │
│ Qual problema resolveu?     Famílias sem energia…   │ │ Qual problema    │
│ Para quem?                  Famílias de baixa renda…│ │ resolveu? …      │
│ O que fez de diferente?     Produtos solares…       │ │ (4 perguntas)    │
│ Como a vida mudou?          … mais de 150 milhões   │ │ Fontes: …        │
│                             de pessoas. Fontes: …   │ │ A nossa solução  │
│ A nossa solução  O que a SunTech oferece é… (lead)  │ │ O que a SunTech… │
│ ═════ as 3 cenas presas (abaixo) ═════              │ │ ═══ 3 cenas ═══  │
│ Como isso melhora a vida do cliente? [3D: montado,  │ │ [3D: montado,    │
│ Mais acessível. Leva energia aonde…   painel aberto │ │  painel aberto   │
│ Mais simples. … Economia. …           ao sol, gira  │ │  ao sol]         │
│ Sustentável. …                        com o scroll] │ │ Como isso melho- │
│ O que fazemos de diferente?                         │ │ ra…? 4 itens     │
│            PB comum   PB solar   SunTech            │ │ [tabela rola na  │
│ Recarrega  Tomada     Placa peq… Painel…            │ │  horizontal, 1ª  │
│ Longe…     …          …          …                  │ │  coluna fixa]    │
│ Conserto   Difícil    Difícil    Peças comuns…      │ │                  │
```

**Cena 3D "Por dentro"** (pin de 250vh no desktop e 175vh no celular; do nascer ao meio-dia)
```
│ [0–18%: travessia sem texto: o sol nasce e a câmera │ │ [3D: caixa 3/4,  │
│  chega à caixa em 3/4]                              │ │  tampa aberta,   │
│ Por dentro, cada peça    ┌─ Módulos: controlam…     │ │  camadas subindo,│
│ tem uma função.          │  ╔══ tampa ══╗           │ │  marcadores 1–8] │
│ (lista 1–8 no DOM,       ├─ Fiação: …               │ │ Por dentro, cada │
│  sincronizada com as     ├─ Bateria: guarda…        │ │ peça tem uma     │
│  peças; é a versão       ├─ Saídas: …               │ │ função.          │
│  acessível)              ├─ Luz indicadora: …       │ │ 1 Módulos: …     │
│                          └─ Painel: vidro, células  │ │ 2 … (acende o    │
│                             e base (callouts DrawSVG)│ │ item da peça)    │
```

**Cena 3D "Como funciona"** (pin de 350vh no desktop e 245vh no celular; do meio-dia às 17h). **(muda)** As 4 etapas ficam numeradas no esquema desde 10%.
```
│ 1 Captar  2 Proteger  3 Guardar  4 Entregar          │ │ [3D: esquema     │
│ ━━━━━━━━━━━━━━━━░░░░░░░░  (as futuras apagadas, a    │ │  vertical, 1 a 4 │
│  ativa acesa; de 70% a 100%, todas acesas)           │ │  no esquema:     │
│ [3D: painel─diodo─controlador─bateria─conversor─     │ │  painel ↓ diodo  │
│      saída─celular; fios em curva de isolamento      │ │  ↓ … ↓ celular]  │
│      escuro; rótulos de 1 a 4 no próprio esquema]    │ │ 2 Proteger …     │
│ 2 Proteger                                           │ │ legenda: as 4    │
│ O controlador carrega a bateria no ritmo certo…      │ │ cores com nome   │
│ ━ Luz  ━ Corrente do painel  ━ Energia guardada      │ │                  │
│ ━ Saída de 5 V   (traço colorido e nome em --fg)     │ │                  │
```

**Cena 3D "A energia fica"** (pin de 200vh no desktop e 140vh no celular; do pôr do sol ao nascer do dia seguinte). **(muda)** A cena ganha o nascer do sol no fim.
```
│ [0–30%: travessia sem texto: o esquema recolhe, a    │ │ [3D: caixa fecha-│
│  caixa fecha, o painel dobra e o sol se põe]         │ │  da, LED azul,   │
│ O sol se põe.            [3D: caixa fechada, LED     │ │  cabo 3 em 1,    │
│ A energia fica.           azul, cabo 3 em 1 até o    │ │  tela subindo]   │
│ À noite, o Carregador     celular; a tela sobe com   │ │ O sol se põe. A  │
│ Solar SunTech carrega…    o scroll]                  │ │ energia fica. …  │
│                           Simulação. Estimativa:     │ │ Simulação. Esti- │
│                           cerca de 1 carga completa. │ │ mativa: …        │
│ Amanhã, o sol recarrega tudo de novo. (70–82%)       │ │ Amanhã, o sol …  │
│ [82–100%: o texto sai, o sol nasce, o celular sai e  │ │ [82–100%: o sol  │
│  o painel se abre para o sol, como na abertura]      │ │  nasce, o painel │
│                                                      │ │  se abre]        │
```

**Parte 4: A empresa** (≈ dia claro; `[3D: produto quieto à direita no desktop, oculto no celular]`). **(muda)** Não há mais respiro antes dela.
```
│ ██ A empresa     Aula 5: Criação da empresa         │ │ ██ A empresa …   │
│ Quem somos: A SunTech nasceu de uma pergunta: …     │ │ Quem somos …     │
│ ┌─ Plano de voo ──────────────────┬┄┄┬───────────┐  │ │ ┌──────────────┐ │
│ │ Propósito  Levar energia limpa… │┊ │ SunTech   │  │ │ │ Propósito …  │ │
│ │ Destino    Um mundo em que…     │┊ │ Feira de  │  │ │ │ Destino …    │ │
│ │ Trajeto    Sustentabilidade…    │┊ │ Empreende-│  │ │ │ Trajeto …    │ │
│ │ Operações  Compramos os…        │┊ │ dorismo   │  │ │ │ Operações …  │ │
│ └─────────────────────────────────┴┄┄┴───────────┘  │ │ ├┄┄ picote ┄┄┄┤ │
│ Produtos   Lidera o protótipo; testes com a lâmpada │ │ │ SunTech …    │ │
│ Finanças   [custos, estimativa]  Total R$ 185       │ │ └──────────────┘ │
│            Preço R$ 249, margem de cerca de 25%     │ │ Produtos / Finan-│
│            sobre o preço. Estratégia: …             │ │ ças [tabela rola]│
│ Marketing  ■Sol ■Céu ■Noite  "Energia do sol, onde  │ │ / Marketing …    │
│            você estiver."  Estande: …               │ │ O protótipo …    │
│ Materializando a ideia: o protótipo  [ficha técnica]│ │ [ficha técnica]  │
│ Nasceu como projeto de escola  1 A ideia 2 … 3 …    │ │ 1 … 2 … 3 …      │
```

**Parte 5: O pitch** (≈ tarde; `[3D: produto em pose de herói]`) **e o HUD do modo pitch** (TV 1920×1080)
```
│ ██ O pitch     Aula 6: Pitch                        │ │ ██ O pitch …     │
│ Nosso pitch em 3 minutos                            │ │ 0:00 ┬ Marketing │
│ 0:00         1:00         2:00         3:00         │ │      │ O problema│
│ ├────────────┼────────────┼────────────┤ (DrawSVG)  │ │ 1:00 ┼ Produtos  │
│ Marketing    Produtos     Finanças                  │ │      │ A solução │
│ O problema e A solução e  Custos e preço justo      │ │ 2:00 ┼ Finanças  │
│ a persona…   o valor…     …                         │ │ 3:00 ┴           │
│ [ Iniciar o modo pitch ]   Espaço pausa. Esc sai.   │ │ [Iniciar o modo  │
│                                                     │ │  pitch]          │

HUD do modo pitch (fixo embaixo, fundo Grafite, legível a 3 m):
┌─────────────────────────────────────────────────────────────────────────┐
│ 1:24 / 3:00   Produtos   Como funciona   ━━━━━━━━━░░░░   Pausar   Sair  │
└─────────────────────────────────────────────────────────────────────────┘
```

**Parte 6: O jovem empreendedor** (≈ fim de tarde dourado) **e rodapé**
```
│ ██ O papel do jovem no empreendedorismo do futuro   │ │ ██ O papel do    │
│ ██ Atividade AQ3                                    │ │ jovem … AQ3      │
│ Nossa geração cresceu com a tecnologia na mão…      │ │ Nossa geração …  │
│ A SunTech mostra o que jovens podem fazer…          │ │ A SunTech …      │
│ Ainda faltam muitas coisas… (linhas reveladas com   │ │ Ainda faltam …   │
│ o scroll)            [3D: último giro, sol baixo]   │ │ [3D: último giro]│
│ Energia do sol, onde você estiver.                  │ │ Energia do sol,  │
│ [ Ver o pitch em 3 minutos ]  (botão magnético)     │ │ onde você estiver│
│─────────────────────────────────────────────────────│ │ [Ver o pitch em  │
│ Conceito de produto criado a partir do protótipo…   │ │  3 minutos]      │
│ Design e código do site: Kaique Calefi (link)       │ │ Rodapé e Fontes  │
│ Fontes: lista com os links da seção 3               │ │ (lista)          │
```

---

## 5. Mapa de scroll

`dayTime` está em horas contínuas (o céu usa `hora mod 24`). Na timeline, tudo é linear (scrub), com damping no `useFrame`. "Conteúdo" quer dizer que a altura sai do texto. N é texto claro (Nuvem), D é texto escuro (Noite), e o tom só troca nas travessias.

| Trecho | Desktop | Celular | Pin | `dayTime` (h) | Hora do céu | `cloudCover` | Tom |
|---|---|---|---|---|---|---|---|
| Abertura (automática, até 2,4 s) | – | – | – | 4,50 → 6,25 | 04:30 → 06:15 | 0,10 | N |
| Hero | 100svh | 100svh | não | 6,25 → 7,00 | → 07:00 | 0,10 → 0,35 | N |
| Parte 1, de 0 a 20% (a tempestade fecha antes de o dia clarear) | ~200vh | conteúdo | não | 7,00 → 7,50 | → 07:30 | 0,35 → 0,90 | N |
| Parte 1, de 20 a 100% | | | | 7,50 → 19,50 | → 19:30 | 0,90 → 0,60 | N |
| Parte 2 | ~200vh | conteúdo | não | 19,50 → 26,00 | → 02:00 | 0,60 → 0,25 | N |
| Parte 3: abertura e 3a | ~120vh | conteúdo | não | 26,00 → 29,00 | → 05:00 | 0,20 | N |
| "A nossa solução" | ~40vh | conteúdo | não | 29,00 → 29,40 | → 05:24 | 0,15 | N |
| Por dentro, de 0 a 18% (travessia, só 3D) | 250vh | 175vh | **sim** | 29,40 → 32,50 | → 08:30 | 0,10 | N → D |
| Por dentro, de 18 a 100% | | | | 32,50 → 36,00 | → 12:00 | 0,05 | D |
| Como funciona | 350vh | 245vh | **sim** | 36,00 → 41,00 | → 17:00 | 0,05 | D |
| A energia fica, de 0 a 30% (travessia, só 3D) **(muda)** | 200vh | 140vh | **sim** | 41,00 → 43,50 | → 19:30 | 0,05 | D → N |
| A energia fica, de 30 a 70% **(muda)** | | | | 43,50 → 45,50 | → 21:30 | 0,05 | N |
| "Amanhã…", de 70 a 82% **(muda)** | | | | 45,50 → 53,50 | → 05:30 do dia seguinte | 0,10 | N |
| Nascer do dia seguinte, de 82 a 100% (travessia, só 3D) **(muda)** | | | | 53,50 → 56,50 | → 08:30 | 0,10 | N → D |
| 3c Diferencial **(muda)** | ~180vh | conteúdo | não | 56,50 → 57,50 | → 09:30 | 0,10 → 0,15 | D |
| Parte 4 **(muda: sem respiro)** | ~280vh | conteúdo | não | 57,50 → 59,50 | → 11:30 | 0,15 → 0,20 | D |
| Parte 5 | ~150vh | conteúdo | não | 59,50 → 63,50 | → 15:30 | 0,20 → 0,15 | D |
| Parte 6 e rodapé | ~150vh | conteúdo | não | 63,50 → 65,70 | → 17:42 | 0,20 | D |

**Campos do `sceneState` por trecho** (fora `dayTime`, `cloudCover` e o tom, que estão acima)

| Trecho | Produto e câmera | Outros campos |
|---|---|---|
| Abertura | Silhueta → pose de herói; `panelOpen` 0→1; câmera de herói | `glint` 0→1; `shaft` 0→1→0 |
| Hero | `product.ry` +35° com o scroll; inclinação pelo ponteiro (`gsap.quickTo`) ou, no toque, pela velocidade do scroll; leve recuo da câmera | – |
| Parte 1 | Pose "ao fundo" (à direita e atrás); o produto escurece até sumir (`productVisible` 1→0) | – |
| Parte 2, 3a e lead | Invisível. No fim do lead, o produto montado entra na pose "bancada" | – |
| Por dentro | Câmera em 3/4 perto da caixa, depois recua | `lidOpen` 0→1 (de 18 a 35%); `explode` 0→1 (de 30 a 90%), com atraso por peça; callouts por limiar |
| Como funciona **(muda)** | `schematic` 0→1 (de 0 a 10%); a câmera enquadra o esquema, na horizontal com aspecto ≥ 1 e na vertical abaixo disso | `flow` 0→4 (de 10 a 70%). Etapa 1: fótons. Etapa 2: pulsos laranja. Etapa 3: `batteryCharge` 0,15→1. Etapa 4: pulsos azuis e o celular (`phoneVisible` 1). De 70 a 100%, o circuito inteiro funciona |
| A energia fica **(muda)** | De 0 a 30%: `schematic`, `explode`, `lidOpen` e `panelOpen` vão a 0, e a câmera vai para a caixa e o celular. De 82 a 100%: o celular sai, o painel se abre para o sol e o produto vai para a pose da 3c | De 30 a 70%: `ledOn` 0→1, `cable` 0→1, `phoneCharge` 0→1 e `batteryCharge` 1→0,15 (a bateria entrega o que guardou). De 82 a 100%: `cable`, `ledOn` e `phoneVisible` vão a 0 |
| 3c | Pose de herói; giro com o scroll | `batteryCharge` 0,15→0,30 (o sol recarrega) |
| Parte 4 | Pose "quieto" à direita no desktop; oculto no celular | – |
| Parte 5 | Pose de herói, com inclinação | – |
| Parte 6 | Último giro: `ry` +360° com o scroll, até a pose final | – |

**Reduced motion:**
- Sem Lenis e sem pins.
- Cada cena vira uma seção normal, no estado final: vista explodida parada, os 4 caminhos acesos e parados, e o celular carregado.
- Quando muda a seção no meio da tela, a timeline mestre salta (`seek`) para o ponto de repouso dela. O céu chega lá com o próprio damping (é o crossfade curto da seção 10), e o produto pula sem animar.
- O `gsap.matchMedia()` e o `useReducedMotion` reagem se a preferência mudar com a página aberta.

**Modo pitch** (a sequência fica em `feira.ts`; o relógio é uma timeline GSAP de 180 s)

| Tempo | Setor | Parada | Rolagem |
|---|---|---|---|
| 0:00 a 0:30 | Marketing | Situação-problema | Até o bloco de destaque da Parte 1 |
| 0:30 a 1:00 | Marketing | Persona | Seu Antônio e a frase-síntese |
| 1:00 a 1:25 | Produtos | Por dentro | Percorre o pin de 20 a 85% (a explosão) |
| 1:25 a 1:50 | Produtos | Como funciona **(muda)** | Percorre o pin de 10 a 75% (as 4 etapas) |
| 1:50 a 2:00 | Produtos | Diferencial | Tabela comparativa |
| 2:00 a 2:40 | Finanças | Custos | Tabela de custos |
| 2:40 a 3:00 | Finanças | Preço | Preço e parcelamento |

- A pausa congela o relógio, e rolar à mão também pausa.
- Espaço pausa e retoma; Esc sai e devolve o foco ao botão.
- Um `aria-live` anuncia cada parada, e o Wake Lock mantém a tela acesa.
- Com reduced motion, a página pula de parada em parada nos mesmos tempos.

---

## 6. Peças do produto: três poses, ordem da explosão e receita de estúdio

Escala: 1 unidade = 100 mm, parametrizada pelo `product.ts`. Com as medidas nulas, valem as proporções padrão: caixa 150×100×40 e placa 200×150×6. O esquema é horizontal no desktop e vertical no celular.

| # | Peça | Montada | Explodida (trecho de `explode`) | Esquema |
|---|---|---|---|---|
| 1 | Tampa (dobradiça traseira) | Fechada (`lidOpen` 0) | Abre 110° antes de tudo e sobe 0,6 | Sai com o corpo |
| 2 | Corpo da caixa (preto fosco, "SunTech" em baixo-relevo por normal map de canvas) | Base | Fica | Desce e sai de quadro (`visible=false`) |
| 3 | Placa do controlador TP4056 + DW01, com os LEDs do módulo na textura | Dentro | 1ª, de 0,15 a 0,45: sobe 0,35 e gira 6° | Nó 3 |
| 4 | Diodo 1N5819 | Na entrada | Junto com a 3, deslocado em x | Nó 2 |
| 5 | Conversor boost | Dentro | 1ª, de 0,15 a 0,45: sobe 0,50 e sai para fora | Nó 5 |
| 6 | Fiação vermelha e preta (feixe estático) | Dentro | 2ª, de 0,25 a 0,55: sobe como feixe | Troca pelos fios de fluxo (crossfade) |
| 7 | Bateria 2× 18650 no suporte (rótulo em canvas; carga com CSM `uCharge`) | Fundo | 3ª, de 0,35 a 0,65: sobe 0,15 e gira 8° | Nó 4 |
| 8 | Saída: USB-A, chave e LED azul, na parede | Na parede | 4ª, de 0,45 a 0,75: desliza para fora em x | Nó 6 |
| 9 | Painel: vidro (clearcoat, sem `transmission`) | Por cima | Em paralelo, de 0,30 a 0,80: +0,25 na normal | Nó 1 (o painel inteiro, reduzido) |
| 10 | Painel: células (CanvasTexture monocristalina; brilho e `irradiance` com CSM) | Meio | +0,12 | Nó 1 |
| 11 | Painel: base, moldura, dobradiças e caixa de junção | Base | Fica | Nó 1 |
| 12 | Cabo do painel até a caixa (Tube sobre CatmullRom) | Liga os dois | Oculto | Vira o 1º fio de fluxo |
| 13 | Celular (RoundedBox; a tela em canvas só é redesenhada quando o número inteiro muda) | Ausente | Ausente | Nó 7 |
| 14 | Cabo 3 em 1 | Ausente | Ausente | Último fio de fluxo. Em "A energia fica", liga a caixa ao celular |

- Cada callout aparece quando a sua peça chega a 80% do percurso.
- O ponto de ancoragem é o centro da face superior de cada peça.
- No celular, cada peça ganha só um marcador numerado, e a legenda fica no DOM.

**Receita de estúdio (aceite da Fase 2) (muda: nova)**
- **Câmera:** FOV de uns 30°, longe do produto (pouca distorção) e uns 12° acima dele.
- **Luz:** um `StudioEnvironment` com 3 Lightformers, renderizado uma vez em PMREM:
  - um softbox grande, acima e à frente;
  - duas tiras verticais nas laterais, que desenham as bordas do preto fosco;
  - um preenchimento frio e fraco.

  A luz direcional do sol sai do `daylight.ts`, e uma hemisférica fraca dá apoio.
- **Forma:** nenhuma aresta viva. Bisel de 2 a 3 mm (em escala) em toda a caixa, para pegar o brilho. Fresta visível na tampa, pés de borracha, parafusos, insertos metálicos nas portas e uma lente no LED.
- **Materiais:**
  - Caixa: preto fosco (rugosidade de ~0,55, clearcoat de 0,25 com rugosidade de 0,4).
  - Moldura do painel: alumínio anodizado escuro (metalness 1, rugosidade de ~0,35).
  - Vidro: clearcoat 1, refletindo o ambiente.
  - Células: mapas de cor, rugosidade e metal, com barramentos metálicos e fingers finos.
- **Sombra:** `ContactShadows` suave e nenhum chão visível; o produto pousa no horizonte. No tier baixo, a sombra é um plano com gradiente.
- **Checklist do screenshot do hero:**
  - toda borda tem brilho;
  - nenhuma face fica chapada;
  - há sombra de contato;
  - não há z-fighting nem serrilhado em DPR 1;
  - o preto se lê como material, não como recorte.

---

## 7. Árvore de componentes e tiers de qualidade

```
src/
  main.tsx  App.tsx  config.ts (PORTFOLIO_URL, SITE_URL)  index.css (@theme, tipo, superfícies)
  content/  company.ts  product.ts  feira.ts (fontes, sequência do pitch)  copy.ts  format.ts (pt-BR)
  lib/      gsap.ts  split.ts  lenis.ts  sections.ts  env.ts  loading.ts  opening.ts
            stage.ts (pins)  tracks.ts (timeline mestre, M1)  pitch.ts  useReducedMotion.ts
  sections/ Header  Loader  Hero  ChapterOpener  Problem  Client  Solution  Inside  HowItWorks
            EnergyStays  Differential  Company/{BoardingPass, Sectors, Prototype}  Pitch
            PitchHud  Youth  Footer  Fact  Counter  EnergyDiagram  Cursor  MagneticButton
  scene/    SceneCanvas  Experience  Sky  Lights  StudioEnvironment  Effects (lazy, por tier)
            CameraRig  LightShaft  Callouts (Html numa camada acima do DOM)
            Product/{Product, Panel, Case, Circuit, Battery, Wires, Cable}  Phone
            Energy/{FlowTubes, Photons}  textures/{cells, pcb, batteryLabel, phoneScreen}
            state.ts  choreography.ts  poses.ts  daylight.ts  quality.ts
            CanvasErrorBoundary  Fallback  DebugPerf
  shaders/  sky.{vert,frag}  flow.{vert,frag}  photons.{vert,frag}  lightShaft.frag
scripts/    snap.mjs
```

| | Alto | Médio | Baixo |
|---|---|---|---|
| Entrada **(muda)** | ≥ 1280 px e ≥ 8 núcleos | Desktop comum; celular, por padrão | Celular com `deviceMemory` ≤ 4 GB ou ≤ 4 núcleos; também o `onFallback` |
| DPR | [1, 2] | [1, 1,5] | [1, 1] |
| Fótons e partículas | 160 | 80 | 32 |
| Sombra | ContactShadows 1024 | ContactShadows 512 | Plano com gradiente |
| Pós-processamento | Bloom + Noise + Vignette, MSAA do composer | Bloom + Vignette | Nenhum (o chunk nem baixa) |
| Texturas (células / PCB) | 2048 / 1024 | 1024 / 512 | 512 / 256 |
| Ambiente (PMREM) | 256 | 128 | 64 |
| Nuvens (oitavas de fbm) | 5 | 4 | 3 |

- As texturas são geradas uma vez, no tier de entrada.
- O `PerformanceMonitor` nunca sobe acima do teto da viewport, e com 3 oscilações fixa o tier baixo.
- O tier fica numa store fora do React.

---

## 8. Riscos técnicos e plano B

| Risco | Prevenção | Plano B |
|---|---|---|
| Orçamento de JS: a v1 tinha uns 448 KB com só o céu, para um teto de 500 | `StudioEnvironment` sem os loaders; pós-processamento em chunk lazy, só nos tiers alto e médio; gzip medido a cada fase | `postprocessing` direto, sem o wrapper; cortar `GodRays` e Noise; se ainda estourar, explico o desvio com números |
| Contraste sobre o céu que muda | Contrato de luminância, guarda no shader, travessias sem texto e checagem nos pixels (M4) | Ajustar os keyframes. Nunca dar fundo às seções |
| Timeline mestre refeita a cada refresh (M1) | Refazer só no refresh, mantendo a posição | Voltar ao interpolador atual e registrar o desvio |
| SwiftShader lento ou sem render no `snap` | DPR 1 com `?snap`; espera de 900 ms ou mais | Rodar headed |
| Callouts do `<Html>` tremendo com o Lenis | Portal numa camada fixa, atualizada no mesmo frame da câmera | Camada própria, que projeta as âncoras num `useFrame` |
| Pins, `autoSplit` e troca de fonte desalinhando o ScrollTrigger | Triggers na ordem do DOM; `refresh` depois do `fonts.ready` e do loader; `ignoreMobileResize`; `svh` | `refreshPriority` em cada pin |
| Perda de contexto WebGL (iOS) | `dispose` de tudo; texturas no tamanho do tier | `webglcontextlost` leva ao Fallback |
| CSM 6.4 com three 0.186 | Teste isolado no começo da Fase 2 | `onBeforeCompile` manual |
| `TubeGeometry` recalculada | Cabos estáticos por pose, refeitos só enquanto o painel abre | Deformar no vertex shader |
| Texto da PCB e da tela ilegível em DPR 1 | Texto grande na textura, mipmaps e anisotropia | Menos texto na serigrafia |
| `page.clock` não move o ticker do GSAP (M8) | Testar logo no início da Fase 6 | Ensaio real de 3 minutos |
| Notebook apagando a tela no estande | Wake Lock durante o pitch | Instrução no README |
| `font-display: block` atrasando o LCP num 4G fraco | Preload do woff2 de 90 KB | `swap`, com fallback de métricas ajustadas |
| Fontes externas: em 28/09 o Idec estava fora do ar, e a d.light e a Earthshot bloquearam a leitura | Revalidar na Fase 3 com navegador real | Uma divergência vira pergunta antes de publicar |

---

## 9. Revisão crítica com a `frontend-design` e a `impeccable`

Mantenho a revisão de 28/09, feita com as duas skills. As 3 linhas finais vêm da auditoria de hoje.

| O que soava genérico | Mudança |
|---|---|
| O template de lançamento: título grande com produto à direita | Um único momento orquestrado: a linha do loader é o horizonte onde o produto pousa; o raio cruza a cena, o painel abre como um livro e o brilho corre pelas células |
| Números grandes com rótulo pequeno | Números dentro de frases, com contador e a fonte logo abaixo. Nada de blocos de métrica |
| Grade de cards | Cada bloco tem o layout que o conteúdo pede. O único cartão é o de embarque, porque é a metáfora da própria aula |
| Rótulo acima do título | "Aula N" fica abaixo, como legenda |
| Numeração decorativa | Só onde existe sequência de verdade |
| Fade-up em toda seção | Revelações só nos numerais, títulos, contadores, linhas DrawSVG e no manifesto. Os parágrafos só rolam |
| Header de vidro | Só texto, que some nas travessias |
| Avatar com iniciais | Monograma tipográfico e a distância sítio–cidade desenhada |
| Cores de energia como enfeite | Só como informação: luz em fio escuro, sempre com rótulo |
| Tema escuro "porque é tecnologia" | O tom sai da hora e da luminância medida |
| Cursor que substitui o nativo | Um anel que segue o cursor nativo sem atraso |
| Separadores "·", "—" e "→" | Nenhum na interface |
| Conteúdo duplicado | "Por dentro" mostra a **função** de cada peça, a ficha mostra a **especificação**, e o setor Produtos mostra o **papel do setor** |
| **(nova)** 160svh de céu vazio antes da Parte 4 | Travessias dentro das cenas (M2) |
| **(nova)** O mesmo espaço entre todos os blocos (`.block` sempre com 18svh) | O espaço vem do conteúdo: blocos do mesmo raciocínio ficam perto, e a pausa longa vem só antes dos destaques (situação-problema, frase-síntese, plano de voo e slogan final) |
| **(nova)** "Persona: Seu Antônio" como título | O título é o nome, e "Persona" vira a legenda abaixo |

**Alertas por público:**
- **Professor avaliador:** acha cada aula em segundos, pelo header numerado e pela legenda "Aula N".
- **Visitante pelo QR code**, em pé e no 4G: o hero é legível antes do 3D, os alvos de toque têm 44 px ou mais, e nada depende de hover.
- **Apresentador no estande:** Espaço e Esc funcionam, e o HUD é legível a 3 m. O teste é o screenshot de 1920×1080 reduzido a 25%.
- **Cliente do desenvolvedor:** acha o crédito e o link no rodapé.

---

## 10. Skills e ferramentas, por fase

| Fase | Skills (para quê) |
|---|---|
| 0 | `frontend-design` e `impeccable` (heurísticas da `critique`), na revisão de 28/09; `ponytail` (regra global: a solução mais simples dentro do brief) |
| 1 | `gsap-timeline` e `gsap-scrolltrigger` (timeline mestre); `gsap-react` (`useGSAP`); `gsap-core` (`matchMedia`); `accessible-animation`; `threejs-webgl` (céu); `impeccable` com `teach` e `document` (`PRODUCT.md` e `DESIGN.md`); `craft` |
| 2 | `react-three-fiber`; `threejs-webgl` (modelagem, PBR, CanvasTexture, CSM); `gsap-timeline` e `gsap-plugins` (abertura, SplitText, CustomEase); `animate`; `emil-design-eng`; `60fps-animation` |
| 3 | `gsap-scrolltrigger`; `gsap-plugins` (SplitText, DrawSVG); `svg-animation` (os 40 km); `accessibility`; `design:ux-copy`; Playwright MCP (fontes externas) |
| 4 | `react-three-fiber`; `threejs-webgl` (shaders de fluxo, partículas, instancing); `gsap-timeline`; `gsap-utils`; `svg-animation` (callouts); `dataviz` (legenda das 4 cores); `accessible-animation` |
| 5 | `craft`; `dataviz` (custos e ficha); `svg-animation` (picote); `design:ux-copy` |
| 6 | `gsap-timeline` (relógio de 180 s); `micro-interaction` (botão magnético); `emil-design-eng`; `accessibility` (teclado e `aria-live`) |
| 7 | `impeccable` com `audit`, `polish`, `detect` e `document`; `improve-animations`; `gsap-performance`; `60fps-animation`; `accessible-animation`; `accessibility` e `design:accessibility-review` |
| Fim de toda fase | `impeccable critique` sobre os screenshots do `snap`; revisão de motion com `improve-animations` e `emil-design-eng` |

**Só você dispara:** `/review-animations` (Emil). Rode ao fim das Fases 2, 4 e 6. Eu não travo esperando: aplico os achados no começo da fase seguinte.

**Não uso** (sem relação com o projeto):
- glassmorphism, lottie, motion-framer, babylonjs, ascii, animate-expo, write-swift, ask-sonner e page-transition (a página é única);
- apple-design, só como referência;
- find-animation-opportunities, porque o brief pede o contrário (tirar efeitos);
- as skills `ai-*` e as de pesquisa e UX, porque a `critique` da `impeccable` já cobre essa parte;
- `design:*`, exceto ux-copy e accessibility-review;
- `figma:*`, `miro:*`, `brightdata-plugin:*`, `productivity:*`, `anthropic-skills:*`, `artifact-*` e `plugin-authoring`;
- claude-api, schedule, loop, graphify, update-config, keybindings, security-review (não há backend), run e init;
- os MCPs de Supabase, Claude Docs, Figma e afins.

`code-review` e `simplify` são opcionais, no fim.

---

## Execução depois da aprovação

**Fechamento de toda fase:** `typecheck`, `lint`, `build` (com o gzip de cada chunk), `snap`, `impeccable critique` nos screenshots, revisão de motion, correções, commit na `v2` e `PROGRESS.md`. O `master` continua com a v1, para comparação.

**Fase 1: fechar a fundação v2**
1. **M1:** `tracks.ts` monta a timeline mestre a partir de `choreography.ts`. Com reduced motion, ela salta para o repouso de cada seção.
2. **M2:**
   - apagar `Respiro.tsx`, a marca de respiro em `sections.ts` e `tracks.ts` e o respiro do `App.tsx`;
   - estender "A energia fica" até o nascer do dia seguinte;
   - passar a 3c para o tom escuro.
3. **Correções pontuais:**
   - guarda do shader sem tocar no sol (M5);
   - regra de entrada do tier (M6);
   - céu sem animar saltos grandes de hora;
   - os 3 avisos do lint;
   - total de custos pela soma da tabela.
4. **`snap` v2** (detalhes em Verificação), com o contraste medido nos pixels (M4). Depois disso, apagar `skyColorAt` e `skyProbe`.
5. **Documentos:**
   - `PRODUCT.md` novo pela `impeccable` (`teach`), a partir do brief: avaliadores, visitantes pelo QR code, apresentadores do estande e clientes do desenvolvedor;
   - a semente do `DESIGN.md`;
   - o `CLAUDE.md` curto e atualizado;
   - o `PROGRESS.md` da v2;
   - `docs/fase-0.md` com esta versão.
6. **Aceite:**
   - do brief: rolando a página inteira, o céu passa por todas as horas e pela tempestade; o build sai limpo; o `snap` gera imagens por seção;
   - meu: zero violações de contraste, zero erros no console e WebGL ligado em todas as imagens (fora do `?nowebgl`).

**Fase 2: o produto, a abertura e o hero**
- Peças procedurais parametrizadas pelo `product.ts`.
- Texturas em canvas (células, PCB, rótulo e tela) no tamanho do tier.
- CSM para o brilho das células e a carga da bateria, com um teste isolado antes.
- `StudioEnvironment`, o sol do `daylight` e a sombra de contato.
- Abertura completa: silhueta, raio, painel abrindo como um livro, reflexo nas células e o nome subindo da máscara. Se a pessoa rolar, a abertura pula para o fim.
- Aceite: o checklist da receita de estúdio no screenshot do hero.

**Fase 3: Partes 1 e 2**
- Aberturas de capítulo: o numeral se revela por máscara no scrub, e os títulos usam SplitText por linha (`autoSplit`, depois das fontes).
- Contadores, com o valor final já no DOM.
- A linha dos 40 km em DrawSVG.
- A parte ativa no header.
- As fontes externas revalidadas no navegador.
- Aceite do brief: todo o conteúdo das Aulas 2 e 3, legível no escuro e com as fontes.

**Fase 4: Parte 3 inteira**
- d.light.
- Os 3 pins: peças com as três poses e a explosão com atraso.
- Callouts com DrawSVG (no celular, legenda numerada).
- Fios com shader de pulso, fótons e partículas.
- Bateria enchendo e celular com a tela em canvas.
- O diferencial.
- O diagrama em SVG do fallback.
- Aceite: as 4 etapas visíveis e legendadas no meio de "Como funciona" (M3).

**Fase 5: Parte 4**
- Cartão de embarque com picote.
- Setores e tabela de custos rotulada como estimativa.
- Ficha técnica: só os campos preenchidos, com as estimativas rotuladas.
- A história em 3 etapas.
- Aceite: nenhum número fora da seção 3. Uma busca por dígitos em `src/sections` confere isso.

**Fase 6: Partes 5 e 6**
- Linha do tempo em DrawSVG.
- `lib/pitch.ts` e o HUD: Espaço, Esc, `aria-live` e Wake Lock.
- O manifesto.
- O final, com o botão magnético que inicia o pitch.
- O rodapé, com o crédito e as fontes.
- Aceite: o teste com `page.clock` (180 s exatos, pausa e Esc).

**Fase 7: polimento**
- Pós-processamento por tier, cursor, reduced motion completo e fallback com `?nowebgl`.
- SEO e OG: imagem de 1200×630 gerada do hero pelo `snap`, com URL absoluta.
- Uma passada de performance: FPS, gzip, LCP e CLS.
- `audit` e `polish` da `impeccable`, `npx impeccable detect` e `improve-animations`.
- O `snap` final completo.
- Tirar o efeito que menos contribui.
- README: como rodar, publicar na Vercel, editar os textos e medir o FPS com `?debug`.
- Relatório final.
- Aceite: todo o checklist da seção 15.

## Verificação

1. **Em toda fase:**
   - `npm run typecheck`, `npm run lint` e `npm run build`, sem erros;
   - o gzip de cada chunk vai para o `PROGRESS.md` (tetos: 150 KB inicial e 500 KB no total).
2. **`npm run snap fase-N`:**
   - faz o build, sobe o preview e abre o Chromium com SwiftShader (headed, se o WebGL não renderizar);
   - viewports de 1440×900 e 390×844 (com toque), numa passada normal e numa com reduced motion;
   - nas cenas presas, os pontos são 0%, 50% e 100% do pin; nas outras, o início, o meio e o fim da seção;
   - espera uns 900 ms em cada ponto e salva em `.snapshots/<fase>/<viewport>-<seção>-<ponto>.png`;
   - **falha** se houver erro no console, se o contraste medido nos pixels sob algum texto ficar abaixo de AA (M4) ou se faltar WebGL fora do `?nowebgl`;
   - registra o LCP e o CLS da primeira carga;
   - roda mais uma passada em 1920×1080 para a TV do estande (reviso as imagens reduzidas a 25%) e uma com `?nowebgl`;
   - reviso as imagens uma por uma, e a `impeccable critique` passa por elas.
3. **Modo pitch** (a partir da Fase 6): o teste com `page.clock` e um ensaio real de 3 minutos no fim.
4. **FPS:** você mede no seu PC e no seu celular com `?debug`, seguindo as instruções do README.

## Pendências suas (nenhuma bloqueia o início)

- `PORTFOLIO_URL` (Fase 6) e a URL de produção, para o OG absoluto (Fase 7).
- **F6:** confirmar no protótipo que o boost sai do OUT do módulo. Se der, medir também o tempo de carga e quantas cargas de celular a bateria rende (F3 e F4).
- **F8:** quer a frase "O custo não inclui mão de obra, embalagem nem a reserva para a garantia." no bloco de Finanças? Sem resposta, ela fica de fora.
- Opcionais: medidas e peso, fotos em `referencias/` e os nomes autorizados da equipe.
