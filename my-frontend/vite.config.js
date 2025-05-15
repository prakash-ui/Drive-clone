import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true
  },
  server: {
    port: 5173,
    strictPort: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'https://drive-clone-b4eg.onrender.com',
        changeOrigin: true,
        secure: false
      }
    }
  },
  resolve: {
    extensions: ['.mjs', '.js', '.jsx', '.json']
  }
};

export default defineConfig(config);