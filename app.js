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
function pad2(n){ return String(n).padStart(2,'0'); }

/* ---------------------------------------------------------------------- */
/* 2. i18n — AZ / EN                                                       */
/* ---------------------------------------------------------------------- */
const I18N = {
  az:{
    'tb.project':'LAYİHƏ','tb.sheet':'VƏRƏQ','tb.time':'VAXT','tb.saved':'Yadda saxlanıldı',
    'nav.board':'Lövhə','nav.dashboard':'İdarə Paneli','nav.calendar':'Təqvim','nav.diary':'Sahə Gündəliyi',
    'nav.planner':'Gündəlik Planlaşdırma','nav.notes':'Yapışqan Qeydlər','nav.quicknotes':'Sürətli Qeydlər',
    'nav.projectplan':'Layihə Planı','nav.risk':'Risk Reyestri','nav.qaqc':'Keyfiyyətə Nəzarət (QA/QC)',
    'nav.safety':'HSE / Təhlükəsizlik','nav.calculators':'Kalkulyatorlar','nav.reports':'Hesabatlar','nav.data':'İdxal Et',
    'h.board':'Kanban Lövhəsi','h.dashboard':'İrəliləyiş Paneli','h.throughput':'Lövhə Axını','h.byDept':'Departament üzrə Tapşırıqlar',
    'h.upcoming':'Yaxın Görüşlər','h.calendar':'Təqvim','h.diary':'Sahə Gündəliyi','h.planner':'Gündəlik Planlaşdırma',
    'h.notes':'Yapışqan Qeydlər','h.quicknotes':'Mühəndis Sürətli Qeydləri','h.projectplan':'Layihə Planı','h.risk':'Risk Reyestri',
    'h.qaqc':'Keyfiyyətə Nəzarət Siyahısı','h.safety':'HSE / Təhlükəsizlik Siyahısı','h.calculators':'Tikinti Kalkulyatorları',
    'h.reports':'Hesabatlar','h.data':'İş Sahəsini İdxal Et','h.import':'İdxal','h.danger':'Təhlükəli Zona',
    'btn.addTask':'+ Yeni Tapşırıq','btn.addEntry':'+ Yeni Qeyd','btn.addNote':'+ Yeni Qeyd','btn.addMilestone':'+ Mərhələ Əlavə Et',
    'btn.addRisk':'+ Yeni Risk','btn.addItem':'+ Əlavə Et','btn.addRow':'+ Sətir Əlavə Et','btn.print':'Çap Et / PDF Kimi Saxla',
    'btn.erase':'İş Sahəsini Sil','btn.today':'Bu gün',
    'hint.import':'Cihaza iş sahəsi JSON faylı yüklə (lövhə, gündəlik, qeydlər, planlaşdırma, risklər, siyahılar, kalkulyatorlar).',
    'hint.danger':'Bu cihazda saxlanan bütün məlumatları sil. Bu geri qaytarıla bilməz.',
    'col.milestone':'Mərhələ','col.start':'Başlama','col.end':'Bitmə','col.progress':'İrəliləyiş','col.status':'Status',
    'col.risk':'Risk','col.category':'Kateqoriya','col.likelihood':'Ehtimal','col.impact':'Təsir','col.score':'Bal',
    'col.mitigation':'Tədbir','col.owner':'Məsul','col.desc':'Təsvir','col.unit':'Vahid','col.rate':'Qiymət','col.amount':'Məbləğ','col.total':'CƏMİ',
    'f.length':'Uzunluq (m)','f.width':'En (m)','f.thickness':'Qalınlıq (mm)','f.mix':'Qarışıq Nisbəti','f.wastage':'İtki %',
    'f.dia':'Diametr (mm)','f.qty':'Say','f.unitkgm':'Vahid kg/m','f.weight':'Çəki (kg)','f.totalWeight':'ÜMUMİ ÇƏKİ',
    'f.profile':'Profil','f.depth':'Dərinlik (m)','f.bulking':'Boşalma %','f.truckCap':'Maşın Tutumu (m³)',
    'f.material':'Material','f.outerDia':'Xarici Diametr (mm)','f.wallThk':'Divar Qalınlığı (mm)',
    'f.element':'Element','f.height':'Hündürlük (m)','f.current':'Yük Cərəyanı (A)','f.voltage':'Sistem Gərginliyi (V)',
    'f.phase':'Faza','f.oneWay':'Uzunluq (bir istiqamət, m)','f.vdrop':'İcazəli Gərginlik Düşməsi %','f.conductor':'Naqil Materialı',
    'f.cableQty':'Kabel Sayı','f.avgDia':'Orta Kabel Diametri (mm)','f.trayHeight':'Tava Hündürlüyü (mm)','f.fillRatio':'Maks. Doldurma %',
    'f.wallLen':'Divar Uzunluğu (m)','f.wallHt':'Divar Hündürlüyü (m)','f.openings':'Çıxılacaq Boşluqlar (m²)','f.unitType':'Vahid Növü',
    'f.joint':'Tikiş Qalınlığı (mm)','f.mode':'Rejim','f.area':'Sahə (m²)','f.coats':'Qat Sayı','f.coverage':'Sərf Norması',
    'el.column':'Sütun','el.beam':'Tir','el.slab':'Döşəmə Altlığı','el.footing':'Təməl',
    'ph.single':'Bir Fazalı','ph.three':'Üç Fazalı','cd.copper':'Mis','cd.alu':'Alüminium',
    'md.plaster':'Suvaq','md.paint':'Boya',
    'eco.title':'IndustrCons Ekosistemi','eco.learn':'Ətraflı Öyrən','eco.knowledge':'Əlaqəli Bilik','eco.docs':'Əlaqəli Sənədlər','eco.ai':'IndustrCons AI-a Sual Ver',
    'eco.aboutTitle':'IndustrCons Haqqında',
    'eco.aboutBody':'IndustrCons tikinti-mühəndislik sənayesi üçün pulsuz, bir-birinə bağlı alətlər yaradır — IRE-3 təcrübə platforması, mühəndislik xəritəsi, bu iş sahəsi, smeta kalkulyatoru, sənədlər və süni intellekt köməkçisi.',
    'eco.founder':'Qurucu: Elvin Əsgərov','eco.rights':'© 2026 IndustrCons. Bütün hüquqlar qorunur.',
    'dept.all':'Hamısı','modal.cancel':'Ləğv Et','modal.save':'Yadda Saxla','modal.delete':'Sil','modal.close':'Bağla','modal.add':'Əlavə Et'
  },
  en:{
    'tb.project':'PROJECT','tb.sheet':'SHEET','tb.time':'TIME','tb.saved':'Saved',
    'nav.board':'Board','nav.dashboard':'Dashboard','nav.calendar':'Calendar','nav.diary':'Site Diary',
    'nav.planner':'Daily Planner','nav.notes':'Sticky Notes','nav.quicknotes':'Quick Notes',
    'nav.projectplan':'Project Plan','nav.risk':'Risk Register','nav.qaqc':'QA/QC Checklist',
    'nav.safety':'HSE / Safety','nav.calculators':'Calculators','nav.reports':'Reports','nav.data':'Import Workspace',
    'h.board':'Kanban Board','h.dashboard':'Progress Dashboard','h.throughput':'Board Throughput','h.byDept':'Tasks by Department',
    'h.upcoming':'Upcoming Meetings','h.calendar':'Calendar','h.diary':'Site Diary','h.planner':'Daily Planner',
    'h.notes':'Sticky Notes','h.quicknotes':'Engineering Quick Notes','h.projectplan':'Project Plan','h.risk':'Risk Register',
    'h.qaqc':'QA/QC Checklist','h.safety':'HSE / Safety Checklist','h.calculators':'Construction Calculators',
    'h.reports':'Reports','h.data':'Import Workspace','h.import':'Import','h.danger':'Danger Zone',
    'btn.addTask':'+ New Task','btn.addEntry':'+ New Entry','btn.addNote':'+ New Note','btn.addMilestone':'+ Add Milestone',
    'btn.addRisk':'+ New Risk','btn.addItem':'+ Add Item','btn.addRow':'+ Add Row','btn.print':'Print / Save as PDF',
    'btn.erase':'Erase Workspace','btn.today':'Today',
    'hint.import':'Load a workspace JSON file (board, diary, notes, planner, risks, checklists, calculators) into this device.',
    'hint.danger':'Clear all data stored on this device. This cannot be undone.',
    'col.milestone':'Milestone / Phase','col.start':'Start','col.end':'End','col.progress':'Progress','col.status':'Status',
    'col.risk':'Risk','col.category':'Category','col.likelihood':'Likelihood','col.impact':'Impact','col.score':'Score',
    'col.mitigation':'Mitigation','col.owner':'Owner','col.desc':'Description','col.unit':'Unit','col.rate':'Rate','col.amount':'Amount','col.total':'TOTAL',
    'f.length':'Length (m)','f.width':'Width (m)','f.thickness':'Thickness (mm)','f.mix':'Mix Ratio','f.wastage':'Wastage %',
    'f.dia':'Dia (mm)','f.qty':'Qty','f.unitkgm':'Unit kg/m','f.weight':'Weight (kg)','f.totalWeight':'TOTAL WEIGHT',
    'f.profile':'Profile','f.depth':'Depth (m)','f.bulking':'Bulking / Swell %','f.truckCap':'Truck Capacity (m³)',
    'f.material':'Material','f.outerDia':'Outer Diameter (mm)','f.wallThk':'Wall Thickness (mm)',
    'f.element':'Element','f.height':'Height (m)','f.current':'Load Current (A)','f.voltage':'System Voltage (V)',
    'f.phase':'Phase','f.oneWay':'Length one-way (m)','f.vdrop':'Allowed Voltage Drop %','f.conductor':'Conductor',
    'f.cableQty':'Number of Cables','f.avgDia':'Avg. Cable OD (mm)','f.trayHeight':'Tray Height (mm)','f.fillRatio':'Max Fill Ratio %',
    'f.wallLen':'Wall Length (m)','f.wallHt':'Wall Height (m)','f.openings':'Openings to Deduct (m²)','f.unitType':'Unit Type',
    'f.joint':'Joint Thickness (mm)','f.mode':'Mode','f.area':'Area (m²)','f.coats':'Coats','f.coverage':'Coverage Rate',
    'el.column':'Column','el.beam':'Beam','el.slab':'Slab Soffit','el.footing':'Footing',
    'ph.single':'Single Phase','ph.three':'Three Phase','cd.copper':'Copper','cd.alu':'Aluminum',
    'md.plaster':'Plaster','md.paint':'Paint',
    'eco.title':'IndustrCons Ecosystem','eco.learn':'Learn More','eco.knowledge':'Related Knowledge','eco.docs':'Related Documents','eco.ai':'Ask IndustrCons AI',
    'eco.aboutTitle':'About IndustrCons',
    'eco.aboutBody':'IndustrCons builds free, connected tools for the AEC industry — the IRE-3 internship platform, an engineering map, this workspace, a cost estimator, docs and an AI assistant.',
    'eco.founder':'Founded by Elvin Əsgərov','eco.rights':'© 2026 IndustrCons. All rights reserved.',
    'dept.all':'All','modal.cancel':'Cancel','modal.save':'Save','modal.delete':'Delete','modal.close':'Close','modal.add':'Add'
  }
};
function t(key){ return (I18N[S.lang] && I18N[S.lang][key]) || (I18N.az[key]) || key; }

