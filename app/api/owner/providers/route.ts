import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

type ProviderTestResult = { success: boolean; message: string }

function normalizeTestResult(result: unknown): ProviderTestResult {
  if (result && typeof result === 'object' && !(result instanceof Response) && 'success' in result) {
    const r = result as { success?: boolean; message?: string; ok?: boolean }
    return {
      success: Boolean(r.success ?? r.ok),
      message: String(r.message ?? (r.success || r.ok ? 'OK' : 'فشل')),
    }
  }
  if (result instanceof Response) {
    return { success: result.ok, message: `HTTP ${result.status}` }
  }
  return { success: false, message: 'نتيجة اختبار غير معروفة' }
}

type SeedProvider = {
  slug: string
  name: string
  category: string
  priority: number
  defaultModel: string
  costPerUse: number
  envKey: string
}

const SEED: SeedProvider[] = [
  {
    slug: 'pollinations',
    name: 'Pollinations',
    category: 'image,video,music,text',
    priority: 1,
    defaultModel: 'flux',
    costPerUse: 10,
    envKey: 'POLLINATIONS_API_KEY',
  },

  {
    slug: 'gemini',
    name: 'Google Gemini',
    category: 'text',
    priority: 10,
    defaultModel: 'gemini-2.0-flash',
    costPerUse: 3,
    envKey: 'GEMINI_API_KEY',
  },
  {
    slug: 'replicate',
    name: 'Replicate',
    category: 'image',
    priority: 20,
    defaultModel: 'black-forest-labs/flux-schnell',
    costPerUse: 15,
    envKey: 'REPLICATE_API_TOKEN',
  },
  {
    slug: 'huggingface',
    name: 'Hugging Face',
    category: 'text',
    priority: 30,
    defaultModel: 'mistralai/Mistral-7B-Instruct-v0.2',
    costPerUse: 4,
    envKey: 'HUGGINGFACE_API_KEY',
  },
]

function envVal(name: string) {
  if (name === 'POLLINATIONS_API_KEY') {
    return (
      process.env.POLLINATIONS_API_KEY ||
      process.env.POLLINATIONS_KEY ||
      ''
    ).trim()
  }
  if (name === 'REPLICATE_API_TOKEN') {
    return (process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_API_KEY || '').trim()
  }
  if (name === 'HUGGINGFACE_API_KEY') {
    return (
      process.env.HUGGINGFACE_API_KEY ||
      process.env.HF_TOKEN ||
      process.env.HUGGING_FACE_HUB_TOKEN ||
      ''
    ).trim()
  }
  if (name === 'GEMINI_API_KEY') {
    return (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim()
  }
  return (process.env[name] || '').trim()
}

function mask(v: string) {
  if (!v) return ''
  if (v.length <= 8) return '****'
  return v.slice(0, 3) + '****' + v.slice(-4)
}

async function getPrisma() {
  const { PrismaClient } = await import('@prisma/client')
  return new PrismaClient()
}

function fromEnvFallback() {
  return SEED.map((s) => {
    const val = envVal(s.envKey)
    return {
      id: s.slug,
      slug: s.slug,
      name: s.name,
      category: s.category,
      isEnabled: Boolean(val),
      priority: s.priority,
      defaultModel: s.defaultModel,
      costPerUse: s.costPerUse,
      keys: [
        {
          id: s.slug + '-key',
          keyName: s.envKey,
          hasValue: Boolean(val),
          masked: mask(val),
          lastTestOk: false,
        },
      ],
      models: [
        {
          id: s.slug + '-m1',
          modelId: s.defaultModel,
          displayName: s.defaultModel,
          isDefault: true,
        },
      ],
    }
  })
}

async function listFromDb(prisma: any) {
  const rows = await prisma.aiProvider.findMany({
    include: { keys: true, models: true },
    orderBy: { priority: 'asc' },
  })
  return rows.map((p: any) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    isEnabled: p.isEnabled,
    priority: p.priority,
    defaultModel: p.defaultModel,
    costPerUse: p.costPerUse,
    keys: (p.keys || []).map((k: any) => ({
      id: k.id,
      keyName: k.keyName,
      hasValue: Boolean(k.keyValue),
      masked: mask(k.keyValue || ''),
      lastTestOk: Boolean(k?.lastTestOk),
    })),
    models: (p.models || []).map((m: any) => ({
      id: m.id,
      modelId: m.modelId,
      displayName: m.displayName,
      isDefault: m.isDefault,
    })),
  }))
}

