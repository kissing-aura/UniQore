'use strict';
/* РЕЦЕПТ: Доставка еды / Ресторан. Sunset Warm.
   Сущности: Заказ, Клиент, Блюдо (меню).
   Стадии заказа: Новый → Готовится → Курьер → Доставлен → Отменён */
(() => {
  const ds = o => new Date(Date.now() + o * 86400000).toISOString().slice(0, 10);
  const dt = o => new Date(Date.now() + o * 86400000).toISOString();
  const monthAgo = m => { const d = new Date(); d.setMonth(d.getMonth() - m); d.setDate(8); return d.toISOString().slice(0, 10); };

  // ── Меню — блюда (20 позиций) ──
  const MENU = [
    { id: 'dish1',  name: 'Бургер «Классик»',          category: 'Бургеры',     cost: 190,  price: 490,  weight: 320, isPopular: true,  veg: false },
    { id: 'dish2',  name: 'Бургер «Двойной чизбургер»', category: 'Бургеры',    cost: 230,  price: 620,  weight: 400, isPopular: true,  veg: false },
    { id: 'dish3',  name: 'Бургер «Грибной вег»',      category: 'Бургеры',     cost: 180,  price: 470,  weight: 310, isPopular: false, veg: true },
    { id: 'dish4',  name: 'Пицца «Маргарита» 35 см',   category: 'Пицца',       cost: 280,  price: 720,  weight: 580, isPopular: true,  veg: true },
    { id: 'dish5',  name: 'Пицца «Пепперони» 35 см',   category: 'Пицца',       cost: 320,  price: 890,  weight: 620, isPopular: true,  veg: false },
    { id: 'dish6',  name: 'Пицца «Четыре сыра»',       category: 'Пицца',       cost: 350,  price: 950,  weight: 600, isPopular: false, veg: true },
    { id: 'dish7',  name: 'Шаурма куриная «Большая»',  category: 'Шаурма',      cost: 140,  price: 380,  weight: 400, isPopular: true,  veg: false },
    { id: 'dish8',  name: 'Шаурма с говядиной',        category: 'Шаурма',      cost: 170,  price: 430,  weight: 420, isPopular: false, veg: false },
    { id: 'dish9',  name: 'Роллы «Калифорния» (8 шт)', category: 'Роллы',       cost: 210,  price: 560,  weight: 280, isPopular: true,  veg: false },
    { id: 'dish10', name: 'Роллы «Дракон»',            category: 'Роллы',       cost: 250,  price: 680,  weight: 300, isPopular: false, veg: false },
    { id: 'dish11', name: 'Роллы «Авокадо» (вег)',     category: 'Роллы',       cost: 190,  price: 520,  weight: 260, isPopular: false, veg: true },
    { id: 'dish12', name: 'Картофель фри «Большой»',   category: 'Закуски',     cost: 60,   price: 190,  weight: 300, isPopular: true,  veg: true },
    { id: 'dish13', name: 'Куриные крылья BBQ (6 шт)', category: 'Закуски',     cost: 130,  price: 370,  weight: 380, isPopular: true,  veg: false },
    { id: 'dish14', name: 'Луковые кольца',            category: 'Закуски',     cost: 55,   price: 170,  weight: 220, isPopular: false, veg: true },
    { id: 'dish15', name: 'Суп «Борщ» с пампушками',  category: 'Супы',        cost: 120,  price: 320,  weight: 400, isPopular: true,  veg: false },
    { id: 'dish16', name: 'Крем-суп из тыквы',        category: 'Супы',        cost: 90,   price: 260,  weight: 350, isPopular: false, veg: true },
    { id: 'dish17', name: 'Кола 0.5 л',               category: 'Напитки',     cost: 30,   price: 120,  weight: 500, isPopular: true,  veg: true },
    { id: 'dish18', name: 'Лимонад «Клубника-мята»',  category: 'Напитки',     cost: 45,   price: 150,  weight: 400, isPopular: false, veg: true },
    { id: 'dish19', name: 'Тирамису',                  category: 'Десерты',     cost: 110,  price: 290,  weight: 150, isPopular: true,  veg: true },
    { id: 'dish20', name: 'Чизкейк «Нью-Йорк»',       category: 'Десерты',     cost: 130,  price: 320,  weight: 160, isPopular: false, veg: true },
  ];
  const menuItems = MENU.map(d => ({
    ...d,
    margin: d.price - d.cost,
    available: true,
    stage: 'active',
    notes: '',
    createdAt: dt(-90),
    activity: [{ text: 'Добавлено в меню', date: dt(-90) }],
  }));

  // ── Клиенты (14) ──
  const CUSTOMERS = [
    ['Анна Морозова',    '+7 903 411-22-33', 'anna_m',      'Зеленоградская 5/1', 'app',      64, 'vip'],
    ['Михаил Степанов',  '+7 916 522-44-55', 'misha_step',  'Ленина 12',          'organic',  22, 'regular'],
    ['Ксения Фролова',   '+7 999 633-55-66', 'ksf',         'Садовая 3',          'social',   7,  'new'],
    ['Павел Зайцев',     '+7 925 744-66-77', 'pasha_z',     'Пушкина 17',         'app',      41, 'vip'],
    ['Елена Быкова',     '+7 909 855-77-88', 'el_byk',      'Гагарина 8',         'social',   14, 'regular'],
    ['Андрей Орлов',     '+7 985 966-88-99', 'and_orl',     'Мира 22',            'app',      58, 'vip'],
    ['Татьяна Курочкина','+7 903 077-99-00', 'tan_kur',     'Советская 44',       'organic',  9,  'regular'],
    ['Игорь Ефимов',     '+7 916 188-00-11', 'igor_ef',     'Комсомольская 7',    'app',      31, 'regular'],
    ['Светлана Попова',  '+7 925 299-11-22', 'svpop',       'Октябрьская 19',     'social',   4,  'new'],
    ['Роман Киселёв',    '+7 909 300-22-33', 'rom_kis',     'Рабочая 55',         'app',      47, 'vip'],
    ['Валерия Панова',   '+7 903 411-33-44', 'val_pan',     'Молодёжная 3',       'organic',  11, 'regular'],
    ['Денис Климов',     '+7 916 522-44-55', 'den_klim',    'Лесная 28',          'social',   2,  'new'],
    ['Ольга Тюрина',     '+7 985 633-55-66', 'olg_tur',     'Центральная 1',      'app',      19, 'regular'],
    ['Виктор Колесов',   '+7 925 744-66-77', 'vik_kol',     'Новая 14',           'organic',  36, 'vip'],
  ];
  const customers = CUSTOMERS.map((d, i) => ({
    id: 'cust' + (i + 1),
    name: d[0], phone: d[1], tg: d[2], address: d[3], source: d[4], ordersCount: d[5], segment: d[6],
    totalSpent: d[5] * (400 + (i * 190) % 700),
    averageOrder: 400 + (i * 120) % 600,
    notes: '',
    stage: d[6] === 'vip' ? 'vip' : 'active',
    createdAt: dt(-(i * 15 + 5)),
    activity: [{ text: 'Первый заказ', date: dt(-(i * 15 + 5)) }],
  }));

  // ── Заказы (24) ──
  const ORDER_DEFS = [
    ['ro1',  'cust1',  'Анна Морозова',      [['dish1',1],['dish12',1],['dish17',1]],  'Зеленоградская 5/1', 'kur1', 'delivered'],
    ['ro2',  'cust2',  'Михаил Степанов',    [['dish4',1],['dish17',2]],               'Ленина 12',          'kur2', 'courier'],
    ['ro3',  'cust3',  'Ксения Фролова',     [['dish9',1],['dish19',1]],               'Садовая 3',          'kur1', 'cooking'],
    ['ro4',  'cust4',  'Павел Зайцев',       [['dish5',1],['dish13',1],['dish17',1]],  'Пушкина 17',         'kur3', 'delivered'],
    ['ro5',  'cust5',  'Елена Быкова',       [['dish7',2],['dish12',1]],               'Гагарина 8',         'kur2', 'delivered'],
    ['ro6',  'cust6',  'Андрей Орлов',       [['dish2',1],['dish13',1],['dish17',1]],  'Мира 22',            'kur1', 'new'],
    ['ro7',  'cust7',  'Татьяна Курочкина',  [['dish6',1],['dish18',1]],               'Советская 44',       'kur3', 'cooking'],
    ['ro8',  'cust8',  'Игорь Ефимов',       [['dish15',1],['dish1',1],['dish17',1]],  'Комсомольская 7',    'kur2', 'courier'],
    ['ro9',  'cust9',  'Светлана Попова',    [['dish3',1],['dish11',1]],               'Октябрьская 19',     'kur1', 'delivered'],
    ['ro10', 'cust10', 'Роман Киселёв',      [['dish5',1],['dish9',1],['dish19',1]],   'Рабочая 55',         'kur3', 'cancelled'],
    ['ro11', 'cust11', 'Валерия Панова',     [['dish4',1],['dish16',1],['dish18',1]],  'Молодёжная 3',       'kur2', 'delivered'],
    ['ro12', 'cust12', 'Денис Климов',       [['dish7',1],['dish12',1],['dish17',1]],  'Лесная 28',          'kur1', 'new'],
    ['ro13', 'cust13', 'Ольга Тюрина',       [['dish1',1],['dish14',1]],               'Центральная 1',      'kur3', 'delivered'],
    ['ro14', 'cust14', 'Виктор Колесов',     [['dish2',1],['dish5',1],['dish17',2]],   'Новая 14',           'kur2', 'courier'],
    ['ro15', 'cust1',  'Анна Морозова',      [['dish10',1],['dish20',1]],              'Зеленоградская 5/1', 'kur1', 'delivered'],
    ['ro16', 'cust4',  'Павел Зайцев',       [['dish4',1],['dish13',1]],               'Пушкина 17',         'kur3', 'cooking'],
    ['ro17', 'cust6',  'Андрей Орлов',       [['dish2',1],['dish9',1],['dish19',1]],   'Мира 22',            'kur2', 'delivered'],
    ['ro18', 'cust10', 'Роман Киселёв',      [['dish5',1],['dish17',1]],               'Рабочая 55',         'kur1', 'delivered'],
    ['ro19', 'cust2',  'Михаил Степанов',    [['dish7',1],['dish14',1],['dish18',1]],  'Ленина 12',          'kur3', 'delivered'],
    ['ro20', 'cust8',  'Игорь Ефимов',       [['dish15',1],['dish16',1]],              'Комсомольская 7',    'kur2', 'delivered'],
    ['ro21', 'cust14', 'Виктор Колесов',     [['dish1',1],['dish12',2],['dish17',1]],  'Новая 14',           'kur1', 'new'],
    ['ro22', 'cust5',  'Елена Быкова',       [['dish4',1],['dish19',1]],               'Гагарина 8',         'kur3', 'delivered'],
    ['ro23', 'cust11', 'Валерия Панова',     [['dish9',1],['dish11',1],['dish17',1]],  'Молодёжная 3',       'kur2', 'cooking'],
    ['ro24', 'cust3',  'Ксения Фролова',     [['dish3',1],['dish12',1]],               'Садовая 3',          'kur1', 'delivered'],
  ];
  const dishMap = {};
  MENU.forEach(d => { dishMap[d.id] = d; });
  const orders = ORDER_DEFS.map((d, i) => {
    const [id, custId, custName, items, address, courierId, stage] = d;
    const amount = items.reduce((s, [did, qty]) => s + (dishMap[did] ? dishMap[did].price * qty : 0), 0);
    const cost   = items.reduce((s, [did, qty]) => s + (dishMap[did] ? dishMap[did].cost  * qty : 0), 0);
    return {
      id, custId, client: custName, address,
      courier: { kur1: 'Денис Р.', kur2: 'Алексей В.', kur3: 'Сергей М.' }[courierId] || '',
      courierId,
      items: items.map(([did, qty]) => dishMap[did] ? dishMap[did].name + ' ×' + qty : did).join(', '),
      itemsCount: items.reduce((s, [, qty]) => s + qty, 0),
      amount, cost,
      profit: amount - cost,
      paymentMethod: ['cash', 'card', 'online'][i % 3],
      deliveryTime: stage === 'delivered' ? (25 + (i * 7) % 30) : null,
      stage,
      notes: stage === 'cancelled' ? 'Клиент не открыл дверь, отменил заказ' : '',
      createdAt: dt(-(i * 0.25)),
      activity: [{ text: 'Заказ принят', date: dt(-(i * 0.25)) }],
    };
  });

  // ── Платежи ──
  const payments = [];
  orders.filter(o => ['delivered'].includes(o.stage)).forEach(o => {
    payments.push({ id: 'rpay_' + o.id, title: 'Оплата #' + o.id + ' — ' + o.client, kind: 'Доставка', amount: o.amount, status: 'paid', due: o.createdAt.slice(0, 10), recordId: o.id });
  });
  orders.filter(o => o.stage === 'new').forEach(o => {
    payments.push({ id: 'rpend_' + o.id, title: 'Ожидает оплаты #' + o.id, kind: 'Доставка', amount: o.amount, status: 'sent', due: ds(0), recordId: o.id });
  });

  // ── Финансы (8 месяцев) ──
  const finance = [];
  for (let m = 7; m >= 0; m--) {
    const baseRev = 680000 + (7 - m) * 40000 + ((m * 5) % 3) * 80000;
    finance.push({ id: 'rfi_rev' + m,  type: 'income',  amount: baseRev,                    category: 'Доставка',     date: monthAgo(m) });
    finance.push({ id: 'rfi_hall' + m, type: 'income',  amount: Math.round(baseRev * 0.18), category: 'Зал (самовынос)', date: monthAgo(m) });
    finance.push({ id: 'rfi_cogs' + m, type: 'expense', amount: Math.round(baseRev * 0.42), category: 'Продукты',     date: monthAgo(m) });
    finance.push({ id: 'rfi_sal' + m,  type: 'expense', amount: 140000,                     category: 'Зарплаты',     date: monthAgo(m) });
    finance.push({ id: 'rfi_kur' + m,  type: 'expense', amount: 60000 + (m % 4) * 8000,    category: 'Курьеры',      date: monthAgo(m) });
    finance.push({ id: 'rfi_ads' + m,  type: 'expense', amount: 35000 + (m % 3) * 10000,   category: 'Реклама',      date: monthAgo(m) });
    if (m % 3 === 0) finance.push({ id: 'rfi_rent' + m, type: 'expense', amount: 90000, category: 'Аренда', date: monthAgo(m) });
  }

  window.RECIPE = {
    key: 'restaurant', theme: 'kraft', navLayout: 'sidebar',
    brand: { name: 'Вкусно — Доставка', logo: 'ВД' }, locale: 'ru-RU', currency: '₽', prefix: 'restoCRM4w_',
    auth: { enabled: false, user: 'admin', passHash: '', plain: '' },

    entities: [
      // ── Заказы доставки ──
      {
        key: 'order', one: 'Заказ', many: 'Заказы',
        fields: [
          { key: 'id',            label: '# Заказа',         type: 'text',   required: true, list: true, primary: true },
          { key: 'client',        label: 'Клиент',           type: 'text',   list: true },
          { key: 'address',       label: 'Адрес доставки',   type: 'text',   list: true },
          { key: 'courier',       label: 'Курьер',           type: 'text',   list: true },
          { key: 'items',         label: 'Состав заказа',    type: 'textarea' },
          { key: 'itemsCount',    label: 'Позиций',          type: 'number', list: true },
          { key: 'amount',        label: 'Сумма',            type: 'money',  list: true },
          { key: 'cost',          label: 'Себестоимость',    type: 'money' },
          { key: 'profit',        label: 'Прибыль',          type: 'computed', formula: 'amount - cost', list: true },
          { key: 'paymentMethod', label: 'Оплата',           type: 'select', list: true, options: { cash: 'Наличные', card: 'Карта', online: 'Онлайн' } },
          { key: 'deliveryTime',  label: 'Время доставки (мин)', type: 'number' },
          { key: 'notes',         label: 'Заметки',          type: 'textarea' },
        ],
        related: [{ label: 'Платежи', source: 'payments', key: 'recordId' }],
        stages: [
          { id: 'new',       label: 'Новый',      color: '#d2603f' },
          { id: 'cooking',   label: 'Готовится',  color: '#eaa06a' },
          { id: 'courier',   label: 'Курьер',     color: '#cf8a3a' },
          { id: 'delivered', label: 'Доставлен',  color: '#5a9e6f' },
          { id: 'cancelled', label: 'Отменён',    color: '#cf5a52' },
        ],
        seed: orders,
      },

      // ── Клиенты ──
      {
        key: 'client', one: 'Клиент', many: 'Клиенты',
        fields: [
          { key: 'name',        label: 'Имя',            type: 'text',   required: true, list: true, primary: true },
          { key: 'phone',       label: 'Телефон',        type: 'text',   list: true },
          { key: 'tg',          label: 'Telegram',       type: 'text',   list: true },
          { key: 'address',     label: 'Адрес доставки', type: 'text',   list: true },
          { key: 'source',      label: 'Источник',       type: 'select', list: true, options: { app: 'Приложение', organic: 'Органика', social: 'Соцсети' } },
          { key: 'segment',     label: 'Сегмент',        type: 'select', list: true, options: { new: 'Новый', regular: 'Постоянный', vip: 'VIP' } },
          { key: 'ordersCount', label: 'Заказов',        type: 'number', list: true },
          { key: 'totalSpent',  label: 'Потрачено',      type: 'money',  list: true },
          { key: 'averageOrder',label: 'Средний чек',    type: 'money',  list: true },
          { key: 'notes',       label: 'Заметки',        type: 'textarea' },
        ],
        stages: [
          { id: 'active',   label: 'Активный',    color: '#5a9e6f' },
          { id: 'vip',      label: 'VIP',         color: '#d2603f' },
          { id: 'new',      label: 'Новый',       color: '#eaa06a' },
          { id: 'inactive', label: 'Неактивный',  color: '#b59a86' },
        ],
        seed: customers,
      },

      // ── Меню (блюда) ──
      {
        key: 'dish', one: 'Блюдо', many: 'Меню',
        fields: [
          { key: 'name',      label: 'Название',        type: 'text',   required: true, list: true, primary: true },
          { key: 'category',  label: 'Категория',       type: 'select', list: true, options: { 'Бургеры': 'Бургеры', 'Пицца': 'Пицца', 'Шаурма': 'Шаурма', 'Роллы': 'Роллы', 'Закуски': 'Закуски', 'Супы': 'Супы', 'Напитки': 'Напитки', 'Десерты': 'Десерты' } },
          { key: 'cost',      label: 'Себестоимость',   type: 'money',  list: true },
          { key: 'price',     label: 'Цена',            type: 'money',  list: true },
          { key: 'margin',    label: 'Маржа',           type: 'computed', formula: 'price - cost', list: true },
          { key: 'weight',    label: 'Вес/объём (г/мл)',type: 'number', list: true },
          { key: 'available', label: 'В продаже',       type: 'select', options: { true: 'Да', false: 'Нет' } },
          { key: 'veg',       label: 'Вегетарианское',  type: 'select', options: { true: 'Да', false: 'Нет' } },
          { key: 'notes',     label: 'Описание',        type: 'textarea' },
        ],
        stages: [
          { id: 'active',     label: 'Активно',     color: '#5a9e6f' },
          { id: 'seasonal',   label: 'Сезонное',    color: '#eaa06a' },
          { id: 'stopped',    label: 'Остановлено', color: '#cf5a52' },
          { id: 'archived',   label: 'Архив',       color: '#b59a86' },
        ],
        seed: menuItems,
      },
    ],

    nav: [
      { key: 'hub',        label: 'Рабочий стол',      type: 'hub',       group: 'Рабочий стол', icon: 'home' },
      { key: 'dash',       label: 'Живая кухня',       type: 'kitchen',   entity: 'order',  group: 'Рабочий стол', icon: 'bolt' },
      { key: 'goals',      label: 'Цели · план-факт',  type: 'goals',                        group: 'Рабочий стол', icon: 'target' },
      { key: 'orders',     label: 'Заказы',            type: 'records',   entity: 'order',  group: 'Операции', icon: 'deal',
        views: [
          { key: 'all',       label: 'Все',          filter: {} },
          { key: 'new',       label: 'Новые',        filter: { stage: 'new' } },
          { key: 'cooking',   label: 'Готовятся',    filter: { stage: 'cooking' } },
          { key: 'courier',   label: 'У курьера',    filter: { stage: 'courier' } },
          { key: 'delivered', label: 'Доставлено',   filter: { stage: 'delivered' } },
          { key: 'cancelled', label: 'Отменённые',   filter: { stage: 'cancelled' } },
        ] },
      { key: 'ordersk',    label: 'Доска заказов',     type: 'kanban',    entity: 'order',  group: 'Операции', icon: 'layers' },
      { key: 'clients',    label: 'Клиенты',           type: 'records',   entity: 'client', group: 'Операции', icon: 'users',
        views: [
          { key: 'all',      label: 'Все',         filter: {} },
          { key: 'vip',      label: 'VIP',         filter: { stage: 'vip' } },
          { key: 'active',   label: 'Активные',    filter: { stage: 'active' } },
          { key: 'new',      label: 'Новые',       filter: { stage: 'new' } },
          { key: 'inactive', label: 'Неактивные',  filter: { stage: 'inactive' } },
        ] },
      { key: 'menu',       label: 'Меню',              type: 'records',   entity: 'dish',   group: 'Каталог', icon: 'file',
        views: [
          { key: 'all',     label: 'Всё меню',    filter: {} },
          { key: 'active',  label: 'Активные',    filter: { stage: 'active' } },
          { key: 'stopped', label: 'Остановлено', filter: { stage: 'stopped' } },
        ] },
      { key: 'refCategories', label: 'Категории меню', type: 'reference', refKey: 'categories', refFields: [{ key: 'name', label: 'Категория' }, { key: 'sortOrder', label: 'Порядок' }], drill: { view: 'menu', by: 'name' }, group: 'Каталог', icon: 'tag' },
      { key: 'pay',        label: 'Платежи',           type: 'payments',                         group: 'Финансы', icon: 'wallet',
        views: [
          { key: 'today',   label: 'Сегодня',    filter: { due: 'today' } },
          { key: 'pending', label: 'Ожидаем',    filter: { status: 'sent' } },
          { key: 'paid',    label: 'Получено',   filter: { status: 'paid' } },
          { key: 'all',     label: 'Все',        filter: {} },
        ] },
      { key: 'fin',        label: 'Финансы',           type: 'finance',                          group: 'Финансы', icon: 'chart' },
      { key: 'analytics',  label: 'Аналитика',         type: 'analytics',                        group: 'Финансы', icon: 'pie' },
      { key: 'tasks',      label: 'Задачи',            type: 'tasks',                            group: 'Работа', icon: 'check' },
      { key: 'calendar',   label: 'Календарь',         type: 'calendar',                         group: 'Работа', icon: 'calendar' },
      { key: 'team',       label: 'Команда / Курьеры', type: 'team',                             group: 'Работа', icon: 'users' },
      { key: 'docs',       label: 'Документы',         type: 'docs',                             group: 'Работа', icon: 'file',
        views: [
          { key: 'all',     label: 'Все',    filter: {} },
          { key: 'invoice', label: 'Счета',  filter: { type: 'invoice' } },
          { key: 'act',     label: 'Акты',   filter: { type: 'act' } },
        ] },
      { key: 'refSources',  label: 'Источники клиентов', type: 'reference', refKey: 'sources',  refFields: [{ key: 'name', label: 'Источник' }, { key: 'cac', label: 'Стоимость клиента', type: 'money' }], group: 'Справочники', icon: 'plug' },
      { key: 'automation',  label: 'Автоматизации',      type: 'automation',                     group: 'Платформа', icon: 'gear' },
      { key: 'notifications','label': 'Уведомления',     type: 'notifications',                  group: 'Платформа', icon: 'bell' },
      { key: 'knowledge',   label: 'База знаний',        type: 'knowledge',                      group: 'Платформа', icon: 'book' },
      { key: 'settings',    label: 'Настройки',          type: 'settings',                       group: 'Платформа', icon: 'gear' },
    ],

    metrics: [
      { key: 'revenue',    label: 'Выручка сегодня',    kind: 'sumMoney', entity: 'order', field: 'amount', where: { stage: 'delivered' }, accent: true, sub: 'доставленные' },
      { key: 'profit',     label: 'Прибыль с заказов',  kind: 'sumMoney', entity: 'order', field: 'profit', where: { stage: 'delivered' }, good: true, sub: 'чистая' },
      { key: 'active',     label: 'Заказов в работе',   kind: 'count',    entity: 'order', where: { stageIn: ['new', 'cooking', 'courier'] }, sub: 'прямо сейчас' },
      { key: 'vip',        label: 'VIP клиентов',       kind: 'count',    entity: 'client', where: { stage: 'vip' }, sub: 'в базе' },
    ],

    goals: { entity: 'order', factField: 'amount', factWhere: { stage: 'delivered' }, target: 1000000, plan: 800000, period: 'на месяц' },
    teamAuto: { entity: 'order', by: 'courier', won: 'delivered', amount: 'amount' },

    analytics: [
      { kind: 'kpis', metrics: [
        { label: 'Выручка (8 мес)',  kind: 'sum', source: 'finance', ftype: 'income',  months: 8, accent: true, sub: 'доставка + зал' },
        { label: 'Прибыль (8 мес)', kind: 'profit', source: 'finance', months: 8, good: true, sub: 'доход − расход' },
        { label: 'Получено',        kind: 'sum', source: 'payments', status: 'paid', sub: 'счета' },
        { label: 'Ожидаем',         kind: 'sum', source: 'payments', status: 'sent', sub: 'в обработке' },
        { label: 'Средний чек',     kind: 'avg', entity: 'order', field: 'amount', where: { stage: 'delivered' }, sub: 'на заказ' },
        { label: 'Заказов всего',   kind: 'count', entity: 'order', where: {}, sub: 'в базе' },
        { label: 'Клиентов',        kind: 'count', entity: 'client', where: {}, sub: 'в базе' },
        { label: 'Просрочено задач', kind: 'overdue', source: 'tasks', bad: true, sub: 'требуют внимания' },
      ] },
      { kind: 'kpis', metrics: [
        { label: 'Заказов доставлено', kind: 'count', entity: 'order', where: { stage: 'delivered' }, good: true, sub: 'успешно' },
        { label: 'Отменённые',         kind: 'count', entity: 'order', where: { stage: 'cancelled' }, bad: true, sub: 'заказов' },
        { label: 'VIP клиентов',       kind: 'count', entity: 'client', where: { stage: 'vip' }, sub: 'лояльных' },
        { label: 'Позиций в меню',     kind: 'count', entity: 'dish',   where: { stage: 'active' }, sub: 'активных' },
      ] },
      { kind: 'line', title: 'Выручка по месяцам', source: 'payments', status: 'paid', value: 'amount', dateField: 'due', months: 8, money: true, wide: true },
      { kind: 'donut', title: 'Заказы по статусам',       entity: 'order',  groupBy: 'stage' },
      { kind: 'donut', title: 'Клиенты по сегментам',     entity: 'client', groupBy: 'segment' },
      { kind: 'donut', title: 'Блюда по категориям',      entity: 'dish',   groupBy: 'category' },
      { kind: 'donut', title: 'Клиенты по источникам',    entity: 'client', groupBy: 'source' },
      { kind: 'bars',  title: 'Маржа по категориям (₽)',  entity: 'dish',   groupBy: 'category', money: 'margin' },
      { kind: 'bars',  title: 'Заказы по способу оплаты', entity: 'order',  groupBy: 'paymentMethod' },
      { kind: 'top',   title: 'Топ блюд по марже',        entity: 'dish',   field: 'margin', limit: 6 },
      { kind: 'breakdown', title: 'Воронка заказов',      entity: 'order',  groupBy: 'stage', money: 'amount', wide: true },
    ],

    seed: {
      payments, finance,
      tasks: [
        { id: 'rt1', title: 'Связаться с клиентом — отменённый заказ ro10 (Роман Киселёв)', due: ds(0), done: false },
        { id: 'rt2', title: 'Обновить меню: убрать сезонные позиции до конца дня',           due: ds(0), done: false },
        { id: 'rt3', title: 'Принять доставку продуктов — поставщик в 14:00',                due: ds(0), done: false },
        { id: 'rt4', title: 'Отправить push-рассылку VIP-клиентам (скидка 15%)',              due: ds(1), done: false },
        { id: 'rt5', title: 'Провести планёрку с курьерами — маршруты',                       due: ds(1), done: false },
        { id: 'rt6', title: 'Подготовить отчёт по кассе за неделю',                          due: ds(2), done: false },
        { id: 'rt7', title: 'Добавить новые позиции в меню (2 бургера)',                      due: ds(3), done: false },
        { id: 'rt8', title: 'Оплатить аренду кухни',                                         due: ds(5), done: false },
      ],
      docs: [
        { id: 'rd1', type: 'invoice', title: 'Счёт за продукты — Поставщик «Фрешмарт»', amount: 85000, date: ds(-2),  status: 'paid' },
        { id: 'rd2', type: 'invoice', title: 'Счёт аренда кухни — июль',                amount: 90000, date: ds(-1),  status: 'sent' },
        { id: 'rd3', type: 'act',     title: 'Акт приёмки продуктов — июнь',            amount: 0,     date: ds(-5),  status: 'signed' },
        { id: 'rd4', type: 'contract','title': 'Договор с доставкой Яндекс.Еда',        amount: 0,     date: ds(-90), status: 'signed' },
        { id: 'rd5', type: 'contract','title': 'Договор аренды кухни',                  amount: 90000, date: ds(-180),status: 'signed' },
      ],
      team: [
        { id: 'rmt1', name: 'Оксана', role: 'owner',   contact: '@oksana_resto', note: 'Владелец',         kpi: { team: 6 } },
        { id: 'rmt2', name: 'Иван Строков',    role: 'manager',  contact: '+7 916 100-11-22', note: 'Управляющий',     kpi: { deals: 320, revenue: 920000, target: 1000000 } },
        { id: 'rmt3', name: 'Денис Р.',        role: 'courier',  contact: '+7 903 200-22-33', note: 'Курьер #1',       kpi: { deliveries: 148 } },
        { id: 'rmt4', name: 'Алексей В.',      role: 'courier',  contact: '+7 925 300-33-44', note: 'Курьер #2',       kpi: { deliveries: 132 } },
        { id: 'rmt5', name: 'Сергей М.',       role: 'courier',  contact: '+7 909 400-44-55', note: 'Курьер #3',       kpi: { deliveries: 119 } },
        { id: 'rmt6', name: 'Дарья Климова',   role: 'operator', contact: '+7 985 500-55-66', note: 'Приём заказов',   kpi: { processed: 480, conv: 88 } },
        { id: 'rmt7', name: 'Юлия Смирнова',   role: 'marketer', contact: '@julia_smm',       note: 'Реклама и соцсети', kpi: { leads: 210, budget: 35000, cpl: 167 } },
        { id: 'rmt8', name: 'Пётр Назаров',    role: 'accountant',contact: '@petr_acc',       note: 'Бухгалтерия',     kpi: { docs: 140 } },
      ],
      automation: [
        { id: 'ra1', name: 'Новый заказ → сигнал на кухню + задача оператору',  trigger: 'created',   actions: ['task', 'notify', 'telegram'], enabled: true },
        { id: 'ra2', name: 'Заказ готов → назначить курьера + уведомление',      trigger: 'stage',     actions: ['assign', 'notify', 'sms'],    enabled: true },
        { id: 'ra3', name: 'Заказ доставлен → запрос отзыва клиенту',            trigger: 'delivered', actions: ['sms', 'email'],               enabled: true },
        { id: 'ra4', name: 'Клиент VIP → приоритет обработки + скидка',          trigger: 'vip',       actions: ['tag', 'notify', 'discount'],  enabled: false },
        { id: 'ra5', name: 'Заказ отменён → аналитика + уведомление владельцу',  trigger: 'cancelled', actions: ['notify', 'telegram'],         enabled: true },
      ],
      knowledge: [
        { id: 'rk1', cat: 'Скрипт',    title: 'Приём заказа по телефону',      body: 'Поздороваться → уточнить адрес → принять заказ → назвать время доставки (30-45 мин) → подтвердить стоимость → занести в CRM.' },
        { id: 'rk2', cat: 'Регламент', title: 'Работа с отменой заказа',       body: 'Уточнить причину → если приготовлено — зафиксировать убыток → предложить скидку на следующий заказ → занести в CRM с пометкой.' },
        { id: 'rk3', cat: 'Инструкция','title': 'Как принять нового VIP-клиента', body: 'VIP = более 30 заказов. Персональное приветствие, приоритет готовки, дополнительный соус в подарок. Сообщить владельцу.' },
        { id: 'rk4', cat: 'Регламент', title: 'Закрытие смены',                body: 'Свести кассу → сдать отчёт управляющему → внести данные в CRM (выручка, количество заказов, средний чек, отменённые) → закрыть смену.' },
      ],
      reference: {
        categories: [
          { id: 'rc1', name: 'Бургеры',  sortOrder: 1 },
          { id: 'rc2', name: 'Пицца',    sortOrder: 2 },
          { id: 'rc3', name: 'Шаурма',   sortOrder: 3 },
          { id: 'rc4', name: 'Роллы',    sortOrder: 4 },
          { id: 'rc5', name: 'Закуски',  sortOrder: 5 },
          { id: 'rc6', name: 'Супы',     sortOrder: 6 },
          { id: 'rc7', name: 'Напитки',  sortOrder: 7 },
          { id: 'rc8', name: 'Десерты',  sortOrder: 8 },
        ],
        sources: [
          { id: 'rs1', name: 'Приложение', cac: 0 },
          { id: 'rs2', name: 'Органика',   cac: 0 },
          { id: 'rs3', name: 'Соцсети',    cac: 280 },
        ],
      },
    },
  };
})();
