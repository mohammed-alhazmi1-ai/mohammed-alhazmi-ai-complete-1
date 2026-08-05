'use client'
import AnimatedPlatformName from '@/components/site/AnimatedPlatformName'
import SocialButtons from '@/components/site/SocialButtons'
import SiteLogo from '@/components/site/SiteLogo'
import HomeAdSense from '@/components/site/HomeAdSense';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import NavAuthButtons from '@/components/ui/NavAuthButtons';

const services = [
  {
    icon: '🖼️',
    title: 'قسم الصور',
    color: 'bg-blue-600/20 text-blue-400 border-blue-500/30',
    items: [
      'توليد الصور بالذكاء الاصطناعي',
      'تحويل النص إلى صورة',
      'مسح وتغيير الخلفية',
      'رفع دقة الصور',
      'تحسين الصور القديمة',
      'دمج وتلبيس الصور',
    ],
  },
  {
    icon: '🎬',
    title: 'قسم الفيديو',
    color: 'bg-purple-600/20 text-purple-400 border-purple-500/30',
    items: [
      'إنشاء فيديو بالذكاء الاصطناعي',
      'تحويل النص إلى فيديو',
      'تحويل الصورة إلى فيديو',
      'رفع دقة الفيديو',
      'تغيير الوجه بالفيديو',
      'إنشاء إعلانات فيديو',
    ],
  },
  {
    icon: '🎵',
    title: 'قسم الموسيقى',
    color: 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30',
    items: [
      'توليد أغنية كاملة',
      'توليد شيلات وزفات',
      'موسيقى خلفية احترافية',
      'استنساخ الصوت',
      'تنقية وفصل الصوت',
      'تحويل الكلمات إلى أغنية',
    ],
  },
  {
    icon: '💻',
    title: 'قسم برمجة الأكواد',
    color: 'bg-amber-600/20 text-amber-400 border-amber-500/30',
    items: [
      'تصميم وكتابة أكواد المواقع',
      'تطبيقات الهاتف',
      'تصحيح الأخطاء البرمجية',
      'تحويل التصميم إلى كود',
      'بناء واجهات API',
      'قواعد البيانات',
    ],
  },
  {
    icon: '🤖',
    title: 'قسم الدردشة الذكية',
    color: 'bg-rose-600/20 text-rose-400 border-rose-500/30',
    items: [
      'روبوت دردشة ذكي 24/7',
      'كتابة مقالات ونصوص',
      'تلخيص الملفات',
      'الترجمة الفورية',
      'تحليل المستندات',
      'المساعدة البرمجية',
    ],
  },
  {
    icon: '⭐',
    title: 'مميزات إضافية',
    color: 'bg-cyan-600/20 text-cyan-400 border-cyan-500/30',
    items: [
      'لوحة تحكم لكل عضو',
      'نظام رصيد مرن',
      'أكواد هدايا وباقات',
      'دعم عربي كامل',
      'أكثر من 20 مزود AI',
      'حفظ المشاريع',
    ],
  },
];

const plans = [
  { name: 'مجانية', price: 'مجاناً', credits: '100 Credit', highlight: false },
  { name: 'احترافية', price: '$29', credits: '5,000 Credit', highlight: true },
  { name: 'أعمال', price: '$99', credits: '20,000 Credit', highlight: false },
];

const stats = [
  { value: '20+', label: 'مزود ذكاء اصطناعي' },
  { value: '5', label: 'أقسام خدمات' },
  { value: '100', label: 'رصيد ترحيبي مجاني' },
  { value: '24/7', label: 'توفر المنصة' },
];

