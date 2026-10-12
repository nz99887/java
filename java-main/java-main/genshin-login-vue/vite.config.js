import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 开发模式下把 /api 请求代理到零依赖 Node 后端（server.js，端口 3000）
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
