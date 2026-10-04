import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/auth/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function cleanMessages(raw: unknown) {
  if (!Array.isArray(raw)) return []
  return raw.map((item: any) => ({
    id: String(item?.id || ''),
    role: ['user', 'assistant', 'system'].includes(String(item?.role)) ? String(item.role) : 'user',
    content: String(item?.content || '').slice(0, 20000),
    imageUrl: item?.imageUrl ? String(item.imageUrl).slice(0, 4000) : undefined,
    provider: item?.provider ? String(item.provider).slice(0, 100) : undefined,
    model: item?.model ? String(item.model).slice(0, 150) : undefined,
    cost: Number.isFinite(Number(item?.cost)) ? Number(item.cost) : undefined,
  })).filter((m) => m.id && m.content)
}

export async function GET(req: NextRequest) {
  const user = await getSessionUser().catch(() => null)
  if (!user?.id) return NextResponse.json({ ok: false, error: 'يجب تسجيل الدخول' }, { status: 401 })
  const service = req.nextUrl.searchParams.get('service') || undefined
  const conversations = await prisma.conversation.findMany({
    where: { userId: user.id, ...(service ? { service } : {}) },
    orderBy: { updatedAt: 'desc' },
    take: 40,
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  })
  return NextResponse.json({ ok: true, conversations })
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser().catch(() => null)
    if (!user?.id) return NextResponse.json({ ok: false, error: 'يجب تسجيل الدخول' }, { status: 401 })
    const body = await req.json().catch(() => ({}))
    const service = String(body.service || 'chat').slice(0, 40)
    const messages = cleanMessages(body.messages)
    if (!messages.length) return NextResponse.json({ ok: false, error: 'لا توجد رسائل للحفظ' }, { status: 400 })
    const title = String(body.title || messages.find((m) => m.role === 'user')?.content || 'محادثة جديدة').slice(0, 120)
    const requestedId = body.conversationId ? String(body.conversationId) : ''
    const existing = requestedId ? await prisma.conversation.findFirst({ where: { id: requestedId, userId: user.id } }) : null
    const conversation = existing
      ? await prisma.conversation.update({ where: { id: existing.id }, data: { title, service, messages: { deleteMany: {}, create: messages.map(({ id: _id, ...m }) => m) } }, include: { messages: true } })
      : await prisma.conversation.create({ data: { userId: user.id, service, title, messages: { create: messages.map(({ id: _id, ...m }) => m) } }, include: { messages: true } })
    return NextResponse.json({ ok: true, conversationId: conversation.id, conversation })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'تعذر حفظ المحادثة' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getSessionUser().catch(() => null)
  if (!user?.id) return NextResponse.json({ ok: false, error: 'يجب تسجيل الدخول' }, { status: 401 })
  const id = req.nextUrl.searchParams.get('id') || ''
  await prisma.conversation.deleteMany({ where: { id, userId: user.id } })
  return NextResponse.json({ ok: true })
}
