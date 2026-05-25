// preorder-timeline.jsx — preorder phase only (open → cutoff → order opens).

import React from 'react';
import { useTL } from '../timeline/context.jsx';
import { paletteVars } from '../theme/palette.js';
import { fmtShort, addDays, MONTHS_LONG } from '../data/format.js';
import { DELIVERIES } from '../data/deliveries.js';
import { Timeline } from '../timeline/timeline.jsx';
import { DeliveryCard } from '../timeline/delivery-card.jsx';

export function PreorderTimeline({ width = 1200, height = 700 }) {
  const { today, visible, palette } = useTL();

  // target = current preorder delivery (visible[1])
  // focus  = current active order (visible[0]) — its cutoff = the preorder
  //          cutoff for target.
  const focus = visible[0];
  const target = visible[1];
  if (!focus || !target) return null;

  // openDate for target's preorder = focus's prev cutoff (the moment when
  // focus's own preorder closed and target became the new preorder).
  const focusIdx = DELIVERIES.indexOf(focus);
  const focusPrev = focusIdx > 0 ? DELIVERIES[focusIdx - 1] : null;
  const openDate = focusPrev ? focusPrev.cutoff : addDays(focus.cutoff, -30);

  const stations = [
    {
      title: 'Åben for forudbestilling',
      date: fmtShort(openDate),
      subtitle: 'Forudbestil frit indtil fristen.',
      icon: 'basket', accent: 'rich',
    },
    {
      title: 'Frist for forudbestilling',
      date: fmtShort(focus.cutoff),
      subtitle: 'Der lukkes for forudbestillinger.',
      icon: 'lock', accent: 'warn',
    },
    {
      title: 'Bestilling åbner',
      date: fmtShort(focus.cutoff),
      subtitle: 'Din forudbestilling er nu bestillingen for kommende levering.',
      icon: 'basket', accent: 'rich',
    },
  ];

  const todayFrac = (() => {
    if (today < openDate) return 0;
    if (today < focus.cutoff) {
      const f = (today - openDate) / (focus.cutoff - openDate);
      return f * 0.5;
    }
    return 1;
  })();

  const fmtBig = (d) => `${d.winStart.getDate()}.-${d.winEnd.getDate()}. ${MONTHS_LONG[d.winStart.getMonth()]}`;
  const card = {
    eyebrow: `${target.label.toUpperCase()}LEVERING`,
    bigDate: fmtBig(target),
    deadlineEyebrow: 'FORUDBESTILLINGSFRIST',
    deadline: `Forudbestil senest ${fmtShort(focus.cutoff)}`,
    variant: 'horizon',
  };

  return (
    <div style={{
      ...paletteVars(palette),
      '--rich': '#4e7730',
      '--today': '#4e7730',
      background: 'var(--paper)',
      width, height: height || 'auto', position: 'relative', borderRadius: 4,
      fontFamily: '"Work Sans", sans-serif',
      padding: '28px 40px',
      boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column', gap: 28,
    }}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '50%', minWidth: 360 }}>
          <DeliveryCard {...card} />
        </div>
      </div>

      <Timeline stations={stations} todayFrac={todayFrac} today={today} />
    </div>
  );
}
