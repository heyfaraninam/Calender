// ── STATE ──
let today      = new Date();
today.setHours(0,0,0,0);
let current    = new Date(today);
let view       = 'month'; // month|week|day
let events     = JSON.parse(localStorage.getItem('cal_events')||'[]');
let miniDate   = new Date(today);
let editId     = null;
let dragId     = null;

const COLORS = ['#c77dff','#48cae4','#f72585','#ffd166','#39ff83','#ff6b35','#a8edea','#ee9ca7'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// ── STORAGE ──
function save(){ localStorage.setItem('cal_events', JSON.stringify(events)); }
function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2); }

// ── HELPERS ──
function sameDay(a,b){ return a.slice(0,10)===b.slice(0,10); }
function toDateStr(d){
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}
function fmtTime(str){ if(!str)return''; const [h,m]=str.split(':'); const ap=+h>=12?'PM':'AM'; return `${+h%12||12}:${m} ${ap}`; }
function fmtDate(str){ const d=new Date(str+'T00:00:00'); return `${MONTHS[d.getMonth()].slice(0,3)} ${d.getDate()}, ${d.getFullYear()}`; }

// get events for a date string, expanding recurring
function getEventsForDate(dateStr){
  const d = new Date(dateStr+'T00:00:00');
  const dow = d.getDay();
  return events.filter(e=>{
    if(e.date===dateStr) return true;
    if(!e.recur||e.recur==='none') return false;
    const orig = new Date(e.date+'T00:00:00');
    if(orig>d) return false;
    if(e.recur==='daily') return true;
    if(e.recur==='weekly') return orig.getDay()===dow;
    if(e.recur==='monthly') return orig.getDate()===d.getDate();
    return false;
  });
}

// ── RENDER ROUTER ──
function render(){
  updatePeriodLabel();
  renderMiniCal();
  renderUpcoming();
  if(view==='month') renderMonth();
  if(view==='week')  renderWeek();
  if(view==='day')   renderDay();
}

function updatePeriodLabel(){
  const el = document.getElementById('current-period');
  if(view==='month') el.textContent = MONTHS[current.getMonth()]+' '+current.getFullYear();
  else if(view==='week'){
    const mon = getWeekStart(current);
    const sun = new Date(mon); sun.setDate(sun.getDate()+6);
    el.textContent = `${MONTHS[mon.getMonth()].slice(0,3)} ${mon.getDate()} – ${MONTHS[sun.getMonth()].slice(0,3)} ${sun.getDate()}, ${sun.getFullYear()}`;
  } else {
    el.textContent = `${DAYS[current.getDay()]}, ${MONTHS[current.getMonth()]} ${current.getDate()}, ${current.getFullYear()}`;
  }
}

