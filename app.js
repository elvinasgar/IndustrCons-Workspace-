/* ==========================================================================
   IndustrCons Workspace — app.js
   Modular, frontend-only, localStorage-backed. No build step, no backend.
   ========================================================================== */

/* ---------------------------------------------------------------------- */
/* 1. STORAGE ADAPTER — swap this later for Firebase/Supabase/Appwrite    */
/* ---------------------------------------------------------------------- */
const StorageAdapter = {
  key: 'industrcons_workspace_v1',
  load(){
    try{
      const raw = localStorage.getItem(this.key);
      return raw ? JSON.parse(raw) : null;
    }catch(e){ console.warn('Storage load failed', e); return null; }
  },
  save(state){
    try{
      localStorage.setItem(this.key, JSON.stringify(state));
      return true;
    }catch(e){ console.warn('Storage save failed (quota?)', e); return false; }
  },
  clear(){ localStorage.removeItem(this.key); }
};

function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,8); }
function todayISO(){ return new Date().toISOString().slice(0,10); }
function esc(s){ return (s==null?'':String(s)).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

/* ---------------------------------------------------------------------- */
/* 2. DEFAULT STATE                                                       */
/* ---------------------------------------------------------------------- */
function defaultState(){
  return {
    projectName: 'Untitled Project',
    tasks: [
      { id: uid(), col:'todo', title:'Survey site boundary', priority:'medium', tag:'Survey', due:'' },
      { id: uid(), col:'progress', title:'Pour foundation — Block A', priority:'high', tag:'Civil', due:'' },
      { id: uid(), col:'review', title:'Review structural drawings Rev C', priority:'medium', tag:'Design', due:'' },
      { id: uid(), col:'done', title:'Mobilize site office', priority:'low', tag:'Admin', due:'' }
    ],
    diary: [],
    sticky: [
      { id: uid(), text:'Call supplier re: rebar delivery delay', color:'amber', x:20, y:20, rot:-2 },
      { id: uid(), text:'Client site visit Thursday 10am', color:'blue', x:230, y:40, rot:2 }
    ],
    quickNotes: [
      { id: uid(), title:'Rebar lap lengths', body:'Tension lap: 40d\nCompression lap: 50d\nCheck project spec for confirmation.' }
    ],
    activeQuickNote: null,
    planner: {},           // { 'YYYY-MM-DD': { '07:00': 'text', ... } }
    risks: [
      { id: uid(), risk:'Delayed rebar delivery', category:'Material', likelihood:3, impact:4, mitigation:'Confirm supplier schedule weekly, hold buffer stock', owner:'Procurement', status:'open' }
    ],
    qaqc: [
      { id: uid(), label:'Formwork verified against drawings', category:'Structural', checked:false },
      { id: uid(), label:'Concrete slump test recorded', category:'Structural', checked:false },
      { id: uid(), label:'Rebar cover spacers installed', category:'Structural', checked:true }
    ],
    safety: [
      { id: uid(), label:'PPE compliance checked at gate', category:'PPE', checked:true },
      { id: uid(), label:'Excavation shoring inspected', category:'Excavation', checked:false },
      { id: uid(), label:'Fire extinguishers in place', category:'General', checked:false }
    ],
    boq: [
      { id: uid(), desc:'Excavation for foundation', unit:'m3', qty:120, rate:8.5 },
      { id: uid(), desc:'PCC blinding 75mm', unit:'m2', qty:400, rate:6.2 }
    ],
    steel: [
      { id: uid(), dia:12, length:6, qty:40 }
    ],
    githubSource: { owner:'', repo:'', branch:'main', path:'data' }
  };
}

let S = StorageAdapter.load() || defaultState();
// backfill any missing keys if loading an older export
Object.assign(S, Object.assign(defaultState(), S));

function persist(){
  StorageAdapter.save(S);
  flashSaved();
}
let saveFlashTimer = null;
function flashSaved(){
  const el = document.getElementById('saveIndicator');
  if(!el) return;
  el.querySelector('span').textContent = 'Saved';
  el.style.color = '';
  clearTimeout(saveFlashTimer);
}

/* ---------------------------------------------------------------------- */
/* 3. TOAST / MODAL HELPERS                                               */
/* ---------------------------------------------------------------------- */
function toast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(()=>t.classList.remove('show'), 2200);
}
function openModal(html){
  document.getElementById('modal').innerHTML = html;
  document.getElementById('modalScrim').classList.add('show');
}
function closeModal(){
  document.getElementById('modalScrim').classList.remove('show');
}
document.getElementById('modalScrim').addEventListener('click', e=>{
  if(e.target.id === 'modalScrim') closeModal();
});

