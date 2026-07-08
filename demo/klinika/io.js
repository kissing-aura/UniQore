'use strict';
/* ═══════════════════════════════════════════════════════════════════════
   Uniqore factory-v2 — IO модуль. Импорт/экспорт данных (CSV + JSON-бэкап).
   Подключается ПОСЛЕ engine.js. Использует window.RECIPE (R.prefix, R.entities).
   Вешает window.UQ_IO. Чистый JS, без зависимостей.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  var R = window.RECIPE || {};
  var PREFIX = R.prefix || 'uq_';
  var BOM = '﻿';

  /* ── сущности (как в engine.js) ── */
  function entities() {
    return (R.entities && R.entities.length) ? R.entities : (R.entity ? [R.entity] : []);
  }
  function entByKey(ek) {
    var list = entities();
    for (var i = 0; i < list.length; i++) if (list[i].key === ek) return list[i];
    return list[0] || null;
  }

  /* ── storage ── */
  function recsKey(ek) { return PREFIX + 'recs_' + ek; }
  function readRecs(ek) {
    try { return JSON.parse(localStorage.getItem(recsKey(ek)) || '[]') || []; }
    catch (e) { return []; }
  }
  function writeRecs(ek, arr) { localStorage.setItem(recsKey(ek), JSON.stringify(arr)); }

  /* ── колонки сущности для CSV (computed пропускаем как пустые, gallery → число) ── */
  function csvFields(ent) {
    var fields = (ent && ent.fields) || [];
    var out = [];
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i];
      if (f.type === 'computed') continue; // computed — считаем пустым → пропускаем колонку
      out.push(f);
    }
    return out;
  }

  /* ── значение поля → строка для CSV ── */
  function cellValue(rec, f) {
    var v = rec[f.key];
    if (f.type === 'gallery') {
      return Array.isArray(v) ? String(v.length) : (v ? '1' : '0');
    }
    if (v == null) return '';
    if (typeof v === 'object') return JSON.stringify(v);
    return String(v);
  }

  /* ── экранирование одной ячейки (RFC4180) ── */
  function escCell(s, sep) {
    s = (s == null) ? '' : String(s);
    if (s.indexOf('"') !== -1 || s.indexOf(sep) !== -1 || s.indexOf('\n') !== -1 || s.indexOf('\r') !== -1) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  }

  /* ═══════════ EXPORT CSV ═══════════ */
  function exportCSV(entityKey) {
    var ent = entByKey(entityKey);
    if (!ent) return false;
    var ek = ent.key;
    var sep = ';';
    var fields = csvFields(ent);
    var hasStage = !!(ent.stages && ent.stages.length);

    // шапка: label полей + системный stage
    var header = [];
    for (var i = 0; i < fields.length; i++) header.push(escCell(fields[i].label || fields[i].key, sep));
    if (hasStage) header.push(escCell('Статус', sep));

    var recs = readRecs(ek);
    var lines = [header.join(sep)];
    for (var r = 0; r < recs.length; r++) {
      var rec = recs[r];
      var row = [];
      for (var c = 0; c < fields.length; c++) row.push(escCell(cellValue(rec, fields[c]), sep));
      if (hasStage) row.push(escCell(rec.stage == null ? '' : rec.stage, sep));
      lines.push(row.join(sep));
    }

    var csv = BOM + lines.join('\r\n');
    download(ek + '.csv', csv, 'text/csv;charset=utf-8');
    return recs.length;
  }

  /* ═══════════ CSV PARSER (учитывает кавычки, переносы, авто-сепаратор) ═══════════ */
  function detectSep(text) {
    // первая строка вне кавычек: считаем ; и ,
    var semi = 0, comma = 0, q = false;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (ch === '"') { q = !q; continue; }
      if (q) continue;
      if (ch === '\n' || ch === '\r') break;
      if (ch === ';') semi++;
      else if (ch === ',') comma++;
    }
    return semi >= comma ? ';' : ',';
  }

  function parseCSV(text, sep) {
    if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1); // strip BOM
    sep = sep || detectSep(text);
    var rows = [], row = [], cell = '', q = false;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (q) {
        if (ch === '"') {
          if (text[i + 1] === '"') { cell += '"'; i++; }
          else q = false;
        } else cell += ch;
      } else {
        if (ch === '"') q = true;
        else if (ch === sep) { row.push(cell); cell = ''; }
        else if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
        else if (ch === '\r') { /* CRLF/CR: завершаем строку, \n пропустится */
          row.push(cell); rows.push(row); row = []; cell = '';
          if (text[i + 1] === '\n') i++;
        } else cell += ch;
      }
    }
    // хвост
    if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
    return rows;
  }

  /* ═══════════ IMPORT CSV ═══════════ */
  function importCSV(entityKey, text) {
    var ent = entByKey(entityKey);
    if (!ent || !text) return 0;
    var ek = ent.key;
    var rows = parseCSV(text);
    if (!rows.length) return 0;

    var head = rows[0].map(function (h) { return String(h).trim(); });
    var fields = (ent.fields || []);

    // сопоставление колонок: индекс → {key, type} или системное stage
    var map = [];
    for (var c = 0; c < head.length; c++) {
      var h = head[c], lower = h.toLowerCase();
      var matched = null;
      for (var fi = 0; fi < fields.length; fi++) {
        var f = fields[fi];
        if (f.type === 'computed') continue;
        var lbl = (f.label || '').toLowerCase();
        var key = (f.key || '').toLowerCase();
        if (lbl === lower || key === lower) { matched = { key: f.key, type: f.type }; break; }
      }
      if (!matched && (lower === 'stage' || lower === 'статус' || lower === 'status')) {
        matched = { key: 'stage', type: 'stage', system: true };
      }
      map.push(matched);
    }

    var existing = readRecs(ek);
    var count = 0;
    for (var r = 1; r < rows.length; r++) {
      var cells = rows[r];
      // пустая строка
      var nonEmpty = false;
      for (var z = 0; z < cells.length; z++) if (String(cells[z]).trim() !== '') { nonEmpty = true; break; }
      if (!nonEmpty) continue;

      var rec = {
        id: 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
        createdAt: new Date().toISOString()
      };
      var anyField = false;
      for (var ci = 0; ci < map.length; ci++) {
        var m = map[ci];
        if (!m) continue;
        var raw = cells[ci];
        if (raw == null) continue;
        raw = String(raw).trim();
        if (raw === '') continue;
        if (m.type === 'number' || m.type === 'money') {
          var num = parseFloat(raw.replace(/\s/g, '').replace(',', '.'));
          rec[m.key] = isNaN(num) ? raw : num;
        } else {
          rec[m.key] = raw;
        }
        if (!m.system) anyField = true;
      }
      if (!anyField && !rec.stage) continue; // невалидная строка — ни одного поля
      existing.push(rec);
      count++;
    }

    if (count) writeRecs(ek, existing);
    return count;
  }

  /* ═══════════ JSON BACKUP (все ключи с префиксом) ═══════════ */
  function exportJSON() {
    var dump = {};
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k && k.indexOf(PREFIX) === 0) dump[k] = localStorage.getItem(k);
    }
    var json = JSON.stringify(dump, null, 2);
    download('uniqore-backup.json', json, 'application/json');
    return dump;
  }

  function importJSON(text) {
    if (!text) return 0;
    var obj;
    try { obj = JSON.parse(text); } catch (e) { return 0; }
    if (!obj || typeof obj !== 'object') return 0;
    var n = 0;
    for (var k in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
      if (k.indexOf(PREFIX) !== 0) continue; // только наши ключи
      var v = obj[k];
      localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
      n++;
    }
    return n;
  }

  /* ═══════════ ПОМОЩНИКИ ═══════════ */
  function download(filename, content, mime) {
    var blob = new Blob([content], { type: mime || 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function pickFile(cb) {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.json,.txt,text/csv,application/json';
    input.style.display = 'none';
    input.onchange = function () {
      var file = input.files && input.files[0];
      if (!file) { cleanup(); return; }
      var reader = new FileReader();
      reader.onload = function () {
        cleanup();
        if (typeof cb === 'function') cb(String(reader.result || ''), file.name);
      };
      reader.onerror = function () { cleanup(); };
      reader.readAsText(file);
    };
    function cleanup() { if (input.parentNode) input.parentNode.removeChild(input); }
    document.body.appendChild(input);
    input.click();
  }

  /* ── публичный API ── */
  window.UQ_IO = {
    exportCSV: exportCSV,
    importCSV: importCSV,
    exportJSON: exportJSON,
    importJSON: importJSON,
    pickFile: pickFile,
    parseCSV: parseCSV // утилита (на случай предпросмотра)
  };
})();
