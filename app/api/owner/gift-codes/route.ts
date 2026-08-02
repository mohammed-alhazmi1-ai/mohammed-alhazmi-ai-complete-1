import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function generateCode(length = 10) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'GIFT-';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// GET - list gift codes
export async function GET() {
  try {
    const codes = await prisma.giftCode.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return NextResponse.json({ codes });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'فشل جلب الأكواد' }, { status: 500 });
  }
}

// POST - create gift code(s)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      planType = 'Gift',
      creditsReward = 200,
      durationDays = 30,
      maxUses = 1,
      expiresAt = null,
      count = 1,
      customCode = null,
    } = body;

    const validPlans = ['Gift', 'Pro', 'Business', 'VIP', 'Free'];
    if (!validPlans.includes(planType)) {
      return NextResponse.json({ error: 'نوع الخطة غير صالح' }, { status: 400 });
    }

    const created = [];
    const n = Math.min(Math.max(1, Number(count) || 1), 50);

    for (let i = 0; i < n; i++) {
      const code = customCode && n === 1 ? String(customCode).toUpperCase().trim() : generateCode();
      try {
        const gift = await prisma.giftCode.create({
          data: {
            code,
            planType,
            creditsReward: Number(creditsReward) || 0,
            durationDays: Number(durationDays) || 30,
            maxUses: Number(maxUses) || 1,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
          },
        });
        created.push(gift);
      } catch (e: any) {
        if (e?.code === 'P2002') {
          return NextResponse.json({ error: `الكود ${code} مستخدم مسبقاً` }, { status: 400 });
        }
        throw e;
      }
    }

    return NextResponse.json({ message: 'تم إنشاء الأكواد بنجاح', codes: created }, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error?.message || 'فشل إنشاء الكود' }, { status: 500 });
  }
}
