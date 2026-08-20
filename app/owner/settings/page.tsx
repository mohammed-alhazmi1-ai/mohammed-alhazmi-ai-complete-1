'use client'

import Link from 'next/link'

export default function OwnerSettingsHub() {
  return (
    <div className="mx-auto max-w-lg px-4 py-10 text-slate-100" dir="rtl">
      <h1 className="text-xl font-bold mb-1">الإعدادات</h1>
      <p className="text-sm text-slate-400 mb-8">اختر القسم الذي تريد تعديله</p>

      <div className="space-y-4">
        <Link
          href="/owner/settings/landing"
          className="block rounded-2xl border border-slate-700 bg-slate-900/80 p-5 hover:border-blue-500 transition"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">🏠</span>
            <div>
              <h2 className="font-bold text-white text-base">تعديل صفحة الهبوط</h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                النصوص · الأزرار · الشريط المتحرك · عناوين الأقسام · عبارات التسجيل
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/owner/settings/general"
          className="block rounded-2xl border border-slate-700 bg-slate-900/80 p-5 hover:border-blue-500 transition"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚙️</span>
            <div>
              <h2 className="font-bold text-white text-base">الإعدادات العامة</h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                اسم المنصة · الوصف · رصيد المسجّل الجديد · الدعم · الخدمات ·
                الصفحات (من نحن / اتصل بنا) · المدونة · الصيانة · السكربتات · AdSense
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/owner/settings/appearance"
          className="block rounded-2xl border border-slate-700 bg-slate-900/80 p-5 hover:border-blue-500 transition"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">🎨</span>
            <div>
              <h2 className="font-bold text-white text-base">المظهر والواجهة</h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                اللوجو · الأيقونة · خلفية الصفحة الرئيسية · خلفية لوحة المستخدم ·
                اللون الأساسي · ترتيب وتسمية أزرار الصفحة الرئيسية
              </p>
            </div>
          </div>
        </Link>
      </div>

      
        <Link
          href="/owner/settings/social"
          className="block rounded-2xl border border-slate-700 bg-slate-900/80 p-5 hover:border-blue-500 transition"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">📱</span>
            <div>
              <h2 className="font-bold text-white text-base">وسائل التواصل</h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                واتساب · تيليجرام · إنستغرام · يوتيوب · روابط تظهر في الرئيسية ولوحة المستخدم
              </p>
            </div>
          </div>
        </Link>

      <Link href="/owner" className="block text-center text-sm text-slate-500 mt-10">
        ← رجوع للوحة المالك
      </Link>
    </div>
  )
}
