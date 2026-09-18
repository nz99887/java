<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '../composables/useToast'
import { useTheme } from '../composables/useTheme'
import * as auth from '../api/auth'

const router = useRouter()
const { toast } = useToast()
const { isDark, toggle } = useTheme()

const tab = ref('login') // 'login' | 'register'

const login = reactive({ username: '', password: '', remember: false })
const register = reactive({ username: '', password: '' })

const loginMsg = reactive({ text: '', ok: true })
const regMsg = reactive({ text: '', ok: true })

const showLoginPw = ref(false)
const showRegPw = ref(false)

function setMsg(target, text, ok) {
  target.text = text
  target.ok = ok
}

// 密码强度评分
const strength = computed(() => {
  const pw = register.password
  let s = 0
  if (pw.length >= 6) s++
  if (pw.length >= 10) s++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++
  if (/\d/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return s
})
const strengthPct = computed(() => [0, 20, 40, 60, 80, 100][strength.value])
const strengthColor = computed(
  () => ['#dc2626', '#dc2626', '#f59e0b', '#eab308', '#84cc16', '#16a34a'][strength.value]
)
const strengthLabel = computed(() => ['—', '很弱', '弱', '中等', '强', '很强'][strength.value])

async function onLogin() {
  setMsg(loginMsg, '', true)
  try {
    const data = await auth.login(login.username, login.password, login.remember)
    setMsg(loginMsg, data.message, true)
    toast('登录成功 🎉')
    setTimeout(() => router.push('/dashboard'), 600)
  } catch (e) {
    setMsg(loginMsg, e.message, false)
  }
}

async function onRegister() {
  setMsg(regMsg, '', true)
  try {
    const data = await auth.register(register.username, register.password)
    setMsg(regMsg, data.message, true)
    toast('注册成功，请登录')
    register.username = ''
    register.password = ''
    tab.value = 'login'
  } catch (e) {
    setMsg(regMsg, e.message, false)
  }
}
</script>

<template>
  <div class="card">
    <div class="topbar">
      <div class="brand">
        <div class="logo">🔐</div>
        <h2>Welcome</h2>
      </div>
      <button class="ghost" @click="toggle" :title="isDark ? '切换到浅色' : '切换到深色'">
        {{ isDark ? '☀️' : '🌙' }}
      </button>
    </div>

    <div class="tabs">
      <button class="tab" :class="{ active: tab === 'login' }" @click="tab = 'login'">登录</button>
      <button class="tab" :class="{ active: tab === 'register' }" @click="tab = 'register'">注册</button>
    </div>

    <!-- 登录表单 -->
    <form v-show="tab === 'login'" class="form" @submit.prevent="onLogin">
      <div class="field">
        <input
          v-model="login.username"
          name="username"
          placeholder="用户名"
          autocomplete="username"
          required
        />
      </div>
      <div class="field">
        <input
          v-model="login.password"
          :type="showLoginPw ? 'text' : 'password'"
          name="password"
          placeholder="密码"
          autocomplete="current-password"
          required
        />
        <button type="button" class="toggle" @click="showLoginPw = !showLoginPw">
          {{ showLoginPw ? '隐藏' : '显示' }}
        </button>
      </div>
      <label class="remember">
        <input type="checkbox" v-model="login.remember" /> 记住我（30 天）
      </label>
      <button type="submit" class="primary">登录</button>
      <p class="msg" :class="loginMsg.ok ? 'ok' : 'err'">{{ loginMsg.text }}</p>
    </form>

    <!-- 注册表单 -->
    <form v-show="tab === 'register'" class="form" @submit.prevent="onRegister">
      <div class="field">
        <input
          v-model="register.username"
          name="username"
          placeholder="用户名（字母/数字/下划线，3-20 位）"
          autocomplete="username"
          required
        />
      </div>
      <div class="field">
        <input
          v-model="register.password"
          :type="showRegPw ? 'text' : 'password'"
          name="password"
          placeholder="密码（至少 6 位）"
          autocomplete="new-password"
          required
        />
        <button type="button" class="toggle" @click="showRegPw = !showRegPw">
          {{ showRegPw ? '隐藏' : '显示' }}
        </button>
      </div>
      <div class="strength">
        <div class="bar"><span :style="{ width: strengthPct + '%', background: strengthColor }"></span></div>
        <small class="strength-label">密码强度：{{ strengthLabel }}</small>
      </div>
      <button type="submit" class="primary">注册</button>
      <p class="msg" :class="regMsg.ok ? 'ok' : 'err'">{{ regMsg.text }}</p>
    </form>
  </div>
</template>
