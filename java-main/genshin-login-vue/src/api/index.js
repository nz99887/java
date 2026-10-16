/**
 * 后端 API 封装（原生 fetch，零额外依赖）
 * 接口与原版 genshin-login 完全一致
 */

async function request(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    ...options,
  })
  let data = {}
  try {
    data = await res.json()
  } catch {
    /* 非 JSON 响应 */
  }
  if (!res.ok) {
    const err = new Error(data.error || `请求失败（${res.status}）`)
    err.status = res.status
    throw err
  }
  return data
}

/** 获取图形验证码 {id, code} */
export const fetchCaptcha = () => request('/api/captcha', { cache: 'no-store' })

/** 注册 {username, password, captchaId, captchaInput} */
export const register = (body) =>
  request('/api/register', { method: 'POST', body: JSON.stringify(body) })

/** 登录 {username, password, remember}，成功后服务端写 HttpOnly Cookie */
export const login = (body) =>
  request('/api/login', { method: 'POST', body: JSON.stringify(body) })

/** 退出登录 */
export const logout = () => request('/api/logout', { method: 'POST' })

/** 当前登录用户（未登录抛 401） */
export const fetchMe = () => request('/api/me', { cache: 'no-store' })

/** 修改密码 {current, next} */
export const changePassword = (body) =>
  request('/api/change-password', { method: 'POST', body: JSON.stringify(body) })

/** 健康检查 */
export const fetchHealth = () => request('/api/health', { cache: 'no-store' })

/** 统一错误信息 */
export function errMsg(err, fallback = '网络错误，请确认服务已启动') {
  return err instanceof TypeError ? fallback : err.message || fallback
}
