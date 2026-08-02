'use client';
import { useState } from 'react';
import Link from 'next/link';
import { getSupabase, isSupabaseConfigured, supabaseConfigError } from '@/lib/supabase';

const supabase = getSupabase();

export default function SignupPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('اليمن');
  const [city, setCity] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('يرجى اختيار صورة صالحة');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('حجم الصورة يجب أن يكون أقل من 2 ميجابايت');
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setError('');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }
    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    if (!username.trim() || username.length < 3) {
      setError('اسم المستخدم يجب أن يكون 3 أحرف على الأقل');
      return;
    }

    setLoading(true);

    try {
      // 1) إنشاء الحساب في Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            username: username.trim(),
            phone: phone.trim(),
            country,
            city: city.trim(),
          },
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined,
        },
      });

      if (authError) {
        // ترجمة رسائل شائعة
        if (authError.message.includes('already registered') || authError.message.includes('already been registered')) {
          setError('هذا البريد الإلكتروني مسجّل مسبقاً. جرّب تسجيل الدخول.');
        } else if (authError.message.includes('Password')) {
          setError('كلمة المرور ضعيفة. استخدم 6 أحرف على الأقل.');
        } else {
          setError(authError.message);
        }
        setLoading(false);
        return;
      }

      if (!data.user) {
        setError('فشل إنشاء الحساب. حاول مرة أخرى.');
        setLoading(false);
        return;
      }

      let avatarUrl: string | null = null;

      // 2) رفع الصورة الشخصية إن وُجدت
      if (avatarFile && data.user.id) {
        try {
          const ext = avatarFile.name.split('.').pop() || 'jpg';
          const path = `avatars/${data.user.id}.${ext}`;
          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(path, avatarFile, { upsert: true, contentType: avatarFile.type });

          if (!uploadError) {
            const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
            avatarUrl = urlData?.publicUrl || null;
          }
        } catch {
          // لا نوقف التسجيل إذا فشل رفع الصورة
          console.warn('Avatar upload skipped');
        }
      }

      // 3) حفظ الملف الشخصي في جدول profiles (Supabase)
      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          username: username.trim(),
          phone: phone.trim(),
          country,
          city: city.trim(),
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        });
      } catch {
        console.warn('profiles table may not exist yet');
      }

      // 4) رسالة النجاح حسب حالة تأكيد البريد
      if (data.session) {
        // الجلسة فورية (تأكيد البريد معطل في Supabase)
        setSuccess('تم إنشاء الحساب بنجاح! جاري نقلك للوحة التحكم...');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1200);
      } else {
        // يحتاج تأكيد البريد
        setSuccess(
          'تم إنشاء الحساب بنجاح ✅\nتم إرسال رابط تفعيل إلى بريدك الإلكتروني. يرجى فتح الرسالة والضغط على رابط التفعيل ثم تسجيل الدخول.'
        );
      }
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
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

      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <h2 className="text-center text-3xl font-extrabold text-white">إنشاء حساب جديد</h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          لديك حساب بالفعل؟{' '}
          <Link href="/login" className="text-blue-500 font-bold hover:underline">
            تسجيل الدخول
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-slate-900 py-8 px-6 shadow sm:rounded-xl sm:px-10 border border-slate-800">
          {error && (
            <div className="mb-4 p-3 bg-rose-900/50 border border-rose-700 text-rose-200 text-xs rounded-lg whitespace-pre-line">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-emerald-900/50 border border-emerald-700 text-emerald-200 text-xs rounded-lg whitespace-pre-line">
              {success}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSignup}>
            {/* الصورة الشخصية */}
            <div className="flex flex-col items-center gap-3 pb-2">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-slate-700 bg-slate-950 flex items-center justify-center">
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarPreview} alt="معاينة" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl text-slate-600">👤</span>
                )}
              </div>
              <label className="cursor-pointer text-xs text-blue-400 hover:text-blue-300 font-medium">
                الصورة الشخصية (اختياري)
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">الاسم الأول</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                  placeholder="محمد"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">الاسم الأخير</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                  placeholder="الحزمي"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">اسم المستخدم</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                  placeholder="mohammed_alhazmi"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">رقم الجوال</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                  placeholder="+967 7X XXX XXXX"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">الدولة</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="اليمن">اليمن</option>
                  <option value="السعودية">السعودية</option>
                  <option value="الإمارات">الإمارات</option>
                  <option value="مصر">مصر</option>
                  <option value="الأردن">الأردن</option>
                  <option value="الكويت">الكويت</option>
                  <option value="قطر">قطر</option>
                  <option value="عمان">عمان</option>
                  <option value="البحرين">البحرين</option>
                  <option value="أخرى">دولة أخرى</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">المدينة</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                  placeholder="صنعاء، إب، عدن..."
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">البريد الإلكتروني</label>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">كلمة المرور</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                  placeholder="••••••••"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">تأكيد كلمة المرور</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                  placeholder="••••••••"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !!success}
                className="w-full py-3 px-4 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all cursor-pointer shadow-lg shadow-blue-600/20 disabled:opacity-50"
              >
                {loading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب ✨'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
