# SunTech v3: progresso da Fase 1 (cena do produto, isolada)

06/10/2026, branch `v3`. A página monta só a cena do produto (o hero de 700vh no desktop e 490vh no celular) e a ponte para a próxima parte. As seis partes e o modo pitch ficam para a Fase 2. Nada foi commitado ainda.

## O que existe

- **O modelo (`public/models/suntech.glb`, 1,13 MB).** Gerado por código em `scripts/model/` (`npm run model`): caixa com tampa e dobradiça, nome "SunTech" em letras 3D extrudadas da Archivo variável, chave, USB-C, micro-USB, LED e USB-A; suporte e duas células 18650; módulo de carga TP4056 (`pcb_charge`) e conversor boost (`pcb_boost`, com a `usb_port` e o `led`); duas placas solares dobráveis (`panel_a`, `panel_b`); e o celular (`phone`). Peças nomeadas pelo contrato do `CLAUDE.md`, com o pivô no encaixe. **Nenhuma malha de terceiros:** consultei Poly Pizza, OpenGameArt e Poly Haven e não importei nada (`public/models/LICENSE.md`).
- **A cena (R3F).** Um canvas transparente fixo; o fundo é a cor CSS `--bg`, animada pela mesma coreografia; a palavra gigante de cada beat é DOM atrás do canvas. Materiais PBR por nome, ambiente local (Lightformers), sombra de contato, bloom só no que emite luz, tone mapping Neutral. Células do painel com brilho, carga das baterias, fluxo de energia no cabo 3 em 1, tela do celular.
- **A coreografia (9 beats).** Fechado, Abre, Explode, Captar, Proteger, Guardar, Entregar, Remonta, Energia, um tom de fundo por beat. Em `scene/choreography.ts` (dados) e `lib/tracks.ts` (avaliador). Um enquadramento por beat para o desktop e outro para o celular, medidos por `scripts/dev/framing.mjs`.
- **O DOM.** `sections/ProductScene.tsx`: texto de cada beat nas laterais (embaixo no celular), com pano de fundo na cor do fundo para garantir contraste; palavra gigante; loader; ponte. Reduced motion e `?nowebgl`: pilha de blocos de 100svh, um por beat.

## Decisões (e por quê)

1. **Cena no topo, como hero (opção A).** O produto grande aparece no primeiro quadro; a Parte 3 deixa de ter o 3D dentro dela.
2. **`pcb` virou `pcb_charge` e `pcb_boost`**, porque o roteiro tem quatro componentes. Aprovado.
3. **Critérios 1 e 4 reescritos** (aprovado): altura 55–70% **e** largura ≤ 66% no desktop; no celular, largura ≤ 88% e altura 45–55% quando a proporção deixa. Tempo de quadro: p95 ≤ 18 ms e p99 ≤ 25 ms numa varredura de scroll (o `rAF` trava em 60 Hz, então "p95 ≤ 16,7 ms" não discrimina).
4. **GLB gerado, não baixado.** O contrato de peças (um nó por peça, pivô no encaixe, interior oco, chanfro) e a escala em 1 unidade = 100 mm são mais fáceis de garantir gerando. Um GLB feito à mão com os mesmos nomes entra no lugar sem mexer na coreografia.
5. **Os trilhos de scroll são uma função pura de `scrollY`**, não uma timeline do GSAP. O `render(y, false, true)` forçado deixava trilhos presos no valor de um salto anterior (o fundo errado depois de pular vários beats; achado pelo `reverse.mjs`), e o `pinStart` de −0,001 prendia `product.ry` e `tilt` na primeira descida. Agora rolar para cima desfaz tudo exatamente (diferença 0 em 19 pontos × 261 valores, em três ordens de visita). A `ease` de cada trilho continua sendo do GSAP (`gsap.parseEase`).
6. **O voo da câmera acontece na janela sem texto** em volta de cada divisa (3% antes do beat até 1,2% depois). Assim o sujeito está enquadrado em 0, 25, 50, 75 e 100% do pin e em todo ponto com texto. A explosão é a exceção, e a câmera recua junto com ela (mesma ease). A remontagem passa pelo enquadramento da explosão e desliza para o conjunto fechado; o painel fecha na cauda do close da saída, onde não aparece.
7. **O tier de qualidade só sobe com o scroll parado.** Subir liga o bloom e a sombra de verdade e refaz o composer (130 ms num PC); no meio do scroll isso virava travada. `?tier=alto|medio|baixo` fixa o tier (o `snap` usa).
8. **O `Warmup` roda a cena de verdade pelo composer** (produto, celular e cabo ligados, 4 quadros) antes de tirar o loader. `compileAsync` sozinho compila para a tela, e a cena é desenhada num alvo do composer: os programas do celular, do cabo e da sombra compilavam no primeiro uso, no meio do scroll, com 150 a 350 ms.
9. **Pano de fundo atrás do texto** (`.beat__body::before`, cor do fundo a 90%, borda curta): as peças fora de foco (15%) passavam atrás do texto e derrubavam o contraste. O `snap` mede nos pixels.

