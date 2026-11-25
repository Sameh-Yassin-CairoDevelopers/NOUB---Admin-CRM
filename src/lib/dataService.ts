import { daysLeft, getSupabaseClient } from './supabase';
import {
  MESHAWIR_RACK_DEVICES,
  MESHAWIR_RACK_PORTS,
  MESHAWIR_TASKS,
  MESHAWIR_INQUIRIES,
  VERIFICATION_MATRIX_30,
  type KnowledgeStatus,
  type RackDevice,
  type RackPort,
  type ProjectTaskItem,
  type SystemInquiryItem,
  type VerificationMatrixItem,
} from '../data/meshawirMasterData';
import type { AnyRecord, AppRecord, DeliverableRecord, DueRow, TableId } from '../types/crm';

export const APP_PASSCODE = '12345678';
export const SEED_SYNC_VERSION = '2026-11-25-v2';
const PASSCODE_UNLOCK_KEY = 'noub_crm_passcode_unlocked_v1';
const LOCAL_DB_KEY = 'noub_crm_local_db_v3';
const SEED_VERSION_KEY = 'noub_crm_seed_sync_version_v1';
const MESHAWIR_CACHE_PREFIX = 'noub_meshawir_cache_v1_';

export type ConnectionStatus = 'supabase-live' | 'hybrid-fallback';

