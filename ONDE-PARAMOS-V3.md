# Onde paramos: SunTech v3

> **Para retomar, diga:** "Leia o ONDE-PARAMOS-V3.md e continue de onde paramos."

**Última atualização:** 09/10/2026, com a **preparação para o modelo feito à mão** (sem commit; ver a seção de 09/10 abaixo). Antes: 07/10/2026, **Fase 2 fechada** (`e6f517b`, "Fase 2 (v3)"); Fase 1 (`629c084`, a cena do produto) e Fase 1b (`8343056`: rolagem nos closes do celular, etiquetas, medidas fictícias, guia do modelo à mão). Branch `v3`. Os servidores estão parados.

## Em uma frase

A página tem a **cena do produto** (hero de 700vh no desktop, 490vh no celular; o carregador abre, desmonta, mostra os 4 componentes, remonta e carrega um celular), a ponte, as **6 partes das aulas** (cada uma num campo de tom sólido) e o rodapé, com o **modo pitch** de 180 s. Falta a **Fase 3** (polimento, celular real, SEO e deploy) e o **modelo 3D feito à mão** pelo dono.

## O que o dono decidiu (06/10/2026)

1. Não existia GLB: eu crio o modelo, reaproveitando partes abertas se servirem. (Consultei Poly Pizza, OpenGameArt e Poly Haven e **não importei nada**: o GLB é 100% gerado por código; `public/models/LICENSE.md`.)
2. As 6 partes e o modo pitch continuam obrigatórios.
3. A cena fica **no topo, como hero** (opção A); a posição foi decisão minha, autorizada.
4. `pcb` virou `pcb_charge` e `pcb_boost` (o roteiro tem 4 componentes).
5. Critérios 1 e 4 reescritos (já no `CLAUDE.md`): altura 55–70% **e** largura ≤ 66% no desktop; celular, largura ≤ 88% e altura 45–55% quando a proporção deixa; tempo de quadro p95 ≤ 18 ms e p99 ≤ 25 ms numa varredura de scroll.
6. Pediu: ao fechar a fase, **parar o projeto e escrever este arquivo**.

## Fase 2 (07/10/2026): checklist, concluído

O dono pediu para seguir a Fase 2 até os créditos dele chegarem em 27% e salvar até onde foi. Todos os itens foram concluídos na mesma sessão.

- [x] 1. As 6 partes montadas em `App.tsx` depois da cena, na ordem das aulas (Problema, Cliente, Solução, Diferencial, Empresa, Pitch, Jovem) + `PitchHud`.
- [x] 2. Tom de cada parte: `PART_TONE` em `choreography.ts` (Noite, Nuvem, Grafite, Grafite, Céu, Noite, Nuvem). Cada parte pinta o próprio campo (`data-field` + CSS `[data-field]`, que redefine `--bg`/`--fg`); os trilhos `bg.*` e `tone` seguem a parte sob o header (degrau na divisa). A textura de grão (`body::before`) fica coberta pelos campos: decidir se volta.
- [x] 3. Modo pitch remapeado: "Por dentro" e "Como funciona" apontam para `produto` (frações 0,08–0,38 e 0,38–0,8). `npm run test:pitch`: tudo certo.
- [x] 4. Header: os 6 links levam ao início exato de cada parte, com `aria-current`, foco no título e o tom certo (conferido com Playwright, 0 erros). Nas partes o header vira uma faixa sólida em `--bg` (`data-solid`), então a divisa passa por baixo dele.
- [x] 5. `?nowebgl` e reduced motion com as partes: `npm run snap v3-fase-2` **tudo certo** nas 8 passadas (9 seções, 0 erros, 0 contraste, CLS 0; JS inicial 136,5 KB, total 441,0 KB). `reverse.mjs`: ok no desktop e no celular. `test:pitch`: ok.
- [x] 5b. **Tempo de quadro:** com as partes na página o pin tinha picos de 33–50 ms. Causa: o texto dos beats e a palavra gigante mudam a cada quadro sem camada própria e repintavam a camada da página, que agora inclui o conteúdo das partes logo abaixo. Correção: `will-change: transform, opacity` em `.beat` e `.beat-word`. Medido com 3 rodadas por configuração (a máquina estava ruidosa): atual reprovava 2 de 3; com a correção, 3 de 3 passam (e mais 2 + 2 depois de aplicada, desktop e celular DPR 2).
- [x] 6. Ponte: depois do pin, a imagem da cena sobe junto com a página (`lift`, 0 → 1 tela, linear e sem `damp`, somado ao `sy` no `CameraRig`) e o produto some fora da tela; o texto da ponte não passa mais por cima dele, e o campo da Parte 1 não o corta. O grão da página é repetido dentro dos campos (`[data-field]::before`), senão o Noite da Parte 1 ficava mais escuro que o da ponte (emenda).
- [x] 7. Aceite: `typecheck`, `lint` e `check:numbers` limpos; `snap v3-fase-2` tudo certo (refeito depois do `will-change`); `reverse.mjs` ok (desktop e celular); `sweep.mjs` ok; `axe` 0 violações (3 modos); `tab-order` 21 paradas com contorno; `test:pitch` ok. Registrado em `docs/v3-progresso.md`. Commit "Fase 2 (v3)".

