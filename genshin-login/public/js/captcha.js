'use strict'

// 验证码模块：从服务端获取 code 并在 Canvas 上绘制（带干扰线/噪点/旋转）
let currentCaptchaId = null

async function refreshCaptcha(canvasId = 'captchaCanvas') {
  const canvas = document.getElementById(canvasId)
  try {
    const res = await fetch('/api/captcha')
    const data = await res.json()
    currentCaptchaId = data.id
    drawCaptcha(canvas, data.code)
  } catch (e) {
    // 离线兜底：本地生成一个简单码
    const code = Math.random().toString(36).slice(2, 6).toUpperCase()
    currentCaptchaId = 'local'
    drawCaptcha(canvas, code)
  }
  return currentCaptchaId
}

function drawCaptcha(canvas, code) {
  const ctx = canvas.getContext('2d')
  const w = canvas.width
  const h = canvas.height
  // 背景
  ctx.clearRect(0, 0, w, h)
  const grad = ctx.createLinearGradient(0, 0, w, h)
  grad.addColorStop(0, 'rgba(20,40,60,0.85)')
  grad.addColorStop(1, 'rgba(10,20,30,0.9)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  // 干扰线
  for (let i = 0; i < 4; i++) {
    ctx.strokeStyle = `rgba(232,200,122,${0.18 + Math.random() * 0.2})`
    ctx.beginPath()
    ctx.moveTo(Math.random() * w, Math.random() * h)
    ctx.lineTo(Math.random() * w, Math.random() * h)
    ctx.stroke()
  }

  // 字符
  const colors = ['#f5d488', '#6fd6c4', '#ece3cf', '#e8c87a']
  const n = code.length
  for (let i = 0; i < n; i++) {
    ctx.save()
    const x = (w / (n + 1)) * (i + 1)
    const y = h / 2 + (Math.random() * 8 - 4)
    const angle = (Math.random() - 0.5) * 0.6
    ctx.translate(x, y)
    ctx.rotate(angle)
    ctx.font = `bold ${22 + Math.floor(Math.random() * 6)}px Georgia, serif`
    ctx.fillStyle = colors[i % colors.length]
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.shadowColor = 'rgba(0,0,0,0.5)'
    ctx.shadowBlur = 3
    ctx.fillText(code[i], 0, 0)
    ctx.restore()
  }

  // 噪点
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.25})`
    ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5)
  }
}

function getCaptchaId() {
  return currentCaptchaId
}
