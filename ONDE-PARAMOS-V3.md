# Onde paramos: SunTech v3

> **Para retomar, diga:** "Leia o ONDE-PARAMOS-V3.md e continue de onde paramos."

**Última atualização:** 12/10/2026, com a **Fase 3a** (`86bac4b`): auditoria do DOM, prévia de link, `DESIGN.md` refeito a partir do build e a **prévia da branch `v3` na Vercel**. Branch `v3`, também no GitHub (`origin/v3`). Os servidores estão parados.

## Em uma frase

A página tem a **cena do produto** (hero de 700vh no desktop, 490vh no celular: o carregador abre, desmonta, mostra os 4 componentes, remonta e carrega um celular), a ponte, as **6 partes das aulas** (cada uma num campo de tom sólido), o rodapé e o **modo pitch** de 180 s. O **modelo 3D definitivo está com o dono** (feito à mão no Blender); até ele chegar, o site usa o modelo gerado, provisório. Falta o que depende do modelo e a revisão do dono pela prévia.

## Commits da v3

| Commit | O quê |
|---|---|
| `629c084` | Fase 1: a cena do produto |
| `8343056` | Fase 1b: rolagem nos closes do celular, etiquetas, medidas fictícias, guia do modelo à mão |
| `e6f517b` | Fase 2: as 6 partes e o modo pitch em volta da cena |
| `6515182` | Pipeline do modelo feito à mão (`model:import`, `model:check`) e `?movimento=1` (10/10) |
| `86bac4b` | **Fase 3a** (12/10): ver abaixo |

(O `6515182` também tinha levado ao git as sobras da v2; o `86bac4b` as tirou.)

## A prévia na Vercel (para o dono revisar no celular)

- **URL fixa da branch:** https://suntech-git-v3-kaiquecalefi-8397s-projects.vercel.app (segue o último push da `v3`).
- Pede **login na Vercel** (Deployment Protection). Para abrir sem login, desligar a proteção de prévias no painel do projeto `suntech` (Settings → Deployment Protection) ou gerar um link de compartilhamento.
- A prévia tem `X-Robots-Tag: noindex` (não entra no Google). O `og:image` e o canônico apontam para o domínio de produção, que ainda é a v2: normal numa prévia.
- **Produção continua na `main` (v2), em suntech-ten.vercel.app**, intocada. A Vercel publica a produção a cada push na `main`: **não faça merge da `v3` na `main` sem o dono aprovar a v3 inteira.**
- FPS no celular real: abrir a prévia com `?debug` (README, "Como medir o FPS").

## Fase 3a (12/10/2026): o que foi feito

1. **Sobras da v2 fora do git** (`ONDE-PARAMOS.md`, `ONDE-PARAMOS-CODIGO.md`, `PROMPT-1-SUNTECH.md`): `git rm --cached` e `.gitignore`. Continuam no disco; **não leia**.
2. **Bug do trilho de fundo (P1):** no celular, a Parte 6 inteira ficava num cinza e o header virava uma faixa cinza com texto branco. A base de uma seção passava 1 px do topo da seguinte e a chave "fim da Parte 5 = Noite" era ordenada depois de "início da Parte 6 = Nuvem". `lib/tracks.ts` agora monta as chaves na ordem da página, sem voltar para trás.
3. **Tabela "O que fazemos de diferente?" no celular (P1):** a coluna SunTech ficava fora da tela. Abaixo de 40rem, empilha por critério, com o nome da coluna antes de cada resposta; papéis ARIA explícitos.
4. **`@theme static`** em `src/index.css`: as cores de energia das etiquetas só existiam no CSS porque o `ONDE-PARAMOS-CODIGO.md` citava os nomes (o Tailwind lê o projeto e respeita o `.gitignore`).
5. **SEO:** `public/og.png` com o hero da v3 (modelo provisório), `og:image:alt` novo; título e descrições conferidos.
6. **`DESIGN.md` e `.impeccable/design.json`** refeitos a partir do build (`/impeccable document`).
7. **Aceite:** `typecheck`, `lint`, `check:numbers`, `model:check` limpos; `snap v3-fase-3` tudo certo nas 8 passadas (JS inicial 137,0 KB, total 441,6 KB); `reverse` ok; `sweep` 3/3 no desktop e 3/3 no celular DPR 2; `axe` 0 violações; `tab-order` 21 paradas; `test:pitch` ok. Detalhes em `docs/v3-progresso.md`.