## O que o dono decidiu (07/10/2026)

1. **O modelo gerado foi reprovado** ("muito simples"). Ele vai **modelar à mão** e entregar mais para a frente. O contrato do GLB está em **`docs/v3-modelo-a-mao.md`**. Até lá, o gerado fica como provisório. Não gaste tempo melhorando o `scripts/model/`.
2. Girar 90° os closes no celular: sim (feito: Guardar e Entregar).
3. Etiquetas ligadas às peças: sim (feito).
4. Medidas e peso: **fictícios**, marcados como "ilustrativo" (feito).

## 09/10/2026: preparação para o modelo feito à mão (sem commit)

O dono vai modelar o carregador no Blender e importar o GLB. Revisei o caminho do Blender até o site, com o Blender 5.2 e o site rodando, e corrigi o que quebraria:

1. **Guia corrigido e virou passo a passo** (`docs/v3-modelo-a-mao.md`). O guia permitia "a malha ser o próprio nó" da peça. Com o comando de compressão que ele mesmo indicava, a tampa abria **8 cm fora da dobradiça** e a placa B ficava **20 cm fora** (a quantização do meshopt move o pivô de nó com malha). Regra nova: Empty no pivô e malha filha, como o gerador já fazia. O guia também ensina a importar o molde (`scripts/model/.cache/suntech.raw.glb`) no Blender, a régua em cm (o número em cm no Blender é o número em mm do produto), o export e o UV de cada material desenhado pelo site.
2. **`npm run model:import`** (`scripts/model/import.mjs`): confere o contrato no export do Blender, comprime como o gerador (solda, dedup sem fundir materiais, meshopt `medium`; acima de 1,5 MB, tenta `high`), confere de novo e só então grava `public/models/suntech.glb`, marcado como feito à mão (`extras.suntech.source = "blender"` no JSON do GLB). O comando do guia antigo (só `meshopt`) dava **2,3 MB** com a mesma geometria; o `model:import`, **1,4 MB**.
3. **`npm run model:check`** (`scripts/model/check.mjs` + `lib/contract.mjs`): o contrato como código. Acusa nome faltando ou com `.001`, pai errado, malha no nó da peça, tampa ou placa B fora da rotação de repouso, escala errada (o Unit Scale ≠ 1 do Blender dá 10×), Draco/KTX2, material desenhado pelo site sem UV ou com o UV cortado, objetos fora da raiz, referências exportadas junto e GLB acima do teto. Testado com 8 arquivos feitos para quebrar (7 exports do Blender 5.2 e um com Draco): pega todos.
4. **`npm run model` não sobrescreve mais o modelo feito à mão** (`--force` volta ao gerado); `npm run model:reference` regrava só o molde.
5. **Texturas do GLB no runtime** (`SuntechModel.tsx`, `makeMaterial`): antes só cor, rugosidade, metal e emissão passavam, e qualquer textura feita no Blender sumia sem aviso. Agora passam a imagem de cor, a normal, a rugosidade/metal, a AO, a emissiva e o verniz (*Coat*); os ajustes por nome continuam vencendo, menos a cor quando o material tem textura (senão tingiria a textura). Com o GLB gerado, as fotos são **idênticas pixel a pixel** às de antes (0 de 1.024.000 pixels diferentes em 3 pontos do pin).
6. **Scroll: revisado e mantido.** Lenis + `scrub: true` + trilhos como função pura de `scrollY` + `damp` curto só na câmera é a arquitetura certa; o `sweep` e o `reverse` já passavam. Mexer sem medir numa GPU de verdade seria piorar. O que falta é medir num celular real (Fase 3).
7. `CLAUDE.md` (Ativos 3D e Comandos), `README.md`, `public/models/LICENSE.md` e `.gitignore` (`models-src/*.glb`, `*.blend1`) atualizados; pasta `models-src/` criada para o `.blend` do dono.

