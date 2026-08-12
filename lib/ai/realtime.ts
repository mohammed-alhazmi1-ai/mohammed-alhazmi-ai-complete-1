/**
 * توليد متعدد القدرات:
 * يحترم اختيار المستخدم للمزود (gemini | replicate | huggingface | auto)
 * أنواع: chat | code | images | video | music
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
  return env('HUGGINGFACE_API_KEY') || env('HF_TOKEN') || env('HUGGING_FACE_HUB_TOKEN')
}
function replicateToken() {
  return env('REPLICATE_API_TOKEN') || env('REPLICATE_API_KEY')
}

function normProvider(p?: string): 'gemini' | 'huggingface' | 'replicate' | 'auto' {
  const x = (p || 'auto').toLowerCase()
  if (x.includes('openai') || x.includes('gpt')) return 'auto'
  if (x.includes('gemini') || x.includes('google')) return 'gemini'
  if (x.includes('hugging') || x === 'hf') return 'huggingface'
  if (x.includes('replicate')) return 'replicate'
  return 'auto'
}

/** ترتيب المحاولة: المفضّل أولاً ثم الباقي */
function orderProviders(
  preferred: 'gemini' | 'huggingface' | 'replicate' | 'auto',
  forType: GenType
): Array<'gemini' | 'huggingface' | 'replicate'> {
  const all: Array<'gemini' | 'huggingface' | 'replicate'> =
    forType === 'images' || forType === 'video' || forType === 'music'
      ? ['replicate', 'huggingface', 'gemini']
      : ['gemini', 'huggingface', 'replicate']

  if (preferred === 'auto') return all
  return [preferred, ...all.filter((p) => p !== preferred)]
}

// ─── Gemini نص ───────────────────────────────────────────
async function geminiChat(prompt: string, model = 'gemini-2.0-flash'): Promise<GenResult> {
  const key = geminiKey()
  if (!key) {
    return { ok: false, provider: 'gemini', model, error: 'GEMINI_API_KEY مفقود' }
  }

  // نماذج شائعة — إن فشل واحد نجرّب التالي (يتفادى 404 NotFound)
  const models = [
    model,
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-flash-latest',
  ]
  // إزالة التكرار مع الحفاظ على الترتيب
  const tried: string[] = []
  for (const m of models) {
    if (!m || tried.includes(m)) continue
    tried.push(m)
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': key,
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg = data?.error?.message || `Gemini HTTP ${res.status}`
        // 404 نموذج → جرّب التالي
        if (res.status === 404) continue
        return { ok: false, provider: 'gemini', model: m, error: msg, raw: data }
      }
      const text =
        data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('\n') || ''
      if (!text.trim()) {
        continue
      }
      return { ok: true, provider: 'gemini', model: m, text, raw: data }
    } catch (e: any) {
      // تابع للنموذج التالي
      continue
    }
  }
  return {
    ok: false,
    provider: 'gemini',
    model,
    error: 'تعذر Gemini (تحقق من المفتاح AQ. والنموذج)',
  }
}


/** محاولة صور عبر Gemini (Imagen إن توفر) وإلا وصف نصي */
async function geminiImages(prompt: string): Promise<GenResult> {
  const key = geminiKey()
  const model = 'imagen-3.0-generate-002'
  if (!key) return { ok: false, provider: 'gemini', model, error: 'GEMINI_API_KEY مفقود' }

  // بعض المشاريع تدعم predict لـ imagen
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: { sampleCount: 1 },
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (res.ok) {
      const b64 =
        data?.predictions?.[0]?.bytesBase64Encoded ||
        data?.predictions?.[0]?.image?.imageBytes
      if (b64) {
        return {
          ok: true,
          provider: 'gemini',
          model,
          imageUrl: `data:image/png;base64,${b64}`,
          text: 'تم توليد الصورة عبر Gemini Imagen',
          raw: data,
        }
      }
    }
  } catch {
    /* fall through */
  }

  // بديل: دليل prompt احترافي
  const guide = await geminiChat(
    `أنت مصمم محترف. اكتب:\n1) وصف عربي قصير للنتيجة المتوقعة\n2) English image prompt جاهز لمولد صور\nالطلب:\n${prompt}`
  )
  if (guide.ok) {
    return {
      ok: false,
      provider: 'gemini',
      model: guide.model,
      error: 'Gemini لا يولّد ملف صورة على هذا المفتاح؛ تم إعداد وصف/برومبت',
      text: guide.text,
    }
  }
  return {
    ok: false,
    provider: 'gemini',
    model,
    error: guide.error || 'تعذر توليد صورة عبر Gemini',
  }
}

