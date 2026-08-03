import { NextRequest, NextResponse } from 'next/server'
import { PAY_METHODS, REMO_PACKS, SUBSCRIPTION_PLANS } from '@/lib/plans-and-payments'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    ok: true,
    plans: SUBSCRIPTION_PLANS,
    packs: REMO_PACKS,
    methods: PAY_METHODS.filter((m) => m.enabled || m.id === 'paypal'),
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const methodId = String(body.methodId || 'manual')
    const packId = body.packId ? String(body.packId) : null
    const planId = body.planId ? String(body.planId) : null
    const userId = body.userId ? String(body.userId) : null
    const txRef = body.txRef ? String(body.txRef) : ''

    const method = PAY_METHODS.find((m) => m.id === methodId)
    if (!method) {
      return NextResponse.json({ ok: false, error: 'طريقة دفع غير معروفة' }, { status: 400 })
    }
    if (!method.enabled) {
      return NextResponse.json(
        { ok: false, error: `${method.name} غير مفعّل حالياً. اختر جيب أو بينانس أو يدوياً.` },
        { status: 400 }
      )
    }

    let amount = 0
    let credits = 0
    let description = ''
    let currency = method.currency

    if (packId) {
      const pack = REMO_PACKS.find((p) => p.id === packId)
      if (!pack) return NextResponse.json({ ok: false, error: 'حزمة غير موجودة' }, { status: 400 })
      amount = method.currency === 'YER' ? pack.priceYer || pack.priceUsd * 250 : pack.priceUsd
      credits = pack.remo + (pack.bonus || 0)
      description = `حزمة ${pack.name}`
    } else if (planId) {
      const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId)
      if (!plan) return NextResponse.json({ ok: false, error: 'خطة غير موجودة' }, { status: 400 })
      amount = method.currency === 'YER' ? plan.priceYer || plan.priceUsd * 250 : plan.priceUsd
      credits = plan.monthlyRemo
      description = `اشتراك ${plan.name}`
    } else {
      return NextResponse.json({ ok: false, error: 'اختر باقة أو حزمة' }, { status: 400 })
    }

    let paymentId: string | null = null
    try {
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()
      if (userId) {
        const row = await prisma.payment.create({
          data: {
            userId,
            provider: methodId,
            amount,
            currency: currency.slice(0, 8),
            credits,
            planId: planId || packId || undefined,
            status: 'pending',
            description: description + (txRef ? ` | ref:${txRef}` : ''),
            metadata: JSON.stringify({ methodId, packId, planId, txRef }),
          } as any,
        })
        paymentId = row.id
      }
      await prisma.$disconnect()
    } catch {
      paymentId = 'local-' + Date.now()
    }

    return NextResponse.json({
      ok: true,
      paymentId,
      status: 'pending',
      amount,
      currency,
      credits,
      unit: 'REMO',
      method: {
        id: method.id,
        name: method.name,
        instructions: method.instructions,
        addressOrAccount: method.addressOrAccount,
      },
      message: 'تم إنشاء الطلب. أتمم التحويل ثم انتظر تأكيد المالك.',
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'خطأ' }, { status: 500 })
  }
}
