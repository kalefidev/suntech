# Fase 3b (v3): tudo o que dá para fazer sem o modelo

**Plano aprovado em 12/10/2026.** A Fase 3a (`86bac4b`) fechou a auditoria do DOM, o `og.png`, o `DESIGN.md` do build e a prévia da `v3` na Vercel. O modelo 3D definitivo está com o dono, sem data; este plano adianta o resto. **Cada etapa começa só quando o dono pede.** Ao fechar uma etapa, marque a caixa dela aqui e registre os resultados em `docs/v3-progresso.md`.

## Regras para todas as etapas

- Uma etapa, um commit, adicionado por nome. Nunca `git add -A` e nunca o `models-src/suntech.blend`.
- Cada commit vai para a `origin/v3`, e a prévia (https://suntech-git-v3-kaiquecalefi-8397s-projects.vercel.app) se atualiza sozinha. A `main` não é tocada.
- A base do aceite vale em toda etapa: `npm run typecheck`, `npm run lint` e `npm run check:numbers`. Os checks próprios de cada etapa estão nela.
- Servidores parados ao fim. O `sweep` só conta com 3 rodadas e com a máquina parada, nunca logo depois do `snap`.
- Achado que depende do modelo não é corrigido: vai para a lista "Depois do modelo", no fim deste arquivo.

## Etapas

- [x] **0. Gravar o plano.** Este arquivo, mais o link no `ONDE-PARAMOS-V3.md`.
- [ ] **1. Conteúdo das aulas contra o checklist**
- [ ] **2. Revisão do `snap` foto por foto + `impeccable critique`**
- [ ] **3. Acessibilidade a fundo**
- [ ] **4. Animação do DOM (skills do Emil)**
- [ ] **5. Carga no celular em 4G lento**
- [ ] **6. Limpeza (código e contexto)**
- [ ] **7. Documentação e relatório**

Em paralelo, quando o dono puder:

- [ ] **A. Decisões visuais**
- [ ] **B. Prévia sem login**
- [ ] **C. FPS no celular real**
- [ ] **D. QR code do banner** (opcional)

### 1. Conteúdo das aulas contra o checklist

O avaliador cobra isto primeiro. A lista é o `BRIEF.md` §15, em "Conteúdo das aulas", com os textos do §7.

- Montar uma tabela com cada item: onde aparece (componente em `src/sections/`, chave em `src/content/copy.ts` ou `feira.ts`), se está na ordem certa e se a parte mostra o número e a aula.
- Itens:
  - **Aula 2:** as oportunidades, os 3 problemas, a situação-problema e por que ela importa.
  - **Aula 3:** a persona, a frase "Nosso cliente é...", as 3 perguntas da reflexão e persona × público-alvo.
  - **Aula 4:** as 4 perguntas da caça ao diferencial, o que oferecemos, como melhora a vida do cliente e o que fazemos de diferente.
  - **Aula 5:** propósito, destino, trajeto e operações; os 3 setores; custos e preço; o protótipo.
  - **Aula 6:** o pitch em 3 minutos, quem apresenta cada parte e o preço justo.
  - **AQ3:** o papel do jovem no empreendedorismo do futuro.
- Conferir também: estimativas rotuladas, dados externos com a fonte logo abaixo e nenhum item da lista do §14 (proibido).
- Corrigir só o que faltar, com fatos de `src/content/`, sem inventar. Texto novo passa pela skill `design:ux-copy`.
- **Aceite:** a tabela completa em `docs/v3-progresso.md`; `check:numbers` limpo.

### 2. Revisão do `snap` foto por foto + `impeccable critique`

O checklist pede o "snap final revisado imagem por imagem". A Fase 3a só olhou as partes, o header, a tabela e o rodapé.

- `npm run snap v3-fase-3b` e uma grade por passada (`scripts/dev/montage.mjs`): 1440×900, 390×844, reduced motion nos dois tamanhos, TV, tablet, tier baixo e `?nowebgl`.
- Skill `impeccable critique` nas fotos. Achados de P0 a P3, separando o que é do site do que é do modelo.
- Corrigir os P0 e P1 do site. Os P2 e P3 viram lista para o dono decidir.
- **Aceite:** `snap` tudo certo; `reverse` no desktop e com `--size=390x844`.

### 3. Acessibilidade a fundo

O `axe` já passa; esta etapa cobre o que ele não mede. Skills: `accessibility`, `design:accessibility-review` e `accessible-animation`.

- **Zoom de texto a 200%** (WCAG 1.4.4) e **reflow em 320 px** (WCAG 1.4.10): sem rolagem lateral e sem texto cortado. Medir com Playwright, com o `font-size` raiz a 200% e viewport de 320×640.
- **Leitor de tela:** a árvore de acessibilidade (snapshot do Playwright) de cinco pontos:
  - a tabela empilhada;
  - o menu do celular (foco preso, Esc);
  - o modo pitch (anúncios ao vivo);
  - as etiquetas (escondidas);
  - o canvas (`aria-hidden`).
- **Alvos de toque de 44 px** em 390×844: links do rodapé, fontes, botões do pitch e "Menu". Um script mede todo elemento clicável.
- **Reduced motion e `?movimento=1`:** os dois caminhos, de ponta a ponta.
- **Aceite:** os 4 checks acima sem falha; `axe` nos 3 modos; `tab-order`.

### 4. Animação do DOM (skills do Emil)

O checklist pede os achados das skills do Emil resolvidos ou justificados. Skills: `improve-animations` (auditoria), `emil-design-eng`, `gsap-performance` e `60fps-animation`.

- Alvos: o header (sai e volta, faixa sólida), as aberturas das partes, os contadores dos fatos, as barras de custo, os destaques, o CTA magnético, o cursor, o HUD do pitch, o loader e a abertura.
- Corrigir curvas, durações, interrupção e propriedades que repintam. Não mexer em decisões visuais pendentes com o dono.
- A `/review-animations` fica com o dono, como no plano da v3.
- **Aceite:** `sweep` em 3 rodadas (desktop e 390×844 com DPR 2); `reverse`; `test:pitch`; `snap --quick` nos dois tamanhos.

### 5. Carga no celular em 4G lento

Princípio do produto: "legível antes de impressionante". O texto do hero tem de aparecer antes do 3D.

- Acrescentar `--net=4g|3g` ao `scripts/dev/lcp.mjs`, limitando a rede via CDP (`Network.emulateNetworkConditions`).
- Medir em 390×844 com `--cpu=4`: o LCP, quando o texto do hero aparece, quando o GLB termina e as tarefas longas.
- Corrigir se o texto esperar o 3D ou se o loader prender a página. O GLB vai mudar: o teto é de 1,5 MB, e o teste usa o atual.
- **Aceite:** os números em `docs/v3-progresso.md`; em 4G, o texto do hero aparece antes do 3D.

### 6. Limpeza (código e contexto)

- **Comentários da v2 que falam do céu:** `src/index.css` (perto das linhas 228, 279, 297, 322 e 454), a docstring de `src/scene/model/SuntechModel.tsx` e "Madrugada" no `index.html`.
- **Código morto:** `.type-display` (`src/index.css`, perto da linha 151) e o token Brasa no `@theme`. Se mudarem, atualizar `DESIGN.md` e `.impeccable/design.json`.
- **`PRODUCT.md` desatualizado** (a skill `impeccable` o lê em toda sessão):
  - o princípio 3 ainda fala do "ciclo do dia";
  - a acessibilidade fala de "todas as horas do céu" e de "céu trocando de hora";
  - as medidas aparecem como `null`, mas hoje são fictícias, com o rótulo "ilustrativo".
- **Aceite:** `snap --quick` sem diferença visual; `impeccable detect src` sem avisos novos.

### 7. Documentação e relatório

- **`README.md`:**
  - a prévia da branch (URL, login, `?debug` no celular);
  - `?movimento=1`;
  - um ponteiro para a troca do modelo (`docs/v3-modelo-a-mao.md`);
  - o aviso de que o merge na `main` publica.
- **`PROGRESS.md`:** o ponteiro para a v3 (já existe) e as pendências do usuário (F6, medidas).
- **Relatório da v3**, exigido pelo checklist, na seção final de `docs/v3-progresso.md`: o que foi feito, os desvios e por quê, e as pendências. Fica marcado como parcial até o modelo chegar.
- O checklist técnico do §15 marcado item a item.
- **Aceite:** os links do README funcionam, e todo comando citado existe no `package.json`.

### Em paralelo

- **A. Decisões visuais.** Cada uma é implementada quando respondida, num commit próprio:
  - os tons das partes;
  - o header em faixa sólida;
  - o cartão atrás do texto nos closes;
  - a tabela empilhada no celular;
  - a textura de grão;
  - o painel plano no desktop e em V no celular (a decisão vale agora; os números da câmera são refeitos com o modelo).
- **B. Prévia sem login.** A decisão é do dono, e quem desliga a proteção é ele, no painel da Vercel (Settings → Deployment Protection). A CLI da Vercel não está instalada.
- **C. FPS no celular real.** Pela prévia, com `?debug` (README, "Como medir o FPS"). O resultado é só uma referência: o número final sai com o modelo. Eu o registro aqui.
- **D. QR code do banner (opcional).**
  - Formato: SVG e PNG, apontando para `https://suntech-ten.vercel.app`, a mesma URL depois do merge.
  - Geração: `npx qrcode`, sob demanda, fora do `package.json`.
  - Destino: `public/` ou `docs/`.

## Depois do modelo (fora deste plano; só referência)

1. `npm run model:import`.
2. Enquadramento: `framing.mjs --solve --apply` no desktop e no celular.
3. `MOTION` da explosão.
4. Polimento 3D: interior da caixa, aço do USB, preto da caixa sobre o Noite.
5. `npm run build && npm run og` e o `LICENSE.md` do modelo.
6. FPS final.
7. Commit do `.blend` junto com o GLB.
8. Merge na `main`, só com a aprovação do dono.

## Verificação ao fim de cada etapa

- A base (`typecheck`, `lint`, `check:numbers`) e os checks da etapa.
- `git log --stat -1` sem o `.blend`.
- A prévia atualizada: status "Vercel success" no commit (`gh api repos/kalefidev/suntech/commits/<sha>/status`).
- `docs/v3-progresso.md` e a caixa da etapa, aqui, atualizados.

Com as etapas 1 a 7 feitas e o checklist do §15 conferido, a v3 fica pronta, menos o modelo.
