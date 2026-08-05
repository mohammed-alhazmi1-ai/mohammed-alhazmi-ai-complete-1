/**
 * توليد حقيقي عبر OpenAI + Gemini
 * مع Fallback بسيط
 */

export type GenType = 'chat' | 'images' | 'video' | 'music' | 'code'

export type GenInput = {
  type: GenType
  prompt: string
  userId?: string
  model?: string
}

export type GenResult = {
  ok: boolean
  provider: string
  model: string
  text?: string
  imageUrl?: string
  error?: string
  raw?: unknown
}

function env(name: string) {
  return (process.env[name] || '').trim()
}

/** ---- OpenAI Chat ---- */
async function openaiChat(prompt: string, model = 'gpt-4o-mini'): Promise<GenResult> {
  const key = env('OPENAI_API_KEY')
  if (!key) return { ok: false, provider: 'openai', model, error: 'OPENAI_API_KEY مفقود' }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content:
            'أنت مساعد ذكي لمنصة عربية. أجب بوضوح وبالعربية ما لم يطلب المستخدم غير ذلك.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    return {
      ok: false,
      provider: 'openai',
      model,
      error: data?.error?.message || `OpenAI HTTP ${res.status}`,
      raw: data,
    }
  }

  const text = data?.choices?.[0]?.message?.content || ''
  return { ok: true, provider: 'openai', model, text, raw: data }
}

/** ---- Gemini Chat ---- */
async function geminiChat(prompt: string, model = 'gemini-2.0-flash'): Promise<GenResult> {
  const key = env('GEMINI_API_KEY')
  if (!key) return { ok: false, provider: 'gemini', model, error: 'GEMINI_API_KEY مفقود' }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/\( {model}:generateContent?key= \){key}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    return {
      ok: false,
      provider: 'gemini',
      model,
      error: data?.error?.message || `Gemini HTTP ${res.status}`,
      raw: data,
    }
  }

  const text =
    data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('\n') || ''
  return { ok: true, provider: 'gemini', model, text, raw: data }
}

/** ---- OpenAI Images (DALL·E) ---- */
async function openaiImage(prompt: string, model = 'dall-e-2'): Promise<GenResult> {
  const key = env('OPENAI_API_KEY')
  if (!key) return { ok: false, provider: 'openai', model, error: 'OPENAI_API_KEY مفقود' }

  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      prompt: prompt.slice(0, 3500),
      n: 1,
      size: '1024x1024',
    }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    return {
      ok: false,
      provider: 'openai',
      model,
      error: data?.error?.message || `OpenAI Images HTTP ${res.status}`,
      raw: data,
    }
  }

  const imageUrl = data?.data?.[0]?.url || data?.data?.[0]?.b64_json || ''
  const text = data?.data?.[0]?.revised_prompt || 'تم توليد الصورة'
  return {
    ok: true,
    provider: 'openai',
    model,
    text,
    imageUrl: typeof imageUrl === 'string' && imageUrl.startsWith('http') ? imageUrl : undefined,
    raw: data,
  }
}

/** ---- توليد موسيقى/فيديو (نصي إبداعي عبر النموذج حتى يتوفر مزود وسائط) ---- */
async function creativeMedia(
  type: 'video' | 'music',
  prompt: string
): Promise<GenResult> {
  const system =
    type === 'video'
      ? `أنت مخرج ومخطّط فيديو بالذكاء الاصطناعي. اكتب:
1) وصف المشهد بالإنجليزية (prompt جاهز لمولد فيديو)
2) سيناريو مختصر بالعربية
3) اقتراح مدة وإيقاع
لا تدّعِ أن ملفاً مرفق إن لم يُنشأ.`
      : `أنت منتج موسيقي. اكتب:
1) كلمات/هيكل الأغنية أو الشيلة حسب الطلب
2) وصف اللحن والآلات بالعربية
3) Prompt إنجليزي لمولد موسيقى
لا تدّعِ وجود ملف صوتي إن لم يُنشأ.`

  // جرّب OpenAI ثم Gemini
  const o = await openaiChat(`\( {system}\n\nطلب المستخدم:\n \){prompt}`)
  if (o.ok) return { ...o, model: o.model + `/${type}` }

  const g = await geminiChat(`\( {system}\n\nطلب المستخدم:\n \){prompt}`)
  if (g.ok) return { ...g, model: g.model + `/${type}` }

  return {
    ok: false,
    provider: 'none',
    model: type,
    error: o.error || g.error || 'تعذر التوليد',
  }
}

/** نقطة الدخول الموحدة + Fallback */
export async function generateRealtime(input: GenInput): Promise<GenResult> {
  const prompt = (input.prompt || '').trim()
  if (!prompt) {
    return { ok: false, provider: 'none', model: '-', error: 'الطلب فارغ' }
  }

  try {
    if (input.type === 'chat' || input.type === 'code') {
      const first = await openaiChat(prompt, input.model || 'gpt-4o-mini')
      if (first.ok) return first
      const second = await geminiChat(prompt)
      if (second.ok) return second
      return first.error ? first : second
    }

    if (input.type === 'images') {
      const img = await openaiImage(prompt)
      if (img.ok) return img
      // إن فشل DALL·E: وصف احترافي عبر Gemini/OpenAI
      const fallback = await geminiChat(
        `اكتب prompt إنجليزي احترافي لمولد صور + شرح عربي قصير لهذا الطلب:\n${prompt}`
      )
      if (fallback.ok) {
        return {
          ...fallback,
          error: img.error,
          text: `تعذر توليد الصورة مباشرة (\( {img.error}).\n\n \){fallback.text}`,
        }
      }
      return img
    }

    if (input.type === 'video') return creativeMedia('video', prompt)
    if (input.type === 'music') return creativeMedia('music', prompt)

    return { ok: false, provider: 'none', model: '-', error: 'نوع غير مدعوم: ' + input.type }
  } catch (e: any) {
    return {
      ok: false,
      provider: 'none',
      model: '-',
      error: e?.message || 'خطأ غير متوقع',
    }
  }
}
