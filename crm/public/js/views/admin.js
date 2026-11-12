// Price book, tasks, team, settings.
import { GET, POST, PUT, DEL, html, raw, esc, money, fromCents, toCents, field, select, formModal, confirmBox, toast, fail, state, isOwner, isOffice, loadItems, fmtDate, today, copy } from '../core.js'
import { icon } from '../icons.js'

export default async function admin(el, params) {
  return { pricebook, tasks, team, settings }[params.page](el, params)
}

// ---------------- Price book ----------------
async function pricebook(el) {
  const items = await loadItems(true)
  let q = '', cat = ''
  const cats = [...new Set(items.map((i) => i.category))].sort()
  const draw = () => {
    const f = items.filter((i) => (!cat || i.category === cat) && (!q || `${i.name} ${i.description} ${i.category}`.toLowerCase().includes(q)))
    el.innerHTML = html`
    <div class="page-head"><div><h1>Price book</h1><p class="sub">Your services & materials. Prices drop straight into estimates; costs power the profit numbers.</p></div>
      <button class="btn btn-primary" data-new>${raw(icon('plus'))} Add item</button></div>
    <div class="toolbar"><input type="search" class="q" placeholder="Search items…" value="${q}" data-q>
      <select class="inp" style="width:auto" data-cat><option value="">All categories</option>${cats.map((c) => html`<option ${c === cat ? raw('selected') : ''}>${c}</option>`)}</select></div>
    <div class="card table-wrap"><table class="t"><thead><tr><th>Item</th><th class="hide-sm">Category</th><th class="num">Price</th><th class="num hide-sm">Cost</th><th class="num hide-sm">Margin</th><th></th></tr></thead>
      <tbody>${f.map((i) => html`<tr class="click" data-id="${i.id}" style="${i.active ? '' : 'opacity:.5'}"><td><b>${i.name}</b><small>${i.description}</small></td><td class="hide-sm">${i.category}</td>
        <td class="num"><b>${money(i.price_cents)}</b><small>per ${i.unit}</small></td><td class="num hide-sm">${money(i.cost_cents)}</td>
        <td class="num hide-sm">${i.price_cents ? Math.round(((i.price_cents - i.cost_cents) / i.price_cents) * 100) + '%' : '—'}</td><td>${i.active ? '' : html`<span class="pill pill-gray">Inactive</span>`}</td></tr>`)}</tbody></table></div>`
    el.querySelector('[data-new]').onclick = () => edit({})
    const qi = el.querySelector('[data-q]')
    qi.oninput = () => { q = qi.value.toLowerCase(); draw(); const n = el.querySelector('[data-q]'); n.focus(); n.setSelectionRange(q.length, q.length) }
    el.querySelector('[data-cat]').onchange = (e) => { cat = e.target.value; draw() }
    el.querySelectorAll('tr[data-id]').forEach((tr) => (tr.onclick = () => edit(items.find((i) => i.id === Number(tr.dataset.id)))))
  }
  const edit = async (it) => {
    const r = await formModal(it.id ? 'Edit item' : 'New item', html`<div class="form-grid">
      ${field('Name', 'name', it.name, { required: true, span: 2 })}
      ${field('Description (shown on estimates)', 'description', it.description, { type: 'textarea', span: 2 })}
      ${field('Category', 'category', it.category || 'Drainage', { attrs: 'list="cats"' })}
      ${field('Unit', 'unit', it.unit || 'ea', { placeholder: 'ea, lf, sq ft, hr, ton…' })}
      ${field('Price ($)', 'price', fromCents(it.price_cents), { type: 'number', attrs: 'step="0.01"' })}
      ${field('Your cost ($)', 'cost', fromCents(it.cost_cents), { type: 'number', attrs: 'step="0.01"', help: 'Materials + labor. Internal only.' })}
      <label class="check"><input type="checkbox" name="taxable" ${it.taxable ? raw('checked') : ''}> Taxable</label>
      <label class="check"><input type="checkbox" name="active" ${it.active !== 0 ? raw('checked') : ''}> Active</label>
      <datalist id="cats">${cats.map((c) => html`<option value="${c}">`)}</datalist>
    </div>`, { wide: true })
    if (!r) return
    const body = { name: r.name, description: r.description, category: r.category, unit: r.unit, price_cents: toCents(r.price || 0), cost_cents: toCents(r.cost || 0), taxable: r.taxable, active: r.active }
    try {
      if (it.id) await PUT('/items/' + it.id, body); else await POST('/items', body)
      toast('Saved'); pricebook(el)
    } catch (e) { fail(e) }
  }
  draw()
}

