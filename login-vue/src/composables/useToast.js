import { reactive } from 'vue'

// 全局共享的 toast 状态（单例），由 Toast.vue 渲染
const state = reactive({ text: '', ok: true, show: false })
let timer = null

export function useToast() {
  function toast(text, ok = true) {
    state.text = text
    state.ok = ok
    state.show = true
    clearTimeout(timer)
    timer = setTimeout(() => {
      state.show = false
    }, 2200)
  }
  return { state, toast }
}
