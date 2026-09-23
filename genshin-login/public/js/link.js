'use strict'

// 前端实时检测后端连接状态（链接可见化）
(function () {
  const el = document.getElementById('linkStatus')
  if (!el) return
  async function check() {
    try {
      const res = await fetch('/api/health', { cache: 'no-store' })
      if (res.ok) {
        el.className = 'link-status on'
        el.textContent = '后端已连接'
        return
      }
    } catch (e) {
      /* 忽略，标记离线 */
    }
    el.className = 'link-status off'
    el.textContent = '后端未连接'
  }
  check()
  setInterval(check, 15000)
})()
