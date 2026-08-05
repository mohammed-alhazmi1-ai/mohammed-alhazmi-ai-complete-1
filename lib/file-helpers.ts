/** تحويل ملف إلى data URL (صور صغيرة/متوسطة) */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('فشل قراءة الملف'))
    reader.readAsDataURL(file)
  })
}

export function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export async function downloadFromUrl(url: string, filename: string) {
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
    // فتح الرابط إن فشل التحميل المباشر (CORS)
    window.open(url, '_blank')
  }
}

export function isImageFile(file: File) {
  return file.type.startsWith('image/')
}
