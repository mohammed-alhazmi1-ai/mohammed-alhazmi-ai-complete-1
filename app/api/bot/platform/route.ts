import { NextRequest, NextResponse } from 'next/server'
import { replyOpen, getAssistantConfig } from '@/lib/platform-assistant'

export const dynamic = 'force-dynamic'

export async function GET() {
  const cfg = await getAssistantConfig()
  return NextResponse.json({
    ok: true,
    name: cfg.name,
    welcome: cfg.welcome,
    enabled: cfg.enabled,
    unlimited: true,
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const message = String(body.message || body.prompt || body.text || '').trim()
    const history = Array.isArray(body.history) ? body.history.slice(-12) : []

    if (!message) {
      const cfg = await getAssistantConfig()
      return NextResponse.json({
        ok: true,
        text: cfg.welcome,
        unlimited: true,
      })
    }

    const result = await replyOpen(message, history)
    return NextResponse.json({
      ok: true,
      text: result.text,
      links: result.links,
      matchedIds: result.matchedIds,
      unlimited: true,
      provider: 'platform-assistant',
    })
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || 'خطأ' },
      { status: 500 }
    )
  }
}
