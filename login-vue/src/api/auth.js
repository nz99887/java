// 与后端 /api/* 交互的统一封装
// 后端使用 HttpOnly Cookie 维护会话，因此 fetch 需携带 same-origin 凭据
async function request(url, options = {}) {
  const res = await fetch(url, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  let data = {}
  try {
    data = await res.json()
  } catch {
    /* 响应体可能不是 JSON */
  }
  if (!res.ok) {
    throw new Error(data.error || '请求处理失败')
  }
  return data
}

export function register(username, password) {
  return request('/api/register', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export function login(username, password, remember) {
  return request('/api/login', {
    method: 'POST',
    body: JSON.stringify({ username, password, remember }),
  })
}

export function logout() {
  return request('/api/logout', { method: 'POST' })
}

export function me() {
  return request('/api/me', { method: 'GET' })
}

export function changePassword(current, next) {
  return request('/api/change-password', {
    method: 'POST',
    body: JSON.stringify({ current, next }),
  })
}