function applyLanguage(){
  document.documentElement.lang = S.lang;
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    el.textContent = t(el.dataset.i18n);
  });
  document.getElementById('langToggle').textContent = S.lang.toUpperCase();
  renderAll();
}

/* ---------------------------------------------------------------------- */
/* 3. REFERENCE DATA — departments, board columns, calculator tabs        */
/* ---------------------------------------------------------------------- */
const DEPARTMENTS = [
  {key:'pm', az:'Layihə Meneceri', en:'Project Manager'},
  {key:'qaqc', az:'Keyfiyyətə Nəzarət', en:'QA/QC'},
  {key:'mep', az:'Mexanika və Santexnika', en:'Mechanical & Plumbing'},
  {key:'electrical', az:'Elektrik', en:'Electrical'},
  {key:'hse', az:'HSE', en:'HSE'},
  {key:'accounting', az:'Mühasibatlıq', en:'Accountant'},
  {key:'finishing', az:'İncə İşlər', en:'Finishing Works'},
  {key:'civil', az:'Tikinti-Struktur', en:'Civil / Structural'},
  {key:'procurement', az:'Təchizat', en:'Procurement'},
  {key:'general', az:'Ümumi', en:'General'}
];
function deptLabel(key){ const d = DEPARTMENTS.find(x=>x.key===key); return d ? d[S.lang] || d.az : key; }

const COLS = [
  {key:'todo', az:'Ediləcək', en:'To Do'},
  {key:'progress', az:'İcra Olunur', en:'In Progress'},
  {key:'review', az:'Yoxlanılır', en:'Review'},
  {key:'done', az:'Tamamlandı', en:'Completed'}
];
function colLabel(key){ const c = COLS.find(x=>x.key===key); return c ? c[S.lang] || c.az : key; }

