import { GET, POST, PUT, DEL, html, raw, money, pill, ago, fmtDateTime, fmtDate, state, toCents, fromCents, field, select, formModal, confirmBox, toast, fail, SOURCES, CITIES, SERVICES, today, addDays, statusLabel } from '../core.js'
import { icon } from '../icons.js'
import { timeline, bindTimeline, contactButtons } from '../components.js'
import { refreshBadges } from '../app.js'

const COLS = ['new', 'contacted', 'appointment', 'estimated', 'won', 'lost']

export default async function leads(el, params) {
  if (params.id) return leadDetail(el, params.id)
  const rows = await GET('/leads')
  let mode = localStorage.getItem('leadsMode') || 'board'
  let q = ''

  const draw = () => {
    const f = rows.filter((l) => !q || `${l.name} ${l.phone} ${l.email} ${l.city} ${l.service}`.toLowerCase().includes(q))
    const recentCutoff = new Date(Date.now() - 45 * 864e5).toISOString()
    el.innerHTML = html`
    <div class="page-head"><div><h1>Leads</h1><p class="sub">${rows.filter((l) => l.status === 'new').length} new · drag cards to move them through your pipeline</p></div>
      <div class="btn-row"><button class="btn btn-primary" data-new>${raw(icon('plus'))} Add lead</button></div></div>
    <div class="toolbar">
      <div class="tabs"><button data-mode="board" class="${mode === 'board' ? 'on' : ''}">Board</button><button data-mode="list" class="${mode === 'list' ? 'on' : ''}">List</button></div>
      <input type="search" class="q" placeholder="Filter leads…" value="${q}" data-q>
    </div>
    ${mode === 'board' ? html`<div class="kanban">${COLS.map((s) => {
      // Hide old won/lost cards so the board stays useful.
      const cards = f.filter((l) => l.status === s && (!['won', 'lost'].includes(s) || l.updated_at >= recentCutoff.replace('T', ' ')))
      return html`<div class="kcol" data-col="${s}">
        <div class="kcol-head"><span>${statusLabel(s)}</span><small>${cards.length}${cards.reduce((a, l) => a + (l.value_cents || 0), 0) ? ' · ' + money(cards.reduce((a, l) => a + (l.value_cents || 0), 0), { whole: true }) : ''}</small></div>
        ${cards.map((l) => card(l))}
      </div>` })}</div>`
    : html`<div class="card table-wrap"><table class="t"><thead><tr><th>Name</th><th>Service</th><th class="hide-sm">Source</th><th class="hide-sm">City</th><th>Status</th><th class="num">Value</th><th class="hide-sm">Received</th></tr></thead>
      <tbody>${f.map((l) => html`<tr class="click" data-href="#/leads/${l.id}"><td><b>${l.name}</b><small>${l.phone}</small></td><td>${l.service}</td><td class="hide-sm">${l.source}</td><td class="hide-sm">${l.city}</td><td>${pill(l.status)}</td><td class="num">${l.value_cents ? money(l.value_cents, { whole: true }) : ''}</td><td class="hide-sm">${ago(l.created_at)}</td></tr>`)}</tbody></table>
      ${f.length ? '' : html`<div class="empty">No leads yet.</div>`}</div>`}`
    bind()
  }

  const bind = () => {
    el.querySelector('[data-new]').onclick = () => editLead()
    el.querySelectorAll('[data-mode]').forEach((b) => (b.onclick = () => { mode = b.dataset.mode; localStorage.setItem('leadsMode', mode); draw() }))
    const qi = el.querySelector('[data-q]')
    qi.oninput = () => { q = qi.value.toLowerCase(); const pos = qi.selectionStart; draw(); const n = el.querySelector('[data-q]'); n.focus(); n.setSelectionRange(pos, pos) }
    el.querySelectorAll('tr[data-href]').forEach((tr) => (tr.onclick = () => (location.hash = tr.dataset.href)))
    // Drag & drop between columns
    el.querySelectorAll('.kcard').forEach((c) => {
      c.addEventListener('dragstart', (e) => { e.dataTransfer.setData('text/plain', c.dataset.id); c.classList.add('dragging') })
      c.addEventListener('dragend', () => c.classList.remove('dragging'))
    })
    el.querySelectorAll('.kcol').forEach((col) => {
      col.addEventListener('dragover', (e) => { e.preventDefault(); col.classList.add('over') })
      col.addEventListener('dragleave', () => col.classList.remove('over'))
      col.addEventListener('drop', async (e) => {
        e.preventDefault(); col.classList.remove('over')
        const id = Number(e.dataTransfer.getData('text/plain'))
        const lead = rows.find((l) => l.id === id)
        if (!lead || lead.status === col.dataset.col) return
        const patch = { status: col.dataset.col }
        if (patch.status === 'lost') {
          const r = await formModal('Why was this lead lost?', field('Reason', 'lost_reason', '', { placeholder: 'Price, went with another company, no response…' }), { submit: 'Mark lost' })
          if (!r) return
          patch.lost_reason = r.lost_reason
        }
        try { await PUT('/leads/' + id, patch); Object.assign(lead, patch, { updated_at: new Date().toISOString().replace('T', ' ') }); draw(); refreshBadges() } catch (err) { fail(err) }
      })
    })
  }

  const editLead = async () => {
    const id = await leadForm()
    if (id) location.hash = '#/leads/' + id
  }

  draw()
  if (params.query.new) { history.replaceState(null, '', '#/leads'); editLead() }
}

