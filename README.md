# AI Design Tool

A Vite/React workspace for small design prototype projects.

## Idea

Each design project is a normal React app.

The project owns its prototype components, data, styling, and tweak defaults.
The shared design tool runtime lives in `src/design-tool`.

## Project Apps

Project entry files live at `projects/<slug>/src/app.jsx`.

Each app describes its artboards with three shared primitives:

- `ProjectShell`
- `DCSection`
- `DCArtboard`

## Runtime Modes

`ProjectShell` chooses the right shell for the environment.

Dev mode uses the design canvas. It has pan, zoom, reorder, edit controls,
and canvas state writes.

Production uses the presenter. It has a gallery, fullscreen artboard view, and
readable hash links. It does not include reorder, delete, or canvas state writes.

## Links

Local:

- `http://localhost:5173/`
- `http://localhost:5173/projects/leveringstidslinje/`
- `http://localhost:5173/projects/leveringstidslinje/#forside/hojvang-okologi-forside`
- `http://localhost:5173/projects/leveringstidslinje/#leveringstidslinje/bestilling`
- `http://localhost:5173/projects/leveringstidslinje/#leveringstidslinje/forudbestilling`

GitHub Pages:

- `https://christofferhbs.github.io/ai-design-tool/`
- `https://christofferhbs.github.io/ai-design-tool/projects/leveringstidslinje/`
- `https://christofferhbs.github.io/ai-design-tool/projects/leveringstidslinje/#forside/hojvang-okologi-forside`

## Commands

```bash
npm install
npm run dev
npm run dev:leveringstidslinje
npm run build
```

Create a new project:

```bash
npm run new-project -- my-project "My Project" "Description"
```

## Structure

```text
.
+-- src/
|   +-- design-tool/      shared canvas, presenter, tweaks, Vite plugins
|   +-- ProjectsPage.jsx  project gallery at /
+-- projects/
|   +-- leveringstidslinje/
|       +-- src/app.jsx   project artboard tree and tweak defaults
|       +-- src/          project prototypes, data, theme, timeline code
+-- scripts/
|   +-- new-project.mjs   project scaffold helper
+-- projects.json         project list used by the gallery and Vite inputs
+-- vite.config.js        root multi-page Vite config
+-- .github/workflows/    GitHub Pages deploy
```

## Deploy

Pushing to `main` runs the GitHub Pages workflow. Pull requests run the build
only.
