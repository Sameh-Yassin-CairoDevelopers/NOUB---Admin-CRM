export type ThemeId = 'light' | 'dark' | 'ocean' | 'emerald' | 'sand';

export interface ThemeOption {
  id: ThemeId;
  label: string;
  shortLabel: string;
  swatchBg: string;
  swatchSidebar: string;
  swatchAccent: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'light',
    label: 'نهاري كلاسيكي',
    shortLabel: 'نهاري',
    swatchBg: '#F8FAFC',
    swatchSidebar: '#1E3A5F',
    swatchAccent: '#2563EB',
  },
  {
    id: 'dark',
    label: 'ليلي داكن',
    shortLabel: 'ليلي',
    swatchBg: '#0B1120',
    swatchSidebar: '#0F172A',
    swatchAccent: '#3B82F6',
  },
  {
    id: 'ocean',
    label: 'أزرق تنفيذي',
    shortLabel: 'أزرق',
    swatchBg: '#EFF6FF',
    swatchSidebar: '#0F294A',
    swatchAccent: '#0284C7',
  },
  {
    id: 'emerald',
    label: 'زمردي هادئ',
    shortLabel: 'زمردي',
    swatchBg: '#F0FDF9',
    swatchSidebar: '#0B3B32',
    swatchAccent: '#059669',
  },
  {
    id: 'sand',
    label: 'رملي دافئ',
    shortLabel: 'رملي',
    swatchBg: '#FAF8F5',
    swatchSidebar: '#292524',
    swatchAccent: '#B45309',
  },
];

const THEME_STORAGE_KEY = 'noub_crm_theme_v1';
const SIDEBAR_COLLAPSED_KEY = 'noub_crm_sidebar_collapsed_v1';

export function getSavedTheme(): ThemeId {
  if (typeof window === 'undefined') return 'light';
  const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (raw === 'light' || raw === 'dark' || raw === 'ocean' || raw === 'emerald' || raw === 'sand') {
    return raw;
  }
  return 'light';
}

export function applyTheme(theme: ThemeId): void {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = theme;
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export function saveTheme(theme: ThemeId): void {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }
  applyTheme(theme);
}

export function getSavedSidebarCollapsed(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1';
}

export function saveSidebarCollapsed(collapsed: boolean): void {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? '1' : '0');
  }
}
