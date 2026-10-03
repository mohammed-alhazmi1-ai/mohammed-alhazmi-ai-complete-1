import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth/session'

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user || !['OWNER', 'ADMIN'].includes(String(user.role).toUpperCase())) {
    return NextResponse.json({ ok: false, error: 'غير مصرح' }, { status: 403 })
  }
  const key = (process.env.MANUS_API_KEY || '').trim()
  if (!key) return NextResponse.json({ ok: false, error: 'MANUS_API_KEY مفقود في Vercel' }, { status: 503 })

  const secret = (process.env.MANUS_WEBHOOK_SECRET || '').trim()
  const origin = req.nextUrl.origin
  const url = `${origin}/api/webhooks/manus${secret ? `?secret=${encodeURIComponent(secret)}` : ''}`
  const res = await fetch('https://api.manus.ai/v2/webhook.create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-manus-api-key': key },
    body: JSON.stringify({ url }),
  })
  const data = await res.json().catch(() => ({}))
  const alreadyExists = data?.error?.code === 'already_exists'
  return NextResponse.json({ ok: (res.ok && data?.ok !== false) || alreadyExists, webhook: data?.webhook, error: alreadyExists ? undefined : data?.error }, { status: res.ok || alreadyExists ? 200 : 502 })
}
