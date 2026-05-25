// context.jsx — TimelineProvider + useTL.
// Computes today's date from the slider offset and exposes the list of
// deliveries still in play (cutoff in the future).

import React from 'react';
import { ANCHOR, DELIVERIES } from '../data/deliveries.js';
import { MS_PER_DAY } from '../data/format.js';

export function todayFromOffset(offsetDays) {
  return new Date(ANCHOR.getTime() + offsetDays * MS_PER_DAY);
}

export function visibleDeliveries(today, count = 2) {
  return DELIVERIES.filter((d) => d.cutoff.getTime() > today.getTime()).slice(0, count);
}

const TimelineCtx = React.createContext(null);

export function TimelineProvider({ offsetDays, visibleCount, palette, children }) {
  const today = todayFromOffset(offsetDays);
  const visible = visibleDeliveries(today, visibleCount);
  const value = { today, visible, visibleCount, palette, offsetDays };
  return <TimelineCtx.Provider value={value}>{children}</TimelineCtx.Provider>;
}

export const useTL = () => React.useContext(TimelineCtx);
