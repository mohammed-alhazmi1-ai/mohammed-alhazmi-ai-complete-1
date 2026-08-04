import { promises as fs } from 'fs'
import path from 'path'

export type PlanB = {
  id: string
  name: string
  nameEn: string
  priceUsd: number
  priceYer?: number
  monthlyRemo: number
  chatLimit: number | null
  imageLimit: number | null
  videoLimit: number | null
  features: string[]
  badge?: string
  popular?: boolean
  enabled: boolean
}

const FILE = path.join(process.cwd(), 'data', 'plans-b.json')

export const DEFAULT_PLANS_B: PlanB[] = [
  {
    id: 'free',
    name: 'مجاني',
    nameEn: 'Free',
    priceUsd: 0,
    monthlyRemo: 50,
    chatLimit: 30,
    imageLimit: 3,
    videoLimit: 0,
    features: ['REMO ترحيبي', 'دردشة محدودة', 'صور محدودة'],
    enabled: true,
  },
  {
    id: 'starter',
    name: 'ستارتر',
    nameEn: 'Starter',
    priceUsd: 9,
    priceYer: 2250,
    monthlyRemo: 300,
    chatLimit: 200,
    imageLimit: 30,
    videoLimit: 5,
    features: ['300 REMO', 'صور + دردشة', 'قوالب'],
    enabled: true,
  },
  {
    id: 'pro',
    name: 'برو',
    nameEn: 'Pro',
    priceUsd: 19,
    priceYer: 4750,
    monthlyRemo: 800,
    chatLimit: null,
    imageLimit: 100,
    videoLimit: 20,
    features: ['800 REMO', 'دردشة بلا حدود', 'أولوية'],
    popular: true,
    badge: 'الأكثر طلباً',
    enabled: true,
  },
  {
    id: 'business',
    name: 'أعمال',
    nameEn: 'Business',
    priceUsd: 49,
    priceYer: 12250,
    monthlyRemo: 2500,
    chatLimit: null,
    imageLimit: 400,
    videoLimit: 60,
    features: ['2500 REMO', 'كل الخدمات', 'دعم أولوية'],
    enabled: true,
  },
  {
    id: 'vip',
    name: 'VIP',
    nameEn: 'VIP',
    priceUsd: 99,
    priceYer: 24750,
    monthlyRemo: 6000,
    chatLimit: null,
    imageLimit: null,
    videoLimit: null,
    features: ['6000 REMO', 'بلا حدود تقريباً', 'مدير حساب'],
    badge: 'مميز',
    enabled: true,
  },
]

async function readAll(): Promise<PlanB[]> {
  try {
    const raw = await fs.readFile(FILE, 'utf8')
    const data = JSON.parse(raw)
    if (Array.isArray(data) && data.length) return data
    if (Array.isArray(data?.plans) && data.plans.length) return data.plans
  } catch {
    /* first run */
  }
  return DEFAULT_PLANS_B.map((p) => ({ ...p }))
}

async function writeAll(plans: PlanB[]) {
  await fs.mkdir(path.dirname(FILE), { recursive: true })
  await fs.writeFile(
    FILE,
    JSON.stringify({ plans, updatedAt: new Date().toISOString() }, null, 2),
    'utf8'
  )
}

export async function listPlansB(): Promise<PlanB[]> {
  return readAll()
}

export async function listEnabledPlansB(): Promise<PlanB[]> {
  const all = await readAll()
  return all.filter((p) => p.enabled !== false)
}

export async function upsertPlanB(plan: PlanB): Promise<PlanB[]> {
  const all = await readAll()
  const id = (plan.id || 'plan_' + Date.now()).trim()
  const row: PlanB = {
    id,
    name: String(plan.name || '').trim() || id,
    nameEn: String(plan.nameEn || '').trim() || id,
    priceUsd: Number(plan.priceUsd) || 0,
    priceYer: plan.priceYer != null ? Number(plan.priceYer) : undefined,
    monthlyRemo: Number(plan.monthlyRemo) || 0,
    chatLimit: plan.chatLimit === null || plan.chatLimit === undefined ? null : Number(plan.chatLimit),
    imageLimit: plan.imageLimit === null || plan.imageLimit === undefined ? null : Number(plan.imageLimit),
    videoLimit: plan.videoLimit === null || plan.videoLimit === undefined ? null : Number(plan.videoLimit),
    features: Array.isArray(plan.features) ? plan.features.filter(Boolean) : [],
    badge: plan.badge,
    popular: !!plan.popular,
    enabled: plan.enabled !== false,
  }
  const i = all.findIndex((p) => p.id === id)
  if (i >= 0) all[i] = row
  else all.push(row)
  await writeAll(all)
  return all
}

export async function togglePlanB(id: string): Promise<PlanB[]> {
  const all = await readAll()
  const next = all.map((p) =>
    p.id === id ? { ...p, enabled: !p.enabled } : p
  )
  await writeAll(next)
  return next
}

export async function deletePlanB(id: string): Promise<PlanB[]> {
  const all = await readAll()
  const next = all.filter((p) => p.id !== id)
  await writeAll(next)
  return next
}
