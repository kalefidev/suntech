# PROGRESS

Estado do projeto SunTech. Leia isto antes de continuar qualquer fase — evita
repetir decisões já tomadas ou reabrir debates já resolvidos.

## Fase 0 — plano (aprovado)

Entregue e aprovado pelo usuário. O plano completo (tokens finais, wireframes,
mapa de scroll, peças/poses/ordem de explosão, árvore de componentes, tiers,
riscos, autocrítica e mapa de skills) está em
`C:\Users\User\.claude\plans\acesse-a-pasta-claude-spicy-thimble.md`. Decisões
que valem citar aqui porque afetam código futuro:

- **`dayTime` é 0–1** ("um dia contado pela página", não hora real), com
  waypoints: 0,00 madrugada · 0,08 primeiro raio · 0,20 manhã · 0,45 meio-dia ·
  0,62 tarde · 0,62→0,95 entardecer→noite (Ato 4) · snap 0,95→0,30 · 0,30 fixo
  nos Atos 5–7 · 0,30→0,68 no Ato 8 (fim de tarde dourado).
- **Regra de `--fg` por zona de contraste medida** (WCAG), não por "metade
  clara/escura do dia": `Nuvem` sobre `Brasa` reprova AA (2,74:1); `Noite`
  cobre manhã/meio-dia/tarde/amanhecer/entardecer (≥5,4:1). `Nuvem` só nas
  pontas (madrugada profunda / noite plena). Implementado em
  `scene/daylight.ts` (`isNightZenith`, limiares 0,06 e 0,88).
- **Só o LED azul de saída tem callout narrativo** (Ato 4). Os LEDs do próprio
  módulo TP4056 (vermelho carregando / azul completo) ficam só na textura da
  placa, sem callout — dois "LED azul" narrativos colidiriam.
- **Esquema do Ato 3: 7 nós, 4 passos coloridos.** Captar→painel · Proteger→
  diodo+controlador · Guardar→bateria · Entregar→conversor+saída. Ver
  `content/product.ts` (`energyPath[].schematicNodes`).
- Medidas/peso do produto continuam `null` (placeholders tipados) até serem
  medidos — `product.ts`, `DEFAULT_PROPORTIONS` cobre o 3D enquanto isso.

## Fase 1 — fundação (em andamento)

Feito:
- Scaffold Vite + React 19 + TS strict gerado numa pasta temporária e movido
  para cá (nunca sobrescrevemos `BRIEF.md`). `brief-01-carregador-solar.md`
  virou `BRIEF.md` (cópia, arquivo antigo removido) — era a pendência da
  Fase 0.
- Dependências instaladas com as versões estáveis mais recentes de cada uma
  (checadas contra o registry no momento: three 0.186, R3F 9.8, drei 10.7,
  gsap 3.15, lenis 1.3, tailwindcss 4.3 etc. — todas dentro das faixas major
  pedidas pela seção 4 do brief).
- `sceneState` (`scene/state.ts`), `daylight.ts` (céu + regra de contraste +
  posição do sol), `quality.ts` (tiers alto/médio/baixo + `PerformanceMonitor`
  do drei ajustando em runtime).
- Céu em shader (`shaders/sky.{vert,frag}.glsl`, quad em tela cheia, gradiente
  + disco/glow do sol + estrelas procedurais + grão), lido por `scene/Sky.tsx`.
- Lenis + GSAP sincronizados exatamente como a seção 5 pede
  (`lib/lenis.ts`/`lib/gsap.ts`); pulado por completo (não instanciado) sob
  `prefers-reduced-motion: reduce`.
- Registro de atos (`lib/acts.ts`): `window.__ready`, `window.__acts`,
  `window.__lenis`, `?act=`, `?debug`, `?snap` (`lib/env.ts`).
- Curva provisória de `dayTime` cobrindo a rolagem inteira da página (um
  `ScrollTrigger` no `<body>`) — vai ser substituída pelas timelines por ato
  conforme cada fase constrói seu conteúdo real.
- As 9 seções (Ato 0 a Ato 8) existem com estrutura e copy reais (do brief),
  altura em vh conforme o mapa de scroll, `data-act`, mas **sem** a
  coreografia 3D/GSAP específica de cada ato — isso é o trabalho das Fases
  2–8. Header com âncoras, menu mobile e indicador de progresso fino.
- Fallback sem WebGL (`CanvasErrorBoundary` + `scene/Fallback.tsx`): gradiente
  CSS + diagrama SVG simples do fluxo de energia a partir de `product.ts`.
- `scripts/snap.mjs` funcionando (build → preview → Chromium com
  `--use-angle=swiftshader` → 2 viewports × 2 passadas incluindo
  reduced-motion → screenshots em `.snapshots/<fase>/`).

Decisões técnicas registradas (para não repetir o mesmo caminho):

- **`gsap/SplitText`, `gsap/DrawSVGPlugin` e `gsap/CustomEase` não são
  registrados no boot.** Só `gsap` core + `ScrollTrigger` carregam eager (são
  usados desde a Fase 1). Os outros três só entram quando algo realmente
  precisa deles — `lib/gsapText.ts` expõe `loadTextPlugins()` (import
  dinâmico, memoizado). Comece a usar isso a partir da Fase 2 (títulos com
  `SplitText`/`CustomEase`) e da Fase 3 (`DrawSVGPlugin` nos callouts).
