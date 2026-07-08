'use strict';
/* ═══════════════════════════════════════════════════════════════════════
   Uniqore factory-v2 — ДВИЖОК (rich, multi-entity). Рендерит CRM из RECIPE+темы.
   Сущности (Лиды/Сделки/Объекты/Контакты/Компании), сайдбар с группами, финансы,
   цели (план-факт), документы, календарь, справочники, аналитика, команда с ролями.
   ═══════════════════════════════════════════════════════════════════════ */
const R = window.RECIPE;
const THEME = window.applyTheme(R.theme);
if (R.navLayout) document.body.classList.remove('nav-topbar', 'nav-sidebar'), document.body.classList.add('nav-' + R.navLayout);
const NAVLAYOUT = R.navLayout || THEME.nav;
const CUR = R.currency || '₽', LOC = R.locale || 'ru-RU';

/* ── сущности ── */
const ENTITIES = (R.entities && R.entities.length) ? R.entities : [R.entity];
const ENT = {}; ENTITIES.forEach(e => ENT[e.key] = e);
const primEnt = ENTITIES[0];
const entById = k => ENT[k] || primEnt;

/* ── storage ── */
const K = n => (R.prefix || 'uq_') + n;
const parse = (k, d) => { try { return JSON.parse(localStorage.getItem(k) || d); } catch { return JSON.parse(d); } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
const DB = {
  recs: ek => parse(K('recs_' + (ek || primEnt.key)), '[]'), saveRecs: (ek, d) => save(K('recs_' + (ek || primEnt.key)), d),
  tasks: () => parse(K('tasks'), '[]'), saveTasks: d => save(K('tasks'), d),
  pays: () => parse(K('pays'), '[]'), savePays: d => save(K('pays'), d),
  team: () => parse(K('team'), '[]'), saveTeam: d => save(K('team'), d),
  docs: () => parse(K('docs'), '[]'), saveDocs: d => save(K('docs'), d),
  fin: () => parse(K('fin'), '[]'), saveFin: d => save(K('fin'), d),
  ref: k => parse(K('ref_' + k), '[]'), saveRef: (k, d) => save(K('ref_' + k), d),
  autom: () => parse(K('autom'), '[]'), saveAutom: d => save(K('autom'), d),
  kb: () => parse(K('kb'), '[]'), saveKb: d => save(K('kb'), d),
  files: () => parse(K('files'), '[]'), saveFiles: d => save(K('files'), d),
  log: () => parse(K('autolog'), '[]'), saveLog: d => save(K('autolog'), d.slice(0, 120)),
};
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

/* ── SVG-иконки (line, 24×24) — НИКАКИХ эмодзи в UI ── */
const ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>',
  spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
  bolt: '<path d="M13 2 4 14h6l-1 8 9-12h-6z"/>',
  link: '<path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
  note: '<path d="M4 4h16v12l-4 4H4z"/><path d="M16 20v-4h4"/><path d="M8 9h8M8 13h5"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
  funnel: '<path d="M3 5h18l-7 8v5l-4 2v-7z"/>',
  deal: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  chart: '<path d="M4 20V4"/><path d="M4 20h16"/><path d="M8 16v-4"/><path d="M13 16V8"/><path d="M18 16v-6"/>',
  building: '<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9 7h.01M15 7h.01M9 11h.01M15 11h.01M10 21v-3h4v3"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 21a6.5 6.5 0 0 1 13 0"/><path d="M16 5.5a3.5 3.5 0 0 1 0 6.5"/><path d="M17.5 21a6.5 6.5 0 0 0-3-5.5"/>',
  file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
  wallet: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/><path d="M16.5 14.5h.5"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  pie: '<path d="M12 3a9 9 0 1 0 9 9h-9z"/><path d="M12 3v9"/>',
  activity: '<path d="M3 12h4l2.5 7 5-14L17 12h4"/>',
  bell: '<path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 7 2.5 7h-17S6 15 6 9z"/><path d="M10.5 20a2 2 0 0 0 3 0"/>',
  gear: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
  book: '<path d="M5 4a2 2 0 0 1 2-2h12v18H7a2 2 0 0 0-2 2z"/><path d="M19 16H7"/>',
  plug: '<path d="M9 2v6M15 2v6"/><path d="M7 8h10v2a5 5 0 0 1-10 0z"/><path d="M12 15v6"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  door: '<path d="M14 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="M10 8l4 4-4 4"/><path d="M14 12H4"/>',
  tag: '<path d="M3 12V5a2 2 0 0 1 2-2h7l9 9-9 9z"/><circle cx="8" cy="8" r="1.3"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  trash: '<path d="M4 7h16"/><path d="M10 11v6M14 11v6"/><path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"/><path d="M9 7V4h6v3"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
};
const icon = (name, cls) => ICONS[name] ? `<svg class="ic ${cls || ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>` : '';

/* ── роли команды ── */
const ROLES = R.roles || {
  owner: 'Владелец', coowner: 'Со-владелец', director: 'Директор', head: 'Руководитель отдела',
  sales: 'Менеджер по продажам', manager: 'Менеджер', acquisition: 'Менеджер по собственникам',
  marketer: 'Маркетолог', targetolog: 'Таргетолог', smm: 'SMM-менеджер',
  operator: 'Оператор', realtor: 'Риелтор', accountant: 'Бухгалтер', lawyer: 'Юрист',
  worker: 'Рабочий', master: 'Мастер', courier: 'Курьер', assistant: 'Ассистент',
};
const ROLE_METRICS = R.roleMetrics || {
  owner: [{ key: 'team', label: 'Людей в команде' }],
  director: [{ key: 'revenue', label: 'Выручка отдела', money: true }, { key: 'team', label: 'В подчинении' }],
  head: [{ key: 'revenue', label: 'Выручка отдела', money: true }, { key: 'team', label: 'В подчинении' }],
  sales: [{ key: 'deals', label: 'Закрыл сделок' }, { key: 'revenue', label: 'Выручка', money: true }, { key: 'conv', label: 'Конверсия', suffix: '%' }],
  manager: [{ key: 'deals', label: 'Закрыл сделок' }, { key: 'revenue', label: 'Выручка', money: true }],
  acquisition: [{ key: 'objects', label: 'Привёл объектов' }, { key: 'volume', label: 'Объём аренды', money: true }],
  marketer: [{ key: 'leads', label: 'Залил лидов' }, { key: 'budget', label: 'Бюджет', money: true }, { key: 'cpl', label: 'CPL', money: true }],
  targetolog: [{ key: 'leads', label: 'Лидов с рекламы' }, { key: 'spend', label: 'Открут', money: true }, { key: 'ctr', label: 'CTR', suffix: '%' }],
  smm: [{ key: 'posts', label: 'Постов' }, { key: 'reach', label: 'Охват' }, { key: 'subs', label: 'Подписчиков' }],
  operator: [{ key: 'processed', label: 'Обработал заявок' }, { key: 'conv', label: 'Конверсия', suffix: '%' }],
  realtor: [{ key: 'shows', label: 'Показов' }, { key: 'closed', label: 'Сдал объектов' }],
  accountant: [{ key: 'docs', label: 'Проведено документов' }],
  lawyer: [{ key: 'contracts', label: 'Договоров оформил' }],
  worker: [{ key: 'tasks', label: 'Задач закрыто' }],
  master: [{ key: 'orders', label: 'Заказов выполнил' }],
  courier: [{ key: 'deliveries', label: 'Доставок' }],
  default: [{ key: 'tasks', label: 'Задач закрыто' }],
};
const roleMetricsFor = role => ROLE_METRICS[role] || ROLE_METRICS.default || [];
// авто-показатели сотрудника из данных (recipe.teamAuto): выручка/сделки считаются сами, не вручную
function teamKpi(m) { const base = m.kpi || {}; if (!R.teamAuto) return base; const ta = R.teamAuto; const won = DB.recs(ta.entity).filter(d => d[ta.by] === m.name && d.stage === (ta.won || 'won')); return { ...base, deals: won.length, revenue: won.reduce((s, d) => s + (Number(d[ta.amount || 'amount']) || 0), 0) }; }

/* ── utils ── */
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = s => String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const fmtMoney = n => (!n && n !== 0) ? '—' : Number(n).toLocaleString(LOC) + ' ' + CUR;
const moneyShort = n => { n = Number(n) || 0; const a = Math.abs(n); if (a >= 1e6) return (n / 1e6).toFixed(a % 1e6 ? 1 : 0).replace('.0', '') + ' млн'; if (a >= 1e3) return Math.round(n / 1e3) + 'к'; return String(Math.round(n)); };
const fmtDate = iso => !iso ? '—' : new Date(iso).toLocaleDateString(LOC, { day: '2-digit', month: '2-digit', year: '2-digit' });
// Полная дата+время для тултипов (точность под рукой, как в живых продуктах)
const fmtDateTime = iso => { if (!iso) return '—'; const d = new Date(iso); const base = d.toLocaleDateString(LOC, { day: '2-digit', month: 'long', year: 'numeric' }); return /T\d/.test(iso) ? base + ', ' + d.toLocaleTimeString(LOC, { hour: '2-digit', minute: '2-digit' }) : base; };
// Относительное время («5 мин назад», «вчера», «через 3 дн.») — человеческий язык лент и сроков
function timeAgo(iso) {
  if (!iso) return '—';
  const d = new Date(iso); if (isNaN(d)) return '—';
  const sec = Math.round((Date.now() - d.getTime()) / 1000);
  if (sec < 0) { const ad = Math.round(-sec / 86400); if (ad === 0) return 'сегодня'; if (ad === 1) return 'завтра'; if (ad < 7) return 'через ' + ad + ' дн.'; if (ad < 31) return 'через ' + Math.round(ad / 7) + ' нед.'; return fmtDate(iso); }
  if (sec < 45) return 'только что';
  if (sec < 90) return 'минуту назад';
  const min = Math.round(sec / 60); if (min < 60) return min + ' мин назад';
  const hr = Math.round(sec / 3600); if (hr < 24) return hr === 1 ? 'час назад' : hr + ' ч назад';
  const day = Math.round(sec / 86400); if (day === 1) return 'вчера'; if (day < 7) return day + ' дн. назад'; if (day < 31) return Math.round(day / 7) + ' нед. назад';
  return fmtDate(iso);
}
// Удобный «когда» для лент: относительный текст + точная дата в подсказке
const fmtWhen = iso => `<span class="when" title="${escAttr(fmtDateTime(iso))}">${esc(timeAgo(iso))}</span>`;
const today0 = () => new Date(new Date().toDateString());
// Русское склонение по числу (1 задача / 2 задачи / 5 задач)
const plural = (n, one, few, many) => { const m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? one : (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20) ? few : many); };
const daysTo = iso => !iso ? Infinity : Math.round((new Date(iso) - today0()) / 86400000);
const daysSince = iso => !iso ? -1 : Math.max(0, Math.round((today0() - new Date(new Date(iso).toDateString())) / 86400000));
const fieldByKey = (k, ent) => (ent || primEnt).fields.find(f => f.key === k);
const stageById = (id, ent) => ((ent || primEnt).stages || []).find(s => s.id === id) || ((ent || primEnt).stages || [{}])[0];

function compute(rec, formula) {
  const toks = String(formula).match(/[A-Za-z_]\w*|\d+\.?\d*|[+\-*/()]/g) || [];
  const out = [], ops = [], prec = { '+': 1, '-': 1, '*': 2, '/': 2 };
  const apply = () => { const o = ops.pop(), b = out.pop(), a = out.pop(); out.push(o === '+' ? a + b : o === '-' ? a - b : o === '*' ? a * b : (b === 0 ? 0 : a / b)); };
  for (const t of toks) {
    if (/^[A-Za-z_]/.test(t)) out.push(Number(rec[t]) || 0);
    else if (/^[\d.]/.test(t)) out.push(parseFloat(t));
    else if (t === '(') ops.push(t);
    else if (t === ')') { while (ops.length && ops[ops.length - 1] !== '(') apply(); ops.pop(); }
    else { while (ops.length && prec[ops[ops.length - 1]] >= prec[t]) apply(); ops.push(t); }
  }
  while (ops.length) apply();
  return out.length ? out[out.length - 1] : 0;
}
// карта значений → визуальный вариант пилюли (важность/приоритет)
const PILL_MAP = { high: 'high', urgent: 'high', critical: 'high', vip: 'high', mid: 'mid', medium: 'mid', normal: 'mid', low: 'low', cold: 'low' };
const val = (rec, f) => f.type === 'computed' ? compute(rec, f.formula) : rec[f.key];
function display(rec, f) {
  const v = val(rec, f);
  if (f.type === 'gallery') { const a = rec[f.key] || []; return a.length ? ' ' + a.length : '—'; }
  if (f.type === 'money' || f.type === 'computed') return fmtMoney(v);
  if (f.type === 'date') return fmtDate(v);
  if (f.type === 'select') { const lbl = (f.options && f.options[v]) || v; if (!lbl) return '—'; if (f.pill) { const variant = PILL_MAP[v] || 'low'; return `<span class="pillv pillv--${variant}">${esc(lbl)}</span>`; } return esc(lbl); }
  return esc(v || '—');
}
function badge(stageId, ent) { const s = stageById(stageId, ent); return s && s.label ? `<span class="badge" style="color:${s.color}">${esc(s.label)}</span>` : ''; }
const primary = (rec, ent) => { ent = ent || primEnt; const pf = ent.fields.find(f => f.primary) || ent.fields[0]; return val(rec, pf); };

function matchFilter(rec, f) {
  if (!f) return true;
  if (f.stage && rec.stage !== f.stage) return false;
  if (f.stageNot && rec.stage === f.stageNot) return false;
  if (f.stageIn && !f.stageIn.includes(rec.stage)) return false;
  if (f.stageNotIn && f.stageNotIn.includes(rec.stage)) return false;
  if (f.dateField) { const has = !!rec[f.dateField], d = daysTo(rec[f.dateField]); if (f.has && !has) return false; if (f.within != null && !(has && d >= 0 && d <= f.within)) return false; if (f.overdue && !(has && d < 0)) return false; if (f.future && !(has && d >= 0)) return false; }
  if (f.eq) for (const k in f.eq) if (rec[k] !== f.eq[k]) return false;
  return true;
}
function metricValue(m, recsArg) {
  if (m.source === 'finance') {
    const fin = DB.fin(), within = m.months ? monthsBack(m.months) : null;
    const inR = t => !within || within.some(x => { const d = new Date(t.date); return x.key === d.getFullYear() + '-' + d.getMonth(); });
    if (m.kind === 'profit') { const inc = fin.filter(t => t.type !== 'expense' && inR(t)).reduce((s, t) => s + (+t.amount || 0), 0), exp = fin.filter(t => t.type === 'expense' && inR(t)).reduce((s, t) => s + (+t.amount || 0), 0); return inc - exp; }
    return fin.filter(t => (!m.ftype || t.type === m.ftype) && (!m.category || t.category === m.category) && inR(t)).reduce((s, t) => s + (+t.amount || 0), 0);
  }
  if (m.source === 'payments') { const p = DB.pays().filter(x => !m.status || x.status === m.status); return m.kind === 'count' ? p.length : p.reduce((s, x) => s + (+x.amount || 0), 0); }
  if (m.source === 'tasks') { const t = DB.tasks(); return m.kind === 'overdue' ? t.filter(x => !x.done && x.due && daysTo(x.due) < 0).length : t.filter(x => !x.done).length; }
  const ent = entById(m.entity), recs = recsArg || DB.recs(m.entity || primEnt.key);
  if (m.kind === 'avg') { const f = fieldByKey(m.field, ent), arr = recs.filter(r => matchFilter(r, m.where)), s = arr.reduce((a, r) => a + (Number(val(r, f)) || 0), 0); return arr.length ? Math.round(s / arr.length) : 0; }
  if (m.kind === 'count') return recs.filter(r => matchFilter(r, m.where)).length;
  if (m.kind === 'sumMoney') { const f = fieldByKey(m.field, ent); return recs.filter(r => matchFilter(r, m.where)).reduce((s, r) => s + (Number(f ? val(r, f) : r[m.field]) || 0), 0); }
  if (m.kind === 'percent') { const den = recs.filter(r => matchFilter(r, m.den)).length, num = recs.filter(r => matchFilter(r, m.num)).length; return den ? Math.round(num / den * 100) : 0; }
  return 0;
}
const isMoneyMetric = m => m.money === true || m.kind === 'sumMoney' || m.kind === 'avg' || m.kind === 'profit' || m.source === 'finance' || (m.source === 'payments' && m.kind !== 'count');
function kpiCard(m) {
  const num = metricValue(m), money = isMoneyMetric(m), suf = m.kind === 'percent' ? (m.suffix || '%') : (m.suffix || '');
  const fin = money ? fmtMoney(num) : (Number(num).toLocaleString(LOC) + suf);
  return `<div class="kpi ${m.accent ? 'kpi--acc' : ''}"><div class="kpi__label">${esc(m.label)}</div><div class="kpi__val num ${m.accent ? 'kpi__val--acc' : (m.good ? 'kpi__val--good' : (m.bad ? 'kpi__val--bad' : ''))}" data-cu="${num}" data-money="${money ? 1 : 0}" data-suf="${suf}">${fin}</div><div class="kpi__sub">${esc(m.sub || '')}</div></div>`;
}

