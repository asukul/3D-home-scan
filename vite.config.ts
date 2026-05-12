import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const windowsCacheDir = process.env.LOCALAPPDATA
  ? `${process.env.LOCALAPPDATA}/3d-home-scan/vite`
  : undefined;
const windowsBuildDir = process.env.LOCALAPPDATA
  ? `${process.env.LOCALAPPDATA}/3d-home-scan/dist`
  : undefined;

export default defineConfig({
  plugins: [react()],
  cacheDir: process.env.VITE_CACHE_DIR ?? windowsCacheDir ?? 'node_modules/.vite',
  build: {
    outDir: process.env.VITE_BUILD_OUT_DIR ?? windowsBuildDir ?? 'dist',
    emptyOutDir: true,
    target: 'es2022',
    sourcemap: true,
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks: {
          viewer: ['@google/model-viewer'],
          react: ['react', 'react-dom'],
        },
      },
    },
  },
  server: {
    port: 5173,
    strictPort: false,
  },
});
