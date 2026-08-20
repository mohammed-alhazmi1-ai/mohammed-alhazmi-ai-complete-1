'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type LandingContent = {
  badgeText: string
  heroSubtitle: string
  ticker1: string
  ticker2: string
  ticker3: string
  promptLabel: string
  promptPlaceholder: string
  runButton: string
  ctaPrimary: string
  ctaPrimaryHref: string
  ctaSecondary: string
  ctaSecondaryHref: string
  servicesTitle: string
  servicesSubtitle: string
  featuresTitle: string
  templatesTitle: string
  templatesSubtitle: string
  guideTitle: string
  guideSubtitle: string
  articlesTitle: string
  articlesSubtitle: string
  comingTitle: string
  comingSubtitle: string
  footerNote: string
  loginLabel: string
  registerLabel: string
  memberHint: string
}

const FIELDS: { key: keyof LandingContent; label: string; multiline?: boolean }[] = [
  { key: 'badgeText', label: 'شارة أعلى العنوان' },
  { key: 'heroSubtitle', label: 'النص التعريفي تحت الاسم', multiline: true },
  { key: 'ticker1', label: 'الشريط المتحرك 1' },
  { key: 'ticker2', label: 'الشريط المتحرك 2' },
  { key: 'ticker3', label: 'الشريط المتحرك 3' },
  { key: 'promptLabel', label: 'عنوان مربع الطلب' },
  { key: 'promptPlaceholder', label: 'نص توضيحي داخل مربع الطلب', multiline: true },
  { key: 'runButton', label: 'نص زر تنفيذ' },
  { key: 'ctaPrimary', label: 'نص زر ابدأ الآن' },
  { key: 'ctaPrimaryHref', label: 'رابط زر ابدأ الآن' },
  { key: 'ctaSecondary', label: 'نص زر لوحة المستخدم' },
  { key: 'ctaSecondaryHref', label: 'رابط زر لوحة المستخدم' },
  { key: 'loginLabel', label: 'نص زر دخول' },
  { key: 'registerLabel', label: 'نص زر إنشاء حساب' },
  { key: 'memberHint', label: 'عبارة عضو جديد؟' },
  { key: 'servicesTitle', label: 'عنوان قسم الخدمات' },
  { key: 'servicesSubtitle', label: 'وصف قسم الخدمات' },
  { key: 'featuresTitle', label: 'عنوان قسم المميزات' },
  { key: 'templatesTitle', label: 'عنوان القوالب' },
  { key: 'templatesSubtitle', label: 'وصف القوالب' },
  { key: 'guideTitle', label: 'عنوان تعليمات الاستخدام' },
  { key: 'guideSubtitle', label: 'وصف التعليمات' },
  { key: 'articlesTitle', label: 'عنوان المقالات' },
  { key: 'articlesSubtitle', label: 'وصف المقالات' },
  { key: 'comingTitle', label: 'عنوان قسم قريباً' },
  { key: 'comingSubtitle', label: 'وصف قسم قريباً' },
  { key: 'footerNote', label: 'نص التذييل / الحقوق' },
]

export default function LandingSettingsPage() {
  const [landing, setLanding] = useState<LandingContent | null>(null)
  const [all, setAll] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/owner/settings', { cache: 'no-store' })
        const data = await res.json()
        if (data.settings) {
          setAll(data.settings)
          setLanding(data.settings.landing || {})
        }
      } catch (e: any) {
        setMsg(e?.message || 'تعذر التحميل')
      }
    })()
  }, [])

  async function save() {
    if (!landing || !all) return
    setSaving(true)
    setMsg('')
    try {
      const res = await fetch('/api/owner/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...all, landing }),
      })
      const data = await res.json()
      if (!res.ok || data.ok === false) throw new Error(data.error || 'فشل الحفظ')
      setAll(data.settings)
      setLanding(data.settings.landing)
      setMsg('تم الحفظ — حدّث الصفحة الرئيسية لرؤية التغيير')
    } catch (e: any) {
      setMsg(e?.message || 'خطأ')
    } finally {
      setSaving(false)
    }
  }

  if (!landing) {
    return (
      <div className="p-8 text-slate-400" dir="rtl">
        جاري تحميل إعدادات الهبوط…
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 text-slate-100" dir="rtl">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">تعديل صفحة الهبوط</h1>
          <p className="text-xs text-slate-400 mt-1">
            عدّل النصوص والأزرار والعبارات الظاهرة في الصفحة الرئيسية
          </p>
        </div>
        <Link href="/owner/settings" className="text-sm text-slate-400 hover:text-white">
          ← رجوع
        </Link>
      </div>

      <div className="space-y-4">
        {FIELDS.map((f) => (
          <label key={f.key} className="block text-sm">
            <span className="text-slate-300">{f.label}</span>
            {f.multiline ? (
              <textarea
                rows={3}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                value={(landing as any)[f.key] || ''}
                onChange={(e) => setLanding({ ...landing, [f.key]: e.target.value })}
              />
            ) : (
              <input
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                value={(landing as any)[f.key] || ''}
                onChange={(e) => setLanding({ ...landing, [f.key]: e.target.value })}
              />
            )}
          </label>
        ))}
      </div>

      {msg && <p className="mt-4 text-sm text-amber-300">{msg}</p>}

      <button
        type="button"
        disabled={saving}
        onClick={save}
        className="mt-6 w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-3 font-bold disabled:opacity-50"
      >
        {saving ? 'جاري الحفظ…' : 'حفظ تعديلات صفحة الهبوط'}
      </button>
    </div>
  )
}
