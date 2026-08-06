'use client'

import FileActions from '@/components/dashboard/FileActions'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

type Msg = {
  role: 'user' | 'assistant'
  content: string
  links?: { label: string; href: string }[]
  imageUrl?: string | null
  videoUrl?: string | null
}

function Media({ imageUrl, videoUrl }: { imageUrl?: string | null; videoUrl?: string | null }) {
  if (!imageUrl && !videoUrl) return null
  return (
    <div className="mt-2 space-y-2">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="مرفق" className="max-h-56 rounded-xl border border-slate-200 object-contain w-full bg-white" />
      ) : null}
      {videoUrl ? (
        videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
          <a href={videoUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-700 underline block">
            مشاهدة الفيديو
          </a>
        ) : (
          <video src={videoUrl} controls className="w-full max-h-56 rounded-xl bg-black" />
        )
      ) : null}
    </div>
  )
}

export default function PlatformBotPage() {
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [attachName, setAttachName] = useState('')
  const [attachData, setAttachData] = useState('')
  const [name, setName] = useState('مساعد المنصة')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/bot/platform')
        const data = await res.json()
        if (data.name) setName(data.name)
        setMessages([{ role: 'assistant', content: data.welcome || 'مرحباً، اسأل بحرية.' }])
      } catch {
        setMessages([{ role: 'assistant', content: 'مرحباً، اسأل عن المنصة.' }])
      }
    })()
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send() {
    let text = input.trim()
    if (attachName) text = text ? `${text}\n\n[مرفق: ${attachName}]` : `تحليل المرفق: ${attachName}`
    if (!text || loading) return
    setInput('')
    const history = [...messages, { role: 'user' as const, content: text }]
    setMessages(history)
    setLoading(true)
    try {
      const res = await fetch('/api/bot/platform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: history.map((m) => ({ role: m.role, content: m.content })),
        }),
      })
      const data = await res.json()
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content: data.text || data.error || 'تعذر الرد',
          links: data.links || [],
          imageUrl: data.imageUrl,
          videoUrl: data.videoUrl,
        },
      ])
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: 'خطأ اتصال' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex flex-col bg-white text-slate-900 rounded-2xl border border-slate-200 overflow-hidden" dir="rtl">
      <header className="border-b border-slate-200 px-4 py-3 flex justify-between bg-white">
        <div>
          <h1 className="font-bold">{name}</h1>
          <p className="text-[11px] text-slate-500">بحث محسّن · وسائط · بلا حد رسائل</p>
        </div>
        <Link href="/dashboard" className="text-sm text-blue-600">رجوع</Link>
      </header>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3 max-w-2xl w-full mx-auto">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
            <div
              className={`max-w-[90%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'
              }`}
            >
              {m.content}
              <Media imageUrl={m.imageUrl} videoUrl={m.videoUrl} />
              {m.links && m.links.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {m.links.map((l) => (
                    <a key={l.href} href={l.href} className="text-[11px] underline text-blue-700">
                      {l.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-end">
            <div className="bg-slate-100 text-slate-500 rounded-2xl px-4 py-2 text-sm">يكتب...</div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t border-slate-200 p-3">
        <div className="max-w-2xl mx-auto mb-2">
          <FileActions
            resultText={messages.filter((m) => m.role === 'assistant').map((m) => m.content).join('\n\n---\n\n')}
            resultUrl={messages.map((m) => m.imageUrl).filter(Boolean).pop() as string | undefined}
            onUploaded={({ originalName, url } => {
              setAttachName(originalName)
              setAttachData(dataUrl)
              setInput((v) => v || `لدي ملف: ${name} — `)
            }}
            labelUpload="رفع ملف"
            labelDownload="تحميل المحادثة"
          />
          {attachName ? <p className="text-[10px] text-slate-500 mt-1">مرفق: {attachName}</p> : null}
        </div>
        <div className="max-w-2xl mx-auto flex gap-2">
          <input
            className="flex-1 rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
            placeholder="اكتب سؤالك..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
            disabled={loading}
          />
          <button type="button" onClick={send} disabled={loading || !input.trim()} className="rounded-2xl bg-blue-600 text-white px-5 py-3 text-sm disabled:opacity-50">
            إرسال
          </button>
        </div>
      </div>
    </div>
  )
}
