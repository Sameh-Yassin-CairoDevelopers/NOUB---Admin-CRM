export type KnowledgeStatus = 'مؤكد' | 'قيد التنفيذ' | 'مؤجل' | 'مقترح' | 'يحتاج تحققاً';

export interface MeshawirProject {
  id: string;
  enterprise_id: string;
  name: string;
  code: string;
  category: string;
  status: string;
  knowledge_status: KnowledgeStatus;
  priority_tier: string;
  figma_completion_pct: number;
  description: string;
  repo_url: string;
  figma_url: string;
  live_url: string;
  apk_files: Array<{
    id: string;
    version: string;
    buildNumber: number;
    fileName: string;
    fileSize: string;
    status: string;
  }>;
  context_hints: string[];
  db_info: { engine?: string; tables?: string[] };
}

export interface MeshawirMilestone {
  id: string;
  project_id: string;
  phase_code: string;
  title: string;
  target_date: string;
  completion_percentage: number;
  status: string;
  deliverables_summary: string;
  sign_off_by: string;
}

export interface MeshawirTeamProfile {
  id: string;
  full_name: string;
  short_name: string;
  title: string;
  category: string;
  efficiency_rate: number;
  email: string;
  phone: string;
  role_description: string;
  readiness_status: string;
  priority_order: number;
}

export interface MeshawirServiceProvider {
  id: string;
  name: string;
  category: string;
  portal_url: string;
  username: string;
  account_manager: string;
  contact_phone: string;
  contact_email: string;
  status: string;
  cost_or_plan: string;
  official_badge: string;
  active_services: string[];
}

export interface RackDevice {
  id: string;
  rack_id: string;
  name: string;
  arabic_name: string;
  model: string;
  manufacturer: string;
  u_position_start: number;
  u_height: number;
  device_category: 'patch_panel' | 'switch' | 'server' | 'spacer' | 'nvr' | 'pbx' | 'firewall' | 'pdu';
  serial_number: string;
  ip_management: string;
  mac_address: string;
  power_watts: number;
  operating_temp_c: number;
  status: 'online' | 'standby' | 'offline';
  notes: string;
}

export interface RackPort {
  id: string;
  device_id: string;
  port_number: number;
  label: string;
  status: 'active' | 'standby' | 'free';
  connected_device: string;
  device_type: string;
  user_endpoint: string;
  ip_address: string;
  mac_address: string;
  vlan_name: string;
  vlan_id: number;
  speed_duplex: string;
  poe_watts: number;
  cable_color: string;
  patch_panel_cross_port: number | null;
  notes: string;
}

export interface LeasedLineItem {
  id: string;
  circuit_reference: string;
  provider_name: string;
  service_type: string;
  bandwidth_mbps: number;
  source_endpoint: string;
  destination_endpoint: string;
  primary_gateway_ip: string;
  backup_gateway_ip: string;
  monthly_cost_egp: number;
  contract_ref: string;
  status: string;
  notes: string;
}

export interface CctvCameraItem {
  id: string;
  camera_number: number;
  model: string;
  location_in_office: string;
  nvr_channel: number;
  ip_address: string;
  switch_port: number;
  has_audio_mic: boolean;
  status: string;
}

export interface VoipExtensionItem {
  id: string;
  extension_number: string;
  user_name: string;
  department: string;
  device_model: string;
  ip_address: string;
  switch_port: number;
  vlan_id: number;
  status: string;
}

export interface MeshawirQuotationItem {
  id: string;
  provider_id: string;
  quote_number: string;
  title: string;
  submission_date: string;
  subtotal_egp: number;
  vat_egp: number;
  total_egp: number;
  is_tax_invoice: boolean;
  eta_uuid: string | null;
  status: string;
}

export interface FacilityZoneItem {
  id: string;
  zone_name: string;
  allocated_purpose: string;
  dimensions_text: string;
  capacity_people: number;
  workstation_ports_count: number;
  cctv_cameras_count: number;
  assigned_staff: string;
  notes: string;
}

export interface HardwareInventoryItem {
  id: string;
  name: string;
  role: string;
  specs: string;
  location: string;
  invoice_ref: string;
  vendor: string;
  status: string;
}

export interface LegalDossierItem {
  id: string;
  dossier_title: string;
  authority_name: string;
  case_reference: string;
  lead_counsel: string;
  status: string;
  action_required: string;
}

export interface ProjectTaskItem {
  id: string;
  task_number: number;
  project_id: string;
  category: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  assigned_to: string;
  due_date?: string;
}

export interface SystemInquiryItem {
  id: string;
  question: string;
  context: string;
  category: string;
  urgency: string;
  options: string[];
  answered: boolean;
  answer: string | null;
}

export interface VlanDefinition {
  id: number;
  groupKey: string;
  name: string;
  colorHex: string;
  badgeClass: string;
}

