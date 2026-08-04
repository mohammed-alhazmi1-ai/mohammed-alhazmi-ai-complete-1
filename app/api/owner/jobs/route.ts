import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    const status = req.nextUrl.searchParams.get('status') || 'failed'

    const where: any =
      status === 'all'
        ? {}
        : status === 'problems'
          ? { OR: [{ status: 'failed' }, { status: 'error' }, { status: 'pending' }, { status: 'processing' }] }
          : { status }

    let jobs: any[] = []
    try {
      jobs = await prisma.aiJob.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 80,
      })
    } catch {
      try {
        jobs = await (prisma as any).job.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: 80,
        })
      } catch {
        jobs = []
      }
    }

    await prisma.$disconnect()

    const failed = jobs.filter((j) =>
      ['failed', 'error'].includes(String(j.status || '').toLowerCase())
    )
    const stuck = jobs.filter((j) =>
      ['pending', 'processing'].includes(String(j.status || '').toLowerCase())
    )

    return NextResponse.json({
      ok: true,
      jobs,
      summary: {
        total: jobs.length,
        failed: failed.length,
        stuck: stuck.length,
      },
    })
  } catch (e: any) {
    return NextResponse.json({
      ok: true,
      jobs: [],
      summary: { total: 0, failed: 0, stuck: 0 },
      note: e?.message || 'لا يوجد جدول طلبات بعد',
    })
  }
}
