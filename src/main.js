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

function quoteFormInit(id) {
  var form = document.getElementById(id)
  if (!form) return
  var ok = document.getElementById(id + '-ok')
  var fail = document.getElementById(id + '-fail')
  var btn = document.getElementById(id + '-btn')
  var btnLabel = btn.textContent

  form.addEventListener('submit', function (e) {
    e.preventDefault()
    var bad = false
    form.querySelectorAll('[data-req]').forEach(function (f) {
      var input = f.querySelector('input,textarea')
      var empty = !input.value.trim()
      f.classList.toggle('invalid', empty)
      if (empty) bad = true
    })
    if (bad) { form.querySelector('.invalid input,.invalid textarea').focus(); return }
    if (form.botcheck && form.botcheck.value) return

    btn.disabled = true
    btn.textContent = 'Sending…'
    fail.classList.remove('show')

    var data = new FormData(form)
    var body = new URLSearchParams(
      Array.from(data.entries()).filter(function (e) { return typeof e[1] === 'string' })
    )

    fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status)
        form.style.display = 'none'
        ok.classList.add('show')
      })
      .catch(function () {
        btn.disabled = false
        btn.textContent = btnLabel
        fail.classList.add('show')
        fail.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      })
  })

  form.querySelectorAll('[data-req] input,[data-req] textarea').forEach(function (i) {
    i.addEventListener('input', function () {
      if (i.value.trim()) i.closest('.field').classList.remove('invalid')
    })
  })
}
