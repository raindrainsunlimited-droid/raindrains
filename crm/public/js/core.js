// Core helpers: API client, HTML escaping, formatting, modals, toasts.

export const state = { user: null, settings: {}, users: [], items: null }

// ---------- API ----------
export async function api(path, opts = {}) {
  const init = { method: opts.method || 'GET', headers: {}, credentials: 'same-origin' }
  if (opts.body !== undefined) {
    if (opts.raw) { init.body = opts.body; Object.assign(init.headers, opts.headers || {}) }
    else { init.body = JSON.stringify(opts.body); init.headers['Content-Type'] = 'application/json' }
  }
  const res = await fetch('/api' + path, init)
  if (res.status === 401 && !path.startsWith('/auth')) { location.hash = '#/login'; throw new Error('Please sign in') }
  const data = res.headers.get('content-type')?.includes('json') ? await res.json() : await res.text()
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`)
  return data
}
export const GET = (p) => api(p)
export const POST = (p, body = {}) => api(p, { method: 'POST', body })
export const PUT = (p, body = {}) => api(p, { method: 'PUT', body })
export const DEL = (p) => api(p, { method: 'DELETE' })

// ---------- HTML ----------
const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
export const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ESC[c])
/** Tagged template that escapes interpolations unless wrapped with raw(). */
export function html(strings, ...vals) {
  let out = strings[0]
  vals.forEach((v, i) => { out += render(v) + strings[i + 1] })
  return new Raw(out)
}
class Raw { constructor(s) { this.s = s } toString() { return this.s } }
export const raw = (s) => new Raw(String(s ?? ''))
function render(v) {
  if (v instanceof Raw) return v.s
  if (Array.isArray(v)) return v.map(render).join('')
  if (v === false || v === null || v === undefined) return ''
  return esc(v)
}
export const $ = (sel, root = document) => root.querySelector(sel)
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)]

// ---------- Formatting ----------
export const money = (c, opts = {}) => {
  const n = (Number(c) || 0) / 100
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: opts.whole ? 0 : 2, maximumFractionDigits: opts.whole ? 0 : 2 })
}
export const toCents = (v) => Math.round(parseFloat(String(v).replace(/[$,]/g, '')) * 100) || 0
export const fromCents = (c) => ((Number(c) || 0) / 100).toFixed(2)
export const z = (n) => String(n).padStart(2, '0')
export const localDate = (d = new Date()) => `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`
export const today = () => localDate()
export function addDays(s, n) { const d = new Date(s + 'T12:00:00'); d.setDate(d.getDate() + n); return localDate(d) }
/** Parse a DB timestamp: 'YYYY-MM-DD HH:MM:SS' (UTC), 'YYYY-MM-DDTHH:MM' (local) or 'YYYY-MM-DD'. */
export function parseTs(s) {
  if (!s) return null
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(s)) return new Date(s.replace(' ', 'T') + 'Z')
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(s + 'T12:00:00')
  return new Date(s)
}
export function fmtDate(s, opts = {}) {
  const d = parseTs(s); if (!d || isNaN(d)) return ''
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', ...(d.getFullYear() !== new Date().getFullYear() || opts.year ? { year: 'numeric' } : {}) })
}
export function fmtDateTime(s) {
  const d = parseTs(s); if (!d || isNaN(d)) return ''
  return `${fmtDate(s)} · ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
}
export function fmtTime(s) { const d = parseTs(s); return d && !isNaN(d) ? d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '' }
export function ago(s) {
  const d = parseTs(s); if (!d) return ''
  const sec = (Date.now() - d) / 1000
  if (sec < 60) return 'just now'
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`
  if (sec < 86400 * 7) return `${Math.floor(sec / 86400)}d ago`
  return fmtDate(s)
}
export const telHref = (p) => 'tel:' + String(p || '').replace(/[^\d+]/g, '')
export const smsHref = (p, body = '') => `sms:${String(p || '').replace(/[^\d+]/g, '')}${body ? `?&body=${encodeURIComponent(body)}` : ''}`
export const mapHref = (addr) => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addr)}`
export const userById = (id) => state.users.find((u) => u.id === Number(id))
export const isOffice = () => ['owner', 'office'].includes(state.user?.role)
export const isOwner = () => state.user?.role === 'owner'

// ---------- Status pills ----------
const STATUS = {
  new: ['New', 'blue'], contacted: ['Contacted', 'purple'], appointment: ['Appointment', 'amber'], estimated: ['Estimate sent', 'teal'], won: ['Won', 'green'], lost: ['Lost', 'gray'],
  draft: ['Draft', 'gray'], sent: ['Sent', 'blue'], viewed: ['Viewed', 'purple'], approved: ['Approved', 'green'], declined: ['Declined', 'red'],
  unscheduled: ['Unscheduled', 'amber'], scheduled: ['Scheduled', 'blue'], in_progress: ['In progress', 'purple'], completed: ['Completed', 'green'], cancelled: ['Cancelled', 'gray'],
  paid: ['Paid', 'green'], partial: ['Partially paid', 'teal'], overdue: ['Overdue', 'red'], void: ['Void', 'gray'],
}
export const statusLabel = (s) => STATUS[s]?.[0] || s
export const pill = (s) => html`<span class="pill pill-${STATUS[s]?.[1] || 'gray'}">${statusLabel(s)}</span>`

// ---------- Toast ----------
export function toast(msg, kind = 'ok') {
  const el = document.createElement('div')
  el.className = `toast toast-${kind}`
  el.textContent = msg
  $('#toasts').appendChild(el)
  setTimeout(() => el.classList.add('out'), 2800)
  setTimeout(() => el.remove(), 3200)
}
export const fail = (e) => toast(e.message || String(e), 'err')

// ---------- Modal ----------
export function modal(content, { wide = false, onOpen } = {}) {
  return new Promise((resolve) => {
    const wrap = document.createElement('div')
    wrap.className = 'modal-back'
    wrap.innerHTML = `<div class="modal ${wide ? 'modal-wide' : ''}" role="dialog" aria-modal="true">${content}</div>`
    document.body.appendChild(wrap)
    const close = (val) => { wrap.remove(); document.removeEventListener('keydown', onKey); resolve(val) }
    const onKey = (e) => { if (e.key === 'Escape') close(null) }
    document.addEventListener('keydown', onKey)
    wrap.addEventListener('mousedown', (e) => { if (e.target === wrap) close(null) })
    wrap.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) close(null) })
    const first = wrap.querySelector('input:not([type=hidden]),select,textarea')
    first?.focus()
    onOpen?.(wrap.firstElementChild, close)
  })
}

