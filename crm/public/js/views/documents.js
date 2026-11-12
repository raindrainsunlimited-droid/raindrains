// Estimates + invoices (shared editor), and the payments list.
import { GET, POST, PUT, DEL, html, raw, esc, money, pill, fmtDate, fmtDateTime, toCents, fromCents, field, select, formModal, modal, confirmBox, toast, fail, state,
  loadItems, portalUrl, copy, customerPicker, bindCustomerPicker, today, smsHref, isOwner } from '../core.js'
import { icon } from '../icons.js'
import { timeline, bindTimeline } from '../components.js'

const CFG = {
  estimate: { path: 'estimates', title: 'Estimates', one: 'Estimate',
    tabs: [['', 'All'], ['draft', 'Draft'], ['open', 'Awaiting decision'], ['approved', 'Approved'], ['declined', 'Declined']],
    match: (d, f) => !f || (f === 'open' ? ['sent', 'viewed'].includes(d.status) : d.status === f), status: (d) => d.status },
  invoice: { path: 'invoices', title: 'Invoices', one: 'Invoice',
    tabs: [['', 'All'], ['draft', 'Draft'], ['open', 'Unpaid'], ['overdue', 'Overdue'], ['paid', 'Paid'], ['void', 'Void']],
    match: (d, f) => !f || (f === 'open' ? ['sent', 'viewed', 'partial', 'overdue'].includes(d.display_status) : d.display_status === f), status: (d) => d.display_status },
}

export default async function documents(el, params) {
  if (params.kind === 'payments') return payments(el)
  const cfg = CFG[params.kind]
  if (params.id) return editor(el, params.kind, params.id)
  if (params.query.new) {
    history.replaceState(null, '', `#/${cfg.path}`)
    return createNew(params.kind, params.query.customer)
  }
  const rows = await GET('/' + cfg.path)
  let filter = params.query.status || '', q = ''
  const draw = () => {
    const f = rows.filter((d) => cfg.match(d, filter) && (!q || `${d.number} ${d.customer_name} ${d.title}`.toLowerCase().includes(q)))
    const sum = f.reduce((a, d) => a + (params.kind === 'invoice' ? (d.display_status === 'void' ? 0 : d.balance_cents) : d.total_cents), 0)
    el.innerHTML = html`
    <div class="page-head"><div><h1>${cfg.title}</h1><p class="sub">${f.length} shown · ${money(sum, { whole: true })} ${params.kind === 'invoice' ? 'balance due' : 'total'}</p></div>
      <div class="btn-row">${params.kind === 'invoice' ? html`<a class="btn" href="#/payments">${raw(icon('dollar', 15))} Payments</a>` : ''}
      <button class="btn btn-primary" data-new>${raw(icon('plus'))} New ${cfg.one.toLowerCase()}</button></div></div>
    <div class="toolbar">
      <div class="tabs">${cfg.tabs.map(([v, l]) => html`<button data-f="${v}" class="${filter === v ? 'on' : ''}">${l}<span class="count">${rows.filter((d) => cfg.match(d, v)).length}</span></button>`)}</div>
      <input type="search" class="q" placeholder="Search…" value="${q}" data-q>
    </div>
    <div class="card table-wrap">${f.length ? html`<table class="t"><thead><tr><th>#</th><th>Customer</th><th class="hide-sm">Title</th><th class="hide-sm">${params.kind === 'invoice' ? 'Due' : 'Date'}</th><th>Status</th><th class="num">Total</th>${params.kind === 'invoice' ? html`<th class="num">Balance</th>` : ''}</tr></thead>
      <tbody>${f.map((d) => html`<tr class="click" data-href="#/${cfg.path}/${d.id}"><td><b>${d.number}</b></td><td>${d.customer_name}</td><td class="hide-sm">${d.title}</td>
        <td class="hide-sm">${fmtDate(params.kind === 'invoice' ? d.due_date : d.issue_date)}</td><td>${pill(cfg.status(d))}</td><td class="num">${money(d.total_cents)}</td>
        ${params.kind === 'invoice' ? html`<td class="num" style="${d.balance_cents && d.display_status !== 'void' ? 'font-weight:700' : ''}">${d.display_status === 'void' ? '—' : money(d.balance_cents)}</td>` : ''}</tr>`)}</tbody></table>`
      : html`<div class="empty">Nothing here yet.</div>`}</div>`
    el.querySelector('[data-new]').onclick = () => createNew(params.kind)
    el.querySelectorAll('[data-f]').forEach((b) => (b.onclick = () => { filter = b.dataset.f; draw() }))
    const qi = el.querySelector('[data-q]')
    qi.oninput = () => { q = qi.value.toLowerCase(); draw(); const n = el.querySelector('[data-q]'); n.focus(); n.setSelectionRange(q.length, q.length) }
    el.querySelectorAll('tr[data-href]').forEach((tr) => (tr.onclick = () => (location.hash = tr.dataset.href)))
  }
  draw()
}

