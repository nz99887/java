import { ref } from 'vue'

// 暗色主题：记忆到 localStorage，并切换 document.body 的 .dark 类
const isDark = ref(localStorage.getItem('theme') === 'dark')

function apply() {
  document.body.classList.toggle('dark', isDark.value)
}
apply()

export function useTheme() {
  function toggle() {
    isDark.value = !isDark.value
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    apply()
  }
  return { isDark, toggle }
}
