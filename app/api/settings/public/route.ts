import { NextResponse } from 'next/server'
import { getFullSettings } from '@/lib/platform-settings-full'
import { getAdSense } from '@/lib/adsense-settings'

export const dynamic = 'force-dynamic'

export async function GET() {
  const s = await getFullSettings()
  const ads = await getAdSense()
  return NextResponse.json({
    logoUrl: s.logoUrl,
    socialLinks: (s.socialLinks || []).filter((x: any) => x.enabled && x.href).sort((a: any, b: any) => a.order - b.order) || '',
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
    adsenseEnabled: ads.adsenseEnabled,
    adsenseClient: ads.adsenseClient,
    adsenseSlotHome: ads.adsenseSlotHome,
    adsenseSlotHome2: ads.adsenseSlotHome2,
  })
}
