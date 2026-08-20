'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AnimatedPlatformName from '@/components/site/AnimatedPlatformName'
import SiteLogo from '@/components/site/SiteLogo'
import SocialButtons from '@/components/site/SocialButtons'
import HilltopBanner from '@/components/site/HilltopBanner'
import HilltopBannerBelow from '@/components/site/HilltopBannerBelow'


const SIDE_LINKS = [
  { href: '/', label: 'الرئيسية', icon: '🏠' },
  { href: '/register', label: 'إنشاء حساب', icon: '✨' },
  { href: '/login', label: 'تسجيل الدخول', icon: '🔑' },
  { href: '/dashboard', label: 'لوحة المستخدم', icon: '📊' },
  { href: '/dashboard/images', label: 'الصور', icon: '🖼️' },
  { href: '/dashboard/video', label: 'الفيديو', icon: '🎬' },
  { href: '/dashboard/music', label: 'الموسيقى', icon: '🎵' },
  { href: '/dashboard/code', label: 'البرمجة', icon: '💻' },
  { href: '/dashboard/chat', label: 'الدردشة', icon: '💬' },
  { href: '/dashboard/bot', label: 'المساعد', icon: '🤖' },
  { href: '/dashboard/plans', label: 'الباقات', icon: '💎' },
  { href: '/about', label: 'من نحن', icon: 'ℹ️' },
  { href: '/contact', label: 'اتصل بنا', icon: '📩' },
]

const HOME_TICKER = [
  'مرحباً بكم في منصة محمد الحزمي للذكاء الاصطناعي',
  'ماذا في خاطرك اليوم؟ اكتب طلبك وسننفّذه',
  'صور · فيديو · موسيقى · برمجة · دردشة ذكية',
]

const SERVICES = [
  {
    href: '/dashboard/images',
    t: 'الصور',
    icon: '🖼️',
    desc: 'توليد صور من النص، تعديل الخلفيات، رفع الدقة وتحسين الصور',
  },
  {
    href: '/dashboard/video',
    t: 'الفيديو',
    icon: '🎬',
    desc: 'تحويل النص أو الصورة إلى فيديو مع خيارات احترافية',
  },
  {
    href: '/dashboard/music',
    t: 'الموسيقى',
    icon: '🎵',
    desc: 'كلمات وألحان وشيلات وزفّات ومقاطع صوتية',
  },
  {
    href: '/dashboard/code',
    t: 'البرمجة',
    icon: '💻',
    desc: 'كتابة وتحسين أكواد المواقع وتطبيقات الهاتف',
  },
  {
    href: '/dashboard/chat',
    t: 'الدردشة',
    icon: '💬',
    desc: 'محادثة ذكية للإجابة على أسئلتك ومساعدتك فوراً',
  },
  {
    href: '/dashboard/bot',
    t: 'المساعد',
    icon: '🤖',
    desc: 'مساعد المنصة لاستقبال طلباتك وتوجيهها للتنفيذ',
  },
]

const FEATURES = [
  {
    icon: '⚡',
    title: 'سرعة التنفيذ',
    text: 'أرسل طلبك واحصل على نتيجة خلال لحظات عبر مزودي الذكاء الاصطناعي',
  },
  {
    icon: '💎',
    title: 'رصيد REMO',
    text: 'ابدأ مجاناً ثم رقِّ خطتك حسب استخدامك بكل شفافية',
  },
  {
    icon: '🌐',
    title: 'واجهة عربية',
    text: 'تجربة مريحة للمستخدم العربي مع دعم اللغات لاحقاً',
  },
]

/** مزايا مستقبلية — ترويج */
const COMING_SOON = [
  {
    icon: '📱',
    title: 'تطبيق الجوال',
    text: 'قريباً: استخدام المنصة من هاتفك بسهولة',
  },
  {
    icon: '🎨',
    title: 'قوالب جاهزة أكثر',
    text: 'مكتبة قوالب احترافية لكل خدمة',
  },
  {
    icon: '👥',
    title: 'فرق عمل',
    text: 'مساحات مشتركة للفرق والوكالات',
  },
  {
    icon: '🔌',
    title: 'واجهة API',
    text: 'ربط منصتك أو موقعك بخدمات التوليد',
  },
]

