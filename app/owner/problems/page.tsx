'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Ev = {
  id: string
  at: string
  type: string
  severity: string
  message: string
  ip?: string
  seen: boolean
  meta?: any
}

const typeLabel: Record<string, string> = {
  blocked_upload: 'رفع مرفوض',
  malware_suspect: 'اشتباه برمجية خبيثة',
  nsfw_suspect: 'محتوى مخالف/إباحي',
  rate_limit: 'محاولات مفرطة',
  path_traversal: 'محاولة مسار خطير',
  invalid_type: 'نوع ملف غير صالح',
  oversized: 'حجم زائد',
  attack_pattern: 'نمط هجومي',
}

export default function OwnerProblemsPage() {
  const [events, setEvents] = useState<Ev[]>([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/owner/security', { cache: 'no-store' })
      const data = await res.json()
      setEvents(data.events || [])
      setUnread(data.unread || 0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const t = setInterval(load, 30000)
    return () => clearInterval(t)
  }, [])

  async function markAll() {
    await fetch('/api/owner/security', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark_seen' }),
    })
    load()
  }

  return (
    <div className="mx-auto max-w-2xl px-3 py-6 pb-24 text-slate-100" dir="rtl">
      <div className="flex justify-between items-start gap-2 mb-4">
        <div>
          <h1 className="text-xl font-bold">الأخطاء والمشاكل الأمنية</h1>
          <p className="text-xs text-slate-400">
            إشعارات رفع خطير · برمجيات · محتوى مخالف · محاولات تعطيل
            {unread > 0 ? ` · ${unread} غير مقروء` : ''}
          </p>
        </div>
        <Link href="/owner" className="text-xs text-slate-400">
          ← رجوع
        </Link>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={load}
          className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs"
        >
          تحديث
        </button>
        <button
          type="button"
          onClick={markAll}
          className="px-3 py-1.5 rounded-lg bg-blue-600 text-xs"
        >
          تعليم الكل كمقروء
        </button>
      </div>

      {loading && <p className="text-slate-500 text-sm">جاري التحميل...</p>}

      {!loading && events.length === 0 && (
        <div className="rounded-2xl border border-slate-800 p-8 text-center text-slate-500 text-sm">
          لا توجد حوادث مسجّلة حالياً
        </div>
      )}

      <div className="space-y-2">
        {events.map((e) => (
          <div
            key={e.id}
            className={`rounded-xl border p-3 ${
              e.seen ? 'border-slate-800 bg-slate-900/50' : 'border-rose-900/50 bg-rose-950/20'
            }`}
          >
            <div className="flex flex-wrap justify-between gap-2 text-[11px]">
              <span
                className={`font-bold ${
                  e.severity === 'critical'
                    ? 'text-rose-400'
                    : e.severity === 'high'
                      ? 'text-orange-400'
                      : 'text-amber-300'
                }`}
              >
                {typeLabel[e.type] || e.type} · {e.severity}
              </span>
              <span className="text-slate-500">{new Date(e.at).toLocaleString('ar')}</span>
            </div>
            <p className="text-sm mt-1 text-slate-200">{e.message}</p>
            {e.ip && <p className="text-[10px] text-slate-500 mt-1 font-mono">IP: {e.ip}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
