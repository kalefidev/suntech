# SunTech: site do Carregador Solar SunTech

Site de produto da SunTech, empresa de estudantes do Colégio Ideal, feito
para a Feira de Empreendedorismo. A v3 (branch `v3`) abre com o carregador em 3D
grande no centro da tela: ao rolar, ele abre, se desmonta peça por peça e cada
componente ganha o foco (painel, carga, células e saída), até a remontagem e a
cena de energia. As seis partes das aulas do projeto (problema, cliente,
solução, empresa, pitch e o papel do jovem) voltam depois dela, na Fase 2 da v3.
**Estado atual: a cena do produto está pronta; as seis partes e o modo pitch
ainda não estão montados na página** (ver `ONDE-PARAMOS-V3.md`).

O produto é um modelo 3D (`public/models/suntech.glb`) gerado por código
(`npm run model`; licença em `public/models/LICENSE.md`). As texturas são
desenhadas em canvas no navegador e a luz do ambiente é local. Não há ativos
vindos de CDN nem backend.

## Como rodar

Precisa do Node 22.12 ou mais novo (ou 20.19+).

```bash
npm install
npm run dev        # http://localhost:5173
```

Outros comandos:

| Comando | O que faz |
|---|---|
| `npm run build` | Confere os tipos e gera o site em `dist/` |
| `npm run preview` | Serve o `dist/` (http://localhost:4173) |
| `npm run typecheck` / `npm run lint` | Tipos e lint |
| `npm run snap <nome>` | Build, orçamento de JS e fotos de cada seção em vários tamanhos, com o contraste medido nos pixels (`.snapshots/<nome>/`) |
| `npm run test:pitch` | Testa o modo pitch: 180 s exatos, pausa no Espaço e saída no Esc (rode o build antes) |
| `npm run check:numbers` | Garante que nenhum número está escrito à mão nos componentes |
| `npm run og` | Gera `public/og.png` (a imagem das prévias de link) a partir do hero (rode o build antes) |
| `npm run model:install` / `npm run model` | Instala (uma vez) e roda o gerador do modelo 3D em `scripts/model/`, que grava `public/models/suntech.glb` (não sobrescreve o modelo feito à mão) |
| `npm run model:view` | Folhas de contato do modelo, para conferir as peças |
| `npm run model:import` | Publica o modelo feito à mão no Blender (`models-src/suntech.glb`): confere o contrato, comprime e grava `public/models/suntech.glb`. Passo a passo em `docs/v3-modelo-a-mao.md` |
| `npm run model:check` | Confere um GLB contra o contrato de peças (nomes, pivôs, âncoras, UV, tamanho) |
| `npm run model:reference` | Regrava só o molde para importar no Blender (`scripts/model/.cache/suntech.raw.glb`) |

O `snap`, o `test:pitch` e o `og` usam o Playwright. Na primeira vez, rode
`npx playwright install chromium`.

## Como publicar na Vercel

1. Suba o repositório para o GitHub.
2. Na Vercel, **Add New → Project** e escolha o repositório. A Vercel
   reconhece o Vite: build `npm run build`, saída `dist`. Não precisa mudar
   nada.
3. **Deploy.** As tags de prévia de link (imagem, `og:url` e canônico) usam o
   domínio de produção da Vercel automaticamente. Com um domínio próprio,
   defina a variável `SITE_URL` (por exemplo, `https://suntech.com.br`) em
   **Settings → Environment Variables** e publique de novo.

Antes de publicar uma versão nova, rode `npm run og` se o hero mudou, para a
imagem de prévia acompanhar.

## Como editar os textos

Todo o conteúdo fica em `src/content/`, e só ali:

| Arquivo | O que tem |
|---|---|
| `company.ts` | A empresa: quem somos, missão, visão, valores, operações, equipe e história |
| `product.ts` | O produto: ficha técnica, custos, preço e as estimativas (sempre rotuladas) |
| `feira.ts` | As partes da página, os dados externos com as fontes e o roteiro do pitch (paradas e segundos) |
| `copy.ts` | Os textos da página (títulos, parágrafos, botões) |
| `format.ts` | Formatação brasileira de números, reais e unidades |

Regras: os números vêm só desses arquivos (o `npm run check:numbers`
confere), estimativas aparecem com o rótulo "estimativa" e dado externo sempre
leva a fonte.

**Medidas e peso do produto:** em `product.ts`, as
medidas e o peso são **fictícios** por enquanto (o protótipo ainda não foi
medido) e aparecem na ficha técnica com o rótulo "ilustrativo". Quando houver
os reais, troque os valores (milímetros e gramas) e tire o `illustrative` das
linhas em `specSheet`.

**Modo pitch:** a sequência (quais seções e em que segundo) está em
`pitchStops`, no `feira.ts`. O total é `PITCH_SECONDS` (180).

## Como medir o FPS

Abra o site com `?debug` no fim do endereço (por exemplo,
`http://localhost:4173/?debug` ou `https://seu-dominio/?debug`). Aparece, no
canto superior esquerdo, o painel do `r3f-perf` (FPS, tempo de GPU e de CPU,
chamadas de desenho) e, à direita, o painel do Leva.

- **No PC:** rode `npm run build` e `npm run preview`, abra
  `http://localhost:4173/?debug` no Chrome e role a página inteira devagar.
  Anote o FPS nas cenas do produto ("Por dentro", "Como funciona" e "A energia
  fica"). A meta é 55 fps ou mais.
- **No celular:** com o PC e o celular na mesma rede Wi-Fi, rode
  `npm run preview -- --host`, abra no celular o endereço "Network" que
  aparece no terminal, com `?debug` no fim. A meta é 30 fps estáveis. Se
  cair, o site baixa o nível de qualidade sozinho (menos partículas, sombra
  mais simples, sem pós-processamento).

Outras opções no endereço: `?nowebgl` mostra a versão sem 3D, e
`?goto=<seção>` pula para uma seção (por exemplo, `?goto=como-funciona`).

## Para quem for mexer no código

Leia o `CLAUDE.md` (regras de arquitetura e comandos), o `BRIEF.md` (o
briefing completo) e o `PROGRESS.md` (estado e decisões de cada fase).

Conceito de produto criado a partir do protótipo da equipe SunTech, num
projeto escolar do Colégio Ideal. Design e código do site: Kaique Calefi.
