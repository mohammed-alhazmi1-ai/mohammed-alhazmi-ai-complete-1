import { promises as fs } from 'fs'
import path from 'path'

export type ServiceToggle = {
  id: string
  name: string
  href: string
  enabled: boolean
  order: number
}

export type SocialLink = {
  id: string
  label: string
  href: string
  icon: string
  enabled: boolean
  order: number
}

export type NavButton = {
  id: string
  label: string
  href: string
  enabled: boolean
  order: number
}

export type LandingContent = {
  badgeText: string
  heroSubtitle: string
  ticker1: string
  ticker2: string
  ticker3: string
  promptLabel: string
  promptPlaceholder: string
  runButton: string
  ctaPrimary: string
  ctaPrimaryHref: string
  ctaSecondary: string
  ctaSecondaryHref: string
  servicesTitle: string
  servicesSubtitle: string
  featuresTitle: string
  templatesTitle: string
  templatesSubtitle: string
  guideTitle: string
  guideSubtitle: string
  articlesTitle: string
  articlesSubtitle: string
  comingTitle: string
  comingSubtitle: string
  footerNote: string
  loginLabel: string
  registerLabel: string
  memberHint: string
}

export type PlatformFullSettings = {
  freeSignupRemo: number
  siteName: string
  siteTagline: string
  siteDescription: string
  supportEmail: string
  supportWhatsapp: string
  maintenanceMode: boolean
  maintenanceMessage: string
  services: ServiceToggle[]
  navButtons: NavButton[]
  socialLinks: SocialLink[]
  customHeadHtml: string
  customBodyHtml: string
  blogEnabled: boolean
  blogTitle: string
  blogIntro: string
  adsenseEnabled: boolean
  adsenseClient: string
  adsenseSlotHome: string
  adsenseSlotHome2: string
  logoUrl: string
  faviconUrl: string
  homeBackgroundUrl: string
  dashboardBackgroundUrl: string
  primaryColor: string
  aboutTitle: string
  aboutBody: string
  contactTitle: string
  contactBody: string
  privacyTitle: string
  privacyBody: string
  termsTitle: string
  termsBody: string
  landing: LandingContent
  updatedAt?: string
}

const FILE = path.join(process.cwd(), 'data', 'platform-settings-full.json')

const DEFAULT_SERVICES: ServiceToggle[] = [
  { id: 'images', name: 'الصور', href: '/dashboard/images', enabled: true, order: 1 },
  { id: 'video', name: 'الفيديو', href: '/dashboard/video', enabled: true, order: 2 },
  { id: 'music', name: 'الموسيقى', href: '/dashboard/music', enabled: true, order: 3 },
  { id: 'code', name: 'البرمجة', href: '/dashboard/code', enabled: true, order: 4 },
  { id: 'chat', name: 'الدردشة', href: '/dashboard/chat', enabled: true, order: 5 },
  { id: 'bot', name: 'المساعد الذكي', href: '/dashboard/bot', enabled: true, order: 6 },
]

const DEFAULT_SOCIAL: SocialLink[] = [
  {
    id: 'whatsapp',
    label: 'واتساب',
    href: 'https://wa.me/967777096733',
    icon: 'whatsapp',
    enabled: true,
    order: 1,
  },
  { id: 'telegram', label: 'تيليجرام', href: '', icon: 'telegram', enabled: false, order: 2 },
  { id: 'twitter', label: 'X / تويتر', href: '', icon: 'twitter', enabled: false, order: 3 },
  { id: 'instagram', label: 'إنستغرام', href: '', icon: 'instagram', enabled: false, order: 4 },
  { id: 'youtube', label: 'يوتيوب', href: '', icon: 'youtube', enabled: false, order: 5 },
  { id: 'facebook', label: 'فيسبوك', href: '', icon: 'facebook', enabled: false, order: 6 },
]

const DEFAULT_NAV: NavButton[] = [
  { id: 'start', label: 'ابدأ الآن', href: '/register', enabled: true, order: 1 },
  { id: 'login', label: 'تسجيل الدخول', href: '/login', enabled: true, order: 2 },
  { id: 'plans', label: 'الخطط', href: '/#plans', enabled: true, order: 3 },
  { id: 'about', label: 'من نحن', href: '/about', enabled: true, order: 4 },
  { id: 'contact', label: 'اتصل بنا', href: '/contact', enabled: true, order: 5 },
]

