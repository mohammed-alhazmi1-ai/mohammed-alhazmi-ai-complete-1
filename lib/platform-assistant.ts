import { promises as fs } from 'fs'
import path from 'path'

export type KnowledgeItem = {
  id: string
  title: string
  keywords: string[]
  answer: string
  links?: { label: string; href: string }[]
  enabled: boolean
  priority: number
}

export type AssistantConfig = {
  name: string
  welcome: string
  fallback: string
  personality: string
  enabled: boolean
  items: KnowledgeItem[]
  updatedAt?: string
}

const FILE = path.join(process.cwd(), 'data', 'platform-assistant.json')

const DEFAULT_ITEMS: KnowledgeItem[] = [
  {
    id: 'welcome-platform',
    title: 'عن المنصة',
    keywords: ['منصة', 'ايش', 'ما هي', 'شنو', 'تعريف', 'خدمات', 'تقدم'],
    answer:
      'منصة محمد الحزمي للذكاء الاصطناعي تقدّم عدة خدمات في مكان واحد: توليد الصور، الفيديو، الموسيقى، البرمجة، والدردشة. اختر الخدمة من لوحة المستخدم وابدأ بكتابة طلبك. الرصيد يُحسب بوحدة REMO.',
    links: [{ label: 'لوحة المستخدم', href: '/dashboard' }],
    enabled: true,
    priority: 10,
  },
  {
    id: 'images',
    title: 'توليد الصور',
    keywords: ['صور', 'صورة', 'شعار', 'لوجو', 'تصميم', 'image'],
    answer:
      'لخدمة الصور: من لوحة المستخدم افتح «الصور»، اكتب وصفاً واضحاً أو اختر قالباً، ثم اضغط توليد. يُخصم من رصيد REMO حسب تكلفة الخدمة. إن ظهر خطأ في النموذج، جرّب وصفاً أقصر أو مزوداً آخر إن كان متاحاً.',
    links: [{ label: 'فتح الصور', href: '/dashboard/images' }],
    enabled: true,
    priority: 20,
  },
  {
    id: 'video',
    title: 'الفيديو',
    keywords: ['فيديو', 'مقطع', 'video', 'يوتيوب'],
    answer:
      'خدمة الفيديو من قائمة الخدمات. اكتب فكرة المقطع أو السيناريو ثم ولّد. بعض المزودين يُرجعون سيناريو نصياً حسب الإعداد الحالي، ويمكن تطوير الإخراج لاحقاً.',
    links: [{ label: 'فتح الفيديو', href: '/dashboard/video' }],
    enabled: true,
    priority: 20,
  },
  {
    id: 'music',
    title: 'الموسيقى',
    keywords: ['موسيقى', 'اغنية', 'شيلة', 'زفة', 'نغمة', 'music'],
    answer:
      'من قسم الموسيقى يمكنك طلب شيلة أو زفة أو هيكل أغنية. اكتب الأسلوب والكلمات المطلوبة ثم ولّد.',
    links: [{ label: 'فتح الموسيقى', href: '/dashboard/music' }],
    enabled: true,
    priority: 20,
  },
  {
    id: 'code',
    title: 'البرمجة',
    keywords: ['كود', 'برمجة', 'موقع', 'تطبيق', 'code', 'html', 'react'],
    answer:
      'قسم البرمجة يساعدك على كتابة أكواد مواقع وتطبيقات. صف المطلوب بالتفصيل (التقنية، الصفحات، الوظائف) ثم اضغط توليد.',
    links: [{ label: 'فتح البرمجة', href: '/dashboard/code' }],
    enabled: true,
    priority: 20,
  },
  {
    id: 'plans',
    title: 'الخطط والرصيد',
    keywords: ['خطة', 'باقة', 'اشتراك', 'رصيد', 'ريمو', 'remo', 'سعر', 'مجاني', 'برو'],
    answer:
      'الرصيد بوحدة REMO. المسجّل الجديد يحصل على رصيد مجاني حسب إعدادات المالك. عند نفاد الرصيد تظهر باقات الاشتراك ويمكن الشحن من صفحة الفوترة (محفظة جيب، تحويلات، وغيرها حسب التفعيل).',
    links: [
      { label: 'الخطط', href: '/dashboard/plans' },
      { label: 'الشحن', href: '/dashboard/billing' },
    ],
    enabled: true,
    priority: 15,
  },
  {
    id: 'payment',
    title: 'الدفع',
    keywords: ['دفع', 'جيب', 'بينانس', 'تحويل', 'بطاقة', 'شحن', 'ايداع'],
    answer:
      'طرق الدفع تعتمد على ما فعّله المالك: مثل محفظة جيب (إيداع ثم إشعار واتساب)، أو محافظ رقمية، أو بوابات أخرى. بعد الدفع اليدوي يراجع المالك الطلب ويُضاف الرصيد.',
    links: [{ label: 'صفحة الشحن', href: '/dashboard/billing' }],
    enabled: true,
    priority: 15,
  },
  {
    id: 'gift',
    title: 'أكواد الهدايا',
    keywords: ['هدية', 'كود', 'قسيمة', 'gift', 'كوبون'],
    answer:
      'إذا لديك كود هدية، أدخله من صفحة كود الهدية في لوحة المستخدم ليُفعَّل الرصيد أو الخطة حسب إعداد الكود من المالك.',
    links: [{ label: 'كود هدية', href: '/dashboard/gift' }],
    enabled: true,
    priority: 25,
  },
  {
    id: 'support',
    title: 'الدعم',
    keywords: ['دعم', 'مساعدة', 'مشكلة', 'خطأ', 'تواصل', 'واتساب', 'ايميل'],
    answer:
      'للدعم: راسل المالك عبر واتساب أو البريد الظاهر في صفحة اتصل بنا. اذكر نوع المشكلة ولقطة إن أمكن (توليد، دفع، تسجيل).',
    links: [{ label: 'اتصل بنا', href: '/contact' }],
    enabled: true,
    priority: 30,
  },
  {
    id: 'account',
    title: 'الحساب',
    keywords: ['حساب', 'تسجيل', 'دخول', 'كلمة المرور', 'ايميل'],
    answer:
      'إنشاء الحساب من صفحة التسجيل، وتسجيل الدخول من صفحة الدخول. إذا نسيت كلمة المرور استخدم استعادة كلمة المرور إن كانت مفعّلة، أو تواصل مع الدعم.',
    links: [
      { label: 'تسجيل', href: '/register' },
      { label: 'دخول', href: '/login' },
    ],
    enabled: true,
    priority: 25,
  },
]

