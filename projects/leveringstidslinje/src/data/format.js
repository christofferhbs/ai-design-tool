// format.js — Danish date formatting + day arithmetic.

export const MS_PER_DAY = 86400000;

export const MONTHS_LONG = [
  'januar', 'februar', 'marts', 'april', 'maj', 'juni',
  'juli', 'august', 'september', 'oktober', 'november', 'december',
];
export const MONTHS_SHORT = [
  'jan', 'feb', 'mar', 'apr', 'maj', 'jun',
  'jul', 'aug', 'sep', 'okt', 'nov', 'dec',
];
export const WEEKDAYS = ['søn', 'man', 'tirs', 'ons', 'tors', 'fre', 'lør'];

export function fmtShort(d) {
  return `${d.getDate()}. ${MONTHS_SHORT[d.getMonth()]}`;
}

export function fmtRangeShort(a, b) {
  if (a.getMonth() === b.getMonth())
    return `${a.getDate()}.-${b.getDate()}. ${MONTHS_SHORT[a.getMonth()]}`;
  return `${a.getDate()}. ${MONTHS_SHORT[a.getMonth()]}-${b.getDate()}. ${MONTHS_SHORT[b.getMonth()]}`;
}

export function addDays(d, n) {
  return new Date(d.getTime() + n * MS_PER_DAY);
}
