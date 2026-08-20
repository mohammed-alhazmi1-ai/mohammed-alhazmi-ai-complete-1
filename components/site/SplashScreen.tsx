'use client'

import { useEffect, useState } from 'react'

type Props = {
  /** مدة الظهور بالميلي ثانية */
  durationMs?: number
  /** مسار الشعار من public */
  logoSrc?: string
  /** النص تحت الشعار */
  message?: string
}

export default function SplashScreen({
  durationMs = 2200,
  logoSrc = '/logo-splash.png',
  message = 'جاري تجهيز المنصة…',
}: Props) {
  const [show, setShow] = useState(true)
  const [fade, setFade] = useState(false)

  useEffect(() => {
    // لا تكرر الـ splash في نفس الجلسة (اختياري)
    try {
      if (sessionStorage.getItem('remo_splash_done') === '1') {
        setShow(false)
        return
      }
    } catch {
      /* */
    }

    const t1 = setTimeout(() => setFade(true), Math.max(400, durationMs - 400))
    const t2 = setTimeout(() => {
      setShow(false)
      try {
        sessionStorage.setItem('remo_splash_done', '1')
      } catch {
        /* */
      }
    }, durationMs)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [durationMs])

  if (!show) return null

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black transition-opacity duration-500 ${
        fade ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      dir="rtl"
      aria-live="polite"
      aria-busy="true"
    >
      {/* وهج خلفي */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(37,99,235,0.25)_0%,_transparent_70%)]" />

      <div className="relative flex flex-col items-center gap-6 px-6">
        {/* الشعار متحرك */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-3xl animate-pulse" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            alt="منصة محمد الحزمي للذكاء الاصطناعي"
            className="relative w-44 h-44 sm:w-56 sm:h-56 object-contain drop-shadow-[0_0_30px_rgba(59,130,246,0.5)] animate-[spin_12s_linear_infinite]"
            style={{ animation: 'splashPulse 2s ease-in-out infinite' }}
          />
        </div>

        <p className="text-slate-200 text-sm sm:text-base font-medium tracking-wide animate-pulse">
          {message}
        </p>

        {/* شريط تحميل بسيط */}
        <div className="w-40 h-1 rounded-full bg-slate-800 overflow-hidden">
          <div className="h-full w-1/2 rounded-full bg-gradient-to-l from-blue-500 to-amber-400 animate-[splashBar_1.5s_ease-in-out_infinite]" />
        </div>
      </div>

      <style jsx global>{`
        @keyframes splashPulse {
          0%,
          100% {
            transform: scale(1);
            filter: drop-shadow(0 0 12px rgba(59, 130, 246, 0.4));
          }
          50% {
            transform: scale(1.06);
            filter: drop-shadow(0 0 28px rgba(234, 179, 8, 0.45));
          }
        }
        @keyframes splashBar {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
      `}</style>
    </div>
  )
}
