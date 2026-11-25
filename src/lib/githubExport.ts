import JSZip from 'jszip';
import { getSupabaseConfig } from './supabase';

export interface StaticBundleFiles {
  'index.html': string;
  'style.css': string;
  'config.js': string;
  'tables.js': string;
  'app.js': string;
}

export function generateGitHubRootFiles(customUrl?: string, customKey?: string): StaticBundleFiles {
  const current = getSupabaseConfig();
  const url = (customUrl ?? current.url).trim();
  const anonKey = (customKey ?? current.anonKey).trim();

  const indexHtml = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>NOUB CRM — متابعة الاشتراكات والتطبيقات</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="./style.css">
</head>
<body>
  <div id="boot-screen" class="boot-screen">
    <div class="boot-card">
      <p id="boot-msg">جاري تحميل النظام والتحقق من الجلسة...</p>
    </div>
  </div>

  <section id="login" hidden>
    <form id="lf" class="login-card">
      <div class="login-head">
        <h1>NOUB CRM</h1>
        <p>متابعة الاشتراكات والدومينات ومسار تسليم التطبيقات</p>
      </div>
      <label>البريد الإلكتروني
        <input id="em" type="email" placeholder="name@company.com" required autocomplete="email">
      </label>
      <label>كلمة المرور
        <input id="pw" type="password" placeholder="••••••••" required autocomplete="current-password">
      </label>
      <button id="login-btn" type="submit">دخول</button>
      <p id="le" class="err-msg"></p>
    </form>
  </section>

  <div id="app" hidden>
    <aside id="sidebar">
      <div class="brand">
        <h2>NOUB CRM</h2>
        <span id="user-email" class="user-email"></span>
      </div>
      <nav id="nav"></nav>
      <button id="out" class="ghost" type="button">تسجيل الخروج</button>
    </aside>
    <main>
      <header class="topbar">
        <div>
          <h1 id="title"></h1>
          <p id="subtitle" class="subtitle"></p>
        </div>
        <div id="tools" class="tools"></div>
      </header>
      <div id="view"></div>
    </main>
  </div>

  <dialog id="dlg">
    <form id="df" method="dialog"></form>
  </dialog>

  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js"></script>
  <script src="./config.js"></script>
  <script src="./tables.js"></script>
  <script src="./app.js"></script>
</body>
</html>
`;

  const styleCss = `*{box-sizing:border-box}
:root{
  --bg:#f8fafc;--surface:#ffffff;--border:#e2e8f0;--navy:#1e3a5f;--navy-2:#2b4c7e;
  --accent:#2563eb;--text:#0f172a;--muted:#475569;--ok:#16a34a;--ok-bg:#f0fdf4;
  --warn:#d97706;--warn-bg:#fffbeb;--bad:#dc2626;--bad-bg:#fef2f2;
}
body{margin:0;font-family:'IBM Plex Sans Arabic',Tahoma,Arial,sans-serif;font-size:14px;color:var(--text);background:var(--bg);line-height:1.55}
[hidden]{display:none!important}
.num{font-family:'IBM Plex Mono',monospace;font-variant-numeric:tabular-nums;direction:ltr;display:inline-block}
.boot-screen{min-height:100vh;display:grid;place-items:center;padding:24px}
.boot-card{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:24px 28px;max-width:460px;width:100%;text-align:center}
#app{display:flex;min-height:100vh}
aside{width:252px;background:var(--navy);color:#fff;padding:18px 12px;position:sticky;top:0;height:100vh;overflow:auto;display:flex;flex-direction:column;gap:12px;flex-shrink:0}
.brand{padding:4px 8px 12px;border-bottom:1px solid rgba(255,255,255,.12)}
.brand h2{margin:0;font-size:18px;font-weight:700}
.user-email{display:block;font-size:12px;color:#cbd5e1;margin-top:4px;word-break:break-all}
nav{display:flex;flex-direction:column;gap:4px;flex:1}
.nav-sep{font-size:11px;color:#94a3b8;padding:10px 10px 4px;font-weight:600}
nav button{display:block;width:100%;text-align:right;background:none;border:0;color:#e2e8f0;padding:8px 12px;border-radius:6px;cursor:pointer;font:inherit;white-space:nowrap;transition:background .15s}
nav button:hover{background:rgba(255,255,255,.08);color:#fff}
nav button.on{background:var(--accent);color:#fff;font-weight:600}
main{flex:1;padding:22px 26px;min-width:0;max-width:1440px}
.topbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;gap:12px;flex-wrap:wrap;padding-bottom:14px;border-bottom:1px solid var(--border)}
h1{font-size:21px;margin:0;color:var(--text);font-weight:700}
.subtitle{margin:2px 0 0;color:var(--muted);font-size:13px}
.tools{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
button,input,select{font:inherit}
button{padding:8px 14px;border:1px solid transparent;border-radius:7px;background:var(--accent);color:#fff;cursor:pointer;font-weight:600;white-space:nowrap;transition:opacity .15s,background .15s}
button:hover{opacity:.92}
button.ghost{background:rgba(255,255,255,.1);color:#fff;border-color:rgba(255,255,255,.18);width:100%}
button.secondary{background:#fff;color:var(--text);border-color:var(--border)}
button.secondary.active{background:var(--navy);color:#fff;border-color:var(--navy)}
button.del{background:var(--bad-bg);color:var(--bad);border-color:#fecaca;padding:4px 10px;font-size:12px}
button.ed{background:#f1f5f9;color:var(--text);border-color:var(--border);padding:4px 10px;font-size:12px}
input,select{padding:8px 10px;border:1px solid #cbd5e1;border-radius:7px;background:#fff;width:100%;color:var(--text)}
.tools input,.tools select{width:auto;min-width:150px}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;margin-bottom:18px}
.card{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:16px}
.card span{display:block;color:var(--muted);font-size:12px;margin-bottom:6px}
.card b{font-size:26px;color:var(--text);font-family:'IBM Plex Mono',monospace;font-variant-numeric:tabular-nums}
.card.bad{background:var(--bad-bg);border-color:#fecaca}.card.bad b{color:var(--bad)}
.card.warn{background:var(--warn-bg);border-color:#fde68a}.card.warn b{color:var(--warn)}
.grid-2{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px;margin-bottom:18px}
.panel{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:16px;margin-bottom:16px}
.panel h3{margin:0 0 12px;font-size:15px;font-weight:700;color:var(--text)}
.wrap{overflow:auto;background:var(--surface);border:1px solid var(--border);border-radius:10px}
table{border-collapse:collapse;width:100%}
th{background:#f1f5f9;color:var(--text);padding:10px 12px;font-weight:700;white-space:nowrap;text-align:right;border-bottom:1px solid var(--border);font-size:13px}
td{padding:9px 12px;border-bottom:1px solid #f1f5f9;text-align:right;vertical-align:middle}
tr:hover td{background:#f8fafc}
td.b{font-weight:700;color:var(--text)}
.st{font-weight:600;font-size:12px}
.st.ok{color:var(--ok)}.st.warn{color:var(--warn)}.st.bad{color:var(--bad)}
.bar-row{margin:12px 0;cursor:pointer}
.bar-meta{display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px;font-weight:600}
.bar{background:#e2e8f0;border-radius:6px;height:10px;overflow:hidden}
.bar i{display:block;height:100%;background:var(--accent)}
.seg{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}
.team-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px}
.team-card{border:1px solid var(--border);border-radius:8px;padding:12px;background:#fff}
.team-card h4{margin:0 0 4px;font-size:14px}
.team-card p{margin:2px 0;font-size:12px;color:var(--muted)}
#login{display:grid;place-items:center;min-height:100vh;padding:20px}
.login-card{background:#fff;padding:28px;border-radius:12px;width:min(380px,100%);display:grid;gap:14px;border:1px solid var(--border)}
.login-head h1{margin:0;color:var(--navy);font-size:22px}
.login-head p{margin:4px 0 0;color:var(--muted);font-size:13px}
.login-card label{display:grid;gap:6px;font-weight:600;font-size:13px}
.err-msg{color:var(--bad);margin:0;font-size:13px}
dialog{border:1px solid var(--border);border-radius:12px;padding:0;width:min(580px,94vw)}
dialog::backdrop{background:rgba(15,23,42,.45)}
#df{padding:20px;display:grid;gap:12px}
#df h3{margin:0 0 4px;font-size:17px}
#df label{display:grid;gap:5px;font-weight:600;font-size:13px}
#df .row{display:flex;gap:8px;justify-content:flex-start;margin-top:8px}
@media(max-width:768px){#app{flex-direction:column}aside{width:100%;height:auto;position:static}nav{flex-direction:row;flex-wrap:wrap}nav button{width:auto}main{padding:16px}}
`;

  const configJs = `// بيانات الاتصال بمشروع Supabase (المفتاح العام محمي بسياسات RLS)
const CONFIG = {
  SUPABASE_URL: '${url.replace(/'/g, "\\'")}',
  SUPABASE_ANON_KEY: '${anonKey.replace(/'/g, "\\'")}'
};
`;

  const tablesJs = `// تعريف الجداول والحقول وخيارات الفلترة
const PWD=['برايفت (الماستر)','بابليك','جوجل لوجن'],CYC=['شهري','ربع سنوي','نصف سنوي','سنوي'],
 ST=['تم الاستلام','قيد التنفيذ','لم يبدأ','يحتاج تعديل'],PRI=['عالية','متوسطة','منخفضة'],
 SITES=['WIKALA','DARO','4B','عدة تطبيقات','أخرى'],BILL=['اشتراك ثابت','حسب الاستخدام','رصيد مسبق','مجاني'],
 STAGES=['التخطيط والمتطلبات','التصميم','التطوير','الاختبار والجودة','الإطلاق والتشغيل'],
 LEVELS=['الإدارة العليا','إدارة المنتج والمشروع','التصميم','الهندسة والتطوير','الجودة','الأعمال والدعم'];
const x=(k,l,t='text',o={})=>({k,l,t,...o});
const TABLES=[
{id:'telecom_lines',g:'subscriptions',n:'الاتصالات',f:[x('name','الاسم / الوصف','text',{r:1,b:1}),x('kind','النوع','list',{o:['أرضي','محمول'],flt:1}),x('number','الرقم','text',{b:1}),x('service','الخدمة'),x('provider','المزود'),x('plan','الباقة'),x('cycle','دورة السداد','list',{o:CYC,flt:1}),x('amount','المبلغ (ج.م)','num',{b:1}),x('due_date','الاستحقاق القادم','date',{due:1,b:1}),x('notes','ملاحظات','text',{h:1})]},
{id:'domains',g:'subscriptions',n:'الدومينات والاستضافة',f:[x('name','الدومين / الخدمة','text',{r:1,b:1}),x('kind','النوع','list',{o:['دومين','استضافة','SSL','بريد','أخرى'],flt:1}),x('provider','المزود'),x('start_date','تاريخ الاشتراك','date',{h:1}),x('cycle','دورة السداد','list',{o:CYC}),x('amount','المبلغ (ج.م)','num',{b:1}),x('due_date','التجديد القادم','date',{due:1,b:1}),x('auto_renew','تجديد تلقائي','bool'),x('notes','ملاحظات','text',{h:1})]},
{id:'wanted_domains',g:'subscriptions',n:'دومينات مطلوبة',f:[x('name','الاسم المقترح','text',{r:1,b:1}),x('ext','الامتداد','list',{o:['.com','.com.eg','.eg','.net','.org','.app','.io','.store']}),x('provider','المزود'),x('price','السعر السنوي','num',{b:1}),x('priority','الأولوية','list',{o:PRI,flt:1}),x('status','الحالة','list',{o:['فكرة','متاح','محجوز','تم الشراء'],b:1,flt:1}),x('project','المشروع','list',{o:SITES,flt:1}),x('notes','ملاحظات','text',{h:1})]},
{id:'providers',g:'subscriptions',n:'مزودو الخدمات',f:[x('name','المزود','text',{r:1,b:1}),x('category','التصنيف','list',{o:['سحابة / متاجر','متاجر تطبيقات','وسائط','فيديو / صوت','رسائل / إشعارات','دفع','خرائط','مصادقة / تحقق','قواعد بيانات','تحليلات','أخرى'],flt:1}),x('site','الموقع / التطبيق','list',{o:SITES,flt:1}),x('login_url','رابط الدخول','text',{h:1}),x('username','اسم المستخدم / الإيميل','text',{h:1}),x('pwd_type','نوع كلمة السر','list',{o:PWD,b:1,flt:1}),x('start_date','تاريخ الاشتراك','date',{h:1}),x('funding','نوع التمويل','list',{o:[...BILL,'ثابت + استخدام']}),x('amount','المبلغ (ج.م)','num',{b:1}),x('cycle','الدورة','list',{o:[...CYC,'حسب الاستخدام']}),x('due_date','الاستحقاق القادم','date',{due:1,b:1}),x('owner','مسؤول الحساب'),x('notes','ملاحظات','text',{h:1})]},
{id:'api_keys',g:'subscriptions',n:'مفاتيح API',f:[x('provider','المزود','text',{r:1,b:1}),x('service','الخدمة / API'),x('site','الموقع / التطبيق','list',{o:SITES,flt:1}),x('env','البيئة','list',{o:['Production','Test','Development'],flt:1}),x('key_label','اسم المفتاح (مش السر)','text',{b:1}),x('secret_location','مكان حفظ السر'),x('created_on','تاريخ الإنشاء','date',{h:1}),x('expires_on','تاريخ الانتهاء','date',{due:1,b:1}),x('billing','الفوترة','list',{o:BILL}),x('alert_limit','حد التنبيه (ج.م)','num',{h:1}),x('notes','ملاحظات','text',{h:1})]},
{id:'sites',g:'subscriptions',n:'المواقع والتطبيقات',f:[x('name','الموقع / التطبيق','text',{r:1,b:1}),x('url','الرابط'),x('purpose','الغرض'),x('providers','المزودون'),x('pwd_type','نوع كلمة السر','list',{o:PWD,b:1,flt:1}),x('it_owner','مسؤول الـ IT'),x('handover_date','تاريخ التسليم','date'),x('notes','ملاحظات','text',{h:1})]},
{id:'payments',g:'finance',n:'سجل السداد',f:[x('paid_on','تاريخ السداد','date',{r:1,b:1}),x('item','البند','text',{r:1,b:1}),x('amount','المبلغ (ج.م)','num',{r:1,b:1}),x('method','طريقة الدفع','list',{o:['نقدي','تحويل بنكي','بطاقة','فوري','محفظة إلكترونية','أخرى'],flt:1}),x('ref','المرجع'),x('notes','ملاحظات','text',{h:1})]},
{id:'apps',g:'apps',n:'التطبيقات',f:[x('name','التطبيق','text',{r:1,b:1}),x('description','الوصف'),x('platforms','المنصات'),x('start_date','بداية المشروع','date'),x('launch_date','الإطلاق المستهدف','date'),x('status','الحالة','list',{o:['لم يبدأ','قيد التنفيذ','في الفترة التجريبية','تم الإطلاق','متوقف'],b:1,flt:1})]},
{id:'deliverables',g:'apps',n:'مسار الاستلام',f:[x('app_id','التطبيق','ref',{ref:'apps',r:1,b:1,flt:1}),x('stage','المرحلة','list',{o:STAGES,flt:1}),x('item','بند التسليم','text',{r:1,b:1}),x('owner','المسؤول'),x('start_date','البداية','date'),x('end_date','النهاية','date',{due:1}),x('received_on','الاستلام الفعلي','date',{h:1}),x('status','الحالة','list',{o:ST,b:1,flt:1}),x('acceptance','القبول','list',{o:['اجتاز','لم يجتز','لم يُختبر']}),x('notes','ملاحظات','text',{h:1})]},
{id:'team',g:'apps',n:'الهيكل الوظيفي',f:[x('app_id','التطبيق','ref',{ref:'apps',r:1,b:1,flt:1}),x('level','المستوى','list',{o:LEVELS,flt:1}),x('title','المسمى الوظيفي','text',{r:1,b:1}),x('person','الاسم','text',{b:1}),x('party','الجهة','list',{o:['شركتنا','مقاول خارجي','استشاري'],flt:1}),x('job_status','حالة الوظيفة','list',{o:['معيّن','شاغر','قيد التعيين'],b:1,flt:1}),x('reports_to','يتبع'),x('contact','التواصل','text',{h:1}),x('duties','المسؤوليات','text',{h:1})]}
];
`;

  const appJs = `const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const daysLeft=d=>d?Math.round((new Date(d+'T00:00:00')-new Date().setHours(0,0,0,0))/864e5):null;
const stat=n=>n==null?null:n<0?['متأخر','bad']:n<=7?['قريب','warn']:['سليم','ok'];
const money=n=>Number(n||0).toLocaleString('ar-EG',{maximumFractionDigits:2});

let sb=null,cur=null,rows=[],dueStatusFilter='all',selectedAppId=null;
const refs={};

function showBootError(msg){
  const bs=$('#boot-screen');
  if(bs){bs.hidden=false;$('#boot-msg').innerHTML='<strong style="color:#dc2626">تعذر تشغيل التطبيق</strong><br><br>'+esc(msg);}
  $('#login').hidden=true;
  $('#app').hidden=true;
}

async function refMap(t,force=false){
  if(!refs[t]||force){
    const{data}=await sb.from(t).select('id,name').order('name');
    refs[t]=data||[];
  }
  return refs[t];
}

async function boot(){
  try{
    if(typeof window.supabase==='undefined') throw new Error('تعذر تحميل مكتبة Supabase من الإنترنت.');
    if(typeof CONFIG==='undefined'||!CONFIG.SUPABASE_URL||!CONFIG.SUPABASE_ANON_KEY){
      throw new Error('بيانات CONFIG في ملف config.js غير مكتملة.');
    }
    sb=window.supabase.createClient(CONFIG.SUPABASE_URL,CONFIG.SUPABASE_ANON_KEY);
    const{data,error}=await sb.auth.getSession();
    if(error) throw error;
    $('#boot-screen').hidden=true;
    if(data.session){
      $('#user-email').textContent=data.session.user?.email||'';
      start();
    }else{
      $('#login').hidden=false;
    }
  }catch(err){
    showBootError(err?.message||'حدث خطأ غير متوقع أثناء التشغيل.');
  }
}

$('#lf').onsubmit=async e=>{
  e.preventDefault();
  $('#le').textContent='';
  $('#login-btn').disabled=true;
  try{
    const{data,error}=await sb.auth.signInWithPassword({email:$('#em').value.trim(),password:$('#pw').value});
    if(error){$('#le').textContent='بيانات الدخول غير صحيحة أو الحساب غير مفعل.';return;}
    $('#login').hidden=true;
    $('#user-email').textContent=data.user?.email||'';
    start();
  }catch(err){
    $('#le').textContent=err?.message||'تعذر تسجيل الدخول.';
  }finally{
    $('#login-btn').disabled=false;
  }
};

$('#out').onclick=async()=>{await sb.auth.signOut();location.reload()};

function start(){
  $('#login').hidden=true;
  $('#app').hidden=false;
  const nav=$('#nav');
  const groups=[
    {id:'subscriptions',label:'الاشتراكات والوصول'},
    {id:'apps',label:'التطبيقات والفرق'},
    {id:'finance',label:'المالية'}
  ];
  nav.innerHTML=
    '<button data-id="dash">الملخص والرسوم البيانية</button>'+
    '<button data-id="app-view">متابعة التطبيقات والهيكل</button>'+
    groups.map(g=>'<div class="nav-sep">'+g.label+'</div>'+TABLES.filter(t=>t.g===g.id).map(t=>\`<button data-id="\${t.id}">\${esc(t.n)}</button>\`).join('')).join('');
  nav.onclick=e=>{
    const id=e.target.closest('button')?.dataset.id;
    if(id) go(id);
  };
  go('dash');
}

function go(id){
  document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.id===id));
  $('#tools').innerHTML='';
  if(id==='dash') return dash();
  if(id==='app-view') return appWorkspace();
  return grid(TABLES.find(t=>t.id===id));
}

async function dash(){
  $('#title').textContent='ملخص المتابعة والرسوم البيانية';
  $('#subtitle').textContent='متابعة الاستحقاقات المالية ونسب إنجاز التطبيقات';
  $('#view').innerHTML='<div class="panel">جاري تحميل البيانات...</div>';
  const[{data:due,error:e1},{data:apps},{data:dl}]=await Promise.all([
    sb.from('v_due').select('*').order('due_date'),
    sb.from('apps').select('id,name,status'),
    sb.from('deliverables').select('app_id,status,stage')
  ]);
  if(e1){$('#view').innerHTML='<div class="panel err-msg">'+esc(e1.message)+'</div>';return;}
  const d=due||[],late=d.filter(r=>r.days_left<0),w7=d.filter(r=>r.days_left>=0&&r.days_left<=7),m30=d.filter(r=>r.days_left>=0&&r.days_left<=30);
  const sum=a=>a.reduce((s,r)=>s+Number(r.amount||0),0);
  const card=(l,v,k='')=>\`<div class="card \${k}"><span>\${l}</span><b>\${v}</b></div>\`;

  const catTotals={};
  d.forEach(r=>{catTotals[r.cat]=(catTotals[r.cat]||0)+Number(r.amount||0);});
  const maxCat=Math.max(1,...Object.values(catTotals));
  const catBars=Object.entries(catTotals).map(([cat,val])=>{
    const pct=Math.round((val/maxCat)*100);
    return \`<div class="bar-row"><div class="bar-meta"><span>\${esc(cat)}</span><span class="num">\${money(val)} ج.م</span></div><div class="bar"><i style="width:\${pct}%;background:#1e3a5f"></i></div></div>\`;
  }).join('')||'<p class="subtitle">لا توجد التزامات مسجلة</p>';

  const appBars=(apps||[]).map(a=>{
    const items=(dl||[]).filter(r=>r.app_id===a.id);
    const done=items.filter(r=>r.status==='تم الاستلام').length;
    const p=items.length?Math.round((100*done)/items.length):0;
    return \`<div class="bar-row" data-app="\${a.id}"><div class="bar-meta"><span>\${esc(a.name)} (\${done}/\${items.length})</span><span class="num">\${p}%</span></div><div class="bar"><i style="width:\${p}%"></i></div></div>\`;
  }).join('')||'<p class="subtitle">لا توجد تطبيقات مسجلة</p>';

  const filteredDue=d.filter(r=>{
    const s=stat(r.days_left);
    if(dueStatusFilter==='all') return true;
    return s&&s[1]===dueStatusFilter;
  });

  $('#view').innerHTML=\`
    <div class="cards">
      \${card('بنود متأخرة',late.length,late.length?'bad':'')}
      \${card('المبلغ المتأخر (ج.م)',money(sum(late)),late.length?'bad':'')}
      \${card('مستحق خلال 7 أيام',w7.length,w7.length?'warn':'')}
      \${card('مستحق خلال 30 يوماً (ج.م)',money(sum(m30)),'warn')}
    </div>
    <div class="grid-2">
      <div class="panel"><h3>جاهزية التطبيقات (اضغط للتفاصيل)</h3>\${appBars}</div>
      <div class="panel"><h3>توزيع الالتزامات المالية حسب الفئة</h3>\${catBars}</div>
    </div>
    <div class="panel">
      <h3>جدول الاستحقاقات القادمة والمتأخرة</h3>
      <div class="seg" id="due-seg">
        <button type="button" class="secondary \${dueStatusFilter==='all'?'active':''}" data-f="all">الكل (\${d.length})</button>
        <button type="button" class="secondary \${dueStatusFilter==='bad'?'active':''}" data-f="bad">متأخر (\${late.length})</button>
        <button type="button" class="secondary \${dueStatusFilter==='warn'?'active':''}" data-f="warn">قريب (\${w7.length})</button>
        <button type="button" class="secondary \${dueStatusFilter==='ok'?'active':''}" data-f="ok">سليم</button>
      </div>
      <div class="wrap">
        <table>
          <tr><th>الفئة</th><th>البند</th><th>المبلغ (ج.م)</th><th>تاريخ الاستحقاق</th><th>المتبقي (يوم)</th><th>الحالة</th></tr>
          \${filteredDue.map(r=>{
            const s=stat(r.days_left);
            return \`<tr><td>\${esc(r.cat)}</td><td class="b">\${esc(r.item)}</td><td class="b num">\${money(r.amount)}</td><td class="num">\${esc(r.due_date)}</td><td class="num">\${r.days_left}</td><td><span class="st \${s[1]}">\${s[0]}</span></td></tr>\`;
          }).join('')||'<tr><td colspan="6">لا توجد بنود مطابقة للفلتر</td></tr>'}
        </table>
      </div>
    </div>\`;

  $('#due-seg').onclick=e=>{
    const f=e.target.dataset.f;
    if(f){dueStatusFilter=f;dash();}
  };
  document.querySelectorAll('[data-app]').forEach(el=>{
    el.onclick=()=>{selectedAppId=el.dataset.app;go('app-view');};
  });
}

async function appWorkspace(){
  $('#title').textContent='متابعة التطبيقات والهيكل الوظيفي';
  $('#subtitle').textContent='مسار الاستلام والمراحل والهيكل الوظيفي لكل تطبيق';
  const[{data:apps},{data:dl},{data:team}]=await Promise.all([
    sb.from('apps').select('*').order('created_at'),
    sb.from('deliverables').select('*').order('created_at'),
    sb.from('team').select('*').order('created_at')
  ]);
  const appList=apps||[];
  if(!appList.length){$('#view').innerHTML='<div class="panel">لا توجد تطبيقات مسجلة.</div>';return;}
  if(!selectedAppId||!appList.some(a=>a.id===selectedAppId)) selectedAppId=appList[0].id;
  const app=appList.find(a=>a.id===selectedAppId);
  const appDl=(dl||[]).filter(d=>d.app_id===app.id);
  const appTeam=(team||[]).filter(m=>m.app_id===app.id);

  const stageHtml=STAGES.map(st=>{
    const items=appDl.filter(d=>d.stage===st);
    const done=items.filter(d=>d.status==='تم الاستلام').length;
    const pct=items.length?Math.round((100*done)/items.length):0;
    return \`<div class="bar-row"><div class="bar-meta"><span>\${esc(st)} (\${done}/\${items.length})</span><span class="num">\${pct}%</span></div><div class="bar"><i style="width:\${pct}%"></i></div></div>\`;
  }).join('');

  $('#view').innerHTML=\`
    <div class="seg" id="app-tabs">
      \${appList.map(a=>\`<button type="button" class="secondary \${a.id===app.id?'active':''}" data-id="\${a.id}">\${esc(a.name)}</button>\`).join('')}
    </div>
    <div class="panel">
      <h3>\${esc(app.name)} — \${esc(app.status||'لم يبدأ')}</h3>
      <p class="subtitle">\${esc(app.description||'بدون وصف')} · المنصات: \${esc(app.platforms||'غير محددة')}</p>
      <div style="margin-top:14px">\${stageHtml}</div>
    </div>
    <div class="panel">
      <h3>مسار الاستلام (\${appDl.length})</h3>
      <div class="wrap">
        <table>
          <tr><th>المرحلة</th><th>بند التسليم</th><th>المسؤول</th><th>الحالة</th><th>القبول</th></tr>
          \${appDl.map(d=>\`<tr><td>\${esc(d.stage)}</td><td class="b">\${esc(d.item)}</td><td>\${esc(d.owner)}</td><td class="b">\${esc(d.status)}</td><td>\${esc(d.acceptance)}</td></tr>\`).join('')||'<tr><td colspan="5">لا توجد بنود استلام لهذا التطبيق</td></tr>'}
        </table>
      </div>
    </div>
    <div class="panel">
      <h3>الهيكل الوظيفي (\${appTeam.length})</h3>
      <div class="team-grid">
        \${appTeam.map(m=>\`<div class="team-card"><h4>\${esc(m.title)}</h4><p><b>\${esc(m.person||'شاغر')}</b> · \${esc(m.level||'')}</p><p>\${esc(m.party||'')} · \${esc(m.job_status||'')}</p>\${m.reports_to?\`<p>يتبع: \${esc(m.reports_to)}</p>\`:''}</div>\`).join('')||'<p class="subtitle">لم يُضف أعضاء لهذا التطبيق بعد</p>'}
      </div>
    </div>\`;

  $('#app-tabs').onclick=e=>{
    const id=e.target.dataset.id;
    if(id){selectedAppId=id;appWorkspace();}
  };
}

async function grid(t){
  cur=t;
  $('#title').textContent=t.n;
  $('#subtitle').textContent='إدارة وتصفية السجلات وتصديرها';
  for(const f of t.f) if(f.t==='ref') await refMap(f.ref,true);
  const{data,error}=await sb.from(t.id).select('*').order('created_at');
  if(error){$('#view').innerHTML='<div class="panel err-msg">'+esc(error.message)+'</div>';return;}
  rows=data||[];
  const fltFields=t.f.filter(f=>f.flt).slice(0,2);
  const fltHtml=fltFields.map(f=>{
    const opts=f.t==='ref'?(refs[f.ref]||[]).map(o=>\`<option value="\${o.id}">\${esc(o.name)}</option>\`).join(''):(f.o||[]).map(o=>\`<option value="\${esc(o)}">\${esc(o)}</option>\`).join('');
    return \`<select class="flt" data-k="\${f.k}"><option value="">كل \${esc(f.l)}</option>\${opts}</select>\`;
  }).join('');
  $('#tools').innerHTML=\`<input id="q" placeholder="بحث في \${esc(t.n)}...">\${fltHtml}<button type="button" id="exp" class="secondary">تصدير CSV</button><button type="button" id="add">+ إضافة</button>\`;
  $('#q').oninput=draw;
  document.querySelectorAll('.flt').forEach(s=>s.onchange=draw);
  $('#add').onclick=()=>form();
  $('#exp').onclick=()=>exportCsv(t);
  draw();
}

function getFilteredRows(){
  const q=($('#q')?.value||'').trim().toLowerCase();
  const flts=[...document.querySelectorAll('.flt')].map(s=>({k:s.dataset.k,v:s.value})).filter(f=>f.v);
  return rows.filter(r=>{
    if(flts.some(f=>String(r[f.k]??'')!==f.v)) return false;
    if(!q) return true;
    return JSON.stringify(Object.values(r)).toLowerCase().includes(q);
  });
}

function exportCsv(t){
  const list=getFilteredRows();
  const fs=t.f;
  const escCsv=v=>{const s=String(v??'');return /[",\\n\\r]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;};
  const lines=[fs.map(f=>escCsv(f.l)).join(','),...list.map(r=>fs.map(f=>{
    let v=r[f.k];
    if(f.t==='ref') v=(refs[f.ref]?.find(a=>a.id===v)||{}).name||'';
    if(f.t==='bool') v=v?'نعم':'لا';
    return escCsv(v);
  }).join(','))];
  const blob=new Blob(['\\uFEFF'+lines.join('\\r\\n')],{type:'text/csv;charset=utf-8;'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=t.id+'.csv';
  a.click();
}

function cell(f,r){
  const v=r[f.k];
  if(f.due){
    const s=stat(daysLeft(v));
    return \`<td class="\${f.b?'b':''}"><span class="num">\${esc(v)||''}</span> \${s&&f.k!=='end_date'?\`<span class="st \${s[1]}">\${s[0]}</span>\`:''}</td>\`;
  }
  if(f.t==='bool') return \`<td>\${v?'نعم':'لا'}</td>\`;
  if(f.t==='ref') return \`<td class="b">\${esc((refs[f.ref].find(a=>a.id===v)||{}).name)}</td>\`;
  if(f.t==='num') return \`<td class="\${f.b?'b':''} num">\${v==null?'':money(v)}</td>\`;
  return \`<td class="\${f.b?'b':''}">\${esc(v)}</td>\`;
}

function draw(){
  const t=cur,fs=t.f.filter(f=>!f.h),list=getFilteredRows();
  $('#view').innerHTML=\`<div class="wrap"><table><tr>\${fs.map(f=>\`<th>\${esc(f.l)}</th>\`).join('')}<th>إجراءات</th></tr>\${list.map(r=>\`<tr>\${fs.map(f=>cell(f,r)).join('')}<td><button class="ed" data-e="\${r.id}">تعديل</button> <button class="del" data-d="\${r.id}">حذف</button></td></tr>\`).join('')||\`<tr><td colspan="\${fs.length+1}">لا توجد بيانات مطابقة</td></tr>\`}</table></div>\`;
  $('#view').onclick=async e=>{
    const b=e.target;
    if(b.dataset.e) form(rows.find(r=>r.id===b.dataset.e));
    if(b.dataset.d&&confirm('تأكيد الحذف؟')){
      const{error}=await sb.from(t.id).delete().eq('id',b.dataset.d);
      error?alert(error.message):grid(t);
    }
  };
}

function inputHtml(f,v){
  const n=\`name="\${f.k}"\${f.r?' required':''}\`;
  if(f.t==='list') return \`<select \${n}><option value="">—</option>\${f.o.map(o=>\`<option\${o===v?' selected':''}>\${esc(o)}</option>\`).join('')}</select>\`;
  if(f.t==='ref') return \`<select \${n}><option value="">—</option>\${refs[f.ref].map(o=>\`<option value="\${o.id}"\${o.id===v?' selected':''}>\${esc(o.name)}</option>\`).join('')}</select>\`;
  if(f.t==='bool') return \`<input type="checkbox" style="width:auto" name="\${f.k}"\${v?' checked':''}>\`;
  if(f.t==='num') return \`<input type="number" step="0.01" min="0" \${n} value="\${esc(v)}">\`;
  if(f.t==='date') return \`<input type="date" min="2020-01-01" \${n} value="\${esc(v)}">\`;
  return \`<input \${n} value="\${esc(v)}">\`;
}

function form(r){
  const t=cur;
  $('#df').innerHTML=\`<h3>\${r?'تعديل':'إضافة'} — \${esc(t.n)}</h3>\${t.f.map(f=>\`<label>\${esc(f.l)}\${f.r?' *':''}\${inputHtml(f,r?.[f.k])}</label>\`).join('')}<div class="row"><button type="submit">حفظ</button><button type="button" id="cancel-dlg" class="secondary">إلغاء</button></div>\`;
  $('#cancel-dlg').onclick=()=>$('#dlg').close();
  $('#df').onsubmit=async e=>{
    e.preventDefault();
    const o={};
    t.f.forEach(f=>{
      const el=$('#df').elements[f.k];
      o[f.k]=f.t==='bool'?el.checked:el.value===''?null:f.t==='num'?Number(el.value):el.value;
    });
    const q=r?sb.from(t.id).update(o).eq('id',r.id):sb.from(t.id).insert(o);
    const{error}=await q;
    if(error){alert('تعذر الحفظ: '+error.message);return;}
    if(t.id==='apps') await refMap('apps',true);
    $('#dlg').close();
    grid(t);
  };
  $('#dlg').showModal();
}

boot();
`;

  return {
    'index.html': indexHtml,
    'style.css': styleCss,
    'config.js': configJs,
    'tables.js': tablesJs,
    'app.js': appJs,
  };
}

export async function downloadGitHubZip(customUrl?: string, customKey?: string) {
  const files = generateGitHubRootFiles(customUrl, customKey);
  const zip = new JSZip();
  Object.entries(files).forEach(([filename, content]) => {
    zip.file(filename, content);
  });
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'NOUB-CRM-github-root.zip';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadSingleStaticFile(
  filename: keyof StaticBundleFiles,
  customUrl?: string,
  customKey?: string
) {
  const files = generateGitHubRootFiles(customUrl, customKey);
  const blob = new Blob([files[filename]], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
