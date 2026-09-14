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
function fmt(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// 暗色主题
const saved = localStorage.getItem('theme');
if (saved === 'dark') document.body.classList.add('dark');
document.getElementById('theme').addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
  document.getElementById('theme').textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
});

(async () => {
  const res = await fetch('/api/me');
  if (!res.ok) return (location.href = '/');
  const { user } = await res.json();
  document.getElementById('who').textContent = user.username;
  document.getElementById('avatar').textContent = user.username[0].toUpperCase();
  document.getElementById('s-login').textContent = user.loginCount;
  document.getElementById('s-created').textContent = fmt(user.createdAt);
  document.getElementById('s-last').textContent = fmt(user.lastLogin);
})();

document.getElementById('logout').addEventListener('click', async () => {
  await fetch('/api/logout', { method: 'POST' });
  toast('已退出登录');
  setTimeout(() => (location.href = '/'), 500);
});

document.getElementById('pwForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const res = await fetch('/api/change-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ current: fd.get('current'), next: fd.get('next') }),
  });
  const data = await res.json();
  showMsg(e.target, data.message, res.ok);
  if (res.ok) setTimeout(() => (location.href = '/'), 900);
});
