import { NextRequest, NextResponse } from 'next/server'
import { getSettingsA, saveSettingsA } from '@/lib/platform-settings-a'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const settings = await getSettingsA()
    return NextResponse.json({ ok: true, settings })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'خطأ' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const settings = await saveSettingsA({
      freeSignupRemo:
        typeof body.freeSignupRemo === 'number'
          ? body.freeSignupRemo
          : undefined,
      siteName: typeof body.siteName === 'string' ? body.siteName : undefined,
      siteTagline:
        typeof body.siteTagline === 'string' ? body.siteTagline : undefined,
    })
    return NextResponse.json({ ok: true, settings })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'خطأ' }, { status: 500 })
  }
}
