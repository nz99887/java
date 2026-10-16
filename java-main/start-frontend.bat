@echo off
chcp 65001 >nul
setlocal

REM ============================================================
REM  前端启动脚本（genshin-login-vue / Vue3 + Vite + 零依赖 Node 后端）
REM
REM  说明（重要）：
REM   - 每次开机 node_modules 会被清空，所以本脚本运行前【不能】
REM     依赖 node_modules，会先 npm install 重新安装依赖。
REM   - Node 由系统/环境提供（node 须在 PATH 上）。
REM   - 端口：Node 零依赖后端 3000；Vite 开发服务器 5173。
REM     Vite 会把 /api 代理到 3000，所以前端访问 http://localhost:5173
REM     即可，无需手动连 3000。
REM
REM  用法：
REM    start-frontend.bat          安装依赖并启动（3000 + 5173）
REM ============================================================

cd /d "%~dp0"

set "FE=genshin-login-vue"
if not exist "%FE%\" (
  echo [错误] 找不到 %FE% 目录（脚本须放在 java-main 根目录）。
  pause
  exit /b 1
)

REM ---------- 1. 检查 Node ----------
where node >nul 2>nul
if errorlevel 1 (
  echo [错误] 未检测到 Node.js，请先安装 Node 18+：https://nodejs.org/
  pause
  exit /b 1
)
for /f "tokens=*" %%V in ('node -v') do echo [Node] %%V

cd /d "%~dp0%FE%"

REM ---------- 2. 安装依赖（node_modules 每次开机被删，必须重装）----------
if not exist "node_modules\" (
  echo [1/2] 安装前端依赖（npm install）...
  call npm install --no-audit --no-fund
  if errorlevel 1 (
    echo [错误] 依赖安装失败，请检查网络 / npm 源后重试。
    pause
    exit /b 1
  )
  echo [1/2] 依赖安装完成。
) else (
  echo [1/2] node_modules 已存在，跳过安装。
)

REM ---------- 3. 启动（两个新窗口：Node API 3000 + Vite 5173）----------
echo.
echo ==========================================================
echo   前端启动器（genshin-login-vue）
echo   Node API : http://localhost:3000  （/api/*）
echo   Vite    : http://localhost:5173  （开发服务器）
echo ==========================================================
echo.

echo [2/2] 正在启动 Node 后端（3000）与 Vite 前端（5173）...
start "Genshin-API-3000" /D "%~dp0%FE%" cmd /k node server.js
start "Genshin-Vue-5173" /D "%~dp0%FE%" cmd /k npm run dev

echo 前端已启动！
echo   开发访问：http://localhost:5173   （/api 自动代理到 3000）
echo   停止：关闭上面两个命令行窗口，或运行 stop-project.bat
echo.
if not "%~1"=="nopause" pause
