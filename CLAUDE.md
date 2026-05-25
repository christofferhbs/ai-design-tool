# Claude instructions

Load `.agents/system-prompt.md` as your operating instructions for any design
task in this repository. It defines your role, workflow, and the skill library
in `.agents/skills/`.

When a user request matches a skill description in `.agents/system-prompt.md`
chapter 20, **read the corresponding file** from `.agents/skills/` and follow
its phased procedure. Skills are reference documents; there is no
skill-invocation tool in Codex.

Verification is in-loop: render or build the output yourself and report
findings as a short list. There is no verifier subagent.

## Repository structure

`npm run dev` starts a single Vite dev server (root `vite.config.js`) that
serves all projects as an MPA:

- `/` - Projects page (`src/ProjectsPage.jsx`) - lists all project cards
- `/projects/<name>/` - each design project

Each project lives in `projects/<name>/` and has its own `index.html` that
must use a **relative** script src (`./src/app.jsx`, not `/src/app.jsx`) so it
works from both the root server and the per-project dev server.

`npm run dev:<name>` still works for focused development on one project using
the per-project `vite.config.js`.

### Shared design-tool runtime

Reusable tool infrastructure lives in `src/design-tool/`. Project code should
import the shared authoring primitives from there:

```jsx
import {
  ProjectShell,
  DCSection,
  DCArtboard,
  useTweaks,
  TweaksPanel,
} from '../../../src/design-tool/index.jsx';
```

Keep project apps JSX-native and readable: `src/app.jsx` should assemble the
visible `DCSection`/`DCArtboard` tree, while project-specific components stay
in `src/prototypes/`, tokens stay project-local, and tweak defaults stay in the
project's `TWEAK_DEFAULTS` block.

The guiding convention is: shared runtime below, readable JSX canvas above.

### Runtime modes

Project apps use `ProjectShell` over the same `DCSection`/`DCArtboard` tree:

- **Dev mode** (`import.meta.env.DEV`, including `npm run dev` and
  `npm run dev:<name>`) renders `DesignCanvas` with pan/zoom, edit handles,
  reorder controls, focus mode, and canvas state writes.
- **Built/deployed mode** renders `Presenter`: a clean gallery/focus viewer
  with no designer chrome. The tweaks panel stays available, artboards can be
  opened directly by URL hash, and focus navigation keeps the hash shareable.

Presenter deep links use readable slugs based on the visible section title and
artboard label, for example
`projects/leveringstidslinje/#forside/hojvang-okologi-forside`. The no-hash
project URL shows all artboards in the presenter gallery.

### Adding a new project

Prefer the scaffold:

```sh
npm run new-project -- <name> "Project Name" "Description"
```

For manual setup:

1. Create `projects/<name>/` with a Vite/React setup. Use `./src/app.jsx` as
   the script src in `index.html`.
2. Add an entry to `projects.json` with a relative `urlPath` (no leading slash,
   e.g. `"projects/<name>/"`). This is the single source of truth for the
   project list and the root Vite MPA inputs.
3. Add `dev:<name>`, `build:<name>`, and `preview:<name>` scripts if you want
   focused per-project commands.

### Deployment

The app is deployed to GitHub Pages via `.github/workflows/pipeline.yml`.
Pushes to `main` and manual dispatches build and deploy; pull requests run
the build only (no Pages API calls, no deploy). The build runs
`npm run build -- --base /ai-design-tool/`.

Live URLs:
- Projects page: `https://christofferhbs.github.io/ai-design-tool/`
- Per-project: `https://christofferhbs.github.io/ai-design-tool/projects/<name>/`

Enable GitHub Pages in repo settings (Source: GitHub Actions) before the
first deploy.