/* ---------------------------------------------------------------------- */
/* 4. NAVIGATION                                                          */
/* ---------------------------------------------------------------------- */
const sheetLabels = {
  board:'01 — BOARD', dashboard:'02 — DASHBOARD', diary:'03 — SITE DIARY',
  planner:'04 — DAILY PLANNER', notes:'05 — STICKY NOTES', quicknotes:'06 — QUICK NOTES',
  risk:'07 — RISK REGISTER', qaqc:'08 — QA/QC CHECKLIST', safety:'09 — SAFETY CHECKLIST',
  boq:'10 — BOQ CALCULATOR', concrete:'11 — CONCRETE CALC', steel:'12 — STEEL CALC',
  github:'13 — GITHUB SOURCE', data:'14 — IMPORT / EXPORT'
};

function showView(name){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.getElementById('view-'+name).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active', n.dataset.view===name));
  document.getElementById('activeSheetLabel').textContent = sheetLabels[name] || '';
  document.getElementById('sidenav').classList.remove('open');
  document.getElementById('navScrim').classList.remove('show');
  renderAll(name);
  window.scrollTo({top:0, behavior:'instant' in window ? 'instant' : 'auto'});
}

document.querySelectorAll('.nav-item').forEach(btn=>{
  btn.addEventListener('click', ()=> showView(btn.dataset.view));
});
document.getElementById('menuToggle').addEventListener('click', ()=>{
  document.getElementById('sidenav').classList.toggle('open');
  document.getElementById('navScrim').classList.toggle('show');
});
document.getElementById('navScrim').addEventListener('click', ()=>{
  document.getElementById('sidenav').classList.remove('open');
  document.getElementById('navScrim').classList.remove('show');
});

/* ---------------------------------------------------------------------- */
/* 5. RENDER DISPATCH                                                     */
/* ---------------------------------------------------------------------- */
function renderAll(only){
  if(!only || only==='board') renderBoard();
  if(!only || only==='dashboard') renderDashboard();
  if(!only || only==='diary') renderDiary();
  if(!only || only==='planner') renderPlanner();
  if(!only || only==='notes') renderSticky();
  if(!only || only==='quicknotes') renderQuickNotes();
  if(!only || only==='risk') renderRisk();
  if(!only || only==='qaqc') renderChecklist('qaqc');
  if(!only || only==='safety') renderChecklist('safety');
  if(!only || only==='boq') renderBoq();
  if(!only || only==='steel') renderSteel();
}

/* ---------------------------------------------------------------------- */
/* 6. KANBAN BOARD                                                        */
/* ---------------------------------------------------------------------- */
const COLS = [
  {key:'todo', label:'To Do'},
  {key:'progress', label:'In Progress'},
  {key:'review', label:'Review'},
  {key:'done', label:'Completed'}
];

function renderBoard(){
  const board = document.getElementById('board');
  board.innerHTML = '';
  COLS.forEach(col=>{
    const items = S.tasks.filter(t=>t.col===col.key);
    const colEl = document.createElement('div');
    colEl.className = 'col';
    colEl.dataset.col = col.key;
    colEl.innerHTML = `
      <div class="col-head"><h3>${col.label}</h3><span class="col-count">${items.length}</span></div>
      <div class="col-drop" data-col="${col.key}"></div>`;
    board.appendChild(colEl);
    const drop = colEl.querySelector('.col-drop');
    items.forEach(t=> drop.appendChild(taskCardEl(t)));
    drop.addEventListener('dragover', e=>{ e.preventDefault(); drop.classList.add('drag-over'); });
    drop.addEventListener('dragleave', ()=> drop.classList.remove('drag-over'));
    drop.addEventListener('drop', e=>{
      e.preventDefault(); drop.classList.remove('drag-over');
      const id = e.dataTransfer.getData('text/plain');
      const task = S.tasks.find(t=>t.id===id);
      if(task){ task.col = col.key; persist(); renderBoard(); renderDashboard(); }
    });
  });
}

function taskCardEl(t){
  const el = document.createElement('div');
  el.className = 'task-card';
  el.draggable = true;
  el.dataset.priority = t.priority;
  el.innerHTML = `
    <div class="task-title">${esc(t.title)}</div>
    <div class="task-meta">
      ${t.tag ? `<span class="tag">${esc(t.tag)}</span>` : ''}
      <span class="tag">${esc(t.priority)}</span>
      ${t.due ? `<span class="tag">${esc(t.due)}</span>` : ''}
    </div>`;
  el.addEventListener('dragstart', e=>{
    e.dataTransfer.setData('text/plain', t.id);
    el.classList.add('dragging');
  });
  el.addEventListener('dragend', ()=> el.classList.remove('dragging'));
  el.addEventListener('click', ()=> editTask(t.id));
  return el;
}

