'use strict';

// ── Constants ─────────────────────────────────────────────────────────
const STAGES = [
  { id:'new',      label:'Новый',     cls:'badge--new',      color:'#60a5fa' },
  { id:'contact',  label:'Связались', cls:'badge--contact',  color:'#f5c518' },
  { id:'demo',     label:'Демо',      cls:'badge--demo',     color:'#a78bfa' },
  { id:'proposal', label:'КП',        cls:'badge--proposal', color:'#fb923c' },
  { id:'won',      label:'Оплата ✓', cls:'badge--won',      color:'#4ade80' },
  { id:'lost',     label:'Архив',     cls:'badge--lost',     color:'#4b5563' },
];
const SERVICES = { crm:'CRM', bot:'Бот', analytics:'Аналитика', full:'Полный пакет', other:'Другое' };
const SOURCES  = { site:'Сайт', tg:'Telegram', ref:'Рекомендация', other:'Другое' };
const PRIORITY_ICONS = { hot:'🔴', warm:'🟡', cold:'🔵' };
const PRIORITY_LABELS = { hot:'Горячий', warm:'Тёплый', cold:'Холодный' };

// ── Storage ───────────────────────────────────────────────────────────
function load() {
  try { return JSON.parse(localStorage.getItem('uq2_leads') || '[]'); } catch { return []; }
}
function save(leads) { localStorage.setItem('uq2_leads', JSON.stringify(leads)); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

// ── Helpers ───────────────────────────────────────────────────────────
function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day:'2-digit', month:'2-digit', year:'2-digit' });
}

function fmtMoney(n) {
  if (!n) return '—';
  return Number(n).toLocaleString('ru-RU') + ' ₽';
}

function daysSince(iso) {
  if (!iso) return 0;
  return Math.floor((Date.now() - new Date(iso)) / 86400000);
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date(new Date().toDateString());
}

function isToday(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr).toDateString() === new Date().toDateString();
}

function stageBadge(stageId) {
  const s = STAGES.find(x => x.id === stageId) || STAGES[0];
  return `<span class="badge ${s.cls}">${s.label}</span>`;
}

function priorityDot(p) {
  return `<span class="p-dot p-dot--${p||'warm'}"></span>`;
}

// ── View routing ──────────────────────────────────────────────────────
let view = 'dashboard';
let detailId = null;

function showView(v) {
  view = v;
  document.querySelectorAll('.view').forEach(el => el.classList.add('hidden'));
  document.getElementById('view-' + v).classList.remove('hidden');
  document.querySelectorAll('.nav__item').forEach(el => el.classList.toggle('active', el.dataset.view === v));
  document.getElementById('pageTitle').textContent = { dashboard:'Дашборд', kanban:'Pipeline', leads:'Лиды' }[v];
  if (v === 'dashboard') renderDashboard();
  if (v === 'kanban')    renderKanban();
  if (v === 'leads')     renderLeads();
}

function refresh() { showView(view); }

