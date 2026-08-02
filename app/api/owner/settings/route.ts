import { NextRequest, NextResponse } from 'next/server';
import { isOwnerEmail } from '@/lib/credits';
import { getPlatformSettings, savePlatformSettings } from '@/lib/platform-settings';

export async function GET() {
  try {
    const settings = await getPlatformSettings();
    return NextResponse.json({ settings });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email || '').toLowerCase();
    if (!email || !(await isOwnerEmail(email))) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }
    const { email: _e, ...rest } = body;
    const settings = await savePlatformSettings(rest);
    return NextResponse.json({ success: true, settings });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'فشل الحفظ' }, { status: 500 });
  }
}
