'use client'

import Link from 'next/link'
import { SUBSCRIPTION_PLANS } from '@/lib/plans-and-payments'

export default function PlansPage() {
  return (
    <div className="mx-auto max-w-4xl px-3 py-4 sm:px-4" dir="rtl">
      <h1 className="text-xl font-bold mb-2">باقات الاشتراك</h1>
      <p className="text-sm text-gray-500 mb-4">خطط متنوعة للأفراد والأعمال — الدفع بوحدة REMO والخدمات</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {SUBSCRIPTION_PLANS.filter((p) => p.id !== 'gift').map((p) => (
          <div
            key={p.id}
            className={`rounded-2xl border p-4 flex flex-col ${
              p.popular ? 'border-blue-500 shadow-md' : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="font-bold text-lg">{p.name}</div>
            <div className="text-2xl font-semibold my-2">
              {p.priceUsd === 0 ? 'مجاناً' : ` \]{p.priceUsd}`}
              {p.priceUsd > 0 ? <span className="text-sm font-normal text-gray-500">/شهر</span> : null}
            </div>
            <div className="text-sm text-blue-600 mb-2">{p.monthlyRemo} REMO</div>
            <ul className="text-xs space-y-1 flex-1 mb-3">
              {p.features.map((f) => (
                <li key={f}>✓ {f}</li>
              ))}
            </ul>
            <Link
              href="/dashboard/billing"
              className="block text-center rounded-xl bg-blue-600 text-white py-2 text-sm"
            >
              اختر الباقة
            </Link>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-4">
        خطة الهدية تُفعّل من كود في لوحة المالك وليس من الشراء المباشر.
      </p>
    </div>
  )
}
