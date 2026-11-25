export interface PortalAccount {
  id: number;
  service: string;
  url: string;
  username: string;
  contact: string;
  handoverDetails: string;
}

export interface EmailAccountItem {
  id: number;
  email: string;
  role: string;
  quota: string;
  status: string;
}

export interface PbxExtension {
  ext: string;
  department: string;
  location: string;
  notes: string;
}

export interface RackAsset {
  device: string;
  location: string;
  ip: string;
  credentialsScope: string;
}

export interface HandoverChecklistStep {
  id: string;
  title: string;
  detail: string;
}

export const HANDOVER_PHASES = [
  {
    phase: 'المرحلة الأولى',
    title: 'نقل الهوية والمصادقة الثنائية 2FA',
    detail:
      'إضافة رقم هاتف م/ عماد الشرقاوي وبريده المؤسسي كرقم استرداد ومصادقة ثنائية ثانوية قبل نقل كلمات المرور عبر خزنة مشفرة (Bitwarden / 1Password).',
  },
  {
    phase: 'المرحلة الثانية',
    title: 'التسليم الفيزيائي والميداني بمقر المعادي',
    detail:
      'جولة استلام بالعين داخل غرفة السيرفرات، كابينة الراك 27U، مخارج السقف المعلق، السنترال الجراند ستريم، مسجل الكاميرات، وجهاز البصمة وتسليم المفاتيح.',
  },
  {
    phase: 'المرحلة الثالثة',
    title: 'التسليم الشبكي والسحابي مع WE والمزودين',
    detail:
      'تفعيل حساب SSL VPN الخاص بـ م/ عماد وتجربة الدخول الفعلي على سيرفرات السحابة وOPNsense وProxmox وiDRAC9 وإبلاغ جهات الاتصال الرسمية.',
  },
  {
    phase: 'المرحلة الرابعة',
    title: 'اختبار التشغيل المستقل لمدة 48 ساعة + محضر الاستلام',
    detail:
      'إدارة المقر والاتصالات والدعم والسنترال لمدة يومين كاملين بشكل مستقل تماماً، وإغلاق أي ثغرة صلاحيات قبل توقيع محضر الاستلام.',
  },
];

