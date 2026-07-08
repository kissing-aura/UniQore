/* ============================================================================
   UNIQORE COMMAND — Application (views · router · interactions)
   ========================================================================== */
(function(){
  // cloud.js may have already loaded + hydrated S — don't clobber it with a fresh localStorage read
  const S = UQ.s || UQ.load();

  /* ── icons (inline, stroke=currentColor) ────────────────────────────── */
  const P = 'stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"';
  const ICONS = {
    grid:`<rect x="3" y="3" width="7" height="7" rx="1.5" ${P}/><rect x="14" y="3" width="7" height="7" rx="1.5" ${P}/><rect x="3" y="14" width="7" height="7" rx="1.5" ${P}/><rect x="14" y="14" width="7" height="7" rx="1.5" ${P}/>`,
    settings:`<circle cx="12" cy="12" r="3" ${P}/><path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4L5.3 5.3" ${P}/>`,
    phone:`<path d="M5 4h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5V17a2 2 0 0 1-2 2A14 14 0 0 1 3 6a2 2 0 0 1 2-2Z" ${P}/>`,
    users:`<circle cx="9" cy="8" r="3" ${P}/><path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 6a3 3 0 0 1 0 6M20.5 19a5 5 0 0 0-3-4.6" ${P}/>`,
    wallet:`<rect x="3" y="6" width="18" height="13" rx="2.5" ${P}/><path d="M3 9h18M16 13h2" ${P}/>`,
    upload:`<path d="M12 15V4M8 8l4-4 4 4M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" ${P}/>`,
    target:`<circle cx="12" cy="12" r="8" ${P}/><circle cx="12" cy="12" r="4" ${P}/><circle cx="12" cy="12" r=".6" fill="currentColor"/>`,
    check:`<path d="M4 12l5 5 11-11" ${P}/>`,
    bell:`<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10 20a2 2 0 0 0 4 0" ${P}/>`,
    shield:`<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z" ${P}/>`,
    arrow:`<path d="M7 17L17 7M9 7h8v8" ${P}/>`,
    copy:`<rect x="9" y="9" width="11" height="11" rx="2" ${P}/><path d="M5 15V5a2 2 0 0 1 2-2h8" ${P}/>`,
    plus:`<path d="M12 5v14M5 12h14" ${P}/>`,
    x:`<path d="M6 6l12 12M18 6L6 18" ${P}/>`,
    chev:`<path d="M6 9l6 6 6-6" ${P}/>`,
    flame:`<path d="M12 3s5 4 5 9a5 5 0 0 1-10 0c0-1.5.7-2.8 1.5-3.5C8.5 10 9 12 10 12c0-3 2-4 2-9Z" ${P}/>`,
    trophy:`<path d="M7 4h10v4a5 5 0 0 1-10 0V4ZM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M9 15h6l1 5H8l1-5Z" ${P}/>`,
    spark:`<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" ${P}/>`,
    list:`<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" ${P}/>`,
    search:`<circle cx="11" cy="11" r="7" ${P}/><path d="M20 20l-3.5-3.5" ${P}/>`,
    logout:`<path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 12H3m0 0l3-3m-3 3l3 3" ${P}/>`,
    bolt:`<path d="M13 2L4 14h7l-1 8 9-12h-7l1-8Z" ${P}/>`,
    trend:`<path d="M3 17l6-6 4 4 8-8M15 7h6v6" ${P}/>`,
    headset:`<path d="M4 13v-1a8 8 0 0 1 16 0v1M4 13v3a2 2 0 0 0 2 2h1v-6H6a2 2 0 0 0-2 2M20 13v3a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2" ${P}/>`,
    coins:`<ellipse cx="9" cy="7" rx="6" ry="3" ${P}/><path d="M3 7v5c0 1.7 2.7 3 6 3M15 10.5c3.3.3 6 1.6 6 3.5s-2.7 3.2-6 3.4M15 14v4c0 1.7 2.7 3 6 3" ${P}/>`,
    play:`<path d="M6 4l14 8-14 8V4Z" ${P}/>`,
    lock:`<rect x="4" y="10" width="16" height="11" rx="2" ${P}/><path d="M8 10V7a4 4 0 0 1 8 0v3" ${P}/>`,
    cal:`<rect x="3" y="5" width="18" height="16" rx="2" ${P}/><path d="M3 9h18M8 3v4M16 3v4" ${P}/>`,
    doc:`<path d="M6 3h8l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM14 3v4h4" ${P}/>`,
    dots:`<circle cx="5" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="19" cy="12" r="1.6" fill="currentColor"/>`,
    case:`<rect x="3" y="7" width="18" height="13" rx="2" ${P}/><path d="M8 7V5.5A2.5 2.5 0 0 1 10.5 3h3A2.5 2.5 0 0 1 16 5.5V7M3 12.5h18" ${P}/>`,
    pie:`<path d="M12 3a9 9 0 1 0 9 9h-9V3Z" ${P}/><path d="M14.5 3.5A7.5 7.5 0 0 1 20.5 9.5h-6V3.5Z" ${P}/>`,
    link:`<path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" ${P}/>`,
    globe:`<circle cx="12" cy="12" r="9" ${P}/><path d="M3 12h18M12 3a14 14 0 0 1 0 18A14 14 0 0 1 12 3Z" ${P}/>`,
    ai:`<path d="M12 3l1.5 4.2L18 9l-4.5 1.8L12 15l-1.5-4.2L6 9l4.5-1.8L12 3Z" ${P}/><path d="M18.5 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z" ${P}/>`,
    building:`<path d="M4 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16M14 21V10h5a1 1 0 0 1 1 1v10M3 21h18M7.5 8h3M7.5 12h3M7.5 16h3" ${P}/>`,
    layers:`<path d="M12 3l9 5-9 5-9-5 9-5ZM3 13l9 5 9-5M3 17l9 5 9-5" ${P}/>`,
    mega:`<path d="M4 10v4a1 1 0 0 0 1 1h2l7 4V5L7 9H5a1 1 0 0 0-1 1ZM18 9a3 3 0 0 1 0 6" ${P}/>`,
    book:`<path d="M5 4h11a2 2 0 0 1 2 2v13H7a2 2 0 0 0-2 2V4ZM5 19a2 2 0 0 0 2 2h11" ${P}/>`,
    flow:`<rect x="3" y="4" width="6" height="5" rx="1.5" ${P}/><rect x="15" y="15" width="6" height="5" rx="1.5" ${P}/><path d="M6 9v3.5a2.5 2.5 0 0 0 2.5 2.5H15" ${P}/>`,
    heart:`<path d="M12 20s-7-4.5-9-8.5C1.5 8 3.5 5 6.5 5c1.9 0 3 1 1.5 0 .6 0 2.6 1.5 4 3 1.4-1.5 3.4-3 4-3 3 0 5 3 3.5 6.5C19 15.5 12 20 12 20Z" ${P}/>`,
    idcard:`<rect x="3" y="5" width="18" height="14" rx="2" ${P}/><circle cx="8.5" cy="11" r="2.2" ${P}/><path d="M4.6 16a4 4 0 0 1 7.8 0M15 10h4M15 13.5h4" ${P}/>`,
  };
  const ic = n => `<svg class="ic" viewBox="0 0 24 24">${ICONS[n]||''}</svg>`;

  /* ── utils ──────────────────────────────────────────────────────────── */
  const $  = s => document.querySelector(s);
  const esc = s => (s==null?'':String(s)).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const usd = n => '$'+Math.round(n).toLocaleString('en-US');
  const initials = n => n.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  const av = (name,color,cls='') => `<span class="avatar ${cls}" style="background:linear-gradient(150deg,${color},${shade(color)})">${esc(initials(name))}</span>`;
  const shade = h => h; // gradient end kept same-ish; simple
  const ago = ts => { const d=(Date.now()-new Date(ts))/1000; if(d<60)return 'только что'; if(d<3600)return Math.floor(d/60)+' мин'; if(d<86400)return Math.floor(d/3600)+' ч'; return Math.floor(d/86400)+' дн'; };
  const pill = (label,kind='') => `<span class="pill ${kind?'pill--'+kind:''}">${label}</span>`;
  const statusPill = st => { const s=UQ.STATUS[st]; if(!s) return pill('Новый'); return `<span class="pill pill--${s.pill||''}"><span class="dotx"></span>${s.label}</span>`; };
  function toast(msg){ let t=$('#toast'); if(!t){ t=document.createElement('div'); t.id='toast'; t.className='toast'; document.body.appendChild(t);} t.innerHTML=ic('check')+esc(msg); requestAnimationFrame(()=>t.classList.add('show')); clearTimeout(t._h); t._h=setTimeout(()=>t.classList.remove('show'),2200); }

  /* ── nav config per role ────────────────────────────────────────────── */
  const NAV = {
    admin:[
      { group:'Обзор', items:[
        {v:'dashboard',label:'Командный центр',icon:'grid'},
        {v:'ai',label:'AI-аналитик',icon:'ai'},
        {v:'company',label:'Компания',icon:'building'},
        {v:'analytics',label:'Аналитика',icon:'pie'},
      ]},
      { group:'Продажи', items:[
        {v:'pipeline',label:'Пайплайн',icon:'trend'},
        {v:'leads',label:'Лиды',icon:'list'},
        {v:'managers',label:'Менеджеры',icon:'headset'},
        {v:'payouts',label:'Выплаты',icon:'wallet'},
        {v:'base',label:'База номеров',icon:'upload'},
      ]},
      { group:'Бизнес', items:[
        {v:'clients',label:'Клиенты',icon:'case'},
        {v:'projects',label:'Проекты',icon:'layers'},
        {v:'finance',label:'Финансы',icon:'coins'},
        {v:'marketing',label:'Маркетинг',icon:'mega'},
      ]},
      { group:'Команда', items:[
        {v:'employees',label:'Сотрудники',icon:'users'},
        {v:'knowledge',label:'База знаний',icon:'book'},
        {v:'automation',label:'Автоматизация',icon:'flow'},
      ]},
      { group:'Фокус дня', items:[
        {v:'progress',label:'Фокус дня',icon:'bolt'},
        {v:'goals',label:'Цели',icon:'target'},
        {v:'notifications',label:'Уведомления',icon:'bell'},
      ]},
      { group:'Система', items:[
        {v:'settings',label:'Управление',icon:'settings'},
      ]},
    ],
    head:[
      { group:'Обзор', items:[
        {v:'dashboard',label:'Дашборд команды',icon:'grid'},
      ]},
      { group:'Моя команда', items:[
        {v:'leads',label:'Лиды команды',icon:'list'},
        {v:'managers',label:'Мои менеджеры',icon:'headset'},
        {v:'employees',label:'Сотрудники',icon:'users'},
        {v:'payouts',label:'Выплаты команды',icon:'wallet'},
        {v:'base',label:'База номеров',icon:'upload'},
      ]},
      { group:'Клиенты и обучение', items:[
        {v:'clients',label:'Клиенты',icon:'case'},
        {v:'knowledge',label:'База знаний',icon:'book'},
      ]},
      { group:'Фокус дня', items:[
        {v:'progress',label:'Фокус дня',icon:'bolt'},
        {v:'goals',label:'Цели',icon:'target'},
      ]},
    ],
    manager:[
      { group:'Работа', items:[
        {v:'dialer',label:'Мои номера',icon:'headset'},
        {v:'results',label:'Результаты',icon:'trend'},
      ]},
      { group:'Фокус', items:[
        {v:'progress',label:'Задачи',icon:'bolt'},
        {v:'goals',label:'Цели',icon:'target'},
      ]},
    ],
  };
  const DEFAULT_VIEW = { admin:'dashboard', head:'dashboard', manager:'dialer' };
  let view = DEFAULT_VIEW[S.session.role];

  /* ── shell ──────────────────────────────────────────────────────────── */
  function mount(){
    document.body.innerHTML = `<div class="bloom"></div>
      <div class="app">
        <aside class="side" id="side"></aside>
        <main class="main" id="main"></main>
      </div>`;
    renderSide(); route(view);
  }

  function renderSide(){
    const role = S.session.role;
    const m = UQ.manager(S.session.managerId);
    const prod = !!window.UQ_CLOUD;                       // боевой режим (залогинен реальный юзер)
    const cloudProf = (UQ.cloud && UQ.cloud.profile) || null;
    const roleSub = role==='admin'?'Владелец · Uniqore':role==='head'?'Руководитель продаж':(m?esc(m.city)+' · менеджер':'менеджер');
    const whoName = cloudProf ? cloudProf.name : (role==='admin'?'Матвей':(m?m.name:'—'));
    const whoColor = cloudProf ? (cloudProf.color||'#8b7cf6') : (role==='admin'?'#8b7cf6':(m?m.color:'#8b7cf6'));
    const groups = NAV[role].map(g=>`
      <div class="nav__group">
        <div class="nav__label">${g.group}</div>
        ${g.items.map(it=>{
          const cnt = navCount(it.v);
          return `<a class="nav__item ${view===it.v?'active':''}" data-nav="${it.v}">${ic(it.icon)}<span>${it.label}</span>${cnt!=null?`<span class="nav__count">${cnt}</span>`:''}</a>`;
        }).join('')}
      </div>`).join('');
    $('#side').innerHTML = `
      <div class="brand">
        <span class="brand__mark">${ic('bolt')}</span>
        <span class="brand__name"><b>Uniqore</b> <span>Command</span></span>
      </div>
      ${groups}
      <div class="side__foot">
        ${!prod ? `<div class="roleswitch roleswitch--3">
          <button data-role="admin" class="${role==='admin'?'on':''}">Владелец</button>
          <button data-role="head" class="${role==='head'?'on':''}">Руковод.</button>
          <button data-role="manager" class="${role==='manager'?'on':''}">Менеджер</button>
        </div>` : ''}
        <div class="side__who">
          ${av(whoName, whoColor)}
          <div style="flex:1;min-width:0"><b style="font-size:12.5px">${esc(whoName)}</b><small>${roleSub}</small></div>
          ${prod ? `<button class="btn btn--ghost btn--sm" data-logout title="Выйти из аккаунта" style="padding:6px 10px">${ic('logout')} Выйти</button>` : ''}
        </div>
      </div>`;
  }
  function navCount(v){
    const isHead = S.session.role==='head';
    const scope = isHead ? UQ.scopedManagerIds() : null;
    if(v==='leads') return scope ? S.leads.filter(l=>l.managerId && scope.includes(l.managerId)).length : S.leads.filter(l=>l.managerId).length;
    if(v==='managers') return scope ? scope.length : UQ.activeManagers().length;
    if(v==='payouts'){ const list = scope? S.payouts.filter(p=>scope.includes(p.managerId)) : S.payouts; const n=list.filter(p=>p.status==='pending').length; return n||null; }
    if(v==='dialer'){ const id=S.session.managerId; return UQ.limitFor(id)-UQ.calledCount(id); }
    if(v==='base') return UQ.poolCount();
    if(v==='pipeline') return UQ.pipelineOpen();
    if(v==='clients') return UQ.clients().length;
    if(v==='projects') return UQ.projectStats().active;
    if(v==='employees') return isHead ? scope.length : UQ.employees().length;
    if(v==='notifications'){ const n=UQ.notifUnread(); return n||null; }
    if(v==='ai') return UQ.aiInsights().filter(i=>i.level==='critical'||i.level==='warn').length||null;
    return null;
  }

  /* ── router ─────────────────────────────────────────────────────────── */
  const VIEWS = { dashboard:vDashboard, ai:vAI, company:vCompany, analytics:vAnalytics, pipeline:vPipeline, clients:vClients, projects:vProjects, finance:vFinance, marketing:vMarketing, employees:vEmployees, knowledge:vKnowledge, automation:vAutomation, notifications:vNotifications, settings:vSettings, leads:vLeads, managers:vManagers, payouts:vPayouts, base:vBase, progress:vProgress, goals:vGoals, dialer:vDialer, results:vResults };
  function route(v){
    view=v; renderSide();
    const fn = (v==='dashboard' && S.session.role==='head') ? vHeadDashboard : (VIEWS[v] || (()=>'<div class="empty">—</div>'));
    $('#main').innerHTML = fn();
    $('#main').scrollTop=0;
    afterRender(v);
  }
  const rerender = () => route(view);

  function topbar(title,sub,actions=''){
    const online=UQ.activeManagers().length;
    let date=''; try{ date=new Date().toLocaleDateString('ru-RU',{weekday:'long',day:'numeric',month:'long'}); }catch(e){}
    const who = S.session.role==='admin'?'Матвей':UQ.manager(S.session.managerId).name;
    const col = S.session.role==='admin'?'#8b7cf6':UQ.manager(S.session.managerId).color;
    return `<header class="topbar">
      <button class="burger" data-burger>${ic('list')}</button>
      <div class="topbar__title"><h1>${title}</h1>
        <p>${sub}<span class="dotsep"></span>${date}<span class="dotsep"></span><span class="status-team"><span class="live-dot"></span>${online} в сети</span></p>
      </div>
      <div class="topbar__spacer"></div>
      <div class="topbar__search" ${S.session.role==='admin'?'data-pal':'data-toast="Поиск доступен владельцу"'}>${ic('search')}<span>Поиск…</span><span class="kbd">⌘K</span></div>
      ${actions}
      <button class="iconbtn" ${S.session.role==='admin'?'data-nav="notifications"':'data-toast="Уведомления"'} title="Уведомления">${ic('bell')}${UQ.notifUnread()?'<span class="dot"></span>':''}</button>
      <div class="userchip" ${S.session.role==='admin'?'data-nav="settings" title="Управление"':''} style="cursor:pointer">${av(who,col)}<span style="font-weight:600;font-size:12.5px">${who.split(' ')[0]}</span>${ic('chev')}</div>
    </header>`;
  }

  /* ════════════════════════ ADMIN · DASHBOARD ═══════════════════════════ */
  function vDashboard(){
    const fh=UQ.financeHealth();
    const rev=UQ.revenueSeries(); const maxRev=Math.max(...rev.map(r=>r.revenue));
    const ins=UQ.aiInsights().slice(0,4);
    const attn=UQ.attention();
    const changed=UQ.whatChanged();
    const best=UQ.bestEmployee();
    const deps=UQ.departments();
    const kpis=[
      {lbl:'Деньги на счетах',val:usd(fh.cash),sub:`${UQ.accounts().length} счёта · резерв ${usd(15000)}`,hero:true},
      {lbl:'Чистая прибыль · месяц',val:usd(fh.netProfit),sub:`<span class="delta delta--up">${ic('trend')} +19%</span> маржа ${fh.margin.toFixed(0)}%`},
      {lbl:'Ожидаемая прибыль',val:usd(fh.expected),sub:'из пайплайна (взвешенно)'},
      {lbl:'Прогноз месяца',val:usd(fh.forecast),sub:'при текущем темпе'},
    ];
    const fitems=[
      ['coins','Расходы · день',usd(fh.dayExp),''],
      ['coins','Расходы · месяц',usd(fh.monthExp),''],
      ['case','Дебиторка',usd(fh.receivables),'ждём оплат'],
      ['trend','Деньги в работе',usd(fh.moneyInWork),'в пайплайне'],
      ['bolt','Burn rate',usd(fh.burn)+'/мес',''],
      ['coins','Cash flow',(fh.cashFlow>=0?'+':'')+usd(fh.cashFlow),'pos'],
      ['trophy','Выручка · месяц',usd(fh.income),''],
      ['pie','Маржа',fh.margin.toFixed(0)+'%',''],
    ];
    return `${topbar('Командный центр','Что происходит с бизнесом прямо сейчас', `<button class="btn btn--sm" data-nav="ai">${ic('ai')} AI-сводка</button>`)}
      <div class="eyebrow" style="margin-bottom:14px">Финансовое здоровье</div>
      <div class="kpirow">
        ${kpis.map(k=>`<div class="card kpi ${k.hero?'kpi--hero':''}"><div class="eyebrow">${k.lbl}</div><div class="kpi__val">${k.val}</div><div class="kpi__sub">${k.sub}</div></div>`).join('')}
      </div>
      <div style="height:14px"></div>
      <div class="fhealth">
        ${fitems.map(([icn,l,v,note])=>`<div class="fhealth__i ${note==='pos'?'pos':''}"><small>${ic(icn)}${l}</small><b>${v}</b>${note&&note!=='pos'?`<div class="fh-note">${note}</div>`:''}</div>`).join('')}
      </div>

      <div class="two" style="margin-top:calc(var(--gap) + 8px)">
        <div class="card card--pad">
          <div class="card__head"><div><div class="eyebrow">Приоритет</div><h3>Требует внимания</h3></div>${attn.length?`<span class="pill pill--bad">${attn.length}</span>`:''}</div>
          ${attn.length?`<div class="attn">${attn.map(a=>`<div class="attn__i lv-${a.level}" data-nav="${a.action}"><div class="attn__ic">${ic(a.icon)}</div><div class="attn__b"><b>${esc(a.title)}</b><small>${esc(a.sub)}</small></div><span class="attn__go">${ic('arrow')}</span></div>`).join('')}</div>`:emptyState('check','Всё под контролем','Ничего не горит — можно фокусироваться на росте')}
        </div>
        <div class="card card--pad">
          <div class="card__head"><div><div class="eyebrow">AI-аналитик</div><h3>Что я вижу</h3></div><a class="lnk" data-nav="ai">Всё ${ic('arrow')}</a></div>
          <div class="attn">${ins.map(i=>{const lv=AILV[i.level]||AILV.info;return `<div class="attn__i lv-${i.level==='critical'?'critical':i.level==='warn'?'high':'normal'}" ${i.action?`data-nav="${i.action}"`:''}><div class="attn__ic pill--${lv[0]}">${ic(i.icon)}</div><div class="attn__b"><small style="color:var(--text-2);font-size:12.5px;line-height:1.5">${esc(i.text)}</small></div></div>`;}).join('')}</div>
        </div>
      </div>

      <div class="two" style="margin-top:var(--gap)">
        <div class="card card--pad">
          <div class="card__head"><div><div class="eyebrow">Обзор</div><h3>Выручка · 7 дней</h3></div><span class="pill pill--acc">${usd(rev.reduce((a,r)=>a+r.revenue,0))}</span></div>
          <div class="barchart">${rev.map(r=>`<div class="barcol"><div class="barcol__val">${usd(r.revenue)}</div><div class="bar3d" data-h="${Math.round(r.revenue/maxRev*150)+18}" style="height:0"></div><div class="barcol__lbl" style="position:static;margin-top:10px;text-align:center">${r.label}</div></div>`).join('')}</div>
        </div>
        <div class="grid" style="align-content:start;gap:var(--gap)">
          <div class="card card--pad">
            <div class="card__head"><div class="eyebrow">Со вчера</div><h3 style="margin-top:2px">Что изменилось</h3></div>
            <div class="changed">${changed.map(c=>`<div class="changed__i"><span>${esc(c.label)}</span><span class="delta ${c.dir==='up'?'delta--up':'delta--down'}">${esc(c.val)}</span></div>`).join('')}</div>
          </div>
          <div class="card card--pad" style="display:flex;align-items:center;gap:16px">
            <div style="width:48px;height:48px;border-radius:14px;flex:none;display:grid;place-items:center;font-size:22px;background:linear-gradient(150deg,#ffd777,#e8a33c);color:#2a1c00">${ic('trophy')}</div>
            <div style="flex:1"><div class="eyebrow">Лучший сегодня</div><b style="font-size:15px;display:block;margin-top:3px">${esc(best.name)}</b><small style="color:var(--text-3);font-size:12px">${best.deals} сделок · ${usd(best.earned)}</small></div>
            ${av(best.name,best.color)}
          </div>
        </div>
      </div>

      <div class="sec-h"><div class="eyebrow">Компания</div><h2>Отделы</h2><div class="line"></div><a class="lnk" data-nav="company">Открыть ${ic('arrow')}</a></div>
      <div class="pipestrip">
        ${deps.map(d=>`<div class="pipecell" data-nav="company"><div style="display:flex;align-items:center;justify-content:space-between"><b style="font-size:14.5px">${d.name}</b><span class="health health--${HC[d.status]}"></span></div><small style="margin-top:10px">${d.metrics[0]?d.metrics[0][0]+' · '+d.metrics[0][1]:esc(d.lead)}</small></div>`).join('')}
      </div>

      <div class="sec-h"><div class="eyebrow">Воронка</div><h2>Пайплайн</h2><div class="line"></div><a class="lnk" data-nav="pipeline">Открыть ${ic('arrow')}</a></div>
      <div class="pipestrip">
        ${UQ.DSTAGES.map(s=>{const items=UQ.dealsByStage(s.id);const val=items.reduce((a,d)=>a+d.value,0);return `<div class="pipecell" data-nav="pipeline"><b>${items.length}</b><small><span class="kdot" style="background:${s.color}"></span>${s.label}</small><div class="pv">${usd(val)}</div></div>`;}).join('')}
      </div>`;
  }

  /* ════════════════════════ HEAD · DASHBOARD КОМАНДЫ ════════════════════ */
  function vHeadDashboard(){
    const head = UQ.manager(S.session.managerId);
    const ids = UQ.scopedManagerIds();
    const st = UQ.adminStats(ids);
    const lb = UQ.leaderboard(ids);
    const acts = UQ.activity().filter(a=>ids.includes(a.managerId)).slice(0,8);
    return `${topbar('Дашборд команды', `Команда ${esc(head?head.name:'')} · ${ids.length} менеджера`)}
      <div class="kpirow">
        <div class="card kpi kpi--hero"><div class="eyebrow">Сделок сегодня</div><div class="kpi__val">${st.dealsToday}</div><div class="kpi__sub">команда из ${ids.length} чел.</div></div>
        <div class="card kpi"><div class="eyebrow">Конверсия команды</div><div class="kpi__val">${st.conv.toFixed(1)}%</div><div class="kpi__sub">${st.called} звонков</div></div>
        <div class="card kpi"><div class="eyebrow">Выручка команды</div><div class="kpi__val">${usd(st.revenue)}</div><div class="kpi__sub">${st.deals} сделок всего</div></div>
        <div class="card kpi"><div class="eyebrow">К выплате команде</div><div class="kpi__val">${usd(st.pending)}</div><div class="kpi__sub">по $${UQ.CUT} за сделку</div></div>
      </div>
      <div class="sec-h"><div class="eyebrow">Рейтинг</div><h2>Моя команда</h2><div class="line"></div><a class="lnk" data-nav="managers">Все ${ic('arrow')}</a></div>
      <div class="card card--pad">
        <table class="tbl"><thead><tr><th>#</th><th>Менеджер</th><th>Звонков</th><th>Сделок</th><th>Конверсия</th><th>Лимит</th><th style="text-align:right">Заработок</th></tr></thead><tbody>
        ${lb.map((m,i)=>`<tr><td><span class="rank ${i<3?'rank--'+(i+1):''}">${i+1}</span></td><td><div class="cell-user">${av(m.name,m.color)}<b>${esc(m.name)}</b></div></td><td class="num">${m.calls}</td><td class="num" style="color:var(--good);font-weight:700">${m.deals}</td><td class="num">${m.conv.toFixed(0)}%</td><td class="num">${UQ.calledCount(m.id)}/${m.limit}</td><td class="num" style="text-align:right;font-weight:700">${usd(m.earned)}</td></tr>`).join('')||`<tr><td colspan="7"><div class="empty"><h4>Пока нет менеджеров</h4><p>Добавь первого во вкладке «Мои менеджеры»</p></div></td></tr>`}
        </tbody></table>
      </div>
      <div class="sec-h"><div class="eyebrow">Активность</div><h2>Последние звонки команды</h2><div class="line"></div></div>
      <div class="card card--pad">
        ${acts.length?`<div class="timeline">${acts.map(a=>`<div class="tl-item"><div class="tl-item__ic" style="color:${(UQ.STATUS[a.status]||{}).color||'var(--text-3)'}">${ic(a.status==='deal'?'trophy':'phone')}</div><div class="tl-item__b"><h5>${esc(a.biz)}</h5><p>${esc(a.mgr)} · ${(UQ.STATUS[a.status]||{}).label||a.status}</p></div><div class="tl-item__t">${ago(a.createdAt)}</div></div>`).join('')}</div>`:emptyState('spark','Пока тихо','Как только команда начнёт звонить — тут появится лента')}
      </div>`;
  }

  /* ════════════════════════ ADMIN · LEADS ═══════════════════════════════ */
  let leadFilter={status:'all',q:''};
  function vLeads(){
    const scoped = S.session.role==='head' ? UQ.scopedManagerIds() : null;
    const all = scoped ? S.leads.filter(l=>l.managerId && scoped.includes(l.managerId)) : S.leads.filter(l=>l.managerId);
    let rows = all.filter(l=> (leadFilter.status==='all'||l.status===leadFilter.status) && (!leadFilter.q || (l.business+l.phone+l.niche).toLowerCase().includes(leadFilter.q.toLowerCase())));
    const chips = [['all','Все',all.length],...Object.keys(UQ.STATUS).map(k=>[k,UQ.STATUS[k].label,all.filter(l=>l.status===k).length])];
    return `${topbar('Лиды','Все обработанные и назначенные номера · '+all.length, `<button class="btn btn--sm" data-toast="Экспорт доступен только владельцу (RLS)">${ic('doc')} Экспорт</button>`)}
      <div class="card card--pad">
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;align-items:center">
          ${chips.map(([k,l,c])=>`<button class="chip ${leadFilter.status===k?'on':''}" data-lfilter="${k}">${l} <small>${c}</small></button>`).join('')}
          <div style="flex:1"></div>
          <div style="position:relative"><span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text-4)">${ic('search')}</span>
          <input class="input" style="width:220px;padding-left:36px" placeholder="Поиск бизнеса…" data-lsearch value="${esc(leadFilter.q)}"></div>
        </div>
        <table class="tbl">
          <thead><tr><th>Бизнес</th><th>Телефон</th><th>Город</th><th>Ниша</th><th>Менеджер</th><th>Статус</th><th>Обновлён</th></tr></thead>
          <tbody>
            ${rows.slice(0,60).map(l=>{ const m=UQ.manager(l.managerId)||{};
              return `<tr><td><b>${esc(l.business)}</b>${l.reason?`<small style="color:var(--text-3);display:block">${esc(l.reason)}</small>`:''}</td>
              <td class="num" style="color:var(--text-2)">${esc(l.phone)}</td>
              <td>${esc(l.city)}</td><td>${esc(l.niche)}</td>
              <td><div class="cell-user">${av(m.name||'—',m.color||'#555')}<span style="font-size:12px">${esc((m.name||'—').split(' ')[0])}</span></div></td>
              <td>${statusPill(l.status)}</td>
              <td class="num" style="color:var(--text-3)">${ago(l.updatedAt)}</td></tr>`;}).join('')||'<tr><td colspan="7"><div class="empty"><h4>Ничего не найдено</h4></div></td></tr>'}
          </tbody>
        </table>
      </div>`;
  }

  /* ════════════════════════ ADMIN · MANAGERS ════════════════════════════ */
  function vManagers(){
    const isHead = S.session.role==='head';
    const ids = isHead ? UQ.scopedManagerIds() : null;
    const lb = UQ.leaderboard(ids);
    const blocked = isHead ? [] : S.managers.filter(m=>m.status==='blocked');
    return `${topbar(isHead?'Мои менеджеры':'Менеджеры', isHead?'Твоя команда · рейтинг и доступ':'Команда холодных продаж · рейтинг и доступ', `<button class="btn btn--primary btn--sm" data-invite>${ic('plus')} Добавить менеджера</button>`)}
      <div class="card card--pad">
        <table class="tbl">
          <thead><tr><th>#</th><th>Менеджер</th><th>Доступ</th><th>Звонков</th><th>Сделок</th><th>Конверсия</th><th>Лимит/день</th><th style="text-align:right">Заработок</th><th></th></tr></thead>
          <tbody>
          ${lb.map((m,i)=>`<tr>
            <td><span class="rank ${i<3?'rank--'+(i+1):''}">${i+1}</span></td>
            <td><div class="cell-user">${av(m.name,m.color)}<div><b>${esc(m.name)}</b><small>${esc(m.email)}</small></div></div></td>
            <td>${pill(m.city,'')}</td>
            <td class="num">${m.calls}</td>
            <td class="num" style="color:var(--good);font-weight:700">${m.deals}</td>
            <td><div style="display:flex;align-items:center;gap:8px"><div class="miniprog"><i style="width:${Math.min(m.conv*4,100)}%"></i></div><span class="num">${m.conv.toFixed(0)}%</span></div></td>
            <td><span class="num">${UQ.calledCount(m.id)}/${m.limit}</span></td>
            <td class="num" style="text-align:right;font-weight:700">${usd(m.earned)}${m.fine?`<div style="color:var(--bad);font-size:11px;font-weight:600">штраф −${usd(m.fine)}</div>`:''}</td>
            <td style="text-align:right;white-space:nowrap">${canPenalize()?`<button class="btn btn--ghost btn--sm" data-penalty="mgr:${m.id}">${ic('bolt')} Штраф</button> `:''}<button class="btn btn--ghost btn--sm" data-block="${m.id}">${ic('lock')} Блок</button></td>
          </tr>`).join('')}
          ${blocked.map(m=>`<tr style="opacity:.5">
            <td><span class="rank">—</span></td>
            <td><div class="cell-user">${av(m.name,m.color)}<div><b>${esc(m.name)}</b><small>Заблокирован</small></div></div></td>
            <td>${pill('Заблокирован','bad')}</td><td class="num">—</td><td class="num">—</td><td>—</td><td>—</td><td class="num" style="text-align:right">—</td>
            <td style="text-align:right"><button class="btn btn--ghost btn--sm" data-block="${m.id}">Разблок</button></td>
          </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  }

  /* ════════════════════════ ADMIN · PAYOUTS ═════════════════════════════ */
  function vPayouts(){
    const isHead = S.session.role==='head';
    const ids = isHead ? UQ.scopedManagerIds() : null;
    const ps = UQ.payouts(ids);
    const pending = ps.filter(p=>p.status==='pending');
    const paid = ps.filter(p=>p.status==='paid');
    const total = pending.reduce((a,p)=>a+p.amount,0);
    return `${topbar(isHead?'Выплаты команды':'Выплаты','$'+UQ.CUT+' за сделку · '+pending.length+' в очереди')}
      <div class="kpirow" style="grid-template-columns:repeat(${isHead?2:3},1fr)">
        <div class="card kpi kpi--hero"><div class="eyebrow">К выплате</div><div class="kpi__val">${usd(total)}</div><div class="kpi__sub">${pending.reduce((a,p)=>a+p.deals,0)} сделок</div></div>
        <div class="card kpi"><div class="eyebrow">Выплачено · месяц</div><div class="kpi__val">${usd(paid.reduce((a,p)=>a+p.amount,0)+(isHead?0:7400))}</div><div class="kpi__sub">без задержек</div></div>
        ${isHead?'':`<div class="card kpi"><div class="eyebrow">Маржа Uniqore</div><div class="kpi__val">${usd(UQ.adminStats().net)}</div><div class="kpi__sub">${usd(UQ.NET)} с каждой сделки</div></div>`}
      </div>
      <div style="height:var(--gap)"></div>
      <div class="card card--pad">
        <div class="card__head"><div><div class="eyebrow">Очередь</div><h3>Ожидают выплаты</h3></div></div>
        <table class="tbl">
          <thead><tr><th>Менеджер</th><th>Период</th><th>Сделок</th><th>Сумма</th><th></th></tr></thead>
          <tbody>
          ${pending.map(p=>`<tr>
            <td><div class="cell-user">${av(p.name,p.color)}<b>${esc(p.name)}</b></div></td>
            <td style="color:var(--text-3)">${esc(p.period)}</td>
            <td class="num">${p.deals}</td>
            <td class="num" style="font-weight:700">${usd(p.amount)}</td>
            <td style="text-align:right">${isHead?pill('Ждёт владельца','warn'):`<button class="btn btn--good btn--sm" data-pay="${p.id}">${ic('check')} Выплачено</button>`}</td>
          </tr>`).join('')||'<tr><td colspan=5><div class="empty"><h4>Всё выплачено 🎉</h4></div></td></tr>'}
          </tbody>
        </table>
      </div>
      ${paid.length?`<div style="height:var(--gap)"></div><div class="card card--pad">
        <div class="card__head"><div class="eyebrow">История</div></div>
        <table class="tbl"><tbody>
        ${paid.map(p=>`<tr><td><div class="cell-user">${av(p.name,p.color)}<b>${esc(p.name)}</b></div></td><td style="color:var(--text-3)">${esc(p.period)}</td><td class="num">${p.deals} сделок</td><td class="num" style="font-weight:700">${usd(p.amount)}</td><td style="text-align:right">${pill('Выплачено','good')}</td></tr>`).join('')}
        </tbody></table></div>`:''}`;
  }

  /* ════════════════════════ ADMIN · BASE ════════════════════════════════ */
  let assignMgr='m1', assignN=20, assignNiche='all';
  function vBase(){
    const isHead=S.session.role==='head';
    const scope=isHead?UQ.scopedManagerIds():null;
    const pool = UQ.poolCount();
    const byNiche=UQ.poolByNiche();
    const niches=Object.keys(byNiche).sort((a,b)=>byNiche[b]-byNiche[a]);
    const dist=UQ.suggestDistribution(scope);
    const assignMgrs = scope ? UQ.activeManagers().filter(m=>scope.includes(m.id)) : UQ.activeManagers().filter(m=>m.role!=='head');
    return `${topbar('База номеров','Пул: '+pool+' номеров · загрузка, генерация по нишам и умная раздача')}
      <div class="two">
        <div class="card card--pad">
          <div class="card__head"><div><div class="eyebrow">Импорт</div><h3>Загрузить базу</h3></div>${pool?`<span class="pill pill--acc">${pool} в пуле</span>`:''}</div>
          <div class="drop" data-drop>${ic('upload')}<div><b style="color:var(--text-2)">Перетащи CSV</b> или нажми — колонки: бизнес, телефон, город, ниша</div></div>
          <div style="text-align:center;color:var(--text-4);margin:14px 0;font-size:12px">или добавь вручную</div>
          <div class="grid" style="grid-template-columns:1fr 1fr;gap:10px">
            <div class="field"><input class="input" placeholder="Бизнес" data-nl="business"></div>
            <div class="field"><input class="input" placeholder="Телефон" data-nl="phone"></div>
            <div class="field"><input class="input" placeholder="Город" data-nl="city"></div>
            <div class="field"><input class="input" placeholder="Ниша" data-nl="niche" list="nichelist"><datalist id="nichelist">${UQ.nicheList.map(n=>`<option value="${esc(n)}"></option>`).join('')}</datalist></div>
          </div>
          <button class="btn btn--primary btn--block" style="margin-top:12px" data-addlead>${ic('plus')} Добавить в пул</button>
          <div style="margin-top:14px;padding:12px 14px;border-radius:var(--radius-sm);background:var(--surface-2);border:1px solid var(--border);font-size:12px;color:var(--text-3);line-height:1.55">${ic('bolt')} <b style="color:var(--text-2)">Парсер 2ГИС</b> кладёт свежие номера в пул автоматически, по нишам и с болями. Запуск раз в неделю: <span style="font-family:var(--font-num);color:var(--acc-2)">python3 tools/import_contacts.py</span></div>
        </div>
        <div class="card card--pad">
          <div class="card__head"><div><div class="eyebrow">Выдача по нише</div><h3>Назначить менеджеру</h3></div></div>
          <div class="field" style="margin-bottom:12px"><label>Менеджер</label>
            <select class="select" data-assign-mgr>${assignMgrs.map(m=>`<option value="${m.id}" ${assignMgr===m.id?'selected':''}>${esc(m.name)} · сейчас ${UQ.leadsFor(m.id).length} номеров</option>`).join('')||'<option>Нет менеджеров</option>'}</select></div>
          <div class="field" style="margin-bottom:12px"><label>Ниша</label>
            <select class="select" data-assign-niche><option value="all" ${assignNiche==='all'?'selected':''}>Любая ниша · ${pool}</option>${niches.map(n=>`<option value="${esc(n)}" ${assignNiche===n?'selected':''}>${esc(n)} · ${byNiche[n]}</option>`).join('')}</select></div>
          <div class="field" style="margin-bottom:16px"><label>Сколько номеров</label>
            <div style="display:flex;gap:8px;align-items:center">${[20,50,100].map(n=>`<button type="button" class="chip ${assignN===n?'on':''}" data-assignpreset="${n}">${n}</button>`).join('')}<input class="input num" type="number" min="1" max="200" value="${assignN}" data-assign-n style="flex:1"></div></div>
          <button class="btn btn--primary btn--block" data-assign>${ic('users')} Выдать лиды${assignNiche!=='all'?' · '+esc(assignNiche):''}</button>
          <div style="margin-top:14px;padding:12px 14px;border-radius:var(--radius-sm);background:var(--surface-2);border:1px solid var(--border);font-size:12px;color:var(--text-3);line-height:1.55">${ic('shield')} <b style="color:var(--text-2)">Дедуп:</b> один номер никогда не уйдёт двум менеджерам. Менеджер видит только свои номера (RLS).</div>
        </div>
      </div>

      <div class="sec-h"><div class="eyebrow">Авто-раздача</div><h2>Умная раздача по KPI</h2><div class="line"></div><span class="pill pill--acc">рекомендация системы</span></div>
      <div class="card card--pad">
        <p style="color:var(--text-3);font-size:13px;margin:-2px 0 16px;line-height:1.6">Система смотрит KPI каждого и предлагает объём: сильный работает на пике (до 40), слабый и «остывший» получает меньше (10-15), чтобы не выгорал и восстановил конверсию. Поправь числа если нужно — и раздай в один клик.</p>
        <div class="card:has(.tbl)" style="overflow-x:auto"><table class="tbl">
          <thead><tr><th>Менеджер</th><th>KPI</th><th>Вчера</th><th>В очереди</th><th>Реком.</th><th style="text-align:right">Выдать</th></tr></thead>
          <tbody>
          ${dist.map(d=>`<tr>
            <td><div class="cell-user">${av(d.name,d.color)}<div><b>${esc(d.name)}</b><small>${esc(d.city)}${d.dryDays>=3?' · остыл 🧊':''}</small></div></div></td>
            <td><div style="display:flex;align-items:center;gap:8px"><div class="miniprog"><i style="width:${d.kpi}%;background:${d.kpi>=66?'var(--good)':d.kpi>=33?'var(--warn)':'var(--bad)'}"></i></div><span class="num">${d.kpi}</span></div></td>
            <td class="num">${d.dealsYesterday}</td>
            <td class="num">${d.queue}</td>
            <td><span class="pill ${d.suggested>=30?'pill--good':d.suggested<=12?'pill--warn':'pill--acc'}">${d.suggested}</span></td>
            <td style="text-align:right"><input class="input num" type="number" min="0" max="200" value="${d.suggested}" data-distn="${d.id}" style="width:78px;text-align:right"></td>
          </tr>`).join('')||'<tr><td colspan=6><div class="empty"><h4>Нет активных менеджеров</h4><p>Добавь во вкладке «Менеджеры»</p></div></td></tr>'}
          </tbody>
        </table></div>
        ${dist.length?`<button class="btn btn--primary btn--block" style="margin-top:16px" data-distribute>${ic('users')} Раздать по этим числам · ${pool} в пуле</button>`:''}
      </div>`;
  }

  /* ════════════════════════ MANAGER · КАБИНЕТ ОПЕРАТОРА ══════════════════ */
  let dialFilter='todo', dialMode='focus';
  function vDialer(){
    const id=S.session.managerId, m=UQ.manager(id);
    if(!m) return `${topbar('Кабинет оператора','')}<div class="card"><div class="empty"><h4>Профиль не найден</h4></div></div>`;
    const st=UQ.sessionStats(id);
    const cur=UQ.nextLead(id);
    const cbs=UQ.callbacksToday(id);
    const allMine=UQ.leadsFor(id);
    return `${topbar('Кабинет оператора', esc(m.city)+' · холодные продажи · смена 8 ч', `<div class="seg"><button class="seg__b ${dialMode==='focus'?'on':''}" data-dialmode="focus">${ic('bolt')} Фокус</button><button class="seg__b ${dialMode==='list'?'on':''}" data-dialmode="list">${ic('list')} Список</button></div>`)}
      <div class="opstat">
        <div class="opstat__ring">${progressRing(st.goalPct)}<div class="opstat__ringlbl"><b>${st.deals}</b><small>из ${st.goal}</small></div></div>
        <div class="opstat__cells">
          <div class="opcell opcell--earn"><small>Заработал за смену</small><b style="color:var(--good)">${usd(st.earned)}</b><span class="opcell__x">${st.deals} × $${UQ.CUT}</span></div>
          <div class="opcell"><small>Прозвонено</small><b>${st.called}<span style="color:var(--text-4);font-size:16px"> / ${st.limit}</span></b><div class="kr__track" style="margin-top:9px"><div class="kr__fill" style="width:${Math.min(st.called/st.limit*100,100)}%"></div></div></div>
          <div class="opcell"><small>Осталось</small><b>${st.left}</b><span class="opcell__x">номеров в очереди</span></div>
          <div class="opcell"><small>Конверсия</small><b>${st.conv.toFixed(0)}%</b><span class="opcell__x">звонок → сделка</span></div>
          <div class="opcell"><small>Встречи</small><b style="color:var(--acc-2)">${st.meetings}</b><span class="opcell__x">назначено</span></div>
        </div>
      </div>
      ${cbs.length?`<div class="cbbar">
        <div class="cbbar__t">${ic('cal')} Перезвоны на сегодня · ${cbs.length}</div>
        <div class="cbbar__row">${cbs.slice(0,8).map(l=>`<button class="cbchip" data-lead="${l.id}">${esc(l.business)}${l.callbackDate?` <small>${new Date(l.callbackDate).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'})}</small>`:''}</button>`).join('')}</div>
      </div>`:''}
      ${dialMode==='focus'?focusDialer(id,m,cur,st):listDialer(id,allMine)}`;
  }

  function focusDialer(id,m,cur,st){
    if(!cur){
      return `<div class="card callcard"><div class="empty">${ic('trophy')}<h4>Все номера обработаны 🔥</h4><p>Смена на 100% — ${st.deals} сделок, ${usd(st.earned)} заработано. Красавчик.</p></div></div>
        <div class="two" style="margin-top:var(--gap)">${scriptPanelHtml(m)}${objectionPanelHtml()}</div>`;
    }
    const pains=(cur.pains&&cur.pains.length)?cur.pains:UQ.pickPains(cur.niche);
    return `<div class="callcard card">
        <div class="callcard__eyebrow">${pill('Следующий номер','acc')}<span style="color:var(--text-4);font-size:12px">в очереди ещё ${Math.max(0,st.left-1)}</span></div>
        <div class="callcard__biz">${esc(cur.business)}</div>
        <div class="callcard__meta">${pill(cur.niche)}${pill(cur.city)}</div>
        <div class="callcard__pains">
          <div class="callcard__pains-t">${ic('bolt')} О чём говорить — боли ниши</div>
          ${pains.map(p=>`<div class="callcard__pain">${ic('check')}<span>${esc(p)}</span></div>`).join('')}
        </div>
        <button class="btn btn--primary btn--block btn--lg" data-lead="${cur.id}">${ic('phone')} Позвонить</button>
        <div class="callcard__hint">Откроется номер, скрипт и статусы · клавиши 1-7 = быстрый статус</div>
      </div>
      <div class="two" style="margin-top:var(--gap)">${scriptPanelHtml(m)}${objectionPanelHtml()}</div>`;
  }

  function listDialer(id,allMine){
    const leads = dialFilter==='todo'?allMine.filter(l=>l.status==='new'):allMine;
    return `<div style="display:flex;gap:8px;margin:var(--gap) 0 14px">
        <button class="chip ${dialFilter==='todo'?'on':''}" data-dial="todo">Не обработаны <small>${allMine.filter(l=>l.status==='new').length}</small></button>
        <button class="chip ${dialFilter==='all'?'on':''}" data-dial="all">Все <small>${allMine.length}</small></button>
      </div>
      ${leads.length?`<div class="leadgrid">
        ${leads.map(l=>`<div class="leadcard ${l.status!=='new'?'done':''}" data-lead="${l.id}">
          <div class="leadcard__top"><div class="leadcard__biz">${esc(l.business)}</div>${l.status!=='new'?statusPill(l.status):pill('Новый','acc')}</div>
          <div class="leadcard__meta">${pill(l.niche)}${pill(l.city)}</div>
          <div class="leadcard__phone">${ic('phone')}<span class="${l.status==='new'?'masked':''}">${l.status==='new'?'+7 ••• ••• •• ••':esc(l.phone)}</span></div>
        </div>`).join('')}
      </div>`:`<div class="card"><div class="empty">${ic('trophy')}<h4>Все номера обработаны 🔥</h4><p>Смена закрыта на 100%. Красавчик.</p></div></div>`}`;
  }

  function progressRing(pct){
    const r=42, c=2*Math.PI*r, off=c*(1-Math.min(Math.max(pct,0),100)/100);
    return `<svg class="opring" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="${r}" fill="none" stroke="var(--surface-3)" stroke-width="8"/>
      <circle cx="50" cy="50" r="${r}" fill="none" stroke="url(#opgrad)" stroke-width="8" stroke-linecap="round" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}"/>
      <defs><linearGradient id="opgrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8b7cf6"/><stop offset="1" stop-color="#4fe3b0"/></linearGradient></defs>
    </svg>`;
  }

  function scriptPanelHtml(m){
    const stages=UQ.scriptStages(((m&&m.name)||'').split(' ')[0]);
    return `<div class="card card--pad">
      <div class="card__head"><div><div class="eyebrow">Скрипт звонка</div><h3 style="margin-top:2px">Что говорить по этапам</h3></div></div>
      <div class="scriptacc">
        ${stages.map((s,i)=>`<div class="scriptstage ${i===0?'open':''}" data-scriptstage>
          <div class="scriptstage__h"><span class="scriptstage__n">${i+1}</span><span style="flex:1">${esc(s.label)}</span><span class="chev">${ic('chev')}</span></div>
          <div class="scriptstage__b">${esc(s.text)}</div>
        </div>`).join('')}
      </div>
    </div>`;
  }

  function objectionPanelHtml(){
    const objs=UQ.objections();
    return `<div class="card card--pad">
      <div class="card__head"><div><div class="eyebrow">Отработка возражений</div><h3 style="margin-top:2px">Клиент возражает — жми</h3></div></div>
      <div class="objgrid">${objs.map(o=>`<button class="objchip" data-obj="${esc(o)}">${esc(o)}</button>`).join('')}</div>
      <div class="objreply" data-objreply><span style="color:var(--text-4);font-size:12.5px">Нажми возражение — покажу готовый ответ, читай вслух.</span></div>
    </div>`;
  }

  /* ════════════════════════ MANAGER · RESULTS ═══════════════════════════ */
  function vResults(){
    const id=S.session.managerId, m=UQ.manager(id);
    const mine=UQ.leadsFor(id);
    const deals=mine.filter(l=>l.status==='deal');
    const calls=mine.filter(l=>l.status!=='new');
    const byStatus=Object.keys(UQ.STATUS).map(k=>[k,mine.filter(l=>l.status===k).length]);
    return `${topbar('Мои результаты',esc(m.name)+' · сегодня')}
      <div class="kpirow">
        <div class="card kpi kpi--hero"><div class="eyebrow">Заработано сегодня</div><div class="kpi__val">${usd(deals.length*UQ.CUT)}</div><div class="kpi__sub">${deals.length} сделок × $${UQ.CUT}</div></div>
        <div class="card kpi"><div class="eyebrow">Звонков</div><div class="kpi__val">${calls.length}</div><div class="kpi__sub">из ${UQ.limitFor(m)} лимита</div></div>
        <div class="card kpi"><div class="eyebrow">Конверсия</div><div class="kpi__val">${calls.length?(deals.length/calls.length*100).toFixed(0):0}%</div><div class="kpi__sub">звонок → сделка</div></div>
        <div class="card kpi"><div class="eyebrow">За неделю</div><div class="kpi__val">${usd((deals.length+m.dealsYesterday*2)*UQ.CUT)}</div><div class="kpi__sub">${deals.length+m.dealsYesterday*2} сделок</div></div>
      </div>
      <div style="height:var(--gap)"></div>
      <div class="two">
        <div class="card card--pad">
          <div class="card__head"><div class="eyebrow">Сегодня</div><h3 style="margin-top:2px">Мои звонки</h3></div>
          <div class="feed">
          ${calls.slice(0,10).map(l=>`<div class="feed__row"><div class="feed__ic" style="color:${UQ.STATUS[l.status].color}">${ic(l.status==='deal'?'trophy':'phone')}</div>
            <div class="feed__b"><h5>${esc(l.business)}</h5><p>${UQ.STATUS[l.status].label}${l.reason?' · '+esc(l.reason):''}</p></div>
            <div class="feed__t">${l.calledAt?ago(l.calledAt):''}</div></div>`).join('')||'<div class="empty">Ещё не звонил сегодня</div>'}
          </div>
        </div>
        <div class="card card--pad">
          <div class="card__head"><div class="eyebrow">Разбивка</div><h3 style="margin-top:2px">По статусам</h3></div>
          ${byStatus.filter(([k,c])=>c>0).map(([k,c])=>`<div style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="font-size:13px">${statusPill(k)}</span><span class="num" style="font-weight:700">${c}</span></div><div class="kr__track"><div class="kr__fill ${k==='deal'?'good':''}" style="width:${c/calls.length*100||0}%"></div></div></div>`).join('')}
        </div>
      </div>`;
  }

  /* ════════════════════════ PIPELINE (сделки) ═══════════════════════════ */
  function vPipeline(){
    const stages=UQ.DSTAGES;
    const open=UQ.pipelineOpen(), val=UQ.pipelineValue(), won=UQ.dealsByStage('live').length;
    return `${topbar('Пайплайн','Сделки от лида до запуска CRM', `<span class="pill pill--acc" style="align-self:center">${usd(val)} в работе</span>`)}
      <div class="kpirow">
        <div class="card kpi kpi--hero"><div class="eyebrow">В пайплайне</div><div class="kpi__val">${usd(val)}</div><div class="kpi__sub">${open} открытых сделок</div></div>
        <div class="card kpi"><div class="eyebrow">Запущено</div><div class="kpi__val">${won}</div><div class="kpi__sub">CRM сдано</div></div>
        <div class="card kpi"><div class="eyebrow">Средний чек</div><div class="kpi__val">${usd(UQ.SERVICE)}</div><div class="kpi__sub">за сборку</div></div>
        <div class="card kpi"><div class="eyebrow">Конверсия воронки</div><div class="kpi__val">32%</div><div class="kpi__sub">лид → оплата</div></div>
      </div>
      <div style="height:var(--gap)"></div>
      <div class="board-scroll">
        <div class="kanban wide">
          ${stages.map(s=>{ const items=UQ.dealsByStage(s.id);
            return `<div class="kcol" data-dcol="${s.id}">
              <div class="kcol__h"><span class="kdot" style="background:${s.color}"></span>${s.label}<span class="kcount">${items.length}</span></div>
              ${items.map(d=>`<div class="dealcard" draggable="true" data-deal="${d.id}" data-open="deal:${d.id}">
                <div class="dealcard__t">${esc(d.client)}</div>
                <div class="leadcard__meta">${pill(d.niche)}</div>
                <div class="dealcard__m">${av(d.manager,'#8b7cf6')}<span style="font-size:11px;color:var(--text-3)">${esc(d.manager.split(' ')[0])}</span><span class="dealcard__v">${usd(d.value)}</span></div>
              </div>`).join('')||'<div style="color:var(--text-4);font-size:12px;padding:14px 6px;text-align:center">пусто</div>'}
            </div>`;}).join('')}
        </div>
      </div>`;
  }

  /* ════════════════════════ CLIENTS ═════════════════════════════════════ */
  function vClients(){
    const cs=UQ.clientStats(), list=UQ.clients();
    return `${topbar('Клиенты','CRM, которые мы собрали и ведём · '+cs.total)}
      <div class="kpirow">
        <div class="card kpi kpi--hero"><div class="eyebrow">Активные</div><div class="kpi__val">${cs.live}</div><div class="kpi__sub">из ${cs.total} клиентов</div></div>
        <div class="card kpi"><div class="eyebrow">В сборке</div><div class="kpi__val">${cs.building}</div><div class="kpi__sub">онбординг + билд</div></div>
        <div class="card kpi"><div class="eyebrow">MRR поддержка</div><div class="kpi__val">${usd(cs.mrr)}</div><div class="kpi__sub">в месяц</div></div>
        <div class="card kpi"><div class="eyebrow">Всего продано</div><div class="kpi__val">${usd(cs.ltv)}</div><div class="kpi__sub">разовые сборки</div></div>
      </div>
      <div style="height:var(--gap)"></div>
      <div class="card card--pad">
        <table class="tbl">
          <thead><tr><th>Клиент</th><th>Ниша</th><th>Статус</th><th></th><th>Рецепт</th><th>Deploy</th><th>MRR</th><th style="text-align:right">Сборка</th></tr></thead>
          <tbody>
          ${list.map(c=>{ const cst=UQ.CSTATUS[c.status]||{label:c.status,pill:''};
            return `<tr data-open="client:${c.id}" style="cursor:pointer">
              <td><div class="cell-user">${av(c.name,'#8b7cf6')}<div><b>${esc(c.name)}</b><small>вёл ${esc(c.manager.split(' ')[0])}</small></div></div></td>
              <td>${pill(c.niche)}</td>
              <td>${pill(cst.label,cst.pill)}</td>
              <td><span class="health health--${c.health}" title="${c.health}"></span></td>
              <td><span class="recipe-tag">${esc(c.recipe)}</span></td>
              <td>${c.deploy==='—'?'<span style="color:var(--text-4)">— в сборке</span>':`<span class="deploy">${ic('globe')}${esc(c.deploy)}</span>`}</td>
              <td class="num">${c.mrr?usd(c.mrr):'<span style="color:var(--text-4)">—</span>'}</td>
              <td class="num" style="text-align:right;font-weight:700">${usd(c.value)}</td>
            </tr>`;}).join('')}
          </tbody>
        </table>
      </div>`;
  }

  /* ════════════════════════ FINANCE (P&L) ═══════════════════════════════ */
  function vFinance(){
    const f=UQ.finance(), fh=UQ.financeHealth();
    const accs=UQ.accounts(), subs=UQ.subscriptions(), ops=UQ.operations(), tax=UQ.taxes();
    const maxM=Math.max(...f.months.map(m=>m.rev));
    const maxInc=Math.max(...f.incomeRows.map(r=>r.amount));
    const maxExp=Math.max(...f.expenseRows.map(r=>r.amount));
    const accIcon={bank:'wallet',cash:'coins',crypto:'coins'};
    return `${topbar('Финансы','P&L · ДДС · счета · CRM-фабрика Uniqore', `<button class="btn btn--primary btn--sm" data-addop>${ic('plus')} Операция</button>`)}
      <div class="kpirow">
        <div class="card kpi kpi--hero"><div class="eyebrow">Деньги на счетах</div><div class="kpi__val">${usd(fh.cash)}</div><div class="kpi__sub">${accs.length} счёта</div></div>
        <div class="card kpi"><div class="eyebrow">Выручка · месяц</div><div class="kpi__val">${usd(f.income)}</div><div class="kpi__sub"><span class="delta delta--up">${ic('trend')} +19%</span></div></div>
        <div class="card kpi"><div class="eyebrow">Прибыль</div><div class="kpi__val" style="color:var(--good)">${usd(f.profit)}</div><div class="kpi__sub">маржа ${f.margin.toFixed(0)}%</div></div>
        <div class="card kpi"><div class="eyebrow">Налоги · УСН ${tax.rate}%</div><div class="kpi__val">${usd(tax.amount)}</div><div class="kpi__sub">к уплате</div></div>
      </div>

      <div class="sec-h"><div class="eyebrow">Счета и кассы</div><h2>Где лежат деньги</h2><div class="line"></div></div>
      <div class="pipestrip">
        ${accs.map(a=>`<div class="pipecell"><small style="margin-bottom:10px">${ic(accIcon[a.type]||'wallet')} ${esc(a.name)}</small><b>${usd(a.balance)}</b><div class="pv">${a.type==='bank'?'банковский':a.type==='cash'?'наличные':'криптовалюта'}</div></div>`).join('')}
      </div>

      <div style="height:var(--gap)"></div>
      <div class="card card--pad">
        <div class="card__head"><div><div class="eyebrow">Динамика</div><h3>Выручка · 6 месяцев</h3></div><span class="pill pill--acc">${usd(f.months.reduce((a,m)=>a+m.rev,0))}</span></div>
        <div class="barchart">${f.months.map(m=>`<div class="barcol"><div class="barcol__val">${usd(m.rev)}</div><div class="bar3d" data-h="${Math.round(m.rev/maxM*150)+18}" style="height:0"></div><div class="barcol__lbl" style="position:static;margin-top:10px;text-align:center">${m.label}</div></div>`).join('')}</div>
      </div>

      <div class="two" style="margin-top:var(--gap)">
        <div class="card card--pad">
          <div class="card__head"><div class="eyebrow">P&L · Доходы</div><h3 style="margin-top:2px">Откуда деньги</h3></div>
          ${f.incomeRows.map(r=>`<div class="finrow"><div class="finrow__l"><b>${esc(r.cat)}</b><small>${esc(r.note||'')}</small></div><div class="finrow__bar"><i style="width:${r.amount/maxInc*100}%;background:linear-gradient(90deg,var(--acc-2),var(--acc-3))"></i></div><div class="finrow__v">${usd(r.amount)}</div></div>`).join('')}
        </div>
        <div class="card card--pad">
          <div class="card__head"><div class="eyebrow">P&L · Расходы</div><h3 style="margin-top:2px">Куда уходят деньги</h3><span class="pill pill--bad">−${usd(f.expenses)}</span></div>
          ${UQ.expenseBreakdown().map(r=>`<div class="finrow"><div class="finrow__l"><b>${esc(r.cat)}</b><small>${esc(r.note||'')}</small></div><div class="finrow__bar"><i style="width:${maxExp?r.amount/maxExp*100:0}%;background:linear-gradient(90deg,#ff9f5a,var(--bad))"></i></div><div class="finrow__v">${usd(r.amount)}<small style="display:block;color:var(--text-4);font-weight:400;font-size:11px">${r.pct.toFixed(0)}%</small></div></div>`).join('')}
        </div>
      </div>

      <div class="two" style="margin-top:var(--gap)">
        <div class="card card--pad">
          <div class="card__head"><div><div class="eyebrow">ДДС · движение денег</div><h3 style="margin-top:2px">История операций</h3></div></div>
          <div class="feed">
            ${ops.map(o=>`<div class="feed__row"><div class="feed__ic" style="color:${o.type==='income'?'var(--good)':'var(--bad)'}">${ic(o.type==='income'?'trend':'coins')}</div><div class="feed__b"><h5>${esc(o.cat)}${o.note?' · '+esc(o.note):''}</h5><p>${esc(o.acc)} · ${UQ.fmtDay(o.date)}</p></div><div style="display:flex;align-items:center;gap:8px"><span style="font-family:var(--font-num);font-weight:700;font-size:13.5px;white-space:nowrap;color:${o.type==='income'?'var(--good)':'var(--text)'}">${o.type==='income'?'+':'−'}${usd(o.amount)}</span><button class="btn btn--ghost btn--sm" data-delop="${o.id}" title="Удалить">${ic('x')}</button></div></div>`).join('')||'<div class="empty" style="padding:20px"><h4>Пока нет операций</h4><p>Добавь первую кнопкой «Операция»</p></div>'}
          </div>
        </div>
        <div class="card card--pad card--quiet">
          <div class="card__head"><div class="eyebrow">Регулярные</div><h3 style="margin-top:2px">Подписки</h3></div>
          ${subs.map(s=>`<div class="emp__row"><small style="color:var(--text-2)">${esc(s.name)}</small><span class="num">${usd(s.amount)}/мес</span></div>`).join('')}
          <div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--border);display:flex;justify-content:space-between"><span style="color:var(--text-3);font-size:13px">Итого в месяц</span><b class="num" style="font-weight:700">${usd(subs.reduce((a,s)=>a+s.amount,0))}</b></div>
        </div>
      </div>`;
  }

  /* ════════════════════════ AI-АНАЛИТИК ═════════════════════════════════ */
  const AILV={critical:['bad','Критично'],warn:['warn','Внимание'],good:['good','Хорошо'],info:['acc','Инфо']};
  function vAI(){
    const ins=UQ.aiInsights();
    const crit=ins.filter(i=>i.level==='critical').length, warn=ins.filter(i=>i.level==='warn').length;
    return `${topbar('AI-аналитик','Сам находит проблемы и точки роста', `<span class="pill pill--acc" style="align-self:center">${ins.length} инсайтов</span>`)}
      <div class="card ai-hero">
        <div class="ai-hero__ic">${ic('ai')}</div>
        <div style="position:relative;z-index:1"><div class="eyebrow" style="color:var(--acc-2)">Сводка на сегодня</div>
          <h2 style="font-family:var(--font-head);font-size:24px;font-weight:600;margin:7px 0 5px;letter-spacing:-.02em">Бизнес под контролем. ${crit} критичных, ${warn} требуют внимания.</h2>
          <p style="color:var(--text-2);font-size:14px;line-height:1.6">Проанализировал продажи, финансы, клиентов и проекты. Вот что важно прямо сейчас — тебе не нужно искать проблемы, я приношу их сам.</p>
        </div>
      </div>
      <div class="grid" style="grid-template-columns:1fr 1fr;gap:var(--gap);margin-top:var(--gap)">
        ${ins.map(i=>{ const lv=AILV[i.level]||AILV.info;
          return `<div class="card card--pad ai-card ${i.action?'card--hover':''}" ${i.action?`data-nav="${i.action}"`:''}>
            <div class="ai-card__ic pill--${lv[0]}">${ic(i.icon)}</div>
            <div class="ai-card__b"><span class="pill pill--${lv[0]}" style="margin-bottom:9px">${lv[1]}</span><p>${esc(i.text)}</p>${i.action?`<span class="lnk" style="margin-top:10px">Разобраться ${ic('arrow')}</span>`:''}</div>
          </div>`;}).join('')}
      </div>`;
  }

  /* ════════════════════════ КОМПАНИЯ ════════════════════════════════════ */
  const HC={good:'good',warn:'warn',risk:'risk'};
  function vCompany(){
    const deps=UQ.departments(), es=UQ.employeeStats();
    return `${topbar('Компания','Состояние всех отделов за 30 секунд')}
      <div class="kpirow">
        <div class="card kpi kpi--hero"><div class="eyebrow">Отделов в норме</div><div class="kpi__val">${deps.filter(d=>d.status==='good').length}/${deps.length}</div><div class="kpi__sub">${deps.filter(d=>d.status!=='good').length} требуют внимания</div></div>
        <div class="card kpi"><div class="eyebrow">Сотрудников</div><div class="kpi__val">${es.total}</div><div class="kpi__sub">${es.probation} на испытательном</div></div>
        <div class="card kpi"><div class="eyebrow">Средний KPI</div><div class="kpi__val">${es.avgKpi}%</div><div class="kpi__sub">по команде</div></div>
        <div class="card kpi"><div class="eyebrow">Фонд оплаты</div><div class="kpi__val">${usd(es.payroll)}</div><div class="kpi__sub">в месяц</div></div>
      </div>
      <div class="sec-h"><div class="eyebrow">Отделы</div><h2>Состояние компании</h2><div class="line"></div></div>
      <div class="three">
        ${deps.map(d=>`<div class="card card--pad card--hover dept" data-nav="${d.key==='sales'?'pipeline':d.key==='fin'?'finance':d.key==='mkt'?'marketing':d.key==='prod'?'projects':'employees'}">
          <div class="dept__top"><div class="dept__ic">${ic(d.icon)}</div><span class="health health--${HC[d.status]}"></span></div>
          <h3 style="font-family:var(--font-head);font-size:17px;font-weight:600;margin:16px 0 3px">${d.name}</h3>
          <div style="color:var(--text-3);font-size:12.5px;margin-bottom:18px">Ведёт ${esc(d.lead)}</div>
          <div class="dept__metrics">${d.metrics.map(([l,v])=>`<div><small>${l}</small><b class="num">${v}</b></div>`).join('')}</div>
        </div>`).join('')}
      </div>`;
  }

  /* ════════════════════════ АНАЛИТИКА ═══════════════════════════════════ */
  function vAnalytics(){
    const lb=UQ.leaderboard();
    const funnel=UQ.DSTAGES.map((s,i)=>({label:s.label,n:UQ.deals().filter(d=>UQ.DSTAGES.findIndex(x=>x.id===d.stage)>=i).length,color:s.color}));
    const maxF=Math.max(...funnel.map(f=>f.n),1);
    const reasons={}; UQ.s.leads.forEach(l=>{ if(l.status==='refused'&&l.reason) reasons[l.reason]=(reasons[l.reason]||0)+1; });
    const rz=Object.entries(reasons).sort((a,b)=>b[1]-a[1]).slice(0,6); const maxR=Math.max(...rz.map(r=>r[1]),1);
    return `${topbar('Аналитика','Воронка, юнит-экономика, причины отказов')}
      <div class="kpirow">
        <div class="card kpi kpi--hero"><div class="eyebrow">LTV</div><div class="kpi__val">$1 560</div><div class="kpi__sub">чек + поддержка</div></div>
        <div class="card kpi"><div class="eyebrow">CAC</div><div class="kpi__val">$96</div><div class="kpi__sub">на привлечение</div></div>
        <div class="card kpi"><div class="eyebrow">LTV / CAC</div><div class="kpi__val">16x</div><div class="kpi__sub"><span class="delta delta--up">здорово</span> норма >3</div></div>
        <div class="card kpi"><div class="eyebrow">ROMI</div><div class="kpi__val">420%</div><div class="kpi__sub">возврат на маркетинг</div></div>
      </div>
      <div class="two" style="margin-top:var(--gap)">
        <div class="card card--pad">
          <div class="card__head"><div class="eyebrow">Воронка</div><h3 style="margin-top:2px">Лид → запуск</h3></div>
          ${funnel.map(f=>`<div style="margin-bottom:16px"><div style="display:flex;justify-content:space-between;margin-bottom:8px"><span style="font-size:13.5px">${f.label}</span><span class="num" style="font-weight:700">${f.n}</span></div><div class="kr__track"><div class="kr__fill" style="width:${Math.max(f.n/maxF*100,4)}%;background:${f.color};box-shadow:0 0 12px ${f.color}55"></div></div></div>`).join('')}
        </div>
        <div class="card card--pad">
          <div class="card__head"><div class="eyebrow">Отказы</div><h3 style="margin-top:2px">Почему не покупают</h3></div>
          ${rz.length?rz.map(([r,n])=>`<div class="finrow"><div class="finrow__l"><b>${esc(r)}</b></div><div class="finrow__bar"><i style="width:${n/maxR*100}%;background:linear-gradient(90deg,#ff9f5a,var(--bad))"></i></div><div class="finrow__v">${n}</div></div>`).join(''):emptyState('spark','Пока нет данных','Причины появятся из отказов в звонках')}
          <div style="margin-top:18px;padding-top:16px;border-top:1px solid var(--border);display:flex;justify-content:space-between"><div><div class="eyebrow">Средний цикл</div><b class="num" style="font-size:20px">4.2 дня</b></div><div style="text-align:right"><div class="eyebrow">Повторные</div><b class="num" style="font-size:20px">18%</b></div></div>
        </div>
      </div>
      <div class="sec-h"><div class="eyebrow">Рейтинг</div><h2>Лучшие менеджеры</h2><div class="line"></div><a class="lnk" data-nav="managers">Все ${ic('arrow')}</a></div>
      <div class="card card--pad"><table class="tbl"><thead><tr><th>#</th><th>Менеджер</th><th>Звонков</th><th>Сделок</th><th>Конверсия</th><th style="text-align:right">Заработок</th></tr></thead><tbody>
        ${lb.slice(0,5).map((m,i)=>`<tr><td><span class="rank ${i<3?'rank--'+(i+1):''}">${i+1}</span></td><td><div class="cell-user">${av(m.name,m.color)}<b>${esc(m.name)}</b></div></td><td class="num">${m.calls}</td><td class="num" style="color:var(--good);font-weight:700">${m.deals}</td><td class="num">${m.conv.toFixed(0)}%</td><td class="num" style="text-align:right;font-weight:700">${usd(m.earned)}</td></tr>`).join('')}
      </tbody></table></div>`;
  }

  /* ════════════════════════ ПРОЕКТЫ (производство) ══════════════════════ */
  const RISK={low:['Низкий','good'],med:['Средний','warn'],high:['Высокий','bad']};
  function vProjects(){
    const ps=UQ.projects(), st=UQ.projectStats();
    return `${topbar('Проекты','Производство CRM · от сборки до запуска')}
      <div class="kpirow">
        <div class="card kpi kpi--hero"><div class="eyebrow">В работе</div><div class="kpi__val">${st.active}</div><div class="kpi__sub">${st.overdue} просрочено</div></div>
        <div class="card kpi"><div class="eyebrow">Запущено</div><div class="kpi__val">${st.done}</div><div class="kpi__sub">за всё время</div></div>
        <div class="card kpi"><div class="eyebrow">В производстве</div><div class="kpi__val">${usd(st.value)}</div><div class="kpi__sub">стоимость активных</div></div>
        <div class="card kpi"><div class="eyebrow">Прибыль проектов</div><div class="kpi__val" style="color:var(--good)">${usd(st.profit)}</div><div class="kpi__sub">цена − себестоимость</div></div>
      </div>
      <div class="sec-h"><div class="eyebrow">Производство</div><h2>Активные проекты</h2><div class="line"></div></div>
      <div class="grid" style="gap:14px">
        ${ps.map(p=>{ const rk=RISK[p.risk]; const over=p.status==='active'&&p.deadline&&new Date(p.deadline)<Date.now();
          return `<div class="card card--pad card--hover proj" data-open="project:${p.id}" style="cursor:pointer">
            <div class="proj__l"><div style="display:flex;align-items:center;gap:10px;margin-bottom:5px"><b style="font-size:15px;font-family:var(--font-head)">${esc(p.name)}</b>${p.status==='done'?pill('Запущен','good'):pill(p.stage,'acc')}</div><div style="color:var(--text-3);font-size:12.5px">Клиент ${esc(p.client)} · ${esc(p.owner)}</div></div>
            <div class="proj__prog"><div class="kr__track" style="flex:1"><div class="kr__fill ${p.progress===100?'good':''}" style="width:${p.progress}%"></div></div><span class="num" style="font-size:12.5px;font-weight:700">${p.progress}%</span></div>
            <div class="proj__meta">${pill('Риск: '+rk[0],rk[1])}<span class="kbadge ${over?'kbadge--over':''}">${ic('cal')} ${over?'просрочен':UQ.fmtDay(p.deadline)}</span><span class="dealcard__v">+${usd(p.price-p.cost)}</span></div>
          </div>`;}).join('')}
      </div>`;
  }

  /* ════════════════════════ PROGRESS BOARD ══════════════════════════════ */
  const COLS=[['backlog','Бэклог','#8a879c'],['today','Сегодня','#a78bfa'],['doing','В работе','#63d7ff'],['done','Готово','#4fe3b0']];

  function emptyState(icon,title,text){ return `<div class="empty"><div class="empty__ic">${ic(icon)}</div><h4>${esc(title)}</h4><p>${esc(text)}</p></div>`; }
  function ring(pct){ const r=68,c=2*Math.PI*r,off=c*(1-Math.max(0,Math.min(100,pct))/100);
    return `<svg width="158" height="158" viewBox="0 0 158 158"><defs><linearGradient id="fgrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a78bfa"/><stop offset="1" stop-color="#6d5efc"/></linearGradient></defs>
      <circle class="track" cx="79" cy="79" r="${r}" fill="none" stroke-width="13"/>
      <circle class="prog" cx="79" cy="79" r="${r}" fill="none" stroke-width="13" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${c.toFixed(1)}" data-off="${off.toFixed(1)}"/></svg>`; }
  function timeLeftStr(){ try{ const now=new Date(),end=new Date(); end.setHours(21,0,0,0); let ms=end-now; if(ms<0)return '—'; return Math.floor(ms/3.6e6)+'ч '+Math.floor((ms%3.6e6)/6e4)+'м'; }catch(e){ return '—'; } }
  function motiv(pct){ if(pct>=100)return 'День закрыт на 100% — красавчик.'; if(pct>=70)return 'Финишная прямая. Дожимай.'; if(pct>=35)return 'Хороший темп. Не сбавляй.'; return 'Съешь лягушку — начни с самой важной.'; }
  function timeOf(at){ try{ return new Date(at).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'}); }catch(e){ return ''; } }
  function timelineHTML(log){
    const groups=[],idx={};
    log.forEach(g=>{ const k=UQ.fmtDay(g.at); if(idx[k]==null){ idx[k]=groups.length; groups.push([k,[]]); } groups[idx[k]][1].push(g); });
    return `<div class="timeline">${groups.map(([day,items])=>`<div class="tl-day">${day}</div>${items.map(g=>`
      <div class="tl-item"><div class="tl-item__ic" style="color:var(--good)">${ic('check')}</div>
        <div class="tl-item__b"><h5>${esc(g.text)}</h5><p>${av(g.who,'#8b7cf6','avatar--xs')} ${esc(g.who)}</p></div>
        <div class="tl-item__t">${timeOf(g.at)}</div></div>`).join('')}`).join('')}</div>`;
  }

  function vProgress(){
    const daily=UQ.daily(), tasks=UQ.tasks(), streak=UQ.streak(), log=UQ.doneLog();
    const done=daily.filter(d=>d.done).length, total=daily.length, pct=total?Math.round(done/total*100):0;
    const next=daily.find(d=>d.frog&&!d.done)||daily.find(d=>!d.done);
    return `${topbar('Фокус дня','Доводим день до 100% по методу Ivy Lee', `<span class="pill pill--acc" style="align-self:center">${done}/${total} задач</span>`)}
      <div class="focus-hero">
        <div class="focus-ring">${ring(pct)}<div class="focus-ring__txt"><b>${pct}<span style="font-size:20px;-webkit-text-fill-color:var(--text-3)">%</span></b><small>выполнено</small></div></div>
        <div class="focus-hero__body">
          <div class="eyebrow">Фокус дня · ${done} из ${total} задач закрыто</div>
          <h2>${motiv(pct)}</h2>
          ${next?`<div class="focus-next"><div class="focus-next__ic">${next.frog?'🐸':ic('play')}</div><div class="focus-next__t"><small>Следующая задача</small><b>${esc(next.text)}</b></div><button class="btn btn--primary btn--sm" data-daily="${next.id}">${ic('check')} Сделал</button></div>`
            :`<div class="focus-next"><div class="focus-next__ic">${ic('trophy')}</div><div class="focus-next__t"><small>Готово</small><b>Все задачи дня закрыты — 100%</b></div></div>`}
          <div class="focus-meta">
            <div>${ic('cal')} осталось <b>${timeLeftStr()}</b> до 21:00</div>
            <div>${ic('flame')} серия <b>${streak.current} дн.</b></div>
            <div>${ic('trophy')} рекорд <b>${streak.best} дн.</b></div>
          </div>
        </div>
      </div>

      <div class="two" style="margin-top:var(--gap)">
        <div class="card card--pad">
          <div class="card__head"><div><div class="eyebrow">Метод Ivy Lee · «съешь лягушку»</div><h3>6 задач на сегодня</h3></div><span class="pill pill--acc">${done}/${total}</span></div>
          <div class="ivy" id="ivylist">
            ${daily.map((d,i)=>`<div class="ivyrow ${d.done?'done':''} ${d.frog?'frog':''}" draggable="true" data-ivy="${d.id}">
              <span class="ivyrow__grip">${ic('dots')}</span>
              <span class="ivynum">${d.frog?'🐸':i+1}</span>
              <span class="ivyrow__t">${esc(d.text)}${d.frog?' <span class="pill pill--good" style="margin-left:6px">лягушка — первой</span>':''}</span>
              <span class="ivycheck ${d.done?'on':''}" data-daily="${d.id}">${ic('check')}</span>
            </div>`).join('')}
          </div>
          ${daily.length<6?`<div style="display:flex;gap:10px;margin-top:16px"><input class="input" placeholder="Добавить задачу дня…" data-newdaily><button class="btn btn--sm" data-adddaily>${ic('plus')} Добавить</button></div>`:''}
        </div>
        <div class="card streak">
          <div class="streak__top">
            <div class="streak__flame">${ic('flame')}</div>
            <div><div class="streak__big">${streak.current} <span style="font-size:15px;color:var(--text-3);-webkit-text-fill-color:var(--text-3)">дней</span></div><div class="streak__sub">подряд закрываем на 100%</div></div>
          </div>
          <div class="streak__chain">${streak.days.map(d=>`<div class="streak__d ${d.hit?'hit':d.today?'today':'miss'}" title="${d.label}">${d.hit?'✓':d.label[0]}</div>`).join('')}</div>
          <div class="streak__rec">
            <div class="kr__top"><span class="kr__lbl">До рекорда</span><span class="kr__val">${streak.current}/${streak.best}</span></div>
            <div class="kr__track"><div class="kr__fill good" style="width:${Math.min(streak.current/streak.best*100,100).toFixed(0)}%"></div></div>
          </div>
        </div>
      </div>

      <div class="sec-h"><div class="eyebrow">Канбан</div><h2>Задачи команды · переноси между колонками</h2><div class="line"></div></div>
      <div class="kanban">
        ${COLS.map(([key,label,color])=>{ const items=tasks.filter(t=>t.column===key);
          return `<div class="kcol" data-col="${key}">
            <div class="kcol__h"><span class="kdot" style="background:${color}"></span>${label}<span class="kcount">${items.length}</span></div>
            ${items.map(t=>ktaskHTML(t)).join('')}
            <button class="kadd" data-addtask="${key}">${ic('plus')} Задача</button>
          </div>`;}).join('')}
      </div>

      <div class="sec-h"><div class="eyebrow">Журнал</div><h2>Что сделали</h2><div class="line"></div></div>
      <div class="two">
        <div class="card card--pad">
          <div style="display:flex;gap:10px;margin-bottom:20px"><input class="input" placeholder="Записать достижение…" data-newdone><button class="btn btn--primary btn--sm" data-adddone>${ic('plus')} Добавить</button></div>
          ${log.length?timelineHTML(log):emptyState('spark','Пока пусто','Закрой первую задачу — она появится здесь')}
        </div>
        <div class="card card--pad card--quiet">
          <div class="card__head"><div class="eyebrow">Принцип дня</div><h3 style="margin-top:2px">Метод Ivy Lee</h3></div>
          <p style="color:var(--text-2);font-size:14px;line-height:1.75">Вечером выпиши <b style="color:var(--text)">6 задач</b> на завтра по важности. Утром иди сверху вниз — доводи каждую до конца, прежде чем взять следующую. Первая (🐸) — самая тяжёлая, ешь её первой.</p>
          <div style="margin-top:18px;padding-top:16px;border-top:1px solid var(--border);color:var(--text-3);font-size:12.5px">Работает с 1918 года. Просто и эффективно.</div>
        </div>
      </div>`;
  }
  const PRI={high:['Высокий','#ff6b81'],med:['Средний','#ffc55a'],low:['Низкий','#8a879c']};
  function dueBadge(due){ try{ const d=new Date(due),now=new Date(); const days=Math.ceil((d-now)/864e5); const s=d.toLocaleDateString('ru-RU',{day:'numeric',month:'short'}).replace('.',''); const cls=days<0?'kbadge--over':days<=1?'kbadge--soon':''; const lbl=days<0?'просрочено':days===0?'сегодня':s; return `<span class="kbadge ${cls}">${ic('cal')} ${lbl}</span>`; }catch(e){ return ''; } }
  function ktaskHTML(t){
    const pr=PRI[t.pri]||PRI.low;
    const badges=[ t.due?dueBadge(t.due):'', t.check?`<span class="kbadge ${t.check[0]===t.check[1]?'kbadge--done':''}">${ic('check')} ${t.check[0]}/${t.check[1]}</span>`:'', t.comments?`<span class="kbadge">${ic('doc')} ${t.comments}</span>`:'' ].filter(Boolean).join('');
    return `<div class="ktask ${t.frog?'frog':''}" draggable="true" data-task="${t.id}">
      <div class="ktask__top"><span class="ktask__pri" style="color:${pr[1]}"><i style="background:${pr[1]}"></i>${pr[0]}</span>${t.frog?'<span class="pill pill--good" style="padding:1px 8px">🐸</span>':''}</div>
      <div class="ktask__t">${esc(t.title)}</div>
      ${badges?`<div class="ktask__badges">${badges}</div>`:''}
      <div class="ktask__f">${av(t.owner,'#8b7cf6','avatar--xs')}<span style="font-size:11.5px;color:var(--text-3)">${esc(t.owner)}</span></div>
    </div>`;
  }

  /* ════════════════════════ GOALS · OKR ═════════════════════════════════ */
  function vGoals(){
    const g=UQ.goals();
    const overall=Math.round(g.krs.reduce((a,k)=>a+Math.min(k.current/k.target,1),0)/g.krs.length*100);
    return `${topbar('Цели недели','OKR · одна цель, измеримые результаты')}
      <div class="two">
        <div class="card okr">
          <div class="okr__obj"><span class="brand__mark" style="width:30px;height:30px">${ic('target')}</span>
            <div><div class="eyebrow">Objective · ${esc(g.period)}</div><h4>${esc(g.objective)}</h4></div>
            <span class="pill pill--acc" style="margin-left:auto">${overall}%</span></div>
          ${g.krs.map((k,i)=>{ const pct=Math.min(k.current/k.target*100,100);
            const cur=k.money?usd(k.current):k.current+(k.unit||''), tgt=k.money?usd(k.target):k.target+(k.unit||'');
            return `<div class="kr"><div class="kr__top"><span class="kr__lbl">${esc(k.label)}</span><span class="kr__val">${cur} <span style="color:var(--text-4)">/ ${tgt}</span></span></div>
            <div class="kr__track"><div class="kr__fill ${k.good?'good':''}" style="width:${pct}%"></div></div>
            <div style="display:flex;gap:6px;margin-top:7px"><button class="btn btn--ghost btn--sm" data-kr="${i}" data-d="-1">−</button><button class="btn btn--ghost btn--sm" data-kr="${i}" data-d="1">+ прогресс</button></div></div>`;}).join('')}
        </div>
        <div class="grid" style="align-content:start">
          <div class="card card--pad">
            <div class="card__head"><div class="eyebrow">Как ставим цели</div><h3 style="margin-top:2px">Методы</h3></div>
            ${[['OKR','Одна цель + 3–5 измеримых результата. Ревью каждую неделю.'],['Ivy Lee','6 задач на завтра, по важности. Сверху вниз.'],['Съешь лягушку','Самое трудное — первым, до всего остального.'],['12-недельный год','Квартал = «год». Спринтом, без раскачки.'],['Не рви цепь','Каждый день ✓. Стрик держит фокус.']].map(([t,d])=>`<div style="display:flex;gap:11px;padding:11px 0;border-bottom:1px solid var(--border)"><span class="feed__ic" style="color:var(--acc-2)">${ic('spark')}</span><div><b style="font-size:13px">${t}</b><div style="color:var(--text-3);font-size:12px;margin-top:2px">${d}</div></div></div>`).join('')}
          </div>
        </div>
      </div>`;
  }

  /* ════════════════════════ МАРКЕТИНГ ═══════════════════════════════════ */
  function vMarketing(){
    const ch=UQ.marketing();
    const totLeads=ch.reduce((a,c)=>a+c.leads,0), totSpend=ch.reduce((a,c)=>a+c.spend,0), totRev=ch.reduce((a,c)=>a+c.revenue,0), totSales=ch.reduce((a,c)=>a+c.sales,0);
    return `${topbar('Маркетинг','Источники лидов · стоимость · окупаемость')}
      <div class="kpirow">
        <div class="card kpi kpi--hero"><div class="eyebrow">Лидов · месяц</div><div class="kpi__val">${totLeads}</div><div class="kpi__sub">${totSales} продаж</div></div>
        <div class="card kpi"><div class="eyebrow">Расход на рекламу</div><div class="kpi__val">${usd(totSpend)}</div><div class="kpi__sub">за месяц</div></div>
        <div class="card kpi"><div class="eyebrow">CPL средний</div><div class="kpi__val">${usd(Math.round(totSpend/totLeads))}</div><div class="kpi__sub">за лид</div></div>
        <div class="card kpi"><div class="eyebrow">ROMI</div><div class="kpi__val" style="color:var(--good)">${Math.round((totRev-totSpend)/totSpend*100)}%</div><div class="kpi__sub">возврат маркетинга</div></div>
      </div>
      <div style="height:var(--gap)"></div>
      <div class="card card--pad">
        <div class="card__head"><div><div class="eyebrow">Каналы</div><h3>Источники лидов</h3></div><span class="pill pill--good">выручка ${usd(totRev)}</span></div>
        <table class="tbl"><thead><tr><th>Канал</th><th>Лидов</th><th>CPL</th><th>Продаж</th><th>CAC</th><th>Выручка</th><th style="text-align:right">ROI</th></tr></thead><tbody>
        ${ch.sort((a,b)=>(b.roi||99)-(a.roi||99)).map(c=>`<tr>
          <td><b>${esc(c.name)}</b></td><td class="num">${c.leads}</td><td class="num">${c.cpl?usd(c.cpl):'—'}</td>
          <td class="num">${c.sales}</td><td class="num">${c.cac?usd(c.cac):'—'}</td><td class="num" style="font-weight:700">${usd(c.revenue)}</td>
          <td style="text-align:right">${c.roi==null?pill('органика','good'):`<span class="delta ${c.roi>0?'delta--up':'delta--down'}">${c.roi>0?'+':''}${Math.round(c.roi*100)}%</span>`}</td>
        </tr>`).join('')}
        </tbody></table>
      </div>`;
  }

  /* ════════════════════════ СОТРУДНИКИ ══════════════════════════════════ */
  function vEmployees(){
    const isHead=S.session.role==='head';
    let es=UQ.employees();
    if(isHead){ const team=new Set(UQ.scopedManagerIds()); es=es.filter(e=> e.mgrId && team.has(e.mgrId)); }
    const st=UQ.employeeStats();
    const payroll=es.reduce((a,x)=>a+x.salary+x.bonus,0);
    const fines=es.reduce((a,x)=>a+UQ.finesFor(x.id),0);
    const avgKpi=es.length?Math.round(es.reduce((a,x)=>a+x.kpi,0)/es.length):0;
    return `${topbar(isHead?'Моя команда':'Сотрудники', isHead?'Люди под твоим руководством · KPI, план дня, дисциплина':'Команда · KPI, план дня, выплаты, штрафы', isHead?'':`<button class="btn btn--primary btn--sm" data-toast="Найм — скоро">${ic('plus')} Нанять</button>`)}
      <div class="kpirow">
        <div class="card kpi kpi--hero"><div class="eyebrow">В команде</div><div class="kpi__val">${es.length}</div><div class="kpi__sub">${isHead?'твоих людей':st.probation+' на испытательном'}</div></div>
        <div class="card kpi"><div class="eyebrow">Фонд оплаты</div><div class="kpi__val">${usd(payroll)}</div><div class="kpi__sub">оклад + бонусы</div></div>
        <div class="card kpi"><div class="eyebrow">Штрафы</div><div class="kpi__val" style="color:${fines?'var(--bad)':'inherit'}">${fines?'−'+usd(fines):'—'}</div><div class="kpi__sub">удержания за период</div></div>
        <div class="card kpi"><div class="eyebrow">Средний KPI</div><div class="kpi__val">${avgKpi}%</div><div class="kpi__sub">по ${isHead?'команде':'всем'}</div></div>
      </div>
      <div class="sec-h"><div class="eyebrow">Команда</div><h2>${isHead?'Мои сотрудники':'Все сотрудники'}</h2><div class="line"></div></div>
      <div class="three">
        ${es.map(e=>{ const p=UQ.dayPlanFor(e); const fine=UQ.finesFor(e.id);
          const planLine = p.type==='sales'?`${p.called}/${p.limit} звонков · ${p.deals} сделок`:`${p.tasks.filter(t=>t.column!=='done').length} задач в работе`;
          return `<div class="card card--pad card--hover emp" data-open="emp:${e.id}">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">${av(e.name,e.color)}<div style="flex:1"><b style="font-size:14.5px">${esc(e.name)}</b><div style="color:var(--text-3);font-size:12px">${esc(e.role)}</div></div>${e.status==='probation'?pill('Испыт.','warn'):''}</div>
          <div class="emp__row"><small>${ic('cal')} План на сегодня</small><span style="font-size:12px;color:var(--text-2)">${planLine}</span></div>
          <div class="emp__row"><small>К выплате</small><span class="num">${usd(UQ.empPayout(e))}${fine?` <span style="color:var(--bad)">−${usd(fine)}</span>`:''}</span></div>
          <div style="margin-top:14px"><div style="display:flex;justify-content:space-between;margin-bottom:7px"><small style="color:var(--text-3);font-size:12px">KPI эффективности</small><span class="num" style="font-size:12.5px;font-weight:700">${e.kpi}%</span></div><div class="kr__track"><div class="kr__fill ${e.kpi>=80?'good':''}" style="width:${e.kpi}%"></div></div></div>
          ${canPenalize()?`<div style="margin-top:14px"><button class="btn btn--ghost btn--sm" data-penalty="emp:${e.id}">${ic('bolt')} Оштрафовать</button></div>`:''}
        </div>`;}).join('')||`<div class="empty" style="grid-column:1/-1"><h4>Нет сотрудников</h4><p>${isHead?'В твоей команде пока никого — добавь во вкладке «Мои менеджеры»':'Добавь первого'}</p></div>`}
      </div>`;
  }

  /* ════════════════════════ БАЗА ЗНАНИЙ ═════════════════════════════════ */
  function vKnowledge(){
    const items=UQ.knowledge(), cats=UQ.knowledgeCats();
    return `${topbar('База знаний','Регламенты, скрипты, инструкции — внутренний Notion', `<button class="btn btn--primary btn--sm" data-toast="Редактор — скоро">${ic('plus')} Статья</button>`)}
      <div style="display:flex;gap:9px;flex-wrap:wrap;margin-bottom:var(--gap)">
        <span class="chip on">Все <small>${items.length}</small></span>
        ${cats.map(c=>`<span class="chip" data-toast="${esc(c.cat)}">${esc(c.cat)} <small>${c.n}</small></span>`).join('')}
      </div>
      <div class="three">
        ${items.map(k=>`<div class="card card--pad card--hover kb" data-toast="Открываю: ${esc(k.title)}">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">${pill(k.cat,'acc')}${k.pinned?`<span style="color:var(--warn)">${ic('trophy')}</span>`:''}</div>
          <h3 style="font-family:var(--font-head);font-size:15.5px;font-weight:600;margin-bottom:9px;line-height:1.35">${esc(k.title)}</h3>
          <p style="color:var(--text-3);font-size:12.5px;line-height:1.65;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">${esc(k.body)}</p>
          <div style="margin-top:16px;color:var(--text-4);font-size:11.5px">обновлено ${UQ.fmtDay(k.updated)}</div>
        </div>`).join('')}
      </div>`;
  }

  /* ════════════════════════ АВТОМАТИЗАЦИЯ ═══════════════════════════════ */
  function vAutomation(){
    const flows=[
      {name:'Оплата → запуск проекта',trigger:'Сделка оплачена',steps:['Создать проект','Назначить сборщика','Создать задачи','Уведомить клиента','Выставить счёт'],on:true},
      {name:'Новый лид → приветствие',trigger:'Лид добавлен',steps:['Отправить в WhatsApp','Назначить менеджера','Задача «позвонить»'],on:true},
      {name:'Сделка застряла → напоминание',trigger:'Нет активности 3 дня',steps:['Уведомить менеджера','Поднять в топ'],on:true},
      {name:'Клиент не платит → эскалация',trigger:'Просрочка абонплаты 7 дней',steps:['Уведомить владельца','Пометить риск','Задача поддержке'],on:false},
    ];
    return `${topbar('Автоматизация','ЕСЛИ → ТО · процессы без кода', `<button class="btn btn--primary btn--sm" data-toast="Конструктор — скоро">${ic('plus')} Сценарий</button>`)}
      <div class="grid" style="gap:14px">
        ${flows.map(f=>`<div class="card card--pad">
          <div style="display:flex;align-items:center;gap:13px;margin-bottom:18px"><div class="flow__ic">${ic('flow')}</div><div style="flex:1"><b style="font-size:15px;font-family:var(--font-head)">${esc(f.name)}</b><div style="color:var(--text-3);font-size:12px;margin-top:2px">Триггер: ${esc(f.trigger)}</div></div><span class="toggle ${f.on?'on':''}" data-toast="Переключатель сценария"><i></i></span></div>
          <div class="board-scroll"><div class="flow__chain">
            <span class="flow__node flow__node--trig">${ic('bolt')} ${esc(f.trigger)}</span>
            ${f.steps.map(s=>`<span class="flow__arrow">${ic('arrow')}</span><span class="flow__node">${esc(s)}</span>`).join('')}
          </div></div>
        </div>`).join('')}
      </div>`;
  }

  /* ════════════════════════ УВЕДОМЛЕНИЯ ═════════════════════════════════ */
  function vNotifications(){
    const ns=UQ.notifications();
    const pinned=ns.filter(n=>n.pinned), rest=ns.filter(n=>!n.pinned);
    const PR={critical:['Критично','bad'],high:['Важно','warn'],normal:['Обычное','']};
    const nicon=t=>t==='finance'?'coins':t==='client'?'users':t==='project'?'layers':t==='hr'?'idcard':'trend';
    const row=n=>{ const pr=PR[n.priority]||PR.normal; return `<div class="notif ${n.read?'read':''} ${n.priority==='critical'?'notif--crit':''}" data-notif="${n.id}">
      <div class="notif__ic pill--${pr[1]||'acc'}">${ic(nicon(n.type))}</div>
      <div class="notif__b"><div style="display:flex;align-items:center;gap:9px;margin-bottom:3px"><b style="font-size:14px">${esc(n.title)}</b>${n.priority!=='normal'?pill(pr[0],pr[1]):''}${n.pinned?`<span style="color:var(--warn)">${ic('trophy')}</span>`:''}</div><p style="color:var(--text-3);font-size:13px">${esc(n.text)}</p></div>
      <div class="notif__t">${ago(n.at)}${!n.read?'<span class="notif__unread"></span>':''}</div>
    </div>`; };
    return `${topbar('Уведомления','Центр событий · '+UQ.notifUnread()+' непрочитанных', `<button class="btn btn--sm" data-marknotif>${ic('check')} Прочитать всё</button>`)}
      ${pinned.length?`<div class="sec-h"><div class="eyebrow">Закреплено</div><div class="line"></div></div><div class="grid" style="gap:11px">${pinned.map(row).join('')}</div>`:''}
      <div class="sec-h"><div class="eyebrow">Все события</div><div class="line"></div></div>
      <div class="grid" style="gap:11px">${rest.map(row).join('')||emptyState('bell','Тихо','Новые события появятся здесь')}</div>`;
  }

  /* ════════════════════════ УПРАВЛЕНИЕ (только владелец) ═════════════════ */
  function vSettings(){
    const prof = (UQ.cloud && UQ.cloud.profile) || null;
    const whoName = prof ? prof.name : 'Матвей';
    const ver = (window.UQ_CLOUD && UQ_CLOUD.v) ? UQ_CLOUD.v : 'локальная демо';
    const heads = UQ.heads();
    const managers = UQ.plainManagers();
    return `${topbar('Управление','Аккаунт · доступы · настройки · статус системы')}
      <div class="two">
        <div class="card card--pad">
          <div class="card__head"><div><div class="eyebrow">Аккаунт</div><h3 style="margin-top:2px">Ты вошёл как</h3></div></div>
          <div class="side__who" style="padding:6px 0 18px;gap:12px">${av(whoName,'#8b7cf6')}<div style="flex:1"><b style="font-size:15px">${esc(whoName)}</b><small style="color:var(--text-3)">Владелец · полный доступ ко всему</small></div></div>
          <button class="btn btn--ghost btn--block" data-logout style="border-color:rgba(255,107,129,.3);color:var(--bad)">${ic('logout')} Выйти из аккаунта</button>
          <div style="margin-top:12px;color:var(--text-4);font-size:12px;line-height:1.5">Выход вернёт на экран входа. Данные и доступы других не пострадают.</div>
        </div>
        <div class="card card--pad">
          <div class="card__head"><div><div class="eyebrow">Система</div><h3 style="margin-top:2px">Статус</h3></div>${pill('Работает','good')}</div>
          <div class="drow"><small style="color:var(--text-3)">Домен</small><span class="deploy">${ic('globe')}command.uniqore.pro</span></div>
          <div class="drow"><small style="color:var(--text-3)">Версия сборки</small><span class="num">${esc(ver)}</span></div>
          <div class="drow"><small style="color:var(--text-3)">База данных</small><span style="font-size:13px">Supabase · защита RLS</span></div>
          <div class="drow"><small style="color:var(--text-3)">Кэш</small><span style="font-size:13px;color:var(--good)">авто-сброс каждый деплой</span></div>
        </div>
      </div>
      <div class="sec-h"><div class="eyebrow">Доступы</div><h2>Кто в системе</h2><div class="line"></div><button class="btn btn--primary btn--sm" data-invite>${ic('plus')} Добавить менеджера</button></div>
      <div class="card card--pad">
        <table class="tbl"><thead><tr><th>Человек</th><th>Роль</th><th>Город</th><th style="text-align:right">Статус</th></tr></thead><tbody>
          <tr><td><div class="cell-user">${av(whoName,'#8b7cf6')}<b>${esc(whoName)}</b></div></td><td>${pill('Владелец','acc')}</td><td>—</td><td style="text-align:right">${pill('Активен','good')}</td></tr>
          ${heads.map(h=>`<tr><td><div class="cell-user">${av(h.name,h.color)}<b>${esc(h.name)}</b></div></td><td>${pill('Руководитель','acc')}</td><td>${esc(h.city||'—')}</td><td style="text-align:right">${pill('Активен','good')}</td></tr>`).join('')}
          ${managers.map(m=>`<tr><td><div class="cell-user">${av(m.name,m.color)}<b>${esc(m.name)}</b></div></td><td>${pill('Менеджер')}</td><td>${esc(m.city||'—')}</td><td style="text-align:right">${m.status==='blocked'?pill('Заблокирован','bad'):pill('Активен','good')}</td></tr>`).join('')}
        </tbody></table>
      </div>
      <div class="sec-h"><div class="eyebrow">Настройки</div><h2>Экономика продаж</h2><div class="line"></div></div>
      <div class="kpirow">
        <div class="card kpi"><div class="eyebrow">Цена CRM</div><div class="kpi__val">${usd(UQ.SERVICE)}</div><div class="kpi__sub">за сборку</div></div>
        <div class="card kpi"><div class="eyebrow">Менеджеру за сделку</div><div class="kpi__val">${usd(UQ.CUT)}</div><div class="kpi__sub">выплата оператору</div></div>
        <div class="card kpi"><div class="eyebrow">Маржа со сделки</div><div class="kpi__val" style="color:var(--good)">${usd(UQ.NET)}</div><div class="kpi__sub">чистыми компании</div></div>
        <div class="card kpi"><div class="eyebrow">Лимит номеров/день</div><div class="kpi__val">20–80</div><div class="kpi__sub">растёт по KPI</div></div>
      </div>`;
  }

  /* ── call modal ─────────────────────────────────────────────────────── */
  const CALL_STAGES=['Не дозвонился','Секретарь / не ЛПР','ЛПР — сразу нет','После презентации','После цены','Просил перезвонить'];
  const OBJECTIONS=['Дорого','Уже есть CRM','Нет времени','Не вижу ценности','Надо подумать','Не доверяю','Другое'];
  let modalLead=null, modalRevealed=false, modalStatus=null, modalDraft={comment:'',reason:'',cb:'',stage:'',objection:''};
  let callStart=0, callTimerInt=null;
  function fmtDur(s){ const mm=Math.floor(s/60), ss=s%60; return (mm<10?'0':'')+mm+':'+(ss<10?'0':'')+ss; }
  function startCallTimer(){ clearInterval(callTimerInt); callTimerInt=setInterval(()=>{ const el=$('#callTimer'); if(el) el.textContent=fmtDur(Math.floor((Date.now()-callStart)/1000)); },1000); }
  function stopCallTimer(){ clearInterval(callTimerInt); callTimerInt=null; }
  function openCall(id){
    const l=S.leads.find(x=>x.id===id); if(!l) return;
    modalLead=l; modalRevealed=(l.status!=='new'); modalStatus=(l.status!=='new'?l.status:null);
    modalDraft={ comment:l.comment||'', reason:l.reason||'', cb:l.callbackDate?new Date(l.callbackDate).toISOString().slice(0,16):'', stage:l.stage||'', objection:l.objection||'' };
    renderModal();
  }
  function renderModal(){
    const l=modalLead; if(!l) return;
    let scrim=$('#scrim'); if(!scrim){ scrim=document.createElement('div'); scrim.id='scrim'; scrim.className='scrim'; document.body.appendChild(scrim); }
    const s=modalStatus?UQ.STATUS[modalStatus]:null;
    scrim.innerHTML=`<div class="modal" data-modal>
      <div class="modal__head">
        <span class="brand__mark" style="width:44px;height:44px">${ic('phone')}</span>
        <div><h3>${esc(l.business)}</h3><p>${esc(l.niche)} · ${esc(l.city)}</p></div>
        <button class="modal__x" data-close>${ic('x')}</button>
      </div>
      <div class="modal__body">
        <div class="phonebig">
          <b class="${modalRevealed?'':'masked'}">${modalRevealed?esc(l.phone):'+7 ••• ••• •• ••'}</b>
          ${modalRevealed
            ? `<button class="btn btn--sm" data-copy="${esc(l.phone)}">${ic('copy')} Копировать</button>`
            : `<button class="btn btn--primary btn--sm" data-reveal>${ic('phone')} Позвонил</button>`}
        </div>
        ${modalRevealed?`<div class="calltimerbar"><span class="calltimerbar__live"></span>Идёт звонок<span class="calltimer" id="callTimer">00:00</span></div>`:''}
        ${(()=>{ const pains=(l.pains&&l.pains.length)?l.pains:UQ.pickPains(l.niche); return `<div style="background:rgba(139,124,246,.08);border:1px solid var(--acc-line);border-radius:var(--radius-sm);padding:12px 14px">
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--acc-2);font-weight:700;margin-bottom:8px;display:flex;align-items:center;gap:6px">${ic('bolt')} О чём говорить · боли ниши «${esc(l.niche)}»</div>
          ${pains.map(p=>`<div style="display:flex;gap:8px;align-items:flex-start;font-size:12.5px;color:var(--text-2);margin-bottom:6px;line-height:1.45"><span style="color:var(--acc-2);flex-shrink:0;margin-top:1px">${ic('check')}</span><span>${esc(p)}</span></div>`).join('')}</div>`; })()}
        <div class="objinline">
          <div class="objinline__t">${ic('shield')} Возражение? Жми — прочитай ответ вслух</div>
          <div class="objgrid">${OBJECTIONS.map(o=>`<button class="objchip ${modalDraft.objection===o?'on':''}" data-obj="${esc(o)}">${esc(o)}</button>`).join('')}</div>
          <div class="objreply" data-objreply>${modalDraft.objection?`<div class="objreply__a">${ic('check')} <span>${esc(UQ.objectionReply(modalDraft.objection))}</span></div>`:`<span style="color:var(--text-4);font-size:12px">Ответ появится здесь</span>`}</div>
        </div>
        ${!modalRevealed?`<div style="color:var(--text-4);font-size:12px;text-align:center">Номер откроется после нажатия «Позвонил»</div>`:`
        <div class="field"><label>Итог звонка <span class="req">*</span></label>
          <div class="statuspick">${Object.keys(UQ.STATUS).map(k=>{ const st=UQ.STATUS[k];
            return `<button class="statusopt ${modalStatus===k?'on':''}" data-status="${k}"><span class="sdot" style="background:${st.color}"></span>${st.label}</button>`;}).join('')}</div></div>
        ${modalStatus==='refused'?`<div class="field"><label>Причина отказа <span class="req">*</span></label>
          <select class="select" data-reason><option value="">Выбери причину…</option>${['Дорого','Уже есть CRM','Нет ЛПР','Не интересно','Просил не звонить','Другое'].map(r=>`<option ${modalDraft.reason===r?'selected':''}>${r}</option>`).join('')}</select></div>`:''}
        ${modalStatus==='callback'?`<div class="field"><label>Когда перезвонить <span class="req">*</span></label>
          <input class="input" type="datetime-local" data-cb value="${esc(modalDraft.cb)}"></div>`:''}
        ${modalStatus && modalStatus!=='deal'?`<div class="field"><label>На каком этапе сорвалось <small style="color:var(--text-4);font-weight:400">— по желанию</small></label>
          <select class="select" data-stage><option value="">Не указывать…</option>${CALL_STAGES.map(s=>`<option ${modalDraft.stage===s?'selected':''}>${esc(s)}</option>`).join('')}</select></div>`:''}
        <div class="field"><label>Комментарий</label><textarea class="textarea" data-comment placeholder="Что важного сказал клиент…">${esc(modalDraft.comment)}</textarea></div>`}
      </div>
      <div class="modal__foot">
        <button class="btn btn--ghost" data-close>Отмена</button>
        <button class="btn btn--primary btn--block" data-savecall ${(!modalRevealed||!modalStatus)?'disabled':''}>${ic('check')} Сохранить результат</button>
      </div>
    </div>`;
  }
  function closeModal(){ stopCallTimer(); callStart=0; const s=$('#scrim'); if(s) s.remove(); modalLead=null; modalRevealed=false; modalStatus=null; inviteResult=null; inviteBusy=false; inviteErr=''; penTarget=null; penErr=''; opDraft=null; }

  /* ── invite manager (owner/head — генерация логина прямо в CRM) ───────── */
  let inviteResult=null, inviteBusy=false, inviteErr='';
  function openInvite(){ inviteResult=null; inviteBusy=false; inviteErr=''; renderInvite(); }
  function renderInvite(){
    let scrim=$('#scrim'); if(!scrim){ scrim=document.createElement('div'); scrim.id='scrim'; scrim.className='scrim'; document.body.appendChild(scrim); }
    if(inviteResult){
      const r=inviteResult;
      scrim.innerHTML=`<div class="modal" data-modal style="max-width:420px">
        <div class="modal__head"><span class="brand__mark" style="width:44px;height:44px;background:linear-gradient(150deg,#5be9b8,#2fae86)">${ic('check')}</span>
          <div><h3>Менеджер добавлен</h3><p>${esc(r.name)}</p></div>
          <button class="modal__x" data-close>${ic('x')}</button></div>
        <div class="modal__body">
          <div style="padding:12px 14px;border-radius:var(--radius-sm);background:rgba(255,197,90,.1);border:1px solid rgba(255,197,90,.25);color:var(--warn);font-size:12.5px;margin-bottom:16px">
            Пароль показывается один раз — сразу перешли его менеджеру
          </div>
          <div class="field"><label>Логин (email)</label><div style="display:flex;gap:8px"><input class="input" readonly value="${esc(r.email)}" style="font-family:var(--font-num)"><button class="btn btn--sm" data-copy="${esc(r.email)}">${ic('copy')}</button></div></div>
          <div class="field"><label>Пароль</label><div style="display:flex;gap:8px"><input class="input" readonly value="${esc(r.password)}" style="font-family:var(--font-num)"><button class="btn btn--sm" data-copy="${esc(r.password)}">${ic('copy')}</button></div></div>
        </div>
        <div class="modal__foot"><button class="btn btn--primary btn--block" data-close>Готово</button></div>
      </div>`;
      return;
    }
    scrim.innerHTML=`<div class="modal" data-modal style="max-width:420px">
      <div class="modal__head"><span class="brand__mark" style="width:44px;height:44px">${ic('headset')}</span>
        <div><h3>Добавить менеджера</h3><p>Логин и пароль сгенерируются сразу</p></div>
        <button class="modal__x" data-close>${ic('x')}</button></div>
      <div class="modal__body">
        <div class="field"><label>Имя <span class="req">*</span></label><input class="input" data-inv-name placeholder="Имя Фамилия" ${inviteBusy?'disabled':''}></div>
        <div class="field"><label>Город</label><input class="input" data-inv-city placeholder="Минск" ${inviteBusy?'disabled':''}></div>
        ${inviteErr?`<div style="color:var(--bad);font-size:12.5px">${esc(inviteErr)}</div>`:''}
      </div>
      <div class="modal__foot">
        <button class="btn btn--ghost" data-close ${inviteBusy?'disabled':''}>Отмена</button>
        <button class="btn btn--primary btn--block" data-invite-submit ${inviteBusy?'disabled':''}>${inviteBusy?'Создаю…':ic('plus')+' Создать'}</button>
      </div>
    </div>`;
  }
  async function submitInvite(){
    const name=($('[data-inv-name]')||{}).value?.trim();
    const city=($('[data-inv-city]')||{}).value?.trim();
    if(!name){ inviteErr='Укажи имя'; renderInvite(); return; }
    inviteBusy=true; inviteErr=''; renderInvite();
    try{
      const r = await UQ.inviteManager({name, city});
      inviteBusy=false; inviteResult=r; renderInvite();
      if(view==='managers') rerender();
    }catch(e){
      inviteBusy=false; inviteErr=(e&&e.message)||'Не получилось создать — попробуй ещё раз'; renderInvite();
    }
  }

  /* ── penalties (owner + head → штрафуют сотрудников) ─────────────────── */
  function actorName(){ return S.session.role==='admin'?'Матвей':(UQ.manager(S.session.managerId)||{}).name||'Руководитель'; }
  function canPenalize(){ return S.session.role==='admin'||S.session.role==='head'; }
  const PEN_REASONS=['Опоздание','Прогул смены','Не выполнил план','Нарушение скрипта','Грубость с клиентом','Слив базы','Другое'];
  let penTarget=null, penErr='';
  function openPenalty(targetId,targetType,name){ if(!canPenalize())return; penTarget={targetId,targetType,name}; penErr=''; renderPenalty(); }
  function renderPenalty(){
    if(!penTarget) return;
    let scrim=$('#scrim'); if(!scrim){ scrim=document.createElement('div'); scrim.id='scrim'; scrim.className='scrim'; document.body.appendChild(scrim); }
    const hist=UQ.penaltiesFor(penTarget.targetId);
    scrim.innerHTML=`<div class="modal" data-modal style="max-width:440px">
      <div class="modal__head"><span class="brand__mark" style="width:44px;height:44px;background:linear-gradient(150deg,#ff9f5a,#ff6b81)">${ic('bolt')}</span>
        <div><h3>Штраф сотруднику</h3><p>${esc(penTarget.name||'')}</p></div>
        <button class="modal__x" data-close>${ic('x')}</button></div>
      <div class="modal__body">
        <div class="field"><label>Сумма штрафа, $ <span class="req">*</span></label><input class="input" type="number" min="1" data-pen-amount placeholder="20" style="font-family:var(--font-num)"></div>
        <div class="field"><label>Причина <span class="req">*</span></label>
          <select class="select" data-pen-reason><option value="">Выбери причину…</option>${PEN_REASONS.map(r=>`<option>${r}</option>`).join('')}</select></div>
        ${penErr?`<div style="color:var(--bad);font-size:12.5px">${esc(penErr)}</div>`:''}
        ${hist.length?`<div><div class="dsec__t" style="margin-top:6px">${ic('list')} История штрафов · всего −${usd(UQ.finesFor(penTarget.targetId))}</div>
          ${hist.map(p=>`<div class="drow"><small>${esc(p.reason)} · ${UQ.fmtDay(p.at)} · ${esc((p.by||'').split(' ')[0])}</small><span class="num" style="color:var(--bad);display:inline-flex;gap:8px;align-items:center">−${usd(p.amount)} <button class="btn btn--ghost btn--sm" data-delpen="${p.id}" title="Снять">${ic('x')}</button></span></div>`).join('')}</div>`:''}
      </div>
      <div class="modal__foot"><button class="btn btn--ghost" data-close>Отмена</button>
        <button class="btn btn--primary btn--block" data-pensubmit style="background:linear-gradient(135deg,#ff9f5a,#ff6b81)">${ic('bolt')} Оштрафовать</button></div>
    </div>`;
  }
  function submitPenalty(){
    if(!penTarget) return;
    const amount=+(($('[data-pen-amount]')||{}).value||0);
    const reason=(($('[data-pen-reason]')||{}).value||'').trim();
    if(!amount||amount<1){ penErr='Укажи сумму штрафа'; renderPenalty(); return; }
    if(!reason){ penErr='Выбери причину'; renderPenalty(); return; }
    const tt={...penTarget};
    UQ.addPenalty({targetId:tt.targetId,targetType:tt.targetType,name:tt.name,amount,reason,by:actorName()});
    toast('Штраф назначен: −'+usd(amount));
    closeModal(); rerender();
    if(drawerCur && drawerCur.id===tt.targetId) openDrawer(drawerCur.type,drawerCur.id);
  }

  /* ── finance operation modal (owner → доход/расход вручную) ──────────── */
  let opDraft=null, opErr='';
  const OP_CATS={ income:['Продажа CRM','Абонплата (MRR)','Доработки','Возврат','Прочее'], expense:['Выплаты менеджерам','Зарплаты команды','Реклама','Сервер / инфра','Инструменты / API','Налоги','Аренда','Прочее'] };
  function openOp(){ opDraft={type:'expense',cat:'',amount:'',acc:(UQ.accounts()[0]||{}).name||'',note:''}; opErr=''; renderOp(); }
  function readOp(){ if(!opDraft) return; const g=s=>{const el=$(s);return el?el.value:undefined;};
    const am=g('[data-op-amount]'); if(am!==undefined) opDraft.amount=am;
    const nt=g('[data-op-note]'); if(nt!==undefined) opDraft.note=nt;
    const ac=g('[data-op-acc]'); if(ac!==undefined) opDraft.acc=ac;
    const ct=g('[data-op-cat]'); if(ct!==undefined) opDraft.cat=ct;
  }
  function renderOp(){
    if(!opDraft) return;
    let scrim=$('#scrim'); if(!scrim){ scrim=document.createElement('div'); scrim.id='scrim'; scrim.className='scrim'; document.body.appendChild(scrim); }
    const accs=UQ.accounts(); const cats=OP_CATS[opDraft.type]||[];
    scrim.innerHTML=`<div class="modal" data-modal style="max-width:440px">
      <div class="modal__head"><span class="brand__mark" style="width:44px;height:44px">${ic('coins')}</span>
        <div><h3>Новая операция</h3><p>Доход или расход компании</p></div>
        <button class="modal__x" data-close>${ic('x')}</button></div>
      <div class="modal__body">
        <div class="field"><label>Тип</label><div class="statuspick" style="grid-template-columns:1fr 1fr">
          <button type="button" class="statusopt ${opDraft.type==='expense'?'on':''}" data-optype="expense"><span class="sdot" style="background:var(--bad)"></span>Расход</button>
          <button type="button" class="statusopt ${opDraft.type==='income'?'on':''}" data-optype="income"><span class="sdot" style="background:var(--good)"></span>Доход</button>
        </div></div>
        <div class="field"><label>Категория <span class="req">*</span></label>
          <select class="select" data-op-cat><option value="">Выбери…</option>${cats.map(c=>`<option ${opDraft.cat===c?'selected':''}>${c}</option>`).join('')}</select></div>
        <div class="field"><label>Сумма, $ <span class="req">*</span></label><input class="input" type="number" min="1" data-op-amount value="${esc(String(opDraft.amount||''))}" placeholder="1200" style="font-family:var(--font-num)"></div>
        <div class="field"><label>Счёт</label><select class="select" data-op-acc>${accs.map(a=>`<option ${opDraft.acc===a.name?'selected':''}>${esc(a.name)}</option>`).join('')}</select></div>
        <div class="field"><label>Заметка</label><input class="input" data-op-note value="${esc(opDraft.note||'')}" placeholder="Комментарий (по желанию)"></div>
        ${opErr?`<div style="color:var(--bad);font-size:12.5px">${esc(opErr)}</div>`:''}
      </div>
      <div class="modal__foot"><button class="btn btn--ghost" data-close>Отмена</button>
        <button class="btn btn--primary btn--block" data-opsubmit>${ic('check')} Добавить</button></div>
    </div>`;
  }
  function submitOp(){
    if(!opDraft) return; readOp();
    if(!opDraft.cat){ opErr='Выбери категорию'; renderOp(); return; }
    const amount=+opDraft.amount; if(!amount||amount<1){ opErr='Укажи сумму'; renderOp(); return; }
    UQ.addOperation({type:opDraft.type,cat:opDraft.cat,amount,acc:opDraft.acc,note:opDraft.note});
    toast(opDraft.type==='income'?'Доход добавлен':'Расход добавлен'); closeModal(); rerender();
  }

  /* ── entity drawer (полный профиль) ─────────────────────────────────── */
  let drawerOpen=false, drawerCur=null;
  const nrm=s=>(s||'').toLowerCase().replace(/[«»"'·•]/g,' ').trim();
  function clientRelated(c){
    const kws=nrm(c.name).split(/\s+/).filter(w=>w.length>3);
    const match=str=>{ const n=nrm(str); return kws.some(w=>n.includes(w)); };
    return { deals:UQ.deals().filter(d=>match(d.client)), projects:UQ.projects().filter(p=>match(p.client)||match(p.name)) };
  }
  function clientAI(c){
    const days=Math.round((Date.now()-new Date(c.since))/864e5);
    const bits=[`Клиент ${days} дн.`, c.status==='live'?'CRM работает стабильно':c.status==='building'?'на сборке':c.status==='support'?'на поддержке':'онбординг', c.mrr?`платит ${usd(c.mrr)}/мес`:'разовая оплата'];
    const ltv=(c.value||0)+(c.mrr||0)*6;
    const risk=c.health==='good'?'Риск ухода низкий — можно предлагать апселл или реферала.':c.health==='warn'?'⚠ Следи за оплатой и вовлечённостью — не давай остыть.':'⚠ Высокий риск ухода — свяжись сегодня.';
    return `${bits.join(' · ')}. LTV ≈ ${usd(ltv)}. ${risk}`;
  }
  function openDrawer(type,id){
    let html='';
    if(type==='client') html=drClient(UQ.client(id));
    else if(type==='emp') html=drEmployee(UQ.employee(id));
    else if(type==='deal') html=drDeal(UQ.deals().find(d=>d.id===id));
    else if(type==='project') html=drProject(UQ.projects().find(p=>p.id===id));
    if(!html) return;
    drawerCur={type,id};
    let s=$('#drawerScrim'); if(!s){ s=document.createElement('div'); s.id='drawerScrim'; s.className='drawer-scrim'; s.addEventListener('click',closeDrawer); document.body.appendChild(s); }
    let d=$('#drawer'); if(!d){ d=document.createElement('div'); d.id='drawer'; d.className='drawer'; document.body.appendChild(d); }
    d.innerHTML=html; drawerOpen=true; d.scrollTop=0;
    requestAnimationFrame(()=>d.querySelectorAll('.kr__fill[data-w]').forEach(f=>f.style.width=f.dataset.w));
  }
  function closeDrawer(){ const s=$('#drawerScrim'),d=$('#drawer'); if(d){ d.classList.add('closing'); if(s)s.classList.add('closing'); setTimeout(()=>{ if(d)d.remove(); if(s)s.remove(); },240); } else if(s){ s.remove(); } drawerOpen=false; drawerCur=null; }

  function drClient(c){ if(!c) return ''; const rel=clientRelated(c); const cst=UQ.CSTATUS[c.status]||{label:c.status,pill:''}; const days=Math.round((Date.now()-new Date(c.since))/864e5);
    return `<div class="drawer__head"><button class="drawer__x" data-dclose>${ic('x')}</button>
      <div class="drawer__eyebrow">${pill(cst.label,cst.pill)}<span class="health health--${c.health==='good'?'good':c.health==='warn'?'warn':'risk'}"></span><span class="recipe-tag">${esc(c.recipe)}</span></div>
      <div class="drawer__id">${av(c.name,'#8b7cf6')}<div><h2>${esc(c.name)}</h2><div class="drawer__sub">${esc(c.niche)}<span class="dotsep"></span>вёл ${esc(c.manager.split(' ')[0])}${c.deploy!=='—'?`<span class="dotsep"></span><span class="deploy">${ic('globe')}${esc(c.deploy)}</span>`:''}</div></div></div></div>
      <div class="drawer__body">
        <div class="dstat"><div><small>Сборка</small><b>${usd(c.value)}</b></div><div><small>Поддержка</small><b>${c.mrr?usd(c.mrr):'—'}</b></div><div><small>С нами</small><b>${days} дн.</b></div></div>
        <div><div class="dsec__t">${ic('ai')} AI-сводка по клиенту</div><div class="aibox"><div class="aibox__ic">${ic('ai')}</div><p>${esc(clientAI(c))}</p></div></div>
        <div><div class="dsec__t">${ic('trend')} Сделки (${rel.deals.length})</div>${rel.deals.length?rel.deals.map(d=>`<div class="mini-item" data-open="deal:${d.id}"><div class="pal__i__ic">${ic('trend')}</div><div class="mini-item__b"><b>${esc(d.client)}</b><small>${(UQ.DSTAGES.find(s=>s.id===d.stage)||{}).label||d.stage} · ${esc(d.manager.split(' ')[0])}</small></div><span class="mini-item__v">${usd(d.value)}</span></div>`).join(''):`<div style="color:var(--text-4);font-size:13px">Нет активных сделок</div>`}</div>
        <div><div class="dsec__t">${ic('layers')} Проекты (${rel.projects.length})</div>${rel.projects.length?rel.projects.map(p=>`<div class="mini-item" data-open="project:${p.id}"><div class="pal__i__ic">${ic('layers')}</div><div class="mini-item__b"><b>${esc(p.name)}</b><small>${esc(p.stage)} · ${p.progress}%</small></div><span class="mini-item__v">${p.status==='done'?'готов':'в работе'}</span></div>`).join(''):`<div style="color:var(--text-4);font-size:13px">Нет проектов</div>`}</div>
        <div><div class="dsec__t">${ic('cal')} Активность</div><div class="timeline"><div class="tl-item"><div class="tl-item__ic" style="color:var(--good)">${ic('check')}</div><div class="tl-item__b"><h5>CRM запущена</h5><p>${c.deploy!=='—'?esc(c.deploy):'в процессе'}</p></div><div class="tl-item__t">${days}д</div></div><div class="tl-item"><div class="tl-item__ic" style="color:var(--acc-2)">${ic('doc')}</div><div class="tl-item__b"><h5>Договор · оплата ${usd(c.value)}</h5><p>${esc(c.manager.split(' ')[0])}</p></div><div class="tl-item__t">${days+1}д</div></div></div></div>
      </div>
      <div class="drawer__foot"><button class="btn btn--ghost" data-dclose>Закрыть</button><button class="btn btn--primary btn--block" data-toast="Связаться с клиентом — скоро">${ic('phone')} Связаться</button></div>`;
  }
  function dayPlanHtml(e){
    const p=UQ.dayPlanFor(e);
    if(p.type==='sales'){
      const pct=p.limit?Math.round(p.called/p.limit*100):0;
      return `<div class="dstat"><div><small>Прозвонил</small><b>${p.called}/${p.limit}</b></div><div><small>Осталось</small><b>${p.left}</b></div><div><small>Сделок</small><b style="color:var(--good)">${p.deals}</b></div></div>
        <div style="margin-top:12px"><div class="kr__track"><div class="kr__fill ${pct>=80?'good':''}" style="width:${Math.min(pct,100)}%"></div></div></div>
        <div class="dchip-row" style="margin-top:12px">${pill(p.interested+' в интересе','acc')}${pill(p.callbacks+' перезвон','cyan')}</div>`;
    }
    const ts=p.tasks;
    return ts.length?`<div class="timeline">${ts.map(t=>`<div class="tl-item"><div class="tl-item__ic" style="color:${t.column==='done'?'var(--good)':t.frog?'var(--warn)':'var(--acc-2)'}">${ic(t.column==='done'?'check':t.frog?'bolt':'list')}</div><div class="tl-item__b"><h5>${esc(t.title)}</h5><p>${t.column==='done'?'сделано':t.column==='doing'?'в работе':t.column==='today'?'на сегодня':'бэклог'}${t.frog?' · 🐸 главное':''}</p></div></div>`).join('')}</div>`:`<div style="color:var(--text-4);font-size:13px">На сегодня задач не заведено</div>`;
  }
  function drEmployee(e){ if(!e) return ''; const days=Math.round((Date.now()-new Date(e.since))/864e5); const fine=UQ.finesFor(e.id); const pens=UQ.penaltiesFor(e.id);
    return `<div class="drawer__head"><button class="drawer__x" data-dclose>${ic('x')}</button>
      <div class="drawer__eyebrow">${pill(e.dept,'acc')}${e.status==='probation'?pill('Испытательный','warn'):pill('В штате','good')}</div>
      <div class="drawer__id">${av(e.name,e.color)}<div><h2>${esc(e.name)}</h2><div class="drawer__sub">${esc(e.role)}<span class="dotsep"></span>${days} дн. в команде</div></div></div></div>
      <div class="drawer__body">
        <div class="dstat"><div><small>Оклад</small><b>${usd(e.salary)}</b></div><div><small>Бонус</small><b style="color:var(--good)">+${usd(e.bonus)}</b></div><div><small>Штрафы</small><b style="color:${fine?'var(--bad)':'inherit'}">${fine?'−'+usd(fine):'—'}</b></div></div>
        <div><div class="dsec__t">${ic('cal')} План на сегодня</div>${dayPlanHtml(e)}</div>
        <div><div class="dsec__t">${ic('trend')} KPI эффективности</div><div style="display:flex;align-items:center;gap:14px"><div class="kr__track" style="flex:1"><div class="kr__fill ${e.kpi>=80?'good':''}" data-w="${e.kpi}%" style="width:0"></div></div><b class="num" style="font-size:18px">${e.kpi}%</b></div></div>
        <div><div class="dsec__t">${ic('coins')} К выплате</div><div class="drow"><small>Оклад + бонус − штраф</small><span class="num" style="font-size:16px;font-weight:700">${usd(UQ.empPayout(e))}</span></div></div>
        <div><div class="dsec__t">${ic('bolt')} Штрафы (${pens.length})</div>${pens.length?pens.map(p=>`<div class="drow"><small>${esc(p.reason)} · ${UQ.fmtDay(p.at)} · ${esc((p.by||'').split(' ')[0])}</small><span class="num" style="color:var(--bad)">−${usd(p.amount)}</span></div>`).join(''):`<div style="color:var(--text-4);font-size:13px">Штрафов нет — дисциплина в порядке</div>`}</div>
        <div><div class="dsec__t">${ic('lock')} Доступы</div><div class="dchip-row">${(e.access||[]).map(a=>pill(a)).join('')}</div></div>
        <div><div class="dsec__t">${ic('case')} Оборудование</div><div class="dchip-row">${(e.equipment||[]).map(x=>pill(x)).join('')}</div></div>
      </div>
      <div class="drawer__foot"><button class="btn btn--ghost" data-dclose>Закрыть</button>${canPenalize()?`<button class="btn btn--block" data-penalty="emp:${e.id}" style="background:linear-gradient(135deg,#ff9f5a,#ff6b81);color:#fff">${ic('bolt')} Оштрафовать</button>`:''}</div>`;
  }
  function drDeal(d){ if(!d) return ''; const stages=UQ.DSTAGES; const idx=stages.findIndex(s=>s.id===d.stage); const st=stages[idx]||stages[0];
    return `<div class="drawer__head"><button class="drawer__x" data-dclose>${ic('x')}</button>
      <div class="drawer__eyebrow"><span class="pill" style="color:${st.color};border-color:${st.color}55"><span class="dotx"></span>${st.label}</span>${pill(d.niche)}</div>
      <div class="drawer__id"><span class="brand__mark" style="width:52px;height:52px">${ic('trend')}</span><div><h2>${esc(d.client)}</h2><div class="drawer__sub">Сделка · ${esc(d.manager)}</div></div></div></div>
      <div class="drawer__body">
        <div class="dstat"><div><small>Сумма</small><b>${usd(d.value)}</b></div><div><small>Стадия</small><b style="font-size:15px">${idx+1}/${stages.length}</b></div><div><small>Обновлено</small><b style="font-size:15px">${ago(d.updatedAt)}</b></div></div>
        <div><div class="dsec__t">${ic('trend')} Двигать по воронке</div><div class="dchip-row">${stages.map(s=>`<button class="chip ${s.id===d.stage?'on':''}" data-move="${d.id}:${s.id}">${s.label}</button>`).join('')}</div></div>
        <div><div class="dsec__t">${ic('cal')} История</div><div class="timeline"><div class="tl-item"><div class="tl-item__ic" style="color:${st.color}">${ic('trend')}</div><div class="tl-item__b"><h5>Сейчас: ${st.label}</h5><p>${esc(d.manager)}</p></div><div class="tl-item__t">${ago(d.updatedAt)}</div></div><div class="tl-item"><div class="tl-item__ic" style="color:var(--acc-2)">${ic('spark')}</div><div class="tl-item__b"><h5>Лид создан</h5><p>ниша ${esc(d.niche)}</p></div><div class="tl-item__t">—</div></div></div></div>
      </div>
      <div class="drawer__foot"><button class="btn btn--ghost" data-dclose>Закрыть</button>${d.stage!=='live'?`<button class="btn btn--good btn--block" data-move="${d.id}:live">${ic('check')} Запущен</button>`:`<button class="btn btn--primary btn--block" data-toast="Клиент создан">${ic('case')} В клиенты</button>`}</div>`;
  }
  function drProject(p){ if(!p) return ''; const rk=RISK[p.risk]||RISK.low; const over=p.status==='active'&&p.deadline&&new Date(p.deadline)<Date.now();
    return `<div class="drawer__head"><button class="drawer__x" data-dclose>${ic('x')}</button>
      <div class="drawer__eyebrow">${p.status==='done'?pill('Запущен','good'):pill(p.stage,'acc')}${pill('Риск: '+rk[0],rk[1])}</div>
      <div class="drawer__id"><span class="brand__mark" style="width:52px;height:52px">${ic('layers')}</span><div><h2>${esc(p.name)}</h2><div class="drawer__sub">Клиент ${esc(p.client)}<span class="dotsep"></span>${esc(p.owner)}</div></div></div></div>
      <div class="drawer__body">
        <div class="dstat"><div><small>Цена</small><b>${usd(p.price)}</b></div><div><small>Себестоимость</small><b>${usd(p.cost)}</b></div><div><small>Прибыль</small><b style="color:var(--good)">${usd(p.price-p.cost)}</b></div></div>
        <div><div class="dsec__t">${ic('bolt')} Прогресс</div><div style="display:flex;align-items:center;gap:14px"><div class="kr__track" style="flex:1"><div class="kr__fill ${p.progress===100?'good':''}" data-w="${p.progress}%" style="width:0"></div></div><b class="num" style="font-size:18px">${p.progress}%</b></div></div>
        <div><div class="dsec__t">${ic('cal')} Дедлайн</div><div class="drow"><small>Срок сдачи</small><span style="font-weight:600;color:${over?'var(--bad)':'var(--text)'}">${over?'просрочен · '+UQ.fmtDay(p.deadline):UQ.fmtDay(p.deadline)}</span></div></div>
        <div><div class="dsec__t">${ic('doc')} Обсуждение</div><div class="drow"><small>Комментарии команды</small><span>${p.comments||0}</span></div></div>
      </div>
      <div class="drawer__foot"><button class="btn btn--ghost" data-dclose>Закрыть</button><button class="btn btn--primary btn--block" data-toast="Детали проекта — скоро">${ic('layers')} Открыть проект</button></div>`;
  }

  /* ── command palette ⌘K ─────────────────────────────────────────────── */
  let palOpen=false, palSel=0, palItems=[];
  function palIndex(){
    const items=[];
    NAV[S.session.role].forEach(g=>g.items.forEach(it=>items.push({type:'nav',icon:it.icon,label:it.label,sub:'Раздел · '+g.group,go:()=>route(it.v)})));
    if(S.session.role==='admin'){
      UQ.clients().forEach(c=>items.push({type:'Клиент',icon:'case',label:c.name,sub:c.niche,go:()=>openDrawer('client',c.id)}));
      UQ.employees().forEach(e=>items.push({type:'Сотрудник',icon:'users',label:e.name,sub:e.role,go:()=>openDrawer('emp',e.id)}));
      UQ.deals().forEach(d=>items.push({type:'Сделка',icon:'trend',label:d.client,sub:'Сделка · '+usd(d.value),go:()=>openDrawer('deal',d.id)}));
      UQ.projects().forEach(p=>items.push({type:'Проект',icon:'layers',label:p.name,sub:'Проект · '+p.stage,go:()=>openDrawer('project',p.id)}));
      UQ.knowledge().forEach(k=>items.push({type:'Знание',icon:'book',label:k.title,sub:k.cat,go:()=>route('knowledge')}));
    }
    return items;
  }
  function openPal(){
    if($('#palScrim')) return; palOpen=true; palSel=0;
    const s=document.createElement('div'); s.id='palScrim'; s.className='pal-scrim';
    s.innerHTML=`<div class="pal"><div class="pal__in">${ic('search')}<input id="palIn" placeholder="Поиск по клиентам, сделкам, разделам…" autocomplete="off" spellcheck="false"><span class="kbd">ESC</span></div><div class="pal__list" id="palList"></div><div class="pal__foot"><span><b>↑ ↓</b> выбор</span><span><b>↵</b> открыть</span><span><b>esc</b> закрыть</span></div></div>`;
    document.body.appendChild(s);
    const inp=s.querySelector('#palIn');
    inp.addEventListener('input',()=>{ palSel=0; palFilter(inp.value); });
    s.addEventListener('click',e=>{ if(e.target===s){ closePal(); return; } const it=e.target.closest('.pal__i'); if(it){ palSel=+it.dataset.i; palRun(); } });
    palFilter(''); setTimeout(()=>inp.focus(),30);
  }
  function palFilter(q){
    const all=palIndex(); const ql=nrm(q);
    const res = ql? all.filter(i=>nrm(i.label+' '+i.sub).includes(ql)) : all.filter(i=>i.type==='nav');
    palItems=res.slice(0,12);
    const list=$('#palList'); if(!list) return;
    if(!palItems.length){ list.innerHTML=`<div class="pal__empty">Ничего не найдено${q?` по «${esc(q)}»`:''}</div>`; return; }
    list.innerHTML=palItems.map((it,i)=>`<div class="pal__i ${i===palSel?'sel':''}" data-i="${i}"><div class="pal__i__ic">${ic(it.icon)}</div><div class="pal__i__b"><b>${esc(it.label)}</b><small>${esc(it.sub)}</small></div><span class="pal__i__go">${it.type==='nav'?'Перейти':it.type}</span></div>`).join('');
  }
  function palMove(dir){ if(!palItems.length)return; palSel=(palSel+dir+palItems.length)%palItems.length; const list=$('#palList'); if(!list)return; [...list.children].forEach((c,i)=>c.classList&&c.classList.toggle('sel',i===palSel)); const sel=list.children[palSel]; if(sel&&sel.scrollIntoView) sel.scrollIntoView({block:'nearest'}); }
  function palRun(){ const it=palItems[palSel]; if(!it)return; closePal(); it.go(); }
  function closePal(){ const s=$('#palScrim'); if(s) s.remove(); palOpen=false; }

  /* ── after render: animate bars, wire drag, script ──────────────────── */
  let prevView=null;
  function afterRender(v){
    // grow bars + fill progress ring
    requestAnimationFrame(()=>{
      document.querySelectorAll('.bar3d[data-h]').forEach(b=>{ b.style.height=b.dataset.h+'px'; });
      document.querySelectorAll('.focus-ring .prog[data-off]').forEach(p=>{ p.style.strokeDashoffset=p.dataset.off; });
    });
    // KPI count-up + page-enter transition on view change only
    if(v!==prevView){ animateCounts(); const m=$('#main'); if(m){ m.classList.remove('view-enter'); void m.offsetWidth; m.classList.add('view-enter'); } prevView=v; }
    // drag wiring
    if(v==='progress'){ wireKanban(); wireIvy(); }
    if(v==='pipeline') wireDealBoard();
  }
  function wireIvy(){
    let dragId=null;
    document.querySelectorAll('.ivyrow').forEach(r=>{
      r.addEventListener('dragstart',e=>{ dragId=r.dataset.ivy; r.classList.add('dragging'); e.dataTransfer.effectAllowed='move'; });
      r.addEventListener('dragend',()=>r.classList.remove('dragging'));
      r.addEventListener('dragover',e=>e.preventDefault());
      r.addEventListener('drop',e=>{ e.preventDefault(); const t=r.dataset.ivy; if(dragId&&t&&dragId!==t){ UQ.reorderDaily(dragId,t); rerender(); } });
    });
  }
  function animateCounts(){
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    if(reduce) return;
    document.querySelectorAll('.kpi__val, .count-up').forEach(el=>{
      const raw=(el.textContent||'').trim();
      const m=raw.match(/^([^\d\-]*)(-?[\d\s.,]+)(.*)$/);
      if(!m) return;
      const pre=m[1], body=m[2], suf=m[3];
      const hasDot=/\.\d/.test(body);
      const target=parseFloat(body.replace(/\s/g,'').replace(/,/g,''));
      if(isNaN(target)) return;
      const dur=850, t0=performance.now();
      const fmt=x=>pre+(hasDot?x.toFixed(1):Math.round(x).toLocaleString('en-US'))+suf;
      el.textContent=fmt(0);
      (function step(t){ const p=Math.min((t-t0)/dur,1); const e=1-Math.pow(1-p,3.2); el.textContent=fmt(target*e); if(p<1) requestAnimationFrame(step); })(performance.now());
    });
  }
  function wireDealBoard(){
    let dragId=null;
    document.querySelectorAll('.dealcard').forEach(t=>{
      t.addEventListener('dragstart',e=>{ dragId=t.dataset.deal; t.classList.add('dragging'); e.dataTransfer.effectAllowed='move'; });
      t.addEventListener('dragend',()=>{ t.classList.remove('dragging'); document.querySelectorAll('.kcol').forEach(c=>c.classList.remove('dragover')); });
    });
    document.querySelectorAll('[data-dcol]').forEach(col=>{
      col.addEventListener('dragover',e=>{ e.preventDefault(); col.classList.add('dragover'); });
      col.addEventListener('dragleave',()=>col.classList.remove('dragover'));
      col.addEventListener('drop',e=>{ e.preventDefault(); if(dragId){ const to=col.dataset.dcol; UQ.moveDeal(dragId,to); if(to==='live') toast('Сделка запущена 🚀'); rerender(); } });
    });
  }
  function wireKanban(){
    let dragId=null;
    document.querySelectorAll('.ktask').forEach(t=>{
      t.addEventListener('dragstart',e=>{ dragId=t.dataset.task; t.classList.add('dragging'); e.dataTransfer.effectAllowed='move'; });
      t.addEventListener('dragend',()=>{ t.classList.remove('dragging'); document.querySelectorAll('.kcol').forEach(c=>c.classList.remove('dragover')); });
    });
    document.querySelectorAll('.kcol').forEach(col=>{
      col.addEventListener('dragover',e=>{ e.preventDefault(); col.classList.add('dragover'); });
      col.addEventListener('dragleave',()=>col.classList.remove('dragover'));
      col.addEventListener('drop',e=>{ e.preventDefault(); if(dragId){ UQ.moveTask(dragId,col.dataset.col); if(col.dataset.col==='done'){ const t=UQ.tasks().find(x=>x.id===dragId); if(t) UQ.addDone(t.title.slice(0,60),t.owner);} rerender(); } });
    });
  }

  /* ── global event delegation ────────────────────────────────────────── */
  document.addEventListener('click',e=>{
    const t=e.target.closest('[data-nav],[data-role],[data-lead],[data-close],[data-reveal],[data-status],[data-savecall],[data-copy],[data-lfilter],[data-block],[data-pay],[data-assign],[data-assignpreset],[data-addlead],[data-dial],[data-daily],[data-adddaily],[data-addtask],[data-kr],[data-adddone],[data-script],[data-toast],[data-burger],[data-drop],[data-marknotif],[data-notif],[data-open],[data-dclose],[data-move],[data-pal],[data-invite],[data-invite-submit],[data-penalty],[data-pensubmit],[data-delpen],[data-addop],[data-opsubmit],[data-optype],[data-delop],[data-distribute],[data-logout],[data-dialmode],[data-scriptstage],[data-obj]');
    if(!t) return;
    const d=t.dataset;
    if(d.nav){ if($('#side').classList) $('#side').classList.remove('open'); route(d.nav); }
    else if(d.role){ if(window.UQ_CLOUD) return; /* в проде роль строго из логина, смена запрещена */ const role=d.role; S.session.role=role;
      if(role==='head'){ const h=UQ.heads()[0]; if(h) S.session.managerId=h.id; }
      else if(role==='manager' && S.session.managerId==='h1'){ S.session.managerId='m1'; }
      view=DEFAULT_VIEW[role]; UQ.save(); route(view); }
    else if(d.logout!==undefined){ if(UQ.signOut) UQ.signOut(); }
    else if(d.burger!==undefined){ $('#side').classList.toggle('open'); }
    else if(d.lead){ openCall(d.lead); }
    else if(d.close!==undefined){ closeModal(); }
    else if(d.reveal!==undefined){ modalRevealed=true; callStart=Date.now(); try{navigator.clipboard&&navigator.clipboard.writeText(modalLead.phone);}catch(_){} toast('Номер скопирован'); renderModal(); startCallTimer(); }
    else if(d.dialmode){ dialMode=d.dialmode; rerender(); }
    else if(d.scriptstage!==undefined){ t.classList.toggle('open'); }
    else if(d.obj){ modalDraft.objection=d.obj; const reply=UQ.objectionReply(d.obj); document.querySelectorAll('[data-objreply]').forEach(el=>{ el.innerHTML=`<div class="objreply__a">${ic('check')} <span>${esc(reply)}</span></div>`; }); document.querySelectorAll('.objchip').forEach(c=>c.classList.toggle('on', c.dataset.obj===d.obj)); }
    else if(d.status){ modalStatus=d.status; renderModal(); }
    else if(d.copy){ try{navigator.clipboard.writeText(d.copy);}catch(_){} toast('Скопировано'); }
    else if(d.savecall!==undefined){ saveCall(); }
    else if(d.lfilter){ leadFilter.status=d.lfilter; rerender(); }
    else if(d.block){ UQ.blockManager(d.block); toast('Доступ обновлён'); rerender(); }
    else if(d.pay){ UQ.markPaid(d.pay); toast('Выплата проведена'); rerender(); }
    else if(d.assign!==undefined){ const n=UQ.assignPool(assignMgr,assignN,assignNiche); toast(n?(n+' номеров выдано'+(assignNiche!=='all'?' · '+assignNiche:'')):'В пуле нет номеров'+(assignNiche!=='all'?' по нише '+assignNiche:'')); rerender(); }
    else if(d.assignpreset){ assignN=+d.assignpreset; rerender(); }
    else if(d.penalty){ const [tt,id]=d.penalty.split(':'); const nm = tt==='emp'?(UQ.employee(id)||{}).name:(UQ.manager(id)||{}).name; openPenalty(id, tt==='emp'?'employee':'manager', nm); }
    else if(d.pensubmit!==undefined){ submitPenalty(); }
    else if(d.delpen){ UQ.delPenalty(d.delpen); toast('Штраф снят'); if(penTarget) renderPenalty(); if(drawerCur) openDrawer(drawerCur.type,drawerCur.id); if(view==='employees'||view==='managers') rerender(); }
    else if(d.addop!==undefined){ openOp(); }
    else if(d.opsubmit!==undefined){ submitOp(); }
    else if(d.optype){ readOp(); opDraft.type=d.optype; opDraft.cat=''; renderOp(); }
    else if(d.delop){ UQ.delOperation(d.delop); toast('Операция удалена'); rerender(); }
    else if(d.distribute!==undefined){ const list=[...document.querySelectorAll('[data-distn]')].map(i=>({id:i.dataset.distn,n:+i.value||0})); const tot=UQ.distributeNumbers(list); toast(tot?(tot+' номеров роздано по KPI'):'В пуле нет номеров'); rerender(); }
    else if(d.addlead!==undefined){ addLead(); }
    else if(d.dial){ dialFilter=d.dial; rerender(); }
    else if(d.daily){ UQ.toggleDaily(d.daily); rerender(); }
    else if(d.adddaily!==undefined){ const i=$('[data-newdaily]'); if(i&&i.value){ UQ.addDaily(i.value); rerender(); } }
    else if(d.addtask!==undefined){ const title=prompt('Новая задача:'); if(title){ UQ.addTask(title,d.addtask); rerender(); } }
    else if(d.kr!==undefined){ UQ.bumpKR(+d.kr, +d.d); rerender(); }
    else if(d.adddone!==undefined){ const i=$('[data-newdone]'); if(i&&i.value){ UQ.addDone(i.value); rerender(); } }
    else if(d.script!==undefined){ $('#script').classList.toggle('open'); }
    else if(d.marknotif!==undefined){ UQ.markAllNotif(); toast('Все прочитаны'); rerender(); }
    else if(d.notif){ UQ.markNotif(d.notif); rerender(); }
    else if(d.open){ const [t,id]=d.open.split(':'); openDrawer(t,id); }
    else if(d.dclose!==undefined){ closeDrawer(); }
    else if(d.move){ const [did,stg]=d.move.split(':'); UQ.moveDeal(did,stg); toast(stg==='live'?'Сделка запущена 🚀':'Стадия обновлена'); if(view==='pipeline'||view==='dashboard'||view==='clients') rerender(); openDrawer('deal',did); }
    else if(d.pal!==undefined){ openPal(); }
    else if(d.invite!==undefined){ openInvite(); }
    else if(d.inviteSubmit!==undefined){ submitInvite(); }
    else if(d.toast){ toast(d.toast); }
  });

  // inputs (assign / search)
  document.addEventListener('input',e=>{
    const t=e.target;
    if(t.dataset.assignMgr!==undefined) assignMgr=t.value;
    if(t.dataset.assignNiche!==undefined) assignNiche=t.value;
    if(t.dataset.assignN!==undefined) assignN=Math.max(1,Math.min(200,+t.value||1));
    if(t.dataset.lsearch!==undefined){ leadFilter.q=t.value; const val=t.value; rerender(); const i=$('[data-lsearch]'); if(i){ i.focus(); i.setSelectionRange(val.length,val.length);} }
    if(t.dataset.reason!==undefined) modalDraft.reason=t.value;
    if(t.dataset.cb!==undefined) modalDraft.cb=t.value;
    if(t.dataset.stage!==undefined) modalDraft.stage=t.value;
    if(t.dataset.objection!==undefined) modalDraft.objection=t.value;
    if(t.dataset.comment!==undefined) modalDraft.comment=t.value;
  });

  function saveCall(){
    const l=modalLead; if(!l||!modalStatus) return;
    const st=UQ.STATUS[modalStatus];
    const reason=modalDraft.reason, cb=modalDraft.cb, comment=modalDraft.comment;
    if(st.needsReason && !reason){ toast('Укажи причину отказа'); return; }
    if(st.needsDate && !cb){ toast('Выбери дату перезвона'); return; }
    UQ.saveCall(l.id,{status:modalStatus,comment,reason,stage:modalDraft.stage,objection:modalDraft.objection,duration:callStart?Math.floor((Date.now()-callStart)/1000):0,callbackDate:cb?new Date(cb).toISOString():null});
    closeModal();
    if(modalStatus==='deal') toast('Сделка! +$'+UQ.CUT+' 🎉'); else toast('Результат сохранён');
    rerender();
  }
  function addLead(){
    const g=k=>{ const i=document.querySelector(`[data-nl="${k}"]`); return i?i.value.trim():''; };
    const business=g('business'), phone=g('phone');
    if(!business||!phone){ toast('Заполни бизнес и телефон'); return; }
    UQ.addLead({business:business.startsWith('«')?business:'«'+business+'»',phone,city:g('city')||'—',niche:g('niche')||'—'});
    toast('Добавлено в пул'); rerender();
  }
  document.addEventListener('change',e=>{ const ds=e.target.dataset; if(ds.assignMgr!==undefined){ assignMgr=e.target.value; } if(ds.assignNiche!==undefined){ assignNiche=e.target.value; } });
  document.addEventListener('keydown',e=>{
    const k=e.key, palLive=!!$('#palScrim');
    if((e.metaKey||e.ctrlKey) && (k==='k'||k==='K'||k==='л'||k==='Л')){ e.preventDefault(); if(palLive) closePal(); else if(S.session.role==='admin') openPal(); return; }
    if(palLive){
      if(k==='Escape'){ e.preventDefault(); closePal(); }
      else if(k==='ArrowDown'){ e.preventDefault(); palMove(1); }
      else if(k==='ArrowUp'){ e.preventDefault(); palMove(-1); }
      else if(k==='Enter'){ e.preventDefault(); palRun(); }
      return;
    }
    // шорткаты оператора в открытой модалке звонка: 1-7 = статус, Enter = сохранить
    if($('#scrim') && modalLead && modalRevealed){
      const tag=(e.target.tagName||'').toUpperCase();
      const typing = tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT';
      if(!typing){
        const keys=Object.keys(UQ.STATUS);
        if(/^[1-9]$/.test(k)){ const idx=+k-1; if(idx<keys.length){ e.preventDefault(); modalStatus=keys[idx]; renderModal(); } return; }
        if(k==='Enter'){ e.preventDefault(); if(modalStatus) saveCall(); return; }
      }
    }
    if(k==='Escape'){ if($('#drawer')) closeDrawer(); else if($('#scrim')) closeModal(); }
  });

  window.__uqMount = mount;
  window.__uqRerender = rerender;
  if(!window.UQ_CLOUD) mount(); // cloud.js вызывает __uqMount сам, после логина
})();
