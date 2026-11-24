// vite.config.ts - Multi-page Vite configuration for SimCity Saves static files
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, 'index.html'),
        browse: path.resolve(__dirname, 'browse.html'),
        save: path.resolve(__dirname, 'save.html'),
        upload: path.resolve(__dirname, 'upload.html'),
        how: path.resolve(__dirname, 'how.html'),
      },
    },
  },
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
});