export default function Home() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.settings) setSettings(d.settings);
      })
      .catch(() => {});
  }, []);

  const name = settings?.siteNameAr || ' الحزمي';
  const nameEn = settings?.siteNameEn || 'Mohammed Alhazmi AI';
  const emoji = settings?.logoEmoji || '🚀';
  const tagline = settings?.taglineAr || '{tagline}';
  const heroTitle = settings?.heroTitleAr || 'ابتكر، صمم، وأنشئ بمستوى عالمي';
  const heroSub = settings?.heroSubtitleAr || 'صور · فيديو · موسيقى وزفات · برمجة · دردشة ذكية — كل أدوات الذكاء الاصطناعي في منصة عربية واحدة.';
  const about = settings?.aboutAr || 'منصة SaaS عربية تجمع أحدث تقنيات الذكاء الاصطناعي للصور والفيديو والموسيقى والبرمجة والدردشة — بواجهة سهلة ودعم كامل للعربية.';
  const footer = settings?.footerTextAr || '{footer}';
  const support = settings?.supportEmail || 'support@mohammed-alhazmi.ai';
  const primary = settings?.primaryColor || '#2563eb';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans" dir="rtl">
    <div className="absolute top-4 right-4 z-20 px-4"><div className="py-6 px-4"><AnimatedPlatformName size="xl" /></div>
        <SiteLogo /></div>
    
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500 selection:text-white" dir="rtl">
      {/* ===== الشريط العلوي ===== */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg text-lg" style={{ background: `linear-gradient(to top right, ${primary}, #10b981)` }}>
              {emoji}
            </div>
            <div className="hidden sm:block">
              <span className="font-extrabold text-white tracking-tight block leading-tight">
                {name}
              </span>
              <span className="text-[10px] text-slate-500">{nameEn}</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm text-slate-400">
            <a href="#services" className="hover:text-white transition-colors">الخدمات</a>
            <a href="#pricing" className="hover:text-white transition-colors">الأسعار</a>
            <a href="#about" className="hover:text-white transition-colors">من نحن</a>
            <a href="#contact" className="hover:text-white transition-colors">تواصل</a>
          </div>

          <NavAuthButtons />
        </div>
      </nav>

      {/* ===== البطل (Hero) بخلفية احترافية ===== */}
      <div className="py-10 px-4"><SocialButtons variant="landing" /></div>
<section className="relative min-h-[90vh] flex items-center pt-24 pb-16 overflow-hidden">
        {/* خلفية متدرجة + دوائر ضوئية */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900" />
        <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 left-1/4 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/5 rounded-full blur-[150px] pointer-events-none" />
        {/* شبكة خفيفة */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-slate-700/80 text-blue-400 text-xs font-semibold backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            {tagline}
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.15]">
            {heroTitle}
          </h1>

          <p className="text-slate-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            {heroSub}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base sm:text-lg shadow-xl shadow-blue-600/30 transition-all hover:scale-[1.02]"
            >
              ابدأ الآن مجاناً ⚡
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-base sm:text-lg transition-all backdrop-blur-sm"
            >
              تسجيل الدخول
            </Link>
            <a
              href="#services"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-slate-400 hover:text-white font-medium text-sm transition-colors"
            >
              استكشف الخدمات ↓
            </a>
          </div>

          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 max-w-3xl mx-auto">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-slate-800/80 bg-slate-900/50 backdrop-blur-sm py-4 px-3"
              >
                <p className="text-2xl sm:text-3xl font-extrabold text-blue-400">{s.value}</p>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <HomeAdSense slot="home" />


      {/* ===== الخدمات ===== */}
      <section id="services" className="py-20 border-t border-slate-900 relative">
        <div className="absolute inset-0 bg-slate-950/50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <p className="text-blue-400 text-xs font-bold tracking-widest uppercase">الخدمات</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">
              كل ما تحتاجه في مكان واحد
            </h2>
            <p className="text-slate-400 text-sm md:text-base">
              أقسام احترافية مصممة لصناع المحتوى، المبرمجين، والشركات
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc) => (
              <div
                key={svc.title}
                className="group rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-7 hover:border-slate-600 hover:bg-slate-900 transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-2xl mb-5 ${svc.color}`}
                >
                  {svc.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-4 group-hover:text-blue-300 transition-colors">
                  {svc.title}
                </h3>
                <ul className="space-y-2">
                  {svc.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-400">
                      <span className="text-emerald-500 mt-0.5 shrink-0">✔</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/signup"
              className="inline-flex px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/20 transition-all"
            >
              ابدأ استخدام الخدمات الآن
            </Link>
          </div>
        </div>
      </section>

      {/* ===== لماذا نحن ===== */}
      <section className="py-20 border-t border-slate-900 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-white">لماذا {name}؟</h2>
            <p className="text-slate-400 mt-2 text-sm">ما يميزنا عن المنصات الأخرى</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: '🌐', t: 'عربي أولاً', d: 'واجهة وتجربة مصممة للعربية من الأساس' },
              { icon: '🔌', t: 'مزودون متعددون', d: 'Gemini, OpenAI, Claude والمزيد من مكان واحد' },
              { icon: '💳', t: 'رصيد مرن', d: 'اشترِ ما تحتاجه أو فعّل كود هدية' },
              { icon: '🛡️', t: 'آمن وموثوق', d: 'حماية البيانات ومفاتيح API على الخادم' },
            ].map((f) => (
              <div
                key={f.t}
                className="rounded-2xl border border-slate-800 bg-slate-950/80 p-6 text-center"
              >
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-white mb-2">{f.t}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== الأسعار ===== */}
      <section id="pricing" className="py-20 border-t border-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-blue-400 text-xs font-bold tracking-widest uppercase">الأسعار</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-2">
              خطط تناسب الجميع
            </h2>
            <p className="text-slate-400 text-sm mt-2">ابدأ مجاناً، ثم ارتقِ عند الحاجة — بالدولار USD</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`rounded-3xl border p-7 flex flex-col ${
                  p.highlight
                    ? 'border-blue-500 bg-blue-950/20 ring-1 ring-blue-500/30 scale-[1.02]'
                    : 'border-slate-800 bg-slate-900/60'
                }`}
              >
                {p.highlight && (
                  <span className="self-start text-[10px] font-bold bg-blue-600 text-white px-2.5 py-0.5 rounded-full mb-3">
                    الأكثر طلباً
                  </span>
                )}
                <h3 className="text-xl font-bold text-white">{p.name}</h3>
                <p className="text-4xl font-extrabold text-blue-400 mt-3">{p.price}</p>
                <p className="text-emerald-400 text-sm mt-1">{p.credits}</p>
                <Link
                  href="/signup"
                  className={`mt-6 block text-center rounded-xl py-2.5 text-sm font-bold transition ${
                    p.highlight
                      ? 'bg-blue-600 hover:bg-blue-500 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  ابدأ الآن
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-slate-500 text-xs mt-6">
            تتوفر أيضاً خطة هدية (بكود) وخطة VIP — من لوحة التحكم بعد التسجيل
          </p>
        </div>
      </section>

      {/* ===== CTA أخير ===== */}
      <section className="py-16 border-t border-slate-900">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">
            جاهز تبدأ رحلتك مع الذكاء الاصطناعي؟
          </h2>
          <p className="text-slate-400 text-sm">
            سجّل مجاناً واحصل على 100 Credit فوراً — بدون بطاقة ائتمان
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href="/signup"
              className="px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/25"
            >
              إنشاء حساب مجاني
            </Link>
            <Link
              href="/login"
              className="px-8 py-3.5 rounded-2xl border border-slate-700 hover:bg-slate-900 text-slate-200 font-bold"
            >
              لدي حساب بالفعل
            </Link>
          </div>
        </div>
      </section>

      {/* ===== التذييل ===== */}
      <HomeAdSense slot="home2" />
      <footer id="about" className="border-t border-slate-900 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center">
                🚀
              </div>
              <div>
                <p className="font-bold text-white">{name}</p>
                <p className="text-[10px] text-slate-500">{nameEn}</p>
              </div>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              {about}
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4 text-sm">روابط سريعة</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a href="#services" className="hover:text-white">الخدمات</a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white">الأسعار</a>
              </li>
              <li>
                <Link href="/signup" className="hover:text-white">إنشاء حساب</Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white">تسجيل الدخول</Link>
              </li>
            </ul>
          </div>
          <div id="contact">
            <h4 className="font-bold text-white mb-4 text-sm">تواصل معنا</h4>
            <p className="text-slate-400 text-sm mb-2" dir="ltr">
              {support}
            </p>
            <p className="text-slate-500 text-xs">اليمن · متوفر 24/7</p>
            <div className="mt-4 flex gap-2">
              <Link
                href="/signup"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
              >
                ابدأ الآن
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-900 py-5 text-center text-slate-600 text-xs">
          {footer}
        </div>
      </footer>
    </div>
  );
}
