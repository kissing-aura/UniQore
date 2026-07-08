'use strict';
/* Экран входа (Lite). Мягкий клиентский гейт — для реальной защиты см. Pro (Supabase Auth).
   Логин подставляется автоматически, сверка без регистра. Настройки — в RECIPE.auth. */
(() => {
  const R = window.RECIPE || {};
  const cfg = R.auth || {};
  if (!cfg.enabled) return;
  const KEY = (R.prefix || 'uq_') + 'auth_ok';
  if (sessionStorage.getItem(KEY) === '1') return;

  const style = document.createElement('style');
  style.textContent = `
    body.locked > *:not(#authGate){filter:blur(14px);pointer-events:none;user-select:none}
    #authGate{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;
      background:color-mix(in srgb,var(--bg) 92%,transparent);backdrop-filter:blur(8px)}
    .auth-card{width:340px;max-width:90vw;background:var(--surface);border:1px solid var(--border2);
      border-radius:var(--radius);padding:34px 30px;box-shadow:0 30px 80px rgba(0,0,0,.4)}
    .auth-mark{display:flex;align-items:center;gap:10px;margin-bottom:22px}
    .auth-mark .lg{width:32px;height:32px;border-radius:var(--radius-sm);background:var(--acc);color:var(--acc-contrast);
      display:flex;align-items:center;justify-content:center;font-weight:700}
    .auth-mark span{font-weight:700;font-size:18px;font-family:var(--font-head)}
    .auth-card label{display:block;font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:var(--text3);margin:14px 0 6px}
    .auth-card input{width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius-sm);
      padding:11px 13px;color:var(--text);font-size:14px;outline:none;font-family:inherit}
    .auth-card input:focus{border-color:var(--acc)}
    .auth-btn{width:100%;margin-top:20px;background:var(--acc);color:var(--acc-contrast);font-weight:700;
      border:none;border-radius:var(--radius-sm);padding:12px;font-size:14px;cursor:pointer}
    .auth-err{color:var(--bad);font-size:12px;margin-top:12px;min-height:16px;text-align:center}
  `;
  document.head.appendChild(style);

  function build() {
    document.body.classList.add('locked');
    const gate = document.createElement('div');
    gate.id = 'authGate';
    gate.innerHTML = `
      <form class="auth-card" id="authForm" autocomplete="off">
        <div class="auth-mark"><span class="lg">${(R.brand?.logo)||'UQ'}</span><span>${R.brand?.name||'CRM'}</span></div>
        <label>Логин</label>
        <input id="authUser" type="text" value="${cfg.user||''}">
        <label>Пароль</label>
        <input id="authPass" type="password" autofocus>
        <button class="auth-btn" type="submit">Войти</button>
        <div class="auth-err" id="authErr"></div>
      </form>`;
    document.body.appendChild(gate);

    const sha256 = async (s) => {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
      return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
    };
    document.getElementById('authForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const u = document.getElementById('authUser').value.trim();
      const hash = await sha256(document.getElementById('authPass').value);
      if (u.toLowerCase() === String(cfg.user || '').toLowerCase() && hash === cfg.passHash) {
        sessionStorage.setItem(KEY, '1'); gate.remove(); document.body.classList.remove('locked');
      } else {
        document.getElementById('authErr').textContent = 'Неверный логин или пароль';
        document.getElementById('authPass').value = '';
      }
    });
  }
  if (document.body) build(); else document.addEventListener('DOMContentLoaded', build);
})();
