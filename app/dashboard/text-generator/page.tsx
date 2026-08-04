'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSupabase, isSupabaseConfigured, supabaseConfigError } from '@/lib/supabase';

const supabase = getSupabase();

export default function TextGeneratorPage() {
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('احترافي ورسمي');
  const [provider, setProvider] = useState('gemini');
  const [length, setLength] = useState('متوسط');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [credits, setREMOs] = useState<number | null>(null);
  const [providers, setProviders] = useState<{ slug: string; name: string }[]>([]);
  const [meta, setMeta] = useState('');

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) {
        window.location.href = '/login';
        return;
      }
      setEmail(session.user.email);
      try {
        const res = await fetch('/api/user/me', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: session.user.email }),
        });
        const data = await res.json();
        if (typeof data.credits === 'number') setREMOs(data.credits);
      } catch {}
      try {
        const pr = await fetch('/api/providers');
        const pdata = await pr.json();
        const list = pdata.providers || [];
        setProviders(list);
        if (list[0]) setProvider(list[0].slug);
      } catch {}
    })();
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('أدخل نص الطلب');
      return;
    }
    setLoading(true);
    setError('');
    setResult('');
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          tone,
          model: provider === 'openai' ? 'GPT-4o Mini' : 'Gemini 1.5 Flash',
          length,
          email,
          provider,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'فشل التوليد');
      setResult(data.result);
      if (typeof data.creditsRemaining === 'number') setREMOs(data.creditsRemaining);
      setMeta(`${data.provider} · ${data.model}${data.usedFallback ? ' · Fallback' : ''}`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-dashboard="user" className="min-h-screen w-full max-w-lg mx-auto px-3 pb-24 sm:px-4">
<div className="min-h-screen bg-slate-950 text-white p-6 md:p-10" dir="rtl">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-3">
          <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white">
            ← لوحة التحكم
          </Link>
          {credits !== null && (
            <span className="text-xs text-emerald-400 font-bold">الرصيد: {credits} REMO</span>
          )}
        </div>
        <h1 className="text-2xl font-bold">مولد النصوص ✍️</h1>

        <div>
          <label className="text-xs text-slate-400 mb-2 block">المزود</label>
          <div className="flex flex-wrap gap-2 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            {providers.map((p) => (
              <button
                key={p.slug}
                type="button"
                onClick={() => setProvider(p.slug)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border ${
                  provider === p.slug
                    ? 'bg-blue-600 border-blue-500'
                    : 'bg-slate-900 border-slate-700'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={5}
          placeholder="اكتب طلبك..."
          className="w-full p-4 bg-slate-900 border border-slate-800 rounded-2xl text-sm focus:outline-none focus:border-blue-500"
        />
        <div className="grid sm:grid-cols-2 gap-3">
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm"
          >
            <option>احترافي ورسمي</option>
            <option>ودي وبسيط</option>
            <option>تسويقي</option>
            <option>إبداعي</option>
          </select>
          <select
            value={length}
            onChange={(e) => setLength(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm"
          >
            <option>قصير</option>
            <option>متوسط</option>
            <option>طويل</option>
          </select>
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl font-bold text-sm"
        >
          {loading ? 'جاري التوليد...' : 'توليد (5 REMOs)'}
        </button>
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 min-h-[120px] text-sm whitespace-pre-wrap text-slate-300">
          {meta && <p className="text-[10px] text-slate-500 mb-2 font-mono">{meta}</p>}
          {result || 'النتيجة ستظهر هنا...'}
        </div>
      </div>
    </div>
  );
}
