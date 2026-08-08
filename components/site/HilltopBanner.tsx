'use client'

import { useEffect, useRef } from 'react'

/**
 * بنر HilltopAds — يُحمّل السكربت مرة واحدة داخل الحاوية
 */
export default function HilltopBanner() {
  const boxRef = useRef<HTMLDivElement>(null)
  const loaded = useRef(false)

  useEffect(() => {
    if (loaded.current || !boxRef.current) return
    loaded.current = true

    const host = boxRef.current
    const s = document.createElement('script')
    s.async = true
    s.referrerPolicy = 'no-referrer-when-downgrade'
    // نفس مسار HilltopAds الذي زوّدتنا به
    s.src =
      '//massivesalad.com/b/X.VXs/dDGQlv0/YqWecQ/xermh9Du-Z/UClIkxPyTAc/ysOQTbYbyAOUDKUlt/NRzvIR5/NgjdII4_OJQE'
    // @ts-expect-error إعدادات الشبكة
    s.settings = {}
    host.appendChild(s)

    return () => {
      try {
        host.innerHTML = ''
      } catch {
        /* */
      }
      loaded.current = false
    }
  }, [])

  return (
    <div
      className="w-full min-h-[90px] overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/40 flex items-center justify-center"
      aria-label="إعلان"
    >
      <div ref={boxRef} className="w-full flex justify-center" />
    </div>
  )
}
