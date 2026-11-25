import React, { useState } from 'react';
import { Lock, Mail, Settings2, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  getSupabaseClient,
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [sbUrl, setSbUrl] = useState(initialCfg.url);
  const [sbKey, setSbKey] = useState(initialCfg.anonKey);
  const [cfgSaved, setCfgSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const sb = getSupabaseClient();
      const { error: authError } = await sb.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (authError) {
        setError('بيانات الدخول غير صحيحة أو الحساب غير مفعّل في Supabase Auth.');
        return;
      }
      onSuccess();
    } catch (err: any) {
      setError(err?.message || 'تعذر الاتصال بخادم Supabase.');
    } finally {
      setLoading(false);
    }
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
        <div className="mb-6 pb-5 border-b border-slate-100">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-[#1E3A5F] tracking-tight">NOUB CRM</h1>
            <button
              type="button"
              onClick={onOpenGitHubExport}
              className="text-xs font-medium text-blue-700 hover:text-blue-900 underline underline-offset-4 whitespace-nowrap shrink-0 cursor-pointer"
            >
              تصدير ملفات GitHub
            </button>
          </div>
          <p className="mt-1.5 text-sm text-slate-600">
            منصة متابعة الاشتراكات والدومينات ومفاتيح API ومسار تسليم التطبيقات
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-sm font-semibold text-slate-700 mb-1.5">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pr-9 pl-3 py-2.5 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-left"
              />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className="block text-sm font-semibold text-slate-700 mb-1.5">
              كلمة المرور
            </label>
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
                placeholder="••••••••"
                className="w-full pr-9 pl-3 py-2.5 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-left"
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
            disabled={loading}
            className="w-full py-2.5 px-4 bg-[#1E3A5F] hover:bg-[#162d4a] disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
          >
            {loading ? 'جاري تسجيل الدخول...' : 'دخول إلى النظام'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowConfig((v) => !v)}
            className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>إعدادات اتصال Supabase</span>
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
                  SUPABASE_ANON_KEY
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
