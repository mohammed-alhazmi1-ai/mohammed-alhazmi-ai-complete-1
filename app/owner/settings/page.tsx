'use client'

import { useEffect, useState } from 'react'
import type { PlatformFullSettings, ServiceToggle } from '@/lib/platform-settings-full'

type Tab = 'general' | 'services' | 'scripts' | 'blog' | 'system'

export default function OwnerSettingsFullPage() {
  const [tab, setTab] = useState<Tab>('general')
  const [s, setS] = useState<PlatformFullSettings | null>(null)
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newSvc, setNewSvc] = useState({ id: '', name: '', href: '' })

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/owner/settings', { cache: 'no-store' })
        const data = await res.json()
        if (data.ok) setS(data.settings)
        else setMsg(data.error || 'فشل التحميل')
      } catch (e: any) {
        setMsg(e?.message || 'خطأ')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  async function save(patch?: Partial<PlatformFullSettings>) {
    if (!s) return
    setSaving(true)
    setMsg('')
    try {
      const body = patch ? { ...s, ...patch } : s
      const res = await fetch('/api/owner/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!data.ok) throw new Error(data.error || 'فشل الحفظ')
      setS(data.settings)
      setMsg('تم الحفظ بنجاح')
    } catch (e: any) {
      setMsg(e?.message || 'خطأ')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !s) {
    return (
      <div className="p-8 text-center text-slate-400" dir="rtl">
        جاري التحميل...
      </div>
    )
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'general', label: 'عام' },
    { id: 'services', label: 'الخدمات' },
    { id: 'scripts', label: 'سكربتات / إعلانات' },
    { id: 'blog', label: 'المدونة' },
    { id: 'system', label: 'النظام' },
  ]

  return (
    <div className="mx-auto max-w-2xl px-3 py-6 pb-24 text-slate-100" dir="rtl">
      <h1 className="text-xl font-bold mb-1">إعدادات المنصة</h1>
      <p className="text-sm text-slate-400 mb-4">
        التحكم الكامل: الاسم، الخدمات، السكربتات، المدونة، الصيانة
      </p>

      <div className="flex flex-wrap gap-1 mb-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
              tab === t.id ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {msg && (
        <div className="mb-3 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-emerald-400">
          {msg}
        </div>
      )}

      {tab === 'general' && (
        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <label className="block text-sm">
            اسم المنصة
            <input
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
              value={s.siteName}
              onChange={(e) => setS({ ...s, siteName: e.target.value })}
            />
          </label>
          <label className="block text-sm">
            النص التعريفي (قصير)
            <input
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
              value={s.siteTagline}
              onChange={(e) => setS({ ...s, siteTagline: e.target.value })}
            />
          </label>
          <label className="block text-sm">
            وصف أطول
            <textarea
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 min-h-[80px]"
              value={s.siteDescription}
              onChange={(e) => setS({ ...s, siteDescription: e.target.value })}
            />
          </label>
          <label className="block text-sm">
            REMO للمسجّل الجديد
            <input
              type="number"
              min={0}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
              value={s.freeSignupRemo}
              onChange={(e) =>
                setS({ ...s, freeSignupRemo: Number(e.target.value) || 0 })
              }
            />
          </label>
          <label className="block text-sm">
            بريد الدعم
            <input
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
              value={s.supportEmail}
              onChange={(e) => setS({ ...s, supportEmail: e.target.value })}
            />
          </label>
          <label className="block text-sm">
            واتساب الدعم
            <input
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
              value={s.supportWhatsapp}
              onChange={(e) => setS({ ...s, supportWhatsapp: e.target.value })}
            />
          </label>
          <button
            type="button"
            disabled={saving}
            onClick={() => save()}
            className="w-full rounded-xl bg-blue-600 py-3 font-medium disabled:opacity-50"
          >
            {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات العامة'}
          </button>
        </div>
      )}

      {tab === 'services' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            تفعيل/إيقاف الخدمات وترتيبها. تظهر في لوحة المستخدم حسب التفعيل.
          </p>
          <div className="space-y-2">
            {[...(s.services || [])]
              .sort((a, b) => a.order - b.order)
              .map((svc, idx) => (
                <div
                  key={svc.id}
                  className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 p-3"
                >
                  <input
                    type="checkbox"
                    checked={svc.enabled}
                    onChange={(e) => {
                      const services = s.services.map((x) =>
                        x.id === svc.id ? { ...x, enabled: e.target.checked } : x
                      )
                      setS({ ...s, services })
                    }}
                  />
                  <span className="font-medium flex-1">{svc.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{svc.href}</span>
                  <input
                    type="number"
                    className="w-16 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
                    value={svc.order}
                    onChange={(e) => {
                      const services = s.services.map((x) =>
                        x.id === svc.id
                          ? { ...x, order: Number(e.target.value) || 0 }
                          : x
                      )
                      setS({ ...s, services })
                    }}
                  />
                  <button
                    type="button"
                    className="text-xs text-rose-400"
                    onClick={() => {
                      if (!confirm('حذف ' + svc.name + '؟')) return
                      setS({
                        ...s,
                        services: s.services.filter((x) => x.id !== svc.id),
                      })
                    }}
                  >
                    حذف
                  </button>
                </div>
              ))}
          </div>

          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-3 space-y-2">
            <p className="text-sm font-medium">إضافة خدمة / رابط جديد</p>
            <input
              placeholder="المعرّف id (مثل blog)"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              value={newSvc.id}
              onChange={(e) => setNewSvc({ ...newSvc, id: e.target.value })}
            />
            <input
              placeholder="الاسم"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              value={newSvc.name}
              onChange={(e) => setNewSvc({ ...newSvc, name: e.target.value })}
            />
            <input
              placeholder="المسار /dashboard/..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              value={newSvc.href}
              onChange={(e) => setNewSvc({ ...newSvc, href: e.target.value })}
            />
            <button
              type="button"
              className="w-full rounded-xl bg-emerald-700 py-2 text-sm"
              onClick={() => {
                if (!newSvc.id.trim() || !newSvc.name.trim()) {
                  setMsg('أدخل المعرف والاسم')
                  return
                }
                const row: ServiceToggle = {
                  id: newSvc.id.trim(),
                  name: newSvc.name.trim(),
                  href: newSvc.href.trim() || `/dashboard/${newSvc.id.trim()}`,
                  enabled: true,
                  order: (s.services?.length || 0) + 1,
                }
                setS({ ...s, services: [...(s.services || []), row] })
                setNewSvc({ id: '', name: '', href: '' })
              }}
            >
              + إضافة للقائمة
            </button>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={() => save()}
            className="w-full rounded-xl bg-blue-600 py-3 font-medium"
          >
            حفظ الخدمات
          </button>
        </div>
      )}

      {tab === 'scripts' && (
        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-xs text-slate-400 leading-relaxed">
            الصق أكواد JavaScript أو أكواد الإعلانات (مثل Google AdSense / Analytics) كما في
            المنصات الأخرى. تُحقن في الموقع عبر مكوّن عام.
          </p>
          <label className="block text-sm">
            كود داخل {'<head>'} (AdSense / Meta / Pixel)
            <textarea
              dir="ltr"
              className="mt-1 w-full min-h-[120px] rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono"
              placeholder="<!-- مثال: سكربت AdSense -->"
              value={s.customHeadHtml}
              onChange={(e) => setS({ ...s, customHeadHtml: e.target.value })}
            />
          </label>
          <label className="block text-sm">
            كود قبل {'</body>'} (شات حي / سكربتات إضافية)
            <textarea
              dir="ltr"
              className="mt-1 w-full min-h-[120px] rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono"
              value={s.customBodyHtml}
              onChange={(e) => setS({ ...s, customBodyHtml: e.target.value })}
            />
          </label>
          <button
            type="button"
            disabled={saving}
            onClick={() => save()}
            className="w-full rounded-xl bg-blue-600 py-3 font-medium"
          >
            حفظ السكربتات
          </button>
        </div>
      )}

      {tab === 'blog' && (
        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={s.blogEnabled}
              onChange={(e) => setS({ ...s, blogEnabled: e.target.checked })}
            />
            تفعيل قسم المدونة / القوالب النصية
          </label>
          <label className="block text-sm">
            عنوان المدونة
            <input
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
              value={s.blogTitle}
              onChange={(e) => setS({ ...s, blogTitle: e.target.value })}
            />
          </label>
          <label className="block text-sm">
            مقدمة
            <textarea
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 min-h-[80px]"
              value={s.blogIntro}
              onChange={(e) => setS({ ...s, blogIntro: e.target.value })}
            />
          </label>
          <p className="text-xs text-slate-500">
            الصفحة العامة: <span className="text-blue-400">/blog</span> (بعد التفعيل)
          </p>
          <button
            type="button"
            disabled={saving}
            onClick={() => save()}
            className="w-full rounded-xl bg-blue-600 py-3 font-medium"
          >
            حفظ إعدادات المدونة
          </button>
        </div>
      )}

      {tab === 'system' && (
        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={s.maintenanceMode}
              onChange={(e) => setS({ ...s, maintenanceMode: e.target.checked })}
            />
            وضع الصيانة (إيقاف الواجهة العامة مؤقتاً)
          </label>
          <label className="block text-sm">
            رسالة الصيانة
            <textarea
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
              value={s.maintenanceMessage}
              onChange={(e) => setS({ ...s, maintenanceMessage: e.target.value })}
            />
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <a href="/owner/plans" className="rounded-xl border border-slate-700 p-3 text-center">
              إدارة الخطط
            </a>
            <a href="/owner/providers" className="rounded-xl border border-slate-700 p-3 text-center">
              مزودو AI
            </a>
            <a href="/owner/jobs" className="rounded-xl border border-slate-700 p-3 text-center">
              الطلبات الفاشلة
            </a>
            <a href="/owner/payments" className="rounded-xl border border-slate-700 p-3 text-center">
              المدفوعات
            </a>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={() => save()}
            className="w-full rounded-xl bg-blue-600 py-3 font-medium"
          >
            حفظ إعدادات النظام
          </button>
        </div>
      )}

      <a href="/owner" className="block text-center text-sm text-slate-500 mt-8">
        ← رجوع
      </a>
    </div>
  )
}
