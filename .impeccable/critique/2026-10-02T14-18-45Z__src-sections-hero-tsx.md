---
target: hero e abertura (Fase 2)
total_score: 21
max_score: 28
na_heuristics: 5,9,10
p0_count: 2
p1_count: 3
target_identity: "file:C:\\Users\\User\\Desktop\\Claude Code\\Projetos\\site-sistema\\Bateria solar\\src\\sections\\Hero.tsx"
target_fingerprint: "sha256:e747a9eccd60d3d71178f6aae8a58c33ee8e53997c991521f7800a59b8e6543c"
target_path: "C:\\Users\\User\\Desktop\\Claude Code\\Projetos\\site-sistema\\Bateria solar\\src\\sections\\Hero.tsx"
timestamp: 2026-10-02T14-18-45Z
slug: src-sections-hero-tsx
---
⚠️ DEGRADED: single-context (subagentes só com pedido explícito do usuário nesta sessão; a avaliação A foi feita antes do detector)

# Crítica da Fase 2 (produto, abertura e hero), 02/10/2026

Imagens: `.snapshots/fase-2/` (1440×900 e 390×844), `.snapshots/fase-2-dev/crop-hero.png`
(recorte ampliado) e `.snapshots/opening/` (a abertura quadro a quadro, em câmera lenta).

## Design Health Score

| # | Heurística | Nota | Ponto principal |
|---|---|---|---|
| 1 | Visibilidade do estado | 3 | Loader com progresso real; a abertura mostra a cena montando |
| 2 | Linguagem do mundo real | 4 | O produto é reconhecível: painel dobrável em pé, como um livro aberto, e a caixa ligada pelo cabo |
| 3 | Controle e liberdade | 3 | A abertura pula com qualquer gesto; modo pitch só na Fase 6 |
| 4 | Consistência | 3 | A luz do produto segue a mesma hora do céu |
| 5 | Prevenção de erros | n/a | Sem formulários |
| 6 | Reconhecer em vez de lembrar | 3 | Navegação rotulada |
| 7 | Flexibilidade e eficiência | 2 | Atalhos do pitch só na Fase 6 |
| 8 | Estética e minimalismo | 3 | Hero limpo; o halo do sol no celular disputa um pouco com o produto |
| 9 | Recuperação de erros | n/a | Fallback sem WebGL cobre a falha técnica |
| 10 | Ajuda e documentação | n/a | Página de apresentação |
| **Total** | | **21/28** | **Bom (75%)** |

## Veredito de especificidade

O hero agora é do produto e de mais ninguém: o painel em pé abre como um livro
sobre a linha do horizonte, a caixa preta fica na frente, o cabo liga os dois e
o sol nasce atrás deles. A abertura conta a função do produto em 2,4 s
(madrugada, primeiro raio, o painel abre, o reflexo corre pelas células, o
cabo liga). Detector (`impeccable detect` em Hero.tsx e index.css): nenhum
anti-padrão; só os avisos de escala já conhecidos.

## Checklist da receita de estúdio (aceite da Fase 2)

- Toda borda tem brilho: sim (tiras laterais e bisel de 2,5 mm na caixa).
- Nenhuma face chapada: sim (o lado escuro da caixa tem degradê).
- Sombra de contato: sim (depois da correção do plano do desfoque).
- Sem z-fighting nem serrilhado em DPR 1: sim (antialias nativo ligado).
- O preto se lê como material: sim (fresta, parafusos, logo em baixo-relevo).

## Problemas encontrados e corrigidos nesta fase

- [P0] Imagem esticada: o `setViewOffset` redefinia o aspecto da câmera.
- [P0] Sombra de contato invisível (plano do desfoque fora da câmera) e, antes
  disso, um bloco preto (alvo limpo com alfa 1).
- [P1] Serrilhado em DPR 1 (antialias desligado à espera do composer).
- [P1] Raio de sol invisível (uniforms copiados pelo R3F; `pow` com base
  negativa) e nascendo abaixo do horizonte.
- [P1] No celular, o texto do hero rolava por cima do produto: o produto
  agora sobe junto com o hero.
- [P2] Lâmina de fundo das células clara demais (quadriculado).

## Ficam para depois

- [P2] Halo do sol no celular (guarda de contraste solta perto do sol): bonito
  atrás do produto, mas forte no começo da Parte 1. Rever na Fase 3.
- [P3] A linha do loader cruza a caixa nos primeiros 0,9 s da abertura.
