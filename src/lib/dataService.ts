import { daysLeft, getSupabaseClient } from './supabase';
import type { AnyRecord, AppRecord, DeliverableRecord, DueRow, TableId } from '../types/crm';

export type AuthMode = 'supabase' | 'local';

const LOCAL_SESSION_KEY = 'noub_crm_local_session_email';
const LOCAL_DB_KEY = 'noub_crm_local_db_v2';

const INITIAL_APPS: AppRecord[] = [
  {
    id: 'app-4b',
    name: '4B (فوربي)',
    description: 'منصة وتطبيق النقل الذكي للركاب والكباتن بنظام المزايدة الحية والخرائط الجغرافية',
    platforms: 'أندرويد · iOS · لوحة إدارة',
    start_date: '2026-06-01',
    launch_date: '2026-11-30',
    status: 'في الفترة التجريبية',
  },
  {
    id: 'app-daro',
    name: 'DARO (دارو)',
    description: 'تطبيق الشحن اللوجستي والطرود السريعة بنفس اليوم وتتبع البوالص والباركود',
    platforms: 'أندرويد · iOS · لوحة متاجر',
    start_date: '2026-07-01',
    launch_date: '2026-12-30',
    status: 'قيد التنفيذ',
  },
  {
    id: 'app-wikala',
    name: 'WIKALA (وكالة)',
    description: 'منصة إدارة المكاتب الفرعية والوكلاء المحليين بالمحافظات والأسطول الإقليمي',
    platforms: 'أندرويد · iOS · لوحة وكلاء',
    start_date: '2026-06-15',
    launch_date: '2026-12-15',
    status: 'قيد التنفيذ',
  },
];

const DELIVERABLE_TEMPLATE: Array<[string, string]> = [
  ['التخطيط والمتطلبات', 'وثيقة متطلبات المنتج (PRD)'],
  ['التخطيط والمتطلبات', 'دراسة السوق المصري والمنافسين'],
  ['التخطيط والمتطلبات', 'خريطة رحلة المستخدم والميزات'],
  ['التصميم', 'تصميم تجربة المستخدم UX'],
  ['التصميم', 'نظام التصميم والهوية البصرية'],
  ['التصميم', 'تصميم واجهات المستخدم UI'],
  ['التصميم', 'النموذج التفاعلي Prototype'],
  ['التصميم', 'اعتماد التصميم النهائي'],
  ['التطوير', 'قاعدة البيانات والخلفية وواجهات API'],
  ['التطوير', 'تطبيق الأندرويد'],
  ['التطوير', 'تطبيق iOS / نسخة الويب'],
  ['التطوير', 'لوحة تحكم الإدارة'],
  ['التطوير', 'ربط الدفع الإلكتروني'],
  ['التطوير', 'الإشعارات والرسائل'],
  ['الاختبار والجودة', 'الاختبار الوظيفي'],
  ['الاختبار والجودة', 'اختبار الأداء والأمان'],
  ['الاختبار والجودة', 'اختبار قبول المستخدم UAT'],
  ['الاختبار والجودة', 'الفترة التجريبية Beta'],
  ['الإطلاق والتشغيل', 'سياسة الخصوصية والشروط'],
  ['الإطلاق والتشغيل', 'النشر على Google Play / App Store'],
  ['الإطلاق والتشغيل', 'الإطلاق التسويقي'],
  ['الإطلاق والتشغيل', 'خطة الدعم بعد الإطلاق'],
];

