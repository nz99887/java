<script setup>
/**
 * 应用外壳：星空背景 + 光晕 + 连接状态 + 主题切换 + 神之眼装饰
 * 页面内容由 <RouterView> 渲染（登录 / 注册）
 */
import StarBackground from './components/StarBackground.vue'
import ThemeSwitch from './components/ThemeSwitch.vue'
import LinkStatus from './components/LinkStatus.vue'
import VisionDeco from './components/VisionDeco.vue'
</script>

<template>
  <StarBackground />
  <div class="glow"></div>
  <LinkStatus />
  <ThemeSwitch />
  <VisionDeco />
  <RouterView />
</template>
