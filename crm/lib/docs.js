// Estimate / invoice math and line-item persistence.
import { all, get, run } from './db.js'

export function lineItems(doc_type, doc_id) {
  return all('SELECT * FROM line_items WHERE doc_type = ? AND doc_id = ? ORDER BY position, id', doc_type, doc_id)
}

/** Compute totals from line items. Optional items only count when selected. */
export function computeTotals(items, tax_rate = 0, discount_cents = 0) {
  let subtotal = 0, taxable = 0, cost = 0, optionalAvailable = 0
  for (const li of items) {
    const amt = Math.round((Number(li.qty) || 0) * (Number(li.price_cents) || 0))
    if (li.optional && !li.selected) { optionalAvailable += amt; continue }
    subtotal += amt
    cost += Math.round((Number(li.qty) || 0) * (Number(li.cost_cents) || 0))
    if (li.taxable) taxable += amt
  }
  const discount = Math.min(Math.max(0, Number(discount_cents) || 0), subtotal)
  // Discount is applied proportionally to the taxable portion.
  const taxableAfterDiscount = subtotal ? taxable - Math.round(discount * (taxable / subtotal)) : 0
  const tax = Math.round(taxableAfterDiscount * (Number(tax_rate) || 0) / 100)
  const total = subtotal - discount + tax
  return { subtotal, discount, tax, total, cost, margin: subtotal - discount - cost, optionalAvailable }
}

export function saveLineItems(doc_type, doc_id, items = []) {
  run('DELETE FROM line_items WHERE doc_type = ? AND doc_id = ?', doc_type, doc_id)
  const stmt = `INSERT INTO line_items (doc_type, doc_id, position, item_id, name, description, qty, unit, price_cents, cost_cents, taxable, optional, selected)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`
  items.forEach((li, i) => {
    if (!li.name && !li.description) return
    run(stmt, doc_type, doc_id, i, li.item_id || null, li.name || '', li.description || '',
      Number(li.qty) || 0, li.unit || 'ea', Math.round(Number(li.price_cents) || 0), Math.round(Number(li.cost_cents) || 0),
      li.taxable ? 1 : 0, li.optional ? 1 : 0, li.optional ? (li.selected ? 1 : 0) : 1)
  })
}

export function refreshTotal(doc_type, doc_id) {
  const table = doc_type === 'estimate' ? 'estimates' : 'invoices'
  const doc = get(`SELECT tax_rate, discount_cents FROM ${table} WHERE id = ?`, doc_id)
  if (!doc) return null
  const t = computeTotals(lineItems(doc_type, doc_id), doc.tax_rate, doc.discount_cents)
  run(`UPDATE ${table} SET total_cents = ? WHERE id = ?`, t.total, doc_id)
  return t
}

export const today = () => localDate(new Date())
export function localDate(d) {
  const z = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`
}
export function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return localDate(d)
}

/** SQL fragment that yields paid_cents for invoice alias i. */
export const PAID_SQL = '(SELECT COALESCE(SUM(amount_cents),0) FROM payments p WHERE p.invoice_id = i.id)'

/** Derive the display status of an invoice. */
export function invoiceStatus(inv) {
  if (inv.status === 'void') return 'void'
  const paid = inv.paid_cents || 0
  if (inv.total_cents > 0 && paid >= inv.total_cents) return 'paid'
  if (inv.status === 'draft') return 'draft'
  if (paid > 0) return inv.due_date && inv.due_date < today() ? 'overdue' : 'partial'
  if (inv.due_date && inv.due_date < today()) return 'overdue'
  return inv.viewed_at ? 'viewed' : 'sent'
}

export function decorateInvoice(inv) {
  if (!inv) return inv
  inv.paid_cents = inv.paid_cents ?? get('SELECT COALESCE(SUM(amount_cents),0) s FROM payments WHERE invoice_id = ?', inv.id).s
  inv.balance_cents = Math.max(0, inv.total_cents - inv.paid_cents)
  inv.display_status = invoiceStatus(inv)
  return inv
}
