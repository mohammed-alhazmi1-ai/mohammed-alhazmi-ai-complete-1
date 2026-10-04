import { NextRequest, NextResponse } from 'next/server'
import { paypalConfigured, paypalRequest } from '@/lib/paypal'
import { prisma } from '@/lib/prisma'
import { settlePayment } from '@/lib/owner-payments'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    if (!paypalConfigured() || !process.env.PAYPAL_WEBHOOK_ID) return NextResponse.json({ ok: false, error: 'PayPal webhook غير مهيأ' }, { status: 503 })
    const event = await req.json()
    const headers = Object.fromEntries(req.headers.entries())
    const verification = await paypalRequest<any>('/v1/notifications/verify-webhook-signature', {
      method: 'POST',
      body: JSON.stringify({ auth_algo: headers['paypal-auth-algo'], cert_url: headers['paypal-cert-url'], transmission_id: headers['paypal-transmission-id'], transmission_sig: headers['paypal-transmission-sig'], transmission_time: headers['paypal-transmission-time'], webhook_id: process.env.PAYPAL_WEBHOOK_ID, webhook_event: event }),
    })
    if (verification.verification_status !== 'SUCCESS') return NextResponse.json({ ok: false, error: 'توقيع Webhook غير صالح' }, { status: 401 })
    if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      const orderId = event.resource?.supplementary_data?.related_ids?.order_id
      const payment = orderId ? await prisma.payment.findFirst({ where: { externalId: orderId, provider: 'paypal' } }) : null
      if (payment?.status === 'pending') await settlePayment(payment.id, 'approve', `PayPal webhook ${event.id || ''}`)
    }
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || 'Webhook error' }, { status: 500 })
  }
}