export const PORTAL_ACCOUNTS: PortalAccount[] = [
  {
    id: 1,
    service: 'لوحة تحكم النطاقات والاستضافة (EC Egypt)',
    url: 'https://clients.ec.com.eg/clientarea.php',
    username: 'mashawer_admin / بريد الإدارة',
    contact: 'م/ محمد الحلو (01551553434 / info@ec.com.eg)',
    handoverDetails: 'باسورد الكلاينت إيريا + صلاحية تعديل DNS وتجديد mashawer.com.eg واستضافة Host1',
  },
  {
    id: 2,
    service: 'لوحة استضافة الموقع (cPanel)',
    url: 'https://cpanel.mashawer.com.eg:2083',
    username: 'mashawer_admin',
    contact: 'م/ محمد الحلو (EC)',
    handoverDetails: 'باسورد cPanel الكامل + مفاتيح SSL + قواعد بيانات الموقع التعريفي',
  },
  {
    id: 3,
    service: 'إيميلات الشركة الرسمية (Zoho Mail / Webmail)',
    url: 'https://mail.zoho.com',
    username: 'الإيميلات الـ 5 المعتمدة (بديل: mashawer.com.eg:2096)',
    contact: 'م/ محمد الحلو (EC)',
    handoverDetails: 'باسورد Zoho Super Admin + كلمات مرور الـ 5 حسابات الفعالة',
  },
  {
    id: 4,
    service: 'بوابة سحابة المصرية للاتصالات (WE Cloud)',
    url: 'https://cloud.te.eg/portal',
    username: 'mashweer_telecom_admin',
    contact: 'م/ أحمد غريب (01000000009 / cloud-sales@te.eg) وم/ أحمد محرم',
    handoverDetails: 'باسورد البورتال + صلاحيات الخوادم الـ 3 + F5 WAF + أوامر الشراء 6078927 و6078933',
  },
  {
    id: 5,
    service: 'نفق الوصول الآمن لـ WE (SSL VPN)',
    url: 'بوابة FortiClient / SSL VPN (PO 6078933)',
    username: '7 حسابات SSL VPN للمديرين والمطورين',
    contact: 'م/ أحمد محرم وم/ أحمد غريب (WE)',
    handoverDetails: 'ملف العميل + بيانات الـ 7 رخص وتفعيل رخصة م/ عماد وتوثيق توزيع الـ 6 الباقية',
  },
  {
    id: 6,
    service: 'بوابة الرسائل النصية المحلية (BroadNet SMS)',
    url: 'https://broadnetme.com/portal/login',
    username: 'mashawer (Sender ID: GoRide / Mashawer)',
    contact: 'مهندسة الدعم الفني بـ BroadNet',
    handoverDetails: 'باسورد البورتال + مفتاح API + أرقام شرائح فودافون للـ OTP وشحن الرصيد',
  },
  {
    id: 7,
    service: 'بوابة الرسائل الاحتياطية والدولية (Twilio)',
    url: 'https://console.twilio.com',
    username: 'الحساب المسجل بشريحة تويليو (لوكالة ودارو)',
    contact: 'م/ سامح ياسين (يُسلم لـ م/ عماد)',
    handoverDetails: 'البريد والباسورد + تغيير رقم 2FA + Account SID وAuth Token',
  },
  {
    id: 8,
    service: 'بوابة الدفع الإلكتروني (Fawry Enterprise)',
    url: 'https://fawry.com',
    username: 'FAWRY_MERCHANT_CODE_MASHWEER',
    contact: 'أ/ هاني + مدير حساب فوري',
    handoverDetails: 'بيانات دخول التجار لمتابعة تحصيل الرحلات وصرف مستحقات الكباتن ومفاتيح الإنتاج',
  },
  {
    id: 9,
    service: 'منصة خرائط جوجل (Google Cloud & Maps)',
    url: 'https://console.cloud.google.com',
    username: 'admin@mashweer.com.eg',
    contact: 'الإدارة التقنية والمالية (فيزا الشركة)',
    handoverDetails: 'باسورد الحساب المؤسسي + إدارة الفوترة وتقييد Server/Web Keys وحدود الميزانية',
  },
  {
    id: 10,
    service: 'مخزن الصور والرخص المشفر (Cloudinary)',
    url: 'https://cloudinary.com',
    username: 'mashweer-cloud (admin@mashweer.com.eg)',
    contact: 'الإدارة التقنية',
    handoverDetails: 'باسورد الحساب + API Key وAPI Secret للروابط المؤقتة المشفرة لصور الرخص',
  },
  {
    id: 11,
    service: 'قاعدة البيانات السحابية (Supabase Cloud)',
    url: 'https://supabase.com/dashboard',
    username: 'mashweer-db.supabase.co',
    contact: 'الإدارة التقنية',
    handoverDetails: 'باسورد الحساب + Project URL وService Role / Anon Keys وسياسات الأمان RLS',
  },
  {
    id: 12,
    service: 'مستودعات الأكواد البرمجية (GitHub)',
    url: 'https://github.com/mashweer',
    username: 'منظمة mashweer (4B, WeKaLa, Daro, Maadi Infra)',
    contact: 'المطورون وم/ سامح ياسين',
    handoverDetails: 'منح صلاحية Owner للمهندس عماد الشرقاوي + التأكد من استلام مفاتيح التوقيع Keystore',
  },
  {
    id: 13,
    service: 'تصاميم واجهات التطبيقات (Figma)',
    url: 'https://figma.com (4B - WeKaLa - Daro)',
    username: 'حساب المكتب الهندسي',
    contact: 'م/ سامح ياسين وشركة قيمة تك',
    handoverDetails: 'صلاحية Can Edit / Admin على ملفات فيجما الثلاثة للمراجعة والمطابقة',
  },
  {
    id: 14,
    service: 'خطوط الإنترنت الاحتياطية (فودافون وأورنج)',
    url: 'http://192.168.8.1',
    username: 'راوتر فودافون H153-381 (فاتورة 748994) + شريحة أورنج 4G',
    contact: 'فودافون صقر قريش / أورنج بيزنس',
    handoverDetails: 'باسورد إدارة الراوترات + أرقام الشرائح والخطوط الأرضية لسداد الباقات ومتابعة الأعطال',
  },
];

