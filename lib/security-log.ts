import { promises as fs } from 'fs'
import path from 'path'

export type SecurityEvent = {
  id: string
  at: string
  type:
    | 'blocked_upload'
    | 'malware_suspect'
    | 'nsfw_suspect'
    | 'rate_limit'
    | 'path_traversal'
    | 'invalid_type'
    | 'oversized'
    | 'attack_pattern'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  ip?: string
  meta?: Record<string, any>
  seen: boolean
}

const FILE = path.join(process.cwd(), 'data', 'security-events.json')
const MAX = 500

async function readAll(): Promise<SecurityEvent[]> {
  try {
    const raw = await fs.readFile(FILE, 'utf8')
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

async function writeAll(items: SecurityEvent[]) {
  await fs.mkdir(path.dirname(FILE), { recursive: true })
  await fs.writeFile(FILE, JSON.stringify(items.slice(0, MAX), null, 2), 'utf8')
}

export async function logSecurityEvent(
  partial: Omit<SecurityEvent, 'id' | 'at' | 'seen'>
): Promise<SecurityEvent> {
  const items = await readAll()
  const ev: SecurityEvent = {
    ...partial,
    id: `sec_\( {Date.now()}_ \){Math.random().toString(36).slice(2, 8)}`,
    at: new Date().toISOString(),
    seen: false,
  }
  items.unshift(ev)
  await writeAll(items)
  return ev
}

export async function listSecurityEvents(limit = 100) {
  const items = await readAll()
  return items.slice(0, limit)
}

export async function markSecuritySeen(ids?: string[]) {
  const items = await readAll()
  for (const it of items) {
    if (!ids || ids.includes(it.id)) it.seen = true
  }
  await writeAll(items)
  return items
}

export async function unreadSecurityCount() {
  const items = await readAll()
  return items.filter((x) => !x.seen).length
}
