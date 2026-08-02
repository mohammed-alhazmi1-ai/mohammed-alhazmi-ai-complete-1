import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isOwnerEmail } from '@/lib/credits';

const DEFAULTS = [
  { serviceKey: 'text_generate', displayName: 'شات / نصوص', creditsCost: 0 },
  { serviceKey: 'code_generate', displayName: 'برمجة', creditsCost: 0 },
  { serviceKey: 'image_generate', displayName: 'صور', creditsCost: 20 },
  { serviceKey: 'video_generate', displayName: 'فيديو', creditsCost: 120 },
  { serviceKey: 'audio_generate', displayName: 'صوت / موسيقى', creditsCost: 30 },
];

export async function GET(req: NextRequest) {
  try {
    const email = (req.nextUrl.searchParams.get('email') || '').toLowerCase();
    if (!email || !(await isOwnerEmail(email))) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }
    try {
      let rows = await prisma.serviceCost.findMany();
      if (!rows.length) {
        for (const d of DEFAULTS) {
          await prisma.serviceCost.upsert({
            where: { serviceKey: d.serviceKey },
            create: { ...d, isActive: true },
            update: {},
          });
        }
        rows = await prisma.serviceCost.findMany();
      }
      return NextResponse.json({ costs: rows });
    } catch {
      return NextResponse.json({ costs: DEFAULTS, warning: 'جدول ServiceCost غير جاهز' });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'خطأ' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ownerEmail = String(body.ownerEmail || body.email || '').toLowerCase();
    if (!ownerEmail || !(await isOwnerEmail(ownerEmail))) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }
    const { serviceKey, creditsCost, displayName, isActive } = body;
    if (!serviceKey) return NextResponse.json({ error: 'serviceKey مطلوب' }, { status: 400 });

    const row = await prisma.serviceCost.upsert({
      where: { serviceKey },
      create: {
        serviceKey,
        displayName: displayName || serviceKey,
        creditsCost: Math.floor(Number(creditsCost) || 0),
        isActive: isActive !== false,
      },
      update: {
        creditsCost: Math.floor(Number(creditsCost) || 0),
        ...(displayName ? { displayName } : {}),
        ...(typeof isActive === 'boolean' ? { isActive } : {}),
      },
    });
    return NextResponse.json({ success: true, cost: row });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'خطأ' }, { status: 500 });
  }
}
