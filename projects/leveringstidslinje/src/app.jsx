// app.jsx — assembles all prototypes onto a single design canvas.

import React from 'react';
import { createRoot } from 'react-dom/client';
import { createPortal } from 'react-dom';

import './colors_and_type.css';

import { TimelineProvider, todayFromOffset } from './timeline/context.jsx';
import { WEEKDAYS, MONTHS_LONG, fmtShort } from './data/format.js';
import {
  ProjectShell,
  DCSection,
  DCArtboard,
  useTweaks,
  TweaksPanel,
  TweakSection,
  TweakRow,
} from '../../../src/design-tool/index.jsx';
import { FrontPage, NavPrototype, TidslinjeSectionContent } from './prototypes/front-page.jsx';
import { OrderTimeline } from './prototypes/order-timeline.jsx';
import { PreorderTimeline } from './prototypes/preorder-timeline.jsx';
import { PreorderFullTimeline } from './prototypes/preorder-full-timeline.jsx';
import { HeaderBannerSpecimen } from './prototypes/header-banner.jsx';

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "offsetDays": 0,
  "palette": "paper",
  "timelineView": "del"
}/*EDITMODE-END*/;

const OFFSET_MIN = 0;
const OFFSET_MAX = 35;

const ANCHORS = [
  { label: 'Lige åbnet',     day: 1  },
  { label: 'Tæt på frist',   day: 28 },
  { label: 'Frist passeret', day: 32 },
];

const TIMELINE_W = 1200;
const TIMELINE_H = 720;
const WRAPPER_H = 840;

function OrderArtboard() {
  return (
    <TidslinjeSectionContent
      TimelineComponent={OrderTimeline}
      width={TIMELINE_W}
      timelineHeight={TIMELINE_H}
      subtitle="Vi har som regel dyr klar, så vi kan levere en gang om måneden."
    />
  );
}

function PreorderArtboard({ view }) {
  const Comp = view === 'fuld' ? PreorderFullTimeline : PreorderTimeline;
  return (
    <TidslinjeSectionContent
      TimelineComponent={Comp}
      width={TIMELINE_W}
      timelineHeight={TIMELINE_H}
      title="Forudbestilling"
      titleColor="#000"
      subtitle="Forudbestil til en kommende levering."
    />
  );
}

