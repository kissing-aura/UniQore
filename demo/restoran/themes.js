'use strict';
/* ═══════════════════════════════════════════════════════════════════════
   THEMES — библиотека ВЫРАЗИТЕЛЬНО РАЗНЫХ премиум-дизайнов.
   Уровень Linear / Stripe / Notion / Vercel / Raycast.
   Каждая тема = законченный визуальный характер: палитра, ПАРА шрифтов,
   скругления, плотность, тип навигации (topbar/sidebar), стиль карточек
   (flat/soft/hard), режим (dark/light).

   Полный контракт CSS-переменных (его потребляют premium.css и engine.css):
     Цвета:     --bg --surface --surface2 --surface3 --border --border2
                --text --text2 --text3 --acc --acc-2 --acc-contrast --acc-dim
                --ring --good --warn --bad --grid
     Геометрия: --radius --radius-sm --radius-lg --gap
     Шрифты:    --font-ui --font-head --font-num
     Глубина:   --shadow --shadow-sm --shadow-lg

   ПРАВИЛО УНИКАЛЬНОСТИ (v2): тему МОЖНО переиспользовать у разных клиентов.
   Уникальность даёт не цвет, а РАСКЛАДКА и структура (nav topbar/sidebar,
   порядок блоков, плотность, акценты). sunset-warm — флагман и пойдёт у
   большинства; его тёмная сестра sunset-dusk = тот же характер, иной облик.
   ═══════════════════════════════════════════════════════════════════════ */
