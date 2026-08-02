import Link from 'next/link';

const services = [
  { icon: '🖼️', title: 'الصور', desc: 'توليد، إزالة خلفية، رفع دقة' },
  { icon: '🎬', title: 'الفيديو', desc: 'نص إلى فيديو، تحريك صور' },
  { icon: '🎵', title: 'الموسيقى', desc: 'أغاني، شيلات، زفات' },
  { icon: '💻', title: 'البرمجة', desc: 'مواقع وتطبيقات وأكواد' },
  { icon: '🤖', title: 'الدردشة', desc: 'مساعد ذكي 24/7' },
  { icon: '📄', title: 'المستندات', desc: 'تلخيص، ترجمة، OCR' },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="text-sm text-slate-400 hover:text-white">← العودة للرئيسية</Link>
        <h1 className="text-3xl font-bold mt-6 mb-8 text-center">خدمات المنصة</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <div key={s.title} className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="text-4xl mb-3">{s.icon}</div>
              <h3 className="text-xl font-bold">{s.title}</h3>
              <p className="text-slate-400 mt-2 text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
