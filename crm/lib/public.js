// Public endpoints: website lead intake + customer portal (estimates / invoices).
import express from 'express'
import { all, get, run, insert, getSettings, logActivity } from './db.js'
import { lineItems, computeTotals, refreshTotal, decorateInvoice, PAID_SQL } from './docs.js'
import { paypalConfig, createOrder, captureOrder } from './paypal.js'
import { createInvoiceFromEstimate } from './api.js'

export const pub = express.Router()

// ---------- Website lead intake ----------
const hits = new Map()
function rateLimited(ip, max = 8, windowMs = 10 * 60e3) {
  const now = Date.now()
  const list = (hits.get(ip) || []).filter((t) => now - t < windowMs)
  list.push(now); hits.set(ip, list)
  return list.length > max
}

function cors(req, res) {
  const allowed = getSettings().allowed_origins.split(',').map((s) => s.trim()).filter(Boolean)
  const origin = req.headers.origin
  if (origin && (allowed.includes(origin) || allowed.includes('*'))) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Lead-Key')
  }
}

pub.options('/api/public/leads', (req, res) => { cors(req, res); res.sendStatus(204) })
pub.post('/api/public/leads', express.urlencoded({ extended: false, limit: '50kb' }), express.json({ limit: '50kb' }), (req, res) => {
  cors(req, res)
  const b = req.body || {}
  // Only redirect back to our own allowed websites (no open redirects).
  const allowedOrigins = getSettings().allowed_origins.split(',').map((x) => x.trim()).filter(Boolean)
  const wantsRedirect = typeof b.redirect === 'string' && allowedOrigins.some((o) => o !== '*' && (b.redirect === o || b.redirect.startsWith(o + '/')))
  const done = (status, body) => wantsRedirect ? res.redirect(303, b.redirect) : res.status(status).json(body)

  // Honeypot: real people never fill the hidden "website" field.
  if (b.website || b.company_url) return done(200, { ok: true })
  const s = getSettings()
  if (s.lead_intake_key && (req.headers['x-lead-key'] || b.key) !== s.lead_intake_key) return res.status(403).json({ error: 'Bad key' })
  if (rateLimited(req.ip)) return res.status(429).json({ error: 'Too many submissions — please call us instead.' })

  const clip = (v, n = 300) => String(v ?? '').trim().slice(0, n)
  const name = clip(b.name || [b.first_name, b.last_name].filter(Boolean).join(' '), 120)
  const email = clip(b.email, 200), phone = clip(b.phone, 40)
  if (!name || (!email && !phone)) return res.status(400).json({ error: 'Please include your name and a phone number or email.' })

  const meta = { page: clip(b.page || req.headers.referer, 500), utm_source: clip(b.utm_source), utm_medium: clip(b.utm_medium), utm_campaign: clip(b.utm_campaign), ip: req.ip }
  const customer = (email && get("SELECT id FROM customers WHERE email != '' AND email = ? COLLATE NOCASE", email)) || null
  const id = insert('leads', {
    name, email, phone, customer_id: customer?.id ?? null,
    address: clip(b.address, 200), city: clip(b.city, 80), state: clip(b.state, 20) || 'VA', zip: clip(b.zip, 20),
    service: clip(b.service, 120), message: clip(b.message, 4000),
    source: clip(b.source, 60) || (meta.utm_source ? `Website (${meta.utm_source})` : 'Website'),
    meta,
  }, ['name', 'email', 'phone', 'customer_id', 'address', 'city', 'state', 'zip', 'service', 'message', 'source', 'meta'])
  logActivity({ entity_type: 'lead', entity_id: id, customer_id: customer?.id ?? null, text: `Lead received from website${meta.page ? ` (${meta.page})` : ''}` })
  return done(201, { ok: true })
})

// ---------- Customer portal ----------
function companyInfo() {
  const s = getSettings()
  return { name: s.company_name, phone: s.company_phone, email: s.company_email, address: s.company_address, website: s.company_website, license: s.license, payment_instructions: s.payment_instructions }
}

function payOptions(total_cents) {
  const s = getSettings(), pp = paypalConfig()
  return {
    paypal: pp.enabled ? { clientId: pp.clientId } : null,
    wisetack: s.wisetack_url && /^https:\/\//.test(s.wisetack_url) && total_cents >= (Number(s.wisetack_min) || 0) * 100 ? s.wisetack_url : null,
  }
}

/** Deposit still owed on an approved estimate (0 if none required or already paid). */
function depositDue(e) {
  if (e.status !== 'approved' || !e.deposit_pct) return 0
  const want = Math.round(e.total_cents * e.deposit_pct / 100)
  const paid = get(`SELECT COALESCE(SUM(p.amount_cents),0) v FROM payments p JOIN invoices i ON i.id = p.invoice_id WHERE i.estimate_id = ? AND i.status != 'void'`, e.id).v
  return Math.max(0, want - paid)
}

