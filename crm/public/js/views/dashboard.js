import { GET, today as todayStr, addDays, html, raw, money, pill, fmtTime, ago, state, isOffice, telHref, mapHref, userById, statusLabel } from '../core.js'
import { icon } from '../icons.js'

const PIPE_COLORS = { new: '#1c6fd6', contacted: '#7c3aed', appointment: '#c27803', estimated: '#0f8a8a', won: '#189653', lost: '#a8b3bf' }

export default async function dashboard(el) {
  if (!isOffice()) return techHome(el)
  const d = await GET('/dashboard')
  const k = d.kpis
  const delta = k.collected_last_month ? Math.round(((k.collected_month - k.collected_last_month) / k.collected_last_month) * 100) : null
  const max = Math.max(1, ...d.months.flatMap((m) => [m.collected, m.invoiced]))
  const hour = new Date().getHours()
  const pipeTotal = d.pipeline.filter((p) => !['won', 'lost'].includes(p.status)).reduce((a, p) => a + p.n, 0)

  el.innerHTML = html`
  <div class="page-head">
    <div><h1>Good ${hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'}, ${state.user.name.split(' ')[0]}</h1>
    <p class="sub">${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p></div>
  </div>

  <div class="grid g4" style="margin-bottom:16px">
    <a class="card kpi" href="#/payments"><div class="label">Collected this month</div><div class="value">${money(k.collected_month, { whole: true })}</div>
      <div class="delta ${delta > 0 ? 'up' : delta < 0 ? 'down' : ''}">${delta === null ? 'vs. last month' : `${delta > 0 ? '▲' : '▼'} ${Math.abs(delta)}% vs. last month`}</div></a>
    <a class="card kpi" href="#/invoices?status=open"><div class="label">Outstanding A/R</div><div class="value">${money(k.outstanding, { whole: true })}</div>
      <div class="delta ${k.overdue ? 'down' : ''}">${k.overdue ? `${money(k.overdue, { whole: true })} overdue` : 'Nothing overdue'}</div></a>
    <a class="card kpi" href="#/estimates?status=open"><div class="label">Open estimates</div><div class="value">${money(k.open_estimates, { whole: true })}</div>
      <div class="delta">${k.open_estimates_count} awaiting a decision</div></a>
    <a class="card kpi" href="#/jobs"><div class="label">Booked backlog</div><div class="value">${money(k.backlog, { whole: true })}</div>
      <div class="delta">${k.jobs_week} job${k.jobs_week === 1 ? '' : 's'} on the schedule this week</div></a>
  </div>

  <div class="split">
    <div class="stack">
      <div class="card">
        <div class="card-head"><h3>${raw(icon('alert'))} Action center</h3><small class="muted">${d.actions.length} item${d.actions.length === 1 ? '' : 's'}</small></div>
        ${d.actions.length ? html`<div>${d.actions.slice(0, 15).map((a) => html`
          <a class="action" href="${a.link}"><span class="dot ${a.severity}"></span>
            <div class="txt"><b>${a.text}</b><small>${a.sub}</small></div>
            ${a.phone ? html`<span class="btn btn-sm" data-tel="${a.phone}">${raw(icon('phone', 14))}</span>` : ''}
            ${raw(icon('chevR', 16))}</a>`)}</div>`
        : html`<div class="empty">🎉 You're all caught up.</div>`}
      </div>

      <div class="card">
        <div class="card-head"><h3>Revenue — last 6 months</h3>
          <div class="legend"><span><i style="background:var(--blue)"></i>Collected</span><span><i style="background:#b9d3f3"></i>Invoiced</span></div></div>
        <div class="card-body"><div class="bars">${d.months.map((m) => html`
          <div class="bar" title="${m.month}: collected ${money(m.collected)}, invoiced ${money(m.invoiced)}">
            <div class="pair"><div class="b" style="height:${(m.collected / max) * 100}%"></div><div class="b b2" style="height:${(m.invoiced / max) * 100}%"></div></div>
            <small>${new Date(m.month + '-15').toLocaleDateString('en-US', { month: 'short' })}</small>
            <small style="font-weight:700;color:var(--ink)">${money(m.collected, { whole: true })}</small>
          </div>`)}</div></div>
      </div>
    </div>

    <div class="stack">
      <div class="card">
        <div class="card-head"><h3>${raw(icon('truck'))} Today's jobs</h3><a href="#/schedule" class="small">Schedule →</a></div>
        ${d.jobsToday.length ? html`<div>${d.jobsToday.map((j) => html`
          <a class="action" href="#/jobs/${j.id}">
            <div class="txt"><b>${fmtTime(j.scheduled_start)} · ${j.customer_name}</b><small>${j.title} — ${j.address}${j.city ? ', ' + j.city : ''}</small>
              <div style="margin-top:4px;display:flex;gap:4px;align-items:center">${pill(j.status)} ${j.crew.map((id) => { const u = userById(id); return u ? html`<span class="avatar sm" style="background:${u.color}" title="${u.name}">${u.name[0]}</span>` : '' })}</div></div>
          </a>`)}</div>` : html`<div class="empty small">No jobs scheduled today.</div>`}
      </div>

      <div class="card">
        <div class="card-head"><h3>${raw(icon('inbox'))} Lead pipeline</h3><a href="#/leads" class="small">Board →</a></div>
        <div class="card-body">
          <div class="pipe" style="margin-bottom:12px">${d.pipeline.filter((p) => !['won', 'lost'].includes(p.status)).map((p) => html`<div style="width:${(p.n / Math.max(1, pipeTotal)) * 100}%;background:${PIPE_COLORS[p.status]}" title="${statusLabel(p.status)}: ${p.n}"></div>`)}</div>
          ${['new', 'contacted', 'appointment', 'estimated'].map((s) => { const p = d.pipeline.find((x) => x.status === s) || { n: 0, v: 0 }; return html`
            <div style="display:flex;justify-content:space-between;padding:4px 0"><span><i style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${PIPE_COLORS[s]};margin-right:8px"></i>${statusLabel(s)}</span><b>${p.n}${p.v ? html` <small class="muted">· ${money(p.v, { whole: true })}</small>` : ''}</b></div>` })}
          <div class="divider"></div>
          ${d.recentLeads.map((l) => html`<a class="action" style="padding:8px 0;border:0" href="#/leads/${l.id}"><div class="txt"><b>${l.name}</b><small>${l.service || l.source} · ${ago(l.created_at)}</small></div>${pill(l.status)}</a>`)}
        </div>
      </div>
    </div>
  </div>`

  el.querySelectorAll('[data-tel]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); location.href = telHref(b.dataset.tel) }))
}

/** Crew view: a simple "my day" list built for a phone in a truck. */
async function techHome(el) {
  const from = todayStr(), to = addDays(from, 6)
  const s = await GET(`/schedule?from=${from}&to=${to}`)
  const byDay = {}
  for (const j of s.jobs) (byDay[j.scheduled_start.slice(0, 10)] ||= []).push(j)
  el.innerHTML = html`
  <div class="page-head"><div><h1>My jobs</h1><p class="sub">Next 7 days</p></div></div>
  ${Object.keys(byDay).length ? Object.entries(byDay).map(([day, jobs]) => html`
    <h3 style="margin:16px 0 8px">${new Date(day + 'T12:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</h3>
    <div class="stack">${jobs.map((j) => html`
      <div class="card card-pad">
        <div style="display:flex;justify-content:space-between;gap:8px"><a href="#/jobs/${j.id}"><h3>${fmtTime(j.scheduled_start)} · ${j.customer_name}</h3></a>${pill(j.status)}</div>
        <p class="muted" style="margin:4px 0 10px">${j.title}<br>${j.address}${j.city ? ', ' + j.city : ''}</p>
        <div class="contact-row">
          <a class="btn btn-sm" href="${mapHref(j.address + ' ' + j.city)}" target="_blank">${raw(icon('map', 15))} Directions</a>
          ${j.customer_phone ? html`<a class="btn btn-sm" href="${telHref(j.customer_phone)}">${raw(icon('phone', 15))} Call</a>` : ''}
          <a class="btn btn-sm btn-primary" href="#/jobs/${j.id}">Open job</a>
        </div>
      </div>`)}</div>`) : html`<div class="card empty">No jobs assigned to you this week.</div>`}`
}
