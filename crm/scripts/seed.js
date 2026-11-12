// Seeds the price book (if empty). With --demo, also adds sample team, customers, leads, estimates, jobs and invoices.
// PRICES ARE PLACEHOLDERS — edit them in Price Book before sending real estimates.
import { all, get, run, insert, tx, nextNumber, logActivity } from '../lib/db.js'
import { hashPassword, token } from '../lib/auth.js'
import { saveLineItems, refreshTotal, today, addDays } from '../lib/docs.js'

const $ = (d) => Math.round(d * 100)
const ITEMS = [
  ['French Drain', 'Excavate trench, filter fabric, washed #57 stone, 4" smooth-wall SDR-35 pipe, backfill', 'Drainage', 'lf', 45, 14],
  ['French Drain — 6" pipe upgrade', 'Upsize run to 6" smooth-wall pipe for high water volume', 'Drainage', 'lf', 12, 5],
  ['Catch Basin (12" x 12")', 'NDS catch basin with grate, connected to drain line', 'Drainage', 'ea', 275, 70],
  ['Pop-Up Emitter / Discharge Outlet', 'Pop-up emitter at daylight discharge point', 'Drainage', 'ea', 95, 18],
  ['Curb Outlet / Curb Cut', 'Tie drain line through curb to street', 'Drainage', 'ea', 450, 60],
  ['Dry Well', 'Buried dry-well chamber where daylight discharge is not available', 'Drainage', 'ea', 1250, 300],
  ['Underground Downspout Extension', 'Bury downspout line to discharge away from foundation', 'Downspouts', 'lf', 24, 6],
  ['Downspout Connector / Adapter', 'Connect gutter downspout to underground line', 'Downspouts', 'ea', 65, 12],
  ['Concrete Channel Drain', 'Saw-cut concrete, install channel drain with grate, patch', 'Concrete', 'lf', 95, 30],
  ['Concrete Saw Cut & Patch', 'Cut through slab for drain line and re-pour', 'Concrete', 'lf', 40, 10],
  ['Yard Grading', 'Machine grading to correct slope away from structure', 'Grading', 'hr', 185, 60],
  ['Topsoil', 'Screened topsoil, delivered and spread', 'Grading', 'cu yd', 65, 30],
  ['Zoysia Sod', 'Supply and install Zoysia sod', 'Lawn Restoration', 'sq ft', 2.25, 0.9],
  ['Fescue / Bermuda Sod', 'Supply and install sod to match existing lawn', 'Lawn Restoration', 'sq ft', 1.75, 0.6],
  ['Seed & Straw', 'Seed and straw disturbed areas', 'Lawn Restoration', 'sq ft', 0.35, 0.1],
  ['Outdoor Sump Pump System', 'Sump basin, pump, check valve, discharge line', 'Pumps', 'ea', 1850, 600],
  ['Exterior Waterproofing', 'Excavate along foundation, apply membrane, drain board, footing drain', 'Waterproofing', 'lf', 125, 40],
  ['Culvert Pipe Installation', 'Install culvert pipe under driveway / ditch crossing', 'Culverts', 'lf', 95, 35],
  ['Rip-Rap Stone', 'Class I rip-rap for erosion control at outlets', 'Culverts', 'ton', 110, 45],
  ['Gravel Driveway — #57 Stone', 'Deliver, spread and compact #57 stone', 'Gravel', 'ton', 75, 32],
  ['Gravel Driveway — Crusher Run', 'Deliver, spread and compact crusher run base', 'Gravel', 'ton', 62, 25],
  ['Trenching', 'Machine trenching for utility / irrigation lines', 'Excavation', 'lf', 12, 3],
  ['Landscape Excavation', 'Excavator with operator', 'Excavation', 'hr', 175, 55],
  ['Pool Liner Protection System', 'Hydrostatic relief drain around in-ground pool', 'Pools', 'ea', 1650, 450],
  ['Hydrojet Cleanout', 'High-pressure jetting of an existing drain line', 'Maintenance', 'ea', 350, 40],
  ['Camera Inspection', 'Video inspection of existing drain line', 'Maintenance', 'ea', 225, 20],
  ['Mobilization', 'Equipment delivery and setup', 'General', 'ea', 250, 80],
  ['Debris Haul-Off', 'Haul away spoils / debris (per load)', 'General', 'load', 300, 120],
]

