import React from 'react';

export function slugifyRoutePart(value, fallback = 'item') {
  const slug = String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[æ]/g, 'ae')
    .replace(/[ø]/g, 'o')
    .replace(/[å]/g, 'aa')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return slug || fallback;
}

export function uniqueRouteSlug(value, fallback, used) {
  const base = slugifyRoutePart(value, fallback);
  const next = (used.get(base) ?? 0) + 1;
  used.set(base, next);
  return next === 1 ? base : `${base}-${next}`;
}

export function withRouteSlugs(sections) {
  const usedSections = new Map();
  return sections.map((section) => {
    const usedArtboards = new Map();
    return {
      ...section,
      routeSlug: uniqueRouteSlug(section.title ?? section.id, 'section', usedSections),
      artboards: (section.artboards ?? []).map((artboard) => ({
        ...artboard,
        routeSlug: uniqueRouteSlug(artboard.label ?? artboard.id, 'artboard', usedArtboards),
      })),
    };
  });
}

export function hashFor(sectionSlug, artboardSlug) {
  return `#${encodeURIComponent(sectionSlug)}/${encodeURIComponent(artboardSlug)}`;
}

export function clearHashUrl() {
  return window.location.pathname + window.location.search;
}

export function parseHash() {
  const raw = window.location.hash.replace(/^#/, '');
  if (!raw) return null;
  const [sectionSlug, artboardSlug] = raw.split('/').map((part) => {
    try { return decodeURIComponent(part); }
    catch { return part; }
  });
  return sectionSlug && artboardSlug ? { sectionSlug, artboardSlug } : null;
}

export function findFocus(sections, focus) {
  if (!focus) return null;
  const section = sections.find((s) => s.id === focus.sectionId);
  const artboard = section?.artboards.find((a) => a.id === focus.artboardId);
  return section && artboard ? { section, artboard } : null;
}

export function findFocusByRoute(sections, route) {
  if (!route) return null;
  const section = sections.find((s) => s.routeSlug === route.sectionSlug);
  const artboard = section?.artboards.find((a) => a.routeSlug === route.artboardSlug);
  return section && artboard ? { section, artboard } : null;
}

export function focusFromHash(sections) {
  const active = findFocusByRoute(sections, parseHash());
  return active ? { sectionId: active.section.id, artboardId: active.artboard.id } : null;
}

function hashForFocus(sections, focus) {
  const active = findFocus(sections, focus);
  return active ? hashFor(active.section.routeSlug, active.artboard.routeSlug) : clearHashUrl();
}

export function slotFromHash(routeRegistry) {
  const parsed = parseHash();
  if (!parsed) return null;
  return routeRegistry[`${parsed.sectionSlug}/${parsed.artboardSlug}`] ?? null;
}

export function usePresenterFocusRoute(sections) {
  const [focus, setFocus] = React.useState(() => focusFromHash(sections));
  const applyingHistory = React.useRef(false);

  React.useEffect(() => {
    setFocus((current) => {
      if (findFocus(sections, current)) return current;
      return focusFromHash(sections);
    });
  }, [sections]);

  React.useEffect(() => {
    const onHistoryChange = () => {
      applyingHistory.current = true;
      setFocus(focusFromHash(sections));
    };
    window.addEventListener('hashchange', onHistoryChange);
    window.addEventListener('popstate', onHistoryChange);
    return () => {
      window.removeEventListener('hashchange', onHistoryChange);
      window.removeEventListener('popstate', onHistoryChange);
    };
  }, [sections]);

  React.useEffect(() => {
    const nextUrl = focus ? hashForFocus(sections, focus) : clearHashUrl();
    const isCurrentUrl = focus ? window.location.hash === nextUrl : !window.location.hash;
    if (isCurrentUrl) {
      applyingHistory.current = false;
      return;
    }
    if (applyingHistory.current) {
      applyingHistory.current = false;
      history.replaceState(null, '', nextUrl);
      return;
    }
    history.pushState(null, '', nextUrl);
  }, [focus, sections]);

  return [focus, setFocus, findFocus(sections, focus)];
}

export function useCanvasFocusRoute(registryRef, setFocusSlot) {
  React.useEffect(() => {
    const syncFocusFromHash = () => setFocusSlot(slotFromHash(registryRef.current));
    syncFocusFromHash();
    window.addEventListener('hashchange', syncFocusFromHash);
    window.addEventListener('popstate', syncFocusFromHash);
    return () => {
      window.removeEventListener('hashchange', syncFocusFromHash);
      window.removeEventListener('popstate', syncFocusFromHash);
    };
  }, [registryRef, setFocusSlot]);
}