function editTask(id){
  const t = S.tasks.find(x=>x.id===id);
  openModal(`
    <h2>${t?'Edit Task':'New Task'}</h2>
    <div class="field-row"><label>Title</label><input id="mTitle" type="text" value="${t?esc(t.title):''}"></div>
    <div class="field-row"><label>Tag</label><input id="mTag" type="text" value="${t?esc(t.tag||''):''}"></div>
    <div class="field-row"><label>Priority</label>
      <select id="mPriority">
        <option value="low" ${t&&t.priority==='low'?'selected':''}>Low</option>
        <option value="medium" ${!t||t.priority==='medium'?'selected':''}>Medium</option>
        <option value="high" ${t&&t.priority==='high'?'selected':''}>High</option>
      </select>
    </div>
    <div class="field-row"><label>Due date</label><input id="mDue" type="date" value="${t?esc(t.due||''):''}"></div>
    <div class="field-row"><label>Column</label>
      <select id="mCol">
        ${COLS.map(c=>`<option value="${c.key}" ${t&&t.col===c.key?'selected':(!t&&c.key==='todo'?'selected':'')}>${c.label}</option>`).join('')}
      </select>
    </div>
    <div class="modal-actions">
      ${t?'<button class="btn btn-danger" id="mDelete">Delete</button>':''}
      <button class="btn btn-ghost" id="mCancel">Cancel</button>
      <button class="btn btn-amber" id="mSave">Save</button>
    </div>`);
  document.getElementById('mCancel').onclick = closeModal;
  if(t) document.getElementById('mDelete').onclick = ()=>{
    S.tasks = S.tasks.filter(x=>x.id!==id); persist(); closeModal(); renderBoard(); renderDashboard();
  };
  document.getElementById('mSave').onclick = ()=>{
    const title = document.getElementById('mTitle').value.trim();
    if(!title){ toast('Title required'); return; }
    const data = {
      title, tag: document.getElementById('mTag').value.trim(),
      priority: document.getElementById('mPriority').value,
      due: document.getElementById('mDue').value,
      col: document.getElementById('mCol').value
    };
    if(t) Object.assign(t, data);
    else S.tasks.push({ id: uid(), ...data });
    persist(); closeModal(); renderBoard(); renderDashboard();
  };
}
document.getElementById('addTaskBtn').addEventListener('click', ()=> editTask(null));

/* ---------------------------------------------------------------------- */
/* 7. DASHBOARD                                                           */
/* ---------------------------------------------------------------------- */
function renderDashboard(){
  const grid = document.getElementById('dashGrid');
  const total = S.tasks.length;
  const done = S.tasks.filter(t=>t.col==='done').length;
  const openRisks = S.risks.filter(r=>r.status!=='closed').length;
  const qaqcPct = pctDone(S.qaqc);
  const safetyPct = pctDone(S.safety);
  grid.innerHTML = [
    tile(total,'Total Tasks'),
    tile(done,'Completed Tasks'),
    tile(S.diary.length,'Diary Entries'),
    tile(openRisks,'Open Risks'),
    tile(qaqcPct+'%','QA/QC Complete'),
    tile(safetyPct+'%','Safety Complete')
  ].join('');

  const bars = document.getElementById('dashBars');
  bars.innerHTML = COLS.map(c=>{
    const n = S.tasks.filter(t=>t.col===c.key).length;
    const pct = total ? Math.round(n/total*100) : 0;
    return `<div class="bar-row"><span>${c.label}</span><div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div><span>${n}</span></div>`;
  }).join('');
}
function tile(num,lbl){ return `<div class="dash-tile"><div class="num">${num}</div><div class="lbl">${lbl}</div></div>`; }
function pctDone(list){ if(!list.length) return 0; return Math.round(list.filter(i=>i.checked).length/list.length*100); }

