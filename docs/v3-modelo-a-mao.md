# SunTech v3: como entregar o modelo 3D feito à mão

07/10/2026, revisto em 09/10/2026. O dono reprovou o modelo gerado por código ("muito simples") e vai modelar o carregador à mão **no Blender**. Este arquivo diz o que o GLB precisa ter para **entrar no lugar do atual sem mexer na animação** e o passo a passo para fazê-lo. Até ele chegar, o modelo gerado (`scripts/model/`) segue como provisório.

A animação move cada peça pelo **nome do nó**. Com os nomes, os pais e os pivôs abaixo, a coreografia funciona; o que muda é só o enquadramento da câmera (medido de novo, ver "Depois de trocar"). `npm run model:check` confere tudo isto num GLB qualquer; `npm run model:import` confere, comprime e publica.

## O contrato

### Escala e eixos

- **1 unidade do GLB = 100 mm.** A caixa de 150 × 100 × 40 mm tem 1,5 × 1,0 × 0,4 unidades. No Blender (unidade em metros), a caixa mede 1,5 m.
- **Truque da régua:** em *Scene Properties → Units*, deixe **Unit Scale = 1,000** e ponha **Length = Centimeters**. Aí o número em cm no Blender é o número em mm do produto (150 cm = 150 mm).
- **Nunca mude o Unit Scale.** O importador de glTF do Blender aplica a escala e o exportador não: com 0,1, o modelo volta 10× maior (testado no Blender 5.2). O `model:check` acusa.
- **Y para cima no GLB** (o exportador converte; no Blender é Z para cima). A frente da caixa (as saídas USB e o LED) olha para **+Z do GLB = −Y do Blender** (a vista *Front*, tecla 1 do numpad). A dobradiça da tampa fica atrás.
- Medidas fictícias em uso (`src/content/product.ts`): caixa 150 × 100 × 40 mm; cada placa 200 × 150 × 6 mm; painel fechado 200 × 150 × 12 mm, aberto 400 × 150 × 6 mm.

### Peças: um Empty no pivô, a malha como filha

Cada peça do contrato é um **nó vazio (Empty) no pivô**, e a malha é **filha** dele (nome livre; o padrão é `<peça>_mesh`). O site pega todas as malhas debaixo do Empty, até a próxima peça.

**Por que não a malha no próprio nó:** a compressão (meshopt) quantiza as posições e, para isso, reescreve a posição e a escala do nó que tem a malha: o pivô vai para o centro da malha. O site gira a tampa e a placa B escrevendo a rotação inteira desses nós, então elas giram em volta do lugar errado. Medido com o modelo atual: a tampa aberta fica **8 cm** fora e a placa B, **20 cm**. Com a malha num filho, a quantização mexe só no filho e o Empty fica intacto (diferença de 7e-8). É o que o gerador já faz (`scripts/model/lib/part.mjs`).

```
suntech                      raiz (nada fora dela: o site desenha a cena inteira do GLB)
├── case                     a caixa inteira (não gira)
│   ├── case_base            corpo da caixa; pivô no centro do chão
│   ├── case_lid             tampa; PIVÔ NA DOBRADIÇA (em cima, atrás): gira 110° em X; repouso 0°
│   ├── cell_holder          suporte das células; pivô na base do suporte
│   │   ├── cell_a           célula 18650; pivô no centro
│   │   └── cell_b           célula 18650; pivô no centro
│   ├── pcb_charge           módulo TP4056 + DW01; pivô no centro da placa (Empty girado 90°)
│   └── pcb_boost            conversor boost; pivô no centro da placa (Empty girado 90°)
│       ├── usb_port         a saída USB-A (fica DENTRO do boost)
│       └── led              o LED azul de saída
├── panel                    o painel; PIVÔ NA LOMBADA (a dobradiça entre as placas)
│   ├── panel_a              placa de baixo; pivô na lombada
│   └── panel_b              placa de cima; pivô na lombada, DOBRADA: repouso 180° em Y (sobre a A)
└── phone                    o celular da cena final; pivô no centro
```

Em repouso (pose do GLB) o produto está **montado e fechado**: tampa fechada, painel dobrado e em pé atrás da caixa, células e placas nos seus lugares. A animação parte dessa pose: abre a tampa, gira a `panel_b` de 180° para 0° (abre como um livro), desliza o painel e afasta as peças para cima na explosão. A `case_lid` e a `panel_b` têm de estar exatamente na rotação de repouso (0° e 180°): o site escreve a rotação delas por inteiro.

Posição de cada pivô e tamanho de cada peça no molde (Blender, régua em cm = mm do produto):

