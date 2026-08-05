import { promises as fs } from 'fs'
import path from 'path'

export type KnowledgeItem = {
  id: string
  title: string
  keywords: string[]
  answer: string
  links?: { label: string; href: string }[]
  /** روابط وسائط تظهر في الرد */
  imageUrl?: string
  videoUrl?: string
  enabled: boolean
  priority: number
}

export type AssistantConfig = {
  name: string
  welcome: string
  fallback: string
  personality: string
  enabled: boolean
  /** استخدام نموذج صغير لإعادة صياغة الرد عند وجود مفتاح */
  useSmallModel: boolean
  items: KnowledgeItem[]
  updatedAt?: string
}

const FILE = path.join(process.cwd(), 'data', 'platform-assistant.json')

/** مرادفات عربية لتحسين دقة البحث */
const SYNONYMS: Record<string, string[]> = {
  صور: ['صورة', 'تصميم', 'شعار', 'لوجو', 'بوست', 'image', 'logo'],
  فيديو: ['مقطع', 'فيلم', 'ريلز', 'video', 'clip'],
  موسيقى: ['اغنية', 'شيلة', 'زفة', 'نغمة', 'صوت', 'music', 'song'],
  رصيد: ['ريمو', 'remo', 'نقاط', 'credit', 'credits', 'رصيدي'],
  خطة: ['باقة', 'اشتراك', 'plan', 'pro', 'مجاني'],
  دفع: ['شحن', 'جيب', 'بينانس', 'تحويل', 'ايداع', 'payment'],
  دعم: ['مساعدة', 'مشكلة', 'خطأ', 'support', 'تواصل'],
  حساب: ['تسجيل', 'دخول', 'login', 'register', 'كلمة المرور'],
  برمجة: ['كود', 'موقع', 'تطبيق', 'code', 'html', 'react'],
  هدية: ['كود', 'قسيمة', 'gift', 'كوبون'],
}

const DEFAULT_ITEMS: KnowledgeItem[] = [
  {
    id: 'about',
    title: 'عن المنصة',
    keywords: ['منصة', 'خدمات', 'ايش', 'ما هي', 'تعريف'],
    answer:
      'منصة محمد الحزمي تقدّم توليد الصور والفيديو والموسيقى والبرمجة والدردشة. الرصيد بوحدة REMO من لوحة المستخدم.',
    links: [{ label: 'لوحة المستخدم', href: '/dashboard' }],
    enabled: true,
    priority: 10,
  },
  {
    id: 'images',
    title: 'الصور',
    keywords: ['صور', 'صورة', 'شعار', 'لوجو', 'تصميم'],
    answer:
      'افتح قسم الصور، اكتب وصفاً واضحاً أو اختر قالباً، ثم ولّد. التكلفة تُخصم من REMO.',
    links: [{ label: 'فتح الصور', href: '/dashboard/images' }],
    imageUrl: '',
    enabled: true,
    priority: 20,
  },
  {
    id: 'video',
    title: 'الفيديو',
    keywords: ['فيديو', 'مقطع', 'ريلز'],
    answer: 'من قسم الفيديو اكتب فكرة المقطع أو السيناريو ثم اضغط توليد.',
    links: [{ label: 'فتح الفيديو', href: '/dashboard/video' }],
    videoUrl: '',
    enabled: true,
    priority: 20,
  },
  {
    id: 'plans',
    title: 'الخطط والرصيد',
    keywords: ['خطة', 'باقة', 'رصيد', 'ريمو', 'سعر', 'اشتراك'],
    answer:
      'عند نفاد الرصيد تظهر الباقات. الشحن من صفحة الفوترة حسب الطرق المفعّلة (مثل محفظة جيب).',
    links: [
      { label: 'الخطط', href: '/dashboard/plans' },
      { label: 'الشحن', href: '/dashboard/billing' },
    ],
    enabled: true,
    priority: 15,
  },
  {
    id: 'support',
    title: 'الدعم',
    keywords: ['دعم', 'مساعدة', 'مشكلة', 'خطأ'],
    answer: 'للدعم راجع صفحة اتصل بنا أو واتساب المالك مع وصف المشكلة.',
    links: [{ label: 'اتصل بنا', href: '/contact' }],
    enabled: true,
    priority: 30,
  },
]

