# Onde paramos: SunTech v3

> **Para retomar, diga:** "Leia o ONDE-PARAMOS-V3.md e continue de onde paramos."

**Última atualização:** 06/10/2026, com a **Fase 1 da v3 fechada** (só a cena do produto, isolada). Branch `v3` (criada da `v2`). **Nada foi commitado ainda** (veja "Git" no fim). Os servidores estão parados (dev na porta 5180, preview na 4173).

## Em uma frase

A página tem só a **cena do produto** (hero de 700vh no desktop, 490vh no celular), a ponte e o rodapé: o carregador grande no centro da tela, que **abre, desmonta em cascata, dá foco em cada componente (painel, carga, células, saída), remonta e carrega um celular**, com um fundo de cor por beat e uma palavra gigante atrás. As 6 partes das aulas e o modo pitch **ainda não estão montados** (Fase 2); os componentes continuam em `src/sections`.

## O que o dono decidiu (06/10/2026)

1. Não existia GLB: eu crio o modelo, reaproveitando partes abertas se servirem. (Consultei Poly Pizza, OpenGameArt e Poly Haven e **não importei nada**: o GLB é 100% gerado por código; `public/models/LICENSE.md`.)
2. As 6 partes e o modo pitch continuam obrigatórios.
3. A cena fica **no topo, como hero** (opção A); a posição foi decisão minha, autorizada.
4. `pcb` virou `pcb_charge` e `pcb_boost` (o roteiro tem 4 componentes).
5. Critérios 1 e 4 reescritos (já no `CLAUDE.md`): altura 55–70% **e** largura ≤ 66% no desktop; celular, largura ≤ 88% e altura 45–55% quando a proporção deixa; tempo de quadro p95 ≤ 18 ms e p99 ≤ 25 ms numa varredura de scroll.
6. Pediu: ao fechar a fase, **parar o projeto e escrever este arquivo**.

## Primeiros passos ao retomar

```bash
git status                      # confira: tudo da Fase 1 está sem commit
npm run typecheck && npm run lint && npm run check:numbers
npm run build
node scripts/dev/reverse.mjs    # sobe o preview sozinho; tem de dar "ok: rolar para cima desfaz a animação"
```

Depois, **olhe as fotos** em `.snapshots/v3-fase-1/` (se a pasta sumiu: `npm run snap v3-fase-1`, uns 15 minutos; `1440x900-produto-<beat>.png` e `390x844-produto-<beat>.png` são as principais) e decida com o dono o que mudar antes da Fase 2. Resultados e o que ficou abaixo do esperado: `docs/v3-progresso.md`.

## Onde está cada coisa

| Arquivo | O que é |
|---|---|
| `CLAUDE.md` | Regras (precedência: ele > `docs/v3-*.md` > `BRIEF.md` > `PROGRESS.md`). Já atualizado com a Fase 1 |
| `docs/v3-fase-0.md` | O plano aprovado (roteiro, riscos, fases). Os **tempos da câmera mudaram** na Fase 1 (ver `docs/v3-progresso.md`) |
| `docs/v3-progresso.md` | **Decisões, resultados dos comandos do aceite e o que ficou abaixo do esperado** |
| `DESIGN.md` | Arte da v3 (tons, palavra gigante, regra do tom) |
| `public/models/suntech.glb` (+ `LICENSE.md`) | O modelo (1,13 MB, meshopt). Gerado, não editar à mão |
| `scripts/model/` | O gerador do GLB (`parts/*.mjs`, `lib/*.mjs`, `dims.mjs`); dependências próprias, fora do `package.json` do app |
| `src/scene/choreography.ts` | **O mapa de scroll como dados**: `BEATS`, `flightOf`, `restOf`, tabelas de câmera `DESKTOP` e `NARROW`, `TRACKS` |
| `src/lib/tracks.ts` | Avalia os trilhos como função pura de `scrollY` (não é mais uma timeline do GSAP) |
| `src/scene/model/` | `SuntechModel.tsx` (lê o GLB e o `sceneState`), `motion.ts` (cascata da explosão e `SUBJECT` de cada beat), `PhoneCable.tsx`, materiais com shader |
| `src/scene/` | `Experience.tsx` (Warmup), `Lights.tsx`, `StudioEnvironment.tsx`, `ContactShadow.tsx`, `Effects.tsx`, `CameraRig.tsx`, `quality.ts` (tiers), `state.ts` |
| `src/sections/ProductScene.tsx` + `src/index.css` | O DOM da cena: texto por beat (`.beat`, `.beat__body`), palavra gigante, ponte, reduced motion e `?nowebgl` |
| `src/lib/` | `stage.ts` (pin só do texto), `tone.ts` (`--bg` e `data-tone`), `opening.ts`, `sections.ts`, `lenis.ts`, `pitch.ts` (**ainda aponta para seções que não existem**) |
| `scripts/dev/` | `sweep.mjs`, `reverse.mjs`, `framing.mjs`, `shots.mjs` (novos), mais os da v2 (`probe`, `axe`, `tab-order`...) |

