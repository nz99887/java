# AI 启动备忘（本项目专用，给未来的自己看）

> 目的：电脑每次开机都会清空 `node_modules` 和 `target`，且项目会被重新打开。
> 下次接到“启动 / 停止项目”类请求时，**先读这个文件**，不要再从头排查环境。
> 本文件位于项目根目录，开机不会被删除（只有 node_modules / target 会被删）。

---

## 1. 项目结构（java-main 根目录下）

- `springBootTest/` —— **后端**。Spring Boot 3.4.5 + MyBatis-Plus + MySQL(Thymeleaf 登录页)。
  - 打包：`mvn -B -DskipTests clean package` → 产物 `springBootTest/target/springBootTest-0.0.1-SNAPSHOT.jar`
  - 启动：`java -jar target/...jar --spring.profiles.active=dev --server.port=8081 --server.address=0.0.0.0`
  - 数据库：MySQL `springboottest`（库已存在），账号 `root / 123456`，端口 `3306`。
  - 验证：`GET http://127.0.0.1:8081/` → 200（static/index.html）；端口 8081。
- `genshin-login-vue/` —— **前端**。Vue3 + Vite + 零依赖 Node 后端 `server.js`。
  - `npm install`（每次开机必跑，node_modules 被删）
  - `node server.js` → Node 后端端口 **3000**（`/api/*`，用 `users.json` 存用户，与 Spring Boot 无关）
  - `npm run dev` → Vite 开发服端口 **5173**，并把 `/api` 代理到 3000
  - 访问前端：`http://localhost:5173`

> ⚠️ 这两个是**相互独立**的项目：Vue 前端连的是自己的 Node 后端(3000)，**不**连 Spring Boot(8081)。
> 用户说“启动后端”通常指 `springBootTest`。

---

## 2. 环境（已确认可用，开机一般不变）

- **Java**：Zulu 21，路径 `C:\Program Files\Zulu\zulu-21`（或 `JAVA_HOME`）。项目要求 17+，21 可编译。
- **Maven**：项目**缺少 `.mvn/wrapper/`**（所以 `mvnw`/`mvnw.cmd` 用不了）。
  - 用 `%USERPROFILE%\.m2\wrapper/dists/apache-maven-3.9.16-bin/<hash>/apache-maven-3.9.16/bin/mvn.cmd`（已缓存，离线可打包）。
  - 找 Maven 的批处理写法见 `start-backend.bat`（搜索 `.m2\wrapper\dists\apache-maven-*-bin\*`）。
- **Node / npm**：在 PATH 上（系统 20.11.0，另有 managed 22）。`npm install` 需要网络/npm 源（已验证可装，约 33 包）。
- **MySQL**：`C:\Program Files\MySQL\MySQL Server 8.0`，服务名 `MySQL80`。若 3306 没监听，`net start MySQL80` 拉起。

---

## 3. 已写好的脚本（GBK 编码，相对路径，双击即用）

都在 `java-main` 根目录：

| 脚本 | 作用 |
|------|------|
| `start-backend.bat [端口] [nopause]` | Maven 打包并启动 Spring Boot（默认 8081） |
| `start-frontend.bat [nopause]` | npm install 并启动 Node(3000)+Vite(5173) |
| `start-all.bat` | 先后端后前端，一键全开 |
| `stop-project.bat` | 按端口 8081/3000/5173 结束进程（暂停项目） |

要点：
- 所有脚本**不依赖** `target` / `node_modules`（开机已被删），运行时会重新打包 / 安装。
- 服务都用 `start` 开新窗口运行，**关闭对应窗口 = 停止**；或跑 `stop-project.bat`。
- `nopause` 参数用于被 `start-all.bat` 调用时跳过末尾的 `pause`。

---

## 4. 上次实测结论（2026-10-12）

- 后端打包成功（约 6s），启动后 `Started ... in ~2.4s`，HikariPool 连上 MySQL，`user` 表 count=3。
- 前端 `npm install` 成功（33 包，29s），`node server.js` 与 `npm run dev` 均可起。
- 本机配了 HTTP 代理：`curl localhost` 会被代理拦成 502；验证时用 `127.0.0.1` + `--noproxy '*'`。

---

## 5. 给用户/自己的快速 SOP

启动后端（最快）：双击 `start-backend.bat`（约 10s 后开 `http://127.0.0.1:8081`）。
启动全部：双击 `start-all.bat`。
停止：双击 `stop-project.bat`，或关窗口。

若开机后 Maven 找不到了：多半是 `.m2` 也被清，需要重新下载 Maven 或恢复 `.mvn/wrapper`。
若 MySQL 没起：先 `net start MySQL80`。
