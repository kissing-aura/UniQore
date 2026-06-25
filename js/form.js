document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  if (!form) return;

  // Live region for screen reader announcements
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

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;

    // Validate required fields
    const required = form.querySelectorAll('[required]');
    let valid = true;
    required.forEach(field => {
      if (!field.value.trim()) {
        setFieldError(field, 'Заполните это поле');
        valid = false;
      } else {
        clearFieldError(field);
      }
    });

    if (!valid) {
      liveRegion.textContent = 'Пожалуйста, заполните все обязательные поля.';
      return;
    }

    // Submit state
    btn.textContent = 'Отправляем...';
    btn.disabled = true;
    liveRegion.textContent = '';

    // Simulated submit — replace with real endpoint
    await new Promise(resolve => setTimeout(resolve, 1500));

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

  // Clear errors on input
  form.querySelectorAll('[required]').forEach(field => {
    field.addEventListener('input', () => {
      if (field.value.trim()) clearFieldError(field);
    });
  });
});
