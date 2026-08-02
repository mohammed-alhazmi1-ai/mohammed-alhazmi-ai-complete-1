"use client";

import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">

      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-slate-950 to-purple-900/30"></div>

      <div className="absolute w-96 h-96 bg-blue-600/20 blur-3xl rounded-full -top-20 -right-20"></div>

      <div className="absolute w-96 h-96 bg-purple-600/20 blur-3xl rounded-full bottom-0 left-0"></div>

      <div className="relative container mx-auto max-w-7xl px-6 py-24">

        <div className="text-center">

          <div className="inline-flex items-center rounded-full bg-blue-600/20 border border-blue-500 px-4 py-2 mb-8">

            🚀 منصة عربية متكاملة للذكاء الاصطناعي

          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">

            Mohammed Alhazmi AI

          </h1>

          <h2 className="text-3xl mt-4 font-bold text-blue-400">

            منصة محمد الحزمي للذكاء الاصطناعي

          </h2>

          <p className="mt-8 text-slate-300 text-xl max-w-4xl mx-auto leading-9">

            أنشئ الصور والفيديو والموسيقى والأكواد البرمجية
            باستخدام أحدث نماذج الذكاء الاصطناعي العالمية
            من مكان واحد وبواجهة عربية احترافية.

          </p>

          <div className="mt-12 flex flex-wrap justify-center gap-5">

            <Link
              href="/register"
              className="px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 transition text-lg font-bold"
            >
              ابدأ مجاناً
            </Link>

            <Link
              href="/login"
              className="px-8 py-4 rounded-2xl border border-blue-500 hover:bg-blue-600 transition text-lg font-bold"
            >
              تسجيل الدخول
            </Link>

            <a
              href="#services"
              className="px-8 py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 transition text-lg font-bold"
            >
              استكشف الخدمات
            </a>

          </div>

          <div className="grid md:grid-cols-4 gap-6 mt-24">

            <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="font-bold text-xl">الصور</h3>
              <p className="text-slate-400 mt-2">
                إنشاء وتعديل الصور بالذكاء الاصطناعي
              </p>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6">
              <div className="text-4xl mb-4">🎬</div>
              <h3 className="font-bold text-xl">الفيديو</h3>
              <p className="text-slate-400 mt-2">
                تحويل النص والصورة إلى فيديو احترافي
              </p>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6">
              <div className="text-4xl mb-4">🎵</div>
              <h3 className="font-bold text-xl">الموسيقى</h3>
              <p className="text-slate-400 mt-2">
                أغاني وشيلات وزفات ومؤثرات صوتية
              </p>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6">
              <div className="text-4xl mb-4">💻</div>
              <h3 className="font-bold text-xl">البرمجة</h3>
              <p className="text-slate-400 mt-2">
                مواقع وتطبيقات وأكواد احترافية
              </p>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}