export default function HomePage() {
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [busy, setBusy] = useState(false)
  const [tick, setTick] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
      } catch {
        /* */
      }
      try {
        const me = await fetch('/api/user/me', {
          credentials: 'include',
          cache: 'no-store',
        })
        if (me.ok) {
          router.push('/dashboard/bot')
          return
        }
      } catch {
        /* */
      }
      router.push('/register?from=home&next=/dashboard/bot')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600/40"
      dir="rtl"
    >
      {/* خلفية */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(37,99,235,0.22),transparent)]" />
        <div className="absolute bottom-0 inset-x-0 h-1/3 bg-[radial-gradient(ellipse_at_bottom,rgba(245,158,11,0.07),transparent)]" />
      </div>

      {/* شريط علوي */}
      {/* خلفية القائمة الجانبية */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="إغلاق القائمة"
          className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* القائمة الجانبية */}
      <aside
        className={`fixed top-0 right-0 z-[70] h-full w-[min(100%,20rem)] bg-slate-950 border-l border-slate-800 shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!sidebarOpen}
      >
        <div className="flex items-center justify-between gap-2 px-4 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2 min-w-0">
            <SiteLogo />
            <span className="text-sm font-semibold text-slate-200 truncate">القائمة</span>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="h-9 w-9 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white text-lg leading-none"
            aria-label="إغلاق"
          >
            ×
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2">
          <p className="px-3 pb-2 text-[10px] uppercase tracking-wider text-slate-600">التنقل</p>
          <ul className="space-y-0.5">
            {SIDE_LINKS.map((item) => (
              <li key={item.href + item.label}>
                <Link
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-900 hover:text-white transition"
                >
                  <span className="text-base w-6 text-center" aria-hidden>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            href="/register"
            onClick={() => setSidebarOpen(false)}
            className="block text-center rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 text-sm"
          >
            ابدأ الآن مجاناً
          </Link>
          <Link
            href="/login"
            onClick={() => setSidebarOpen(false)}
            className="block text-center rounded-xl border border-slate-700 text-slate-300 hover:border-slate-500 py-2 text-sm"
          >
            تسجيل الدخول
          </Link>
        </div>
      </aside>

      {/* شريط علوي */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-slate-800/70 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900/80 text-slate-200 hover:border-blue-500 hover:text-white transition shrink-0"
              aria-label="فتح القائمة"
            >
              <span className="flex flex-col gap-1.5 w-4">
                <span className="block h-0.5 w-full bg-current rounded" />
                <span className="block h-0.5 w-full bg-current rounded" />
                <span className="block h-0.5 w-full bg-current rounded" />
              </span>
            </button>
            <SiteLogo />
            <span className="hidden sm:inline text-sm text-slate-400 truncate">
              منصة محمد الحزمي
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm shrink-0">
            <Link
              href="/login"
              className="hidden xs:inline px-3 py-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition sm:inline"
            >
              دخول
            </Link>
            <Link
              href="/register"
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-900/30 transition"
            >
              إنشاء حساب
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-28 pb-20 px-4 sm:px-6">
        {/* ===== Hero ===== */}
        <section className="max-w-3xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/60 px-3 py-1 text-[11px] text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            منصة عربية للذكاء الاصطناعي
          </div>

          <AnimatedPlatformName size="xl" />

          <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
            توليد الصور والفيديو والموسيقى والبرمجة والدردشة الذكية — في مكان واحد، بواجهة عربية
            سهلة واحترافية.
          </p>

          <p
            key={tick}
            className="text-sm text-amber-200/90 min-h-[1.5rem] transition-opacity duration-500"
          >
            {HOME_TICKER[tick]}
          </p>

          {/* مربع الطلب */}
          <div className="mt-2 rounded-3xl border border-slate-700/80 bg-slate-900/70 shadow-2xl shadow-black/40 p-4 sm:p-5 text-right backdrop-blur-sm">
            <label className="block text-xs text-slate-400 mb-2">
              ماذا في خاطرك اليوم؟ اكتب طلبك وسنقوم بتنفيذه
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              placeholder="مثال: صمم شعاراً، اكتب كود صفحة، أو أنشئ وصفاً لفيديو..."
              className="w-full rounded-2xl bg-slate-950/80 border border-slate-700 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-600/50 resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  runPrompt()
                }
              }}
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[11px] text-slate-500">
                عضو جديد؟{' '}
                <Link href="/register" className="text-blue-400 hover:underline">
                  إنشاء حساب
                </Link>
                {' · '}
                <Link href="/login" className="text-blue-400 hover:underline">
                  تسجيل الدخول
                </Link>
              </p>
              <button
                type="button"
                disabled={busy || !prompt.trim()}
                onClick={runPrompt}
                className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-sm font-bold shadow-lg shadow-emerald-900/20 transition"
              >
                {busy ? 'جاري التحويل…' : 'تنفيذ'}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              href="/register"
              className="px-7 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 font-bold text-white shadow-xl shadow-blue-900/30 transition"
            >
              ابدأ الآن
            </Link>
            <Link
              href="/dashboard"
              className="px-7 py-3 rounded-2xl border border-slate-600 bg-slate-900/50 text-slate-200 hover:border-slate-400 hover:bg-slate-900 transition"
            >
              لوحة المستخدم
            </Link>
          </div>
        </section>

        {/* ===== إعلان 1: أعلى الخدمات ===== */}
        <section className="max-w-3xl mx-auto mt-10">
          <HilltopBanner />
        </section>

        {/* ===== مميزات ===== */}
        <section className="max-w-4xl mx-auto mt-14 grid sm:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 text-center sm:text-right hover:border-slate-600 transition"
            >
              <div className="text-2xl mb-2">{f.icon}</div>
              <h3 className="font-bold text-slate-100 text-sm">{f.title}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{f.text}</p>
            </div>
          ))}
        </section>

        {/* ===== الخدمات ===== */}
        <section className="max-w-4xl mx-auto mt-14">
          <div className="text-center mb-7">
            <h2 className="text-xl sm:text-2xl font-bold text-white">خدمات المنصة</h2>
            <p className="text-sm text-slate-400 mt-1">
              كل خدمة بأيقونتها ووصفها — اضغط للانتقال إلى لوحة التحكم
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICES.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="group relative rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/95 to-slate-950 p-5 hover:border-blue-500/70 hover:shadow-xl hover:shadow-blue-950/30 transition text-right overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-20 h-20 bg-blue-600/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition" />
                <div className="relative flex items-start gap-3">
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-800/80 border border-slate-700 text-2xl group-hover:scale-110 transition-transform"
                    aria-hidden
                  >
                    {s.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-50 text-base">{s.t}</div>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ===== إعلان 2: أسفل الخدمات ===== */}
        <section className="max-w-3xl mx-auto mt-10 mb-2">
          <HilltopBannerBelow />
        </section>

        {/* ===== قريباً / ترويج مستقبلي ===== */}
        <section className="max-w-4xl mx-auto mt-16">
          <div className="text-center mb-7">
            <span className="inline-block text-[11px] font-semibold tracking-wide text-amber-400/90 border border-amber-500/30 rounded-full px-3 py-0.5 mb-2">
              قريباً
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white">مزايا قيد التطوير</h2>
            <p className="text-sm text-slate-400 mt-1">
              نعمل على إضافات جديدة لتجربة أقوى — ترقّب التحديثات
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {COMING_SOON.map((c) => (
              <div
                key={c.title}
                className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/30 p-5 flex gap-3 items-start"
              >
                <span className="text-2xl opacity-80">{c.icon}</span>
                <div>
                  <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                    {c.title}
                    <span className="text-[10px] font-normal text-slate-500 border border-slate-700 rounded px-1.5 py-0.5">
                      قريباً
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* تواصل */}
        <div className="max-w-3xl mx-auto mt-14">
          <SocialButtons variant="landing" />
        </div>

        {/* تذييل */}
        <footer className="max-w-3xl mx-auto mt-14 pt-8 border-t border-slate-800/80">
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-slate-500">
            <Link href="/about" className="hover:text-slate-300">
              من نحن
            </Link>
            <Link href="/contact" className="hover:text-slate-300">
              اتصل بنا
            </Link>
            <Link href="/privacy" className="hover:text-slate-300">
              الخصوصية
            </Link>
            <Link href="/terms" className="hover:text-slate-300">
              الشروط
            </Link>
          </div>
          <p className="text-center text-[11px] text-slate-600 mt-4">
            © {new Date().getFullYear()} منصة محمد الحزمي للذكاء الاصطناعي
          </p>
        </footer>
      </main>
    </div>
  )
}