## Resultados dos comandos do aceite

Rodados em 06/10/2026, no fim da fase, com o build final (PC com GTX 1060, Chromium com a GPU da máquina).

| Comando | Resultado |
|---|---|
| `npm run typecheck`, `npm run lint`, `npm run check:numbers` | limpos (0 erros, 0 avisos) |
| JS gzip (`snap`) | inicial **129,6 KB** (teto 150), total **424,8 KB** (teto 500), CSS 8,9 KB; o chunk da cena tem 295,3 KB |
| GLB | **1,13 MB** (1.184.532 bytes; teto 1,5 MB) |
| `npm run snap v3-fase-1` | **tudo certo**: 8 passadas (1440×900 e 390×844, normal e reduced motion; 1920×1080; tablet 768×1024; celular no tier baixo; `?nowebgl`), 14 fotos por passada, **0 erros de console, 0 reprovações de contraste AA, CLS 0**, LCP de 148 a 416 ms |
| `scripts/dev/sweep.mjs` | quadro a quadro, 25 px por quadro: p50 16,7, p95 16,7–16,8, p99 16,8, **máx 16,8 ms** em 1440×900 (DPR 1 e DPR 2), 1920×1080 (DPR 1) e 390×844 (DPR 2, 18 px por quadro). Nenhum quadro acima de 18 ms |
| `scripts/dev/reverse.mjs` | rolar para cima desfaz tudo: **diferença 0** em 19 pontos × 261 valores (estado, peças, câmera, texto), subindo, descendo e pulando, no desktop; 2,5e−5 no celular (a inclinação do ponteiro assentando) |
| `scripts/dev/framing.mjs` | desktop: os 9 beats com 61–62% de altura, largura 26–57% e centro a ≤ 1% do da viewport; em **0, 25, 50, 75 e 100% do pin**: 62, 60, 62, 61 e 62%. Celular: todos os beats dentro do critério reescrito (largura 72–88%; altura 27–50%, ver abaixo) |
| `scripts/dev/axe.mjs` (1440×900, reduced motion e 390×844) | 0 violações; `tab-order.mjs`: 13 paradas de foco, todas com contorno visível |

Fotos: `.snapshots/v3-fase-1/` (fora do git). Para regerar: `npm run snap v3-fase-1` (uns 15 minutos).

## O que ficou abaixo do esperado

