import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';

export type GenerateInput = {
  prompt: string;
  systemPrompt?: string;
  category?: string;
  preferredProvider?: string;
  preferredModel?: string;
};

export type GenerateResult = {
  text: string;
  provider: string;
  model: string;
  latencyMs: number;
  usedFallback: boolean;
  attempts: { provider: string; ok: boolean; error?: string }[];
};

const GEMINI_MODELS = [
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-pro',
];

const OPENAI_MODELS = ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'];

export async function listAvailableProviders(category = 'text') {
  const list: {
    slug: string;
    name: string;
    category: string;
    defaultModel: string | null;
    models: string[];
    fromDb: boolean;
  }[] = [];

  try {
    const rows = await prisma.aiProvider.findMany({
      where: {
        isEnabled: true,
        OR: [{ category }, { category: 'text' }],
      },
      orderBy: { priority: 'asc' },
      include: { models: { where: { isEnabled: true } } },
    });
    for (const r of rows) {
      list.push({
        slug: r.slug,
        name: r.name,
        category: r.category,
        defaultModel: r.defaultModel,
        models: r.models.map((m) => m.modelId),
        fromDb: true,
      });
    }
  } catch {
    /* ignore */
  }

  // دائماً أضف من env إن لم يكونوا في القائمة
  if (process.env.GEMINI_API_KEY?.trim() && !list.find((p) => p.slug === 'gemini')) {
    list.push({
      slug: 'gemini',
      name: 'Google Gemini',
      category: 'text',
      defaultModel: 'gemini-2.0-flash',
      models: GEMINI_MODELS,
      fromDb: false,
    });
  }
  if (process.env.OPENAI_API_KEY?.trim() && !list.find((p) => p.slug === 'openai')) {
    list.push({
      slug: 'openai',
      name: 'OpenAI',
      category: 'text',
      defaultModel: 'gpt-4o-mini',
      models: OPENAI_MODELS,
      fromDb: false,
    });
  }

  return list;
}

async function resolveApiKey(slug: string, providerId?: string): Promise<string | null> {
  if (providerId) {
    try {
      const keys = await prisma.providerKey.findMany({
        where: { providerId, isActive: true },
        orderBy: { updatedAt: 'desc' },
      });
      for (const k of keys) {
        if (k.keyValue?.trim()) return k.keyValue.trim();
      }
    } catch {
      /* ignore */
    }
  }
  const envMap: Record<string, string | undefined> = {
    gemini: process.env.GEMINI_API_KEY,
    google: process.env.GEMINI_API_KEY,
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    claude: process.env.ANTHROPIC_API_KEY,
  };
  return envMap[slug.toLowerCase()]?.trim() || null;
}

async function callGemini(apiKey: string, prompt: string, preferredModel?: string) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const candidates = preferredModel
    ? [preferredModel, ...GEMINI_MODELS.filter((m) => m !== preferredModel)]
    : GEMINI_MODELS;
  let lastErr: any;
  for (const modelId of candidates) {
    try {
      const model = genAI.getGenerativeModel({ model: modelId });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (text?.trim()) return { text, modelId };
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error('فشل Gemini');
}

async function callOpenAI(apiKey: string, prompt: string, preferredModel?: string) {
  const raw = preferredModel || 'gpt-4o-mini';
  const x = raw.toLowerCase();
  let primary = 'gpt-4o-mini';
  if (x.includes('4o-mini') || x.includes('4o mini')) primary = 'gpt-4o-mini';
  else if (x.includes('4o')) primary = 'gpt-4o';
  else if (x.includes('3.5')) primary = 'gpt-3.5-turbo';
  else if (x.startsWith('gpt-')) primary = x;

  const candidates = [primary, ...OPENAI_MODELS.filter((m) => m !== primary)];
  let lastErr: any;

  for (const modelId of candidates) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelId,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || `OpenAI HTTP ${res.status}`);
      const text = data?.choices?.[0]?.message?.content;
      if (text?.trim()) return { text, modelId };
      throw new Error('رد فارغ من OpenAI');
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error('فشل OpenAI');
}

