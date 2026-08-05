'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { PlatformFullSettings, ServiceToggle } from '@/lib/platform-settings-full'

type Tab = 'info' | 'services' | 'pages' | 'scripts' | 'ads' | 'blog' | 'system'

export default function GeneralSettingsPage() {
  const [tab, setTab] = useState<Tab>('info')
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
        else setMsg(data.error || 'فشل')
      } catch (e: any) {
        setMsg(e?.message || 'خطأ')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  async function save() {
    if (!s) return
    setSaving(true)
    setMsg('')
    try {
      const res = await fetch('/api/owner/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(s),
      })
      const data = await res.json()
      if (!data.ok) throw new Error(data.error || 'فشل')
      setS(data.settings)
      setMsg('تم الحفظ ✓')
    } catch (e: any) {
      setMsg(e?.message || 'خطأ')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !s) {
    return (
      <div className="p-10 text-center text-slate-400" dir="rtl">
        {msg || 'جاري التحميل...'}
      </div>
    )
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'info', label: 'معلومات' },
    { id: 'services', label: 'خدمات' },
    { id: 'pages', label: 'صفحات' },
    { id: 'scripts', label: 'سكربتات' },
    { id: 'ads', label: 'AdSense' },
    { id: 'blog', label: 'مدونة' },
    { id: 'system', label: 'نظام' },
  ]

  return (
    <div className="mx-auto max-w-2xl px-3 py-6 pb-24 text-slate-100" dir="rtl">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <h1 className="text-lg font-bold">الإعدادات العامة</h1>
          <p className="text-xs text-slate-400">الاسم · الخدمات · الصفحات · الإعلانات</p>
        </div>
        <Link href="/owner/settings" className="text-xs text-slate-400">
          ← الأقسام
        </Link>
      </div>

      <div className="flex flex-wrap gap-1 mb-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium ${
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

      {tab === 'info' && (
        <Card>
          <F label="اسم المنصة" v={s.siteName} set={(v) => setS({ ...s, siteName: v })} />
          <F label="وصف مختصر" v={s.siteTagline} set={(v) => setS({ ...s, siteTagline: v })} />
          <F label="وصف أطول" v={s.siteDescription} set={(v) => setS({ ...s, siteDescription: v })} area />
          <F
            label="REMO للمسجّل الجديد"
            v={String(s.freeSignupRemo)}
            set={(v) => setS({ ...s, freeSignupRemo: Number(v) || 0 })}
            type="number"
          />
          <F label="بريد الدعم" v={s.supportEmail} set={(v) => setS({ ...s, supportEmail: v })} />
          <F label="واتساب" v={s.supportWhatsapp} set={(v) => setS({ ...s, supportWhatsapp: v })} />
          <Save saving={saving} onClick={save} />
        </Card>
      )}

      {tab === 'services' && (
        <div className="space-y-2">
          {[...s.services].sort((a, b) => a.order - b.order).map((svc) => (
            <div key={svc.id} className="flex flex-wrap gap-2 items-center rounded-xl border border-slate-800 bg-slate-900 p-3">
              <input
                type="checkbox"
                checked={svc.enabled}
                onChange={(e) =>
                  setS({
                    ...s,
                    services: s.services.map((x) =>
                      x.id === svc.id ? { ...x, enabled: e.target.checked } : x
                    ),
                  })
                }
              />
              <input
                className="flex-1 rounded-lg bg-slate-950 border border-slate-700 px-2 py-1 text-sm"
                value={svc.name}
                onChange={(e) =>
                  setS({
                    ...s,
                    services: s.services.map((x) =>
                      x.id === svc.id ? { ...x, name: e.target.value } : x
                    ),
                  })
                }
              />
              <input
                type="number"
                className="w-14 rounded-lg bg-slate-950 border border-slate-700 px-1 text-xs"
                value={svc.order}
                onChange={(e) =>
                  setS({
                    ...s,
                    services: s.services.map((x) =>
                      x.id === svc.id ? { ...x, order: Number(e.target.value) || 0 } : x
                    ),
                  })
                }
              />
            </div>
          ))}
          <div className="rounded-xl border border-slate-700 p-3 space-y-2">
            <input className="w-full rounded-lg bg-slate-950 border border-slate-700 px-2 py-1 text-sm" placeholder="id" value={newSvc.id} onChange={(e) => setNewSvc({ ...newSvc, id: e.target.value })} />
            <input className="w-full rounded-lg bg-slate-950 border border-slate-700 px-2 py-1 text-sm" placeholder="الاسم" value={newSvc.name} onChange={(e) => setNewSvc({ ...newSvc, name: e.target.value })} />
            <input className="w-full rounded-lg bg-slate-950 border border-slate-700 px-2 py-1 text-sm" placeholder="/dashboard/..." value={newSvc.href} onChange={(e) => setNewSvc({ ...newSvc, href: e.target.value })} />
            <button
              type="button"
              className="w-full rounded-lg bg-emerald-700 py-2 text-sm"
              onClick={() => {
                if (!newSvc.id || !newSvc.name) return
                const row: ServiceToggle = {
                  id: newSvc.id.trim(),
                  name: newSvc.name.trim(),
                  href: newSvc.href.trim() || `/dashboard/${newSvc.id.trim()}`,
                  enabled: true,
                  order: s.services.length + 1,
                }
                setS({ ...s, services: [...s.services, row] })
                setNewSvc({ id: '', name: '', href: '' })
              }}
            >
              + إضافة خدمة
            </button>
          </div>
          <Save saving={saving} onClick={save} />
        </div>
      )}

      {tab === 'pages' && (
        <Card>
          <F label="من نحن — العنوان" v={s.aboutTitle} set={(v) => setS({ ...s, aboutTitle: v })} />
          <F label="من نحن — النص" v={s.aboutBody} set={(v) => setS({ ...s, aboutBody: v })} area />
          <F label="اتصل بنا — العنوان" v={s.contactTitle} set={(v) => setS({ ...s, contactTitle: v })} />
          <F label="اتصل بنا — النص" v={s.contactBody} set={(v) => setS({ ...s, contactBody: v })} area />
          <F label="الخصوصية — العنوان" v={s.privacyTitle} set={(v) => setS({ ...s, privacyTitle: v })} />
          <F label="الخصوصية — النص" v={s.privacyBody} set={(v) => setS({ ...s, privacyBody: v })} area />
          <F label="الشروط — العنوان" v={s.termsTitle} set={(v) => setS({ ...s, termsTitle: v })} />
          <F label="الشروط — النص" v={s.termsBody} set={(v) => setS({ ...s, termsBody: v })} area />
          <Save saving={saving} onClick={save} />
        </Card>
      )}

      {tab === 'scripts' && (
        <Card>
          <F label="كود head" v={s.customHeadHtml} set={(v) => setS({ ...s, customHeadHtml: v })} area />
          <F label="كود body" v={s.customBodyHtml} set={(v) => setS({ ...s, customBodyHtml: v })} area />
          <Save saving={saving} onClick={save} />
        </Card>
      )}

      {tab === 'ads' && (
        <Card>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={s.adsenseEnabled} onChange={(e) => setS({ ...s, adsenseEnabled: e.target.checked })} />
            تفعيل AdSense
          </label>
          <F label="ca-pub-..." v={s.adsenseClient} set={(v) => setS({ ...s, adsenseClient: v })} />
          <F label="Slot 1" v={s.adsenseSlotHome} set={(v) => setS({ ...s, adsenseSlotHome: v })} />
          <F label="Slot 2" v={s.adsenseSlotHome2} set={(v) => setS({ ...s, adsenseSlotHome2: v })} />
          <Save saving={saving} onClick={save} />
        </Card>
      )}

      {tab === 'blog' && (
        <Card>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={s.blogEnabled} onChange={(e) => setS({ ...s, blogEnabled: e.target.checked })} />
            تفعيل المدونة
          </label>
          <F label="العنوان" v={s.blogTitle} set={(v) => setS({ ...s, blogTitle: v })} />
          <F label="المقدمة" v={s.blogIntro} set={(v) => setS({ ...s, blogIntro: v })} area />
          <Save saving={saving} onClick={save} />
        </Card>
      )}

      {tab === 'system' && (
        <Card>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={s.maintenanceMode} onChange={(e) => setS({ ...s, maintenanceMode: e.target.checked })} />
            وضع الصيانة
          </label>
          <F label="رسالة الصيانة" v={s.maintenanceMessage} set={(v) => setS({ ...s, maintenanceMessage: v })} area />
          <Save saving={saving} onClick={save} />
        </Card>
      )}
    </div>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">{children}</div>
}
function F({
  label,
  v,
  set,
  area,
  type = 'text',
}: {
  label: string
  v: string
  set: (x: string) => void
  area?: boolean
  type?: string
}) {
  return (
    <label className="block text-sm">
      {label}
      {area ? (
        <textarea className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 min-h-[72px] text-sm" value={v} onChange={(e) => set(e.target.value)} />
      ) : (
        <input type={type} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm" value={v} onChange={(e) => set(e.target.value)} />
      )}
    </label>
  )
}
function Save({ saving, onClick }: { saving: boolean; onClick: () => void }) {
  return (
    <button type="button" disabled={saving} onClick={onClick} className="w-full rounded-xl bg-blue-600 py-3 font-medium disabled:opacity-50">
      {saving ? '...' : 'حفظ'}
    </button>
  )
}
