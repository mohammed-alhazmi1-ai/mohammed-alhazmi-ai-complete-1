import Link from 'next/link';
import { PLANS } from '@/lib/subscription/plans';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="text-sm text-slate-400 hover:text-white">← العودة للرئيسية</Link>
        <h1 className="text-3xl font-bold mt-6 mb-8 text-center">الخطط والاشتراكات</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div key={plan.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h3 className="text-xl font-bold">{plan.nameAr}</h3>
              <p className="text-3xl text-blue-400 font-bold mt-2">
                {plan.price === 0 ? 'مجاناً' : `$${plan.price}`}
              </p>
              <p className="text-green-400 mt-1">{plan.credits.toLocaleString()} Credit</p>
              <ul className="mt-4 space-y-1 text-sm text-slate-400">
                {plan.features.map((f) => (
                  <li key={f}>✔ {f}</li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="mt-6 block text-center rounded-xl bg-blue-600 hover:bg-blue-500 py-2.5 font-bold text-sm"
              >
                اختيار الخطة
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
