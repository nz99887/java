@echo off
chcp 65001 >nul
setlocal

REM ============================================================
REM  一键启动全部（后端 + 前端）
REM   后端：springBootTest（Spring Boot，8081）— 会自动 Maven 打包
REM   前端：genshin-login-vue（Node 3000 + Vite 5173）— 会自动 npm install
REM
REM  用法：start-all.bat
REM  停止：stop-project.bat
REM ============================================================

cd /d "%~dp0"

echo ==========================================================
echo   启动整个项目（后端 + 前端）
echo ==========================================================
echo.

echo >>> 步骤 1/2：启动后端（含 Maven 打包，请稍候）...
call "%~dp0start-backend.bat" 8081 nopause
if errorlevel 1 (
  echo [错误] 后端启动失败，已中止。请先解决后端问题。
  pause
  exit /b 1
)

echo.
echo >>> 步骤 2/2：启动前端（含 npm install）...
call "%~dp0start-frontend.bat" nopause
if errorlevel 1 (
  echo [错误] 前端启动失败。后端已在运行，可单独排查前端。
  pause
  exit /b 1
)

echo.
echo ==========================================================
echo   全部已启动！
echo   后端 API  : http://127.0.0.1:8081
echo   前端页面  : http://localhost:5173   （/api 走 3000）
echo   停止项目  : 运行 stop-project.bat
echo ==========================================================
echo.
pause
