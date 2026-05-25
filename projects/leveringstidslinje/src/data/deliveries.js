// deliveries.js — fixed monthly delivery schedule.
// Anchor date is the slider's zero point; deliveries have 2-day windows
// with cutoffs 5 days before delivery.

export const ANCHOR = new Date(2026, 7, 1); // 1 Aug 2026

export const DELIVERIES = [
  { id: 'sep', label: 'September', win: [[2026, 8,  5], [2026, 8,  6]], cutoff: [2026, 7, 31] },
  { id: 'okt', label: 'Oktober',   win: [[2026, 9, 17], [2026, 9, 18]], cutoff: [2026, 9, 12] },
  { id: 'nov', label: 'November',  win: [[2026, 10, 21], [2026, 10, 22]], cutoff: [2026, 10, 16] },
  { id: 'dec', label: 'December',  win: [[2026, 11, 19], [2026, 11, 20]], cutoff: [2026, 11, 14] },
  { id: 'jan', label: 'Januar',    win: [[2027, 0, 23], [2027, 0, 24]], cutoff: [2027, 0, 18] },
].map((d) => ({
  id: d.id, label: d.label,
  winStart: new Date(...d.win[0]),
  winEnd:   new Date(...d.win[1]),
  cutoff:   new Date(...d.cutoff),
}));
