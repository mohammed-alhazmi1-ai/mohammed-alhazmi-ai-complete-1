'use client'

import { useEffect, useState } from 'react'

const LANGS = [
  { code: 'ar', label: 'العربية', short: 'ع' },
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'fr', label: 'Français', short: 'FR' },
]

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const [lang, setLang] = useState('ar')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('remo_lang') || 'ar'
      setLang(saved)
      document.documentElement.lang = saved
      document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr'
    } catch {
      /* */
    }
  }, [])

  function pick(code: string) {
    setLang(code)
    setOpen(false)
    try {
      localStorage.setItem('remo_lang', code)
      document.documentElement.lang = code
      document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr'
    } catch {
      /* */
    }
  }

  const current = LANGS.find((l) => l.code === lang) || LANGS[0]

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/80 text-slate-200 hover:border-blue-500 hover:text-white transition ${
          compact ? 'px-2 py-1.5 text-xs' : 'px-2.5 py-1.5 text-sm'
        }`}
        aria-label="تغيير اللغة"
        title="اللغة / Language"
      >
        <span aria-hidden>🌐</span>
        <span className="font-medium">{current.short}</span>
      </button>
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[80]"
            aria-label="إغلاق"
            onClick={() => setOpen(false)}
          />
          <ul className="absolute top-full mt-1 end-0 z-[90] min-w-[9rem] rounded-xl border border-slate-700 bg-slate-950 shadow-xl py-1 overflow-hidden">
            {LANGS.map((l) => (
              <li key={l.code}>
                <button
                  type="button"
                  onClick={() => pick(l.code)}
                  className={`w-full text-start px-3 py-2 text-sm hover:bg-slate-800 transition ${
                    lang === l.code ? 'text-blue-400 font-semibold' : 'text-slate-300'
                  }`}
                >
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