Aceite: `typecheck`, `lint` e `check:numbers` limpos; build ok; `model:check` ok no GLB publicado e no molde. Ponta a ponta: molde importado no Blender 5.2, malha da tampa e da placa B trocadas, export, `model:import` e o site (preview, Chromium) com a tampa, o painel, a explosão e o cabo certos; pivôs iguais ao molde (diferença 7e-8).

## Primeiros passos ao retomar

```bash
git status                      # a preparação de 09/10 está sem commit (lista na seção de 09/10)
npm run typecheck && npm run lint && npm run check:numbers
npm run model:check             # o GLB publicado contra o contrato
npm run build
node scripts/dev/reverse.mjs    # sobe o preview sozinho; tem de dar "ok: rolar para cima desfaz a animação"
```

Se o dono já entregou o modelo: `npm run model:import` e siga "Depois de trocar" no `docs/v3-modelo-a-mao.md`. Resultados e o que ficou abaixo do esperado: `docs/v3-progresso.md`.

## Onde está cada coisa

| Arquivo | O que é |
|---|---|
| `CLAUDE.md` | Regras (precedência: ele > `docs/v3-*.md` > `BRIEF.md` > `PROGRESS.md`). Já atualizado com a Fase 1 |
| `docs/v3-fase-0.md` | O plano aprovado (roteiro, riscos, fases). Os **tempos da câmera mudaram** na Fase 1 (ver `docs/v3-progresso.md`) |
| `docs/v3-progresso.md` | **Decisões, resultados dos comandos do aceite e o que ficou abaixo do esperado** |
| `DESIGN.md` | Arte da v3 (tons, palavra gigante, regra do tom) |
| `public/models/suntech.glb` (+ `LICENSE.md`) | O modelo publicado (hoje, o gerado: 1,13 MB, meshopt). Não editar à mão: sai do `npm run model:import` (feito à mão) ou do `npm run model` (gerado) |
| `docs/v3-modelo-a-mao.md` | **O contrato do GLB e o passo a passo no Blender** (para o dono) |
| `models-src/` | O `.blend` do dono (entra no commit) e o export cru `suntech.glb` (fora do git) |
| `scripts/model/` | O gerador do GLB (`parts/*.mjs`, `lib/*.mjs`, `dims.mjs`), o contrato (`lib/contract.mjs`), `check.mjs` e `import.mjs`; dependências próprias, fora do `package.json` do app |
| `src/scene/choreography.ts` | **O mapa de scroll como dados**: `BEATS`, `flightOf`, `restOf`, tabelas de câmera `DESKTOP` e `NARROW`, `TRACKS` |
| `src/lib/tracks.ts` | Avalia os trilhos como função pura de `scrollY` (não é mais uma timeline do GSAP) |
| `src/scene/model/` | `SuntechModel.tsx` (lê o GLB e o `sceneState`), `motion.ts` (cascata da explosão e `SUBJECT` de cada beat), `PhoneCable.tsx`, materiais com shader |
| `src/scene/` | `Experience.tsx` (Warmup), `Lights.tsx`, `StudioEnvironment.tsx`, `ContactShadow.tsx`, `Effects.tsx`, `CameraRig.tsx`, `quality.ts` (tiers), `state.ts` |
| `src/sections/ProductScene.tsx` + `src/index.css` | O DOM da cena: texto por beat (`.beat`, `.beat__body`), palavra gigante, ponte, reduced motion e `?nowebgl` |
| `src/lib/` | `stage.ts` (pin só do texto), `tone.ts` (`--bg` e `data-tone`), `opening.ts`, `sections.ts`, `lenis.ts`, `pitch.ts` (remapeado na Fase 2) |
| `scripts/dev/` | `sweep.mjs`, `reverse.mjs`, `framing.mjs`, `shots.mjs` (novos), mais os da v2 (`probe`, `axe`, `tab-order`...) |

