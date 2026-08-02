'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';

const supabase = getSupabase();

type Plan = {
  id: string;
  name: string;
  nameAr: string;
  price: number;
  badge?: string;
  chat: string;
  code: string;
  credits: number;
  features: string[];
  highlighted?: boolean;
};

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [current, setCurrent] = useState('Free');
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) {
        window.location.href = '/login';
        return;
      }
      try {
        const [pr, me] = await Promise.all([
          fetch('/api/subscription/plans').then((r) => r.json()),
          fetch('/api/user/me', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: session.user.email }),
          }).then((r) => r.json()),
        ]);
        setPlans(pr.plans || []);
        if (me.plan) setCurrent(me.plan);
        if (typeof me.credits === 'number') setCredits(me.credits);
      } catch {}
    })();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white" dir="rtl">
      <header className="border-b border-slate-800 bg-slate-900/90 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-xs text-slate-400 hover:text-white">← لوحة التحكم</Link>
            <h1 className="font-bold text-sm">💳 الخطط والاشتراكات</h1>
          </div>
          <div className="text-[11px] text-slate-400">
            خطتك: <span className="text-blue-400 font-bold">{current}</span>
            {credits !== null && <span className="mr-2 text-emerald-400">· {credits} Credit</span>}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <p className="text-slate-400 text-sm mb-6">
          الشات والبرمجة مجانيان بحدود في المجاني والهدية، وبلا حدود في الخطط المدفوعة. الوسائط تستهلك Credits.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((p) => {
            const active = current.toLowerCase() === p.id.toLowerCase();
            return (
              <div
                key={p.id}
                className={`rounded-2xl border p-5 flex flex-col ${
                  p.highlighted
                    ? 'border-blue-500 bg-blue-950/30 ring-1 ring-blue-500/30'
                    : 'border-slate-800 bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-bold text-lg">{p.nameAr}</h2>
                  {p.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {p.badge}
                    </span>
                  )}
                </div>
                <p className="text-3xl font-extrabold mb-1">
                  {p.price === 0 ? 'مجاناً' : `$${p.price}`}
                  {p.price > 0 && <span className="text-xs text-slate-500 font-normal"> / شهر</span>}
                </p>
                <ul className="text-xs text-slate-400 space-y-1.5 mb-4 flex-1">
                  <li>شات: {p.chat}</li>
                  <li>كود: {p.code}</li>
                  <li>Credits: {p.credits || 'حسب الكود/الدفع'}</li>
                  {p.features.map((f) => (
                    <li key={f}>• {f}</li>
                  ))}
                </ul>
                {active ? (
                  <span className="text-center text-xs font-bold text-emerald-400 py-2">خطتك الحالية</span>
                ) : p.id === 'Gift' ? (
                  <Link
                    href="/dashboard/gift"
                    className="text-center text-xs font-bold py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700"
                  >
                    إدخال كود هدية
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="text-xs font-bold py-2.5 rounded-xl bg-blue-600/80 hover:bg-blue-600"
                    onClick={() =>
                      alert('الدفع الحقيقي سيُربط في مرحلة بوابة الدفع. يمكنك تجربة كود الهدية الآن.')
                    }
                  >
                    ترقية (قريباً الدفع)
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
