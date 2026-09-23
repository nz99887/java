'use strict'

// 七元素主题切换（记忆到 localStorage）
(function () {
  const themes = ['anemo', 'geo', 'electro', 'dendro', 'hydro', 'pyro', 'cryo']
  const KEY = 'genshin-theme'

  function apply(t) {
    if (t && themes.includes(t)) document.documentElement.setAttribute('data-theme', t)
    else document.documentElement.removeAttribute('data-theme')
  }

  apply(localStorage.getItem(KEY))

  document.querySelectorAll('.theme-switch .dot').forEach((dot) => {
    const t = dot.dataset.theme
    if (t === localStorage.getItem(KEY)) dot.classList.add('active')
    dot.addEventListener('click', () => {
      apply(t)
      localStorage.setItem(KEY, t)
      document.querySelectorAll('.theme-switch .dot').forEach((d) => d.classList.remove('active'))
      dot.classList.add('active')
    })
  })

  // 神之眼装饰开关（记忆到 localStorage）
  const VKEY = 'genshin-vision'
  const visBtn = document.querySelector('.theme-switch .vision-toggle')
  function applyVision(on) {
    document.body.classList.toggle('show-vision', on)
    if (visBtn) visBtn.classList.toggle('active', on)
  }
  applyVision(localStorage.getItem(VKEY) === 'on')
  if (visBtn) {
    visBtn.addEventListener('click', () => {
      const on = !document.body.classList.contains('show-vision')
      applyVision(on)
      localStorage.setItem(VKEY, on ? 'on' : 'off')
    })
  }
})()
