import { GET, POST, PUT, DEL, html, raw, money, pill, fmtDate, fmtTime, field, select, formModal, confirmBox, toast, fail, debounce, SOURCES, CITIES, isOffice } from '../core.js'
import { icon } from '../icons.js'
import { timeline, bindTimeline, gallery, bindGallery, contactButtons } from '../components.js'

export default async function customers(el, params) {
  if (params.id) return customerDetail(el, params.id)
  let q = '', archived = false
  el.innerHTML = html`
  <div class="page-head"><div><h1>Customers</h1></div>
    <div class="btn-row">${isOffice() ? html`<button class="btn btn-primary" data-new>${raw(icon('plus'))} Add customer</button>` : ''}</div></div>
  <div class="toolbar"><input type="search" class="q" placeholder="Search name, phone, email, address, tag…" data-q>
    <label class="check"><input type="checkbox" data-arch> Show archived</label></div>
  <div class="card table-wrap" data-list><div class="loading"><span class="spinner"></span></div></div>`

  const load = async () => {
    const rows = await GET(`/customers?q=${encodeURIComponent(q)}&archived=${archived ? 1 : 0}`)
    el.querySelector('[data-list]').innerHTML = rows.length ? html`<table class="t"><thead><tr><th>Name</th><th>Phone</th><th class="hide-sm">Address</th><th class="hide-sm">Source</th><th class="num">Balance</th><th class="num hide-sm">Lifetime</th></tr></thead>
      <tbody>${rows.map((c) => html`<tr class="click" data-href="#/customers/${c.id}">
        <td><b>${c.display_name || '(no name)'}</b>${c.type === 'commercial' ? html` <span class="pill pill-purple">Commercial</span>` : ''}<small>${c.email}</small></td>
        <td class="nowrap">${c.phone}</td><td class="hide-sm">${c.address}<small>${c.city}</small></td><td class="hide-sm">${c.source}</td>
        <td class="num" style="${c.balance_cents > 0 ? 'color:var(--red);font-weight:700' : ''}">${c.balance_cents > 0 ? money(c.balance_cents) : '—'}</td>
        <td class="num hide-sm">${c.lifetime_cents ? money(c.lifetime_cents, { whole: true }) : '—'}</td></tr>`)}</tbody></table>`
      : html`<div class="empty"><h3>No customers found</h3><p>Add one, or import your Markate customer list in Settings → Import.</p></div>`
    el.querySelectorAll('tr[data-href]').forEach((tr) => (tr.onclick = () => (location.hash = tr.dataset.href)))
  }
  el.querySelector('[data-q]').oninput = debounce((e) => { q = e.target.value; load() }, 200)
  el.querySelector('[data-arch]').onchange = (e) => { archived = e.target.checked; load() }
  const nb = el.querySelector('[data-new]')
  if (nb) nb.onclick = async () => { const id = await customerForm(); if (id) location.hash = '#/customers/' + id }
  await load()
  if (params.query.new) { history.replaceState(null, '', '#/customers'); nb?.click() }
}

export async function customerForm(c = {}) {
  const r = await formModal(c.id ? 'Edit customer' : 'New customer', html`<div class="form-grid">
    ${select('Type', 'type', c.type || 'residential', [['residential', 'Residential'], ['commercial', 'Commercial']])}
    ${field('Company', 'company', c.company)}
    ${field('First name', 'first_name', c.first_name)}
    ${field('Last name', 'last_name', c.last_name)}
    ${field('Mobile phone', 'phone', c.phone, { type: 'tel' })}
    ${field('Other phone', 'alt_phone', c.alt_phone, { type: 'tel' })}
    ${field('Email', 'email', c.email, { type: 'email', span: 2 })}
    ${field('Street address', 'address', c.address, { span: 2 })}
    ${field('City', 'city', c.city, { attrs: 'list="cities"' })}
    <div class="form-grid" style="gap:12px">${field('State', 'state', c.state || 'VA')}${field('ZIP', 'zip', c.zip)}</div>
    ${select('Lead source', 'source', c.source || '', [['', '—'], ...SOURCES])}
    ${field('Tags', 'tags', c.tags, { placeholder: 'e.g. repeat, HOA, maintenance-plan' })}
    ${field('Notes', 'notes', c.notes, { type: 'textarea', span: 2, placeholder: 'Gate code, dogs, irrigation zones, etc.' })}
    <datalist id="cities">${CITIES.map((x) => html`<option value="${x}">`)}</datalist>
  </div>`, { wide: true, validate: (d) => (!d.first_name && !d.last_name && !d.company ? 'Enter a name or company' : null) })
  if (!r) return null
  try {
    if (c.id) { await PUT('/customers/' + c.id, r); toast('Saved'); return c.id }
    const { id } = await POST('/customers', r); toast('Customer added'); return id
  } catch (e) { fail(e); return null }
}