const INITIAL_APPS: AppRecord[] = [
  {
    id: 'app-4b',
    name: '4B — تطبيق العملاء (النقل الذكي)',
    description: 'تطبيق الركاب والأولوية القصوى للإطلاق: فوري ومجدول، مزايدة حية، Add Stop متعدد المحطات، 4 فئات مركبات (النصف نقل للبضائع فقط)، و4B Prepaid Trips B2B',
    platforms: 'أندرويد · iOS · لوحة إدارة',
    start_date: '2026-06-01',
    launch_date: '2026-11-30',
    status: 'في الفترة التجريبية',
  },
  {
    id: 'app-captain',
    name: 'كابتن مشاوير (تطبيق السائقين المستقل)',
    description: 'تطبيق الكابتن المستقل عن تطبيق العملاء: استقبال الطلبات والمزايدة، التحقق الحيوي CompreFace داخل مصر، فحص GPS Integrity، والمحفظة المالية وربط LTRA',
    platforms: 'أندرويد · iOS · بوابة LTRA',
    start_date: '2026-06-01',
    launch_date: '2026-11-30',
    status: 'قيد التنفيذ',
  },
  {
    id: 'app-daro',
    name: 'DARO (دارو سوبر آب للزوار والسياح — مؤجل)',
    description: 'تطبيق شامل للزوار العرب والسياح بمصر (إقامة، سيارات، طيران داخلي بمصر فقط عبر Amadeus/EgyptAir، مطاعم، طب) — مؤجل لحين تشغيل 4B وحل عيوب Figma الـ 8',
    platforms: 'أندرويد · iOS · 6 قطاعات و5 أدوار',
    start_date: '2026-07-01',
    launch_date: '2027-02-01',
    status: 'متوقف',
  },
  {
    id: 'app-wikala',
    name: 'WeKaLa (سوق وكالة Marketplace — مؤجل)',
    description: 'سوق إلكتروني شامل (إعلانات مبوبة، بيع مباشر، مزادات، مقايضة، صفحات تجار موثقين) — مؤجل لحين تشغيل 4B وتحديد العمولات والضمان',
    platforms: 'أندرويد · iOS · صفحات تجار',
    start_date: '2026-06-15',
    launch_date: '2027-01-15',
    status: 'متوقف',
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
      const done4B = (app.id === 'app-4b' || app.id === 'app-captain') && idx < 8;
      const inProg4B = (app.id === 'app-4b' || app.id === 'app-captain') && idx >= 8 && idx < 15;
      deliverables.push({
        id: `dl-${app.id}-${idx + 1}`,
        created_at: now,
        app_id: app.id,
        stage,
        item,
        owner: done4B ? 'المهندس سامح يس' : inProg4B ? 'قيمة تك + م/ علي QA' : null,
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
      { id: 'tel-1', created_at: now, name: 'خط أرضي 1 (إنترنت WE ADSL على TP-Link ER8411 WAN1)', kind: 'أرضي', number: 'خط أرضي 1 — المعادي', service: 'مربوط فعلياً بـ TP-Link ER8411 WAN1 + Static Public IP معتمد', provider: 'المصرية للاتصالات WE', cycle: 'شهري', amount: 500 },
      { id: 'tel-2', created_at: now, name: 'خط أرضي 2 (راكب على سنترال Grandstream 604A FXO-1)', kind: 'أرضي', number: 'خط أرضي 2 — المعادي', service: 'مربوط فعلياً بـ Grandstream 604A للعملاء والكباتن', provider: 'المصرية للاتصالات WE', cycle: 'شهري', amount: 250 },
      { id: 'tel-3', created_at: now, name: 'راوتر Vodafone 5G + H153-381 (WAN2 على TP-Link ER8411)', kind: 'محمول', number: 'فاتورة 748994 + باقة 5G', service: 'إنترنت عالي السرعة مدمج مع ER8411 فعلياً', provider: 'فودافون مصر', plan: 'Vodafone 5G + باقة 520', cycle: 'شهري', amount: 750 },
      { id: 'tel-4', created_at: now, name: 'خط تجميع فايبر WE L3VPN (24Mbps + 6 فروع 4Mbps)', kind: 'أرضي', number: 'TE-CAI-4B-PRI-4821', service: 'ربط مباشر مع القرية الذكية < 5ms (PO #6078927)', provider: 'المصرية للاتصالات WE', cycle: 'ربع سنوي', amount: 90000 },
      { id: 'tel-5', created_at: now, name: 'شريحة أورنج 4G + شرائح OTP (BroadNet & Twilio)', kind: 'محمول', service: 'طوارئ الشبكة ورسائل التحقق OTP', provider: 'أورنج بيزنس / فودافون', cycle: 'شهري' },
    ],
    domains: [
      { id: 'dom-1', created_at: now, name: 'mashawer.com.eg', kind: 'دومين', provider: 'المصرية EC (م/ محمد الحلو)', start_date: '2026-08-09', cycle: 'سنوي', amount: 1254, due_date: '2027-08-09', auto_renew: false, notes: 'مطلوب التجديد لسنتين قادمتين' },
      { id: 'dom-2', created_at: now, name: 'استضافة الموقع الرئيسي Host1', kind: 'استضافة', provider: 'المصرية EC (م/ محمد الحلو)', start_date: '2026-08-11', cycle: 'سنوي', amount: 2508, due_date: '2027-08-11', auto_renew: false },
    ],
    wanted_domains: [
      { id: 'wd-1', created_at: now, name: 'mashweer.net', ext: '.net', provider: 'EC / مسجل خارجي', priority: 'عالية', status: 'محجوز', project: 'عدة تطبيقات', notes: 'مقترح تجديده مع mashawer.com.eg' },
      { id: 'wd-2', created_at: now, name: 'wikala.com.eg', ext: '.com.eg', provider: 'المصرية EC', priority: 'عالية', status: 'متاح', project: 'WIKALA', notes: 'بانتظار السجل التجاري وشهادة المنشأ (مؤجل)' },
      { id: 'wd-3', created_at: now, name: 'daro.eg', ext: '.eg', provider: 'المصرية EC', priority: 'عالية', status: 'متاح', project: 'DARO', notes: 'النطاق الرسمي لسوبر آب الزوار العرب والسياح (مؤجل)' },
    ],
    providers: [
      { id: 'prv-1', created_at: now, name: 'المصرية للاتصالات (WE Cloud & WAF)', category: 'سحابة / متاجر', site: '4B', login_url: 'https://cloud.te.eg/portal', username: 'mashweer_telecom_admin', pwd_type: 'برايفت (الماستر)', funding: 'اشتراك ثابت', amount: 201874, cycle: 'ربع سنوي', owner: 'المهندس عماد الشرقاوي + المهندس سامح يس', notes: 'PO #6078933 بإجمالي 807,496 ج.م/سنة' },
      { id: 'prv-2', created_at: now, name: 'المصرية للاتصالات (WE Fiber 24Mbps + 6x4Mbps)', category: 'أخرى', site: 'عدة تطبيقات', login_url: 'https://cloud.te.eg/portal', pwd_type: 'برايفت (الماستر)', funding: 'اشتراك ثابت', amount: 90000, cycle: 'ربع سنوي', owner: 'المهندس عماد الشرقاوي + م/ أحمد محرم', notes: 'PO #6078927 بإجمالي 360,000 ج.م/سنة' },
      { id: 'prv-3', created_at: now, name: 'Google Cloud & Maps', category: 'خرائط', site: 'عدة تطبيقات', login_url: 'https://console.cloud.google.com', username: 'admin@mashweer.com.eg', pwd_type: 'جوجل لوجن', funding: 'حسب الاستخدام', cycle: 'حسب الاستخدام', owner: 'المهندس سامح يس + أ/ هاني' },
      { id: 'prv-4', created_at: now, name: 'Cloudinary', category: 'وسائط', site: '4B', login_url: 'https://cloudinary.com', username: 'mashweer-cloud', pwd_type: 'برايفت (الماستر)', funding: 'رصيد مسبق', owner: 'المهندس سامح يس' },
      { id: 'prv-5', created_at: now, name: 'BroadNet SMS', category: 'رسائل / إشعارات', site: '4B', login_url: 'https://broadnetme.com/portal/login', username: 'mashawer', pwd_type: 'برايفت (الماستر)', funding: 'رصيد مسبق', owner: 'المهندس عماد الشرقاوي + المهندس سامح يس' },
      { id: 'prv-6', created_at: now, name: 'Twilio', category: 'رسائل / إشعارات', site: 'WIKALA', login_url: 'https://console.twilio.com', pwd_type: 'برايفت (الماستر)', funding: 'رصيد مسبق', owner: 'المهندس عماد الشرقاوي + المهندس سامح يس' },
      { id: 'prv-7', created_at: now, name: 'Fawry Enterprise', category: 'دفع', site: '4B', login_url: 'https://fawry.com', username: 'FAWRY_MERCHANT_CODE_MASHWEER', pwd_type: 'برايفت (الماستر)', funding: 'حسب الاستخدام', owner: 'أ/ هاني' },
      { id: 'prv-8', created_at: now, name: 'Supabase Cloud', category: 'قواعد بيانات', site: 'عدة تطبيقات', login_url: 'https://supabase.com/dashboard', username: 'salkyuytjvjxspxbawzg', pwd_type: 'برايفت (الماستر)', funding: 'اشتراك ثابت', owner: 'المهندس سامح يس' },
      { id: 'prv-9', created_at: now, name: 'Zoho Mail Lite (5 حسابات)', category: 'أخرى', site: 'عدة تطبيقات', login_url: 'https://mail.zoho.com', username: 'admin@mashweer.com.eg', pwd_type: 'برايفت (الماستر)', funding: 'مجاني', owner: 'المهندس عماد الشرقاوي' },
    ],
    api_keys: [
      { id: 'api-1', created_at: now, provider: 'Google Maps', service: 'Maps / Places / Directions', site: '4B', env: 'Production', key_label: '4B_SERVER_MAPS_KEY', secret_location: 'خزنة الأسرار الإدارية / .env', billing: 'حسب الاستخدام' },
      { id: 'api-2', created_at: now, provider: 'BroadNet', service: 'OTP SMS Gateway', site: '4B', env: 'Production', key_label: 'BROADNET_API_KEY', secret_location: 'خزنة الأسرار الإدارية', billing: 'رصيد مسبق' },
      { id: 'api-3', created_at: now, provider: 'Cloudinary', service: 'Signed Media Storage', site: '4B', env: 'Production', key_label: 'CLOUDINARY_API_SECRET', secret_location: 'خزنة الأسرار الإدارية', billing: 'رصيد مسبق' },
      { id: 'api-4', created_at: now, provider: 'Fawry', service: 'Payment & Wallet Webhook', site: '4B', env: 'Test', key_label: 'FAWRY_MERCHANT_CODE_MASHWEER', secret_location: 'خزنة الإدارة المالية', billing: 'حسب الاستخدام' },
    ],
    sites: [
      { id: 'site-1', created_at: now, name: 'راوتر وفايروول TP-Link ER8411 (رئيسي)', url: 'https://192.168.10.1', purpose: 'إدارة خط WE ADSL + Static Public IP + Vodafone 5G + WireGuard VPN', providers: 'مقر المعادي', pwd_type: 'برايفت (الماستر)', it_owner: 'المهندس عماد الشرقاوي' },
      { id: 'site-2', created_at: now, name: 'سنترال Grandstream UCM6304A (604A)', url: 'https://192.168.30.1:8089', purpose: 'التحويلات 100-116 وWave عن بُعد (25–30 مستخدماً عبر WireGuard VLAN 30)', providers: 'مقر المعادي', pwd_type: 'برايفت (الماستر)', it_owner: 'المهندس عماد الشرقاوي' },
      { id: 'site-3', created_at: now, name: 'بوابة WE Cloud & F5 WAF', url: 'https://cloud.te.eg/portal', purpose: 'إدارة خوادم 4B السحابية وجدار F5 WAF', providers: 'المصرية للاتصالات WE', pwd_type: 'برايفت (الماستر)', it_owner: 'المهندس عماد الشرقاوي' },
      { id: 'site-4', created_at: now, name: 'لوحة EC للنطاقات والاستضافة', url: 'https://clients.ec.com.eg/clientarea.php', purpose: 'إدارة DNS وتجديد mashawer.com.eg', providers: 'EC Egypt', pwd_type: 'برايفت (الماستر)', it_owner: 'المهندس عماد الشرقاوي' },
      { id: 'site-5', created_at: now, name: 'لوحة Proxmox VE 8.x (Z440 #1)', url: 'https://192.168.10.20:8006', purpose: 'إدارة الأجهزة الافتراضية وOPNsense المساند وخزنة الباك أب', providers: 'مقر المعادي', pwd_type: 'برايفت (الماستر)', it_owner: 'المهندس عماد الشرقاوي' },
    ],
    payments: [
      { id: 'pay-1', created_at: now, paid_on: '2026-09-26', item: 'فاتورة QTS #1169 (سيرفر Dell R640 + جهازي HP Z440)', amount: 96295.8, method: 'تحويل بنكي', ref: 'ETA #1169' },
      { id: 'pay-2', created_at: now, paid_on: '2026-06-09', item: 'فاتورة تكنو ستورز الدقي (3 أجهزة Dell + 3 شاشات HP)', amount: 39901.14, method: 'تحويل بنكي', ref: 'ETA Techno' },
      { id: 'pay-3', created_at: now, paid_on: '2026-03-29', item: 'فاتورة رد لاين البستان (كابينة راك بيرلا 27U وأدوات الشبكة)', amount: 18550, method: 'نقدي', ref: 'ETA RedLine' },
      { id: 'pay-4', created_at: now, paid_on: '2026-09-28', item: 'فاتورة QTS #1172 (سويتش سيسكو Catalyst 3850 48P)', amount: 11970, method: 'تحويل بنكي', ref: 'ETA #1172' },
      { id: 'pay-5', created_at: now, paid_on: '2026-09-28', item: 'إذن المنشاوي البستان (هاردات SAS 1.2TB و 2TB) — بانتظار الضريبية', amount: 8510, method: 'نقدي', ref: 'إذن مؤقت #001096' },
      { id: 'pay-6', created_at: now, paid_on: '2026-09-28', item: 'فاتورة فودافون صقر قريش (راوتر H153-381 والشريحة والباقة)', amount: 3326.46, method: 'نقدي', ref: '748994' },
      { id: 'pay-7', created_at: now, paid_on: '2026-03-26', item: 'فاتورة طيبة رنين (سلم 6 درجات وكراسي وترابيزة)', amount: 2951, method: 'نقدي', ref: 'ETA Tiba' },
      { id: 'pay-8', created_at: now, paid_on: '2026-08-11', item: 'فاتورة EC (تجديد استضافة Host1 حتى أغسطس 2027)', amount: 2508, method: 'تحويل بنكي', ref: 'EC #1331' },
      { id: 'pay-9', created_at: now, paid_on: '2026-08-09', item: 'فاتورة EC (تجديد نطاق mashawer.com.eg حتى أغسطس 2027)', amount: 1254, method: 'تحويل بنكي', ref: 'EC #1325' },
    ],
    apps: INITIAL_APPS.map((a) => ({ ...a, created_at: now })),
    deliverables,
    team: [
      { id: 'tm-1', created_at: now, app_id: 'app-4b', level: 'الإدارة العليا', title: 'المستشار التقني الأول ومدير فرع المعادي', person: 'المهندس عماد الشرقاوي', party: 'استشاري', job_status: 'معيّن', reports_to: 'أ/ أبو خالد', duties: 'إدارة مقر المعادي، TP-Link ER8411، السنترال 604A، WE، والربط الحكومي' },
      { id: 'tm-2', created_at: now, app_id: 'app-4b', level: 'الإدارة العليا', title: 'مدير قطاع التكنولوجيا وإدارة المشروعات الرقمية', person: 'المهندس سامح يس', party: 'شركتنا', job_status: 'معيّن', reports_to: 'أ/ أبو خالد', duties: 'الاعتماد الفني وإدارة المشروعات الرقمية والأمان والأصول التقنية (مفصول عن الاعتماد المالي)' },
      { id: 'tm-3', created_at: now, app_id: 'app-4b', level: 'الإدارة العليا', title: 'المالك والمستثمر الرئيسي', person: 'أ/ أبو خالد', party: 'شركتنا', job_status: 'معيّن', duties: 'الاعتماد الاستثماري والتعاقدي والاستراتيجي العام' },
      { id: 'tm-4', created_at: now, app_id: 'app-4b', level: 'الإدارة العليا', title: 'المدير المالي (CFO)', person: 'أ/ هاني', party: 'شركتنا', job_status: 'معيّن', reports_to: 'أ/ أبو خالد', duties: 'الإدارة المالية، فوري، الفواتير الضريبية ETA، ومطعم العجوزة' },
      { id: 'tm-5', created_at: now, app_id: 'app-4b', level: 'إدارة المنتج والمشروع', title: 'قيادة غرفة عمليات النقل الذكي', person: 'م/ موفق و م/ عمرو', party: 'شركتنا', job_status: 'معيّن', reports_to: 'المهندس عماد الشرقاوي', duties: 'تشغيل الأسطول، الكباتن، الكول سنتر، والتسعير' },
      { id: 'tm-6', created_at: now, app_id: 'app-4b', level: 'الهندسة والتطوير', title: 'شركة التطوير البرمجي', person: 'قيمة تك (ValueTech)', party: 'مقاول خارجي', job_status: 'معيّن', reports_to: 'المهندس سامح يس', duties: 'تطوير تطبيقات 4B وكابتن مشاوير ووكالة ودارو ولوحات الإدارة' },
      { id: 'tm-7', created_at: now, app_id: 'app-4b', level: 'الهندسة والتطوير', title: 'مهندس برمجيات ومساعد تقني', person: 'م/ أحمد عبيد', party: 'شركتنا', job_status: 'معيّن', reports_to: 'المهندس عماد الشرقاوي', duties: 'الدعم الهندسي المباشر وصيانة الأنظمة بالمقر' },
      { id: 'tm-8', created_at: now, app_id: 'app-4b', level: 'الجودة', title: 'مسؤول ضمان الجودة (QA)', person: 'م/ علي (QA مكتب 7)', party: 'شركتنا', job_status: 'معيّن', reports_to: 'المهندس سامح يس', duties: 'اختبار التطبيقات ومطابقة فيجما وتقارير الباجز على هواتف حقيقية' },
      { id: 'tm-9', created_at: now, app_id: 'app-4b', level: 'الأعمال والدعم', title: 'المستشار القانوني والمحامي', person: 'أ/ محمد مصطفى', party: 'استشاري', job_status: 'معيّن', reports_to: 'أ/ أبو خالد', duties: 'تراخيص LTRA، حماية الملكية الفكرية، ومراجعة العقود الرسمية' },
      { id: 'tm-10', created_at: now, app_id: 'app-4b', level: 'الأعمال والدعم', title: 'مسؤولة الموارد البشرية (HR)', person: 'أ/ سارة حسن', party: 'شركتنا', job_status: 'معيّن', reports_to: 'المهندس عماد الشرقاوي', duties: 'شؤون الموظفين، جهاز البصمة، وعهدة الأجهزة' },
      { id: 'tm-11', created_at: now, app_id: 'app-captain', level: 'الإدارة العليا', title: 'مدير قطاع التكنولوجيا وإدارة المشروعات الرقمية', person: 'المهندس سامح يس', party: 'شركتنا', job_status: 'معيّن', reports_to: 'أ/ أبو خالد', duties: 'مراجعة CompreFace وGPS Integrity Test 01 وربط LTRA' },
      { id: 'tm-12', created_at: now, app_id: 'app-wikala', level: 'الإدارة العليا', title: 'مدير قطاع التكنولوجيا وإدارة المشروعات الرقمية', person: 'المهندس سامح يس', party: 'شركتنا', job_status: 'معيّن', reports_to: 'أ/ أبو خالد', duties: 'استلام الكود والـ Keystore (التشغيل مؤجل لما بعد 4B)' },
      { id: 'tm-13', created_at: now, app_id: 'app-daro', level: 'الإدارة العليا', title: 'مدير قطاع التكنولوجيا وإدارة المشروعات الرقمية', person: 'المهندس سامح يس', party: 'شركتنا', job_status: 'معيّن', reports_to: 'أ/ أبو خالد', duties: 'إدارة حصر عيوب Figma الـ 8 (التنفيذ مؤجل لما بعد 4B)' },
    ],
  };
}

function mergeSeedRowsById(existing: AnyRecord[], seedRows: AnyRecord[]): AnyRecord[] {
  const seedMap = new Map(seedRows.map((row) => [row.id, row]));
  const seen = new Set<string>();
  const merged = existing.map((row) => {
    seen.add(row.id);
    const canonical = seedMap.get(row.id);
    if (!canonical) return row;
    // Refresh canonical metadata while keeping user status/acceptance/notes if modified
    return {
      ...canonical,
      ...row,
      name: canonical.name ?? row.name,
      description: canonical.description ?? row.description,
      platforms: canonical.platforms ?? row.platforms,
      service: canonical.service ?? row.service,
      due_date: row.due_date || canonical.due_date,
      amount: canonical.amount ?? row.amount,
    };
  });
  seedRows.forEach((seedRow) => {
    if (!seen.has(seedRow.id)) {
      merged.push(seedRow);
    }
  });
  return merged;
}

function ensureLatestSeedSync(): void {
  if (typeof window === 'undefined') return;
  const savedVersion = window.localStorage.getItem(SEED_VERSION_KEY);
  if (savedVersion === SEED_SYNC_VERSION) return;

  const fresh = buildInitialLocalDb();
  const rawDb = window.localStorage.getItem(LOCAL_DB_KEY);
  if (!rawDb) {
    window.localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(fresh));
  } else {
    try {
      const parsed = JSON.parse(rawDb) as Partial<Record<TableId, AnyRecord[]>>;
      const synced = {} as Record<TableId, AnyRecord[]>;
      (Object.keys(fresh) as TableId[]).forEach((tableId) => {
        const currentRows = Array.isArray(parsed[tableId]) ? parsed[tableId]! : [];
        synced[tableId] = mergeSeedRowsById(currentRows, fresh[tableId]);
      });
      window.localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(synced));
    } catch {
      window.localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(fresh));
    }
  }

  // Sync Meshawir canonical caches (preserve user task/verification statuses while refreshing latest descriptions & due dates)
  const syncById = <T extends { id: string }>(
    key: string,
    seed: T[],
    preserveFields: Array<keyof T> = []
  ) => {
    const storageKey = MESHAWIR_CACHE_PREFIX + key;
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      window.localStorage.setItem(storageKey, JSON.stringify(seed));
      return;
    }
    try {
      const existing = JSON.parse(raw) as T[];
      if (!Array.isArray(existing) || existing.length === 0) {
        window.localStorage.setItem(storageKey, JSON.stringify(seed));
        return;
      }
      const existingMap = new Map(existing.map((item) => [item.id, item]));
      const seedIds = new Set(seed.map((s) => s.id));
      const updatedSeed = seed.map((seedItem) => {
        const prev = existingMap.get(seedItem.id);
        if (!prev) return seedItem;
        const next = { ...seedItem };
        preserveFields.forEach((field) => {
          if (prev[field] !== undefined && prev[field] !== null && prev[field] !== '') {
            next[field] = prev[field];
          }
        });
        return next;
      });
      const customRows = existing.filter((item) => !seedIds.has(item.id));
      window.localStorage.setItem(storageKey, JSON.stringify([...updatedSeed, ...customRows]));
    } catch {
      window.localStorage.setItem(storageKey, JSON.stringify(seed));
    }
  };

  syncById<RackDevice>('rack_devices', MESHAWIR_RACK_DEVICES);
  syncById<RackPort>('rack_ports', MESHAWIR_RACK_PORTS);
  syncById<ProjectTaskItem>('project_tasks', MESHAWIR_TASKS, ['status']);
  syncById<SystemInquiryItem>('system_inquiries', MESHAWIR_INQUIRIES, ['answered', 'answer']);
  syncById<VerificationMatrixItem>('verification_30', VERIFICATION_MATRIX_30, [
    'status',
    'verificationNote',
  ]);

  window.localStorage.setItem(SEED_VERSION_KEY, SEED_SYNC_VERSION);
}