// ── Dashboard ─────────────────────────────────────────────────────────
function renderDashboard() {
  const leads = load();
  const active = leads.filter(l => !['won','lost'].includes(l.stage));
  const won = leads.filter(l => l.stage === 'won');
  const hot = leads.filter(l => l.priority === 'hot' && l.stage !== 'lost');
  const revenue = active.reduce((s, l) => s + (Number(l.budget) || 0), 0);
  const conv = leads.length ? Math.round(won.length / leads.length * 100) : 0;

  document.getElementById('kpi-revenue').textContent = revenue ? revenue.toLocaleString('ru-RU') + ' ₽' : '0 ₽';
  document.getElementById('kpi-revenue-sub').textContent = `${active.length} активных лидов`;
  document.getElementById('kpi-total').textContent = leads.length;
  document.getElementById('kpi-total-sub').textContent = `${won.length} закрыто, ${leads.filter(l=>l.stage==='lost').length} в архиве`;
  document.getElementById('kpi-conv').textContent = conv + '%';
  document.getElementById('kpi-hot').textContent = hot.length;

  // Funnel chart
  drawFunnelChart(leads);

  // Follow-ups
  const followups = leads.filter(l => l.nextActionDate && (isToday(l.nextActionDate) || isOverdue(l.nextActionDate)) && l.stage !== 'lost');
  const fcEl = document.getElementById('followupCount');
  if (followups.length) { fcEl.textContent = followups.length; fcEl.style.display = ''; }
  else fcEl.style.display = 'none';

  const fuList = document.getElementById('followupList');
  fuList.innerHTML = followups.length
    ? followups.slice(0,5).map(l => {
        const overdue = isOverdue(l.nextActionDate);
        return `<div class="lead-item" data-id="${l.id}">
          ${priorityDot(l.priority)}
          <div class="lead-item__name">${esc(l.name)}</div>
          <div class="lead-item__right">
            <div class="lead-item__action ${overdue?'lead-item__overdue':''}">${esc(l.nextAction||'Follow-up')}</div>
            <div class="lead-item__date ${overdue?'lead-item__overdue':''}">${fmtDate(l.nextActionDate)}</div>
          </div>
        </div>`;
      }).join('')
    : '<div class="empty-hint">Нет задач на сегодня 🎉</div>';

  // Hot leads
  const hotList = document.getElementById('hotLeadsList');
  hotList.innerHTML = hot.length
    ? hot.slice(0,6).map(l => `
        <div class="lead-item" data-id="${l.id}">
          <div class="p-dot p-dot--hot"></div>
          <div class="lead-item__name">${esc(l.name)}</div>
          <div class="lead-item__right">
            ${stageBadge(l.stage)}
            <div class="lead-item__date">${l.budget ? Number(l.budget).toLocaleString('ru-RU')+' ₽' : ''}</div>
          </div>
        </div>`).join('')
    : '<div class="empty-hint">Горячих лидов нет</div>';

  // Recent
  const recent = [...leads].sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt)).slice(0,6);
  document.getElementById('recentList').innerHTML = recent.length
    ? recent.map(l => `
        <div class="lead-item" data-id="${l.id}">
          ${priorityDot(l.priority)}
          <div class="lead-item__name">${esc(l.name)}</div>
          <div class="lead-item__right">
            ${stageBadge(l.stage)}
            <div class="lead-item__date">${fmtDate(l.createdAt)}</div>
          </div>
        </div>`).join('')
    : '<div class="empty-hint">Добавь первый лид</div>';

  // Click to open detail
  document.querySelectorAll('.lead-item[data-id]').forEach(el => {
    el.addEventListener('click', () => openDetail(el.dataset.id));
  });
}

