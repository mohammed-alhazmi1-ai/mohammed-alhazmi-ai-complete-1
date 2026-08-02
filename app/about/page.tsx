import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-sm text-slate-400 hover:text-white">← العودة للرئيسية</Link>
        <h1 className="text-3xl font-bold mt-6 mb-4">من نحن</h1>
        <p className="text-slate-400 leading-relaxed">
          منصة محمد الحزمي للذكاء الاصطناعي — منصة SaaS عربية متكاملة تجمع أحدث نماذج الذكاء الاصطناعي
          لإنشاء الصور والفيديو والموسيقى والأكواد والدردشة الذكية.
        </p>
      </div>
    </div>
  );
}