export function forceSyncCachesWithLatestSeed(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(SEED_VERSION_KEY);
  ensureLatestSeedSync();
}

function getLocalDb(): Record<TableId, AnyRecord[]> {
  if (typeof window === 'undefined') return buildInitialLocalDb();
  ensureLatestSeedSync();
  const raw = window.localStorage.getItem(LOCAL_DB_KEY);
  if (!raw) {
    const fresh = buildInitialLocalDb();
    window.localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(fresh));
    return fresh;
  }
  try {
    const parsed = JSON.parse(raw) as Record<TableId, AnyRecord[]>;
    return parsed;
  } catch {
    const fresh = buildInitialLocalDb();
    window.localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(fresh));
    return fresh;
  }
}

export function getFullLocalSnapshot(): {
  crmDb: Record<TableId, AnyRecord[]>;
  meshawirTasks: ProjectTaskItem[];
  rackDevices: RackDevice[];
  rackPorts: RackPort[];
  verification30: VerificationMatrixItem[];
} {
  return {
    crmDb: getLocalDb(),
    meshawirTasks: readMeshawirCache<ProjectTaskItem>('project_tasks', MESHAWIR_TASKS),
    rackDevices: readMeshawirCache<RackDevice>('rack_devices', MESHAWIR_RACK_DEVICES),
    rackPorts: readMeshawirCache<RackPort>('rack_ports', MESHAWIR_RACK_PORTS),
    verification30: readMeshawirCache<VerificationMatrixItem>('verification_30', VERIFICATION_MATRIX_30),
  };
}

