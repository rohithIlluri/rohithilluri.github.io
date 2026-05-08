export const PALETTE = {
  '.': null,
  ' ': null,
  r: '#e63946',
  y: '#ffd166',
  b: '#3a86ff',
  s: '#f4a261',
  o: '#fb8500',
  w: '#f1faee',
  g: '#4ade80',
  k: '#1d1d1d',
  c: '#22d3ee',
  p: '#c084fc',
};

export const COLOR_CLASS = Object.fromEntries(
  Object.keys(PALETTE).map(k => [k, k === '.' || k === ' ' ? '' : `ac-${k}`])
);
