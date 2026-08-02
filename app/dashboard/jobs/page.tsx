'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';

const supabase = getSupabase();

type Job = {
  id: string;
  type: string;
  provider: string;
  prompt: string;
  result?: string | null;
  status: string;
  creditsUsed: number;
  errorMsg?: string | null;
  createdAt: string;
  finishedAt?: string | null;
};

const statusAr: Record<string, string> = {
  pending: 'قيد الانتظار',
  processing: 'قيد التنفيذ',
  completed: 'مكتمل',
  failed: 'فشل',
};

const statusColor: Record<string, string> = {
  pending: 'text-slate-400 bg-slate-800',
  processing: 'text-amber-400 bg-amber-950/50',
  completed: 'text-emerald-400 bg-emerald-950/50',
  failed: 'text-red-400 bg-red-950/50',
};

export default function JobsPage() {
  const [email, setEmail] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) {
        window.location.href = '/login';
        return;
      }
      const em = session.user.email;
      setEmail(em);
      try {
        const res = await fetch('/api/jobs?email=' + encodeURIComponent(em));
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'فشل التحميل');
        setJobs(data.jobs || []);
      } catch (e: any) {
        setError(e.message || 'خطأ');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white" dir="rtl">
      <header className="border-b border-slate-800 bg-slate-900/90 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-xs text-slate-400 hover:text-white">← لوحة التحكم</Link>
            <h1 className="font-bold text-sm">📋 سجل الطلبات</h1>
          </div>
          <span className="text-[10px] text-slate-500">{jobs.length} طلب</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        {loading && <p className="text-slate-500 text-sm">جاري التحميل...</p>}
        {error && <div className="p-3 rounded-xl bg-red-950/40 border border-red-900 text-red-400 text-sm">{error}</div>}
        {!loading && !error && jobs.length === 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400 text-sm">
            لا توجد طلبات بعد. جرّب التوليد من أحد أقسام الخدمات.
          </div>
        )}

        {jobs.map((job) => (
          <div key={job.id} className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenId(openId === job.id ? null : job.id)}
              className="w-full text-right p-4 flex flex-wrap items-center justify-between gap-2 hover:bg-slate-800/40 transition"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${statusColor[job.status] || statusColor.pending}`}>
                  {statusAr[job.status] || job.status}
                </span>
                <span className="text-xs text-slate-400">{job.type}</span>
                <span className="text-[10px] text-slate-600 font-mono">{job.provider}</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-slate-500">
                {job.creditsUsed > 0 && <span className="text-amber-400">−{job.creditsUsed} Credit</span>}
                <span>{new Date(job.createdAt).toLocaleString('ar')}</span>
              </div>
            </button>
            {openId === job.id && (
              <div className="px-4 pb-4 space-y-2 border-t border-slate-800 pt-3">
                <p className="text-xs text-slate-400">الطلب:</p>
                <p className="text-sm text-slate-200 whitespace-pre-wrap bg-slate-950 rounded-xl p-3 border border-slate-800">
                  {job.prompt}
                </p>
                {job.result && (
                  <>
                    <p className="text-xs text-slate-400">النتيجة:</p>
                    <p className="text-sm text-slate-300 whitespace-pre-wrap bg-slate-950 rounded-xl p-3 border border-slate-800 max-h-64 overflow-y-auto">
                      {job.result}
                    </p>
                  </>
                )}
                {job.errorMsg && (
                  <p className="text-xs text-red-400">خطأ: {job.errorMsg}</p>
                )}
                <p className="text-[10px] text-slate-600 font-mono">#{job.id.slice(0, 8)}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
