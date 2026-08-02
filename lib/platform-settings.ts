import { prisma } from '@/lib/prisma';

export type PlatformSettings = {
  siteNameAr: string;
  siteNameEn: string;
  taglineAr: string;
  taglineEn: string;
  logoEmoji: string;
  logoUrl: string;
  primaryColor: string;
  backgroundStyle: string; // dark | gradient | blue
  supportEmail: string;
  aboutAr: string;
  heroTitleAr: string;
  heroSubtitleAr: string;
  footerTextAr: string;
  showProvidersOnHome: boolean;
  maintenanceMessage: string;
};

export const DEFAULT_SETTINGS: PlatformSettings = {
  siteNameAr: 'منصة محمد الحزمي',
  siteNameEn: 'Mohammed Alhazmi AI',
  taglineAr: 'المنصة العربية الشاملة للذكاء الاصطناعي',
  taglineEn: 'The complete Arabic AI platform',
  logoEmoji: '🚀',
  logoUrl: '',
  primaryColor: '#2563eb',
  backgroundStyle: 'dark',
  supportEmail: 'support@mohammed-alhazmi.ai',
  aboutAr:
    'منصة SaaS عربية تجمع أحدث تقنيات الذكاء الاصطناعي للصور والفيديو والموسيقى والبرمجة والدردشة.',
  heroTitleAr: 'ابتكر، صمم، وأنشئ بمستوى عالمي',
  heroSubtitleAr:
    'صور · فيديو · موسيقى وزفات · برمجة · دردشة ذكية — كل أدوات الذكاء الاصطناعي في منصة عربية واحدة.',
  footerTextAr: '© 2026 منصة محمد الحزمي للذكاء الاصطناعي. جميع الحقوق محفوظة.',
  showProvidersOnHome: true,
  maintenanceMessage: 'المنصة في وضع الصيانة حالياً. نعود قريباً.',
};

const KEY = 'platform_settings';

export async function getPlatformSettings(): Promise<PlatformSettings> {
  try {
    const row = await prisma.setting.findUnique({ where: { key: KEY } });
    if (!row?.value) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(row.value);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function savePlatformSettings(
  data: Partial<PlatformSettings>
): Promise<PlatformSettings> {
  const current = await getPlatformSettings();
  const merged = { ...current, ...data };
  await prisma.setting.upsert({
    where: { key: KEY },
    create: { key: KEY, value: JSON.stringify(merged) },
    update: { value: JSON.stringify(merged) },
  });
  return merged;
}
