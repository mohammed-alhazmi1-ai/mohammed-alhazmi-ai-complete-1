import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();
    const normalized = String(code || '').trim().toUpperCase();
    if (!normalized) {
      return NextResponse.json({ error: 'أدخل كود الهدية' }, { status: 400 });
    }

    // دعم أسماء حقول شائعة في المشاريع المختلفة
    let gift: any = null;
    try {
      gift = await (prisma as any).giftCode.findFirst({
        where: {
          OR: [
            { code: normalized },
            { code: String(code || '').trim() },
          ],
        },
      });
    } catch {
      return NextResponse.json({
        valid: false,
        error: 'جدول أكواد الهدايا غير جاهز بعد. أضف الأكواد من لوحة المالك لاحقاً.',
      });
    }

    if (!gift) {
      return NextResponse.json({ valid: false, error: 'الكود غير صحيح' });
    }

    const used = gift.isUsed || gift.used || gift.redeemedAt;
    const active = gift.isActive !== false && gift.status !== 'disabled';
    if (used) {
      return NextResponse.json({ valid: false, error: 'هذا الكود مُستخدم مسبقاً' });
    }
    if (!active) {
      return NextResponse.json({ valid: false, error: 'هذا الكود غير مفعّل' });
    }
    if (gift.expiresAt && new Date(gift.expiresAt) < new Date()) {
      return NextResponse.json({ valid: false, error: 'انتهت صلاحية الكود' });
    }

    return NextResponse.json({
      valid: true,
      code: gift.code,
      credits: gift.credits ?? gift.creditAmount ?? 0,
      planType: gift.planType || gift.plan || 'Gift',
      message: 'الكود صالح ويمكن استبداله',
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'خطأ' }, { status: 500 });
  }
}