export const ZOHO_EMAILS: EmailAccountItem[] = [
  {
    id: 1,
    email: 'admin@mashweer.com.eg',
    role: 'الإدارة العامة والتحكم بالأنظمة والخوادم والشبكات',
    quota: '10 GB',
    status: 'نشط — يستلمه م/ عماد لإدارة السحابة والموردين',
  },
  {
    id: 2,
    email: 'support@mashweer.com.eg',
    role: 'الدعم الفني وخدمة العملاء (بلاغات 4B ووكالة ودارو)',
    quota: '5 GB',
    status: 'نشط — لمشرفي الكول سنتر تحت إشراف م/ عماد وعمرو وموفق',
  },
  {
    id: 3,
    email: 'info@mashweer.com.eg',
    role: 'المعلومات والاستفسارات العامة والشركاء والموقع الرسمي',
    quota: '5 GB',
    status: 'نشط — لإدارة المقر والاستقبال',
  },
  {
    id: 4,
    email: 'operation@mashweer.com.eg',
    role: 'إدارة العمليات والتشغيل الميداني للرحلات والكباتن',
    quota: '5 GB',
    status: 'نشط — مخصص لقيادة العمليات (م/ موفق وم/ عمرو)',
  },
  {
    id: 5,
    email: 'finance@mashweer.com.eg',
    role: 'الإدارة المالية والفواتير وبوابات الدفع والتسويات',
    quota: '5 GB',
    status: 'نشط — مخصص للأستاذ هاني (CFO)',
  },
  {
    id: 6,
    email: 'hr@mashweer.com.eg',
    role: 'الموارد البشرية (أ/ سارة حسن)',
    quota: '—',
    status: 'ملغي ومستبعد للاكتفاء بالباقة المجانية (5 حسابات)',
  },
];

export const PBX_EXTENSIONS: PbxExtension[] = [
  { ext: '100', department: 'الاستقبال والفاكس', location: 'خط أنالوج FXS-1', notes: 'يعمل مباشرة حتى عند انقطاع الشبكة' },
  { ext: '101 - 102', department: 'الإدارة التقنية ومدير الفرع', location: 'مكتب 5 (م/ عماد وم/ سامح)', notes: 'Grandstream GRP2614 PoE' },
  { ext: '103', department: 'الإدارة المالية', location: 'مكتب 2/3 (أ/ هاني)', notes: 'Grandstream GRP2614 PoE' },
  { ext: '104', department: 'الشؤون القانونية', location: 'مكتب 4/6 (أ/ محمد مصطفى)', notes: 'Grandstream GRP2614 PoE' },
  { ext: '105 - 106', department: 'قيادة عمليات 4B', location: 'مكتب العمليات (م/ موفق وم/ عمرو)', notes: 'Grandstream GRP2614 PoE' },
  { ext: '107 - 111', department: 'الكول سنتر وخدمة العملاء (5 مقاعد)', location: 'القاعة المفتوحة', notes: 'طابور المكالمات Call Queue' },
  { ext: '112 - 116', department: 'تحويلات احتياطية', location: 'الاجتماعات / HR / البرمجة QA (مكتب 7)', notes: 'قابلة للتوسع' },
];

