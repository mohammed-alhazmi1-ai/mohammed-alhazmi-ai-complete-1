'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabase'

const supabase = getSupabase()

const NAV = [
  { href: '/dashboard', label: 'الصفحة الرئيسية', icon: '🏠' },
  { href: '/dashboard/images', label: 'الصور', icon: '🖼️' },
  { href: '/dashboard/video', label: 'الفيديو', icon: '🎬' },
  { href: '/dashboard/music', label: 'الموسيقى', icon: '🎵' },
  { href: '/dashboard/code', label: 'البرمجة', icon: '💻' },
  { href: '/dashboard/chat', label: 'الدردشة', icon: '🤖' },
  { href: '/dashboard/bot', label: 'المساعد الذكي', icon: '🧠' },
  { href: '/dashboard/jobs', label: 'سجل الطلبات', icon: '📋' },
  { href: '/dashboard/files', label: 'ملفاتي', icon: '📁' },
  { href: '/dashboard/plans', label: 'الخطط', icon: '📦' },
  { href: '/dashboard/billing', label: 'شحن REMO', icon: '💳' },
  { href: '/dashboard/gift', label: 'كود هدية', icon: '🎁' },
]

export default function UserShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/dashboard'
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('...')
  const [plan, setPlan] = useState('Free')
  const [credits, setCredits] = useState<number | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) {
          window.location.href = '/login'
          return
        }
        const u = session.user
        const meta = u.user_metadata || {}
        const n =
          [meta.first_name, meta.last_name].filter(Boolean).join(' ') ||
          meta.username ||
          meta.full_name ||
          (u.email ? u.email.split('@')[0] : 'مستخدم')
        setName(n)
        try {
          const res = await fetch('/api/user/me', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: u.email }),
          })
          const data = await res.json()
          if (typeof data.credits === 'number') setCredits(data.credits)
          if (data.plan) setPlan(data.plan)
          if (data.username || data.firstName) {
            setName(
              [data.firstName, data.lastName].filter(Boolean).join(' ') ||
                data.username ||
                n
            )
          }
        } catch {
          /* */
        }
      } catch {
        /* */
      }
    })()
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100" dir="rtl">
      {/* شريط علوي ثابت */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
        <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              className="lg:hidden rounded-lg border border-slate-700 px-2.5 py-1.5 text-sm"
              onClick={() => setOpen((v) => !v)}
              aria-label="القائمة"
            >
              ☰
            </button>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center text-sm shrink-0">
              🚀
            </div>
            <div className="min-w-0 hidden sm:block">
              <p className="text-xs font-bold text-white truncate">منصة محمد الحزمي</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs flex-wrap justify-end">
            <span className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 truncate max-w-[120px] sm:max-w-[180px]">
              <span className="text-slate-500">المستخدم </span>
              <span className="font-semibold text-white">{name}</span>
            </span>
            <span className="px-2 py-1 rounded-lg bg-blue-950/50 border border-blue-900/50">
              <span className="text-slate-500">الخطة </span>
              <span className="font-bold text-blue-300">{plan}</span>
            </span>
            <span className="px-2 py-1 rounded-lg bg-emerald-950/40 border border-emerald-900/50">
              <span className="text-slate-500">الرصيد </span>
              <span className="font-bold text-emerald-400">
                {credits === null ? '...' : credits} REMO
              </span>
            </span>
            <button
              type="button"
              onClick={logout}
              className="px-2 py-1 rounded-lg border border-rose-900/40 text-rose-400 hover:bg-rose-950/30"
            >
              خروج
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* خلفية الجوال */}
        {open && (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="إغلاق"
          />
        )}

        {/* قائمة جانبية */}
        <aside
          className={`fixed lg:sticky top-[52px] z-40 h-[calc(100vh-52px)] w-64 shrink-0 border-l border-slate-800 bg-slate-950 transition-transform lg:translate-x-0 ${
            open ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
          } right-0 lg:right-auto`}
        >
          <nav className="flex flex-col gap-0.5 p-3 overflow-y-auto h-full pb-20">
            {NAV.map((item) => {
              const active =
                item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition ${
                    active
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* المحتوى */}
        <main className="flex-1 min-w-0 px-3 sm:px-6 py-6 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  )
}
