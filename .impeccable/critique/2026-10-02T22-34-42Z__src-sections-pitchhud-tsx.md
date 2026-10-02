---
target: Partes 5 e 6, modo pitch e final (Fase 6)
total_score: 24
max_score: 28
na_heuristics: 5,9,10
p0_count: 2
p1_count: 2
target_identity: "file:C:\\Users\\User\\Desktop\\Claude Code\\Projetos\\site-sistema\\Bateria solar\\src\\sections\\PitchHud.tsx"
target_fingerprint: "sha256:275300bfffa2b52d019818500198d241037403b0b0353134a1dd54a78c4db96f"
target_path: "C:\\Users\\User\\Desktop\\Claude Code\\Projetos\\site-sistema\\Bateria solar\\src\\sections\\PitchHud.tsx"
timestamp: 2026-10-02T22-34-42Z
slug: src-sections-pitchhud-tsx
---
⚠️ DEGRADED: single-context (subagentes só com pedido explícito do usuário nesta sessão)

# Crítica da Fase 6 (Partes 5 e 6, modo pitch e final), 02/10/2026

Imagens: `.snapshots/fase-6/` e fotos do HUD em 1440×900, 390×844 e 1920×1080.

## Design Health Score

| # | Heurística | Nota | Ponto principal |
|---|---|---|---|
| 1 | Visibilidade do estado | 4 | O HUD diz o tempo, quem fala e a parada, com a barra de progresso; o `aria-live` anuncia cada parada |
| 2 | Linguagem do mundo real | 3 | "Fala agora: Produtos" é como a equipe se organiza no estande |
| 3 | Controle e liberdade | 4 | Espaço pausa, Esc sai, rolar à mão pausa, e o foco volta ao botão de onde o pitch saiu |
| 4 | Consistência | 3 | O CTA segue o `button-cta` do DESIGN.md; a linha do tempo se desenha como a história da Parte 4 |
| 5 | Prevenção de erros | n/a | |
| 6 | Reconhecer em vez de lembrar | 4 | A dica "Espaço pausa. Esc sai." fica ao lado do botão |
| 7 | Flexibilidade e eficiência | 3 | Dois pontos de entrada (Parte 5 e final); atalhos de teclado |
| 8 | Estética e minimalismo | 3 | O HUD é uma faixa só, sem enfeite; o produto girando contra o sol fica escuro no meio da volta |
| 9 | Recuperação de erros | n/a | |
| 10 | Ajuda e documentação | n/a | |
| **Total** | | **24/28** | **Muito bom (86%)** |

## Veredito de especificidade

O modo pitch é a ferramenta do estande: na TV, a página conta a apresentação
sozinha em exatamente 3 minutos, e a equipe vê no HUD quem fala e o que vem.
O aceite (M8) roda com o relógio falso do Playwright (`npm run test:pitch`):
paradas nos tempos do `feira.ts`, pausa, fim em 3:00 e Esc, normal e com
reduced motion.

## Problemas encontrados e corrigidos nesta fase

- [P0] O relógio do pitch corria 3× mais rápido com `?snap` (herdava a
  aceleração de teste da timeline global). O teste com `page.clock` achou;
  agora o relógio compensa a escala global e é sempre tempo real.
- [P0] O título da Parte 6 estourava a coluna a 1440 px ("empreendedorismo",
  762 px numa coluna de 652) e a máscara das linhas cortava a palavra. Os
  títulos de capítulo agora se limitam à coluna (`9,2cqi`), iguais em todas
  as partes.
- [P1] O HUD no celular não cabia em três colunas ("Marketing" por baixo do
  botão): duas linhas, com o relógio e os botões em cima.
- [P1] O HUD era pequeno para a TV a 3 m: o tipo cresce com a tela (relógio
  até 2,75rem, setor até 2,1rem).

## O que fica (sem bloquear)

- [P2] No meio do último giro, o painel mostra as costas contra o sol baixo e
  fica escuro. É um instante da volta.
- [P3] O teste do pitch leva uns 5 min (180 s de quadros falsos, duas vezes).

## Revisão de motion (Emil)

| Antes | Depois | Por quê |
| --- | --- | --- |
| Relógio do pitch dentro da timeline global | Timeline com `timeScale` compensado | O pitch é tempo real; aceleração de teste não pode mudar 3 minutos |
| `:active` com `transform: scale(0.97)` | `scale: 0.97` (propriedade própria) | O botão magnético usa o `transform`; a pressão some se os dois brigam |
| HUD aparecendo do nada | Entra subindo (`translateY(100%)` → 0, 260 ms, ease-out) | Vem de onde fica, uma vez por pitch |
| Barra de progresso por estado do React | `transform` escrito pelo relógio a cada quadro | Sem re-render 60 vezes por segundo |
| Linha do tempo parada | Desenhada bloco a bloco com o scroll; o ponto aparece quando a linha começa | A ordem dos três minutos aparece na leitura |

Botão magnético: desvio máximo de 12 px, `quickTo` de 0,6 s com ease-out,
só com `pointer: fine` e sem reduced motion. O HUD não anima nada além da
entrada e da barra.
