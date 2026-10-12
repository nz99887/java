import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'login', component: LoginView, meta: { title: '提瓦特 · 登录' } },
    { path: '/register', name: 'register', component: RegisterView, meta: { title: '提瓦特 · 注册' } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.afterEach((to) => {
  if (to.meta?.title) document.title = to.meta.title
})

export default router