/* ── аналитика: группировки + графики ── */
const PALETTE = ['#E5B53B', '#60a5fa', '#4ade80', '#a78bfa', '#fb923c', '#f472b6', '#34d399', '#f87171', '#38bdf8', '#fbbf24'];
const cssVar = n => getComputedStyle(document.body).getPropertyValue(n).trim() || '#888';
const REDUCE = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
function gLabel(key, v, ent) { if (key === 'stage') return (stageById(v, ent) || {}).label || v; const f = fieldByKey(key, ent); return (f && f.options && f.options[v]) || v || '—'; }
function gColor(key, v, i, ent) { if (key === 'stage') return (stageById(v, ent) || {}).color || PALETTE[i % PALETTE.length]; return PALETTE[i % PALETTE.length]; }
function groupAgg(recs, key, moneyKey, ent) {
  const mf = moneyKey ? fieldByKey(moneyKey, ent) : null, m = new Map();
  recs.forEach(r => { const v = key === 'stage' ? r.stage : r[key]; if (v == null || v === '') return; const o = m.get(v) || { count: 0, sum: 0 }; o.count++; if (mf) o.sum += Number(val(r, mf)) || 0; m.set(v, o); });
  return [...m.entries()].map(([v, o]) => ({ v, label: gLabel(key, v, ent), count: o.count, sum: o.sum })).sort((a, b) => moneyKey ? b.sum - a.sum : b.count - a.count).map((d, i) => ({ ...d, color: gColor(key, d.v, i, ent) }));
}
function monthsBack(n) { const a = [], d = new Date(); d.setDate(1); for (let i = n - 1; i >= 0; i--) { const x = new Date(d.getFullYear(), d.getMonth() - i, 1); a.push({ key: x.getFullYear() + '-' + x.getMonth(), label: x.toLocaleDateString(LOC, { month: 'short' }), y: 0 }); } return a; }
function drawDonut(canvas, data, money) {
  const dpr = devicePixelRatio || 1, W = canvas.clientWidth || 260, H = 190; canvas.width = W * dpr; canvas.height = H * dpr;
  const ctx = canvas.getContext('2d'); ctx.scale(dpr, dpr); const cx = 95, cy = H / 2, r = 72, ir = 50, gap = 0.03, total = data.reduce((s, d) => s + d.value, 0) || 1;
  const render = prog => {
    ctx.clearRect(0, 0, W, H); let a = -Math.PI / 2;
    data.forEach(d => { const ang = d.value / total * Math.PI * 2 * prog; ctx.beginPath(); ctx.arc(cx, cy, r, a + gap, a + ang - gap); ctx.arc(cx, cy, ir, a + ang - gap, a + gap, true); ctx.closePath(); ctx.fillStyle = d.color; ctx.fill(); a += ang; });
    // центр: короткий формат, шрифт подбирается под длину чтобы не залезть на кольцо
    const center = money ? moneyShort(Math.round(total * prog)) : String(Math.round(total * prog));
    let fs = 22; if (center.length > 6) fs = 16; if (center.length > 9) fs = 13;
    ctx.fillStyle = cssVar('--text'); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.font = '700 ' + fs + 'px ' + cssVar('--font-num'); ctx.fillText(center, cx, cy + 1);
    ctx.fillStyle = cssVar('--text3'); ctx.font = '10px ' + cssVar('--font-ui'); ctx.fillText('всего', cx, cy + 16);
  };
  if (REDUCE) return render(1); else { const t0 = performance.now(); const f = now => { let p = Math.min((now - t0) / 650, 1); render(1 - Math.pow(1 - p, 3)); if (p < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); }
  bindTip(canvas, (mx, my) => { const dx = mx - cx, dy = my - cy, dist = Math.hypot(dx, dy); if (dist < ir || dist > r) return null; let ang = Math.atan2(dy, dx) + Math.PI / 2; if (ang < 0) ang += Math.PI * 2; let acc = 0; for (const d of data) { const fr = d.value / total * Math.PI * 2; if (ang >= acc && ang < acc + fr) return `${esc(d.label)} <b>${d.value}</b> · ${Math.round(d.value / total * 100)}%`; acc += fr; } return null; });
}
function drawLine(canvas, pts, money) {
  const dpr = devicePixelRatio || 1, W = canvas.clientWidth || 400, H = 190; canvas.width = W * dpr; canvas.height = H * dpr;
  const ctx = canvas.getContext('2d'); ctx.scale(dpr, dpr); const pad = 30, bw = W - pad * 2, bh = H - pad * 2, max = Math.max(1, ...pts.map(p => p.y));
  const X = i => pad + (pts.length < 2 ? bw / 2 : i / (pts.length - 1) * bw), Y = v => pad + bh - v / max * bh, acc = cssVar('--acc');
  const render = prog => {
    ctx.clearRect(0, 0, W, H); ctx.strokeStyle = cssVar('--border'); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(pad, pad + bh); ctx.lineTo(pad + bw, pad + bh); ctx.stroke();
    ctx.fillStyle = cssVar('--text3'); ctx.font = '10px ' + cssVar('--font-ui'); ctx.textAlign = 'center'; pts.forEach((p, i) => ctx.fillText(p.label, X(i), H - 8));
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, pad + bw * prog + 1, H); ctx.clip();
    ctx.beginPath(); pts.forEach((p, i) => { const x = X(i), y = Y(p.y); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.lineTo(X(pts.length - 1), pad + bh); ctx.lineTo(X(0), pad + bh); ctx.closePath();
    const grad = ctx.createLinearGradient(0, pad, 0, pad + bh); grad.addColorStop(0, acc + '55'); grad.addColorStop(1, acc + '00'); ctx.fillStyle = grad; ctx.fill();
    ctx.beginPath(); pts.forEach((p, i) => { const x = X(i), y = Y(p.y); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.strokeStyle = acc; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
    ctx.fillStyle = acc; pts.forEach((p, i) => { if (X(i) <= pad + bw * prog + 1) { ctx.beginPath(); ctx.arc(X(i), Y(p.y), 2.5, 0, 7); ctx.fill(); } });
  };
  if (REDUCE) return render(1); else { const t0 = performance.now(); const f = now => { let p = Math.min((now - t0) / 750, 1); render(1 - Math.pow(1 - p, 3)); if (p < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); }
  bindTip(canvas, mx => { if (mx < pad - 12 || mx > pad + bw + 12) return null; const i = Math.max(0, Math.min(pts.length - 1, Math.round((mx - pad) / (bw / Math.max(1, pts.length - 1))))); const p = pts[i]; return `${esc(p.label)}: <b>${money ? fmtMoney(p.y) : p.y}</b>`; });
}
function drawBars2(canvas, months, a, bSer) { // доход/расход — современные сгруппированные столбцы + сетка
  const dpr = devicePixelRatio || 1, W = canvas.clientWidth || 600, H = 220; canvas.width = W * dpr; canvas.height = H * dpr;
  const ctx = canvas.getContext('2d'); ctx.scale(dpr, dpr);
  const padL = 52, padR = 14, padT = 14, padB = 26, bw = W - padL - padR, bh = H - padT - padB;
  const max = Math.max(1, ...months.map((m, i) => Math.max(a[i], bSer[i])));
  const slot = bw / months.length, bar = Math.min(16, slot / 3.4), gapc = 3;
  const rrect = (x, y, w, h, rad) => { if (h <= 0) return; const rr = Math.min(rad, w / 2, h); ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, [rr, rr, 0, 0]); else { ctx.moveTo(x, y + h); ctx.lineTo(x, y + rr); ctx.arcTo(x, y, x + rr, y, rr); ctx.lineTo(x + w - rr, y); ctx.arcTo(x + w, y, x + w, y + rr, rr); ctx.lineTo(x + w, y + h); ctx.closePath(); } ctx.fill(); };
  const render = prog => {
    ctx.clearRect(0, 0, W, H);
    // сетка + подписи оси (4 линии)
    ctx.textBaseline = 'middle'; ctx.font = '10px ' + cssVar('--font-ui');
    for (let g = 0; g <= 4; g++) { const y = padT + bh - bh * g / 4; ctx.strokeStyle = cssVar('--grid'); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + bw, y); ctx.stroke(); ctx.fillStyle = cssVar('--text3'); ctx.textAlign = 'right'; ctx.fillText(moneyShort(max * g / 4), padL - 8, y); }
    months.forEach((m, i) => {
      const c = padL + slot * i + slot / 2; const hA = a[i] / max * bh * prog, hB = bSer[i] / max * bh * prog;
      ctx.fillStyle = cssVar('--good'); rrect(c - bar - gapc, padT + bh - hA, bar, hA, 4);
      ctx.fillStyle = cssVar('--bad'); rrect(c + gapc, padT + bh - hB, bar, hB, 4);
      ctx.fillStyle = cssVar('--text3'); ctx.font = '10px ' + cssVar('--font-ui'); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillText(m.label, c, H - 8); ctx.textBaseline = 'middle';
    });
  };
  if (REDUCE) return render(1); else { const t0 = performance.now(); const f = now => { let p = Math.min((now - t0) / 750, 1); render(1 - Math.pow(1 - p, 3)); if (p < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); }
  bindTip(canvas, mx => { const i = Math.floor((mx - padL) / slot); if (i < 0 || i >= months.length) return null; return `${esc(months[i].label)}<br>доход <b>${fmtMoney(a[i])}</b><br>расход <b>${fmtMoney(bSer[i])}</b><br>сальдо <b>${fmtMoney(a[i] - bSer[i])}</b>`; });
}
function compressImage(file, max = 1280, q = 0.7) { return new Promise(res => { const r = new FileReader(); r.onload = () => { const img = new Image(); img.onload = () => { let { width: w, height: h } = img; if (w > h && w > max) { h = h * max / w; w = max; } else if (h > max) { w = w * max / h; h = max; } const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(img, 0, 0, w, h); res(c.toDataURL('image/jpeg', q)); }; img.src = r.result; }; r.readAsDataURL(file); }); }
// тултипы графиков (фирменный premium-тултип .chart-tip)
let _TIP;
function tipEl() { if (!_TIP) { _TIP = document.createElement('div'); _TIP.className = 'chart-tip hidden'; document.body.appendChild(_TIP); } return _TIP; }
function bindTip(canvas, resolve) {
  canvas.style.cursor = 'crosshair';
  canvas.onmousemove = e => { const r = canvas.getBoundingClientRect(), html = resolve(e.clientX - r.left, e.clientY - r.top); const t = tipEl(); if (html) { t.innerHTML = html; t.classList.remove('hidden'); t.style.left = (e.clientX + 14) + 'px'; t.style.top = (e.clientY + 14) + 'px'; } else t.classList.add('hidden'); };
  canvas.onmouseleave = () => tipEl().classList.add('hidden');
}

/* ── анимации ── */
function animateIn() { if (REDUCE) return; document.querySelectorAll('#main .kpi, #main .bcard, #main .team-card, #main .k-card, #main #tbody tr, #main #payBody tr, #main .doc-row').forEach((el, i) => { el.classList.remove('rise'); void el.offsetWidth; el.style.animationDelay = Math.min(i * 22, 360) + 'ms'; el.classList.add('rise'); }); }
function countUp() { document.querySelectorAll('#main [data-cu]').forEach(el => { const to = Number(el.dataset.cu); if (!isFinite(to)) return; const money = el.dataset.money === '1', suf = el.dataset.suf || ''; const fin = money ? fmtMoney(to) : (to.toLocaleString(LOC) + suf); if (REDUCE) { el.textContent = fin; return; } const dur = 750, t0 = performance.now(); const step = now => { let p = Math.min((now - t0) / dur, 1); p = 1 - Math.pow(1 - p, 3); const v = Math.round(to * p); el.textContent = money ? fmtMoney(v) : (v.toLocaleString(LOC) + suf); if (p < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); }); }
function tilt() { if (REDUCE) return; document.querySelectorAll('#main .kpi, #main .team-card').forEach(el => { el.onmousemove = e => { const r = el.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; el.style.transform = `perspective(800px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg) translateY(-3px)`; }; el.onmouseleave = () => { el.style.transform = ''; }; }); }
const polish = () => { animateIn(); countUp(); tilt(); };

/* ── state + nav ── */
let VIEW = R.nav[0].key, SUBVIEW = {}, DETAIL = null;
const navItem = key => R.nav.find(n => n.key === key);

function renderShell() {
  const host = document.getElementById(NAVLAYOUT === 'sidebar' ? 'sidebar' : 'topbar');
  let navHtml = '', lastGroup = null;
  R.nav.forEach(n => {
    if (NAVLAYOUT === 'sidebar' && n.group && n.group !== lastGroup) { navHtml += `<div class="nav-group">${esc(n.group)}</div>`; lastGroup = n.group; }
    navHtml += `<a class="nav__item" data-view="${n.key}"><span class="nav__ic">${icon(n.icon || 'layers')}</span><span class="nav__lbl">${esc(n.label)}</span><span class="nav__badge hidden" id="badge-${n.key}"></span></a>`;
  });
  host.innerHTML = `
    <div class="brand"><span class="brand__logo">${esc(R.brand?.logo || 'UQ')}</span><span class="brand__name">${esc(R.brand?.name || 'CRM')}</span></div>
    <nav class="nav">${navHtml}</nav>
    <div class="bar-actions"><button class="btn-ghost" id="searchBtn">${icon('search')}<span>Поиск</span><kbd class="kbd">${navigator.platform.indexOf('Mac') > -1 ? '⌘' : 'Ctrl'} K</kbd></button><button class="btn" id="addBtn">+ ${esc(primEnt.one)}</button></div>`;
  host.querySelectorAll('.nav__item').forEach(el => el.addEventListener('click', () => showView(el.dataset.view)));
  document.getElementById('searchBtn').addEventListener('click', togglePalette);
}

function addCfg(n) {
  if (n && n.add) return n.add;
  const t = n ? n.type : '';
  if (t === 'finance') return { type: 'fin', label: 'Операция' };
  if (t === 'payments') return { type: 'payment', label: 'Платёж' };
  if (t === 'tasks') return { type: 'task', label: 'Задача' };
  if (t === 'team') return { type: 'member', label: 'Сотрудник' };
  if (t === 'docs') return { type: 'doc', label: 'Документ' };
  if (t === 'reference') return { type: 'ref', label: 'Запись' };
  if (t === 'automation') return { type: 'auto', label: 'Сценарий' };
  if (t === 'knowledge') return { type: 'kb', label: 'Запись' };
  if (t === 'records' || t === 'kanban') return { type: 'record', label: entById(n.entity).one, entity: n.entity };
  return null;
}
function applyAddButton(n) {
  const btn = document.getElementById('addBtn'), pageBtn = document.getElementById('pageAdd'); const cfg = addCfg(n);
  const act = () => { if (cfg.type === 'payment') openPayment(); else if (cfg.type === 'fin') openFin(null, 'expense'); else if (cfg.type === 'member') openMember(); else if (cfg.type === 'doc') openDoc(); else if (cfg.type === 'ref') openRef(n.refKey, n.refFields); else if (cfg.type === 'auto') openAutomation(); else if (cfg.type === 'kb') openKb(); else if (cfg.type === 'task') { const i = document.getElementById('taskInput'); if (i) i.focus(); } else openForm(cfg.entity || primEnt.key); };
  [btn, pageBtn].forEach(b => { if (!b) return; if (!cfg) { b.classList.add('hidden'); return; } b.classList.remove('hidden'); b.textContent = '+ ' + cfg.label; b.onclick = act; });
}

function showView(key) {
  VIEW = key;
  document.querySelectorAll('.nav__item').forEach(el => el.classList.toggle('active', el.dataset.view === key));
  const n = navItem(key), main = document.getElementById('main');
  document.title = (n ? n.label + ' · ' : '') + (R.brand?.name || 'CRM');
  main.innerHTML = `<div class="page-head"><div class="page-title">${esc(n.label)}</div><button class="btn hidden" id="pageAdd"></button></div><div id="viewBody"></div>`;
  const R_ = { dashboard: viewDashboard, records: viewRecords, kanban: viewKanban, payments: viewPayments, tasks: viewTasks, team: viewTeam, analytics: viewAnalytics, finance: viewFinance, goals: viewGoals, docs: viewDocs, calendar: viewCalendar, reference: viewReference, activity: viewActivity, notifications: viewNotifications, automation: viewAutomation, roles: viewRoles, knowledge: viewKnowledge, integrations: viewIntegrations, files: viewFiles, portal: viewPortal, settings: viewSettings, catalog: viewCatalog, overview: viewOverview, valuation: viewValuation };
  try {
    (R_[n.type] || viewRecords)(n);
  } catch (err) {
    console.error('[Uniqore] Сбой рендера раздела «' + (n && n.type) + '»:', err);
    const vb = document.getElementById('viewBody');
    if (vb) vb.innerHTML = '<div class="empty-hint" style="padding:24px">Этот раздел не удалось отобразить — остальная CRM работает. Детали в консоли (F12).</div>';
  }
  addSectionSearch(n.type); applyAddButton(n); updateBadges(); polish(); labelIconBtns(document);
  if (!REDUCE) { main.classList.remove('view-enter'); void main.offsetWidth; main.classList.add('view-enter'); }
}
const refresh = () => showView(VIEW);

// инлайн-поиск в каждом разделе-списке (где нет своего поиска)
const SEARCHABLE = { team: '.team-card', docs: '.doc-row', automation: '.auto-rule', activity: '.tl-item', notifications: '.notif', integrations: '.intg-card' };
function addSectionSearch(type) {
  const sel = SEARCHABLE[type], body = document.getElementById('viewBody'); if (!sel || !body) return;
  const bar = document.createElement('div'); bar.className = 'toolbar';
  bar.innerHTML = `<input class="t-input t-input--search" id="secSearch" placeholder="Поиск в разделе...">`;
  body.insertBefore(bar, body.firstChild);
  document.getElementById('secSearch').addEventListener('input', e => { const q = e.target.value.toLowerCase(); body.querySelectorAll(sel).forEach(el => { el.style.display = el.textContent.toLowerCase().includes(q) ? '' : 'none'; }); });
}

// смена темы (живое переключение + сохранение); навигация остаётся из рецепта
function setTheme(key, persist) {
  if (!window.THEMES[key]) return;
  window.applyTheme(key);
  document.body.classList.remove('nav-topbar', 'nav-sidebar'); document.body.classList.add('nav-' + NAVLAYOUT);
  if (persist) localStorage.setItem(K('theme'), key);
  renderShell(); showView(VIEW);
}

function subnav(n, onPick) {
  const views = n.views || [{ key: 'all', label: 'Все', filter: {} }];
  if (!SUBVIEW[n.key]) SUBVIEW[n.key] = views[0].key;
  const html = `<div class="subnav">` + views.map(v => `<div class="subnav__item ${SUBVIEW[n.key] === v.key ? 'active' : ''}" data-sv="${v.key}">${esc(v.label)}</div>`).join('') + `</div>`;
  setTimeout(() => document.querySelectorAll('.subnav__item').forEach(el => el.addEventListener('click', () => { SUBVIEW[n.key] = el.dataset.sv; onPick(); })), 0);
  return { html, current: views.find(v => v.key === SUBVIEW[n.key]) || views[0] };
}

/* ── аватары / ответственный / спарклайн ── */
function ava(name, sm) { if (!name) return ''; const n = String(name).trim(); const i = (n.replace(/[«»"']/g, '')[0] || '?').toUpperCase(); let h = 0; for (const c of n) h = (h * 33 + c.charCodeAt(0)) % 360; return `<span class="ava${sm ? ' ava--sm' : ''}" style="background:hsl(${h},52%,52%)" title="${esc(n)}">${esc(i)}</span>`; }
const personField = ent => ent.fields.find(f => ['manager', 'responsible', 'assignee', 'client', 'owner', 'contact', 'doctor', 'courier'].includes(f.key) && (f.type === 'text' || f.type === 'select'));
function drawSpark(canvas, ys) {
  const dpr = devicePixelRatio || 1, W = canvas.clientWidth || 160, H = 44; canvas.width = W * dpr; canvas.height = H * dpr;
  const ctx = canvas.getContext('2d'); ctx.scale(dpr, dpr); const max = Math.max(1, ...ys), min = Math.min(...ys), pad = 4;
  const X = i => pad + i / Math.max(1, ys.length - 1) * (W - pad * 2), Y = v => H - pad - (v - min) / Math.max(1, max - min) * (H - pad * 2), acc = cssVar('--acc');
  ctx.beginPath(); ys.forEach((v, i) => { const x = X(i), y = Y(v); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.lineTo(X(ys.length - 1), H); ctx.lineTo(X(0), H); ctx.closePath();
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, acc + '44'); g.addColorStop(1, acc + '00'); ctx.fillStyle = g; ctx.fill();
  ctx.beginPath(); ys.forEach((v, i) => { const x = X(i), y = Y(v); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.strokeStyle = acc; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = acc; ctx.beginPath(); ctx.arc(X(ys.length - 1), Y(ys[ys.length - 1]), 2.5, 0, 7); ctx.fill();
}
function monthlySeries() { // доход по месяцам из финансов или платежей (для героя/спарклайнов)
  const months = monthsBack(8), idx = {}; months.forEach((m, i) => idx[m.key] = i);
  const fin = DB.fin();
  if (fin.length) { fin.filter(t => t.type !== 'expense').forEach(t => { const d = new Date(t.date), k = d.getFullYear() + '-' + d.getMonth(); if (k in idx) months[idx[k]].y += +t.amount || 0; }); }
  else { DB.pays().filter(p => p.status === 'paid').forEach(p => { const d = new Date(p.due), k = d.getFullYear() + '-' + d.getMonth(); if (k in idx) months[idx[k]].y += +p.amount || 0; }); }
  return months.map(m => m.y);
}

/* ── Dashboard ── */
// Приветствие по времени суток + живая сводка дня (как в нормальных продуктах)
function dashGreeting() {
  const h = new Date().getHours();
  const g = h < 5 ? 'Доброй ночи' : h < 12 ? 'Доброе утро' : h < 18 ? 'Добрый день' : 'Добрый вечер';
  const owner = (DB.team().find(m => /владел|директор|собствен|руковод|owner/i.test(roleName(m.role) || '')) || DB.team()[0] || {}).name || '';
  const tToday = DB.tasks().filter(t => !t.done && t.due && daysTo(t.due) === 0).length;
  const tOver = DB.tasks().filter(t => !t.done && t.due && daysTo(t.due) < 0).length;
  const payOver = DB.pays().filter(p => p.status === 'overdue').length;
  const bits = [];
  if (tToday) bits.push(`<b>${tToday}</b> ${plural(tToday, 'задача', 'задачи', 'задач')} на сегодня`);
  if (tOver) bits.push(`<b class="warn-txt">${tOver}</b> просрочено`);
  if (payOver) bits.push(`<b class="warn-txt">${payOver}</b> ${plural(payOver, 'платёж ждёт', 'платежа ждут', 'платежей ждут')}`);
  const summary = bits.length ? bits.join('&nbsp; · &nbsp;') : 'на сегодня всё спокойно — горящих дел нет';
  const today = new Date().toLocaleDateString(LOC, { weekday: 'long', day: 'numeric', month: 'long' });
  return `<div class="greet"><div><div class="greet__hi">${g}${owner ? ', ' + esc(String(owner).split(' ')[0]) : ''}</div><div class="greet__sum">${summary}</div></div><div class="greet__date">${esc(today)}</div></div>`;
}
function viewDashboard(n) {
  const ent = entById(n.entity), recs = DB.recs(ent.key);
  const metrics = n.metrics || R.metrics || [];
  const heroM = metrics.find(m => m.accent) || metrics[0];
  const kpis = metrics.filter(m => m !== heroM).map(kpiCard).join('');
  const counts = (ent.stages || []).map(s => recs.filter(r => r.stage === s.id).length), max = Math.max(1, ...counts);
  const bars = (ent.stages || []).map((s, i) => `<div class="bar-row"><div class="bar-row__label">${esc(s.label)}</div><div class="bar-track"><div class="bar-fill" style="width:${counts[i] / max * 100}%;background:${s.color}"></div></div><div class="bar-row__val num">${counts[i]}</div></div>`).join('');
  const dateF = ent.fields.find(f => f.type === 'date'); let urgent = '';
  if (dateF) { const up = recs.filter(r => r[dateF.key] && daysTo(r[dateF.key]) <= 30 && r.stage !== 'lost').sort((a, b) => new Date(a[dateF.key]) - new Date(b[dateF.key])).slice(0, 6); urgent = up.length ? up.map(r => `<div class="list-item" data-id="${r.id}" data-ent="${ent.key}"><div class="list-item__name">${esc(primary(r, ent))}</div><div class="list-item__right">${badge(r.stage, ent)}<div class="list-item__meta">${fmtWhen(r[dateF.key])}</div></div></div>`).join('') : '<div class="empty-hint">Ничего срочного — все сроки в порядке</div>'; }
  const recent = [...recs].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 6).map(r => `<div class="list-item" data-id="${r.id}" data-ent="${ent.key}"><div class="list-item__name">${esc(primary(r, ent))}</div><div class="list-item__right">${badge(r.stage, ent)}</div></div>`).join('') || '<div class="empty-hint">Пусто</div>';
  const tasks = DB.tasks().filter(t => !t.done).slice(0, 6).map(t => `<div class="list-item"><div class="pdot" style="background:${daysTo(t.due) < 0 ? 'var(--bad)' : 'var(--acc)'}"></div><div class="list-item__name">${esc(t.title)}</div><div class="list-item__right"><div class="list-item__meta">${fmtWhen(t.due)}</div></div></div>`).join('') || '<div class="empty-hint">Задач нет — можно выдохнуть</div>';
  const series = monthlySeries();
  const heroNum = heroM ? metricValue(heroM) : 0, heroVal = heroM && isMoneyMetric(heroM) ? fmtMoney(heroNum) : (Number(heroNum).toLocaleString(LOC) + (heroM && heroM.kind === 'percent' ? '%' : ''));
  const tr = series.length >= 2 && series[series.length - 2] ? Math.round((series[series.length - 1] - series[series.length - 2]) / Math.abs(series[series.length - 2]) * 100) : 0;
  const hero = `<div class="hero"><div class="hero__main"><div class="kpi__label">${heroM ? esc(heroM.label) : ''}</div><div class="hero__val num">${heroVal}</div><div class="hero__sub">${heroM ? esc(heroM.sub || '') : ''} ${tr ? `<span class="trend trend--${tr >= 0 ? 'up' : 'down'}">${tr >= 0 ? '↑' : '↓'} ${Math.abs(tr)}%</span>` : ''}</div></div><div class="hero__spark"><div class="kpi__label">Динамика, 8 мес</div><canvas id="heroSpark"></canvas></div></div>`;
  document.getElementById('viewBody').innerHTML = dashGreeting() + hero + `<div class="kpi-row">${kpis}</div>
    <div class="eyebrow" style="margin:18px 0 8px">Требует внимания</div>${attentionCards()}
    <div class="dash-grid" style="margin-top:var(--gap)">
    <div class="bcard"><div class="bcard__head"><span class="bcard__label">По статусам · ${esc(ent.many)}</span></div>${bars}</div>
    <div class="bcard"><div class="bcard__head"><span class="bcard__label">${dateF ? 'Ближайшие · ' + esc(dateF.label) : 'Недавние'}</span></div>${dateF ? urgent : recent}</div>
    <div class="bcard"><div class="bcard__head"><span class="bcard__label">Недавно добавленные</span></div>${recent}</div>
    <div class="bcard"><div class="bcard__head"><span class="bcard__label">Задачи в работе</span></div>${tasks}</div></div>`;
  bindRowClicks();
  document.querySelectorAll('.att-card[data-go]').forEach(el => el.onclick = () => { const t = el.dataset.go, map = { pay: 'payments', tasks: 'tasks', objects: 'records', deals: 'records' }; const target = R.nav.find(n => n.key === t) || R.nav.find(n => n.type === map[t]) || (t === 'tasks' && (R.nav.find(n => n.type === 'calendar'))) || R.nav.find(n => n.entity === (t === 'deals' ? 'deal' : t === 'objects' ? 'object' : null)); if (target) showView(target.key); });
  setTimeout(() => { const c = document.getElementById('heroSpark'); if (c) drawSpark(c, series); }, 0);
}

/* ── Records (inline-edit + bulk-действия + сохранённые виды) ── */
let REC_SEL = new Set();
function viewRecords(n) {
  const ent = entById(n.entity), sv = subnav(n, () => viewRecords(n));
  const cols = ent.fields.filter(f => f.list);
  const viewsKey = 'views_' + ent.key;
  REC_SEL = new Set();
  let curQ = '', curStage = '';
  const span = cols.length + (ent.stages ? 2 : 1) + 1; // +чекбокс
  const galF = ent.fields.find(f => f.type === 'gallery');
  const cellOpen = (r, f) => { const thumb = galF ? (() => { const ph = (r[galF.key] || [])[0]; return `<span class="row-thumb">${ph ? `<img src="${escAttr(ph)}" alt="">` : icon(ent.icon || 'building')}</span>`; })() : ''; return `<span class="cell-open">${thumb}<b>${esc(display(r, f))}</b></span>`; };
  const list = () => {
    let recs = DB.recs(ent.key).filter(r => matchFilter(r, sv.current.filter));
    if (curStage) recs = recs.filter(r => r.stage === curStage);
    if (curQ) recs = recs.filter(r => (primary(r, ent) + ' ' + cols.map(f => display(r, f)).join(' ')).toLowerCase().includes(curQ));
    return recs;
  };
  const rowHtml = r => `<tr data-id="${r.id}" data-ent="${ent.key}" class="${REC_SEL.has(r.id) ? 'is-selected' : ''}">`
    + `<td class="row-check"><input type="checkbox" class="tbl-check" data-id="${r.id}" ${REC_SEL.has(r.id) ? 'checked' : ''} aria-label="Выбрать строку"></td>`
    + cols.map(f => { const editable = !(f.primary || f.type === 'computed' || f.type === 'gallery'); return `<td class="${f.type === 'money' || f.type === 'computed' ? 'cell-acc ' : ''}${editable ? 'editable ' : ''}" data-key="${escAttr(f.key)}">${f.primary ? cellOpen(r, f) : display(r, f)}</td>`; }).join('')
    + (ent.stages ? `<td class="editable" data-key="__stage">${badge(r.stage, ent)}</td>` : '') + `</tr>`;
  const chips = () => { const vs = parse(K(viewsKey), '[]'); return `<div class="view-chips"><span class="view-chip${!curQ && !curStage ? ' is-active' : ''}" data-v="__all">Все</span>${vs.map(v => `<span class="view-chip" data-v="${v.id}">${esc(v.name)}<span class="view-chip__x" data-del="${v.id}">${icon('x')}</span></span>`).join('')}<span class="view-chip" id="saveView">+ Сохранить вид</span></div>`; };
  const stageOpts = ent.stages ? `<select class="t-select" id="stageFilter"><option value="">Все статусы</option>${ent.stages.map(s => `<option value="${escAttr(s.id)}">${esc(s.label)}</option>`).join('')}</select>` : '';
  document.getElementById('viewBody').innerHTML = sv.html + chips() + `<div class="toolbar"><input class="t-input t-input--search" id="tblSearch" placeholder="Поиск по ${escAttr(ent.many.toLowerCase())}…" value="${escAttr(curQ)}">${stageOpts}<span class="num" id="recCount" style="margin-left:auto;color:var(--text2)"></span></div>
    <div class="table-wrap"><table><thead><tr><th class="row-check"><input type="checkbox" class="tbl-check" id="checkAll" aria-label="Выбрать все"></th>${cols.map(f => `<th>${esc(f.label)}</th>`).join('')}${ent.stages ? '<th>Статус</th>' : ''}</tr></thead><tbody id="tbody"></tbody></table></div><div id="bulkSlot"></div>`;

  function renderBody() {
    const recs = list();
    document.getElementById('tbody').innerHTML = recs.map(rowHtml).join('') || `<tr><td colspan="${span}"><div class="empty-hint">Ничего не найдено</div></td></tr>`;
    document.getElementById('recCount').textContent = recs.length + ' ' + ent.many.toLowerCase();
    bindBody(); renderBulk();
  }
  function bindBody() {
    document.querySelectorAll('#tbody .cell-open').forEach(el => el.onclick = e => { e.stopPropagation(); openDetail(ent.key, el.closest('tr').dataset.id); });
    document.querySelectorAll('#tbody td.editable').forEach(td => td.ondblclick = () => startCellEdit(td, ent, renderBody));
    document.querySelectorAll('#tbody .tbl-check').forEach(cb => cb.onchange = () => { const id = cb.dataset.id; cb.checked ? REC_SEL.add(id) : REC_SEL.delete(id); cb.closest('tr').classList.toggle('is-selected', cb.checked); renderBulk(); const all = document.getElementById('checkAll'); if (all) all.checked = list().length > 0 && list().every(r => REC_SEL.has(r.id)); });
  }
  function renderBulk() {
    const slot = document.getElementById('bulkSlot'); if (!slot) return;
    if (!REC_SEL.size) { slot.innerHTML = ''; return; }
    slot.innerHTML = `<div class="bulk-bar"><span class="bulk-bar__count">${REC_SEL.size}</span><span style="color:var(--text2)">выбрано</span>${ent.stages ? `<select class="t-select" id="bulkStage"><option value="">Сменить статус…</option>${ent.stages.map(s => `<option value="${escAttr(s.id)}">${esc(s.label)}</option>`).join('')}</select>` : ''}<button class="btn-ghost" id="bulkExport">Экспорт</button><button class="btn-ghost" id="bulkDel">Удалить</button><button class="btn-ghost" id="bulkClear">Снять</button></div>`;
    const bs = document.getElementById('bulkStage'); if (bs) bs.onchange = () => { if (!bs.value) return; const recs = DB.recs(ent.key); recs.forEach(r => { if (REC_SEL.has(r.id) && r.stage !== bs.value) { r.stage = bs.value; r.updatedAt = new Date().toISOString(); r.activity = (r.activity || []).concat({ text: 'Статус → ' + stageById(bs.value, ent).label + ' (массово)', date: r.updatedAt }); runAutom('stage', { ent, rec: r }); } }); DB.saveRecs(ent.key, recs); toast(REC_SEL.size + ' обновлено', 'ok'); REC_SEL = new Set(); renderBody(); };
    document.getElementById('bulkExport').onclick = () => { const recs = DB.recs(ent.key).filter(r => REC_SEL.has(r.id)); exportRecsCSV(ent, cols, recs); toast('Экспортировано: ' + recs.length, 'ok'); };
    document.getElementById('bulkDel').onclick = () => { if (!confirm('Удалить выбранные (' + REC_SEL.size + ')?')) return; DB.saveRecs(ent.key, DB.recs(ent.key).filter(r => !REC_SEL.has(r.id))); toast('Удалено: ' + REC_SEL.size, 'ok'); REC_SEL = new Set(); renderBody(); };
    document.getElementById('bulkClear').onclick = () => { REC_SEL = new Set(); renderBody(); };
  }
  // фильтры
  document.getElementById('tblSearch').addEventListener('input', e => { curQ = e.target.value.toLowerCase().trim(); renderBody(); refreshChips(); });
  if (document.getElementById('stageFilter')) document.getElementById('stageFilter').onchange = e => { curStage = e.target.value; renderBody(); refreshChips(); };
  document.getElementById('checkAll').onchange = e => { const recs = list(); if (e.target.checked) recs.forEach(r => REC_SEL.add(r.id)); else REC_SEL.clear(); renderBody(); };
  function refreshChips() { /* подсветка «Все» */ document.querySelectorAll('.view-chip[data-v="__all"]').forEach(c => c.classList.toggle('is-active', !curQ && !curStage)); }
  function bindChips() {
    document.querySelectorAll('.view-chip[data-v]').forEach(c => c.onclick = e => {
      if (e.target.closest('.view-chip__x')) return;
      const id = c.dataset.v;
      if (id === '__all') { curQ = ''; curStage = ''; }
      else { const v = parse(K(viewsKey), '[]').find(x => x.id === id); if (!v) return; curQ = v.q || ''; curStage = v.stage || ''; }
      document.getElementById('tblSearch').value = curQ; if (document.getElementById('stageFilter')) document.getElementById('stageFilter').value = curStage;
      document.querySelectorAll('.view-chip').forEach(x => x.classList.remove('is-active')); c.classList.add('is-active');
      renderBody();
    });
    document.querySelectorAll('.view-chip__x[data-del]').forEach(x => x.onclick = e => { e.stopPropagation(); const arr = parse(K(viewsKey), '[]').filter(v => v.id !== x.dataset.del); save(K(viewsKey), arr); rebuildChips(); });
    const svBtn = document.getElementById('saveView'); if (svBtn) svBtn.onclick = () => { if (!curQ && !curStage) { toast('Сначала задай поиск или фильтр', 'info'); return; } const name = prompt('Название вида:', curQ || (ent.stages && curStage ? stageById(curStage, ent).label : 'Мой вид')); if (!name) return; const arr = parse(K(viewsKey), '[]'); arr.push({ id: uid(), name: name.trim(), q: curQ, stage: curStage }); save(K(viewsKey), arr); rebuildChips(); toast('Вид сохранён', 'ok'); };
  }
  function rebuildChips() { const host = document.querySelector('#viewBody .view-chips'); if (!host) return; host.outerHTML = chips(); bindChips(); refreshChips(); }
  bindChips();
  renderBody();
}
// экспорт выбранных записей в CSV (для bulk)
function exportRecsCSV(ent, cols, recs) {
  const heads = cols.map(f => f.label).concat(ent.stages ? ['Статус'] : []);
  const esc2 = s => { s = String(s == null ? '' : s).replace(/"/g, '""'); return /[",\n;]/.test(s) ? `"${s}"` : s; };
  const lines = [heads.map(esc2).join(',')].concat(recs.map(r => cols.map(f => esc2(f.type === 'select' ? display(r, f) : (f.type === 'computed' || f.type === 'money' ? val(r, f) : r[f.key]))).concat(ent.stages ? [esc2((stageById(r.stage, ent) || {}).label || '')] : []).join(',')));
  const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = (ent.many || 'records') + '.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
/* ── Каталог (маркетплейс-сетка фото-карточек, не таблица) ── */
function viewCatalog(n) {
  const ent = entById(n.entity);
  let mode = 'grid', curDeal = '', curRooms = '', curQ = '';
  const roomOpts = ent.fields.find(f => f.key === 'rooms').options;

  function list() {
    let recs = DB.recs(ent.key);
    if (curDeal) recs = recs.filter(r => r.dealType === curDeal);
    if (curRooms) recs = recs.filter(r => r.rooms === curRooms);
    if (curQ) recs = recs.filter(r => (r.name + ' ' + r.complex + ' ' + r.metro).toLowerCase().includes(curQ));
    return recs;
  }
  const stageLabel = r => ({ active: r.dealType === 'sale' ? 'В продаже' : 'В аренде', reserved: 'Бронь', deal: 'На сделке', closed: r.dealType === 'sale' ? 'Продано' : 'Сдано' })[r.stage] || r.stage;

  function card(r) {
    const cover = (r.photos || [])[0] || '';
    return `<div class="rc-card" data-id="${r.id}" tabindex="0">
      <div class="rc-card__photo">${cover ? `<img src="${escAttr(cover)}" loading="lazy" alt="">` : ''}
        <span class="rc-card__stage rc-card__stage--${r.stage}">${esc(stageLabel(r))}</span>
        <span class="rc-card__dt">${r.dealType === 'sale' ? 'Продажа' : 'Аренда'}</span>
      </div>
      <div class="rc-card__body">
        <div class="rc-card__price">${moneyShort(r.price)} ${CUR}${r.dealType === 'rent' ? '<span>/мес</span>' : ''}</div>
        <div class="rc-card__title">${esc(roomOpts[r.rooms])} · ЖК «${esc(r.complex)}»</div>
        <div class="rc-card__chips"><span>${r.area} м²</span>${r.kitchenArea ? `<span>кухня ${r.kitchenArea} м²</span>` : ''}<span>${r.floor}/${r.floorsTotal} эт</span></div>
        <div class="rc-card__foot"><span class="rc-card__metro">${icon('target')}${esc(r.metro)}</span>${ava(r.agent, true)}</div>
      </div>
    </div>`;
  }

  function mapPin(r, i) {
    const x = 8 + ((i * 137) % 84), y = 10 + ((i * 71 + i * i * 3) % 78); // детерминированный, но «рассыпанный» разброс
    return `<button class="rc-pin" data-id="${r.id}" style="left:${x}%;top:${y}%" title="${escAttr(r.name)}"><span class="rc-pin__price">${moneyShort(r.price)}</span></button>`;
  }

  document.getElementById('viewBody').innerHTML = `
    <div class="rc-bar">
      <input class="t-input t-input--search" id="rcSearch" placeholder="ЖК, метро, объект…">
      <select class="t-select" id="rcDeal"><option value="">Продажа и аренда</option><option value="sale">Продажа</option><option value="rent">Аренда</option></select>
      <select class="t-select" id="rcRooms"><option value="">Все комнаты</option>${Object.entries(roomOpts).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join('')}</select>
      <span class="num" id="rcCount" style="color:var(--text2)"></span>
      <div class="rc-modes"><button class="rc-mode is-active" data-mode="grid">${icon('layers')}Сетка</button><button class="rc-mode" data-mode="map">${icon('target')}Карта</button></div>
    </div>
    <div class="rc-grid" id="rcGrid"></div>
    <div class="rc-map" id="rcMap" hidden><div class="rc-map__bg"></div><div class="rc-map__pins" id="rcPins"></div></div>
  `;

  function render() {
    const recs = list();
    document.getElementById('rcCount').textContent = recs.length + ' ' + ent.many.toLowerCase();
    document.getElementById('rcGrid').innerHTML = recs.map(card).join('') || '<div class="empty-hint">Ничего не найдено</div>';
    document.getElementById('rcPins').innerHTML = recs.map(mapPin).join('');
    document.querySelectorAll('.rc-card, .rc-pin').forEach(el => el.addEventListener('click', () => openDetail(ent.key, el.dataset.id)));
  }
  render();

  document.getElementById('rcSearch').addEventListener('input', e => { curQ = e.target.value.toLowerCase().trim(); render(); });
  document.getElementById('rcDeal').addEventListener('change', e => { curDeal = e.target.value; render(); });
  document.getElementById('rcRooms').addEventListener('change', e => { curRooms = e.target.value; render(); });
  document.querySelectorAll('.rc-mode').forEach(b => b.onclick = () => {
    mode = b.dataset.mode;
    document.querySelectorAll('.rc-mode').forEach(x => x.classList.toggle('is-active', x === b));
    document.getElementById('rcGrid').hidden = mode !== 'grid';
    document.getElementById('rcMap').hidden = mode !== 'map';
  });
}

/* ── Дашборд (обзор бизнеса: комиссия, воронка лидов, ИИ-инсайты, топ-агенты) ── */
function viewOverview() {
  const objects = DB.recs('object'), leads = DB.recs('lead'), deals = DB.recs('deal'), agents = DB.recs('agent');
  const fin = DB.fin();
  const now = new Date();
  const inMonth = (iso, offset) => { const d = new Date(iso), t = new Date(now.getFullYear(), now.getMonth() - offset, 1); return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth(); };
  const sum = (arr) => arr.reduce((a, t) => a + (Number(t.amount) || 0), 0);
  const mtdIncome = sum(fin.filter(t => t.type === 'income' && inMonth(t.date, 0)));
  const mtdExpense = sum(fin.filter(t => t.type === 'expense' && inMonth(t.date, 0)));
  const prevIncome = sum(fin.filter(t => t.type === 'income' && inMonth(t.date, 1))) || 1;
  const trend = Math.round((mtdIncome - prevIncome) / prevIncome * 100);
  const active = objects.filter(o => o.stage === 'active').length;
  const openObjects = objects.filter(o => o.stage !== 'closed');
  const avgDays = openObjects.length ? Math.round(openObjects.reduce((a, o) => a + daysSince(o.createdAt), 0) / openObjects.length) : 0;
  const pipelineValue = deals.filter(d => !['won', 'lost'].includes(d.stage)).reduce((a, d) => a + (Number(d.amount) || 0), 0);

  const LEAD_STAGES = [['new', 'Новый'], ['contacted', 'Связались'], ['qualified', 'Квалифицирован'], ['viewing', 'Показ'], ['won', 'Сделка']];
  const FUN_COLOR = ['#c9ad82', '#b08c5c', '#8f6a3f', '#6b4226', '#4f3019'];
  const counts = LEAD_STAGES.map(([k]) => leads.filter(l => l.stage === k).length);
  const maxC = Math.max(1, ...counts);
  const funnelRows = LEAD_STAGES.map(([, label], i) => {
    const c = counts[i], pct = i === 0 ? '' : Math.round(c / Math.max(1, counts[0]) * 100) + '%';
    return `<div class="fun-row"><div class="fun-row__label">${esc(label)}</div><div class="bar-track"><div class="bar-fill" style="width:${Math.max(5, c / maxC * 100)}%;background:${FUN_COLOR[i]}"></div></div><div class="fun-row__val num">${c}<span>${pct}</span></div></div>`;
  }).join('');

  const topAgents = agents.slice().sort((a, b) => b.deals - a.deals).slice(0, 5);
  const leaderboard = topAgents.map(a => `<div class="list-item"><div class="list-item__name">${ava(a.name, true)}${esc(a.name)}</div><div class="list-item__right"><span class="num cell-acc">${a.deals} сд.</span><span class="list-item__meta">★ ${a.rating}</span></div></div>`).join('') || '<div class="empty-hint">Нет агентов</div>';

  const byComplex = new Map(); objects.forEach(o => byComplex.set(o.complex, (byComplex.get(o.complex) || 0) + 1));
  const topComplex = [...byComplex.entries()].sort((a, b) => b[1] - a[1])[0];
  const staleLeads = leads.filter(l => ['contacted', 'qualified', 'viewing'].includes(l.stage) && daysSince(l.createdAt) > 5).length;
  const closedThisMonth = deals.filter(d => d.stage === 'won').length;
  const insights = [
    topAgents[0] ? { level: 'good', icon: 'target', text: `Лучший агент — ${esc(topAgents[0].name)}: ${topAgents[0].deals} закрытых сделок, рейтинг ★${topAgents[0].rating}.` } : null,
    { level: trend >= 0 ? 'good' : 'warn', icon: 'chart', text: `Комиссия месяца ${fmtMoney(mtdIncome)} — ${trend >= 0 ? '+' : ''}${trend}% к прошлому месяцу.` },
    staleLeads ? { level: 'warn', icon: 'bolt', text: `${staleLeads} лид${staleLeads === 1 ? '' : 'а'} без движения больше 5 дней — стоит дожать, иначе уйдут к конкурентам.` } : null,
    topComplex ? { level: 'info', icon: 'building', text: `ЖК «${esc(topComplex[0])}» — самый крупный кластер каталога, ${topComplex[1]} объектов.` } : null,
    { level: 'good', icon: 'deal', text: `Закрыто сделок за месяц: ${closedThisMonth}. Средний срок объекта в продаже — ${avgDays} дней.` },
  ].filter(Boolean);
  const insightsHtml = insights.map(i => `<div class="ai-ins ai-ins--${i.level}"><span class="ai-ins__ic">${icon(i.icon)}</span><span>${i.text}</span></div>`).join('');

  const citywidePerM2 = Math.round(objects.filter(o => o.dealType === 'sale').reduce((a, o) => a + o.price / o.area, 0) / Math.max(1, objects.filter(o => o.dealType === 'sale').length));

  document.getElementById('viewBody').innerHTML = `
    <div class="ai-banner" id="aiBanner">
      <div class="ai-banner__ic">${icon('spark')}</div>
      <div class="ai-banner__body">
        <div class="ai-banner__kicker">ИИ · автоматическая оценка</div>
        <div class="ai-banner__title">Узнайте цену объекта за 10 секунд</div>
        <div class="ai-banner__sub">Модель уже знает ${objects.length} объектов базы — сейчас средняя цена продажи ${citywidePerM2.toLocaleString(LOC)} ₽/м²</div>
      </div>
      <button class="ai-banner__cta">Оценить объект ${icon('layers')}</button>
    </div>
    <div class="kpi-row">
      <div class="kpi kpi--acc"><div class="kpi__label">Комиссия · месяц</div><div class="kpi__val num kpi__val--acc" data-cu="${mtdIncome}" data-money="1">${fmtMoney(mtdIncome)}</div><div class="kpi__sub">${trend >= 0 ? '↑' : '↓'} ${Math.abs(trend)}% к прошлому</div></div>
      <div class="kpi"><div class="kpi__label">Прибыль · месяц</div><div class="kpi__val num kpi__val--good" data-cu="${mtdIncome - mtdExpense}" data-money="1">${fmtMoney(mtdIncome - mtdExpense)}</div></div>
      <div class="kpi"><div class="kpi__label">Активных объектов</div><div class="kpi__val num" data-cu="${active}">${active}</div><div class="kpi__sub">из ${objects.length} в каталоге</div></div>
      <div class="kpi"><div class="kpi__label">В пайплайне сделок</div><div class="kpi__val num" data-cu="${pipelineValue}" data-money="1">${fmtMoney(pipelineValue)}</div><div class="kpi__sub">${avgDays} дн. средний срок</div></div>
    </div>
    <div class="dash-grid" style="margin-top:var(--gap)">
      <div class="bcard"><div class="bcard__head"><span class="bcard__label">Воронка лидов</span></div>${funnelRows}</div>
      <div class="bcard bcard--ai"><div class="bcard__head"><span class="bcard__label">${icon('spark')} ИИ-аналитик · что вижу</span><span class="ai-live">LIVE</span></div>${insightsHtml}</div>
      <div class="bcard"><div class="bcard__head"><span class="bcard__label">Топ агентов</span></div>${leaderboard}</div>
    </div>`;
  document.getElementById('aiBanner').onclick = () => showView('valuation');
}

/* ── ИИ-оценка (AVM: мгновенная оценка объекта по параметрам + сравнимые) ── */
const VAL_RENOV_MULT = { raw: 0.85, pre: 0.93, fine: 1.0, design: 1.12 };
function estimateObject({ complex, rooms, area, floor, floorsTotal, renovation, dealType }) {
  const objects = DB.recs('object');
  let pool = objects.filter(o => o.complex === complex && o.dealType === dealType);
  if (pool.length < 2) pool = objects.filter(o => o.dealType === dealType);
  const avgPerM2 = pool.reduce((a, o) => a + o.price / o.area, 0) / pool.length;
  const floorMult = floor <= 2 ? 0.97 : (floorsTotal && floor === floorsTotal) ? 1.03 : 1.0;
  const base = avgPerM2 * area * (VAL_RENOV_MULT[renovation] || 1) * floorMult;
  const round = v => Math.round(v / 1000) * 1000;
  const comps = objects.filter(o => o.complex === complex).slice(0, 3);
  return { estimate: round(base), low: round(base * 0.94), high: round(base * 1.06), sample: pool.length, comps, avgPerM2: Math.round(avgPerM2) };
}
function viewValuation(n) {
  const ent = entById(n.entity);
  const complexes = [...new Set(DB.recs('object').map(o => o.complex))];
  const roomOpts = ent.fields.find(f => f.key === 'rooms').options;
  const renovOpts = ent.fields.find(f => f.key === 'renovation').options;
  document.getElementById('viewBody').innerHTML = `
    <div class="val-wrap">
      <div class="val-form bcard">
        <div class="bcard__head"><span class="bcard__label">Параметры объекта</span></div>
        <div class="f-grid2">
          <div class="f-col"><label class="f-label">ЖК</label><select class="t-select t-select--full" id="vf_complex">${complexes.map(c => `<option value="${escAttr(c)}">${esc(c)}</option>`).join('')}</select></div>
          <div class="f-col"><label class="f-label">Тип сделки</label><select class="t-select t-select--full" id="vf_deal"><option value="sale">Продажа</option><option value="rent">Аренда</option></select></div>
          <div class="f-col"><label class="f-label">Комнат</label><select class="t-select t-select--full" id="vf_rooms">${Object.entries(roomOpts).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join('')}</select></div>
          <div class="f-col"><label class="f-label">Ремонт</label><select class="t-select t-select--full" id="vf_renov">${Object.entries(renovOpts).map(([k, v]) => `<option value="${k}" ${k === 'fine' ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select></div>
          <div class="f-col"><label class="f-label">Площадь, м²</label><input class="t-input t-input--full" type="number" id="vf_area" value="58"></div>
          <div class="f-col"><label class="f-label">Этаж / этажей всего</label><div style="display:flex;gap:8px"><input class="t-input" type="number" id="vf_floor" value="12" style="width:50%"><input class="t-input" type="number" id="vf_floors" value="24" style="width:50%"></div></div>
        </div>
        <div class="f-col" style="margin-top:2px"><label class="f-label">Фото объекта</label><button type="button" class="val-upload" id="vf_upload">${icon('folder')}<span>Прикрепить фото объекта</span></button></div>
        <button class="btn" id="vf_go" style="margin-top:14px;width:100%">${icon('spark')} Оценить объект</button>
      </div>
      <div class="val-result bcard" id="valResult"><div class="empty-hint">Заполни параметры слева и нажми «Оценить объект» — модель посчитает цену по базе из ${DB.recs('object').length} объектов.</div></div>
    </div>
    <div class="val-lock" id="valLock" hidden>
      <div class="val-lock__box">
        <div class="val-lock__ic">${icon('folder')}</div>
        <h3>Загрузка своих фото — в рабочей версии</h3>
        <p>Это демо «Квартала». Загрузка и ИИ-разбор фото вашего объекта подключаются в полной версии системы — её мы соберём под ваше агентство под ключ.</p>
        <div class="val-lock__act"><a href="https://uniqore.pro/#contact" class="btn" target="_blank" rel="noopener">Хочу такую систему</a><button type="button" class="btn-ghost" id="valLockClose">Закрыть</button></div>
      </div>
    </div>`;

  const lock = document.getElementById('valLock');
  const openLock = () => { lock.hidden = false; };
  document.getElementById('vf_upload').onclick = openLock;
  document.getElementById('valLockClose').onclick = () => { lock.hidden = true; };
  lock.addEventListener('click', e => { if (e.target === lock) lock.hidden = true; });

  document.getElementById('vf_go').onclick = () => {
    const params = {
      complex: document.getElementById('vf_complex').value,
      dealType: document.getElementById('vf_deal').value,
      rooms: document.getElementById('vf_rooms').value,
      renovation: document.getElementById('vf_renov').value,
      area: Number(document.getElementById('vf_area').value) || 1,
      floor: Number(document.getElementById('vf_floor').value) || 1,
      floorsTotal: Number(document.getElementById('vf_floors').value) || 1,
    };
    const r = estimateObject(params);
    const unit = params.dealType === 'rent' ? ' /мес' : '';
    const cover = (r.comps[0] && r.comps[0].photos && r.comps[0].photos[0]) || '';
    const compsHtml = r.comps.map(c => `<div class="list-item"><div class="list-item__name">${esc(c.name)}</div><div class="list-item__right"><span class="num cell-acc">${fmtMoney(c.price)}${c.dealType === 'rent' ? '/мес' : ''}</span></div></div>`).join('') || '<div class="empty-hint">Нет сравнимых объектов в этом ЖК</div>';
    document.getElementById('valResult').innerHTML = `
      ${cover ? `<div class="val-hero"><img src="${escAttr(cover)}" alt=""><div class="val-hero__price">${fmtMoney(r.estimate)}${unit}</div></div>` : ''}
      <div class="val-body">
      <div class="bcard__head"><span class="bcard__label">Оценка ИИ</span></div>
      ${cover ? '' : `<div class="val-price">${fmtMoney(r.estimate)}${unit}</div>`}
      <div class="val-range">Диапазон: ${moneyShort(r.low)}–${moneyShort(r.high)} ${CUR}${unit} <span class="val-conf">доверительный интервал ±6%</span></div>
      <div class="val-verdict" id="valVerdict"></div>
      <div class="bcard__head" style="margin-top:16px"><span class="bcard__label">Сравнимые объекты в ЖК «${esc(params.complex)}»</span></div>
      ${compsHtml}
      </div>`;
    const verdictText = `Средняя цена по ЖК «${params.complex}» — ${Math.round(r.avgPerM2).toLocaleString(LOC)} ₽/м². С учётом ремонта «${renovOpts[params.renovation]}» и ${params.floor} этажа из ${params.floorsTotal} — итоговая оценка ${fmtMoney(r.estimate)}${unit}. Рекомендованный диапазон для листинга: ${moneyShort(r.low)}–${moneyShort(r.high)} ₽.`;
    const el = document.getElementById('valVerdict'); let i = 0;
    (function type() { if (i <= verdictText.length) { el.textContent = verdictText.slice(0, i); i += 3; setTimeout(type, 12); } })();
  };
}

// inline-редактирование ячейки
function startCellEdit(td, ent, after) {
  if (td.querySelector('.cell-input')) return;
  const tr = td.closest('tr'), id = tr.dataset.id, key = td.dataset.key;
  const recs = DB.recs(ent.key), rec = recs.find(r => r.id === id); if (!rec) return;
  const isStage = key === '__stage', f = isStage ? null : fieldByKey(key, ent);
  const cur = isStage ? rec.stage : (rec[key] == null ? '' : rec[key]);
  let input;
  if (isStage || (f && f.type === 'select')) {
    input = document.createElement('select'); input.className = 'cell-input';
    const opts = isStage ? (ent.stages || []).map(s => [s.id, s.label]) : Object.entries(f.options || {});
    input.innerHTML = opts.map(([v, l]) => `<option value="${escAttr(v)}" ${String(v) === String(cur) ? 'selected' : ''}>${esc(l)}</option>`).join('');
  } else {
    input = document.createElement('input'); input.className = 'cell-input';
    input.type = f && f.type === 'date' ? 'date' : (f && (f.type === 'money' || f.type === 'number') ? 'number' : 'text');
    input.value = cur;
  }
  td.classList.add('cell-edit'); const restore = () => { td.classList.remove('cell-edit'); after && after(); };
  td.innerHTML = ''; td.appendChild(input); input.focus(); if (input.select) try { input.select(); } catch {}
  let done = false;
  const commit = sv => { if (done) return; done = true; if (sv) { const rs = DB.recs(ent.key), r = rs.find(x => x.id === id); if (r) { const stamp = new Date().toISOString(); if (isStage) { if (r.stage !== input.value) { r.stage = input.value; r.updatedAt = stamp; r.activity = (r.activity || []).concat({ text: 'Статус → ' + stageById(input.value, ent).label, date: stamp }); DB.saveRecs(ent.key, rs); runAutom('stage', { ent, rec: r }); } } else if (String(r[key] == null ? '' : r[key]) !== String(input.value)) { r[key] = input.value; r.updatedAt = stamp; r.activity = (r.activity || []).concat({ text: 'Изменено поле «' + f.label + '»', date: stamp }); DB.saveRecs(ent.key, rs); } } } restore(); };
  input.onblur = () => commit(true);
  input.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); input.blur(); } else if (e.key === 'Escape') { done = true; restore(); } };
}

/* ── Kanban (с суммами по колонкам) ── */
function viewKanban(n) {
  const ent = entById(n.entity), recs = DB.recs(ent.key);
  const moneyF = ent.fields.find(f => f.type === 'computed') || ent.fields.find(f => f.type === 'money');
  const cols = (ent.stages || []).map(s => {
    const cards = recs.filter(r => r.stage === s.id), sum = moneyF ? cards.reduce((a, r) => a + (Number(val(r, moneyF)) || 0), 0) : 0;
    return `<div class="k-col" data-stage="${s.id}"><div class="k-col__head"><span style="color:${s.color}">${esc(s.label)}</span><span class="k-col__count num">${cards.length}</span></div>${moneyF ? `<div class="k-col__sum num">${fmtMoney(sum)}</div>` : ''}<div class="k-cards" data-stage="${s.id}">${cards.map(r => kCard(r, ent, moneyF)).join('')}</div><button class="k-add" data-add="${s.id}">+ ${esc(ent.one)}</button></div>`;
  }).join('');
  document.getElementById('viewBody').innerHTML = `<div class="toolbar"><input class="t-input t-input--search" id="kanSearch" placeholder="Поиск по ${esc(ent.many.toLowerCase())}…"><span class="num" style="margin-left:auto;color:var(--text2)">${recs.length} ${esc(ent.many.toLowerCase())}</span></div><div class="kanban">${cols}</div>`;
  bindKanban(ent);
  document.querySelectorAll('.k-add[data-add]').forEach(b => b.onclick = () => openForm(ent.key, null, { stage: b.dataset.add }));
  document.getElementById('kanSearch').addEventListener('input', e => { const q = e.target.value.toLowerCase().trim(); document.querySelectorAll('.k-card').forEach(c => { c.style.display = c.textContent.toLowerCase().includes(q) ? '' : 'none'; }); document.querySelectorAll('.k-col').forEach(col => { const vis = [...col.querySelectorAll('.k-card')].some(c => c.style.display !== 'none'); col.style.opacity = (q && !vis) ? '.5' : ''; }); });
}
function kCard(r, ent, moneyF) {
  const gf = ent.fields.find(f => f.type === 'gallery'), ph = gf && (r[gf.key] || [])[0];
  const pf = personField(ent), person = pf ? (pf.type === 'select' ? display(r, pf) : r[pf.key]) : '';
  const df = ent.fields.find(f => f.type === 'date'), dv = df && r[df.key];
  const days = daysSince(r.updatedAt || r.createdAt);
  const tagsF = ent.fields.find(f => f.key === 'tags'); const tags = tagsF && r.tags ? String(r.tags).split(',').slice(0, 2).map(t => `<span class="k-tag">${esc(t.trim())}</span>`).join('') : '';
  return `<div class="k-card" draggable="true" data-id="${r.id}" data-ent="${ent.key}">${ph ? `<img src="${escAttr(ph)}" class="k-cover">` : ''}
    <div class="k-card__title">${esc(primary(r, ent))}</div>
    ${tags ? `<div class="k-tags">${tags}</div>` : ''}
    <div class="k-card__row"><span class="num cell-acc">${moneyF ? fmtMoney(val(r, moneyF)) : ''}</span>${dv ? `<span class="k-meta">${icon('calendar')}${fmtDate(dv)}</span>` : ''}</div>
    <div class="k-card__foot">${person ? ava(person, true) + `<span class="k-meta">${esc(person)}</span>` : '<span></span>'}${days >= 0 ? `<span class="k-meta" title="дней в системе">${days}д</span>` : ''}</div></div>`;
}
let DRAG = null;
function bindKanban(ent) {
  document.querySelectorAll('.k-card').forEach(el => { el.addEventListener('click', () => openDetail(el.dataset.ent, el.dataset.id)); el.addEventListener('dragstart', () => DRAG = el.dataset.id); });
  document.querySelectorAll('.k-cards').forEach(zone => {
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drop-on'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drop-on'));
    zone.addEventListener('drop', () => { zone.classList.remove('drop-on'); const recs = DB.recs(ent.key), r = recs.find(x => x.id === DRAG); if (r && r.stage !== zone.dataset.stage) { r.stage = zone.dataset.stage; r.updatedAt = new Date().toISOString(); r.activity = r.activity || []; r.activity.push({ text: 'Статус → ' + (stageById(zone.dataset.stage, ent) || {}).label, date: r.updatedAt }); DB.saveRecs(ent.key, recs); runAutom('stage', { ent, rec: r }); viewKanban(navItem(VIEW)); } });
  });
}

/* ── Detail ── */
function openDetail(ek, id) {
  const ent = entById(ek), rec = DB.recs(ek).find(r => r.id === id); if (!rec) return; DETAIL = { ek, id };
  const grid = ent.fields.filter(f => !f.primary && f.type !== 'gallery' && f.type !== 'textarea').map(f => `<div class="detail-field"><div class="block-label">${esc(f.label)}</div><div class="block-val">${display(rec, f)}</div></div>`).join('');
  const notesF = ent.fields.filter(f => f.type === 'textarea').map(f => rec[f.key] ? `<div class="info-block"><div class="block-label">${esc(f.label)}</div><div class="block-val">${esc(rec[f.key])}</div></div>` : '').join('');
  const hasGal = ent.fields.some(f => f.type === 'gallery');
  const galPane = ent.fields.filter(f => f.type === 'gallery').map(f => { const a = rec[f.key] || []; return `<div class="gallery">${a.map(src => `<img src="${escAttr(src)}" class="thumb" data-src="${escAttr(src)}">`).join('') || '<span class="empty-hint">Нет фото</span>'}</div>`; }).join('');
  const stages = ent.stages || []; const stIdx = stages.findIndex(s => s.id === rec.stage);
  const track = stages.length ? `<div class="stage-track">${stages.map((s, i) => `<div class="stage-step ${i < stIdx ? 'done' : i === stIdx ? 'active' : ''}" data-stage="${s.id}">${esc(s.label)}</div>`).join('')}</div>` : '';
  const acts = (rec.activity || []).slice().reverse().map(a => `<div class="list-item"><div class="list-item__name" style="font-weight:400;font-size:12.5px">${esc(a.text)}</div><div class="list-item__right"><div class="list-item__meta">${fmtWhen(a.date)}</div></div></div>`).join('') || '<div class="empty-hint">Пока пусто — история действий появится здесь</div>';
  // связанные данные (подвязки) — Платежи/Документы/Сделки по этой записи
  const related = (ent.related || []).map(rel => {
    let items = [], render;
    if (rel.source === 'payments') { items = DB.pays().filter(p => p[rel.key] === id); render = p => `<div class="list-item" data-pay="${p.id}"><div class="list-item__name">${esc(p.title)}</div><div class="list-item__right"><span class="num cell-acc">${fmtMoney(p.amount)}</span></div></div>`; }
    else if (rel.source === 'docs') { items = DB.docs().filter(d => d[rel.key] === id); render = d => `<div class="list-item" data-doc="${d.id}"><div class="list-item__name">${esc(d.title)}</div><div class="list-item__right"><div class="list-item__meta">${fmtDate(d.date)}</div></div></div>`; }
    else if (rel.source === 'tasks') { items = DB.tasks().filter(t => t[rel.key] === id); render = t => `<div class="list-item"><div class="list-item__name">${esc(t.title)}</div><div class="list-item__right"><div class="list-item__meta">${fmtDate(t.due)}</div></div></div>`; }
    else { const re = entById(rel.source); items = DB.recs(rel.source).filter(r => r[rel.key] === id); render = r => `<div class="list-item" data-id="${r.id}" data-ent="${rel.source}"><div class="list-item__name">${esc(primary(r, re))}</div><div class="list-item__right">${badge(r.stage, re)}</div></div>`; }
    return { key: 'rel_' + rel.source + '_' + rel.key, label: rel.label + (items.length ? ' · ' + items.length : ''), html: items.length ? items.map(render).join('') : '<div class="empty-hint">Пусто</div>' };
  });
  const tabsBar = `<div class="tabs"><div class="tab active" data-tab="ov">Обзор</div>${hasGal ? '<div class="tab" data-tab="ph">Фото</div>' : ''}${related.map(r => `<div class="tab" data-tab="${r.key}">${esc(r.label)}</div>`).join('')}<div class="tab" data-tab="hi">История</div></div>`;
  mount(`<div class="overlay" id="ov"><div class="panel"><div class="panel__head"><div><div class="panel__title">${esc(primary(rec, ent))}</div><div class="panel__sub">${badge(rec.stage, ent)}</div></div><div style="display:flex;gap:6px;align-items:center"><button class="btn-ghost" id="dEdit">${icon('edit')} Изменить</button><button class="icon-btn" id="dDel" aria-label="Удалить">${icon('trash')}</button><button class="icon-btn" id="dClose" aria-label="Закрыть">${icon('x')}</button></div></div><div class="panel__body">${track}${tabsBar}
    <div class="tab-pane" data-pane="ov"><div class="detail-grid">${grid}</div>${notesF}</div>
    ${hasGal ? `<div class="tab-pane hidden" data-pane="ph">${galPane}</div>` : ''}
    ${related.map(r => `<div class="tab-pane hidden" data-pane="${r.key}">${r.html}</div>`).join('')}
    <div class="tab-pane hidden" data-pane="hi">${acts}</div></div></div></div>`);
  document.querySelectorAll('.panel .tab').forEach(t => t.onclick = () => { document.querySelectorAll('.panel .tab').forEach(x => x.classList.toggle('active', x === t)); document.querySelectorAll('.panel .tab-pane').forEach(p => p.classList.toggle('hidden', p.dataset.pane !== t.dataset.tab)); });
  document.querySelectorAll('.thumb[data-src]').forEach(t => t.onclick = () => lightbox(t.dataset.src));
  document.querySelectorAll('.panel [data-pay]').forEach(el => el.onclick = () => { closeMount(); openPayment(el.dataset.pay); });
  document.querySelectorAll('.panel [data-doc]').forEach(el => el.onclick = () => { closeMount(); openDoc(el.dataset.doc); });
  document.querySelectorAll('.panel [data-id][data-ent]').forEach(el => el.onclick = () => { const e2 = el.dataset.ent, i2 = el.dataset.id; closeMount(); openDetail(e2, i2); });
  document.getElementById('dClose').onclick = closeMount; document.getElementById('ov').onclick = e => { if (e.target.id === 'ov') closeMount(); };
  document.getElementById('dEdit').onclick = () => { closeMount(); openForm(ek, id); };
  document.getElementById('dDel').onclick = () => { if (confirm('Удалить ' + ent.one + '?')) { DB.saveRecs(ek, DB.recs(ek).filter(r => r.id !== id)); closeMount(); refresh(); } };
  document.querySelectorAll('.stage-step').forEach(el => el.onclick = () => { const recs = DB.recs(ek), r = recs.find(x => x.id === id); if (r.stage !== el.dataset.stage) { r.activity = r.activity || []; r.activity.push({ text: 'Статус → ' + stageById(el.dataset.stage, ent).label, date: new Date().toISOString() }); r.stage = el.dataset.stage; r.updatedAt = new Date().toISOString(); DB.saveRecs(ek, recs); runAutom('stage', { ent, rec: r }); } openDetail(ek, id); });
}

/* ── Record form ── */
let FORM_GALLERY = {};
function renderGalleryThumbs(key) { const box = document.getElementById('gal_' + key); if (!box) return; box.innerHTML = (FORM_GALLERY[key] || []).map((src, i) => `<div class="thumb-wrap"><img src="${escAttr(src)}" class="thumb"><span class="thumb-x" data-i="${i}">${icon('x')}</span></div>`).join('') || '<span class="empty-hint" style="padding:6px">Фото нет</span>'; box.querySelectorAll('.thumb-x').forEach(x => x.onclick = () => { FORM_GALLERY[key].splice(+x.dataset.i, 1); renderGalleryThumbs(key); }); box.querySelectorAll('.thumb').forEach(t => t.onclick = () => lightbox(t.src)); }
function openForm(ek, id, preset) {
  const ent = entById(ek), rec = id ? DB.recs(ek).find(r => r.id === id) : (preset || {}); FORM_GALLERY = {};
  const inputs = ent.fields.filter(f => f.type !== 'computed').map(f => {
    let ctrl;
    if (f.type === 'gallery') { FORM_GALLERY[f.key] = (rec[f.key] || []).slice(); ctrl = `<div class="gallery" id="gal_${f.key}"></div><input type="file" accept="image/*" multiple id="file_${f.key}" style="display:none"><button type="button" class="btn-ghost" id="galadd_${f.key}" style="margin-top:6px">+ Добавить фото</button>`; }
    else if (f.type === 'select') ctrl = `<select class="t-select t-select--full" id="f_${f.key}">${Object.entries(f.options || {}).map(([k, v]) => `<option value="${k}" ${rec[f.key] === k ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select>`;
    else if (f.type === 'textarea') ctrl = `<textarea class="t-input t-textarea" id="f_${f.key}">${esc(rec[f.key] || '')}</textarea>`;
    else ctrl = `<input class="t-input t-input--full" id="f_${f.key}" type="${(f.type === 'money' || f.type === 'number') ? 'number' : f.type === 'date' ? 'date' : 'text'}" value="${esc(rec[f.key] || '')}" ${f.required ? 'required' : ''}>`;
    return `<div class="f-col"><label class="f-label">${esc(f.label)}${f.required ? ' *' : ''}</label>${ctrl}</div>`;
  }).join('');
  const stageSel = (ent.stages || []).length ? `<div class="f-col"><label class="f-label">Статус</label><select class="t-select t-select--full" id="f_stage">${ent.stages.map(s => `<option value="${s.id}" ${rec.stage === s.id ? 'selected' : ''}>${esc(s.label)}</option>`).join('')}</select></div>` : '';
  mount(`<div class="overlay overlay--center" id="ov"><div class="panel panel--modal"><div class="panel__head"><div class="panel__title">${id ? 'Изменить' : 'Новый'} ${esc(ent.one)}</div><button class="icon-btn" id="fClose">${icon('x')}</button></div><form class="panel__body" id="recForm">${inputs}${stageSel}<div class="panel__foot"><button type="button" class="btn-ghost" id="fCancel">Отмена</button><button type="submit" class="btn">Сохранить</button></div></form></div></div>`);
  ent.fields.filter(f => f.type === 'gallery').forEach(f => { renderGalleryThumbs(f.key); const fi = document.getElementById('file_' + f.key); document.getElementById('galadd_' + f.key).onclick = () => fi.click(); fi.onchange = async () => { for (const file of fi.files) FORM_GALLERY[f.key].push(await compressImage(file)); fi.value = ''; renderGalleryThumbs(f.key); }; });
  const close = closeMount; document.getElementById('fClose').onclick = close; document.getElementById('fCancel').onclick = close; document.getElementById('ov').onclick = e => { if (e.target.id === 'ov') close(); };
  document.getElementById('recForm').onsubmit = e => {
    e.preventDefault(); const recs = DB.recs(ek), data = {};
    ent.fields.filter(f => f.type !== 'computed').forEach(f => data[f.key] = f.type === 'gallery' ? (FORM_GALLERY[f.key] || []) : document.getElementById('f_' + f.key).value);
    if (document.getElementById('f_stage')) data.stage = document.getElementById('f_stage').value;
    let newRec = null;
    if (id) { const i = recs.findIndex(r => r.id === id); recs[i] = { ...recs[i], ...data, updatedAt: new Date().toISOString() }; }
    else { newRec = { id: uid(), ...data, createdAt: new Date().toISOString(), activity: [{ text: 'Создан', date: new Date().toISOString() }] }; recs.unshift(newRec); }
    DB.saveRecs(ek, recs);
    close(); refresh();
    if (newRec) runAutom('created', { ent, rec: newRec });
  };
}

/* ── Payments ── */
function viewPayments(n) {
  const sv = subnav(n, () => viewPayments(n)); let pays = DB.pays(); const f = sv.current.filter || {};
  if (f.due === 'today') pays = pays.filter(p => daysTo(p.due) === 0); else if (f.dueWithin != null) pays = pays.filter(p => daysTo(p.due) >= 0 && daysTo(p.due) <= f.dueWithin); else if (f.due === '30d') pays = pays.filter(p => daysTo(p.due) >= 0 && daysTo(p.due) <= 30);
  if (f.status) pays = pays.filter(p => p.status === f.status);
  const ST = { paid: ['Оплачен', 'var(--good)'], sent: ['Выставлен', 'var(--acc)'], overdue: ['Просрочен', 'var(--bad)'], draft: ['Черновик', 'var(--text3)'] };
  const total = pays.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const rows = pays.map(p => { const s = ST[p.status] || ST.draft; return `<tr data-pay="${p.id}"><td><b>${esc(p.title)}</b></td><td>${esc(p.kind || '')}</td><td class="cell-acc">${fmtMoney(p.amount)}</td><td>${fmtDate(p.due)}</td><td><span class="badge" style="color:${s[1]}">${s[0]}</span></td></tr>`; }).join('');
  document.getElementById('viewBody').innerHTML = sv.html + `<div class="toolbar"><input class="t-input t-input--search" id="paySearch" placeholder="Поиск по платежам..."><span class="num" style="margin-left:auto;color:var(--text2)">Итого: ${fmtMoney(total)}</span></div><div class="table-wrap"><table><thead><tr><th>Назначение</th><th>Тип</th><th>Сумма</th><th>Срок</th><th>Статус</th></tr></thead><tbody id="payBody">${rows || `<tr><td colspan="5"><div class="empty-hint">Нет платежей</div></td></tr>`}</tbody></table></div>`;
  document.getElementById('paySearch').addEventListener('input', e => { const q = e.target.value.toLowerCase(); document.querySelectorAll('#payBody tr').forEach(tr => tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none'); });
  document.querySelectorAll('#payBody tr[data-pay]').forEach(tr => tr.onclick = () => openPayment(tr.dataset.pay));
}
function openPayment(id) {
  const pays = DB.pays(), p = id ? pays.find(x => x.id === id) : {};
  mount(`<div class="overlay overlay--center" id="ov"><div class="panel panel--modal"><div class="panel__head"><div class="panel__title">${id ? 'Изменить платёж' : 'Новый платёж'}</div><button class="icon-btn" id="pClose">${icon('x')}</button></div><form class="panel__body" id="payForm">
    <div class="f-col"><label class="f-label">Назначение *</label><input class="t-input t-input--full" id="p_title" value="${esc(p.title || '')}" required></div>
    <div class="f-row"><div class="f-col"><label class="f-label">Сумма (₽) *</label><input class="t-input t-input--full" type="number" id="p_amount" value="${esc(p.amount || '')}" required></div><div class="f-col"><label class="f-label">Тип</label><input class="t-input t-input--full" id="p_kind" value="${esc(p.kind || '')}" placeholder="Аренда / Депозит"></div></div>
    <div class="f-row"><div class="f-col"><label class="f-label">Срок</label><input class="t-input t-input--full" type="date" id="p_due" value="${esc(p.due || '')}"></div><div class="f-col"><label class="f-label">Статус</label><select class="t-select t-select--full" id="p_status">${['draft', 'sent', 'paid', 'overdue'].map(s => `<option value="${s}" ${p.status === s ? 'selected' : ''}>${({ draft: 'Черновик', sent: 'Выставлен', paid: 'Оплачен', overdue: 'Просрочен' })[s]}</option>`).join('')}</select></div></div>
    <div class="panel__foot">${id ? '<button type="button" class="btn-ghost" id="pDel">Удалить</button>' : ''}<button type="button" class="btn-ghost" id="pCancel">Отмена</button><button type="submit" class="btn">Сохранить</button></div></form></div></div>`);
  const close = closeMount; document.getElementById('pClose').onclick = close; document.getElementById('pCancel').onclick = close; document.getElementById('ov').onclick = e => { if (e.target.id === 'ov') close(); };
  if (id) document.getElementById('pDel').onclick = () => { DB.savePays(DB.pays().filter(x => x.id !== id)); close(); refresh(); };
  document.getElementById('payForm').onsubmit = e => { e.preventDefault(); const d = { title: document.getElementById('p_title').value.trim(), amount: Number(document.getElementById('p_amount').value) || 0, kind: document.getElementById('p_kind').value.trim(), due: document.getElementById('p_due').value, status: document.getElementById('p_status').value }; const arr = DB.pays(); if (id) { const i = arr.findIndex(x => x.id === id); arr[i] = { ...arr[i], ...d }; } else arr.unshift({ id: uid(), ...d }); DB.savePays(arr); close(); refresh(); };
}

/* ── Finance (поступления/списания/сальдо) ── */
function viewFinance(n) {
  const fin = DB.fin(), months = monthsBack(8);
  const inc = months.map(() => 0), exp = months.map(() => 0), idx = {}; months.forEach((m, i) => idx[m.key] = i);
  fin.forEach(t => { const d = new Date(t.date), k = d.getFullYear() + '-' + d.getMonth(); if (k in idx) { if (t.type === 'expense') exp[idx[k]] += Number(t.amount) || 0; else inc[idx[k]] += Number(t.amount) || 0; } });
  const tinc = inc.reduce((a, b) => a + b, 0), texp = exp.reduce((a, b) => a + b, 0), sal = tinc - texp;
  const byCat = new Map(); fin.filter(t => t.type !== 'expense').forEach(t => byCat.set(t.category || 'Прочее', (byCat.get(t.category || 'Прочее') || 0) + (Number(t.amount) || 0)));
  const cats = [...byCat.entries()].map(([label, value], i) => ({ label, value, color: PALETTE[i % PALETTE.length] })).sort((a, b) => b.value - a.value);
  const legend = cats.map(c => `<div class="an-leg"><span class="an-dot" style="background:${c.color}"></span>${esc(c.label)}<b class="num">${moneyShort(c.value)}</b></div>`).join('');
  document.getElementById('viewBody').innerHTML = `
    <div class="kpi-row">
      <div class="kpi kpi--acc"><div class="kpi__label">Поступления (8 мес)</div><div class="kpi__val num kpi__val--acc" data-cu="${tinc}" data-money="1">${fmtMoney(tinc)}</div></div>
      <div class="kpi"><div class="kpi__label">Списания</div><div class="kpi__val num kpi__val--bad" data-cu="${texp}" data-money="1">${fmtMoney(texp)}</div></div>
      <div class="kpi"><div class="kpi__label">Сальдо</div><div class="kpi__val num kpi__val--good" data-cu="${sal}" data-money="1">${fmtMoney(sal)}</div></div>
      <div class="kpi"><div class="kpi__label">Средний доход/мес</div><div class="kpi__val num" data-cu="${Math.round(tinc / 8)}" data-money="1">${fmtMoney(Math.round(tinc / 8))}</div></div>
    </div>
    <div class="dash-grid"><div class="bcard an-wide"><div class="bcard__head"><span class="bcard__label">Поступления и списания по месяцам</span><span class="an-sub"><span class="leg-dot" style="background:var(--good)"></span>доход <span class="leg-dot" style="background:var(--bad)"></span>расход</span></div><canvas id="finChart" class="an-canvas" style="height:220px"></canvas></div>
    <div class="bcard"><div class="bcard__head"><span class="bcard__label">Доход по категориям</span></div><div class="an-donut"><canvas id="finDonut" class="an-canvas" style="max-width:200px"></canvas><div class="an-legend">${legend || '<div class="empty-hint">Нет данных</div>'}</div></div></div></div>
    <div class="bcard" style="margin-top:16px"><div class="bcard__head"><span class="bcard__label">Операции компании</span><div style="display:flex;gap:8px"><button class="btn-ghost" id="finAddInc">+ Доход</button><button class="btn" id="finAddExp">+ Расход</button></div></div>
    <div class="table-wrap"><table><thead><tr><th>Назначение</th><th>Категория</th><th>Дата</th><th style="text-align:right">Сумма</th></tr></thead><tbody>${[...fin].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 40).map(t => `<tr data-fin="${t.id}" style="cursor:pointer"><td><b>${esc(t.title || (t.type === 'expense' ? 'Расход' : 'Доход'))}</b></td><td>${esc(t.category || '—')}</td><td>${fmtWhen(t.date)}</td><td class="num" style="text-align:right;color:${t.type === 'expense' ? 'var(--bad)' : 'var(--good)'}">${t.type === 'expense' ? '−' : '+'}${fmtMoney(t.amount)}</td></tr>`).join('') || `<tr><td colspan="4"><div class="empty-hint">Операций нет. Добавь «+ Расход» (напр. закупка недвижимости) или «+ Доход».</div></td></tr>`}</tbody></table></div></div>`;
  setTimeout(() => { drawBars2(document.getElementById('finChart'), months, inc, exp); if (cats.length) drawDonut(document.getElementById('finDonut'), cats, true); }, 0);
  document.getElementById('finAddInc').onclick = () => openFin(null, 'income');
  document.getElementById('finAddExp').onclick = () => openFin(null, 'expense');
  document.querySelectorAll('tr[data-fin]').forEach(tr => tr.onclick = () => openFin(tr.dataset.fin));
}
// форма операции компании (доход/расход) — траты: закупка недвижимости и т.п.
const FIN_CATS = { income: ['Субаренда', 'Услуги', 'Комиссия', 'Прочее'], expense: ['Закупка недвижимости', 'Аренда у собственника', 'Ремонт и мебель', 'Зарплаты', 'Реклама и лиды', 'Коммуналка', 'Налоги', 'Прочее'] };
function openFin(id, presetType) {
  const arr = DB.fin(), t = id ? arr.find(x => x.id === id) : { type: presetType || 'expense', date: todayStr() };
  const cats = FIN_CATS[t.type] || FIN_CATS.expense;
  mount(`<div class="overlay overlay--center" id="ov"><div class="panel panel--modal"><div class="panel__head"><div class="panel__title">${id ? 'Операция' : (t.type === 'expense' ? 'Новый расход' : 'Новый доход')}</div><button class="icon-btn" id="fnClose" aria-label="Закрыть">${icon('x')}</button></div><form class="panel__body" id="finForm">
    <div class="f-col"><label class="f-label">Тип</label><select class="t-select t-select--full" id="fn_type">${[['expense', 'Расход'], ['income', 'Доход']].map(([k, l]) => `<option value="${k}" ${t.type === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
    <div class="f-col"><label class="f-label">Назначение *</label><input class="t-input t-input--full" id="fn_title" value="${esc(t.title || '')}" placeholder="Напр.: Выкуп студии «Око 41»" required></div>
    <div class="f-grid2"><div class="f-col"><label class="f-label">Категория</label><input class="t-input t-input--full" id="fn_cat" list="finCats" value="${esc(t.category || '')}"><datalist id="finCats">${cats.map(c => `<option value="${escAttr(c)}">`).join('')}</datalist></div>
    <div class="f-col"><label class="f-label">Сумма (₽) *</label><input class="t-input t-input--full" type="number" id="fn_amount" value="${esc(t.amount || '')}" required></div></div>
    <div class="f-col"><label class="f-label">Дата</label><input class="t-input t-input--full" type="date" id="fn_date" value="${esc(t.date || todayStr())}"></div>
    <div class="panel__foot">${id ? '<button type="button" class="btn-ghost" id="fnDel">Удалить</button>' : ''}<button type="button" class="btn-ghost" id="fnCancel">Отмена</button><button type="submit" class="btn">Сохранить</button></div></form></div></div>`);
  const close = closeMount; document.getElementById('fnClose').onclick = close; document.getElementById('fnCancel').onclick = close; document.getElementById('ov').onclick = e => { if (e.target.id === 'ov') close(); };
  document.getElementById('fn_type').onchange = e => { const c = document.getElementById('finCats'); c.innerHTML = (FIN_CATS[e.target.value] || []).map(x => `<option value="${escAttr(x)}">`).join(''); };
  if (id) document.getElementById('fnDel').onclick = () => { DB.saveFin(DB.fin().filter(x => x.id !== id)); close(); refresh(); };
  document.getElementById('finForm').onsubmit = e => { e.preventDefault(); const d = { type: document.getElementById('fn_type').value, title: document.getElementById('fn_title').value.trim(), category: document.getElementById('fn_cat').value.trim(), amount: Number(document.getElementById('fn_amount').value) || 0, date: document.getElementById('fn_date').value || todayStr() }; const a = DB.fin(); if (id) { const i = a.findIndex(x => x.id === id); a[i] = { ...a[i], ...d }; } else a.unshift({ id: uid(), ...d }); DB.saveFin(a); close(); refresh(); };
}

/* ── Goals (Цель/План/Факт + менеджеры) ── */
function viewGoals(n) {
  const g = R.goals || { target: 0, plan: 0 };
  const ent = entById(g.entity), recs = DB.recs((g.entity) || primEnt.key);
  const factF = g.factField ? fieldByKey(g.factField, ent) : null;
  const fact = factF ? recs.filter(r => matchFilter(r, g.factWhere)).reduce((s, r) => s + (Number(val(r, factF)) || 0), 0) : (g.fact || 0);
  const plan = g.plan || Math.round(g.target * 0.9), pct = g.target ? Math.round(fact / g.target * 100) : 0;
  const team = DB.team().map(m => ({ m, k: teamKpi(m) }));
  const maxRev = Math.max(1, ...team.map(x => x.k.revenue), Math.round((g.target || 0) / Math.max(team.length, 1)));
  const rows = team.sort((a, b) => b.k.revenue - a.k.revenue).map(({ m, k }) => { const tgt = k.target || Math.round(maxRev * .8); const p = Math.round(k.revenue / Math.max(tgt, 1) * 100); return `<div class="goal-row"><div class="goal-row__name">${esc(m.name)} <span class="list-item__meta">${esc(roleName(m.role))}</span></div><div class="bar-track" style="flex:1"><div class="bar-fill" style="width:${Math.min(100, Math.max(2, k.revenue / maxRev * 100))}%;background:${p >= 100 ? 'var(--good)' : p > 0 ? 'var(--acc)' : 'var(--border2)'}"></div></div><div class="goal-row__v num">${moneyShort(k.revenue)} ₽ <span style="color:${p >= 100 ? 'var(--good)' : 'var(--text3)'}">${p}%</span></div></div>`; }).join('') || '<div class="empty-hint">Добавь сотрудников в разделе «Команда» — здесь появится их план/факт</div>';
  document.getElementById('viewBody').innerHTML = `
    <div class="kpi-row">
      <div class="kpi"><div class="kpi__label">Цель</div><div class="kpi__val num" data-cu="${g.target}" data-money="1">${fmtMoney(g.target)}</div><div class="kpi__sub">${esc(g.period || 'на месяц')}</div></div>
      <div class="kpi"><div class="kpi__label">План</div><div class="kpi__val num" data-cu="${plan}" data-money="1">${fmtMoney(plan)}</div></div>
      <div class="kpi kpi--acc"><div class="kpi__label">Факт</div><div class="kpi__val num kpi__val--acc" data-cu="${fact}" data-money="1">${fmtMoney(fact)}</div><div class="kpi__sub">${pct}% от цели</div></div>
      <div class="kpi"><div class="kpi__label">Выполнение цели</div><div class="kpi__val num ${pct >= 100 ? 'kpi__val--good' : ''}">${pct}%</div></div>
    </div>
    <div class="bcard"><div class="bcard__head"><span class="bcard__label">Сотрудники · план / факт</span></div>${rows}</div>`;
}

/* ── Documents (КП / Договоры / Акты) ── */
function viewDocs(n) {
  const sv = subnav(n, () => viewDocs(n)); let docs = DB.docs(); const f = sv.current.filter || {};
  if (f.type) docs = docs.filter(d => d.type === f.type);
  const TYP = R.docTypes || { offer: 'КП', contract: 'Договор', act: 'Акт', invoice: 'Счёт', spec: 'Спецификация' };
  const ST = { draft: ['Черновик', 'var(--text3)'], sent: ['Отправлен', 'var(--acc)'], signed: ['Подписан', 'var(--good)'], paid: ['Оплачен', 'var(--good)'] };
  const attIc = a => a.type === 'link' ? 'link' : a.type === 'note' ? 'note' : 'file';
  const attLbl = a => a.type === 'link' ? 'Ссылка' : a.type === 'note' ? 'Заметка' : (a.fileName || 'Файл');
  const rows = docs.map(d => { const s = ST[d.status] || ST.draft; const att = d.attach && d.attach.type && d.attach.type !== 'none' ? `<span class="doc-attach" data-att="${d.id}">${icon(attIc(d.attach))}${esc(attLbl(d.attach))}</span>` : ''; return `<div class="doc-row" data-doc="${d.id}"><div class="doc-ic">${icon('file')}</div><div style="flex:1;min-width:0"><div class="team-name">${esc(d.title)}</div><div class="list-item__meta">${esc(TYP[d.type] || d.type)} · ${fmtDate(d.date)}${d.amount ? ' · ' + fmtMoney(d.amount) : ''}</div></div>${att}<span class="badge" style="color:${s[1]}">${s[0]}</span></div>`; }).join('') || '<div class="empty-hint">Документов нет. Жми «+ Документ».</div>';
  document.getElementById('viewBody').innerHTML = sv.html + `<div class="doc-list">${rows}</div>`;
  document.querySelectorAll('.doc-row[data-doc]').forEach(el => el.onclick = () => openDoc(el.dataset.doc));
  document.querySelectorAll('.doc-attach[data-att]').forEach(el => el.onclick = e => { e.stopPropagation(); openAttach(DB.docs().find(x => x.id === el.dataset.att)); });
}
function openDoc(id) {
  const docs = DB.docs(), d = id ? docs.find(x => x.id === id) : {}; const TYP = R.docTypes || { offer: 'КП', contract: 'Договор', act: 'Акт', invoice: 'Счёт', spec: 'Спецификация' };
  mount(`<div class="overlay overlay--center" id="ov"><div class="panel panel--modal"><div class="panel__head"><div class="panel__title">${id ? 'Документ' : 'Новый документ'}</div><button class="icon-btn" id="dcClose">${icon('x')}</button></div><form class="panel__body" id="docForm">
    <div class="f-col"><label class="f-label">Название *</label><input class="t-input t-input--full" id="d_title" value="${esc(d.title || '')}" required></div>
    <div class="f-row"><div class="f-col"><label class="f-label">Тип</label><select class="t-select t-select--full" id="d_type">${Object.entries(TYP).map(([k, v]) => `<option value="${k}" ${d.type === k ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select></div><div class="f-col"><label class="f-label">Сумма (₽)</label><input class="t-input t-input--full" type="number" id="d_amount" value="${esc(d.amount || '')}"></div></div>
    <div class="f-row"><div class="f-col"><label class="f-label">Дата</label><input class="t-input t-input--full" type="date" id="d_date" value="${esc(d.date || '')}"></div><div class="f-col"><label class="f-label">Статус</label><select class="t-select t-select--full" id="d_status">${['draft', 'sent', 'signed', 'paid'].map(s => `<option value="${s}" ${d.status === s ? 'selected' : ''}>${({ draft: 'Черновик', sent: 'Отправлен', signed: 'Подписан', paid: 'Оплачен' })[s]}</option>`).join('')}</select></div></div>
    <div class="f-col"><label class="f-label">Вложение</label><select class="t-select t-select--full" id="d_attType">${[['none', 'Нет'], ['link', 'Ссылка'], ['file', 'Файл'], ['note', 'Заметка']].map(([k, l]) => `<option value="${k}" ${(d.attach && d.attach.type) === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
    <div class="f-col" data-att="link"><label class="f-label">Ссылка на документ</label><input class="t-input t-input--full" id="d_attUrl" placeholder="https://…" value="${esc(d.attach && d.attach.url || '')}"></div>
    <div class="f-col" data-att="file"><label class="f-label">Файл (хранится локально)</label><input type="file" id="d_attFile"><div class="list-item__meta" id="d_attFileName">${esc(d.attach && d.attach.fileName || '')}</div></div>
    <div class="f-col" data-att="note"><label class="f-label">Заметка</label><textarea class="t-input t-textarea" id="d_attNote" rows="4">${esc(d.attach && d.attach.note || '')}</textarea></div>
    <div class="panel__foot">${id ? '<button type="button" class="btn-ghost" id="dcDel">Удалить</button>' : ''}<button type="button" class="btn-ghost" id="dcCancel">Отмена</button><button type="submit" class="btn">Сохранить</button></div></form></div></div>`);
  const close = closeMount; document.getElementById('dcClose').onclick = close; document.getElementById('dcCancel').onclick = close; document.getElementById('ov').onclick = e => { if (e.target.id === 'ov') close(); };
  if (id) document.getElementById('dcDel').onclick = () => { DB.saveDocs(DB.docs().filter(x => x.id !== id)); close(); refresh(); };
  let attFileData = d.attach && d.attach.fileData || '', attFileName = d.attach && d.attach.fileName || '';
  const attSync = () => { const t = document.getElementById('d_attType').value; document.querySelectorAll('#docForm [data-att]').forEach(el => el.style.display = el.dataset.att === t ? '' : 'none'); };
  document.getElementById('d_attType').onchange = attSync; attSync();
  document.getElementById('d_attFile').onchange = e => { const file = e.target.files[0]; if (!file) return; if (file.size > 900000) { toast('Файл великоват для локального хранения (>900КБ). Лучше вставь ссылку.', 'bad', 5000); return; } const r = new FileReader(); r.onload = () => { attFileData = r.result; attFileName = file.name; document.getElementById('d_attFileName').textContent = file.name; }; r.readAsDataURL(file); };
  document.getElementById('docForm').onsubmit = e => { e.preventDefault(); const at = document.getElementById('d_attType').value; const attach = at === 'none' ? null : { type: at, url: document.getElementById('d_attUrl').value.trim(), note: document.getElementById('d_attNote').value.trim(), fileName: attFileName, fileData: attFileData }; const data = { title: document.getElementById('d_title').value.trim(), type: document.getElementById('d_type').value, amount: Number(document.getElementById('d_amount').value) || 0, date: document.getElementById('d_date').value, status: document.getElementById('d_status').value, attach }; const arr = DB.docs(); if (id) { const i = arr.findIndex(x => x.id === id); arr[i] = { ...arr[i], ...data }; } else arr.unshift({ id: uid(), ...data }); DB.saveDocs(arr); close(); refresh(); };
}
// открыть вложение документа
function openAttach(d) {
  const a = d.attach; if (!a) return;
  if (a.type === 'link' && a.url) { window.open(a.url, '_blank', 'noopener'); }
  else if (a.type === 'file' && a.fileData) { if (/^data:image\//.test(a.fileData)) lightbox(a.fileData); else { const w = window.open(); if (w) w.document.write('<iframe src="' + a.fileData + '" style="border:0;width:100%;height:100%"></iframe>'); } }
  else if (a.type === 'note') { mount(`<div class="overlay overlay--center" id="ov"><div class="panel panel--modal"><div class="panel__head"><div class="panel__title">${esc(d.title)} · заметка</div><button class="icon-btn" id="naClose">${icon('x')}</button></div><div class="panel__body"><div class="kb-read__body">${esc(a.note || 'Пусто')}</div></div></div></div>`); document.getElementById('naClose').onclick = closeMount; document.getElementById('ov').onclick = e => { if (e.target.id === 'ov') closeMount(); }; }
}

/* ── Calendar ── */
let CAL = new Date(), CAL_SEL = new Date().toISOString().slice(0, 10), CAL_VIEW = 'month', CAL_Q = '', CAL_DRAG = null;
function rescheduleTask(id, opt) { const arr = DB.tasks(), t = arr.find(x => x.id === id); if (!t) return; if (opt.allday) { t.start = ''; t.end = ''; } else if (opt.start != null) { const dur = (t2m(t.end) || (t2m(t.start) + 60)) - (t2m(t.start) || 0); const ns = t2m(opt.start); t.start = opt.start; t.end = isFinite(dur) && dur > 0 && t.start ? (String(Math.floor((ns + dur) / 60)).padStart(2, '0') + ':' + String((ns + dur) % 60).padStart(2, '0')) : ''; } if (opt.due) t.due = opt.due; DB.saveTasks(arr); toast('Задача перенесена', 'ok'); }
const CAL_HS = 7, CAL_HE = 22, CAL_RH = 54; // часы видимой сетки + высота часа
const ymdStr = (y, mo, d) => y + '-' + String(mo + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
const ymdOf = d => ymdStr(d.getFullYear(), d.getMonth(), d.getDate());
const todayStr = () => ymdOf(new Date());
const t2m = s => { if (!s) return null; const [h, m] = s.split(':').map(Number); return h * 60 + (m || 0); };
const dAdd = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const weekMon = d => { const x = new Date(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); x.setHours(0, 0, 0, 0); return x; };
const taskHue = t => { const k = t.assignee || ''; if (!k) return null; let h = 0; for (const c of k) h = (h * 33 + c.charCodeAt(0)) % 360; return h; };
const taskColor = t => t.done ? 'var(--good)' : (taskHue(t) != null ? `hsl(${taskHue(t)},58%,56%)` : 'var(--acc)');
const calDot = t => `<span class="cal-pdot" style="background:${taskColor(t)}"></span>`;
const calToggle = id => { const t = DB.tasks(), x = t.find(i => i.id === id); if (x) { x.done = !x.done; DB.saveTasks(t); } };
const WD = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function calNav(viewLabel, title) {
  return `<div class="cal-head"><div class="cal-nav"><button class="icon-btn" id="calPrev" aria-label="Назад">‹</button><button class="icon-btn" id="calNext" aria-label="Вперёд">›</button><button class="btn-ghost" id="calToday">Сегодня</button><button class="btn" id="calAddBtn">+ Задача</button></div><div class="cal-title">${esc(title)}</div><div class="seg">${['day:День', 'week:Неделя', 'month:Месяц', 'year:Год', 'list:Список'].map(o => { const [k, l] = o.split(':'); return `<div class="seg__item ${CAL_VIEW === k ? 'active' : ''}" data-cv="${k}">${l}</div>`; }).join('')}</div></div>
  <div class="cal-tools"><div class="cal-datewrap">${icon('calendar')}<input type="date" id="calDate" value="${esc(CAL_SEL)}"></div><div class="cal-searchwrap">${icon('search')}<input id="calSearch" placeholder="Поиск по задачам…" value="${esc(CAL_Q || '')}"></div></div>`;
}
function calBind() {
  document.querySelectorAll('.seg__item[data-cv]').forEach(s => s.onclick = () => { CAL_VIEW = s.dataset.cv; viewCalendar(); });
  const tb = document.getElementById('calToday'); if (tb) tb.onclick = () => { CAL = new Date(); CAL_SEL = todayStr(); viewCalendar(); };
  const ab = document.getElementById('calAddBtn'); if (ab) ab.onclick = () => openTask(null, { date: CAL_SEL });
  const dp = document.getElementById('calDate'); if (dp) dp.onchange = () => { if (dp.value) { CAL_SEL = dp.value; CAL = new Date(dp.value + 'T00:00:00'); CAL_VIEW = 'day'; viewCalendar(); } };
  const sr = document.getElementById('calSearch'); if (sr) { sr.oninput = () => { CAL_Q = sr.value; calApplySearch(); }; if (CAL_Q) calApplySearch(); }
  document.querySelectorAll('[data-done]').forEach(b => b.onclick = e => { e.stopPropagation(); calToggle(b.dataset.done); viewCalendar(); });
  document.querySelectorAll('[data-task]').forEach(el => el.onclick = e => { e.stopPropagation(); openTask(el.dataset.task); });
}
function calApplySearch() { const q = (CAL_Q || '').toLowerCase(); document.querySelectorAll('#viewBody [data-task]').forEach(el => { el.style.display = !q || el.textContent.toLowerCase().includes(q) ? '' : 'none'; }); }

function timeGrid(days) { // единая система координат: линия часа = подпись часа = top блока
  const hrs = []; for (let h = CAL_HS; h <= CAL_HE; h++) hrs.push(h);
  const gridH = (CAL_HE - CAL_HS) * CAL_RH;
  const alldayRow = `<div class="tg-allday"><div class="tg-corner">Весь день</div><div class="tg-adcols" style="grid-template-columns:repeat(${days.length},1fr)">${days.map(d => `<div class="tg-adcol" data-newday="${d.ds}">${DB.tasks().filter(t => t.due === d.ds && !t.start).map(t => `<div class="tg-ad ${t.done ? 'is-done' : ''}" data-task="${t.id}" draggable="true" style="--c:${taskColor(t)}">${esc(t.title)}</div>`).join('')}</div>`).join('')}</div></div>`;
  const rail = `<div class="tg-rail" style="height:${gridH}px">${hrs.map((h, i) => `<div class="tg-rlabel" style="top:${i * CAL_RH}px">${String(h).padStart(2, '0')}:00</div>`).join('')}</div>`;
  const cols = days.map(d => {
    const ts = DB.tasks().filter(t => t.due === d.ds && t.start).sort((a, b) => t2m(a.start) - t2m(b.start));
    const laneEnd = []; ts.forEach(t => { const s = t2m(t.start), e = t2m(t.end) || s + 60; let li = laneEnd.findIndex(end => end <= s); if (li < 0) li = laneEnd.length; laneEnd[li] = e; t._lane = li; }); const L = Math.max(1, laneEnd.length);
    const blocks = ts.map(t => { const s = t2m(t.start), e = t2m(t.end) || s + 60; const top = (s - CAL_HS * 60) / 60 * CAL_RH; const h = Math.max(24, (e - s) / 60 * CAL_RH); const w = 100 / L; return `<div class="tg-block ${t.done ? 'is-done' : ''}" data-task="${t.id}" draggable="true" style="top:${top}px;height:${h - 2}px;left:calc(${t._lane * w}% + 3px);width:calc(${w}% - 6px);--c:${taskColor(t)}"><div class="tg-block__t">${esc(t.start)}${t.end ? '–' + esc(t.end) : ''}</div><div class="tg-block__n">${esc(t.title)}</div>${t.assignee ? `<div class="tg-block__a">${ava(t.assignee, true)}</div>` : ''}</div>`; }).join('');
    return `<div class="tg-col${d.today ? ' is-today' : ''}" data-newday="${d.ds}" style="height:${gridH}px;--rh:${CAL_RH}px">${blocks}</div>`;
  }).join('');
  return alldayRow + `<div class="tg-body"><div class="tg-rail-wrap" style="height:${gridH}px">${rail}</div><div class="tg-cols" style="grid-template-columns:repeat(${days.length},1fr)">${cols}</div></div>`;
}
function bindTimeGrid() {
  document.querySelectorAll('.tg-block[draggable], .tg-ad[draggable]').forEach(el => {
    el.addEventListener('dragstart', ev => { CAL_DRAG = el.dataset.task; el.classList.add('is-dragging'); ev.dataTransfer.effectAllowed = 'move'; });
    el.addEventListener('dragend', () => { CAL_DRAG = null; el.classList.remove('is-dragging'); document.querySelectorAll('.drop-on').forEach(x => x.classList.remove('drop-on')); });
  });
  document.querySelectorAll('.tg-col[data-newday]').forEach(col => {
    col.onclick = e => { if (e.target.closest('.tg-block')) return; const r = col.getBoundingClientRect(); const hr = CAL_HS + Math.floor((e.clientY - r.top) / CAL_RH); openTask(null, { date: col.dataset.newday, start: String(Math.max(CAL_HS, Math.min(CAL_HE, hr))).padStart(2, '0') + ':00' }); };
    col.addEventListener('dragover', e => { if (!CAL_DRAG) return; e.preventDefault(); col.classList.add('drop-on'); });
    col.addEventListener('dragleave', () => col.classList.remove('drop-on'));
    col.addEventListener('drop', e => { if (!CAL_DRAG) return; e.preventDefault(); const r = col.getBoundingClientRect(); const hr = Math.max(CAL_HS, Math.min(CAL_HE, CAL_HS + Math.floor((e.clientY - r.top) / CAL_RH))); rescheduleTask(CAL_DRAG, { due: col.dataset.newday, start: String(hr).padStart(2, '0') + ':00' }); viewCalendar(); });
  });
  document.querySelectorAll('.tg-adcol[data-newday]').forEach(col => {
    col.onclick = e => { if (e.target.closest('[data-task]')) return; openTask(null, { date: col.dataset.newday, allday: true }); };
    col.addEventListener('dragover', e => { if (!CAL_DRAG) return; e.preventDefault(); col.classList.add('drop-on'); });
    col.addEventListener('dragleave', () => col.classList.remove('drop-on'));
    col.addEventListener('drop', e => { if (!CAL_DRAG) return; e.preventDefault(); rescheduleTask(CAL_DRAG, { due: col.dataset.newday, allday: true }); viewCalendar(); });
  });
}

function viewCalendar() {
  const v = CAL_VIEW;
  if (v === 'list') return calList();
  if (v === 'year') return calYear();
  if (v === 'day') return calDay();
  if (v === 'week') return calWeek();
  // month
  const y = CAL.getFullYear(), mo = CAL.getMonth(), first = new Date(y, mo, 1), start = (first.getDay() + 6) % 7, dim = new Date(y, mo + 1, 0).getDate();
  const by = {}; DB.tasks().forEach(t => { if (t.due) (by[t.due] = by[t.due] || []).push(t); });
  const tS = todayStr();
  const wd = WD.map(d => `<div class="cal-wd">${d}</div>`).join('');
  let cells = ''; for (let i = 0; i < start; i++) cells += `<div class="cal-cell cal-cell--pad"></div>`;
  for (let d = 1; d <= dim; d++) {
    const ds_ = ymdStr(y, mo, d), items = (by[ds_] || []).sort((a, b) => (t2m(a.start) || 1e9) - (t2m(b.start) || 1e9)), isT = ds_ === tS, isS = ds_ === CAL_SEL;
    const chips = items.slice(0, 3).map(t => `<div class="cal-chip ${t.done ? 'is-done' : ''}" data-task="${t.id}" draggable="true">${calDot(t)}${t.start ? `<b class="cal-time">${esc(t.start)}</b>` : ''}<span>${esc(t.title)}</span></div>`).join('') + (items.length > 3 ? `<div class="cal-more">ещё ${items.length - 3}</div>` : '');
    cells += `<div class="cal-cell${isT ? ' is-today' : ''}${isS ? ' is-sel' : ''}" data-day="${ds_}"><div class="cal-daynum">${d}</div>${chips}</div>`;
  }
  document.getElementById('viewBody').innerHTML = `<div class="cal-wrap"><div class="cal-main">${calNav('month', CAL.toLocaleDateString(LOC, { month: 'long', year: 'numeric' }))}<div class="cal-grid">${wd}${cells}</div></div>${agendaPanel()}</div>`;
  document.getElementById('calPrev').onclick = () => { CAL = new Date(y, mo - 1, 1); viewCalendar(); };
  document.getElementById('calNext').onclick = () => { CAL = new Date(y, mo + 1, 1); viewCalendar(); };
  document.querySelectorAll('.cal-cell[data-day]').forEach(c => {
    c.onclick = e => { if (e.target.closest('[data-task]')) return; CAL_SEL = c.dataset.day; viewCalendar(); };
    c.addEventListener('dragover', e => { if (!CAL_DRAG) return; e.preventDefault(); c.classList.add('drop-on'); });
    c.addEventListener('dragleave', () => c.classList.remove('drop-on'));
    c.addEventListener('drop', e => { if (!CAL_DRAG) return; e.preventDefault(); rescheduleTask(CAL_DRAG, { due: c.dataset.day }); viewCalendar(); });
  });
  document.querySelectorAll('.cal-chip[draggable]').forEach(el => { el.addEventListener('dragstart', ev => { CAL_DRAG = el.dataset.task; el.classList.add('is-dragging'); ev.dataTransfer.effectAllowed = 'move'; }); el.addEventListener('dragend', () => { CAL_DRAG = null; el.classList.remove('is-dragging'); document.querySelectorAll('.drop-on').forEach(x => x.classList.remove('drop-on')); }); });
  calBind(); bindAgenda();
}
function agendaPanel() {
  const d = new Date(CAL_SEL + 'T00:00:00'), list = DB.tasks().filter(t => t.due === CAL_SEL).sort((a, b) => (a.done - b.done) || ((t2m(a.start) || 1e9) - (t2m(b.start) || 1e9)));
  const rows = list.map(t => `<div class="agenda-item ${t.done ? 'is-done' : ''}" data-task="${t.id}"><button class="agenda-check ${t.done ? 'on' : ''}" data-done="${t.id}">${t.done ? icon('check') : ''}</button><div class="agenda-text"><div>${esc(t.title)}</div>${t.start || t.assignee ? `<div class="agenda-meta">${t.start ? esc(t.start) + (t.end ? '–' + esc(t.end) : '') : 'весь день'}${t.assignee ? ' · ' + esc(t.assignee) : ''}</div>` : ''}</div>${t.assignee ? ava(t.assignee, true) : calDot(t)}</div>`).join('') || '<div class="empty-hint" style="padding:28px 8px">На этот день задач нет</div>';
  return `<aside class="cal-agenda"><div class="agenda-head"><div class="agenda-day">${d.getDate()}</div><div><div class="agenda-wd">${esc(d.toLocaleDateString(LOC, { weekday: 'long' }))}</div><div class="agenda-mo">${esc(d.toLocaleDateString(LOC, { month: 'long', year: 'numeric' }))}</div></div></div><div class="agenda-list">${rows}</div><div class="agenda-add"><button class="btn-ghost" style="width:100%" id="calAdd">+ Добавить задачу на день</button></div></aside>`;
}
function bindAgenda() { const a = document.getElementById('calAdd'); if (a) a.onclick = () => openTask(null, { date: CAL_SEL }); }
function calDay() {
  const d = new Date(CAL_SEL + 'T00:00:00'), days = [{ ds: CAL_SEL, today: CAL_SEL === todayStr() }];
  document.getElementById('viewBody').innerHTML = `<div class="cal-main">${calNav('day', d.toLocaleDateString(LOC, { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }))}<div class="cal-tg cal-tg--day">${timeGrid(days)}</div></div>`;
  document.getElementById('calPrev').onclick = () => { CAL_SEL = ymdOf(dAdd(d, -1)); CAL = new Date(CAL_SEL); viewCalendar(); };
  document.getElementById('calNext').onclick = () => { CAL_SEL = ymdOf(dAdd(d, 1)); CAL = new Date(CAL_SEL); viewCalendar(); };
  calBind(); bindTimeGrid();
}
function calWeek() {
  const mon = weekMon(new Date(CAL_SEL + 'T00:00:00')), tS = todayStr();
  const days = []; for (let i = 0; i < 7; i++) { const dd = dAdd(mon, i), ds = ymdOf(dd); days.push({ ds, today: ds === tS, label: WD[i] + ' ' + dd.getDate() }); }
  const hdr = `<div class="tg-hdr"><div class="tg-corner"></div>${days.map(d => `<div class="tg-day${d.today ? ' is-today' : ''}" data-day="${d.ds}">${esc(d.label)}</div>`).join('')}</div>`;
  const end = dAdd(mon, 6);
  document.getElementById('viewBody').innerHTML = `<div class="cal-main">${calNav('week', mon.toLocaleDateString(LOC, { day: '2-digit', month: 'short' }) + ' – ' + end.toLocaleDateString(LOC, { day: '2-digit', month: 'short', year: 'numeric' }))}<div class="cal-tg">${hdr}${timeGrid(days)}</div></div>`;
  document.getElementById('calPrev').onclick = () => { CAL_SEL = ymdOf(dAdd(mon, -7)); CAL = new Date(CAL_SEL); viewCalendar(); };
  document.getElementById('calNext').onclick = () => { CAL_SEL = ymdOf(dAdd(mon, 7)); CAL = new Date(CAL_SEL); viewCalendar(); };
  document.querySelectorAll('.tg-day[data-day]').forEach(el => el.onclick = () => { CAL_SEL = el.dataset.day; CAL_VIEW = 'day'; viewCalendar(); });
  calBind(); bindTimeGrid();
}
function calYear() {
  const y = CAL.getFullYear(), tS = todayStr(), by = {}; DB.tasks().forEach(t => { if (t.due) by[t.due] = (by[t.due] || 0) + 1; });
  const mini = mo => {
    const first = new Date(y, mo, 1), start = (first.getDay() + 6) % 7, dim = new Date(y, mo + 1, 0).getDate();
    let cells = ''; for (let i = 0; i < start; i++) cells += '<span class="ym-d ym-d--pad"></span>';
    for (let d = 1; d <= dim; d++) { const ds = ymdStr(y, mo, d); cells += `<span class="ym-d${ds === tS ? ' is-today' : ''}${by[ds] ? ' has' : ''}" data-day="${ds}">${d}</span>`; }
    return `<div class="ym"><div class="ym-title">${esc(new Date(y, mo, 1).toLocaleDateString(LOC, { month: 'long' }))}</div><div class="ym-wd">${WD.map(w => `<span>${w[0]}</span>`).join('')}</div><div class="ym-grid">${cells}</div></div>`;
  };
  let m = ''; for (let i = 0; i < 12; i++) m += mini(i);
  document.getElementById('viewBody').innerHTML = `<div class="cal-main">${calNav('year', String(y))}<div class="cal-year">${m}</div></div>`;
  document.getElementById('calPrev').onclick = () => { CAL = new Date(y - 1, 0, 1); viewCalendar(); };
  document.getElementById('calNext').onclick = () => { CAL = new Date(y + 1, 0, 1); viewCalendar(); };
  document.querySelectorAll('.ym-d[data-day]').forEach(el => el.onclick = () => { CAL_SEL = el.dataset.day; CAL = new Date(el.dataset.day); CAL_VIEW = 'day'; viewCalendar(); });
  calBind();
}
function calList() {
  const by = {}; DB.tasks().filter(t => t.due).forEach(t => (by[t.due] = by[t.due] || []).push(t));
  const tS = todayStr();
  const body = Object.keys(by).sort().map(day => { const d = new Date(day + 'T00:00:00'), lbl = day === tS ? 'Сегодня' : d.toLocaleDateString(LOC, { weekday: 'short', day: '2-digit', month: 'long' }); const rows = by[day].sort((a, b) => (a.done - b.done) || ((t2m(a.start) || 1e9) - (t2m(b.start) || 1e9))).map(t => `<div class="agenda-item ${t.done ? 'is-done' : ''}" data-task="${t.id}"><button class="agenda-check ${t.done ? 'on' : ''}" data-done="${t.id}">${t.done ? icon('check') : ''}</button><div class="agenda-text"><div>${esc(t.title)}</div>${t.start || t.assignee ? `<div class="agenda-meta">${t.start ? esc(t.start) : 'весь день'}${t.assignee ? ' · ' + esc(t.assignee) : ''}</div>` : ''}</div>${t.assignee ? ava(t.assignee, true) : calDot(t)}</div>`).join(''); return `<div class="cal-listgroup"><div class="cal-listday${day === tS ? ' is-today' : ''}">${esc(lbl)}</div>${rows}</div>`; }).join('') || '<div class="empty-hint">Задач нет</div>';
  document.getElementById('viewBody').innerHTML = `<div class="cal-main">${calNav('list', 'Все задачи')}<div class="cal-listwrap">${body}</div></div>`;
  calBind();
}
function openTask(id, preset) {
  preset = preset || {}; const list = DB.tasks(), t = id ? list.find(x => x.id === id) : {};
  const allday = id ? !t.start : !preset.start && !preset.allday ? false : !!preset.allday || !preset.start;
  const team = DB.team();
  const asgOpts = '<option value="">— общая (без исполнителя)</option>' + team.map(m => `<option value="${esc(m.name)}" ${t.assignee === m.name ? 'selected' : ''}>${esc(m.name)} · ${esc(roleName(m.role))}</option>`).join('');
  mount(`<div class="overlay overlay--center" id="ov"><div class="panel panel--modal"><div class="panel__head"><div class="panel__title">${id ? 'Задача' : 'Новая задача'}</div><button class="icon-btn" id="tkClose">${icon('x')}</button></div><form class="panel__body" id="tkForm">
    <div class="f-col"><label class="f-label">Что сделать *</label><input class="t-input t-input--full" id="tk_title" value="${esc(t.title || '')}" required></div>
    <div class="f-row"><div class="f-col"><label class="f-label">Дата</label><input class="t-input t-input--full" type="date" id="tk_date" value="${esc(t.due || preset.date || CAL_SEL)}"></div><div class="f-col" style="justify-content:flex-end"><label class="chk"><input type="checkbox" id="tk_allday" ${allday ? 'checked' : ''}> Весь день</label></div></div>
    <div class="f-row" id="tk_times" style="${allday ? 'display:none' : ''}"><div class="f-col"><label class="f-label">Начало</label><input class="t-input t-input--full" type="time" id="tk_start" value="${esc(t.start || preset.start || '10:00')}"></div><div class="f-col"><label class="f-label">Конец</label><input class="t-input t-input--full" type="time" id="tk_end" value="${esc(t.end || '')}"></div></div>
    <div class="f-col"><label class="f-label">Исполнитель</label><select class="t-select t-select--full" id="tk_asg">${asgOpts}</select></div>
    <label class="chk"><input type="checkbox" id="tk_done" ${t.done ? 'checked' : ''}> Выполнено</label>
    <div class="panel__foot">${id ? '<button type="button" class="btn-ghost" id="tkDel">Удалить</button>' : ''}<button type="button" class="btn-ghost" id="tkCancel">Отмена</button><button type="submit" class="btn">Сохранить</button></div></form></div></div>`);
  const close = closeMount; document.getElementById('tkClose').onclick = close; document.getElementById('tkCancel').onclick = close; document.getElementById('ov').onclick = e => { if (e.target.id === 'ov') close(); };
  document.getElementById('tk_allday').onchange = e => { document.getElementById('tk_times').style.display = e.target.checked ? 'none' : ''; };
  if (id) document.getElementById('tkDel').onclick = () => { DB.saveTasks(DB.tasks().filter(x => x.id !== id)); close(); viewCalendar(); updateBadges(); };
  document.getElementById('tkForm').onsubmit = e => {
    e.preventDefault(); const ad = document.getElementById('tk_allday').checked;
    const d = { title: document.getElementById('tk_title').value.trim(), due: document.getElementById('tk_date').value, start: ad ? '' : document.getElementById('tk_start').value, end: ad ? '' : document.getElementById('tk_end').value, assignee: document.getElementById('tk_asg').value, done: document.getElementById('tk_done').checked };
    const arr = DB.tasks(); if (id) { const i = arr.findIndex(x => x.id === id); arr[i] = { ...arr[i], ...d }; } else arr.unshift({ id: uid(), ...d });
    DB.saveTasks(arr); close(); viewCalendar(); updateBadges();
  };
}

/* ── Reference (справочники) ── */
const slug = s => String(s || '').toLowerCase().replace(/[«»"']/g, '').replace(/[^a-zа-я0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 24) || 'src';
const refLinkOf = it => it.link || ('uniqore.pro/r/' + slug(it.name));
function viewReference(n) {
  const key = n.refKey, fields = n.refFields || [{ key: 'name', label: 'Название' }], items = DB.ref(key);
  if (n.referral) return viewReferral(n, key, items);
  const rows = items.map(it => `<tr data-ref="${it.id}">${fields.map(f => `<td>${esc(it[f.key] || '—')}</td>`).join('')}${n.drill ? '<td style="text-align:right;color:var(--text3)">' + icon('door') + '</td>' : ''}</tr>`).join('') || `<tr><td colspan="${fields.length + (n.drill ? 1 : 0)}"><div class="empty-hint">Пусто. Жми «+ Запись».</div></td></tr>`;
  document.getElementById('viewBody').innerHTML = `<div class="table-wrap"><table><thead><tr>${fields.map(f => `<th>${esc(f.label)}</th>`).join('')}${n.drill ? '<th></th>' : ''}</tr></thead><tbody>${rows}</tbody></table></div>`;
  document.querySelectorAll('tr[data-ref]').forEach(tr => tr.onclick = () => { const it = items.find(x => x.id === tr.dataset.ref); if (n.drill && it) { showView(n.drill.view); const inp = document.getElementById('tblSearch'); if (inp) { inp.value = it[n.drill.by] || ''; inp.dispatchEvent(new Event('input')); } } else openRef(key, fields, tr.dataset.ref); });
}
// Источники с реферальными ссылками и счётчиком переходов
function viewReferral(n, key, items) {
  const total = items.reduce((s, it) => s + (Number(it.hits) || 0), 0);
  const cards = items.map(it => { const link = refLinkOf(it); return `<div class="src-card"><div><div class="src-card__name">${esc(it.name)}</div><div class="src-card__meta">${it.cost ? 'Стоимость лида: ' + fmtMoney(it.cost) : 'Бесплатный канал'}</div></div><div class="src-link" title="${escAttr(link)}">${esc(link)}</div><div class="src-stat"><div class="src-stat__v">${Number(it.hits) || 0}</div><div class="src-stat__l">переходов</div></div><div class="src-actions"><button class="btn-ghost" data-copy="${escAttr(link)}">${icon('copy')} Копировать</button><button class="btn" data-hit="${it.id}">+ переход</button><button class="btn-ghost" data-edit="${it.id}">${icon('edit')}</button></div></div>`; }).join('') || '<div class="empty-hint">Источников нет. Жми «+ Запись».</div>';
  document.getElementById('viewBody').innerHTML = `<div class="kpi-row"><div class="kpi kpi--acc"><div class="kpi__label">Всего переходов по рефссылкам</div><div class="kpi__val num kpi__val--acc">${total}</div><div class="kpi__sub">${items.length} ${plural(items.length, 'источник', 'источника', 'источников')}</div></div></div><div class="src-grid">${cards}</div>`;
  document.querySelectorAll('[data-copy]').forEach(b => b.onclick = () => copyText(b.dataset.copy));
  document.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openRef(key, n.refFields, b.dataset.edit));
  document.querySelectorAll('[data-hit]').forEach(b => b.onclick = () => { const arr = DB.ref(key), it = arr.find(x => x.id === b.dataset.hit); if (!it) return; it.hits = (Number(it.hits) || 0) + 1; DB.saveRef(key, arr); referralLead(it); refresh(); });
}
// копирование в буфер с фолбэком (file:// часто без clipboard API)
function copyText(t) { const done = () => toast('Ссылка скопирована', 'ok'); try { navigator.clipboard.writeText(t).then(done, () => fallbackCopy(t, done)); } catch { fallbackCopy(t, done); } }
function fallbackCopy(t, done) { const ta = document.createElement('textarea'); ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); done(); } catch { toast('Скопируй вручную: ' + t, 'info', 5000); } document.body.removeChild(ta); }
// переход по рефссылке → создаём лид с этим источником (+1 в воронку)
function referralLead(src) {
  const ent = entById('lead'); if (!ent || ent.key !== 'lead') { toast('+1 переход', 'ok'); return; }
  const srcField = ent.fields.find(f => f.key === 'source' || f.key === 'channel');
  const recs = DB.recs('lead'); const rec = { id: uid(), createdAt: new Date().toISOString(), stage: (ent.stages && ent.stages[0] || {}).id, activity: [{ text: 'Пришёл по рефссылке: ' + src.name, date: new Date().toISOString() }] };
  const nameF = ent.fields.find(f => f.primary) || ent.fields[0]; if (nameF) rec[nameF.key] = 'Лид с «' + src.name + '»';
  if (srcField) rec[srcField.key] = src.name;
  recs.unshift(rec); DB.saveRecs('lead', recs);
  toast('Переход засчитан → создан лид в воронке', 'ok'); runAutom('created', { ent, rec });
}
function openRef(key, fields, id) {
  fields = fields || [{ key: 'name', label: 'Название' }]; const items = DB.ref(key), it = id ? items.find(x => x.id === id) : {};
  mount(`<div class="overlay overlay--center" id="ov"><div class="panel panel--modal"><div class="panel__head"><div class="panel__title">${id ? 'Запись' : 'Новая запись'}</div><button class="icon-btn" id="rClose">${icon('x')}</button></div><form class="panel__body" id="refForm">${fields.map(f => `<div class="f-col"><label class="f-label">${esc(f.label)}</label><input class="t-input t-input--full" id="r_${f.key}" type="${f.type === 'money' || f.type === 'number' ? 'number' : 'text'}" value="${esc(it[f.key] || '')}"></div>`).join('')}<div class="panel__foot">${id ? '<button type="button" class="btn-ghost" id="rDel">Удалить</button>' : ''}<button type="button" class="btn-ghost" id="rCancel">Отмена</button><button type="submit" class="btn">Сохранить</button></div></form></div></div>`);
  const close = closeMount; document.getElementById('rClose').onclick = close; document.getElementById('rCancel').onclick = close; document.getElementById('ov').onclick = e => { if (e.target.id === 'ov') close(); };
  if (id) document.getElementById('rDel').onclick = () => { DB.saveRef(key, DB.ref(key).filter(x => x.id !== id)); close(); refresh(); };
  document.getElementById('refForm').onsubmit = e => { e.preventDefault(); const data = {}; fields.forEach(f => data[f.key] = document.getElementById('r_' + f.key).value); const arr = DB.ref(key); if (id) { const i = arr.findIndex(x => x.id === id); arr[i] = { ...arr[i], ...data }; } else arr.unshift({ id: uid(), ...data }); DB.saveRef(key, arr); close(); refresh(); };
}

/* ── Tasks ── */
function viewTasks() {
  const tasks = DB.tasks().slice().sort((a, b) => (a.done - b.done) || (new Date(b.createdAt || b.due || 0) - new Date(a.createdAt || a.due || 0)));
  const rows = tasks.map(t => `<div class="list-item"><div class="pdot" style="background:${t.done ? 'var(--good)' : daysTo(t.due) < 0 ? 'var(--bad)' : 'var(--acc)'}"></div><div class="list-item__name" style="${t.done ? 'opacity:.5;text-decoration:line-through' : ''}">${esc(t.title)}</div><div class="list-item__right"><div class="list-item__meta">${fmtWhen(t.due)}</div><button class="btn-ghost" data-done="${t.id}">${t.done ? '↺' : ''}</button></div></div>`).join('');
  document.getElementById('viewBody').innerHTML = `<div class="toolbar"><input class="t-input t-input--search" id="taskInput" placeholder="Новая задача... (Enter)"><input class="t-input" type="date" id="taskDate"><button class="btn" id="taskAdd">Добавить</button></div><div class="card" style="padding:6px 14px">${rows || '<div class="empty-hint">Задач нет</div>'}</div>`;
  const add = () => { const v = document.getElementById('taskInput').value.trim(); if (!v) return; const t = DB.tasks(); t.unshift({ id: uid(), title: v, due: document.getElementById('taskDate').value, done: false }); DB.saveTasks(t); viewTasks(); updateBadges(); };
  document.getElementById('taskAdd').addEventListener('click', add); document.getElementById('taskInput').addEventListener('keydown', e => { if (e.key === 'Enter') add(); });
  document.querySelectorAll('[data-done]').forEach(b => b.addEventListener('click', () => { const t = DB.tasks(), x = t.find(i => i.id === b.dataset.done); x.done = !x.done; DB.saveTasks(t); viewTasks(); updateBadges(); }));
}

/* ── Team ── */
const ROLE_FIXED = { owner: '#E5B53B', coowner: '#E5B53B', director: '#f59e0b', head: '#fb923c' };
const roleColor = r => ROLE_FIXED[r] || (() => { let h = 0; for (const c of String(r || 'x')) h = (h * 33 + c.charCodeAt(0)) % 360; return `hsl(${h},62%,62%)`; })();
const roleName = r => ROLES[r] || r || '—';
function viewTeam() {
  const team = DB.team();
  const cards = team.map(m => {
    const kp = teamKpi(m);
    const mets = roleMetricsFor(m.role).filter(k => kp[k.key] != null && kp[k.key] !== '');
    const tileMoney = nm => Math.abs(nm) >= 1e6 ? (nm / 1e6).toFixed(1).replace('.0', '') + ' млн ₽' : Number(nm).toLocaleString(LOC) + ' ₽';
    const kpis = mets.length ? `<div class="team-kpis">${mets.map(k => { const v = kp[k.key]; return `<div class="team-kpi"><div class="team-kpi__v num">${k.money ? tileMoney(v) : (v + (k.suffix || ''))}</div><div class="team-kpi__l">${esc(k.label)}</div></div>`; }).join('')}</div>` : '';
    return `<div class="team-card" data-mem="${m.id}"><div class="team-card__top"><div class="team-av" style="background:${roleColor(m.role)}">${esc((m.name || '?').trim().slice(0, 1).toUpperCase())}</div><div style="flex:1;min-width:0"><div class="team-name">${esc(m.name)}</div><div class="list-item__meta">${esc(m.contact || '—')}</div></div><span class="badge" style="color:${roleColor(m.role)}">${esc(roleName(m.role))}</span></div>${kpis}</div>`;
  }).join('') || '<div class="empty-hint">Сотрудников нет. Жми «+ Сотрудник».</div>';
  document.getElementById('viewBody').innerHTML = `<div class="team-grid">${cards}</div>`;
  document.querySelectorAll('.team-card[data-mem]').forEach(el => el.onclick = () => openMember(el.dataset.mem));
}
function openMember(id) {
  const team = DB.team(), m = id ? team.find(x => x.id === id) : {}; const isCustom = m.role && !ROLES[m.role];
  const roleOpts = Object.entries(ROLES).map(([k, v]) => `<option value="${k}" ${m.role === k ? 'selected' : ''}>${esc(v)}</option>`).join('') + `<option value="__custom__" ${isCustom ? 'selected' : ''}> Своя роль…</option>`;
  mount(`<div class="overlay overlay--center" id="ov"><div class="panel panel--modal"><div class="panel__head"><div class="panel__title">${id ? 'Сотрудник' : 'Новый сотрудник'}</div><button class="icon-btn" id="mClose">${icon('x')}</button></div><form class="panel__body" id="memForm">
    <div class="f-col"><label class="f-label">Имя *</label><input class="t-input t-input--full" id="m_name" value="${esc(m.name || '')}" required></div>
    <div class="f-row"><div class="f-col"><label class="f-label">Роль</label><select class="t-select t-select--full" id="m_role">${roleOpts}</select></div><div class="f-col"><label class="f-label">Контакт</label><input class="t-input t-input--full" id="m_contact" value="${esc(m.contact || '')}" placeholder="@tg / телефон"></div></div>
    <div class="f-col" id="m_customWrap" style="display:${isCustom ? '' : 'none'}"><label class="f-label">Название своей роли</label><input class="t-input t-input--full" id="m_rolecustom" value="${isCustom ? esc(m.role) : ''}"></div>
    <div id="m_kpis"></div><div class="f-col"><label class="f-label">Заметка</label><input class="t-input t-input--full" id="m_note" value="${esc(m.note || '')}"></div>
    <div class="panel__foot">${id ? '<button type="button" class="btn-ghost" id="mDel">Удалить</button>' : ''}<button type="button" class="btn-ghost" id="mCancel">Отмена</button><button type="submit" class="btn">Сохранить</button></div></form></div></div>`);
  const sel = document.getElementById('m_role');
  function renderKpis() { const role = sel.value === '__custom__' ? 'default' : sel.value, mets = roleMetricsFor(role); document.getElementById('m_kpis').innerHTML = mets.length ? `<label class="f-label">Показатели роли</label><div class="f-row" style="flex-wrap:wrap;gap:10px">` + mets.map(k => `<div class="f-col" style="flex:1;min-width:130px"><label class="f-label">${esc(k.label)}${k.money ? ' (₽)' : ''}</label><input class="t-input t-input--full" type="number" id="kpi_${k.key}" value="${esc((m.kpi || {})[k.key] ?? '')}"></div>`).join('') + `</div>` : ''; }
  sel.onchange = () => { document.getElementById('m_customWrap').style.display = sel.value === '__custom__' ? '' : 'none'; renderKpis(); }; renderKpis();
  const close = closeMount; document.getElementById('mClose').onclick = close; document.getElementById('mCancel').onclick = close; document.getElementById('ov').onclick = e => { if (e.target.id === 'ov') close(); };
  if (id) document.getElementById('mDel').onclick = () => { DB.saveTeam(DB.team().filter(x => x.id !== id)); close(); refresh(); };
  document.getElementById('memForm').onsubmit = e => { e.preventDefault(); const role = sel.value === '__custom__' ? (document.getElementById('m_rolecustom').value.trim() || 'Сотрудник') : sel.value; const kpi = {}; roleMetricsFor(sel.value === '__custom__' ? 'default' : role).forEach(k => { const el = document.getElementById('kpi_' + k.key); if (el && el.value !== '') kpi[k.key] = Number(el.value); }); const d = { name: document.getElementById('m_name').value.trim(), role, contact: document.getElementById('m_contact').value.trim(), note: document.getElementById('m_note').value.trim(), kpi }; const arr = DB.team(); if (id) { const i = arr.findIndex(x => x.id === id); arr[i] = { ...arr[i], ...d }; } else arr.unshift({ id: uid(), ...d }); DB.saveTeam(arr); close(); refresh(); };
}

/* ── Analytics ── */
function defaultAnalytics() { return [{ kind: 'bars', title: 'По статусам', groupBy: 'stage' }, { kind: 'donut', title: 'Распределение', groupBy: 'stage' }]; }
function lineData(w, recs, pays) {
  const months = monthsBack(w.months || 8), idx = {}; months.forEach((m, i) => idx[m.key] = i);
  const src = w.source === 'payments' ? pays : recs, dkey = w.dateField || (w.source === 'payments' ? 'due' : 'createdAt'), ent = entById(w.entity), vf = w.value && w.source !== 'payments' ? fieldByKey(w.value, ent) : null;
  src.forEach(it => { if (w.status && it.status !== w.status) return; const dv = it[dkey]; if (!dv) return; const d = new Date(dv), k = d.getFullYear() + '-' + d.getMonth(); if (k in idx) months[idx[k]].y += (w.agg === 'count') ? 1 : (w.source === 'payments' ? (Number(it[w.value || 'amount']) || 0) : (vf ? Number(val(it, vf)) || 0 : 1)); });
  return months;
}
function analyticsWidget(w, wi, draws) {
  const ent = entById(w.entity), recs = DB.recs(w.entity || primEnt.key), pays = DB.pays(), id = 'an_' + wi, wide = w.wide ? ' an-wide' : '';
  const head = `<div class="bcard__head"><span class="bcard__label">${esc(w.title || '')}</span></div>`;
  if (w.kind === 'kpis') { return `<div class="an-wide"><div class="kpi-row">${(w.metrics || []).map(kpiCard).join('')}</div></div>`; }
  if (w.kind === 'line') { const pts = lineData(w, recs, pays); draws.push(() => drawLine(document.getElementById(id), pts, w.money)); const tot = pts.reduce((s, p) => s + p.y, 0); return `<div class="bcard an-wide${wide}">${head}<div class="an-sub num">${w.money ? fmtMoney(tot) : tot} за период</div><canvas id="${id}" class="an-canvas"></canvas></div>`; }
  if (w.kind === 'donut') { const g = groupAgg(recs.filter(r => matchFilter(r, w.where)), w.groupBy, null, ent), data = g.map(d => ({ label: d.label, value: d.count, color: d.color })); draws.push(() => drawDonut(document.getElementById(id), data)); const legend = g.map(d => `<div class="an-leg"><span class="an-dot" style="background:${d.color}"></span>${esc(d.label)}<b class="num">${d.count}</b></div>`).join(''); return `<div class="bcard${wide}">${head}<div class="an-donut"><canvas id="${id}" class="an-canvas" style="max-width:200px"></canvas><div class="an-legend">${legend}</div></div></div>`; }
  if (w.kind === 'bars') { const g = groupAgg(recs.filter(r => matchFilter(r, w.where)), w.groupBy, w.money, ent), max = Math.max(1, ...g.map(d => w.money ? d.sum : d.count)); const rows = g.map(d => `<div class="bar-row"><div class="bar-row__label">${esc(d.label)}</div><div class="bar-track"><div class="bar-fill" style="width:${(w.money ? d.sum : d.count) / max * 100}%;background:${d.color}"></div></div><div class="bar-row__val num">${w.money ? moneyShort(d.sum) : d.count}</div></div>`).join('') || '<div class="empty-hint">Нет данных</div>'; return `<div class="bcard${wide}">${head}${rows}</div>`; }
  if (w.kind === 'breakdown') { const g = groupAgg(recs.filter(r => matchFilter(r, w.where)), w.groupBy, w.money, ent); const rows = g.map(d => `<tr><td><b>${esc(d.label)}</b></td><td class="num">${d.count}</td><td class="num cell-acc">${fmtMoney(d.sum)}</td></tr>`).join('') || `<tr><td colspan="3"><div class="empty-hint">Нет данных</div></td></tr>`; return `<div class="bcard${wide}">${head}<table class="an-table"><thead><tr><th>Категория</th><th>Кол-во</th><th>${esc((fieldByKey(w.money, ent) || {}).label || 'Сумма')}</th></tr></thead><tbody>${rows}</tbody></table></div>`; }
  if (w.kind === 'top') { const f = fieldByKey(w.field, ent), top = recs.filter(r => matchFilter(r, w.where)).map(r => ({ r, v: Number(val(r, f)) || 0 })).sort((a, b) => b.v - a.v).slice(0, w.limit || 5); const rows = top.map(({ r, v }) => `<div class="list-item" data-id="${r.id}" data-ent="${ent.key}"><div class="list-item__name">${esc(primary(r, ent))}</div><div class="list-item__right"><div class="cell-acc num">${f.type === 'money' || f.type === 'computed' ? fmtMoney(v) : v}</div></div></div>`).join('') || '<div class="empty-hint">Нет данных</div>'; return `<div class="bcard${wide}">${head}${rows}</div>`; }
  return '';
}
function viewAnalytics() { const draws = [], widgets = (R.analytics && R.analytics.length) ? R.analytics : defaultAnalytics(); document.getElementById('viewBody').innerHTML = `<div class="an-grid">${widgets.map((w, i) => analyticsWidget(w, i, draws)).join('')}</div>`; bindRowClicks(); setTimeout(() => draws.forEach(fn => fn()), 0); }

/* ── helpers ── */
/* ── Attention (дашборд отвечает на вопросы) ── */
function attentionCards() {
  const pays = DB.pays(), tasks = DB.tasks();
  const ovPay = pays.filter(p => p.status === 'overdue'), ovSum = ovPay.reduce((s, p) => s + (+p.amount || 0), 0);
  const ovTasks = tasks.filter(t => !t.done && t.due && daysTo(t.due) < 0);
  let expiring = 0, stuck = 0;
  ENTITIES.forEach(e => { const df = e.fields.find(f => f.type === 'date'); DB.recs(e.key).forEach(r => { if (df && r[df.key] && daysTo(r[df.key]) >= 0 && daysTo(r[df.key]) <= 14 && r.stage !== 'lost') expiring++; if ((e.key === 'deal') && ['new', 'nego'].includes(r.stage) && daysTo(r.createdAt) < -14) stuck++; }); });
  const card = (label, val, sub, sev, view) => `<div class="att-card att-card--${sev}" ${view ? `data-go="${view}"` : ''}><div class="att-card__v num">${val}</div><div class="att-card__l">${esc(label)}</div><div class="att-card__s">${esc(sub)}</div></div>`;
  const html = `<div class="att-row">
    ${card('Просрочено оплат', ovPay.length, ovSum ? fmtMoney(ovSum) : 'нет', ovPay.length ? 'bad' : 'ok', 'pay')}
    ${card('Просрочено задач', ovTasks.length, ovTasks.length ? 'требуют внимания' : 'всё в срок', ovTasks.length ? 'bad' : 'ok', 'tasks')}
    ${card('Скоро освобождаются', expiring, 'в ближайшие 14 дней', expiring ? 'warn' : 'ok', 'objects')}
    ${card('Зависшие сделки', stuck, '>14 дней без движения', stuck ? 'warn' : 'ok', 'deals')}</div>`;
  return html;
}

/* ── Activity / Timeline ── */
function allActivity() {
  const ev = [];
  ENTITIES.forEach(e => DB.recs(e.key).forEach(r => (r.activity || []).forEach(a => ev.push({ date: a.date, text: a.text, who: primary(r, e), ic: 'activity' }))));
  DB.pays().filter(p => p.status === 'paid').forEach(p => ev.push({ date: p.due, text: 'Оплата получена: ' + p.title, who: fmtMoney(p.amount), ic: 'wallet' }));
  DB.docs().forEach(d => ev.push({ date: d.date, text: 'Документ: ' + d.title, who: '', ic: 'file' }));
  DB.log().forEach(l => ev.push({ date: l.date, text: 'Сценарий «' + l.rule + '»: ' + l.detail + (l.queued ? ' (в очереди — нужна интеграция Pro)' : ''), who: l.target || '', ic: 'bolt' }));
  return ev.filter(e => e.date).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 50);
}
function viewActivity() {
  const ev = allActivity();
  const rows = ev.map(e => `<div class="tl-item"><div class="tl-dot">${icon(e.ic)}</div><div class="tl-body"><div class="tl-text">${esc(e.text)}</div>${e.who ? `<div class="list-item__meta">${esc(e.who)}</div>` : ''}</div><div class="list-item__meta">${fmtWhen(e.date)}</div></div>`).join('') || '<div class="empty-hint">Пока нет событий</div>';
  document.getElementById('viewBody').innerHTML = `<div class="bcard"><div class="bcard__head"><span class="bcard__label">Лента событий компании</span></div><div class="tl">${rows}</div></div>`;
}

/* ── Notifications (кликабельные, прочитано, переход к источнику) ── */
function notifNav(go) { const t = { payments: 'payments', calendar: 'calendar', automation: 'automation', records: 'records' }[go]; return R.nav.find(n => n.type === t); }
function viewNotifications() {
  const read = new Set(parse(K('notifRead'), '[]'));
  const items = [];
  DB.pays().filter(p => p.status === 'overdue').forEach(p => items.push({ sev: 'bad', t: 'Просрочен платёж', s: p.title + ' · ' + fmtMoney(p.amount), go: 'payments' }));
  DB.tasks().filter(t => !t.done && t.due && daysTo(t.due) < 0).forEach(t => items.push({ sev: 'bad', t: 'Просрочена задача', s: t.title + ' · ' + timeAgo(t.due), go: 'calendar' }));
  ENTITIES.forEach(e => { const df = e.fields.find(f => f.type === 'date'); DB.recs(e.key).forEach(r => { if (df && r[df.key] && daysTo(r[df.key]) >= 0 && daysTo(r[df.key]) <= 7 && r.stage !== 'lost') items.push({ sev: 'warn', t: 'Скоро освобождается', s: primary(r, e) + ' · ' + timeAgo(r[df.key]), go: 'records', ent: e.key, id: r.id }); }); });
  DB.log().slice(0, 12).forEach(l => items.push({ sev: l.sev || 'good', t: 'Сценарий: ' + l.rule, s: l.detail + (l.target ? ' · ' + l.target : '') + (l.queued ? ' · в очереди (Pro)' : ''), go: 'automation' }));
  items.forEach(x => x.k = (x.t + '|' + x.s).slice(0, 90));
  items.sort((a, b) => (read.has(a.k) - read.has(b.k)));
  const unread = items.filter(x => !read.has(x.k)).length;
  const rows = items.map((x, i) => `<div class="notif notif--act ${read.has(x.k) ? 'is-read' : ''}" data-i="${i}"><span class="pill pill--${x.sev}">●</span><div style="flex:1;min-width:0"><div class="team-name">${esc(x.t)}</div><div class="list-item__meta">${esc(x.s)}</div></div>${read.has(x.k) ? '' : '<span class="notif-dot"></span>'}</div>`).join('') || '<div class="empty-hint">Уведомлений нет — всё спокойно</div>';
  document.getElementById('viewBody').innerHTML = `<div class="toolbar"><span class="num" style="color:var(--text2)">${unread ? unread + ' ' + plural(unread, 'новое', 'новых', 'новых') : 'Все прочитаны'}</span>${unread ? '<button class="btn-ghost" id="notifReadAll" style="margin-left:auto">Прочитать все</button>' : ''}</div><div class="bcard" style="padding:6px 14px">${rows}</div>`;
  const markRead = k => { const arr = parse(K('notifRead'), '[]'); if (!arr.includes(k)) { arr.push(k); save(K('notifRead'), arr.slice(-200)); } };
  document.querySelectorAll('.notif--act[data-i]').forEach(el => el.onclick = () => { const x = items[+el.dataset.i]; markRead(x.k); updateBadges(); if (x.go === 'records' && x.ent && x.id) openDetail(x.ent, x.id); else { const nv = notifNav(x.go); if (nv) showView(nv.key); else refresh(); } });
  const ra = document.getElementById('notifReadAll'); if (ra) ra.onclick = () => { const arr = parse(K('notifRead'), '[]'); items.forEach(x => { if (!arr.includes(x.k)) arr.push(x.k); }); save(K('notifRead'), arr.slice(-200)); toast('Все уведомления прочитаны', 'ok'); refresh(); };
}

/* ── Automation (фундамент конструктора) ── */
const AUTOM_TRIGGERS = { stage: 'Сменился статус', created: 'Создана запись', payOverdue: 'Платёж просрочен', leaseSoon: 'Договор истекает', taskOverdue: 'Задача просрочена' };
const AUTOM_ACTIONS = { task: 'Создать задачу', assign: 'Назначить сотрудника', setField: 'Изменить поле', invoice: 'Выставить счёт', doc: 'Создать документ', notify: 'Создать уведомление', stage: 'Перевести на этап', telegram: 'Отправить Telegram', email: 'Отправить Email' };
// Действия, которым нужен реальный бэкенд/интеграция (в Lite — ставим в очередь и честно помечаем)
const AUTOM_NEEDS_BACKEND = { telegram: 1, email: 1 };
// Операторы условий (развилки IF) — правило выполняется, только если ВСЕ условия истинны
const AUTOM_OPS = { eq: 'равно', ne: 'не равно', gt: 'больше', lt: 'меньше', contains: 'содержит', empty: 'пусто', notempty: 'заполнено' };
// Проверка условий правила против записи. Нет условий или нет записи → пропускаем (true).
function automMatch(rule, ctx) {
  const conds = rule.conditions || []; if (!conds.length) return true;
  if (!ctx.rec || !ctx.ent) return true; // по срокам без записи условия не оцениваем
  return conds.every(c => {
    if (!c.field) return true;
    const raw = c.field === 'stage' ? ctx.rec.stage : ctx.rec[c.field];
    if (c.op === 'empty') return raw == null || raw === '';
    if (c.op === 'notempty') return !(raw == null || raw === '');
    const sv = String(raw == null ? '' : raw).toLowerCase(), cv = String(c.value == null ? '' : c.value).toLowerCase();
    if (c.op === 'contains') return sv.includes(cv);
    if (c.op === 'ne') return sv !== cv;
    if (c.op === 'gt') return (Number(raw) || 0) > (Number(c.value) || 0);
    if (c.op === 'lt') return (Number(raw) || 0) < (Number(c.value) || 0);
    return sv === cv; // eq
  });
}

/* ── ДВИЖОК АВТОМАТИЗАЦИИ — правила реально выполняются (клиентский, без сервера) ──
   runAutom(trigger, ctx) вызывается при событии: ctx = { ent, rec, label }.
   Возвращает число сработавших сценариев. */
function automExecAction(rule, action, ctx) {
  const stamp = new Date().toISOString();
  const label = ctx.label || (ctx.rec && ctx.ent ? primary(ctx.rec, ctx.ent) : '');
  let detail = AUTOM_ACTIONS[action] || action;
  if (action === 'task') {
    const tasks = DB.tasks();
    const title = (rule.taskTitle && rule.taskTitle.trim()) || ('Авто: ' + (rule.name || 'сценарий'));
    tasks.unshift({ id: uid(), title: title + (label ? ' — ' + label : ''), due: ymdOf(dAdd(new Date(), Number(rule.taskDays) || 2)), assignee: rule.assignee || '', createdAt: stamp, auto: true });
    DB.saveTasks(tasks); detail = 'Создана задача «' + title + '»';
  } else if (action === 'stage' && rule.targetStage && ctx.rec && ctx.ent) {
    const recs = DB.recs(ctx.ent.key), r = recs.find(x => x.id === ctx.rec.id), st = stageById(rule.targetStage, ctx.ent);
    if (r && st) { r.stage = rule.targetStage; r.updatedAt = stamp; r.activity = r.activity || []; r.activity.push({ text: 'Авто-сценарий → ' + st.label, date: stamp }); DB.saveRecs(ctx.ent.key, recs); detail = 'Этап → ' + st.label; }
  } else if (action === 'setField' && rule.setKey && ctx.rec && ctx.ent) {
    const recs = DB.recs(ctx.ent.key), r = recs.find(x => x.id === ctx.rec.id), f = fieldByKey(rule.setKey, ctx.ent);
    if (r) { r[rule.setKey] = rule.setValue; r.updatedAt = stamp; r.activity = (r.activity || []).concat({ text: 'Авто: поле «' + ((f && f.label) || rule.setKey) + '» → ' + rule.setValue, date: stamp }); DB.saveRecs(ctx.ent.key, recs); detail = ((f && f.label) || rule.setKey) + ' → ' + rule.setValue; }
  } else if (action === 'invoice') {
    const amt = Number(rule.amount) || (ctx.rec && ctx.ent ? Number(val(ctx.rec, (ctx.ent.fields.find(f => f.type === 'money') || {}))) || 0 : 0);
    const pays = DB.pays(); pays.unshift({ id: uid(), title: 'Счёт' + (label ? ' — ' + label : ''), amount: amt, kind: 'Счёт', status: 'pending', due: ymdOf(dAdd(new Date(), Number(rule.taskDays) || 5)), auto: true });
    DB.savePays(pays); detail = 'Выставлен счёт' + (amt ? ' на ' + fmtMoney(amt) : '');
  } else if (action === 'doc') {
    const docs = DB.docs(); const dt = rule.docType || 'invoice'; docs.unshift({ id: uid(), title: (rule.taskTitle && rule.taskTitle.trim()) || ('Документ' + (label ? ' — ' + label : '')), type: dt, date: ymdOf(new Date()), status: 'draft', auto: true });
    DB.saveDocs(docs); detail = 'Создан документ';
  } else if (action === 'assign' && rule.assignee) {
    detail = 'Назначен: ' + rule.assignee;
  }
  const backend = AUTOM_NEEDS_BACKEND[action];
  const log = DB.log();
  log.unshift({ id: uid(), date: stamp, rule: rule.name || 'Сценарий', action, detail, target: label, sev: backend ? 'warn' : 'good', queued: !!backend });
  DB.saveLog(log);
}
function runAutom(trigger, ctx) {
  // развилка: берём только включённые правила нужного триггера, чьи условия выполнены
  const rules = DB.autom().filter(a => a.enabled && a.trigger === trigger && automMatch(a, ctx));
  if (!rules.length) return 0;
  rules.forEach(rule => (rule.actions || []).forEach(ac => { try { automExecAction(rule, ac, ctx); } catch (e) {} }));
  const names = rules.map(r => r.name || 'Сценарий');
  try { toast('Сработал сценарий: ' + names.join(', '), 'ok'); } catch {}
  updateBadges();
  return rules.length;
}
// Запуск сценариев по времени (просрочки/сроки) — по кнопке «Проверить сейчас»
function runAutomTimers() {
  let fired = 0;
  DB.pays().filter(p => p.status === 'overdue').forEach(p => { fired += runAutom('payOverdue', { label: p.title + ' · ' + fmtMoney(p.amount) }); });
  DB.tasks().filter(t => !t.done && t.due && daysTo(t.due) < 0).forEach(t => { fired += runAutom('taskOverdue', { label: t.title }); });
  ENTITIES.forEach(e => { const df = e.fields.find(f => f.type === 'date'); if (!df) return; DB.recs(e.key).forEach(r => { if (r[df.key] && daysTo(r[df.key]) >= 0 && daysTo(r[df.key]) <= 7 && r.stage !== 'lost') fired += runAutom('leaseSoon', { ent: e, rec: r }); }); });
  if (!fired) toast('Активных сценариев по срокам не сработало', 'info');
  return fired;
}
function viewAutomation() {
  const rules = DB.autom();
  const condText = a => (a.conditions || []).map(c => { const fl = c.field === 'stage' ? 'Статус' : ((primEnt.fields.find(f => f.key === c.field) || {}).label || c.field); return fl + ' ' + (AUTOM_OPS[c.op] || c.op) + (c.op === 'empty' || c.op === 'notempty' ? '' : ' ' + c.value); }).join(' И ');
  const cards = rules.map(a => `<div class="auto-rule" data-auto="${a.id}"><div class="auto-rule__head"><span class="pill ${a.enabled ? 'pill--good' : ''}">${a.enabled ? 'Вкл' : 'Выкл'}</span><b>${esc(a.name || 'Сценарий')}</b></div><div class="auto-flow"><span class="auto-node auto-node--trig">${esc(AUTOM_TRIGGERS[a.trigger] || a.trigger)}</span>${(a.conditions || []).length ? `<span class="auto-arrow">→</span><span class="auto-node auto-node--cond">если ${esc(condText(a))}</span>` : ''}${(a.actions || []).map(ac => `<span class="auto-arrow">→</span><span class="auto-node">${esc(AUTOM_ACTIONS[ac] || ac)}</span>`).join('')}</div></div>`).join('') || '<div class="empty-hint">Сценариев нет. Создай первый — «+ Сценарий».</div>';
  const log = DB.log();
  const logHtml = log.slice(0, 15).map(l => `<div class="auto-log__row"><span class="pill pill--${l.sev || 'good'}">●</span><div style="flex:1;min-width:0"><div class="team-name">${esc(l.rule)} · ${esc(l.detail)}</div><div class="list-item__meta">${l.target ? esc(l.target) + ' · ' : ''}${fmtWhen(l.date)}${l.queued ? ' · в очереди (нужна интеграция Pro)' : ''}</div></div></div>`).join('') || '<div class="empty-hint">Сценарии ещё не срабатывали. Перемести запись по этапам или нажми «Проверить сейчас».</div>';
  document.getElementById('viewBody').innerHTML = `<div class="toolbar"><div class="eyebrow" style="margin:0">Сценарии реально выполняются: при смене этапа, создании записи и по срокам</div><button class="btn" id="autoRun" style="margin-left:auto">Проверить сейчас</button>${log.length ? '<button class="btn-ghost" id="autoClear">Очистить журнал</button>' : ''}</div>
    <div class="auto-list">${cards}</div>
    <div class="bcard" style="margin-top:16px"><div class="bcard__head"><span class="bcard__label">Журнал срабатываний</span></div><div class="auto-log">${logHtml}</div></div>`;
  document.querySelectorAll('.auto-rule[data-auto]').forEach(el => el.onclick = () => openAutomation(el.dataset.auto));
  document.getElementById('autoRun').onclick = () => { runAutomTimers(); refresh(); };
  const clr = document.getElementById('autoClear'); if (clr) clr.onclick = () => { DB.saveLog([]); refresh(); };
}
function openAutomation(id) {
  const rules = DB.autom(), a = id ? rules.find(x => x.id === id) : { actions: [] };
  const condFields = [['stage', 'Статус']].concat(primEnt.fields.filter(f => f.type !== 'gallery').map(f => [f.key, f.label]));
  const condRow = (c) => { c = c || {}; return `<div class="cond-row"><select class="t-select cond-field">${condFields.map(([k, l]) => `<option value="${escAttr(k)}" ${c.field === k ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select><select class="t-select cond-op">${Object.entries(AUTOM_OPS).map(([k, l]) => `<option value="${k}" ${c.op === k ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select><input class="t-input cond-val" value="${escAttr(c.value || '')}" placeholder="значение"><button type="button" class="icon-btn cond-del" aria-label="Удалить условие">${icon('x')}</button></div>`; };
  mount(`<div class="overlay overlay--center" id="ov"><div class="panel panel--modal"><div class="panel__head"><div class="panel__title">${id ? 'Сценарий' : 'Новый сценарий'}</div><button class="icon-btn" id="aClose">${icon('x')}</button></div><form class="panel__body" id="autoForm">
    <div class="f-col"><label class="f-label">Название</label><input class="t-input t-input--full" id="a_name" value="${esc(a.name || '')}" placeholder="Напр.: Новый лид → задача менеджеру"></div>
    <div class="f-col"><label class="f-label">Когда (триггер)</label><select class="t-select t-select--full" id="a_trigger">${Object.entries(AUTOM_TRIGGERS).map(([k, v]) => `<option value="${k}" ${a.trigger === k ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select></div>
    <div class="f-col"><label class="f-label">Если (условия) — выполняется, только когда ВСЕ истинны<button type="button" class="cond-add" id="condAdd">+ условие</button></label><div id="condRows">${(a.conditions || []).map(condRow).join('')}</div><div class="cond-hint" id="condHint" ${(a.conditions || []).length ? 'style="display:none"' : ''}>Без условий — срабатывает всегда. Добавь условие для развилки (напр.: Бюджет больше 1000000).</div></div>
    <div class="f-col"><label class="f-label">Тогда (действия) — выбери несколько</label><div class="chk-grid">${Object.entries(AUTOM_ACTIONS).map(([k, v]) => `<label class="chk"><input type="checkbox" value="${k}" ${(a.actions || []).includes(k) ? 'checked' : ''}> ${esc(v)}${AUTOM_NEEDS_BACKEND[k] ? ' ·<span style="color:var(--text3)">Pro</span>' : ''}</label>`).join('')}</div></div>
    <div class="f-grid2">
      <div class="f-col"><label class="f-label">Текст задачи / документа</label><input class="t-input t-input--full" id="a_taskTitle" value="${esc(a.taskTitle || '')}" placeholder="Напр.: Связаться с клиентом"></div>
      <div class="f-col"><label class="f-label">Срок (дней) — задача/счёт</label><input class="t-input t-input--full" type="number" min="0" id="a_taskDays" value="${a.taskDays != null ? a.taskDays : 2}"></div>
      <div class="f-col"><label class="f-label">Исполнитель (для «Назначить»)</label><select class="t-select t-select--full" id="a_assignee"><option value="">— любой —</option>${DB.team().map(m => `<option value="${escAttr(m.name)}" ${a.assignee === m.name ? 'selected' : ''}>${esc(m.name)}</option>`).join('')}</select></div>
      <div class="f-col"><label class="f-label">Целевой этап (для «Перевести на этап»)</label><select class="t-select t-select--full" id="a_targetStage"><option value="">—</option>${(primEnt.stages || []).map(s => `<option value="${escAttr(s.id)}" ${a.targetStage === s.id ? 'selected' : ''}>${esc(s.label)}</option>`).join('')}</select></div>
      <div class="f-col"><label class="f-label">Изменить поле → значение (для «Изменить поле»)</label><div style="display:flex;gap:8px"><select class="t-select" id="a_setKey" style="flex:1"><option value="">— поле —</option>${primEnt.fields.filter(f => !['gallery', 'computed'].includes(f.type)).map(f => `<option value="${escAttr(f.key)}" ${a.setKey === f.key ? 'selected' : ''}>${esc(f.label)}</option>`).join('')}</select><input class="t-input" id="a_setValue" value="${escAttr(a.setValue || '')}" placeholder="значение" style="flex:1"></div></div>
      <div class="f-col"><label class="f-label">Сумма счёта (0 = из поля записи)</label><input class="t-input t-input--full" type="number" min="0" id="a_amount" value="${a.amount != null ? a.amount : 0}"></div>
    </div>
    <label class="chk"><input type="checkbox" id="a_enabled" ${a.enabled !== false ? 'checked' : ''}> Сценарий включён</label>
    <div class="panel__foot">${id ? '<button type="button" class="btn-ghost" id="aDel">Удалить</button>' : ''}<button type="button" class="btn-ghost" id="aCancel">Отмена</button><button type="submit" class="btn">Сохранить</button></div></form></div></div>`);
  const close = closeMount; document.getElementById('aClose').onclick = close; document.getElementById('aCancel').onclick = close; document.getElementById('ov').onclick = e => { if (e.target.id === 'ov') close(); };
  if (id) document.getElementById('aDel').onclick = () => { DB.saveAutom(DB.autom().filter(x => x.id !== id)); close(); refresh(); };
  const condRows = document.getElementById('condRows'), condHint = document.getElementById('condHint');
  const bindCondDel = () => condRows.querySelectorAll('.cond-del').forEach(b => b.onclick = () => { b.closest('.cond-row').remove(); condHint.style.display = condRows.children.length ? 'none' : ''; });
  document.getElementById('condAdd').onclick = () => { condRows.insertAdjacentHTML('beforeend', condRow({})); condHint.style.display = 'none'; bindCondDel(); };
  bindCondDel();
  document.getElementById('autoForm').onsubmit = e => {
    e.preventDefault();
    const actions = [...document.querySelectorAll('#autoForm .chk-grid input:checked')].map(i => i.value);
    const conditions = [...condRows.querySelectorAll('.cond-row')].map(row => ({ field: row.querySelector('.cond-field').value, op: row.querySelector('.cond-op').value, value: row.querySelector('.cond-val').value.trim() })).filter(c => c.field && (c.op === 'empty' || c.op === 'notempty' || c.value !== ''));
    const d = { name: document.getElementById('a_name').value.trim(), trigger: document.getElementById('a_trigger').value, conditions, actions, taskTitle: document.getElementById('a_taskTitle').value.trim(), taskDays: Number(document.getElementById('a_taskDays').value) || 0, assignee: document.getElementById('a_assignee').value, targetStage: document.getElementById('a_targetStage').value, setKey: document.getElementById('a_setKey').value, setValue: document.getElementById('a_setValue').value.trim(), amount: Number(document.getElementById('a_amount').value) || 0, enabled: document.getElementById('a_enabled').checked };
    const arr = DB.autom(); if (id) { const i = arr.findIndex(x => x.id === id); arr[i] = { ...arr[i], ...d }; } else arr.unshift({ id: uid(), ...d });
    DB.saveAutom(arr); close(); refresh();
  };
}

/* ── Roles & Permissions ── */
function viewRoles() {
  const perms = R.permissions || ['Просмотр', 'Создание', 'Редактирование', 'Удаление', 'Экспорт', 'Настройки'];
  const tiers = { owner: [1, 1, 1, 1, 1, 1], coowner: [1, 1, 1, 1, 1, 1], director: [1, 1, 1, 1, 1, 0], head: [1, 1, 1, 1, 1, 0], manager: [1, 1, 1, 0, 1, 0], sales: [1, 1, 1, 0, 1, 0], operator: [1, 1, 1, 0, 0, 0], marketer: [1, 1, 0, 0, 1, 0], default: [1, 0, 0, 0, 0, 0] };
  const roles = [...new Set(DB.team().map(m => m.role))].filter(r => ROLES[r]);
  const head = `<tr><th>Роль</th>${perms.map(p => `<th>${esc(p)}</th>`).join('')}</tr>`;
  const rows = (roles.length ? roles : ['owner', 'manager', 'operator']).map(r => { const t = tiers[r] || tiers.default; return `<tr><td><span class="badge" style="color:${roleColor(r)}">${esc(roleName(r))}</span></td>${perms.map((p, i) => `<td>${t[i] ? '<span style="color:var(--good)"></span>' : '<span style="color:var(--text3)">—</span>'}</td>`).join('')}</tr>`; }).join('');
  document.getElementById('viewBody').innerHTML = `<div class="eyebrow">Права доступа по ролям</div><div class="table-wrap"><table class="an-table">${head}${rows}</table></div><div class="empty-hint" style="text-align:left;padding:14px 2px">В Pro-версии права жёстко применяются через RLS Supabase. Здесь — матрица для настройки.</div>`;
}

/* ── Knowledge Base ── */
let KB_CAT = '', KB_Q = '';
function viewKnowledge() {
  const arts = DB.kb(); const cats = [...new Set(arts.map(a => a.cat).filter(Boolean))]; KB_CAT = ''; KB_Q = '';
  const render = () => {
    let list = arts;
    if (KB_CAT) list = list.filter(a => a.cat === KB_CAT);
    if (KB_Q) list = list.filter(a => (a.title + ' ' + (a.body || '') + ' ' + (a.cat || '')).toLowerCase().includes(KB_Q));
    document.getElementById('kbGrid').innerHTML = list.map(a => `<div class="kb-card" data-kb="${a.id}"><div class="kb-card__t">${esc(a.title)}</div><div class="kb-card__b">${esc((a.body || '').slice(0, 130))}${(a.body || '').length > 130 ? '…' : ''}</div><div class="list-item__meta">${esc(a.cat || 'Общее')} · ${Math.max(1, Math.round((a.body || '').length / 600))} мин чтения</div></div>`).join('') || '<div class="empty-hint">Ничего не найдено</div>';
    document.querySelectorAll('.kb-card[data-kb]').forEach(el => el.onclick = () => openKbRead(el.dataset.kb));
  };
  document.getElementById('viewBody').innerHTML = `<div class="kb-toolbar"><input class="t-input t-input--search" id="kbSearch" placeholder="Поиск по базе знаний…"><div class="view-chips" style="margin:0"><span class="view-chip is-active" data-kc="">Все</span>${cats.map(c => `<span class="view-chip" data-kc="${escAttr(c)}">${esc(c)}</span>`).join('')}</div></div><div class="kb-grid" id="kbGrid"></div>`;
  render();
  document.getElementById('kbSearch').oninput = e => { KB_Q = e.target.value.toLowerCase().trim(); render(); };
  document.querySelectorAll('.view-chip[data-kc]').forEach(c => c.onclick = () => { KB_CAT = c.dataset.kc; document.querySelectorAll('.view-chip[data-kc]').forEach(x => x.classList.remove('is-active')); c.classList.add('is-active'); render(); });
}
// читалка статьи (раскрытие на весь текст) + переход в редактор
function openKbRead(id) {
  const a = DB.kb().find(x => x.id === id); if (!a) return;
  mount(`<div class="overlay overlay--center" id="ov"><div class="panel panel--modal"><div class="panel__head"><div class="panel__title">${esc(a.title)}</div><button class="icon-btn" id="krClose">${icon('x')}</button></div><div class="panel__body"><div class="list-item__meta" style="margin-bottom:10px">${esc(a.cat || 'Общее')}</div><div class="kb-read__body">${esc(a.body || 'Пусто')}</div><div class="panel__foot"><button class="btn-ghost" id="krEdit">${icon('edit')} Редактировать</button></div></div></div></div>`);
  document.getElementById('krClose').onclick = closeMount; document.getElementById('ov').onclick = e => { if (e.target.id === 'ov') closeMount(); };
  document.getElementById('krEdit').onclick = () => openKb(id);
}
function openKb(id) {
  const arts = DB.kb(), a = id ? arts.find(x => x.id === id) : {};
  mount(`<div class="overlay overlay--center" id="ov"><div class="panel panel--modal"><div class="panel__head"><div class="panel__title">${id ? 'Статья' : 'Новая статья'}</div><button class="icon-btn" id="kClose">${icon('x')}</button></div><form class="panel__body" id="kbForm">
    <div class="f-col"><label class="f-label">Заголовок *</label><input class="t-input t-input--full" id="k_title" value="${esc(a.title || '')}" required></div>
    <div class="f-col"><label class="f-label">Категория</label><input class="t-input t-input--full" id="k_cat" value="${esc(a.cat || '')}" placeholder="Регламент / Скрипт / Инструкция"></div>
    <div class="f-col"><label class="f-label">Текст</label><textarea class="t-input t-textarea" id="k_body" rows="8">${esc(a.body || '')}</textarea></div>
    <div class="panel__foot">${id ? '<button type="button" class="btn-ghost" id="kDel">Удалить</button>' : ''}<button type="button" class="btn-ghost" id="kCancel">Отмена</button><button type="submit" class="btn">Сохранить</button></div></form></div></div>`);
  const close = closeMount; document.getElementById('kClose').onclick = close; document.getElementById('kCancel').onclick = close; document.getElementById('ov').onclick = e => { if (e.target.id === 'ov') close(); };
  if (id) document.getElementById('kDel').onclick = () => { DB.saveKb(DB.kb().filter(x => x.id !== id)); close(); refresh(); };
  document.getElementById('kbForm').onsubmit = e => { e.preventDefault(); const d = { title: document.getElementById('k_title').value.trim(), cat: document.getElementById('k_cat').value.trim(), body: document.getElementById('k_body').value.trim() }; const arr = DB.kb(); if (id) { const i = arr.findIndex(x => x.id === id); arr[i] = { ...arr[i], ...d }; } else arr.unshift({ id: uid(), ...d }); DB.saveKb(arr); close(); refresh(); };
}

/* ── Integrations ── */
function viewIntegrations() {
  const list = R.integrations || [['Telegram', '', 1], ['Email / SMTP', '', 1], ['WhatsApp', '', 0], ['Instagram Direct', '', 0], ['Телефония', '', 0], ['Google Calendar', '', 0], ['1С / Бухгалтерия', '', 0], ['Webhooks / API', '', 1]];
  const cards = list.map(([name, ic, on]) => `<div class="intg-card"><div class="intg-ic">${icon('plug')}</div><div style="flex:1"><div class="team-name">${esc(name)}</div><div class="list-item__meta">${on ? 'подключено' : 'не подключено'}</div></div><span class="pill ${on ? 'pill--good' : ''}">${on ? '' : 'Подключить'}</span></div>`).join('');
  document.getElementById('viewBody').innerHTML = `<div class="eyebrow">Интеграции и каналы</div><div class="intg-grid">${cards}</div>`;
}

/* ── Files ── */
let FILE_CAT = '', FILE_Q = '';
function fileExt(name) { const m = String(name || '').match(/\.([a-z0-9]+)$/i); return m ? m[1].toUpperCase() : 'FILE'; }
function viewFiles() {
  const files = DB.files(); let photos = 0; ENTITIES.forEach(e => { const gf = e.fields.find(f => f.type === 'gallery'); if (gf) DB.recs(e.key).forEach(r => photos += (r[gf.key] || []).length); });
  const cats = [...new Set(files.map(f => f.kind).filter(Boolean))];
  FILE_CAT = ''; FILE_Q = '';
  const render = () => {
    let list = files;
    if (FILE_CAT) list = list.filter(f => f.kind === FILE_CAT);
    if (FILE_Q) list = list.filter(f => (f.name + ' ' + (f.kind || '')).toLowerCase().includes(FILE_Q));
    const cards = list.map(f => `<div class="file-card"><div class="file-card__ic">${icon('file')}</div><div style="flex:1;min-width:0"><div class="file-card__name">${esc(f.name)}</div><div class="file-card__meta">${esc(fileExt(f.name))} · ${esc(f.size || '—')} · ${fmtWhen(f.date)}</div></div>${f.kind ? `<span class="file-cat">${esc(f.kind)}</span>` : ''}</div>`).join('') || '<div class="empty-hint">Ничего не найдено</div>';
    document.getElementById('fileGrid').innerHTML = cards;
  };
  document.getElementById('viewBody').innerHTML = `<div class="kpi-row"><div class="kpi"><div class="kpi__label">Файлов</div><div class="kpi__val num">${files.length}</div></div><div class="kpi"><div class="kpi__label">Фото в карточках</div><div class="kpi__val num">${photos}</div></div><div class="kpi"><div class="kpi__label">Категорий</div><div class="kpi__val num">${cats.length}</div></div></div>
    <div class="file-toolbar"><input class="t-input t-input--search" id="fileSearch" placeholder="Поиск по файлам…"><div class="view-chips" style="margin:0"><span class="view-chip is-active" data-fc="">Все</span>${cats.map(c => `<span class="view-chip" data-fc="${escAttr(c)}">${esc(c)}</span>`).join('')}</div></div>
    <div class="file-grid" id="fileGrid"></div>`;
  render();
  document.getElementById('fileSearch').oninput = e => { FILE_Q = e.target.value.toLowerCase().trim(); render(); };
  document.querySelectorAll('.view-chip[data-fc]').forEach(c => c.onclick = () => { FILE_CAT = c.dataset.fc; document.querySelectorAll('.view-chip[data-fc]').forEach(x => x.classList.remove('is-active')); c.classList.add('is-active'); render(); });
}

/* ── Client Portal (превью) ── */
function viewPortal() {
  const ent = entById('object'), recs = DB.recs(ent.key).filter(r => r.stage === 'won').slice(0, 3);
  const pays = DB.pays().slice(0, 3);
  document.getElementById('viewBody').innerHTML = `<div class="eyebrow">Так клиент видит свой кабинет</div>
    <div class="portal"><div class="portal__head"><b>Личный кабинет клиента</b><span class="pill pill--good">демо-превью</span></div>
    <div class="dash-grid"><div class="bcard"><div class="bcard__head"><span class="bcard__label">Мои объекты</span></div>${recs.map(r => `<div class="list-item"><div class="list-item__name">${esc(primary(r, ent))}</div><div class="list-item__right">${badge(r.stage, ent)}</div></div>`).join('') || '<div class="empty-hint">—</div>'}</div>
    <div class="bcard"><div class="bcard__head"><span class="bcard__label">Мои платежи</span></div>${pays.map(p => `<div class="list-item"><div class="list-item__name">${esc(p.title)}</div><div class="list-item__right"><span class="num">${fmtMoney(p.amount)}</span></div></div>`).join('') || '<div class="empty-hint">—</div>'}</div></div></div>
    <div class="empty-hint" style="text-align:left;padding:14px 2px">В Pro клиент заходит по своей ссылке и видит только свои данные (доступ через RLS).</div>`;
}

/* ── Settings ── */
function viewSettings() {
  const themes = Object.entries(window.THEMES).map(([k, t]) => `<option value="${k}" ${R.theme === k ? 'selected' : ''}>${esc(t.name)}</option>`).join('');
  document.getElementById('viewBody').innerHTML = `<div class="settings-grid">
    <div class="bcard"><div class="bcard__head"><span class="bcard__label">Компания</span></div><div class="f-col"><label class="f-label">Название</label><input class="t-input t-input--full" id="set_brand" value="${esc(R.brand?.name || '')}"></div><button class="btn" id="setSave" style="margin-top:10px">Сохранить</button></div>
    <div class="bcard"><div class="bcard__head"><span class="bcard__label">Тема оформления</span></div><div class="f-col"><label class="f-label">Тема (применяется сразу и сохраняется)</label><select class="t-select t-select--full" id="set_theme">${themes}</select></div><div style="display:flex;gap:8px;margin-top:10px"><button class="btn-ghost" id="setThemeReset">Сбросить к теме по умолчанию</button></div><div class="empty-hint" style="text-align:left">Светлые темы: Clean Light, Arctic Light, Sunset Warm, Mono Brutalist.</div></div>
    <div class="bcard"><div class="bcard__head"><span class="bcard__label">Данные · импорт / экспорт</span></div>
      <div class="f-col"><label class="f-label">Сущность</label><select class="t-select t-select--full" id="ioEnt">${ENTITIES.map(e => `<option value="${e.key}">${esc(e.many)}</option>`).join('')}</select></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><button class="btn-ghost" id="ioExp">Экспорт CSV</button><button class="btn-ghost" id="ioImp">Импорт CSV</button><button class="btn-ghost" id="ioBak">Бэкап (JSON)</button><button class="btn-ghost" id="ioRes">Восстановить</button></div>
      <div class="empty-hint" style="text-align:left">Миграция с Bitrix/amo: выгрузи в CSV там → загрузи сюда.</div></div>
    <div class="bcard"><div class="bcard__head"><span class="bcard__label">Модули</span></div>${R.nav.map(n => `<label class="chk"><input type="checkbox" checked disabled> ${esc(n.label)}</label>`).join('')}</div>
    <div class="bcard bcard--danger"><div class="bcard__head"><span class="bcard__label" style="color:var(--bad)">Опасная зона</span></div><button class="btn-danger" id="setReset">Сбросить все данные</button></div></div>`;
  const io = window.UQ_IO;
  if (io) {
    document.getElementById('ioExp').onclick = () => io.exportCSV(document.getElementById('ioEnt').value);
    document.getElementById('ioImp').onclick = () => io.pickFile(t => { const n = io.importCSV(document.getElementById('ioEnt').value, t); toast('Импортировано записей: ' + n, 'ok'); refresh(); });
    document.getElementById('ioBak').onclick = () => io.exportJSON();
    document.getElementById('ioRes').onclick = () => io.pickFile(t => { if (confirm('Восстановить из бэкапа? Текущие данные перезапишутся.')) { io.importJSON(t); location.reload(); } });
  }
  document.getElementById('set_theme').value = localStorage.getItem(K('theme')) || R.theme;
  document.getElementById('set_theme').onchange = e => setTheme(e.target.value, true);
  document.getElementById('setThemeReset').onclick = () => { localStorage.removeItem(K('theme')); setTheme(R.theme, false); };
  document.getElementById('setSave').onclick = () => { toast('Сохранено', 'ok'); };
  document.getElementById('setReset').onclick = () => { if (confirm('Удалить ВСЕ данные этой CRM?')) { Object.keys(localStorage).filter(k => k.startsWith(R.prefix || 'uq_')).forEach(k => localStorage.removeItem(k)); location.reload(); } };
}

function toast(msg, type, ms) {
  let w = document.getElementById('toastWrap'); if (!w) { w = document.createElement('div'); w.id = 'toastWrap'; w.className = 'toast-wrap'; w.setAttribute('role', 'status'); w.setAttribute('aria-live', 'polite'); document.body.appendChild(w); }
  const el = document.createElement('div'); el.className = 'toast toast--' + (type || 'info'); el.innerHTML = `<span class="toast__dot"></span><span>${esc(msg)}</span>`; w.appendChild(el);
  setTimeout(() => { el.classList.add('toast--out'); setTimeout(() => el.remove(), 320); }, ms || 2600);
}
// a11y: проставить aria-label иконочным кнопкам без подписи (по id-эвристике)
const ICONBTN_LABELS = { searchBtn: 'Поиск и команды', dEdit: 'Редактировать', dDel: 'Удалить', calPrev: 'Назад', calNext: 'Вперёд', menuBtn: 'Меню' };
function labelIconBtns(root) { (root || document).querySelectorAll('.icon-btn:not([aria-label])').forEach(b => { const id = b.id || ''; b.setAttribute('aria-label', ICONBTN_LABELS[id] || (/Close$/.test(id) ? 'Закрыть' : 'Действие')); }); }
function mount(html) { let m = document.getElementById('mountRoot'); if (!m) { m = document.createElement('div'); m.id = 'mountRoot'; document.body.appendChild(m); } m.innerHTML = html; labelIconBtns(m); }
function closeMount() { const m = document.getElementById('mountRoot'); if (m) m.innerHTML = ''; }
function lightbox(src) { const d = document.createElement('div'); d.className = 'lightbox'; d.innerHTML = `<img src="${src}">`; d.onclick = () => d.remove(); document.body.appendChild(d); }
function bindRowClicks() { document.querySelectorAll('#main [data-id][data-ent]').forEach(el => { if (el.closest('.k-card')) return; el.addEventListener('click', () => openDetail(el.dataset.ent, el.dataset.id)); }); }
function notifCount() { let c = DB.pays().filter(p => p.status === 'overdue').length + DB.tasks().filter(t => !t.done && t.due && daysTo(t.due) < 0).length; ENTITIES.forEach(e => { const df = e.fields.find(f => f.type === 'date'); DB.recs(e.key).forEach(r => { if (df && r[df.key] && daysTo(r[df.key]) >= 0 && daysTo(r[df.key]) <= 7 && r.stage !== 'lost') c++; }); }); return c; }
function updateBadges() { const overdue = DB.tasks().filter(t => !t.done && t.due && daysTo(t.due) <= 0).length, nc = notifCount(); R.nav.forEach(n => { const b = document.getElementById('badge-' + n.key); if (!b) return; let v = 0; if (n.type === 'tasks' || n.type === 'calendar') v = overdue; else if (n.type === 'notifications') v = nc; if (v) { b.textContent = v; b.classList.remove('hidden'); } else b.classList.add('hidden'); }); }

/* ── Поиск (контекстный) ── */
function searchScope() { const n = navItem(VIEW), t = n ? n.type : ''; if (t === 'payments' || t === 'finance') return 'payments'; if (t === 'tasks' || t === 'calendar') return 'tasks'; if (t === 'team' || t === 'goals') return 'team'; if (t === 'docs') return 'docs'; if (t === 'records' || t === 'kanban') return n.entity || primEnt.key; return primEnt.key; }
// Команды палитры (навигация + быстрые действия) — показываются всегда
function paletteCommands() {
  const c = [], go = key => () => showView(key);
  R.nav.forEach(n => c.push({ t: 'Перейти: ' + n.label, sub: 'Навигация', ic: 'door', run: go(n.key) }));
  ENTITIES.forEach(e => c.push({ t: 'Добавить: ' + e.one, sub: 'Создать', ic: 'plus', run: () => { const nv = R.nav.find(n => n.entity === e.key) || R.nav.find(n => n.type === 'records'); if (nv) showView(nv.key); openForm(e.key); } }));
  const tnav = R.nav.find(n => n.type === 'tasks'); if (tnav) c.push({ t: 'Новая задача', sub: 'Создать', ic: 'plus', run: go(tnav.key) });
  if (R.nav.find(n => n.type === 'automation')) c.push({ t: 'Проверить сценарии', sub: 'Автоматизация', ic: 'bolt', run: () => runAutomTimers() });
  if (window.UQ_IO) c.push({ t: 'Экспорт всех данных (JSON)', sub: 'Данные', ic: 'file', run: () => window.UQ_IO.exportJSON && window.UQ_IO.exportJSON() });
  Object.entries(window.THEMES).forEach(([k, t]) => c.push({ t: 'Тема: ' + t.name, sub: 'Оформление', ic: 'spark', run: () => setTheme(k, true) }));
  return c;
}
// Поиск по всем данным CRM
function paletteSearch(q) {
  const out = [];
  ENTITIES.forEach(e => DB.recs(e.key).filter(r => (primary(r, e) + ' ' + e.fields.map(f => f.type === 'select' ? display(r, f) : (r[f.key] || '')).join(' ')).toLowerCase().includes(q)).slice(0, 6).forEach(r => out.push({ t: primary(r, e), sub: e.one, ic: 'deal', run: () => openDetail(e.key, r.id) })));
  DB.pays().filter(p => (p.title + ' ' + (p.kind || '')).toLowerCase().includes(q)).slice(0, 5).forEach(p => out.push({ t: p.title, sub: 'Платёж · ' + fmtMoney(p.amount), ic: 'wallet', run: () => openPayment(p.id) }));
  DB.tasks().filter(t => t.title.toLowerCase().includes(q)).slice(0, 5).forEach(t => out.push({ t: t.title, sub: 'Задача · ' + fmtDate(t.due), ic: 'check', run: () => { const nv = R.nav.find(n => n.type === 'tasks') || R.nav.find(n => n.type === 'calendar'); if (nv) showView(nv.key); } }));
  DB.team().filter(m => (m.name + ' ' + roleName(m.role)).toLowerCase().includes(q)).slice(0, 5).forEach(m => out.push({ t: m.name, sub: roleName(m.role), ic: 'user', run: () => openMember(m.id) }));
  DB.docs().filter(d => d.title.toLowerCase().includes(q)).slice(0, 5).forEach(d => out.push({ t: d.title, sub: 'Документ', ic: 'file', run: () => openDoc(d.id) }));
  return out;
}
let PAL = [], PAL_I = 0;
function togglePalette() {
  if (document.getElementById('pal')) { closeMount(); return; }
  mount(`<div class="palette-mask" id="palMask"></div><div class="palette" id="pal" role="dialog" aria-modal="true" aria-label="Командная палитра"><input class="palette__input" id="palIn" placeholder="Поиск по всему + команды…  (стрелки ↑↓, Enter)" aria-label="Поиск и команды"><div class="palette__results" id="palRes" role="listbox"></div></div>`);
  document.getElementById('palMask').onclick = closeMount; const inp = document.getElementById('palIn'); inp.focus();
  const render = () => {
    const q = inp.value.toLowerCase().trim(), res = document.getElementById('palRes');
    const cmds = paletteCommands();
    PAL = q ? [...paletteSearch(q), ...cmds.filter(c => (c.t + ' ' + c.sub).toLowerCase().includes(q))] : cmds.slice(0, 12);
    PAL_I = 0;
    res.innerHTML = PAL.length ? PAL.map((it, i) => `<div class="palette-item${i === 0 ? ' is-active' : ''}" data-i="${i}" role="option"><span class="palette-item__ic">${icon(it.ic)}</span><div class="palette-item__name">${esc(it.t)}</div><div class="palette-item__sub">${esc(it.sub)}</div></div>`).join('') : '<div class="empty-hint">Ничего не найдено</div>';
    res.querySelectorAll('[data-i]').forEach(el => { el.onclick = () => fire(+el.dataset.i); el.onmouseenter = () => setActive(+el.dataset.i); });
  };
  const setActive = i => { PAL_I = i; document.querySelectorAll('#palRes .palette-item').forEach((el, j) => el.classList.toggle('is-active', j === i)); const a = document.querySelector('#palRes .is-active'); if (a) a.scrollIntoView({ block: 'nearest' }); };
  const fire = i => { const it = PAL[i]; if (!it) return; closeMount(); it.run(); };
  inp.oninput = render;
  inp.onkeydown = e => { if (e.key === 'ArrowDown') { e.preventDefault(); setActive(Math.min(PAL_I + 1, PAL.length - 1)); } else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(Math.max(PAL_I - 1, 0)); } else if (e.key === 'Enter') { e.preventDefault(); fire(PAL_I); } };
  render();
}
document.addEventListener('keydown', e => { if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); togglePalette(); } if (e.key === 'Escape') closeMount(); });

/* ── seed ── */
(() => {
  if (localStorage.getItem(K('seeded'))) return;
  ENTITIES.forEach(e => { if (e.seed && !DB.recs(e.key).length) DB.saveRecs(e.key, e.seed); });
  const s = R.seed || {};
  if (Array.isArray(s.records) && !DB.recs(primEnt.key).length) DB.saveRecs(primEnt.key, s.records); // совместимость (одна сущность)
  if (s.tasks) DB.saveTasks(s.tasks); if (s.payments) DB.savePays(s.payments); if (s.team) DB.saveTeam(s.team);
  if (s.docs) DB.saveDocs(s.docs); if (s.finance) DB.saveFin(s.finance);
  if (s.automation) DB.saveAutom(s.automation); if (s.knowledge) DB.saveKb(s.knowledge); if (s.files) DB.saveFiles(s.files);
  if (s.reference) for (const k in s.reference) DB.saveRef(k, s.reference[k]);
  localStorage.setItem(K('seeded'), '1');
})();

/* ── страж памяти ── */
let QUOTA_WARNED = false;
function checkQuota() {
  if (QUOTA_WARNED) return;
  try {
    let bytes = 0; const p = R.prefix || 'uq_';
    Object.keys(localStorage).forEach(key => { if (key.indexOf(p) === 0) bytes += (localStorage.getItem(key) || '').length; });
    if (bytes > 4000000) { QUOTA_WARNED = true; } // демо: тост про память браузера не нужен посетителю
  } catch {}
}

/* ── валидатор рецепта ── */
function validateRecipe() {
  const MODULE_TYPES = ['dashboard', 'records', 'kanban', 'payments', 'tasks', 'team', 'analytics', 'finance', 'goals', 'docs', 'calendar', 'reference', 'activity', 'notifications', 'automation', 'roles', 'knowledge', 'integrations', 'files', 'portal', 'settings', 'catalog', 'overview', 'valuation'];
  const FIELD_TYPES = ['text', 'number', 'money', 'date', 'select', 'textarea', 'computed', 'gallery'];
  const errs = [];
  try {
    if (!Array.isArray(ENTITIES) || !ENTITIES.length) errs.push('Нет ни одной сущности (entities)');
    if (!Array.isArray(R.nav) || !R.nav.length) errs.push('Пустая навигация (nav)');
    if (R.theme && window.THEMES && !window.THEMES[R.theme]) errs.push('Тема «' + R.theme + '» не найдена в themes.js');
    ENTITIES.forEach(e => {
      if (!e.key) errs.push('У сущности нет ключа key: ' + (e.one || e.many || '?'));
      const keys = (e.fields || []).map(x => x.key);
      (e.fields || []).forEach(f => {
        if (f.type && !FIELD_TYPES.includes(f.type)) errs.push('Сущность «' + e.key + '»: неизвестный тип поля «' + f.type + '» у «' + (f.key || '?') + '»');
        if (f.type === 'computed' && f.formula) (f.formula.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || []).forEach(tok => {
          if (!keys.includes(tok) && !['Math', 'round', 'abs', 'min', 'max', 'floor', 'ceil'].includes(tok)) errs.push('Сущность «' + e.key + '»: формула поля «' + f.key + '» ссылается на несуществующее поле «' + tok + '»');
        });
      });
    });
    (R.nav || []).forEach(nv => {
      if (!nv.type || !MODULE_TYPES.includes(nv.type)) errs.push('Раздел «' + (nv.key || nv.label || '?') + '»: неизвестный тип модуля «' + nv.type + '»');
      if (nv.entity && !ENT[nv.entity]) errs.push('Раздел «' + (nv.key || nv.label) + '» ссылается на несуществующую сущность «' + nv.entity + '»');
    });
    const checkMetric = (m, where) => {
      if (m.entity && !ENT[m.entity]) { errs.push(where + ': метрика ссылается на несуществующую сущность «' + m.entity + '»'); return; }
      const e = m.entity ? ENT[m.entity] : primEnt;
      if (m.field && e && !(e.fields || []).some(f => f.key === m.field)) errs.push(where + ': метрика «' + (m.label || m.field) + '» считает по несуществующему полю «' + m.field + '»');
    };
    (R.metrics || []).forEach(m => checkMetric(m, 'metrics'));
    (R.nav || []).forEach(nv => (nv.metrics || []).forEach(m => checkMetric(m, 'раздел ' + (nv.key || nv.label))));
  } catch (e) { errs.push('Сбой валидатора: ' + e.message); }
  return errs;
}
function showRecipeErrors(errs) {
  if (!errs || !errs.length) return;
  errs.forEach(e => console.error('[Uniqore · рецепт] ' + e));
  const bar = document.createElement('div');
  bar.setAttribute('role', 'alert');
  bar.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#7f1d1d;color:#fff;font:13px/1.5 system-ui,sans-serif;padding:10px 16px 12px;box-shadow:0 2px 14px rgba(0,0,0,.45);max-height:42vh;overflow:auto';
  bar.innerHTML = '<b>⚠ Рецепт с ошибками (' + errs.length + '):</b> <span style="float:right;cursor:pointer;font-size:16px" id="recErrX">✕</span><ul style="margin:6px 0 0 18px;padding:0">' + errs.map(e => '<li>' + String(e).replace(/</g, '&lt;') + '</li>').join('') + '</ul>';
  document.body.appendChild(bar);
  const x = document.getElementById('recErrX'); if (x) x.onclick = () => bar.remove();
}

/* ── Уни-агент: плавающий ИИ-помощник, отвечает по реальным данным CRM ── */
function uaAnswer(qRaw) {
  const q = qRaw.toLowerCase();
  const objects = DB.recs('object'), leads = DB.recs('lead'), deals = DB.recs('deal'), agents = DB.recs('agent');
  const fin = DB.fin();
  const now = new Date();
  const sameMonth = (iso, off) => { const d = new Date(iso), t = new Date(now.getFullYear(), now.getMonth() - off, 1); return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth(); };
  const sum = a => a.reduce((x, t) => x + (Number(t.amount) || 0), 0);

  if (/привет|здрав|добр(ый|ое)/.test(q)) return 'Привет! Я Уни — ИИ-помощник «Квартала». Спроси про цены, лидов, сделки или финансы — отвечу по актуальной базе.';

  if (/что (ты )?умеешь|помощь|команды|help/.test(q)) return 'Умею: оценить объект по параметрам, посчитать воронку лидов, назвать топ-агента, показать комиссию и прибыль месяца, сводку по сделкам. Просто спроси, например: «сколько стоит 2-комнатная в Северном Парке?»';

  const complexNames = [...new Set(objects.map(o => o.complex))];
  const mentioned = complexNames.find(c => q.includes(c.toLowerCase()));
  if (/цен|стоит|стоимост|м2|м²|за метр/.test(q)) {
    const pool = mentioned ? objects.filter(o => o.complex === mentioned && o.dealType === 'sale') : objects.filter(o => o.dealType === 'sale');
    if (!pool.length) return 'По продаже пока маловато данных для оценки — загляни в «ИИ-оценка», там можно посчитать по параметрам вручную.';
    const avg = Math.round(pool.reduce((a, o) => a + o.price / o.area, 0) / pool.length);
    return (mentioned ? `В ЖК «${mentioned}» ` : 'По всей базе ') + `средняя цена продажи — ${avg.toLocaleString(LOC)} ₽/м². Для точной оценки конкретного объекта открой раздел «ИИ-оценка» — там модель учтёт ремонт и этаж.`;
  }

  if (/лид|воронк|конверси/.test(q)) {
    const stages = [['new', 'новых'], ['contacted', 'на связи'], ['qualified', 'квалифицированы'], ['viewing', 'на показе'], ['won', 'закрыто сделкой']];
    const parts = stages.map(([k, l]) => `${leads.filter(x => x.stage === k).length} ${l}`).join(', ');
    return `Сейчас в воронке ${leads.length} лидов: ${parts}. Полную картину смотри на Дашборде.`;
  }

  if (/финанс|выручк|комисси|доход|прибыл/.test(q)) {
    const inc = sum(fin.filter(t => t.type === 'income' && sameMonth(t.date, 0)));
    const exp = sum(fin.filter(t => t.type === 'expense' && sameMonth(t.date, 0)));
    return `Комиссия за этот месяц — ${fmtMoney(inc)}, расходы ${fmtMoney(exp)}, прибыль ${fmtMoney(inc - exp)}. Подробный P&L — в разделе «Финансы».`;
  }

  if (/сделк|пайплайн/.test(q)) {
    const open = deals.filter(d => !['won', 'lost'].includes(d.stage));
    const val = open.reduce((a, d) => a + (Number(d.amount) || 0), 0);
    return `В работе ${open.length} сделок на сумму ${fmtMoney(val)}. Закрыто в этом месяце: ${deals.filter(d => d.stage === 'won').length}.`;
  }

  if (/агент|кто лучш|топ/.test(q)) {
    const top = agents.slice().sort((a, b) => b.deals - a.deals)[0];
    return top ? `Лидер — ${top.name}: ${top.deals} закрытых сделок, рейтинг ★${top.rating}. Специализация: ${top.specialty}.` : 'Пока нет данных по агентам.';
  }

  if (/сколько объект|каталог/.test(q)) {
    return `В каталоге ${objects.length} объектов, из них активны ${objects.filter(o => o.stage === 'active').length}. Смотреть можно как сетку или на карте — в разделе «Каталог».`;
  }

  return 'Не совсем понял вопрос. Спроси про цены объектов, воронку лидов, финансы, сделки или агентов — я отвечу по реальным данным базы.';
}
const UA_CHIPS = ['Сколько стоит 2-комнатная?', 'Как дела с лидами?', 'Комиссия за месяц?', 'Кто лучший агент?'];
function uaAppend(role, text, typewrite) {
  const thread = document.getElementById('uaThread'); if (!thread) return;
  const row = document.createElement('div'); row.className = 'ua-msg ua-msg--' + role;
  row.innerHTML = role === 'bot' ? `<span class="ua-msg__ic">${icon('spark')}</span><span class="ua-msg__text"></span>` : `<span class="ua-msg__text">${esc(text)}</span>`;
  thread.appendChild(row); thread.scrollTop = thread.scrollHeight;
  if (role === 'bot' && typewrite) {
    const el = row.querySelector('.ua-msg__text'); let i = 0;
    (function type() { if (i <= text.length) { el.textContent = text.slice(0, i); thread.scrollTop = thread.scrollHeight; i += 3; setTimeout(type, 10); } })();
  } else if (role === 'bot') { row.querySelector('.ua-msg__text').textContent = text; }
}
function uaSend(text) {
  text = (text || '').trim(); if (!text) return;
  uaAppend('user', text);
  const input = document.getElementById('uaInput'); if (input) input.value = '';
  setTimeout(() => uaAppend('bot', uaAnswer(text), true), 350);
}
function mountUniAgent() {
  if (document.getElementById('uaBubble')) return;
  const wrap = document.createElement('div'); wrap.id = 'uaWrap';
  wrap.innerHTML = `
    <button class="ua-bubble" id="uaBubble" aria-label="Уни — ИИ-помощник">${icon('spark')}</button>
    <div class="ua-panel" id="uaPanel" hidden>
      <div class="ua-panel__head"><span class="ua-panel__ava">${icon('spark')}</span><div><div class="ua-panel__name">Уни</div><div class="ua-panel__sub">ИИ-помощник «Квартала»</div></div><button class="icon-btn" id="uaClose" aria-label="Закрыть">${icon('x')}</button></div>
      <div class="ua-thread" id="uaThread"></div>
      <div class="ua-chips" id="uaChips">${UA_CHIPS.map(c => `<button class="ua-chip">${esc(c)}</button>`).join('')}</div>
      <div class="ua-input"><input class="t-input t-input--full" id="uaInput" placeholder="Спроси что-нибудь…"><button class="ua-send" id="uaSendBtn" aria-label="Отправить">${icon('check')}</button></div>
    </div>`;
  document.body.appendChild(wrap);
  const panel = document.getElementById('uaPanel');
  document.getElementById('uaBubble').onclick = () => {
    const opening = panel.hidden; panel.hidden = !panel.hidden;
    if (opening && !panel.dataset.greeted) { panel.dataset.greeted = '1'; uaAppend('bot', 'Привет! Я Уни — спрошу базу «Квартала» и отвечу по делу. Выбери вопрос или напиши свой.', true); }
  };
  document.getElementById('uaClose').onclick = () => { panel.hidden = true; };
  document.getElementById('uaSendBtn').onclick = () => uaSend(document.getElementById('uaInput').value);
  document.getElementById('uaInput').addEventListener('keydown', e => { if (e.key === 'Enter') uaSend(e.target.value); });
  document.getElementById('uaChips').addEventListener('click', e => { const b = e.target.closest('.ua-chip'); if (b) uaSend(b.textContent); });
}

/* ── init ── */
(() => { const sv = localStorage.getItem(K('theme')); if (sv && window.THEMES[sv]) { window.applyTheme(sv); document.body.classList.remove('nav-topbar', 'nav-sidebar'); document.body.classList.add('nav-' + NAVLAYOUT); } })();
showRecipeErrors(validateRecipe());
renderShell(); showView(VIEW);
mountUniAgent();
