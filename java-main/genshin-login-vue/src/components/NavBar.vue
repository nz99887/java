<script setup>
/**
 * 全局导航栏（仅在有 meta.nav 的路由上由 App.vue 渲染）
 * - 品牌 + 导航链接（RouterLink，自动高亮当前页）
 * - 未实装的导航项点击给出「即将开放」占位提示
 * - 右侧显示当前用户并提供退出
 */
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const { user, logout } = useAuth()

const PLACEHOLDER = ['武器库', '世界地图', '冒险攻略']
const toast = ref('')
let timer = null
function soon(name) {
  toast.value = `「${name}」模块即将开放`
  clearTimeout(timer)
  timer = setTimeout(() => (toast.value = ''), 1800)
}
</script>

<template>
  <nav class="navbar">
    <RouterLink to="/home" class="brand">
      <svg class="brand-mark" viewBox="0 0 100 100" aria-hidden="true">
        <path d="M50 6 L59 41 L94 50 L59 59 L50 94 L41 59 L6 50 L41 41 Z" fill="var(--gold-strong)" opacity="0.92" />
      </svg>
      <span class="brand-text">提瓦特</span>
    </RouterLink>

    <ul class="nav-links">
      <li><RouterLink to="/home" class="nav-item">首页</RouterLink></li>
      <li><RouterLink to="/characters" class="nav-item">角色图鉴</RouterLink></li>
      <li v-for="p in PLACEHOLDER" :key="p" class="nav-item placeholder" @click="soon(p)">{{ p }}</li>
    </ul>

    <div class="nav-user">
      <span class="who" v-if="user">旅行者 · {{ user.username }}</span>
      <button class="logout" type="button" @click="logout">退出</button>
    </div>

    <transition name="toast">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </transition>
  </nav>
</template>
