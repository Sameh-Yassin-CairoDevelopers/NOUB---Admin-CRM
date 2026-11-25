import { ZOHO_EMAILS } from './handoverData';
import { JOINT_TASKS_DATA } from './jointTasks';
import {
  MESHAWIR_CCTV_CAMERAS,
  MESHAWIR_ENTERPRISE,
  MESHAWIR_FACILITY_ZONES,
  MESHAWIR_HARDWARE,
  MESHAWIR_INQUIRIES,
  MESHAWIR_KAGGLE,
  MESHAWIR_LEASED_LINES,
  MESHAWIR_LEGAL_DOSSIERS,
  MESHAWIR_MILESTONES,
  MESHAWIR_PROJECTS,
  MESHAWIR_PROVIDERS,
  MESHAWIR_QUOTATIONS,
  MESHAWIR_RACK_DEVICES,
  MESHAWIR_RACK_META,
  MESHAWIR_RACK_PORTS,
  MESHAWIR_SUBSIDIARY,
  MESHAWIR_TASKS,
  MESHAWIR_TEAM_PROFILES,
  MESHAWIR_VOIP_EXTENSIONS,
  VERIFICATION_MATRIX_30,
} from './meshawirMasterData';

const sqlStr = (val: string | null | undefined): string => {
  if (val === null || val === undefined) return 'NULL';
  return `'${String(val).replace(/'/g, "''")}'`;
};

const sqlJson = (val: unknown): string => `${sqlStr(JSON.stringify(val))}::jsonb`;

const sqlNum = (val: number | null | undefined): string =>
  val === null || val === undefined || Number.isNaN(Number(val)) ? 'NULL' : String(Number(val));

const sqlBool = (val: boolean | undefined): string => (val ? 'TRUE' : 'FALSE');

