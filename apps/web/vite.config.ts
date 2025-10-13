// apps/web/vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  root: './src',
  build: {
    // desde apps/web/src → .. (web) → .. (apps) → .. (raíz) → docs
    outDir: '../../../docs',
    emptyOutDir: true
  },
  server: {
    port: 5173,
    strictPort: true
  },
  base: ''
});
