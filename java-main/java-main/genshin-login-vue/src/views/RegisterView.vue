<script setup>
/**
 * 注册页（移植自原版 register.html + captcha.js + register.js）
 * - 账号 3-20 位字母/数字/下划线
 * - 密码 6-15 位 + 实时强度条
 * - Canvas 图形验证码（点击刷新，离线时本地兜底）
 */
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { errMsg, fetchCaptcha, register as registerApi } from '../api'

const router = useRouter()

const username = ref('')
const password = ref('')
const confirm = ref('')
const showPw = ref(false)
const captchaInput = ref('')

const regHint = reactive({ text: '', type: '' })
const submitting = ref(false)
const captchaCanvas = ref(null)

// ---------- 显示 / 隐藏密码 ----------
const pwType = computed(() => (showPw.value ? 'text' : 'password'))

// ---------- 账号校验 ----------
const userHint = computed(() => {
  const v = username.value.trim()
  if (!v) return { text: '', type: '' }
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(v)) {
    return { text: '用户名只能含字母/数字/下划线，3-20 位', type: 'error' }
  }
  return { text: '账号格式正确', type: 'ok' }
})
const userOk = computed(() => userHint.value.type === 'ok')

// ---------- 密码校验（6-15） + 强度 ----------
function scorePassword(pw) {
  let s = 0
  if (pw.length >= 6) s++
  if (pw.length >= 10) s++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++
  if (/\d/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return Math.min(s, 4)
}
const STRENGTH_COLORS = ['#e07a7a', '#e8a85a', '#e8c87a', '#7fe0a8', '#6fd6c4']
const strengthStyle = computed(() => {
  const sc = password.value ? scorePassword(password.value) : 0
  return {
    width: (sc / 4) * 100 + '%',
    background: STRENGTH_COLORS[sc] || STRENGTH_COLORS[0],
  }
})
const pwHint = computed(() => {
  const v = password.value
  if (!v) return { text: '密码长度需为 6-15 位', type: '' }
  if (v.length < 6 || v.length > 15) {
    return { text: `密码长度需为 6-15 位（当前 ${v.length} 位）`, type: 'error' }
  }
  return { text: '密码格式正确', type: 'ok' }
})
const pwOk = computed(() => pwHint.value.type === 'ok')

// ---------- 确认密码 ----------
const cfHint = computed(() => {
  const v = confirm.value
  if (!v) return { text: '', type: '' }
  if (v !== password.value) return { text: '两次输入的密码不一致', type: 'error' }
  return { text: '密码一致', type: 'ok' }
})
const cfOk = computed(() => cfHint.value.type === 'ok')

// ---------- 提交按钮可用性 ----------
const canSubmit = computed(() => userOk.value && pwOk.value && cfOk.value)

// ---------- 验证码 ----------
let captchaId = null

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

async function refreshCaptcha() {
  const canvas = captchaCanvas.value
  if (!canvas) return
  try {
    const data = await fetchCaptcha()
    captchaId = data.id
    drawCaptcha(canvas, data.code)
  } catch {
    // 离线兜底：本地生成一个简单码
    const code = Math.random().toString(36).slice(2, 6).toUpperCase()
    captchaId = 'local'
    drawCaptcha(canvas, code)
  }
}

onMounted(refreshCaptcha)
onBeforeUnmount(() => {
  captchaId = null
})

function setHint(msg, type = '') {
  regHint.text = msg || ''
  regHint.type = type
}

// ---------- 提交注册 ----------
async function onSubmit() {
  if (!canSubmit.value) {
    setHint('请先完善账号与密码信息', 'error')
    return
  }
  const cap = captchaInput.value.trim()
  if (!cap) {
    setHint('请输入验证码', 'error')
    return
  }
  setHint('注册中…')
  submitting.value = true
  try {
    await registerApi({
      username: username.value.trim(),
      password: password.value,
      captchaId,
      captchaInput: cap,
    })
    setHint('注册成功，正在跳转到登录…', 'ok')
    setTimeout(() => router.push('/'), 1200)
  } catch (err) {
    setHint(errMsg(err), 'error')
    refreshCaptcha() // 失败后刷新验证码
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="wrap">
    <div class="panel">
      <h1 class="title">创 建 账 号</h1>
      <p class="subtitle">加 入 提 瓦 特</p>

      <form autocomplete="off" @submit.prevent="onSubmit">
        <div class="field">
          <label class="label" for="reg-username">账号</label>
          <div class="input-line">
            <span class="field-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" fill="currentColor" />
              </svg>
            </span>
            <input
              id="reg-username"
              v-model="username"
              type="text"
              placeholder="3-20 位字母/数字/下划线"
            />
          </div>
          <div class="hint" :class="userHint.type">{{ userHint.text }}</div>
        </div>

        <div class="field">
          <label class="label" for="reg-password">密码</label>
          <div class="input-line">
            <span class="field-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" fill="currentColor" />
              </svg>
            </span>
            <input id="reg-password" v-model="password" :type="pwType" placeholder="长度 6-15 位" />
            <button class="toggle-pw" type="button" @click="showPw = !showPw">
              {{ showPw ? '隐藏' : '显示' }}
            </button>
          </div>
          <div class="strength"><i :style="strengthStyle"></i></div>
          <div class="hint" :class="pwHint.type">{{ pwHint.text }}</div>
        </div>

        <div class="field">
          <label class="label" for="reg-confirm">确认密码</label>
          <div class="input-line">
            <span class="field-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" fill="currentColor" />
              </svg>
            </span>
            <input id="reg-confirm" v-model="confirm" :type="pwType" placeholder="再次输入密码" />
          </div>
          <div class="hint" :class="cfHint.type">{{ cfHint.text }}</div>
        </div>

        <div class="field">
          <label class="label" for="reg-captcha">验证码</label>
          <div class="captcha-row">
            <input
              id="reg-captcha"
              v-model="captchaInput"
              type="text"
              placeholder="输入右侧字符"
              maxlength="4"
            />
            <canvas
              ref="captchaCanvas"
              class="captcha-canvas"
              title="点击刷新验证码"
              @click="refreshCaptcha"
            ></canvas>
          </div>
          <div class="hint">点击图片可刷新验证码</div>
        </div>

        <div class="hint" :class="regHint.type">{{ regHint.text }}</div>
        <button class="btn" type="submit" :disabled="!canSubmit || submitting">注 册</button>
      </form>

      <p class="switch">已有账号？<RouterLink to="/">返回登录 →</RouterLink></p>
    </div>
  </div>
</template>
