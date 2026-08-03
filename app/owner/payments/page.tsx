'use client'

import { useCallback, useEffect, useState } from 'react'

type Row = {
  id: string
  userId: string
  provider: string
  amount: number
  currency: string
  credits: number
  status: string
  description?: string | null
  createdAt: string
  userEmail?: string | null
  userName?: string | null
}

const OWNER_EMAIL =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_OWNER_EMAILS?.split(',')[0]) ||
  'mohammedalhzmi1@gmail.com'

export default function OwnerPaymentsPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [msg, setMsg] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setErr(null)
    try {
      const res = await fetch(
        `/api/owner/payments?email=${encodeURIComponent(OWNER_EMAIL.trim())}`,
        { cache: 'no-store' }
      )
      const data = await res.json()
      if (!data.ok) throw new Error(data.error || 'فشل التحميل')
      setRows(data.pending || [])
    } catch (e: any) {
      setErr(e?.message || 'خطأ')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function settle(id: string, action: 'approve' | 'reject') {
    setBusy(id + action)
    setMsg(null)
    try {
      const res = await fetch('/api/owner/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: id,
          action,
          note,
          email: OWNER_EMAIL.trim(),
        }),
      })
      const data = await res.json()
      if (!data.ok) throw new Error(data.error || 'فشلت العملية')
      setMsg(
        action === 'approve'
          ? `تم الاعتماد وشحن ${data.creditsAdded} REMO (الرصيد≈ ${data.walletTotal})`
          : 'تم رفض الطلب'
      )
      setNote('')
      await load()
    } catch (e: any) {
      setMsg(e?.message || 'خطأ')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-3 py-4 sm:px-4 pb-20" dir="rtl">
      <h1 className="text-xl font-bold mb-1">اعتماد المدفوعات</h1>
      <p className="text-sm text-gray-500 mb-4">
        طلبات جيب / بينانس / يدوي بحالة انتظار — الاعتماد يشحن REMO فوراً لمحفظة المستخدم.
      </p>

      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={load}
          className="rounded-xl bg-gray-100 dark:bg-gray-800 px-4 py-2 text-sm"
        >
          تحديث
        </button>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="ملاحظة اختيارية عند الاعتماد/الرفض"
          className="flex-1 rounded-xl border px-3 py-2 text-sm bg-transparent"
        />
      </div>

      {msg && (
        <div className="mb-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-sm p-3">{msg}</div>
      )}
      {err && (
        <div className="mb-3 rounded-xl bg-red-50 text-red-800 text-sm p-3">{err}</div>
      )}
      {loading && <p className="text-sm text-gray-500">جاري التحميل...</p>}

      {!loading && rows.length === 0 && (
        <div className="rounded-2xl border border-dashed p-8 text-center text-gray-500 text-sm">
          لا توجد طلبات معلّقة حالياً
        </div>
      )}

      <div className="space-y-3">
        {rows.map((r) => (
          <div
            key={r.id}
            className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-2"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold">
                {r.provider === 'jeeb' ? 'محفظة جيب' : r.provider}
              </span>
              <span className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">
                {r.status}
              </span>
            </div>
            <div className="text-sm">
              <div>
                المستخدم:{' '}
                <b>{r.userEmail || r.userName || r.userId.slice(0, 8)}</b>
              </div>
              <div>
                المبلغ:{' '}
                <b>
                  {r.amount} {r.currency}
                </b>
              </div>
              <div>
                الشحن:{' '}
                <b className="text-green-700">
                  {r.credits} REMO
                </b>
              </div>
              {r.description ? (
                <div className="text-xs text-gray-500 break-all mt-1">{r.description}</div>
              ) : null}
              <div className="text-xs text-gray-400 mt-1" dir="ltr">
                #{r.id.slice(0, 12)} · {new Date(r.createdAt).toLocaleString('ar')}
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                disabled={!!busy}
                onClick={() => settle(r.id, 'approve')}
                className="flex-1 rounded-xl bg-green-600 text-white py-2.5 text-sm font-medium disabled:opacity-50"
              >
                {busy === r.id + 'approve' ? '...' : 'اعتماد وشحن REMO'}
              </button>
              <button
                type="button"
                disabled={!!busy}
                onClick={() => settle(r.id, 'reject')}
                className="flex-1 rounded-xl bg-red-600/90 text-white py-2.5 text-sm font-medium disabled:opacity-50"
              >
                {busy === r.id + 'reject' ? '...' : 'رفض'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
