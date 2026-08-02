'use client';
import { useEffect, useState } from 'react';
import OwnerPageShell from '@/components/owner/OwnerPageShell';
import { getSupabase, isSupabaseConfigured, supabaseConfigError } from '@/lib/supabase';
import Link from 'next/link';

const supabase = getSupabase();

type Settings = {
  siteNameAr: string;
  siteNameEn: string;
  taglineAr: string;
  taglineEn: string;
  logoEmoji: string;
  logoUrl: string;
  primaryColor: string;
  backgroundStyle: string;
  supportEmail: string;
  aboutAr: string;
  heroTitleAr: string;
  heroSubtitleAr: string;
  footerTextAr: string;
  showProvidersOnHome: boolean;
  maintenanceMessage: string;
};

const empty: Settings = {
  siteNameAr: '',
  siteNameEn: '',
  taglineAr: '',
  taglineEn: '',
  logoEmoji: '🚀',
  logoUrl: '',
  primaryColor: '#2563eb',
  backgroundStyle: 'dark',
  supportEmail: '',
  aboutAr: '',
  heroTitleAr: '',
  heroSubtitleAr: '',
  footerTextAr: '',
  showProvidersOnHome: true,
  maintenanceMessage: '',
};

export default function OwnerSettingsPage() {
  const [email, setEmail] = useState('');
  const [form, setForm] = useState<Settings>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setEmail(session?.user?.email || '');
      try {
        const res = await fetch('/api/owner/settings');
        const data = await res.json();
        if (data.settings) setForm({ ...empty, ...data.settings });
      } catch {
        setMsg('تعذر تحميل الإعدادات');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const set = (key: keyof Settings, value: string | boolean) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const save = async () => {
    setSaving(true);
    setMsg('');
    try {
      const res = await fetch('/api/owner/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل الحفظ');
      setMsg('تم حفظ إعدادات المنصة بنجاح ✓');
      if (data.settings) setForm({ ...empty, ...data.settings });
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <OwnerPageShell title="إعدادات المنصة">
        <p className="text-slate-500 text-sm">جاري التحميل...</p>
      </OwnerPageShell>
    );
  }

  return (
    <OwnerPageShell
      title="إعدادات المنصة ⚙️"
      description="تغيير الاسم، الشعار، الخلفية، النصوص، ومعلومات التواصل"
    >
      <div className="space-y-8 max-w-3xl">
        {/* روابط سريعة */}
        <div className="flex flex-wrap gap-2 text-xs">
          <Link href="/owner/providers" className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700">
            إدارة المزودين ←
          </Link>
          <Link href="/owner/maintenance" className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700">
            وضع الصيانة ←
          </Link>
          <Link href="/owner/wallets" className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700">
            المحافظ ←
          </Link>
        </div>

        {/* الهوية */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
          <h2 className="font-bold text-white text-sm">هوية المنصة</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">الاسم بالعربية</label>
              <input
                value={form.siteNameAr}
                onChange={(e) => set('siteNameAr', e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">الاسم بالإنجليزية</label>
              <input
                value={form.siteNameEn}
                onChange={(e) => set('siteNameEn', e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm"
                dir="ltr"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">الشعار (إيموجي)</label>
              <input
                value={form.logoEmoji}
                onChange={(e) => set('logoEmoji', e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">رابط صورة الشعار (اختياري)</label>
              <input
                value={form.logoUrl}
                onChange={(e) => set('logoUrl', e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm"
                dir="ltr"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[11px] text-slate-500 block mb-1">الوصف المختصر (عربي)</label>
              <input
                value={form.taglineAr}
                onChange={(e) => set('taglineAr', e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[11px] text-slate-500 block mb-1">Tagline (English)</label>
              <input
                value={form.taglineEn}
                onChange={(e) => set('taglineEn', e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm"
                dir="ltr"
              />
            </div>
          </div>
        </section>

        {/* المظهر */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
          <h2 className="font-bold text-white text-sm">المظهر والخلفية</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">اللون الأساسي</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={form.primaryColor}
                  onChange={(e) => set('primaryColor', e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer bg-transparent border-0"
                />
                <input
                  value={form.primaryColor}
                  onChange={(e) => set('primaryColor', e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm"
                  dir="ltr"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">نمط الخلفية</label>
              <select
                value={form.backgroundStyle}
                onChange={(e) => set('backgroundStyle', e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm"
              >
                <option value="dark">داكن احترافي</option>
                <option value="gradient">تدرج أزرق/أخضر</option>
                <option value="blue">أزرق عميق</option>
              </select>
            </div>
          </div>
          <div
            className="h-16 rounded-xl border border-slate-700 flex items-center justify-center text-sm"
            style={{
              background:
                form.backgroundStyle === 'gradient'
                  ? `linear-gradient(135deg, ${form.primaryColor}44, #0f172a)`
                  : form.backgroundStyle === 'blue'
                  ? '#0c1929'
                  : '#020617',
            }}
          >
            <span className="text-2xl ml-2">{form.logoEmoji}</span>
            <span className="font-bold" style={{ color: form.primaryColor }}>
              {form.siteNameAr || 'معاينة'}
            </span>
          </div>
        </section>

        {/* نصوص الصفحة الرئيسية */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
          <h2 className="font-bold text-white text-sm">نصوص الصفحة الرئيسية</h2>
          <div>
            <label className="text-[11px] text-slate-500 block mb-1">عنوان البطل (Hero)</label>
            <input
              value={form.heroTitleAr}
              onChange={(e) => set('heroTitleAr', e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-500 block mb-1">وصف البطل</label>
            <textarea
              value={form.heroSubtitleAr}
              onChange={(e) => set('heroSubtitleAr', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm resize-y"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-500 block mb-1">من نحن / نبذة</label>
            <textarea
              value={form.aboutAr}
              onChange={(e) => set('aboutAr', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm resize-y"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-500 block mb-1">نص التذييل</label>
            <input
              value={form.footerTextAr}
              onChange={(e) => set('footerTextAr', e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm"
            />
          </div>
        </section>

        {/* تواصل وخيارات */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
          <h2 className="font-bold text-white text-sm">التواصل والخيارات</h2>
          <div>
            <label className="text-[11px] text-slate-500 block mb-1">بريد الدعم</label>
            <input
              value={form.supportEmail}
              onChange={(e) => set('supportEmail', e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm"
              dir="ltr"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-500 block mb-1">رسالة وضع الصيانة</label>
            <input
              value={form.maintenanceMessage}
              onChange={(e) => set('maintenanceMessage', e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm"
            />
          </div>
          <label className="flex items-center gap-3 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={form.showProvidersOnHome}
              onChange={(e) => set('showProvidersOnHome', e.target.checked)}
              className="w-4 h-4 accent-blue-600"
            />
            إظهار شارة المزودين في الصفحة الرئيسية
          </label>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl text-sm font-bold"
          >
            {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </button>
          {msg && (
            <span className={`text-sm ${msg.includes('✓') ? 'text-emerald-400' : 'text-red-400'}`}>
              {msg}
            </span>
          )}
        </div>
      </div>
    </OwnerPageShell>
  );
}
