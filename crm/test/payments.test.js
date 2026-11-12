// Online payments: runs the CRM against a fake PayPal API to check deposits, invoice payments and safety checks.
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const PORT = 4988, PP_PORT = 4989, B = `http://localhost:${PORT}`
const dir = mkdtempSync(join(tmpdir(), 'rdcrm-pay-'))
let srv, pp, cookie = ''

// Fake PayPal: remembers each order's amount + custom_id, captures for that amount.
const orders = new Map()
let n = 0
before(async () => {
  pp = createServer((req, res) => {
    let body = ''
    req.on('data', (c) => (body += c))
    req.on('end', () => {
      res.setHeader('Content-Type', 'application/json')
      if (req.url === '/v1/oauth2/token') {
        const ok = req.headers.authorization === 'Basic ' + Buffer.from('CID:SECRET').toString('base64')
        res.statusCode = ok ? 200 : 401
        return res.end(JSON.stringify(ok ? { access_token: 'tok', expires_in: 3600 } : { error_description: 'Client Authentication failed' }))
      }
      if (req.url === '/v2/checkout/orders') {
        const id = 'ORDER' + ++n
        orders.set(id, JSON.parse(body).purchase_units[0])
        return res.end(JSON.stringify({ id, status: 'CREATED' }))
      }
      const m = req.url.match(/^\/v2\/checkout\/orders\/(\w+)\/capture$/)
      if (m && orders.has(m[1])) {
        const u = orders.get(m[1])
        return res.end(JSON.stringify({ id: m[1], status: 'COMPLETED', purchase_units: [{ custom_id: u.custom_id, payments: { captures: [{ id: 'CAP' + m[1], status: 'COMPLETED', amount: u.amount }] } }] }))
      }
      res.statusCode = 404; res.end('{}')
    })
  }).listen(PP_PORT)
  srv = spawn(process.execPath, ['--disable-warning=ExperimentalWarning', 'server.js'], {
    cwd: join(import.meta.dirname, '..'), env: { ...process.env, PORT, DATA_DIR: dir, PAYPAL_API_BASE: `http://localhost:${PP_PORT}` }, stdio: 'ignore',
  })
  for (let i = 0; i < 50; i++) { try { if ((await fetch(B + '/healthz')).ok) break } catch {} await new Promise((r) => setTimeout(r, 100)) }
  await call('/api/auth/setup', { method: 'POST', body: { name: 'Owner', email: 'o@x.com', password: 'longenough' } })
})
after(() => { srv.kill(); pp.close(); rmSync(dir, { recursive: true, force: true }) })

async function call(path, { method = 'GET', body } = {}) {
  const r = await fetch(B + path, { method, headers: { 'Content-Type': 'application/json', cookie }, body: body && JSON.stringify(body) })
  const set = r.headers.get('set-cookie'); if (set) cookie = set.split(';')[0]
  return { status: r.status, body: await r.json().catch(() => ({})) }
}
const pub = async (path, body) => { const r = await fetch(B + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) }); return { status: r.status, body: await r.json().catch(() => ({})) } }

test('PayPal settings: secret is never returned, bad keys fail the test button', async () => {
  await call('/api/settings', { method: 'PUT', body: { paypal_enabled: '1', paypal_env: 'sandbox', paypal_client_id: 'CID', paypal_secret: 'WRONG' } })
  assert.equal((await call('/api/settings/paypal-test', { method: 'POST' })).status, 400)
  await call('/api/settings', { method: 'PUT', body: { paypal_secret: 'SECRET' } })
  await call('/api/settings', { method: 'PUT', body: { paypal_secret: '' } }) // blank keeps it
  const s = (await call('/api/settings')).body
  assert.equal(s.paypal_secret, undefined)
  assert.equal(s.paypal_secret_set, '1')
  assert.equal((await call('/api/settings/paypal-test', { method: 'POST' })).status, 200)
})

test('deposit after approval → one invoice → pay balance online', async () => {
  await call('/api/settings', { method: 'PUT', body: { wisetack_url: 'https://example.com/apply', wisetack_min: '500' } })
  const c = (await call('/api/customers', { method: 'POST', body: { first_name: 'Dee', last_name: 'Posit' } })).body
  const { id } = (await call('/api/estimates', { method: 'POST', body: { customer_id: c.id, title: 'Drain', deposit_pct: 25, items: [{ name: 'French Drain', qty: 100, price_cents: 4000 }] } })).body
  await call(`/api/estimates/${id}/send`, { method: 'POST' })
  const est = (await call(`/api/estimates/${id}`)).body
  const base = `/api/portal/estimate/${est.token}`

  let p = await (await fetch(B + base)).json()
  assert.equal(p.pay.paypal.clientId, 'CID')
  assert.equal(p.pay.wisetack, 'https://example.com/apply')
  assert.equal(p.deposit_due_cents, 0, 'no deposit until approved')
  assert.equal((await pub(base + '/paypal/order')).status, 400)

  await pub(base + '/approve', { name: 'Dee Posit' })
  p = await (await fetch(B + base)).json()
  assert.equal(p.deposit_due_cents, 100000)

  const order = await pub(base + '/paypal/order')
  // Tampering: an order made for this estimate can't be captured against a different invoice.
  const cap = await pub(base + '/paypal/capture', { orderID: order.body.id })
  assert.equal(cap.status, 200)
  assert.equal((await pub(base + '/paypal/capture', { orderID: order.body.id })).status, 200, 'double capture is harmless')
  p = await (await fetch(B + base)).json()
  assert.equal(p.deposit_due_cents, 0)

  const invs = (await call('/api/invoices')).body.filter((i) => i.estimate_id === id)
  assert.equal(invs.length, 1)
  assert.equal(invs[0].paid_cents, 100000)
  assert.equal(invs[0].display_status, 'partial')
  assert.equal(invs[0].due_date, '', 'deposit invoice is not overdue before the work is done')

  // Job done → "Create invoice" reuses the same invoice instead of billing twice.
  const job = (await call(`/api/estimates/${id}/convert-job`, { method: 'POST' })).body
  const inv = (await call(`/api/jobs/${job.id}/invoice`, { method: 'POST' })).body
  assert.equal(inv.id, invs[0].id)
  const full = (await call(`/api/invoices/${inv.id}`)).body
  assert.ok(full.due_date, 'due date set when final invoice is issued')
  assert.equal(full.balance_cents, 300000)

  const ib = `/api/portal/invoice/${full.token}`
  const o2 = await pub(ib + '/paypal/order')
  assert.equal(orders.get(o2.body.id).amount.value, '3000.00', 'server sets the amount, not the browser')
  assert.equal((await pub(base + '/paypal/capture', { orderID: o2.body.id })).status, 400, 'invoice order cannot be captured on the estimate')
  assert.equal((await pub(ib + '/paypal/capture', { orderID: o2.body.id })).status, 200)
  const paid = (await call(`/api/invoices/${inv.id}`)).body
  assert.equal(paid.display_status, 'paid')
  assert.ok(paid.payments.every((x) => x.method === 'paypal'))
  assert.equal((await pub(ib + '/paypal/order')).status, 400, 'nothing left to pay')

  assert.equal((await fetch(B + base + '/financing', { method: 'POST' })).status, 204)
  const acts = (await call(`/api/estimates/${id}`)).body.activity
  assert.ok(acts.some((a) => a.text.includes('Wisetack')))
})