function card(l) {
  const stale = l.status === 'new' && Date.now() - new Date(l.created_at.replace(' ', 'T') + 'Z') > (Number(state.settings.lead_response_hours) || 24) * 3600e3
  const assignee = state.users.find((u) => u.id === l.assigned_to)
  return html`<a class="kcard" draggable="true" data-id="${l.id}" href="#/leads/${l.id}">
    <b>${l.name}</b><small>${l.service || 'General inquiry'}</small><small>${[l.city, l.source].filter(Boolean).join(' · ')}</small>
    ${l.appointment_at && l.status === 'appointment' ? html`<small style="color:var(--amber);font-weight:700">📅 ${fmtDateTime(l.appointment_at)}</small>` : ''}
    <div class="meta"><span class="${stale ? 'stale' : 'muted'}">${stale ? '⚠ ' : ''}${ago(l.created_at)}</span>
      <span>${l.value_cents ? money(l.value_cents, { whole: true }) : ''} ${assignee ? html`<span class="avatar sm" style="background:${assignee.color}" title="${assignee.name}">${assignee.name[0]}</span>` : ''}</span></div>
  </a>`
}

export async function leadForm(l = {}) {
  const users = state.users.filter((u) => u.active && u.role !== 'tech')
  const r = await formModal(l.id ? 'Edit lead' : 'New lead', html`<div class="form-grid">
    ${field('Name', 'name', l.name, { required: true })}
    ${field('Phone', 'phone', l.phone, { type: 'tel' })}
    ${field('Email', 'email', l.email, { type: 'email' })}
    ${select('Source', 'source', l.source || 'Website', SOURCES)}
    ${field('Street address', 'address', l.address, { span: 2 })}
    ${field('City', 'city', l.city, { attrs: 'list="cities"' })}
    ${field('ZIP', 'zip', l.zip)}
    ${select('Service', 'service', l.service || '', [['', '—'], ...SERVICES])}
    ${field('Estimated value ($)', 'value', l.value_cents ? fromCents(l.value_cents) : '', { type: 'number', attrs: 'step="1" min="0"' })}
    ${select('Status', 'status', l.status || 'new', COLS.map((s) => [s, statusLabel(s)]))}
    ${select('Assigned to', 'assigned_to', l.assigned_to || '', [['', 'Unassigned'], ...users.map((u) => [u.id, u.name])])}
    ${field('Estimate appointment', 'appointment_at', l.appointment_at, { type: 'datetime-local' })}
    ${field('Next follow-up', 'next_follow_up', l.next_follow_up, { type: 'date' })}
    ${field('What do they need?', 'message', l.message, { type: 'textarea', span: 2 })}
    <datalist id="cities">${CITIES.map((c) => html`<option value="${c}">`)}</datalist>
  </div>`, { wide: true, validate: (d) => (!d.phone && !d.email ? 'Add a phone number or email' : null) })
  if (!r) return null
  const body = { ...r, value_cents: toCents(r.value || 0), assigned_to: r.assigned_to ? Number(r.assigned_to) : null }
  if (body.appointment_at && body.status === 'new') body.status = 'appointment'
  delete body.value
  try {
    if (l.id) { await PUT('/leads/' + l.id, body); toast('Lead saved'); return l.id }
    const { id } = await POST('/leads', body); toast('Lead added'); refreshBadges(); return id
  } catch (e) { fail(e); return null }
}