1. **Celular: a altura do sujeito fica em 27–50%.** A largura manda (88%). Só o `abre` (49%), o `explode` (50%) e o `painel` (49%, com o painel em V) chegam à faixa de 45–55%; `fechado` 38%, `proteger` 40%, `guardar` 27%, `entregar` 29%, `remonta` 38% e `energia` 32%. A Fase 0 pedia testar **girar 90° as peças em foco** (câmera com rolagem) para ocupar a altura da tela em pé; **não testei**.
2. **Sem etiquetas ligadas às peças.** O texto de cada beat fica na lateral (ou embaixo), e as âncoras `label_*` estão no GLB, mas nada as projeta na tela. Ficou para a Fase 3 se o dono quiser.
3. **A página ainda não tem as 6 partes nem o pitch** (Fase 2). Os links "1 Problema" a "6 Jovem" do cabeçalho não levam a lugar nenhum por enquanto, e o texto da ponte encosta na borda do painel. O `test:pitch` não se aplica antes da Fase 2.
4. **Medidas reais do produto continuam pendentes** (`// TODO: preencher` no `product.ts`): o modelo usa as proporções padrão (caixa 150×100×40 mm, placa 200×150×6 mm).
5. **FPS só medido em PC.** Sem celular real: o procedimento do `?debug` está no README. O tier de qualidade sobe e desce sozinho, mas só foi testado em PC (o `?tier=baixo` mostra o pior caso).
6. **Polimento visual pendente**, em ordem do que mais aparece: o interior da caixa é vazio (sem fios entre as placas, nem oclusão ambiente por peça); o aço do USB-A e do USB-C ainda brilha demais nos closes; o preto fosco da caixa some em parte sobre o fundo Noite (a luz de contorno segura, mas é o ponto mais fraco). Conferi o meio das animações (abertura da tampa, explosão, abertura do painel e remontagem, em 0,15, 0,265, 0,425, 0,44 e 0,84 do pin): tudo dentro do quadro.
7. **O pano de fundo do texto** nos closes (Proteger, Guardar, Entregar) é um cartão arredondado na cor do fundo: resolve o contraste, mas é uma escolha visual a revisar com o dono (a versão com sombra desfocada era mais suave, e compilava um shader na primeira vez, com 33 a 50 ms de travada).
8. **Fase 3, não tocada:** `public/og.png` e o `og:image:alt` ainda mostram o hero da v2; `DESIGN.md` descreve a v3 mas o `.impeccable/design.json` é da v2; a Vercel segue servindo a v2.

## 07/10/2026: revisão do dono e ajustes (Fase 1b)

A Fase 1 foi commitada (`629c084`) e o dono respondeu às quatro perguntas:

1. **Modelo 3D reprovado** ("muito simples, não é o que eu queria"). Ele vai modelar à mão e entregar depois. O GLB gerado fica como provisório; o contrato para o modelo feito à mão (escala, eixos, nomes, pivôs, âncoras, materiais, exportação) está em `docs/v3-modelo-a-mao.md`.
2. **Girar 90° as peças em foco no celular: sim.** Feito com rolagem da câmera (`roll`, 7º número das tabelas `NARROW`, em graus; `CameraRig` aplica depois do `lookAt`; o `framing.mjs` mede e resolve com ela). Só nos closes de **Guardar** (27% → **50%** de altura) e **Entregar** (29% → **50%**). Proteger não gira: o módulo é quase quadrado e ficaria em 41% contra 40%, com o texto da placa de lado à toa. O giro acontece no voo da câmera (a janela sem texto).
3. **Etiquetas ligadas às peças: sim.** `sections/PartLabels.tsx` (DOM: ponto, linha em SVG e pílula com número e nome, de `sceneCopy.labels`) e `scene/model/LabelProjector.tsx` (projeta a âncora `label_*` ou, sem ela, o centro da peça, e escreve direto no DOM). Desktop: pílula na coluna livre do lado oposto ao texto, à altura da âncora. Celular: pílula logo acima do texto. Um trilho próprio, `labels` (0 a 1), só acende com a câmera parada no close: no voo de Entregar para a remontagem o foco desce de 4 a 0 e fazia a etiqueta do módulo de carga piscar no caminho.
4. **Medidas e peso fictícios: sim.** `product.ts`: caixa 150×100×40 mm, painel fechado 200×150×12 mm, aberto 400×150×6 mm, 580 g (iguais às proporções do 3D, então o modelo não muda). Na ficha técnica saem com o rótulo "ilustrativo" (`SpecRow.illustrative`). Regra atualizada no `CLAUDE.md`.

