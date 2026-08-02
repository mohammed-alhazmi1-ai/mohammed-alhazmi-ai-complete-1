import { prisma } from '@/lib/prisma';
import {
  deductCredits,
  ensureUserByEmail,
  getMaintenanceMode,
  totalCredits,
} from '@/lib/credits';
import {
  getPlanLimits,
  isMessageService,
  isPaidPlan,
  MEDIA_COST,
} from '@/lib/plans';

export type JobRequest = {
  email: string;
  prompt: string;
  serviceType: string;
  provider?: string;
  model?: string;
  tone?: string;
  length?: string;
};

export type JobResponse = {
  jobId: string;
  status: string;
  result?: string;
  provider?: string;
  model?: string;
  creditsUsed: number;
  creditsRemaining: number;
  chatUsed?: number;
  chatLimit?: number | null;
  codeUsed?: number;
  codeLimit?: number | null;
  note?: string;
};

async function resetPeriodIfNeeded(sub: {
  id: string;
  periodStart?: Date | null;
  chatUsed?: number;
  codeUsed?: number;
}) {
  const periodStart = sub.periodStart ? new Date(sub.periodStart) : null;
  if (!periodStart) {
    try {
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { periodStart: new Date(), chatUsed: 0, codeUsed: 0 } as any,
      });
    } catch { /* حقول قد لا تكون في DB بعد */ }
    return { chatUsed: 0, codeUsed: 0 };
  }
  const now = new Date();
  const monthPassed =
    now.getFullYear() > periodStart.getFullYear() ||
    (now.getFullYear() === periodStart.getFullYear() && now.getMonth() > periodStart.getMonth());
  if (monthPassed) {
    try {
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { periodStart: now, chatUsed: 0, codeUsed: 0 } as any,
      });
    } catch {}
    return { chatUsed: 0, codeUsed: 0 };
  }
  return { chatUsed: sub.chatUsed || 0, codeUsed: sub.codeUsed || 0 };
}

/**
 * طبقة الخدمات — بدون ربط مزود حقيقي الآن (وضع البناء)
 * لاحقاً نستبدل قسم النتيجة فقط باستدعاء المزود
 */
export async function executeServiceJob(input: JobRequest): Promise<JobResponse> {
  if (await getMaintenanceMode()) {
    throw Object.assign(new Error('المنصة في وضع الصيانة حالياً.'), { status: 503 });
  }

  const prompt = (input.prompt || '').trim();
  if (!prompt) throw Object.assign(new Error('الرجاء إدخال نص الطلب.'), { status: 400 });
  if (!input.email) throw Object.assign(new Error('يجب تسجيل الدخول.'), { status: 401 });

  const serviceType = (input.serviceType || 'chat').toLowerCase();
  const user = await ensureUserByEmail(input.email);
  let sub = user.subscription as any;

  if (!sub) {
    sub = await prisma.subscription.create({
      data: {
        userId: user.id,
        planType: 'Free',
        monthlyLimit: 50,
        status: 'active',
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      } as any,
    });
  }

  const usage = await resetPeriodIfNeeded({
    id: sub.id,
    periodStart: sub.periodStart,
    chatUsed: sub.chatUsed,
    codeUsed: sub.codeUsed,
  });

  const planType = sub.planType || 'Free';
  const limits = getPlanLimits(planType);
  const paid = isPaidPlan(planType);
  const chatLimit = paid ? null : (sub.chatLimit ?? limits.chatLimit);
  const codeLimit = paid ? null : (sub.codeLimit ?? limits.codeLimit);
  const messageService = isMessageService(serviceType);
  const cost = messageService ? 0 : (MEDIA_COST[serviceType] ?? 20);
  const balance = totalCredits(user.wallet);

  if (messageService) {
    if (serviceType === 'code' || serviceType === 'text') {
      if (!paid && codeLimit !== null && usage.codeUsed >= codeLimit) {
        throw Object.assign(
          new Error(`انتهى حد طلبات البرمجة (\( {usage.codeUsed}/ \){codeLimit}). رقِّ الخطة أو انتظر التجديد.`),
          { status: 402 }
        );
      }
    } else if (!paid && chatLimit !== null && usage.chatUsed >= chatLimit) {
      throw Object.assign(
        new Error(`انتهى حد رسائل الشات (\( {usage.chatUsed}/ \){chatLimit}). رقِّ الخطة أو انتظر التجديد.`),
        { status: 402 }
      );
    }
  } else if (balance < cost) {
    throw Object.assign(
      new Error(`رصيد غير كافٍ. المتاح ${balance} — المطلوب ${cost} Credit`),
      { status: 402 }
    );
  }

  const job = await prisma.aiJob.create({
    data: {
      userId: user.id,
      provider: input.provider || 'pending-provider',
      model: input.model || null,
      type: serviceType,
      prompt: prompt.slice(0, 4000),
      status: 'processing',
      creditsUsed: 0,
    },
  });

  // وضع البناء: نتيجة مؤقتة — الربط بالمزود في المرحلة الأخيرة
  const mockResult =
    `[وضع البناء] تم استلام طلب «${serviceType}» وحفظه.\n\n` +
    `الطلب: ${prompt.slice(0, 500)}\n\n` +
    `سيتم ربط مزود الخدمة في المرحلة الأخيرة. الطلب محفوظ بحالة مكتمل للتجربة.`;

  try {
    let creditsRemaining = balance;
    let chatUsed = usage.chatUsed;
    let codeUsed = usage.codeUsed;

    if (messageService) {
      try {
        if (serviceType === 'code' || serviceType === 'text') {
          const u = await prisma.subscription.update({
            where: { id: sub.id },
            data: { codeUsed: { increment: 1 } } as any,
          });
          codeUsed = (u as any).codeUsed ?? codeUsed + 1;
        } else {
          const u = await prisma.subscription.update({
            where: { id: sub.id },
            data: { chatUsed: { increment: 1 } } as any,
          });
          chatUsed = (u as any).chatUsed ?? chatUsed + 1;
        }
      } catch {
        // إن لم تُطبَّق الحقول بعد على DB
        if (serviceType === 'code' || serviceType === 'text') codeUsed += 1;
        else chatUsed += 1;
      }
    } else if (cost > 0) {
      creditsRemaining = await deductCredits(
        user.id,
        cost,
        `${serviceType} (وضع بناء)`
      );
    }

    await prisma.aiJob.update({
      where: { id: job.id },
      data: {
        status: 'completed',
        provider: input.provider || 'build-mode',
        result: mockResult.slice(0, 12000),
        creditsUsed: cost,
        finishedAt: new Date(),
      },
    });

    return {
      jobId: job.id,
      status: 'completed',
      result: mockResult,
      provider: input.provider || 'build-mode',
      model: input.model || 'build-mode',
      creditsUsed: cost,
      creditsRemaining,
      chatUsed,
      chatLimit,
      codeUsed,
      codeLimit,
      note: 'وضع البناء — المزود سيُربط لاحقاً',
    };
  } catch (e: any) {
    await prisma.aiJob.update({
      where: { id: job.id },
      data: {
        status: 'failed',
        errorMsg: (e?.message || 'failed').slice(0, 500),
        finishedAt: new Date(),
      },
    });
    throw Object.assign(new Error(e?.message || 'فشل تنفيذ الطلب'), {
      status: e?.status || 500,
      jobId: job.id,
    });
  }
}
