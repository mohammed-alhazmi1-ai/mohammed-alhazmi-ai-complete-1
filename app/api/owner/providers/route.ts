import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isOwnerEmail } from '@/lib/credits';

async function assertOwner(email?: string) {
  if (!email || !(await isOwnerEmail(email))) {
    throw new Error('FORBIDDEN');
  }
}

/** قائمة المزودين مع المفاتيح والنماذج */
export async function GET() {
  try {
    const providers = await prisma.aiProvider.findMany({
      orderBy: { priority: 'asc' },
      include: {
        keys: {
          select: {
            id: true,
            keyName: true,
            isActive: true,
            lastTestAt: true,
            lastTestOk: true,
            // لا نرجع المفتاح كاملاً
            keyValue: false,
          },
        },
        models: true,
      },
    });

    // إخفاء قيمة المفتاح — نرسل فقط هل موجود
    const safe = await prisma.aiProvider.findMany({
      orderBy: { priority: 'asc' },
      include: { keys: true, models: true },
    });

    const result = safe.map((p) => ({
      ...p,
      keys: p.keys.map((k) => ({
        id: k.id,
        keyName: k.keyName,
        isActive: k.isActive,
        lastTestAt: k.lastTestAt,
        lastTestOk: k.lastTestOk,
        hasValue: !!(k.keyValue && k.keyValue.length > 0),
        masked: k.keyValue ? `${k.keyValue.slice(0, 4)}••••${k.keyValue.slice(-4)}` : '',
      })),
    }));

    return NextResponse.json({ providers: result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, providers: [] }, { status: 500 });
  }
}

/** إضافة / تحديث مزود */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await assertOwner(body.email);

    if (body.action === 'seed') {
      // بذرة مزودين افتراضيين
      const defaults = [
        { slug: 'gemini', name: 'Google Gemini', category: 'text', priority: 10, defaultModel: 'gemini-1.5-flash', costPerUse: 5 },
        { slug: 'openai', name: 'OpenAI', category: 'text', priority: 20, defaultModel: 'gpt-4o-mini', costPerUse: 8 },
        { slug: 'anthropic', name: 'Anthropic Claude', category: 'text', priority: 30, defaultModel: 'claude-3-5-sonnet', costPerUse: 10 },
        { slug: 'stability', name: 'Stability AI', category: 'image', priority: 10, defaultModel: 'stable-diffusion', costPerUse: 15 },
        { slug: 'replicate', name: 'Replicate', category: 'image', priority: 20, defaultModel: 'flux', costPerUse: 12 },
      ];
      for (const d of defaults) {
        await prisma.aiProvider.upsert({
          where: { slug: d.slug },
          create: { ...d, isEnabled: d.slug === 'gemini' },
          update: {},
        });
      }
      // تكاليف الخدمات
      const costs = [
        { serviceKey: 'text_generate', displayName: 'توليد نصوص', creditsCost: 5 },
        { serviceKey: 'image_generate', displayName: 'توليد صور', creditsCost: 15 },
        { serviceKey: 'video_generate', displayName: 'توليد فيديو', creditsCost: 50 },
        { serviceKey: 'audio_generate', displayName: 'توليد صوت', creditsCost: 20 },
      ];
      for (const c of costs) {
        await prisma.serviceCost.upsert({
          where: { serviceKey: c.serviceKey },
          create: c,
          update: {},
        });
      }
      return NextResponse.json({ success: true, message: 'تم إنشاء المزودين الافتراضيين' });
    }

    if (body.action === 'create' || body.action === 'update') {
      const data = {
        name: body.name,
        slug: body.slug,
        category: body.category || 'text',
        isEnabled: !!body.isEnabled,
        priority: Number(body.priority) || 100,
        defaultModel: body.defaultModel || null,
        costPerUse: Number(body.costPerUse) || 0,
        baseUrl: body.baseUrl || null,
        notes: body.notes || null,
      };

      let provider;
      if (body.id) {
        provider = await prisma.aiProvider.update({ where: { id: body.id }, data });
      } else {
        provider = await prisma.aiProvider.create({ data });
      }
      return NextResponse.json({ success: true, provider });
    }

    if (body.action === 'toggle') {
      const p = await prisma.aiProvider.update({
        where: { id: body.id },
        data: { isEnabled: !!body.isEnabled },
      });
      return NextResponse.json({ success: true, provider: p });
    }

    if (body.action === 'set-key') {
      const providerId = body.providerId;
      const keyName = body.keyName || 'API_KEY';
      const keyValue = body.keyValue || '';
      // تحديث أو إنشاء
      const existing = await prisma.providerKey.findFirst({
        where: { providerId, keyName },
      });
      let key;
      if (existing) {
        key = await prisma.providerKey.update({
          where: { id: existing.id },
          data: { keyValue, isActive: true },
        });
      } else {
        key = await prisma.providerKey.create({
          data: { providerId, keyName, keyValue, isActive: true },
        });
      }
      return NextResponse.json({ success: true, keyId: key.id });
    }

    if (body.action === 'test') {
      const provider = await prisma.aiProvider.findUnique({
        where: { id: body.providerId },
        include: { keys: { where: { isActive: true } } },
      });
      if (!provider) return NextResponse.json({ error: 'مزود غير موجود' }, { status: 404 });

      let apiKey = provider.keys.find((k) => k.keyValue)?.keyValue || '';
      if (!apiKey) {
        const envMap: Record<string, string | undefined> = {
          gemini: process.env.GEMINI_API_KEY,
          openai: process.env.OPENAI_API_KEY,
          anthropic: process.env.ANTHROPIC_API_KEY,
        };
        apiKey = envMap[provider.slug] || '';
      }

      if (!apiKey) {
        return NextResponse.json({ success: false, error: 'لا يوجد مفتاح للاختبار' });
      }

      let ok = false;
      let message = '';
      try {
        if (provider.slug === 'gemini' || provider.slug === 'google') {
          const { GoogleGenerativeAI } = await import('@google/generative-ai');
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ model: provider.defaultModel || 'gemini-1.5-flash' });
          await model.generateContent('قل مرحبا في كلمة واحدة');
          ok = true;
          message = 'الاتصال ناجح';
        } else {
          // اختبار شكلي لباقي المزودين
          ok = apiKey.length > 10;
          message = ok ? 'المفتاح موجود (اختبار كامل بعد تفعيل SDK)' : 'مفتاح قصير جداً';
        }
      } catch (e: any) {
        ok = false;
        message = e.message || 'فشل الاختبار';
      }

      for (const k of provider.keys) {
        await prisma.providerKey.update({
          where: { id: k.id },
          data: { lastTestAt: new Date(), lastTestOk: ok },
        });
      }

      return NextResponse.json({ success: ok, message });
    }

    if (body.action === 'add-model') {
      const model = await prisma.aiModel.create({
        data: {
          providerId: body.providerId,
          modelId: body.modelId,
          displayName: body.displayName || body.modelId,
          category: body.category || 'text',
          isDefault: !!body.isDefault,
          isEnabled: true,
          costPerUse: Number(body.costPerUse) || 0,
        },
      });
      if (body.isDefault) {
        await prisma.aiProvider.update({
          where: { id: body.providerId },
          data: { defaultModel: body.modelId },
        });
      }
      return NextResponse.json({ success: true, model });
    }

    return NextResponse.json({ error: 'إجراء غير معروف' }, { status: 400 });
  } catch (e: any) {
    if (e.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }
    console.error(e);
    return NextResponse.json({ error: e.message || 'خطأ' }, { status: 500 });
  }
}