const DEFAULT_CONFIG: AssistantConfig = {
  name: 'مساعد منصة محمد الحزمي',
  welcome:
    'مرحباً، أنا مساعد المنصة. اسأل بحرية عن الخدمات أو الرصيد أو الدفع — بلا حد لعدد الرسائل. يمكنني أيضاً إظهار صور أو فيديو إن أضافها المالك للمعرفة.',
  fallback:
    'لم أجد تطابقاً قوياً في معرفة المنصة. أعد صياغة السؤال أو اذكر اسم الخدمة. المالك يضيف مواضيع جديدة من لوحة «مساعد المنصة».',
  personality: 'عربي واضح، مختصر، عملي، يوجّه المستخدم لخطوات داخل المنصة.',
  enabled: true,
  useSmallModel: true,
  items: DEFAULT_ITEMS,
}

function normalize(s: string) {
  return (s || '')
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[^\u0600-\u06FFa-z0-9\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function expandTokens(msg: string): Set<string> {
  const n = normalize(msg)
  const out = new Set<string>()
  for (const w of n.split(' ')) {
    if (w.length >= 2) out.add(w)
  }
  // توسيع بالمرادفات
  for (const [root, list] of Object.entries(SYNONYMS)) {
    const all = [root, ...list].map(normalize)
    if (all.some((x) => n.includes(x) || out.has(x))) {
      all.forEach((x) => x.split(' ').forEach((t) => t.length >= 2 && out.add(t)))
    }
  }
  return out
}

export async function getAssistantConfig(): Promise<AssistantConfig> {
  try {
    const raw = await fs.readFile(FILE, 'utf8')
    const data = JSON.parse(raw)
    return {
      ...DEFAULT_CONFIG,
      ...data,
      items:
        Array.isArray(data.items) && data.items.length
          ? data.items
          : DEFAULT_ITEMS,
    }
  } catch {
    return { ...DEFAULT_CONFIG, items: [...DEFAULT_ITEMS] }
  }
}

export async function saveAssistantConfig(
  patch: Partial<AssistantConfig>
): Promise<AssistantConfig> {
  const cur = await getAssistantConfig()
  const next: AssistantConfig = {
    ...cur,
    ...patch,
    items: patch.items ?? cur.items,
    updatedAt: new Date().toISOString(),
  }
  await fs.mkdir(path.dirname(FILE), { recursive: true })
  await fs.writeFile(FILE, JSON.stringify(next, null, 2), 'utf8')
  return next
}

/** دقة بحث محسّنة: كلمات + مرادفات + عنوان + أولوية */
export function scoreItem(msg: string, item: KnowledgeItem): number {
  if (!item.enabled) return 0
  const msgTok = expandTokens(msg)
  const n = normalize(msg)
  let score = 0

  for (const kw of item.keywords || []) {
    const k = normalize(kw)
    if (!k) continue
    if (n.includes(k)) score += 5
    for (const part of k.split(' ')) {
      if (part.length >= 2 && msgTok.has(part)) score += 2
      if (part.length >= 2 && n.includes(part)) score += 1
    }
  }

  const title = normalize(item.title)
  if (title) {
    if (n.includes(title)) score += 4
    for (const t of title.split(' ')) {
      if (t.length >= 2 && msgTok.has(t)) score += 2
    }
  }

  // تداخل مع نص الجواب (خفيف)
  const ans = normalize(item.answer)
  let overlap = 0
  for (const t of Array.from(msgTok)) {
    if (t.length >= 3 && ans.includes(t)) overlap++
  }
  score += Math.min(overlap, 5) * 0.4
  score += (item.priority || 0) * 0.02
  return score
}

async function polishWithSmallModel(
  userMsg: string,
  baseAnswer: string,
  personality: string
): Promise<string | null> {
  const gemini = (process.env.GEMINI_API_KEY || '').trim()
  const openai = (process.env.OPENAI_API_KEY || '').trim()
  const system = `${personality || 'مساعد منصة عربي واضح.'}
أعد صياغة المعلومة التالية كرد محادثة قصير ومفيد للمستخدم، دون اختراع أسعار أو ميزات غير مذكورة.
المعلومة:
${baseAnswer}`

  try {
    if (gemini) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${gemini}`
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `سؤال المستخدم: \( {userMsg}\n\n \){system}` }],
            },
          ],
          generationConfig: { maxOutputTokens: 400, temperature: 0.4 },
        }),
      })
      const data = await res.json().catch(() => ({}))
      const text =
        data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('') ||
        ''
      if (text.trim()) return text.trim()
    }
    if (openai) {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openai}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0.4,
          max_tokens: 400,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: userMsg },
          ],
        }),
      })
      const data = await res.json().catch(() => ({}))
      const text = data?.choices?.[0]?.message?.content
      if (text?.trim()) return text.trim()
    }
  } catch {
    /* تجاهل — نرجع الرد المحلي */
  }
  return null
}

export async function replyOpen(
  message: string,
  history: { role: string; content: string }[] = []
): Promise<{
  text: string
  matchedIds: string[]
  links: { label: string; href: string }[]
  imageUrl?: string
  videoUrl?: string
  engine: string
}> {
  const cfg = await getAssistantConfig()
  if (!cfg.enabled) {
    return {
      text: 'المساعد متوقف مؤقتاً.',
      matchedIds: [],
      links: [],
      engine: 'off',
    }
  }

  const msg = (message || '').trim()
  if (!msg) {
    return {
      text: cfg.welcome,
      matchedIds: [],
      links: [],
      engine: 'welcome',
    }
  }

  if (/^(السلام|مرحبا|مرحباً|هلا|hi|hello|سلام)[\s!.]*$/i.test(msg)) {
    return {
      text: cfg.welcome,
      matchedIds: [],
      links: [],
      engine: 'greeting',
    }
  }

  const ranked = [...cfg.items]
    .map((it) => ({ it, score: scoreItem(msg, it) }))
    .filter((x) => x.score >= 2.5)
    .sort((a, b) => b.score - a.score)

  if (!ranked.length) {
    return {
      text: cfg.fallback,
      matchedIds: [],
      links: [
        { label: 'لوحة المستخدم', href: '/dashboard' },
        { label: 'اتصل بنا', href: '/contact' },
      ],
      engine: 'fallback',
    }
  }

  const top = ranked.slice(0, 2)
  const ids = top.map((x) => x.it.id)
  const links: { label: string; href: string }[] = []
  let imageUrl = ''
  let videoUrl = ''
  const answers: string[] = []

  for (const { it } of top) {
    answers.push(it.answer)
    for (const l of it.links || []) {
      if (!links.some((x) => x.href === l.href)) links.push(l)
    }
    if (it.imageUrl && !imageUrl) imageUrl = it.imageUrl
    if (it.videoUrl && !videoUrl) videoUrl = it.videoUrl
  }

  let text = answers.join('\n\n')
  let engine = 'knowledge'

  // نموذج صغير/متوسط خفيف: إعادة صياغة فقط (ليس نموذجاً ضخماً)
  if (cfg.useSmallModel) {
    const polished = await polishWithSmallModel(msg, text, cfg.personality)
    if (polished) {
      text = polished
      engine = 'knowledge+small-model'
    }
  }

  if (!cfg.useSmallModel || engine === 'knowledge') {
    text += '\n\nهل تريد تفصيلاً أكثر؟ اكتب بحرية.'
  }

  return {
    text,
    matchedIds: ids,
    links,
    imageUrl: imageUrl || undefined,
    videoUrl: videoUrl || undefined,
    engine,
  }
}
