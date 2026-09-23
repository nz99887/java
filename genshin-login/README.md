# 原神风登录站点（genshin-login）

原神 / 提瓦特风格的登录 + 注册网页，零依赖 Node.js 后端。

## 功能
- 登录 / 注册（双页）
- 注册含 **图形验证码**（Canvas 绘制，服务端生成 + 一次性校验，可点击刷新）
- 密码长度限制 **6–15 位**（前后端双重校验）
- 显示 / 隐藏密码
- 密码强度实时提示
- 防暴破：登录失败 5 次锁定 5 分钟
- 暗金 / 星空风格 UI，带发光与粒子动效
- 密码使用 scrypt 加盐哈希，不存明文

## 快速开始
- 方式一（最简单）：双击 `start.bat`，浏览器打开 `http://localhost:3000`
- 方式二（命令行）：
  ```bat
  cd genshin-login
  node server.js
  ```
  浏览器访问 http://localhost:3000

## 目录
```
genshin-login/
├─ server.js            # 零依赖 Node 后端（注册/登录/验证码/会话）
├─ public/
│  ├─ index.html        # 登录页
│  ├─ register.html     # 注册页（含验证码）
│  ├─ css/style.css     # 原神风格样式
│  └─ js/
│     ├─ captcha.js     # 验证码获取 + Canvas 绘制
│     ├─ login.js       # 登录逻辑
│     └─ register.js    # 注册逻辑
├─ users.json           # 用户数据（首次注册后自动生成）
├─ start.bat
└─ package.json
```

## 说明
- 验证码为演示级（code 会下发到前端绘制），仅作交互示例，非生产级防机器人方案。
- 账号数据保存在 `users.json`，停止服务用 `Ctrl+C`。