const CN = `TRIM(CASE WHEN c.type = 'commercial' AND c.company != '' THEN c.company ELSE c.first_name || ' ' || c.last_name END)`
const PUBLIC_ITEM = (li) => ({ id: li.id, name: li.name, description: li.description, qty: li.qty, unit: li.unit, price_cents: li.price_cents, taxable: li.taxable, optional: li.optional, selected: li.selected })

pub.get('/api/portal/estimate/:token', (req, res) => {
  const e = get(`SELECT e.*, ${CN} AS customer_name, c.email AS customer_email, c.phone AS customer_phone FROM estimates e JOIN customers c ON c.id = e.customer_id WHERE e.token = ?`, req.params.token)
  if (!e || e.status === 'draft' && !req.query.preview) return res.status(404).json({ error: 'Estimate not found' })
  if (!req.query.preview && e.status === 'sent') {
    run("UPDATE estimates SET status = 'viewed', viewed_at = datetime('now') WHERE id = ?", e.id)
    logActivity({ entity_type: 'estimate', entity_id: e.id, customer_id: e.customer_id, text: `Customer opened estimate ${e.number}` })
    e.status = 'viewed'
  }
  const items = lineItems('estimate', e.id)
  res.json({
    kind: 'estimate', company: companyInfo(),
    doc: { number: e.number, title: e.title, address: e.address, status: e.status, issue_date: e.issue_date, expiry_date: e.expiry_date, notes: e.notes, terms: e.terms,
      tax_rate: e.tax_rate, discount_cents: e.discount_cents, deposit_pct: e.deposit_pct, customer_name: e.customer_name, customer_email: e.customer_email, customer_phone: e.customer_phone,
      approved_at: e.approved_at, signature_name: e.signature_name, signature_data: e.signature_data, declined_at: e.declined_at },
    items: items.map(PUBLIC_ITEM), totals: computeTotals(items, e.tax_rate, e.discount_cents),
    deposit_due_cents: depositDue(e), pay: payOptions(e.total_cents),
  })
})

pub.post('/api/portal/estimate/:token/approve', express.json({ limit: '600kb' }), (req, res) => {
  const e = get('SELECT * FROM estimates WHERE token = ?', req.params.token)
  if (!e || e.status === 'draft') return res.status(404).json({ error: 'Estimate not found' })
  if (e.status === 'approved') return res.status(400).json({ error: 'This estimate was already approved' })
  if (e.expiry_date && e.expiry_date < new Date().toISOString().slice(0, 10)) return res.status(400).json({ error: 'This estimate has expired — please contact us for an updated quote.' })
  const name = String(req.body.name || '').trim().slice(0, 120)
  const sig = String(req.body.signature || '')
  if (!name) return res.status(400).json({ error: 'Please type your full name to approve' })
  if (sig && !/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(sig)) return res.status(400).json({ error: 'Bad signature' })
  const selected = new Set((req.body.selected || []).map(Number))
  for (const li of lineItems('estimate', e.id)) if (li.optional) run('UPDATE line_items SET selected = ? WHERE id = ?', selected.has(li.id) ? 1 : 0, li.id)
  const t = refreshTotal('estimate', e.id)
  run(`UPDATE estimates SET status = 'approved', approved_at = datetime('now'), signature_name = ?, signature_data = ?, updated_at = datetime('now') WHERE id = ?`, name, sig, e.id)
  if (e.lead_id) run("UPDATE leads SET status = 'won', value_cents = ? WHERE id = ?", t.total, e.lead_id)
  logActivity({ entity_type: 'estimate', entity_id: e.id, customer_id: e.customer_id, text: `✅ ${name} approved estimate ${e.number} online ($${(t.total / 100).toFixed(2)})` })
  res.json({ ok: true })
})

pub.post('/api/portal/estimate/:token/decline', express.json(), (req, res) => {
  const e = get('SELECT * FROM estimates WHERE token = ?', req.params.token)
  if (!e || e.status === 'draft') return res.status(404).json({ error: 'Estimate not found' })
  if (e.status === 'approved') return res.status(400).json({ error: 'This estimate was already approved — please call us to make changes.' })
  const reason = String(req.body.reason || '').slice(0, 1000)
  run("UPDATE estimates SET status = 'declined', declined_at = datetime('now'), declined_reason = ?, updated_at = datetime('now') WHERE id = ?", reason, e.id)
  if (e.lead_id) run("UPDATE leads SET status = 'lost', lost_reason = ? WHERE id = ?", reason, e.lead_id)
  logActivity({ entity_type: 'estimate', entity_id: e.id, customer_id: e.customer_id, text: `Customer declined estimate ${e.number}${reason ? `: “${reason}”` : ''}` })
  res.json({ ok: true })
})

