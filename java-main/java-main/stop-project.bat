@echo off
chcp 65001 >nul
setlocal

REM ============================================================
REM  停止项目脚本（暂停后端 + 前端所有服务）
REM
REM  按端口结束进程：
REM    8081  Spring Boot 后端（java -jar）
REM    3000  Node 零依赖后端（server.js）
REM    5173  Vite 开发服务器
REM
REM  用法：stop-project.bat
REM ============================================================

cd /d "%~dp0"

echo ==========================================================
echo   停止项目服务（按端口结束进程）
echo ==========================================================
echo.

set "ANY=0"
for %%P in (8081 3000 5173) do (
  echo [端口 %%P] 查找监听进程 ...
  for /f "tokens=5" %%A in ('netstat -ano ^| findstr "%%P " ^| findstr "LISTENING"') do (
    echo       结束 PID %%A
    taskkill /F /PID %%A >nul 2>&1
    if not errorlevel 1 set "ANY=1"
  )
)

echo.
if "%ANY%"=="1" (
  echo 已发送结束信号。若窗口仍在，请手动关闭对应命令行窗口。
) else (
  echo 未发现正在监听的端口（服务可能未运行）。
)
echo.
pause
