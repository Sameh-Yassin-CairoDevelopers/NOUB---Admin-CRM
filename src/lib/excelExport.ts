import * as XLSX from 'xlsx';
import { ZOHO_EMAILS } from '../data/handoverData';
import { JOINT_TASKS_DATA, type JointTaskItem } from '../data/jointTasks';
import { MASTER_REGISTRY } from '../data/masterRegistry';
import {
  EXTERNAL_SERVICES_17,
  MESHAWIR_CCTV_CAMERAS,
  MESHAWIR_FACILITY_ZONES,
  MESHAWIR_HARDWARE,
  MESHAWIR_LEASED_LINES,
  MESHAWIR_LEGAL_DOSSIERS,
  MESHAWIR_MILESTONES,
  MESHAWIR_PROJECTS,
  MESHAWIR_PROVIDERS,
  MESHAWIR_QUOTATIONS,
  MESHAWIR_RACK_DEVICES,
  MESHAWIR_RACK_PORTS,
  MESHAWIR_TASKS,
  MESHAWIR_TEAM_PROFILES,
  MESHAWIR_VOIP_EXTENSIONS,
  VERIFICATION_MATRIX_30,
  type ProjectTaskItem,
  type RackDevice,
  type RackPort,
  type VerificationMatrixItem,
} from '../data/meshawirMasterData';
import type { AnyRecord, TableId } from '../types/crm';

export interface ExcelBuildInput {
  crmDb?: Partial<Record<TableId, AnyRecord[]>>;
  meshawirTasks?: ProjectTaskItem[];
  jointTasks?: JointTaskItem[];
  rackDevices?: RackDevice[];
  rackPorts?: RackPort[];
  verification30?: VerificationMatrixItem[];
}

function appendRtlSheet(
  wb: XLSX.WorkBook,
  sheetName: string,
  rows: Array<Record<string, unknown>>,
  colWidths?: number[]
) {
  const safeName = sheetName.replace(/[\\/?*[\]:]/g, ' ').slice(0, 31);
  const safeRows = rows.length > 0 ? rows : [{ ملاحظة: 'لا توجد بيانات مسجلة' }];
  const ws = XLSX.utils.json_to_sheet(safeRows);
  ws['!views'] = [{ rightToLeft: true }];

  if (colWidths && colWidths.length > 0) {
    ws['!cols'] = colWidths.map((wch) => ({ wch }));
  } else {
    const keys = Object.keys(safeRows[0]);
    ws['!cols'] = keys.map((k) => {
      const maxLen = safeRows.reduce((acc, row) => {
        const val = row[k] === null || row[k] === undefined ? '' : String(row[k]);
        return Math.max(acc, val.length);
      }, k.length);
      return { wch: Math.min(Math.max(maxLen + 4, 14), 52) };
    });
  }

  XLSX.utils.book_append_sheet(wb, ws, safeName);
}

