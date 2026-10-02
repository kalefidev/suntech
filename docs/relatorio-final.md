# Relatório final: site do Carregador Solar SunTech (v2)

02/10/2026, branch `v2`. Detalhes de cada fase (decisões técnicas, `snap` e
crítica) estão no `PROGRESS.md`.

## O que foi feito

| Fase | Entrega | Aceite |
|---|---|---|
| 0 | Plano revisado (M1 a M8), aprovado em 01/10 | Aprovado |
| 1 | Fundação: céu em shader por hora do dia, timeline mestre de scroll, seções, tiers, `snap` com contraste medido nos pixels | O céu passa por todas as horas; build limpo; `snap` por seção |
| 2 | Produto procedural (painel dobrável, caixa, cabo), texturas em canvas, luz de estúdio, sombra de contato, abertura de 2,4 s | O hero parece fotografado em estúdio |
| 3 | Partes 1 e 2: aberturas de capítulo, contadores, dados com fonte, persona e os 40 km | Todo o conteúdo das Aulas 2 e 3, legível e com fontes |
| 4 | Parte 3: "Por dentro" (vista explodida e callouts), "Como funciona" (o esquema com o caminho da energia), "A energia fica" (a noite, o cabo 3 em 1, o celular carregando) e o diferencial | No meio de "Como funciona", as 4 etapas visíveis e legendadas, e o caminho lido sem o texto |
| 5 | Parte 4: cartão de embarque com picote, setores, custos com barras, ficha técnica e história | Nenhum número fora da seção 3 (`npm run check:numbers`) |
| 6 | Partes 5 e 6: linha do tempo, modo pitch com HUD, manifesto, final com botão magnético, rodapé | 180 s exatos, Espaço pausa, Esc sai (`npm run test:pitch`) |
| 7 | Pós-processamento, cursor, SEO e Open Graph, LCP protegido, auditoria de acessibilidade, README | Checklist abaixo |

## Checklist final (seção 15 do brief)

**Técnico**
- [x] `typecheck`, `lint` e `build` sem erros e sem avisos relevantes. O build
  avisa que `SITE_URL` não está definido (esperado até haver o domínio de
  produção).
- [x] Nenhum erro no console, no desktop e no celular (o `snap` falha com
  qualquer erro; as 7 passadas passaram).
- [x] Snap final revisado imagem por imagem (`.snapshots/fase-7-final/`: 1440×900,
  390×844, os dois com reduced motion, TV 1920×1080, tablet 768×1024 e
  `?nowebgl`, 33 fotos cada).
- [x] Reduced motion e fallback sem WebGL testados (passadas próprias no
  `snap`; o modo pitch com reduced motion no `test:pitch`).
- [x] Contraste AA em todas as horas do dia (medido nos pixels reais em cada
  foto: 0 violações).
