import { NextRequest, NextResponse } from 'next/server'
import { generateRealtime, type GenType } from '@/lib/ai/realtime'
import { deductCredits, ensureUserByEmail, totalCredits } from '@/lib/credits'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const COST: Record<string, number> = {
  chat: 5,
  code: 10,
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

/** استخراج المستخدم من الجلسة / البريد / userId */
async function resolveUserId(req: NextRequest, body: any): Promise<string | null> {
  // 1) صريح من الواجهة
  if (body.userId) return String(body.userId)
  if (body.email) {
    try {
      const u = await ensureUserByEmail(String(body.email).trim().toLowerCase())
      return u.id
    } catch {
      /* */
    }
  }

  // 2) Supabase access token
  const auth = req.headers.get('authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : ''
  const sbUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
  const sbKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim()

  if (token && sbUrl && sbKey) {
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const sb = createClient(sbUrl, sbKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false, autoRefreshToken: false },
      })
      const { data } = await sb.auth.getUser(token)
      const email = data?.user?.email
      if (email) {
        const u = await ensureUserByEmail(email.toLowerCase(), {
          firstName: data.user.user_metadata?.first_name,
          lastName: data.user.user_metadata?.last_name,
          username: data.user.user_metadata?.username,
        })
        return u.id
      }
    } catch {
      /* */
    }
  }

  // 3) كوكي شائع إن وُجد
  const cookieEmail =
    req.cookies.get('user_email')?.value ||
    req.cookies.get('email')?.value ||
    ''
  if (cookieEmail) {
    try {
      const u = await ensureUserByEmail(cookieEmail.trim().toLowerCase())
      return u.id
    } catch {
      /* */
    }
  }

  return null
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const prompt = String(
      body.prompt || body.text || body.message || body.content || ''
    ).trim()
    const type = mapType(String(body.type || body.service || body.kind || 'chat'))
    const provider = pickProvider(body)
    const cost = COST[type] ?? 5

    if (!prompt) {
      return NextResponse.json(
        { ok: false, success: false, error: 'الطلب فارغ' },
        { status: 400 }
      )
    }

    const userId = await resolveUserId(req, body)

    // التحقق من الرصيد قبل التوليد (إن وُجد مستخدم)
    if (userId) {
      try {
        const wallet = await prisma.wallet.findUnique({ where: { userId } })
        const bal = totalCredits(wallet)
        if (bal < cost) {
          return NextResponse.json(
            {
              ok: false,
              success: false,
              error: `رصيد غير كافٍ. المطلوب ${cost} REMO — رصيدك ${bal}`,
              creditsLeft: bal,
              cost,
            },
            { status: 402 }
          )
        }
      } catch {
        /* أكمل التوليد إن فشل قراءة المحفظة */
      }
    }

    let jobId: string | undefined
    if (userId) {
      try {
        const job = await prisma.aiJob.create({
          data: {
            userId,
            type,
            status: 'processing',
            prompt: prompt.slice(0, 2000),
            provider: provider === 'auto' ? 'pending' : provider,
            creditsUsed: 0,
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
      userId: userId || undefined,
      provider,
      model: body.model ? String(body.model) : undefined,
    })

    let creditsLeft: number | undefined

    // خصم الرصيد فقط عند نجاح التوليد
    if (userId && result.ok) {
      try {
        creditsLeft = await deductCredits(
          userId,
          cost,
          `توليد ${type} عبر ${result.provider || provider}`
        )
      } catch (e: any) {
        // التوليد نجح لكن الخصم فشل — نبلغ دون إخفاء النتيجة
        console.error('deduct failed', e?.message)
      }
    }

    if (jobId) {
      try {
        await prisma.aiJob.update({
          where: { id: jobId },
          data: {
            status: result.ok ? 'completed' : 'failed',
            provider: result.provider,
            result: (result.text || result.error || '').slice(0, 5000),
            resultUrl: result.imageUrl || null,
            creditsUsed: result.ok ? cost : 0,
          } as any,
        })
      } catch {
        /* */
      }
    }

    if (!result.ok) {
      return NextResponse.json({
        ok: false,
        success: false,
        error: result.error || 'فشل التوليد',
        provider: result.provider,
        model: result.model,
        text: result.text,
        type,
        cost,
        creditsLeft,
        userBound: Boolean(userId),
      })
    }

    return NextResponse.json({
      ok: true,
      success: true,
      text: result.text,
      result: result.text,
      imageUrl: result.imageUrl,
      provider: result.provider,
      model: result.model,
      type,
      cost: userId ? cost : 0,
      creditsLeft,
      userBound: Boolean(userId),
      jobId,
    })
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
    types: Object.keys(COST),
    costs: COST,
  })
}