const CALC_TABS = [
  {key:'concrete', az:'Beton', en:'Concrete'},
  {key:'steel', az:'Armatur (Polad)', en:'Rebar (Steel)'},
  {key:'structsteel', az:'Metal Konstruksiya', en:'Structural Steel'},
  {key:'earthwork', az:'Torpaq Qazıntısı', en:'Earthwork'},
  {key:'pipe', az:'Boru Hesabı', en:'Pipe'},
  {key:'formwork', az:'Qəlib (Beton Çıxıntı)', en:'Formwork'},
  {key:'cable', az:'Kabel Kəsiyi', en:'Cable Sizing'},
  {key:'tray', az:'Elektrik Tavası', en:'Cable Tray'},
  {key:'brick', az:'Kərpic/Blok', en:'Brickwork'},
  {key:'finish', az:'Suvaq/Boya', en:'Plaster & Paint'},
  {key:'boq', az:'Smeta (BOQ)', en:'BOQ'}
];

const MONTHS = {
  az:['Yanvar','Fevral','Mart','Aprel','May','İyun','İyul','Avqust','Sentyabr','Oktyabr','Noyabr','Dekabr'],
  en:['January','February','March','April','May','June','July','August','September','October','November','December']
};
const WEEKDAYS = { az:['B.e','Ç.a','Ç','C.a','C','Ş','B'], en:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] };

const RISK_STATUS = { open:{az:'Açıq',en:'Open'}, mitigating:{az:'Tədbir Görülür',en:'Mitigating'}, closed:{az:'Bağlı',en:'Closed'} };
const PLAN_STATUS = { notstarted:{az:'Başlanmayıb',en:'Not Started'}, inprogress:{az:'İcra Olunur',en:'In Progress'}, completed:{az:'Tamamlandı',en:'Completed'}, delayed:{az:'Gecikir',en:'Delayed'} };

const STEEL_PROFILES = [
  {key:'IPE100', kgm:8.1},{key:'IPE120', kgm:10.4},{key:'IPE140', kgm:12.9},{key:'IPE160', kgm:15.8},
  {key:'IPE180', kgm:18.8},{key:'IPE200', kgm:22.4},{key:'IPE220', kgm:26.2},{key:'IPE240', kgm:30.7},
  {key:'IPE270', kgm:36.1},{key:'IPE300', kgm:42.2},
  {key:'UPN100', kgm:10.6},{key:'UPN120', kgm:13.4},{key:'UPN140', kgm:16.0},{key:'UPN160', kgm:18.8},{key:'UPN180', kgm:22.0},
  {key:'L50x50x5', kgm:3.77},{key:'L65x65x6', kgm:5.91},{key:'L75x75x8', kgm:8.95},
  {key:'CUSTOM', kgm:0}
];
const STANDARD_CABLE_SIZES = [1.5,2.5,4,6,10,16,25,35,50,70,95,120,150,185,240,300];
const STANDARD_TRAY_WIDTHS = [50,75,100,150,200,300,400,500,600];

