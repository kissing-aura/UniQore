'use strict';
// ── Constants ─────────────────────────────────────────────────────────
const STAGES=[{id:'new',label:'Новый',cls:'badge--new',color:'#60a5fa'},{id:'contact',label:'Связались',cls:'badge--contact',color:'#f5c518'},{id:'demo',label:'Демо',cls:'badge--demo',color:'#a78bfa'},{id:'proposal',label:'КП',cls:'badge--proposal',color:'#fb923c'},{id:'won',label:'Оплата ✓',cls:'badge--won',color:'#4ade80'},{id:'lost',label:'Архив',cls:'badge--lost',color:'#4b5563'}];
const SRV={crm:'CRM',bot:'Бот',analytics:'Аналитика',full:'Полный пакет',other:'Другое'};
const SRC={site:'Сайт',tg:'Telegram',ref:'Рекомендация',cold:'Холодный охват',other:'Другое'};
const PR={hot:'🔴',warm:'🟡',cold:'🔵'};
const PRL={hot:'Горячий',warm:'Тёплый',cold:'Холодный'};
const INV_ST={draft:'Черновик',sent:'Выставлен',paid:'Оплачен',overdue:'Просрочен'};

// ── Storage ───────────────────────────────────────────────────────────
const DB={
  leads:()=>parse('uq_leads','[]'),
  tasks:()=>parse('uq_tasks','[]'),
  invoices:()=>parse('uq_invoices','[]'),
  settings:()=>parse('uq_settings','{}'),
  saveLeads:d=>ls('uq_leads',d),
  saveTasks:d=>ls('uq_tasks',d),
  saveInvoices:d=>ls('uq_invoices',d),
  saveSettings:d=>ls('uq_settings',d),
};
function parse(k,def){try{return JSON.parse(localStorage.getItem(k)||def);}catch{return JSON.parse(def);}}
function ls(k,v){localStorage.setItem(k,JSON.stringify(v));}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7);}

// ── Utils ─────────────────────────────────────────────────────────────
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function fmtDate(iso){if(!iso)return'—';const d=new Date(iso);return d.toLocaleDateString('ru-RU',{day:'2-digit',month:'2-digit',year:'2-digit'});}
function fmtMoney(n){if(!n)return'—';return Number(n).toLocaleString('ru-RU')+' ₽';}
function daysSince(iso){if(!iso)return 0;return Math.floor((Date.now()-new Date(iso))/86400000);}
function isOverdue(d){if(!d)return false;return new Date(d)<new Date(new Date().toDateString());}
function isToday(d){if(!d)return false;return new Date(d).toDateString()===new Date().toDateString();}
function stageBadge(id){const s=STAGES.find(x=>x.id===id)||STAGES[0];return`<span class="badge ${s.cls}">${s.label}</span>`;}
function pdot(p){return`<span class="pdot pdot--${p||'warm'}"></span>`;}
function tag(text,cls=''){return`<span class="tag ${cls}">${esc(text)}</span>`;}

// ── View routing ──────────────────────────────────────────────────────
let VIEW='dashboard',DETAIL_ID=null,DRAG_ID=null;
const TITLES={dashboard:'Дашборд',kanban:'Pipeline',leads:'Лиды',tasks:'Задачи',clients:'Клиенты',analytics:'Аналитика',finance:'Финансы',settings:'Настройки'};

function showView(v){
  VIEW=v;
  document.querySelectorAll('.view').forEach(el=>el.classList.add('hidden'));
  document.getElementById('view-'+v).classList.remove('hidden');
  document.querySelectorAll('.nav__item').forEach(el=>el.classList.toggle('active',el.dataset.view===v));
  document.getElementById('pageTitle').textContent=TITLES[v];
  const renders={dashboard:renderDashboard,kanban:renderKanban,leads:renderLeads,tasks:renderTasks,clients:renderClients,analytics:renderAnalytics,finance:renderFinance,settings:renderSettings};
  renders[v]?.();
  updateBadges();
}
function refresh(){showView(VIEW);}

function updateBadges(){
  const tasks=DB.tasks();
  const overdueTasks=tasks.filter(t=>!t.done&&t.deadline&&isOverdue(t.deadline)).length;
  const todayTasks=tasks.filter(t=>!t.done&&t.deadline&&isToday(t.deadline)).length;
  const tb=document.getElementById('badge-tasks');
  if(overdueTasks+todayTasks>0){tb.textContent=overdueTasks+todayTasks;tb.classList.remove('hidden');}else tb.classList.add('hidden');
  const invs=DB.invoices();
  const overdueInv=invs.filter(i=>i.status==='overdue').length;
  const fb=document.getElementById('badge-finance');
  if(overdueInv>0){fb.textContent=overdueInv;fb.classList.remove('hidden');}else fb.classList.add('hidden');
}