| Empty | Pivô | Tamanho (X × Y × Z) |
|---|---|---|
| `case_base` | centro do chão da caixa | 150 × 105 × 38 (com os pés e a dobradiça) |
| `case_lid` | dobradiça, em cima e atrás | 150 × 104 × 10 |
| `cell_holder` › `cell_a`, `cell_b` | base do suporte / centro de cada célula | 72 × 42 × 14; células Ø18 × 65 |
| `pcb_charge` | centro da placa | 17 × 28 × 5 |
| `pcb_boost` › `usb_port`, `led` | centro da placa | 22 × 22 × 7 |
| `panel` › `panel_a`, `panel_b` | lombada (borda esquerda) | 203 × 10 × 154 cada |
| `phone` | centro do celular | 75 × 8 × 150 (girado −14°) |

### Âncoras (nós vazios)

| Nome | Pai | Para quê | Obrigatória? |
|---|---|---|---|
| `usb_a_mouth` | `usb_port` | boca do USB-A, onde o cabo sai; a direção do cabo é o eixo da âncora (+Z no GLB, −Y local no Blender, para fora da porta): **não gire** | **sim** |
| `phone_connector` | `phone` | entrada do cabo no celular | **sim** |
| `label_panel`, `label_pcb_charge`, `label_pcb_boost` | a peça | ponto onde a etiqueta se prende | não (sem ela, vale o centro da peça) |
| `grommet`, `junction`, `lid_top`, `label_phone` | a peça | reservadas | não |

As células não têm âncora de etiqueta: vale o centro do `cell_holder`.

### Materiais (pelo nome)

O site troca os materiais pelo **nome**. Cor, rugosidade, metal e emissão do GLB servem de base; as **texturas do GLB também passam** (imagem, normal, rugosidade/metal, AO e emissiva), assim como o verniz (*Coat*). Alguns nomes ganham comportamento:

| Nome do material | O que o site faz | Precisa de |
|---|---|---|
| `cells` | desenha as células do painel (brilho que corre com o scroll); ignora a imagem do GLB | UV cobrindo a face das células |
| `cell_wrap` | desenha a capa da bateria; a carga sobe ao longo do V | só na lateral (tampas com `cell_ring` ou `steel`), com o U dando a volta e o **V de 0 a 1 ao longo do comprimento**. O Cylinder do Blender dá a volta no U, mas o V da lateral vai só de 0,5 a 1: no UV Editor, com a lateral selecionada, **S Y 2** e depois **G Y -0.25** |
| `pcb_charge_top`, `pcb_boost_top` | desenha a placa (trilhas, chips) | UV da face de cima |
| `phone_screen` | tela do celular com a carga | UV da tela |
| `led_core` | acende no beat Entregar (emissivo) | — |
| `led_red` | acende no beat Proteger | — |
| `glass`, `led_lens` | vidro (verniz forte, sem escrever profundidade) | — |
| `case_matte`, `backsheet`, `anodized`, `steel`, `aluminum`, `gold`, `chip`, `phone_body`, `phone_glass`, `pcb_*_top` | ajustes de verniz e brilho por nome (`OVERRIDES` em `SuntechModel.tsx`); com textura de cor própria, a cor do ajuste não tinge a textura | — |

Qualquer outro nome entra como vem do GLB (PBR metal/rugosidade). O molde já traz os 33 materiais com esses nomes. **Nada de `.001`** (o Blender o põe em nome repetido, e o site deixa de reconhecer o material). Texturas: **WebP**, 1K ou 2K (o GLB não tem KTX2Loader no site).

### Regras

- **Chanfro em tudo** (nada de caixa com aresta viva).
- Peças de verdade por dentro: a explosão mostra o interior da caixa (hoje ele é vazio, um dos defeitos apontados).
- **Sem Draco** (o decoder viria do gstatic, uma CDN, proibido): o `model:import` comprime com meshopt. GLB publicado até **1,5 MB**.
- Licença de cada parte que vier de fora em `public/models/LICENSE.md`.

## Passo a passo no Blender

Testado de ponta a ponta no Blender 5.2 LTS: molde importado, malha trocada, export, `model:import` e o site com a tampa, o painel, a explosão e o cabo funcionando. Vale do Blender 4.2 LTS em diante.

