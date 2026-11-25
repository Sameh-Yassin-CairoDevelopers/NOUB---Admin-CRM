import JSZip from 'jszip';
import { getSupabaseConfig } from './supabase';
import { JOINT_TASKS_DATA } from '../data/jointTasks';
import {
  HANDOVER_CHECKLIST,
  HANDOVER_PHASES,
  PBX_EXTENSIONS,
  PORTAL_ACCOUNTS,
  RACK_ASSETS,
  WE_CLOUD_SERVERS,
  ZOHO_EMAILS,
} from '../data/handoverData';
import { MASTER_REGISTRY } from '../data/masterRegistry';

export interface StaticBundleFiles {
  'index.html': string;
  'style.css': string;
  'config.js': string;
  'tables.js': string;
  'app.js': string;
}

function toSafeJsJson(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

export function generateGitHubRootFiles(customUrl?: string, customKey?: string): StaticBundleFiles {
  const current = getSupabaseConfig();
  const url = (customUrl ?? current.url).trim();
  const anonKey = (customKey ?? current.anonKey).trim();

  const handoverJson = toSafeJsJson({
    phases: HANDOVER_PHASES,
    portals: PORTAL_ACCOUNTS,
    emails: ZOHO_EMAILS,
    pbx: PBX_EXTENSIONS,
    rack: RACK_ASSETS,
    weCloud: WE_CLOUD_SERVERS,
    checklist: HANDOVER_CHECKLIST,
  });
  const jointTasksJson = toSafeJsJson(JOINT_TASKS_DATA);
  const masterRegistryJson = toSafeJsJson(MASTER_REGISTRY);

  const indexHtml = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>NOUB CRM — متابعة الاشتراكات والتطبيقات ومقر المعادي</title>
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
    <div class="login-card">
      <div class="login-head">
        <h1>NOUB CRM</h1>
        <p>متابعة الاشتراكات والتطبيقات وحزمة تسليم مقر المعادي</p>
      </div>
      <div class="auth-tabs" id="auth-tabs">
        <button type="button" class="active" data-mode="login">تسجيل الدخول</button>
        <button type="button" data-mode="signup">إنشاء حساب جديد</button>
      </div>
      <form id="lf" class="login-form">
        <label>البريد الإلكتروني
          <input id="em" type="email" placeholder="name@company.com" required autocomplete="email" dir="ltr">
        </label>
        <label>كلمة المرور (أو 12345678 للمعاينة)
          <input id="pw" type="password" placeholder="••••••••" required minlength="6" autocomplete="current-password" dir="ltr">
        </label>
        <button id="login-btn" type="submit">دخول</button>
      </form>
      <button id="quick-btn" type="button" class="quick-btn">دخول سريع للمعاينة (كلمة المرور 12345678)</button>
      <p id="le" class="err-msg"></p>
      <p id="li" class="ok-msg"></p>
    </div>
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
      <div id="local-banner" class="local-banner" hidden>
        <span>وضع المعاينة الفورية (محلي على المتصفح) — للحفظ السحابي على Supabase أنشئ حساباً وفعّله من الإيميل.</span>
      </div>
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
.local-banner{background:var(--warn-bg);border:1px solid #fde68a;color:#92400e;padding:10px 14px;border-radius:8px;font-size:12px;margin-bottom:14px;font-weight:600}
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
.card.ok{background:var(--ok-bg);border-color:#bbf7d0}.card.ok b{color:var(--ok)}
.grid-2{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px;margin-bottom:18px}
.grid-3{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;margin-bottom:16px}
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
.jt-stack{display:flex;height:14px;width:100%;background:#e2e8f0;border-radius:6px;overflow:hidden;margin:10px 0 14px}
.jt-stack i{display:block;height:100%}
.sec-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin-top:10px}
.sec-btn{text-align:right;background:#fff;color:var(--text);border:1px solid var(--border);border-radius:8px;padding:10px 12px;font-weight:600;font-size:12px}
.sec-btn.active{border-color:var(--accent);background:#eff6ff}
.sec-btn .bar{height:6px;margin-top:6px}
.chk-list{display:grid;gap:10px}
.chk-row{display:flex;gap:10px;align-items:flex-start;padding:12px;border:1px solid var(--border);border-radius:8px;background:#f8fafc;cursor:pointer}
.chk-row.done{background:var(--ok-bg);border-color:#bbf7d0}
.chk-row input{width:16px;height:16px;margin-top:3px;flex-shrink:0}
.chk-row b{display:block;font-size:13px;margin-bottom:2px}
.chk-row.done b{text-decoration:line-through;color:#14532d}
.chk-row span{font-size:12px;color:var(--muted)}
.seg{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}
.team-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px}
.team-card{border:1px solid var(--border);border-radius:8px;padding:12px;background:#fff}
.team-card h4{margin:0 0 4px;font-size:14px}
.team-card p{margin:2px 0;font-size:12px;color:var(--muted)}
.status-sel{width:auto;min-width:118px;padding:4px 8px;font-size:12px;font-weight:700}
.status-sel.ok{color:var(--ok)}.status-sel.warn{color:var(--warn)}.status-sel.bad{color:var(--bad)}
.foot-meta{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#f8fafc;border-top:1px solid var(--border);font-size:12px;color:var(--muted);flex-wrap:wrap;gap:8px}
.add-box{display:grid;grid-template-columns:2fr 1.2fr 1fr 1fr auto;gap:8px;padding-top:12px;margin-top:12px;border-top:1px solid var(--border)}
@media(max-width:900px){.add-box{grid-template-columns:1fr}}
#login{display:grid;place-items:center;min-height:100vh;padding:20px}
.login-card{background:#fff;padding:28px;border-radius:12px;width:min(410px,100%);display:grid;gap:14px;border:1px solid var(--border)}
.login-head h1{margin:0;color:var(--navy);font-size:22px}
.login-head p{margin:4px 0 0;color:var(--muted);font-size:13px}
.auth-tabs{display:grid;grid-template-columns:1fr 1fr;gap:4px;background:#f1f5f9;padding:4px;border-radius:8px}
.auth-tabs button{background:transparent;color:var(--muted);padding:7px;font-size:12px;border-radius:6px}
.auth-tabs button.active{background:#fff;color:var(--text);box-shadow:0 1px 2px rgba(0,0,0,.06)}
.login-form{display:grid;gap:12px}
.login-form label{display:grid;gap:5px;font-weight:600;font-size:13px}
.quick-btn{background:#eff6ff;color:#1e3a8a;border:1px solid #bfdbfe;font-size:12px;padding:9px 12px}
.err-msg{color:var(--bad);margin:0;font-size:12px}
.ok-msg{color:var(--ok);margin:0;font-size:12px}
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

  const tablesJs = `// تعريف الجداول والبيانات المرجعية للنظام
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
const JOINT_TASKS_SEED=${jointTasksJson};
const HANDOVER_DATA=${handoverJson};
const MASTER_REGISTRY=${masterRegistryJson};
`;

  const appJs = `const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const daysLeft=d=>d?Math.round((new Date(d+'T00:00:00')-new Date().setHours(0,0,0,0))/864e5):null;
const stat=n=>n==null?null:n<0?['متأخر','bad']:n<=7?['قريب','warn']:['سليم','ok'];
const money=n=>Number(n||0).toLocaleString('ar-EG',{maximumFractionDigits:2});

const LOCAL_SESS_KEY='noub_crm_local_session_email';
const LOCAL_DB_KEY='noub_crm_local_db_v2';
const JT_KEY='noub_crm_joint_tasks_v1';
const CHK_KEY='noub_crm_handover_checks_v1';
let sb=null,cur=null,rows=[],dueStatusFilter='all',selectedAppId=null,authMode='login',localMode=false;
let jtState={status:'all',sec:'all',owner:'all',q:'',adding:false};
let hoTab='methodology',hoQuery='';
let mrState={q:'',cat:'all',kind:'all',limit:60};
const refs={};

function seedLocalDb(){
  const now=new Date().toISOString();
  const apps=[
    {id:'app-4b',created_at:now,name:'4B (فوربي)',description:'منصة وتطبيق النقل الذكي للركاب والكباتن بنظام المزايدة الحية والخرائط الجغرافية',platforms:'أندرويد · iOS · لوحة إدارة',status:'في الفترة التجريبية'},
    {id:'app-daro',created_at:now,name:'DARO (دارو)',description:'تطبيق الشحن اللوجستي والطرود السريعة بنفس اليوم وتتبع البوالص والباركود',platforms:'أندرويد · iOS · لوحة متاجر',status:'قيد التنفيذ'},
    {id:'app-wikala',created_at:now,name:'WIKALA (وكالة)',description:'منصة إدارة المكاتب الفرعية والوكلاء المحليين بالمحافظات والأسطول الإقليمي',platforms:'أندرويد · iOS · لوحة وكلاء',status:'قيد التنفيذ'}
  ];
  const tpl=[
    ['التخطيط والمتطلبات','وثيقة متطلبات المنتج (PRD)'],['التخطيط والمتطلبات','دراسة السوق المصري والمنافسين'],['التخطيط والمتطلبات','خريطة رحلة المستخدم والميزات'],
    ['التصميم','تصميم تجربة المستخدم UX'],['التصميم','نظام التصميم والهوية البصرية'],['التصميم','تصميم واجهات المستخدم UI'],['التصميم','النموذج التفاعلي Prototype'],['التصميم','اعتماد التصميم النهائي'],
    ['التطوير','قاعدة البيانات والخلفية وواجهات API'],['التطوير','تطبيق الأندرويد'],['التطوير','تطبيق iOS / نسخة الويب'],['التطوير','لوحة تحكم الإدارة'],['التطوير','ربط الدفع الإلكتروني'],['التطوير','الإشعارات والرسائل'],
    ['الاختبار والجودة','الاختبار الوظيفي'],['الاختبار والجودة','اختبار الأداء والأمان'],['الاختبار والجودة','اختبار قبول المستخدم UAT'],['الاختبار والجودة','الفترة التجريبية Beta'],
    ['الإطلاق والتشغيل','سياسة الخصوصية والشروط'],['الإطلاق والتشغيل','النشر على Google Play / App Store'],['الإطلاق والتشغيل','الإطلاق التسويقي'],['الإطلاق والتشغيل','خطة الدعم بعد الإطلاق']
  ];
  const deliverables=[];
  apps.forEach(a=>tpl.forEach(([stage,item],i)=>{
    const done4b=a.id==='app-4b'&&i<8;
    const prog4b=a.id==='app-4b'&&i>=8&&i<15;
    deliverables.push({id:'dl-'+a.id+'-'+i,created_at:now,app_id:a.id,stage,item,owner:done4b?'م/ سامح ياسين':prog4b?'قيمة تك + م/ علي QA':null,status:done4b?'تم الاستلام':prog4b?'قيد التنفيذ':'لم يبدأ',acceptance:done4b?'اجتاز':'لم يُختبر'});
  }));
  return {
    telecom_lines:[
      {id:'tel-1',created_at:now,name:'خط أرضي 1 (المعادي الرئيسي)',kind:'أرضي',number:'02-2517xxxx',service:'مكالمات + إنترنت + سنترال FXO-1',provider:'المصرية للاتصالات WE',cycle:'شهري'},
      {id:'tel-2',created_at:now,name:'خط أرضي 2 (العمليات والكباتن)',kind:'أرضي',number:'02-2517xxxx',service:'مكالمات + سنترال FXO-2',provider:'المصرية للاتصالات WE',cycle:'شهري'},
      {id:'tel-3',created_at:now,name:'راوتر فودافون H153-381 (المؤقت)',kind:'محمول',number:'فاتورة 748994',service:'إنترنت المقر المؤقت 4G/5G',provider:'فودافون مصر',plan:'باقة 520',cycle:'شهري',amount:520},
      {id:'tel-4',created_at:now,name:'شريحة أورنج 4G (خط الطوارئ)',kind:'محمول',service:'إنترنت احتياطي Failover',provider:'أورنج بيزنس',cycle:'شهري'},
      {id:'tel-5',created_at:now,name:'خطوط فودافون OTP وشريحة تويليو',kind:'محمول',service:'رسائل التحقق BroadNet و Twilio',provider:'فودافون مصر',cycle:'شهري'}
    ],
    domains:[
      {id:'dom-1',created_at:now,name:'mashawer.com.eg',kind:'دومين',provider:'المصرية EC (م/ محمد الحلو)',start_date:'2026-08-09',cycle:'سنوي',amount:1254,due_date:'2027-08-09',auto_renew:false},
      {id:'dom-2',created_at:now,name:'استضافة الموقع الرئيسي Host1',kind:'استضافة',provider:'المصرية EC (م/ محمد الحلو)',start_date:'2026-08-11',cycle:'سنوي',amount:2508,due_date:'2027-08-11',auto_renew:false}
    ],
    wanted_domains:[
      {id:'wd-1',created_at:now,name:'mashweer.net',ext:'.net',provider:'EC / مسجل خارجي',priority:'عالية',status:'محجوز',project:'عدة تطبيقات'},
      {id:'wd-2',created_at:now,name:'wikala.com.eg',ext:'.com.eg',provider:'المصرية EC',priority:'عالية',status:'متاح',project:'WIKALA'}
    ],
    providers:[
      {id:'prv-1',created_at:now,name:'المصرية للاتصالات (WE Cloud & WAF)',category:'سحابة / متاجر',site:'4B',login_url:'https://cloud.te.eg/portal',username:'mashweer_telecom_admin',pwd_type:'برايفت (الماستر)',funding:'اشتراك ثابت',amount:201874,cycle:'ربع سنوي',owner:'م/ عماد الشرقاوي + م/ سامح ياسين'},
      {id:'prv-2',created_at:now,name:'Google Cloud & Maps',category:'خرائط',site:'عدة تطبيقات',login_url:'https://console.cloud.google.com',username:'admin@mashweer.com.eg',pwd_type:'جوجل لوجن',funding:'حسب الاستخدام',cycle:'حسب الاستخدام',owner:'م/ سامح ياسين + أ/ هاني'},
      {id:'prv-3',created_at:now,name:'Cloudinary',category:'وسائط',site:'4B',login_url:'https://cloudinary.com',username:'mashweer-cloud',pwd_type:'برايفت (الماستر)',funding:'رصيد مسبق',owner:'م/ سامح ياسين'},
      {id:'prv-4',created_at:now,name:'BroadNet SMS',category:'رسائل / إشعارات',site:'4B',login_url:'https://broadnetme.com/portal/login',username:'mashawer',pwd_type:'برايفت (الماستر)',funding:'رصيد مسبق',owner:'م/ عماد الشرقاوي'},
      {id:'prv-5',created_at:now,name:'Fawry Enterprise',category:'دفع',site:'4B',login_url:'https://fawry.com',username:'FAWRY_MERCHANT_CODE_MASHWEER',pwd_type:'برايفت (الماستر)',funding:'حسب الاستخدام',owner:'أ/ هاني'}
    ],
    api_keys:[
      {id:'api-1',created_at:now,provider:'Google Maps',service:'Maps / Directions',site:'4B',env:'Production',key_label:'4B_SERVER_MAPS_KEY',secret_location:'خزنة الأسرار الإدارية',billing:'حسب الاستخدام'},
      {id:'api-2',created_at:now,provider:'BroadNet',service:'OTP SMS Gateway',site:'4B',env:'Production',key_label:'BROADNET_API_KEY',secret_location:'خزنة الأسرار الإدارية',billing:'رصيد مسبق'}
    ],
    sites:[
      {id:'site-1',created_at:now,name:'لوحة EC للنطاقات والاستضافة',url:'https://clients.ec.com.eg/clientarea.php',purpose:'إدارة DNS وتجديد mashawer.com.eg',providers:'EC Egypt',pwd_type:'برايفت (الماستر)',it_owner:'م/ عماد الشرقاوي'},
      {id:'site-2',created_at:now,name:'بوابة WE Cloud',url:'https://cloud.te.eg/portal',purpose:'إدارة خوادم 4B السحابية وجدار F5 WAF',providers:'WE',pwd_type:'برايفت (الماستر)',it_owner:'م/ عماد الشرقاوي'},
      {id:'site-3',created_at:now,name:'سنترال Grandstream UCM',url:'https://192.168.30.1:8089',purpose:'إدارة التحويلات 100-116 وIVR',providers:'مقر المعادي',pwd_type:'برايفت (الماستر)',it_owner:'م/ عماد الشرقاوي'}
    ],
    payments:[
      {id:'pay-1',created_at:now,paid_on:'2026-09-26',item:'فاتورة QTS #1169 (سيرفر Dell R640 + جهازي HP Z440)',amount:96295.8,method:'تحويل بنكي',ref:'ETA #1169'},
      {id:'pay-2',created_at:now,paid_on:'2026-06-09',item:'فاتورة تكنو ستورز الدقي (3 أجهزة Dell + 3 شاشات HP)',amount:39901.14,method:'تحويل بنكي',ref:'ETA Techno'},
      {id:'pay-3',created_at:now,paid_on:'2026-03-29',item:'فاتورة رد لاين البستان (كابينة راك بيرلا 27U وأدوات الشبكة)',amount:18550,method:'نقدي',ref:'ETA RedLine'},
      {id:'pay-4',created_at:now,paid_on:'2026-09-28',item:'فاتورة QTS #1172 (سويتش سيسكو Catalyst 3850 48P)',amount:11970,method:'تحويل بنكي',ref:'ETA #1172'},
      {id:'pay-5',created_at:now,paid_on:'2026-09-28',item:'إذن المنشاوي البستان (هاردات SAS 1.2TB و 2TB)',amount:8510,method:'نقدي',ref:'إذن مؤقت'},
      {id:'pay-6',created_at:now,paid_on:'2026-09-28',item:'فاتورة فودافون صقر قريش (راوتر H153-381 والباقة)',amount:3326.46,method:'نقدي',ref:'748994'},
      {id:'pay-7',created_at:now,paid_on:'2026-03-26',item:'فاتورة طيبة رنين (سلم 6 درجات وأثاث)',amount:2951,method:'نقدي',ref:'ETA Tiba'},
      {id:'pay-8',created_at:now,paid_on:'2026-08-11',item:'فاتورة EC (تجديد استضافة Host1 حتى أغسطس 2027)',amount:2508,method:'تحويل بنكي',ref:'EC Host1'},
      {id:'pay-9',created_at:now,paid_on:'2026-08-09',item:'فاتورة EC (تجديد نطاق mashawer.com.eg حتى أغسطس 2027)',amount:1254,method:'تحويل بنكي',ref:'EC Domain'}
    ],
    apps,deliverables,
    team:[
      {id:'tm-1',created_at:now,app_id:'app-4b',level:'الإدارة العليا',title:'المدير العام والمالك',person:'أ/ أبو خالد',party:'شركتنا',job_status:'معيّن'},
      {id:'tm-2',created_at:now,app_id:'app-4b',level:'إدارة المنتج والمشروع',title:'مدير التكنولوجيا والمشاريع (CTO)',person:'م/ سامح ياسين',party:'شركتنا',job_status:'معيّن',reports_to:'أ/ أبو خالد'},
      {id:'tm-3',created_at:now,app_id:'app-4b',level:'الهندسة والتطوير',title:'مهندس النظم والشبكات ومدير فرع المعادي',person:'م/ عماد الشرقاوي',party:'شركتنا',job_status:'معيّن',reports_to:'م/ سامح ياسين'}
    ]
  };
}
function getLocalDb(){
  const raw=localStorage.getItem(LOCAL_DB_KEY);
  if(raw){try{return JSON.parse(raw)}catch{}}
  const fresh=seedLocalDb();localStorage.setItem(LOCAL_DB_KEY,JSON.stringify(fresh));return fresh;
}
function saveLocalDb(db){localStorage.setItem(LOCAL_DB_KEY,JSON.stringify(db));}

function getJointTasks(){
  try{
    const raw=localStorage.getItem(JT_KEY);
    if(raw){const p=JSON.parse(raw);if(Array.isArray(p)&&p.length) return p;}
  }catch{}
  return JOINT_TASKS_SEED.map(t=>({...t}));
}
function saveJointTasks(list){localStorage.setItem(JT_KEY,JSON.stringify(list));}
function getCheckedMap(){
  try{return JSON.parse(localStorage.getItem(CHK_KEY)||'{}');}catch{return {};}
}
function saveCheckedMap(m){localStorage.setItem(CHK_KEY,JSON.stringify(m));}

async function dbSelect(tableId){
  if(localMode) return getLocalDb()[tableId]||[];
  const{data,error}=await sb.from(tableId).select('*').order('created_at');
  if(error) throw error;
  return data||[];
}
async function dbDue(){
  if(localMode){
    const db=getLocalDb(),out=[];
    [['الاتصالات','telecom_lines'],['الدومينات والاستضافة','domains'],['مزودو الخدمات','providers']].forEach(([cat,tid])=>{
      (db[tid]||[]).forEach(r=>{if(r.due_date) out.push({cat,item:r.name,amount:r.amount,due_date:r.due_date,days_left:daysLeft(r.due_date)});});
    });
    return out.sort((a,b)=>a.due_date.localeCompare(b.due_date));
  }
  const{data,error}=await sb.from('v_due').select('*').order('due_date');
  if(error) throw error;
  return data||[];
}
async function dbInsert(tableId,obj){
  if(localMode){
    const db=getLocalDb();
    db[tableId]=[...(db[tableId]||[]),{id:tableId+'-'+Date.now(),created_at:new Date().toISOString(),...obj}];
    saveLocalDb(db);return;
  }
  const{error}=await sb.from(tableId).insert(obj);if(error) throw error;
}
async function dbUpdate(tableId,id,obj){
  if(localMode){
    const db=getLocalDb();
    db[tableId]=(db[tableId]||[]).map(r=>r.id===id?{...r,...obj}:r);
    saveLocalDb(db);return;
  }
  const{error}=await sb.from(tableId).update(obj).eq('id',id);if(error) throw error;
}
async function dbDelete(tableId,id){
  if(localMode){
    const db=getLocalDb();
    db[tableId]=(db[tableId]||[]).filter(r=>r.id!==id);
    if(tableId==='apps'){
      db.deliverables=(db.deliverables||[]).filter(d=>d.app_id!==id);
      db.team=(db.team||[]).filter(t=>t.app_id!==id);
    }
    saveLocalDb(db);return;
  }
  const{error}=await sb.from(tableId).delete().eq('id',id);if(error) throw error;
}

function downloadCsvFile(filename,headers,rowArrays){
  const escCsv=v=>{const s=String(v??'');return /[",\\n\\r]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;};
  const lines=[headers.map(escCsv).join(','),...rowArrays.map(r=>r.map(escCsv).join(','))];
  const blob=new Blob(['\\uFEFF'+lines.join('\\r\\n')],{type:'text/csv;charset=utf-8;'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=filename+'.csv';a.click();
}

function showBootError(msg){
  const bs=$('#boot-screen');
  if(bs){bs.hidden=false;$('#boot-msg').innerHTML='<strong style="color:#dc2626">تعذر تشغيل التطبيق</strong><br><br>'+esc(msg);}
  $('#login').hidden=true;$('#app').hidden=true;
}

async function refMap(t,force=false){
  if(!refs[t]||force){
    if(localMode){refs[t]=(getLocalDb()[t]||[]).map(a=>({id:a.id,name:a.name}));}
    else{const{data}=await sb.from(t).select('id,name').order('name');refs[t]=data||[];}
  }
  return refs[t];
}

async function boot(){
  try{
    if(typeof window.supabase!=='undefined'&&typeof CONFIG!=='undefined'&&CONFIG.SUPABASE_URL&&CONFIG.SUPABASE_ANON_KEY){
      sb=window.supabase.createClient(CONFIG.SUPABASE_URL,CONFIG.SUPABASE_ANON_KEY);
      const{data}=await sb.auth.getSession();
      if(data?.session){
        localMode=false;localStorage.removeItem(LOCAL_SESS_KEY);
        $('#boot-screen').hidden=true;$('#user-email').textContent=data.session.user?.email||'';
        return start();
      }
    }
    const localEmail=localStorage.getItem(LOCAL_SESS_KEY);
    $('#boot-screen').hidden=true;
    if(localEmail){
      localMode=true;$('#user-email').textContent=localEmail;
      return start();
    }
    $('#login').hidden=false;
  }catch(err){
    showBootError(err?.message||'حدث خطأ غير متوقع أثناء التشغيل.');
  }
}

$('#auth-tabs').onclick=e=>{
  const m=e.target.dataset.mode;
  if(!m) return;
  authMode=m;
  document.querySelectorAll('#auth-tabs button').forEach(b=>b.classList.toggle('active',b.dataset.mode===m));
  $('#login-btn').textContent=m==='signup'?'إنشاء الحساب في Supabase':'دخول';
  $('#le').textContent='';$('#li').textContent='';
};

$('#lf').onsubmit=async e=>{
  e.preventDefault();
  $('#le').textContent='';$('#li').textContent='';
  $('#login-btn').disabled=true;
  const email=$('#em').value.trim(),password=$('#pw').value;
  try{
    if(!sb) throw new Error('تعذر الاتصال بـ Supabase');
    if(authMode==='signup'){
      const{data,error}=await sb.auth.signUp({email,password});
      if(error){$('#le').textContent=error.message;return;}
      if(data.session){
        localMode=false;localStorage.removeItem(LOCAL_SESS_KEY);
        $('#login').hidden=true;$('#user-email').textContent=data.user?.email||email;start();return;
      }
      $('#li').textContent='تم إرسال رابط التفعيل لبريدك الإلكتروني. افتح الإيميل لتأكيد الحساب ثم سجل الدخول، أو اضغط دخول سريع للمعاينة.';
      return;
    }
    const{data,error}=await sb.auth.signInWithPassword({email,password});
    if(!error&&data.session){
      localMode=false;localStorage.removeItem(LOCAL_SESS_KEY);
      $('#login').hidden=true;$('#user-email').textContent=data.user?.email||email;start();return;
    }
    if(password==='12345678'){
      localMode=true;localStorage.setItem(LOCAL_SESS_KEY,email);
      $('#login').hidden=true;$('#user-email').textContent=email;start();return;
    }
    $('#le').textContent='بيانات الدخول غير صحيحة. يمكنك إنشاء حساب جديد أو استخدام 12345678 للمعاينة.';
  }catch(err){
    if(password==='12345678'){
      localMode=true;localStorage.setItem(LOCAL_SESS_KEY,email);
      $('#login').hidden=true;$('#user-email').textContent=email;start();return;
    }
    $('#le').textContent=err?.message||'تعذر تسجيل الدخول.';
  }finally{
    $('#login-btn').disabled=false;
  }
};

$('#quick-btn').onclick=()=>{
  const email=$('#em').value.trim()||'admin@noub-crm.local';
  $('#em').value=email;$('#pw').value='12345678';
  localMode=true;localStorage.setItem(LOCAL_SESS_KEY,email);
  $('#login').hidden=true;$('#user-email').textContent=email;start();
};

$('#out').onclick=async()=>{
  localStorage.removeItem(LOCAL_SESS_KEY);localMode=false;
  if(sb) await sb.auth.signOut().catch(()=>{});
  location.reload();
};

function start(){
  $('#login').hidden=true;$('#app').hidden=false;
  $('#local-banner').hidden=!localMode;
  const nav=$('#nav');
  const groups=[
    {id:'subscriptions',label:'الاشتراكات والوصول'},
    {id:'apps',label:'التطبيقات والفرق'},
    {id:'finance',label:'المالية'}
  ];
  nav.innerHTML=
    '<button data-id="dash">الملخص والرسوم البيانية</button>'+
    '<button data-id="app-view">متابعة التطبيقات والهيكل</button>'+
    '<div class="nav-sep">إدارة مقر المعادي والتسليم</div>'+
    '<button data-id="joint-tasks">المهام المشتركة (105)</button>'+
    '<button data-id="handover">تسليم م/ عماد (المقر)</button>'+
    '<button data-id="master-registry">السجل الشامل (450)</button>'+
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
  if(id==='joint-tasks') return jointTasksView();
  if(id==='handover') return handoverView();
  if(id==='master-registry') return masterRegistryView();
  return grid(TABLES.find(t=>t.id===id));
}

async function dash(){
  $('#title').textContent='ملخص المتابعة والرسوم البيانية';
  $('#subtitle').textContent='متابعة الاستحقاقات المالية ونسب إنجاز التطبيقات';
  $('#view').innerHTML='<div class="panel">جاري تحميل البيانات...</div>';
  try{
    const[d,apps,dl]=await Promise.all([dbDue(),dbSelect('apps'),dbSelect('deliverables')]);
    const late=d.filter(r=>r.days_left<0),w7=d.filter(r=>r.days_left>=0&&r.days_left<=7),m30=d.filter(r=>r.days_left>=0&&r.days_left<=30);
    const sum=a=>a.reduce((s,r)=>s+Number(r.amount||0),0);
    const card=(l,v,k='')=>\`<div class="card \${k}"><span>\${l}</span><b>\${v}</b></div>\`;

    const catTotals={};
    d.forEach(r=>{catTotals[r.cat]=(catTotals[r.cat]||0)+Number(r.amount||0);});
    const maxCat=Math.max(1,...Object.values(catTotals));
    const catBars=Object.entries(catTotals).map(([cat,val])=>{
      const pct=Math.round((val/maxCat)*100);
      return \`<div class="bar-row"><div class="bar-meta"><span>\${esc(cat)}</span><span class="num">\${money(val)} ج.م</span></div><div class="bar"><i style="width:\${pct}%;background:#1e3a5f"></i></div></div>\`;
    }).join('')||'<p class="subtitle">لا توجد التزامات مسجلة</p>';

    const appBars=apps.map(a=>{
      const items=dl.filter(r=>r.app_id===a.id);
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

    $('#due-seg').onclick=e=>{const f=e.target.dataset.f;if(f){dueStatusFilter=f;dash();}};
    document.querySelectorAll('[data-app]').forEach(el=>{el.onclick=()=>{selectedAppId=el.dataset.app;go('app-view');};});
  }catch(err){
    $('#view').innerHTML='<div class="panel err-msg">'+esc(err.message)+'</div>';
  }
}

async function appWorkspace(){
  $('#title').textContent='متابعة التطبيقات والهيكل الوظيفي';
  $('#subtitle').textContent='مسار الاستلام والمراحل والهيكل الوظيفي لكل تطبيق';
  const[appList,dl,team]=await Promise.all([dbSelect('apps'),dbSelect('deliverables'),dbSelect('team')]);
  if(!appList.length){$('#view').innerHTML='<div class="panel">لا توجد تطبيقات مسجلة.</div>';return;}
  if(!selectedAppId||!appList.some(a=>a.id===selectedAppId)) selectedAppId=appList[0].id;
  const app=appList.find(a=>a.id===selectedAppId);
  const appDl=dl.filter(d=>d.app_id===app.id);
  const appTeam=team.filter(m=>m.app_id===app.id);

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

  $('#app-tabs').onclick=e=>{const id=e.target.dataset.id;if(id){selectedAppId=id;appWorkspace();}};
}

function jointTasksView(){
  $('#title').textContent='جدول متابعة بنود العمل المشتركة (105 بنود)';
  $('#subtitle').textContent='متابعة تنفيذ م/ عماد الشرقاوي وم/ سامح ياسين وتحديث الحالات لحظياً';
  const tasks=getJointTasks();
  const total=tasks.length;
  const done=tasks.filter(t=>t.status==='تم').length;
  const prog=tasks.filter(t=>t.status==='جاري التنفيذ').length;
  const todo=tasks.filter(t=>t.status==='لم يتم').length;
  const pct=total?Math.round((done/total)*100):0;
  const sections=[...new Set(tasks.map(t=>t.section))];
  const owners=['عماد','سامح','هاني','أبو خالد','حاتم','علي','محمد مصطفى','WE'];

  const q=jtState.q.trim().toLowerCase();
  const filtered=tasks.filter(t=>{
    if(jtState.status!=='all'&&t.status!==jtState.status) return false;
    if(jtState.sec!=='all'&&t.section!==jtState.sec) return false;
    if(jtState.owner!=='all'&&!t.owner.includes(jtState.owner)) return false;
    if(!q) return true;
    return String(t.id).includes(q)||t.title.toLowerCase().includes(q)||t.owner.toLowerCase().includes(q)||t.section.toLowerCase().includes(q);
  });

  $('#tools').innerHTML=
    '<button type="button" id="jt-reset" class="secondary">استعادة الافتراضي</button>'+
    '<button type="button" id="jt-exp" class="secondary">تصدير CSV</button>'+
    '<button type="button" id="jt-add-toggle">+ إضافة بند</button>';

  const secHtml=sections.map(sec=>{
    const items=tasks.filter(t=>t.section===sec);
    const sDone=items.filter(t=>t.status==='تم').length;
    const sPct=items.length?Math.round((sDone/items.length)*100):0;
    return '<button type="button" class="sec-btn '+(jtState.sec===sec?'active':'')+'" data-sec="'+esc(sec)+'">'+
      '<div style="display:flex;justify-content:space-between;gap:8px"><span>'+esc(sec)+'</span><span class="num">'+sDone+'/'+items.length+' ('+sPct+'%)</span></div>'+
      '<div class="bar"><i style="width:'+sPct+'%;background:#1e3a5f"></i></div></button>';
  }).join('');

  const addBoxHtml=jtState.adding?(
    '<form id="jt-add-form" class="add-box">'+
      '<input id="jt-new-title" required placeholder="عنوان البند الجديد...">'+
      '<input id="jt-new-owner" value="م/ عماد الشرقاوي + م/ سامح ياسين" placeholder="المسؤول...">'+
      '<select id="jt-new-sec">'+sections.map(s=>'<option value="'+esc(s)+'">'+esc(s)+'</option>').join('')+'</select>'+
      '<select id="jt-new-st"><option value="تم">تم</option><option value="جاري التنفيذ" selected>جاري التنفيذ</option><option value="لم يتم">لم يتم</option></select>'+
      '<button type="submit">حفظ البند</button>'+
    '</form>'
  ):'';

  $('#view').innerHTML=
    '<div class="cards">'+
      '<div class="card"><span>إجمالي البنود المشتركة ('+pct+'%)</span><b>'+total+'</b></div>'+
      '<div class="card ok"><span>بنود مكتملة (تم)</span><b>'+done+'</b></div>'+
      '<div class="card warn"><span>جاري التنفيذ</span><b>'+prog+'</b></div>'+
      '<div class="card bad"><span>لم يتم بعد</span><b>'+todo+'</b></div>'+
    '</div>'+
    '<div class="panel">'+
      '<h3>نسبة الإنجاز حسب الأقسام</h3>'+
      '<div class="jt-stack">'+
        '<i style="width:'+(total?(done/total)*100:0)+'%;background:#16a34a"></i>'+
        '<i style="width:'+(total?(prog/total)*100:0)+'%;background:#d97706"></i>'+
        '<i style="width:'+(total?(todo/total)*100:0)+'%;background:#dc2626"></i>'+
      '</div>'+
      '<div class="sec-grid" id="jt-secs">'+secHtml+'</div>'+
    '</div>'+
    '<div class="panel">'+
      '<div class="tools" style="justify-content:space-between">'+
        '<div class="tools">'+
          '<input id="jt-q" value="'+esc(jtState.q)+'" placeholder="بحث برقم البند أو الوصف أو المسؤول...">'+
          '<select id="jt-st-flt">'+
            '<option value="all">كل الحالات</option>'+
            '<option value="تم" '+(jtState.status==='تم'?'selected':'')+'>تم</option>'+
            '<option value="جاري التنفيذ" '+(jtState.status==='جاري التنفيذ'?'selected':'')+'>جاري التنفيذ</option>'+
            '<option value="لم يتم" '+(jtState.status==='لم يتم'?'selected':'')+'>لم يتم</option>'+
          '</select>'+
          '<select id="jt-own-flt">'+
            '<option value="all">كل المسؤولين</option>'+
            owners.map(o=>'<option value="'+esc(o)+'" '+(jtState.owner===o?'selected':'')+'>'+esc(o)+'</option>').join('')+
          '</select>'+
        '</div>'+
        '<span class="subtitle">عرض <b class="num">'+filtered.length+'</b> من <b class="num">'+total+'</b></span>'+
      '</div>'+
      addBoxHtml+
    '</div>'+
    '<div class="wrap">'+
      '<table>'+
        '<tr><th>#</th><th>القسم</th><th>البند / المهمة</th><th>المسؤول</th><th>الحالة</th></tr>'+
        (filtered.map(item=>{
          const cls=item.status==='تم'?'ok':item.status==='جاري التنفيذ'?'warn':'bad';
          return '<tr>'+
            '<td class="num b">'+item.id+'</td>'+
            '<td>'+esc(item.section)+'</td>'+
            '<td class="b">'+esc(item.title)+'</td>'+
            '<td>'+esc(item.owner)+'</td>'+
            '<td><select class="status-sel '+cls+'" data-tid="'+item.id+'">'+
              '<option value="تم" '+(item.status==='تم'?'selected':'')+'>تم</option>'+
              '<option value="جاري التنفيذ" '+(item.status==='جاري التنفيذ'?'selected':'')+'>جاري التنفيذ</option>'+
              '<option value="لم يتم" '+(item.status==='لم يتم'?'selected':'')+'>لم يتم</option>'+
            '</select></td>'+
          '</tr>';
        }).join('')||'<tr><td colspan="5">لا توجد بنود مطابقة</td></tr>')+
      '</table>'+
    '</div>';

  $('#jt-q').oninput=e=>{jtState.q=e.target.value;jointTasksView();$('#jt-q').focus();};
  $('#jt-st-flt').onchange=e=>{jtState.status=e.target.value;jointTasksView();};
  $('#jt-own-flt').onchange=e=>{jtState.owner=e.target.value;jointTasksView();};
  $('#jt-secs').onclick=e=>{
    const b=e.target.closest('[data-sec]');
    if(b){jtState.sec=jtState.sec===b.dataset.sec?'all':b.dataset.sec;jointTasksView();}
  };
  $('#jt-reset').onclick=()=>{saveJointTasks(JOINT_TASKS_SEED.map(t=>({...t})));jointTasksView();};
  $('#jt-exp').onclick=()=>downloadCsvFile('joint-tasks-emad-sameh',['رقم البند','القسم','البند','الحالة','المسؤول'],filtered.map(t=>[t.id,t.section,t.title,t.status,t.owner]));
  $('#jt-add-toggle').onclick=()=>{jtState.adding=!jtState.adding;jointTasksView();};
  if($('#jt-add-form')){
    $('#jt-add-form').onsubmit=e=>{
      e.preventDefault();
      const title=$('#jt-new-title').value.trim();if(!title) return;
      const list=getJointTasks();
      const nextId=list.reduce((m,t)=>Math.max(m,t.id),0)+1;
      list.push({id:nextId,title,owner:$('#jt-new-owner').value.trim()||'م/ عماد الشرقاوي',section:$('#jt-new-sec').value,status:$('#jt-new-st').value});
      saveJointTasks(list);jtState.adding=false;jointTasksView();
    };
  }
  document.querySelectorAll('[data-tid]').forEach(sel=>{
    sel.onchange=e=>{
      const tid=Number(e.target.dataset.tid);
      const list=getJointTasks().map(t=>t.id===tid?{...t,status:e.target.value}:t);
      saveJointTasks(list);jointTasksView();
    };
  });
}

function handoverView(){
  $('#title').textContent='حزمة تسليم مقر المعادي إلى م/ عماد الشرقاوي';
  $('#subtitle').textContent='البوابات الـ 14، Zoho Lite، السنترال الجراند ستريم، راك 27U، وسحابة WE';
  const hd=HANDOVER_DATA;
  const checked=getCheckedMap();
  const doneCnt=hd.checklist.filter(c=>checked[c.id]).length;

  let body='';
  if(hoTab==='methodology'){
    body=
      '<div class="grid-2">'+
        hd.phases.map(p=>'<div class="panel"><p class="st ok" style="margin:0 0 6px">'+esc(p.phase)+'</p><h3>'+esc(p.title)+'</h3><p class="subtitle">'+esc(p.detail)+'</p></div>').join('')+
      '</div>'+
      '<div class="panel">'+
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><h3>قائمة التحقق لجلسة التسليم المباشرة</h3><b class="num">'+doneCnt+'/'+hd.checklist.length+'</b></div>'+
        '<div class="chk-list" id="ho-chks">'+
          hd.checklist.map(c=>{
            const isDone=Boolean(checked[c.id]);
            return '<label class="chk-row '+(isDone?'done':'')+'"><input type="checkbox" data-chk="'+esc(c.id)+'" '+(isDone?'checked':'')+'><div><b>'+esc(c.title)+'</b><span>'+esc(c.detail)+'</span></div></label>';
          }).join('')+
        '</div>'+
      '</div>';
  }else if(hoTab==='portals'){
    const pq=hoQuery.trim().toLowerCase();
    const pFiltered=hd.portals.filter(p=>!pq||p.service.toLowerCase().includes(pq)||p.username.toLowerCase().includes(pq)||p.contact.toLowerCase().includes(pq));
    body=
      '<div class="panel">'+
        '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:12px">'+
          '<h3 style="margin:0">المواقع والحسابات السحابية وبوابات الاتصالات (14 بوابة)</h3>'+
          '<input id="ho-pq" style="max-width:280px" value="'+esc(hoQuery)+'" placeholder="بحث في البوابات...">'+
        '</div>'+
        '<div class="wrap"><table><tr><th>#</th><th>الخدمة</th><th>رابط الدخول</th><th>الحساب / المعرّف</th><th>جهة التواصل</th><th>ما يُسلم لـ م/ عماد</th></tr>'+
          pFiltered.map(p=>'<tr><td class="num">'+p.id+'</td><td class="b">'+esc(p.service)+'</td><td class="num">'+esc(p.url)+'</td><td class="num">'+esc(p.username)+'</td><td>'+esc(p.contact)+'</td><td>'+esc(p.handoverDetails)+'</td></tr>').join('')+
        '</table></div>'+
      '</div>'+
      '<div class="panel"><h3>البريد المؤسسي الموحد (Zoho Lite — 5 حسابات فعالة)</h3>'+
        '<div class="wrap"><table><tr><th>#</th><th>البريد الإلكتروني</th><th>الدور الوظيفي</th><th>السعة</th><th>الحالة</th></tr>'+
          hd.emails.map(m=>'<tr><td class="num">'+m.id+'</td><td class="b num">'+esc(m.email)+'</td><td>'+esc(m.role)+'</td><td class="num">'+esc(m.quota)+'</td><td>'+esc(m.status)+'</td></tr>').join('')+
        '</table></div>'+
      '</div>';
  }else if(hoTab==='pbx'){
    body=
      '<div class="grid-3">'+
        '<div class="card"><span>واجهة إدارة السنترال (Web GUI)</span><b style="font-size:17px">192.168.30.1:8089</b></div>'+
        '<div class="card"><span>الخطوط الخارجية FXO</span><b style="font-size:16px">FXO-1 · FXO-2 · FXS-1</b></div>'+
        '<div class="card warn"><span>تذكرة الاعتماد المفتوحة</span><b style="font-size:16px">MSH-IT-2026-084</b></div>'+
      '</div>'+
      '<div class="panel"><h3>خريطة التحويلات الداخلية (Grandstream GRP2614 · 100–116)</h3>'+
        '<div class="wrap"><table><tr><th>التحويلة</th><th>القسم / المسؤول</th><th>الموقع</th><th>ملاحظات</th></tr>'+
          hd.pbx.map(x=>'<tr><td class="b num">'+esc(x.ext)+'</td><td class="b">'+esc(x.department)+'</td><td>'+esc(x.location)+'</td><td>'+esc(x.notes)+'</td></tr>').join('')+
        '</table></div>'+
      '</div>';
  }else{
    body=
      '<div class="panel"><h3>أصول وعناوين غرفة السيرفرات بالمعادي (راك بيرلا 27U)</h3>'+
        '<div class="wrap"><table><tr><th>الجهاز</th><th>الموقع</th><th>عنوان الدخول (IP)</th><th>بيانات الوصول المطلوبة</th></tr>'+
          hd.rack.map(a=>'<tr><td class="b">'+esc(a.device)+'</td><td>'+esc(a.location)+'</td><td class="num b">'+esc(a.ip)+'</td><td>'+esc(a.credentialsScope)+'</td></tr>').join('')+
        '</table></div>'+
      '</div>'+
      '<div class="panel"><h3>خوادم المصرية للاتصالات WE السحابية بالقرية الذكية والـ SSL VPN</h3>'+
        '<div class="grid-2">'+
          hd.weCloud.map(s=>'<div class="team-card"><h4 class="num">'+esc(s.name)+'</h4><p class="num">'+esc(s.specs)+'</p><p>'+esc(s.role)+'</p></div>').join('')+
        '</div>'+
      '</div>';
  }

  $('#view').innerHTML=
    '<div class="seg" id="ho-tabs">'+
      '<button type="button" class="secondary '+(hoTab==='methodology'?'active':'')+'" data-t="methodology">منهجية التسليم وقائمة التحقق</button>'+
      '<button type="button" class="secondary '+(hoTab==='portals'?'active':'')+'" data-t="portals">البوابات (14) والإيميلات (5)</button>'+
      '<button type="button" class="secondary '+(hoTab==='pbx'?'active':'')+'" data-t="pbx">السنترال الجراند ستريم</button>'+
      '<button type="button" class="secondary '+(hoTab==='infrastructure'?'active':'')+'" data-t="infrastructure">راك المعادي 27U وسحابة WE</button>'+
    '</div>'+body;

  $('#ho-tabs').onclick=e=>{const t=e.target.dataset.t;if(t){hoTab=t;handoverView();}};
  if($('#ho-chks')){
    $('#ho-chks').onchange=e=>{
      const id=e.target.dataset.chk;
      if(id){const next={...getCheckedMap(),[id]:e.target.checked};saveCheckedMap(next);handoverView();}
    };
  }
  if($('#ho-pq')){
    $('#ho-pq').oninput=e=>{hoQuery=e.target.value;handoverView();$('#ho-pq').focus();};
  }
}

function masterRegistryView(){
  $('#title').textContent='السجل المرجعي الشامل للمشروع (450 بنداً)';
  $('#subtitle').textContent='الأرشيف الكامل للمهام والأفكار والفواتير والأجهزة والقرارات';
  const cats=[...new Set(MASTER_REGISTRY.map(r=>r.category))];
  const kinds=[...new Set(MASTER_REGISTRY.map(r=>r.kind))];
  const q=mrState.q.trim().toLowerCase();
  const filtered=MASTER_REGISTRY.filter(r=>{
    if(mrState.cat!=='all'&&r.category!==mrState.cat) return false;
    if(mrState.kind!=='all'&&r.kind!==mrState.kind) return false;
    if(!q) return true;
    return String(r.id).includes(q)||r.title.toLowerCase().includes(q)||r.category.toLowerCase().includes(q)||r.owners.toLowerCase().includes(q)||r.status.toLowerCase().includes(q);
  });
  const vis=filtered.slice(0,mrState.limit);

  $('#tools').innerHTML=
    '<input id="mr-q" value="'+esc(mrState.q)+'" placeholder="بحث في الـ 450 بند...">'+
    '<select id="mr-cat"><option value="all">كل التصنيفات ('+cats.length+')</option>'+cats.map(c=>'<option value="'+esc(c)+'" '+(mrState.cat===c?'selected':'')+'>'+esc(c)+'</option>').join('')+'</select>'+
    '<select id="mr-kind"><option value="all">كل الأنواع</option>'+kinds.map(k=>'<option value="'+esc(k)+'" '+(mrState.kind===k?'selected':'')+'>'+esc(k)+'</option>').join('')+'</select>'+
    '<button type="button" id="mr-exp" class="secondary">تصدير CSV ('+filtered.length+')</button>';

  $('#view').innerHTML=
    '<div class="wrap">'+
      '<table>'+
        '<tr><th>م</th><th>التصنيف</th><th>البيان / المهمة / المعلومة</th><th>نوع البند</th><th>الأطراف المشاركة</th><th>الحالة</th></tr>'+
        (vis.map(r=>'<tr><td class="num b">'+r.id+'</td><td>'+esc(r.category)+'</td><td class="b">'+esc(r.title)+'</td><td>'+esc(r.kind)+'</td><td>'+esc(r.owners)+'</td><td>'+esc(r.status)+'</td></tr>').join('')||'<tr><td colspan="6">لا توجد نتائج</td></tr>')+
      '</table>'+
      '<div class="foot-meta">'+
        '<span>معروض <b class="num">'+vis.length+'</b> من <b class="num">'+filtered.length+'</b> بند</span>'+
        (vis.length<filtered.length?'<div style="display:flex;gap:8px"><button type="button" id="mr-more" class="secondary">عرض 100 إضافية</button><button type="button" id="mr-all">عرض الكل</button></div>':'')+
      '</div>'+
    '</div>';

  $('#mr-q').oninput=e=>{mrState.q=e.target.value;masterRegistryView();$('#mr-q').focus();};
  $('#mr-cat').onchange=e=>{mrState.cat=e.target.value;mrState.limit=100;masterRegistryView();};
  $('#mr-kind').onchange=e=>{mrState.kind=e.target.value;mrState.limit=100;masterRegistryView();};
  $('#mr-exp').onclick=()=>downloadCsvFile('noub-master-registry-450',['م','التصنيف','البيان','نوع البند','الأطراف','الحالة'],filtered.map(r=>[r.id,r.category,r.title,r.kind,r.owners,r.status]));
  if($('#mr-more')) $('#mr-more').onclick=()=>{mrState.limit+=100;masterRegistryView();};
  if($('#mr-all')) $('#mr-all').onclick=()=>{mrState.limit=filtered.length;masterRegistryView();};
}

async function grid(t){
  cur=t;
  $('#title').textContent=t.n;
  $('#subtitle').textContent='إدارة وتصفية السجلات وتصديرها';
  for(const f of t.f) if(f.t==='ref') await refMap(f.ref,true);
  try{rows=await dbSelect(t.id);}catch(err){$('#view').innerHTML='<div class="panel err-msg">'+esc(err.message)+'</div>';return;}
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
  const list=getFilteredRows(),fs=t.f;
  downloadCsvFile(t.id,fs.map(f=>f.l),list.map(r=>fs.map(f=>{
    let v=r[f.k];
    if(f.t==='ref') v=(refs[f.ref]?.find(a=>a.id===v)||{}).name||'';
    if(f.t==='bool') v=v?'نعم':'لا';
    return v;
  })));
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
      try{await dbDelete(t.id,b.dataset.d);grid(t);}catch(err){alert(err.message);}
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
    try{
      if(r){await dbUpdate(t.id,r.id,o);}else{await dbInsert(t.id,o);}
      if(t.id==='apps') await refMap('apps',true);
      $('#dlg').close();grid(t);
    }catch(err){alert('تعذر الحفظ: '+err.message);}
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

export function generateSingleFileHtml(customUrl?: string, customKey?: string): string {
  const files = generateGitHubRootFiles(customUrl, customKey);
  const inlineCss = files['style.css'];
  const inlineConfig = files['config.js'];
  const inlineTables = files['tables.js'];
  const inlineApp = files['app.js'];

  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>NOUB CRM — متابعة الاشتراكات والتطبيقات ومقر المعادي (ملف واحد مستقل)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
${inlineCss}
  </style>
</head>
<body>
  <div id="boot-screen" class="boot-screen">
    <div class="boot-card">
      <p id="boot-msg">جاري تحميل النظام والتحقق من الجلسة...</p>
    </div>
  </div>

  <section id="login" hidden>
    <div class="login-card">
      <div class="login-head">
        <h1>NOUB CRM</h1>
        <p>متابعة الاشتراكات والتطبيقات وحزمة تسليم مقر المعادي (نسخة الملف الواحد)</p>
      </div>
      <div class="auth-tabs" id="auth-tabs">
        <button type="button" class="active" data-mode="login">تسجيل الدخول</button>
        <button type="button" data-mode="signup">إنشاء حساب جديد</button>
      </div>
      <form id="lf" class="login-form">
        <label>البريد الإلكتروني
          <input id="em" type="email" placeholder="name@company.com" required autocomplete="email" dir="ltr">
        </label>
        <label>كلمة المرور (أو 12345678 للمعاينة)
          <input id="pw" type="password" placeholder="••••••••" required minlength="6" autocomplete="current-password" dir="ltr">
        </label>
        <button id="login-btn" type="submit">دخول</button>
      </form>
      <button id="quick-btn" type="button" class="quick-btn">دخول سريع للمعاينة (كلمة المرور 12345678)</button>
      <p id="le" class="err-msg"></p>
      <p id="li" class="ok-msg"></p>
    </div>
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
      <div id="local-banner" class="local-banner" hidden>
        <span>وضع المعاينة الفورية (محلي على المتصفح) — للحفظ السحابي على Supabase أنشئ حساباً وفعّله من الإيميل.</span>
      </div>
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
  <script>
${inlineConfig}
${inlineTables}
${inlineApp}
  </script>
</body>
</html>
`;
}

export function downloadSingleStandaloneHtml(customUrl?: string, customKey?: string) {
  const html = generateSingleFileHtml(customUrl, customKey);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'index.html';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
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