async function testProvider(slug: string, key: string): Promise<ProviderTestResult> {
  if (!key) return { success: false, message: 'لا يوجد مفتاح' }
  try {
    
    if (slug === 'pollinations') {
      const q = encodeURIComponent('test logo')
      const url = `https://gen.pollinations.ai/image/\( {q}?model=flux&width=512&height=512&key= \){encodeURIComponent(key)}`
      const res = await fetch(url, { headers: { Authorization: `Bearer ${key}` } })
      if (res.ok) return { success: true, message: 'Pollinations متصل' }
      return { success: false, message: `Pollinations HTTP ${res.status}` }
    }

    if (slug === 'gemini') {
      const keyTrim = key.trim()
      const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-flash-latest']
      let lastMsg = 'فشل Gemini'
      for (const model of models) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': keyTrim,
          },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: 'ping' }] }],
          }),
        })
        if (res.ok) {
          return { success: true, message: `Gemini متصل (${model})` }
        }
        const data = await res.json().catch(() => ({}))
        lastMsg = data?.error?.message || `Gemini فشل HTTP ${res.status}`
        if (res.status === 404) continue
        // مفتاح غير صالح — لا داعي لتجربة كل النماذج
        if (res.status === 400 && /api key/i.test(lastMsg)) {
          return { success: false, message: lastMsg }
        }
      }
      return { success: false, message: lastMsg }
    }
    if (slug === 'replicate') {
      const res = await fetch('https://api.replicate.com/v1/account', {
        headers: { Authorization: `Token ${key}` },
      })
      return {
        success: res.ok,
        message: res.ok ? 'Replicate متصل' : `Replicate فشل HTTP ${res.status}`,
      }
    }
    if (slug === 'huggingface') {
      const res = await fetch('https://huggingface.co/api/whoami-v2', {
        headers: { Authorization: `Bearer ${key}` },
      })
      return {
        success: res.ok,
        message: res.ok ? 'Hugging Face متصل' : `HF فشل HTTP ${res.status}`,
      }
    }
    return { success: true, message: 'تم (بدون اختبار مخصص)' }
  } catch (e: any) {
    return { success: false, message: e?.message || 'فشل الاتصال' }
  }
}

