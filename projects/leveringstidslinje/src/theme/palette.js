// palette.js — two-mode (paper / ink) CSS variable themes.
// Returned as a plain object so it can be spread into a React `style` prop.

export function paletteVars(palette) {
  const common = {
    '--card-bg': '#2a4e28',           // primary card = rich green
    '--card-bg-horizon': '#4e7730',   // horizon card = wholesome (mid) green
    '--card-fg': '#f5f3ee',
    '--card-warn-bg': '#e8c468',      // warning yellow
    '--card-warn-fg': '#2b2208',
  };
  if (palette === 'ink') {
    return {
      ...common,
      '--paper': '#2a4e28',
      '--ink': '#f5f3ee',
      '--ink-soft': 'rgba(245,243,238,0.78)',
      '--ink-faint': 'rgba(245,243,238,0.4)',
      '--accent': '#e1b66b',
      '--accent-2': '#a8c89a',
      '--cutoff': '#e1b66b',
      '--today': '#f5f3ee',
      '--grid': 'rgba(245,243,238,0.12)',
      '--rich': '#f5f3ee',
    };
  }
  return {
    ...common,
    '--paper': '#f5f3ee',
    '--ink': '#000000',
    '--ink-soft': 'rgba(0,0,0,0.78)',
    '--ink-faint': 'rgba(0,0,0,0.35)',
    '--accent': '#8a6822',
    '--accent-2': '#2a4e28',
    '--cutoff': '#8a6822',
    '--today': '#2a4e28',
    '--grid': 'rgba(0,0,0,0.10)',
    '--rich': '#2a4e28',
  };
}