// ── MONTH VIEW ──
function renderMonth(){
  const area = document.getElementById('cal-area');
  area.innerHTML = '';

  // headers
  const hdr = document.createElement('div');
  hdr.className = 'day-headers month-hdr';
  DAYS.forEach(d=>{ const c=document.createElement('div');c.className='dh-cell';c.textContent=d;hdr.appendChild(c); });
  area.appendChild(hdr);

  // grid
  const grid = document.createElement('div');
  grid.className = 'month-grid';

  const firstDay = new Date(current.getFullYear(), current.getMonth(), 1);
  const start    = new Date(firstDay); start.setDate(start.getDate()-start.getDay());

  for(let i=0;i<42;i++){
    const d    = new Date(start); d.setDate(d.getDate()+i);
    const dStr = toDateStr(d);
    const isToday   = dStr===toDateStr(today);
    const isOther   = d.getMonth()!==current.getMonth();
    const dayEvents = getEventsForDate(dStr);

    const cell = document.createElement('div');
    cell.className = 'month-cell'+(isToday?' today':'')+(isOther?' other-month':'');
    cell.dataset.date = dStr;

    const dateEl = document.createElement('div');
    dateEl.className = 'cell-date';
    dateEl.textContent = d.getDate();
    cell.appendChild(dateEl);

    // events (show max 3)
    dayEvents.slice(0,3).forEach(ev=>{
      const chip = document.createElement('div');
      chip.className = 'event-chip';
      chip.style.background = ev.color+'33';
      chip.style.color = ev.color;
      chip.style.borderLeft = `3px solid ${ev.color}`;
      chip.textContent = (ev.startTime?fmtTime(ev.startTime)+' ':'')+ev.title;
      chip.onclick = e=>{ e.stopPropagation(); openEdit(ev.id,dStr); };
      chip.draggable = true;
      chip.addEventListener('dragstart', e=>{ dragId=ev.id; chip.classList.add('dragging'); e.stopPropagation(); });
      chip.addEventListener('dragend',   ()=>chip.classList.remove('dragging'));
      cell.appendChild(chip);
    });
    if(dayEvents.length>3){ const m=document.createElement('div');m.className='more-chip';m.textContent=`+${dayEvents.length-3} more`;cell.appendChild(m); }

    // click cell = new event
    cell.addEventListener('click', ()=>openNew(dStr));
    // drag-drop
    cell.addEventListener('dragover',  e=>{ e.preventDefault(); cell.classList.add('drop-hover'); });
    cell.addEventListener('dragleave', ()=>cell.classList.remove('drop-hover'));
    cell.addEventListener('drop',      e=>{ e.preventDefault(); cell.classList.remove('drop-hover'); dropEvent(dStr); });

    grid.appendChild(cell);
  }
  area.appendChild(grid);
}

// ── WEEK VIEW ──
function getWeekStart(d){ const s=new Date(d); s.setDate(s.getDate()-s.getDay()); return s; }

function renderWeek(){
  const area = document.getElementById('cal-area');
  area.innerHTML='';
  const weekStart = getWeekStart(current);

  // headers
  const hdr = document.createElement('div');
  hdr.className='day-headers week-hdr';
  const corner=document.createElement('div');corner.className='dh-cell';hdr.appendChild(corner);
  for(let i=0;i<7;i++){
    const d=new Date(weekStart);d.setDate(d.getDate()+i);
    const isToday=toDateStr(d)===toDateStr(today);
    const c=document.createElement('div');
    c.className='dh-cell'+(isToday?' today-col':'');
    c.innerHTML=`${DAYS[d.getDay()]}<span class="dh-num${isToday?' today-num':''}">${d.getDate()}</span>`;
    hdr.appendChild(c);
  }
  area.appendChild(hdr);

  // grid
  const grid=document.createElement('div');grid.className='week-grid';

  // time col
  const timeCol=document.createElement('div');timeCol.className='week-time-col';
  for(let h=0;h<24;h++){
    const s=document.createElement('div');s.className='week-time-slot';
    s.textContent=h===0?'':( h<12?`${h} AM`: h===12?'12 PM':`${h-12} PM`);
    timeCol.appendChild(s);
  }
  grid.appendChild(timeCol);

  // day cols
  for(let i=0;i<7;i++){
    const d=new Date(weekStart);d.setDate(d.getDate()+i);
    const dStr=toDateStr(d);
    const isToday=dStr===toDateStr(today);
    const col=document.createElement('div');
    col.className='week-day-col'+(isToday?' today-col':'');
    col.dataset.date=dStr;

    for(let h=0;h<24;h++){
      const line=document.createElement('div');line.className='week-hour-line';col.appendChild(line);
    }

    // events
    getEventsForDate(dStr).forEach(ev=>{
      if(!ev.startTime) return;
      const [sh,sm]=ev.startTime.split(':').map(Number);
      const [eh,em]=ev.endTime?ev.endTime.split(':').map(Number):[sh+1,sm];
      const top=sh*60+sm;
      const height=Math.max(30,(eh*60+em)-top);
      const el=document.createElement('div');
      el.className='week-event';
      el.style.cssText=`top:${top}px;height:${height}px;background:${ev.color}22;border-left:3px solid ${ev.color};color:${ev.color};`;
      el.innerHTML=`<div class="week-event-name">${ev.title}</div><div class="week-event-time">${fmtTime(ev.startTime)}${ev.endTime?' – '+fmtTime(ev.endTime):''}</div>`;
      el.onclick=e=>{ e.stopPropagation(); openEdit(ev.id,dStr); };
      el.draggable=true;
      el.addEventListener('dragstart',e=>{dragId=ev.id;el.classList.add('dragging');e.stopPropagation();});
      el.addEventListener('dragend',()=>el.classList.remove('dragging'));
      col.appendChild(el);
    });

    col.addEventListener('click', ()=>openNew(dStr));
    col.addEventListener('dragover',e=>{e.preventDefault();col.classList.add('drop-hover');});
    col.addEventListener('dragleave',()=>col.classList.remove('drop-hover'));
    col.addEventListener('drop',e=>{e.preventDefault();col.classList.remove('drop-hover');dropEvent(dStr);});
    grid.appendChild(col);
  }

  // time indicator
  addTimeIndicator(grid, 1);
  area.appendChild(grid);
  scrollToNow(grid);
}

