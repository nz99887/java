<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '../composables/useToast'
import { useTheme } from '../composables/useTheme'
import * as auth from '../api/auth'

const router = useRouter()
const { toast } = useToast()
const { isDark, toggle } = useTheme()

const user = ref({ username: '', loginCount: 0, createdAt: null, lastLogin: null })

const pw = reactive({ current: '', next: '' })
const pwMsg = reactive({ text: '', ok: true })

function fmt(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`
}

onMounted(async () => {
  try {
    const data = await auth.me()
    user.value = data.user
  } catch {
    router.replace('/')
  }
})

async function onLogout() {
  await auth.logout()
  toast('已退出登录')
  setTimeout(() => router.replace('/'), 500)
}

async function onChangePw() {
  pwMsg.text = ''
  try {
    const data = await auth.changePassword(pw.current, pw.next)
    toast(data.message)
    setTimeout(() => router.replace('/'), 900)
  } catch (e) {
    pwMsg.text = e.message
    pwMsg.ok = false
  }
}
</script>

<template>
  <div class="card wide" v-if="user.username">
    <div class="topbar">
      <div class="user">
        <div class="avatar">{{ user.username.charAt(0).toUpperCase() }}</div>
        <div>
          <div class="name">{{ user.username }}</div>
          <div class="sub">已登录</div>
        </div>
      </div>
      <button class="ghost" @click="toggle" :title="isDark ? '切换到浅色' : '切换到深色'">
        {{ isDark ? '☀️' : '🌙' }}
      </button>
    </div>

    <div class="stats">
      <div class="stat"><div class="num">{{ user.loginCount }}</div><div class="lbl">累计登录</div></div>
      <div class="stat"><div class="num">{{ fmt(user.createdAt) }}</div><div class="lbl">注册于</div></div>
      <div class="stat"><div class="num">{{ fmt(user.lastLogin) }}</div><div class="lbl">上次登录</div></div>
    </div>

    <details class="panel">
      <summary>修改密码</summary>
      <form class="form" @submit.prevent="onChangePw">
        <input v-model="pw.current" type="password" placeholder="当前密码" required />
        <input v-model="pw.next" type="password" placeholder="新密码（至少 6 位）" required />
        <button type="submit" class="primary">保存修改</button>
        <p class="msg" :class="pwMsg.ok ? 'ok' : 'err'">{{ pwMsg.text }}</p>
      </form>
    </details>

    <button class="primary" @click="onLogout">退出登录</button>
  </div>
</template>
