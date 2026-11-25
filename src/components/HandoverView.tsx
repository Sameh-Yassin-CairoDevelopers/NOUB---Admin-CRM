import React, { useMemo, useState } from 'react';
import {
  CheckSquare,
  Globe,
  PhoneCall,
  Server,
  ShieldCheck,
  Search,
  ExternalLink,
  Mail,
} from 'lucide-react';
import {
  HANDOVER_CHECKLIST,
  HANDOVER_PHASES,
  PBX_EXTENSIONS,
  PORTAL_ACCOUNTS,
  RACK_ASSETS,
  WE_CLOUD_SERVERS,
  ZOHO_EMAILS,
} from '../data/handoverData';

const CHECKLIST_KEY = 'noub_crm_handover_checks_v1';

function loadChecked(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(CHECKLIST_KEY) || '{}');
  } catch {
    return {};
  }
}

type HandoverTab = 'methodology' | 'portals' | 'pbx' | 'infrastructure';

export const HandoverView: React.FC = () => {
  const [tab, setTab] = useState<HandoverTab>('methodology');
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>(loadChecked);
  const [portalQuery, setPortalQuery] = useState('');

  const toggleCheck = (id: string) => {
    const next = { ...checkedMap, [id]: !checkedMap[id] };
    setCheckedMap(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(CHECKLIST_KEY, JSON.stringify(next));
    }
  };

  const completedCount = useMemo(
    () => HANDOVER_CHECKLIST.filter((c) => checkedMap[c.id]).length,
    [checkedMap]
  );

  const portalFiltered = useMemo(() => {
    const q = portalQuery.trim().toLowerCase();
    if (!q) return PORTAL_ACCOUNTS;
    return PORTAL_ACCOUNTS.filter(
      (p) =>
        p.service.toLowerCase().includes(q) ||
        p.username.toLowerCase().includes(q) ||
        p.contact.toLowerCase().includes(q) ||
        p.handoverDetails.toLowerCase().includes(q)
    );
  }, [portalQuery]);

  return (
    <div className="space-y-6">
      {/* Sub-navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
          {[
            { id: 'methodology', label: 'منهجية التسليم وقائمة التحقق', icon: ShieldCheck },
            { id: 'portals', label: 'البوابات (14) والإيميلات (5)', icon: Globe },
            { id: 'pbx', label: 'السنترال الجراند ستريم والتحويلات', icon: PhoneCall },
            { id: 'infrastructure', label: 'راك المعادي 27U وسحابة WE', icon: Server },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id as HandoverTab)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-md whitespace-nowrap cursor-pointer transition-colors ${
                  tab === item.id
                    ? 'bg-[#1E3A5F] text-white'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Methodology & Day 1 Checklist */}
      {tab === 'methodology' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {HANDOVER_PHASES.map((p) => (
              <div key={p.phase} className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
                <p className="text-xs font-bold text-blue-700">{p.phase}</p>
                <h3 className="text-base font-bold text-slate-900">{p.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{p.detail}</p>
              </div>
            ))}
          </div>

          <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-[#1E3A5F]" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    قائمة التحقق السريعة لجلسة التسليم المباشرة (محضر اليوم الأول)
                  </h3>
                  <p className="text-xs text-slate-500">
                    انتقال الإدارة الكاملة لمقر المعادي إلى المهندس عماد الشرقاوي
                  </p>
                </div>
              </div>
              <span className="font-mono tabular-nums text-sm font-bold text-[#1E3A5F]">
                {completedCount}/{HANDOVER_CHECKLIST.length} مكتمل
              </span>
            </div>

            <div className="space-y-3">
              {HANDOVER_CHECKLIST.map((step) => {
                const isDone = Boolean(checkedMap[step.id]);
                return (
                  <label
                    key={step.id}
                    className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                      isDone
                        ? 'bg-emerald-50/60 border-emerald-200'
                        : 'bg-slate-50/40 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => toggleCheck(step.id)}
                      className="mt-1 w-4 h-4 accent-emerald-600 rounded shrink-0"
                    />
                    <div>
                      <p className={`text-sm font-bold ${isDone ? 'text-emerald-900 line-through' : 'text-slate-900'}`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">{step.detail}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* Tab 2: 14 Portals & 5 Zoho Emails */}
      {tab === 'portals' && (
        <div className="space-y-6">
          <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  المواقع والحسابات السحابية وبوابات الاتصالات (14 بوابة)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  تنقل كلمات المرور الفعلية عبر الخزنة المشفرة مع تفعيل 2FA على رقم م/ عماد الشرقاوي
                </p>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={portalQuery}
                  onChange={(e) => setPortalQuery(e.target.value)}
                  placeholder="بحث في البوابات أو جهات الاتصال..."
                  className="w-full pr-9 pl-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-700">
                    <th className="py-3 px-4 text-right font-bold">#</th>
                    <th className="py-3 px-4 text-right font-bold">الخدمة / الجهة</th>
                    <th className="py-3 px-4 text-right font-bold">رابط الدخول</th>
                    <th className="py-3 px-4 text-right font-bold">الحساب / المعرّف</th>
                    <th className="py-3 px-4 text-right font-bold">جهة التواصل</th>
                    <th className="py-3 px-4 text-right font-bold">ما يُسلم لـ م/ عماد</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {portalFiltered.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-4 font-mono tabular-nums text-slate-500">{p.id}</td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">{p.service}</td>
                      <td className="py-2.5 px-4 text-xs font-mono" dir="ltr">
                        {p.url.startsWith('http') ? (
                          <a
                            href={p.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-blue-700 hover:underline"
                          >
                            <span className="truncate max-w-[180px]">{p.url}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        ) : (
                          <span className="text-slate-600">{p.url}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-xs font-mono text-slate-700">{p.username}</td>
                      <td className="py-2.5 px-4 text-xs text-slate-700">{p.contact}</td>
                      <td className="py-2.5 px-4 text-xs text-slate-700">{p.handoverDetails}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-[#1E3A5F]" />
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  البريد المؤسسي الموحد (Zoho Lite — 5 حسابات فعالة مجانية)
                </h3>
                <p className="text-xs text-slate-500">
                  تم اعتماد 5 حسابات فقط وتوجيه أي عناوين قديمة على cPanel إليها
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-700">
                    <th className="py-3 px-4 text-right font-bold">#</th>
                    <th className="py-3 px-4 text-right font-bold">البريد الإلكتروني</th>
                    <th className="py-3 px-4 text-right font-bold">الدور الوظيفي</th>
                    <th className="py-3 px-4 text-right font-bold">السعة</th>
                    <th className="py-3 px-4 text-right font-bold">الحالة والتسليم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ZOHO_EMAILS.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-4 font-mono tabular-nums text-slate-500">{m.id}</td>
                      <td className="py-2.5 px-4 font-mono font-bold text-[#1E3A5F]" dir="ltr">
                        {m.email}
                      </td>
                      <td className="py-2.5 px-4 text-slate-800">{m.role}</td>
                      <td className="py-2.5 px-4 font-mono tabular-nums text-xs text-slate-600">
                        {m.quota}
                      </td>
                      <td className="py-2.5 px-4 text-xs font-medium text-slate-700">{m.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* Tab 3: Grandstream PBX */}
      {tab === 'pbx' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <p className="text-xs font-semibold text-slate-500">واجهة الإدارة (Web GUI)</p>
              <p className="mt-1.5 text-base font-bold font-mono text-[#1E3A5F]" dir="ltr">
                https://192.168.30.1:8089
              </p>
              <p className="mt-1 text-xs text-slate-600">
                راك U19 · منفذ Cisco Gi1/0/13 · VLAN 30 (VoIP)
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <p className="text-xs font-semibold text-slate-500">الخطوط الخارجية (FXO)</p>
              <p className="mt-1.5 text-sm font-bold text-slate-900">
                FXO-1: الخط الأرضي الرئيسي · FXO-2: العمليات
              </p>
              <p className="mt-1 text-xs text-slate-600">
                FXO-3 و FXO-4 جاهزة للتوسع + FXS-1 للاستقبال (100)
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <p className="text-xs font-semibold text-slate-500">اعتماد التسليم المفتوح</p>
              <p className="mt-1.5 text-sm font-bold text-amber-800">
                تذكرة MSH-IT-2026-084
              </p>
              <p className="mt-1 text-xs text-slate-600">
                ضبط IVR، طابور الـ 5 كول سنتر، تسجيل المكالمات، والـ Backup
              </p>
            </div>
          </div>

          <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                خريطة التحويلات الداخلية (Grandstream GRP2614 · 100 – 116)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-700">
                    <th className="py-3 px-4 text-right font-bold">التحويلة</th>
                    <th className="py-3 px-4 text-right font-bold">القسم / المسؤول</th>
                    <th className="py-3 px-4 text-right font-bold">الموقع</th>
                    <th className="py-3 px-4 text-right font-bold">ملاحظات التشغيل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {PBX_EXTENSIONS.map((item) => (
                    <tr key={item.ext} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-4 font-mono tabular-nums font-bold text-[#1E3A5F]">
                        {item.ext}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">{item.department}</td>
                      <td className="py-2.5 px-4 text-slate-700">{item.location}</td>
                      <td className="py-2.5 px-4 text-xs text-slate-600">{item.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* Tab 4: Maadi Rack 27U + WE Cloud */}
      {tab === 'infrastructure' && (
        <div className="space-y-6">
          <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                أصول وعناوين إدارة غرفة السيرفرات بالمعادي (راك بيرلا 27U)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-700">
                    <th className="py-3 px-4 text-right font-bold">الجهاز</th>
                    <th className="py-3 px-4 text-right font-bold">الموقع / المنفذ</th>
                    <th className="py-3 px-4 text-right font-bold">عنوان الدخول (IP / Port)</th>
                    <th className="py-3 px-4 text-right font-bold">بيانات الوصول المطلوب تسليمها</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {RACK_ASSETS.map((a) => (
                    <tr key={a.device} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-4 font-bold text-slate-900">{a.device}</td>
                      <td className="py-2.5 px-4 text-xs text-slate-600">{a.location}</td>
                      <td className="py-2.5 px-4 font-mono text-xs text-[#1E3A5F]" dir="ltr">
                        {a.ip}
                      </td>
                      <td className="py-2.5 px-4 text-xs text-slate-700">{a.credentialsScope}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                خوادم المصرية للاتصالات WE السحابية بالقرية الذكية والـ SSL VPN
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                التنسيق مع م/ أحمد محرم وم/ أحمد غريب · النسخ الاحتياطي 30 يوماً + السحب الليلي 3:00 صباحاً للمعادي
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {WE_CLOUD_SERVERS.map((srv) => (
                <div key={srv.name} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-1.5">
                  <p className="text-sm font-bold font-mono text-[#1E3A5F]" dir="ltr">
                    {srv.name}
                  </p>
                  <p className="text-xs font-mono text-slate-600" dir="ltr">
                    {srv.specs}
                  </p>
                  <p className="text-xs text-slate-700 leading-relaxed">{srv.role}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
