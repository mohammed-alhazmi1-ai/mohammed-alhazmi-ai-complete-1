'use client'

import { useCallback, useEffect, useState } from 'react'
import type { PlanB } from '@/lib/platform-plans-b'

function blank(): PlanB {
  return {
    id: 'plan_' + Date.now(),
    name: '',
    nameEn: '',
    priceUsd: 0,
    monthlyRemo: 100,
    chatLimit: 50,
    imageLimit: 10,
    videoLimit: 2,
    features: [],
    enabled: true,
  }
}

export default function OwnerPlansPage() {
  const [plans, setPlans] = useState<PlanB[]>([])
  const [edit, setEdit] = useState<PlanB | null>(null)
  const [feat, setFeat] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/owner/plans', { cache: 'no-store' })
      const data = await res.json()
      if (data.ok) setPlans(data.plans || [])
      else setMsg(data.error || 'فشل التحميل')
    } catch (e: any) {
      setMsg(e?.message || 'خطأ')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function post(body: any) {
    const res = await fetch('/api/owner/plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!data.ok) throw new Error(data.error || 'فشل')
    setPlans(data.plans || [])
    return data
  }

  async function savePlan() {
    if (!edit?.name?.trim()) {
      setMsg('اكتب اسم الخطة')
      return
    }
    try {
      await post({
        action: 'upsert',
        plan: {
          ...edit,
          features: feat
            .split('\n')
            .map((x) => x.trim())
            .filter(Boolean),
        },
      })
      setMsg('تم حفظ الخطة')
      setEdit(null)
    } catch (e: any) {
      setMsg(e.message)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-3 py-6 pb-20 text-slate-100" dir="rtl">
      <h1 className="text-xl font-bold mb-1">إدارة الخطط — المرحلة B</h1>
      <p className="text-sm text-slate-400 mb-4">
        إضافة وتعديل وتفعيل خطط الاشتراك
      </p>

      {msg && (
        <div className="mb-3 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm">
          {msg}
        </div>
      )}

      <button
        type="button"
        className="w-full mb-4 rounded-xl bg-emerald-700 py-2.5 text-sm font-medium"
        onClick={() => {
          const p = blank()
          setEdit(p)
          setFeat('')
          setMsg('')
        }}
      >
        + إضافة خطة جديدة
      </button>

      {loading && <p className="text-sm text-slate-500">جاري التحميل...</p>}

      <div className="space-y-2 mb-6">
        {plans.map((p) => (
          <div
            key={p.id}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 flex flex-wrap items-center justify-between gap-2"
          >
            <div>
              <div className="font-bold">
                {p.name}{' '}
                <span className="text-xs text-slate-500">({p.id})</span>
                {!p.enabled && (
                  <span className="text-amber-400 text-xs mr-2"> معطّلة</span>
                )}
                {p.popular && (
                  <span className="text-blue-400 text-xs mr-2"> شائعة</span>
                )}
              </div>
              <div className="text-xs text-slate-400">
                ${p.priceUsd} · {p.monthlyRemo} REMO
              </div>
            </div>
            <div className="flex gap-1 text-xs">
              <button
                type="button"
                className="px-2 py-1 rounded-lg bg-slate-800"
                onClick={() => {
                  setEdit({ ...p })
                  setFeat((p.features || []).join('\n'))
                  setMsg('')
                }}
              >
                تعديل
              </button>
              <button
                type="button"
                className="px-2 py-1 rounded-lg bg-slate-800"
                onClick={async () => {
                  try {
                    await post({ action: 'toggle', id: p.id })
                  } catch (e: any) {
                    setMsg(e.message)
                  }
                }}
              >
                {p.enabled ? 'إيقاف' : 'تفعيل'}
              </button>
              <button
                type="button"
                className="px-2 py-1 rounded-lg bg-rose-900/40"
                onClick={async () => {
                  if (!confirm('حذف ' + p.name + '؟')) return
                  try {
                    await post({ action: 'delete', id: p.id })
                  } catch (e: any) {
                    setMsg(e.message)
                  }
                }}
              >
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>

      {edit && (
        <div className="rounded-2xl border border-blue-800 bg-slate-900 p-4 space-y-3">
          <h2 className="font-bold">نموذج الخطة</h2>
          <input
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            placeholder="id إنجليزي (مثل pro)"
            value={edit.id}
            onChange={(e) => setEdit({ ...edit, id: e.target.value })}
          />
          <input
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            placeholder="الاسم بالعربي"
            value={edit.name}
            onChange={(e) => setEdit({ ...edit, name: e.target.value })}
          />
          <input
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            placeholder="Name EN"
            value={edit.nameEn}
            onChange={(e) => setEdit({ ...edit, nameEn: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs">
              السعر USD
              <input
                type="number"
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
                value={edit.priceUsd}
                onChange={(e) =>
                  setEdit({ ...edit, priceUsd: Number(e.target.value) || 0 })
                }
              />
            </label>
            <label className="text-xs">
              REMO شهري
              <input
                type="number"
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
                value={edit.monthlyRemo}
                onChange={(e) =>
                  setEdit({
                    ...edit,
                    monthlyRemo: Number(e.target.value) || 0,
                  })
                }
              />
            </label>
          </div>
          <label className="text-xs block">
            المميزات (سطر لكل ميزة)
            <textarea
              className="mt-1 w-full min-h-[90px] rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
              value={feat}
              onChange={(e) => setFeat(e.target.value)}
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!edit.popular}
              onChange={(e) => setEdit({ ...edit, popular: e.target.checked })}
            />
            الأكثر طلباً
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={savePlan}
              className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm"
            >
              حفظ الخطة
            </button>
            <button
              type="button"
              onClick={() => setEdit(null)}
              className="rounded-xl bg-slate-800 px-4 py-2.5 text-sm"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-2 text-sm text-center">
        <a href="/owner/settings" className="text-slate-400">
          إعدادات عامة (A)
        </a>
        <a href="/owner" className="text-slate-500">
          ← رجوع للوحة المالك
        </a>
      </div>
    </div>
  )
}
