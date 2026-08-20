'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * إعلان HilltopAds — أسفل خدمات صفحة الهبوط
 */
export default function HilltopBannerBelow() {
  const boxRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'empty'>('loading')

  useEffect(() => {
    const host = boxRef.current
    if (!host) return

    host.innerHTML = ''
    setStatus('loading')

    const s = document.createElement('script')
    s.async = true
    s.referrerPolicy = 'no-referrer-when-downgrade'
    // السكربت الذي زوّدتنا به للإعلان السفلي
    s.src =
      '//massivesalad.com/bOX.Vcsnd/Gblu0UY/WHcx/LeFmL9KuNZ-U/lTk-PcT/cWyoOpT/YGypOkDeUst/NTzGIS5oNxjfII4wOlQj'
    // @ts-expect-error إعدادات الشبكة
    s.settings = {}

    s.onload = () => setStatus('ready')
    s.onerror = () => setStatus('empty')

    host.appendChild(s)

    // إن لم يُحقن محتوى خلال ثوانٍ نُظهر أن المساحة جاهزة
    const t = setTimeout(() => {
      setStatus((prev) => (prev === 'loading' ? 'ready' : prev))
    }, 2500)

    return () => {
      clearTimeout(t)
      try {
        host.innerHTML = ''
      } catch {
        /* */
      }
    }
  }, [])

  return (
    <div className="w-full" dir="ltr">
      <p className="text-center text-[10px] text-slate-600 mb-2" dir="rtl">
        إعلان
      </p>
      <div
        className="w-full min-h-[100px] overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 flex items-center justify-center px-2 py-3"
        aria-label="إعلان أسفل الخدمات"
      >
        <div ref={boxRef} className="w-full max-w-3xl min-h-[90px] flex justify-center items-center" />
      </div>
      {status === 'empty' && (
        <p className="text-center text-[10px] text-slate-600 mt-1" dir="rtl">
          تعذر تحميل الإعلان (قد يكون محظوراً من المتصفح)
        </p>
      )}
    </div>
  )
}
