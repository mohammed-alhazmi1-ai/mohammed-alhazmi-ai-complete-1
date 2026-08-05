import { promises as fs } from 'fs'
import path from 'path'

export type AdSenseSettings = {
  adsenseEnabled: boolean
  adsenseClient: string
  adsenseSlotHome: string
  adsenseSlotHome2: string
}

const FILE = path.join(process.cwd(), 'data', 'adsense.json')

const DEFAULTS: AdSenseSettings = {
  adsenseEnabled: false,
  adsenseClient: '',
  adsenseSlotHome: '',
  adsenseSlotHome2: '',
}

export async function getAdSense(): Promise<AdSenseSettings> {
  try {
    const raw = await fs.readFile(FILE, 'utf8')
    return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULTS }
  }
}

export async function saveAdSense(
  patch: Partial<AdSenseSettings>
): Promise<AdSenseSettings> {
  const cur = await getAdSense()
  const next = { ...cur, ...patch }
  await fs.mkdir(path.dirname(FILE), { recursive: true })
  await fs.writeFile(FILE, JSON.stringify(next, null, 2), 'utf8')
  return next
}
