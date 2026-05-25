import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { designToolDevPlugins } from '../../src/design-tool/vite-plugins.mjs';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));
const repoRoot = fileURLToPath(new URL('../../', import.meta.url));
const entryHtml = fileURLToPath(new URL('index.html', import.meta.url));

export default defineConfig({
  root: projectRoot,
  plugins: [
    react(),
    ...designToolDevPlugins({ root: projectRoot }),
  ],
  server: {
    open: '/',
    fs: {
      allow: [projectRoot, repoRoot],
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: entryHtml,
    },
  },
});