function ForsideFullscreen({ variant, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: '#f5f3ee', overflowY: 'auto' }}>
      <FrontPage standalone variant={variant} />
      <button
        onClick={onClose}
        style={{
          position: 'fixed', top: 16, right: 16, zIndex: 100000,
          appearance: 'none', border: 0, borderRadius: 8,
          background: 'rgba(0,0,0,.55)', color: '#fff',
          width: 36, height: 36, fontSize: 18, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
        ✕
      </button>
    </div>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [forsideFS, setForsideFS] = React.useState(false);
  const today = todayFromOffset(t.offsetDays);
  const todayLabel = `${WEEKDAYS[today.getDay()]} ${today.getDate()}. ${MONTHS_LONG[today.getMonth()]} ${today.getFullYear()}`;

  React.useEffect(() => {
    const onFsChange = () => { if (!document.fullscreenElement) setForsideFS(false); };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const openForsideFS = React.useCallback(() => {
    setForsideFS(true);
    document.documentElement.requestFullscreen?.().catch(() => {});
  }, []);

  const closeForsideFS = React.useCallback(() => {
    setForsideFS(false);
    if (document.fullscreenElement) document.exitFullscreen();
  }, []);

  const preorderLabel = t.timelineView === 'fuld'
    ? 'Hele forudbestillingsforløbet'
    : 'Forudbestilling';

  const TIMELINE_VIEWS = [
    { key: 'order', label: 'Bestilling' },
    { key: 'del',   label: 'Forudbestilling' },
    { key: 'fuld',  label: 'Hele forløbet' },
  ];

  return (
    <TimelineProvider offsetDays={t.offsetDays} visibleCount={2} palette={t.palette}>
      <ProjectShell title="Leveringstidslinje">
        <DCSection id="forside" title="Forside">
          <DCArtboard id="hjemmeside" label="Højvang Økologi forside" width={1200} height={820}
            onExpand={openForsideFS}>
            <FrontPage width={1200} height={820} variant={t.timelineView} />
          </DCArtboard>
        </DCSection>

        <DCSection id="leveringstidslinje" title="Leveringstidslinje">
          <DCArtboard id="order" label="Bestilling" width={TIMELINE_W} height={WRAPPER_H}>
            <OrderArtboard />
          </DCArtboard>
          <DCArtboard id="preorder" label={preorderLabel} width={TIMELINE_W} height={WRAPPER_H}>
            <PreorderArtboard view={t.timelineView} />
          </DCArtboard>
        </DCSection>

        <DCSection id="header" title="Header">
          <DCArtboard id="nav-cream" label="Navigation – cream" width={1200} height={72}>
            <NavPrototype width={1200} height={72} dark={false} />
          </DCArtboard>
          <DCArtboard id="nav-dark" label="Navigation – på grøn" width={1200} height={72}>
            <NavPrototype width={1200} height={72} dark={true} />
          </DCArtboard>
          <DCArtboard id="banner" label="Banner" width={1200} height={100}>
            <HeaderBannerSpecimen width={1200} height={100} />
          </DCArtboard>
        </DCSection>
      </ProjectShell>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Hvor er vi i tiden?" />
        <TweakRow label="Dagens dato" value={fmtShort(today)}>
          <input type="range" className="twk-slider"
            min={OFFSET_MIN} max={OFFSET_MAX} step={1}
            value={t.offsetDays}
            onChange={(e) => setTweak('offsetDays', Number(e.target.value))} />
        </TweakRow>
        <div style={{ font: '500 11px/1.3 "Montserrat", sans-serif',
          color: 'var(--brand-ink-soft)', padding: '0 2px',
          letterSpacing: '0.02em' }}>
          {todayLabel}
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
          {ANCHORS.map((a) => {
            const isActive = t.offsetDays === a.day;
            return (
              <button key={a.day} type="button"
                onClick={() => setTweak('offsetDays', a.day)}
                style={{
                  appearance: 'none', flex: 1,
                  minHeight: 32, padding: '4px 6px',
                  border: 0, borderRadius: 7,
                  background: isActive ? 'rgba(0,0,0,.78)' : 'rgba(0,0,0,.06)',
                  color: isActive ? '#fff' : 'inherit',
                  font: '500 10.5px/1.2 ui-sans-serif, system-ui, -apple-system, sans-serif',
                  cursor: 'default', overflowWrap: 'anywhere',
                }}>
                {a.label}
              </button>
            );
          })}
        </div>

        <TweakSection label="Tidslinje" />
        <div style={{ display: 'flex', gap: 6 }}>
          {TIMELINE_VIEWS.map(({ key, label }) => {
            const isActive = t.timelineView === key;
            return (
              <button key={key} type="button"
                onClick={() => setTweak('timelineView', key)}
                style={{
                  appearance: 'none', flex: 1,
                  minHeight: 32, padding: '4px 6px',
                  border: 0, borderRadius: 7,
                  background: isActive ? 'rgba(0,0,0,.78)' : 'rgba(0,0,0,.06)',
                  color: isActive ? '#fff' : 'inherit',
                  font: '500 10.5px/1.2 ui-sans-serif, system-ui, -apple-system, sans-serif',
                  cursor: 'default', overflowWrap: 'anywhere',
                }}>
                {label}
              </button>
            );
          })}
        </div>
      </TweaksPanel>
      {forsideFS && createPortal(
        <ForsideFullscreen variant={t.timelineView} onClose={closeForsideFS} />,
        document.body,
      )}
    </TimelineProvider>
  );
}

createRoot(document.getElementById('root')).render(<App />);