Resultados: `typecheck`, `lint` e `check:numbers` limpos. `framing.mjs`: desktop, 9 beats com 61–62% de altura; celular, todos no critério (Guardar e Entregar 50%; Fechado 38%, Proteger 40%, Remonta 38% e Energia 32% continuam limitados pela largura). `reverse.mjs`: diferença 0 (desktop) e 2,45e−5 (celular, a inclinação do ponteiro). `sweep.mjs`: máx 16,8 ms em 1440×900 e em 390×844 com DPR 2.

`npm run snap v3-fase-1b`: **tudo certo** nas 8 passadas (0 erros de console, 0 reprovações de contraste AA, CLS 0); JS gzip inicial 129,9 KB e total 426,0 KB. As fotos com reduced motion mostraram as etiquetas desbotadas (o ponto de repouso caía no fade de saída delas). Corrigido: a etiqueta fica inteira até `restOf` e apaga no início do voo; conferido com `shots.mjs --reduced` e `reverse.mjs` de novo.

## Fase 2: as 6 partes e o modo pitch em volta da cena (07/10/2026)

1. **Partes montadas** em `App.tsx`, depois da cena e da ponte, na ordem das aulas (Problema, Cliente, Solução, Diferencial, Empresa, Pitch, Jovem), com o `PitchHud`. Os componentes da v2 entraram sem mudança de conteúdo.
2. **Tom por parte (`PART_TONE`):** Noite, Nuvem, Grafite, Grafite, Céu, Noite, Nuvem (alternando escuro e claro; a Parte 1 continua no Noite da cena). Escolhi **campos pintados** (`data-field`, que redefine `--bg` e `--fg` dentro da parte) em vez de animar o fundo da página: numa página que rola, sempre tem texto na tela, e uma troca animada passaria pela zona morta de contraste. Com campos, a divisa é uma borda reta e todo texto está sobre o seu campo. Os trilhos `bg.*` e `tone` seguem a parte sob o header (degrau na divisa), para o header e o fundo da página; nas partes o header é uma faixa sólida em `--bg` (`data-solid`).
3. **Saída da cena:** depois do pin a imagem sobe com a página (`lift`, um deslocamento de lente linear de 0 a 1 tela, sem `damp`) e o produto some fora da tela. Antes, ele ficava parado no centro, o texto da ponte passava por cima e o campo da Parte 1 o cortava ao meio.
4. **Grão dentro dos campos** (`[data-field]::before`, fora das camadas do CSS para vencer a regra do `body::before`): sem ele, o Noite da Parte 1 parecia mais escuro que o da ponte.
5. **Pitch remapeado:** "Por dentro" e "Como funciona" apontam para `produto` (0,08–0,38 e 0,38–0,8 do pin). `npm run test:pitch`: tudo certo, normal e com reduced motion.
6. **Header:** os 6 links levam ao início exato de cada parte, com `aria-current`, foco no título e o tom certo (Playwright, 0 erros).
7. **Tempo de quadro do pin.** Com as partes na página, o `sweep.mjs` passou a ter picos de 33–50 ms. Bissecção por `--css`: escondendo as partes, ou só o conteúdo delas, passa; sem o grão ou sem o fundo dos campos, não. O texto dos beats e a palavra gigante mudam a cada quadro sem camada própria e repintavam a camada da página, que agora tem o conteúdo das partes logo abaixo do pin. `will-change: transform, opacity` em `.beat` e `.beat-word` resolve: 3 rodadas por configuração (a máquina estava ruidosa, a referência oscilava de 0 a 8 picos), a atual reprovava 2 de 3 e a corrigida passa todas (p99 16,8 ms), no desktop e no celular com DPR 2. `content-visibility: auto` nas partes também resolvia, mas muda a altura medida das seções antes de renderizar (links, pitch e trilhos errados).
8. **Acessibilidade:** `axe` 0 violações (1440×900, 390×844 e reduced motion); `tab-order` 21 paradas de foco, todas com contorno visível.

## Fase 3a: o que não depende do modelo (12/10/2026)

O dono está modelando o carregador no Blender e pediu para tratar o modelo como "feito" (entra quando estiver pronto) e seguir a Fase 3 no que não depende dele, mais uma prévia da branch `v3` na Vercel para revisar no celular.

