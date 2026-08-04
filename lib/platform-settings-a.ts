import { promises as fs } from 'fs'
import path from 'path'

export type SettingsA = {
  freeSignupRemo: number
  siteName: string
  siteTagline: string
  updatedAt?: string
}

const FILE = path.join(process.cwd(), 'data', 'settings-a.json')

export const DEFAULT_A: SettingsA = {
  freeSignupRemo: 100,
  siteName: 'منصة محمد الحزمي للذكاء الاصطناعي',
  siteTagline: 'صور · فيديو · موسيقى · برمجة · دردشة',
}

export async function getSettingsA(): Promise<SettingsA> {
  try {
    const raw = await fs.readFile(FILE, 'utf8')
    const data = JSON.parse(raw)
    return { ...DEFAULT_A, ...data }
  } catch {
    return { ...DEFAULT_A }
  }
}

export async function saveSettingsA(patch: Partial<SettingsA>): Promise<SettingsA> {
  const current = await getSettingsA()
  const next: SettingsA = {
    ...current,
    ...patch,
    freeSignupRemo: Math.max(
      0,
      Math.min(100000, Number(patch.freeSignupRemo ?? current.freeSignupRemo) || 0)
    ),
    updatedAt: new Date().toISOString(),
  }
  await fs.mkdir(path.dirname(FILE), { recursive: true })
  await fs.writeFile(FILE, JSON.stringify(next, null, 2), 'utf8')
  return next
}

export async function getFreeSignupRemo(): Promise<number> {
  const s = await getSettingsA()
  return s.freeSignupRemo
}
