import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 开发时：Vite 跑在 5173，把 /api 代理到后端 3000 端口
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  build: {
    outDir: 'dist',
  },
})