/* ---------------------------------------------------------------------- */
/* 4. DEFAULT STATE                                                       */
/* ---------------------------------------------------------------------- */
function defaultState(){
  return {
    lang: 'az',
    projectName: 'Untitled Project',
    uiDeptFilter: 'all',
    tasks: [
      { id: uid(), col:'todo', title:'Survey site boundary', priority:'medium', tag:'Survey', due:'', department:'civil' },
      { id: uid(), col:'progress', title:'Pour foundation — Block A', priority:'high', tag:'Civil', due:'', department:'civil' },
      { id: uid(), col:'review', title:'Review structural drawings Rev C', priority:'medium', tag:'Design', due:'', department:'pm' },
      { id: uid(), col:'done', title:'Mobilize site office', priority:'low', tag:'Admin', due:'', department:'pm' }
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
    planner: {},
    meetings: [],
    milestones: [
      { id: uid(), name:'Mobilization & Site Setup', start: todayISO(), end: todayISO(), progress:100, status:'completed' },
      { id: uid(), name:'Foundation Works', start: todayISO(), end: todayISO(), progress:35, status:'inprogress' }
    ],
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
    structSteel: [
      { id: uid(), profile:'IPE200', customKgm:0, length:6, qty:8 }
    ]
  };
}

let S = StorageAdapter.load() || defaultState();
// backfill any missing keys if loading an older export
S = Object.assign(defaultState(), S);
S.tasks.forEach(t=>{ if(!t.department) t.department = 'general'; });

function persist(){
  StorageAdapter.save(S);
  flashSaved();
}
function flashSaved(){
  const el = document.getElementById('saveIndicator');
  if(!el) return;
  el.querySelector('span').textContent = t('tb.saved');
}

/* ---------------------------------------------------------------------- */
/* 5. TOAST / MODAL HELPERS                                               */
/* ---------------------------------------------------------------------- */
function toast(msg){
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(()=>el.classList.remove('show'), 2200);
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
/* 6. NAVIGATION                                                          */
/* ---------------------------------------------------------------------- */
const sheetMeta = {
  board:{num:'01', key:'h.board'}, dashboard:{num:'02', key:'h.dashboard'}, calendar:{num:'03', key:'h.calendar'},
  diary:{num:'04', key:'h.diary'}, planner:{num:'05', key:'h.planner'}, notes:{num:'06', key:'h.notes'},
  quicknotes:{num:'07', key:'h.quicknotes'}, projectplan:{num:'08', key:'h.projectplan'}, risk:{num:'09', key:'h.risk'},
  qaqc:{num:'10', key:'h.qaqc'}, safety:{num:'11', key:'h.safety'}, calculators:{num:'12', key:'h.calculators'},
  reports:{num:'13', key:'h.reports'}, data:{num:'14', key:'h.data'}
};

function showView(name){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.getElementById('view-'+name).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active', n.dataset.view===name));
  const meta = sheetMeta[name];
  if(meta) document.getElementById('activeSheetLabel').textContent = meta.num + ' — ' + t(meta.key).toUpperCase();
  document.getElementById('sidenav').classList.remove('open');
  document.getElementById('navScrim').classList.remove('show');
  renderAll(name);
  window.scrollTo(0,0);
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
document.getElementById('langToggle').addEventListener('click', ()=>{
  S.lang = S.lang === 'az' ? 'en' : 'az';
  persist();
  applyLanguage();
  const active = document.querySelector('.nav-item.active');
  if(active) showView(active.dataset.view);
});

/* ---------------------------------------------------------------------- */
/* 7. RENDER DISPATCH                                                     */
/* ---------------------------------------------------------------------- */
function renderAll(only){
  if(!only || only==='board') renderBoard();
  if(!only || only==='dashboard') renderDashboard();
  if(!only || only==='calendar') renderCalendar();
  if(!only || only==='diary') renderDiary();
  if(!only || only==='planner') renderPlanner();
  if(!only || only==='notes') renderSticky();
  if(!only || only==='quicknotes') renderQuickNotes();
  if(!only || only==='projectplan') renderPlan();
  if(!only || only==='risk') renderRisk();
  if(!only || only==='qaqc') renderChecklist('qaqc');
  if(!only || only==='safety') renderChecklist('safety');
  if(!only || only==='calculators'){ renderCalcTabs(); renderConcrete(); renderSteel(); renderStructSteel(); renderEarthwork(); renderPipe(); renderFormwork(); renderCable(); renderTray(); renderBrick(); renderFinish(); renderBoq(); }
  if(!only || only==='reports') renderReport();
}

/* ---------------------------------------------------------------------- */
/* 8. KANBAN BOARD + DEPARTMENT FILTER                                    */
/* ---------------------------------------------------------------------- */
function renderDeptTabs(){
  const wrap = document.getElementById('deptTabs');
  const chips = [{key:'all', label:t('dept.all')}].concat(DEPARTMENTS.map(d=>({key:d.key, label:deptLabel(d.key)})));
  wrap.innerHTML = chips.map(c=>`<button class="dept-chip ${S.uiDeptFilter===c.key?'active':''}" data-dept="${c.key}">${esc(c.label)}</button>`).join('');
  wrap.querySelectorAll('.dept-chip').forEach(btn=>{
    btn.addEventListener('click', ()=>{ S.uiDeptFilter = btn.dataset.dept; persist(); renderBoard(); });
  });
}

function renderBoard(){
  renderDeptTabs();
  const board = document.getElementById('board');
  board.innerHTML = '';
  const filtered = S.uiDeptFilter==='all' ? S.tasks : S.tasks.filter(t=>t.department===S.uiDeptFilter);
  COLS.forEach(col=>{
    const items = filtered.filter(t=>t.col===col.key);
    const colEl = document.createElement('div');
    colEl.className = 'col';
    colEl.dataset.col = col.key;
    colEl.innerHTML = `
      <div class="col-head"><h3>${esc(colLabel(col.key))}</h3><span class="col-count">${items.length}</span></div>
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
      <span class="tag tag-dept">${esc(deptLabel(t.department||'general'))}</span>
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
    <h2>${t?'✎':'+'} ${esc(colLabel('todo')==='To Do'?'Task':'Tapşırıq')}</h2>
    <div class="field-row"><label>${t?'':''}${t?'':''}${esc('')}</label></div>
    <div class="field-row"><label>${esc(t?'':'')}</label></div>
    <div class="field-row"><label>Title</label><input id="mTitle" type="text" value="${t?esc(t.title):''}"></div>
    <div class="field-row"><label>Department</label>
      <select id="mDept">${DEPARTMENTS.map(d=>`<option value="${d.key}" ${t&&t.department===d.key?'selected':(!t&&d.key==='general'?'selected':'')}>${esc(deptLabel(d.key))}</option>`).join('')}</select>
    </div>
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
        ${COLS.map(c=>`<option value="${c.key}" ${t&&t.col===c.key?'selected':(!t&&c.key==='todo'?'selected':'')}>${esc(colLabel(c.key))}</option>`).join('')}
      </select>
    </div>
    <div class="modal-actions">
      ${t?`<button class="btn btn-danger" id="mDelete">${t('modal.delete')}</button>`:''}
      <button class="btn btn-ghost" id="mCancel">${t('modal.cancel')}</button>
      <button class="btn btn-amber" id="mSave">${t('modal.save')}</button>
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
      col: document.getElementById('mCol').value,
      department: document.getElementById('mDept').value
    };
    if(t) Object.assign(t, data);
    else S.tasks.push({ id: uid(), ...data });
    persist(); closeModal(); renderBoard(); renderDashboard();
  };
}
document.getElementById('addTaskBtn').addEventListener('click', ()=> editTask(null));

/* ---------------------------------------------------------------------- */
/* 9. DASHBOARD                                                           */
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
    tile(safetyPct+'%','HSE Complete')
  ].join('');

  const bars = document.getElementById('dashBars');
  bars.innerHTML = COLS.map(c=>{
    const n = S.tasks.filter(t=>t.col===c.key).length;
    const pct = total ? Math.round(n/total*100) : 0;
    return `<div class="bar-row"><span>${esc(colLabel(c.key))}</span><div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div><span>${n}</span></div>`;
  }).join('');

  const deptBars = document.getElementById('dashDeptBars');
  deptBars.innerHTML = DEPARTMENTS.map(d=>{
    const n = S.tasks.filter(t=>(t.department||'general')===d.key).length;
    const pct = total ? Math.round(n/total*100) : 0;
    return n ? `<div class="bar-row"><span>${esc(deptLabel(d.key))}</span><div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div><span>${n}</span></div>` : '';
  }).join('') || `<p class="hint">—</p>`;

  const upcoming = [...S.meetings].filter(m=>m.date >= todayISO()).sort((a,b)=> (a.date+a.time).localeCompare(b.date+b.time)).slice(0,5);
  const upEl = document.getElementById('dashUpcoming');
  upEl.innerHTML = upcoming.length ? upcoming.map(m=>`
    <div class="diary-card">
      <div class="diary-head"><span class="diary-date">${esc(m.date)} · ${esc(m.time||'')}</span></div>
      <div class="diary-body">${esc(m.title)}</div>
    </div>`).join('') : `<p class="hint">—</p>`;
}
function tile(num,lbl){ return `<div class="dash-tile"><div class="num">${num}</div><div class="lbl">${lbl}</div></div>`; }
function pctDone(list){ if(!list.length) return 0; return Math.round(list.filter(i=>i.checked).length/list.length*100); }

/* ---------------------------------------------------------------------- */
/* 10. CALENDAR + LIVE CLOCK                                              */
/* ---------------------------------------------------------------------- */
const now0 = new Date();
let calCursor = { y: now0.getFullYear(), m: now0.getMonth() };

function renderCalendar(){
  document.getElementById('calLabel').textContent = `${MONTHS[S.lang][calCursor.m]} ${calCursor.y}`;
  const grid = document.getElementById('calGrid');
  grid.innerHTML = '';
  WEEKDAYS[S.lang].forEach(w=>{
    const el = document.createElement('div');
    el.className = 'cal-weekday';
    el.textContent = w;
    grid.appendChild(el);
  });
  const first = new Date(calCursor.y, calCursor.m, 1);
  const startOffset = (first.getDay()+6)%7; // Monday=0
  const daysInMonth = new Date(calCursor.y, calCursor.m+1, 0).getDate();
  const todayStr = todayISO();

  for(let i=0;i<startOffset;i++){
    const el = document.createElement('div');
    el.className = 'cal-cell cal-cell-empty';
    grid.appendChild(el);
  }
  for(let d=1; d<=daysInMonth; d++){
    const dateStr = `${calCursor.y}-${pad2(calCursor.m+1)}-${pad2(d)}`;
    const dayMeetings = S.meetings.filter(m=>m.date===dateStr).sort((a,b)=>(a.time||'').localeCompare(b.time||''));
    const el = document.createElement('div');
    el.className = 'cal-cell' + (dateStr===todayStr?' cal-today':'');
    el.innerHTML = `<div class="cal-daynum">${d}</div>
      <div class="cal-meetings">
        ${dayMeetings.slice(0,2).map(m=>`<div class="cal-chip">${esc(m.time||'')} ${esc(m.title)}</div>`).join('')}
        ${dayMeetings.length>2 ? `<div class="cal-more">+${dayMeetings.length-2}</div>` : ''}
      </div>`;
    el.addEventListener('click', ()=> openDayModal(dateStr));
    grid.appendChild(el);
  }
}
document.getElementById('calPrev').addEventListener('click', ()=>{
  calCursor.m--; if(calCursor.m<0){ calCursor.m=11; calCursor.y--; } renderCalendar();
});
document.getElementById('calNext').addEventListener('click', ()=>{
  calCursor.m++; if(calCursor.m>11){ calCursor.m=0; calCursor.y++; } renderCalendar();
});
document.getElementById('calToday').addEventListener('click', ()=>{
  const n = new Date(); calCursor = { y:n.getFullYear(), m:n.getMonth() }; renderCalendar();
});

function openDayModal(dateStr){
  const dayMeetings = S.meetings.filter(m=>m.date===dateStr).sort((a,b)=>(a.time||'').localeCompare(b.time||''));
  openModal(`
    <h2>${esc(dateStr)}</h2>
    <div class="stack" id="dayMeetingList">
      ${dayMeetings.map(m=>`
        <div class="diary-card" data-mid="${m.id}">
          <div class="diary-head">
            <span class="diary-date">${esc(m.time||'')} — ${esc(deptLabel(m.department||'general'))}</span>
            <button class="btn-icon" data-delmeet="${m.id}">✕</button>
          </div>
          <div class="diary-body">${esc(m.title)}${m.notes?('\n'+m.notes):''}</div>
        </div>`).join('') || `<p class="hint">—</p>`}
    </div>
    <div class="field-row"><label>Time</label><input id="nmTime" type="time" value="09:00"></div>
    <div class="field-row"><label>Title</label><input id="nmTitle" type="text" placeholder="Meeting title"></div>
    <div class="field-row"><label>Department</label>
      <select id="nmDept">${DEPARTMENTS.map(d=>`<option value="${d.key}">${esc(deptLabel(d.key))}</option>`).join('')}</select>
    </div>
    <div class="field-row"><label>Notes</label><textarea id="nmNotes" rows="2"></textarea></div>
    <div class="modal-actions">
      <button class="btn btn-ghost" id="mCancel">${t('modal.close')}</button>
      <button class="btn btn-amber" id="mAddMeet">${t('modal.add')}</button>
    </div>`);
  document.getElementById('mCancel').onclick = closeModal;
  document.querySelectorAll('[data-delmeet]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      S.meetings = S.meetings.filter(x=>x.id!==btn.dataset.delmeet);
      persist(); closeModal(); renderCalendar(); renderDashboard();
    });
  });
  document.getElementById('mAddMeet').onclick = ()=>{
    const title = document.getElementById('nmTitle').value.trim();
    if(!title){ toast('Title required'); return; }
    S.meetings.push({
      id: uid(), date: dateStr, time: document.getElementById('nmTime').value,
      title, department: document.getElementById('nmDept').value,
      notes: document.getElementById('nmNotes').value.trim()
    });
    persist(); closeModal(); renderCalendar(); renderDashboard();
  };
}

function tickClock(){
  const n = new Date();
  document.getElementById('liveClock').textContent = `${pad2(n.getHours())}:${pad2(n.getMinutes())}:${pad2(n.getSeconds())}`;
}

/* ---------------------------------------------------------------------- */
/* 11. SITE DIARY                                                         */
/* ---------------------------------------------------------------------- */
function renderDiary(){
  const wrap = document.getElementById('diaryList');
  if(!S.diary.length){ wrap.innerHTML = `<p class="hint">—</p>`; return; }
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
    <h2>${t('h.diary')}</h2>
    <div class="field-row"><label>Date</label><input id="dDate" type="date" value="${todayISO()}"></div>
    <div class="field-row"><label>Weather</label><input id="dWeather" type="text" placeholder="e.g. Clear, 34°C"></div>
    <div class="field-row"><label>Manpower on site</label><input id="dManpower" type="text" placeholder="e.g. 42"></div>
    <div class="field-row"><label>Equipment on site</label><input id="dEquipment" type="text" placeholder="e.g. 2x excavator, 1x crane"></div>
    <div class="field-row"><label>Progress summary</label><input id="dProgress" type="text" placeholder="e.g. Slab pour 60% complete"></div>
    <div class="field-row"><label>Notes</label><textarea id="dNotes" rows="4"></textarea></div>
    <div class="field-row"><label>Photos</label><input id="dPhotos" type="file" accept="image/*" multiple></div>
    <div class="modal-actions">
      <button class="btn btn-ghost" id="mCancel">${t('modal.cancel')}</button>
      <button class="btn btn-amber" id="mSave">${t('modal.save')}</button>
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
/* 12. DAILY PLANNER                                                      */
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
    const time = pad2(h)+':00';
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
/* 13. STICKY NOTES                                                       */
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
/* 14. ENGINEERING QUICK NOTES                                            */
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
/* 15. PROJECT PLAN (MILESTONES)                                          */
/* ---------------------------------------------------------------------- */
function renderPlan(){
  const body = document.getElementById('planBody');
  body.innerHTML = '';
  S.milestones.forEach(m=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type="text" value="${esc(m.name)}" data-f="name"></td>
      <td><input type="date" value="${esc(m.start)}" data-f="start"></td>
      <td><input type="date" value="${esc(m.end)}" data-f="end"></td>
      <td>
        <div class="plan-progress">
          <div class="bar-track"><div class="bar-fill" style="width:${m.progress}%"></div></div>
          <input type="number" min="0" max="100" value="${m.progress}" data-f="progress">
        </div>
      </td>
      <td><select data-f="status">
        ${Object.keys(PLAN_STATUS).map(k=>`<option value="${k}" ${m.status===k?'selected':''}>${esc(PLAN_STATUS[k][S.lang])}</option>`).join('')}
      </select></td>
      <td><button class="btn-icon" data-del>✕</button></td>`;
    tr.querySelectorAll('[data-f]').forEach(inp=>{
      inp.addEventListener('change', ()=>{
        const f = inp.dataset.f;
        m[f] = f==='progress' ? Math.max(0,Math.min(100,Number(inp.value)||0)) : inp.value;
        persist(); renderPlan();
      });
    });
    tr.querySelector('[data-del]').addEventListener('click', ()=>{
      S.milestones = S.milestones.filter(x=>x.id!==m.id); persist(); renderPlan();
    });
    body.appendChild(tr);
  });
}
document.getElementById('addMilestoneBtn').addEventListener('click', ()=>{
  S.milestones.push({ id: uid(), name:'New milestone', start: todayISO(), end: todayISO(), progress:0, status:'notstarted' });
  persist(); renderPlan();
});

/* ---------------------------------------------------------------------- */
/* 16. RISK REGISTER                                                      */
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
        ${Object.keys(RISK_STATUS).map(k=>`<option value="${k}" ${r.status===k?'selected':''}>${esc(RISK_STATUS[k][S.lang])}</option>`).join('')}
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
/* 17. CHECKLISTS (QA/QC + HSE Safety share logic)                        */
/* ---------------------------------------------------------------------- */
function renderChecklist(kind){
  const list = document.getElementById(kind+'List');
  const meta = document.getElementById(kind+'Meta');
  const items = S[kind];
  const pct = pctDone(items);
  meta.innerHTML = `<div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div><span class="pct">${pct}%</span>`;
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
/* 18. CALCULATORS (consolidated, sub-tabs)                               */
/* ---------------------------------------------------------------------- */
function renderCalcTabs(){
  const wrap = document.getElementById('calcTabs');
  wrap.innerHTML = CALC_TABS.map((c,i)=>`<button class="calc-tab ${i===0 && !wrap.dataset.active ? '' : ''} ${(wrap.dataset.active||CALC_TABS[0].key)===c.key?'active':''}" data-calc="${c.key}">${esc(c[S.lang])}</button>`).join('');
  wrap.querySelectorAll('.calc-tab').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      wrap.dataset.active = btn.dataset.calc;
      wrap.querySelectorAll('.calc-tab').forEach(b=>b.classList.toggle('active', b===btn));
      document.querySelectorAll('.calc-pane').forEach(p=>p.classList.toggle('active', p.id==='calc-'+btn.dataset.calc));
    });
  });
}

