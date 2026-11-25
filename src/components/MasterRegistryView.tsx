import React, { useMemo, useState } from 'react';
import { Search, Download } from 'lucide-react';
import { MASTER_REGISTRY } from '../data/masterRegistry';
import { exportRowsToCsv } from '../lib/supabase';

export const MasterRegistryView: React.FC = () => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [kindFilter, setKindFilter] = useState('all');
  const [limit, setLimit] = useState(60);

  const categories = useMemo(
    () => Array.from(new Set(MASTER_REGISTRY.map((r) => r.category))),
    []
  );

  const kinds = useMemo(
    () => Array.from(new Set(MASTER_REGISTRY.map((r) => r.kind))),
    []
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return MASTER_REGISTRY.filter((r) => {
      if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
      if (kindFilter !== 'all' && r.kind !== kindFilter) return false;
      if (!q) return true;
      return (
        String(r.id).includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.owners.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q)
      );
    });
  }, [search, categoryFilter, kindFilter]);

  const visibleRows = useMemo(() => filtered.slice(0, limit), [filtered, limit]);

  const handleExport = () => {
    exportRowsToCsv(
      'noub-master-registry-450',
      ['م', 'التصنيف', 'البيان / المهمة / الفكرة', 'نوع البند', 'الأطراف المشاركة', 'الحالة'],
      filtered.map((r) => [r.id, r.category, r.title, r.kind, r.owners, r.status])
    );
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[240px]">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث في الـ 450 بند..."
              className="w-full pr-9 pl-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setLimit(100);
            }}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 max-w-[220px]"
          >
            <option value="all">كل التصنيفات ({categories.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 max-w-[180px]"
          >
            <option value="all">كل أنواع البنود</option>
            {kinds.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 rounded-lg cursor-pointer shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>تصدير Excel ({filtered.length})</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-700">
                <th className="py-3 px-4 text-right font-bold w-14">م</th>
                <th className="py-3 px-4 text-right font-bold whitespace-nowrap">التصنيف</th>
                <th className="py-3 px-4 text-right font-bold">البيان / المهمة / المعلومة</th>
                <th className="py-3 px-4 text-right font-bold whitespace-nowrap">نوع البند</th>
                <th className="py-3 px-4 text-right font-bold whitespace-nowrap">الأطراف المشاركة</th>
                <th className="py-3 px-4 text-right font-bold whitespace-nowrap">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80">
                  <td className="py-2.5 px-4 font-mono tabular-nums font-bold text-slate-500">
                    {row.id}
                  </td>
                  <td className="py-2.5 px-4 text-xs font-semibold text-[#1E3A5F] whitespace-nowrap">
                    {row.category}
                  </td>
                  <td className="py-2.5 px-4 text-slate-900">{row.title}</td>
                  <td className="py-2.5 px-4 text-xs text-slate-600 whitespace-nowrap">{row.kind}</td>
                  <td className="py-2.5 px-4 text-xs text-slate-700">{row.owners}</td>
                  <td className="py-2.5 px-4 text-xs font-semibold text-slate-800 whitespace-nowrap">
                    {row.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <span>
            معروض <b className="font-mono tabular-nums">{visibleRows.length}</b> من{' '}
            <b className="font-mono tabular-nums">{filtered.length}</b> بند
          </span>
          {visibleRows.length < filtered.length && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLimit((l) => l + 100)}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold rounded-md cursor-pointer"
              >
                عرض 100 إضافية
              </button>
              <button
                type="button"
                onClick={() => setLimit(filtered.length)}
                className="px-3 py-1.5 bg-[#1E3A5F] text-white font-semibold rounded-md cursor-pointer"
              >
                عرض الكل ({filtered.length})
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