async function leadDetail(el, id) {
  const l = await GET('/leads/' + id)
  const meta = (() => { try { return JSON.parse(l.meta || '{}') } catch { return {} } })()
  const assignee = state.users.find((u) => u.id === l.assigned_to)
  const fullAddr = [l.address, l.city, l.state, l.zip].filter(Boolean).join(', ')
  el.innerHTML = html`
  <div class="page-head">
    <div><a class="crumb" href="#/leads">← Leads</a><h1>${l.name}</h1><p class="sub">${l.service || 'General inquiry'} · ${l.source} · received ${fmtDateTime(l.created_at)}</p></div>
    <div class="btn-row">
      ${pill(l.status)}
      <button class="btn" data-edit>${raw(icon('edit', 15))} Edit</button>
      ${l.customer_id ? html`<a class="btn" href="#/customers/${l.customer_id}">${raw(icon('users', 15))} View customer</a>` : ''}
      <button class="btn btn-primary" data-estimate>${raw(icon('clipboard', 15))} Create estimate</button>
    </div>
  </div>
  <div class="split">
    <div class="stack">
      <div class="card card-pad">
        ${contactButtons({ phone: l.phone, email: l.email, address: fullAddr })}
        <div class="divider"></div>
        <dl class="kv">
          <dt>Phone</dt><dd>${l.phone || '—'}</dd><dt>Email</dt><dd>${l.email || '—'}</dd><dt>Address</dt><dd>${fullAddr || '—'}</dd>
          <dt>Value</dt><dd>${l.value_cents ? money(l.value_cents) : '—'}</dd>
          <dt>Assigned</dt><dd>${assignee?.name || 'Unassigned'}</dd>
          <dt>Appointment</dt><dd>${l.appointment_at ? fmtDateTime(l.appointment_at) : '—'}</dd>
          <dt>Follow-up</dt><dd>${l.next_follow_up ? fmtDate(l.next_follow_up) : '—'}</dd>
          ${l.lost_reason ? html`<dt>Lost reason</dt><dd>${l.lost_reason}</dd>` : ''}
          ${meta.page ? html`<dt>Form page</dt><dd><small>${meta.page}</small></dd>` : ''}
          ${meta.utm_campaign ? html`<dt>Campaign</dt><dd>${meta.utm_source} / ${meta.utm_medium} / ${meta.utm_campaign}</dd>` : ''}
        </dl>
        ${l.message ? html`<div class="divider"></div><p style="white-space:pre-wrap">${l.message}</p>` : ''}
      </div>
      ${timeline(l.activity, { entity_type: 'lead', entity_id: l.id, customer_id: l.customer_id })}
    </div>
    <div class="stack">
      <div class="card card-pad">
        <h3 style="margin-bottom:10px">Move to</h3>
        <div class="btn-row">${COLS.filter((s) => s !== l.status).map((s) => html`<button class="btn btn-sm" data-status="${s}">${statusLabel(s)}</button>`)}</div>
        <div class="divider"></div>
        <h3 style="margin-bottom:10px">Quick follow-up</h3>
        <div class="btn-row">${[[1, 'Tomorrow'], [3, '3 days'], [7, '1 week']].map(([n, lbl]) => html`<button class="btn btn-sm" data-follow="${n}">${lbl}</button>`)}</div>
      </div>
      ${l.estimates.length ? html`<div class="card"><div class="card-head"><h3>Estimates</h3></div>${l.estimates.map((e) => html`<a class="action" href="#/estimates/${e.id}"><div class="txt"><b>${e.number} · ${e.title}</b><small>${money(e.total_cents)}</small></div>${pill(e.status)}</a>`)}</div>` : ''}
      <div class="card card-pad"><button class="btn btn-sm" style="color:var(--red)" data-del>${raw(icon('trash', 14))} Delete lead</button></div>
    </div>
  </div>`

  const reload = () => leadDetail(el, id)
  bindTimeline(el, reload)
  el.querySelector('[data-edit]').onclick = async () => { if (await leadForm(l)) reload() }
  el.querySelectorAll('[data-status]').forEach((b) => (b.onclick = async () => {
    const patch = { status: b.dataset.status }
    if (patch.status === 'lost') {
      const r = await formModal('Why was this lead lost?', field('Reason', 'lost_reason', ''), { submit: 'Mark lost' }); if (!r) return
      patch.lost_reason = r.lost_reason
    }
    await PUT('/leads/' + l.id, patch).catch(fail); refreshBadges(); reload()
  }))
  el.querySelectorAll('[data-follow]').forEach((b) => (b.onclick = async () => {
    const date = addDays(today(), Number(b.dataset.follow))
    await PUT('/leads/' + l.id, { next_follow_up: date, status: l.status === 'new' ? 'contacted' : l.status }).catch(fail); toast('Follow-up set for ' + fmtDate(date)); reload()
  }))
  el.querySelector('[data-estimate]').onclick = async () => {
    try { const r = await POST(`/leads/${l.id}/convert`, { create_estimate: true }); location.hash = '#/estimates/' + r.estimate_id } catch (e) { fail(e) }
  }
  el.querySelector('[data-del]').onclick = async () => {
    if (!(await confirmBox(`Delete lead ${l.name}?`, { ok: 'Delete', danger: true }))) return
    await DEL('/leads/' + l.id); refreshBadges(); location.hash = '#/leads'
  }
}
