'use client'

import { useEffect, useRef, useState } from 'react'

type Msg = { role: 'user' | 'assistant'; content: string }

export default function BotChatPage() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'assistant',
      content:
        'مرحباً، أنا المساعد الذكي لمنصة محمد الحزمي. اكتب طلبك وسأرد عليك مباشرة.',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setMessages((m) => [...m, { role: 'user', content: text }])
    setLoading(true)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'chat', prompt: text }),
      })
      const data = await res.json()
      const reply =
        data.text ||
        data.error ||
        (data.ok === false ? 'تعذر الرد من المزود حالياً.' : 'لا يوجد رد.')
      setMessages((m) => [...m, { role: 'assistant', content: String(reply) }])
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: 'خطأ في الاتصال. حاول مرة أخرى.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col" dir="rtl">
      {/* شريط بسيط */}
      <header className="border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 bg-white z-10">
        <div>
          <h1 className="font-bold text-base">المساعد الذكي</h1>
          <p className="text-[11px] text-slate-500">دردشة مباشرة</p>
        </div>
        <a href="/dashboard" className="text-sm text-blue-600">
          رجوع
        </a>
      </header>

      {/* الرسائل */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3 max-w-2xl w-full mx-auto">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-md'
                  : 'bg-slate-100 text-slate-800 rounded-bl-md'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-end">
            <div className="bg-slate-100 text-slate-500 rounded-2xl px-4 py-2 text-sm">
              يكتب...
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* إدخال */}
      <div className="border-t border-slate-200 bg-white p-3 sticky bottom-0">
        <div className="max-w-2xl mx-auto flex gap-2">
          <input
            className="flex-1 rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
            placeholder="اكتب رسالتك..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
            disabled={loading}
          />
          <button
            type="button"
            onClick={send}
            disabled={loading || !input.trim()}
            className="rounded-2xl bg-blue-600 text-white px-5 py-3 text-sm font-medium disabled:opacity-50"
          >
            إرسال
          </button>
        </div>
      </div>
    </div>
  )
}
