'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { getSupabase, isSupabaseConfigured, supabaseConfigError } from '@/lib/supabase';

const supabase = getSupabase();

type Msg = {
  role: 'user' | 'bot';
  text: string;
  meta?: string;
  link?: string;
};

export default function BotPage() {
  const [email, setEmail] = useState('');
  const [credits, setREMOs] = useState<number | null>(null);
  const [providers, setProviders] = useState<{ slug: string; name: string }[]>([]);
  const [provider, setProvider] = useState('');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'bot',
      text: 'مرحباً 👋 أنا المساعد الذكي لمنصة محمد الحزمي.\nاكتب طلبك مثل: «اكتب مقالاً عن...» أو «أريد صورة لمنتج» وسأوجّهك أو أنفّذ مباشرة.',
    },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', text }]);
    setLoading(true);
    try {
      const res = await fetch('/api/bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          email,
          provider: provider || undefined,
          execute: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل');

      if (data.type === 'redirect') {
        setMessages((m) => [
          ...m,
          {
            role: 'bot',
            text: data.reply,
            link: data.servicePath,
            meta: data.category,
          },
        ]);
      } else {
        setMessages((m) => [
          ...m,
          {
            role: 'bot',
            text: data.reply,
            meta: `${data.provider || ''} · ${data.model || ''}`,
          },
        ]);
        if (typeof data.creditsRemaining === 'number') setREMOs(data.creditsRemaining);
      }
    } catch (e: any) {
      setMessages((m) => [...m, { role: 'bot', text: '⚠️ ' + (e.message || 'خطأ') }]);
    } finally {
      setLoading(false);
    }
  };

  return (<div className="min-h-screen bg-slate-950 text-white flex flex-col" dir="rtl">
      <header className="border-b border-slate-800 bg-slate-900/90 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-xs text-slate-400 hover:text-white">
              ← لوحة التحكم
            </Link>
            <h1 className="font-bold text-sm">🤖 المساعد الذكي</h1>
          </div>
          <div className="flex items-center gap-2">
            {credits !== null && (
              <span className="text-xs text-emerald-400 font-bold">{credits} REMO</span>
            )}
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg text-xs px-2 py-1.5"
            >
              {providers.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
              {providers.length === 0 && <option value="">تلقائي</option>}
            </select>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 space-y-4 overflow-y-auto">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900 border border-slate-800 text-slate-200'
              }`}
            >
              {msg.text}
              {msg.meta && (
                <p className="text-[10px] mt-2 opacity-60 font-mono">{msg.meta}</p>
              )}
              {msg.link && (
                <Link
                  href={msg.link}
                  className="inline-block mt-2 text-xs text-blue-400 hover:underline"
                >
                  فتح القسم ←
                </Link>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-left text-xs text-slate-500">جاري المعالجة...</div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-slate-800 bg-slate-900 p-4">
        <div className="max-w-3xl mx-auto flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="اكتب أمرك أو سؤالك..."
            className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={send}
            disabled={loading}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl text-sm font-bold"
          >
            إرسال
          </button>
        </div>
      </div>
    </div>
  );
}
