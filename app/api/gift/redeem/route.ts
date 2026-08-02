import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureUserByEmail, totalCredits } from '@/lib/credits';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || '').trim().toLowerCase();
    const code = String(body.code || '').trim().toUpperCase();

    if (!email) return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
    if (!code) return NextResponse.json({ error: 'أدخل كود الهدية' }, { status: 400 });

    const user = await ensureUserByEmail(email);

    let gift: any = null;
    try {
      gift = await (prisma as any).giftCode.findFirst({
        where: {
          OR: [{ code }, { code: String(body.code || '').trim() }],
        },
      });
    } catch {
      return NextResponse.json(
        { error: 'نظام أكواد الهدايا غير مهيأ في قاعدة البيانات بعد.' },
        { status: 503 }
      );
    }

    if (!gift) return NextResponse.json({ error: 'الكود غير صحيح' }, { status: 404 });

    const used = gift.isUsed || gift.used || gift.redeemedAt || gift.usedById;
    if (used) return NextResponse.json({ error: 'الكود مُستخدم مسبقاً' }, { status: 400 });
    if (gift.isActive === false || gift.status === 'disabled') {
      return NextResponse.json({ error: 'الكود غير مفعّل' }, { status: 400 });
    }
    if (gift.expiresAt && new Date(gift.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'انتهت صلاحية الكود' }, { status: 400 });
    }

    const creditsToAdd = Number(gift.credits ?? gift.creditAmount ?? 0) || 0;
    const planType = gift.planType || gift.plan || 'Gift';

    // تحديث المحفظة
    if (creditsToAdd > 0) {
      const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
      if (wallet) {
        const updated = await prisma.wallet.update({
          where: { userId: user.id },
          data: { freeCredits: { increment: creditsToAdd } },
        });
        try {
          await prisma.walletTransaction.create({
            data: {
              userId: user.id,
              type: 'gift',
              amount: creditsToAdd,
              balanceAfter: totalCredits(updated),
              description: `كود هدية ${code}`,
              reference: code,
            },
          });
        } catch { /* ignore */ }
      }
    }

    // تحديث الاشتراك لخطة الهدية إن وُجد
    try {
      if (user.subscription) {
        await prisma.subscription.update({
          where: { userId: user.id },
          data: {
            planType,
            status: 'active',
            validUntil: gift.validUntil || gift.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          } as any,
        });
      }
    } catch { /* ignore */ }

    // تعليم الكود كمستخدم — حقول مرنة
    try {
      const data: any = {};
      if ('isUsed' in gift) data.isUsed = true;
      if ('used' in gift) data.used = true;
      if ('redeemedAt' in gift) data.redeemedAt = new Date();
      if ('usedAt' in gift) data.usedAt = new Date();
      if ('usedById' in gift) data.usedById = user.id;
      if ('userId' in gift) data.userId = user.id;
      await (prisma as any).giftCode.update({ where: { id: gift.id }, data });
    } catch {
      try {
        await (prisma as any).giftCode.update({
          where: { id: gift.id },
          data: { isUsed: true, usedById: user.id },
        });
      } catch { /* ignore */ }
    }

    const fresh = await ensureUserByEmail(email);
    return NextResponse.json({
      success: true,
      message: creditsToAdd
        ? `تم تفعيل الكود وإضافة ${creditsToAdd} Credit`
        : 'تم تفعيل كود الهدية',
      plan: planType,
      creditsAdded: creditsToAdd,
      credits: totalCredits(fresh.wallet),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'فشل استبدال الكود' }, { status: 500 });
  }
}
