---
target: Parte 3, a solução (Fase 4)
total_score: 22
max_score: 28
na_heuristics: 5,9,10
p0_count: 3
p1_count: 5
target_identity: "file:C:\\Users\\User\\Desktop\\Claude Code\\Projetos\\site-sistema\\Bateria solar\\src\\sections\\HowItWorks.tsx"
target_fingerprint: "sha256:e7c92c6b565190cb6e687381551094ee05ae3375b02aedb5169093e57d5776cd"
target_path: "C:\\Users\\User\\Desktop\\Claude Code\\Projetos\\site-sistema\\Bateria solar\\src\\sections\\HowItWorks.tsx"
timestamp: 2026-10-02T18-51-47Z
slug: src-sections-howitworks-tsx
---
⚠️ DEGRADED: single-context (subagentes só com pedido explícito do usuário nesta sessão)

# Crítica da Fase 4 (Parte 3: "Por dentro", "Como funciona", "A energia fica" e 3c), 02/10/2026

Imagens: `.snapshots/fase-4-dev/` (1440×900, 390×844, reduced motion e TV) e as
sequências quadro a quadro feitas com `scripts/dev/pins.mjs`.

## Design Health Score

| # | Heurística | Nota | Ponto principal |
|---|---|---|---|
| 1 | Visibilidade do estado | 4 | Cada etapa mostra o estado (apagada, em curso, acesa) no esquema e na lista; a bateria enche e a tela do celular sobe de 0 a 100% |
| 2 | Linguagem do mundo real | 4 | Peças reais (TP4056, 2× 18650, diodo, boost), o cabo 3 em 1 com as três pontas e o LED azul |
| 3 | Controle e liberdade | 3 | Tudo no scroll, nos dois sentidos; reduced motion com estados parados; o modo pitch só chega na Fase 6 |
| 4 | Consistência | 3 | O código de cor da energia é o mesmo nos fios, nas etiquetas, na legenda e na tela do celular |
| 5 | Prevenção de erros | n/a | Sem formulários |
| 6 | Reconhecer em vez de lembrar | 3 | As 4 etiquetas ficam numeradas e legendadas desde que o esquema se forma (M3); no celular, o texto mostra a etapa em curso |
| 7 | Flexibilidade e eficiência | 2 | Atalhos do pitch só na Fase 6 |
| 8 | Estética e minimalismo | 3 | O esquema é limpo e a noite é calma; as placas ficam pequenas a 1440×900 e o painel dobrado pesa na cena da noite |
| 9 | Recuperação de erros | n/a | Fallback sem WebGL (diagrama em SVG) |
| 10 | Ajuda e documentação | n/a | Página de apresentação |
| **Total** | | **22/28** | **Bom (79%)** |

## Veredito de especificidade

O aceite da fase se cumpre: no meio de "Como funciona", as quatro etapas estão
visíveis e legendadas, e o caminho se lê sem o texto. A luz desce do sol
sobre o painel, a corrente laranja passa pelo diodo e pelo controlador, a
bateria enche de verde, e o azul sai do conversor ("3,7 V → 5 V") até o
celular. À noite, a caixa fecha, o LED acende e o celular carrega pelo cabo
3 em 1. É a história do produto, não um gráfico genérico de "energia".

## Problemas encontrados e corrigidos nesta fase

- [P0] O esquema saía da tela: o celular ficava fora, à direita, no desktop; no
  celular, a coluna era cortada em cima e passava por baixo do texto. Agora a
  posição de cada nó sai das medidas das peças (`EXTENT`) e dos vãos, as peças
  ficam agrupadas por etapa, e o enquadramento foi refeito com o `nodes.mjs`.
- [P0] O fade do celular ligava e desligava `transparent`, o que troca o
  programa do shader: compilação no meio da cena (a passada da TV estourava o
  tempo da foto; num celular de verdade, seria um engasgo). Agora os materiais
  são sempre transparentes.
- [P0] Com reduced motion no celular, o texto passava por cima do produto
  (1,18:1). Agora o produto rola junto com a seção, como uma figura, e o
  texto começa abaixo dela. As funções das peças e o texto das etapas voltam a
  aparecer (sem pin, há lugar).
- [P1] Os fios pareciam minhocas pretas com tracinhos, e os pulsos andavam com
  a cauda na frente. Agora o fio aceso tem a cor da etapa, a cabeça do pulso
  vai na frente, e a densidade sai do comprimento de cada fio.
- [P1] Fótons como poeira branca no céu claro. Agora são riscos de luz, com
  mistura normal, sempre de cima (com o sol baixo, atravessavam o esquema na
  horizontal) e mais fracos no fim da tarde.
- [P1] O nó da saída era um punhado de portas soltas no ar. Ganhou o espelho
  da frente da caixa no esquema.
- [P1] Os callouts de "Por dentro" voltavam à noite, quando a vista explodida
  se fecha. Agora só aparecem antes do caminho da energia.
- [P1] A entrada do cabo do painel ficava no ar quando a caixa descia. Passou
  para dentro do corpo da caixa.
- [P2] Etiquetas em alturas diferentes: agora numa linha só.
- [P2] A tela do celular, à noite, lia-se de lado: o celular virou para a câmera.
- [P2] As três pontas do cabo 3 em 1 formavam um X embolado: agora abrem em
  leque para o celular.
- [P2] O produto do diferencial ficava espremido no canto de baixo: câmera
  própria, um pouco mais alta.

## O que fica (sem bloquear)

- [P2] As placas são pequenas a 1440×900: a serigrafia não se lê, mas a forma
  sim. O Bloom da Fase 7 deve ajudar os pulsos a se destacarem.
- [P2] O painel dobrado é um bloco preto grande na cena da noite. É o produto;
  fica.
- [P3] O diodo é minúsculo na linha (é do tamanho real dele, ampliado 3,4×).

## Revisão de motion (Emil)

| Antes | Depois | Por quê |
| --- | --- | --- |
| Fótons em `AdditiveBlending` | Riscos com mistura normal, cabeça mais clara | Somar luz no céu claro vira branco; o risco diz para onde a luz vai |
| Pulso com a cauda na frente | `fract(t * speed - u * density)` | A direção da energia tem que ler certa |
| `transparent` ligando e desligando no fade | Sempre transparente, só a opacidade anima | Trocar o programa do shader no meio do scroll engasga |
| Texto da etapa (celular) trocando em crossfade simultâneo | Sai em 120 ms; entra em 220 ms, 100 ms depois | Dois blocos de texto sobrepostos ficam ilegíveis |
| Último fio desenhado antes de o celular chegar | O fio espera o celular (`phoneVisible`) | Nada aponta para o vazio |
| Celular sumindo com um corte no fim da escala | Fade de opacidade, junto com a escala de 0,9 | Nada some do nada |

Mantidos: etiquetas entram com a camada (opacidade 240 ms, ease-out-quart) e
mudam de estado em 220 ms; a pastilha da lista em 200 ms; tudo o mais segue o
scroll (scrub) com damping no `useFrame`. Com reduced motion, os fios ficam
acesos e parados e os fótons saem.