/* ---------------------------------------------------------------------- */
/* 8. SITE DIARY                                                          */
/* ---------------------------------------------------------------------- */
function renderDiary(){
  const wrap = document.getElementById('diaryList');
  if(!S.diary.length){ wrap.innerHTML = `<p class="hint">No entries yet. Log today's site conditions, manpower and progress.</p>`; return; }
  wrap.innerHTML = '';
  [...S.diary].sort((a,b)=> b.date.localeCompare(a.date)).forEach(d=>{
    const el = document.createElement('div');
    el.className = 'diary-card';
    el.innerHTML = `
      <div class="diary-head">
        <span class="diary-date">${esc(d.date)}</span>
        <span class="diary-weather">${esc(d.weather||'—')}</span>
        <button class="btn-icon" data-del="${d.id}" title="Delete entry">✕</button>
      </div>
      <div class="diary-grid">
        <div class="diary-stat"><b>${esc(d.manpower||'0')}</b>Manpower</div>
        <div class="diary-stat"><b>${esc(d.equipment||'—')}</b>Equipment</div>
        <div class="diary-stat"><b>${esc(d.progress||'—')}</b>Progress</div>
      </div>
      <div class="diary-body">${esc(d.notes||'')}</div>
      ${d.photos&&d.photos.length? `<div class="photo-strip">${d.photos.map(p=>`<img class="photo-thumb" src="${p}">`).join('')}</div>`:''}
    `;
    el.querySelector('[data-del]').addEventListener('click', ()=>{
      S.diary = S.diary.filter(x=>x.id!==d.id); persist(); renderDiary(); renderDashboard();
    });
    wrap.appendChild(el);
  });
}

document.getElementById('addDiaryBtn').addEventListener('click', ()=>{
  openModal(`
    <h2>New Site Diary Entry</h2>
    <div class="field-row"><label>Date</label><input id="dDate" type="date" value="${todayISO()}"></div>
    <div class="field-row"><label>Weather</label><input id="dWeather" type="text" placeholder="e.g. Clear, 34°C"></div>
    <div class="field-row"><label>Manpower on site</label><input id="dManpower" type="text" placeholder="e.g. 42"></div>
    <div class="field-row"><label>Equipment on site</label><input id="dEquipment" type="text" placeholder="e.g. 2x excavator, 1x crane"></div>
    <div class="field-row"><label>Progress summary</label><input id="dProgress" type="text" placeholder="e.g. Slab pour 60% complete"></div>
    <div class="field-row"><label>Notes</label><textarea id="dNotes" rows="4" placeholder="Site activities, issues, instructions given…"></textarea></div>
    <div class="field-row"><label>Photos</label><input id="dPhotos" type="file" accept="image/*" multiple></div>
    <div class="modal-actions">
      <button class="btn btn-ghost" id="mCancel">Cancel</button>
      <button class="btn btn-amber" id="mSave">Save Entry</button>
    </div>`);
  document.getElementById('mCancel').onclick = closeModal;
  document.getElementById('mSave').onclick = async ()=>{
    const files = document.getElementById('dPhotos').files;
    const photos = await Promise.all([...files].map(fileToDataURL));
    S.diary.push({
      id: uid(), date: document.getElementById('dDate').value || todayISO(),
      weather: document.getElementById('dWeather').value.trim(),
      manpower: document.getElementById('dManpower').value.trim(),
      equipment: document.getElementById('dEquipment').value.trim(),
      progress: document.getElementById('dProgress').value.trim(),
      notes: document.getElementById('dNotes').value.trim(),
      photos
    });
    persist(); closeModal(); renderDiary(); renderDashboard();
  };
});

