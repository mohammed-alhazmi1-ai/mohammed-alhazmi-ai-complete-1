'use client'

import { useState } from 'react'

type Props = {
  value: string
  onChange: (url: string) => void
}

export default function LogoUploader({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false)
  const [err, setErr] = useState('')
  const [manual, setManual] = useState(value || '')

  async function onFile(file: File | null) {
    if (!file) return
    setErr('')
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'فشل رفع الشعار')
      }
      if (!String(data.mime || '').startsWith('image/')) {
        throw new Error('يجب أن يكون الملف صورة')
      }
      onChange(data.url)
      setManual(data.url)
    } catch (e: any) {
      setErr(e?.message || 'خطأ')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-slate-700 bg-slate-950/50 p-4">
      <p className="text-sm font-medium text-white">شعار المنصة (الصفحة الرئيسية)</p>
      <p className="text-[11px] text-slate-400">
        يُعرض في أعلى الصفحة الرئيسية. يُفضّل PNG شفاف أو مربع، أقل من 2MB.
      </p>

      {(value || manual) && (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value || manual}
            alt="شعار المنصة"
            className="h-16 w-16 object-contain rounded-xl border border-slate-700 bg-slate-900 p-1"
          />
          <button
            type="button"
            className="text-xs text-rose-400"
            onClick={() => {
              onChange('')
              setManual('')
            }}
          >
            إزالة الشعار
          </button>
        </div>
      )}

      <label className="block">
        <span className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-500">
          {uploading ? 'جاري الرفع...' : '📷 رفع صورة الشعار'}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            disabled={uploading}
            onChange={(e) => onFile(e.target.files?.[0] || null)}
          />
        </span>
      </label>

      <label className="block text-xs text-slate-400">
        أو الصق رابط صورة
        <input
          dir="ltr"
          className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
          placeholder="https://... أو /uploads/..."
          value={manual}
          onChange={(e) => {
            setManual(e.target.value)
            onChange(e.target.value.trim())
          }}
        />
      </label>

      {err && <p className="text-xs text-rose-400">{err}</p>}
    </div>
  )
}
