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
  Ticket,
  ClipboardList,
  ShieldAlert,
  Smartphone,
  Truck,
  Layers,
  Lock,
} from 'lucide-react';
import {
  APP_REVIEW_7_LAYERS,
  CAPTAIN_APP_SPECS,
  DARO_FIGMA_AUDIT,
  DIGITAL_ASSETS_12,
  EXTERNAL_SERVICES_17,
  FIREBASE_IOS_CHECKLIST,
  FOURB_FEATURES_18,
  FOURB_PREPAID_TRIPS_DATA,
  FOURB_VEHICLE_CATEGORIES,
  GPS_SECURITY_TEST_01,
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
  NETWORK_VPN_WAVE_SPEC,
  PROPOSED_IDEAS_REGISTRY,
  SAMEH_ROLE_BOUNDARY,
  WEKALA_SPECS,
  type KnowledgeStatus,
  type ProjectTaskItem,
  type SystemInquiryItem,
  type VerificationMatrixItem,
} from '../data/meshawirMasterData';
import {
  answerSystemInquiry,
  loadMeshawirTasks,
  loadSystemInquiries,
  loadVerificationMatrix,
  updateMeshawirTaskStatus,
  updateVerificationItem,
} from '../lib/dataService';

type EcoTab = 'projects' | 'prepaid' | 'team' | 'infra' | 'finance' | 'verification' | 'decisions';

const STATUS_TEXT_CLASS: Record<KnowledgeStatus, string> = {
  'مؤكد': 'text-emerald-700',
  'قيد التنفيذ': 'text-blue-700',
  'مؤجل': 'text-slate-600',
  'مقترح': 'text-amber-700',
  'يحتاج تحققاً': 'text-red-700',
};

const STATUS_BORDER_CLASS: Record<KnowledgeStatus, string> = {
  'مؤكد': 'border-r-emerald-600',
  'قيد التنفيذ': 'border-r-blue-600',
  'مؤجل': 'border-r-slate-400',
  'مقترح': 'border-r-amber-500',
  'يحتاج تحققاً': 'border-r-red-600',
};

