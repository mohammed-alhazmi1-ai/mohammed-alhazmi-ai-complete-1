'use client'

import { useEffect, useState } from 'react'

type Ads = {
  adsenseEnabled: boolean
  adsenseClient: string
  adsenseSlotHome: string
  adsenseSlotHome2: string
}

export default function OwnerAdSensePage() {
  const [s, setS] = useState<Ads>({
    adsenseEnabled: false,
    adsenseClient: '',
    adsenseSlotHome: '',
    adsenseSlotHome2: '',
  })
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/owner/adsense', { cache: 'no-store' })
        const data = await res.json()
        if (data.settings) setS(data.settings)
      } catch (e: any) {
        setMsg(e?.message || 'خطأ')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setMsg('')
    try {
      const res = await fetch('/api/owner/adsense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(s),
      })
      const data = await res.json()
      if (!data.ok) throw new Error(data.error || 'فشل')
      setS(data.settings)
      setMsg('تم حفظ إعدادات AdSense')
    } catch (err: any) {
      setMsg(err.message)
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
      <h1 className="text-xl font-bold mb-1">إعلانات Google AdSense</h1>
      <p className="text-sm text-slate-400 mb-6">
        تفعيل وعرض الإعلانات في الصفحة الرئيسية للمنصة
      </p>

      <form onSubmit={save} className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={s.adsenseEnabled}
            onChange={(e) => setS({ ...s, adsenseEnabled: e.target.checked })}
          />
          تفعيل الإعلانات في الصفحة الرئيسية
        </label>

        <label className="block text-sm">
          Client ID (ca-pub-xxxxxxxx)
          <input
            dir="ltr"
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            placeholder="ca-pub-xxxxxxxx"
            value={s.adsenseClient}
            onChange={(e) => setS({ ...s, adsenseClient: e.target.value })}
          />
        </label>

        <label className="block text-sm">
          Slot الإعلان الأول (تحت الهيرو)
          <input
            dir="ltr"
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            value={s.adsenseSlotHome}
            onChange={(e) => setS({ ...s, adsenseSlotHome: e.target.value })}
          />
        </label>

        <label className="block text-sm">
          Slot الإعلان الثاني (قبل التذييل) — اختياري
          <input
            dir="ltr"
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            value={s.adsenseSlotHome2}
            onChange={(e) => setS({ ...s, adsenseSlotHome2: e.target.value })}
          />
        </label>

        <button type="submit" className="w-full rounded-xl bg-blue-600 py-3 font-medium">
          حفظ
        </button>
        {msg && <p className="text-center text-sm text-emerald-400">{msg}</p>}
      </form>

      <a href="/owner/settings" className="block text-center text-sm text-slate-500 mt-6">
        إعدادات المنصة
      </a>
      <a href="/owner" className="block text-center text-sm text-slate-500 mt-2">
        ← رجوع
      </a>
    </div>
  )
}
