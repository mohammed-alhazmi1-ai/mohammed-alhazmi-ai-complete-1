'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type SocialLink = {
  id: string
  label: string
  href: string
  icon: string
  enabled: boolean
  order: number
}

const ICON_OPTIONS = [
  'whatsapp',
  'telegram',
  'twitter',
  'instagram',
  'youtube',
  'facebook',
  'tiktok',
  'snapchat',
  'linkedin',
  'email',
  'website',
]

export default function OwnerSocialPage() {
  const [items, setItems] = useState<SocialLink[]>([])
  const [all, setAll] = useState<any>(null)
  const [msg, setMsg] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    id: '',
    label: '',
    href: '',
    icon: 'website',
  })

  useEffect(() => {
    ;(async () => {
      const res = await fetch('/api/owner/settings', { cache: 'no-store' })
      const data = await res.json()
      if (data.ok && data.settings) {
        setAll(data.settings)
        setItems(Array.isArray(data.settings.socialLinks) ? data.settings.socialLinks : [])
      }
    })()
  }, [])

  async function save(next: SocialLink[]) {
    setSaving(true)
    setMsg('')
    try {
      const res = await fetch('/api/owner/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...(all || {}), socialLinks: next }),
      })
      const data = await res.json()
      if (!data.ok) throw new Error(data.error || 'فشل')
      setAll(data.settings)
      setItems(data.settings.socialLinks || next)
      setMsg('تم حفظ روابط التواصل ✓')
    } catch (e: any) {
      setMsg(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-3 py-6 pb-24 text-slate-100" dir="rtl">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-lg font-bold">وسائل التواصل الاجتماعي</h1>
          <p className="text-xs text-slate-400">
            تظهر في الصفحة الرئيسية ولوحة المستخدم — فعّل الرابط ليظهر الزر
          </p>
        </div>
        <Link href="/owner/settings" className="text-xs text-slate-400">
          ← الإعدادات
        </Link>
      </div>

      {msg && (
        <div className="mb-3 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-emerald-400">
          {msg}
        </div>
      )}

      <div className="space-y-3 mb-6">
        {[...items].sort((a, b) => a.order - b.order).map((s) => (
          <div key={s.id} className="rounded-xl border border-slate-800 bg-slate-900 p-3 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="checkbox"
                checked={s.enabled}
                onChange={(e) => {
                  const next = items.map((x) =>
                    x.id === s.id ? { ...x, enabled: e.target.checked } : x
                  )
                  setItems(next)
                }}
              />
              <input
                className="flex-1 min-w-[100px] rounded-lg bg-slate-950 border border-slate-700 px-2 py-1 text-sm"
                value={s.label}
                onChange={(e) =>
                  setItems(items.map((x) => (x.id === s.id ? { ...x, label: e.target.value } : x)))
                }
              />
              <select
                className="rounded-lg bg-slate-950 border border-slate-700 px-2 py-1 text-xs"
                value={s.icon}
                onChange={(e) =>
                  setItems(items.map((x) => (x.id === s.id ? { ...x, icon: e.target.value } : x)))
                }
              >
                {ICON_OPTIONS.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
              <input
                type="number"
                className="w-14 rounded-lg bg-slate-950 border border-slate-700 px-1 text-xs"
                value={s.order}
                onChange={(e) =>
                  setItems(
                    items.map((x) =>
                      x.id === s.id ? { ...x, order: Number(e.target.value) || 0 } : x
                    )
                  )
                }
              />
            </div>
            <input
              dir="ltr"
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-2 py-1.5 text-xs"
              placeholder="https://..."
              value={s.href}
              onChange={(e) =>
                setItems(items.map((x) => (x.id === s.id ? { ...x, href: e.target.value } : x)))
              }
            />
            <button
              type="button"
              className="text-xs text-rose-400"
              onClick={() => setItems(items.filter((x) => x.id !== s.id))}
            >
              حذف
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-700 p-4 space-y-2 mb-4">
        <p className="text-sm font-medium">إضافة رابط جديد</p>
        <input
          className="w-full rounded-lg bg-slate-950 border border-slate-700 px-2 py-1.5 text-sm"
          placeholder="id (مثل linkedin)"
          value={form.id}
          onChange={(e) => setForm({ ...form, id: e.target.value })}
        />
        <input
          className="w-full rounded-lg bg-slate-950 border border-slate-700 px-2 py-1.5 text-sm"
          placeholder="الاسم الظاهر"
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
        />
        <input
          dir="ltr"
          className="w-full rounded-lg bg-slate-950 border border-slate-700 px-2 py-1.5 text-sm"
          placeholder="https://..."
          value={form.href}
          onChange={(e) => setForm({ ...form, href: e.target.value })}
        />
        <select
          className="w-full rounded-lg bg-slate-950 border border-slate-700 px-2 py-1.5 text-sm"
          value={form.icon}
          onChange={(e) => setForm({ ...form, icon: e.target.value })}
        >
          {ICON_OPTIONS.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="w-full rounded-xl bg-emerald-700 py-2 text-sm font-bold"
          onClick={() => {
            if (!form.id || !form.label) {
              setMsg('أدخل المعرف والاسم')
              return
            }
            if (items.some((x) => x.id === form.id.trim())) {
              setMsg('المعرف موجود مسبقاً')
              return
            }
            setItems([
              ...items,
              {
                id: form.id.trim(),
                label: form.label.trim(),
                href: form.href.trim(),
                icon: form.icon,
                enabled: Boolean(form.href.trim()),
                order: items.length + 1,
              },
            ])
            setForm({ id: '', label: '', href: '', icon: 'website' })
          }}
        >
          + إضافة
        </button>
      </div>

      <button
        type="button"
        disabled={saving}
        onClick={() => save(items)}
        className="w-full rounded-xl bg-blue-600 py-3 font-medium disabled:opacity-50"
      >
        {saving ? '...' : 'حفظ روابط التواصل'}
      </button>
    </div>
  )
}