// ─── Hugging Face نص ─────────────────────────────────────
async function hfChat(
  prompt: string,
  model = 'mistralai/Mistral-7B-Instruct-v0.2'
): Promise<GenResult> {
  const key = hfKey()
  if (!key) return { ok: false, provider: 'huggingface', model, error: 'HUGGINGFACE_API_KEY مفقود' }
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
    if (Array.isArray(data)) text = data[0]?.generated_text || ''
    else text = data?.generated_text || ''
    if (!String(text).trim()) {
      return { ok: false, provider: 'huggingface', model, error: 'رد فارغ من HF', raw: data }
    }
    return { ok: true, provider: 'huggingface', model, text: String(text), raw: data }
  } catch (e: any) {
    return { ok: false, provider: 'huggingface', model, error: e?.message || 'خطأ HF' }
  }
}

async function hfImage(prompt: string): Promise<GenResult> {
  const key = hfKey()
  const model = 'black-forest-labs/FLUX.1-schnell'
  if (!key) return { ok: false, provider: 'huggingface', model, error: 'HUGGINGFACE_API_KEY مفقود' }
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
        error: err.slice(0, 240) || `HF image HTTP ${res.status}`,
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
    const imageUrl = `data:\( {ctype || 'image/png'};base64, \){buf.toString('base64')}`
    return {
      ok: true,
      provider: 'huggingface',
      model,
      imageUrl,
      text: 'تم توليد الصورة عبر Hugging Face',
    }
  } catch (e: any) {
    return { ok: false, provider: 'huggingface', model, error: e?.message || 'خطأ HF صورة' }
  }
}