export async function generateWithFallback(input: GenerateInput): Promise<GenerateResult> {
  const category = input.category || 'text';
  const attempts: GenerateResult['attempts'] = [];
  const started = Date.now();
  const fullPrompt = input.systemPrompt || input.prompt;

  let providers: { id: string; slug: string; defaultModel: string | null }[] = [];
  try {
    providers = await prisma.aiProvider.findMany({
      where: { isEnabled: true, OR: [{ category }, { category: 'text' }] },
      orderBy: { priority: 'asc' },
      select: { id: true, slug: true, defaultModel: true },
    });
  } catch {
    providers = [];
  }

  if (providers.length === 0) {
    if (process.env.GEMINI_API_KEY?.trim()) {
      providers.push({ id: '', slug: 'gemini', defaultModel: 'gemini-2.0-flash' });
    }
    if (process.env.OPENAI_API_KEY?.trim()) {
      providers.push({ id: '', slug: 'openai', defaultModel: 'gpt-4o-mini' });
    }
  }

  if (input.preferredProvider) {
    const pref = input.preferredProvider.toLowerCase();
    providers = [
      ...providers.filter((p) => p.slug.toLowerCase() === pref),
      ...providers.filter((p) => p.slug.toLowerCase() !== pref),
    ];
  }

  if (providers.length === 0) {
    throw new Error('لا يوجد مزود AI. أضف GEMINI_API_KEY أو OPENAI_API_KEY في .env');
  }

  let lastError = '';
  for (const provider of providers) {
    const apiKey = await resolveApiKey(provider.slug, provider.id || undefined);
    if (!apiKey) {
      attempts.push({ provider: provider.slug, ok: false, error: 'لا يوجد مفتاح' });
      continue;
    }
    const modelHint = input.preferredModel || provider.defaultModel || undefined;
    try {
      const slug = provider.slug.toLowerCase();
      let text = '';
      let usedModel = modelHint || 'default';

      if (slug === 'gemini' || slug === 'google') {
        const r = await callGemini(apiKey, fullPrompt, modelHint);
        text = r.text;
        usedModel = r.modelId;
      } else if (slug === 'openai') {
        const r = await callOpenAI(apiKey, fullPrompt, modelHint);
        text = r.text;
        usedModel = r.modelId;
      } else {
        throw new Error(`المزود ${provider.slug} غير مُنفَّذ بعد`);
      }

      attempts.push({ provider: provider.slug, ok: true });
      return {
        text,
        provider: provider.slug,
        model: usedModel,
        latencyMs: Date.now() - started,
        usedFallback: attempts.some((a) => !a.ok),
        attempts,
      };
    } catch (e: any) {
      lastError = e?.message || String(e);
      attempts.push({ provider: provider.slug, ok: false, error: lastError });
    }
  }

  throw new Error(
    `فشل التوليد. ${lastError}. المحاولات: ${attempts
      .map((a) => `${a.provider}:${a.ok ? 'OK' : a.error}`)
      .join(' | ')}`
  );
}

/** روبوت توجيه: يفهم نية المستخدم ويختار الفئة/المزود */
export function routeIntent(message: string): {
  category: string;
  servicePath: string;
  replyAr: string;
} {
  const m = message.toLowerCase();
  if (/صورة|صور|image|logo|خلفية|رسم/.test(m)) {
    return {
      category: 'image',
      servicePath: '/dashboard/images',
      replyAr: 'حسناً، سأوجّهك لقسم الصور. يمكنك اختيار مزود الصور وكتابة وصف الصورة.',
    };
  }
  if (/فيديو|video|reel|إعلان مرئي/.test(m)) {
    return {
      category: 'video',
      servicePath: '/dashboard/video',
      replyAr: 'حسناً، سأوجّهك لقسم الفيديو لإنشاء أو تعديل فيديو.',
    };
  }
  if (/أغنية|شيلة|زفة|موسيقى|صوت|music|song/.test(m)) {
    return {
      category: 'audio',
      servicePath: '/dashboard/music',
      replyAr: 'حسناً، سأوجّهك لقسم الموسيقى لتوليد أغنية أو شيلة أو زفة.',
    };
  }
  if (/كود|برمج|موقع|api|react|javascript|python|html/.test(m)) {
    return {
      category: 'code',
      servicePath: '/dashboard/code',
      replyAr: 'حسناً، سأوجّهك لقسم البرمجة لكتابة أو إصلاح الأكواد.',
    };
  }
  return {
    category: 'text',
    servicePath: '/dashboard/chat',
    replyAr: 'سأعالـج طلبك عبر الدردشة الذكية. يمكنك أيضاً اختيار المزود (Gemini أو OpenAI).',
  };
}
