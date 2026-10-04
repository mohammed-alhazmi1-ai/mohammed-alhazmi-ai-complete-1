import { promises as fs } from 'fs'
import path from 'path'
import { prisma } from '@/lib/prisma'

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
const SETTING_KEY = 'platform_assistant'

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

const LOCAL_ITEMS: KnowledgeItem[] = [
  { id: 'science-local', title: 'العلوم', keywords: ['علوم', 'علم', 'فيزياء', 'كيمياء', 'احياء', 'فضاء', 'رياضيات'], answer: 'أستطيع شرح المفاهيم العلمية خطوة بخطوة وبأسلوب مبسّط، مع التفريق بين الحقيقة العلمية والفرضية. للسؤال عن نتيجة حديثة أو اكتشاف جديد سأبحث في الويب وأرفق المصادر.', enabled: true, priority: 5 },
  { id: 'technology-local', title: 'التكنولوجيا', keywords: ['تقنية', 'تكنولوجيا', 'برمجة', 'ذكاء اصطناعي', 'حاسوب', 'جوال', 'امن سيبراني'], answer: 'أساعدك في فهم التقنيات والبرمجة والذكاء الاصطناعي والأمن الرقمي، ويمكنني تفكيك المشكلة إلى خطوات عملية وأمثلة. المعلومات المتغيرة مثل الإصدارات والأسعار أتحقق منها عبر الويب.', enabled: true, priority: 5 },
  { id: 'literature-local', title: 'الأدب واللغة', keywords: ['ادب', 'شعر', 'رواية', 'لغة', 'نحو', 'كتابة', 'ترجمة'], answer: 'يمكنني مناقشة الأدب واللغة، تحليل نص أو قصيدة، تحسين الصياغة، وتقديم أفكار للكتابة مع احترام حقوق المؤلف وعدم اختلاق اقتباسات.', enabled: true, priority: 5 },
  { id: 'sports-local', title: 'الرياضة', keywords: ['رياضة', 'كرة', 'دوري', 'لاعب', 'مباراة', 'تمرين'], answer: 'أستطيع شرح قواعد الرياضات وتقديم معلومات تدريبية عامة. نتائج المباريات والانتقالات والأخبار الرياضية تتغير، لذلك أبحث عنها في الويب عند السؤال عنها.', enabled: true, priority: 5 },
  { id: 'health-local', title: 'الصحة', keywords: ['صحة', 'مرض', 'اعراض', 'دواء', 'غذاء', 'طبي', 'طبيب'], answer: 'أقدم معلومات صحية عامة وتثقيفية، لكنني لا أشخّص ولا أستبدل الطبيب. في الأعراض الشديدة أو الطارئة تواصل فوراً مع الطوارئ أو طبيب مؤهل، وسأذكر المصادر عند البحث.', enabled: true, priority: 5 },
  { id: 'daily-local', title: 'الدردشة اليومية', keywords: ['كيف حالك', 'صباح', 'مساء', 'شكرا', 'نصيحة', 'فضفضة', 'دردشة'], answer: 'أنا ريناس، مساعدة ودودة للحوار والتفكير وتنظيم الأفكار. تحدث معي بحرية، وسأحافظ على سياق المحادثة وأجيب بأدب ووضوح.', enabled: true, priority: 5 },
]

const DEFAULT_CONFIG: AssistantConfig = {
  name: 'ريناس',
  welcome:
    'مرحباً، أنا ريناس. أساعدك في العلوم والتقنية والأدب والرياضة والصحة والدردشة اليومية، وأبحث في الويب تلقائياً عندما تحتاج الإجابة إلى معلومات غير موجودة لدي.',
  fallback:
    'لم أجد إجابة موثوقة في معرفتي المحلية، ولم تتوفر نتيجة بحث كافية الآن. أعد صياغة السؤال أو اطلب مني البحث في الويب مرة أخرى.',
  personality: 'أنا ريناس: مساعدة عربية مثقفة، لبقة، دقيقة، ودودة. أشرح ببساطة، أذكر حدود اليقين، لا أختلق المعلومات، وأستخدم البحث في الويب للمعلومات الحديثة أو غير المؤكدة.',
  enabled: true,
  useSmallModel: true,
  items: [...DEFAULT_ITEMS, ...LOCAL_ITEMS],
}

