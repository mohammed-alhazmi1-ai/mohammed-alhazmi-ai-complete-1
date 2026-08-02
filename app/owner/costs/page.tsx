'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';

const supabase = getSupabase();

export default function OwnerCostsPage() {
  const [email, setEmail] = useState('');
  const [costs, setCosts] = useState<any[]>([]);
  const [msg, setMsg] = useState('');

  const load = async (owner: string) => {
    const res = await fetch(`/api/owner/costs?email=${encodeURIComponent(owner)}`);
    const data = await res.json();
    setCosts(data.costs || []);
    if (data.warning) setMsg(data.warning);
  };

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const em = session?.user?.email || '';
      setEmail(em);
      if (em) await load(em);
    })();
  }, []);

  const save = async (row: any) => {
    const res = await fetch('/api/owner/costs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ownerEmail: email,
        serviceKey: row.serviceKey,
        creditsCost: row.creditsCost,
        displayName: row.displayName,
        isActive: row.isActive !== false,
      }),
    });
    const data = await res.json();
    setMsg(res.ok ? 'تم الحفظ' : data.error || 'فشل');
    await load(email);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6" dir="rtl">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <Link href="/owner" className="text-xs text-slate-400">← لوحة المالك</Link>
          <h1 className="font-bold">تكاليف الخدمات</h1>
        </div>
        <p className="text-xs text-slate-500">الشات والبرمجة = 0 (مجاني بحدود). الوسائط بالـ Credits.</p>
        {costs.map((c, i) => (
          <div key={c.serviceKey || i} className="flex flex-wrap items-center gap-2 border border-slate-800 rounded-xl p-3">
            <span className="text-sm flex-1">{c.displayName || c.serviceKey}</span>
            <input
              type="number"
              className="w-24 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-sm"
              value={c.creditsCost}
              onChange={(e) => {
                const v = Number(e.target.value);
                setCosts((prev) => prev.map((x, j) => (j === i ? { ...x, creditsCost: v } : x)));
              }}
            />
            <button type="button" onClick={() => save(c)} className="px-3 py-1 bg-blue-600 rounded-lg text-xs font-bold">
              حفظ
            </button>
          </div>
        ))}
        {msg && <p className="text-sm text-emerald-400">{msg}</p>}
      </div>
    </div>
  );
}