// ── DAY VIEW ──
function renderDay(){
  const area=document.getElementById('cal-area');
  area.innerHTML='';
  const dStr=toDateStr(current);

  const hdr=document.createElement('div');
  hdr.className='day-headers';hdr.style.gridTemplateColumns='60px 1fr';
  const corner=document.createElement('div');corner.className='dh-cell';hdr.appendChild(corner);
  const isToday=dStr===toDateStr(today);
  const dayHdr=document.createElement('div');
  dayHdr.className='dh-cell'+(isToday?' today-col':'');
  dayHdr.innerHTML=`${DAYS[current.getDay()]}<span class="dh-num${isToday?' today-num':''}">${current.getDate()}</span>`;
  hdr.appendChild(dayHdr);
  area.appendChild(hdr);

  const grid=document.createElement('div');grid.className='day-grid';

  const timeCol=document.createElement('div');timeCol.className='day-time-col';
  for(let h=0;h<24;h++){
    const s=document.createElement('div');s.className='day-time-slot';
    s.textContent=h===0?'':(h<12?`${h} AM`:h===12?'12 PM':`${h-12} PM`);
    timeCol.appendChild(s);
  }
  grid.appendChild(timeCol);

  const evCol=document.createElement('div');evCol.className='day-events-col';
  for(let h=0;h<24;h++){const l=document.createElement('div');l.className='day-hour-line';evCol.appendChild(l);}

  getEventsForDate(dStr).forEach(ev=>{
    if(!ev.startTime)return;
    const [sh,sm]=ev.startTime.split(':').map(Number);
    const [eh,em]=ev.endTime?ev.endTime.split(':').map(Number):[sh+1,sm];
    const top=sh*60+sm;
    const height=Math.max(40,(eh*60+em)-top);
    const el=document.createElement('div');
    el.className='day-event';
    el.style.cssText=`top:${top}px;height:${height}px;background:${ev.color}22;border-left:4px solid ${ev.color};color:${ev.color};`;
    el.innerHTML=`<div class="day-event-name">${ev.title}</div><div class="day-event-time">${fmtTime(ev.startTime)}${ev.endTime?' – '+fmtTime(ev.endTime):''}</div>${ev.desc?`<div style="font-size:11px;opacity:0.7;margin-top:4px">${ev.desc}</div>`:''}`;
    el.onclick=e=>{e.stopPropagation();openEdit(ev.id,dStr);};
    evCol.appendChild(el);
  });

  evCol.addEventListener('click',()=>openNew(dStr));
  addTimeIndicator(evCol, 0);
  grid.appendChild(evCol);
  area.appendChild(grid);
  scrollToNow(grid);
}

