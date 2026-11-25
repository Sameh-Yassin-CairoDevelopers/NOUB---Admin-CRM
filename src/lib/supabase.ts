import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const STORAGE_URL_KEY = 'noub_crm_supabase_url';
const STORAGE_KEY_KEY = 'noub_crm_supabase_key';

const DEFAULT_SUPABASE_URL = 'https://salkyuytjvjxspxbawzg.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_Fu_5hF3uEMiq9QRryBgCvQ_-SASOjrX';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getSupabaseConfig(): SupabaseConfig {
  const storedUrl = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_URL_KEY) : null;
  const storedKey = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY_KEY) : null;

  const env = typeof import.meta !== 'undefined' ? (import.meta as any).env : undefined;
  const envUrl = env?.VITE_SUPABASE_URL as string | undefined;
  const envKey = env?.VITE_SUPABASE_ANON_KEY as string | undefined;

  return {
    url: (storedUrl || envUrl || DEFAULT_SUPABASE_URL).trim(),
    anonKey: (storedKey || envKey || DEFAULT_SUPABASE_ANON_KEY).trim(),
  };
}

export function saveSupabaseConfig(url: string, anonKey: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_URL_KEY, url.trim());
  window.localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
  cachedClient = null;
}

export function resetSupabaseConfig() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_URL_KEY);
  window.localStorage.removeItem(STORAGE_KEY_KEY);
  cachedClient = null;
}

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (cachedClient) return cachedClient;
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey) {
    throw new Error('بيانات الاتصال بقاعدة بيانات Supabase غير مكتملة.');
  }
  cachedClient = createClient(url, anonKey);
  return cachedClient;
}

export function daysLeft(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const target = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export const DEFAULT_ALERT_LEAD_DAYS = 7;
const ALERT_LEAD_DAYS_KEY = 'noub_crm_alert_lead_days_v1';

export function getAlertLeadDays(): number {
  if (typeof window === 'undefined') return DEFAULT_ALERT_LEAD_DAYS;
  try {
    const raw = window.localStorage.getItem(ALERT_LEAD_DAYS_KEY);
    const parsed = Number(raw);
    if (Number.isFinite(parsed) && parsed >= 1 && parsed <= 60) {
      return Math.round(parsed);
    }
  } catch {
    // fallback to default
  }
  return DEFAULT_ALERT_LEAD_DAYS;
}

export function saveAlertLeadDays(days: number): number {
  const safe = Number.isFinite(days)
    ? Math.max(1, Math.min(60, Math.round(days)))
    : DEFAULT_ALERT_LEAD_DAYS;
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(ALERT_LEAD_DAYS_KEY, String(safe));
  }
  return safe;
}

export interface DueStatusInfo {
  label: 'متأخر' | 'قريب' | 'سليم';
  tone: 'bad' | 'warn' | 'ok';
}

export function getDueStatus(
  days: number | null,
  leadDays: number = getAlertLeadDays()
): DueStatusInfo | null {
  if (days === null || days === undefined) return null;
  if (days < 0) return { label: 'متأخر', tone: 'bad' };
  if (days <= leadDays) return { label: 'قريب', tone: 'warn' };
  return { label: 'سليم', tone: 'ok' };
}

export function formatMoney(value: number | string | null | undefined): string {
  const num = Number(value || 0);
  return num.toLocaleString('ar-EG', { maximumFractionDigits: 2 });
}

export function exportRowsToCsv(
  filename: string,
  headers: string[],
  rows: Array<Array<string | number | boolean | null | undefined>>
) {
  const escapeCell = (val: string | number | boolean | null | undefined) => {
    const str = String(val ?? '');
    if (/[",\n\r]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const csvLines = [headers.map(escapeCell).join(','), ...rows.map((r) => r.map(escapeCell).join(','))];
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvLines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
