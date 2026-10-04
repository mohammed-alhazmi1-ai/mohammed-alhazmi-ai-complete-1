import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma'
import { paypalConfigured, paypalRequest, paypalCancelUrl, paypalReturnUrl } from '@/lib/paypal'
import { REMO_PACKS, SUBSCRIPTION_PLANS } from '@/lib/plans-and-payments'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser()
    if (!user) return NextResponse.json({ ok: false, error: 'يجب تسجيل الدخول أولاً' }, { status: 401 })
    if (!paypalConfigured()) return NextResponse.json({ ok: false, error: 'PayPal غير مهيأ في المنصة بعد' }, { status: 503 })
    const body = await req.json().catch(() => ({}))
    const packId = body.packId ? String(body.packId) : null
    const planId = body.planId ? String(body.planId) : null
    if ((packId ? 1 : 0) + (planId ? 1 : 0) !== 1) return NextResponse.json({ ok: false, error: 'اختر خطة أو حزمة واحدة' }, { status: 400 })

    const pack = packId ? REMO_PACKS.find((p) => p.id === packId) : null
    const plan = planId ? SUBSCRIPTION_PLANS.find((p) => p.id === planId && p.priceUsd > 0) : null
    if (packId && !pack) return NextResponse.json({ ok: false, error: 'حزمة غير موجودة' }, { status: 400 })
    if (planId && !plan) return NextResponse.json({ ok: false, error: 'خطة غير موجودة أو مجانية' }, { status: 400 })

    const amount = pack ? pack.priceUsd : plan!.priceUsd
    const credits = pack ? pack.remo + (pack.bonus || 0) : plan!.monthlyRemo
    const description = pack ? `REMO ${pack.name}` : `اشتراك ${plan!.nameEn}`
    const payment = await prisma.payment.create({ data: {
      userId: user.id, provider: 'paypal', amount, currency: 'USD', credits,
      planId: planId || packId, status: 'pending', description,
      metadata: JSON.stringify({ packId, planId, source: 'paypal_rest' }),
    } })

    try {
      const order = await paypalRequest<any>('/v2/checkout/orders', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [{ reference_id: payment.id, custom_id: payment.id, description: description.slice(0, 127), amount: { currency_code: 'USD', value: amount.toFixed(2) } }],
          application_context: { brand_name: 'محمد الحزمي AI', user_action: 'PAY_NOW', return_url: paypalReturnUrl(), cancel_url: paypalCancelUrl() },
        }),
      })
      await prisma.payment.update({ where: { id: payment.id }, data: { externalId: order.id } })
      const approvalUrl = order.links?.find((l: any) => l.rel === 'approve')?.href
      if (!approvalUrl) throw new Error('PayPal لم يرجع رابط الدفع')
      return NextResponse.json({ ok: true, paymentId: payment.id, orderId: order.id, approvalUrl, amount, credits, description })
    } catch (error: any) {
      await prisma.payment.update({ where: { id: payment.id }, data: { status: 'failed', metadata: JSON.stringify({ packId, planId, error: error?.message || 'PayPal error' }) } }).catch(() => undefined)
      return NextResponse.json({ ok: false, error: error?.message || 'تعذر إنشاء طلب PayPal' }, { status: 502 })
    }
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || 'خطأ في PayPal' }, { status: 500 })
  }
}