function addTimeIndicator(container, colIndex){
  const now=new Date();
  const top=now.getHours()*60+now.getMinutes();
  const ind=document.createElement('div');
  ind.className='time-indicator';
  ind.style.top=top+'px';
  if(colIndex===0){ ind.style.left='0';ind.style.right='0'; }
  ind.innerHTML='<div class="time-indicator-dot"></div><div class="time-indicator-line"></div>';
  container.style.position='relative';
  container.appendChild(ind);
}
function scrollToNow(grid){ setTimeout(()=>{ const h=new Date().getHours(); grid.scrollTop=Math.max(0,h*60-120); },50); }

// ── DRAG & DROP ──
function dropEvent(newDate){
  if(!dragId)return;
  const ev=events.find(e=>e.id===dragId);
  if(ev){ ev.date=newDate; save(); render(); toast('Event moved ✦','green'); }
  dragId=null;
}

// ── MINI CALENDAR ──
function renderMiniCal(){
  const grid=document.getElementById('mini-grid');
  grid.innerHTML='';
  document.getElementById('mini-month-label').textContent=MONTHS[miniDate.getMonth()].slice(0,3)+' '+miniDate.getFullYear();

  const first=new Date(miniDate.getFullYear(),miniDate.getMonth(),1);
  const start=new Date(first);start.setDate(start.getDate()-start.getDay());

  for(let i=0;i<42;i++){
    const d=new Date(start);d.setDate(d.getDate()+i);
    const dStr=toDateStr(d);
    const isToday=dStr===toDateStr(today);
    const isOther=d.getMonth()!==miniDate.getMonth();
    const hasEv=getEventsForDate(dStr).length>0;
    const isSelected=dStr===toDateStr(current);
    const el=document.createElement('div');
    el.className='mini-day'+(isToday?' today':'')+(isOther?' other-month':'')+(isSelected?' selected':'')+(hasEv?' has-event':'');
    el.textContent=d.getDate();
    el.onclick=()=>{ current=new Date(d); view='day'; setActivePill('day'); render(); };
    grid.appendChild(el);
  }
}

// ── UPCOMING ──
function renderUpcoming(){
  const list=document.getElementById('upcoming-list');
  list.innerHTML='';
  const upcoming=[];
  for(let i=0;i<30;i++){
    const d=new Date(today);d.setDate(d.getDate()+i);
    const dStr=toDateStr(d);
    getEventsForDate(dStr).forEach(ev=>upcoming.push({...ev,_date:dStr}));
  }
  upcoming.sort((a,b)=>a._date.localeCompare(b._date)||(a.startTime||'').localeCompare(b.startTime||''));
  if(!upcoming.length){ list.innerHTML='<div class="upcoming-empty">No upcoming events</div>'; return; }
  upcoming.slice(0,12).forEach(ev=>{
    const el=document.createElement('div');el.className='upcoming-item';
    el.innerHTML=`<div class="upcoming-dot-row"><div class="upcoming-dot" style="background:${ev.color}"></div><div class="upcoming-name">${ev.title}</div></div><div class="upcoming-time">${fmtDate(ev._date)}${ev.startTime?' · '+fmtTime(ev.startTime):''}</div>`;
    el.onclick=()=>{ current=new Date(ev._date+'T00:00:00'); view='day'; setActivePill('day'); render(); openEdit(ev.id,ev._date); };
    list.appendChild(el);
  });
}

