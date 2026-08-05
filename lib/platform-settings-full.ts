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
  { id: 'whatsapp', label: 'واتساب', href: 'https://wa.me/967777096733', icon: 'whatsapp', enabled: true, order: 1 },
  { id: 'telegram', label: 'تيليجرام', href: '', icon: 'telegram', enabled: false, order: 2 },
  { id: 'twitter', label: 'X / تويتر', href: '', icon: 'twitter', enabled: false, order: 3 },
  { id: 'instagram', label: 'إنستغرام', href: '', icon: 'instagram', enabled: false, order: 4 },
  { id: 'youtube', label: 'يوتيوب', href: '', icon: 'youtube', enabled: false, order: 5 },
  { id: 'facebook', label: 'فيسبوك', href: '', icon: 'facebook', enabled: false, order: 6 },
  { id: 'tiktok', label: 'تيك توك', href: '', icon: 'tiktok', enabled: false, order: 7 },
  { id: 'snapchat', label: 'سناب شات', href: '', icon: 'snapchat', enabled: false, order: 8 },
]

const DEFAULT_NAV: NavButton[] = [
  { id: 'start', label: 'ابدأ الآن', href: '/register', enabled: true, order: 1 },
  { id: 'login', label: 'تسجيل الدخول', href: '/login', enabled: true, order: 2 },
  { id: 'plans', label: 'الخطط', href: '/#plans', enabled: true, order: 3 },
  { id: 'about', label: 'من نحن', href: '/about', enabled: true, order: 4 },
  { id: 'contact', label: 'اتصل بنا', href: '/contact', enabled: true, order: 5 },
]

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
    }
  } catch {
    return {
      ...DEFAULT_FULL,
      services: [...DEFAULT_SERVICES],
      navButtons: [...DEFAULT_NAV],
      socialLinks: [...DEFAULT_SOCIAL],
    }
  }
}

export async function saveFullSettings(
  patch: Partial<PlatformFullSettings>
): Promise<PlatformFullSettings> {
  const cur = await getFullSettings()
  const next: PlatformFullSettings = {
    ...cur,
    ...patch,
    freeSignupRemo: Math.max(
      0,
      Math.min(100000, Number(patch.freeSignupRemo ?? cur.freeSignupRemo) || 0)
    ),
    services: patch.services ?? cur.services,
    navButtons: patch.navButtons ?? cur.navButtons,
    socialLinks: patch.socialLinks ?? cur.socialLinks,
    updatedAt: new Date().toISOString(),
  }
  await fs.mkdir(path.dirname(FILE), { recursive: true })
  await fs.writeFile(FILE, JSON.stringify(next, null, 2), 'utf8')
  try {
    await fs.writeFile(
      path.join(process.cwd(), 'data', 'settings-a.json'),
      JSON.stringify(
        {
          freeSignupRemo: next.freeSignupRemo,
          siteName: next.siteName,
          siteTagline: next.siteTagline,
        },
        null,
        2
      ),
      'utf8'
    )
  } catch {
    /* ignore */
  }
  return next
}
