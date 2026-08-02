'use client';
import { useState } from 'react';
import Link from 'next/link';
import { getSupabase, isSupabaseConfigured, supabaseConfigError } from '@/lib/supabase';

const supabase = getSupabase();

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      if (error.message === 'Invalid login credentials') {
        setErrorMsg('البريد الإلكتروني أو كلمة المرور غير صحيحة، أو أن الحساب غير مسجل.');
      } else if (error.message === 'Email not confirmed') {
        setErrorMsg('يرجى تأكيد بريدك الإلكتروني أولاً. افتح رسالة التفعيل المرسلة إليك ثم حاول مرة أخرى.');
      } else {
        setErrorMsg('حدث خطأ: ' + error.message);
      }
      setLoading(false);
      return;
    }

    // توجيه حسب الدور: مالك → لوحة المالك | مستخدم → لوحة المستخدم
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    const role = user?.user_metadata?.role || user?.app_metadata?.role || '';
    const ownerEmails = (process.env.NEXT_PUBLIC_OWNER_EMAILS || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    const emailLower = (user?.email || '').toLowerCase();
    const isOwner =
      role === 'OWNER' ||
      role === 'ADMIN' ||
      (emailLower && ownerEmails.includes(emailLower));
    window.location.href = isOwner ? '/owner' : '/dashboard';
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    setOauthLoading(provider);
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined,
        },
      });
      if (error) {
        if (error.message.includes('not enabled') || error.message.includes('provider')) {
          setErrorMsg(
            `تسجيل الدخول عبر ${provider === 'google' ? 'Google' : 'GitHub'} غير مفعّل حالياً. فعّله من لوحة Supabase (Authentication → Providers).`
          );
        } else {
          setErrorMsg(error.message);
        }
        setOauthLoading(null);
      }
      // عند النجاح يتم التحويل تلقائياً من Supabase
    } catch (err: any) {
      setErrorMsg(err?.message || 'فشل تسجيل الدخول الاجتماعي');
      setOauthLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-center py-12 sm:px-6 lg:px-8" dir="rtl">
      <div className="absolute top-6 right-6">
        <Link
          href="/"
          className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl"
        >
          ← العودة للرئيسية
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-white">تسجيل الدخول لحسابك</h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          ليس لديك حساب؟{' '}
          <Link href="/signup" className="text-blue-500 font-bold hover:underline">
            إنشاء حساب جديد
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-slate-800">
          {errorMsg && (
            <div className="mb-6 p-4 bg-rose-900/40 border-l-4 border-rose-500 text-rose-200 text-sm font-bold rounded-lg shadow-md">
              ⚠️ {errorMsg}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
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

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-slate-300">كلمة المرور</label>
                <Link href="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300">
                  استعادة كلمة المرور؟
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                placeholder="••••••••"
                dir="ltr"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all cursor-pointer shadow-lg shadow-blue-600/20 disabled:opacity-50"
            >
              {loading ? 'جاري التحقق...' : 'تسجيل الدخول 🚀'}
            </button>
          </form>

          {/* فاصل */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-slate-900 text-slate-500">أو</span>
            </div>
          </div>

          {/* OAuth */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => handleOAuth('google')}
              disabled={!!oauthLoading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg border border-slate-700 bg-slate-950 hover:bg-slate-800 text-sm font-medium text-slate-200 transition disabled:opacity-50"
            >
              <span className="text-lg">G</span>
              {oauthLoading === 'google' ? 'جاري التحويل...' : 'تسجيل الدخول عبر Google'}
            </button>
            <button
              type="button"
              onClick={() => handleOAuth('github')}
              disabled={!!oauthLoading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg border border-slate-700 bg-slate-950 hover:bg-slate-800 text-sm font-medium text-slate-200 transition disabled:opacity-50"
            >
              <span className="text-lg">⌘</span>
              {oauthLoading === 'github' ? 'جاري التحويل...' : 'تسجيل الدخول عبر GitHub'}
            </button>
          </div>

          <p className="mt-4 text-center text-xs text-slate-500">
            لم يصلك رابط التفعيل؟ تحقق من مجلد الرسائل غير المرغوب فيها، أو أعد إنشاء الحساب.
          </p>
        </div>
      </div>
    </div>
  );
}