function saveLocalDb(db: Record<TableId, AnyRecord[]>) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(db));
}

export function isPasscodeUnlocked(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(PASSCODE_UNLOCK_KEY) === '1';
}

export function unlockWithPasscode(code: string): boolean {
  if (code.trim() !== APP_PASSCODE) return false;
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(PASSCODE_UNLOCK_KEY, '1');
  }
  return true;
}

export function lockWorkspace(): void {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(PASSCODE_UNLOCK_KEY);
  }
}

export async function testDirectSupabaseConnection(): Promise<{
  connected: boolean;
  liveTablesCount: number;
  meshawirReady: boolean;
}> {
  try {
    const sb = getSupabaseClient();
    const [{ error: crmErr }, { error: meshErr }] = await Promise.all([
      sb.from('apps').select('id').limit(1),
      sb.from('meshawir_rack_devices').select('id').limit(1),
    ]);
    return {
      connected: !crmErr,
      liveTablesCount: !crmErr ? 10 : 0,
      meshawirReady: !meshErr,
    };
  } catch {
    return { connected: false, liveTablesCount: 0, meshawirReady: false };
  }
}

export async function listTableRows(tableId: TableId): Promise<AnyRecord[]> {
  const localRows = getLocalDb()[tableId] || [];
  try {
    const sb = getSupabaseClient();
    const { data, error } = await sb.from(tableId).select('*').order('created_at');
    if (!error && Array.isArray(data) && data.length > 0) {
      const db = getLocalDb();
      db[tableId] = data as AnyRecord[];
      saveLocalDb(db);
      return data as AnyRecord[];
    }
  } catch {
    // Fallback cleanly to local seeded rows when table isn't created yet or RLS blocks anon
  }
  return [...localRows];
}

