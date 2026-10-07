# PROMPT V3: refazer a cena 3D e o scroll do site SunTech

Leia o `CLAUDE.md` inteiro antes de qualquer coisa. Ele manda sobre stack, arquitetura e ativos 3D. Do `BRIEF.md`, leia só o que a tarefa pedir (§3 fatos, §7 textos). Não leia `ONDE-PARAMOS-CODIGO.md` nem `PROMPT-1-SUNTECH.md`.

## 1. Objetivo

Refazer o site para que ele tenha o efeito dos sites de produto 3D que o dono mostrou: **o carregador aparece grande no meio da tela e, conforme o usuário rola, ele abre e vai revelando os componentes, de forma fluida e animada**, com o texto acompanhando cada peça. O restante do conteúdo (as 6 partes das aulas, os fatos, o modo pitch) continua; muda a cena do produto e a camada de scroll.

Crie a branch `v3` a partir da `v2` antes de mexer em código.

## 2. O que está errado na v2 (não repita)

- Produto pequeno e fora do centro (no hero, cabe numa faixa do topo).
- Geometria feita de caixas simples: sem chanfro, sem reflexo, parece maquete.
- Scroll duro: a animação não acompanha a rolagem.
- O céu com ciclo de dia e noite, a zona morta de contraste e as 6 partes competem com o efeito principal.
- A regra "sem modelos nem HDRIs" impedia o acabamento que faz o 3D parecer produto. Ela caiu (ver `CLAUDE.md`, "Ativos 3D").

## 3. Referências (resumo, para você não precisar abrir os vídeos)

Quatro reels de sites 3D de produto (análise de 12 quadros por vídeo, em baixa resolução, então trate como direção, não como medida). **Reproduza a mecânica, nunca a marca, o layout ou a arte deles.**

1. **Relógio (`reel/DbwL4wCRwaJ`):** produto grande no centro, palavra gigante atrás dele. Ele se desmonta em peças flutuando, entra uma cena escura de linhas, depois um close numa peça com tipografia enorme esmaecida atrás, e volta ao fundo claro. Alterna claro e escuro a cada beat.
2. **Galeria 3D (`reel/DbBx33MRslX`):** a câmera percorre uma sala 3D sem cortes; títulos grandes ("Retail", "Marketing") aparecem sobre a cena. Mecânica: câmera num trilho contínuo ligada ao scroll.
3. **Coletânea (`reel/DURcP3qj4mq`):** um produto central por vez sobre gradiente suave com grão, interface mínima, peças soltas flutuando em 3D.
4. **Garrafa "DRIP" (`p/DZdOFrNDx4i`), a mais próxima do que o dono quer:** objeto preto cilíndrico no centro, que gira e inclina com o scroll. **Uma palavra-spec por beat** em texto grande ao lado ("Sleek", "Stainless", "Long", "Capacity"). Ele abre e mostra o interior, com um ícone de energia no meio, e termina numa cena azul escura com "99%". Reflexo no chão.

## 4. A cena do produto

Uma cena presa (`pin`) de 600 a 800vh. Produto centralizado o tempo todo, 55 a 70% da altura da viewport no desktop e 45 a 55% no celular. Progresso `p` de 0 a 1 do pin:

| p | Beat | Peças e câmera | Texto |
|---|---|---|---|
| 0,00 a 0,08 | Fechado | Produto montado, giro lento. Câmera de 3/4. | Título curto e a palavra gigante atrás |
| 0,08 a 0,22 | Abre | A tampa gira na dobradiça e sai. Câmera sobe uns 20°. | "Abre" a primeira etiqueta |
| 0,22 a 0,38 | Explode | Peças se afastam no eixo vertical, em cascata. Câmera recua para enquadrar tudo. | Palavra muda |
| 0,38 a 0,80 | 4 componentes | Um beat de ~0,105 por componente: **painel (captar)**, **módulo de carga e proteção (proteger)**, **células 18650 (guardar)**, **boost e saídas (entregar)**. A câmera vai até a peça; as outras ficam a ~15% de opacidade. | Palavra gigante + um dado de `src/content` |
| 0,80 a 0,92 | Remonta | Peças voltam e a tampa fecha. | Síntese |
| 0,92 a 1,00 | Energia | Fluxo de energia até o celular, carga subindo. Pin libera. | Chamada para a próxima parte |

Regras: um tom de fundo por beat (claro e escuro alternando, como nas referências), sem céu procedural; uma palavra gigante atrás do produto por beat; reflexo ou sombra de contato no chão; bloom leve só no LED e no fluxo de energia; grão sutil. Nada de fade-up genérico. Easing e durações pelas skills (`impeccable`, Emil Kowalski, GSAP).

## 5. Modelo 3D

Decida na Fase 0 e pergunte ao dono: **existe um GLB do carregador?** Se existir, siga o contrato de peças do `CLAUDE.md`. Se não, faça a v3 com geometria procedural **chanfrada** e materiais PBR com ambiente, mantendo os nomes de peça do contrato, para que um GLB entre depois sem mexer na coreografia. Medidas reais ainda estão em `// TODO: preencher` no `product.ts`: use `DEFAULT_PROPORTIONS`, não invente.

## 6. Fases

- **Fase 0:** `docs/v3-fase-0.md`, de uma a duas páginas: diagnóstico confirmado no código, roteiro da seção 4 com os valores de `choreography.ts`, decisão do modelo, o que sai (céu, `dayTime`, `daylight.ts`) e o que fica, riscos. **Pare e peça aprovação.** Pergunte também: as 6 partes e o modo pitch continuam obrigatórios para a feira? (Suposição padrão: sim, sem mudar o conteúdo.)
- **Fase 1:** só a cena do produto, isolada, funcionando de ponta a ponta no desktop e no celular. Aprovação visual com o `snap`.
- **Fase 2:** reintegrar as 6 partes e o modo pitch ao redor da nova cena; remover o código morto do céu.
- **Fase 3:** polimento, performance, SEO, deploy na Vercel.

## 7. Critérios de aceite

1. Em 0, 25, 50, 75 e 100% do pin, o centro do produto fica a no máximo 4% do centro da viewport e a altura dele cumpre a faixa da seção 4.
2. Rolar para cima desfaz a animação exatamente (tudo no `scrub`, sem disparo único).
3. Sem `useState` no loop de animação; `state.ts`, `choreography.ts` e `tracks.ts` sem import de `three`.
4. Tempo de quadro p95 de até 16,7 ms em 1440×900 (medir com `scripts/dev/frametime.mjs`).
5. Reduced motion: sem pin longo; um quadro estático por beat. `?nowebgl`: fallback navegável.
6. Contraste AA em todos os pontos do `snap`; `typecheck`, `lint` e `check:numbers` limpos; JS dentro do orçamento (150 KB inicial, 500 KB total) e GLB até 1,5 MB.
7. Nenhum número fora de `src/content`.

## 8. Como trabalhar

Questione este prompt: aponte o que estiver contraditório, caro de fazer ou arriscado antes de implementar. Mostre o resultado de cada fase com fotos do `snap` e diga o que ficou abaixo do esperado. Não declare a fase pronta sem rodar os comandos do aceite.
