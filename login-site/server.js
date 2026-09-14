'use strict';

const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const USERS_FILE = path.join(__dirname, 'users.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

// ---------- 用户数据持久化（JSON 文件，零依赖）----------
let users = {};
function loadUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('加载用户数据失败，使用空用户表:', e.message);
    users = {};
  }
}
function saveUsers() {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}
loadUsers();

// ---------- 会话管理（内存）----------
const sessions = new Map(); // sid -> { username, createdAt, remember }
const SESSION_TTL = 24 * 3600; // 1 天
const REMEMBER_TTL = 30 * 24 * 3600; // 30 天

function createSession(username, remember) {
  const sid = crypto.randomBytes(32).toString('hex');
  sessions.set(sid, {
    username,
    createdAt: Date.now(),
    remember: !!remember,
    expiresAt: Date.now() + (remember ? REMEMBER_TTL : SESSION_TTL) * 1000,
  });
  return sid;
}
function getSession(sid) {
  const s = sid ? sessions.get(sid) : null;
  if (!s) return null;
  if (s.expiresAt && Date.now() > s.expiresAt) {
    sessions.delete(sid);
    return null;
  }
  return s;
}
function destroySession(sid) {
  if (sid) sessions.delete(sid);
}

// ---------- 密码哈希（scrypt 加盐）----------
function hashPassword(password, salt) {
  salt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}
function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, hash] = stored.split(':');
  const verify = crypto.scryptSync(password, salt, 64).toString('hex');
  const a = Buffer.from(hash, 'hex');
  const b = Buffer.from(verify, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// ---------- 防暴破：登录失败计数 + 锁定 ----------
const loginFails = new Map(); // key -> { count, lockUntil }
const MAX_FAILS = 5;
const LOCK_MS = 5 * 60 * 1000;
function failKey(ip, username) {
  return `${ip}|${username}`;
}
function checkLock(key) {
  const r = loginFails.get(key);
  if (r && r.lockUntil && Date.now() < r.lockUntil) {
    const left = Math.ceil((r.lockUntil - Date.now()) / 1000);
    return { locked: true, left };
  }
  return { locked: false };
}
function registerFail(key) {
  const r = loginFails.get(key) || { count: 0, lockUntil: 0 };
  r.count += 1;
  if (r.count >= MAX_FAILS) r.lockUntil = Date.now() + LOCK_MS;
  loginFails.set(key, r);
  return r;
}
function clearFail(key) {
  loginFails.delete(key);
}

// ---------- 工具函数 ----------
function getClientIp(req) {
  return (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown')
    .toString()
    .split(',')[0]
    .trim();
}
function parseCookies(req) {
  const out = {};
  const raw = req.headers.cookie;
  if (!raw) return out;
  raw.split(';').forEach((c) => {
    const idx = c.indexOf('=');
    if (idx > -1) {
      const k = c.slice(0, idx).trim();
      const v = c.slice(idx + 1).trim();
      if (k) out[k] = decodeURIComponent(v);
    }
  });
  return out;
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1e6) req.destroy();
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(new Error('请求体不是合法 JSON'));
      }
    });
    req.on('error', reject);
  });
}
function sendJSON(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}
function publicUser(u) {
  return {
    username: u.username,
    createdAt: u.createdAt || null,
    lastLogin: u.lastLogin || null,
    loginCount: u.loginCount || 0,
  };
}
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};
function serveStatic(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}
function requireAuth(req) {
  const cookies = parseCookies(req);
  const session = getSession(cookies.sid);
  return session ? session.username : null;
}

// ---------- 路由 ----------
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  if (pathname.startsWith('/api/')) {
    try {
      // 注册
      if (pathname === '/api/register' && req.method === 'POST') {
        const { username, password } = await readBody(req);
        if (!username || !password) return sendJSON(res, 400, { error: '用户名和密码不能为空' });
        if (!/^[a-zA-Z0-9_]{3,20}$/.test(username))
          return sendJSON(res, 400, { error: '用户名只能含字母/数字/下划线，3-20 位' });
        if (password.length < 6) return sendJSON(res, 400, { error: '密码至少 6 位' });
        if (users[username]) return sendJSON(res, 409, { error: '该用户名已被注册' });
        users[username] = {
          username,
          pwHash: hashPassword(password),
          createdAt: new Date().toISOString(),
          lastLogin: null,
          loginCount: 0,
        };
        saveUsers();
        return sendJSON(res, 201, { message: '注册成功，请登录' });
      }

      // 登录
      if (pathname === '/api/login' && req.method === 'POST') {
        const { username, password, remember } = await readBody(req);
        const ip = getClientIp(req);
        const key = failKey(ip, username || '');
        const lock = checkLock(key);
        if (lock.locked)
          return sendJSON(res, 429, { error: `尝试过于频繁，请 ${lock.left} 秒后再试` });

        const user = username ? users[username] : null;
        if (!user || !verifyPassword(password || '', user.pwHash)) {
          const r = registerFail(key);
          const remain = Math.max(0, MAX_FAILS - r.count);
          return sendJSON(res, 401, {
            error: remain > 0 ? `用户名或密码错误，还可尝试 ${remain} 次` : '账号已锁定 5 分钟',
          });
        }
        clearFail(key);
        user.lastLogin = new Date().toISOString();
        user.loginCount = (user.loginCount || 0) + 1;
        saveUsers();
        const sid = createSession(username, remember);
        const ttl = remember ? REMEMBER_TTL : SESSION_TTL;
        res.setHeader(
          'Set-Cookie',
          `sid=${sid}; HttpOnly; Path=/; Max-Age=${ttl}; SameSite=Lax`
        );
        return sendJSON(res, 200, { message: '登录成功', user: publicUser(user) });
      }

      // 退出
      if (pathname === '/api/logout' && req.method === 'POST') {
        const cookies = parseCookies(req);
        destroySession(cookies.sid);
        res.setHeader('Set-Cookie', 'sid=; HttpOnly; Path=/; Max-Age=0');
        return sendJSON(res, 200, { message: '已退出登录' });
      }

      // 当前用户
      if (pathname === '/api/me' && req.method === 'GET') {
        const username = requireAuth(req);
        if (!username) return sendJSON(res, 401, { error: '未登录' });
        return sendJSON(res, 200, { user: publicUser(users[username]) });
      }

      // 修改密码
      if (pathname === '/api/change-password' && req.method === 'POST') {
        const username = requireAuth(req);
        if (!username) return sendJSON(res, 401, { error: '未登录' });
        const { current, next } = await readBody(req);
        if (!verifyPassword(current || '', users[username].pwHash))
          return sendJSON(res, 400, { error: '当前密码不正确' });
        if (!next || next.length < 6) return sendJSON(res, 400, { error: '新密码至少 6 位' });
        users[username].pwHash = hashPassword(next);
        saveUsers();
        return sendJSON(res, 200, { message: '密码修改成功，请重新登录' });
      }

      return sendJSON(res, 404, { error: '接口不存在' });
    } catch (e) {
      return sendJSON(res, 400, { error: e.message || '请求处理失败' });
    }
  }

  // 受保护页面
  if (pathname === '/dashboard') {
    if (!requireAuth(req)) {
      res.writeHead(302, { Location: '/' });
      return res.end();
    }
    return serveStatic(res, path.join(PUBLIC_DIR, 'dashboard.html'));
  }

  // 静态
  let file = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const full = path.join(PUBLIC_DIR, file);
  if (!full.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }
  return serveStatic(res, full);
});

server.listen(PORT, () => {
  console.log(`登录网站已启动: http://localhost:${PORT}`);
});
