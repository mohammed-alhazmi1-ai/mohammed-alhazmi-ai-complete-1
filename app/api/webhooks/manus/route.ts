import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { deductCredits } from '@/lib/credits'
import { extractManusResultUrl } from '@/lib/ai/manus'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function findString(value: unknown, names: string[]): string | undefined {
  if (!value || typeof value !== 'object') return undefined
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    if (names.some((name) => key.toLowerCase().includes(name)) && typeof item === 'string') return item
    const nested = findString(item, names)
    if (nested) return nested
  }
  return undefined
}

export async function POST(req: NextRequest) {
  const expected = (process.env.MANUS_WEBHOOK_SECRET || '').trim()
  const supplied = req.nextUrl.searchParams.get('secret') || req.headers.get('x-manus-webhook-secret') || ''
  if (expected && supplied !== expected) return NextResponse.json({ ok: false, error: 'غير مصرح' }, { status: 401 })

  try {
    const payload = await req.json().catch(() => ({}))
    const taskId = findString(payload, ['task_id', 'taskid'])
    if (!taskId) return NextResponse.json({ ok: true, ignored: true, reason: 'task_id مفقود' })

    const status = (findString(payload, ['status', 'agent_status']) || '').toLowerCase()
    const error = findString(payload, ['error_message', 'error'])
    const url = extractManusResultUrl(payload)
    const job = await prisma.aiJob.findFirst({
      where: { provider: 'manus', result: { contains: taskId }, status: 'processing' },
      orderBy: { createdAt: 'desc' },
    })
    if (!job) return NextResponse.json({ ok: true, ignored: true, reason: 'job غير موجود' })

    const failed = ['error', 'failed', 'failure', 'cancelled', 'canceled'].some((x) => status.includes(x))
    const complete = Boolean(url) || ['completed', 'succeeded', 'success'].some((x) => status.includes(x))
    if (failed) {
      await prisma.aiJob.update({
        where: { id: job.id },
        data: { status: 'failed', errorMsg: (error || 'فشلت مهمة Manus').slice(0, 500), finishedAt: new Date() },
      })
      return NextResponse.json({ ok: true, jobId: job.id, status: 'failed' })
    }
    if (!complete) return NextResponse.json({ ok: true, jobId: job.id, status: 'processing' })

    const cost = 100
    const creditsLeft = await deductCredits(job.userId, cost, `إنتاج ${job.type} عبر Manus`)
    await prisma.aiJob.update({
      where: { id: job.id },
      data: {
        status: 'completed',
        result: url || 'اكتملت مهمة Manus، راجع رابط المهمة للحصول على النتيجة.',
        resultUrl: url || null,
        creditsUsed: cost,
        finishedAt: new Date(),
      },
    })
    if (url) {
      await prisma.generatedFile.create({
        data: { userId: job.userId, jobId: job.id, type: job.type === 'video' ? 'video' : 'audio', url, fileName: `${job.type}-${job.id}` },
      }).catch(() => undefined)
    }
    return NextResponse.json({ ok: true, jobId: job.id, status: 'completed', url, creditsLeft })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Webhook error' }, { status: 500 })
  }
}
