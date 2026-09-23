'use strict'

const $ = (id) => document.getElementById(id)

function setHint(el, msg, type) {
  el.textContent = msg || ''
  el.className = 'hint' + (type ? ' ' + type : '')
}

// 显示 / 隐藏密码
document.querySelectorAll('.toggle-pw').forEach((btn) => {
  btn.addEventListener('click', () => {
    const input = $(btn.dataset.target)
    input.type = input.type === 'password' ? 'text' : 'password'
    btn.textContent = input.type === 'password' ? '显示' : '隐藏'
  })
})

// 密码强度（仅作提示，不影响 6-15 规则）
function scorePassword(pw) {
  let s = 0
  if (pw.length >= 6) s++
  if (pw.length >= 10) s++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++
  if (/\d/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return Math.min(s, 4)
}
function paintStrength(pw) {
  const bar = $('strengthBar')
  const colors = ['#e07a7a', '#e8a85a', '#e8c87a', '#7fe0a8', '#6fd6c4']
  const sc = pw ? scorePassword(pw) : 0
  bar.style.width = (sc / 4) * 100 + '%'
  bar.style.background = colors[sc] || colors[0]
}

// 校验状态
const state = { userOk: false, pwOk: false, cfOk: false }
function refreshSubmit() {
  $('regBtn').disabled = !(state.userOk && state.pwOk && state.cfOk)
}

// 账号校验
$('username').addEventListener('input', () => {
  const v = $('username').value.trim()
  if (!v) {
    setHint($('userHint'), '', '')
    state.userOk = false
  } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(v)) {
    setHint($('userHint'), '用户名只能含字母/数字/下划线，3-20 位', 'error')
    state.userOk = false
  } else {
    setHint($('userHint'), '账号格式正确', 'ok')
    state.userOk = true
  }
  refreshSubmit()
})

// 密码校验（6-15）
$('password').addEventListener('input', () => {
  const v = $('password').value
  paintStrength(v)
  if (v.length < 6 || v.length > 15) {
    setHint($('pwHint'), `密码长度需为 6-15 位（当前 ${v.length} 位）`, 'error')
    state.pwOk = false
  } else {
    setHint($('pwHint'), '密码格式正确', 'ok')
    state.pwOk = true
  }
  // 同步确认
  $('confirm').dispatchEvent(new Event('input'))
  refreshSubmit()
})

// 确认密码
$('confirm').addEventListener('input', () => {
  const v = $('confirm').value
  const pw = $('password').value
  if (!v) {
    setHint($('cfHint'), '', '')
    state.cfOk = false
  } else if (v !== pw) {
    setHint($('cfHint'), '两次输入的密码不一致', 'error')
    state.cfOk = false
  } else {
    setHint($('cfHint'), '密码一致', 'ok')
    state.cfOk = true
  }
  refreshSubmit()
})

// 验证码：刷新 + 点击刷新
$('captchaCanvas').addEventListener('click', () => refreshCaptcha())
refreshCaptcha()

// 提交注册
$('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault()
  const hint = $('regHint')
  const username = $('username').value.trim()
  const password = $('password').value
  const captchaInput = $('captchaInput').value.trim()
  const captchaId = getCaptchaId()

  if (!(state.userOk && state.pwOk && state.cfOk)) {
    setHint(hint, '请先完善账号与密码信息', 'error')
    return
  }
  if (!captchaInput) {
    setHint(hint, '请输入验证码', 'error')
    return
  }
  setHint(hint, '注册中…')
  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, captchaId, captchaInput }),
    })
    const data = await res.json()
    if (res.ok) {
      setHint(hint, '注册成功，正在跳转到登录…', 'ok')
      setTimeout(() => (window.location.href = '/index.html'), 1200)
    } else {
      setHint(hint, data.error || '注册失败', 'error')
      refreshCaptcha() // 失败后刷新验证码
    }
  } catch (err) {
    setHint(hint, '网络错误，请确认服务已启动', 'error')
  }
})
