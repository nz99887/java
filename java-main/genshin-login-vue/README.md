# 原神风登录站点（Vue 3 版 · genshin-login-vue）

由原版 `genshin-login`（零依赖 Node.js + 原生 HTML/JS）改造而来的 **Vue 3 前后端项目**：
- **前端**：Vue 3 + Vite + Vue Router（原生 fetch，无 axios 等额外运行时依赖）
- **后端**：保留原版零依赖 Node.js（API 完全一致，用户数据仍存 `users.json`）

## 功能（与原版 1:1 一致）

- 登录 / 注册（Vue Router 双页面）
- 注册含 **图形验证码**（Canvas 绘制，服务端生成 + 一次性校验，点击刷新，离线本地兜底）
- 密码长度限制 **6-15 位**（前后端双重校验）+ 实时强度条
- 显示 / 隐藏密码
- 防暴破：登录失败 5 次锁定 5 分钟
- 暗金 / 星空风格 UI，星空 + 流光 + 流星粒子特效
- **七元素主题切换**（风岩雷草水火冰，localStorage 记忆）+ 神之眼装饰开关
- 后端连接状态实时指示（每 15 秒健康检查）
- 密码 scrypt 加盐哈希，HttpOnly Cookie 会话（记住我 30 天）

## 快速开始

**方式一（推荐）：双击 `start.bat`**，自动安装依赖并启动前后端，浏览器打开 http://localhost:5173

**方式二（命令行，开两个终端）：**

```bat
:: 终端 1：后端 API（端口 3000）
cd genshin-login-vue
npm install
node server.js

:: 终端 2：前端 Vite 开发服务器（端口 5173，/api 自动代理到 3000）
npm run dev
```

浏览器访问 **http://localhost:5173**

## 生产部署（可选）

```bat
npm run build        # 构建到 dist/
node server.js       # 后端直接托管 dist/，访问 http://localhost:3000
```

## 目录结构

```
genshin-login-vue/
├─ server.js                    # 零依赖 Node 后端（API 与原版一致，托管 dist/）
├─ start.bat                    # 一键启动（装依赖 + 前后端）
├─ index.html                   # Vite 入口
├─ vite.config.js               # /api 代理到 localhost:3000
├─ package.json
└─ src/
   ├─ main.js                   # 应用入口
   ├─ App.vue                   # 外壳：星空 + 光晕 + 状态 + 主题 + 路由出口
   ├─ style.css                 # 原神风样式（七元素主题 CSS 变量）
   ├─ api/index.js              # 后端接口封装（原生 fetch）
   ├─ router/index.js           # 路由：/ 登录，/register 注册
   ├─ composables/
   │  └─ useTheme.js            # 七元素主题全局状态（localStorage 记忆）
   ├─ components/
   │  ├─ StarBackground.vue     # 星空 + 流光 + 流星（颜色随主题）
   │  ├─ ThemeSwitch.vue        # 七元素主题切换器 + 神之眼开关
   │  ├─ LinkStatus.vue         # 后端连接状态指示器
   │  └─ VisionDeco.vue         # 神之眼装饰
   └─ views/
      ├─ LoginView.vue          # 登录页（含登录成功欢迎面板）
      └─ RegisterView.vue       # 注册页（验证码 + 强度条 + 实时校验）
```

## 接口清单（与原版一致）

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | /api/captcha | 获取图形验证码 `{id, code}` |
| POST | /api/register | 注册 `{username, password, captchaId, captchaInput}` |
| POST | /api/login | 登录 `{username, password, remember}`，成功写 HttpOnly Cookie |
| POST | /api/logout | 退出登录 |
| GET | /api/me | 当前登录用户 |
| POST | /api/change-password | 修改密码 `{current, next}` |
| GET | /api/health | 健康检查 |

## 说明

- 验证码为演示级（code 会下发到前端绘制），非生产级防机器人方案。
- 账号数据保存在 `users.json`（首次注册后自动生成）；会话与防爆破计数在内存中，重启后端需重新登录——均与原版行为一致。
