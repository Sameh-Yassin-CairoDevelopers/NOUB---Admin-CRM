import React, { useEffect, useState } from 'react';
import { X, Calendar } from 'lucide-react';
import type { AnyRecord, FieldDef, TableDef } from '../types/crm';

interface RecordModalProps {
  open: boolean;
  table: TableDef;
  record: AnyRecord | null;
  prefill?: Partial<AnyRecord>;
  appsRef: Array<{ id: string; name: string }>;
  onClose: () => void;
  onSave: (payload: Record<string, any>, existingId?: string) => Promise<void>;
}

function addDaysToToday(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export const RecordModal: React.FC<RecordModalProps> = ({
  open,
  table,
  record,
  prefill,
  appsRef,
  onClose,
  onSave,
}) => {
  const [values, setValues] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const init: Record<string, any> = {};
    table.fields.forEach((f) => {
      if (record && record[f.key] !== undefined && record[f.key] !== null) {
        init[f.key] = record[f.key];
      } else if (prefill && prefill[f.key] !== undefined) {
        init[f.key] = prefill[f.key];
      } else if (f.type === 'bool') {
        init[f.key] = false;
      } else {
        init[f.key] = '';
      }
    });
    setValues(init);
    setError(null);
  }, [open, table, record, prefill]);

  if (!open) return null;

  const updateField = (key: string, val: any) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload: Record<string, any> = {};
      table.fields.forEach((f) => {
        const val = values[f.key];
        if (f.type === 'bool') {
          payload[f.key] = Boolean(val);
        } else if (val === '' || val === undefined || val === null) {
          payload[f.key] = null;
        } else if (f.type === 'num') {
          payload[f.key] = Number(val);
        } else {
          payload[f.key] = val;
        }
      });
      await onSave(payload, record?.id);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'تعذر حفظ البيانات. تأكد من صحة الحقول المطلوبة.');
    } finally {
      setSaving(false);
    }
  };

  const renderInput = (f: FieldDef) => {
    const val = values[f.key] ?? '';
    const commonCls =
      'w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600';

    if (f.type === 'list') {
      return (
        <select
          required={f.required}
          value={val}
          onChange={(e) => updateField(f.key, e.target.value)}
          className={commonCls}
        >
          <option value="">— اختر —</option>
          {(f.options || []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    if (f.type === 'ref') {
      return (
        <select
          required={f.required}
          value={val}
          onChange={(e) => updateField(f.key, e.target.value)}
          className={commonCls}
        >
          <option value="">— اختر التطبيق —</option>
          {appsRef.map((app) => (
            <option key={app.id} value={app.id}>
              {app.name}
            </option>
          ))}
        </select>
      );
    }

    if (f.type === 'bool') {
      return (
        <label className="inline-flex items-center gap-2.5 cursor-pointer py-1">
          <input
            type="checkbox"
            checked={Boolean(val)}
            onChange={(e) => updateField(f.key, e.target.checked)}
            className="w-4 h-4 accent-blue-600 rounded"
          />
          <span className="text-sm text-slate-700">{val ? 'مفعل (نعم)' : 'غير مفعل (لا)'}</span>
        </label>
      );
    }

    if (f.type === 'num') {
      return (
        <input
          type="number"
          step="0.01"
          min="0"
          dir="ltr"
          required={f.required}
          value={val}
          onChange={(e) => updateField(f.key, e.target.value)}
          placeholder="0.00"
          className={`${commonCls} font-mono tabular-nums text-left`}
        />
      );
    }

    if (f.type === 'date') {
      return (
        <div className="space-y-1.5">
          <div className="relative">
            <input
              type="date"
              min="2020-01-01"
              dir="ltr"
              required={f.required}
              value={val}
              onChange={(e) => updateField(f.key, e.target.value)}
              className={`${commonCls} font-mono tabular-nums text-left`}
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <button
              type="button"
              onClick={() => updateField(f.key, addDaysToToday(0))}
              className="px-2 py-0.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded cursor-pointer"
            >
              اليوم
            </button>
            <button
              type="button"
              onClick={() => updateField(f.key, addDaysToToday(30))}
              className="px-2 py-0.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded cursor-pointer"
            >
              +30 يوم
            </button>
            <button
              type="button"
              onClick={() => updateField(f.key, addDaysToToday(365))}
              className="px-2 py-0.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded cursor-pointer"
            >
              +سنة
            </button>
          </div>
        </div>
      );
    }

    return (
      <input
        type="text"
        required={f.required}
        value={val}
        onChange={(e) => updateField(f.key, e.target.value)}
        className={commonCls}
      />
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {record ? 'تعديل سجل' : 'إضافة سجل جديد'} — {table.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">الحقول المميزة بعلامة (*) إلزامية</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {table.fields.map((f) => (
              <div key={f.key} className={f.key === 'notes' || f.key === 'duties' ? 'md:col-span-2' : ''}>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {f.label}
                  {f.required && <span className="text-red-600 mr-1">*</span>}
                </label>
                {renderInput(f)}
              </div>
            ))}
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer whitespace-nowrap"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-lg cursor-pointer whitespace-nowrap"
            >
              {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
