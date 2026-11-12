import { GET, POST, PUT, DEL, html, raw, money, pill, fmtDate, fmtTime, fmtDateTime, field, select, formModal, confirmBox, toast, fail, state, isOffice,
  customerPicker, bindCustomerPicker, mapHref, smsHref, telHref, userById, CITIES } from '../core.js'
import { icon } from '../icons.js'
import { timeline, bindTimeline, gallery, bindGallery, contactButtons } from '../components.js'

const TABS = [['active', 'Active'], ['unscheduled', 'Unscheduled'], ['scheduled', 'Scheduled'], ['in_progress', 'In progress'], ['completed', 'Completed'], ['cancelled', 'Cancelled'], ['', 'All']]
const PIPES = ['4" smooth-wall SDR-35', '4" corrugated (perforated)', '4" Schedule 40 PVC', '6" smooth-wall SDR-35', '6" corrugated', '3" Schedule 40 PVC', 'Other']
const DISCHARGE = ['Pop-up emitter', 'Daylight / open outlet', 'Curb outlet', 'Roadside ditch', 'Storm drain tie-in', 'Dry well', 'Sump pump', 'Other']

export default async function jobs(el, params) {
  if (params.id) return jobDetail(el, params.id)
  if (params.query.new) {
    history.replaceState(null, '', '#/jobs')
    const id = await jobForm({ customer_id: params.query.customer })
    if (id) { location.hash = '#/jobs/' + id; return }
  }
  const rows = await GET('/jobs')
  let tab = 'active', q = ''
  const match = (j, t) => !t || (t === 'active' ? ['unscheduled', 'scheduled', 'in_progress'].includes(j.status) : j.status === t)
  const draw = () => {
    const f = rows.filter((j) => match(j, tab) && (!q || `${j.number} ${j.customer_name} ${j.title} ${j.address} ${j.city}`.toLowerCase().includes(q)))
    el.innerHTML = html`
    <div class="page-head"><div><h1>${isOffice() ? 'Jobs' : 'My jobs'}</h1></div>
      <div class="btn-row"><a class="btn" href="#/schedule">${raw(icon('calendar', 15))} Schedule</a>${isOffice() ? html`<button class="btn btn-primary" data-new>${raw(icon('plus'))} New job</button>` : ''}</div></div>
    <div class="toolbar"><div class="tabs">${TABS.map(([v, l]) => html`<button data-t="${v}" class="${tab === v ? 'on' : ''}">${l}<span class="count">${rows.filter((j) => match(j, v)).length}</span></button>`)}</div>
      <input type="search" class="q" placeholder="Search jobs…" value="${q}" data-q></div>
    <div class="card table-wrap">${f.length ? html`<table class="t"><thead><tr><th>Job</th><th>Customer</th><th class="hide-sm">Location</th><th>When</th><th class="hide-sm">Crew</th><th>Status</th></tr></thead>
      <tbody>${f.map((j) => html`<tr class="click" data-href="#/jobs/${j.id}"><td><b>${j.number}</b><small>${j.title}</small></td><td>${j.customer_name}</td>
        <td class="hide-sm">${j.address}<small>${j.city}</small></td>
        <td class="nowrap">${j.scheduled_start ? html`${fmtDate(j.scheduled_start)}<small>${fmtTime(j.scheduled_start)}</small>` : html`<span class="muted">—</span>`}</td>
        <td class="hide-sm">${j.crew.map((id) => { const u = userById(id); return u ? html`<span class="avatar sm" style="background:${u.color};margin-right:2px" title="${u.name}">${u.name[0]}</span>` : '' })}</td>
        <td>${pill(j.status)}${j.status === 'completed' && !j.invoice_count && isOffice() ? html`<small style="color:var(--red);font-weight:700">Not invoiced</small>` : ''}</td></tr>`)}</tbody></table>`
      : html`<div class="empty">No jobs here.</div>`}</div>`
    el.querySelector('[data-new]')?.addEventListener('click', async () => { const id = await jobForm(); if (id) location.hash = '#/jobs/' + id })
    el.querySelectorAll('[data-t]').forEach((b) => (b.onclick = () => { tab = b.dataset.t; draw() }))
    const qi = el.querySelector('[data-q]')
    qi.oninput = () => { q = qi.value.toLowerCase(); draw(); const n = el.querySelector('[data-q]'); n.focus(); n.setSelectionRange(q.length, q.length) }
    el.querySelectorAll('tr[data-href]').forEach((tr) => (tr.onclick = () => (location.hash = tr.dataset.href)))
  }
  draw()
}

