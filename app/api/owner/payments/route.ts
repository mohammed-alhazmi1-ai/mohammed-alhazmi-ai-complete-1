import { NextRequest, NextResponse } from 'next/server'
import { listPendingPayments, settlePayment } from '@/lib/owner-payments'

export const dynamic = 'force-dynamic'

function isOwnerEmail(email: string | null) {
  const raw = process.env.NEXT_PUBLIC_OWNER_EMAILS || process.env.OWNER_EMAILS || ''
  const list = raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
  if (!email) return false
  if (!list.length) return email.toLowerCase() === 'mohammedalhzmi1@gmail.com'
  return list.includes(email.toLowerCase())
}

export async function GET(req: NextRequest) {
  try {
    const email = req.headers.get('x-user-email') || req.nextUrl.searchParams.get('email')
    // حماية خفيفة — الواجهة ترسل بريد المالك؛ يُفضّل لاحقاً ربط جلسة Supabase
    if (email && !isOwnerEmail(email)) {
      return NextResponse.json({ ok: false, error: 'غير مصرح' }, { status: 403 })
    }
    const pending = await listPendingPayments(100)
    return NextResponse.json({ ok: true, pending, unit: 'REMO' })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'خطأ' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const email = String(body.email || req.headers.get('x-user-email') || '')
    if (email && !isOwnerEmail(email)) {
      return NextResponse.json({ ok: false, error: 'غير مصرح' }, { status: 403 })
    }

    const paymentId = String(body.paymentId || '')
    const action = body.action === 'reject' ? 'reject' : 'approve'
    const note = body.note ? String(body.note) : ''

    if (!paymentId) {
      return NextResponse.json({ ok: false, error: 'paymentId مطلوب' }, { status: 400 })
    }

    const result = await settlePayment(paymentId, action, note)
    if (!result.ok) {
      return NextResponse.json(result, { status: 400 })
    }
    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'خطأ' }, { status: 500 })
  }
}
