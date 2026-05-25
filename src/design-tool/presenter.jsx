import React from 'react';
import { DCArtboard, DCSection, dcFlatten } from './markers.jsx';
import { usePresenterFocusRoute, withRouteSlugs } from './route.jsx';

const DC = {
  bg: '#f0eee9',
  grid: 'rgba(0,0,0,0.06)',
  label: 'rgba(60,50,40,0.7)',
  title: 'rgba(40,30,20,0.85)',
  subtitle: 'rgba(60,50,40,0.6)',
  font: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
};

const CARD_W = 360;
const gridSvg = `url("data:image/svg+xml,%3Csvg width='120' height='120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M120 0H0v120' fill='none' stroke='${encodeURIComponent(DC.grid)}' stroke-width='1'/%3E%3C/svg%3E")`;

function getProjectTitle() {
  const parts = window.location.pathname.split('/').filter(Boolean);
  const slug = parts[parts.length - 1] || 'project';
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function parseSections(children) {
  const sections = dcFlatten(children).flatMap((sectionNode) => {
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
      artboards,
    }];
  });
  return withRouteSlugs(sections);
}

export function Presenter({ title, children }) {
  const sections = React.useMemo(() => parseSections(children), [children]);
  const [, setFocus, active] = usePresenterFocusRoute(sections);

  React.useEffect(() => {
    const styleId = 'presenter-focus-styles';
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = [
      '.presenter-card:focus-visible{outline:2px solid rgba(201,100,66,.95);outline-offset:4px}',
      '.presenter-icon-button:focus-visible,.presenter-nav-button:focus-visible,.presenter-dot:focus-visible{outline:2px solid rgba(201,100,66,.95);outline-offset:3px}',
    ].join('\n');
    document.head.appendChild(style);
    return () => {
      if (document.getElementById(styleId) === style) style.remove();
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: DC.bg, fontFamily: DC.font, color: DC.title }}>
      {active ? (
        <PresenterFocus
          sections={sections}
          section={active.section}
          artboard={active.artboard}
          setFocus={setFocus}
        />
      ) : (
        <PresenterGallery
          title={title ?? getProjectTitle()}
          sections={sections}
          setFocus={setFocus}
        />
      )}
    </div>
  );
}

