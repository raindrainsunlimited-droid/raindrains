// Rain Drains CRM — database layer (Node's built-in SQLite, no native deps).
import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

// Business runs on Eastern time; "today" and schedule dates follow it.
process.env.TZ ||= 'America/New_York'

export const DATA_DIR = process.env.DATA_DIR || join(import.meta.dirname, '..', 'data')
export const UPLOAD_DIR = join(DATA_DIR, 'uploads')
mkdirSync(UPLOAD_DIR, { recursive: true })

export const db = new DatabaseSync(process.env.DB_FILE || join(DATA_DIR, 'crm.sqlite'))
db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;')

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  phone TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'tech',          -- owner | office | tech
  color TEXT DEFAULT '#1c6fd6',
  password_hash TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT);

CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'residential',
  first_name TEXT DEFAULT '', last_name TEXT DEFAULT '', company TEXT DEFAULT '',
  email TEXT DEFAULT '', phone TEXT DEFAULT '', alt_phone TEXT DEFAULT '',
  address TEXT DEFAULT '', city TEXT DEFAULT '', state TEXT DEFAULT 'VA', zip TEXT DEFAULT '',
  source TEXT DEFAULT '', tags TEXT DEFAULT '', notes TEXT DEFAULT '',
  archived INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  name TEXT NOT NULL DEFAULT '', email TEXT DEFAULT '', phone TEXT DEFAULT '',
  address TEXT DEFAULT '', city TEXT DEFAULT '', state TEXT DEFAULT 'VA', zip TEXT DEFAULT '',
  service TEXT DEFAULT '', message TEXT DEFAULT '', source TEXT DEFAULT 'Website',
  status TEXT NOT NULL DEFAULT 'new',          -- new | contacted | appointment | estimated | won | lost
  value_cents INTEGER DEFAULT 0,
  assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
  appointment_at TEXT DEFAULT '',
  next_follow_up TEXT DEFAULT '',
  lost_reason TEXT DEFAULT '',
  meta TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL, description TEXT DEFAULT '', category TEXT DEFAULT 'Service',
  unit TEXT DEFAULT 'ea', price_cents INTEGER NOT NULL DEFAULT 0, cost_cents INTEGER NOT NULL DEFAULT 0,
  taxable INTEGER NOT NULL DEFAULT 0, active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS estimates (
  id INTEGER PRIMARY KEY,
  number TEXT NOT NULL,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  lead_id INTEGER REFERENCES leads(id) ON DELETE SET NULL,
  title TEXT DEFAULT '', address TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft',        -- draft | sent | viewed | approved | declined
  issue_date TEXT, expiry_date TEXT,
  notes TEXT DEFAULT '', terms TEXT DEFAULT '',
  tax_rate REAL NOT NULL DEFAULT 0, discount_cents INTEGER NOT NULL DEFAULT 0, deposit_pct REAL NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL DEFAULT 0,
  token TEXT NOT NULL UNIQUE,
  sent_at TEXT, viewed_at TEXT, approved_at TEXT, declined_at TEXT,
  signature_name TEXT DEFAULT '', signature_data TEXT DEFAULT '', declined_reason TEXT DEFAULT '',
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY,
  number TEXT NOT NULL,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  estimate_id INTEGER REFERENCES estimates(id) ON DELETE SET NULL,
  title TEXT DEFAULT '', address TEXT DEFAULT '', city TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'unscheduled',  -- unscheduled | scheduled | in_progress | completed | cancelled
  priority TEXT NOT NULL DEFAULT 'normal',
  scheduled_start TEXT DEFAULT '',             -- local 'YYYY-MM-DDTHH:MM'
  duration_min INTEGER NOT NULL DEFAULT 480,
  crew TEXT NOT NULL DEFAULT '[]',             -- JSON array of user ids
  description TEXT DEFAULT '',
  specs TEXT NOT NULL DEFAULT '{}',            -- drainage-specific details
  checklist TEXT NOT NULL DEFAULT '[]',
  started_at TEXT, completed_at TEXT, review_requested_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY,
  number TEXT NOT NULL,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  job_id INTEGER REFERENCES jobs(id) ON DELETE SET NULL,
  estimate_id INTEGER REFERENCES estimates(id) ON DELETE SET NULL,
  title TEXT DEFAULT '', address TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft',        -- draft | sent | void (paid/partial/overdue are derived)
  issue_date TEXT, due_date TEXT,
  notes TEXT DEFAULT '', terms TEXT DEFAULT '',
  tax_rate REAL NOT NULL DEFAULT 0, discount_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL DEFAULT 0,
  token TEXT NOT NULL UNIQUE,
  sent_at TEXT, viewed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS line_items (
  id INTEGER PRIMARY KEY,
  doc_type TEXT NOT NULL,                      -- estimate | invoice
  doc_id INTEGER NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  item_id INTEGER REFERENCES items(id) ON DELETE SET NULL,
  name TEXT NOT NULL DEFAULT '', description TEXT DEFAULT '',
  qty REAL NOT NULL DEFAULT 1, unit TEXT DEFAULT 'ea',
  price_cents INTEGER NOT NULL DEFAULT 0, cost_cents INTEGER NOT NULL DEFAULT 0,
  taxable INTEGER NOT NULL DEFAULT 0,
  optional INTEGER NOT NULL DEFAULT 0,          -- customer can opt in from the portal
  selected INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS li_doc ON line_items(doc_type, doc_id);

CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY,
  invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  method TEXT NOT NULL DEFAULT 'check',
  reference TEXT DEFAULT '', note TEXT DEFAULT '',
  paid_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS activity (
  id INTEGER PRIMARY KEY,
  entity_type TEXT NOT NULL, entity_id INTEGER NOT NULL,
  customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  kind TEXT NOT NULL DEFAULT 'event',          -- event | note | call | email | text
  text TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS act_cust ON activity(customer_id);
CREATE INDEX IF NOT EXISTS act_ent ON activity(entity_type, entity_id);

CREATE TABLE IF NOT EXISTS files (
  id INTEGER PRIMARY KEY,
  entity_type TEXT NOT NULL, entity_id INTEGER NOT NULL,
  filename TEXT NOT NULL, original_name TEXT DEFAULT '', mime TEXT DEFAULT '', size INTEGER DEFAULT 0,
  caption TEXT DEFAULT '',
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL, due_date TEXT DEFAULT '', done INTEGER NOT NULL DEFAULT 0,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  entity_type TEXT DEFAULT '', entity_id INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`)

// ---------- helpers ----------
export const all = (sql, ...p) => db.prepare(sql).all(...p)
export const get = (sql, ...p) => db.prepare(sql).get(...p)
export const run = (sql, ...p) => db.prepare(sql).run(...p)

export function tx(fn) {
  db.exec('BEGIN')
  try { const r = fn(); db.exec('COMMIT'); return r } catch (e) { db.exec('ROLLBACK'); throw e }
}

/** Insert a row from an object, keeping only allowed columns. */
export function insert(table, data, allowed) {
  const cols = Object.keys(data).filter((k) => allowed.includes(k) && data[k] !== undefined)
  const sql = `INSERT INTO ${table} (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`
  return Number(run(sql, ...cols.map((c) => norm(data[c]))).lastInsertRowid)
}

/** Update a row from an object, keeping only allowed columns. */
export function update(table, id, data, allowed, touch = true) {
  const cols = Object.keys(data).filter((k) => allowed.includes(k) && data[k] !== undefined)
  if (!cols.length) return
  const sets = cols.map((c) => `${c} = ?`)
  if (touch) sets.push(`updated_at = datetime('now')`)
  run(`UPDATE ${table} SET ${sets.join(', ')} WHERE id = ?`, ...cols.map((c) => norm(data[c])), id)
}

function norm(v) {
  if (v === null) return null
  if (typeof v === 'boolean') return v ? 1 : 0
  if (typeof v === 'object') return JSON.stringify(v)
  return v
}

// ---------- settings ----------
export const DEFAULT_SETTINGS = {
  company_name: 'Rain Drains',
  company_phone: '757-807-0080',
  company_email: 'bryson@raindrainsva.com',
  company_address: 'Chesapeake, VA 23322',
  company_website: 'https://raindrainsva.com',
  license: 'VA Lic. 2705198697',
  default_tax_rate: '0',
  estimate_terms: 'Estimate valid for 30 days. Work is guaranteed against defects in workmanship. Customer is responsible for marking private utilities (irrigation, invisible fence, lighting). Miss Utility will be called before any digging.',
  invoice_terms: 'Payment due upon completion unless otherwise agreed. Checks payable to Rain Drains LLC.',
  payment_instructions: 'We accept check, cash, Zelle, and card. Make checks payable to Rain Drains LLC.',
  review_url: 'https://g.page/r/CfFriXdNrUAYEAE/review',
  estimate_follow_up_days: '3',
  lead_response_hours: '24',
  invoice_due_days: '0',
  estimate_valid_days: '30',
  next_estimate_number: '1001',
  next_invoice_number: '1001',
  next_job_number: '1001',
  lead_intake_key: '',
  allowed_origins: 'https://raindrainsva.com,https://www.raindrainsva.com',
}

export function getSettings() {
  const out = { ...DEFAULT_SETTINGS }
  for (const r of all('SELECT key, value FROM settings')) out[r.key] = r.value
  return out
}
export function setSetting(key, value) {
  run('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', key, String(value ?? ''))
}

/** Atomically take the next document number, e.g. nextNumber('estimate') -> 'E-1001'. */
export function nextNumber(kind) {
  const prefix = { estimate: 'E-', invoice: 'INV-', job: 'J-' }[kind]
  const key = `next_${kind}_number`
  const n = parseInt(getSettings()[key], 10) || 1001
  setSetting(key, n + 1)
  return prefix + n
}

export function logActivity({ entity_type, entity_id, customer_id = null, user_id = null, kind = 'event', text }) {
  run('INSERT INTO activity (entity_type, entity_id, customer_id, user_id, kind, text) VALUES (?,?,?,?,?,?)',
    entity_type, entity_id, customer_id, user_id, kind, text)
}