1. **Configurar.** *Scene Properties → Units*: Metric, **Unit Scale 1,000**, Length **Centimeters**.
2. **Importar o molde.** *File → New → General*; apague o cubo, a câmera e a luz (A, X). *File → Import → glTF 2.0* → `scripts/model/.cache/suntech.raw.glb` (se não existir: `npm run model:install` uma vez e `npm run model:reference`). Entram 24 Empties (os pivôs, com os nomes do contrato) e 12 malhas `*_mesh` (o modelo gerado). Salve como `models-src/suntech.blend`.
3. **Separar a referência.** Crie a coleção `referencia`. Para cada malha antiga: F2 → `<peça>_ref`; *Object Properties → Viewport Display → Display As: Wire*; M → `referencia`. Ela continua filha do Empty. **Nunca mova, gire, escale, aplique transformação nem renomeie um Empty.**
4. **Modelar cada peça.** Clique no Empty → Shift+S → *Cursor to Selected* → Shift+A (a malha nasce no pivô). Modele por cima da referência, **com o mesmo tamanho externo** (a câmera foi enquadrada para ele). Ctrl+A → *Rotation & Scale* na malha. Modifier **Bevel** (Amount 0,5–2 cm = 0,5–2 mm do produto, Segments 2–3, Limit Method *Angle*, Harden Normals) e *Object → Shade Auto Smooth*. F2 → `<peça>_mesh`. Clique na malha, Shift+clique no Empty, Ctrl+P → **Object (Keep Transform)**. No Outliner: `case_lid ▸ case_lid_mesh`.
5. **Materiais e UV.** Use os materiais do molde (tabela acima). UV rápido para as faces que o site desenha: Edit Mode → selecione a face → U → *Reset* (uma face só, ocupa o quadrado inteiro) ou *Project from View (Bounds)*. Na capa das células, o ajuste do V do Cylinder (tabela acima). Se a textura aparecer girada no site, gire o UV 90°. O `model:check` avisa quando o UV não cobre o quadrado 0–1.
6. **Âncoras.** `usb_a_mouth` e `phone_connector` já vêm no molde. Se a porta ou o conector mudarem de lugar, **mova** a âncora (G), sem girar.
7. **Conferir.** Overlay *Face Orientation*: tudo azul (vermelho → Shift+N). Overlay *Statistics*: o modelo gerado tem 79 mil triângulos; mire em 80 a 150 mil (o teto é o tamanho do GLB). Nenhum nome com `.001`. Esconda a coleção `referencia` (olho).
8. **Exportar.** *File → Export → glTF 2.0*: Format **glTF Binary (.glb)**; Include → Limit to **Visible Objects**; Transform **+Y Up**; Mesh: **Apply Modifiers**, UVs e Normals; Material: Export, Images **WebP**; **Compression desligada**; Animation, Cameras e Punctual Lights desligados; marque **Remember Export Settings**. Salve em `models-src/suntech.glb`.
9. **Publicar no site.** `npm run model:import` (ou `npm run model:import -- caminho/arquivo.glb`). Ele confere o contrato no export, comprime como o gerador (solda, dedup sem fundir materiais, meshopt `medium`; se passar de 1,5 MB, tenta `high`), confere de novo e só então grava `public/models/suntech.glb`. Com erro, não grava nada. O arquivo publicado fica marcado como feito à mão, e o `npm run model` passa a recusar sobrescrevê-lo (`--force` volta ao gerado).
10. **Olhar.** `npm run dev` e role a página inteira: a tampa abre na dobradiça, o painel abre como um livro, as peças sobem na explosão, o cabo sai do USB. O console avisa `O GLB não tem a peça "..."` se faltar alguma.

### Erros que quebram a animação (testados)

| Erro | O que acontece | Como evitar |
|---|---|---|
| Malha no lugar do Empty (objeto `case_lid` com malha) | a tampa abre 8 cm fora da dobradiça; a placa B fica 20 cm fora | Empty no pivô + malha filha |
| Unit Scale diferente de 1 | o modelo sai 10× maior | Unit Scale 1, régua em cm |
| Nome com `.001` | `O GLB não tem a peça "..."` | renomear |
| Empty da tampa ou da placa B girado | a peça salta no primeiro quadro | não mexer nos Empties |
| Referência visível no export | peça duplicada | esconder a coleção `referencia` |
| Draco ligado no export | o GLB não carrega | Compression desligada |
| Compressão só com `meshopt` | 2,3 MB com o mesmo modelo (teto 1,5) | `npm run model:import` (solda e dedup antes) |
| Textura num material de `cells`, `cell_wrap`, `pcb_*_top` ou `phone_screen` | a textura some (o site desenha a dele) | textura própria só nos outros materiais |
| Cylinder padrão na capa das células | a carga começa no meio da célula (o V da lateral vai de 0,5 a 1) | S Y 2 e G Y -0.25 no UV Editor |

## Depois de trocar (eu faço, ou quem retomar)

1. `npm run build`, preview no ar e `node scripts/dev/framing.mjs --solve --apply` no desktop e com `--size=390x844` (regrava as câmeras); atualizar o `span` de cada beat com a coluna `l`.
2. Ajustar as distâncias da explosão em `src/scene/model/motion.ts` (`MOTION`, em unidades do GLB) se as peças tiverem outro tamanho.
3. `node scripts/dev/reverse.mjs`, `node scripts/dev/sweep.mjs` e `npm run snap <fase>`.
4. Atualizar `public/models/LICENSE.md` (modelo feito à mão, peças de fora com autor e licença) e commitar `models-src/suntech.blend` junto com o `public/models/suntech.glb`.
