/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard,
  Layers,
  LogOut,
  Menu,
  X,
  FolderGit2,
  Phone,
  Globe,
  Bookmark,
  Server,
  KeyRound,
  Monitor,
  Receipt,
  AppWindow,
  CheckSquare,
  Users,
  Info,
  ClipboardCheck,
  ShieldCheck,
  Archive,
} from 'lucide-react';
import { TABLES } from './data/tables';
import { getLocalSessionEmail, setLocalSessionEmail } from './lib/dataService';
import { getSupabaseClient } from './lib/supabase';
import type { TableId, ViewId } from './types/crm';
import { LoginView } from './components/LoginView';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { AppWorkspaceView } from './components/AppWorkspaceView';
import { DataGridView } from './components/DataGridView';
import { GitHubExportModal } from './components/GitHubExportModal';
import { JointTasksView } from './components/JointTasksView';
import { HandoverView } from './components/HandoverView';
import { MasterRegistryView } from './components/MasterRegistryView';

const TABLE_ICONS: Record<TableId, React.ReactNode> = {
  telecom_lines: <Phone className="w-4 h-4 shrink-0" />,
  domains: <Globe className="w-4 h-4 shrink-0" />,
  wanted_domains: <Bookmark className="w-4 h-4 shrink-0" />,
  providers: <Server className="w-4 h-4 shrink-0" />,
  api_keys: <KeyRound className="w-4 h-4 shrink-0" />,
  sites: <Monitor className="w-4 h-4 shrink-0" />,
  payments: <Receipt className="w-4 h-4 shrink-0" />,
  apps: <AppWindow className="w-4 h-4 shrink-0" />,
  deliverables: <CheckSquare className="w-4 h-4 shrink-0" />,
  team: <Users className="w-4 h-4 shrink-0" />,
};