export function buildLatestUnifiedSupabaseSql(): string {
  const projectRows = MESHAWIR_PROJECTS.map(
    (p) =>
      `(${sqlStr(p.id)}, ${sqlStr(p.enterprise_id)}, ${sqlStr(p.name)}, ${sqlStr(p.code)}, ${sqlStr(p.category)}, ${sqlStr(p.status)}, ${sqlStr(p.knowledge_status)}, ${sqlStr(p.priority_tier)}, ${sqlNum(p.figma_completion_pct)}, ${sqlStr(p.description)}, ${sqlStr(p.repo_url)}, ${sqlStr(p.figma_url)}, ${sqlStr(p.live_url)}, ${sqlJson(p.apk_files)}, ${sqlJson(p.context_hints)}, ${sqlJson(p.db_info)})`
  ).join(',\n');

  const milestoneRows = MESHAWIR_MILESTONES.map(
    (m) =>
      `(${sqlStr(m.id)}, ${sqlStr(m.project_id)}, ${sqlStr(m.phase_code)}, ${sqlStr(m.title)}, ${sqlStr(m.target_date)}, ${sqlNum(m.completion_percentage)}, ${sqlStr(m.status)}, ${sqlStr(m.deliverables_summary)}, ${sqlStr(m.sign_off_by)})`
  ).join(',\n');

  const teamProfileRows = MESHAWIR_TEAM_PROFILES.map(
    (t) =>
      `(${sqlStr(t.id)}, ${sqlStr(t.full_name)}, ${sqlStr(t.short_name)}, ${sqlStr(t.title)}, ${sqlStr(t.category)}, ${sqlNum(t.efficiency_rate)}, ${sqlStr(t.email)}, ${sqlStr(t.phone)}, ${sqlStr(t.role_description)}, ${sqlStr(t.readiness_status)}, ${sqlNum(t.priority_order)})`
  ).join(',\n');

  const providerRows = MESHAWIR_PROVIDERS.map(
    (p) =>
      `(${sqlStr(p.id)}, ${sqlStr(p.name)}, ${sqlStr(p.category)}, ${sqlStr(p.portal_url)}, ${sqlStr(p.username)}, ${sqlStr(p.account_manager)}, ${sqlStr(p.contact_phone)}, ${sqlStr(p.contact_email)}, ${sqlStr(p.status)}, ${sqlStr(p.cost_or_plan)}, ${sqlStr(p.official_badge)}, ${sqlJson(p.active_services)})`
  ).join(',\n');

  const rackDeviceRows = MESHAWIR_RACK_DEVICES.map(
    (d) =>
      `(${sqlStr(d.id)}, ${sqlStr(d.rack_id)}, ${sqlStr(d.name)}, ${sqlStr(d.arabic_name)}, ${sqlStr(d.model)}, ${sqlStr(d.manufacturer)}, ${sqlNum(d.u_position_start)}, ${sqlNum(d.u_height)}, ${sqlStr(d.device_category)}, ${sqlStr(d.serial_number)}, ${sqlStr(d.ip_management)}, ${sqlStr(d.mac_address)}, ${sqlNum(d.power_watts)}, ${sqlNum(d.operating_temp_c)}, ${sqlStr(d.status)}, ${sqlStr(d.notes)})`
  ).join(',\n');

  const rackPortRows = MESHAWIR_RACK_PORTS.map(
    (p) =>
      `(${sqlStr(p.id)}, ${sqlStr(p.device_id)}, ${sqlNum(p.port_number)}, ${sqlStr(p.label)}, ${sqlStr(p.status)}, ${sqlStr(p.connected_device)}, ${sqlStr(p.device_type)}, ${sqlStr(p.user_endpoint)}, ${sqlStr(p.ip_address)}, ${sqlStr(p.mac_address)}, ${sqlStr(p.vlan_name)}, ${sqlNum(p.vlan_id)}, ${sqlStr(p.speed_duplex)}, ${sqlNum(p.poe_watts)}, ${sqlStr(p.cable_color)}, ${sqlNum(p.patch_panel_cross_port)}, ${sqlStr(p.notes)})`
  ).join(',\n');

  const leasedLineRows = MESHAWIR_LEASED_LINES.map(
    (l) =>
      `(${sqlStr(l.id)}, ${sqlStr(l.circuit_reference)}, ${sqlStr(l.provider_name)}, ${sqlStr(l.service_type)}, ${sqlNum(l.bandwidth_mbps)}, ${sqlStr(l.source_endpoint)}, ${sqlStr(l.destination_endpoint)}, ${sqlStr(l.primary_gateway_ip)}, ${sqlStr(l.backup_gateway_ip)}, ${sqlNum(l.monthly_cost_egp)}, ${sqlStr(l.contract_ref)}, ${sqlStr(l.status)}, ${sqlStr(l.notes)})`
  ).join(',\n');

  const cctvRows = MESHAWIR_CCTV_CAMERAS.map(
    (c) =>
      `(${sqlStr(c.id)}, ${sqlNum(c.camera_number)}, ${sqlStr(c.model)}, ${sqlStr(c.location_in_office)}, ${sqlNum(c.nvr_channel)}, ${sqlStr(c.ip_address)}, ${sqlNum(c.switch_port)}, ${sqlBool(c.has_audio_mic)}, ${sqlStr(c.status)})`
  ).join(',\n');

  const voipRows = MESHAWIR_VOIP_EXTENSIONS.map(
    (v) =>
      `(${sqlStr(v.id)}, ${sqlStr(v.extension_number)}, ${sqlStr(v.user_name)}, ${sqlStr(v.department)}, ${sqlStr(v.device_model)}, ${sqlStr(v.ip_address)}, ${sqlNum(v.switch_port)}, ${sqlNum(v.vlan_id)}, ${sqlStr(v.status)})`
  ).join(',\n');

  const emailRows = ZOHO_EMAILS.map(
    (e) =>
      `(${sqlStr(`email-${e.email.split('@')[0]}`)}, ${sqlStr(e.email)}, ${sqlStr(e.role)}, ${sqlStr(e.status.includes('ملغي') ? 'HR' : 'العمليات والإدارة')}, ${sqlStr(e.status)}, ${sqlStr(e.quota)}, ${sqlStr('فريق مشاوير المعادي')}, 'https://mail.zoho.com', ${sqlStr(e.status)})`
  ).join(',\n');

  const quotationRows = MESHAWIR_QUOTATIONS.map(
    (q) =>
      `(${sqlStr(q.id)}, ${sqlStr(q.provider_id)}, ${sqlStr(q.quote_number)}, ${sqlStr(q.title)}, ${sqlStr(q.submission_date)}, ${sqlNum(q.subtotal_egp)}, ${sqlNum(q.vat_egp)}, ${sqlNum(q.total_egp)}, ${sqlBool(q.is_tax_invoice)}, ${sqlStr(q.eta_uuid)}, ${sqlStr(q.status)})`
  ).join(',\n');

  const zoneRows = MESHAWIR_FACILITY_ZONES.map(
    (z) =>
      `(${sqlStr(z.id)}, ${sqlStr(z.zone_name)}, ${sqlStr(z.allocated_purpose)}, ${sqlStr(z.dimensions_text)}, ${sqlNum(z.capacity_people)}, ${sqlNum(z.workstation_ports_count)}, ${sqlNum(z.cctv_cameras_count)}, ${sqlStr(z.assigned_staff)}, ${sqlStr(z.notes)})`
  ).join(',\n');

  const hardwareRows = MESHAWIR_HARDWARE.map(
    (h) =>
      `(${sqlStr(h.id)}, ${sqlStr(h.name)}, ${sqlStr(h.role)}, ${sqlStr(h.specs)}, ${sqlStr(h.location)}, ${sqlStr(h.invoice_ref)}, ${sqlStr(h.vendor)}, ${sqlStr(h.status)})`
  ).join(',\n');

  const legalRows = MESHAWIR_LEGAL_DOSSIERS.map(
    (l) =>
      `(${sqlStr(l.id)}, ${sqlStr(l.dossier_title)}, ${sqlStr(l.authority_name)}, ${sqlStr(l.case_reference)}, ${sqlStr(l.lead_counsel)}, ${sqlStr(l.status)}, ${sqlStr(l.action_required)})`
  ).join(',\n');

  const taskRows = MESHAWIR_TASKS.map(
    (t) =>
      `(${sqlStr(t.id)}, ${sqlNum(t.task_number)}, ${sqlStr(t.project_id)}, ${sqlStr(t.category)}, ${sqlStr(t.title)}, ${sqlStr(t.description)}, ${sqlStr(t.priority)}, ${sqlStr(t.status)}, ${sqlStr(t.due_date || null)}, ${sqlStr(t.assigned_to)})`
  ).join(',\n');

  const inquiryRows = MESHAWIR_INQUIRIES.map(
    (q) =>
      `(${sqlStr(q.id)}, ${sqlStr(q.question)}, ${sqlStr(q.context)}, ${sqlStr(q.category)}, ${sqlStr(q.urgency)}, ${sqlJson(q.options)}, ${sqlBool(q.answered)}, ${sqlStr(q.answer)})`
  ).join(',\n');

  const verificationRows = VERIFICATION_MATRIX_30.map(
    (v) =>
      `(${sqlStr(v.id)}, ${sqlNum(v.num)}, ${sqlStr(v.category)}, ${sqlStr(v.title)}, ${sqlStr(v.status)}, ${sqlStr(v.contextNote)}, ${sqlStr(v.verificationNote)})`
  ).join(',\n');

  const jointTaskRows = JOINT_TASKS_DATA.map(
    (jt) =>
      `(${sqlNum(jt.id)}, ${sqlStr(jt.section)}, ${sqlStr(jt.title)}, ${sqlStr(jt.status)}, ${sqlStr(jt.owner)})`
  ).join(',\n');

  return `-- ==============================================================================
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
  ${sqlStr(MESHAWIR_ENTERPRISE.id)},
  ${sqlStr(MESHAWIR_ENTERPRISE.name)},
  ${sqlStr(MESHAWIR_ENTERPRISE.legal_name)},
  ${sqlStr(MESHAWIR_ENTERPRISE.commercial_register)},
  ${sqlStr(MESHAWIR_ENTERPRISE.tax_number)},
  ${sqlStr(MESHAWIR_ENTERPRISE.duns_number_status)},
  ${sqlStr(MESHAWIR_ENTERPRISE.headquarters_address)},
  ${sqlStr(MESHAWIR_ENTERPRISE.ceo_name)},
  ${sqlStr(MESHAWIR_ENTERPRISE.branch_manager_name)},
  ${sqlStr(MESHAWIR_ENTERPRISE.cto_name)}
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
${projectRows}
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
${milestoneRows}
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
${teamProfileRows}
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
${providerRows}
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
  ${sqlStr(MESHAWIR_RACK_META.id)},
  ${sqlStr(MESHAWIR_RACK_META.name)},
  ${sqlNum(MESHAWIR_RACK_META.total_units)},
  ${sqlNum(MESHAWIR_RACK_META.depth_mm)},
  ${sqlNum(MESHAWIR_RACK_META.width_inches)},
  ${sqlStr(MESHAWIR_RACK_META.location)},
  ${sqlStr(MESHAWIR_RACK_META.cooling_type)},
  ${sqlStr(MESHAWIR_RACK_META.power_backup)},
  ${sqlStr(MESHAWIR_RACK_META.lock_status)}
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  location = EXCLUDED.location,
  cooling_type = EXCLUDED.cooling_type,
  power_backup = EXCLUDED.power_backup,
  lock_status = EXCLUDED.lock_status;

INSERT INTO public.meshawir_rack_devices (id, rack_id, name, arabic_name, model, manufacturer, u_position_start, u_height, device_category, serial_number, ip_management, mac_address, power_watts, operating_temp_c, status, notes)
VALUES
${rackDeviceRows}
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
${rackPortRows}
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
${leasedLineRows}
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
${cctvRows}
ON CONFLICT (id) DO UPDATE SET
  location_in_office = EXCLUDED.location_in_office,
  ip_address = EXCLUDED.ip_address,
  switch_port = EXCLUDED.switch_port,
  has_audio_mic = EXCLUDED.has_audio_mic,
  status = EXCLUDED.status;

-- 9. Grandstream 604A VoIP Extensions (100 - 111)
INSERT INTO public.meshawir_voip_extensions (id, extension_number, user_name, department, device_model, ip_address, switch_port, vlan_id, status)
VALUES
${voipRows}
ON CONFLICT (id) DO UPDATE SET
  user_name = EXCLUDED.user_name,
  department = EXCLUDED.department,
  ip_address = EXCLUDED.ip_address,
  status = EXCLUDED.status;

-- 10. Official Emails (5 Active Zoho Lite + Cancelled HR) & Domains
INSERT INTO public.mashweer_emails (id, address, role_title, department, status, quota, assigned_to, webmail_url, notes)
VALUES
${emailRows}
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
${quotationRows}
ON CONFLICT (id) DO UPDATE SET
  subtotal_egp = EXCLUDED.subtotal_egp,
  vat_egp = EXCLUDED.vat_egp,
  total_egp = EXCLUDED.total_egp,
  eta_uuid = EXCLUDED.eta_uuid,
  status = EXCLUDED.status;

-- 12. Facility Zones (10 Maadi HQ Zones)
INSERT INTO public.meshawir_facility_zones (id, zone_name, allocated_purpose, dimensions_text, capacity_people, workstation_ports_count, cctv_cameras_count, assigned_staff, notes)
VALUES
${zoneRows}
ON CONFLICT (id) DO UPDATE SET
  allocated_purpose = EXCLUDED.allocated_purpose,
  assigned_staff = EXCLUDED.assigned_staff,
  notes = EXCLUDED.notes;

-- 13. Hardware Inventory (8 Core Assets)
INSERT INTO public.hardware_inventory (id, name, role, specs, location, invoice_ref, vendor, status)
VALUES
${hardwareRows}
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  specs = EXCLUDED.specs,
  status = EXCLUDED.status;

-- 14. Legal Dossiers, Subsidiary Proposal & Kaggle Research
INSERT INTO public.meshawir_legal_dossiers (id, dossier_title, authority_name, case_reference, lead_counsel, status, action_required)
VALUES
${legalRows}
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  action_required = EXCLUDED.action_required;

INSERT INTO public.meshawir_subsidiary_proposals (id, proposal_title, recipient_investor, proposed_by, strategic_objectives, corporate_structure, status)
VALUES (
  ${sqlStr(MESHAWIR_SUBSIDIARY.id)},
  ${sqlStr(MESHAWIR_SUBSIDIARY.proposal_title)},
  ${sqlStr(MESHAWIR_SUBSIDIARY.recipient_investor)},
  ${sqlStr(MESHAWIR_SUBSIDIARY.proposed_by)},
  ${sqlJson(MESHAWIR_SUBSIDIARY.strategic_objectives)},
  ${sqlJson({ summary: MESHAWIR_SUBSIDIARY.structure })},
  ${sqlStr(MESHAWIR_SUBSIDIARY.status)}
)
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  strategic_objectives = EXCLUDED.strategic_objectives;

INSERT INTO public.meshawir_kaggle_research (id, paper_title, track_name, deadline_date, primary_author, abstract_text, framework_model, submission_status)
VALUES (
  ${sqlStr(MESHAWIR_KAGGLE.id)},
  ${sqlStr(MESHAWIR_KAGGLE.paper_title)},
  ${sqlStr(MESHAWIR_KAGGLE.track_name)},
  ${sqlStr(MESHAWIR_KAGGLE.deadline_date)},
  ${sqlStr(MESHAWIR_KAGGLE.primary_author)},
  ${sqlStr(MESHAWIR_KAGGLE.abstract_text)},
  ${sqlStr(MESHAWIR_KAGGLE.framework_model)},
  ${sqlStr(MESHAWIR_KAGGLE.submission_status)}
)
ON CONFLICT (id) DO UPDATE SET
  paper_title = EXCLUDED.paper_title,
  submission_status = EXCLUDED.submission_status;

-- 15. Executive Project Tasks (13 Tasks with Due Dates)
INSERT INTO public.project_tasks (id, task_number, project_id, category, title, description, priority, status, due_date, assigned_to)
VALUES
${taskRows}
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
${inquiryRows}
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  context = EXCLUDED.context,
  options = EXCLUDED.options,
  answered = EXCLUDED.answered,
  answer = EXCLUDED.answer;

-- 18. 30-Point Verification Matrix
INSERT INTO public.meshawir_verification_checks (id, num, category, title, status, context_note, verification_note)
VALUES
${verificationRows}
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  status = EXCLUDED.status,
  context_note = EXCLUDED.context_note,
  updated_at = NOW();

-- 19. All 105 Joint Work Items (Eng. Emad El-Sharkawy & Eng. Sameh Youss)
INSERT INTO public.meshawir_joint_tasks (id, section, title, status, owner)
VALUES
${jointTaskRows}
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
`;
}

export const LATEST_UNIFIED_SUPABASE_SQL = buildLatestUnifiedSupabaseSql();