// ─── Replicate ───────────────────────────────────────────
async function replicateRun(
  modelPath: string,
  input: Record<string, unknown>,
  label: string
): Promise<GenResult> {
  const token = replicateToken()
  if (!token) {
    return { ok: false, provider: 'replicate', model: modelPath, error: 'REPLICATE_API_TOKEN مفقود' }
  }
  try {
    const create = await fetch(
      `https://api.replicate.com/v1/models/${modelPath}/predictions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
          Prefer: 'wait=60',
        },
        body: JSON.stringify({ input }),
      }
    )
    let data = await create.json().catch(() => ({}))
    if (!create.ok) {
      return {
        ok: false,
        provider: 'replicate',
        model: modelPath,
        error: data?.detail || data?.error || `Replicate HTTP ${create.status}`,
        raw: data,
      }
    }

    let status = data.status
    let getUrl = data.urls?.get
    let output = data.output
    let tries = 0
    while (
      status &&
      status !== 'succeeded' &&
      status !== 'failed' &&
      status !== 'canceled' &&
      getUrl &&
      tries < 40
    ) {
      await new Promise((r) => setTimeout(r, 2000))
      const poll = await fetch(getUrl, {
        headers: { Authorization: `Token ${token}` },
      })
      data = await poll.json().catch(() => ({}))
      status = data.status
      output = data.output
      tries++
    }

    if (status === 'failed' || status === 'canceled') {
      return {
        ok: false,
        provider: 'replicate',
        model: modelPath,
        error: data?.error || `Replicate status: ${status}`,
        raw: data,
      }
    }

    const first = Array.isArray(output) ? output[0] : output
    if (typeof first === 'string' && (first.startsWith('http') || first.startsWith('data:'))) {
      return {
        ok: true,
        provider: 'replicate',
        model: modelPath,
        imageUrl: first,
        text: label,
        raw: data,
      }
    }
    if (typeof first === 'string') {
      return {
        ok: true,
        provider: 'replicate',
        model: modelPath,
        text: first,
        raw: data,
      }
    }
    if (first != null) {
      return {
        ok: true,
        provider: 'replicate',
        model: modelPath,
        text: typeof first === 'object' ? JSON.stringify(first) : String(first),
        imageUrl: typeof (first as any)?.url === 'string' ? (first as any).url : undefined,
        raw: data,
      }
    }
    return {
      ok: false,
      provider: 'replicate',
      model: modelPath,
      error: 'Replicate بدون مخرجات',
      raw: data,
    }
  } catch (e: any) {
    return {
      ok: false,
      provider: 'replicate',
      model: modelPath,
      error: e?.message || 'خطأ Replicate',
    }
  }
}

async function replicateImage(prompt: string) {
  // schnell أرخص للتجربة؛ إن فشل يمكن تغييره لاحقاً
  return replicateRun(
    'black-forest-labs/flux-schnell',
    { prompt, num_outputs: 1, output_format: 'webp' },
    'تم توليد الصورة عبر Replicate'
  )
}

async function replicateVideo(prompt: string) {
  // نموذج شائع؛ قد يتطلب رصيداً
  return replicateRun(
    'minimax/video-01',
    { prompt },
    'تم توليد فيديو عبر Replicate'
  )
}

async function replicateMusic(prompt: string) {
  return replicateRun(
    'meta/musicgen',
    { prompt, duration: 8 },
    'تم توليد مقطع صوتي عبر Replicate'
  )
}

async function replicateText(prompt: string) {
  return replicateRun(
    'meta/meta-llama-3-8b-instruct',
    { prompt, max_tokens: 512 },
    'رد نصي عبر Replicate'
  )
}

// ─── تنفيذ حسب المزود والنوع ─────────────────────────────
async function runOne(
  provider: 'gemini' | 'huggingface' | 'replicate',
  type: GenType,
  prompt: string
): Promise<GenResult> {
  if (type === 'chat' || type === 'code') {
    if (provider === 'gemini') return geminiChat(prompt)
    if (provider === 'huggingface') return hfChat(prompt)
    return replicateText(prompt)
  }
  if (type === 'images') {
    if (provider === 'replicate') return replicateImage(prompt)
    if (provider === 'huggingface') return hfImage(prompt)
    return geminiImages(prompt)
  }
  if (type === 'video') {
    if (provider === 'replicate') return replicateVideo(prompt)
    // الآخرون: سيناريو نصي
    const g = await (provider === 'huggingface' ? hfChat : geminiChat)(
      `اكتب سيناريو فيديو قصير + لقطات + English prompt لمولد فيديو:\n${prompt}`
    )
    return g.ok
      ? { ...g, text: "تعذر فيديو مباشر من " + provider + ".\n\n" + (g.text || "") }
      : g
  }
  if (type === 'music') {
    if (provider === 'replicate') return replicateMusic(prompt)
    const g = await (provider === 'huggingface' ? hfChat : geminiChat)(
      `اكتب وصفاً موسيقياً + English prompt لمولد موسيقى/شيلة/زفة:\n${prompt}`
    )
    return g.ok
      ? { ...g, text: "تعذر مقطع صوتي مباشر من " + provider + ".\n\n" + (g.text || "") }
      : g
  }
  return { ok: false, provider, model: '-', error: 'نوع غير مدعوم' }
}

export async function generateRealtime(input: GenInput): Promise<GenResult> {
  const prompt = (input.prompt || '').trim()
  if (!prompt) {
    return { ok: false, provider: 'none', model: '-', error: 'الطلب فارغ' }
  }

  const preferred = normProvider(input.provider)
  const sequence = orderProviders(preferred, input.type)
  const errors: string[] = []

  for (const p of sequence) {
    const r = await runOne(p, input.type, prompt)
    if (r.ok) return r
    errors.push(`${r.provider}: ${r.error || 'فشل'}`)
    // إن أرجع نصاً مفيداً مع ok:false (مثل دليل Gemini للصور) نحتفظ به كآخر ملجأ
    if (r.text && !r.ok) {
      const lastGuide = r
      // نكمل المحاولة؛ إن فشل الكل نعيد الدليل
      ;(generateRealtime as any)._lastGuide = lastGuide
    }
  }

  const guide = (generateRealtime as any)._lastGuide as GenResult | undefined
  ;(generateRealtime as any)._lastGuide = undefined

  if (guide?.text) {
    return {
      ok: false,
      provider: guide.provider,
      model: guide.model,
      error: errors.join(' | '),
      text: guide.text,
    }
  }

  return {
    ok: false,
    provider: 'none',
    model: '-',
    error: errors.join(' | ') || 'تعذر التوليد',
  }
}
