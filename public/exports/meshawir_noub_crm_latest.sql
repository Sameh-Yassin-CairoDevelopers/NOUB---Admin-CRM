-- ==============================================================================
-- NOUB CRM + MESHAWIR DIGITAL PLATFORMS — LATEST UNIFIED IDEMPOTENT SUPABASE SQL
-- Version: 2026-11-25 (Zero-Conflict Upsert for Existing & Fresh Databases)
-- Includes:
--   1. All 10 NOUB CRM tables (UUID safe upsert without duplicate rows or conflicts)
--   2. View public.v_due (upcoming/overdue financial & domain obligations)
--   3. All 24 Meshawir tables (Projects, 4B/Captain/Daro/WeKaLa, Rack 27U + 58 Ports,
--      Leased Lines, 16 CCTV, 12 VoIP, Zoho Emails, 12 ETA Invoices, 10 Facility Zones,
--      Hardware, 4 Legal Dossiers, Tasks + due_date, Verification 30, Joint Tasks 105)
-- Run directly in Supabase > SQL Editor > Run
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- PART 1: ORIGINAL 10 NOUB CRM TABLES (IDEMPOTENT + ZERO-CONFLICT)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.telecom_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  kind text,
  number text,
  service text,
  provider text,
  plan text,
  cycle text,
  amount numeric CHECK (amount >= 0),
  due_date date,
  notes text
);

CREATE TABLE IF NOT EXISTS public.domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  kind text,
  provider text,
  start_date date,
  cycle text,
  amount numeric CHECK (amount >= 0),
  due_date date,
  auto_renew boolean DEFAULT false,
  notes text
);

CREATE TABLE IF NOT EXISTS public.wanted_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  ext text,
  provider text,
  price numeric CHECK (price >= 0),
  priority text,
  status text DEFAULT 'فكرة',
  project text,
  notes text
);

CREATE TABLE IF NOT EXISTS public.providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  category text,
  site text,
  login_url text,
  username text,
  pwd_type text CHECK (pwd_type IN ('برايفت (الماستر)', 'بابليك', 'جوجل لوجن')),
  start_date date,
  funding text,
  amount numeric CHECK (amount >= 0),
  cycle text,
  due_date date,
  owner text,
  notes text
);

CREATE TABLE IF NOT EXISTS public.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  provider text NOT NULL,
  service text,
  site text,
  env text,
  key_label text,
  secret_location text,
  created_on date,
  expires_on date,
  billing text,
  alert_limit numeric,
  notes text
);

CREATE TABLE IF NOT EXISTS public.sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  url text,
  purpose text,
  providers text,
  pwd_type text CHECK (pwd_type IN ('برايفت (الماستر)', 'بابليك', 'جوجل لوجن')),
  it_owner text,
  handover_date date,
  notes text
);

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  paid_on date NOT NULL,
  item text NOT NULL,
  amount numeric NOT NULL CHECK (amount >= 0),
  method text,
  ref text,
  notes text
);

CREATE TABLE IF NOT EXISTS public.apps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  description text,
  platforms text,
  start_date date,
  launch_date date,
  status text DEFAULT 'لم يبدأ'
);

CREATE TABLE IF NOT EXISTS public.deliverables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  app_id uuid NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  stage text,
  item text NOT NULL,
  owner text,
  start_date date,
  end_date date,
  received_on date,
  status text DEFAULT 'لم يبدأ',
  acceptance text DEFAULT 'لم يُختبر',
  notes text
);

CREATE TABLE IF NOT EXISTS public.team (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  app_id uuid NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  level text,
  title text NOT NULL,
  person text,
  party text,
  job_status text DEFAULT 'شاغر',
  reports_to text,
  contact text,
  duties text
);

-- Disable RLS & remove old restrictive policy on 10 CRM tables (Passcode gated in app)
DO $$ DECLARE t TEXT; BEGIN
  FOREACH t IN ARRAY ARRAY['telecom_lines','domains','wanted_domains','providers','api_keys','sites','payments','apps','deliverables','team'] LOOP
    EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "auth_all" ON public.%I', t);
  END LOOP;
END $$;

CREATE OR REPLACE VIEW public.v_due WITH (security_invoker = true) AS
  SELECT 'الاتصالات' AS cat, name AS item, amount, due_date, (due_date - CURRENT_DATE) AS days_left
  FROM public.telecom_lines WHERE due_date IS NOT NULL
  UNION ALL
  SELECT 'الدومينات والاستضافة', name, amount, due_date, (due_date - CURRENT_DATE)
  FROM public.domains WHERE due_date IS NOT NULL
  UNION ALL
  SELECT 'مزودو الخدمات', name, amount, due_date, (due_date - CURRENT_DATE)
  FROM public.providers WHERE due_date IS NOT NULL;

-- Safe UUID-preserving Sync for the 10 NOUB CRM tables (Zero conflicts & zero duplicates)
DO $$
DECLARE
  v_app_4b uuid;
  v_app_cap uuid;
  v_app_daro uuid;
  v_app_wikala uuid;
BEGIN
  -- 1) Apps (update legacy names if present, otherwise update by latest name or insert)
  UPDATE public.apps
  SET name = '4B — تطبيق العملاء (النقل الذكي)',
      description = 'تطبيق الركاب والأولوية القصوى للإطلاق: فوري ومجدول، مزايدة حية، Add Stop متعدد المحطات، 4 فئات مركبات (النصف نقل للبضائع فقط)، و4B Prepaid Trips B2B',
      platforms = 'أندرويد · iOS · لوحة إدارة',
      start_date = COALESCE(start_date, '2026-06-01'),
      launch_date = COALESCE(launch_date, '2026-11-30'),
      status = 'في الفترة التجريبية'
  WHERE name IN ('4B (فوربي)', '4B — تطبيق العملاء (النقل الذكي)');
  IF NOT FOUND THEN
    INSERT INTO public.apps (name, description, platforms, start_date, launch_date, status)
    VALUES ('4B — تطبيق العملاء (النقل الذكي)', 'تطبيق الركاب والأولوية القصوى للإطلاق: فوري ومجدول، مزايدة حية، Add Stop متعدد المحطات، 4 فئات مركبات (النصف نقل للبضائع فقط)، و4B Prepaid Trips B2B', 'أندرويد · iOS · لوحة إدارة', '2026-06-01', '2026-11-30', 'في الفترة التجريبية');
  END IF;
  SELECT id INTO v_app_4b FROM public.apps WHERE name = '4B — تطبيق العملاء (النقل الذكي)' LIMIT 1;

  UPDATE public.apps
  SET description = 'تطبيق الكابتن المستقل عن تطبيق العملاء: استقبال الطلبات والمزايدة، التحقق الحيوي CompreFace داخل مصر، فحص GPS Integrity، والمحفظة المالية وربط LTRA',
      platforms = 'أندرويد · iOS · بوابة LTRA',
      start_date = COALESCE(start_date, '2026-06-01'),
      launch_date = COALESCE(launch_date, '2026-11-30'),
      status = 'قيد التنفيذ'
  WHERE name = 'كابتن مشاوير (تطبيق السائقين المستقل)';
  IF NOT FOUND THEN
    INSERT INTO public.apps (name, description, platforms, start_date, launch_date, status)
    VALUES ('كابتن مشاوير (تطبيق السائقين المستقل)', 'تطبيق الكابتن المستقل عن تطبيق العملاء: استقبال الطلبات والمزايدة، التحقق الحيوي CompreFace داخل مصر، فحص GPS Integrity، والمحفظة المالية وربط LTRA', 'أندرويد · iOS · بوابة LTRA', '2026-06-01', '2026-11-30', 'قيد التنفيذ');
  END IF;
  SELECT id INTO v_app_cap FROM public.apps WHERE name = 'كابتن مشاوير (تطبيق السائقين المستقل)' LIMIT 1;

  UPDATE public.apps
  SET name = 'DARO (دارو سوبر آب للزوار والسياح — مؤجل)',
      description = 'تطبيق شامل للزوار العرب والسياح بمصر (إقامة، سيارات، طيران داخلي بمصر فقط عبر Amadeus/EgyptAir، مطاعم، طب) — مؤجل لحين تشغيل 4B وحل عيوب Figma الـ 8',
      platforms = 'أندرويد · iOS · 6 قطاعات و5 أدوار',
      start_date = COALESCE(start_date, '2026-07-01'),
      launch_date = COALESCE(launch_date, '2027-02-01'),
      status = 'متوقف'
  WHERE name IN ('DARO (دارو)', 'DARO (دارو سوبر آب للزوار والسياح — مؤجل)');
  IF NOT FOUND THEN
    INSERT INTO public.apps (name, description, platforms, start_date, launch_date, status)
    VALUES ('DARO (دارو سوبر آب للزوار والسياح — مؤجل)', 'تطبيق شامل للزوار العرب والسياح بمصر (إقامة، سيارات، طيران داخلي بمصر فقط عبر Amadeus/EgyptAir، مطاعم، طب) — مؤجل لحين تشغيل 4B وحل عيوب Figma الـ 8', 'أندرويد · iOS · 6 قطاعات و5 أدوار', '2026-07-01', '2027-02-01', 'متوقف');
  END IF;
  SELECT id INTO v_app_daro FROM public.apps WHERE name = 'DARO (دارو سوبر آب للزوار والسياح — مؤجل)' LIMIT 1;

  UPDATE public.apps
  SET name = 'WeKaLa (سوق وكالة Marketplace — مؤجل)',
      description = 'سوق إلكتروني شامل (إعلانات مبوبة، بيع مباشر، مزادات، مقايضة، صفحات تجار موثقين) — مؤجل لحين تشغيل 4B وتحديد العمولات والضمان',
      platforms = 'أندرويد · iOS · صفحات تجار',
      start_date = COALESCE(start_date, '2026-06-15'),
      launch_date = COALESCE(launch_date, '2027-01-15'),
      status = 'متوقف'
  WHERE name IN ('WIKALA (وكالة)', 'WeKaLa (سوق وكالة Marketplace — مؤجل)');
  IF NOT FOUND THEN
    INSERT INTO public.apps (name, description, platforms, start_date, launch_date, status)
    VALUES ('WeKaLa (سوق وكالة Marketplace — مؤجل)', 'سوق إلكتروني شامل (إعلانات مبوبة، بيع مباشر، مزادات، مقايضة، صفحات تجار موثقين) — مؤجل لحين تشغيل 4B وتحديد العمولات والضمان', 'أندرويد · iOS · صفحات تجار', '2026-06-15', '2027-01-15', 'متوقف');
  END IF;
  SELECT id INTO v_app_wikala FROM public.apps WHERE name = 'WeKaLa (سوق وكالة Marketplace — مؤجل)' LIMIT 1;

  -- 2) Telecom Lines (update legacy names or insert missing)
  UPDATE public.telecom_lines
  SET name = 'خط أرضي 1 (إنترنت WE ADSL على TP-Link ER8411 WAN1)',
      number = 'خط أرضي 1 — المعادي',
      service = 'مربوط فعلياً بـ TP-Link ER8411 WAN1 + Static Public IP معتمد',
      provider = 'المصرية للاتصالات WE',
      amount = 500
  WHERE name IN ('خط أرضي 1', 'خط أرضي 1 (إنترنت WE ADSL على TP-Link ER8411 WAN1)');
  IF NOT FOUND THEN
    INSERT INTO public.telecom_lines (name, kind, number, service, provider, cycle, amount)
    VALUES ('خط أرضي 1 (إنترنت WE ADSL على TP-Link ER8411 WAN1)', 'أرضي', 'خط أرضي 1 — المعادي', 'مربوط فعلياً بـ TP-Link ER8411 WAN1 + Static Public IP معتمد', 'المصرية للاتصالات WE', 'شهري', 500);
  END IF;

  UPDATE public.telecom_lines
  SET name = 'خط أرضي 2 (راكب على سنترال Grandstream 604A FXO-1)',
      number = 'خط أرضي 2 — المعادي',
      service = 'مربوط فعلياً بـ Grandstream 604A للعملاء والكباتن',
      provider = 'المصرية للاتصالات WE',
      amount = 250
  WHERE name IN ('خط أرضي 2', 'خط أرضي 2 (راكب على سنترال Grandstream 604A FXO-1)');
  IF NOT FOUND THEN
    INSERT INTO public.telecom_lines (name, kind, number, service, provider, cycle, amount)
    VALUES ('خط أرضي 2 (راكب على سنترال Grandstream 604A FXO-1)', 'أرضي', 'خط أرضي 2 — المعادي', 'مربوط فعلياً بـ Grandstream 604A للعملاء والكباتن', 'المصرية للاتصالات WE', 'شهري', 250);
  END IF;

  INSERT INTO public.telecom_lines (name, kind, number, service, provider, plan, cycle, amount)
  SELECT v.name, v.kind, v.number, v.service, v.provider, v.plan, v.cycle, v.amount
  FROM (VALUES
    ('راوتر Vodafone 5G + H153-381 (WAN2 على TP-Link ER8411)', 'محمول', 'فاتورة 748994 + باقة 5G', 'إنترنت عالي السرعة مدمج مع ER8411 فعلياً', 'فودافون مصر', 'Vodafone 5G + باقة 520', 'شهري', 750::numeric),
    ('خط تجميع فايبر WE L3VPN (24Mbps + 6 فروع 4Mbps)', 'أرضي', 'TE-CAI-4B-PRI-4821', 'ربط مباشر مع القرية الذكية < 5ms (PO #6078927)', 'المصرية للاتصالات WE', 'WE L3VPN 24Mbps', 'ربع سنوي', 90000::numeric),
    ('شريحة أورنج 4G + شرائح OTP (BroadNet & Twilio)', 'محمول', NULL, 'طوارئ الشبكة ورسائل التحقق OTP', 'أورنج بيزنس / فودافون', NULL, 'شهري', NULL::numeric)
  ) AS v(name, kind, number, service, provider, plan, cycle, amount)
  WHERE NOT EXISTS (SELECT 1 FROM public.telecom_lines t WHERE t.name = v.name);

  -- 3) Domains
  UPDATE public.domains
  SET provider = 'المصرية EC (م/ محمد الحلو)', start_date = '2026-08-09', cycle = 'سنوي', amount = 1254, due_date = '2027-08-09',
      notes = 'مطلوب التجديد لسنتين قادمتين'
  WHERE name = 'mashawer.com.eg';
  IF NOT FOUND THEN
    INSERT INTO public.domains (name, kind, provider, start_date, cycle, amount, due_date, auto_renew, notes)
    VALUES ('mashawer.com.eg', 'دومين', 'المصرية EC (م/ محمد الحلو)', '2026-08-09', 'سنوي', 1254, '2027-08-09', false, 'مطلوب التجديد لسنتين قادمتين');
  END IF;

  INSERT INTO public.domains (name, kind, provider, start_date, cycle, amount, due_date, auto_renew)
  SELECT 'استضافة الموقع الرئيسي Host1', 'استضافة', 'المصرية EC (م/ محمد الحلو)', '2026-08-11'::date, 'سنوي', 2508, '2027-08-11'::date, false
  WHERE NOT EXISTS (SELECT 1 FROM public.domains WHERE name = 'استضافة الموقع الرئيسي Host1');

  -- 4) Wanted Domains
  INSERT INTO public.wanted_domains (name, ext, provider, priority, status, project, notes)
  SELECT v.name, v.ext, v.provider, v.priority, v.status, v.project, v.notes
  FROM (VALUES
    ('mashweer.net', '.net', 'EC / مسجل خارجي', 'عالية', 'محجوز', 'عدة تطبيقات', 'مقترح تجديده مع mashawer.com.eg'),
    ('wikala.com.eg', '.com.eg', 'المصرية EC', 'عالية', 'متاح', 'WIKALA', 'بانتظار السجل التجاري وشهادة المنشأ (مؤجل)'),
    ('daro.eg', '.eg', 'المصرية EC', 'عالية', 'متاح', 'DARO', 'النطاق الرسمي لسوبر آب الزوار العرب والسياح (مؤجل)')
  ) AS v(name, ext, provider, priority, status, project, notes)
  WHERE NOT EXISTS (SELECT 1 FROM public.wanted_domains w WHERE w.name = v.name);

  -- 5) Providers (NOUB CRM table)
  INSERT INTO public.providers (name, category, site, login_url, username, pwd_type, funding, amount, cycle, owner, notes)
  SELECT v.name, v.category, v.site, v.login_url, v.username, v.pwd_type, v.funding, v.amount, v.cycle, v.owner, v.notes
  FROM (VALUES
    ('المصرية للاتصالات (WE Cloud & WAF)', 'سحابة / متاجر', '4B', 'https://cloud.te.eg/portal', 'mashweer_telecom_admin', 'برايفت (الماستر)', 'اشتراك ثابت', 201874::numeric, 'ربع سنوي', 'المهندس عماد الشرقاوي + المهندس سامح يس', 'PO #6078933 بإجمالي 807,496 ج.م/سنة'),
    ('المصرية للاتصالات (WE Fiber 24Mbps + 6x4Mbps)', 'أخرى', 'عدة تطبيقات', 'https://cloud.te.eg/portal', NULL, 'برايفت (الماستر)', 'اشتراك ثابت', 90000::numeric, 'ربع سنوي', 'المهندس عماد الشرقاوي + م/ أحمد محرم', 'PO #6078927 بإجمالي 360,000 ج.م/سنة'),
    ('Google Cloud & Maps', 'خرائط', 'عدة تطبيقات', 'https://console.cloud.google.com', 'admin@mashweer.com.eg', 'جوجل لوجن', 'حسب الاستخدام', NULL::numeric, 'حسب الاستخدام', 'المهندس سامح يس + أ/ هاني', NULL),
    ('Cloudinary', 'وسائط', '4B', 'https://cloudinary.com', 'mashweer-cloud', 'برايفت (الماستر)', 'رصيد مسبق', NULL::numeric, NULL, 'المهندس سامح يس', NULL),
    ('BroadNet SMS', 'رسائل / إشعارات', '4B', 'https://broadnetme.com/portal/login', 'mashawer', 'برايفت (الماستر)', 'رصيد مسبق', NULL::numeric, NULL, 'المهندس عماد الشرقاوي + المهندس سامح يس', NULL),
    ('Twilio', 'رسائل / إشعارات', 'WIKALA', 'https://console.twilio.com', NULL, 'برايفت (الماستر)', 'رصيد مسبق', NULL::numeric, NULL, 'المهندس عماد الشرقاوي + المهندس سامح يس', NULL),
    ('Fawry Enterprise', 'دفع', '4B', 'https://fawry.com', 'FAWRY_MERCHANT_CODE_MASHWEER', 'برايفت (الماستر)', 'حسب الاستخدام', NULL::numeric, NULL, 'أ/ هاني', NULL),
    ('Supabase Cloud', 'قواعد بيانات', 'عدة تطبيقات', 'https://supabase.com/dashboard', 'salkyuytjvjxspxbawzg', 'برايفت (الماستر)', 'اشتراك ثابت', NULL::numeric, NULL, 'المهندس سامح يس', NULL),
    ('Zoho Mail Lite (5 حسابات)', 'أخرى', 'عدة تطبيقات', 'https://mail.zoho.com', 'admin@mashweer.com.eg', 'برايفت (الماستر)', 'مجاني', NULL::numeric, NULL, 'المهندس عماد الشرقاوي', NULL)
  ) AS v(name, category, site, login_url, username, pwd_type, funding, amount, cycle, owner, notes)
  WHERE NOT EXISTS (SELECT 1 FROM public.providers p WHERE p.name = v.name);

  -- 6) API Keys
  INSERT INTO public.api_keys (provider, service, site, env, key_label, secret_location, billing)
  SELECT v.provider, v.service, v.site, v.env, v.key_label, v.secret_location, v.billing
  FROM (VALUES
    ('Google Maps', 'Maps / Places / Directions', '4B', 'Production', '4B_SERVER_MAPS_KEY', 'خزنة الأسرار الإدارية / .env', 'حسب الاستخدام'),
    ('BroadNet', 'OTP SMS Gateway', '4B', 'Production', 'BROADNET_API_KEY', 'خزنة الأسرار الإدارية', 'رصيد مسبق'),
    ('Cloudinary', 'Signed Media Storage', '4B', 'Production', 'CLOUDINARY_API_SECRET', 'خزنة الأسرار الإدارية', 'رصيد مسبق'),
    ('Fawry', 'Payment & Wallet Webhook', '4B', 'Test', 'FAWRY_MERCHANT_CODE_MASHWEER', 'خزنة الإدارة المالية', 'حسب الاستخدام')
  ) AS v(provider, service, site, env, key_label, secret_location, billing)
  WHERE NOT EXISTS (SELECT 1 FROM public.api_keys k WHERE k.key_label = v.key_label);

  -- 7) Sites
  INSERT INTO public.sites (name, url, purpose, providers, pwd_type, it_owner)
  SELECT v.name, v.url, v.purpose, v.providers, v.pwd_type, v.it_owner
  FROM (VALUES
    ('راوتر وفايروول TP-Link ER8411 (رئيسي)', 'https://192.168.10.1', 'إدارة خط WE ADSL + Static Public IP + Vodafone 5G + WireGuard VPN', 'مقر المعادي', 'برايفت (الماستر)', 'المهندس عماد الشرقاوي'),
    ('سنترال Grandstream UCM6304A (604A)', 'https://192.168.30.1:8089', 'التحويلات 100-116 وWave عن بُعد (25–30 مستخدماً عبر WireGuard VLAN 30)', 'مقر المعادي', 'برايفت (الماستر)', 'المهندس عماد الشرقاوي'),
    ('بوابة WE Cloud & F5 WAF', 'https://cloud.te.eg/portal', 'إدارة خوادم 4B السحابية وجدار F5 WAF', 'المصرية للاتصالات WE', 'برايفت (الماستر)', 'المهندس عماد الشرقاوي'),
    ('لوحة EC للنطاقات والاستضافة', 'https://clients.ec.com.eg/clientarea.php', 'إدارة DNS وتجديد mashawer.com.eg', 'EC Egypt', 'برايفت (الماستر)', 'المهندس عماد الشرقاوي'),
    ('لوحة Proxmox VE 8.x (Z440 #1)', 'https://192.168.10.20:8006', 'إدارة الأجهزة الافتراضية وOPNsense المساند وخزنة الباك أب', 'مقر المعادي', 'برايفت (الماستر)', 'المهندس عماد الشرقاوي')
  ) AS v(name, url, purpose, providers, pwd_type, it_owner)
  WHERE NOT EXISTS (SELECT 1 FROM public.sites s WHERE s.name = v.name);

  -- 8) Payments
  INSERT INTO public.payments (paid_on, item, amount, method, ref)
  SELECT v.paid_on::date, v.item, v.amount, v.method, v.ref
  FROM (VALUES
    ('2026-09-26', 'فاتورة QTS #1169 (سيرفر Dell R640 + جهازي HP Z440)', 96295.80::numeric, 'تحويل بنكي', 'ETA #1169'),
    ('2026-06-09', 'فاتورة تكنو ستورز الدقي (3 أجهزة Dell + 3 شاشات HP)', 39901.14::numeric, 'تحويل بنكي', 'ETA Techno'),
    ('2026-03-29', 'فاتورة رد لاين البستان (كابينة راك بيرلا 27U وأدوات الشبكة)', 18550.00::numeric, 'نقدي', 'ETA RedLine'),
    ('2026-09-28', 'فاتورة QTS #1172 (سويتش سيسكو Catalyst 3850 48P)', 11970.00::numeric, 'تحويل بنكي', 'ETA #1172'),
    ('2026-09-28', 'إذن المنشاوي البستان (هاردات SAS 1.2TB و 2TB) — بانتظار الضريبية', 8510.00::numeric, 'نقدي', 'إذن مؤقت #001096'),
    ('2026-09-28', 'فاتورة فودافون صقر قريش (راوتر H153-381 والشريحة والباقة)', 3326.46::numeric, 'نقدي', '748994'),
    ('2026-03-26', 'فاتورة طيبة رنين (سلم 6 درجات وكراسي وترابيزة)', 2951.00::numeric, 'نقدي', 'ETA Tiba'),
    ('2026-08-11', 'فاتورة EC (تجديد استضافة Host1 حتى أغسطس 2027)', 2508.00::numeric, 'تحويل بنكي', 'EC #1331'),
    ('2026-08-09', 'فاتورة EC (تجديد نطاق mashawer.com.eg حتى أغسطس 2027)', 1254.00::numeric, 'تحويل بنكي', 'EC #1325')
  ) AS v(paid_on, item, amount, method, ref)
  WHERE NOT EXISTS (SELECT 1 FROM public.payments p WHERE p.item = v.item AND p.paid_on = v.paid_on::date);

  -- 9) Deliverables (add missing template deliverables for any app including Captain Mashawir)
  INSERT INTO public.deliverables (app_id, stage, item)
  SELECT a.id, v.s, v.i
  FROM public.apps a
  CROSS JOIN (VALUES
    ('التخطيط والمتطلبات', 'وثيقة متطلبات المنتج (PRD)'),
    ('التخطيط والمتطلبات', 'دراسة السوق المصري والمنافسين'),
    ('التخطيط والمتطلبات', 'خريطة رحلة المستخدم والميزات'),
    ('التصميم', 'تصميم تجربة المستخدم UX'),
    ('التصميم', 'نظام التصميم والهوية البصرية'),
    ('التصميم', 'تصميم واجهات المستخدم UI'),
    ('التصميم', 'النموذج التفاعلي Prototype'),
    ('التصميم', 'اعتماد التصميم النهائي'),
    ('التطوير', 'قاعدة البيانات والخلفية وواجهات API'),
    ('التطوير', 'تطبيق الأندرويد'),
    ('التطوير', 'تطبيق iOS / نسخة الويب'),
    ('التطوير', 'لوحة تحكم الإدارة'),
    ('التطوير', 'ربط الدفع الإلكتروني'),
    ('التطوير', 'الإشعارات والرسائل'),
    ('الاختبار والجودة', 'الاختبار الوظيفي'),
    ('الاختبار والجودة', 'اختبار الأداء والأمان'),
    ('الاختبار والجودة', 'اختبار قبول المستخدم UAT'),
    ('الاختبار والجودة', 'الفترة التجريبية Beta'),
    ('الإطلاق والتشغيل', 'سياسة الخصوصية والشروط'),
    ('الإطلاق والتشغيل', 'النشر على Google Play / App Store'),
    ('الإطلاق والتشغيل', 'الإطلاق التسويقي'),
    ('الإطلاق والتشغيل', 'خطة الدعم بعد الإطلاق')
  ) AS v(s, i)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.deliverables d WHERE d.app_id = a.id AND d.item = v.i
  );

  -- Mark completed Planning/Design stages for 4B & Captain only when still untouched ('لم يبدأ')
  UPDATE public.deliverables
  SET status = 'تم الاستلام', acceptance = 'اجتاز', owner = COALESCE(owner, 'المهندس سامح يس')
  WHERE app_id IN (v_app_4b, v_app_cap)
    AND stage IN ('التخطيط والمتطلبات', 'التصميم')
    AND status = 'لم يبدأ';

  -- 10) Team (NOUB CRM table)
  INSERT INTO public.team (app_id, level, title, person, party, job_status, reports_to, duties)
  SELECT v.app_id, v.level, v.title, v.person, v.party, v.job_status, v.reports_to, v.duties
  FROM (VALUES
    (v_app_4b, 'الإدارة العليا', 'المستشار التقني الأول ومدير فرع المعادي', 'المهندس عماد الشرقاوي', 'استشاري', 'معيّن', 'أ/ أبو خالد', 'إدارة مقر المعادي، TP-Link ER8411، السنترال 604A، WE، والربط الحكومي'),
    (v_app_4b, 'الإدارة العليا', 'مدير قطاع التكنولوجيا وإدارة المشروعات الرقمية', 'المهندس سامح يس', 'شركتنا', 'معيّن', 'أ/ أبو خالد', 'الاعتماد الفني وإدارة المشروعات الرقمية والأمان والأصول التقنية (مفصول عن الاعتماد المالي)'),
    (v_app_4b, 'الإدارة العليا', 'المالك والمستثمر الرئيسي', 'أ/ أبو خالد', 'شركتنا', 'معيّن', NULL, 'الاعتماد الاستثماري والتعاقدي والاستراتيجي العام'),
    (v_app_4b, 'الإدارة العليا', 'المدير المالي (CFO)', 'أ/ هاني', 'شركتنا', 'معيّن', 'أ/ أبو خالد', 'الإدارة المالية، فوري، الفواتير الضريبية ETA، ومطعم العجوزة'),
    (v_app_4b, 'إدارة المنتج والمشروع', 'قيادة غرفة عمليات النقل الذكي', 'م/ موفق و م/ عمرو', 'شركتنا', 'معيّن', 'المهندس عماد الشرقاوي', 'تشغيل الأسطول، الكباتن، الكول سنتر، والتسعير'),
    (v_app_4b, 'الهندسة والتطوير', 'شركة التطوير البرمجي', 'قيمة تك (ValueTech)', 'مقاول خارجي', 'معيّن', 'المهندس سامح يس', 'تطوير تطبيقات 4B وكابتن مشاوير ووكالة ودارو ولوحات الإدارة'),
    (v_app_4b, 'الهندسة والتطوير', 'مهندس برمجيات ومساعد تقني', 'م/ أحمد عبيد', 'شركتنا', 'معيّن', 'المهندس عماد الشرقاوي', 'الدعم الهندسي المباشر وصيانة الأنظمة بالمقر'),
    (v_app_4b, 'الجودة', 'مسؤول ضمان الجودة (QA)', 'م/ علي (QA مكتب 7)', 'شركتنا', 'معيّن', 'المهندس سامح يس', 'اختبار التطبيقات ومطابقة فيجما وتقارير الباجز على هواتف حقيقية'),
    (v_app_4b, 'الأعمال والدعم', 'المستشار القانوني والمحامي', 'أ/ محمد مصطفى', 'استشاري', 'معيّن', 'أ/ أبو خالد', 'تراخيص LTRA، حماية الملكية الفكرية، ومراجعة العقود الرسمية'),
    (v_app_4b, 'الأعمال والدعم', 'مسؤولة الموارد البشرية (HR)', 'أ/ سارة حسن', 'شركتنا', 'معيّن', 'المهندس عماد الشرقاوي', 'شؤون الموظفين، جهاز البصمة، وعهدة الأجهزة'),
    (v_app_cap, 'الإدارة العليا', 'مدير قطاع التكنولوجيا وإدارة المشروعات الرقمية', 'المهندس سامح يس', 'شركتنا', 'معيّن', 'أ/ أبو خالد', 'مراجعة CompreFace وGPS Integrity Test 01 وربط LTRA'),
    (v_app_wikala, 'الإدارة العليا', 'مدير قطاع التكنولوجيا وإدارة المشروعات الرقمية', 'المهندس سامح يس', 'شركتنا', 'معيّن', 'أ/ أبو خالد', 'استلام الكود والـ Keystore (التشغيل مؤجل لما بعد 4B)'),
    (v_app_daro, 'الإدارة العليا', 'مدير قطاع التكنولوجيا وإدارة المشروعات الرقمية', 'المهندس سامح يس', 'شركتنا', 'معيّن', 'أ/ أبو خالد', 'إدارة حصر عيوب Figma الـ 8 (التنفيذ مؤجل لما بعد 4B)')
  ) AS v(app_id, level, title, person, party, job_status, reports_to, duties)
  WHERE v.app_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.team t
      WHERE t.app_id = v.app_id AND t.title = v.title AND COALESCE(t.person, '') = COALESCE(v.person, '')
    );
