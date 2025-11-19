import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync } from 'fs';
import { join } from 'path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-redirects',
      closeBundle() {
        // Copy _redirects file to dist folder after build
        try {
          copyFileSync(
            join(__dirname, 'public', '_redirects'),
            join(__dirname, 'dist', '_redirects')
          );
        } catch (error) {
          console.warn('Could not copy _redirects file:', error);
        }
      }
    }
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
});

