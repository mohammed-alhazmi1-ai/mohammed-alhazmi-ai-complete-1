import { promises as fs } from 'fs'
import path from 'path'

export type ServiceToggle = {
  id: string
  name: string
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
  customHeadHtml: string
  customBodyHtml: string
  blogEnabled: boolean
  blogTitle: string
  blogIntro: string
  adsenseEnabled: boolean
  adsenseClient: string
  adsenseSlotHome: string
  adsenseSlotHome2: string
  updatedAt?: string
}

const FILE = path.join(process.cwd(), 'data', 'platform-settings-full.json')

export const DEFAULT_SERVICES: ServiceToggle[] = [
  { id: 'images', name: 'الصور', href: '/dashboard/images', enabled: true, order: 1 },
  { id: 'video', name: 'الفيديو', href: '/dashboard/video', enabled: true, order: 2 },
  { id: 'music', name: 'الموسيقى', href: '/dashboard/music', enabled: true, order: 3 },
  { id: 'code', name: 'البرمجة', href: '/dashboard/code', enabled: true, order: 4 },
  { id: 'chat', name: 'الدردشة', href: '/dashboard/chat', enabled: true, order: 5 },
  { id: 'bot', name: 'المساعد الذكي', href: '/dashboard/bot', enabled: true, order: 6 },
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
  customHeadHtml: '',
  customBodyHtml: '',
  blogEnabled: false,
  blogTitle: 'مدونة المنصة',
  blogIntro: 'مقالات ونصائح حول الذكاء الاصطناعي',
  adsenseEnabled: false,
  adsenseClient: '',
  adsenseSlotHome: '',
  adsenseSlotHome2: '',
}

async function read(): Promise<PlatformFullSettings> {
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
    }
  } catch {
    return { ...DEFAULT_FULL, services: [...DEFAULT_SERVICES] }
  }
}

async function write(s: PlatformFullSettings) {
  await fs.mkdir(path.dirname(FILE), { recursive: true })
  s.updatedAt = new Date().toISOString()
  await fs.writeFile(FILE, JSON.stringify(s, null, 2), 'utf8')
}

export async function getFullSettings() {
  return read()
}

export async function saveFullSettings(
  patch: Partial<PlatformFullSettings>
): Promise<PlatformFullSettings> {
  const cur = await read()
  const next: PlatformFullSettings = {
    ...cur,
    ...patch,
    freeSignupRemo: Math.max(
      0,
      Math.min(
        100000,
        Number(patch.freeSignupRemo ?? cur.freeSignupRemo) || 0
      )
    ),
    services: patch.services ?? cur.services,
  }
  await write(next)

  // مزامنة مع ملف المرحلة A إن وُجد
  try {
    const aPath = path.join(process.cwd(), 'data', 'settings-a.json')
    await fs.writeFile(
      aPath,
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
