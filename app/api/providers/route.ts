import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

type ProviderOpt = {
  slug: string
  name: string
  defaultModel: string | null
  models: string[]
}

function has(name: string) {
  const v = (process.env[name] || '').trim()
  return v.length > 0
}

export async function GET() {
  const providers: ProviderOpt[] = []

  // من قاعدة البيانات إن أمكن
  try {
    const { listAvailableProviders } = await import('@/lib/ai/router')
    const fromDb = await listAvailableProviders('text')
    if (Array.isArray(fromDb) && fromDb.length) {
      // ندمج مع المزودين من البيئة
      const map = new Map<string, ProviderOpt>()
      for (const p of fromDb) {
        map.set(p.slug, {
          slug: p.slug,
          name: p.name,
          defaultModel: p.defaultModel || null,
          models: p.models || [],
        })
      }
      // أضف من البيئة إن لم تكن في DB
      if (has('OPENAI_API_KEY') && !map.has('openai')) {
        map.set('openai', {
          slug: 'openai',
          name: 'OpenAI',
          defaultModel: 'gpt-4o-mini',
          models: ['gpt-4o-mini', 'gpt-4o'],
        })
      }
      if (has('GEMINI_API_KEY') && !map.has('gemini')) {
        map.set('gemini', {
          slug: 'gemini',
          name: 'Google Gemini',
          defaultModel: 'gemini-2.0-flash',
          models: ['gemini-2.0-flash'],
        })
      }
      if ((has('REPLICATE_API_TOKEN') || has('REPLICATE_API_KEY')) && !map.has('replicate')) {
        map.set('replicate', {
          slug: 'replicate',
          name: 'Replicate',
          defaultModel: 'black-forest-labs/flux-schnell',
          models: ['black-forest-labs/flux-schnell'],
        })
      }
      if (
        (has('HUGGINGFACE_API_KEY') || has('HF_TOKEN') || has('HUGGING_FACE_HUB_TOKEN')) &&
        !map.has('huggingface')
      ) {
        map.set('huggingface', {
          slug: 'huggingface',
          name: 'Hugging Face',
          defaultModel: 'mistralai/Mistral-7B-Instruct-v0.2',
          models: ['mistralai/Mistral-7B-Instruct-v0.2'],
        })
      }
      return NextResponse.json({ providers: Array.from(map.values()) })
    }
  } catch {
    /* استخدم البيئة فقط */
  }

  if (has('OPENAI_API_KEY')) {
    providers.push({
      slug: 'openai',
      name: 'OpenAI',
      defaultModel: 'gpt-4o-mini',
      models: ['gpt-4o-mini', 'gpt-4o'],
    })
  }
  if (has('GEMINI_API_KEY')) {
    providers.push({
      slug: 'gemini',
      name: 'Google Gemini',
      defaultModel: 'gemini-2.0-flash',
      models: ['gemini-2.0-flash'],
    })
  }
  if (has('REPLICATE_API_TOKEN') || has('REPLICATE_API_KEY')) {
    providers.push({
      slug: 'replicate',
      name: 'Replicate',
      defaultModel: 'black-forest-labs/flux-schnell',
      models: ['black-forest-labs/flux-schnell'],
    })
  }
  if (has('HUGGINGFACE_API_KEY') || has('HF_TOKEN') || has('HUGGING_FACE_HUB_TOKEN')) {
    providers.push({
      slug: 'huggingface',
      name: 'Hugging Face',
      defaultModel: 'mistralai/Mistral-7B-Instruct-v0.2',
      models: ['mistralai/Mistral-7B-Instruct-v0.2'],
    })
  }

  return NextResponse.json({ providers })
}