// ── Dashboard ─────────────────────────────────────────────────────────
function renderDashboard(){
  const leads=DB.leads();
  const active=leads.filter(l=>!['won','lost'].includes(l.stage));
  const won=leads.filter(l=>l.stage==='won');
  const hot=leads.filter(l=>l.priority==='hot'&&l.stage!=='lost');
  const revenue=active.reduce((s,l)=>s+(Number(l.budget)||0),0);
  const conv=leads.length?Math.round(won.length/leads.length*100):0;
  const tasks=DB.tasks();
  const overdueTasks=tasks.filter(t=>!t.done&&t.deadline&&isOverdue(t.deadline)).length;

  document.getElementById('dashKpi').innerHTML=`
    <div class="kpi kpi--acc"><div class="kpi__label">Выручка в воронке</div><div class="kpi__val kpi__val--acc">${revenue?revenue.toLocaleString('ru-RU')+' ₽':'0 ₽'}</div><div class="kpi__sub">${active.length} активных лидов</div></div>
    <div class="kpi"><div class="kpi__label">Всего лидов</div><div class="kpi__val">${leads.length}</div><div class="kpi__sub">${won.length} закрыто</div></div>
    <div class="kpi"><div class="kpi__label">Конверсия</div><div class="kpi__val kpi__val--green">${conv}%</div><div class="kpi__sub">закрыто / всего</div></div>
    <div class="kpi"><div class="kpi__label">Задач просрочено</div><div class="kpi__val ${overdueTasks?'kpi__val--red':''}">${overdueTasks}</div><div class="kpi__sub">горячих лидов: ${hot.length}</div></div>`;

  drawFunnel('funnelCanvas',leads);
  drawDonut('sourceCanvas','sourceLegend',leads);

  // Follow-ups
  const fu=leads.filter(l=>l.nextActionDate&&(isToday(l.nextActionDate)||isOverdue(l.nextActionDate))&&l.stage!=='lost');
  const fub=document.getElementById('fuBadge');
  if(fu.length){fub.textContent=fu.length;fub.style.display='';}else fub.style.display='none';
  document.getElementById('fuList').innerHTML=fu.length
    ?fu.slice(0,5).map(l=>`<div class="lead-item" data-id="${l.id}">${pdot(l.priority)}<div class="lead-item__name">${esc(l.name)}</div><div class="lead-item__right"><div class="lead-item__date ${isOverdue(l.nextActionDate)?'overdue-text':''}">${esc(l.nextAction||'')} · ${fmtDate(l.nextActionDate)}</div></div></div>`).join('')
    :'<div class="empty-hint">Нет задач на сегодня 🎉</div>';

  document.getElementById('hotList').innerHTML=hot.length
    ?hot.slice(0,5).map(l=>`<div class="lead-item" data-id="${l.id}"><div class="pdot pdot--hot"></div><div class="lead-item__name">${esc(l.name)}</div><div class="lead-item__right">${stageBadge(l.stage)}<div class="lead-item__date">${l.budget?fmtMoney(l.budget):''}</div></div></div>`).join('')
    :'<div class="empty-hint">Горячих нет</div>';

  // Today tasks
  const todayT=tasks.filter(t=>!t.done&&t.deadline&&isToday(t.deadline)).slice(0,5);
  document.getElementById('dashTasks').innerHTML=todayT.length
    ?todayT.map(t=>`<div class="task-item"><div class="task-check ${t.done?'checked':''}" data-tid="${t.id}">${t.done?'✓':''}</div><div class="task-item__body"><div class="task-item__title">${esc(t.title)}</div></div></div>`).join('')
    :'<div class="empty-hint">Задач на сегодня нет</div>';

  document.getElementById('recentList').innerHTML=[...leads].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5)
    .map(l=>`<div class="lead-item" data-id="${l.id}">${pdot(l.priority)}<div class="lead-item__name">${esc(l.name)}</div><div class="lead-item__right">${stageBadge(l.stage)}<div class="lead-item__date">${fmtDate(l.createdAt)}</div></div></div>`).join('');
  if(!leads.length)document.getElementById('recentList').innerHTML='<div class="empty-hint">Добавь первый лид</div>';

  document.querySelectorAll('.lead-item[data-id]').forEach(el=>el.addEventListener('click',()=>openDetail(el.dataset.id)));
  document.querySelectorAll('.task-check[data-tid]').forEach(el=>el.addEventListener('click',e=>{e.stopPropagation();toggleTask(el.dataset.tid);}));
}

// ── Charts ─────────────────────────────────────────────────────────────
function drawFunnel(canvasId,leads){
  const canvas=document.getElementById(canvasId);if(!canvas)return;
  const W=canvas.offsetWidth||500;canvas.width=W;canvas.height=180;
  const ctx=canvas.getContext('2d');ctx.clearRect(0,0,W,180);
  const stages=STAGES.slice(0,5);
  const counts=stages.map(s=>leads.filter(l=>l.stage===s.id).length);
  const max=Math.max(...counts,1);
  const barH=22,gap=7,startY=8,lblW=88,barMaxW=W-lblW-50;
  stages.forEach((s,i)=>{
    const y=startY+i*(barH+gap);
    const bw=Math.max(counts[i]/max*barMaxW,0);
    ctx.font='11px -apple-system,sans-serif';ctx.fillStyle='rgba(240,240,244,0.35)';ctx.textAlign='left';
    ctx.fillText(s.label,0,y+barH/2+4);
    ctx.fillStyle='rgba(255,255,255,0.04)';rr(ctx,lblW,y,barMaxW,barH,4);ctx.fill();
    if(bw>0){const g=ctx.createLinearGradient(lblW,0,lblW+bw,0);g.addColorStop(0,s.color);g.addColorStop(1,s.color+'70');ctx.fillStyle=g;rr(ctx,lblW,y,bw,barH,4);ctx.fill();}
    ctx.font='12px -apple-system,sans-serif';ctx.fillStyle=counts[i]?'rgba(240,240,244,0.9)':'rgba(240,240,244,0.2)';ctx.textAlign='left';
    ctx.fillText(counts[i],lblW+barMaxW+8,y+barH/2+4);
  });
}

function drawDonut(canvasId,legendId,leads){
  const canvas=document.getElementById(canvasId);if(!canvas)return;
  const W=canvas.offsetWidth||220;const H=180;
  canvas.width=W;canvas.height=H;
  const ctx=canvas.getContext('2d');ctx.clearRect(0,0,W,H);
  const colors=['#f5c518','#60a5fa','#a78bfa','#4ade80','#fb923c'];
  const srcs=Object.keys(SRC);
  const data=srcs.map((s,i)=>({label:SRC[s],value:leads.filter(l=>l.source===s).length,color:colors[i]})).filter(d=>d.value>0);
  if(!data.length){ctx.font='12px -apple-system,sans-serif';ctx.fillStyle='rgba(240,240,244,0.3)';ctx.textAlign='center';ctx.fillText('Нет данных',W/2,H/2);return;}
  const total=data.reduce((s,d)=>s+d.value,0);
  const cx=W/2,cy=H/2,R=Math.min(W,H)/2*0.82,rin=R*0.55;
  let angle=-Math.PI/2;
  data.forEach(d=>{
    const slice=d.value/total*2*Math.PI;
    ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,R,angle,angle+slice);ctx.closePath();
    ctx.fillStyle=d.color;ctx.fill();angle+=slice;
  });
  ctx.beginPath();ctx.arc(cx,cy,rin,0,2*Math.PI);ctx.fillStyle='#0d0d10';ctx.fill();
  ctx.font='bold 18px -apple-system,sans-serif';ctx.fillStyle='rgba(240,240,244,0.9)';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(total,cx,cy-6);ctx.font='10px -apple-system,sans-serif';ctx.fillStyle='rgba(240,240,244,0.4)';ctx.fillText('лидов',cx,cy+10);
  const leg=document.getElementById(legendId);
  if(leg)leg.innerHTML=data.map(d=>`<div class="legend-item"><div class="legend-dot" style="background:${d.color}"></div>${d.label}: ${d.value}</div>`).join('');
}

