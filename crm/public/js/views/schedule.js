import { GET, PUT, html, raw, fmtTime, today, addDays, localDate, z, state, isOffice, userById, toast, fail, pill } from '../core.js'
import { icon } from '../icons.js'
import { jobForm } from './jobs.js'

const START_H = 6, END_H = 20, SLOT = 24 // px per 30 minutes
const ymd = (s) => s.slice(0, 10)

export default async function schedule(el, params) {
  let anchor = params.query.date || sessionStorage.getItem('schedDate') || today()
  let crewFilter = sessionStorage.getItem('schedCrew') || ''
  const mobile = () => window.innerWidth < 820

  const weekStart = (d) => { const x = new Date(d + 'T12:00'); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return localDate(x) } // Monday

  const load = async () => {
    sessionStorage.setItem('schedDate', anchor)
    const from = weekStart(anchor), to = addDays(from, 6)
    const data = await GET(`/schedule?from=${from}&to=${to}`)
    draw(from, data)
  }

  const color = (j) => userById(j.crew[0])?.color || '#5c6b7a'

  const draw = (from, data) => {
    const days = [...Array(7)].map((_, i) => addDays(from, i))
    const jobs = data.jobs.filter((j) => !crewFilter || j.crew.includes(Number(crewFilter)))
    const t = today()
    const hours = [...Array(END_H - START_H)].map((_, i) => START_H + i)
    el.innerHTML = html`
    <div class="page-head">
      <div><h1>Schedule</h1><p class="sub">${new Date(from + 'T12:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} – ${new Date(addDays(from, 6) + 'T12:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p></div>
      <div class="btn-row">
        <button class="btn" data-nav="-7">${raw(icon('chevL', 16))}</button><button class="btn" data-nav="0">Today</button><button class="btn" data-nav="7">${raw(icon('chevR', 16))}</button>
        <input type="date" class="inp" style="width:auto" value="${anchor}" data-date>
        <select class="inp" style="width:auto" data-crew><option value="">All crews</option>${state.users.filter((u) => u.active).map((u) => html`<option value="${u.id}" ${String(u.id) === crewFilter ? raw('selected') : ''}>${u.name}</option>`)}</select>
      </div>
    </div>
    <div class="legend" style="margin-bottom:10px">${state.users.filter((u) => u.active).map((u) => html`<span><i style="background:${u.color}"></i>${u.name}</span>`)}<span><i style="border:2px dashed var(--amber);background:#fff"></i>Estimate appointment</span></div>
    <div class="split" style="grid-template-columns:minmax(0,1fr) ${isOffice() && !mobile() ? '260px' : '0'}">
      ${mobile() ? html`<div class="day-list">${days.map((d) => {
        const evs = jobs.filter((j) => ymd(j.scheduled_start) === d), aps = data.appointments.filter((a) => ymd(a.appointment_at) === d)
        return html`<h3 style="margin:14px 0 8px;${d === t ? 'color:var(--blue)' : ''}">${new Date(d + 'T12:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</h3>
          ${evs.map((j) => html`<a class="ev" style="background:${color(j)};display:block" href="#/jobs/${j.id}"><b>${fmtTime(j.scheduled_start)} · ${j.customer_name}</b>${j.title} — ${j.city}</a>`)}
          ${aps.map((a) => html`<a class="ev appt" style="display:block" href="#/leads/${a.id}"><b>${fmtTime(a.appointment_at)} · Estimate: ${a.name}</b>${a.service} — ${a.city}</a>`)}
          ${!evs.length && !aps.length ? html`<p class="muted small">Nothing scheduled</p>` : ''}` })}</div>`
      : html`<div class="cal" style="max-height:calc(100vh - 210px)">
        <div class="cal-head"></div>
        ${days.map((d) => html`<div class="cal-head ${d === t ? 'today' : ''}">${new Date(d + 'T12:00').toLocaleDateString('en-US', { weekday: 'short' })}<small>${new Date(d + 'T12:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</small></div>`)}
        <div class="cal-hours">${hours.map((h) => html`<div class="cal-hour">${h % 12 || 12}${h < 12 ? 'a' : 'p'}</div>`)}</div>
        ${days.map((d) => html`<div class="cal-day ${d === t ? 'today' : ''}" data-day="${d}">
          ${[...Array((END_H - START_H) * 2)].map(() => raw('<div class="cal-slot"></div>'))}
          ${layout(jobs.filter((j) => ymd(j.scheduled_start) === d), data.appointments.filter((a) => ymd(a.appointment_at) === d)).map((e) => e.appt
            ? html`<a class="ev appt" href="#/leads/${e.item.id}" style="top:${e.top}px;height:${e.height}px;left:calc(${e.left}% + 3px);width:calc(${e.width}% - 6px);right:auto"><b>${fmtTime(e.item.appointment_at)} Estimate</b>${e.item.name}<br>${e.item.city}</a>`
            : html`<a class="ev ${e.item.status}" draggable="${isOffice()}" data-job="${e.item.id}" href="#/jobs/${e.item.id}" title="${e.item.title} — ${e.item.address}"
                style="top:${e.top}px;height:${e.height}px;background:${color(e.item)};left:calc(${e.left}% + 3px);width:calc(${e.width}% - 6px);right:auto">
                <b>${fmtTime(e.item.scheduled_start)} ${e.item.customer_name}</b>${e.item.title}<br>${e.item.city}${e.item.status === 'completed' ? ' ✓' : ''}</a>`)}
        </div>`)}
      </div>`}
      ${isOffice() && !mobile() ? html`<div class="stack">
        <div class="card"><div class="card-head"><h3>Unscheduled</h3><small class="muted">${data.unscheduled.length}</small></div>
          <div class="card-body unsched">${data.unscheduled.length ? data.unscheduled.map((j) => html`<a class="kcard" draggable="true" data-job="${j.id}" href="#/jobs/${j.id}"><b>${j.customer_name}</b><small>${j.title}</small><small>${j.city}</small></a>`)
            : html`<p class="muted small">All jobs are scheduled 👍</p>`}
          <p class="small muted">Drag a job onto the calendar to schedule it. Drag scheduled jobs to move them.</p></div></div>
      </div>` : html`<div></div>`}
    </div>`
    bind(data)
  }

  const bind = (data) => {
    el.querySelectorAll('[data-nav]').forEach((b) => (b.onclick = () => { const n = Number(b.dataset.nav); anchor = n ? addDays(anchor, n) : today(); load() }))
    el.querySelector('[data-date]').onchange = (e) => { if (e.target.value) { anchor = e.target.value; load() } }
    el.querySelector('[data-crew]').onchange = (e) => { crewFilter = e.target.value; sessionStorage.setItem('schedCrew', crewFilter); load() }
    if (!isOffice()) return
    el.querySelectorAll('[data-job][draggable=true]').forEach((a) => a.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', a.dataset.job)
      const rect = a.getBoundingClientRect()
      e.dataTransfer.setData('offset', String(a.classList.contains('ev') ? e.clientY - rect.top : 0))
    }))
    el.querySelectorAll('[data-day]').forEach((col) => {
      col.addEventListener('dragover', (e) => { e.preventDefault(); col.classList.add('over') })
      col.addEventListener('dragleave', () => col.classList.remove('over'))
      col.addEventListener('drop', async (e) => {
        e.preventDefault(); col.classList.remove('over')
        const id = Number(e.dataTransfer.getData('text/plain'))
        const off = Number(e.dataTransfer.getData('offset')) || 0
        const y = e.clientY - col.getBoundingClientRect().top - off
        const mins = Math.max(0, Math.min((END_H - START_H) * 60 - 30, Math.round(y / SLOT) * 30))
        const h = START_H + Math.floor(mins / 60), m = mins % 60
        const start = `${col.dataset.day}T${z(h)}:${z(m)}`
        const job = [...data.jobs, ...data.unscheduled].find((j) => j.id === id)
        try {
          await PUT('/jobs/' + id, { scheduled_start: start, ...(job?.status === 'unscheduled' ? { status: 'scheduled' } : {}) })
          toast(`Scheduled ${new Date(start).toLocaleString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' })}`)
          load()
        } catch (err) { fail(err) }
      })
      col.addEventListener('dblclick', async (e) => {
        if (e.target.closest('.ev')) return
        const y = e.clientY - col.getBoundingClientRect().top
        const mins = Math.round(y / SLOT) * 30
        const id = await jobForm({ scheduled_start: `${col.dataset.day}T${z(START_H + Math.floor(mins / 60))}:${z(mins % 60)}` })
        if (id) load()
      })
    })
  }

  /** Position events, splitting overlapping ones into side-by-side lanes. */
  function layout(jobs, appts) {
    const evs = [
      ...jobs.map((j) => ({ item: j, start: mins(j.scheduled_start), dur: Math.min(j.duration_min, 600) })),
      ...appts.map((a) => ({ item: a, appt: true, start: mins(a.appointment_at), dur: 60 })),
    ].sort((a, b) => a.start - b.start)
    const lanesEnd = []
    for (const e of evs) {
      let lane = lanesEnd.findIndex((end) => end <= e.start)
      if (lane < 0) { lane = lanesEnd.length; lanesEnd.push(0) }
      lanesEnd[lane] = e.start + e.dur; e.lane = lane
    }
    const n = Math.max(1, lanesEnd.length)
    return evs.map((e) => {
      const top = Math.max(0, (e.start - START_H * 60) / 30 * SLOT)
      const maxH = (END_H - START_H) * 2 * SLOT - top
      return { ...e, top, height: Math.max(SLOT, Math.min(maxH, e.dur / 30 * SLOT) - 2), left: (e.lane / n) * 100, width: 100 / n }
    })
  }
  const mins = (s) => { const [h, m] = s.slice(11, 16).split(':').map(Number); return h * 60 + m }

  await load()
  if (!mobile()) { const cal = el.querySelector('.cal'); if (cal) cal.scrollTop = SLOT * 2 } // start view near 7am
}
export { pill }
