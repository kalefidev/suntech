# SunTech v3: Fase 0 (plano, sem código)

Branch `v3` (da `v2`, commit 23991ba), 06/10/2026. Nenhum código mudou; a v2 está limpa (`typecheck`, `lint` e `check:numbers` passam). Base: leitura de `src/`, fotos de `.snapshots/fase-7-final/` e três medições (scripts em `docs/v3-medicoes/`). Leitura rápida: só as "Decisões" abaixo; o resto é referência.

**Aprovado pelo dono em 06/10/2026, e a Fase 1 começou:** (1) o GLB não existe: eu o crio, reaproveitando partes prontas abertas (GitHub etc.), com a licença de cada uma em `public/models/LICENSE.md`; (2) as 6 partes e o pitch continuam; (3) a escolha da posição da cena ficou comigo: **A, no topo, como hero**; (4) `pcb_charge` e `pcb_boost` no lugar de `pcb`; (5) critérios 1 e 4 reescritos como propostos nos riscos 1 e 2 (já no `CLAUDE.md`).

## Decisões (todas respondidas acima)

1. **GLB.** Existe um GLB do carregador (ou alguém para modelar)? Não há `.glb`, `.obj`, `.fbx`, `.blend` nem `.stl` no projeto, nem pasta `referencias/`. *Sem resposta: procedural chanfrado, com os nomes do contrato (§3).*
2. **6 partes e modo pitch.** Continuam obrigatórios na feira? *Sem resposta: sim, conteúdo intacto.*
3. **Onde a cena mora.** (A) no topo, como hero de 700vh, e as 6 partes depois; (B) dentro da Parte 3, com um hero curto antes. **Recomendo A**: é o que as quatro referências fazem e o produto grande aparece no primeiro quadro. Custa o BRIEF §2.3 ("3D dentro da parte 3"): a Parte 3 fica com texto e tabela. Com B, a revelação só chega depois de ~6 telas de texto.
4. **Contrato de peças.** O roteiro tem 4 componentes e o contrato só tem `pcb`. Proponho `pcb_charge` (TP4056 + DW01) e `pcb_boost` (com `usb_port`).
5. **Critérios 1 e 4 do prompt.** Não se sustentam como escritos; proposta nos riscos 1 e 2.

## 1. Diagnóstico confirmado

| Sintoma | O que medi ou vi | Onde está |
|---|---|---|
| Produto pequeno e fora do centro | Hero 1440×900: ~38% da altura, centro a +27% (x) e +29% (y); celular: 24% da altura. "Por dentro" corta o painel na borda | `CAMERA.hero = orbit(…, 11.5, 30, sx 0.32, sy −0.28)` (`choreography.ts:151`): a lente empurra o produto para a direita e para baixo, de propósito, por causa da coluna de texto |
| "Caixas" | **Em parte.** Caixa, tampa e molduras já têm chanfro de 2,5 mm (`roundedSlab`), mas placas, USB, vidro e plugues são `BoxGeometry` (19 usos). Tudo preto fosco (`#141518`, rugosidade 0,55), sem acento nem luz de contorno | `Case.tsx`, `Internals.tsx`, `Panel.tsx`, `PhoneCable.tsx`, `materials.ts` |
| Scroll duro | Golpe de roda de 600 px: o Lenis assenta em 0,5 s e a **câmera só em 0,8 a 1,1 s**. Quatro suavizações em série | Lenis, `lerp` 0,1 padrão (`lenis.ts:18`) → câmera `damp` 0,35 s (`CameraRig.tsx:34`) → pose do produto 0,3 s (`Product.tsx:74`) → tampa e explosão 0,18 s (`Product.tsx:40`) |
| Céu e zona morta competem | ~100 ocorrências em 16 arquivos. As 3 travessias tiram ~17% do scroll dos pins: tela sem texto e com o produto longe | `Sky.tsx`, `daylight.ts`, `sky.frag.glsl`, `LightShaft.tsx`, `Lights.tsx`, `tracks.ts` |
| Efeito principal diluído | 3 pins (250, 350 e 200vh), com o produto pequeno à direita; a explosão é curta (as peças sobem de 0,1 a 0,9 un.; só a tampa chega a 1,35) e os callouts entram um por vez | `Inside.tsx`, `HowItWorks.tsx`, `EnergyStays.tsx` |

