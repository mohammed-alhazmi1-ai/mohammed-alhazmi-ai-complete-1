'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function BlogPage() {
  const [title, setTitle] = useState('المدونة')
  const [intro, setIntro] = useState('')
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/settings/public')
        const data = await res.json()
        setEnabled(data.blogEnabled !== false)
        if (data.blogTitle) setTitle(data.blogTitle)
        if (data.blogIntro) setIntro(data.blogIntro)
      } catch {
        /* */
      }
    })()
  }, [])

  if (!enabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400" dir="rtl">
        المدونة غير مفعّلة حالياً
      </div>
    )
  }

  const templates = [
    { t: 'كيف تبدأ مع توليد الصور بالذكاء الاصطناعي', d: 'دليل سريع للمبتدئين' },
    { t: 'أفضل ممارسات كتابة الـ Prompt', d: 'نصائح لنتائج أدق' },
    { t: 'الفرق بين خطط الاشتراك', d: 'مجاني، برو، أعمال' },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100" dir="rtl">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link href="/" className="text-sm text-slate-400">
          ← الرئيسية
        </Link>
        <h1 className="text-2xl font-bold mt-4 mb-2">{title}</h1>
        <p className="text-slate-400 text-sm mb-8">{intro}</p>
        <div className="space-y-3">
          {templates.map((x) => (
            <article
              key={x.t}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
            >
              <h2 className="font-bold text-white">{x.t}</h2>
              <p className="text-sm text-slate-500 mt-1">{x.d}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