function buildInitialLocalDb(): Record<TableId, AnyRecord[]> {
  const now = new Date().toISOString();
  const deliverables: DeliverableRecord[] = [];
  INITIAL_APPS.forEach((app) => {
    DELIVERABLE_TEMPLATE.forEach(([stage, item], idx) => {
      const done4B = app.id === 'app-4b' && idx < 8;
      const inProg4B = app.id === 'app-4b' && idx >= 8 && idx < 15;
      deliverables.push({
        id: `dl-${app.id}-${idx + 1}`,
        created_at: now,
        app_id: app.id,
        stage,
        item,
        owner: done4B ? 'م/ سامح ياسين' : inProg4B ? 'قيمة تك + م/ علي QA' : null,
        start_date: null,
        end_date: null,
        received_on: done4B ? '2026-09-25' : null,
        status: done4B ? 'تم الاستلام' : inProg4B ? 'قيد التنفيذ' : 'لم يبدأ',
        acceptance: done4B ? 'اجتاز' : 'لم يُختبر',
        notes: null,
      });
    });
  });

  return {
    telecom_lines: [
      { id: 'tel-1', created_at: now, name: 'خط أرضي 1 (المعادي الرئيسي)', kind: 'أرضي', number: '02-2517xxxx', service: 'مكالمات + إنترنت + سنترال FXO-1', provider: 'المصرية للاتصالات WE', cycle: 'شهري' },
      { id: 'tel-2', created_at: now, name: 'خط أرضي 2 (العمليات والكباتن)', kind: 'أرضي', number: '02-2517xxxx', service: 'مكالمات + سنترال FXO-2', provider: 'المصرية للاتصالات WE', cycle: 'شهري' },
      { id: 'tel-3', created_at: now, name: 'راوتر فودافون H153-381 (المؤقت)', kind: 'محمول', number: 'فاتورة 748994', service: 'إنترنت المقر المؤقت 4G/5G', provider: 'فودافون مصر', plan: 'باقة 520', cycle: 'شهري', amount: 520 },
      { id: 'tel-4', created_at: now, name: 'شريحة أورنج 4G (خط الطوارئ)', kind: 'محمول', service: 'إنترنت احتياطي Failover', provider: 'أورنج بيزنس', cycle: 'شهري' },
      { id: 'tel-5', created_at: now, name: 'خطوط فودافون OTP وشريحة تويليو', kind: 'محمول', service: 'رسائل التحقق BroadNet و Twilio', provider: 'فودافون مصر', cycle: 'شهري' },
    ],
    domains: [
      { id: 'dom-1', created_at: now, name: 'mashawer.com.eg', kind: 'دومين', provider: 'المصرية EC (م/ محمد الحلو)', start_date: '2026-08-09', cycle: 'سنوي', amount: 1254, due_date: '2027-08-09', auto_renew: false, notes: 'مطلوب التجديد لسنتين قادمتين' },
      { id: 'dom-2', created_at: now, name: 'استضافة الموقع الرئيسي Host1', kind: 'استضافة', provider: 'المصرية EC (م/ محمد الحلو)', start_date: '2026-08-11', cycle: 'سنوي', amount: 2508, due_date: '2027-08-11', auto_renew: false },
    ],
    wanted_domains: [
      { id: 'wd-1', created_at: now, name: 'mashweer.net', ext: '.net', provider: 'EC / مسجل خارجي', priority: 'عالية', status: 'محجوز', project: 'عدة تطبيقات', notes: 'مقترح تجديده مع mashawer.com.eg' },
      { id: 'wd-2', created_at: now, name: 'wikala.com.eg', ext: '.com.eg', provider: 'المصرية EC', priority: 'عالية', status: 'متاح', project: 'WIKALA', notes: 'بانتظار السجل التجاري وشهادة المنشأ' },
    ],
    providers: [
      { id: 'prv-1', created_at: now, name: 'المصرية للاتصالات (WE Cloud & WAF)', category: 'سحابة / متاجر', site: '4B', login_url: 'https://cloud.te.eg/portal', username: 'mashweer_telecom_admin', pwd_type: 'برايفت (الماستر)', funding: 'اشتراك ثابت', amount: 201874, cycle: 'ربع سنوي', owner: 'م/ عماد الشرقاوي + م/ سامح ياسين', notes: 'PO #6078933 بإجمالي 807,496 ج.م/سنة' },
      { id: 'prv-2', created_at: now, name: 'المصرية للاتصالات (WE Fiber 24Mbps + 6x4Mbps)', category: 'أخرى', site: 'عدة تطبيقات', login_url: 'https://cloud.te.eg/portal', pwd_type: 'برايفت (الماستر)', funding: 'اشتراك ثابت', amount: 90000, cycle: 'ربع سنوي', owner: 'م/ عماد الشرقاوي + م/ أحمد محرم', notes: 'PO #6078927 بإجمالي 360,000 ج.م/سنة' },
      { id: 'prv-3', created_at: now, name: 'Google Cloud & Maps', category: 'خرائط', site: 'عدة تطبيقات', login_url: 'https://console.cloud.google.com', username: 'admin@mashweer.com.eg', pwd_type: 'جوجل لوجن', funding: 'حسب الاستخدام', cycle: 'حسب الاستخدام', owner: 'م/ سامح ياسين + أ/ هاني' },
      { id: 'prv-4', created_at: now, name: 'Cloudinary', category: 'وسائط', site: '4B', login_url: 'https://cloudinary.com', username: 'mashweer-cloud', pwd_type: 'برايفت (الماستر)', funding: 'رصيد مسبق', owner: 'م/ سامح ياسين' },
      { id: 'prv-5', created_at: now, name: 'BroadNet SMS', category: 'رسائل / إشعارات', site: '4B', login_url: 'https://broadnetme.com/portal/login', username: 'mashawer', pwd_type: 'برايفت (الماستر)', funding: 'رصيد مسبق', owner: 'م/ سامح ياسين + م/ عماد الشرقاوي' },
      { id: 'prv-6', created_at: now, name: 'Twilio', category: 'رسائل / إشعارات', site: 'WIKALA', login_url: 'https://console.twilio.com', pwd_type: 'برايفت (الماستر)', funding: 'رصيد مسبق', owner: 'م/ سامح ياسين' },
      { id: 'prv-7', created_at: now, name: 'Fawry Enterprise', category: 'دفع', site: '4B', login_url: 'https://fawry.com', username: 'FAWRY_MERCHANT_CODE_MASHWEER', pwd_type: 'برايفت (الماستر)', funding: 'حسب الاستخدام', owner: 'أ/ هاني' },
      { id: 'prv-8', created_at: now, name: 'Supabase Cloud', category: 'قواعد بيانات', site: 'عدة تطبيقات', login_url: 'https://supabase.com/dashboard', username: 'mashweer-db', pwd_type: 'برايفت (الماستر)', funding: 'اشتراك ثابت', owner: 'م/ سامح ياسين' },
      { id: 'prv-9', created_at: now, name: 'Zoho Mail Lite (5 حسابات)', category: 'أخرى', site: 'عدة تطبيقات', login_url: 'https://mail.zoho.com', username: 'admin@mashweer.com.eg', pwd_type: 'برايفت (الماستر)', funding: 'مجاني', owner: 'م/ عماد الشرقاوي' },
    ],
    api_keys: [
      { id: 'api-1', created_at: now, provider: 'Google Maps', service: 'Maps / Places / Directions', site: '4B', env: 'Production', key_label: '4B_SERVER_MAPS_KEY', secret_location: 'خزنة الأسرار الإدارية / .env', billing: 'حسب الاستخدام' },
      { id: 'api-2', created_at: now, provider: 'BroadNet', service: 'OTP SMS Gateway', site: '4B', env: 'Production', key_label: 'BROADNET_API_KEY', secret_location: 'خزنة الأسرار الإدارية', billing: 'رصيد مسبق' },
      { id: 'api-3', created_at: now, provider: 'Cloudinary', service: 'Signed Media Storage', site: '4B', env: 'Production', key_label: 'CLOUDINARY_API_SECRET', secret_location: 'خزنة الأسرار الإدارية', billing: 'رصيد مسبق' },
      { id: 'api-4', created_at: now, provider: 'Fawry', service: 'Payment & Wallet Webhook', site: '4B', env: 'Test', key_label: 'FAWRY_MERCHANT_CODE_MASHWEER', secret_location: 'خزنة الإدارة المالية', billing: 'حسب الاستخدام' },
    ],
    sites: [
      { id: 'site-1', created_at: now, name: 'لوحة EC للنطاقات والاستضافة', url: 'https://clients.ec.com.eg/clientarea.php', purpose: 'إدارة DNS وتجديد mashawer.com.eg', providers: 'EC Egypt', pwd_type: 'برايفت (الماستر)', it_owner: 'م/ عماد الشرقاوي' },
      { id: 'site-2', created_at: now, name: 'بوابة WE Cloud', url: 'https://cloud.te.eg/portal', purpose: 'إدارة خوادم 4B السحابية وجدار F5 WAF', providers: 'المصرية للاتصالات WE', pwd_type: 'برايفت (الماستر)', it_owner: 'م/ عماد الشرقاوي' },
      { id: 'site-3', created_at: now, name: 'سنترال Grandstream UCM', url: 'https://192.168.30.1:8089', purpose: 'إدارة التحويلات 100-116 وIVR وتسجيل المكالمات', providers: 'مقر المعادي', pwd_type: 'برايفت (الماستر)', it_owner: 'م/ عماد الشرقاوي' },
      { id: 'site-4', created_at: now, name: 'لوحة Proxmox VE 8.x', url: 'https://192.168.10.20:8006', purpose: 'إدارة الأجهزة الافتراضية على Z440 #1', providers: 'مقر المعادي', pwd_type: 'برايفت (الماستر)', it_owner: 'م/ عماد الشرقاوي' },
    ],
    payments: [
      { id: 'pay-1', created_at: now, paid_on: '2026-09-26', item: 'فاتورة QTS #1169 (سيرفر Dell R640 + جهازي HP Z440)', amount: 96295.8, method: 'تحويل بنكي', ref: 'ETA #1169' },
      { id: 'pay-2', created_at: now, paid_on: '2026-06-09', item: 'فاتورة تكنو ستورز الدقي (3 أجهزة Dell + 3 شاشات HP)', amount: 39901.14, method: 'تحويل بنكي', ref: 'ETA Techno' },
      { id: 'pay-3', created_at: now, paid_on: '2026-03-29', item: 'فاتورة رد لاين البستان (كابينة راك بيرلا 27U وأدوات الشبكة)', amount: 18550, method: 'نقدي', ref: 'ETA RedLine' },
      { id: 'pay-4', created_at: now, paid_on: '2026-09-28', item: 'فاتورة QTS #1172 (سويتش سيسكو Catalyst 3850 48P)', amount: 11970, method: 'تحويل بنكي', ref: 'ETA #1172' },
      { id: 'pay-5', created_at: now, paid_on: '2026-09-28', item: 'إذن المنشاوي البستان (هاردات SAS 1.2TB و 2TB) — بانتظار الضريبية', amount: 8510, method: 'نقدي', ref: 'إذن مؤقت' },
      { id: 'pay-6', created_at: now, paid_on: '2026-09-28', item: 'فاتورة فودافون صقر قريش (راوتر H153-381 والشريحة والباقة)', amount: 3326.46, method: 'نقدي', ref: '748994' },
      { id: 'pay-7', created_at: now, paid_on: '2026-03-26', item: 'فاتورة طيبة رنين (سلم 6 درجات وكراسي وترابيزة)', amount: 2951, method: 'نقدي', ref: 'ETA Tiba' },
      { id: 'pay-8', created_at: now, paid_on: '2026-08-11', item: 'فاتورة EC (تجديد استضافة Host1 حتى أغسطس 2027)', amount: 2508, method: 'تحويل بنكي', ref: 'EC Host1' },
      { id: 'pay-9', created_at: now, paid_on: '2026-08-09', item: 'فاتورة EC (تجديد نطاق mashawer.com.eg حتى أغسطس 2027)', amount: 1254, method: 'تحويل بنكي', ref: 'EC Domain' },
    ],
    apps: INITIAL_APPS.map((a) => ({ ...a, created_at: now })),
    deliverables,
    team: [
      { id: 'tm-1', created_at: now, app_id: 'app-4b', level: 'الإدارة العليا', title: 'المالك والمستثمر الرئيسي', person: 'أ/ أبو خالد', party: 'شركتنا', job_status: 'معيّن', duties: 'الاعتماد الاستثماري والاستراتيجي العام' },
      { id: 'tm-2', created_at: now, app_id: 'app-4b', level: 'الإدارة العليا', title: 'المستشار التقني ومدير فرع المعادي', person: 'م/ عماد الشرقاوي', party: 'استشاري', job_status: 'معيّن', reports_to: 'أ/ أبو خالد', duties: 'إدارة مقر المعادي، البنية التحتية، WE، والربط الحكومي' },
      { id: 'tm-3', created_at: now, app_id: 'app-4b', level: 'الإدارة العليا', title: 'رئيس قطاع التكنولوجيا (CTO)', person: 'م/ سامح ياسين', party: 'شركتنا', job_status: 'معيّن', reports_to: 'أ/ أبو خالد', duties: 'القيادة الهندسية للتطبيقات والمواصفات والتكامل' },
      { id: 'tm-4', created_at: now, app_id: 'app-4b', level: 'الإدارة العليا', title: 'المدير المالي (CFO)', person: 'أ/ هاني', party: 'شركتنا', job_status: 'معيّن', reports_to: 'أ/ أبو خالد', duties: 'الإدارة المالية، فوري، الفواتير الضريبية، وتسويات الكباتن' },
      { id: 'tm-5', created_at: now, app_id: 'app-4b', level: 'إدارة المنتج والمشروع', title: 'قيادة غرفة عمليات النقل الذكي', person: 'م/ موفق و م/ عمرو', party: 'شركتنا', job_status: 'معيّن', reports_to: 'م/ عماد الشرقاوي', duties: 'تشغيل الأسطول، الكباتن، الكول سنتر، والتسعير' },
      { id: 'tm-6', created_at: now, app_id: 'app-4b', level: 'الهندسة والتطوير', title: 'شركة التطوير البرمجي', person: 'قيمة تك (ValueTech)', party: 'مقاول خارجي', job_status: 'معيّن', reports_to: 'م/ سامح ياسين', duties: 'تطوير تطبيقات 4B ووكالة ودارو ولوحات الإدارة' },
      { id: 'tm-7', created_at: now, app_id: 'app-4b', level: 'الهندسة والتطوير', title: 'مهندس برمجيات ومساعد تقني', person: 'م/ أحمد عبيد', party: 'شركتنا', job_status: 'معيّن', reports_to: 'م/ عماد الشرقاوي', duties: 'الدعم الهندسي المباشر وصيانة الأنظمة بالمقر' },
      { id: 'tm-8', created_at: now, app_id: 'app-4b', level: 'الجودة', title: 'مسؤول ضمان الجودة (QA)', person: 'م/ علي (QA مكتب 7)', party: 'شركتنا', job_status: 'معيّن', reports_to: 'م/ سامح ياسين', duties: 'اختبار التطبيقات ومطابقة فيجما وتقارير الباجز' },
      { id: 'tm-9', created_at: now, app_id: 'app-4b', level: 'الأعمال والدعم', title: 'المستشار القانوني والمحامي', person: 'أ/ محمد مصطفى', party: 'استشاري', job_status: 'معيّن', reports_to: 'أ/ أبو خالد', duties: 'تراخيص LTRA، حماية الملكية الفكرية، ومراجعة العقود' },
      { id: 'tm-10', created_at: now, app_id: 'app-4b', level: 'الأعمال والدعم', title: 'مسؤولة الموارد البشرية (HR)', person: 'أ/ سارة حسن', party: 'شركتنا', job_status: 'معيّن', reports_to: 'م/ عماد الشرقاوي', duties: 'شؤون الموظفين، جهاز البصمة، وعهدة الأجهزة' },
      { id: 'tm-11', created_at: now, app_id: 'app-wikala', level: 'الإدارة العليا', title: 'رئيس قطاع التكنولوجيا (CTO)', person: 'م/ سامح ياسين', party: 'شركتنا', job_status: 'معيّن', reports_to: 'أ/ أبو خالد' },
      { id: 'tm-12', created_at: now, app_id: 'app-daro', level: 'الإدارة العليا', title: 'رئيس قطاع التكنولوجيا (CTO)', person: 'م/ سامح ياسين', party: 'شركتنا', job_status: 'معيّن', reports_to: 'أ/ أبو خالد' },
    ],
  };
}

