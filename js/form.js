document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  if (!form) return;

  // Escape HTML for Telegram HTML-mode messages
  function tgEsc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  // Rate limit: 1 submission per 30 seconds
  let lastSubmit = 0;

  const liveRegion = document.createElement('div');
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.className = 'sr-only';
  form.appendChild(liveRegion);

  function setFieldError(field, message) {
    field.setAttribute('aria-invalid', 'true');
    field.classList.add('field--error');
    let errEl = document.getElementById(field.id + '-error');
    if (!errEl) {
      errEl = document.createElement('span');
      errEl.id = field.id + '-error';
      errEl.className = 'field-error';
      errEl.setAttribute('role', 'alert');
      field.parentNode.appendChild(errEl);
    }
    errEl.textContent = message;
    field.setAttribute('aria-describedby', errEl.id);
  }

  function clearFieldError(field) {
    field.removeAttribute('aria-invalid');
    field.classList.remove('field--error');
    const errEl = document.getElementById(field.id + '-error');
    if (errEl) errEl.textContent = '';
  }

  function getTgSettings() {
    try { return JSON.parse(localStorage.getItem('uq_settings') || '{}'); } catch { return {}; }
  }

  async function sendToTelegram(data) {
    const { tgToken, tgChat } = getTgSettings();
    if (!tgToken || !tgChat) return false;
    const time = new Date().toLocaleString('ru-RU', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
    const text = [
      '🔥 <b>Новая заявка — Uniqore</b>',
      '─────────────────────',
      `👤 <b>${tgEsc(data.name)}</b>`,
      `🏢 ${tgEsc(data.business || 'не указан')}`,
      `📱 ${tgEsc(data.contact)}`,
      data.task ? `\n📋 <i>${tgEsc(data.task)}</i>` : '',
      '',
      '─────────────────────',
      `🕐 ${time}`,
      `🔗 Лид добавлен в CRM автоматически`,
    ].filter(s => s !== null && s !== undefined && s !== false).join('\n');
    try {
      const res = await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: tgChat,
          text,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      });
      return (await res.json()).ok === true;
    } catch { return false; }
  }

  // Send the lead to the server API → stored in the shared CRM database
  // (visible from any device) and forwarded to Telegram server-side.
  async function postLeadToAPI(data) {
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          business: data.business,
          contact: data.contact,
          task: data.task,
          website: data.website || '', // honeypot
        }),
      });
      return res.ok;
    } catch { return false; }
  }

  // Мост напрямую в Пайплайн Uniqore Command V2 (2026-07-15) — идёт независимо от
  // postLeadToAPI выше: тот сервер (206) сохраняет лид локально, но сам не может
  // достучаться до Supabase без ручного рестарта, к которому нет доступа. Этот вызов
  // не влияет на успех/ошибку в UI — чисто best-effort копия в CRM.
  const CMD_BRIDGE_URL = 'https://wbxuwxvdovchtsodznfp.supabase.co/functions/v1/site-lead-bridge';
  const CMD_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndieHV3eHZkb3ZjaHRzb2R6bmZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NjY1MTAsImV4cCI6MjA5ODI0MjUxMH0.w1_aryP6pMM3Baj_H76tV5LGV8JiBG2Gd67r6Gw3Jq8';
  const CMD_BRIDGE_SECRET = '2dd950726e4ea4428b3af52c5950ef9c43b7afa58370a277';
  function pushToCommandV2(data) {
    fetch(CMD_BRIDGE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: CMD_ANON_KEY,
        Authorization: `Bearer ${CMD_ANON_KEY}`,
        'x-bridge-secret': CMD_BRIDGE_SECRET,
      },
      body: JSON.stringify({
        name: data.name,
        business: data.business,
        contact: data.contact,
        task: data.task,
        website: data.website || '',
      }),
    }).catch(() => {});
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;

    // Rate limit check
    const now = Date.now();
    if (now - lastSubmit < 30000) {
      liveRegion.textContent = 'Подождите немного перед повторной отправкой.';
      return;
    }

    const required = form.querySelectorAll('[required]');
    let valid = true;
    required.forEach(field => {
      if (!field.value.trim()) { setFieldError(field, 'Заполните это поле'); valid = false; }
      else clearFieldError(field);
    });
    if (!valid) { liveRegion.textContent = 'Пожалуйста, заполните все обязательные поля.'; return; }

    btn.textContent = 'Отправляем...';
    btn.disabled = true;
    liveRegion.textContent = '';

    const formData = {
      name: form.querySelector('#name')?.value?.trim() || '',
      business: form.querySelector('#business')?.value?.trim() || '',
      contact: form.querySelector('#contact-input')?.value?.trim() || '',
      task: form.querySelector('#task')?.value?.trim() || '',
    };

    lastSubmit = Date.now();
    pushToCommandV2(formData); // fire-and-forget, не ждём и не влияем на статус ниже
    // Primary: store in shared CRM database (server also notifies Telegram).
    const savedToApi = await postLeadToAPI(formData);
    // Fallback: if the API is unreachable, try client-side Telegram (owner config).
    const savedToTelegram = savedToApi ? false : await sendToTelegram(formData);
    const saved = savedToApi || savedToTelegram;
    await new Promise(resolve => setTimeout(resolve, saved ? 300 : 400));

    let tgHint = form.querySelector('.form-tg-hint');
    if (!tgHint) {
      tgHint = document.createElement('a');
      tgHint.className = 'form-tg-hint';
      tgHint.href = 'https://t.me/UniqoreManager';
      tgHint.target = '_blank'; tgHint.rel = 'noopener';
      btn.insertAdjacentElement('afterend', tgHint);
    }

    if (saved) {
      btn.textContent = '✓ Заявка отправлена';
      btn.classList.remove('btn--error');
      btn.classList.add('btn--success');
      tgHint.textContent = 'Быстрее — напишите нам в Telegram: @UniqoreManager';
      liveRegion.textContent = 'Заявка успешно отправлена. Ответим в течение 2 часов.';
      form.reset();
      required.forEach(field => clearFieldError(field));
    } else {
      // Реальный сбой (сеть/rate-limit) — раньше тут молча показывался "успех",
      // хотя заявка никуда не уходила. Честно показываем ошибку + не блокируем повтор.
      btn.textContent = 'Не отправилось, попробуйте ещё раз';
      btn.classList.remove('btn--success');
      btn.classList.add('btn--error');
      tgHint.textContent = 'Или напишите нам напрямую в Telegram: @UniqoreManager';
      liveRegion.textContent = 'Не получилось отправить заявку. Попробуйте ещё раз или напишите в Telegram.';
      lastSubmit = 0;
    }

    setTimeout(() => {
      btn.textContent = originalText;
      btn.classList.remove('btn--success', 'btn--error');
      btn.disabled = false;
      liveRegion.textContent = '';
    }, saved ? 4000 : 6000);
  });

  form.querySelectorAll('[required]').forEach(field => {
    field.addEventListener('input', () => { if (field.value.trim()) clearFieldError(field); });
  });
});
