// PayPal Orders v2 integration (server side). Amounts are always computed on the server.
import { getSettings } from './db.js'

export function paypalConfig() {
  const s = getSettings()
  const clientId = process.env.PAYPAL_CLIENT_ID || s.paypal_client_id
  const secret = process.env.PAYPAL_CLIENT_SECRET || s.paypal_secret
  const env = s.paypal_env === 'sandbox' ? 'sandbox' : 'live'
  const base = process.env.PAYPAL_API_BASE || (env === 'sandbox' ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com')
  return { enabled: s.paypal_enabled === '1' && !!clientId && !!secret, clientId, secret, env, base }
}

let cached = { token: null, exp: 0, key: '' }
async function accessToken(cfg) {
  const key = cfg.clientId + cfg.base
  if (cached.token && cached.key === key && Date.now() < cached.exp) return cached.token
  const r = await fetch(cfg.base + '/v1/oauth2/token', {
    method: 'POST',
    headers: { Authorization: 'Basic ' + Buffer.from(`${cfg.clientId}:${cfg.secret}`).toString('base64'), 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  })
  const j = await r.json().catch(() => ({}))
  if (!r.ok || !j.access_token) throw new Error(j.error_description || 'PayPal rejected the API keys')
  cached = { token: j.access_token, exp: Date.now() + (Number(j.expires_in || 300) - 60) * 1000, key }
  return cached.token
}

async function pp(cfg, path, body) {
  const r = await fetch(cfg.base + path, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + (await accessToken(cfg)), 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(j.details?.[0]?.description || j.message || `PayPal error ${r.status}`)
  return j
}

export async function testConnection() {
  const cfg = paypalConfig()
  if (!cfg.clientId || !cfg.secret) throw new Error('Enter your PayPal Client ID and Secret first')
  cached = { token: null, exp: 0, key: '' }
  await accessToken(cfg)
  return { ok: true, env: cfg.env }
}

/** Create an order for exactly `cents`. `ref` ties it back to our record, e.g. 'inv:12'. */
export async function createOrder({ cents, ref, description }) {
  const cfg = paypalConfig()
  if (!cfg.enabled) throw new Error('Online payments are not turned on')
  const order = await pp(cfg, '/v2/checkout/orders', {
    intent: 'CAPTURE',
    purchase_units: [{ custom_id: ref, description: String(description).slice(0, 120), amount: { currency_code: 'USD', value: (cents / 100).toFixed(2) } }],
    application_context: { brand_name: getSettings().company_name.slice(0, 120), shipping_preference: 'NO_SHIPPING', user_action: 'PAY_NOW' },
  })
  return order.id
}

/** Capture an approved order and return { captureId, cents } after checking it belongs to `ref`. */
export async function captureOrder(orderId, ref) {
  const cfg = paypalConfig()
  if (!/^[A-Z0-9]+$/.test(String(orderId))) throw new Error('Bad order id')
  const o = await pp(cfg, `/v2/checkout/orders/${orderId}/capture`)
  const unit = o.purchase_units?.[0]
  const cap = unit?.payments?.captures?.[0]
  if (unit?.custom_id !== ref) throw new Error('Payment does not match this document')
  if (o.status !== 'COMPLETED' || !cap || !['COMPLETED', 'PENDING'].includes(cap.status)) throw new Error('Payment was not completed')
  return { captureId: cap.id, cents: Math.round(Number(cap.amount.value) * 100), pending: cap.status === 'PENDING' }
}