function getLocalDb(): Record<TableId, AnyRecord[]> {
  if (typeof window === 'undefined') return buildInitialLocalDb();
  const raw = window.localStorage.getItem(LOCAL_DB_KEY);
  if (!raw) {
    const fresh = buildInitialLocalDb();
    window.localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(fresh));
    return fresh;
  }
  try {
    return JSON.parse(raw);
  } catch {
    const fresh = buildInitialLocalDb();
    window.localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(fresh));
    return fresh;
  }
}

function saveLocalDb(db: Record<TableId, AnyRecord[]>) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(db));
}

export function getLocalSessionEmail(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(LOCAL_SESSION_KEY);
}

export function setLocalSessionEmail(email: string | null) {
  if (typeof window === 'undefined') return;
  if (email) {
    window.localStorage.setItem(LOCAL_SESSION_KEY, email);
  } else {
    window.localStorage.removeItem(LOCAL_SESSION_KEY);
  }
}

export function isLocalMode(): boolean {
  return Boolean(getLocalSessionEmail());
}

export async function listTableRows(tableId: TableId): Promise<AnyRecord[]> {
  if (isLocalMode()) {
    const db = getLocalDb();
    return [...(db[tableId] || [])];
  }
  const sb = getSupabaseClient();
  const { data, error } = await sb.from(tableId).select('*').order('created_at');
  if (error) throw error;
  return (data as AnyRecord[]) || [];
}

