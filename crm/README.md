# Rain Drains CRM

A field-service CRM built for Rain Drains: leads → estimates → jobs → invoices → payments, with scheduling, crews, and reports. It covers what Markate does and adds the things a drainage company actually needs.

## Run it locally

```bash
cd crm
npm install
npm run seed        # loads the price book (placeholder prices — edit them in the app)
npm start           # http://localhost:4000
```

The first visit asks you to create the owner account. To explore with sample data instead, run `npm run seed:demo` on an empty database and sign in as `owner@demo.local` / `raindrains`.

Requires Node 22.13+. The database is built-in SQLite, stored in `crm/data/` (set `DATA_DIR` to move it). **Back up that folder**; it holds everything, including uploaded photos.

## What's in it

| Area | Markate parity | Better than Markate |
|---|---|---|
| **Leads** | Lead list, statuses, sources | Drag-and-drop pipeline board; website form posts straight in with page + UTM campaign tracking; stale-lead alerts; estimate-appointment booking on the calendar |
| **Customers** | Contacts, history, notes | One timeline of every call/text/note/event; balance + lifetime value; one-tap call/text/directions; CSV import from Markate with duplicate detection |
| **Estimates** | Line items from price book, send, e-sign | **Optional add-ons customers can tick on approval** (upsells); deposit %; live cost/profit margin per estimate; "viewed" tracking; auto-follow-up flags |
| **Jobs** | Work orders, status, crew, photos | **Drainage specs** (linear ft, pipe, depth, discharge, basins, soil); **Miss Utility ticket tracking with expiry alerts**; job checklists; photos auto-shrunk from phones |
| **Schedule** | Calendar & dispatch | Drag-and-drop week board, color by crew, unscheduled-jobs tray, estimate appointments shown alongside |
| **Invoices** | Create, send, record payments | One click from approved estimate/job; partial payments; void; A/R aging |
| **Reviews** | — | After every completed job, one-tap "text the Google review link" + dashboard reminders |
| **Dashboard** | KPIs | **Action center**: uncontacted leads, estimates to chase, approved work to schedule, done-but-not-invoiced jobs, overdue invoices, missing utility tickets |
| **Reports** | Revenue | Revenue by service (with margin), by city/service area, lead-source win rates, close rate, crew output, A/R aging, CSV export |
| **Crew access** | Tech app | Crew role sees only their jobs — no prices — on a phone-first "My jobs" screen |

## Moving off Markate

1. **Customers:** Markate → Customers → Export CSV, then CRM → Settings → *Import from Markate*.
2. **Numbering:** In Settings, set *Next invoice #* / *Next estimate #* above your last Markate numbers.
3. **Price book:** Edit the seeded items (Price Book) to your real prices and costs.
4. **Website form:** Settings → *Website lead form* gives you a snippet to replace the Markate widget on raindrainsva.com (`src/partials.js` → `quoteForm()`). Set *Allowed website origins* to your site's domain first.

## Getting paid online

**PayPal** (Settings → Online payments): customers get a *Pay now* button on invoices (card, PayPal, Venmo), and a *Pay deposit* button right after they sign an estimate that has a deposit %. The amount is always set by the server, each payment is checked against the document it was made for, and it's recorded on the invoice automatically. A deposit and the final balance land on the same invoice, so nothing is billed twice. You need a PayPal Business account, plus a Live app's Client ID and Secret from developer.paypal.com. You can also set `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` as environment variables instead of saving them in Settings.

**Wisetack** (Settings → Customer financing): paste the application link from your Wisetack merchant account. Estimates and invoices over your minimum show *See financing options*, and each click is logged on the customer's timeline. Wisetack only offers an API to approved software partners, so record funded loans with *Record payment → Wisetack financing*.

## Deploying

The CRM needs a server with a **persistent disk**, so it can't run on Netlify/Vercel like the marketing site. Good options are Render, Railway, or Fly.io (all about $5–10 a month):

- **Render:** New Web Service from this repo, root directory `crm`, build `npm install`, start `npm start`. Add a Disk mounted at `/data` and set env `DATA_DIR=/data`.
- **Docker anywhere:** `docker build -t rd-crm crm && docker run -p 4000:4000 -v rd-crm-data:/data rd-crm`

Put it on a subdomain like `crm.raindrainsva.com` with HTTPS (cookies are marked secure automatically behind HTTPS).

## Tests

```bash
npm test
```

## Layout

```
crm/
  server.js            Express app
  lib/db.js            SQLite schema + settings
  lib/api.js           Authenticated JSON API
  lib/public.js        Website lead intake + customer portal API
  lib/docs.js          Estimate/invoice math
  lib/auth.js          scrypt passwords, cookie sessions
  public/              Single-page app (no build step) + portal.html
  scripts/seed.js      Price book + demo data
  test/                Integration tests
```
