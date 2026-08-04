'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';

const supabase = getSupabase();

type Limits = {
  chatLimit: number | null;
  codeLimit: number | null;
  chatUsed: number;
  codeUsed: number;
  chatRemaining: number | null;
  codeRemaining: number | null;
  unlimitedChat: boolean;
  unlimitedCode: boolean;
};

export default function UsageBar() {
  const [credits, setREMOs] = useState<number | null>(null);
  const [plan, setPlan] = useState('Free');
  const [limits, setLimits] = useState<Limits | null>(null);
  const [username, setUsername] = useState('');

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) return;
      try {
        const res = await fetch('/api/user/me', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: session.user.email }),
        });
        const data = await res.json();
        if (typeof data.credits === 'number') setREMOs(data.credits);
        if (data.plan) setPlan(data.plan);
        if (data.limits) setLimits(data.limits);
        if (data.username || data.firstName) setUsername(data.username || data.firstName);
      } catch { /* ignore */ }
    })();
  }, []);

  return (
    <div className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-2 py-2 flex flex-row flex-wrap items-center gap-2 justify-between text-[11px] sm:text-xs">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        {username && <span className="font-bold text-white">{username}</span>}
        <span className="text-xs px-2 py-1 rounded-lg bg-blue-950/50 border border-blue-900 text-blue-300">
          {plan}
        </span>
        <span className="text-xs px-2 py-1 rounded-lg bg-emerald-950/40 border border-emerald-900 text-emerald-400 font-bold">
          {credits === null ? '...' : credits} REMO
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
        {limits && (
          <>
            <span className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800">
              شات:{' '}
              {limits.unlimitedChat
                ? 'بلا حدود'
                : `${limits.chatRemaining ?? 0} / ${limits.chatLimit}`}
            </span>
            <span className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800">
              كود:{' '}
              {limits.unlimitedCode
                ? 'بلا حدود'
                : `${limits.codeRemaining ?? 0} / ${limits.codeLimit}`}
            </span>
          </>
        )}
        <Link href="/dashboard/jobs" className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold">
          سجل الطلبات ←
        </Link>
        <Link href="/dashboard/files" className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold">
          ملفاتي ←
        </Link>
      </div>
    </div>
  );
}
