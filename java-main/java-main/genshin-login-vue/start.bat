@echo off
chcp 65001 >nul
title 原神风登录站点（Vue 版）

echo ============================================
echo   原神风登录站点（Vue 3 + Node 零依赖后端）
echo ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [错误] 未检测到 Node.js，请先安装：https://nodejs.org/
  pause
  exit /b 1
)

if not exist node_modules (
  echo [1/3] 首次运行，正在安装前端依赖（npm install）...
  call npm install
  if errorlevel 1 (
    echo [错误] 依赖安装失败，请检查网络后重试。
    pause
    exit /b 1
  )
) else (
  echo [1/3] 依赖已就绪，跳过安装。
)

echo [2/3] 正在启动后端 API（端口 3000）...
start "Genshin-Login 后端 API" cmd /k node server.js

echo [3/3] 正在启动前端开发服务器（端口 5173）...
start "Genshin-Login Vue 前端" cmd /k npm run dev

echo.
echo 启动完成！请在浏览器打开：http://localhost:5173
echo （关闭对应的两个命令行窗口即可停止服务）
echo.
pause