// ── EVENT MODAL ──
let _newDateCtx='';
function openNew(dateStr){
  _newDateCtx=dateStr||toDateStr(current);
  editId=null;
  document.getElementById('modal-title-txt').textContent='New Event';
  document.getElementById('ev-title').value='';
  document.getElementById('ev-date').value=_newDateCtx;
  document.getElementById('ev-start').value='09:00';
  document.getElementById('ev-end').value='10:00';
  document.getElementById('ev-desc').value='';
  setColor(COLORS[0]);
  setRecur('none');
  document.getElementById('btn-delete').style.display='none';
  document.getElementById('overlay').classList.add('open');
  setTimeout(()=>document.getElementById('ev-title').focus(),100);
}
function openEdit(id, dateStr){
  const ev=events.find(e=>e.id===id);
  if(!ev)return;
  editId=id;
  document.getElementById('modal-title-txt').textContent='Edit Event';
  document.getElementById('ev-title').value=ev.title;
  document.getElementById('ev-date').value=ev.date;
  document.getElementById('ev-start').value=ev.startTime||'';
  document.getElementById('ev-end').value=ev.endTime||'';
  document.getElementById('ev-desc').value=ev.desc||'';
  setColor(ev.color);
  setRecur(ev.recur||'none');
  document.getElementById('btn-delete').style.display='';
  document.getElementById('overlay').classList.add('open');
}
function closeModal(){ document.getElementById('overlay').classList.remove('open'); editId=null; }

function setColor(c){
  document.querySelectorAll('.color-swatch').forEach(s=>s.classList.toggle('selected',s.dataset.color===c));
}
function setRecur(r){
  document.querySelectorAll('.recur-pill').forEach(p=>p.classList.toggle('active',p.dataset.recur===r));
}

function saveEvent(){
  const title=document.getElementById('ev-title').value.trim();
  if(!title){ toast('Title is required',''); return; }
  const color=document.querySelector('.color-swatch.selected')?.dataset.color||COLORS[0];
  const recur=document.querySelector('.recur-pill.active')?.dataset.recur||'none';
  const ev={
    id:editId||uid(), title,
    date:document.getElementById('ev-date').value,
    startTime:document.getElementById('ev-start').value,
    endTime:document.getElementById('ev-end').value,
    desc:document.getElementById('ev-desc').value.trim(),
    color, recur
  };
  if(editId){ const i=events.findIndex(e=>e.id===editId); events[i]=ev; toast('Event updated ✦','green'); }
  else { events.push(ev); toast('Event created ✦','green'); }
  save(); closeModal(); render();
}

function deleteEvent(){
  if(!editId)return;
  events=events.filter(e=>e.id!==editId);
  save(); closeModal(); render();
  toast('Event deleted','');
}

// ── NAVIGATION ──
function navPrev(){
  if(view==='month'){ current.setMonth(current.getMonth()-1); miniDate=new Date(current); }
  else if(view==='week'){ current.setDate(current.getDate()-7); }
  else { current.setDate(current.getDate()-1); }
  render();
}
function navNext(){
  if(view==='month'){ current.setMonth(current.getMonth()+1); miniDate=new Date(current); }
  else if(view==='week'){ current.setDate(current.getDate()+7); }
  else { current.setDate(current.getDate()+1); }
  render();
}
function goToday(){ current=new Date(today); miniDate=new Date(today); render(); }

function setView(v){ view=v; setActivePill(v); render(); }
function setActivePill(v){ document.querySelectorAll('.view-pill').forEach(p=>p.classList.toggle('active',p.dataset.view===v)); }

function miniNav(dir){ miniDate.setMonth(miniDate.getMonth()+dir); renderMiniCal(); }

// ── TOAST ──
let toastT;
function toast(msg,type=''){
  const el=document.getElementById('toast');
  el.textContent=msg;el.className='toast show '+type;
  clearTimeout(toastT);toastT=setTimeout(()=>el.className='toast',2200);
}

// ── EXPOSE ──
window.navPrev=navPrev;window.navNext=navNext;window.goToday=goToday;
window.setView=setView;window.openNew=openNew;window.closeModal=closeModal;
window.saveEvent=saveEvent;window.deleteEvent=deleteEvent;
window.miniNav=miniNav;
window.setColor=setColor;window.setRecur=setRecur;

// ── BOOT ──
render();