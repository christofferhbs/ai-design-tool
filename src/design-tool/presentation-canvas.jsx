import React from 'react';
import { DC } from './tokens.js';
import { Canvas, ArtboardSurface, sectionAttrFor } from './canvas.jsx';

const CARD_W = 360;

// PresentationCanvas — the built/deployed mode. Renders a clean gallery of
// scaled artboard cards; opening one delegates to the shared focus view in
// canvas.jsx. The top header (including section jump buttons) is rendered
// by Canvas; section jumps default to scrollIntoView on the marker below.
// No editing, no pan/zoom.

export function PresentationCanvas({ title, children }) {
  return (
    <Canvas
      title={title}
      body={({ sections, setFocus }) => (
        <Gallery sections={sections} setFocus={setFocus} />
      )}
    >
      {children}
    </Canvas>
  );
}

function Gallery({ sections, setFocus }) {
  return (
    <main style={{ padding: '112px 60px 72px', boxSizing: 'border-box' }}>
      {sections.map((section) => (
        <section
          key={section.id}
          {...sectionAttrFor(section.id)}
          style={{ marginBottom: 56, scrollMarginTop: 80 }}
        >
          <div style={{ marginBottom: 18 }}>
            <h2 style={{ margin: 0, fontSize: 28, lineHeight: 1.1, fontWeight: 650, color: DC.title }}>
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
  );
}

function ArtboardCard({ section, artboard, setFocus }) {
  const scale = CARD_W / artboard.width;
  const cardH = Math.round(artboard.height * scale);
  const open = () => setFocus({ sectionId: section.id, artboardId: artboard.id });

  return (
    <div style={{ width: CARD_W }}>
      <div
        className="dt-card"
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
