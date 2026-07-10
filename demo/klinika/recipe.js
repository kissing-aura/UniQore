'use strict';
/* РЕЦЕПТ: Частная клиника. Тема: clean-light (светлая).
   Сущности: Пациент, Приём (запись), Счёт, Врач (через team).
   Воронка: Новая → Подтверждена → Пришёл → Услуга оказана → Оплата → Отмена.
   Валюта: ₽. Locale: ru-RU. Prefix: clinC7_ */
(() => {
  const ds = o => new Date(Date.now() + o * 86400000).toISOString().slice(0, 10);
  const dt = o => new Date(Date.now() + o * 86400000).toISOString();
  const monthAgo = m => { const d = new Date(); d.setMonth(d.getMonth() - m); d.setDate(10); return d.toISOString().slice(0, 10); };

  // ── Пациенты (16) ──
  const PATIENTS_RAW = [
    ['Алексей Морозов',      '+7 916 211-44-55', '1984-03-12', 'Острая боль, зуб 2.6 — подозрение на кариес', 'Наличные'],
    ['Светлана Ковалёва',    '+7 903 500-77-88', '1991-07-24', 'Кровоточивость дёсен, гингивит', 'Карта'],
    ['Дмитрий Федотов',      '+7 925 311-99-00', '1978-11-05', 'Имплантация, отсутствует 3.6', 'Карта'],
    ['Мария Зайцева',        '@mzaitseva',        '2001-02-18', 'Брекеты, скученность зубов', 'Карта'],
    ['Ирина Белова',         '+7 999 421-33-66', '1969-09-30', 'Профгигиена Air Flow, налёт', 'Наличные'],
    ['Николай Орлов',        '+7 912 600-14-23', '1988-04-07', 'Кариес 1.4, чувствительность', 'Карта'],
    ['Екатерина Соколова',   '+7 977 840-22-11', '1995-12-01', 'Осмотр, план лечения', 'Карта'],
    ['Павел Громов',         '+7 985 130-55-44', '1973-06-19', 'Удаление зуба мудрости 4.8', 'Наличные'],
    ['Анна Лебедева',        '+7 916 750-33-22', '2003-08-14', 'Отбеливание ZOOM', 'Карта'],
    ['Сергей Тимофеев',      '+7 903 221-88-77', '1980-01-27', 'Коронка, разрушен 2.7', 'Рассрочка'],
    ['Ольга Кузнецова',      '@olgakuznetsova',   '1993-05-03', 'Пломба световая, кариес 3.5', 'Карта'],
    ['Виктор Симонов',       '+7 925 411-00-55', '1967-10-22', 'Пародонтит, подвижность зубов', 'Рассрочка'],
    ['Татьяна Романова',     '+7 999 822-44-33', '1985-03-15', 'Виниры на фронтальную группу', 'Карта'],
    ['Андрей Захаров',       '+7 912 300-66-77', '1990-07-09', 'Скол зуба 1.1, реставрация', 'Наличные'],
    ['Юлия Никитина',        '+7 977 560-11-99', '1998-11-28', 'Отбеливание + гигиена', 'Карта'],
    ['Игорь Воронов',        '+7 985 770-22-44', '1963-04-17', 'Имплант + коронка, зуб 4.6', 'Рассрочка'],
  ];
  const patients = PATIENTS_RAW.map((d, i) => ({
    id: 'p' + (i + 1),
    name: d[0], phone: d[1], dob: d[2], complaints: d[3], payMethod: d[4],
    source: ['Реклама в Яндекс', 'Рекомендация', 'Instagram', 'Сайт клиники', 'Повторно'][i % 5],
    stage: ['new', 'active', 'active', 'active', 'discharged', 'active', 'active', 'active', 'active', 'active', 'new', 'active', 'active', 'new', 'discharged', 'active'][i],
    notes: '',
    createdAt: dt(-(i * 6 + 3)),
    activity: [{ text: 'Пациент зарегистрирован', date: dt(-(i * 6 + 3)) }],
  }));

  // ── Записи/Приёмы (18) ──
  const APPOINTMENTS_RAW = [
    ['Лечение кариеса 2.6 — Алексей Морозов',        'p1',  'Петрова А.В.',      '2024-07-01', 4500,  'confirmed'],
    ['Профгигиена Air Flow — Светлана Ковалёва',     'p2',  'Осипова Е.Н.',      '2024-07-02', 5500,  'done'],
    ['Имплантация (этап 1) — Дмитрий Федотов',       'p3',  'Рогов Д.И.',        '2024-07-03', 38000, 'paid'],
    ['Брекет-система, установка — Мария Зайцева',    'p4',  'Осипова Е.Н.',      '2024-07-04', 45000, 'confirmed'],
    ['Профгигиена + фторирование — Ирина Белова',    'p5',  'Осипова Е.Н.',      '2024-07-05', 6200,  'paid'],
    ['ИИ-диагностика снимка — Николай Орлов',        'p6',  'Рогов Д.И.',        '2024-07-06', 1500,  'paid'],
    ['Осмотр + план лечения — Екатерина Соколова',   'p7',  'Петрова А.В.',      '2024-07-08', 1000,  'new'],
    ['Удаление зуба мудрости 4.8 — Павел Громов',    'p8',  'Рогов Д.И.',        '2024-07-09', 8500,  'confirmed'],
    ['Отбеливание ZOOM — Анна Лебедева',             'p9',  'Осипова Е.Н.',      '2024-07-10', 22000, 'done'],
    ['Коронка металлокерамика 2.7 — Сергей Тимофеев','p10', 'Климов И.С.',       '2024-07-11', 18000, 'paid'],
    ['Пломба световая 3.5 — Ольга Кузнецова',        'p11', 'Петрова А.В.',      '2024-07-12', 4800,  'confirmed'],
    ['Лечение пародонтита — Виктор Симонов',         'p12', 'Петрова А.В.',      '2024-07-13', 7400,  'paid'],
    ['Виниры, консультация — Татьяна Романова',      'p13', 'Климов И.С.',       ds(1),         2000,  'confirmed'],
    ['Реставрация скола 1.1 — Андрей Захаров',       'p14', 'Петрова А.В.',      ds(2),         5600,  'new'],
    ['Отбеливание + гигиена — Юлия Никитина',        'p15', 'Осипова Е.Н.',      ds(3),         24000, 'confirmed'],
    ['Имплант + коронка 4.6 — Игорь Воронов',        'p16', 'Рогов Д.И.',        ds(5),         42000, 'confirmed'],
    ['Лечение кариеса, повтор — Алексей Морозов',    'p1',  'Петрова А.В.',      ds(7),         4200,  'new'],
    ['Имплантация (этап 2) — Дмитрий Федотов',       'p3',  'Рогов Д.И.',        ds(10),        26000, 'new'],
  ];
  const appointments = APPOINTMENTS_RAW.map((d, i) => ({
    id: 'a' + (i + 1),
    name: d[0], patientId: d[1], doctor: d[2], date: d[3], price: d[4],
    service: ['Терапия', 'Гигиена', 'Хирургия', 'Ортодонтия', 'Протезирование', 'Диагностика'][i % 6],
    duration: [20, 30, 45, 60][i % 4],
    stage: d[5],
    notes: '',
    createdAt: dt(-(i * 2 + 1)),
    activity: [{ text: 'Запись создана', date: dt(-(i * 2 + 1)) }],
  }));

  // ── Счета ──
  const invoices = [
    { id: 'inv1', name: 'Счёт №001 — Имплантация Федотов', patient: 'Дмитрий Федотов', amount: 38000, status: 'paid',    date: '2024-07-03', service: 'Имплантация (этап 1)', stage: 'paid' },
    { id: 'inv2', name: 'Счёт №002 — Пародонтит Симонов', patient: 'Виктор Симонов', amount: 7400, status: 'paid', date: '2024-07-13', service: 'Лечение пародонтита', stage: 'paid' },
    { id: 'inv3', name: 'Счёт №003 — Гигиена Белова', patient: 'Ирина Белова', amount: 6200, status: 'paid', date: '2024-07-05', service: 'Профгигиена + фторирование', stage: 'paid' },
    { id: 'inv4', name: 'Счёт №004 — Пломба Кузнецова', patient: 'Ольга Кузнецова', amount: 4800, status: 'sent', date: ds(-1), service: 'Пломба световая 3.5', stage: 'sent' },
    { id: 'inv5', name: 'Счёт №005 — Отбеливание Никитина', patient: 'Юлия Никитина', amount: 24000, status: 'sent', date: ds(3), service: 'Отбеливание + гигиена', stage: 'sent' },
    { id: 'inv6', name: 'Счёт №006 — Коронка Тимофеев', patient: 'Сергей Тимофеев', amount: 18000, status: 'paid', date: '2024-07-11', service: 'Коронка металлокерамика', stage: 'paid' },
    { id: 'inv7', name: 'Счёт №007 — Диагностика Орлов', patient: 'Николай Орлов', amount: 1500, status: 'paid', date: '2024-07-06', service: 'ИИ-диагностика снимка', stage: 'paid' },
    { id: 'inv8', name: 'Счёт №008 — Удаление Громов', patient: 'Павел Громов', amount: 8500, status: 'overdue', date: ds(-3), service: 'Удаление зуба мудрости 4.8', stage: 'overdue' },
  ].map(d => ({ ...d, createdAt: d.date + 'T00:00:00.000Z', activity: [{ text: 'Счёт выставлен', date: d.date }] }));

  // ── Платежи (история 6 мес) ──
  const payments = [];
  for (let m = 6; m >= 0; m--) {
    const base = 9000000 + m * 450000 + ((m * 3) % 2) * 660000;
    payments.push({ id: 'pp' + m, title: 'Поступления за ' + new Date(Date.now() - m * 30 * 86400000).toLocaleDateString('ru-RU', { month: 'long' }), kind: 'Оплата услуг', amount: base, status: 'paid', due: monthAgo(m) });
    if (m > 0 && m % 2 === 0) payments.push({ id: 'ins' + m, title: 'Оплата в рассрочку', kind: 'Рассрочка', amount: Math.round(base * 0.22), status: 'paid', due: monthAgo(m) });
  }
  payments.push({ id: 'cur1', title: 'Текущие счета к оплате', kind: 'Оплата услуг', amount: 17700, status: 'sent', due: ds(2) });
  payments.push({ id: 'ov1', title: 'Просрочен — Громов П.', kind: 'Оплата услуг', amount: 4100, status: 'overdue', due: ds(-3) });

  // ── Расходники / склад ──
  const supplies = [
    { id: 'sp1',  name: 'Импланты Straumann BLX',            category: 'implant',    qty: 2,  unit: 'шт',     minQty: 5,  supplier: 'Straumann RU',      price: 42000, notes: '', stage: 'low' },
    { id: 'sp2',  name: 'Анестетик Убистезин форте',         category: 'consumable', qty: 85, unit: 'карпула',minQty: 30, supplier: 'Мед-Импорт',        price: 45,    notes: '', stage: 'ok' },
    { id: 'sp3',  name: 'Композит светоотверждаемый Filtek', category: 'material',   qty: 12, unit: 'шприц',  minQty: 8,  supplier: '3M Dental',         price: 3200,  notes: '', stage: 'ok' },
    { id: 'sp4',  name: 'Коффердам, латексные платки',       category: 'consumable', qty: 4,  unit: 'уп.',    minQty: 5,  supplier: 'Дентал-Снаб',       price: 890,   notes: '', stage: 'low' },
    { id: 'sp5',  name: 'Слепочная масса альгинатная',       category: 'material',   qty: 6,  unit: 'уп.',    minQty: 4,  supplier: 'Дентал-Снаб',       price: 1450,  notes: '', stage: 'ok' },
    { id: 'sp6',  name: 'Перчатки нитриловые',                category: 'consumable', qty: 22, unit: 'уп.',    minQty: 15, supplier: 'МедТорг',           price: 620,   notes: '', stage: 'ok' },
    { id: 'sp7',  name: 'Стерилизационные пакеты',            category: 'consumable', qty: 0,  unit: 'уп.',    minQty: 20, supplier: 'МедТорг',           price: 780,   notes: 'Заказ просрочен на 2 дня', stage: 'out' },
    { id: 'sp8',  name: 'Цемент стеклоиономерный',            category: 'material',   qty: 9,  unit: 'шт',     minQty: 5,  supplier: '3M Dental',         price: 2100,  notes: '', stage: 'ok' },
    { id: 'sp9',  name: 'Файлы эндодонтические (набор)',      category: 'tool',       qty: 3,  unit: 'набор',  minQty: 3,  supplier: 'VDW Германия',      price: 5400,  notes: '', stage: 'ok' },
    { id: 'sp10', name: 'Отбеливающий гель ZOOM',              category: 'material',   qty: 5,  unit: 'шт',     minQty: 6,  supplier: 'Philips ZOOM',      price: 6800,  notes: '', stage: 'low' },
    { id: 'sp11', name: 'Брекет-система металлическая',        category: 'material',   qty: 7,  unit: 'набор',  minQty: 3,  supplier: 'Ortho Organizers',  price: 8900,  notes: '', stage: 'ok' },
    { id: 'sp12', name: 'Маски медицинские трёхслойные',       category: 'consumable', qty: 18, unit: 'уп.',    minQty: 20, supplier: 'МедТорг',           price: 340,   notes: '', stage: 'low' },
  ];

  // ── Лаборатория (внешние зуботехнические работы) ──
  const laborders = [
    { id: 'lb1', name: 'Коронка на имплант — зуб 3.6, цирконий',       patient: 'Дмитрий Федотов',   workType: 'crown',   lab: 'Дентал-Люкс лаборатория', due: ds(5),  price: 38000,  notes: '', stage: 'production' },
    { id: 'lb2', name: 'Коронка — зуб 2.7, металлокерамика',           patient: 'Сергей Тимофеев',   workType: 'crown',   lab: 'СтомЛаб Москва',          due: ds(1),  price: 24000,  notes: '', stage: 'ready' },
    { id: 'lb3', name: 'Коронка на имплант — зуб 4.6, цирконий',       patient: 'Игорь Воронов',     workType: 'crown',   lab: 'Дентал-Люкс лаборатория', due: ds(9),  price: 41000,  notes: '', stage: 'ordered' },
    { id: 'lb4', name: 'Виниры ×6, фронтальная группа, E-max',         patient: 'Татьяна Романова',  workType: 'veneer',  lab: 'Артэс лаборатория',       due: ds(-6), price: 132000, notes: '', stage: 'fitted' },
    { id: 'lb5', name: 'Съёмный протез частичный',                     patient: 'Виктор Симонов',    workType: 'denture', lab: 'СтомЛаб Москва',          due: ds(7),  price: 56000,  notes: '', stage: 'production' },
  ];

  // ── Финансы (6 мес) ──
  const finance = [];
  for (let m = 5; m >= 0; m--) {
    const rev = 9000000 + m * 450000;
    finance.push({ id: 'fi' + m, type: 'income', amount: rev, category: 'Услуги стоматологии', date: monthAgo(m) });
    finance.push({ id: 'fins' + m, type: 'income', amount: Math.round(rev * 0.18), category: 'Рассрочка / кредит', date: monthAgo(m) });
    finance.push({ id: 'fz' + m, type: 'expense', amount: 4000000 + (m % 3) * 220000, category: 'Зарплаты врачей', date: monthAgo(m) });
    finance.push({ id: 'fa' + m, type: 'expense', amount: 1050000, category: 'Аренда и коммунальные', date: monthAgo(m) });
    finance.push({ id: 'fm' + m, type: 'expense', amount: 600000 + (m % 2) * 165000, category: 'Импланты и материалы', date: monthAgo(m) });
    finance.push({ id: 'fr' + m, type: 'expense', amount: 500000, category: 'Реклама', date: monthAgo(m) });
  }

  window.RECIPE = {
    key: 'clinic', theme: 'neural-dark', navLayout: 'sidebar',
    brand: { name: 'ДЕНТАЛИС · Стоматология', logo: 'Д' },
    locale: 'ru-RU', currency: '₽', prefix: 'clinC7_',
    auth: { enabled: false, user: 'admin', passHash: '', plain: '' },

    roles: {
      owner:     'Главврач',
      doctor:    'Врач',
      admin:     'Администратор',
      marketer:  'Маркетолог',
      nurse:     'Медсестра',
      accountant:'Бухгалтер',
    },

    entities: [
      // ── Пациенты ──
      {
        key: 'patient', one: 'Пациент', many: 'Пациенты',
        fields: [
          { key: 'name',      label: 'ФИО пациента',   type: 'text',   required: true, list: true, primary: true },
          { key: 'phone',     label: 'Телефон',         type: 'text',   list: true },
          { key: 'dob',       label: 'Дата рождения',   type: 'date',   list: true },
          { key: 'complaints',label: 'Жалобы / диагноз',type: 'textarea' },
          { key: 'source',    label: 'Источник',        type: 'select', list: true,
            options: { 'Реклама в Яндекс': 'Яндекс', 'Рекомендация': 'Сарафан', 'Instagram': 'Instagram', 'Сайт клиники': 'Сайт', 'Повторно': 'Повторно' } },
          { key: 'payMethod', label: 'Способ оплаты',   type: 'select', list: true,
            options: { Наличные: 'Наличные', Карта: 'Карта', Рассрочка: 'Рассрочка' } },
          { key: 'notes',     label: 'Заметки',         type: 'textarea' },
        ],
        stages: [
          { id: 'new',        label: 'Новый',      color: '#4338ca' },
          { id: 'active',     label: 'Активный',   color: '#15a05a' },
          { id: 'discharged', label: 'Выписан',    color: '#9aa2b1' },
          { id: 'archived',   label: 'Архив',      color: '#d83a3a' },
        ],
        seed: patients,
      },

      // ── Записи/Приёмы ──
      {
        key: 'appointment', one: 'Запись', many: 'Записи',
        fields: [
          { key: 'name',     label: 'Приём',               type: 'text',   required: true, list: true, primary: true },
          { key: 'doctor',   label: 'Врач',                type: 'text',   list: true },
          { key: 'date',     label: 'Дата приёма',         type: 'date',   list: true },
          { key: 'service',  label: 'Вид услуги',          type: 'select', list: true,
            options: { Терапия: 'Терапия', Гигиена: 'Гигиена', Хирургия: 'Хирургия', Ортодонтия: 'Ортодонтия', Протезирование: 'Протез.', Диагностика: 'Диагностика' } },
          { key: 'duration', label: 'Длительность (мин)',  type: 'number' },
          { key: 'price',    label: 'Стоимость',           type: 'money',  list: true },
          { key: 'notes',    label: 'Заметки',             type: 'textarea' },
        ],
        stages: [
          { id: 'new',       label: 'Новая',            color: '#4338ca' },
          { id: 'confirmed', label: 'Подтверждена',     color: '#c97a09' },
          { id: 'arrived',   label: 'Пришёл',           color: '#2d7d9a' },
          { id: 'done',      label: 'Услуга оказана',   color: '#6d5cf0' },
          { id: 'paid',      label: 'Оплата ✓',         color: '#15a05a' },
          { id: 'cancelled', label: 'Отмена',           color: '#d83a3a' },
        ],
        seed: appointments,
      },

      // ── Счета ──
      {
        key: 'invoice', one: 'Счёт', many: 'Счета',
        fields: [
          { key: 'name',    label: 'Счёт',        type: 'text',   required: true, list: true, primary: true },
          { key: 'patient', label: 'Пациент',     type: 'text',   list: true },
          { key: 'service', label: 'Услуга',      type: 'text',   list: true },
          { key: 'amount',  label: 'Сумма',       type: 'money',  list: true },
          { key: 'date',    label: 'Дата',        type: 'date',   list: true },
          { key: 'notes',   label: 'Комментарий', type: 'textarea' },
        ],
        stages: [
          { id: 'sent',    label: 'Выставлен',  color: '#c97a09' },
          { id: 'paid',    label: 'Оплачен',    color: '#15a05a' },
          { id: 'overdue', label: 'Просрочен',  color: '#d83a3a' },
          { id: 'void',    label: 'Аннулирован',color: '#9aa2b1' },
        ],
        seed: invoices,
      },

      // ── Расходники / склад ──
      {
        key: 'supply', one: 'Позиция', many: 'Расходники',
        fields: [
          { key: 'name',     label: 'Название',       type: 'text',   required: true, list: true, primary: true },
          { key: 'category', label: 'Категория',      type: 'select', list: true,
            options: { material: 'Материалы', consumable: 'Расходники', implant: 'Импланты', tool: 'Инструменты' } },
          { key: 'qty',      label: 'Остаток',        type: 'number', list: true },
          { key: 'unit',     label: 'Ед. изм.',       type: 'text',   list: true },
          { key: 'minQty',   label: 'Мин. остаток',   type: 'number' },
          { key: 'supplier', label: 'Поставщик',      type: 'text',   list: true },
          { key: 'price',    label: 'Цена за ед.',    type: 'money' },
          { key: 'notes',    label: 'Заметки',        type: 'textarea' },
        ],
        stages: [
          { id: 'ok',  label: 'В норме',         color: '#15a05a' },
          { id: 'low', label: 'Заканчивается',   color: '#c97a09' },
          { id: 'out', label: 'Нет в наличии',   color: '#d83a3a' },
        ],
        seed: supplies,
      },

      // ── Лаборатория (внешние зуботехнические работы) ──
      {
        key: 'laborder', one: 'Заказ', many: 'Заказы',
        fields: [
          { key: 'name',     label: 'Работа',       type: 'text',   required: true, list: true, primary: true },
          { key: 'patient',  label: 'Пациент',      type: 'text',   list: true },
          { key: 'workType', label: 'Вид работы',   type: 'select', list: true,
            options: { crown: 'Коронка', bridge: 'Мост', veneer: 'Винир', denture: 'Протез', splint: 'Шина' } },
          { key: 'lab',      label: 'Лаборатория',  type: 'text',   list: true },
          { key: 'due',      label: 'Срок',         type: 'date',   list: true },
          { key: 'price',    label: 'Стоимость',    type: 'money',  list: true },
          { key: 'notes',    label: 'Заметки',      type: 'textarea' },
        ],
        stages: [
          { id: 'ordered',    label: 'Заказано',     color: '#4338ca' },
          { id: 'production', label: 'В работе',     color: '#c97a09' },
          { id: 'ready',       label: 'Готово',       color: '#2d7d9a' },
          { id: 'fitted',      label: 'Установлено',  color: '#15a05a' },
        ],
        seed: laborders,
      },
    ],

    nav: [
      { key: 'aiscan',      label: 'ИИ-диагностика',   type: 'aiscan',    group: 'Диагностика', icon: 'spark', badge: 'AI' },
      { key: 'dash',        label: 'Дашборд',          type: 'dashboard', entity: 'appointment', group: 'Рабочий стол', icon: 'home' },
      { key: 'goals',       label: 'Цели · план-факт', type: 'goals',     group: 'Рабочий стол', icon: 'target' },

      { key: 'patients',    label: 'Пациенты',         type: 'records',   entity: 'patient',     group: 'Клиника', icon: 'user',
        views: [
          { key: 'all',        label: 'Все',       filter: {} },
          { key: 'new',        label: 'Новые',     filter: { stage: 'new' } },
          { key: 'active',     label: 'Активные',  filter: { stage: 'active' } },
          { key: 'discharged', label: 'Выписанные',filter: { stage: 'discharged' } },
        ]},
      { key: 'appointk',   label: 'Записи · воронка', type: 'kanban',    entity: 'appointment', group: 'Клиника', icon: 'funnel' },
      { key: 'appoints',   label: 'Журнал приёмов',   type: 'records',   entity: 'appointment', group: 'Клиника', icon: 'layers',
        views: [
          { key: 'all',       label: 'Все',            filter: {} },
          { key: 'today',     label: 'На сегодня',     filter: { dateField: 'date', within: 0 } },
          { key: 'upcoming',  label: 'Предстоящие',    filter: { dateField: 'date', future: true } },
          { key: 'done',      label: 'Завершены',      filter: { stage: 'done' } },
          { key: 'paid',      label: 'Оплачены',       filter: { stage: 'paid' } },
        ]},
      { key: 'refServices', label: 'Услуги · прайс',  type: 'reference', refKey: 'services', refFields: [{ key: 'name', label: 'Услуга' }, { key: 'dept', label: 'Отделение' }, { key: 'price', label: 'Цена', type: 'money' }, { key: 'duration', label: 'Длительность, мин' }], group: 'Клиника', icon: 'tag' },
      { key: 'supplies',   label: 'Расходники',       type: 'records',   entity: 'supply',      group: 'Клиника', icon: 'folder',
        views: [
          { key: 'all', label: 'Все',           filter: {} },
          { key: 'low', label: 'Заканчивается', filter: { stage: 'low' } },
          { key: 'out', label: 'Нет в наличии', filter: { stage: 'out' } },
        ]},
      { key: 'laborders',  label: 'Лаборатория',      type: 'kanban',    entity: 'laborder',    group: 'Клиника', icon: 'building' },

      { key: 'invoices',   label: 'Счета',            type: 'records',   entity: 'invoice',     group: 'Деньги', icon: 'file',
        views: [
          { key: 'all',     label: 'Все',        filter: {} },
          { key: 'sent',    label: 'Выставлены', filter: { stage: 'sent' } },
          { key: 'paid',    label: 'Оплачены',   filter: { stage: 'paid' } },
          { key: 'overdue', label: 'Просрочены', filter: { stage: 'overdue' } },
        ]},
      { key: 'pay',        label: 'Платежи',          type: 'payments',  group: 'Деньги', icon: 'wallet',
        views: [
          { key: 'all',     label: 'Все',         filter: {} },
          { key: 'overdue', label: 'Просрочка',   filter: { status: 'overdue' } },
          { key: 'sent',    label: 'Ожидаем',     filter: { status: 'sent' } },
          { key: 'paid',    label: 'Оплачены',    filter: { status: 'paid' } },
        ]},
      { key: 'fin',        label: 'Финансы',          type: 'finance',   group: 'Деньги', icon: 'chart' },

      { key: 'tasks',      label: 'Задачи',           type: 'tasks',     group: 'Работа', icon: 'check' },
      { key: 'calendar',   label: 'Расписание',       type: 'calendar',  group: 'Работа', icon: 'calendar' },
      { key: 'team',       label: 'Врачи и персонал', type: 'team',      group: 'Работа', icon: 'users' },

      { key: 'docs',       label: 'Документы',        type: 'docs',      group: 'Платформа', icon: 'file',
        views: [
          { key: 'all',      label: 'Все',         filter: {} },
          { key: 'contract', label: 'Договоры',    filter: { type: 'contract' } },
          { key: 'act',      label: 'Акты',        filter: { type: 'act' } },
          { key: 'offer',    label: 'КП',          filter: { type: 'offer' } },
        ]},
      { key: 'analytics',  label: 'Аналитика',        type: 'analytics', group: 'Платформа', icon: 'pie' },
      { key: 'notifications',label: 'Уведомления',    type: 'notifications', group: 'Платформа', icon: 'bell' },
      { key: 'roles',      label: 'Роли и доступы',   type: 'roles',     group: 'Платформа', icon: 'shield' },
      { key: 'knowledge',  label: 'База знаний',      type: 'knowledge', group: 'Платформа', icon: 'book' },
      { key: 'settings',   label: 'Настройки',        type: 'settings',  group: 'Платформа', icon: 'gear' },
    ],

    metrics: [
      { key: 'revenue',    label: 'Выручка (мес)',        kind: 'sum',   source: 'finance', ftype: 'income', months: 1, accent: true, sub: 'доходы клиники' },
      { key: 'patients',   label: 'Активных пациентов',   kind: 'count', entity: 'patient', where: { stage: 'active' }, good: true, sub: 'в базе' },
      { key: 'upcoming',   label: 'Предстоящих приёмов',  kind: 'count', entity: 'appointment', where: { stageIn: ['new', 'confirmed'] }, sub: 'запланировано' },
      { key: 'overdue',    label: 'Просрочено счетов',    kind: 'count', entity: 'invoice', where: { stage: 'overdue' }, bad: true, sub: 'требуют оплаты' },
    ],

    goals: {
      entity: 'appointment', factField: 'price', factWhere: { stage: 'paid' },
      target: 1200000, plan: 950000, period: 'на месяц',
    },

    analytics: [
      { kind: 'kpis', metrics: [
        { label: 'Выручка (6 мес)',       kind: 'sum',     source: 'finance', ftype: 'income', months: 6, accent: true, sub: 'поступления' },
        { label: 'Прибыль (6 мес)',       kind: 'profit',  source: 'finance', months: 6, good: true, sub: 'доход − расход' },
        { label: 'Оплачено счетов',       kind: 'sum',     source: 'payments', status: 'paid', sub: 'счета' },
        { label: 'Ожидаем оплат',        kind: 'sum',     source: 'payments', status: 'sent', sub: 'выставлено' },
        { label: 'Средний чек',          kind: 'avg',     entity: 'appointment', field: 'price', where: { stage: 'paid' }, sub: 'за приём' },
        { label: 'Всего пациентов',      kind: 'count',   entity: 'patient', where: {}, sub: 'в базе' },
        { label: 'Завершено приёмов',    kind: 'count',   entity: 'appointment', where: { stage: 'paid' }, good: true, sub: 'оплачены' },
        { label: 'Просрочено задач',     kind: 'overdue', source: 'tasks', bad: true, sub: 'требуют внимания' },
      ]},
      { kind: 'line', title: 'Выручка по месяцам', source: 'payments', status: 'paid', value: 'amount', dateField: 'due', months: 6, money: true, wide: true },
      { kind: 'donut', title: 'Записи по видам услуг',    entity: 'appointment', groupBy: 'service' },
      { kind: 'donut', title: 'Пациенты по источнику',    entity: 'patient',     groupBy: 'source' },
      { kind: 'donut', title: 'Пациенты по способу оплаты', entity: 'patient',   groupBy: 'payMethod' },
      { kind: 'bars',  title: 'Стоимость по виду услуги', entity: 'appointment', groupBy: 'service', money: 'price', where: { stage: 'paid' } },
      { kind: 'top',   title: 'Топ-6 дорогих приёмов',   entity: 'appointment', field: 'price', limit: 6, where: { stageNot: 'cancelled' } },
      { kind: 'breakdown', title: 'Сводка по статусам записей', entity: 'appointment', groupBy: 'stage', money: 'price', wide: true },
    ],

    seed: {
      payments, finance,
      tasks: [
        { id: 'ct1', title: 'Позвонить Романовой — согласовать виниры', due: ds(0), done: false },
        { id: 'ct2', title: 'Отправить счёт Кузнецовой после приёма', due: ds(0), done: false },
        { id: 'ct3', title: 'Напомнить Захарову — реставрация скола 1.1', due: ds(1), done: false },
        { id: 'ct4', title: 'Согласовать рассрочку Воронову — имплант', due: ds(4), done: false },
        { id: 'ct5', title: 'Просрочен счёт Громов П. — связаться', due: ds(-3), done: false },
        { id: 'ct6', title: 'Закупить расходники для косметологии', due: ds(2), done: false },
        { id: 'ct7', title: 'Публикация акции «Чекап за 2 990 ₽» в Instagram', due: ds(3), done: false },
        { id: 'ct8', title: 'Заказать импланты Straumann — 5 шт', due: ds(7), done: false },
      ],
      docs: [
        { id: 'cd1', type: 'contract', title: 'Договор с пациентом Морозов А.',    amount: 0,    date: ds(-40), status: 'signed' },
        { id: 'cd2', type: 'contract', title: 'Договор поставки стоматоматериалов',    amount: 0,    date: ds(-90), status: 'signed' },
        { id: 'cd3', type: 'act',      title: 'Акт оказанных услуг — июнь',        amount: 892000, date: ds(-5), status: 'signed' },
        { id: 'cd4', type: 'offer',    title: 'КП Чекап Premium для корп. клиента',amount: 45000, date: ds(-2), status: 'sent' },
        { id: 'cd5', type: 'invoice',  title: 'Счёт №008 — Громов П.',             amount: 4100, date: ds(-3), status: 'overdue' },
        { id: 'cd6', type: 'contract', title: 'Договор поставки имплантов Straumann',   amount: 0,    date: ds(-180), status: 'signed' },
      ],
      team: [
        { id: 'tm1', name: 'Оксана Петрова',  role: 'owner',     contact: '@o_petrova',    note: 'Главврач, стоматолог-терапевт', kpi: { team: 6, revenue: 980000, target: 1200000 } },
        { id: 'tm2', name: 'Илья Рогов',      role: 'doctor',    contact: '+7 916 100-22-33', note: 'Хирург-имплантолог', kpi: { deals: 62, revenue: 420000, conv: 91, target: 500000 } },
        { id: 'tm3', name: 'Игорь Климов',    role: 'doctor',    contact: '+7 903 200-44-55', note: 'Ортопед, протезирование', kpi: { deals: 47, revenue: 310000, conv: 89, target: 380000 } },
        { id: 'tm4', name: 'Елена Осипова',   role: 'doctor',    contact: '@e_osipova',    note: 'Ортодонт, гигиенист', kpi: { deals: 38, revenue: 290000, conv: 94, target: 320000 } },
        { id: 'tm5', name: 'Наталья Сурова',  role: 'admin',     contact: '+7 925 300-66-77', note: 'Регистратура, запись', kpi: { processed: 410, conv: 68 } },
        { id: 'tm6', name: 'Вера Лисина',     role: 'marketer',  contact: '@v_lisina',     note: 'Instagram, Яндекс', kpi: { leads: 234, budget: 45000, cpl: 192 } },
        { id: 'tm7', name: 'Наталья Дорн',    role: 'nurse',     contact: '+7 977 400-88-99', note: 'Ассистент стоматолога', kpi: { tasks: 312 } },
        { id: 'tm8', name: 'Галина Ефимова',  role: 'accountant',contact: '@g_efimova',    note: 'Платежи, рассрочки', kpi: { docs: 186 } },
      ],
      automation: [
        { id: 'ca1', name: 'Новая запись → SMS-подтверждение пациенту', trigger: 'created',   actions: ['sms', 'notify'],    enabled: true },
        { id: 'ca2', name: 'Приём за 24ч → напоминание пациенту',       trigger: 'dateSoon',  actions: ['sms', 'telegram'],  enabled: true },
        { id: 'ca3', name: 'Услуга оказана → выставить счёт',           trigger: 'stage',     actions: ['invoice', 'notify'],enabled: true },
        { id: 'ca4', name: 'Счёт просрочен → уведомить администратора', trigger: 'payOverdue',actions: ['notify', 'telegram'],enabled: true },
        { id: 'ca5', name: 'Новый пациент → добавить задачу врачу',     trigger: 'created',   actions: ['task', 'assign'],   enabled: false },
      ],
      knowledge: [
        { id: 'ck1', cat: 'Скрипт',    title: 'Скрипт первичного звонка пациенту',       body: 'Поздороваться, уточнить жалобу, предложить ближайшего доступного врача, уточнить способ оплаты. Зафиксировать в карточке пациента.' },
        { id: 'ck2', cat: 'Регламент', title: 'Приём пациента: чек-лист администратора', body: 'Проверить данные, попросить подписать договор, провести в кабинет врача, после приёма — выставить счёт и принять оплату.' },
        { id: 'ck3', cat: 'Инструкция',title: 'Как оформить рассрочку пациенту',                 body: 'Проверить паспорт и доход, оформить договор рассрочки на 6–12 мес, занести график платежей в CRM, выдать памятку пациенту.' },
        { id: 'ck4', cat: 'Регламент', title: 'Что делать при отмене приёма',            body: 'Перевести запись в «Отмена», освободить слот в расписании, предложить новое время. При повторной отмене — зафиксировать в карточке.' },
      ],
      reference: {
        services: [
          { id: 'cs1', name: 'Осмотр + план лечения',      dept: 'Терапия',        price: 1000,  duration: 30 },
          { id: 'cs2', name: 'Лечение кариеса (1 зуб)',    dept: 'Терапия',        price: 4500,  duration: 60 },
          { id: 'cs3', name: 'Пломба световая',            dept: 'Терапия',        price: 4800,  duration: 45 },
          { id: 'cs4', name: 'Профгигиена Air Flow',       dept: 'Гигиена',        price: 5500,  duration: 45 },
          { id: 'cs5', name: 'Отбеливание ZOOM',           dept: 'Гигиена',        price: 22000, duration: 90 },
          { id: 'cs6', name: 'Имплантация (под ключ)',     dept: 'Хирургия',       price: 55000, duration: 90 },
          { id: 'cs7', name: 'Удаление зуба мудрости',     dept: 'Хирургия',       price: 8500,  duration: 60 },
          { id: 'cs8', name: 'Коронка металлокерамика',    dept: 'Протезирование', price: 18000, duration: 60 },
          { id: 'cs9', name: 'Винир керамический',         dept: 'Протезирование', price: 32000, duration: 60 },
          { id: 'cs10',name: 'Брекет-система (установка)',  dept: 'Ортодонтия',     price: 45000, duration: 90 },
          { id: 'cs11',name: 'Лечение пародонтита',        dept: 'Терапия',        price: 7400,  duration: 60 },
          { id: 'cs12',name: 'ИИ-диагностика снимка',      dept: 'Диагностика',    price: 1500,  duration: 15 },
        ],
      },
    },
  };
})();
