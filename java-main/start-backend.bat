@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

REM ============================================================
REM  后端启动脚本（springBootTest / Spring Boot + MySQL）
REM
REM  说明（重要）：
REM   - 每次开机 node_modules 与 target 会被清空，所以本脚本
REM     运行前【不能】依赖这两个目录，必须重新打包 / 安装。
REM   - target 由本脚本用 Maven 重新打包生成；Maven 与依赖缓存
REM     在 %USERPROFILE%\.m2 中（开机不被删除），可离线打包。
REM   - 端口：8081（dev）。MySQL 需已在 3306 监听（root/123456）。
REM
REM  用法：
REM    start-backend.bat          打包并启动（默认 8081）
REM    start-backend.bat 8090     用指定端口启动
REM ============================================================

cd /d "%~dp0"

REM ---------- 1. 定位 JDK ----------
set "JAVA_EXE="
if defined JAVA_HOME if exist "%JAVA_HOME%\bin\java.exe" set "JAVA_EXE=%JAVA_HOME%\bin\java.exe"
if not defined JAVA_EXE for /d %%D in ("C:\Program Files\Zulu\zulu-*") do if exist "%%D\bin\java.exe" set "JAVA_EXE=%%D\bin\java.exe"
if not defined JAVA_EXE where java >nul 2>&1 && set "JAVA_EXE=java"
if not defined JAVA_EXE (
  echo [错误] 未找到 Java，请安装 JDK 17+ 或设置 JAVA_HOME 环境变量。
  pause
  exit /b 1
)
echo [JDK] %JAVA_EXE%

REM ---------- 2. 定位 Maven（优先 .m2 里已缓存的发行版，必须命中 bin\mvn.cmd）----------
set "MVN_CMD="
for /d %%A in ("%USERPROFILE%\.m2\wrapper\dists\apache-maven-*-bin") do (
  for /d %%H in ("%%A\*") do (
    for /d %%M in ("%%H\apache-maven-*") do (
      if exist "%%M\bin\mvn.cmd" if not defined MVN_CMD set "MVN_CMD=%%M\bin\mvn.cmd"
    )
  )
)
if not defined MVN_CMD where mvn >nul 2>&1 && set "MVN_CMD=mvn"
if not defined MVN_CMD if exist "mvnw.cmd" set "MVN_CMD=mvnw.cmd"
if not defined MVN_CMD (
  echo [错误] 未找到 Maven。请在 %USERPROFILE%\.m2\wrapper\dists 下放一个 apache-maven 发行版，
  echo        或把 mvn 加入 PATH，或恢复项目的 .mvn/wrapper（mvnw）。
  pause
  exit /b 1
)
echo [MVN] %MVN_CMD%

REM ---------- 3. 数据库预检查（3306）----------
echo.
echo [数据库] 检查 MySQL (localhost:3306) ...
netstat -ano | findstr ":3306 " | findstr "LISTENING" >nul 2>&1
if errorlevel 1 (
  echo [提示] 未检测到 MySQL 在 3306 监听，尝试启动 MySQL 服务 ...
  net start MySQL80 >nul 2>&1
  net start MySQL >nul 2>&1
  ping -n 3 127.0.0.1 >nul
  netstat -ano | findstr ":3306 " | findstr "LISTENING" >nul 2>&1
  if errorlevel 1 (
    echo [警告] MySQL 仍未启动，后端会因连不上数据库而失败。请先启动 MySQL 服务。
  ) else (
    echo [数据库] MySQL 已启动。
  )
) else (
  echo [数据库] 3306 端口在监听。
)

REM ---------- 3.5 数据库存在性检查 + 缺失自动初始化 ----------
set "MYSQL_EXE="
if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" set "MYSQL_EXE=C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
if not defined MYSQL_EXE for /d %%D in ("C:\Program Files\MySQL\MySQL Server *") do if exist "%%D\bin\mysql.exe" set "MYSQL_EXE=%%D\bin\mysql.exe"
if not defined MYSQL_EXE where mysql >nul 2>&1 && set "MYSQL_EXE=mysql"
set "DB_PW=123456"
if defined DB_PASSWORD set "DB_PW=%DB_PASSWORD%"

