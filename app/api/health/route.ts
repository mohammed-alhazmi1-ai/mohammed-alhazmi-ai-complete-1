import { NextResponse } from 'next/server';

export async function GET() {
  const hasGemini = !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());
  const hasOpenAI = !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim());
  const hasDb = !!(process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost'));
  const hasSupabase = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  return NextResponse.json({
    ok: (hasGemini || hasOpenAI) && hasDb && hasSupabase,
    generateReady: hasGemini || hasOpenAI,
    providers: { gemini: hasGemini, openai: hasOpenAI },
    checks: {
      GEMINI_API_KEY: hasGemini ? 'ready' : 'missing',
      OPENAI_API_KEY: hasOpenAI ? 'ready' : 'missing',
      DATABASE_URL: hasDb ? 'ready' : 'missing',
      SUPABASE: hasSupabase ? 'ready' : 'missing',
    },
  });
}
