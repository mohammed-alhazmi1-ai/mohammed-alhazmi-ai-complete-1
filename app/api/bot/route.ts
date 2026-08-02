import { NextRequest, NextResponse } from 'next/server';
import {
  COST_PER_TEXT,
  deductCredits,
  ensureUserByEmail,
  getMaintenanceMode,
  totalCredits,
} from '@/lib/credits';
import { generateWithFallback, routeIntent } from '@/lib/ai/router';

export async function POST(req: NextRequest) {
  try {
    if (await getMaintenanceMode()) {
      return NextResponse.json({ error: 'المنصة في وضع الصيانة.' }, { status: 503 });
    }

    const body = await req.json();
    const { message, email, provider, execute } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: 'اكتب رسالتك' }, { status: 400 });
    }
    if (!email) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
    }

    const intent = routeIntent(message);

    // إن لم يطلب التنفيذ المباشر — أعد التوجيه فقط
    if (!execute && intent.category !== 'text') {
      return NextResponse.json({
        type: 'redirect',
        category: intent.category,
        servicePath: intent.servicePath,
        reply: intent.replyAr,
      });
    }

    // تنفيذ توليد نصي عبر المزود
    const user = await ensureUserByEmail(String(email));
    const balance = totalCredits(user.wallet);
    if (balance < COST_PER_TEXT) {
      return NextResponse.json(
        { error: `رصيد غير كافٍ (${balance})`, credits: balance },
        { status: 402 }
      );
    }

    const result = await generateWithFallback({
      prompt: message,
      systemPrompt: `أنت روبوت مساعد ذكي لمنصة محمد الحزمي للذكاء الاصطناعي.
ساعد المستخدم باختصار ووضوح بالعربية.
الطلب: ${message}`,
      category: 'text',
      preferredProvider: provider || undefined,
    });

    const newBalance = await deductCredits(
      user.id,
      COST_PER_TEXT,
      `روبوت — ${result.provider}`
    );

    return NextResponse.json({
      type: 'answer',
      reply: result.text,
      provider: result.provider,
      model: result.model,
      usedFallback: result.usedFallback,
      creditsUsed: COST_PER_TEXT,
      creditsRemaining: newBalance,
      servicePath: intent.servicePath,
      category: intent.category,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'خطأ' }, { status: 500 });
  }
}
