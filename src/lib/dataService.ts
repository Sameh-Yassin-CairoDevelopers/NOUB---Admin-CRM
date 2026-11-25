import { daysLeft, getSupabaseClient } from './supabase';
import type { AnyRecord, AppRecord, DeliverableRecord, DueRow, TableId } from '../types/crm';

export type AuthMode = 'supabase' | 'local';

const LOCAL_SESSION_KEY = 'noub_crm_local_session_email';
const LOCAL_DB_KEY = 'noub_crm_local_db_v1';

const INITIAL_APPS: AppRecord[] = [
  {
    id: 'app-4b',
    name: '4B (فوربي)',
    description: null,
    platforms: null,
    start_date: null,
    launch_date: null,
    status: 'لم يبدأ',
  },
  {
    id: 'app-daro',
    name: 'DARO (دارو)',
    description: null,
    platforms: null,
    start_date: null,
    launch_date: null,
    status: 'لم يبدأ',
  },
  {
    id: 'app-wikala',
    name: 'WIKALA (وكالة)',
    description: 'منصة سوق إلكتروني تخدم العملاء والتجار',
    platforms: 'أندرويد',
    start_date: null,
    launch_date: null,
    status: 'لم يبدأ',
  },
];

const DELIVERABLE_TEMPLATE: Array<[string, string]> = [
  ['التخطيط والمتطلبات', 'وثيقة متطلبات المنتج (PRD)'],
  ['التخطيط والمتطلبات', 'دراسة السوق المصري والمنافسين'],
  ['التخطيط والمتطلبات', 'خريطة رحلة المستخدم والميزات'],
  ['التصميم', 'تصميم تجربة المستخدم UX'],
  ['التصميم', 'نظام التصميم والهوية البصرية'],
  ['التصميم', 'تصميم واجهات المستخدم UI'],
  ['التصميم', 'النموذج التفاعلي Prototype'],
  ['التصميم', 'اعتماد التصميم النهائي'],
  ['التطوير', 'قاعدة البيانات والخلفية وواجهات API'],
  ['التطوير', 'تطبيق الأندرويد'],
  ['التطوير', 'تطبيق iOS / نسخة الويب'],
  ['التطوير', 'لوحة تحكم الإدارة'],
  ['التطوير', 'ربط الدفع الإلكتروني'],
  ['التطوير', 'الإشعارات والرسائل'],
  ['الاختبار والجودة', 'الاختبار الوظيفي'],
  ['الاختبار والجودة', 'اختبار الأداء والأمان'],
  ['الاختبار والجودة', 'اختبار قبول المستخدم UAT'],
  ['الاختبار والجودة', 'الفترة التجريبية Beta'],
  ['الإطلاق والتشغيل', 'سياسة الخصوصية والشروط'],
  ['الإطلاق والتشغيل', 'النشر على Google Play / App Store'],
  ['الإطلاق والتشغيل', 'الإطلاق التسويقي'],
  ['الإطلاق والتشغيل', 'خطة الدعم بعد الإطلاق'],
];

function buildInitialLocalDb(): Record<TableId, AnyRecord[]> {
  const now = new Date().toISOString();
  const deliverables: DeliverableRecord[] = [];
  INITIAL_APPS.forEach((app) => {
    DELIVERABLE_TEMPLATE.forEach(([stage, item], idx) => {
      deliverables.push({
        id: `dl-${app.id}-${idx + 1}`,
        created_at: now,
        app_id: app.id,
        stage,
        item,
        owner: null,
        start_date: null,
        end_date: null,
        received_on: null,
        status: 'لم يبدأ',
        acceptance: 'لم يُختبر',
        notes: null,
      });
    });
  });

  return {
    telecom_lines: [
      { id: 'tel-1', created_at: now, name: 'خط أرضي 1', kind: 'أرضي', service: 'مكالمات + إنترنت', cycle: 'شهري' },
      { id: 'tel-2', created_at: now, name: 'خط أرضي 2', kind: 'أرضي', service: 'مكالمات + إنترنت', cycle: 'شهري' },
      { id: 'tel-3', created_at: now, name: 'محمول 1', kind: 'محمول', service: 'داتا', cycle: 'شهري' },
      { id: 'tel-4', created_at: now, name: 'محمول 2', kind: 'محمول', service: 'داتا', cycle: 'شهري' },
      { id: 'tel-5', created_at: now, name: 'محمول 3', kind: 'محمول', service: 'داتا', cycle: 'شهري' },
    ],
    domains: [
      { id: 'dom-1', created_at: now, name: 'mashawer.com.eg', kind: 'دومين', provider: 'المصرية للاتصالات', cycle: 'سنوي', auto_renew: false },
    ],
    wanted_domains: [],
    providers: [
      { id: 'prv-1', created_at: now, name: 'Google', category: 'سحابة / متاجر' },
      { id: 'prv-2', created_at: now, name: 'Apple', category: 'متاجر تطبيقات' },
      { id: 'prv-3', created_at: now, name: 'Cloudinary', category: 'وسائط' },
      { id: 'prv-4', created_at: now, name: 'Agora', category: 'فيديو / صوت' },
    ],
    api_keys: [],
    sites: [],
    payments: [],
    apps: INITIAL_APPS.map((a) => ({ ...a, created_at: now })),
    deliverables,
    team: [],
  };
}

