// design-canvas.jsx — DesignCanvas (dev runtime).
//
// Thin wrapper around the shared Canvas primitive in canvas.jsx. Adds:
// - a pan/zoom viewport (DCViewport)
// - editable section/artboard chrome (rename, reorder, delete, export)
// - sidecar JSON state for the agent's edits (.design-canvas.state.json)
// - section nav buttons in the top header (pan-to-section)
//
// Canvas owns the project header, focus routing, and focus view — same as
// the PresentationCanvas — so the two modes feel like the same product.

import React from 'react';
import { DC, gridSvg } from './tokens.js';
import { Canvas, sectionAttrFor } from './canvas.jsx';

// One-time CSS injection (classes are dc-prefixed so they don't collide
// with the hosted design's own styles).
if (typeof document !== 'undefined' && !document.getElementById('dc-styles')) {
  const s = document.createElement('style');
  s.id = 'dc-styles';
  s.textContent = [
    '.dc-editable{cursor:text;outline:none;white-space:nowrap;border-radius:3px;padding:0 2px;margin:0 -2px}',
    '.dc-editable:focus{background:#fff;box-shadow:0 0 0 1.5px #c96442}',
    '[data-dc-slot]{transition:transform .18s cubic-bezier(.2,.7,.3,1)}',
    '[data-dc-slot].dc-dragging{transition:none;z-index:10;pointer-events:none}',
    '[data-dc-slot].dc-dragging .dc-card{box-shadow:0 12px 40px rgba(0,0,0,.25),0 0 0 2px #c96442;transform:scale(1.02)}',
    // isolation:isolate contains artboard content's z-indexes so a
    // z-indexed child (sticky navbar etc.) can't paint over .dc-header or
    // the .dc-menu popover that drops into the top of the card.
    '.dc-card{isolation:isolate;transition:box-shadow .15s,transform .15s}',
    '.dc-card *{scrollbar-width:none}',
    '.dc-card *::-webkit-scrollbar{display:none}',
    // Per-artboard header: grip + label on the left, delete/expand on the
    // right. Single flex row; when the artboard's on-screen width is too
    // narrow for both the label yields (ellipsis, then hidden entirely below
    // ~4ch via the container query) and the buttons stay on the row.
    '.dc-header{position:absolute;bottom:100%;left:-4px;margin-bottom:calc(4px * var(--dc-inv-zoom,1));z-index:2;',
    '  display:flex;align-items:center;container-type:inline-size}',
    '.dc-labelrow{display:flex;align-items:center;gap:4px;height:24px;flex:1 1 auto;min-width:0}',
    '.dc-grip{flex:0 0 auto;cursor:grab;display:flex;align-items:center;padding:5px 4px;border-radius:4px;transition:background .12s,opacity .12s}',
    '.dc-grip:hover{background:rgba(0,0,0,.08)}',
    '.dc-grip:active{cursor:grabbing}',
    '.dc-labeltext{flex:1 1 auto;min-width:0;cursor:pointer;border-radius:4px;padding:3px 6px;',
    '  display:flex;align-items:center;transition:background .12s;overflow:hidden}',
    // Below ~4ch of label room: hide the label entirely, and drop the grip to
    // hover-only (same reveal rule as .dc-btns) so a narrow header is clean
    // until the card is moused.
    '@container (max-width: 110px){',
    '  .dc-labeltext{display:none}',
    '  .dc-grip{opacity:0}',
    '  [data-dc-slot]:hover .dc-grip{opacity:1}',
    '}',
    '.dc-labeltext:hover{background:rgba(0,0,0,.05)}',
    '.dc-labeltext .dc-editable{overflow:hidden;text-overflow:ellipsis;max-width:100%}',
    '.dc-labeltext .dc-editable:focus{overflow:visible;text-overflow:clip}',
    '.dc-btns{flex:0 0 auto;margin-left:auto;display:flex;gap:2px;opacity:0;transition:opacity .12s}',
    '[data-dc-slot]:hover .dc-btns,.dc-btns:has(.dc-menu){opacity:1}',
    '.dc-expand,.dc-kebab{width:22px;height:22px;border-radius:5px;border:none;cursor:pointer;padding:0;',
    '  background:transparent;color:rgba(60,50,40,.7);display:flex;align-items:center;justify-content:center;',
    '  font:inherit;transition:background .12s,color .12s}',
    '.dc-expand:hover,.dc-kebab:hover{background:rgba(0,0,0,.06);color:#2a251f}',
    // Slot hosting an open menu floats above later siblings (which otherwise
    // paint on top — same z-index:auto, later DOM order) so the popup isn't
    // clipped by the next card.
    '[data-dc-slot]:has(.dc-menu){z-index:10}',
    '.dc-menu{position:absolute;top:100%;right:0;margin-top:4px;background:#fff;border-radius:8px;',
    '  box-shadow:0 8px 28px rgba(0,0,0,.18),0 0 0 1px rgba(0,0,0,.05);padding:4px;min-width:160px;z-index:10}',
    '.dc-menu button{display:block;width:100%;padding:7px 10px;border:0;background:transparent;',
    '  border-radius:5px;font-family:inherit;font-size:13px;font-weight:500;line-height:1.2;',
    '  color:#29261b;cursor:pointer;text-align:left;transition:background .12s;white-space:nowrap}',
    '.dc-menu button:hover{background:rgba(0,0,0,.05)}',
    '.dc-menu hr{border:0;border-top:1px solid rgba(0,0,0,.08);margin:4px 2px}',
    '.dc-menu .dc-danger{color:#c96442}',
    '.dc-menu .dc-danger:hover{background:rgba(201,100,66,.1)}',
    // Section title + per-artboard header counter-scale against the viewport
    // zoom so they stay a constant on-screen size. --dc-inv-zoom is set by
    // DCViewport on every transform update and inherits to all descendants —
    // any overlay inside the world (e.g. a TweaksPanel on an artboard) can use
    // it the same way.
    '.dc-header{width:calc((100% + 4px) / var(--dc-inv-zoom,1));',
    '  transform:scale(var(--dc-inv-zoom,1));transform-origin:bottom left}',
    '.dc-sectionhead{zoom:var(--dc-inv-zoom,1)}',
  ].join('\n');
  document.head.appendChild(s);
}