async function searchWebFallback(query: string): Promise<{ text: string; links: { label: string; href: string }[] } | null> {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query.slice(0, 300))}`
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 PlatformAssistant/1.0' }, cache: 'no-store' })
    if (!res.ok) return null
    const html = await res.text()
    const rows: { text: string; href: string }[] = []
    const re = /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi
    let match: RegExpExecArray | null
    const clean = (s: string) => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim()
    while ((match = re.exec(html)) && rows.length < 3) {
      const href = match[1]
      const title = clean(match[2])
      const snippet = clean(match[3])
      if (title && snippet && /^https?:\/\//i.test(href)) rows.push({ href, text: `${title}: ${snippet}` })
    }
    if (!rows.length) return null
    return {
      text: `لم أجد إجابة في قاعدة معرفة المنصة، فبحثت في الويب.\n\n${rows.map((r) => `• ${r.text}`).join('\n\n')}`,
      links: rows.map((r) => ({ label: r.text.split(':')[0].slice(0, 70), href: r.href })),
    }
  } catch {
    return null
  }
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
    const row = await prisma.setting.findUnique({ where: { key: SETTING_KEY } })
    const data = row?.value ? JSON.parse(row.value) : {}
    return {
      ...DEFAULT_CONFIG,
      ...data,
      items: [...DEFAULT_ITEMS, ...LOCAL_ITEMS, ...(Array.isArray(data.items) ? data.items : [])]
        .filter((item, index, all) => all.findIndex((x) => x.id === item.id) === index),
    }
  } catch {
    try {
      const raw = await fs.readFile(FILE, 'utf8')
      const data = JSON.parse(raw)
      return {
        ...DEFAULT_CONFIG,
        ...data,
        items: [...DEFAULT_ITEMS, ...LOCAL_ITEMS, ...(Array.isArray(data.items) ? data.items : [])]
          .filter((item, index, all) => all.findIndex((x) => x.id === item.id) === index),
      }
    } catch {
      return { ...DEFAULT_CONFIG, items: [...DEFAULT_CONFIG.items] }
    }
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
  await prisma.setting.upsert({
    where: { key: SETTING_KEY },
    create: { key: SETTING_KEY, value: JSON.stringify(next) },
    update: { value: JSON.stringify(next) },
  })
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
  personality: string,
  history: { role: string; content: string }[] = []
): Promise<string | null> {
  const gemini = (process.env.GEMINI_API_KEY || '').trim()
  const openai = (process.env.OPENAI_API_KEY || '').trim()
  const context = history.slice(-8).map((item) => `${item.role}: ${item.content}`).join('\n')
  const system = `${personality || 'مساعد منصة عربي واضح.'}
أنت مساعد لغوي حواري. أجب بالعربية الواضحة وبشكل مباشر، وحافظ على سياق المحادثة.
لا تخترع أسعاراً أو ميزات أو حقائق غير موجودة في المادة المرجعية. إذا لم تكفِ المادة، صرّح بذلك بوضوح.
السياق السابق:
${context || '(لا يوجد)'}
المادة المرجعية أو نتائج البحث:
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
              parts: [{ text: `سؤال المستخدم: ${userMsg}\n\n${system}` }],
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

  // الأسئلة المحددة عن أشخاص أو أحداث أو معلومات متغيرة تحتاج مصدراً حديثاً.
  // نبدأ بالمعالجة المحلية دائماً، ثم نستخدم الويب فقط عندما لا تكفيها.
  const asksForSpecificFact = /^(من هو|من هي|ما هو|ما هي|ماذا|كيف|لماذا|متى|أين|هل|كم|who|what|how|why|when|where|is|are)\b/i.test(normalize(msg))
  if (asksForSpecificFact && !/رصيد|خطة|اشتراك|صور|فيديو|موسيقى|دعم|حساب/.test(normalize(msg))) {
    const web = await searchWebFallback(msg)
    if (web) {
      const polished = await polishWithSmallModel(msg, web.text, cfg.personality, history)
      return { text: polished || web.text, matchedIds: [], links: web.links, engine: polished ? 'web-search+model' : 'local+web-search' }
    }
  }

  const ranked = [...cfg.items]
    .map((it) => ({ it, score: scoreItem(msg, it) }))
    .filter((x) => x.score >= 2.5)
    .sort((a, b) => b.score - a.score)

  if (!ranked.length) {
    const web = await searchWebFallback(msg)
    if (web) {
      const polished = await polishWithSmallModel(msg, web.text, cfg.personality, history)
      return { text: polished || web.text, matchedIds: [], links: web.links, engine: polished ? 'web-search+model' : 'local+web-search' }
    }
    const modelAnswer = await polishWithSmallModel(msg, cfg.fallback, cfg.personality, history)
    if (modelAnswer) return { text: modelAnswer, matchedIds: [], links: [], engine: 'model-fallback' }
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
    const polished = await polishWithSmallModel(msg, text, cfg.personality, history)
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
