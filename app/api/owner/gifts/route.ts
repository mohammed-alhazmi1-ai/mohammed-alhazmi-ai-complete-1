import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isOwnerEmail } from '@/lib/credits';

function randomCode() {
  const part = () => Math.random().toString(36).slice(2, 6).toUpperCase();
  return `GIFT-\( {part()}- \){part()}`;
}

export async function GET(req: NextRequest) {
  try {
    const email = (req.nextUrl.searchParams.get('email') || '').toLowerCase();
    if (!email || !(await isOwnerEmail(email))) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }
    try {
      const list = await (prisma as any).giftCode.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
      return NextResponse.json({ codes: list });
    } catch {
      return NextResponse.json({
        codes: [],
        warning: 'جدول GiftCode غير موجود بعد. أضفه في schema ثم prisma db push',
      });
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

    const credits = Math.floor(Number(body.credits) || 0);
    const planType = body.planType || 'Gift';
    const code = (body.code || randomCode()).toString().trim().toUpperCase();
    const days = Math.floor(Number(body.days) || 30);

    try {
      const created = await (prisma as any).giftCode.create({
        data: {
          code,
          credits,
          creditAmount: credits,
          planType,
          isActive: true,
          isUsed: false,
          expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
        },
      });
      return NextResponse.json({ success: true, code: created });
    } catch (e: any) {
      // محاولة بحقول أقل
      try {
        const created = await (prisma as any).giftCode.create({
          data: { code, credits, isActive: true },
        });
        return NextResponse.json({ success: true, code: created });
      } catch (e2: any) {
        return NextResponse.json(
          {
            error:
              'تعذر إنشاء الكود. تأكد من وجود model GiftCode في prisma ثم: npx prisma db push',
            detail: e2?.message || e?.message,
          },
          { status: 503 }
        );
      }
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'خطأ' }, { status: 500 });
  }
}
