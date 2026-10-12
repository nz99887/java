<script setup>
/**
 * 登录页（移植自原版 index.html + login.js）
 */
import { computed, onMounted, reactive, ref } from 'vue'
import { errMsg, fetchMe, login, logout } from '../api'

const username = ref('')
const password = ref('')
const remember = ref(false)
const showPw = ref(false)

const hint = reactive({ text: '', type: '' })
const loggedIn = ref(false)
const user = ref(null)
const submitting = ref(false)

const pwType = computed(() => (showPw.value ? 'text' : 'password'))

function setHint(msg, type = '') {
  hint.text = msg || ''
  hint.type = type
}

function fmtTime(t) {
  return t ? new Date(t).toLocaleString() : '未知'
}

// 页面加载：若已登录则直接展示欢迎面板
onMounted(async () => {
  try {
    const data = await fetchMe()
    user.value = data.user
    loggedIn.value = true
  } catch {
    /* 未登录，展示登录表单 */
  }
})

async function onSubmit() {
  const u = username.value.trim()
  const p = password.value
  if (!u || !p) {
    setHint('账号和密码不能为空', 'error')
    return
  }
  setHint('登录中…')
  submitting.value = true
  try {
    const data = await login({ username: u, password: p, remember: remember.value })
    user.value = data.user
    loggedIn.value = true
    username.value = ''
    password.value = ''
    remember.value = false
  } catch (err) {
    setHint(errMsg(err), 'error')
  } finally {
    submitting.value = false
  }
}

async function onLogout() {
  try {
    await logout()
  } catch {
    /* 忽略 */
  }
  loggedIn.value = false
  user.value = null
  setHint('')
}
</script>

<template>
  <div class="wrap">
    <!-- 登录表单 -->
    <div v-if="!loggedIn" class="panel">
      <h1 class="title">提瓦特</h1>
      <p class="subtitle">旅 行 者 登 录</p>

      <form autocomplete="off" @submit.prevent="onSubmit">
        <div class="field">
          <label class="label" for="username">账号</label>
          <div class="input-line">
            <span class="field-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" fill="currentColor" />
              </svg>
            </span>
            <input id="username" v-model="username" type="text" placeholder="输入你的账号" />
          </div>
        </div>

        <div class="field">
          <label class="label" for="password">密码</label>
          <div class="input-line">
            <span class="field-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" fill="currentColor" />
              </svg>
            </span>
            <input id="password" v-model="password" :type="pwType" placeholder="输入你的密码" />
            <button class="toggle-pw" type="button" @click="showPw = !showPw">
              {{ showPw ? '隐藏' : '显示' }}
            </button>
          </div>
        </div>

        <div class="field">
          <label class="label" style="display: flex; justify-content: space-between">
            <span>记住我</span>
            <span style="color: var(--text-dim)">30 天免登录</span>
          </label>
          <label style="font-size: 12px; color: var(--text-dim); cursor: pointer">
            <input v-model="remember" type="checkbox" /> 启用记住我
          </label>
        </div>

        <div class="hint" :class="hint.type">{{ hint.text }}</div>
        <button class="btn" type="submit" :disabled="submitting">登 录</button>
      </form>

      <p class="switch">还没有账号？<RouterLink to="/register">前往注册 →</RouterLink></p>
    </div>

    <!-- 登录成功面板 -->
    <div v-else class="panel welcome">
      <h1 class="title">欢 迎 回 来</h1>
      <svg class="crest" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="46" stroke="var(--gold)" stroke-width="2" opacity="0.55" />
        <path
          d="M50 6 L59 41 L94 50 L59 59 L50 94 L41 59 L6 50 L41 41 Z"
          fill="var(--gold-strong)"
          opacity="0.92"
        />
      </svg>
      <div class="who">{{ user?.username || '旅行者' }}</div>
      <div class="meta">
        注册时间：{{ fmtTime(user?.createdAt) }}<br />
        上次登录：{{ fmtTime(user?.lastLogin) }}<br />
        累计登录：{{ user?.loginCount ?? 0 }} 次
      </div>
      <button class="btn" type="button" @click="onLogout">退 出 登 录</button>
    </div>
  </div>
</template>
