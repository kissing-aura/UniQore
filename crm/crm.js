const STAGES = [
  { id: 'new',      label: 'Новый',         cls: 'badge--new' },
  { id: 'contact',  label: 'Связались',     cls: 'badge--contact' },
  { id: 'demo',     label: 'Демо',          cls: 'badge--demo' },
  { id: 'proposal', label: 'КП отправлено', cls: 'badge--proposal' },
  { id: 'won',      label: 'Оплата ✓',     cls: 'badge--won' },
  { id: 'lost',     label: 'Архив',         cls: 'badge--lost' },
];

const SERVICES = {
  crm: 'CRM', bot: 'Бот', analytics: 'Аналитика',
  full: 'Полный пакет', other: 'Другое'
};
const SOURCES = { site: 'Сайт', tg: 'Telegram', ref: 'Рекомендация', other: 'Другое' };

// ── Storage ──────────────────────────────────────────────────────────
function load() {
  try { return JSON.parse(localStorage.getItem('uq_leads') || '[]'); } catch { return []; }
}
function save(leads) {
  localStorage.setItem('uq_leads', JSON.stringify(leads));
}
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

// ── Routing ───────────────────────────────────────────────────────────
let currentView = 'dashboard';
let currentDetailId = null;

function showView(view) {
  currentView = view;
  document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
  document.getElementById('view-' + view).classList.remove('hidden');
  document.querySelectorAll('.sidebar__link').forEach(l => {
    l.classList.toggle('active', l.dataset.view === view);
  });
  const titles = { dashboard: 'Дашборд', pipeline: 'Pipeline', leads: 'Лиды' };
  document.getElementById('viewTitle').textContent = titles[view];
  if (view === 'dashboard') renderDashboard();
  if (view === 'pipeline') renderPipeline();
  if (view === 'leads') renderLeads();
}

// ── Dashboard ─────────────────────────────────────────────────────────
function renderDashboard() {
  const leads = load();
  const total = leads.length;
  const newL = leads.filter(l => l.stage === 'new').length;
  const active = leads.filter(l => !['won','lost'].includes(l.stage)).length;
  const won = leads.filter(l => l.stage === 'won').length;
  const conv = total ? Math.round(won / total * 100) : 0;

  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-new').textContent = newL;
  document.getElementById('stat-active').textContent = active;
  document.getElementById('stat-won').textContent = won;
  document.getElementById('stat-conv').textContent = conv + '%';

  // Recent
  const recent = [...leads].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 7);
  const rl = document.getElementById('recentLeads');
  if (!recent.length) {
    rl.innerHTML = '<div style="color:var(--text-3);font-size:13px;padding:12px 0">Лидов пока нет</div>';
  } else {
    rl.innerHTML = recent.map(l => {
      const st = STAGES.find(s => s.id === l.stage);
      return `<div class="recent-item" data-id="${l.id}">
        <div class="recent-item__name">${esc(l.name)}</div>
        <span class="badge ${st.cls}">${st.label}</span>
        <div class="recent-item__date">${fmtDate(l.createdAt)}</div>
      </div>`;
    }).join('');
    rl.querySelectorAll('.recent-item').forEach(el => {
      el.addEventListener('click', () => openDetail(el.dataset.id));
    });
  }

  // Funnel
  const funnel = document.getElementById('funnelChart');
  const maxCount = Math.max(...STAGES.map(s => leads.filter(l => l.stage === s.id).length), 1);
  funnel.innerHTML = STAGES.map(s => {
    const count = leads.filter(l => l.stage === s.id).length;
    const pct = Math.round(count / maxCount * 100);
    return `<div class="funnel-row">
      <div class="funnel-row__label">${s.label}</div>
      <div class="funnel-row__bar-wrap"><div class="funnel-row__bar" style="width:${pct}%"></div></div>
      <div class="funnel-row__count">${count}</div>
    </div>`;
  }).join('');
}

// ── Pipeline ──────────────────────────────────────────────────────────
function renderPipeline() {
  const leads = load();
  const board = document.getElementById('pipelineBoard');
  board.innerHTML = STAGES.map(s => {
    const cards = leads.filter(l => l.stage === s.id);
    return `<div class="pipeline-col" data-stage="${s.id}">
      <div class="pipeline-col__head">
        <span class="pipeline-col__name">${s.label}</span>
        <span class="pipeline-col__count">${cards.length}</span>
      </div>
      <div class="pipeline-col__cards">
        ${cards.map(l => `
          <div class="pipeline-card" data-id="${l.id}">
            <div class="pipeline-card__name">${esc(l.name)}</div>
            <div class="pipeline-card__meta">
              <span class="pipeline-card__service">${SERVICES[l.service] || ''}</span>
              <span class="pipeline-card__date">${fmtDate(l.createdAt)}</span>
            </div>
          </div>`).join('')}
      </div>
    </div>`;
  }).join('');

  board.querySelectorAll('.pipeline-card').forEach(el => {
    el.addEventListener('click', () => openDetail(el.dataset.id));
  });
}