## Comandos

| Comando | Para quê |
|---|---|
| `npm run dev` / `npm run build` / `npm run preview` | Desenvolvimento, build (typecheck + Vite) e preview (porta 4173) |
| `npm run typecheck`, `npm run lint`, `npm run check:numbers` | Os três que têm de ficar limpos |
| `npm run snap <nome>` | Build, orçamento de JS e fotos em 8 passadas, com contraste AA medido nos pixels (`.snapshots/<nome>/`). `-- --no-build`, `-- --quick`, `-- --only=390x844` aceleram |
| `npm run model:install` (uma vez), `npm run model`, `npm run model:view` | Gera o GLB (recusa sobrescrever o feito à mão); folhas de contato do modelo |
| `npm run model:import [-- arquivo.glb]` | Publica o modelo feito à mão (padrão `models-src/suntech.glb`): confere, comprime e grava |
| `npm run model:check [-- arquivo.glb]` | Confere um GLB contra o contrato (padrão: o publicado) |
| `npm run model:reference` | Regrava só o molde do Blender (`scripts/model/.cache/suntech.raw.glb`) |
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

1. **O modelo 3D** (reprovado; o dono modela à mão, ver `docs/v3-modelo-a-mao.md`).
2. **Celular:** com a rolagem, Guardar e Entregar foram para 50% de altura; Fechado (38%), Proteger (40%), Remonta (38%) e Energia (32%) seguem limitados pela largura (dentro do critério).
3. **Textura de grão:** é repetida dentro de cada campo (`[data-field]::before`); o tile não se alinha com o da página na divisa da ponte, mas no mesmo tom a emenda não aparece.
4. **Medidas e peso são fictícios** (autorizado), com o rótulo "ilustrativo" na ficha técnica; trocar pelos reais quando existirem.
5. **FPS só medido num PC** (GTX 1060). Falta testar num celular real (README, "Como medir o FPS").
6. **Polimento visual:** interior da caixa vazio (sem fios, sem oclusão ambiente por peça); aço do USB brilhando demais nos closes; preto fosco da caixa some em parte sobre o fundo Noite; o pano de fundo do texto nos closes é um cartão arredondado (escolha visual a rever com o dono).
7. **Fase 3 intocada:** `public/og.png` e `og:image:alt` mostram o hero da v2; `.impeccable/design.json` é da v2.

## Próximos passos, em ordem