if defined MYSQL_EXE (
  echo.
  echo [数据库] 检查 springboottest 库是否存在 ...
  "%MYSQL_EXE%" -uroot -p%DB_PW% -e "USE springboottest;" >nul 2>&1
  if errorlevel 1 (
    echo [数据库] springboottest 库不存在（常见于开机重置），自动初始化 ...
    if exist "%~dp0springBootTest\sql\springboottest.sql" (
      "%MYSQL_EXE%" -uroot -p%DB_PW% < "%~dp0springBootTest\sql\springboottest.sql" >nul 2>&1
      if errorlevel 1 (
        echo [警告] 自动建库失败，后端启动后会因连不上数据库而闪退。请手动执行 sql/springboottest.sql。
      ) else (
        echo [数据库] 已自动创建 springboottest 库与 user 表（含种子用户 admin / zhangsan）。
      )
    ) else (
      echo [警告] 未找到 springBootTest\sql\springboottest.sql，无法自动建库。
    )
  ) else (
    echo [数据库] springboottest 库已存在。
  )
) else (
  echo [提示] 未找到 mysql 客户端，跳过自动建库检查。若后端闪退，请先手动执行 sql/springboottest.sql。
)

REM ---------- 4. 参数：端口 ----------
set "PORT=8081"
if not "%~1"=="" (
  echo %~1 | findstr /r "^[0-9][0-9]*$" >nul 2>&1
  if not errorlevel 1 set "PORT=%~1"
)
echo.
echo ==========================================================
echo   后端启动器（springBootTest）
echo   端口     : %PORT%
echo   工作目录 : %~dp0springBootTest
echo ==========================================================
echo.

REM ---------- 5. 打包（每次都会重新生成 target）----------
set "PROJ=springBootTest"
set "JAR=%PROJ%\target\springBootTest-0.0.1-SNAPSHOT.jar"

if not exist "%PROJ%\" (
  echo [错误] 找不到 %PROJ% 目录（脚本须放在 java-main 根目录）。
  pause
  exit /b 1
)

echo [1/2] 正在 Maven 打包（clean package，跳过测试）...
pushd "%PROJ%"
call "%MVN_CMD%" -B -DskipTests clean package
set "BUILD_ERR=%ERRORLEVEL%"
popd
if not "%BUILD_ERR%"=="0" (
  echo.
  echo [错误] 打包失败（错误码 %BUILD_ERR%），请查看上面的 Maven 输出。
  pause
  exit /b 1
)
echo [1/2] 打包完成。

if not exist "%JAR%" (
  echo [错误] 未生成 %JAR%
  pause
  exit /b 1
)

REM ---------- 6. 清理占用端口的旧进程 ----------
set "KILLED="
for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":%PORT% " ^| findstr "LISTENING"') do (
  set "KILLED=1"
  echo       停止占用 %PORT% 的旧进程 PID %%P
  taskkill /F /PID %%P >nul 2>&1
)
if defined KILLED (
  echo       等待端口释放 ...
  ping -n 3 127.0.0.1 >nul
)

REM ---------- 7. 启动（新窗口，关闭窗口即停止）----------
echo.
echo [2/2] 启动后端，新窗口运行中 ...
echo [访问] http://127.0.0.1:%PORT%
echo [停止] 关闭弹出的命令行窗口，或运行 stop-project.bat
echo.
REM 用 cmd /k 拉起：即使 java 启动失败，窗口也会保留报错信息，避免“闪退”看不清原因
set "JAVA_CMD="%JAVA_EXE%" -jar "%JAR%" --spring.profiles.active=dev --server.port=%PORT% --server.address=0.0.0.0"
start "SpringBootTest-%PORT%" cmd /k "%JAVA_CMD%"

echo 已发起启动。若需查看日志，请查看弹出的窗口或项目内 run.log / log/xx.log。
if not "%~2"=="nopause" pause
