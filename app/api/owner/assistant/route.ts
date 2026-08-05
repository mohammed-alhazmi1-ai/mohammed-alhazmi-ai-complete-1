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
        useSmallModel: body.useSmallModel,
        items: body.items,
      })
      return NextResponse.json({ ok: true, config, message: 'تم الحفظ' })
    }

    if (action === 'upsert-item') {
      const cfg = await getAssistantConfig()
      const item = body.item as KnowledgeItem
      if (!item?.id || !item?.answer) {
        return NextResponse.json({ ok: false, error: 'id و answer مطلوبان' }, { status: 400 })
      }
      const items = [...cfg.items]
      const idx = items.findIndex((x) => x.id === item.id)
      const row: KnowledgeItem = {
        id: item.id,
        title: item.title || item.id,
        keywords: item.keywords || [],
        answer: item.answer,
        links: item.links || [],
        imageUrl: item.imageUrl || '',
        videoUrl: item.videoUrl || '',
        enabled: item.enabled !== false,
        priority: item.priority || 50,
      }
      if (idx >= 0) items[idx] = { ...items[idx], ...row }
      else items.push(row)
      const config = await saveAssistantConfig({ items })
      return NextResponse.json({ ok: true, config, message: 'تم حفظ العنصر' })
    }

    if (action === 'delete-item') {
      const cfg = await getAssistantConfig()
      const config = await saveAssistantConfig({
        items: cfg.items.filter((x) => x.id !== String(body.id)),
      })
      return NextResponse.json({ ok: true, config, message: 'تم الحذف' })
    }

    if (action === 'retrain') {
      const cfg = await getAssistantConfig()
      const config = await saveAssistantConfig({ items: cfg.items })
      return NextResponse.json({
        ok: true,
        config,
        message: 'تم تحديث فهرس المعرفة وتحسين جاهزية البحث',
      })
    }

    return NextResponse.json({ ok: false, error: 'إجراء غير معروف' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 })
  }
}
