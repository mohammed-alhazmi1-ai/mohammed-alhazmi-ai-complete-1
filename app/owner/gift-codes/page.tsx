'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

type GiftCode = {
  id: string;
  code: string;
  planType: string;
  creditsReward: number;
  durationDays: number;
  usedCount: number;
  maxUses: number;
  expiresAt: string | null;
  createdAt: string;
};

export default function OwnerGiftCodesPage() {
  const [codes, setCodes] = useState<GiftCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Form
  const [planType, setPlanType] = useState('Gift');
  const [creditsReward, setCreditsReward] = useState(200);
  const [durationDays, setDurationDays] = useState(30);
  const [maxUses, setMaxUses] = useState(1);
  const [count, setCount] = useState(1);
  const [customCode, setCustomCode] = useState('');

  const loadCodes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/owner/gift-codes');
      const data = await res.json();
      if (res.ok) setCodes(data.codes || []);
    } catch {
      setError('فشل تحميل الأكواد');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCodes();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setMessage('');
    setError('');
    try {
      const res = await fetch('/api/owner/gift-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType,
          creditsReward,
          durationDays,
          maxUses,
          count,
          customCode: customCode || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل الإنشاء');
      setMessage(data.message + (data.codes?.length ? ` — ${data.codes.map((c: GiftCode) => c.code).join(', ')}` : ''));
      setCustomCode('');
      loadCodes();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">أكواد الهدايا 🎁</h1>
          <p className="text-slate-400 text-sm mt-1">إنشاء وإدارة أكواد تفعيل الخطط والهدايا</p>
        </div>
        <Link href="/owner/dashboard" className="text-xs text-slate-400 hover:text-white">
          ← لوحة المالك
        </Link>
      </div>

      {/* Create form */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8">
        <h2 className="text-lg font-bold text-white mb-6">إنشاء كود هدية جديد</h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">نوع الخطة</label>
            <select
              value={planType}
              onChange={(e) => setPlanType(e.target.value)}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
            >
              <option value="Gift">هدية (Gift)</option>
              <option value="Pro">احترافية (Pro)</option>
              <option value="Business">أعمال (Business)</option>
              <option value="VIP">VIP</option>
              <option value="Free">مجانية (Free)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">رصيد النقاط (Credits)</label>
            <input
              type="number"
              min={0}
              value={creditsReward}
              onChange={(e) => setCreditsReward(Number(e.target.value))}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">مدة الصلاحية (أيام)</label>
            <input
              type="number"
              min={1}
              value={durationDays}
              onChange={(e) => setDurationDays(Number(e.target.value))}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">أقصى عدد استخدامات</label>
            <input
              type="number"
              min={1}
              value={maxUses}
              onChange={(e) => setMaxUses(Number(e.target.value))}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">عدد الأكواد المراد إنشاؤها</label>
            <input
              type="number"
              min={1}
              max={50}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">كود مخصص (اختياري)</label>
            <input
              type="text"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              placeholder="اتركه فارغاً للتوليد التلقائي"
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
              dir="ltr"
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <button
              type="submit"
              disabled={creating}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold"
            >
              {creating ? 'جاري الإنشاء...' : 'إنشاء الكود / الأكواد ✨'}
            </button>
          </div>
        </form>
        {message && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/50 border border-emerald-800 text-emerald-400 text-sm">
            {message}
          </div>
        )}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-white">الأكواد الحالية</h2>
          <button onClick={loadCodes} className="text-xs text-slate-400 hover:text-white">
            تحديث ↻
          </button>
        </div>
        {loading ? (
          <p className="text-slate-500 text-sm">جاري التحميل...</p>
        ) : codes.length === 0 ? (
          <p className="text-slate-500 text-sm">لا توجد أكواد بعد. أنشئ أول كود أعلاه.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm text-slate-400">
              <thead className="bg-slate-950 text-slate-300">
                <tr>
                  <th className="p-3 rounded-r-xl">الكود</th>
                  <th className="p-3">الخطة</th>
                  <th className="p-3">النقاط</th>
                  <th className="p-3">المدة</th>
                  <th className="p-3">الاستخدام</th>
                  <th className="p-3 rounded-l-xl">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {codes.map((c) => {
                  const exhausted = c.usedCount >= c.maxUses;
                  const expired = c.expiresAt && new Date(c.expiresAt) < new Date();
                  return (
                    <tr key={c.id}>
                      <td className="p-3 font-mono text-white text-xs" dir="ltr">{c.code}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-blue-950 text-blue-400 rounded-lg text-xs">{c.planType}</span>
                      </td>
                      <td className="p-3 text-amber-400">{c.creditsReward}</td>
                      <td className="p-3">{c.durationDays} يوم</td>
                      <td className="p-3">{c.usedCount} / {c.maxUses}</td>
                      <td className="p-3">
                        {expired ? (
                          <span className="text-red-400 text-xs">منتهي</span>
                        ) : exhausted ? (
                          <span className="text-slate-500 text-xs">مستنفد</span>
                        ) : (
                          <span className="text-emerald-400 text-xs">نشط</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