const DC_STATE_FILE = '.design-canvas.state.json';
const DCCtx = React.createContext(null);

export function DesignCanvas({ children, minScale, maxScale, style, title }) {
  const [overrides, setOverrides, ready] = useSidecarState();
  const panToRef = React.useRef(null);

  const transformSections = React.useCallback(
    (parsed) => applyOverrides(parsed, overrides),
    [overrides],
  );

  const api = React.useMemo(() => ({
    section: (id) => overrides[id] || {},
    patchSection: (id, p) => setOverrides((s) => ({
      ...s,
      [id]: { ...s[id], ...(typeof p === 'function' ? p(s[id] || {}) : p) },
    })),
  }), [overrides, setOverrides]);

  // Any outside pointerdown commits an in-progress rename.
  React.useEffect(() => {
    const onPd = (e) => {
      const ae = document.activeElement;
      if (ae && ae.isContentEditable && !ae.contains(e.target)) ae.blur();
    };
    document.addEventListener('pointerdown', onPd, true);
    return () => document.removeEventListener('pointerdown', onPd, true);
  }, []);

  return (
    <DCCtx.Provider value={api}>
      <Canvas
        title={title}
        transformSections={transformSections}
        background={false}
        onSectionNav={(id) => panToRef.current?.(id)}
        body={({ sections, setFocus }) => (
          <DCViewport minScale={minScale} maxScale={maxScale} style={style} panToRef={panToRef}>
            {ready && sections.map((section) => (
              <DCSectionFrame key={section.id} section={section} setFocus={setFocus} />
            ))}
          </DCViewport>
        )}
      >
        {children}
      </Canvas>
    </DCCtx.Provider>
  );
}