// ---------------- Tasks ----------------
async function tasks(el) {
  const [open, done] = await Promise.all([GET('/tasks'), GET('/tasks?done=1')])
  const t = today()
  el.innerHTML = html`
  <div class="page-head"><div><h1>Tasks</h1><p class="sub">Quick to-dos for the office and crews. Due tasks show up in the dashboard action center.</p></div></div>
  <form class="card card-pad" data-add style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">
    <input class="inp" name="title" placeholder="What needs doing?" style="flex:1;min-width:200px" required>
    <input class="inp" type="date" name="due_date" style="width:auto">
    <select class="inp" name="user_id" style="width:auto">${state.users.filter((u) => u.active).map((u) => html`<option value="${u.id}" ${u.id === state.user.id ? raw('selected') : ''}>${u.name}</option>`)}</select>
    <button class="btn btn-primary">Add task</button>
  </form>
  <div class="card">${open.length ? html`<ul class="checklist" style="padding:6px 18px">${open.map((k) => html`
    <li><input type="checkbox" data-done="${k.id}"><span style="flex:1">${k.title}<small class="muted" style="display:block">${k.user_name || ''}${k.due_date ? html` · <span style="${k.due_date < t ? 'color:var(--red);font-weight:700' : ''}">due ${fmtDate(k.due_date)}</span>` : ''}</small></span>
      <button class="icon-btn" data-del="${k.id}">${raw(icon('trash', 14))}</button></li>`)}</ul>` : html`<div class="empty">No open tasks 🎉</div>`}</div>
  ${done.length ? html`<details style="margin-top:16px"><summary class="muted" style="cursor:pointer">Completed (${done.length})</summary>
    <div class="card" style="margin-top:8px"><ul class="checklist" style="padding:6px 18px">${done.slice(0, 50).map((k) => html`<li class="done"><input type="checkbox" checked data-undo="${k.id}"><span>${k.title}</span></li>`)}</ul></div></details>` : ''}`
  el.querySelector('[data-add]').onsubmit = async (e) => {
    e.preventDefault(); const f = e.target
    await POST('/tasks', { title: f.title.value, due_date: f.due_date.value, user_id: Number(f.user_id.value) }).catch(fail); tasks(el)
  }
  el.querySelectorAll('[data-done]').forEach((c) => (c.onchange = async () => { await PUT('/tasks/' + c.dataset.done, { done: 1 }).catch(fail); tasks(el) }))
  el.querySelectorAll('[data-undo]').forEach((c) => (c.onchange = async () => { await PUT('/tasks/' + c.dataset.undo, { done: 0 }).catch(fail); tasks(el) }))
  el.querySelectorAll('[data-del]').forEach((b) => (b.onclick = async () => { await DEL('/tasks/' + b.dataset.del).catch(fail); tasks(el) }))
}

