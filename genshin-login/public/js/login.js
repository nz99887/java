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
    if (input.type === 'password') {
      input.type = 'text'
      btn.textContent = '隐藏'
    } else {
      input.type = 'password'
      btn.textContent = '显示'
    }
  })
})

// 页面加载：若已登录则直接展示欢迎面板
async function bootstrap() {
  try {
    const res = await fetch('/api/me')
    if (res.ok) {
      const data = await res.json()
      showWelcome(data.user)
      return
    }
  } catch (e) {
    /* 忽略，走登录表单 */
  }
}

function showWelcome(user) {
  $('loginPanel').style.display = 'none'
  $('welcomePanel').style.display = 'block'
  $('welcomeName').textContent = user.username
  const created = user.createdAt ? new Date(user.createdAt).toLocaleString() : '未知'
  const last = user.lastLogin ? new Date(user.lastLogin).toLocaleString() : '未知'
  $('welcomeMeta').innerHTML =
    `注册时间：${created}<br>上次登录：${last}<br>累计登录：${user.loginCount} 次`
}

$('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault()
  const hint = $('loginHint')
  const username = $('username').value.trim()
  const password = $('password').value
  const remember = $('remember').checked

  if (!username || !password) {
    setHint(hint, '账号和密码不能为空', 'error')
    return
  }
  setHint(hint, '登录中…')
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, remember }),
    })
    const data = await res.json()
    if (res.ok) {
      showWelcome(data.user)
    } else {
      setHint(hint, data.error || '登录失败', 'error')
    }
  } catch (err) {
    setHint(hint, '网络错误，请确认服务已启动', 'error')
  }
})

$('logoutBtn').addEventListener('click', async () => {
  await fetch('/api/logout', { method: 'POST' })
  $('welcomePanel').style.display = 'none'
  $('loginPanel').style.display = 'block'
  $('loginForm').reset()
})

bootstrap()
