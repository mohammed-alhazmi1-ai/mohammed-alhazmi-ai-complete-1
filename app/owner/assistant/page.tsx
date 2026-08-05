'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { AssistantConfig, KnowledgeItem } from '@/lib/platform-assistant'

export default function OwnerAssistantPage() {
  const [cfg, setCfg] = useState<AssistantConfig | null>(null)
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    id: '',
    title: '',
    keywords: '',
    answer: '',
    imageUrl: '',
    videoUrl: '',
    priority: 50,
  })

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/owner/assistant', { cache: 'no-store' })
      const data = await res.json()
      if (data.ok) setCfg(data.config)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function post(body: any) {
    const res = await fetch('/api/owner/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!data.ok) throw new Error(data.error || 'فشل')
    setCfg(data.config)
    setMsg(data.message || 'تم')
  }

  if (loading || !cfg) {
    return <div className="p-10 text-center text-slate-400" dir="rtl">جاري التحميل...</div>
  }

  return (
    <div className="mx-auto max-w-2xl px-3 py-6 pb-24 text-slate-100" dir="rtl">
      <div className="flex justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold">مساعد المنصة</h1>
          <p className="text-xs text-slate-400">بحث أدق · صور/فيديو · نموذج صغير اختياري</p>
        </div>
        <Link href="/owner" className="text-xs text-slate-400">← رجوع</Link>
      </div>

      {msg && (
        <div className="mb-3 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-emerald-400">{msg}</div>
      )}

      <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 mb-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={cfg.enabled} onChange={(e) => setCfg({ ...cfg, enabled: e.target.checked })} />
          تفعيل المساعد
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={!!cfg.useSmallModel} onChange={(e) => setCfg({ ...cfg, useSmallModel: e.target.checked })} />
          إعادة صياغة بنموذج صغير (Gemini Flash / GPT-4o-mini عند وجود المفتاح)
        </label>
        <label className="block text-sm">الاسم
          <input className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm" value={cfg.name} onChange={(e) => setCfg({ ...cfg, name: e.target.value })} />
        </label>
        <label className="block text-sm">الترحيب
          <textarea className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm min-h-[60px]" value={cfg.welcome} onChange={(e) => setCfg({ ...cfg, welcome: e.target.value })} />
        </label>
        <label className="block text-sm">الرد الاحتياطي
          <textarea className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm min-h-[60px]" value={cfg.fallback} onChange={(e) => setCfg({ ...cfg, fallback: e.target.value })} />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" className="rounded-xl bg-blue-600 py-2.5 text-sm font-bold" onClick={async () => { try { await post({ action: 'save', ...cfg }) } catch (e: any) { setMsg(e.message) } }}>حفظ</button>
          <button type="button" className="rounded-xl bg-emerald-700 py-2.5 text-sm font-bold" onClick={async () => { try { await post({ action: 'retrain' }) } catch (e: any) { setMsg(e.message) } }}>تحديث المعرفة</button>
        </div>
      </div>

      <h2 className="font-bold mb-2 text-sm">المعرفة</h2>
      <div className="space-y-2 mb-6">
        {cfg.items.map((it) => (
          <div key={it.id} className="rounded-xl border border-slate-800 bg-slate-900 p-3">
            <div className="flex justify-between gap-2">
              <div>
                <p className="font-medium text-sm">{it.title}</p>
                <p className="text-xs text-slate-400 line-clamp-2">{it.answer}</p>
                {it.imageUrl ? <p className="text-[10px] text-blue-400 mt-1">صورة مرفقة</p> : null}
                {it.videoUrl ? <p className="text-[10px] text-purple-400">فيديو مرفق</p> : null}
              </div>
              <button type="button" className="text-xs text-rose-400" onClick={async () => { if (confirm('حذف؟')) try { await post({ action: 'delete-item', id: it.id }) } catch (e: any) { setMsg(e.message) } }}>حذف</button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-700 p-4 space-y-2">
        <h3 className="font-bold text-sm">إضافة معرفة (+ صورة/فيديو)</h3>
        <input className="w-full rounded-lg bg-slate-950 border border-slate-700 px-2 py-1.5 text-sm" placeholder="id" value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} />
        <input className="w-full rounded-lg bg-slate-950 border border-slate-700 px-2 py-1.5 text-sm" placeholder="العنوان" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input className="w-full rounded-lg bg-slate-950 border border-slate-700 px-2 py-1.5 text-sm" placeholder="كلمات مفتاحية ," value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} />
        <textarea className="w-full rounded-lg bg-slate-950 border border-slate-700 px-2 py-1.5 text-sm min-h-[90px]" placeholder="الجواب" value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} />
        <input className="w-full rounded-lg bg-slate-950 border border-slate-700 px-2 py-1.5 text-sm" dir="ltr" placeholder="رابط صورة (اختياري)" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
        <input className="w-full rounded-lg bg-slate-950 border border-slate-700 px-2 py-1.5 text-sm" dir="ltr" placeholder="رابط فيديو mp4/youtube (اختياري)" value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} />
        <button
          type="button"
          className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-bold"
          onClick={async () => {
            if (!form.id || !form.answer) return setMsg('id والجواب مطلوبان')
            const item: KnowledgeItem = {
              id: form.id.trim(),
              title: form.title.trim() || form.id,
              keywords: form.keywords.split(/[,،]/).map((x) => x.trim()).filter(Boolean),
              answer: form.answer.trim(),
              imageUrl: form.imageUrl.trim(),
              videoUrl: form.videoUrl.trim(),
              enabled: true,
              priority: form.priority,
              links: [],
            }
            try {
              await post({ action: 'upsert-item', item })
              setForm({ id: '', title: '', keywords: '', answer: '', imageUrl: '', videoUrl: '', priority: 50 })
            } catch (e: any) {
              setMsg(e.message)
            }
          }}
        >
          حفظ العنصر
        </button>
      </div>
    </div>
  )
}
