'use client'

import { useEffect, useState } from 'react'

type Props = {
  /** الحد الأدنى للعرض بعد اكتمال تحميل الشعار (مللي ثانية) */
  durationMs?: number
  logoSrc?: string
  message?: string
}

export default function SplashScreen({
  durationMs = 4500,
  logoSrc = '/logo-splash.png',
  message = 'جاري تجهيز المنصة…',
}: Props) {
  const [show, setShow] = useState(true)
  const [fade, setFade] = useState(false)
  const [logoReady, setLogoReady] = useState(false)
  const [progress, setProgress] = useState(0)

  // تحميل مسبق للشعار — لا نبدأ العدّ إلا بعد الجاهزية (أو مهلة أمان)
  useEffect(() => {
    try {
      if (sessionStorage.getItem('remo_splash_done') === '1') {
        setShow(false)
        return
      }
    } catch {
      /* */
    }

    let cancelled = false
    const img = new Image()
    img.onload = () => {
      if (!cancelled) setLogoReady(true)
    }
    img.onerror = () => {
      // حتى لو فشل التحميل نعرض الشاشة بالنص
      if (!cancelled) setLogoReady(true)
    }
    img.src = logoSrc

    // مهلة أمان: لا نعلّق أكثر من 4 ثوانٍ بانتظار الصورة
    const safety = setTimeout(() => {
      if (!cancelled) setLogoReady(true)
    }, 4000)

    return () => {
      cancelled = true
      clearTimeout(safety)
    }
  }, [logoSrc])

  // بعد جاهزية الشعار: نعرض المدة كاملة ثم اختفاء تدريجي
  useEffect(() => {
    if (!show || !logoReady) return

    const fadeAt = Math.max(800, durationMs - 700)
    const tFade = setTimeout(() => setFade(true), fadeAt)
    const tHide = setTimeout(() => {
      setShow(false)
      try {
        sessionStorage.setItem('remo_splash_done', '1')
      } catch {
        /* */
      }
    }, durationMs)

    // شريط تقدّم بسيط
    const start = Date.now()
    const tick = setInterval(() => {
      const p = Math.min(100, ((Date.now() - start) / durationMs) * 100)
      setProgress(p)
    }, 50)

    return () => {
      clearTimeout(tFade)
      clearTimeout(tHide)
      clearInterval(tick)
    }
  }, [show, logoReady, durationMs])

  if (!show) return null

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black transition-opacity duration-700 ${
        fade ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      dir="rtl"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(37,99,235,0.28)_0%,_transparent_70%)]" />

      <div className="relative flex flex-col items-center gap-7 px-6">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-blue-500/25 blur-3xl animate-pulse" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            alt="منصة محمد الحزمي للذكاء الاصطناعي"
            width={224}
            height={224}
            className={`relative w-48 h-48 sm:w-56 sm:h-56 object-contain transition-opacity duration-500 ${
              logoReady ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              animation: logoReady ? 'splashPulse 2.4s ease-in-out infinite' : undefined,
            }}
            onLoad={() => setLogoReady(true)}
          />
        </div>

        <div className="text-center space-y-2">
          <p className="text-slate-100 text-base sm:text-lg font-semibold tracking-wide">
            {message}
          </p>
          <p className="text-slate-500 text-xs">منصة محمد الحزمي للذكاء الاصطناعي</p>
        </div>

        {/* شريط تحميل أوضح */}
        <div className="w-52 h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-l from-blue-500 via-sky-400 to-amber-400 transition-[width] duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <style jsx global>{`
        @keyframes splashPulse {
          0%,
          100% {
            transform: scale(1);
            filter: drop-shadow(0 0 14px rgba(59, 130, 246, 0.45));
          }
          50% {
            transform: scale(1.05);
            filter: drop-shadow(0 0 32px rgba(234, 179, 8, 0.5));
          }
        }
      `}</style>
    </div>
  )
}
