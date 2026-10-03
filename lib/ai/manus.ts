import type { GenResult } from '@/lib/ai/realtime'

const BASE = 'https://api.manus.ai/v2'

function key() {
  return (process.env.MANUS_API_KEY || '').trim()
}

function extractUrl(value: unknown): string | undefined {
  if (typeof value === 'string' && /^https?:\/\//i.test(value)) return value
  if (Array.isArray(value)) {
    for (const item of value) {
      const url = extractUrl(item)
      if (url) return url
    }
  }
  if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (/url|link|download|artifact|output/i.test(k)) {
        const url = extractUrl(v)
        if (url) return url
      }
      const nested = extractUrl(v)
      if (nested) return nested
    }
  }
  return undefined
}

export async function createManusMediaTask(
  type: 'video' | 'music',
  prompt: string,
  callbackUrl?: string,
): Promise<GenResult> {
  const apiKey = key()
  const model = type === 'video' ? 'manus-video-agent' : 'manus-audio-agent'
  if (!apiKey) {
    return { ok: false, provider: 'manus', model, error: 'MANUS_API_KEY مفقود' }
  }

  const media = type === 'video' ? 'فيديو MP4' : 'ملف صوتي MP3 أو WAV'
  const callback = callbackUrl ? `\nبعد اكتمال المهمة أرسل النتيجة إلى Webhook المنصة: ${callbackUrl}` : ''
  const taskPrompt = `
أنت مزود إنتاج وسائط داخل منصة محمد الحزمي للذكاء الاصطناعي.
نفّذ طلب المستخدم التالي وأنشئ ${media} فعلياً، وليس مجرد وصف أو سيناريو.
إذا احتجت إلى كتابة سيناريو أو صوت أو تركيب، نفّذ جميع الخطوات حتى إخراج الملف النهائي.
في النهاية أعد رابط تنزيل مباشر عام للملف النهائي، واذكر نوع الملف ومدته إن أمكن.
طلب المستخدم:
${prompt.slice(0, 12000)}
${callback}
`

  try {
    const res = await fetch(`${BASE}/task.create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-manus-api-key': apiKey },
      body: JSON.stringify({
        message: { content: [{ type: 'text', text: taskPrompt, visibility: 'visible' }] },
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || data?.ok === false || !data?.task_id) {
      return {
        ok: false,
        provider: 'manus',
        model,
        error: data?.error?.message || data?.error || `Manus HTTP ${res.status}`,
        raw: data,
      }
    }
    return {
      ok: true,
      provider: 'manus',
      model,
      text: 'تم قبول الطلب لدى Manus وسيظهر الملف عند اكتمال المهمة.',
      pending: true,
      taskId: String(data.task_id),
      taskUrl: data.task_url || data.share_url,
      raw: data,
    }
  } catch (e: any) {
    return { ok: false, provider: 'manus', model, error: e?.message || 'تعذر الاتصال بـ Manus' }
  }
}

export function extractManusResultUrl(payload: unknown) {
  return extractUrl(payload)
}