export function buildLatestExcelWorkbook(input: ExcelBuildInput = {}): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  const db = input.crmDb || {};
  const tasks = input.meshawirTasks || MESHAWIR_TASKS;
  const jointTasks = input.jointTasks || JOINT_TASKS_DATA;
  const rackDevices = input.rackDevices || MESHAWIR_RACK_DEVICES;
  const rackPorts = input.rackPorts || MESHAWIR_RACK_PORTS;
  const ver30 = input.verification30 || VERIFICATION_MATRIX_30;

  // 1. Projects Summary (9)
  appendRtlSheet(
    wb,
    'ملخص المشاريع (9)',
    MESHAWIR_PROJECTS.map((p) => ({
      الكود: p.code,
      اسم_المشروع: p.name,
      الأولوية: p.priority_tier,
      التصنيف: p.category,
      حالة_المعرفة: p.knowledge_status,
      الحالة_التنفيذية: p.status,
      نسبة_Figma: `${p.figma_completion_pct}%`,
      الوصف: p.description,
      المستودع: p.repo_url,
      الرابط_الحي: p.live_url,
    }))
  );

  // 2. Telecom Lines
  const telecomRows =
    db.telecom_lines && db.telecom_lines.length > 0
      ? db.telecom_lines
      : MESHAWIR_LEASED_LINES.map((l) => ({
          name: l.service_type,
          kind: l.bandwidth_mbps <= 1 ? 'أرضي' : 'إنترنت/فايبر',
          number: l.circuit_reference,
          service: `${l.source_endpoint} → ${l.destination_endpoint}`,
          provider: l.provider_name,
          plan: `${l.bandwidth_mbps} Mbps`,
          cycle: 'شهري',
          amount: l.monthly_cost_egp,
          due_date: '',
          notes: l.notes,
        }));
  appendRtlSheet(
    wb,
    'الاتصالات',
    telecomRows.map((r) => ({
      الاسم_والوصف: r.name || '',
      النوع: r.kind || '',
      الرقم_أو_المرجع: r.number || '',
      الخدمة: r.service || '',
      المزود: r.provider || '',
      الباقة: r.plan || '',
      دورة_السداد: r.cycle || '',
      المبلغ_ج_م: r.amount ?? '',
      تاريخ_الاستحقاق: r.due_date || '',
      ملاحظات: r.notes || '',
    }))
  );

  // 3. Domains & Hosting
  const domainRows =
    db.domains && db.domains.length > 0
      ? db.domains
      : [
          {
            name: 'mashawer.com.eg',
            kind: 'دومين',
            provider: 'المصرية EC (م/ محمد الحلو)',
            start_date: '2026-08-09',
            cycle: 'سنوي',
            amount: 1254,
            due_date: '2027-08-09',
            auto_renew: false,
            notes: 'مطلوب التجديد لسنتين قادمتين',
          },
          {
            name: 'استضافة الموقع الرئيسي Host1',
            kind: 'استضافة',
            provider: 'المصرية EC (م/ محمد الحلو)',
            start_date: '2026-08-11',
            cycle: 'سنوي',
            amount: 2508,
            due_date: '2027-08-11',
            auto_renew: false,
            notes: 'استضافة الموقع الرسمي',
          },
        ];
  appendRtlSheet(
    wb,
    'الدومينات والاستضافة',
    domainRows.map((d) => ({
      الدومين_أو_الخدمة: d.name || '',
      النوع: d.kind || '',
      المزود: d.provider || '',
      تاريخ_الاشتراك: d.start_date || '',
      الدورة: d.cycle || '',
      المبلغ_ج_م: d.amount ?? '',
      التجديد_القادم: d.due_date || '',
      تجديد_تلقائي: d.auto_renew ? 'نعم' : 'لا',
      ملاحظات: d.notes || '',
    }))
  );

  // 4. Wanted Domains
  const wantedRows =
    db.wanted_domains && db.wanted_domains.length > 0
      ? db.wanted_domains
      : [
          { name: 'mashweer.net', ext: '.net', provider: 'EC / مسجل خارجي', price: '', priority: 'عالية', status: 'محجوز', project: 'عدة تطبيقات', notes: 'مقترح تجديده مع mashawer.com.eg' },
          { name: 'wikala.com.eg', ext: '.com.eg', provider: 'المصرية EC', price: '', priority: 'عالية', status: 'متاح', project: 'WIKALA', notes: 'بانتظار السجل التجاري (مؤجل)' },
          { name: 'daro.eg', ext: '.eg', provider: 'المصرية EC', price: '', priority: 'عالية', status: 'متاح', project: 'DARO', notes: 'النطاق الرسمي لدارو (مؤجل)' },
        ];
  appendRtlSheet(
    wb,
    'دومينات مطلوبة',
    wantedRows.map((w) => ({
      الاسم_المقترح: w.name || '',
      الامتداد: w.ext || '',
      المزود: w.provider || '',
      السعر_السنوي: w.price ?? '',
      الأولوية: w.priority || '',
      الحالة: w.status || '',
      المشروع: w.project || '',
      ملاحظات: w.notes || '',
    }))
  );

  // 5. Service Providers (12 Official Partners)
  appendRtlSheet(
    wb,
    'مزودو الخدمات (12)',
    MESHAWIR_PROVIDERS.map((p) => ({
      المزود: p.name,
      التصنيف: p.category,
      مدير_الحساب: p.account_manager,
      اسم_المستخدم: p.username,
      رابط_الدخول: p.portal_url,
      الحالة: p.status,
      التكلفة_أو_الخطة: p.cost_or_plan,
      الاعتماد: p.official_badge,
      الخدمات_النشطة: p.active_services.join(' · '),
    }))
  );

  // 6. API Keys & 17 External Services
  const apiKeyRows = [
    ...((db.api_keys || []).map((k) => ({
      المصدر: 'سجل مفاتيح API',
      المزود: k.provider || '',
      الخدمة: k.service || '',
      التطبيق: k.site || '',
      البيئة: k.env || '',
      اسم_المفتاح: k.key_label || '',
      مكان_الحفظ: k.secret_location || '',
      الفوترة: k.billing || '',
      الحالة: 'مفعل',
    })) as Array<Record<string, unknown>>),
    ...EXTERNAL_SERVICES_17.map((s) => ({
      المصدر: 'الخدمات الـ 17 بالمنظومة',
      المزود: s.name,
      الخدمة: s.role,
      التطبيق: '4B / كابتن / المنظومة',
      البيئة: 'Production / Review',
      اسم_المفتاح: 'راجع خزنة الأسرار',
      مكان_الحفظ: 'Bitwarden / .env',
      الفوترة: s.knowledgeStatus,
      الحالة: s.notes,
    })),
  ];
  appendRtlSheet(wb, 'مفاتيح API والخدمات', apiKeyRows);

  // 7. Sites & Zoho Emails
  const sitesAndEmailRows = [
    ...((db.sites || []).map((s) => ({
      النوع: 'بوابة / موقع إداري',
      الاسم_أو_البريد: s.name || '',
      الرابط: s.url || '',
      الغرض_أو_الدور: s.purpose || '',
      المزود_أو_السعة: s.providers || '',
      المسؤول: s.it_owner || '',
      الحالة: s.pwd_type || 'برايفت',
    })) as Array<Record<string, unknown>>),
    ...ZOHO_EMAILS.map((e) => ({
      النوع: 'بريد إلكتروني Zoho',
      الاسم_أو_البريد: e.email,
      الرابط: 'https://mail.zoho.com',
      الغرض_أو_الدور: e.role,
      المزود_أو_السعة: e.quota,
      المسؤول: 'فريق مشاوير المعادي',
      الحالة: e.status,
    })),
  ];
  appendRtlSheet(wb, 'المواقع والبريد (Zoho)', sitesAndEmailRows);

  // 8. Invoices, Quotations & Payments (12 + CRM payments)
  appendRtlSheet(
    wb,
    'الفواتير والسداد (12)',
    MESHAWIR_QUOTATIONS.map((q) => ({
      رقم_الفاتورة_أو_الأمر: q.quote_number,
      البيان: q.title,
      التاريخ: q.submission_date,
      قبل_الضريبة_ج_م: q.subtotal_egp,
      الضريبة_ج_م: q.vat_egp,
      الإجمالي_ج_م: q.total_egp,
      فاتورة_ضريبية_ETA: q.is_tax_invoice ? 'نعم' : 'لا',
      معرف_ETA_UUID: q.eta_uuid || '—',
      الحالة: q.status,
    }))
  );

  // 9. Apps, Milestones & Deliverables
  const appsList = db.apps || [];
  const deliverablesList = db.deliverables || [];
  const appNameById = new Map(appsList.map((a) => [a.id, a.name]));
  const appDeliverableRows = [
    ...MESHAWIR_MILESTONES.map((m) => ({
      السجل: 'مرحلة 4B التنفيذية',
      التطبيق: '4B — تطبيق العملاء وكابتن مشاوير',
      المرحلة: m.phase_code,
      البند: m.title,
      المسؤول: m.sign_off_by,
      المستهدف: m.target_date,
      نسبة_الإنجاز: `${m.completion_percentage}%`,
      الحالة: m.status,
      الملخص: m.deliverables_summary,
    })),
    ...deliverablesList.map((d) => ({
      السجل: 'بند مسار الاستلام',
      التطبيق: appNameById.get(d.app_id) || d.app_id,
      المرحلة: d.stage || '',
      البند: d.item || '',
      المسؤول: d.owner || '',
      المستهدف: d.end_date || d.received_on || '',
      نسبة_الإنجاز: d.acceptance || '',
      الحالة: d.status || '',
      الملخص: d.notes || '',
    })),
  ];
  appendRtlSheet(wb, 'التطبيقات ومسار الاستلام', appDeliverableRows);

  // 10. Team Profiles (13)
  appendRtlSheet(
    wb,
    'الهيكل الوظيفي (13)',
    MESHAWIR_TEAM_PROFILES.map((t) => ({
      الترتيب: t.priority_order,
      الاسم_الكامل: t.full_name,
      المسمى_الوظيفي: t.title,
      القطاع: t.category,
      الكفاءة: `${t.efficiency_rate}%`,
      البريد: t.email || '—',
      الهاتف: t.phone || '—',
      الحالة: t.readiness_status,
      المسؤوليات: t.role_description,
    }))
  );

  // 11. Executive Project Tasks (13 with Due Dates)
  appendRtlSheet(
    wb,
    'المهام التنفيذية (13)',
    tasks.map((t) => ({
      رقم_المهمة: t.task_number,
      المشروع: t.project_id,
      المحور: t.category,
      العنوان: t.title,
      الأولوية: t.priority,
      الحالة: t.status === 'completed' ? 'تم' : t.status === 'in_progress' ? 'جاري التنفيذ' : 'لم يتم',
      تاريخ_الاستحقاق: t.due_date || '—',
      المسؤول: t.assigned_to,
      التفاصيل: t.description,
    }))
  );

  // 12. Joint Tasks (105)
  appendRtlSheet(
    wb,
    'المهام المشتركة (105)',
    jointTasks.map((jt) => ({
      رقم_البند: jt.id,
      القسم: jt.section,
      البند: jt.title,
      الحالة: jt.status,
      المسؤول: jt.owner,
    }))
  );

  // 13. Rack Devices & All 58 Ports
  const deviceNameById = new Map(rackDevices.map((d) => [d.id, `${d.arabic_name} (U${d.u_position_start})`]));
  appendRtlSheet(
    wb,
    'الراك والمنافذ (27U)',
    rackPorts.map((p) => ({
      الجهاز_بالراك: deviceNameById.get(p.device_id) || p.device_id,
      رقم_المنفذ: p.port_number,
      التسمية: p.label,
      الحالة: p.status,
      الجهاز_المتصل: p.connected_device,
      الموقع_أو_المستخدم: p.user_endpoint,
      عنوان_IP: p.ip_address,
      اسم_VLAN: p.vlan_name,
      VLAN_ID: p.vlan_id,
      السرعة: p.speed_duplex,
      PoE_Watts: p.poe_watts,
      رقم_الباتش_بانل: p.patch_panel_cross_port ?? '—',
      ملاحظات: p.notes,
    }))
  );

  // 14. CCTV, VoIP, Hardware & Legal
  const infraRows = [
    ...MESHAWIR_CCTV_CAMERAS.map((c) => ({
      الفئة: 'كاميرات المراقبة CCTV (16)',
      المرجع: `كاميرا #${c.camera_number} (NVR Ch${c.nvr_channel})`,
      الاسم_أو_الموقع: c.location_in_office,
      التفاصيل: `${c.model} ${c.has_audio_mic ? '· صوتية' : ''}`,
      الشبكة_أو_المنفذ: `${c.ip_address} · Gi1/0/${c.switch_port}`,
      الحالة: c.status,
    })),
    ...MESHAWIR_VOIP_EXTENSIONS.map((v) => ({
      الفئة: 'تحويلات السنترال 604A',
      المرجع: `تحويلة ${v.extension_number}`,
      الاسم_أو_الموقع: v.user_name,
      التفاصيل: `${v.department} · ${v.device_model}`,
      الشبكة_أو_المنفذ: `${v.ip_address} · VLAN ${v.vlan_id}`,
      الحالة: v.status,
    })),
    ...MESHAWIR_HARDWARE.map((h) => ({
      الفئة: 'العتاد والأجهزة (8)',
      المرجع: h.invoice_ref,
      الاسم_أو_الموقع: `${h.name} (${h.location})`,
      التفاصيل: `${h.role} — ${h.specs}`,
      الشبكة_أو_المنفذ: h.vendor,
      الحالة: h.status,
    })),
    ...MESHAWIR_FACILITY_ZONES.map((z) => ({
      الفئة: 'توزيع غرف المقر (10)',
      المرجع: z.dimensions_text,
      الاسم_أو_الموقع: z.zone_name,
      التفاصيل: `${z.allocated_purpose} (${z.assigned_staff})`,
      الشبكة_أو_المنفذ: `${z.workstation_ports_count} نقطة شبكة · ${z.cctv_cameras_count} كاميرا`,
      الحالة: `${z.capacity_people} أفراد`,
    })),
    ...MESHAWIR_LEGAL_DOSSIERS.map((l) => ({
      الفئة: 'الملفات القانونية (4)',
      المرجع: l.case_reference,
      الاسم_أو_الموقع: l.dossier_title,
      التفاصيل: `${l.authority_name} — ${l.action_required}`,
      الشبكة_أو_المنفذ: l.lead_counsel,
      الحالة: l.status,
    })),
  ];
  appendRtlSheet(wb, 'الكاميرات والتحويلات', infraRows);

  // 15. Verification Matrix 30
  appendRtlSheet(
    wb,
    'مصفوفة التحقق (30)',
    ver30.map((v) => ({
      رقم: v.num,
      المحور: v.category,
      البند: v.title,
      حالة_المعرفة: v.status,
      السياق_والتحفظ: v.contextNote,
      ملاحظة_التحقق: v.verificationNote || '—',
    }))
  );

  // 16. Master Registry (450)
  appendRtlSheet(
    wb,
    'السجل الشامل (450)',
    MASTER_REGISTRY.map((r) => ({
      رقم_البند: r.id,
      القسم: r.category,
      النوع: r.kind,
      البيان: r.title,
      المسؤول: r.owners,
      الحالة: r.status,
    }))
  );

  return wb;
}

export function downloadLatestExcelWorkbook(input: ExcelBuildInput = {}): void {
  const wb = buildLatestExcelWorkbook(input);
  XLSX.writeFile(wb, 'NOUB_CRM_Meshawir_Latest.xlsx', { compression: true });
}