function seedItems() {
  if (get('SELECT COUNT(*) n FROM items').n) return console.log('Price book already has items — skipped.')
  tx(() => ITEMS.forEach(([name, description, category, unit, price, cost]) =>
    insert('items', { name, description, category, unit, price_cents: $(price), cost_cents: $(cost) }, ['name', 'description', 'category', 'unit', 'price_cents', 'cost_cents'])))
  console.log(`Added ${ITEMS.length} price book items (placeholder prices — review them in the app).`)
}

function seedDemo() {
  if (get('SELECT COUNT(*) n FROM customers').n) return console.log('Customers already exist — demo data skipped.')
  const userCols = ['name', 'email', 'phone', 'role', 'color', 'password_hash']
  let ownerId = get("SELECT id FROM users WHERE role = 'owner'")?.id
  if (!ownerId) {
    ownerId = insert('users', { name: 'Demo Owner', email: 'owner@demo.local', role: 'owner', color: '#1c6fd6', password_hash: hashPassword('raindrains') }, userCols)
    console.log('Demo login: owner@demo.local / raindrains')
  }
  const tech1 = insert('users', { name: 'Marcus (Crew A)', email: 'crew-a@demo.local', role: 'tech', color: '#189653', password_hash: hashPassword('raindrains') }, userCols)
  const tech2 = insert('users', { name: 'Devon (Crew B)', email: 'crew-b@demo.local', role: 'tech', color: '#d97706', password_hash: hashPassword('raindrains') }, userCols)
  const office = insert('users', { name: 'Office', email: 'office@demo.local', role: 'office', color: '#7c3aed', password_hash: hashPassword('raindrains') }, userCols)

  const cc = ['type', 'first_name', 'last_name', 'company', 'email', 'phone', 'address', 'city', 'state', 'zip', 'source', 'tags']
  const custs = [
    ['residential', 'Amber', 'Morgan', '', 'amber@example.com', '757-555-0141', '1412 Battlefield Blvd', 'Chesapeake', '23322', 'Google', 'repeat'],
    ['residential', 'Tony', 'Cannady', '', 'tony@example.com', '757-555-0177', '508 Laskin Rd', 'Virginia Beach', '23451', 'Referral', ''],
    ['residential', 'James', 'LaZar', '', 'james@example.com', '757-555-0122', '22 Bennetts Creek Ln', 'Suffolk', '23435', 'Website', ''],
    ['commercial', '', '', 'Harbor View Apartments', 'pm@example.com', '757-555-0190', '900 Harbor View Blvd', 'Norfolk', '23510', 'Website', 'commercial,property-mgmt'],
    ['residential', 'Lisa', 'Pham', '', 'lisa@example.com', '252-555-0108', '114 Waterlily Rd', 'Currituck County', '27947', 'Facebook', ''],
    ['residential', 'Robert', 'Hayes', '', 'rhayes@example.com', '757-555-0166', '3001 Kempsville Rd', 'Virginia Beach', '23464', 'Google', ''],
  ].map(([type, first_name, last_name, company, email, phone, address, city, zip, source, tags]) =>
    insert('customers', { type, first_name, last_name, company, email, phone, address, city, state: city.includes('County') ? 'NC' : 'VA', zip, source, tags }, cc))

  const item = (name) => get('SELECT * FROM items WHERE name = ?', name)
  const li = (name, qty, extra = {}) => { const it = item(name); return { item_id: it.id, name: it.name, description: it.description, qty, unit: it.unit, price_cents: it.price_cents, cost_cents: it.cost_cents, ...extra } }
  const mkEst = (customer_id, title, items, status, daysAgo, extra = {}) => {
    const issue = addDays(today(), -daysAgo)
    const id = insert('estimates', { number: nextNumber('estimate'), token: token(16), customer_id, title, address: get('SELECT address || \', \' || city a FROM customers WHERE id = ?', customer_id).a,
      status, issue_date: issue, expiry_date: addDays(issue, 30), terms: 'Estimate valid for 30 days.', created_by: ownerId,
      sent_at: status !== 'draft' ? issue + ' 15:00:00' : null, approved_at: status === 'approved' ? addDays(issue, 2) + ' 10:00:00' : null, ...extra },
      ['number', 'token', 'customer_id', 'title', 'address', 'status', 'issue_date', 'expiry_date', 'terms', 'created_by', 'sent_at', 'approved_at', 'deposit_pct', 'signature_name', 'lead_id'])
    saveLineItems('estimate', id, items); refreshTotal('estimate', id)
    logActivity({ entity_type: 'estimate', entity_id: id, customer_id, user_id: ownerId, text: `Estimate created` })
    return id
  }
  const at = (days, hh) => `${addDays(today(), days)}T${hh}`
  const mkJob = (customer_id, estimate_id, title, status, start, crew, specs = {}) => {
    const c = get('SELECT address, city FROM customers WHERE id = ?', customer_id)
    return insert('jobs', { number: nextNumber('job'), customer_id, estimate_id, title, address: c.address, city: c.city, status, scheduled_start: start, duration_min: 480, crew, specs,
      checklist: [{ text: 'Miss Utility (VA811) ticket called in & clear', done: !!specs.ticket_number }, { text: 'Before photos taken', done: status === 'completed' }, { text: 'Walkthrough with customer', done: status === 'completed' }],
      completed_at: status === 'completed' ? addDays(today(), -3) + ' 16:00:00' : null, started_at: status === 'completed' ? addDays(today(), -3) + ' 08:00:00' : null },
      ['number', 'customer_id', 'estimate_id', 'title', 'address', 'city', 'status', 'scheduled_start', 'duration_min', 'crew', 'specs', 'checklist', 'completed_at', 'started_at'])
  }
  const mkInv = (customer_id, job_id, estimate_id, items, status, daysAgo, due) => {
    const id = insert('invoices', { number: nextNumber('invoice'), token: token(16), customer_id, job_id, estimate_id, title: 'Drainage work', status, issue_date: addDays(today(), -daysAgo), due_date: addDays(today(), due), sent_at: addDays(today(), -daysAgo) },
      ['number', 'token', 'customer_id', 'job_id', 'estimate_id', 'title', 'status', 'issue_date', 'due_date', 'sent_at'])
    saveLineItems('invoice', id, items); refreshTotal('invoice', id)
    return id
  }

  tx(() => {
    // Amber: approved, job completed, invoiced and paid
    const aItems = [li('French Drain', 120), li('Catch Basin (12" x 12")', 2), li('Pop-Up Emitter / Discharge Outlet', 1), li('Zoysia Sod', 300)]
    const e1 = mkEst(custs[0], 'Backyard French Drain', aItems, 'approved', 40, { signature_name: 'Amber Morgan' })
    const j1 = mkJob(custs[0], e1, 'Backyard French Drain', 'completed', at(-3, '08:00'), [tech1], { linear_ft: 120, pipe: '4" smooth-wall SDR-35', discharge: 'Pop-up emitter', ticket_number: 'A0000001' })
    const i1 = mkInv(custs[0], j1, e1, aItems, 'sent', 3, 0)
    insert('payments', { invoice_id: i1, amount_cents: get('SELECT total_cents t FROM invoices WHERE id = ?', i1).t, method: 'check', reference: '#2231', paid_at: addDays(today(), -2) }, ['invoice_id', 'amount_cents', 'method', 'reference', 'paid_at'])

    // Tony: approved, scheduled this week
    const e2 = mkEst(custs[1], 'Front Yard Drainage + Downspouts', [li('Underground Downspout Extension', 80), li('Downspout Connector / Adapter', 4), li('Pop-Up Emitter / Discharge Outlet', 2), li('Fescue / Bermuda Sod', 150, { optional: 1, selected: 1 })], 'approved', 10, { deposit_pct: 30, signature_name: 'Tony Cannady' })
    mkJob(custs[1], e2, 'Front Yard Drainage + Downspouts', 'scheduled', at(1, '08:00'), [tech1], { linear_ft: 80, pipe: '4" smooth-wall SDR-35', discharge: 'Pop-up emitter' })

    // James: estimate viewed, awaiting decision
    mkEst(custs[2], 'Side Yard Grading & French Drain', [li('Yard Grading', 6), li('French Drain', 60), li('Topsoil', 8), li('Dry Well', 1, { optional: 1, selected: 0 })], 'viewed', 5)

    // Harbor View: commercial job scheduled + partially paid deposit invoice
    const hItems = [li('Concrete Channel Drain', 40), li('Catch Basin (12" x 12")', 4), li('Mobilization', 1)]
    const e4 = mkEst(custs[3], 'Parking Lot Channel Drains', hItems, 'approved', 20)
    const j4 = mkJob(custs[3], e4, 'Parking Lot Channel Drains', 'scheduled', at(2, '07:30'), [tech2, tech1], { linear_ft: 40, ticket_number: 'A0000002', ticket_expires: addDays(today(), 10) })
    const i4 = mkInv(custs[3], j4, e4, hItems, 'sent', 20, -5)
    insert('payments', { invoice_id: i4, amount_cents: 150000, method: 'ach', reference: 'deposit', paid_at: addDays(today(), -18) }, ['invoice_id', 'amount_cents', 'method', 'reference', 'paid_at'])

    // Lisa: unscheduled job
    const e5 = mkEst(custs[4], 'Culvert Replacement', [li('Culvert Pipe Installation', 30), li('Rip-Rap Stone', 4)], 'approved', 3)
    mkJob(custs[4], e5, 'Culvert Replacement', 'unscheduled', '', [])

    // Robert: draft estimate
    mkEst(custs[5], 'Gravel Driveway', [li('Gravel Driveway — Crusher Run', 18), li('Gravel Driveway — #57 Stone', 10)], 'draft', 0)

    const lc = ['name', 'email', 'phone', 'address', 'city', 'service', 'message', 'source', 'status', 'value_cents', 'assigned_to', 'appointment_at', 'created_at']
    insert('leads', { name: 'Karen Whitfield', email: 'karen@example.com', phone: '757-555-0101', address: '77 Cedar Rd', city: 'Chesapeake', service: 'French Drain Installation', message: 'Water pools by the back patio for days after rain.', source: 'Website', status: 'new', created_at: addDays(today(), -2) + ' 09:12:00' }, lc)
    insert('leads', { name: 'Mike Ortiz', email: 'mike@example.com', phone: '757-555-0102', address: '3 Shore Dr', city: 'Virginia Beach', service: 'Outdoor Sump Pumps', message: 'Low lot, need a sump.', source: 'Google', status: 'new', created_at: addDays(today(), 0) + ' 07:40:00' }, lc)
    insert('leads', { name: 'Dana Brooks', email: 'dana@example.com', phone: '757-555-0103', address: '450 Hanbury Rd', city: 'Chesapeake', service: 'Grading Services', source: 'Referral', status: 'appointment', assigned_to: ownerId, appointment_at: at(1, '15:00'), value_cents: $(4500), created_at: addDays(today(), -4) + ' 10:00:00' }, lc)
    insert('leads', { name: 'Paul Greene', email: 'paul@example.com', phone: '757-555-0104', city: 'Portsmouth', service: 'Exterior Waterproofing', source: 'Facebook', status: 'contacted', value_cents: $(9000), created_at: addDays(today(), -6) + ' 14:00:00' }, lc)
    insert('leads', { name: 'Steve Lang', phone: '757-555-0105', city: 'Hampton', service: 'Hydrojet Cleanout', source: 'Yelp', status: 'lost', created_at: addDays(today(), -25) + ' 14:00:00' }, lc)
    insert('tasks', { title: 'Order catch basins for Harbor View', due_date: today(), user_id: office }, ['title', 'due_date', 'user_id'])
  })
  console.log('Demo data added.')
}

seedItems()
if (process.argv.includes('--demo')) seedDemo()