const crewChecks = (crew = []) => html`<div class="field span-2"><span>Crew</span><div class="btn-row">${state.users.filter((u) => u.active).map((u) => html`
  <label class="check" style="border:1px solid var(--border);border-radius:8px;padding:6px 10px"><input type="checkbox" name="crew_${u.id}" ${crew.includes(u.id) ? raw('checked') : ''}>
  <span class="avatar sm" style="background:${u.color}">${u.name[0]}</span>${u.name}</label>`)}</div></div>`
const readCrew = (d) => state.users.filter((u) => d['crew_' + u.id]).map((u) => u.id)

export async function jobForm(j = {}) {
  let cust = null
  if (j.customer_id && !j.id) cust = await GET('/customers/' + j.customer_id).catch(() => null)
  const r = await formModal(j.id ? `Edit job ${j.number}` : 'New job', html`<div class="form-grid">
    ${!j.id ? customerPicker(cust?.id || '', cust?.display_name || '') : ''}
    ${field('Title', 'title', j.title, { span: 2, placeholder: 'e.g. French drain — backyard' })}
    ${field('Address', 'address', j.address ?? cust?.address ?? '')}
    ${field('City', 'city', j.city ?? cust?.city ?? '', { attrs: 'list="cities"' })}
    ${field('Start', 'scheduled_start', j.scheduled_start || '', { type: 'datetime-local', help: 'Leave empty to keep it unscheduled' })}
    ${select('Duration', 'duration_min', j.duration_min || 480, [[120, '2 hours'], [240, 'Half day (4h)'], [360, '6 hours'], [480, 'Full day (8h)'], [600, '10 hours'], [960, '2 days'], [1440, '3 days']])}
    ${crewChecks(j.crew || [])}
    ${select('Priority', 'priority', j.priority || 'normal', [['low', 'Low'], ['normal', 'Normal'], ['high', 'High'], ['urgent', 'Urgent']])}
    ${field('Scope / instructions for crew', 'description', j.description, { type: 'textarea', span: 2 })}
    <datalist id="cities">${CITIES.map((c) => html`<option value="${c}">`)}</datalist>
  </div>`, {
    wide: true,
    onOpen: (form) => bindCustomerPicker(form, { onPick: async (id) => {
      const c = await GET('/customers/' + id); if (!form.address.value) form.address.value = c.address; if (!form.city.value) form.city.value = c.city
    } }),
    validate: (d) => (!j.id && !d.customer_id ? 'Pick a customer from the list' : null),
  })
  if (!r) return null
  const body = { title: r.title, address: r.address, city: r.city, scheduled_start: r.scheduled_start, duration_min: Number(r.duration_min), crew: readCrew(r), priority: r.priority, description: r.description }
  try {
    if (j.id) { await PUT('/jobs/' + j.id, body); toast('Job saved'); return j.id }
    const { id } = await POST('/jobs', { ...body, customer_id: Number(r.customer_id) }); toast('Job created'); return id
  } catch (e) { fail(e); return null }
}

