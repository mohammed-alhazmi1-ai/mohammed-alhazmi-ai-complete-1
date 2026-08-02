'use client';
import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase';

const supabase = getSupabase();

export default function PaymentSettingsPage() {
  const [email, setEmail] = useState('');
  const [form, setForm] = useState({
    binanceAddress: '',
    binanceNetwork: 'TRC20',
    cryptoAddress: '',
    cryptoNetwork: 'TRC20',
    jeebAccount: '',
    jeebName: '',
    usdToYer: 530,
    supportNote: '',
  });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setEmail(session?.user?.email || '');
      const res = await fetch('/api/owner/payment-settings');
      const data = await res.json();
      if (data.settings) setForm((f) => ({ ...f, ...data.settings }));
    })();
  }, []);

  const save = async () => {
    setMsg('');
    const res = await fetch('/api/owner/payment-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, email }),
    });
    const data = await res.json();
    setMsg(res.ok ? 'تم الحفظ' : data.error || 'فشل');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10" dir="rtl">
      <div className="max-w-xl space-y-4">
        <h1 className="text-xl font-bold">إعدادات طرق الدفع</h1>
        <p className="text-xs text-slate-500">عناوين بينانس والعملات الرقمية وحساب محفظة جيب — تظهر تعليماتها للمستخدم عند الطلب.</p>

        <label className="block text-xs text-slate-400">عنوان بينانس (USDT)</label>
        <input className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm" dir="ltr"
          value={form.binanceAddress} onChange={(e) => setForm({ ...form, binanceAddress: e.target.value })} />
        <input className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm" dir="ltr"
          value={form.binanceNetwork} onChange={(e) => setForm({ ...form, binanceNetwork: e.target.value })} placeholder="الشبكة مثل TRC20" />

        <label className="block text-xs text-slate-400">محفظة رقمية أخرى</label>
        <input className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm" dir="ltr"
          value={form.cryptoAddress} onChange={(e) => setForm({ ...form, cryptoAddress: e.target.value })} />

        <label className="block text-xs text-slate-400">رقم/حساب محفظة جيب</label>
        <input className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm"
          value={form.jeebAccount} onChange={(e) => setForm({ ...form, jeebAccount: e.target.value })} />
        <input className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm"
          value={form.jeebName} onChange={(e) => setForm({ ...form, jeebName: e.target.value })} placeholder="اسم صاحب الحساب" />

        <label className="block text-xs text-slate-400">سعر الصرف (كم ريال لكل 1 دولار)</label>
        <input type="number" className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm"
          value={form.usdToYer} onChange={(e) => setForm({ ...form, usdToYer: Number(e.target.value) })} />

        <label className="block text-xs text-slate-400">ملاحظة للدعم</label>
        <textarea className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm" rows={2}
          value={form.supportNote} onChange={(e) => setForm({ ...form, supportNote: e.target.value })} />

        <button type="button" onClick={save} className="px-6 py-2.5 bg-blue-600 rounded-xl text-sm font-bold">حفظ</button>
        {msg && <p className="text-sm text-emerald-400">{msg}</p>}
      </div>
    </div>
  );
}