async function customerDetail(el, id) {
  const c = await GET('/customers/' + id)
  const addr = [c.address, c.city, c.state, c.zip].filter(Boolean).join(', ')
  const office = isOffice()
  el.innerHTML = html`
  <div class="page-head">
    <div><a class="crumb" href="#/customers">← Customers</a><h1>${c.display_name}</h1>
      <p class="sub">${c.type === 'commercial' ? 'Commercial · ' : ''}Customer since ${fmtDate(c.created_at, { year: true })}${c.source ? ' · ' + c.source : ''}${c.tags ? html` · ${c.tags.split(',').map((t) => html`<span class="tag" style="margin-left:4px">${t.trim()}</span>`)}` : ''}</p></div>
    <div class="btn-row">
      ${office ? html`<button class="btn" data-edit>${raw(icon('edit', 15))} Edit</button>
      <a class="btn" href="#/jobs?new=1&customer=${c.id}">${raw(icon('truck', 15))} New job</a>
      <a class="btn btn-primary" href="#/estimates?new=1&customer=${c.id}">${raw(icon('clipboard', 15))} New estimate</a>` : ''}
    </div>
  </div>
  ${office ? html`<div class="grid g4" style="margin-bottom:16px">
    <div class="card kpi"><div class="label">Balance due</div><div class="value" style="${c.balance_cents ? 'color:var(--red)' : ''}">${money(c.balance_cents)}</div></div>
    <div class="card kpi"><div class="label">Lifetime paid</div><div class="value">${money(c.lifetime_cents, { whole: true })}</div></div>
    <div class="card kpi"><div class="label">Jobs</div><div class="value">${c.jobs.length}</div></div>
    <div class="card kpi"><div class="label">Estimates</div><div class="value">${c.estimates.length}</div><div class="delta">${c.estimates.filter((e) => e.status === 'approved').length} approved</div></div>
  </div>` : ''}
  <div class="split">
    <div class="stack">
      ${office ? html`<div class="card"><div class="card-head"><h3>Estimates</h3><a class="small" href="#/estimates?new=1&customer=${c.id}">+ New</a></div>
        ${c.estimates.length ? html`<table class="t"><tbody>${c.estimates.map((e) => html`<tr class="click" data-href="#/estimates/${e.id}"><td><b>${e.number}</b><small>${e.title}</small></td><td>${fmtDate(e.issue_date)}</td><td>${pill(e.status)}</td><td class="num">${money(e.total_cents)}</td></tr>`)}</tbody></table>` : html`<div class="empty small">No estimates</div>`}</div>` : ''}
      <div class="card"><div class="card-head"><h3>Jobs</h3>${office ? html`<a class="small" href="#/jobs?new=1&customer=${c.id}">+ New</a>` : ''}</div>
        ${c.jobs.length ? html`<table class="t"><tbody>${c.jobs.map((j) => html`<tr class="click" data-href="#/jobs/${j.id}"><td><b>${j.number}</b><small>${j.title}</small></td><td>${j.scheduled_start ? fmtDate(j.scheduled_start) + ' ' + fmtTime(j.scheduled_start) : 'Not scheduled'}</td><td>${pill(j.status)}</td></tr>`)}</tbody></table>` : html`<div class="empty small">No jobs</div>`}</div>
      ${office ? html`<div class="card"><div class="card-head"><h3>Invoices</h3><a class="small" href="#/invoices?new=1&customer=${c.id}">+ New</a></div>
        ${c.invoices.length ? html`<table class="t"><tbody>${c.invoices.map((i) => html`<tr class="click" data-href="#/invoices/${i.id}"><td><b>${i.number}</b><small>${i.title}</small></td><td>${fmtDate(i.issue_date)}</td><td>${pill(i.display_status)}</td><td class="num">${money(i.total_cents)}<small>${i.balance_cents ? money(i.balance_cents) + ' due' : ''}</small></td></tr>`)}</tbody></table>` : html`<div class="empty small">No invoices</div>`}</div>` : ''}
      ${timeline(c.activity, { entity_type: 'customer', entity_id: c.id, customer_id: c.id })}
    </div>
    <div class="stack">
      <div class="card card-pad">
        ${contactButtons({ phone: c.phone, email: c.email, address: addr })}
        <div class="divider"></div>
        <dl class="kv">
          <dt>Phone</dt><dd>${c.phone || '—'}${c.alt_phone ? html`<br><small class="muted">${c.alt_phone}</small>` : ''}</dd>
          <dt>Email</dt><dd>${c.email || '—'}</dd>
          <dt>Address</dt><dd>${addr || '—'}</dd>
          ${c.company && c.type !== 'commercial' ? html`<dt>Company</dt><dd>${c.company}</dd>` : ''}
        </dl>
        ${c.notes ? html`<div class="divider"></div><p style="white-space:pre-wrap">${c.notes}</p>` : ''}
      </div>
      ${gallery(c.files, { entity_type: 'customer', entity_id: c.id })}
      ${office ? html`<div class="card card-pad btn-row">
        <button class="btn btn-sm" data-archive>${c.archived ? 'Unarchive' : 'Archive'}</button>
        <button class="btn btn-sm" style="color:var(--red)" data-del>${raw(icon('trash', 14))} Delete</button></div>` : ''}
    </div>
  </div>`

  const reload = () => customerDetail(el, id)
  bindTimeline(el, reload); bindGallery(el, reload)
  el.querySelectorAll('tr[data-href]').forEach((tr) => (tr.onclick = () => (location.hash = tr.dataset.href)))
  el.querySelector('[data-edit]')?.addEventListener('click', async () => { if (await customerForm(c)) reload() })
  el.querySelector('[data-archive]')?.addEventListener('click', async () => { await PUT('/customers/' + c.id, { archived: c.archived ? 0 : 1 }).catch(fail); reload() })
  el.querySelector('[data-del]')?.addEventListener('click', async () => {
    if (!(await confirmBox(`Permanently delete ${c.display_name} and ALL their estimates, jobs, invoices and payments? Archive instead if you just want to hide them.`, { ok: 'Delete everything', danger: true }))) return
    await DEL('/customers/' + c.id).catch(fail); location.hash = '#/customers'
  })
}
