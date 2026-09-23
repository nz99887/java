'use strict'

// 动态星空 + 流光 背景特效（颜色跟随七元素主题）
(function () {
  const canvas = document.getElementById('fx')
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  let W, H, DPR

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2)
    W = canvas.width = Math.floor(window.innerWidth * DPR)
    H = canvas.height = Math.floor(window.innerHeight * DPR)
    canvas.style.width = window.innerWidth + 'px'
    canvas.style.height = window.innerHeight + 'px'
  }
  resize()
  window.addEventListener('resize', resize)

  // 当前主题强调色（随七元素主题切换而变）
  function readAccent() {
    const v = getComputedStyle(document.documentElement).getPropertyValue('--accent-rgb')
    const t = (v || '').trim()
    return t || '232,200,122'
  }
  let currentAccent = readAccent()
  const mo = new MutationObserver(() => {
    currentAccent = readAccent()
  })
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

  // ---------- 星星 ----------
  const stars = []
  function initStars() {
    stars.length = 0
    const count = Math.max(60, Math.round((window.innerWidth * window.innerHeight) / 7000))
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: (Math.random() * 1.4 + 0.3) * DPR,
        base: Math.random() * 0.5 + 0.35,
        tw: Math.random() * Math.PI * 2,
        twSpeed: Math.random() * 0.025 + 0.006,
        vy: (Math.random() * 0.12 + 0.04) * DPR,
        accent: Math.random() < 0.8,
      })
    }
  }
  initStars()
  window.addEventListener('resize', initStars)

  // ---------- 流光带（横向流动的光条 + 偶尔的流星）----------
  const beams = []
  function spawnBeam() {
    const fromLeft = Math.random() < 0.5
    beams.push({
      x: fromLeft ? -160 * DPR : W + 160 * DPR,
      y: Math.random() * H * 0.85 + H * 0.05,
      len: (Math.random() * 180 + 140) * DPR,
      speed: (Math.random() * 1.8 + 1.8) * DPR * (fromLeft ? 1 : -1),
      angle: (Math.random() - 0.5) * 0.25,
    })
  }
  let beamTimer = 0

  const shootingStars = []
  function spawnShootingStar() {
    const fromLeft = Math.random() < 0.5
    shootingStars.push({
      x: fromLeft ? -40 : W + 40,
      y: Math.random() * H * 0.4,
      vx: (Math.random() * 4 + 5) * DPR * (fromLeft ? 1 : -1),
      vy: (Math.random() * 2 + 1.5) * DPR,
      len: (Math.random() * 120 + 80) * DPR,
      life: 1,
    })
  }
  let shootTimer = 0

  function draw() {
    ctx.clearRect(0, 0, W, H)

    // 星星：闪烁 + 缓慢上漂（颜色跟随主题）
    for (const s of stars) {
      s.tw += s.twSpeed
      const a = Math.max(0.08, s.base + Math.sin(s.tw) * 0.32)
      s.y -= s.vy
      if (s.y < -2) {
        s.y = H + 2
        s.x = Math.random() * W
      }
      const hue = s.accent ? currentAccent : '245,247,235'
      if (s.r > 1.2 * DPR) {
        const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 5)
        g.addColorStop(0, `rgba(${hue},${a * 0.55})`)
        g.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r * 5, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.beginPath()
      ctx.fillStyle = `rgba(${hue},${a})`
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
      ctx.fill()
    }

    // 流光带（颜色跟随主题）
    beamTimer++
    if (beamTimer > 80 && beams.length < 5 && Math.random() < 0.7) {
      beamTimer = 0
      spawnBeam()
    }
    for (let i = beams.length - 1; i >= 0; i--) {
      const b = beams[i]
      b.x += b.speed
      const dir = Math.sign(b.speed)
      const grad = ctx.createLinearGradient(b.x, b.y, b.x - dir * b.len, b.y + b.len * b.angle * dir)
      grad.addColorStop(0, `rgba(${currentAccent},0)`)
      grad.addColorStop(0.5, `rgba(${currentAccent},0.5)`)
      grad.addColorStop(1, `rgba(${currentAccent},0)`)
      ctx.strokeStyle = grad
      ctx.lineWidth = 2.2 * DPR
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(b.x, b.y)
      ctx.lineTo(b.x - dir * b.len, b.y + b.len * b.angle * dir)
      ctx.stroke()
      if (b.x < -220 * DPR || b.x > W + 220 * DPR) beams.splice(i, 1)
    }

    // 流星（颜色跟随主题）
    shootTimer++
    if (shootTimer > 220 && Math.random() < 0.5) {
      shootTimer = 0
      spawnShootingStar()
    }
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const m = shootingStars[i]
      m.x += m.vx
      m.y += m.vy
      m.life -= 0.012
      const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 6, m.y - m.vy * 6)
      grad.addColorStop(0, `rgba(255,247,224,${Math.max(0, m.life)})`)
      grad.addColorStop(1, `rgba(${currentAccent},0)`)
      ctx.strokeStyle = grad
      ctx.lineWidth = 2 * DPR
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(m.x, m.y)
      ctx.lineTo(m.x - m.vx * 6, m.y - m.vy * 6)
      ctx.stroke()
      if (m.life <= 0 || m.x < -60 || m.x > W + 60 || m.y > H + 60) shootingStars.splice(i, 1)
    }

    requestAnimationFrame(draw)
  }
  draw()
})()
