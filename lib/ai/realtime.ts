/**
 * توليد حقيقي: Gemini → Hugging Face → Replicate
 * بدون OpenAI
 */

export type GenType = 'chat' | 'images' | 'video' | 'music' | 'code'

export type GenInput = {
  type: GenType
  prompt: string
  userId?: string
  model?: string
  /** gemini | huggingface | replicate | auto */
  provider?: string
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

function geminiKey() {
  return env('GEMINI_API_KEY') || env('GOOGLE_API_KEY')
}

function hfKey() {
  return (
    env('HUGGINGFACE_API_KEY') ||
    env('HF_TOKEN') ||
    env('HUGGING_FACE_HUB_TOKEN')
  )
}

function replicateToken() {
  return env('REPLICATE_API_TOKEN') || env('REPLICATE_API_KEY')
}

/** ---- Gemini (نص / كود) ---- */
async function geminiChat(
  prompt: string,
  model = 'gemini-2.0-flash'
): Promise<GenResult> {
  const key = geminiKey()
  if (!key) {
    return { ok: false, provider: 'gemini', model, error: 'GEMINI_API_KEY مفقود' }
  }

  const models = [model, 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-flash-latest']
  let lastErr = 'فشل Gemini'

  for (const m of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/\( {m}:generateContent?key= \){key}`
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        lastErr = data?.error?.message || `Gemini HTTP ${res.status}`
        continue
      }
      const text =
        data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('\n') ||
        ''
      if (!text.trim()) {
        lastErr = 'رد فارغ من Gemini'
        continue
      }
      return { ok: true, provider: 'gemini', model: m, text, raw: data }
    } catch (e: any) {
      lastErr = e?.message || 'خطأ Gemini'
    }
  }

  return { ok: false, provider: 'gemini', model, error: lastErr }
}

/** ---- Hugging Face (نص) ---- */
async function hfChat(
  prompt: string,
  model = 'mistralai/Mistral-7B-Instruct-v0.2'
): Promise<GenResult> {
  const key = hfKey()
  if (!key) {
    return { ok: false, provider: 'huggingface', model, error: 'HUGGINGFACE_API_KEY مفقود' }
  }

  try {
    const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { max_new_tokens: 512, temperature: 0.7, return_full_text: false },
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return {
        ok: false,
        provider: 'huggingface',
        model,
        error: data?.error || `HF HTTP ${res.status}`,
        raw: data,
      }
    }
    let text = ''
    if (Array.isArray(data)) {
      text = data[0]?.generated_text || data[0]?.summary_text || ''
    } else if (typeof data === 'object') {
      text = data.generated_text || data[0]?.generated_text || JSON.stringify(data)
    }
    if (!String(text).trim()) {
      return { ok: false, provider: 'huggingface', model, error: 'رد فارغ من HF', raw: data }
    }
    return { ok: true, provider: 'huggingface', model, text: String(text), raw: data }
  } catch (e: any) {
    return { ok: false, provider: 'huggingface', model, error: e?.message || 'خطأ HF' }
  }
}

/** ---- Replicate صور (flux) ---- */
async function replicateImage(prompt: string): Promise<GenResult> {
  const token = replicateToken()
  const model = 'black-forest-labs/flux-schnell'
  if (!token) {
    return { ok: false, provider: 'replicate', model, error: 'REPLICATE_API_TOKEN مفقود' }
  }

  try {
    const create = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json',
        Prefer: 'wait=60',
      },
      body: JSON.stringify({
        version:
          process.env.REPLICATE_FLUX_VERSION ||
          'black-forest-labs/flux-schnell',
        input: {
          prompt,
          num_outputs: 1,
          output_format: 'webp',
        },
      }),
    })

    // بعض الحسابات تستخدم model endpoint بدل version
    let data = await create.json().catch(() => ({}))

    if (!create.ok) {
      // محاولة عبر models API
      const create2 = await fetch(
        'https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions',
        {
          method: 'POST',
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
            Prefer: 'wait=60',
          },
          body: JSON.stringify({
            input: { prompt, num_outputs: 1 },
          }),
        }
      )
      data = await create2.json().catch(() => ({}))
      if (!create2.ok) {
        return {
          ok: false,
          provider: 'replicate',
          model,
          error: data?.detail || data?.error || `Replicate HTTP ${create2.status}`,
          raw: data,
        }
      }
    }

    // انتظار إن لزم
    let status = data.status
    let getUrl = data.urls?.get
    let output = data.output
    let tries = 0
    while (status !== 'succeeded' && status !== 'failed' && status !== 'canceled' && getUrl && tries < 30) {
      await new Promise((r) => setTimeout(r, 2000))
      const poll = await fetch(getUrl, {
        headers: { Authorization: `Token ${token}` },
      })
      data = await poll.json().catch(() => ({}))
      status = data.status
      output = data.output
      tries++
    }

    if (status && status !== 'succeeded' && !output) {
      return {
        ok: false,
        provider: 'replicate',
        model,
        error: data?.error || `Replicate status: ${status}`,
        raw: data,
      }
    }

    const imageUrl = Array.isArray(output) ? output[0] : output
    if (!imageUrl || typeof imageUrl !== 'string') {
      return {
        ok: false,
        provider: 'replicate',
        model,
        error: 'لم يُرجع Replicate رابط صورة',
        raw: data,
      }
    }

    return {
      ok: true,
      provider: 'replicate',
      model,
      imageUrl,
      text: 'تم توليد الصورة',
      raw: data,
    }
  } catch (e: any) {
    return {
      ok: false,
      provider: 'replicate',
      model,
      error: e?.message || 'خطأ Replicate',
    }
  }
}

/** ---- HF صورة (اختياري) ---- */
async function hfImage(prompt: string): Promise<GenResult> {
  const key = hfKey()
  const model = 'black-forest-labs/FLUX.1-schnell'
  if (!key) {
    return { ok: false, provider: 'huggingface', model, error: 'HUGGINGFACE_API_KEY مفقود' }
  }
  try {
    const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: prompt }),
    })
    if (!res.ok) {
      const err = await res.text()
      return {
        ok: false,
        provider: 'huggingface',
        model,
        error: err.slice(0, 200) || `HF image HTTP ${res.status}`,
      }
    }
    const ctype = res.headers.get('content-type') || ''
    if (ctype.includes('application/json')) {
      const data = await res.json()
      return {
        ok: false,
        provider: 'huggingface',
        model,
        error: data?.error || 'HF لم يُرجع صورة',
        raw: data,
      }
    }
    const buf = Buffer.from(await res.arrayBuffer())
    const b64 = buf.toString('base64')
    const imageUrl = `data:\( {ctype || 'image/png'};base64, \){b64}`
    return {
      ok: true,
      provider: 'huggingface',
      model,
      imageUrl,
      text: 'تم توليد الصورة عبر Hugging Face',
    }
  } catch (e: any) {
    return {
      ok: false,
      provider: 'huggingface',
      model,
      error: e?.message || 'خطأ HF صورة',
    }
  }
}

async function textWithFallback(
  prompt: string,
  preferred?: string
): Promise<GenResult> {
  const order =
    preferred === 'huggingface'
      ? ['huggingface', 'gemini']
      : preferred === 'gemini'
        ? ['gemini', 'huggingface']
        : ['gemini', 'huggingface']

  const errors: string[] = []
  for (const p of order) {
    const r = p === 'huggingface' ? await hfChat(prompt) : await geminiChat(prompt)
    if (r.ok) return r
    errors.push(`${r.provider}: ${r.error}`)
  }
  return {
    ok: false,
    provider: 'none',
    model: '-',
    error: errors.join(' | ') || 'تعذر التوليد النصي',
  }
}

async function imageWithFallback(
  prompt: string,
  preferred?: string
): Promise<GenResult> {
  const order =
    preferred === 'huggingface'
      ? ['huggingface', 'replicate']
      : preferred === 'replicate'
        ? ['replicate', 'huggingface']
        : ['replicate', 'huggingface']

  const errors: string[] = []
  for (const p of order) {
    const r = p === 'huggingface' ? await hfImage(prompt) : await replicateImage(prompt)
    if (r.ok) return r
    errors.push(`${r.provider}: ${r.error}`)
  }
  // وصف عبر Gemini كملجأ أخير
  const desc = await geminiChat(
    `اكتب وصفاً عربياً قصيراً + prompt إنجليزي احترافي لتوليد صورة لهذا الطلب:\n${prompt}`
  )
  if (desc.ok) {
    return {
      ok: false,
      provider: desc.provider,
      model: desc.model,
      error: errors.join(' | '),
      text: `تعذر توليد الصورة مباشرة.\n\n${desc.text}`,
    }
  }
  return {
    ok: false,
    provider: 'none',
    model: '-',
    error: errors.join(' | ') || 'تعذر توليد الصورة',
  }
}

/** فيديو / موسيقى: توجيه نصي عبر Gemini (لا OpenAI) */
async function mediaGuide(type: 'video' | 'music', prompt: string): Promise<GenResult> {
  const sys =
    type === 'video'
      ? 'أنت خبير فيديو AI. اكتب سيناريو قصير + لقطات + prompt إنجليزي مناسب لمولد فيديو.'
      : 'أنت خبير موسيقى AI. اكتب وصفاً أسلوباً وإيقاع + prompt إنجليزي لمولد موسيقى/أغنية.'
  return textWithFallback(`\( {sys}\n\nطلب المستخدم:\n \){prompt}`)
}

export async function generateRealtime(input: GenInput): Promise<GenResult> {
  const prompt = (input.prompt || '').trim()
  if (!prompt) {
    return { ok: false, provider: 'none', model: '-', error: 'الطلب فارغ' }
  }

  // رفض OpenAI صراحة
  const pref = (input.provider || 'auto').toLowerCase()
  if (pref.includes('openai') || pref.includes('gpt')) {
    return {
      ok: false,
      provider: 'none',
      model: '-',
      error: 'OpenAI معطّل في هذه المنصة. استخدم Gemini أو Replicate أو Hugging Face.',
    }
  }

  try {
    if (input.type === 'chat' || input.type === 'code') {
      return await textWithFallback(prompt, pref)
    }
    if (input.type === 'images') {
      return await imageWithFallback(prompt, pref)
    }
    if (input.type === 'video') return mediaGuide('video', prompt)
    if (input.type === 'music') return mediaGuide('music', prompt)
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
