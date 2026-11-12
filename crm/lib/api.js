// Rain Drains CRM — authenticated JSON API.
import express from 'express'
import { writeFileSync, unlinkSync, existsSync } from 'node:fs'
import { join, extname } from 'node:path'
import { all, get, run, insert, update, tx, getSettings, setSetting, nextNumber, logActivity, DEFAULT_SETTINGS, UPLOAD_DIR } from './db.js'
import { requireAuth, requireRole, hashPassword, verifyPassword, createSession, destroySession, currentUser, token } from './auth.js'
import { lineItems, saveLineItems, refreshTotal, computeTotals, today, addDays, PAID_SQL, decorateInvoice, invoiceStatus } from './docs.js'
import { parseCSV, toCSV } from './csv.js'
import { testConnection } from './paypal.js'

export const api = express.Router()
const office = requireRole('owner', 'office')
const owner = requireRole('owner')

const CNAME = `TRIM(CASE WHEN c.type = 'commercial' AND c.company != '' THEN c.company
  WHEN TRIM(c.first_name || ' ' || c.last_name) = '' THEN c.company ELSE c.first_name || ' ' || c.last_name END)`

const ah = (fn) => (req, res, next) => { try { const r = fn(req, res, next); if (r !== undefined && !res.headersSent) res.json(r) } catch (e) { next(e) } }
const notFound = (res, what = 'Record') => res.status(404).json({ error: `${what} not found` })
const int = (v) => (v === undefined || v === null || v === '' ? null : parseInt(v, 10))
const cents = (v) => Math.round(Number(v) || 0)
const uid = (req) => req.user?.id ?? null
const secureCookie = (req) => req.secure || req.headers['x-forwarded-proto'] === 'https'

// ======================================================================
// Auth
// ======================================================================
api.get('/auth/status', ah((req) => ({
  needsSetup: get('SELECT COUNT(*) n FROM users').n === 0,
  user: currentUser(req),
  company: getSettings().company_name,
})))

api.post('/auth/setup', ah((req, res) => {
  if (get('SELECT COUNT(*) n FROM users').n > 0) return res.status(400).json({ error: 'Already set up' })
  const { name, email, password } = req.body
  if (!name || !email || !password || password.length < 8) return res.status(400).json({ error: 'Name, email and a password of 8+ characters are required' })
  const id = insert('users', { name, email, role: 'owner', color: '#1c6fd6', password_hash: hashPassword(password) }, ['name', 'email', 'role', 'color', 'password_hash'])
  createSession(res, id, secureCookie(req))
  return { ok: true }
}))

const loginAttempts = new Map()
api.post('/auth/login', ah((req, res) => {
  const key = req.ip
  const a = loginAttempts.get(key) || { n: 0, t: Date.now() }
  if (Date.now() - a.t > 15 * 60e3) { a.n = 0; a.t = Date.now() }
  if (a.n >= 10) return res.status(429).json({ error: 'Too many attempts. Try again in a few minutes.' })
  const { email, password } = req.body
  const u = get('SELECT * FROM users WHERE email = ? AND active = 1', String(email || ''))
  if (!u || !verifyPassword(String(password || ''), u.password_hash)) {
    a.n++; loginAttempts.set(key, a)
    return res.status(401).json({ error: 'Wrong email or password' })
  }
  loginAttempts.delete(key)
  createSession(res, u.id, secureCookie(req))
  return { ok: true }
}))

api.post('/auth/logout', ah((req, res) => { destroySession(req, res); return { ok: true } }))

api.use(requireAuth)

