import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 px-6 py-16 max-w-3xl mx-auto" dir="rtl">
      <Link href="/" className="text-blue-400 text-sm">← الرئيسية</Link>
      <h1 className="text-3xl font-bold text-white mt-6 mb-6">شروط الاستخدام</h1>
      <div className="space-y-4 text-sm leading-relaxed">
        <p>باستخدام المنصة فإنك توافق على عدم إساءة استخدام خدمات الذكاء الاصطناعي أو انتهاك القوانين.</p>
        <p>الرصيد غير قابل للاسترداد نقداً إلا وفق سياسة الاسترجاع المعتمدة.</p>
        <p>نحتفظ بحق تعليق الحسابات المخالفة أو إساءة الاستخدام.</p>
        <p className="text-slate-500 text-xs">آخر تحديث: 2026</p>
      </div>
    </div>
  );
}