export const DEFAULT_LANDING: LandingContent = {
  badgeText: 'منصة عربية للذكاء الاصطناعي',
  heroSubtitle:
    'توليد الصور والفيديو والموسيقى والبرمجة والدردشة الذكية — في مكان واحد، بواجهة عربية سهلة واحترافية.',
  ticker1: 'مرحباً بكم في منصة محمد الحزمي للذكاء الاصطناعي',
  ticker2: 'ماذا في خاطرك اليوم؟ اكتب طلبك وسننفّذه',
  ticker3: 'صور · فيديو · موسيقى · برمجة · دردشة ذكية',
  promptLabel: 'ماذا في خاطرك اليوم؟ اكتب طلبك وسنقوم بتنفيذه',
  promptPlaceholder: 'مثال: صمم شعاراً، اكتب كود صفحة، أو أنشئ وصفاً لفيديو...',
  runButton: 'تنفيذ',
  ctaPrimary: 'ابدأ الآن',
  ctaPrimaryHref: '/register',
  ctaSecondary: 'لوحة المستخدم',
  ctaSecondaryHref: '/dashboard',
  servicesTitle: 'خدمات المنصة',
  servicesSubtitle: 'كل خدمة بأيقونتها ووصفها — اضغط للانتقال إلى لوحة التحكم',
  featuresTitle: 'لماذا منصتنا؟',
  templatesTitle: 'قوالب جاهزة للتجربة',
  templatesSubtitle: 'اضغط قالباً ليُنسخ إلى مربع الطلب أعلاه — عدّله ثم اضغط تنفيذ',
  guideTitle: 'كيف تستخدم أدوات المنصة؟',
  guideSubtitle: 'خمس خطوات بسيطة من التسجيل حتى التحميل',
  articlesTitle: 'تعرّف على خدمات المنصة',
  articlesSubtitle: 'مقالات مختصرة تشرح كل خدمة وكيف تفيدك',
  comingTitle: 'مزايا قيد التطوير',
  comingSubtitle: 'نعمل على إضافات جديدة لتجربة أقوى — ترقّب التحديثات',
  footerNote: 'منصة محمد الحزمي للذكاء الاصطناعي',
  loginLabel: 'دخول',
  registerLabel: 'إنشاء حساب',
  memberHint: 'عضو جديد؟',
}

export const DEFAULT_FULL: PlatformFullSettings = {
  freeSignupRemo: 100,
  siteName: 'منصة محمد الحزمي للذكاء الاصطناعي',
  siteTagline: 'صور · فيديو · موسيقى · برمجة · دردشة',
  siteDescription: 'منصة عربية متكاملة لأدوات الذكاء الاصطناعي',
  supportEmail: 'mohammedalhzmi1@gmail.com',
  supportWhatsapp: '777096733',
  maintenanceMode: false,
  maintenanceMessage: 'المنصة تحت الصيانة مؤقتاً. نعود قريباً.',
  services: DEFAULT_SERVICES,
  navButtons: DEFAULT_NAV,
  socialLinks: DEFAULT_SOCIAL,
  customHeadHtml: '',
  customBodyHtml: '',
  blogEnabled: false,
  blogTitle: 'مدونة المنصة',
  blogIntro: 'مقالات ونصائح حول الذكاء الاصطناعي',
  adsenseEnabled: false,
  adsenseClient: '',
  adsenseSlotHome: '',
  adsenseSlotHome2: '',
  logoUrl: '',
  faviconUrl: '',
  homeBackgroundUrl: '',
  dashboardBackgroundUrl: '',
  primaryColor: '#2563eb',
  aboutTitle: 'من نحن',
  aboutBody:
    'منصة محمد الحزمي للذكاء الاصطناعي منصة عربية تقدم توليد الصور والفيديو والموسيقى والبرمجة والدردشة الذكية.',
  contactTitle: 'اتصل بنا',
  contactBody: 'للتواصل والدعم الفني راسلنا عبر البريد أو واتساب.',
  privacyTitle: 'سياسة الخصوصية',
  privacyBody: 'نحترم خصوصيتك ولا نبيع بياناتك لأطراف ثالثة.',
  termsTitle: 'الشروط والأحكام',
  termsBody: 'باستخدامك المنصة فإنك توافق على شروط الاستخدام وسياسة الرصيد REMO.',
  landing: { ...DEFAULT_LANDING },
}

export async function getFullSettings(): Promise<PlatformFullSettings> {
  try {
    const raw = await fs.readFile(FILE, 'utf8')
    const data = JSON.parse(raw)
    return {
      ...DEFAULT_FULL,
      ...data,
      services:
        Array.isArray(data.services) && data.services.length
          ? data.services
          : DEFAULT_SERVICES,
      socialLinks:
        Array.isArray(data.socialLinks) && data.socialLinks.length
          ? data.socialLinks
          : DEFAULT_SOCIAL,
      navButtons:
        Array.isArray(data.navButtons) && data.navButtons.length
          ? data.navButtons
          : DEFAULT_NAV,
      landing: {
        ...DEFAULT_LANDING,
        ...(data.landing && typeof data.landing === 'object' ? data.landing : {}),
      },
    }
  } catch {
    return { ...DEFAULT_FULL, landing: { ...DEFAULT_LANDING } }
  }
}

export async function saveFullSettings(
  patch: Partial<PlatformFullSettings>
): Promise<PlatformFullSettings> {
  const cur = await getFullSettings()
  const next: PlatformFullSettings = {
    ...cur,
    ...patch,
    services: patch.services ?? cur.services,
    socialLinks: patch.socialLinks ?? cur.socialLinks,
    navButtons: patch.navButtons ?? cur.navButtons,
    landing: {
      ...DEFAULT_LANDING,
      ...cur.landing,
      ...(patch.landing || {}),
    },
    updatedAt: new Date().toISOString(),
  }
  await fs.mkdir(path.dirname(FILE), { recursive: true })
  await fs.writeFile(FILE, JSON.stringify(next, null, 2), 'utf8')
  return next
}
