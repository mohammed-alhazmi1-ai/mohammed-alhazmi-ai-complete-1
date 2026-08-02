'use client';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Lang, translations, TranslationKey, LANG_LABELS } from './translations';

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
  dir: 'rtl' | 'ltr';
  labels: typeof LANG_LABELS;
};

const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ar');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ma_lang') as Lang | null;
      if (saved && translations[saved]) setLangState(saved);
    } catch {}
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem('ma_lang', l);
    } catch {}
    if (typeof document !== 'undefined') {
      document.documentElement.lang = l;
      document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
    }
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }
  }, [lang]);

  const t = useCallback(
    (key: TranslationKey) => {
      return translations[lang]?.[key] ?? translations.ar[key] ?? key;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        t,
        dir: lang === 'ar' ? 'rtl' : 'ltr',
        labels: LANG_LABELS,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // fallback if used outside provider
    return {
      lang: 'ar' as Lang,
      setLang: () => {},
      t: (key: TranslationKey) => translations.ar[key] ?? key,
      dir: 'rtl' as const,
      labels: LANG_LABELS,
    };
  }
  return ctx;
}