1. **Revisão do dono** das partes (fotos em `.snapshots/v3-fase-2/`: `1440x900-<parte>-start|mid|end.png` e `390x844-...`), dos tons por parte e da saída do produto pela ponte; e da preparação de 09/10 (commit "Preparação do modelo feito à mão", por nome: `docs scripts/model src/scene/model package.json CLAUDE.md ONDE-PARAMOS-V3.md README.md public/models/LICENSE.md .gitignore models-src/LEIA.md`).
2. **O dono modela no Blender** seguindo o passo a passo do `docs/v3-modelo-a-mao.md` e roda `npm run model:import`.
3. **Depois de trocar** (`docs/v3-modelo-a-mao.md`): `framing.mjs --solve --apply` no desktop e no celular, `MOTION` se o tamanho mudou, `reverse`, `sweep`, `snap`, `LICENSE.md` e o commit do `.blend` com o GLB.
4. **Fase 3:** polimento (itens 6 e 7 acima), performance em celular real, SEO (`og.png`, `og:image:alt`), `/impeccable document` (refaz o `.impeccable/design.json`), e **deploy** na Vercel. Cuidado: a Vercel publica a `main` a cada push, e a `main`/`v2` é a versão aprovada no ar (suntech-ten.vercel.app): **não faça merge da `v3` na `main` antes de o dono aprovar a v3 inteira**.

## Armadilhas (o que me custou tempo)

- **Tempo de quadro com a máquina ruidosa:** uma rodada do `sweep.mjs` não decide nada (a mesma configuração deu 0 e 8 picos). Compare com 3 rodadas por configuração e isole com `--css`.
- **Elemento que muda a cada quadro precisa de camada própria** (`will-change`), senão repinta a camada da página e, com as partes abaixo do pin, trava (Fase 2).
- **Regra fora de `@layer` vence regra em camada**, qualquer que seja a ordem: o `body::before` do grão é assim, e o ajuste do grão dos campos teve de ficar fora da camada também.

- **Malha no próprio nó da peça + meshopt = pivô errado.** A quantização reescreve a posição e a escala do nó que tem a malha: a tampa abre 8 cm fora da dobradiça e a placa B fica 20 cm fora. Peça = Empty no pivô, malha filha (o `model:check` acusa).
- **Unit Scale do Blender diferente de 1 deixa o modelo 10× maior**: o importador de glTF aplica a escala e o exportador não. Régua em cm, Unit Scale 1.
- **Só `meshopt` num export do Blender estoura o teto** (2,3 MB contra 1,4 MB com solda e dedup antes): use o `model:import`.
- **O Cylinder do Blender tem o V da lateral de 0,5 a 1**: na capa das células (`cell_wrap`), a carga começaria no meio. O guia ensina o ajuste e o `model:check` avisa.
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

Branch `v3`. A Fase 1 está no commit `629c084`. Ao commitar, deixe de fora as sobras da v2 (`ONDE-PARAMOS.md`, `ONDE-PARAMOS-CODIGO.md` e `PROMPT-1-SUNTECH.md`): adicione por nome ou por pasta (`docs scripts src public/models` e os `.md` da raiz que mudaram), nunca com `git add -A`.

(`.snapshots/`, `dist/`, `scripts/model/node_modules`, `scripts/model/.cache/`, `models-src/*.glb` e `*.blend1` estão no `.gitignore`; `public/models/suntech.glb` e `models-src/suntech.blend` **entram** no commit. Se o `.blend` passar de 50 MB, use Git LFS ou deixe-o fora. Os `.tgz` em `.snapshots/_claude/` são cópias que o Claude usou para testar: pode apagar.)

## Perguntas para o dono

1. As etiquetas e a rolagem no celular ficaram boas? (Fotos em `.snapshots/v3-fase-1b/`.)
2. Os tons das partes (Noite, Nuvem, Grafite, Grafite, Céu, Noite, Nuvem) e o header em faixa sólida nas partes estão bons?
3. O painel quase plano no desktop e em V no celular, o cartão atrás do texto nos closes: seguem assim?
4. O modelo feito à mão (no Blender, pelo dono: respondido em 09/10) mantém as medidas do molde (caixa 150 × 100 × 40 mm, placas 200 × 150 mm)? Se mudar, as câmeras e a explosão precisam ser refeitas.
