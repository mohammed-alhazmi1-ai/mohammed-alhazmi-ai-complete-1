import { NextResponse } from 'next/server'
import { listEnabledPlansB } from '@/lib/platform-plans-b'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const plans = await listEnabledPlansB()
    return NextResponse.json({ ok: true, plans })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'خطأ', plans: [] }, { status: 500 })
  }
}
