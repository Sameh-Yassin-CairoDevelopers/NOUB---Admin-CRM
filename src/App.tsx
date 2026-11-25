/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
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
  ClipboardCheck,
  ShieldCheck,
  Archive,
  Network,
  Database,
} from 'lucide-react';
import { TABLES } from './data/tables';
import {
  isPasscodeUnlocked,
  lockWorkspace,
} from './lib/dataService';
import type { TableId, ViewId } from './types/crm';
import { LoginView } from './components/LoginView';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { AppWorkspaceView } from './components/AppWorkspaceView';
import { DataGridView } from './components/DataGridView';
import { GitHubExportModal } from './components/GitHubExportModal';
import { JointTasksView } from './components/JointTasksView';
import { HandoverView } from './components/HandoverView';
import { MasterRegistryView } from './components/MasterRegistryView';
import { InteractiveRackView } from './components/InteractiveRackView';
import { MeshawirEcosystemView } from './components/MeshawirEcosystemView';

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error?.message || 'خطأ غير متوقع في واجهة النظام' };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-red-200 rounded-xl p-6 space-y-3 text-center">
            <h2 className="text-base font-bold text-red-700">تعذر عرض الصفحة مؤقتاً</h2>
            <p className="text-xs text-slate-600 font-mono">{this.state.message}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#1E3A5F] text-white text-xs font-semibold rounded-lg cursor-pointer"
            >
              إعادة تحميل الصفحة
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

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

function MainApp() {
  const [unlocked, setUnlocked] = useState<boolean>(() => isPasscodeUnlocked());
  const [activeView, setActiveView] = useState<ViewId>('dash');
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  const handleUnlockSuccess = () => {
    setUnlocked(true);
  };

  const handleLockOut = () => {
    lockWorkspace();
    setUnlocked(false);
  };

  const activeTable = useMemo(
    () => TABLES.find((t) => t.id === activeView) || null,
    [activeView]
  );

  const headerInfo = useMemo(() => {
    if (activeView === 'dash') {
      return {
        title: 'ملخص المتابعة والرسوم البيانية',
        subtitle: 'ربط مباشر بـ Supabase لمتابعة الاستحقاقات المالية وجاهزية تطبيقات مشاوير (4B · Daro · WeKaLa)',
      };
    }
    if (activeView === 'rack') {
      return {
        title: 'الراك التفاعلي وغرفة سيرفرات المعادي (Perla 27U)',
        subtitle: 'سيسكو 3850 (48 بورت)، راوتر/فايروول TP-Link ER8411، وسنترال Grandstream 604A — بقيادة م/ عماد الشرقاوي وم/ سامح يس',
      };
    }
    if (activeView === 'ecosystem') {
      return {
        title: 'منظومة مشاوير الشاملة (8 مشاريع + 22 جدولاً)',
        subtitle: 'تطبيقات 4B ودارو ووكالة، الهيكل البشري (13)، المقر (10 مناطق)، 16 كاميرا، فواتير ETA، الملفات القانونية، وكاجل',
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
        subtitle: 'متابعة تنفيذ م/ عماد الشرقاوي وم/ سامح يس وتحديث الحالات لحظياً',
      };
    }
    if (activeView === 'handover') {
      return {
        title: 'حزمة تسليم مقر المعادي إلى م/ عماد الشرقاوي',
        subtitle: 'البوابات الـ 14، Zoho Lite، السنترال الجراند ستريم 604A، راوتر ER8411، راك 27U، وسحابة WE',
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

  if (!unlocked) {
    return (
      <>
        <LoginView
          onSuccess={handleUnlockSuccess}
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
        <p className="text-[11px] text-emerald-300 mt-1 flex items-center gap-1.5">
          <Database className="w-3 h-3 shrink-0" />
          <span>ربط مباشر مع Supabase</span>
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
          onClick={() => navigate('rack')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            activeView === 'rack'
              ? 'bg-blue-600 text-white font-semibold'
              : 'text-slate-200 hover:bg-white/10'
          }`}
        >
          <Server className="w-4 h-4 shrink-0" />
          <span>الراك التفاعلي 27U</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('ecosystem')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            activeView === 'ecosystem'
              ? 'bg-blue-600 text-white font-semibold'
              : 'text-slate-200 hover:bg-white/10'
          }`}
        >
          <Network className="w-4 h-4 shrink-0" />
          <span>منظومة مشاوير الشاملة</span>
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
          <span>ملفات GitHub و SQL</span>
        </button>
        <button
          type="button"
          onClick={handleLockOut}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/10 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>قفل الجلسة</span>
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
            GitHub + SQL
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
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-[1480px]">
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
            <span>تحميل index.html الواحد + SQL</span>
          </button>
        </header>

        {activeView === 'dash' && (
          <ExecutiveDashboard onSelectApp={handleSelectAppFromDashboard} />
        )}

        {activeView === 'rack' && <InteractiveRackView />}

        {activeView === 'ecosystem' && <MeshawirEcosystemView />}

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

export default function App() {
  return (
    <AppErrorBoundary>
      <MainApp />
    </AppErrorBoundary>
  );
}
