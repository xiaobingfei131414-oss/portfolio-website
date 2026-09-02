import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [tailwindcss()],
  esbuild: { jsx: 'automatic' },
  build: {
    copyPublicDir: !isSsrBuild,
    rollupOptions: isSsrBuild ? { output: { entryFileNames: 'entry-server.mjs' } } : undefined,
  },
}));
