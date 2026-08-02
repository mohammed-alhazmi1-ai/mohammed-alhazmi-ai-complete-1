import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureUserByEmail } from '@/lib/credits';
import {
  CREDIT_PACKS,
  PAYMENT_METHODS,
  convertAmount,
  type PayCurrency,
} from '@/lib/payment-methods';

export async function GET() {
  return NextResponse.json({
    packs: CREDIT_PACKS,
    methods: PAYMENT_METHODS.filter((m) => m.enabled),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || '').trim().toLowerCase();
    const packId = String(body.packId || '');
    const methodId = String(body.methodId || body.provider || 'manual');
    const currency = (String(body.currency || 'USD').toUpperCase() || 'USD') as PayCurrency;

    if (!email) return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });

    const pack = CREDIT_PACKS.find((p) => p.id === packId);
    if (!pack) return NextResponse.json({ error: 'اختر حزمة شحن صحيحة' }, { status: 400 });

    const method = PAYMENT_METHODS.find((m) => m.id === methodId && m.enabled);
    if (!method) return NextResponse.json({ error: 'طريقة دفع غير متاحة' }, { status: 400 });

    if (!method.currencies.includes(currency)) {
      return NextResponse.json(
        {
          error: `العملة ${currency} غير مدعومة لطريقة ${method.nameAr}. المدعوم: ${method.currencies.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const user = await ensureUserByEmail(email);
    const amountLocal = convertAmount(pack.priceUsd, currency);

    let payment: any;
    try {
      payment = await (prisma as any).payment.create({
        data: {
          userId: user.id,
          provider: methodId,
          amount: amountLocal,
          currency,
          credits: pack.credits,
          status: 'pending',
          description: `شحن ${pack.label} عبر ${method.nameAr}`,
          metadata: JSON.stringify({
            packId: pack.id,
            priceUsd: pack.priceUsd,
            methodId,
            currency,
            amountLocal,
          }),
        },
      });
    } catch (e: any) {
      return NextResponse.json(
        {
          error: 'جدول Payment غير جاهز. نفّذ npx prisma db push',
          detail: e?.message,
        },
        { status: 503 }
      );
    }

    // تعليمات حسب الطريقة (عناوين حقيقية من إعدادات المالك لاحقاً)
    const nextSteps: Record<string, string> = {
      binance:
        'سيتم عرض عنوان بينانس (USDT) من إعدادات المالك. أرسل المبلغ ثم احتفظ برقم الطلب.',
      crypto:
        'سيتم عرض عنوان المحفظة الرقمية من إعدادات المالك. أرسل USDT بنفس المبلغ.',
      jeeb:
        'افتح تطبيق محفظة جيب وحوّل المبلغ بالريال اليمني حسب الفاتورة، ثم أرسل رقم العملية للدعم أو للمالك.',
      stripe: 'سيتم توجيهك لصفحة الدفع بالبطاقة عند ربط Stripe.',
      paypal: 'سيتم توجيهك إلى PayPal عند الربط.',
      manual: 'تواصل مع الدعم مع رقم الطلب لإتمام التحويل.',
    };

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      status: 'pending',
      method: {
        id: method.id,
        nameAr: method.nameAr,
        type: method.type,
      },
      amount: amountLocal,
      amountUsd: pack.priceUsd,
      currency,
      credits: pack.credits,
      instructions: method.instructionsAr,
      nextStep: nextSteps[methodId] || method.instructionsAr,
      checkoutUrl: null,
      message: `تم إنشاء طلب الدفع #${String(payment.id).slice(0, 8)} — \( {method.nameAr} ( \){amountLocal} ${currency})`,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'خطأ' }, { status: 500 });
  }
}