// Read .design-canvas.state.json on mount, write (debounced) on change.
// Stores per-section overrides: {order, labels, hidden, srcKey, title}.
// Reads via plain fetch so a downloaded zip can serve the saved arrangement;
// writes go through the host's omelette bridge — editing requires that
// runtime, but reading does not.
function useSidecarState() {
  const [sections, setSections] = React.useState({});
  const [ready, setReady] = React.useState(false);
  const didRead = React.useRef(false);
  const skipNextWrite = React.useRef(false);

  React.useEffect(() => {
    let cancelled = false;
    fetch('./' + DC_STATE_FILE)
      .then((r) => (r.ok ? r.json() : null))
      .then((saved) => {
        if (cancelled || !saved?.sections) return;
        skipNextWrite.current = true;
        setSections(saved.sections);
      })
      .catch(() => {})
      .finally(() => { didRead.current = true; if (!cancelled) setReady(true); });
    const t = setTimeout(() => { if (!cancelled) setReady(true); }, 500);
    return () => { cancelled = true; clearTimeout(t); };
  }, []);

  React.useEffect(() => {
    if (!didRead.current) return;
    if (skipNextWrite.current) { skipNextWrite.current = false; return; }
    const t = setTimeout(() => {
      const dir = location.pathname.endsWith('/')
        ? location.pathname
        : location.pathname.replace(/\/[^\/]*$/, '/');
      fetch('/__canvas/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: dir + DC_STATE_FILE, content: JSON.stringify({ sections }) }),
      }).catch(() => {});
    }, 250);
    return () => clearTimeout(t);
  }, [sections]);

  return [sections, setSections, ready];
}

// Reorder + filter + relabel parsed sections per the sidecar overrides.
// Hidden artboards are scoped to the current source revision via srcKey,
// so a regenerate (artboard-ID set changes) drops stale deletes.
function applyOverrides(parsed, overrides) {
  return parsed.map((section) => {
    const persisted = overrides[section.id] || {};
    const srcKey = section.artboards.map((a) => a.id).join('\x1f');
    const hidden = persisted.srcKey === srcKey ? (persisted.hidden || []) : [];
    const filtered = section.artboards.filter((a) => !hidden.includes(a.id));
    const filteredIds = filtered.map((a) => a.id);
    const orderRaw = persisted.order || [];
    const kept = orderRaw.filter((k) => filteredIds.includes(k));
    const orderedIds = [...kept, ...filteredIds.filter((k) => !kept.includes(k))];
    const byId = Object.fromEntries(filtered.map((a) => [a.id, a]));
    return {
      ...section,
      title: persisted.title ?? section.title,
      _srcKey: srcKey,
      artboards: orderedIds.map((id) => ({
        ...byId[id],
        label: (persisted.labels || {})[id] ?? byId[id].label,
      })),
    };
  });
}