function drawFunnelChart(leads) {
  const canvas = document.getElementById('funnelCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.offsetWidth || 500;
  canvas.width = W;
  canvas.height = 200;
  ctx.clearRect(0, 0, W, 200);

  const stages = STAGES.slice(0,5);
  const counts = stages.map(s => leads.filter(l => l.stage === s.id).length);
  const revenues = stages.map(s => leads.filter(l => l.stage === s.id).reduce((sum,l) => sum+(Number(l.budget)||0), 0));
  const max = Math.max(...counts, 1);

  const barH = 22, gap = 8, startY = 10, labelW = 90;
  const barMaxW = W - labelW - 60;

  stages.forEach((s, i) => {
    const y = startY + i * (barH + gap);
    const barW = (counts[i] / max) * barMaxW;

    // Label
    ctx.font = '11px -apple-system,sans-serif';
    ctx.fillStyle = 'rgba(240,240,244,0.4)';
    ctx.textAlign = 'left';
    ctx.fillText(s.label, 0, y + barH / 2 + 4);

    // Track
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    roundRect(ctx, labelW, y, barMaxW, barH, 4);
    ctx.fill();

    // Bar
    if (barW > 0) {
      const grad = ctx.createLinearGradient(labelW, 0, labelW + barW, 0);
      grad.addColorStop(0, s.color);
      grad.addColorStop(1, s.color + '80');
      ctx.fillStyle = grad;
      roundRect(ctx, labelW, y, barW, barH, 4);
      ctx.fill();
    }

    // Count
    ctx.font = '12px -apple-system,sans-serif';
    ctx.fillStyle = counts[i] ? 'rgba(240,240,244,0.9)' : 'rgba(240,240,244,0.2)';
    ctx.textAlign = 'left';
    ctx.fillText(counts[i], labelW + barMaxW + 10, y + barH/2 + 4);

    // Revenue
    if (revenues[i]) {
      ctx.font = '11px -apple-system,sans-serif';
      ctx.fillStyle = 'rgba(245,197,24,0.7)';
      ctx.textAlign = 'right';
      const revStr = revenues[i] >= 1000 ? (revenues[i]/1000).toFixed(0)+'к ₽' : revenues[i]+'₽';
      ctx.fillText(revStr, W, y + barH/2 + 4);
    }
  });
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ── Kanban ────────────────────────────────────────────────────────────
let dragId = null;

function renderKanban() {
  const leads = load();
  const board = document.getElementById('kanbanBoard');
  board.innerHTML = STAGES.map(s => {
    const cards = leads.filter(l => l.stage === s.id);
    const rev = cards.reduce((sum,l) => sum+(Number(l.budget)||0), 0);
    return `<div class="k-col" data-stage="${s.id}">
      <div class="k-col__head">
        <div class="k-col__title">${s.label}</div>
        <div class="k-col__meta">
          ${rev ? `<span class="k-col__rev">${rev >= 1000 ? (rev/1000).toFixed(0)+'к' : rev}₽</span>` : ''}
          <span class="k-col__count">${cards.length}</span>
        </div>
      </div>
      <div class="k-cards" data-stage="${s.id}">
        ${cards.map(l => kanbanCard(l)).join('')}
      </div>
    </div>`;
  }).join('');

  // Drag events
  board.querySelectorAll('.k-card').forEach(el => {
    el.setAttribute('draggable', true);
    el.addEventListener('dragstart', e => { dragId = el.dataset.id; el.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; });
    el.addEventListener('dragend', () => { el.classList.remove('dragging'); document.querySelectorAll('.k-cards').forEach(c=>c.classList.remove('drag-over')); });
    el.addEventListener('click', () => openDetail(el.dataset.id));
  });

  board.querySelectorAll('.k-cards').forEach(zone => {
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      if (!dragId) return;
      const newStage = zone.dataset.stage;
      const leads = load();
      const lead = leads.find(l => l.id === dragId);
      if (lead && lead.stage !== newStage) {
        const st = STAGES.find(s => s.id === newStage);
        lead.activity = lead.activity || [];
        lead.activity.push({ text: `Этап → ${st.label}`, date: new Date().toISOString() });
        lead.stage = newStage;
        lead.updatedAt = new Date().toISOString();
        save(leads);
        renderKanban();
      }
      dragId = null;
    });
  });
}

function kanbanCard(l) {
  const days = daysSince(l.createdAt);
  const nextStr = l.nextAction ? `<div class="k-card__next ${isOverdue(l.nextActionDate)?'overdue':''}">⏰ ${esc(l.nextAction)}${l.nextActionDate?' · '+fmtDate(l.nextActionDate):''}</div>` : '';
  return `<div class="k-card" data-id="${l.id}">
    ${days > 3 ? `<div class="k-card__days">${days}д</div>` : ''}
    <div class="k-card__top">
      <div class="k-card__name">${esc(l.name)}</div>
      <div class="k-card__priority">${PRIORITY_ICONS[l.priority]||'🟡'}</div>
    </div>
    <div class="k-card__service">${SERVICES[l.service]||''}</div>
    <div class="k-card__bottom">
      <div class="k-card__budget">${l.budget ? Number(l.budget).toLocaleString('ru-RU')+' ₽' : ''}</div>
      <div class="k-card__date">${fmtDate(l.createdAt)}</div>
    </div>
    ${nextStr}
  </div>`;
}

