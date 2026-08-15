import { SITE, NAV, HOURS, SERVICES, AREAS } from './data.js'
import { icon, iconFilled, logoMark } from './icons.js'

export function head({ title, description, path = '/' }) {
  const url = SITE.domain + path
  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${url}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:type" content="website">
<meta property="og:url" content="${url}">
<meta property="og:site_name" content="${SITE.name}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/style.css">`
}

export function jsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    name: SITE.name,
    description: 'Professional French drains, yard grading and drainage installation across Chesapeake, Virginia Beach, Norfolk and northeastern NC. Veteran owned. Free estimates. 5.0★ from 105 reviews.',
    url: SITE.domain + '/',
    telephone: SITE.phone,
    email: SITE.email,
    address: { '@type': 'PostalAddress', addressLocality: SITE.addressLocality, addressRegion: SITE.addressRegion, postalCode: SITE.postalCode, addressCountry: 'US' },
    aggregateRating: { '@type': 'AggregateRating', ratingValue: SITE.rating, reviewCount: SITE.reviewCount },
    areaServed: AREAS.map((a) => ({ '@type': 'City', name: a.name })),
    makesOffer: SERVICES.map((s) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.name } })),
  }
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`
}

export function header() {
  const links = NAV.map((n) => `<a href="${n.href}">${n.label}</a>`).join('')
  return `<header class="nav">
  <div class="wrap-wide nav-in">
    <a href="/" class="nav-logo" aria-label="${SITE.name} home">${logoMark(38)}<span>Rain Drains</span></a>
    <nav class="nav-links" aria-label="Main">${links}</nav>
    <div class="nav-cta">
      <a class="nav-phone desktop-only" href="tel:${SITE.phoneTel}">${iconFilled('phone')} ${SITE.phone}</a>
      <a class="btn btn-primary desktop-only" href="/contact-1/">Free Estimate</a>
      <button class="burger" id="burger" aria-label="Open menu" aria-expanded="false"><span></span><span></span><span></span></button>
    </div>
  </div>
</header>
<div class="drawer" id="drawer" role="dialog" aria-modal="true" aria-label="Menu">
  <div class="drawer-top">${logoMark(34)}<span class="drawer-word">Rain Drains</span><button class="drawer-close" id="drawerClose" aria-label="Close menu">&times;</button></div>
  ${links}
  <a class="btn btn-primary btn-lg" href="tel:${SITE.phoneTel}">Call ${SITE.phone}</a>
</div>`
}

let formCounter = 0
export function quoteForm() {
  formCounter += 1
  const id = `qf${formCounter}`
  return `<div class="form-card">
    <h3>Get Your Free Estimate</h3>
    <p class="sub">Tell us what is happening and we will come take a look. No obligation.</p>
    <iframe id="markate-widget-contact-iframe-${id}" title="Request a free estimate" src="https://www.markate.com/public/widget/contact?id=0b44f8bf20c7002c4de1e97412db9aca:70944:82a413a6" width="100%" height="1800" scrolling="no" frameborder="0" allowtransparency="true" style="border:none;overflow:hidden;display:block"></iframe>
  </div>`
}

export function footer() {
  const svcLinks = SERVICES.slice(0, 7).map((s) => `<a href="/${s.slug}/">${s.name}</a>`).join('')
  const areaLinks = AREAS.slice(0, 7).map((a) => `<a href="/${a.slug}/">${a.name}</a>`).join('')
  const hours = HOURS.map(([d, h]) => `<div class="foot-hours"><span>${d}</span><span>${h}</span></div>`).join('')
  return `<footer class="foot">
  <div class="wrap">
    <div class="foot-grid">
      <div class="foot-brand">
        <div class="foot-logo">${logoMark(34)}<span>Rain Drains</span></div>
        <p>Professional drainage design and installation across southeastern Virginia and northeastern North Carolina. Veteran owned and operated.</p>
        <p><a href="tel:${SITE.phoneTel}" style="color:#fff;font-weight:800;font-size:18px;padding:0">${SITE.phone}</a></p>
        <p><a href="mailto:${SITE.email}" style="padding:0">${SITE.email}</a></p>
      </div>
      <div>
        <h4>Services</h4>
        ${svcLinks}
        <a href="/services-1/" style="color:var(--blue);font-weight:800">View all →</a>
      </div>
      <div>
        <h4>Service Areas</h4>
        ${areaLinks}
        <a href="/service-areas/" style="color:var(--blue);font-weight:800">View all →</a>
      </div>
      <div>
        <h4>Hours</h4>
        ${hours}
      </div>
    </div>
    <div class="foot-bottom">
      <div>© ${SITE.year} ${SITE.name}. All rights reserved.</div>
      <div class="lic"><span>VA Contractors License 2705193711</span><span>NDS Certified</span><span>Fully Insured</span></div>
    </div>
  </div>
</footer>
<a class="btn btn-green float-cta" href="/contact-1/">Get a Free Estimate</a>
<a class="callbar" href="tel:${SITE.phoneTel}">📞 Call Now — ${SITE.phone}</a>`
}

export function pageScripts() {
  return `<script src="/js/main.js" defer></script>`
}

export function ctaSection(heading = 'Ready to keep your property dry?', sub = 'Free on-site estimate. No obligation. Most jobs done in a single day.') {
  return `<section class="cta">
  <div class="wrap">
    <h2>${heading}</h2>
    <p>${sub}</p>
    <div class="btns">
      <a class="btn btn-green btn-lg" href="/contact-1/">Get a Free Estimate</a>
      <a class="btn btn-ghost btn-lg" href="tel:${SITE.phoneTel}">Call ${SITE.phone}</a>
    </div>
  </div>
</section>`
}

export function trustbar() {
  return `<div class="trustbar"><div class="wrap"><ul><li>Veteran Owned</li><li>Fully Insured</li><li>NDS Certified</li><li>Free Estimates</li></ul></div></div>`
}

export function pageHero({ eyebrow, title, lead, tight = false }) {
  return `<section class="pagehero ${tight ? 'tight' : ''}">
  <div class="wrap">
    <span class="eyebrow eyebrow-onnavy">${eyebrow}</span>
    <h1>${title}</h1>
    ${lead ? `<p class="lead">${lead}</p>` : ''}
  </div>
</section>`
}

export function layout({ title, description, path, bodyClass = '', content }) {
  return `<!doctype html>
<html lang="en">
<head>
${head({ title, description, path })}
${jsonLd()}
</head>
<body class="${bodyClass}">
${header()}
<main>
${content}
</main>
${footer()}
${pageScripts()}
</body>
</html>`
}