Linha de base da v2: 60 fps em 1440×900, DPR 1, GTX 1060 (p50 16,7 e p95 16,7–16,8 ms; quadros isolados de 33 a 150 ms no hero, em "Por dentro" e em "Como funciona"). JS gzip: inicial 137,7 KB (teto 150), cena 286,4 KB, total 432,5 KB (teto 500).

## 2. Roteiro (valores iniciais do `choreography.ts`)

`SectionId` novo, `produto`: pin de 700vh no desktop e 490vh no celular; `p` é a fração do pin. `h` e `l` são a altura e a largura do sujeito (o conjunto do beat ou a peça em foco) na tela, em 1440×900.

| p | Beat | Fundo | Palavra | O que se move | h / l |
|---|---|---|---|---|---|
| 0–0,08 | Fechado | Nuvem | Sol | Painel dobrado em pé atrás da caixa; `ry` 0→14° preso ao scroll; inclinação do ponteiro | 62 / 40 |
| 0,08–0,22 | Abre | Nuvem | Abre | `lid` 0→110° na dobradiça de trás; o painel sobe e deita antes de a tampa passar de 90°; câmera +20° | 62 / 34 |
| 0,22–0,38 | Explode | Noite | Dentro | Camadas sobem em cascata (y: placas 3,3 e 2,8; tampa 2,25; `pcb_charge` 1,7; células 1,15; `pcb_boost` 0,65; base 0); a câmera recua junto | 62 / 27 |
| 0,38–0,485 | Captar | Céu | Captar | Foco em `panel_a` e `panel_b`, que abrem como livro; as outras peças a 15% | 62 / 49 |
| 0,485–0,59 | Proteger | Noite | Proteger | Foco em `pcb_charge` | 62 / 51 |
| 0,59–0,695 | Guardar | Nuvem | Guardar | Foco em `cell_a` e `cell_b`; a carga sobe | 62 / 50 |
| 0,695–0,80 | Entregar | Grafite | Entregar | Foco em `pcb_boost` e `usb_port`; `led` acende | 62 / 50 |
| 0,80–0,92 | Remonta | Nuvem | Simples | Tudo volta e a tampa fecha; a câmera dá a volta, de 30° a 60° | 62 / 41 |
| 0,92–1,00 | Energia | Noite | Energia | Celular em pé entra; fluxo da `usb_port` ao celular; carga 0→1; o pin solta | 55 / 55 |

Câmera do `produto`, desktop (`orbit(alvo, az, el, dist, fov)`, com `sx = sy = 0`): o `p` de cada linha é o fim do beat, e a pose vale do ponto de chegada (35% do beat) até esse fim, para o dado aparecer com a peça já enquadrada. Entre poses, `ease: "power2.inOut"` por segmento (campo novo `ease` no `Track`; os outros trilhos seguem lineares).

```ts
[0.08,  orbit([0, 0.77, 0.20],   30, 22,  7.0, 30)], // Fechado
[0.22,  orbit([0, 0.67, -0.17],  24, 42,  6.7, 30)], // Abre
[0.38,  orbit([0, 1.68, 0],      30, 22, 11.4, 30)], // Explode
[0.485, orbit([0, 3.08, 0],      30, 45,  6.2, 30)], // Captar
[0.59,  orbit([0, 1.73, 0],      30, 45, 0.73, 30)], // Proteger
[0.695, orbit([0, 1.24, 0],      30, 45,  1.8, 30)], // Guardar
[0.80,  orbit([-0.05, 0.69, 0.03], 30, 45, 0.91, 30)], // Entregar
[0.92,  orbit([0, 0.77, 0.20],   60, 22,  6.9, 30)], // Remonta
[1.00,  orbit([0.47, 0.75, 0],   20, 25,  5.6, 30)], // Energia
```

