// Minimal RFC 4180 CSV parse / stringify.
export function parseCSV(text) {
  const rows = []
  let row = [], field = '', i = 0, q = false
  text = text.replace(/^﻿/, '')
  while (i < text.length) {
    const ch = text[i]
    if (q) {
      if (ch === '"') { if (text[i + 1] === '"') { field += '"'; i++ } else q = false }
      else field += ch
    } else if (ch === '"') q = true
    else if (ch === ',') { row.push(field); field = '' }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(field); field = ''
      if (row.some((f) => f !== '')) rows.push(row)
      row = []
    } else field += ch
    i++
  }
  row.push(field)
  if (row.some((f) => f !== '')) rows.push(row)
  return rows
}

export function toCSV(rows) {
  if (!rows.length) return ''
  const cols = Object.keys(rows[0])
  const esc = (v) => {
    const s = v === null || v === undefined ? '' : String(v)
    // Neutralise spreadsheet formula injection.
    const safe = /^[=+\-@\t\r]/.test(s) && !/^-?\d/.test(s) ? `'${s}` : s
    return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
  }
  return [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\r\n')
}
