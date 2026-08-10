// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  // Fixa o diretório de saída em `dist` (dist/client = estáticos, dist/server = servidor).
  // Evita que presets Node gerem `.output` em hospedagens externas (Hostinger, VPS, CI).
  // Dentro do build da Lovable o preset/layout Cloudflare continua sendo forçado.
  nitro: {
    output: { dir: "dist", publicDir: "dist/client", serverDir: "dist/server" },
  },
});

