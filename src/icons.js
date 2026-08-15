// Minimal inline SVG icon set (stroke-based, 24x24 viewbox) used in place of photography
// we don't have local rights/access to. Keeps the site self-contained with no binary assets.

const ICONS = {
  drop: '<path d="M12 2C12 2 5 11 5 15.5A7 7 0 0019 15.5C19 11 12 2 12 2Z"/>',
  home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/>',
  building: '<path d="M4 21V4h9v17"/><path d="M13 21V9h7v12"/><path d="M7 8h2M7 12h2M7 16h2M16 13h2M16 17h2"/>',
  downspout: '<path d="M7 3v8a4 4 0 004 4h1"/><path d="M12 15v6"/><path d="M9 18l3 3 3-3"/>',
  trench: '<path d="M3 8h18"/><path d="M5 8v10h14V8"/><path d="M9 8v10M15 8v10"/>',
  grade: '<path d="M3 18l6-9 4 5 3-4 5 8"/>',
  pump: '<circle cx="12" cy="9" r="5"/><path d="M12 14v7"/><path d="M9 21h6"/>',
  shield: '<path d="M12 2l8 4v6c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6l8-4Z"/>',
  pipe: '<path d="M4 9h9a4 4 0 014 4v7"/><circle cx="4" cy="9" r="2"/><circle cx="17" cy="20" r="2"/>',
  gravel: '<circle cx="7" cy="16" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="17" cy="16" r="1.6"/><circle cx="9.5" cy="18.5" r="1.6"/><circle cx="14.5" cy="18.5" r="1.6"/><path d="M3 20h18"/>',
  dig: '<path d="M3 21l6-6"/><path d="M13 3l8 8-4 4-8-8 4-4Z"/><path d="M9 15l2 2"/>',
  excavate: '<path d="M4 20h16"/><path d="M6 20V10l7-6 7 6v10"/><path d="M10 20v-6h4v6"/>',
  pool: '<rect x="3" y="6" width="18" height="10" rx="2"/><path d="M3 20c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2"/>',
  jet: '<path d="M12 3v6"/><path d="M12 21c3-3 5-6 5-9a5 5 0 00-10 0c0 3 2 6 5 9Z"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  pin: '<path d="M12 21s7-6.8 7-12a7 7 0 10-14 0c0 5.2 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/>',
  phone: '<path d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.2.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 013 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z"/>',
}

export function icon(name, size = 24, cls = '') {
  const body = ICONS[name] || ICONS.drop
  return `<svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`
}

export function iconFilled(name, size = 15) {
  if (name === 'check') return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"></path></svg>`
  if (name === 'shield') return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 1L3 5v6c0 5.6 3.8 10.7 9 12 5.2-1.3 9-6.4 9-12V5l-9-4z"></path></svg>`
  if (name === 'phone') return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.2.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 013 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z"></path></svg>`
  return ''
}

export function logoMark(size = 40) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <circle cx="20" cy="20" r="20" fill="#1c6fd6"/>
    <path d="M20 8c0 0-8 10-8 15.5a8 8 0 0016 0C28 18 20 8 20 8Z" fill="#fff"/>
  </svg>`
}