async function createNew(kind, customer_id) {
  const cfg = CFG[kind]
  let cust = null
  if (customer_id) cust = await GET('/customers/' + customer_id).catch(() => null)
  const r = await formModal(`New ${cfg.one.toLowerCase()}`, html`<div class="form-grid">
    ${customerPicker(cust?.id || '', cust?.display_name || '')}
    ${field('Title', 'title', '', { span: 2, placeholder: 'e.g. Backyard French Drain' })}
    ${field('Job address', 'address', cust ? [cust.address, cust.city].filter(Boolean).join(', ') : '', { span: 2, help: 'Defaults to the customer address' })}
    <p class="muted span-2 small">Don't see them? <a href="#/customers?new=1" data-close>Add a new customer</a> first.</p>
  </div>`, {
    submit: 'Create',
    onOpen: (form) => bindCustomerPicker(form, { onPick: async (id) => {
      const c = await GET('/customers/' + id); if (!form.address.value) form.address.value = [c.address, c.city].filter(Boolean).join(', ')
    } }),
    validate: (d) => (!d.customer_id ? 'Pick a customer from the list' : null),
  })
  if (!r) { if (location.hash.includes('new=1')) history.back(); return }
  try {
    const { id } = await POST('/' + cfg.path, { customer_id: Number(r.customer_id), title: r.title, address: r.address })
    location.hash = `#/${cfg.path}/${id}`
  } catch (e) { fail(e) }
}

