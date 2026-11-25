import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  BellRing,
  CheckCircle2,
  Clock,
  Download,
  Globe,
  ListTodo,
  Receipt,
  RefreshCw,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { JOINT_TASKS_DATA, type JointTaskItem } from '../data/jointTasks';
import { MESHAWIR_MILESTONES, type ProjectTaskItem } from '../data/meshawirMasterData';
import { listDueRows, listTableRows, loadMeshawirTasks, updateMeshawirTaskStatus } from '../lib/dataService';
import {
  DEFAULT_ALERT_LEAD_DAYS,
  daysLeft,
  exportRowsToCsv,
  formatMoney,
  getAlertLeadDays,
  getDueStatus,
  saveAlertLeadDays,
} from '../lib/supabase';
import type { AnyRecord, AppRecord, DeliverableRecord, DueRow } from '../types/crm';

interface ExecutiveDashboardProps {
  onSelectApp: (appId: string) => void;
}

const CAT_COLORS: Record<string, string> = {
  الاتصالات: '#1E3A5F',
  'الدومينات والاستضافة': '#2563EB',
  'مزودو الخدمات': '#0D9488',
};

function readJointTasksSnapshot(): JointTaskItem[] {
  if (typeof window === 'undefined') return JOINT_TASKS_DATA;
  try {
    const raw = window.localStorage.getItem('noub_crm_joint_tasks_v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed as JointTaskItem[];
    }
  } catch {
    // fallback to seed
  }
  return JOINT_TASKS_DATA;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ onSelectApp }) => {
  const [dueRows, setDueRows] = useState<DueRow[]>([]);
  const [apps, setApps] = useState<AppRecord[]>([]);
  const [deliverables, setDeliverables] = useState<DeliverableRecord[]>([]);
  const [domains, setDomains] = useState<AnyRecord[]>([]);
  const [payments, setPayments] = useState<AnyRecord[]>([]);
  const [meshawirTasks, setMeshawirTasks] = useState<ProjectTaskItem[]>([]);
  const [jointTasks, setJointTasks] = useState<JointTaskItem[]>(readJointTasksSnapshot);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alertLeadDays, setAlertLeadDays] = useState<number>(() => getAlertLeadDays());
  const [notifSettingsOpen, setNotifSettingsOpen] = useState(false);
  const [draftLeadDays, setDraftLeadDays] = useState<string>(() => String(getAlertLeadDays()));
  const [alertFilter, setAlertFilter] = useState<'urgent' | 'overdue' | 'near' | 'all'>('urgent');
  const [statusFilter, setStatusFilter] = useState<'all' | 'bad' | 'warn' | 'ok'>('all');
  const [catFilter, setCatFilter] = useState<string>('all');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dueData, appsData, dlData, domainsData, paymentsData, mTasksData] = await Promise.all([
        listDueRows(),
        listTableRows('apps'),
        listTableRows('deliverables'),
        listTableRows('domains'),
        listTableRows('payments'),
        loadMeshawirTasks(),
      ]);
      setDueRows(dueData);
      setApps(appsData as AppRecord[]);
      setDeliverables(dlData as DeliverableRecord[]);
      setDomains(domainsData);
      setPayments(paymentsData);
      setMeshawirTasks(mTasksData);
      setJointTasks(readJointTasksSnapshot());
    } catch (err: any) {
      setError(err?.message || 'تعذر تحميل بيانات الملخص.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const metrics = useMemo(() => {
    const late = dueRows.filter((r) => r.days_left < 0);
    const wNear = dueRows.filter((r) => r.days_left >= 0 && r.days_left <= alertLeadDays);
    const m30 = dueRows.filter((r) => r.days_left >= 0 && r.days_left <= 30);
    const sum = (list: DueRow[]) => list.reduce((acc, r) => acc + Number(r.amount || 0), 0);

    const activeDomains = domains.filter((d) => {
      const left = daysLeft(d.due_date);
      return left === null || left >= 0;
    });
    const activeDomainEntriesOnly = activeDomains.filter((d) => d.kind === 'دومين').length;
    const totalPaymentsAmount = payments.reduce((acc, p) => acc + Number(p.amount || 0), 0);
    const pendingMeshawirCount = meshawirTasks.filter((t) => t.status === 'pending').length;
    const pendingJointCount = jointTasks.filter((t) => t.status === 'لم يتم').length;
    const pendingTasksCount = pendingMeshawirCount + pendingJointCount;

    return {
      lateCount: late.length,
      lateAmount: sum(late),
      w7Count: wNear.length,
      m30Amount: sum(m30),
      activeDomainsCount: activeDomains.length,
      totalDomainsCount: domains.length,
      activeDomainEntriesOnly,
      totalPaymentsAmount,
      paymentsCount: payments.length,
      pendingTasksCount,
      pendingMeshawirCount,
      pendingJointCount,
    };
  }, [dueRows, domains, payments, meshawirTasks, jointTasks, alertLeadDays]);

  const categoryBreakdown = useMemo(() => {
    const map: Record<string, { amount: number; count: number }> = {};
    dueRows.forEach((r) => {
      if (!map[r.cat]) map[r.cat] = { amount: 0, count: 0 };
      map[r.cat].amount += Number(r.amount || 0);
      map[r.cat].count += 1;
    });
    const total = Object.values(map).reduce((s, item) => s + item.amount, 0);
    const items = Object.entries(map).map(([cat, info]) => ({
      cat,
      amount: info.amount,
      count: info.count,
      pct: total > 0 ? (info.amount / total) * 100 : 0,
      color: CAT_COLORS[cat] || '#475569',
    }));
    return { total, items };
  }, [dueRows]);

  const appStats = useMemo(() => {
    return apps.map((app) => {
      const items = deliverables.filter((d) => d.app_id === app.id);
      const done = items.filter((d) => d.status === 'تم الاستلام').length;
      const inProg = items.filter((d) => d.status === 'قيد التنفيذ').length;
      const revision = items.filter((d) => d.status === 'يحتاج تعديل').length;
      const notStarted = items.length - done - inProg - revision;
      const pct = items.length > 0 ? Math.round((done / items.length) * 100) : 0;
      return { app, total: items.length, done, inProg, revision, notStarted, pct };
    });
  }, [apps, deliverables]);

  const categories = useMemo(
    () => Array.from(new Set(dueRows.map((r) => r.cat))).filter(Boolean),
    [dueRows]
  );

  const filteredDue = useMemo(() => {
    return dueRows.filter((r) => {
      if (catFilter !== 'all' && r.cat !== catFilter) return false;
      if (statusFilter === 'all') return true;
      const st = getDueStatus(r.days_left, alertLeadDays);
      return st?.tone === statusFilter;
    });
  }, [dueRows, statusFilter, catFilter, alertLeadDays]);

  const appNameById = useMemo(() => new Map(apps.map((a) => [a.id, a.name])), [apps]);

  const taskAlerts = useMemo(() => {
    type AlertItem = {
      id: string;
      source: 'task' | 'milestone' | 'deliverable';
      sourceLabel: string;
      title: string;
      category: string;
      owner: string;
      statusLabel: string;
      due_date: string;
      days_left: number;
      urgency: 'overdue' | 'near' | 'scheduled';
      appId?: string;
    };

    const items: AlertItem[] = [];
    const classify = (left: number): 'overdue' | 'near' | 'scheduled' =>
      left < 0 ? 'overdue' : left <= alertLeadDays ? 'near' : 'scheduled';

    meshawirTasks.forEach((t) => {
      if (t.status === 'completed' || !t.due_date) return;
      const left = daysLeft(t.due_date);
      if (left === null) return;
      items.push({
        id: t.id,
        source: 'task',
        sourceLabel: `مهمة #${t.task_number}`,
        title: t.title,
        category: t.category,
        owner: t.assigned_to,
        statusLabel: t.status === 'in_progress' ? 'جاري التنفيذ' : 'معلقة',
        due_date: t.due_date,
        days_left: left,
        urgency: classify(left),
      });
    });

    MESHAWIR_MILESTONES.forEach((m) => {
      if (m.completion_percentage >= 100 || !m.target_date) return;
      const left = daysLeft(m.target_date);
      if (left === null) return;
      items.push({
        id: m.id,
        source: 'milestone',
        sourceLabel: `مرحلة ${m.phase_code}`,
        title: m.title,
        category: 'خطة تسليم 4B',
        owner: m.sign_off_by,
        statusLabel: `${m.status} (${m.completion_percentage}%)`,
        due_date: m.target_date,
        days_left: left,
        urgency: classify(left),
      });
    });

    deliverables.forEach((d) => {
      if (d.status === 'تم الاستلام' || !d.end_date) return;
      const left = daysLeft(d.end_date);
      if (left === null) return;
      items.push({
        id: d.id,
        source: 'deliverable',
        sourceLabel: appNameById.get(d.app_id) || 'تسليم تطبيق',
        title: d.item,
        category: d.stage || 'التسليمات',
        owner: d.owner || 'غير محدد',
        statusLabel: d.status || 'لم يبدأ',
        due_date: d.end_date,
        days_left: left,
        urgency: classify(left),
        appId: d.app_id,
      });
    });

    return items.sort((a, b) => a.days_left - b.days_left);
  }, [meshawirTasks, deliverables, appNameById, alertLeadDays]);

  const alertCounts = useMemo(() => {
    const overdue = taskAlerts.filter((t) => t.urgency === 'overdue').length;
    const near = taskAlerts.filter((t) => t.urgency === 'near').length;
    return { overdue, near, urgent: overdue + near, total: taskAlerts.length };
  }, [taskAlerts]);

  const filteredTaskAlerts = useMemo(() => {
    if (alertFilter === 'overdue') return taskAlerts.filter((t) => t.urgency === 'overdue');
    if (alertFilter === 'near') return taskAlerts.filter((t) => t.urgency === 'near');
    if (alertFilter === 'urgent') return taskAlerts.filter((t) => t.urgency !== 'scheduled');
    return taskAlerts;
  }, [taskAlerts, alertFilter]);

  const parsedDraftDays = useMemo(() => {
    const num = Number(draftLeadDays);
    if (!Number.isFinite(num) || num < 1) return 1;
    if (num > 60) return 60;
    return Math.round(num);
  }, [draftLeadDays]);

  const previewNearCount = useMemo(() => {
    const tasksMatch = taskAlerts.filter((t) => t.days_left >= 0 && t.days_left <= parsedDraftDays).length;
    const duesMatch = dueRows.filter((r) => r.days_left >= 0 && r.days_left <= parsedDraftDays).length;
    return { tasksMatch, duesMatch };
  }, [taskAlerts, dueRows, parsedDraftDays]);

  const openNotifSettings = () => {
    setDraftLeadDays(String(alertLeadDays));
    setNotifSettingsOpen(true);
  };

  const handleSaveNotifSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const saved = saveAlertLeadDays(parsedDraftDays);
    setAlertLeadDays(saved);
    setNotifSettingsOpen(false);
  };

  const handleResetNotifSettings = () => {
    const saved = saveAlertLeadDays(DEFAULT_ALERT_LEAD_DAYS);
    setAlertLeadDays(saved);
    setDraftLeadDays(String(saved));
    setNotifSettingsOpen(false);
  };

  const formatDaysWindowLabel = (days: number) => {
    if (days === 1) return 'يوم واحد';
    if (days === 2) return 'يومين';
    if (days <= 10) return `${days} أيام`;
    return `${days} يوماً`;
  };

  const handleCompleteTaskAlert = async (taskId: string) => {
    const updated = await updateMeshawirTaskStatus(taskId, 'completed');
    setMeshawirTasks(updated);
  };

  const formatCountdown = (left: number) => {
    if (left < 0) return `متأخرة بـ ${Math.abs(left)} يوم`;
    if (left === 0) return 'تستحق اليوم';
    if (left === 1) return 'تستحق غداً';
    return `متبقي ${left} أيام`;
  };

  const handleExportDue = () => {
    exportRowsToCsv(
      'noub-crm-dues',
      ['الفئة', 'البند', 'المبلغ (ج.م)', 'تاريخ الاستحقاق', 'الأيام المتبقية', 'الحالة'],
      filteredDue.map((r) => {
        const st = getDueStatus(r.days_left, alertLeadDays);
        return [r.cat, r.item, r.amount ?? 0, r.due_date, r.days_left, st?.label || ''];
      })
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-white border border-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white border border-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-64 bg-white border border-slate-200 rounded-xl animate-pulse" />
          <div className="h-64 bg-white border border-slate-200 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-800 space-y-3">
        <div className="flex items-center gap-2 font-bold">
          <AlertTriangle className="w-5 h-5" />
          <span>تعذر تحميل لوحة الملخص</span>
        </div>
        <p className="text-sm">{error}</p>
        <button
          type="button"
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-semibold rounded-lg cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>إعادة المحاولة</span>
        </button>
      </div>
    );
  }

  // Donut arc calculations for category financial commitments
  let cumulativePct = 0;
  const radius = 56;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="space-y-6">
      {/* 4-column KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className={`rounded-xl border p-5 ${
            metrics.lateCount > 0 ? 'bg-red-50/70 border-red-200' : 'bg-white border-slate-200'
          }`}
        >
          <p className="text-xs font-semibold text-slate-600">بنود متأخرة عن السداد</p>
          <p
            className={`mt-2 text-3xl font-bold font-mono tabular-nums ${
              metrics.lateCount > 0 ? 'text-red-700' : 'text-slate-900'
            }`}
          >
            {metrics.lateCount}
          </p>
          <p className="mt-1 text-xs text-slate-500">تتطلب متابعة فورية</p>
        </div>

        <div
          className={`rounded-xl border p-5 ${
            metrics.lateCount > 0 ? 'bg-red-50/70 border-red-200' : 'bg-white border-slate-200'
          }`}
        >
          <p className="text-xs font-semibold text-slate-600">إجمالي المبلغ المتأخر</p>
          <p
            className={`mt-2 text-3xl font-bold font-mono tabular-nums ${
              metrics.lateCount > 0 ? 'text-red-700' : 'text-slate-900'
            }`}
          >
            {formatMoney(metrics.lateAmount)}
          </p>
          <p className="mt-1 text-xs text-slate-500">جنيه مصري (ج.م)</p>
        </div>

        <div
          className={`rounded-xl border p-5 ${
            metrics.w7Count > 0 ? 'bg-amber-50/70 border-amber-200' : 'bg-white border-slate-200'
          }`}
        >
          <p className="text-xs font-semibold text-slate-600">
            مستحق خلال {formatDaysWindowLabel(alertLeadDays)}
          </p>
          <p
            className={`mt-2 text-3xl font-bold font-mono tabular-nums ${
              metrics.w7Count > 0 ? 'text-amber-700' : 'text-slate-900'
            }`}
          >
            {metrics.w7Count}
          </p>
          <p className="mt-1 text-xs text-slate-500">بنود قريبة الاستحقاق</p>
        </div>

        <div className="rounded-xl border bg-white border-slate-200 p-5">
          <p className="text-xs font-semibold text-slate-600">مستحق خلال 30 يوماً</p>
          <p className="mt-2 text-3xl font-bold font-mono tabular-nums text-[#1E3A5F]">
            {formatMoney(metrics.m30Amount)}
          </p>
          <p className="mt-1 text-xs text-slate-500">جنيه مصري (ج.م)</p>
        </div>
      </div>

      {/* 3-column Operational & Financial KPIs: Active Domains, Total Payments, Pending Tasks */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-white border-slate-200 p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-slate-600">الدومينات والاستضافة النشطة</p>
            <Globe className="w-4 h-4 text-[#1E3A5F] shrink-0" />
          </div>
          <p className="mt-2 text-3xl font-bold font-mono tabular-nums text-emerald-700">
            {metrics.activeDomainsCount}
          </p>
          <p className="mt-1 text-xs text-slate-500 font-mono tabular-nums">
            من إجمالي {metrics.totalDomainsCount} مسجلة ({metrics.activeDomainEntriesOnly} نطاقات)
          </p>
        </div>

        <div className="rounded-xl border bg-white border-slate-200 p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-slate-600">إجمالي المدفوعات المسجلة</p>
            <Receipt className="w-4 h-4 text-[#1E3A5F] shrink-0" />
          </div>
          <p className="mt-2 text-3xl font-bold font-mono tabular-nums text-[#1E3A5F]">
            {formatMoney(metrics.totalPaymentsAmount)}
          </p>
          <p className="mt-1 text-xs text-slate-500 font-mono tabular-nums">
            ج.م · عبر {metrics.paymentsCount} عملية سداد
          </p>
        </div>

        <div
          className={`rounded-xl border p-5 ${
            metrics.pendingTasksCount > 0 ? 'bg-amber-50/50 border-amber-200' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-slate-600">عدد المهام المعلقة</p>
            <ListTodo className="w-4 h-4 text-amber-700 shrink-0" />
          </div>
          <p
            className={`mt-2 text-3xl font-bold font-mono tabular-nums ${
              metrics.pendingTasksCount > 0 ? 'text-amber-700' : 'text-emerald-700'
            }`}
          >
            {metrics.pendingTasksCount}
          </p>
          <p className="mt-1 text-xs text-slate-500 font-mono tabular-nums">
            {metrics.pendingJointCount} مشتركة (لم يتم) · {metrics.pendingMeshawirCount} مشاوير معلقة
          </p>
        </div>
      </div>

      {/* Due-Date Alerts Panel for Overdue & Upcoming Tasks */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${
                alertCounts.overdue > 0
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : alertCounts.near > 0
                    ? 'bg-amber-50 border-amber-200 text-amber-700'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}
            >
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                تنبيهات المهام القريبة والمتأخرة عن تاريخ الاستحقاق
              </h2>
              <p className="text-xs text-slate-600 mt-0.5 font-mono tabular-nums">
                <span className={alertCounts.overdue > 0 ? 'text-red-700 font-bold' : ''}>
                  {alertCounts.overdue} مهام متأخرة (بالأحمر)
                </span>
                {' · '}
                <span className={alertCounts.near > 0 ? 'text-amber-700 font-bold' : ''}>
                  {alertCounts.near} قريبة خلال {formatDaysWindowLabel(alertLeadDays)}
                </span>
                {' · '}
                <span>{alertCounts.total} إجمالي المهام المجدولة</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {[
                { id: 'urgent', label: `العاجلة (${alertCounts.urgent})` },
                { id: 'overdue', label: `متأخرة (${alertCounts.overdue})` },
                { id: 'near', label: `قريبة الاستحقاق (${alertCounts.near})` },
                { id: 'all', label: `الكل (${alertCounts.total})` },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setAlertFilter(opt.id as any)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    alertFilter === opt.id
                      ? opt.id === 'overdue'
                        ? 'bg-red-700 text-white'
                        : 'bg-white text-slate-900 shadow-xs'
                      : opt.id === 'overdue' && alertCounts.overdue > 0
                        ? 'text-red-700 hover:text-red-900'
                        : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={openNotifSettings}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
              title="إعدادات تنبيهات المهام (Dashboard Notifications)"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#1E3A5F]" />
              <span>إعدادات التنبيهات ({alertLeadDays} أيام)</span>
            </button>
          </div>
        </div>

        <div className="p-4 space-y-2.5">
          {filteredTaskAlerts.length === 0 ? (
            <div className="py-8 text-center text-sm text-emerald-700 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>لا توجد مهام متأخرة أو قريبة الاستحقاق ضمن هذا الفلتر.</span>
            </div>
          ) : (
            filteredTaskAlerts.map((item) => {
              const isOverdue = item.urgency === 'overdue';
              const isNear = item.urgency === 'near';
              return (
                <div
                  key={`${item.source}-${item.id}`}
                  className={`rounded-lg border p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors ${
                    isOverdue
                      ? 'bg-red-50/90 border-red-300 text-red-950'
                      : isNear
                        ? 'bg-amber-50/75 border-amber-200 text-slate-900'
                        : 'bg-white border-slate-200 text-slate-900'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`mt-0.5 shrink-0 ${
                        isOverdue ? 'text-red-600' : isNear ? 'text-amber-600' : 'text-slate-400'
                      }`}
                      title={
                        isOverdue
                          ? 'مهمة متأخرة عن تاريخ الاستحقاق'
                          : isNear
                            ? 'تنبيه: مهمة قريبة من تاريخ الاستحقاق'
                            : 'مهمة مجدولة'
                      }
                    >
                      {isOverdue ? (
                        <AlertTriangle className="w-5 h-5" />
                      ) : isNear ? (
                        <BellRing className="w-5 h-5" />
                      ) : (
                        <Clock className="w-5 h-5" />
                      )}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span
                          className={`font-bold ${
                            isOverdue ? 'text-red-700' : isNear ? 'text-amber-800' : 'text-[#1E3A5F]'
                          }`}
                        >
                          {item.sourceLabel}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className={isOverdue ? 'text-red-700/80' : 'text-slate-500'}>
                          {item.category}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className={isOverdue ? 'text-red-700 font-semibold' : 'text-slate-600'}>
                          {item.statusLabel}
                        </span>
                      </div>

                      <p
                        className={`text-sm font-bold leading-snug ${
                          isOverdue ? 'text-red-800' : 'text-slate-900'
                        }`}
                      >
                        {item.title}
                      </p>

                      <p className={`text-xs ${isOverdue ? 'text-red-700/90' : 'text-slate-500'}`}>
                        المسؤول: {item.owner}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pr-8 md:pr-0">
                    <div className="text-left md:text-left">
                      <p
                        className={`text-xs font-bold font-mono tabular-nums flex items-center gap-1.5 ${
                          isOverdue ? 'text-red-700' : isNear ? 'text-amber-700' : 'text-slate-600'
                        }`}
                      >
                        {(isOverdue || isNear) && (
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        )}
                        <span>{formatCountdown(item.days_left)}</span>
                      </p>
                      <p
                        className={`text-xs font-mono tabular-nums mt-0.5 ${
                          isOverdue ? 'text-red-600 font-semibold' : 'text-slate-500'
                        }`}
                        dir="ltr"
                      >
                        {item.due_date}
                      </p>
                    </div>

                    {item.source === 'task' && (
                      <button
                        type="button"
                        onClick={() => handleCompleteTaskAlert(item.id)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border whitespace-nowrap cursor-pointer transition-colors ${
                          isOverdue
                            ? 'bg-red-700 hover:bg-red-800 text-white border-red-800'
                            : 'bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-300'
                        }`}
                      >
                        تحديد كمكتمل
                      </button>
                    )}

                    {item.source === 'deliverable' && item.appId && (
                      <button
                        type="button"
                        onClick={() => onSelectApp(item.appId!)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 whitespace-nowrap cursor-pointer"
                      >
                        عرض التطبيق
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* App Readiness & Deliverables Stacked Chart */}
        <section className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">مؤشر جاهزية التطبيقات ونسبة الاستلام</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                اضغط على أي تطبيق لعرض المراحل والهيكل الوظيفي الخاص به
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-600 shrink-0">
              <span className="inline-flex items-center gap-1.5">
                <i className="w-2.5 h-2.5 rounded-xs bg-emerald-600 inline-block" />
                تم الاستلام
              </span>
              <span className="inline-flex items-center gap-1.5">
                <i className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block" />
                قيد التنفيذ
              </span>
              <span className="inline-flex items-center gap-1.5">
                <i className="w-2.5 h-2.5 rounded-xs bg-red-500 inline-block" />
                يحتاج تعديل
              </span>
            </div>
          </div>

          {appStats.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">لا توجد تطبيقات مسجلة بعد.</p>
          ) : (
            <div className="space-y-4">
              {appStats.map(({ app, total, done, inProg, revision, notStarted, pct }) => {
                const doneW = total ? (done / total) * 100 : 0;
                const progW = total ? (inProg / total) * 100 : 0;
                const revW = total ? (revision / total) * 100 : 0;
                return (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => onSelectApp(app.id)}
                    className="w-full text-right p-3.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-slate-50/70 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-bold text-slate-900 truncate">{app.name}</span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs text-slate-600 whitespace-nowrap">
                          {app.status || 'لم يبدأ'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-slate-500 font-mono tabular-nums">
                          {done}/{total} بند
                        </span>
                        <span className="text-sm font-bold font-mono tabular-nums text-[#1E3A5F]">
                          {pct}%
                        </span>
                        <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </div>

                    <div className="h-3 w-full bg-slate-100 rounded-md overflow-hidden flex">
                      {doneW > 0 && <div style={{ width: `${doneW}%` }} className="bg-emerald-600 h-full" />}
                      {progW > 0 && <div style={{ width: `${progW}%` }} className="bg-amber-500 h-full" />}
                      {revW > 0 && <div style={{ width: `${revW}%` }} className="bg-red-500 h-full" />}
                    </div>

                    <div className="mt-2 flex items-center gap-4 text-xs text-slate-500 tabular-nums">
                      <span>تم الاستلام: {done}</span>
                      <span>قيد التنفيذ: {inProg}</span>
                      <span>يحتاج تعديل: {revision}</span>
                      <span>لم يبدأ: {notStarted}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Financial Commitments Donut Chart */}
        <section className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">توزيع الالتزامات المسجلة حسب الفئة</h2>
            <p className="text-xs text-slate-500 mt-0.5">إجمالي مبالغ البنود ذات تواريخ الاستحقاق</p>
          </div>

          {categoryBreakdown.items.length === 0 ? (
            <p className="text-sm text-slate-500 py-10 text-center">
              أضف مبالغ وتواريخ استحقاق في الجداول لعرض التوزيع المالي.
            </p>
          ) : (
            <div className="my-5 flex flex-col sm:flex-row items-center gap-6">
              <div className="relative w-36 h-36 shrink-0">
                <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
                  <circle
                    cx="70"
                    cy="70"
                    r={radius}
                    fill="none"
                    stroke="#F1F5F9"
                    strokeWidth="16"
                  />
                  {categoryBreakdown.items.map((item) => {
                    const strokeDash = (item.pct / 100) * circumference;
                    const offset = -(cumulativePct / 100) * circumference;
                    cumulativePct += item.pct;
                    return (
                      <circle
                        key={item.cat}
                        cx="70"
                        cy="70"
                        r={radius}
                        fill="none"
                        stroke={item.color}
                        strokeWidth="16"
                        strokeDasharray={`${strokeDash} ${circumference}`}
                        strokeDashoffset={offset}
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[11px] text-slate-500">الإجمالي</span>
                  <span className="text-sm font-bold font-mono tabular-nums text-slate-900">
                    {formatMoney(categoryBreakdown.total)}
                  </span>
                </div>
              </div>

              <div className="flex-1 w-full space-y-3">
                {categoryBreakdown.items.map((item) => (
                  <div key={item.cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 flex items-center gap-2">
                        <i
                          className="w-2.5 h-2.5 rounded-xs inline-block"
                          style={{ backgroundColor: item.color }}
                        />
                        {item.cat} ({item.count})
                      </span>
                      <span className="font-mono tabular-nums font-bold text-slate-900">
                        {formatMoney(item.amount)} ج.م
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>إجمالي البنود المجدولة</span>
            <span className="font-mono tabular-nums font-semibold text-slate-800">
              {dueRows.length} بند
            </span>
          </div>
        </section>
      </div>

      {/* Upcoming & Overdue Dues Table */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">جدول الاستحقاقات والتنبيهات</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              مجمع تلقائياً من الاتصالات والدومينات ومزودي الخدمات
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {[
                { id: 'all', label: 'الكل' },
                { id: 'bad', label: 'متأخر' },
                { id: 'warn', label: 'قريب' },
                { id: 'ok', label: 'سليم' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setStatusFilter(opt.id as any)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    statusFilter === opt.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-lg bg-white text-slate-800"
            >
              <option value="all">كل الفئات</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleExportDue}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تصدير CSV</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs">
                <th className="py-3 px-4 text-right font-bold whitespace-nowrap">الفئة</th>
                <th className="py-3 px-4 text-right font-bold whitespace-nowrap">البند</th>
                <th className="py-3 px-4 text-right font-bold whitespace-nowrap">المبلغ (ج.م)</th>
                <th className="py-3 px-4 text-right font-bold whitespace-nowrap">تاريخ الاستحقاق</th>
                <th className="py-3 px-4 text-right font-bold whitespace-nowrap">الأيام المتبقية</th>
                <th className="py-3 px-4 text-right font-bold whitespace-nowrap">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDue.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-slate-500">
                    لا توجد استحقاقات مطابقة للتصفية الحالية.
                  </td>
                </tr>
              ) : (
                filteredDue.map((row, idx) => {
                  const st = getDueStatus(row.days_left, alertLeadDays);
                  const isLate = st?.tone === 'bad';
                  const isNear = st?.tone === 'warn';
                  const statusTone = isLate
                    ? 'text-red-700'
                    : isNear
                      ? 'text-amber-700'
                      : 'text-emerald-700';
                  return (
                    <tr
                      key={`${row.cat}-${row.item}-${idx}`}
                      className={
                        isLate
                          ? 'bg-red-50/90 hover:bg-red-100/75 text-red-950'
                          : isNear
                            ? 'bg-amber-50/45 hover:bg-amber-50/80'
                            : 'hover:bg-slate-50/80'
                      }
                    >
                      <td className={`py-2.5 px-4 whitespace-nowrap ${isLate ? 'text-red-800 font-medium' : 'text-slate-600'}`}>
                        {row.cat}
                      </td>
                      <td className={`py-2.5 px-4 font-bold ${isLate ? 'text-red-800' : 'text-slate-900'}`}>
                        <div className="flex items-center gap-2">
                          {isLate && <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />}
                          {isNear && <BellRing className="w-4 h-4 text-amber-600 shrink-0" />}
                          <span>{row.item}</span>
                        </div>
                      </td>
                      <td className={`py-2.5 px-4 font-bold font-mono tabular-nums ${isLate ? 'text-red-800' : 'text-slate-900'}`}>
                        {row.amount == null ? '—' : formatMoney(row.amount)}
                      </td>
                      <td className={`py-2.5 px-4 font-mono tabular-nums ${isLate ? 'text-red-700 font-semibold' : 'text-slate-700'}`} dir="ltr">
                        {row.due_date}
                      </td>
                      <td className={`py-2.5 px-4 font-mono tabular-nums ${isLate ? 'text-red-700 font-bold' : isNear ? 'text-amber-700 font-bold' : 'text-slate-700'}`} dir="ltr">
                        {row.days_left}
                      </td>
                      <td className={`py-2.5 px-4 font-bold whitespace-nowrap ${statusTone}`}>
                        <span className="inline-flex items-center gap-1.5">
                          {isLate && <AlertTriangle className="w-3.5 h-3.5" />}
                          {isNear && <BellRing className="w-3.5 h-3.5" />}
                          <span>{st?.label}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Dashboard Notifications Settings Modal */}
      {notifSettingsOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/45 flex items-center justify-center p-4"
          onClick={() => setNotifSettingsOpen(false)}
        >
          <div
            className="bg-white border border-slate-200 rounded-xl w-full max-w-md shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#1E3A5F]/10 text-[#1E3A5F] flex items-center justify-center shrink-0">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    إعدادات تنبيهات المهام والاستحقاقات
                  </h3>
                  <p className="text-xs text-slate-500">Dashboard Notifications</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNotifSettingsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                aria-label="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNotifSettings} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  إظهار التنبيه قبل تاريخ الاستحقاق بـ (عدد الأيام):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={60}
                    required
                    value={draftLeadDays}
                    onChange={(e) => setDraftLeadDays(e.target.value)}
                    dir="ltr"
                    className="w-28 px-3 py-2 text-sm font-bold font-mono tabular-nums border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                  <span className="text-xs text-slate-600">
                    يوم قبل الاستحقاق (الافتراضي: {DEFAULT_ALERT_LEAD_DAYS} أيام، النطاق: 1–60)
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-600 mb-2">اختيارات سريعة:</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { days: 1, label: 'قبل 1 يوم' },
                    { days: 3, label: 'قبل 3 أيام' },
                    { days: 5, label: 'قبل 5 أيام' },
                    { days: 7, label: '7 أيام (افتراضي)' },
                    { days: 14, label: 'قبل 14 يوماً' },
                    { days: 30, label: 'قبل 30 يوماً' },
                  ].map((preset) => {
                    const active = parsedDraftDays === preset.days;
                    return (
                      <button
                        key={preset.days}
                        type="button"
                        onClick={() => setDraftLeadDays(String(preset.days))}
                        className={`px-2.5 py-2 text-xs font-semibold rounded-lg border cursor-pointer transition-colors ${
                          active
                            ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50/70 px-3.5 py-2.5 text-xs text-amber-900 font-mono tabular-nums">
                معاينة مباشرة: عند ضبط التنبيه قبل {formatDaysWindowLabel(parsedDraftDays)} سيظهر{' '}
                <span className="font-bold">{previewNearCount.tasksMatch}</span> تنبيه مهام قريبة و{' '}
                <span className="font-bold">{previewNearCount.duesMatch}</span> بنود استحقاق مالية قريبة.
              </div>

              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleResetNotifSettings}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  استعادة الافتراضي (7 أيام)
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setNotifSettingsOpen(false)}
                    className="px-3.5 py-2 text-xs font-semibold border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold bg-[#1E3A5F] hover:bg-[#2b4c7e] text-white rounded-lg cursor-pointer"
                  >
                    حفظ الإعدادات
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
