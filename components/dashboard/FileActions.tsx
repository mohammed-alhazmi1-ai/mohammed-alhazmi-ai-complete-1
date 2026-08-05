'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

type UploadResult = {
  url: string
  filename: string
  originalName: string
  mime: string
  size: number
}

type Props = {
  onUploaded?: (file: UploadResult) => void
  resultText?: string
  resultUrl?: string | null
  labelUpload?: string
  labelDownload?: string
}

function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

async function downloadFromUrl(url: string, filename: string) {
  try {
    const res = await fetch(url)
    const blob = await res.blob()
    const u = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = u
    a.download = filename
    a.click()
    URL.revokeObjectURL(u)
  } catch {
    window.open(url, '_blank')
  }
}

export default function FileActions({
  onUploaded,
  resultText,
  resultUrl,
  labelUpload = 'رفع من الجهاز',
  labelDownload = 'تحميل النتيجة',
}: Props) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState('')
  const [last, setLast] = useState<UploadResult | null>(null)
  const [err, setErr] = useState('')

  const onDrop = useCallback(
    async (files: File[]) => {
      const file = files[0]
      if (!file) return
      setErr('')
      setUploading(true)
      setProgress('جاري الرفع إلى الخادم...')
      try {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (!res.ok || !data.ok) throw new Error(data.error || 'فشل الرفع — قد يكون الملف مرفوضاً أمنياً')
        const payload: UploadResult = {
          url: data.url,
          filename: data.filename,
          originalName: data.originalName || file.name,
          mime: data.mime || file.type,
          size: data.size || file.size,
        }
        setLast(payload)
        setProgress('تم الرفع ✓')
        onUploaded?.(payload)
      } catch (e: any) {
        setErr(e?.message || 'خطأ')
        setProgress('')
      } finally {
        setUploading(false)
      }
    },
    [onUploaded]
  )

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 10 * 1024 * 1024,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif'],
      'video/*': ['.mp4', '.webm'],
      'text/*': ['.txt', '.md'],
      'application/pdf': ['.pdf'],
    },
    noClick: true,
    noKeyboard: true,
  })

  const hasResult = Boolean((resultText && resultText.trim()) || resultUrl)

  return (
    <div className="space-y-2" dir="rtl">
      <div
        {...getRootProps()}
        className={`rounded-xl border border-dashed p-3 transition ${
          isDragActive ? 'border-blue-500 bg-blue-950/30' : 'border-slate-700 bg-slate-950/40'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-wrap gap-2 items-center">
          <button
            type="button"
            disabled={uploading}
            onClick={(e) => {
              e.stopPropagation()
              open()
            }}
            className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-600 bg-slate-900 hover:bg-slate-800 text-slate-100 disabled:opacity-50"
          >
            {uploading ? 'جاري الرفع...' : `📎 ${labelUpload}`}
          </button>
          <button
            type="button"
            disabled={!hasResult}
            onClick={(e) => {
              e.stopPropagation()
              if (resultUrl) {
                downloadFromUrl(
                  resultUrl,
                  resultUrl.split('/').pop()?.split('?')[0] || 'result'
                )
              } else if (resultText?.trim()) {
                downloadText(`result-${Date.now()}.txt`, resultText)
              }
            }}
            className="px-3 py-2 rounded-xl text-xs font-bold border border-emerald-800/60 bg-emerald-950/40 text-emerald-300 disabled:opacity-40"
          >
            ⬇️ {labelDownload}
          </button>
          <span className="text-[10px] text-slate-500">
            {isDragActive ? 'أفلت الملف هنا' : 'أو اسحب الملف إلى هنا'}
          </span>
        </div>
        {progress && <p className="text-[11px] text-emerald-400 mt-2">{progress}</p>}
        {last && (
          <p className="text-[11px] text-slate-400 mt-1">
            {last.originalName}{' '}
            <a href={last.url} target="_blank" rel="noreferrer" className="text-blue-400 underline">
              رابط الملف
            </a>
          </p>
        )}
        {last?.mime?.startsWith('image/') && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={last.url}
            alt="معاينة"
            className="mt-2 max-h-28 rounded-lg border border-slate-700 object-contain"
          />
        )}
        {err && <p className="text-[11px] text-red-400 mt-1">{err}</p>}
      </div>
    </div>
  )
}
