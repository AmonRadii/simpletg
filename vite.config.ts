import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import devtools from 'solid-devtools/vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [devtools(), solidPlugin(), tailwindcss(), nodePolyfills({
      protocolImports: true,
    }),
  ],
  worker: { format: "es" },
  server: {
    port: 3000,
  },
  optimizeDeps: {
    // TODO remove once fixed https://github.com/vitejs/vite/issues/8427
    exclude: ["@livestore/wa-sqlite"],
  },
  build: {
    target: 'esnext',
  },
});