// ======================================================================
// Editor
// ======================================================================
async function editor(el, kind, id) {
  const cfg = CFG[kind]
  const [doc, catalog] = await Promise.all([GET(`/${cfg.path}/${id}`), loadItems()])
  let items = doc.items.map((li) => ({ ...li }))
  let dirty = false
  const isEst = kind === 'estimate'
  const locked = isEst ? doc.status === 'approved' : doc.status === 'void'
  const status = isEst ? doc.status : doc.display_status

  el.innerHTML = html`
  <div class="page-head">
    <div><a class="crumb" href="#/${cfg.path}">← ${cfg.title}</a>
      <h1>${cfg.one} ${doc.number} ${pill(status)}</h1>
      <p class="sub"><a href="#/customers/${doc.customer_id}">${doc.customer_name}</a>${doc.customer_phone ? ' · ' + doc.customer_phone : ''}
        ${!isEst && doc.job ? html` · <a href="#/jobs/${doc.job.id}">Job ${doc.job.number}</a>` : ''}
        ${!isEst && doc.estimate ? html` · <a href="#/estimates/${doc.estimate.id}">Estimate ${doc.estimate.number}</a>` : ''}
        ${isEst && doc.jobs.length ? html` · ${doc.jobs.map((j) => html`<a href="#/jobs/${j.id}">Job ${j.number}</a> `)}` : ''}
        ${isEst && doc.invoices.length ? html` · ${doc.invoices.map((i) => html`<a href="#/invoices/${i.id}">Invoice ${i.number}</a> `)}` : ''}</p>
    </div>
    <div class="btn-row no-print">
      <button class="btn" data-save ${locked ? raw('disabled') : ''}>Save</button>
      <a class="btn" href="${portalUrl(kind, doc.token)}?preview=1" target="_blank" rel="noopener">${raw(icon('eye', 15))} Preview</a>
      ${!locked ? html`<button class="btn btn-primary" data-send>${raw(icon('mail', 15))} ${doc.sent_at ? 'Resend' : 'Send'}</button>` : ''}
      ${!isEst && doc.balance_cents > 0 && doc.status !== 'void' ? html`<button class="btn btn-green" data-pay>${raw(icon('dollar', 15))} Record payment</button>` : ''}
      ${isEst && doc.status === 'approved' && !doc.jobs.length ? html`<button class="btn btn-green" data-to-job>${raw(icon('truck', 15))} Create job</button>` : ''}
      <div class="new-menu" style="margin:0"><button class="btn" data-more>More ▾</button>
        <div class="dropdown" data-more-menu hidden>
          ${isEst ? html`
            ${doc.status !== 'approved' ? html`<button data-mark="approved">${raw(icon('done', 15))} Mark approved</button>` : ''}
            ${doc.status !== 'declined' && doc.status !== 'approved' ? html`<button data-mark="declined">✕ Mark declined</button>` : ''}
            ${doc.status === 'approved' || doc.status === 'declined' ? html`<button data-mark="sent">↺ Reopen</button>` : ''}
            <button data-to-job>${raw(icon('truck', 15))} Convert to job</button>
            <button data-to-invoice>${raw(icon('receipt', 15))} Convert to invoice</button>
            <button data-dup>${raw(icon('copy', 15))} Duplicate</button>` : html`
            <button data-void>${doc.status === 'void' ? '↺ Restore invoice' : '⊘ Void invoice'}</button>`}
          <button data-copy-link>${raw(icon('link', 15))} Copy customer link</button>
          <button data-print>${raw(icon('print', 15))} Print / PDF</button>
          <button data-delete style="color:var(--red)">${raw(icon('trash', 15))} Delete</button>
        </div></div>
    </div>
  </div>

  ${locked && isEst ? html`<div class="card card-pad" style="margin-bottom:16px;background:var(--green-soft);border-color:#bfe6cf">
    <b>✅ Approved ${fmtDateTime(doc.approved_at)}${doc.signature_name ? ` by ${doc.signature_name}` : ''}.</b> <span class="muted">Approved estimates are locked. Reopen it from “More” to make changes.</span>
    ${doc.signature_data ? html`<div style="margin-top:8px"><img src="${doc.signature_data}" alt="Signature" style="max-height:60px;background:#fff;border-radius:6px;padding:4px"></div>` : ''}</div>` : ''}
  ${isEst && doc.status === 'declined' && doc.declined_reason ? html`<div class="card card-pad" style="margin-bottom:16px;background:var(--red-soft);border-color:#f3c9c9"><b>Declined:</b> “${doc.declined_reason}”</div>` : ''}

  <div class="split">
    <div class="stack">
      <div class="card card-body">
        <div class="form-grid g3" data-head>
          ${field('Title', 'title', doc.title, { span: 2 })}
          ${field(isEst ? 'Estimate date' : 'Invoice date', 'issue_date', doc.issue_date, { type: 'date' })}
          ${field('Job address', 'address', doc.address, { span: 2 })}
          ${isEst ? field('Expires', 'expiry_date', doc.expiry_date, { type: 'date' }) : field('Due date', 'due_date', doc.due_date, { type: 'date' })}
        </div>
      </div>

      <div class="card">
        <div class="card-head"><h3>Line items</h3>${isEst ? html`<small class="muted">Mark lines “Optional” to let the customer add them when approving</small>` : ''}</div>
        <div class="card-body" style="padding-top:6px">
          <div class="table-wrap"><table class="li-table"><thead><tr><th style="width:28px"></th><th>Item</th><th style="width:80px" class="right">Qty</th><th style="width:70px">Unit</th><th style="width:110px" class="right">Price</th><th style="width:60px">Tax</th>${isEst ? html`<th style="width:60px">Opt.</th>` : ''}<th style="width:110px" class="right">Amount</th><th style="width:34px"></th></tr></thead>
            <tbody data-lines></tbody></table></div>
          ${!locked ? html`<div class="btn-row" style="margin-top:12px">
            <div class="item-search"><input class="inp" style="width:320px;max-width:70vw" placeholder="+ Add from price book (type to search)" data-item-q autocomplete="off"><div class="item-results" data-item-res hidden></div></div>
            <button class="btn btn-sm" data-add-custom>+ Custom line</button></div>` : ''}
          <div class="divider"></div>
          <div class="totals" data-totals></div>
        </div>
      </div>

      <div class="card card-body"><div class="form-grid">
        ${field('Notes to customer', 'notes', doc.notes, { type: 'textarea', span: 2, placeholder: isEst ? 'Scope details, what is included, timeline…' : 'Thank you for your business!' })}
        ${field('Terms', 'terms', doc.terms, { type: 'textarea', span: 2 })}
      </div></div>
      ${timeline(doc.activity, { entity_type: kind, entity_id: doc.id, customer_id: doc.customer_id })}
    </div>

    <div class="stack">
      <div class="card card-pad" data-summary></div>
      ${!isEst ? html`<div class="card"><div class="card-head"><h3>Payments</h3>${doc.status !== 'void' ? html`<button class="btn btn-sm" data-pay>+ Record</button>` : ''}</div>
        ${doc.payments.length ? html`<table class="t"><tbody>${doc.payments.map((p) => html`<tr><td>${fmtDate(p.paid_at)}<small>${p.method}${p.reference ? ' · ' + p.reference : ''}</small></td><td class="num"><b>${money(p.amount_cents)}</b></td><td style="width:34px"><button class="icon-btn" data-del-pay="${p.id}" title="Remove">${raw(icon('trash', 14))}</button></td></tr>`)}</tbody></table>`
        : html`<div class="empty small">No payments yet</div>`}</div>` : ''}
      <div class="card card-pad">
        <h3 style="margin-bottom:8px">Customer link</h3>
        <p class="muted small" style="margin-bottom:10px">${isEst ? 'Customer can view, pick options, and approve with an e-signature.' : 'Customer can view the invoice and payment history.'}</p>
        <div class="btn-row"><button class="btn btn-sm" data-copy-link>${raw(icon('link', 14))} Copy link</button>
          <a class="btn btn-sm" href="${portalUrl(kind, doc.token)}?preview=1" target="_blank" rel="noopener">${raw(icon('eye', 14))} Preview</a></div>
        ${doc.sent_at ? html`<p class="small muted" style="margin-top:10px">Sent ${fmtDateTime(doc.sent_at)}${doc.viewed_at ? html`<br><b style="color:var(--purple)">Viewed ${fmtDateTime(doc.viewed_at)}</b>` : ' · not opened yet'}</p>` : ''}
      </div>
    </div>
  </div>`

  const linesEl = el.querySelector('[data-lines]'), totalsEl = el.querySelector('[data-totals]'), summaryEl = el.querySelector('[data-summary]')
  const head = () => {
    const out = {}
    el.querySelectorAll('[data-head] [name], textarea[name=notes], textarea[name=terms]').forEach((i) => (out[i.name] = i.value))
    return out
  }
  const markDirty = () => { dirty = true; el.querySelector('[data-save]').classList.add('btn-primary') }

  const calc = () => {
    let sub = 0, taxable = 0, cost = 0, opt = 0
    for (const li of items) {
      const amt = Math.round((Number(li.qty) || 0) * (Number(li.price_cents) || 0))
      if (li.optional && !li.selected) { opt += amt; continue }
      sub += amt; cost += Math.round((Number(li.qty) || 0) * (Number(li.cost_cents) || 0)); if (li.taxable) taxable += amt
    }
    const disc = Math.min(doc.discount_cents || 0, sub)
    const tax = Math.round((sub ? taxable - Math.round(disc * taxable / sub) : 0) * (Number(doc.tax_rate) || 0) / 100)
    return { sub, disc, tax, total: sub - disc + tax, cost, profit: sub - disc - cost, opt }
  }

  const drawLines = () => {
    linesEl.innerHTML = items.map((li, i) => html`<tr class="${li.optional ? 'opt' : ''}" data-i="${i}">
      <td class="drag"><div style="display:flex;flex-direction:column">${i > 0 && !locked ? html`<button class="icon-btn" style="width:20px;height:16px" data-up="${i}" title="Move up">▴</button>` : ''}${i < items.length - 1 && !locked ? html`<button class="icon-btn" style="width:20px;height:16px" data-down="${i}" title="Move down">▾</button>` : ''}</div></td>
      <td class="desc"><input data-k="name" value="${li.name}" placeholder="Item name" ${locked ? raw('disabled') : ''}><textarea data-k="description" rows="2" placeholder="Description (optional)" ${locked ? raw('disabled') : ''}>${li.description}</textarea></td>
      <td class="num"><input data-k="qty" type="number" step="any" value="${li.qty}" ${locked ? raw('disabled') : ''}></td>
      <td><input data-k="unit" value="${li.unit}" ${locked ? raw('disabled') : ''}></td>
      <td class="num"><input data-k="price" type="number" step="0.01" value="${fromCents(li.price_cents)}" ${locked ? raw('disabled') : ''}></td>
      <td style="padding-top:12px"><input type="checkbox" data-k="taxable" ${li.taxable ? raw('checked') : ''} ${locked ? raw('disabled') : ''} title="Taxable"></td>
      ${isEst ? html`<td style="padding-top:12px"><input type="checkbox" data-k="optional" ${li.optional ? raw('checked') : ''} ${locked ? raw('disabled') : ''} title="Optional add-on"></td>` : ''}
      <td class="amt">${money(Math.round(li.qty * li.price_cents))}${li.optional ? html`<br><small class="muted" style="font-weight:600">${li.selected ? 'selected' : 'optional'}</small>` : ''}</td>
      <td>${!locked ? html`<button class="icon-btn" data-rm="${i}" title="Remove">${raw(icon('trash', 14))}</button>` : ''}</td>
    </tr>`).join('') || `<tr><td colspan="9" class="muted" style="padding:20px;text-align:center">No line items yet — add from your price book below.</td></tr>`
    drawTotals()
  }

  const drawTotals = () => {
    const t = calc()
    totalsEl.innerHTML = html`
      <div><span>Subtotal</span><b>${money(t.sub)}</b></div>
      <div><span>Discount</span><span>$ <input type="number" step="0.01" min="0" data-disc value="${fromCents(doc.discount_cents)}" ${locked ? raw('disabled') : ''}></span></div>
      <div><span>Tax rate</span><span><input type="number" step="0.001" min="0" data-tax value="${doc.tax_rate}" ${locked ? raw('disabled') : ''}> %</span></div>
      ${t.tax ? html`<div><span>Tax</span><span>${money(t.tax)}</span></div>` : ''}
      ${isEst ? html`<div><span>Deposit required</span><span><input type="number" step="1" min="0" max="100" data-dep value="${doc.deposit_pct}" ${locked ? raw('disabled') : ''}> %</span></div>` : ''}
      <div class="grand"><span>Total</span><span>${money(t.total)}</span></div>
      ${t.opt ? html`<div class="muted small"><span>+ optional add-ons available</span><span>${money(t.opt)}</span></div>` : ''}
      ${!isEst ? html`<div><span>Paid</span><span>${money(doc.paid_cents)}</span></div><div style="font-weight:800"><span>Balance due</span><span>${money(Math.max(0, t.total - doc.paid_cents))}</span></div>` : ''}`
    const margin = t.sub ? Math.round((t.profit / (t.sub - t.disc || 1)) * 100) : 0
    summaryEl.innerHTML = html`
      <div class="label muted small" style="font-weight:700;text-transform:uppercase;letter-spacing:.05em">Total</div>
      <div style="font-size:30px;font-weight:800;color:var(--navy)">${money(t.total)}</div>
      ${isEst && doc.deposit_pct ? html`<div class="muted">Deposit ${doc.deposit_pct}%: <b>${money(Math.round(t.total * doc.deposit_pct / 100))}</b></div>` : ''}
      ${!isEst ? html`<div class="muted">Balance due: <b style="color:${doc.balance_cents ? 'var(--red)' : 'var(--green)'}">${money(Math.max(0, t.total - doc.paid_cents))}</b></div>` : ''}
      <div class="divider"></div>
      <div style="display:flex;justify-content:space-between"><span class="muted">Est. cost</span><span>${money(t.cost)}</span></div>
      <div style="display:flex;justify-content:space-between"><span class="muted">Est. gross profit</span><b style="color:${t.profit >= 0 ? 'var(--green)' : 'var(--red)'}">${money(t.profit)} (${margin}%)</b></div>
      <p class="small muted" style="margin-top:6px">Internal only — customers never see cost or profit.</p>`
    bindTotals()
  }

  const bindTotals = () => {
    const on = (sel, fn) => { const i = totalsEl.querySelector(sel); if (i) i.oninput = () => { fn(i.value); markDirty(); drawTotalsOnlySummary() } }
    on('[data-disc]', (v) => (doc.discount_cents = toCents(v || 0)))
    on('[data-tax]', (v) => (doc.tax_rate = Number(v) || 0))
    on('[data-dep]', (v) => (doc.deposit_pct = Number(v) || 0))
  }
  // Re-render totals but keep focus in the input being typed in.
  const drawTotalsOnlySummary = () => {
    const active = document.activeElement, key = active && [...active.attributes].find((a) => a.name.startsWith('data-'))?.name
    const pos = active?.selectionStart
    drawTotals()
    if (key) { const n = totalsEl.querySelector(`[${key}]`); if (n) { n.focus(); try { n.setSelectionRange(pos, pos) } catch {} } }
  }

  linesEl.addEventListener('input', (e) => {
    const tr = e.target.closest('tr[data-i]'); if (!tr) return
    const li = items[Number(tr.dataset.i)], k = e.target.dataset.k
    if (k === 'price') li.price_cents = toCents(e.target.value || 0)
    else if (k === 'qty') li.qty = Number(e.target.value) || 0
    else if (k === 'taxable') li.taxable = e.target.checked ? 1 : 0
    else if (k === 'optional') { li.optional = e.target.checked ? 1 : 0; li.selected = li.optional ? 0 : 1; markDirty(); return drawLines() }
    else li[k] = e.target.value
    markDirty()
    tr.querySelector('.amt').firstChild.textContent = money(Math.round(li.qty * li.price_cents))
    drawTotals()
  })
  linesEl.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return
    if (b.dataset.rm) { items.splice(Number(b.dataset.rm), 1) }
    else if (b.dataset.up) { const i = Number(b.dataset.up);[items[i - 1], items[i]] = [items[i], items[i - 1]] }
    else if (b.dataset.down) { const i = Number(b.dataset.down);[items[i + 1], items[i]] = [items[i], items[i + 1]] }
    else return
    markDirty(); drawLines()
  })

  // Price-book search
  const iq = el.querySelector('[data-item-q]'), ires = el.querySelector('[data-item-res]')
  if (iq) {
    let act = 0, matches = []
    const show = () => {
      const s = iq.value.toLowerCase().trim()
      matches = catalog.filter((it) => it.active && (!s || `${it.name} ${it.category} ${it.description}`.toLowerCase().includes(s))).slice(0, 30)
      ires.innerHTML = matches.map((it, i) => html`<button type="button" data-pick="${it.id}" class="${i === act ? 'on' : ''}"><span><b>${it.name}</b><small>${it.category} · ${it.description}</small></span><span class="nowrap"><b>${money(it.price_cents)}</b>/${it.unit}</span></button>`).join('') || '<div class="muted" style="padding:10px">No matching items. <a href="#/pricebook">Edit price book</a></div>'
      ires.hidden = false
    }
    const pick = (it) => {
      items.push({ item_id: it.id, name: it.name, description: it.description, qty: 1, unit: it.unit, price_cents: it.price_cents, cost_cents: it.cost_cents, taxable: it.taxable, optional: 0, selected: 1 })
      iq.value = ''; ires.hidden = true; markDirty(); drawLines()
      linesEl.querySelector(`tr[data-i="${items.length - 1}"] [data-k=qty]`)?.select()
    }
    iq.addEventListener('focus', () => { act = 0; show() })
    iq.addEventListener('input', () => { act = 0; show() })
    iq.addEventListener('blur', () => setTimeout(() => (ires.hidden = true), 150))
    iq.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { act = Math.min(act + 1, matches.length - 1); show(); e.preventDefault() }
      if (e.key === 'ArrowUp') { act = Math.max(act - 1, 0); show(); e.preventDefault() }
      if (e.key === 'Enter') { e.preventDefault(); if (matches[act]) pick(matches[act]) }
    })
    ires.addEventListener('mousedown', (e) => { const b = e.target.closest('[data-pick]'); if (b) { e.preventDefault(); pick(catalog.find((x) => x.id === Number(b.dataset.pick))) } })
    el.querySelector('[data-add-custom]').onclick = () => {
      items.push({ name: '', description: '', qty: 1, unit: 'ea', price_cents: 0, cost_cents: 0, taxable: 0, optional: 0, selected: 1 })
      markDirty(); drawLines(); linesEl.querySelector(`tr[data-i="${items.length - 1}"] [data-k=name]`)?.focus()
    }
  }
  el.querySelectorAll('[data-head] [name], textarea[name=notes], textarea[name=terms]').forEach((i) => i.addEventListener('input', markDirty))

  const save = async (quiet) => {
    if (locked) return true
    try {
      await PUT(`/${cfg.path}/${doc.id}`, { ...head(), tax_rate: doc.tax_rate, discount_cents: doc.discount_cents, ...(isEst ? { deposit_pct: doc.deposit_pct } : {}), items })
      dirty = false; el.querySelector('[data-save]')?.classList.remove('btn-primary')
      if (!quiet) toast('Saved')
      return true
    } catch (e) { fail(e); return false }
  }
  const reload = () => editor(el, kind, id)
  const saveThen = async (fn) => { if (dirty && !(await save(true))) return; await fn() }

  el.querySelector('[data-save]').onclick = async () => { if (await save()) reload() }
  bindTimeline(el, reload)
  const more = el.querySelector('[data-more]'), menu = el.querySelector('[data-more-menu]')
  more.onclick = (e) => { e.stopPropagation(); menu.hidden = !menu.hidden }
  document.addEventListener('click', () => (menu.hidden = true), { once: true })
  el.querySelectorAll('[data-copy-link]').forEach((b) => (b.onclick = () => copy(portalUrl(kind, doc.token))))
  el.querySelector('[data-print]').onclick = () => window.open(portalUrl(kind, doc.token) + '?preview=1&print=1', '_blank')
  el.querySelector('[data-send]')?.addEventListener('click', () => saveThen(() => sendDialog(kind, doc, calc().total).then((sent) => sent && reload())))
  el.querySelectorAll('[data-pay]').forEach((b) => (b.onclick = () => saveThen(() => paymentDialog(doc).then((ok) => ok && reload()))))
  el.querySelectorAll('[data-del-pay]').forEach((b) => (b.onclick = async () => {
    if (!(await confirmBox('Remove this payment?', { ok: 'Remove', danger: true }))) return
    await DEL('/payments/' + b.dataset.delPay).catch(fail); reload()
  }))
  el.querySelectorAll('[data-mark]').forEach((b) => (b.onclick = () => saveThen(async () => { await POST(`/estimates/${doc.id}/status`, { status: b.dataset.mark }).catch(fail); reload() })))
  el.querySelectorAll('[data-to-job]').forEach((b) => (b.onclick = () => saveThen(async () => {
    try { const r = await POST(`/estimates/${doc.id}/convert-job`); toast('Job created — now schedule it'); location.hash = '#/jobs/' + r.id } catch (e) { fail(e) }
  })))
  el.querySelector('[data-to-invoice]')?.addEventListener('click', () => saveThen(async () => {
    try { const r = await POST(`/estimates/${doc.id}/convert-invoice`); toast('Invoice created'); location.hash = '#/invoices/' + r.id } catch (e) { fail(e) }
  }))
  el.querySelector('[data-dup]')?.addEventListener('click', () => saveThen(async () => {
    try { const r = await POST(`/estimates/${doc.id}/duplicate`); toast('Duplicated'); location.hash = '#/estimates/' + r.id } catch (e) { fail(e) }
  }))
  el.querySelector('[data-void]')?.addEventListener('click', async () => {
    if (doc.status !== 'void' && !(await confirmBox(`Void invoice ${doc.number}? It will no longer count toward A/R.`, { ok: 'Void', danger: true }))) return
    await POST(`/invoices/${doc.id}/void`).catch(fail); reload()
  })
  el.querySelector('[data-delete]').onclick = async () => {
    if (!(await confirmBox(`Delete ${cfg.one.toLowerCase()} ${doc.number}? This can't be undone.`, { ok: 'Delete', danger: true }))) return
    try { await DEL(`/${cfg.path}/${doc.id}`); location.hash = '#/' + cfg.path } catch (e) { fail(e) }
  }
  drawLines()
}

