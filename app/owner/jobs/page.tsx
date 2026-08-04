'use client'

import { useCallback, useEffect, useState } from 'react'

export default function OwnerJobsPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [summary, setSummary] = useState({ total: 0, failed: 0, stuck: 0 })
  const [providers, setProviders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [testing, setTesting] = useState(false)
  const [msg, setMsg] = useState('')

  const loadJobs = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/owner/jobs?status=problems', { cache: 'no-store' })
      const data = await res.json()
      setJobs(data.jobs || [])
      setSummary(data.summary || { total: 0, failed: 0, stuck: 0 })
      if (data.note) setMsg(data.note)
    } catch (e: any) {
      setMsg(e?.message || 'خطأ')
    } finally {
      setLoading(false)
    }
  }, [])

  async function testProviders() {
    setTesting(true)
    try {
      const res = await fetch('/api/owner/providers', { cache: 'no-store' })
      const data = await res.json()
      setProviders(data.providers || [])
    } catch (e: any) {
      setMsg(e?.message || 'فشل الفحص')
    } finally {
      setTesting(false)
    }
  }

  useEffect(() => {
    loadJobs()
    testProviders()
  }, [loadJobs])

  return (
    <div className="mx-auto max-w-3xl px-3 py-6 pb-20 text-slate-100" dir="rtl">
      <h1 className="text-xl font-bold mb-1">الطلبات والمزودون</h1>
      <p className="text-sm text-slate-400 mb-4">
        طلبات فشلت أو لم يستجب المزود + فحص اتصال OpenAI / Gemini
      </p>

      {/* ملخص */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-3 text-center">
          <div className="text-lg font-bold">{summary.total}</div>
          <div className="text-[11px] text-slate-400">المعروضة</div>
        </div>
        <div className="rounded-xl bg-rose-950/40 border border-rose-900 p-3 text-center">
          <div className="text-lg font-bold text-rose-400">{summary.failed}</div>
          <div className="text-[11px] text-slate-400">فاشلة</div>
        </div>
        <div className="rounded-xl bg-amber-950/40 border border-amber-900 p-3 text-center">
          <div className="text-lg font-bold text-amber-400">{summary.stuck}</div>
          <div className="text-[11px] text-slate-400">معلّقة</div>
        </div>
      </div>

      {/* فحص المزود */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">حالة المزودين</h2>
          <button
            type="button"
            onClick={testProviders}
            disabled={testing}
            className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 disabled:opacity-50"
          >
            {testing ? 'جاري الفحص...' : 'إعادة الفحص'}
          </button>
        </div>
        <div className="space-y-2">
          {providers.map((p) => (
            <div
              key={p.id}
              className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm border ${
                p.ok
                  ? 'border-emerald-800 bg-emerald-950/30'
                  : 'border-rose-800 bg-rose-950/30'
              }`}
            >
              <span className="font-medium uppercase">{p.id}</span>
              <span className={p.ok ? 'text-emerald-400' : 'text-rose-400'}>
                {p.ok ? '✓ يعمل' : '✕ لا يستجيب'} — {p.message}
              </span>
            </div>
          ))}
          {!providers.length && (
            <p className="text-xs text-slate-500">اضغط إعادة الفحص</p>
          )}
        </div>
      </div>

      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={loadJobs}
          className="rounded-xl bg-slate-800 px-4 py-2 text-sm"
        >
          تحديث الطلبات
        </button>
      </div>

      {msg && (
        <p className="text-xs text-amber-400 mb-2">{msg}</p>
      )}
      {loading && <p className="text-sm text-slate-500">جاري التحميل...</p>}

      <div className="space-y-2">
        {jobs.map((j) => (
          <div
            key={j.id}
            className="rounded-xl border border-slate-800 bg-slate-900/50 p-3 text-sm"
          >
            <div className="flex flex-wrap justify-between gap-2">
              <span className="font-bold">{j.type || j.service || 'طلب'}</span>
              <span
                className={
                  String(j.status).includes('fail') || j.status === 'error'
                    ? 'text-rose-400'
                    : 'text-amber-400'
                }
              >
                {j.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              {j.prompt || j.input || j.description || '—'}
            </p>
            <p className="text-[11px] text-rose-300/90 mt-1">
              {j.error || j.result || j.message || 'المزود لم يُكمل التنفيذ'}
            </p>
            <p className="text-[10px] text-slate-600 mt-1" dir="ltr">
              #{String(j.id).slice(0, 12)} · {j.provider || '—'} ·{' '}
              {j.createdAt ? new Date(j.createdAt).toLocaleString('ar') : ''}
            </p>
          </div>
        ))}
        {!loading && !jobs.length && (
          <div className="rounded-2xl border border-dashed border-slate-700 p-8 text-center text-slate-500 text-sm">
            لا توجد طلبات فاشلة أو معلّقة حالياً
          </div>
        )}
      </div>

      <a href="/owner" className="block text-center text-sm text-slate-500 mt-8">
        ← رجوع
      </a>
    </div>
  )
}
