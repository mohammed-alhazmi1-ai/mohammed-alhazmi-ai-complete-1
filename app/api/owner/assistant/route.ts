import { NextRequest, NextResponse } from 'next/server'
import {
  getAssistantConfig,
  saveAssistantConfig,
  type KnowledgeItem,
} from '@/lib/platform-assistant'

export const dynamic = 'force-dynamic'

export async function GET() {
  const config = await getAssistantConfig()
  return NextResponse.json({ ok: true, config })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const action = String(body.action || 'save')

    if (action === 'save') {
      const config = await saveAssistantConfig({
        name: body.name,
        welcome: body.welcome,
        fallback: body.fallback,
        personality: body.personality,
        enabled: body.enabled,
        items: body.items,
      })
      return NextResponse.json({ ok: true, config, message: 'تم حفظ معرفة المساعد' })
    }

    if (action === 'upsert-item') {
      const cfg = await getAssistantConfig()
      const item = body.item as KnowledgeItem
      if (!item?.id || !item?.answer) {
        return NextResponse.json({ ok: false, error: 'id و answer مطلوبان' }, { status: 400 })
      }
      const items = [...cfg.items]
      const idx = items.findIndex((x) => x.id === item.id)
      if (idx >= 0) items[idx] = { ...items[idx], ...item }
      else items.push({ ...item, enabled: item.enabled !== false, priority: item.priority || 50, keywords: item.keywords || [] })
      const config = await saveAssistantConfig({ items })
      return NextResponse.json({ ok: true, config, message: 'تم حفظ العنصر' })
    }

    if (action === 'delete-item') {
      const cfg = await getAssistantConfig()
      const id = String(body.id || '')
      const config = await saveAssistantConfig({
        items: cfg.items.filter((x) => x.id !== id),
      })
      return NextResponse.json({ ok: true, config, message: 'تم الحذف' })
    }

    if (action === 'retrain') {
      // «تدريب» = إعادة حفظ/تثبيت المعرفة (زر خاص للمالك)
      const cfg = await getAssistantConfig()
      const config = await saveAssistantConfig({
        items: cfg.items,
        welcome: cfg.welcome,
        fallback: cfg.fallback,
      })
      return NextResponse.json({
        ok: true,
        config,
        message: 'تم تحديث معرفة المساعد — جاهز للردود المفتوحة',
      })
    }

    return NextResponse.json({ ok: false, error: 'إجراء غير معروف' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 })
  }
}