/** Modal with a form; resolves to a plain object of field values, or null. */
export function formModal(title, fieldsHtml, { submit = 'Save', wide = false, onOpen, validate } = {}) {
  return modal(`<form class="modal-form">
      <div class="modal-head"><h3>${esc(title)}</h3><button type="button" class="icon-btn" data-close aria-label="Close">✕</button></div>
      <div class="modal-body">${fieldsHtml}</div>
      <div class="modal-foot"><button type="button" class="btn" data-close>Cancel</button><button class="btn btn-primary" type="submit">${esc(submit)}</button></div>
    </form>`, {
    wide,
    onOpen: (el, close) => {
      const form = el.querySelector('form')
      onOpen?.(form)
      form.addEventListener('submit', async (e) => {
        e.preventDefault()
        const data = formData(form)
        if (validate) { const err = await validate(data, form); if (err) return toast(err, 'err') }
        close(data)
      })
    },
  })
}

export async function confirmBox(message, { ok = 'Yes', danger = false } = {}) {
  return modal(`<div class="modal-body" style="padding-top:24px"><p style="font-size:15px">${esc(message)}</p></div>
    <div class="modal-foot"><button class="btn" data-close>Cancel</button><button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-ok>${esc(ok)}</button></div>`,
  { onOpen: (el, close) => el.querySelector('[data-ok]').addEventListener('click', () => close(true)) }).then(Boolean)
}

export function formData(form) {
  const out = {}
  for (const el of form.elements) {
    if (!el.name) continue
    if (el.type === 'checkbox') out[el.name] = el.checked ? 1 : 0
    else if (el.type === 'radio') { if (el.checked) out[el.name] = el.value }
    else out[el.name] = el.value
  }
  return out
}

