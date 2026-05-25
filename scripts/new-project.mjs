import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

const rawArgs = process.argv.slice(2);
const dryRun = rawArgs.includes('--dry-run');
const args = rawArgs.filter((arg) => arg !== '--dry-run');
const [slug, nameArg, descriptionArg = ''] = args;

function usage() {
  console.log('Usage: npm run new-project -- <slug> "Project Name" "Description" [--dry-run]');
}

function titleFromSlug(value) {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function validSlug(value) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function writeJson(path, value) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function file(path, content) {
  return { path, content };
}

if (!slug || !validSlug(slug)) {
  usage();
  throw new Error('Provide a lowercase kebab-case project slug.');
}

const name = nameArg || titleFromSlug(slug);
const projectDir = join(repoRoot, 'projects', slug);
const projectsPath = join(repoRoot, 'projects.json');
const packagePath = join(repoRoot, 'package.json');
const projects = await readJson(projectsPath);
const packageJson = await readJson(packagePath);

if (existsSync(projectDir)) throw new Error(`Project already exists: projects/${slug}`);
if (projects.some((project) => project.id === slug)) throw new Error(`projects.json already contains id: ${slug}`);

const files = [
  file(join(projectDir, 'index.html'), `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${name}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    html, body, #root { margin: 0; min-height: 100%; background: #f0eee9; }
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="./src/app.jsx"></script>
</body>
</html>
`),
  file(join(projectDir, 'vite.config.js'), `import { defineConfig } from 'vite';
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
`),
  file(join(projectDir, 'src', 'colors_and_type.css'), `:root {
  --project-bg: #f6f2ea;
  --project-ink: #27231d;
  --project-muted: rgba(39, 35, 29, 0.62);
  --project-card: #fffaf1;
  --project-accent: #a85f3f;
}

* { box-sizing: border-box; }
`),
  file(join(projectDir, 'src', 'prototypes', 'StarterArtboard.jsx'), `import React from 'react';

export function StarterArtboard({ variant }) {
  return (
    <main
      style={{
        width: 1200,
        height: 800,
        display: 'grid',
        placeItems: 'center',
        background: variant === 'warm' ? 'var(--project-card)' : 'var(--project-bg)',
        color: 'var(--project-ink)',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <section style={{ width: 680 }}>
        <p style={{ margin: '0 0 12px', color: 'var(--project-accent)', fontSize: 14, fontWeight: 700, letterSpacing: 0 }}>
          ${name}
        </p>
        <h1 style={{ margin: 0, fontSize: 56, lineHeight: 1.02, fontWeight: 720, letterSpacing: 0 }}>
          Starter artboard
        </h1>
        <p style={{ margin: '22px 0 0', color: 'var(--project-muted)', fontSize: 22, lineHeight: 1.45 }}>
          Replace this with the first real prototype component for the project.
        </p>
      </section>
    </main>
  );
}
`),
  file(join(projectDir, 'src', 'app.jsx'), `import React from 'react';
import { createRoot } from 'react-dom/client';
import {
  ProjectShell,
  DCSection,
  DCArtboard,
  useTweaks,
  TweaksPanel,
  TweakSection,
} from '../../../src/design-tool/index.jsx';

import './colors_and_type.css';
import { StarterArtboard } from './prototypes/StarterArtboard.jsx';

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "variant": "plain"
}/*EDITMODE-END*/;

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  return (
    <>
      <ProjectShell title="${name}">
        <DCSection id="exploration" title="Exploration">
          <DCArtboard id="starter" label="Starter" width={1200} height={800}>
            <StarterArtboard variant={tweaks.variant} />
          </DCArtboard>
        </DCSection>
      </ProjectShell>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Variant" />
        <div style={{ display: 'flex', gap: 6 }}>
          {['plain', 'warm'].map((variant) => (
            <button
              key={variant}
              type="button"
              onClick={() => setTweak('variant', variant)}
              style={{
                appearance: 'none',
                flex: 1,
                minHeight: 32,
                border: 0,
                borderRadius: 7,
                background: tweaks.variant === variant ? 'rgba(0,0,0,.78)' : 'rgba(0,0,0,.06)',
                color: tweaks.variant === variant ? '#fff' : 'inherit',
                font: '600 11px/1.2 ui-sans-serif, system-ui, -apple-system, sans-serif',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {variant}
            </button>
          ))}
        </div>
      </TweaksPanel>
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
`),
];

const nextProjects = [
  ...projects,
  {
    id: slug,
    name,
    description: descriptionArg,
    urlPath: `projects/${slug}/`,
  },
];

const nextPackageJson = {
  ...packageJson,
  scripts: {
    ...packageJson.scripts,
    [`dev:${slug}`]: `vite --config projects/${slug}/vite.config.js`,
    [`build:${slug}`]: `vite build --config projects/${slug}/vite.config.js`,
    [`preview:${slug}`]: `vite preview --config projects/${slug}/vite.config.js`,
  },
};

if (dryRun) {
  console.log(`Would create project ${slug}:`);
  for (const planned of files) console.log(`  create ${relative(repoRoot, planned.path)}`);
  console.log('  update projects.json');
  console.log('  update package.json scripts');
  process.exit(0);
}

for (const planned of files) {
  await mkdir(dirname(planned.path), { recursive: true });
  await writeFile(planned.path, planned.content, 'utf8');
}

await writeJson(projectsPath, nextProjects);
await writeJson(packagePath, nextPackageJson);

console.log(`Created projects/${slug}/`);
