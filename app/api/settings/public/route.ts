import { NextResponse } from 'next/server'
import { getFullSettings } from '@/lib/platform-settings-full'

export const dynamic = 'force-dynamic'

export async function GET() {
  const s = await getFullSettings()
  return NextResponse.json({
    ok: true,
    siteName: s.siteName,
    siteTagline: s.siteTagline,
    siteDescription: s.siteDescription,
    supportEmail: s.supportEmail,
    supportWhatsapp: s.supportWhatsapp,
    maintenanceMode: s.maintenanceMode,
    maintenanceMessage: s.maintenanceMessage,
    services: (s.services || []).filter((x) => x.enabled).sort((a, b) => a.order - b.order),
    blogEnabled: s.blogEnabled,
    blogTitle: s.blogTitle,
    blogIntro: s.blogIntro,
    customHeadHtml: s.customHeadHtml || '',
    customBodyHtml: s.customBodyHtml || '',
  })
}