// ── Leads table ───────────────────────────────────────────────────────
function renderLeads() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const stageF = document.getElementById('filterStage').value;
  const serviceF = document.getElementById('filterService').value;

  let leads = load().filter(l => {
    const matchSearch = !search ||
      l.name.toLowerCase().includes(search) ||
      l.contact.toLowerCase().includes(search);
    const matchStage = !stageF || l.stage === stageF;
    const matchService = !serviceF || l.service === serviceF;
    return matchSearch && matchStage && matchService;
  }).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

  const tbody = document.getElementById('leadsTableBody');
  const empty = document.getElementById('leadsEmpty');

  if (!leads.length) {
    tbody.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  tbody.innerHTML = leads.map(l => {
    const st = STAGES.find(s => s.id === l.stage);
    return `<tr data-id="${l.id}">
      <td><b>${esc(l.name)}</b></td>
      <td style="color:var(--text-2)">${esc(l.contact)}</td>
      <td>${SERVICES[l.service] || '—'}</td>
      <td><span class="badge ${st.cls}">${st.label}</span></td>
      <td class="source-tag">${SOURCES[l.source] || '—'}</td>
      <td style="color:var(--text-3)">${fmtDate(l.createdAt)}</td>
      <td style="text-align:right">
        <button class="btn-icon" onclick="event.stopPropagation();openEdit('${l.id}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" stroke-width="1.5"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="1.5"/></svg>
        </button>
      </td>
    </tr>`;
  }).join('');

  tbody.querySelectorAll('tr').forEach(row => {
    row.addEventListener('click', () => openDetail(row.dataset.id));
  });
}

// ── Modal: Add/Edit ───────────────────────────────────────────────────
function openAdd() {
  document.getElementById('modalTitle').textContent = 'Новый лид';
  document.getElementById('leadId').value = '';
  document.getElementById('leadForm').reset();
  document.getElementById('modalOverlay').classList.remove('hidden');
}

function openEdit(id) {
  const leads = load();
  const lead = leads.find(l => l.id === id);
  if (!lead) return;
  document.getElementById('modalTitle').textContent = 'Редактировать';
  document.getElementById('leadId').value = lead.id;
  document.getElementById('fName').value = lead.name;
  document.getElementById('fContact').value = lead.contact;
  document.getElementById('fService').value = lead.service;
  document.getElementById('fSource').value = lead.source;
  document.getElementById('fStage').value = lead.stage;
  document.getElementById('fBudget').value = lead.budget || '';
  document.getElementById('fNotes').value = lead.notes || '';
  document.getElementById('modalOverlay').classList.remove('hidden');
  document.getElementById('detailOverlay').classList.add('hidden');
}

document.getElementById('leadForm').addEventListener('submit', e => {
  e.preventDefault();
  const leads = load();
  const id = document.getElementById('leadId').value;
  const data = {
    name:    document.getElementById('fName').value.trim(),
    contact: document.getElementById('fContact').value.trim(),
    service: document.getElementById('fService').value,
    source:  document.getElementById('fSource').value,
    stage:   document.getElementById('fStage').value,
    budget:  document.getElementById('fBudget').value,
    notes:   document.getElementById('fNotes').value.trim(),
  };

  if (id) {
    const idx = leads.findIndex(l => l.id === id);
    const old = leads[idx];
    if (old.stage !== data.stage) {
      const st = STAGES.find(s => s.id === data.stage);
      old.activity = old.activity || [];
      old.activity.push({ text: `Этап изменён на "${st.label}"`, date: new Date().toISOString() });
    }
    leads[idx] = { ...old, ...data };
  } else {
    leads.unshift({ id: uid(), ...data, createdAt: new Date().toISOString(), activity: [] });
  }

  save(leads);
  document.getElementById('modalOverlay').classList.add('hidden');
  refresh();
});

