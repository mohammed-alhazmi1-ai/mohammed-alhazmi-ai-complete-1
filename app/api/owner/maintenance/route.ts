import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isOwnerEmail } from '@/lib/credits';

const KEY = 'maintenance';

export async function GET() {
  try {
    const s = await prisma.setting.findUnique({ where: { key: KEY } });
    const on = s?.value === 'true' || s?.value === '1';
    return NextResponse.json({ maintenance: on });
  } catch {
    return NextResponse.json({ maintenance: false });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || '').toLowerCase();
    if (!email || !(await isOwnerEmail(email))) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }
    const on = !!body.maintenance;
    await prisma.setting.upsert({
      where: { key: KEY },
      create: { key: KEY, value: on ? 'true' : 'false' },
      update: { value: on ? 'true' : 'false' },
    });
    return NextResponse.json({ success: true, maintenance: on });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'خطأ' }, { status: 500 });
  }
}
