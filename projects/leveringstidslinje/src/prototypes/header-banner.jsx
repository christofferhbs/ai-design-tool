// header-banner.jsx — site-wide header banner.
// Three-cell info strip at the very top of the webshop:
//   Gratis levering over 1.000 kr. | Næste levering [DATO] | Bestil senest [FRIST]
//
// Colors come straight from the leveringsproces spec (#3a5a40 / #f0ead2 /
// #c9a84c), not from brand tokens — slightly different shades to the
// Højvang green/cream and the spec calls them out explicitly.

import React from 'react';
import { useTL } from '../timeline/context.jsx';
import { paletteVars } from '../theme/palette.js';
import { fmtShort, fmtRangeShort } from '../data/format.js';

const BANNER_BG = '#3a5a40';
const BANNER_TEXT = '#f0ead2';
const BANNER_GOLD = '#c9a84c';
const BANNER_HEIGHT = 44;

export function HeaderBanner() {
  const { visible } = useTL();
  const focus = visible[0];
  if (!focus) return null;

  const deliveryStr = fmtRangeShort(focus.winStart, focus.winEnd);
  const cutoffStr = fmtShort(focus.cutoff);

  const Cell = ({ label, value }) => (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6 }}>
      <span>{label}</span>
      <span style={{ color: BANNER_GOLD, fontWeight: 600 }}>{value}</span>
    </span>
  );

  const Sep = () => (
    <span style={{ opacity: 0.35, fontWeight: 300 }}>|</span>
  );

  return (
    <div style={{
      width: '100%', height: BANNER_HEIGHT,
      background: BANNER_BG,
      color: BANNER_TEXT,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 24,
      font: '500 14px/1 "Work Sans", sans-serif',
      letterSpacing: '0.01em',
    }}>
      <Cell label="Gratis levering over" value="1.000 kr." />
      <Sep />
      <Cell label="Næste levering" value={deliveryStr} />
      <Sep />
      <Cell label="Bestil senest" value={cutoffStr} />
    </div>
  );
}

export function HeaderBannerSpecimen({ width = 1200, height = 100 }) {
  const { palette } = useTL();
  return (
    <div style={{
      ...paletteVars(palette),
      width, height,
      background: 'var(--paper)',
      borderRadius: 4,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      <HeaderBanner />
    </div>
  );
}
