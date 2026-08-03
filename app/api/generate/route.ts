import { NextRequest, NextResponse } from 'next/server'
import { generateRealtime, type GenType } from '@/lib/ai/realtime'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const COST: Record<string, number> = {
  chat: 1,
  code: 2,
  images: 20,
  video: 40,
  music: 25,
}

function mapType(raw: string): GenType {
  const t = (raw || 'chat').toLowerCase()
  if (t.includes('image') || t === 'img' || t === 'صور') return 'images'
  if (t.includes('video') || t === 'فيديو') return 'video'
  if (t.includes('music') || t.includes('audio') || t === 'موسيقى') return 'music'
  if (t.includes('code') || t === 'كود') return 'code'
  return 'chat'
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const prompt = String(body.prompt || body.text || body.message || '').trim()
    const type = mapType(String(body.type || body.service || 'chat'))
    const cost = COST[type] ?? 5

    if (!prompt) {
      return NextResponse.json({ ok: false, error: 'اكتب طلباً أولاً' }, { status: 400 })
    }

    // محاولة حفظ AiJob + خصم رصيد إن وُجد Prisma
    let jobId: string | null = null
    let creditsLeft: number | null = null
    let userId = body.userId as string | undefined

    try {
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()

      // إن وُجد توكن supabase لاحقاً يمكن ربط المستخدم؛ هنا نحفظ إن أُمرر userId
      if (userId) {
        const wallet = await prisma.wallet.findUnique({ where: { userId } }).catch(() => null)
        if (wallet) {
          const total =
            (wallet.paidCredits || 0) + (wallet.freeCredits || 0) + (wallet.referralCredits || 0)
          if (total < cost) {
            await prisma.$disconnect()
            return NextResponse.json(
              { ok: false, error: `رصيد غير كافٍ. المطلوب ${cost} REMO` },
              { status: 402 }
            )
          }
          // خصم من free أولاً ثم paid
          let left = cost
          let free = wallet.freeCredits || 0
          let paid = wallet.paidCredits || 0
          const takeFree = Math.min(free, left)
          free -= takeFree
          left -= takeFree
          paid -= left
          await prisma.wallet.update({
            where: { userId },
            data: { freeCredits: free, paidCredits: Math.max(0, paid) },
          })
          creditsLeft = free + Math.max(0, paid) + (wallet.referralCredits || 0)
          try {
            await prisma.walletTransaction.create({
              data: {
                userId,
                type: 'debit',
                amount: -cost,
                description: `توليد ${type}`,
              } as any,
            })
          } catch {
            /* حقل description قد يختلف */
          }
        }

        try {
          const job = await prisma.aiJob.create({
            data: {
              userId,
              type,
              status: 'processing',
              prompt,
              provider: 'pending',
              creditsUsed: cost,
            } as any,
          })
          jobId = job.id
        } catch {
          /* شكل AiJob قد يختلف */
        }
      }

      const result = await generateRealtime({ type, prompt, userId })

      if (jobId) {
        try {
          await prisma.aiJob.update({
            where: { id: jobId },
            data: {
              status: result.ok ? 'completed' : 'failed',
              provider: result.provider,
              result: result.text || result.error || '',
              resultUrl: result.imageUrl || null,
            } as any,
          })
        } catch {
          /* ignore */
        }
      }

      await prisma.$disconnect()

      return NextResponse.json({
        ok: result.ok,
        type,
        cost,
        jobId,
        creditsLeft,
        provider: result.provider,
        model: result.model,
        text: result.text,
        imageUrl: result.imageUrl,
        error: result.error,
        unit: 'REMO',
      })
    } catch {
      // بدون Prisma — توليد مباشر
      const result = await generateRealtime({ type, prompt })
      return NextResponse.json({
        ok: result.ok,
        type,
        cost,
        provider: result.provider,
        model: result.model,
        text: result.text,
        imageUrl: result.imageUrl,
        error: result.error,
        unit: 'REMO',
      })
    }
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'خطأ سيرفر' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: 'API التوليد الحقيقي',
    providers: ['openai', 'gemini'],
    types: ['chat', 'images', 'video', 'music', 'code'],
    unit: 'REMO',
  })
}
