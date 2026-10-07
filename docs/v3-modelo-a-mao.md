# SunTech v3: como entregar o modelo 3D feito à mão

07/10/2026. O dono reprovou o modelo gerado por código ("muito simples") e vai modelar o carregador à mão (Blender ou outro). Este arquivo diz o que o GLB precisa ter para **entrar no lugar do atual sem mexer na animação**. Até ele chegar, o modelo gerado (`scripts/model/`) segue como provisório.

A animação move cada peça pelo **nome do nó**. Com os nomes, os pais e os pivôs abaixo, a coreografia funciona; o que muda é só o enquadramento da câmera (é medido de novo, ver "Depois de trocar").

## Escala e eixos

- **1 unidade do GLB = 100 mm.** A caixa de 150 × 100 × 40 mm tem 1,5 × 1,0 × 0,4 unidades. (No Blender, com a unidade em metros: a caixa tem 1,5 m de comprimento.)
- **Y para cima.** A frente da caixa (as saídas USB e o LED) olha para **+Z**. A dobradiça da tampa fica atrás (−Z).
- Medidas fictícias em uso (`src/content/product.ts`): caixa 150 × 100 × 40 mm; cada placa 200 × 150 × 6 mm; painel fechado 200 × 150 × 12 mm, aberto 400 × 150 × 6 mm.

## Hierarquia (nomes obrigatórios)

Cada linha é um nó (um *Empty* ou um objeto no Blender). A malha de cada peça pode ser filha do nó ou o próprio nó; o app pega todas as malhas debaixo dele, até a próxima peça.

```
suntech                      raiz
├── case                     a caixa inteira (não gira)
│   ├── case_base            corpo da caixa; pivô no centro da base
│   ├── case_lid             tampa; PIVÔ NA DOBRADIÇA (aresta de cima, atrás): ela gira 110° em X
│   ├── cell_holder          suporte das células; pivô na base do suporte
│   │   ├── cell_a           célula 18650; pivô no centro
│   │   └── cell_b           célula 18650; pivô no centro
│   ├── pcb_charge           módulo TP4056 + DW01; pivô no centro da placa
│   └── pcb_boost            conversor boost; pivô no centro da placa
│       ├── usb_port         a saída USB-A (fica DENTRO do boost)
│       └── led              o LED azul de saída
├── panel                    o painel; PIVÔ NA LOMBADA (a dobradiça entre as placas)
│   ├── panel_a              placa de baixo; pivô na lombada
│   └── panel_b              placa de cima; pivô na lombada, DOBRADA: girada 180° em Y sobre a A
└── phone                    o celular da cena final; pivô no centro
```

Em repouso (pose do GLB) o produto está **montado e fechado**: tampa fechada, painel dobrado e em pé atrás da caixa, células e placas nos seus lugares. A animação parte dessa pose: abre a tampa, gira a `panel_b` de 180° para 0° (abre como um livro), desliza o painel e afasta as peças para cima na explosão.

## Âncoras (nós vazios)

| Nome | Pai | Para quê | Obrigatória? |
|---|---|---|---|
| `usb_a_mouth` | `usb_port` | boca do USB-A, onde o cabo sai | **sim** (o cabo do celular) |
| `phone_connector` | `phone` | entrada do cabo no celular | **sim** |
| `label_panel`, `label_pcb_charge`, `label_pcb_boost` | a peça | ponto onde a etiqueta se prende | não (sem ela, vale o centro da peça) |
| `grommet`, `junction`, `lid_top`, `label_phone` | a peça | reservadas | não |

As células não têm âncora de etiqueta: vale o centro do `cell_holder`.

## Materiais (pelo nome)

O app troca os materiais pelo **nome**: cor, rugosidade e metal do GLB servem de base, e alguns nomes ganham comportamento.

| Nome do material | O que o app faz | Precisa de |
|---|---|---|
| `cells` | as células do painel (brilho que corre com o scroll) | UV cobrindo a placa |
| `cell_wrap` | a capa da bateria (a carga sobe no beat Guardar) | UV da capa, de baixo para cima |
| `pcb_charge_top`, `pcb_boost_top` | textura da placa desenhada em runtime | UV da face de cima |
| `phone_screen` | tela do celular com a carga | UV da tela |
| `led_core` | acende no beat Entregar (emissivo) | — |
| `led_red` | acende no beat Proteger | — |
| `glass`, `led_lens` | vidro (verniz forte, sem escrever profundidade) | — |
| `case_matte`, `backsheet`, `anodized`, `steel`, `aluminum`, `gold`, `chip`, `phone_body`, `phone_glass` | ajustes de verniz e brilho | — |

Qualquer outro nome entra como vem do GLB (PBR metal/rugosidade). Texturas próprias: WebP ou KTX2.

## Regras

- **Chanfro em tudo** (nada de caixa com aresta viva).
- Peças de verdade, por dentro: a explosão mostra o interior da caixa (hoje ele é vazio, um dos defeitos apontados).
- **Sem Draco**: comprima com meshopt. Até **1,5 MB**.
- Licença de cada parte que vier de fora em `public/models/LICENSE.md`.

## Exportar

1. Blender: *File → Export → glTF 2.0 (.glb)*, com *+Y Up*, *Apply Modifiers*, sem compressão Draco, com os nós vazios (âncoras) incluídos.
2. Compactar e gravar no lugar do atual:
   ```bash
   npx @gltf-transform/cli meshopt modelo.glb public/models/suntech.glb
   ```
3. **Não rode mais `npm run model`**: ele regrava o `public/models/suntech.glb` com o modelo gerado.
4. Conferir os nomes: `cd scripts/model && node inspect.mjs` (mostra a hierarquia, os pivôs e os materiais). Se faltar uma peça, o site acusa no console: `O GLB não tem a peça "..."`.

## Depois de trocar (eu faço, ou quem retomar)

1. `npm run build`, preview no ar e `node scripts/dev/framing.mjs --solve --apply` no desktop e com `--size=390x844` (regrava as câmeras); atualizar o `span` de cada beat com a coluna `l`.
2. Ajustar as distâncias da explosão em `src/scene/model/motion.ts` (`MOTION`, em unidades do GLB) se as peças tiverem outro tamanho.
3. `node scripts/dev/reverse.mjs`, `node scripts/dev/sweep.mjs` e `npm run snap <fase>`.
