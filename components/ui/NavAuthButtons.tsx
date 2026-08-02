'use client';
import Link from 'next/link';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function NavAuthButtons() {
  const { t } = useLanguage();
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <LanguageSwitcher />
      <Link
        href="/login"
        className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white border border-transparent hover:border-slate-700 transition-all"
      >
        {t('login')}
      </Link>
      <Link
        href="/signup"
        className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-600/25 transition-all"
      >
        {t('signup')}
      </Link>
    </div>
  );
}
