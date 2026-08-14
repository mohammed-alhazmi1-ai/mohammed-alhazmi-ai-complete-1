import { NextRequest, NextResponse } from 'next/server'
import { ensureUserByEmail } from '@/lib/credits'
import { prisma } from '@/lib/prisma'

async function resolveEmail(req: NextRequest): Promise<string | null> {
  const q = req.nextUrl.searchParams.get('email')
  if (q) return q.trim().toLowerCase()

  const auth = req.headers.get('authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : ''
  const sbUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
  const sbKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim()
  if (token && sbUrl && sbKey) {
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const sb = createClient(sbUrl, sbKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
      const { data } = await sb.auth.getUser(token)
      if (data?.user?.email) return data.user.email.toLowerCase()
    } catch {
      /* */
    }
  }
  return null
}

export async function GET(req: NextRequest) {
  try {
    const email = await resolveEmail(req)
    if (!email) {
      return NextResponse.json({ jobs: [], note: 'سجّل الدخول لعرض السجل' })
    }
    const user = await ensureUserByEmail(email)
    const type = req.nextUrl.searchParams.get('type') || ''
    const jobs = await prisma.aiJob.findMany({
      where: {
        userId: user.id,
        ...(type ? { type: { contains: type } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 80,
    })
    return NextResponse.json({ jobs, email })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'خطأ', jobs: [] }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { executeServiceJob } = await import('@/lib/service-layer')
    const result = await executeServiceJob({
      email: body.email,
      prompt: body.prompt,
      serviceType: body.serviceType || body.type || 'chat',
      provider: body.provider,
      model: body.model,
      tone: body.tone,
      length: body.length,
    })
    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'خطأ في تنفيذ المهمة', jobId: e?.jobId, status: 'failed' },
      { status: e?.status || 500 }
    )
  }
}
