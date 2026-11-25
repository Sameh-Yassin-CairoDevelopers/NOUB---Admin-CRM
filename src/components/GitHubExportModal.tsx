import React, { useState } from 'react';
import { X, Download, FileCode2, FolderCheck, Archive } from 'lucide-react';
import {
  downloadGitHubZip,
  downloadSingleStaticFile,
  type StaticBundleFiles,
} from '../lib/githubExport';
import { getSupabaseConfig } from '../lib/supabase';

interface GitHubExportModalProps {
  open: boolean;
  onClose: () => void;
}

const FILE_DESCRIPTIONS: Array<{ name: keyof StaticBundleFiles; desc: string }> = [
  { name: 'index.html', desc: 'الصفحة الرئيسية (مصححة لتقرأ مباشرة من ./ في المجلد الرئيسي)' },
  { name: 'style.css', desc: 'التنسيق المحدث مع دعم الخطوط العربية والرسوم البيانية' },
  { name: 'config.js', desc: 'إعدادات Supabase الخاصة بمشروعك' },
  { name: 'tables.js', desc: 'تعريف الجداول العشرة وخيارات الفلترة والتطبيقات' },
  { name: 'app.js', desc: 'منطق التشغيل الآمن + الرسوم البيانية + الفلاتر + تصدير CSV' },
];

export const GitHubExportModal: React.FC<GitHubExportModalProps> = ({ open, onClose }) => {
  const cfg = getSupabaseConfig();
  const [sbUrl, setSbUrl] = useState(cfg.url);
  const [sbKey, setSbKey] = useState(cfg.anonKey);
  const [downloading, setDownloading] = useState(false);

  if (!open) return null;

  const handleZipDownload = async () => {
    setDownloading(true);
    try {
      await downloadGitHubZip(sbUrl, sbKey);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <FolderCheck className="w-5 h-5 text-[#1E3A5F]" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                تصدير ملفات GitHub Pages المصححة (NOUB-CRM)
              </h3>
              <p className="text-xs text-slate-500">
                جاهزة للرفع المباشر في المجلد الرئيسي للمستودع بدون مجلدات css أو js
              </p>
            </div>
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

        <div className="overflow-y-auto p-6 space-y-5">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5">
            <p className="font-bold text-slate-900">ما الذي تم إصلاحه في هذه الحزمة؟</p>
            <p>
              1. تعديل مسارات الاستدعاء في <span className="font-mono">index.html</span> من{' '}
              <span className="font-mono text-red-700">css/style.css</span> و{' '}
              <span className="font-mono text-red-700">js/*.js</span> إلى{' '}
              <span className="font-mono text-emerald-700">./style.css</span> و{' '}
              <span className="font-mono text-emerald-700">./*.js</span> للقراءة من المجلد الرئيسي مباشرة.
            </p>
            <p>
              2. إضافة شاشة تحميل ومعالجة أخطاء صريحة بدلاً من الإخفاء التلقائي بـ <span className="font-mono">hidden</span>{' '}
              لتفادي ظهور صفحة بيضاء عند أي عطل.
            </p>
            <p>
              3. تضمين الرسوم البيانية للتطبيقات، شاشة متابعة التطبيق والهيكل الوظيفي، الفلاتر المتعددة، وتصدير CSV.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                SUPABASE_URL (داخل config.js)
              </label>
              <input
                type="url"
                dir="ltr"
                value={sbUrl}
                onChange={(e) => setSbUrl(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg text-left"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                SUPABASE_ANON_KEY (داخل config.js)
              </label>
              <input
                type="text"
                dir="ltr"
                value={sbKey}
                onChange={(e) => setSbKey(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg text-left"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 p-4 rounded-lg border border-blue-200 bg-blue-50/60">
            <div>
              <p className="text-sm font-bold text-slate-900">تحميل الحزمة الكاملة (ملف مضغوط ZIP)</p>
              <p className="text-xs text-slate-600 mt-0.5">
                فك الضغط وارفع الملفات الخمسة مباشرة إلى جذر مستودع NOUB-CRM على GitHub
              </p>
            </div>
            <button
              type="button"
              disabled={downloading}
              onClick={handleZipDownload}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg cursor-pointer whitespace-nowrap shrink-0"
            >
              <Archive className="w-4 h-4" />
              <span>{downloading ? 'جاري التجهيز...' : 'تحميل ZIP كامل'}</span>
            </button>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-700 mb-2">أو تحميل كل ملف على حدة:</p>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
              {FILE_DESCRIPTIONS.map((item) => (
                <div key={item.name} className="flex items-center justify-between gap-3 px-4 py-2.5 bg-white">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileCode2 className="w-4 h-4 text-slate-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold font-mono text-slate-900" dir="ltr">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{item.desc}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => downloadSingleStaticFile(item.name, sbUrl, sbKey)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-md cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تحميل</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
