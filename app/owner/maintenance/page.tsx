'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';

const supabase = getSupabase();

export default function MaintenancePage() {
  const [email, setEmail] = useState('');
  const [on, setOn] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setEmail(session?.user?.email || '');
      const res = await fetch('/api/owner/maintenance');
      const data = await res.json();
      setOn(!!data.maintenance);
    })();
  }, []);

  const toggle = async () => {
    const next = !on;
    const res = await fetch('/api/owner/maintenance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, maintenance: next }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error || 'فشل');
      return;
    }
    setOn(next);
    setMsg(next ? 'وضع الصيانة مفعّل — التوليد متوقف' : 'تم إيقاف الصيانة');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6" dir="rtl">
      <div className="max-w-md mx-auto space-y-4">
        <Link href="/owner" className="text-xs text-slate-400">← لوحة المالك</Link>
        <h1 className="font-bold text-xl">وضع الصيانة</h1>
        <p className="text-sm text-slate-400">عند التفعيل ترفض طبقة الخدمات طلبات التوليد.</p>
        <button
          type="button"
          onClick={toggle}
          className={`w-full py-3 rounded-xl font-bold text-sm ${on ? 'bg-red-600' : 'bg-emerald-600'}`}
        >
          {on ? 'الصيانة مفعّلة — اضغط للإيقاف' : 'المنصة تعمل — اضغط لتفعيل الصيانة'}
        </button>
        {msg && <p className="text-sm text-amber-300">{msg}</p>}
      </div>
    </div>
  );
}