export const RACK_ASSETS: RackAsset[] = [
  { device: 'Dell PowerEdge R640', location: 'راك U24 (Gi1/0/25..28)', ip: '192.168.10.10', credentialsScope: 'باسورد Ubuntu / Root + مفتاح SSH' },
  { device: 'وحدة التحكم عن بعد iDRAC9', location: 'منفذ مستقل (Gi1/0/29)', ip: 'https://192.168.10.9:443', credentialsScope: 'root + باسورد iDRAC لإدارة الباور عن بعد' },
  { device: 'HP Z440 #1 (Proxmox VE)', location: 'رف U22 (Gi1/0/30..32)', ip: 'https://192.168.10.20:8006', credentialsScope: 'باسورد Proxmox + صلاحيات VMs وDocker' },
  { device: 'HP Z440 #2 (المراقبة والعمليات)', location: 'غرفة 5 (3 شاشات HP)', ip: 'وصول محلي مباشر', credentialsScope: 'حساب الدخول للويندوز/اللينكس وشاشات المراقبة' },
  { device: 'Cisco Catalyst 3850 (48P)', location: 'راك U26 (أعلى الراك)', ip: '192.168.10.1 / .2 (SSH:22)', credentialsScope: 'باسورد الدخول + enable secret + ملف 6 VLANs' },
  { device: 'OPNsense Firewall / Netgate', location: 'راك U18 / VM', ip: 'https://192.168.10.1:443', credentialsScope: 'باسورد المدير + عزل VLANs + قواعد Failover' },
  { device: 'Grandstream UCM IP PBX', location: 'راك U19 (Gi1/0/13)', ip: 'https://192.168.30.1:8089', credentialsScope: 'admin + PIN الشاشة + Admin Password للعِدد' },
  { device: 'Hikvision NVR 16ch (4TB)', location: 'راك U20 (Gi1/0/17)', ip: '192.168.20.100:8000', credentialsScope: 'باسورد admin + رمز Hik-Connect للموبايل' },
  { device: 'HP LaserJet M404n', location: 'مكتب 5 (PP1-07)', ip: '192.168.10.45', credentialsScope: 'باسورد الويب للطابعة وتعريفات الشبكة' },
  { device: 'Ubiquiti UniFi AP', location: 'سقف الصالة والاستقبال', ip: '192.168.10.150', credentialsScope: 'UniFi Controller + شبكة الموظفين والضيوف' },
  { device: 'ZKTeco Biometric (البصمة)', location: 'مدخل المقر بالمعادي', ip: '192.168.10.88:4370', credentialsScope: 'باسورد المدير + برنامج سحب الحضور مع HR' },
];

export const WE_CLOUD_SERVERS = [
  {
    name: '4B-App-Server',
    specs: '4 vCPU · 8 GB RAM · 40 GB SSD · Ubuntu LTS',
    role: 'API (3000) + لوحة الأدمن admin.4b.com.eg (3001) + Worker + CompreFace (قانون 151/2018)',
  },
  {
    name: '4B-DB-Server',
    specs: '4 vCPU · 8 GB RAM · 100 GB SSD · PostgreSQL 16 + PostGIS 3.4',
    role: 'قاعدة البيانات الجغرافية الحية لتوجيه الرحلات وحساب المسافات',
  },
  {
    name: '4B-Cache-Server',
    specs: '2 vCPU · 2 GB RAM · 20 GB SSD · Redis 7',
    role: 'إحداثيات الكباتن الحية وطوابير المهام اللحظية',
  },
  {
    name: 'F5 WAF (4B-VS) + SSL VPN',
    specs: 'PO #6078933 (807,496 ج.م/سنة) + PO #6078927 (360,000 ج.م/سنة)',
    role: 'HTTPS (443) فقط + 7 رخص SSL VPN + خط أساسي TE-CAI-4B-PRI-4821 (10.10.40.10) + احتياطي DR (10.10.40.11)',
  },
];

export const HANDOVER_CHECKLIST: HandoverChecklistStep[] = [
  {
    id: 'chk-1',
    title: 'تجربة الدخول من جهاز م/ عماد وتفعيل 2FA على رقمه',
    detail: 'الدخول على WE وEC/cPanel وZoho وGitHub وSupabase وProxmox وiDRAC9 وOPNsense وسيسكو وNVR والسنترال.',
  },
  {
    id: 'chk-2',
    title: 'اختبار ربط SSL VPN بالقرية الذكية',
    detail: 'الاتصال بنفق FortiClient / SSL VPN والتحقق من الوصول لخوادم 4B السحابية الثلاثة.',
  },
  {
    id: 'chk-3',
    title: 'مكالمة اختبار على السنترال Grandstream UCM',
    detail: 'اتصال خارجي على الخط الأرضي، سماع IVR، التحويل لعدة GRP2614، وتسجيل المكالمة والاستماع لها.',
  },
  {
    id: 'chk-4',
    title: 'تسليم العهدة المادية ومفاتيح الغرفة المصفحة',
    detail: 'مفاتيح غرفة السيرفرات + مفاتيح راك 27U + عقود WE وفواتير QTS/RedLine/Techno/الأصدقاء.',
  },
  {
    id: 'chk-5',
    title: 'إرسال إيميل انتقال الصلاحية الرسمي من admin@mashweer.com.eg',
    detail: 'إخطار أبو خالد، أ/ هاني، المحامي، موفق، عمرو، أحمد عبيد، سارة حسن، مهندسي WE، علي الأصدقاء، ومحمد الحلو EC.',
  },
];
