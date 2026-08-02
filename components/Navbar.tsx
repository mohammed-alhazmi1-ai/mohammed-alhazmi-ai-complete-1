"use client";

import Link from "next/link";

const links = [
  { href: "#services", label: "الخدمات" },
  { href: "#pricing", label: "الأسعار" },
  { href: "#about", label: "من نحن" },
  { href: "#faq", label: "الأسئلة الشائعة" },
  { href: "#contact", label: "تواصل معنا" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-slate-950/80 border-b border-slate-800">
      <div className="container mx-auto max-w-7xl flex items-center justify-between px-6 py-4">

        <Link href="/" className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-xl font-bold">
            AI
          </div>

          <div>
            <h1 className="text-xl font-bold">
              Mohammed Alhazmi AI
            </h1>

            <p className="text-xs text-slate-400">
              منصة الذكاء الاصطناعي العربية
            </p>
          </div>
        </Link>

        <nav className="hidden lg:flex gap-8">
          {links.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-slate-300 hover:text-blue-400 transition"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex gap-3">

          <Link
            href="/login"
            className="px-5 py-2 rounded-xl border border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white transition"
          >
            تسجيل الدخول
          </Link>

          <Link
            href="/register"
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition"
          >
            ابدأ مجانًا
          </Link>

        </div>

      </div>
    </header>
  );
}