- [x] Orçamento de performance cumprido, com um ponto a medir por você:
  - JS inicial: 137,7 KB gzip (teto 150); total: cerca de 433 KB (teto 500).
  - LCP: 308 ms; 968 ms com a CPU 4× mais lenta (teto de 2 s). CLS 0.
  - FPS: 15 ms por quadro em 1080p numa GTX 1060 (~66 fps). A meta do
    brief é para GPU integrada (55 fps) e celular intermediário (30 fps): não
    tenho como medir aqui. As instruções estão no README ("Como medir o
    FPS"), e o site baixa o tier sozinho se o FPS cair.
- [x] Achados da `impeccable` e das skills do Emil resolvidos ou justificados:
  - críticas por fase em `.impeccable/critique/`, de 21 a 24/28;
  - o detector da `impeccable` dá 0 achados;
  - o axe-core dá 0 violações (desktop, celular, reduced motion e com o HUD
    do pitch);
  - as revisões de motion de cada fase estão nas críticas.
- [x] Instruções para medir o FPS com `?debug` no PC e no celular (README).
- [x] `README.md`, `CLAUDE.md` e `PROGRESS.md` atualizados, e este relatório.

**Conteúdo das aulas (na ordem da página)**
- [x] Aula 2: lista de oportunidades, os 3 problemas da pergunta norteadora,
  a situação-problema e por que ela importa para a sociedade.
- [x] Aula 3: persona (Seu Antônio e as características), "Nosso cliente
  é...", as 3 perguntas da reflexão e persona × público-alvo.
- [x] Aula 4: caça ao diferencial (as 4 perguntas, com a d.light), o que
  oferecemos, como melhora a vida do cliente e o que fazemos de diferente.
- [x] Aula 5: propósito, destino, trajeto e operações; os 3 setores; custos e
  preço; o protótipo, com a ficha técnica e a história.
- [x] Aula 6: o pitch em 3 minutos, com problema e persona, solução e valor,
  quem apresenta cada parte e o preço justo.
- [x] AQ3: o papel do jovem no empreendedorismo do futuro.
- [x] Todo número vem da seção 3 (`npm run check:numbers`); estimativas
  rotuladas; dados externos com fonte (revalidadas no navegador na Fase 3).

## Desvios do brief e por quê

1. **O `snap` usa a GPU da máquina, não o SwiftShader** (seção 12).
   - Com a cena completa, o SwiftShader levava de 25 a 55 s por foto e
     estourava o tempo na passada da TV.
   - Ele também baixava o tier, então as fotos não mostravam o visual real.
   - Com a GPU (ANGLE sobre D3D11), são ~15 ms por quadro.
   - `SNAP_GL=swiftshader` volta ao que o brief pede.
   - A espera em cada ponto subiu de ~900 para 1.500 ms: com quadros reais, o
     damping da câmera leva esse tempo para assentar.
2. **Cursor com a seta do sistema** (seção 9).
   - O círculo acompanha a seta em vez de substituí-la.
   - Esconder a seta ignoraria o tamanho de cursor que a pessoa configurou no
     sistema, uma questão de acessibilidade.
3. **Sem vinheta.**
   - Foi o efeito que saiu na autocrítica pedida na Fase 7: não tinha papel na
     história e escurecia os cantos onde ficam o header e o texto.
   - Ficaram o Bloom (nos pulsos de energia, no LED, nos fótons e no sol) e o
     grão de filme.
4. **O produto fica fora da tela do celular nas Partes 1, 2, 4, 5 e 6.**
   - Nelas, o texto ocupa a largura toda e o produto ficaria por baixo dele.
   - O plano já previa isso para a Parte 4; estendi para as Partes 5 e 6.
5. **Reduced motion no celular: o produto rola junto com cada cena**, como uma
   figura no alto dela, em vez de ficar fixo.
   - Sem pins, o texto passava por cima do produto.
   - Rolar junto com a página não é animação: é o próprio scroll.
6. **O Open Graph com URL absoluta depende do domínio.**
   - A imagem já está pronta (`public/og.png`).
   - As tags com URL entram quando houver `SITE_URL` ou, na Vercel, o domínio
     de produção (lido sozinho no build).

## Pendências suas (nenhuma bloqueia a publicação)

- **`/review-animations`** das Fases 4 e 6: só você pode disparar. Aplico os
  achados quando chegarem.
- **d.light:** o site diz "mais de 150 milhões" (seção 3). As fontes hoje
  falam em 175 milhões (Earthshot) e 215 milhões (d.light). Quer atualizar?
- **F6:** confirmar no protótipo que o boost sai do OUT do módulo TP4056. Se
  der, medir o tempo de carga e quantas cargas de celular a bateria rende.
- **Medidas e peso** do produto (`product.ts`, campos `// TODO: preencher`):
  o 3D e a ficha técnica se ajustam sozinhos.
- **Fotos** em `referencias/` (opcional) e **nomes da equipe** (só com
  autorização de cada um).
- **Domínio de produção:** defina `SITE_URL` na Vercel se não for usar o
  domínio da própria Vercel.
- **FPS** no seu PC e no seu celular, com `?debug` (README).
