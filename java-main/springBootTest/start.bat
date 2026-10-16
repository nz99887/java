@echo off
chcp 65001 >nul
setlocal

REM ============================================================
REM  springBootTest 一键启动脚本
REM
REM  用法:
REM    start.bat            打包并启动 (dev, 端口 8081)
REM    start.bat run        跳过打包，直接启动
REM    start.bat build      只打包，不启动
REM    start.bat run 8082   跳过打包，用 8082 端口启动
REM    start.bat all 8082   打包并用 8082 端口启动
REM ============================================================

cd /d "%~dp0"

REM ---------- 可调参数 ----------
set "DEFAULT_PORT=8081"
set "PROFILE=dev"
set "MAIN_CLASS_JAR=target\springBootTest-0.0.1-SNAPSHOT.jar"
REM ------------------------------

REM ---------- 参数解析: 模式 + 端口 ----------
set "MODE=all"
set "PORT="

:parse
if "%~1"=="" goto parsed

set "ARG=%~1"
if /i "%ARG%"=="run"   ( set "MODE=run"   & shift & goto parse )
if /i "%ARG%"=="build" ( set "MODE=build" & shift & goto parse )
if /i "%ARG%"=="all"   ( set "MODE=all"   & shift & goto parse )

REM 纯数字视为端口
echo %ARG%| findstr /r "^[0-9][0-9]*$" >nul 2>&1
if not errorlevel 1 ( set "PORT=%ARG%" & shift & goto parse )

echo [警告] 无法识别的参数 "%ARG%"，已忽略。
shift
goto parse

:parsed
if not defined PORT set "PORT=%DEFAULT_PORT%"

echo.
echo ==========================================================
echo   springBootTest 启动器
echo ----------------------------------------------------------
echo   端口     : %PORT%
echo   Profile  : %PROFILE%
echo   模式     : %MODE%
echo ==========================================================
echo.

REM ---------- 1. 定位 JDK ----------
set "JAVA_EXE="
if defined JAVA_HOME if exist "%JAVA_HOME%\bin\java.exe" set "JAVA_EXE=%JAVA_HOME%\bin\java.exe"
if not defined JAVA_EXE for /d %%D in ("C:\Program Files\Zulu\zulu-*") do if exist "%%D\bin\java.exe" set "JAVA_EXE=%%D\bin\java.exe"
if not defined JAVA_EXE where java >nul 2>&1 && set "JAVA_EXE=java"
if not defined JAVA_EXE (
    echo [错误] 未找到 Java，请安装 JDK 17+ 或设置 JAVA_HOME。
    pause
    exit /b 1
)
echo [JDK] %JAVA_EXE%

REM ---------- 2. 定位 Maven ----------
set "MVN_CMD="
where mvn >nul 2>&1 && set "MVN_CMD=mvn"
if not defined MVN_CMD for /d %%D in ("%USERPROFILE%\.m2\wrapper\dists\apache-maven-*") do (
    for /d %%E in ("%%D\*") do (
        if exist "%%E\apache-maven-*\bin\mvn.cmd" for /d %%F in ("%%E\apache-maven-*") do set "MVN_CMD=%%F\bin\mvn.cmd"
    )
)
if not defined MVN_CMD if exist "mvnw.cmd" set "MVN_CMD=mvnw.cmd"
if not defined MVN_CMD (
    echo [错误] 未找到 Maven。
    pause
    exit /b 1
)
echo [MVN] %MVN_CMD%

REM ---------- 2.5 数据库连通性预检查 ----------
REM 应用启动时才连数据库,失败会报一大串 Hibernate 错误。
REM 这里提前检查 3306 是否监听,尽量给出可读的提示。
echo.
echo [数据库] 检查 MySQL (localhost:3306) ...
netstat -ano | findstr ":3306 " | findstr "LISTENING" >nul 2>&1
if errorlevel 1 goto db_warn

echo [数据库] 3306 端口在监听,继续。
goto db_check_user

:db_warn
echo.
echo [警告] 未检测到 MySQL 在 3306 端口监听！
echo         应用启动后会因连不上数据库而失败。
echo         请先启动 MySQL 服务（services.msc 中查看 MySQL80），
echo         或按任意键仍要继续尝试 ...
pause >nul
goto db_done

:db_check_user
REM 若命令行客户端可用,顺手验证账号密码(与 application.properties 一致)
if not exist "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" goto db_done
if not defined DB_PASSWORD set "DB_PASSWORD=123456"
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p%DB_PASSWORD% -e "SELECT 1;" >nul 2>&1
if errorlevel 1 (
    echo [警告] 3306 在监听但 root 账号连接失败（密码不对？）。
    echo         应用将使用默认密码 123456 连接,可能启动失败。
) else (
    echo [数据库] 账号验证通过。
)
goto db_done

:db_done

REM ---------- 3. 打包 ----------
if /i "%MODE%"=="run" goto skip_build

echo.
echo [1/2] 正在打包 ...
call %MVN_CMD% -B -DskipTests clean package
if errorlevel 1 (
    echo.
    echo [错误] 打包失败，请检查上面的输出。
    pause
    exit /b 1
)
echo [1/2] 打包完成。

:skip_build
if /i "%MODE%"=="build" (
    echo.
    echo 已按 build 模式结束（未启动）。
    pause
    exit /b 0
)

if not exist "%MAIN_CLASS_JAR%" (
    echo.
    echo [错误] 未找到 %MAIN_CLASS_JAR%
    echo        请先执行:  start.bat build
    pause
    exit /b 1
)

REM ---------- 4. 清理占用端口的旧进程 ----------
echo.
echo [2/2] 检查端口 %PORT% ...

set "KILLED="
for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":%PORT% " ^| findstr "LISTENING"') do (
    set "KILLED=1"
    echo       停止占用进程 PID %%P
    taskkill /F /PID %%P >nul 2>&1
)

if defined KILLED (
    echo       等待端口释放 ...
    ping -n 3 127.0.0.1 >nul
    call :wait_port_free
    if errorlevel 1 echo       [警告] 端口 %PORT% 可能仍被占用，继续尝试启动 ...
)
goto port_ready

REM ---------- 子过程: 等待端口释放, 释放成功返回 0 ----------
:wait_port_free
for /l %%I in (1,1,10) do (
    netstat -ano | findstr ":%PORT% " | findstr "LISTENING" >nul 2>&1
    if errorlevel 1 exit /b 0
    ping -n 1 -w 500 127.0.0.1 >nul
)
exit /b 1

:port_ready

REM ---------- 5. 启动 ----------
echo.
echo [启动] http://127.0.0.1:%PORT%
echo [提示] 关闭本窗口或按 Ctrl+C 可停止服务
echo.

REM 本机存在 SERVER__PORT / SERVER__HOST 环境变量时会覆盖配置文件中的
REM server.port，用 set 置空消除干扰，并显式传参确保端口正确。
set "SERVER__PORT="
set "SERVER__HOST="

"%JAVA_EXE%" -jar "%MAIN_CLASS_JAR%" --spring.profiles.active=%PROFILE% --server.port=%PORT% --server.address=0.0.0.0

echo.
echo 服务已停止 (退出码 %ERRORLEVEL%)。
pause