// ── Leads Table ───────────────────────────────────────────────────────
function renderLeads() {
  const search = (document.getElementById('tableSearch').value || '').toLowerCase();
  const sf = document.getElementById('filterStage').value;
  const pf = document.getElementById('filterPriority').value;
  const srvf = document.getElementById('filterService').value;

  const leads = load().filter(l => {
    const ms = !search || l.name.toLowerCase().includes(search) || (l.contact||'').toLowerCase().includes(search) || (l.company||'').toLowerCase().includes(search);
    return ms && (!sf||l.stage===sf) && (!pf||l.priority===pf) && (!srvf||l.service===srvf);
  }).sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt));

  const tbody = document.getElementById('tableBody');
  const empty = document.getElementById('tableEmpty');

  if (!leads.length) { tbody.innerHTML=''; empty.classList.remove('hidden'); return; }
  empty.classList.add('hidden');

  tbody.innerHTML = leads.map(l => `
    <tr data-id="${l.id}">
      <td><b>${esc(l.name)}</b>${l.company?`<div style="font-size:11px;color:var(--t3)">${esc(l.company)}</div>`:''}</td>
      <td style="color:var(--t2)">${esc(l.contact)}</td>
      <td>${SERVICES[l.service]||'—'}</td>
      <td>${stageBadge(l.stage)}</td>
      <td>${priorityDot(l.priority)} <span style="font-size:12px;color:var(--t2)">${PRIORITY_LABELS[l.priority]||''}</span></td>
      <td style="color:var(--acc);font-weight:600">${l.budget ? Number(l.budget).toLocaleString('ru-RU')+' ₽' : '—'}</td>
      <td>
        ${l.nextAction ? `<div style="font-size:12px">${esc(l.nextAction)}</div>` : ''}
        ${l.nextActionDate ? `<div style="font-size:11px;color:${isOverdue(l.nextActionDate)?'var(--red)':'var(--t3)'}">${fmtDate(l.nextActionDate)}</div>` : ''}
      </td>
      <td style="color:var(--t3);font-size:12px">${fmtDate(l.createdAt)}</td>
      <td><button class="icon-btn" onclick="event.stopPropagation();openEdit('${l.id}')">✏️</button></td>
    </tr>`).join('');

  tbody.querySelectorAll('tr').forEach(row => row.addEventListener('click', () => openDetail(row.dataset.id)));
}

// ── Form ──────────────────────────────────────────────────────────────
function openAdd() {
  document.getElementById('formTitle').textContent = 'Новый лид';
  document.getElementById('fId').value = '';
  document.getElementById('leadForm').reset();
  document.getElementById('fNextDate').value = '';
  document.getElementById('formOverlay').classList.remove('hidden');
}

function openEdit(id) {
  const lead = load().find(l => l.id === id);
  if (!lead) return;
  document.getElementById('formTitle').textContent = 'Редактировать';
  document.getElementById('fId').value = lead.id;
  document.getElementById('fName').value = lead.name;
  document.getElementById('fContact').value = lead.contact;
  document.getElementById('fCompany').value = lead.company || '';
  document.getElementById('fBudget').value = lead.budget || '';
  document.getElementById('fService').value = lead.service;
  document.getElementById('fSource').value = lead.source;
  document.getElementById('fStage').value = lead.stage;
  document.getElementById('fPriority').value = lead.priority || 'warm';
  document.getElementById('fNextAction').value = lead.nextAction || '';
  document.getElementById('fNextDate').value = lead.nextActionDate || '';
  document.getElementById('fNotes').value = lead.notes || '';
  document.getElementById('formOverlay').classList.remove('hidden');
  document.getElementById('detailOverlay').classList.add('hidden');
}

