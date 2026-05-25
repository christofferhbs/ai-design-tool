// preorder-full-timeline.jsx — full preorder lifecycle through delivery.
// Same 4-station structure as the order timeline but focused on the
// preorder delivery. The transition from preorder to order is absorbed
// silently into the timeline.

import React from 'react';
import { useTL } from '../timeline/context.jsx';
import { paletteVars } from '../theme/palette.js';
import { fmtShort, fmtRangeShort, addDays, MONTHS_LONG } from '../data/format.js';
import { DELIVERIES } from '../data/deliveries.js';
import { Timeline } from '../timeline/timeline.jsx';
import { DeliveryCard } from '../timeline/delivery-card.jsx';

export function PreorderFullTimeline({ width = 1200, height = 660 }) {
  const { today, visible, palette } = useTL();

  const focus = visible[0];
  const target = visible[1];
  if (!focus || !target) return null;

  const focusIdx = DELIVERIES.indexOf(focus);
  const focusPrev = focusIdx > 0 ? DELIVERIES[focusIdx - 1] : null;
  const openDate = focusPrev ? focusPrev.cutoff : addDays(focus.cutoff, -30);
  const infoSendDate = addDays(target.winStart, -3);

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
      title: 'Leveringsinfo sendes',
      date: fmtShort(infoSendDate),
      subtitle: 'Du modtager en email med præcis dag og tidspunkt senest tre dage før.',
      icon: 'mail', accent: 'rich',
    },
    {
      title: 'Bestilling leveres',
      date: fmtRangeShort(target.winStart, target.winEnd),
      subtitle: 'Vi leverer til din dør på den dag ruten bestemmer.',
      icon: 'house', accent: 'rich',
    },
  ];

  // Marker walks the "open" phase (station 1 → 2). After focus.cutoff, the
  // visible list rolls and we land on the next preorder target's station 1.
  const todayFrac = (() => {
    if (today < openDate) return 0;
    if (today < focus.cutoff) {
      const f = (today - openDate) / (focus.cutoff - openDate);
      return f * (1 / 3);
    }
    return 1 / 3;
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
