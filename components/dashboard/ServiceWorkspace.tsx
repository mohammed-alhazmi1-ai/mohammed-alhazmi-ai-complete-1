'use client';
import FileActions from '@/components/dashboard/FileActions';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { ALL_TEMPLATES, type ServiceKey, type Template } from '@/lib/templates';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { getSupabase } from '@/lib/supabase';

const supabase = getSupabase();

const SERVICE_META: Record<
  ServiceKey,
  {
    icon: string;
    titleKey: 'images' | 'video' | 'music' | 'code' | 'chat';
    color: string;
    executes: boolean;
    defaultCost: number;
  }
> = {
  images: { icon: '🖼️', titleKey: 'images', color: 'from-blue-600/20 border-blue-800/40', executes: true, defaultCost: 15 },
  video: { icon: '🎬', titleKey: 'video', color: 'from-purple-600/20 border-purple-800/40', executes: true, defaultCost: 25 },
  music: { icon: '🎵', titleKey: 'music', color: 'from-emerald-600/20 border-emerald-800/40', executes: true, defaultCost: 20 },
  code: { icon: '💻', titleKey: 'code', color: 'from-amber-600/20 border-amber-800/40', executes: true, defaultCost: 5 },
  chat: { icon: '🤖', titleKey: 'chat', color: 'from-rose-600/20 border-rose-800/40', executes: true, defaultCost: 5 },
};

type ProviderOpt = { slug: string; name: string; defaultModel: string | null; models: string[] };

