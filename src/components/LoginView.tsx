import React, { useEffect, useState } from 'react';
import {
  Lock,
  Settings2,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  FolderGit2,
  Download,
  Database,
  ShieldCheck,
} from 'lucide-react';
import {
  APP_PASSCODE,
  testDirectSupabaseConnection,
  unlockWithPasscode,
} from '../lib/dataService';
import { downloadSingleStandaloneHtml } from '../lib/githubExport';
import {
  getSupabaseConfig,
  resetSupabaseConfig,
  saveSupabaseConfig,
} from '../lib/supabase';

interface LoginViewProps {
  onSuccess: () => void;
  onOpenGitHubExport: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSuccess, onOpenGitHubExport }) => {
  const initialCfg = getSupabaseConfig();
  const [password, setPassword] = useState(APP_PASSCODE);
  const [error, setError] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [sbUrl, setSbUrl] = useState(initialCfg.url);
  const [sbKey, setSbKey] = useState(initialCfg.anonKey);
  const [cfgSaved, setCfgSaved] = useState(false);
  const [sbState, setSbState] = useState<{
    checked: boolean;
    connected: boolean;
    meshawirReady: boolean;
  }>({ checked: false, connected: false, meshawirReady: false });

  useEffect(() => {
    let mounted = true;
    testDirectSupabaseConnection().then((res) => {
      if (mounted) {
        setSbState({
          checked: true,
          connected: res.connected,
          meshawirReady: res.meshawirReady,
        });
      }
    });
    return () => {
      mounted = false;
    };
  }, [cfgSaved]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (unlockWithPasscode(password)) {
      onSuccess();
    } else {
      setError('كلمة المرور غير صحيحة. كلمة المرور الثابتة للدخول هي: 12345678');
    }
  };

  const handleQuickEnter = () => {
    setError(null);
    setPassword(APP_PASSCODE);
    unlockWithPasscode(APP_PASSCODE);
    onSuccess();
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(sbUrl, sbKey);
    setCfgSaved(true);
    setTimeout(() => setCfgSaved(false), 2500);
  };

  const handleResetConfig = () => {
    resetSupabaseConfig();
    const def = getSupabaseConfig();
    setSbUrl(def.url);
    setSbKey(def.anonKey);
    setCfgSaved(true);
    setTimeout(() => setCfgSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-8">
        <div className="mb-5 pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-[#1E3A5F] tracking-tight">NOUB CRM</h1>
              <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                منظومة مشاوير للمنصات الرقمية ومقر المعادي
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenGitHubExport}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 underline underline-offset-4 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>ملفات GitHub و SQL</span>
            </button>
          </div>
          <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
            ربط مباشر بقاعدة بيانات Supabase بدون الحاجة لبريد إلكتروني أو إنشاء حساب — أدخل كلمة المرور المشتركة فقط.
          </p>
        </div>

        {/* Direct Supabase Status */}
        <div className="mb-5 p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Database className="w-4 h-4 text-[#1E3A5F] shrink-0" />
            <div className="min-w-0">
              <p className="font-semibold text-slate-800">اتصال Supabase المباشر</p>
              <p className="text-[11px] text-slate-500 font-mono truncate" dir="ltr">
                {sbUrl.replace('https://', '')}
              </p>
            </div>
          </div>
          <span
            className={`text-[11px] font-bold shrink-0 ${
              !sbState.checked
                ? 'text-slate-500'
                : sbState.connected
                  ? 'text-emerald-700'
                  : 'text-amber-700'
            }`}
          >
            {!sbState.checked
              ? 'جاري الفحص...'
              : sbState.meshawirReady
                ? 'متصل ومفعّل بالكامل'
                : sbState.connected
                  ? 'متصل (يُفضّل تشغيل SQL الموحد)'
                  : 'وضع هجين فوري'}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="login-password" className="block text-sm font-semibold text-slate-700">
                كلمة مرور النظام
              </label>
              <span className="text-xs text-blue-700 font-mono font-bold" dir="ltr">
                12345678
              </span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="12345678"
                className="w-full pr-9 pl-3 py-2.5 text-sm font-mono border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-left"
              />
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#1E3A5F] hover:bg-[#162d4a] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>دخول مباشر إلى لوحة التحكم</span>
          </button>
        </form>

        <div className="mt-3 space-y-2">
          <button
            type="button"
            onClick={handleQuickEnter}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            <KeyRound className="w-4 h-4 shrink-0" />
            <span>دخول فوري بضغطة واحدة (12345678)</span>
          </button>

          <button
            type="button"
            onClick={() => downloadSingleStandaloneHtml(sbUrl, sbKey)}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>تحميل index.html الواحد لحل الصفحة البيضاء على GitHub</span>
          </button>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowConfig((v) => !v)}
            className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>تعديل إعدادات اتصال Supabase</span>
          </button>

          {showConfig && (
            <form onSubmit={handleSaveConfig} className="mt-3 space-y-3 pt-3 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">SUPABASE_URL</label>
                <input
                  type="url"
                  required
                  dir="ltr"
                  value={sbUrl}
                  onChange={(e) => setSbUrl(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-md text-left"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  SUPABASE_PUBLISHABLE_KEY
                </label>
                <input
                  type="text"
                  required
                  dir="ltr"
                  value={sbKey}
                  onChange={(e) => setSbKey(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-md text-left"
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md cursor-pointer"
                >
                  حفظ الاتصال
                </button>
                <button
                  type="button"
                  onClick={handleResetConfig}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-md cursor-pointer"
                >
                  استعادة الافتراضي
                </button>
              </div>
              {cfgSaved && (
                <p className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>تم تحديث إعدادات الاتصال بنجاح</span>
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
