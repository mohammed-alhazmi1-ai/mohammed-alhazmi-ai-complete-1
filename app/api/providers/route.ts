import { NextResponse } from 'next/server';
import { listAvailableProviders } from '@/lib/ai/router';

export async function GET() {
  try {
    const providers = await listAvailableProviders('text');
    return NextResponse.json({ providers });
  } catch (e: any) {
    return NextResponse.json({
      providers: [
        ...(process.env.GEMINI_API_KEY
          ? [{ slug: 'gemini', name: 'Google Gemini', defaultModel: 'gemini-2.0-flash', models: [] }]
          : []),
        ...(process.env.OPENAI_API_KEY
          ? [{ slug: 'openai', name: 'OpenAI', defaultModel: 'gpt-4o-mini', models: [] }]
          : []),
      ],
    });
  }
}
