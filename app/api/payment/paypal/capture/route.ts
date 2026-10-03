import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma'
import { paypalConfigured, paypalRequest } from '@/lib/paypal'
import { settlePayment } from '@/lib/owner-payments'
import { SUBSCRIPTION_PLANS } from '@/lib/plans-and-payments'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser()
    if (!user) return NextResponse.json({ ok: false, error: 'يجب تسجيل الدخول أولاً' }, { status: 401 })
    if (!paypalConfigured()) return NextResponse.json({ ok: false, error: 'PayPal غير مهيأ في المنصة بعد' }, { status: 503 })
    const { orderId } = await req.json().catch(() => ({}))
    if (!orderId || typeof orderId !== 'string') return NextResponse.json({ ok: false, error: 'orderId مطلوب' }, { status: 400 })
    const payment = await prisma.payment.findFirst({ where: { externalId: orderId, provider: 'paypal' } })
    if (!payment || payment.userId !== user.id) return NextResponse.json({ ok: false, error: 'طلب PayPal غير موجود' }, { status: 404 })
    if (payment.status === 'completed') return NextResponse.json({ ok: true, status: 'completed', creditsAdded: payment.credits, duplicate: true })
    const capture = await paypalRequest<any>(`/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, { method: 'POST', headers: { Prefer: 'return=representation' }, body: '{}' })
    if (capture.status !== 'COMPLETED') return NextResponse.json({ ok: false, error: `حالة PayPal: ${capture.status || 'غير مكتملة'}` }, { status: 402 })

    const settled = await settlePayment(payment.id, 'approve', `PayPal order ${orderId}`)
    if (!settled.ok) return NextResponse.json(settled, { status: 500 })
    if (payment.planId && !payment.planId.startsWith('remo_')) {
      const plan = SUBSCRIPTION_PLANS.find((p) => p.id === payment.planId)
      if (plan) {
        const validUntil = new Date(); validUntil.setMonth(validUntil.getMonth() + 1)
        await prisma.subscription.upsert({ where: { userId: user.id }, create: { userId: user.id, planId: plan.id, planType: plan.nameEn, monthlyLimit: plan.chatLimit ?? 999999, chatLimit: plan.chatLimit, periodStart: new Date(), validUntil, status: 'active' }, update: { planId: plan.id, planType: plan.nameEn, monthlyLimit: plan.chatLimit ?? 999999, chatLimit: plan.chatLimit, periodStart: new Date(), validUntil, status: 'active' } })
      }
    }
    return NextResponse.json({ ok: true, status: 'completed', creditsAdded: settled.creditsAdded, walletTotal: settled.walletTotal, paymentId: payment.id })
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || 'تعذر تأكيد دفع PayPal' }, { status: 502 })
  }
}
