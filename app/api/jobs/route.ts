import { NextRequest, NextResponse } from 'next/server';
import { executeServiceJob } from '@/lib/service-layer';
import { ensureUserByEmail } from '@/lib/credits';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await executeServiceJob({
      email: body.email,
      prompt: body.prompt,
      serviceType: body.serviceType || body.type || 'chat',
      provider: body.provider,
      model: body.model,
      tone: body.tone,
      length: body.length,
    });
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'خطأ في تنفيذ المهمة', jobId: e?.jobId, status: 'failed' },
      { status: e?.status || 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get('email') || '';
    if (!email) return NextResponse.json({ error: 'البريد مطلوب' }, { status: 400 });
    const user = await ensureUserByEmail(email);
    const jobs = await prisma.aiJob.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return NextResponse.json({ jobs });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'خطأ' }, { status: 500 });
  }
}