document.getElementById('leadForm').addEventListener('submit', e => {
  e.preventDefault();
  const leads = load();
  const id = document.getElementById('fId').value;
  const data = {
    name:           document.getElementById('fName').value.trim(),
    contact:        document.getElementById('fContact').value.trim(),
    company:        document.getElementById('fCompany').value.trim(),
    budget:         document.getElementById('fBudget').value,
    service:        document.getElementById('fService').value,
    source:         document.getElementById('fSource').value,
    stage:          document.getElementById('fStage').value,
    priority:       document.getElementById('fPriority').value,
    nextAction:     document.getElementById('fNextAction').value.trim(),
    nextActionDate: document.getElementById('fNextDate').value,
    notes:          document.getElementById('fNotes').value.trim(),
    updatedAt:      new Date().toISOString(),
  };

  if (id) {
    const idx = leads.findIndex(l => l.id === id);
    const old = leads[idx];
    if (old.stage !== data.stage) {
      const st = STAGES.find(s => s.id === data.stage);
      old.activity = old.activity || [];
      old.activity.push({ text:`Этап → ${st.label}`, date:new Date().toISOString() });
    }
    leads[idx] = { ...old, ...data };
  } else {
    leads.unshift({ id:uid(), ...data, createdAt:new Date().toISOString(), activity:[] });
  }

  save(leads);
  document.getElementById('formOverlay').classList.add('hidden');
  refresh();
});

// ── Detail ────────────────────────────────────────────────────────────
function openDetail(id) {
  const lead = load().find(l => l.id === id);
  if (!lead) return;
  detailId = id;

  document.getElementById('dName').textContent = lead.name;
  document.getElementById('dCompany').textContent = lead.company ? `${lead.company} · ${SOURCES[lead.source]||''}` : (SOURCES[lead.source]||'');

  // Stage track
  const stIdx = STAGES.findIndex(s => s.id === lead.stage);
  document.getElementById('stageTrack').innerHTML = STAGES.map((s,i) =>
    `<div class="stage-step ${i<stIdx?'done':i===stIdx?'active':''}" title="${s.label}" data-stage="${s.id}"></div>`
  ).join('');
  document.getElementById('stageTrack').querySelectorAll('.stage-step').forEach(el => {
    el.addEventListener('click', () => { updateStage(id, el.dataset.stage); openDetail(id); });
  });

  // Info grid
  document.getElementById('dGrid').innerHTML = [
    ['Контакт', esc(lead.contact)],
    ['Услуга', SERVICES[lead.service]||'—'],
    ['Приоритет', PRIORITY_ICONS[lead.priority]+' '+PRIORITY_LABELS[lead.priority]],
    ['Бюджет', lead.budget ? Number(lead.budget).toLocaleString('ru-RU')+' ₽' : '—'],
    ['Источник', SOURCES[lead.source]||'—'],
    ['Добавлен', fmtDate(lead.createdAt)],
  ].map(([l,v]) => `<div class="detail-field"><div class="ds-label">${l}</div><div class="ds-val">${v}</div></div>`).join('');

  // Next action
  const nw = document.getElementById('dNextWrap');
  if (lead.nextAction) {
    nw.style.display = '';
    const od = isOverdue(lead.nextActionDate);
    document.getElementById('dNext').innerHTML = `${esc(lead.nextAction)}${lead.nextActionDate?` <span style="font-size:12px;color:${od?'var(--red)':'var(--t3)'}">· ${fmtDate(lead.nextActionDate)}</span>`:''}`;
  } else {
    nw.style.display = 'none';
  }

  document.getElementById('dNotes').textContent = lead.notes || 'Нет заметок';

  // Activity
  renderActivity(lead);

  document.getElementById('actInput').value = '';
  document.getElementById('detailOverlay').classList.remove('hidden');
}

