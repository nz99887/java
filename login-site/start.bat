@echo off
chcp 65001 >nul
cd /d "%~dp0"

REM 优先用系统 PATH 里的 node，找不到就用 WorkBuddy 管理的 node 绝对路径
set "NODE=node"
where node >nul 2>&1
if errorlevel 1 (
  set "NODE=C:\Users\Administrator\.workbuddy\binaries\node\versions\22.22.2-2\node.exe"
)

if not exist "%NODE%" (
  echo 未找到 node，请先安装 Node.js 或确认 WorkBuddy 已安装。
  pause
  exit /b 1
)

echo 正在启动登录网站...
echo 启动完成后浏览器会自动打开 http://localhost:3000
echo （本窗口保持打开即为服务运行中，关闭窗口即停止服务；也可以按 Ctrl+C 停止）

REM 2 秒后自动打开浏览器（等服务就绪）
start "" cmd /c "timeout /t 2 >nul && start "" http://localhost:3000"

"%NODE%" server.js
pause