function fileToDataURL(file){
  return new Promise((resolve, reject)=>{
    const r = new FileReader();
    r.onload = ()=> resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

/* ---------------------------------------------------------------------- */
/* 9. DAILY PLANNER                                                       */
/* ---------------------------------------------------------------------- */
const plannerDateInput = document.getElementById('plannerDate');
plannerDateInput.value = todayISO();
plannerDateInput.addEventListener('change', renderPlanner);

function renderPlanner(){
  const date = plannerDateInput.value || todayISO();
  const grid = document.getElementById('plannerGrid');
  if(!S.planner[date]) S.planner[date] = {};
  const slots = S.planner[date];
  grid.innerHTML = '';
  for(let h=6; h<=19; h++){
    const time = String(h).padStart(2,'0')+':00';
    const row = document.createElement('div');
    row.className = 'planner-row';
    row.innerHTML = `<div class="planner-time">${time}</div>
      <div class="planner-slot"><input type="text" value="${esc(slots[time]||'')}" placeholder="—" data-time="${time}"></div>`;
    row.querySelector('input').addEventListener('change', e=>{
      slots[time] = e.target.value;
      persist();
    });
    grid.appendChild(row);
  }
}

/* ---------------------------------------------------------------------- */
/* 10. STICKY NOTES                                                       */
/* ---------------------------------------------------------------------- */
function renderSticky(){
  const board = document.getElementById('corkboard');
  board.innerHTML = '';
  S.sticky.forEach(n=>{
    const el = document.createElement('div');
    el.className = 'sticky';
    el.dataset.color = n.color;
    el.style.left = (n.x||20)+'px';
    el.style.top = (n.y||20)+'px';
    el.style.setProperty('--rot', (n.rot||0)+'deg');
    el.innerHTML = `
      <div class="sticky-head"><button class="btn-icon" data-del="${n.id}">✕</button></div>
      <textarea>${esc(n.text)}</textarea>`;
    el.querySelector('textarea').addEventListener('change', e=>{ n.text = e.target.value; persist(); });
    el.querySelector('[data-del]').addEventListener('click', ()=>{
      S.sticky = S.sticky.filter(x=>x.id!==n.id); persist(); renderSticky();
    });
    makeDraggable(el, n, board);
    board.appendChild(el);
  });
}
function makeDraggable(el, model, container){
  let sx,sy,ox,oy,dragging=false;
  el.addEventListener('pointerdown', e=>{
    if(e.target.tagName==='TEXTAREA' || e.target.closest('.btn-icon')) return;
    dragging = true; el.setPointerCapture(e.pointerId);
    sx=e.clientX; sy=e.clientY; ox=model.x||0; oy=model.y||0;
  });
  el.addEventListener('pointermove', e=>{
    if(!dragging) return;
    const rect = container.getBoundingClientRect();
    let nx = ox + (e.clientX-sx), ny = oy + (e.clientY-sy);
    nx = Math.max(0, Math.min(nx, rect.width-200));
    ny = Math.max(0, Math.min(ny, rect.height-160));
    model.x = nx; model.y = ny;
    el.style.left = nx+'px'; el.style.top = ny+'px';
  });
  el.addEventListener('pointerup', ()=>{ if(dragging){ dragging=false; persist(); } });
}
document.getElementById('addStickyBtn').addEventListener('click', ()=>{
  const colors = ['amber','blue','green','pink'];
  S.sticky.push({ id: uid(), text:'New note', color: colors[S.sticky.length % colors.length],
    x: 20 + (S.sticky.length*14)%300, y: 20 + (S.sticky.length*22)%260, rot:(Math.random()*6-3).toFixed(1) });
  persist(); renderSticky();
});

/* ---------------------------------------------------------------------- */
/* 11. ENGINEERING QUICK NOTES                                            */
/* ---------------------------------------------------------------------- */
function renderQuickNotes(){
  const list = document.getElementById('qnList');
  if(!S.activeQuickNote && S.quickNotes.length) S.activeQuickNote = S.quickNotes[0].id;
  list.innerHTML = '';
  S.quickNotes.forEach(n=>{
    const el = document.createElement('div');
    el.className = 'qn-item' + (n.id===S.activeQuickNote?' active':'');
    el.innerHTML = `<span>${esc(n.title||'Untitled')}</span><button class="btn-icon" data-del="${n.id}">✕</button>`;
    el.addEventListener('click', e=>{
      if(e.target.closest('.btn-icon')) return;
      S.activeQuickNote = n.id; renderQuickNotes();
    });
    el.querySelector('[data-del]').addEventListener('click', ()=>{
      S.quickNotes = S.quickNotes.filter(x=>x.id!==n.id);
      if(S.activeQuickNote===n.id) S.activeQuickNote = S.quickNotes[0]?.id || null;
      persist(); renderQuickNotes();
    });
    list.appendChild(el);
  });
  const editor = document.getElementById('qnEditor');
  const active = S.quickNotes.find(n=>n.id===S.activeQuickNote);
  editor.value = active ? active.body : '';
  editor.disabled = !active;
  editor.oninput = ()=>{ if(active){ active.body = editor.value; active.title = editor.value.split('\n')[0].slice(0,40) || 'Untitled'; persist(); } };
}
document.getElementById('addQuickNoteBtn').addEventListener('click', ()=>{
  const n = { id: uid(), title:'Untitled', body:'' };
  S.quickNotes.unshift(n); S.activeQuickNote = n.id; persist(); renderQuickNotes();
  document.getElementById('qnEditor').focus();
});

/* ---------------------------------------------------------------------- */
/* 12. RISK REGISTER                                                      */
/* ---------------------------------------------------------------------- */
function renderRisk(){
  const body = document.getElementById('riskBody');
  body.innerHTML = '';
  S.risks.forEach(r=>{
    const score = r.likelihood * r.impact;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type="text" value="${esc(r.risk)}" data-f="risk"></td>
      <td><input type="text" value="${esc(r.category)}" data-f="category"></td>
      <td><input type="number" min="1" max="5" value="${r.likelihood}" data-f="likelihood"></td>
      <td><input type="number" min="1" max="5" value="${r.impact}" data-f="impact"></td>
      <td><span class="badge ${score>=12?'badge-open':score>=6?'badge-mitigating':'badge-closed'}">${score}</span></td>
      <td><input type="text" value="${esc(r.mitigation)}" data-f="mitigation"></td>
      <td><input type="text" value="${esc(r.owner)}" data-f="owner"></td>
      <td><select data-f="status">
        <option value="open" ${r.status==='open'?'selected':''}>Open</option>
        <option value="mitigating" ${r.status==='mitigating'?'selected':''}>Mitigating</option>
        <option value="closed" ${r.status==='closed'?'selected':''}>Closed</option>
      </select></td>
      <td><button class="btn-icon" data-del>✕</button></td>`;
    tr.querySelectorAll('[data-f]').forEach(inp=>{
      inp.addEventListener('change', ()=>{
        const f = inp.dataset.f;
        r[f] = (f==='likelihood'||f==='impact') ? Number(inp.value)||1 : inp.value;
        persist(); renderRisk();
      });
    });
    tr.querySelector('[data-del]').addEventListener('click', ()=>{
      S.risks = S.risks.filter(x=>x.id!==r.id); persist(); renderRisk(); renderDashboard();
    });
    body.appendChild(tr);
  });
}
document.getElementById('addRiskBtn').addEventListener('click', ()=>{
  S.risks.push({ id: uid(), risk:'New risk', category:'General', likelihood:2, impact:2, mitigation:'', owner:'', status:'open' });
  persist(); renderRisk(); renderDashboard();
});

/* ---------------------------------------------------------------------- */
/* 13. CHECKLISTS (QA/QC + Safety share logic)                            */
/* ---------------------------------------------------------------------- */
function renderChecklist(kind){
  const list = document.getElementById(kind+'List');
  const meta = document.getElementById(kind+'Meta');
  const items = S[kind];
  const pct = pctDone(items);
  meta.innerHTML = `<div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div><span class="pct">${pct}% complete</span>`;
  list.innerHTML = '';
  items.forEach(it=>{
    const el = document.createElement('div');
    el.className = 'check-item' + (it.checked?' checked':'');
    el.innerHTML = `
      <input type="checkbox" ${it.checked?'checked':''}>
      <input type="text" class="check-label" value="${esc(it.label)}">
      <span class="check-cat">${esc(it.category||'General')}</span>
      <button class="btn-icon" data-del>✕</button>`;
    el.querySelector('input[type=checkbox]').addEventListener('change', e=>{
      it.checked = e.target.checked; persist(); renderChecklist(kind); renderDashboard();
    });
    el.querySelector('.check-label').addEventListener('change', e=>{ it.label = e.target.value; persist(); });
    el.querySelector('[data-del]').addEventListener('click', ()=>{
      S[kind] = S[kind].filter(x=>x.id!==it.id); persist(); renderChecklist(kind); renderDashboard();
    });
    list.appendChild(el);
  });
}
document.getElementById('addQaqcItemBtn').addEventListener('click', ()=>{
  S.qaqc.push({ id: uid(), label:'New checklist item', category:'General', checked:false });
  persist(); renderChecklist('qaqc');
});
document.getElementById('addSafetyItemBtn').addEventListener('click', ()=>{
  S.safety.push({ id: uid(), label:'New checklist item', category:'General', checked:false });
  persist(); renderChecklist('safety');
});

/* ---------------------------------------------------------------------- */
/* 14. BOQ CALCULATOR                                                     */
/* ---------------------------------------------------------------------- */
function renderBoq(){
  const body = document.getElementById('boqBody');
  body.innerHTML = '';
  let total = 0;
  S.boq.forEach((row,i)=>{
    const amount = (Number(row.qty)||0) * (Number(row.rate)||0);
    total += amount;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i+1}</td>
      <td><input type="text" value="${esc(row.desc)}" data-f="desc"></td>
      <td><input type="text" value="${esc(row.unit)}" data-f="unit" style="max-width:70px"></td>
      <td><input type="number" value="${row.qty}" data-f="qty" style="max-width:90px"></td>
      <td><input type="number" value="${row.rate}" data-f="rate" style="max-width:90px"></td>
      <td class="tf-total" style="font-size:13px">${amount.toFixed(2)}</td>
      <td><button class="btn-icon" data-del>✕</button></td>`;
    tr.querySelectorAll('[data-f]').forEach(inp=>{
      inp.addEventListener('input', ()=>{
        const f = inp.dataset.f;
        row[f] = (f==='qty'||f==='rate') ? Number(inp.value)||0 : inp.value;
        persist(); renderBoq();
      });
    });
    tr.querySelector('[data-del]').addEventListener('click', ()=>{
      S.boq = S.boq.filter(x=>x.id!==row.id); persist(); renderBoq();
    });
    body.appendChild(tr);
  });
  document.getElementById('boqTotal').textContent = total.toFixed(2);
}
document.getElementById('addBoqRowBtn').addEventListener('click', ()=>{
  S.boq.push({ id: uid(), desc:'New item', unit:'nos', qty:1, rate:0 });
  persist(); renderBoq();
});

/* ---------------------------------------------------------------------- */
/* 15. CONCRETE CALCULATOR                                                */
/* ---------------------------------------------------------------------- */
function renderConcrete(){
  const len = Number(document.getElementById('cLen').value)||0;
  const wid = Number(document.getElementById('cWid').value)||0;
  const thkMm = Number(document.getElementById('cThk').value)||0;
  const waste = Number(document.getElementById('cWaste').value)||0;
  const mixStr = document.getElementById('cMix').value;
  const [c,s,a] = mixStr.split(':').map(Number);
  const sumParts = c+s+a;

  const volume = len * wid * (thkMm/1000);
  const wetVolume = volume * (1 + waste/100);
  const dryVolume = wetVolume * 1.54; // standard dry-to-wet conversion factor

  const cementVol = dryVolume * (c/sumParts);
  const sandVol = dryVolume * (s/sumParts);
  const aggVol = dryVolume * (a/sumParts);
  const cementBags = (cementVol * 1440) / 50; // 1440 kg/m3, 50kg/bag

  document.getElementById('cResult').innerHTML = `
    <div class="r-row"><span>Wet volume</span><b>${wetVolume.toFixed(3)} m³</b></div>
    <div class="r-row"><span>Dry volume (×1.54)</span><b>${dryVolume.toFixed(3)} m³</b></div>
    <div class="r-row"><span>Cement</span><b>${cementVol.toFixed(3)} m³ · ${cementBags.toFixed(1)} bags</b></div>
    <div class="r-row"><span>Sand (fine agg.)</span><b>${sandVol.toFixed(3)} m³</b></div>
    <div class="r-row"><span>Coarse aggregate</span><b>${aggVol.toFixed(3)} m³</b></div>
  `;
}
['cLen','cWid','cThk','cMix','cWaste'].forEach(id=>{
  document.getElementById(id).addEventListener('input', renderConcrete);
  document.getElementById(id).addEventListener('change', renderConcrete);
});

/* ---------------------------------------------------------------------- */
/* 16. STEEL CALCULATOR                                                   */
/* ---------------------------------------------------------------------- */
function unitKgPerM(dia){ return (dia*dia)/162.2; } // D²/162 formula (mild steel rebar)

function renderSteel(){
  const body = document.getElementById('steelBody');
  body.innerHTML = '';
  let total = 0;
  S.steel.forEach(row=>{
    const ukg = unitKgPerM(Number(row.dia)||0);
    const weight = ukg * (Number(row.length)||0) * (Number(row.qty)||0);
    total += weight;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type="number" value="${row.dia}" data-f="dia" style="max-width:80px"></td>
      <td><input type="number" value="${row.length}" data-f="length" style="max-width:80px"></td>
      <td><input type="number" value="${row.qty}" data-f="qty" style="max-width:80px"></td>
      <td>${ukg.toFixed(3)}</td>
      <td class="tf-total" style="font-size:13px">${weight.toFixed(2)}</td>
      <td><button class="btn-icon" data-del>✕</button></td>`;
    tr.querySelectorAll('[data-f]').forEach(inp=>{
      inp.addEventListener('input', ()=>{
        row[inp.dataset.f] = Number(inp.value)||0;
        persist(); renderSteel();
      });
    });
    tr.querySelector('[data-del]').addEventListener('click', ()=>{
      S.steel = S.steel.filter(x=>x.id!==row.id); persist(); renderSteel();
    });
    body.appendChild(tr);
  });
  document.getElementById('steelTotal').textContent = total.toFixed(2)+' kg';
}
document.getElementById('addSteelRowBtn').addEventListener('click', ()=>{
  S.steel.push({ id: uid(), dia:10, length:6, qty:10 });
  persist(); renderSteel();
});

/* ---------------------------------------------------------------------- */
/* 17. GITHUB REPOSITORY MODE (read-only, REST API, no auth)              */
/* ---------------------------------------------------------------------- */
const ghFields = ['ghOwner','ghRepo','ghBranch','ghPath'];
ghFields.forEach((id,i)=>{
  const key = ['owner','repo','branch','path'][i];
  document.getElementById(id).value = S.githubSource[key] || document.getElementById(id).value;
});

function ghLog(msg){
  const el = document.getElementById('ghLog');
  el.textContent += (el.textContent?'\n':'') + msg;
}

document.getElementById('ghLoadBtn').addEventListener('click', async ()=>{
  const owner = document.getElementById('ghOwner').value.trim();
  const repo = document.getElementById('ghRepo').value.trim();
  const branch = document.getElementById('ghBranch').value.trim() || 'main';
  const path = document.getElementById('ghPath').value.trim().replace(/^\/|\/$/g,'');
  document.getElementById('ghLog').textContent = '';
  if(!owner || !repo){ ghLog('Owner and repository are required.'); return; }
  S.githubSource = { owner, repo, branch, path }; persist();

  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${encodeURIComponent(branch)}`;
  ghLog(`Fetching directory listing: ${apiUrl}`);
  try{
    const res = await fetch(apiUrl);
    if(!res.ok){ ghLog(`GitHub API responded ${res.status}. Check owner/repo/branch/path and that the repo is public.`); return; }
    const files = await res.json();
    if(!Array.isArray(files)){ ghLog('Path is not a directory of files.'); return; }
    const jsonFiles = files.filter(f=>f.type==='file' && f.name.endsWith('.json'));
    if(!jsonFiles.length){ ghLog('No .json files found at that path.'); return; }

    for(const f of jsonFiles){
      ghLog(`Loading ${f.name}…`);
      try{
        const raw = await fetch(f.download_url);
        const data = await raw.json();
        mergeGithubFile(f.name, data);
        ghLog(`✓ Merged ${f.name}`);
      }catch(err){
        ghLog(`✗ Failed to parse ${f.name}: ${err.message}`);
      }
    }
    persist(); renderAll(); toast('GitHub data merged into workspace');
  }catch(err){
    ghLog(`Network error: ${err.message}. If this persists, check your network settings / CORS.`);
  }
});

function mergeGithubFile(name, data){
  const key = name.replace(/\.json$/,'').toLowerCase();
  const map = { tasks:'tasks', notes:'quickNotes', diary:'diary', risks:'risks', qaqc:'qaqc', safety:'safety', boq:'boq', steel:'steel' };
  const target = map[key];
  if(target && Array.isArray(data)){
    // merge by id when possible, otherwise append with fresh ids
    data.forEach(item=>{
      const withId = item.id ? item : { ...item, id: uid() };
      const idx = S[target].findIndex(x=>x.id===withId.id);
      if(idx>-1) S[target][idx] = withId; else S[target].push(withId);
    });
  }
}

/* ---------------------------------------------------------------------- */
/* 18. IMPORT / EXPORT / CLEAR                                            */
/* ---------------------------------------------------------------------- */
document.getElementById('exportBtn').addEventListener('click', ()=>{
  const blob = new Blob([JSON.stringify(S, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(S.projectName||'workspace').replace(/\s+/g,'_')}_industrcons.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast('Workspace exported');
});

document.getElementById('importFile').addEventListener('change', async e=>{
  const file = e.target.files[0];
  if(!file) return;
  try{
    const text = await file.text();
    const data = JSON.parse(text);
    S = Object.assign(defaultState(), data);
    persist();
    document.getElementById('projectName').value = S.projectName || 'Untitled Project';
    renderAll();
    toast('Workspace imported');
  }catch(err){
    toast('Import failed: invalid JSON file');
  }
  e.target.value = '';
});

document.getElementById('clearAllBtn').addEventListener('click', ()=>{
  openModal(`
    <h2>Erase Workspace</h2>
    <p class="hint">This permanently deletes everything stored on this device. Consider exporting first.</p>
    <div class="modal-actions">
      <button class="btn btn-ghost" id="mCancel">Cancel</button>
      <button class="btn btn-danger" id="mConfirm">Erase Everything</button>
    </div>`);
  document.getElementById('mCancel').onclick = closeModal;
  document.getElementById('mConfirm').onclick = ()=>{
    StorageAdapter.clear();
    S = defaultState();
    persist();
    document.getElementById('projectName').value = S.projectName;
    renderAll();
    closeModal();
    toast('Workspace erased');
  };
});

/* ---------------------------------------------------------------------- */
/* 19. TITLE BLOCK BINDINGS                                               */
/* ---------------------------------------------------------------------- */
const projectNameInput = document.getElementById('projectName');
projectNameInput.value = S.projectName;
projectNameInput.addEventListener('change', ()=>{
  S.projectName = projectNameInput.value.trim() || 'Untitled Project';
  persist();
});
document.getElementById('tbDate').textContent = new Date().toLocaleDateString(undefined, { year:'numeric', month:'short', day:'2-digit' });

/* ---------------------------------------------------------------------- */
/* 20. INIT                                                                */
/* ---------------------------------------------------------------------- */
renderAll();
renderConcrete();
showView('board');
