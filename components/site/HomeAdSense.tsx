'use client'

import { useEffect, useState } from 'react'

declare global {
  interface Window {
    adsbygoogle: any[]
  }
}

export default function HomeAdSense({ slot }: { slot?: 'home' | 'home2' }) {
  const [cfg, setCfg] = useState<{
    enabled: boolean
    client: string
    slotId: string
  } | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/settings/public', { cache: 'no-store' })
        const data = await res.json()
        if (!data.adsenseEnabled || !data.adsenseClient) {
          setCfg({ enabled: false, client: '', slotId: '' })
          return
        }
        const slotId =
          slot === 'home2' ? data.adsenseSlotHome2 : data.adsenseSlotHome
        setCfg({
          enabled: Boolean(slotId),
          client: data.adsenseClient,
          slotId: slotId || '',
        })
      } catch {
        setCfg({ enabled: false, client: '', slotId: '' })
      }
    })()
  }, [slot])

  useEffect(() => {
    if (!cfg?.enabled || !cfg.client) return
    const id = 'adsense-script'
    if (!document.getElementById(id)) {
      const s = document.createElement('script')
      s.id = id
      s.async = true
      s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${cfg.client}`
      s.crossOrigin = 'anonymous'
      document.head.appendChild(s)
    }
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      /* */
    }
  }, [cfg])

  if (!cfg?.enabled) return null

  return (
    <div className="my-6 flex justify-center overflow-hidden min-h-[90px]">
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client={cfg.client}
        data-ad-slot={cfg.slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}
