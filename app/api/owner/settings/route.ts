import { NextRequest, NextResponse } from 'next/server'
import {
  getFullSettings,
  saveFullSettings,
  type PlatformFullSettings,
} from '@/lib/platform-settings-full'

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
    const allowed: (keyof PlatformFullSettings)[] = [
      'freeSignupRemo',
      'siteName',
      'siteTagline',
      'siteDescription',
      'supportEmail',
      'supportWhatsapp',
      'maintenanceMode',
      'maintenanceMessage',
      'services',
      'customHeadHtml',
      'customBodyHtml',
      'blogEnabled',
      'blogTitle',
      'blogIntro',
    ]
    const patch: Partial<PlatformFullSettings> = {}
    for (const k of allowed) {
      if (body[k] !== undefined) (patch as any)[k] = body[k]
    }
    const settings = await saveFullSettings(patch)
    return NextResponse.json({ ok: true, settings })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 })
  }
}
