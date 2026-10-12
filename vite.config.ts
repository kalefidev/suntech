import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type Plugin } from "vite";

/**
 * Preload da fonte do hero (o título é o LCP). O arquivo sai do build com hash,
 * então o link é injetado depois do bundle pronto.
 */
function preloadFont(match: string): Plugin {
  return {
    name: "suntech:preload-font",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler(_html, ctx) {
        const font = Object.values(ctx.bundle ?? {}).find(
          (file) => file.type === "asset" && file.fileName.includes(match),
        );
        if (!font) return;
        return [
          {
            tag: "link",
            attrs: { rel: "preload", as: "font", type: "font/woff2", href: `/${font.fileName}`, crossorigin: "" },
            injectTo: "head-prepend",
          },
        ];
      },
    },
  };
}

/**
 * Tags sociais com URL absoluta (seção 12 do brief): a imagem do Open Graph
 * (`public/og.png`, 1200×630, gerada do hero por `npm run og`), o `og:url`,
 * o canônico e o card grande do Twitter/X. A URL vem de `SITE_URL` ou, na
 * Vercel, do domínio de produção (`VERCEL_PROJECT_PRODUCTION_URL`). Sem ela,
 * as tags com URL ficam de fora (uma imagem com caminho relativo não aparece
 * nas prévias de link).
 */
function socialTags(): Plugin {
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const site = (process.env.SITE_URL ?? (vercel ? `https://${vercel}` : "")).replace(/\/$/, "");
  return {
    name: "suntech:social-tags",
    apply: "build",
    transformIndexHtml() {
      const card = { tag: "meta", attrs: { name: "twitter:card", content: "summary_large_image" }, injectTo: "head" as const };
      if (!site) {
        this.warn("SITE_URL não definido: og:image, og:url e o canônico ficam de fora do build.");
        return [card];
      }
      const meta = (attrs: Record<string, string>) => ({ tag: "meta", attrs, injectTo: "head" as const });
      return [
        card,
        meta({ property: "og:url", content: `${site}/` }),
        meta({ property: "og:image", content: `${site}/og.png` }),
        meta({ property: "og:image:width", content: "1200" }),
        meta({ property: "og:image:height", content: "630" }),
        meta({ property: "og:image:alt", content: "O Carregador Solar SunTech fechado, sobre fundo claro: a caixa preta com o painel solar dobrável em pé atrás dela, ao lado do título “Carregue o celular com a luz do sol.”" }),
        meta({ name: "twitter:image", content: `${site}/og.png` }),
        { tag: "link", attrs: { rel: "canonical", href: `${site}/` }, injectTo: "head" as const },
      ];
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), preloadFont("archivo-latin-wdth-normal"), socialTags()],
  build: {
    // O manifest deixa o `snap` medir o JS inicial e o total por chunk (seção 11 do brief).
    manifest: true,
    // O chunk 3D (three, R3F e pós-processamento, ~1,1 MB sem gzip) carrega
    // sob demanda, depois do texto; o orçamento que vale é o de gzip, que o
    // `snap` mede (inicial ≤ 150 KB, total ≤ 500 KB).
    chunkSizeWarningLimit: 1200,
  },
});