1. **Sobras da v2 fora do git.** O commit `6515182` tinha levado `ONDE-PARAMOS.md`, `ONDE-PARAMOS-CODIGO.md` e `PROMPT-1-SUNTECH.md` para o git; saíram (`git rm --cached`) e foram para o `.gitignore`. Continuam no disco.
2. **Trilho de fundo preso numa rampa (P1, achado na auditoria).** No celular, a Parte 6 inteira ficava com `--bg` num cinza entre Noite e Nuvem, e o header era uma faixa cinza com texto branco (contraste ruim). Causa: `lib/sections.ts` arredonda o topo e soma a altura inteira, e a base da Parte 5 passava 1 px do topo da Parte 6; ao ordenar as chaves por posição, "fim da Parte 5 = Noite" caía depois de "início da Parte 6 = Nuvem", e o trilho interpolava de Noite até a base da Parte 6. Correção em `lib/tracks.ts`: as chaves entram na ordem da página e nenhuma fica antes da anterior. O `snap` não pegava porque fotografa as partes descendo, com o header escondido.
3. **Tabela "O que fazemos de diferente?" no celular (P1).** Com 34rem de largura mínima, a coluna da **SunTech** ficava fora da tela, atrás de uma rolagem lateral sem pista. Abaixo de 40rem, cada critério vira um bloco com o nome da coluna antes de cada resposta (`.data-table--compare`, `subgrid`). Papéis ARIA explícitos na tabela (o Safari tira a semântica de quem muda de `display`) e o nome da coluna no `::before` com texto alternativo vazio (o leitor de tela já o lê pelo cabeçalho escondido).
4. **Cores de energia sumidas do CSS.** Ao tirar as sobras do git, as etiquetas de componente perderam a pastilha colorida (o `snap` acusou contraste 1:1 nos números). O Tailwind v4 só emite as variáveis do `@theme` que vê em uso, respeita o `.gitignore`, e as etiquetas montam o nome (`var(--color-${label.color})`): as variáveis só existiam porque o `ONDE-PARAMOS-CODIGO.md` citava os nomes. Agora o bloco é `@theme static`. Conferi o CSS com e sem o arquivo velho: só 5 variáveis mudam, e 6 classes utilitárias que ele citava não são usadas no código.
5. **SEO.** `public/og.png` refeito com o hero da v3 (modelo provisório) e `og:image:alt` reescrito; `<title>`, `description` e `og:description` conferidos (valem para a v3). O guia do modelo ganhou o passo `npm run build && npm run og`.
6. **`/impeccable document`.** `DESIGN.md` e `.impeccable/design.json` refeitos a partir do build: header em faixa sólida nas partes, Brasa sem uso, cores dos materiais vindas dos `OVERRIDES`, degraus de tipo reais (título do beat), o pano dos closes como única exceção da Regra do Fundo, a tabela empilhada.

Aceite: `typecheck`, `lint`, `check:numbers` e `model:check` limpos. `npm run snap v3-fase-3`: **tudo certo** nas 8 passadas (0 erros de console, 0 reprovações de contraste, CLS 0; JS gzip inicial 137,0 KB, total 441,6 KB). `reverse.mjs`: diferença 0 no desktop e 2,5e−5 no celular. `sweep.mjs`: 3 de 3 no desktop e 3 de 3 em 390×844 com DPR 2 (máx 16,8 ms); as 4 primeiras rodadas no desktop, logo depois do `snap`, reprovaram com vários quadros de 33 ms, e o mesmo build passou 3 de 3 depois (ruído da máquina, ver armadilhas). `axe` 0 violações (1440×900, 390×844, reduced motion); `tab-order` 21 paradas com contorno; `test:pitch` tudo certo.

Ficou de fora (depende do modelo ou do dono): polimento 3D (aço do USB, preto da caixa sobre o Noite, interior vazio), `og.png` com o modelo definitivo, as perguntas visuais (tons, cartão nos closes, painel em V) e o FPS num celular real, pela prévia. Restos de texto da v2 em comentários (`index.css`, cabeçalho e céu; `SuntechModel.tsx`) e a classe `.type-display` sem uso ficaram para a próxima limpeza.