export const MeshawirEcosystemView: React.FC = () => {
  const [tab, setTab] = useState<EcoTab>('projects');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | KnowledgeStatus>('all');
  const [tasks, setTasks] = useState<ProjectTaskItem[]>([]);
  const [inquiries, setInquiries] = useState<SystemInquiryItem[]>([]);
  const [verificationItems, setVerificationItems] = useState<VerificationMatrixItem[]>([]);
  const [verCatFilter, setVerCatFilter] = useState<string>('all');
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});

  // Interactive 4B Prepaid Trips B2B Estimator (calculates separated 7 accounting buckets)
  const [b2bBudget, setB2bBudget] = useState<number>(100000);
  const [b2bCoupons, setB2bCoupons] = useState<number>(1000);
  const [b2bIssuancePct, setB2bIssuancePct] = useState<number>(5);
  const [b2b4bDiscountPct, setB2b4bDiscountPct] = useState<number>(3);
  const [b2bRedeemPct, setB2bRedeemPct] = useState<number>(75);

  useEffect(() => {
    let mounted = true;
    Promise.all([loadMeshawirTasks(), loadSystemInquiries(), loadVerificationMatrix()]).then(
      ([tRows, qRows, vRows]) => {
        if (!mounted) return;
        setTasks(tRows);
        setInquiries(qRows);
        setVerificationItems(vRows);
        const drafts: Record<string, string> = {};
        vRows.forEach((v) => {
          drafts[v.id] = v.verificationNote || '';
        });
        setNoteDrafts(drafts);
      }
    );
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

  const handleVerificationStatusChange = async (id: string, status: KnowledgeStatus) => {
    const next = await updateVerificationItem(id, status, noteDrafts[id] ?? '');
    setVerificationItems(next);
  };

  const handleVerificationNoteSave = async (item: VerificationMatrixItem) => {
    const next = await updateVerificationItem(item.id, item.status, noteDrafts[item.id] ?? '');
    setVerificationItems(next);
  };

  const etaTotals = useMemo(() => {
    const grand = MESHAWIR_QUOTATIONS.reduce((s, item) => s + Number(item.total_egp || 0), 0);
    const localHw = MESHAWIR_QUOTATIONS.filter((item) => !item.id.startsWith('qt-we-')).reduce(
      (s, item) => s + Number(item.total_egp || 0),
      0
    );
    const etaCount = MESHAWIR_QUOTATIONS.filter((item) => item.is_tax_invoice).length;
    return { grand, localHw, etaCount };
  }, []);

  const verificationStats = useMemo(() => {
    const counts: Record<KnowledgeStatus, number> = {
      'مؤكد': 0,
      'قيد التنفيذ': 0,
      'مؤجل': 0,
      'مقترح': 0,
      'يحتاج تحققاً': 0,
    };
    verificationItems.forEach((v) => {
      counts[v.status] = (counts[v.status] || 0) + 1;
    });
    return counts;
  }, [verificationItems]);

  const b2bCalc = useMemo(() => {
    const soldValue = Math.max(0, b2bBudget);
    const count = Math.max(1, b2bCoupons);
    const maxPerCoupon = soldValue / count;
    const issuanceFees = Math.round(soldValue * (b2bIssuancePct / 100));
    const discount4b = Math.round(soldValue * (b2b4bDiscountPct / 100));
    const buyerFundedRidePool = Math.max(0, soldValue - issuanceFees);
    const redeemedShare = Math.min(1, Math.max(0, b2bRedeemPct / 100));
    const actualUsedTotal = Math.round(buyerFundedRidePool * redeemedShare);
    const unusedBalance = Math.max(0, buyerFundedRidePool - actualUsedTotal);
    const captainDues = Math.round(actualUsedTotal * 0.85);
    const recognizedRevenue = Math.round(issuanceFees + actualUsedTotal * 0.15 - discount4b);
    return {
      soldValue,
      maxPerCoupon,
      issuanceFees,
      discount4b,
      buyerFundedRidePool,
      captainDues,
      recognizedRevenue,
      unusedBalance,
    };
  }, [b2bBudget, b2bCoupons, b2bIssuancePct, b2b4bDiscountPct, b2bRedeemPct]);

  const q = search.trim().toLowerCase();
  const verCategories = useMemo(
    () => [...new Set(verificationItems.map((v) => v.category))],
    [verificationItems]
  );

  const filteredVerification = useMemo(() => {
    return verificationItems.filter((v) => {
      if (statusFilter !== 'all' && v.status !== statusFilter) return false;
      if (verCatFilter !== 'all' && v.category !== verCatFilter) return false;
      if (!q) return true;
      return (
        v.title.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q) ||
        v.contextNote.toLowerCase().includes(q) ||
        String(v.num).includes(q)
      );
    });
  }, [verificationItems, statusFilter, verCatFilter, q]);

  const tabsList: Array<{ id: EcoTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'projects', label: 'المشاريع (9) ودارو ووكالة', icon: Briefcase },
    { id: 'prepaid', label: '4B Prepaid Trips (B2B)', icon: Ticket },
    { id: 'team', label: 'حوكمة الدور والهيكل (14) والمقر', icon: Users },
    { id: 'infra', label: 'الشبكات وGPS وFirebase (17)', icon: Network },
    { id: 'finance', label: 'فواتير ETA الضريبية (12)', icon: Receipt },
    { id: 'verification', label: `مصفوفة التحقق الـ 30 (${verificationStats['يحتاج تحققاً']} للتحقق)`, icon: ClipboardList },
    { id: 'decisions', label: 'الأصول الـ 12 والمقترحات والقرارات', icon: Scale },
  ];

  return (
    <div className="space-y-6">
      {/* Enterprise Header Strip + Governance Notice */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
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
                السجل التجاري:{' '}
                <strong className="font-mono tabular-nums text-slate-900">
                  {MESHAWIR_ENTERPRISE.commercial_register}
                </strong>
              </span>
              <span>
                البطاقة الضريبية:{' '}
                <strong className="font-mono tabular-nums text-slate-900">
                  {MESHAWIR_ENTERPRISE.tax_number}
                </strong>
              </span>
              <span>
                مدير فرع المعادي والمستشار التقني:{' '}
                <strong className="text-slate-900">{MESHAWIR_ENTERPRISE.branch_manager_name}</strong>
              </span>
              <span>
                مدير قطاع التكنولوجيا:{' '}
                <strong className="text-slate-900">{MESHAWIR_ENTERPRISE.cto_name}</strong>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="بحث في مشاريع أو بنود مشاوير..."
                className="w-full pr-9 pl-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | KnowledgeStatus)}
              className="px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg bg-white text-slate-800"
            >
              <option value="all">كل حالات التصنيف المعرفي</option>
              <option value="مؤكد">مؤكد</option>
              <option value="قيد التنفيذ">قيد التنفيذ</option>
              <option value="مؤجل">مؤجل</option>
              <option value="مقترح">مقترح</option>
              <option value="يحتاج تحققاً">يحتاج تحققاً</option>
            </select>
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
          {tabsList.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border cursor-pointer whitespace-nowrap transition-colors ${
                  tab === item.id
                    ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: 9 PROJECTS + 4 VEHICLES + 18 FEATURES + CAPTAIN + DARO AUDIT + WEKALA + M1..M5 */}
      {tab === 'projects' && (
        <div className="space-y-6">
          {/* Governance Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-2">
            <div>
              <strong className="text-slate-900">أولوية التنفيذ الحاسمة: </strong>
              التركيز الكامل الآن على استلام وتشغيل <strong>4B العملاء</strong> + <strong>كابتن مشاوير</strong> + تجهيز مقر المعادي؛ بينما يظل <strong>Daro</strong> و<strong>WeKaLa</strong> مؤجلين لما بعد 4B دون فريق تشغيل مستقل حالياً.
            </div>
            <span className="font-mono font-semibold text-red-700">
              ملاحظة جودة: اكتمال Figma لا يعني جاهزية الكود في الإنتاج
            </span>
          </div>

          {/* 9 Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MESHAWIR_PROJECTS.filter((p) => {
              if (statusFilter !== 'all' && p.knowledge_status !== statusFilter) return false;
              if (!q) return true;
              return (
                p.name.toLowerCase().includes(q) ||
                p.code.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q)
              );
            }).map((proj) => (
              <div
                key={proj.id}
                className={`bg-white border border-slate-200 border-r-4 ${STATUS_BORDER_CLASS[proj.knowledge_status]} rounded-xl p-4 flex flex-col justify-between space-y-3`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-mono font-bold text-slate-500">
                        {proj.code} · {proj.category}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5">{proj.name}</h3>
                    </div>
                    <span
                      className={`text-xs font-bold shrink-0 ${STATUS_TEXT_CLASS[proj.knowledge_status]}`}
                    >
                      {proj.knowledge_status}
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
                  <span className="font-semibold text-slate-700">{proj.status}</span>
                  <div className="flex items-center gap-3 font-mono tabular-nums">
                    {proj.figma_completion_pct > 0 && (
                      <span className="text-slate-600">Figma {proj.figma_completion_pct}%</span>
                    )}
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
                        className="inline-flex items-center gap-1 text-slate-700 hover:underline"
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

          {/* 4 Vehicle Tiers + Pickup Cargo-Only Rule */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#1E3A5F]" />
                <h3 className="text-sm font-bold text-slate-900">
                  فئات المركبات الأربع المعتمدة في 4B وقواعد التشغيل الصارمة
                </h3>
              </div>
              <span className="text-xs font-semibold text-red-700">
                قيد صارم: فئة النصف نقل (Pickup) للبضائع والطرود فقط ولا تنقل ركاباً
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {FOURB_VEHICLE_CATEGORIES.map((v) => (
                <div
                  key={v.id}
                  className={`p-3.5 rounded-lg border border-slate-200 border-r-4 ${STATUS_BORDER_CLASS[v.knowledgeStatus]} bg-slate-50/50 space-y-1.5 text-xs`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-slate-900">{v.name}</h4>
                    <span className={`font-bold ${STATUS_TEXT_CLASS[v.knowledgeStatus]}`}>
                      {v.knowledgeStatus}
                    </span>
                  </div>
                  <p className="font-semibold text-blue-800">{v.serviceScope}</p>
                  <p className="text-slate-600 leading-relaxed">{v.constraints}</p>
                  <p className="text-[11px] text-slate-500 border-t border-slate-200 pt-1.5">
                    {v.verificationNote}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 18 Core Features List (Requirements Disclaimer) + 7-Layer Review Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  قائمة المزايا الـ 18 لـ 4B (متطلبات مرجعية — ليست كلها مثبتة في الإنتاج)
                </h3>
                <span className="text-[11px] font-semibold text-amber-700">
                  Add Stop تغني عن Shared Load
                </span>
              </div>
              <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 text-xs">
                {FOURB_FEATURES_18.map((f) => (
                  <div key={f.id} className="px-4 py-2.5 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-900">
                        <span className="font-mono text-slate-500 ml-1.5">#{f.id}</span>
                        {f.name}
                      </p>
                      <p className="text-slate-600 mt-0.5">{f.scope}</p>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-600 shrink-0">
                      {f.statusNote}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#1E3A5F]" />
                <h3 className="text-sm font-bold text-slate-900">
                  منهجية المراجعة ذات الطبقات الـ 7 للتطبيقات
                </h3>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                {APP_REVIEW_7_LAYERS.map((layer) => (
                  <div key={layer.layerNumber} className="px-4 py-2.5 space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900 font-mono">
                        {layer.layerNumber}. {layer.name}
                      </span>
                    </div>
                    <p className="text-slate-600">{layer.arabicFocus}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Captain Mashawir 10 Modules */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                تطبيق كابتن مشاوير المستقل — الوحدات الـ 10 الحرجة
              </h3>
              <span className="text-xs font-semibold text-blue-700">
                مستقل تماماً عن تطبيق 4B للعملاء
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {CAPTAIN_APP_SPECS.map((c) => (
                <div
                  key={c.id}
                  className={`p-3 rounded-lg border border-slate-200 border-r-4 ${STATUS_BORDER_CLASS[c.governanceStatus]} bg-slate-50/60`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900">
                      <span className="font-mono text-slate-500 ml-1">#{c.id}</span>
                      {c.module}
                    </span>
                    <span className={`font-bold shrink-0 ${STATUS_TEXT_CLASS[c.governanceStatus]}`}>
                      {c.governanceStatus}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1">{c.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* DARO Figma Audit (24 Nov) + WeKaLa Marketplace 5 Modules */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 text-xs">
              <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    DARO — تدقيق Figma الفعلي ({DARO_FIGMA_AUDIT.auditDate}) · مؤجل لما بعد 4B
                  </h3>
                  <p className="text-slate-600 mt-0.5">{DARO_FIGMA_AUDIT.targetAudience}</p>
                </div>
                <a
                  href={DARO_FIGMA_AUDIT.figmaUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-blue-700 hover:underline font-mono shrink-0"
                >
                  <span>node-id=3214-2</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <p className="font-semibold text-slate-900">{DARO_FIGMA_AUDIT.flightConstraint}</p>
                <p className="text-amber-700 font-semibold">{DARO_FIGMA_AUDIT.autoAnalysisNote}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DARO_FIGMA_AUDIT.categories6.map((cat) => (
                  <div key={cat.id} className="p-2.5 rounded border border-slate-200">
                    <p className="font-bold text-slate-900">{cat.title}</p>
                    <p className="text-slate-600 mt-0.5">{cat.details}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="font-bold text-slate-900 mb-1.5">الأدوار المنطقية الـ 5:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-700">
                  {DARO_FIGMA_AUDIT.logicalRoles5.map((r) => (
                    <div key={r} className="px-2 py-1 border border-slate-200 rounded bg-slate-50">
                      {r}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-bold text-red-700 mb-1.5">
                  المشاكل والعيوب الـ 8 المكتشفة في مراجعة Figma:
                </p>
                <ul className="space-y-1 divide-y divide-slate-100">
                  {DARO_FIGMA_AUDIT.defects8.map((d) => (
                    <li key={d.id} className="pt-1.5 flex items-start justify-between gap-2">
                      <span className="text-slate-700">
                        <strong className="font-mono text-slate-900 ml-1">#{d.id}</strong>
                        {d.title}
                      </span>
                      <span className="font-semibold text-red-700 shrink-0">{d.severity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 text-xs">
              <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    WeKaLa — سوق وكالة الإلكتروني (Marketplace) · مؤجل لما بعد 4B
                  </h3>
                  <p className="text-slate-600 mt-0.5">{WEKALA_SPECS.summary}</p>
                </div>
                <span className="font-bold text-slate-600 shrink-0">مؤجل</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 space-y-1">
                <p>{WEKALA_SPECS.deferralRule}</p>
                <p className="text-red-700 font-semibold">{WEKALA_SPECS.commissionNote}</p>
              </div>
              <div className="space-y-2">
                {WEKALA_SPECS.modules5.map((mod) => (
                  <div key={mod.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                    <p className="font-bold text-slate-900">{mod.name}</p>
                    <p className="text-slate-600 mt-0.5">{mod.description}</p>
                  </div>
                ))}
              </div>
            </div>
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
                      <td className="py-3 px-4 font-mono tabular-nums text-slate-700 whitespace-nowrap" dir="ltr">
                        {m.target_date}
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums font-bold text-blue-700">
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

      {/* TAB 2: 4B PREPAID TRIPS (B2B CORPORATE RIDES) */}
      {tab === 'prepaid' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {FOURB_PREPAID_TRIPS_DATA.workingName}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  المسودة السابقة: {FOURB_PREPAID_TRIPS_DATA.draftName}
                </p>
              </div>
              <span className="text-xs font-bold text-blue-700">قيد التنفيذ · يحتاج تحقق تعاقدي</span>
            </div>
            <p className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-3 leading-relaxed">
              <strong className="text-slate-900">توضيح النطاق التجاري: </strong>
              {FOURB_PREPAID_TRIPS_DATA.domainClarification}
            </p>

            {/* Precedent Alert: Ocean Foods / لامبادا */}
            <div className="border border-amber-300 bg-amber-50/40 rounded-lg p-4 text-xs space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong className="text-slate-900">
                  سابقة تفاوضية مرجعية: {FOURB_PREPAID_TRIPS_DATA.precedentExample.partnerName}
                </strong>
                <span className="font-bold text-red-700">لا يوجد عقد نهائي موقع حتى الآن</span>
              </div>
              <p className="text-slate-700">{FOURB_PREPAID_TRIPS_DATA.precedentExample.note}</p>
              <div className="flex flex-wrap gap-5 pt-1 font-mono tabular-nums text-slate-900 font-semibold">
                <span>الميزانية المذكورة: {FOURB_PREPAID_TRIPS_DATA.precedentExample.budgetEgp.toLocaleString('en-US')} ج.م</span>
                <span>عدد الكوبونات: {FOURB_PREPAID_TRIPS_DATA.precedentExample.couponCount.toLocaleString('en-US')}</span>
                <span>الحد الأقصى للكوبون: {FOURB_PREPAID_TRIPS_DATA.precedentExample.maxCouponValueEgp} ج.م</span>
              </div>
            </div>
          </div>

          {/* Interactive B2B Calculator + 7 Separated Accounting Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-900">
                محاكي الفصل المحاسبي السبعي لـ 4B Prepaid Trips (استرشادي)
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">القيمة المباعة مسبقاً (ج.م)</label>
                  <input
                    type="number"
                    min={1000}
                    step={5000}
                    value={b2bBudget}
                    onChange={(e) => setB2bBudget(Number(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono tabular-nums"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">عدد الكوبونات</label>
                    <input
                      type="number"
                      min={1}
                      value={b2bCoupons}
                      onChange={(e) => setB2bCoupons(Number(e.target.value) || 1)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">متوسط سقف الكوبون</label>
                    <div className="px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 font-mono tabular-nums font-bold text-slate-900">
                      {b2bCalc.maxPerCoupon.toFixed(0)} ج.م
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">رسوم إصدار %</label>
                    <input
                      type="number"
                      min={0}
                      max={40}
                      value={b2bIssuancePct}
                      onChange={(e) => setB2bIssuancePct(Number(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">خصم من 4B %</label>
                    <input
                      type="number"
                      min={0}
                      max={30}
                      value={b2b4bDiscountPct}
                      onChange={(e) => setB2b4bDiscountPct(Number(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">نسبة استخدام %</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={b2bRedeemPct}
                      onChange={(e) => setB2bRedeemPct(Number(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono tabular-nums"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3 grid grid-cols-2 gap-2 font-mono tabular-nums">
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block font-sans">1. القيمة المباعة</span>
                  <strong className="text-slate-900">{b2bCalc.soldValue.toLocaleString('en-US')} ج.م</strong>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block font-sans">4. مستحقات الكباتن</span>
                  <strong className="text-slate-900">{b2bCalc.captainDues.toLocaleString('en-US')} ج.م</strong>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block font-sans">5. رسوم الإصدار</span>
                  <strong className="text-blue-700">{b2bCalc.issuanceFees.toLocaleString('en-US')} ج.م</strong>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block font-sans">7. غير المستخدم</span>
                  <strong className="text-amber-700">{b2bCalc.unusedBalance.toLocaleString('en-US')} ج.م</strong>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                أطوال الأكواد المعتمدة فنياً:{' '}
                <strong className="font-mono text-slate-800">
                  {FOURB_PREPAID_TRIPS_DATA.couponLengths.join(' · ')}
                </strong>{' '}
                حرفاً/خانة. الاعتماد النهائي للتسعير بيد أ/ هاني (CFO) وأ/ أبو خالد.
              </p>
            </div>

            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 space-y-3 text-xs">
              <h3 className="text-sm font-bold text-slate-900">
                البنود المحاسبية الـ 7 المفصولة إلزامياً في تقارير 4B Prepaid Trips
              </h3>
              <div className="divide-y divide-slate-100">
                {FOURB_PREPAID_TRIPS_DATA.accountingMetrics7.map((m) => (
                  <div key={m.key} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="font-bold text-slate-900">{m.label}</span>
                    <span className="text-slate-600">{m.rule}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 9 Dashboard Controls + 5 Use Cases + 3 Sample Models */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-slate-900">ضوابط لوحة التحكم الـ 9 وحالات الاستخدام الـ 5</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {FOURB_PREPAID_TRIPS_DATA.dashboardControls9.map((ctrl) => (
                  <div key={ctrl} className="p-2 rounded border border-slate-200 bg-slate-50 text-slate-800">
                    {ctrl}
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-slate-200">
                <p className="font-bold text-slate-900 mb-1.5">حالات الاستخدام الـ 5 المستهدفة:</p>
                <div className="flex flex-wrap gap-2">
                  {FOURB_PREPAID_TRIPS_DATA.targetUseCases.map((u) => (
                    <span key={u} className="text-blue-800 font-semibold">
                      • {u}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-900">أمثلة مالية استرشادية (مقترحة — غير معتمدة نهائياً)</h3>
                <span className="font-bold text-amber-700">مقترح فقط</span>
              </div>
              <div className="space-y-2.5">
                {FOURB_PREPAID_TRIPS_DATA.sampleModelsUnapproved.map((s) => (
                  <div key={s.name} className="p-3 rounded-lg border border-slate-200 border-r-4 border-r-amber-500 bg-slate-50/50 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900">{s.name}</span>
                      <span className="font-mono tabular-nums font-bold text-slate-900">
                        {s.totalEgp.toLocaleString('en-US')} ج.م
                      </span>
                    </div>
                    <p className="text-slate-600">{s.durationOrTerms}</p>
                    <p className="text-[11px] font-mono tabular-nums text-slate-500">
                      تشغيل: {s.opsCostEgp.toLocaleString('en-US')} ج.م · رحلات/رصيد: {s.ridesOrPromoEgp.toLocaleString('en-US')} ج.م
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ROLE GOVERNANCE BOUNDARY + TEAM 14 + FACILITY 10 ZONES */}
      {tab === 'team' && (
        <div className="space-y-6">
          {/* Sameh Yass Governance Boundary */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="border-b border-slate-200 pb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  الحوكمة والصلاحيات — المهندس سامح يس ({SAMEH_ROLE_BOUNDARY.officialTitle})
                </h3>
                <p className="text-xs text-slate-600 mt-1">{SAMEH_ROLE_BOUNDARY.governancePrinciple}</p>
              </div>
              <span className="text-xs font-bold text-emerald-700">مرجعية مؤكدَة</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
              <div className="border border-emerald-200 bg-emerald-50/30 rounded-lg p-4 space-y-2">
                <h4 className="font-bold text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>يشمل الدور التقني وإدارة المشروعات (11 اختصاصاً):</span>
                </h4>
                <ul className="space-y-1.5 text-slate-700">
                  {SAMEH_ROLE_BOUNDARY.included11.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="border border-red-200 bg-red-50/30 rounded-lg p-4 space-y-2">
                <h4 className="font-bold text-red-800 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>لا يشمل الاعتماد المالي أو التعاقدي (5 حدود صارمة):</span>
                </h4>
                <ul className="space-y-2 text-slate-700">
                  {SAMEH_ROLE_BOUNDARY.excluded5.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 14 Team Profiles */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              ملفات الفريق البشري والقيادات ({MESHAWIR_TEAM_PROFILES.length} عضواً وفريقاً — م/ عماد الشرقاوي أولاً يليه م/ سامح يس)
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
                    <span
                      className={`text-[11px] font-mono tabular-nums font-bold ${
                        member.readiness_status.includes('يحتاج تحقق') ? 'text-red-700' : 'text-emerald-700'
                      }`}
                    >
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

          {/* 10 Maadi Facility Zones */}
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
                      <td className="py-2.5 px-4 font-mono tabular-nums text-slate-600">{z.dimensions_text}</td>
                      <td className="py-2.5 px-4 font-mono tabular-nums font-bold text-blue-700">
                        {z.workstation_ports_count}
                      </td>
                      <td className="py-2.5 px-4 font-mono tabular-nums font-bold text-purple-700">
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

      {/* TAB 4: INFRASTRUCTURE (STATIC IP / WIREGUARD / R730 + GPS TEST 01 + FIREBASE iOS + 17 SERVICES + CCTV + VOIP) */}
      {tab === 'infra' && (
        <div className="space-y-6">
          {/* Static IP, WireGuard VPN + Grandstream Wave + ISO + R730 Historical Note */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                تحديثات الشبكة والأمان والعمل عن بُعد (Static Public IP + WireGuard + Wave)
              </h3>
              <span className="font-bold text-emerald-700">قرار 25 نوفمبر 2026</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-lg border border-slate-200 border-r-4 border-r-emerald-600 space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-900">شراء Static Public IP للمقر</strong>
                  <span className="font-bold text-emerald-700">{NETWORK_VPN_WAVE_SPEC.staticIpStatus}</span>
                </div>
                <p className="text-slate-600">{NETWORK_VPN_WAVE_SPEC.staticPublicIpDecision}</p>
              </div>
              <div className="p-3.5 rounded-lg border border-slate-200 border-r-4 border-r-blue-600 space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-900">{NETWORK_VPN_WAVE_SPEC.remoteWorkPlanTitle}</strong>
                  <span className="font-bold text-blue-700">{NETWORK_VPN_WAVE_SPEC.remoteWorkStatus}</span>
                </div>
                <p className="text-slate-600">{NETWORK_VPN_WAVE_SPEC.concurrentUsersTarget}</p>
                <p className="text-slate-700 font-semibold">{NETWORK_VPN_WAVE_SPEC.waveSecurityRule}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <strong className="text-slate-900">خطوات تهيئة WireGuard على ER8411:</strong>
                <ul className="space-y-1 text-slate-700 pt-1">
                  {NETWORK_VPN_WAVE_SPEC.checklistSteps.map((s) => (
                    <li key={s}>• {s}</li>
                  ))}
                </ul>
              </div>
              <div className="space-y-2">
                <div className="p-3 rounded-lg border border-red-200 bg-red-50/40 text-slate-700">
                  <strong className="text-red-800 block mb-0.5">تنبيه شهادة ISO 27001 وFortiGate:</strong>
                  {NETWORK_VPN_WAVE_SPEC.isoSecurityNote}
                </div>
                <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/40 text-slate-700">
                  <strong className="text-amber-800 block mb-0.5">تمييز الجرد التاريخي (Dell R730 vs R640):</strong>
                  {NETWORK_VPN_WAVE_SPEC.historicalLegacyServerNote}
                </div>
              </div>
            </div>
          </div>

          {/* GPS Integrity Test 01 + Firebase Android & iOS APNs .p8 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  <h3 className="text-sm font-bold text-slate-900">{GPS_SECURITY_TEST_01.id}</h3>
                </div>
                <span className="font-bold text-red-700">يحتاج تحققاً ميدانياً</span>
              </div>
              <p className="p-3 rounded-lg bg-red-50/50 border border-red-200 text-red-900 font-semibold leading-relaxed">
                {GPS_SECURITY_TEST_01.disclaimer23Nov}
              </p>
              <div>
                <p className="font-bold text-slate-900 mb-1">الشروط المسبقة الـ 5 لاختبار الرحلة الكامل E2E:</p>
                <ul className="space-y-1 text-slate-700">
                  {GPS_SECURITY_TEST_01.prerequisites5.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
              <div className="border-t border-slate-200 pt-2">
                <p className="font-bold text-slate-900 mb-1.5">فحوصات GPS الـ 9 على هاتف حقيقي:</p>
                <div className="space-y-1 max-h-60 overflow-y-auto divide-y divide-slate-100">
                  {GPS_SECURITY_TEST_01.checks9.map((c) => (
                    <div key={c.id} className="pt-1 flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-800">
                        <span className="font-mono text-slate-500 ml-1">#{c.id}</span>
                        {c.check}
                      </span>
                      <span className="text-slate-600">{c.target}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#1E3A5F]" />
                  <h3 className="text-sm font-bold text-slate-900">
                    فحص Firebase &amp; إشعارات الدفع (Android + iOS APNs .p8)
                  </h3>
                </div>
                <span className="font-bold text-blue-700">قيد التنفيذ</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                <p className="font-bold text-slate-900">أولاً: متطلبات Android (FCM OAuth2 V1):</p>
                <ul className="space-y-1 text-slate-700 list-disc list-inside">
                  {FIREBASE_IOS_CHECKLIST.android.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </div>
              <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/40 space-y-1">
                <p className="font-bold text-slate-900">ثانياً: متطلبات iOS وملف APNs .p8 (ممنوع رفعه على GitHub):</p>
                <ul className="space-y-1 text-slate-700 list-disc list-inside">
                  {FIREBASE_IOS_CHECKLIST.ios.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 17 External Services Matrix */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                مصفوفة الخدمات والتكاملات الخارجية الـ 17 (تمييز الربط الحي من قيد التنفيذ/المطلوب تحققه)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-700">
                  <tr>
                    <th className="py-2.5 px-4 text-right">الخدمة</th>
                    <th className="py-2.5 px-4 text-right">الدور بالمنظومة</th>
                    <th className="py-2.5 px-4 text-right">الحالة الحقيقية</th>
                    <th className="py-2.5 px-4 text-right">ملاحظات الحوكمة والتشغيل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {EXTERNAL_SERVICES_17.filter(
                    (s) =>
                      (statusFilter === 'all' || s.knowledgeStatus === statusFilter) &&
                      (!q || s.name.toLowerCase().includes(q) || s.notes.toLowerCase().includes(q))
                  ).map((srv) => (
                    <tr key={srv.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-4 font-bold text-slate-900">{srv.name}</td>
                      <td className="py-2.5 px-4 text-slate-700">{srv.role}</td>
                      <td className={`py-2.5 px-4 font-bold whitespace-nowrap ${STATUS_TEXT_CLASS[srv.knowledgeStatus]}`}>
                        {srv.knowledgeStatus}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">{srv.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4 Live Telecom & Fiber Circuits */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
              <Network className="w-4 h-4 text-[#1E3A5F]" />
              <h3 className="text-sm font-bold text-slate-900">
                دوائر الاتصالات والإنترنت الحية بمقر المعادي (ER8411 + Grandstream 604A + WE L3VPN)
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
                      <td className="py-2.5 px-4 font-mono tabular-nums font-bold text-slate-900">
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

      {/* TAB 5: ETA TAX INVOICES & FINANCIAL LEDGER */}
      {tab === 'finance' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <span className="text-xs text-slate-500">فواتير العتاد المحلي بالمقر</span>
              <p className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                {etaTotals.localHw.toLocaleString('en-US')} ج.م
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <span className="text-xs text-slate-500">إجمالي السجل (شامل عقود WE السنوية)</span>
              <p className="text-2xl font-bold font-mono tabular-nums text-[#1E3A5F] mt-1">
                {etaTotals.grand.toLocaleString('en-US')} ج.م
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <span className="text-xs text-slate-500">فواتير ضريبية موثقة ETA</span>
              <p className="text-2xl font-bold font-mono tabular-nums text-emerald-700 mt-1">
                {etaTotals.etaCount} / {MESHAWIR_QUOTATIONS.length}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700">
            <strong className="text-slate-900">فصل الذمة المالية الكامل: </strong>
            كافة التوريدات والأصول والبنود الخاصة بمطعم العجوزة تُدار مالياً بشكل منفصل تماماً تحت إشراف الأستاذ هاني (CFO) وأ/ أبو خالد ولا تُخلط بحسابات شركة مشاوير أو 4B.
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
                      <td className="py-3 px-4 font-mono tabular-nums text-slate-600" dir="ltr">
                        {inv.submission_date}
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums font-bold text-slate-900">
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

      {/* TAB 6: INTERACTIVE 30-POINT VERIFICATION MATRIX */}
      {tab === 'verification' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {(['مؤكد', 'قيد التنفيذ', 'يحتاج تحققاً', 'مؤجل', 'مقترح'] as KnowledgeStatus[]).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter((prev) => (prev === st ? 'all' : st))}
                className={`text-right bg-white border rounded-xl p-3.5 cursor-pointer transition-colors ${
                  statusFilter === st ? 'border-[#1E3A5F] bg-slate-50' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className={`text-xs font-bold block ${STATUS_TEXT_CLASS[st]}`}>{st}</span>
                <strong className="text-2xl font-mono tabular-nums text-slate-900 block mt-1">
                  {verificationStats[st]}
                </strong>
              </button>
            ))}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-800">تصفية بالمجال:</span>
              <select
                value={verCatFilter}
                onChange={(e) => setVerCatFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800"
              >
                <option value="all">كل المجالات ({verificationItems.length} بنداً)</option>
                {verCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-slate-600 font-mono tabular-nums">
              المعروض: {filteredVerification.length} من 30 — تحفظ التعديلات في Supabase والذاكرة المحلية
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
            {filteredVerification.map((item) => (
              <div
                key={item.id}
                className={`p-4 border-r-4 ${STATUS_BORDER_CLASS[item.status]} flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs`}
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono tabular-nums font-bold text-slate-500">
                      #{String(item.num).padStart(2, '0')}
                    </span>
                    <span className="font-bold text-blue-800">{item.category}</span>
                    <span className="text-slate-400">·</span>
                    <span className={`font-bold ${STATUS_TEXT_CLASS[item.status]}`}>{item.status}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900">{item.title}</p>
                  <p className="text-slate-600">{item.contextNote}</p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 lg:w-[440px]">
                  <input
                    type="text"
                    value={noteDrafts[item.id] ?? ''}
                    onChange={(e) =>
                      setNoteDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))
                    }
                    placeholder="ملاحظة التحقق أو المرجع الرسمي..."
                    className="flex-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleVerificationNoteSave(item)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg border border-slate-300 whitespace-nowrap cursor-pointer"
                  >
                    حفظ
                  </button>
                  <select
                    value={item.status}
                    onChange={(e) =>
                      handleVerificationStatusChange(item.id, e.target.value as KnowledgeStatus)
                    }
                    className={`px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-lg bg-white ${STATUS_TEXT_CLASS[item.status]}`}
                  >
                    <option value="يحتاج تحققاً">يحتاج تحققاً</option>
                    <option value="قيد التنفيذ">قيد التنفيذ</option>
                    <option value="مؤكد">مؤكد</option>
                    <option value="مؤجل">مؤجل</option>
                    <option value="مقترح">مقترح</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: DIGITAL ASSETS 12 + PROPOSED IDEAS + LEGAL + SUBSIDIARY + KAGGLE + TASKS + INQUIRIES */}
      {tab === 'decisions' && (
        <div className="space-y-6">
          {/* 12 Digital Assets + Proposed Commercial & Structural Ideas + Temp Legal Disclaimer */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  سجل الأصول الرقمية والبرمجية الـ 12 الواجب حصرها واستلامها
                </h3>
                <span className="font-bold text-red-700">شرط السداد النهائي</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DIGITAL_ASSETS_12.map((asset) => (
                  <div
                    key={asset}
                    className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 text-slate-800 font-medium"
                  >
                    {asset}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  الأفكار المقترحة غير المعتمدة وقاعدة Add Stop vs Shared Load
                </h3>
                <span className="font-bold text-amber-700">لا تُقدّم كأنظمة قائمة</span>
              </div>
              <div className="space-y-2">
                {PROPOSED_IDEAS_REGISTRY.map((p) => (
                  <div
                    key={p.id}
                    className={`p-2.5 rounded-lg border border-slate-200 border-r-4 ${STATUS_BORDER_CLASS[p.status]} bg-slate-50/50 space-y-0.5`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900">{p.name}</span>
                      <span className={`font-bold ${STATUS_TEXT_CLASS[p.status]}`}>{p.status}</span>
                    </div>
                    <p className="text-slate-700">{p.summary}</p>
                    <p className="text-[11px] text-slate-500">{p.governanceNote}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Temporary Legal Drafts Warning */}
          <div className="bg-white border border-amber-300 rounded-xl p-4 text-xs text-slate-800">
            <strong className="text-amber-800">قاعدة العقود والمستندات القانونية المؤقتة: </strong>
            أي نموذج اتفاقية عدم إفصاح (NDA) أو مسودة عقد سابقة أُعدّت كمستند تمهيدي/استرشادي فقط؛ لا تحل محل المراجعة القانونية ولا تُعتمد تجارياً إلا عبر المستشار القانوني <strong>الأستاذ محمد مصطفى</strong> وتوقيع المالك <strong>أ/ أبو خالد</strong>.
          </div>

          {/* 5 Strategic Inquiries */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">
                الاستفسارات والقرارات الاستراتيجية الحرجة (5 محاور محدثة)
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className={`p-4 rounded-xl border ${
                    inq.answered
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : 'bg-amber-50/40 border-amber-200'
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