export async function listAppsRef(): Promise<Array<{ id: string; name: string }>> {
  const rows = await listTableRows('apps');
  return rows.map((a) => ({ id: a.id, name: a.name }));
}

export async function listDueRows(): Promise<DueRow[]> {
  try {
    const sb = getSupabaseClient();
    const { data, error } = await sb.from('v_due').select('*').order('due_date');
    if (!error && Array.isArray(data) && data.length > 0) {
      return data as DueRow[];
    }
  } catch {
    // Fallback to computing due rows from local cache
  }
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

export async function insertTableRow(tableId: TableId, payload: Record<string, any>): Promise<void> {
  const db = getLocalDb();
  const localId = `${tableId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const row = { id: localId, created_at: new Date().toISOString(), ...payload };
  db[tableId] = [...(db[tableId] || []), row];
  saveLocalDb(db);

  try {
    const sb = getSupabaseClient();
    await sb.from(tableId).insert(payload);
  } catch {
    // Saved locally even if Supabase table needs SQL unlock
  }
}

export async function updateTableRow(
  tableId: TableId,
  id: string,
  payload: Record<string, any>
): Promise<void> {
  const db = getLocalDb();
  db[tableId] = (db[tableId] || []).map((row) => (row.id === id ? { ...row, ...payload } : row));
  saveLocalDb(db);

  try {
    const sb = getSupabaseClient();
    await sb.from(tableId).update(payload).eq('id', id);
  } catch {
    // Local cache already updated
  }
}

export async function deleteTableRow(tableId: TableId, id: string): Promise<void> {
  const db = getLocalDb();
  db[tableId] = (db[tableId] || []).filter((row) => row.id !== id);
  if (tableId === 'apps') {
    db.deliverables = (db.deliverables || []).filter((d) => d.app_id !== id);
    db.team = (db.team || []).filter((t) => t.app_id !== id);
  }
  saveLocalDb(db);

  try {
    const sb = getSupabaseClient();
    await sb.from(tableId).delete().eq('id', id);
  } catch {
    // Local cache already updated
  }
}

// ---------- Meshawir Direct Supabase + Persistent Cache Helpers ----------

function readMeshawirCache<T>(key: string, fallback: T[]): T[] {
  if (typeof window === 'undefined') return fallback;
  ensureLatestSeedSync();
  try {
    const raw = window.localStorage.getItem(MESHAWIR_CACHE_PREFIX + key);
    if (!raw) {
      window.localStorage.setItem(MESHAWIR_CACHE_PREFIX + key, JSON.stringify(fallback));
      return fallback;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function writeMeshawirCache<T>(key: string, rows: T[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(MESHAWIR_CACHE_PREFIX + key, JSON.stringify(rows));
}

export async function loadRackDevices(): Promise<RackDevice[]> {
  const cached = readMeshawirCache<RackDevice>('rack_devices', MESHAWIR_RACK_DEVICES);
  try {
    const sb = getSupabaseClient();
    const { data, error } = await sb
      .from('meshawir_rack_devices')
      .select('*')
      .order('u_position_start', { ascending: false });
    if (!error && Array.isArray(data) && data.length > 0) {
      writeMeshawirCache('rack_devices', data as RackDevice[]);
      return data as RackDevice[];
    }
  } catch {
    // fallback to pre-seeded Perla 27U devices
  }
  return cached;
}

export async function loadRackPorts(): Promise<RackPort[]> {
  const cached = readMeshawirCache<RackPort>('rack_ports', MESHAWIR_RACK_PORTS);
  try {
    const sb = getSupabaseClient();
    const { data, error } = await sb
      .from('meshawir_rack_ports')
      .select('*')
      .order('port_number', { ascending: true });
    if (!error && Array.isArray(data) && data.length > 0) {
      writeMeshawirCache('rack_ports', data as RackPort[]);
      return data as RackPort[];
    }
  } catch {
    // fallback to pre-seeded ports
  }
  return cached;
}

export async function saveRackPortUpdate(port: RackPort): Promise<RackPort[]> {
  const current = readMeshawirCache<RackPort>('rack_ports', MESHAWIR_RACK_PORTS);
  const exists = current.some((p) => p.id === port.id);
  const next = exists ? current.map((p) => (p.id === port.id ? port : p)) : [...current, port];
  writeMeshawirCache('rack_ports', next);

  try {
    const sb = getSupabaseClient();
    await sb.from('meshawir_rack_ports').upsert(port, { onConflict: 'id' });
  } catch {
    // cached locally
  }
  return next;
}

export async function addRackDeviceItem(device: RackDevice): Promise<RackDevice[]> {
  const current = readMeshawirCache<RackDevice>('rack_devices', MESHAWIR_RACK_DEVICES);
  const next = [device, ...current].sort((a, b) => b.u_position_start - a.u_position_start);
  writeMeshawirCache('rack_devices', next);

  try {
    const sb = getSupabaseClient();
    await sb.from('meshawir_rack_devices').upsert(device, { onConflict: 'id' });
  } catch {
    // cached locally
  }
  return next;
}

function mergeTaskDueDates(rows: ProjectTaskItem[]): ProjectTaskItem[] {
  const seedDueById = new Map(MESHAWIR_TASKS.map((t) => [t.id, t.due_date]));
  return rows.map((t) => ({
    ...t,
    due_date: t.due_date || seedDueById.get(t.id),
  }));
}

export async function loadMeshawirTasks(): Promise<ProjectTaskItem[]> {
  const cached = mergeTaskDueDates(readMeshawirCache<ProjectTaskItem>('project_tasks', MESHAWIR_TASKS));
  try {
    const sb = getSupabaseClient();
    const { data, error } = await sb
      .from('project_tasks')
      .select('*')
      .order('task_number', { ascending: true });
    if (!error && Array.isArray(data) && data.length > 0) {
      const merged = mergeTaskDueDates(data as ProjectTaskItem[]);
      writeMeshawirCache('project_tasks', merged);
      return merged;
    }
  } catch {
    // fallback
  }
  return cached;
}

export async function updateMeshawirTaskStatus(id: string, status: string): Promise<ProjectTaskItem[]> {
  const current = readMeshawirCache<ProjectTaskItem>('project_tasks', MESHAWIR_TASKS);
  const next = current.map((t) => (t.id === id ? { ...t, status } : t));
  writeMeshawirCache('project_tasks', next);

  try {
    const sb = getSupabaseClient();
    await sb.from('project_tasks').update({ status }).eq('id', id);
  } catch {
    // cached locally
  }
  return next;
}

export async function loadSystemInquiries(): Promise<SystemInquiryItem[]> {
  const cached = readMeshawirCache<SystemInquiryItem>('system_inquiries', MESHAWIR_INQUIRIES);
  try {
    const sb = getSupabaseClient();
    const { data, error } = await sb.from('system_inquiries').select('*').order('id');
    if (!error && Array.isArray(data) && data.length > 0) {
      writeMeshawirCache('system_inquiries', data as SystemInquiryItem[]);
      return data as SystemInquiryItem[];
    }
  } catch {
    // fallback
  }
  return cached;
}

export async function answerSystemInquiry(id: string, answer: string): Promise<SystemInquiryItem[]> {
  const current = readMeshawirCache<SystemInquiryItem>('system_inquiries', MESHAWIR_INQUIRIES);
  const next = current.map((q) => (q.id === id ? { ...q, answered: true, answer } : q));
  writeMeshawirCache('system_inquiries', next);

  try {
    const sb = getSupabaseClient();
    await sb.from('system_inquiries').update({ answered: true, answer }).eq('id', id);
  } catch {
    // cached locally
  }
  return next;
}

export async function loadVerificationMatrix(): Promise<VerificationMatrixItem[]> {
  const cached = readMeshawirCache<VerificationMatrixItem>('verification_30', VERIFICATION_MATRIX_30);
  try {
    const sb = getSupabaseClient();
    const { data, error } = await sb
      .from('meshawir_verification_checks')
      .select('*')
      .order('num', { ascending: true });
    if (!error && Array.isArray(data) && data.length > 0) {
      const mapped: VerificationMatrixItem[] = data.map((row: any) => ({
        id: row.id,
        num: Number(row.num),
        category: row.category,
        title: row.title,
        status: row.status as KnowledgeStatus,
        contextNote: row.context_note ?? row.contextNote ?? '',
        verificationNote: row.verification_note ?? row.verificationNote ?? '',
      }));
      writeMeshawirCache('verification_30', mapped);
      return mapped;
    }
  } catch {
    // fallback to seeded 30-point verification matrix
  }
  return cached;
}

export async function updateVerificationItem(
  id: string,
  status: KnowledgeStatus,
  verificationNote?: string
): Promise<VerificationMatrixItem[]> {
  const current = readMeshawirCache<VerificationMatrixItem>('verification_30', VERIFICATION_MATRIX_30);
  const next = current.map((v) =>
    v.id === id
      ? {
          ...v,
          status,
          verificationNote: verificationNote !== undefined ? verificationNote : v.verificationNote,
        }
      : v
  );
  writeMeshawirCache('verification_30', next);

  const target = next.find((v) => v.id === id);
  if (target) {
    try {
      const sb = getSupabaseClient();
      await sb.from('meshawir_verification_checks').upsert(
        {
          id: target.id,
          num: target.num,
          category: target.category,
          title: target.title,
          status: target.status,
          context_note: target.contextNote,
          verification_note: target.verificationNote,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
    } catch {
      // cached locally
    }
  }
  return next;
}