// ─────────────────────────────────────────────────────────────
// DCViewport — transform-based pan/zoom (internal)
//
// Input mapping (Figma-style):
//   • trackpad pinch  → zoom   (ctrlKey wheel; Safari gesture* events)
//   • trackpad scroll → pan    (two-finger)
//   • mouse wheel     → zoom   (notched; distinguished from trackpad scroll)
//   • middle-drag / primary-drag-on-bg → pan
//
// Transform state lives in a ref and is written straight to the DOM
// (translate3d + will-change) so wheel ticks don't go through React —
// keeps pans at 60fps on dense canvases.
// ─────────────────────────────────────────────────────────────
function DCViewport({ children, minScale = 0.1, maxScale = 8, style = {}, panToRef }) {
  const vpRef = React.useRef(null);
  const worldRef = React.useRef(null);
  const tf = React.useRef({ x: 0, y: 0, scale: 1 });
  // Persist viewport across reloads so the user lands back where they were
  // after an agent edit or browser refresh. The sandbox origin is already
  // per-project; pathname keeps multiple canvas files in one project apart.
  const tfKey = 'dc-viewport:' + location.pathname;
  const saveT = React.useRef(0);

  const lastPostedScale = React.useRef();
  const apply = React.useCallback(() => {
    const { x, y, scale } = tf.current;
    const el = worldRef.current;
    if (!el) return;
    el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
    // Exposed for zoom-invariant overlays (labels, buttons, TweaksPanel).
    el.style.setProperty('--dc-inv-zoom', String(1 / scale));
    // Keep the host toolbar's % readout in sync with the canvas scale. Pan
    // ticks leave scale unchanged — skip the cross-frame post for those.
    if (lastPostedScale.current !== scale) {
      lastPostedScale.current = scale;
      window.parent.postMessage({ type: '__dc_zoom', scale }, '*');
    }
    clearTimeout(saveT.current);
    saveT.current = setTimeout(() => {
      try { localStorage.setItem(tfKey, JSON.stringify(tf.current)); } catch {}
    }, 200);
  }, [tfKey]);

  React.useLayoutEffect(() => {
    const flush = () => {
      clearTimeout(saveT.current);
      try { localStorage.setItem(tfKey, JSON.stringify(tf.current)); } catch {}
    };
    try {
      const s = JSON.parse(localStorage.getItem(tfKey) || 'null');
      if (s && Number.isFinite(s.x) && Number.isFinite(s.y) && Number.isFinite(s.scale)) {
        tf.current = { x: s.x, y: s.y, scale: Math.min(maxScale, Math.max(minScale, s.scale)) };
        apply();
      }
    } catch {}
    window.addEventListener('pagehide', flush);
    return () => { window.removeEventListener('pagehide', flush); flush(); };
  }, []);

  React.useEffect(() => {
    if (!panToRef) return;
    panToRef.current = (sectionId) => {
      const vp = vpRef.current;
      const world = worldRef.current;
      if (!vp || !world) return;
      const esc = String(sectionId).replace(/["\\]/g, '\\$&');
      const el = vp.querySelector(`[data-canvas-section="${esc}"]`);
      if (!el) return;
      const vpR = vp.getBoundingClientRect();
      const elR = el.getBoundingClientRect();
      tf.current.x += (vpR.left + vpR.width / 2) - (elR.left + elR.width / 2);
      tf.current.y += (vpR.top + vpR.height / 2) - (elR.top + elR.height / 2);
      world.style.transition = 'transform 0.4s cubic-bezier(0.2,0.7,0.3,1)';
      apply();
      setTimeout(() => { world.style.transition = ''; }, 400);
    };
  }, []);

  React.useEffect(() => {
    const vp = vpRef.current;
    if (!vp) return;

    const zoomAt = (cx, cy, factor) => {
      const r = vp.getBoundingClientRect();
      const px = cx - r.left, py = cy - r.top;
      const t = tf.current;
      const next = Math.min(maxScale, Math.max(minScale, t.scale * factor));
      const k = next / t.scale;
      let marker = null, markerY0 = 0;
      if (k !== 1) {
        const hit = document.elementFromPoint(cx, cy);
        marker = hit && hit.closest ? hit.closest('[data-dc-slot],[data-canvas-section]') : null;
        if (marker) markerY0 = marker.getBoundingClientRect().top;
      }
      t.x = px - (px - t.x) * k;
      t.y = py - (py - t.y) * k;
      t.scale = next;
      apply();
      if (marker) {
        const drift = marker.getBoundingClientRect().top - (cy + (markerY0 - cy) * k);
        if (Math.abs(drift) > 0.1) { t.y -= drift; apply(); }
      }
    };

    const isMouseWheel = (e) =>
      e.deltaMode !== 0 ||
      (e.deltaX === 0 && Number.isInteger(e.deltaY) && Math.abs(e.deltaY) >= 40);

    const onWheel = (e) => {
      e.preventDefault();
      if (isGesturing) return;
      if ((e.ctrlKey || e.metaKey) && !isMouseWheel(e)) {
        zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.01));
      } else if (isMouseWheel(e)) {
        zoomAt(e.clientX, e.clientY, Math.exp(-Math.sign(e.deltaY) * 0.18));
      } else {
        tf.current.x -= e.deltaX;
        tf.current.y -= e.deltaY;
        apply();
      }
    };

    let gsBase = 1;
    let isGesturing = false;
    const onGestureStart = (e) => { e.preventDefault(); isGesturing = true; gsBase = tf.current.scale; };
    const onGestureChange = (e) => {
      e.preventDefault();
      zoomAt(e.clientX, e.clientY, (gsBase * e.scale) / tf.current.scale);
    };
    const onGestureEnd = (e) => { e.preventDefault(); isGesturing = false; };

    let drag = null;
    const onPointerDown = (e) => {
      const onBg = !e.target.closest('[data-dc-slot], .dc-editable');
      if (!(e.button === 1 || (e.button === 0 && onBg))) return;
      e.preventDefault();
      vp.setPointerCapture(e.pointerId);
      drag = { id: e.pointerId, lx: e.clientX, ly: e.clientY };
      vp.style.cursor = 'grabbing';
    };
    const onPointerMove = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      tf.current.x += e.clientX - drag.lx;
      tf.current.y += e.clientY - drag.ly;
      drag.lx = e.clientX; drag.ly = e.clientY;
      apply();
    };
    const onPointerUp = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      vp.releasePointerCapture(e.pointerId);
      drag = null;
      vp.style.cursor = '';
    };

    const onHostMsg = (e) => {
      const d = e.data;
      if (d && d.type === '__dc_set_zoom' && typeof d.scale === 'number') {
        const r = vp.getBoundingClientRect();
        zoomAt(r.left + r.width / 2, r.top + r.height / 2, d.scale / tf.current.scale);
      } else if (d && d.type === '__dc_probe') {
        window.parent.postMessage({ type: '__dc_present' }, '*');
        lastPostedScale.current = undefined;
        apply();
      }
    };
    window.addEventListener('message', onHostMsg);
    window.parent.postMessage({ type: '__dc_present' }, '*');
    lastPostedScale.current = undefined;
    apply();

    vp.addEventListener('wheel', onWheel, { passive: false });
    vp.addEventListener('gesturestart', onGestureStart, { passive: false });
    vp.addEventListener('gesturechange', onGestureChange, { passive: false });
    vp.addEventListener('gestureend', onGestureEnd, { passive: false });
    vp.addEventListener('pointerdown', onPointerDown);
    vp.addEventListener('pointermove', onPointerMove);
    vp.addEventListener('pointerup', onPointerUp);
    vp.addEventListener('pointercancel', onPointerUp);
    return () => {
      window.removeEventListener('message', onHostMsg);
      vp.removeEventListener('wheel', onWheel);
      vp.removeEventListener('gesturestart', onGestureStart);
      vp.removeEventListener('gesturechange', onGestureChange);
      vp.removeEventListener('gestureend', onGestureEnd);
      vp.removeEventListener('pointerdown', onPointerDown);
      vp.removeEventListener('pointermove', onPointerMove);
      vp.removeEventListener('pointerup', onPointerUp);
      vp.removeEventListener('pointercancel', onPointerUp);
    };
  }, [apply, minScale, maxScale]);

  return (
    <div
      ref={vpRef}
      className="design-canvas"
      style={{
        height: '100vh', width: '100vw',
        background: DC.bg,
        overflow: 'hidden',
        overscrollBehavior: 'none',
        touchAction: 'none',
        position: 'relative',
        fontFamily: DC.font,
        boxSizing: 'border-box',
        ...style,
      }}
    >
      <div
        ref={worldRef}
        style={{
          position: 'absolute', top: 0, left: 0,
          transformOrigin: '0 0',
          willChange: 'transform',
          width: 'max-content', minWidth: '100%',
          minHeight: '100%',
          padding: '60px 0 80px',
        }}
      >
        <div style={{ position: 'absolute', inset: -6000, backgroundImage: gridSvg, backgroundSize: '120px 120px', pointerEvents: 'none', zIndex: -1 }} />
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DCSectionFrame — editable title + horizontal row of artboards
// ─────────────────────────────────────────────────────────────
function DCSectionFrame({ section, setFocus }) {
  const ctx = React.useContext(DCCtx);
  const sid = section.id;
  const gap = section.gap ?? 48;
  const order = section.artboards.map((a) => a.id);
  const srcKey = section._srcKey;

  return (
    <div data-canvas-section={sid}
      style={{ marginBottom: 'calc(80px * var(--dc-inv-zoom, 1))', position: 'relative' }}>
      <div style={{ padding: '0 60px' }}>
        <div className="dc-sectionhead" style={{ paddingBottom: 36 }}>
          <DCEditable tag="div" value={section.title}
            onChange={(v) => ctx && ctx.patchSection(sid, { title: v })}
            style={{ fontSize: 28, fontWeight: 600, color: DC.title, letterSpacing: -0.4, marginBottom: 6, display: 'inline-block' }} />
          {section.subtitle && <div style={{ fontSize: 16, color: DC.subtitle }}>{section.subtitle}</div>}
        </div>
      </div>
      <div style={{ display: 'flex', gap, padding: '0 60px', alignItems: 'flex-start', width: 'max-content' }}>
        {section.artboards.map((artboard) => (
          <DCArtboardFrame
            key={artboard.id}
            sectionId={sid}
            artboard={artboard}
            order={order}
            onRename={(v) => ctx && ctx.patchSection(sid, (x) => ({ labels: { ...x.labels, [artboard.id]: v } }))}
            onReorder={(next) => ctx && ctx.patchSection(sid, { order: next })}
            onDelete={() => ctx && ctx.patchSection(sid, (x) => ({
              hidden: [...(x.srcKey === srcKey ? (x.hidden || []) : []), artboard.id],
              srcKey,
            }))}
            onFocus={() => setFocus({ sectionId: sid, artboardId: artboard.id })}
          />
        ))}
      </div>
    </div>
  );
}

// Per-artboard export (kind: 'png' | 'html'). Both paths share the same
// self-contained clone: computed styles baked in, @font-face / <img> /
// inline-style background-image urls inlined as data URIs. PNG wraps the
// clone in foreignObject→canvas at 3× the artboard's natural width×height
// (same pipeline the host uses for page captures); HTML wraps it in a
// minimal standalone document. Both are independent of viewport zoom.
async function dcExport(node, w, h, name, kind) {
  try { await document.fonts.ready; } catch {}
  const toDataURL = (url) => fetch(url).then((r) => r.blob()).then((b) => new Promise((res) => {
    const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = () => res(url); fr.readAsDataURL(b);
  })).catch(() => url);

  const fontRules = [], pending = [], seen = new Set();
  const scrapeCss = (href) => {
    if (seen.has(href)) return; seen.add(href);
    pending.push(fetch(href).then((r) => r.text()).then((css) => {
      for (const m of css.match(/@font-face\s*{[^}]*}/g) || []) fontRules.push({ css: m, base: href });
      for (const m of css.matchAll(/@import\s+(?:url\()?['"]?([^'")\s;]+)/g))
        scrapeCss(new URL(m[1], href).href);
    }).catch(() => {}));
  };
  const walk = (rules, base) => {
    for (const r of rules) {
      if (r.type === CSSRule.FONT_FACE_RULE) fontRules.push({ css: r.cssText, base });
      else if (r.type === CSSRule.IMPORT_RULE && r.styleSheet) {
        const ibase = r.styleSheet.href || base;
        try { walk(r.styleSheet.cssRules, ibase); } catch { scrapeCss(ibase); }
      } else if (r.cssRules) walk(r.cssRules, base);
    }
  };
  for (const ss of document.styleSheets) {
    const base = ss.href || location.href;
    try { walk(ss.cssRules, base); } catch { if (ss.href) scrapeCss(ss.href); }
  }
  while (pending.length) await pending.shift();
  const fontCss = (await Promise.all(fontRules.map(async (rule) => {
    let out = rule.css, m; const re = /url\((['"]?)([^'")]+)\1\)/g;
    while ((m = re.exec(rule.css))) {
      if (m[2].indexOf('data:') === 0) continue;
      let abs; try { abs = new URL(m[2], rule.base).href; } catch { continue; }
      out = out.split(m[0]).join('url("' + await toDataURL(abs) + '")');
    }
    return out;
  }))).join('\n');

  const cloneStyled = (src) => {
    if (src.nodeType === 8 || (src.nodeType === 1 && src.tagName === 'SCRIPT')) return document.createTextNode('');
    const dst = src.cloneNode(false);
    if (src.nodeType === 1) {
      const cs = getComputedStyle(src); let txt = '';
      for (let i = 0; i < cs.length; i++) txt += cs[i] + ':' + cs.getPropertyValue(cs[i]) + ';';
      dst.setAttribute('style', txt + 'animation:none;transition:none;');
      if (src.tagName === 'CANVAS') try { const im = document.createElement('img'); im.src = src.toDataURL(); im.setAttribute('style', txt); return im; } catch {}
    }
    for (let c = src.firstChild; c; c = c.nextSibling) dst.appendChild(cloneStyled(c));
    return dst;
  };
  const clone = cloneStyled(node);
  clone.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
  clone.style.boxShadow = 'none'; clone.style.borderRadius = '0';

  const jobs = [];
  clone.querySelectorAll('img').forEach((el) => {
    const s = el.getAttribute('src');
    if (s && s.indexOf('data:') !== 0) jobs.push(toDataURL(el.src).then((d) => el.setAttribute('src', d)));
  });
  [clone, ...clone.querySelectorAll('*')].forEach((el) => {
    const bg = el.style.backgroundImage; if (!bg) return;
    let m; const re = /url\(["']?([^"')]+)["']?\)/g;
    while ((m = re.exec(bg))) {
      const tok = m[0], url = m[1];
      if (url.indexOf('data:') === 0) continue;
      jobs.push(toDataURL(url).then((d) => { el.style.backgroundImage = el.style.backgroundImage.split(tok).join('url("' + d + '")'); }));
    }
  });
  await Promise.all(jobs);

  const xml = new XMLSerializer().serializeToString(clone);
  const save = (blob, ext) => {
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name + '.' + ext; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  if (kind === 'html') {
    const html = '<!doctype html><html><head><meta charset="utf-8"><title>' + name + '</title>' +
      (fontCss ? '<style>' + fontCss + '</style>' : '') +
      '</head><body style="margin:0">' + xml + '</body></html>';
    return save(new Blob([html], { type: 'text/html' }), 'html');
  }

  const px = 3;
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w * px + '" height="' + h * px +
    '" viewBox="0 0 ' + w + ' ' + h + '"><foreignObject width="' + w + '" height="' + h + '">' +
    (fontCss ? '<style><![CDATA[' + fontCss + ']]></style>' : '') + xml + '</foreignObject></svg>';
  const img = new Image();
  await new Promise((res, rej) => {
    img.onload = res; img.onerror = () => rej(new Error('svg load failed'));
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
  const cv = document.createElement('canvas');
  cv.width = w * px; cv.height = h * px;
  cv.getContext('2d').drawImage(img, 0, 0);
  cv.toBlob((blob) => save(blob, 'png'), 'image/png');
}

function DCArtboardFrame({ sectionId, artboard, order, onRename, onReorder, onFocus, onDelete }) {
  const { id, label, width, height, children, style = {}, onExpand } = artboard;
  const ref = React.useRef(null);
  const cardRef = React.useRef(null);
  const menuRef = React.useRef(null);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [confirming, setConfirming] = React.useState(false);

  React.useEffect(() => {
    if (!menuOpen) { setConfirming(false); return; }
    const off = (e) => { if (!menuRef.current || !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('pointerdown', off, true);
    return () => document.removeEventListener('pointerdown', off, true);
  }, [menuOpen]);

  const doExport = (kind) => {
    setMenuOpen(false);
    if (!cardRef.current) return;
    const name = String(label || id || 'artboard').replace(/[^\w\s.-]+/g, '_');
    dcExport(cardRef.current, width, height, name, kind)
      .catch((e) => console.error('[design-canvas] export failed:', e));
  };

  // Live drag-reorder: dragged card sticks to cursor; siblings slide into
  // their would-be slots in real time via transforms. DOM order only
  // changes on drop.
  const onGripDown = (e) => {
    e.preventDefault(); e.stopPropagation();
    const me = ref.current;
    // translateX is applied in local (pre-scale) space but pointer deltas and
    // getBoundingClientRect().left are screen-space — divide by the viewport's
    // current scale so the dragged card tracks the cursor at any zoom level.
    const scale = me.getBoundingClientRect().width / me.offsetWidth || 1;
    const peers = Array.from(document.querySelectorAll(`[data-canvas-section="${sectionId}"] [data-dc-slot]`));
    const homes = peers.map((el) => ({ el, id: el.dataset.dcSlot, x: el.getBoundingClientRect().left }));
    const slotXs = homes.map((h) => h.x);
    const startIdx = order.indexOf(id);
    const startX = e.clientX;
    let liveOrder = order.slice();
    me.classList.add('dc-dragging');

    const layout = () => {
      for (const h of homes) {
        if (h.id === id) continue;
        const slot = liveOrder.indexOf(h.id);
        h.el.style.transform = `translateX(${(slotXs[slot] - h.x) / scale}px)`;
      }
    };

    const move = (ev) => {
      const dx = ev.clientX - startX;
      me.style.transform = `translateX(${dx / scale}px)`;
      let best = startIdx, bestDist = Infinity;
      const myCx = (homes.find((h) => h.id === id).x) + dx + me.offsetWidth / 2;
      for (let i = 0; i < homes.length; i++) {
        const h = homes[i];
        const cx = (i === startIdx ? h.x : slotXs[liveOrder.indexOf(h.id)]) + h.el.offsetWidth / 2;
        const d = Math.abs(cx - myCx);
        if (d < bestDist) { bestDist = d; best = i; }
      }
      if (best !== liveOrder.indexOf(id)) {
        liveOrder = liveOrder.filter((k) => k !== id);
        liveOrder.splice(best, 0, id);
        layout();
      }
    };

    const up = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      me.classList.remove('dc-dragging');
      me.style.transform = '';
      for (const h of homes) h.el.style.transform = '';
      if (liveOrder.join('|') !== order.join('|')) onReorder(liveOrder);
    };

    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  };

  return (
    <div ref={ref} data-dc-slot={id} style={{ position: 'relative', flexShrink: 0 }}>
      <div className="dc-header" data-noncommentable="" style={{ color: DC.label }} onPointerDown={(e) => e.stopPropagation()}>
        <div className="dc-labelrow">
          <div className="dc-grip" onPointerDown={onGripDown} title="Drag to reorder">
            <svg width="9" height="13" viewBox="0 0 9 13" fill="currentColor"><circle cx="2" cy="2" r="1.1"/><circle cx="7" cy="2" r="1.1"/><circle cx="2" cy="6.5" r="1.1"/><circle cx="7" cy="6.5" r="1.1"/><circle cx="2" cy="11" r="1.1"/><circle cx="7" cy="11" r="1.1"/></svg>
          </div>
          <div className="dc-labeltext" onClick={onFocus} title="Click to focus">
            <DCEditable value={label} onChange={onRename} onClick={(e) => e.stopPropagation()}
              style={{ fontSize: 15, fontWeight: 500, color: DC.label, lineHeight: 1.3 }} />
          </div>
        </div>
        <div className="dc-btns">
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button className="dc-kebab" title="More" onClick={() => setMenuOpen((o) => !o)}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><circle cx="2.5" cy="6" r="1.1"/><circle cx="6" cy="6" r="1.1"/><circle cx="9.5" cy="6" r="1.1"/></svg>
            </button>
            {menuOpen && (
              <div className="dc-menu" onPointerDown={(e) => e.stopPropagation()}>
                <button onClick={() => doExport('png')}>Download PNG</button>
                <button onClick={() => doExport('html')}>Download HTML</button>
                <hr />
                <button className="dc-danger"
                  onClick={() => { if (confirming) { setMenuOpen(false); onDelete(); } else setConfirming(true); }}>
                  {confirming ? 'Click again to delete' : 'Delete'}
                </button>
              </div>
            )}
          </div>
          <button className="dc-expand" onClick={onExpand ?? onFocus} title="Focus">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M7 1h4v4M5 11H1V7M11 1L7.5 4.5M1 11l3.5-3.5"/></svg>
          </button>
        </div>
      </div>
      <div ref={cardRef} className="dc-card"
        style={{ borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,.08),0 4px 16px rgba(0,0,0,.06)', overflow: 'hidden', width, height, background: '#fff', ...style }}>
        {children || <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 13, fontFamily: DC.font }}>{id}</div>}
      </div>
    </div>
  );
}

// Inline rename — commits on blur or Enter.
function DCEditable({ value, onChange, style, tag = 'span', onClick }) {
  const T = tag;
  return (
    <T className="dc-editable" contentEditable suppressContentEditableWarning
      onClick={onClick}
      onPointerDown={(e) => e.stopPropagation()}
      onBlur={(e) => onChange && onChange(e.currentTarget.textContent)}
      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
      style={style}>{value}</T>
  );
}
