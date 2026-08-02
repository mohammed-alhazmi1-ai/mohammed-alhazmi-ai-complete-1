import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-sm text-slate-400 hover:text-white">← العودة للرئيسية</Link>
        <h1 className="text-3xl font-bold mt-6 mb-4">تواصل معنا</h1>
        <p className="text-slate-400">support@mohammed-alhazmi.ai</p>
        <p className="text-slate-500 mt-2 text-sm">اليمن — متوفر 24/7</p>
      </div>
    </div>
  );
}
