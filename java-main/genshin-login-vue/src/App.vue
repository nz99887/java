<script setup>
/**
 * 应用外壳：星空背景 + 光晕 + 连接状态 + 主题切换 + 神之眼装饰
 * 页面内容由 <RouterView> 渲染（登录 / 注册 / 首页 / 角色图鉴）
 * 导航栏仅在 meta.nav 为 true 的路由（已登录页面）上显示
 */
import { useRoute } from 'vue-router'
import StarBackground from './components/StarBackground.vue'
import ThemeSwitch from './components/ThemeSwitch.vue'
import LinkStatus from './components/LinkStatus.vue'
import VisionDeco from './components/VisionDeco.vue'
import NavBar from './components/NavBar.vue'

const route = useRoute()
</script>

<template>
  <StarBackground />
  <div class="glow"></div>
  <LinkStatus />
  <ThemeSwitch />
  <VisionDeco />
  <NavBar v-if="route.meta.nav" />
  <RouterView />
</template>
