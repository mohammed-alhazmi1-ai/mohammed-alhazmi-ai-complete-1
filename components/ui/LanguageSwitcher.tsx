'use client';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Lang } from '@/lib/i18n/translations';

export default function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { lang, setLang, labels, t } = useLanguage();

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <label className="sr-only">{t('language')}</label>
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as Lang)}
        className="appearance-none bg-slate-900 border border-slate-700 text-slate-200 text-xs font-medium rounded-xl px-3 py-1.5 pr-7 cursor-pointer focus:outline-none focus:border-blue-500"
      >
        {(Object.keys(labels) as Lang[]).map((l) => (
          <option key={l} value={l}>
            {labels[l]}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-[10px]">
        ▾
      </span>
    </div>
  );
}