- **O centro não se mexe.** `camera.dist` e `explode` usam as mesmas chaves, para a altura ficar em 55–70% durante o beat. O alvo sobe uns 3% da altura do sujeito (a perspectiva o desce). Confere em 0, 25, 50, 75 e 100% e em mais 12 pontos do `snap`.
- **Tom.** Dois tons de texto (Noite e Nuvem) e quatro de fundo (Nuvem, Céu, Noite, Grafite), trocados nos 3% finais do beat, com o texto em opacidade 0 (o `snap` ignora texto abaixo de 0,98, então a zona morta, L 0,167–0,246, não reprova). A cena termina em Noite, para a Parte 1 continuar no escuro (opção A).
- **Palavra gigante** (de `copy.ts`, a 10% de `--fg`): DOM em `z-index: -2`, atrás do canvas (-1) e do texto; anda por `transform`, sem fade-up. **Dado do beat**, de `product.ts` (2 placas de 6 V e 3 W; TP4056 e DW01; 2 células 18650, 5.200 mAh; boost de 3,7 V para 5 V). Texto e etiqueta nas laterais (≥ 22% livre por lado); no celular, embaixo, em 25% da altura.
- **Celular (`narrow`).** A largura manda: dist 9,7 / 7,8 / 12,4 / 10,2 / 1,3 / 3,0 / 1,6 / 9,7 / 10,3, e altura 39 / 46 / 50 / 33 / 31 / 32 / 31 / 39 / 25%.
- **Reduced motion.** Sem pin; cada beat vira um bloco de 100svh, parado no `p` do meio dele.

## 3. Modelo 3D

Sem GLB: procedural **chanfrado**, com os nomes do contrato (`case_base`, `case_lid`, `cell_a`, `cell_b`, `pcb_charge`, `pcb_boost`, `panel_a`, `panel_b`, `usb_port`, `led`), pivô da tampa na dobradiça de trás e das placas na lombada. Muda em relação à v2: `roundedSlab` em tudo que aparece (placas, USB, vidro, plugues); acentos claros (aço escovado, azul da PCB, etiqueta da célula) contra o preto; tiras de luz de contorno no `StudioEnvironment` (já local, via PMREM), com intensidade por tom; sombra de contato (reflexo no chão só se o custo permitir). Medidas em `DEFAULT_PROPORTIONS` (caixa 150×100×40 mm, placa 200×150×6 mm); os `TODO` do `product.ts` seguem pendentes. Com GLB (até 1,5 MB, meshopt, texturas WebP ou KTX2): `useGLTF` do drei, **sem Draco** (ele busca o decoder no gstatic, CDN proibido); a coreografia não muda.

## 4. Arquitetura

- **Canvas transparente** (`alpha: true`) sobre o fundo CSS (`--bg`, animado pela mesma timeline); o `postprocessing` lê o `alpha` do contexto (`build/index.js:1020`). O grão sai do composer e vira um tile CSS fixo, sem blend mode.
- **Uma timeline, três consumidores:** `BEATS` (id, `from`, `to`, tom, palavra, foco) em `choreography.ts` alimenta o 3D (`tracks.ts`), o CSS (`--bg`, `data-tone`) e o texto (`stage.ts`); nenhum importa `three`. `applyTone` sai do `daylight.ts` para um `lib/tone.ts` só de CSS.
- **Uma só camada de suavização:** Lenis com `lerp` de 0,1 a 0,14 (a afinar com `?slowmo`), peças escritas direto do estado e `damp` só na câmera (λ ≥ 10). O estado é função de `scrollY`, então rolar para cima desfaz exato.
- **Fade de peças:** nascem `transparent: true` (regra do `Warmup`); só `opacity` e `depthWrite` mudam. Sem névoa.
- **Dependências novas: nenhuma.**

## 5. O que sai e o que fica

| Sai (Fase 2 apaga; a Fase 1 só para de importar) | Fica |
|---|---|
| `Sky.tsx`, `skyLive.ts`, `daylight.ts`, `sky.*.glsl`, `LightShaft.tsx` e o shader dele; `dayTime`, `cloudCover`, `guardWide`, `shaft`, `schematic` e `flow` do `state.ts` e os trilhos deles; `schematic.ts`; `body::before` e `--sky-*`; o raio e a hora na abertura; a névoa | Lenis, GSAP, `sections.ts`, `stage.ts`, `tracks.ts`; `StudioEnvironment`, `ContactShadow`, `Effects` (sem `Noise`), tiers de qualidade; texturas e materiais CSM; `Phone`, cabos e o shader de fluxo; o projetor de etiquetas; loader, header (sai de cena na troca de tom, o `data-crossing` de hoje), todo o conteúdo, `check-numbers`; o pitch (alvos remapeados); `?nowebgl` com o diagrama SVG; reduced motion |

## 6. Riscos e contradições do prompt (do mais grave ao menos)

