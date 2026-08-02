import { NextRequest, NextResponse } from 'next/server';
import { ensureUserByEmail, totalCredits } from '@/lib/credits';
import { prisma } from '@/lib/prisma';
import { getPlanLimits, isPaidPlan } from '@/lib/plans';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email || '').trim().toLowerCase();
    if (!email) return NextResponse.json({ error: 'البريد مطلوب' }, { status: 400 });

    const user = await ensureUserByEmail(email, {
      firstName: body.firstName,
      lastName: body.lastName,
      username: body.username,
    });

    const credits = totalCredits(user.wallet);
    const planType = user.subscription?.planType || 'Free';
    const limits = getPlanLimits(planType);
    const paid = isPaidPlan(planType);
    const sub = user.subscription as any;

    const chatLimit = paid ? null : (sub?.chatLimit ?? limits.chatLimit);
    const codeLimit = paid ? null : (sub?.codeLimit ?? limits.codeLimit);
    const chatUsed = sub?.chatUsed ?? 0;
    const codeUsed = sub?.codeUsed ?? 0;

    const recentJobs = await prisma.aiJob.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true, type: true, provider: true, prompt: true,
        status: true, creditsUsed: true, createdAt: true, finishedAt: true,
      },
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      role: user.role,
      credits,
      plan: planType,
      subscriptionStatus: user.subscription?.status || 'active',
      limits: {
        chatLimit,
        codeLimit,
        chatUsed,
        codeUsed,
        chatRemaining: chatLimit === null ? null : Math.max(0, chatLimit - chatUsed),
        codeRemaining: codeLimit === null ? null : Math.max(0, codeLimit - codeUsed),
        unlimitedChat: chatLimit === null,
        unlimitedCode: codeLimit === null,
      },
      recentJobs,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'خطأ' }, { status: 500 });
  }
}