// ---------- Form field helpers ----------
export const field = (label, name, value = '', { type = 'text', required, placeholder = '', span, attrs = '', help } = {}) => html`
  <label class="field ${span ? 'span-' + span : ''}"><span>${label}${required ? raw(' <b class="req">*</b>') : ''}</span>
    ${type === 'textarea'
      ? html`<textarea name="${name}" rows="3" placeholder="${placeholder}" ${raw(attrs)}>${value}</textarea>`
      : html`<input type="${type}" name="${name}" value="${value ?? ''}" placeholder="${placeholder}" ${required ? raw('required') : ''} ${raw(attrs)}>`}
    ${help ? html`<small class="help">${help}</small>` : ''}
  </label>`
export const select = (label, name, value, options, { span, attrs = '' } = {}) => html`
  <label class="field ${span ? 'span-' + span : ''}"><span>${label}</span>
    <select name="${name}" ${raw(attrs)}>${options.map((o) => {
      const [v, l] = Array.isArray(o) ? o : [o, o]
      return html`<option value="${v}" ${String(v) === String(value ?? '') ? raw('selected') : ''}>${l}</option>`
    })}</select></label>`

export const SOURCES = ['Website', 'Google', 'Google LSA', 'Facebook', 'Instagram', 'Yelp', 'Nextdoor', 'Angi', 'Referral', 'Repeat customer', 'Yard sign', 'Truck', 'Other']
export const CITIES = ['Chesapeake', 'Virginia Beach', 'Norfolk', 'Portsmouth', 'Suffolk', 'Hampton', 'Newport News', 'Yorktown', 'Smithfield', 'Carrollton', 'Currituck County', 'Camden County']
export const SERVICES = ['French Drain Installation', 'Residential Drainage Solutions', 'Commercial Drainage', 'Downspout Extensions', 'Concrete Drains', 'Grading Services', 'Outdoor Sump Pumps', 'Exterior Waterproofing', 'Culvert Pipe Installation', 'Gravel Driveways', 'Trenching Service', 'Landscape Excavation', 'Pool Liner Protection', 'Hydrojet Cleanout', 'Other']

export function debounce(fn, ms = 250) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms) } }

export async function loadItems(force) { if (!state.items || force) state.items = await GET('/items'); return state.items }
export const portalUrl = (kind, token) => `${location.origin}/p/${kind}/${token}`

export async function copy(text) {
  try { await navigator.clipboard.writeText(text); toast('Link copied') }
  catch { prompt('Copy this link:', text) }
}

/** Customer picker: search input with dropdown; writes chosen id into hidden input. */
export function bindCustomerPicker(root, { onPick } = {}) {
  const input = root.querySelector('[data-cust-search]'), hidden = root.querySelector('[name=customer_id]'), list = root.querySelector('[data-cust-list]')
  if (!input) return
  const search = debounce(async () => {
    const q = input.value.trim()
    const rows = await GET('/customers?q=' + encodeURIComponent(q))
    list.innerHTML = rows.slice(0, 8).map((c) => `<button type="button" data-id="${c.id}" data-name="${esc(c.display_name)}"><b>${esc(c.display_name)}</b><small>${esc([c.address, c.city, c.phone].filter(Boolean).join(' · '))}</small></button>`).join('') ||
      '<div class="muted" style="padding:10px">No matches</div>'
    list.hidden = false
  }, 200)
  input.addEventListener('input', () => { hidden.value = ''; search() })
  input.addEventListener('focus', search)
  list.addEventListener('mousedown', (e) => {
    const b = e.target.closest('button'); if (!b) return
    e.preventDefault()
    hidden.value = b.dataset.id; input.value = b.dataset.name; list.hidden = true
    onPick?.(Number(b.dataset.id))
  })
  input.addEventListener('blur', () => setTimeout(() => (list.hidden = true), 150))
}
export const customerPicker = (id = '', name = '') => html`
  <label class="field span-2 picker"><span>Customer <b class="req">*</b></span>
    <input type="hidden" name="customer_id" value="${id}">
    <input data-cust-search value="${name}" placeholder="Search customers by name, phone, address…" autocomplete="off">
    <div class="picker-list" data-cust-list hidden></div>
  </label>`
