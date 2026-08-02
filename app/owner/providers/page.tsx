'use client';
import { useEffect, useState } from 'react';
import OwnerPageShell from '@/components/owner/OwnerPageShell';
import { getSupabase, isSupabaseConfigured, supabaseConfigError } from '@/lib/supabase';

const supabase = getSupabase();

type Provider = {
  id: string;
  slug: string;
  name: string;
  category: string;
  isEnabled: boolean;
  priority: number;
  defaultModel: string | null;
  costPerUse: number;
  keys: { id: string; keyName: string; hasValue: boolean; masked: string; lastTestOk: boolean | null }[];
  models: { id: string; modelId: string; displayName: string; isDefault: boolean }[];
};

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    category: 'text',
    priority: 50,
    defaultModel: '',
    costPerUse: 5,
  });
  const [keyForm, setKeyForm] = useState<Record<string, string>>({});
  const [testing, setTesting] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/owner/providers');
      const data = await res.json();
      setProviders(data.providers || []);
    } catch {
      setMsg('تعذر تحميل المزودين');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setEmail(session?.user?.email || '');
      await load();
    })();
  }, []);

  const post = async (body: any) => {
    const res = await fetch('/api/owner/providers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل');
    return data;
  };

  const seed = async () => {
    try {
      const data = await post({ action: 'seed' });
      setMsg(data.message);
      await load();
    } catch (e: any) {
      setMsg(e.message);
    }
  };

  const toggle = async (id: string, isEnabled: boolean) => {
    try {
      await post({ action: 'toggle', id, isEnabled });
      await load();
    } catch (e: any) {
      setMsg(e.message);
    }
  };

  const saveKey = async (providerId: string) => {
    const keyValue = keyForm[providerId];
    if (!keyValue?.trim()) {
      setMsg('أدخل المفتاح');
      return;
    }
    try {
      await post({
        action: 'set-key',
        providerId,
        keyName: 'API_KEY',
        keyValue: keyValue.trim(),
      });
      setKeyForm((s) => ({ ...s, [providerId]: '' }));
      setMsg('تم حفظ المفتاح');
      await load();
    } catch (e: any) {
      setMsg(e.message);
    }
  };

  const testConn = async (providerId: string) => {
    setTesting(providerId);
    try {
      const data = await post({ action: 'test', providerId });
      setMsg(data.message || (data.success ? 'ناجح' : 'فشل'));
      await load();
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setTesting(null);
    }
  };

  const createProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await post({ action: 'create', ...form, isEnabled: false });
      setShowAdd(false);
      setForm({ name: '', slug: '', category: 'text', priority: 50, defaultModel: '', costPerUse: 5 });
      setMsg('تم إضافة المزود');
      await load();
    } catch (e: any) {
      setMsg(e.message);
    }
  };

  return (
    <OwnerPageShell
      title="إدارة مزودي الذكاء الاصطناعي 🤖"
      description="إضافة مزود · مفتاح API · اختبار · تفعيل · نموذج افتراضي · تكلفة · Fallback تلقائي"
    >
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={seed}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-bold border border-slate-700"
        >
          إنشاء المزودين الافتراضيين
        </button>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-bold"
        >
          + إضافة مزود جديد
        </button>
        <button onClick={load} className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white">
          تحديث
        </button>
      </div>

      {msg && (
        <div className="mb-4 p-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-emerald-400">
          {msg}
        </div>
      )}

      {/* شرح Fallback */}
      <div className="mb-6 rounded-2xl border border-blue-900/40 bg-blue-950/20 p-4 text-xs text-slate-400 leading-relaxed">
        <strong className="text-blue-300">نظام Fallback التلقائي:</strong> عند فشل مزود (مفتاح خاطئ أو عطل)،
        ينتقل النظام تلقائياً للمزود التالي حسب <strong className="text-white">الأولوية</strong> (الرقم الأصغر أولاً).
        مثال للصور: OpenAI Images → Stability → Replicate.
      </div>

      {showAdd && (
        <form onSubmit={createProvider} className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-5 grid sm:grid-cols-2 gap-3">
          <input
            required
            placeholder="الاسم (مثل OpenAI)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm"
          />
          <input
            required
            placeholder="المعرّف slug (مثل openai)"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase() })}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm"
            dir="ltr"
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm"
          >
            <option value="text">نصوص / دردشة</option>
            <option value="image">صور</option>
            <option value="video">فيديو</option>
            <option value="audio">صوت</option>
          </select>
          <input
            type="number"
            placeholder="الأولوية (10 = أعلى)"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm"
          />
          <input
            placeholder="النموذج الافتراضي"
            value={form.defaultModel}
            onChange={(e) => setForm({ ...form, defaultModel: e.target.value })}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm"
            dir="ltr"
          />
          <input
            type="number"
            placeholder="تكلفة Credit"
            value={form.costPerUse}
            onChange={(e) => setForm({ ...form, costPerUse: Number(e.target.value) })}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm"
          />
          <button type="submit" className="sm:col-span-2 py-2.5 bg-blue-600 rounded-xl text-sm font-bold">
            حفظ المزود
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-slate-500 text-sm">جاري التحميل...</p>
      ) : providers.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400 text-sm">
          لا يوجد مزودون بعد. اضغط «إنشاء المزودين الافتراضيين» للبدء.
        </div>
      ) : (
        <div className="space-y-4">
          {providers.map((p) => (
            <div
              key={p.id}
              className={`rounded-2xl border p-5 ${
                p.isEnabled ? 'border-emerald-900/50 bg-slate-900' : 'border-slate-800 bg-slate-900/60'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white">{p.name}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                      {p.slug}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                      {p.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    أولوية Fallback: <strong className="text-white">{p.priority}</strong>
                    {' · '}
                    النموذج: <span className="text-blue-400">{p.defaultModel || '—'}</span>
                    {' · '}
                    التكلفة: <span className="text-amber-400">{p.costPerUse} Credit</span>
                  </p>
                </div>
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <span>{p.isEnabled ? 'مفعّل' : 'متوقف'}</span>
                  <input
                    type="checkbox"
                    checked={p.isEnabled}
                    onChange={(e) => toggle(p.id, e.target.checked)}
                    className="w-4 h-4 accent-emerald-500"
                  />
                </label>
              </div>

              {/* API Key */}
              <div className="flex flex-col sm:flex-row gap-2 mb-3">
                <input
                  type="password"
                  placeholder={
                    p.keys[0]?.hasValue
                      ? `مفتاح محفوظ: ${p.keys[0].masked}`
                      : 'الصق API Key هنا'
                  }
                  value={keyForm[p.id] || ''}
                  onChange={(e) => setKeyForm({ ...keyForm, [p.id]: e.target.value })}
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs"
                  dir="ltr"
                />
                <button
                  onClick={() => saveKey(p.id)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold"
                >
                  حفظ المفتاح
                </button>
                <button
                  onClick={() => testConn(p.id)}
                  disabled={testing === p.id}
                  className="px-4 py-2 bg-blue-600/80 hover:bg-blue-600 rounded-xl text-xs font-bold disabled:opacity-50"
                >
                  {testing === p.id ? '...' : 'اختبار الاتصال'}
                </button>
              </div>

              {p.keys[0]?.lastTestOk !== null && p.keys[0]?.lastTestOk !== undefined && (
                <p className={`text-[11px] mb-2 ${p.keys[0].lastTestOk ? 'text-emerald-400' : 'text-red-400'}`}>
                  آخر اختبار: {p.keys[0].lastTestOk ? 'ناجح ✓' : 'فشل ✗'}
                </p>
              )}

              {p.models?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {p.models.map((m) => (
                    <span
                      key={m.id}
                      className={`text-[10px] px-2 py-0.5 rounded-full border ${
                        m.isDefault
                          ? 'border-blue-600 text-blue-300'
                          : 'border-slate-700 text-slate-500'
                      }`}
                    >
                      {m.displayName}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </OwnerPageShell>
  );
}
