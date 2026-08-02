import { NextResponse } from 'next/server';
import { getPlatformSettings } from '@/lib/platform-settings';

/** إعدادات عامة للواجهة (بدون صلاحيات) */
export async function GET() {
  try {
    const settings = await getPlatformSettings();
    return NextResponse.json({ settings });
  } catch (e: any) {
    return NextResponse.json({ settings: null, error: e.message }, { status: 500 });
  }
}
