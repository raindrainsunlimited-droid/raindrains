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
})()
