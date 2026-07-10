/* ============================================================================
   UNIQORE COMMAND — Data layer  (localStorage now · Supabase-ready shape)
   All access goes through UQ.*  — swap the persistence for cloud.js later
   without touching app.js. Row shapes mirror supabase/schema.sql 1:1.
   ========================================================================== */
(function(){
  const KEY = 'uqcmd_v5';

  /* — economics (spec) — */
  const SERVICE = 1200;      // цена услуги Uniqore
  const CUT     = 100;       // менеджеру за сделку
  const NET     = SERVICE - CUT;

  /* — call outcomes (6) — */
  const STATUS = {
    deal:      { label:'Сделка',       color:'#4fe3b0', pill:'good',  weight:6 },
    meeting:   { label:'Встреча',      color:'#5b8cff', pill:'acc',   weight:5.5 },
    interested:{ label:'Интерес',      color:'#a78bfa', pill:'acc',   weight:5 },
    callback:  { label:'Перезвонить',  color:'#63d7ff', pill:'cyan',  weight:4, needsDate:true },
    no_answer: { label:'Не ответил',   color:'#ffc55a', pill:'warn',  weight:2 },
    refused:   { label:'Отказ',        color:'#ff6b81', pill:'bad',   weight:1, needsReason:true },
    invalid:   { label:'Невалид',      color:'#8a879c', pill:'',      weight:0 },
  };

  /* — боли по нишам (подсказки менеджеру: что говорить при звонке) — */
  const NICHE_PAINS = {
    'Барбершоп':['Клиенты записываются по телефону — заявки теряются','Нет напоминаний — 20-30% неявок','Не видно загрузку мастеров','Нет онлайн-записи 24/7'],
    'Автосервис':['Заявки в мессенджерах — хаос, теряются','Нет CRM — не помнят историю клиента','Не отслеживают загрузку боксов','Нет напоминаний о ТО'],
    'Стоматология':['Запись через администратора — очереди','Неявки 15-25% без напоминаний','Нет цифровых карт пациентов','Не знают откуда приходят пациенты'],
    'Салон красоты':['Мастера ведут запись в тетрадках','Нет онлайн-записи 24/7','Не знают какие услуги прибыльнее','Нет программы лояльности'],
    'Ветклиника':['Нет напоминаний о вакцинации','История на бумаге — долго искать','Нет онлайн-записи','Не видно загрузку врачей'],
    'Фотостудия':['Бронирование через переписку — путаница','Нет напоминаний клиентам','Не отслеживают заполняемость','Нет предоплаты — неявки'],
    'Цветы':['Заказы по телефону — теряются в пик','Не помнят дни рождения клиентов','Нет авто-напоминалок к праздникам','Не видно что продаётся лучше'],
    'Ресторан':['Бронирование столиков хаотичное','Нет лояльности — клиенты не возвращаются','Не собирают отзывы','Нет аналитики по меню'],
    'Массаж':['Запись в блокноте — путаница','20%+ неявок без напоминаний','Не видно загрузку мастеров','Нет повторных продаж'],
    'Автомойка':['Клиенты уезжают не дождавшись','Нет записи на время','Не видно загрузку боксов','Нет лояльности'],
    'Пекарня':['Заказы тортов через переписку','Не помнят предпочтения клиентов','Не видно что продаётся лучше','Нет предзаказа'],
    'Фитнес-клуб':['Абонементы на бумаге','Нет онлайн-расписания','Не видно загрузку залов','Клиенты не продлевают'],
    'Клининг':['Заявки теряются в мессенджерах','Нет распределения по бригадам','Нет фотоотчётов','Разовые клиенты не возвращаются'],
    'Детейлинг':['Запись по телефону — теряют клиентов','Нет фото до/после в системе','Не видно загрузку','Нет напоминаний о полировке'],
    'Шиномонтаж':['Сезонный наплыв — очереди без записи','Не напоминают о смене шин','Теряют повторных клиентов','Не видно загрузку постов'],
    'Ателье':['Заказы на бумаге — путаница','Нет напоминаний о готовности','Не видно загрузку мастеров','Нет повторных продаж'],
    'Квесты':['Бронирование через мессенджеры','Нет напоминаний — неявки','Не собирают отзывы','Нет повторных визитов'],
    'Зоомагазин':['Нет напоминаний о покупке корма','Не знают предпочтения клиентов','Нет лояльности','Не видно какие товары популярны'],
    'Химчистка':['Нет уведомлений о готовности','Не помнят предпочтения клиента','Нет онлайн-приёма','Не видно загрузку'],
    'Танцы':['Абонементы на бумаге','Нет онлайн-записи на занятия','Не видно заполняемость групп','Клиенты не продлевают'],
    'Автошкола':['Расписание инструкторов в хаосе','Нет онлайн-записи на вождение','Не отслеживают прогресс','Нет напоминаний'],
    'Детский центр':['Запись через звонки — теряются','Нет напоминаний родителям','Не видно загрузку групп','Нет цифрового расписания'],
    'Ремонт техники':['Нет статуса ремонта для клиента','Заявки в мессенджерах — хаос','Не видно загрузку мастеров','Нет напоминаний о готовности'],
    'Юр. услуги':['Заявки теряются между звонками','Нет базы клиентов и дел','Не видно статус по каждому делу','Нет напоминаний о заседаниях'],
    'Языковая школа':['Расписание групп в Excel','Нет онлайн-записи на пробный','Не отслеживают прогресс учеников','Нет авто-напоминаний'],
  };
  const GENERIC_PAINS = ['Заявки теряются между мессенджерами и звонками','Нет единой базы клиентов','Не видно откуда приходят клиенты','Нет напоминаний — клиенты забывают'];
  function pickPains(niche){
    let pool = NICHE_PAINS[niche];
    if(!pool){ const k=Object.keys(NICHE_PAINS).find(kk=>{ const w=kk.toLowerCase().slice(0,5); return (niche||'').toLowerCase().includes(w); }); pool = k?NICHE_PAINS[k]:GENERIC_PAINS; }
    const a=[...pool], out=[]; for(let i=0;i<2&&a.length;i++) out.push(a.splice(Math.floor(Math.random()*a.length),1)[0]);
    return out;
  }

  /* — живой скрипт продаж по этапам (кабинет оператора) — */
  const SCRIPT_STAGES = [
    { key:'hi',    label:'Приветствие',  icon:'phone',  text:'Здравствуйте! Меня зовут {name}, компания Uniqore. Делаем CRM-системы под конкретный бизнес за пару дней. Удобно 30 секунд?' },
    { key:'qual',  label:'Квалификация', icon:'search', text:'Подскажите, как сейчас ведёте клиентов и заявки — в тетради, в Excel или уже есть система? Что бесит больше всего?' },
    { key:'offer', label:'Оффер',        icon:'spark',  text:'Соберём систему под вас: заявки, клиенты, задачи, деньги — всё в одном окне. Настройка под ключ, обучение команды, поддержка. Разово $1200, без ежемесячной аренды.' },
    { key:'work',  label:'Отработка',    icon:'shield', text:'Понимаю. Одна потерянная заявка в неделю — уже дороже. Система окупается за первый месяц, а платите один раз. Покажу пример под вашу нишу?' },
    { key:'close', label:'Закрытие',     icon:'check',  text:'Давайте так: скину короткую презентацию и живой пример под вашу нишу. На чей WhatsApp отправить?' },
  ];
  /* — отработка возражений: возражение → готовый ответ — */
  const OBJECTION_REPLIES = {
    'Дорого':'Понимаю. Посчитайте: одна потерянная заявка в неделю — уже больше $1200 в месяц. Система платится один раз и окупается за первый месяц.',
    'Уже есть CRM':'Отлично, что система есть. А она собрана под вашу нишу или универсальная «для всех»? Мы делаем именно под ваш процесс — покажу разницу за 5 минут.',
    'Нет времени':'Именно поэтому и звоню — система снимает 1-2 часа рутины в день. Сейчас займёт 30 секунд решить, стоит ли смотреть пример.',
    'Не вижу ценности':'Смотрите по деньгам: заявки не теряются, клиенты не забываются, видно кто сколько принёс. Это прямая прибыль. Покажу на примере вашей ниши.',
    'Надо подумать':'Конечно. Чтобы думать предметно — скину пример под вашу нишу и цену, посмотрите спокойно. На какой WhatsApp отправить?',
    'Не доверяю':'Резонно. Поэтому сначала показываю готовый пример и работающих клиентов в вашей нише, а по оплате — только когда всё нравится.',
    'Другое':'Понял вас. Давайте скину пример под вашу нишу — посмотрите, и там решим. На какой WhatsApp отправить?',
  };

  /* — стадии пайплайна сделок — */
  const DSTAGES = [
    { id:'lead',      label:'Новый лид',    color:'#8a879c' },
    { id:'qualified', label:'Квалификация', color:'#8b7cf6' },
    { id:'demo',      label:'Презентация',  color:'#63d7ff' },
    { id:'payment',   label:'Оплата',       color:'#ffc55a' },
    { id:'building',  label:'В сборке',     color:'#a78bfa' },
    { id:'live',      label:'Запущен',      color:'#4fe3b0' },
  ];
  /* — статусы клиента — */
  const CSTATUS = {
    live:      { label:'Работает',   pill:'good' },
    building:  { label:'В сборке',   pill:'acc' },
    support:   { label:'Поддержка',  pill:'warn' },
    onboarding:{ label:'Онбординг',  pill:'cyan' },
  };

  /* — date helpers — */
  const DAY = 864e5;
  const iso = d => new Date(d).toISOString();
  const today0 = () => { const d=new Date(); d.setHours(0,0,0,0); return d.getTime(); };
  const daysAgo = n => today0() - n*DAY;
  const isToday = ts => ts >= today0();
  const fmtDay = ts => new Date(ts).toLocaleDateString('ru-RU',{day:'numeric',month:'short'}).replace('.','');
  const uid = p => p+Math.random().toString(36).slice(2,8);

  /* — seed content — */
  const NAMES = ['Максим Орлов','Роман Дегтярёв','Полина Швец','Игорь Мельник','Эвелина Марчук','Стас Гринёв','Вадим Лыков','Алина Крашева'];
  const CITIES = ['Москва','Санкт-Петербург','Казань','Екатеринбург','Новосибирск','Краснодар','Минск'];
  const NICHES = ['Стоматология','Автосервис','Барбершоп','Ресторан','Фитнес-клуб','Юр. услуги','Салон красоты','Цветы','Ремонт техники','Клининг'];
  const BIZ = {
    'Стоматология':['Улыбка','Дентал Люкс','Белый Клык','32 Нормы','ДокторСмайл'],
    'Автосервис':['Гараж №1','АвтоПрофи','Колесо','Моторс','ПитСтоп'],
    'Барбершоп':['Бородач','OldBoy','Топор','Chop-Chop','Джентльмен'],
    'Ресторан':['Веранда','Тбилисо','Осака','Мясо&Вино','Пряности'],
    'Фитнес-клуб':['Атлет','PowerHouse','Форма','Железо','Драйв'],
    'Юр. услуги':['Правовед','Аргумент','Фемида','Статус','Легал'],
    'Салон красоты':['Афродита','Локон','Бьюти Бар','Шарм','Персона'],
    'Цветы':['Флора','Букет','Пионы','Лепесток','Ботаника'],
    'Ремонт техники':['ФиксБокс','Сервис+','МастерОк','Гаджет','РемЗона'],
    'Клининг':['ЧистоТа','Блеск','Свежесть','КлинПро','Аккуратно'],
  };
  const REASONS = ['Дорого','Уже есть CRM','Нет ЛПР на месте','Не интересно','Просил не звонить','Думает / перезвон позже'];
  const rand = a => a[Math.floor(Math.random()*a.length)];
  const phone = () => '+7 9'+(10+Math.floor(Math.random()*89))+' '+(100+Math.floor(Math.random()*899))+'-'+(10+Math.floor(Math.random()*89))+'-'+(10+Math.floor(Math.random()*89));

  /* ── build seed ─────────────────────────────────────────────────────── */
  function seed(){
    const AV = ['#8b7cf6','#63d7ff','#4fe3b0','#ff9f5a','#e05bd1','#5b8cff','#ffc55a','#ff6b81'];
    const HEAD_ID = 'h1';
    const managers = NAMES.map((n,i)=>({
      id:'m'+(i+1), name:n,
      email:(n.split(' ')[1]||'user').toLowerCase().replace(/[^a-z]/g,'')+ '@uniqore.pro',
      city:rand(CITIES), status: i===7?'blocked':'active',
      joinedAt:daysAgo(30-i*3), color:AV[i%AV.length],
      role:'manager', teamLeadId: i<3 ? HEAD_ID : null,   // первые 3 — команда Вовы
      // живая статистика для демо (в Pro считается из call_logs)
      dealsToday:[3,2,1,2,0,1,1,0][i],
      dealsYesterday:[2,4,1,3,0,2,1,0][i],
      dryDays:[0,0,1,0,4,0,2,9][i],
      calledToday:[24,31,12,28,6,15,9,0][i],
    }));
    // руководитель продаж — обучает и ведёт часть менеджеров, сам не владелец
    managers.push({
      id:HEAD_ID, name:'Дмитрий Соснин', email:'dmitry@uniqore.pro',
      city:'Минск', status:'active', joinedAt:daysAgo(60), color:'#63d7ff',
      role:'head', teamLeadId:null,
      dealsToday:1, dealsYesterday:2, dryDays:0, calledToday:14,
    });

    const leads = [];
    const calls = [];
    // назначаем каждому активному менеджеру пул на сегодня
    managers.filter(m=>m.status==='active').forEach(m=>{
      const lim = limit(m);
      for(let i=0;i<lim;i++){
        const niche = rand(NICHES);
        const done = i < m.calledToday;
        let st='new', comment='', reason='', cb=null, val=0, calledAt=null;
        if(done){
          // распределяем исходы реалистично
          const r=Math.random();
          if(i < m.dealsToday){ st='deal'; val=SERVICE; }
          else if(r<0.16){ st='interested'; }
          else if(r<0.32){ st='callback'; cb=iso(daysAgo(-1-Math.floor(Math.random()*3))); }
          else if(r<0.5){ st='refused'; reason=rand(REASONS); }
          else if(r<0.78){ st='no_answer'; }
          else { st='invalid'; }
          calledAt = iso(today0()+ (8+Math.random()*9)*36e5);
          if(st==='deal') comment='Отправил договор, оплата сегодня';
          else if(st==='interested') comment='Скинул презентацию в WhatsApp';
        }
        const L = {
          id:uid('l'), business:'«'+rand(BIZ[niche])+'»', phone:phone(),
          city:m.city, niche, pains:pickPains(niche), managerId:m.id, status:st, comment, reason,
          callbackDate:cb, value:val, assignedAt:iso(today0()), calledAt,
          updatedAt: calledAt||iso(today0()),
        };
        leads.push(L);
        if(done) calls.push({id:uid('c'),leadId:L.id,managerId:m.id,status:st,comment,reason,callbackDate:cb,createdAt:calledAt});
      }
    });
    // немного нераспределённой базы в пуле
    for(let i=0;i<40;i++){ const niche=rand(NICHES); leads.push({id:uid('l'),business:'«'+rand(BIZ[niche])+'»',phone:phone(),city:rand(CITIES),niche,pains:pickPains(niche),managerId:null,status:'pool',comment:'',reason:'',callbackDate:null,value:0,assignedAt:null,calledAt:null,updatedAt:iso(daysAgo(1))}); }

    // выплаты (по закрытым сделкам)
    const payouts = managers.filter(m=>m.status==='active').map(m=>{
      const deals = m.dealsYesterday + m.dealsToday;
      return { id:uid('p'), managerId:m.id, deals, amount:deals*CUT, status: (m.id==='m2'||m.id==='m4')?'pending':'pending', period:'Текущая неделя', createdAt:iso(daysAgo(0)) };
    });
    payouts.push({ id:uid('p'), managerId:'m1', deals:12, amount:1200, status:'paid', period:'Прошлая неделя', createdAt:iso(daysAgo(7)) });

    // выручка по дням (последние 7)
    const revDays = [];
    const dealCurve=[7,9,6,11,8,12,14];
    for(let i=6;i>=0;i--){ const d=daysAgo(i); const deals=dealCurve[6-i]; revDays.push({ts:d,label:fmtDay(d),deals,revenue:deals*SERVICE}); }

    // задачи (канбан)
    const tasks = [
      {id:uid('t'),title:'Прозвонить 40 стоматологий по базе МСК',column:'today',frog:false,owner:'Максим',pri:'high',due:iso(today0()),check:[8,40]},
      {id:uid('t'),title:'Дожать 3 «думающих» лида до оплаты',column:'today',frog:true,owner:'Полина',pri:'high',due:iso(today0()),comments:2},
      {id:uid('t'),title:'Собрать возражения недели → обновить скрипт',column:'doing',frog:false,owner:'Матвей',pri:'med',check:[3,5]},
      {id:uid('t'),title:'Собеседовать 2 новых менеджеров',column:'today',frog:false,owner:'Матвей',pri:'med',due:iso(daysAgo(-1))},
      {id:uid('t'),title:'Записать разбор лучшего звонка для команды',column:'backlog',frog:false,owner:'Матвей',pri:'low',comments:1},
      {id:uid('t'),title:'Загрузить свежую базу: автосервисы СПб',column:'backlog',frog:false,owner:'Стас',pri:'med',due:iso(daysAgo(-3))},
      {id:uid('t'),title:'Выплатить менеджерам за прошлую неделю',column:'done',frog:false,owner:'Матвей',pri:'high',check:[7,7]},
      {id:uid('t'),title:'Настроить приветственное сообщение клиенту',column:'done',frog:false,owner:'Матвей',pri:'low'},
    ];

    // план дня (Ivy Lee — 6 задач, #1 = лягушка)
    const daily = [
      {id:uid('d'),text:'Разбор вчерашних отказов — найти 1 паттерн и убрать',frog:true,done:false},
      {id:uid('d'),text:'Позвонить топ-3 «интерес» лидам до 12:00',frog:false,done:true},
      {id:uid('d'),text:'Планёрка с отделом: цель дня 12 сделок',frog:false,done:true},
      {id:uid('d'),text:'Проверить лимиты и добить отстающих 1-на-1',frog:false,done:false},
      {id:uid('d'),text:'Обновить скрипт под новое возражение «дорого»',frog:false,done:false},
      {id:uid('d'),text:'Свести выплаты и отправить отчёт',frog:false,done:false},
    ];

    // цели недели (OKR)
    const goals = {
      objective:'Запустить отдел продаж на полную мощность',
      period:'Эта неделя · 30 июн – 6 июл',
      krs:[
        {label:'Закрытых сделок',current:56,target:70,unit:'',good:false},
        {label:'Конверсия звонок→сделка',current:9,target:12,unit:'%',good:false},
        {label:'Активных менеджеров на смене',current:7,target:10,unit:'',good:false},
        {label:'Выручка недели',current:67200,target:84000,unit:'₽',good:true,money:true},
      ],
    };

    // «Сделали» — лог достижений
    const doneLog = [
      {id:uid('g'),text:'Закрыли 14 сделок за день — рекорд отдела',who:'Отдел',at:iso(today0()+18*36e5)},
      {id:uid('g'),text:'Роман Д. сделал 4 продажи — лимит вырос до 80',who:'Матвей',at:iso(today0()+16*36e5)},
      {id:uid('g'),text:'Обновили скрипт: конверсия +2.1% за 2 дня',who:'Полина',at:iso(daysAgo(1)+15*36e5)},
      {id:uid('g'),text:'Подключили 2 новых менеджеров на холодную базу',who:'Матвей',at:iso(daysAgo(1)+11*36e5)},
      {id:uid('g'),text:'Выплатили $1 200 за прошлую неделю без задержек',who:'Матвей',at:iso(daysAgo(2)+19*36e5)},
    ];

    // стрик (не рвём цепь — 100% каждый день)
    const streak = { current:6, best:11, days:[
      {label:'Пн',hit:true},{label:'Вт',hit:true},{label:'Ср',hit:true},
      {label:'Чт',hit:true},{label:'Пт',hit:true},{label:'Сб',hit:true},{label:'Вс',hit:false,today:true},
    ]};

    // ── КЛИЕНТЫ Uniqore (реальные ниши/сборки) ──────────────────────────
    const clients = [
      {id:'c1', name:'Гринвуд · Недвижимость', niche:'Недвижимость', recipe:'realty-classic', theme:'graphite-pro', status:'live', value:1200, mrr:1300, health:'good', manager:'Полина Швец', deploy:'demo1.uniqore.pro', since:daysAgo(21)},
      {id:'c2', name:'Аренда Норд-Сити', niche:'Аренда / Сити', recipe:'realty-rent', theme:'bloomberg-dark-gold', status:'live', value:1200, mrr:1300, health:'good', manager:'Полина Швец', deploy:'demo2.uniqore.pro', since:daysAgo(34)},
      {id:'c3', name:'Дубрава · Мебель на заказ', niche:'Мебель', recipe:'furniture-custom', theme:'mono-brutalist', status:'live', value:1200, mrr:0, health:'good', manager:'Роман Дегтярёв', deploy:'demo3.uniqore.pro', since:daysAgo(28)},
      {id:'c4', name:'Медлайн · Клиника', niche:'Клиника', recipe:'clinic', theme:'clean-light', status:'support', value:1200, mrr:900, health:'warn', manager:'Игорь Мельник', deploy:'demo4.uniqore.pro', since:daysAgo(40)},
      {id:'c5', name:'ГрузЛогистик', niche:'Логистика', recipe:'logistics', theme:'graphite-pro', status:'building', value:1200, mrr:0, health:'good', manager:'Стас Гринёв', deploy:'—', since:daysAgo(4)},
      {id:'c6', name:'Магазин кроссовок', niche:'E-commerce', recipe:'ecommerce', theme:'midnight-violet', status:'live', value:1200, mrr:0, health:'good', manager:'Эвелина Марчук', deploy:'demo6.uniqore.pro', since:daysAgo(16)},
      {id:'c7', name:'Бургер «Классик»', niche:'Ресторан', recipe:'restaurant', theme:'sunset-warm', status:'live', value:1200, mrr:500, health:'good', manager:'Максим Орлов', deploy:'demo7.uniqore.pro', since:daysAgo(11)},
      {id:'c8', name:'FitStudio', niche:'Фитнес', recipe:'fitness', theme:'arctic-light', status:'building', value:1200, mrr:0, health:'good', manager:'Вадим Лыков', deploy:'—', since:daysAgo(2)},
      {id:'c9', name:'Agency CRM', niche:'Агентство', recipe:'agency', theme:'emerald-corporate', status:'onboarding', value:1200, mrr:0, health:'warn', manager:'Полина Швец', deploy:'—', since:daysAgo(1)},
    ];

    // ── ПАЙПЛАЙН сделок (лид → запуск) ──────────────────────────────────
    const deals = [
      {id:'d1', client:'Барбершоп «Бородач»',  niche:'Барбершоп',   stage:'lead',      value:1200, manager:'Максим Орлов',  updatedAt:daysAgo(0)},
      {id:'d2', client:'Стоматология «Улыбка»', niche:'Стоматология',stage:'lead',      value:1200, manager:'Роман Дегтярёв',     updatedAt:daysAgo(0)},
      {id:'d3', client:'Автосервис «Гараж №1»', niche:'Автосервис',  stage:'qualified', value:1200, manager:'Эвелина Марчук',    updatedAt:daysAgo(1)},
      {id:'d4', client:'Салон «Афродита»',      niche:'Красота',     stage:'qualified', value:1200, manager:'Максим Орлов',  updatedAt:daysAgo(1)},
      {id:'d5', client:'Юр. услуги «Аргумент»', niche:'Юр. услуги',  stage:'demo',      value:1200, manager:'Полина Швец', updatedAt:daysAgo(2)},
      {id:'d6', client:'Клининг «Блеск»',       niche:'Клининг',     stage:'demo',      value:1200, manager:'Стас Гринёв',  updatedAt:daysAgo(0)},
      {id:'d7', client:'Цветы «Флора»',         niche:'Цветы',       stage:'payment',   value:1200, manager:'Роман Дегтярёв',     updatedAt:daysAgo(1)},
      {id:'d8', client:'Фитнес «Атлет»',        niche:'Фитнес',      stage:'payment',   value:1200, manager:'Максим Орлов',  updatedAt:daysAgo(0)},
      {id:'d9', client:'ГрузЛогистик',          niche:'Логистика',   stage:'building',  value:1200, manager:'Стас Гринёв',  updatedAt:daysAgo(4)},
      {id:'d10',client:'FitStudio',             niche:'Фитнес',      stage:'building',  value:1200, manager:'Вадим Лыков',   updatedAt:daysAgo(2)},
      {id:'d11',client:'Бургер «Классик»',      niche:'Ресторан',    stage:'live',      value:1200, manager:'Максим Орлов',  updatedAt:daysAgo(11)},
      {id:'d12',client:'Магазин кроссовок',     niche:'E-commerce',  stage:'live',      value:1200, manager:'Эвелина Марчук',    updatedAt:daysAgo(16)},
    ];

    // ── СЧЕТА / КАССЫ ───────────────────────────────────────────────────
    const accounts = [
      {id:'ac1', name:'Тинькофф Бизнес', type:'bank',   balance:42800, cur:'$'},
      {id:'ac2', name:'Наличная касса',  type:'cash',   balance:3200,  cur:'$'},
      {id:'ac3', name:'USDT кошелёк',     type:'crypto', balance:11400, cur:'$'},
      {id:'ac4', name:'Резервный фонд',   type:'bank',   balance:15000, cur:'$'},
    ];

    // ── ФИНАНСЫ (месяц) ─────────────────────────────────────────────────
    const finance = {
      income:[ {cat:'Продажи CRM', amount:96000, note:'80 × $1 200'}, {cat:'Поддержка (MRR)', amount:4000, note:'абонплата клиентов'} ],
      expenses:[ {cat:'Выплаты менеджерам', amount:8000, note:'$100 × сделка'}, {cat:'Зарплаты команды', amount:14000, note:'производство, поддержка, маркетинг'}, {cat:'Сервер / инфра', amount:180, note:'DigitalOcean'}, {cat:'Инструменты / API', amount:600, note:'Claude, домены'}, {cat:'Налоги (УСН 6%)', amount:6000, note:'с оборота'}, {cat:'Прочее', amount:150, note:''} ],
      months:[ {label:'Фев',rev:41000}, {label:'Мар',rev:54000}, {label:'Апр',rev:63000}, {label:'Май',rev:76000}, {label:'Июн',rev:88000}, {label:'Июл',rev:100000} ],
      subscriptions:[ {name:'Claude / API', amount:120, next:daysAgo(-4)}, {name:'DigitalOcean', amount:48, next:daysAgo(-9)}, {name:'Домены (5)', amount:12, next:daysAgo(-1)}, {name:'Figma', amount:15, next:daysAgo(-18)} ],
      taxes:{ rate:6, base:100000, amount:6000, due:daysAgo(-12) },
      receivables:[ {client:'Медлайн · Клиника', amount:900, days:14}, {client:'Бургер «Классик»', amount:600, days:5}, {client:'Аренда Норд-Сити', amount:1300, days:2} ],
      operations:[
        {id:uid('o'),date:iso(today0()+9*36e5),type:'income',cat:'Оплата CRM',amount:1200,acc:'Тинькофф',note:'Магазин кроссовок'},
        {id:uid('o'),date:iso(today0()+7*36e5),type:'expense',cat:'Выплата',amount:300,acc:'USDT',note:'Максим Орлов'},
        {id:uid('o'),date:iso(daysAgo(1)+15*36e5),type:'income',cat:'Оплата CRM',amount:1200,acc:'Тинькофф',note:'Бургер Классик'},
        {id:uid('o'),date:iso(daysAgo(1)+11*36e5),type:'expense',cat:'Подписка',amount:120,acc:'Тинькофф',note:'Claude API'},
        {id:uid('o'),date:iso(daysAgo(2)+18*36e5),type:'income',cat:'Абонплата',amount:120,acc:'Тинькофф',note:'Гринвуд'},
        {id:uid('o'),date:iso(daysAgo(2)+10*36e5),type:'expense',cat:'Зарплата',amount:1400,acc:'Тинькофф',note:'Влад — сборка'},
      ],
    };

    // ── СОТРУДНИКИ (полные карточки) ────────────────────────────────────
    const employees = [
      ...managers.filter(m=>m.status==='active').map((m,i)=>({ id:'e_'+m.id, name:m.name, role:'Менеджер продаж', dept:'Продажи', color:m.color, salary:500, bonus:(m.dealsToday+m.dealsYesterday)*CUT, fine:0, kpi:Math.min(60+m.dealsYesterday*10,100), since:m.joinedAt, status:'active', access:['CRM: свои лиды'], equipment:['Ноутбук','Гарнитура'], mgrId:m.id })),
      {id:'e_p1', name:'Юрий Кравцов', role:'Сборщик CRM', dept:'Производство', color:'#63d7ff', salary:1400, bonus:200, fine:0, kpi:88, since:daysAgo(45), status:'active', access:['factory-v2','Сервер деплой'], equipment:['MacBook Pro']},
      {id:'e_s1', name:'Марта Ольхова', role:'Поддержка клиентов', dept:'Поддержка', color:'#4fe3b0', salary:900, bonus:80, fine:0, kpi:96, since:daysAgo(30), status:'active', access:['CRM клиентов: read'], equipment:['Ноутбук','Гарнитура']},
      {id:'e_m1', name:'Богдан Реут', role:'Маркетолог', dept:'Маркетинг', color:'#ff9f5a', salary:1100, bonus:150, fine:0, kpi:82, since:daysAgo(22), status:'active', access:['Реклама','Аналитика'], equipment:['Ноутбук']},
      {id:'e_f1', name:'Ирина Стахова', role:'Бухгалтер', dept:'Финансы', color:'#e05bd1', salary:800, bonus:0, fine:0, kpi:94, since:daysAgo(60), status:'active', access:['Финансы: полный'], equipment:['Ноутбук']},
      {id:'e_h1', name:'Гриша Панин', role:'Стажёр продаж', dept:'Продажи', color:'#ffc55a', salary:300, bonus:100, fine:20, kpi:54, since:daysAgo(6), status:'probation', access:['CRM: свои лиды'], equipment:['Гарнитура']},
    ];

    // ── ПРОЕКТЫ (производство) ──────────────────────────────────────────
    const projects = [
      {id:uid('pr'),name:'CRM ГрузЛогистик', client:'ГрузЛогистик', status:'active', stage:'Сборка', owner:'Юрий Кравцов', deadline:daysAgo(-3), cost:200, price:1200, progress:60, risk:'low', comments:3},
      {id:uid('pr'),name:'CRM FitStudio', client:'FitStudio', status:'active', stage:'Онбординг', owner:'Юрий Кравцов', deadline:daysAgo(-6), cost:200, price:1200, progress:25, risk:'med', comments:1},
      {id:uid('pr'),name:'CRM Agency', client:'Agency', status:'active', stage:'Research', owner:'Матвей', deadline:daysAgo(1), cost:200, price:1200, progress:10, risk:'high', comments:5},
      {id:uid('pr'),name:'Доработки Гринвуд', client:'Гринвуд', status:'active', stage:'Правки', owner:'Юрий Кравцов', deadline:daysAgo(-2), cost:80, price:400, progress:80, risk:'low', comments:2},
      {id:uid('pr'),name:'CRM Магазин', client:'Магазин', status:'done', stage:'Запущен', owner:'Юрий Кравцов', deadline:daysAgo(9), cost:200, price:1200, progress:100, risk:'low', comments:0},
    ];

    // ── ОТДЕЛЫ ──────────────────────────────────────────────────────────
    const departments = [
      {key:'sales',   name:'Продажи',      status:'good', lead:'Матвей',    icon:'headset'},
      {key:'prod',    name:'Производство', status:'warn', lead:'Юрий',      icon:'case'},
      {key:'support', name:'Поддержка',    status:'good', lead:'Марта',     icon:'users'},
      {key:'mkt',     name:'Маркетинг',    status:'good', lead:'Богдан',    icon:'trend'},
      {key:'hr',      name:'HR',           status:'good', lead:'Матвей',    icon:'users'},
      {key:'fin',     name:'Финансы',      status:'good', lead:'Ирина',     icon:'coins'},
    ];

    // ── БАЗА ЗНАНИЙ (внутренний Notion) ─────────────────────────────────
    const knowledge = [
      {id:uid('k'),cat:'Скрипты', title:'Скрипт холодного звонка', updated:daysAgo(2), body:'Приветствие → квалификация → оффер ($1200 разово) → отработка «дорого» → закрытие на WhatsApp.', pinned:true},
      {id:uid('k'),cat:'Регламенты', title:'Регламент отдела продаж', updated:daysAgo(5), body:'Смена 8 часов, лимит номеров динамический 20→80, статусы звонка, обязательный комментарий.'},
      {id:uid('k'),cat:'Инструкции', title:'Как собрать CRM за 40 минут', updated:daysAgo(8), body:'Рецепт factory-v2 → build.mjs → тема → деплой на прод-сервер → логин клиенту.'},
      {id:uid('k'),cat:'Шаблоны', title:'Шаблон коммерческого предложения', updated:daysAgo(11), body:'Боль → решение → что получит → цена/сроки → следующий шаг. До 400 слов.'},
      {id:uid('k'),cat:'Чек-листы', title:'Чек-лист запуска клиента', updated:daysAgo(3), body:'☐ Рецепт ☐ Данные ☐ Тема ☐ Логин ☐ Обучение ☐ Поддержка на 2 недели.'},
      {id:uid('k'),cat:'Обучение', title:'Онбординг нового менеджера', updated:daysAgo(6), body:'День 1: скрипт + прослушка. День 2: 20 звонков под контролем. День 3: своя смена.'},
      {id:uid('k'),cat:'Регламенты', title:'Политика выплат', updated:daysAgo(7), body:'$100 за закрытую сделку, выплата раз в неделю, без задержек. Штраф за слив базы — блок.'},
    ];

    // ── МАРКЕТИНГ ───────────────────────────────────────────────────────
    const marketing = {
      channels:[
        {name:'Холодные звонки', leads:120, spend:960,  sales:10, revenue:12000},
        {name:'Instagram',       leads:45,  spend:990,  sales:3,  revenue:3600},
        {name:'Telegram Ads',    leads:30,  spend:540,  sales:2,  revenue:2400},
        {name:'Сарафан',         leads:18,  spend:0,    sales:4,  revenue:4800},
        {name:'Авито',           leads:22,  spend:264,  sales:1,  revenue:1200},
      ],
    };

    // ── УВЕДОМЛЕНИЯ (центр событий) ─────────────────────────────────────
    const notifications = [
      {id:uid('n'),priority:'critical',type:'finance',title:'Пора провести выплаты',text:'$2 300 ждут 7 менеджеров',at:iso(today0()+17*36e5),read:false,pinned:true},
      {id:uid('n'),priority:'high',type:'client',title:'Клиника — риск ухода',text:'Не платит абонплату 14 дней',at:iso(today0()+13*36e5),read:false,pinned:false},
      {id:uid('n'),priority:'high',type:'sales',title:'4 сделки без активности',text:'Более 3 дней в пайплайне',at:iso(today0()+11*36e5),read:false,pinned:false},
      {id:uid('n'),priority:'high',type:'project',title:'CRM Agency — дедлайн прошёл',text:'Проект на этапе Research',at:iso(daysAgo(1)+16*36e5),read:false,pinned:false},
      {id:uid('n'),priority:'normal',type:'sales',title:'Данила закрыл 4 сделки',text:'Лимит вырос до 80/день',at:iso(daysAgo(1)+12*36e5),read:true,pinned:false},
      {id:uid('n'),priority:'normal',type:'hr',title:'2 кандидата на собеседование',text:'Завтра в 15:00',at:iso(daysAgo(1)+10*36e5),read:true,pinned:false},
      {id:uid('n'),priority:'normal',type:'finance',title:'Оплата от Магазина',text:'+$1 200 на Тинькофф',at:iso(daysAgo(2)+9*36e5),read:true,pinned:false},
    ];

    // ── ШТРАФЫ (дисциплина · owner + head) ──────────────────────────────
    const penalties = [
      {id:uid('pen'),targetId:'e_h1',targetType:'employee',name:'Гриша Панин',amount:20,reason:'Опоздание на смену на 40 мин',by:'Дмитрий Соснин',at:iso(daysAgo(1))},
    ];

    return { managers, leads, calls, payouts, revDays, tasks, daily, goals, doneLog, streak,
             clients, deals, finance, accounts, employees, projects, departments, knowledge, marketing, notifications, penalties,
             session:{ role:'admin', managerId:'m1' } };
  }

  /* ── dynamic daily limit (spec) ─────────────────────────────────────── */
  function limit(m){
    if(m.status==='blocked') return 0;
    let lim = 20;
    if(m.dealsYesterday >= 2) lim += 20;
    if(m.dealsYesterday >= 4) lim += 20;
    if(m.dryDays >= 3) lim = 20;          // 0 сделок 3 дня → сброс
    return Math.min(lim, 80);
  }

  /* ── state ──────────────────────────────────────────────────────────── */
  let S;
  function load(){ try{ S = JSON.parse(localStorage.getItem(KEY)); }catch(e){ S=null; } if(!S||!S.managers||!S.clients||!S.employees||!S.penalties||!S.projects||!S.notifications||!S.accounts){ S=seed(); save(); } syncFines(); return S; }
  function save(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){} }

  /* ── public API ─────────────────────────────────────────────────────── */
  const API = {
    STATUS, SERVICE, CUT, NET,
    get s(){ return S; },
    load, save,
    reset(){ S = seed(); save(); return S; },
    hydrate(partial){ if(!S) load(); Object.assign(S, partial); syncFines(); return S; },

    session(){ return S.session; },
    setRole(role, managerId){ S.session.role=role; if(managerId) S.session.managerId=managerId; save(); },
    manager(id){ return S.managers.find(m=>m.id===id); },
    activeManagers(){ return S.managers.filter(m=>m.status==='active'); },
    limitFor(m){ return limit(typeof m==='string'?API.manager(m):m); },

    /* — команда руководителя продаж (head) — */
    ROLE_LABEL: { owner:'Владелец', head:'Руководитель продаж', manager:'Менеджер' },
    myTeam(headId){ return S.managers.filter(m=>m.teamLeadId===headId); },
    isMyTeamMember(headId, mgrId){ const m=API.manager(mgrId); return !!m && m.teamLeadId===headId; },
    heads(){ return S.managers.filter(m=>m.role==='head'); },
    plainManagers(){ return S.managers.filter(m=>m.role!=='head'); },

    /* — manager view — */
    leadsFor(mgrId){ return S.leads.filter(l=>l.managerId===mgrId); },
    calledCount(mgrId){ return S.leads.filter(l=>l.managerId===mgrId && l.status!=='new').length; },
    earned(mgrId){ return S.leads.filter(l=>l.managerId===mgrId && l.status==='deal').length * CUT; },

    /* — кабинет оператора: скрипт, возражения, поток, статы смены — */
    scriptStages(name){ return SCRIPT_STAGES.map(s=>({ ...s, text:s.text.replace('{name}', name||'менеджер') })); },
    objections(){ return Object.keys(OBJECTION_REPLIES); },
    objectionReply(o){ return OBJECTION_REPLIES[o] || OBJECTION_REPLIES['Другое']; },
    nextLead(mgrId){ return S.leads.find(l=>l.managerId===mgrId && l.status==='new') || null; },
    callbacksToday(mgrId){ return S.leads.filter(l=>l.managerId===mgrId && l.status==='callback').sort((a,b)=> new Date(a.callbackDate||0)-new Date(b.callbackDate||0)); },
    sessionStats(mgrId){
      const m=API.manager(mgrId); const mine=API.leadsFor(mgrId);
      const called=mine.filter(l=>l.status!=='new').length;
      const deals=mine.filter(l=>l.status==='deal').length;
      const meetings=mine.filter(l=>l.status==='meeting').length;
      const lim=limit(m); const goal=Math.max(3, Math.round(lim*0.15));
      return { called, deals, meetings, earned:deals*CUT, limit:lim, left:Math.max(0,lim-called), conv: called?deals/called*100:0, goal, goalPct: Math.min(100, goal?Math.round(deals/goal*100):0) };
    },

    saveCall(leadId,{status,comment,reason,callbackDate,stage,objection,duration}){
      const l = S.leads.find(x=>x.id===leadId); if(!l) return;
      l.status=status; l.comment=comment||''; l.reason=reason||''; l.callbackDate=callbackDate||null;
      l.stage=stage||''; l.objection=objection||''; l.duration=duration||0;
      l.calledAt=iso(Date.now()); l.updatedAt=l.calledAt; if(status==='deal') l.value=SERVICE;
      S.calls.unshift({id:uid('c'),leadId,managerId:l.managerId,status,comment,reason,stage:stage||'',objection:objection||'',duration:duration||0,callbackDate,createdAt:l.calledAt});
      if(status==='deal'){ const m=API.manager(l.managerId); if(m){ m.dealsToday++; recalcPayout(m.id); } }
      save();
    },

    /* — скоуп видимости по роли (owner: все · head: своя команда · manager: только себя) — */
    scopedManagerIds(){
      const s=S.session;
      if(s.role==='owner'||s.role==='admin') return API.activeManagers().map(m=>m.id);
      if(s.role==='head') return API.myTeam(s.managerId).map(m=>m.id);
      return [s.managerId];
    },

    /* — admin analytics (ids — опционально ограничить набором менеджеров, для head) — */
    adminStats(ids){
      const scope = ids ? new Set(ids) : null;
      const leadsScope = scope ? S.leads.filter(l=>scope.has(l.managerId)) : S.leads;
      const called = leadsScope.filter(l=>l.managerId && l.status!=='new').length;
      const deals  = leadsScope.filter(l=>l.status==='deal').length;
      const conv   = called? (deals/called*100):0;
      const revenue= deals*SERVICE;
      const payoutsScope = scope ? S.payouts.filter(p=>scope.has(p.managerId)) : S.payouts;
      const pending= payoutsScope.filter(p=>p.status==='pending').reduce((a,p)=>a+p.amount,0);
      const mgrScope = scope ? S.managers.filter(m=>scope.has(m.id)) : S.managers;
      const dealsToday = mgrScope.reduce((a,m)=>a+(m.dealsToday||0),0);
      return { called, deals, dealsToday, conv, revenue, net:deals*NET, pending, active: scope?mgrScope.length:API.activeManagers().length };
    },
    leaderboard(ids){
      const list = ids ? S.managers.filter(m=>ids.includes(m.id)) : API.activeManagers();
      return list.map(m=>{
        const mine = API.leadsFor(m.id);
        const calls = mine.filter(l=>l.status!=='new').length;
        const deals = mine.filter(l=>l.status==='deal').length;
        return { ...m, calls, deals, conv: calls?deals/calls*100:0, earned:deals*CUT, limit:limit(m) };
      }).sort((a,b)=>b.deals-a.deals || b.conv-a.conv);
    },
    revenueSeries(){ return S.revDays; },
    payouts(ids){
      const list = ids ? S.payouts.filter(p=>ids.includes(p.managerId)) : S.payouts;
      return list.map(p=>({...p, name:(API.manager(p.managerId)||{}).name||'—', color:(API.manager(p.managerId)||{}).color}));
    },
    markPaid(id){ const p=S.payouts.find(x=>x.id===id); if(p){ p.status='paid'; save(); } },

    activity(){
      return S.calls.slice(0,14).map(c=>({ ...c, biz:(S.leads.find(l=>l.id===c.leadId)||{}).business||'Лид', mgr:(API.manager(c.managerId)||{}).name||'—' }));
    },

    poolCount(){ return S.leads.filter(l=>l.status==='pool').length; },
    assignPool(mgrId, n, niche){
      let pool = S.leads.filter(l=>l.status==='pool');
      if(niche && niche!=='all') pool = pool.filter(l=>l.niche===niche);
      pool = pool.slice(0,n);
      const m = API.manager(mgrId);
      pool.forEach(l=>{ l.managerId=mgrId; l.status='new'; if(m) l.city=m.city; l.assignedAt=iso(Date.now()); if(!l.pains||!l.pains.length) l.pains=pickPains(l.niche); });
      save(); return pool.length;
    },
    poolByNiche(){ const c={}; S.leads.filter(l=>l.status==='pool').forEach(l=>{ c[l.niche]=(c[l.niche]||0)+1; }); return c; },
    pickPains, nicheList: Object.keys(NICHE_PAINS),
    addLead(o){ S.leads.unshift({id:uid('l'),status:'pool',managerId:null,value:0,comment:'',reason:'',callbackDate:null,assignedAt:null,calledAt:null,updatedAt:iso(Date.now()),pains:pickPains(o.niche),...o}); save(); },
    blockManager(id){ const m=API.manager(id); if(m){ m.status=m.status==='blocked'?'active':'blocked'; save(); } },

    /* — добавить менеджера прямо из CRM (демо: локально; cloud.js переопределяет на реальный вызов) — */
    async inviteManager({name, city, teamLeadId}){
      const AV=['#8b7cf6','#63d7ff','#4fe3b0','#ff9f5a','#e05bd1','#5b8cff','#ffc55a','#ff6b81'];
      const password = Array.from({length:12},()=>'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'[Math.floor(Math.random()*57)]).join('');
      const translit = {а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'e',ж:'zh',з:'z',и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'c',ч:'ch',ш:'sh',щ:'sch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya'};
      const slug = (name||'manager').toLowerCase().split('').map(c=>translit[c]??c).join('').replace(/[^a-z0-9]/g,'').slice(0,20) || 'manager';
      const email = `${slug}.${Date.now().toString(36).slice(-5)}@uqcmd.internal`;
      const id = uid('m');
      S.managers.push({
        id, name, email, city: city||'—', status:'active', joinedAt:iso(Date.now()),
        color:AV[S.managers.length%AV.length], role:'manager',
        teamLeadId: teamLeadId || (S.session.role==='head' ? S.session.managerId : null),
        dealsToday:0, dealsYesterday:0, dryDays:0, calledToday:0,
      });
      save();
      return { email, password, name };
    },

    /* — progress board — */
    tasks(){ return S.tasks; },
    moveTask(id,col){ const t=S.tasks.find(x=>x.id===id); if(t){ t.column=col; save(); } },
    addTask(title,col){ if(!title.trim())return; S.tasks.push({id:uid('t'),title:title.trim(),column:col||'backlog',frog:false,owner:'Матвей'}); save(); },
    toggleFrog(id){ const t=S.tasks.find(x=>x.id===id); if(t){ t.frog=!t.frog; save(); } },
    delTask(id){ S.tasks=S.tasks.filter(x=>x.id!==id); save(); },

    daily(){ return S.daily; },
    toggleDaily(id){ const d=S.daily.find(x=>x.id===id); if(d){ d.done=!d.done; save(); } },
    addDaily(text){ if(!text.trim()||S.daily.length>=6)return; S.daily.push({id:uid('d'),text:text.trim(),frog:false,done:false}); save(); },
    reorderDaily(id,targetId){ const a=S.daily; const from=a.findIndex(x=>x.id===id), to=a.findIndex(x=>x.id===targetId); if(from<0||to<0||from===to)return; const [m]=a.splice(from,1); a.splice(to,0,m); save(); },

    goals(){ return S.goals; },
    bumpKR(i,delta){ const k=S.goals.krs[i]; if(k){ k.current=Math.max(0,k.current+delta); save(); } },

    doneLog(){ return S.doneLog; },
    addDone(text,who){ if(!text.trim())return; S.doneLog.unshift({id:uid('g'),text:text.trim(),who:who||'Матвей',at:iso(Date.now())}); save(); },

    streak(){ return S.streak; },

    /* — клиенты — */
    DSTAGES, CSTATUS,
    clients(){ return S.clients; },
    client(id){ return S.clients.find(c=>c.id===id); },
    clientStats(){
      const live=S.clients.filter(c=>c.status==='live'||c.status==='support').length;
      const building=S.clients.filter(c=>c.status==='building'||c.status==='onboarding').length;
      const mrr=S.clients.reduce((a,c)=>a+(c.mrr||0),0);
      const ltv=S.clients.reduce((a,c)=>a+(c.value||0),0);
      return { total:S.clients.length, live, building, mrr, ltv, atRisk:S.clients.filter(c=>c.health!=='good').length };
    },

    /* — пайплайн сделок — */
    deals(){ return S.deals; },
    dealsByStage(stage){ return S.deals.filter(d=>d.stage===stage); },
    moveDeal(id,stage){ const d=S.deals.find(x=>x.id===id); if(d){ d.stage=stage; d.updatedAt=iso(Date.now()); save(); } },
    pipelineValue(){ return S.deals.filter(d=>d.stage!=='live').reduce((a,d)=>a+d.value,0); },
    pipelineOpen(){ return S.deals.filter(d=>!['live'].includes(d.stage)).length; },
    addDeal(o){ S.deals.unshift({id:uid('d'),stage:'lead',value:SERVICE,manager:'—',updatedAt:iso(Date.now()),...o}); save(); },

    /* — финансы (месяц) — */
    finance(){
      const f=S.finance;
      const income=f.income.reduce((a,x)=>a+x.amount,0);
      const expenses=f.expenses.reduce((a,x)=>a+x.amount,0);
      const profit=income-expenses;
      return { ...f, income, expenses, profit, margin: income? profit/income*100:0, incomeRows:f.income, expenseRows:f.expenses };
    },

    /* — сводка по бизнесу (дашборд владельца) — */
    businessStats(){
      const cs=API.clientStats();
      const sales=UQ_salesSnapshot();
      return {
        revenueMonth: S.finance.months[S.finance.months.length-1].rev,
        activeClients: cs.live,
        pipelineValue: API.pipelineValue(),
        pipelineOpen: API.pipelineOpen(),
        mrr: cs.mrr,
        dealsWonMonth: S.deals.filter(d=>d.stage==='live').length + 6,
        salesToday: sales.dealsToday,
        conv: sales.conv,
      };
    },

    /* — счета / касса — */
    accounts(){ return S.accounts; },
    cash(){ return S.accounts.reduce((a,x)=>a+x.balance,0); },

    /* — финансовое здоровье (главная владельца) — */
    financeHealth(){
      const f=API.finance(), cash=API.cash();
      const recv=S.finance.receivables.reduce((a,r)=>a+r.amount,0);
      const miw=API.pipelineValue();
      const prob={lead:.1,qualified:.3,demo:.5,payment:.8,building:1};
      const expected=S.deals.filter(d=>d.stage!=='live').reduce((a,d)=>a+d.value*(prob[d.stage]||0),0);
      const monthExp=f.expenses, dayExp=Math.round(monthExp/30);
      return { cash, netProfit:f.profit, expected:Math.round(expected), dayExp, monthExp,
        receivables:recv, moneyInWork:miw, forecast:Math.round(f.income+expected*.5),
        burn:monthExp, cashFlow:f.income-f.expenses, income:f.income, margin:f.margin };
    },
    subscriptions(){ return S.finance.subscriptions; },
    operations(){ return S.finance.operations; },
    receivables(){ return S.finance.receivables; },
    taxes(){ return S.finance.taxes; },

    /* — сотрудники — */
    employees(){ return S.employees; },
    employee(id){ return S.employees.find(e=>e.id===id); },
    employeeStats(){ const e=S.employees; const gross=e.reduce((a,x)=>a+x.salary+x.bonus,0); const fines=e.reduce((a,x)=>a+API.finesFor(x.id),0); return { total:e.length, payroll:gross, fines, net:gross-fines, avgKpi:Math.round(e.reduce((a,x)=>a+x.kpi,0)/e.length), probation:e.filter(x=>x.status==='probation').length }; },

    /* — проекты — */
    projects(){ return S.projects; },
    projectStats(){ const p=S.projects; const active=p.filter(x=>x.status==='active'); return { active:active.length, done:p.filter(x=>x.status==='done').length, overdue:active.filter(x=>x.deadline&&new Date(x.deadline)<Date.now()).length, profit:p.reduce((a,x)=>a+(x.price-x.cost),0), value:active.reduce((a,x)=>a+x.price,0) }; },
    moveProjectStage(){},
    bumpProjectProgress(id){ const p=S.projects.find(x=>x.id===id); if(!p||p.status==='done') return; p.progress=Math.min(100,p.progress+10); if(p.progress>=100){ p.status='done'; p.stage='Запущен'; } save(); },

    /* — отделы — */
    departments(){
      const sales=UQ_salesSnapshot(), f=API.finance();
      const overdue=S.projects.filter(p=>p.status==='active'&&p.deadline&&new Date(p.deadline)<Date.now()).length;
      const map={
        sales:['good',[['Сделок',sales.dealsToday],['Конверсия',sales.conv.toFixed(0)+'%'],['Активных',API.activeManagers().length]]],
        prod:[overdue?'warn':'good',[['Проектов',S.projects.filter(p=>p.status==='active').length],['Просрочено',overdue]]],
        support:['good',[['Клиентов',S.clients.filter(c=>c.status==='live'||c.status==='support').length],['SLA','96%']]],
        mkt:['good',[['Лидов/день',12],['ROI','x4.2']]],
        hr:['good',[['Сотрудников',S.employees.length],['Найм',2]]],
        fin:['good',[['Прибыль','$'+f.profit.toLocaleString('en-US')],['Маржа',f.margin.toFixed(0)+'%']]],
      };
      return S.departments.map(d=>({ ...d, status:(map[d.key]||[])[0]||d.status, metrics:(map[d.key]||[])[1]||[] }));
    },

    /* — база знаний — */
    knowledge(){ return S.knowledge; },
    knowledgeCats(){ const c={}; S.knowledge.forEach(k=>c[k.cat]=(c[k.cat]||0)+1); return Object.keys(c).map(cat=>({cat,n:c[cat]})); },

    /* — маркетинг — */
    marketing(){
      return S.marketing.channels.map(c=>({ ...c, cpl: c.leads?Math.round(c.spend/c.leads):0, cac: c.sales?Math.round(c.spend/c.sales):0, roi: c.spend? (c.revenue-c.spend)/c.spend :null, conv: c.leads?c.sales/c.leads*100:0 }));
    },

    /* — уведомления (центр событий) — */
    notifications(){ return S.notifications; },
    notifUnread(){ return S.notifications.filter(n=>!n.read).length; },
    notifCritical(){ return S.notifications.filter(n=>n.priority==='critical'&&!n.read).length; },
    markNotif(id){ const n=S.notifications.find(x=>x.id===id); if(n){ n.read=true; save(); } },
    markAllNotif(){ S.notifications.forEach(n=>n.read=true); save(); },
    pinNotif(id){ const n=S.notifications.find(x=>x.id===id); if(n){ n.pinned=!n.pinned; save(); } },

    /* — AI-аналитик (сам находит проблемы) — */
    aiInsights(){
      const lb=API.leaderboard(), sales=UQ_salesSnapshot(), f=API.finance();
      const best=lb[0]||{name:'—',deals:0,conv:0};
      const stale=S.deals.filter(d=>['qualified','demo','payment'].includes(d.stage)&&(Date.now()-new Date(d.updatedAt))>3*DAY).length;
      const risk=S.clients.filter(c=>c.health!=='good');
      const pending=S.payouts.filter(p=>p.status==='pending').reduce((a,p)=>a+p.amount,0);
      const overdueProj=S.projects.filter(p=>p.status==='active'&&p.deadline&&new Date(p.deadline)<Date.now());
      const out=[];
      out.push({level:'good', icon:'trophy', text:`Лучший сегодня — ${best.name}: ${best.deals} сделок, конверсия ${best.conv.toFixed(0)}%.`});
      out.push({level:'good', icon:'trend', text:`Конверсия ${sales.conv.toFixed(1)}% — на 2.1% выше прошлой недели.`});
      if(pending) out.push({level:'warn', icon:'wallet', text:`Пора провести выплаты менеджерам — $${pending.toLocaleString('en-US')}.`, action:'payouts'});
      if(stale) out.push({level:'warn', icon:'bolt', text:`${stale} сделки без активности более 3 дней — надо дожать.`, action:'pipeline'});
      if(risk.length) out.push({level:'critical', icon:'users', text:`${risk.length} клиента рискуют уйти: ${risk.map(c=>c.name.split(' ')[0]).join(', ')}.`, action:'clients'});
      if(overdueProj.length) out.push({level:'critical', icon:'case', text:`${overdueProj.length} проект просрочен: «${overdueProj[0].name}».`, action:'projects'});
      out.push({level:'info', icon:'coins', text:`Прибыль месяца $${f.profit.toLocaleString('en-US')}, маржа ${f.margin.toFixed(0)}% — здоровая.`});
      out.push({level:'good', icon:'spark', text:`Средний чек $${SERVICE.toLocaleString('en-US')} держится. Дебиторка снижается.`});
      return out;
    },

    /* — требует внимания — */
    attention(){
      const items=[];
      const pending=S.payouts.filter(p=>p.status==='pending');
      if(pending.length) items.push({level:'critical',icon:'wallet',title:'Провести выплаты',sub:`$${pending.reduce((a,p)=>a+p.amount,0).toLocaleString('en-US')} · ${pending.length} чел.`,action:'payouts'});
      const risk=S.clients.filter(c=>c.health!=='good');
      if(risk.length) items.push({level:'high',icon:'users',title:`${risk.length} клиента в зоне риска`,sub:risk.map(c=>c.name.split(' ')[0]).join(', '),action:'clients'});
      const stale=S.deals.filter(d=>['qualified','demo','payment'].includes(d.stage)&&(Date.now()-new Date(d.updatedAt))>3*DAY);
      if(stale.length) items.push({level:'high',icon:'trend',title:`${stale.length} сделки застряли`,sub:'Нет активности 3+ дня',action:'pipeline'});
      const op=S.projects.filter(p=>p.status==='active'&&p.deadline&&new Date(p.deadline)<Date.now());
      if(op.length) items.push({level:'high',icon:'case',title:`${op.length} проект просрочен`,sub:`«${op[0].name}»`,action:'projects'});
      const ot=S.tasks.filter(t=>t.due&&t.column!=='done'&&new Date(t.due)<today0());
      if(ot.length) items.push({level:'normal',icon:'bolt',title:`${ot.length} задача просрочена`,sub:'Канбан команды',action:'progress'});
      return items;
    },

    /* — что изменилось со вчера — */
    whatChanged(){
      return [
        {label:'Сделок сегодня', val:'+2', dir:'up', note:'к вчера'},
        {label:'Выручка месяца', val:'+$1 200', dir:'up', note:''},
        {label:'Новых лидов', val:'+18', dir:'up', note:''},
        {label:'Дебиторка', val:'−$600', dir:'up', note:'меньше долгов'},
        {label:'Клиентов в риске', val:'+1', dir:'down', note:'Клиника'},
      ];
    },
    bestEmployee(){ const lb=API.leaderboard(); return lb[0]; },

    /* — штрафы (owner + head) — */
    penalties(){ return S.penalties||[]; },
    penaltiesFor(id){ return (S.penalties||[]).filter(p=>p.targetId===id).sort((a,b)=>new Date(b.at)-new Date(a.at)); },
    finesFor(id){ return (S.penalties||[]).filter(p=>p.targetId===id).reduce((a,p)=>a+p.amount,0); },
    empPayout(e){ return (e.salary||0)+(e.bonus||0)-API.finesFor(e.id); },
    addPenalty({targetId,targetType,name,amount,reason,by}){
      amount=Math.max(0,Math.round(+amount||0)); if(!targetId||!amount) return null;
      const pen={id:uid('pen'),targetId,targetType:targetType||'employee',name:name||'',amount,reason:reason||'',by:by||'Владелец',at:iso(Date.now())};
      (S.penalties||(S.penalties=[])).push(pen); syncFines(); save(); return pen;
    },
    delPenalty(id){ S.penalties=(S.penalties||[]).filter(p=>p.id!==id); syncFines(); save(); },

    /* — план дня сотрудника (панель команды) — */
    dayPlanFor(e){
      if(e.mgrId){ const m=API.manager(e.mgrId); if(m){ const called=API.calledCount(m.id), lim=limit(m); const mine=API.leadsFor(m.id);
        return { type:'sales', called, limit:lim, left:Math.max(0,lim-called), deals:mine.filter(l=>l.status==='deal').length, callbacks:mine.filter(l=>l.status==='callback').length, interested:mine.filter(l=>l.status==='interested').length }; } }
      const first=(e.name||'').split(' ')[0];
      return { type:'tasks', tasks:S.tasks.filter(t=>t.owner===first||t.owner===e.name) };
    },

    /* — KPI менеджера + умная авто-раздача номеров по KPI — */
    managerKpi(m){ m=typeof m==='string'?API.manager(m):m; if(!m) return 0;
      const mine=API.leadsFor(m.id); const calls=mine.filter(l=>l.status!=='new').length; const deals=mine.filter(l=>l.status==='deal').length;
      const conv=calls?deals/calls:0; const s=conv*250 + deals*12 + ((m.calledToday||0)>0?12:0) - (m.dryDays||0)*12;
      return Math.max(0,Math.min(100,Math.round(s)));
    },
    suggestNumbers(m){ m=typeof m==='string'?API.manager(m):m; if(!m||m.status==='blocked') return 0;
      if((m.dryDays||0)>=3) return 12; // остыл — малый объём для восстановления, без выгорания
      const k=API.managerKpi(m); return Math.max(10,Math.min(40,Math.round(10+k/100*30)));
    },
    suggestDistribution(ids){
      const base = ids ? S.managers.filter(m=>ids.includes(m.id)) : API.activeManagers();
      return base.filter(m=>m.role!=='head' && m.status==='active').map(m=>({
        id:m.id, name:m.name, color:m.color, city:m.city, kpi:API.managerKpi(m), dryDays:m.dryDays||0,
        dealsYesterday:m.dealsYesterday||0, queue:API.leadsFor(m.id).filter(l=>l.status==='new').length,
        suggested:API.suggestNumbers(m), limit:limit(m),
      })).sort((a,b)=>b.kpi-a.kpi);
    },
    distributeNumbers(list){ let total=0; (list||[]).forEach(x=>{ const n=Math.max(0,+x.n||0); if(n>0) total+=API.assignPool(x.id,n); }); return total; },

    /* — финансы: операции вручную + разбивка расходов (owner) — */
    addOperation({type,cat,amount,acc,note}){
      amount=Math.max(0,Math.round(+amount||0)); if(!amount) return null;
      const f=S.finance; type = type==='income'?'income':'expense';
      const op={id:uid('o'),date:iso(Date.now()),type,cat:cat||'Прочее',amount,acc:acc||(S.accounts[0]||{}).name||'—',note:note||''};
      f.operations.unshift(op);
      const rows = type==='income'?f.income:f.expenses; const row=rows.find(r=>r.cat===op.cat);
      if(row) row.amount+=amount; else rows.push({cat:op.cat,amount,note:note||''});
      const a=S.accounts.find(x=>x.name===op.acc); if(a) a.balance += type==='income'?amount:-amount;
      save(); return op;
    },
    delOperation(id){ const f=S.finance; const i=f.operations.findIndex(o=>o.id===id); if(i<0) return; const op=f.operations[i];
      const rows=op.type==='income'?f.income:f.expenses; const row=rows.find(r=>r.cat===op.cat);
      if(row){ row.amount=Math.max(0,row.amount-op.amount); if(!row.amount) rows.splice(rows.indexOf(row),1); }
      const a=S.accounts.find(x=>x.name===op.acc); if(a) a.balance -= op.type==='income'?op.amount:-op.amount;
      f.operations.splice(i,1); save();
    },
    expenseBreakdown(){ const f=API.finance(); const tot=f.expenses||1; return f.expenseRows.slice().sort((a,b)=>b.amount-a.amount).map(r=>({...r,pct:r.amount/tot*100})); },
    financeCats(type){ const rows=type==='income'?S.finance.income:S.finance.expenses; return [...new Set(rows.map(r=>r.cat))]; },

    /* — utils exposed — */
    fmtDay, isToday, uid,
  };

  function syncFines(){
    if(!S) return; if(!S.penalties) S.penalties=[];
    const sum={}; S.penalties.forEach(p=>{ sum[p.targetId]=(sum[p.targetId]||0)+p.amount; });
    (S.employees||[]).forEach(e=>{ e.fine=sum[e.id]||0; });
    (S.managers||[]).forEach(m=>{ m.fine=sum[m.id]||0; });
  }

  function UQ_salesSnapshot(){
    const called=S.leads.filter(l=>l.managerId && l.status!=='new').length;
    const deals=S.leads.filter(l=>l.status==='deal').length;
    return { called, deals, dealsToday:S.managers.reduce((a,m)=>a+(m.dealsToday||0),0), conv: called?deals/called*100:0 };
  }

  function recalcPayout(mgrId){
    const deals = API.leadsFor(mgrId).filter(l=>l.status==='deal').length;
    let p = S.payouts.find(x=>x.managerId===mgrId && x.status==='pending');
    if(!p){ p={id:uid('p'),managerId:mgrId,deals:0,amount:0,status:'pending',period:'Текущая неделя',createdAt:iso(Date.now())}; S.payouts.push(p); }
    p.deals=deals; p.amount=deals*CUT;
  }

  window.UQ = API;
})();
