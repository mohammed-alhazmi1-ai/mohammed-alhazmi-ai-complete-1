'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';

const supabase = getSupabase();

export default function OwnerUsersPage() {
  const [email, setEmail] = useState('');
  const [q, setQ] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [msg, setMsg] = useState('');

  const load = async (owner: string, query = '') => {
    const res = await fetch(
      `/api/owner/users?email=\( {encodeURIComponent(owner)}&q= \){encodeURIComponent(query)}`
    );
    const data = await res.json();
    if (!res.ok) setMsg(data.error || 'خطأ');
    else setUsers(data.users || []);
  };

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const em = session?.user?.email || '';
      setEmail(em);
      if (em) await load(em);
    })();
  }, []);

  return (<div className="min-h-screen bg-slate-950 text-white p-6" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <Link href="/owner" className="text-xs text-slate-400">← لوحة المالك</Link>
          <h1 className="font-bold">المستخدمون</h1>
        </div>
        <div className="flex gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث بريد / اسم"
            className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm" />
          <button type="button" onClick={() => load(email, q)}
            className="px-4 py-2 bg-blue-600 rounded-xl text-sm font-bold">بحث</button>
        </div>
        {msg && <p className="text-sm text-red-400">{msg}</p>}
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-900 text-slate-400 text-xs">
              <tr>
                <th className="p-3">البريد</th>
                <th className="p-3">الاسم</th>
                <th className="p-3">الخطة</th>
                <th className="p-3">الرصيد</th>
                <th className="p-3">الدور</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-slate-800">
                  <td className="p-3 font-mono text-xs">{u.email}</td>
                  <td className="p-3">{u.firstName} {u.lastName}</td>
                  <td className="p-3">{u.plan}</td>
                  <td className="p-3 text-emerald-400">{u.credits}</td>
                  <td className="p-3">{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500">لشحن رصيد مستخدم: /owner/payments</p>
      </div>
    </div>
  );
}