END $$;

-- ==============================================================================
-- PART 2: MESHAWIR FULL SCHEMA (IF NOT EXISTS + SAFE COLUMN MIGRATIONS)
-- ==============================================================================

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
ALTER TABLE public.meshawir_enterprises ADD COLUMN IF NOT EXISTS duns_number_status TEXT;

CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  enterprise_id TEXT REFERENCES public.meshawir_enterprises(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT 'مشاوير',
  status TEXT NOT NULL DEFAULT 'نشط',
  knowledge_status TEXT DEFAULT 'قيد التنفيذ',
  priority_tier TEXT DEFAULT 'عام',
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
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS knowledge_status TEXT DEFAULT 'قيد التنفيذ';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS priority_tier TEXT DEFAULT 'عام';

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
ALTER TABLE public.project_tasks ADD COLUMN IF NOT EXISTS due_date TEXT;
ALTER TABLE public.project_tasks ADD COLUMN IF NOT EXISTS risk_level TEXT DEFAULT 'safe';

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

CREATE TABLE IF NOT EXISTS public.meshawir_joint_tasks (
  id INT PRIMARY KEY,
  section TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'لم يتم',
  owner TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- PART 3: LATEST DATA UPSERTS (IDEMPOTENT ON CONFLICT DO UPDATE)
-- ==============================================================================

-- 1. Enterprise
INSERT INTO public.meshawir_enterprises (id, name, legal_name, commercial_register, tax_number, duns_number_status, headquarters_address, ceo_name, branch_manager_name, cto_name)
VALUES (
  'ent-mashawer',
  'مشاوير للمنصات الرقمية',
  'شركة مشاوير للمنصات الرقمية وخدمات النقل الذكي ذ.م.م',
  '757315518',
  '662709268',
  'قيد الاستخراج والتحديث (يحتاج تحققاً من الإتمام الفعلي)',
  'مدينة المعراج بجوار كارفور المعادي، قسم المعادي، القاهرة (25.91م × 20.94م)',
  'أبو خالد',
  'المهندس عماد الشرقاوي',
  'المهندس سامح يس'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  legal_name = EXCLUDED.legal_name,
  duns_number_status = EXCLUDED.duns_number_status,
  headquarters_address = EXCLUDED.headquarters_address,
  branch_manager_name = EXCLUDED.branch_manager_name,
  cto_name = EXCLUDED.cto_name,
  updated_at = NOW();

-- 2. All 9 Projects (Including 4B, Captain Mashawir, Deferred Daro & WeKaLa, Maadi HQ, NOC, Kaggle, Agouza, Subsidiary)
INSERT INTO public.projects (id, enterprise_id, name, code, category, status, knowledge_status, priority_tier, figma_completion_pct, description, repo_url, figma_url, live_url, apk_files, context_hints, db_info)
VALUES
('proj-4b', 'ent-mashawer', 'تطبيق 4B — منصة النقل الذكي واللوجستيات للعملاء (الاسم التاريخي: مشاوير / Veri / GA Ride / GoPlex)', '4B', 'الأولوية الأولى — نشط', 'نشط — الأولوية الأولى (قيد المراجعة والاختبار قبل الإطلاق)', 'قيد التنفيذ', 'الأولوية #1 (نشط)', 95, 'التطبيق التجاري المعتمد (4B / Four Brothers سابقاً GoPlex وGA Ride وVeri). يشمل 4 فئات مركبات بحدود تشغيل صارمة (نصف النقل Pickup للطرود والبضائع فقط لا للركاب)، ميزة Add Stop متعددة المحطات (تغني عن Shared Load)، منظومة 4B Prepaid Trips للشركات (قيد التطوير)، وبنية Node.js/NestJS + Flutter + MongoDB/Prisma + PostgreSQL 16/PostGIS على خوادم WE.', 'https://github.com/mashweer/4b-passenger-app', 'https://www.figma.com/design/ulWwUzLnKThS2cfJWDetX6/%D9%85%D8%B4%D8%A7%D9%88%D9%8A%D8%B1---backlog?node-id=221-63531', 'https://admin.4b.com.eg', '[{"id":"apk-4b-1","version":"v1.4.2-beta","buildNumber":142,"fileName":"4B_Passenger_v1.4.2_release.apk","fileSize":"34.8 MB","status":"جاهز للاختبار — لا يثبت وحده جاهزية الإنتاج"},{"id":"apk-4b-drv","version":"v2.4.1-rc","buildNumber":241,"fileName":"Mashweer_Driver_4B.apk","fileSize":"42.5 MB","status":"تطبيق كابتن مشاوير المستقل"}]'::jsonb, '["التمييز الحاسم: تطبيق 4B للعملاء منفصل تماماً عن تطبيق كابتن مشاوير (Captain Mashawir)","حوكمة التحقق: وجود ميزة في Figma أو المحاكي Android Emulator API 37 لا يثبت تشغيلها الفعلي أو أمان الـ GPS — مطلوب GPS Integrity Test 01 على هاتف حقيقي","التوصيل متعدد المحطات موجود فعلياً باسم Add Stop داخل المنظومة؛ لا يُعامل Daro أو Shared Load كأفكار بديلة عنه","4B Prepaid Trips (المسودة السابقة: 4B Digital Trips) مسار كوبونات شركات B2B وليس وكالة تسويق وإعلانات","فجوات ما قبل الإطلاق: (1) FCM OAuth2، (2) خريطة الأدمن من Leaflet لـ Google Maps، (3) طوابير BullMQ، (4) NestJS 11، (5) CompreFace داخل مصر وربط LTRA وفصل فوري/الدفع الفعلي"]'::jsonb, '{"engine":"PostgreSQL 16 + PostGIS 3.4 + Redis 7 (WE Cloud) + Flutter/Node.js/Prisma/MongoDB (كود التطبيق)","tables":["trips","passengers","captains","saved_addresses","ride_ratings","bidding_offers","wallets","fawry_transactions","coupons"]}'::jsonb),
('proj-captain-mashawir', 'ent-mashawer', 'تطبيق كابتن مشاوير (Captain Mashawir — واجهة مستقلة مرتبطة بـ 4B)', 'CAPTAIN-4B', 'الأولوية الأولى (ب) — نشط', 'نشط ومرتبط بـ 4B — مطلوب اختبار رحلة End-to-End على هاتف حقيقي', 'قيد التنفيذ', 'الأولوية #1B (نشط)', 95, 'تطبيق السائق/الكابتن المستقل المربوط بمنظومة 4B؛ يدعم تسجيل الكابتن والمركبة والمستندات، التحقق من الوجه/الشخصية (CompreFace Liveness داخل مصر)، Online/Offline، استقبال وقبول الطلبات عبر 4 فئات مركبات، التتبع اللحظي، المحفظة والتسويات، وتأكيد التسليم/SOS.', 'https://github.com/mashweer/4b-captain-app', 'https://www.figma.com/design/ulWwUzLnKThS2cfJWDetX6/%D9%85%D8%B4%D8%A7%D9%88%D9%8A%D8%B1---backlog', '', '[{"id":"apk-cap-1","version":"v2.4.1-rc","buildNumber":241,"fileName":"Mashweer_Driver_4B.apk","fileSize":"42.5 MB","status":"يحتاج اختبار حقيقي بعيداً عن المحاكي"}]'::jsonb, '["تجربة 23 نوفمبر 2026 تمت على محاكي Android API 37 ولا تصلح كدليل أمان GPS أو جاهزية إطلاق","متطلبات اختبار End-to-End الـ 5: حساب كابتن تجريبي + حساب عميل تجريبي + لوحة إدارة + هاتف أندرويد حقيقي + تجربة دورة كاملة من الإنشاء حتى الإغلاق","احتفاظ صور التحقق من الوجه 1–3 أسابيع على خوادم داخل مصر (WE / MIST) بدون Backup طويل الأمد ينتظر الاعتماد القانوني والأمني النهائي"]'::jsonb, '{"engine":"WE Cloud Isolated VM + Docker + Ubuntu + CompreFace + PostGIS","tables":["captains","captain_documents","vehicle_categories","trip_offers","captain_wallets","liveness_checks"]}'::jsonb),
('proj-daro', 'ent-mashawer', 'منصة دارو (Daro Super App — منصة خدمات متكاملة للزوار العرب والسياح ورجال الأعمال والطلاب في مصر)', 'DARO', 'مؤجل مؤقتاً حتى استلام 4B', 'مؤجل مؤقتاً — ملف فيجما يضم 9 صفحات وبها 8 ملاحظات ومشكلات مراجعة (24 نوفمبر 2026)', 'مؤجل', 'مؤجل #3 (بعد تشغيل 4B)', 70, 'سوبر آب مخصص للزوار العرب والسياح ورجال الأعمال والطلاب القادمين إلى مصر (لا يستهدف المصريين كشريحة تسويقية رئيسية) عبر حساب موحد يضم 5 أدوار منطقية. يشمل 6 قطاعات: (1) الإقامة والعقارات، (2) السيارات والنقل + 4B، (3) الطيران والفنادق (طيران داخلي داخل مصر فقط عبر Amadeus / EgyptAir NDC)، (4) المطاعم والأكل المنزلي، (5) الخدمات الطبية، (6) خدمات الترجمة والإرشاد والطلاب والتنظيف والصيانة.', 'https://github.com/mashweer/daro-cargo-system', 'https://www.figma.com/design/aR1aanpRzGL7aMoxROGgt5/Daro?node-id=3214-2', 'https://daro.eg', '[]'::jsonb, '["قيد جغرافي صارم: حجز الطيران في دارو يقتصر على الطيران الداخلي داخل مصر فقط (Amadeus / EgyptAir NDC)","توقف التحليل الآلي في قيمة تك بعد ~44 دقيقة بسبب حد الـ Credit/Quota (إعادة الضبط 30 نوفمبر 2026)","8 عيوب موثقة في Figma بتاريخ 24 نوفمبر: تناقض الأرقام (25,000 / 3,200 / 1,000 / 40,000 / 15% / 10%)، تواريخ 2024–2028، 13 شيك، عدم وضوح حجز vs حجز مبدئي، وانقطاع مسار الدفع والتأكيد","لا يوجد فريق تشغيل مستقل لـ Daro بالمعادي حالياً؛ الأولوية التنفيذية الكاملة لـ 4B"]'::jsonb, '{"engine":"قيد التأجيل حتى استلام وتشغيل 4B","tables":["users","property_owners","service_providers","medical_roles","domestic_flights","stays_bookings","restaurants_homefood"]}'::jsonb),
('proj-wekala', 'ent-mashawer', 'منصة وكالة (WeKaLa — سوق النخبة الذكي: بيع، مزاد، ومقايضة Marketplace)', 'WEKALA', 'مؤجل مؤقتاً حتى استلام 4B', 'مؤجل مؤقتاً لحين استلام وتشغيل 4B (نموذج العمولات والرسوم غير محسوم نهائياً)', 'مؤجل', 'مؤجل #3 (بعد تشغيل 4B)', 80, 'منصة Marketplace إلكترونية ("وكالة – سوق النخبة الذكي: بيع، مزاد، ومقايضة") تستهدف الأفراد والتجار والمتاجر وأصحاب المنتجات. تتكون من 5 وحدات أساسية: الإعلانات المبوبة والبيع المباشر، Buy Now، المزادات (Auctions)، المقايضة (Barter)، وصفحات التجار الموثقين — دون ربطها حالياً بهيكل عمولات أو تشغيل نهائي معتمد.', 'https://github.com/mashweer/wekala-fleet-management', 'https://www.figma.com/design/oYxkmwZcGae674BRA5ZOen/Wikala', 'https://wekala.mashawer.com.eg', '[{"id":"apk-w-1","version":"v1.2.0","buildNumber":12,"fileName":"Wekala_v1.2.apk","fileSize":"28.7 MB","status":"يحتاج تحققاً ومطابقة مع السورس الفعلي"}]'::jsonb, '["يُكتب بالإنجليزية WeKaLa ويعمل بنموذج Marketplace (بيع، مزاد، مقاىضة) وليس تطبيق إدارة مناديب أو رحلات","نسب العمولات، رسوم الإعلانات، سياسات الدفع والضمان، وهيكلة فريق التشغيل غير محسومة نهائياً وتحتاج تحققاً بعد إطلاق 4B","ضرورة استلام السورس كود الكامل ومفاتيح Keystore رسمياً ضمن تسوية قيمة تك"]'::jsonb, '{"engine":"غير معتمد نهائياً لحين تسليم 4B (متوقع Node.js/MongoDB أو PostgreSQL)","tables":["listings","buy_now_orders","auctions","barter_offers","verified_merchants","escrow_ledger"]}'::jsonb),
('proj-maadi-hq', 'ent-mashawer', 'البنية التحتية وغرفة سيرفرات مقر المعادي (Maadi HQ IT)', 'MAADI-HQ-IT', 'بنية تحتية', 'في الإنتاج والتشغيل الفعلي', 'مؤكد', 'بنية مقر المعادي (مُفعّل)', 100, 'المقر الرئيسي بالمعراج المعادي بقيادة المهندس عماد الشرقاوي كمدير للفرع: راك Perla 27U، جدار الحماية والراوتر TP-Link ER8411 (شغال فعلياً يدمج خط أرضي WE ADSL + خط Vodafone 5G + تخطيط WireGuard VPN لـ 25–30 موظفاً عن بُعد)، سنترال Grandstream 604A (شغال فعلياً بالخط الأرضي الثاني)، قرار شراء Static Public IP من مزود الخدمة، سويتش سيسكو 3850 48P، سيرفر Dell R640، محطتي HP Z440، 16 كاميرا 5MP + NVR 4K، و3 أجهزة ديل مكتبية.', 'https://github.com/mashweer/maadi-infrastructure', '', 'https://mashawer.com.eg', '[]'::jsonb, '["القرار الأحدث (مؤكد): شراء Static Public IP من مزود الخدمة (يتجاوز الاعتماد على DDNS القديم)","حالة العمل عن بُعد (قيد التنفيذ/يحتاج تحققاً): دراسة WireGuard VPN على ER8411 لـ 25–30 موظفاً باستخدام Grandstream Wave مع عزل الوصول للسنترال فقط","أصل تاريخي موثق (يحتاج تحققاً من وضعه الحالي): ذكر خادم Dell PowerEdge R730 + Windows Server Standard + 20 CALs في مرحلة سابقة — لا يُخلط مع R640 الجديد"]'::jsonb, '{"engine":"Proxmox VE 8.x + TP-Link ER8411 (Static IP + WireGuard) + Cisco IOS-XE","tables":["vlans","firewall_rules","pbx_extensions","nvr_streams","dhcp_leases","rack_ports"]}'::jsonb),
('proj-4b-operations-noc', 'ent-mashawer', 'غرفة عمليات ومراقبة 4B (4B Operations NOC)', '4B-OPS-NOC', 'عمليات وتشغيل', 'في الإنتاج والتجهيز', 'قيد التنفيذ', 'تشغيل 4B بالمعادي', 100, 'غرفة العمليات المركزية بالمعادي بقيادة م/ موفق وم/ عمرو وفريق الكول سنتر ومحلل البيانات: تتابع لحظياً خوادم WE السحابية الثلاثة (4B-App, 4B-DB, 4B-Cache)، جدار F5 WAF، دوائر الفايبر وLTRA، والرد على مكالمات العملاء والكباتن عبر سنترال Grandstream 604A وWave.', 'https://github.com/mashweer/4b-operations-noc', '', 'https://ops.mashawer.com.eg', '[]'::jsonb, '["نشأت من إعادة توجيه وتطوير فكرة غرفة مراقبة التداول السابقة لخدمة أسطول 4B","مراقبة زمن التأخير < 5ms وتجربة محاكاة الفشل DR"]'::jsonb, '{"engine":"PostgreSQL / PostGIS","tables":["trips_stream","active_drivers","sos_alerts","latency_metrics","audit_logs"]}'::jsonb),
('proj-kaggle-ucp', 'ent-mashawer', 'مسابقة كاجل العالمية ($100k) وبروتوكول الأسد الأبيض UCP-LLM', 'KAGGLE-UCP', 'أبحاث وذكاء', 'جاري التنفيذ (موعد 17 أكتوبر)', 'قيد التنفيذ', 'مسار بحثي مستقل', 90, 'مشروع بحثي يقوده المهندس سامح يس في مسار Paper Track ($100,000) على Kaggle بالتنسيق مع معايير Ryan Holbrook، قبل 17 أكتوبر. يقوم على فلسفة الأسد الأبيض وبروتوكول UCP-LLM من 25 قسماً وتدريب Gemma 4 بـ LoRA/Unsloth وأداة Eve v1.1.0.', 'https://github.com/mashweer/kaggle-gemma-ucp', '', 'https://kaggle.com', '[]'::jsonb, '["الحالة الدراسية الأولى: توفير 80–120 ألف جنيه سنوياً بتطبيق القيود الهندسية","خطة 17 يوماً من 1 إلى 17 أكتوبر"]'::jsonb, '{"engine":"Python / Unsloth / LoRA","tables":["benchmarks","eval_runs","ucp_sections","token_logs"]}'::jsonb),
('proj-agouza-restaurant', 'ent-mashawer', 'مشروع مطعم المشويات بالعجوزة (توريدات POS وCCTV — مفصول مالياً)', 'AGOUZA-REST', 'مشروعات جانبية', 'في التأسيس والتوريد (حسابات مفصولة تماماً عن مشاوير)', 'قيد التنفيذ', 'مفصول مالياً عن مشاوير', 100, 'مشروع تجاري مملوك لأبو خالد تحت الإدارة التنفيذية الحصرية للأستاذ هاني (CFO)، مع توحيد المشتريات التقنية مع المهندس علي (شركة الأصدقاء): نظام كاشير POS، درج نقدية، طابعات مطبخ وفواتير، و14 كاميرا مراقبة بالمشاهدة عن بعد، مع فصل حساباته تماماً عن مشاوير.', '', '', '', '[]'::jsonb, '["فصل مالي وقانوني وتشغيلي كامل عن شركة مشاوير و4B","إمكانية ربط توصيل طلبات المطعم لاحقاً بأسطول 4B"]'::jsonb, '{}'::jsonb),
('proj-app4-future', 'ent-mashawer', 'التطبيق الرابع الاحتمالي + الشركة التابعة / المصرية الكويتية (مقترحات غير معتمدة)', 'APP4-SUBSIDIARY', 'مقترحات مستقبلية', 'مقترح قيد الدراسة — لم يُعتمد كقرار رسمي بعد', 'مقترح', 'مقترح غير معتمد', 0, 'يضم الأفكار التوسعية غير المعتمدة نهائياً: مقترح الشركة التابعة خارج القاهرة، مقترح الشركة المصرية الكويتية لتوطين التكنولوجيا، وفكرة التطبيق الرابع. جميعها مصنفة «مقترح» ولا تُدرج كأصول قائمة.', '', '', '', '[]'::jsonb, '["التصنيف الملزم: مقترح / قيد الدراسة — لا يُعامل كأمر واقع"]'::jsonb, '{}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  code = EXCLUDED.code,
  category = EXCLUDED.category,
  status = EXCLUDED.status,
  knowledge_status = EXCLUDED.knowledge_status,
  priority_tier = EXCLUDED.priority_tier,
  figma_completion_pct = EXCLUDED.figma_completion_pct,
  description = EXCLUDED.description,
  repo_url = EXCLUDED.repo_url,
  figma_url = EXCLUDED.figma_url,
  live_url = EXCLUDED.live_url,
  apk_files = EXCLUDED.apk_files,
  context_hints = EXCLUDED.context_hints,
  db_info = EXCLUDED.db_info,
  updated_at = NOW();

-- 3. Project Milestones (4B M1-M5)
INSERT INTO public.meshawir_project_milestones (id, project_id, phase_code, title, target_date, completion_percentage, status, deliverables_summary, sign_off_by)
VALUES
('ms-4b-m1', 'proj-4b', 'M1 (W1-W2)', 'المرحلة 1: التشغيل الأساسي وإدارة الكباتن والركاب وفحص الكود وقاعدة البيانات', '2026-09-25', 90, 'قيد الإغلاق', 'استلام المستودع، قاعدة PostGIS، تدفق الرحلة الكامل من السيرفر، ومطابقة فيجما', 'المهندس سامح يس'),
('ms-4b-m2', 'proj-4b', 'M2 (W3)', 'المرحلة 2: التسعير الديناميكي والمزايدة 15ث وإغلاق الثغرات وBroadNet + Maps', '2026-10-02', 45, 'جاري التنفيذ', 'مؤقت 60ث للـ OTP، حماية الأسعار من السيرفر، روابط Cloudinary الموقعة، وتكامل برودنت', 'المهندس سامح يس وعمرو وموفق'),
('ms-4b-m3', 'proj-4b', 'M3 (W4-W5)', 'المرحلة 3: النواة المالية وفوري وكشف حساب المحفظة والاختبارات الميدانية', '2026-10-09', 20, 'قيد الإعداد', 'بوابة فوري وWebhook موثق، تسويات الكباتن والضرائب، والاختبار الميداني بـ 4B', 'الأستاذ هاني والمطور'),
('ms-4b-m4', 'proj-4b', 'M4 (W6)', 'المرحلة 4: الحوكمة وفصل الصلاحيات وتسليم وكالة (WeKaLa) ولوحات المكاتب', '2026-10-16', 15, 'مخطط', 'صلاحيات RBAC، لوحات الوكلاء، وإصلاح ملاحظات الاختبار', 'المهندس عماد الشرقاوي والمهندس سامح يس'),
('ms-4b-m5', 'proj-4b', 'M5 (W7)', 'المرحلة 5: اختبارات القبول النهائية UAT وتطبيق دارو وشهادات المنشأ والإطلاق', '2026-10-23', 10, 'مخطط', 'إطلاق تجاري لـ 4B، استكمال شاشات دارو وماسح الباركود، Keystore، وتسوية قيمة تك', 'أبو خالد والمحامي والمهندس سامح يس')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  target_date = EXCLUDED.target_date,
  completion_percentage = EXCLUDED.completion_percentage,
  status = EXCLUDED.status,
  deliverables_summary = EXCLUDED.deliverables_summary,
  sign_off_by = EXCLUDED.sign_off_by;

-- 4. Team Profiles (13 Members — Eng. Emad always listed first)
INSERT INTO public.meshawir_team_profiles (id, full_name, short_name, title, category, efficiency_rate, email, phone, role_description, readiness_status, priority_order)
VALUES
('eng-emad', 'المهندس عماد الشرقاوي', 'المهندس عماد الشرقاوي', 'المستشار التقني الأول ومدير فرع المعادي (استلام كامل الإدارة)', 'leadership', 98, 'admin@mashweer.com.eg', '01000000003', 'مدير فرع المعادي والمستشار التقني الأول؛ يتسلم إدارة المقر، الاتصالات، السنترال Grandstream 604A، راوتر/فايروول TP-Link ER8411، سيرفرات WE والـ SSL VPN، والتنسيق مع LTRA. يُذكر اسمه دائماً قبل المهندس سامح يس.', 'جاهز وحاضر', 1),
('eng-sameh', 'المهندس سامح يس', 'المهندس سامح يس', 'رئيس قطاع التكنولوجيا (CTO) وقائد المنظومة البرمجية والذكاء الاصطناعي', 'leadership', 99, 'admin@mashweer.com.eg', '01000000002', 'رئيس قطاع التكنولوجيا ومسؤول المنظومة البرمجية للتطبيقات الثلاثة (4B، وكالة، دارو)، خطة قيمة تك، سوبابيز، وبحث كاجل والأسد الأبيض.', 'جاهز وحاضر', 2),
('investor-abu-khaled', 'أبو خالد', 'أبو خالد', 'المالك والمستثمر الرئيسي للشركة كلها', 'leadership', 95, 'ceo@mashawer.com.eg', '01000000001', 'المالك الاستراتيجي للمجموعة؛ يعتمد الميزانيات الكبرى، الشركة التابعة، التسويق، ومطعم العجوزة.', 'متابعة استراتيجية', 3),
('admin-hany', 'الأستاذ هاني', 'أ/ هاني', 'المدير المالي (CFO) وقائد مشروع مطعم العجوزة', 'finance', 90, 'finance@mashweer.com.eg', '01000000005', 'يدير الحسابات والفواتير الضريبية ETA وفيزا الشركة وبوابة فوري وتسويات الكباتن والمتابعة الحصرية لمطعم المشويات بالعجوزة.', 'جاهز وحاضر', 4),
('lawyer-mostafa', 'الأستاذ محمد مصطفى', 'أ/ محمد مصطفى (المحامي)', 'المستشار القانوني العام للشركة', 'legal', 95, 'legal@mashawer.com.eg', '01000000004', 'مسؤول الملفات القانونية الأربعة: قيمة تك، تراخيص LTRA، إيداعات ITIDA والشهر العقاري، وعقود الموظفين والخطوط الرسمية.', 'جاهز وحاضر', 5),
('ops-mowaffaq', 'الأستاذ موفق', 'م/ موفق', 'مدير عمليات المنظومة والجودة والطوارئ (4B)', 'operations', 99, 'operation@mashweer.com.eg', '01000000007', 'خبرة +10 سنوات أوبر/كريم؛ مسؤول ضبط الجودة والنزاعات وSOS وتدريب الكول سنتر على السنترال.', 'جاهز وحاضر', 6),
('ops-amr', 'المهندس عمرو', 'م/ عمرو', 'قائد العمليات الميدانية للأسطول والتسويق الفني (4B)', 'operations', 99, 'operation@mashweer.com.eg', '01000000012', 'خبرة +10 سنوات أوبر/كريم؛ يدير أسطول الكباتن والحوافز والتسعير ومتابعة وكالات الدعاية.', 'جاهز وحاضر', 7),
('eng-obeid', 'المهندس أحمد عبيد', 'م/ أحمد عبيد', 'مهندس IT ومساعد تقني معتمد (The Assist - خبرة +5 سنوات)', 'technical', 68, 'support@mashweer.com.eg', '01000000013', 'المساعد التقني المعتمد بالمقر لصيانة الأجهزة والشبكة ودعم الموظفين يومياً.', 'جاهز وحاضر', 8),
('tech-hatem', 'حاتم الفني', 'حاتم', 'فني تمديدات شبكات وبنية سلكية (بالأجرة)', 'technical', 85, 'hatem@mashweer.com.eg', '01000000014', 'مسؤول سحب كابلات Cat6 بالسقف المعلق، تأريج الباتش بانل الـ 48 منفذاً، واختبارها بجهاز I-Pook.', 'ميداني بالاستدعاء', 9),
('hr-sara', 'الأستاذة سارة حسن', 'أ/ سارة حسن', 'مسؤولة الموارد البشرية والشؤون الإدارية', 'operations', 90, 'info@mashweer.com.eg', '01000000016', 'متابعة جهاز البصمة ZKTeco، عقود الموظفين، وعهدة أجهزة المقر (بعد إلغاء إيميل hr@ لتوفير التكلفة).', 'جاهز وحاضر', 10),
('eng-enad', 'المهندس عناد', 'م/ عناد', 'استشاري جدوى وتكامل تقني خارجي', 'technical', 90, '', '', 'استشاري دراسات الجدوى الفنية والتوسعية.', 'استشاري', 11),
('qa-ali-office7', 'المهندس علي (مكتب 7)', 'م/ علي QA', 'مسؤول ضمان جودة تطبيقات الموبايل', 'technical', 88, '', '', 'اختبار تطبيقات 4B ووكالة ودارو ومطابقتها لتصاميم فيجما (مكتب 7).', 'نشط', 12),
('support-team-5', 'فريق خدمة العملاء والكول سنتر (5 موظفين) + محلل بيانات', 'الكول سنتر والتحليل', 'طاقم تشغيل صالة العمليات الكبرى بالمعادي', 'operations', 92, 'support@mashweer.com.eg', '', 'الرد على الركاب والكباتن عبر تحويلات السنترال 107-111 ومتابعة الخرائط الحرارية.', 'جاري التسكين', 13)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  short_name = EXCLUDED.short_name,
  title = EXCLUDED.title,
  efficiency_rate = EXCLUDED.efficiency_rate,
  role_description = EXCLUDED.role_description,
  readiness_status = EXCLUDED.readiness_status,
  priority_order = EXCLUDED.priority_order;

-- 5. Service Providers (12 Official Partners)
INSERT INTO public.service_providers (id, name, category, portal_url, username, account_manager, contact_phone, contact_email, status, cost_or_plan, official_badge, active_services)
VALUES
('prov-we-telecom', 'المصرية للاتصالات (WE Telecom Egypt)', 'سيرفرات سحابية وفايبر وADSL وخطوط أرضية', 'https://cloud.te.eg/portal', 'mashweer_telecom_admin', 'م/ أحمد محرم وم/ أحمد غريب', '01000000009', 'cloud-sales@te.eg', 'معتمد وموقع (6078927 و 6078933)', '1,167,496 ج.م/سنوياً + WE ADSL + خط أرضي 2', 'المشغل الوطني المعتمد', '["3 خوادم سحابية 4B","F5 WAF + 7 SSL VPN","فايبر 24Mbps + 6 فروع 4Mbps","خط أرضي 1 WE ADSL على ER8411","خط أرضي 2 على سنترال Grandstream 604A"]'::jsonb),
('prov-vodafone-5g', 'فودافون مصر (صقر قريش - Vodafone 5G/4G)', 'إنترنت 5G وخطوط شرائح OTP', 'http://192.168.8.1', 'vodafone_maadi_hq', 'فرع صقر قريش', '', '', 'نشط وشغال فعلياً بالمقر', 'فاتورة #748994 (3,326.46 ج.م) + باقة 5G', 'شغال على ER8411 WAN2', '["خدمة Vodafone 5G متصلة بـ TP-Link ER8411 WAN2","راوتر H153-381 وشريحة AT Home","خطوط OTP لبرودنت"]'::jsonb),
('prov-ec-egypt', 'المصرية لتكنولوجيا المعلومات (EC / eyg.com.eg)', 'نطاقات واستضافة وإيميلات Zoho', 'https://clients.ec.com.eg/clientarea.php', 'mashawer_admin', 'م/ محمد الحلو', '01551553434', 'info@ec.com.eg', 'نشط ومجدد حتى أغسطس 2027', '3,762 ج.م/سنة + 5 إيميلات Zoho مجانية', 'مزود النطاقات الرسمي', '["mashawer.com.eg","استضافة Host1 cPanel 2083","5 إيميلات Zoho Lite"]'::jsonb),
('prov-broadnet', 'برودنت (BroadNet A2P SMS)', 'رسائل OTP المحلية لتطبيق 4B', 'https://broadnetme.com/portal/login', 'mashawer', 'مهندسة الدعم الفني', '', '', 'نشط (25 رصيد اختبار)', 'Sender ID: GoRide / Mashawer', 'بوابة OTP مصر', '["Sender ID معتمد على شبكات مصر","API للـ Backend"]'::jsonb),
('prov-twilio', 'تويليو (Twilio SMS)', 'رسائل OTP لوكالة ودارو + احتياطي', 'https://console.twilio.com', 'twilio_mashweer_sim', 'م/ عماد الشرقاوي وم/ سامح يس', '', '', 'تم شراء الشريحة وجاري التفعيل', 'دفع حسب الاستخدام', 'بوابة دولية واحتياطية', '["Twilio OTP لتطبيقات WeKaLa و Daro"]'::jsonb),
('prov-fawry', 'شركة فوري (Fawry Enterprise)', 'بوابة الدفع الإلكتروني وصرف الكباتن', 'https://fawry.com', 'FAWRY_MERCHANT_CODE_MASHWEER', 'الأستاذ هاني + مدير حساب فوري', '', '', 'جاري استكمال التعاقد وSandbox', 'عقد تاجر تحصيل وصرف', 'بوابة الدفع الرسمية لـ 4B', '["تحصيل بطاقات وأكواد فوري","صرف محافظ الكباتن","Webhook الدفع المؤمن"]'::jsonb),
('prov-cloudinary', 'كلاوديناري (Cloudinary)', 'تخزين الوثائق ورخص الكباتن المشفر', 'https://cloudinary.com', 'mashweer-cloud', 'admin@mashweer.com.eg', '', '', 'نشط ومطلوب تفعيل الروابط الموقعة', 'خطة مدفوعة + SHA-256 HMAC', 'خزنة الوثائق السحابية', '["تخزين رخص القيادة والبطاقات بروابط مؤقتة"]'::jsonb),
('prov-google-maps', 'خرائط جوجل (Google Maps Platform)', 'الخرائط والتوجيه وحساب المسافات', 'https://console.cloud.google.com', 'admin@mashweer.com.eg', 'القيادة التقنية والمالية', '', '', 'نشط ومطلوب وضع حدود الميزانية', 'فوترة GCP الشهرية', 'محرك الخرائط', '["Server Key مقيد بـ IP","Web Key مقيد بالدومين"]'::jsonb),
('prov-friends-cctv', 'شركة الأصدقاء للأنظمة الأمنية (بشمهندس علي)', 'كاميرات المراقبة (المعادي + العجوزة) وPOS المطعم', '', 'eng_ali_friends', 'بشمهندس علي', '01000000015', '', 'معتمد للمعادي ومطعم العجوزة', 'عرض المعادي 55,050 ج.م + عرض العجوزة', 'المورد الموحد للأمن وPOS', '["16 كاميرا Hikvision 5MP","NVR 16ch 4K + 4TB","POS وكاميرات مطعم العجوزة"]'::jsonb),
('prov-qeema-tech', 'شركة قيمة تك / فاليوتيك (ValueTech / Qeema Tech)', 'شريك التطوير البرمجي الخارجي', 'https://qeematech.com', 'mashweer_corp', 'م/ حازم', '01000000008', '', 'تحت خطة 7 أسابيع والإنذار القانوني', 'خطة M1-M5 + 20 مهمة مفتوحة', 'مطور خارجي خاضع للحوكمة', '["تطوير 4B ووكالة ودارو","تسليم السورس وKeystore"]'::jsonb),
('prov-qts-servers', 'شركة كيو تي إس (QTS Servers)', 'توريد الخوادم والسويتش', '', 'qts_sales_corp', 'إدارة مبيعات QTS', '0223967890', '', 'مسددة بفاتورتين ضريبيتين', '108,265.80 ج.م شاملة الضريبة', 'مورد ضريبي معتمد', '["Dell PowerEdge R640","2x HP Z440","Cisco Catalyst 3850-48P"]'::jsonb),
('prov-redline', 'شركة رد لاين البستان (RedLine)', 'كابينة الراك وأدوات الشبكة', 'https://redline-stores.com', 'sameh_yassin', 'مبيعات البستان', '0223912345', '', 'مسددة بالكامل', '18,550.00 ج.م شاملة الضريبة', 'مورد البستان', '["Perla Rack 27U 1000mm","I-Pook PK65H","RJ45 + Root Crimper"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  portal_url = EXCLUDED.portal_url,
  account_manager = EXCLUDED.account_manager,
  status = EXCLUDED.status,
  cost_or_plan = EXCLUDED.cost_or_plan,
  official_badge = EXCLUDED.official_badge,
  active_services = EXCLUDED.active_services,
  updated_at = NOW();

-- 6. Server Rack Meta + 8 Rack Devices + All 58 Rack Ports
INSERT INTO public.meshawir_server_racks (id, name, total_units, depth_mm, width_inches, location, cooling_type, power_backup, lock_status)
VALUES (
  'rack-maadi-27u',
  'PERLA 27U SERVER ENCLOSURE — غرفة السيرفرات المصفحة بالمعادي',
  27,
  1000,
  19,
  'مقر المعراج بالمعادي - غرفة IT المصفحة (5.74م × 1.96م)',
  '4x مراوح سقفية + تكييف مخصص 24/7',
  'وحدة PDU 8 منافذ + UPS 1500VA (قيد التوريد)',
  'باب زجاجي مؤمّن بمفتاح لدى م/ عماد الشرقاوي وم/ سامح يس'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  location = EXCLUDED.location,
  cooling_type = EXCLUDED.cooling_type,
  power_backup = EXCLUDED.power_backup,
  lock_status = EXCLUDED.lock_status;

INSERT INTO public.meshawir_rack_devices (id, rack_id, name, arabic_name, model, manufacturer, u_position_start, u_height, device_category, serial_number, ip_management, mac_address, power_watts, operating_temp_c, status, notes)
VALUES
('patch-panel-1', 'rack-maadi-27u', 'Patch Panel 24 Port #1', 'لوحة التوزيع الأولى Cat6 (المكاتب والكول سنتر والطابعة والهواتف)', 'Cat6 24-Port 1U Patch Panel', 'Perla / RedLine', 27, 1, 'patch_panel', 'PP1-24P-01', 'Passive', 'Passive', 0, 22, 'online', 'المنفذ PP1-07 مخصص لطابعة HP LaserJet Pro M404n بمكتب 5'),
('cisco-switch-48', 'rack-maadi-27u', 'Cisco Catalyst 3850-48P PoE+', 'سويتش سيسكو المركزي 48 بورت PoE+ (Dual 715W PSU + 4x 10G SFP+)', 'WS-C3850-48P-S Dual 715W', 'Cisco Systems', 26, 1, 'switch', 'FCW2148L0P9', '192.168.10.2', 'F4:0F:1B:7A:48:00', 340, 31, 'online', 'يدير جميع الـ VLANs (10, 15, 20, 30, 40, 50, 90-92, 99) ويربط ER8411 و604A وR640'),
('patch-panel-2', 'rack-maadi-27u', 'Patch Panel 24 Port #2', 'لوحة التوزيع الثانية Cat6 (الكاميرات الـ 16 والسيرفرات والواي فاي)', 'Cat6 24-Port 1U Patch Panel', 'Perla / RedLine', 25, 1, 'patch_panel', 'PP2-24P-02', 'Passive', 'Passive', 0, 22, 'online', 'توصيلات الكاميرات والواي فاي والسيرفرات مفحوصة بـ I-Pook PK65H'),
('dell-r640', 'rack-maadi-27u', 'Dell PowerEdge R640 + HP Z440 Vault', 'سيرفر ديل بلاتينيوم R640 (8x SAS/NVMe + 4x LACP + iDRAC9) + رف Z440 Proxmox', 'PowerEdge R640 (2x Xeon 8160 48C, 64GB ECC) + Z440 #1', 'Dell / HP Enterprise', 24, 1, 'server', '7X9K4R2 / Z440-01', '192.168.10.10 (iDRAC: .9 | Z440: .20)', 'D8:9E:F3:11:42:01', 560, 35, 'online', '4 منافذ LACP + iDRAC9 + Proxmox VE 8.x + حاويات Docker + OPNsense مساند + خزنة الباك أب 3:00 ص'),
('rack-spacer-empty', 'rack-maadi-27u', '3U Airflow & Expansion Bay', 'مسافة تهوية وفصل حراري فارغة واضحة (U23–U21 · 3U Airflow Bay)', 'Clear Airflow Separation Bay', 'Perla', 21, 3, 'spacer', 'EMPTY-3U-BAY', 'N/A', 'N/A', 0, 23, 'online', 'عزل حراري حقيقي بعرض الراك بين R640 وأجهزة الصوت والمراقبة مع إظهار قضبان الراك'),
('nvr-16-ch', 'rack-maadi-27u', 'Hikvision 16-Channel 4K NVR', 'مسجل كاميرات المراقبة هيكفيجن 16 قناة 4K (هارد 4TB WD Purple)', 'DS-7616NI-I2/16P', 'Hikvision', 20, 1, 'nvr', 'HK-NVR-16-01', '192.168.20.100', 'C4:2F:90:3A:55:12', 140, 29, 'online', '16 قناة بدقة 5MP (منها 4 صوتية) + مخرج HDMI/VGA لشاشات المراقبة على VLAN 20'),
('grandstream-pbx-604a', 'rack-maadi-27u', 'Grandstream UCM6304A ("604A") IP PBX', 'السنترال الذكي جراند ستريم 604A (شاشة LCD + FXO 1-4 + FXS 1-2) [مُشغّل]', 'Grandstream UCM6304A Enterprise IP PBX', 'Grandstream Networks', 19, 1, 'pbx', 'GS-604A-MAADI', 'https://192.168.30.1:8089', '00:0B:82:94:12:3C', 45, 26, 'online', 'جديد ومشترى ومفعّل: يظهر شاشة LCD + WAN + LAN (Gi1/0/13) + الخط الأرضي الثاني راكب على FXO-1 + استقبال 100 على FXS-1'),
('tplink-er8411-fw', 'rack-maadi-27u', 'TP-Link ER8411 Enterprise Router & Firewall', 'جدار الحماية والراوتر المركزي TP-Link ER8411 (Multi-WAN + VPN) [مُشغّل]', 'TP-Link Omada ER8411 10G Multi-WAN Router & Firewall', 'TP-Link Omada', 18, 1, 'firewall', 'TPL-ER8411-01', '192.168.10.1', '70:4C:A5:10:E2:80', 60, 28, 'online', 'جديد ومشترى ومفعّل: يربط WAN1 (خط أرضي 1 WE ADSL) + WAN2 (Vodafone 5G) + WAN3 (جاهز لفايبر WE L3VPN) + ترنك LAN إلى سيسكو 3850 + OPNsense مساند على Z440')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  arabic_name = EXCLUDED.arabic_name,
  model = EXCLUDED.model,
  u_position_start = EXCLUDED.u_position_start,
  u_height = EXCLUDED.u_height,
  ip_management = EXCLUDED.ip_management,
  status = EXCLUDED.status,
  notes = EXCLUDED.notes;

INSERT INTO public.meshawir_rack_ports (id, device_id, port_number, label, status, connected_device, device_type, user_endpoint, ip_address, mac_address, vlan_name, vlan_id, speed_duplex, poe_watts, cable_color, patch_panel_cross_port, notes)
VALUES
('er8411-p1', 'tplink-er8411-fw', 1, 'WAN1 (RJ45)', 'active', 'راوتر خط أرضي 1 — إنترنت WE ADSL', 'uplink', 'خط أرضي 1 بالمعادي (WE ADSL)', '192.168.1.1 / PPPoE', '70:4C:A5:10:E2:81', 'WAN1 - WE ADSL', 90, '1000 Mbps Full', 0, 'yellow', NULL, 'شغال فعلياً الآن كمصدر إنترنت أرضي أساسي داخل ER8411'),
('er8411-p2', 'tplink-er8411-fw', 2, 'WAN2 (RJ45)', 'active', 'راوتر Vodafone 5G (فودافون الجيل الخامس)', 'uplink', 'باقة إنترنت Vodafone 5G بالمقر', '192.168.8.1 (Gateway)', '70:4C:A5:10:E2:82', 'WAN2 - Vodafone 5G', 90, '1000 Mbps Full', 0, 'red', NULL, 'شغال فعلياً الآن على ER8411 لموازنة الأحمال والسرعة العالية والطوارئ'),
('er8411-p3', 'tplink-er8411-fw', 3, 'WAN3 (SFP+)', 'standby', 'مسار فايبر المصرية للاتصالات WE L3VPN 24Mbps', 'uplink', 'سنترال المعادي ↔ القرية الذكية (PO 6078927)', '10.240.18.2', '70:4C:A5:10:E2:83', 'VLAN 90 - WE L3VPN', 90, '10G SFP+ Ready', 0, 'cyan', NULL, 'منفذ جاهز لوصول خط الفايبر خلال 4–6 أسابيع'),
('er8411-p4', 'tplink-er8411-fw', 4, 'LAN1 Trunk (10G SFP+)', 'active', 'ترنك الشبكة الرئيسي ↔ سويتش سيسكو 3850 (Gi1/0/33)', 'switch', 'قلب الشبكة الداخلية وتوزيع جميع VLANs', '192.168.10.1', '70:4C:A5:10:E2:84', 'All VLANs 802.1Q Trunk', 10, '10G Full Duplex', 0, 'blue', NULL, 'يمرر قواعد الجدار الناري وعزل الشبكات لكل أجهزة المقر (ومساند بـ OPNsense VM على Z440)'),
('gs604a-p1', 'grandstream-pbx-604a', 1, 'LAN (Gigabit)', 'active', 'سويتش سيسكو 3850 منفذ Gi1/0/13', 'switch', 'شبكة هواتف IP المكتبية (GRP2614 · 101–116)', '192.168.30.1', '00:0B:82:94:12:3C', 'VLAN 30 - VoIP PBX', 30, '1000 Mbps Full', 0, 'green', 13, 'واجهة الإدارة https://192.168.30.1:8089'),
('gs604a-p2', 'grandstream-pbx-604a', 2, 'WAN (SIP)', 'active', 'واجهة VoIP عبر TP-Link ER8411', 'firewall', 'دعم خطوط SIP والمكالمات المشفرة', '192.168.30.2', '00:0B:82:94:12:3D', 'VLAN 30 - VoIP PBX', 30, '1000 Mbps Full', 0, 'green', NULL, 'جاهز لربط SIP Trunks'),
('gs604a-p3', 'grandstream-pbx-604a', 3, 'FXO-1 (PSTN)', 'active', 'الخط الأرضي الثاني بالمعادي (راكب مباشرة)', 'uplink', 'مكالمات الركاب والكباتن والاستقبال (IVR)', 'PSTN Line 2', 'Analog FXO-1', 'VLAN 30 - VoIP PBX', 30, 'Analog PSTN', 0, 'amber', NULL, 'الخط الأرضي الثاني موصل وشغال على السنترال الآن'),
('gs604a-p4', 'grandstream-pbx-604a', 4, 'FXO-2..4', 'standby', 'منافذ خطوط أرضية للتوسع المستقبلي', 'uplink', 'احتياطي 3 خطوط خارجية', 'PSTN Expansion', 'Analog FXO 2-4', 'VLAN 30 - VoIP PBX', 30, 'Analog PSTN', 0, 'slate', NULL, 'جاهزة لإضافة خطوط خدمة عملاء إضافية'),
('gs604a-p5', 'grandstream-pbx-604a', 5, 'FXS-1 (Ext 100)', 'active', 'تليفون/فاكس الاستقبال المباشر (تحويلة 100)', 'voip_phone', 'مكتب الاستقبال والمدخل', 'Ext 100', 'Analog FXS-1', 'VLAN 30 - VoIP PBX', 30, 'Analog FXS', 0, 'green', NULL, 'يعمل حتى في حالات انقطاع الشبكة'),
('gs604a-p6', 'grandstream-pbx-604a', 6, 'FXS-2', 'free', 'متاح لهاتف طوارئ إضافي', 'voip_phone', 'غير مخصص', '—', 'Analog FXS-2', 'VLAN 30 - VoIP PBX', 30, 'Analog FXS', 0, 'slate', NULL, 'تذكرة MSH-IT-2026-084 لضبط IVR والطابور'),
('c3850-p1', 'cisco-switch-48', 1, 'Gi1/0/1', 'active', 'محطة عمل المهندس عماد الشرقاوي (مدير الفرع)', 'workstation', 'مكتب 5 — الإدارة التقنية (PP1-01)', '192.168.10.12', 'A4:BB:6D:10:01:01', 'VLAN 10 - إدارة وموظفون', 10, '1000 Mbps Full', 0, 'blue', 1, 'نقطة الإدارة التنفيذية الأولى'),
('c3850-p2', 'cisco-switch-48', 2, 'Gi1/0/2', 'active', 'محطة عمل المهندس سامح يس (CTO)', 'workstation', 'مكتب 5 — الإدارة التقنية (PP1-02)', '192.168.10.11', 'A4:BB:6D:10:01:02', 'VLAN 10 - إدارة وموظفون', 10, '1000 Mbps Full', 0, 'blue', 2, 'نقطة رئيس قطاع التكنولوجيا'),
('c3850-p3', 'cisco-switch-48', 3, 'Gi1/0/3', 'active', 'جهاز المستشار القانوني أ/ محمد مصطفى', 'workstation', 'مكتب 4/6 — الشؤون القانونية (PP1-03)', '192.168.10.13', 'A4:BB:6D:10:01:03', 'VLAN 10 - إدارة وموظفون', 10, '1000 Mbps Full', 0, 'blue', 3, 'ملفات قيمة تك وLTRA وITIDA'),
('c3850-p4', 'cisco-switch-48', 4, 'Gi1/0/4', 'active', 'جهاز المدير المالي أ/ هاني', 'workstation', 'مكتب 2 — الإدارة المالية CFO (PP1-04)', '192.168.10.14', 'A4:BB:6D:10:01:04', 'VLAN 10 - إدارة وموظفون', 10, '1000 Mbps Full', 0, 'blue', 4, 'بوابة الضرائب ETA وبوابة فوري'),
('c3850-p5', 'cisco-switch-48', 5, 'Gi1/0/5', 'active', 'جهاز مدير العمليات م/ موفق', 'workstation', 'مكتب 3 — غرفة عمليات 4B (PP1-05)', '192.168.10.15', 'A4:BB:6D:10:01:05', 'VLAN 10 - إدارة وموظفون', 10, '1000 Mbps Full', 0, 'blue', 5, 'متابعة الرحلات وطوارئ SOS'),
('c3850-p6', 'cisco-switch-48', 6, 'Gi1/0/6', 'active', 'جهاز مدير الأساطيل م/ عمرو', 'workstation', 'مكتب 3 — غرفة عمليات 4B (PP1-06)', '192.168.10.16', 'A4:BB:6D:10:01:06', 'VLAN 10 - إدارة وموظفون', 10, '1000 Mbps Full', 0, 'blue', 6, 'إدارة الكباتن والحوافز'),
('c3850-p7', 'cisco-switch-48', 7, 'Gi1/0/7', 'active', 'طابعة ليزر شبكية HP LaserJet Pro M404n', 'printer', 'مكتب 5 — مخرج الغرفة Room Drop PP1-07', '192.168.10.45', '3C:2A:F4:88:40:07', 'VLAN 10 - إدارة وموظفون', 10, '1000 Mbps Full', 0, 'orange', 7, 'المنفذ المرجعي لطابعة التقارير والعقود وبوالص الشحن'),
('c3850-p8', 'cisco-switch-48', 8, 'Gi1/0/8', 'active', 'جهاز كول سنتر #1 (Dell OptiPlex Core i5)', 'workstation', 'القاعة المفتوحة — مقعد 1 (PP1-08)', '192.168.15.21', 'B8:CA:3A:15:00:08', 'VLAN 15 - كول سنتر', 15, '1000 Mbps Full', 0, 'indigo', 8, 'شاشة HP 22" بكاميرا مدمجة'),
('c3850-p9', 'cisco-switch-48', 9, 'Gi1/0/9', 'active', 'جهاز كول سنتر #2 (Dell OptiPlex Core i5)', 'workstation', 'القاعة المفتوحة — مقعد 2 (PP1-09)', '192.168.15.22', 'B8:CA:3A:15:00:09', 'VLAN 15 - كول سنتر', 15, '1000 Mbps Full', 0, 'indigo', 9, 'شاشة HP 22" بكاميرا مدمجة'),
('c3850-p10', 'cisco-switch-48', 10, 'Gi1/0/10', 'active', 'جهاز كول سنتر #3 (Dell OptiPlex Core i5)', 'workstation', 'القاعة المفتوحة — مقعد 3 (PP1-10)', '192.168.15.23', 'B8:CA:3A:15:00:10', 'VLAN 15 - كول سنتر', 15, '1000 Mbps Full', 0, 'indigo', 10, 'شاشة HP 22" بكاميرا مدمجة'),
('c3850-p11', 'cisco-switch-48', 11, 'Gi1/0/11', 'standby', 'مخرج كول سنتر #4 (توسعة +5 أجهزة Dell)', 'workstation', 'القاعة المفتوحة — مقعد 4 (PP1-11)', '192.168.15.24', '—', 'VLAN 15 - كول سنتر', 15, 'Auto 1G Ready', 0, 'indigo', 11, 'ضمن خطة استكمال 8 مقاعد فورية'),
('c3850-p12', 'cisco-switch-48', 12, 'Gi1/0/12', 'standby', 'مخرج كول سنتر #5 / محلل البيانات', 'workstation', 'القاعة المفتوحة — مقعد 5 (PP1-12)', '192.168.15.25', '—', 'VLAN 15 - كول سنتر', 15, 'Auto 1G Ready', 0, 'indigo', 12, 'خرائط حرارية وتقارير التشغيل'),
('c3850-p13', 'cisco-switch-48', 13, 'Gi1/0/13', 'active', 'سنترال جراند ستريم Grandstream 604A (LAN)', 'pbx', 'راك U19 — السنترال المركزي (PP1-13)', '192.168.30.1', '00:0B:82:94:12:3C', 'VLAN 30 - سنترال VoIP', 30, '1000 Mbps Full', 0, 'green', 13, 'شغال ومربوط بالخط الأرضي الثاني'),
('c3850-p14', 'cisco-switch-48', 14, 'Gi1/0/14', 'active', 'هواتف Grandstream GRP2614 (تحويلات 101–102)', 'voip_phone', 'مكتب 5 — م/ عماد وم/ سامح (PP1-14)', '192.168.30.11', '00:0B:82:AA:30:14', 'VLAN 30 - سنترال VoIP', 30, '1000 Mbps PoE+', 8.4, 'green', 14, 'تغذية PoE+ من السويتش مباشرة'),
('c3850-p15', 'cisco-switch-48', 15, 'Gi1/0/15', 'active', 'هواتف Grandstream GRP2614 (مالية/قانونية/عمليات 103–106)', 'voip_phone', 'غرف 2–6 (PP1-15)', '192.168.30.13', '00:0B:82:AA:30:15', 'VLAN 30 - سنترال VoIP', 30, '1000 Mbps PoE+', 12.6, 'green', 15, 'تغذية PoE+ لعِدد الإدارة والعمليات'),
('c3850-p16', 'cisco-switch-48', 16, 'Gi1/0/16', 'active', 'هواتف كول سنتر GRP2614 (طابور 107–111)', 'voip_phone', 'القاعة الكبرى المفتوحة (PP1-16)', '192.168.30.17', '00:0B:82:AA:30:16', 'VLAN 30 - سنترال VoIP', 30, '1000 Mbps PoE+', 15.2, 'green', 16, 'طابور خدمة العملاء 5 مقاعد'),
('c3850-p17', 'cisco-switch-48', 17, 'Gi1/0/17', 'active', 'مسجل كاميرات Hikvision 16ch 4K NVR', 'nvr', 'راك U20 — غرفة السيرفرات (PP2-01)', '192.168.20.100', 'C4:2F:90:3A:55:12', 'VLAN 20 - كاميرات CCTV', 20, '1000 Mbps Full', 0, 'purple', 1, 'معزول بالكامل على VLAN 20'),
('c3850-p18', 'cisco-switch-48', 18, 'Gi1/0/18', 'active', 'كاميرات 1 و 2 (المدخل والاستقبال صوتية)', 'camera', 'المدخل والاستقبال (PP2-02)', '192.168.20.11', 'C4:2F:90:20:01:02', 'VLAN 20 - كاميرات CCTV', 20, '100 Mbps PoE+', 11.2, 'purple', 2, 'كاميرا 2 مزودة بميكروفون صوتي'),
('c3850-p19', 'cisco-switch-48', 19, 'Gi1/0/19', 'active', 'كاميرات 3 و 4 (البصمة وغرفة السيرفرات صوتية)', 'camera', 'ممر السيرفرات (PP2-03)', '192.168.20.13', 'C4:2F:90:20:03:04', 'VLAN 20 - كاميرات CCTV', 20, '100 Mbps PoE+', 11.4, 'purple', 3, 'كاميرا 4 صوتية على باب غرفة السيرفرات'),
('c3850-p20', 'cisco-switch-48', 20, 'Gi1/0/20', 'active', 'كاميرات 5 و 6 (داخل السيرفرات + القاعة ركن 1)', 'camera', 'غرفة السيرفرات والقاعة (PP2-04)', '192.168.20.15', 'C4:2F:90:20:05:06', 'VLAN 20 - كاميرات CCTV', 20, '100 Mbps PoE+', 10.8, 'purple', 4, 'مراقبة راك 27U من الداخل'),
('c3850-p21', 'cisco-switch-48', 21, 'Gi1/0/21', 'active', 'كاميرات 7 و 8 (القاعة المفتوحة أركان 2 و 3)', 'camera', 'القاعة الكبرى (PP2-05)', '192.168.20.17', 'C4:2F:90:20:07:08', 'VLAN 20 - كاميرات CCTV', 20, '100 Mbps PoE+', 10.5, 'purple', 5, 'تغطية شاملة للكول سنتر'),
('c3850-p22', 'cisco-switch-48', 22, 'Gi1/0/22', 'active', 'كاميرات 9 و 10 (القاعة ركن 4 + عمليات صوتية)', 'camera', 'القاعة والعمليات (PP2-06)', '192.168.20.19', 'C4:2F:90:20:09:10', 'VLAN 20 - كاميرات CCTV', 20, '100 Mbps PoE+', 11.2, 'purple', 6, 'كاميرا 10 صوتية بغرفة العمليات'),
('c3850-p23', 'cisco-switch-48', 23, 'Gi1/0/23', 'active', 'كاميرات 11 و 12 (الممر + المالية ومكتب 5 صوتية)', 'camera', 'الممر ومكتب 5 (PP2-07)', '192.168.20.21', 'C4:2F:90:20:11:12', 'VLAN 20 - كاميرات CCTV', 20, '100 Mbps PoE+', 11, 'purple', 7, 'كاميرا 12 صوتية'),
('c3850-p24', 'cisco-switch-48', 24, 'Gi1/0/24', 'active', 'كاميرات 13–16 (QA، المطبخ، الواجهة، الطابعة)', 'camera', 'باقي المقر (PP2-08)', '192.168.20.23', 'C4:2F:90:20:13:16', 'VLAN 20 - كاميرات CCTV', 20, '100 Mbps PoE+', 14.5, 'purple', 8, 'مكتمل بكاميرات الأصدقاء 5MP'),
('c3850-p25', 'cisco-switch-48', 25, 'Gi1/0/25', 'active', 'Dell PowerEdge R640 — LACP Link 1', 'server', 'راك U24 — سيرفر الإنتاج (PP2-17)', '192.168.10.10', 'D8:9E:F3:11:42:01', 'VLAN 50 - سيرفرات', 50, '1000 Mbps LACP', 0, 'cyan', 17, 'عضو في تجميع 4Gbps LACP'),
('c3850-p26', 'cisco-switch-48', 26, 'Gi1/0/26', 'active', 'Dell PowerEdge R640 — LACP Link 2', 'server', 'راك U24 — سيرفر الإنتاج', '192.168.10.10', 'D8:9E:F3:11:42:02', 'VLAN 50 - سيرفرات', 50, '1000 Mbps LACP', 0, 'cyan', NULL, 'عضو في تجميع 4Gbps LACP'),
('c3850-p27', 'cisco-switch-48', 27, 'Gi1/0/27', 'active', 'Dell PowerEdge R640 — LACP Link 3', 'server', 'راك U24 — سيرفر الإنتاج', '192.168.10.10', 'D8:9E:F3:11:42:03', 'VLAN 50 - سيرفرات', 50, '1000 Mbps LACP', 0, 'cyan', NULL, 'عضو في تجميع 4Gbps LACP'),
('c3850-p28', 'cisco-switch-48', 28, 'Gi1/0/28', 'active', 'Dell PowerEdge R640 — LACP Link 4', 'server', 'راك U24 — سيرفر الإنتاج', '192.168.10.10', 'D8:9E:F3:11:42:04', 'VLAN 50 - سيرفرات', 50, '1000 Mbps LACP', 0, 'cyan', NULL, 'عضو في تجميع 4Gbps LACP'),
('c3850-p29', 'cisco-switch-48', 29, 'Gi1/0/29', 'active', 'وحدة إدارة سيرفر ديل iDRAC9 Enterprise', 'server', 'راك U24 — إدارة خارج النطاق OOB', '192.168.10.9', 'D8:9E:F3:11:42:09', 'VLAN 99 - إدارة معزولة', 99, '1000 Mbps Full', 0, 'red', NULL, 'تحكم وإعادة تشغيل السيرفر عن بعد'),
('c3850-p30', 'cisco-switch-48', 30, 'Gi1/0/30', 'active', 'محطة/سيرفر HP Z440 #1 (Proxmox VE & Docker)', 'server', 'راك U24 — بيئة الحاويات وOPNsense (PP2-18)', '192.168.10.20', 'E4:11:5B:C9:88:10', 'VLAN 50 - سيرفرات', 50, '1000 Mbps Full', 0, 'cyan', 18, 'تشغيل Proxmox VE 8.x + Docker + النسخ الليلي 3:00 ص'),
('c3850-p31', 'cisco-switch-48', 31, 'Gi1/0/31', 'active', 'خزنة مراقبة HP Z440 #2 (مكتب 5 — 3 شاشات)', 'workstation', 'مكتب 5 — إدارة ومراقبة (PP1-19)', '192.168.10.22', 'E4:11:5B:C9:88:22', 'VLAN 50 - سيرفرات', 50, '1000 Mbps Full', 0, 'cyan', 19, 'محطة التطوير والمراقبة الثلاثية'),
('c3850-p32', 'cisco-switch-48', 32, 'Gi1/0/32', 'active', 'جهاز البصمة والحضور ZKTeco Biometric', 'workstation', 'مدخل المقر — الموارد البشرية (PP1-20)', '192.168.10.88', '00:17:61:10:88:32', 'VLAN 10 - إدارة وموظفون', 10, '100 Mbps Full', 0, 'blue', 20, 'بورت 4370 لبرنامج الحضور مع أ/ سارة حسن'),
('c3850-p33', 'cisco-switch-48', 33, 'Gi1/0/33', 'active', 'جدار الحماية والراوتر TP-Link ER8411 (LAN Trunk)', 'firewall', 'راك U18 — البوابة الأمنية المركزية', '192.168.10.1', '70:4C:A5:10:E2:80', 'VLAN 10 - إدارة وموظفون', 10, '1000 Mbps Trunk', 0, 'yellow', NULL, 'يربط ER8411 بالسويتش لتمرير إنترنت WE ADSL + Vodafone 5G'),
('c3850-p34', 'cisco-switch-48', 34, 'Gi1/0/34', 'standby', 'OPNsense Firewall VM (مساند على Z440)', 'firewall', 'بيئة عزل واختبار داخلية', '192.168.10.3', '52:54:00:99:34:01', 'VLAN 99 - إدارة معزولة', 99, '1000 Mbps Full', 0, 'red', NULL, 'فايروول افتراضي مساند لـ ER8411'),
('c3850-p35', 'cisco-switch-48', 35, 'Gi1/0/35', 'active', 'مكتب البرمجة وضمان الجودة (م/ علي QA — غرفة 7)', 'workstation', 'غرفة 7 — QA & Dev (PP1-21)', '192.168.10.35', 'D4:81:D7:70:35:01', 'VLAN 10 - إدارة وموظفون', 10, '1000 Mbps Full', 0, 'blue', 21, 'اختبار تطبيقات 4B ووكالة ودارو'),
('c3850-p36', 'cisco-switch-48', 36, 'Gi1/0/36', 'active', 'مكتب الموارد البشرية (أ/ سارة حسن — غرفة 6)', 'workstation', 'غرفة 6 — HR (PP1-22)', '192.168.10.36', 'D4:81:D7:60:36:01', 'VLAN 10 - إدارة وموظفون', 10, '1000 Mbps Full', 0, 'blue', 22, 'متابعة البصمة والعقود'),
('c3850-p37', 'cisco-switch-48', 37, 'Gi1/0/37', 'active', 'أكسس بوينت واي فاي Ubiquiti UniFi AP #1', 'access_point', 'سقف الصالة والاستقبال (PP2-21)', '192.168.10.150', '74:83:C2:40:37:01', 'VLAN 40 - واي فاي', 40, '1000 Mbps PoE+', 15.4, 'white', 21, 'بث شبكة الموظفين وشبكة الضيوف المعزولة'),
('c3850-p38', 'cisco-switch-48', 38, 'Gi1/0/38', 'standby', 'أكسس بوينت واي فاي UniFi AP #2 (غرف الإدارة)', 'access_point', 'سقف الممر الإداري (PP2-22)', '192.168.10.151', '—', 'VLAN 40 - واي فاي', 40, 'PoE+ Ready', 0, 'white', 22, 'جاهز للتوسع في التغطية اللاسلكية'),
('c3850-p45', 'cisco-switch-48', 45, 'Gi1/0/45', 'active', 'دائرة 4B المباشرة الأساسية (WE Fiber PRI-4821)', 'uplink', 'سنترال المعادي ↔ سحابة 4B', '10.10.40.10', '00:1A:A1:91:45:01', 'VLAN 90-92 خطوط WE و4B', 91, '1000 Mbps Full', 0, 'cyan', NULL, 'اختبار زمن التأخير < 5ms'),
('c3850-p46', 'cisco-switch-48', 46, 'Gi1/0/46', 'standby', 'دائرة طوارئ 4B الاحتياطية (DR-4822)', 'uplink', 'مسار التحويل الفوري DR', '10.10.40.11', '00:1A:A1:92:46:01', 'VLAN 90-92 خطوط WE و4B', 92, '1000 Mbps Full', 0, 'orange', NULL, 'Failover تلقائي عند انقطاع الخط الأساسي'),
('c3850-p47', 'cisco-switch-48', 47, 'Gi1/0/47', 'active', 'إدارة السويتش Console / OOB Port', 'switch', 'إدارة شبكة المعادي', '192.168.10.2', 'F4:0F:1B:7A:48:47', 'VLAN 99 - إدارة معزولة', 99, '1000 Mbps Full', 0, 'red', NULL, 'SSH Management للمهندس عماد الشرقاوي'),
('c3850-p48', 'cisco-switch-48', 48, 'Gi1/0/48', 'active', 'خط تجميع فايبر WE (24Mbps L3VPN Hub - PO 6078927)', 'uplink', 'المعادي ↔ القرية الذكية و6 محافظات', '10.50.10.1', '00:1A:A1:90:48:01', 'VLAN 90-92 خطوط WE و4B', 90, '1000 Mbps Full', 0, 'cyan', NULL, 'توريد 4–6 أسابيع عبر م/ أحمد محرم'),
('c3850-p39', 'cisco-switch-48', 39, 'Gi1/0/39', 'free', 'مخرج توسعة القاعة الكبرى #1', 'workstation', 'القاعة المفتوحة (التوسع لـ 17 مقعداً)', '192.168.15.39', '—', 'VLAN 15 - كول سنتر', 15, '1000 Mbps Auto', 0, 'slate', NULL, 'جاهز لتأريج حاتم الفني عند إضافة أجهزة جديدة'),
('c3850-p40', 'cisco-switch-48', 40, 'Gi1/0/40', 'free', 'مخرج توسعة القاعة الكبرى #2', 'workstation', 'القاعة المفتوحة (التوسع لـ 17 مقعداً)', '192.168.15.40', '—', 'VLAN 15 - كول سنتر', 15, '1000 Mbps Auto', 0, 'slate', NULL, 'جاهز لتأريج حاتم الفني عند إضافة أجهزة جديدة'),
('c3850-p41', 'cisco-switch-48', 41, 'Gi1/0/41', 'free', 'مخرج توسعة القاعة الكبرى #3', 'workstation', 'القاعة المفتوحة (التوسع لـ 17 مقعداً)', '192.168.15.41', '—', 'VLAN 15 - كول سنتر', 15, '1000 Mbps Auto', 0, 'slate', NULL, 'جاهز لتأريج حاتم الفني عند إضافة أجهزة جديدة'),
('c3850-p42', 'cisco-switch-48', 42, 'Gi1/0/42', 'free', 'مخرج توسعة القاعة الكبرى #4', 'workstation', 'القاعة المفتوحة (التوسع لـ 17 مقعداً)', '192.168.15.42', '—', 'VLAN 15 - كول سنتر', 15, '1000 Mbps Auto', 0, 'slate', NULL, 'جاهز لتأريج حاتم الفني عند إضافة أجهزة جديدة'),
('c3850-p43', 'cisco-switch-48', 43, 'Gi1/0/43', 'free', 'مخرج توسعة القاعة الكبرى #5', 'workstation', 'القاعة المفتوحة (التوسع لـ 17 مقعداً)', '192.168.15.43', '—', 'VLAN 15 - كول سنتر', 15, '1000 Mbps Auto', 0, 'slate', NULL, 'جاهز لتأريج حاتم الفني عند إضافة أجهزة جديدة'),
('c3850-p44', 'cisco-switch-48', 44, 'Gi1/0/44', 'free', 'مخرج توسعة القاعة الكبرى #6', 'workstation', 'القاعة المفتوحة (التوسع لـ 17 مقعداً)', '192.168.15.44', '—', 'VLAN 15 - كول سنتر', 15, '1000 Mbps Auto', 0, 'slate', NULL, 'جاهز لتأريج حاتم الفني عند إضافة أجهزة جديدة')
ON CONFLICT (id) DO UPDATE SET
  label = EXCLUDED.label,
  status = EXCLUDED.status,
  connected_device = EXCLUDED.connected_device,
  user_endpoint = EXCLUDED.user_endpoint,
  ip_address = EXCLUDED.ip_address,
  vlan_name = EXCLUDED.vlan_name,
  vlan_id = EXCLUDED.vlan_id,
  speed_duplex = EXCLUDED.speed_duplex,
  poe_watts = EXCLUDED.poe_watts,
  notes = EXCLUDED.notes;

-- 7. Leased Lines & Internet Circuits (WE ADSL + Vodafone 5G + Line 2 PSTN + WE L3VPN)
INSERT INTO public.meshawir_4b_leased_lines (id, circuit_reference, provider_name, service_type, bandwidth_mbps, source_endpoint, destination_endpoint, primary_gateway_ip, backup_gateway_ip, monthly_cost_egp, contract_ref, status, notes)
VALUES
('line-we-adsl-1', 'WE-ADSL-MAADI-LINE1', 'المصرية للاتصالات WE', 'Primary Landline ADSL (Line 1)', 30, 'الخط الأرضي رقم 1 بمقر المعادي', 'راوتر WE ADSL ← TP-Link ER8411 WAN1', '192.168.1.1', '192.168.10.1', 500, 'خط أرضي 1', 'active', 'تم تشغيله فعلياً وربطه على TP-Link ER8411'),
('line-vf-5g-live', 'VF-5G-MAADI-WAN2', 'فودافون مصر (Vodafone 5G)', '5G Wireless High-Speed WAN', 100, 'راوتر Vodafone 5G بالمقر', 'TP-Link ER8411 WAN2', '192.168.8.1', '192.168.10.1', 750, 'فاتورة #748994 + باقة 5G', 'active', 'شغال فعلياً الآن مع TP-Link ER8411 لرفع السرعة والاستقرار'),
('line-we-pstn-2', 'WE-PSTN-MAADI-LINE2', 'المصرية للاتصالات WE', 'Dedicated Voice Landline (Line 2)', 1, 'الخط الأرضي رقم 2 بمقر المعادي', 'منفذ FXO-1 بسنترال Grandstream 604A', 'FXO-1', 'FXS-1', 250, 'خط أرضي 2 للسنترال', 'active', 'تم تركيبه على سنترال Grandstream 604A فعلياً'),
('line-4b-we-fiber', 'TE-CAI-4B-PRI-4821', 'المصرية للاتصالات WE', 'L3VPN Fiber 24Mbps + 6 Governorates (4Mbps ea)', 24, 'سنترال المعادي ↔ القرية الذكية', 'سويتش سيسكو Port 45/48 وER8411 WAN3', '10.10.40.10', '10.10.40.11', 30000, 'order#6078927 (360,000/yr)', 'active', 'توريد 4–6 أسابيع من 29/09/2026، وزمن تأخير مستهدف < 5ms')
ON CONFLICT (id) DO UPDATE SET
  service_type = EXCLUDED.service_type,
  bandwidth_mbps = EXCLUDED.bandwidth_mbps,
  destination_endpoint = EXCLUDED.destination_endpoint,
  monthly_cost_egp = EXCLUDED.monthly_cost_egp,
  status = EXCLUDED.status,
  notes = EXCLUDED.notes;

-- 8. All 16 CCTV Cameras
INSERT INTO public.meshawir_cctv_cameras (id, camera_number, model, location_in_office, nvr_channel, ip_address, switch_port, has_audio_mic, status)
VALUES
('cam-01', 1, 'Hikvision 5MP IP Camera', 'مدخل الشارع الرئيسي والباب الخارجي للمقر', 1, '192.168.20.11', 18, FALSE, 'online'),
('cam-02', 2, 'Hikvision 5MP Audio IP', 'منطقة الاستقبال والباب الداخلي الرئيسي (صوتية)', 2, '192.168.20.12', 18, TRUE, 'online'),
('cam-03', 3, 'Hikvision 5MP IP Camera', 'جهاز البصمة ZKTeco والممر الفاصل', 3, '192.168.20.13', 19, FALSE, 'online'),
('cam-04', 4, 'Hikvision 5MP Audio IP', 'مدخل ومحيط غرفة السيرفرات المصفحة (صوتية)', 4, '192.168.20.14', 19, TRUE, 'online'),
('cam-05', 5, 'Hikvision 5MP IP Camera', 'داخل غرفة السيرفرات مواجهة كابينة راك Perla 27U', 5, '192.168.20.15', 20, FALSE, 'online'),
('cam-06', 6, 'Hikvision 5MP IP Camera', 'القاعة المفتوحة للكول سنتر — الركن الأول', 6, '192.168.20.16', 20, FALSE, 'online'),
('cam-07', 7, 'Hikvision 5MP IP Camera', 'القاعة المفتوحة للكول سنتر — الركن الثاني', 7, '192.168.20.17', 21, FALSE, 'online'),
('cam-08', 8, 'Hikvision 5MP IP Camera', 'القاعة المفتوحة للكول سنتر — الركن الثالث', 8, '192.168.20.18', 21, FALSE, 'online'),
('cam-09', 9, 'Hikvision 5MP IP Camera', 'القاعة المفتوحة للكول سنتر — الركن الرابع', 9, '192.168.20.19', 22, FALSE, 'online'),
('cam-10', 10, 'Hikvision 5MP Audio IP', 'مكتب إدارة العمليات (م/ موفق وم/ عمرو — صوتية)', 10, '192.168.20.20', 22, TRUE, 'online'),
('cam-11', 11, 'Hikvision 5MP IP Camera', 'الممر الداخلي للغرف الإدارية والمالية', 11, '192.168.20.21', 23, FALSE, 'online'),
('cam-12', 12, 'Hikvision 5MP Audio IP', 'مكتب الإدارة المالية والحسابات ومكتب 5 (صوتية)', 12, '192.168.20.22', 23, TRUE, 'online'),
('cam-13', 13, 'Hikvision 5MP IP Camera', 'محيط مكتب البرمجة والجودة (غرفة 7)', 13, '192.168.20.23', 24, FALSE, 'online'),
('cam-14', 14, 'Hikvision 5MP IP Camera', 'منطقة الخدمات والمطبخ الصغير', 14, '192.168.20.24', 24, FALSE, 'online'),
('cam-15', 15, 'Hikvision 5MP IP Camera', 'محيط النوافذ والواجهة الرئيسية للمقر', 15, '192.168.20.25', 24, FALSE, 'online'),
('cam-16', 16, 'Hikvision 5MP IP Camera', 'نقطة الطابعة المركزية M404n والممر الخلفي', 16, '192.168.20.26', 24, FALSE, 'online')
ON CONFLICT (id) DO UPDATE SET
  location_in_office = EXCLUDED.location_in_office,
  ip_address = EXCLUDED.ip_address,
  switch_port = EXCLUDED.switch_port,
  has_audio_mic = EXCLUDED.has_audio_mic,
  status = EXCLUDED.status;

-- 9. Grandstream 604A VoIP Extensions (100 - 111)
INSERT INTO public.meshawir_voip_extensions (id, extension_number, user_name, department, device_model, ip_address, switch_port, vlan_id, status)
VALUES
('ext-100', '100', 'الاستقبال والفاكس (الخط الأنالوج المباشر FXS-1)', 'الاستقبال', 'Analog Phone FXS-1', 'FXS-1', 13, 30, 'active'),
('ext-101', '101', 'المهندس عماد الشرقاوي (مدير الفرع)', 'الإدارة التقنية (مكتب 5)', 'Grandstream GRP2614', '192.168.30.11', 14, 30, 'active'),
('ext-102', '102', 'المهندس سامح يس (CTO)', 'الإدارة التقنية (مكتب 5)', 'Grandstream GRP2614', '192.168.30.12', 14, 30, 'active'),
('ext-103', '103', 'الأستاذ هاني (CFO)', 'الإدارة المالية', 'Grandstream GRP2614', '192.168.30.13', 15, 30, 'active'),
('ext-104', '104', 'الأستاذ محمد مصطفى', 'الشؤون القانونية', 'Grandstream GRP2614', '192.168.30.14', 15, 30, 'active'),
('ext-105', '105', 'م/ موفق (إدارة العمليات)', 'عمليات 4B', 'Grandstream GRP2614', '192.168.30.15', 15, 30, 'active'),
('ext-106', '106', 'م/ عمرو (إدارة الأساطيل)', 'عمليات 4B', 'Grandstream GRP2614', '192.168.30.16', 15, 30, 'active'),
('ext-107', '107', 'كول سنتر 1 — خدمة العملاء والركاب', 'خدمة العملاء', 'Grandstream GRP2614', '192.168.30.17', 16, 30, 'active'),
('ext-108', '108', 'كول سنتر 2 — دعم الكباتن', 'خدمة العملاء', 'Grandstream GRP2614', '192.168.30.18', 16, 30, 'active'),
('ext-109', '109', 'كول سنتر 3 — الشكاوى والمفقودات', 'خدمة العملاء', 'Grandstream GRP2614', '192.168.30.19', 16, 30, 'active'),
('ext-110', '110', 'كول سنتر 4 — متابعة الرحلات', 'خدمة العملاء', 'Grandstream GRP2614', '192.168.30.20', 16, 30, 'active'),
('ext-111', '111', 'كول سنتر 5 — طوارئ SOS والطرق', 'خدمة العملاء', 'Grandstream GRP2614', '192.168.30.21', 16, 30, 'active')
ON CONFLICT (id) DO UPDATE SET
  user_name = EXCLUDED.user_name,
  department = EXCLUDED.department,
  ip_address = EXCLUDED.ip_address,
  status = EXCLUDED.status;

-- 10. Official Emails (5 Active Zoho Lite + Cancelled HR) & Domains
INSERT INTO public.mashweer_emails (id, address, role_title, department, status, quota, assigned_to, webmail_url, notes)
VALUES
('email-admin', 'admin@mashweer.com.eg', 'الإدارة العامة والتحكم بالأنظمة والخوادم والشبكات', 'العمليات والإدارة', 'نشط — يستلمه م/ عماد لإدارة السحابة والموردين', '10 GB', 'فريق مشاوير المعادي', 'https://mail.zoho.com', 'نشط — يستلمه م/ عماد لإدارة السحابة والموردين'),
('email-support', 'support@mashweer.com.eg', 'الدعم الفني وخدمة العملاء (بلاغات 4B ووكالة ودارو)', 'العمليات والإدارة', 'نشط — لمشرفي الكول سنتر تحت إشراف م/ عماد وعمرو وموفق', '5 GB', 'فريق مشاوير المعادي', 'https://mail.zoho.com', 'نشط — لمشرفي الكول سنتر تحت إشراف م/ عماد وعمرو وموفق'),
('email-info', 'info@mashweer.com.eg', 'المعلومات والاستفسارات العامة والشركاء والموقع الرسمي', 'العمليات والإدارة', 'نشط — لإدارة المقر والاستقبال', '5 GB', 'فريق مشاوير المعادي', 'https://mail.zoho.com', 'نشط — لإدارة المقر والاستقبال'),
('email-operation', 'operation@mashweer.com.eg', 'إدارة العمليات والتشغيل الميداني للرحلات والكباتن', 'العمليات والإدارة', 'نشط — مخصص لقيادة العمليات (م/ موفق وم/ عمرو)', '5 GB', 'فريق مشاوير المعادي', 'https://mail.zoho.com', 'نشط — مخصص لقيادة العمليات (م/ موفق وم/ عمرو)'),
('email-finance', 'finance@mashweer.com.eg', 'الإدارة المالية والفواتير وبوابات الدفع والتسويات', 'العمليات والإدارة', 'نشط — مخصص للأستاذ هاني (CFO)', '5 GB', 'فريق مشاوير المعادي', 'https://mail.zoho.com', 'نشط — مخصص للأستاذ هاني (CFO)'),
('email-hr', 'hr@mashweer.com.eg', 'الموارد البشرية (أ/ سارة حسن)', 'HR', 'ملغي ومستبعد للاكتفاء بالباقة المجانية (5 حسابات)', '—', 'فريق مشاوير المعادي', 'https://mail.zoho.com', 'ملغي ومستبعد للاكتفاء بالباقة المجانية (5 حسابات)')
ON CONFLICT (id) DO UPDATE SET
  role_title = EXCLUDED.role_title,
  status = EXCLUDED.status,
  notes = EXCLUDED.notes;

INSERT INTO public.meshawir_domains (id, domain_name, registrar, expiry_date, associated_project_id, status, notes)
VALUES
('dom-mashawer', 'mashawer.com.eg', 'المصرية لتكنولوجيا المعلومات EC (م/ محمد الحلو)', '2027-08-09', 'proj-maadi-hq', 'active', 'النطاق الرسمي المسجل والمستضاف على Host1 حتى 11/08/2027؛ مقترح تجديده لسنتين'),
('dom-4b', 'admin.4b.com.eg', 'نطاق تشغيل لوحة 4B', '2027-08-09', 'proj-4b', 'active', 'لوحة تحكم عمليات تطبيق 4B'),
('dom-wikala', 'wikala.com.eg', 'جاري التسجيل الرسمي بالملكية الفكرية', '2027-09-01', 'proj-wekala', 'pending_registration', 'مؤجل لحين إطلاق 4B وتوفر السجل التجاري وشهادة المنشأ'),
('dom-daro', 'daro.eg', 'نطاق تطبيق دارو للزوار والسياح', '2027-09-01', 'proj-daro', 'pending_registration', 'مؤجل لحين إطلاق 4B واستيفاء مستندات التسجيل')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  notes = EXCLUDED.notes;

-- 11. Quotations & ETA Tax Invoices (12 Items)
INSERT INTO public.meshawir_quotations (id, provider_id, quote_number, title, submission_date, subtotal_egp, vat_egp, total_egp, is_tax_invoice, eta_uuid, status)
VALUES
('qt-qts-1169', 'prov-qts-servers', '#1169', 'فاتورة QTS الضريبية: سيرفر Dell R640 + محطتي HP Z440', '2026-09-26', 84470, 11825.8, 96295.8, TRUE, '7ZYZDKGHRVSDN70R4SP81F3M10', 'مدفوعة ومعتمدة ETA'),
('qt-qts-1172', 'prov-qts-servers', '#1172', 'فاتورة QTS الضريبية: سويتش سيسكو Catalyst 3850-48P PoE+', '2026-09-28', 10500, 1470, 11970, TRUE, 'K1G9T4WV39B521M0EYV8EM3M10', 'مدفوعة ومعتمدة ETA'),
('qt-techno-dokki', 'prov-qts-servers', '#1660751017094', 'فاتورة تكنو ستورز الدقي: 3x Dell i5 الجيل 10 + 3x شاشات HP 22" + ملحقات', '2026-06-09', 35001, 4900.14, 39901.14, TRUE, '2YMG3N8EF4WVMEB3V67G7PTK10', 'مدفوعة ومعتمدة ETA'),
('qt-redline-15947', 'prov-redline', '#15947', 'فاتورة رد لاين البستان: راك Perla 27U + I-Pook PK65H + أدوات شبكة', '2026-03-29', 16271.93, 2278.07, 18550, TRUE, '6T3HM2FA86TEDZEBQHYPFWMK10', 'مدفوعة ومعتمدة ETA'),
('qt-menshawy-1096', 'prov-redline', '#001096', 'إذن المنشاوي البستان المؤقت: هاردات HP SAS 1.2TB/2TB وكابلات (بانتظار فاتورة ETA)', '2026-09-28', 8510, 0, 8510, FALSE, NULL, 'مدفوعة نقداً — مطلوب فاتورة ضريبية ومراجعة الحساب'),
('qt-vodafone-748994', 'prov-vodafone-5g', '#748994', 'فاتورة فودافون صقر قريش: راوتر H153-381 + شريحة + باقة 520', '2026-09-28', 2917.95, 408.51, 3326.46, TRUE, NULL, 'مدفوعة'),
('qt-raneen-40', 'prov-redline', '#40-0217871', 'فاتورة طيبة رنين الفسطاط: سلم 6 درجات + 4 كراسي راتان + طاولة', '2026-03-26', 2588.6, 362.4, 2951, TRUE, '34GAMWHCFDFNTGX5QWDGJ8PK10', 'مدفوعة ومعتمدة ETA'),
('qt-ec-host1', 'prov-ec-egypt', '#1331', 'فاتورة EC استضافة Host1 لموقع mashawer.com.eg حتى 10/08/2027', '2026-08-11', 2200, 308, 2508, TRUE, NULL, 'مدفوعة حتى 2027'),
('qt-ec-domain', 'prov-ec-egypt', '#1325', 'فاتورة EC تسجيل دومين mashawer.com.eg حتى 08/08/2027', '2026-08-09', 1100, 154, 1254, TRUE, NULL, 'مدفوعة حتى 2027'),
('qt-friends-cctv', 'prov-friends-cctv', 'PO-FRIENDS-55050', 'عرض الأصدقاء (م/ علي) لكاميرات مقر المعادي + NVR 4K + 4TB Purple', '2026-09-24', 55050, 0, 55050, FALSE, NULL, 'معتمد وقيد التسوية (2MP vs 5MP)'),
('qt-we-l3vpn', 'prov-we-telecom', 'order#6078927', 'أمر شراء WE: فايبر 24Mbps للمقر + 6 خطوط محافظات 4Mbps (سنوي)', '2026-09-29', 360000, 0, 360000, FALSE, NULL, 'معتمد (90,000 كل ربع سنة)'),
('qt-we-cloud-waf', 'prov-we-telecom', 'order#6078933', 'أمر شراء WE: 3 خوادم 4B + 20Mbps + F5 WAF + 7 SSL VPN + باك أب 30 يوم (سنوي)', '2026-09-29', 807496, 0, 807496, FALSE, NULL, 'معتمد (201,874 كل ربع سنة)')
ON CONFLICT (id) DO UPDATE SET
  subtotal_egp = EXCLUDED.subtotal_egp,
  vat_egp = EXCLUDED.vat_egp,
  total_egp = EXCLUDED.total_egp,
  eta_uuid = EXCLUDED.eta_uuid,
  status = EXCLUDED.status;

-- 12. Facility Zones (10 Maadi HQ Zones)
INSERT INTO public.meshawir_facility_zones (id, zone_name, allocated_purpose, dimensions_text, capacity_people, workstation_ports_count, cctv_cameras_count, assigned_staff, notes)
VALUES
('zone-open-hall', 'القاعة الكبرى المفتوحة (Open Hall)', 'صالة الكول سنتر وخدمة العملاء والعمليات', '9.60م × 12.28م', 17, 17, 4, 'فريق الكول سنتر (5 الآن ← 17 مستقبلاً) + محلل البيانات', 'توصيل سلكي 100% Cat6 بدون الاعتماد على Wi-Fi'),
('zone-server-room', 'غرفة السيرفرات المصفحة (Server Room)', 'حاضنة راك Perla 27U والاتصالات والسنترال', '5.74م × 1.96م', 2, 4, 2, 'المهندس عماد الشرقاوي والمهندس سامح يس', 'باب مصفح + تكييف 24/7 + كاميرا داخلية وأخرى خارجية'),
('zone-room-1', 'الغرفة رقم 1', 'مكتب إداري مزدوج / قيادة تشغيلية', 'مكتب قياسي', 2, 2, 0, 'قيادة الإدارة / التشغيل', 'مخارج شبكة مزدوجة'),
('zone-room-2', 'الغرفة رقم 2', 'مكتب الإدارة المالية (CFO)', 'مكتب قياسي', 2, 2, 1, 'الأستاذ هاني', 'توصيلات شبكة سلكية مستقلة'),
('zone-room-3', 'الغرفة رقم 3', 'غرفة عمليات 4B والمشرفين', 'مكتب قياسي', 2, 2, 1, 'م/ موفق وم/ عمرو', 'متابعة الأسطول والحملات'),
('zone-room-4', 'الغرفة رقم 4', 'مكتب الشؤون القانونية أو الاجتماعات المغلقة', 'مكتب قياسي', 4, 2, 0, 'أ/ محمد مصطفى / اجتماعات', ''),
('zone-room-5', 'الغرفة رقم 5 (مكتب التقنية CTO)', 'مكتب المهندس عماد الشرقاوي والمهندس سامح يس + الطابعة M404n + محطة Z440 #2', 'مكتب قياسي', 2, 4, 1, 'المهندس عماد الشرقاوي والمهندس سامح يس', 'مربوطة بطابعة HP M404n على منفذ السيسكو Gi1/0/7'),
('zone-room-6', 'الغرفة رقم 6', 'مكتب الموارد البشرية والشؤون الإدارية', 'مكتب قياسي', 2, 2, 0, 'أ/ سارة حسن', 'حفظ ملفات الموظفين وعقودهم'),
('zone-room-7', 'الغرفة رقم 7', 'مكتب البرمجة وضمان الجودة (QA)', 'مكتب قياسي', 3, 3, 1, 'م/ علي (QA) وم/ أحمد عبيد ومهندسون جدد', 'اختبار تطبيقات 4B ووكالة ودارو'),
('zone-reception-wc', 'الاستقبال والمدخل + دورتي المياه 1 و 2', 'الاستقبال، جهاز البصمة ZKTeco، وتليفون 100', 'مدخل رئيسي + حمامان', 4, 2, 2, 'الاستقبال والأمن', 'كاميرا صوتية على المدخل والاستقبال')
ON CONFLICT (id) DO UPDATE SET
  allocated_purpose = EXCLUDED.allocated_purpose,
  assigned_staff = EXCLUDED.assigned_staff,
  notes = EXCLUDED.notes;

-- 13. Hardware Inventory (8 Core Assets)
INSERT INTO public.hardware_inventory (id, name, role, specs, location, invoice_ref, vendor, status)
VALUES
('hw-tplink-er8411', 'TP-Link ER8411 Router & Firewall', 'راوتر وجدار حماية رئيسي Multi-WAN', '10G SFP+ & Gigabit Multi-WAN (WE ADSL + Vodafone 5G) + VPN + VLAN Firewall', 'راك Perla 27U (U18)', 'مشتريات مباشرة جديدة', 'TP-Link', 'تم الشراء والتشغيل الفعلي الآن'),
('hw-grandstream-604a', 'Grandstream UCM6304A ("604A") IP PBX', 'سنترال المقر الذكي + عِدد GRP2614', '4 FXO (الخط الأرضي الثاني) + 4 FXS + SIP + شاشة LCD + تسجيل مكالمات', 'راك Perla 27U (U19)', 'توريد السنترال والعِدد', 'Grandstream', 'تم الشراء والتركيب والتشغيل الفعلي'),
('hw-dell-r640', 'Dell PowerEdge R640 Platinum', 'خادم الإنتاج والنسخ الاحتياطي المحلي', '2x Xeon Platinum 8160 (48C/96T) • 64GB ECC • 2x256GB SSD + 3x1.2TB SAS', 'راك Perla 27U (U24)', 'ETA #1169 (54,000 ج.م)', 'QTS Servers', 'مورد ومثبت بالراك'),
('hw-z440-1', 'HP Workstation Z440 #1', 'خادم Proxmox وDocker وخزنة الباك أب', 'Xeon E5-2697 v4 (18C) • 64GB ECC • 2x1TB NVMe + 4TB HDD', 'راك Perla 27U (U24/U23)', 'ETA #1169 (15,235 ج.م)', 'QTS Servers', 'مورد ومثبت بالراك'),
('hw-z440-2', 'HP Workstation Z440 #2', 'محطة المراقبة والتطوير (3 شاشات HP)', 'Xeon E5-2697 v4 • 16GB RAM • 3x HP 22" Monitors', 'مكتب 5 (غرفة التقنية)', 'ETA #1169 (15,235 ج.م)', 'QTS Servers', 'جاهز وشغال بمكتب 5'),
('hw-cisco-3850', 'Cisco Catalyst 3850-48P PoE+', 'السويتش المركزي للمقر', '48x 1G PoE+ • Dual 715W PSU • 4x 10G SFP+', 'راك Perla 27U (U26)', 'ETA #1172 (11,970 ج.م)', 'QTS Servers', 'مورد ومثبت بالراك'),
('hw-dell-optiplex-3', '3x Dell OptiPlex Core i5 (Gen 10)', 'محطات عمل العمليات والتحليل (مبدئياً)', 'Core i5 10th Gen + 3x HP 22" Webcam Monitors', 'غرفة العمليات + مكتب المحلل', 'ETA #1660751017094 (39,901 ج.م)', 'تكنو ستورز الدقي', 'مشغلة وموزعة (ومطلوب +5 أجهزة الآن)'),
('hw-printer-m404n', 'HP LaserJet Pro M404n', 'طابعة الليزر الشبكية المركزية', 'شبكية على المنفذ Gi1/0/7 (192.168.10.45)', 'مكتب 5', 'أصول المقر', 'HP', 'نشطة على الشبكة')
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  specs = EXCLUDED.specs,
  status = EXCLUDED.status;

-- 14. Legal Dossiers, Subsidiary Proposal & Kaggle Research
INSERT INTO public.meshawir_legal_dossiers (id, dossier_title, authority_name, case_reference, lead_counsel, status, action_required)
VALUES
('leg-1-valuetech', 'ملف تسوية/إنذار شركة قيمة تك وحماية السورس كود وKeystore', 'القضاء المدني / تسوية تعاقدية', 'خطة 7 أسابيع أو إنذار على يد محضر', 'أ/ محمد مصطفى (المحامي)', 'عاجل وقيد الحسم', 'ربط كل دفعة بتسليم السورس كود الفعلي ومفاتيح التوقيع'),
('leg-2-ltra', 'ملف ترخيص النقل الذكي والربط المباشر وفق قانون 87/2018 وقرار 2180/2019', 'جهاز تنظيم النقل البري (LTRA)', 'خطاب م/ ضياء الدين يوسف (24/05/2026)', 'أ/ محمد مصطفى (المحامي)', 'نشط ومستمر', 'استكمال الربط الإلكتروني عبر خوادم WE والالتزام بالمعايير'),
('leg-3-ip-itida', 'حماية الملكية الفكرية وإيداع البرمجيات والعلامات التجارية', 'هيئة ITIDA والسجل التجاري والشهر العقاري', 'حماية تطبيقات 4B ووكالة ودارو', 'أ/ محمد مصطفى (المحامي)', 'قيد التجهيز', 'استخراج شهادات الإيداع وإثبات التاريخ وإتمام رقم DUNS للمتاجر'),
('leg-4-hr-contracts', 'عقود الموظفين وإقرارات السرية NDA وعهدة الأجهزة والخطوط الرسمية', 'الشؤون القانونية والاتصالات', 'خطوط المحمول والأرضي للمقر', 'أ/ محمد مصطفى (المحامي)', 'جاري التنفيذ', 'توثيق عقود الكول سنتر وعهدة الأجهزة واستكمال ملفات المحمول والأرضي')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  action_required = EXCLUDED.action_required;

INSERT INTO public.meshawir_subsidiary_proposals (id, proposal_title, recipient_investor, proposed_by, strategic_objectives, corporate_structure, status)
VALUES (
  'sub-abu-khaled-1',
  'مقترح تأسيس الشركة التابعة التكنولوجية خارج القاهرة (مملوكة لأبو خالد)',
  'أبو خالد',
  'المهندس سامح يس',
  '["1- فصل المخاطر وحماية أصول البرمجيات","2- بناء ذراع تطوير داخلي يغني عن المطورين الخارجيين","3- تقديم خدمات التحول الرقمي والأمن السيبراني","4- إدارة أساطيل ومكاتب المحافظات خارج القاهرة","5- احتضان الملكية الفكرية وبراءات الاختراع بـ ITIDA","6- تصدير البرمجيات للخليج وأوروبا ولندن","7- التعاقدات الحكومية ومناقصات البنية التحتية","8- توحيد توريدات العتاد والكاميرات للمجموعة","9- تأسيس أكاديمية تدريب وتأهيل هندسي","10- مظلة استثمارية مرنة لجذب الشركاء مستقبلاً"]'::jsonb,
  '{"summary":"4 مهندسين أساسيين + 2 استشاريين (بانتظار حسم الاسم التجاري ونسب الشراكة)"}'::jsonb,
  'قيد الدراسة مع أبو خالد والمحامي'
)
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  strategic_objectives = EXCLUDED.strategic_objectives;

INSERT INTO public.meshawir_kaggle_research (id, paper_title, track_name, deadline_date, primary_author, abstract_text, framework_model, submission_status)
VALUES (
  'kag-white-lion',
  'The White Lion & UCP-LLM: Epistemic Engineering Constraints for Local Gemma 4 Agents (Kaggle $100k)',
  'Kaggle Paper Track ($100,000)',
  '2026-10-17',
  'المهندس سامح يس',
  'دمج التفسير الرمزي والانضباط اللغوي مع هندسة القيود الرقمية الصارمة عبر 25 قسماً في بروتوكول UCP-LLM مع حالة دراسية هندسية تحقق وفورات 80–120 ألف ج.م سنوياً، وأداة Eve v1.1.0.',
  'UCP-LLM (25 Sections: 20 Leadership/Equine/Calm/Stage + 5 Tech) + Gemma 4 LoRA/Unsloth + Eve v1.1.0',
  'خطة 17 يوماً حتى 17 أكتوبر'
)
ON CONFLICT (id) DO UPDATE SET
  paper_title = EXCLUDED.paper_title,
  submission_status = EXCLUDED.submission_status;

-- 15. Executive Project Tasks (13 Tasks with Due Dates)
INSERT INTO public.project_tasks (id, task_number, project_id, category, title, description, priority, status, due_date, assigned_to)
VALUES
('t-01', 1, 'proj-maadi-hq', 'تسليم إدارة الفرع للمهندس عماد', 'استلام إدارة فرع المعادي كاملة (الصلاحيات، 2FA، الباسوردات عبر الخزنة المشفرة، ومفاتيح الغرفة والراك)', 'نقل صلاحيات WE وEC وZoho وGitHub وSupabase وTP-Link ER8411 وGrandstream 604A للمهندس عماد الشرقاوي.', 'عاجلة جداً', 'in_progress', '2026-11-28', 'المهندس عماد الشرقاوي والمهندس سامح يس'),
('t-02', 2, 'proj-maadi-hq', 'الشبكات والفايروول الجديد', 'اعتماد توثيق وضبط سياسات TP-Link ER8411 المشتَرى فعلياً (خط أرضي 1 WE ADSL + Vodafone 5G + VLANs)', 'تأكيد قواعد التوجيه والـ Failover وتجهيز المنفذ الثالث لوصول خط فايبر WE L3VPN.', 'عاجلة جداً', 'completed', '2026-11-20', 'المهندس عماد الشرقاوي والمهندس سامح يس'),
('t-03', 3, 'proj-maadi-hq', 'السنترال الجراند ستريم 604A', 'إتمام إعدادات التحويلات (100-116)، رسالة IVR، طابور الكول سنتر، وتسجيل المكالمات على Grandstream 604A', 'السنترال راكب وشغال مع الخط الأرضي الثاني؛ مطلوب إغلاق تذكرة MSH-IT-2026-084 وأخذ نسخة Backup.', 'عاجلة جداً', 'in_progress', '2026-11-29', 'المهندس عماد الشرقاوي وم/ موفق'),
('t-04', 4, 'proj-maadi-hq', 'عتاد واستكمال غرفة السيرفرات', 'شراء UPS 1500VA وتكييف 24/7 لغرفة السيرفرات + طفاية حريق غازية + 5 أجهزة Dell إضافية للكول سنتر', 'استكمال أمان الغرفة وتشغيل 8 مقاعد فورية في القاعة الكبرى ثم التوسع إلى 17.', 'عاجلة جداً', 'pending', '2026-11-18', 'المهندس عماد الشرقاوي والأستاذ هاني'),
('t-05', 5, 'proj-maadi-hq', 'تمديدات المقر والكاميرات', 'إنهاء تأريج نقاط القاعة الـ 17 مع حاتم الفني، وإنهاء تركيب 16 كاميرا 5MP (منها 4 صوتية) مع م/ علي', 'ربط الكاميرات على VLAN 20 وتفعيل Hik-Connect للقيادات.', 'عاجلة جداً', 'in_progress', '2026-12-01', 'المهندس عماد الشرقاوي وحاتم وم/ علي'),
('t-06', 6, 'proj-maadi-hq', 'الشؤون المالية والفواتير', 'تحويل إذن المنشاوي النقدي المؤقت (8,510 ج.م) لفاتورة ضريبية ETA واستخراج فيزا الشركة الرسمية', 'إقفال العهدة ومراجعة فرق البنود وتجديد نطاق mashawer.com.eg لسنتين.', 'عالية', 'in_progress', '2026-11-27', 'الأستاذ هاني والمهندس سامح يس'),
('t-07', 7, 'proj-4b', 'استضافة WE والـ VPN والتراخيص', 'استلام الـ 3 خوادم السحابية + F5 WAF + 7 حسابات SSL VPN + فايبر 24Mbps + ربط LTRA وتجربة الفشل DR (< 5ms)', 'تنسيق مباشر مع م/ أحمد محرم وم/ أحمد غريب في WE والمحامي أ/ محمد مصطفى.', 'عاجلة جداً', 'in_progress', '2026-11-30', 'المهندس عماد الشرقاوي وم/ أحمد محرم والمحامي'),
('t-08', 8, 'proj-4b', 'إغلاق الثغرات البرمجية لـ 4B', 'إلزام قيمة تك بإدارة حالة الرحلة والسعر من السيرفر، مؤقت 60ث للـ OTP، انتهاء المزايدة 15ث، وتأمين Webhook فوري', 'وإصلاح FCM OAuth2 وخريطة Google Maps للأدمن وطوابير BullMQ ونشر CompreFace محلياً.', 'عاجلة جداً', 'in_progress', '2026-11-26', 'المهندس سامح يس وم/ علي QA وقيمة تك'),
('t-09', 9, 'proj-daro', 'دارو Daro (مؤجل مؤقتاً بعد 4B)', 'معالجة ملاحظات Figma الـ 8 في تطبيق دارو للزوار والسياح وطيران مصر الداخلي بعد استلام وتشغيل 4B', 'حل تناقض الأسعار والأدوار الـ 5 وضمان طيران داخلي فقط داخل مصر (Amadeus / EgyptAir NDC) وتفعيل تدقيق قيمة تك بعد إعادة ضبط الـ Quota.', 'عالية', 'pending', '2027-01-15', 'المهندس سامح يس وأبو خالد وقيمة تك'),
('t-10', 10, 'proj-wekala', 'وكالة WeKaLa (مؤجل مؤقتاً بعد 4B)', 'استلام السورس كود وKeystore لسوق وكالة الإلكتروني (بيع/مزاد/مقايضة) وحسم العمولات والضمان بعد 4B', 'فصل نموذج Marketplace الكامل لـ WeKaLa عن تطبيقات النقل واعتماد العمولات مالياً لاحقاً.', 'عالية', 'pending', '2027-01-10', 'المهندس سامح يس والأستاذ هاني والمحامي'),
('t-11', 11, 'proj-maadi-hq', 'خزنة النسخ الاحتياطي الليلي', 'برمجة سحب نسخة ليلية تلقائية الساعة 3:00 ص من سحابة WE وGitHub إلى R640 / Z440 محلياً بالمعادي', 'مع نسخة أسبوعية احتياطية إضافية وإلغاء Active Directory المحلي نهائياً.', 'عالية', 'pending', '2026-12-05', 'المهندس عماد الشرقاوي والمهندس سامح يس'),
('t-12', 12, 'proj-agouza-restaurant', 'توريدات مطعم العجوزة', 'اعتماد وتركيب نظام POS الكاشير والطابعات و14 كاميرا مراقبة بمطعم العجوزة عبر م/ علي الأصدقاء', 'بإشراف الأستاذ هاني وأبو خالد مع فصل الحسابات تماماً عن مشاوير.', 'متوسطة', 'in_progress', '2026-12-10', 'الأستاذ هاني وأبو خالد وم/ علي'),
('t-13', 13, 'proj-kaggle-ucp', 'تسليم مسابقة كاجل ($100k)', 'إنهاء تجارب Gemma 4 LoRA/Unsloth والورقة البحثية The White Lion وبروتوكول UCP-LLM قبل 17 أكتوبر', 'مع الحفاظ على نسخ محلية منظمة وعدم تداخلها مع بيئة مشاوير.', 'عاجلة جداً', 'in_progress', '2026-10-17', 'المهندس سامح يس')
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  priority = EXCLUDED.priority,
  status = EXCLUDED.status,
  due_date = EXCLUDED.due_date,
  assigned_to = EXCLUDED.assigned_to,
  updated_at = NOW();

-- 16. General Ledger Summary (11 Items)
INSERT INTO public.meshawir_general_ledger (id, item_number, category, title, detail, amount_egp, invoice_ref, status, date_recorded)
VALUES
('gl-01', 1, 'servers_hw', 'فاتورة QTS #1169 (R640 + 2x Z440)', 'سيرفر ديل بلاتينيوم + محطتا عمل HP Z440 شاملة الضريبة', 96295.80, '7ZYZDKGHRVSDN70R4SP81F3M10', 'مدفوعة', '2026-09-26'),
('gl-02', 2, 'network_hw', 'فاتورة QTS #1172 (Cisco 3850 48P)', 'سويتش سيسكو 48 منفذ PoE+ بباور مزدوج شاملة الضريبة', 11970.00, 'K1G9T4WV39B521M0EYV8EM3M10', 'مدفوعة', '2026-09-28'),
('gl-03', 3, 'workstations', 'فاتورة تكنو ستورز الدقي', '3 أجهزة Dell i5 الجيل 10 + 3 شاشات HP بكاميرا + ملحقات', 39901.14, '2YMG3N8EF4WVMEB3V67G7PTK10', 'مدفوعة', '2026-06-09'),
('gl-04', 4, 'rack_cabling', 'فاتورة رد لاين البستان #15947', 'راك بيرلا 27U عمق 1000 + I-Pook PK65H + أدوات كبس', 18550.00, '6T3HM2FA86TEDZEBQHYPFWMK10', 'مدفوعة', '2026-03-29'),
('gl-05', 5, 'storage_cables', 'إذن المنشاوي النقدي #001096 (مؤقت)', 'هاردات HP SAS 1.2TB/2TB وكابلات (بانتظار تحويله لفاتورة ضريبية)', 8510.00, '#001096', 'مدفوعة - مؤقتة', '2026-09-28'),
('gl-06', 6, 'telecom', 'فاتورة فودافون صقر قريش #748994', 'راوتر H153-381 + شريحة + باقة 520 ج.م', 3326.46, '#748994', 'مدفوعة', '2026-09-28'),
('gl-07', 7, 'furniture', 'فاتورة طيبة رنين الفسطاط', 'سلم 6 درجات + 4 كراسي راتان + طاولة', 2951.00, '34GAMWHCFDFNTGX5QWDGJ8PK10', 'مدفوعة', '2026-03-26'),
('gl-08', 8, 'domains_hosting', 'فواتير EC (#1331 و #1325)', 'استضافة Host1 (2,508 ج.م) + دومين mashawer.com.eg (1,254 ج.م)', 3762.00, 'TX-43672852285', 'مدفوعة حتى 2027', '2026-08-11'),
('gl-09', 9, 'cctv', 'عرض الأصدقاء (كاميرات المعادي)', '16 كاميرا Hikvision + NVR 4K + 4TB Purple + تمديدات', 55050.00, 'PO-FRIENDS-55050', 'معتمد وقيد التعديل', '2026-09-24'),
('gl-10', 10, 'we_telecom', 'أمر شراء WE L3VPN (order#6078927)', 'فايبر 24Mbps للمقر + 6 فروع محافظات 4Mbps (سنوي)', 360000.00, 'order#6078927', 'معتمد وموقع', '2026-09-29'),
('gl-11', 11, 'we_cloud', 'أمر شراء WE Cloud & WAF (order#6078933)', '3 خوادم 4B + 20Mbps + F5 WAF + 7 SSL VPN + باك أب 30 يوم (سنوي)', 807496.00, 'order#6078933', 'معتمد وموقع', '2026-09-29')
ON CONFLICT (id) DO UPDATE SET
  amount_egp = EXCLUDED.amount_egp,
  status = EXCLUDED.status;

-- 17. Strategic Inquiries (5 Key Decisions)
INSERT INTO public.system_inquiries (id, question, context, category, urgency, options, answered, answer)
VALUES
('inq-01', 'حسم عنوان الشبكة الخارجي للعمل عن بُعد (Static Public IP vs DDNS) لـ ER8411 وGrandstream Wave؟', 'الاتجاه الأحدث في 25 نوفمبر 2026: شراء Static Public IP من مزود الخدمة مع دراسة WireGuard VPN لـ 25–30 موظفاً عن بُعد على Wave', 'الشبكات والأمان والسنترال', 'critical', '["اعتماد Static Public IP + WireGuard VPN على ER8411 وعزل Wave للسنترال فقط","الاعتماد على DDNS / RemoteConnect دون Static IP"]'::jsonb, TRUE, 'القرار المعتمد: شراء Static Public IP ودراسة/تنفيذ WireGuard VPN على TP-Link ER8411 لـ 25–30 مستخدماً مع عزل SIP/RTP'),
('inq-02', 'كيف نغلق فجوات 4B قبل الإطلاق التجاري وتنفيذ GPS Integrity Test رقم 01؟', 'اختبار 23 نوفمبر تم على محاكي API 37 ولا يثبت أمان GPS الحقيقي ولا يعوّض تجربة كابتن + عميل على هاتف حقيقي', 'تطبيق 4B وكابتن مشاوير', 'critical', '["تنفيذ GPS Integrity Test 01 على هاتف حقيقي + اختبار رحلة كاملة + إغلاق FCM/Maps/Fawry/CompreFace","الاعتماد على نتائج المحاكي الحالية"]'::jsonb, FALSE, NULL),
('inq-03', 'نطاق إطلاق دارو (Daro Super App للزوار والسياح) ومشاكل Figma الـ 8', 'Daro موجه للزوار العرب والسياح وطيرانه داخلي داخل مصر فقط (Amadeus / EgyptAir NDC)، ومؤجل لحين استلام 4B', 'تطبيق دارو (مؤجل)', 'medium', '["إبقاء Daro مؤجلاً حتى تشغيل 4B ثم حل الـ 8 عيوب في Figma","تشغيل مسار تطوير موازٍ الآن"]'::jsonb, TRUE, 'مؤجل مؤقتاً حتى استلام وتشغيل 4B والتركيز الكامل بالمعادي على 4B'),
('inq-04', 'تحديد الإجراء القانوني والتقني مع شركة قيمة تك واستلام الأصول الـ 12', 'متابعة تسليم السورس كود الفعلي ومفاتيح Keystore وAPNs .p8 وأكواد Daro وWeKaLa', 'قانوني وحوكمة الأصول', 'critical', '["ربط أي دفعات بتسليم الأصول الـ 12 والـ Keystore فعلياً أو إنذار محضر","ملحق جدولة جديد دون تسليم الكود الآن"]'::jsonb, FALSE, NULL),
('inq-05', 'تأكيد نطاق وحجم تمويل 4B Prepaid Trips وعرض لامبادا/Ocean Foods', 'السابقة التاريخية (100,000 ج.م / 1,000 كوبون بحد أقصى 90 ج.م) لا يثبت توقيع عقد نهائي حتى الآن', 'المسار التجاري B2B', 'high', '["حسم التعاقد الرسمي والفصل المحاسبي السبعـي مع CFO أ/ هاني","إبقاؤها قيد التطوير دون طرح تجاري"]'::jsonb, FALSE, NULL)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  context = EXCLUDED.context,
  options = EXCLUDED.options,
  answered = EXCLUDED.answered,
  answer = EXCLUDED.answer;

-- 18. 30-Point Verification Matrix
INSERT INTO public.meshawir_verification_checks (id, num, category, title, status, context_note, verification_note)
VALUES
('v-01', 1, 'شركة التطوير والتنفيذ', 'وضع التعاقد الفعلي النهائي مع شركة التطوير (قيمة تك) ونسب السداد المتبقية', 'يحتاج تحققاً', 'خطة 7 أسابيع M1–M5 وإنذار قيد الحسم', ''),
('v-02', 2, 'كود تطبيق 4B', 'استلام ومراجعة كود 4B العملاء الفعلي كاملاً ومقارنته مع Figma', 'قيد التنفيذ', 'يُمنع الخلط بين اكتمال Figma (95%) وجاهزية الكود الحي', ''),
('v-03', 3, 'كود كابتن مشاوير', 'استلام ومراجعة كود تطبيق كابتن مشاوير الفعلي وفحص فجواته', 'قيد التنفيذ', 'تطبيق مستقل عن تطبيق العملاء', ''),
('v-04', 4, 'أصول 4B ودارو ووكالة', 'الجرد الفعلي للأصول الرقمية الـ 12 (GitHub، السيرفرات، النطاقات، المتاجر، Keystore)', 'يحتاج تحققاً', 'حاسم قبل سداد أي دفعة أخيرة للمطور الخارجي', ''),
('v-05', 5, 'تراخيص LTRA', 'الموقف التنفيذي الحالي لملف جهاز تنظيم النقل البري LTRA والربط الإلكتروني الفعلي', 'قيد التنفيذ', 'قانون 87/2018 وقرار 2180/2019 عبر خوادم WE', ''),
('v-06', 6, 'أمان GPS', 'نتائج اختبار GPS Integrity Test رقم 01 على هاتف Android حقيقي بعيداً عن المحاكي', 'يحتاج تحققاً', 'تجربة 23 نوفمبر على Emulator API 37 غير صالحة كإثبات أمان', ''),
('v-07', 7, 'اختبار الرحلة الكامل', 'تجربة رحلة حقيقية كاملة End-to-End بين كابتن وعميل ولوحة تحكم على أجهزة حقيقية', 'يحتاج تحققاً', 'من الطلب حتى القبول والتنفيذ والانتهاء والتسوية', ''),
('v-08', 8, 'التحقق من الوجه CompreFace', 'جاهزية CompreFace وLiveness محلياً على WE / MIST + اعتماد مدة الاحتفاظ 1–3 أسابيع قانونياً', 'قيد التنفيذ', 'Isolated VM + Docker + Ubuntu + Internal VPN + Firewall', ''),
('v-09', 9, 'إشعارات Firebase & APNs', 'تحقق عمل إشعارات الدفع على Android وiOS (مفتاح .p8 وعدم رفعه على GitHub + FCM OAuth2)', 'قيد التنفيذ', 'اختبار iPhone فعلي في وضع Background و Terminated', ''),
('v-10', 10, 'فئات المركبات والأسعار', 'حسم فروق التسعير بين الملاكي العادي و VIP والحد الأدنى لسنة صنع 7 راكب (2022/2023+)', 'يحتاج تحققاً', 'تأكيد منع ربط فئة Pickup برحلات الركاب داخل التطبيق', ''),
('v-11', 11, 'الاشتراكات والباقات', 'اعتماد باقات اشتراكات 4B الرسمية (الشرائح والأسعار والحدود)', 'يحتاج تحققاً', 'واردة في قائمة المزايا دون أسعار معتمدة نهائياً', ''),
('v-12', 12, 'بوابات الدفع الإلكتروني', 'حالة الربط الحي والإنتاجي لكل من Fawry وPaymob وVodafone Cash وInstaPay', 'يحتاج تحققاً', 'لم يثبت التشغيل الإنتاجي الكامل لأي منها حتى الآن', ''),
('v-13', 13, '4B Prepaid Trips', 'اعتماد الاسم الرسمي وشكل العقد والأسعار لمنظومة كوبونات الشركات B2B', 'قيد التنفيذ', 'عدم الخلط مع 4B Digital Trips ولا مع وكالة إعلانات', ''),
('v-14', 14, 'سابقة لامبادا / Ocean Foods', 'التحقق من موقف التعاقد النهائي مع لامبادا / أوشن فودز (100 ألف / 1,000 كوبون)', 'يحتاج تحققاً', 'لا يوجد حتى الآن إثبات لتوقيع عقد نهائي مكتمل', ''),
('v-15', 15, 'الفصل المحاسبي للكوبونات', 'تطبيق البنود المحاسبية السبعة في تقارير 4B Prepaid Trips بمراجعة المدير المالي', 'قيد التنفيذ', 'فصل Sold / خصم 4B / خصم المشتري / الكباتن / الإصدار / الإيراد / غير المستخدم', ''),
('v-16', 16, 'تغطية Add Stop vs Shared Load', 'مراجعة تغطية Add Stop لكل سيناريوهات التوصيل متعدد المحطات دون ازدواج', 'مؤكد', 'Add Stop قائمة فعلاً؛ Shared Load لا تُقترح كفكرة جديدة', ''),
('v-17', 17, 'وضع تشغيل المعادي وفريق التسويق', 'تحقق التعاقد الفعلي مع الـ 4 مسوقين (Freelance/Part-time) وحسم الميزانيات 45k/70k/25k', 'يحتاج تحققاً', 'تضارب ميزانيات تاريخية يحتاج اعتماد CFO', ''),
('v-18', 18, 'قرار Static Public IP', 'تنفيذ شراء Static Public IP من مزود الخدمة وتفعيله على WAN1 في TP-Link ER8411', 'مؤكد', 'القرار الأحدث يغني عن الاعتماد الأساسي على DDNS', ''),
('v-19', 19, 'WireGuard + Grandstream Wave', 'اختبار ربط 25–30 مستخدماً عن بُعد عبر WireGuard على ER8411 نحو Grandstream 604A فقط', 'قيد التنفيذ', 'عزل VLAN 30 ومنع فتح SIP/RTP للإنترنت العام', ''),
('v-20', 20, 'جرد السيرفرات التاريخي Dell R730', 'التحقق من مصير ومكان Dell PowerEdge R730 + Windows Server + 20 CALs مقارنةً بـ R640', 'يحتاج تحققاً', 'مرجع قديم بالملف لا يُفترض دمجه بالراك دون فحص ميداني', ''),
('v-21', 21, 'الشبكة والـ FortiGate و ISO 27001', 'حسم خطة FortiGate / Grade A وتوضيح عدم حصول الشركة على ISO 27001 حتى الآن', 'يحتاج تحققاً', 'ISO 27001 هدف مستقبلي وليست شهادة قائمة', ''),
('v-22', 22, 'تجهيزات غرفة السيرفرات', 'إغلاق نواقص الغرفة: UPS 1500VA، تكييف 24/7، وطفاية الحريق الغازية', 'قيد التنفيذ', 'مؤمن بالكابينة بانتظار التوريد النهائي للـ UPS', ''),
('v-23', 23, 'فواتير إذن المنشاوي والأصدقاء', 'تحويل إذن المنشاوي (8,510 ج.م) لفاتورة ضريبية ETA وحسم فرق كاميرات 2MP/5MP', 'يحتاج تحققاً', 'متابعة المدير المالي أ/ هاني والمهندس عماد الشرقاوي', ''),
('v-24', 24, 'استعادة تحليل Daro من قيمة تك', 'متابعة استئناف مراجعة Daro Figma (المتوقف عند 44 دقيقة) بعد تجديد Quota في 30 نوفمبر', 'مؤجل', 'مؤجل لما بعد تشغيل واستقرار 4B', ''),
('v-25', 25, 'عيوب Daro الثمانية والطيران الداخلي', 'تصحيح تناقض الأرقام الـ 8 في Figma وحصر تكامل Amadeus/EgyptAir على مصر داخلياً فقط', 'مؤجل', 'يستهدف الزوار العرب والسياح بمصر فقط', ''),
('v-26', 26, 'نموذج عمولات WeKaLa', 'تحديد رسوم الإعلانات والمزادات والضمان والبيع والشراء في منصة وكالة Marketplace', 'مؤجل', 'مؤجل لما بعد تشغيل 4B بدون تشغيل فريق مستقل الآن', ''),
('v-27', 27, 'متاجر التطبيقات ورقم DUNS', 'تأكيد إتمام رقم D-U-N-S وحالة حسابات Apple Developer و Google Play لشركة مشاوير', 'يحتاج تحققاً', 'ذُكر قيد الاستخراج في أكتوبر ويحتاج توثيق الرقم', ''),
('v-28', 28, 'المقترحات التجارية غير المعتمدة', 'عرض 4B Exchange و Route Club و Guaranteed Ride و Neighborhood Logistics على المالك لاحقاً', 'مقترح', 'لا تدخل في خطة الإطلاق الأولى الحالية', ''),
('v-29', 29, 'الكيانات المقترحة ومطعم العجوزة', 'تأكيد فصل حسابات مطعم العجوزة بالكامل وإبقاء المصرية الكويتية/الشركة التابعة كمقترح', 'مؤكد', 'العجوزة بإدارة أ/ هاني CFO منفصل تماماً عن مشاوير', ''),
('v-30', 30, 'المسودات القانونية المؤقتة', 'تحويل كافة نماذج العقود المؤقتة وNDA لمراجعة الأستاذ محمد مصطفى للاعتماد النهائي', 'يحتاج تحققاً', 'النماذج المؤقتة للتجهيز الداخلي وليست مستنداً نهائياً', '')
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  status = EXCLUDED.status,
  context_note = EXCLUDED.context_note,
  updated_at = NOW();

-- 19. All 105 Joint Work Items (Eng. Emad El-Sharkawy & Eng. Sameh Youss)
INSERT INTO public.meshawir_joint_tasks (id, section, title, status, owner)
VALUES
(1, 'العتاد والراك', 'شراء واعتماد سيرفر ديل بلاتينيوم Dell PowerEdge R640', 'تم', 'م/ سامح يس + شركة QTS'),
(2, 'العتاد والراك', 'شراء وتوريد جهازي HP Workstation Z440 (معالج Xeon 18-Core)', 'تم', 'م/ سامح يس + شركة QTS'),
(3, 'العتاد والراك', 'شراء واعتماد سويتش سيسكو 48 بورت Cisco Catalyst 3850 PoE+', 'تم', 'م/ عماد الشرقاوي + م/ سامح يس'),
(4, 'العتاد والراك', 'توريد كابينة راك بيرلا 27U أرضي عمق 1000 مم للغرفة المستقلة', 'تم', 'رد لاين البستان + م/ سامح'),
(5, 'العتاد والراك', 'توريد جهاز فحص وتتبع الكابلات I-Pook PK65H وأراجة Root 2*1', 'تم', 'رد لاين البستان'),
(6, 'العتاد والراك', 'شراء وتوريد هاردات سيرفر HP (سعة 1.2TB و 2TB SAS)', 'تم', 'المنشاوي البستان'),
(7, 'العتاد والراك', 'شراء وتوريد 3 أجهزة كمبيوتر DELL Core i5 الجيل العاشر', 'تم', 'تكنو ستورز الدقي'),
(8, 'العتاد والراك', 'شراء وتوريد 3 شاشات HP 22 بوصة بكاميرا مدمجة', 'تم', 'تكنو ستورز الدقي'),
(9, 'العتاد والراك', 'تثبيت الباور سبلاي المزدوج 715W لسويتش سيسكو 3850', 'تم', 'م/ عماد الشرقاوي + م/ أحمد عبيد'),
(10, 'العتاد والراك', 'توريد وحدة PDU سيرفرية 8 منافذ لتنظيم كهرباء الراك', 'تم', 'رد لاين'),
(11, 'العتاد والراك', 'شراء جهاز مزود طاقة غير منقطع UPS 1500VA لغرفة السيرفرات', 'لم يتم', 'م/ سامح يس + أ/ هاني'),
(12, 'العتاد والراك', 'تركيب الباتش بانل 24 بورت وترتيب أسلاك الراك المنظم', 'جاري التنفيذ', 'م/ عماد الشرقاوي + حاتم الفني'),
(13, 'العتاد والراك', 'توسيع ذاكرة سيرفر Dell R640 من 64GB إلى 128GB ECC', 'لم يتم', 'م/ سامح يس'),
(14, 'العتاد والراك', 'تركيب شاشات المراقبة الـ 3 على جهاز الـ Z الثاني بمكتب الـ IT', 'جاري التنفيذ', 'م/ سامح يس'),
(15, 'الأنظمة والخوادم المحلية', 'اعتماد تثبيت نظام Proxmox VE 8.x كنظام تشغيل أساسي لجهاز الـ Z', 'تم', 'م/ عماد الشرقاوي + م/ سامح يس'),
(16, 'الأنظمة والخوادم المحلية', 'تنزيل وتهيئة جدار الحماية المفتوح OPNsense كـ Virtual Machine', 'جاري التنفيذ', 'م/ سامح يس'),
(17, 'الأنظمة والخوادم المحلية', 'تهيئة نظام تسجيل كاميرات المراقبة الداخلي NVR على الـ Z', 'جاري التنفيذ', 'م/ سامح يس'),
(18, 'الأنظمة والخوادم المحلية', 'بناء بيئة حاويات Docker & Portainer لاستضافة التطبيقات الداخلية', 'جاري التنفيذ', 'م/ سامح يس'),
(19, 'الأنظمة والخوادم المحلية', 'دراسة جدوى تراخيص ميكروسوفت سيرفر لكل كور مقابل البرمجيات الحرة', 'تم', 'م/ سامح يس'),
(20, 'الأنظمة والخوادم المحلية', 'تثبيت نظام Ubuntu Server 24.04 LTS على سيرفر Dell R640', 'لم يتم', 'م/ عماد الشرقاوي + م/ سامح يس'),
(21, 'الأنظمة والخوادم المحلية', 'ضبط خادم PostGIS 16 و Redis 7 لقواعد البيانات الجغرافية', 'جاري التنفيذ', 'م/ سامح يس'),
(22, 'الأنظمة والخوادم المحلية', 'إعداد سكربت النسخ الاحتياطي التلقائي اليومي (Automated Backup)', 'لم يتم', 'م/ سامح يس'),
(23, 'الشبكات والكابلات', 'اختبار تشغيل بورتات PoE الـ 48 بسويتش سيسكو 3850', 'تم', 'م/ عماد الشرقاوي + م/ أحمد عبيد'),
(24, 'الشبكات والكابلات', 'تقسيم شبكات الـ VLANs المعزولة (كاميرات، موظفين، سيرفرات، ضيوف)', 'جاري التنفيذ', 'م/ عماد الشرقاوي + م/ سامح يس'),
(25, 'الشبكات والكابلات', 'سحب كابلات Cat6 داخل السقف المعلق لمكاتب المقر', 'جاري التنفيذ', 'حاتم الفني + م/ علي'),
(26, 'الشبكات والكابلات', 'تأريج وربط نقاط الإنترنت الـ 17 بالقاعة الكبرى للموظفين', 'لم يتم', 'حاتم الفني'),
(27, 'الشبكات والكابلات', 'تركيب مخرج شبكة مزدوج بغرفة السيرفرات ومكتب الإدارة', 'جاري التنفيذ', 'حاتم الفني'),
(28, 'الشبكات والكابلات', 'شراء سلم معدني 6 درجات مخصص لصيانة الكابلات بالأسقف (طيبة رنين)', 'تم', 'م/ سامح يس'),
(29, 'الشبكات والكابلات', 'اختبار مسارات الكابلات وتأكيد سلامتها بجهاز I-Pook Tracker', 'جاري التنفيذ', 'حاتم الفني + م/ عماد'),
(30, 'الشبكات والكابلات', 'توريد وتركيب راوتر فودافون 4G هوائي وشريحة باقة المقر المؤقتة', 'تم', 'م/ سامح يس'),
(31, 'المصرية للاتصالات WE', 'طلب واعتماد عرض خادم 4B السحابي بمركز بيانات القرية الذكية', 'تم', 'م/ سامح يس + م/ أحمد غريب'),
(32, 'المصرية للاتصالات WE', 'توقيع أمر الشراء النهائي لخادم 4B بقيمة 8,500 ج.م/شهرياً', 'جاري التنفيذ', 'م/ سامح يس + أ/ أبو خالد'),
(33, 'المصرية للاتصالات WE', 'اعتماد تفعيل جدار الحماية F5 WAF للخادم السحابي', 'تم', 'المصرية للاتصالات WE'),
(34, 'المصرية للاتصالات WE', 'دراسة خط التجميع الفايبر المركزي 24Mbps لمقر المعادي', 'تم', 'م/ عماد الشرقاوي + م/ سامح يس'),
(35, 'المصرية للاتصالات WE', 'توقيع تعاقد خط الفايبر المركزي 24Mbps بقيمة 360 ألف ج.م', 'لم يتم', 'أ/ أبو خالد + م/ سامح'),
(36, 'المصرية للاتصالات WE', 'تجهيز خطوط L3VPN الفرعية لـ 6 محافظات بسرعة 4Mbps', 'لم يتم', 'المصرية للاتصالات WE'),
(37, 'المصرية للاتصالات WE', 'فصل وتأجيل تكلفة الربط مع الجهات الخارجية لحساب مستقل', 'تم', 'م/ سامح يس'),
(38, 'المصرية للاتصالات WE', 'التنسيق التقني مع م/ أحمد محرم لتجهيز بيئة الـ Production', 'جاري التنفيذ', 'م/ سامح يس'),
(39, 'كاميرات المراقبة', 'اعتماد عرض توريد منظومة كاميرات المعادي (شركة الأصدقاء - 55,050 ج.م)', 'تم', 'م/ سامح يس + بشمهندس علي'),
(40, 'كاميرات المراقبة', 'توريد 16 كاميرا مراقبة Hikvision بدقة 5 ميجابكسل', 'تم', 'بشمهندس علي (الأصدقاء)'),
(41, 'كاميرات المراقبة', 'توريد جهاز تسجيل شبكي NVR 16 قناة 4K وهارد 4TB Purple', 'تم', 'بشمهندس علي'),
(42, 'كاميرات المراقبة', 'تركيب الـ 4 كاميرات الصوتية (المدخل، السيرفرات، الإدارة، العمليات)', 'جاري التنفيذ', 'بشمهندس علي + حاتم الفني'),
(43, 'كاميرات المراقبة', 'تركيب الـ 12 كاميرا دوم وبوليت بالقاعة والممرات وبوابات الخروج', 'جاري التنفيذ', 'بشمهندس علي'),
(44, 'كاميرات المراقبة', 'ربط الكاميرات بسويتش سيسكو 3850 PoE وتخصيص VLAN مستقل', 'لم يتم', 'م/ عماد الشرقاوي + م/ سامح'),
(45, 'كاميرات المراقبة', 'اعتماد نفس مورد الكاميرات (م/ علي) لمطعم المشويات بالعجوزة', 'تم', 'م/ سامح يس + أ/ هاني'),
(46, 'كاميرات المراقبة', 'معاينة تمديدات كاميرات مطعم المشويات بالعجوزة على أرض الواقع', 'لم يتم', 'بشمهندس علي + م/ سامح'),
(47, 'تطبيقات 4B ووكالة ودارو', 'استلام حزمة التطبيق التجريبية 4B APK v1.4.2 بحجم 34.8 MB', 'تم', 'م/ سامح يس'),
(48, 'تطبيقات 4B ووكالة ودارو', 'استلام وفحص شاشات تصاميم Figma الرسمية لـ 4B', 'تم', 'م/ سامح يس'),
(49, 'تطبيقات 4B ووكالة ودارو', 'فحص واجهات الـ UI وتدفق طلب الرحلات داخلياً (UI Bug Bash)', 'جاري التنفيذ', 'م/ سامح يس + م/ علي QA'),
(50, 'تطبيقات 4B ووكالة ودارو', 'اعتماد بوابة الدفع الإلكتروني (Paymob / Fawry)', 'لم يتم', 'م/ سامح يس + أ/ أبو خالد'),
(51, 'تطبيقات 4B ووكالة ودارو', 'تحديد معدل بث إحداثيات GPS للكباتن (3 ثوانٍ أم 5 ثوانٍ أم ديناميكي)', 'لم يتم', 'م/ عماد الشرقاوي + م/ سامح يس'),
(52, 'تطبيقات 4B ووكالة ودارو', 'مراجعة خوارزمية التسعير الديناميكي (Surge Pricing) والمسافات', 'جاري التنفيذ', 'م/ سامح يس'),
(53, 'تطبيقات 4B ووكالة ودارو', 'اختبار حزمة الـ APK على هواتف كباتن تجريبية ميدانياً', 'لم يتم', 'م/ موفق (العمليات)'),
(54, 'تطبيقات 4B ووكالة ودارو', 'ربط واجهة التطبيق بخادم PostGIS بقاعدة بيانات مشاوير', 'جاري التنفيذ', 'م/ سامح يس'),
(55, 'تطبيقات 4B ووكالة ودارو', 'استلام حزمة APK التجريبية لتطبيق وكالة WeKaLa v1.2', 'تم', 'م/ سامح يس'),
(56, 'تطبيقات 4B ووكالة ودارو', 'فحص وتدقيق لوحة تحكم وكالة (Wekala Admin Panel)', 'تم', 'م/ سامح يس'),
(57, 'تطبيقات 4B ووكالة ودارو', 'استلام سورس كود Flutter الأصلي ومستودع GitHub لتطبيق وكالة', 'لم يتم', 'المطور السابق + م/ سامح'),
(58, 'تطبيقات 4B ووكالة ودارو', 'استلام وتأمين مفاتيح التوقيع الرقمي Keystore الخاصة بتطبيق وكالة', 'لم يتم', 'المطور السابق + المحامي'),
(59, 'تطبيقات 4B ووكالة ودارو', 'مراجعة شاشات فيجما الخاصة بتطبيق دارو للشحن اللوجستي', 'تم', 'م/ سامح يس'),
(60, 'تطبيقات 4B ووكالة ودارو', 'تحديد نوع أجهزة مسح الباركود لمحطات دارو (Handheld أم هواتف)', 'لم يتم', 'م/ سامح يس + أ/ هاني'),
(61, 'تطبيقات 4B ووكالة ودارو', 'اختبار تكامل مكتبة قراءة الباركود Google ML Kit مع تطبيق دارو', 'جاري التنفيذ', 'م/ سامح يس'),
(62, 'تطبيقات 4B ووكالة ودارو', 'توثيق سجلات عمولات الوكلاء ومحطات التوزيع في سوبابيز', 'تم', 'م/ سامح يس'),
(63, 'قيمة تك والقانونية والشركة', 'استلام وثيقة خطة الـ 7 أسابيع الرسمية من قيمة تك (5 محطات)', 'تم', 'م/ سامح يس'),
(64, 'قيمة تك والقانونية والشركة', 'تحليل بنود تسليم المرحلة الأولى M1 (التشغيل الأساسي)', 'تم', 'م/ سامح يس'),
(65, 'قيمة تك والقانونية والشركة', 'ربط صرف الدفعات المالية بمحاضر الاستلام الفني الصارمة', 'جاري التنفيذ', 'م/ سامح + أ/ هاني + المحامي'),
(66, 'قيمة تك والقانونية والشركة', 'المطالبة بدمج مرحلتي التشغيل الأساسي والتجاري لضغط المدة إلى 5 أسابيع', 'لم يتم', 'م/ سامح يس + قيمة تك'),
(67, 'قيمة تك والقانونية والشركة', 'استلام السورس كود الكامل لكل مرحلة ومطابقته برمجياً', 'جاري التنفيذ', 'م/ سامح يس'),
(68, 'قيمة تك والقانونية والشركة', 'مراجعة صلاحيات لوحة تحكم إدارة الرحلات والأسطول', 'جاري التنفيذ', 'م/ سامح يس'),
(69, 'قيمة تك والقانونية والشركة', 'عقد جلسة العمل القانونية مع المستشار أ/ محمد مصطفى', 'تم', 'م/ سامح يس + أ/ محمد مصطفى'),
(70, 'قيمة تك والقانونية والشركة', 'مراجعة الثغرات القانونية في عقود شركة قيمة تك', 'تم', 'أ/ محمد مصطفى'),
(71, 'قيمة تك والقانونية والشركة', 'صياغة محضر تسليم فني رسمي للسورس كود والمفاتيح مع قيمة تك', 'جاري التنفيذ', 'أ/ محمد مصطفى + م/ سامح'),
(72, 'قيمة تك والقانونية والشركة', 'استخراج شهادات إيداع الملكية الفكرية بهيئة ITIDA لتطبيقات مشاوير', 'لم يتم', 'أ/ محمد مصطفى'),
(73, 'قيمة تك والقانونية والشركة', 'توثيق البرمجيات بالسجل التجاري والشهر العقاري كأصول للشركة', 'لم يتم', 'أ/ محمد مصطفى + أ/ أبو خالد'),
(74, 'قيمة تك والقانونية والشركة', 'إعداد ملف شروط ترخيص النقل الذكي لدى وزارة النقل LTRA', 'جاري التنفيذ', 'م/ سامح + أ/ محمد مصطفى'),
(75, 'قيمة تك والقانونية والشركة', 'إعداد مذكرة الأهداف العشرة لتأسيس الشركة التكنولوجية التابعة', 'تم', 'م/ سامح يس'),
(76, 'قيمة تك والقانونية والشركة', 'عقد اجتماع مناقشة استراتيجية التوسع مع أ/ أبو خالد', 'تم', 'م/ سامح يس + أ/ أبو خالد'),
(77, 'قيمة تك والقانونية والشركة', 'تحديد الاسم التجاري المقترح للشركة التكنولوجية الجديدة', 'لم يتم', 'م/ سامح + أ/ أبو خالد'),
(78, 'قيمة تك والقانونية والشركة', 'حسم نسب الشراكة وتوزيع الحصص ومسودة عقد التأسيس', 'لم يتم', 'أ/ أبو خالد + م/ سامح'),
(79, 'قيمة تك والقانونية والشركة', 'اعتماد خطة بناء الفريق الداخلي (4 مطورين أساسيين + 2 مساعدين)', 'لم يتم', 'م/ سامح + أ/ أبو خالد'),
(80, 'قيمة تك والقانونية والشركة', 'اعتماد الميزانية الإجمالية لتجهيزات سيرفرات المقر وتطبيق 4B', 'تم', 'أ/ أبو خالد'),
(81, 'المالية والفواتير الضريبية', 'مطابقة الفاتورة الضريبية الرسمية لشركة QTS بالضرائب المصرية ETA (96,295 ج.م)', 'تم', 'أ/ هاني + م/ سامح'),
(82, 'المالية والفواتير الضريبية', 'مطابقة الفاتورة الضريبية لشركة رد لاين بالضرائب ETA (18,550 ج.م)', 'تم', 'أ/ هاني + م/ سامح'),
(83, 'المالية والفواتير الضريبية', 'مطابقة فاتورة تكنو ستورز الدقي بالضرائب ETA (39,901 ج.م)', 'تم', 'أ/ هاني'),
(84, 'المالية والفواتير الضريبية', 'مطابقة فاتورة سيسكو 3850 مع شركة QTS بالضرائب ETA (11,970 ج.م)', 'تم', 'أ/ هاني'),
(85, 'المالية والفواتير الضريبية', 'متابعة استلام الفاتورة الضريبية الرسمية من المنشاوي (بديلة الإيصال المؤقت 8,510 ج.م)', 'جاري التنفيذ', 'م/ سامح + أ/ هاني'),
(86, 'المالية والفواتير الضريبية', 'تخصيص بطاقة فيزا تجارية رسمية لسداد اشتراكات السيرفرات السحابية', 'لم يتم', 'أ/ هاني'),
(87, 'المالية والفواتير الضريبية', 'تجديد دومين mashawer.com.eg و دومين mashweer.net لعدة سنوات', 'لم يتم', 'أ/ هاني + م/ سامح'),
(88, 'النطاقات والبريد الإلكتروني', 'حجز وتوثيق النطاق الوطني الرسمي mashawer.com.eg', 'تم', 'المصرية EC + م/ سامح'),
(89, 'النطاقات والبريد الإلكتروني', 'تفعيل الـ 6 إيميلات المؤسسية الرسمية على الدومين الوطني', 'تم', 'المصرية EC + م/ سامح'),
(90, 'النطاقات والبريد الإلكتروني', 'تخصيص حصص البريد (10GB للإدارة و 5GB للأقسام)', 'تم', 'م/ سامح يس'),
(91, 'النطاقات والبريد الإلكتروني', 'ربط سجلات الـ DNS والـ MX Records وتأمين الـ SPF / DKIM', 'تم', 'م/ سامح يس'),
(92, 'النطاقات والبريد الإلكتروني', 'تسليم بيانات الدخول للبريد الإلكتروني للمسؤولين (أبو خالد، هاني، مصطفى، موفق)', 'جاري التنفيذ', 'م/ سامح يس'),
(93, 'تجهيزات مقر المعادي', 'اعتماد الرسم الهندسي المعماري الدقيق للمقر (25.91م × 20.94م)', 'تم', 'م/ سامح يس'),
(94, 'تجهيزات مقر المعادي', 'تسكين المكاتب 1 حتى 7 والقاعة الكبرى طبقاً للاحتياجات', 'تم', 'م/ سامح + أ/ أبو خالد'),
(95, 'تجهيزات مقر المعادي', 'تجهيز الباب المصفح وقفل الأمان لغرفة السيرفرات المستقلة', 'جاري التنفيذ', 'م/ سامح يس'),
(96, 'تجهيزات مقر المعادي', 'شراء أثاث المقر وكراسي العمل والترابيزات (طيبة رنين)', 'تم', 'م/ سامح يس'),
(97, 'تجهيزات مقر المعادي', 'تركيب تكييف مخصص مستمر العمل لغرفة السيرفرات 24/7', 'لم يتم', 'أ/ هاني + م/ سامح'),
(98, 'سوبابيز والأبحاث والاعتمادية', 'إنشاء مشروع سوبابيز الجديد المخصص لمنظومة مشاوير', 'جاري التنفيذ', 'م/ سامح يس'),
(99, 'سوبابيز والأبحاث والاعتمادية', 'ربط حساب سوبابيز بحساب GitHub للنشر التلقائي', 'جاري التنفيذ', 'م/ سامح يس'),
(100, 'سوبابيز والأبحاث والاعتمادية', 'تشغيل كود Master Schema SQL وإنشاء الجداول الـ 9 وسياسات RLS', 'تم', 'م/ سامح يس'),
(101, 'سوبابيز والأبحاث والاعتمادية', 'مزامنة بيانات المشاريع والسيرفرات والإيميلات والقرارات مع سوبابيز', 'تم', 'م/ سامح يس'),
(102, 'سوبابيز والأبحاث والاعتمادية', 'اعتماد عنوان الورقة البحثية لمسار كاجل Paper Track ($100k)', 'تم', 'م/ سامح يس'),
(103, 'سوبابيز والأبحاث والاعتمادية', 'صياغة مسودة الورقة البحثية والبروتوكول المعرفي قبل 17 أكتوبر', 'جاري التنفيذ', 'م/ سامح يس'),
(104, 'سوبابيز والأبحاث والاعتمادية', 'فحص خط الفايبر المباشر لبرنامج 4B والتأكد من زمن التأخير < 5ms', 'جاري التنفيذ', 'م/ عماد الشرقاوي + م/ سامح يس'),
(105, 'سوبابيز والأبحاث والاعتمادية', 'اختبار محاكاة انقطاع خط 4B والتحويل التلقائي للمسار الاحتياطي DR', 'لم يتم', 'م/ سامح يس + مهندسي WE')
ON CONFLICT (id) DO UPDATE SET
  section = EXCLUDED.section,
  title = EXCLUDED.title,
  status = EXCLUDED.status,
  owner = EXCLUDED.owner,
  updated_at = NOW();

-- Disable RLS across all Meshawir tables for seamless passcode-gated direct client access
DO $$ DECLARE t TEXT; BEGIN
  FOREACH t IN ARRAY ARRAY[
    'meshawir_enterprises','projects','meshawir_project_milestones','meshawir_team_profiles',
    'service_providers','meshawir_quotations','meshawir_server_racks','meshawir_rack_devices',
    'meshawir_rack_ports','meshawir_4b_leased_lines','meshawir_cctv_cameras','meshawir_voip_extensions',
    'mashweer_emails','meshawir_domains','project_tasks','meshawir_facility_zones',
    'hardware_inventory','meshawir_legal_dossiers','system_inquiries','meshawir_subsidiary_proposals',
    'meshawir_general_ledger','meshawir_kaggle_research','meshawir_verification_checks','meshawir_joint_tasks'
  ] LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=t) THEN
      EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', t);
    END IF;
  END LOOP;
END $$;
