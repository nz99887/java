@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo 正在启动登录网站...
echo 启动后请在浏览器打开: http://localhost:3000
echo 按 Ctrl+C 可停止服务。
node server.js
pause
