'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { PlatformFullSettings, NavButton } from '@/lib/platform-settings-full'

type Tab = 'brand' | 'buttons'

export default function AppearanceSettingsPage() {
  const [tab, setTab] = useState<Tab>('brand')
  const [s, setS] = useState<PlatformFullSettings | null>(null)
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newNav, setNewNav] = useState({ id: '', label: '', href: '' })

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

  return (
    <div className="mx-auto max-w-2xl px-3 py-6 pb-24 text-slate-100" dir="rtl">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <h1 className="text-lg font-bold">المظهر والواجهة</h1>
          <p className="text-xs text-slate-400">لوجو · خلفية · أزرار الصفحة الرئيسية</p>
        </div>
        <Link href="/owner/settings" className="text-xs text-slate-400">
          ← الأقسام
        </Link>
      </div>

      <div className="flex gap-1 mb-4">
        <button
          type="button"
          onClick={() => setTab('brand')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
            tab === 'brand' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
          }`}
        >
          الهوية والخلفيات
        </button>
        <button
          type="button"
          onClick={() => setTab('buttons')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
            tab === 'buttons' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
          }`}
        >
          أزرار الرئيسية
        </button>
      </div>

      {msg && (
        <div className="mb-3 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-emerald-400">
          {msg}
        </div>
      )}

      {tab === 'brand' && (
        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs text-slate-400">ضع رابط صورة (CDN / Imgur / Supabase Storage)</p>
          <label className="block text-sm">
            رابط اللوجو
            <input
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              value={s.logoUrl}
              onChange={(e) => setS({ ...s, logoUrl: e.target.value })}
            />
          </label>
          {s.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s.logoUrl} alt="logo" className="h-14 object-contain rounded-lg bg-black/40 p-2" />
          ) : null}
          <label className="block text-sm">
            Favicon
            <input
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              value={s.faviconUrl}
              onChange={(e) => setS({ ...s, faviconUrl: e.target.value })}
            />
          </label>
          <label className="block text-sm">
            خلفية الصفحة الرئيسية
            <input
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              value={s.homeBackgroundUrl}
              onChange={(e) => setS({ ...s, homeBackgroundUrl: e.target.value })}
            />
          </label>
          <label className="block text-sm">
            خلفية لوحة المستخدم
            <input
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              value={s.dashboardBackgroundUrl}
              onChange={(e) => setS({ ...s, dashboardBackgroundUrl: e.target.value })}
            />
          </label>
          <label className="block text-sm">
            اللون الأساسي (hex)
            <input
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              value={s.primaryColor}
              onChange={(e) => setS({ ...s, primaryColor: e.target.value })}
            />
          </label>
          <button
            type="button"
            disabled={saving}
            onClick={save}
            className="w-full rounded-xl bg-blue-600 py-3 font-medium disabled:opacity-50"
          >
            {saving ? '...' : 'حفظ المظهر'}
          </button>
        </div>
      )}

      {tab === 'buttons' && (
        <div className="space-y-2">
          <p className="text-xs text-slate-400 mb-2">تسمية · ترتيب · إظهار/إخفاء أزرار الصفحة الرئيسية</p>
          {[...(s.navButtons || [])].sort((a, b) => a.order - b.order).map((btn) => (
            <div key={btn.id} className="rounded-xl border border-slate-800 bg-slate-900 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={btn.enabled}
                  onChange={(e) =>
                    setS({
                      ...s,
                      navButtons: s.navButtons.map((x) =>
                        x.id === btn.id ? { ...x, enabled: e.target.checked } : x
                      ),
                    })
                  }
                />
                <input
                  className="flex-1 rounded-lg bg-slate-950 border border-slate-700 px-2 py-1 text-sm"
                  value={btn.label}
                  onChange={(e) =>
                    setS({
                      ...s,
                      navButtons: s.navButtons.map((x) =>
                        x.id === btn.id ? { ...x, label: e.target.value } : x
                      ),
                    })
                  }
                />
                <input
                  type="number"
                  className="w-14 rounded-lg bg-slate-950 border border-slate-700 px-1 text-xs"
                  value={btn.order}
                  onChange={(e) =>
                    setS({
                      ...s,
                      navButtons: s.navButtons.map((x) =>
                        x.id === btn.id ? { ...x, order: Number(e.target.value) || 0 } : x
                      ),
                    })
                  }
                />
              </div>
              <input
                dir="ltr"
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-2 py-1 text-xs"
                value={btn.href}
                onChange={(e) =>
                  setS({
                    ...s,
                    navButtons: s.navButtons.map((x) =>
                      x.id === btn.id ? { ...x, href: e.target.value } : x
                    ),
                  })
                }
              />
              <button
                type="button"
                className="text-xs text-rose-400"
                onClick={() =>
                  setS({ ...s, navButtons: s.navButtons.filter((x) => x.id !== btn.id) })
                }
              >
                حذف
              </button>
            </div>
          ))}
          <div className="rounded-xl border border-slate-700 p-3 space-y-2">
            <input className="w-full rounded-lg bg-slate-950 border border-slate-700 px-2 py-1 text-sm" placeholder="id" value={newNav.id} onChange={(e) => setNewNav({ ...newNav, id: e.target.value })} />
            <input className="w-full rounded-lg bg-slate-950 border border-slate-700 px-2 py-1 text-sm" placeholder="الاسم" value={newNav.label} onChange={(e) => setNewNav({ ...newNav, label: e.target.value })} />
            <input className="w-full rounded-lg bg-slate-950 border border-slate-700 px-2 py-1 text-sm" placeholder="/path" value={newNav.href} onChange={(e) => setNewNav({ ...newNav, href: e.target.value })} />
            <button
              type="button"
              className="w-full rounded-lg bg-emerald-700 py-2 text-sm"
              onClick={() => {
                if (!newNav.id || !newNav.label) return
                const row: NavButton = {
                  id: newNav.id.trim(),
                  label: newNav.label.trim(),
                  href: newNav.href.trim() || '#',
                  enabled: true,
                  order: (s.navButtons?.length || 0) + 1,
                }
                setS({ ...s, navButtons: [...(s.navButtons || []), row] })
                setNewNav({ id: '', label: '', href: '' })
              }}
            >
              + إضافة زر
            </button>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={save}
            className="w-full rounded-xl bg-blue-600 py-3 font-medium disabled:opacity-50"
          >
            {saving ? '...' : 'حفظ الأزرار'}
          </button>
        </div>
      )}
    </div>
  )
}
