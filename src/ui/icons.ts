const icons = {
  arrow: '<path d="M4 12h15m-5-5 5 5-5 5"/>',
  hand: '<path d="M8 12V5a2 2 0 0 1 4 0v6-3a2 2 0 0 1 4 0v4-2a2 2 0 0 1 4 0v6c0 4-3 6-6 6h-1c-2 0-3-1-4-2l-5-6a2 2 0 0 1 3-3l2 2"/>',
  sound: '<path d="M11 4 6 8H3v8h3l5 4Zm5 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
  muted: '<path d="M11 4 6 8H3v8h3l5 4Zm5 5 6 6m0-6-6 6"/>',
  ticket: '<path d="M3 7h18v4a2 2 0 0 0 0 4v4H3v-4a2 2 0 0 0 0-4Zm12 0v3m0 3v2m0 2v2"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  spark: '<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z"/>',
  strap: '<path d="M4 9c0-5 16-5 16 0v5c0 5-16 5-16 0Zm0 0c0 5 16 5 16 0M9 12h6v6H9Zm3 6v3h8"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  plane: '<path d="m2 10 20-7-7 19-4-8Zm9 4L22 3m-11 11-1 6 4-3"/>',
  stylus: '<path d="m4 17 12-13 4 4L7 20l-5 2Zm10-11 4 4M4 17l3 3"/>',
  receipt: '<path d="M5 2h14v20l-3-2-4 2-4-2-3 2Zm3 5h8M8 11h8m-8 4h4"/>',
  sketch: '<path d="M4 2h12l4 4v16H4Zm12 0v5h4M7 10h4v4H7Zm6 4h4v4h-4Zm-2-2h4v2"/>',

};
export function icon(name: keyof typeof icons, cls = '') {
  return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
}
