// Integration test: boots the server on a throwaway database and walks the core sales → cash workflow.
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const PORT = 4987, B = `http://localhost:${PORT}`
const dir = mkdtempSync(join(tmpdir(), 'rdcrm-'))
let srv, cookie = ''

const call = async (path, { method = 'GET', body } = {}) => {
  const r = await fetch(B + path, { method, headers: { 'Content-Type': 'application/json', cookie }, body: body && JSON.stringify(body) })
  const set = r.headers.get('set-cookie'); if (set) cookie = set.split(';')[0]
  return { status: r.status, body: await r.json() }
}

before(async () => {
  srv = spawn(process.execPath, ['--disable-warning=ExperimentalWarning', 'server.js'], { cwd: join(import.meta.dirname, '..'), env: { ...process.env, PORT, DATA_DIR: dir }, stdio: 'ignore' })
  for (let i = 0; i < 50; i++) { try { if ((await fetch(B + '/healthz')).ok) return } catch {} await new Promise((r) => setTimeout(r, 100)) }
  throw new Error('server did not start')
})
after(() => { srv.kill(); rmSync(dir, { recursive: true, force: true }) })

test('first-run setup, auth required', async () => {
  assert.equal((await call('/api/customers')).status, 401)
  assert.equal((await call('/api/auth/status')).body.needsSetup, true)
  assert.equal((await call('/api/auth/setup', { method: 'POST', body: { name: 'Owner', email: 'o@x.com', password: 'short' } })).status, 400)
  assert.equal((await call('/api/auth/setup', { method: 'POST', body: { name: 'Owner', email: 'o@x.com', password: 'longenough' } })).status, 200)
  assert.equal((await call('/api/auth/me')).body.role, 'owner')
})

test('lead → estimate → portal approval → job → invoice → payment', async () => {
  const lead = await fetch(B + '/api/public/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Sam Rivers', phone: '757-555-1111', city: 'Suffolk' }) })
  assert.equal(lead.status, 201)
  const [l] = (await call('/api/leads')).body
  const conv = (await call(`/api/leads/${l.id}/convert`, { method: 'POST', body: { create_estimate: true } })).body
  assert.ok(conv.customer_id && conv.estimate_id)

  await call(`/api/estimates/${conv.estimate_id}`, { method: 'PUT', body: { tax_rate: 0, discount_cents: 5000, items: [
    { name: 'French Drain', qty: 50, unit: 'lf', price_cents: 4500, cost_cents: 1500 },
    { name: 'Dry Well', qty: 1, price_cents: 120000, optional: 1, selected: 0 },
  ] } })
  let est = (await call(`/api/estimates/${conv.estimate_id}`)).body
  assert.equal(est.total_cents, 225000 - 5000)
  assert.equal(est.totals.optionalAvailable, 120000)

  // Drafts aren't visible to customers
  assert.equal((await fetch(`${B}/api/portal/estimate/${est.token}`)).status, 404)
  await call(`/api/estimates/${est.id}/send`, { method: 'POST', body: { via: 'email' } })
  const portal = await (await fetch(`${B}/api/portal/estimate/${est.token}`)).json()
  assert.equal(portal.doc.status, 'viewed')
  assert.equal(portal.items[0].cost_cents, undefined, 'costs never leak to the customer')

  const optId = portal.items.find((i) => i.optional).id
  const ap = await fetch(`${B}/api/portal/estimate/${est.token}/approve`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Sam Rivers', selected: [optId] }) })
  assert.equal(ap.status, 200)
  est = (await call(`/api/estimates/${est.id}`)).body
  assert.equal(est.status, 'approved')
  assert.equal(est.total_cents, 345000 - 5000)

  const job = (await call(`/api/estimates/${est.id}/convert-job`, { method: 'POST' })).body
  await call(`/api/jobs/${job.id}`, { method: 'PUT', body: { status: 'completed' } })
  const dash = (await call('/api/dashboard')).body
  assert.ok(dash.actions.some((a) => a.text.startsWith('Invoice')), 'completed-but-uninvoiced job is flagged')

  const inv = (await call(`/api/jobs/${job.id}/invoice`, { method: 'POST' })).body
  await call(`/api/invoices/${inv.id}/payments`, { method: 'POST', body: { amount_cents: 340000, method: 'check' } })
  const paid = (await call(`/api/invoices/${inv.id}`)).body
  assert.equal(paid.display_status, 'paid')
  assert.equal(paid.balance_cents, 0)
  assert.equal((await call(`/api/invoices/${inv.id}`, { method: 'DELETE' })).status, 400, 'paid invoices cannot be deleted')
})

test('crew members are restricted', async () => {
  await call('/api/users', { method: 'POST', body: { name: 'Crew', email: 'c@x.com', password: 'crewpassword', role: 'tech' } })
  await call('/api/auth/logout', { method: 'POST' }); cookie = ''
  await call('/api/auth/login', { method: 'POST', body: { email: 'c@x.com', password: 'crewpassword' } })
  assert.equal((await call('/api/invoices')).status, 403)
  assert.equal((await call('/api/estimates')).status, 403)
  assert.equal((await call('/api/settings', { method: 'PUT', body: { company_name: 'x' } })).status, 403)
  assert.deepEqual((await call('/api/jobs')).body, [])
})
