import React, { useMemo, useState } from 'react';
import { Search, Download, Plus, RotateCcw } from 'lucide-react';
import { JOINT_TASKS_DATA, type JointTaskItem, type JointTaskStatus } from '../data/jointTasks';
import { exportRowsToCsv } from '../lib/supabase';

const STORAGE_KEY = 'noub_crm_joint_tasks_v1';
const JOINT_VERSION_KEY = 'noub_crm_joint_tasks_ver_v1';
const CURRENT_JOINT_VER = '2026-11-25-v2';

function loadTasks(): JointTaskItem[] {
  if (typeof window === 'undefined') return JOINT_TASKS_DATA;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const savedVer = window.localStorage.getItem(JOINT_VERSION_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(JOINT_TASKS_DATA));
      window.localStorage.setItem(JOINT_VERSION_KEY, CURRENT_JOINT_VER);
      return JOINT_TASKS_DATA;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      if (savedVer === CURRENT_JOINT_VER) return parsed;
      const prevMap = new Map((parsed as JointTaskItem[]).map((item) => [item.id, item]));
      const seedIds = new Set(JOINT_TASKS_DATA.map((item) => item.id));
      const merged = JOINT_TASKS_DATA.map((seedItem) => {
        const prev = prevMap.get(seedItem.id);
        return prev ? { ...seedItem, status: prev.status } : seedItem;
      });
      const custom = (parsed as JointTaskItem[]).filter((item) => !seedIds.has(item.id));
      const next = [...merged, ...custom];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.localStorage.setItem(JOINT_VERSION_KEY, CURRENT_JOINT_VER);
      return next;
    }
  } catch {
    // ignore
  }
  return JOINT_TASKS_DATA;
}