// ---------------- Team ----------------
const ROLES = [['owner', 'Owner — everything'], ['office', 'Office — everything but team & settings'], ['tech', 'Crew — their jobs & schedule only']]
async function team(el) {
  const users = await GET('/users')
  state.users = users
  el.innerHTML = html`
  <div class="page-head"><div><h1>Team</h1><p class="sub">Crew members only see their own jobs, schedule, and the customer details they need on site — no prices.</p></div>
    ${isOwner() ? html`<button class="btn btn-primary" data-new>${raw(icon('plus'))} Add team member</button>` : ''}</div>
  <div class="card table-wrap"><table class="t"><thead><tr><th>Name</th><th>Email</th><th class="hide-sm">Phone</th><th>Role</th><th></th></tr></thead>
    <tbody>${users.map((u) => html`<tr class="${isOwner() ? 'click' : ''}" data-id="${u.id}" style="${u.active ? '' : 'opacity:.5'}"><td><span class="avatar sm" style="background:${u.color};margin-right:8px">${u.name[0]}</span><b>${u.name}</b></td><td>${u.email}</td><td class="hide-sm">${u.phone}</td>
      <td style="text-transform:capitalize">${u.role === 'tech' ? 'Crew' : u.role}</td><td>${u.active ? '' : html`<span class="pill pill-gray">Inactive</span>`}</td></tr>`)}</tbody></table></div>
  <div class="card card-pad" style="margin-top:16px;max-width:520px">
    <h3 style="margin-bottom:10px">Change my password</h3>
    <form data-pw class="form-grid">${field('Current password', 'current', '', { type: 'password', required: true })}${field('New password', 'next', '', { type: 'password', required: true, attrs: 'minlength="8"' })}
      <div><button class="btn btn-primary">Update password</button></div></form>
  </div>`
  el.querySelector('[data-pw]').onsubmit = async (e) => {
    e.preventDefault()
    try { await PUT('/auth/password', { current: e.target.current.value, next: e.target.next.value }); toast('Password updated'); e.target.reset() } catch (err) { fail(err) }
  }
  if (!isOwner()) return
  const edit = async (u) => {
    const r = await formModal(u.id ? `Edit ${u.name}` : 'Add team member', html`<div class="form-grid">
      ${field('Name', 'name', u.name, { required: true })}
      ${field('Email (login)', 'email', u.email, { type: 'email', required: true })}
      ${field('Phone', 'phone', u.phone, { type: 'tel' })}
      ${field('Calendar color', 'color', u.color || '#189653', { type: 'color' })}
      ${select('Role', 'role', u.role || 'tech', ROLES, { span: 2 })}
      ${field(u.id ? 'New password (leave blank to keep)' : 'Password', 'password', '', { type: 'password', required: !u.id, attrs: 'minlength="8" autocomplete="new-password"', span: 2 })}
      ${u.id ? html`<label class="check"><input type="checkbox" name="active" ${u.active ? raw('checked') : ''}> Active (can sign in)</label>` : ''}
    </div>`, { wide: true })
    if (!r) return
    if (!r.password) delete r.password
    try { if (u.id) await PUT('/users/' + u.id, r); else await POST('/users', r); toast('Saved'); team(el) } catch (e) { fail(e) }
  }
  el.querySelector('[data-new]').onclick = () => edit({})
  el.querySelectorAll('tr[data-id]').forEach((tr) => (tr.onclick = () => edit(users.find((u) => u.id === Number(tr.dataset.id)))))
}

