import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 px-6 py-16 max-w-3xl mx-auto" dir="rtl">
      <Link href="/" className="text-blue-400 text-sm">← الرئيسية</Link>
      <h1 className="text-3xl font-bold text-white mt-6 mb-6">سياسة الخصوصية</h1>
      <div className="space-y-4 text-sm leading-relaxed">
        <p>نحترم خصوصيتك. نجمع البريد والاسم وبيانات الاستخدام اللازمة لتشغيل الخدمة فقط.</p>
        <p>لا نبيع بياناتك لأطراف ثالثة. مفاتيح API تُخزَّن على الخادم ولا تُعرض للمستخدمين.</p>
        <p>يمكنك طلب حذف حسابك بالتواصل مع الدعم.</p>
        <p className="text-slate-500 text-xs">آخر تحديث: 2026</p>
      </div>
    </div>
  );
}
