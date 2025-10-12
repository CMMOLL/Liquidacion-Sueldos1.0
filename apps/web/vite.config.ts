import { defineConfig } from 'vite';

export default defineConfig({
  root: './src',         // donde pusimos index.html y assets
  build: {
    outDir: '../dist',   // salida dentro de apps/web/dist
    emptyOutDir: true
  },
  server: {
    port: 5173,
    strictPort: true
  }
});
