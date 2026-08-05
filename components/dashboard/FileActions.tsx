'use client'

import { useRef, useState } from 'react'
import { downloadFromUrl, downloadText, fileToDataUrl, isImageFile } from '@/lib/file-helpers'

type Props = {
  /** عند رفع ملف (dataUrl + اسم) */
  onUpload?: (payload: { name: string; dataUrl: string; file: File }) => void
  /** نص النتيجة للتحميل */
  resultText?: string
  /** رابط صورة/ملف ناتج */
  resultUrl?: string | null
  accept?: string
  labelUpload?: string
  labelDownload?: string
}

export default function FileActions({
  onUpload,
  resultText,
  resultUrl,
  accept = 'image/*,.txt,.md,.json',
  labelUpload = 'رفع من الجهاز',
  labelDownload = 'تحميل النتيجة',
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [fileName, setFileName] = useState('')
  const [preview, setPreview] = useState('')
  const [err, setErr] = useState('')

  const hasResult = Boolean((resultText && resultText.trim()) || resultUrl)

  async function handleFile(file: File | null) {
    if (!file || !onUpload) return
    setErr('')
    if (file.size > 8 * 1024 * 1024) {
      setErr('الحد الأقصى 8MB')
      return
    }
    setUploading(true)
    try {
      const dataUrl = await fileToDataUrl(file)
      setFileName(file.name)
      if (isImageFile(file)) setPreview(dataUrl)
      else setPreview('')
      onUpload({ name: file.name, dataUrl, file })
    } catch (e: any) {
      setErr(e?.message || 'فشل الرفع')
    } finally {
      setUploading(false)
    }
  }

  function doDownload() {
    if (resultUrl) {
      const name = resultUrl.split('/').pop()?.split('?')[0] || 'result.png'
      downloadFromUrl(resultUrl, name)
      return
    }
    if (resultText?.trim()) {
      downloadText(`result-${Date.now()}.txt`, resultText)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {onUpload && (
          <>
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] || null)}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-600 bg-slate-900 hover:bg-slate-800 text-slate-100 disabled:opacity-50"
            >
              {uploading ? '...' : `📎 ${labelUpload}`}
            </button>
          </>
        )}
        <button
          type="button"
          disabled={!hasResult}
          onClick={doDownload}
          className="px-3 py-2 rounded-xl text-xs font-bold border border-emerald-800/60 bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-300 disabled:opacity-40"
        >
          ⬇️ {labelDownload}
        </button>
      </div>
      {fileName && (
        <p className="text-[11px] text-slate-400">تم اختيار: {fileName}</p>
      )}
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="معاينة" className="max-h-28 rounded-lg border border-slate-700 object-contain" />
      )}
      {err && <p className="text-[11px] text-red-400">{err}</p>}
    </div>
  )
}
