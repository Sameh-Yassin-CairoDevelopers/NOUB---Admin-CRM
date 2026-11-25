import React, { useState } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  Database,
  FileSpreadsheet,
  RefreshCw,
} from 'lucide-react';
import { LATEST_UNIFIED_SUPABASE_SQL } from '../data/latestUnifiedSql';
import { JOINT_TASKS_DATA, type JointTaskItem } from '../data/jointTasks';
import {
  forceSyncCachesWithLatestSeed,
  getFullLocalSnapshot,
} from '../lib/dataService';
import { downloadLatestExcelWorkbook } from '../lib/excelExport';

interface DataExportModalProps {
  open: boolean;
  onClose: () => void;
  onCacheSynced?: () => void;
}

function readLatestJointTasks(): JointTaskItem[] {
  if (typeof window === 'undefined') return JOINT_TASKS_DATA;
  try {
    const raw = window.localStorage.getItem('noub_crm_joint_tasks_v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed as JointTaskItem[];
    }
  } catch {
    // ignore
  }
  return JOINT_TASKS_DATA;
}

export const DataExportModal: React.FC<DataExportModalProps> = ({
  open,
  onClose,
  onCacheSynced,
}) => {
  const [copiedSql, setCopiedSql] = useState(false);
  const [downloadingXlsx, setDownloadingXlsx] = useState(false);
  const [syncedMsg, setSyncedMsg] = useState(false);

  if (!open) return null;

  const handleCopySql = async () => {
    await navigator.clipboard.writeText(LATEST_UNIFIED_SUPABASE_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([LATEST_UNIFIED_SUPABASE_SQL], { type: 'text/sql;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meshawir_noub_crm_latest.sql';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleDownloadExcel = () => {
    setDownloadingXlsx(true);
    try {
      const snap = getFullLocalSnapshot();
      downloadLatestExcelWorkbook({
        crmDb: snap.crmDb,
        meshawirTasks: snap.meshawirTasks,
        jointTasks: readLatestJointTasks(),
        rackDevices: snap.rackDevices,
        rackPorts: snap.rackPorts,
        verification30: snap.verification30,
      });
    } finally {
      setDownloadingXlsx(false);
    }
  };

  const handleSyncCache = () => {
    forceSyncCachesWithLatestSeed();
    setSyncedMsg(true);
    onCacheSynced?.();
    setTimeout(() => setSyncedMsg(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/55 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-[var(--app-surface)] text-[var(--app-text)] border border-[var(--app-border)] rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--app-border)] bg-[var(--app-surface-2)]">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-[var(--app-accent)]" />
            <div>
              <h3 className="text-base font-bold">
                مركز تصدير البيانات المحدّثة (SQL + Excel)
              </h3>
              <p className="text-xs text-[var(--app-muted)]">
                أحدث نسخة موحّدة بدون تعارضات — تشمل الجداول الـ 10 + منظومة مشاوير + 105 بند عمل مشترك
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="p-2 text-[var(--app-muted)] hover:text-[var(--app-text)] hover:bg-black/5 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-5">
          {/* Card 1: Latest Zero-Conflict SQL */}
          <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/8 space-y-3">
            <div>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <p className="text-sm font-bold">
                  1) أحدث ملف SQL شامل لـ Supabase (آمن للتشغيل فوق قاعدة بيانات قائمة)
                </p>
              </div>
              <p className="text-xs text-[var(--app-muted)] mt-1 leading-relaxed">
                يستخدم <span className="font-mono font-semibold">IF NOT EXISTS</span> و{' '}
                <span className="font-mono font-semibold">ADD COLUMN IF NOT EXISTS</span> و{' '}
                <span className="font-mono font-semibold">ON CONFLICT DO UPDATE</span> لتحديث جميع البيانات الجديدة (4B، كابتن مشاوير، Daro وWeKaLa المؤجلين، ER8411 Static IP + WireGuard، 58 منفذ راك، 16 كاميرا، 12 فاتورة، 30 بند تحقق، 105 مهمة مشتركة) دون أي تضارب أو تكرار.
              </p>
              <p className="text-[11px] font-mono text-[var(--app-muted)] mt-1.5" dir="ltr">
                public/exports/meshawir_noub_crm_latest.sql
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopySql}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--app-accent)] hover:opacity-90 text-white text-xs font-semibold rounded-lg cursor-pointer whitespace-nowrap"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>تم نسخ كود SQL بالكامل</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>نسخ كود SQL المحدث</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleDownloadSql}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--app-surface)] border border-[var(--app-border)] hover:bg-[var(--app-surface-2)] text-[var(--app-text)] text-xs font-semibold rounded-lg cursor-pointer whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                <span>تحميل ملف SQL</span>
              </button>
            </div>
          </div>

          {/* Card 2: Latest Multi-Sheet Excel Workbook */}
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/8 space-y-3">
            <div>
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <p className="text-sm font-bold">
                  2) ملف Excel الشامل المحدث (.xlsx — 16 ورقة عمل RTL)
                </p>
              </div>
              <p className="text-xs text-[var(--app-muted)] mt-1 leading-relaxed">
                يصدر آخر نسخة منسقة ومجمعة من كل الجداول والبيانات الحالية دون تعارض أو تكرار: المشاريع (9)، الاتصالات، الدومينات، المزودين (12)، مفاتيح API، البريد، الفواتير (12)، مسار الاستلام، الهيكل الوظيفي، المهام التنفيذية، المهام المشتركة (105)، الراك ومنافذه (58)، الكاميرات والتحويلات، مصفوفة التحقق (30)، والسجل الشامل (450).
              </p>
              <p className="text-[11px] font-mono text-[var(--app-muted)] mt-1.5" dir="ltr">
                public/exports/NOUB_CRM_Meshawir_Latest.xlsx
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={downloadingXlsx}
                onClick={handleDownloadExcel}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg cursor-pointer whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                <span>
                  {downloadingXlsx ? 'جاري تجهيز ملف الإكسيل...' : 'تحميل ملف Excel المحدث (.xlsx)'}
                </span>
              </button>
              <a
                href="/exports/NOUB_CRM_Meshawir_Latest.xlsx"
                download="NOUB_CRM_Meshawir_Latest.xlsx"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--app-surface)] border border-[var(--app-border)] hover:bg-[var(--app-surface-2)] text-[var(--app-text)] text-xs font-semibold rounded-lg whitespace-nowrap"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>تنزيل النسخة المرجعية الجاهزة</span>
              </a>
            </div>
          </div>

          {/* Card 3: Refresh local cache */}
          <div className="p-4 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-2)] flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold">مزامنة الذاكرة المحلية للمتصفح مع آخر تحديث</p>
              <p className="text-[11px] text-[var(--app-muted)] mt-0.5">
                يدمج أحدث النصوص والمواعيد في النظام مع الحفاظ على حالات المهام التي عدّلتها.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSyncCache}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[var(--app-surface)] border border-[var(--app-border)] hover:bg-black/5 text-xs font-semibold rounded-lg cursor-pointer whitespace-nowrap shrink-0"
            >
              {syncedMsg ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">تم التحديث بنجاح</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>تحديث البيانات المحلية</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