export const VLAN_DEFINITIONS: VlanDefinition[] = [
  { id: 10, groupKey: '10', name: 'VLAN 10 إدارة وموظفون', colorHex: '#3b82f6', badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  { id: 15, groupKey: '15', name: 'VLAN 15 كول سنتر', colorHex: '#6366f1', badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
  { id: 20, groupKey: '20', name: 'VLAN 20 كاميرات CCTV', colorHex: '#a855f7', badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  { id: 30, groupKey: '30', name: 'VLAN 30 سنترال VoIP', colorHex: '#22c55e', badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  { id: 40, groupKey: '40', name: 'VLAN 40 واي فاي', colorHex: '#e2e8f0', badgeClass: 'bg-slate-500/20 text-slate-200 border-slate-400/40' },
  { id: 50, groupKey: '50', name: 'VLAN 50 سيرفرات', colorHex: '#06b6d4', badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  { id: 90, groupKey: '90-92', name: 'VLAN 90-92 خطوط WE و4B', colorHex: '#f59e0b', badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  { id: 99, groupKey: '99', name: 'VLAN 99 إدارة معزولة', colorHex: '#ef4444', badgeClass: 'bg-red-500/20 text-red-300 border-red-500/40' },
];

export const MESHAWIR_ENTERPRISE = {
  id: 'ent-mashawer',
  name: 'مشاوير للمنصات الرقمية',
  legal_name: 'شركة مشاوير للمنصات الرقمية وخدمات النقل الذكي ذ.م.م',
  commercial_register: '757315518',
  tax_number: '662709268',
  duns_number_status: 'قيد الاستخراج والتحديث (يحتاج تحققاً من الإتمام الفعلي)',
  headquarters_address: 'مدينة المعراج بجوار كارفور المعادي، قسم المعادي، القاهرة (25.91م × 20.94م)',
  ceo_name: 'أبو خالد',
  branch_manager_name: 'المهندس عماد الشرقاوي',
  cto_name: 'المهندس سامح يس',
  cto_role_title: 'مدير قطاع التكنولوجيا وإدارة المشروعات الرقمية',
  report_reference_date: '2026-11-25',
  active_priority_focus: 'تطبيق 4B (العملاء) + تطبيق كابتن مشاوير هما الأولوية التنفيذية والتشغيلية الأولى حالياً في المعادي؛ أما Daro و WeKaLa فهما مؤجلان مؤقتاً لحين استلام وتشغيل 4B.',
};

export const MESHAWIR_PROJECTS: MeshawirProject[] = [
  {
    id: 'proj-4b',
    enterprise_id: 'ent-mashawer',
    name: 'تطبيق 4B — منصة النقل الذكي واللوجستيات للعملاء (الاسم التاريخي: مشاوير / Veri / GA Ride / GoPlex)',
    code: '4B',
    category: 'الأولوية الأولى — نشط',
    status: 'نشط — الأولوية الأولى (قيد المراجعة والاختبار قبل الإطلاق)',
    knowledge_status: 'قيد التنفيذ',
    priority_tier: 'الأولوية #1 (نشط)',
    figma_completion_pct: 95,
    description:
      'التطبيق التجاري المعتمد (4B / Four Brothers سابقاً GoPlex وGA Ride وVeri). يشمل 4 فئات مركبات بحدود تشغيل صارمة (نصف النقل Pickup للطرود والبضائع فقط لا للركاب)، ميزة Add Stop متعددة المحطات (تغني عن Shared Load)، منظومة 4B Prepaid Trips للشركات (قيد التطوير)، وبنية Node.js/NestJS + Flutter + MongoDB/Prisma + PostgreSQL 16/PostGIS على خوادم WE.',
    repo_url: 'https://github.com/mashweer/4b-passenger-app',
    figma_url: 'https://www.figma.com/design/ulWwUzLnKThS2cfJWDetX6/%D9%85%D8%B4%D8%A7%D9%88%D9%8A%D8%B1---backlog?node-id=221-63531',
    live_url: 'https://admin.4b.com.eg',
    apk_files: [
      { id: 'apk-4b-1', version: 'v1.4.2-beta', buildNumber: 142, fileName: '4B_Passenger_v1.4.2_release.apk', fileSize: '34.8 MB', status: 'جاهز للاختبار — لا يثبت وحده جاهزية الإنتاج' },
      { id: 'apk-4b-drv', version: 'v2.4.1-rc', buildNumber: 241, fileName: 'Mashweer_Driver_4B.apk', fileSize: '42.5 MB', status: 'تطبيق كابتن مشاوير المستقل' },
    ],
    context_hints: [
      'التمييز الحاسم: تطبيق 4B للعملاء منفصل تماماً عن تطبيق كابتن مشاوير (Captain Mashawir)',
      'حوكمة التحقق: وجود ميزة في Figma أو المحاكي Android Emulator API 37 لا يثبت تشغيلها الفعلي أو أمان الـ GPS — مطلوب GPS Integrity Test 01 على هاتف حقيقي',
      'التوصيل متعدد المحطات موجود فعلياً باسم Add Stop داخل المنظومة؛ لا يُعامل Daro أو Shared Load كأفكار بديلة عنه',
      '4B Prepaid Trips (المسودة السابقة: 4B Digital Trips) مسار كوبونات شركات B2B وليس وكالة تسويق وإعلانات',
      'فجوات ما قبل الإطلاق: (1) FCM OAuth2، (2) خريطة الأدمن من Leaflet لـ Google Maps، (3) طوابير BullMQ، (4) NestJS 11، (5) CompreFace داخل مصر وربط LTRA وفصل فوري/الدفع الفعلي',
    ],
    db_info: {
      engine: 'PostgreSQL 16 + PostGIS 3.4 + Redis 7 (WE Cloud) + Flutter/Node.js/Prisma/MongoDB (كود التطبيق)',
      tables: ['trips', 'passengers', 'captains', 'saved_addresses', 'ride_ratings', 'bidding_offers', 'wallets', 'fawry_transactions', 'coupons'],
    },
  },
  {
    id: 'proj-captain-mashawir',
    enterprise_id: 'ent-mashawer',
    name: 'تطبيق كابتن مشاوير (Captain Mashawir — واجهة مستقلة مرتبطة بـ 4B)',
    code: 'CAPTAIN-4B',
    category: 'الأولوية الأولى (ب) — نشط',
    status: 'نشط ومرتبط بـ 4B — مطلوب اختبار رحلة End-to-End على هاتف حقيقي',
    knowledge_status: 'قيد التنفيذ',
    priority_tier: 'الأولوية #1B (نشط)',
    figma_completion_pct: 95,
    description:
      'تطبيق السائق/الكابتن المستقل المربوط بمنظومة 4B؛ يدعم تسجيل الكابتن والمركبة والمستندات، التحقق من الوجه/الشخصية (CompreFace Liveness داخل مصر)، Online/Offline، استقبال وقبول الطلبات عبر 4 فئات مركبات، التتبع اللحظي، المحفظة والتسويات، وتأكيد التسليم/SOS.',
    repo_url: 'https://github.com/mashweer/4b-captain-app',
    figma_url: 'https://www.figma.com/design/ulWwUzLnKThS2cfJWDetX6/%D9%85%D8%B4%D8%A7%D9%88%D9%8A%D8%B1---backlog',
    live_url: '',
    apk_files: [
      { id: 'apk-cap-1', version: 'v2.4.1-rc', buildNumber: 241, fileName: 'Mashweer_Driver_4B.apk', fileSize: '42.5 MB', status: 'يحتاج اختبار حقيقي بعيداً عن المحاكي' },
    ],
    context_hints: [
      'تجربة 23 نوفمبر 2026 تمت على محاكي Android API 37 ولا تصلح كدليل أمان GPS أو جاهزية إطلاق',
      'متطلبات اختبار End-to-End الـ 5: حساب كابتن تجريبي + حساب عميل تجريبي + لوحة إدارة + هاتف أندرويد حقيقي + تجربة دورة كاملة من الإنشاء حتى الإغلاق',
      'احتفاظ صور التحقق من الوجه 1–3 أسابيع على خوادم داخل مصر (WE / MIST) بدون Backup طويل الأمد ينتظر الاعتماد القانوني والأمني النهائي',
    ],
    db_info: {
      engine: 'WE Cloud Isolated VM + Docker + Ubuntu + CompreFace + PostGIS',
      tables: ['captains', 'captain_documents', 'vehicle_categories', 'trip_offers', 'captain_wallets', 'liveness_checks'],
    },
  },
  {
    id: 'proj-daro',
    enterprise_id: 'ent-mashawer',
    name: 'منصة دارو (Daro Super App — منصة خدمات متكاملة للزوار العرب والسياح ورجال الأعمال والطلاب في مصر)',
    code: 'DARO',
    category: 'مؤجل مؤقتاً حتى استلام 4B',
    status: 'مؤجل مؤقتاً — ملف فيجما يضم 9 صفحات وبها 8 ملاحظات ومشكلات مراجعة (24 نوفمبر 2026)',
    knowledge_status: 'مؤجل',
    priority_tier: 'مؤجل #3 (بعد تشغيل 4B)',
    figma_completion_pct: 70,
    description:
      'سوبر آب مخصص للزوار العرب والسياح ورجال الأعمال والطلاب القادمين إلى مصر (لا يستهدف المصريين كشريحة تسويقية رئيسية) عبر حساب موحد يضم 5 أدوار منطقية. يشمل 6 قطاعات: (1) الإقامة والعقارات، (2) السيارات والنقل + 4B، (3) الطيران والفنادق (طيران داخلي داخل مصر فقط عبر Amadeus / EgyptAir NDC)، (4) المطاعم والأكل المنزلي، (5) الخدمات الطبية، (6) خدمات الترجمة والإرشاد والطلاب والتنظيف والصيانة.',
    repo_url: 'https://github.com/mashweer/daro-cargo-system',
    figma_url: 'https://www.figma.com/design/aR1aanpRzGL7aMoxROGgt5/Daro?node-id=3214-2',
    live_url: 'https://daro.eg',
    apk_files: [],
    context_hints: [
      'قيد جغرافي صارم: حجز الطيران في دارو يقتصر على الطيران الداخلي داخل مصر فقط (Amadeus / EgyptAir NDC)',
      'توقف التحليل الآلي في قيمة تك بعد ~44 دقيقة بسبب حد الـ Credit/Quota (إعادة الضبط 30 نوفمبر 2026)',
      '8 عيوب موثقة في Figma بتاريخ 24 نوفمبر: تناقض الأرقام (25,000 / 3,200 / 1,000 / 40,000 / 15% / 10%)، تواريخ 2024–2028، 13 شيك، عدم وضوح حجز vs حجز مبدئي، وانقطاع مسار الدفع والتأكيد',
      'لا يوجد فريق تشغيل مستقل لـ Daro بالمعادي حالياً؛ الأولوية التنفيذية الكاملة لـ 4B',
    ],
    db_info: {
      engine: 'قيد التأجيل حتى استلام وتشغيل 4B',
      tables: ['users', 'property_owners', 'service_providers', 'medical_roles', 'domestic_flights', 'stays_bookings', 'restaurants_homefood'],
    },
  },
  {
    id: 'proj-wekala',
    enterprise_id: 'ent-mashawer',
    name: 'منصة وكالة (WeKaLa — سوق النخبة الذكي: بيع، مزاد، ومقايضة Marketplace)',
    code: 'WEKALA',
    category: 'مؤجل مؤقتاً حتى استلام 4B',
    status: 'مؤجل مؤقتاً لحين استلام وتشغيل 4B (نموذج العمولات والرسوم غير محسوم نهائياً)',
    knowledge_status: 'مؤجل',
    priority_tier: 'مؤجل #3 (بعد تشغيل 4B)',
    figma_completion_pct: 80,
    description:
      'منصة Marketplace إلكترونية ("وكالة – سوق النخبة الذكي: بيع، مزاد، ومقايضة") تستهدف الأفراد والتجار والمتاجر وأصحاب المنتجات. تتكون من 5 وحدات أساسية: الإعلانات المبوبة والبيع المباشر، Buy Now، المزادات (Auctions)، المقايضة (Barter)، وصفحات التجار الموثقين — دون ربطها حالياً بهيكل عمولات أو تشغيل نهائي معتمد.',
    repo_url: 'https://github.com/mashweer/wekala-fleet-management',
    figma_url: 'https://www.figma.com/design/oYxkmwZcGae674BRA5ZOen/Wikala',
    live_url: 'https://wekala.mashawer.com.eg',
    apk_files: [
      { id: 'apk-w-1', version: 'v1.2.0', buildNumber: 12, fileName: 'Wekala_v1.2.apk', fileSize: '28.7 MB', status: 'يحتاج تحققاً ومطابقة مع السورس الفعلي' },
    ],
    context_hints: [
      'يُكتب بالإنجليزية WeKaLa ويعمل بنموذج Marketplace (بيع، مزاد، مقاىضة) وليس تطبيق إدارة مناديب أو رحلات',
      'نسب العمولات، رسوم الإعلانات، سياسات الدفع والضمان، وهيكلة فريق التشغيل غير محسومة نهائياً وتحتاج تحققاً بعد إطلاق 4B',
      'ضرورة استلام السورس كود الكامل ومفاتيح Keystore رسمياً ضمن تسوية قيمة تك',
    ],
    db_info: {
      engine: 'غير معتمد نهائياً لحين تسليم 4B (متوقع Node.js/MongoDB أو PostgreSQL)',
      tables: ['listings', 'buy_now_orders', 'auctions', 'barter_offers', 'verified_merchants', 'escrow_ledger'],
    },
  },
  {
    id: 'proj-maadi-hq',
    enterprise_id: 'ent-mashawer',
    name: 'البنية التحتية وغرفة سيرفرات مقر المعادي (Maadi HQ IT)',
    code: 'MAADI-HQ-IT',
    category: 'بنية تحتية',
    status: 'في الإنتاج والتشغيل الفعلي',
    knowledge_status: 'مؤكد',
    priority_tier: 'بنية مقر المعادي (مُفعّل)',
    figma_completion_pct: 100,
    description:
      'المقر الرئيسي بالمعراج المعادي بقيادة المهندس عماد الشرقاوي كمدير للفرع: راك Perla 27U، جدار الحماية والراوتر TP-Link ER8411 (شغال فعلياً يدمج خط أرضي WE ADSL + خط Vodafone 5G + تخطيط WireGuard VPN لـ 25–30 موظفاً عن بُعد)، سنترال Grandstream 604A (شغال فعلياً بالخط الأرضي الثاني)، قرار شراء Static Public IP من مزود الخدمة، سويتش سيسكو 3850 48P، سيرفر Dell R640، محطتي HP Z440، 16 كاميرا 5MP + NVR 4K، و3 أجهزة ديل مكتبية.',
    repo_url: 'https://github.com/mashweer/maadi-infrastructure',
    figma_url: '',
    live_url: 'https://mashawer.com.eg',
    apk_files: [],
    context_hints: [
      'القرار الأحدث (مؤكد): شراء Static Public IP من مزود الخدمة (يتجاوز الاعتماد على DDNS القديم)',
      'حالة العمل عن بُعد (قيد التنفيذ/يحتاج تحققاً): دراسة WireGuard VPN على ER8411 لـ 25–30 موظفاً باستخدام Grandstream Wave مع عزل الوصول للسنترال فقط',
      'أصل تاريخي موثق (يحتاج تحققاً من وضعه الحالي): ذكر خادم Dell PowerEdge R730 + Windows Server Standard + 20 CALs في مرحلة سابقة — لا يُخلط مع R640 الجديد',
    ],
    db_info: {
      engine: 'Proxmox VE 8.x + TP-Link ER8411 (Static IP + WireGuard) + Cisco IOS-XE',
      tables: ['vlans', 'firewall_rules', 'pbx_extensions', 'nvr_streams', 'dhcp_leases', 'rack_ports'],
    },
  },
  {
    id: 'proj-4b-operations-noc',
    enterprise_id: 'ent-mashawer',
    name: 'غرفة عمليات ومراقبة 4B (4B Operations NOC)',
    code: '4B-OPS-NOC',
    category: 'عمليات وتشغيل',
    status: 'في الإنتاج والتجهيز',
    knowledge_status: 'قيد التنفيذ',
    priority_tier: 'تشغيل 4B بالمعادي',
    figma_completion_pct: 100,
    description:
      'غرفة العمليات المركزية بالمعادي بقيادة م/ موفق وم/ عمرو وفريق الكول سنتر ومحلل البيانات: تتابع لحظياً خوادم WE السحابية الثلاثة (4B-App, 4B-DB, 4B-Cache)، جدار F5 WAF، دوائر الفايبر وLTRA، والرد على مكالمات العملاء والكباتن عبر سنترال Grandstream 604A وWave.',
    repo_url: 'https://github.com/mashweer/4b-operations-noc',
    figma_url: '',
    live_url: 'https://ops.mashawer.com.eg',
    apk_files: [],
    context_hints: [
      'نشأت من إعادة توجيه وتطوير فكرة غرفة مراقبة التداول السابقة لخدمة أسطول 4B',
      'مراقبة زمن التأخير < 5ms وتجربة محاكاة الفشل DR',
    ],
    db_info: { engine: 'PostgreSQL / PostGIS', tables: ['trips_stream', 'active_drivers', 'sos_alerts', 'latency_metrics', 'audit_logs'] },
  },
  {
    id: 'proj-kaggle-ucp',
    enterprise_id: 'ent-mashawer',
    name: 'مسابقة كاجل العالمية ($100k) وبروتوكول الأسد الأبيض UCP-LLM',
    code: 'KAGGLE-UCP',
    category: 'أبحاث وذكاء',
    status: 'جاري التنفيذ (موعد 17 أكتوبر)',
    knowledge_status: 'قيد التنفيذ',
    priority_tier: 'مسار بحثي مستقل',
    figma_completion_pct: 90,
    description:
      'مشروع بحثي يقوده المهندس سامح يس في مسار Paper Track ($100,000) على Kaggle بالتنسيق مع معايير Ryan Holbrook، قبل 17 أكتوبر. يقوم على فلسفة الأسد الأبيض وبروتوكول UCP-LLM من 25 قسماً وتدريب Gemma 4 بـ LoRA/Unsloth وأداة Eve v1.1.0.',
    repo_url: 'https://github.com/mashweer/kaggle-gemma-ucp',
    figma_url: '',
    live_url: 'https://kaggle.com',
    apk_files: [],
    context_hints: ['الحالة الدراسية الأولى: توفير 80–120 ألف جنيه سنوياً بتطبيق القيود الهندسية', 'خطة 17 يوماً من 1 إلى 17 أكتوبر'],
    db_info: { engine: 'Python / Unsloth / LoRA', tables: ['benchmarks', 'eval_runs', 'ucp_sections', 'token_logs'] },
  },
  {
    id: 'proj-agouza-restaurant',
    enterprise_id: 'ent-mashawer',
    name: 'مشروع مطعم المشويات بالعجوزة (توريدات POS وCCTV — مفصول مالياً)',
    code: 'AGOUZA-REST',
    category: 'مشروعات جانبية',
    status: 'في التأسيس والتوريد (حسابات مفصولة تماماً عن مشاوير)',
    knowledge_status: 'قيد التنفيذ',
    priority_tier: 'مفصول مالياً عن مشاوير',
    figma_completion_pct: 100,
    description:
      'مشروع تجاري مملوك لأبو خالد تحت الإدارة التنفيذية الحصرية للأستاذ هاني (CFO)، مع توحيد المشتريات التقنية مع المهندس علي (شركة الأصدقاء): نظام كاشير POS، درج نقدية، طابعات مطبخ وفواتير، و14 كاميرا مراقبة بالمشاهدة عن بعد، مع فصل حساباته تماماً عن مشاوير.',
    repo_url: '',
    figma_url: '',
    live_url: '',
    apk_files: [],
    context_hints: ['فصل مالي وقانوني وتشغيلي كامل عن شركة مشاوير و4B', 'إمكانية ربط توصيل طلبات المطعم لاحقاً بأسطول 4B'],
    db_info: {},
  },
  {
    id: 'proj-app4-future',
    enterprise_id: 'ent-mashawer',
    name: 'التطبيق الرابع الاحتمالي + الشركة التابعة / المصرية الكويتية (مقترحات غير معتمدة)',
    code: 'APP4-SUBSIDIARY',
    category: 'مقترحات مستقبلية',
    status: 'مقترح قيد الدراسة — لم يُعتمد كقرار رسمي بعد',
    knowledge_status: 'مقترح',
    priority_tier: 'مقترح غير معتمد',
    figma_completion_pct: 0,
    description:
      'يضم الأفكار التوسعية غير المعتمدة نهائياً: مقترح الشركة التابعة خارج القاهرة، مقترح الشركة المصرية الكويتية لتوطين التكنولوجيا، وفكرة التطبيق الرابع. جميعها مصنفة «مقترح» ولا تُدرج كأصول قائمة.',
    repo_url: '',
    figma_url: '',
    live_url: '',
    apk_files: [],
    context_hints: ['التصنيف الملزم: مقترح / قيد الدراسة — لا يُعامل كأمر واقع'],
    db_info: {},
  },
];

export const MESHAWIR_MILESTONES: MeshawirMilestone[] = [
  { id: 'ms-4b-m1', project_id: 'proj-4b', phase_code: 'M1 (W1-W2)', title: 'المرحلة 1: التشغيل الأساسي وإدارة الكباتن والركاب وفحص الكود وقاعدة البيانات', target_date: '2026-09-25', completion_percentage: 90, status: 'قيد الإغلاق', deliverables_summary: 'استلام المستودع، قاعدة PostGIS، تدفق الرحلة الكامل من السيرفر، ومطابقة فيجما', sign_off_by: 'المهندس سامح يس' },
  { id: 'ms-4b-m2', project_id: 'proj-4b', phase_code: 'M2 (W3)', title: 'المرحلة 2: التسعير الديناميكي والمزايدة 15ث وإغلاق الثغرات وBroadNet + Maps', target_date: '2026-10-02', completion_percentage: 45, status: 'جاري التنفيذ', deliverables_summary: 'مؤقت 60ث للـ OTP، حماية الأسعار من السيرفر، روابط Cloudinary الموقعة، وتكامل برودنت', sign_off_by: 'المهندس سامح يس وعمرو وموفق' },
  { id: 'ms-4b-m3', project_id: 'proj-4b', phase_code: 'M3 (W4-W5)', title: 'المرحلة 3: النواة المالية وفوري وكشف حساب المحفظة والاختبارات الميدانية', target_date: '2026-10-09', completion_percentage: 20, status: 'قيد الإعداد', deliverables_summary: 'بوابة فوري وWebhook موثق، تسويات الكباتن والضرائب، والاختبار الميداني بـ 4B', sign_off_by: 'الأستاذ هاني والمطور' },
  { id: 'ms-4b-m4', project_id: 'proj-4b', phase_code: 'M4 (W6)', title: 'المرحلة 4: الحوكمة وفصل الصلاحيات وتسليم وكالة (WeKaLa) ولوحات المكاتب', target_date: '2026-10-16', completion_percentage: 15, status: 'مخطط', deliverables_summary: 'صلاحيات RBAC، لوحات الوكلاء، وإصلاح ملاحظات الاختبار', sign_off_by: 'المهندس عماد الشرقاوي والمهندس سامح يس' },
  { id: 'ms-4b-m5', project_id: 'proj-4b', phase_code: 'M5 (W7)', title: 'المرحلة 5: اختبارات القبول النهائية UAT وتطبيق دارو وشهادات المنشأ والإطلاق', target_date: '2026-10-23', completion_percentage: 10, status: 'مخطط', deliverables_summary: 'إطلاق تجاري لـ 4B، استكمال شاشات دارو وماسح الباركود، Keystore، وتسوية قيمة تك', sign_off_by: 'أبو خالد والمحامي والمهندس سامح يس' },
];

export const MESHAWIR_TEAM_PROFILES: MeshawirTeamProfile[] = [
  { id: 'eng-emad', full_name: 'المهندس عماد الشرقاوي', short_name: 'المهندس عماد الشرقاوي', title: 'المستشار التقني الأول ومدير فرع المعادي (استلام كامل الإدارة)', category: 'leadership', efficiency_rate: 98, email: 'admin@mashweer.com.eg', phone: '01000000003', role_description: 'مدير فرع المعادي والمستشار التقني الأول؛ يتسلم إدارة المقر، الاتصالات، السنترال Grandstream 604A، راوتر/فايروول TP-Link ER8411، سيرفرات WE والـ SSL VPN، والتنسيق مع LTRA. يُذكر اسمه دائماً قبل المهندس سامح يس.', readiness_status: 'جاهز وحاضر', priority_order: 1 },
  { id: 'eng-sameh', full_name: 'المهندس سامح يس', short_name: 'المهندس سامح يس', title: 'رئيس قطاع التكنولوجيا (CTO) وقائد المنظومة البرمجية والذكاء الاصطناعي', category: 'leadership', efficiency_rate: 99, email: 'admin@mashweer.com.eg', phone: '01000000002', role_description: 'رئيس قطاع التكنولوجيا ومسؤول المنظومة البرمجية للتطبيقات الثلاثة (4B، وكالة، دارو)، خطة قيمة تك، سوبابيز، وبحث كاجل والأسد الأبيض.', readiness_status: 'جاهز وحاضر', priority_order: 2 },
  { id: 'investor-abu-khaled', full_name: 'أبو خالد', short_name: 'أبو خالد', title: 'المالك والمستثمر الرئيسي للشركة كلها', category: 'leadership', efficiency_rate: 95, email: 'ceo@mashawer.com.eg', phone: '01000000001', role_description: 'المالك الاستراتيجي للمجموعة؛ يعتمد الميزانيات الكبرى، الشركة التابعة، التسويق، ومطعم العجوزة.', readiness_status: 'متابعة استراتيجية', priority_order: 3 },
  { id: 'admin-hany', full_name: 'الأستاذ هاني', short_name: 'أ/ هاني', title: 'المدير المالي (CFO) وقائد مشروع مطعم العجوزة', category: 'finance', efficiency_rate: 90, email: 'finance@mashweer.com.eg', phone: '01000000005', role_description: 'يدير الحسابات والفواتير الضريبية ETA وفيزا الشركة وبوابة فوري وتسويات الكباتن والمتابعة الحصرية لمطعم المشويات بالعجوزة.', readiness_status: 'جاهز وحاضر', priority_order: 4 },
  { id: 'lawyer-mostafa', full_name: 'الأستاذ محمد مصطفى', short_name: 'أ/ محمد مصطفى (المحامي)', title: 'المستشار القانوني العام للشركة', category: 'legal', efficiency_rate: 95, email: 'legal@mashawer.com.eg', phone: '01000000004', role_description: 'مسؤول الملفات القانونية الأربعة: قيمة تك، تراخيص LTRA، إيداعات ITIDA والشهر العقاري، وعقود الموظفين والخطوط الرسمية.', readiness_status: 'جاهز وحاضر', priority_order: 5 },
  { id: 'ops-mowaffaq', full_name: 'الأستاذ موفق', short_name: 'م/ موفق', title: 'مدير عمليات المنظومة والجودة والطوارئ (4B)', category: 'operations', efficiency_rate: 99, email: 'operation@mashweer.com.eg', phone: '01000000007', role_description: 'خبرة +10 سنوات أوبر/كريم؛ مسؤول ضبط الجودة والنزاعات وSOS وتدريب الكول سنتر على السنترال.', readiness_status: 'جاهز وحاضر', priority_order: 6 },
  { id: 'ops-amr', full_name: 'المهندس عمرو', short_name: 'م/ عمرو', title: 'قائد العمليات الميدانية للأسطول والتسويق الفني (4B)', category: 'operations', efficiency_rate: 99, email: 'operation@mashweer.com.eg', phone: '01000000012', role_description: 'خبرة +10 سنوات أوبر/كريم؛ يدير أسطول الكباتن والحوافز والتسعير ومتابعة وكالات الدعاية.', readiness_status: 'جاهز وحاضر', priority_order: 7 },
  { id: 'eng-obeid', full_name: 'المهندس أحمد عبيد', short_name: 'م/ أحمد عبيد', title: 'مهندس IT ومساعد تقني معتمد (The Assist - خبرة +5 سنوات)', category: 'technical', efficiency_rate: 68, email: 'support@mashweer.com.eg', phone: '01000000013', role_description: 'المساعد التقني المعتمد بالمقر لصيانة الأجهزة والشبكة ودعم الموظفين يومياً.', readiness_status: 'جاهز وحاضر', priority_order: 8 },
  { id: 'tech-hatem', full_name: 'حاتم الفني', short_name: 'حاتم', title: 'فني تمديدات شبكات وبنية سلكية (بالأجرة)', category: 'technical', efficiency_rate: 85, email: 'hatem@mashweer.com.eg', phone: '01000000014', role_description: 'مسؤول سحب كابلات Cat6 بالسقف المعلق، تأريج الباتش بانل الـ 48 منفذاً، واختبارها بجهاز I-Pook.', readiness_status: 'ميداني بالاستدعاء', priority_order: 9 },
  { id: 'hr-sara', full_name: 'الأستاذة سارة حسن', short_name: 'أ/ سارة حسن', title: 'مسؤولة الموارد البشرية والشؤون الإدارية', category: 'operations', efficiency_rate: 90, email: 'info@mashweer.com.eg', phone: '01000000016', role_description: 'متابعة جهاز البصمة ZKTeco، عقود الموظفين، وعهدة أجهزة المقر (بعد إلغاء إيميل hr@ لتوفير التكلفة).', readiness_status: 'جاهز وحاضر', priority_order: 10 },
  { id: 'eng-enad', full_name: 'المهندس عناد', short_name: 'م/ عناد', title: 'استشاري جدوى وتكامل تقني خارجي', category: 'technical', efficiency_rate: 90, email: '', phone: '', role_description: 'استشاري دراسات الجدوى الفنية والتوسعية.', readiness_status: 'استشاري', priority_order: 11 },
  { id: 'qa-ali-office7', full_name: 'المهندس علي (مكتب 7)', short_name: 'م/ علي QA', title: 'مسؤول ضمان جودة تطبيقات الموبايل', category: 'technical', efficiency_rate: 88, email: '', phone: '', role_description: 'اختبار تطبيقات 4B ووكالة ودارو ومطابقتها لتصاميم فيجما (مكتب 7).', readiness_status: 'نشط', priority_order: 12 },
  { id: 'support-team-5', full_name: 'فريق خدمة العملاء والكول سنتر (5 موظفين) + محلل بيانات', short_name: 'الكول سنتر والتحليل', title: 'طاقم تشغيل صالة العمليات الكبرى بالمعادي', category: 'operations', efficiency_rate: 92, email: 'support@mashweer.com.eg', phone: '', role_description: 'الرد على الركاب والكباتن عبر تحويلات السنترال 107-111 ومتابعة الخرائط الحرارية.', readiness_status: 'جاري التسكين', priority_order: 13 },
];

export const MESHAWIR_PROVIDERS: MeshawirServiceProvider[] = [
  { id: 'prov-we-telecom', name: 'المصرية للاتصالات (WE Telecom Egypt)', category: 'سيرفرات سحابية وفايبر وADSL وخطوط أرضية', portal_url: 'https://cloud.te.eg/portal', username: 'mashweer_telecom_admin', account_manager: 'م/ أحمد محرم وم/ أحمد غريب', contact_phone: '01000000009', contact_email: 'cloud-sales@te.eg', status: 'معتمد وموقع (6078927 و 6078933)', cost_or_plan: '1,167,496 ج.م/سنوياً + WE ADSL + خط أرضي 2', official_badge: 'المشغل الوطني المعتمد', active_services: ['3 خوادم سحابية 4B', 'F5 WAF + 7 SSL VPN', 'فايبر 24Mbps + 6 فروع 4Mbps', 'خط أرضي 1 WE ADSL على ER8411', 'خط أرضي 2 على سنترال Grandstream 604A'] },
  { id: 'prov-vodafone-5g', name: 'فودافون مصر (صقر قريش - Vodafone 5G/4G)', category: 'إنترنت 5G وخطوط شرائح OTP', portal_url: 'http://192.168.8.1', username: 'vodafone_maadi_hq', account_manager: 'فرع صقر قريش', contact_phone: '', contact_email: '', status: 'نشط وشغال فعلياً بالمقر', cost_or_plan: 'فاتورة #748994 (3,326.46 ج.م) + باقة 5G', official_badge: 'شغال على ER8411 WAN2', active_services: ['خدمة Vodafone 5G متصلة بـ TP-Link ER8411 WAN2', 'راوتر H153-381 وشريحة AT Home', 'خطوط OTP لبرودنت'] },
  { id: 'prov-ec-egypt', name: 'المصرية لتكنولوجيا المعلومات (EC / eyg.com.eg)', category: 'نطاقات واستضافة وإيميلات Zoho', portal_url: 'https://clients.ec.com.eg/clientarea.php', username: 'mashawer_admin', account_manager: 'م/ محمد الحلو', contact_phone: '01551553434', contact_email: 'info@ec.com.eg', status: 'نشط ومجدد حتى أغسطس 2027', cost_or_plan: '3,762 ج.م/سنة + 5 إيميلات Zoho مجانية', official_badge: 'مزود النطاقات الرسمي', active_services: ['mashawer.com.eg', 'استضافة Host1 cPanel 2083', '5 إيميلات Zoho Lite'] },
  { id: 'prov-broadnet', name: 'برودنت (BroadNet A2P SMS)', category: 'رسائل OTP المحلية لتطبيق 4B', portal_url: 'https://broadnetme.com/portal/login', username: 'mashawer', account_manager: 'مهندسة الدعم الفني', contact_phone: '', contact_email: '', status: 'نشط (25 رصيد اختبار)', cost_or_plan: 'Sender ID: GoRide / Mashawer', official_badge: 'بوابة OTP مصر', active_services: ['Sender ID معتمد على شبكات مصر', 'API للـ Backend'] },
  { id: 'prov-twilio', name: 'تويليو (Twilio SMS)', category: 'رسائل OTP لوكالة ودارو + احتياطي', portal_url: 'https://console.twilio.com', username: 'twilio_mashweer_sim', account_manager: 'م/ عماد الشرقاوي وم/ سامح يس', contact_phone: '', contact_email: '', status: 'تم شراء الشريحة وجاري التفعيل', cost_or_plan: 'دفع حسب الاستخدام', official_badge: 'بوابة دولية واحتياطية', active_services: ['Twilio OTP لتطبيقات WeKaLa و Daro'] },
  { id: 'prov-fawry', name: 'شركة فوري (Fawry Enterprise)', category: 'بوابة الدفع الإلكتروني وصرف الكباتن', portal_url: 'https://fawry.com', username: 'FAWRY_MERCHANT_CODE_MASHWEER', account_manager: 'الأستاذ هاني + مدير حساب فوري', contact_phone: '', contact_email: '', status: 'جاري استكمال التعاقد وSandbox', cost_or_plan: 'عقد تاجر تحصيل وصرف', official_badge: 'بوابة الدفع الرسمية لـ 4B', active_services: ['تحصيل بطاقات وأكواد فوري', 'صرف محافظ الكباتن', 'Webhook الدفع المؤمن'] },
  { id: 'prov-cloudinary', name: 'كلاوديناري (Cloudinary)', category: 'تخزين الوثائق ورخص الكباتن المشفر', portal_url: 'https://cloudinary.com', username: 'mashweer-cloud', account_manager: 'admin@mashweer.com.eg', contact_phone: '', contact_email: '', status: 'نشط ومطلوب تفعيل الروابط الموقعة', cost_or_plan: 'خطة مدفوعة + SHA-256 HMAC', official_badge: 'خزنة الوثائق السحابية', active_services: ['تخزين رخص القيادة والبطاقات بروابط مؤقتة'] },
  { id: 'prov-google-maps', name: 'خرائط جوجل (Google Maps Platform)', category: 'الخرائط والتوجيه وحساب المسافات', portal_url: 'https://console.cloud.google.com', username: 'admin@mashweer.com.eg', account_manager: 'القيادة التقنية والمالية', contact_phone: '', contact_email: '', status: 'نشط ومطلوب وضع حدود الميزانية', cost_or_plan: 'فوترة GCP الشهرية', official_badge: 'محرك الخرائط', active_services: ['Server Key مقيد بـ IP', 'Web Key مقيد بالدومين'] },
  { id: 'prov-friends-cctv', name: 'شركة الأصدقاء للأنظمة الأمنية (بشمهندس علي)', category: 'كاميرات المراقبة (المعادي + العجوزة) وPOS المطعم', portal_url: '', username: 'eng_ali_friends', account_manager: 'بشمهندس علي', contact_phone: '01000000015', contact_email: '', status: 'معتمد للمعادي ومطعم العجوزة', cost_or_plan: 'عرض المعادي 55,050 ج.م + عرض العجوزة', official_badge: 'المورد الموحد للأمن وPOS', active_services: ['16 كاميرا Hikvision 5MP', 'NVR 16ch 4K + 4TB', 'POS وكاميرات مطعم العجوزة'] },
  { id: 'prov-qeema-tech', name: 'شركة قيمة تك / فاليوتيك (ValueTech / Qeema Tech)', category: 'شريك التطوير البرمجي الخارجي', portal_url: 'https://qeematech.com', username: 'mashweer_corp', account_manager: 'م/ حازم', contact_phone: '01000000008', contact_email: '', status: 'تحت خطة 7 أسابيع والإنذار القانوني', cost_or_plan: 'خطة M1-M5 + 20 مهمة مفتوحة', official_badge: 'مطور خارجي خاضع للحوكمة', active_services: ['تطوير 4B ووكالة ودارو', 'تسليم السورس وKeystore'] },
  { id: 'prov-qts-servers', name: 'شركة كيو تي إس (QTS Servers)', category: 'توريد الخوادم والسويتش', portal_url: '', username: 'qts_sales_corp', account_manager: 'إدارة مبيعات QTS', contact_phone: '0223967890', contact_email: '', status: 'مسددة بفاتورتين ضريبيتين', cost_or_plan: '108,265.80 ج.م شاملة الضريبة', official_badge: 'مورد ضريبي معتمد', active_services: ['Dell PowerEdge R640', '2x HP Z440', 'Cisco Catalyst 3850-48P'] },
  { id: 'prov-redline', name: 'شركة رد لاين البستان (RedLine)', category: 'كابينة الراك وأدوات الشبكة', portal_url: 'https://redline-stores.com', username: 'sameh_yassin', account_manager: 'مبيعات البستان', contact_phone: '0223912345', contact_email: '', status: 'مسددة بالكامل', cost_or_plan: '18,550.00 ج.م شاملة الضريبة', official_badge: 'مورد البستان', active_services: ['Perla Rack 27U 1000mm', 'I-Pook PK65H', 'RJ45 + Root Crimper'] },
];

export const MESHAWIR_RACK_META = {
  id: 'rack-maadi-27u',
  name: 'PERLA 27U SERVER ENCLOSURE — غرفة السيرفرات المصفحة بالمعادي',
  total_units: 27,
  depth_mm: 1000,
  width_inches: 19,
  location: 'مقر المعراج بالمعادي - غرفة IT المصفحة (5.74م × 1.96م)',
  cooling_type: '4x مراوح سقفية + تكييف مخصص 24/7',
  power_backup: 'وحدة PDU 8 منافذ + UPS 1500VA (قيد التوريد)',
  lock_status: 'باب زجاجي مؤمّن بمفتاح لدى م/ عماد الشرقاوي وم/ سامح يس',
};

export const MESHAWIR_RACK_DEVICES: RackDevice[] = [
  { id: 'patch-panel-1', rack_id: 'rack-maadi-27u', name: 'Patch Panel 24 Port #1', arabic_name: 'لوحة التوزيع الأولى Cat6 (المكاتب والكول سنتر والطابعة والهواتف)', model: 'Cat6 24-Port 1U Patch Panel', manufacturer: 'Perla / RedLine', u_position_start: 27, u_height: 1, device_category: 'patch_panel', serial_number: 'PP1-24P-01', ip_management: 'Passive', mac_address: 'Passive', power_watts: 0, operating_temp_c: 22, status: 'online', notes: 'المنفذ PP1-07 مخصص لطابعة HP LaserJet Pro M404n بمكتب 5' },
  { id: 'cisco-switch-48', rack_id: 'rack-maadi-27u', name: 'Cisco Catalyst 3850-48P PoE+', arabic_name: 'سويتش سيسكو المركزي 48 بورت PoE+ (Dual 715W PSU + 4x 10G SFP+)', model: 'WS-C3850-48P-S Dual 715W', manufacturer: 'Cisco Systems', u_position_start: 26, u_height: 1, device_category: 'switch', serial_number: 'FCW2148L0P9', ip_management: '192.168.10.2', mac_address: 'F4:0F:1B:7A:48:00', power_watts: 340, operating_temp_c: 31, status: 'online', notes: 'يدير جميع الـ VLANs (10, 15, 20, 30, 40, 50, 90-92, 99) ويربط ER8411 و604A وR640' },
  { id: 'patch-panel-2', rack_id: 'rack-maadi-27u', name: 'Patch Panel 24 Port #2', arabic_name: 'لوحة التوزيع الثانية Cat6 (الكاميرات الـ 16 والسيرفرات والواي فاي)', model: 'Cat6 24-Port 1U Patch Panel', manufacturer: 'Perla / RedLine', u_position_start: 25, u_height: 1, device_category: 'patch_panel', serial_number: 'PP2-24P-02', ip_management: 'Passive', mac_address: 'Passive', power_watts: 0, operating_temp_c: 22, status: 'online', notes: 'توصيلات الكاميرات والواي فاي والسيرفرات مفحوصة بـ I-Pook PK65H' },
  { id: 'dell-r640', rack_id: 'rack-maadi-27u', name: 'Dell PowerEdge R640 + HP Z440 Vault', arabic_name: 'سيرفر ديل بلاتينيوم R640 (8x SAS/NVMe + 4x LACP + iDRAC9) + رف Z440 Proxmox', model: 'PowerEdge R640 (2x Xeon 8160 48C, 64GB ECC) + Z440 #1', manufacturer: 'Dell / HP Enterprise', u_position_start: 24, u_height: 1, device_category: 'server', serial_number: '7X9K4R2 / Z440-01', ip_management: '192.168.10.10 (iDRAC: .9 | Z440: .20)', mac_address: 'D8:9E:F3:11:42:01', power_watts: 560, operating_temp_c: 35, status: 'online', notes: '4 منافذ LACP + iDRAC9 + Proxmox VE 8.x + حاويات Docker + OPNsense مساند + خزنة الباك أب 3:00 ص' },
  { id: 'rack-spacer-empty', rack_id: 'rack-maadi-27u', name: '3U Airflow & Expansion Bay', arabic_name: 'مسافة تهوية وفصل حراري فارغة واضحة (U23–U21 · 3U Airflow Bay)', model: 'Clear Airflow Separation Bay', manufacturer: 'Perla', u_position_start: 21, u_height: 3, device_category: 'spacer', serial_number: 'EMPTY-3U-BAY', ip_management: 'N/A', mac_address: 'N/A', power_watts: 0, operating_temp_c: 23, status: 'online', notes: 'عزل حراري حقيقي بعرض الراك بين R640 وأجهزة الصوت والمراقبة مع إظهار قضبان الراك' },
  { id: 'nvr-16-ch', rack_id: 'rack-maadi-27u', name: 'Hikvision 16-Channel 4K NVR', arabic_name: 'مسجل كاميرات المراقبة هيكفيجن 16 قناة 4K (هارد 4TB WD Purple)', model: 'DS-7616NI-I2/16P', manufacturer: 'Hikvision', u_position_start: 20, u_height: 1, device_category: 'nvr', serial_number: 'HK-NVR-16-01', ip_management: '192.168.20.100', mac_address: 'C4:2F:90:3A:55:12', power_watts: 140, operating_temp_c: 29, status: 'online', notes: '16 قناة بدقة 5MP (منها 4 صوتية) + مخرج HDMI/VGA لشاشات المراقبة على VLAN 20' },
  { id: 'grandstream-pbx-604a', rack_id: 'rack-maadi-27u', name: 'Grandstream UCM6304A ("604A") IP PBX', arabic_name: 'السنترال الذكي جراند ستريم 604A (شاشة LCD + FXO 1-4 + FXS 1-2) [مُشغّل]', model: 'Grandstream UCM6304A Enterprise IP PBX', manufacturer: 'Grandstream Networks', u_position_start: 19, u_height: 1, device_category: 'pbx', serial_number: 'GS-604A-MAADI', ip_management: 'https://192.168.30.1:8089', mac_address: '00:0B:82:94:12:3C', power_watts: 45, operating_temp_c: 26, status: 'online', notes: 'جديد ومشترى ومفعّل: يظهر شاشة LCD + WAN + LAN (Gi1/0/13) + الخط الأرضي الثاني راكب على FXO-1 + استقبال 100 على FXS-1' },
  { id: 'tplink-er8411-fw', rack_id: 'rack-maadi-27u', name: 'TP-Link ER8411 Enterprise Router & Firewall', arabic_name: 'جدار الحماية والراوتر المركزي TP-Link ER8411 (Multi-WAN + VPN) [مُشغّل]', model: 'TP-Link Omada ER8411 10G Multi-WAN Router & Firewall', manufacturer: 'TP-Link Omada', u_position_start: 18, u_height: 1, device_category: 'firewall', serial_number: 'TPL-ER8411-01', ip_management: '192.168.10.1', mac_address: '70:4C:A5:10:E2:80', power_watts: 60, operating_temp_c: 28, status: 'online', notes: 'جديد ومشترى ومفعّل: يربط WAN1 (خط أرضي 1 WE ADSL) + WAN2 (Vodafone 5G) + WAN3 (جاهز لفايبر WE L3VPN) + ترنك LAN إلى سيسكو 3850 + OPNsense مساند على Z440' },
];

const CORE_RACK_PORTS: RackPort[] = [
  // TP-Link ER8411 Ports
  { id: 'er8411-p1', device_id: 'tplink-er8411-fw', port_number: 1, label: 'WAN1 (RJ45)', status: 'active', connected_device: 'راوتر خط أرضي 1 — إنترنت WE ADSL', device_type: 'uplink', user_endpoint: 'خط أرضي 1 بالمعادي (WE ADSL)', ip_address: '192.168.1.1 / PPPoE', mac_address: '70:4C:A5:10:E2:81', vlan_name: 'WAN1 - WE ADSL', vlan_id: 90, speed_duplex: '1000 Mbps Full', poe_watts: 0, cable_color: 'yellow', patch_panel_cross_port: null, notes: 'شغال فعلياً الآن كمصدر إنترنت أرضي أساسي داخل ER8411' },
  { id: 'er8411-p2', device_id: 'tplink-er8411-fw', port_number: 2, label: 'WAN2 (RJ45)', status: 'active', connected_device: 'راوتر Vodafone 5G (فودافون الجيل الخامس)', device_type: 'uplink', user_endpoint: 'باقة إنترنت Vodafone 5G بالمقر', ip_address: '192.168.8.1 (Gateway)', mac_address: '70:4C:A5:10:E2:82', vlan_name: 'WAN2 - Vodafone 5G', vlan_id: 90, speed_duplex: '1000 Mbps Full', poe_watts: 0, cable_color: 'red', patch_panel_cross_port: null, notes: 'شغال فعلياً الآن على ER8411 لموازنة الأحمال والسرعة العالية والطوارئ' },
  { id: 'er8411-p3', device_id: 'tplink-er8411-fw', port_number: 3, label: 'WAN3 (SFP+)', status: 'standby', connected_device: 'مسار فايبر المصرية للاتصالات WE L3VPN 24Mbps', device_type: 'uplink', user_endpoint: 'سنترال المعادي ↔ القرية الذكية (PO 6078927)', ip_address: '10.240.18.2', mac_address: '70:4C:A5:10:E2:83', vlan_name: 'VLAN 90 - WE L3VPN', vlan_id: 90, speed_duplex: '10G SFP+ Ready', poe_watts: 0, cable_color: 'cyan', patch_panel_cross_port: null, notes: 'منفذ جاهز لوصول خط الفايبر خلال 4–6 أسابيع' },
  { id: 'er8411-p4', device_id: 'tplink-er8411-fw', port_number: 4, label: 'LAN1 Trunk (10G SFP+)', status: 'active', connected_device: 'ترنك الشبكة الرئيسي ↔ سويتش سيسكو 3850 (Gi1/0/33)', device_type: 'switch', user_endpoint: 'قلب الشبكة الداخلية وتوزيع جميع VLANs', ip_address: '192.168.10.1', mac_address: '70:4C:A5:10:E2:84', vlan_name: 'All VLANs 802.1Q Trunk', vlan_id: 10, speed_duplex: '10G Full Duplex', poe_watts: 0, cable_color: 'blue', patch_panel_cross_port: null, notes: 'يمرر قواعد الجدار الناري وعزل الشبكات لكل أجهزة المقر (ومساند بـ OPNsense VM على Z440)' },

  // Grandstream 604A Ports
  { id: 'gs604a-p1', device_id: 'grandstream-pbx-604a', port_number: 1, label: 'LAN (Gigabit)', status: 'active', connected_device: 'سويتش سيسكو 3850 منفذ Gi1/0/13', device_type: 'switch', user_endpoint: 'شبكة هواتف IP المكتبية (GRP2614 · 101–116)', ip_address: '192.168.30.1', mac_address: '00:0B:82:94:12:3C', vlan_name: 'VLAN 30 - VoIP PBX', vlan_id: 30, speed_duplex: '1000 Mbps Full', poe_watts: 0, cable_color: 'green', patch_panel_cross_port: 13, notes: 'واجهة الإدارة https://192.168.30.1:8089' },
  { id: 'gs604a-p2', device_id: 'grandstream-pbx-604a', port_number: 2, label: 'WAN (SIP)', status: 'active', connected_device: 'واجهة VoIP عبر TP-Link ER8411', device_type: 'firewall', user_endpoint: 'دعم خطوط SIP والمكالمات المشفرة', ip_address: '192.168.30.2', mac_address: '00:0B:82:94:12:3D', vlan_name: 'VLAN 30 - VoIP PBX', vlan_id: 30, speed_duplex: '1000 Mbps Full', poe_watts: 0, cable_color: 'green', patch_panel_cross_port: null, notes: 'جاهز لربط SIP Trunks' },
  { id: 'gs604a-p3', device_id: 'grandstream-pbx-604a', port_number: 3, label: 'FXO-1 (PSTN)', status: 'active', connected_device: 'الخط الأرضي الثاني بالمعادي (راكب مباشرة)', device_type: 'uplink', user_endpoint: 'مكالمات الركاب والكباتن والاستقبال (IVR)', ip_address: 'PSTN Line 2', mac_address: 'Analog FXO-1', vlan_name: 'VLAN 30 - VoIP PBX', vlan_id: 30, speed_duplex: 'Analog PSTN', poe_watts: 0, cable_color: 'amber', patch_panel_cross_port: null, notes: 'الخط الأرضي الثاني موصل وشغال على السنترال الآن' },
  { id: 'gs604a-p4', device_id: 'grandstream-pbx-604a', port_number: 4, label: 'FXO-2..4', status: 'standby', connected_device: 'منافذ خطوط أرضية للتوسع المستقبلي', device_type: 'uplink', user_endpoint: 'احتياطي 3 خطوط خارجية', ip_address: 'PSTN Expansion', mac_address: 'Analog FXO 2-4', vlan_name: 'VLAN 30 - VoIP PBX', vlan_id: 30, speed_duplex: 'Analog PSTN', poe_watts: 0, cable_color: 'slate', patch_panel_cross_port: null, notes: 'جاهزة لإضافة خطوط خدمة عملاء إضافية' },
  { id: 'gs604a-p5', device_id: 'grandstream-pbx-604a', port_number: 5, label: 'FXS-1 (Ext 100)', status: 'active', connected_device: 'تليفون/فاكس الاستقبال المباشر (تحويلة 100)', device_type: 'voip_phone', user_endpoint: 'مكتب الاستقبال والمدخل', ip_address: 'Ext 100', mac_address: 'Analog FXS-1', vlan_name: 'VLAN 30 - VoIP PBX', vlan_id: 30, speed_duplex: 'Analog FXS', poe_watts: 0, cable_color: 'green', patch_panel_cross_port: null, notes: 'يعمل حتى في حالات انقطاع الشبكة' },
  { id: 'gs604a-p6', device_id: 'grandstream-pbx-604a', port_number: 6, label: 'FXS-2', status: 'free', connected_device: 'متاح لهاتف طوارئ إضافي', device_type: 'voip_phone', user_endpoint: 'غير مخصص', ip_address: '—', mac_address: 'Analog FXS-2', vlan_name: 'VLAN 30 - VoIP PBX', vlan_id: 30, speed_duplex: 'Analog FXS', poe_watts: 0, cable_color: 'slate', patch_panel_cross_port: null, notes: 'تذكرة MSH-IT-2026-084 لضبط IVR والطابور' },

  // Critical Cisco 3850 Ports (1..48 filled programmatically below with real details)
  { id: 'c3850-p1', device_id: 'cisco-switch-48', port_number: 1, label: 'Gi1/0/1', status: 'active', connected_device: 'محطة عمل المهندس عماد الشرقاوي (مدير الفرع)', device_type: 'workstation', user_endpoint: 'مكتب 5 — الإدارة التقنية (PP1-01)', ip_address: '192.168.10.12', mac_address: 'A4:BB:6D:10:01:01', vlan_name: 'VLAN 10 - إدارة وموظفون', vlan_id: 10, speed_duplex: '1000 Mbps Full', poe_watts: 0, cable_color: 'blue', patch_panel_cross_port: 1, notes: 'نقطة الإدارة التنفيذية الأولى' },
  { id: 'c3850-p2', device_id: 'cisco-switch-48', port_number: 2, label: 'Gi1/0/2', status: 'active', connected_device: 'محطة عمل المهندس سامح يس (CTO)', device_type: 'workstation', user_endpoint: 'مكتب 5 — الإدارة التقنية (PP1-02)', ip_address: '192.168.10.11', mac_address: 'A4:BB:6D:10:01:02', vlan_name: 'VLAN 10 - إدارة وموظفون', vlan_id: 10, speed_duplex: '1000 Mbps Full', poe_watts: 0, cable_color: 'blue', patch_panel_cross_port: 2, notes: 'نقطة رئيس قطاع التكنولوجيا' },
  { id: 'c3850-p3', device_id: 'cisco-switch-48', port_number: 3, label: 'Gi1/0/3', status: 'active', connected_device: 'جهاز المستشار القانوني أ/ محمد مصطفى', device_type: 'workstation', user_endpoint: 'مكتب 4/6 — الشؤون القانونية (PP1-03)', ip_address: '192.168.10.13', mac_address: 'A4:BB:6D:10:01:03', vlan_name: 'VLAN 10 - إدارة وموظفون', vlan_id: 10, speed_duplex: '1000 Mbps Full', poe_watts: 0, cable_color: 'blue', patch_panel_cross_port: 3, notes: 'ملفات قيمة تك وLTRA وITIDA' },
  { id: 'c3850-p4', device_id: 'cisco-switch-48', port_number: 4, label: 'Gi1/0/4', status: 'active', connected_device: 'جهاز المدير المالي أ/ هاني', device_type: 'workstation', user_endpoint: 'مكتب 2 — الإدارة المالية CFO (PP1-04)', ip_address: '192.168.10.14', mac_address: 'A4:BB:6D:10:01:04', vlan_name: 'VLAN 10 - إدارة وموظفون', vlan_id: 10, speed_duplex: '1000 Mbps Full', poe_watts: 0, cable_color: 'blue', patch_panel_cross_port: 4, notes: 'بوابة الضرائب ETA وبوابة فوري' },
  { id: 'c3850-p5', device_id: 'cisco-switch-48', port_number: 5, label: 'Gi1/0/5', status: 'active', connected_device: 'جهاز مدير العمليات م/ موفق', device_type: 'workstation', user_endpoint: 'مكتب 3 — غرفة عمليات 4B (PP1-05)', ip_address: '192.168.10.15', mac_address: 'A4:BB:6D:10:01:05', vlan_name: 'VLAN 10 - إدارة وموظفون', vlan_id: 10, speed_duplex: '1000 Mbps Full', poe_watts: 0, cable_color: 'blue', patch_panel_cross_port: 5, notes: 'متابعة الرحلات وطوارئ SOS' },
  { id: 'c3850-p6', device_id: 'cisco-switch-48', port_number: 6, label: 'Gi1/0/6', status: 'active', connected_device: 'جهاز مدير الأساطيل م/ عمرو', device_type: 'workstation', user_endpoint: 'مكتب 3 — غرفة عمليات 4B (PP1-06)', ip_address: '192.168.10.16', mac_address: 'A4:BB:6D:10:01:06', vlan_name: 'VLAN 10 - إدارة وموظفون', vlan_id: 10, speed_duplex: '1000 Mbps Full', poe_watts: 0, cable_color: 'blue', patch_panel_cross_port: 6, notes: 'إدارة الكباتن والحوافز' },
  { id: 'c3850-p7', device_id: 'cisco-switch-48', port_number: 7, label: 'Gi1/0/7', status: 'active', connected_device: 'طابعة ليزر شبكية HP LaserJet Pro M404n', device_type: 'printer', user_endpoint: 'مكتب 5 — مخرج الغرفة Room Drop PP1-07', ip_address: '192.168.10.45', mac_address: '3C:2A:F4:88:40:07', vlan_name: 'VLAN 10 - إدارة وموظفون', vlan_id: 10, speed_duplex: '1000 Mbps Full', poe_watts: 0, cable_color: 'orange', patch_panel_cross_port: 7, notes: 'المنفذ المرجعي لطابعة التقارير والعقود وبوالص الشحن' },
  { id: 'c3850-p8', device_id: 'cisco-switch-48', port_number: 8, label: 'Gi1/0/8', status: 'active', connected_device: 'جهاز كول سنتر #1 (Dell OptiPlex Core i5)', device_type: 'workstation', user_endpoint: 'القاعة المفتوحة — مقعد 1 (PP1-08)', ip_address: '192.168.15.21', mac_address: 'B8:CA:3A:15:00:08', vlan_name: 'VLAN 15 - كول سنتر', vlan_id: 15, speed_duplex: '1000 Mbps Full', poe_watts: 0, cable_color: 'indigo', patch_panel_cross_port: 8, notes: 'شاشة HP 22" بكاميرا مدمجة' },
  { id: 'c3850-p9', device_id: 'cisco-switch-48', port_number: 9, label: 'Gi1/0/9', status: 'active', connected_device: 'جهاز كول سنتر #2 (Dell OptiPlex Core i5)', device_type: 'workstation', user_endpoint: 'القاعة المفتوحة — مقعد 2 (PP1-09)', ip_address: '192.168.15.22', mac_address: 'B8:CA:3A:15:00:09', vlan_name: 'VLAN 15 - كول سنتر', vlan_id: 15, speed_duplex: '1000 Mbps Full', poe_watts: 0, cable_color: 'indigo', patch_panel_cross_port: 9, notes: 'شاشة HP 22" بكاميرا مدمجة' },
  { id: 'c3850-p10', device_id: 'cisco-switch-48', port_number: 10, label: 'Gi1/0/10', status: 'active', connected_device: 'جهاز كول سنتر #3 (Dell OptiPlex Core i5)', device_type: 'workstation', user_endpoint: 'القاعة المفتوحة — مقعد 3 (PP1-10)', ip_address: '192.168.15.23', mac_address: 'B8:CA:3A:15:00:10', vlan_name: 'VLAN 15 - كول سنتر', vlan_id: 15, speed_duplex: '1000 Mbps Full', poe_watts: 0, cable_color: 'indigo', patch_panel_cross_port: 10, notes: 'شاشة HP 22" بكاميرا مدمجة' },
  { id: 'c3850-p11', device_id: 'cisco-switch-48', port_number: 11, label: 'Gi1/0/11', status: 'standby', connected_device: 'مخرج كول سنتر #4 (توسعة +5 أجهزة Dell)', device_type: 'workstation', user_endpoint: 'القاعة المفتوحة — مقعد 4 (PP1-11)', ip_address: '192.168.15.24', mac_address: '—', vlan_name: 'VLAN 15 - كول سنتر', vlan_id: 15, speed_duplex: 'Auto 1G Ready', poe_watts: 0, cable_color: 'indigo', patch_panel_cross_port: 11, notes: 'ضمن خطة استكمال 8 مقاعد فورية' },
  { id: 'c3850-p12', device_id: 'cisco-switch-48', port_number: 12, label: 'Gi1/0/12', status: 'standby', connected_device: 'مخرج كول سنتر #5 / محلل البيانات', device_type: 'workstation', user_endpoint: 'القاعة المفتوحة — مقعد 5 (PP1-12)', ip_address: '192.168.15.25', mac_address: '—', vlan_name: 'VLAN 15 - كول سنتر', vlan_id: 15, speed_duplex: 'Auto 1G Ready', poe_watts: 0, cable_color: 'indigo', patch_panel_cross_port: 12, notes: 'خرائط حرارية وتقارير التشغيل' },
  { id: 'c3850-p13', device_id: 'cisco-switch-48', port_number: 13, label: 'Gi1/0/13', status: 'active', connected_device: 'سنترال جراند ستريم Grandstream 604A (LAN)', device_type: 'pbx', user_endpoint: 'راك U19 — السنترال المركزي (PP1-13)', ip_address: '192.168.30.1', mac_address: '00:0B:82:94:12:3C', vlan_name: 'VLAN 30 - سنترال VoIP', vlan_id: 30, speed_duplex: '1000 Mbps Full', poe_watts: 0, cable_color: 'green', patch_panel_cross_port: 13, notes: 'شغال ومربوط بالخط الأرضي الثاني' },
  { id: 'c3850-p14', device_id: 'cisco-switch-48', port_number: 14, label: 'Gi1/0/14', status: 'active', connected_device: 'هواتف Grandstream GRP2614 (تحويلات 101–102)', device_type: 'voip_phone', user_endpoint: 'مكتب 5 — م/ عماد وم/ سامح (PP1-14)', ip_address: '192.168.30.11', mac_address: '00:0B:82:AA:30:14', vlan_name: 'VLAN 30 - سنترال VoIP', vlan_id: 30, speed_duplex: '1000 Mbps PoE+', poe_watts: 8.4, cable_color: 'green', patch_panel_cross_port: 14, notes: 'تغذية PoE+ من السويتش مباشرة' },
  { id: 'c3850-p15', device_id: 'cisco-switch-48', port_number: 15, label: 'Gi1/0/15', status: 'active', connected_device: 'هواتف Grandstream GRP2614 (مالية/قانونية/عمليات 103–106)', device_type: 'voip_phone', user_endpoint: 'غرف 2–6 (PP1-15)', ip_address: '192.168.30.13', mac_address: '00:0B:82:AA:30:15', vlan_name: 'VLAN 30 - سنترال VoIP', vlan_id: 30, speed_duplex: '1000 Mbps PoE+', poe_watts: 12.6, cable_color: 'green', patch_panel_cross_port: 15, notes: 'تغذية PoE+ لعِدد الإدارة والعمليات' },
  { id: 'c3850-p16', device_id: 'cisco-switch-48', port_number: 16, label: 'Gi1/0/16', status: 'active', connected_device: 'هواتف كول سنتر GRP2614 (طابور 107–111)', device_type: 'voip_phone', user_endpoint: 'القاعة الكبرى المفتوحة (PP1-16)', ip_address: '192.168.30.17', mac_address: '00:0B:82:AA:30:16', vlan_name: 'VLAN 30 - سنترال VoIP', vlan_id: 30, speed_duplex: '1000 Mbps PoE+', poe_watts: 15.2, cable_color: 'green', patch_panel_cross_port: 16, notes: 'طابور خدمة العملاء 5 مقاعد' },
  { id: 'c3850-p17', device_id: 'cisco-switch-48', port_number: 17, label: 'Gi1/0/17', status: 'active', connected_device: 'مسجل كاميرات Hikvision 16ch 4K NVR', device_type: 'nvr', user_endpoint: 'راك U20 — غرفة السيرفرات (PP2-01)', ip_address: '192.168.20.100', mac_address: 'C4:2F:90:3A:55:12', vlan_name: 'VLAN 20 - كاميرات CCTV', vlan_id: 20, speed_duplex: '1000 Mbps Full', poe_watts: 0, cable_color: 'purple', patch_panel_cross_port: 1, notes: 'معزول بالكامل على VLAN 20' },
  { id: 'c3850-p18', device_id: 'cisco-switch-48', port_number: 18, label: 'Gi1/0/18', status: 'active', connected_device: 'كاميرات 1 و 2 (المدخل والاستقبال صوتية)', device_type: 'camera', user_endpoint: 'المدخل والاستقبال (PP2-02)', ip_address: '192.168.20.11', mac_address: 'C4:2F:90:20:01:02', vlan_name: 'VLAN 20 - كاميرات CCTV', vlan_id: 20, speed_duplex: '100 Mbps PoE+', poe_watts: 11.2, cable_color: 'purple', patch_panel_cross_port: 2, notes: 'كاميرا 2 مزودة بميكروفون صوتي' },
  { id: 'c3850-p19', device_id: 'cisco-switch-48', port_number: 19, label: 'Gi1/0/19', status: 'active', connected_device: 'كاميرات 3 و 4 (البصمة وغرفة السيرفرات صوتية)', device_type: 'camera', user_endpoint: 'ممر السيرفرات (PP2-03)', ip_address: '192.168.20.13', mac_address: 'C4:2F:90:20:03:04', vlan_name: 'VLAN 20 - كاميرات CCTV', vlan_id: 20, speed_duplex: '100 Mbps PoE+', poe_watts: 11.4, cable_color: 'purple', patch_panel_cross_port: 3, notes: 'كاميرا 4 صوتية على باب غرفة السيرفرات' },
  { id: 'c3850-p20', device_id: 'cisco-switch-48', port_number: 20, label: 'Gi1/0/20', status: 'active', connected_device: 'كاميرات 5 و 6 (داخل السيرفرات + القاعة ركن 1)', device_type: 'camera', user_endpoint: 'غرفة السيرفرات والقاعة (PP2-04)', ip_address: '192.168.20.15', mac_address: 'C4:2F:90:20:05:06', vlan_name: 'VLAN 20 - كاميرات CCTV', vlan_id: 20, speed_duplex: '100 Mbps PoE+', poe_watts: 10.8, cable_color: 'purple', patch_panel_cross_port: 4, notes: 'مراقبة راك 27U من الداخل' },
  { id: 'c3850-p21', device_id: 'cisco-switch-48', port_number: 21, label: 'Gi1/0/21', status: 'active', connected_device: 'كاميرات 7 و 8 (القاعة المفتوحة أركان 2 و 3)', device_type: 'camera', user_endpoint: 'القاعة الكبرى (PP2-05)', ip_address: '192.168.20.17', mac_address: 'C4:2F:90:20:07:08', vlan_name: 'VLAN 20 - كاميرات CCTV', vlan_id: 20, speed_duplex: '100 Mbps PoE+', poe_watts: 10.5, cable_color: 'purple', patch_panel_cross_port: 5, notes: 'تغطية شاملة للكول سنتر' },
  { id: 'c3850-p22', device_id: 'cisco-switch-48', port_number: 22, label: 'Gi1/0/22', status: 'active', connected_device: 'كاميرات 9 و 10 (القاعة ركن 4 + عمليات صوتية)', device_type: 'camera', user_endpoint: 'القاعة والعمليات (PP2-06)', ip_address: '192.168.20.19', mac_address: 'C4:2F:90:20:09:10', vlan_name: 'VLAN 20 - كاميرات CCTV', vlan_id: 20, speed_duplex: '100 Mbps PoE+', poe_watts: 11.2, cable_color: 'purple', patch_panel_cross_port: 6, notes: 'كاميرا 10 صوتية بغرفة العمليات' },
  { id: 'c3850-p23', device_id: 'cisco-switch-48', port_number: 23, label: 'Gi1/0/23', status: 'active', connected_device: 'كاميرات 11 و 12 (الممر + المالية ومكتب 5 صوتية)', device_type: 'camera', user_endpoint: 'الممر ومكتب 5 (PP2-07)', ip_address: '192.168.20.21', mac_address: 'C4:2F:90:20:11:12', vlan_name: 'VLAN 20 - كاميرات CCTV', vlan_id: 20, speed_duplex: '100 Mbps PoE+', poe_watts: 11.0, cable_color: 'purple', patch_panel_cross_port: 7, notes: 'كاميرا 12 صوتية' },
  { id: 'c3850-p24', device_id: 'cisco-switch-48', port_number: 24, label: 'Gi1/0/24', status: 'active', connected_device: 'كاميرات 13–16 (QA، المطبخ، الواجهة، الطابعة)', device_type: 'camera', user_endpoint: 'باقي المقر (PP2-08)', ip_address: '192.168.20.23', mac_address: 'C4:2F:90:20:13:16', vlan_name: 'VLAN 20 - كاميرات CCTV', vlan_id: 20, speed_duplex: '100 Mbps PoE+', poe_watts: 14.5, cable_color: 'purple', patch_panel_cross_port: 8, notes: 'مكتمل بكاميرات الأصدقاء 5MP' },
  { id: 'c3850-p25', device_id: 'cisco-switch-48', port_number: 25, label: 'Gi1/0/25', status: 'active', connected_device: 'Dell PowerEdge R640 — LACP Link 1', device_type: 'server', user_endpoint: 'راك U24 — سيرفر الإنتاج (PP2-17)', ip_address: '192.168.10.10', mac_address: 'D8:9E:F3:11:42:01', vlan_name: 'VLAN 50 - سيرفرات', vlan_id: 50, speed_duplex: '1000 Mbps LACP', poe_watts: 0, cable_color: 'cyan', patch_panel_cross_port: 17, notes: 'عضو في تجميع 4Gbps LACP' },
  { id: 'c3850-p26', device_id: 'cisco-switch-48', port_number: 26, label: 'Gi1/0/26', status: 'active', connected_device: 'Dell PowerEdge R640 — LACP Link 2', device_type: 'server', user_endpoint: 'راك U24 — سيرفر الإنتاج', ip_address: '192.168.10.10', mac_address: 'D8:9E:F3:11:42:02', vlan_name: 'VLAN 50 - سيرفرات', vlan_id: 50, speed_duplex: '1000 Mbps LACP', poe_watts: 0, cable_color: 'cyan', patch_panel_cross_port: null, notes: 'عضو في تجميع 4Gbps LACP' },
  { id: 'c3850-p27', device_id: 'cisco-switch-48', port_number: 27, label: 'Gi1/0/27', status: 'active', connected_device: 'Dell PowerEdge R640 — LACP Link 3', device_type: 'server', user_endpoint: 'راك U24 — سيرفر الإنتاج', ip_address: '192.168.10.10', mac_address: 'D8:9E:F3:11:42:03', vlan_name: 'VLAN 50 - سيرفرات', vlan_id: 50, speed_duplex: '1000 Mbps LACP', poe_watts: 0, cable_color: 'cyan', patch_panel_cross_port: null, notes: 'عضو في تجميع 4Gbps LACP' },
  { id: 'c3850-p28', device_id: 'cisco-switch-48', port_number: 28, label: 'Gi1/0/28', status: 'active', connected_device: 'Dell PowerEdge R640 — LACP Link 4', device_type: 'server', user_endpoint: 'راك U24 — سيرفر الإنتاج', ip_address: '192.168.10.10', mac_address: 'D8:9E:F3:11:42:04', vlan_name: 'VLAN 50 - سيرفرات', vlan_id: 50, speed_duplex: '1000 Mbps LACP', poe_watts: 0, cable_color: 'cyan', patch_panel_cross_port: null, notes: 'عضو في تجميع 4Gbps LACP' },
  { id: 'c3850-p29', device_id: 'cisco-switch-48', port_number: 29, label: 'Gi1/0/29', status: 'active', connected_device: 'وحدة إدارة سيرفر ديل iDRAC9 Enterprise', device_type: 'server', user_endpoint: 'راك U24 — إدارة خارج النطاق OOB', ip_address: '192.168.10.9', mac_address: 'D8:9E:F3:11:42:09', vlan_name: 'VLAN 99 - إدارة معزولة', vlan_id: 99, speed_duplex: '1000 Mbps Full', poe_watts: 0, cable_color: 'red', patch_panel_cross_port: null, notes: 'تحكم وإعادة تشغيل السيرفر عن بعد' },
  { id: 'c3850-p30', device_id: 'cisco-switch-48', port_number: 30, label: 'Gi1/0/30', status: 'active', connected_device: 'محطة/سيرفر HP Z440 #1 (Proxmox VE & Docker)', device_type: 'server', user_endpoint: 'راك U24 — بيئة الحاويات وOPNsense (PP2-18)', ip_address: '192.168.10.20', mac_address: 'E4:11:5B:C9:88:10', vlan_name: 'VLAN 50 - سيرفرات', vlan_id: 50, speed_duplex: '1000 Mbps Full', poe_watts: 0, cable_color: 'cyan', patch_panel_cross_port: 18, notes: 'تشغيل Proxmox VE 8.x + Docker + النسخ الليلي 3:00 ص' },
  { id: 'c3850-p31', device_id: 'cisco-switch-48', port_number: 31, label: 'Gi1/0/31', status: 'active', connected_device: 'خزنة مراقبة HP Z440 #2 (مكتب 5 — 3 شاشات)', device_type: 'workstation', user_endpoint: 'مكتب 5 — إدارة ومراقبة (PP1-19)', ip_address: '192.168.10.22', mac_address: 'E4:11:5B:C9:88:22', vlan_name: 'VLAN 50 - سيرفرات', vlan_id: 50, speed_duplex: '1000 Mbps Full', poe_watts: 0, cable_color: 'cyan', patch_panel_cross_port: 19, notes: 'محطة التطوير والمراقبة الثلاثية' },
  { id: 'c3850-p32', device_id: 'cisco-switch-48', port_number: 32, label: 'Gi1/0/32', status: 'active', connected_device: 'جهاز البصمة والحضور ZKTeco Biometric', device_type: 'workstation', user_endpoint: 'مدخل المقر — الموارد البشرية (PP1-20)', ip_address: '192.168.10.88', mac_address: '00:17:61:10:88:32', vlan_name: 'VLAN 10 - إدارة وموظفون', vlan_id: 10, speed_duplex: '100 Mbps Full', poe_watts: 0, cable_color: 'blue', patch_panel_cross_port: 20, notes: 'بورت 4370 لبرنامج الحضور مع أ/ سارة حسن' },
  { id: 'c3850-p33', device_id: 'cisco-switch-48', port_number: 33, label: 'Gi1/0/33', status: 'active', connected_device: 'جدار الحماية والراوتر TP-Link ER8411 (LAN Trunk)', device_type: 'firewall', user_endpoint: 'راك U18 — البوابة الأمنية المركزية', ip_address: '192.168.10.1', mac_address: '70:4C:A5:10:E2:80', vlan_name: 'VLAN 10 - إدارة وموظفون', vlan_id: 10, speed_duplex: '1000 Mbps Trunk', poe_watts: 0, cable_color: 'yellow', patch_panel_cross_port: null, notes: 'يربط ER8411 بالسويتش لتمرير إنترنت WE ADSL + Vodafone 5G' },
  { id: 'c3850-p34', device_id: 'cisco-switch-48', port_number: 34, label: 'Gi1/0/34', status: 'standby', connected_device: 'OPNsense Firewall VM (مساند على Z440)', device_type: 'firewall', user_endpoint: 'بيئة عزل واختبار داخلية', ip_address: '192.168.10.3', mac_address: '52:54:00:99:34:01', vlan_name: 'VLAN 99 - إدارة معزولة', vlan_id: 99, speed_duplex: '1000 Mbps Full', poe_watts: 0, cable_color: 'red', patch_panel_cross_port: null, notes: 'فايروول افتراضي مساند لـ ER8411' },
  { id: 'c3850-p35', device_id: 'cisco-switch-48', port_number: 35, label: 'Gi1/0/35', status: 'active', connected_device: 'مكتب البرمجة وضمان الجودة (م/ علي QA — غرفة 7)', device_type: 'workstation', user_endpoint: 'غرفة 7 — QA & Dev (PP1-21)', ip_address: '192.168.10.35', mac_address: 'D4:81:D7:70:35:01', vlan_name: 'VLAN 10 - إدارة وموظفون', vlan_id: 10, speed_duplex: '1000 Mbps Full', poe_watts: 0, cable_color: 'blue', patch_panel_cross_port: 21, notes: 'اختبار تطبيقات 4B ووكالة ودارو' },
  { id: 'c3850-p36', device_id: 'cisco-switch-48', port_number: 36, label: 'Gi1/0/36', status: 'active', connected_device: 'مكتب الموارد البشرية (أ/ سارة حسن — غرفة 6)', device_type: 'workstation', user_endpoint: 'غرفة 6 — HR (PP1-22)', ip_address: '192.168.10.36', mac_address: 'D4:81:D7:60:36:01', vlan_name: 'VLAN 10 - إدارة وموظفون', vlan_id: 10, speed_duplex: '1000 Mbps Full', poe_watts: 0, cable_color: 'blue', patch_panel_cross_port: 22, notes: 'متابعة البصمة والعقود' },
  { id: 'c3850-p37', device_id: 'cisco-switch-48', port_number: 37, label: 'Gi1/0/37', status: 'active', connected_device: 'أكسس بوينت واي فاي Ubiquiti UniFi AP #1', device_type: 'access_point', user_endpoint: 'سقف الصالة والاستقبال (PP2-21)', ip_address: '192.168.10.150', mac_address: '74:83:C2:40:37:01', vlan_name: 'VLAN 40 - واي فاي', vlan_id: 40, speed_duplex: '1000 Mbps PoE+', poe_watts: 15.4, cable_color: 'white', patch_panel_cross_port: 21, notes: 'بث شبكة الموظفين وشبكة الضيوف المعزولة' },
  { id: 'c3850-p38', device_id: 'cisco-switch-48', port_number: 38, label: 'Gi1/0/38', status: 'standby', connected_device: 'أكسس بوينت واي فاي UniFi AP #2 (غرف الإدارة)', device_type: 'access_point', user_endpoint: 'سقف الممر الإداري (PP2-22)', ip_address: '192.168.10.151', mac_address: '—', vlan_name: 'VLAN 40 - واي فاي', vlan_id: 40, speed_duplex: 'PoE+ Ready', poe_watts: 0, cable_color: 'white', patch_panel_cross_port: 22, notes: 'جاهز للتوسع في التغطية اللاسلكية' },
  { id: 'c3850-p45', device_id: 'cisco-switch-48', port_number: 45, label: 'Gi1/0/45', status: 'active', connected_device: 'دائرة 4B المباشرة الأساسية (WE Fiber PRI-4821)', device_type: 'uplink', user_endpoint: 'سنترال المعادي ↔ سحابة 4B', ip_address: '10.10.40.10', mac_address: '00:1A:A1:91:45:01', vlan_name: 'VLAN 90-92 خطوط WE و4B', vlan_id: 91, speed_duplex: '1000 Mbps Full', poe_watts: 0, cable_color: 'cyan', patch_panel_cross_port: null, notes: 'اختبار زمن التأخير < 5ms' },
  { id: 'c3850-p46', device_id: 'cisco-switch-48', port_number: 46, label: 'Gi1/0/46', status: 'standby', connected_device: 'دائرة طوارئ 4B الاحتياطية (DR-4822)', device_type: 'uplink', user_endpoint: 'مسار التحويل الفوري DR', ip_address: '10.10.40.11', mac_address: '00:1A:A1:92:46:01', vlan_name: 'VLAN 90-92 خطوط WE و4B', vlan_id: 92, speed_duplex: '1000 Mbps Full', poe_watts: 0, cable_color: 'orange', patch_panel_cross_port: null, notes: 'Failover تلقائي عند انقطاع الخط الأساسي' },
  { id: 'c3850-p47', device_id: 'cisco-switch-48', port_number: 47, label: 'Gi1/0/47', status: 'active', connected_device: 'إدارة السويتش Console / OOB Port', device_type: 'switch', user_endpoint: 'إدارة شبكة المعادي', ip_address: '192.168.10.2', mac_address: 'F4:0F:1B:7A:48:47', vlan_name: 'VLAN 99 - إدارة معزولة', vlan_id: 99, speed_duplex: '1000 Mbps Full', poe_watts: 0, cable_color: 'red', patch_panel_cross_port: null, notes: 'SSH Management للمهندس عماد الشرقاوي' },
  { id: 'c3850-p48', device_id: 'cisco-switch-48', port_number: 48, label: 'Gi1/0/48', status: 'active', connected_device: 'خط تجميع فايبر WE (24Mbps L3VPN Hub - PO 6078927)', device_type: 'uplink', user_endpoint: 'المعادي ↔ القرية الذكية و6 محافظات', ip_address: '10.50.10.1', mac_address: '00:1A:A1:90:48:01', vlan_name: 'VLAN 90-92 خطوط WE و4B', vlan_id: 90, speed_duplex: '1000 Mbps Full', poe_watts: 0, cable_color: 'cyan', patch_panel_cross_port: null, notes: 'توريد 4–6 أسابيع عبر م/ أحمد محرم' },
];

// Populate remaining Cisco 3850 ports (39-44) cleanly so all 48 ports exist and are clickable
const ciscoMap = new Map(CORE_RACK_PORTS.filter((p) => p.device_id === 'cisco-switch-48').map((p) => [p.port_number, p]));
for (let p = 1; p <= 48; p++) {
  if (!ciscoMap.has(p)) {
    const isCallCenterExpansion = p >= 39 && p <= 44;
    CORE_RACK_PORTS.push({
      id: `c3850-p${p}`,
      device_id: 'cisco-switch-48',
      port_number: p,
      label: `Gi1/0/${p}`,
      status: 'free',
      connected_device: isCallCenterExpansion ? `مخرج توسعة القاعة الكبرى #${p - 38}` : 'منفذ سويتش احتياطي حر',
      device_type: 'workstation',
      user_endpoint: isCallCenterExpansion ? 'القاعة المفتوحة (التوسع لـ 17 مقعداً)' : 'متاح للتخصيص',
      ip_address: isCallCenterExpansion ? `192.168.15.${p}` : '—',
      mac_address: '—',
      vlan_name: isCallCenterExpansion ? 'VLAN 15 - كول سنتر' : 'VLAN 10 - إدارة وموظفون',
      vlan_id: isCallCenterExpansion ? 15 : 10,
      speed_duplex: '1000 Mbps Auto',
      poe_watts: 0,
      cable_color: 'slate',
      patch_panel_cross_port: p <= 24 ? p : null,
      notes: 'جاهز لتأريج حاتم الفني عند إضافة أجهزة جديدة',
    });
  }
}

export const MESHAWIR_RACK_PORTS: RackPort[] = CORE_RACK_PORTS;

export const MESHAWIR_LEASED_LINES: LeasedLineItem[] = [
  { id: 'line-we-adsl-1', circuit_reference: 'WE-ADSL-MAADI-LINE1', provider_name: 'المصرية للاتصالات WE', service_type: 'Primary Landline ADSL (Line 1)', bandwidth_mbps: 30, source_endpoint: 'الخط الأرضي رقم 1 بمقر المعادي', destination_endpoint: 'راوتر WE ADSL ← TP-Link ER8411 WAN1', primary_gateway_ip: '192.168.1.1', backup_gateway_ip: '192.168.10.1', monthly_cost_egp: 500, contract_ref: 'خط أرضي 1', status: 'active', notes: 'تم تشغيله فعلياً وربطه على TP-Link ER8411' },
  { id: 'line-vf-5g-live', circuit_reference: 'VF-5G-MAADI-WAN2', provider_name: 'فودافون مصر (Vodafone 5G)', service_type: '5G Wireless High-Speed WAN', bandwidth_mbps: 100, source_endpoint: 'راوتر Vodafone 5G بالمقر', destination_endpoint: 'TP-Link ER8411 WAN2', primary_gateway_ip: '192.168.8.1', backup_gateway_ip: '192.168.10.1', monthly_cost_egp: 750, contract_ref: 'فاتورة #748994 + باقة 5G', status: 'active', notes: 'شغال فعلياً الآن مع TP-Link ER8411 لرفع السرعة والاستقرار' },
  { id: 'line-we-pstn-2', circuit_reference: 'WE-PSTN-MAADI-LINE2', provider_name: 'المصرية للاتصالات WE', service_type: 'Dedicated Voice Landline (Line 2)', bandwidth_mbps: 1, source_endpoint: 'الخط الأرضي رقم 2 بمقر المعادي', destination_endpoint: 'منفذ FXO-1 بسنترال Grandstream 604A', primary_gateway_ip: 'FXO-1', backup_gateway_ip: 'FXS-1', monthly_cost_egp: 250, contract_ref: 'خط أرضي 2 للسنترال', status: 'active', notes: 'تم تركيبه على سنترال Grandstream 604A فعلياً' },
  { id: 'line-4b-we-fiber', circuit_reference: 'TE-CAI-4B-PRI-4821', provider_name: 'المصرية للاتصالات WE', service_type: 'L3VPN Fiber 24Mbps + 6 Governorates (4Mbps ea)', bandwidth_mbps: 24, source_endpoint: 'سنترال المعادي ↔ القرية الذكية', destination_endpoint: 'سويتش سيسكو Port 45/48 وER8411 WAN3', primary_gateway_ip: '10.10.40.10', backup_gateway_ip: '10.10.40.11', monthly_cost_egp: 30000, contract_ref: 'order#6078927 (360,000/yr)', status: 'active', notes: 'توريد 4–6 أسابيع من 29/09/2026، وزمن تأخير مستهدف < 5ms' },
];

export const MESHAWIR_CCTV_CAMERAS: CctvCameraItem[] = [
  { id: 'cam-01', camera_number: 1, model: 'Hikvision 5MP IP Camera', location_in_office: 'مدخل الشارع الرئيسي والباب الخارجي للمقر', nvr_channel: 1, ip_address: '192.168.20.11', switch_port: 18, has_audio_mic: false, status: 'online' },
  { id: 'cam-02', camera_number: 2, model: 'Hikvision 5MP Audio IP', location_in_office: 'منطقة الاستقبال والباب الداخلي الرئيسي (صوتية)', nvr_channel: 2, ip_address: '192.168.20.12', switch_port: 18, has_audio_mic: true, status: 'online' },
  { id: 'cam-03', camera_number: 3, model: 'Hikvision 5MP IP Camera', location_in_office: 'جهاز البصمة ZKTeco والممر الفاصل', nvr_channel: 3, ip_address: '192.168.20.13', switch_port: 19, has_audio_mic: false, status: 'online' },
  { id: 'cam-04', camera_number: 4, model: 'Hikvision 5MP Audio IP', location_in_office: 'مدخل ومحيط غرفة السيرفرات المصفحة (صوتية)', nvr_channel: 4, ip_address: '192.168.20.14', switch_port: 19, has_audio_mic: true, status: 'online' },
  { id: 'cam-05', camera_number: 5, model: 'Hikvision 5MP IP Camera', location_in_office: 'داخل غرفة السيرفرات مواجهة كابينة راك Perla 27U', nvr_channel: 5, ip_address: '192.168.20.15', switch_port: 20, has_audio_mic: false, status: 'online' },
  { id: 'cam-06', camera_number: 6, model: 'Hikvision 5MP IP Camera', location_in_office: 'القاعة المفتوحة للكول سنتر — الركن الأول', nvr_channel: 6, ip_address: '192.168.20.16', switch_port: 20, has_audio_mic: false, status: 'online' },
  { id: 'cam-07', camera_number: 7, model: 'Hikvision 5MP IP Camera', location_in_office: 'القاعة المفتوحة للكول سنتر — الركن الثاني', nvr_channel: 7, ip_address: '192.168.20.17', switch_port: 21, has_audio_mic: false, status: 'online' },
  { id: 'cam-08', camera_number: 8, model: 'Hikvision 5MP IP Camera', location_in_office: 'القاعة المفتوحة للكول سنتر — الركن الثالث', nvr_channel: 8, ip_address: '192.168.20.18', switch_port: 21, has_audio_mic: false, status: 'online' },
  { id: 'cam-09', camera_number: 9, model: 'Hikvision 5MP IP Camera', location_in_office: 'القاعة المفتوحة للكول سنتر — الركن الرابع', nvr_channel: 9, ip_address: '192.168.20.19', switch_port: 22, has_audio_mic: false, status: 'online' },
  { id: 'cam-10', camera_number: 10, model: 'Hikvision 5MP Audio IP', location_in_office: 'مكتب إدارة العمليات (م/ موفق وم/ عمرو — صوتية)', nvr_channel: 10, ip_address: '192.168.20.20', switch_port: 22, has_audio_mic: true, status: 'online' },
  { id: 'cam-11', camera_number: 11, model: 'Hikvision 5MP IP Camera', location_in_office: 'الممر الداخلي للغرف الإدارية والمالية', nvr_channel: 11, ip_address: '192.168.20.21', switch_port: 23, has_audio_mic: false, status: 'online' },
  { id: 'cam-12', camera_number: 12, model: 'Hikvision 5MP Audio IP', location_in_office: 'مكتب الإدارة المالية والحسابات ومكتب 5 (صوتية)', nvr_channel: 12, ip_address: '192.168.20.22', switch_port: 23, has_audio_mic: true, status: 'online' },
  { id: 'cam-13', camera_number: 13, model: 'Hikvision 5MP IP Camera', location_in_office: 'محيط مكتب البرمجة والجودة (غرفة 7)', nvr_channel: 13, ip_address: '192.168.20.23', switch_port: 24, has_audio_mic: false, status: 'online' },
  { id: 'cam-14', camera_number: 14, model: 'Hikvision 5MP IP Camera', location_in_office: 'منطقة الخدمات والمطبخ الصغير', nvr_channel: 14, ip_address: '192.168.20.24', switch_port: 24, has_audio_mic: false, status: 'online' },
  { id: 'cam-15', camera_number: 15, model: 'Hikvision 5MP IP Camera', location_in_office: 'محيط النوافذ والواجهة الرئيسية للمقر', nvr_channel: 15, ip_address: '192.168.20.25', switch_port: 24, has_audio_mic: false, status: 'online' },
  { id: 'cam-16', camera_number: 16, model: 'Hikvision 5MP IP Camera', location_in_office: 'نقطة الطابعة المركزية M404n والممر الخلفي', nvr_channel: 16, ip_address: '192.168.20.26', switch_port: 24, has_audio_mic: false, status: 'online' },
];

export const MESHAWIR_VOIP_EXTENSIONS: VoipExtensionItem[] = [
  { id: 'ext-100', extension_number: '100', user_name: 'الاستقبال والفاكس (الخط الأنالوج المباشر FXS-1)', department: 'الاستقبال', device_model: 'Analog Phone FXS-1', ip_address: 'FXS-1', switch_port: 13, vlan_id: 30, status: 'active' },
  { id: 'ext-101', extension_number: '101', user_name: 'المهندس عماد الشرقاوي (مدير الفرع)', department: 'الإدارة التقنية (مكتب 5)', device_model: 'Grandstream GRP2614', ip_address: '192.168.30.11', switch_port: 14, vlan_id: 30, status: 'active' },
  { id: 'ext-102', extension_number: '102', user_name: 'المهندس سامح يس (CTO)', department: 'الإدارة التقنية (مكتب 5)', device_model: 'Grandstream GRP2614', ip_address: '192.168.30.12', switch_port: 14, vlan_id: 30, status: 'active' },
  { id: 'ext-103', extension_number: '103', user_name: 'الأستاذ هاني (CFO)', department: 'الإدارة المالية', device_model: 'Grandstream GRP2614', ip_address: '192.168.30.13', switch_port: 15, vlan_id: 30, status: 'active' },
  { id: 'ext-104', extension_number: '104', user_name: 'الأستاذ محمد مصطفى', department: 'الشؤون القانونية', device_model: 'Grandstream GRP2614', ip_address: '192.168.30.14', switch_port: 15, vlan_id: 30, status: 'active' },
  { id: 'ext-105', extension_number: '105', user_name: 'م/ موفق (إدارة العمليات)', department: 'عمليات 4B', device_model: 'Grandstream GRP2614', ip_address: '192.168.30.15', switch_port: 15, vlan_id: 30, status: 'active' },
  { id: 'ext-106', extension_number: '106', user_name: 'م/ عمرو (إدارة الأساطيل)', department: 'عمليات 4B', device_model: 'Grandstream GRP2614', ip_address: '192.168.30.16', switch_port: 15, vlan_id: 30, status: 'active' },
  { id: 'ext-107', extension_number: '107', user_name: 'كول سنتر 1 — خدمة العملاء والركاب', department: 'خدمة العملاء', device_model: 'Grandstream GRP2614', ip_address: '192.168.30.17', switch_port: 16, vlan_id: 30, status: 'active' },
  { id: 'ext-108', extension_number: '108', user_name: 'كول سنتر 2 — دعم الكباتن', department: 'خدمة العملاء', device_model: 'Grandstream GRP2614', ip_address: '192.168.30.18', switch_port: 16, vlan_id: 30, status: 'active' },
  { id: 'ext-109', extension_number: '109', user_name: 'كول سنتر 3 — الشكاوى والمفقودات', department: 'خدمة العملاء', device_model: 'Grandstream GRP2614', ip_address: '192.168.30.19', switch_port: 16, vlan_id: 30, status: 'active' },
  { id: 'ext-110', extension_number: '110', user_name: 'كول سنتر 4 — متابعة الرحلات', department: 'خدمة العملاء', device_model: 'Grandstream GRP2614', ip_address: '192.168.30.20', switch_port: 16, vlan_id: 30, status: 'active' },
  { id: 'ext-111', extension_number: '111', user_name: 'كول سنتر 5 — طوارئ SOS والطرق', department: 'خدمة العملاء', device_model: 'Grandstream GRP2614', ip_address: '192.168.30.21', switch_port: 16, vlan_id: 30, status: 'active' },
];

export const MESHAWIR_QUOTATIONS: MeshawirQuotationItem[] = [
  { id: 'qt-qts-1169', provider_id: 'prov-qts-servers', quote_number: '#1169', title: 'فاتورة QTS الضريبية: سيرفر Dell R640 + محطتي HP Z440', submission_date: '2026-09-26', subtotal_egp: 84470.0, vat_egp: 11825.8, total_egp: 96295.8, is_tax_invoice: true, eta_uuid: '7ZYZDKGHRVSDN70R4SP81F3M10', status: 'مدفوعة ومعتمدة ETA' },
  { id: 'qt-qts-1172', provider_id: 'prov-qts-servers', quote_number: '#1172', title: 'فاتورة QTS الضريبية: سويتش سيسكو Catalyst 3850-48P PoE+', submission_date: '2026-09-28', subtotal_egp: 10500.0, vat_egp: 1470.0, total_egp: 11970.0, is_tax_invoice: true, eta_uuid: 'K1G9T4WV39B521M0EYV8EM3M10', status: 'مدفوعة ومعتمدة ETA' },
  { id: 'qt-techno-dokki', provider_id: 'prov-qts-servers', quote_number: '#1660751017094', title: 'فاتورة تكنو ستورز الدقي: 3x Dell i5 الجيل 10 + 3x شاشات HP 22" + ملحقات', submission_date: '2026-06-09', subtotal_egp: 35001.0, vat_egp: 4900.14, total_egp: 39901.14, is_tax_invoice: true, eta_uuid: '2YMG3N8EF4WVMEB3V67G7PTK10', status: 'مدفوعة ومعتمدة ETA' },
  { id: 'qt-redline-15947', provider_id: 'prov-redline', quote_number: '#15947', title: 'فاتورة رد لاين البستان: راك Perla 27U + I-Pook PK65H + أدوات شبكة', submission_date: '2026-03-29', subtotal_egp: 16271.93, vat_egp: 2278.07, total_egp: 18550.0, is_tax_invoice: true, eta_uuid: '6T3HM2FA86TEDZEBQHYPFWMK10', status: 'مدفوعة ومعتمدة ETA' },
  { id: 'qt-menshawy-1096', provider_id: 'prov-redline', quote_number: '#001096', title: 'إذن المنشاوي البستان المؤقت: هاردات HP SAS 1.2TB/2TB وكابلات (بانتظار فاتورة ETA)', submission_date: '2026-09-28', subtotal_egp: 8510.0, vat_egp: 0, total_egp: 8510.0, is_tax_invoice: false, eta_uuid: null, status: 'مدفوعة نقداً — مطلوب فاتورة ضريبية ومراجعة الحساب' },
  { id: 'qt-vodafone-748994', provider_id: 'prov-vodafone-5g', quote_number: '#748994', title: 'فاتورة فودافون صقر قريش: راوتر H153-381 + شريحة + باقة 520', submission_date: '2026-09-28', subtotal_egp: 2917.95, vat_egp: 408.51, total_egp: 3326.46, is_tax_invoice: true, eta_uuid: null, status: 'مدفوعة' },
  { id: 'qt-raneen-40', provider_id: 'prov-redline', quote_number: '#40-0217871', title: 'فاتورة طيبة رنين الفسطاط: سلم 6 درجات + 4 كراسي راتان + طاولة', submission_date: '2026-03-26', subtotal_egp: 2588.6, vat_egp: 362.4, total_egp: 2951.0, is_tax_invoice: true, eta_uuid: '34GAMWHCFDFNTGX5QWDGJ8PK10', status: 'مدفوعة ومعتمدة ETA' },
  { id: 'qt-ec-host1', provider_id: 'prov-ec-egypt', quote_number: '#1331', title: 'فاتورة EC استضافة Host1 لموقع mashawer.com.eg حتى 10/08/2027', submission_date: '2026-08-11', subtotal_egp: 2200.0, vat_egp: 308.0, total_egp: 2508.0, is_tax_invoice: true, eta_uuid: null, status: 'مدفوعة حتى 2027' },
  { id: 'qt-ec-domain', provider_id: 'prov-ec-egypt', quote_number: '#1325', title: 'فاتورة EC تسجيل دومين mashawer.com.eg حتى 08/08/2027', submission_date: '2026-08-09', subtotal_egp: 1100.0, vat_egp: 154.0, total_egp: 1254.0, is_tax_invoice: true, eta_uuid: null, status: 'مدفوعة حتى 2027' },
  { id: 'qt-friends-cctv', provider_id: 'prov-friends-cctv', quote_number: 'PO-FRIENDS-55050', title: 'عرض الأصدقاء (م/ علي) لكاميرات مقر المعادي + NVR 4K + 4TB Purple', submission_date: '2026-09-24', subtotal_egp: 55050.0, vat_egp: 0, total_egp: 55050.0, is_tax_invoice: false, eta_uuid: null, status: 'معتمد وقيد التسوية (2MP vs 5MP)' },
  { id: 'qt-we-l3vpn', provider_id: 'prov-we-telecom', quote_number: 'order#6078927', title: 'أمر شراء WE: فايبر 24Mbps للمقر + 6 خطوط محافظات 4Mbps (سنوي)', submission_date: '2026-09-29', subtotal_egp: 360000.0, vat_egp: 0, total_egp: 360000.0, is_tax_invoice: false, eta_uuid: null, status: 'معتمد (90,000 كل ربع سنة)' },
  { id: 'qt-we-cloud-waf', provider_id: 'prov-we-telecom', quote_number: 'order#6078933', title: 'أمر شراء WE: 3 خوادم 4B + 20Mbps + F5 WAF + 7 SSL VPN + باك أب 30 يوم (سنوي)', submission_date: '2026-09-29', subtotal_egp: 807496.0, vat_egp: 0, total_egp: 807496.0, is_tax_invoice: false, eta_uuid: null, status: 'معتمد (201,874 كل ربع سنة)' },
];

export const MESHAWIR_FACILITY_ZONES: FacilityZoneItem[] = [
  { id: 'zone-open-hall', zone_name: 'القاعة الكبرى المفتوحة (Open Hall)', allocated_purpose: 'صالة الكول سنتر وخدمة العملاء والعمليات', dimensions_text: '9.60م × 12.28م', capacity_people: 17, workstation_ports_count: 17, cctv_cameras_count: 4, assigned_staff: 'فريق الكول سنتر (5 الآن ← 17 مستقبلاً) + محلل البيانات', notes: 'توصيل سلكي 100% Cat6 بدون الاعتماد على Wi-Fi' },
  { id: 'zone-server-room', zone_name: 'غرفة السيرفرات المصفحة (Server Room)', allocated_purpose: 'حاضنة راك Perla 27U والاتصالات والسنترال', dimensions_text: '5.74م × 1.96م', capacity_people: 2, workstation_ports_count: 4, cctv_cameras_count: 2, assigned_staff: 'المهندس عماد الشرقاوي والمهندس سامح يس', notes: 'باب مصفح + تكييف 24/7 + كاميرا داخلية وأخرى خارجية' },
  { id: 'zone-room-1', zone_name: 'الغرفة رقم 1', allocated_purpose: 'مكتب إداري مزدوج / قيادة تشغيلية', dimensions_text: 'مكتب قياسي', capacity_people: 2, workstation_ports_count: 2, cctv_cameras_count: 0, assigned_staff: 'قيادة الإدارة / التشغيل', notes: 'مخارج شبكة مزدوجة' },
  { id: 'zone-room-2', zone_name: 'الغرفة رقم 2', allocated_purpose: 'مكتب الإدارة المالية (CFO)', dimensions_text: 'مكتب قياسي', capacity_people: 2, workstation_ports_count: 2, cctv_cameras_count: 1, assigned_staff: 'الأستاذ هاني', notes: 'توصيلات شبكة سلكية مستقلة' },
  { id: 'zone-room-3', zone_name: 'الغرفة رقم 3', allocated_purpose: 'غرفة عمليات 4B والمشرفين', dimensions_text: 'مكتب قياسي', capacity_people: 2, workstation_ports_count: 2, cctv_cameras_count: 1, assigned_staff: 'م/ موفق وم/ عمرو', notes: 'متابعة الأسطول والحملات' },
  { id: 'zone-room-4', zone_name: 'الغرفة رقم 4', allocated_purpose: 'مكتب الشؤون القانونية أو الاجتماعات المغلقة', dimensions_text: 'مكتب قياسي', capacity_people: 4, workstation_ports_count: 2, cctv_cameras_count: 0, assigned_staff: 'أ/ محمد مصطفى / اجتماعات', notes: '' },
  { id: 'zone-room-5', zone_name: 'الغرفة رقم 5 (مكتب التقنية CTO)', allocated_purpose: 'مكتب المهندس عماد الشرقاوي والمهندس سامح يس + الطابعة M404n + محطة Z440 #2', dimensions_text: 'مكتب قياسي', capacity_people: 2, workstation_ports_count: 4, cctv_cameras_count: 1, assigned_staff: 'المهندس عماد الشرقاوي والمهندس سامح يس', notes: 'مربوطة بطابعة HP M404n على منفذ السيسكو Gi1/0/7' },
  { id: 'zone-room-6', zone_name: 'الغرفة رقم 6', allocated_purpose: 'مكتب الموارد البشرية والشؤون الإدارية', dimensions_text: 'مكتب قياسي', capacity_people: 2, workstation_ports_count: 2, cctv_cameras_count: 0, assigned_staff: 'أ/ سارة حسن', notes: 'حفظ ملفات الموظفين وعقودهم' },
  { id: 'zone-room-7', zone_name: 'الغرفة رقم 7', allocated_purpose: 'مكتب البرمجة وضمان الجودة (QA)', dimensions_text: 'مكتب قياسي', capacity_people: 3, workstation_ports_count: 3, cctv_cameras_count: 1, assigned_staff: 'م/ علي (QA) وم/ أحمد عبيد ومهندسون جدد', notes: 'اختبار تطبيقات 4B ووكالة ودارو' },
  { id: 'zone-reception-wc', zone_name: 'الاستقبال والمدخل + دورتي المياه 1 و 2', allocated_purpose: 'الاستقبال، جهاز البصمة ZKTeco، وتليفون 100', dimensions_text: 'مدخل رئيسي + حمامان', capacity_people: 4, workstation_ports_count: 2, cctv_cameras_count: 2, assigned_staff: 'الاستقبال والأمن', notes: 'كاميرا صوتية على المدخل والاستقبال' },
];

export const MESHAWIR_HARDWARE: HardwareInventoryItem[] = [
  { id: 'hw-tplink-er8411', name: 'TP-Link ER8411 Router & Firewall', role: 'راوتر وجدار حماية رئيسي Multi-WAN', specs: '10G SFP+ & Gigabit Multi-WAN (WE ADSL + Vodafone 5G) + VPN + VLAN Firewall', location: 'راك Perla 27U (U18)', invoice_ref: 'مشتريات مباشرة جديدة', vendor: 'TP-Link', status: 'تم الشراء والتشغيل الفعلي الآن' },
  { id: 'hw-grandstream-604a', name: 'Grandstream UCM6304A ("604A") IP PBX', role: 'سنترال المقر الذكي + عِدد GRP2614', specs: '4 FXO (الخط الأرضي الثاني) + 4 FXS + SIP + شاشة LCD + تسجيل مكالمات', location: 'راك Perla 27U (U19)', invoice_ref: 'توريد السنترال والعِدد', vendor: 'Grandstream', status: 'تم الشراء والتركيب والتشغيل الفعلي' },
  { id: 'hw-dell-r640', name: 'Dell PowerEdge R640 Platinum', role: 'خادم الإنتاج والنسخ الاحتياطي المحلي', specs: '2x Xeon Platinum 8160 (48C/96T) • 64GB ECC • 2x256GB SSD + 3x1.2TB SAS', location: 'راك Perla 27U (U24)', invoice_ref: 'ETA #1169 (54,000 ج.م)', vendor: 'QTS Servers', status: 'مورد ومثبت بالراك' },
  { id: 'hw-z440-1', name: 'HP Workstation Z440 #1', role: 'خادم Proxmox وDocker وخزنة الباك أب', specs: 'Xeon E5-2697 v4 (18C) • 64GB ECC • 2x1TB NVMe + 4TB HDD', location: 'راك Perla 27U (U24/U23)', invoice_ref: 'ETA #1169 (15,235 ج.م)', vendor: 'QTS Servers', status: 'مورد ومثبت بالراك' },
  { id: 'hw-z440-2', name: 'HP Workstation Z440 #2', role: 'محطة المراقبة والتطوير (3 شاشات HP)', specs: 'Xeon E5-2697 v4 • 16GB RAM • 3x HP 22" Monitors', location: 'مكتب 5 (غرفة التقنية)', invoice_ref: 'ETA #1169 (15,235 ج.م)', vendor: 'QTS Servers', status: 'جاهز وشغال بمكتب 5' },
  { id: 'hw-cisco-3850', name: 'Cisco Catalyst 3850-48P PoE+', role: 'السويتش المركزي للمقر', specs: '48x 1G PoE+ • Dual 715W PSU • 4x 10G SFP+', location: 'راك Perla 27U (U26)', invoice_ref: 'ETA #1172 (11,970 ج.م)', vendor: 'QTS Servers', status: 'مورد ومثبت بالراك' },
  { id: 'hw-dell-optiplex-3', name: '3x Dell OptiPlex Core i5 (Gen 10)', role: 'محطات عمل العمليات والتحليل (مبدئياً)', specs: 'Core i5 10th Gen + 3x HP 22" Webcam Monitors', location: 'غرفة العمليات + مكتب المحلل', invoice_ref: 'ETA #1660751017094 (39,901 ج.م)', vendor: 'تكنو ستورز الدقي', status: 'مشغلة وموزعة (ومطلوب +5 أجهزة الآن)' },
  { id: 'hw-printer-m404n', name: 'HP LaserJet Pro M404n', role: 'طابعة الليزر الشبكية المركزية', specs: 'شبكية على المنفذ Gi1/0/7 (192.168.10.45)', location: 'مكتب 5', invoice_ref: 'أصول المقر', vendor: 'HP', status: 'نشطة على الشبكة' },
];

export const MESHAWIR_LEGAL_DOSSIERS: LegalDossierItem[] = [
  { id: 'leg-1-valuetech', dossier_title: 'ملف تسوية/إنذار شركة قيمة تك وحماية السورس كود وKeystore', authority_name: 'القضاء المدني / تسوية تعاقدية', case_reference: 'خطة 7 أسابيع أو إنذار على يد محضر', lead_counsel: 'أ/ محمد مصطفى (المحامي)', status: 'عاجل وقيد الحسم', action_required: 'ربط كل دفعة بتسليم السورس كود الفعلي ومفاتيح التوقيع' },
  { id: 'leg-2-ltra', dossier_title: 'ملف ترخيص النقل الذكي والربط المباشر وفق قانون 87/2018 وقرار 2180/2019', authority_name: 'جهاز تنظيم النقل البري (LTRA)', case_reference: 'خطاب م/ ضياء الدين يوسف (24/05/2026)', lead_counsel: 'أ/ محمد مصطفى (المحامي)', status: 'نشط ومستمر', action_required: 'استكمال الربط الإلكتروني عبر خوادم WE والالتزام بالمعايير' },
  { id: 'leg-3-ip-itida', dossier_title: 'حماية الملكية الفكرية وإيداع البرمجيات والعلامات التجارية', authority_name: 'هيئة ITIDA والسجل التجاري والشهر العقاري', case_reference: 'حماية تطبيقات 4B ووكالة ودارو', lead_counsel: 'أ/ محمد مصطفى (المحامي)', status: 'قيد التجهيز', action_required: 'استخراج شهادات الإيداع وإثبات التاريخ وإتمام رقم DUNS للمتاجر' },
  { id: 'leg-4-hr-contracts', dossier_title: 'عقود الموظفين وإقرارات السرية NDA وعهدة الأجهزة والخطوط الرسمية', authority_name: 'الشؤون القانونية والاتصالات', case_reference: 'خطوط المحمول والأرضي للمقر', lead_counsel: 'أ/ محمد مصطفى (المحامي)', status: 'جاري التنفيذ', action_required: 'توثيق عقود الكول سنتر وعهدة الأجهزة واستكمال ملفات المحمول والأرضي' },
];

export const MESHAWIR_SUBSIDIARY = {
  id: 'sub-abu-khaled-1',
  proposal_title: 'مقترح تأسيس الشركة التابعة التكنولوجية خارج القاهرة (مملوكة لأبو خالد)',
  recipient_investor: 'أبو خالد',
  proposed_by: 'المهندس سامح يس',
  status: 'قيد الدراسة مع أبو خالد والمحامي',
  structure: '4 مهندسين أساسيين + 2 استشاريين (بانتظار حسم الاسم التجاري ونسب الشراكة)',
  strategic_objectives: [
    '1- فصل المخاطر وحماية أصول البرمجيات',
    '2- بناء ذراع تطوير داخلي يغني عن المطورين الخارجيين',
    '3- تقديم خدمات التحول الرقمي والأمن السيبراني',
    '4- إدارة أساطيل ومكاتب المحافظات خارج القاهرة',
    '5- احتضان الملكية الفكرية وبراءات الاختراع بـ ITIDA',
    '6- تصدير البرمجيات للخليج وأوروبا ولندن',
    '7- التعاقدات الحكومية ومناقصات البنية التحتية',
    '8- توحيد توريدات العتاد والكاميرات للمجموعة',
    '9- تأسيس أكاديمية تدريب وتأهيل هندسي',
    '10- مظلة استثمارية مرنة لجذب الشركاء مستقبلاً',
  ],
};

export const MESHAWIR_KAGGLE = {
  id: 'kag-white-lion',
  paper_title: 'The White Lion & UCP-LLM: Epistemic Engineering Constraints for Local Gemma 4 Agents (Kaggle $100k)',
  track_name: 'Kaggle Paper Track ($100,000)',
  deadline_date: '2026-10-17',
  primary_author: 'المهندس سامح يس',
  framework_model: 'UCP-LLM (25 Sections: 20 Leadership/Equine/Calm/Stage + 5 Tech) + Gemma 4 LoRA/Unsloth + Eve v1.1.0',
  submission_status: 'خطة 17 يوماً حتى 17 أكتوبر',
  abstract_text:
    'دمج التفسير الرمزي والانضباط اللغوي مع هندسة القيود الرقمية الصارمة عبر 25 قسماً في بروتوكول UCP-LLM مع حالة دراسية هندسية تحقق وفورات 80–120 ألف ج.م سنوياً، وأداة Eve v1.1.0.',
};

export const MESHAWIR_TASKS: ProjectTaskItem[] = [
  { id: 't-01', task_number: 1, project_id: 'proj-maadi-hq', category: 'تسليم إدارة الفرع للمهندس عماد', title: 'استلام إدارة فرع المعادي كاملة (الصلاحيات، 2FA، الباسوردات عبر الخزنة المشفرة، ومفاتيح الغرفة والراك)', description: 'نقل صلاحيات WE وEC وZoho وGitHub وSupabase وTP-Link ER8411 وGrandstream 604A للمهندس عماد الشرقاوي.', priority: 'عاجلة جداً', status: 'in_progress', assigned_to: 'المهندس عماد الشرقاوي والمهندس سامح يس', due_date: '2026-11-28' },
  { id: 't-02', task_number: 2, project_id: 'proj-maadi-hq', category: 'الشبكات والفايروول الجديد', title: 'اعتماد توثيق وضبط سياسات TP-Link ER8411 المشتَرى فعلياً (خط أرضي 1 WE ADSL + Vodafone 5G + VLANs)', description: 'تأكيد قواعد التوجيه والـ Failover وتجهيز المنفذ الثالث لوصول خط فايبر WE L3VPN.', priority: 'عاجلة جداً', status: 'completed', assigned_to: 'المهندس عماد الشرقاوي والمهندس سامح يس', due_date: '2026-11-20' },
  { id: 't-03', task_number: 3, project_id: 'proj-maadi-hq', category: 'السنترال الجراند ستريم 604A', title: 'إتمام إعدادات التحويلات (100-116)، رسالة IVR، طابور الكول سنتر، وتسجيل المكالمات على Grandstream 604A', description: 'السنترال راكب وشغال مع الخط الأرضي الثاني؛ مطلوب إغلاق تذكرة MSH-IT-2026-084 وأخذ نسخة Backup.', priority: 'عاجلة جداً', status: 'in_progress', assigned_to: 'المهندس عماد الشرقاوي وم/ موفق', due_date: '2026-11-29' },
  { id: 't-04', task_number: 4, project_id: 'proj-maadi-hq', category: 'عتاد واستكمال غرفة السيرفرات', title: 'شراء UPS 1500VA وتكييف 24/7 لغرفة السيرفرات + طفاية حريق غازية + 5 أجهزة Dell إضافية للكول سنتر', description: 'استكمال أمان الغرفة وتشغيل 8 مقاعد فورية في القاعة الكبرى ثم التوسع إلى 17.', priority: 'عاجلة جداً', status: 'pending', assigned_to: 'المهندس عماد الشرقاوي والأستاذ هاني', due_date: '2026-11-18' },
  { id: 't-05', task_number: 5, project_id: 'proj-maadi-hq', category: 'تمديدات المقر والكاميرات', title: 'إنهاء تأريج نقاط القاعة الـ 17 مع حاتم الفني، وإنهاء تركيب 16 كاميرا 5MP (منها 4 صوتية) مع م/ علي', description: 'ربط الكاميرات على VLAN 20 وتفعيل Hik-Connect للقيادات.', priority: 'عاجلة جداً', status: 'in_progress', assigned_to: 'المهندس عماد الشرقاوي وحاتم وم/ علي', due_date: '2026-12-01' },
  { id: 't-06', task_number: 6, project_id: 'proj-maadi-hq', category: 'الشؤون المالية والفواتير', title: 'تحويل إذن المنشاوي النقدي المؤقت (8,510 ج.م) لفاتورة ضريبية ETA واستخراج فيزا الشركة الرسمية', description: 'إقفال العهدة ومراجعة فرق البنود وتجديد نطاق mashawer.com.eg لسنتين.', priority: 'عالية', status: 'in_progress', assigned_to: 'الأستاذ هاني والمهندس سامح يس', due_date: '2026-11-27' },
  { id: 't-07', task_number: 7, project_id: 'proj-4b', category: 'استضافة WE والـ VPN والتراخيص', title: 'استلام الـ 3 خوادم السحابية + F5 WAF + 7 حسابات SSL VPN + فايبر 24Mbps + ربط LTRA وتجربة الفشل DR (< 5ms)', description: 'تنسيق مباشر مع م/ أحمد محرم وم/ أحمد غريب في WE والمحامي أ/ محمد مصطفى.', priority: 'عاجلة جداً', status: 'in_progress', assigned_to: 'المهندس عماد الشرقاوي وم/ أحمد محرم والمحامي', due_date: '2026-11-30' },
  { id: 't-08', task_number: 8, project_id: 'proj-4b', category: 'إغلاق الثغرات البرمجية لـ 4B', title: 'إلزام قيمة تك بإدارة حالة الرحلة والسعر من السيرفر، مؤقت 60ث للـ OTP، انتهاء المزايدة 15ث، وتأمين Webhook فوري', description: 'وإصلاح FCM OAuth2 وخريطة Google Maps للأدمن وطوابير BullMQ ونشر CompreFace محلياً.', priority: 'عاجلة جداً', status: 'in_progress', assigned_to: 'المهندس سامح يس وم/ علي QA وقيمة تك', due_date: '2026-11-26' },
  { id: 't-09', task_number: 9, project_id: 'proj-daro', category: 'دارو Daro (مؤجل مؤقتاً بعد 4B)', title: 'معالجة ملاحظات Figma الـ 8 في تطبيق دارو للزوار والسياح وطيران مصر الداخلي بعد استلام وتشغيل 4B', description: 'حل تناقض الأسعار والأدوار الـ 5 وضمان طيران داخلي فقط داخل مصر (Amadeus / EgyptAir NDC) وتفعيل تدقيق قيمة تك بعد إعادة ضبط الـ Quota.', priority: 'عالية', status: 'pending', assigned_to: 'المهندس سامح يس وأبو خالد وقيمة تك', due_date: '2027-01-15' },
  { id: 't-10', task_number: 10, project_id: 'proj-wekala', category: 'وكالة WeKaLa (مؤجل مؤقتاً بعد 4B)', title: 'استلام السورس كود وKeystore لسوق وكالة الإلكتروني (بيع/مزاد/مقايضة) وحسم العمولات والضمان بعد 4B', description: 'فصل نموذج Marketplace الكامل لـ WeKaLa عن تطبيقات النقل واعتماد العمولات مالياً لاحقاً.', priority: 'عالية', status: 'pending', assigned_to: 'المهندس سامح يس والأستاذ هاني والمحامي', due_date: '2027-01-10' },
  { id: 't-11', task_number: 11, project_id: 'proj-maadi-hq', category: 'خزنة النسخ الاحتياطي الليلي', title: 'برمجة سحب نسخة ليلية تلقائية الساعة 3:00 ص من سحابة WE وGitHub إلى R640 / Z440 محلياً بالمعادي', description: 'مع نسخة أسبوعية احتياطية إضافية وإلغاء Active Directory المحلي نهائياً.', priority: 'عالية', status: 'pending', assigned_to: 'المهندس عماد الشرقاوي والمهندس سامح يس', due_date: '2026-12-05' },
  { id: 't-12', task_number: 12, project_id: 'proj-agouza-restaurant', category: 'توريدات مطعم العجوزة', title: 'اعتماد وتركيب نظام POS الكاشير والطابعات و14 كاميرا مراقبة بمطعم العجوزة عبر م/ علي الأصدقاء', description: 'بإشراف الأستاذ هاني وأبو خالد مع فصل الحسابات تماماً عن مشاوير.', priority: 'متوسطة', status: 'in_progress', assigned_to: 'الأستاذ هاني وأبو خالد وم/ علي', due_date: '2026-12-10' },
  { id: 't-13', task_number: 13, project_id: 'proj-kaggle-ucp', category: 'تسليم مسابقة كاجل ($100k)', title: 'إنهاء تجارب Gemma 4 LoRA/Unsloth والورقة البحثية The White Lion وبروتوكول UCP-LLM قبل 17 أكتوبر', description: 'مع الحفاظ على نسخ محلية منظمة وعدم تداخلها مع بيئة مشاوير.', priority: 'عاجلة جداً', status: 'in_progress', assigned_to: 'المهندس سامح يس', due_date: '2026-10-17' },
];

export const MESHAWIR_INQUIRIES: SystemInquiryItem[] = [
  { id: 'inq-01', question: 'حسم عنوان الشبكة الخارجي للعمل عن بُعد (Static Public IP vs DDNS) لـ ER8411 وGrandstream Wave؟', context: 'الاتجاه الأحدث في 25 نوفمبر 2026: شراء Static Public IP من مزود الخدمة مع دراسة WireGuard VPN لـ 25–30 موظفاً عن بُعد على Wave', category: 'الشبكات والأمان والسنترال', urgency: 'critical', options: ['اعتماد Static Public IP + WireGuard VPN على ER8411 وعزل Wave للسنترال فقط', 'الاعتماد على DDNS / RemoteConnect دون Static IP'], answered: true, answer: 'القرار المعتمد: شراء Static Public IP ودراسة/تنفيذ WireGuard VPN على TP-Link ER8411 لـ 25–30 مستخدماً مع عزل SIP/RTP' },
  { id: 'inq-02', question: 'كيف نغلق فجوات 4B قبل الإطلاق التجاري وتنفيذ GPS Integrity Test رقم 01؟', context: 'اختبار 23 نوفمبر تم على محاكي API 37 ولا يثبت أمان GPS الحقيقي ولا يعوّض تجربة كابتن + عميل على هاتف حقيقي', category: 'تطبيق 4B وكابتن مشاوير', urgency: 'critical', options: ['تنفيذ GPS Integrity Test 01 على هاتف حقيقي + اختبار رحلة كاملة + إغلاق FCM/Maps/Fawry/CompreFace', 'الاعتماد على نتائج المحاكي الحالية'], answered: false, answer: null },
  { id: 'inq-03', question: 'نطاق إطلاق دارو (Daro Super App للزوار والسياح) ومشاكل Figma الـ 8', context: 'Daro موجه للزوار العرب والسياح وطيرانه داخلي داخل مصر فقط (Amadeus / EgyptAir NDC)، ومؤجل لحين استلام 4B', category: 'تطبيق دارو (مؤجل)', urgency: 'medium', options: ['إبقاء Daro مؤجلاً حتى تشغيل 4B ثم حل الـ 8 عيوب في Figma', 'تشغيل مسار تطوير موازٍ الآن'], answered: true, answer: 'مؤجل مؤقتاً حتى استلام وتشغيل 4B والتركيز الكامل بالمعادي على 4B' },
  { id: 'inq-04', question: 'تحديد الإجراء القانوني والتقني مع شركة قيمة تك واستلام الأصول الـ 12', context: 'متابعة تسليم السورس كود الفعلي ومفاتيح Keystore وAPNs .p8 وأكواد Daro وWeKaLa', category: 'قانوني وحوكمة الأصول', urgency: 'critical', options: ['ربط أي دفعات بتسليم الأصول الـ 12 والـ Keystore فعلياً أو إنذار محضر', 'ملحق جدولة جديد دون تسليم الكود الآن'], answered: false, answer: null },
  { id: 'inq-05', question: 'تأكيد نطاق وحجم تمويل 4B Prepaid Trips وعرض لامبادا/Ocean Foods', context: 'السابقة التاريخية (100,000 ج.م / 1,000 كوبون بحد أقصى 90 ج.م) لا يثبت توقيع عقد نهائي حتى الآن', category: 'المسار التجاري B2B', urgency: 'high', options: ['حسم التعاقد الرسمي والفصل المحاسبي السبعـي مع CFO أ/ هاني', 'إبقاؤها قيد التطوير دون طرح تجاري'], answered: false, answer: null },
];

// ==============================================================================
// EXTENDED REFERENCE DATASETS FROM SEED DOCUMENT (25 NOV 2026)
// ==============================================================================

export interface GovernanceRoleBoundary {
  officialTitle: string;
  governancePrinciple: string;
  included11: string[];
  excluded5: string[];
}

export const SAMEH_ROLE_BOUNDARY: GovernanceRoleBoundary = {
  officialTitle: 'مدير قطاع التكنولوجيا وإدارة المشروعات الرقمية',
  governancePrinciple: 'فصل إداري ورقابي حاسم بين «الاعتماد الفني والتقني» (القطاع التكنولوجي) و«الاعتماد المالي والتعاقدي» (الإدارة المالية CFO والمالك والمستشار القانوني).',
  included11: [
    '1. الإشراف التقني الكامل على المنظومات والتطبيقات الرقمية (4B / كابتن مشاوير / Daro / WeKaLa).',
    '2. إدارة المشروعات الرقمية والربط بين الإدارة وشركات التطوير والمطورين وفرق التنفيذ.',
    '3. مراجعة المخرجات البرمجية والأكواد وواجهات الربط APIs وأنظمة الإدارة وقواعد البيانات.',
    '4. وضع وضبط متطلبات الأمان والحماية والصلاحيات وحوكمة التطوير.',
    '5. الإشراف على البنية التحتية الرقمية والسيرفرات والشبكات والاستضافة والتخزين والنسخ الاحتياطي.',
    '6. اعتماد الجاهزية الفنية والتكامل مع الخدمات الخارجية قبل الانتقال إلى الإنتاج.',
    '7. إدارة مسارات الاختبار والجودة ومطابقة التصميمات مع المطورين (Figma ↔ Code).',
    '8. حصر واستلام الأصول التقنية والبرمجية والحسابات والمفاتيح والشهادات والمستودعات.',
    '9. إعداد التوصيف الوظيفي والفني وتقييم البدائل والحلول التكنولوجية.',
    '10. تقديم تقارير حالة ومخاطر وتوصيات تقنية وإدارية صريحة وموثقة للإدارة العليا.',
    '11. تمثيل الشركة فنياً في المناقشات الهندسية مع شركاء التقنية والمزودين.',
  ],
  excluded5: [
    '1. تحصيل أو استلام أموال أو التوقيع المالي المباشر في المعاملات التجارية.',
    '2. إقرار أو تعديل البنود المالية النهائية أو تسعير الخدمات بشكل منفرد بدون الإدارة المالية والمالك.',
    '3. صرف مستحقات السائقين/الكباتن أو إجراء التسويات البنكية والفواتير الضريبية (مسؤولية أ/ هاني CFO).',
    '4. توقيع العقود التجارية أو الإعلانية أو تحمل التزامات قانونية باسم الشركة (مسؤولية المالك والمحامي).',
    '5. استبدال الرأي المحاسبي/الضريبي أو الاعتماد القانوني النهائي للنماذج التعاقدية المؤقتة.',
  ],
};

export interface FourBVehicleCategory {
  id: string;
  name: string;
  serviceScope: string;
  constraints: string;
  verificationNote: string;
  knowledgeStatus: KnowledgeStatus;
}

export const FOURB_VEHICLE_CATEGORIES: FourBVehicleCategory[] = [
  {
    id: 'veh-car',
    name: 'ملاكي عادي و VIP',
    serviceScope: 'نقل الركاب (Passenger Rides)',
    constraints: 'تمييز تشغيلي وتسعيري بين فئتي عادي و VIP حسب مواصفات المركبة.',
    verificationNote: 'تحديد فروق التسعير وسنة الصنع المعتمدة تشغيلياً يحتاج تحققاً.',
    knowledgeStatus: 'يحتاج تحققاً',
  },
  {
    id: 'veh-microbus',
    name: 'ميكروباص / 7 راكب',
    serviceScope: 'نقل ركاب جماعي + طرود كبيرة',
    constraints: 'يُشترط سيارات 7 راكب حقيقية (أشير سابقاً لموديلات 2022 أو 2023 فأحدث كمعيار مرجعي).',
    verificationNote: 'الحد الأدنى لسنة الصنع المعتمد رسمياً في الإنتاج غير محسوم ويحتاج تحققاً.',
    knowledgeStatus: 'يحتاج تحققاً',
  },
  {
    id: 'veh-moto',
    name: 'دراجات نارية (Motorcycles)',
    serviceScope: 'توصيل ركاب + طرود خفيفة',
    constraints: 'نقل ركاب وطرود خفيفة وفق شروط الترخيص والحمولة.',
    verificationNote: 'تفاصيل تسعير الكابتن والترخيص داخل التطبيق قيد المراجعة.',
    knowledgeStatus: 'قيد التنفيذ',
  },
  {
    id: 'veh-pickup',
    name: 'نصف نقل (Pickup)',
    serviceScope: 'نقل البضائع والطرود الثقيلة فقط',
    constraints: 'قيد تشغيلي صارم: مخصصة للبضائع والطرود فقط ولا تقدم خدمة نقل ركاب أبداً!',
    verificationNote: 'فصل مسارات البضائع عن مسارات الركاب إلزامي في كل التطبيق والمنطق البرمجي.',
    knowledgeStatus: 'مؤكد',
  },
];

export interface AppReviewLayer {
  layerNumber: number;
  name: string;
  arabicFocus: string;
}

export const APP_REVIEW_7_LAYERS: AppReviewLayer[] = [
  { layerNumber: 1, name: 'Business Requirements', arabicFocus: 'مطابقة متطلبات العمل ونطاق 4B/الكابتن دون خلط مع أفكار غير معتمدة' },
  { layerNumber: 2, name: 'UI/UX', arabicFocus: 'تجربة المستخدم وتدفق الرحلة (Home → Booking → Confirmation) وتوحيد الأسماء والأرقام' },
  { layerNumber: 3, name: 'Design & Screens', arabicFocus: 'مطابقة Figma الفعلية — وجود الشاشة في Figma لا يعني وجود كود Backend حي' },
  { layerNumber: 4, name: 'Business Logic', arabicFocus: 'قواعد Add Stop، فئات المركبات الأربع، احتساب الأجرة، وفصل المحاسبة السبعي' },
  { layerNumber: 5, name: 'Engineering', arabicFocus: 'جودة Backend/Frontend/API، قاعدة البيانات، ومنع التلاعب من جهة العميل' },
  { layerNumber: 6, name: 'QA & Testing', arabicFocus: 'اختبار حقيقي على هواتف Android/iOS (بعيداً عن المحاكي API 37)' },
  { layerNumber: 7, name: 'Security, Privacy & Compliance', arabicFocus: 'أمان GPS (Test 01)، حفظ CompreFace داخل مصر، مفاتيح APNs/Keystore، وحماية البيانات 151/2018' },
];

export interface PrepaidTripsReference {
  workingName: string;
  draftName: string;
  domainClarification: string;
  couponLengths: number[];
  targetUseCases: string[];
  dashboardControls9: string[];
  accountingMetrics7: Array<{ key: string; label: string; rule: string }>;
  precedentExample: {
    partnerName: string;
    budgetEgp: number;
    couponCount: number;
    maxCouponValueEgp: number;
    signedContractStatus: string;
    note: string;
  };
  sampleModelsUnapproved: Array<{
    name: string;
    totalEgp: number;
    opsCostEgp: number;
    ridesOrPromoEgp: number;
    durationOrTerms: string;
    status: KnowledgeStatus;
  }>;
}

export const FOURB_PREPAID_TRIPS_DATA: PrepaidTripsReference = {
  workingName: '4B Prepaid Trips (الاسم التطويري العملي)',
  draftName: '4B Digital Trips (اسم مسودة سابقة)',
  domainClarification:
    'منظومة B2B لبيع باقات وكوبونات رحلات مسبقة الدفع للشركات والمؤسسات وإتاحة الدفع المؤسسي وإدارة الكوبونات عبر لوحة التحكم — وليست وكالة دعاية أو إعلانات أو خدمات إبداعية.',
  couponLengths: [10, 20, 50, 100],
  targetUseCases: [
    '1. تنقل الموظفين (Employee Mobility)',
    '2. مزايا العملاء (Customer Benefits)',
    '3. تنقل الفعاليات (Event Mobility)',
    '4. حوافز المبيعات (Sales Incentives)',
    '5. رحلات الضيوف والزوار (Guest Trips)',
  ],
  dashboardControls9: [
    '1. تفعيل / إيقاف الكوبون أو الحزمة',
    '2. تحديد فئة السيارة المسموحة (بدون خلط Pickup مع الركاب)',
    '3. مدة الصلاحية الزمنية',
    '4. عدد مرات الاستخدام',
    '5. الحد الأقصى لقيمة الخصم/الكوبون',
    '6. نسبة الخصم % أو القيمة الثابتة',
    '7. استهداف العميل / الحملة / الجهة المتعاقدة',
    '8. التوزيع الآلي لـ 100 كوبون يومي فريد ليوم واحد لكل دفعة',
    '9. الوسم التجاري والمصدر المحاسبي للتمويل',
  ],
  accountingMetrics7: [
    { key: 'sold_value', label: '1. القيمة المباعة مسبقاً (Sold Value)', rule: 'إجمالي ما سددته الشركة المتعاقدة مقابل باقة الكوبونات.' },
    { key: 'discount_4b', label: '2. الخصومات الممولة من 4B', rule: 'تُحسب كمصروف ترويجي على الشركة لا يُخلط مع خصم المشتري.' },
    { key: 'discount_buyer', label: '3. الخصومات الممولة من المشتري / الشريك', rule: 'تُخصم مباشرة من رصيد الجهة المشترية المتفق عليه.' },
    { key: 'captain_dues', label: '4. مستحقات الكباتن (Captain Dues)', rule: 'التزام مباشر واجب السداد للكابتن منفصل عن إيراد المنصة.' },
    { key: 'issuance_fees', label: '5. رسوم الإصدار والتشغيل (Issuance / Ops Fees)', rule: 'أتعاب إدارة الحملة/الإصدار المحصلة من الشريك.' },
    { key: 'recognized_revenue', label: '6. الإيرادات المحققة (Recognized Revenue)', rule: 'تُعترف محاسبياً عند الاستخدام الفعلي للرحلات فقط وفق القواعد المالية.' },
    { key: 'unused_balance', label: '7. الأرصدة غير المستخدمة (Unused / Breakage Balance)', rule: 'تبقى التزاماً مالياً/رصيداً قائماً لا يُعامل كربح فوري قبل استيفاء شروط العقد.' },
  ],
  precedentExample: {
    partnerName: 'سوق لامبادا / أوشن فودز (Ocean Foods)',
    budgetEgp: 100000,
    couponCount: 1000,
    maxCouponValueEgp: 90,
    signedContractStatus: 'لا يوجد إثبات على توقيع عقد نهائي مكتمل أو تسعير معتمد نهائياً حتى 25 نوفمبر 2026 — يحتاج تحققاً.',
    note: 'ذُكر كسابقة تفاوضية/مرجعية: 100 ألف جنيه، 1,000 كوبون بحد أقصى 90 ج.م للكوبون، مع مقترح 100 كوبون يومي فريد ليوم واحد.',
  },
  sampleModelsUnapproved: [
    { name: 'نموذج حملة 100 ألف ج.م', totalEgp: 100000, opsCostEgp: 10000, ridesOrPromoEgp: 90000, durationOrTerms: '10,000 تشغيل + 90,000 رحلات (مثال استرشادي)', status: 'مقترح' },
    { name: 'نموذج حملة مليون ج.م (3 أشهر)', totalEgp: 1000000, opsCostEgp: 250000, ridesOrPromoEgp: 750000, durationOrTerms: '250 ألف تشغيل + 750 ألف رصيد ترويجي على 3 أشهر', status: 'مقترح' },
    { name: 'نموذج الجوائز / القسائم 5%/95%', totalEgp: 100000, opsCostEgp: 5000, ridesOrPromoEgp: 95000, durationOrTerms: '5% رسوم إدارة + 95% قسائم رحلات', status: 'مقترح' },
  ],
};

export interface DaroFigmaAuditData {
  figmaUrl: string;
  auditDate: string;
  targetAudience: string;
  flightConstraint: string;
  autoAnalysisNote: string;
  categories6: Array<{ id: string; title: string; details: string }>;
  logicalRoles5: string[];
  figmaPages9: string[];
  defects8: Array<{ id: number; title: string; severity: string }>;
}

export const DARO_FIGMA_AUDIT: DaroFigmaAuditData = {
  figmaUrl: 'https://www.figma.com/design/aR1aanpRzGL7aMoxROGgt5/Daro?node-id=3214-2',
  auditDate: '2026-11-24',
  targetAudience: 'الزوار العرب والسياح ورجال الأعمال والطلاب القادمين إلى مصر (لا يستهدف المصريين كشريحة تسويقية رئيسية).',
  flightConstraint: 'الطيران يقتصر صراحةً على الطيران الداخلي داخل مصر فقط (Amadeus كخيار أولي وEgyptAir NDC/ERS قيد التحقق).',
  autoAnalysisNote: 'توقفت المراجعة التلقائية في قيمة تك بعد ~44 دقيقة بسبب حد الـ Credit/Quota (يتجدد في 30 نوفمبر 2026).',
  categories6: [
    { id: 'cat-1', title: '1. الإقامة والعقارات', details: 'وحدات مملوكة/متعاقد عليها أو إيجار وعمولة مالك' },
    { id: 'cat-2', title: '2. السيارات والنقل', details: 'سيارة بسائق أو بدون، توصيل مطار، رحلات بين المدن، وربط مع 4B' },
    { id: 'cat-3', title: '3. الطيران والفنادق', details: 'طيران داخلي داخل مصر فقط + حجز فنادق' },
    { id: 'cat-4', title: '4. المطاعم والأكل المنزلي', details: 'مطاعم + وجبات منزلية + طلب مسبق' },
    { id: 'cat-5', title: '5. الخدمات الطبية', details: 'أطباء ومستشفيات وحجوزات ومواعيد' },
    { id: 'cat-6', title: '6. خدمات مساندة أخرى', details: 'ترجمة، إرشاد سياحي، خدمات طلاب، تنظيف، وصيانة وفنيون' },
  ],
  logicalRoles5: [
    '1. User (الزائر / العميل بحساب موحد)',
    '2. Property Owner (مالك العقار)',
    '3. Service Provider (مزود الخدمة والمطاعم والأكل المنزلي)',
    '4. Medical Roles (الأدوار الطبية والعيادات والمستشفيات)',
    '5. Admin (إدارة المنصة)',
  ],
  figmaPages9: ['User', 'Owner', 'Doctor', 'Real Estate', 'Cars', 'Airport Pickup', 'Flights', 'Food & Home Food', 'Medical / Students / Cleaning & Maintenance'],
  defects8: [
    { id: 1, title: 'أرقام مالية ونسب متضاربة في شاشات العقارات والخدمات (25,000 و3,200 و1,000 و40,000 و15% و10%).', severity: 'عالية' },
    { id: 2, title: 'تواريخ عقود وشاشات متناقضة وغير محدثة (10 Mar 2024–2028).', severity: 'متوسطة' },
    { id: 3, title: 'بنود دفع وشروط إيجار غير متسقة (13 شيك، شهر تأمين، شهر مجاني).', severity: 'عالية' },
    { id: 4, title: 'عدم وضوح الفرق في الواجهة بين «حجز» مؤكد و«حجز مبدئي».', severity: 'عالية' },
    { id: 5, title: 'انقطاع مسار الحجز القياسي: Home → Search → Details → Booking → Payment → Confirmation.', severity: 'حرجة' },
    { id: 6, title: 'خلط شاشات الأدوار الخمسة داخل حساب موحد دون فصل صلاحيات واضح.', severity: 'متوسطة' },
    { id: 7, title: 'توقف مراجعة قيمة تك التلقائية عند الدقيقة 44 قبل إتمام التدقيق الكامل.', severity: 'عالية' },
    { id: 8, title: 'لا يوجد فريق تشغيل مستقل في المعادي حالياً لتشغيل Daro (مؤجل لبعد 4B).', severity: 'إداري' },
  ],
};

export interface GpsSecurityTestSpec {
  id: string;
  disclaimer23Nov: string;
  prerequisites5: string[];
  checks9: Array<{ id: number; check: string; target: string }>;
}

export const GPS_SECURITY_TEST_01: GpsSecurityTestSpec = {
  id: 'GPS Integrity Test رقم 01',
  disclaimer23Nov:
    'تجربة 23 نوفمبر 2026 (كابتن على محاكي Android Emulator API 37 + عميل على هاتف من الجاردينيا للمعادي وتحرك ~2 كم) أظهرت استجابة الخريطة فقط ولا تثبت مقاومة تزييف الـ GPS أو جاهزية الإنتاج!',
  prerequisites5: [
    '1. حساب كابتن تجريبي فعلي ومفعل.',
    '2. حساب عميل تجريبي فعلي.',
    '3. وصول حي إلى لوحة التحكم والإدارة (Dashboard).',
    '4. هاتف أندرويد حقيقي غير معدل (وليس Emulator API 37).',
    '5. تجربة دورة رحلة كاملة من الإنشاء حتى الإغلاق والتسوية.',
  ],
  checks9: [
    { id: 1, check: 'ضبط Battery Saver OFF ووضع توفير الطاقة', target: 'منع قتل خدمة التتبع في الخلفية' },
    { id: 2, check: 'ضبط Mock Location OFF ومنع تطبيقات التزييف', target: 'كشف وحجب برامج Fake GPS / Spoofing' },
    { id: 3, check: 'مقارنة مسار GPS الحقيقي ميدانياً', target: 'تطابق الإحداثيات الزمنية على السيرفر' },
    { id: 4, check: 'قياس دقة الإحداثيات Accuracy Threshold', target: 'رفض القفزات غير المنطقية في السرعة والموقع' },
    { id: 5, check: 'فحص أذونات الموقع (Always / While in Use)', target: 'التعامل السليم مع رفض أو تقييد الإذن' },
    { id: 6, check: 'الاستقرار في الخلفية Background Tracking', target: 'استمرار إرسال النبض عند إطفاء الشاشة' },
    { id: 7, check: 'تبديل الشبكات (Wi-Fi ↔ 4G/5G)', target: 'إعادة الاتصال التلقائي عبر WebSocket/HTTP' },
    { id: 8, check: 'انقطاع الشبكة المفاجئ وإعادة التشغيل Reboot', target: 'حفظ النقاط واستكمال الرحلة دون فقدان حالة' },
    { id: 9, check: 'كشف Root والـ Debugging وأدوات الاختراق', target: 'إيقاف أو تنبيه عند اكتشاف بيئة محاكاة/روت' },
  ],
};

export interface NetworkVpnWaveSpec {
  staticPublicIpDecision: string;
  staticIpStatus: KnowledgeStatus;
  remoteWorkPlanTitle: string;
  remoteWorkStatus: KnowledgeStatus;
  concurrentUsersTarget: string;
  waveSecurityRule: string;
  isoSecurityNote: string;
  historicalLegacyServerNote: string;
  checklistSteps: string[];
}

export const NETWORK_VPN_WAVE_SPEC: NetworkVpnWaveSpec = {
  staticPublicIpDecision: 'القرار الأحدث المعتمد: شراء Static Public IP من مزود الخدمة (يتجاوز مقترح Dynamic IP + DDNS السابق).',
  staticIpStatus: 'مؤكد',
  remoteWorkPlanTitle: 'دراسة وتنفيذ WireGuard VPN على راوتر TP-Link ER8411 لربط تطبيق Grandstream Wave للموظفين عن بُعد',
  remoteWorkStatus: 'قيد التنفيذ',
  concurrentUsersTarget: '25 – 30 مستخدماً (موظفي كول سنتر وتشغيل عن بُعد عبر Wave من المنزل أو خارجه)',
  waveSecurityRule: 'عزل تام: الوصول عبر نفق WireGuard إلى خادم السنترال UCM6304A (VLAN 30) فقط — ممنوع فتح منافذ SIP/RTP للإنترنت العام أو الاعتماد على RemoteConnect وحده.',
  isoSecurityNote: 'حزمة الأهداف الأمنية المستهدفة تشمل: FortiGate، VLAN Segmentation، VPN، Firewall Rules، استهداف تصنيف Grade A، وتوجيه نحو ISO 27001 (مع التنبيه الصريح: الشركة غير حاصلة على شهادة ISO 27001 حتى الآن).',
  historicalLegacyServerNote: 'سجل تاريخي قديم يحتاج تحققاً: ورد في نقاشات سابقة وجود/خطط خادم Dell PowerEdge R730 مع Windows Server Standard + 20 CALs؛ يُحفظ كمرجع تاريخي منفصل عن R640 وHP Z440 الموجودين فعلياً في راك Perla 27U.',
  checklistSteps: [
    'تفعيل Static Public IP على خط WAN الأساسي في TP-Link ER8411.',
    'تهيئة WireGuard VPN Server على ER8411 وتوزيع ملفات Config فردية.',
    'توجيه حركة VPN في الـ Firewall إلى IP السنترال (192.168.30.1) فقط مع حظر باقي الـ VLANs.',
    'ضبط حسابات SIP للمستخدمين عن بُعد (25–30 مستخدماً) على تطبيق Grandstream Wave ومراقبة استهلاك CPU/RAM في 604A.',
  ],
};

export interface ExternalServiceItem {
  id: string;
  name: string;
  role: string;
  knowledgeStatus: KnowledgeStatus;
  notes: string;
}

export const EXTERNAL_SERVICES_17: ExternalServiceItem[] = [
  { id: 'ext-1', name: 'Firebase (FCM / Auth / Config)', role: 'إشعارات الدفع Android وiOS عبر FCM OAuth2', knowledgeStatus: 'قيد التنفيذ', notes: 'مطلوب استكمال ملفات Android/iOS ومفتاح APNs .p8' },
  { id: 'ext-2', name: 'Google Maps Platform', role: 'الخرائط والتوجيه والمسافات في 4B والأدمن', knowledgeStatus: 'مؤكد', notes: 'تقييد Server Key بـ IP وWeb Key بالدومين' },
  { id: 'ext-3', name: 'Google Play Console', role: 'حساب نشر تطبيقات الأندرويد (4B / كابتن)', knowledgeStatus: 'يحتاج تحققاً', notes: 'التحقق من ملكية الشركة وحالة النشر الفعلية' },
  { id: 'ext-4', name: 'Apple Developer Account', role: 'حساب نشر تطبيقات iOS وشهادات APNs .p8', knowledgeStatus: 'يحتاج تحققاً', notes: 'التحقق من الدفع السنوي ورقم DUNS وتوليد .p8' },
  { id: 'ext-5', name: 'Amadeus API', role: 'حجز الطيران الداخلي داخل مصر في Daro', knowledgeStatus: 'مؤجل', notes: 'مؤجل مع مشروع Daro — طيران داخلي بمصر فقط' },
  { id: 'ext-6', name: 'EgyptAir NDC / ERS', role: 'ربط طيران مصر الداخلي البديل في Daro', knowledgeStatus: 'يحتاج تحققاً', notes: 'لم يبدأ الربط الفعلي بعد ومؤجل لما بعد 4B' },
  { id: 'ext-7', name: 'Fawry Enterprise', role: 'الدفع الإلكتروني وصرف الكباتن لـ 4B', knowledgeStatus: 'قيد التنفيذ', notes: 'التعاقد وWebhook والاختبار الحي غير مكتملين بالكامل' },
  { id: 'ext-8', name: 'Paymob', role: 'بوابة دفع إلكتروني مذكورة بالمنظومة', knowledgeStatus: 'يحتاج تحققاً', notes: 'غير مثبت تشغيلها الحي في الإنتاج حتى الآن' },
  { id: 'ext-9', name: 'Vodafone Cash (API / Wallet)', role: 'محفظة إلكترونية في قائمة الدفع', knowledgeStatus: 'يحتاج تحققاً', notes: 'مذكورة كوسيلة دفع ولم يثبت تشغيلها الحي' },
  { id: 'ext-10', name: 'InstaPay', role: 'تحويلات فورية مذكورة بالمتطلبات', knowledgeStatus: 'يحتاج تحققاً', notes: 'غير مثبت تشغيلها في الإنتاج بعد' },
  { id: 'ext-11', name: 'OTP SMS Gateways (BroadNet / Twilio)', role: 'إرسال رموز التحقق للمستخدمين والكباتن', knowledgeStatus: 'قيد التنفيذ', notes: 'BroadNet وTwilio مسجلان — التحقق من الرصيد والـ Live API' },
  { id: 'ext-12', name: 'Email Service (Zoho Lite / SMTP)', role: 'البريد الرسمي 5 حسابات وتنبيهات النظام', knowledgeStatus: 'مؤكد', notes: '5 حسابات مجانية فعالة؛ hr@ ملغي لتوفير التكلفة' },
  { id: 'ext-13', name: 'Cloud / Hosting (WE Cloud / VPS / Docker)', role: 'استضافة خوادم الإنتاج وقاعدة البيانات inside Egypt', knowledgeStatus: 'مؤكد', notes: 'أوامر شراء WE معتمدة — متابعة الاستلام الفعلي' },
  { id: 'ext-14', name: 'CompreFace (Face Verification + Liveness)', role: 'التحقق من هوية الكباتن على خوادم داخل مصر', knowledgeStatus: 'قيد التنفيذ', notes: 'Isolated VM + Docker + Ubuntu داخل WE/MIST + Internal VPN' },
  { id: 'ext-15', name: 'WireGuard VPN', role: 'ربط الموظفين عن بُعد بأمان على راوتر ER8411', knowledgeStatus: 'قيد التنفيذ', notes: 'قيد التهيئة لدعم 25–30 مستخدم Wave' },
  { id: 'ext-16', name: 'Grandstream UCM6304A & Wave', role: 'السنترال الفعلي بالمقر وتطبيق الهواتف عن بُعد', knowledgeStatus: 'مؤكد', notes: 'السنترال شغال بالمقر؛ ربط Wave عن بُعد قيد التنفيذ' },
  { id: 'ext-17', name: 'TP-Link Omada ER8411', role: 'جدار الحماية والراوتر المركزي Multi-WAN', knowledgeStatus: 'مؤكد', notes: 'شغال بالمقر بـ WE ADSL + VF 5G ويهيأ لـ Static IP وWireGuard' },
];

export const FIREBASE_IOS_CHECKLIST = {
  android: [
    'ملف google-services.json الصحيح لكل Flavor / Package Name (4B عملاء مقابل كابتن مشاوير).',
    'تشغيل flutterfire configure ومطابقة firebase_options.dart.',
    'إضافة بصمات SHA-1 و SHA-256 لكل من Debug و Release Keystore.',
    'تفعيل Firebase Cloud Messaging API (V1 / OAuth2) من الباك إند بدلاً من Legacy Key.',
    'التعامل الدقيق مع Notification & Data Payloads أثناء Foreground و Background و Terminated.',
    'طلب إذن الإشعارات وقت التشغيل في Android 13+ (POST_NOTIFICATIONS).',
  ],
  ios: [
    'توليد مفتاح APNs Auth Key بصيغة (.p8) من Apple Developer مع توثيق Key ID و Team ID.',
    'رفع مفتاح (.p8) إلى إعدادات Cloud Messaging في لوحة Firebase (يحظر تماماً رفع .p8 على GitHub!).',
    'تضمين ملف GoogleService-Info.plist الصحيح داخل Xcode لكل Bundle Identifier.',
    'تفعيل Capabilities داخل Xcode: Push Notifications + Background Modes (Remote notifications).',
    'تجربة استلام الإشعار على جهاز iPhone حقيقي (وليس Simulator فقط).',
  ],
};

export const DIGITAL_ASSETS_12: string[] = [
  '1. السورس كود الكامل (4B العملاء + كابتن مشاوير + لوحة الإدارة + Daro + WeKaLa)',
  '2. مستودعات GitHub وصلاحيات Owner للمؤسسة والإدارة التقنية',
  '3. ملفات البيئات والتشغيل (Docker / docker-compose / .env Templates)',
  '4. قواعد البيانات وملفات الهجرة والنسخ (Migrations & Schemas)',
  '5. مفاتيح الـ APIs وحسابات الخدمات الـ 17 الخارجية',
  '6. حسابات Google Play Console و Apple Developer الرسمية للشركة',
  '7. مفاتيح التوقيع الرقمية والشهادات (Android Keystore + iOS .p8 / Certificates)',
  '8. النطاقات وإدارة الـ DNS (mashawer.com.eg, mashweer.net, daro.eg, wikala.com.eg)',
  '9. ملفات التصميم Figma وصلاحيات التعديل + أصول الهوية البصرية',
  '10. لوحات التحكم الإدارية ومفاتيح الـ Super Admin',
  '11. التوثيق التقني والعقود ومستخلصات قيمة تك',
  '12. العلامات التجارية وحقوق الملكية الفكرية وإيداعات ITIDA',
];

export interface ProposedIdeaItem {
  id: string;
  name: string;
  category: string;
  status: KnowledgeStatus;
  summary: string;
  governanceNote: string;
}

export const PROPOSED_IDEAS_REGISTRY: ProposedIdeaItem[] = [
  { id: 'prop-1', name: '4B Exchange', category: 'مقترح تجاري غير معتمد', status: 'مقترح', summary: 'فكرة تبادل وتكامل تجاري مقترحة للنقاش المستقبلي.', governanceNote: 'لم يُعتمد كموديل تشغيلي أو مشروع مبرمج.' },
  { id: 'prop-2', name: '4B Route Club', category: 'مقترح تجاري غير معتمد', status: 'مقترح', summary: 'فكرة اشتراكات/نوادي خطوط مسار ثابتة.', governanceNote: 'مقترح غير معتمد؛ لم يُدرج في خطة إطلاق 4B الحالية.' },
  { id: 'prop-3', name: '4B Guaranteed Ride', category: 'مقترح تجاري غير معتمد', status: 'مقترح', summary: 'فكرة ضمان توفر الرحلة مقابل التزام زمني أو اشتراك.', governanceNote: 'مقترح لم يُحسم قانونياً أو تشغيلياً.' },
  { id: 'prop-4', name: '4B Neighborhood Logistics', category: 'مقترح تجاري غير معتمد', status: 'مقترح', summary: 'فكرة خدمات لوجستية محلية على مستوى الأحياء.', governanceNote: 'مقترح للنقاش بعد استقرار 4B.' },
  { id: 'prop-5', name: '4B Shared Load (لا يُطرح كميزة جديدة)', category: 'مستبعد / مُغطى بـ Add Stop', status: 'مؤجل', summary: 'تمت تغطية منطق التوصيل متعدد التوقفات في رحلة واحدة فعلياً عبر ميزة Add Stop الموجودة.', governanceNote: 'قيد التقرير المرجعي: لا تقترح 4B Shared Load كميزة جديدة ما دام Add Stop يؤدي نفس المنطق.' },
  { id: 'prop-6', name: 'الشركة المصرية الكويتية لتوطين التكنولوجيا + الشركة التابعة خارج القاهرة', category: 'مقترح هيكلي غير معتمد', status: 'مقترح', summary: 'تصور تأسيس كيان تكنولوجي موازٍ / شريك استثماري خارج القاهرة.', governanceNote: 'قيد الدراسة فقط مع المالك والمستشار القانوني.' },
  { id: 'prop-7', name: 'الميزانيات الترويجية السابقة (45 ألف / 70 ألف / 25 ألف ج.م) ومسودات العقود الاسترشادية', category: 'بيانات تاريخية ومواد مؤقتة', status: 'يحتاج تحققاً', summary: 'أرقام حملات وتسويق جزئي ومسودات عقود مبدئية أُعدت للتحضير الداخلي فقط.', governanceNote: 'المسودات القانونية مؤقتة ولا تحل محل المراجعة القانونية؛ والميزانيات تحتاج اعتماداً محدثاً من CFO.' },
];

export interface VerificationMatrixItem {
  id: string;
  num: number;
  category: string;
  title: string;
  status: KnowledgeStatus;
  contextNote: string;
  verificationNote: string;
}

export const VERIFICATION_MATRIX_30: VerificationMatrixItem[] = [
  { id: 'v-01', num: 1, category: 'شركة التطوير والتنفيذ', title: 'وضع التعاقد الفعلي النهائي مع شركة التطوير (قيمة تك) ونسب السداد المتبقية', status: 'يحتاج تحققاً', contextNote: 'خطة 7 أسابيع M1–M5 وإنذار قيد الحسم', verificationNote: '' },
  { id: 'v-02', num: 2, category: 'كود تطبيق 4B', title: 'استلام ومراجعة كود 4B العملاء الفعلي كاملاً ومقارنته مع Figma', status: 'قيد التنفيذ', contextNote: 'يُمنع الخلط بين اكتمال Figma (95%) وجاهزية الكود الحي', verificationNote: '' },
  { id: 'v-03', num: 3, category: 'كود كابتن مشاوير', title: 'استلام ومراجعة كود تطبيق كابتن مشاوير الفعلي وفحص فجواته', status: 'قيد التنفيذ', contextNote: 'تطبيق مستقل عن تطبيق العملاء', verificationNote: '' },
  { id: 'v-04', num: 4, category: 'أصول 4B ودارو ووكالة', title: 'الجرد الفعلي للأصول الرقمية الـ 12 (GitHub، السيرفرات، النطاقات، المتاجر، Keystore)', status: 'يحتاج تحققاً', contextNote: 'حاسم قبل سداد أي دفعة أخيرة للمطور الخارجي', verificationNote: '' },
  { id: 'v-05', num: 5, category: 'تراخيص LTRA', title: 'الموقف التنفيذي الحالي لملف جهاز تنظيم النقل البري LTRA والربط الإلكتروني الفعلي', status: 'قيد التنفيذ', contextNote: 'قانون 87/2018 وقرار 2180/2019 عبر خوادم WE', verificationNote: '' },
  { id: 'v-06', num: 6, category: 'أمان GPS', title: 'نتائج اختبار GPS Integrity Test رقم 01 على هاتف Android حقيقي بعيداً عن المحاكي', status: 'يحتاج تحققاً', contextNote: 'تجربة 23 نوفمبر على Emulator API 37 غير صالحة كإثبات أمان', verificationNote: '' },
  { id: 'v-07', num: 7, category: 'اختبار الرحلة الكامل', title: 'تجربة رحلة حقيقية كاملة End-to-End بين كابتن وعميل ولوحة تحكم على أجهزة حقيقية', status: 'يحتاج تحققاً', contextNote: 'من الطلب حتى القبول والتنفيذ والانتهاء والتسوية', verificationNote: '' },
  { id: 'v-08', num: 8, category: 'التحقق من الوجه CompreFace', title: 'جاهزية CompreFace وLiveness محلياً على WE / MIST + اعتماد مدة الاحتفاظ 1–3 أسابيع قانونياً', status: 'قيد التنفيذ', contextNote: 'Isolated VM + Docker + Ubuntu + Internal VPN + Firewall', verificationNote: '' },
  { id: 'v-09', num: 9, category: 'إشعارات Firebase & APNs', title: 'تحقق عمل إشعارات الدفع على Android وiOS (مفتاح .p8 وعدم رفعه على GitHub + FCM OAuth2)', status: 'قيد التنفيذ', contextNote: 'اختبار iPhone فعلي في وضع Background و Terminated', verificationNote: '' },
  { id: 'v-10', num: 10, category: 'فئات المركبات والأسعار', title: 'حسم فروق التسعير بين الملاكي العادي و VIP والحد الأدنى لسنة صنع 7 راكب (2022/2023+)', status: 'يحتاج تحققاً', contextNote: 'تأكيد منع ربط فئة Pickup برحلات الركاب داخل التطبيق', verificationNote: '' },
  { id: 'v-11', num: 11, category: 'الاشتراكات والباقات', title: 'اعتماد باقات اشتراكات 4B الرسمية (الشرائح والأسعار والحدود)', status: 'يحتاج تحققاً', contextNote: 'واردة في قائمة المزايا دون أسعار معتمدة نهائياً', verificationNote: '' },
  { id: 'v-12', num: 12, category: 'بوابات الدفع الإلكتروني', title: 'حالة الربط الحي والإنتاجي لكل من Fawry وPaymob وVodafone Cash وInstaPay', status: 'يحتاج تحققاً', contextNote: 'لم يثبت التشغيل الإنتاجي الكامل لأي منها حتى الآن', verificationNote: '' },
  { id: 'v-13', num: 13, category: '4B Prepaid Trips', title: 'اعتماد الاسم الرسمي وشكل العقد والأسعار لمنظومة كوبونات الشركات B2B', status: 'قيد التنفيذ', contextNote: 'عدم الخلط مع 4B Digital Trips ولا مع وكالة إعلانات', verificationNote: '' },
  { id: 'v-14', num: 14, category: 'سابقة لامبادا / Ocean Foods', title: 'التحقق من موقف التعاقد النهائي مع لامبادا / أوشن فودز (100 ألف / 1,000 كوبون)', status: 'يحتاج تحققاً', contextNote: 'لا يوجد حتى الآن إثبات لتوقيع عقد نهائي مكتمل', verificationNote: '' },
  { id: 'v-15', num: 15, category: 'الفصل المحاسبي للكوبونات', title: 'تطبيق البنود المحاسبية السبعة في تقارير 4B Prepaid Trips بمراجعة المدير المالي', status: 'قيد التنفيذ', contextNote: 'فصل Sold / خصم 4B / خصم المشتري / الكباتن / الإصدار / الإيراد / غير المستخدم', verificationNote: '' },
  { id: 'v-16', num: 16, category: 'تغطية Add Stop vs Shared Load', title: 'مراجعة تغطية Add Stop لكل سيناريوهات التوصيل متعدد المحطات دون ازدواج', status: 'مؤكد', contextNote: 'Add Stop قائمة فعلاً؛ Shared Load لا تُقترح كفكرة جديدة', verificationNote: '' },
  { id: 'v-17', num: 17, category: 'وضع تشغيل المعادي وفريق التسويق', title: 'تحقق التعاقد الفعلي مع الـ 4 مسوقين (Freelance/Part-time) وحسم الميزانيات 45k/70k/25k', status: 'يحتاج تحققاً', contextNote: 'تضارب ميزانيات تاريخية يحتاج اعتماد CFO', verificationNote: '' },
  { id: 'v-18', num: 18, category: 'قرار Static Public IP', title: 'تنفيذ شراء Static Public IP من مزود الخدمة وتفعيله على WAN1 في TP-Link ER8411', status: 'مؤكد', contextNote: 'القرار الأحدث يغني عن الاعتماد الأساسي على DDNS', verificationNote: '' },
  { id: 'v-19', num: 19, category: 'WireGuard + Grandstream Wave', title: 'اختبار ربط 25–30 مستخدماً عن بُعد عبر WireGuard على ER8411 نحو Grandstream 604A فقط', status: 'قيد التنفيذ', contextNote: 'عزل VLAN 30 ومنع فتح SIP/RTP للإنترنت العام', verificationNote: '' },
  { id: 'v-20', num: 20, category: 'جرد السيرفرات التاريخي Dell R730', title: 'التحقق من مصير ومكان Dell PowerEdge R730 + Windows Server + 20 CALs مقارنةً بـ R640', status: 'يحتاج تحققاً', contextNote: 'مرجع قديم بالملف لا يُفترض دمجه بالراك دون فحص ميداني', verificationNote: '' },
  { id: 'v-21', num: 21, category: 'الشبكة والـ FortiGate و ISO 27001', title: 'حسم خطة FortiGate / Grade A وتوضيح عدم حصول الشركة على ISO 27001 حتى الآن', status: 'يحتاج تحققاً', contextNote: 'ISO 27001 هدف مستقبلي وليست شهادة قائمة', verificationNote: '' },
  { id: 'v-22', num: 22, category: 'تجهيزات غرفة السيرفرات', title: 'إغلاق نواقص الغرفة: UPS 1500VA، تكييف 24/7، وطفاية الحريق الغازية', status: 'قيد التنفيذ', contextNote: 'مؤمن بالكابينة بانتظار التوريد النهائي للـ UPS', verificationNote: '' },
  { id: 'v-23', num: 23, category: 'فواتير إذن المنشاوي والأصدقاء', title: 'تحويل إذن المنشاوي (8,510 ج.م) لفاتورة ضريبية ETA وحسم فرق كاميرات 2MP/5MP', status: 'يحتاج تحققاً', contextNote: 'متابعة المدير المالي أ/ هاني والمهندس عماد الشرقاوي', verificationNote: '' },
  { id: 'v-24', num: 24, category: 'استعادة تحليل Daro من قيمة تك', title: 'متابعة استئناف مراجعة Daro Figma (المتوقف عند 44 دقيقة) بعد تجديد Quota في 30 نوفمبر', status: 'مؤجل', contextNote: 'مؤجل لما بعد تشغيل واستقرار 4B', verificationNote: '' },
  { id: 'v-25', num: 25, category: 'عيوب Daro الثمانية والطيران الداخلي', title: 'تصحيح تناقض الأرقام الـ 8 في Figma وحصر تكامل Amadeus/EgyptAir على مصر داخلياً فقط', status: 'مؤجل', contextNote: 'يستهدف الزوار العرب والسياح بمصر فقط', verificationNote: '' },
  { id: 'v-26', num: 26, category: 'نموذج عمولات WeKaLa', title: 'تحديد رسوم الإعلانات والمزادات والضمان والبيع والشراء في منصة وكالة Marketplace', status: 'مؤجل', contextNote: 'مؤجل لما بعد تشغيل 4B بدون تشغيل فريق مستقل الآن', verificationNote: '' },
  { id: 'v-27', num: 27, category: 'متاجر التطبيقات ورقم DUNS', title: 'تأكيد إتمام رقم D-U-N-S وحالة حسابات Apple Developer و Google Play لشركة مشاوير', status: 'يحتاج تحققاً', contextNote: 'ذُكر قيد الاستخراج في أكتوبر ويحتاج توثيق الرقم', verificationNote: '' },
  { id: 'v-28', num: 28, category: 'المقترحات التجارية غير المعتمدة', title: 'عرض 4B Exchange و Route Club و Guaranteed Ride و Neighborhood Logistics على المالك لاحقاً', status: 'مقترح', contextNote: 'لا تدخل في خطة الإطلاق الأولى الحالية', verificationNote: '' },
  { id: 'v-29', num: 29, category: 'الكيانات المقترحة ومطعم العجوزة', title: 'تأكيد فصل حسابات مطعم العجوزة بالكامل وإبقاء المصرية الكويتية/الشركة التابعة كمقترح', status: 'مؤكد', contextNote: 'العجوزة بإدارة أ/ هاني CFO منفصل تماماً عن مشاوير', verificationNote: '' },
  { id: 'v-30', num: 30, category: 'المسودات القانونية المؤقتة', title: 'تحويل كافة نماذج العقود المؤقتة وNDA لمراجعة الأستاذ محمد مصطفى للاعتماد النهائي', status: 'يحتاج تحققاً', contextNote: 'النماذج المؤقتة للتجهيز الداخلي وليست مستنداً نهائياً', verificationNote: '' },
];

export const FOURB_FEATURES_18: Array<{ id: number; name: string; scope: string; statusNote: string }> = [
  { id: 1, name: 'الرحلات الفورية والجدولة المسبقة', scope: 'طلب فوري أو حجز مسبق', statusNote: 'قائمة متطلبات — ليست كلها مثبتة في الإنتاج' },
  { id: 2, name: 'نظام المزايدة والتسعير الحر (Bid / Fixed Fare)', scope: 'تفاوض حي أو سعر مقترح', statusNote: 'يتطلب حسم احتساب السعر من السيرفر' },
  { id: 3, name: 'تعدد محطات التوقف (Add Stop)', scope: 'تغطي التوصيل متعدد النقاط وتغني عن Shared Load', statusNote: 'ميزة قائمة تغطي التوقفات المتعددة' },
  { id: 4, name: 'فئات المركبات الأربع', scope: 'ملاكي عادي/VIP · ميكروباص 7 راكب · دراجات · نصف نقل بضائع فقط', statusNote: 'Pickup للبضائع والطرود فقط' },
  { id: 5, name: 'توصيل الطرود والبضائع (Parcel Delivery)', scope: 'عبر الدراجات والنصف نقل والـ 7 راكب', statusNote: 'مع تتبع مسار عبر Add Stop' },
  { id: 6, name: 'تتبع GPS الحي ومشاركة الرحلة', scope: 'خرائط Google Maps وحفظ المسار', statusNote: 'يحتاج GPS Integrity Test 01 على هاتف حقيقي' },
  { id: 7, name: 'باقات واشتراكات 4B الرسمية', scope: 'شرائح باقات ورحلات مخفضة', statusNote: 'واردة في المتطلبات بدون أسعار معتمدة نهائياً' },
  { id: 8, name: 'حجز الرحلات للغير (Book for Someone Else)', scope: 'إدخال بيانات المستفيد ورقم هاتفه', statusNote: 'ميزة مطلوبة للتحقق في E2E' },
  { id: 9, name: 'نقاط التوصيل المفضلة والمحفوظة', scope: 'المنزل والعمل والمحطات المتكررة', statusNote: 'متوفرة بواجهات Figma' },
  { id: 10, name: 'المحادثة والاتصال الآمن (In-App Chat / Masked Call)', scope: 'تواصل كابتن وعميل دون كشف الأرقام', statusNote: 'قيد المراجعة الأمنية والاختبار' },
  { id: 11, name: 'الدفع النقدي والإلكتروني والمحفظة', scope: 'نقدي · فوري · Paymob · Vodafone Cash · InstaPay', statusNote: 'لم يثبت تشغيل البوابات الإلكترونية حياً بعد' },
  { id: 12, name: 'كوبونات الشركات (4B Prepaid Trips B2B)', scope: 'أكواد 10/20/50/100 وباقات شركات', statusNote: 'قيد التنفيذ والتدقيق المحاسبي السبعي' },
  { id: 13, name: 'رمز تحقق الرحلة OTP / PIN للأمان', scope: 'تأكيد ركوب العميل الصحيح مع الكابتن', statusNote: 'مرتبط ببوابة OTP ومؤقت 60 ثانية' },
  { id: 14, name: 'زر الطوارئ SOS ومشاركة الموقع للجهات', scope: 'أمان الراكب والكابتن أثناء الرحلة', statusNote: 'مطلوب ربطه بغرفة العمليات' },
  { id: 15, name: 'نظام التقييمات والبلاغات والمفقودات', scope: 'تقييم متبادل وتذاكر دعم فوري', statusNote: 'ربط مع support@mashweer.com.eg و604A' },
  { id: 16, name: 'برنامج الإحالة والنقاط والولاء', scope: 'دعوة أصدقاء ورصيد مكافآت', statusNote: 'يحتاج ضبط القواعد مع CFO' },
  { id: 17, name: 'دعم العربية والإنجليزية وRTL الكامل', scope: 'واجهة ثنائية اللغة لعملاء مصر', statusNote: 'مراجعة اتساق الترجمة في الكود' },
  { id: 18, name: 'إشعارات الدفع الفورية Android & iOS', scope: 'FCM V1 OAuth2 + Apple APNs .p8', statusNote: 'قيد التحقق على أجهزة حقيقية' },
];

export const CAPTAIN_APP_SPECS: Array<{ id: number; module: string; detail: string; governanceStatus: KnowledgeStatus }> = [
  { id: 1, module: 'تطبيق مستقل عن 4B العملاء', detail: 'تطبيق «كابتن مشاوير» منفصل تماماً في الكود والحساب والـ Package ID ومتاجر النشر.', governanceStatus: 'مؤكد' },
  { id: 2, module: 'التحقق من الوجه CompreFace + Liveness', detail: 'مطابقة حيوية لصورة الكابتن محلياً داخل مصر (WE/MIST + Isolated Docker VM) وفق قانون 151/2018 وبمدة احتفاظ 1–3 أسابيع قيد الاعتماد.', governanceStatus: 'قيد التنفيذ' },
  { id: 3, module: 'فحص الوثائق وتنبيهات انتهاء الرخص', detail: 'رفع بطاقة الرقم القومي، رخصة القيادة، رخصة السيارة، والفيش عبر روابط Cloudinary مشفرة.', governanceStatus: 'قيد التنفيذ' },
  { id: 4, module: 'فحص أمان GPS ومقاومة التزييف', detail: 'اختبار Mock Location OFF، دقة الموقع، Battery Saver OFF، ومنع Root (GPS Integrity Test 01 لم يُثبت بعد على هاتف حقيقي).', governanceStatus: 'يحتاج تحققاً' },
  { id: 5, module: 'قبول الرحلات وتقديم العروض الحية', detail: 'استقبال الطلبات القريبة عبر Redis/PostGIS والرد بسعر أو قبول مباشر خلال مهلة 15 ثانية.', governanceStatus: 'قيد التنفيذ' },
  { id: 6, module: 'الملاحة ومتابعة المحطات المتعددة Add Stop', detail: 'توجيه لمحطات التوقف والوجهة النهائية دون تداخل مع شاشات نقل البضائع.', governanceStatus: 'قيد التنفيذ' },
  { id: 7, module: 'المحفظة المالية وسحب المستحقات', detail: 'عرض صافي العمولات وأجرة الكابتن منفصلة عن خصومات 4B والشركات، وسحب الرصيد.', governanceStatus: 'يحتاج تحققاً' },
  { id: 8, module: 'الحوافز الأسبوعية ومستوى الالتزام', detail: 'أهداف عدد الرحلات وتقارير الأداء اليومي والأسبوعي.', governanceStatus: 'قيد التنفيذ' },
  { id: 9, module: 'الالتزام بربط LTRA (قانون 87/2018)', detail: 'إرسال بيانات الرحلات والكباتن والمركبات لخوادم جهاز تنظيم النقل البري.', governanceStatus: 'قيد التنفيذ' },
  { id: 10, module: 'الدعم الفني والطوارئ SOS و604A', detail: 'ربط مباشر مع خدمة العملاء والكول سنتر بمقر المعادي.', governanceStatus: 'مؤكد' },
];

export const WEKALA_SPECS: {
  summary: string;
  deferralRule: string;
  commissionNote: string;
  modules5: Array<{ id: number; name: string; description: string }>;
} = {
  summary: 'منصة Marketplace متكاملة (ليست نظام إدارة فروع نقل) — تشمل البيع المباشر والإعلانات المبوبة والمزادات والمقايضة وصفحات التجار الموثقين.',
  deferralRule: 'مؤجل مؤقتاً حتى استلام وتشغيل 4B واستقرار المقر — يمتلك الكيان الهندسي حصرها دون فريق تشغيل مستقل الآن.',
  commissionNote: 'نسب العمولات ورسوم الإعلانات وخدمات الضمان المالي (Escrow) غير معتمدة نهائياً وتحتاج تحققاً مالياً وقانونياً.',
  modules5: [
    { id: 1, name: '1. الإعلانات المبوبة (Classifieds)', description: 'عرض منتجات وخدمات مباشرة بين الأفراد والتجار بالبحث والتصنيفات.' },
    { id: 2, name: '2. البيع المباشر (Buy Now)', description: 'شراء فوري بسعر ثابت مع سلة وتأكيد طلب.' },
    { id: 3, name: '3. المزادات الحية والمحدودة (Auctions)', description: 'تقديم عروض أسعار تنافسية بفواصل زمنية محددة.' },
    { id: 4, name: '4. المقايضة (Barter Exchange)', description: 'تبادل سلع بسلع أو سلع مع فرق نقدي بالتراضي.' },
    { id: 5, name: '5. صفحات التجار الموثقين (Verified Merchant Pages)', description: 'متاجر فرعية للتجار المعتمدين بتقييمات ومخزون.' },
  ],
};

export const UNIFIED_SUPABASE_SQL = `-- ==============================================================================
-- NOUB CRM + MESHAWIR DIGITAL PLATFORMS — UNIFIED IDEMPOTENT SUPABASE SQL
-- Includes: Direct Access (No Login Friction), 22+ Meshawir Tables + 30-Point Verification Matrix
-- Run directly in Supabase > SQL Editor > Run
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable direct client connection on original NOUB CRM tables (passcode gated in UI: 12345678)
DO $$ DECLARE t TEXT; BEGIN
  FOREACH t IN ARRAY ARRAY['telecom_lines','domains','wanted_domains','providers','api_keys','sites','payments','apps','deliverables','team'] LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=t) THEN
      EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', t);
    END IF;
  END LOOP;
END $$;

-- Full Meshawir Schema Tables
CREATE TABLE IF NOT EXISTS public.meshawir_enterprises (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    legal_name TEXT NOT NULL,
    commercial_register TEXT,
    tax_number TEXT,
    duns_number_status TEXT DEFAULT 'قيد الاستخراج والتحديث (أكتوبر)',
    headquarters_address TEXT,
    city TEXT DEFAULT 'القاهرة',
    country TEXT DEFAULT 'مصر',
    established_date DATE,
    ceo_name TEXT,
    branch_manager_name TEXT DEFAULT 'المهندس عماد الشرقاوي',
    cto_name TEXT DEFAULT 'المهندس سامح يس',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY,
    enterprise_id TEXT REFERENCES public.meshawir_enterprises(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL DEFAULT 'مشاوير',
    status TEXT NOT NULL DEFAULT 'نشط',
    figma_completion_pct INT DEFAULT 0,
    description TEXT,
    repo_url TEXT,
    figma_url TEXT,
    live_url TEXT,
    apk_files JSONB DEFAULT '[]'::jsonb,
    drive_assets JSONB DEFAULT '[]'::jsonb,
    reference_chats JSONB DEFAULT '[]'::jsonb,
    context_hints JSONB DEFAULT '[]'::jsonb,
    db_info JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.meshawir_project_milestones (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
    phase_code TEXT,
    title TEXT NOT NULL,
    target_date DATE,
    completion_percentage INT DEFAULT 0,
    status TEXT DEFAULT 'قيد التنفيذ',
    deliverables_summary TEXT,
    sign_off_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.meshawir_team_profiles (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    efficiency_rate INT DEFAULT 95,
    email TEXT,
    phone TEXT,
    role_description TEXT,
    primary_strengths JSONB DEFAULT '[]'::jsonb,
    direct_responsibilities JSONB DEFAULT '[]'::jsonb,
    readiness_status TEXT DEFAULT 'جاهز وحاضر',
    priority_order INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.service_providers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    portal_url TEXT,
    username TEXT,
    account_manager TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    status TEXT NOT NULL DEFAULT 'نشط',
    notes TEXT,
    cost_or_plan TEXT,
    official_badge TEXT,
    active_services JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.meshawir_quotations (
    id TEXT PRIMARY KEY,
    provider_id TEXT REFERENCES public.service_providers(id) ON DELETE SET NULL,
    quote_number TEXT NOT NULL,
    title TEXT NOT NULL,
    submission_date DATE,
    valid_until DATE,
    subtotal_egp NUMERIC(12,2),
    vat_egp NUMERIC(12,2),
    total_egp NUMERIC(12,2),
    is_tax_invoice BOOLEAN DEFAULT FALSE,
    eta_uuid TEXT,
    status TEXT DEFAULT 'معتمد ومسدد',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.meshawir_server_racks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    total_units INT DEFAULT 27,
    depth_mm INT DEFAULT 1000,
    width_inches INT DEFAULT 19,
    location TEXT,
    cooling_type TEXT,
    power_backup TEXT,
    lock_status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.meshawir_rack_devices (
    id TEXT PRIMARY KEY,
    rack_id TEXT REFERENCES public.meshawir_server_racks(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    arabic_name TEXT NOT NULL,
    model TEXT NOT NULL,
    manufacturer TEXT NOT NULL,
    u_position_start INT NOT NULL,
    u_height INT NOT NULL,
    device_category TEXT NOT NULL,
    serial_number TEXT,
    ip_management TEXT,
    mac_address TEXT,
    power_watts NUMERIC(6,2),
    operating_temp_c NUMERIC(4,1) DEFAULT 22.0,
    status TEXT DEFAULT 'online',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.meshawir_rack_ports (
    id TEXT PRIMARY KEY,
    device_id TEXT REFERENCES public.meshawir_rack_devices(id) ON DELETE CASCADE,
    port_number INT NOT NULL,
    label TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    connected_device TEXT,
    device_type TEXT,
    user_endpoint TEXT,
    ip_address TEXT,
    mac_address TEXT,
    vlan_name TEXT,
    vlan_id INT,
    speed_duplex TEXT DEFAULT '1000 Mbps Full Duplex',
    poe_watts NUMERIC(5,2) DEFAULT 0,
    cable_color TEXT DEFAULT 'blue',
    patch_panel_cross_port INT,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS public.meshawir_4b_leased_lines (
    id TEXT PRIMARY KEY,
    circuit_reference TEXT NOT NULL UNIQUE,
    provider_name TEXT NOT NULL,
    service_type TEXT NOT NULL,
    bandwidth_mbps INT NOT NULL,
    source_endpoint TEXT NOT NULL,
    destination_endpoint TEXT NOT NULL,
    primary_gateway_ip TEXT,
    backup_gateway_ip TEXT,
    monthly_cost_egp NUMERIC(10,2),
    contract_ref TEXT,
    status TEXT DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.meshawir_cctv_cameras (
    id TEXT PRIMARY KEY,
    camera_number INT NOT NULL,
    model TEXT DEFAULT 'Hikvision 5MP IP Camera',
    resolution TEXT DEFAULT '5 Megapixel',
    location_in_office TEXT NOT NULL,
    nvr_channel INT NOT NULL,
    ip_address TEXT,
    switch_port INT,
    has_audio_mic BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'online',
    contractor_name TEXT DEFAULT 'شركة الأصدقاء للأنظمة الأمنية (بشمهندس علي)'
);

CREATE TABLE IF NOT EXISTS public.meshawir_voip_extensions (
    id TEXT PRIMARY KEY,
    extension_number TEXT NOT NULL UNIQUE,
    user_name TEXT NOT NULL,
    department TEXT NOT NULL,
    device_model TEXT DEFAULT 'Grandstream GRP2614 HD PoE',
    ip_address TEXT,
    switch_port INT,
    vlan_id INT DEFAULT 30,
    status TEXT DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS public.mashweer_emails (
    id TEXT PRIMARY KEY,
    address TEXT NOT NULL UNIQUE,
    role_title TEXT NOT NULL,
    department TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'نشط ومعتمد',
    quota TEXT DEFAULT '5 GB',
    assigned_to TEXT,
    webmail_url TEXT DEFAULT 'https://mail.zoho.com',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.meshawir_domains (
    id TEXT PRIMARY KEY,
    domain_name TEXT NOT NULL UNIQUE,
    registrar TEXT NOT NULL,
    expiry_date DATE,
    associated_project_id TEXT REFERENCES public.projects(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'active',
    notes TEXT
);

CREATE TABLE IF NOT EXISTS public.project_tasks (
    id TEXT PRIMARY KEY,
    task_number INT,
    project_id TEXT,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT NOT NULL DEFAULT 'متوسطة',
    status TEXT NOT NULL DEFAULT 'قيد التنفيذ',
    risk_level TEXT DEFAULT 'safe',
    due_date TEXT,
    assigned_to TEXT,
    is_emad_key_task BOOLEAN DEFAULT FALSE,
    is_sameh_software_task BOOLEAN DEFAULT FALSE,
    is_mowaffaq_ops_task BOOLEAN DEFAULT FALSE,
    is_lawyer_task BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.meshawir_facility_zones (
    id TEXT PRIMARY KEY,
    zone_name TEXT NOT NULL,
    allocated_purpose TEXT NOT NULL,
    dimensions_text TEXT,
    capacity_people INT,
    workstation_ports_count INT,
    cctv_cameras_count INT,
    assigned_staff TEXT,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS public.hardware_inventory (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    specs TEXT,
    location TEXT,
    invoice_ref TEXT,
    vendor TEXT,
    status TEXT DEFAULT 'مورد ومعتمد',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.meshawir_legal_dossiers (
    id TEXT PRIMARY KEY,
    dossier_title TEXT NOT NULL,
    authority_name TEXT NOT NULL,
    case_reference TEXT,
    lead_counsel TEXT DEFAULT 'أ/ محمد مصطفى (المحامي)',
    status TEXT DEFAULT 'قيد المتابعة',
    action_required TEXT
);

CREATE TABLE IF NOT EXISTS public.system_inquiries (
    id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    context TEXT,
    category TEXT NOT NULL,
    urgency TEXT NOT NULL DEFAULT 'medium',
    options JSONB DEFAULT '[]'::jsonb,
    answered BOOLEAN DEFAULT FALSE,
    answer TEXT
);

CREATE TABLE IF NOT EXISTS public.meshawir_subsidiary_proposals (
    id TEXT PRIMARY KEY,
    proposal_title TEXT NOT NULL,
    recipient_investor TEXT DEFAULT 'أ/ أبو خالد',
    proposed_by TEXT DEFAULT 'المهندس سامح يس',
    strategic_objectives JSONB DEFAULT '[]'::jsonb,
    corporate_structure JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'معروض للنقاش'
);

CREATE TABLE IF NOT EXISTS public.meshawir_general_ledger (
    id TEXT PRIMARY KEY,
    item_number INT NOT NULL,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    detail TEXT,
    amount_egp NUMERIC(12,2) DEFAULT 0,
    invoice_ref TEXT,
    status TEXT DEFAULT 'معتمد',
    date_recorded DATE
);

CREATE TABLE IF NOT EXISTS public.meshawir_kaggle_research (
    id TEXT PRIMARY KEY,
    paper_title TEXT NOT NULL,
    track_name TEXT DEFAULT 'Kaggle Paper Track ($100,000)',
    deadline_date DATE DEFAULT '2026-10-17',
    primary_author TEXT DEFAULT 'المهندس سامح يس',
    abstract_text TEXT,
    framework_model TEXT DEFAULT 'UCP-LLM (25 Sections) + Gemma 4 LoRA/Unsloth + Eve v1.1.0',
    submission_status TEXT DEFAULT 'جاري التنفيذ حتى 17 أكتوبر'
);

CREATE TABLE IF NOT EXISTS public.meshawir_verification_checks (
    id TEXT PRIMARY KEY,
    num INT NOT NULL,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'يحتاج تحققاً',
    context_note TEXT,
    verification_note TEXT DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS across Meshawir tables for seamless direct connection
DO $$ DECLARE t TEXT; BEGIN
  FOREACH t IN ARRAY ARRAY[
    'meshawir_enterprises','projects','meshawir_project_milestones','meshawir_team_profiles',
    'service_providers','meshawir_quotations','meshawir_server_racks','meshawir_rack_devices',
    'meshawir_rack_ports','meshawir_4b_leased_lines','meshawir_cctv_cameras','meshawir_voip_extensions',
    'mashweer_emails','meshawir_domains','project_tasks','meshawir_facility_zones',
    'hardware_inventory','meshawir_legal_dossiers','system_inquiries','meshawir_subsidiary_proposals',
    'meshawir_general_ledger','meshawir_kaggle_research','meshawir_verification_checks'
  ] LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=t) THEN
      EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', t);
    END IF;
  END LOOP;
END $$;
`;
