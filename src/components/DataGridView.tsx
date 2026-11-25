import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Download, Pencil, Trash2, ArrowUpDown, RefreshCw, AlertTriangle } from 'lucide-react';
import {
  deleteTableRow,
  insertTableRow,
  listAppsRef,
  listTableRows,
  updateTableRow,
} from '../lib/dataService';
import { daysLeft, exportRowsToCsv, formatMoney, getDueStatus } from '../lib/supabase';
import type { AnyRecord, FieldDef, TableDef } from '../types/crm';
import { RecordModal } from './RecordModal';

interface DataGridViewProps {
  table: TableDef;
}

export const DataGridView: React.FC<DataGridViewProps> = ({ table }) => {
  const [rows, setRows] = useState<AnyRecord[]>([]);
  const [appsRef, setAppsRef] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AnyRecord | null>(null);

  const fetchTable = async () => {
    setLoading(true);
    setError(null);
    try {
      const needsApps = table.fields.some((f) => f.type === 'ref');
      const [rowsData, appsData] = await Promise.all([
        listTableRows(table.id),
        needsApps ? listAppsRef() : Promise.resolve([]),
      ]);
      setRows(rowsData);
      setAppsRef(appsData);
    } catch (err: any) {
      setError(err?.message || `تعذر تحميل جدول ${table.name}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSearch('');
    setFilters({});
    setSortKey(null);
    setConfirmDeleteId(null);
    fetchTable();
  }, [table.id]);

  const filterableFields = useMemo(
    () => table.fields.filter((f) => f.filterable).slice(0, 3),
    [table]
  );

  const visibleFields = useMemo(
    () => table.fields.filter((f) => !f.hiddenInGrid),
    [table]
  );

  const appNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    appsRef.forEach((a) => {
      map[a.id] = a.name;
    });
    return map;
  }, [appsRef]);

  const filteredAndSortedRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = rows.filter((row) => {
      for (const [key, val] of Object.entries(filters)) {
        if (val && String(row[key] ?? '') !== val) return false;
      }
      if (!q) return true;
      return table.fields.some((f) => {
        let raw = row[f.key];
        if (f.type === 'ref' && raw) raw = appNameMap[raw] || raw;
        return String(raw ?? '')
          .toLowerCase()
          .includes(q);
      });
    });

    if (!sortKey) return list;
    return [...list].sort((a, b) => {
      const va = a[sortKey] ?? '';
      const vb = b[sortKey] ?? '';
      if (typeof va === 'number' && typeof vb === 'number') {
        return sortAsc ? va - vb : vb - va;
      }
      return sortAsc
        ? String(va).localeCompare(String(vb), 'ar')
        : String(vb).localeCompare(String(va), 'ar');
    });
  }, [rows, filters, search, sortKey, sortAsc, table.fields, appNameMap]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortAsc((prev) => !prev);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const handleSave = async (payload: Record<string, any>, existingId?: string) => {
    if (existingId) {
      await updateTableRow(table.id, existingId, payload);
    } else {
      await insertTableRow(table.id, payload);
    }
    await fetchTable();
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTableRow(table.id, id);
      setConfirmDeleteId(null);
      await fetchTable();
    } catch (err: any) {
      setError(err?.message || 'تعذر حذف السجل.');
    }
  };

  const handleExport = () => {
    exportRowsToCsv(
      table.id,
      table.fields.map((f) => f.label),
      filteredAndSortedRows.map((row) =>
        table.fields.map((f) => {
          const val = row[f.key];
          if (f.type === 'ref') return appNameMap[val] || '';
          if (f.type === 'bool') return val ? 'نعم' : 'لا';
          return val ?? '';
        })
      )
    );
  };

  const renderCell = (f: FieldDef, row: AnyRecord) => {
    const val = row[f.key];
    if (f.due) {
      const status = getDueStatus(daysLeft(val));
      const statusTone =
        status?.tone === 'bad'
          ? 'text-red-700'
          : status?.tone === 'warn'
            ? 'text-amber-700'
            : 'text-emerald-700';
      return (
        <td key={f.key} className={`py-2.5 px-4 whitespace-nowrap ${f.bold ? 'font-bold' : ''}`}>
          <span className="font-mono tabular-nums text-slate-800" dir="ltr">
            {val || '—'}
          </span>
          {status && f.key !== 'end_date' && (
            <span className={`mr-2 text-xs font-bold ${statusTone}`}>{status.label}</span>
          )}
        </td>
      );
    }

    if (f.type === 'bool') {
      return (
        <td key={f.key} className="py-2.5 px-4 text-slate-700 whitespace-nowrap">
          {val ? 'نعم' : 'لا'}
        </td>
      );
    }

    if (f.type === 'ref') {
      return (
        <td key={f.key} className="py-2.5 px-4 font-bold text-[#1E3A5F] whitespace-nowrap">
          {appNameMap[val] || '—'}
        </td>
      );
    }

    if (f.type === 'num') {
      return (
        <td
          key={f.key}
          className={`py-2.5 px-4 font-mono tabular-nums whitespace-nowrap ${
            f.bold ? 'font-bold text-slate-900' : 'text-slate-700'
          }`}
        >
          {val == null ? '—' : formatMoney(val)}
        </td>
      );
    }

    if (f.type === 'date') {
      return (
        <td
          key={f.key}
          className={`py-2.5 px-4 font-mono tabular-nums whitespace-nowrap ${
            f.bold ? 'font-bold text-slate-900' : 'text-slate-700'
          }`}
          dir="ltr"
        >
          {val || '—'}
        </td>
      );
    }

    return (
      <td
        key={f.key}
        className={`py-2.5 px-4 ${f.bold ? 'font-bold text-slate-900' : 'text-slate-700'}`}
      >
        {val || '—'}
      </td>
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
              placeholder={`بحث في ${table.name}...`}
              className="w-full pr-9 pl-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {filterableFields.map((f) => (
            <select
              key={f.key}
              value={filters[f.key] || ''}
              onChange={(e) => setFilters((prev) => ({ ...prev, [f.key]: e.target.value }))}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-800"
            >
              <option value="">كل {f.label}</option>
              {f.type === 'ref'
                ? appsRef.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))
                : (f.options || []).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
            </select>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 rounded-lg whitespace-nowrap cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تصدير Excel</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingRecord(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة جديد</span>
          </button>
        </div>
      </div>

      {/* Data Grid */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-800 space-y-3">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="w-5 h-5" />
            <span>تعذر تحميل البيانات</span>
          </div>
          <p className="text-sm">{error}</p>
          <button
            type="button"
            onClick={fetchTable}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-700 text-white text-xs font-semibold rounded-lg cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>إعادة المحاولة</span>
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs">
                  {visibleFields.map((f) => (
                    <th key={f.key} className="py-3 px-4 text-right font-bold whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleSort(f.key)}
                        className="inline-flex items-center gap-1 hover:text-slate-950 cursor-pointer"
                      >
                        <span>{f.label}</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </button>
                    </th>
                  ))}
                  <th className="py-3 px-4 text-right font-bold whitespace-nowrap">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAndSortedRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={visibleFields.length + 1}
                      className="py-12 text-center text-sm text-slate-500"
                    >
                      <p>لا توجد سجلات مطابقة في جدول {table.name}.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingRecord(null);
                          setModalOpen(true);
                        }}
                        className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>إضافة أول سجل</span>
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedRows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/80">
                      {visibleFields.map((f) => renderCell(f, row))}
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        {confirmDeleteId === row.id ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleDelete(row.id)}
                              className="px-2.5 py-1 text-xs font-semibold bg-red-600 text-white rounded cursor-pointer"
                            >
                              تأكيد الحذف
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded cursor-pointer"
                            >
                              تراجع
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingRecord(row);
                                setModalOpen(true);
                              }}
                              className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded cursor-pointer"
                              title="تعديل"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(row.id)}
                              className="p-1.5 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer"
                              title="حذف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>عدد السجلات المعروضة</span>
            <span className="font-mono tabular-nums font-bold text-slate-800">
              {filteredAndSortedRows.length} من {rows.length}
            </span>
          </div>
        </div>
      )}

      <RecordModal
        open={modalOpen}
        table={table}
        record={editingRecord}
        appsRef={appsRef}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
};
