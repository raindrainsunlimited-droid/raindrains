// App shell, router, auth screens, global search.
import { state, GET, POST, html, raw, esc, $, $$, toast, fail, debounce, isOffice, isOwner, field } from './core.js'
import { icon } from './icons.js'

const routes = []
const route = (pattern, loader, opts = {}) => routes.push({ re: new RegExp('^' + pattern.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '$'), loader, ...opts })

route('/', () => import('./views/dashboard.js'), { nav: 'dashboard' })
route('/leads', () => import('./views/leads.js'), { nav: 'leads', office: true })
route('/leads/:id', () => import('./views/leads.js'), { nav: 'leads', office: true })
route('/customers', () => import('./views/customers.js'), { nav: 'customers' })
route('/customers/:id', () => import('./views/customers.js'), { nav: 'customers' })
route('/schedule', () => import('./views/schedule.js'), { nav: 'schedule' })
route('/jobs', () => import('./views/jobs.js'), { nav: 'jobs' })
route('/jobs/:id', () => import('./views/jobs.js'), { nav: 'jobs' })
route('/estimates', () => import('./views/documents.js'), { nav: 'estimates', office: true, kind: 'estimate' })
route('/estimates/:id', () => import('./views/documents.js'), { nav: 'estimates', office: true, kind: 'estimate' })
route('/invoices', () => import('./views/documents.js'), { nav: 'invoices', office: true, kind: 'invoice' })
route('/invoices/:id', () => import('./views/documents.js'), { nav: 'invoices', office: true, kind: 'invoice' })
route('/payments', () => import('./views/documents.js'), { nav: 'invoices', office: true, kind: 'payments' })
route('/pricebook', () => import('./views/admin.js'), { nav: 'pricebook', office: true, page: 'pricebook' })
route('/reports', () => import('./views/reports.js'), { nav: 'reports', office: true })
route('/tasks', () => import('./views/admin.js'), { nav: 'tasks', page: 'tasks' })
route('/team', () => import('./views/admin.js'), { nav: 'team', page: 'team' })
route('/settings', () => import('./views/admin.js'), { nav: 'settings', page: 'settings' })

const NAV = [
  ['dashboard', '#/', 'Dashboard', 'home'],
  ['leads', '#/leads', 'Leads', 'inbox', true],
  ['schedule', '#/schedule', 'Schedule', 'calendar'],
  ['jobs', '#/jobs', 'Jobs', 'truck'],
  ['customers', '#/customers', 'Customers', 'users'],
  ['estimates', '#/estimates', 'Estimates', 'clipboard', true],
  ['invoices', '#/invoices', 'Invoices', 'receipt', true],
  ['reports', '#/reports', 'Reports', 'chart', true],
  ['pricebook', '#/pricebook', 'Price Book', 'tag', true],
  ['tasks', '#/tasks', 'Tasks', 'check'],
  ['team', '#/team', 'Team', 'badge'],
  ['settings', '#/settings', 'Settings', 'cog'],
]

function shell() {
  const u = state.user
  const nav = NAV.filter(([, , , , office]) => !office || isOffice())
  $('#app').innerHTML = html`
  <div class="shell">
    <aside class="side" id="side">
      <a class="brand" href="#/"><img src="/favicon.svg" alt=""><span>${state.settings.company_name || 'Rain Drains'}<small>CRM</small></span></a>
      <nav>${nav.map(([key, href, label, ic]) => html`<a href="${href}" data-nav="${key}">${raw(icon(ic))}<span>${label}</span><b class="badge" data-badge="${key}" hidden></b></a>`)}</nav>
      <div class="side-foot">
        <div class="me"><span class="avatar" style="background:${u.color}">${initials(u.name)}</span><div><b>${u.name}</b><small>${u.role}</small></div></div>
        <button class="btn btn-ghost btn-sm" id="logout">${raw(icon('logout'))} Sign out</button>
      </div>
    </aside>
    <div class="main">
      <header class="top">
        <button class="icon-btn burger" id="burger" aria-label="Menu">${raw(icon('menu'))}</button>
        <div class="search">
          ${raw(icon('search'))}
          <input id="gsearch" placeholder="Search customers, jobs, estimates, invoices…  (Ctrl K)" autocomplete="off">
          <div class="search-results" id="gresults" hidden></div>
        </div>
        ${isOffice() ? html`<div class="new-menu">
          <button class="btn btn-primary" id="newBtn">${raw(icon('plus'))} <span class="hide-sm">New</span></button>
          <div class="dropdown" id="newMenu" hidden>
            <a href="#/leads?new=1">${raw(icon('inbox'))} Lead</a>
            <a href="#/customers?new=1">${raw(icon('users'))} Customer</a>
            <a href="#/estimates?new=1">${raw(icon('clipboard'))} Estimate</a>
            <a href="#/jobs?new=1">${raw(icon('truck'))} Job</a>
            <a href="#/invoices?new=1">${raw(icon('receipt'))} Invoice</a>
          </div></div>` : ''}
      </header>
      <main id="view" class="view"></main>
    </div>
    <div class="side-back" id="sideBack"></div>
  </div>`

  $('#logout').onclick = async () => { await POST('/auth/logout'); state.user = null; location.hash = '#/login'; boot() }
  $('#burger').onclick = () => document.body.classList.toggle('nav-open')
  $('#sideBack').onclick = () => document.body.classList.remove('nav-open')
  const nb = $('#newBtn'), nm = $('#newMenu')
  if (nb) {
    nb.onclick = (e) => { e.stopPropagation(); nm.hidden = !nm.hidden }
    document.addEventListener('click', () => (nm.hidden = true))
  }
  bindSearch()
  refreshBadges()
}

