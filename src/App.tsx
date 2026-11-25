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
  FileSpreadsheet,
  PanelRightClose,
  PanelRightOpen,
  Palette,
  Check,
} from 'lucide-react';
import { TABLES } from './data/tables';
import {
  isPasscodeUnlocked,
  lockWorkspace,
} from './lib/dataService';
import {
  THEME_OPTIONS,
  applyTheme,
  getSavedSidebarCollapsed,
  getSavedTheme,
  saveSidebarCollapsed,
  saveTheme,
  type ThemeId,
} from './lib/theme';
import type { TableId, ViewId } from './types/crm';
import { LoginView } from './components/LoginView';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { AppWorkspaceView } from './components/AppWorkspaceView';
import { DataGridView } from './components/DataGridView';
import { DataExportModal } from './components/DataExportModal';
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
        <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[var(--app-surface)] border border-red-500/40 rounded-xl p-6 space-y-3 text-center">
            <h2 className="text-base font-bold text-red-600 dark:text-red-400">تعذر عرض الصفحة مؤقتاً</h2>
            <p className="text-xs text-[var(--app-muted)] font-mono">{this.state.message}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[var(--app-sidebar)] text-white text-xs font-semibold rounded-lg cursor-pointer"
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
  const [theme, setTheme] = useState<ThemeId>(() => getSavedTheme());
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => getSavedSidebarCollapsed());
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const handleThemeChange = (nextTheme: ThemeId) => {
    setTheme(nextTheme);
    saveTheme(nextTheme);
    setThemeMenuOpen(false);
  };

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      saveSidebarCollapsed(next);
      return next;
    });
  };

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
        subtitle: 'ربط مباشر بـ Supabase لمتابعة الاستحقاقات وجاهزية 4B وكابتن مشاوير (بينما Daro وWeKaLa مؤجلان لما بعد 4B)',
      };
    }
    if (activeView === 'rack') {
      return {
        title: 'الراك التفاعلي وغرفة سيرفرات المعادي (Perla 27U)',
        subtitle: 'سيسكو 3850 (48 بورت)، ER8411 (Static Public IP + دراسة WireGuard لـ Wave)، وسنترال 604A — بقيادة م/ عماد الشرقاوي وم/ سامح يس',
      };
    }
    if (activeView === 'ecosystem') {
      return {
        title: 'منظومة مشاوير الشاملة (9 مشاريع + 24 جدولاً + مصفوفة التحقق الـ 30)',
        subtitle: '4B وكابتن مشاوير، 4B Prepaid Trips B2B، حوكمة الأدوار، فحص GPS/Firebase/WireGuard، Daro وWeKaLa المؤجلان، ومصفوفة التحقق الـ 30',
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
          onOpenDataExport={() => setExportModalOpen(true)}
          theme={theme}
          onChangeTheme={handleThemeChange}
        />
        <DataExportModal
          open={exportModalOpen}
          onClose={() => setExportModalOpen(false)}
          onCacheSynced={() => setRefreshTick((n) => n + 1)}
        />
      </>
    );
  }

  const navGroups: Array<{ id: 'subscriptions' | 'apps' | 'finance'; label: string }> = [
    { id: 'subscriptions', label: 'الاشتراكات والوصول' },
    { id: 'apps', label: 'التطبيقات والفرق' },
    { id: 'finance', label: 'المالية' },
  ];

  const activeThemeOption = THEME_OPTIONS.find((t) => t.id === theme) || THEME_OPTIONS[0];

  const renderNavItem = (
    id: ViewId,
    label: string,
    icon: React.ReactNode,
    collapsed: boolean
  ) => {
    const isActive = activeView === id;
    return (
      <button
        key={id}
        type="button"
        onClick={() => navigate(id)}
        title={collapsed ? label : undefined}
        aria-label={label}
        className={`w-full flex items-center ${
          collapsed ? 'justify-center px-2 py-2.5' : 'gap-2.5 px-3 py-2'
        } text-sm rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
          isActive
            ? 'bg-[var(--app-sidebar-active)] text-white font-semibold'
            : 'text-slate-200 hover:bg-white/10'
        }`}
      >
        {icon}
        {!collapsed && <span className="truncate">{label}</span>}
      </button>
    );
  };

  const renderNavContent = (collapsed: boolean) => (
    <div className="flex flex-col h-full">
      <div
        className={`pb-4 mb-3 border-b border-white/15 flex items-center ${
          collapsed ? 'flex-col gap-2 px-1' : 'justify-between gap-2 px-2'
        }`}
      >
        {collapsed ? (
          <div
            className="w-9 h-9 rounded-lg bg-white/12 flex items-center justify-center font-bold text-sm text-white"
            title="NOUB CRM — مشاوير"
          >
            N
          </div>
        ) : (
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-white tracking-tight truncate">NOUB CRM</h2>
            <p className="text-[11px] text-emerald-300 mt-0.5 flex items-center gap-1.5">
              <Database className="w-3 h-3 shrink-0" />
              <span className="truncate">ربط مباشر مع Supabase</span>
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={toggleSidebarCollapse}
          title={collapsed ? 'توسيع القائمة الجانبية' : 'طي القائمة الجانبية'}
          aria-label={collapsed ? 'توسيع القائمة الجانبية' : 'طي القائمة الجانبية'}
          className="hidden lg:inline-flex p-1.5 rounded-lg text-slate-200 hover:text-white hover:bg-white/12 transition-colors cursor-pointer shrink-0"
        >
          {collapsed ? <PanelRightOpen className="w-4 h-4" /> : <PanelRightClose className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto sidebar-scroll px-1">
        {renderNavItem('dash', 'الملخص والرسوم', <LayoutDashboard className="w-4 h-4 shrink-0" />, collapsed)}
        {renderNavItem('rack', 'الراك التفاعلي 27U', <Server className="w-4 h-4 shrink-0" />, collapsed)}
        {renderNavItem('ecosystem', 'منظومة مشاوير الشاملة', <Network className="w-4 h-4 shrink-0" />, collapsed)}
        {renderNavItem('app-workspace', 'التطبيقات والهيكل', <Layers className="w-4 h-4 shrink-0" />, collapsed)}

        <div className="pt-3">
          {collapsed ? (
            <div className="my-2 border-t border-white/10" />
          ) : (
            <p className="px-3 pb-1 text-[11px] font-semibold text-slate-400">
              إدارة مقر المعادي والتسليم
            </p>
          )}
          <div className="space-y-0.5">
            {renderNavItem('joint-tasks', 'المهام المشتركة (105)', <ClipboardCheck className="w-4 h-4 shrink-0" />, collapsed)}
            {renderNavItem('handover', 'تسليم م/ عماد (المقر)', <ShieldCheck className="w-4 h-4 shrink-0" />, collapsed)}
            {renderNavItem('master-registry', 'السجل الشامل (450)', <Archive className="w-4 h-4 shrink-0" />, collapsed)}
          </div>
        </div>

        {navGroups.map((group) => (
          <div key={group.id} className="pt-3">
            {collapsed ? (
              <div className="my-2 border-t border-white/10" />
            ) : (
              <p className="px-3 pb-1 text-[11px] font-semibold text-slate-400">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {TABLES.filter((t) => t.group === group.id).map((t) =>
                renderNavItem(t.id, t.name, TABLE_ICONS[t.id], collapsed)
              )}
            </div>
          </div>
        ))}
      </nav>

      <div className="pt-3 mt-3 border-t border-white/15 space-y-2 px-1">
        {/* Compact theme swatch bar in sidebar */}
        {!collapsed && (
          <div className="flex items-center justify-between gap-1 px-2 py-1.5 rounded-lg bg-white/8">
            <span className="text-[11px] text-slate-200 font-medium">المظهر</span>
            <div className="flex items-center gap-1.5">
              {THEME_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  title={opt.label}
                  aria-label={opt.label}
                  onClick={() => handleThemeChange(opt.id)}
                  className={`w-4 h-4 rounded-full border transition-transform cursor-pointer ${
                    theme === opt.id
                      ? 'border-white scale-115 ring-2 ring-white/50'
                      : 'border-white/40 opacity-80 hover:opacity-100'
                  }`}
                  style={{ background: `linear-gradient(135deg, ${opt.swatchBg} 50%, ${opt.swatchAccent} 50%)` }}
                />
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setExportModalOpen(true)}
          title={collapsed ? 'تصدير SQL و Excel المحدث' : undefined}
          className={`w-full flex items-center justify-center gap-2 ${
            collapsed ? 'px-2 py-2.5' : 'px-3 py-2'
          } text-xs font-semibold bg-white/12 hover:bg-white/20 text-white rounded-lg transition-colors whitespace-nowrap cursor-pointer`}
        >
          <FileSpreadsheet className="w-4 h-4 shrink-0" />
          {!collapsed && <span>تصدير SQL و Excel</span>}
        </button>

        <button
          type="button"
          onClick={handleLockOut}
          title={collapsed ? 'قفل الجلسة' : undefined}
          className={`w-full flex items-center justify-center gap-2 ${
            collapsed ? 'px-2 py-2.5' : 'px-3 py-2'
          } text-xs font-medium text-slate-200 hover:bg-white/10 rounded-lg transition-colors whitespace-nowrap cursor-pointer`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>قفل الجلسة</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden bg-[var(--app-sidebar)] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <span className="font-bold text-base">NOUB CRM</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const idx = THEME_OPTIONS.findIndex((t) => t.id === theme);
              const next = THEME_OPTIONS[(idx + 1) % THEME_OPTIONS.length];
              handleThemeChange(next.id);
            }}
            aria-label="تبديل المظهر"
            className="px-2 py-1.5 text-xs font-medium bg-white/12 rounded-md cursor-pointer inline-flex items-center gap-1"
          >
            <Palette className="w-3.5 h-3.5" />
            <span>{activeThemeOption.shortLabel}</span>
          </button>
          <button
            type="button"
            onClick={() => setExportModalOpen(true)}
            className="px-2.5 py-1.5 text-xs font-semibold bg-white/15 rounded-md whitespace-nowrap cursor-pointer"
          >
            SQL + Excel
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
          <div className="w-64 bg-[var(--app-sidebar)] text-white p-4 h-full overflow-y-auto sidebar-scroll">
            {renderNavContent(false)}
          </div>
          <div
            className="flex-1 bg-slate-950/45"
            onClick={() => setMobileNavOpen(false)}
          />
        </div>
      )}

      {/* Desktop Collapsible Sidebar */}
      <aside
        className={`hidden lg:block bg-[var(--app-sidebar)] text-white sticky top-0 h-screen shrink-0 transition-[width] duration-200 ease-out ${
          sidebarCollapsed ? 'w-[74px] p-2.5' : 'w-64 p-4'
        }`}
      >
        {renderNavContent(sidebarCollapsed)}
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-[1520px]">
        <header className="pb-5 mb-6 border-b border-[var(--app-border)] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <button
              type="button"
              onClick={toggleSidebarCollapse}
              title={sidebarCollapsed ? 'توسيع القائمة الجانبية' : 'طي القائمة الجانبية'}
              aria-label={sidebarCollapsed ? 'توسيع القائمة الجانبية' : 'طي القائمة الجانبية'}
              className="hidden lg:inline-flex mt-1 p-2 rounded-lg bg-[var(--app-surface)] border border-[var(--app-border)] text-[var(--app-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-2)] transition-colors cursor-pointer shrink-0"
            >
              {sidebarCollapsed ? (
                <PanelRightOpen className="w-4 h-4" />
              ) : (
                <PanelRightClose className="w-4 h-4" />
              )}
            </button>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--app-text)]">{headerInfo.title}</h1>
              <p className="text-xs sm:text-sm text-[var(--app-muted)] mt-1">{headerInfo.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Theme Switcher Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setThemeMenuOpen((v) => !v)}
                className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold bg-[var(--app-surface)] border border-[var(--app-border-strong)] hover:bg-[var(--app-surface-2)] text-[var(--app-text)] rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Palette className="w-4 h-4 text-[var(--app-accent)]" />
                <span>المظهر: {activeThemeOption.label}</span>
              </button>

              {themeMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setThemeMenuOpen(false)}
                  />
                  <div className="absolute left-0 mt-2 w-52 bg-[var(--app-surface)] border border-[var(--app-border-strong)] rounded-xl p-1.5 shadow-lg z-40">
                    {THEME_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleThemeChange(opt.id)}
                        className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                          theme === opt.id
                            ? 'bg-[var(--app-surface-2)] text-[var(--app-accent)] font-semibold'
                            : 'text-[var(--app-text)] hover:bg-[var(--app-surface-2)]'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className="w-4 h-4 rounded-full border border-slate-400/50 shrink-0"
                            style={{
                              background: `linear-gradient(135deg, ${opt.swatchSidebar} 50%, ${opt.swatchBg} 50%)`,
                            }}
                          />
                          <span>{opt.label}</span>
                        </span>
                        {theme === opt.id && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setExportModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-[var(--app-surface)] border border-[var(--app-border-strong)] hover:bg-[var(--app-surface-2)] text-[var(--app-text)] rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-[var(--app-accent)]" />
              <span>تصدير SQL و Excel المحدث</span>
            </button>
          </div>
        </header>

        <div key={refreshTick}>
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
        </div>
      </main>

      <DataExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onCacheSynced={() => setRefreshTick((n) => n + 1)}
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
