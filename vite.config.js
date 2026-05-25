import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import { join } from 'node:path';
import { designToolDevPlugins } from './src/design-tool/vite-plugins.mjs';

const root = fileURLToPath(new URL('.', import.meta.url));
const projects = JSON.parse(readFileSync(join(root, 'projects.json'), 'utf8'));

const inputs = {
  main: fileURLToPath(new URL('index.html', import.meta.url)),
  ...Object.fromEntries(projects.map((project) => [
    project.id,
    fileURLToPath(new URL(`${project.urlPath}index.html`, import.meta.url)),
  ])),
};

export default defineConfig({
  plugins: [
    react(),
    ...designToolDevPlugins({ root }),
  ],
  server: {
    open: '/',
  },
  build: {
    rollupOptions: {
      input: inputs,
    },
  },
});
