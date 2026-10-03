import { promises as fs } from 'fs'
import path from 'path'
import { prisma } from '@/lib/prisma'

export type AdSenseSettings = {
  adsenseEnabled: boolean
  adsenseClient: string
  adsenseSlotHome: string
  adsenseSlotHome2: string
}

const FILE = path.join(process.cwd(), 'data', 'adsense.json')
const SETTING_KEY = 'adsense_settings'

const DEFAULTS: AdSenseSettings = {
  adsenseEnabled: false,
  adsenseClient: '',
  adsenseSlotHome: '',
  adsenseSlotHome2: '',
}

export async function getAdSense(): Promise<AdSenseSettings> {
  try {
    const row = await prisma.setting.findUnique({ where: { key: SETTING_KEY } })
    return { ...DEFAULTS, ...(row?.value ? JSON.parse(row.value) : {}) }
  } catch {
    try {
      const raw = await fs.readFile(FILE, 'utf8')
      return { ...DEFAULTS, ...JSON.parse(raw) }
    } catch {
      return { ...DEFAULTS }
    }
  }
}

export async function saveAdSense(
  patch: Partial<AdSenseSettings>
): Promise<AdSenseSettings> {
  const cur = await getAdSense()
  const next = { ...cur, ...patch }
  await prisma.setting.upsert({
    where: { key: SETTING_KEY },
    create: { key: SETTING_KEY, value: JSON.stringify(next) },
    update: { value: JSON.stringify(next) },
  })
  return next
}
