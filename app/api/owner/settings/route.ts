import { NextRequest, NextResponse } from 'next/server'
import { getFullSettings, saveFullSettings } from '@/lib/platform-settings-full'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const settings = await getFullSettings()
    return NextResponse.json({ ok: true, settings })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const settings = await saveFullSettings(body)
    return NextResponse.json({ ok: true, settings })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 })
  }
}