api.get('/auth/me', ah((req) => req.user))
api.put('/auth/password', ah((req, res) => {
  const u = get('SELECT * FROM users WHERE id = ?', req.user.id)
  const { current, next } = req.body
  if (!verifyPassword(String(current || ''), u.password_hash)) return res.status(400).json({ error: 'Current password is wrong' })
  if (!next || next.length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters' })
  run('UPDATE users SET password_hash = ? WHERE id = ?', hashPassword(next), u.id)
  return { ok: true }
}))

// ======================================================================
// Users / team
// ======================================================================
const USER_COLS = ['name', 'email', 'phone', 'role', 'color', 'active']
api.get('/users', ah(() => all('SELECT id, name, email, phone, role, color, active FROM users ORDER BY active DESC, name')))
api.post('/users', owner, ah((req, res) => {
  const b = req.body
  if (!b.name || !b.email || !b.password || b.password.length < 8) return res.status(400).json({ error: 'Name, email and an 8+ character password are required' })
  if (get('SELECT id FROM users WHERE email = ?', b.email)) return res.status(400).json({ error: 'That email is already in use' })
  return { id: insert('users', { ...b, password_hash: hashPassword(b.password) }, [...USER_COLS, 'password_hash']) }
}))
api.put('/users/:id', owner, ah((req, res) => {
  const id = int(req.params.id), b = req.body
  const target = get('SELECT * FROM users WHERE id = ?', id)
  if (!target) return notFound(res, 'User')
  const owners = get("SELECT COUNT(*) n FROM users WHERE role = 'owner' AND active = 1").n
  if (target.role === 'owner' && owners <= 1 && ((b.role && b.role !== 'owner') || b.active === 0 || b.active === false))
    return res.status(400).json({ error: 'You need at least one active owner' })
  update('users', id, b, USER_COLS, false)
  if (b.password) {
    if (b.password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' })
    run('UPDATE users SET password_hash = ? WHERE id = ?', hashPassword(b.password), id)
    run('DELETE FROM sessions WHERE user_id = ? AND user_id != ?', id, req.user.id)
  }
  if (b.active === 0 || b.active === false) run('DELETE FROM sessions WHERE user_id = ?', id)
  return { ok: true }
}))

// ======================================================================
// Settings
// ======================================================================
function publicSettings(user) {
  const s = getSettings()
  // Never send the PayPal secret back to the browser.
  s.paypal_secret_set = s.paypal_secret || process.env.PAYPAL_CLIENT_SECRET ? '1' : ''
  delete s.paypal_secret
  if (user.role !== 'owner') { delete s.lead_intake_key; delete s.paypal_client_id }
  return s
}
api.get('/settings', ah((req) => publicSettings(req.user)))
api.put('/settings', owner, ah((req) => {
  for (const k of Object.keys(DEFAULT_SETTINGS)) {
    if (!(k in req.body)) continue
    if (k === 'paypal_secret' && !req.body[k]) continue // blank = keep existing secret
    setSetting(k, String(req.body[k]).trim())
  }
  return publicSettings(req.user)
}))
api.post('/settings/paypal-test', owner, async (req, res) => {
  try { res.json(await testConnection()) } catch (e) { res.status(400).json({ error: e.message }) }
})

// ======================================================================
// Customers
// ======================================================================
const CUSTOMER_COLS = ['type', 'first_name', 'last_name', 'company', 'email', 'phone', 'alt_phone', 'address', 'city', 'state', 'zip', 'source', 'tags', 'notes', 'archived']

api.get('/customers', ah((req) => {
  const q = `%${req.query.q || ''}%`
  return all(`SELECT c.*, ${CNAME} AS display_name,
      (SELECT COALESCE(SUM(i.total_cents - ${PAID_SQL}),0) FROM invoices i WHERE i.customer_id = c.id AND i.status != 'void' AND i.status != 'draft') AS balance_cents,
      (SELECT COALESCE(SUM(p.amount_cents),0) FROM payments p JOIN invoices i ON i.id = p.invoice_id WHERE i.customer_id = c.id) AS lifetime_cents,
      (SELECT MAX(scheduled_start) FROM jobs j WHERE j.customer_id = c.id) AS last_job
    FROM customers c
    WHERE c.archived = ? AND (${CNAME} LIKE ? OR c.email LIKE ? OR c.phone LIKE ? OR c.address LIKE ? OR c.city LIKE ? OR c.tags LIKE ?)
    ORDER BY c.created_at DESC LIMIT 500`, req.query.archived === '1' ? 1 : 0, q, q, q, q, q, q)
}))

api.get('/customers/:id', ah((req, res) => {
  const id = int(req.params.id)
  const c = get(`SELECT c.*, ${CNAME} AS display_name FROM customers c WHERE c.id = ?`, id)
  if (!c) return notFound(res, 'Customer')
  c.estimates = all('SELECT * FROM estimates WHERE customer_id = ? ORDER BY id DESC', id)
  c.jobs = all('SELECT * FROM jobs WHERE customer_id = ? ORDER BY COALESCE(NULLIF(scheduled_start,\'\'), created_at) DESC', id)
  c.invoices = all(`SELECT i.*, ${PAID_SQL} AS paid_cents FROM invoices i WHERE i.customer_id = ? ORDER BY i.id DESC`, id).map(decorateInvoice)
  c.leads = all('SELECT * FROM leads WHERE customer_id = ? ORDER BY id DESC', id)
  c.activity = all(`SELECT a.*, u.name AS user_name FROM activity a LEFT JOIN users u ON u.id = a.user_id
                    WHERE a.customer_id = ? ORDER BY a.created_at DESC, a.id DESC LIMIT 200`, id)
  c.files = all("SELECT * FROM files WHERE (entity_type = 'customer' AND entity_id = ?) OR (entity_type = 'job' AND entity_id IN (SELECT id FROM jobs WHERE customer_id = ?)) ORDER BY id DESC", id, id)
  c.balance_cents = c.invoices.filter((i) => !['void', 'draft'].includes(i.status)).reduce((s, i) => s + i.balance_cents, 0)
  c.lifetime_cents = c.invoices.reduce((s, i) => s + i.paid_cents, 0)
  return c
}))

api.post('/customers', ah((req) => {
  const id = insert('customers', req.body, CUSTOMER_COLS)
  logActivity({ entity_type: 'customer', entity_id: id, customer_id: id, user_id: uid(req), text: 'Customer created' })
  return { id }
}))
api.put('/customers/:id', ah((req) => { update('customers', int(req.params.id), req.body, CUSTOMER_COLS); return { ok: true } }))
api.delete('/customers/:id', office, ah((req) => { run('DELETE FROM customers WHERE id = ?', int(req.params.id)); return { ok: true } }))

// Notes / calls / texts logged against any record
api.post('/activity', ah((req, res) => {
  const { entity_type, entity_id, customer_id, kind = 'note', text } = req.body
  if (!text) return res.status(400).json({ error: 'Note text is required' })
  logActivity({ entity_type, entity_id: int(entity_id), customer_id: int(customer_id), user_id: uid(req), kind, text })
  return { ok: true }
}))
api.get('/activity', ah((req) => all(`SELECT a.*, u.name AS user_name FROM activity a LEFT JOIN users u ON u.id = a.user_id
   WHERE a.entity_type = ? AND a.entity_id = ? ORDER BY a.created_at DESC, a.id DESC`, String(req.query.entity_type), int(req.query.entity_id))))
api.delete('/activity/:id', ah((req) => { run("DELETE FROM activity WHERE id = ? AND kind != 'event'", int(req.params.id)); return { ok: true } }))

// ======================================================================
// Leads
// ======================================================================
const LEAD_COLS = ['customer_id', 'name', 'email', 'phone', 'address', 'city', 'state', 'zip', 'service', 'message', 'source', 'status', 'value_cents', 'assigned_to', 'appointment_at', 'next_follow_up', 'lost_reason']

api.get('/leads', office, ah(() => all(`SELECT l.*, u.name AS assigned_name, u.color AS assigned_color FROM leads l
  LEFT JOIN users u ON u.id = l.assigned_to ORDER BY l.created_at DESC LIMIT 1000`)))
api.get('/leads/:id', office, ah((req, res) => {
  const l = get('SELECT * FROM leads WHERE id = ?', int(req.params.id))
  if (!l) return notFound(res, 'Lead')
  l.activity = all(`SELECT a.*, u.name AS user_name FROM activity a LEFT JOIN users u ON u.id = a.user_id
    WHERE a.entity_type = 'lead' AND a.entity_id = ? ORDER BY a.created_at DESC`, l.id)
  l.estimates = all('SELECT * FROM estimates WHERE lead_id = ? ORDER BY id DESC', l.id)
  return l
}))
api.post('/leads', office, ah((req) => {
  const id = insert('leads', req.body, LEAD_COLS)
  logActivity({ entity_type: 'lead', entity_id: id, customer_id: int(req.body.customer_id), user_id: uid(req), text: `Lead added (${req.body.source || 'manual'})` })
  return { id }
}))
api.put('/leads/:id', office, ah((req, res) => {
  const id = int(req.params.id)
  const before = get('SELECT * FROM leads WHERE id = ?', id)
  if (!before) return notFound(res, 'Lead')
  update('leads', id, req.body, LEAD_COLS)
  if (req.body.status && req.body.status !== before.status)
    logActivity({ entity_type: 'lead', entity_id: id, customer_id: before.customer_id, user_id: uid(req), text: `Status: ${before.status} → ${req.body.status}` })
  return { ok: true }
}))
api.delete('/leads/:id', office, ah((req) => { run('DELETE FROM leads WHERE id = ?', int(req.params.id)); return { ok: true } }))

/** Turn a lead into a customer (or attach to existing match), optionally starting an estimate. */
api.post('/leads/:id/convert', office, ah((req, res) => {
  const lead = get('SELECT * FROM leads WHERE id = ?', int(req.params.id))
  if (!lead) return notFound(res, 'Lead')
  return tx(() => {
    let customer_id = lead.customer_id
    if (!customer_id) {
      const match = (lead.email && get('SELECT id FROM customers WHERE email != \'\' AND email = ? COLLATE NOCASE', lead.email)) ||
        (lead.phone && get('SELECT id FROM customers WHERE phone != \'\' AND replace(replace(replace(replace(phone,\'-\',\'\'),\'(\',\'\'),\')\',\'\'),\' \',\'\') = ?', digits(lead.phone)))
      if (match) customer_id = match.id
      else {
        const [first, ...rest] = lead.name.trim().split(/\s+/)
        customer_id = insert('customers', { first_name: first || '', last_name: rest.join(' '), email: lead.email, phone: lead.phone, address: lead.address, city: lead.city, state: lead.state || 'VA', zip: lead.zip, source: lead.source, notes: lead.message }, CUSTOMER_COLS)
        logActivity({ entity_type: 'customer', entity_id: customer_id, customer_id, user_id: uid(req), text: `Customer created from lead #${lead.id}` })
      }
      run('UPDATE leads SET customer_id = ?, updated_at = datetime(\'now\') WHERE id = ?', customer_id, lead.id)
      run('UPDATE activity SET customer_id = ? WHERE entity_type = \'lead\' AND entity_id = ?', customer_id, lead.id)
    }
    let estimate_id = null
    if (req.body.create_estimate) {
      estimate_id = createEstimate({ customer_id, lead_id: lead.id, title: lead.service || 'Drainage Solution', address: [lead.address, lead.city].filter(Boolean).join(', ') }, req)
    }
    return { customer_id, estimate_id }
  })
}))
const digits = (s) => String(s || '').replace(/\D/g, '')

// ======================================================================
// Price book
// ======================================================================
const ITEM_COLS = ['name', 'description', 'category', 'unit', 'price_cents', 'cost_cents', 'taxable', 'active']
api.get('/items', ah(() => all('SELECT * FROM items ORDER BY active DESC, category, name')))
api.post('/items', office, ah((req) => ({ id: insert('items', req.body, ITEM_COLS) })))
api.put('/items/:id', office, ah((req) => { update('items', int(req.params.id), req.body, ITEM_COLS, false); return { ok: true } }))
api.delete('/items/:id', office, ah((req) => { run('DELETE FROM items WHERE id = ?', int(req.params.id)); return { ok: true } }))

// ======================================================================
// Estimates
// ======================================================================
const EST_COLS = ['customer_id', 'lead_id', 'title', 'address', 'status', 'issue_date', 'expiry_date', 'notes', 'terms', 'tax_rate', 'discount_cents', 'deposit_pct']

function createEstimate(data, req) {
  const s = getSettings()
  const id = insert('estimates', {
    issue_date: today(), expiry_date: addDays(today(), parseInt(s.estimate_valid_days, 10) || 30),
    terms: s.estimate_terms, tax_rate: Number(s.default_tax_rate) || 0,
    ...data, number: nextNumber('estimate'), token: token(16), created_by: uid(req),
  }, [...EST_COLS, 'number', 'token', 'created_by'])
  if (data.items) saveLineItems('estimate', id, data.items)
  refreshTotal('estimate', id)
  const e = get('SELECT number, customer_id FROM estimates WHERE id = ?', id)
  logActivity({ entity_type: 'estimate', entity_id: id, customer_id: e.customer_id, user_id: uid(req), text: `Estimate ${e.number} created` })
  return id
}

api.get('/estimates', office, ah((req) => all(`SELECT e.*, ${CNAME} AS customer_name FROM estimates e JOIN customers c ON c.id = e.customer_id
  ${req.query.status ? 'WHERE e.status = ?' : ''} ORDER BY e.id DESC LIMIT 1000`, ...(req.query.status ? [req.query.status] : []))))

api.get('/estimates/:id', office, ah((req, res) => {
  const e = get(`SELECT e.*, ${CNAME} AS customer_name, c.email AS customer_email, c.phone AS customer_phone FROM estimates e JOIN customers c ON c.id = e.customer_id WHERE e.id = ?`, int(req.params.id))
  if (!e) return notFound(res, 'Estimate')
  e.items = lineItems('estimate', e.id)
  e.totals = computeTotals(e.items, e.tax_rate, e.discount_cents)
  e.jobs = all('SELECT id, number, status FROM jobs WHERE estimate_id = ?', e.id)
  e.invoices = all('SELECT id, number, status FROM invoices WHERE estimate_id = ?', e.id)
  e.activity = all(`SELECT a.*, u.name AS user_name FROM activity a LEFT JOIN users u ON u.id = a.user_id WHERE a.entity_type = 'estimate' AND a.entity_id = ? ORDER BY a.created_at DESC, a.id DESC`, e.id)
  return e
}))

api.post('/estimates', office, ah((req, res) => {
  if (!int(req.body.customer_id)) return res.status(400).json({ error: 'Pick a customer' })
  return { id: tx(() => createEstimate(req.body, req)) }
}))

api.put('/estimates/:id', office, ah((req, res) => {
  const id = int(req.params.id)
  if (!get('SELECT id FROM estimates WHERE id = ?', id)) return notFound(res, 'Estimate')
  tx(() => {
    update('estimates', id, req.body, EST_COLS)
    if (Array.isArray(req.body.items)) saveLineItems('estimate', id, req.body.items)
    refreshTotal('estimate', id)
  })
  return { ok: true }
}))

api.delete('/estimates/:id', office, ah((req) => {
  const id = int(req.params.id)
  tx(() => { run("DELETE FROM line_items WHERE doc_type = 'estimate' AND doc_id = ?", id); run('DELETE FROM estimates WHERE id = ?', id) })
  return { ok: true }
}))

api.post('/estimates/:id/duplicate', office, ah((req, res) => {
  const e = get('SELECT * FROM estimates WHERE id = ?', int(req.params.id))
  if (!e) return notFound(res, 'Estimate')
  const items = lineItems('estimate', e.id)
  const id = tx(() => createEstimate({ customer_id: e.customer_id, lead_id: e.lead_id, title: e.title, address: e.address, notes: e.notes, terms: e.terms, tax_rate: e.tax_rate, discount_cents: e.discount_cents, deposit_pct: e.deposit_pct, items }, req))
  return { id }
}))

/** Mark sent (the UI then opens email / text with the portal link). */
api.post('/estimates/:id/send', office, ah((req, res) => {
  const e = get('SELECT * FROM estimates WHERE id = ?', int(req.params.id))
  if (!e) return notFound(res, 'Estimate')
  if (['draft'].includes(e.status)) run("UPDATE estimates SET status = 'sent', sent_at = datetime('now'), updated_at = datetime('now') WHERE id = ?", e.id)
  else run("UPDATE estimates SET sent_at = datetime('now') WHERE id = ?", e.id)
  if (e.lead_id) run("UPDATE leads SET status = 'estimated', updated_at = datetime('now') WHERE id = ? AND status IN ('new','contacted','appointment')", e.lead_id)
  logActivity({ entity_type: 'estimate', entity_id: e.id, customer_id: e.customer_id, user_id: uid(req), kind: req.body.via === 'text' ? 'text' : 'email', text: `Estimate ${e.number} sent${req.body.via ? ` by ${req.body.via}` : ''}` })
  return { ok: true }
}))

api.post('/estimates/:id/status', office, ah((req, res) => {
  const e = get('SELECT * FROM estimates WHERE id = ?', int(req.params.id))
  if (!e) return notFound(res, 'Estimate')
  const status = req.body.status
  if (!['draft', 'sent', 'viewed', 'approved', 'declined'].includes(status)) return res.status(400).json({ error: 'Bad status' })
  run(`UPDATE estimates SET status = ?, ${status === 'approved' ? "approved_at = datetime('now')," : ''}${status === 'declined' ? "declined_at = datetime('now')," : ''} updated_at = datetime('now') WHERE id = ?`, status, e.id)
  if (e.lead_id && status === 'approved') run("UPDATE leads SET status = 'won' WHERE id = ?", e.lead_id)
  if (e.lead_id && status === 'declined') run("UPDATE leads SET status = 'lost' WHERE id = ?", e.lead_id)
  logActivity({ entity_type: 'estimate', entity_id: e.id, customer_id: e.customer_id, user_id: uid(req), text: `Estimate ${e.number} marked ${status}` })
  return { ok: true }
}))

api.post('/estimates/:id/convert-job', office, ah((req, res) => {
  const e = get('SELECT * FROM estimates WHERE id = ?', int(req.params.id))
  if (!e) return notFound(res, 'Estimate')
  const items = lineItems('estimate', e.id).filter((li) => !li.optional || li.selected)
  const cust = get('SELECT city FROM customers WHERE id = ?', e.customer_id)
  const id = tx(() => createJob({
    customer_id: e.customer_id, estimate_id: e.id, title: e.title, address: e.address, city: cust?.city || '',
    description: items.map((li) => `• ${li.qty} ${li.unit} — ${li.name}${li.description ? `: ${li.description}` : ''}`).join('\n'),
  }, req))
  return { id }
}))

api.post('/estimates/:id/convert-invoice', office, ah((req, res) => {
  const e = get('SELECT * FROM estimates WHERE id = ?', int(req.params.id))
  if (!e) return notFound(res, 'Estimate')
  const job = get('SELECT id FROM jobs WHERE estimate_id = ? ORDER BY id DESC', e.id)
  const id = tx(() => createInvoiceFromEstimate(e, job?.id || null, req))
  return { id }
}))

// ======================================================================
// Jobs
// ======================================================================
const JOB_COLS = ['customer_id', 'estimate_id', 'title', 'address', 'city', 'status', 'priority', 'scheduled_start', 'duration_min', 'crew', 'description', 'specs', 'checklist']
const DEFAULT_CHECKLIST = [
  'Miss Utility (VA811) ticket called in & clear',
  'Private utilities discussed with customer (irrigation, pet fence, lighting)',
  'Before photos taken',
  'Discharge point confirmed with customer',
  'Pipe slope verified',
  'Site cleaned, lawn/sod restored',
  'After photos taken',
  'Walkthrough with customer',
].map((text) => ({ text, done: false }))

function createJob(data, req) {
  const id = insert('jobs', {
    checklist: DEFAULT_CHECKLIST, ...data,
    status: data.status || (data.scheduled_start ? 'scheduled' : 'unscheduled'),
    number: nextNumber('job'),
  }, [...JOB_COLS, 'number'])
  const j = get('SELECT number, customer_id FROM jobs WHERE id = ?', id)
  logActivity({ entity_type: 'job', entity_id: id, customer_id: j.customer_id, user_id: uid(req), text: `Job ${j.number} created` })
  return id
}

function jobRow(j) {
  if (!j) return j
  j.crew = safeJSON(j.crew, []); j.specs = safeJSON(j.specs, {}); j.checklist = safeJSON(j.checklist, [])
  return j
}
const safeJSON = (s, d) => { try { return JSON.parse(s) } catch { return d } }

api.get('/jobs', ah((req) => {
  const where = [], params = []
  if (req.query.status) { where.push('j.status = ?'); params.push(req.query.status) }
  if (req.query.mine === '1' || req.user.role === 'tech') { where.push('EXISTS (SELECT 1 FROM json_each(j.crew) WHERE value = ?)'); params.push(req.user.id) }
  return all(`SELECT j.*, ${CNAME} AS customer_name, c.phone AS customer_phone,
      (SELECT COUNT(*) FROM invoices i WHERE i.job_id = j.id AND i.status != 'void') AS invoice_count
    FROM jobs j JOIN customers c ON c.id = j.customer_id
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY CASE j.status WHEN 'in_progress' THEN 0 WHEN 'scheduled' THEN 1 WHEN 'unscheduled' THEN 2 ELSE 3 END, j.scheduled_start, j.id DESC LIMIT 1000`, ...params).map(jobRow)
}))

api.get('/jobs/:id', ah((req, res) => {
  const j = jobRow(get(`SELECT j.*, ${CNAME} AS customer_name, c.phone AS customer_phone, c.email AS customer_email, c.first_name AS customer_first
    FROM jobs j JOIN customers c ON c.id = j.customer_id WHERE j.id = ?`, int(req.params.id)))
  if (!j) return notFound(res, 'Job')
  j.files = all("SELECT * FROM files WHERE entity_type = 'job' AND entity_id = ? ORDER BY id DESC", j.id)
  j.invoices = all(`SELECT i.*, ${PAID_SQL} AS paid_cents FROM invoices i WHERE i.job_id = ? ORDER BY i.id DESC`, j.id).map(decorateInvoice)
  j.estimate = j.estimate_id ? get('SELECT id, number, total_cents, status FROM estimates WHERE id = ?', j.estimate_id) : null
  j.activity = all(`SELECT a.*, u.name AS user_name FROM activity a LEFT JOIN users u ON u.id = a.user_id WHERE a.entity_type = 'job' AND a.entity_id = ? ORDER BY a.created_at DESC, a.id DESC`, j.id)
  return j
}))

api.post('/jobs', office, ah((req, res) => {
  if (!int(req.body.customer_id)) return res.status(400).json({ error: 'Pick a customer' })
  return { id: tx(() => createJob(req.body, req)) }
}))

api.put('/jobs/:id', ah((req, res) => {
  const id = int(req.params.id)
  const before = get('SELECT * FROM jobs WHERE id = ?', id)
  if (!before) return notFound(res, 'Job')
  const b = { ...req.body }
  if (req.user.role === 'tech') for (const k of Object.keys(b)) if (!['status', 'checklist', 'specs'].includes(k)) delete b[k]
  if (b.scheduled_start && before.status === 'unscheduled' && !b.status) b.status = 'scheduled'
  if (b.scheduled_start === '' && before.status === 'scheduled' && !b.status) b.status = 'unscheduled'
  update('jobs', id, b, JOB_COLS)
  if (b.status && b.status !== before.status) {
    if (b.status === 'in_progress' && !before.started_at) run("UPDATE jobs SET started_at = datetime('now') WHERE id = ?", id)
    if (b.status === 'completed') run("UPDATE jobs SET completed_at = datetime('now') WHERE id = ?", id)
    const label = { in_progress: 'started', completed: 'completed', cancelled: 'cancelled', scheduled: 'scheduled', unscheduled: 'unscheduled' }[b.status]
    logActivity({ entity_type: 'job', entity_id: id, customer_id: before.customer_id, user_id: uid(req), text: `Job ${before.number} ${label}` })
  } else if (b.scheduled_start !== undefined && b.scheduled_start !== before.scheduled_start && b.scheduled_start) {
    logActivity({ entity_type: 'job', entity_id: id, customer_id: before.customer_id, user_id: uid(req), text: `Job ${before.number} scheduled for ${b.scheduled_start.replace('T', ' ')}` })
  }
  return { ok: true }
}))

api.delete('/jobs/:id', office, ah((req) => { run('DELETE FROM jobs WHERE id = ?', int(req.params.id)); return { ok: true } }))

api.post('/jobs/:id/invoice', office, ah((req, res) => {
  const j = get('SELECT * FROM jobs WHERE id = ?', int(req.params.id))
  if (!j) return notFound(res, 'Job')
  const e = j.estimate_id ? get('SELECT * FROM estimates WHERE id = ?', j.estimate_id) : null
  const id = tx(() => e ? createInvoiceFromEstimate(e, j.id, req) : createInvoice({ customer_id: j.customer_id, job_id: j.id, title: j.title, address: j.address }, req))
  return { id }
}))

api.post('/jobs/:id/review-requested', ah((req, res) => {
  const j = get('SELECT * FROM jobs WHERE id = ?', int(req.params.id))
  if (!j) return notFound(res, 'Job')
  run("UPDATE jobs SET review_requested_at = datetime('now') WHERE id = ?", j.id)
  logActivity({ entity_type: 'job', entity_id: j.id, customer_id: j.customer_id, user_id: uid(req), kind: req.body.via === 'email' ? 'email' : 'text', text: `Google review requested by ${req.body.via || 'text'}` })
  return { ok: true }
}))

// Schedule feed: jobs + estimate appointments in a date range
api.get('/schedule', ah((req) => {
  const from = String(req.query.from || today()), to = String(req.query.to || addDays(today(), 7))
  const techFilter = req.user.role === 'tech' ? ' AND EXISTS (SELECT 1 FROM json_each(j.crew) WHERE value = ' + Number(req.user.id) + ')' : ''
  const jobs = all(`SELECT j.*, ${CNAME} AS customer_name, c.phone AS customer_phone FROM jobs j JOIN customers c ON c.id = j.customer_id
    WHERE j.scheduled_start >= ? AND j.scheduled_start < ? AND j.status != 'cancelled'${techFilter} ORDER BY j.scheduled_start`, from, addDays(to, 1)).map(jobRow)
  const unscheduled = req.user.role === 'tech' ? [] : all(`SELECT j.*, ${CNAME} AS customer_name FROM jobs j JOIN customers c ON c.id = j.customer_id
    WHERE j.status = 'unscheduled' ORDER BY j.created_at`).map(jobRow)
  const appointments = req.user.role === 'tech' ? [] : all(`SELECT l.id, l.name, l.phone, l.address, l.city, l.service, l.appointment_at, l.assigned_to FROM leads l
    WHERE l.appointment_at >= ? AND l.appointment_at < ? AND l.status NOT IN ('won','lost') ORDER BY l.appointment_at`, from, addDays(to, 1))
  return { jobs, unscheduled, appointments }
}))

// ======================================================================
// Invoices & payments
// ======================================================================
const INV_COLS = ['customer_id', 'job_id', 'estimate_id', 'title', 'address', 'status', 'issue_date', 'due_date', 'notes', 'terms', 'tax_rate', 'discount_cents']

function createInvoice(data, req) {
  const s = getSettings()
  const id = insert('invoices', {
    issue_date: today(), due_date: addDays(today(), parseInt(s.invoice_due_days, 10) || 0),
    terms: s.invoice_terms, tax_rate: Number(s.default_tax_rate) || 0,
    ...data, number: nextNumber('invoice'), token: token(16),
  }, [...INV_COLS, 'number', 'token'])
  if (data.items) saveLineItems('invoice', id, data.items)
  refreshTotal('invoice', id)
  const inv = get('SELECT number, customer_id FROM invoices WHERE id = ?', id)
  logActivity({ entity_type: 'invoice', entity_id: id, customer_id: inv.customer_id, user_id: uid(req), text: `Invoice ${inv.number} created` })
  return id
}

function createInvoiceFromEstimate(e, job_id, req) {
  const existing = get("SELECT * FROM invoices WHERE estimate_id = ? AND status != 'void' ORDER BY id LIMIT 1", e.id)
  if (existing) {
    const s = getSettings()
    if (job_id && !existing.job_id) run('UPDATE invoices SET job_id = ? WHERE id = ?', job_id, existing.id)
    if (!existing.due_date) run('UPDATE invoices SET due_date = ? WHERE id = ?', addDays(today(), parseInt(s.invoice_due_days, 10) || 0), existing.id)
    return existing.id
  }
  const items = lineItems('estimate', e.id).filter((li) => !li.optional || li.selected).map((li) => ({ ...li, optional: 0, selected: 1 }))
  return createInvoice({ customer_id: e.customer_id, job_id, estimate_id: e.id, title: e.title, address: e.address, tax_rate: e.tax_rate, discount_cents: e.discount_cents, notes: e.notes, items }, req)
}

api.get('/invoices', office, ah((req) => {
  const rows = all(`SELECT i.*, ${CNAME} AS customer_name, ${PAID_SQL} AS paid_cents FROM invoices i JOIN customers c ON c.id = i.customer_id ORDER BY i.id DESC LIMIT 1000`).map(decorateInvoice)
  return req.query.status ? rows.filter((r) => r.display_status === req.query.status) : rows
}))

api.get('/invoices/:id', office, ah((req, res) => {
  const inv = decorateInvoice(get(`SELECT i.*, ${CNAME} AS customer_name, c.email AS customer_email, c.phone AS customer_phone, ${PAID_SQL} AS paid_cents
    FROM invoices i JOIN customers c ON c.id = i.customer_id WHERE i.id = ?`, int(req.params.id)))
  if (!inv) return notFound(res, 'Invoice')
  inv.items = lineItems('invoice', inv.id)
  inv.totals = computeTotals(inv.items, inv.tax_rate, inv.discount_cents)
  inv.payments = all('SELECT * FROM payments WHERE invoice_id = ? ORDER BY paid_at, id', inv.id)
  inv.job = inv.job_id ? get('SELECT id, number, title FROM jobs WHERE id = ?', inv.job_id) : null
  inv.estimate = inv.estimate_id ? get('SELECT id, number FROM estimates WHERE id = ?', inv.estimate_id) : null
  inv.activity = all(`SELECT a.*, u.name AS user_name FROM activity a LEFT JOIN users u ON u.id = a.user_id WHERE a.entity_type = 'invoice' AND a.entity_id = ? ORDER BY a.created_at DESC, a.id DESC`, inv.id)
  return inv
}))

api.post('/invoices', office, ah((req, res) => {
  if (!int(req.body.customer_id)) return res.status(400).json({ error: 'Pick a customer' })
  return { id: tx(() => createInvoice(req.body, req)) }
}))

api.put('/invoices/:id', office, ah((req, res) => {
  const id = int(req.params.id)
  if (!get('SELECT id FROM invoices WHERE id = ?', id)) return notFound(res, 'Invoice')
  tx(() => {
    update('invoices', id, req.body, INV_COLS)
    if (Array.isArray(req.body.items)) saveLineItems('invoice', id, req.body.items)
    refreshTotal('invoice', id)
  })
  return { ok: true }
}))

api.delete('/invoices/:id', office, ah((req, res) => {
  const id = int(req.params.id)
  if (get('SELECT COUNT(*) n FROM payments WHERE invoice_id = ?', id).n) return res.status(400).json({ error: 'This invoice has payments. Void it instead of deleting.' })
  tx(() => { run("DELETE FROM line_items WHERE doc_type = 'invoice' AND doc_id = ?", id); run('DELETE FROM invoices WHERE id = ?', id) })
  return { ok: true }
}))

api.post('/invoices/:id/send', office, ah((req, res) => {
  const inv = get('SELECT * FROM invoices WHERE id = ?', int(req.params.id))
  if (!inv) return notFound(res, 'Invoice')
  run(`UPDATE invoices SET ${inv.status === 'draft' ? "status = 'sent'," : ''} sent_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`, inv.id)
  logActivity({ entity_type: 'invoice', entity_id: inv.id, customer_id: inv.customer_id, user_id: uid(req), kind: req.body.via === 'text' ? 'text' : 'email', text: `Invoice ${inv.number} sent${req.body.via ? ` by ${req.body.via}` : ''}` })
  return { ok: true }
}))

api.post('/invoices/:id/void', office, ah((req, res) => {
  const inv = get('SELECT * FROM invoices WHERE id = ?', int(req.params.id))
  if (!inv) return notFound(res, 'Invoice')
  const status = inv.status === 'void' ? (inv.sent_at ? 'sent' : 'draft') : 'void'
  run("UPDATE invoices SET status = ?, updated_at = datetime('now') WHERE id = ?", status, inv.id)
  logActivity({ entity_type: 'invoice', entity_id: inv.id, customer_id: inv.customer_id, user_id: uid(req), text: `Invoice ${inv.number} ${status === 'void' ? 'voided' : 'restored'}` })
  return { ok: true }
}))

api.get('/payments', office, ah(() => all(`SELECT p.*, i.number AS invoice_number, i.customer_id, ${CNAME} AS customer_name
  FROM payments p JOIN invoices i ON i.id = p.invoice_id JOIN customers c ON c.id = i.customer_id ORDER BY p.paid_at DESC, p.id DESC LIMIT 1000`)))

api.post('/invoices/:id/payments', office, ah((req, res) => {
  const inv = get('SELECT * FROM invoices WHERE id = ?', int(req.params.id))
  if (!inv) return notFound(res, 'Invoice')
  const amount = cents(req.body.amount_cents)
  if (amount <= 0) return res.status(400).json({ error: 'Enter a payment amount' })
  const id = insert('payments', { invoice_id: inv.id, amount_cents: amount, method: req.body.method || 'check', reference: req.body.reference || '', note: req.body.note || '', paid_at: req.body.paid_at || today() },
    ['invoice_id', 'amount_cents', 'method', 'reference', 'note', 'paid_at'])
  if (inv.status === 'draft') run("UPDATE invoices SET status = 'sent' WHERE id = ?", inv.id)
  logActivity({ entity_type: 'invoice', entity_id: inv.id, customer_id: inv.customer_id, user_id: uid(req), text: `Payment of $${(amount / 100).toFixed(2)} (${req.body.method || 'check'}) recorded on ${inv.number}` })
  return { id }
}))
api.delete('/payments/:id', office, ah((req) => {
  const p = get('SELECT p.*, i.customer_id, i.number FROM payments p JOIN invoices i ON i.id = p.invoice_id WHERE p.id = ?', int(req.params.id))
  if (p) {
    run('DELETE FROM payments WHERE id = ?', p.id)
    logActivity({ entity_type: 'invoice', entity_id: p.invoice_id, customer_id: p.customer_id, user_id: uid(req), text: `Payment of $${(p.amount_cents / 100).toFixed(2)} removed from ${p.number}` })
  }
  return { ok: true }
}))

// ======================================================================
// Tasks
// ======================================================================
api.get('/tasks', ah((req) => all(`SELECT t.*, u.name AS user_name FROM tasks t LEFT JOIN users u ON u.id = t.user_id
  WHERE t.done = ? ORDER BY CASE WHEN t.due_date = '' THEN 1 ELSE 0 END, t.due_date, t.id`, req.query.done === '1' ? 1 : 0)))
api.post('/tasks', ah((req, res) => {
  if (!req.body.title) return res.status(400).json({ error: 'Task title required' })
  return { id: insert('tasks', { user_id: uid(req), ...req.body }, ['title', 'due_date', 'user_id', 'entity_type', 'entity_id']) }
}))
api.put('/tasks/:id', ah((req) => { update('tasks', int(req.params.id), req.body, ['title', 'due_date', 'done', 'user_id'], false); return { ok: true } }))
api.delete('/tasks/:id', ah((req) => { run('DELETE FROM tasks WHERE id = ?', int(req.params.id)); return { ok: true } }))

// ======================================================================
// Files / photos
// ======================================================================
const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.txt'])
api.post('/files', express.raw({ type: () => true, limit: '25mb' }), ah((req, res) => {
  const entity_type = String(req.query.entity_type || ''), entity_id = int(req.query.entity_id)
  const original = decodeURIComponent(String(req.headers['x-filename'] || 'upload'))
  const ext = extname(original).toLowerCase() || '.bin'
  if (!['job', 'customer', 'estimate', 'invoice', 'lead'].includes(entity_type) || !entity_id) return res.status(400).json({ error: 'Bad upload target' })
  if (!ALLOWED_EXT.has(ext)) return res.status(400).json({ error: `File type ${ext} not allowed` })
  if (!req.body?.length) return res.status(400).json({ error: 'Empty file' })
  const filename = token(12) + ext
  writeFileSync(join(UPLOAD_DIR, filename), req.body)
  const id = insert('files', { entity_type, entity_id, filename, original_name: original, mime: String(req.headers['content-type'] || ''), size: req.body.length, user_id: uid(req), caption: String(req.query.caption || '') },
    ['entity_type', 'entity_id', 'filename', 'original_name', 'mime', 'size', 'user_id', 'caption'])
  return { id, filename }
}))
api.get('/files/:id', ah((req, res) => {
  const f = get('SELECT * FROM files WHERE id = ?', int(req.params.id))
  if (!f) return notFound(res, 'File')
  const path = join(UPLOAD_DIR, f.filename)
  if (!existsSync(path)) return notFound(res, 'File')
  res.setHeader('Content-Disposition', `${req.query.download ? 'attachment' : 'inline'}; filename="${f.original_name.replace(/"/g, '')}"`)
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.sendFile(path)
}))
api.delete('/files/:id', ah((req) => {
  const f = get('SELECT * FROM files WHERE id = ?', int(req.params.id))
  if (f) { try { unlinkSync(join(UPLOAD_DIR, f.filename)) } catch {} run('DELETE FROM files WHERE id = ?', f.id) }
  return { ok: true }
}))

// ======================================================================
// Dashboard / action center
// ======================================================================
api.get('/dashboard', ah((req) => {
  const s = getSettings()
  const t = today()
  const monthStart = t.slice(0, 8) + '01'
  const d = new Date(monthStart + 'T12:00:00'); d.setMonth(d.getMonth() - 1)
  const lastMonthStart = d.toISOString().slice(0, 8) + '01'
  const sum = (sql, ...p) => get(sql, ...p).v || 0

  const openInvoices = all(`SELECT i.*, ${CNAME} AS customer_name, ${PAID_SQL} AS paid_cents FROM invoices i JOIN customers c ON c.id = i.customer_id
    WHERE i.status NOT IN ('void','draft')`).map(decorateInvoice).filter((i) => i.balance_cents > 0)

  const jobsToday = all(`SELECT j.*, ${CNAME} AS customer_name, c.phone AS customer_phone FROM jobs j JOIN customers c ON c.id = j.customer_id
    WHERE substr(j.scheduled_start,1,10) = ? AND j.status != 'cancelled' ORDER BY j.scheduled_start`, t).map(jobRow)

  const followDays = parseInt(s.estimate_follow_up_days, 10) || 3
  const leadHours = parseInt(s.lead_response_hours, 10) || 24
  const actions = []
  for (const l of all(`SELECT * FROM leads WHERE status = 'new' AND created_at <= datetime('now', ?)`, `-${leadHours} hours`))
    actions.push({ kind: 'lead', severity: 'high', id: l.id, text: `New lead ${l.name || 'unknown'} hasn't been contacted`, sub: `${l.service || 'General inquiry'} · came in ${l.created_at.slice(0, 10)}`, link: `#/leads/${l.id}`, phone: l.phone })
  for (const l of all(`SELECT * FROM leads WHERE next_follow_up != '' AND next_follow_up <= ? AND status NOT IN ('won','lost')`, t))
    actions.push({ kind: 'lead', severity: 'med', id: l.id, text: `Follow up with ${l.name}`, sub: `Follow-up due ${l.next_follow_up}`, link: `#/leads/${l.id}`, phone: l.phone })
  for (const e of all(`SELECT e.*, ${CNAME} AS customer_name, c.phone FROM estimates e JOIN customers c ON c.id = e.customer_id
      WHERE e.status IN ('sent','viewed') AND e.sent_at <= datetime('now', ?)`, `-${followDays} days`))
    actions.push({ kind: 'estimate', severity: 'med', id: e.id, text: `Follow up on ${e.number} for ${e.customer_name}`, sub: `$${(e.total_cents / 100).toLocaleString()} · ${e.status === 'viewed' ? 'customer viewed it' : 'not opened yet'} · sent ${e.sent_at.slice(0, 10)}`, link: `#/estimates/${e.id}`, phone: e.phone })
  for (const e of all(`SELECT e.*, ${CNAME} AS customer_name FROM estimates e JOIN customers c ON c.id = e.customer_id
      WHERE e.status = 'approved' AND NOT EXISTS (SELECT 1 FROM jobs j WHERE j.estimate_id = e.id)`))
    actions.push({ kind: 'estimate', severity: 'high', id: e.id, text: `${e.customer_name} approved ${e.number} — schedule the job`, sub: `$${(e.total_cents / 100).toLocaleString()} approved ${String(e.approved_at || '').slice(0, 10)}`, link: `#/estimates/${e.id}` })
  for (const j of all(`SELECT j.*, ${CNAME} AS customer_name FROM jobs j JOIN customers c ON c.id = j.customer_id
      WHERE j.status = 'completed' AND NOT EXISTS (SELECT 1 FROM invoices i WHERE i.job_id = j.id AND i.status != 'void')`))
    actions.push({ kind: 'job', severity: 'high', id: j.id, text: `Invoice ${j.customer_name} for completed job ${j.number}`, sub: j.title, link: `#/jobs/${j.id}` })
  for (const j of all(`SELECT j.*, ${CNAME} AS customer_name FROM jobs j JOIN customers c ON c.id = j.customer_id
      WHERE j.status = 'completed' AND j.review_requested_at IS NULL AND j.completed_at >= datetime('now','-30 days')`))
    actions.push({ kind: 'review', severity: 'low', id: j.id, text: `Ask ${j.customer_name} for a Google review`, sub: `Job ${j.number} done ${String(j.completed_at).slice(0, 10)}`, link: `#/jobs/${j.id}` })
  for (const j of all(`SELECT j.*, ${CNAME} AS customer_name FROM jobs j JOIN customers c ON c.id = j.customer_id
      WHERE j.status = 'scheduled' AND substr(j.scheduled_start,1,10) BETWEEN ? AND ?`, t, addDays(t, 4)).map(jobRow)) {
    if (!j.specs?.ticket_number) actions.push({ kind: 'job', severity: 'high', id: j.id, text: `No Miss Utility ticket for ${j.number} (${j.customer_name})`, sub: `Scheduled ${j.scheduled_start.replace('T', ' ')} — call VA811 at least 3 business days ahead`, link: `#/jobs/${j.id}` })
    else if (j.specs.ticket_expires && j.specs.ticket_expires < j.scheduled_start.slice(0, 10)) actions.push({ kind: 'job', severity: 'high', id: j.id, text: `Miss Utility ticket expires before ${j.number}`, sub: `Ticket ${j.specs.ticket_number} expires ${j.specs.ticket_expires}`, link: `#/jobs/${j.id}` })
  }
  for (const i of openInvoices.filter((i) => i.display_status === 'overdue'))
    actions.push({ kind: 'invoice', severity: 'high', id: i.id, text: `${i.number} is overdue — ${i.customer_name}`, sub: `$${(i.balance_cents / 100).toLocaleString()} due ${i.due_date}`, link: `#/invoices/${i.id}` })
  for (const tk of all(`SELECT * FROM tasks WHERE done = 0 AND due_date != '' AND due_date <= ?`, t))
    actions.push({ kind: 'task', severity: 'med', id: tk.id, text: tk.title, sub: `Task due ${tk.due_date}`, link: '#/tasks' })
  const sev = { high: 0, med: 1, low: 2 }
  actions.sort((a, b) => sev[a.severity] - sev[b.severity])

  const months = []
  for (let k = 5; k >= 0; k--) {
    const m = new Date(monthStart + 'T12:00:00'); m.setMonth(m.getMonth() - k)
    const key = m.toISOString().slice(0, 7)
    months.push({ month: key, collected: sum('SELECT SUM(amount_cents) v FROM payments WHERE substr(paid_at,1,7) = ?', key),
      invoiced: sum("SELECT SUM(total_cents) v FROM invoices WHERE status != 'void' AND status != 'draft' AND substr(issue_date,1,7) = ?", key) })
  }

  return {
    kpis: {
      collected_month: sum('SELECT SUM(amount_cents) v FROM payments WHERE paid_at >= ?', monthStart),
      collected_last_month: sum('SELECT SUM(amount_cents) v FROM payments WHERE paid_at >= ? AND paid_at < ?', lastMonthStart, monthStart),
      outstanding: openInvoices.reduce((a, i) => a + i.balance_cents, 0),
      overdue: openInvoices.filter((i) => i.display_status === 'overdue').reduce((a, i) => a + i.balance_cents, 0),
      open_estimates: sum("SELECT SUM(total_cents) v FROM estimates WHERE status IN ('sent','viewed')"),
      open_estimates_count: sum("SELECT COUNT(*) v FROM estimates WHERE status IN ('sent','viewed')"),
      new_leads: sum("SELECT COUNT(*) v FROM leads WHERE status = 'new'"),
      jobs_week: sum("SELECT COUNT(*) v FROM jobs WHERE status != 'cancelled' AND substr(scheduled_start,1,10) BETWEEN ? AND ?", t, addDays(t, 6)),
      backlog: sum("SELECT SUM(e.total_cents) v FROM jobs j JOIN estimates e ON e.id = j.estimate_id WHERE j.status IN ('unscheduled','scheduled')"),
    },
    pipeline: all("SELECT status, COUNT(*) n, SUM(value_cents) v FROM leads GROUP BY status"),
    jobsToday, actions, months,
    recentLeads: all('SELECT * FROM leads ORDER BY created_at DESC LIMIT 6'),
  }
}))

// ======================================================================
// Reports
// ======================================================================
api.get('/reports', office, ah((req) => {
  const from = String(req.query.from || today().slice(0, 4) + '-01-01'), to = String(req.query.to || today())
  const invIn = `i.status NOT IN ('void','draft') AND i.issue_date BETWEEN ? AND ?`
  const one = (sql, ...p) => get(sql, ...p) || {}
  return {
    from, to,
    collected: one('SELECT COALESCE(SUM(amount_cents),0) v, COUNT(*) n FROM payments WHERE paid_at BETWEEN ? AND ?', from, to),
    invoiced: one(`SELECT COALESCE(SUM(total_cents),0) v, COUNT(*) n FROM invoices i WHERE ${invIn}`, from, to),
    byMonth: all(`SELECT substr(paid_at,1,7) month, SUM(amount_cents) v FROM payments WHERE paid_at BETWEEN ? AND ? GROUP BY 1 ORDER BY 1`, from, to),
    byMethod: all('SELECT method, SUM(amount_cents) v, COUNT(*) n FROM payments WHERE paid_at BETWEEN ? AND ? GROUP BY 1 ORDER BY 2 DESC', from, to),
    byService: all(`SELECT li.name, SUM(ROUND(li.qty * li.price_cents)) v, SUM(ROUND(li.qty * li.cost_cents)) cost, SUM(li.qty) qty, li.unit, COUNT(DISTINCT i.id) n
      FROM line_items li JOIN invoices i ON i.id = li.doc_id AND li.doc_type = 'invoice' WHERE ${invIn} GROUP BY li.name ORDER BY v DESC LIMIT 25`, from, to),
    byCity: all(`SELECT COALESCE(NULLIF(c.city,''),'(none)') city, SUM(i.total_cents) v, COUNT(*) n FROM invoices i JOIN customers c ON c.id = i.customer_id
      WHERE ${invIn} GROUP BY 1 ORDER BY v DESC`, from, to),
    bySource: all(`SELECT COALESCE(NULLIF(source,''),'(unknown)') source, COUNT(*) leads, SUM(status = 'won') won, SUM(status = 'lost') lost,
      SUM(CASE WHEN status = 'won' THEN value_cents ELSE 0 END) won_value FROM leads WHERE substr(created_at,1,10) BETWEEN ? AND ? GROUP BY 1 ORDER BY leads DESC`, from, to),
    estimates: one(`SELECT COUNT(*) n, SUM(status = 'approved') approved, SUM(status = 'declined') declined, SUM(status IN ('sent','viewed')) open,
      COALESCE(SUM(total_cents),0) v, COALESCE(SUM(CASE WHEN status = 'approved' THEN total_cents END),0) approved_v
      FROM estimates WHERE issue_date BETWEEN ? AND ? AND status != 'draft'`, from, to),
    jobs: one(`SELECT COUNT(*) n, AVG((julianday(completed_at) - julianday(started_at)) * 24) avg_hours FROM jobs WHERE status = 'completed' AND substr(completed_at,1,10) BETWEEN ? AND ?`, from, to),
    byTech: all(`SELECT u.name, u.color, COUNT(*) jobs FROM jobs j, json_each(j.crew) je JOIN users u ON u.id = je.value
      WHERE j.status = 'completed' AND substr(j.completed_at,1,10) BETWEEN ? AND ? GROUP BY u.id ORDER BY jobs DESC`, from, to),
    aging: (() => {
      const buckets = { current: 0, d30: 0, d60: 0, d90: 0 }
      const rows = all(`SELECT i.*, ${PAID_SQL} AS paid_cents FROM invoices i WHERE i.status NOT IN ('void','draft')`).map(decorateInvoice)
      for (const i of rows) {
        if (!i.balance_cents) continue
        const days = i.due_date ? Math.floor((Date.parse(today()) - Date.parse(i.due_date)) / 864e5) : 0
        buckets[days <= 0 ? 'current' : days <= 30 ? 'd30' : days <= 60 ? 'd60' : 'd90'] += i.balance_cents
      }
      return buckets
    })(),
  }
}))

// ======================================================================
// Search
// ======================================================================
api.get('/search', ah((req) => {
  const raw = String(req.query.q || '').trim()
  if (raw.length < 2) return []
  const q = `%${raw}%`, dq = digits(raw).length >= 3 ? `%${digits(raw)}%` : '__none__'
  const phone = (col) => `replace(replace(replace(replace(${col},'-',''),'(',''),')',''),' ','') LIKE ?`
  const out = []
  for (const r of all(`SELECT c.id, ${CNAME} AS name, c.address, c.city, c.phone FROM customers c WHERE ${CNAME} LIKE ? OR c.email LIKE ? OR c.address LIKE ? OR ${phone('c.phone')} LIMIT 8`, q, q, q, dq))
    out.push({ type: 'Customer', title: r.name, sub: [r.address, r.city, r.phone].filter(Boolean).join(' · '), link: `#/customers/${r.id}` })
  if (req.user.role !== 'tech') {
    for (const r of all(`SELECT id, name, service, status, phone FROM leads WHERE customer_id IS NULL AND (name LIKE ? OR email LIKE ? OR address LIKE ? OR ${phone('phone')}) LIMIT 5`, q, q, q, dq))
      out.push({ type: 'Lead', title: r.name, sub: `${r.service || ''} · ${r.status}`, link: `#/leads/${r.id}` })
    for (const r of all(`SELECT e.id, e.number, e.title, ${CNAME} AS name FROM estimates e JOIN customers c ON c.id = e.customer_id WHERE e.number LIKE ? OR e.title LIKE ? LIMIT 5`, q, q))
      out.push({ type: 'Estimate', title: `${r.number} — ${r.name}`, sub: r.title, link: `#/estimates/${r.id}` })
    for (const r of all(`SELECT i.id, i.number, i.title, ${CNAME} AS name FROM invoices i JOIN customers c ON c.id = i.customer_id WHERE i.number LIKE ? OR i.title LIKE ? LIMIT 5`, q, q))
      out.push({ type: 'Invoice', title: `${r.number} — ${r.name}`, sub: r.title, link: `#/invoices/${r.id}` })
  }
  for (const r of all(`SELECT j.id, j.number, j.title, ${CNAME} AS name FROM jobs j JOIN customers c ON c.id = j.customer_id WHERE j.number LIKE ? OR j.title LIKE ? OR j.address LIKE ? LIMIT 5`, q, q, q))
    out.push({ type: 'Job', title: `${r.number} — ${r.name}`, sub: r.title, link: `#/jobs/${r.id}` })
  return out
}))

// ======================================================================
// Import / export
// ======================================================================
api.post('/import/customers', owner, ah((req, res) => {
  const rows = parseCSV(String(req.body.csv || ''))
  if (rows.length < 2) return res.status(400).json({ error: 'No rows found in that CSV' })
  const header = rows[0].map((h) => h.toLowerCase().replace(/[^a-z]/g, ''))
  const find = (...names) => header.findIndex((h) => names.includes(h))
  const col = {
    first: find('firstname', 'first', 'fname'), last: find('lastname', 'last', 'lname'), name: find('name', 'fullname', 'customername', 'customer', 'displayname'),
    company: find('company', 'companyname', 'business', 'organization'), email: find('email', 'emailaddress', 'primaryemail'),
    phone: find('phone', 'phonenumber', 'mobile', 'mobilephone', 'cell', 'primaryphone', 'cellphone'), alt: find('altphone', 'homephone', 'workphone', 'phone2', 'secondaryphone'),
    address: find('address', 'street', 'streetaddress', 'address1', 'serviceaddress', 'billingaddress'), city: find('city', 'town'),
    state: find('state', 'province', 'region'), zip: find('zip', 'zipcode', 'postalcode', 'postcode'), notes: find('notes', 'note', 'comments'),
    source: find('source', 'leadsource', 'referral', 'referralsource'), tags: find('tags', 'tag', 'labels'),
  }
  const v = (r, i) => (i >= 0 ? String(r[i] || '').trim() : '')
  let created = 0, skipped = 0
  tx(() => {
    for (const r of rows.slice(1)) {
      let first = v(r, col.first), last = v(r, col.last)
      if (!first && !last && col.name >= 0) { const parts = v(r, col.name).split(/\s+/); first = parts.shift() || ''; last = parts.join(' ') }
      const email = v(r, col.email), phone = v(r, col.phone), company = v(r, col.company)
      if (!first && !last && !company && !email && !phone) { skipped++; continue }
      if ((email && get('SELECT id FROM customers WHERE email = ? COLLATE NOCASE', email)) ||
          (digits(phone).length >= 7 && get(`SELECT id FROM customers WHERE ${phone_sql('phone')} = ?`, digits(phone)))) { skipped++; continue }
      insert('customers', { first_name: first, last_name: last, company, type: company && !first ? 'commercial' : 'residential', email, phone, alt_phone: v(r, col.alt),
        address: v(r, col.address), city: v(r, col.city), state: v(r, col.state) || 'VA', zip: v(r, col.zip), notes: v(r, col.notes), source: v(r, col.source) || 'Imported', tags: v(r, col.tags) }, CUSTOMER_COLS)
      created++
    }
  })
  return { created, skipped }
}))
const phone_sql = (c) => `replace(replace(replace(replace(replace(${c},'-',''),'(',''),')',''),' ',''),'.','')`

api.get('/export/:what', office, ah((req, res) => {
  const what = req.params.what
  const queries = {
    customers: `SELECT c.id, c.type, c.first_name, c.last_name, c.company, c.email, c.phone, c.alt_phone, c.address, c.city, c.state, c.zip, c.source, c.tags, c.notes, c.created_at FROM customers c ORDER BY c.id`,
    leads: 'SELECT id, name, email, phone, address, city, state, zip, service, source, status, value_cents/100.0 AS value, message, created_at FROM leads ORDER BY id',
    estimates: `SELECT e.number, ${CNAME} AS customer, e.title, e.status, e.issue_date, e.total_cents/100.0 AS total, e.approved_at FROM estimates e JOIN customers c ON c.id = e.customer_id ORDER BY e.id`,
    invoices: `SELECT i.number, ${CNAME} AS customer, i.title, i.status, i.issue_date, i.due_date, i.total_cents/100.0 AS total, ${PAID_SQL}/100.0 AS paid FROM invoices i JOIN customers c ON c.id = i.customer_id ORDER BY i.id`,
    payments: `SELECT p.paid_at, i.number AS invoice, ${CNAME} AS customer, p.amount_cents/100.0 AS amount, p.method, p.reference, p.note FROM payments p JOIN invoices i ON i.id = p.invoice_id JOIN customers c ON c.id = i.customer_id ORDER BY p.paid_at`,
    jobs: `SELECT j.number, ${CNAME} AS customer, j.title, j.address, j.city, j.status, j.scheduled_start, j.completed_at FROM jobs j JOIN customers c ON c.id = j.customer_id ORDER BY j.id`,
  }
  if (!queries[what]) return notFound(res, 'Export')
  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="raindrains-${what}-${today()}.csv"`)
  res.send(toCSV(all(queries[what])))
}))

// Keep invoiceStatus exported for potential reuse
export { invoiceStatus, createInvoiceFromEstimate }