## O que falta, em ordem

1. **Revisão do dono pela prévia** (no celular e no notebook) e as perguntas abaixo.
2. **O modelo do dono** (`models-src/suntech.blend`, em andamento, **não commitado**; o `models-src/suntech.glb` ainda é o teste com cubos). Quando ele exportar: `npm run model:import` e "Depois de trocar" no `docs/v3-modelo-a-mao.md` (enquadramento com `framing.mjs --solve --apply`, `MOTION`, `reverse`, `sweep`, `snap`, `npm run build && npm run og`, `LICENSE.md` e o commit do `.blend` com o GLB).
3. **Polimento 3D, depois do modelo:** interior da caixa, aço do USB nos closes, preto da caixa sobre o Noite.
4. **FPS num celular real** pela prévia (`?debug`).
5. **Limpeza pequena:** comentários da v2 que falam do céu (`index.css`, perto das linhas 228, 279, 297, 322 e 454; docstring do `SuntechModel.tsx`), a classe `.type-display` sem uso e a Brasa no `@theme` sem uso.
6. **Merge na `main`** só com a aprovação do dono (isso publica a v3 em produção).

## Perguntas para o dono

1. Os tons das partes (Noite, Nuvem, Grafite, Grafite, Céu, Noite, Nuvem) e o header em faixa sólida nas partes estão bons?
2. O painel quase plano no desktop e em V no celular, e o cartão atrás do texto nos closes: seguem assim?
3. A tabela comparativa empilhada no celular ficou boa?
4. O modelo feito à mão mantém as medidas do molde (caixa 150 × 100 × 40 mm, placas 200 × 150 mm)? Se mudar, as câmeras e a explosão precisam ser refeitas.
5. Abrir a prévia sem login (desligar a proteção) ou manter com login?

## Primeiros passos ao retomar

```bash
git status                      # o .blend do dono aparece modificado: não commite sem ele pedir
npm run typecheck && npm run lint && npm run check:numbers
npm run model:check             # o GLB publicado contra o contrato
npm run build
node scripts/dev/reverse.mjs    # sobe o preview sozinho; tem de dar "ok: rolar para cima desfaz a animação"
```

## Onde está cada coisa

| Arquivo | O que é |
|---|---|
| `CLAUDE.md` | Regras (precedência: ele > `docs/v3-*.md` > `BRIEF.md` > `PROGRESS.md`) |
| `docs/v3-fase-0.md` | O plano aprovado (roteiro, riscos, fases). Os tempos da câmera mudaram na Fase 1 |
| `docs/v3-progresso.md` | **Decisões, resultados do aceite e o que ficou abaixo do esperado**, fase a fase |
| `DESIGN.md` + `.impeccable/design.json` | Arte da v3, documentada a partir do build em 12/10 |
| `docs/v3-modelo-a-mao.md` | **O contrato do GLB e o passo a passo no Blender** (para o dono) |
| `public/models/suntech.glb` (+ `LICENSE.md`) | O modelo publicado (hoje, o gerado: 1,13 MB). Sai do `npm run model:import` ou do `npm run model` |
| `models-src/` | O `.blend` do dono e o export cru `suntech.glb` (fora do git) |
| `scripts/model/` | Gerador do GLB, contrato (`lib/contract.mjs`), `check.mjs` e `import.mjs` |
| `src/scene/choreography.ts` | **O mapa de scroll como dados**: `BEATS`, `PART_TONE`, `flightOf`, `restOf`, tabelas `DESKTOP` e `NARROW`, `TRACKS` |
| `src/lib/tracks.ts` | Avalia os trilhos como função pura de `scrollY` |
| `src/scene/model/` | `SuntechModel.tsx`, `motion.ts`, `PhoneCable.tsx`, `LabelProjector.tsx` |
| `src/sections/` | DOM: `ProductScene.tsx`, as partes, `PartLabels.tsx`, `Header.tsx`, `PitchHud.tsx` |
| `scripts/dev/` | `sweep`, `reverse`, `framing`, `shots`, `probe`, `axe`, `tab-order`... (lista no `CLAUDE.md`) |

## Comandos