pub.get('/api/portal/invoice/:token', (req, res) => {
  const inv = decorateInvoice(get(`SELECT i.*, ${CN} AS customer_name, c.email AS customer_email, c.phone AS customer_phone, ${PAID_SQL} AS paid_cents
    FROM invoices i JOIN customers c ON c.id = i.customer_id WHERE i.token = ?`, req.params.token))
  if (!inv || (inv.status === 'draft' && !req.query.preview) || inv.status === 'void') return res.status(404).json({ error: 'Invoice not found' })
  if (!req.query.preview && !inv.viewed_at) {
    run("UPDATE invoices SET viewed_at = datetime('now') WHERE id = ?", inv.id)
    logActivity({ entity_type: 'invoice', entity_id: inv.id, customer_id: inv.customer_id, text: `Customer opened invoice ${inv.number}` })
  }
  const items = lineItems('invoice', inv.id)
  res.json({
    kind: 'invoice', company: companyInfo(),
    doc: { number: inv.number, title: inv.title, address: inv.address, status: inv.display_status, issue_date: inv.issue_date, due_date: inv.due_date, notes: inv.notes, terms: inv.terms,
      tax_rate: inv.tax_rate, discount_cents: inv.discount_cents, customer_name: inv.customer_name, paid_cents: inv.paid_cents, balance_cents: inv.balance_cents },
    items: items.map(PUBLIC_ITEM), totals: computeTotals(items, inv.tax_rate, inv.discount_cents),
    payments: all('SELECT amount_cents, method, paid_at FROM payments WHERE invoice_id = ? ORDER BY paid_at', inv.id),
    pay: payOptions(inv.balance_cents),
  })
})

// ---------- Online payments (PayPal) ----------
function lookup(kind, token) {
  if (kind === 'invoice') {
    const inv = decorateInvoice(get(`SELECT i.*, ${PAID_SQL} AS paid_cents FROM invoices i WHERE i.token = ?`, token))
    if (!inv || inv.status === 'draft' || inv.status === 'void') return null
    return { ref: `inv:${inv.id}`, cents: inv.balance_cents, description: `Invoice ${inv.number}`, inv }
  }
  if (kind !== 'estimate') return null
  const e = get('SELECT * FROM estimates WHERE token = ?', token)
  if (!e) return null
  return { ref: `est:${e.id}`, cents: depositDue(e), description: `Deposit for estimate ${e.number}`, est: e }
}

pub.post('/api/portal/:kind/:token/paypal/order', express.json(), async (req, res) => {
  try {
    const t = lookup(req.params.kind, req.params.token)
    if (!t) return res.status(404).json({ error: 'Not found' })
    if (t.cents <= 0) return res.status(400).json({ error: 'Nothing is due right now' })
    res.json({ id: await createOrder({ cents: t.cents, ref: t.ref, description: t.description }) })
  } catch (e) { res.status(400).json({ error: e.message }) }
})

pub.post('/api/portal/:kind/:token/paypal/capture', express.json(), async (req, res) => {
  try {
    const t = lookup(req.params.kind, req.params.token)
    if (!t) return res.status(404).json({ error: 'Not found' })
    const cap = await captureOrder(req.body.orderID, t.ref)
    if (get("SELECT id FROM payments WHERE method = 'paypal' AND reference = ?", cap.captureId)) return res.json({ ok: true })
    let invoice = t.inv
    if (!invoice) {
      // Deposit on an estimate: goes on the project's single invoice, created now if needed, with no due date yet.
      const existed = get("SELECT id FROM invoices WHERE estimate_id = ? AND status != 'void'", t.est.id)
      const id = createInvoiceFromEstimate(t.est, null, {})
      if (!existed) run("UPDATE invoices SET due_date = '', status = 'sent' WHERE id = ?", id)
      invoice = get('SELECT * FROM invoices WHERE id = ?', id)
    }
    run(`INSERT INTO payments (invoice_id, amount_cents, method, reference, note, paid_at) VALUES (?,?,?,?,?,date('now','localtime'))`,
      invoice.id, cap.cents, 'paypal', cap.captureId, cap.pending ? 'PayPal says this payment is pending review' : (t.est ? 'Deposit paid online' : 'Paid online'))
    if (invoice.status === 'draft') run("UPDATE invoices SET status = 'sent' WHERE id = ?", invoice.id)
    logActivity({ entity_type: 'invoice', entity_id: invoice.id, customer_id: invoice.customer_id,
      text: `💳 Customer paid $${(cap.cents / 100).toFixed(2)} online via PayPal${t.est ? ' (deposit)' : ''} on ${invoice.number}${cap.pending ? ' — pending' : ''}` })
    res.json({ ok: true })
  } catch (e) { res.status(400).json({ error: e.message }) }
})

// Let the office know when a customer looks at financing, so they can follow up.
const financeSeen = new Map()
pub.post('/api/portal/:kind/:token/financing', (req, res) => {
  const table = { estimate: 'estimates', invoice: 'invoices' }[req.params.kind]
  const d = table && get(`SELECT id, number, customer_id FROM ${table} WHERE token = ?`, req.params.token)
  if (d && Date.now() - (financeSeen.get(table + d.id) || 0) > 3600e3) {
    financeSeen.set(table + d.id, Date.now())
    logActivity({ entity_type: req.params.kind, entity_id: d.id, customer_id: d.customer_id, text: `Customer opened Wisetack financing from ${d.number} — check Wisetack and follow up` })
  }
  res.sendStatus(204)
})