function drawWeekly(canvasId,leads){
  const canvas=document.getElementById(canvasId);if(!canvas)return;
  const W=canvas.offsetWidth||600;canvas.width=W;canvas.height=180;
  const ctx=canvas.getContext('2d');ctx.clearRect(0,0,W,180);
  const weeks=8;const now=new Date();
  const data=[];
  for(let i=weeks-1;i>=0;i--){
    const start=new Date(now);start.setDate(now.getDate()-i*7-now.getDay());start.setHours(0,0,0,0);
    const end=new Date(start);end.setDate(start.getDate()+7);
    const count=leads.filter(l=>{const d=new Date(l.createdAt);return d>=start&&d<end;}).length;
    const label=`${start.getDate()}.${String(start.getMonth()+1).padStart(2,'0')}`;
    data.push({label,count});
  }
  const maxV=Math.max(...data.map(d=>d.count),1);
  const padL=10,padR=10,padT=10,padB=30;
  const bw=Math.floor((W-padL-padR)/weeks)-6;
  const chartH=180-padT-padB;
  data.forEach((d,i)=>{
    const x=padL+i*((W-padL-padR)/weeks)+(((W-padL-padR)/weeks)-bw)/2;
    const h=Math.max(d.count/maxV*chartH,2);
    const y=padT+chartH-h;
    const g=ctx.createLinearGradient(0,y,0,y+h);g.addColorStop(0,'#f5c518');g.addColorStop(1,'rgba(245,197,24,0.2)');
    ctx.fillStyle=g;rr(ctx,x,y,bw,h,3);ctx.fill();
    ctx.font='10px -apple-system,sans-serif';ctx.fillStyle='rgba(240,240,244,0.35)';ctx.textAlign='center';
    ctx.fillText(d.label,x+bw/2,180-8);
    if(d.count>0){ctx.fillStyle='rgba(240,240,244,0.8)';ctx.fillText(d.count,x+bw/2,y-4);}
  });
}

function drawRevenue(canvasId,leads){
  const canvas=document.getElementById(canvasId);if(!canvas)return;
  const W=canvas.offsetWidth||280;canvas.width=W;canvas.height=180;
  const ctx=canvas.getContext('2d');ctx.clearRect(0,0,W,180);
  const stages=STAGES.slice(0,5);
  const revs=stages.map(s=>leads.filter(l=>l.stage===s.id).reduce((sum,l)=>sum+(Number(l.budget)||0),0));
  const maxV=Math.max(...revs,1);
  const lblW=80,barMaxW=W-lblW-60,barH=20,gap=8,startY=10;
  stages.forEach((s,i)=>{
    const y=startY+i*(barH+gap);
    const bw=revs[i]/maxV*barMaxW;
    ctx.font='10px -apple-system,sans-serif';ctx.fillStyle='rgba(240,240,244,0.35)';ctx.textAlign='left';ctx.fillText(s.label,0,y+barH/2+4);
    ctx.fillStyle='rgba(255,255,255,0.04)';rr(ctx,lblW,y,barMaxW,barH,3);ctx.fill();
    if(bw>0){ctx.fillStyle=s.color+'90';rr(ctx,lblW,y,bw,barH,3);ctx.fill();}
    if(revs[i]>0){ctx.font='11px -apple-system,sans-serif';ctx.fillStyle='rgba(245,197,24,0.8)';ctx.textAlign='left';const str=revs[i]>=1000?(revs[i]/1000).toFixed(0)+'к':revs[i];ctx.fillText(str+'₽',lblW+barMaxW+6,y+barH/2+4);}
  });
}

function rr(ctx,x,y,w,h,r){
  if(w<=0||h<=0)return;
  r=Math.min(r,w/2,h/2);
  ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();
}

// ── Kanban ─────────────────────────────────────────────────────────────
function renderKanban(){
  const leads=DB.leads();
  const board=document.getElementById('kanbanBoard');
  board.innerHTML=STAGES.map(s=>{
    const cards=leads.filter(l=>l.stage===s.id);
    const rev=cards.reduce((sum,l)=>sum+(Number(l.budget)||0),0);
    return`<div class="k-col" data-stage="${s.id}">
      <div class="k-col__head"><div class="k-col__title">${s.label}</div><div class="k-col__meta">${rev?`<span class="k-col__rev">${rev>=1000?(rev/1000).toFixed(0)+'к':rev}₽</span>`:''}<span class="k-col__count">${cards.length}</span></div></div>
      <div class="k-cards" data-stage="${s.id}">${cards.map(kanbanCard).join('')}</div>
    </div>`;
  }).join('');
  bindKanban();
}

function kanbanCard(l){
  const days=daysSince(l.createdAt);
  const tags=(l.tags||'').split(',').map(t=>t.trim()).filter(Boolean);
  return`<div class="k-card" data-id="${l.id}" draggable="true">
    <div class="k-card__pr">${PR[l.priority]||'🟡'}</div>
    ${days>3?`<div class="k-card__days">${days}д</div>`:''}
    <div class="k-card__name">${esc(l.name)}</div>
    <div class="k-card__service">${SRV[l.service]||''}</div>
    <div class="k-card__row"><div class="k-card__budget">${l.budget?fmtMoney(l.budget):''}</div><div class="k-card__date">${fmtDate(l.createdAt)}</div></div>
    ${l.nextAction?`<div class="k-card__next ${isOverdue(l.nextActionDate)?'overdue':''}">⏰ ${esc(l.nextAction)}${l.nextActionDate?' · '+fmtDate(l.nextActionDate):''}</div>`:''}
    ${tags.length?`<div class="k-card__tags">${tags.map(t=>`<span class="tag-chip">${esc(t)}</span>`).join('')}</div>`:''}
  </div>`;
}

function bindKanban(){
  document.querySelectorAll('.k-card').forEach(el=>{
    el.addEventListener('dragstart',e=>{DRAG_ID=el.dataset.id;el.classList.add('dragging');e.dataTransfer.effectAllowed='move';});
    el.addEventListener('dragend',()=>{el.classList.remove('dragging');document.querySelectorAll('.k-cards').forEach(c=>c.classList.remove('drag-over'));});
    el.addEventListener('click',()=>openDetail(el.dataset.id));
  });
  document.querySelectorAll('.k-cards').forEach(zone=>{
    zone.addEventListener('dragover',e=>{e.preventDefault();zone.classList.add('drag-over');});
    zone.addEventListener('dragleave',()=>zone.classList.remove('drag-over'));
    zone.addEventListener('drop',e=>{
      e.preventDefault();zone.classList.remove('drag-over');
      if(!DRAG_ID)return;
      const newStage=zone.dataset.stage;
      const leads=DB.leads();const lead=leads.find(l=>l.id===DRAG_ID);
      if(lead&&lead.stage!==newStage){
        const st=STAGES.find(s=>s.id===newStage);
        lead.activity=lead.activity||[];lead.activity.push({text:`Этап → ${st.label}`,date:new Date().toISOString()});
        lead.stage=newStage;lead.updatedAt=new Date().toISOString();DB.saveLeads(leads);renderKanban();
      }
      DRAG_ID=null;
    });
  });
}