const DEFAULT_CONFIG: AssistantConfig = {
  name: 'مساعد منصة محمد الحزمي',
  welcome:
    'مرحباً، أنا مساعد المنصة. اسألني عن الخدمات، الرصيد، الخطط، الدفع، أو أي استفسار متعلق بالمنصة — بلا حد لعدد الرسائل.',
  fallback:
    'فهمت سؤالك. لم أجد تطابقاً دقيقاً في معرفة المنصة بعد. صِغ سؤالك بطريقة أخرى، أو تصفح الخدمات من لوحة المستخدم، أو تواصل مع الدعم. المالك يستطيع إضافة هذا الموضوع لمعرفة المساعد من لوحة التحكم.',
  personality:
    'ردودك بالعربية الفصحى المبسطة، ودية وواضحة، وتساعد المستخدم على إنجاز مهمته داخل المنصة.',
  enabled: true,
  items: DEFAULT_ITEMS,
}

function normalize(s: string) {
  return (s || '')
    .toLowerCase()
    .replace(/[^\u0600-\u06FFa-z0-9\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
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

function scoreItem(msg: string, item: KnowledgeItem): number {
  if (!item.enabled) return 0
  const n = normalize(msg)
  let score = 0
  for (const kw of item.keywords || []) {
    const k = normalize(kw)
    if (!k) continue
    if (n.includes(k)) score += 3
    // تطابق جزئي للكلمات
    for (const w of k.split(' ')) {
      if (w.length >= 2 && n.includes(w)) score += 1
    }
  }
  const title = normalize(item.title)
  if (title && n.includes(title)) score += 2
  // كلمات الرسالة داخل الجواب (ضعيف)
  for (const w of n.split(' ')) {
    if (w.length < 3) continue
    if (normalize(item.answer).includes(w)) score += 0.15
  }
  return score + (item.priority || 0) * 0.01
}

/** رد مفتوح: يجمع أفضل المعرفة + صياغة حوارية بلا حد رسائل */
export async function replyOpen(
  message: string,
  history: { role: string; content: string }[] = []
): Promise<{
  text: string
  matchedIds: string[]
  links: { label: string; href: string }[]
}> {
  const cfg = await getAssistantConfig()
  if (!cfg.enabled) {
    return {
      text: 'المساعد متوقف مؤقتاً من لوحة المالك.',
      matchedIds: [],
      links: [],
    }
  }

  const msg = (message || '').trim()
  if (!msg) {
    return { text: cfg.welcome, matchedIds: [], links: [] }
  }

  // تحيات
  if (/^(السلام|مرحبا|مرحباً|هلا|hi|hello|سلام)[\s!.]*$/i.test(msg)) {
    return { text: cfg.welcome, matchedIds: [], links: [] }
  }

  const ranked = [...cfg.items]
    .map((it) => ({ it, score: scoreItem(msg, it) }))
    .filter((x) => x.score >= 2)
    .sort((a, b) => b.score - a.score)

  if (!ranked.length) {
    // رد مفتوح غير مغلق: يبني على آخر سياق إن وُجد
    const lastUser = [...history].reverse().find((h) => h.role === 'user')
    let text = cfg.fallback
    if (lastUser?.content) {
      text +=
        '\n\nيمكنك إعادة صياغة سؤالك أو ذكر اسم الخدمة (صور، فيديو، رصيد، دفع…).'
    }
    return {
      text,
      matchedIds: [],
      links: [
        { label: 'لوحة المستخدم', href: '/dashboard' },
        { label: 'اتصل بنا', href: '/contact' },
      ],
    }
  }

  // دمج حتى أفضل 2 مواضيع لرد أغنى (مفتوح أكثر من FAQ واحد)
  const top = ranked.slice(0, 2)
  const parts: string[] = []
  const links: { label: string; href: string }[] = []
  const ids: string[] = []

  for (const { it } of top) {
    ids.push(it.id)
    parts.push(it.answer)
    for (const l of it.links || []) {
      if (!links.some((x) => x.href === l.href)) links.push(l)
    }
  }

  let text = parts.join('\n\n')

  // لمسة حوارية مفتوحة
  if (ranked[0].score < 4) {
    text =
      'بناءً على سؤالك هذا أقرب ما لدي في معرفة المنصة:\n\n' + text
  }

  if (cfg.personality) {
    // لا نُظهر الشخصية للمستخدم؛ التأثير عبر الأسلوب فقط في النصوص المحفوظة
  }

  text += '\n\nهل تريد تفصيلاً أكثر عن جزء معيّن؟ اكتب بحرية.'

  return { text, matchedIds: ids, links }
}
