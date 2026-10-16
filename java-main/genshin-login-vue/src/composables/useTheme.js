import { ref, watchEffect } from 'vue'

/**
 * 七元素主题（全局单例状态，记忆到 localStorage）
 * 与原版 theme.js 行为一致：默认（空）为暗金主题
 */
const THEME_KEY = 'genshin-theme'
const VISION_KEY = 'genshin-vision'

export const THEMES = ['anemo', 'geo', 'electro', 'dendro', 'hydro', 'pyro', 'cryo']

/** 主题切换按钮圆点颜色（与原版 index.html 一致） */
export const THEME_COLORS = {
  anemo: '#9be8a8',
  geo: '#e8c87a',
  electro: '#c4a0ff',
  dendro: '#bfe86a',
  hydro: '#7ec8ff',
  pyro: '#ff9a5a',
  cryo: '#cfefff',
}

/** 各主题强调色 RGB（供星空画布直接取色，与 style.css 一致） */
export const THEME_ACCENTS = {
  '': '232,200,122',
  anemo: '127,209,138',
  geo: '232,200,122',
  electro: '185,140,255',
  dendro: '168,224,99',
  hydro: '90,184,255',
  pyro: '255,122,77',
  cryo: '174,240,255',
}

const theme = ref(localStorage.getItem(THEME_KEY) || '')
const showVision = ref(localStorage.getItem(VISION_KEY) === 'on')

watchEffect(() => {
  const t = theme.value
  if (t && THEMES.includes(t)) document.documentElement.setAttribute('data-theme', t)
  else document.documentElement.removeAttribute('data-theme')
  localStorage.setItem(THEME_KEY, t)
})

watchEffect(() => {
  document.body.classList.toggle('show-vision', showVision.value)
  localStorage.setItem(VISION_KEY, showVision.value ? 'on' : 'off')
})

export function useTheme() {
  return {
    theme,
    showVision,
    setTheme(t) {
      theme.value = t
    },
    toggleVision() {
      showVision.value = !showVision.value
    },
  }
}