// ── Leads Table ─────────────────────────────────────────────────────────
function renderLeads(){
  const search=(document.getElementById('tableSearch').value||'').toLowerCase();
  const sf=document.getElementById('filterStage').value;
  const pf=document.getElementById('filterPriority').value;
  const svf=document.getElementById('filterService').value;
  const leads=DB.leads().filter(l=>{
    const ms=!search||l.name.toLowerCase().includes(search)||(l.contact||'').toLowerCase().includes(search)||(l.company||'').toLowerCase().includes(search);
    return ms&&(!sf||l.stage===sf)&&(!pf||l.priority===pf)&&(!svf||l.service===svf);
  }).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  const tbody=document.getElementById('tableBody');const empty=document.getElementById('tableEmpty');
  if(!leads.length){tbody.innerHTML='';empty.classList.remove('hidden');return;}
  empty.classList.add('hidden');
  tbody.innerHTML=leads.map(l=>`<tr data-id="${l.id}">
    <td><b>${esc(l.name)}</b>${l.company?`<div style="font-size:11px;color:var(--t3)">${esc(l.company)}</div>`:''}</td>
    <td style="color:var(--t2)">${esc(l.contact)}</td>
    <td style="color:var(--t3)">${esc(l.company||'—')}</td>
    <td>${SRV[l.service]||'—'}</td>
    <td>${stageBadge(l.stage)}</td>
    <td>${pdot(l.priority)} <span style="font-size:12px;color:var(--t2)">${PRL[l.priority]||''}</span></td>
    <td style="color:var(--acc);font-weight:600">${l.budget?fmtMoney(l.budget):'—'}</td>
    <td>${l.nextAction?`<div style="font-size:12px">${esc(l.nextAction)}</div>`:''} ${l.nextActionDate?`<div style="font-size:11px;color:${isOverdue(l.nextActionDate)?'var(--red)':'var(--t3)'}">${fmtDate(l.nextActionDate)}</div>`:''}</td>
    <td style="color:var(--t3);font-size:11px">${fmtDate(l.createdAt)}</td>
    <td><button class="icon-btn" onclick="event.stopPropagation();openEdit('${l.id}')">✏️</button></td>
  </tr>`).join('');
  tbody.querySelectorAll('tr').forEach(row=>row.addEventListener('click',()=>openDetail(row.dataset.id)));
}

// ── Tasks ───────────────────────────────────────────────────────────────
function renderTasks(){
  const filter=document.getElementById('taskFilter').value;
  let tasks=DB.tasks();
  if(filter==='open')tasks=tasks.filter(t=>!t.done);
  else if(filter==='today')tasks=tasks.filter(t=>!t.done&&t.deadline&&isToday(t.deadline));
  else if(filter==='overdue')tasks=tasks.filter(t=>!t.done&&t.deadline&&isOverdue(t.deadline));
  else if(filter==='done')tasks=tasks.filter(t=>t.done);
  tasks=tasks.sort((a,b)=>{if(a.done!==b.done)return a.done?1:-1;if(a.deadline&&b.deadline)return new Date(a.deadline)-new Date(b.deadline);return a.deadline?-1:1;});
  const groups={overdue:[],today:[],upcoming:[],nodl:[]};
  tasks.forEach(t=>{
    if(t.done)return;
    if(t.deadline&&isOverdue(t.deadline))groups.overdue.push(t);
    else if(t.deadline&&isToday(t.deadline))groups.today.push(t);
    else if(t.deadline)groups.upcoming.push(t);
    else groups.nodl.push(t);
  });
  const done=tasks.filter(t=>t.done);
  const board=document.getElementById('tasksBoard');
  let html='';
  const renderGroup=(label,arr,cls='')=>{
    if(!arr.length)return'';
    return`<div class="task-group"><div class="task-group__label" style="${cls?'color:var(--red)':''}">${label} (${arr.length})</div>${arr.map(taskItem).join('')}</div>`;
  };
  if(filter==='all'||filter==='open'||filter==='overdue')html+=renderGroup('🔴 Просроченные',groups.overdue,'red');
  if(filter==='all'||filter==='open'||filter==='today')html+=renderGroup('📅 Сегодня',groups.today);
  if(filter==='all'||filter==='open')html+=renderGroup('📌 Предстоящие',groups.upcoming)+renderGroup('Без даты',groups.nodl);
  if(filter==='done')html+=renderGroup('✓ Выполненные',done);
  if(filter==='all')html+=`<div class="task-group"><div class="task-group__label" style="color:var(--t3)">Выполненные (${done.length})</div>${done.map(taskItem).join('')}</div>`;
  board.innerHTML=html||'<div class="empty-hint" style="padding:20px 4px">Задач нет</div>';
  board.querySelectorAll('.task-check').forEach(el=>el.addEventListener('click',()=>toggleTask(el.dataset.tid)));
  board.querySelectorAll('.task-del').forEach(el=>el.addEventListener('click',e=>{e.stopPropagation();deleteTask(el.dataset.tid);}));
}

function taskItem(t){
  const overdue=t.deadline&&isOverdue(t.deadline)&&!t.done;
  return`<div class="task-item ${t.done?'done':''}">
    <div class="task-check ${t.done?'checked':''}" data-tid="${t.id}">${t.done?'✓':''}</div>
    <div class="task-item__body">
      <div class="task-item__title">${esc(t.title)}</div>
      <div class="task-item__meta">
        ${t.leadName?`<span class="task-item__lead">↗ ${esc(t.leadName)}</span>`:''}
        ${t.deadline?`<span class="task-item__due ${overdue?'overdue':''}">${overdue?'Просрочено: ':''}${fmtDate(t.deadline)}</span>`:''}
        <span>${{high:'🔴',medium:'🟡',low:'🔵'}[t.priority||'medium']}</span>
      </div>
    </div>
    <span class="task-del" data-tid="${t.id}">✕</span>
  </div>`;
}

