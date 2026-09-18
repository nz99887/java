# 登录站点（Vue 3 改造版）

把原 `java-main/login-site` 的纯 Node.js 多页登录网站，改造成 **Vue 3 + Vite** 单页应用（SPA），
并复用了原项目零依赖的 Node.js 后端 API（注册 / 登录 / 会话保护 / 修改密码 / 控制台）。

## 目录结构

```
login-vue/
├─ index.html              # Vite 入口
├─ vite.config.mjs         # Vite 配置（dev 时把 /api 代理到 3000）
├─ package.json
├─ src/
│  ├─ main.js              # 应用入口
│  ├─ App.vue              # 根组件（含全局 Toast）
│  ├─ style.css            # 全局样式（沿用原 design token）
│  ├─ router/index.js      # 路由：/ 与 /dashboard
│  ├─ api/auth.js          # 与后端 /api/* 交互的封装
│  ├─ composables/
│  │  ├─ useTheme.js       # 暗色主题（localStorage 记忆）
│  │  └─ useToast.js       # 全局提示
│  ├─ components/Toast.vue # 提示组件
│  └─ views/
│     ├─ LoginView.vue     # 登录 / 注册页
│     └─ DashboardView.vue  # 控制台页
└─ server/
   ├─ server.js            # 后端 API + 托管构建产物（零依赖 Node.js）
   └─ users.json           # 用户数据持久化
```

## 运行方式

### 方式一：开发模式（推荐，热更新）

开两个终端：

```bash
# 终端 1：启动后端 API（端口 3000）
npm run server

# 终端 2：启动前端（端口 5173）
npm install
npm run dev
```

浏览器打开 http://localhost:5173 ，前端会把 `/api` 请求代理到 3000 端口的后端。

### 方式二：生产构建 + 单服务运行

```bash
npm install
npm run build        # 产物输出到 dist/
npm run server       # 由 Node 后端同时托管 API 与 dist 静态资源
```

浏览器打开 http://localhost:3000 。

## 功能对照（与原项目一致）

- 登录 / 注册（页签切换）
- 显示 / 隐藏密码
- 注册时密码强度实时评估
- 暗色主题切换（localStorage 记忆，跨页面生效）
- 登录成功 Toast 提示并跳转控制台
- 控制台展示累计登录次数、注册时间、上次登录时间
- 修改密码、退出登录
- 后端 scrypt 加盐哈希、会话 Cookie、登录失败锁定（5 次锁 5 分钟）

## 与原项目的差异

- 前端从多页（index.html / dashboard.html）改为 Vue 单页应用，路由由 `vue-router` 管理。
- 状态（主题、提示、当前用户）由 Vue 的 `ref` / `reactive` 与组合式函数管理，不再直接操作 DOM。
- 登录/控制台的保护由前端路由守卫（未登录跳回 `/`）+ 后端 `/api/me` 双重保证。
- 保留了原 Node.js 后端，仅把静态托管从 `public/` 改为 `dist/`（SPA history 模式回退到 index.html）。
