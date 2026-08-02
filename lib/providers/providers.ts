export const AI_PROVIDERS = [
  { slug: 'openai', name: 'OpenAI', category: 'text', models: ['gpt-4o', 'gpt-3.5-turbo'] },
  { slug: 'gemini', name: 'Google Gemini', category: 'text', models: ['gemini-1.5-pro', 'gemini-1.5-flash'] },
  { slug: 'claude', name: 'Anthropic Claude', category: 'text', models: ['claude-3-5-sonnet'] },
  { slug: 'grok', name: 'xAI Grok', category: 'text', models: ['grok-beta'] },
  { slug: 'mistral', name: 'Mistral', category: 'text', models: ['mistral-large'] },
  { slug: 'deepseek', name: 'DeepSeek', category: 'text', models: ['deepseek-chat'] },
  { slug: 'replicate', name: 'Replicate', category: 'image', models: [] },
  { slug: 'stability', name: 'Stability AI', category: 'image', models: [] },
  { slug: 'fal', name: 'Fal.ai', category: 'image', models: [] },
  { slug: 'runway', name: 'Runway', category: 'video', models: [] },
  { slug: 'pika', name: 'Pika', category: 'video', models: [] },
  { slug: 'elevenlabs', name: 'ElevenLabs', category: 'audio', models: [] },
  { slug: 'suno', name: 'Suno', category: 'audio', models: [] },
] as const;

export type ProviderSlug = (typeof AI_PROVIDERS)[number]['slug'];