## Comandos

| Comando | Para quê |
|---|---|
| `npm run dev` / `npm run build` / `npm run preview` | Desenvolvimento, build (typecheck + Vite) e preview (porta 4173) |
| `npm run typecheck`, `npm run lint`, `npm run check:numbers` | Os três que têm de ficar limpos |
| `npm run snap <nome>` | Build, orçamento de JS e fotos em 8 passadas, com contraste AA medido nos pixels (`.snapshots/<nome>/`). `-- --no-build`, `-- --quick`, `-- --only=390x844` aceleram |
| `npm run model:install` (uma vez), `npm run model`, `npm run model:view` | Gera o GLB; folhas de contato do modelo |
| `node scripts/dev/sweep.mjs [--size=1440x900] [--dpr=2] [--css="..."]` | Tempo de quadro numa varredura do pin (meta: p95 ≤ 18, p99 ≤ 25 ms). Sobe o preview sozinho |
| `node scripts/dev/reverse.mjs [--size=390x844]` | Vai, volta e pula pelo pin e compara todo o estado (tem de dar diferença 0) |
| `node scripts/dev/framing.mjs [--size=390x844] [--at=0,0.25,0.5,0.75,1] [--solve --apply --beats=painel]` | Mede (e resolve) o enquadramento do sujeito de cada beat. **Precisa do preview no ar** |
| `node scripts/dev/shots.mjs --at=produto:0.15,0.5 [--montage=grade.png]` | Fotos de pontos do pin (preview no ar) |
| `node scripts/dev/axe.mjs [1440x900] [--reduced]`, `tab-order.mjs` | Acessibilidade (preview no ar) |

Flags de URL: `?snap` (expõe `__ready`, `__sections`, `__lenis`, `__scene`, `__three`, `__model`), `?tier=alto|medio|baixo`, `?dpr=2`, `?nowebgl`, `?goto=<id>`, `?slowmo=N`, `?debug`.

O `sweep`, o `reverse` e o `snap` sobem o preview na 4173 com `--strictPort`: **a porta tem de estar livre**. No Windows não há `pkill`: `netstat -ano | grep :4173`, depois `taskkill //PID <pid> //F //T`.

## Números da Fase 1 (resumo; tabela completa em `docs/v3-progresso.md`)

JS gzip inicial 129,6 KB (teto 150), total 424,8 KB (teto 500); GLB 1,13 MB (teto 1,5). `snap` final: tudo certo (0 erros de console, 0 reprovações de contraste, CLS 0). `sweep`: máx 16,8 ms em 1440×900 (DPR 1 e 2), 1920×1080 e 390×844 (DPR 2). `reverse`: diferença 0. Enquadramento: desktop 61–62% de altura nos 9 beats e em 0/25/50/75/100% do pin. `axe`: 0 violações.

## O que ficou abaixo do esperado

1. **Celular:** a altura do sujeito fica em 27–50% (a largura manda, 88%). A Fase 0 pedia testar **girar 90° as peças em foco** (rolagem da câmera) no celular; **não testei**. É o primeiro candidato de melhoria visual no celular.
2. **Sem etiquetas ligadas às peças** (as âncoras `label_*` existem no GLB; nada as projeta).
3. **As 6 partes e o pitch não estão na página.** Os links "1 Problema" a "6 Jovem" do cabeçalho não levam a lugar nenhum por enquanto, e o texto da ponte encosta na borda do painel.
4. **Medidas reais do produto** (`// TODO: preencher` em `product.ts`) seguem pendentes; o modelo usa as proporções padrão.
5. **FPS só medido num PC** (GTX 1060). Falta testar num celular real (README, "Como medir o FPS").
6. **Polimento visual:** interior da caixa vazio (sem fios, sem oclusão ambiente por peça); aço do USB brilhando demais nos closes; preto fosco da caixa some em parte sobre o fundo Noite; o pano de fundo do texto nos closes é um cartão arredondado (escolha visual a rever com o dono).
7. **Fase 3 intocada:** `public/og.png` e `og:image:alt` mostram o hero da v2; `.impeccable/design.json` é da v2.

## Próximos passos, em ordem

