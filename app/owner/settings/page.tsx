'use client'

import { useEffect, useState } from 'react'

type SettingsA = {
  freeSignupRemo: number
  siteName: string
  siteTagline: string
}

export default function OwnerSettingsAPage() {
  const [s, setS] = useState<SettingsA>({
    freeSignupRemo: 100,
    siteName: '',
    siteTagline: '',
  })
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/owner/settings', { cache: 'no-store' })
        const data = await res.json()
        if (data.ok && data.settings) setS(data.settings)
      } catch (e: any) {
        setMsg(e?.message || 'فشل التحميل')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMsg('')
    try {
      const res = await fetch('/api/owner/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(s),
      })
      const data = await res.json()
      if (!data.ok) throw new Error(data.error || 'فشل الحفظ')
      setS(data.settings)
      setMsg('تم الحفظ بنجاح')
    } catch (err: any) {
      setMsg(err?.message || 'خطأ')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400" dir="rtl">
        جاري التحميل...
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8 text-slate-100" dir="rtl">
      <h1 className="text-xl font-bold mb-1">إعدادات المنصة — المرحلة A</h1>
      <p className="text-sm text-slate-400 mb-6">
        النقاط المجانية للمسجّل الجديد + اسم المنصة
      </p>

      <form
        onSubmit={onSave}
        className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-5"
      >
        <label className="block text-sm">
          اسم المنصة
          <input
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5"
            value={s.siteName}
            onChange={(e) => setS({ ...s, siteName: e.target.value })}
          />
        </label>

        <label className="block text-sm">
          وصف مختصر
          <input
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5"
            value={s.siteTagline}
            onChange={(e) => setS({ ...s, siteTagline: e.target.value })}
          />
        </label>

        <label className="block text-sm">
          REMO المجاني عند تسجيل حساب جديد
          <input
            type="number"
            min={0}
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5"
            value={s.freeSignupRemo}
            onChange={(e) =>
              setS({ ...s, freeSignupRemo: Number(e.target.value) || 0 })
            }
          />
        </label>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-3 font-medium disabled:opacity-50"
        >
          {saving ? 'جاري الحفظ...' : 'حفظ'}
        </button>

        {msg && (
          <p className="text-center text-sm text-emerald-400">{msg}</p>
        )}
      </form>

      <a
        href="/owner"
        className="block text-center text-sm text-slate-500 mt-6"
      >
        ← رجوع
      </a>
    </div>
  )
}
