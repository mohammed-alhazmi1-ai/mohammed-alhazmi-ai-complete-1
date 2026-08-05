'use client'

import { useEffect, useState } from 'react'
import OwnerPageShell from '@/components/owner/OwnerPageShell'

type KeyRow = {
  id: string
  keyName: string
  hasValue: boolean
  masked: string
  lastTestOk: boolean | null
}

type ModelRow = {
  id: string
  modelId: string
  displayName: string
  isDefault: boolean
}

type Provider = {
  id: string
  slug: string
  name: string
  category: string
  isEnabled: boolean
  priority: number
  defaultModel: string | null
  costPerUse: number
  keys?: KeyRow[]
  models?: ModelRow[]
}

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [note, setNote] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [testing, setTesting] = useState<string | null>(null)
  const [keyForm, setKeyForm] = useState<Record<string, string>>({})
  const [form, setForm] = useState({
    name: '',
    slug: '',
    category: 'text',
    priority: 50,
    defaultModel: '',
    costPerUse: 5,
  })

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/owner/providers', { cache: 'no-store' })
      const data = await res.json()
      const list = Array.isArray(data.providers) ? data.providers : []
      setProviders(
        list.map((p: any) => ({
          ...p,
          keys: Array.isArray(p.keys) ? p.keys : [],
          models: Array.isArray(p.models) ? p.models : [],
          isEnabled: Boolean(p.isEnabled),
        }))
      )
      setNote(data.note || (data.source === 'env' ? 'معروضة من متغيرات البيئة' : ''))
    } catch {
      setMsg('تعذر تحميل المزودين')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const post = async (body: any) => {
    const res = await fetch('/api/owner/providers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || data.hint || 'فشل')
    return data
  }

  return (
    <OwnerPageShell
      title="إدارة مزودي الذكاء الاصطناعي"
      description="إضافة · مفتاح API · اختبار · تفعيل · OpenAI / Gemini / Replicate / Hugging Face"
    >
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          type="button"
          onClick={async () => {
            try {
              const d = await post({ action: 'seed' })
              setMsg(d.message || 'تم')
              await load()
            } catch (e: any) {
              setMsg(e.message)
            }
          }}
          className="px-4 py-2 rounded-xl bg-slate-800 text-sm font-bold border border-slate-700"
        >
          إنشاء المزودين الافتراضيين
        </button>
        <button
          type="button"
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 rounded-xl bg-blue-600 text-sm font-bold"
        >
          + إضافة مزود
        </button>
        <button type="button" onClick={load} className="px-4 py-2 rounded-xl text-sm text-slate-400">
          تحديث
        </button>
      </div>

      {msg && (
        <div className="mb-3 p-3 rounded-xl border border-slate-700 bg-slate-900 text-sm text-emerald-400">
          {msg}
        </div>
      )}
      {note && <p className="text-xs text-amber-400/90 mb-3">{note}</p>}

      {showAdd && (
        <form
          className="mb-6 grid sm:grid-cols-2 gap-2 rounded-2xl border border-slate-800 bg-slate-900 p-4"
          onSubmit={async (e) => {
            e.preventDefault()
            try {
              await post({ action: 'create', ...form })
              setShowAdd(false)
              setMsg('تم إضافة المزود')
              await load()
            } catch (err: any) {
              setMsg(err.message)
            }
          }}
        >
          <input
            required
            placeholder="الاسم"
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            required
            placeholder="slug"
            dir="ltr"
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase() })}
          />
          <select
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="text">نصوص</option>
            <option value="image">صور</option>
            <option value="video">فيديو</option>
            <option value="audio">صوت</option>
          </select>
          <input
            type="number"
            placeholder="أولوية"
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
          />
          <input
            placeholder="نموذج افتراضي"
            dir="ltr"
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm"
            value={form.defaultModel}
            onChange={(e) => setForm({ ...form, defaultModel: e.target.value })}
          />
          <input
            type="number"
            placeholder="تكلفة REMO"
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm"
            value={form.costPerUse}
            onChange={(e) => setForm({ ...form, costPerUse: Number(e.target.value) })}
          />
          <button type="submit" className="sm:col-span-2 py-2.5 rounded-xl bg-blue-600 text-sm font-bold">
            حفظ
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-slate-500 text-sm">جاري التحميل...</p>
      ) : providers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 p-8 text-center text-slate-400 text-sm">
          لا يوجد مزودون. اضغط «إنشاء المزودين الافتراضيين».
        </div>
      ) : (
        <div className="space-y-3">
          {providers.map((p) => {
            const keys = p.keys || []
            const models = p.models || []
            const k0 = keys[0]
            return (
              <div
                key={p.id}
                className={`rounded-2xl border p-4 ${
                  p.isEnabled ? 'border-emerald-900/50 bg-slate-900' : 'border-slate-800 bg-slate-900/60'
                }`}
              >
                <div className="flex flex-wrap justify-between gap-2 mb-3">
                  <div>
                    <div className="font-bold text-white flex flex-wrap items-center gap-2">
                      {p.name}
                      <span className="text-[10px] font-mono text-slate-500">{p.slug}</span>
                      <span className="text-[10px] text-slate-500">{p.category}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      أولوية {p.priority} · {p.defaultModel || '—'} · {p.costPerUse} REMO
                    </p>
                  </div>
                  <label className="flex items-center gap-2 text-xs">
                    <span>{p.isEnabled ? 'مفعّل' : 'متوقف'}</span>
                    <input
                      type="checkbox"
                      checked={!!p.isEnabled}
                      onChange={async (e) => {
                        try {
                          await post({ action: 'toggle', id: p.id, isEnabled: e.target.checked })
                          await load()
                        } catch (err: any) {
                          setMsg(err.message)
                        }
                      }}
                    />
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="password"
                    dir="ltr"
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                    placeholder={
                      k0?.hasValue ? `محفوظ: ${k0.masked}` : 'الصق API Key'
                    }
                    value={keyForm[p.id] || ''}
                    onChange={(e) => setKeyForm({ ...keyForm, [p.id]: e.target.value })}
                  />
                  <button
                    type="button"
                    className="px-3 py-2 rounded-xl bg-slate-800 text-xs font-bold"
                    onClick={async () => {
                      const keyValue = keyForm[p.id]
                      if (!keyValue?.trim()) {
                        setMsg('أدخل المفتاح')
                        return
                      }
                      try {
                        await post({
                          action: 'set-key',
                          providerId: p.id,
                          keyName: k0?.keyName || 'API_KEY',
                          keyValue: keyValue.trim(),
                        })
                        setKeyForm((s) => ({ ...s, [p.id]: '' }))
                        setMsg('تم حفظ المفتاح')
                        await load()
                      } catch (err: any) {
                        setMsg(err.message)
                      }
                    }}
                  >
                    حفظ المفتاح
                  </button>
                  <button
                    type="button"
                    disabled={testing === p.id}
                    className="px-3 py-2 rounded-xl bg-blue-600 text-xs font-bold disabled:opacity-50"
                    onClick={async () => {
                      setTesting(p.id)
                      try {
                        const d = await post({ action: 'test', providerId: p.id })
                        setMsg(d.message || (d.success ? 'ناجح' : 'فشل'))
                        await load()
                      } catch (err: any) {
                        setMsg(err.message)
                      } finally {
                        setTesting(null)
                      }
                    }}
                  >
                    {testing === p.id ? '...' : 'اختبار'}
                  </button>
                </div>

                {k0 && k0.lastTestOk !== null && k0.lastTestOk !== undefined && (
                  <p className={`text-[11px] mt-2 ${k0.lastTestOk ? 'text-emerald-400' : 'text-red-400'}`}>
                    آخر اختبار: {k0.lastTestOk ? 'ناجح' : 'فشل'}
                  </p>
                )}

                {models.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {models.map((m) => (
                      <span
                        key={m.id}
                        className="text-[10px] px-2 py-0.5 rounded-full border border-slate-700 text-slate-400"
                      >
                        {m.displayName}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </OwnerPageShell>
  )
}