1. **Revisão do dono** das fotos da Fase 1 (e, se ele quiser, os itens 1, 2 e 6 acima antes de seguir). Depois, o commit da Fase 1.
2. **Fase 2: reintegrar as 6 partes e o modo pitch em volta da cena.** O que sei que precisa de decisão ou trabalho:
   - Os componentes estão em `src/sections` (`Problem`, `Client`, `Solution`, `Company`, `Differential`, `Youth`, `ChapterOpener`, `Fact`, `Highlight`, `Pitch`, `PitchHud`); monte-os em `App.tsx` depois da ponte, na ordem das aulas.
   - `choreography.ts` só conhece as seções `produto` e `ponte`: **cada parte precisa do tom de fundo e de texto** (trilhos `bg.r/g/b` e `tone`, ou CSS fixo por seção). A cena termina em Noite, então a Parte 1 continua no escuro (opção A; `PRODUCT.md`, princípio 3: "o problema acontece no escuro").
   - `lib/pitch.ts` e `pitchStops` (`src/content/feira.ts`) apontam para ids de seção da v2: remapeie os alvos (a cena do produto agora é uma seção só, `produto`, com `positionOf("produto", fração)`). Rode `npm run test:pitch` (usa o `dist/`).
   - Header: os links 1–6 voltam a funcionar quando as seções existirem; a troca de tom do header (`data-crossing`) precisa conferir com os novos tons.
   - `?nowebgl`: refazer o diagrama do fallback (`EnergyDiagram`) se o beat "Dentro" mudar.
   - Código morto do céu: já apaguei os arquivos; confira `PROGRESS.md`/`BRIEF.md` só como história.
3. **Fase 3:** polimento (itens 1, 2, 6 e 7 acima), performance em celular real, SEO (`og.png`, `og:image:alt`), `/impeccable document` (refaz o `.impeccable/design.json`), e **deploy** na Vercel. Cuidado: a Vercel publica a `main` a cada push, e a `main`/`v2` é a versão aprovada no ar (suntech-ten.vercel.app): **não faça merge da `v3` na `main` antes de o dono aprovar a v3 inteira**.

## Armadilhas (o que me custou tempo)

- **Não use `timeline.render(y, false, true)` do GSAP para os trilhos.** Depois de saltos de vários beats, trilhos ficavam presos no valor do salto anterior (fundo errado, foco errado). Os trilhos são uma função pura de `scrollY` (`lib/tracks.ts`); o `reverse.mjs` pega a regressão.
- O `pin.start` do ScrollTrigger pode vir `−0,001`: já é clampado em `rangeOf` (um tempo negativo prendia `product.ry` e `tilt` na primeira descida).
- **Nada de `box-shadow` com desfoque em elemento que aparece no meio do scroll:** a primeira pintura compila um shader (33 a 50 ms de travada). O pano de fundo do texto usa fundo chapado por isso.
- **Material novo ou programa novo depois do `Warmup` trava o scroll** (150 a 350 ms). O `Warmup` roda a cena de verdade pelo composer, com o celular e o cabo ligados; materiais com fade nascem `transparent: true`.
- **O tier de qualidade só sobe com o scroll parado** (`quality.ts`): subir refaz o composer. `?tier=` o fixa (o `snap` usa).
- **Euler do GLB:** nós com rotação embutida (`panel_b`, 180° em Y) decompõem em x/z diferentes de zero; use `rotation.set(...)` ou quaternion, nunca atribua um eixo só.
- O `useGLTF` do drei busca o decoder Draco no gstatic (CDN, proibido): o GLB usa **meshopt** e o app chama `useGLTF(url, false)`.
- As tabelas `DESKTOP`/`NARROW` são **resolvidas pelo `framing.mjs --solve --apply`**, não editadas à mão; depois de mexer em geometria, câmera, `SUBJECT` ou `panelOpen`, rode de novo (desktop e `--size=390x844`) e atualize o `span` do beat com a coluna `l` (largura do sujeito).
- `?snap` triplica a velocidade das animações por tempo do GSAP e fixa o DPR em 1 (`?dpr=2` muda).
- No Windows: sem `pkill`; `sleep` longo em primeiro plano é bloqueado na ferramenta (use um `until` em segundo plano); rode os scripts a partir da **raiz** do projeto.
- `ONDE-PARAMOS.md`, `ONDE-PARAMOS-CODIGO.md` e `PROMPT-1-SUNTECH.md` são sobras da v2 (sem commit): **não leia**, e não os inclua no commit.

## Git

Branch `v3`, **tudo da Fase 1 sem commit** (modificados, apagados e novos). Para commitar sem as sobras da v2:

```bash
git add .gitignore CLAUDE.md DESIGN.md PROGRESS.md PROMPT-V3.md README.md ONDE-PARAMOS-V3.md package.json \
        docs scripts src public/models
git status                      # confira: nenhum ONDE-PARAMOS.md / ONDE-PARAMOS-CODIGO.md / PROMPT-1-SUNTECH.md
git commit -m "Fase 1 (v3): a cena do produto"
```

(`.snapshots/`, `dist/` e `scripts/model/node_modules` já estão no `.gitignore`; `public/models/suntech.glb` **entra** no commit.)

## Perguntas para o dono

1. As fotos da Fase 1 estão aprovadas? Em especial: o desktop abre o painel quase plano (as duas placas inteiras no quadro), e o celular o abre em V; o cartão de texto nos closes; o aço dos USB.
2. Quer que eu teste girar 90° as peças em foco no celular (mais altura no celular, produto "deitado" na tela)?
3. Quer etiquetas ligadas às peças (linha da peça ao texto) ou o texto na lateral basta?
4. As medidas e o peso reais do produto saem quando? (`product.ts`)