function PresenterGallery({ title, sections, setFocus }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: DC.bg,
        backgroundImage: gridSvg,
        backgroundSize: '120px 120px',
      }}
    >
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          height: 64,
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          padding: '0 40px',
          boxSizing: 'border-box',
          background: 'rgba(240,238,233,.82)',
          WebkitBackdropFilter: 'blur(18px) saturate(140%)',
          backdropFilter: 'blur(18px) saturate(140%)',
          borderBottom: '1px solid rgba(60,50,40,.09)',
        }}
      >
        <a
          href={import.meta.env.BASE_URL}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: DC.label,
            textDecoration: 'none',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <ArrowLeftIcon size={13} />
          Projects
        </a>
        <div style={{ width: 1, height: 18, background: 'rgba(60,50,40,.16)' }} />
        <div style={{ fontSize: 17, fontWeight: 650, color: DC.title }}>{title}</div>
      </header>

      <main style={{ padding: '112px 60px 72px', boxSizing: 'border-box' }}>
        {sections.map((section) => (
          <section key={section.id} style={{ marginBottom: 56 }}>
            <div style={{ marginBottom: 18 }}>
              <h2 style={{ margin: 0, fontSize: 28, lineHeight: 1.1, fontWeight: 650, letterSpacing: 0, color: DC.title }}>
                {section.title}
              </h2>
              {section.subtitle && (
                <p style={{ margin: '7px 0 0', fontSize: 15, lineHeight: 1.4, color: DC.subtitle }}>
                  {section.subtitle}
                </p>
              )}
            </div>
            <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {section.artboards.map((artboard) => (
                <ArtboardCard
                  key={artboard.id}
                  section={section}
                  artboard={artboard}
                  setFocus={setFocus}
                />
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}

function ArtboardCard({ section, artboard, setFocus }) {
  const scale = CARD_W / artboard.width;
  const cardH = Math.round(artboard.height * scale);
  const open = () => setFocus({ sectionId: section.id, artboardId: artboard.id });

  return (
    <div style={{ width: CARD_W }}>
      <div
        className="presenter-card"
        role="button"
        tabIndex={0}
        aria-label={`${section.title}: ${artboard.label}`}
        onClick={open}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            open();
          }
        }}
        style={{
          width: CARD_W,
          height: cardH,
          background: '#fff',
          borderRadius: 2,
          overflow: 'hidden',
          cursor: 'pointer',
          boxShadow: '0 1px 3px rgba(0,0,0,.08),0 4px 16px rgba(0,0,0,.06)',
          transition: 'box-shadow .15s, transform .15s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.10),0 8px 28px rgba(0,0,0,.13)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = '';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.08),0 4px 16px rgba(0,0,0,.06)';
        }}
      >
        <div style={{ width: CARD_W, height: cardH, pointerEvents: 'none' }}>
          <ArtboardSurface artboard={artboard} scale={scale} />
        </div>
      </div>
      <div style={{ marginTop: 9, fontSize: 14, fontWeight: 600, lineHeight: 1.25, color: DC.label }}>
        {artboard.label}
      </div>
      <div style={{ marginTop: 3, fontSize: 11, color: DC.subtitle, fontVariantNumeric: 'tabular-nums' }}>
        {artboard.width} x {artboard.height}
      </div>
    </div>
  );
}

function PresenterFocus({ sections, section, artboard, setFocus }) {
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
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 64,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '0 20px',
          boxSizing: 'border-box',
          background: 'rgba(250,249,247,.9)',
          borderBottom: '1px solid rgba(60,50,40,.08)',
        }}
      >
        <button
          className="presenter-icon-button"
          type="button"
          onClick={() => setFocus(null)}
          aria-label="Back to all artboards"
          title="Back to all artboards"
          style={iconButtonStyle}
        >
          <ArrowLeftIcon size={16} />
        </button>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 16, lineHeight: 1.2, fontWeight: 650, color: DC.title, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {section.title}
          </div>
          <div style={{ marginTop: 2, fontSize: 12, lineHeight: 1.2, fontWeight: 500, color: DC.subtitle, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {artboard.label}
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <button
          className="presenter-icon-button"
          type="button"
          onClick={() => setFocus(null)}
          aria-label="Close focus view"
          title="Close"
          style={iconButtonStyle}
        >
          <CloseIcon />
        </button>
      </div>

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
        <button className="presenter-nav-button" type="button" onClick={() => go(-1)} aria-label="Previous artboard" title="Previous artboard" style={{ ...navButtonStyle, left: arrowOffset }}>
          <ChevronIcon dir="left" />
        </button>
        <div style={{ width: frameW, height: frameH, position: 'relative' }}>
          <ArtboardSurface artboard={artboard} scale={scale} focused />
        </div>
        <button className="presenter-nav-button" type="button" onClick={() => go(1)} aria-label="Next artboard" title="Next artboard" style={{ ...navButtonStyle, right: arrowOffset }}>
          <ChevronIcon dir="right" />
        </button>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 20,
          right: 20,
          bottom: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        {peers.map((peer, idx) => (
          <button
            className="presenter-dot"
            key={peer.id}
            type="button"
            aria-label={peer.label}
            onClick={() => setFocus({ sectionId: section.id, artboardId: peer.id })}
            style={{
              width: idx === artboardIdx ? 18 : 7,
              height: 7,
              borderRadius: 999,
              border: 0,
              padding: 0,
              background: idx === artboardIdx ? 'rgba(40,30,20,.82)' : 'rgba(40,30,20,.24)',
              cursor: 'pointer',
              transition: 'width .15s, background .15s',
            }}
          />
        ))}
      </div>
    </div>
  );
}

function ArtboardSurface({ artboard, scale, focused = false }) {
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

const iconButtonStyle = {
  width: 36,
  height: 36,
  border: 0,
  borderRadius: 6,
  padding: 0,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'transparent',
  color: DC.label,
  cursor: 'pointer',
};

const navButtonStyle = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  width: 44,
  height: 44,
  border: 0,
  borderRadius: 22,
  padding: 0,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(40,30,20,.07)',
  color: DC.title,
  cursor: 'pointer',
};

function ArrowLeftIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8.5 3L4.5 7l4 4" />
      <path d="M5 7h6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="M3 3l8 8M11 3l-8 8" />
    </svg>
  );
}

function ChevronIcon({ dir }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={dir === 'left' ? 'M11 3L5 9l6 6' : 'M7 3l6 6-6 6'} />
    </svg>
  );
}