function addTask(){
  const title=document.getElementById('taskInput').value.trim();if(!title)return;
  const tasks=DB.tasks();
  tasks.unshift({id:uid(),title,deadline:document.getElementById('taskDate').value,priority:document.getElementById('taskPriority').value,done:false,createdAt:new Date().toISOString()});
  DB.saveTasks(tasks);document.getElementById('taskInput').value='';document.getElementById('taskDate').value='';renderTasks();updateBadges();
}

function toggleTask(id){
  const tasks=DB.tasks();const t=tasks.find(x=>x.id===id);if(!t)return;
  t.done=!t.done;t.doneAt=t.done?new Date().toISOString():null;DB.saveTasks(tasks);renderTasks();updateBadges();
}

function deleteTask(id){
  DB.saveTasks(DB.tasks().filter(t=>t.id!==id));renderTasks();updateBadges();
}

// ── Clients ─────────────────────────────────────────────────────────────
function renderClients(){
  const leads=DB.leads();
  const won=leads.filter(l=>l.stage==='won');
  const totalRev=won.reduce((s,l)=>s+(Number(l.budget)||0),0);
  const avgDeal=won.length?Math.round(totalRev/won.length):0;
  document.getElementById('clientKpi').innerHTML=`
    <div class="kpi"><div class="kpi__label">Клиентов</div><div class="kpi__val">${won.length}</div><div class="kpi__sub">закрытые сделки</div></div>
    <div class="kpi kpi--acc"><div class="kpi__label">Общая выручка</div><div class="kpi__val kpi__val--acc">${totalRev?fmtMoney(totalRev):'0 ₽'}</div><div class="kpi__sub">по всем клиентам</div></div>
    <div class="kpi"><div class="kpi__label">Средний чек</div><div class="kpi__val">${avgDeal?fmtMoney(avgDeal):'—'}</div><div class="kpi__sub"></div></div>
    <div class="kpi"><div class="kpi__label">Новых в этом месяце</div><div class="kpi__val">${won.filter(l=>{const d=new Date(l.updatedAt||l.createdAt);const n=new Date();return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear();}).length}</div><div class="kpi__sub"></div></div>`;
  document.getElementById('clientsGrid').innerHTML=won.length
    ?won.sort((a,b)=>new Date(b.updatedAt||b.createdAt)-new Date(a.updatedAt||a.createdAt)).map(l=>`
      <div class="client-card" data-id="${l.id}">
        <div class="client-card__name">${esc(l.name)}</div>
        <div class="client-card__company">${esc(l.company||SRV[l.service]||'')} · ${esc(l.contact)}</div>
        <div class="client-card__stats">
          <div><div class="client-stat__val">${l.budget?fmtMoney(l.budget):'—'}</div><div class="client-stat__label">Сумма сделки</div></div>
          <div><div class="client-stat__val" style="color:var(--t2);font-size:14px">${fmtDate(l.updatedAt||l.createdAt)}</div><div class="client-stat__label">Дата закрытия</div></div>
        </div>
      </div>`).join('')
    :'<div class="empty-hint" style="padding:20px 4px">Нет клиентов. Переведи лид в статус "Оплата ✓"</div>';
  document.querySelectorAll('.client-card[data-id]').forEach(el=>el.addEventListener('click',()=>openDetail(el.dataset.id)));
}

// ── Analytics ────────────────────────────────────────────────────────────
function renderAnalytics(){
  const leads=DB.leads();
  const won=leads.filter(l=>l.stage==='won');
  const totalRev=won.reduce((s,l)=>s+(Number(l.budget)||0),0);
  const avgDays=won.length?Math.round(won.reduce((s,l)=>{const d=(new Date(l.updatedAt||l.createdAt)-new Date(l.createdAt))/86400000;return s+d;},0)/won.length):0;
  const conv=leads.length?Math.round(won.length/leads.length*100):0;
  document.getElementById('analyticsKpi').innerHTML=`
    <div class="kpi kpi--acc"><div class="kpi__label">Закрытая выручка</div><div class="kpi__val kpi__val--acc">${totalRev?fmtMoney(totalRev):'0 ₽'}</div><div class="kpi__sub">${won.length} сделок</div></div>
    <div class="kpi"><div class="kpi__label">Конверсия</div><div class="kpi__val kpi__val--green">${conv}%</div><div class="kpi__sub">лид → оплата</div></div>
    <div class="kpi"><div class="kpi__label">Средний чек</div><div class="kpi__val">${won.length?fmtMoney(Math.round(totalRev/won.length)):'—'}</div><div class="kpi__sub"></div></div>
    <div class="kpi"><div class="kpi__label">Среднее время в воронке</div><div class="kpi__val">${avgDays}</div><div class="kpi__sub">дней</div></div>`;
  setTimeout(()=>{
    drawWeekly('weeklyCanvas',leads);
    drawRevenue('revenueCanvas',leads);
    drawDonut('sourceCanvas2','sourceLegend2',leads);
  },50);
  document.getElementById('topDeals').innerHTML=`<table class="table"><thead><tr><th>Имя</th><th>Компания</th><th>Услуга</th><th>Бюджет</th><th>Этап</th><th>Добавлен</th></tr></thead><tbody>${
    [...leads].filter(l=>l.budget).sort((a,b)=>b.budget-a.budget).slice(0,8).map(l=>`<tr data-id="${l.id}"><td><b>${esc(l.name)}</b></td><td style="color:var(--t3)">${esc(l.company||'—')}</td><td>${SRV[l.service]||'—'}</td><td style="color:var(--acc);font-weight:700">${fmtMoney(l.budget)}</td><td>${stageBadge(l.stage)}</td><td style="color:var(--t3);font-size:11px">${fmtDate(l.createdAt)}</td></tr>`).join('')
  }</tbody></table>`;
  document.querySelectorAll('#topDeals tr[data-id]').forEach(el=>el.addEventListener('click',()=>openDetail(el.dataset.id)));
}

