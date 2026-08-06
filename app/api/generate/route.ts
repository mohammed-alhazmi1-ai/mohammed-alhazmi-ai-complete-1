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

function pickProvider(body: any): string {
  const p = String(body.provider || body.selectedProvider || body.model || 'auto').toLowerCase()
  if (p.includes('openai') || p.includes('gpt')) return 'auto'
  if (p.includes('gemini') || p.includes('google')) return 'gemini'
  if (p.includes('hugging') || p === 'hf') return 'huggingface'
  if (p.includes('replicate')) return 'replicate'
  return 'auto'
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const prompt = String(
      body.prompt || body.text || body.message || body.content || ''
    ).trim()
    const type = mapType(String(body.type || body.service || body.kind || 'chat'))
    const provider = pickProvider(body)
    const userId = body.userId ? String(body.userId) : undefined
    const cost = COST[type] ?? 1

    if (!prompt) {
      return NextResponse.json({ ok: false, success: false, error: 'الطلب فارغ' }, { status: 400 })
    }

    let creditsLeft: number | undefined
    let jobId: string | undefined

    try {
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()

      if (userId) {
        const wallet = await prisma.wallet.findUnique({ where: { userId } }).catch(() => null)
        if (wallet) {
          const total =
            (wallet.paidCredits || 0) +
            (wallet.freeCredits || 0) +
            (wallet.referralCredits || 0)
          if (total < cost) {
            await prisma.$disconnect()
            return NextResponse.json(
              {
                ok: false,
                success: false,
                error: `رصيد غير كافٍ. المطلوب ${cost} REMO`,
              },
              { status: 402 }
            )
          }
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
        }

        try {
          const job = await prisma.aiJob.create({
            data: {
              userId,
              type,
              status: 'processing',
              prompt,
              provider: provider === 'auto' ? 'pending' : provider,
              creditsUsed: cost,
            } as any,
          })
          jobId = job.id
        } catch {
          /* */
        }
      }

      const result = await generateRealtime({
        type,
        prompt,
        userId,
        provider,
        model: body.model ? String(body.model) : undefined,
      })

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
          /* */
        }
      }

      await prisma.$disconnect()

      if (!result.ok) {
        return NextResponse.json(
          {
            ok: false,
            success: false,
            error: result.error || 'فشل التوليد',
            provider: result.provider,
            model: result.model,
            text: result.text,
            creditsLeft,
          },
          { status: 502 }
        )
      }

      return NextResponse.json({
        ok: true,
        success: true,
        result: result.text || result.imageUrl,
        text: result.text,
        imageUrl: result.imageUrl,
        provider: result.provider,
        model: result.model,
        type,
        cost,
        creditsLeft,
        jobId,
      })
    } catch (dbErr: any) {
      // بدون قاعدة بيانات — توليد فقط
      const result = await generateRealtime({ type, prompt, provider })
      if (!result.ok) {
        return NextResponse.json(
          {
            ok: false,
            success: false,
            error: result.error || dbErr?.message,
            provider: result.provider,
          },
          { status: 502 }
        )
      }
      return NextResponse.json({
        ok: true,
        success: true,
        result: result.text || result.imageUrl,
        text: result.text,
        imageUrl: result.imageUrl,
        provider: result.provider,
        model: result.model,
        type,
        cost,
      })
    }
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, success: false, error: e?.message || 'خطأ الخادم' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    providers: ['gemini', 'huggingface', 'replicate'],
    note: 'OpenAI معطّل. التوليد عبر Gemini / HF / Replicate',
    types: ['chat', 'code', 'images', 'video', 'music'],
  })
}
