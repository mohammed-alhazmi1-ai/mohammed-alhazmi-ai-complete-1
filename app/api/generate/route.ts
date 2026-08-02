import { NextRequest, NextResponse } from 'next/server';
import { executeServiceJob } from '@/lib/service-layer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const serviceType = body.serviceType || body.type || 'chat';
    const result = await executeServiceJob({
      email: body.email,
      prompt: body.prompt,
      serviceType,
      provider: body.provider,
      model: body.model,
      tone: body.tone,
      length: body.length,
    });
    return NextResponse.json({
      result: result.result,
      model: result.model,
      provider: result.provider,
      creditsUsed: result.creditsUsed,
      creditsRemaining: result.creditsRemaining,
      jobId: result.jobId,
      status: result.status,
      chatUsed: result.chatUsed,
      chatLimit: result.chatLimit,
      codeUsed: result.codeUsed,
      codeLimit: result.codeLimit,
      note: result.note,
      serviceType,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'حدث خطأ أثناء التوليد', jobId: e?.jobId },
      { status: e?.status || 500 }
    );
  }
}
