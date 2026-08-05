import type { ReactNode } from 'react'
import Link from 'next/link'

export default function OwnerPageShell({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children?: ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-6" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-start gap-4 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            {description ? (
              <p className="text-slate-400 text-xs mt-1">{description}</p>
            ) : null}
          </div>
          <Link href="/owner" className="text-xs text-slate-400 hover:text-white shrink-0">
            ← الرئيسية
          </Link>
        </div>
        {children}
      </div>
    </div>
  )
}
