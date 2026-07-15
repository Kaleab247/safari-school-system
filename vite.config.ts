// vite.config.ts
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { copyFileSync } from 'fs';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'copy-headers',
        buildEnd() {
          try {
            copyFileSync('public/_headers', 'dist/_headers');
            console.log('✅ _headers copied to dist');
          } catch (e) {
            console.log('⚠️ Could not copy _headers');
          }
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      outDir: 'dist',
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
        },
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
          },
        },
      },
      sourcemap: true,
      minify: 'terser',
    },
  };
});