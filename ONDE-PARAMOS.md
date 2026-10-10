> **Obsoleto: é o estado da v2.** Para a v3 (branch `v3`), leia o **`ONDE-PARAMOS-V3.md`**.

# Onde paramos: SunTech v2

> **Para retomar, diga:** "Leia o ONDE-PARAMOS.md e continue de onde paramos."

**Última atualização:** 02/10/2026, com **as 7 fases fechadas** (branch `v2`). O site está **no ar em https://suntech-ten.vercel.app** (código em https://github.com/kalefidev/suntech; cada push na `main` publica de novo).

Tudo está commitado na branch `v2`. O `ONDE-PARAMOS-CODIGO.md` é uma cópia antiga do código (de 01/10) e não serve mais: o código está no git.

---

## Onde está cada coisa

| Arquivo | O que é |
|---|---|
| `docs/relatorio-final.md` | **Relatório final:** o que foi feito, o checklist da seção 15, os desvios e por quê, e as suas pendências |
| `README.md` | Como rodar, publicar na Vercel, editar os textos e medir o FPS |
| `PROGRESS.md` | Decisões técnicas, `snap` e crítica de cada fase |
| `BRIEF.md` / `docs/fase-0.md` | O briefing e o plano aprovado |
| `CLAUDE.md` | Regras para o Claude (stack, comandos, arquitetura) |

## Linha do tempo

- **27/09:** v1, com o brief antigo (branch `master`, intocada).
- **28/09 e 01/10:** Fase 0 da v2 revisada e aprovada (M1 a M8).
- **02/10:** Fases 1 a 7 fechadas, cada uma com `snap`, crítica, revisão de motion e commit.

## O que dá para fazer agora

1. **Medir o FPS** no seu PC e no seu celular com `?debug` (README).
2. **Responder as pendências** (abaixo), quando puder.

Feito em 02/10, depois das fases: a `/review-animations` (achados aplicados), o número da d.light (215 milhões, da própria empresa) e os nomes da equipe.

## Pendências suas (nenhuma bloqueia)

- **F6:** confirmar no protótipo que o boost está ligado nos furos OUT+ e OUT− do módulo TP4056 (e não direto na bateria, no B+ e B−); se der, medir o tempo de carga e quantas cargas de celular a bateria rende.
- **Medidas e peso** do produto (`src/content/product.ts`, campos `// TODO: preencher`) e **fotos** em `referencias/`, quando existirem.

## Comandos

```
npm run dev            # servidor de desenvolvimento
npm run build          # tipos + build
npm run preview        # serve o build
npm run snap <nome>    # fotos de cada seção, contraste e orçamento (uns 12 min na GPU)
npm run test:pitch     # o modo pitch com relógio falso (rode o build antes)
npm run check:numbers  # nenhum número escrito à mão nos componentes
npm run og             # gera a imagem de prévia de link (rode o build antes)
```
