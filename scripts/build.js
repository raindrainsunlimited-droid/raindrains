import { mkdirSync, writeFileSync, rmSync, cpSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { SITE, SERVICES, AREAS, REVIEWS, FAQS, PROCESS_STEPS } from '../src/data.js'
import { layout, quoteForm, footer, header, pageScripts, ctaSection, trustbar, pageHero, jsonLd, head } from '../src/partials.js'
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

// ---------- Home ----------
function homePage() {
  const svcCards = [SERVICES[1], SERVICES[2], SERVICES[12]].map((s) => `
  <a class="svc" href="/${s.slug}/">
    <div class="svc-img">${icon(s.icon, 46)}</div>
    <div class="svc-body">
      <h3>${s.name}</h3>
      <p>${s.short}</p>
      <span class="svc-link">Learn more →</span>
    </div>
  </a>`).join('')

  const miniGrid = SERVICES.map((s) => `
  <a class="mini" href="/${s.slug}/">
    <div class="mini-ic">${icon(s.icon, 22)}</div>
    <span>${s.name}</span>
  </a>`).join('')

  const galItems = Array.from({ length: 16 }).map((_, i) => `<a href="/past-projects/" aria-label="Completed Rain Drains drainage project">${icon('drop', 26)}</a>`).join('')

  const stepsHtml = PROCESS_STEPS.map((s) => `
  <div class="step">
    <div class="n">${s.n}</div>
    <h3>${s.title}</h3>
    <p>${s.text}</p>
  </div>`).join('')

  const revHtml = REVIEWS.map((r) => `
  <div class="rev">
    <div class="stars">★★★★★</div>
    <p>“${r.text}”</p>
    <div class="who"><strong>${r.name}</strong><span>${r.when}</span></div>
  </div>`).join('')

  const areasHtml = AREAS.map((a) => `<a class="area" href="/${a.slug}/">${a.name}<em>${a.state}</em></a>`).join('')

  const faqHtml = FAQS.map((f, i) => `
  <div class="faq-item${i === 0 ? ' open' : ''}">
    <button class="faq-q" type="button">${f.q}<span class="ic">+</span></button>
    <div class="faq-a"><p>${f.a}</p></div>
  </div>`).join('')

  const content = `
<section class="hero">
  <div class="hero-bg" style="background:radial-gradient(circle at 30% 20%,rgba(255,255,255,.08),transparent 60%)"></div>
  <div class="wrap hero-in">
    <div class="hero-copy">
      <div class="hero-trust"><span class="stars">★★★★★</span><span>${SITE.rating} from ${SITE.reviewCount} reviews · Veteran Owned</span></div>
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
    </div>
    <div id="estimate">${quoteForm()}</div>
  </div>
</section>

${trustbar()}

<section class="section">
  <div class="wrap">
    <div class="section-head">
      <span class="eyebrow">What We Do</span>
      <h2>Drainage solutions for every kind of property</h2>
      <p class="lead">Excess water isn't just a nuisance — it's a threat to the integrity, safety and value of your property. We design and install systems that move it somewhere else, permanently.</p>
      <p style="color:var(--text-muted);font-size:15.5px;line-height:1.7;margin-top:14px">Rain Drains provides professional residential and commercial drainage solutions across southeastern Virginia and northeastern North Carolina. From standing water in lawns to flooded parking lots, overflowing gutter systems, and water intrusion into basements or crawl spaces, unmanaged drainage can lead to costly foundation damage, structural issues, landscape erosion, and liability risks. Our team designs and installs effective systems — including French drains, buried downspout extensions, catch basins, and full property-wide drainage systems — to protect homes, apartment complexes, office buildings, and retail spaces. Whether you're a homeowner or a property manager, Rain Drains delivers customized, code-compliant drainage solutions that keep your property dry, functional, and protected year-round.</p>
      <div class="rule"></div>
    </div>
    <div class="grid-3">${svcCards}</div>
    <div style="margin-top:44px">
      <h3 style="color:var(--navy);margin-bottom:18px;font-size:19px">Every service we offer</h3>
      <div class="grid-4">${miniGrid}</div>
    </div>
  </div>
</section>

<section class="section bg-surface">
  <div class="wrap grid-2">
    <div>
      <span class="eyebrow">About Rain Drains</span>
      <h2 style="margin:16px 0 18px;color:var(--navy)">A humble company born out of service to others.</h2>
      <p class="lead" style="margin-bottom:16px">Rain Drains was born in 2019 from an idea that started as a home improvement project. Bryson noticed one of his neighbour's downspouts was washing out his pool concrete. Eager to save his friend from a concrete disaster, he designed his first downspout system to fix the drainage issue.</p>
      <p class="lead" style="margin-bottom:16px">As a Navy Veteran and an Old Dominion University graduate with a degree in Engineering, he has spent over 17 years in the engineering field. He has been certified by NDS as a Professional Drainage Contractor and is a Licensed Landscaping Service Contractor in the state of Virginia.</p>
      <p class="lead" style="margin-bottom:16px">At Rain Drains, we pride ourselves on craftsmanship, quality in design, and reliable professional service. We strive to treat all of our customers like our neighbours. We look forward to serving Hampton Roads now and into the future.</p>
      <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:26px">
        <a class="btn btn-primary" href="/about-us-1/">More About Us</a>
        <a class="btn btn-ghost" style="color:var(--navy);border-color:var(--border)" href="/past-projects/">See Our Work</a>
      </div>
    </div>
    <div>
      <div style="border-radius:var(--r-lg);box-shadow:var(--shadow-lg);width:100%;aspect-ratio:4/3;background:linear-gradient(135deg,var(--navy),var(--blue));display:flex;align-items:center;justify-content:center;color:#fff">${icon('home', 88)}</div>
      <p style="text-align:center;margin-top:14px;font-size:14px;color:var(--text-muted);font-weight:600">Bryson Goforth — Owner · Navy Veteran · ODU Engineering</p>
    </div>
  </div>
</section>

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

<section class="section">
  <div class="wrap">
    <div class="section-head">
      <span class="eyebrow">Our Work</span>
      <h2 style="margin:16px 0 14px">Browse our completed drainage projects</h2>
      <p class="lead">See how we've helped homeowners and businesses across Hampton Roads solve their water issues.</p>
      <div class="rule"></div>
    </div>
    <div class="gal">${galItems}</div>
    <div style="text-align:center;margin-top:34px"><a class="btn btn-primary btn-lg" href="/past-projects/">View All Projects</a></div>
  </div>
</section>

<section class="section-tight">
  <div class="wrap">
    <div class="guar">
      <span class="eyebrow" style="background:rgba(255,255,255,.18);color:#fff">Our Promise</span>
      <h2 style="margin:16px 0 0">100% Satisfaction Guarantee</h2>
      <p style="margin-top:16px">Craftsmanship and quality are our promise to you in each one of our drainage systems, with a lifetime warranty on select systems.</p>
      <ul><li>NDS piping rated for a 100-year lifetime</li><li>Permits researched and obtained for you</li><li>Any utility damage repaired at no cost to you</li><li>Care Guide supplied with every installation</li></ul>
    </div>
  </div>
</section>

<section class="section bg-surface">
  <div class="wrap">
    <div class="section-head">
      <span class="eyebrow">Reviews</span>
      <h2 style="margin:16px 0 14px">What our neighbours say</h2>
      <div class="rating-hero"><span class="big">${SITE.rating}</span><div><div class="stars" style="font-size:20px">★★★★★</div><div style="color:var(--text-muted);font-size:14.5px;font-weight:600">Based on ${SITE.reviewCount} verified reviews</div></div></div>
      <div class="rule"></div>
    </div>
    <div class="grid-3">${revHtml}</div>
  </div>
</section>

<section class="section">
  <div class="wrap grid-2" style="align-items:start">
    <div>
      <span class="eyebrow">Service Areas</span>
      <h2 style="margin:16px 0 14px;color:var(--navy)">Serving southeastern Virginia &amp; northeastern North Carolina</h2>
      <p class="lead" style="margin-bottom:26px">Local crews, local permits, local knowledge of the clay and the water table.</p>
      <div class="areas">${areasHtml}</div>
    </div>
    <div style="border-radius:var(--r-lg);border:1px solid var(--border);box-shadow:var(--shadow);aspect-ratio:4/3;background:linear-gradient(135deg,var(--surface),#dbe7f5);display:flex;align-items:center;justify-content:center;color:var(--blue)">${icon('pin', 72)}</div>
  </div>
</section>

<section class="section bg-surface">
  <div class="wrap" style="max-width:880px">
    <div class="section-head" style="text-align:center;margin:0 auto 40px">
      <span class="eyebrow">FAQ</span>
      <h2 style="margin:16px 0 14px">Frequently asked questions</h2>
      <p class="lead">Got questions about your drainage? We've got answers.</p>
    </div>
    ${faqHtml}
    <p style="text-align:center;margin-top:26px;color:var(--text-muted)">Didn't find what you're looking for? <a href="/contact-1/" style="color:var(--blue);font-weight:800">Get in touch</a></p>
  </div>
</section>

${ctaSection()}
`
  page('', `<!doctype html>
<html lang="en">
<head>
${head({ title: "Rain Drains | Hampton Roads' Premier Drainage Contractor — Chesapeake & Virginia Beach", description: "Professional French drains, yard grading and drainage installation across Chesapeake, Virginia Beach, Norfolk and northeastern NC. Veteran owned. Free estimates. 5.0★ from 105 reviews.", path: '/' })}
${jsonLd()}
</head>
<body>
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
      <p>Rain Drains was born in 2019 from an idea that started as a home improvement project. Bryson noticed one of his neighbour's downspouts was washing out his pool concrete. Eager to save his friend from a concrete disaster, he designed his first downspout system to fix the drainage issue.</p>
      <p>As a Navy Veteran and an Old Dominion University graduate with a degree in Engineering, he has spent over 17 years in the engineering field. He has been certified by NDS as a Professional Drainage Contractor and is a Licensed Landscaping Service Contractor in the state of Virginia.</p>
      <p>At Rain Drains, we pride ourselves on craftsmanship, quality in design, and reliable professional service. We strive to treat all of our customers like our neighbours. We look forward to serving Hampton Roads now and into the future.</p>
      <p>Every system we design is sized for the specific soil, slope and water volume of your property — not a one-size-fits-all fix. That approach, backed by NDS-rated materials, is why homeowners and businesses across southeastern Virginia and northeastern North Carolina trust us with their drainage.</p>
      <ul class="detail-bullets">
        <li>${icon('check', 18)} Navy Veteran owned and operated</li>
        <li>${icon('check', 18)} ODU Engineering graduate, 17+ years in the field</li>
        <li>${icon('check', 18)} NDS Certified Professional Drainage Contractor</li>
        <li>${icon('check', 18)} Licensed Landscaping Service Contractor, Virginia (2705198697)</li>
        <li>${icon('check', 18)} Fully insured, ${SITE.rating}★ from ${SITE.reviewCount} reviews</li>
      </ul>
    </div>
    <aside class="sidebar-card">
      <h3>Talk to Bryson</h3>
      <p style="color:var(--text-muted);font-size:14px;margin-bottom:16px">Free on-site estimates, no obligation.</p>
      <a class="btn btn-green btn-block" href="/contact-1/" style="margin-bottom:10px">Get a Free Estimate</a>
      <a class="btn btn-ghost btn-block" style="color:var(--navy);border-color:var(--border)" href="tel:${SITE.phoneTel}">Call ${SITE.phone}</a>
    </aside>
  </div>
</section>
${ctaSection()}
`
  page('about-us-1', layout({ title: 'About Us | Rain Drains — Veteran Owned Drainage Contractor', description: "Meet Bryson Goforth, Navy Veteran, ODU engineer and founder of Rain Drains — Hampton Roads' NDS Certified drainage contractor.", path: '/about-us-1/', content }))
}

// ---------- Services index ----------
function servicesIndexPage() {
  const cards = SERVICES.map((s) => `
  <a class="svc" href="/${s.slug}/">
    <div class="svc-img">${icon(s.icon, 46)}</div>
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
  page('services-1', layout({ title: 'All Services | Rain Drains', description: 'French drains, grading, downspout extensions, sump pumps and more — every drainage service Rain Drains offers across Hampton Roads.', path: '/services-1/', content }))
}

// ---------- Service detail pages ----------
function infoGrid(items) {
  return `<div class="info-grid">${items.map((it, i) => `
    <div class="info-card"><div class="num">${i + 1}</div><h4>${it.title}</h4><p>${it.text}</p></div>`).join('')}</div>`
}

function servicePages() {
  for (const s of SERVICES) {
    const others = SERVICES.filter((x) => x.slug !== s.slug).slice(0, 8)
    const bullets = s.bullets.map((b) => `<li>${icon('check', 18)} ${b}</li>`).join('')
    const body = s.body.map((p) => `<p>${p}</p>`).join('')
    const otherLinks = others.map((o) => `<a href="/${o.slug}/">${o.name}</a>`).join('')

    const subServicesHtml = s.subServices ? `
<section class="section bg-surface">
  <div class="wrap">
    <div class="section-head">
      <span class="eyebrow">${s.subServices.eyebrow || 'How It Works'}</span>
      <h2 style="margin:16px 0 14px">${s.subServices.heading}</h2>
      <div class="rule"></div>
    </div>
    <div class="subserv-list">${s.subServices.items.map((it) => `
      <div class="subserv-item">
        <h3>${it.title}</h3>
        <p>${it.intro}</p>
        ${it.bullets ? `<ul class="detail-bullets">${it.bullets.map((b) => `<li>${icon('check', 18)} ${b}</li>`).join('')}</ul>` : ''}
        ${it.outro ? `<p style="margin-top:14px">${it.outro}</p>` : ''}
      </div>`).join('')}
    </div>
  </div>
</section>` : ''

    const featuresHtml = s.features ? `
<section class="section">
  <div class="wrap">
    <div class="section-head">
      <span class="eyebrow">${s.features.eyebrow || 'Key Features'}</span>
      <h2 style="margin:16px 0 14px">${s.features.heading}</h2>
      ${s.features.intro ? `<p class="lead">${s.features.intro}</p>` : ''}
      <div class="rule"></div>
    </div>
    ${infoGrid(s.features.items)}
  </div>
</section>` : ''

    const challengesHtml = s.challenges ? `
<section class="section bg-surface">
  <div class="wrap">
    <div class="section-head">
      <span class="eyebrow">${s.challenges.eyebrow || 'Local Conditions'}</span>
      <h2 style="margin:16px 0 14px">${s.challenges.heading}</h2>
      <p class="lead">${s.challenges.intro}</p>
      <div class="rule"></div>
    </div>
    ${infoGrid(s.challenges.items)}
  </div>
</section>` : ''

    const processHtml = s.process ? `
<section class="section">
  <div class="wrap">
    <div class="section-head">
      <span class="eyebrow">Our Process</span>
      <h2 style="margin:16px 0 14px">${s.process.heading}</h2>
      <p class="lead">${s.process.intro}</p>
      <div class="rule"></div>
    </div>
    ${infoGrid(s.process.items)}
  </div>
</section>` : ''

    const faqHtml = s.faqs ? `
<section class="section bg-surface">
  <div class="wrap" style="max-width:880px">
    <div class="section-head" style="text-align:center;margin:0 auto 40px">
      <span class="eyebrow">FAQ</span>
      <h2 style="margin:16px 0 14px">${s.faqHeading || 'Frequently Asked Local Drainage Questions'}</h2>
    </div>
    ${s.faqs.map((f, i) => `
    <div class="faq-item${i === 0 ? ' open' : ''}">
      <button class="faq-q" type="button">${f.q}<span class="ic">+</span></button>
      <div class="faq-a"><p>${f.a}</p></div>
    </div>`).join('')}
  </div>
</section>` : ''

    const areaListHtml = s.areaList ? `
<section class="section">
  <div class="wrap">
    <div class="section-head">
      <span class="eyebrow">Service Areas</span>
      <h2 style="margin:16px 0 14px">${s.areaList.heading}</h2>
      <p class="lead">${s.areaList.intro}</p>
      <div class="rule"></div>
    </div>
    <div class="area-chips">${s.areaList.areas.map((name) => {
      const match = AREAS.find((a) => a.name === name)
      return match ? `<a class="area-chip" href="/${match.slug}/">${name}</a>` : `<span class="area-chip">${name}</span>`
    }).join('')}</div>
  </div>
</section>` : ''

    const content = `
${pageHero({ eyebrow: 'Services', title: s.name, lead: s.short, tight: true })}
<section class="section">
  <div class="wrap detail-grid">
    <div class="detail-body">
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
${(s.sectionOrder || ['subServices', 'challenges', 'features', 'process', 'faqs', 'areaList'])
  .map((key) => ({ subServices: subServicesHtml, challenges: challengesHtml, features: featuresHtml, process: processHtml, faqs: faqHtml, areaList: areaListHtml }[key]))
  .join('')}
${ctaSection(s.cta?.heading || `Ready to solve your ${s.name.toLowerCase()} problem?`, s.cta?.sub)}
`
    page(s.slug, layout({ title: `${s.name} | Rain Drains — Hampton Roads`, description: `${s.short} Serving Chesapeake, Virginia Beach, Norfolk & Hampton Roads. Free estimates, ${SITE.rating}★ rated.`, path: `/${s.slug}/`, content }))
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
  page('service-areas', layout({ title: 'Service Areas | Rain Drains', description: 'Rain Drains serves Virginia Beach, Chesapeake, Norfolk, Portsmouth, Suffolk, Hampton, Newport News, Smithfield, Carrollton, and Currituck & Camden Counties, NC.', path: '/service-areas/', content }))
}

// ---------- Area detail pages ----------
function areaPages() {
  for (const a of AREAS) {
    const others = AREAS.filter((x) => x.slug !== a.slug).slice(0, 8)
    const otherLinks = others.map((o) => `<a href="/${o.slug}/">${o.name}, ${o.state}</a>`).join('')
    const svcLinks = SERVICES.slice(0, 8).map((s) => `<a href="/${s.slug}/">${s.name}</a>`).join('')
    const content = `
${pageHero({ eyebrow: 'Service Area', title: `Drainage Contractor in ${a.name}, ${a.state}`, lead: `Free on-site drainage estimates for homes and businesses in ${a.name}.`, tight: true })}
<section class="section">
  <div class="wrap detail-grid">
    <div class="detail-body">
      <p>Rain Drains provides professional drainage design and installation throughout ${a.name}, ${a.state} — from French drains and yard grading to downspout extensions and commercial site drainage. Our crews know the local soil, water table and permitting requirements, so your system is built right the first time.</p>
      <p>Whether you're dealing with standing water after every storm, a soggy lawn, or water pushing against your foundation, we'll walk your ${a.name} property in person, diagnose the actual cause, and design a system sized for it — most residential jobs are installed and cleaned up in a single day.</p>
      <p>We're fully insured and NDS Certified.</p>
      <ul class="detail-bullets">
        <li>${icon('check', 18)} Free on-site estimates in ${a.name}</li>
        <li>${icon('check', 18)} Local permits researched & obtained</li>
        <li>${icon('check', 18)} Most residential jobs done in one day</li>
      </ul>
    </div>
    <aside class="sidebar-card">
      <h3>Services in ${a.name}</h3>
      <div class="sidebar-list">${svcLinks}</div>
      <a class="btn btn-green btn-block" href="/contact-1/" style="margin-top:18px">Get a Free Estimate</a>
    </aside>
  </div>
</section>
<section class="section bg-surface">
  <div class="wrap">
    <div class="section-head"><span class="eyebrow">Nearby Areas</span><h2 style="margin:16px 0 0">We also serve</h2></div>
    <div class="areas">${AREAS.filter((x) => x.slug !== a.slug).map((o) => `<a class="area" href="/${o.slug}/">${o.name}<em>${o.state}</em></a>`).join('')}</div>
  </div>
</section>
${ctaSection(`Ready to fix your drainage in ${a.name}?`)}
`
    page(a.slug, layout({ title: `Drainage Contractor in ${a.name}, ${a.state} | Rain Drains`, description: `Professional French drains, grading and drainage installation in ${a.name}, ${a.state}. Veteran owned, NDS Certified, free estimates.`, path: `/${a.slug}/`, content }))
  }
}

// ---------- Past Projects ----------
function pastProjectsPage() {
  const items = Array.from({ length: 24 }).map(() => `<a href="/contact-1/" aria-label="Completed Rain Drains drainage project">${icon('drop', 26)}</a>`).join('')
  const content = `
${pageHero({ eyebrow: 'Our Work', title: 'Browse our completed drainage projects', lead: "See how we've helped homeowners and businesses across Hampton Roads solve their water issues." })}
<section class="section"><div class="wrap"><div class="gal">${items}</div></div></section>
${ctaSection('Want your property to look this good?', 'Free on-site estimate. No obligation.')}
`
  page('past-projects', layout({ title: 'Our Work | Rain Drains Past Projects', description: 'Browse completed French drain, grading and drainage installation projects by Rain Drains across Hampton Roads and northeastern NC.', path: '/past-projects/', content }))
}

// ---------- FAQ ----------
function faqPage() {
  const faqHtml = FAQS.map((f, i) => `
  <div class="faq-item${i === 0 ? ' open' : ''}">
    <button class="faq-q" type="button">${f.q}<span class="ic">+</span></button>
    <div class="faq-a"><p>${f.a}</p></div>
  </div>`).join('')
  const content = `
${pageHero({ eyebrow: 'FAQ', title: 'Frequently asked questions', lead: "Got questions about your drainage? We've got answers." })}
<section class="section"><div class="wrap" style="max-width:880px">${faqHtml}
  <p style="text-align:center;margin-top:26px;color:var(--text-muted)">Didn't find what you're looking for? <a href="/contact-1/" style="color:var(--blue);font-weight:800">Get in touch</a></p>
</div></section>
${ctaSection()}
`
  page('faq', layout({ title: 'FAQ | Rain Drains', description: 'Answers to common questions about permits, timelines, utility safety, lawn restoration and drainage system lifespan.', path: '/faq/', content }))
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
  page('contact-1', layout({ title: 'Contact Us | Rain Drains — Free Drainage Estimate', description: 'Request your free on-site drainage estimate from Rain Drains. Call 757-807-0080 or send us your details — we usually reply the same day.', path: '/contact-1/', content }))
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
  if (existsSync(join(ROOT, 'src/_redirects'))) {
    cpSync(join(ROOT, 'src/_redirects'), join(DIST, '_redirects'))
  }

  console.log('Built site to /public')
}

main()
