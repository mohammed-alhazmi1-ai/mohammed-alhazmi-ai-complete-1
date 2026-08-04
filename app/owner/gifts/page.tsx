'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';

const supabase = getSupabase();

export default function OwnerGiftsPage() {
  const [email, setEmail] = useState('');
  const [credits, setREMOs] = useState(100);
  const [planType, setPlanType] = useState('Gift');
  const [codes, setCodes] = useState<any[]>([]);
  const [msg, setMsg] = useState('');
  const [created, setCreated] = useState('');

  const load = async (owner: string) => {
    const res = await fetch(`/api/owner/gifts?email=${encodeURIComponent(owner)}`);
    const data = await res.json();
    if (data.warning) setMsg(data.warning);
    setCodes(data.codes || []);
  };

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const em = session?.user?.email || '';
      setEmail(em);
      if (em) await load(em);
    })();
  }, []);

  const create = async () => {
    setMsg('');
    setCreated('');
    const res = await fetch('/api/owner/gifts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ownerEmail: email, credits, planType }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error || 'فشل');
      return;
    }
    setCreated(data.code?.code || '');
    setMsg('تم إنشاء الكود');
    await load(email);
  };

  return (<div className="min-h-screen bg-slate-950 text-white p-6" dir="rtl">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <Link href="/owner" className="text-xs text-slate-400">← لوحة المالك</Link>
          <h1 className="font-bold">أكواد الهدايا</h1>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-3">
          <label className="text-xs text-slate-400">الرصيد المضاف</label>
          <input type="number" value={credits} onChange={(e) => setREMOs(Number(e.target.value))}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm" />
          <label className="text-xs text-slate-400">نوع الخطة</label>
          <select value={planType} onChange={(e) => setPlanType(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm">
            <option value="Gift">Gift</option>
            <option value="Pro">Pro</option>
            <option value="Free">Free</option>
          </select>
          <button type="button" onClick={create} className="px-6 py-2.5 bg-blue-600 rounded-xl text-sm font-bold">
            إنشاء كود
          </button>
          {created && (
            <p className="text-emerald-400 font-mono text-lg tracking-widest">{created}</p>
          )}
          {msg && <p className="text-sm text-amber-300">{msg}</p>}
        </div>
        <div className="space-y-2">
          {codes.map((c) => (
            <div key={c.id || c.code} className="flex justify-between text-sm border border-slate-800 rounded-xl p-3">
              <span className="font-mono">{c.code}</span>
              <span className="text-slate-400">{c.credits ?? c.creditAmount} Cr · {c.isUsed ? 'مستخدم' : 'متاح'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
