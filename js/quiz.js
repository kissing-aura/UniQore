/* quiz.js — многошаговая форма-квиз в секции контактов.
   Собирает нишу/объём/учёт/контакт, пишет в скрытые поля #business/#task,
   а отправку выполняет form.js (та же цепочка → /api/leads + Telegram).
   Калькулятор потерь (#calcCta) прокидывает нишу и объём в квиз. */
document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('contact-form');
  if (!form || !form.classList.contains('quiz')) return;

  var steps = Array.prototype.slice.call(form.querySelectorAll('.quiz__step'));
  var prog = form.querySelector('.quiz__progress i');
  var stepLbl = document.getElementById('quizStep');
  var back = document.getElementById('quizBack');
  var fBusiness = document.getElementById('business');
  var fTask = document.getElementById('task');
  var picks = { niche: '', volume: '', tools: '' };
  var cur = 0;

  function render() {
    steps.forEach(function (s, i) { s.classList.toggle('is-active', i === cur); });
    if (prog) prog.style.width = ((cur + 1) / steps.length * 100) + '%';
    if (stepLbl) stepLbl.textContent = cur + 1;
    if (back) back.style.display = cur > 0 ? 'inline-block' : 'none';
    var inp = steps[cur] && steps[cur].querySelector('input');
    if (inp) setTimeout(function () { inp.focus(); }, 140);
  }

  function sync() {
    fBusiness.value = picks.niche || '';
    fTask.value = 'Заявок/мес: ' + (picks.volume || '—') + ' · Учёт сейчас: ' + (picks.tools || '—');
  }

  form.querySelectorAll('.quiz__opts').forEach(function (grp) {
    var field = grp.dataset.field;
    grp.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () {
        grp.querySelectorAll('button').forEach(function (x) { x.classList.remove('is-sel'); });
        b.classList.add('is-sel');
        picks[field] = b.dataset.v;
        sync();
        setTimeout(function () { if (cur < steps.length - 1) { cur++; render(); } }, 200);
      });
    });
  });

  if (back) back.addEventListener('click', function () { if (cur > 0) { cur--; render(); } });

  /* ── калькулятор → квиз (прокидываем выбор) ── */
  var NMAP = { restaurant: 'Доставка еды / кафе', barber: 'Услуги / студия', rent: 'Недвижимость / аренда', clinic: 'Клиника / медицина' };
  var VMAP = { '100': 'до 100', '300': '100–300', '600': '300–600', '1200': '600+' };

  function preselect(field, val) {
    var grp = form.querySelector('.quiz__opts[data-field="' + field + '"]');
    if (!grp || !val) return false;
    var b = grp.querySelector('button[data-v="' + val + '"]');
    if (!b) return false;
    grp.querySelectorAll('button').forEach(function (x) { x.classList.remove('is-sel'); });
    b.classList.add('is-sel');
    picks[field] = val;
    return true;
  }

  var cta = document.getElementById('calcCta');
  if (cta) cta.addEventListener('click', function () {
    var nb = document.querySelector('.niche-switch .is-active[data-niche]');
    var cb = document.querySelector('.mirror__opts[data-grp="clients"] button.is-active');
    var jumped = 0;
    if (nb && NMAP[nb.dataset.niche] && preselect('niche', NMAP[nb.dataset.niche])) jumped = 1;
    if (cb && VMAP[cb.dataset.v] && preselect('volume', VMAP[cb.dataset.v])) jumped = 2;
    sync();
    cur = jumped;
    render();
    // якорь #contact уже проскроллит; на всякий — плавно
    var target = document.getElementById('contact');
    if (target && target.scrollIntoView) setTimeout(function () { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 20);
  });

  render();
});
