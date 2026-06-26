document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  if (!form) return;

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
      `👤 <b>${data.name}</b>`,
      `🏢 ${data.business || 'не указан'}`,
      `📱 ${data.contact}`,
      data.task ? `\n📋 <i>${data.task}</i>` : '',
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

  function saveLeadToCRM(data) {
    try {
      const leads = JSON.parse(localStorage.getItem('uq_leads') || '[]');
      const uid = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      leads.unshift({
        id: uid,
        name: data.name,
        contact: data.contact,
        company: data.business,
        service: 'other',
        source: 'site',
        stage: 'new',
        priority: 'warm',
        notes: data.task || '',
        nextAction: 'Связаться и уточнить детали',
        createdAt: new Date().toISOString(),
        activity: [{ text: 'Лид создан с сайта', date: new Date().toISOString() }],
      });
      localStorage.setItem('uq_leads', JSON.stringify(leads));
    } catch {}
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
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

    saveLeadToCRM(formData);
    const sent = await sendToTelegram(formData);
    await new Promise(resolve => setTimeout(resolve, sent ? 300 : 1200));

    btn.textContent = '✓ Заявка отправлена';
    btn.classList.add('btn--success');
    liveRegion.textContent = 'Заявка успешно отправлена. Ответим в течение 2 часов.';
    form.reset();
    required.forEach(field => clearFieldError(field));

    setTimeout(() => {
      btn.textContent = originalText;
      btn.classList.remove('btn--success');
      btn.disabled = false;
      liveRegion.textContent = '';
    }, 4000);
  });

  form.querySelectorAll('[required]').forEach(field => {
    field.addEventListener('input', () => { if (field.value.trim()) clearFieldError(field); });
  });
});
