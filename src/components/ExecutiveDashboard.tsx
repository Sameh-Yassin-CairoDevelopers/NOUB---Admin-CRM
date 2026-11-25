import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowLeft, Download, RefreshCw } from 'lucide-react';
import { listDueRows, listTableRows } from '../lib/dataService';
import { exportRowsToCsv, formatMoney, getDueStatus } from '../lib/supabase';
import type { AppRecord, DeliverableRecord, DueRow } from '../types/crm';

interface ExecutiveDashboardProps {
  onSelectApp: (appId: string) => void;
}

const CAT_COLORS: Record<string, string> = {
  الاتصالات: '#1E3A5F',
  'الدومينات والاستضافة': '#2563EB',
  'مزودو الخدمات': '#0D9488',
};

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ onSelectApp }) => {
  const [dueRows, setDueRows] = useState<DueRow[]>([]);
  const [apps, setApps] = useState<AppRecord[]>([]);
  const [deliverables, setDeliverables] = useState<DeliverableRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'bad' | 'warn' | 'ok'>('all');
  const [catFilter, setCatFilter] = useState<string>('all');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dueData, appsData, dlData] = await Promise.all([
        listDueRows(),
        listTableRows('apps'),
        listTableRows('deliverables'),
      ]);
      setDueRows(dueData);
      setApps(appsData as AppRecord[]);
      setDeliverables(dlData as DeliverableRecord[]);
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
    const w7 = dueRows.filter((r) => r.days_left >= 0 && r.days_left <= 7);
    const m30 = dueRows.filter((r) => r.days_left >= 0 && r.days_left <= 30);
    const sum = (list: DueRow[]) => list.reduce((acc, r) => acc + Number(r.amount || 0), 0);
    return {
      lateCount: late.length,
      lateAmount: sum(late),
      w7Count: w7.length,
      m30Amount: sum(m30),
    };
  }, [dueRows]);

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
      const st = getDueStatus(r.days_left);
      return st?.tone === statusFilter;
    });
  }, [dueRows, statusFilter, catFilter]);

  const handleExportDue = () => {
    exportRowsToCsv(
      'noub-crm-dues',
      ['الفئة', 'البند', 'المبلغ (ج.م)', 'تاريخ الاستحقاق', 'الأيام المتبقية', 'الحالة'],
      filteredDue.map((r) => {
        const st = getDueStatus(r.days_left);
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
          <p className="text-xs font-semibold text-slate-600">مستحق خلال 7 أيام</p>
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
                  const st = getDueStatus(row.days_left);
                  const statusTone =
                    st?.tone === 'bad'
                      ? 'text-red-700'
                      : st?.tone === 'warn'
                        ? 'text-amber-700'
                        : 'text-emerald-700';
                  return (
                    <tr key={`${row.cat}-${row.item}-${idx}`} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-4 text-slate-600 whitespace-nowrap">{row.cat}</td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">{row.item}</td>
                      <td className="py-2.5 px-4 font-bold font-mono tabular-nums text-slate-900">
                        {row.amount == null ? '—' : formatMoney(row.amount)}
                      </td>
                      <td className="py-2.5 px-4 font-mono tabular-nums text-slate-700" dir="ltr">
                        {row.due_date}
                      </td>
                      <td className="py-2.5 px-4 font-mono tabular-nums text-slate-700" dir="ltr">
                        {row.days_left}
                      </td>
                      <td className={`py-2.5 px-4 font-bold whitespace-nowrap ${statusTone}`}>
                        {st?.label}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