async function jobDetail(el, id) {
  const j = await GET('/jobs/' + id)
  const office = isOffice()
  const s = j.specs || {}
  const fullAddr = [j.address, j.city].filter(Boolean).join(', ')
  const done = j.checklist.filter((c) => c.done).length
  const reviewMsg = `Hi ${j.customer_first || ''}, thank you for choosing ${state.settings.company_name}! If you're happy with the work, would you mind leaving us a quick Google review? It really helps a small, veteran-owned business: ${state.settings.review_url}`
  const end = j.scheduled_start ? new Date(new Date(j.scheduled_start).getTime() + j.duration_min * 60e3) : null

  el.innerHTML = html`
  <div class="page-head">
    <div><a class="crumb" href="#/jobs">← Jobs</a><h1>${j.title || 'Job'} ${pill(j.status)}</h1>
      <p class="sub">${j.number} · <a href="#/customers/${j.customer_id}">${j.customer_name}</a>${j.estimate ? html` · <a href="#/estimates/${j.estimate.id}">Estimate ${j.estimate.number}</a>${office ? ` (${money(j.estimate.total_cents)})` : ''}` : ''}${j.priority !== 'normal' ? html` · <b style="color:${['high', 'urgent'].includes(j.priority) ? 'var(--red)' : 'var(--muted)'}">${j.priority} priority</b>` : ''}</p></div>
    <div class="btn-row">
      ${office ? html`<button class="btn" data-edit>${raw(icon('edit', 15))} Edit</button>` : ''}
      ${['unscheduled', 'scheduled'].includes(j.status) ? html`<button class="btn btn-primary" data-status="in_progress">${raw(icon('play', 15))} Start job</button>` : ''}
      ${j.status === 'in_progress' ? html`<button class="btn btn-green" data-status="completed">${raw(icon('done', 15))} Complete job</button>` : ''}
      ${j.status === 'completed' && office && !j.invoices.length ? html`<button class="btn btn-green" data-invoice>${raw(icon('receipt', 15))} Create invoice</button>` : ''}
    </div>
  </div>

  ${j.status === 'completed' && !j.review_requested_at ? html`<div class="card card-pad" style="margin-bottom:16px;display:flex;gap:12px;align-items:center;flex-wrap:wrap;background:#fffaf0;border-color:#f6e2b3">
    <span style="font-size:22px">⭐</span><div style="flex:1;min-width:200px"><b>Job done — ask for a Google review while it's fresh.</b><br><small class="muted">Reviews are your best lead source. One tap sends a friendly text.</small></div>
    ${j.customer_phone ? html`<a class="btn btn-primary" data-review="text" href="${smsHref(j.customer_phone, reviewMsg)}">${raw(icon('sms', 15))} Text review link</a>` : ''}
    ${j.customer_email ? html`<a class="btn" data-review="email" href="mailto:${j.customer_email}?subject=${encodeURIComponent('Thank you from ' + state.settings.company_name)}&body=${encodeURIComponent(reviewMsg)}">${raw(icon('mail', 15))} Email</a>` : ''}
  </div>` : ''}

  <div class="split">
    <div class="stack">
      <div class="card card-pad">
        ${contactButtons({ phone: j.customer_phone, email: j.customer_email, address: fullAddr })}
        <div class="divider"></div>
        <dl class="kv">
          <dt>Address</dt><dd>${fullAddr || '—'}</dd>
          <dt>When</dt><dd>${j.scheduled_start ? html`${fmtDateTime(j.scheduled_start)} → ${end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}${j.duration_min > 600 ? ` (${Math.round(j.duration_min / 480)} days)` : ''}` : html`<span class="muted">Not scheduled</span> ${office ? html`<a href="#/schedule">→ schedule it</a>` : ''}`}</dd>
          <dt>Crew</dt><dd>${j.crew.length ? j.crew.map((uid) => { const u = userById(uid); return u ? html`<span style="display:inline-flex;gap:5px;align-items:center;margin-right:10px"><span class="avatar sm" style="background:${u.color}">${u.name[0]}</span>${u.name}</span>` : '' }) : html`<span class="muted">Unassigned</span>`}</dd>
          ${j.started_at ? html`<dt>Started</dt><dd>${fmtDateTime(j.started_at)}</dd>` : ''}
          ${j.completed_at ? html`<dt>Completed</dt><dd>${fmtDateTime(j.completed_at)}</dd>` : ''}
        </dl>
        ${j.description ? html`<div class="divider"></div><h3 style="margin-bottom:6px">Scope</h3><p style="white-space:pre-wrap">${j.description}</p>` : ''}
      </div>

      <div class="card">
        <div class="card-head"><h3>${raw(icon('drop'))} Drainage specs</h3><small class="muted">Saved automatically</small></div>
        <form class="card-body form-grid g3" data-specs>
          ${field('Problem area', 'problem', s.problem, { span: 3, placeholder: 'e.g. Standing water along back fence; downspouts dump at foundation' })}
          ${field('Linear feet', 'linear_ft', s.linear_ft, { type: 'number' })}
          ${select('Pipe', 'pipe', s.pipe || '', [['', '—'], ...PIPES])}
          ${field('Trench depth (in)', 'depth_in', s.depth_in, { type: 'number' })}
          ${select('Discharge', 'discharge', s.discharge || '', [['', '—'], ...DISCHARGE])}
          ${field('Catch basins', 'catch_basins', s.catch_basins, { type: 'number' })}
          ${field('Downspouts tied in', 'downspouts', s.downspouts, { type: 'number' })}
          ${field('Soil / conditions', 'soil', s.soil, { placeholder: 'Clay, high water table, roots…' })}
          ${field('Sod / restoration', 'restoration', s.restoration, { placeholder: 'Zoysia 300 sq ft' })}
          ${field('Equipment', 'equipment', s.equipment, { placeholder: 'Mini-ex, trencher, dump trailer' })}
          <div class="span-3" style="background:var(--amber-soft);border-radius:10px;padding:12px">
            <b style="display:block;margin-bottom:8px">Miss Utility (VA811 / NC811)</b>
            <div class="form-grid g3">${field('Ticket #', 'ticket_number', s.ticket_number)}${field('Called in', 'ticket_date', s.ticket_date, { type: 'date' })}${field('Ticket expires', 'ticket_expires', s.ticket_expires, { type: 'date' })}</div>
          </div>
        </form>
      </div>

      ${gallery(j.files, { entity_type: 'job', entity_id: j.id, title: 'Job photos' })}
      ${timeline(j.activity, { entity_type: 'job', entity_id: j.id, customer_id: j.customer_id })}
    </div>

    <div class="stack">
      <div class="card">
        <div class="card-head"><h3>${raw(icon('check'))} Checklist</h3><small class="muted">${done}/${j.checklist.length}</small></div>
        <div class="card-body">
          <ul class="checklist" data-checklist>${j.checklist.map((c, i) => html`<li class="${c.done ? 'done' : ''}"><input type="checkbox" data-ci="${i}" ${c.done ? raw('checked') : ''}><span style="flex:1">${c.text}</span><button class="icon-btn" style="width:24px;height:24px" data-crm="${i}" title="Remove">✕</button></li>`)}</ul>
          <form data-cadd style="display:flex;gap:6px;margin-top:8px"><input class="inp" name="t" placeholder="Add checklist item"><button class="btn btn-sm">Add</button></form>
        </div>
      </div>
      ${office ? html`<div class="card"><div class="card-head"><h3>Invoices</h3>${!j.invoices.length ? html`<button class="btn btn-sm" data-invoice>+ Create</button>` : ''}</div>
        ${j.invoices.length ? j.invoices.map((i) => html`<a class="action" href="#/invoices/${i.id}"><div class="txt"><b>${i.number}</b><small>${money(i.total_cents)}${i.balance_cents ? ` · ${money(i.balance_cents)} due` : ''}</small></div>${pill(i.display_status)}</a>`) : html`<div class="empty small">Not invoiced yet</div>`}</div>` : ''}
      <div class="card card-pad">
        <h3 style="margin-bottom:10px">Status</h3>
        <div class="btn-row">${['scheduled', 'in_progress', 'completed', 'cancelled'].filter((x) => x !== j.status).map((x) => html`<button class="btn btn-sm" data-status="${x}">${{ scheduled: 'Scheduled', in_progress: 'In progress', completed: 'Completed', cancelled: 'Cancel job' }[x]}</button>`)}</div>
        ${j.review_requested_at ? html`<p class="small muted" style="margin-top:10px">⭐ Review requested ${fmtDate(j.review_requested_at)}</p>` : ''}
        ${office ? html`<div class="divider"></div><button class="btn btn-sm" style="color:var(--red)" data-del>${raw(icon('trash', 14))} Delete job</button>` : ''}
      </div>
    </div>
  </div>`

  const reload = () => jobDetail(el, id)
  bindTimeline(el, reload); bindGallery(el, reload)
  el.querySelector('[data-edit]')?.addEventListener('click', async () => { if (await jobForm(j)) reload() })
  el.querySelectorAll('[data-status]').forEach((b) => (b.onclick = async () => {
    const st = b.dataset.status
    if (st === 'scheduled' && !j.scheduled_start) return toast('Set a start time first (Edit)', 'err')
    if (st === 'completed') {
      const open = j.checklist.filter((c) => !c.done).length
      if (open && !(await confirmBox(`${open} checklist item${open > 1 ? 's are' : ' is'} still unchecked. Complete the job anyway?`, { ok: 'Complete job' }))) return
    }
    if (st === 'cancelled' && !(await confirmBox('Cancel this job?', { ok: 'Cancel job', danger: true }))) return
    try { await PUT('/jobs/' + j.id, { status: st }); toast(st === 'completed' ? 'Job completed 🎉' : 'Updated'); reload() } catch (e) { fail(e) }
  }))
  el.querySelectorAll('[data-invoice]').forEach((b) => (b.onclick = async () => {
    try { const r = await POST(`/jobs/${j.id}/invoice`); toast('Invoice created'); location.hash = '#/invoices/' + r.id } catch (e) { fail(e) }
  }))
  el.querySelectorAll('[data-review]').forEach((a) => a.addEventListener('click', () => setTimeout(async () => { await POST(`/jobs/${j.id}/review-requested`, { via: a.dataset.review }).catch(() => {}); reload() }, 400)))
  el.querySelector('[data-del]')?.addEventListener('click', async () => {
    if (!(await confirmBox(`Delete job ${j.number}?`, { ok: 'Delete', danger: true }))) return
    await DEL('/jobs/' + j.id).catch(fail); location.hash = '#/jobs'
  })

  // Specs autosave
  const specsForm = el.querySelector('[data-specs]')
  let t
  specsForm.addEventListener('input', () => {
    clearTimeout(t)
    t = setTimeout(async () => {
      const specs = {}
      for (const i of specsForm.elements) if (i.name) specs[i.name] = i.value
      try { await PUT('/jobs/' + j.id, { specs }); toast('Specs saved') } catch (e) { fail(e) }
    }, 700)
  })

  // Checklist
  const saveChecklist = async () => { try { await PUT('/jobs/' + j.id, { checklist: j.checklist }) } catch (e) { fail(e) } reload() }
  el.querySelectorAll('[data-ci]').forEach((c) => (c.onchange = () => { j.checklist[Number(c.dataset.ci)].done = c.checked; saveChecklist() }))
  el.querySelectorAll('[data-crm]').forEach((b) => (b.onclick = () => { j.checklist.splice(Number(b.dataset.crm), 1); saveChecklist() }))
  el.querySelector('[data-cadd]').onsubmit = (e) => { e.preventDefault(); const v = e.target.t.value.trim(); if (!v) return; j.checklist.push({ text: v, done: false }); saveChecklist() }
}
export { telHref, mapHref }
