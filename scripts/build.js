import { mkdirSync, writeFileSync, rmSync, cpSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { SITE, SERVICES, AREAS, REVIEWS, FAQS, PROCESS_STEPS, PAST_PROJECTS, CARE_GUIDE_URL, AREA_SERVICES } from '../src/data.js'
import { layout, quoteForm, footer, header, pageScripts, ctaSection, pageHero, jsonLd, head, gtmNoscript, faqJsonLd, serviceJsonLd, breadcrumbJsonLd } from '../src/partials.js'
import { icon, iconFilled } from '../src/icons.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DIST = join(ROOT, 'public')

function write(path, html) {
  const full = join(DIST, path)
  mkdirSync(dirname(full), { recursive: true })
  writeFileSync(full, html)
}

function page(slug, html) {
  const path = slug === '' ? 'index.html' : `${slug}/index.html`
  write(path, html)
}

function svcImg(s) {
  return s.image
    ? `<img src="${s.image.src}" alt="${s.image.alt}" loading="lazy" width="400" height="260">`
    : icon(s.icon, 46)
}

function careGuideCallout() {
  return `
<section class="section">
  <div class="wrap">
    <div class="resource-card">
      <div class="resource-ic">${icon('document', 30)}</div>
      <div class="resource-body">
        <h3>Every installation comes with a Care Guide</h3>
        <p>A free, plain-English guide to keeping your new drainage system working for decades — what to check, what to avoid, and who to call if something ever looks off.</p>
      </div>
      <a class="btn btn-primary resource-btn" href="${CARE_GUIDE_URL}" download>Download Care Guide (PDF) →</a>
    </div>
  </div>
</section>
`
}

function processSection() {
  const stepsHtml = PROCESS_STEPS.map((s) => `
  <div class="step">
    <div class="n">${s.n}</div>
    <h3>${s.title}</h3>
    <p>${s.text}</p>
  </div>`).join('')
  return `
<section class="section bg-navy">
  <div class="wrap">
    <div class="section-head">
      <span class="eyebrow">Our Process</span>
      <h2 style="margin:16px 0 14px">Simple, and done in a day</h2>
      <p class="lead">Most residential drainage systems are designed, installed and cleaned up inside one business day.</p>
      <div class="rule"></div>
    </div>
    <div class="steps">${stepsHtml}</div>
  </div>
</section>
`
}

function reviewsSection(heading = 'What our neighbors say') {
  const revHtml = REVIEWS.map((r) => `
  <div class="rev">
    <div class="stars">★★★★★</div>
    <p>“${r.text}”</p>
    <div class="who"><strong>${r.name}</strong><span>${r.when}</span></div>
  </div>`).join('')
  return `
<section class="section bg-surface">
  <div class="wrap">
    <div class="section-head">
      <span class="eyebrow">Reviews</span>
      <h2 style="margin:16px 0 14px">${heading}</h2>
      <div class="rating-hero"><span class="big">${SITE.rating}</span><div><div class="stars" style="font-size:20px">★★★★★</div><div style="color:var(--text-muted);font-size:14.5px;font-weight:600">Based on ${SITE.reviewCountDisplay} verified reviews</div></div></div>
      <div class="rule"></div>
    </div>
    <div class="grid-3">${revHtml}</div>
    <div style="text-align:center;margin-top:34px;display:flex;gap:14px;justify-content:center;flex-wrap:wrap">
      <a class="btn btn-ghost" style="color:var(--navy);border-color:var(--border)" href="${SITE.googleReviewsUrl}" target="_blank" rel="noopener">Read all our reviews on Google →</a>
      <a class="btn btn-green" href="${SITE.googleWriteReviewUrl}" target="_blank" rel="noopener">Leave Us a Review →</a>
    </div>
  </div>
</section>
`
}

// ---------- Home ----------
function homePage() {
  const svcCards = [SERVICES[1], SERVICES[2], SERVICES[5]].map((s) => `
  <a class="svc" href="/${s.slug}/">
    <div class="svc-img${s.image ? ' svc-img-photo' : ''}">${svcImg(s)}</div>
    <div class="svc-body">
      <h3>${s.name}</h3>
      <p>${s.short}</p>
      <span class="svc-link">Learn more →</span>
    </div>
  </a>`).join('')

  const miniGridShort = SERVICES.slice(0, 6).map((s) => `
  <a class="mini" href="/${s.slug}/">
    <div class="mini-ic">${icon(s.icon, 22)}</div>
    <span>${s.name}</span>
  </a>`).join('')

  const content = `
<section class="hero">
  <div class="hero-bg">
    <img class="hero-slide" src="/img/hero-lawn.jpg" alt="A healthy, well-maintained lawn" fetchpriority="high" width="1920" height="960">
    <img class="hero-slide" src="/img/hero/residential3.jpg" alt="Rain Drains crew installing residential drainage in a front yard" loading="eager" width="1920" height="960">
    <img class="hero-slide" src="/img/hero/grading.jpg" alt="Freshly graded residential lot ready for sod" loading="eager" width="1920" height="960">
    <img class="hero-slide" src="/img/hero/gravel.jpg" alt="Compacted gravel pad installation beside a home" loading="eager" width="1920" height="960">
  </div>
  <div class="hero-overlay"></div>
  <div class="wrap hero-in">
    <div class="hero-copy">
      <div class="hero-trust"><span class="stars">★★★★★</span><span>${SITE.rating} from ${SITE.reviewCountDisplay} reviews · Veteran Owned</span></div>
      <h1>Hampton Roads' Premier Drainage Contractor</h1>
      <p>Professional drainage design and installation for residential, commercial and pool properties across southeastern Virginia and northeastern North Carolina.</p>
      <p class="hero-areas">Virginia Beach · Chesapeake · Norfolk · Portsmouth · Suffolk · Hampton &amp; more</p>
      <div class="hero-btns">
        <a class="btn btn-green btn-lg" href="#estimate">Get a Free Estimate</a>
        <a class="btn btn-ghost btn-lg" href="tel:${SITE.phoneTel}">Call ${SITE.phone}</a>
      </div>
      <div class="hero-badges">
        <div>${iconFilled('shield')} ${SITE.license}</div>
        <div>${iconFilled('check')} NDS Certified</div>
      </div>
      <div class="hero-whatwedo">
        <span class="eyebrow eyebrow-onnavy">What We Do</span>
        <h2>Drainage solutions for every kind of property</h2>
        <p class="lead">Excess water isn't just a nuisance — it's a threat to the integrity, safety and value of your property. We design and install systems that move it somewhere else, permanently.</p>
        <div class="grid-4">${miniGridShort}</div>
        <a class="hero-whatwedo-link" href="/services-1/">View all 14 services →</a>
      </div>
      <div class="guar hero-guar">
        <span class="eyebrow" style="background:rgba(255,255,255,.18);color:#fff">Our Promise</span>
        <h2 style="margin:16px 0 0">100% Satisfaction Guarantee</h2>
        <p style="margin-top:16px">Craftsmanship and quality are our promise to you — backed by a lifetime warranty on select installed pipe systems.</p>
        <ul><li>Free, no-obligation on-site estimates</li><li>Lifetime warranty on select installed pipe systems</li><li>Smooth-wall piping designed to last a lifetime</li><li>Permits researched and obtained for you</li><li>NDS Certified Professional Drainage Contractor</li><li>DPOR Licensed Landscape Service Contractor (License No. ${SITE.license.replace('VA Lic. ', '')})</li><li><a class="inline-link" href="${CARE_GUIDE_URL}" download>Care Guide</a> supplied with every installation</li></ul>
      </div>
    </div>
    <div id="estimate">${quoteForm()}</div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="grid-3">${svcCards}</div>
  </div>
</section>

${reviewsSection()}

${ctaSection()}
`
  page('', `<!doctype html>
<html lang="en">
<head>
${head({ title: "Rain Drains - Outdoor & French Drainage Installation Experts, Yard & Land Grading Services Virginia Beach & Chesapeake, Serving Southeastern VA & Northeastern NC", description: `Professional French drains, yard grading and drainage installation across Chesapeake, Virginia Beach, Norfolk and northeastern NC. Veteran owned. Free estimates. 5.0★ from ${SITE.reviewCountDisplay} reviews.`, path: '/' })}
${jsonLd()}
</head>
<body>
${gtmNoscript()}
${header()}
<main>${content}</main>
${footer()}
${pageScripts()}
</body>
</html>`)
}

// ---------- About ----------
function aboutPage() {
  const content = `
${pageHero({ eyebrow: 'About Us', title: 'A humble company born out of service to others', lead: 'Meet the veteran-owned team keeping Hampton Roads properties dry.' })}
<section class="section">
  <div class="wrap detail-grid">
    <div class="detail-body">
      <p>Rain Drains was born in 2019 from an idea that started as a home improvement project. Bryson noticed one of his neighbor's downspouts was washing out his pool concrete. Eager to save his friend from a concrete disaster, he designed his first downspout system to fix the drainage issue.</p>
      <p>As a Navy Veteran with a background in nuclear propulsion and an Old Dominion University graduate with a degree in Engineering, he has spent over 18 years in the engineering field. He has been certified by NDS as a Professional Drainage Contractor and is a Licensed Landscaping Service Contractor in the state of Virginia.</p>
      <p>At Rain Drains, we pride ourselves on craftsmanship, quality in design, and reliable professional service. We strive to treat all of our customers like our neighbors. We look forward to serving Hampton Roads now and into the future.</p>
      <p>Every system we design is sized for the specific soil, slope and water volume of your property — not a one-size-fits-all fix. That approach, backed by the highest quality materials, is why homeowners and businesses across southeastern Virginia and northeastern North Carolina trust us with their drainage.</p>
      <ul class="detail-bullets">
        <li>${icon('check', 18)} Navy Veteran owned and operated</li>
        <li>${icon('check', 18)} ODU Engineering graduate, 18+ years in the field</li>
        <li>${icon('check', 18)} NDS Certified Professional Drainage Contractor</li>
        <li>${icon('check', 18)} Licensed Landscaping Service Contractor, Virginia (2705198697)</li>
        <li>${icon('check', 18)} Fully insured, ${SITE.rating}★ from ${SITE.reviewCountDisplay} reviews</li>
      </ul>
    </div>
    <aside class="sidebar-card">
      <img src="/img/bryson.jpg" alt="Bryson Goforth, owner of Rain Drains" loading="lazy" style="border-radius:var(--r-md);width:100%;height:auto;display:block;margin-bottom:18px" width="768" height="1364">
      <h3>Talk to Bryson</h3>
      <p style="color:var(--text-muted);font-size:14px;margin-bottom:16px">Free on-site estimates, no obligation.</p>
      <a class="btn btn-green btn-block" href="/contact-1/" style="margin-bottom:10px">Get a Free Estimate</a>
      <a class="btn btn-ghost btn-block" style="color:var(--navy);border-color:var(--border)" href="tel:${SITE.phoneTel}">Call ${SITE.phone}</a>
    </aside>
  </div>
</section>
${ctaSection()}
`
  page('about-us-1', layout({ title: 'About Rain Drains - Veteran Owned Drainage Contractor Virginia Beach, Chesapeake, Virginia & North Carolina', description: "Meet Bryson Goforth, Navy Veteran, ODU Engineering graduate and founder of Rain Drains — Hampton Roads' NDS Certified drainage contractor.", path: '/about-us-1/', content, image: '/img/bryson.jpg', jsonLdExtra: [breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'About', path: '/about-us-1/' }])] }))
}

