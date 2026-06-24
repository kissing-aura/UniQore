document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;

    // Validate required fields
    const required = form.querySelectorAll('[required]');
    let valid = true;
    required.forEach(field => {
      if (!field.value.trim()) {
        field.style.borderColor = '#ef4444';
        valid = false;
      } else {
        field.style.borderColor = '';
      }
    });
    if (!valid) return;

    // Submit state
    btn.textContent = 'Отправляем...';
    btn.disabled = true;

    // Simulated submit — replace with real endpoint
    await new Promise(resolve => setTimeout(resolve, 1500));

    btn.textContent = '✓ Заявка отправлена';
    btn.style.background = '#22c55e';
    btn.style.borderColor = '#22c55e';
    btn.style.color = '#000';
    form.reset();

    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = '';
      btn.style.borderColor = '';
      btn.style.color = '';
      btn.disabled = false;
    }, 4000);
  });
});
