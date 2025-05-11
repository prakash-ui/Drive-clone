import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';

export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  
  // Base URL (critical for production)
  base: command === 'serve' ? '' : '/', 

  // Production build settings
  build: {
    outDir: './dist', // Output to backend's public folder
    emptyOutDir: true,
    sourcemap: true // Helpful for debugging
  },

  // Dev server proxy (avoids CORS during development)
  server: {
    proxy: {
      '/api': {
        target: 'https://drive-clone-c0af.onrender.com', // Your backend URL
        changeOrigin: true,
        secure: false
      }
    }
  }
}));