function renderActivity(lead) {
  const activity = (lead.activity || []);
  document.getElementById('dActivity').innerHTML = activity.length
    ? [...activity].reverse().map((a,i,arr) => `
        <div class="act-entry">
          <div class="act-entry__line">
            <div class="act-entry__dot"></div>
            ${i < arr.length-1 ? '<div class="act-entry__bar"></div>' : ''}
          </div>
          <div class="act-entry__text">${esc(a.text)}</div>
          <div class="act-entry__date">${fmtDate(a.date)}</div>
        </div>`).join('')
    : '<div style="font-size:13px;color:var(--t3)">История пуста</div>';
}

function updateStage(id, stageId) {
  const leads = load();
  const lead = leads.find(l => l.id === id);
  if (!lead || lead.stage === stageId) return;
  const st = STAGES.find(s => s.id === stageId);
  lead.activity = lead.activity || [];
  lead.activity.push({ text:`Этап → ${st.label}`, date:new Date().toISOString() });
  lead.stage = stageId;
  lead.updatedAt = new Date().toISOString();
  save(leads);
  refresh();
}

document.getElementById('actAdd').addEventListener('click', () => {
  const input = document.getElementById('actInput');
  const text = input.value.trim();
  if (!text || !detailId) return;
  const leads = load();
  const lead = leads.find(l => l.id === detailId);
  if (!lead) return;
  lead.activity = lead.activity || [];
  lead.activity.push({ text, date:new Date().toISOString() });
  save(leads);
  input.value = '';
  renderActivity(lead);
});

document.getElementById('actInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('actAdd').click();
});

document.getElementById('dEdit').addEventListener('click', () => detailId && openEdit(detailId));

document.getElementById('dDelete').addEventListener('click', () => {
  if (!detailId || !confirm('Удалить лид?')) return;
  save(load().filter(l => l.id !== detailId));
  document.getElementById('detailOverlay').classList.add('hidden');
  refresh();
});

// ── Close overlays ────────────────────────────────────────────────────
['formClose','formCancel'].forEach(id => document.getElementById(id).addEventListener('click', () => document.getElementById('formOverlay').classList.add('hidden')));
document.getElementById('detailClose').addEventListener('click', () => document.getElementById('detailOverlay').classList.add('hidden'));
document.getElementById('formOverlay').addEventListener('click', e => { if(e.target.id==='formOverlay') document.getElementById('formOverlay').classList.add('hidden'); });
document.getElementById('detailOverlay').addEventListener('click', e => { if(e.target.id==='detailOverlay') document.getElementById('detailOverlay').classList.add('hidden'); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.getElementById('formOverlay').classList.add('hidden');
    document.getElementById('detailOverlay').classList.add('hidden');
  }
});

// ── Search global ─────────────────────────────────────────────────────
document.getElementById('globalSearch').addEventListener('input', e => {
  const q = e.target.value.trim();
  if (!q) return;
  document.getElementById('tableSearch').value = q;
  showView('leads');
  renderLeads();
});

// ── Bind all add buttons ──────────────────────────────────────────────
['addLeadSide','addLeadTop'].forEach(id => document.getElementById(id).addEventListener('click', openAdd));

// ── Export ────────────────────────────────────────────────────────────
document.getElementById('exportBtn').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = 'data:application/json,' + encodeURIComponent(JSON.stringify(load(), null, 2));
  a.download = 'uniqore-crm-' + new Date().toISOString().slice(0,10) + '.json';
  a.click();
});

// ── Nav ───────────────────────────────────────────────────────────────
document.querySelectorAll('.nav__item').forEach(el => {
  el.addEventListener('click', e => { e.preventDefault(); showView(el.dataset.view); });
});

// ── Table filters ─────────────────────────────────────────────────────
['tableSearch','filterStage','filterPriority','filterService'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', renderLeads);
  document.getElementById(id)?.addEventListener('change', renderLeads);
});

// ── Canvas resize ─────────────────────────────────────────────────────
window.addEventListener('resize', () => { if (view === 'dashboard') drawFunnelChart(load()); });

// ── Init ──────────────────────────────────────────────────────────────
showView('dashboard');
