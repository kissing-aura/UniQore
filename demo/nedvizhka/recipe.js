'use strict';
/* РЕЦЕПТ: Недвижимость «Квартал» — брокеридж жилых квартир (продажа + аренда).
   Каталог объектов с фото — как маркетплейс (Avito/Циан-стиль), а не таблица.
   Сущности: Объекты, Лиды, Сделки, Агенты. */
(() => {
  const dt = o => new Date(Date.now() + o * 86400000).toISOString();

  const COMPLEXES = ['Северный Парк', 'Английский Квартал', 'Ривер Хаус', 'Сколково Парк', 'Флотилия', 'Хамовники Grand', 'Ботанический Сад'];
  const METRO = { 'Северный Парк': 'Водный стадион', 'Английский Квартал': 'Фрунзенская', 'Ривер Хаус': 'Кутузовская', 'Сколково Парк': 'Раменки', 'Флотилия': 'Мнёвники', 'Хамовники Grand': 'Спортивная', 'Ботанический Сад': 'Ботанический сад' };
  const ADDR = { 'Северный Парк': 'Головинское ш., 5', 'Английский Квартал': 'Фрунзенская наб., 12', 'Ривер Хаус': 'Кутузовский пр-т, 24', 'Сколково Парк': 'Мичуринский пр-т, 40', 'Флотилия': 'Новохорошёвский пр., 8', 'Хамовники Grand': 'Комсомольский пр-т, 30', 'Ботанический Сад': 'пр. Мира, 116' };
  const ROOMS = { studio: 'Студия', r1: '1-комн', r2: '2-комн', r3: '3-комн', r4: '4+ комн' };
  const RENOV = { raw: 'Черновая', pre: 'Предчистовая', fine: 'Чистовая', design: 'Дизайнерский ремонт' };
  const AGENTS = ['Мария Соколова', 'Игорь Ветров', 'Дарья Крылова', 'Тимофей Орлов', 'Ксения Белова'];
  const PHOTO_POOL = ['living', 'kitchen', 'bedroom', 'bathroom', 'balcony', 'office', 'dining', 'exterior'];
  const photoSet = i => [0, 3, 5].map(k => 'img/' + PHOTO_POOL[(i + k) % PHOTO_POOL.length] + '.jpg');
  const descFor = (complex, rooms, renov) => `${ROOMS[rooms]} в ЖК «${complex}» — ${RENOV[renov].toLowerCase()}, панорамные окна, вид на город. Развитая инфраструктура комплекса, шаговая доступность метро ${METRO[complex]}.`;

  // [ЖК, тип комнат, сделка(sale/rent), площадь, этаж, этажей всего, цена, ремонт, статус]
  const defs = [
    ['Северный Парк', 'r2', 'sale', 64, 9, 22, 34500000, 'fine', 'active'],
    ['Английский Квартал', 'r1', 'rent', 42, 14, 18, 145000, 'design', 'active'],
    ['Ривер Хаус', 'r3', 'sale', 88, 27, 40, 62000000, 'design', 'active'],
    ['Сколково Парк', 'studio', 'sale', 28, 5, 16, 14200000, 'fine', 'active'],
    ['Флотилия', 'r2', 'sale', 58, 11, 25, 31800000, 'pre', 'reserved'],
    ['Хамовники Grand', 'r4', 'sale', 132, 6, 9, 118000000, 'design', 'active'],
    ['Ботанический Сад', 'r1', 'rent', 38, 8, 20, 138000, 'fine', 'active'],
    ['Северный Парк', 'r3', 'rent', 95, 18, 22, 340000, 'design', 'active'],
    ['Английский Квартал', 'r2', 'sale', 70, 6, 18, 37500000, 'design', 'deal'],
    ['Ривер Хаус', 'studio', 'rent', 30, 22, 40, 98000, 'fine', 'active'],
    ['Сколково Парк', 'r1', 'sale', 44, 12, 16, 21600000, 'fine', 'active'],
    ['Флотилия', 'r4', 'rent', 150, 20, 25, 620000, 'design', 'active'],
    ['Хамовники Grand', 'r2', 'rent', 65, 4, 9, 240000, 'fine', 'reserved'],
    ['Ботанический Сад', 'r3', 'sale', 80, 15, 20, 55000000, 'pre', 'active'],
    ['Северный Парк', 'studio', 'sale', 26, 3, 22, 13800000, 'raw', 'active'],
    ['Английский Квартал', 'r3', 'sale', 92, 16, 18, 68000000, 'design', 'closed'],
    ['Ривер Хаус', 'r1', 'sale', 40, 30, 40, 24500000, 'fine', 'active'],
    ['Сколково Парк', 'r2', 'rent', 60, 9, 16, 210000, 'design', 'closed'],
  ];
  const objects = defs.map((d, i) => {
    const [complex, rooms, dealType, area, floor, floorsTotal, price, renov, stage] = d;
    const kitchenArea = rooms === 'studio' ? null : Math.round(8 + area * 0.09);
    const agent = AGENTS[i % AGENTS.length];
    return {
      id: 'ob' + (i + 1),
      name: `${ROOMS[rooms]} · ЖК «${complex}» · ${area} м²`,
      complex, address: ADDR[complex], metro: METRO[complex], rooms, area, kitchenArea,
      floor, floorsTotal, dealType, price, renovation: renov, agent,
      photos: photoSet(i), description: descFor(complex, rooms, renov),
      stage, createdAt: dt(-(3 + (i * 7) % 60)),
      activity: [{ text: 'Объект добавлен в каталог', date: dt(-(3 + (i * 7) % 60)) }, { text: 'Статус → ' + ({ active: 'Активен', reserved: 'Бронь', deal: 'На сделке', closed: dealType === 'sale' ? 'Продано' : 'Сдано' })[stage], date: dt(-(1 + i % 5)) }],
    };
  });

  const leads = [
    ['Артём Волков', '+7 916 220-14-77', 'sale', '2-комн, до 40 млн, СЗАО', 32000000, 'cian', 'viewing'],
    ['Полина Гаврилова', '+7 903 501-88-21', 'rent', '1-комн, до 160к/мес', 150000, 'avito', 'new'],
    ['Семён Ковалёв', '+7 925 774-09-45', 'sale', 'Пентхаус, вид на реку', 120000000, 'referral', 'qualified'],
    ['Виктория Ким', '+7 916 340-33-12', 'sale', 'Студия, до 15 млн', 14500000, 'site', 'new'],
    ['Руслан Тагиров', '+7 999 812-67-30', 'rent', '3-комн, семья, до 350к', 330000, 'cian', 'viewing'],
    ['Алина Прохорова', '+7 909 611-21-04', 'sale', '2-комн, дизайнерский ремонт', 38000000, 'insta', 'contacted'],
    ['Дмитрий Орешкин', '+7 977 405-33-09', 'rent', 'Студия, до 100к', 95000, 'avito', 'won'],
    ['Мила Северцева', '+7 916 288-19-40', 'sale', '3-4 комн, Хамовники/центр', 90000000, 'referral', 'qualified'],
    ['Егор Стрельцов', '+7 903 471-52-16', 'sale', '1-комн, до 25 млн', 23000000, 'site', 'lost'],
    ['Юлия Ремизова', '+7 925 690-44-83', 'rent', '2-комн, до 250к, метро рядом', 235000, 'cian', 'new'],
  ].map((d, i) => ({ id: 'ld' + (i + 1), name: d[0], phone: d[1], dealType: d[2], want: d[3], budget: d[4], source: d[5], stage: d[6], notes: '', createdAt: dt(-(i * 2 + 1)), activity: [{ text: 'Заявка получена', date: dt(-(i * 2 + 1)) }] }));

  const deals = [
    ['Продажа «Северный Парк» 2к — Артём Волков', 'Артём Волков', 'Северный Парк · 2-комн · 64 м²', 34500000, 'Мария Соколова', 'nego'],
    ['Аренда «Английский Квартал» 1к — Полина Гаврилова', 'Полина Гаврилова', 'Английский Квартал · 1-комн · 42 м²', 145000, 'Игорь Ветров', 'contract'],
    ['Продажа пентхауса «Хамовники Grand»', 'Семён Ковалёв', 'Хамовники Grand · 4-комн · 132 м²', 118000000, 'Дарья Крылова', 'nego'],
    ['Продажа «Сколково Парк» студия', 'Виктория Ким', 'Сколково Парк · Студия · 28 м²', 14200000, 'Тимофей Орлов', 'new'],
    ['Аренда «Северный Парк» 3к — Руслан Тагиров', 'Руслан Тагиров', 'Северный Парк · 3-комн · 95 м²', 340000, 'Ксения Белова', 'nego'],
    ['Продажа «Английский Квартал» 2к', 'Алина Прохорова', 'Английский Квартал · 2-комн · 70 м²', 37500000, 'Мария Соколова', 'won'],
    ['Аренда «Ривер Хаус» студия — Дмитрий Орешкин', 'Дмитрий Орешкин', 'Ривер Хаус · Студия · 30 м²', 98000, 'Игорь Ветров', 'won'],
    ['Продажа «Английский Квартал» 3к', 'корп. клиент', 'Английский Квартал · 3-комн · 92 м²', 68000000, 'Дарья Крылова', 'won'],
  ].map((d, i) => ({ id: 'dl' + (i + 1), name: d[0], client: d[1], object: d[2], amount: d[3], manager: d[4], stage: d[5], notes: '', createdAt: dt(-(i * 4 + 2)), activity: [{ text: 'Сделка создана', date: dt(-(i * 4 + 2)) }] }));

  const agents = [
    ['Мария Соколова', '+7 916 200-11-22', 'Продажа · премиум', 14, 4.9],
    ['Игорь Ветров', '+7 925 480-33-12', 'Аренда', 21, 4.8],
    ['Дарья Крылова', '+7 903 711-09-45', 'Продажа', 11, 4.9],
    ['Тимофей Орлов', '+7 977 451-33-09', 'Продажа · новостройки', 9, 4.7],
    ['Ксения Белова', '+7 909 880-21-04', 'Аренда · семейная', 17, 4.8],
  ].map((d, i) => ({ id: 'ag' + (i + 1), name: d[0], phone: d[1], specialty: d[2], deals: d[3], rating: d[4], notes: '', createdAt: dt(-(60 - i * 8)) }));

  window.RECIPE = {
    key: 'realty-catalog', theme: 'terra-editorial', navLayout: 'sidebar',
    brand: { name: 'Квартал', logo: 'КВ' }, locale: 'ru-RU', currency: '₽', prefix: 'kvartalR9_',
    auth: { enabled: false, user: 'admin', passHash: '', plain: '' },

    entities: [
      {
        key: 'object', one: 'Объект', many: 'Объекты',
        fields: [
          { key: 'name', label: 'Объект', type: 'text', required: true, list: true, primary: true },
          { key: 'complex', label: 'ЖК', type: 'text', list: true },
          { key: 'address', label: 'Адрес', type: 'text' },
          { key: 'metro', label: 'Метро', type: 'text', list: true },
          { key: 'rooms', label: 'Комнат', type: 'select', list: true, options: ROOMS },
          { key: 'area', label: 'Площадь, м²', type: 'number', list: true },
          { key: 'kitchenArea', label: 'Кухня, м²', type: 'number' },
          { key: 'floor', label: 'Этаж', type: 'number' },
          { key: 'floorsTotal', label: 'Этажей в доме', type: 'number' },
          { key: 'dealType', label: 'Тип сделки', type: 'select', list: true, options: { sale: 'Продажа', rent: 'Аренда' } },
          { key: 'price', label: 'Цена', type: 'money', list: true },
          { key: 'renovation', label: 'Ремонт', type: 'select', list: true, options: RENOV },
          { key: 'agent', label: 'Агент', type: 'text', list: true },
          { key: 'photos', label: 'Фото', type: 'gallery' },
          { key: 'description', label: 'Описание', type: 'textarea' },
        ],
        stages: [{ id: 'active', label: 'Активен', color: '#3f8f5e' }, { id: 'reserved', label: 'Бронь', color: '#c9932f' }, { id: 'deal', label: 'На сделке', color: '#8f5a2c' }, { id: 'closed', label: 'Закрыт', color: '#6b6458' }],
        seed: objects,
      },
      {
        key: 'lead', one: 'Лид', many: 'Лиды',
        fields: [
          { key: 'name', label: 'Имя', type: 'text', required: true, list: true, primary: true },
          { key: 'phone', label: 'Телефон', type: 'text', list: true },
          { key: 'dealType', label: 'Ищет', type: 'select', list: true, options: { sale: 'Купить', rent: 'Снять' } },
          { key: 'want', label: 'Запрос', type: 'text', list: true },
          { key: 'budget', label: 'Бюджет', type: 'money', list: true },
          { key: 'source', label: 'Источник', type: 'select', options: { cian: 'Циан', avito: 'Авито', insta: 'Instagram', site: 'Сайт', referral: 'Рекомендация' } },
          { key: 'notes', label: 'Заметки', type: 'textarea' },
        ],
        stages: [{ id: 'new', label: 'Новый', color: '#60a5fa' }, { id: 'contacted', label: 'Связались', color: '#c9932f' }, { id: 'qualified', label: 'Квалифицирован', color: '#8f5a2c' }, { id: 'viewing', label: 'Показ', color: '#b8763f' }, { id: 'won', label: 'Сделка ✓', color: '#3f8f5e' }, { id: 'lost', label: 'Отказ', color: '#6b6458' }],
        seed: leads,
      },
      {
        key: 'deal', one: 'Сделка', many: 'Сделки',
        fields: [
          { key: 'name', label: 'Сделка', type: 'text', required: true, list: true, primary: true },
          { key: 'client', label: 'Клиент', type: 'text', list: true },
          { key: 'object', label: 'Объект', type: 'text', list: true },
          { key: 'amount', label: 'Сумма', type: 'money', list: true },
          { key: 'manager', label: 'Агент', type: 'text', list: true },
          { key: 'notes', label: 'Заметки', type: 'textarea' },
        ],
        stages: [{ id: 'new', label: 'Новая', color: '#60a5fa' }, { id: 'nego', label: 'Переговоры', color: '#c9932f' }, { id: 'contract', label: 'Договор', color: '#8f5a2c' }, { id: 'won', label: 'Закрыта ✓', color: '#3f8f5e' }, { id: 'lost', label: 'Слита', color: '#6b6458' }],
        seed: deals,
      },
      {
        key: 'agent', one: 'Агент', many: 'Агенты',
        fields: [
          { key: 'name', label: 'Имя', type: 'text', required: true, list: true, primary: true },
          { key: 'phone', label: 'Телефон', type: 'text', list: true },
          { key: 'specialty', label: 'Специализация', type: 'text', list: true },
          { key: 'deals', label: 'Сделок закрыто', type: 'number', list: true },
          { key: 'rating', label: 'Рейтинг', type: 'number', list: true },
          { key: 'notes', label: 'Заметки', type: 'textarea' },
        ],
        seed: agents,
      },
    ],

    nav: [
      { key: 'catalog', label: 'Каталог', type: 'catalog', entity: 'object', group: 'Витрина', icon: 'building' },
      { key: 'leads', label: 'Лиды', type: 'records', entity: 'lead', group: 'CRM', icon: 'spark', views: [{ key: 'all', label: 'Все', filter: {} }, { key: 'new', label: 'Новые', filter: { stage: 'new' } }, { key: 'work', label: 'В работе', filter: { stageIn: ['contacted', 'qualified', 'viewing'] } }] },
      { key: 'deals', label: 'Сделки', type: 'kanban', entity: 'deal', group: 'CRM', icon: 'deal' },
      { key: 'agents', label: 'Агенты', type: 'records', entity: 'agent', group: 'CRM', icon: 'users' },
    ],

    metrics: [],
  };
})();
