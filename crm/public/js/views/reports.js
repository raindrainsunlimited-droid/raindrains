import { GET, html, raw, money, today, isOwner } from '../core.js'
import { icon } from '../icons.js'

const PRESETS = () => {
  const t = today(), y = t.slice(0, 4), m = t.slice(0, 7)
  const q = Math.floor((Number(t.slice(5, 7)) - 1) / 3) * 3 + 1
  const lm = new Date(m + '-15'); lm.setMonth(lm.getMonth() - 1)
  const lmEnd = new Date(m + '-01T12:00'); lmEnd.setDate(0)
  return [
    ['This month', m + '-01', t],
    ['Last month', lm.toISOString().slice(0, 7) + '-01', lmEnd.toISOString().slice(0, 10)],
    ['This quarter', `${y}-${String(q).padStart(2, '0')}-01`, t],
    ['Year to date', y + '-01-01', t],
    ['Last year', `${y - 1}-01-01`, `${y - 1}-12-31`],
  ]
}

export default async function reports(el, params) {
  let from = params.query.from || today().slice(0, 4) + '-01-01', to = params.query.to || today()
  const load = async () => {
    const r = await GET(`/reports?from=${from}&to=${to}`)
    const e = r.estimates
    const closeRate = e.approved + e.declined ? Math.round((e.approved / (e.approved + e.declined)) * 100) : 0
    const svcMax = Math.max(1, ...r.byService.map((s) => s.v))
    const cityMax = Math.max(1, ...r.byCity.map((s) => s.v))
    const monthMax = Math.max(1, ...r.byMonth.map((s) => s.v))
    const agingTotal = Object.values(r.aging).reduce((a, b) => a + b, 0)
    el.innerHTML = html`
    <div class="page-head"><div><h1>Reports</h1><p class="sub">${new Date(from + 'T12:00').toLocaleDateString()} – ${new Date(to + 'T12:00').toLocaleDateString()}</p></div>
      <div class="btn-row">
        <div class="tabs">${PRESETS().map(([l, f, t]) => html`<button data-f="${f}" data-t="${t}" class="${f === from && t === to ? 'on' : ''}">${l}</button>`)}</div>
        <input type="date" class="inp" style="width:auto" value="${from}" data-from> – <input type="date" class="inp" style="width:auto" value="${to}" data-to>
      </div></div>

    <div class="grid g4" style="margin-bottom:16px">
      <div class="card kpi"><div class="label">Collected</div><div class="value">${money(r.collected.v, { whole: true })}</div><div class="delta">${r.collected.n} payments</div></div>
      <div class="card kpi"><div class="label">Invoiced</div><div class="value">${money(r.invoiced.v, { whole: true })}</div><div class="delta">${r.invoiced.n} invoices · avg ${money(r.invoiced.n ? r.invoiced.v / r.invoiced.n : 0, { whole: true })}</div></div>
      <div class="card kpi"><div class="label">Estimate close rate</div><div class="value">${closeRate}%</div><div class="delta">${e.approved || 0} won · ${e.declined || 0} lost · ${e.open || 0} open</div></div>
      <div class="card kpi"><div class="label">Jobs completed</div><div class="value">${r.jobs.n}</div><div class="delta">${r.jobs.avg_hours ? `avg ${r.jobs.avg_hours.toFixed(1)} hrs on site` : ''}</div></div>
    </div>

    <div class="grid g2">
      <div class="card"><div class="card-head"><h3>Collected by month</h3></div><div class="card-body">
        ${r.byMonth.length ? html`<div class="bars">${r.byMonth.map((m) => html`<div class="bar"><div class="b" style="height:${(m.v / monthMax) * 100}%" title="${money(m.v)}"></div><small>${new Date(m.month + '-15').toLocaleDateString('en-US', { month: 'short' })}</small><small style="font-weight:700;color:var(--ink)">${money(m.v, { whole: true })}</small></div>`)}</div>` : html`<p class="muted">No payments in range.</p>`}
      </div></div>

      <div class="card"><div class="card-head"><h3>A/R aging</h3><small class="muted">${money(agingTotal)} outstanding today</small></div><div class="card-body">
        ${[['current', 'Current'], ['d30', '1–30 days late'], ['d60', '31–60 days late'], ['d90', '60+ days late']].map(([k, l], i) => html`
          <div class="hbar"><span>${l}</span><div class="track"><div class="fill" style="width:${agingTotal ? (r.aging[k] / agingTotal) * 100 : 0}%;background:${['var(--green)', 'var(--amber)', '#e07b39', 'var(--red)'][i]}"></div></div><b class="nowrap">${money(r.aging[k], { whole: true })}</b></div>`)}
      </div></div>

      <div class="card"><div class="card-head"><h3>Revenue by service</h3><small class="muted">Invoiced line items</small></div><div class="card-body">
        ${r.byService.length ? r.byService.map((s) => html`<div class="hbar"><span>${s.name}<br><small class="muted">${+s.qty.toFixed(1)} ${s.unit} · ${s.v ? Math.round(((s.v - s.cost) / s.v) * 100) : 0}% margin</small></span><div class="track"><div class="fill" style="width:${(s.v / svcMax) * 100}%"></div></div><b class="nowrap">${money(s.v, { whole: true })}</b></div>`) : html`<p class="muted">No invoices in range.</p>`}
      </div></div>

      <div class="card"><div class="card-head"><h3>Revenue by city / service area</h3></div><div class="card-body">
        ${r.byCity.length ? r.byCity.map((s) => html`<div class="hbar"><span>${s.city}<br><small class="muted">${s.n} invoice${s.n === 1 ? '' : 's'}</small></span><div class="track"><div class="fill" style="width:${(s.v / cityMax) * 100}%;background:var(--green)"></div></div><b class="nowrap">${money(s.v, { whole: true })}</b></div>`) : html`<p class="muted">No invoices in range.</p>`}
      </div></div>

      <div class="card"><div class="card-head"><h3>Lead sources — what's actually working</h3></div>
        ${r.bySource.length ? html`<table class="t"><thead><tr><th>Source</th><th class="num">Leads</th><th class="num">Won</th><th class="num">Win %</th><th class="num">Won value</th></tr></thead>
          <tbody>${r.bySource.map((s) => html`<tr><td>${s.source}</td><td class="num">${s.leads}</td><td class="num">${s.won}</td><td class="num">${s.leads ? Math.round((s.won / s.leads) * 100) : 0}%</td><td class="num">${money(s.won_value, { whole: true })}</td></tr>`)}</tbody></table>` : html`<div class="empty small">No leads in range.</div>`}
      </div>

      <div class="stack">
        <div class="card"><div class="card-head"><h3>Payment methods</h3></div>
          ${r.byMethod.length ? html`<table class="t"><tbody>${r.byMethod.map((m) => html`<tr><td style="text-transform:capitalize">${m.method}</td><td class="num">${m.n}</td><td class="num"><b>${money(m.v)}</b></td></tr>`)}</tbody></table>` : html`<div class="empty small">None</div>`}</div>
        <div class="card"><div class="card-head"><h3>Jobs completed by crew</h3></div>
          ${r.byTech.length ? html`<table class="t"><tbody>${r.byTech.map((t) => html`<tr><td><span class="avatar sm" style="background:${t.color};margin-right:8px">${t.name[0]}</span>${t.name}</td><td class="num"><b>${t.jobs}</b></td></tr>`)}</tbody></table>` : html`<div class="empty small">None</div>`}</div>
        <div class="card card-pad"><h3 style="margin-bottom:6px">Estimates</h3><p class="muted">${e.n || 0} sent · ${money(e.v || 0, { whole: true })} quoted · <b style="color:var(--green)">${money(e.approved_v || 0, { whole: true })} won</b></p></div>
      </div>
    </div>
    ${isOwner() ? html`<div class="card card-pad" style="margin-top:16px"><h3 style="margin-bottom:10px">${raw(icon('download'))} Export data (CSV)</h3><div class="btn-row">${['customers', 'leads', 'estimates', 'jobs', 'invoices', 'payments'].map((w) => html`<a class="btn btn-sm" href="/api/export/${w}">${w}</a>`)}</div></div>` : ''}`

    el.querySelectorAll('[data-f]').forEach((b) => (b.onclick = () => { from = b.dataset.f; to = b.dataset.t; load() }))
    el.querySelector('[data-from]').onchange = (ev) => { from = ev.target.value; load() }
    el.querySelector('[data-to]').onchange = (ev) => { to = ev.target.value; load() }
  }
  await load()
}