// ---------- Send ----------
async function sendDialog(kind, doc, total) {
  const s = state.settings
  const link = portalUrl(kind, doc.token)
  const first = (doc.customer_name || '').split(' ')[0]
  const isEst = kind === 'estimate'
  const subject = isEst ? `Your ${s.company_name} estimate ${doc.number}` : `Invoice ${doc.number} from ${s.company_name}`
  const body = isEst
    ? `Hi ${first},\n\nThanks for having us out. Your estimate for ${doc.title || 'your project'} (${money(total)}) is ready. You can review it, choose any add-ons, and approve it online here:\n\n${link}\n\nAny questions, just call or text ${s.company_phone}.\n\n${state.user.name}\n${s.company_name}`
    : `Hi ${first},\n\nThank you for choosing ${s.company_name}! Your invoice ${doc.number} for ${money(total)} is here:\n\n${link}\n\n${s.payment_instructions}\n\nQuestions? Call or text ${s.company_phone}.\n\n${s.company_name}`
  const text = isEst
    ? `Hi ${first}, it's ${state.user.name.split(' ')[0]} with ${s.company_name}. Your estimate is ready to review & approve: ${link}`
    : `Hi ${first}, thanks for choosing ${s.company_name}! Your invoice ${doc.number} (${money(total)}) is here: ${link}`
  return modal(html`
    <div class="modal-head"><h3>Send ${isEst ? 'estimate' : 'invoice'} ${doc.number}</h3><button class="icon-btn" data-close>✕</button></div>
    <div class="modal-body">
      <p class="muted" style="margin-bottom:12px">Opens your email or messages app with a ready-to-send note and the customer link. We'll log it and track when they open it.</p>
      <label class="field"><span>Customer link</span><input readonly value="${link}" onclick="this.select()"></label>
      <div class="grid g3" style="margin-top:16px">
        <a class="btn btn-primary btn-lg" data-via="email" href="mailto:${doc.customer_email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}">${raw(icon('mail'))} Email</a>
        <a class="btn btn-primary btn-lg" data-via="text" href="${smsHref(doc.customer_phone, text)}">${raw(icon('sms'))} Text</a>
        <button class="btn btn-lg" data-via="link">${raw(icon('link'))} Copy link</button>
      </div>
      ${!doc.customer_email ? html`<p class="small muted" style="margin-top:10px">No email on file for this customer.</p>` : ''}
    </div>`.toString(), {
    onOpen: (m, close) => m.querySelectorAll('[data-via]').forEach((b) => b.addEventListener('click', async () => {
      if (b.dataset.via === 'link') await copy(link)
      try { await POST(`/${CFG[kind].path}/${doc.id}/send`, { via: b.dataset.via }); toast('Marked as sent') } catch (e) { fail(e) }
      setTimeout(() => close(true), 300)
    })),
  })
}