export async function listAppsRef(): Promise<Array<{ id: string; name: string }>> {
  if (isLocalMode()) {
    const db = getLocalDb();
    return (db.apps || []).map((a) => ({ id: a.id, name: a.name }));
  }
  const sb = getSupabaseClient();
  const { data, error } = await sb.from('apps').select('id,name').order('name');
  if (error) throw error;
  return (data as Array<{ id: string; name: string }>) || [];
}

export async function listDueRows(): Promise<DueRow[]> {
  if (isLocalMode()) {
    const db = getLocalDb();
    const out: DueRow[] = [];
    const pushRows = (cat: string, rows: AnyRecord[]) => {
      rows.forEach((r) => {
        if (r.due_date) {
          out.push({
            cat,
            item: r.name,
            amount: r.amount ?? null,
            due_date: r.due_date,
            days_left: daysLeft(r.due_date) ?? 0,
          });
        }
      });
    };
    pushRows('الاتصالات', db.telecom_lines || []);
    pushRows('الدومينات والاستضافة', db.domains || []);
    pushRows('مزودو الخدمات', db.providers || []);
    return out.sort((a, b) => a.due_date.localeCompare(b.due_date));
  }
  const sb = getSupabaseClient();
  const { data, error } = await sb.from('v_due').select('*').order('due_date');
  if (error) throw error;
  return (data as DueRow[]) || [];
}

