"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase, isSupabaseConfigured, supabaseConfigError } from "@/lib/supabase";
import { PLANS } from "@/lib/subscription/plans";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import UsageBar from '@/components/dashboard/UsageBar';

const supabase = getSupabase();

type ServiceItem = {
  title: string;
  items: string[];
  href?: string;
  badge?: string;
};

const SERVICES: { id: string; icon: string; title: string; color: string; services: ServiceItem[] }[] = [
  {
    id: "images",
    icon: "🖼️",
    title: "قسم الصور",
    color: "from-blue-600/20 to-cyan-600/10 border-blue-800/50",
    services: [
      {
        title: "توليد وتعديل الصور",
        items: ["قوالب جاهزة", "تحويل النص إلى صورة", "مسح/تغيير الخلفية", "رفع الدقة", "تحسين قديم", "تلبيس"],
        href: "/dashboard/images",
        badge: "قوالب",
      },
    ],
  },
  {
    id: "video",
    icon: "🎬",
    title: "قسم الفيديو",
    color: "from-purple-600/20 to-fuchsia-600/10 border-purple-800/50",
    services: [
      {
        title: "إنشاء فيديو بالذكاء الاصطناعي",
        items: ["قوالب جاهزة", "نص إلى فيديو", "صورة إلى فيديو", "تغيير الوجه", "إعلانات"],
        href: "/dashboard/video",
        badge: "قوالب",
      },
    ],
  },
  {
    id: "music",
    icon: "🎵",
    title: "قسم الموسيقى",
    color: "from-emerald-600/20 to-teal-600/10 border-emerald-800/50",
    services: [
      {
        title: "موسيقى وأغانٍ وزفات",
        items: ["قوالب جاهزة", "أغنية", "شيلة", "زفة", "موسيقى خلفية"],
        href: "/dashboard/music",
        badge: "قوالب",
      },
    ],
  },
  {
    id: "code",
    icon: "💻",
    title: "قسم برمجة الأكواد",
    color: "from-amber-600/20 to-orange-600/10 border-amber-800/50",
    services: [
      {
        title: "تصميم وكتابة الأكواد",
        items: ["قوالب جاهزة", "مواقع", "تطبيقات", "API", "إصلاح أخطاء"],
        href: "/dashboard/code",
        badge: "قوالب",
      },
    ],
  },
  {
    id: "bot",
    icon: "🧠",
    title: "المساعد الذكي",
    color: "from-cyan-600/20 to-blue-600/10 border-cyan-800/50",
    services: [
      {
        title: "روبوت توجيه وتنفيذ",
        items: ["استقبال الأوامر", "توجيه للقسم المناسب", "تنفيذ عبر المزود المختار"],
        href: "/dashboard/bot",
        badge: "متاح",
      },
    ],
  },
  {
    id: "chat",
    icon: "🤖",
    title: "قسم الدردشة",
    color: "from-rose-600/20 to-pink-600/10 border-rose-800/50",
    services: [
      {
        title: "روبوت دردشة ذكي",
        items: ["قوالب جاهزة", "مقالات", "تلخيص", "ترجمة", "بريد رسمي"],
        href: "/dashboard/chat",
        badge: "متاح",
      },
    ],
  },
];

