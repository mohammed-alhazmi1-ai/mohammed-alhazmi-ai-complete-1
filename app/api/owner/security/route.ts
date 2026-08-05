import { NextRequest, NextResponse } from 'next/server'
import {
  listSecurityEvents,
  markSecuritySeen,
  unreadSecurityCount,
} from '@/lib/security-log'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const unread = req.nextUrl.searchParams.get('unreadOnly') === '1'
  let events = await listSecurityEvents(200)
  if (unread) events = events.filter((e) => !e.seen)
  const count = await unreadSecurityCount()
  return NextResponse.json({ ok: true, events, unread: count })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    if (body.action === 'mark_seen') {
      await markSecuritySeen(Array.isArray(body.ids) ? body.ids : undefined)
      const count = await unreadSecurityCount()
      return NextResponse.json({ ok: true, unread: count })
    }
    return NextResponse.json({ ok: false, error: 'إجراء غير معروف' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 })
  }
}
