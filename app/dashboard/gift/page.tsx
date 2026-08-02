'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';

const supabase = getSupabase();

export default function GiftPage() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [ok, setOk] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) {
        window.location.href = '/login';
        return;
      }
      setEmail(session.user.email);
    })();
  }, []);

  const redeem = async () => {
    if (!code.trim()) {
      setMsg('أدخل الكود');
      setOk(false);
      return;
    }
    setLoading(true);
    setMsg('');
    try {
      const res = await fetch('/api/gift/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل');
      setOk(true);
      setMsg(data.message || 'تم التفعيل');
    } catch (e: any) {
      setOk(false);
      setMsg(e.message || 'خطأ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white" dir="rtl">
      <header className="border-b border-slate-800 bg-slate-900/90 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="text-xs text-slate-400">← لوحة التحكم</Link>
          <h1 className="font-bold text-sm">🎁 كود الهدية</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-10 space-y-4">
        <p className="text-sm text-slate-400">
          أدخل كود الهدية الذي حصلت عليه من المالك لشحن الرصيد أو تفعيل خطة هدية.
        </p>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="مثال: GIFT-XXXX"
          className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm tracking-widest font-mono"
          dir="ltr"
        />
        <button
          onClick={redeem}
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl text-sm font-bold"
        >
          {loading ? 'جاري التفعيل...' : 'تفعيل الكود'}
        </button>
        {msg && (
          <div
            className={`p-3 rounded-xl text-sm border ${
              ok
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                : 'bg-red-950/40 border-red-800 text-red-300'
            }`}
          >
            {msg}
          </div>
        )}
        <Link href="/dashboard/plans" className="block text-center text-xs text-blue-400">
          عرض الخطط ←
        </Link>
      </div>
    </div>
  );
}
