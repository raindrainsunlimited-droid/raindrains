(function () {
  var t = false
  function onScroll() {
    var s = window.scrollY > 80
    if (s !== t) { t = s; document.body.classList.toggle('scrolled', s) }
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll()

  var burger = document.getElementById('burger')
  var drawer = document.getElementById('drawer')
  var close = document.getElementById('drawerClose')
  function setMenu(open) {
    if (!drawer) return
    drawer.classList.toggle('open', open)
    if (burger) burger.setAttribute('aria-expanded', String(open))
    document.body.style.overflow = open ? 'hidden' : ''
  }
  burger && burger.addEventListener('click', function () { setMenu(true) })
  close && close.addEventListener('click', function () { setMenu(false) })
  drawer && drawer.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { setMenu(false) })
  })
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false) })

  document.querySelectorAll('.faq-q').forEach(function (q) {
    q.addEventListener('click', function () { q.closest('.faq-item').classList.toggle('open') })
  })

  var gal = document.querySelectorAll('.gal-item')
  var lightbox = document.getElementById('lightbox')
  if (gal.length && lightbox) {
    var lbImg = document.getElementById('lbImg')
    var current = 0
    function showAt(i) {
      current = (i + gal.length) % gal.length
      var item = gal[current]
      lbImg.src = item.getAttribute('data-full')
      lbImg.alt = item.getAttribute('data-alt') || ''
    }
    function openLightbox(i) {
      showAt(i)
      lightbox.classList.add('open')
      lightbox.setAttribute('aria-hidden', 'false')
    }
    function closeLightbox() {
      lightbox.classList.remove('open')
      lightbox.setAttribute('aria-hidden', 'true')
      lbImg.src = ''
    }
    gal.forEach(function (item, i) {
      item.addEventListener('click', function () { openLightbox(i) })
    })
    var lbClose = document.getElementById('lbClose')
    var lbPrev = document.getElementById('lbPrev')
    var lbNext = document.getElementById('lbNext')
    lbClose && lbClose.addEventListener('click', closeLightbox)
    lbPrev && lbPrev.addEventListener('click', function () { showAt(current - 1) })
    lbNext && lbNext.addEventListener('click', function () { showAt(current + 1) })
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLightbox() })
    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('open')) return
      if (e.key === 'Escape') closeLightbox()
      else if (e.key === 'ArrowLeft') showAt(current - 1)
      else if (e.key === 'ArrowRight') showAt(current + 1)
    })
  }
})()
