'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  PAY_METHODS,
  REMO_PACKS,
  SUBSCRIPTION_PLANS,
  type PayMethod,
  type RemoPack,
  type Plan,
  JEEB_DEPOSIT_NUMBER,
  JEEB_WHATSAPP,
} from '@/lib/plans-and-payments'
// jeeb constants imported below

export default function BillingPage() {
  const [tab, setTab] = useState<'plans' | 'packs'>('packs')
  const [selectedPack, setSelectedPack] = useState<RemoPack | null>(REMO_PACKS[2] || REMO_PACKS[0])
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(
    SUBSCRIPTION_PLANS.find((p) => p.popular) || SUBSCRIPTION_PLANS[2]
  )
  const [methodId, setMethodId] = useState('jeeb')
  const [txRef, setTxRef] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [last, setLast] = useState<any>(null)

  const methods = useMemo(() => PAY_METHODS, [])
  const method: PayMethod | undefined = methods.find((m) => m.id === methodId)

  async function submit() {
    setLoading(true)
    setMsg(null)
    setLast(null)
    try {
      const body: any = { methodId, txRef }
      if (tab === 'packs' && selectedPack) body.packId = selectedPack.id
      if (tab === 'plans' && selectedPlan) body.planId = selectedPlan.id

      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      setLast(data)
      setMsg(data.ok ? data.message : data.error || 'فشل الطلب')
    } catch (e: any) {
      setMsg(e?.message || 'خطأ شبكة')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div data-dashboard="user" className="min-h-screen w-full max-w-lg mx-auto px-3 pb-24 sm:px-4">
<div className="mx-auto max-w-3xl px-3 py-4 sm:px-4 pb-16" dir="rtl">
      <h1 className="text-xl font-bold mb-1">شراء الباقات وشحن REMO</h1>
      <p className="text-sm text-gray-500 mb-4">
        اختر الباقة وطريقة الدفع. التحويل عبر جيب / بينانس / عملات يُعتمد من المالك.
      </p>

      {/* تبويب */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setTab('packs')}
          className={`flex-1 rounded-xl py-2 text-sm font-medium ${
            tab === 'packs' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800'
          }`}
        >
          حزم REMO
        </button>
        <button
          type="button"
          onClick={() => setTab('plans')}
          className={`flex-1 rounded-xl py-2 text-sm font-medium ${
            tab === 'plans' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800'
          }`}
        >
          اشتراكات
        </button>
      </div>

      {/* حزم */}
      {tab === 'packs' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {REMO_PACKS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedPack(p)}
              className={`text-right rounded-2xl border p-4 transition ${
                selectedPack?.id === p.id
                  ? 'border-blue-500 ring-2 ring-blue-400'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="font-bold text-lg">{p.name}</div>
              <div className="text-sm text-gray-500">
                ${p.priceUsd}
                {p.priceYer ? ` · ${p.priceYer} ر.ي` : ''}
              </div>
              {p.bonus ? (
                <div className="text-xs text-green-600 mt-1">+{p.bonus} bonus REMO</div>
              ) : null}
              {p.popular ? (
                <span className="inline-block mt-2 text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  الأكثر اختياراً
                </span>
              ) : null}
            </button>
          ))}
        </div>
      )}

      {/* خطط */}
      {tab === 'plans' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {SUBSCRIPTION_PLANS.filter((p) => p.id !== 'gift').map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedPlan(p)}
              className={`text-right rounded-2xl border p-4 transition ${
                selectedPlan?.id === p.id
                  ? 'border-blue-500 ring-2 ring-blue-400'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold">{p.name}</span>
                {p.badge ? (
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    {p.badge}
                  </span>
                ) : null}
              </div>
              <div className="text-lg font-semibold mt-1">
                {p.priceUsd === 0 ? 'مجاناً' : `\[ {p.priceUsd}/شهر`}
              </div>
              <div className="text-xs text-gray-500">{p.monthlyRemo} REMO شهرياً</div>
              <ul className="mt-2 text-xs text-gray-600 dark:text-gray-300 space-y-1">
                {p.features.slice(0, 3).map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
            </button>
          ))}
        </div>
      )}

      {/* طرق الدفع */}
      <h2 className="font-semibold mb-2">طريقة الدفع</h2>
      <div className="grid grid-cols-1 gap-2 mb-4">
        {methods.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => m.enabled && setMethodId(m.id)}
            disabled={!m.enabled}
            className={`text-right rounded-xl border p-3 flex items-start gap-3 ${
              methodId === m.id ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20' : ''
            } ${!m.enabled ? 'opacity-50' : ''}`}
          >
            <span className="text-xl">{m.icon || '💳'}</span>
            <div className="flex-1">
              <div className="font-medium">
                {m.name}{' '}
                {!m.enabled ? (
                  <span className="text-[10px] text-orange-600">(قريباً)</span>
                ) : null}
              </div>
              <div className="text-xs text-gray-500">{m.currency}</div>
            </div>
          </button>
        ))}
      </div>

      {method && method.enabled && (
        <div className="rounded-xl border border-dashed p-3 mb-4 text-sm bg-gray-50 dark:bg-gray-900/40">
          <div className="font-medium mb-1">تعليمات {method.name}</div>
          <p className="text-gray-600 dark:text-gray-300 mb-2">{method.instructions}</p>
          {method.addressOrAccount ? (
            <div className="text-xs break-all">
              <span className="text-gray-500">الحساب / العنوان: </span>
              <b>{method.addressOrAccount}</b>
            </div>
          ) : null}
        </div>
      )}

      <label className="block text-sm mb-1">
      {methodId === 'jeeb' && (
        <div className="rounded-2xl border-2 border-green-600/40 bg-green-50 dark:bg-green-950/30 p-4 mb-4 text-sm space-y-3">
          <div className="font-bold text-green-800 dark:text-green-300 text-base">
            الدفع عبر محفظة جيب — إيداع نقدي
          </div>
          <div className="space-y-1">
            <div>
              رقم الإيداع:{' '}
              <b className="text-lg tracking-wider" dir="ltr">
                {JEEB_DEPOSIT_NUMBER}
              </b>
            </div>
            <p className="text-gray-700 dark:text-gray-200">
              1) أودع أو حوّل المبلغ المطلوب إلى الرقم أعلاه عبر محفظة جيب.
              <br />
              2) أرسل <b>إشعار الإيداع</b> عبر واتساب إلى نفس الرقم.
              <br />
              3) اذكر في الرسالة: بريد حسابك أو رقم الطلب بعد إنشائه.
              <br />
              4) بعد التحقق يُضاف رصيد <b>REMO</b> إلى محفظتك.
            </p>
          </div>
          <a
            href={`https://wa.me/\( {JEEB_WHATSAPP}?text= \){encodeURIComponent(
              'السلام عليكم، تم إيداع مبلغ لشحن REMO في منصة محمد الحازمي AI.%0Aرقم الإيداع: ' +
                JEEB_DEPOSIT_NUMBER +
                '%0Aأرفق إشعار الإيداع.'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-green-600 text-white py-3 font-medium"
          >
            📤 إرسال إشعار الإيداع عبر واتساب
          </a>
          <p className="text-xs text-gray-500">
            بعد إنشاء طلب الشراء من الزر بالأسفل، أرسل الإشعار مع رقم الطلب إن ظهر لك.
          </p>
        </div>
      )}

      رقم العملية / المرجع (اختياري)</label>
      <input
        value={txRef}
        onChange={(e) => setTxRef(e.target.value)}
        placeholder="مثال: رقم تحويل جيب أو TxID"
        className="w-full rounded-xl border px-3 py-2 mb-4 text-sm bg-transparent"
      />

      <button
        type="button"
        disabled={loading || !method?.enabled}
        onClick={submit}
        className="w-full rounded-xl bg-blue-600 text-white py-3 font-medium disabled:opacity-50"
      >
        {loading ? 'جاري الإنشاء...' : 'تأكيد طلب الشراء'}
      </button>

      {msg && (
        <div
          className={`mt-4 rounded-xl p-3 text-sm ${
            last?.ok ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {msg}
          
          {last?.ok && methodId === 'jeeb' && (
            <a
              className="mt-2 inline-flex items-center justify-center w-full rounded-xl bg-green-600 text-white py-2 text-sm"
              target="_blank"
              rel="noopener noreferrer"
              href={`https://wa.me/\( {JEEB_WHATSAPP}?text= \){encodeURIComponent(
                'تم إنشاء طلب شحن REMO%0Aرقم الطلب: ' +
                  (last?.paymentId || '') +
                  '%0Aالمبلغ: ' +
                  (last?.amount || '') +
                  ' ' +
                  (last?.currency || '') +
                  '%0Aأرفق إشعار الإيداع لرقم ' +
                  JEEB_DEPOSIT_NUMBER
              )}`}
            >
              إرسال إشعار الإيداع على واتساب مع رقم الطلب
            </a>
          )}

          {last?.ok && last?.credits ? (
            <div className="mt-1">سيتم شحن {last.credits} REMO بعد التأكيد.</div>
          ) : null}
        </div>
      )}
    </div>
  )
}