// ── Finance ───────────────────────────────────────────────────────────────
function renderFinance(){
  const invs=DB.invoices();
  const autoOverdue=invs.map(i=>{if(i.status==='sent'&&i.dueDate&&isOverdue(i.dueDate))i.status='overdue';return i;});
  DB.saveInvoices(autoOverdue);
  const filter=document.getElementById('invFilter').value;
  const filtered=filter?invs.filter(i=>i.status===filter):invs;
  const total=invs.reduce((s,i)=>s+(Number(i.amount)||0),0);
  const paid=invs.filter(i=>i.status==='paid').reduce((s,i)=>s+(Number(i.amount)||0),0);
  const pending=invs.filter(i=>i.status==='sent').reduce((s,i)=>s+(Number(i.amount)||0),0);
  const overdue=invs.filter(i=>i.status==='overdue').reduce((s,i)=>s+(Number(i.amount)||0),0);
  document.getElementById('financeKpi').innerHTML=`
    <div class="kpi"><div class="kpi__label">Всего выставлено</div><div class="kpi__val">${fmtMoney(total)}</div><div class="kpi__sub">${invs.length} счетов</div></div>
    <div class="kpi kpi--acc"><div class="kpi__label">Оплачено</div><div class="kpi__val kpi__val--green">${fmtMoney(paid)}</div><div class="kpi__sub"></div></div>
    <div class="kpi"><div class="kpi__label">Ожидает оплаты</div><div class="kpi__val kpi__val--blue">${fmtMoney(pending)}</div><div class="kpi__sub"></div></div>
    <div class="kpi"><div class="kpi__label">Просрочено</div><div class="kpi__val ${overdue?'kpi__val--red':''}">${fmtMoney(overdue)}</div><div class="kpi__sub"></div></div>`;
  const tbody=document.getElementById('invBody');const empty=document.getElementById('invEmpty');
  if(!filtered.length){tbody.innerHTML='';empty.classList.remove('hidden');return;}
  empty.classList.add('hidden');
  tbody.innerHTML=filtered.sort((a,b)=>new Date(b.issueDate||b.createdAt)-new Date(a.issueDate||a.createdAt)).map(i=>`<tr>
    <td><b>${esc(i.client)}</b></td><td style="color:var(--t2)">${esc(i.service||'—')}</td>
    <td style="color:var(--acc);font-weight:700">${fmtMoney(i.amount)}</td>
    <td style="color:var(--t3);font-size:12px">${fmtDate(i.issueDate)}</td>
    <td style="font-size:12px;color:${isOverdue(i.dueDate)&&i.status!=='paid'?'var(--red)':'var(--t3)'}">${fmtDate(i.dueDate)}</td>
    <td><span class="badge badge--${i.status}">${INV_ST[i.status]||i.status}</span></td>
    <td style="display:flex;gap:5px">
      <select class="t-select" style="padding:4px 8px;font-size:11px" onchange="changeInvStatus('${i.id}',this.value)">
        ${Object.entries(INV_ST).map(([k,v])=>`<option value="${k}" ${i.status===k?'selected':''}>${v}</option>`).join('')}
      </select>
      <button class="icon-btn icon-btn--danger" onclick="deleteInv('${i.id}')">🗑</button>
    </td>
  </tr>`).join('');
}

function changeInvStatus(id,status){
  const invs=DB.invoices();const inv=invs.find(i=>i.id===id);if(!inv)return;
  inv.status=status;DB.saveInvoices(invs);renderFinance();updateBadges();
}
function deleteInv(id){if(!confirm('Удалить счёт?'))return;DB.saveInvoices(DB.invoices().filter(i=>i.id!==id));renderFinance();updateBadges();}

// ── Settings ──────────────────────────────────────────────────────────────
function renderSettings(){
  const s=DB.settings();
  document.getElementById('sTgToken').value=s.tgToken||'';
  document.getElementById('sTgChat').value=s.tgChat||'';
  document.getElementById('accentColor').value=s.accent||'#f5c518';
  document.getElementById('companyName').value=s.company||'Uniqore';
}

document.getElementById('saveTg').addEventListener('click',()=>{
  const s=DB.settings();s.tgToken=document.getElementById('sTgToken').value.trim();s.tgChat=document.getElementById('sTgChat').value.trim();DB.saveSettings(s);alert('Сохранено!');
});