export default function DashboardPage() {
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [currentPlan, setCurrentPlan] = useState("Free");
  const [credits, setREMOs] = useState(100);
  const [giftCode, setGiftCode] = useState("");
  const [giftLoading, setGiftLoading] = useState(false);
  const [giftMsg, setGiftMsg] = useState("");
  const [giftErr, setGiftErr] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMsg, setContactMsg] = useState("");
  const [contactSent, setContactSent] = useState(false);

  const [recentJobs, setRecentJobs] = useState<any[]>([]);

  useEffect(() => {
    async function getUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        window.location.href = "/login";
        return;
      }
      const u = session.user;
      setUserEmail(u.email || "");
      setUserId(u.id || "");
      const meta = u.user_metadata || {};
      const name =
        [meta.first_name, meta.last_name].filter(Boolean).join(" ") ||
        meta.username ||
        meta.full_name ||
        (u.email ? u.email.split("@")[0] : "مستخدم");
      setUserName(name);
      if (meta.plan || meta.planType) setCurrentPlan(meta.plan || meta.planType);
      setContactEmail(u.email || "");

      // جلب الرصيد والخطة من الخادم
      try {
        const res = await fetch("/api/user/me", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: u.email,
            firstName: meta.first_name,
            lastName: meta.last_name,
            username: meta.username,
          }),
        });
        const data = await res.json();
        if (typeof data.credits === "number") setREMOs(data.credits);
        if (data.plan) setCurrentPlan(data.plan);
        if (data.recentJobs) setRecentJobs(data.recentJobs);
        if (data.firstName || data.username) {
          const n = [data.firstName, data.lastName].filter(Boolean).join(" ") || data.username;
          if (n) setUserName(n);
        }
      } catch (e) {
        console.error(e);
      }
    }
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const handleRedeemGift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftCode.trim()) {
      setGiftErr("أدخل كود الهدية");
      return;
    }
    setGiftLoading(true);
    setGiftMsg("");
    setGiftErr("");
    try {
      const res = await fetch("/api/gift/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: giftCode.trim(),
          email: userEmail,
          userId: userId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل التفعيل");
      setGiftMsg(
        data.message +
          (data.plan ? ` — الخطة: ${data.plan} | +${data.creditsAdded} نقطة` : "")
      );
      if (data.plan) setCurrentPlan(data.plan);
      if (data.creditsAdded) setREMOs((c) => c + Number(data.creditsAdded));
      setGiftCode("");
    } catch (err: any) {
      setGiftErr(err.message);
    } finally {
      setGiftLoading(false);
    }
  };

  const handleContact = (e: React.FormEvent) => {
    e.preventDefault();
    // واجهة فقط — الربط مع API/البريد لاحقاً
    setContactSent(true);
    setContactMsg("");
    setTimeout(() => setContactSent(false), 4000);
  };

  const planLabel =
    PLANS.find(
      (p) =>
        p.name.toLowerCase() === currentPlan.toLowerCase() ||
        p.id.toLowerCase() === currentPlan.toLowerCase() ||
        p.nameAr === currentPlan
    )?.nameAr || currentPlan;

  return (<div className="min-h-screen bg-slate-950 text-slate-100" dir="rtl">
      {/* ===== الشريط العلوي: اسم المستخدم + الخطة + الرصيد ===== */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <div className="px-4 pt-4"><UsageBar />
      {/* PHASE4_QUICK_LINKS */}
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap gap-2 text-xs">
        <a href="/dashboard/images" className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700">الصور</a>
        <a href="/dashboard/video" className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700">الفيديو</a>
        <a href="/dashboard/music" className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700">الموسيقى</a>
        <a href="/dashboard/code" className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700">البرمجة</a>
        <a href="/dashboard/chat" className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700">الدردشة</a>
        <a href="/dashboard/jobs" className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700">سجل الطلبات</a>
        <a href="/dashboard/files" className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700">ملفاتي</a>
        <a href="/dashboard/plans" className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700">الخطط</a>
        <a href="/dashboard/gift" className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700">كود هدية</a>
      </div>
</div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center text-lg shadow-lg shadow-blue-500/20">
              🚀
            </div>
            <div className="hidden sm:block">
              <p className="font-bold text-white text-sm leading-tight">منصة محمد الحزمي</p>
              <p className="text-[10px] text-slate-500">Mohammed Alhazmi AI</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-500">المستخدم: </span>
              <span className="text-white font-semibold">{userName || "..."}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-blue-950/60 border border-blue-800/50">
              <span className="text-slate-500">الخطة: </span>
              <span className="text-blue-400 font-bold">{planLabel}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800/50">
              <span className="text-slate-500">الرصيد: </span>
              <span className="text-emerald-400 font-bold">{credits} REMO</span>
            </div>
            <LanguageSwitcher />
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-400 hover:bg-rose-900/40 font-medium"
            >
              خروج
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">
        {/* ===== ترحيب + تعريف المنصة ===== */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 p-8 md:p-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center text-3xl shadow-xl shadow-blue-600/30 shrink-0">
              🚀
            </div>
            <div className="flex-1 space-y-3">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                مرحباً {userName} 👋
              </h1>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-3xl">
                <strong className="text-white">منصة محمد الحزمي للذكاء الاصطناعي</strong> —
                منظومة عربية متكاملة تجمع توليد الصور، الفيديو، الموسيقى والزفات، برمجة المواقع
                والتطبيقات، والدردشة الذكية في مكان واحد. اختر الخدمة وابدأ الإبداع فوراً.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  +20 مزود AI
                </span>
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  واجهة عربية كاملة
                </span>
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  نظام رصيد مرن
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ===== بطاقات سريعة ===== */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 text-center">
            <p className="text-3xl font-extrabold text-emerald-400">{credits}</p>
            <p className="text-xs text-slate-500 mt-1">رصيد متاح</p>
          </div>
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 text-center">
            <p className="text-3xl font-extrabold text-blue-400">{planLabel}</p>
            <p className="text-xs text-slate-500 mt-1">الخطة الحالية</p>
          </div>
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 text-center">
            <p className="text-3xl font-extrabold text-purple-400">0</p>
            <p className="text-xs text-slate-500 mt-1">مشاريع محفوظة</p>
          </div>
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 text-center">
            <p className="text-3xl font-extrabold text-amber-400">5</p>
            <p className="text-xs text-slate-500 mt-1">أقسام خدمات</p>
          </div>
        </section>

        {/* ===== الخدمات ===== */}
        <section id="services" className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">خدمات المنصة</h2>
            <p className="text-slate-400 text-sm mt-2">
              كل أدوات الذكاء الاصطناعي التي تحتاجها — منظمة في أقسام واضحة
            </p>
          </div>

          <div className="space-y-6">
            {SERVICES.map((section) => (
              <div
                key={section.id}
                className={`rounded-3xl border bg-gradient-to-l ${section.color} p-6 md:p-8`}
              >
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-3xl">{section.icon}</span>
                  <h3 className="text-xl font-bold text-white">{section.title}</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {section.services.map((svc) => (
                    <div
                      key={svc.title}
                      className="rounded-2xl bg-slate-950/70 border border-slate-800/80 p-5 flex flex-col"
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h4 className="font-bold text-white text-sm">{svc.title}</h4>
                        {svc.badge && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                              svc.badge === "متاح"
                                ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                                : "bg-slate-800 text-slate-400 border border-slate-700"
                            }`}
                          >
                            {svc.badge}
                          </span>
                        )}
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-400 flex-1 mb-4">
                        {svc.items.map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <span className="text-green-500 mt-0.5">✔</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                      {svc.href && svc.href !== "#" ? (
                        <Link
                          href={svc.href}
                          className="block text-center rounded-xl bg-blue-600 hover:bg-blue-500 py-2.5 text-sm font-bold transition"
                        >
                          فتح الخدمة
                        </Link>
                      ) : (
                        <button
                          disabled
                          className="w-full rounded-xl bg-slate-800 py-2.5 text-slate-500 text-sm font-bold cursor-not-allowed"
                        >
                          قريباً
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== خطط الاشتراك ===== */}
        <section id="plans" className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-white">خطط الاشتراك</h2>
            <p className="text-slate-400 text-sm mt-1">الأسعار بالدولار الأمريكي (USD)</p>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {PLANS.map((plan) => {
              const isCurrent =
                currentPlan.toLowerCase() === plan.name.toLowerCase() ||
                currentPlan.toLowerCase() === plan.id.toLowerCase() ||
                currentPlan === plan.nameAr;
              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl bg-slate-900 border p-5 flex flex-col ${
                    isCurrent ? "border-blue-500 ring-1 ring-blue-500/40" : "border-slate-800"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-white">{plan.nameAr}</h3>
                    {isCurrent && (
                      <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">
                        الحالية
                      </span>
                    )}
                  </div>
                  <p className="text-3xl font-extrabold text-blue-400 mt-3">
                    {plan.price === 0 ? "مجاناً" : `$${plan.price}`}
                    {plan.price > 0 && (
                      <span className="text-sm text-slate-500 font-normal"> /شهر</span>
                    )}
                  </p>
                  <p className="text-green-400 text-sm mt-1">
                    {plan.credits >= 999999
                      ? "رصيد غير محدود"
                      : `${plan.credits.toLocaleString()} REMO`}
                  </p>
                  <p className="text-slate-500 text-xs mt-2">{plan.description}</p>
                  <ul className="mt-3 space-y-1 text-xs text-slate-400 flex-1">
                    {plan.features.map((f) => (
                      <li key={f}>
                        ✔{" "}
                        {f === "chat"
                          ? "دردشة"
                          : f === "image"
                          ? "صور"
                          : f === "audio"
                          ? "صوت"
                          : f === "video"
                          ? "فيديو"
                          : f}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4">
                    {"viaCodeOnly" in plan && plan.viaCodeOnly ? (
                      <p className="text-center text-xs text-pink-400 py-2">🎁 بكود هدية فقط</p>
                    ) : plan.price === 0 ? (
                      <button
                        disabled
                        className="w-full rounded-xl bg-slate-800 py-2 text-slate-500 text-xs font-bold"
                      >
                        مفعّلة عند التسجيل
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          alert("بوابة الدفع (Stripe / PayPal) قيد الربط — قريباً.")
                        }
                        className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-2 text-xs font-bold"
                      >
                        اشترك — ${plan.price}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ===== كود الهدية ===== */}
        <section className="rounded-2xl bg-slate-900 border border-pink-900/40 p-6">
          <h2 className="text-lg font-bold mb-2">🎁 تفعيل كود هدية</h2>
          <p className="text-slate-400 text-xs mb-4">
            أدخل الكود الذي حصلت عليه من الإدارة لتفعيل الخطة وإضافة الرصيد.
          </p>
          <form onSubmit={handleRedeemGift} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={giftCode}
              onChange={(e) => setGiftCode(e.target.value)}
              placeholder="GIFT-XXXXXX"
              className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-pink-500"
              dir="ltr"
            />
            <button
              type="submit"
              disabled={giftLoading}
              className="px-6 py-2.5 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 rounded-xl text-sm font-bold"
            >
              {giftLoading ? "..." : "تفعيل"}
            </button>
          </form>
          {giftMsg && (
            <p className="mt-3 text-sm text-emerald-400">{giftMsg}</p>
          )}
          {giftErr && <p className="mt-3 text-sm text-red-400">{giftErr}</p>}
        </section>

        {/* ===== إضافات احترافية مقترحة ===== */}
        <section className="grid md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="text-2xl mb-2">📁</div>
            <h3 className="font-bold text-white text-sm">مكتبة المشاريع</h3>
            <p className="text-slate-500 text-xs mt-1">
              جميع أعمالك المحفوظة في مكان واحد للرجوع إليها لاحقاً.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="font-bold text-white text-sm">سجل الاستخدام</h3>
            <p className="text-slate-500 text-xs mt-1">
              تتبع استهلاك الرصيد والطلبات حسب التاريخ والمزود.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="text-2xl mb-2">🔔</div>
            <h3 className="font-bold text-white text-sm">الإشعارات</h3>
            <p className="text-slate-500 text-xs mt-1">
              تنبيهات عند اكتمال التوليد أو انتهاء الاشتراك أو وصول كود هدية.
            </p>
          </div>
        </section>
      </main>

      {/* ===== التذييل: من نحن + تواصل ===== */}
      <footer className="border-t border-slate-800 bg-slate-950 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid md:grid-cols-2 gap-10">
          {/* من نحن */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center">
                🚀
              </div>
              <div>
                <h3 className="font-bold text-white">منصة محمد الحزمي AI</h3>
                <p className="text-[10px] text-slate-500">Mohammed Alhazmi AI Platform</p>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              منصة SaaS عربية احترافية تجمع أحدث تقنيات الذكاء الاصطناعي لإنشاء الصور والفيديو
              والموسيقى والبرمجة والدردشة الذكية. هدفنا تمكين صناع المحتوى والمطورين بأدوات عالمية
              بواجهة عربية سهلة.
            </p>
            <p className="text-slate-500 text-xs mt-4">© 2026 جميع الحقوق محفوظة</p>
          </div>

          {/* نموذج الاتصال */}
          <div>
            <h3 className="font-bold text-white mb-4">تواصل مع المالك</h3>
            {contactSent ? (
              <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-sm">
                تم استلام رسالتك. سنتواصل معك قريباً إن لزم الأمر.
              </div>
            ) : (
              <form onSubmit={handleContact} className="space-y-3">
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  required
                  placeholder="الاسم"
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                />
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                  placeholder="البريد الإلكتروني"
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  dir="ltr"
                />
                <textarea
                  value={contactMsg}
                  onChange={(e) => setContactMsg(e.target.value)}
                  required
                  rows={3}
                  placeholder="رسالتك..."
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-500 resize-none"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-bold"
                >
                  إرسال الرسالة
                </button>
              </form>
            )}
            <p className="text-slate-500 text-xs mt-3">
              أو راسلنا مباشرة:{" "}
              <span className="text-blue-400" dir="ltr">
                support@mohammed-alhazmi.ai
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
