// Toast
function toast(text, ok = true) {
  const el = document.getElementById('toast');
  el.textContent = text;
  el.style.background = ok ? '#16a34a' : '#dc2626';
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2200);
}
function showMsg(form, text, ok) {
  const el = form.querySelector('.msg');
  el.textContent = text;
  el.className = 'msg ' + (ok ? 'ok' : 'err');
}

// 暗色主题（首页也记忆）
const saved = localStorage.getItem('theme');
if (saved === 'dark') document.body.classList.add('dark');
document.getElementById('theme')?.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});

// 页签切换
const tabs = document.querySelectorAll('.tab');
const forms = { login: document.getElementById('loginForm'), register: document.getElementById('registerForm') };
tabs.forEach((t) =>
  t.addEventListener('click', () => {
    tabs.forEach((x) => x.classList.remove('active'));
    t.classList.add('active');
    Object.values(forms).forEach((f) => f.classList.remove('active'));
    forms[t.dataset.tab].classList.add('active');
  })
);

// 显示/隐藏密码
document.querySelectorAll('.toggle').forEach((btn) => {
  btn.addEventListener('click', () => {
    const input = document.querySelector(`#${btn.dataset.target} input[type="password"]`);
    if (!input) return;
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    btn.textContent = show ? '隐藏' : '显示';
  });
});

// 密码强度
const regPw = document.querySelector('#registerForm input[name="password"]');
const bar = document.querySelector('.strength .bar span');
const label = document.querySelector('.strength-label');
function score(pw) {
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}
regPw?.addEventListener('input', () => {
  const s = score(regPw.value);
  const pct = [0, 20, 40, 60, 80, 100][s];
  const colors = ['#dc2626', '#dc2626', '#f59e0b', '#eab308', '#84cc16', '#16a34a'];
  bar.style.width = pct + '%';
  bar.style.background = colors[s];
  label.textContent = '密码强度：' + ['—', '很弱', '弱', '中等', '强', '很强'][s];
});

// 登录
forms.login.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(forms.login);
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: fd.get('username'),
      password: fd.get('password'),
      remember: fd.get('remember') === 'on',
    }),
  });
  const data = await res.json();
  if (res.ok) {
    showMsg(forms.login, data.message, true);
    toast('登录成功 🎉');
    setTimeout(() => (location.href = '/dashboard'), 600);
  } else {
    showMsg(forms.login, data.error, false);
  }
});

// 注册
forms.register.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(forms.register);
  const res = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: fd.get('username'), password: fd.get('password') }),
  });
  const data = await res.json();
  if (res.ok) {
    showMsg(forms.register, data.message, true);
    toast('注册成功，请登录');
    forms.register.reset();
    bar.style.width = '0';
    label.textContent = '密码强度：—';
    tabs[0].click();
  } else {
    showMsg(forms.register, data.error, false);
  }
});
