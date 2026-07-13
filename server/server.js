'use strict';
/**
 * Uniqore lead API — zero-dependency Node HTTP server.
 * Stores leads in an atomic JSON file outside the web root.
 *
 *   POST /api/leads          public  — site form creates a lead (rate-limited)
 *   GET  /api/leads?key=KEY  private — CRM reads all leads (key required)
 *   GET  /api/health         public  — liveness probe
 *
 * Config via env: PORT, DATA_DIR, API_KEY, TG_TOKEN, TG_CHAT, UQ_SERVICE_EMAIL, UQ_SERVICE_PASSWORD
 *
 * Мост в Uniqore Command V2 (2026-07-14): каждый новый лид ТАКЖЕ пытается уйти в Supabase
 * (uq2_store.data.deals) как новая сделка в Пайплайне — обычными REST-запросами (fetch),
 * без @supabase/supabase-js, чтобы не тащить зависимость на сервер, где некому её ставить.
 * Без UQ_SERVICE_EMAIL/UQ_SERVICE_PASSWORD в env — просто тихо пропускается (см. pushLeadToCommandV2).
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 4000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'leads.json');
const API_KEY = process.env.API_KEY || '';
const TG_TOKEN = process.env.TG_TOKEN || '';
const TG_CHAT = process.env.TG_CHAT || '';

// ── Uniqore Command V2 (Supabase) — тот же проект, что и CRM/бот ──────────
const CMD_SUPABASE_URL = 'https://wbxuwxvdovchtsodznfp.supabase.co';
const CMD_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndieHV3eHZkb3ZjaHRzb2R6bmZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NjY1MTAsImV4cCI6MjA5ODI0MjUxMH0.w1_aryP6pMM3Baj_H76tV5LGV8JiBG2Gd67r6Gw3Jq8';
const CMD_SERVICE_EMAIL = process.env.UQ_SERVICE_EMAIL || '';
const CMD_SERVICE_PASSWORD = process.env.UQ_SERVICE_PASSWORD || '';

fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');

// ── Storage (atomic, serialized writes) ──────────────────────────────────
function readLeads() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8') || '[]'); }
  catch { return []; }
}
let writing = Promise.resolve();
function writeLeads(arr) {
  writing = writing.then(() => new Promise((resolve) => {
    const tmp = DATA_FILE + '.tmp';
    fs.writeFile(tmp, JSON.stringify(arr, null, 2), (err) => {
      if (!err) { try { fs.renameSync(tmp, DATA_FILE); } catch {} }
      resolve();
    });
  }));
  return writing;
}

// ── Helpers ──────────────────────────────────────────────────────────────
function uid() { return Date.now().toString(36) + crypto.randomBytes(3).toString('hex'); }
function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function json(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}

// Per-IP rate limit: max 5 submissions / minute
const hits = new Map();
function rateOk(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter(t => now - t < 60000);
  if (arr.length >= 5) { hits.set(ip, arr); return false; }
  arr.push(now); hits.set(ip, arr); return true;
}

async function sendTelegram(lead) {
  if (!TG_TOKEN || !TG_CHAT) return;
  const time = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Minsk' });
  const text = [
    '🔥 <b>Новая заявка — Uniqore</b>',
    '─────────────────────',
    `👤 <b>${esc(lead.name)}</b>`,
    `🏢 ${esc(lead.company || 'не указан')}`,
    `📱 ${esc(lead.contact)}`,
    lead.notes ? `\n📋 <i>${esc(lead.notes)}</i>` : '',
    '─────────────────────',
    `🕐 ${time}`,
    '🔗 Лид добавлен в CRM автоматически',
  ].filter(Boolean).join('\n');
  try {
    await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TG_CHAT, text, parse_mode: 'HTML', disable_web_page_preview: true }),
    });
  } catch {}
}

// Авторизуется свежим сервисным логином на каждый лид (не кэшируем токен — их мало и редко,
// проще не думать про истечение сессии). Без UQ_SERVICE_EMAIL/PASSWORD — тихо возвращает null.
async function commandV2Auth() {
  if (!CMD_SERVICE_EMAIL || !CMD_SERVICE_PASSWORD) return null;
  try {
    const res = await fetch(`${CMD_SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: CMD_SUPABASE_ANON_KEY },
      body: JSON.stringify({ email: CMD_SERVICE_EMAIL, password: CMD_SERVICE_PASSWORD }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.access_token || null;
  } catch { return null; }
}

// Кладёт лид в Пайплайн Uniqore Command V2 как новую сделку (stage='lead'). Best-effort:
// любая ошибка/отсутствие настройки — просто пропускаем, локальный JSON-файл уже сохранил лид.
async function pushLeadToCommandV2(lead) {
  const token = await commandV2Auth();
  if (!token) return false;
  try {
    const headers = {
      apikey: CMD_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    const getRes = await fetch(`${CMD_SUPABASE_URL}/rest/v1/uq2_store?id=eq.main&select=data`, { headers });
    if (!getRes.ok) return false;
    const rows = await getRes.json();
    const store = (rows[0] && rows[0].data) || {};
    if (!Array.isArray(store.deals)) store.deals = [];
    store.deals.unshift({
      id: 'd' + Date.now(),
      client: lead.company || lead.name,
      niche: '—',
      stage: 'lead',
      value: 0,
      manager: '—',
      prob: 15,
      next: 'Связаться и уточнить детали',
      last: 'сегодня',
      close: '—',
      source: 'сайт',
      contact: lead.contact,
      notes: lead.notes || '',
    });
    const patchRes = await fetch(`${CMD_SUPABASE_URL}/rest/v1/uq2_store?id=eq.main`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ data: store, updated_at: new Date().toISOString() }),
    });
    return patchRes.ok;
  } catch { return false; }
}

// ── Server ───────────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://localhost');
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress;

  // POST /api/leads — public, from the site form
  if (req.method === 'POST' && u.pathname === '/api/leads') {
    if (!rateOk(ip)) return json(res, 429, { ok: false, error: 'rate_limit' });
    let body = '';
    req.on('data', (d) => { body += d; if (body.length > 10000) req.destroy(); });
    req.on('end', async () => {
      let d; try { d = JSON.parse(body || '{}'); } catch { return json(res, 400, { ok: false }); }
      const name = String(d.name || '').trim().slice(0, 120);
      const contact = String(d.contact || '').trim().slice(0, 120);
      if (!name || !contact) return json(res, 400, { ok: false, error: 'missing_fields' });
      if (d.website) return json(res, 200, { ok: true }); // honeypot — silently drop bots
      const now = new Date().toISOString();
      const lead = {
        id: uid(),
        name,
        contact,
        company: String(d.business || d.company || '').trim().slice(0, 160),
        service: 'other',
        source: 'site',
        stage: 'new',
        priority: 'warm',
        budget: 0,
        notes: String(d.task || d.notes || '').trim().slice(0, 2000),
        tags: 'сайт',
        nextAction: 'Связаться и уточнить детали',
        nextActionDate: now.slice(0, 10),
        createdAt: now,
        updatedAt: now,
        activity: [{ text: 'Заявка с сайта', date: now }],
      };
      const arr = readLeads();
      arr.unshift(lead);
      await writeLeads(arr);
      sendTelegram(lead); // fire-and-forget
      pushLeadToCommandV2(lead); // fire-and-forget — мост в Пайплайн V2, best-effort
      return json(res, 200, { ok: true, id: lead.id });
    });
    return;
  }

  // GET /api/leads?key=KEY — private, CRM reads
  if (req.method === 'GET' && u.pathname === '/api/leads') {
    if (!API_KEY || u.searchParams.get('key') !== API_KEY) return json(res, 401, { ok: false });
    return json(res, 200, { ok: true, leads: readLeads() });
  }

  if (req.method === 'GET' && u.pathname === '/api/health') return json(res, 200, { ok: true });

  return json(res, 404, { ok: false });
});

server.listen(PORT, '127.0.0.1', () => console.log(`uniqore-api listening on 127.0.0.1:${PORT}`));