function bindSearch() {
  const input = $('#gsearch'), box = $('#gresults')
  let results = [], active = 0
  const draw = () => {
    box.innerHTML = results.length ? results.map((r, i) => `<a href="${r.link}" class="${i === active ? 'on' : ''}"><span class="tag">${esc(r.type)}</span><b>${esc(r.title)}</b><small>${esc(r.sub || '')}</small></a>`).join('')
      : `<div class="muted" style="padding:12px">No results</div>`
    box.hidden = !input.value.trim()
  }
  const run = debounce(async () => {
    const q = input.value.trim()
    if (q.length < 2) { box.hidden = true; return }
    results = await GET('/search?q=' + encodeURIComponent(q)).catch(() => []); active = 0; draw()
  }, 180)
  input.addEventListener('input', run)
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { active = Math.min(active + 1, results.length - 1); draw(); e.preventDefault() }
    if (e.key === 'ArrowUp') { active = Math.max(active - 1, 0); draw(); e.preventDefault() }
    if (e.key === 'Enter' && results[active]) { location.hash = results[active].link; input.value = ''; box.hidden = true; input.blur() }
    if (e.key === 'Escape') { input.value = ''; box.hidden = true; input.blur() }
  })
  input.addEventListener('blur', () => setTimeout(() => (box.hidden = true), 150))
  box.addEventListener('mousedown', (e) => e.preventDefault())
  box.addEventListener('click', () => { input.value = ''; box.hidden = true; input.blur() })
}
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); $('#gsearch')?.focus() }
})

export async function refreshBadges() {
  if (!isOffice()) return
  try {
    const d = await GET('/dashboard')
    const set = (k, n) => { const b = $(`[data-badge=${k}]`); if (b) { b.hidden = !n; b.textContent = n } }
    set('leads', d.kpis.new_leads)
    set('dashboard', d.actions.filter((a) => a.severity === 'high').length)
  } catch {}
}

const initials = (n) => String(n || '?').split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase()

// ---------- Router ----------
let renderSeq = 0
async function router() {
  if (!state.user) return
  const [path, qs] = (location.hash.slice(1) || '/').split('?')
  if (path === '/login') { location.hash = '#/'; return }
  const r = routes.find((x) => x.re.test(path))
  const view = $('#view')
  document.body.classList.remove('nav-open')
  $$('.side nav a').forEach((a) => a.classList.toggle('on', a.dataset.nav === r?.nav))
  if (!r) { view.innerHTML = '<div class="empty"><h2>Page not found</h2></div>'; return }
  if (r.office && !isOffice()) { view.innerHTML = '<div class="empty"><h2>Office access only</h2></div>'; return }
  const seq = ++renderSeq
  const params = { ...r.re.exec(path).groups, query: Object.fromEntries(new URLSearchParams(qs || '')), kind: r.kind, page: r.page }
  try {
    const mod = await r.loader()
    if (seq !== renderSeq) return
    view.innerHTML = '<div class="loading"><span class="spinner"></span></div>'
    await mod.default(view, params, () => seq === renderSeq)
    if (seq === renderSeq) window.scrollTo(0, 0)
  } catch (e) {
    console.error(e)
    if (seq === renderSeq) view.innerHTML = html`<div class="empty"><h2>Couldn't load this page</h2><p>${e.message}</p></div>`
  }
}
window.addEventListener('hashchange', router)
export const rerender = router

// ---------- Auth ----------
function authScreen(needsSetup, company) {
  $('#app').innerHTML = html`
  <div class="auth">
    <form class="auth-card" id="authForm">
      <img src="/favicon.svg" alt="" width="48" height="48">
      <h1>${company || 'Rain Drains'} CRM</h1>
      <p class="muted">${needsSetup ? 'Welcome! Create the owner account to get started.' : 'Sign in to continue'}</p>
      ${needsSetup ? field('Your name', 'name', '', { required: true }) : ''}
      ${field('Email', 'email', '', { type: 'email', required: true, attrs: 'autocomplete="username"' })}
      ${field('Password', 'password', '', { type: 'password', required: true, attrs: `autocomplete="${needsSetup ? 'new-password' : 'current-password'}" minlength="${needsSetup ? 8 : 1}"`, help: needsSetup ? 'At least 8 characters' : '' })}
      <button class="btn btn-primary btn-lg" type="submit">${needsSetup ? 'Create account' : 'Sign in'}</button>
    </form>
  </div>`
  $('#authForm').addEventListener('submit', async (e) => {
    e.preventDefault()
    const f = e.target, body = { email: f.email.value, password: f.password.value, ...(needsSetup ? { name: f.name.value } : {}) }
    try { await POST(needsSetup ? '/auth/setup' : '/auth/login', body); boot() } catch (err) { fail(err) }
  })
}

async function boot() {
  try {
    const s = await GET('/auth/status')
    if (!s.user) return authScreen(s.needsSetup, s.company)
    state.user = s.user
    ;[state.settings, state.users] = await Promise.all([GET('/settings'), GET('/users')])
    shell()
    if (location.hash === '#/login' || !location.hash) location.hash = '#/'
    router()
  } catch (e) { fail(e) }
}

boot()
setInterval(refreshBadges, 120000)
export { toast }
