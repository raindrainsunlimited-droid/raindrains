import { SITE, NAV, HOURS, SERVICES, AREAS, SOCIAL, CARE_GUIDE_URL } from './data.js'
import { icon, iconFilled } from './icons.js'

export function socialLinks(size = 18, cls = '') {
  return SOCIAL.map((s) => `<a class="${cls}" href="${s.url}" target="_blank" rel="noopener noreferrer" aria-label="Rain Drains on ${s.name}">${iconFilled(s.icon, size)}</a>`).join('')
}

const LOGO_RATIO = 900 / 187
export function logoImg(height = 40, onDark = false) {
  const width = Math.round(height * LOGO_RATIO)
  const src = onDark ? '/img/logo-transparent.png' : '/img/logo.png'
  return `<img src="${src}" alt="Rain Drains" width="${width}" height="${height}" style="height:${height}px;width:auto">`
}

export function head({ title, description, path = '/', image }) {
  const url = SITE.domain + path
  const imgUrl = image ? (image.startsWith('http') ? image : SITE.domain + image) : SITE.domain + '/img/hero-lawn.jpg'
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
<meta property="og:image" content="${imgUrl}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${imgUrl}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/img/logo.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/style.css">`
}

function to24h(t) {
  const m = t.trim().match(/(\d+):(\d+)\s*(AM|PM)/i)
  if (!m) return null
  let h = parseInt(m[1], 10)
  const min = m[2]
  const ap = m[3].toUpperCase()
  if (ap === 'PM' && h !== 12) h += 12
  if (ap === 'AM' && h === 12) h = 0
  return `${String(h).padStart(2, '0')}:${min}`
}

function stripHtml(s) {
  return s.replace(/<[^>]+>/g, '')
}

function businessJsonLd() {
  const openingHoursSpecification = HOURS
    .map(([day, hours]) => {
      const [openStr, closeStr] = hours.split('–').map((x) => x && x.trim())
      const opens = openStr && to24h(openStr)
      const closes = closeStr && to24h(closeStr)
      if (!opens || !closes) return null
      return { '@type': 'OpeningHoursSpecification', dayOfWeek: `https://schema.org/${day}`, opens, closes }
    })
    .filter(Boolean)
  return {
    '@type': 'HomeAndConstructionBusiness',
    '@id': SITE.domain + '/#business',
    name: SITE.name,
    description: `Professional French drains, yard grading and drainage installation across Chesapeake, Virginia Beach, Norfolk and northeastern NC. Veteran owned. Free estimates. 5.0★ from ${SITE.reviewCountDisplay} reviews.`,
    url: SITE.domain + '/',
    telephone: SITE.phone,
    email: SITE.email,
    image: SITE.domain + '/img/hero-lawn.jpg',
    address: { '@type': 'PostalAddress', addressLocality: SITE.addressLocality, addressRegion: SITE.addressRegion, postalCode: SITE.postalCode, addressCountry: 'US' },
    aggregateRating: { '@type': 'AggregateRating', ratingValue: SITE.rating, reviewCount: SITE.reviewCount },
    areaServed: AREAS.map((a) => ({ '@type': 'City', name: a.name })),
    makesOffer: SERVICES.map((s) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.name } })),
    sameAs: SOCIAL.map((s) => s.url),
    openingHoursSpecification,
  }
}

export function faqJsonLd(faqs) {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: stripHtml(f.q), acceptedAnswer: { '@type': 'Answer', text: stripHtml(f.a) } })),
  }
}

export function serviceJsonLd(s, path) {
  return {
    '@type': 'Service',
    name: s.name,
    description: s.short,
    url: SITE.domain + path,
    provider: { '@id': SITE.domain + '/#business' },
    areaServed: AREAS.map((a) => ({ '@type': 'City', name: a.name })),
  }
}

export function breadcrumbJsonLd(items) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: item.name, item: SITE.domain + item.path })),
  }
}

