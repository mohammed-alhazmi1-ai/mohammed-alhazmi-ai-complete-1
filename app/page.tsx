'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AnimatedPlatformName from '@/components/site/AnimatedPlatformName'
import SiteLogo from '@/components/site/SiteLogo'
import SocialButtons from '@/components/site/SocialButtons'
import HomeAdSense from '@/components/site/HomeAdSense'

const HOME_TICKER = [
  'مرحباً بكم في منصة محمد الحزمي للذكاء الاصطناعي',
  'ماذا في خاطرك اليوم؟ اكتب طلبك هنا وسنقوم بتلبيته',
  'صور · فيديو · موسيقى · برمجة · دردشة ذكية',
]

export default function HomePage() {
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [busy, setBusy] = useState(false)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick((n) => (n + 1) % HOME_TICKER.length), 3500)
    return () => clearInterval(id)
  }, [])

  async function runPrompt() {
    const text = prompt.trim()
    if (!text || busy) return
    setBusy(true)
    try {
      try {
        sessionStorage.setItem('pendingPrompt', text)
      } catch { /* */ }
      try {
        const me = await fetch('/api/user/me', { credentials: 'include', cache: 'no-store' })
        if (me.ok) {
          router.push('/dashboard/bot')
          return
        }
      } catch { /* */ }
      router.push('/register?from=home&next=/dashboard/bot')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans" dir="rtl">
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <SiteLogo />
          <div className="flex items-center gap-2 text-sm">
            <Link href="/login" className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white">
              دخول
            </Link>
            <Link
              href="/register"
              className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-medium"
            >
              إنشاء حساب
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <AnimatedPlatformName size="xl" />
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            منصة عربية لتوليد الصور والفيديو والموسيقى والبرمجة والدردشة الذكية
          </p>
          {/* مربع طلب سريع — إضافة دون تغيير بقية الصفحة */}
          <div className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/50 p-4 text-right space-y-3 shadow-lg shadow-black/20">
            <p className="text-sm text-blue-300/90 transition-opacity duration-500">
              {HOME_TICKER[tick]}
            </p>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              placeholder="اكتب طلبك هنا… مثال: صمّم كرت شخصي أو اكتب كود صفحة"
              className="w-full rounded-xl border border-slate-600 bg-slate-950/80 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  runPrompt()
                }
              }}
            />
            <button
              type="button"
              disabled={busy || !prompt.trim()}
              onClick={runPrompt}
              className="w-full sm:w-auto rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-6 py-2.5 text-sm font-bold text-white"
            >
              {busy ? 'جاري التحويل…' : 'تنفيذ'}
            </button>
            <p className="text-[11px] text-slate-500">
              عضو جديد → إنشاء حساب · لديك حساب؟{' '}
              <Link href="/login" className="text-blue-400 underline">تسجيل الدخول</Link>
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              href="/register"
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 font-bold text-white"
            >
              ابدأ الآن
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-2xl border border-slate-600 text-slate-200 hover:border-slate-400"
            >
              لوحة المستخدم
            </Link>
          </div>

          {/* مكان إعلان فوق الخدمات */}
          <div className="w-full pt-6 space-y-2">
            <HomeAdSense slot="home" />
            <div className="rounded-xl border border-dashed border-slate-700/80 bg-slate-900/30 px-3 py-2 text-[11px] text-slate-500">
              مساحة إعلان — من لوحة المالك → الإعلانات (AdSense) لعرض البنر هنا
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-10 text-sm">
            {[
              { href: '/dashboard/images', t: 'الصور' },
              { href: '/dashboard/video', t: 'الفيديو' },
              { href: '/dashboard/music', t: 'الموسيقى' },
              { href: '/dashboard/code', t: 'البرمجة' },
              { href: '/dashboard/chat', t: 'الدردشة' },
              { href: '/dashboard/bot', t: 'المساعد' },
            ].map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 py-4 hover:border-blue-600 hover:bg-slate-900 transition shadow-sm"
              >
                {s.t}
              </Link>
            ))}
          </div>
        </div>

        <div className="max-w-3xl mx-auto mt-16">
          <SocialButtons variant="landing" />
        </div>

        <footer className="max-w-3xl mx-auto mt-16 pt-8 border-t border-slate-800 flex flex-wrap justify-center gap-4 text-sm text-slate-500">
          <Link href="/about">من نحن</Link>
          <Link href="/contact">اتصل بنا</Link>
          <Link href="/privacy">الخصوصية</Link>
          <Link href="/terms">الشروط</Link>
        </footer>
      </main>
    </div>
  )
}
