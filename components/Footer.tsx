"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer id="contact" className="bg-slate-950 border-t border-slate-800">

      <div className="max-w-7xl mx-auto px-6 py-16">

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">

          <div>

            <h2 className="text-2xl font-bold text-blue-400">
              Mohammed Alhazmi AI
            </h2>

            <p className="mt-5 text-slate-400 leading-8">
              منصة عربية احترافية تجمع أحدث تقنيات الذكاء الاصطناعي
              لإنشاء الصور والفيديو والموسيقى والبرمجة والدردشة الذكية.
            </p>

          </div>

          <div>

            <h3 className="text-xl font-bold mb-5">
              خدمات المنصة
            </h3>

            <ul className="space-y-3 text-slate-400">

              <li>🎨 الصور</li>
              <li>🎬 الفيديو</li>
              <li>🎵 الموسيقى</li>
              <li>💻 البرمجة</li>
              <li>🤖 الدردشة</li>

            </ul>

          </div>

          <div>

            <h3 className="text-xl font-bold mb-5">
              روابط مهمة
            </h3>

            <div className="flex flex-col gap-3">

              <Link href="/about">من نحن</Link>

              <Link href="/pricing">الخطط</Link>

              <Link href="/privacy">سياسة الخصوصية</Link>

              <Link href="/terms">الشروط والأحكام</Link>

              <Link href="/contact">تواصل معنا</Link>

            </div>

          </div>

          <div>

            <h3 className="text-xl font-bold mb-5">
              تواصل معنا
            </h3>

            <div className="space-y-3 text-slate-400">

              <p>📧 support@mohammed-alhazmi.ai</p>

              <p>🌍 Yemen</p>

              <p>🤖 متوفر 24/7</p>

            </div>

          </div>

        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-500">

          © 2026 Mohammed Alhazmi AI
          <br/>
          جميع الحقوق محفوظة.

        </div>

      </div>

    </footer>
  );
}
