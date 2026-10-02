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

export default defineConfig({
  plugins: [react(), tailwindcss(), preloadFont("archivo-latin-wdth-normal")],
  // O manifest deixa o `snap` medir o JS inicial e o total por chunk (seção 11 do brief).
  build: { manifest: true },
});
