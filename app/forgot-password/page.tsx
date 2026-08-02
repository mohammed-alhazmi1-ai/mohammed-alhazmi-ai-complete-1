'use client';
import { useState } from 'react';
import Link from 'next/link';
import { getSupabase, isSupabaseConfigured, supabaseConfigError } from '@/lib/supabase';

const supabase = getSupabase();

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    const redirectTo =
      typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setMessage(
      'إذا كان البريد مسجّلاً لدينا، ستصلك رسالة تحتوي رابط إعادة تعيين كلمة المرور. تحقق من صندوق الوارد والرسائل غير المرغوب فيها.'
    );
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-center py-12 sm:px-6 lg:px-8" dir="rtl">
      <div className="absolute top-6 right-6">
        <Link
          href="/login"
          className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl"
        >
          ← العودة لتسجيل الدخول
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-white">استعادة كلمة المرور</h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-slate-800">
          {error && (
            <div className="mb-4 p-3 bg-rose-900/50 border border-rose-700 text-rose-200 text-xs rounded-lg">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-4 p-3 bg-emerald-900/50 border border-emerald-700 text-emerald-200 text-xs rounded-lg">
              {message}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleReset}>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                placeholder="you@example.com"
                dir="ltr"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !!message}
              className="w-full py-3 px-4 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all disabled:opacity-50"
            >
              {loading ? 'جاري الإرسال...' : 'إرسال رابط الاستعادة'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