// ---------------- Settings ----------------
async function settings(el) {
  if (!isOwner()) {
    el.innerHTML = html`<div class="empty"><h2>Settings</h2><p>Only the owner can change company settings.</p></div>`
    return
  }
  const s = await GET('/settings')
  const origin = location.origin
  const embed = `<form id="rd-lead-form" action="${origin}/api/public/leads" method="POST">
  <input name="name" placeholder="Your name" required>
  <input name="phone" type="tel" placeholder="Phone" required>
  <input name="email" type="email" placeholder="Email">
  <input name="address" placeholder="Street address">
  <input name="city" placeholder="City">
  <select name="service">
    <option value="">What do you need help with?</option>
    <option>French Drain Installation</option><option>Grading Services</option>
    <option>Downspout Extensions</option><option>Outdoor Sump Pumps</option>
    <option>Exterior Waterproofing</option><option>Other</option>
  </select>
  <textarea name="message" placeholder="Tell us what's going on"></textarea>
  <input name="website" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px" aria-hidden="true">
  <input type="hidden" name="redirect" value="${s.company_website.replace(/\/$/, '')}/?estimate=requested">
  <button type="submit">Get My Free Estimate</button>
</form>
<script>
// Optional: submit without leaving the page + capture UTM tags
(function () {
  var f = document.getElementById('rd-lead-form'), p = new URLSearchParams(location.search)
  f.addEventListener('submit', function (e) {
    e.preventDefault()
    var d = Object.fromEntries(new FormData(f)); delete d.redirect
    d.page = location.href; ['utm_source', 'utm_medium', 'utm_campaign'].forEach(function (k) { if (p.get(k)) d[k] = p.get(k) })
    fetch(f.action, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) })
      .then(function (r) { if (!r.ok) throw r; f.innerHTML = '<p><b>Thanks! We got your request and will reach out shortly.</b></p>' })
      .catch(function () { alert('Something went wrong — please call us.') })
  })
})()
</script>`

  el.innerHTML = html`
  <div class="page-head"><div><h1>Settings</h1></div></div>
  <form data-settings class="stack" style="max-width:900px">
    <div class="card"><div class="card-head"><h3>Company</h3></div><div class="card-body form-grid">
      ${field('Company name', 'company_name', s.company_name)}${field('Phone', 'company_phone', s.company_phone)}
      ${field('Email', 'company_email', s.company_email)}${field('Website', 'company_website', s.company_website)}
      ${field('Address', 'company_address', s.company_address)}${field('License #', 'license', s.license)}
    </div></div>
    <div class="card"><div class="card-head"><h3>Estimates & invoices</h3></div><div class="card-body form-grid">
      ${field('Default tax rate (%)', 'default_tax_rate', s.default_tax_rate, { type: 'number', attrs: 'step="0.001"', help: 'Most VA drainage work is billed without sales tax — check with your accountant.' })}
      ${field('Estimates valid for (days)', 'estimate_valid_days', s.estimate_valid_days, { type: 'number' })}
      ${field('Invoice due in (days)', 'invoice_due_days', s.invoice_due_days, { type: 'number', help: '0 = due on receipt' })}
      <div></div>
      ${field('Default estimate terms', 'estimate_terms', s.estimate_terms, { type: 'textarea', span: 2 })}
      ${field('Default invoice terms', 'invoice_terms', s.invoice_terms, { type: 'textarea', span: 2 })}
      ${field('Payment instructions (shown on invoices)', 'payment_instructions', s.payment_instructions, { type: 'textarea', span: 2 })}
      ${field('Next estimate #', 'next_estimate_number', s.next_estimate_number, { type: 'number' })}${field('Next invoice #', 'next_invoice_number', s.next_invoice_number, { type: 'number', help: 'Set this above your last Markate invoice number to continue the sequence.' })}
    </div></div>
    <div class="card"><div class="card-head"><h3>Automation & follow-up</h3></div><div class="card-body form-grid">
      ${field('Flag uncontacted leads after (hours)', 'lead_response_hours', s.lead_response_hours, { type: 'number' })}
      ${field('Flag unanswered estimates after (days)', 'estimate_follow_up_days', s.estimate_follow_up_days, { type: 'number' })}
      ${field('Google review link', 'review_url', s.review_url, { span: 2 })}
    </div></div>
    <div class="card"><div class="card-head"><h3>${raw(icon('dollar'))} Online payments — PayPal</h3>${s.paypal_enabled === '1' && s.paypal_secret_set ? html`<span class="pill pill-green">On</span>` : html`<span class="pill pill-gray">Off</span>`}</div><div class="card-body form-grid">
      <p class="muted span-2">Adds a <b>Pay now</b> button (card, PayPal, Venmo) to invoices, and a <b>Pay deposit</b> button after a customer signs an estimate that has a deposit %. Payments are recorded in the CRM automatically.
        Get your keys at <a href="https://developer.paypal.com/dashboard/applications/live" target="_blank" rel="noopener">developer.paypal.com</a> → log in with your business account → Apps &amp; Credentials → <b>Live</b> → Create App.</p>
      ${select('Online payments', 'paypal_enabled', s.paypal_enabled, [['0', 'Off'], ['1', 'On']])}
      ${select('Mode', 'paypal_env', s.paypal_env, [['live', 'Live (real money)'], ['sandbox', 'Sandbox (testing)']])}
      ${field('Client ID', 'paypal_client_id', s.paypal_client_id, { span: 2, attrs: 'autocomplete="off"' })}
      ${field('Secret', 'paypal_secret', '', { type: 'password', span: 2, placeholder: s.paypal_secret_set ? '•••••••• saved — leave blank to keep' : 'Paste your secret', attrs: 'autocomplete="new-password"' })}
      <div class="span-2"><button type="button" class="btn btn-sm" data-pp-test>Test connection</button> <small class="muted">Save first, then test.</small></div>
    </div></div>
    <div class="card"><div class="card-head"><h3>Customer financing — Wisetack</h3>${s.wisetack_url ? html`<span class="pill pill-green">On</span>` : html`<span class="pill pill-gray">Off</span>`}</div><div class="card-body form-grid">
      <p class="muted span-2">Shows a <b>See financing options</b> button on estimates and invoices. Paste your application link from your Wisetack merchant dashboard (the link Wisetack gives you to send customers). When a customer clicks it, it's logged on their timeline so you know to follow up. When Wisetack funds a job, use <b>Record payment → Wisetack financing</b> on the invoice.</p>
      ${field('Your Wisetack link', 'wisetack_url', s.wisetack_url, { span: 2, placeholder: 'https://…  (copied from Wisetack)' })}
      ${field('Only show for jobs over ($)', 'wisetack_min', s.wisetack_min, { type: 'number' })}
    </div></div>
    <div class="card"><div class="card-head"><h3>Website lead form</h3></div><div class="card-body form-grid">
      ${field('Allowed website origins', 'allowed_origins', s.allowed_origins, { span: 2, help: 'Comma-separated. Only these sites can post leads from the browser.' })}
      <div class="span-2"><p class="muted" style="margin-bottom:8px">Paste this on raindrainsva.com in place of the Markate widget. Leads land on your Leads board instantly, tagged with the page and ad campaign they came from.</p>
        <textarea class="inp" style="height:200px;font-family:ui-monospace,monospace;font-size:12px;padding:10px" readonly data-embed>${embed}</textarea>
        <button type="button" class="btn btn-sm" style="margin-top:8px" data-copy-embed>${raw(icon('copy', 14))} Copy code</button></div>
    </div></div>
    <div style="position:sticky;bottom:12px"><button class="btn btn-primary btn-lg">Save settings</button></div>
  </form>

  <div class="card" style="max-width:900px;margin-top:16px"><div class="card-head"><h3>${raw(icon('upload'))} Import from Markate (or any CSV)</h3></div><div class="card-body">
    <p class="muted" style="margin-bottom:10px">In Markate go to <b>Customers → Export</b>, download the CSV, then upload it here. We match columns like First Name, Last Name, Email, Phone, Address, City, State, Zip automatically and skip duplicates.</p>
    <label class="upload-drop"><input type="file" accept=".csv,text/csv" hidden data-import> Choose CSV file…</label>
  </div></div>

  <div class="card" style="max-width:900px;margin-top:16px"><div class="card-head"><h3>${raw(icon('download'))} Export / backup</h3></div><div class="card-body btn-row">
    ${['customers', 'leads', 'estimates', 'jobs', 'invoices', 'payments'].map((w) => html`<a class="btn btn-sm" href="/api/export/${w}">${w}.csv</a>`)}
  </div></div>`

  el.querySelector('[data-settings]').onsubmit = async (e) => {
    e.preventDefault()
    const body = {}
    for (const i of e.target.elements) if (i.name) body[i.name] = i.value
    if (body.wisetack_url && !/^https:\/\//.test(body.wisetack_url)) return toast('Wisetack link must start with https://', 'err')
    try { state.settings = await PUT('/settings', body); toast('Settings saved'); settings(el) } catch (err) { fail(err) }
  }
  el.querySelector('[data-copy-embed]').onclick = () => copy(embed)
  el.querySelector('[data-pp-test]').onclick = async () => {
    try { const r = await POST('/settings/paypal-test'); toast(`PayPal connected (${r.env}) ✅`) } catch (err) { fail(err) }
  }
  el.querySelector('[data-import]').onchange = async (e) => {
    const f = e.target.files[0]; if (!f) return
    const csv = await f.text()
    if (!(await confirmBox(`Import customers from ${f.name}?`, { ok: 'Import' }))) return
    try { const r = await POST('/import/customers', { csv }); toast(`Imported ${r.created} customers (${r.skipped} skipped as duplicates/blank)`) } catch (err) { fail(err) }
    e.target.value = ''
  }
}
export { esc, isOffice }