/* -- Concrete -- */
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
  const dryVolume = wetVolume * 1.54;
  const cementVol = dryVolume * (c/sumParts);
  const sandVol = dryVolume * (s/sumParts);
  const aggVol = dryVolume * (a/sumParts);
  const cementBags = (cementVol * 1440) / 50;
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

/* -- Steel (rebar) -- */
function unitKgPerM(dia){ return (dia*dia)/162.2; }
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
      inp.addEventListener('input', ()=>{ row[inp.dataset.f] = Number(inp.value)||0; persist(); renderSteel(); });
    });
    tr.querySelector('[data-del]').addEventListener('click', ()=>{
      S.steel = S.steel.filter(x=>x.id!==row.id); persist(); renderSteel();
    });
    body.appendChild(tr);
  });
  document.getElementById('steelTotal').textContent = total.toFixed(2)+' kg';
}
document.getElementById('addSteelRowBtn').addEventListener('click', ()=>{
  S.steel.push({ id: uid(), dia:10, length:6, qty:10 }); persist(); renderSteel();
});

/* -- Structural steel -- */
function renderStructSteel(){
  const body = document.getElementById('structBody');
  body.innerHTML = '';
  let total = 0;
  S.structSteel.forEach(row=>{
    const prof = STEEL_PROFILES.find(p=>p.key===row.profile) || STEEL_PROFILES[0];
    const kgm = row.profile==='CUSTOM' ? (Number(row.customKgm)||0) : prof.kgm;
    const weight = kgm * (Number(row.length)||0) * (Number(row.qty)||0);
    total += weight;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><select data-f="profile">${STEEL_PROFILES.map(p=>`<option value="${p.key}" ${row.profile===p.key?'selected':''}>${p.key==='CUSTOM'?'Custom':p.key}</option>`).join('')}</select></td>
      <td>${row.profile==='CUSTOM' ? `<input type="number" value="${row.customKgm||0}" data-f="customKgm" style="max-width:80px">` : kgm.toFixed(2)}</td>
      <td><input type="number" value="${row.length}" data-f="length" style="max-width:80px"></td>
      <td><input type="number" value="${row.qty}" data-f="qty" style="max-width:80px"></td>
      <td class="tf-total" style="font-size:13px">${weight.toFixed(2)}</td>
      <td><button class="btn-icon" data-del>✕</button></td>`;
    tr.querySelectorAll('[data-f]').forEach(inp=>{
      inp.addEventListener('input', ()=>{
        const f = inp.dataset.f;
        row[f] = (f==='profile') ? inp.value : Number(inp.value)||0;
        persist(); renderStructSteel();
      });
    });
    tr.querySelector('[data-del]').addEventListener('click', ()=>{
      S.structSteel = S.structSteel.filter(x=>x.id!==row.id); persist(); renderStructSteel();
    });
    body.appendChild(tr);
  });
  document.getElementById('structTotal').textContent = total.toFixed(2)+' kg';
}
document.getElementById('addStructRowBtn').addEventListener('click', ()=>{
  S.structSteel.push({ id: uid(), profile:'IPE200', customKgm:0, length:6, qty:1 }); persist(); renderStructSteel();
});

/* -- Earthwork -- */
function renderEarthwork(){
  const len = Number(document.getElementById('eLen').value)||0;
  const wid = Number(document.getElementById('eWid').value)||0;
  const depth = Number(document.getElementById('eDepth').value)||0;
  const bulk = Number(document.getElementById('eBulk').value)||0;
  const truck = Number(document.getElementById('eTruck').value)||1;
  const bank = len*wid*depth;
  const loose = bank*(1+bulk/100);
  const trips = truck>0 ? Math.ceil(loose/truck) : 0;
  document.getElementById('eResult').innerHTML = `
    <div class="r-row"><span>Bank (in-situ) volume</span><b>${bank.toFixed(2)} m³</b></div>
    <div class="r-row"><span>Loose (bulked) volume</span><b>${loose.toFixed(2)} m³</b></div>
    <div class="r-row"><span>Truck trips required</span><b>${trips}</b></div>`;
}
['eLen','eWid','eDepth','eBulk','eTruck'].forEach(id=>document.getElementById(id).addEventListener('input', renderEarthwork));

/* -- Pipe -- */
function renderPipe(){
  const density = Number(document.getElementById('pMat').value)||7850;
  const od = Number(document.getElementById('pOD').value)||0;
  const wt = Number(document.getElementById('pWT').value)||0;
  const len = Number(document.getElementById('pLen').value)||0;
  const id_ = Math.max(od - 2*wt, 0);
  const areaMm2 = Math.PI/4*(od*od - id_*id_);
  const volumeM3 = areaMm2 * len / 1e6;
  const weight = volumeM3 * density;
  const capacityL = Math.PI/4*Math.pow(id_/1000,2) * len * 1000;
  document.getElementById('pResult').innerHTML = `
    <div class="r-row"><span>Inner diameter</span><b>${id_.toFixed(1)} mm</b></div>
    <div class="r-row"><span>Material volume</span><b>${volumeM3.toFixed(4)} m³</b></div>
    <div class="r-row"><span>Pipe weight</span><b>${weight.toFixed(2)} kg</b></div>
    <div class="r-row"><span>Internal flow capacity</span><b>${capacityL.toFixed(1)} L</b></div>`;
}
['pMat','pOD','pWT','pLen'].forEach(id=>{
  document.getElementById(id).addEventListener('input', renderPipe);
  document.getElementById(id).addEventListener('change', renderPipe);
});

/* -- Formwork -- */
function updateFormworkLabels(){
  const el = document.getElementById('fElement').value;
  const l2 = document.getElementById('fDim2Label'), l3 = document.getElementById('fDim3Label');
  const d3 = document.getElementById('fDim3');
  if(el==='column'){ l2.textContent = t('f.depth'); l3.textContent = t('f.height'); d3.closest('.field-row').style.display=''; }
  else if(el==='beam'){ l2.textContent = t('f.depth'); l3.textContent = t('f.length'); d3.closest('.field-row').style.display=''; }
  else if(el==='slab'){ l2.textContent = t('f.width'); l3.closest('.field-row').style.display='none'; }
  else { l2.textContent = t('f.length'); l3.textContent = t('f.depth'); d3.closest('.field-row').style.display=''; }
}
function renderFormwork(){
  updateFormworkLabels();
  const el = document.getElementById('fElement').value;
  const w = Number(document.getElementById('fWid').value)||0;
  const d2 = Number(document.getElementById('fDim2').value)||0;
  const d3 = Number(document.getElementById('fDim3').value)||0;
  const qty = Number(document.getElementById('fQty').value)||0;
  let area = 0;
  if(el==='column') area = 2*(w+d2)*d3*qty;
  else if(el==='beam') area = (2*d2+w)*d3*qty;
  else if(el==='slab') area = w*d2*qty;
  else area = 2*(w+d2)*d3*qty;
  const sheets = Math.ceil((area/2.88)*1.1);
  document.getElementById('fResult').innerHTML = `
    <div class="r-row"><span>Formwork contact area</span><b>${area.toFixed(2)} m²</b></div>
    <div class="r-row"><span>Plywood sheets (1.2×2.4m, +10%)</span><b>${sheets}</b></div>`;
}
['fElement','fWid','fDim2','fDim3','fQty'].forEach(id=>{
  document.getElementById(id).addEventListener('input', renderFormwork);
  document.getElementById(id).addEventListener('change', renderFormwork);
});

/* -- Cable sizing -- */
function renderCable(){
  const I = Number(document.getElementById('kI').value)||0;
  const V = Number(document.getElementById('kV').value)||1;
  const phase = Number(document.getElementById('kPhase').value)||1;
  const len = Number(document.getElementById('kLen').value)||0;
  const dropPct = Number(document.getElementById('kDrop').value)||1;
  const rho = Number(document.getElementById('kCond').value)||0.0175;
  const allowedDropV = V * dropPct/100;
  const factor = phase===1 ? 2 : Math.sqrt(3);
  const areaMm2 = allowedDropV>0 ? (factor*len*I*rho)/allowedDropV : 0;
  const standard = STANDARD_CABLE_SIZES.find(s=>s>=areaMm2) || STANDARD_CABLE_SIZES[STANDARD_CABLE_SIZES.length-1];
  document.getElementById('kResult').innerHTML = `
    <div class="r-row"><span>Calculated cross-section</span><b>${areaMm2.toFixed(2)} mm²</b></div>
    <div class="r-row"><span>Nearest standard size</span><b>${standard} mm²</b></div>
    <div class="r-row"><span>Allowed voltage drop</span><b>${allowedDropV.toFixed(1)} V</b></div>`;
}
['kI','kV','kPhase','kLen','kDrop','kCond'].forEach(id=>{
  document.getElementById(id).addEventListener('input', renderCable);
  document.getElementById(id).addEventListener('change', renderCable);
});

/* -- Cable tray -- */
function renderTray(){
  const qty = Number(document.getElementById('tQty').value)||0;
  const dia = Number(document.getElementById('tDia').value)||0;
  const height = Number(document.getElementById('tHeight').value)||1;
  const fill = Number(document.getElementById('tFill').value)||40;
  const cableArea = qty * Math.PI/4 * dia*dia;
  const requiredArea = fill>0 ? cableArea/(fill/100) : 0;
  const requiredWidth = requiredArea/height;
  const standard = STANDARD_TRAY_WIDTHS.find(w=>w>=requiredWidth) || STANDARD_TRAY_WIDTHS[STANDARD_TRAY_WIDTHS.length-1];
  document.getElementById('tResult').innerHTML = `
    <div class="r-row"><span>Total cable area</span><b>${(cableArea/1e2).toFixed(1)} cm²</b></div>
    <div class="r-row"><span>Required internal width</span><b>${requiredWidth.toFixed(0)} mm</b></div>
    <div class="r-row"><span>Nearest standard tray width</span><b>${standard} mm</b></div>`;
}
['tQty','tDia','tHeight','tFill'].forEach(id=>document.getElementById(id).addEventListener('input', renderTray));

/* -- Brickwork -- */
function renderBrick(){
  const len = Number(document.getElementById('bLen').value)||0;
  const ht = Number(document.getElementById('bHt').value)||0;
  const open = Number(document.getElementById('bOpen').value)||0;
  const unit = document.getElementById('bUnit').value;
  const joint = Number(document.getElementById('bJoint').value)||0;
  const waste = Number(document.getElementById('bWaste').value)||0;
  const [uw,uh] = unit.split('x').map(Number);
  const netArea = Math.max(len*ht - open, 0);
  const unitArea = ((uw+joint)/1000)*((uh+joint)/1000);
  const units = unitArea>0 ? Math.ceil((netArea/unitArea)*(1+waste/100)) : 0;
  document.getElementById('bResult').innerHTML = `
    <div class="r-row"><span>Net wall area</span><b>${netArea.toFixed(2)} m²</b></div>
    <div class="r-row"><span>Units required</span><b>${units}</b></div>`;
}
['bLen','bHt','bOpen','bUnit','bJoint','bWaste'].forEach(id=>{
  document.getElementById(id).addEventListener('input', renderBrick);
  document.getElementById(id).addEventListener('change', renderBrick);
});

/* -- Plaster & Paint -- */
function renderFinish(){
  const mode = document.getElementById('gMode').value;
  const area = Number(document.getElementById('gArea').value)||0;
  const coats = Number(document.getElementById('gCoats').value)||1;
  const rate = Number(document.getElementById('gRate').value)||0;
  const needed = area*coats*rate;
  const unit = mode==='plaster' ? 'kg' : 'L';
  let extra = '';
  if(mode==='paint'){
    const cans = Math.ceil(needed/18);
    extra = `<div class="r-row"><span>18L cans needed</span><b>${cans}</b></div>`;
  }
  document.getElementById('gResult').innerHTML = `
    <div class="r-row"><span>Material required</span><b>${needed.toFixed(1)} ${unit}</b></div>${extra}`;
}
['gMode','gArea','gCoats','gRate'].forEach(id=>{
  document.getElementById(id).addEventListener('input', renderFinish);
  document.getElementById(id).addEventListener('change', ()=>{
    if(id==='gMode'){
      const mode = document.getElementById('gMode').value;
      document.getElementById('gRate').value = mode==='plaster' ? 16 : 0.13;
      document.getElementById('gCoats').value = mode==='plaster' ? 1 : 2;
    }
    renderFinish();
  });
});

/* -- BOQ -- */
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
  S.boq.push({ id: uid(), desc:'New item', unit:'nos', qty:1, rate:0 }); persist(); renderBoq();
});

/* ---------------------------------------------------------------------- */
/* 19. REPORTS                                                            */
/* ---------------------------------------------------------------------- */
function renderReport(){
  const total = S.tasks.length;
  const done = S.tasks.filter(t=>t.col==='done').length;
  const qaqcPct = pctDone(S.qaqc), safetyPct = pctDone(S.safety);
  const riskCounts = { open:0, mitigating:0, closed:0 };
  S.risks.forEach(r=> riskCounts[r.status] = (riskCounts[r.status]||0)+1);
  const highRisks = S.risks.filter(r=>r.likelihood*r.impact>=12);
  const lastDiary = [...S.diary].sort((a,b)=>b.date.localeCompare(a.date))[0];
  const now = new Date();

  document.getElementById('reportSheet').innerHTML = `
    <div class="report-head">
      <img src="assets/logo-mark.png" alt="IndustrCons" class="report-logo">
      <div>
        <h2 class="report-project">${esc(S.projectName)}</h2>
        <div class="report-date">${now.toLocaleDateString()} ${pad2(now.getHours())}:${pad2(now.getMinutes())}</div>
      </div>
    </div>
    <div class="report-grid">
      ${tile(total,'Total Tasks')}${tile(done,'Completed')}${tile(qaqcPct+'%','QA/QC')}${tile(safetyPct+'%','HSE')}
    </div>
    <h3 class="report-section">${t('h.risk')}</h3>
    <p>${esc(RISK_STATUS.open[S.lang])}: <b>${riskCounts.open||0}</b> · ${esc(RISK_STATUS.mitigating[S.lang])}: <b>${riskCounts.mitigating||0}</b> · ${esc(RISK_STATUS.closed[S.lang])}: <b>${riskCounts.closed||0}</b></p>
    ${highRisks.length ? `<ul class="report-list">${highRisks.map(r=>`<li>${esc(r.risk)} — ${esc(r.owner||'—')}</li>`).join('')}</ul>` : ''}
    <h3 class="report-section">${t('h.projectplan')}</h3>
    <ul class="report-list">${S.milestones.map(m=>`<li>${esc(m.name)} — ${m.progress}% (${esc(PLAN_STATUS[m.status]?PLAN_STATUS[m.status][S.lang]:m.status)})</li>`).join('') || '<li>—</li>'}</ul>
    <h3 class="report-section">${t('h.diary')}</h3>
    <p>${S.diary.length} ${S.lang==='az'?'qeyd':'entries'}${lastDiary?(' · '+t('col.status')+': '+esc(lastDiary.date)+' — '+esc(lastDiary.progress||'')):''}</p>
  `;
}
document.getElementById('printReportBtn').addEventListener('click', ()=> window.print());

/* ---------------------------------------------------------------------- */
/* 20. IMPORT / CLEAR                                                     */
/* ---------------------------------------------------------------------- */
document.getElementById('importFile').addEventListener('change', async e=>{
  const file = e.target.files[0];
  if(!file) return;
  try{
    const text = await file.text();
    const data = JSON.parse(text);
    S = Object.assign(defaultState(), data);
    persist();
    document.getElementById('projectName').value = S.projectName || 'Untitled Project';
    applyLanguage();
    toast('Workspace imported');
  }catch(err){
    toast('Import failed: invalid JSON file');
  }
  e.target.value = '';
});

document.getElementById('clearAllBtn').addEventListener('click', ()=>{
  openModal(`
    <h2>${t('btn.erase')}</h2>
    <p class="hint">${t('hint.danger')}</p>
    <div class="modal-actions">
      <button class="btn btn-ghost" id="mCancel">${t('modal.cancel')}</button>
      <button class="btn btn-danger" id="mConfirm">${t('btn.erase')}</button>
    </div>`);
  document.getElementById('mCancel').onclick = closeModal;
  document.getElementById('mConfirm').onclick = ()=>{
    StorageAdapter.clear();
    S = defaultState();
    persist();
    document.getElementById('projectName').value = S.projectName;
    applyLanguage();
    closeModal();
    toast('Workspace erased');
  };
});

/* ---------------------------------------------------------------------- */
/* 21. TITLE BLOCK BINDINGS                                               */
/* ---------------------------------------------------------------------- */
const projectNameInput = document.getElementById('projectName');
projectNameInput.value = S.projectName;
projectNameInput.addEventListener('change', ()=>{
  S.projectName = projectNameInput.value.trim() || 'Untitled Project';
  persist();
});

/* ---------------------------------------------------------------------- */
/* 22. INIT                                                                */
/* ---------------------------------------------------------------------- */
applyLanguage();
tickClock();
setInterval(tickClock, 1000);
showView('board');
