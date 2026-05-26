import React from 'react';
import { DC, gridSvg, getProjectTitle } from './tokens.js';
import { DCArtboard, DCSection, dcFlatten } from './markers.jsx';
import { useFocusRoute, withRouteSlugs } from './route.jsx';
import { ProjectHeader, HeaderDivider, HeaderNav, FocusHeader, FocusArrow, FocusDots } from './nav.jsx';

// The Canvas primitive. Both the DesignCanvas (dev) and the
// PresentationCanvas (built) are wrappers around this. Canvas owns the work
// every mode has to do: walk the DCSection/DCArtboard children, sync the
// focused artboard to the URL hash, render the top header (with section
// jump buttons), render the focus view. Modes only differ in their `body`
// (how artboards lay out when not focused) and optional `onSectionNav` /
// `transformSections`.
//
// Section nav contract: each mode's body should mark each section element
// with `data-canvas-section={section.id}`. The default onSectionNav scrolls
// that element into view; modes can override with a custom handler (the
// DesignCanvas uses it to pan its viewport instead of scrolling).

const SECTION_ATTR = 'data-canvas-section';

export const sectionAttrFor = (id) => ({ [SECTION_ATTR]: id });

function defaultSectionNav(id) {
  const el = document.querySelector(`[${SECTION_ATTR}="${CSS.escape(String(id))}"]`);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function parseSections(children) {
  return withRouteSlugs(
    dcFlatten(children).flatMap((sectionNode) => {
      if (!sectionNode || sectionNode.type !== DCSection) return [];
      const sectionId = sectionNode.props.id ?? sectionNode.props.title;
      if (!sectionId) return [];

      const artboards = dcFlatten(sectionNode.props.children).flatMap((artboardNode) => {
        if (!artboardNode || artboardNode.type !== DCArtboard) return [];
        const artboardId = artboardNode.props.id ?? artboardNode.props.label;
        if (!artboardId) return [];
        return [{
          id: artboardId,
          label: artboardNode.props.label ?? artboardId,
          width: artboardNode.props.width ?? 260,
          height: artboardNode.props.height ?? 480,
          style: artboardNode.props.style ?? {},
          children: artboardNode.props.children,
        }];
      });

      if (!artboards.length) return [];
      return [{
        id: sectionId,
        title: sectionNode.props.title ?? sectionId,
        subtitle: sectionNode.props.subtitle,
        gap: sectionNode.props.gap,
        artboards,
      }];
    }),
  );
}

export function Canvas({ title, children, body, transformSections, onSectionNav, background = true }) {
  const parsed = React.useMemo(() => parseSections(children), [children]);
  const sections = React.useMemo(
    () => (transformSections ? transformSections(parsed) : parsed),
    [parsed, transformSections],
  );
  const [, setFocus, active] = useFocusRoute(sections);

  const resolvedTitle = title ?? getProjectTitle();
  const goToSection = onSectionNav ?? defaultSectionNav;

  return (
    <div style={{ minHeight: '100vh', background: DC.bg, fontFamily: DC.font, color: DC.title }}>
      <ProjectHeader title={resolvedTitle}>
        {sections.length > 0 && (
          <>
            <HeaderDivider />
            <HeaderNav
              items={sections.map((s) => ({ id: s.id, label: s.title }))}
              onSelect={goToSection}
            />
          </>
        )}
      </ProjectHeader>
      {active ? (
        <FocusView
          sections={sections}
          section={active.section}
          artboard={active.artboard}
          setFocus={setFocus}
        />
      ) : (
        <div
          style={background ? {
            minHeight: '100vh',
            backgroundImage: gridSvg,
            backgroundSize: '120px 120px',
          } : undefined}
        >
          {body({ sections, setFocus })}
        </div>
      )}
    </div>
  );
}

function FocusView({ sections, section, artboard, setFocus }) {
  const [vp, setVp] = React.useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  const sectionIdx = sections.findIndex((s) => s.id === section.id);
  const peers = section.artboards;
  const artboardIdx = peers.findIndex((a) => a.id === artboard.id);

  const go = React.useCallback((delta) => {
    const next = peers[(artboardIdx + delta + peers.length) % peers.length];
    if (next) setFocus({ sectionId: section.id, artboardId: next.id });
  }, [artboardIdx, peers, section.id, setFocus]);

  const goSection = React.useCallback((delta) => {
    const n = sections.length;
    for (let i = 1; i < n; i++) {
      const nextSection = sections[(((sectionIdx + delta * i) % n) + n) % n];
      const nextArtboard = nextSection?.artboards[0];
      if (nextArtboard) {
        setFocus({ sectionId: nextSection.id, artboardId: nextArtboard.id });
        return;
      }
    }
  }, [sectionIdx, sections, setFocus]);

  React.useEffect(() => {
    const onResize = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); setFocus(null); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowUp') { e.preventDefault(); goSection(-1); }
      if (e.key === 'ArrowDown') { e.preventDefault(); goSection(1); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [go, goSection, setFocus]);

  const paddingX = vp.w < 760 ? 28 : 112;
  const paddingY = vp.h < 680 ? 104 : 150;
  const arrowOffset = vp.w < 760 ? -22 : -72;
  const scale = Math.max(0.1, Math.min(
    (vp.w - paddingX * 2) / artboard.width,
    (vp.h - paddingY) / artboard.height,
    2,
  ));
  const frameW = Math.max(1, artboard.width * scale);
  const frameH = Math.max(1, artboard.height * scale);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: '#faf9f7',
        fontFamily: DC.font,
        color: DC.title,
        overflow: 'hidden',
      }}
    >
      <FocusHeader
        sectionTitle={section.title}
        label={artboard.label}
        onClose={() => setFocus(null)}
      />

      <div
        style={{
          position: 'absolute',
          top: 64,
          bottom: 52,
          left: paddingX,
          right: paddingX,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <FocusArrow dir="left" offset={arrowOffset} onClick={() => go(-1)} />
        <div style={{ width: frameW, height: frameH, position: 'relative' }}>
          <ArtboardSurface artboard={artboard} scale={scale} focused />
        </div>
        <FocusArrow dir="right" offset={arrowOffset} onClick={() => go(1)} />
      </div>

      <FocusDots
        items={peers}
        activeIdx={artboardIdx}
        onSelect={(idx) => setFocus({ sectionId: section.id, artboardId: peers[idx].id })}
      />
    </div>
  );
}

// One scaled-snapshot box used everywhere artboard children render:
// gallery cards, the focus view, and inside the DesignCanvas viewport.
// Same React tree, just at different scales.
export function ArtboardSurface({ artboard, scale, focused = false }) {
  return (
    <div
      style={{
        width: artboard.width,
        height: artboard.height,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        background: '#fff',
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: focused
          ? '0 18px 60px rgba(40,30,20,.16),0 0 0 1px rgba(40,30,20,.08)'
          : 'none',
        ...artboard.style,
      }}
    >
      {artboard.children || (
        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 13, fontFamily: DC.font }}>
          {artboard.id}
        </div>
      )}
    </div>
  );
}
