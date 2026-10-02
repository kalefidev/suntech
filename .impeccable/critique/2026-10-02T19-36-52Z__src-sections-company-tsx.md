---
target: Parte 4, a empresa (Fase 5)
total_score: 22
max_score: 28
na_heuristics: 5,9,10
p0_count: 0
p1_count: 2
target_identity: "file:C:\\Users\\User\\Desktop\\Claude Code\\Projetos\\site-sistema\\Bateria solar\\src\\sections\\Company.tsx"
target_fingerprint: "sha256:5961256ec9237610de40d93185a6b571ebdbf1b4091c0dd1290def720aa41e58"
target_path: "C:\\Users\\User\\Desktop\\Claude Code\\Projetos\\site-sistema\\Bateria solar\\src\\sections\\Company.tsx"
timestamp: 2026-10-02T19-36-52Z
slug: src-sections-company-tsx
---
⚠️ DEGRADED: single-context (subagentes só com pedido explícito do usuário nesta sessão)

# Crítica da Fase 5 (Parte 4: a empresa), 02/10/2026

Imagens: `.snapshots/fase-5/` (1440×900, 390×844, reduced motion e TV).

## Design Health Score

| # | Heurística | Nota | Ponto principal |
|---|---|---|---|
| 1 | Visibilidade do estado | 3 | A parte ativa fica no header; as barras mostram a proporção dos custos assim que a tabela entra |
| 2 | Linguagem do mundo real | 4 | O plano de voo é um cartão de embarque de verdade (canhoto, picote, recortes), sem clipart de avião |
| 3 | Controle e liberdade | 3 | Leitura no ritmo do scroll; a tabela rola na horizontal sem quebrar a página |
| 4 | Consistência | 3 | Setores, ficha e história usam a mesma régua de linhas; as barras usam a cor do texto |
| 5 | Prevenção de erros | n/a | Sem formulários |
| 6 | Reconhecer em vez de lembrar | 3 | "estimativa" ao lado de cada valor estimado; o total sai da soma da tabela |
| 7 | Flexibilidade e eficiência | 2 | O modo pitch (Fase 6) vai parar em "Custos" e "Preço" |
| 8 | Estética e minimalismo | 4 | O produto quieto à direita fecha a composição; nenhum enfeite sem papel |
| 9 | Recuperação de erros | n/a | |
| 10 | Ajuda e documentação | n/a | |
| **Total** | | **22/28** | **Bom (79%)** |

## Veredito de especificidade

A Parte 4 lê como o relatório de uma empresa de verdade, na voz da equipe: o
plano de voo da aula vira o cartão de embarque, e a conta do preço se vê sem
ler a tabela (as placas e as baterias são mais da metade do custo; a margem
listrada é a parte que fica com a empresa). Nenhum número fora da seção 3
(`npm run check:numbers`).

## Problemas encontrados e corrigidos nesta fase

- [P1] Metade direita vazia no desktop ao longo de uns 280vh de texto: o
  produto, que sumia no fim do diferencial, agora fica quieto à direita
  (como o plano pede).
- [P1] A tabela de custos não mostrava o que importa (para onde vai o
  dinheiro): barras com a parte de cada item no total e a barra do preço em
  custo e margem.
- [P2] A barra do preço crescia em `scaleX` com os rótulos parados embaixo:
  agora a barra e os rótulos se revelam juntos com `clip-path`.

## O que fica (sem bloquear)

- [P2] As seções da Parte 4 são longas no celular (a ficha técnica tem 11
  linhas). É o conteúdo da aula; fica.
- [P3] Os títulos pequenos ("Quem somos", "Plano de voo") não se revelam: a
  regra da página é que só numerais, títulos de capítulo, contadores e linhas
  se revelam.

## Revisão de motion (Emil)

| Antes | Depois | Por quê |
| --- | --- | --- |
| Picote em `border` fixo | Linha tracejada que se desenha (`--tear`) quando o cartão entra | O picote é o detalhe que diz "cartão de embarque"; desenhado, ele é notado sem enfeitar |
| Tabela de custos parada | Barras crescendo com o scroll (scrub, ease linear) | A proporção aparece no ritmo da leitura, sem disparar sozinha |
| Barra do preço em `scaleX` | `clip-path: inset()` na barra e nos rótulos | `scale` esticaria o texto dos rótulos |
| Linhas da história fixas | Cada etapa desenha a sua linha depois da anterior (stagger no scrub) | Dá a ordem (ideia, protótipo, testes) sem números a mais |

Tudo em scrub (o scroll manda) e nada se mexe com reduced motion: as linhas
e as barras já estão no lugar.