export async function GET() {
  try {
    const prisma = await getPrisma()
    try {
      const providers = await listFromDb(prisma)
      await prisma.$disconnect()
      if (providers.length) {
        return NextResponse.json({ ok: true, providers, source: 'db' })
      }
    } catch {
      try {
        await prisma.$disconnect()
      } catch {
        /* */
      }
    }
    return NextResponse.json({
      ok: true,
      providers: fromEnvFallback(),
      source: 'env',
      note: 'من البيئة. استخدم seed لحفظ المزودين في القاعدة.',
    })
  } catch (e: any) {
    return NextResponse.json({
      ok: true,
      providers: fromEnvFallback(),
      source: 'env',
      note: e?.message,
    })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const action = String(body.action || '')
    const prisma = await getPrisma()

    
    if (action === 'disable-replicate') {
      try {
        const prisma = await getPrisma()
        await prisma.aiProvider.updateMany({
          where: { slug: 'replicate' },
          data: { isEnabled: false },
        })
      } catch (e: any) {
        try {
          const prisma = await getPrisma()
          await prisma.aiProvider.updateMany({
            where: { slug: 'replicate' },
            data: { enabled: false } as any,
          })
        } catch {
          /* schema may use different field */
        }
      }
      return NextResponse.json({ ok: true, message: 'Replicate متوقف' })
    }

    if (action === 'ensure-pollinations') {
      const prisma = await getPrisma()
      const s = SEED.find((x) => x.slug === 'pollinations')!
      try {
        await prisma.aiProvider.upsert({
          where: { slug: 'pollinations' },
          create: {
            slug: 'pollinations',
            name: s.name,
            category: s.category,
            priority: s.priority,
            isEnabled: true,
          } as any,
          update: {
            name: s.name,
            category: s.category,
            priority: s.priority,
            isEnabled: true,
          } as any,
        })
      } catch (e: any) {
        return NextResponse.json({ ok: false, error: e?.message }, { status: 500 })
      }
      return NextResponse.json({ ok: true, message: 'Pollinations مفعّل في القائمة' })
    }

    if (action === 'seed') {
      for (const s of SEED) {
        const isActive = s.slug !== 'replicate'
        const existing = await prisma.aiProvider
          .findFirst({ where: { slug: s.slug } })
          .catch(() => null)
        let providerId = existing?.id as string | undefined
        if (!existing) {
          const created = await prisma.aiProvider.create({
            data: {
              slug: s.slug,
              name: s.name,
              category: s.category,
              isEnabled: Boolean(envVal(s.envKey)),
              priority: s.priority,
              defaultModel: s.defaultModel,
              costPerUse: s.costPerUse,
            },
          })
          providerId = created.id
          await prisma.aiModel.create({
            data: {
              providerId: created.id,
              modelId: s.defaultModel,
              displayName: s.defaultModel,
              isDefault: true,
            } as any,
          })
        }
        const val = envVal(s.envKey)
        if (val && providerId) {
          const keyRow = await prisma.providerKey.findFirst({
            where: { providerId, keyName: s.envKey },
          })
          if (keyRow) {
            await prisma.providerKey.update({
              where: { id: keyRow.id },
              data: { keyValue: val, isEnabled: true },
            })
          } else {
            await prisma.providerKey.create({
              data: {
                providerId,
                keyName: s.envKey,
                keyValue: val,
                isEnabled: true,
              },
            })
          }
        }
      }
      const providers = await listFromDb(prisma)
      await prisma.$disconnect()
      return NextResponse.json({
        ok: true,
        message: 'تم إنشاء/تحديث المزودين (Pollinations مفعّل، Replicate متوقف، Gemini, Hugging Face)',
        providers,
      })
    }

    if (action === 'toggle') {
      await prisma.aiProvider.update({
        where: { id: String(body.id) },
        data: { isEnabled: Boolean(body.isEnabled) },
      })
      const providers = await listFromDb(prisma)
      await prisma.$disconnect()
      return NextResponse.json({ ok: true, providers })
    }

    if (action === 'create') {
      const slug = String(body.slug || '').toLowerCase().trim()
      const created = await prisma.aiProvider.create({
        data: {
          slug,
          name: String(body.name || slug),
          category: String(body.category || 'text'),
          isEnabled: Boolean(body.isEnabled),
          priority: Number(body.priority) || 50,
          defaultModel: body.defaultModel || null,
          costPerUse: Number(body.costPerUse) || 5,
        },
      })
      if (body.defaultModel) {
        await prisma.aiModel.create({
          data: {
            providerId: created.id,
            modelId: String(body.defaultModel),
            displayName: String(body.defaultModel),
            isDefault: true,
          } as any,
        })
      }
      const providers = await listFromDb(prisma)
      await prisma.$disconnect()
      return NextResponse.json({ ok: true, providers })
    }


    if (action === 'update') {
      const id = String(body.id || body.providerId || '')
      if (!id) {
        await prisma.$disconnect()
        return NextResponse.json({ ok: false, error: 'معرف المزود مطلوب' }, { status: 400 })
      }
      const data: any = {}
      if (body.name != null) data.name = String(body.name)
      if (body.category != null) data.category = String(body.category)
      if (body.priority != null) data.priority = Number(body.priority)
      if (body.costPerUse != null) data.costPerUse = Number(body.costPerUse)
      if (body.defaultModel != null) data.defaultModel = String(body.defaultModel) || null
      if (body.isEnabled != null) data.isEnabled = Boolean(body.isEnabled)
      if (body.slug != null) {
        const slug = String(body.slug).toLowerCase().trim()
        if (slug) data.slug = slug
      }
      if (!Object.keys(data).length) {
        await prisma.$disconnect()
        return NextResponse.json({ ok: false, error: 'لا توجد حقول للتحديث' }, { status: 400 })
      }
      try {
        await prisma.aiProvider.update({ where: { id }, data })
      } catch (e: any) {
        await prisma.$disconnect()
        return NextResponse.json(
          { ok: false, error: e?.message || 'تعذر التحديث (قد يكون المزود من البيئة فقط — نفّذ seed أولاً)' },
          { status: 400 }
        )
      }
      // تحديث النموذج الافتراضي في AiModel إن وُجد
      if (data.defaultModel) {
        try {
          const models = await prisma.aiModel.findMany({ where: { providerId: id } })
          if (models.length) {
            for (const m of models) {
              await prisma.aiModel.update({
                where: { id: m.id },
                data: {
                  isDefault: m.modelId === data.defaultModel,
                  ...(m.modelId === data.defaultModel
                    ? { displayName: data.defaultModel }
                    : {}),
                } as any,
              })
            }
            const has = models.some((m: any) => m.modelId === data.defaultModel)
            if (!has) {
              await prisma.aiModel.create({
                data: {
                  providerId: id,
                  modelId: data.defaultModel,
                  displayName: data.defaultModel,
                  isDefault: true,
                } as any,
              })
            }
          } else {
            await prisma.aiModel.create({
              data: {
                providerId: id,
                modelId: data.defaultModel,
                displayName: data.defaultModel,
                isDefault: true,
              } as any,
            })
          }
        } catch {
          /* تجاهل اختلاف مخطط AiModel */
        }
      }
      const providers = await listFromDb(prisma)
      await prisma.$disconnect()
      return NextResponse.json({ ok: true, message: 'تم حفظ بيانات المزود', providers })
    }

    if (action === 'set-key') {
      const providerId = String(body.providerId)
      const keyName = String(body.keyName || 'API_KEY')
      const keyValue = String(body.keyValue || '')
      const existing = await prisma.providerKey.findFirst({
        where: { providerId, keyName },
      })
      if (existing) {
        await prisma.providerKey.update({
          where: { id: existing.id },
          data: { keyValue, isEnabled: true },
        })
      } else {
        await prisma.providerKey.create({
          data: { providerId, keyName, keyValue, isEnabled: true },
        })
      }
      await prisma.aiProvider.update({
        where: { id: providerId },
        data: { isEnabled: true },
      })
      const providers = await listFromDb(prisma)
      await prisma.$disconnect()
      return NextResponse.json({ ok: true, message: 'تم حفظ المفتاح', providers })
    }

    if (action === 'test') {
      const providerId = String(body.providerId)
      const p = await prisma.aiProvider.findUnique({
        where: { id: providerId },
        include: { keys: true },
      })
      if (!p) {
        await prisma.$disconnect()
        return NextResponse.json({ ok: false, error: 'مزود غير موجود' }, { status: 404 })
      }
      let key = p.keys?.[0]?.keyValue || ''
      if (!key) {
        const seed = SEED.find((s) => s.slug === p.slug)
        if (seed) key = envVal(seed.envKey)
      }
      const result = await testProvider(p.slug, key)
      const testOut = normalizeTestResult(result)
      if (p.keys?.[0]?.id) {
        await prisma.providerKey.update({
          where: { id: p.keys[0].id },
          data: {
            lastTestAt: new Date(),
            lastTestOk: testOut.success,
          },
        })
      }
      await prisma.$disconnect()
      return NextResponse.json({
        ok: true,
        success: testOut.success,
        message: testOut.message,
      })
    }

    await prisma.$disconnect()
    return NextResponse.json({ ok: false, error: 'إجراء غير معروف' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        error: e?.message || 'خطأ',
        hint: 'إن فشل Prisma: نفّذ db push ثم seed من لوحة المالك',
      },
      { status: 500 }
    )
  }
}