- **`scene/state.ts` não pode importar `three`.** Isso já aconteceu uma vez:
  `cameraTarget` era um `THREE.Vector3`, e como `state.ts` é importado
  eager por `App.tsx` (fora do chunk 3D), isso inflou o bundle inicial de
  ~126 KB para ~223 KB gzip. Virou `{x,y,z}` simples; o código da cena
  (dentro do chunk 3D) que aplicar isso num `Vector3` seu. Qualquer campo
  novo em `sceneState` que "pareça" precisar de um tipo do three deve usar um
  tipo simples aqui, e converter para three só dentro de `scene/`.
- **Orçamento de JS medido nesta fase** (build de produção, gzip): chunk
  inicial (tudo antes do 3D) ≈ **126 KB** — dentro do teto de 150 KB da seção
  11. Chunk 3D (`SceneCanvas`, hoje só com o céu) ≈ **247 KB**, mais um chunk
  compartilhado de ~75 KB que só o gráfico 3D usa. Total sem o painel de
  debug (`leva`, que só carrega com `?debug`) ≈ **448 KB**, sob o teto de
  500 KB, mas com pouca folga (~52 KB) para o produto procedural completo, a
  vista explodida, o fluxo de energia e o pós-processamento das Fases 2–8.
  **Ponto de atenção para as próximas fases:** medir o bundle a cada fase
  (`npm run build`) e, se aproximar do teto, priorizar: (1) materiais/geometria
  simples antes de efeitos, (2) `@react-three/postprocessing` só no tier alto
  (já é a regra da seção 8), (3) considerar adiar `GodRays` se o orçamento
  apertar de verdade (o plano da Fase 0 já previa isso como risco com plano B).
- **Bug crítico encontrado e corrigido pelo `snap`:** o canvas 3D (`fixed`,
  `z-index: 0`) pintava por cima de todo o texto do DOM — as seções não têm
  `position`, e um elemento `position:fixed` com `z-index:0` pinta *depois*
  do conteúdo não-posicionado em qualquer navegador (regra de stacking do
  CSS), mesmo com `pointer-events: none` (que só afeta hit-test, não pintura).
  O hero inteiro ficava invisível. Corrigido dando `z-index: -1` ao
  `.scene-canvas-wrap` (`src/index.css`). **Lição para as próximas fases:**
  qualquer elemento novo que precise ficar acima do canvas (`Header`, modais,
  callouts em HTML) precisa de `position` + `z-index` positivo explícitos;
  não existe "z-index 0 basta" nesta página.
- **Segundo bug do `snap`:** `window.__acts["0"]` só aparecia na passada
  normal, sumia na passada `reducedMotion`. Causa: o marcador `data-act="0"`
  estava no próprio overlay do `Opening`, que desmonta depois de pronto — o
  `refresh` do `markReady()` recalculava os atos depois desse desmonte, e a
  ordem de effects do React fazia essa corrida se comportar diferente por
  acaso entre os dois modos. Corrigido movendo o marcador do Ato 0 para uma
  `div` permanente em `App.tsx` (fora do `Opening`), que nunca desmonta.
  **Lição:** marcador de `data-act` nunca deve viver num componente que se
  desmonta — sempre num elemento permanente da árvore.
- Trocado `@playwright/test` por `playwright` (pacote base) no
  `package.json`: o brief pede `playwright` na seção 4, e o script `snap` é
  um script Node solto, não uma suíte de testes.
- `npm install` emite avisos de peer-dependency por causa do `r3f-perf`
  (ele ainda depende de `@react-three/drei@9`/`@react-spring`, incompatível
  com React 19 na resolução de peers). É só o `r3f-perf`, que só entra sob
  `?debug`; não afeta o bundle de produção. Sem ação necessária por enquanto.

Pendências (não bloqueiam, mas precisam de você antes das fases indicadas):
- `PORTFOLIO_URL` (`src/config.ts`) — precisa da URL real antes da Fase 8.
- `WHATSAPP_URL` — opcional, antes da Fase 8.
- Medidas e peso do produto (`product.ts`) — quando você tiver os números do
  protótipo, preencha os campos marcados `// TODO: preencher`; o 3D se ajusta
  sozinho (usa `DEFAULT_PROPORTIONS` até lá).

Fechamento da Fase 1:
- `snap` rodou limpo (108 screenshots, 2 viewports × 2 passadas, sem erro de
  console) depois de dois bugs corrigidos (ver acima: z-index do canvas e o
  marcador do Ato 0). Revisado manualmente uma amostra dos atos — cores,
  contraste e conteúdo batem com o plano da Fase 0.
- `impeccable detect --json src`: **0 achados**. `PRODUCT.md` criado
  (`impeccable init`/`teach`) a partir do `BRIEF.md`, sem necessidade de
  entrevista (o brief já respondia tudo com evidência forte). `.impeccable/
  config.json` com `buildPath: "code"` (sem geração de imagem disponível
  nesta sessão, e o brief proíbe imagem externa de qualquer forma).
- **`/impeccable critique` e `/review-animations` (do Emil) só podem ser
  disparados por você** — o Skill tool recusa invocá-los internamente
  (`disable-model-invocation`). Não tentei contornar isso. Rode os dois
  quando quiser essa camada de revisão; nesta fase, o conteúdo é
  propositalmente placeholder/estrutural (nenhum ato tem a coreografia real
  ainda), então uma crítica completa de design provavelmente vai só apontar
  "isso ainda não foi desenhado" — provavelmente vale mais a pena a partir da
  Fase 2, quando o hero e o produto 3D existirem de verdade. Sua decisão.
- Commit inicial no git feito ao fim desta fase.
