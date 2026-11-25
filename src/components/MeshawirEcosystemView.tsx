import React, { useEffect, useMemo, useState } from 'react';
import {
  Briefcase,
  Users,
  Building2,
  Camera,
  Receipt,
  Scale,
  Lightbulb,
  Network,
  ExternalLink,
  Search,
  PhoneCall,
  Cpu,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import {
  MESHAWIR_CCTV_CAMERAS,
  MESHAWIR_ENTERPRISE,
  MESHAWIR_FACILITY_ZONES,
  MESHAWIR_HARDWARE,
  MESHAWIR_KAGGLE,
  MESHAWIR_LEASED_LINES,
  MESHAWIR_LEGAL_DOSSIERS,
  MESHAWIR_MILESTONES,
  MESHAWIR_PROJECTS,
  MESHAWIR_PROVIDERS,
  MESHAWIR_QUOTATIONS,
  MESHAWIR_SUBSIDIARY,
  MESHAWIR_TEAM_PROFILES,
  MESHAWIR_VOIP_EXTENSIONS,
  type ProjectTaskItem,
  type SystemInquiryItem,
} from '../data/meshawirMasterData';
import {
  answerSystemInquiry,
  loadMeshawirTasks,
  loadSystemInquiries,
  updateMeshawirTaskStatus,
} from '../lib/dataService';

type EcoTab = 'projects' | 'team' | 'infra' | 'finance' | 'decisions';

export const MeshawirEcosystemView: React.FC = () => {
  const [tab, setTab] = useState<EcoTab>('projects');
  const [search, setSearch] = useState('');
  const [tasks, setTasks] = useState<ProjectTaskItem[]>([]);
  const [inquiries, setInquiries] = useState<SystemInquiryItem[]>([]);

  useEffect(() => {
    let mounted = true;
    Promise.all([loadMeshawirTasks(), loadSystemInquiries()]).then(([tRows, qRows]) => {
      if (!mounted) return;
      setTasks(tRows);
      setInquiries(qRows);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleTaskStatusChange = async (id: string, status: string) => {
    const next = await updateMeshawirTaskStatus(id, status);
    setTasks(next);
  };

  const handleAnswerInquiry = async (id: string, answer: string) => {
    const next = await answerSystemInquiry(id, answer);
    setInquiries(next);
  };

  const etaTotals = useMemo(() => {
    const grand = MESHAWIR_QUOTATIONS.reduce((s, q) => s + Number(q.total_egp || 0), 0);
    const localHw = MESHAWIR_QUOTATIONS.filter((q) => !q.id.startsWith('qt-we-')).reduce(
      (s, q) => s + Number(q.total_egp || 0),
      0
    );
    const etaCount = MESHAWIR_QUOTATIONS.filter((q) => q.is_tax_invoice).length;
    return { grand, localHw, etaCount };
  }, []);

  const q = search.trim().toLowerCase();

  return (
    <div className="space-y-6">
      {/* Enterprise Header Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Building2 className="w-5 h-5 text-[#1E3A5F]" />
              <h2 className="text-lg font-bold text-slate-900">
                {MESHAWIR_ENTERPRISE.legal_name}
              </h2>
            </div>
            <p className="text-xs text-slate-600 mt-1">{MESHAWIR_ENTERPRISE.headquarters_address}</p>
            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-xs text-slate-600">
              <span>
                السجل التجاري: <strong className="font-mono text-slate-900">{MESHAWIR_ENTERPRISE.commercial_register}</strong>
              </span>
              <span>
                البطاقة الضريبية: <strong className="font-mono text-slate-900">{MESHAWIR_ENTERPRISE.tax_number}</strong>
              </span>
              <span>
                مدير الفرع: <strong className="text-slate-900">{MESHAWIR_ENTERPRISE.branch_manager_name}</strong>
              </span>
              <span>
                CTO: <strong className="text-slate-900">{MESHAWIR_ENTERPRISE.cto_name}</strong>
              </span>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث في منظومة مشاوير..."
              className="w-full pr-9 pl-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            />
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-1.5">
          {[
            { id: 'projects', label: 'المشاريع (8) وخطة M1–M5', icon: Briefcase },
            { id: 'team', label: 'الهيكل (13) والمبنى (10 مناطق)', icon: Users },
            { id: 'infra', label: 'الشبكات والكاميرات (16) والسنترال', icon: Network },
            { id: 'finance', label: 'الفواتير الضريبية ETA والالتزامات (12)', icon: Receipt },
            { id: 'decisions', label: 'المهام (13) والقانونية وكاجل والقرارات', icon: Scale },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id as EcoTab)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border cursor-pointer whitespace-nowrap transition-colors ${
                  tab === item.id
                    ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: PROJECTS + M1..M5 */}
      {tab === 'projects' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MESHAWIR_PROJECTS.filter(
              (p) =>
                !q ||
                p.name.toLowerCase().includes(q) ||
                p.code.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q)
            ).map((proj) => (
              <div
                key={proj.id}
                className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-mono font-bold text-blue-700">
                        {proj.code} · {proj.category}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5">{proj.name}</h3>
                    </div>
                    <span className="text-xs font-bold font-mono text-slate-700 shrink-0">
                      فيجما {proj.figma_completion_pct}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>
                  {proj.context_hints.length > 0 && (
                    <ul className="space-y-1 text-[11px] text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                      {proj.context_hints.map((h, i) => (
                        <li key={i}>• {h}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <span className="font-semibold text-emerald-700">{proj.status}</span>
                  <div className="flex items-center gap-3">
                    {proj.figma_url && (
                      <a
                        href={proj.figma_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-blue-700 hover:underline"
                      >
                        <span>Figma</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {proj.repo_url && (
                      <a
                        href={proj.repo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-slate-700 hover:underline font-mono"
                      >
                        <span>Repo</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* M1-M5 Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                خطة تسليم قيمة تك المرحلية (7 أسابيع · M1 حتى M5)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-700">
                  <tr>
                    <th className="py-2.5 px-4 text-right">المرحلة</th>
                    <th className="py-2.5 px-4 text-right">العنوان والمخرجات</th>
                    <th className="py-2.5 px-4 text-right">التاريخ المستهدف</th>
                    <th className="py-2.5 px-4 text-right">الإنجاز</th>
                    <th className="py-2.5 px-4 text-right">الاعتماد</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {MESHAWIR_MILESTONES.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {m.phase_code}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{m.title}</p>
                        <p className="text-slate-600 mt-0.5">{m.deliverables_summary}</p>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700 whitespace-nowrap" dir="ltr">
                        {m.target_date}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-700">
                        {m.completion_percentage}%
                      </td>
                      <td className="py-3 px-4 text-slate-700">{m.sign_off_by}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TEAM 13 + FACILITY 10 ZONES */}
      {tab === 'team' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              ملفات الفريق البشري والقيادات (13 عضواً وفريقاً)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {MESHAWIR_TEAM_PROFILES.filter(
                (t) =>
                  !q ||
                  t.full_name.toLowerCase().includes(q) ||
                  t.title.toLowerCase().includes(q) ||
                  t.role_description.toLowerCase().includes(q)
              ).map((member) => (
                <div
                  key={member.id}
                  className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono text-slate-500">#{member.priority_order}</span>
                    <span className="text-[11px] font-mono font-bold text-emerald-700">
                      {member.efficiency_rate}% · {member.readiness_status}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{member.full_name}</h4>
                  <p className="text-xs font-semibold text-blue-800">{member.title}</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{member.role_description}</p>
                  {(member.email || member.phone) && (
                    <p className="text-[11px] font-mono text-slate-500 pt-1" dir="ltr">
                      {member.email} {member.phone ? `· ${member.phone}` : ''}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                المخطط الهندسي المعماري لمقر المعادي (25.91م × 20.94م · 10 مناطق)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-700">
                  <tr>
                    <th className="py-2.5 px-4 text-right">المنطقة / الغرفة</th>
                    <th className="py-2.5 px-4 text-right">التخصيص</th>
                    <th className="py-2.5 px-4 text-right">الأبعاد</th>
                    <th className="py-2.5 px-4 text-right">مخارج شبكة</th>
                    <th className="py-2.5 px-4 text-right">كاميرات</th>
                    <th className="py-2.5 px-4 text-right">المسؤولون</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {MESHAWIR_FACILITY_ZONES.map((z) => (
                    <tr key={z.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-4 font-bold text-slate-900">{z.zone_name}</td>
                      <td className="py-2.5 px-4 text-slate-700">{z.allocated_purpose}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-600">{z.dimensions_text}</td>
                      <td className="py-2.5 px-4 font-mono font-bold text-blue-700">
                        {z.workstation_ports_count}
                      </td>
                      <td className="py-2.5 px-4 font-mono font-bold text-purple-700">
                        {z.cctv_cameras_count}
                      </td>
                      <td className="py-2.5 px-4 text-slate-700">{z.assigned_staff}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: INFRASTRUCTURE (PROVIDERS + LEASED LINES + HARDWARE + CCTV + VOIP) */}
      {tab === 'infra' && (
        <div className="space-y-6">
          {/* 4 Live Telecom & Fiber Circuits */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
              <Network className="w-4 h-4 text-[#1E3A5F]" />
              <h3 className="text-sm font-bold text-slate-900">
                دوائر الاتصالات والإنترنت الحية بمقر المعادي (TP-Link ER8411 + Grandstream 604A + WE L3VPN)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-700">
                  <tr>
                    <th className="py-2.5 px-4 text-right">المرجع</th>
                    <th className="py-2.5 px-4 text-right">الخدمة والمسار</th>
                    <th className="py-2.5 px-4 text-right">البوابة / IP</th>
                    <th className="py-2.5 px-4 text-right">التكلفة الشهرية</th>
                    <th className="py-2.5 px-4 text-right">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {MESHAWIR_LEASED_LINES.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-900" dir="ltr">
                        {l.circuit_reference}
                      </td>
                      <td className="py-2.5 px-4">
                        <p className="font-bold text-slate-900">{l.service_type}</p>
                        <p className="text-slate-600">{l.destination_endpoint}</p>
                      </td>
                      <td className="py-2.5 px-4 font-mono text-slate-700" dir="ltr">
                        {l.primary_gateway_ip}
                      </td>
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                        {l.monthly_cost_egp.toLocaleString('en-US')} ج.م
                      </td>
                      <td className="py-2.5 px-4 text-emerald-700 font-semibold">{l.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Hardware Inventory */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Cpu className="w-4 h-4 text-[#1E3A5F]" />
              <h3 className="text-sm font-bold text-slate-900">
                سجل الأجهزة والعتاد المورد بمقر المعادي ({MESHAWIR_HARDWARE.length} أصول)
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {MESHAWIR_HARDWARE.map((hw) => (
                <div key={hw.id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900">{hw.name}</h4>
                    <span className="text-[11px] font-semibold text-emerald-700">{hw.status}</span>
                  </div>
                  <p className="text-xs text-blue-800 font-semibold mt-0.5">{hw.role}</p>
                  <p className="text-[11px] text-slate-600 mt-1">{hw.specs}</p>
                  <p className="text-[11px] font-mono text-slate-500 mt-1">
                    {hw.location} · {hw.invoice_ref}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 16 CCTV Cameras + 12 VoIP Extensions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
                <Camera className="w-4 h-4 text-purple-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  كاميرات Hikvision 5MP (16 كاميرا · منها 4 صوتية)
                </h3>
              </div>
              <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 text-xs">
                {MESHAWIR_CCTV_CAMERAS.map((c) => (
                  <div key={c.id} className="px-4 py-2.5 flex items-center justify-between gap-2">
                    <div>
                      <p className="font-bold text-slate-900">
                        CH{c.nvr_channel} — {c.location_in_office}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {c.model} · منفذ سيسكو Gi1/0/{c.switch_port}
                        {c.has_audio_mic ? ' · صوت + صورة' : ''}
                      </p>
                    </div>
                    <span className="font-mono text-[11px] text-purple-700 font-bold" dir="ltr">
                      {c.ip_address}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  تحويلات سنترال Grandstream 604A (VLAN 30)
                </h3>
              </div>
              <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 text-xs">
                {MESHAWIR_VOIP_EXTENSIONS.map((v) => (
                  <div key={v.id} className="px-4 py-2.5 flex items-center justify-between gap-2">
                    <div>
                      <p className="font-bold text-slate-900">
                        تحويلة {v.extension_number} — {v.user_name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {v.department} · {v.device_model} · Gi1/0/{v.switch_port}
                      </p>
                    </div>
                    <span className="font-mono text-[11px] text-emerald-700 font-bold" dir="ltr">
                      {v.ip_address}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 12 Service Providers */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                دليل مزودي الخدمات والموردين المعتمدين ({MESHAWIR_PROVIDERS.length} مزوداً)
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
              {MESHAWIR_PROVIDERS.map((p) => (
                <div key={p.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 text-xs space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-slate-900">{p.name}</h4>
                  </div>
                  <p className="text-blue-700 font-semibold">{p.category}</p>
                  <p className="text-slate-600">{p.cost_or_plan}</p>
                  <p className="text-[11px] text-slate-500">المسؤول: {p.account_manager}</p>
                  <p className="text-[11px] font-semibold text-emerald-700">{p.status}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ETA TAX INVOICES & FINANCIAL LEDGER */}
      {tab === 'finance' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <span className="text-xs text-slate-500">فواتير العتاد المحلي بالمقر</span>
              <p className="text-2xl font-bold font-mono text-slate-900 mt-1">
                {etaTotals.localHw.toLocaleString('en-US')} ج.م
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <span className="text-xs text-slate-500">إجمالي السجل (شامل عقود WE السنوية)</span>
              <p className="text-2xl font-bold font-mono text-[#1E3A5F] mt-1">
                {etaTotals.grand.toLocaleString('en-US')} ج.م
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <span className="text-xs text-slate-500">فواتير ضريبية موثقة ETA</span>
              <p className="text-2xl font-bold font-mono text-emerald-700 mt-1">
                {etaTotals.etaCount} / {MESHAWIR_QUOTATIONS.length}
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-700">
                  <tr>
                    <th className="py-3 px-4 text-right">رقم المرجع</th>
                    <th className="py-3 px-4 text-right">البيان والبنود</th>
                    <th className="py-3 px-4 text-right">التاريخ</th>
                    <th className="py-3 px-4 text-right">الإجمالي (ج.م)</th>
                    <th className="py-3 px-4 text-right">رقم الضرائب ETA UUID</th>
                    <th className="py-3 px-4 text-right">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {MESHAWIR_QUOTATIONS.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900" dir="ltr">
                        {inv.quote_number}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{inv.title}</td>
                      <td className="py-3 px-4 font-mono text-slate-600" dir="ltr">
                        {inv.submission_date}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {inv.total_egp.toLocaleString('en-US')}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600" dir="ltr">
                        {inv.eta_uuid || '—'}
                      </td>
                      <td className="py-3 px-4 font-semibold text-emerald-700">{inv.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CONSOLIDATED TASKS + LEGAL + SUBSIDIARY + KAGGLE + STRATEGIC INQUIRIES */}
      {tab === 'decisions' && (
        <div className="space-y-6">
          {/* 5 Strategic Inquiries */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">
                الاستفسارات والقرارات الاستراتيجية الحرجة (5 محاور)
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className={`p-4 rounded-xl border ${
                    inq.answered
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-amber-50/50 border-amber-200'
                  } space-y-2`}
                >
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="font-bold text-slate-700">{inq.category}</span>
                    <span className="font-mono font-bold text-amber-800">{inq.urgency}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{inq.question}</h4>
                  <p className="text-[11px] text-slate-600">{inq.context}</p>
                  {inq.answer && (
                    <p className="text-xs font-semibold text-emerald-800 flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>القرار المعتمد: {inq.answer}</span>
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {inq.options.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleAnswerInquiry(inq.id, opt)}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold border cursor-pointer ${
                          inq.answer === opt
                            ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 13 Consolidated Tasks */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                المهام الـ 13 الموحدة لتنفيذ المنظومة (تحفظ مباشرة في Supabase)
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {tasks.map((t) => (
                <div
                  key={t.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-slate-500">#{t.task_number}</span>
                      <span className="font-bold text-blue-700">{t.category}</span>
                      <span className="text-slate-400">·</span>
                      <span className="font-semibold text-slate-700">{t.assigned_to}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900">{t.title}</p>
                    <p className="text-slate-600">{t.description}</p>
                  </div>
                  <select
                    value={t.status}
                    onChange={(e) => handleTaskStatusChange(t.id, e.target.value)}
                    className="px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg bg-white shrink-0"
                  >
                    <option value="completed">تم التنفيذ (completed)</option>
                    <option value="in_progress">جاري التنفيذ (in_progress)</option>
                    <option value="pending">قيد الانتظار (pending)</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* 4 Legal Dossiers + Subsidiary Proposal + Kaggle */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#1E3A5F]" />
                <h3 className="text-sm font-bold text-slate-900">
                  الملفات القانونية الـ 4 (أ/ محمد مصطفى)
                </h3>
              </div>
              <div className="space-y-2.5">
                {MESHAWIR_LEGAL_DOSSIERS.map((d) => (
                  <div key={d.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900">{d.dossier_title}</span>
                      <span className="text-[11px] font-bold text-amber-700 shrink-0">{d.status}</span>
                    </div>
                    <p className="text-slate-600 mt-1">{d.authority_name} — {d.case_reference}</p>
                    <p className="text-blue-800 font-semibold mt-1">{d.action_required}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2.5">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    {MESHAWIR_SUBSIDIARY.proposal_title}
                  </h3>
                </div>
                <p className="text-xs text-slate-600">
                  المستثمر: <strong>{MESHAWIR_SUBSIDIARY.recipient_investor}</strong> · المقدم:{' '}
                  <strong>{MESHAWIR_SUBSIDIARY.proposed_by}</strong>
                </p>
                <p className="text-xs text-blue-800 font-semibold">{MESHAWIR_SUBSIDIARY.structure}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-700 pt-1">
                  {MESHAWIR_SUBSIDIARY.strategic_objectives.map((obj) => (
                    <div key={obj} className="px-2.5 py-1.5 rounded bg-slate-50 border border-slate-200">
                      {obj}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
                <h3 className="text-sm font-bold text-slate-900">{MESHAWIR_KAGGLE.paper_title}</h3>
                <p className="text-xs text-blue-800 font-semibold">
                  {MESHAWIR_KAGGLE.track_name} · الموعد: {MESHAWIR_KAGGLE.deadline_date} · المؤلف:{' '}
                  {MESHAWIR_KAGGLE.primary_author}
                </p>
                <p className="text-xs font-mono text-slate-600">{MESHAWIR_KAGGLE.framework_model}</p>
                <p className="text-xs text-slate-700 leading-relaxed">{MESHAWIR_KAGGLE.abstract_text}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
