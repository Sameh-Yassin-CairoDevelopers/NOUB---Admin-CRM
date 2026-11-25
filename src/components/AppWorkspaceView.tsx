import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Users, CheckSquare, RefreshCw, AlertTriangle } from 'lucide-react';
import { DELIVERABLE_STATUSES, STAGES, TABLES, TEAM_LEVELS } from '../data/tables';
import { getSupabaseClient } from '../lib/supabase';
import type { AnyRecord, AppRecord, DeliverableRecord, TableId, TeamRecord } from '../types/crm';
import { RecordModal } from './RecordModal';

interface AppWorkspaceViewProps {
  initialAppId: string | null;
}

export const AppWorkspaceView: React.FC<AppWorkspaceViewProps> = ({ initialAppId }) => {
  const [apps, setApps] = useState<AppRecord[]>([]);
  const [deliverables, setDeliverables] = useState<DeliverableRecord[]>([]);
  const [team, setTeam] = useState<TeamRecord[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string>(initialAppId || '');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalState, setModalState] = useState<{
    open: boolean;
    tableId: TableId;
    record: AnyRecord | null;
    prefill?: Partial<AnyRecord>;
  }>({ open: false, tableId: 'deliverables', record: null });

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const sb = getSupabaseClient();
      const [appsRes, dlRes, teamRes] = await Promise.all([
        sb.from('apps').select('*').order('created_at'),
        sb.from('deliverables').select('*').order('created_at'),
        sb.from('team').select('*').order('created_at'),
      ]);
      if (appsRes.error) throw appsRes.error;
      if (dlRes.error) throw dlRes.error;
      if (teamRes.error) throw teamRes.error;

      const appList = (appsRes.data as AppRecord[]) || [];
      setApps(appList);
      setDeliverables((dlRes.data as DeliverableRecord[]) || []);
      setTeam((teamRes.data as TeamRecord[]) || []);

      if (appList.length > 0) {
        setSelectedAppId((prev) => {
          if (initialAppId && appList.some((a) => a.id === initialAppId)) return initialAppId;
          if (prev && appList.some((a) => a.id === prev)) return prev;
          return appList[0].id;
        });
      }
    } catch (err: any) {
      setError(err?.message || 'تعذر تحميل بيانات التطبيقات.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (initialAppId && apps.some((a) => a.id === initialAppId)) {
      setSelectedAppId(initialAppId);
    }
  }, [initialAppId, apps]);

  const currentApp = useMemo(
    () => apps.find((a) => a.id === selectedAppId) || apps[0] || null,
    [apps, selectedAppId]
  );

  const appDeliverables = useMemo(
    () => (currentApp ? deliverables.filter((d) => d.app_id === currentApp.id) : []),
    [deliverables, currentApp]
  );

  const appTeam = useMemo(
    () => (currentApp ? team.filter((t) => t.app_id === currentApp.id) : []),
    [team, currentApp]
  );

  const filteredDeliverables = useMemo(() => {
    return appDeliverables.filter((d) => {
      if (stageFilter !== 'all' && d.stage !== stageFilter) return false;
      if (statusFilter !== 'all' && d.status !== statusFilter) return false;
      return true;
    });
  }, [appDeliverables, stageFilter, statusFilter]);

  const stageProgress = useMemo(() => {
    return STAGES.map((stage) => {
      const items = appDeliverables.filter((d) => d.stage === stage);
      const done = items.filter((d) => d.status === 'تم الاستلام').length;
      const pct = items.length > 0 ? Math.round((done / items.length) * 100) : 0;
      return { stage, total: items.length, done, pct };
    });
  }, [appDeliverables]);

  const statusBreakdown = useMemo(() => {
    const counts = [
      {
        label: 'تم الاستلام',
        count: appDeliverables.filter((d) => d.status === 'تم الاستلام').length,
        color: '#16A34A',
      },
      {
        label: 'قيد التنفيذ',
        count: appDeliverables.filter((d) => d.status === 'قيد التنفيذ').length,
        color: '#D97706',
      },
      {
        label: 'يحتاج تعديل',
        count: appDeliverables.filter((d) => d.status === 'يحتاج تعديل').length,
        color: '#DC2626',
      },
      {
        label: 'لم يبدأ',
        count: appDeliverables.filter((d) => !d.status || d.status === 'لم يبدأ').length,
        color: '#94A3B8',
      },
    ];
    const total = appDeliverables.length;
    return { counts, total };
  }, [appDeliverables]);

  const teamGrouped = useMemo(() => {
    const groups: Array<{ level: string; members: TeamRecord[] }> = [];
    TEAM_LEVELS.forEach((lvl) => {
      const members = appTeam.filter((m) => m.level === lvl);
      if (members.length > 0) groups.push({ level: lvl, members });
    });
    const uncategorized = appTeam.filter((m) => !m.level || !TEAM_LEVELS.includes(m.level));
    if (uncategorized.length > 0) {
      groups.push({ level: 'أدوار أخرى', members: uncategorized });
    }
    return groups;
  }, [appTeam]);

  const handleQuickStatusChange = async (deliverableId: string, newStatus: string) => {
    const sb = getSupabaseClient();
    const receivedOn = newStatus === 'تم الاستلام' ? new Date().toISOString().slice(0, 10) : null;
    const { error: updErr } = await sb
      .from('deliverables')
      .update({ status: newStatus, ...(receivedOn ? { received_on: receivedOn } : {}) })
      .eq('id', deliverableId);
    if (updErr) {
      setError(updErr.message);
      return;
    }
    setDeliverables((prev) =>
      prev.map((item) =>
        item.id === deliverableId
          ? { ...item, status: newStatus, received_on: receivedOn ?? item.received_on }
          : item
      )
    );
  };

  const handleSaveRecord = async (payload: Record<string, any>, existingId?: string) => {
    const sb = getSupabaseClient();
    const { tableId } = modalState;
    const q = existingId
      ? sb.from(tableId).update(payload).eq('id', existingId)
      : sb.from(tableId).insert(payload);
    const { error: saveErr } = await q;
    if (saveErr) throw saveErr;
    await fetchAll();
  };

  const handleDeleteRecord = async (tableId: TableId, id: string) => {
    const sb = getSupabaseClient();
    const { error: delErr } = await sb.from(tableId).delete().eq('id', id);
    if (delErr) {
      setError(delErr.message);
      return;
    }
    await fetchAll();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-14 bg-white border border-slate-200 rounded-xl animate-pulse" />
        <div className="h-56 bg-white border border-slate-200 rounded-xl animate-pulse" />
        <div className="h-64 bg-white border border-slate-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-800 space-y-3">
        <div className="flex items-center gap-2 font-bold">
          <AlertTriangle className="w-5 h-5" />
          <span>حدث خطأ في متابعة التطبيقات</span>
        </div>
        <p className="text-sm">{error}</p>
        <button
          type="button"
          onClick={fetchAll}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-700 text-white text-xs font-semibold rounded-lg cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>تحديث</span>
        </button>
      </div>
    );
  }

  if (!currentApp) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-3">
        <p className="text-slate-600 font-medium">لا توجد تطبيقات مسجلة بعد.</p>
        <button
          type="button"
          onClick={() => setModalState({ open: true, tableId: 'apps', record: null })}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة أول تطبيق</span>
        </button>
      </div>
    );
  }

  const modalTableDef = TABLES.find((t) => t.id === modalState.tableId)!;
  const overallPct =
    statusBreakdown.total > 0
      ? Math.round((statusBreakdown.counts[0].count / statusBreakdown.total) * 100)
      : 0;

  let ringOffset = 0;
  const ringR = 52;
  const ringC = 2 * Math.PI * ringR;

  return (
    <div className="space-y-6">
      {/* App Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
          {apps.map((app) => (
            <button
              key={app.id}
              type="button"
              onClick={() => setSelectedAppId(app.id)}
              className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                app.id === currentApp.id
                  ? 'bg-[#1E3A5F] text-white'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              {app.name}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setModalState({ open: true, tableId: 'apps', record: null })}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>تطبيق جديد</span>
        </button>
      </div>

      {/* App Overview Header + Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <section className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <span>{currentApp.status || 'لم يبدأ'}</span>
                <span aria-hidden="true">·</span>
                <span>{currentApp.platforms || 'المنصات غير محددة'}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">{currentApp.name}</h2>
              <p className="text-sm text-slate-600 mt-1">
                {currentApp.description || 'لا يوجد وصف مسجل لهذا التطبيق بعد.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setModalState({ open: true, tableId: 'apps', record: currentApp })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>تعديل البيانات</span>
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>تقدم مراحل الاستلام الخمس</span>
              <span className="font-mono tabular-nums text-[#1E3A5F]">{overallPct}% مكتمل</span>
            </div>
            {stageProgress.map((sp) => (
              <div key={sp.stage} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-800">{sp.stage}</span>
                  <span className="font-mono tabular-nums text-slate-600">
                    {sp.done}/{sp.total} ({sp.pct}%)
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1E3A5F] rounded-full transition-all"
                    style={{ width: `${sp.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">توزيع حالات الاستلام</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              متابعة فورية لوضع بنود {currentApp.name}
            </p>
          </div>

          <div className="my-5 flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-32 h-32 shrink-0">
              <svg viewBox="0 0 130 130" className="w-full h-full -rotate-90">
                <circle cx="65" cy="65" r={ringR} fill="none" stroke="#F1F5F9" strokeWidth="14" />
                {statusBreakdown.total > 0 &&
                  statusBreakdown.counts.map((c) => {
                    const pct = (c.count / statusBreakdown.total) * 100;
                    const dash = (pct / 100) * ringC;
                    const offset = -(ringOffset / 100) * ringC;
                    ringOffset += pct;
                    return (
                      <circle
                        key={c.label}
                        cx="65"
                        cy="65"
                        r={ringR}
                        fill="none"
                        stroke={c.color}
                        strokeWidth="14"
                        strokeDasharray={`${dash} ${ringC}`}
                        strokeDashoffset={offset}
                      />
                    );
                  })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
                  {overallPct}%
                </span>
                <span className="text-[11px] text-slate-500">جاهزية</span>
              </div>
            </div>

            <div className="flex-1 w-full space-y-2.5">
              {statusBreakdown.counts.map((item) => (
                <div key={item.label} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-medium text-slate-700">
                    <i
                      className="w-2.5 h-2.5 rounded-xs inline-block"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.label}
                  </span>
                  <span className="font-mono tabular-nums font-bold text-slate-900">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block">بداية المشروع</span>
              <span className="font-mono tabular-nums font-semibold text-slate-800">
                {currentApp.start_date || '—'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">الإطلاق المستهدف</span>
              <span className="font-mono tabular-nums font-semibold text-slate-800">
                {currentApp.launch_date || '—'}
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* Deliverables Timeline Section */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <CheckSquare className="w-4 h-4 text-[#1E3A5F]" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                مسار الاستلام — {currentApp.name} ({appDeliverables.length})
              </h3>
              <p className="text-xs text-slate-500">
                يمكنك تحديث حالة أي بند مباشرة من القائمة أو تعديل تفاصيله
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-800"
            >
              <option value="all">كل المراحل</option>
              {STAGES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-800"
            >
              <option value="all">كل الحالات</option>
              {DELIVERABLE_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() =>
                setModalState({
                  open: true,
                  tableId: 'deliverables',
                  record: null,
                  prefill: { app_id: currentApp.id, status: 'لم يبدأ', acceptance: 'لم يُختبر' },
                })
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة بند تسليم</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs">
                <th className="py-3 px-4 text-right font-bold">المرحلة</th>
                <th className="py-3 px-4 text-right font-bold">بند التسليم</th>
                <th className="py-3 px-4 text-right font-bold">المسؤول</th>
                <th className="py-3 px-4 text-right font-bold">الموعد المستهدف</th>
                <th className="py-3 px-4 text-right font-bold">الحالة</th>
                <th className="py-3 px-4 text-right font-bold">القبول</th>
                <th className="py-3 px-4 text-right font-bold">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDeliverables.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm text-slate-500">
                    لا توجد بنود مطابقة في مسار الاستلام.
                  </td>
                </tr>
              ) : (
                filteredDeliverables.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                      {d.stage || '—'}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">{d.item}</td>
                    <td className="py-2.5 px-4 text-slate-700">{d.owner || '—'}</td>
                    <td className="py-2.5 px-4 font-mono tabular-nums text-xs text-slate-600" dir="ltr">
                      {d.end_date || '—'}
                    </td>
                    <td className="py-2.5 px-4">
                      <select
                        value={d.status || 'لم يبدأ'}
                        onChange={(e) => handleQuickStatusChange(d.id, e.target.value)}
                        className={`px-2 py-1 text-xs font-bold border border-slate-200 rounded-md bg-white cursor-pointer ${
                          d.status === 'تم الاستلام'
                            ? 'text-emerald-700'
                            : d.status === 'يحتاج تعديل'
                              ? 'text-red-700'
                              : d.status === 'قيد التنفيذ'
                                ? 'text-amber-700'
                                : 'text-slate-700'
                        }`}
                      >
                        {DELIVERABLE_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2.5 px-4 text-xs text-slate-700 whitespace-nowrap">
                      {d.acceptance || 'لم يُختبر'}
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setModalState({ open: true, tableId: 'deliverables', record: d })
                          }
                          className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded cursor-pointer"
                          title="تعديل"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRecord('deliverables', d.id)}
                          className="p-1.5 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Team & Org Structure Section */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Users className="w-4 h-4 text-[#1E3A5F]" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                الهيكل الوظيفي وفريق العمل — {currentApp.name} ({appTeam.length})
              </h3>
              <p className="text-xs text-slate-500">
                توضيح الإدارة العليا، مدراء التطبيق، وفرق التصميم والبرمجة والجودة
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setModalState({
                open: true,
                tableId: 'team',
                record: null,
                prefill: { app_id: currentApp.id, job_status: 'معيّن', party: 'شركتنا' },
              })
            }
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#1E3A5F] hover:bg-[#162d4a] text-white rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة دور وظيفي</span>
          </button>
        </div>

        {teamGrouped.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <p className="text-sm text-slate-500">
              لم يُضف الهيكل الوظيفي لهذا التطبيق بعد. أضف الأدوار القيادية والفنية لتوضيح المسؤوليات.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {teamGrouped.map((grp) => (
              <div key={grp.level} className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 border-b border-slate-100 pb-1.5">
                  {grp.level}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {grp.members.map((m) => (
                    <div
                      key={m.id}
                      className="border border-slate-200 rounded-lg p-4 bg-slate-50/40 flex flex-col justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-bold text-slate-900">{m.title}</p>
                            <p className="text-sm font-semibold text-[#1E3A5F] mt-0.5">
                              {m.person || 'وظيفة شاغرة'}
                            </p>
                          </div>
                          <span
                            className={`text-xs font-bold whitespace-nowrap ${
                              m.job_status === 'معيّن'
                                ? 'text-emerald-700'
                                : m.job_status === 'شاغر'
                                  ? 'text-red-700'
                                  : 'text-amber-700'
                            }`}
                          >
                            {m.job_status || 'شاغر'}
                          </span>
                        </div>

                        <div className="mt-2.5 text-xs text-slate-600 space-y-1">
                          <p>
                            {m.party || 'شركتنا'}
                            {m.reports_to ? ` · يتبع: ${m.reports_to}` : ''}
                          </p>
                          {m.duties && <p className="text-slate-500 line-clamp-2">{m.duties}</p>}
                          {m.contact && (
                            <p className="font-mono text-[11px] text-slate-500" dir="ltr">
                              {m.contact}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/70 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setModalState({ open: true, tableId: 'team', record: m })}
                          className="text-xs font-medium text-slate-600 hover:text-blue-700 cursor-pointer"
                        >
                          تعديل
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRecord('team', m.id)}
                          className="text-xs font-medium text-slate-600 hover:text-red-700 cursor-pointer"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <RecordModal
        open={modalState.open}
        table={modalTableDef}
        record={modalState.record}
        prefill={modalState.prefill}
        appsRef={apps.map((a) => ({ id: a.id, name: a.name }))}
        onClose={() => setModalState((s) => ({ ...s, open: false }))}
        onSave={handleSaveRecord}
      />
    </div>
  );
};