window.THEMES = {

  /* 0 ── KRAFT EDITORIAL ────────────────────────────────────────────────
     Тёплый фуд-бренд: кремовая бумага, эспрессо-текст, терракота+шафран+
     олива, крупный serif Fraunces. Аппетитно, «крафтово», НЕ табличка. */
  'kraft': {
    name: 'Kraft Editorial', mode: 'light', nav: 'sidebar', card: 'soft',
    fonts: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700;9..144,800&family=Inter:wght@400;500;600;700&display=swap',
    vars: {
      '--bg': '#f4ecdd', '--surface': '#fffdf7', '--surface2': '#f7efe0', '--surface3': '#ece0cb',
      '--border': 'rgba(74,48,28,0.13)', '--border2': 'rgba(74,48,28,0.24)',
      '--text': '#241a10', '--text2': '#6b5642', '--text3': '#a08a72',
      '--acc': '#d8462a', '--acc-2': '#e79a2b', '--acc-contrast': '#fffdf7', '--acc-dim': 'rgba(216,70,42,0.12)',
      '--ring': 'rgba(216,70,42,0.34)',
      '--good': '#5d8a4a', '--warn': '#d18a2a', '--bad': '#c8402f', '--grid': 'rgba(74,48,28,0.06)',
      '--radius': '16px', '--radius-sm': '10px', '--radius-lg': '26px', '--gap': '18px',
      '--font-ui': "'Inter',-apple-system,system-ui,sans-serif", '--font-head': "'Fraunces',Georgia,serif", '--font-num': "'Inter',sans-serif",
      '--shadow': '0 14px 36px rgba(74,48,28,0.12)', '--shadow-sm': '0 2px 8px rgba(74,48,28,0.08)', '--shadow-lg': '0 30px 70px rgba(74,48,28,0.16)',
    },
  },

  /* 1 ── BLOOMBERG DARK GOLD ───────────────────────────────────────────
     Премиум финтех-терминал. Тёплое золото на угольно-чёрном, моноцифры,
     острая плотная сетка, topbar. Характер: дорогой, серьёзный, "деньги". */
  'bloomberg-dark-gold': {
    name: 'Bloomberg Dark Gold', mode: 'dark', nav: 'topbar', card: 'flat',
    fonts: 'https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600;700&display=swap',
    vars: {
      '--bg': '#070707', '--surface': '#0d0d0e', '--surface2': '#131316', '--surface3': '#1a1a1e',
      '--border': 'rgba(229,181,59,0.12)', '--border2': 'rgba(229,181,59,0.24)',
      '--text': 'rgba(248,246,240,0.95)', '--text2': 'rgba(248,246,240,0.62)', '--text3': 'rgba(248,246,240,0.40)',
      '--acc': '#E8B84B', '--acc-2': '#C8902A', '--acc-contrast': '#0a0a0a', '--acc-dim': 'rgba(232,184,75,0.12)',
      '--ring': 'rgba(232,184,75,0.45)',
      '--good': '#56d98a', '--warn': '#f4a93c', '--bad': '#f0564b', '--grid': 'rgba(255,255,255,0.05)',
      '--radius': '8px', '--radius-sm': '5px', '--radius-lg': '14px', '--gap': '14px',
      '--font-ui': "'Inter',-apple-system,system-ui,sans-serif", '--font-head': "'Sora',sans-serif", '--font-num': "'JetBrains Mono',ui-monospace,monospace",
      '--shadow': '0 8px 28px rgba(0,0,0,0.55)', '--shadow-sm': '0 1px 2px rgba(0,0,0,0.5)', '--shadow-lg': '0 24px 64px rgba(0,0,0,0.65)',
    },
  },

  /* 2 ── MONO BRUTALIST ────────────────────────────────────────────────
     Светлый бруталист. Моно-шрифт, острые углы (radius 0), жёсткие чёрные
     границы, плотная сетка, без теней (только смещённый блок). topbar.
     Характер: техно, честный, инженерный, "no bullshit". */
  'mono-brutalist': {
    name: 'Mono Brutalist', mode: 'light', nav: 'topbar', card: 'hard',
    fonts: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap',
    vars: {
      '--bg': '#f2f1ea', '--surface': '#ffffff', '--surface2': '#eceae0', '--surface3': '#e3e0d4',
      '--border': '#0e0e0c', '--border2': '#0e0e0c',
      '--text': '#0e0e0c', '--text2': '#34332e', '--text3': '#65635a',
      '--acc': '#0e0e0c', '--acc-2': '#3a3a35', '--acc-contrast': '#fcff4d', '--acc-dim': '#e6e4d8',
      '--ring': 'rgba(14,14,12,0.55)',
      '--good': '#0a7a36', '--warn': '#a85b00', '--bad': '#c41d1d', '--grid': 'rgba(14,14,12,0.10)',
      '--radius': '0px', '--radius-sm': '0px', '--radius-lg': '0px', '--gap': '14px',
      '--font-ui': "'IBM Plex Mono',ui-monospace,monospace", '--font-head': "'Space Grotesk',sans-serif", '--font-num': "'IBM Plex Mono',ui-monospace,monospace",
      '--shadow': '4px 4px 0 #0e0e0c', '--shadow-sm': '2px 2px 0 #0e0e0c', '--shadow-lg': '7px 7px 0 #0e0e0c',
    },
  },

  /* 3 ── CLEAN LIGHT ───────────────────────────────────────────────────
     Светлый минимал-SaaS уровня Stripe/Linear light. Прохладный нейтрал,
     благородный индиго-кобальт (не дефолтный #2563eb), мягкие тени,
     скруглённый, sidebar. Характер: чистый, доверие, продукт. */
  'clean-light': {
    name: 'Clean Light', mode: 'light', nav: 'sidebar', card: 'soft',
    fonts: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap',
    vars: {
      '--bg': '#f7f8fa', '--surface': '#ffffff', '--surface2': '#fbfcfe', '--surface3': '#f1f3f7',
      '--border': 'rgba(17,24,39,0.08)', '--border2': 'rgba(17,24,39,0.14)',
      '--text': '#101727', '--text2': '#525a6b', '--text3': '#9aa2b1',
      '--acc': '#4338ca', '--acc-2': '#6d5cf0', '--acc-contrast': '#ffffff', '--acc-dim': 'rgba(67,56,202,0.08)',
      '--ring': 'rgba(67,56,202,0.30)',
      '--good': '#15a05a', '--warn': '#c97a09', '--bad': '#d83a3a', '--grid': 'rgba(17,24,39,0.06)',
      '--radius': '14px', '--radius-sm': '9px', '--radius-lg': '22px', '--gap': '18px',
      '--font-ui': "'Inter',-apple-system,system-ui,sans-serif", '--font-head': "'Plus Jakarta Sans',sans-serif", '--font-num': "'Plus Jakarta Sans',sans-serif",
      '--shadow': '0 1px 2px rgba(17,24,39,0.04), 0 10px 30px rgba(17,24,39,0.07)', '--shadow-sm': '0 1px 2px rgba(17,24,39,0.05)', '--shadow-lg': '0 24px 60px rgba(17,24,39,0.12)',
    },
  },

  /* 4 ── EMERALD CORPORATE ─────────────────────────────────────────────
     Тёмно-изумрудный строгий корпоративный. Серьёзный, серифные заголовки
     (Fraunces), глубокий хвойный фон, благородный нефрит-акцент. sidebar.
     Характер: солидность, учёт/опт/логистика, "взрослый бизнес". */
  'emerald-corporate': {
    name: 'Emerald Corporate', mode: 'dark', nav: 'sidebar', card: 'flat',
    fonts: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap',
    vars: {
      '--bg': '#071310', '--surface': '#0c1d18', '--surface2': '#102822', '--surface3': '#16332b',
      '--border': 'rgba(180,235,210,0.09)', '--border2': 'rgba(180,235,210,0.18)',
      '--text': 'rgba(238,247,243,0.95)', '--text2': 'rgba(238,247,243,0.60)', '--text3': 'rgba(238,247,243,0.40)',
      '--acc': '#2fbd8a', '--acc-2': '#15876a', '--acc-contrast': '#04140d', '--acc-dim': 'rgba(47,189,138,0.12)',
      '--ring': 'rgba(47,189,138,0.40)',
      '--good': '#3fd99a', '--warn': '#e0a445', '--bad': '#ef6d6d', '--grid': 'rgba(180,235,210,0.06)',
      '--radius': '10px', '--radius-sm': '7px', '--radius-lg': '16px', '--gap': '16px',
      '--font-ui': "'Inter',-apple-system,system-ui,sans-serif", '--font-head': "'Fraunces',Georgia,serif", '--font-num': "'Inter',sans-serif",
      '--shadow': '0 10px 34px rgba(0,0,0,0.45)', '--shadow-sm': '0 1px 3px rgba(0,0,0,0.4)', '--shadow-lg': '0 28px 70px rgba(0,0,0,0.6)',
    },
  },

  /* 5 ── MIDNIGHT VIOLET ───────────────────────────────────────────────
     Тёмный современный SaaS. Глубокий indigo/violet с глассами и градиентом
     acc→acc-2, мягкое свечение. Благородный фиалково-пурпурный (не #8b5cf6).
     topbar. Характер: digital/IT/маркетинг, модно, премиум-неон. */
  'midnight-violet': {
    name: 'Midnight Violet', mode: 'dark', nav: 'topbar', card: 'soft',
    fonts: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap',
    vars: {
      '--bg': '#0a0913', '--surface': '#121120', '--surface2': '#19182b', '--surface3': '#221f3a',
      '--border': 'rgba(186,178,255,0.10)', '--border2': 'rgba(186,178,255,0.20)',
      '--text': 'rgba(244,242,255,0.95)', '--text2': 'rgba(244,242,255,0.62)', '--text3': 'rgba(244,242,255,0.42)',
      '--acc': '#9b7bff', '--acc-2': '#e05bd1', '--acc-contrast': '#0c0817', '--acc-dim': 'rgba(155,123,255,0.14)',
      '--ring': 'rgba(155,123,255,0.45)',
      '--good': '#46e0a5', '--warn': '#ffc24d', '--bad': '#ff7a8f', '--grid': 'rgba(186,178,255,0.07)',
      '--radius': '14px', '--radius-sm': '9px', '--radius-lg': '22px', '--gap': '16px',
      '--font-ui': "'Inter',-apple-system,system-ui,sans-serif", '--font-head': "'Space Grotesk',sans-serif", '--font-num': "'Space Mono',ui-monospace,monospace",
      '--shadow': '0 14px 44px rgba(70,30,140,0.30)', '--shadow-sm': '0 2px 8px rgba(70,30,140,0.25)', '--shadow-lg': '0 30px 80px rgba(70,30,140,0.40)',
    },
  },

  /* 6 ── ARCTIC LIGHT ──────────────────────────────────────────────────
     Холодный светлый минимал. Сине-серая нейтраль, много воздуха,
     приглушённый стальной-голубой акцент, тонкие линии. sidebar.
     Характер: спокойный, северный, аналитика/SaaS, "чистый воздух". */
  'arctic-light': {
    name: 'Arctic Light', mode: 'light', nav: 'sidebar', card: 'soft',
    fonts: 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap',
    vars: {
      '--bg': '#eef2f6', '--surface': '#ffffff', '--surface2': '#f6f9fc', '--surface3': '#e8eef4',
      '--border': 'rgba(40,62,86,0.09)', '--border2': 'rgba(40,62,86,0.16)',
      '--text': '#13202e', '--text2': '#4a5b6e', '--text3': '#8a99a9',
      '--acc': '#2d7d9a', '--acc-2': '#52a7c4', '--acc-contrast': '#ffffff', '--acc-dim': 'rgba(45,125,154,0.10)',
      '--ring': 'rgba(45,125,154,0.30)',
      '--good': '#1f9d6b', '--warn': '#c0820c', '--bad': '#d4504e', '--grid': 'rgba(40,62,86,0.06)',
      '--radius': '12px', '--radius-sm': '8px', '--radius-lg': '20px', '--gap': '20px',
      '--font-ui': "'Manrope',-apple-system,system-ui,sans-serif", '--font-head': "'Manrope',sans-serif", '--font-num': "'IBM Plex Mono',ui-monospace,monospace",
      '--shadow': '0 1px 2px rgba(40,62,86,0.04), 0 12px 32px rgba(40,62,86,0.07)', '--shadow-sm': '0 1px 2px rgba(40,62,86,0.05)', '--shadow-lg': '0 26px 64px rgba(40,62,86,0.12)',
    },
  },

  /* 7 ── SUNSET WARM ───────────────────────────────────────────────────
     ФЛАГМАН (любимая Матвея). Тёплый премиум для услуг/бьюти/недвижки.
     Жжёная терракота + медовый персик на тёплом ракушечном фоне (не плоский
     "AI-крем": хроматика уведена в свой оттенок, контраст текста усилен до
     ≥7:1). Серифный дисплейный заголовок Instrument Serif, мягкие скругления.
     sidebar. Характер: уют, тепло, дорогой человеческий сервис. */
  'sunset-warm': {
    name: 'Sunset Warm', mode: 'light', nav: 'sidebar', card: 'soft',
    fonts: 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap',
    vars: {
      '--bg': '#f6e9dc', '--surface': '#fffaf4', '--surface2': '#faeee2', '--surface3': '#f0ddcb',
      '--border': 'rgba(122,68,42,0.14)', '--border2': 'rgba(122,68,42,0.26)',
      '--text': '#2e1c12', '--text2': '#6f5040', '--text3': '#a98c77',
      '--acc': '#cc532f', '--acc-2': '#ec9a5a', '--acc-contrast': '#fffaf4', '--acc-dim': 'rgba(204,83,47,0.13)',
      '--ring': 'rgba(204,83,47,0.34)',
      '--good': '#4f9466', '--warn': '#c87f2e', '--bad': '#c84e46', '--grid': 'rgba(122,68,42,0.07)',
      '--radius': '18px', '--radius-sm': '12px', '--radius-lg': '28px', '--gap': '18px',
      '--font-ui': "'DM Sans',-apple-system,system-ui,sans-serif", '--font-head': "'Instrument Serif',Georgia,serif", '--font-num': "'DM Sans',sans-serif",
      '--shadow': '0 4px 20px rgba(160,98,58,0.15)', '--shadow-sm': '0 1px 3px rgba(160,98,58,0.13)', '--shadow-lg': '0 24px 56px rgba(160,98,58,0.22)',
    },
  },

  /* 7b ── SUNSET DUSK ──────────────────────────────────────────────────
     Тёмная сестра Sunset Warm — тот же тёплый характер, другой облик.
     "Drenched warm dark": глубокий какао-эспрессо фон, тлеющая терракота
     + янтарь, кремовый текст. Позволяет ОДНОЙ душе (тёплый сервис) жить
     в разном дизайне — светлом и вечернем. topbar (раскладка тоже другая).
     Характер: вечерний премиум — ресторан, лаунж, бьюти, недвижка-luxe. */
  'sunset-dusk': {
    name: 'Sunset Dusk', mode: 'dark', nav: 'topbar', card: 'soft',
    fonts: 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap',
    vars: {
      '--bg': '#15100c', '--surface': '#1f1712', '--surface2': '#291e17', '--surface3': '#352720',
      '--border': 'rgba(244,200,160,0.10)', '--border2': 'rgba(244,200,160,0.20)',
      '--text': 'rgba(250,240,231,0.95)', '--text2': 'rgba(250,240,231,0.62)', '--text3': 'rgba(250,240,231,0.40)',
      '--acc': '#e8754a', '--acc-2': '#f0a85e', '--acc-contrast': '#1a120c', '--acc-dim': 'rgba(232,117,74,0.15)',
      '--ring': 'rgba(232,117,74,0.42)',
      '--good': '#5fc185', '--warn': '#e3a84d', '--bad': '#ec6a5e', '--grid': 'rgba(244,200,160,0.06)',
      '--radius': '16px', '--radius-sm': '11px', '--radius-lg': '24px', '--gap': '18px',
      '--font-ui': "'DM Sans',-apple-system,system-ui,sans-serif", '--font-head': "'Instrument Serif',Georgia,serif", '--font-num': "'DM Sans',sans-serif",
      '--shadow': '0 12px 40px rgba(0,0,0,0.5)', '--shadow-sm': '0 1px 3px rgba(0,0,0,0.45)', '--shadow-lg': '0 28px 72px rgba(0,0,0,0.6)',
    },
  },

  /* 8 ── GRAPHITE PRO ──────────────────────────────────────────────────
     Строгий графитовый тёмный. Чистая нейтральная серая шкала (благородная,
     не "грязная") + один сдержанный акцент — пыльно-голубой сталь.
     Плотный, geist-подобная пара, topbar. Характер: Vercel-уровень,
     инструмент профи, минимум цвета — максимум типографики. */
  'graphite-pro': {
    name: 'Graphite Pro', mode: 'dark', nav: 'topbar', card: 'flat',
    fonts: 'https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap',
    vars: {
      '--bg': '#0b0c0e', '--surface': '#131517', '--surface2': '#191c1f', '--surface3': '#222629',
      '--border': 'rgba(255,255,255,0.09)', '--border2': 'rgba(255,255,255,0.16)',
      '--text': 'rgba(237,239,241,0.96)', '--text2': 'rgba(237,239,241,0.58)', '--text3': 'rgba(237,239,241,0.38)',
      '--acc': '#7fa8c9', '--acc-2': '#a9c6dd', '--acc-contrast': '#0b0c0e', '--acc-dim': 'rgba(127,168,201,0.12)',
      '--ring': 'rgba(127,168,201,0.40)',
      '--good': '#4fc78a', '--warn': '#e0a84a', '--bad': '#e8675f', '--grid': 'rgba(255,255,255,0.05)',
      '--radius': '7px', '--radius-sm': '5px', '--radius-lg': '12px', '--gap': '13px',
      '--font-ui': "'Geist',-apple-system,system-ui,sans-serif", '--font-head': "'Geist',sans-serif", '--font-num': "'Geist Mono',ui-monospace,monospace",
      '--shadow': '0 8px 26px rgba(0,0,0,0.5)', '--shadow-sm': '0 1px 2px rgba(0,0,0,0.45)', '--shadow-lg': '0 24px 60px rgba(0,0,0,0.6)',
    },
  },

  /* 9 ── ROYAL INDIGO ──────────────────────────────────────────────────
     Светлая премиум-SaaS. Благородный индиго/сапфир акцент на прохладном
     белом, мягкие тени, скруглённый, sidebar, soft. Заголовок гротеск Sora,
     тело Inter, цифры моно. Характер: продукт, доверие, дорогой софт. */
  'royal-indigo': {
    name: 'Royal Indigo', mode: 'light', nav: 'sidebar', card: 'soft',
    fonts: 'https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap',
    vars: {
      '--bg': '#f5f6fb', '--surface': '#ffffff', '--surface2': '#f9fafe', '--surface3': '#eef0f8',
      '--border': 'rgba(30,33,68,0.08)', '--border2': 'rgba(30,33,68,0.15)',
      '--text': '#161a36', '--text2': '#535873', '--text3': '#9498ad',
      '--acc': '#3b3fae', '--acc-2': '#5b6fe0', '--acc-contrast': '#ffffff', '--acc-dim': 'rgba(59,63,174,0.09)',
      '--ring': 'rgba(59,63,174,0.32)',
      '--good': '#1c9d63', '--warn': '#c47d0c', '--bad': '#d23c4a', '--grid': 'rgba(30,33,68,0.06)',
      '--radius': '14px', '--radius-sm': '9px', '--radius-lg': '22px', '--gap': '18px',
      '--font-ui': "'Inter',-apple-system,system-ui,sans-serif", '--font-head': "'Sora',sans-serif", '--font-num': "'JetBrains Mono',ui-monospace,monospace",
      '--shadow': '0 1px 2px rgba(30,33,68,0.05), 0 12px 32px rgba(30,33,68,0.08)', '--shadow-sm': '0 1px 2px rgba(30,33,68,0.06)', '--shadow-lg': '0 26px 64px rgba(30,33,68,0.14)',
    },
  },

  /* 10 ── COCOA DARK ───────────────────────────────────────────────────
     Тёплая тёмная. Глубокий какао/эспрессо фон, карамельно-бронзовый акцент,
     кремовый текст, topbar, soft. Серифный заголовок Fraunces + санс тело.
     Характер: уютная, дорогая, тёплый вечерний премиум. */
  'cocoa-dark': {
    name: 'Cocoa Dark', mode: 'dark', nav: 'topbar', card: 'soft',
    fonts: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Mulish:wght@400;500;600;700&display=swap',
    vars: {
      '--bg': '#17110d', '--surface': '#221912', '--surface2': '#2c2018', '--surface3': '#382a20',
      '--border': 'rgba(226,189,150,0.10)', '--border2': 'rgba(226,189,150,0.20)',
      '--text': 'rgba(247,237,225,0.95)', '--text2': 'rgba(247,237,225,0.62)', '--text3': 'rgba(247,237,225,0.40)',
      '--acc': '#cf9a52', '--acc-2': '#e0b878', '--acc-contrast': '#1a120b', '--acc-dim': 'rgba(207,154,82,0.14)',
      '--ring': 'rgba(207,154,82,0.42)',
      '--good': '#62bf86', '--warn': '#e2a64c', '--bad': '#e57063', '--grid': 'rgba(226,189,150,0.06)',
      '--radius': '15px', '--radius-sm': '10px', '--radius-lg': '24px', '--gap': '17px',
      '--font-ui': "'Mulish',-apple-system,system-ui,sans-serif", '--font-head': "'Fraunces',Georgia,serif", '--font-num': "'Mulish',sans-serif",
      '--shadow': '0 12px 38px rgba(0,0,0,0.5)', '--shadow-sm': '0 1px 3px rgba(0,0,0,0.45)', '--shadow-lg': '0 28px 70px rgba(0,0,0,0.6)',
    },
  },

  /* 11 ── OCEAN TEAL ───────────────────────────────────────────────────
     Тёмная сине-зелёная (морская глубина). Тёмно-петролевый фон,
     бирюзово-аквамариновый акцент, sidebar, flat, плотная сетка.
     Geist/Manrope. Характер: современная, спокойная, аналитика/IT. */
  'ocean-teal': {
    name: 'Ocean Teal', mode: 'dark', nav: 'sidebar', card: 'flat',
    fonts: 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Geist+Mono:wght@400;500;600&display=swap',
    vars: {
      '--bg': '#06151a', '--surface': '#0b2027', '--surface2': '#0f2a33', '--surface3': '#163841',
      '--border': 'rgba(160,232,232,0.09)', '--border2': 'rgba(160,232,232,0.18)',
      '--text': 'rgba(232,247,247,0.95)', '--text2': 'rgba(232,247,247,0.60)', '--text3': 'rgba(232,247,247,0.40)',
      '--acc': '#33c4bd', '--acc-2': '#5fe0c8', '--acc-contrast': '#04141a', '--acc-dim': 'rgba(51,196,189,0.13)',
      '--ring': 'rgba(51,196,189,0.40)',
      '--good': '#3fd9a0', '--warn': '#e0aa48', '--bad': '#ef6f6f', '--grid': 'rgba(160,232,232,0.06)',
      '--radius': '9px', '--radius-sm': '6px', '--radius-lg': '14px', '--gap': '13px',
      '--font-ui': "'Manrope',-apple-system,system-ui,sans-serif", '--font-head': "'Manrope',sans-serif", '--font-num': "'Geist Mono',ui-monospace,monospace",
      '--shadow': '0 10px 32px rgba(0,0,0,0.48)', '--shadow-sm': '0 1px 3px rgba(0,0,0,0.42)', '--shadow-lg': '0 26px 66px rgba(0,0,0,0.58)',
    },
  },

  /* 12 ── ROSE QUARTZ ──────────────────────────────────────────────────
     Светлая тёплая премиум-бьюти. Мягкий розово-кварцевый/пудровый фон
     (НЕ кислотный — увод в дымчатый розе), глубокий вишнёво-розовый акцент,
     sidebar, soft, скруглённая. Серифный дисплейный заголовок Fraunces +
     санс тело Manrope. Характер: салон, бьюти, дорогой женский сервис. */
  'rose-quartz': {
    name: 'Rose Quartz', mode: 'light', nav: 'sidebar', card: 'soft',
    fonts: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Manrope:wght@400;500;600;700;800&display=swap',
    vars: {
      '--bg': '#f7ebee', '--surface': '#fffafb', '--surface2': '#fbeef1', '--surface3': '#f2dde2',
      '--border': 'rgba(110,40,60,0.13)', '--border2': 'rgba(110,40,60,0.24)',
      '--text': '#2c121b', '--text2': '#6b4451', '--text3': '#a47e89',
      '--acc': '#b03a5b', '--acc-2': '#d77793', '--acc-contrast': '#fffafb', '--acc-dim': 'rgba(176,58,91,0.12)',
      '--ring': 'rgba(176,58,91,0.34)',
      '--good': '#4f9466', '--warn': '#c07f2e', '--bad': '#c8454e', '--grid': 'rgba(110,40,60,0.07)',
      '--radius': '18px', '--radius-sm': '12px', '--radius-lg': '28px', '--gap': '18px',
      '--font-ui': "'Manrope',-apple-system,system-ui,sans-serif", '--font-head': "'Fraunces',Georgia,serif", '--font-num': "'Manrope',sans-serif",
      '--shadow': '0 4px 20px rgba(120,50,70,0.13)', '--shadow-sm': '0 1px 3px rgba(120,50,70,0.11)', '--shadow-lg': '0 24px 56px rgba(120,50,70,0.20)',
    },
  },

  /* 13 ── NORDIC FROST ─────────────────────────────────────────────────
     Светлая прохладная скандинавская. Почти белый с лёгким голубым подтоном,
     стальной сине-серый акцент, topbar, flat, плотная сетка, минимализм.
     Manrope тело/заголовок + IBM Plex Mono цифры. Характер: чистый,
     северный, спокойный, инструмент/аналитика «ничего лишнего». */
  'nordic-frost': {
    name: 'Nordic Frost', mode: 'light', nav: 'topbar', card: 'flat',
    fonts: 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap',
    vars: {
      '--bg': '#eef2f7', '--surface': '#fbfdff', '--surface2': '#f3f7fb', '--surface3': '#e6edf4',
      '--border': 'rgba(34,52,74,0.10)', '--border2': 'rgba(34,52,74,0.18)',
      '--text': '#16222f', '--text2': '#475567', '--text3': '#8693a2',
      '--acc': '#3f6588', '--acc-2': '#6c90b3', '--acc-contrast': '#fbfdff', '--acc-dim': 'rgba(63,101,136,0.10)',
      '--ring': 'rgba(63,101,136,0.32)',
      '--good': '#1f9d6b', '--warn': '#bf800c', '--bad': '#cf4a4a', '--grid': 'rgba(34,52,74,0.06)',
      '--radius': '8px', '--radius-sm': '5px', '--radius-lg': '13px', '--gap': '13px',
      '--font-ui': "'Manrope',-apple-system,system-ui,sans-serif", '--font-head': "'Manrope',sans-serif", '--font-num': "'IBM Plex Mono',ui-monospace,monospace",
      '--shadow': '0 1px 2px rgba(34,52,74,0.05), 0 8px 24px rgba(34,52,74,0.06)', '--shadow-sm': '0 1px 2px rgba(34,52,74,0.06)', '--shadow-lg': '0 22px 54px rgba(34,52,74,0.11)',
    },
  },

};

// Применение темы к документу. Вызывается движком до рендера.
window.applyTheme = function (key) {
  const t = window.THEMES[key] || window.THEMES['bloomberg-dark-gold'];
  const root = document.documentElement;
  Object.entries(t.vars).forEach(([k, v]) => root.style.setProperty(k, v));
  document.body.className = `mode-${t.mode} nav-${t.nav} card-${t.card}`;
  if (t.fonts) {
    let l = document.getElementById('themeFonts');
    if (!l) { l = document.createElement('link'); l.id = 'themeFonts'; l.rel = 'stylesheet'; document.head.appendChild(l); }
    if (l.href !== t.fonts) l.href = t.fonts;
  }
  const meta = document.querySelector('meta[name=theme-color]');
  if (meta) meta.content = t.vars['--bg'];
  return t;
};