export function jsonLd(extra = []) {
  const data = { '@context': 'https://schema.org', '@graph': [businessJsonLd(), ...extra] }
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`
}

export function header() {
  const links = NAV.map((n) => `<a href="${n.href}">${n.label}</a>`).join('')
  return `<div class="topbar">
  <div class="wrap-wide topbar-in">
    <a class="topbar-phone" href="tel:${SITE.phoneTel}">${iconFilled('phone', 13)} ${SITE.phone}</a>
    <div class="social-links">${socialLinks(16)}</div>
  </div>
</div>
<header class="nav">
  <div class="wrap-wide nav-in">
    <a href="/" class="nav-logo" aria-label="${SITE.name} home">${logoImg(40)}</a>
    <nav class="nav-links" aria-label="Main">${links}</nav>
    <div class="nav-cta">
      <a class="nav-phone desktop-only" href="tel:${SITE.phoneTel}">${iconFilled('phone')} ${SITE.phone}</a>
      <a class="btn btn-primary desktop-only" href="/contact-1/">Free Estimate</a>
      <button class="burger" id="burger" aria-label="Open menu" aria-expanded="false"><span></span><span></span><span></span></button>
    </div>
  </div>
</header>
<div class="drawer" id="drawer" role="dialog" aria-modal="true" aria-label="Menu">
  <div class="drawer-top">${logoImg(32, true)}<button class="drawer-close" id="drawerClose" aria-label="Close menu">&times;</button></div>
  ${links}
  <a class="btn btn-primary btn-lg" href="tel:${SITE.phoneTel}">Call ${SITE.phone}</a>
  <div class="social-links drawer-social">${socialLinks(20)}</div>
</div>`
}

export function quoteForm() {
  return `<div class="form-card">
    <h3>Get Your Free Estimate</h3>
    <p class="sub">Tell us what is happening and we will come take a look. No obligation.</p>
    <div id="markate-widget-contact"></div>
    <script>(function () {
      function loadMarkateWidget() {
        var s = document.createElement('script')
        s.type = 'text/javascript'
        s.async = true
        var u = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'www.markate.com/public/widget/contact/js'
        var t = Math.random() * 10000000000000000
        s.src = u + '?id=0b44f8bf20c7002c4de1e97412db9aca:70944:82a413a6&ref=' + encodeURIComponent(window.location.href) + '&t=' + t
        var w = document.getElementById('markate-widget-contact')
        w.parentNode.insertBefore(s, w)
      }
      if (window.attachEvent) { window.attachEvent('onload', loadMarkateWidget) } else { window.addEventListener('load', loadMarkateWidget, false) }
    })();</script>
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
        <div class="foot-logo">${logoImg(36, true)}</div>
        <p>Professional drainage design and installation across southeastern Virginia and northeastern North Carolina. Veteran owned and operated.</p>
        <p><a href="tel:${SITE.phoneTel}" style="color:#fff;font-weight:800;font-size:18px;padding:0">${SITE.phone}</a></p>
        <p><a href="mailto:${SITE.email}" style="padding:0">${SITE.email}</a></p>
        <p><a href="${CARE_GUIDE_URL}" download style="padding:0;display:inline-flex;align-items:center;gap:6px">${icon('document', 15)} Download Care Guide (PDF)</a></p>
        <h4 style="margin:20px 0 12px">Follow Us</h4>
        <div class="social-links lg">${socialLinks(22)}</div>
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
      <div class="lic"><span>VA Contractors License 2705198697</span><span>NDS Certified</span><span>Fully Insured</span></div>
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

export function pageHero({ eyebrow, title, lead, tight = false }) {
  return `<section class="pagehero ${tight ? 'tight' : ''}">
  <div class="wrap">
    <span class="eyebrow eyebrow-onnavy">${eyebrow}</span>
    <h1>${title}</h1>
    ${lead ? `<p class="lead">${lead}</p>` : ''}
  </div>
</section>`
}

export function layout({ title, description, path, bodyClass = '', content, image, jsonLdExtra = [] }) {
  return `<!doctype html>
<html lang="en">
<head>
${head({ title, description, path, image })}
${jsonLd(jsonLdExtra)}
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