| Comando | Para quê |
|---|---|
| `npm run dev` / `npm run build` / `npm run preview` | Desenvolvimento, build e preview (porta 4173) |
| `npm run typecheck`, `npm run lint`, `npm run check:numbers` | Os três que têm de ficar limpos |
| `npm run snap <nome>` | Build, orçamento de JS e fotos em 8 passadas, com contraste AA nos pixels (uns 15 min) |
| `npm run model:import [-- arquivo.glb]` / `npm run model:check` | Publica o modelo feito à mão / confere o contrato |
| `npm run og` | Refaz `public/og.png` (rode o build antes) |
| `npm run test:pitch` | O modo pitch com relógio falso (usa o `dist/`) |
| `node scripts/dev/sweep.mjs [--size=390x844] [--dpr=2]` | Tempo de quadro (p95 ≤ 18, p99 ≤ 25 ms). Sobe o preview sozinho |
| `node scripts/dev/reverse.mjs [--size=390x844]` | Vai, volta e pula pelo pin (diferença 0) |
| `node scripts/dev/axe.mjs [390x844] [--reduced]`, `tab-order.mjs` | Acessibilidade (preview no ar) |

O `sweep`, o `reverse` e o `snap` sobem o preview na 4173 com `--strictPort`: **a porta tem de estar livre**. No Windows: `netstat -ano | grep :4173`, depois `taskkill //PID <pid> //F //T`.

## Armadilhas (o que me custou tempo)

- **Tailwind v4 e o `.gitignore`:** o Tailwind só emite as variáveis do `@theme` que encontra nos arquivos do projeto, e não lê o que está no `.gitignore`. Variável montada por nome no código (`var(--color-${x})`) precisa do `@theme static` (já está). Tirar um arquivo do git pode mudar o CSS.
- **Seções vizinhas se sobrepõem em 1 px** (`lib/sections.ts` arredonda o topo e soma a altura). O `lib/tracks.ts` já trata; se mexer nele, rode o `reverse` e olhe o header subindo dentro de uma parte no celular (o `snap` desce com o header escondido e não pega).
- **Tempo de quadro logo depois do `snap`:** as rodadas do `sweep` reprovam com dezenas de quadros de 33 ms e o mesmo build passa minutos depois. Compare com 3 rodadas, de preferência com a máquina parada, e com o commit anterior (`git stash push -- src`) antes de concluir que é regressão.
- **Elemento que muda a cada quadro precisa de camada própria** (`will-change`), senão repinta a camada da página.
- **Regra fora de `@layer` vence regra em camada**, qualquer que seja a ordem (`body::before` do grão).
- **Malha no próprio nó da peça + meshopt = pivô errado.** Peça = Empty no pivô, malha filha (o `model:check` acusa).
- **Unit Scale do Blender diferente de 1 deixa o modelo 10× maior.** Régua em cm, Unit Scale 1.
- **Só `meshopt` num export do Blender estoura o teto**: use o `model:import`.
- **O Cylinder do Blender tem o V da lateral de 0,5 a 1** (capa das células): o guia ensina o ajuste.
- **Não use `timeline.render(y, false, true)` do GSAP para os trilhos**: os trilhos são uma função pura de `scrollY`.
- **Nada de `box-shadow` com desfoque em elemento que aparece no meio do scroll** (compila shader: 33 a 50 ms de travada).
- **Material novo ou programa novo depois do `Warmup` trava o scroll**; materiais com fade nascem `transparent: true`.
- **O tier de qualidade só sobe com o scroll parado**; `?tier=` o fixa.
- **Euler do GLB:** use `rotation.set(...)` ou quaternion, nunca um eixo só.
- O `useGLTF` do drei busca o decoder Draco no gstatic: o GLB usa **meshopt** e o app chama `useGLTF(url, false)`.
- As tabelas `DESKTOP`/`NARROW` são resolvidas pelo `framing.mjs --solve --apply`, não à mão.
- `?snap` triplica a velocidade das animações por tempo e fixa o DPR em 1.
- No Windows: sem `pkill` nem Python; `sleep` longo em primeiro plano é bloqueado (use um `until` em segundo plano); rode os scripts a partir da **raiz**.

## Git

Branch `v3` (com `origin/v3`). Ao commitar, adicione por nome ou por pasta, nunca com `git add -A`. **O `models-src/suntech.blend` é trabalho em andamento do dono: só entra no commit quando ele pedir**, junto com o `public/models/suntech.glb` importado. (`.snapshots/`, `dist/`, `scripts/model/.cache/`, `models-src/*.glb`, `*.blend1` e as sobras da v2 estão no `.gitignore`. Se o `.blend` passar de 50 MB, use Git LFS ou deixe-o fora. `.snapshots/_claude/` são rascunhos do Claude: pode apagar.)
