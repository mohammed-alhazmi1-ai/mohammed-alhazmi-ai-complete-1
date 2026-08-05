import { NextRequest, NextResponse } from 'next/server'
import { getAdSense, saveAdSense } from '@/lib/adsense-settings'

export const dynamic = 'force-dynamic'

export async function GET() {
  const settings = await getAdSense()
  return NextResponse.json({ ok: true, settings })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const settings = await saveAdSense({
      adsenseEnabled: Boolean(body.adsenseEnabled),
      adsenseClient: String(body.adsenseClient || '').trim(),
      adsenseSlotHome: String(body.adsenseSlotHome || '').trim(),
      adsenseSlotHome2: String(body.adsenseSlotHome2 || '').trim(),
    })
    return NextResponse.json({ ok: true, settings })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 })
  }
}