document.getElementById('testTg').addEventListener('click',async()=>{
  const s=DB.settings();
  if(!s.tgToken||!s.tgChat){alert('Сначала укажи Bot Token и Chat ID');return;}
  try{
    const r=await fetch(`https://api.telegram.org/bot${s.tgToken}/sendMessage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:s.tgChat,text:'✅ Uniqore CRM — тест уведомления работает!'})});
    const d=await r.json();
    if(d.ok)alert('Уведомление отправлено!');else alert('Ошибка: '+d.description);
  }catch(e){alert('Ошибка: '+e.message);}
});

document.getElementById('saveAppearance').addEventListener('click',()=>{
  const s=DB.settings();
  s.accent=document.getElementById('accentColor').value;
  s.company=document.getElementById('companyName').value.trim();
  DB.saveSettings(s);
  document.documentElement.style.setProperty('--acc',s.accent);
  document.querySelector('.sidebar__name').textContent=s.company||'Uniqore';
  document.querySelector('.sidebar__logo').textContent=(s.company||'U')[0].toUpperCase();
});

document.getElementById('exportJson').addEventListener('click',()=>{
  const data={leads:DB.leads(),tasks:DB.tasks(),invoices:DB.invoices(),settings:DB.settings(),exportedAt:new Date().toISOString()};
  const a=document.createElement('a');a.href='data:application/json,'+encodeURIComponent(JSON.stringify(data,null,2));a.download='uniqore-crm-backup-'+new Date().toISOString().slice(0,10)+'.json';a.click();
});

document.getElementById('importBtn').addEventListener('click',()=>document.getElementById('importFile').click());
document.getElementById('importFile').addEventListener('change',e=>{
  const f=e.target.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=ev=>{try{const d=JSON.parse(ev.target.result);if(d.leads)DB.saveLeads(d.leads);if(d.tasks)DB.saveTasks(d.tasks);if(d.invoices)DB.saveInvoices(d.invoices);if(d.settings)DB.saveSettings(d.settings);alert('Импортировано!');refresh();}catch{alert('Ошибка формата файла');}};
  r.readAsText(f);
});

document.getElementById('exportCsvSet').addEventListener('click',exportCsv);
document.getElementById('exportCsv')?.addEventListener('click',exportCsv);
function exportCsv(){
  const leads=DB.leads();
  const rows=[['Имя','Контакт','Компания','Услуга','Источник','Этап','Приоритет','Бюджет','Заметки','Добавлен'],...leads.map(l=>[l.name,l.contact,l.company||'',SRV[l.service]||'',SRC[l.source]||'',STAGES.find(s=>s.id===l.stage)?.label||'',PRL[l.priority]||'',l.budget||'',l.notes||'',fmtDate(l.createdAt)])];
  const csv=rows.map(r=>r.map(v=>'"'+(String(v||'').replace(/"/g,'""'))+'"').join(',')).join('\n');
  const a=document.createElement('a');a.href='data:text/csv;charset=utf-8,﻿'+encodeURIComponent(csv);a.download='leads.csv';a.click();
}

document.getElementById('clearLeads').addEventListener('click',()=>{if(confirm('Удалить ВСЕ лиды? Это нельзя отменить.')){{DB.saveLeads([]);refresh();}}} );
document.getElementById('clearAll').addEventListener('click',()=>{if(confirm('Сбросить всю CRM? Это нельзя отменить.')){['uq_leads','uq_tasks','uq_invoices','uq_settings'].forEach(k=>localStorage.removeItem(k));refresh();}});

// ── Lead form ─────────────────────────────────────────────────────────────
function openAdd(){
  document.getElementById('formTitle').textContent='Новый лид';
  document.getElementById('fId').value='';
  document.getElementById('leadForm').reset();
  document.getElementById('fNextDate').value='';
  document.getElementById('formOverlay').classList.remove('hidden');
}

function openEdit(id){
  const lead=DB.leads().find(l=>l.id===id);if(!lead)return;
  document.getElementById('formTitle').textContent='Редактировать';
  document.getElementById('fId').value=lead.id;
  document.getElementById('fName').value=lead.name;
  document.getElementById('fContact').value=lead.contact;
  document.getElementById('fCompany').value=lead.company||'';
  document.getElementById('fBudget').value=lead.budget||'';
  document.getElementById('fService').value=lead.service;
  document.getElementById('fSource').value=lead.source;
  document.getElementById('fStage').value=lead.stage;
  document.getElementById('fPriority').value=lead.priority||'warm';
  document.getElementById('fNextAction').value=lead.nextAction||'';
  document.getElementById('fNextDate').value=lead.nextActionDate||'';
  document.getElementById('fTags').value=lead.tags||'';
  document.getElementById('fNotes').value=lead.notes||'';
  document.getElementById('formOverlay').classList.remove('hidden');
  document.getElementById('detailOverlay').classList.add('hidden');
}

document.getElementById('leadForm').addEventListener('submit',e=>{
  e.preventDefault();
  const leads=DB.leads();const id=document.getElementById('fId').value;
  const data={name:document.getElementById('fName').value.trim(),contact:document.getElementById('fContact').value.trim(),company:document.getElementById('fCompany').value.trim(),budget:document.getElementById('fBudget').value,service:document.getElementById('fService').value,source:document.getElementById('fSource').value,stage:document.getElementById('fStage').value,priority:document.getElementById('fPriority').value,nextAction:document.getElementById('fNextAction').value.trim(),nextActionDate:document.getElementById('fNextDate').value,tags:document.getElementById('fTags').value.trim(),notes:document.getElementById('fNotes').value.trim(),updatedAt:new Date().toISOString()};
  if(id){
    const idx=leads.findIndex(l=>l.id===id);const old=leads[idx];
    if(old.stage!==data.stage){const st=STAGES.find(s=>s.id===data.stage);old.activity=old.activity||[];old.activity.push({text:`Этап → ${st.label}`,date:new Date().toISOString()});}
    leads[idx]={...old,...data};
  }else{
    leads.unshift({id:uid(),...data,createdAt:new Date().toISOString(),activity:[]});
    sendTelegramNotification(data);
  }
  DB.saveLeads(leads);
  document.getElementById('formOverlay').classList.add('hidden');
  refresh();
});

async function sendTelegramNotification(lead){
  const s=DB.settings();if(!s.tgToken||!s.tgChat)return;
  const text=`🆕 Новый лид!\n\n👤 ${lead.name}\n📞 ${lead.contact}${lead.company?'\n🏢 '+lead.company:''}\n🎯 ${SRV[lead.service]||lead.service}\n💰 ${lead.budget?fmtMoney(lead.budget):'Не указан'}\n📍 Источник: ${SRC[lead.source]||lead.source}${lead.notes?'\n📝 '+lead.notes.slice(0,200):''}`;
  try{await fetch(`https://api.telegram.org/bot${s.tgToken}/sendMessage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:s.tgChat,text,parse_mode:'HTML'})});}catch{}
}

// ── Lead detail ────────────────────────────────────────────────────────────
function openDetail(id){
  const lead=DB.leads().find(l=>l.id===id);if(!lead)return;
  DETAIL_ID=id;
  document.getElementById('dName').textContent=lead.name;
  document.getElementById('dSub').textContent=[lead.company,SRV[lead.service],SRC[lead.source]].filter(Boolean).join(' · ');
  const stIdx=STAGES.findIndex(s=>s.id===lead.stage);
  document.getElementById('stageTrack').innerHTML=STAGES.map((s,i)=>`<div class="stage-step ${i<stIdx?'done':i===stIdx?'active':''}" title="${s.label}" data-stage="${s.id}"></div>`).join('');
  document.getElementById('stageTrack').querySelectorAll('.stage-step').forEach(el=>el.addEventListener('click',()=>{updateStage(id,el.dataset.stage);openDetail(id);}));
  document.getElementById('dGrid').innerHTML=[['Контакт',esc(lead.contact)],['Приоритет',PR[lead.priority]+' '+PRL[lead.priority]],['Бюджет',lead.budget?fmtMoney(lead.budget):'—'],['Источник',SRC[lead.source]||'—'],['Добавлен',fmtDate(lead.createdAt)],['Обновлён',fmtDate(lead.updatedAt)]].map(([l,v])=>`<div class="detail-field"><div class="block-label">${l}</div><div class="block-val">${v}</div></div>`).join('');
  const tagsArr=(lead.tags||'').split(',').map(t=>t.trim()).filter(Boolean);
  document.getElementById('dTagsWrap').innerHTML=tagsArr.length?`<div class="tags-wrap">${tagsArr.map(t=>`<span class="tag-chip">${esc(t)}</span>`).join('')}</div>`:'';
  const nw=document.getElementById('dNextWrap');
  nw.innerHTML=lead.nextAction?`<div class="block-label">Следующий шаг</div><div class="block-val">${esc(lead.nextAction)}${lead.nextActionDate?` <span style="color:${isOverdue(lead.nextActionDate)?'var(--red)':'var(--t3)'}">· ${fmtDate(lead.nextActionDate)}</span>`:''}</div>`:'';
  document.getElementById('dNotes').textContent=lead.notes||'Нет заметок';
  renderDetailActivity(lead);
  document.getElementById('actInput').value='';
  document.getElementById('detailOverlay').classList.remove('hidden');
}

function renderDetailActivity(lead){
  const activity=lead.activity||[];
  document.getElementById('dActivity').innerHTML=activity.length
    ?[...activity].reverse().map(a=>`<div class="act-entry"><div class="act-dot"></div><div class="act-text">${esc(a.text)}</div><div class="act-date">${fmtDate(a.date)}</div></div>`).join('')
    :'<div style="font-size:12px;color:var(--t3)">Пусто</div>';
}

function updateStage(id,stageId){
  const leads=DB.leads();const lead=leads.find(l=>l.id===id);if(!lead||lead.stage===stageId)return;
  const st=STAGES.find(s=>s.id===stageId);
  lead.activity=lead.activity||[];lead.activity.push({text:`Этап → ${st.label}`,date:new Date().toISOString()});
  lead.stage=stageId;lead.updatedAt=new Date().toISOString();DB.saveLeads(leads);refresh();
}

document.getElementById('actAdd').addEventListener('click',()=>{
  const input=document.getElementById('actInput');const text=input.value.trim();if(!text||!DETAIL_ID)return;
  const leads=DB.leads();const lead=leads.find(l=>l.id===DETAIL_ID);if(!lead)return;
  lead.activity=lead.activity||[];lead.activity.push({text,date:new Date().toISOString()});
  DB.saveLeads(leads);input.value='';renderDetailActivity(lead);
});
document.getElementById('actInput').addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('actAdd').click();});
document.getElementById('dEdit').addEventListener('click',()=>{if(DETAIL_ID)openEdit(DETAIL_ID);});
document.getElementById('dDelete').addEventListener('click',()=>{if(!DETAIL_ID||!confirm('Удалить лид?'))return;DB.saveLeads(DB.leads().filter(l=>l.id!==DETAIL_ID));document.getElementById('detailOverlay').classList.add('hidden');refresh();});
document.getElementById('dConvert').addEventListener('click',()=>{
  if(!DETAIL_ID)return;const lead=DB.leads().find(l=>l.id===DETAIL_ID);if(!lead)return;
  document.getElementById('iClient').value=lead.name;document.getElementById('iAmount').value=lead.budget||'';document.getElementById('iService').value=SRV[lead.service]||'';document.getElementById('iStatus').value='draft';
  document.getElementById('invOverlay').classList.remove('hidden');
});

// ── Invoice form ──────────────────────────────────────────────────────────
document.getElementById('invForm').addEventListener('submit',e=>{
  e.preventDefault();
  const invs=DB.invoices();const id=document.getElementById('iId').value;
  const data={client:document.getElementById('iClient').value.trim(),amount:document.getElementById('iAmount').value,service:document.getElementById('iService').value.trim(),status:document.getElementById('iStatus').value,issueDate:document.getElementById('iIssue').value,dueDate:document.getElementById('iDue').value,note:document.getElementById('iNote').value.trim()};
  if(id){const idx=invs.findIndex(i=>i.id===id);invs[idx]={...invs[idx],...data};}
  else invs.unshift({id:uid(),...data,createdAt:new Date().toISOString()});
  DB.saveInvoices(invs);document.getElementById('invOverlay').classList.add('hidden');if(VIEW==='finance')renderFinance();updateBadges();
});

// ── Overlays ──────────────────────────────────────────────────────────────
function closeOverlay(id){document.getElementById(id).classList.add('hidden');}
['formClose','formCancel'].forEach(id=>document.getElementById(id)?.addEventListener('click',()=>closeOverlay('formOverlay')));
document.getElementById('detailClose').addEventListener('click',()=>closeOverlay('detailOverlay'));
['invClose','invCancel'].forEach(id=>document.getElementById(id)?.addEventListener('click',()=>closeOverlay('invOverlay')));
['formOverlay','detailOverlay','invOverlay'].forEach(id=>document.getElementById(id)?.addEventListener('click',e=>{if(e.target.id===id)closeOverlay(id);}));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeOverlay('formOverlay');closeOverlay('detailOverlay');closeOverlay('invOverlay');}});