// ── Modal: Detail ─────────────────────────────────────────────────────
function openDetail(id) {
  const leads = load();
  const lead = leads.find(l => l.id === id);
  if (!lead) return;
  currentDetailId = id;

  document.getElementById('detailName').textContent = lead.name;

  const st = STAGES.find(s => s.id === lead.stage);
  const stIdx = STAGES.findIndex(s => s.id === lead.stage);

  document.getElementById('detailInfo').innerHTML = [
    { label: 'Контакт', val: lead.contact },
    { label: 'Услуга', val: SERVICES[lead.service] || '—' },
    { label: 'Источник', val: SOURCES[lead.source] || '—' },
    { label: 'Бюджет', val: lead.budget ? lead.budget + ' ₽' : '—' },
    { label: 'Этап', val: `<span class="badge ${st.cls}">${st.label}</span>` },
    { label: 'Добавлен', val: fmtDate(lead.createdAt) },
  ].map(f => `<div class="detail-field">
    <div class="detail-field__label">${f.label}</div>
    <div class="detail-field__val">${f.val}</div>
  </div>`).join('');

  document.getElementById('detailStageBar').innerHTML = STAGES.map((s, i) => {
    const cls = i < stIdx ? 'done' : i === stIdx ? 'active' : '';
    return `<div class="stage-step ${cls}" title="${s.label}" data-stage="${s.id}"></div>`;
  }).join('');

  document.getElementById('detailStageBar').querySelectorAll('.stage-step').forEach(el => {
    el.addEventListener('click', () => {
      updateStage(id, el.dataset.stage);
      openDetail(id);
    });
  });

  document.getElementById('detailNotes').textContent = lead.notes || 'Нет заметок';

  const activity = lead.activity || [];
  document.getElementById('detailActivity').innerHTML = activity.length
    ? [...activity].reverse().map(a => `
        <div class="activity-entry">
          <div class="activity-entry__dot"></div>
          <div style="flex:1">${esc(a.text)}</div>
          <div class="activity-entry__date">${fmtDate(a.date)}</div>
        </div>`).join('')
    : '<div style="color:var(--text-3);font-size:13px">Пусто</div>';

  document.getElementById('activityInput').value = '';
  document.getElementById('detailOverlay').classList.remove('hidden');
}

function updateStage(id, stage) {
  const leads = load();
  const lead = leads.find(l => l.id === id);
  if (!lead || lead.stage === stage) return;
  const st = STAGES.find(s => s.id === stage);
  lead.activity = lead.activity || [];
  lead.activity.push({ text: `Этап: ${st.label}`, date: new Date().toISOString() });
  lead.stage = stage;
  save(leads);
  refresh();
}

document.getElementById('activityAddBtn').addEventListener('click', () => {
  const input = document.getElementById('activityInput');
  const text = input.value.trim();
  if (!text || !currentDetailId) return;
  const leads = load();
  const lead = leads.find(l => l.id === currentDetailId);
  if (!lead) return;
  lead.activity = lead.activity || [];
  lead.activity.push({ text, date: new Date().toISOString() });
  save(leads);
  input.value = '';
  openDetail(currentDetailId);
});

document.getElementById('activityInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('activityAddBtn').click();
});

document.getElementById('editFromDetail').addEventListener('click', () => {
  if (currentDetailId) openEdit(currentDetailId);
});

document.getElementById('deleteFromDetail').addEventListener('click', () => {
  if (!currentDetailId) return;
  if (!confirm('Удалить лид?')) return;
  const leads = load().filter(l => l.id !== currentDetailId);
  save(leads);
  document.getElementById('detailOverlay').classList.add('hidden');
  refresh();
});

// ── Close modals ──────────────────────────────────────────────────────
['modalClose', 'modalCancel'].forEach(id => {
  document.getElementById(id).addEventListener('click', () => {
    document.getElementById('modalOverlay').classList.add('hidden');
  });
});
document.getElementById('detailClose').addEventListener('click', () => {
  document.getElementById('detailOverlay').classList.add('hidden');
});
document.getElementById('modalOverlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modalOverlay'))
    document.getElementById('modalOverlay').classList.add('hidden');
});
document.getElementById('detailOverlay').addEventListener('click', e => {
  if (e.target === document.getElementById('detailOverlay'))
    document.getElementById('detailOverlay').classList.add('hidden');
});

// ── Misc ──────────────────────────────────────────────────────────────
document.getElementById('addLeadBtn').addEventListener('click', openAdd);

document.getElementById('exportBtn').addEventListener('click', () => {
  const data = JSON.stringify(load(), null, 2);
  const a = document.createElement('a');
  a.href = 'data:application/json,' + encodeURIComponent(data);
  a.download = 'uniqore-leads-' + new Date().toISOString().slice(0,10) + '.json';
  a.click();
});

document.querySelectorAll('.sidebar__link, .dash-card__more').forEach(el => {
  el.addEventListener('click', e => {
    e.preventDefault();
    if (el.dataset.view) showView(el.dataset.view);
  });
});

document.getElementById('searchInput').addEventListener('input', () => renderLeads());
document.getElementById('filterStage').addEventListener('change', () => renderLeads());
document.getElementById('filterService').addEventListener('change', () => renderLeads());

function refresh() {
  if (currentView === 'dashboard') renderDashboard();
  if (currentView === 'pipeline') renderPipeline();
  if (currentView === 'leads') renderLeads();
}

function esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Init ──────────────────────────────────────────────────────────────
showView('dashboard');
