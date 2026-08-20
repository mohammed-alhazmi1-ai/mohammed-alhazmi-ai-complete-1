'use client'

import { useEffect, useRef } from 'react'

export default function HilltopBannerBelow() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.innerHTML = ''
    const s = document.createElement('script')
    s.async = true
    s.referrerPolicy = 'no-referrer-when-downgrade'
    ;(s as any).settings = {}
    s.src =
      '//massivesalad.com/bOX.Vcsnd/Gblu0UY/WHcx/LeFmL9KuNZ-U/lTk-PcT/cWyoOpT/YGypOkDeUst/NTzGIS5oNxjfII4wOlQj'
    el.appendChild(s)
    return () => {
      try {
        el.innerHTML = ''
      } catch {
        /* */
      }
    }
  }, [])

  return (
    <div className="w-full flex justify-center overflow-hidden min-h-[50px]" dir="ltr">
      <div ref={ref} className="w-full max-w-3xl min-h-[50px]" />
    </div>
  )
}
