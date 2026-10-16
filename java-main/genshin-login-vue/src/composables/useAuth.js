import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { fetchMe, logout as logoutApi } from '../api'

/**
 * 全局登录态（模块级单例，所有页面/导航栏共享同一份 user）
 * - 首次调用时拉取当前用户；未登录自动跳回登录页（充当导航页守卫）
 * - logout() 清除状态并跳登录页
 */
const user = ref(null)
const loaded = ref(false)
let initialized = false

export function useAuth() {
  const router = useRouter()

  if (!initialized) {
    initialized = true
    fetchMe()
      .then((d) => {
        user.value = d.user
      })
      .catch(() => {
        router.replace('/')
      })
      .finally(() => {
        loaded.value = true
      })
  }

  async function logout() {
    try {
      await logoutApi()
    } catch {
      /* 忽略 */
    }
    user.value = null
    initialized = false // 允许下次进入导航页时重新拉取登录态
    router.replace('/')
  }

  return { user, loaded, logout }
}