export default function App() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState(false);
  const [activeView, setActiveView] = useState<ViewId>('dash');
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  const checkSession = async () => {
    setCheckingAuth(true);
    try {
      const sb = getSupabaseClient();
      const { data } = await sb.auth.getSession();
      if (data.session?.user?.email) {
        setLocalSessionEmail(null);
        setLocalPreview(false);
        setUserEmail(data.session.user.email);
        return;
      }
    } catch {
      // Ignore and check local preview session
    } finally {
      setCheckingAuth(false);
    }

    const localEmail = getLocalSessionEmail();
    if (localEmail) {
      setLocalPreview(true);
      setUserEmail(localEmail);
    } else {
      setLocalPreview(false);
      setUserEmail(null);
    }
  };

  useEffect(() => {
    checkSession();
    try {
      const sb = getSupabaseClient();
      const { data: listener } = sb.auth.onAuthStateChange((_event, session) => {
        if (session?.user?.email) {
          setLocalSessionEmail(null);
          setLocalPreview(false);
          setUserEmail(session.user.email);
        } else if (!getLocalSessionEmail()) {
          setLocalPreview(false);
          setUserEmail(null);
        }
      });
      return () => listener.subscription.unsubscribe();
    } catch {
      return undefined;
    }
  }, []);

  const handleSignOut = async () => {
    setLocalSessionEmail(null);
    setLocalPreview(false);
    try {
      const sb = getSupabaseClient();
      await sb.auth.signOut();
    } finally {
      setUserEmail(null);
    }
  };

  const activeTable = useMemo(
    () => TABLES.find((t) => t.id === activeView) || null,
    [activeView]
  );

  const headerInfo = useMemo(() => {
    if (activeView === 'dash') {
      return {
        title: 'ملخص المتابعة والرسوم البيانية',
        subtitle: 'نظرة شاملة على الاستحقاقات المالية وجاهزية التطبيقات',
      };
    }
    if (activeView === 'app-workspace') {
      return {
        title: 'متابعة التطبيقات والهيكل الوظيفي',
        subtitle: 'مسار الاستلام المرحلي وتوزيع المسؤوليات لكل تطبيق',
      };
    }
    if (activeView === 'joint-tasks') {
      return {
        title: 'جدول متابعة بنود العمل المشتركة (105 بنود)',
        subtitle: 'متابعة تنفيذ م/ عماد الشرقاوي وم/ سامح ياسين وتحديث الحالات لحظياً',
      };
    }
    if (activeView === 'handover') {
      return {
        title: 'حزمة تسليم مقر المعادي إلى م/ عماد الشرقاوي',
        subtitle: 'البوابات الـ 14، Zoho Lite، السنترال الجراند ستريم، راك 27U، وسحابة WE',
      };
    }
    if (activeView === 'master-registry') {
      return {
        title: 'السجل المرجعي الشامل للمشروع (450 بنداً)',
        subtitle: 'الأرشيف الكامل للمهام والأفكار والفواتير والأجهزة والقرارات',
      };
    }
    return {
      title: activeTable?.name || '',
      subtitle: activeTable?.description || '',
    };
  }, [activeView, activeTable]);

  const navigate = (view: ViewId) => {
    setActiveView(view);
    setMobileNavOpen(false);
  };

  const handleSelectAppFromDashboard = (appId: string) => {
    setSelectedAppId(appId);
    setActiveView('app-workspace');
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-xl px-8 py-6 text-center space-y-2">
          <p className="text-sm font-bold text-[#1E3A5F]">NOUB CRM</p>
          <p className="text-xs text-slate-500">جاري التحقق من جلسة الدخول...</p>
        </div>
      </div>
    );
  }

  if (!userEmail) {
    return (
      <>
        <LoginView
          onSuccess={checkSession}
          onOpenGitHubExport={() => setExportModalOpen(true)}
        />
        <GitHubExportModal
          open={exportModalOpen}
          onClose={() => setExportModalOpen(false)}
        />
      </>
    );
  }

  const navGroups: Array<{ id: 'subscriptions' | 'apps' | 'finance'; label: string }> = [
    { id: 'subscriptions', label: 'الاشتراكات والوصول' },
    { id: 'apps', label: 'التطبيقات والفرق' },
    { id: 'finance', label: 'المالية' },
  ];

  const renderNavContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-3 pb-4 mb-3 border-b border-white/15">
        <h2 className="text-lg font-bold text-white tracking-tight">NOUB CRM</h2>
        <p className="text-[11px] text-slate-300 mt-1 truncate" dir="ltr">
          {userEmail}
        </p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-1">
        <button
          type="button"
          onClick={() => navigate('dash')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            activeView === 'dash'
              ? 'bg-blue-600 text-white font-semibold'
              : 'text-slate-200 hover:bg-white/10'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          <span>الملخص والرسوم</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('app-workspace')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            activeView === 'app-workspace'
              ? 'bg-blue-600 text-white font-semibold'
              : 'text-slate-200 hover:bg-white/10'
          }`}
        >
          <Layers className="w-4 h-4 shrink-0" />
          <span>التطبيقات والهيكل</span>
        </button>

        <div className="pt-3">
          <p className="px-3 pb-1 text-[11px] font-semibold text-slate-400">
            إدارة مقر المعادي والتسليم
          </p>
          <div className="space-y-0.5">
            <button
              type="button"
              onClick={() => navigate('joint-tasks')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeView === 'joint-tasks'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-200 hover:bg-white/10'
              }`}
            >
              <ClipboardCheck className="w-4 h-4 shrink-0" />
              <span>المهام المشتركة (105)</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('handover')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeView === 'handover'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-200 hover:bg-white/10'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>تسليم م/ عماد (المقر)</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('master-registry')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeView === 'master-registry'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-200 hover:bg-white/10'
              }`}
            >
              <Archive className="w-4 h-4 shrink-0" />
              <span>السجل الشامل (450)</span>
            </button>
          </div>
        </div>

        {navGroups.map((group) => (
          <div key={group.id} className="pt-3">
            <p className="px-3 pb-1 text-[11px] font-semibold text-slate-400">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {TABLES.filter((t) => t.group === group.id).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => navigate(t.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    activeView === t.id
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-200 hover:bg-white/10'
                  }`}
                >
                  {TABLE_ICONS[t.id]}
                  <span>{t.name}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="pt-3 mt-3 border-t border-white/15 space-y-2 px-1">
        <button
          type="button"
          onClick={() => setExportModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors whitespace-nowrap cursor-pointer"
        >
          <FolderGit2 className="w-4 h-4 shrink-0" />
          <span>ملفات GitHub Pages</span>
        </button>
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/10 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden bg-[#1E3A5F] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <span className="font-bold text-base">NOUB CRM</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setExportModalOpen(true)}
            className="px-2.5 py-1.5 text-xs font-semibold bg-white/15 rounded-md whitespace-nowrap cursor-pointer"
          >
            ملفات GitHub
          </button>
          <button
            type="button"
            onClick={() => setMobileNavOpen((v) => !v)}
            aria-label="القائمة"
            className="p-1.5 rounded-md hover:bg-white/10 cursor-pointer"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="w-64 bg-[#1E3A5F] text-white p-4 h-full overflow-y-auto">
            {renderNavContent()}
          </div>
          <div
            className="flex-1 bg-slate-900/40"
            onClick={() => setMobileNavOpen(false)}
          />
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-[#1E3A5F] text-white p-4 sticky top-0 h-screen shrink-0">
        {renderNavContent()}
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-[1440px]">
        {localPreview && (
          <div className="mb-4 px-4 py-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0 text-amber-700" />
              <span>
                وضع المعاينة الفورية (محلي على متصفحك) — للحفظ السحابي على Supabase، أنشئ حساباً أو سجل بحساب مفعّل.
              </span>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="font-bold underline underline-offset-4 hover:text-amber-950 whitespace-nowrap cursor-pointer"
            >
              تسجيل بحساب Supabase
            </button>
          </div>
        )}

        <header className="pb-5 mb-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{headerInfo.title}</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">{headerInfo.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={() => setExportModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
          >
            <FolderGit2 className="w-4 h-4 text-[#1E3A5F]" />
            <span>تحميل حزمة GitHub الجاهزة</span>
          </button>
        </header>

        {activeView === 'dash' && (
          <ExecutiveDashboard onSelectApp={handleSelectAppFromDashboard} />
        )}

        {activeView === 'app-workspace' && (
          <AppWorkspaceView initialAppId={selectedAppId} />
        )}

        {activeView === 'joint-tasks' && <JointTasksView />}

        {activeView === 'handover' && <HandoverView />}

        {activeView === 'master-registry' && <MasterRegistryView />}

        {activeTable && <DataGridView table={activeTable} />}
      </main>

      <GitHubExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
      />
    </div>
  );
}
