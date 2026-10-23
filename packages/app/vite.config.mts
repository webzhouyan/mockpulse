import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  root: resolve(import.meta.dirname),
  build: {
    outDir: resolve(import.meta.dirname, 'dist/renderer'),
    emptyOutDir: true,
    target: 'chrome119',
    rollupOptions: {
      input: resolve(import.meta.dirname, 'index.html')
    }
  },
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'src/renderer'),
      'src': resolve(import.meta.dirname, 'src')
    }
  },
  server: {
    port: 4200
  }
});
