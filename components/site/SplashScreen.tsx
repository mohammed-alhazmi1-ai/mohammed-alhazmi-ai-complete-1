'use client'

import { useEffect, useState } from 'react'

type Props = {
  durationMs?: number
  logoSrc?: string
  message?: string
}

const FORCE_KEY = 'remo_splash_force'
const MSG_KEY = 'remo_splash_message'

const AUTH_MSG =
  'انتظر قليلاً… سيتم تحويلك الآن إلى لوحة التحكم وصفحة الخدمات'

export default function SplashScreen({
  durationMs = 4800,
  logoSrc = '/logo-splash.png',
  message = 'جاري تجهيز المنصة…',
}: Props) {
  const [show, setShow] = useState(true)
  const [fade, setFade] = useState(false)
  const [logoReady, setLogoReady] = useState(false)
  const [progress, setProgress] = useState(0)
  const [msg, setMsg] = useState(message)

  // كل تحميل / تحديث للصفحة → إظهار الشاشة
  useEffect(() => {
    try {
      const force = sessionStorage.getItem(FORCE_KEY) === '1'
      const custom = sessionStorage.getItem(MSG_KEY)
      if (force) {
        sessionStorage.removeItem(FORCE_KEY)
        setMsg(custom || AUTH_MSG)
        try {
          sessionStorage.removeItem(MSG_KEY)
        } catch {
          /* */
        }
      } else {
        setMsg(message)
      }
    } catch {
      setMsg(message)
    }
    setShow(true)
    setFade(false)
    setProgress(0)
    setLogoReady(false)
  }, [message])

  // تحميل الشعار
  useEffect(() => {
    if (!show) return
    let cancelled = false
    const img = new Image()
    img.onload = () => {
      if (!cancelled) setLogoReady(true)
    }
    img.onerror = () => {
      if (!cancelled) setLogoReady(true)
    }
    img.src = logoSrc
    const safety = setTimeout(() => {
      if (!cancelled) setLogoReady(true)
    }, 4000)
    return () => {
      cancelled = true
      clearTimeout(safety)
    }
  }, [show, logoSrc])

  // العدّ بعد جاهزية الصورة
  useEffect(() => {
    if (!show || !logoReady) return

    const fadeAt = Math.max(800, durationMs - 700)
    const tFade = setTimeout(() => setFade(true), fadeAt)
    const tHide = setTimeout(() => setShow(false), durationMs)

    const start = Date.now()
    const tick = setInterval(() => {
      setProgress(Math.min(100, ((Date.now() - start) / durationMs) * 100))
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
      <div className="relative flex flex-col items-center gap-7 px-6 max-w-sm text-center">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-blue-500/25 blur-3xl animate-pulse" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            alt="منصة محمد الحزمي"
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
        <div className="space-y-2">
          <p className="text-slate-100 text-base sm:text-lg font-semibold tracking-wide leading-relaxed">
            {msg}
          </p>
          <p className="text-slate-500 text-xs">منصة محمد الحزمي للذكاء الاصطناعي</p>
        </div>
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

/** بعد نجاح login/register */
export function triggerAuthSplash(customMessage?: string) {
  try {
    sessionStorage.setItem(FORCE_KEY, '1')
    sessionStorage.setItem(
      MSG_KEY,
      customMessage ||
        'انتظر قليلاً… سيتم تحويلك الآن إلى لوحة التحكم وصفحة الخدمات'
    )
  } catch {
    /* */
  }
}
