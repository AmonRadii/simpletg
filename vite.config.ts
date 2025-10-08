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
  
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
});
