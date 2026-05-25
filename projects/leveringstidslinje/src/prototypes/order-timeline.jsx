// order-timeline.jsx — active order cycle, open through delivered.

import React from 'react';
import { useTL } from '../timeline/context.jsx';
import { paletteVars } from '../theme/palette.js';
import { fmtShort, fmtRangeShort, addDays, MONTHS_LONG } from '../data/format.js';
import { DELIVERIES } from '../data/deliveries.js';
import { Timeline } from '../timeline/timeline.jsx';
import { DeliveryCard } from '../timeline/delivery-card.jsx';

export function OrderTimeline({ width = 1200, height = 700 }) {
  const { today, visible, palette } = useTL();
  const focus = visible[0];
  if (!focus) return null;

  // Previous delivery's cutoff is when this delivery's order window opened.
  const focusIdx = DELIVERIES.indexOf(focus);
  const prevDelivery = focusIdx > 0 ? DELIVERIES[focusIdx - 1] : null;
  const openDate = prevDelivery ? prevDelivery.cutoff : addDays(focus.cutoff, -30);
  // Delivery info is emailed 3 days before the delivery window starts.
  const infoSendDate = addDays(focus.winStart, -3);

  const stations = [
    {
      title: 'Åben for bestilling',
      date: fmtShort(openDate),
      subtitle: 'Bestil frit indtil fristen.',
      icon: 'basket', accent: 'rich',
    },
    {
      title: 'Frist for bestilling',
      date: fmtShort(focus.cutoff),
      subtitle: 'Der lukkes for bestillinger og vi planlægger ruten.',
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
      date: fmtRangeShort(focus.winStart, focus.winEnd),
      subtitle: 'Vi leverer til din dør på den dag ruten bestemmer.',
      icon: 'house', accent: 'rich',
    },
  ];

  // Visible deliveries all have cutoff > today, so the marker only walks
  // the "open" phase (station 1 → 2). When focus.cutoff hits, visible[0]
  // rolls forward and the marker resets to station 1 on the new focus.
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
    eyebrow: `${focus.label.toUpperCase()}LEVERING`,
    bigDate: fmtBig(focus),
    deadlineEyebrow: 'BESTILLINGSFRIST',
    deadline: `Bestil senest ${fmtShort(focus.cutoff)}`,
    variant: 'primary',
  };

  return (
    <div style={{
      ...paletteVars(palette),
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
