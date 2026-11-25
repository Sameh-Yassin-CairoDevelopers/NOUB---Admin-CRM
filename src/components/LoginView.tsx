import React, { useEffect, useState } from 'react';
import {
  Lock,
  Settings2,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Database,
  ShieldCheck,
  Palette,
} from 'lucide-react';
import {
  APP_PASSCODE,
  testDirectSupabaseConnection,
  unlockWithPasscode,
} from '../lib/dataService';
import {
  getSupabaseConfig,
  resetSupabaseConfig,
  saveSupabaseConfig,
} from '../lib/supabase';
import { THEME_OPTIONS, type ThemeId } from '../lib/theme';

interface LoginViewProps {
  onSuccess: () => void;
  onOpenDataExport: () => void;
  theme: ThemeId;
  onChangeTheme: (theme: ThemeId) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onSuccess,
  onOpenDataExport,
  theme,
  onChangeTheme,
}) => {
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
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-[var(--app-surface)] border border-[var(--app-border)] rounded-xl p-8">
        <div className="mb-5 pb-4 border-b border-[var(--app-border)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-[var(--app-accent)] tracking-tight">NOUB CRM</h1>
              <p className="text-[11px] font-semibold text-[var(--app-muted)] mt-0.5">
                منظومة مشاوير للمنصات الرقمية ومقر المعادي
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenDataExport}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--app-accent)] hover:underline underline-offset-4 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Database className="w-3.5 h-3.5" />
              <span>تصدير SQL و Excel</span>
            </button>
          </div>
          <p className="mt-2.5 text-xs text-[var(--app-muted)] leading-relaxed">
            ربط مباشر بقاعدة بيانات Supabase بدون الحاجة لبريد إلكتروني أو إنشاء حساب — أدخل كلمة المرور المشتركة فقط.
          </p>
        </div>

        {/* Theme quick selector */}
        <div className="mb-4 flex items-center justify-between gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 text-[var(--app-muted)] font-medium">
            <Palette className="w-3.5 h-3.5" />
            <span>مظهر الواجهة</span>
          </span>
          <div className="flex items-center gap-1.5">
            {THEME_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                title={opt.label}
                onClick={() => onChangeTheme(opt.id)}
                className={`px-2 py-1 text-[11px] font-semibold rounded-md border transition-colors cursor-pointer ${
                  theme === opt.id
                    ? 'border-[var(--app-accent)] bg-[var(--app-accent)] text-white'
                    : 'border-[var(--app-border)] bg-[var(--app-surface-2)] text-[var(--app-text)] hover:opacity-80'
                }`}
              >
                {opt.shortLabel}
              </button>
            ))}
          </div>
        </div>

        {/* Direct Supabase Status */}
        <div className="mb-5 p-3 rounded-lg bg-[var(--app-surface-2)] border border-[var(--app-border)] flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Database className="w-4 h-4 text-[var(--app-accent)] shrink-0" />
            <div className="min-w-0">
              <p className="font-semibold">اتصال Supabase المباشر</p>
              <p className="text-[11px] text-[var(--app-muted)] font-mono truncate" dir="ltr">
                {sbUrl.replace('https://', '')}
              </p>
            </div>
          </div>
          <span
            className={`text-[11px] font-bold shrink-0 ${
              !sbState.checked
                ? 'text-[var(--app-muted)]'
                : sbState.connected
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-amber-600 dark:text-amber-400'
            }`}
          >
            {!sbState.checked
              ? 'جاري الفحص...'
              : sbState.meshawirReady
                ? 'متصل ومفعّل بالكامل'
                : sbState.connected
                  ? 'متصل (يُفضّل تشغيل SQL المحدث)'
                  : 'وضع هجين فوري'}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="login-password" className="block text-sm font-semibold">
                كلمة مرور النظام
              </label>
              <span className="text-xs text-[var(--app-accent)] font-mono font-bold" dir="ltr">
                12345678
              </span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[var(--app-muted)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="12345678"
                className="w-full pr-9 pl-3 py-2.5 text-sm font-mono border border-[var(--app-border)] rounded-lg bg-[var(--app-surface)] text-[var(--app-text)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)] text-left"
              />
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-medium"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[var(--app-sidebar)] hover:opacity-95 text-white text-sm font-semibold rounded-lg transition-opacity cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>دخول مباشر إلى لوحة التحكم</span>
          </button>
        </form>

        <div className="mt-3">
          <button
            type="button"
            onClick={handleQuickEnter}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-500/10 hover:bg-blue-500/15 border border-blue-500/30 text-[var(--app-accent)] text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            <KeyRound className="w-4 h-4 shrink-0" />
            <span>دخول فوري بضغطة واحدة (12345678)</span>
          </button>
        </div>

        <div className="mt-5 pt-4 border-t border-[var(--app-border)]">
          <button
            type="button"
            onClick={() => setShowConfig((v) => !v)}
            className="flex items-center gap-2 text-xs font-medium text-[var(--app-muted)] hover:text-[var(--app-text)] cursor-pointer"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>تعديل إعدادات اتصال Supabase</span>
          </button>

          {showConfig && (
            <form onSubmit={handleSaveConfig} className="mt-3 space-y-3 pt-3 border-t border-[var(--app-border)]">
              <div>
                <label className="block text-xs font-semibold text-[var(--app-muted)] mb-1">SUPABASE_URL</label>
                <input
                  type="url"
                  required
                  dir="ltr"
                  value={sbUrl}
                  onChange={(e) => setSbUrl(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] rounded-md text-left"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--app-muted)] mb-1">
                  SUPABASE_PUBLISHABLE_KEY
                </label>
                <input
                  type="text"
                  required
                  dir="ltr"
                  value={sbKey}
                  onChange={(e) => setSbKey(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] rounded-md text-left"
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[var(--app-accent)] hover:opacity-90 text-white text-xs font-semibold rounded-md cursor-pointer"
                >
                  حفظ الاتصال
                </button>
                <button
                  type="button"
                  onClick={handleResetConfig}
                  className="px-3 py-1.5 bg-[var(--app-surface-2)] hover:opacity-80 text-[var(--app-text)] text-xs font-medium rounded-md cursor-pointer"
                >
                  استعادة الافتراضي
                </button>
              </div>
              {cfgSaved && (
                <p className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
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
