'use client';
import Link from 'next/link';

const LINKS = [
  { href: '/owner/users', label: 'المستخدمون' },
  { href: '/owner/gifts', label: 'أكواد الهدايا' },
  { href: '/owner/costs', label: 'تكاليف الخدمات' },
  { href: '/owner/payments', label: 'شحن يدوي' },
  { href: '/owner/payment-settings', label: 'إعدادات الدفع' },
  { href: '/owner/providers', label: 'مزودو AI' },
  { href: '/owner/maintenance', label: 'الصيانة' },
];

export default function OwnerHome() {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-8" dir="rtl">
      <h1 className="text-2xl font-bold mb-6">لوحة المالك</h1>
      <a href="/owner/settings" className="block rounded-2xl border border-slate-700 p-4 mb-3 font-medium">⚙️ إعدادات المنصة (المرحلة A)</a>
      <div className="grid sm:grid-cols-2 gap-3 max-w-2xl">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href}
            className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-4 hover:border-slate-600 text-sm font-bold">
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
