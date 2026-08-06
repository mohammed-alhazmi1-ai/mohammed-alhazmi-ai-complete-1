'use client'

import { useEffect, useRef, useState } from 'react'
import FileActions from '@/components/dashboard/FileActions'

type Msg = {
  role: 'user' | 'assistant'
  content: string
  imageUrl?: string
}

export default function BotPage() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'assistant',
      content: 'مرحباً، أنا مساعد المنصة. اكتب سؤالك أو ارفع مرفقاً.',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [name] = useState('مساعد المنصة')
  const [attachName, setAttachName] = useState('')
  const [attachUrl, setAttachUrl] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    const userMsg: Msg = { role: 'user', content: text }
    const history = [...messages, userMsg]
    setMessages(history)
    setLoading(true)
    try {
      const res = await fetch('/api/bot/platform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: history.slice(-12),
          attachment: attachUrl
            ? { name: attachName, url: attachUrl }
            : undefined,
        }),
      })
      const data = await res.json().catch(() => ({}))
      const reply =
        data.reply ||
        data.message ||
        data.text ||
        (res.ok ? 'تم استلام رسالتك.' : data.error || 'تعذر الرد الآن.')
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: String(reply),
          imageUrl: data.imageUrl || undefined,
        },
      ])
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: e?.message || 'خطأ في الاتصال' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-[70vh] flex flex-col bg-white text-slate-900 rounded-2xl border border-slate-200 overflow-hidden"
      dir="rtl"
    >
      <header className="border-b border-slate-200 px-4 py-3 flex justify-between bg-white">
        <div>
          <h1 className="font-bold">{name}</h1>
          <p className="text-xs text-slate-500">ردود من معرفة المنصة</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === 'user'
                ? 'max-w-[90%] mr-auto rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap bg-blue-600 text-white'
                : 'max-w-[90%] ml-auto rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap bg-white border border-slate-200 text-slate-800'
            }
          >
            {m.content}
            {m.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={m.imageUrl}
                alt=""
                className="mt-2 max-h-48 rounded-lg border border-slate-200"
              />
            ) : null}
          </div>
        ))}
        {loading ? <div className="text-xs text-slate-500">جاري الكتابة...</div> : null}
        <div ref={endRef} />
      </div>

      <div className="border-t border-slate-200 p-3 space-y-2 bg-white">
        <FileActions
          resultText={messages
            .filter((m) => m.role === 'assistant')
            .map((m) => m.content)
            .join('\n\n---\n\n')}
          resultUrl={
            (messages.map((m) => m.imageUrl).filter(Boolean).pop() as string | undefined) ||
            undefined
          }
          onUploaded={({ originalName, url }) => {
            setAttachName(originalName)
            setAttachUrl(url)
            setInput((v) =>
              v ? v + ' [مرفق: ' + originalName + ']' : '[مرفق: ' + originalName + '] ' + url
            )
          }}
          labelUpload="رفع ملف"
          labelDownload="تحميل المحادثة"
        />

        <div className="flex gap-2">
          <input
            className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm"
            placeholder="اكتب رسالتك..."
            value={input}
            disabled={loading}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
          />
          <button
            type="button"
            disabled={loading || !input.trim()}
            onClick={send}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
          >
            إرسال
          </button>
        </div>
      </div>
    </div>
  )
}
