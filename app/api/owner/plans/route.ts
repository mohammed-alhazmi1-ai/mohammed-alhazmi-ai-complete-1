import { NextRequest, NextResponse } from 'next/server'
import {
  listPlansB,
  upsertPlanB,
  togglePlanB,
  deletePlanB,
} from '@/lib/platform-plans-b'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const plans = await listPlansB()
    return NextResponse.json({ ok: true, plans })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'خطأ' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const action = String(body.action || 'upsert')

    if (action === 'upsert') {
      if (!body.plan || !body.plan.name) {
        return NextResponse.json({ ok: false, error: 'اسم الخطة مطلوب' }, { status: 400 })
      }
      const plans = await upsertPlanB(body.plan)
      return NextResponse.json({ ok: true, plans })
    }

    if (action === 'toggle') {
      const id = String(body.id || body.plan?.id || '')
      if (!id) return NextResponse.json({ ok: false, error: 'id مطلوب' }, { status: 400 })
      const plans = await togglePlanB(id)
      return NextResponse.json({ ok: true, plans })
    }

    if (action === 'delete') {
      const id = String(body.id || body.plan?.id || '')
      if (!id) return NextResponse.json({ ok: false, error: 'id مطلوب' }, { status: 400 })
      const plans = await deletePlanB(id)
      return NextResponse.json({ ok: true, plans })
    }

    return NextResponse.json({ ok: false, error: 'إجراء غير معروف' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'خطأ' }, { status: 500 })
  }
}
