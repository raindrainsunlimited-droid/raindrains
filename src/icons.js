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

const FILLED_ICONS = {
  check: '<path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/>',
  shield: '<path d="M12 1L3 5v6c0 5.6 3.8 10.7 9 12 5.2-1.3 9-6.4 9-12V5l-9-4z"/>',
  phone: '<path d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.2.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 013 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z"/>',
  facebook: '<path d="M22 12a10 10 0 10-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0022 12z"/>',
  instagram: '<path fill-rule="evenodd" clip-rule="evenodd" d="M12 2c-2.72 0-3.06.01-4.12.06-1.07.05-1.79.22-2.43.46a4.92 4.92 0 00-1.78 1.16A4.92 4.92 0 002.51 5.5c-.24.64-.41 1.36-.46 2.43C2 8.99 2 9.33 2 12.05c0 2.72.01 3.06.06 4.12.05 1.07.22 1.79.46 2.43.25.66.58 1.22 1.13 1.77.55.55 1.11.88 1.77 1.13.64.24 1.36.41 2.43.46 1.06.05 1.4.06 4.12.06 2.72 0 3.06-.01 4.12-.06 1.07-.05 1.79-.22 2.43-.46a4.92 4.92 0 001.77-1.13c.55-.55.88-1.11 1.13-1.77.24-.64.41-1.36.46-2.43.05-1.06.06-1.4.06-4.12 0-2.72-.01-3.06-.06-4.12-.05-1.07-.22-1.79-.46-2.43a4.92 4.92 0 00-1.13-1.77A4.92 4.92 0 0018.55 2.5c-.64-.24-1.36-.41-2.43-.46C15.06 2 14.72 2 12 2zm0 1.8c2.67 0 2.99.01 4.04.06.98.04 1.5.2 1.86.34.47.18.8.4 1.15.75.35.35.57.68.75 1.15.14.36.3.88.34 1.86.05 1.05.06 1.37.06 4.04 0 2.67-.01 2.99-.06 4.04-.04.98-.2 1.5-.34 1.86-.18.47-.4.8-.75 1.15-.35.35-.68.57-1.15.75-.36.14-.88.3-1.86.34-1.05.05-1.37.06-4.04.06-2.67 0-2.99-.01-4.04-.06-.98-.04-1.5-.2-1.86-.34a3.1 3.1 0 01-1.15-.75 3.1 3.1 0 01-.75-1.15c-.14-.36-.3-.88-.34-1.86-.05-1.05-.06-1.37-.06-4.04 0-2.67.01-2.99.06-4.04.04-.98.2-1.5.34-1.86.18-.47.4-.8.75-1.15.35-.35.68-.57 1.15-.75.36-.14.88-.3 1.86-.34 1.05-.05 1.37-.06 4.04-.06zm0 3.5a4.7 4.7 0 100 9.4 4.7 4.7 0 000-9.4zm0 7.75a3.05 3.05 0 110-6.1 3.05 3.05 0 010 6.1zm5.88-7.94a1.1 1.1 0 11-2.2 0 1.1 1.1 0 012.2 0z"/>',
  youtube: '<path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33 2.78 2.78 0 001.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.33 29 29 0 00-.46-5.33zM9.75 15.02V8.48l5.75 3.27z"/>',
  yelp: '<g><ellipse cx="12" cy="5.3" rx="2.1" ry="3.8" transform="rotate(0 12 12)"/><ellipse cx="12" cy="5.3" rx="2.1" ry="3.8" transform="rotate(60 12 12)"/><ellipse cx="12" cy="5.3" rx="2.1" ry="3.8" transform="rotate(120 12 12)"/><ellipse cx="12" cy="5.3" rx="2.1" ry="3.8" transform="rotate(180 12 12)"/><ellipse cx="12" cy="5.3" rx="2.1" ry="3.8" transform="rotate(240 12 12)"/><ellipse cx="12" cy="5.3" rx="2.1" ry="3.8" transform="rotate(300 12 12)"/><circle cx="12" cy="12" r="2.3"/></g>',
}

export function iconFilled(name, size = 15) {
  const body = FILLED_ICONS[name]
  if (!body) return ''
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${body}</svg>`
}

// Hand-recreated vector approximation of the Rain Drains wordmark logo,
// pending the source file. Swap for a real <img> once we have the asset.
export function wordmark(height = 40, onDark = false) {
  const width = Math.round(height * (560 / 120))
  const badge = onDark ? '' : `<g transform="skewX(-10)"><rect x="14" y="0" width="536" height="120" fill="#0b2b4a"/></g>`
  return `<svg width="${width}" height="${height}" viewBox="0 0 560 120" role="img" aria-label="Rain Drains">
    ${badge}
    <text x="290" y="90" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-weight="900" font-size="66" fill="#3aa3e0" letter-spacing="0.5" transform="skewX(-10)">RAIN DRAINS</text>
    <g transform="translate(188,6)"><path d="M0 3 C0 3 -11 17 -11 25 a11 11 0 0022 0 C11 17 0 3 0 3 Z" fill="#5bc0f0" stroke="#fff" stroke-width="3"/></g>
  </svg>`
}