function getLocalDb(): Record<TableId, AnyRecord[]> {
  if (typeof window === 'undefined') return buildInitialLocalDb();
  const raw = window.localStorage.getItem(LOCAL_DB_KEY);
  if (!raw) {
    const fresh = buildInitialLocalDb();
    window.localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(fresh));
    return fresh;
  }
  try {
    return JSON.parse(raw);
  } catch {
    const fresh = buildInitialLocalDb();
    window.localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(fresh));
    return fresh;
  }
}

function saveLocalDb(db: Record<TableId, AnyRecord[]>) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(db));
}

export function getLocalSessionEmail(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(LOCAL_SESSION_KEY);
}

export function setLocalSessionEmail(email: string | null) {
  if (typeof window === 'undefined') return;
  if (email) {
    window.localStorage.setItem(LOCAL_SESSION_KEY, email);
  } else {
    window.localStorage.removeItem(LOCAL_SESSION_KEY);
  }
}

export function isLocalMode(): boolean {
  return Boolean(getLocalSessionEmail());
}

export async function listTableRows(tableId: TableId): Promise<AnyRecord[]> {
  if (isLocalMode()) {
    const db = getLocalDb();
    return [...(db[tableId] || [])];
  }
  const sb = getSupabaseClient();
  const { data, error } = await sb.from(tableId).select('*').order('created_at');
  if (error) throw error;
  return (data as AnyRecord[]) || [];
}

export async function listAppsRef(): Promise<Array<{ id: string; name: string }>> {
  if (isLocalMode()) {
    const db = getLocalDb();
    return (db.apps || []).map((a) => ({ id: a.id, name: a.name }));
  }
  const sb = getSupabaseClient();
  const { data, error } = await sb.from('apps').select('id,name').order('name');
  if (error) throw error;
  return (data as Array<{ id: string; name: string }>) || [];
}

export async function listDueRows(): Promise<DueRow[]> {
  if (isLocalMode()) {
    const db = getLocalDb();
    const out: DueRow[] = [];
    const pushRows = (cat: string, rows: AnyRecord[]) => {
      rows.forEach((r) => {
        if (r.due_date) {
          out.push({
            cat,
            item: r.name,
            amount: r.amount ?? null,
            due_date: r.due_date,
            days_left: daysLeft(r.due_date) ?? 0,
          });
        }
      });
    };
    pushRows('الاتصالات', db.telecom_lines || []);
    pushRows('الدومينات والاستضافة', db.domains || []);
    pushRows('مزودو الخدمات', db.providers || []);
    return out.sort((a, b) => a.due_date.localeCompare(b.due_date));
  }
  const sb = getSupabaseClient();
  const { data, error } = await sb.from('v_due').select('*').order('due_date');
  if (error) throw error;
  return (data as DueRow[]) || [];
}

export async function insertTableRow(tableId: TableId, payload: Record<string, any>): Promise<void> {
  if (isLocalMode()) {
    const db = getLocalDb();
    const id = `${tableId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    db[tableId] = [...(db[tableId] || []), { id, created_at: new Date().toISOString(), ...payload }];
    saveLocalDb(db);
    return;
  }
  const sb = getSupabaseClient();
  const { error } = await sb.from(tableId).insert(payload);
  if (error) throw error;
}

export async function updateTableRow(
  tableId: TableId,
  id: string,
  payload: Record<string, any>
): Promise<void> {
  if (isLocalMode()) {
    const db = getLocalDb();
    db[tableId] = (db[tableId] || []).map((row) => (row.id === id ? { ...row, ...payload } : row));
    saveLocalDb(db);
    return;
  }
  const sb = getSupabaseClient();
  const { error } = await sb.from(tableId).update(payload).eq('id', id);
  if (error) throw error;
}

export async function deleteTableRow(tableId: TableId, id: string): Promise<void> {
  if (isLocalMode()) {
    const db = getLocalDb();
    db[tableId] = (db[tableId] || []).filter((row) => row.id !== id);
    if (tableId === 'apps') {
      db.deliverables = (db.deliverables || []).filter((d) => d.app_id !== id);
      db.team = (db.team || []).filter((t) => t.app_id !== id);
    }
    saveLocalDb(db);
    return;
  }
  const sb = getSupabaseClient();
  const { error } = await sb.from(tableId).delete().eq('id', id);
  if (error) throw error;
}
