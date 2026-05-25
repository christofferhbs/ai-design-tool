import React from 'react';
import { Presenter } from './presenter.jsx';

function retryImport(load, attempts = 5) {
  return load().catch((error) => {
    if (attempts <= 1) throw error;
    return new Promise((resolve) => setTimeout(resolve, 250))
      .then(() => retryImport(load, attempts - 1));
  });
}

const DesignCanvasShell = import.meta.env.DEV
  ? React.lazy(() => retryImport(() => import('./design-canvas.jsx')).then((mod) => ({ default: mod.DesignCanvas })))
  : null;

// When the project is loaded inside the projects-page preview iframe, force
// Presenter (clean gallery) even in dev. Without this, dev iframes would show
// the full DesignCanvas chrome — sidebar nav, edit handles, etc.
function isPreviewMode() {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).has('preview');
}

export function ProjectShell({ title, children }) {
  const Shell = import.meta.env.DEV && !isPreviewMode() ? DesignCanvasShell : Presenter;
  return (
    <React.Suspense fallback={null}>
      <Shell title={title}>{children}</Shell>
    </React.Suspense>
  );
}

export { DCArtboard, DCSection, dcFlatten } from './markers.jsx';
export { useTweaks, TweaksPanel, TweakSection, TweakRow } from './tweaks.jsx';
