'use client'

import { useEffect, useState } from 'react'

export default function AnimatedPlatformName({
  name: nameProp,
  className = '',
  size = 'lg',
}: {
  name?: string
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}) {
  const [name, setName] = useState(nameProp || 'منصة محمد الحزمي للذكاء الاصطناعي')

  useEffect(() => {
    if (nameProp) {
      setName(nameProp)
      return
    }
    ;(async () => {
      try {
        const res = await fetch('/api/settings/public', { cache: 'no-store' })
        const data = await res.json()
        if (data.siteName) setName(data.siteName)
      } catch {
        /* ignore */
      }
    })()
  }, [nameProp])

  const sizeCls =
    size === 'xl'
      ? 'text-3xl sm:text-4xl md:text-5xl'
      : size === 'lg'
        ? 'text-2xl sm:text-3xl'
        : size === 'md'
          ? 'text-xl sm:text-2xl'
          : 'text-base'

  return (
    <div className={`relative w-full max-w-3xl mx-auto text-center ${className}`} dir="rtl">
      <div className="yemen-flag-bar mb-3" aria-hidden>
        <div className="yemen-flag-track">
          <div className="flex h-full w-1/2">
            <div className="yf-red h-full" />
            <div className="yf-white h-full" />
            <div className="yf-black h-full" />
          </div>
          <div className="flex h-full w-1/2">
            <div className="yf-red h-full" />
            <div className="yf-white h-full" />
            <div className="yf-black h-full" />
          </div>
        </div>
      </div>
      <h1 className={`font-black leading-tight ${sizeCls}`}>
        <span className="yemen-title-gradient">{name}</span>
      </h1>
      <p className="mt-2 text-[11px] text-slate-400">🇾🇪 اليمن · ذكاء اصطناعي عربي</p>
    </div>
  )
}