export const JointTasksView: React.FC = () => {
  const [tasks, setTasks] = useState<JointTaskItem[]>(loadTasks);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | JointTaskStatus>('all');
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newOwner, setNewOwner] = useState('م/ عماد الشرقاوي + م/ سامح يس');
  const [newSection, setNewSection] = useState('العتاد والراك');
  const [newStatus, setNewStatus] = useState<JointTaskStatus>('جاري التنفيذ');

  const persist = (next: JointTaskItem[]) => {
    setTasks(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  };

  const counts = useMemo(() => {
    const done = tasks.filter((t) => t.status === 'تم').length;
    const prog = tasks.filter((t) => t.status === 'جاري التنفيذ').length;
    const todo = tasks.filter((t) => t.status === 'لم يتم').length;
    const total = tasks.length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, prog, todo, pct };
  }, [tasks]);

  const sections = useMemo(
    () => Array.from(new Set(tasks.map((t) => t.section))),
    [tasks]
  );

  const ownerKeywords = ['عماد', 'سامح', 'هاني', 'أبو خالد', 'حاتم', 'علي', 'محمد مصطفى', 'WE'];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks.filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (sectionFilter !== 'all' && t.section !== sectionFilter) return false;
      if (ownerFilter !== 'all' && !t.owner.includes(ownerFilter)) return false;
      if (!q) return true;
      return (
        String(t.id).includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.owner.toLowerCase().includes(q) ||
        t.section.toLowerCase().includes(q)
      );
    });
  }, [tasks, statusFilter, sectionFilter, ownerFilter, search]);

  const sectionStats = useMemo(() => {
    return sections.map((sec) => {
      const items = tasks.filter((t) => t.section === sec);
      const done = items.filter((t) => t.status === 'تم').length;
      const pct = items.length ? Math.round((done / items.length) * 100) : 0;
      return { sec, total: items.length, done, pct };
    });
  }, [tasks, sections]);

  const handleStatusChange = (id: number, status: JointTaskStatus) => {
    persist(tasks.map((t) => (t.id === id ? { ...t, status } : t)));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const nextId = tasks.reduce((max, t) => Math.max(max, t.id), 0) + 1;
    persist([
      ...tasks,
      {
        id: nextId,
        title: newTitle.trim(),
        owner: newOwner.trim() || 'م/ عماد الشرقاوي',
        section: newSection,
        status: newStatus,
      },
    ]);
    setNewTitle('');
    setAdding(false);
  };

  const handleReset = () => {
    persist(JOINT_TASKS_DATA);
  };

  const handleExport = () => {
    exportRowsToCsv(
      'joint-tasks-emad-sameh',
      ['رقم البند', 'القسم', 'البند', 'الحالة', 'المسؤول'],
      filtered.map((t) => [t.id, t.section, t.title, t.status, t.owner])
    );
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-semibold text-slate-600">إجمالي البنود المشتركة</p>
          <p className="mt-2 text-3xl font-bold font-mono tabular-nums text-[#1E3A5F]">
            {counts.total}
          </p>
          <p className="mt-1 text-xs text-slate-500">نسبة الإنجاز الكلية: {counts.pct}%</p>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-5">
          <p className="text-xs font-semibold text-emerald-900">بنود مكتملة (تم)</p>
          <p className="mt-2 text-3xl font-bold font-mono tabular-nums text-emerald-700">
            {counts.done}
          </p>
          <p className="mt-1 text-xs text-emerald-700">منفذة ومعتمدة</p>
        </div>

        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-5">
          <p className="text-xs font-semibold text-amber-900">جاري التنفيذ</p>
          <p className="mt-2 text-3xl font-bold font-mono tabular-nums text-amber-700">
            {counts.prog}
          </p>
          <p className="mt-1 text-xs text-amber-700">تحت العمل حالياً</p>
        </div>

        <div className="bg-red-50/70 border border-red-200 rounded-xl p-5">
          <p className="text-xs font-semibold text-red-900">لم يتم بعد</p>
          <p className="mt-2 text-3xl font-bold font-mono tabular-nums text-red-700">
            {counts.todo}
          </p>
          <p className="mt-1 text-xs text-red-700">بنود معلقة للتنفيذ</p>
        </div>
      </div>

      {/* Overall Stacked Chart + Section Breakdown */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              مؤشر إنجاز جدول العمل المشترك — م/ عماد الشرقاوي وم/ سامح يس
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              يمكنك تحديث حالة أي بند مباشرة وسيتم تحديث النسب والرسوم البيانية فوراً
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <i className="w-2.5 h-2.5 rounded-xs bg-emerald-600 inline-block" /> تم ({counts.done})
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block" /> جاري ({counts.prog})
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i className="w-2.5 h-2.5 rounded-xs bg-red-500 inline-block" /> لم يتم ({counts.todo})
            </span>
          </div>
        </div>

        <div className="h-3.5 w-full bg-slate-100 rounded-md overflow-hidden flex">
          <div style={{ width: `${(counts.done / counts.total) * 100}%` }} className="bg-emerald-600 h-full" />
          <div style={{ width: `${(counts.prog / counts.total) * 100}%` }} className="bg-amber-500 h-full" />
          <div style={{ width: `${(counts.todo / counts.total) * 100}%` }} className="bg-red-500 h-full" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {sectionStats.map((s) => (
            <button
              key={s.sec}
              type="button"
              onClick={() => setSectionFilter((prev) => (prev === s.sec ? 'all' : s.sec))}
              className={`text-right p-3 rounded-lg border transition-colors cursor-pointer ${
                sectionFilter === s.sec
                  ? 'border-blue-500 bg-blue-50/50'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1.5">
                <span className="truncate">{s.sec}</span>
                <span className="font-mono tabular-nums text-[#1E3A5F]">
                  {s.done}/{s.total} ({s.pct}%)
                </span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#1E3A5F] rounded-full" style={{ width: `${s.pct}%` }} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[240px]">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث برقم البند أو الوصف أو المسؤول..."
                className="w-full pr-9 pl-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {(['all', 'تم', 'جاري التنفيذ', 'لم يتم'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md whitespace-nowrap cursor-pointer ${
                    statusFilter === st ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  {st === 'all' ? 'الكل' : st}
                </button>
              ))}
            </div>

            <select
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-800"
            >
              <option value="all">كل المسؤولين</option>
              {ownerKeywords.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>

            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-800"
            >
              <option value="all">كل الأقسام</option>
              {sections.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleReset}
              title="استعادة الحالات الافتراضية"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>استعادة</span>
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 rounded-lg cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تصدير Excel</span>
            </button>
            <button
              type="button"
              onClick={() => setAdding((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة بند</span>
            </button>
          </div>
        </div>

        {adding && (
          <form onSubmit={handleAddTask} className="pt-3 border-t border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-2.5">
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="عنوان البند الجديد..."
              className="md:col-span-5 px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
            <input
              type="text"
              value={newOwner}
              onChange={(e) => setNewOwner(e.target.value)}
              placeholder="المسؤول..."
              className="md:col-span-3 px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
            <select
              value={newSection}
              onChange={(e) => setNewSection(e.target.value)}
              className="md:col-span-2 px-2 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            >
              {sections.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <div className="md:col-span-2 flex items-center gap-1.5">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as JointTaskStatus)}
                className="flex-1 px-2 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="تم">تم</option>
                <option value="جاري التنفيذ">جاري التنفيذ</option>
                <option value="لم يتم">لم يتم</option>
              </select>
              <button
                type="submit"
                className="px-3 py-2 bg-[#1E3A5F] text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                حفظ
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 105 Items Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs">
                <th className="py-3 px-4 text-right font-bold w-16">#</th>
                <th className="py-3 px-4 text-right font-bold whitespace-nowrap">القسم</th>
                <th className="py-3 px-4 text-right font-bold">البند / المهمة</th>
                <th className="py-3 px-4 text-right font-bold whitespace-nowrap">المسؤول</th>
                <th className="py-3 px-4 text-right font-bold whitespace-nowrap">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80">
                  <td className="py-2.5 px-4 font-mono tabular-nums font-bold text-slate-500">
                    {item.id}
                  </td>
                  <td className="py-2.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                    {item.section}
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-slate-900">{item.title}</td>
                  <td className="py-2.5 px-4 text-xs font-medium text-[#1E3A5F] whitespace-nowrap">
                    {item.owner}
                  </td>
                  <td className="py-2.5 px-4 whitespace-nowrap">
                    <select
                      value={item.status}
                      onChange={(e) =>
                        handleStatusChange(item.id, e.target.value as JointTaskStatus)
                      }
                      className={`px-2.5 py-1 text-xs font-bold border border-slate-200 rounded-md bg-white cursor-pointer ${
                        item.status === 'تم'
                          ? 'text-emerald-700'
                          : item.status === 'جاري التنفيذ'
                            ? 'text-amber-700'
                            : 'text-red-700'
                      }`}
                    >
                      <option value="تم">تم</option>
                      <option value="جاري التنفيذ">جاري التنفيذ</option>
                      <option value="لم يتم">لم يتم</option>
                    </select>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-slate-500">
                    لا توجد بنود مطابقة لبحثك.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>عدد البنود المعروضة</span>
          <span className="font-mono tabular-nums font-bold text-slate-800">
            {filtered.length} من {tasks.length}
          </span>
        </div>
      </div>
    </div>
  );
};