// ---------- Payment ----------
export async function paymentDialog(doc) {
  const r = await formModal(`Record payment — ${doc.number}`, html`<div class="form-grid">
    ${field('Amount ($)', 'amount', fromCents(doc.balance_cents), { type: 'number', required: true, attrs: 'step="0.01" min="0.01"' })}
    ${field('Date', 'paid_at', today(), { type: 'date', required: true })}
    ${select('Method', 'method', 'check', [['check', 'Check'], ['cash', 'Cash'], ['card', 'Card'], ['zelle', 'Zelle'], ['venmo', 'Venmo'], ['ach', 'ACH / bank transfer'], ['financing', 'Financing'], ['other', 'Other']])}
    ${field('Reference', 'reference', '', { placeholder: 'Check #, last 4, etc.' })}
    ${field('Note', 'note', '', { span: 2 })}
  </div>`, { submit: 'Record payment' })
  if (!r) return false
  try { await POST(`/invoices/${doc.id}/payments`, { ...r, amount_cents: toCents(r.amount) }); toast('Payment recorded'); return true } catch (e) { fail(e); return false }
}

// ---------- Payments list ----------
async function payments(el) {
  const rows = await GET('/payments')
  const month = today().slice(0, 7)
  el.innerHTML = html`
  <div class="page-head"><div><a class="crumb" href="#/invoices">← Invoices</a><h1>Payments</h1>
    <p class="sub">${money(rows.filter((p) => p.paid_at.startsWith(month)).reduce((a, p) => a + p.amount_cents, 0))} collected this month</p></div>
    ${isOwner() ? html`<a class="btn" href="/api/export/payments">${raw(icon('download', 15))} Export CSV</a>` : ''}</div>
  <div class="card table-wrap">${rows.length ? html`<table class="t"><thead><tr><th>Date</th><th>Customer</th><th>Invoice</th><th class="hide-sm">Method</th><th class="num">Amount</th></tr></thead>
    <tbody>${rows.map((p) => html`<tr class="click" data-href="#/invoices/${p.invoice_id}"><td>${fmtDate(p.paid_at)}</td><td>${p.customer_name}</td><td>${p.invoice_number}</td><td class="hide-sm">${p.method}${p.reference ? html`<small>${p.reference}</small>` : ''}</td><td class="num"><b>${money(p.amount_cents)}</b></td></tr>`)}</tbody></table>`
    : html`<div class="empty">No payments recorded yet.</div>`}</div>`
  el.querySelectorAll('tr[data-href]').forEach((tr) => (tr.onclick = () => (location.hash = tr.dataset.href)))
}
export { esc }