1. **Critério 1 não cabe em peças largas.** A 62% de altura, a caixa deitada ocupa 70% da largura (elevação 22°), a placa deitada 93%, o TP4056 73%; a 45° caem para 50–57%. No celular, só a pilha explodida (50%) e o "Abre" (46%) chegam a 45% de altura; o resto fica em 25–39%, limitado por 88% da largura. *Proposta:* desktop, altura 55–70% **e** largura ≤ 66%; celular, largura ≤ 88% e altura 45–55% quando a proporção deixa. Na Fase 1, testar girar 90° as peças em foco no celular.
2. **Critério 4 não é mensurável como escrito.** O `rAF` trava em 60 Hz: a v2, a 60 fps cravados, mede p95 16,8 ms; e o `frametime.mjs` faz a média de 3 quadros parados. *Proposta:* p95 ≤ 18 ms e p99 ≤ 25 ms numa varredura de scroll (`sweep.mjs`, novo), mais um teste em DPR 2 (o `snap` fixa DPR 1).
3. **Canvas transparente com pós-processamento e sombra:** spike de 1 hora no começo da Fase 1 (bloom sobre alfa, MSAA, sombra). Plano B: canvas opaco, fundo lido do `--bg` e a palavra num plano com textura.
4. **Preto fosco sobre fundo escuro some** (Explode, Proteger, Entregar, Energia): depende da luz de contorno e do chanfro; validar nas fotos antes de seguir.
5. **Colisão tampa × painel:** a 110°, a tampa entra no volume do painel em pé; o painel sobe antes dos 90°.
6. **Custo com a cena sempre em movimento:** o `ContactShadow` refaz a sombra a cada quadro de scroll (baixar para 512 px e refazer a cada 2 quadros); o bloom "só no LED e no fluxo" pede limiar ~1,2 e emissivos ≥ 4 (as tiras do ambiente chegam a 3,2); MSAA e DPR 2 pesam mais do que o `snap` mede.
7. **"Giro lento" por tempo quebra "desfaz exatamente":** a rotação fica presa ao scroll. Teste novo, `reverse.mjs` (vai e volta e compara estado e poses; pixels não servem, o pulso de energia é por tempo).
8. **Pin de 700vh no celular:** a barra de endereço do iOS dispara refresh (`ScrollTrigger.config({ ignoreMobileResize: true })`; 490vh). O Lenis não suaviza toque; ali só o `damp` da câmera suaviza.
9. **JS:** folga de 12 KB no inicial e 67 KB no total. O céu sai (estimo −10 KB); GLTFLoader e meshopt (~+25 KB) só entram com GLB.

## 7. Fases e skills

- **Fase 1 (cena isolada, desktop e celular):** spike do canvas → peças nomeadas, materiais e luz → `BEATS`, `choreography.ts` e `tracks.ts` → texto, palavras e tom → `narrow` → scripts (`sweep`, `reverse`, enquadramento; `snap` com 25 e 75% do pin). A página só monta a cena; as partes ficam fora, sem apagar. Fecha com `typecheck`, `lint`, `check:numbers`, `snap` e fotos, e eu digo o que ficou abaixo.
- **Fase 2:** as 6 partes e o pitch em volta; código morto do céu; `PRODUCT.md` (princípio 3, "o problema acontece no escuro"); diagrama do fallback.
- **Fase 3:** polimento, performance, SEO (o `og.png` e o `og:image:alt` mostram o hero da v2), `/impeccable document` (refaz o `.impeccable/design.json`; o `DESIGN.md` já foi refeito nesta fase) e deploy na Vercel.

| Fase | Skills |
|---|---|
| 1 | `gsap-timeline`, `gsap-scrolltrigger`, `gsap-core` (`matchMedia`), `gsap-react`, `react-three-fiber`, `three-best-practices`, `threejs-webgl`, `60fps-animation`, `accessible-animation`, `emil-design-eng`, `animate`, `craft` |
| 2 | `gsap-plugins` (SplitText, DrawSVG), `svg-animation`, `accessibility`, `design:ux-copy`, `impeccable` |
| 3 | `impeccable` (`audit`, `polish`, `document`), `improve-animations`, `gsap-performance`, `60fps-animation`, `accessibility`, `design:accessibility-review`, `vercel:deploy`, `vercel:verification` |
| Fim de fase | `impeccable critique` nas fotos do `snap`; a `/review-animations` fica com você |

Verificação visual: `snap` e `probe` (Playwright). Para conferências rápidas com o Playwright MCP (regra do `AGENTS.md`), as imagens vão para `.snapshots/`, fora do git.
