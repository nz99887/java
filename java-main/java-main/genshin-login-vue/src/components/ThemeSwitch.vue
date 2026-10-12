<script setup>
/**
 * 七元素主题切换器（移植自原版 theme.js + index.html 中的切换按钮）
 */
import { THEMES, THEME_COLORS, useTheme } from '../composables/useTheme'

const { theme, showVision, setTheme, toggleVision } = useTheme()

const THEME_NAMES = {
  anemo: '风',
  geo: '岩',
  electro: '雷',
  dendro: '草',
  hydro: '水',
  pyro: '火',
  cryo: '冰',
}
</script>

<template>
  <div class="theme-switch" title="切换元素主题">
    <button
      v-for="t in THEMES"
      :key="t"
      class="dot"
      :class="{ active: theme === t }"
      :data-theme="t"
      :style="{ background: THEME_COLORS[t], color: THEME_COLORS[t] }"
      :title="THEME_NAMES[t]"
      type="button"
      @click="setTheme(t)"
    ></button>
    <button
      class="vision-toggle"
      :class="{ active: showVision }"
      title="神之眼装饰"
      type="button"
      @click="toggleVision"
    >
      <svg viewBox="0 0 24 24" width="12" height="12">
        <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" fill="currentColor" />
      </svg>
    </button>
  </div>
</template>