// ---------- Services index ----------
function servicesIndexPage() {
  const cards = SERVICES.map((s) => `
  <a class="svc" href="/${s.slug}/">
    <div class="svc-img${s.image ? ' svc-img-photo' : ''}">${svcImg(s)}</div>
    <div class="svc-body">
      <h3>${s.name}</h3>
      <p>${s.short}</p>
      <span class="svc-link">Learn more →</span>
    </div>
  </a>`).join('')
  const content = `
${pageHero({ eyebrow: 'Services', title: 'Drainage solutions for every kind of property', lead: 'From a single downspout fix to a full commercial site, here is everything we install.' })}
<section class="section"><div class="wrap"><div class="grid-3">${cards}</div></div></section>
${ctaSection()}
`
  page('services-1', layout({ title: 'All Services | Rain Drains', description: 'French drains, grading, downspout extensions, sump pumps and more — every drainage service Rain Drains offers across Hampton Roads.', path: '/services-1/', content, jsonLdExtra: [breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Services', path: '/services-1/' }])] }))
}

// ---------- Shared rich-content sections (used by service + area pages) ----------
function infoGrid(items) {
  return `<div class="info-grid">${items.map((it, i) => `
    <div class="info-card"><div class="num">${i + 1}</div><h4>${it.title}</h4><p>${it.text}</p></div>`).join('')}</div>`
}

function renderContentSections(entry, defaultOrder) {
  const subServicesHtml = entry.subServices ? `
<section class="section bg-surface">
  <div class="wrap">
    <div class="section-head">
      <span class="eyebrow">${entry.subServices.eyebrow || 'How It Works'}</span>
      <h2 style="margin:16px 0 14px">${entry.subServices.heading}</h2>
      <div class="rule"></div>
    </div>
    <div class="subserv-list">${entry.subServices.items.map((it) => `
      <div class="subserv-item">
        <h3>${it.title}</h3>
        <p>${it.intro}</p>
        ${it.bullets ? `<ul class="detail-bullets">${it.bullets.map((b) => `<li>${icon('check', 18)} ${b}</li>`).join('')}</ul>` : ''}
        ${it.outro ? `<p style="margin-top:14px">${it.outro}</p>` : ''}
      </div>`).join('')}
    </div>
  </div>
</section>` : ''

  const featuresHtml = entry.features ? `
<section class="section">
  <div class="wrap">
    <div class="section-head">
      <span class="eyebrow">${entry.features.eyebrow || 'Key Features'}</span>
      <h2 style="margin:16px 0 14px">${entry.features.heading}</h2>
      ${entry.features.intro ? `<p class="lead">${entry.features.intro}</p>` : ''}
      <div class="rule"></div>
    </div>
    ${infoGrid(entry.features.items)}
  </div>
</section>` : ''

  const challengesHtml = entry.challenges ? `
<section class="section bg-surface">
  <div class="wrap">
    <div class="section-head">
      <span class="eyebrow">${entry.challenges.eyebrow || 'Local Conditions'}</span>
      <h2 style="margin:16px 0 14px">${entry.challenges.heading}</h2>
      <p class="lead">${entry.challenges.intro}</p>
      <div class="rule"></div>
    </div>
    ${infoGrid(entry.challenges.items)}
  </div>
</section>` : ''

  const processHtml = entry.process ? `
<section class="section">
  <div class="wrap">
    <div class="section-head">
      <span class="eyebrow">Our Process</span>
      <h2 style="margin:16px 0 14px">${entry.process.heading}</h2>
      ${entry.process.intro ? `<p class="lead">${entry.process.intro}</p>` : ''}
      <div class="rule"></div>
    </div>
    ${infoGrid(entry.process.items)}
  </div>
</section>` : ''

  const faqHtml = entry.faqs ? `
<section class="section bg-surface">
  <div class="wrap" style="max-width:880px">
    <div class="section-head" style="text-align:center;margin:0 auto 40px">
      <span class="eyebrow">FAQ</span>
      <h2 style="margin:16px 0 14px">${entry.faqHeading || 'Frequently Asked Local Drainage Questions'}</h2>
    </div>
    ${entry.faqs.map((f, i) => `
    <div class="faq-item${i === 0 ? ' open' : ''}">
      <button class="faq-q" type="button">${f.q}<span class="ic">+</span></button>
      <div class="faq-a"><p>${f.a}</p></div>
    </div>`).join('')}
  </div>
</section>` : ''

  const areaListHtml = entry.areaList ? `
<section class="section">
  <div class="wrap">
    <div class="section-head">
      <span class="eyebrow">${entry.areaList.eyebrow || 'Service Areas'}</span>
      <h2 style="margin:16px 0 14px">${entry.areaList.heading}</h2>
      ${entry.areaList.intro ? `<p class="lead">${entry.areaList.intro}</p>` : ''}
      <div class="rule"></div>
    </div>
    <div class="area-chips">${entry.areaList.areas.map((name) => {
      const match = AREAS.find((a) => a.name === name)
      return match ? `<a class="area-chip" href="/${match.slug}/">${name}</a>` : `<span class="area-chip">${name}</span>`
    }).join('')}</div>
  </div>
</section>` : ''

  const noteHtml = entry.note ? `
<section class="section bg-surface">
  <div class="wrap" style="max-width:820px">
    <div class="section-head">
      <span class="eyebrow">${entry.note.eyebrow || 'Good to Know'}</span>
      <h2 style="margin:16px 0 14px">${entry.note.heading}</h2>
      <p class="lead">${entry.note.text}</p>
      <div class="rule"></div>
    </div>
  </div>
</section>` : ''

  const sections = { subServices: subServicesHtml, challenges: challengesHtml, features: featuresHtml, process: processHtml, faqs: faqHtml, areaList: areaListHtml, note: noteHtml }
  return (entry.sectionOrder || defaultOrder).map((key) => sections[key]).join('')
}

// ---------- Service detail pages ----------
function servicePages() {
  for (const s of SERVICES) {
    const others = SERVICES.filter((x) => x.slug !== s.slug).slice(0, 8)
    const bullets = s.bullets.map((b) => `<li>${icon('check', 18)} ${b}</li>`).join('')
    const body = s.body.map((p) => `<p>${p}</p>`).join('')
    const otherLinks = others.map((o) => `<a href="/${o.slug}/">${o.name}</a>`).join('')

    const photo = s.image
      ? `<img class="detail-photo" src="${s.image.src}" alt="${s.image.alt}" loading="lazy" width="1000" height="750">`
      : ''

    const content = `
${pageHero({ eyebrow: 'Services', title: s.name, lead: s.short, tight: true })}
<section class="section">
  <div class="wrap detail-grid">
    <div class="detail-body">
      ${photo}
      ${body}
      <ul class="detail-bullets">${bullets}</ul>
    </div>
    <aside class="sidebar-card">
      <h3>Other Services</h3>
      <div class="sidebar-list">${otherLinks}</div>
      <a class="btn btn-green btn-block" href="/contact-1/" style="margin-top:18px">Get a Free Estimate</a>
    </aside>
  </div>
</section>
${renderContentSections(s, ['subServices', 'challenges', 'features', 'process', 'faqs', 'areaList'])}
${ctaSection(s.cta?.heading || `Ready to solve your ${s.name.toLowerCase()} problem?`, s.cta?.sub)}
`
    const svcPath = `/${s.slug}/`
    const svcJsonLdExtra = [breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Services', path: '/services-1/' }, { name: s.name, path: svcPath }]), serviceJsonLd(s, svcPath)]
    if (s.faqs && s.faqs.length) svcJsonLdExtra.push(faqJsonLd(s.faqs))
    page(s.slug, layout({ title: s.seoTitle || `${s.name} | Rain Drains — Hampton Roads`, description: `${s.short} Serving Chesapeake, Virginia Beach, Norfolk & Hampton Roads. Free estimates, ${SITE.rating}★ rated.`, path: svcPath, content, image: s.image?.src, jsonLdExtra: svcJsonLdExtra }))
  }
}

// ---------- Service areas index ----------
function serviceAreasIndexPage() {
  const areaCards = AREAS.map((a) => `<a class="area" href="/${a.slug}/">${a.name}<em>${a.state}</em></a>`).join('')
  const content = `
${pageHero({ eyebrow: 'Service Areas', title: 'Serving southeastern Virginia & northeastern North Carolina', lead: 'Local crews, local permits, local knowledge of the clay and the water table.' })}
<section class="section"><div class="wrap"><div class="areas">${areaCards}</div></div></section>
${ctaSection()}
`
  page('service-areas', layout({ title: 'Service Areas | Rain Drains', description: 'Rain Drains serves Virginia Beach, Chesapeake, Norfolk, Portsmouth, Suffolk, Hampton, Newport News, Smithfield, Carrollton, and Currituck & Camden Counties, NC.', path: '/service-areas/', content, jsonLdExtra: [breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Service Areas', path: '/service-areas/' }])] }))
}

// ---------- Area detail pages ----------
function areaPages() {
  for (const a of AREAS) {
    const others = AREAS.filter((x) => x.slug !== a.slug).slice(0, 8)
    const otherLinks = others.map((o) => `<a href="/${o.slug}/">${o.name}, ${o.state}</a>`).join('')
    const svcLinks = SERVICES.slice(0, 8).map((s) => `<a href="/${s.slug}/">${s.name}</a>`).join('')

    const body = a.body
      ? a.body.map((p) => `<p>${p}</p>`).join('')
      : `<p>Rain Drains provides professional drainage design and installation throughout ${a.name}, ${a.state} — from French drains and yard grading to downspout extensions and commercial site drainage. Our crews know the local soil, water table and permitting requirements, so your system is built right the first time.</p>
      <p>Whether you're dealing with standing water after every storm, a soggy lawn, or water pushing against your foundation, we'll walk your ${a.name} property in person, diagnose the actual cause, and design a system sized for it — most residential jobs are installed and cleaned up in a single day.</p>
      <p>We're fully insured and NDS Certified.</p>`
    const bullets = a.bullets
      ? a.bullets.map((b) => `<li>${icon('check', 18)} ${b}</li>`).join('')
      : `<li>${icon('check', 18)} Free on-site estimates in ${a.name}</li>
        <li>${icon('check', 18)} Local permits researched & obtained</li>
        <li>${icon('check', 18)} Most residential jobs done in one day</li>`
    const photo = a.image
      ? `<img class="detail-photo" src="${a.image.src}" alt="${a.image.alt}" loading="lazy" width="1100" height="825">`
      : ''

    const content = `
${pageHero({ eyebrow: 'Service Area', title: a.heroTitle || `Drainage Contractor in ${a.name}, ${a.state}`, lead: a.short || `Free on-site drainage estimates for homes and businesses in ${a.name}.`, tight: true })}
<section class="section">
  <div class="wrap detail-grid">
    <div class="detail-body">
      ${photo}
      ${body}
      <ul class="detail-bullets">${bullets}</ul>
    </div>
    <aside class="sidebar-card">
      <h3>Services in ${a.name}</h3>
      <div class="sidebar-list">${svcLinks}</div>
      <a class="btn btn-green btn-block" href="/contact-1/" style="margin-top:18px">Get a Free Estimate</a>
    </aside>
  </div>
</section>
${renderContentSections(a, ['note', 'challenges', 'features', 'process', 'faqs', 'areaList'])}
<section class="section bg-surface">
  <div class="wrap">
    <div class="section-head"><span class="eyebrow">Nearby Areas</span><h2 style="margin:16px 0 0">We also serve</h2></div>
    <div class="areas">${AREAS.filter((x) => x.slug !== a.slug).map((o) => `<a class="area" href="/${o.slug}/">${o.name}<em>${o.state}</em></a>`).join('')}</div>
  </div>
</section>
${ctaSection(a.cta?.heading || `Ready to fix your drainage in ${a.name}?`, a.cta?.sub)}
`
    const areaPath = `/${a.slug}/`
    const areaJsonLdExtra = [breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Service Areas', path: '/service-areas/' }, { name: a.name, path: areaPath }])]
    if (a.faqs && a.faqs.length) areaJsonLdExtra.push(faqJsonLd(a.faqs))
    page(a.slug, layout({ title: a.seoTitle || `Drainage Contractor in ${a.name}, ${a.state} | Rain Drains`, description: `Professional French drains, grading and drainage installation in ${a.name}, ${a.state}. Veteran owned, NDS Certified, free estimates.`, path: areaPath, content, image: a.image?.src, jsonLdExtra: areaJsonLdExtra }))
  }
}

// ---------- Service pages nested under service areas ----------
// At the top of scripts/build.js, make sure AREA_SERVICES is imported:
// import { SITE, SERVICES, AREAS, REVIEWS, FAQS, PROCESS_STEPS, PAST_PROJECTS, CARE_GUIDE_URL, AREA_SERVICES } from '../src/data.js'

function areaServicePages() {
  if (!AREA_SERVICES || !AREA_SERVICES.length) return

  for (const p of AREA_SERVICES) {
    const area = AREAS.find((a) => a.slug === p.areaSlug)
    if (!area) continue

    const path = `/${p.areaSlug}/${p.slug}/`

    // Siblings in the same area for sidebar navigation
    const siblings = AREA_SERVICES.filter((x) => x.areaSlug === p.areaSlug && x.slug !== p.slug)
    const sidebarLinks = siblings.map((s) => `<a href="/${s.areaSlug}/${s.slug}/">${s.name}</a>`).join('')

    const introHtml = p.intro.map((para) => `<p>${para}</p>`).join('')
    const benefitsHtml = p.benefits ? `
      <h3 style="margin-top:24px">Benefits</h3>
      <ul class="detail-bullets">
        ${p.benefits.map((b) => `<li>${icon('check', 18)} ${b}</li>`).join('')}
      </ul>` : ''

    const content = `
${pageHero({ eyebrow: `${p.areaName} Drainage Services`, title: p.name + ` in ${p.areaName}, ${area.state}`, lead: p.lead, tight: true })}

<section class="section">
  <div class="wrap detail-grid">
    <div class="detail-body">
      <h2>${p.introHeading}</h2>
      ${introHtml}
      ${benefitsHtml}
    </div>

    <aside class="sidebar-card">
      <h3>${p.areaName} Drainage Services</h3>
      <div class="sidebar-list">
        ${sidebarLinks}
        <a href="/${area.slug}/">All ${p.areaName} Services</a>
      </div>
      <a class="btn btn-green btn-block" href="/contact-1/" style="margin-top:18px">
        Get a Free Estimate
      </a>
    </aside>
  </div>
</section>

${renderContentSections(p, ['features', 'process', 'faqs'])}

${ctaSection(`Need ${p.name.toLowerCase()} in ${p.areaName}?`, 'Contact Rain Drains LLC for a free on-site estimate.')}
`

    const jsonLdExtra = [
      breadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'Service Areas', path: '/service-areas/' },
        { name: area.name, path: `/${area.slug}/` },
        { name: p.name, path }
      ])
    ]
    if (p.faqs && p.faqs.length) {
      jsonLdExtra.push(faqJsonLd(p.faqs))
    }

    page(`${p.areaSlug}/${p.slug}`, layout({
      title: p.seoTitle,
      description: p.metaDescription,
      path,
      content,
      jsonLdExtra
    }))
  }
}

// ---------- Past Projects ----------
function pastProjectsPage() {
  const items = PAST_PROJECTS.map((p, i) => {
    const full = p.src.replace('/gallery/', '/gallery/large/')
    return `<button type="button" class="gal-item" data-full="${full}" data-alt="${p.alt}" data-index="${i}" aria-label="View full-size: ${p.alt}"><img src="${p.src}" alt="${p.alt}" loading="lazy" width="320" height="320"></button>`
  }).join('')
  const content = `
${pageHero({ eyebrow: 'Our Work', title: 'Browse our completed drainage projects', lead: "See how we've helped homeowners and businesses across Hampton Roads solve their water issues. Click any photo to see it full-size." })}
<section class="section"><div class="wrap"><div class="gal">${items}</div></div></section>
${processSection()}
${careGuideCallout()}
${reviewsSection('What our customers say about the work')}
${ctaSection('Want your property to look this good?', 'Free on-site estimate. No obligation.')}
<div class="lightbox" id="lightbox" aria-hidden="true">
  <button type="button" class="lb-close" id="lbClose" aria-label="Close">&times;</button>
  <button type="button" class="lb-nav lb-prev" id="lbPrev" aria-label="Previous photo">&#8249;</button>
  <img class="lb-img" id="lbImg" src="" alt="">
  <button type="button" class="lb-nav lb-next" id="lbNext" aria-label="Next photo">&#8250;</button>
</div>
`
  page('past-projects', layout({ title: 'Rain Drains Portfolio - Past Drainage Projects', description: 'Browse completed French drain, grading and drainage installation projects by Rain Drains across Hampton Roads and northeastern NC.', path: '/past-projects/', content, jsonLdExtra: [breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Our Work', path: '/past-projects/' }])] }))
}

// ---------- FAQ ----------
function faqPage() {
  let lastCat = null
  let globalIdx = 0
  const faqHtml = FAQS.map((f) => {
    const catHtml = f.cat !== lastCat ? `<h2 class="faq-cat${lastCat === null ? '' : ' faq-cat-mt'}">${f.cat}</h2>` : ''
    lastCat = f.cat
    const isFirst = globalIdx === 0
    const id = `faq-${globalIdx}`
    globalIdx++
    return `${catHtml}
  <div class="faq-item${isFirst ? ' open' : ''}">
    <h3 class="faq-q-h"><button class="faq-q" type="button" aria-expanded="${isFirst ? 'true' : 'false'}" aria-controls="${id}">${f.q}<span class="ic">+</span></button></h3>
    <div class="faq-a" id="${id}"><p>${f.a}</p></div>
  </div>`
  }).join('')
  const content = `
${pageHero({ eyebrow: 'FAQ', title: 'Frequently Asked Questions About Drainage & Grading', lead: "Pricing, scheduling, crawlspace water, licensing and more — straight answers from Rain Drains, Hampton Roads' drainage specialists." })}
<section class="section"><div class="wrap" style="max-width:880px">${faqHtml}
  <p style="text-align:center;margin-top:26px;color:var(--text-muted)">Didn't find what you're looking for? <a href="/contact-1/" style="color:var(--blue);font-weight:800">Get in touch</a></p>
</div></section>
${ctaSection()}
`
  page('faq', layout({ title: 'Rain Drains - Drainage FAQ: Pricing, Process & Warranty', description: 'Answers to common questions about drainage pricing, financing, scheduling, crawlspace flooding, permits and warranties from Rain Drains — Hampton Roads.', path: '/faq/', content, jsonLdExtra: [breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'FAQ', path: '/faq/' }]), faqJsonLd(FAQS)] }))
}

// ---------- Contact ----------
function contactPage() {
  const content = `
${pageHero({ eyebrow: 'Contact', title: 'Get Your Free Estimate', lead: 'Tell us what is happening and we will come take a look. No obligation.' })}
<section class="section">
  <div class="wrap detail-grid">
    <div>${quoteForm()}</div>
    <aside class="sidebar-card">
      <h3>Contact Info</h3>
      <p style="margin-bottom:10px"><a href="tel:${SITE.phoneTel}" style="font-weight:800;color:var(--navy)">${SITE.phone}</a></p>
      <p style="margin-bottom:18px"><a href="mailto:${SITE.email}" style="font-weight:700;color:var(--blue)">${SITE.email}</a></p>
      <h3>Hours</h3>
      <div style="margin-top:10px">
        ${[['Mon–Fri','7:00 AM – 5:00 PM'],['Saturday','By appointment'],['Sunday','Closed']].map(([d,h])=>`<div class="foot-hours" style="color:var(--ink)"><span style="color:var(--navy)">${d}</span><span>${h}</span></div>`).join('')}
      </div>
    </aside>
  </div>
</section>
`
  page('contact-1', layout({ title: 'Contact Rain Drains - Drainage Services Virginia Beach, Chesapeake, Virginia & North Carolina', description: 'Request your free on-site drainage estimate from Rain Drains. Call 757-807-0080 or send us your details — we usually reply the same day.', path: '/contact-1/', content, jsonLdExtra: [breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact-1/' }])] }))
}

// ---------- Sitemap & robots ----------
function allPageSlugs() {
  const staticSlugs = ['', 'about-us-1', 'services-1', 'service-areas', 'past-projects', 'faq', 'contact-1']
  const areaServiceSlugs = [ 'virginia-beach/french-drains', 'virginia-beach/pool-liner-repair', 'virginia-beach/land-grading' ]

  return [...staticSlugs, ...SERVICES.map((s) => s.slug), ...AREAS.map((a) => a.slug), ...areaServiceSlugs]
}

function sitemapXml() {
  const urls = allPageSlugs().map((slug) => {
    const path = slug === '' ? '/' : `/${slug}/`
    return `  <url><loc>${SITE.domain}${path}</loc></url>`
  }).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

function robotsTxt() {
  return `User-agent: *\nAllow: /\n\nSitemap: ${SITE.domain}/sitemap.xml\n`
}

function llmsTxt() {
  const svcLines = SERVICES.map((s) => `- [${s.name}](${SITE.domain}/${s.slug}/): ${s.short}`).join('\n')
  const areaLines = AREAS.map((a) => `- [${a.name}, ${a.state}](${SITE.domain}/${a.slug}/)`).join('\n')
  return `# ${SITE.name}

> Veteran-owned drainage contractor serving southeastern Virginia and northeastern North Carolina. French drains, yard grading, downspout extensions, sump pumps, and related drainage and excavation services. NDS Certified Professional Drainage Contractor, licensed and insured in Virginia (${SITE.license}). ${SITE.rating}★ rating from ${SITE.reviewCountDisplay} reviews.

Phone: ${SITE.phone}
Email: ${SITE.email}

## Pages
- [Home](${SITE.domain}/)
- [About Us](${SITE.domain}/about-us-1/)
- [All Services](${SITE.domain}/services-1/)
- [Service Areas](${SITE.domain}/service-areas/)
- [Past Projects](${SITE.domain}/past-projects/)
- [FAQ](${SITE.domain}/faq/)
- [Contact](${SITE.domain}/contact-1/)

## Services
${svcLines}

## Service Areas
${areaLines}
`
}

// ---------- run ----------
function main() {
  rmSync(DIST, { recursive: true, force: true })
  mkdirSync(DIST, { recursive: true })

  homePage()
  aboutPage()
  servicesIndexPage()
  servicePages()
  serviceAreasIndexPage()
  areaPages()
  areaServicePages()
  pastProjectsPage()
  faqPage()
  contactPage()

  // static assets
  mkdirSync(join(DIST, 'css'), { recursive: true })
  mkdirSync(join(DIST, 'js'), { recursive: true })
  cpSync(join(ROOT, 'src/style.css'), join(DIST, 'css/style.css'))
  cpSync(join(ROOT, 'src/main.js'), join(DIST, 'js/main.js'))
  if (existsSync(join(ROOT, 'src/favicon.svg'))) {
    cpSync(join(ROOT, 'src/favicon.svg'), join(DIST, 'favicon.svg'))
  }
  if (existsSync(join(ROOT, 'src/img'))) {
    cpSync(join(ROOT, 'src/img'), join(DIST, 'img'), { recursive: true })
  }
  if (existsSync(join(ROOT, 'src/files'))) {
    cpSync(join(ROOT, 'src/files'), join(DIST, 'files'), { recursive: true })
  }
  if (existsSync(join(ROOT, 'src/_redirects'))) {
    cpSync(join(ROOT, 'src/_redirects'), join(DIST, '_redirects'))
  }
  writeFileSync(join(DIST, 'sitemap.xml'), sitemapXml())
  writeFileSync(join(DIST, 'robots.txt'), robotsTxt())
  writeFileSync(join(DIST, 'llms.txt'), llmsTxt())

  console.log('Built site to /public')
}

main()
