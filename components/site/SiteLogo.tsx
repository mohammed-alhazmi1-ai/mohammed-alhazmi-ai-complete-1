'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function SiteLogo({
  className = 'h-10 w-auto object-contain',
  showName = true,
}: {
  className?: string
  showName?: boolean
}) {
  const [logo, setLogo] = useState('')
  const [name, setName] = useState('منصة محمد الحزمي')

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/settings/public', { cache: 'no-store' })
        const data = await res.json()
        if (data.logoUrl) setLogo(data.logoUrl)
        if (data.siteName) setName(data.siteName)
      } catch {
        /* ignore */
      }
    })()
  }, [])

  return (
    <Link href="/" className="flex items-center gap-2 min-w-0">
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt={name} className={className} />
      ) : (
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center text-lg shrink-0">
          🚀
        </div>
      )}
      {showName && (
        <span className="font-bold text-white text-sm truncate hidden sm:inline">{name}</span>
      )}
    </Link>
  )
}
