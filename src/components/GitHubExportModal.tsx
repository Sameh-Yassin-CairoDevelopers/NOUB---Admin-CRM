import React, { useState } from 'react';
import {
  X,
  Download,
  FileCode2,
  FolderCheck,
  Archive,
  Copy,
  Check,
  FileText,
  Database,
} from 'lucide-react';
import {
  downloadGitHubZip,
  downloadSingleStandaloneHtml,
  downloadSingleStaticFile,
  generateGitHubRootFiles,
  generateSingleFileHtml,
  type StaticBundleFiles,
} from '../lib/githubExport';
import { UNIFIED_SUPABASE_SQL } from '../data/meshawirMasterData';
import { getSupabaseConfig } from '../lib/supabase';

interface GitHubExportModalProps {
  open: boolean;
  onClose: () => void;
}

const FILE_DESCRIPTIONS: Array<{ name: keyof StaticBundleFiles; desc: string }> = [
  { name: 'index.html', desc: 'الصفحة الرئيسية (تقرأ ./style.css و ./app.js من المجلد الرئيسي مباشرة)' },
  { name: 'style.css', desc: 'التنسيق المحدث مع دعم الخطوط العربية والراك التفاعلي والرسوم' },
  { name: 'config.js', desc: 'إعدادات Supabase المباشرة بدون تسجيل دخول إيميل' },
  { name: 'tables.js', desc: 'تعريف الجداول العشرة وخيارات الفلترة والتطبيقات' },
  { name: 'app.js', desc: 'الدخول بكلمة مرور 12345678 + الراك التفاعلي 27U + منظومة مشاوير' },
];

export const GitHubExportModal: React.FC<GitHubExportModalProps> = ({ open, onClose }) => {
  const cfg = getSupabaseConfig();
  const [sbUrl, setSbUrl] = useState(cfg.url);
  const [sbKey, setSbKey] = useState(cfg.anonKey);
  const [downloading, setDownloading] = useState(false);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  if (!open) return null;

  const handleZipDownload = async () => {
    setDownloading(true);
    try {
      await downloadGitHubZip(sbUrl, sbKey);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopySingleHtml = async () => {
    const html = generateSingleFileHtml(sbUrl, sbKey);
    await navigator.clipboard.writeText(html);
    setCopiedFile('SINGLE_HTML');
    setTimeout(() => setCopiedFile(null), 2500);
  };

  const handleCopySql = async () => {
    await navigator.clipboard.writeText(UNIFIED_SUPABASE_SQL);
    setCopiedFile('UNIFIED_SQL');
    setTimeout(() => setCopiedFile(null), 2500);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([UNIFIED_SUPABASE_SQL], { type: 'text/sql;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meshawir_unified_supabase.sql';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleCopyFile = async (filename: keyof StaticBundleFiles) => {
    const files = generateGitHubRootFiles(sbUrl, sbKey);
    await navigator.clipboard.writeText(files[filename]);
    setCopiedFile(filename);
    setTimeout(() => setCopiedFile(null), 2000);
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
                تصدير نسخة GitHub Pages وكود Supabase الموحد
              </h3>
              <p className="text-xs text-slate-500">
                يحل مشكلة الصفحة البيضاء نهائياً ويربط جميع جداول مشاوير الـ 22 + CRM مباشرة بـ Supabase
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
          {/* Primary Single-File Option */}
          <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/70 space-y-3">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-700" />
                <p className="text-sm font-bold text-slate-900">
                  1) ملف HTML واحد مستقل (يحل الصفحة البيضاء على GitHub Pages فوراً)
                </p>
              </div>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                يظهر شاشة كلمة المرور <span className="font-mono font-bold">12345678</span> مباشرة دون انتظار أي ملف خارجي، ويتضمن الراك التفاعلي 27U وكل جداول مشاوير والعمل المشترك.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => downloadSingleStandaloneHtml(sbUrl, sbKey)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E3A5F] hover:bg-[#162d4a] text-white text-xs font-semibold rounded-lg cursor-pointer whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                <span>تحميل index.html الواحد</span>
              </button>
              <button
                type="button"
                onClick={handleCopySingleHtml}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg cursor-pointer whitespace-nowrap"
              >
                {copiedFile === 'SINGLE_HTML' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-700" />
                    <span className="text-emerald-700">تم نسخ الكود بالكامل</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>نسخ كود index.html الكامل</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Unified Supabase SQL Section */}
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/60 space-y-3">
            <div>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-700" />
                <p className="text-sm font-bold text-slate-900">
                  2) كود SQL الشامل لـ Supabase (الجداول الـ 10 + جداول مشاوير الـ 22)
                </p>
              </div>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                الصقه في <span className="font-mono font-semibold">Supabase SQL Editor</span> واضغط <span className="font-semibold">Run</span> لفتح الوصول المباشر بدون إيميل وإنشاء جداول الراك والمشاريع والكاميرات والفواتير.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopySql}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg cursor-pointer whitespace-nowrap"
              >
                {copiedFile === 'UNIFIED_SQL' ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>تم نسخ كود SQL بالكامل</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>نسخ كود SQL الشامل</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleDownloadSql}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg cursor-pointer whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                <span>تحميل ملف SQL</span>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5">
            <p className="font-bold text-slate-900">لماذا كانت الصفحة بيضاء على GitHub Pages وكيف نرفع التحديث؟</p>
            <p>
              1. مستودع <span className="font-mono font-semibold">Sameh-Yassin-CairoDevelopers/NOUB-CRM</span> لا يزال يحتوي على ملف <span className="font-mono">index.html</span> القديم الذي يخفي الشاشة بـ <span className="font-mono">hidden</span> ويطلب ملفات مفقودة.
            </p>
            <p>
              2. ارفع <span className="font-mono font-semibold">index.html</span> الواحد المحمّل من الزر بالأعلى إلى جذر المستودع على GitHub واضغط <span className="font-semibold">Commit changes</span>.
            </p>
            <p>
              3. انتظر 60 ثانية ثم افتح رابط الموقع واضغط <span className="font-mono">Ctrl+F5</span> وأدخل كلمة المرور <span className="font-mono font-bold">12345678</span>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                SUPABASE_URL
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
                SUPABASE_PUBLISHABLE_KEY
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

          {/* Secondary 5-file option */}
          <div className="pt-2 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-slate-800">أو نسخة الـ 5 ملفات المنفصلة (ZIP للمجلد الرئيسي)</p>
                <p className="text-[11px] text-slate-500">
                  في حال تفضيل فصل ملفات التنسيق والجافا سكريبت في جذر المستودع
                </p>
              </div>
              <button
                type="button"
                disabled={downloading}
                onClick={handleZipDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg cursor-pointer whitespace-nowrap shrink-0"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>{downloading ? 'جاري التجهيز...' : 'تحميل ZIP'}</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
              {FILE_DESCRIPTIONS.map((item) => (
                <div key={item.name} className="flex items-center justify-between gap-3 px-4 py-2 bg-white">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileCode2 className="w-4 h-4 text-slate-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold font-mono text-slate-900" dir="ltr">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{item.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopyFile(item.name)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-md cursor-pointer whitespace-nowrap"
                    >
                      {copiedFile === item.name ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-700" />
                          <span className="text-emerald-700">تم النسخ</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>نسخ</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadSingleStaticFile(item.name, sbUrl, sbKey)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-md cursor-pointer whitespace-nowrap"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>تحميل</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
