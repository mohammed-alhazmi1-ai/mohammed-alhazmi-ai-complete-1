'use client'

import { useEffect, useState } from 'react'

export type SocialItem = {
  id: string
  label: string
  href: string
  icon: string
  enabled: boolean
  order: number
}

const ICONS: Record<string, string> = {
  whatsapp: '🟢',
  telegram: '✈️',
  twitter: '𝕏',
  instagram: '📸',
  youtube: '▶️',
  facebook: '📘',
  tiktok: '🎵',
  snapchat: '👻',
  linkedin: '💼',
  email: '✉️',
  website: '🌐',
}

export default function SocialButtons({
  variant = 'landing',
  className = '',
}: {
  variant?: 'landing' | 'dashboard'
  className?: string
}) {
  const [items, setItems] = useState<SocialItem[]>([])

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/settings/public', { cache: 'no-store' })
        const data = await res.json()
        const list = Array.isArray(data.socialLinks) ? data.socialLinks : []
        setItems(
          list
            .filter((x: SocialItem) => x.enabled && x.href)
            .sort((a: SocialItem, b: SocialItem) => a.order - b.order)
        )
      } catch {
        setItems([])
      }
    })()
  }, [])

  if (!items.length) return null

  const isDash = variant === 'dashboard'

  return (
    <div className={className} dir="rtl">
      <p
        className={`mb-2 ${
          isDash ? 'text-[11px] text-slate-400' : 'text-sm text-slate-300 text-center'
        }`}
      >
        تواصل معنا
      </p>
      <div
        className={`flex flex-wrap gap-2 ${
          isDash ? 'justify-start' : 'justify-center'
        }`}
      >
        {items.map((s) => (
          <a
            key={s.id}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            title={s.label}
            className={
              isDash
                ? 'inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 hover:border-blue-500 hover:text-white transition'
                : 'inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 backdrop-blur px-4 py-2 text-sm text-white hover:bg-white/10 hover:border-white/30 transition'
            }
          >
            <span aria-hidden>{ICONS[s.icon] || '🔗'}</span>
            <span>{s.label}</span>
          </a>
        ))}
      </div>
    </div>
  )
}