export async function insertTableRow(tableId: TableId, payload: Record<string, any>): Promise<void> {
  if (isLocalMode()) {
    const db = getLocalDb();
    const id = `${tableId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    db[tableId] = [...(db[tableId] || []), { id, created_at: new Date().toISOString(), ...payload }];
    saveLocalDb(db);
    return;
  }
  const sb = getSupabaseClient();
  const { error } = await sb.from(tableId).insert(payload);
  if (error) throw error;
}

export async function updateTableRow(
  tableId: TableId,
  id: string,
  payload: Record<string, any>
): Promise<void> {
  if (isLocalMode()) {
    const db = getLocalDb();
    db[tableId] = (db[tableId] || []).map((row) => (row.id === id ? { ...row, ...payload } : row));
    saveLocalDb(db);
    return;
  }
  const sb = getSupabaseClient();
  const { error } = await sb.from(tableId).update(payload).eq('id', id);
  if (error) throw error;
}

export async function deleteTableRow(tableId: TableId, id: string): Promise<void> {
  if (isLocalMode()) {
    const db = getLocalDb();
    db[tableId] = (db[tableId] || []).filter((row) => row.id !== id);
    if (tableId === 'apps') {
      db.deliverables = (db.deliverables || []).filter((d) => d.app_id !== id);
      db.team = (db.team || []).filter((t) => t.app_id !== id);
    }
    saveLocalDb(db);
    return;
  }
  const sb = getSupabaseClient();
  const { error } = await sb.from(tableId).delete().eq('id', id);
  if (error) throw error;
}