export default function ServiceWorkspace({ service }: { service: ServiceKey }) {
  const { lang, t, dir } = useLanguage();
  const meta = SERVICE_META[service];
  const templates = ALL_TEMPLATES[service];
  const [selected, setSelected] = useState<Template | null>(null);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [creditsLeft, setREMOsLeft] = useState<number | null>(null);
  const [providers, setProviders] = useState<ProviderOpt[]>([]);
  const [provider, setProvider] = useState('');
  const [metaInfo, setMetaInfo] = useState('');
  const [lastCost, setLastCost] = useState<number | null>(null);
  const [cost, setCost] = useState(meta.defaultCost);
  const [attachedName, setAttachedName] = useState('');
  const [attachedDataUrl, setAttachedDataUrl] = useState('');
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) {
        window.location.href = '/login';
        return;
      }
      setUserEmail(session.user.email);
      try {
        const res = await fetch('/api/user/me', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: session.user.email }),
        });
        const data = await res.json();
        if (typeof data.credits === 'number') setREMOsLeft(data.credits);
      } catch {}
      try {
        const pr = await fetch('/api/providers');
        const pdata = await pr.json();
        const list: ProviderOpt[] = pdata.providers || [];
        setProviders(list);
        if (list.length) setProvider(list[0].slug);
      } catch {}
      try {
        const cr = await fetch('/api/service-cost?service=' + service);
        const cd = await cr.json();
        if (typeof cd.cost === 'number') setCost(cd.cost);
      } catch {
        setCost(meta.defaultCost);
      }
    })();
  }, [service, meta.defaultCost]);

  const pickTemplate = (tpl: Template) => {
    setSelected(tpl);
    setPrompt(lang === 'ar' ? tpl.promptAr : tpl.promptEn);
    setResult('');
    setResultUrl(null);
    setError('');
    setMetaInfo('');
    setLastCost(null);
  };

  const buildPromptForService = (userPrompt: string) => {
    if (service === 'images') {
      return `أنت مساعد تصميم صور بالذكاء الاصطناعي. اكتب وصفاً تفصيلياً جاهزاً لمولد الصور (prompt إنجليزي احترافي) + شرح عربي قصير، لطلب:\n${userPrompt}`;
    }
    if (service === 'video') {
      return `أنت مخرج فيديو بالذكاء الاصطناعي. قدّم سيناريو مشاهد + نص تعليق + مدة، لطلب:\n${userPrompt}`;
    }
    if (service === 'music') {
      return `أنت منتج موسيقي. اكتب كلمات/هيكل أغنية أو شيلة أو زفة مع وصف اللحن، لطلب:\n${userPrompt}`;
    }
    if (service === 'code') {
      return `أنت مطور محترف. اكتب الكود كاملاً مع شرح مختصر:\n${userPrompt}`;
    }
    return userPrompt;
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError(lang === 'ar' ? 'اكتب أو اختر قالباً أولاً' : 'Write or pick a template first');
      return;
    }
    if (creditsLeft !== null && creditsLeft < cost) {
      setError(
        lang === 'ar'
          ? `رصيد غير كافٍ. المطلوب ${cost} والمتاح ${creditsLeft}`
          : `Insufficient credits. Need ${cost}, have ${creditsLeft}`
      );
      return;
    }
    setLoading(true);
    setError('');
    setResult('');
    setMetaInfo('');
    setLastCost(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: buildPromptForService(prompt) + (attachedName ? `\n\n[مرفق: ${attachedName}]` : ''),
          attachment: attachedDataUrl || undefined,
          attachmentName: attachedName || undefined,
          type: service,
          service: service,
          serviceType: service,
          email: userEmail,
          provider: provider || undefined,
          serviceCost: cost,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.ok === false) {
        throw new Error(data.error || data.text || 'فشل التوليد');
      }
      // توافق مع API: text | result | imageUrl
      let out = data.text || data.result || '';
      if (data.imageUrl) {
        out = (out ? out + '\n\n' : '') + '🖼️ صورة:\n' + data.imageUrl;
      }
      if (!out && data.error) out = data.error;
      setResultUrl(data.imageUrl || null);
      setResult(out || (lang === 'ar' ? 'اكتمل بدون نص.' : 'Done (empty text).'));
      if (typeof data.creditsLeft === 'number') setREMOsLeft(data.creditsLeft);
      else if (typeof data.creditsRemaining === 'number') setREMOsLeft(data.creditsRemaining);
      if (typeof data.cost === 'number') setLastCost(data.cost);
      else if (typeof data.creditsUsed === 'number') setLastCost(data.creditsUsed);
      setMetaInfo(
        [
          data.provider || provider,
          data.model,
          data.usedFallback ? 'Fallback' : null,
          data.jobId ? `طلب #${String(data.jobId).slice(0, 8)}` : null,
        ]
          .filter(Boolean)
          .join(' · ')
      );
    } catch (e: any) {
      setError(e.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100" dir={dir}>
      <header className="border-b border-slate-800 bg-slate-900/80 sticky top-0 z-40 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-xs text-slate-400 hover:text-white">← {t('back')}</Link>
            <span className="text-xl">{meta.icon}</span>
            <h1 className="font-bold text-white text-sm sm:text-base">{t(meta.titleKey)}</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${creditsLeft !== null && creditsLeft < cost ? 'text-red-400 bg-red-950/40 border-red-900/50' : 'text-emerald-400 bg-emerald-950/40 border-emerald-900/50'}`}>
              {lang === 'ar' ? 'الرصيد:' : 'Balance:'} {creditsLeft === null ? '...' : creditsLeft} REMO
            </span>
            <Link href="/dashboard/jobs" className="text-[10px] text-slate-400 hover:text-white px-2 py-1 rounded-lg border border-slate-800">السجل</Link>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <div className="rounded-2xl border border-amber-900/40 bg-amber-950/20 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-amber-200">
            {lang === 'ar' ? 'تكلفة هذا الطلب:' : 'Cost:'}{' '}
            <strong className="text-amber-400 text-lg">{cost} REMO</strong>
          </p>
          <p className="text-xs text-slate-400">
            {lang === 'ar' ? 'يُخصم بعد نجاح التوليد ويُحفظ الطلب' : 'Deducted after success; request is saved'}
          </p>
        </div>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <label className="block text-xs text-slate-400 mb-2">{lang === 'ar' ? 'اختر مزود الذكاء الاصطناعي' : 'Choose AI Provider'}</label>
          <div className="flex flex-wrap gap-2">
            {providers.length === 0 ? (
              <span className="text-xs text-slate-500">{lang === 'ar' ? 'لا يوجد مزود — أضف مفاتيح AI في .env' : 'No providers'}</span>
            ) : (
              providers.map((p) => (
                <button key={p.slug} type="button" onClick={() => setProvider(p.slug)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${provider === p.slug ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-950 border-slate-700 text-slate-300'}`}>
                  {p.name}
                </button>
              ))
            )}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-1">{t('chooseTemplate')}</h2>
          <p className="text-slate-500 text-xs mb-4">{t('customizePrompt')}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {templates.map((tpl) => (
              <button key={tpl.id} type="button" onClick={() => pickTemplate(tpl)}
                className={`text-right rounded-2xl border p-4 transition-all ${selected?.id === tpl.id ? 'border-blue-500 bg-blue-950/40' : 'border-slate-800 bg-slate-900 hover:border-slate-600'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{tpl.icon || '✨'}</span>
                  <span className="font-bold text-white text-sm">{lang === 'ar' ? tpl.titleAr : tpl.titleEn}</span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2">{(lang === 'ar' ? tpl.promptAr : tpl.promptEn).slice(0, 80)}…</p>
              </button>
            ))}
          </div>
        </section>

        <section className={`rounded-3xl border bg-gradient-to-l ${meta.color} border-slate-800 p-5 sm:p-6 space-y-4`}>
          <label className="block text-xs font-medium text-slate-400">{t('orWriteOwn')}</label>
          <textarea rows={5} value={prompt} onChange={(e) => setPrompt(e.target.value)}
            placeholder={lang === 'ar' ? 'اكتب تفاصيل طلبك هنا...' : 'Write your prompt...'}
            className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-white text-sm focus:outline-none focus:border-blue-500 resize-y min-h-[120px]" />
          {error && <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-400 text-xs">{error}</div>}
          <button onClick={handleGenerate} disabled={loading}
            className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-bold rounded-xl text-sm">
                {loading ? (lang === 'ar' ? 'جاري التوليد...' : 'Generating...') : `✨ ${lang === 'ar' ? 'توليد' : 'Generate'} (− ${cost} REMO)`}
          </button>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
          <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
            <h3 className="text-xs font-bold text-slate-400">{t('result')}</h3>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
              {lastCost !== null && <span className="text-amber-400">−{lastCost} REMO</span>}
              {metaInfo && <span>{metaInfo}</span>}
            </div>
          </div>
          <div className="min-h-[140px] p-4 bg-slate-950 border border-slate-800 rounded-2xl text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
            {result || (lang === 'ar' ? 'ستظهر النتيجة هنا بعد التوليد...' : 'Result will appear here...')}
          </div>
          <div className="mt-3">
            <FileActions resultText={result} resultUrl={resultUrl} />
          </div>
          <div className="hidden">
          </div>
        </section>
      </div>
    </div>
  );
}
