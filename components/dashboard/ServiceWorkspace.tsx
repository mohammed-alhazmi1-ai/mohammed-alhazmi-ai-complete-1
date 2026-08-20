'use client'

import { getSupabase } from '@/lib/supabase'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'

type Msg = {
  id: string
  role: 'user' as const | 'assistant' | 'system'
  content: string
  imageUrl?: string
  provider?: string
  model?: string
  cost?: number
}

type ProviderOpt = { slug: string; name: string }

type Thread = {
  id: string
  title: string
  service: string
  messages: Msg[]
  updatedAt: number
}

function storageKey(service: string, email?: string) {
  return `remo_threads_\( {service}_ \){(email || 'guest').toLowerCase()}`
}

function loadLocalThreads(service: string, email?: string): Thread[] {
  try {
    const raw = localStorage.getItem(storageKey(service, email))
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function saveLocalThreads(service: string, email: string | undefined, threads: Thread[]) {
  try {
    localStorage.setItem(storageKey(service, email), JSON.stringify(threads.slice(0, 40)))
  } catch {
    /* */
  }
}



const SERVICE_META: Record<
  string,
  { title: string; icon: string; color: string; cost: number; type: string }
> = {
  images: { title: 'الصور', icon: '🖼️', color: 'from-pink-950/40 to-slate-950', cost: 20, type: 'images' },
  video: { title: 'الفيديو', icon: '🎬', color: 'from-violet-950/40 to-slate-950', cost: 40, type: 'video' },
  music: { title: 'الموسيقى', icon: '🎵', color: 'from-emerald-950/40 to-slate-950', cost: 30, type: 'music' },
  code: { title: 'البرمجة', icon: '💻', color: 'from-sky-950/40 to-slate-950', cost: 10, type: 'code' },
  chat: { title: 'الدردشة', icon: '💬', color: 'from-blue-950/40 to-slate-950', cost: 5, type: 'chat' },
  bot: { title: 'المساعد', icon: '🤖', color: 'from-amber-950/40 to-slate-950', cost: 5, type: 'chat' },
  'text-generator': { title: 'توليد النصوص', icon: '✍️', color: 'from-slate-900 to-slate-950', cost: 5, type: 'chat' },
}

const TEMPLATES: Record<string, { id: string; title: string; prompt: string; icon: string }[]> = {
  images: [
    { id: '1', title: 'شعار', icon: '✨', prompt: 'صمّم شعاراً احترافياً بسيطاً لمنصة ذكاء اصطناعي عربية باسم منصة محمد الحزمي' },
    { id: '2', title: 'صورة منتج', icon: '📦', prompt: 'صورة إعلانية احترافية لمنتج على خلفية نظيفة بإضاءة استوديو' },
    { id: '3', title: 'بورتريه', icon: '👤', prompt: 'بورتريه احترافي لشخص بإضاءة سينمائية وخلفية ناعمة' },
  ],
  music: [
    { id: '1', title: 'شيلة', icon: '🥁', prompt: 'اكتب كلمات وإيقاع لشيلة حماسية عن الإنجاز والفخر' },
    { id: '2', title: 'زفة', icon: '💍', prompt: 'وصف موسيقي لزفة عروس هادئة مع آلات شرقية' },
  ],
  video: [
    { id: '1', title: 'إعلان قصير', icon: '📱', prompt: 'سيناريو فيديو إعلاني 15 ثانية لمنتج تقني' },
  ],
  code: [
    { id: '1', title: 'صفحة هبوط', icon: '🌐', prompt: 'اكتب كود HTML/CSS لصفحة هبوط بسيطة بالعربية' },
  ],
  chat: [
    { id: '1', title: 'شرح مبسّط', icon: '📚', prompt: 'اشرح لي بأسلوب بسيط:' },
  ],
  bot: [
    { id: '1', title: 'مساعدة', icon: '🤝', prompt: 'ساعدني في:' },
  ],
  'text-generator': [
    { id: '1', title: 'مقال', icon: '📝', prompt: 'اكتب مقالاً قصيراً عن:' },
  ],
}

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

export default function ServiceWorkspace({ service }: { service: string }) {
  const meta = SERVICE_META[service] || SERVICE_META.chat
  const templates = TEMPLATES[service] || TEMPLATES.chat

  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [provider, setProvider] = useState('auto')
  const [providers, setProviders] = useState<ProviderOpt[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [threads, setThreads] = useState<Thread[]>([])
  const [threadId, setThreadId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [serverJobs, setServerJobs] = useState<any[]>([])
  const [userEmail, setUserEmail] = useState('')

  const bottomRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/providers', { cache: 'no-store' })
        const data = await res.json().catch(() => ({}))
        const list = Array.isArray(data.providers)
          ? data.providers
          : Array.isArray(data)
            ? data
            : []
        const opts = list
          .filter((p: any) => p && (p.slug || p.id))
          .map((p: any) => ({
            slug: String(p.slug || p.id),
            name: String(p.name || p.slug || p.id),
          }))
        if (opts.length) setProviders(opts)
        else {
          setProviders([
            { slug: 'gemini', name: 'Gemini' },
            { slug: 'replicate', name: 'Replicate' },
            { slug: 'huggingface', name: 'Hugging Face' },
          ])
        }
      } catch {
        setProviders([
          { slug: 'gemini', name: 'Gemini' },
          { slug: 'replicate', name: 'Replicate' },
          { slug: 'huggingface', name: 'Hugging Face' },
        ])
      }
    })()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const costLabel = useMemo(() => meta.cost, [meta.cost])

  
  function downloadText(text: string, name = 'result.txt') {
    try {
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = name
      a.click()
      URL.revokeObjectURL(url)
    } catch { /* */ }
  }

  function downloadUrl(url: string, name = 'result') {
    try {
      const a = document.createElement('a')
      a.href = url
      a.download = name
      a.target = '_blank'
      a.rel = 'noopener'
      a.click()
    } catch { /* */ }
  }

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    // صور: نرفق وصفاً + نقرأ كـ data URL إن لزم
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = String(reader.result || '')
        setInput((prev) => {
          const note = prev.trim()
            ? prev.trim() + '\n\n[تم رفع صورة: ' + file.name + ']'
            : 'حلّل/عدّل هذه الصورة: ' + file.name
          return note
        })
        // احفظ مؤقتاً في session للطلبات اللاحقة
        try {
          sessionStorage.setItem('pendingUploadName', file.name)
          sessionStorage.setItem('pendingUploadDataUrl', dataUrl.slice(0, 500000))
        } catch { /* */ }
      }
      reader.readAsDataURL(file)
      return
    }
    // نصوص
    if (
      file.type.startsWith('text/') ||
      /\.(txt|md|json|csv|js|ts|tsx|jsx|py|html|css)$/i.test(file.name)
    ) {
      try {
        const text = await file.text()
        setInput((prev) => {
          const body = text.slice(0, 12000)
          return prev.trim()
            ? prev.trim() + '\n\n--- محتوى الملف ' + file.name + ' ---\n' + body
            : 'اعمل على هذا الملف (' + file.name + '):\n\n' + body
        })
      } catch {
        setError('تعذر قراءة الملف')
      }
      return
    }
    setInput((prev) =>
      prev.trim()
        ? prev + '\n\n[مرفق: ' + file.name + ']'
        : 'ملف مرفق: ' + file.name + ' — صف ما تريد فعله به'
    )
  }


  
  function persistMessages(next: Msg[], tid?: string | null) {
    const id = tid || threadId || uid()
    const title =
      next.find((m) => m.role === 'user')?.content?.slice(0, 48) ||
      'محادثة جديدة'
    setThreadId(id)
    setThreads((prev) => {
      const others = prev.filter((x) => x.id !== id)
      const row: Thread = {
        id,
        title,
        service,
        messages: next,
        updatedAt: Date.now(),
      }
      const list = [row, ...others].slice(0, 40)
      saveLocalThreads(service, userEmail, list)
      return list
    })
  }

  async function send(text?: string) {
    const prompt = (text ?? input).trim()
    if (!prompt || loading) return
    setError('')
    setInput('')
    const userMsg: Msg = { id: uid(), role: 'user' as const, content: prompt }
    setMessages((m) => {
      const next = [...m, userMsg]
      persistMessages(next)
      return next
    })
    setLoading(true)
    try {
      // سياق المحادثة السابق (آخر ردود) لتحسين الاستمرار
      const history = [...messages, userMsg]
        .slice(-8)
        .map((m) => (m.role === 'user' ? 'المستخدم: ' : 'المساعد: ') + m.content)
        .join('\n')
      const fullPrompt =
        history.length > prompt.length + 10
          ? `المحادثة السابقة:\n${history}\n\nالرد على آخر رسالة للمستخدم فقط بشكل مفيد.`
          : prompt

      let accessToken = ''
      let userEmail = ''
      try {
        const sb = getSupabase()
        const { data: { session } } = await sb.auth.getSession()
        accessToken = session?.access_token || ''
        userEmail = session?.user?.email || ''
      } catch { /* */ }

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({
          prompt: fullPrompt,
          type: meta.type,
          provider: provider === 'auto' ? undefined : provider,
          service,
          email: userEmail || undefined,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data.ok === false || data.success === false) {
        const err =
          data.error ||
          data.message ||
          (typeof data.text === 'string' && data.text) ||
          'فشل التوليد'
        setError(String(err))
        setMessages((m) => {
          const next = [
            ...m,
            {
              id: uid(),
              role: 'assistant' as const,
              content: String(err),
              provider: data.provider,
              model: data.model,
            },
          ]
          persistMessages(next)
          return next
        })
        return
      }
      const out =
        data.text ||
        data.result ||
        (data.imageUrl ? 'تم توليد صورة.' : '') ||
        'تم'
      setMessages((m) => {
        const next = [
          ...m,
          {
            id: uid(),
            role: 'assistant' as const,
            content: String(out),
            imageUrl: data.imageUrl || data.url || undefined,
            provider: data.provider,
            model: data.model,
            cost: data.cost ?? meta.cost,
          },
        ]
        persistMessages(next)
        return next
      })
    } catch (e: any) {
      setError(e?.message || 'خطأ شبكة')
    } finally {
      setLoading(false)
    }
  }

  function useTemplate(prompt: string) {
    setInput(prompt)
  }

  function openThread(th: Thread) {
    setThreadId(th.id)
    setMessages(th.messages || [])
    setError('')
    if (typeof window !== 'undefined' && window.innerWidth < 768) setSidebarOpen(false)
  }

  function openServerJob(job: any) {
    const msgs: Msg[] = []
    if (job.prompt) {
      msgs.push({ id: uid(), role: 'user' as const, content: String(job.prompt) })
    }
    if (job.result || job.resultUrl) {
      msgs.push({
        id: uid(),
        role: 'assistant' as const,
        content: String(job.result || (job.resultUrl ? 'تم التوليد' : '')),
        imageUrl: job.resultUrl || undefined,
        provider: job.provider,
        model: job.model,
        cost: job.creditsUsed,
      })
    }
    const th: Thread = {
      id: 'job-' + job.id,
      title: String(job.prompt || '').slice(0, 48) || 'طلب سابق',
      service,
      messages: msgs,
      updatedAt: new Date(job.createdAt || Date.now()).getTime(),
    }
    setThreads((prev) => {
      const list = [th, ...prev.filter((x) => x.id !== th.id)].slice(0, 40)
      saveLocalThreads(service, userEmail, list)
      return list
    })
    openThread(th)
  }

  function newChat() {
    setThreadId(null)
    setMessages([])
    setError('')
  }

  return (
    <div className="min-h-[100dvh] bg-slate-950 text-slate-100 flex flex-col md:flex-row" dir="rtl">
      {/* قائمة جانبية — السجل */}
      <aside
        className={`${
          sidebarOpen ? 'flex' : 'hidden'
        } md:flex w-full md:w-72 shrink-0 flex-col border-l border-slate-800 bg-slate-900/90 max-h-[40vh] md:max-h-none md:min-h-[100dvh]`}
      >
        <div className="p-3 border-b border-slate-800 flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-300">سجل المحادثات</span>
          <button
            type="button"
            onClick={newChat}
            className="text-[11px] px-2 py-1 rounded-lg bg-blue-600 text-white font-bold"
          >
            + جديد
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {threads.length === 0 && serverJobs.length === 0 && (
            <p className="text-[11px] text-slate-500 p-2">لا توجد محادثات محفوظة بعد</p>
          )}
          {threads.map((th) => (
            <button
              key={th.id}
              type="button"
              onClick={() => openThread(th)}
              className={`w-full text-right rounded-xl px-3 py-2 text-xs border transition ${
                threadId === th.id
                  ? 'border-blue-600 bg-blue-950/40 text-white'
                  : 'border-transparent hover:bg-slate-800 text-slate-300'
              }`}
            >
              <div className="line-clamp-2 font-medium">{th.title || 'محادثة'}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {new Date(th.updatedAt).toLocaleString('ar')}
              </div>
            </button>
          ))}
          {serverJobs.length > 0 && (
            <>
              <p className="text-[10px] text-slate-500 px-2 pt-3">من السيرفر</p>
              {serverJobs.slice(0, 30).map((job) => (
                <button
                  key={job.id}
                  type="button"
                  onClick={() => openServerJob(job)}
                  className="w-full text-right rounded-xl px-3 py-2 text-xs text-slate-400 hover:bg-slate-800 border border-transparent"
                >
                  <div className="line-clamp-2">{String(job.prompt || '').slice(0, 60) || job.type}</div>
                  <div className="text-[10px] text-slate-600 mt-0.5">
                    {job.status} · {job.provider || '—'}
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 min-h-[60vh]">
      {/* شريط علوي */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="max-w-3xl mx-auto px-3 py-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen((v) => !v)}
              className="text-xs px-2 py-1 rounded-lg border border-slate-700 text-slate-300 md:hidden"
            >
              السجل
            </button>
            <Link href="/dashboard" className="text-xs text-slate-400 hover:text-white shrink-0">
              ← رجوع
            </Link>
            <span className="text-lg">{meta.icon}</span>
            <h1 className="font-bold text-sm truncate">{meta.title}</h1>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="text-[11px] rounded-lg bg-slate-900 border border-slate-700 px-2 py-1 max-w-[140px]"
            >
              <option value="auto">تلقائي</option>
              {providers.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-amber-400/90 whitespace-nowrap">\~{costLabel} REMO</span>
          </div>
        </div>
      </header>

      {/* قوالب سريعة */}
      {messages.length === 0 && (
        <div className="max-w-3xl mx-auto w-full px-3 pt-4">
          <p className="text-xs text-slate-500 mb-2">قوالب سريعة</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => useTemplate(tpl.prompt)}
                className="shrink-0 rounded-2xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-right hover:border-blue-600"
              >
                <span className="text-sm">{tpl.icon} </span>
                <span className="text-xs font-bold">{tpl.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* مسار المحادثة المدمج */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto max-w-3xl mx-auto w-full px-3 py-4 space-y-4"
      >
        {messages.length === 0 && (
          <div className="text-center text-slate-500 text-sm py-16">
            <p className="text-2xl mb-2">{meta.icon}</p>
            <p>اكتب طلبك بالأسفل — ستظهر الردود هنا ويمكنك المتابعة كالرد على المحادثة</p>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-bl-md'
              }`}
            >
              {m.role === 'assistant' && (m.provider || m.model) && (
                <p className="text-[10px] text-slate-500 mb-1">
                  {[m.provider, m.model].filter(Boolean).join(' · ')}
                  {m.cost != null ? ` · ${m.cost} REMO` : ''}
                </p>
              )}
              {m.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.imageUrl}
                  alt="نتيجة"
                  className="rounded-xl max-w-full mb-2 border border-slate-700"
                />
              )}
              {m.content}
              {m.role === 'assistant' && (m.content || m.imageUrl) && (
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="text-[11px] px-2.5 py-1 rounded-lg border border-slate-700 text-slate-300 hover:border-emerald-600 hover:text-emerald-400"
                    onClick={() => {
                      if (m.imageUrl) downloadUrl(m.imageUrl, 'result-image')
                      else downloadText(m.content, 'result.txt')
                    }}
                  >
                    ↓ تحميل
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-end">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-xs text-slate-400">
              جاري التوليد…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* شريط الإدخال السفلي — مدمج مثل Gemini */}
      <div className="sticky bottom-0 border-t border-slate-800 bg-slate-950/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-3xl mx-auto px-3 py-3">
          {error && (
            <p className="text-[11px] text-red-400 mb-2 line-clamp-3">{error}</p>
          )}
          <div className="rounded-3xl border border-slate-700 bg-slate-900 shadow-lg shadow-black/30 focus-within:border-blue-600 transition">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={2}
              placeholder="اكتب رسالتك أو ردّاً على النتيجة السابقة…"
              className="w-full bg-transparent px-4 pt-3 pb-1 text-sm text-slate-100 placeholder:text-slate-500 resize-none focus:outline-none min-h-[56px] max-h-40"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  send()
                }
              }}
            />
            <div className="flex items-center justify-between px-3 pb-3 gap-2">
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.txt,.md,.json,.csv,.js,.ts,.tsx,.jsx,.py,.html,.css,audio/*,video/*"
                  className="hidden"
                  onChange={onPickFile}
                />
                <button
                  type="button"
                  title="رفع ملف"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-9 h-9 rounded-full border border-slate-600 bg-slate-950 text-lg font-bold text-slate-200 hover:border-blue-500 hover:text-white flex items-center justify-center"
                >
                  +
                </button>
                <button
                  type="button"
                  title="تحميل آخر رد"
                  onClick={() => {
                    const last = [...messages].reverse().find((m) => m.role === 'assistant')
                    if (!last) return
                    if (last.imageUrl) downloadUrl(last.imageUrl, 'result-image')
                    else if (last.content) downloadText(last.content, 'result.txt')
                  }}
                  className="text-[11px] px-2.5 py-1.5 rounded-xl border border-slate-700 text-slate-300 hover:border-emerald-600"
                >
                  ↓ تحميل
                </button>
                <button
                  type="button"
                  onClick={() => newChat()}
                  className="text-[11px] text-slate-500 hover:text-slate-300"
                >
                  محادثة جديدة
                </button>
              </div>
              <button
                type="button"
                disabled={loading || !input.trim()}
                onClick={() => send()}
                className="rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 px-5 py-2 text-sm font-bold text-white"
              >
                {loading ? '…' : `إرسال (−${costLabel} REMO)`}
              </button>
            </div>
          </div>
          <p className="text-[10px] text-slate-600 text-center mt-2">
            Enter للإرسال · Shift+Enter لسطر جديد · يمكنك متابعة الحوار بعد كل رد
          </p>
        </div>
      </div>
    </div>
      </div>
  )
}