// ── Navigation ────────────────────────────────────────────────────────────
document.querySelectorAll('.nav__item').forEach(el=>el.addEventListener('click',e=>{e.preventDefault();showView(el.dataset.view);}));
['addLeadSide','addLeadTop'].forEach(id=>document.getElementById(id)?.addEventListener('click',openAdd));
document.getElementById('addInvBtn')?.addEventListener('click',()=>{document.getElementById('invForm').reset();document.getElementById('iId').value='';document.getElementById('iIssue').value=new Date().toISOString().slice(0,10);document.getElementById('invOverlay').classList.remove('hidden');});
document.getElementById('taskAddBtn')?.addEventListener('click',addTask);
document.getElementById('taskInput')?.addEventListener('keydown',e=>{if(e.key==='Enter')addTask();});
document.getElementById('taskFilter')?.addEventListener('change',renderTasks);
document.getElementById('invFilter')?.addEventListener('change',renderFinance);
['tableSearch','filterStage','filterPriority','filterService'].forEach(id=>document.getElementById(id)?.addEventListener('input',renderLeads));
['filterStage','filterPriority','filterService'].forEach(id=>document.getElementById(id)?.addEventListener('change',renderLeads));

document.getElementById('globalSearch').addEventListener('input',e=>{
  const q=e.target.value.trim();if(!q)return;
  document.getElementById('tableSearch').value=q;showView('leads');
});

window.addEventListener('resize',()=>{
  if(VIEW==='dashboard'){drawFunnel('funnelCanvas',DB.leads());drawDonut('sourceCanvas','sourceLegend',DB.leads());}
  if(VIEW==='analytics'){drawWeekly('weeklyCanvas',DB.leads());drawRevenue('revenueCanvas',DB.leads());drawDonut('sourceCanvas2','sourceLegend2',DB.leads());}
});

// ── Apply saved settings ──────────────────────────────────────────────────
(()=>{
  const s=DB.settings();
  if(s.accent)document.documentElement.style.setProperty('--acc',s.accent);
  if(s.company){document.querySelector('.sidebar__name').textContent=s.company;document.querySelector('.sidebar__logo').textContent=s.company[0].toUpperCase();}
})();

// ── Init ──────────────────────────────────────────────────────────────────
showView('dashboard');
